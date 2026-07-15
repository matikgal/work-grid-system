# FRESHMARKET SCHEDULER - DOKUMENTACJA KOMPLETNA
# Czesc 1: Istniejacy system

---

## STOS TECHNOLOGICZNY

### Frontend
- React 19 + TypeScript (strict)
- Vite 6 (bundler, dev server)
- TailwindCSS (stylowanie)
- React Router DOM v7 (routing)
- TanStack Query v5 (cache, fetching, mutacje)
- Zod v4 (walidacja schematow)
- @dnd-kit (drag and drop)
- date-fns v4 (operacje na datach)
- date-holidays (polskie swieta ustawowe)
- lucide-react + @phosphor-icons (ikony)
- sonner (toasty/powiadomienia UI)

### Backend
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Supabase JS SDK v2

### Hosting
- GitHub Pages (frontend)
- Supabase Free Tier (backend)

---

## BAZA DANYCH - WSZYSTKIE TABELE

### Tabela: employees
```sql
CREATE TABLE employees (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT '',
  avatar_color  TEXT,
  order_index   INTEGER,
  is_separator  BOOLEAN DEFAULT false,
  row_color     TEXT,           -- 'blue' | 'red' | 'green' | ''
  is_visible_in_schedule  BOOLEAN DEFAULT true,
  is_visible_in_vacations BOOLEAN DEFAULT true,
  phone         TEXT DEFAULT '',
  is_archived   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: shifts
```sql
CREATE TABLE shifts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,       -- format: 'YYYY-MM-DD'
  start_time  TEXT NOT NULL,       -- format: 'HH:MM'
  end_time    TEXT NOT NULL,       -- format: 'HH:MM'
  duration    NUMERIC NOT NULL,    -- liczba godzin (np. 8.0)
  type        TEXT,                -- etykieta szablonu np. '6-14'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: vacation_balances
```sql
CREATE TABLE vacation_balances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  days          INTEGER DEFAULT 26,   -- limit dni urlopowych
  is_highlighted BOOLEAN DEFAULT false,
  manual_days   INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0], -- korekty per miesiac
  UNIQUE(employee_id, year)
);
```

### Tabela: saturday_adjustments
```sql
CREATE TABLE saturday_adjustments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL,  -- 1-12
  value       INTEGER DEFAULT 0, -- 0 = nie pracowal, 1 = pracowal
  UNIQUE(employee_id, year, month)
);
```

### Tabela: monthly_configs
```sql
CREATE TABLE monthly_configs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  month_key    TEXT NOT NULL,   -- format: 'YYYY-MM'
  working_days INTEGER,
  UNIQUE(user_id, month_key)
);
```

### Tabele zamowien
```sql
CREATE TABLE orders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  is_locked  BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_responses (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id  UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  shop_id  TEXT NOT NULL,    -- '1' az '13' (numer sklepu)
  value    TEXT NOT NULL,    -- ilosc wpisana przez sklep
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, shop_id)
);
```

---

## ARCHITEKTURA KODU

```
src/
  pages/         - pelne widoki (routy)
  components/
    features/    - komponenty domenowe (schedule, orders, vacations...)
    layout/      - MainLayout, nawigacja
    shared/      - wspolne komponenty (Modal, CalendarGrid...)
  hooks/         - logika z useXxx
  services/      - CRUD Supabase
  types/         - TypeScript interfaces + Zod schemas
  context/       - AppContext (viewMode, darkMode, userName)
  lib/           - klient supabase
  constants.ts   - SHIFT_TYPES, SHIFT_TEMPLATES, ROLES
  utils.ts       - pomocnicze funkcje
```

### Serwisy (src/services/)
- `employeeService` - getAll, create, update, updateOrder, archive, restore, hardDelete
- `shiftService` - getByDateRange, save, saveMultiple, delete
- `vacationService` - getBalances, upsertBalance
- `adjustmentService` - getByYear, upsert (wolne soboty)
- `configService` - getMonthlyConfig, saveMonthlyConfig
- `orderService` - getOrders, getOrder, createOrder, deleteOrder, updateStatus, getItems, addItem, deleteItem, updateItemName, upsertShopResponse

