# Audyt RLS — Work Grid System

> Do wykonania w Supabase Dashboard → Authentication → Policies  
> SQL Editor: wklej i dostosuj przed uruchomieniem na produkcji.

## Stan docelowy

| Tabela | Kto czyta | Kto zapisuje |
|--------|-----------|--------------|
| `employees`, `shifts`, `vacation_balances`, `ws_adjustments`, `monthly_configs`, `orders` | Tylko `auth.uid() = user_id` | Tylko właściciel |
| `items` | Właściciel zamówienia (przez `orders.user_id`) | Właściciel zamówienia |
| `shop_responses` | Właściciel zamówienia + anon (publiczny formularz sklepu) | Anon tylko gdy zamówienie **nie** zablokowane |

## Tabele użytkownika — wzorzec polityki

```sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_select_own" ON employees
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "employees_insert_own" ON employees
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "employees_update_own" ON employees
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "employees_delete_own" ON employees
  FOR DELETE TO authenticated USING (user_id = auth.uid());
```

Powtórz ten wzorzec dla: `shifts`, `vacation_balances`, `ws_adjustments`, `monthly_configs`, `orders`.

## items — dostęp przez zamówienie

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_select_via_order" ON items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "items_modify_via_order" ON items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = items.order_id
        AND orders.user_id = auth.uid()
    )
  );
```

## shop_responses — publiczny zapis dla sklepów

**Ryzyko:** anon może teoretycznie pisać do dowolnego `item_id`, jeśli polityka jest zbyt szeroka.

```sql
ALTER TABLE shop_responses ENABLE ROW LEVEL SECURITY;

-- Właściciel zamówienia — pełny dostęp
CREATE POLICY "shop_responses_owner" ON shop_responses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN orders ON orders.id = items.order_id
      WHERE items.id = shop_responses.item_id
        AND orders.user_id = auth.uid()
    )
  );

-- Anon — tylko odczyt + zapis gdy zamówienie odblokowane
CREATE POLICY "shop_responses_public_read" ON shop_responses
  FOR SELECT TO anon USING (true);

CREATE POLICY "shop_responses_public_upsert" ON shop_responses
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      JOIN orders ON orders.id = items.order_id
      WHERE items.id = shop_responses.item_id
        AND orders.is_locked = false
    )
  );

CREATE POLICY "shop_responses_public_update" ON shop_responses
  FOR UPDATE TO anon
  USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN orders ON orders.id = items.order_id
      WHERE items.id = shop_responses.item_id
        AND orders.is_locked = false
    )
  );
```

## Checklist weryfikacji (Supabase Dashboard)

- [ ] RLS włączone na wszystkich 8 tabelach
- [ ] Użytkownik A nie widzi danych użytkownika B (test na koncie demo vs produkcyjnym)
- [ ] Publiczny link `/order/:id` działa bez logowania
- [ ] Po zablokowaniu zamówienia (`is_locked = true`) sklep nie może edytować odpowiedzi
- [ ] Zalogowany właściciel nadal widzi i edytuje swoje zamówienia

## Uwagi

- Polityki powyżej mogą już częściowo istnieć — przed `CREATE POLICY` sprawdź istniejące nazwy.
- Przy konflikcie nazw użyj `DROP POLICY IF EXISTS "nazwa" ON tabela;` (ostrożnie na PROD).
- Pełny audyt wymaga dostępu do Supabase Dashboard — ten plik to checklist + SQL referencyjny.
