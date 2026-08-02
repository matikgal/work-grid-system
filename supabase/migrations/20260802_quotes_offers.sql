-- Oferty (zapytania ofertowe do hurtowni)
-- Token per kolumna — hurtownia widzi tylko swoje ceny.

CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  access_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_rows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  row_id UUID NOT NULL REFERENCES quote_rows(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES quote_columns(id) ON DELETE CASCADE,
  value TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (row_id, column_id)
);

CREATE INDEX IF NOT EXISTS quote_columns_quote_id_idx ON quote_columns(quote_id);
CREATE INDEX IF NOT EXISTS quote_rows_quote_id_idx ON quote_rows(quote_id);
CREATE INDEX IF NOT EXISTS quote_cells_column_id_idx ON quote_cells(column_id);
CREATE INDEX IF NOT EXISTS quote_cells_row_id_idx ON quote_cells(row_id);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_cells ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotes_owner_all" ON quotes;
CREATE POLICY "quotes_owner_all" ON quotes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "quote_columns_owner_all" ON quote_columns;
CREATE POLICY "quote_columns_owner_all" ON quote_columns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_columns.quote_id AND q.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_columns.quote_id AND q.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "quote_rows_owner_all" ON quote_rows;
CREATE POLICY "quote_rows_owner_all" ON quote_rows
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_rows.quote_id AND q.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes q
      WHERE q.id = quote_rows.quote_id AND q.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "quote_cells_owner_all" ON quote_cells;
CREATE POLICY "quote_cells_owner_all" ON quote_cells
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quote_rows r
      JOIN quotes q ON q.id = r.quote_id
      WHERE r.id = quote_cells.row_id AND q.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quote_rows r
      JOIN quotes q ON q.id = r.quote_id
      WHERE r.id = quote_cells.row_id AND q.user_id = auth.uid()
    )
  );

-- Publiczny odczyt oferty po tokenie kolumny (tylko ta kolumna)
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

-- Publiczny zapis ceny (tylko własna kolumna, gdy oferta otwarta)
CREATE OR REPLACE FUNCTION public.upsert_public_quote_cell(
  p_token text,
  p_row_id uuid,
  p_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_col quote_columns%ROWTYPE;
  v_locked boolean;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) < 8 THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  SELECT * INTO v_col FROM quote_columns WHERE access_token = p_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  SELECT q.is_locked INTO v_locked
  FROM quotes q
  WHERE q.id = v_col.quote_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  IF v_locked THEN
    RAISE EXCEPTION 'quote_locked';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM quote_rows r
    WHERE r.id = p_row_id AND r.quote_id = v_col.quote_id
  ) THEN
    RAISE EXCEPTION 'invalid_quote_access';
  END IF;

  INSERT INTO quote_cells (row_id, column_id, value)
  VALUES (p_row_id, v_col.id, COALESCE(p_value, ''))
  ON CONFLICT (row_id, column_id)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

  UPDATE quotes SET updated_at = NOW() WHERE id = v_col.quote_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_quote(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_public_quote_cell(text, uuid, text) TO anon, authenticated;

-- Realtime dla live sync u właściciela
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quote_columns;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quote_rows;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE quote_cells;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
