import React from 'react';
import {
  Info,
  LayoutDashboard,
  CalendarDays,
  Palmtree,
  Coffee,
  ShoppingCart,
  Phone,
  UsersRound,
  Building2,
  MessageSquare,
  Settings,
  Lightbulb,
  MousePointerClick,
  Keyboard,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
  Link as LinkIcon,
  Copy,
  Clock,
  CloudSun,
  GripVertical,
  Archive,
  Eye,
  Palette,
  Database,
  Bell,
  ScrollText,
  CalendarRange,
  CheckSquare,
  Hash,
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import {
  InstructionSection,
  InstructionItem,
  InstructionLead,
} from '../components/features/instructions/InstructionUI';
import '../components/dashboard/dashboard-modern.css';

const TOC = [
  { id: 'intro', label: 'Wprowadzenie' },
  { id: 'pulpit', label: 'Pulpit' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'urlopy', label: 'Urlopy' },
  { id: 'wolne-soboty', label: 'Wolne soboty' },
  { id: 'zamowienia', label: 'Zamówienia' },
  { id: 'telefony', label: 'Telefony' },
  { id: 'pracownicy', label: 'Pracownicy' },
  { id: 'siec', label: 'Sieć' },
  { id: 'czat', label: 'Czat' },
  { id: 'ustawienia', label: 'Ustawienia' },
  { id: 'wskazowki', label: 'Wskazówki' },
];

export const InstructionsPage: React.FC = () => {
  return (
    <MainLayout pageTitle="Instrukcja">
      <div className="dash-modern">
        <DashboardBackground />
        <div className="dash-scroll relative z-10 min-h-0 w-full flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-4xl flex-col p-4 md:p-6">
            {/* Page Header */}
            <header className="mb-6 shrink-0">
              <h1 className="text-3xl font-semibold tracking-tight">
                <span className="dash-gradient-text">Instrukcja</span>
              </h1>
              <p className="mt-1 text-sm text-indigo-950/55 dark:text-indigo-100/60">
                Kompletny przewodnik po systemie Work Grid — wszystkie moduły i funkcje.
              </p>

              {/* Spis treści */}
              <nav className="mt-4 flex flex-wrap gap-2" aria-label="Spis treści">
                {TOC.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="rounded-full border border-white/55 bg-white/55 px-3 py-1.5 text-xs font-medium text-indigo-950/65 backdrop-blur-xl transition-colors hover:bg-white hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/65 dark:hover:text-indigo-300"
                  >
                    {t.label}
                  </a>
                ))}
              </nav>
            </header>

            <div className="w-full space-y-10 pb-4">
              {/* WPROWADZENIE */}
              <InstructionSection id="intro" icon={Info} title="Wprowadzenie" accent="#6366f1">
                <InstructionLead>
                  Work Grid to wewnętrzny panel dla kierowników sieci sklepów spożywczych. Łączy w
                  jednym miejscu układanie grafiku zmian, rozliczanie urlopów i wolnych sobót, książkę
                  telefoniczną, zamówienia towaru oraz komunikację między sklepami. Konta zakłada
                  administrator firmy, a każdy kierownik widzi i edytuje wyłącznie własne dane.
                </InstructionLead>
                <InstructionLead>
                  Skorzystaj ze spisu treści powyżej, aby przejść do konkretnego modułu. Większość
                  tabel ma <strong>tryb edycji</strong> chroniony „kłódką" — odblokuj go, gdy chcesz
                  wprowadzać zmiany, i zablokuj po zakończeniu, aby uniknąć przypadkowych poprawek.
                </InstructionLead>
              </InstructionSection>

              {/* PULPIT */}
              <InstructionSection id="pulpit" icon={LayoutDashboard} title="Pulpit" accent="#10b981">
                <InstructionLead>
                  Strona startowa z najważniejszymi informacjami na dziś, dostępna od razu po
                  zalogowaniu.
                </InstructionLead>
                <InstructionItem icon={Clock} title="Powitanie, zegar i pogoda" accent="#10b981">
                  Na górze znajdziesz powitanie zależne od pory dnia, datę, żywy zegar oraz aktualną
                  pogodę dla wybranej lokalizacji sklepu (zmienisz ją w Ustawieniach).
                </InstructionItem>
                <InstructionItem icon={CloudSun} title="Karty podsumowania" accent="#10b981">
                  Cztery klikalne kafelki: liczba osób w pracy dziś, nieobecni (urlop · L4 · WS),
                  obłożenie względem normy oraz nieprzeczytane wiadomości. Klik prowadzi do
                  odpowiedniego modułu.
                </InstructionItem>
                <InstructionItem icon={CalendarDays} title="Dziś w grafiku i szybki dostęp" accent="#10b981">
                  Lista osób na zmianie z godzinami, sekcja nieobecnych oraz siatka „Szybki dostęp" z
                  kafelkami do wszystkich modułów.
                </InstructionItem>
              </InstructionSection>

              {/* GRAFIK */}
              <InstructionSection id="grafik" icon={CalendarDays} title="Grafik zmian" accent="#3b82f6">
                <InstructionItem icon={MousePointerClick} title="Dodawanie i edycja zmian" accent="#3b82f6">
                  Kliknij komórkę w siatce, aby otworzyć okno wyboru typu zmiany i godzin. Przełączasz
                  się między widokiem tygodniowym a miesięcznym, a kolumnę „Suma" pokazuje łączne
                  godziny i obłożenie dnia.
                </InstructionItem>
                <InstructionItem icon={Keyboard} title="Szybkie nakładanie (skróty 1–0)" accent="#3b82f6">
                  Wybierz szablon zmiany z górnego paska albo użyj skrótów klawiszowych{' '}
                  <strong>1–0</strong>, a następnie klikaj komórki, by błyskawicznie wstawiać tę samą
                  zmianę. Typy: praca (6–14, 14–22, 10–18, 9–17, 8h), Urlop, L4/Chorobowe, Szkoła,
                  Wolna Sobota (WS), WS na żądanie (NŻ), Święto.
                </InstructionItem>
                <InstructionItem icon={AlertTriangle} title="Wykrywanie konfliktów" accent="#3b82f6">
                  System ostrzega o nakładających się godzinach i niespójnościach, a dni świąteczne są
                  oznaczane automatycznie.
                </InstructionItem>
                <InstructionItem icon={Printer} title="Wydruk i eksport" accent="#3b82f6">
                  Przycisk drukarki otwiera podgląd zoptymalizowany pod A4. Grafik możesz też
                  wyeksportować do pliku Excel.
                </InstructionItem>
              </InstructionSection>

              {/* URLOPY */}
              <InstructionSection id="urlopy" icon={Palmtree} title="Urlopy" accent="#f59e0b">
                <InstructionLead>
                  Roczne rozliczenie urlopów: tabela pracownik × miesiące, z przyklejonym nagłówkiem i
                  kolumną „Pracownik" podczas przewijania. Rok zmieniasz strzałkami u góry.
                </InstructionLead>
                <InstructionItem icon={CalendarRange} title="Dni z grafiku + ręczne" accent="#f59e0b">
                  Urlopy wpisane w grafiku liczą się automatycznie (oznaczone „+X z grafiku"). W każdej
                  komórce możesz dodać dni ręcznie, a w kolumnie „Zaległe" wpisać dni przeniesione z
                  poprzedniego roku.
                </InstructionItem>
                <InstructionItem icon={CheckSquare} title="Saldo i wyróżnianie" accent="#f59e0b">
                  Kolumna „Suma" pokazuje pozostałe dni — zielono, gdy jest nadwyżka, bursztynowo, gdy
                  zostały dni do wykorzystania. Pracownika możesz wyróżnić, klikając jego awatar (ikona
                  palmy).
                </InstructionItem>
                <InstructionItem icon={FileSpreadsheet} title="Eksport" accent="#f59e0b">
                  Całe zestawienie wyeksportujesz przyciskiem „Excel". Edycję włącza/wyłącza kłódka.
                </InstructionItem>
              </InstructionSection>

              {/* WOLNE SOBOTY */}
              <InstructionSection id="wolne-soboty" icon={Coffee} title="Wolne soboty" accent="#14b8a6">
                <InstructionLead>
                  Roczne rozliczenie odbioru wolnych sobót dla każdego pracownika.
                </InstructionLead>
                <InstructionItem icon={CalendarRange} title="Kolumny z datami" accent="#14b8a6">
                  Po odblokowaniu edycji dodajesz do czterech kolumn dat (przycisk „+") i wpisujesz w
                  nich konkretne dni odbioru. Całą kolumnę usuniesz ikoną kosza w jej nagłówku.
                </InstructionItem>
                <InstructionItem icon={CheckSquare} title="Zaznaczanie komórek" accent="#14b8a6">
                  Pojedyncze komórki możesz oznaczyć (podświetlenie bursztynowe), np. by wyróżnić
                  rozliczone soboty. Przewijanie zachowuje nagłówek i kolumnę z nazwiskami.
                </InstructionItem>
              </InstructionSection>

              {/* ZAMÓWIENIA */}
              <InstructionSection id="zamowienia" icon={ShoppingCart} title="Zamówienia towaru" accent="#f97316">
                <InstructionItem icon={MousePointerClick} title="Tworzenie i struktura" accent="#f97316">
                  Wpisz nazwę (np. „nabiał 28.02") i kliknij „Utwórz". Wchodząc w edycję (ikona ołówka),
                  budujesz listę produktów — dodajesz i usuwasz wiersze oraz zmieniasz ich nazwy.
                </InstructionItem>
                <InstructionItem icon={LinkIcon} title="Link publiczny dla sklepów" accent="#f97316">
                  Każde zamówienie ma publiczny link („Kopiuj link" / „Otwórz"). Sklepy wchodzą bez
                  logowania i wpisują swoje ilości w kolumnach S.1…S.N — zmiany zapisują się
                  automatycznie, a Ty widzisz postęp („Uzupełniono X/Y").
                </InstructionItem>
                <InstructionItem icon={Lock} title="Blokowanie i zakończenie" accent="#f97316">
                  Kłódka blokuje zamówienie (oznaczone jako „ZAKOŃCZONE") — sklepy nie mogą już
                  edytować danych.
                </InstructionItem>
                <InstructionItem icon={Copy} title="Kopiowanie i wydruk" accent="#f97316">
                  W edycji skopiujesz gotową tabelę do schowka (wklejasz do Outlooka/Excela) lub
                  wydrukujesz zestawienie A4.
                </InstructionItem>
              </InstructionSection>

              {/* TELEFONY */}
              <InstructionSection id="telefony" icon={Phone} title="Telefony" accent="#ec4899">
                <InstructionLead>
                  Książka telefoniczna zespołu, posortowana po nazwisku.
                </InstructionLead>
                <InstructionItem icon={Phone} title="Edycja numerów" accent="#ec4899">
                  Po odblokowaniu edycji wpisujesz numer w polu obok pracownika — zapis następuje
                  automatycznie (kółko ładowania, a po zapisie zielony „ptaszek").
                </InstructionItem>
                <InstructionItem icon={Printer} title="Wydruk" accent="#ec4899">
                  Przycisk „Drukuj" przygotowuje czytelną listę kontaktów do druku.
                </InstructionItem>
              </InstructionSection>

              {/* PRACOWNICY */}
              <InstructionSection id="pracownicy" icon={UsersRound} title="Pracownicy" accent="#8b5cf6">
                <InstructionItem icon={MousePointerClick} title="Dodawanie i edycja" accent="#8b5cf6">
                  Przycisk „Dodaj" otwiera panel po prawej. Klik w wiersz (zębatka po prawej)
                  otwiera edycję: imię i nazwisko, dział/stanowisko (lub własna nazwa), kolor flagowy
                  oraz dostęp do modułów.
                </InstructionItem>
                <InstructionItem icon={GripVertical} title="Kolejność i separatory" accent="#8b5cf6">
                  Pracowników przeciągasz za uchwyt — wyłącznie w pionie, dla zachowania porządku.
                  „Separator" zamienia wiersz w nagłówek grupy na grafiku (np. Kasa, Mięso).
                </InstructionItem>
                <InstructionItem icon={Eye} title="Widoczność i awatary" accent="#8b5cf6">
                  Każdego pracownika możesz ukryć w wybranym module (Grafik/Wolne soboty oraz Urlopy).
                  Awatar to spójny, automatyczny kolor przypisany do osoby — ta sama osoba ma ten sam
                  kolor we wszystkich widokach.
                </InstructionItem>
                <InstructionItem icon={Archive} title="Archiwum (miękkie usuwanie)" accent="#8b5cf6">
                  Zamiast trwale kasować, pracownika <strong>archiwizujesz</strong> — znika z nowych
                  grafików, ale jego historia zostaje. Archiwum przeglądasz przyciskiem „Archiwum" i w
                  każdej chwili możesz osobę przywrócić.
                </InstructionItem>
              </InstructionSection>

              {/* SIEĆ */}
              <InstructionSection id="siec" icon={Building2} title="Sieć sklepów" accent="#6366f1">
                <InstructionItem icon={Building2} title="Dane sklepów" accent="#6366f1">
                  Panel administracyjny całej sieci — dla każdego sklepu (S.1…S.N) ustawiasz nazwę,
                  adres i kierownika. Przycisk zapisu pojawia się po zmianie danych. Te informacje
                  wykorzystują m.in. zamówienia i pogoda.
                </InstructionItem>
              </InstructionSection>

              {/* CZAT */}
              <InstructionSection id="czat" icon={MessageSquare} title="Czat" accent="#0ea5e9">
                <InstructionItem icon={MessageSquare} title="Kanały i wiadomości" accent="#0ea5e9">
                  Komunikacja między sklepami w kanałach „Ogólny", „Kierownicy" i „Logistyka".
                  Wiadomości pojawiają się na żywo, a licznik nieprzeczytanych widać na Pulpicie.
                </InstructionItem>
                <InstructionItem icon={Hash} title="Filtr sklepu" accent="#0ea5e9">
                  Wiadomości możesz przypisać/filtrować po konkretnym sklepie, aby łatwiej śledzić
                  ustalenia w obrębie sieci.
                </InstructionItem>
              </InstructionSection>

              {/* USTAWIENIA */}
              <InstructionSection id="ustawienia" icon={Settings} title="Ustawienia" accent="#64748b">
                <InstructionItem icon={UsersRound} title="Profil" accent="#64748b">
                  Zmieniasz nazwę wyświetlaną oraz awatar (pięć gotowych stylów). Imię pojawia się na
                  Pulpicie i w górnym pasku.
                </InstructionItem>
                <InstructionItem icon={Palette} title="Wygląd i kalendarz" accent="#64748b">
                  Motyw jasny / ciemny / systemowy, tryb kompaktowy tabel, domyślny widok grafiku
                  (tydzień/miesiąc) oraz pokazywanie weekendów. Wybierasz też lokalizację pogody i sklep.
                </InstructionItem>
                <InstructionItem icon={Database} title="Import i kopie zapasowe" accent="#64748b">
                  Import pracowników z pliku CSV/JSON, eksport listy kadry do Excela oraz pełna kopia
                  zapasowa danych (JSON) — zalecane regularne pobieranie.
                </InstructionItem>
                <InstructionItem icon={Bell} title="Powiadomienia i dziennik" accent="#64748b">
                  Podgląd powiadomień w aplikacji oraz „Dziennik zdarzeń" z ostatnimi operacjami w
                  systemie (zapisy grafiku, wnioski, zmiany sklepów, importy).
                </InstructionItem>
              </InstructionSection>

              {/* WSKAZÓWKI */}
              <InstructionSection id="wskazowki" icon={Lightbulb} title="Wskazówki" accent="#f43f5e">
                <InstructionItem icon={Lock} title="Tryb edycji (kłódka)" accent="#f43f5e">
                  W Urlopach, Wolnych sobotach i Telefonach edycja jest domyślnie zablokowana. Odblokuj
                  ją tylko na czas wprowadzania zmian — ograniczysz ryzyko przypadkowych poprawek.
                </InstructionItem>
                <InstructionItem icon={Database} title="Rób kopie zapasowe" accent="#f43f5e">
                  Przed większymi zmianami pobierz kopię zapasową w Ustawieniach — łatwo wrócisz do
                  poprzedniego stanu.
                </InstructionItem>
                <InstructionItem icon={ScrollText} title="Twoje dane są prywatne" accent="#f43f5e">
                  Każdy kierownik widzi wyłącznie własnych pracowników, grafiki i zamówienia. Publiczne
                  linki zamówień są jedynym wyjątkiem — udostępniaj je rozważnie.
                </InstructionItem>
              </InstructionSection>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    </MainLayout>
  );
};
