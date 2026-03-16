export type ChangeTag = 'feat' | 'fix' | 'perf' | 'refactor' | 'security' | 'ui';

export interface ChangeEntry {
  tag: ChangeTag;
  text: string;
}

export interface ChangelogRelease {
  version: string;
  date: string;
  label?: string;
  changes: ChangeEntry[];
}

export const CHANGELOG: ChangelogRelease[] = [
  {
    version: '2.1.0',
    date: '06.03.2026',
    label: 'Najnowsza',
    changes: [
      { tag: 'fix', text: 'Pole nazwy produktu w edycji zamówienia wyświetla placeholder zamiast domyślnej wartości.' },
      { tag: 'ui', text: 'Wolne Soboty: usunięto kolumnę "Z grafiku", dane wpisywane ręcznie przez użytkownika.' },
      { tag: 'feat', text: 'Wolne Soboty: dodano kontroler +/− oraz bezpośredni input liczbowy.' },
      { tag: 'ui', text: 'Rozbudowano regulamin o sekcje RODO, bezpieczeństwo i kontakt.' },
    ],
  },
  {
    version: '2.0.0',
    date: '01.03.2026',
    changes: [
      { tag: 'ui', text: 'Pełne przepisanie strony logowania w stylu Anywhere App.' },
      { tag: 'refactor', text: 'Refaktoryzacja EmployeesManager do dedykowanej strony EmployeesPage.' },
    ],
  },
  {
    version: '1.9.0',
    date: '14.02.2026',
    changes: [
      { tag: 'ui', text: 'Ulepszony Dashboard i Ustawienia na urządzeniach mobilnych.' },
      { tag: 'feat', text: 'Dodano AppConfig i zaktualizowano modal O aplikacji.' },
      { tag: 'fix', text: 'Poprawiono obliczanie salda urlopowego.' },
      { tag: 'feat', text: 'Dodano trwałe podświetlanie urlopów.' },
    ],
  },
  {
    version: '1.8.0',
    date: '04.02.2026',
    changes: [
      { tag: 'feat', text: 'Dodano przycisk "Kopiuj tabelę" w AdminOrderPage.' },
      { tag: 'feat', text: 'Ulepszono blokowanie PublicOrderPage.' },
    ],
  },
  {
    version: '1.7.0',
    date: '24.01.2026',
    changes: [
      { tag: 'feat', text: 'Funkcja eksportu/importu danych JSON (kopia zapasowa).' },
      { tag: 'fix', text: 'Globalna nawigacja, refaktoryzacja AppContext, naprawa routingu SPA 404.' },
      { tag: 'feat', text: 'Zabezpieczenie blokady zamówień, ulepszony edytor administratora, toast notifications.' },
      { tag: 'feat', text: 'Nowa funkcja Zamówień z uproszczonym widokiem publicznym.' },
      { tag: 'feat', text: 'Nowa strona Urlopy.' },
    ],
  },
  {
    version: '1.6.0',
    date: '10.01.2026',
    changes: [
      { tag: 'feat', text: 'Kompletne separatory, kolory wierszy i ulepszenia nawigacji.' },
      { tag: 'perf', text: 'Refaktoryzacja drukowania: dynamiczne dopasowanie A4, obramowania zebra, marginesy.' },
      { tag: 'fix', text: 'Naprawiono persystencję danych po zmianie widoku.' },
    ],
  },
  {
    version: '1.5.0',
    date: '04.01.2026',
    changes: [
      { tag: 'ui', text: 'Responsywny layout, możliwość zmiany kolejności pracowników przez przeciągnij-i-upuść.' },
      { tag: 'ui', text: 'Podświetlanie bieżącego wiersza kalendarza, widoczność pracownika po najechaniu.' },
      { tag: 'feat', text: 'Nowy typ zmiany L4, masowe przypisywanie zmian, ulepszenia UI.' },
    ],
  },
  {
    version: '1.4.0',
    date: '01.01.2026',
    changes: [
      { tag: 'refactor', text: 'Scentralizowane stałe, warstwa serwisów, naprawa zależności cyklicznych.' },
      { tag: 'refactor', text: 'Migracja do struktury src, wprowadzenie hooków i serwisów.' },
      { tag: 'security', text: 'Włączono RLS dla ws_adjustments, usunięto easter eggi.' },
    ],
  },
  {
    version: '1.3.0',
    date: '27.12.2025',
    changes: [
      { tag: 'feat', text: 'Drag & Drop do zmiany kolejności pracowników.' },
      { tag: 'feat', text: 'Moduł Wolnych Sobót z zarządzaniem korektami.' },
      { tag: 'ui', text: 'Kontrola powiększenia interfejsu (Zoom).' },
    ],
  },
  {
    version: '1.2.0',
    date: '23.12.2025',
    changes: [
      { tag: 'security', text: 'Izolacja danych per użytkownik: dodano user_id do pracowników, filtrowanie danych sesją.' },
      { tag: 'security', text: 'Zakres cache localStorage ograniczony do sesji użytkownika.' },
    ],
  },
  {
    version: '1.1.0',
    date: '21.12.2025',
    changes: [
      { tag: 'feat', text: 'Modal resetu systemu z potwierdzeniem.' },
      { tag: 'feat', text: 'Niestandardowe role i usuwanie pracowników.' },
      { tag: 'ui', text: 'Aktualizacja strony logowania, ulepszenie menu.' },
    ],
  },
  {
    version: '1.0.0',
    date: '18.12.2025',
    label: 'Pierwsze wydanie',
    changes: [
      { tag: 'feat', text: 'Inicjalizacja projektu Work Grid System.' },
      { tag: 'feat', text: 'Grafik zmian, zarządzanie pracownikami, motywy kolorystyczne, ustawienia.' },
    ],
  },
];
