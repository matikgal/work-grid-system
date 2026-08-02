-- Kod EAN na wierszach oferty + RPC publiczne
ALTER TABLE quote_rows ADD COLUMN IF NOT EXISTS ean TEXT NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.get_public_quote(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_col quote_columns%ROWTYPE;
  v_quote quotes%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) < 8 THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  SELECT * INTO v_col FROM quote_columns WHERE access_token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  SELECT * INTO v_quote FROM quotes WHERE id = v_col.quote_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  RETURN json_build_object(
    'quote', json_build_object(
      'id', v_quote.id,
      'name', v_quote.name,
      'is_locked', v_quote.is_locked,
      'created_at', v_quote.created_at,
      'updated_at', v_quote.updated_at
    ),
    'column', json_build_object(
      'id', v_col.id,
      'name', v_col.name
    ),
    'rows', COALESCE((
      SELECT json_agg(json_build_object(
        'id', r.id,
        'name', r.name,
        'ean', COALESCE(r.ean, ''),
        'sort_order', r.sort_order,
        'value', COALESCE(c.value, '')
      ) ORDER BY r.sort_order, r.created_at)
      FROM quote_rows r
      LEFT JOIN quote_cells c
        ON c.row_id = r.id AND c.column_id = v_col.id
      WHERE r.quote_id = v_quote.id
    ), '[]'::json)
  );
END;
$$;
