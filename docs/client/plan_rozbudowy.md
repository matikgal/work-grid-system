# Plan rozbudowy: od MVP do premium systemu dla sieci sklepów

---

## 1. Web App vs Desktop App - decyzja strategiczna

### Opcja A: Electron (web -> desktop)
Electron "owija" Twoją obecną aplikację React w okno desktopowe.

**Plusy:**
- Minimalna zmiana kodu - dosłownie kilka plików konfiguracyjnych
- Działa offline (częściowo - zależy od danych)
- Instalator .exe - "wygląda poważniej" dla klienta

**Minusy:**
- Plik instalacyjny: 150-300 MB (React + Chromium w środku)
- Aktualizacje musisz rozsyłać ręcznie lub przez electron-updater
- Supabase i tak wymaga internetu - offline nie ma sensu
- **Klient musi instalować na 14 komputerach** = koszmar supportu
- Nie działa na telefonach

### Opcja B: Tauri (lżejszy desktop)
Podobnie jak Electron, ale mniejszy plik (5-10 MB).

**Minusy identyczne jak Electron + trudniejszy setup.**

### Opcja C: PWA (Progressive Web App) - REKOMENDACJA
Aplikacja webowa instalowalna z przeglądarki jak natywna apka.

**Plusy:**
- Zero zmian w architekturze - 2-3h pracy
- Działa na Windows, Mac, Android, iOS
- Aktualizuje się automatycznie (online)
- Ikon na pulpicie jak natywna apka
- Działa po dodaniu do paska zadań

**Jak zrobić PWA:**
```
1. Dodać manifest.json (nazwa, ikona, kolor)
2. Dodać service worker (Vite PWA plugin)
3. Gotowe
```

---

### WERDYKT: Nie rób desktop app.

**Dlaczego:**
System wymaga internetu (Supabase), więc offline desktop nic nie daje.  
PWA daje "efekt aplikacji" bez kosztów utrzymania.  
Dla sieci sklepów: kierownicy używają różnych urządzeń - web jest lepszy.  
Desktop = 14 instalacji + aktualizacje + IT support klienta.

---

## 2. Baza danych - zostać przy Supabase czy zmienić?

### Aktualne: Supabase (PostgreSQL + Auth + Realtime)

**Zostań przy Supabase. Powody:**

| Kryterium | Supabase | Firebase | własny PostgreSQL |
|---|---|---|---|
| Koszt (14 sklepów) | 0-25 USD/mies. | 0-50 USD/mies. | 50-150 USD/mies. (serwer VPS) |
| Czas migracji | 0h | 40-80h przepisania kodu | 20-40h |
| Auth (logowanie) | wbudowane | wbudowane | musisz pisać sam |
| Realtime (czat) | wbudowane | wbudowane | musisz pisać sam |
| Backup automatyczny | Pro tier | tak | musisz konfigurować |
| Row Level Security | tak | nie (inna logika) | musisz pisać sam |

**Jedyna zmiana którą powinieneś zrobić:**  
Przejść z Free na **Supabase Pro (25 USD/mies.)** gdy klient podpisze umowę.  
Free tier: 500MB storage, 50k rows, 2 projekty  
Pro tier: 8GB storage, nieograniczone rows, daily backup

**Koszt Pro przenieś na klienta** jako pozycja "utrzymanie infrastruktury: 100 PLN/mies."

---

## 3. Czat między sklepami - architektura

Supabase ma **Realtime** - websockety out-of-the-box. Nie trzeba nic instalować.

### Jak to działa technicznie:

```typescript
// supabase/migrations/add_messages.sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  sender_id uuid references auth.users(id),
  sender_name text not null,
  shop_id text,           -- null = wiadomość do wszystkich
  channel text not null,  -- 'ogolny', 'zamowienia', 'grafik'
  created_at timestamptz default now()
);

// Realtime subscription w React:
supabase
  .channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
    (payload) => addMessage(payload.new))
  .subscribe();
```

