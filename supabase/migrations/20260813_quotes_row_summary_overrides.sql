-- Ręczne nadpisania podsumowania wiersza przez administratora.
-- Puste wartości pozostawiają automatyczne wyliczanie z cen hurtowni po stronie aplikacji.
ALTER TABLE quote_rows
  ADD COLUMN IF NOT EXISTS lowest_price TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS lowest_wholesaler TEXT NOT NULL DEFAULT '';
