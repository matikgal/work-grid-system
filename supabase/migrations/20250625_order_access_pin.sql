-- Kod PIN do publicznych linków zamówień
-- Uruchom w Supabase SQL Editor (produkcja) przed deployem nowej wersji aplikacji.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS access_pin TEXT;

UPDATE orders
SET access_pin = LPAD((FLOOR(RANDOM() * 900000) + 100000)::text, 6, '0')
WHERE access_pin IS NULL OR access_pin = '';

CREATE OR REPLACE FUNCTION public.get_public_order(p_order_id uuid, p_pin text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF NOT FOUND
    OR v_order.access_pin IS NULL
    OR v_order.access_pin = ''
    OR v_order.access_pin <> p_pin THEN
    RAISE EXCEPTION 'invalid_order_access';
  END IF;

  RETURN json_build_object(
    'id', v_order.id,
    'name', v_order.name,
    'is_locked', v_order.is_locked,
    'created_at', v_order.created_at,
    'updated_at', v_order.updated_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_order_items(p_order_id uuid, p_pin text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = p_order_id
      AND o.access_pin IS NOT NULL
      AND o.access_pin <> ''
      AND o.access_pin = p_pin
  ) THEN
    RAISE EXCEPTION 'invalid_order_access';
  END IF;

  RETURN COALESCE((
    SELECT json_agg(row_to_json(t) ORDER BY t.created_at)
    FROM (
      SELECT
        i.id,
        i.order_id,
        i.name,
        i.created_at,
        i.updated_at,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', sr.id,
            'item_id', sr.item_id,
            'shop_id', sr.shop_id,
            'value', sr.value,
            'created_at', sr.created_at,
            'updated_at', sr.updated_at
          ))
          FROM shop_responses sr
          WHERE sr.item_id = i.id
        ), '[]'::json) AS shop_responses
      FROM items i
      WHERE i.order_id = p_order_id
    ) t
  ), '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_public_shop_response(
  p_order_id uuid,
  p_pin text,
  p_item_id uuid,
  p_shop_id text,
  p_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locked boolean;
BEGIN
  SELECT o.is_locked INTO v_locked
  FROM orders o
  INNER JOIN items i ON i.order_id = o.id
  WHERE o.id = p_order_id
    AND i.id = p_item_id
    AND o.access_pin IS NOT NULL
    AND o.access_pin <> ''
    AND o.access_pin = p_pin;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_order_access';
  END IF;

  IF v_locked THEN
    RAISE EXCEPTION 'order_locked';
  END IF;

  INSERT INTO shop_responses (item_id, shop_id, value)
  VALUES (p_item_id, p_shop_id, p_value)
  ON CONFLICT (item_id, shop_id)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_order(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_order_items(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_public_shop_response(uuid, text, uuid, text, text) TO anon, authenticated;
