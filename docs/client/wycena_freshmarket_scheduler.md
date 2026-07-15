# Wycena projektu: Freshmarket Scheduler

## 1. Co zostalo zbudowane - inwentaryzacja funkcji

### Modul glowny: Grafik Zmian (`SchedulePage`)
- Widok miesieczny i tygodniowy z nawigacja
- Przypisywanie zmian kliknieciem lub skrotami klawiaturowymi
- Szablony zmian (szybkie przypisanie jednym klawiszem)
- Zbiorcze przypisywanie zmian na caly dzien dla wszystkich pracownikow
- Tryb kompaktowy, zoom, drukowanie raportu (PDF)
- Wykrywanie polskich swiat ustawowych (`date-holidays`)
- Reczna korekta liczby dni roboczych
- Widok mobilny (MobileDayView)
- Drag & drop porzadku pracownikow

### Modul: Pracownicy (`EmployeesPage`)
- Pełna baza pracownikow z rolami i awatarami
- Drag & drop kolejnosci pracownikow
- Archiweryzacja (soft delete) z historia i przywracaniem
- Widocznosc per modul (Grafik / Urlopy)
- Separatory grup wizualnych
- Licznik godzin miesiecznych per pracownik
- Flagi kolorowe na wierszach

### Modul: Urlopy (`VacationsPage`)
- Roczna tabela urlopow dla wszystkich pracownikow
- Reczne limity urlopowe per pracownik per rok
- Reczne korekty dni
- Tryb blokady edycji
- Wyroznianie pracownikow
- Widok mobilny i desktopowy

### Modul: Zamowienia (`OrdersPage + AdminOrderPage + PublicOrderPage`)
- Tworzenie zamowien przez kierownika
- Publiczny link dla poszczegolnych sklepow (bez logowania)
- Blokowanie/odblokowanie zamowien
- Status wypelnienia (ile sklepow odpowiedzialo)
- Dedykowana strona publiczna dla sklepow

### Modul: Wolne Soboty (`FreeSaturdaysPage`)
- Rozliczenie wolnych sobot w roku

### Modul: Telefony (`PhonesPage`)
- Ksiazka kontaktowa dzialu / sklepow

### Modul: Ustawienia (`SettingsPage`)
- Konfiguracja aplikacji

### Dashboard (`DashboardPage`)
- Widget pogodowy (Open-Meteo API, lokalizacja Bielsko-Biala)
- Zegarek live, data
- Przyciski nawigacji do wszystkich modulow

### Infrastruktura techniczna
- Backend: **Supabase** (PostgreSQL, Auth, Row Level Security)
- Frontend: **React 19 + TypeScript + Vite**
- State: **TanStack Query** (caching, mutacje)
- Drag & drop: **@dnd-kit**
- Walidacja: **Zod**
- Wdrozenie: **GitHub Pages**
- Architektura: service layer, custom hooks, typowane schematy

---

## 2. Benchmarking rynkowy - co kosztuja podobne systemy

### Gotowe SaaS-owe systemy do grafikow dla sklepow (abonament miesięczny):
| System | Cena miesięczna (14 sklepów) | Uwagi |
|---|---|---|
| Planday | ~200-400 EUR/mies. | Duzy rynek europejski |
| HRnest (PL) | ~150-350 PLN/mies. per sklep = ~2100-4900 PLN/mies. | Popularny w PL, brak specjalizacji FMCG |
| Kadromierz (PL) | ~149-299 PLN/mies. per sklep = ~2100-4200 PLN/mies. | Dobry odpowiednik |
| Symfonix HR | ~3000-8000 PLN/mies. | Enterprise, integracje ERP |
| Customowa aplikacja | 15 000 - 80 000 PLN jednorazowo | Wycena agencji |

**Wniosek:** Rynek placi 2000-5000 PLN miesiecznie za system o podobnym zakresie dla sieci 14 sklepow.

---

## 3. Trzy modele sprzedazy - realne ceny

### Model A: Jednorazowa licencja + wdrozenie (REKOMENDOWANY dla Ciebie)

**Cena: 3 500 - 6 000 PLN**

Co wchodzi:
- Dostosowanie (logo firmy, kolory, lokalizacje sklepow)
- Konfiguracja Supabase pod ta konkretna siec
- Szkolenie kierownikow (1-2 spotkania online)
- 3 miesiace bezplatnego supportu po wdrozeniu
- Przekazanie kodu zrodlowego LUB hosting przez Ciebie

Struktura platnosci:
- 50% przed rozpoczeciem (1750-3000 PLN)
- 50% po wdrozeniu i odbiorze

