# FRESHMARKET SCHEDULER - DOKUMENTACJA KOMPLETNA
# Czesc 2: Co dorobić - plan rozbudowy

---

## NOWE TABELE BAZY DANYCH DO DODANIA

### Tabela: stores (sklepy w sieci)
```sql
CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  number     INTEGER NOT NULL,      -- numer sklepu 1-14
  name       TEXT,                  -- nazwa np. "Sklep Centrum"
  address    TEXT,
  manager_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: messages (czat)
```sql
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID NOT NULL REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  content     TEXT NOT NULL,
  channel     TEXT NOT NULL DEFAULT 'ogolny',
  -- kanaly: 'ogolny', 'zamowienia', 'grafik', 'pilne'
  store_id    TEXT,   -- null = wiadomosc do wszystkich sklepow
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: kazdy zalogowany moze czytac i pisac
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
```

### Tabela: notifications
```sql
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  type       TEXT NOT NULL,
  -- typy: 'new_message', 'order_filled', 'vacation_request', 'shift_conflict'
  title      TEXT NOT NULL,
  body       TEXT,
  is_read    BOOLEAN DEFAULT false,
  link       TEXT,        -- sciezka do przekierowania np. '/orders/xxx'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: vacation_requests (wnioski urlopowe)
```sql
CREATE TABLE vacation_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  date_from    TEXT NOT NULL,   -- 'YYYY-MM-DD'
  date_to      TEXT NOT NULL,
  days_count   INTEGER NOT NULL,
  reason       TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  -- statusy: 'pending', 'approved', 'rejected'
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: audit_logs (historia zmian)
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  -- akcje: 'shift_create', 'shift_delete', 'employee_archive', itd.
  target_table TEXT,
  target_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## NOWE MODULY DO ZBUDOWANIA

---

### MODUL 1: PWA (Progressive Web App)
**Czas: 2-4h | Wzrost ceny: +200-400 PLN**

**Co robi:**
Aplikacja instalowalna z przegladarki jak natywna apka. Ikona na pulpicie, dziala bez paska przegladarki.

**Co dodac:**
```
public/
  manifest.json     - nazwa, ikony, kolory
  icons/            - ikony 192x192 i 512x512

vite.config.ts - dodac plugin VitePWA
```

**Instalacja:**
```bash
npm install vite-plugin-pwa
```

**manifest.json:**
```json
{
  "name": "Freshmarket Scheduler",
  "short_name": "FMScheduler",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

### MODUL 2: Czat miedzy sklepami (/chat)
**Czas: 10-16h | Wzrost ceny: +800-1500 PLN**

**Co robi:**
Czat realtime miedzy kierownikami. Kanaly tematyczne. Wiadomosci synchronizuja sie na zywo bez odswiezania.

**Nowe pliki:**
```
src/pages/ChatPage.tsx
src/hooks/useMessages.ts
src/services/messageService.ts
src/components/features/chat/
  ChatChannelList.tsx   - lista kanalow (Ogolny, Zamowienia, Grafik, Pilne)
  ChatMessageList.tsx   - lista wiadomosci z auto-scroll
  ChatInput.tsx         - pole wpisywania + przycisk wyslij
  ChatMessage.tsx       - pojedyncza wiadomosc (awatar, imie, tresc, czas)
```

**Hook useMessages.ts - logika Realtime:**
```typescript
import { supabase } from '../lib/supabase';

export function useMessages(channel: string) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Pobierz ostatnie 50 wiadomosci
    supabase.from('messages')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => setMessages((data || []).reverse()));

    // Subskrybuj nowe wiadomosci w czasie rzeczywistym
    const sub = supabase
      .channel(`chat-${channel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel=eq.${channel}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [channel]);

  const sendMessage = async (content: string, senderName: string, senderId: string) => {
    await supabase.from('messages').insert({
      content,
      channel,
      sender_id: senderId,
      sender_name: senderName
    });
  };

  return { messages, sendMessage };
}
```

**Wymagania Supabase:**
- Realtime musi byc wlaczony dla tabeli `messages`
- W Supabase Dashboard: Database -> Replication -> dodac tabele messages
- Supabase Free obsluguje Realtime (do 200 polaczen jednoczesnych)

---

### MODUL 3: Panel Centrali (/admin)
**Czas: 20-30h | Wzrost ceny: +1500-3000 PLN**

**Co robi:**
Oddzielna rola "Admin" widzi wszystkich 14 sklepow jednoczesnie. Zbiorczy przeglad grafikow, zamowien, urlopow.

**Nowe pliki:**
```
src/pages/AdminDashboardPage.tsx
src/components/features/admin/
  StoreOverview.tsx       - karta jednego sklepu
  AllStoresSchedule.tsx   - grafik wszystkich sklepow
  OrdersSummary.tsx       - zestawienie zamowien
