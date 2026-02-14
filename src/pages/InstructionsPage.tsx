import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { 
  BookOpen, Layout, Calendar, Clock, Printer, 
  ShoppingCart, Palmtree, UsersRound, Settings, 
  ShieldCheck, AlertCircle, Info, Lock, 
  MousePointerClick, CheckSquare, List
} from 'lucide-react';
import { cn } from '../utils';

export const InstructionsPage: React.FC = () => {
  return (
    <MainLayout pageTitle="Instrukcja">
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                    Instrukcja Obsługi
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kompletny przewodnik po systemie Work Grid</p>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-12 pb-24">
                
                {/* Section: Wprowadzenie */}
                <section id="intro" className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Info className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Wprowadzenie</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>Work Grid System to narzędzie wspomagające zarządzanie czasem pracy, urlopami oraz zamówieniami w firmie. System został zaprojektowany z myślą o prostocie i szybkości działania, oferując jednocześnie zaawansowane funkcje dla administratorów.</p>
                    </div>
                </section>

                {/* Section: Grafik */}
                <section id="shifts" className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Layout className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Obsługa Grafiku</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <MousePointerClick className="w-4 h-4 text-blue-500" />
                                    Dodawanie i Edycja Zmian
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                                    Aby dodać lub zmienić zmianę, kliknij na wybraną komórkę w grafiku. Pojawi się okno wyboru typu zmiany.
                                    Możesz wybrać standardowe godziny pracy lub inne typy absencji (Urlop, L4, itp.).
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span><strong>Zmiana (6-14, 14-22)</strong> - Standardowe godziny pracy.</span>
                                    </li>
                                    <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                        <span><strong>Urlop (W)</strong> - Dni wolne od pracy, wliczane do puli urlopowej.</span>
                                    </li>
                                    <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                        <span><strong>Chorobowe (L4)</strong> - Nieobecność chorobowa.</span>
                                    </li>
                                    <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                                        <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                        <span><strong>Wolne (UŻ)</strong> - Urlop na żądanie lub okolicznościowy.</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <Printer className="w-4 h-4 text-purple-500" />
                                    Drukowanie i Eksport
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    W prawym górnym rogu znajduje się przycisk drukarki. Otwiera on podgląd wydruku zoptymalizowany pod format A4.
                                    Możesz wydrukować aktualny widok miesiąca.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Urlopy */}
                <section id="vacations" className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <Palmtree className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Urlopy i Rozliczenia</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Automatyczne zliczanie</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        System automatycznie zlicza dni urlopowe (W) wprowadzone w grafiku i sumuje je w zakładce "Urlopy".
                                        Widok podzielony jest na miesiące.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Edycja i Korekty</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                        Możesz ręcznie korygować liczbę dni urlopowych lub dodać dni zaległe z poprzedniego roku.
                                        Aby to zrobić, musisz najpierw <strong>Odblokować edycję</strong> przyciskiem kłódki <Lock className="w-3 h-3 inline text-orange-500" />.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-900/20">
                                <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4" />
                                    Zaznaczanie i Wyróżnianie
                                </h4>
                                <p className="text-sm text-orange-700 dark:text-orange-300">
                                    W widoku Urlopów możesz kliknąć ikonę Palmy przy nazwisku pracownika (po odblokowaniu), aby wyróżnić go kolorem żółtym.
                                    Jest to przydatne do oznaczania pracowników, którzy np. wykorzystali już cały limit urlopowy.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Rozliczenie (Suma)</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    W kolumnie "Suma" wyświetlana jest różnica pomiędzy Dniami Zaległymi a wykorzystanymi.
                                    <br/>
                                    <strong>Wzór:</strong> <code>Zaległe - (Wykorzystane Auto + Ręczne Korekty)</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Zamówienia */}
                <section id="orders" className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Zamówienia</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Składanie zamówień</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Każdy pracownik może dodać produkty do listy braków. Wystarczy wybrać kategorię, wpisać nazwę produktu i ilość.
                                    Zamówienia trafiają na wspólną listę z statusem "Oczekujące".
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Panel Administratora
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Osoby uprawnione (Admin) mają dostęp do panelu, gdzie mogą zmieniać statusy zamówień:
                                </p>
                                <ul className="mt-2 text-sm space-y-2 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-400"/>
                                        <span><strong>Oczekujące</strong> - nowo dodane.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-400"/>
                                        <span><strong>Zamówione</strong> - towar został zamówiony u dostawcy.</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"/>
                                        <span><strong>Zrealizowane</strong> - towar dotarł, zamówienie zarchiwizowane.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Pracownicy */}
                <section id="employees" className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <UsersRound className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pracownicy i Separatory</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6">
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                W zakładce "Zarządzaj pracownikami" możesz dodawać nowe osoby, edytować ich dane oraz ustalać ich widoczność.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <List className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <strong className="text-slate-900 dark:text-white text-sm block">Separatory</strong>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Możesz dodać specjalnego "pracownika" będącego separatorem, aby oddzielić grupy w grafiku (np. Kasjerzy, Magazyn).
                                            Separatory nie są widoczne w zakładce Urlopy.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Settings className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <strong className="text-slate-900 dark:text-white text-sm block">Widoczność</strong>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Każdego pracownika można ukryć w Grafiku lub w Urlopach, odznaczając odpowiednie opcje w edycji pracownika.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                 {/* Section: Tips */}
                 <section id="tips" className="mt-8">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <LightbulbIcon className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Wskazówki</h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li>• Używaj trybu kompaktowego (w Ustawieniach) na mniejszych ekranach.</li>
                                    <li>• Kliknij prawym przyciskiem myszy na zmianę, aby szybko ją usunąć.</li>
                                    <li>• W widoku zamówień możesz filtrować listę po kategoriach.</li>
                                    <li>• Grafik zapisuje się automatycznie w czasie rzeczywistym.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper icon component since Lightbulb might clash with lucide import above if not renamed
const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1.5 1.5-2.5 1.5-3.5a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 1 .5 2 1.5 3.5 2.5 1.8 3.5 2.5 4.6 3.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);