**Dlaczego ta kwota jest uczciwa:**
Kadromierz bierze 2100 PLN/mies. za gorszy zakres. Firma odzyska koszt zakupu w ciagu 2 miesiecy oszczednosci na subskrypcji.

---

### Model B: SaaS / najem - miesięczna oplata

**Cena: 300 - 600 PLN / miesiac**

Co wchodzi:
- Hosting (Supabase free/pro: ~25-100 USD/mies.)
- Utrzymanie i drobne poprawki
- Aktualizacje

Przy 5-letnim uzyciu: 18 000 - 36 000 PLN lacznie. To uczciwy model jesli firma chce "nie kupowac, tylko korzystac."

Twoj realny dochod po odjeciu kosztow Supabase Pro: ok. 200-500 PLN netto/mies.

---

### Model C: Wdrozenie + utrzymanie (hybryda)

**Wdrozenie: 2 000 PLN + 250 PLN/mies.**

Najlatwiej sprzedac - niska bariera wejscia, staly przychod.

---

## 4. Realistyczna kwota dla pierwszego projektu

**Moja rekomendacja: 3 500 - 4 500 PLN jednorazowo + 200-300 PLN/mies. utrzymanie**

### Uzasadnienie:

**Co przemawia za wyzszą ceną:**
- System ma realny zakres (7 modulow, mobilny, baza danych, auth)
- Alternatywy kosztuja firme 2000+ PLN miesiecznie
- Dedykowany system = brak kompromisow funkcjonalnych
- Klient to firma z 14 sklepami = przychody sa realne

**Co obniza cene (byc z tym szczery):**
- To Twoj pierwszy komercyjny projekt
- Brak formalnej dokumentacji technicznej i gwarancji SLA
- Brak testow automatycznych (jest to ryzyko dla klienta)
- Aplikacja wdrozona na GitHub Pages (nie jest to enterprise hosting)
- Supabase free tier ma limity (50k wierszy, 500MB)

---

## 5. Co musisz przygotowac przed rozmowa z klientem

### Obowiazkowe:
1. **Demo na zywo** - wdrozona wersja do pokazania (masz ja na GitHub Pages)
2. **Cennik hostingu** - Supabase Pro: 25 USD/mies. = ~100 PLN/mies. (powiedz o tym klientowi wprost)
3. **Umowa** - nawet prosta, 1 strona:
   - zakres prac
   - prawa do kodu
   - wylaczyc odpowiedzialnosc za dane (RODO!)
   - termin supportu

### Wazne kwestie do ustalenia:
- Ile maksymalnie pracownikow bedzie w systemie? (Supabase free ma limity)
- Czy potrzebuja integracji z systemem kadrowym?
- Kto bedzie administratorem po stronie klienta?
- Czy aplikacja ma byc dostepna z zewnatrz (internet) czy tylko wewnatrz?

---

## 6. Ryzyka i jak je komunikowac

| Ryzyko | Jak komunikowac |
|---|---|
| Brak testow | "System jest stabilny w produkcji, testy sa roadmapem kolejnej wersji" |
| Brak SLA | "Oferuje support mailowy 48h w ramach pierwszych 3 miesiecy" |
| GitHub Pages | "Mozemy przeniesc na Vercel/Netlify jesli firma wymaga wlasnej domeny" |
| Supabase limity | "Przy obecnej skali sieci 14 sklepow free tier wystarczy na rok, Pro ~100 PLN/mies." |
| Brak RODO | "System przetwarza tylko dane pracownikow klienta, klient jest administratorem danych" |

---

## 7. Podsumowanie - bottom line

| Scenariusz | Cena | Kiedy wybrac |
|---|---|---|
| Minimum | 2 500 PLN | Jesli boisz sie, ze nie kupia - nie idz nizej |
| Realne | 3 500 - 4 500 PLN | Uczciwa wartosc za ten zakres |
| Z utrzymaniem | 2 000 PLN + 250/mies. | Najlatwiej przekonac klienta |
| Zbyt wysokie | 8 000+ PLN | Nieuzasadnione bez testow, docs, SLA |

**Absolutne minimum (ponizej ktorego nie schodzic): 2 000 PLN**

Jesli klient negocjuje ponizej tego - to nie jest dobry klient. System ma realna wartosc.

---

> Uwaga: To jest Twoj pierwszy projekt - nie deprecjonuj swojej pracy, ale badz tez transparentny co do ograniczen. Uczciwosc buduje dlugotrwale relacje biznesowe lepiej niz sprzedanie czegosc za wszelka cene.