### Zakres czatu który warto zbudować:

**Wersja podstawowa (4-8h pracy):**
- Kanał ogólny (wszyscy widzą)
- Wysyłanie wiadomości tekstowych
- Lista ostatnich 50 wiadomości
- Powiadomienie (badge) gdy nowe wiadomości

**Wersja rozszerzona (+8-12h):**
- Kanały tematyczne (Zamówienia, Grafik, Pilne)
- Wiadomości per sklep (kierownik -> konkretny sklep)
- Oznaczanie wiadomości jako "przeczytane"
- Powiadomienia push (wymaga PWA + service worker)

---

## 4. Funkcje podnoszące cenę - lista priorytety

### Priorytet WYSOKI - duży wpływ na cenę, relatywnie łatwe

#### A. System powiadomień push (+500-800 PLN do ceny)
Kierownik otrzymuje powiadomienie gdy:
- Sklep wypełni zamówienie
- Pracownik prosi o urlop
- Nowa wiadomość na czacie

**Tech:** PWA Service Worker + Supabase Realtime + Web Push API

---

#### B. Moduł raportów i eksportu (+500-1000 PLN)
- Eksport grafiku do Excel (.xlsx) - biblioteka `xlsx` lub `exceljs`
- Eksport listy pracowników do PDF
- Miesięczny raport godzin per pracownik
- Roczne podsumowanie urlopów jako CSV

**Dlaczego wartościowe:** Kierownicy i tak to robią ręcznie w Excelu. Automatyzacja = oszczędność czasu.

---

#### C. Panel administracyjny dla centrali (+1000-2000 PLN)
Oddzielna rola "Admin/Centrala" która widzi:
- Grafiki WSZYSTKICH 14 sklepów jednocześnie
- Zbiorcze zestawienie zamówień
- Porównanie obsadzenia między sklepami
- Statystyki urlopowe dla całej sieci

**To jest feature enterprise.** Jedna osoba z centrali widzi cały obraz.

---

#### D. Historia zmian / Audit log (+300-500 PLN)
Kto i kiedy zmienił grafik, dodał pracownika, zatwierdził urlop.  
Tabela `audit_logs` z polami: user, action, target_id, timestamp, old_value, new_value.

---

### Priorytet ŚREDNI - dobre dla wersji v2

#### E. Wnioski urlopowe z workflow (+800-1500 PLN)
Pracownik (osobne konto lub link) składa wniosek urlopowy.  
Kierownik akceptuje/odrzuca w aplikacji.  
System automatycznie odjmuje dni z puli.

**Aktualnie:** Urlopy wpisywane ręcznie przez kierownika.  
**Po zmianie:** Samoobsługowy wniosek = oszczędność 30 min/tygodniowo na kierownika.

---

#### F. Dostępność pracownika / preferencje zmian (+400-600 PLN)
Pracownik zaznacza kiedy jest niedostępny (np. lekarz, szkoła).  
Grafik ostrzega kierownika przy próbie przypisania zmiany.

---

#### G. Konflikty i ostrzeżenia w grafiku (+300-500 PLN)
- Ostrzeżenie gdy pracownik ma 7 dni z rzędu
- Ostrzeżenie gdy przekroczone normy godzinowe
- Podświetlenie niedostatecznego obsadzenia dnia

---

#### H. Automatyczne generowanie grafiku (+1000-2000 PLN)
Na podstawie szablonów, dostępności i norm - wygeneruj proponowany grafik jednym kliknięciem. Kierownik tylko koryguje wyjątki.

**To jest bardzo pożądana funkcja** ale też najtrudniejsza technicznie (algorytm przydziału).

---

### Priorytet NISKI - "nice to have"

#### I. Ciemny/jasny motyw per użytkownik (już masz dark mode)
Upewnij się że preferencja zapisuje się w bazie, nie tylko localStorage.

