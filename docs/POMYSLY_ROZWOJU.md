# Pomysły na rozwój — Work Grid System

Lista propozycji rozbudowy: ulepszenia istniejących stron, nowe funkcje oraz
nowe zakładki. Pogrupowane wg obszaru, z orientacyjną oceną nakładu pracy
(S = małe, M = średnie, L = duże) i wartości dla użytkownika.

---

## 1. Ulepszenia istniejących stron

### Grafik (Schedule)
- **Kopiowanie grafiku z poprzedniego tygodnia/miesiąca** — przycisk „Skopiuj z
  poprzedniego" zamiast wpisywania od zera. (M)
- **Szablony tygodnia** — zapis nazwanych układów zmian i wczytywanie ich jednym
  kliknięciem. (M)
- **Walidacja / ostrzeżenia** — podświetlenie, gdy ktoś ma za mało/za dużo godzin,
  dwie zmiany jednego dnia, zmiana w trakcie urlopu, brak obsady w danym dniu. (M)
- **Suma godzin tygodniowa**, nie tylko miesięczna; cel godzin per pracownik. (S)
- **Eksport grafiku do PDF/obrazka** do druku i wywieszenia. (M)
- **Tryb „tylko mój grafik"** dla pracownika — filtr po osobie. (S)
- **Historia zmian grafiku** (kto, kiedy, co zmienił) — wykorzystać istniejący
  `auditService`. (M)
- **Drag-to-fill: też czyszczenie** — przeciąganie z wybranym „pustym" szablonem
  do masowego kasowania. (S)

### Urlopy (Vacations)
- **Workflow akceptacji** — pracownik składa wniosek, kierownik zatwierdza/odrzuca,
  statusy (oczekuje / zatwierdzony / odrzucony). (L)
- **Pula dni urlopowych** — limit roczny per osoba + licznik wykorzystanych/pozostałych. (M)
- **Wykrywanie kolizji** — ostrzeżenie, gdy zbyt wielu pracowników na urlopie w tym
  samym czasie. (M)
- **Widok kalendarza rocznego** zamiast/obok listy. (M)
- **Integracja z grafikiem** — urlop automatycznie blokuje wpisywanie zmian. (M)

### Zamówienia (Orders)
- **Szablony zamówień** — powtarzalne listy produktów (np. „nabiał") do ponownego użycia. (M)
- **Terminy / deadline** — data zamknięcia zamówienia + auto-blokada po terminie. (S)
- **Podsumowanie zbiorcze** — suma zapotrzebowania ze wszystkich sklepów (eksport do
  dostawcy). (M)
- **Powiadomienie o brakujących odpowiedziach** — które sklepy jeszcze nie uzupełniły. (S)
- **Duplikowanie zamówienia** jednym kliknięciem. (S)
- **Historia / archiwum zamówień** (wykorzystać istniejący soft-delete). (S)

### Telefony (Phones)
- **Klik-do-połączenia / SMS** (`tel:` / `sms:`) na mobile. (S)
- **Grupy / działy** i filtrowanie po nich. (S)
- **vCard / eksport kontaktów** do telefonu. (M)
- **Kopiuj numer** jednym kliknięciem. (S)

### Wolne soboty (Free Saturdays)
- **Auto-rotacja** — system proponuje sprawiedliwy podział wolnych sobót. (M)
- **Statystyki** — kto ile wolnych sobót miał w roku. (S)
- **Eksport / druk**. (S)

### Czat (Chat)
- **Wskaźnik nieprzeczytanych** per kanał + odznaki. (M)
- **Wzmianki @osoba** i powiadomienia. (M)
- **Załączniki / zdjęcia** (Supabase Storage). (L)
- **Edycja / usuwanie własnych wiadomości**, reakcje emoji. (M)
- **Wyszukiwarka w historii czatu**. (S)

### Pracownicy (Employees)
- **Karta pracownika** — szczegóły, stanowisko, data zatrudnienia, kontakt, zdjęcie. (M)
- **Statusy** (aktywny / nieaktywny / na urlopie) widoczne wszędzie. (S)
- **Zdjęcia/awatary** zamiast inicjałów (Supabase Storage). (M)

### Pulpit (Dashboard)
- **Konfigurowalne kafelki** — użytkownik wybiera, co widzi. (L)
- **Mini-wykresy** — obłożenie w czasie, trend godzin. (M)
- **Skróty „szybkich akcji"** (dodaj zmianę, nowy urlop) wprost z pulpitu. (S)

### Ustawienia (Settings)
- **Eksport/Import pełnej konfiguracji** (już jest backup — rozszerzyć o import). (M)
- **Zarządzanie kontami / role** (admin, kierownik, pracownik). (L)

---

## 2. Nowe funkcje przekrojowe (cross-cutting)

- **Role i uprawnienia** — admin / kierownik / pracownik z różnym dostępem do zakładek
  i edycji. Fundament pod wiele powyższych. (L)
- **Powiadomienia push (PWA)** — nowa wiadomość, zatwierdzony urlop, deadline
  zamówienia. (L)
- **Powiadomienia e-mail** (Supabase Edge Functions) — podsumowania, przypomnienia. (L)
- **Globalna wyszukiwarka** (Ctrl/Cmd+K) — szybki skok do osoby, zamówienia, strony. (M)
- **Tryb offline** — odczyt danych bez sieci (service worker już jest, dołożyć cache
  danych). (M)
- **Log audytu jako widok** — `auditService` już zapisuje; brakuje ekranu przeglądania. (M)
- **Wielojęzyczność (i18n)** — na razie PL na sztywno; przygotować strukturę. (M)
- **Skróty klawiszowe** w grafiku i na listach. (S)
- **Lepsza dostępność (a11y)** — focus, ARIA, kontrast w trybie ciemnym. (M)

---

## 3. Nowe zakładki / podstrony

- **Raporty i statystyki** — godziny, koszty pracy, obłożenie, urlopy w wykresach;
  eksport. (L)
- **Kalendarz zespołu** — jeden widok łączący zmiany, urlopy, wolne soboty, święta. (L)
- **Sieć sklepów** (obecnie wyłączona) — dokończyć: mapa z pinezkami, dane sklepów,
  kierownicy, godziny otwarcia. (M)
- **Zadania / To-do** — proste zadania per sklep/osoba ze statusem. (M)
- **Ogłoszenia / tablica** — komunikaty od zarządu widoczne na pulpicie. (M)
- **Dokumenty** — współdzielone pliki (regulaminy, instrukcje) w Supabase Storage. (M)
- **Onboarding / checklisty** — listy zadań przy wdrożeniu nowego pracownika. (M)

---

## 4. Techniczne / jakościowe

- **Code-splitting** — bundle ma ~2,5 MB; podzielić `exceljs` i ciężkie widoki przez
  `import()` dynamiczny. (M)
- **Testy** — pokrycie kluczowej logiki (grafik, zamówienia) Vitestem. (M)
- **Migracje DB w repo** — wersjonowane SQL zamiast „uruchom migrację Fazy 3 ręcznie". (M)
- **Kolumny w bazie sklepów** — `phone`, `opening_hours`, `latitude`, `longitude` (pod
  pełną Sieć sklepów). (S)
- **Monitoring błędów** (np. Sentry) — łapanie błędów u użytkowników. (S)

---

> Priorytet sugerowany na start: **role/uprawnienia** (odblokowują wiele rzeczy) →
> **workflow urlopów** → **kopiowanie/szablony grafiku** → **raporty**.
