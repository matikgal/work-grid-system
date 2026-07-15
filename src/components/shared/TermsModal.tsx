import React from 'react';
import { X, Shield, FileText, Lock, AlertTriangle, Users, RefreshCw, Phone } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fixed date — must not be computed dynamically so it reflects the actual last edit.
const LAST_UPDATED = '29.06.2026';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
  <section>
    <div className="mb-2 flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/18 to-violet-500/10 text-violet-600 dark:text-violet-300">
        {icon}
      </span>
      <h4 className="text-base font-bold text-indigo-950 dark:text-white">{title}</h4>
    </div>
    <div className="space-y-1.5 pl-9 text-indigo-950/65 dark:text-indigo-100/65">{children}</div>
  </section>
);

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-indigo-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 text-indigo-950 shadow-[0_28px_70px_-28px_rgba(49,46,129,0.65)] backdrop-blur-2xl duration-200 dark:border-white/10 dark:bg-[#14121f]/90 dark:text-indigo-50">
        {/* Aurora za szkłem */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -right-12 bottom-1/4 h-52 w-52 rounded-full bg-violet-400/25 blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/45 px-6 py-4 dark:border-white/10">
          <div>
            <h3
              id="terms-modal-title"
              className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-sky-300"
            >
              Regulamin Serwisu
            </h3>
            <p className="text-xs text-indigo-950/50 dark:text-indigo-100/55">
              Ostatnia aktualizacja: {LAST_UPDATED} &nbsp;·&nbsp; wersja {APP_CONFIG.APP_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij regulamin"
            className="rounded-xl p-1.5 text-indigo-950/50 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/55"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="dash-scroll space-y-6 overflow-y-auto p-6 text-sm leading-relaxed md:p-8">
          {/* 1 */}
          <Section icon={<FileText className="h-4 w-4" />} title="1. Postanowienia ogólne">
            <p>
              Niniejszy regulamin określa zasady korzystania z systemu{' '}
              <strong className="text-indigo-950/85 dark:text-indigo-50/90">{APP_CONFIG.APP_NAME}</strong>{' '}
              służącego do zarządzania czasem pracy, ewidencji grafików i danych kadrowych.
            </p>
            <p>
              Dostęp do aplikacji jest możliwy wyłącznie dla autoryzowanych pracowników i administratorów
              pracodawcy. Korzystanie z serwisu oznacza bezwarunkową akceptację niniejszego regulaminu.
            </p>
            <p>
              System ma charakter narzędzia wspomagającego — ostateczna weryfikacja zgodności z
              obowiązującym prawem pracy leży po stronie Pracodawcy.
            </p>
          </Section>

          {/* 2 */}
          <Section icon={<Users className="h-4 w-4" />} title="2. Zasady użytkowania">
            <ul className="list-inside list-disc space-y-1.5">
              <li>Użytkownik zobowiązuje się do korzystania z systemu wyłącznie zgodnie z jego przeznaczeniem.</li>
              <li>Zabrania się wprowadzania fałszywych lub nieaktualnych danych kadrowych i planistycznych.</li>
              <li>Dane dostępowe (login, hasło) są poufne i nie mogą być przekazywane osobom trzecim.</li>
              <li>Użytkownik jest zobowiązany do niezwłocznego zgłoszenia administratorowi utraty lub podejrzenia kradzieży danych dostępowych.</li>
              <li>Konta użytkowników są imienne — niedopuszczalne jest korzystanie z konta innej osoby.</li>
              <li>Zabrania się podejmowania prób nieautoryzowanego dostępu, modyfikacji lub usunięcia danych innych użytkowników.</li>
            </ul>
          </Section>

          {/* 3 — RODO compliant */}
          <Section icon={<Shield className="h-4 w-4" />} title="3. Ochrona danych osobowych (RODO)">
            <p>
              System przetwarza dane osobowe pracowników w zakresie niezbędnym do ewidencji i planowania
              czasu pracy zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)
              oraz ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych.
            </p>
            <div className="mt-2 space-y-1.5">
              <p>
                <strong className="text-indigo-950/85 dark:text-indigo-50/90">Administrator danych:</strong>{' '}
                Pracodawca będący stroną umowy licencyjnej na korzystanie z systemu {APP_CONFIG.APP_NAME}.
              </p>
              <p>
                <strong className="text-indigo-950/85 dark:text-indigo-50/90">Podstawa prawna przetwarzania:</strong>{' '}
                art. 6 ust. 1 lit. c RODO (wypełnienie obowiązku prawnego ciążącego na Administratorze —
                prowadzenie ewidencji czasu pracy zgodnie z art. 149 Kodeksu Pracy).
              </p>
              <p>
                <strong className="text-indigo-950/85 dark:text-indigo-50/90">Zakres przetwarzanych danych:</strong>{' '}
                imię i nazwisko, stanowisko, grafik pracy, ewidencja czasu pracy i nieobecności.
              </p>
              <p>
                <strong className="text-indigo-950/85 dark:text-indigo-50/90">Okres przechowywania danych:</strong>{' '}
                Dane ewidencji czasu pracy przechowywane są przez okres wymagany przepisami prawa — nie
                krócej niż 3 lata od zakończenia okresu, którego dotyczą (art. 94 pkt 9b Kodeksu Pracy).
              </p>
              <p>
                <strong className="text-indigo-950/85 dark:text-indigo-50/90">Prawa osoby, której dane dotyczą:</strong>{' '}
                prawo dostępu do danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania,
                prawo do przenoszenia danych, prawo wniesienia sprzeciwu wobec przetwarzania,
                a także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych
                (ul. Stawki 2, 00-193 Warszawa;{' '}
                <a
                  href="https://www.uodo.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline dark:text-indigo-300"
                >
                  www.uodo.gov.pl
                </a>
                ).
              </p>
            </div>
          </Section>

          {/* 4 */}
          <Section icon={<Lock className="h-4 w-4" />} title="4. Bezpieczeństwo">
            <p>
              Dane przechowywane są na serwerach dostawcy infrastruktury chmurowej z zastosowaniem
              szyfrowania w tranzycie (TLS) i w spoczynku. Dostęp do bazy danych jest ograniczony
              wyłącznie do autoryzowanych procesów aplikacji.
            </p>
            <p>
              Operator systemu podejmuje uzasadnione środki techniczne i organizacyjne w celu ochrony
              danych przed nieuprawnionym dostępem, utratą lub zniszczeniem, jednak nie może
              zagwarantować absolutnego bezpieczeństwa w środowisku internetowym.
            </p>
          </Section>

          {/* 5 */}
          <Section icon={<AlertTriangle className="h-4 w-4" />} title="5. Odpowiedzialność i ograniczenia">
            <p>Twórca oprogramowania ({APP_CONFIG.APP_AUTHOR}) nie ponosi odpowiedzialności za:</p>
            <ul className="mt-1.5 list-inside list-disc space-y-1">
              <li>błędy w grafikach wynikające z wprowadzenia niepoprawnych danych przez użytkowników,</li>
              <li>przerwy w działaniu systemu spowodowane awarią infrastruktury zewnętrznej,</li>
              <li>niezgodności grafiku z Kodeksem Pracy wynikające z błędnej konfiguracji przez Pracodawcę,</li>
              <li>szkody wynikające z nieuprawnionego korzystania z konta przez osoby trzecie.</li>
            </ul>
            <p className="mt-2">
              Oprogramowanie dostarczane jest w stanie takim, w jakim jest (<em>as is</em>), bez gwarancji
              jakiegokolwiek rodzaju — jawnych ani domniemanych.
            </p>
          </Section>

          {/* 6 */}
          <Section icon={<RefreshCw className="h-4 w-4" />} title="6. Zmiany regulaminu">
            <p>
              Operator zastrzega sobie prawo do zmiany niniejszego regulaminu. Użytkownicy zostaną
              poinformowani o zmianach poprzez komunikat wyświetlony przy następnym logowaniu lub
              drogą służbową. Dalsze korzystanie z systemu po wejściu w życie zmian oznacza ich
              akceptację.
            </p>
          </Section>

          {/* 7 */}
          <Section icon={<Phone className="h-4 w-4" />} title="7. Kontakt i zgłaszanie problemów">
            <p>
              Wszelkie pytania dotyczące regulaminu, przetwarzania danych osobowych lub zgłoszenia
              incydentów bezpieczeństwa należy kierować do administratora systemu wyznaczonego przez
              Pracodawcę lub bezpośrednio do twórcy oprogramowania:
            </p>
            <p className="mt-1.5">
              <strong className="text-indigo-950/85 dark:text-indigo-50/90">{APP_CONFIG.APP_AUTHOR}</strong>
              {' · '}
              <a
                href="https://matikgal.github.io/portfolio/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline dark:text-indigo-300"
              >
                matikgal.github.io/portfolio/contact
              </a>
            </p>
          </Section>

          {/* Legal notice */}
          <div className="rounded-2xl border border-white/55 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <h4 className="mb-1 text-sm font-bold text-indigo-950 dark:text-white">Nota prawna</h4>
            <p className="text-xs text-indigo-950/55 dark:text-indigo-100/55">
              Oprogramowanie{' '}
              <strong className="text-indigo-950/80 dark:text-indigo-50/85">{APP_CONFIG.APP_NAME}</strong>{' '}
              v{APP_CONFIG.APP_VERSION} &copy; {APP_CONFIG.APP_YEAR} {APP_CONFIG.APP_AUTHOR}.
              Wszelkie prawa zastrzeżone. Kod źródłowy i projekt interfejsu podlegają ochronie prawa
              autorskiego zgodnie z ustawą z dnia 4 lutego 1994 r. o prawie autorskim i prawach
              pokrewnych (Dz.U. 1994 nr 24 poz. 83, z późn. zm.). Nieautoryzowane kopiowanie,
              modyfikowanie lub rozpowszechnianie oprogramowania jest zabronione.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-white/45 bg-white/30 p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_-12px_rgba(99,102,241,0.9)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