```

**Wymagana zmiana w bazie:**
```sql
-- Kolumna roli w profilu uzytkownika
ALTER TABLE auth.users ADD COLUMN role TEXT DEFAULT 'manager';
-- LUB lepiej: osobna tabela profiles
CREATE TABLE profiles (
  id    UUID PRIMARY KEY REFERENCES auth.users(id),
  role  TEXT NOT NULL DEFAULT 'manager', -- 'manager' | 'admin'
  store_id INTEGER  -- numer sklepu
);
```

**Logika dostępu:**
```typescript
// Sprawdzenie roli po zalogowaniu
const { data: profile } = await supabase
  .from('profiles')
  .select('role, store_id')
  .eq('id', session.user.id)
  .single();

if (profile.role === 'admin') {
  // Przekieruj do AdminDashboard
}
```

---

### MODUL 4: Eksport do Excel
**Czas: 4-8h | Wzrost ceny: +400-800 PLN**

**Co robi:**
Generuje plik .xlsx z grafikiem, lista godzin lub urlopami.

**Instalacja:**
```bash
npm install exceljs
```

**Gdzie dodac przyciski eksportu:**
- SchedulePage -> "Eksportuj do Excel" obok "Drukuj"
- VacationsPage -> "Eksportuj CSV"
- EmployeesPage -> "Eksportuj liste pracownikow"

**Przykladowy kod eksportu grafiku:**
```typescript
import ExcelJS from 'exceljs';

