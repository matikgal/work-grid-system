import React from 'react';
import { X } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl p-0 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Regulamin Serwisu</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <section>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Postanowienia ogólne</h4>
                    <p>
                        Niniejszy regulamin określa zasady korzystania z systemu <strong>{APP_CONFIG.APP_NAME}</strong>.
                        Dostęp do aplikacji jest możliwy wyłącznie dla autoryzowanych pracowników i administratorów.
                        Korzystanie z serwisu oznacza akceptację poniższych warunków.
                    </p>
                </section>

                <section>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Zasady użytkowania</h4>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>Użytkownik zobowiązuje się do korzystania z systemu zgodnie z jego przeznaczeniem.</li>
                        <li>Zabrania się wprowadzania fałszywych danych oraz prób nieautoryzowanego dostępu.</li>
                        <li>Hasła dostępowe są poufne i nie mogą być udostępniane osobom trzecim.</li>
                    </ul>
                </section>

                <section>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Ochrona danych (RODO)</h4>
                    <p>
                        System przetwarza dane osobowe pracowników w zakresie niezbędnym do planowania i ewidencji czasu pracy.
                        Administratorem danych jest operator systemu. Dane są chronione zgodnie z obowiązującymi przepisami prawa.
                    </p>
                </section>

                <section>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Odpowiedzialność</h4>
                    <p>
                        Twórca oprogramowania nie ponosi odpowiedzialności za błędy w grafikach wynikające z wprowadzenia niepoprawnych danych przez użytkowników.
                        System służy jako narzędzie wspomagające, a ostateczna weryfikacja zgodności z Kodeksem Pracy leży po stronie Pracodawcy.
                    </p>
                </section>

                 <section className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Nota Prawna</h4>
                    <p className="text-xs">
                        Oprogramowanie <strong>{APP_CONFIG.APP_NAME}</strong> jest dostarczane w modelu "as is" (takim jaki jest), bez gwarancji jakiegokolwiek rodzaju.
                        Twórca (Mateusz Gałuszka) zachowuje wszelkie prawa autorskie do kodu źródłowego i projektu interfejsu.
                    </p>
                </section>
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
