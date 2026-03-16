import React from 'react';
import { X, Shield, FileText, Lock, AlertTriangle, Users, RefreshCw, Phone } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fixed date — must not be computed dynamically so it reflects the actual last edit.
const LAST_UPDATED = '16.03.2026';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
  <section>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-brand-600 dark:text-brand-400 shrink-0">{icon}</span>
      <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
    </div>
    <div className="pl-6 text-slate-600 dark:text-slate-400 space-y-1.5">{children}</div>
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl p-0 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div>
            <h3 id="terms-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Regulamin Serwisu
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ostatnia aktualizacja: {LAST_UPDATED} &nbsp;·&nbsp; wersja {APP_CONFIG.APP_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij regulamin"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6 text-sm leading-relaxed">

          {/* 1 */}
          <Section icon={<FileText className="w-4 h-4" />} title="1. Postanowienia ogólne">
            <p>
              Niniejszy regulamin określa zasady korzystania z systemu{' '}
              <strong className="text-slate-800 dark:text-slate-200">{APP_CONFIG.APP_NAME}</strong> służącego
              do zarządzania czasem pracy, ewidencji grafików i danych kadrowych.
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
          <Section icon={<Users className="w-4 h-4" />} title="2. Zasady użytkowania">
            <ul className="list-disc list-inside space-y-1.5">
              <li>Użytkownik zobowiązuje się do korzystania z systemu wyłącznie zgodnie z jego przeznaczeniem.</li>
              <li>Zabrania się wprowadzania fałszywych lub nieaktualnych danych kadrowych i planistycznych.</li>
              <li>Dane dostępowe (login, hasło) są poufne i nie mogą być przekazywane osobom trzecim.</li>
              <li>Użytkownik jest zobowiązany do niezwłocznego zgłoszenia administratorowi utraty lub podejrzenia kradzieży danych dostępowych.</li>
              <li>Konta użytkowników są imienne — niedopuszczalne jest korzystanie z konta innej osoby.</li>
              <li>Zabrania się podejmowania prób nieautoryzowanego dostępu, modyfikacji lub usunięcia danych innych użytkowników.</li>
            </ul>
          </Section>

          {/* 3 — RODO compliant */}
          <Section icon={<Shield className="w-4 h-4" />} title="3. Ochrona danych osobowych (RODO)">
            <p>
              System przetwarza dane osobowe pracowników w zakresie niezbędnym do ewidencji i planowania
              czasu pracy zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO)
              oraz ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych.
            </p>
            <div className="mt-2 space-y-1.5">
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Administrator danych:</strong>{' '}
                Pracodawca będący stroną umowy licencyjnej na korzystanie z systemu {APP_CONFIG.APP_NAME}.
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Podstawa prawna przetwarzania:</strong>{' '}
                art. 6 ust. 1 lit. c RODO (wypełnienie obowiązku prawnego ciążącego na Administratorze —
                prowadzenie ewidencji czasu pracy zgodnie z art. 149 Kodeksu Pracy).
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Zakres przetwarzanych danych:</strong>{' '}
                imię i nazwisko, stanowisko, grafik pracy, ewidencja czasu pracy i nieobecności.
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Okres przechowywania danych:</strong>{' '}
                Dane ewidencji czasu pracy przechowywane są przez okres wymagany przepisami prawa — nie
                krócej niż 3 lata od zakończenia okresu, którego dotyczą (art. 94 pkt 9b Kodeksu Pracy).
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Prawa osoby, której dane dotyczą:</strong>{' '}
                prawo dostępu do danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania,
                prawo do przenoszenia danych, prawo wniesienia sprzeciwu wobec przetwarzania,
                a także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych
                (ul. Stawki 2, 00-193 Warszawa; <a href="https://www.uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 underline">www.uodo.gov.pl</a>).
              </p>
            </div>
          </Section>

          {/* 4 */}
          <Section icon={<Lock className="w-4 h-4" />} title="4. Bezpieczeństwo">
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
          <Section icon={<AlertTriangle className="w-4 h-4" />} title="5. Odpowiedzialność i ograniczenia">
            <p>
              Twórca oprogramowania ({APP_CONFIG.APP_AUTHOR}) nie ponosi odpowiedzialności za:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-1.5">
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
          <Section icon={<RefreshCw className="w-4 h-4" />} title="6. Zmiany regulaminu">
            <p>
              Operator zastrzega sobie prawo do zmiany niniejszego regulaminu. Użytkownicy zostaną
              poinformowani o zmianach poprzez komunikat wyświetlony przy następnym logowaniu lub
              drogą służbową. Dalsze korzystanie z systemu po wejściu w życie zmian oznacza ich
              akceptację.
            </p>
          </Section>

          {/* 7 */}
          <Section icon={<Phone className="w-4 h-4" />} title="7. Kontakt i zgłaszanie problemów">
            <p>
              Wszelkie pytania dotyczące regulaminu, przetwarzania danych osobowych lub zgłoszenia
              incydentów bezpieczeństwa należy kierować do administratora systemu wyznaczonego przez
              Pracodawcę lub bezpośrednio do twórcy oprogramowania:
            </p>
            <p className="mt-1.5">
              <strong className="text-slate-700 dark:text-slate-300">{APP_CONFIG.APP_AUTHOR}</strong>
              {' · '}
              <a
                href="https://matikgal.github.io/portfolio/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 underline"
              >
                matikgal.github.io/portfolio/contact
              </a>
            </p>
          </Section>

          {/* Legal notice */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Nota prawna</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Oprogramowanie <strong className="text-slate-700 dark:text-slate-300">{APP_CONFIG.APP_NAME}</strong> v{APP_CONFIG.APP_VERSION} &copy; {APP_CONFIG.APP_YEAR} {APP_CONFIG.APP_AUTHOR}.
              Wszelkie prawa zastrzeżone. Kod źródłowy i projekt interfejsu podlegają ochronie prawa
              autorskiego zgodnie z ustawą z dnia 4 lutego 1994 r. o prawie autorskim i prawach
              pokrewnych (Dz.U. 1994 nr 24 poz. 83, z późn. zm.). Nieautoryzowane kopiowanie,
              modyfikowanie lub rozpowszechnianie oprogramowania jest zabronione.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10 active:scale-95 transform"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