### Hooki (src/hooks/)
- `useEmployees(session)` - stan listy pracownikow, metody CRUD
- `useShifts(employees, currentDate)` - zmiany z zakresu dat
- `useVacations(userId, year, employeeIds)` - salda urlopowe
- `useFreeSaturdays(userId, year, employees)` - wolne soboty
- `useMonthlyConfigs(session)` - dni robocze per miesiac
- `useOrders / useCreateOrder / useDeleteOrder / useUpdateOrderStatus` - TanStack Query
- `useMobile()` - breakpoint hook

---

## TYPY TYPESCRIPT

```typescript
// src/types.ts
interface Employee {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  orderIndex?: number;
  isSeparator?: boolean;
  rowColor?: string;             // 'blue' | 'red' | 'green' | ''
  isVisibleInSchedule?: boolean;
  isVisibleInVacations?: boolean;
  phone?: string;
  isArchived?: boolean;
}

interface Shift {
  id: string;
  employeeId: string;
  date: string;       // 'YYYY-MM-DD'
  startTime: string;  // 'HH:MM'
  endTime: string;    // 'HH:MM'
  duration: number;   // godziny
  type?: string;      // etykieta szablonu
}

interface ShiftTemplate {
  id: string;
  label: string;
  displayLabel?: string;
  startTime: string;
  endTime: string;
  colorClass: string;
  type: 'work' | 'vacation' | 'dayoff' | 'holiday' | 'sick';
}

type ViewMode = 'week' | 'month';
```

---

## STALE I KONFIGURACJA

### Typy zmian (SHIFT_TYPES)
```
'6-14'        - zmiana poranna 06:00-14:00
'14-22'       - zmiana popoludniowa 14:00-22:00
'9-17'        - zmiana 09:00-17:00
'10-18'       - biuro 10:00-18:00
'8'           - zmiana 08:00-16:00
'WS'          - wolna sobota (zielona)
'WS-NZ'       - wolna sobota na zadanie (czerwona)
'Urlop'       - urlop wypoczynkowy
'Wolna Sobota'
'Swieto'
'Szkola'
'L4'          - zwolnienie lekarskie
'Chorobowe'
```

### Role pracownikow (ROLES)
```
Brak, Kierownik, Kasa, Mieso, Mieso/Kasa,
Pieczywo, Pieczywo/Kasa, Warzywa, Sprzataczka, Inne (custom)
```

---

## OPIS MODULOW - CO ISTNIEJE

### 1. Dashboard (/)
- Zegar live (aktualizacja co sekunde)
- Aktualna data po polsku
- Widget pogodowy (Open-Meteo API, wspolrzedne Bielsko-Biala)
  - temperatura, ikona pogody, predkosc wiatru, opis
  - skeleton loading, obsluga bledu
- Siatka kafelkow nawigacyjnych (8 kafelkow)
- Hover animacje, ikony tla

### 2. Grafik Zmian (/schedule)
- Widok miesiac i tydzien (przelacznik)
- Nawigacja poprzedni/nastepny miesiac lub tydzien
- Przycisk "Dzisiaj"
- Szablony zmian (paski na gorze) - aktywacja kliknieciem lub klawiszem 1-9
- Klikniecie komurki gdy szablon aktywny = przypisanie bez modalu
- Klikniecie komurki bez szablonu = otwarcie modalu
- Modal edycji zmiany: wybor godzin start/koniec, typ, zapis, usuniecie
- Zbiorcze przypisanie zmiany dla wszystkich (klikniecie naglowka dnia + szablon) z potwierdzeniem
- Tryb kompaktowy (mniejsze wiersze)
- Zoom (0.7x - 1.3x)
- Drukowanie raportu (PDF przez window.print)
- Wykrywanie polskich swiat (date-holidays) - podswietlenie kolumn
- Reczna korekta dni roboczych w miesiacu
- Drag & drop kolejnosci pracownikow (CalendarGrid)
- Licznik godzin per pracownik w naglowku wiersza
- Widok mobilny (MobileDayView) - przewijanie po dniach
- Skroty klawiaturowe: 1-9 aktywuje szablon, Escape kasuje