export async function exportScheduleToExcel(employees, shifts, month) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Grafik');

  // Naglowki
  sheet.addRow(['Pracownik', ...daysInMonth.map(d => format(d, 'dd.MM'))]);

  // Dane
  employees.forEach(emp => {
    const row = [emp.name];
    daysInMonth.forEach(day => {
      const shift = shifts.find(s =>
        s.employeeId === emp.id && s.date === format(day, 'yyyy-MM-dd')
      );
      row.push(shift?.type || '');
    });
    sheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grafik-${format(month, 'yyyy-MM')}.xlsx`;
  a.click();
}
```

---

### MODUL 5: Wnioski urlopowe
**Czas: 12-20h | Wzrost ceny: +1000-2000 PLN**

**Co robi:**
Pracownik (przez specjalny link lub odrebne konto) sklada wniosek o urlop z datami. Kierownik akceptuje lub odrzuca. System automatycznie dodaje urlop do grafiku po akceptacji.

**Nowe pliki:**
```
src/pages/VacationRequestsPage.tsx  - lista wnioskow dla kierownika
src/pages/PublicVacationRequestPage.tsx  - formularz dla pracownika
src/hooks/useVacationRequests.ts
src/services/vacationRequestService.ts
src/components/features/vacation-requests/
  RequestCard.tsx      - karta wniosku z przyciskami Akceptuj/Odrzuc
  RequestForm.tsx      - formularz dla pracownika
```

**Flow:**
```
1. Kierownik generuje link dla pracownika (/request-vacation?emp=UUID)
2. Pracownik wypelnia formularz (data od, data do, powod)
3. Wniosek laduje w tabeli vacation_requests ze statusem 'pending'
4. Kierownik widzi badge z liczba oczekujacych wnioskow
5. Akceptacja -> automatyczny zapis zmian 'Urlop' w tabeli shifts
6. Odrzucenie -> powiadomienie
```

---

### MODUL 6: Powiadomienia
**Czas: 6-10h | Wzrost ceny: +500-800 PLN**

**Co robi:**
Dzwonek w nawigacji z liczba nieprzeczytanych. Kliknięcie otwiera panel z lista powiadomien.

**Gdzie generowac powiadomienia:**
- Nowy wniosek urlopowy -> powiadomienie dla kierownika
- Sklep wyslal odpowiedz w zamowieniu -> powiadomienie
- Nowa wiadomosc na czacie -> badge na ikonie czatu

**Nowe pliki:**
```
src/hooks/useNotifications.ts
src/services/notificationService.ts
src/components/shared/NotificationBell.tsx   - ikona z badgem
src/components/shared/NotificationPanel.tsx  - slide-out lista
```

**Hook useNotifications:**
```typescript
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Pobierz nieprzeczytane
    supabase.from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []));

    // Realtime dla nowych
    const sub = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [userId]);

  const markAsRead = (id: string) =>
    supabase.from('notifications').update({ is_read: true }).eq('id', id);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, unreadCount, markAsRead };
}
```

---

### MODUL 7: Historia zmian (Audit Log)
**Czas: 4-6h | Wzrost ceny: +300-500 PLN**

**Co robi:**
Rejestruje kto i kiedy zrobil co w systemie. Widoczne w Ustawieniach.

**Gdzie dodac logowanie:**
W kazdym serwisie po udanej operacji:
```typescript
// Przyklad w shiftService po zapisie zmiany
await auditService.log({
  userId,
  action: 'shift_create',
  targetTable: 'shifts',
  targetId: savedShift.id,
  newValue: savedShift
});
```

**Nowe pliki:**
```
src/services/auditService.ts
src/components/features/settings/AuditLogPanel.tsx
```

---

### MODUL 8: Ostrzezenia w grafiku
**Czas: 6-10h | Wzrost ceny: +400-700 PLN**

**Co robi:**
Podswietla problemy w grafiku:
- Pracownik 7+ dni z rzędu bez dnia wolnego
- Miesiac przekroczony limit godzin
- Dzien bez obsadzenia (za malo pracownikow)

**Implementacja:**
Czysta logika w `utils.ts` - funkcja `detectScheduleConflicts(employees, shifts, month)` zwraca liste ostrzezen. Wyrenderowane jako badge/tooltip na kalendarzu.

---

## SUPABASE - CO POTRZEBNE

### Free Tier (aktualny) - wystarczy do:
- Testow i prototypu
- Do 50 000 wierszy lacznie
- 500 MB storage
- 2 projekty
- Realtime (200 polaczen)
- Auth (do 50 000 uzytkownikow miesiecznie)

### Supabase Pro (25 USD/mies. = ~100 PLN/mies.) - potrzebne gdy:
- Siec 14 sklepow produkuje dane przez rok (shifts, messages)
- Potrzebny automatyczny backup (codziennie)
- Potrzeba wiecej niz 500 MB danych
- Wiecej niz 2 projekty (np. oddzielny projekt testowy)

**Rekomendacja:** Przejdz na Pro po podpisaniu umowy. Koszt przenies na klienta jako "utrzymanie infrastruktury 100 PLN/mies."

### Funkcje Supabase ktore uzyc:
```
Auth          - logowanie (juz uzywasz)
Database      - PostgreSQL (juz uzywasz)
Realtime      - czat + powiadomienia (NOWE)
Row Level Security - bezpieczenstwo (sprawdz/napraw)
Storage       - do przechowywania plikow (opcjonalne, np. zalaczniki w czacie)
Edge Functions - do wysylania email (zamiast zewnetrznego API)
```

---

## WYMAGANE BIBLIOTEKI NPM - CO DOINSTALOWAC

```bash
# Eksport do Excel
npm install exceljs

# PWA
npm install -D vite-plugin-pwa

# Edytor tekstu sformatowanego (opcjonalne, dla czatu)
npm install @tiptap/react @tiptap/starter-kit

# Wykresy (opcjonalne, dla panelu centrali)
npm install recharts
```

---

## KOLEJNOSC IMPLEMENTACJI (rekomendowana)

```
SPRINT 1 - przed sprzedaza (1-2 dni):
  [x] Naprawic RLS policies w Supabase
  [x] Dodac PWA manifest + ikony
  [x] Przetestowac caly system z danymi produkcyjnymi

SPRINT 2 - wersja 1.0 dla klienta (po umowie):
  [ ] Dostosowanie liczby sklepow (aktualnie hardcoded 13 - zmienic na konfigurowalne)
  [ ] Import istniejacych pracownikow (CSV lub reczny)
  [ ] Konfiguracja Supabase Pro dla klienta
  [ ] Szkolenie (2h online)

SPRINT 3 - wersja 1.1 (negocjuj osobno ~1500 PLN):
  [ ] Czat miedzy sklepami
  [ ] Eksport do Excel
  [ ] Powiadomienia (badge + panel)

SPRINT 4 - wersja 2.0 (negocjuj osobno ~3000 PLN):
  [ ] Panel centrali
  [ ] Wnioski urlopowe z workflow
  [ ] Audit log
  [ ] Ostrzezenia w grafiku
```

---

## RZECZY DO NAPRAWIENIA PRZED SPRZEDAZA

### 1. Hardcoded liczba sklepow
W AdminOrderPage.tsx linia 77:
```typescript
const shops = Array.from({ length: 13 }, (_, i) => i + 1);
// Zmienic na: konfigurowalna wartosc z Settings lub tabeli stores
```

### 2. Hardcoded wspolrzedne pogody
W DashboardPage.tsx linia 63:
```
latitude=49.8225&longitude=19.0444  <- Bielsko-Biala
```
Zmienic na konfigurowalne w Ustawieniach.

### 3. Brak obslugi wielu uzytkownikow per siec
Aktualnie kazdy uzytkownik ma oddzielone dane przez user_id.
Dla sieci 14 sklepow: wszyscy kierownicy powinni widziec tych samych pracownikow.
Rozwiazanie: dodac kolumne `organization_id` do wszystkich tabel, lub uzywac wspolnego konta kierownika sieci.

### 4. Brak walidacji RLS dla shop_responses
Sklep moze podpisac odpowiedz jako inny sklep (brak weryfikacji shop_id).

---

## PODSUMOWANIE WYCENY PO ROZBUDOWIE

| Wersja | Funkcje | Cena sprzedazy |
|---|---|---|
| Aktualna (v1.0) | 7 modulow, grafik, urlopy, zamowienia | 3500-4500 PLN |
| + PWA + Excel | Instalowalna, eksport | 4000-5500 PLN |
| + Czat + Powiadomienia | Komunikacja realtime | 5500-7000 PLN |
| + Panel Centrali + Wnioski | Pelne enterprise | 8000-12000 PLN |

**Utrzymanie (miesiecznie): 200-400 PLN + 100 PLN Supabase Pro**
