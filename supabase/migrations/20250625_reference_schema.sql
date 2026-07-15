-- Reference schema for Work Grid System (Freshmarket Scheduler)
-- Odzwierciedla stan produkcyjnej bazy na podstawie kodu aplikacji.
-- Uruchamiaj na NOWYM projekcie lub weryfikuj kolumny — nie DROP na produkcji bez backupu.

-- employees
CREATE TABLE IF NOT EXISTS employees (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT '',
  avatar_color  TEXT,
  order_index   INTEGER,
  is_separator  BOOLEAN DEFAULT false,
  row_color     TEXT,
  is_visible_in_schedule  BOOLEAN DEFAULT true,
  is_visible_in_vacations BOOLEAN DEFAULT true,
  phone         TEXT DEFAULT '',
  is_archived   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- shifts
CREATE TABLE IF NOT EXISTS shifts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  start_time  TEXT NOT NULL,
  end_time    TEXT NOT NULL,
  duration    NUMERIC NOT NULL,
  type        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- vacation_balances
CREATE TABLE IF NOT EXISTS vacation_balances (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year           INTEGER NOT NULL,
  days           INTEGER DEFAULT 26,
  is_highlighted BOOLEAN DEFAULT false,
  manual_days    INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0],
  UNIQUE(employee_id, year)
);

-- ws_adjustments (wolne soboty)
CREATE TABLE IF NOT EXISTS ws_adjustments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  adjustment    INTEGER DEFAULT 0,
  dates         TEXT[] DEFAULT '{}',
  marked_dates  INTEGER[] DEFAULT '{}',
  UNIQUE(employee_id, year)
);

-- monthly_configs
CREATE TABLE IF NOT EXISTS monthly_configs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key    TEXT NOT NULL,
  working_days INTEGER,
  UNIQUE(user_id, month_key)
);

-- orders (patrz też 20260226_new_structure.sql)
CREATE TABLE IF NOT EXISTS orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  is_locked  BOOLEAN DEFAULT false,
  access_pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shop_responses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  shop_id    TEXT NOT NULL,
  value      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, shop_id)
);