### 3. Pracownicy (/employees)
- Lista wszystkich pracownikow z avatarami (inicjaly + kolor)
- Wyszukiwarka (imie lub rola)
- Przelacznik Aktywni / Archiwum
- Drag & drop kolejnosci listy
- Licznik godzin miesiecznych per pracownik
- Flagi kolorowe (niebieski, czerwony, zielony)
- Slide-out drawer (panel boczny) do dodawania/edycji:
  - Imie + Nazwisko (opcjonalne)
  - Wybor roli (siatka ikon) + pole custom
  - Kolor flagowy
  - Widocznosc w Grafiku (checkbox)
  - Widocznosc w Urlopach (checkbox)
  - Separatory grupowe (linia oddzielajaca w liscie)
- Archiwizacja (soft delete) - zachowuje historie
- Przywracanie z archiwum
- Twarde usuniecie (z archiwum)
- Toast powiadomienia o bledach/sukcesach

### 4. Urlopy (/vacations)
- Roczna tabela 12 miesiecy x wszyscy pracownicy
- Limit dni urlopowych per pracownik (edytowalny)
- Auto-liczenie dni z grafiku (typ 'Urlop' w shifts)
- Reczne korekty per miesiac (np. przeniesione z poprzedniego roku)
- Suma roczna na koncu wiersza
- Wyroznienie pracownikow (highlight wiersza)
- Tryb blokady edycji (domyslnie zablokowane)
- Przelacznik roku
- Widok mobilny (pionowa lista) i desktopowy (tabela)

### 5. Zamowienia (/orders)
- Lista zamowien kierownika
- Tworzenie zamowienia (nazwa + Enter lub przycisk)
- Karta zamowienia: nazwa, status wypelnienia (X/Y sklepow), link publiczny
- Blokowanie/odblokowanie zamowienia (kierownik)
- Kopiowanie publicznego linku do schowka
- Usuniecie zamowienia z potwierdzeniem

- Edycja zamowienia (/orders/:id):
  - Tabela produktow x 13 sklepow (kolumny)
  - Dodawanie produktow
  - Edycja nazwy produktu (inline, po blur zapisuje)
  - Usuniecie produktu z potwierdzeniem
  - Kopiowanie tabeli jako HTML (do wklejenia w Outlook/Excel)
  - Drukowanie tabeli A4

- Widok publiczny dla sklepu (/order/:id?shop=N):
  - Bez logowania
  - Sklep widzi tylko swoja kolumne
  - Wpisuje ilosci przy produktach
  - Zapis automatyczny (upsert)
  - Blokada gdy kierownik zamknal zamowienie

### 6. Wolne Soboty (/free-saturdays)
- Roczna tabela 12 miesiecy x pracownicy
- Zaznaczanie czy pracownik pracowal dana sobote
- Tryb blokady edycji
- Przelacznik roku
- Widok mobilny i desktopowy

### 7. Telefony (/phones)
- Lista pracownikow posortowana alfabetycznie
- Edytowalne numery telefonow (inline)
- Tryb blokady edycji
- Drukowanie ksiazki telefonicznej

### 8. Ustawienia (/settings)
- Konfiguracja aplikacji

### 9. Logowanie (/login)
- Email + haslo (Supabase Auth)
- Persystencja sesji

---

## ROUTING

```
/               -> DashboardPage
/schedule       -> SchedulePage
/employees      -> EmployeesPage
/vacations      -> VacationsPage
/orders         -> OrdersPage
/orders/:id     -> AdminOrderPage
/order/:id      -> PublicOrderPage (bez auth)
/free-saturdays -> FreeSaturdaysPage
/phones         -> PhonesPage
/settings       -> SettingsPage
/login          -> LoginPage
```

---

## BEZPIECZENSTWO (RLS)

Aktualny stan: Row Level Security powinno byc wlaczone na wszystkich tabelach.
Polityka: user widzi tylko swoje dane (WHERE user_id = auth.uid()).
Tabela shop_responses: publiczny dostep do zapisu (sklepy bez logowania).

**UWAGA: Przed sprzedaza nalezy zweryfikowac i naprawic wszystkie polityki RLS w Supabase.**

---
*Patrz czesc 2: plan rozbudowy i co dodac*