#### J. Integracja z MS Teams / Slack
Powiadomienia z systemu jako wiadomość w Teams.  
Webhook: 1-2h pracy. Dla firm używających Teams = duży plus.

#### K. Aplikacja mobilna natywna
React Native z tym samym backendem Supabase.  
**Koszt:** 3-6 miesięcy pracy. Zdecydowanie nie teraz.

---

## 5. Ile nowe funkcje dodają do ceny

| Funkcja | Czas pracy | Wzrost ceny |
|---|---|---|
| PWA (instalowalna) | 2-4h | +200-400 PLN |
| Czat między sklepami | 8-16h | +800-1500 PLN |
| Powiadomienia push | 8-12h | +600-1000 PLN |
| Eksport Excel/PDF | 4-8h | +400-800 PLN |
| Panel centrali | 16-24h | +1500-3000 PLN |
| Wnioski urlopowe | 12-20h | +1000-2000 PLN |
| Audit log | 4-6h | +300-500 PLN |
| Konflikty/ostrzeżenia | 6-10h | +400-700 PLN |

**System z 3-4 z powyższych funkcji:** wycena wzrasta do **7 000 - 12 000 PLN**

---

## 6. Czego Ci jeszcze brakuje - umiejętności techniczne

### Już masz (na podstawie kodu):
- React, TypeScript, TailwindCSS - poziom dobry
- Supabase (CRUD, Auth, RLS) - poziom średni/dobry
- TanStack Query, Zod - tak
- Drag & drop, drukowanie - tak

### Czego się naucz pod ten projekt:

**1. Supabase Realtime** (1-2 dni nauki)  
Potrzebne do czatu. Dokumentacja jest dobra.

**2. Web Push API + Service Worker** (2-3 dni)  
Potrzebne do powiadomień push.

**3. `exceljs` lub `xlsx`** (kilka godzin)  
Potrzebne do eksportu do Excela.

**4. Row Level Security (RLS) głębiej** (2-3 dni)  
Musisz upewnić się że kierownik sklepu A nie widzi danych sklepu B.  
Aktualnie nie wiadomo czy to jest poprawnie skonfigurowane.

**5. Podstawy umów B2B** (1 dzień)  
Znajdź wzór prostej umowy o dzieło lub licencji oprogramowania dla małych firm.

---

## 7. Rekomendowana kolejność działań

```
Etap 1 (przed rozmową z klientem):
├── Dodaj PWA manifest + ikony (2-4h)
├── Sprawdź i napraw RLS w Supabase (bezpieczeństwo)
└── Przygotuj demo na żywo + lista funkcji jako PDF

Etap 2 (po podpisaniu umowy, wersja 1.0):
├── Dostosowanie do sieci klienta (nazwa, liczba sklepów, role)
├── Import istniejących pracowników
└── Szkolenie kierowników (2h spotkanie)

Etap 3 (wersja 1.1 - po 1 miesiącu używania):
├── Czat między sklepami
├── Eksport do Excel
└── Audit log

Etap 4 (wersja 2.0 - negocjuj osobno):
├── Panel administracyjny centrali
├── Wnioski urlopowe z workflow
└── Powiadomienia push
```

---

## 8. Podsumowanie strategiczne

**Nie rób desktop app.** Tracisz 2-4 tygodnie na Electron i nic na tym nie zyskujesz.

**Nie zmieniaj bazy danych.** Supabase jest dobry. Migracja = strata czasu.

**Rób PWA** - 4h pracy, duże wrażenie na kliencie.

**Priorytet 1 nowej funkcji: Czat + Panel Centrali** - to jest to czego sieć sklepów naprawdę potrzebuje i czego nie ma w obecnym systemie.

**Priorytet 2: Eksport Excel** - każdy kierownik tego chce, łatwe do zrobienia.

**Docelowa wycena po rozbudowie o etapy 1-3:** 8 000 - 12 000 PLN jednorazowo + 350 PLN/mies. utrzymanie.
