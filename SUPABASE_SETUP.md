# Konfiguracja Bazy Danych Supabase

Aby nowa funkcja "Notatnik Urlopowy" (wpisywanie zaległych/innych dni urlopowych) działała poprawnie, musisz utworzyć nową tabelę w swojej bazie danych Supabase.

Wejdź do panelu Supabase -> SQL Editor i uruchom poniższy kod:

```sql
-- Tabela do przechowywania bilansu/notatek urlopowych (np. zaległe dni)
create table if not exists vacation_balances (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid not null, -- references employees(id) if employees table exists, usually yes but keeping loose for safety
  year integer not null,
  user_id uuid not null references auth.users(id),
  days integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(employee_id, year)
);

-- Zabezpieczenia (Row Level Security)
alter table vacation_balances enable row level security;

-- Polityki dostępu (tylko zalogowany użytkownik widzi i edytuje swoje wpisy)
create policy "Users can view their own data" on vacation_balances
  for select using (auth.uid() = user_id);

create policy "Users can insert their own data" on vacation_balances
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own data" on vacation_balances
  for update using (auth.uid() = user_id);
```

Po wykonaniu tego kodu, nowa funkcja będzie w pełni aktywna.
