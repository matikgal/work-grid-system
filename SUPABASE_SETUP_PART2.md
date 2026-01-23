# Konfiguracja Bazy Danych Supabase - Czesc 2 (Zamówienia)

Aby włączyć funkcję Zamówień, uruchom ten kod SQL:

```sql
-- Tabela zamówień (nagłówki)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  name text not null,
  created_at timestamptz default now()
);

-- Tabela pozycji zamówienia (13 kolumn: 1 nazwa + 12 sklepów)
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references orders(id) on delete cascade,
  name text,
  shop_1 text,
  shop_2 text,
  shop_3 text,
  shop_4 text,
  shop_5 text,
  shop_6 text,
  shop_7 text,
  shop_8 text,
  shop_9 text,
  shop_10 text,
  shop_11 text,
  shop_12 text,
  created_at timestamptz default now()
);

-- RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- Właściciel widzi swoje
create policy "Users can manage their own orders" on orders
  for all using (auth.uid() = user_id);

create policy "Users can manage items of their own orders" on order_items
  for all using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

-- PUBLICZNY DOSTĘP (Anonimowy dostęp przez link)
create policy "Public read access to orders by ID" on orders
  for select using (true);

create policy "Public access to order items" on order_items
  for all using (true) with check (true);

-- Uprawnienia
grant select on orders to anon;
grant select, insert, update, delete on order_items to anon;
```
