import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, Layout, Calendar, Clock, Printer, Command, AlertCircle, MousePointerClick, Info } from 'lucide-react';
import { cn } from '../utils';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS = [
    { id: 'intro', title: 'Wprowadzenie', icon: BookOpen },
    { id: 'shifts', title: 'Obsługa Grafiku', icon: Layout },
    { id: 'legend', title: 'Legenda i Kolory', icon: Calendar },
    { id: 'norm', title: 'Dni Robocze (Norma)', icon: Clock },
    { id: 'print', title: 'Drukowanie', icon: Printer },
];

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  if (!isOpen) return null;

  const ShiftBadge = ({ className, children }: { className: string, children: React.ReactNode }) => (
      <span className={cn("inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold border dark:border-opacity-50", className)}>
          {children}
      </span>
  );

  const Key = ({ children }: { children: React.ReactNode }) => (
      <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 font-mono text-xs shadow-[0px_2px_0px_rgba(0,0,0,0.1)] dark:shadow-[0px_2px_0px_rgba(0,0,0,0.3)] mx-1">
          {children}
      </kbd>
  );

  const renderContent = () => {
      switch (activeSection) {
          case 'intro':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Witaj w Grafiku Pracy</h2>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                              Kompleksowe narzędzie do zarządzania czasem pracy. Planuj zmiany, kontroluj normy godzinowe i generuj czytelne raporty w kilka sekund.
                          </p>
                      </div>
                      
                      <div className="space-y-6">
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2 flex items-center gap-2">
                                  <Layout className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                  Intuicyjny Interfejs
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">Przejrzysty widok tygodniowy i miesięczny z systemem kolorów.</p>
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2 flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                  Kontrola Norm
                               </h3>
                               <p className="text-slate-600 dark:text-slate-400">Automatyczne przeliczanie godzin i dni roboczych.</p>
                            </div>
                      </div>
                  </div>
              );
          case 'shifts':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                              <MousePointerClick className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                              Dodawanie Zmian
                          </h3>
                          <div className="space-y-4">
                             <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 font-bold text-slate-400 dark:text-slate-300">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Metoda "Kliknij i Wybierz"</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Kliknij dowolną pustą kratkę w kalendarzu, aby otworzyć okno wyboru zmiany. Wybierz typ zmiany (np. 6-14) i zatwierdź.</p>
                                </div>
                             </div>
                             <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 font-bold text-slate-400 dark:text-slate-300">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Szybkie Dodawanie (Pasek Narzędzi)</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 mb-2">Wybierz typ zmiany z paska na górze ekranu:</p>
                                    <div className="flex gap-2 mb-2">
                                        <ShiftBadge className="bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 shadow-sm opacity-100 ring-2 ring-slate-800 ring-offset-1 dark:ring-slate-400">1 6-14</ShiftBadge>
                                        <ShiftBadge className="bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 opacity-50">2 14-22</ShiftBadge>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">Gdy przycisk jest aktywny (obwódka), każde kliknięcie w kalendarz wstawi tę zmianę.</p>
                                </div>
                             </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                              <Command className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                              Skróty Klawiszowe
                          </h3>
                          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                              <table className="w-full text-sm">
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-slate-500 dark:text-slate-400">Wybór szablonu 1 (6-14)</td>
                                          <td className="p-3 text-right"><Key>1</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-slate-500 dark:text-slate-400">Wybór szablonu 2 (14-22)</td>
                                          <td className="p-3 text-right"><Key>2</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-slate-500 dark:text-slate-400">Wybór szablonu 3 (10-18)</td>
                                          <td className="p-3 text-right"><Key>3</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-slate-500 dark:text-slate-400">Wybór szablonu 4 Urlop</td>
                                          <td className="p-3 text-right"><Key>4</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-slate-500 dark:text-slate-400">Wybór szablonu 5 Wolna Sobota</td>
                                          <td className="p-3 text-right"><Key>5</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                          <td className="p-3 text-slate-500 dark:text-slate-400">Anuluj wybór / Zamknij</td>
                                          <td className="p-3 text-right"><Key>Esc</Key></td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              );
          case 'legend':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 p-4 rounded-xl flex items-start gap-3">
                          <Info className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm">Kolory w programie pozwalają na błyskawiczne odróżnienie typu zmiany. Poniżej znajduje się pełna legenda.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <ShiftBadge className="w-24 h-8 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 mr-4 text-sm">6-14</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">Zmiana Poranna</strong>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Standardowe 8h pracy.</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <ShiftBadge className="w-24 h-8 bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300 mr-4 text-sm">14-22</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">Zmiana Popołudniowa</strong>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Standardowe 8h pracy.</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <ShiftBadge className="w-24 h-8 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300 mr-4 text-sm">10-18</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">Zmiana Średnia</strong>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Pośrednie godziny pracy (8h).</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <ShiftBadge className="w-24 h-8 bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 mr-4 text-sm">Urlop</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">Urlop Wypoczynkowy</strong>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Liczony jako <span className="font-bold text-slate-700 dark:text-slate-300">8 godzin</span> pracy do normy.</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <ShiftBadge className="w-24 h-8 bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 mr-4 text-sm">Wolna Sob.</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 dark:text-slate-200 block text-sm">Wolna Sobota</strong>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Dzień wolny od pracy za święto (0h).</span>
                                </div>
                            </div>
                      </div>
                  </div>
              );
          case 'norm':
             return (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="prose prose-sm text-slate-600 dark:text-slate-400">
                         <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-2">Czym są Dni Robocze?</h3>
                         <p>
                             To liczba dni w miesiącu, która stanowi podstawę do wyliczenia etatu (normy godzinowej). 
                             System automatycznie wylicza dni robocze (bez weekendów i świąt), ale pozwala na ręczną korektę.
                         </p>
                     </div>

                     <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                         <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Narzędzie w Prawym Górnym Rogu</span>
                         <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm scale-125 origin-center my-4">
                             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Dni robocze:</span>
                             <span className="w-8 text-center bg-transparent border-b border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs p-0">20</span>
                             <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">dni</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                            Kliknij w liczbę i wpisz właściwą wartość. System przeliczy normę (np. 20 dni * 8h = 160h) i zaktualizuje kolory w podsumowaniu.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                             <div className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">160h</div>
                             <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Norma Wyrobiona</div>
                             <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/50 mt-1">Kolor Zielony</p>
                         </div>
                         <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/50">
                             <div className="font-bold text-rose-800 dark:text-rose-300 text-lg">152h</div>
                             <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Brakuje Godzin</div>
                             <p className="text-[10px] text-rose-600/70 dark:text-rose-400/50 mt-1">Kolor Czerwony</p>
                         </div>
                     </div>
                 </div>
             );
          case 'print':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4">
                          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
                              <Printer className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Drukowanie Raportu</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">Generowanie PDF lub wydruk fizyczny.</p>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                              <span className="text-sm text-slate-700 dark:text-slate-300">Wybierz widok (Tydzień lub Miesiąc).</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg">
                               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                               <span className="text-sm text-slate-700 dark:text-slate-300">Kliknij ikonę drukarki w prawym górnym rogu.</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg">
                               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                               <span className="text-sm text-slate-700 dark:text-slate-300">W oknie drukowania wybierz orientację <strong className="text-slate-900 dark:text-white">Poziomą (Landscape)</strong>.</span>
                          </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                             * Raport ukrywa niepotrzebne elementy interfejsu (przyciski, paski) i drukuje czystą tabelę.
                          </p>
                      </div>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar Navigation */}
        <div className="w-72 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 text-brand-700 dark:text-brand-400">
                    <h2 className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">Instrukcja</h2>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {SECTIONS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group",
                                activeSection === item.id 
                                    ? "bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-sm border border-slate-100 dark:border-slate-700" 
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn("w-4 h-4", activeSection === item.id ? "text-brand-500 dark:text-brand-400" : "text-slate-400 dark:text-slate-500")} />
                                {item.title}
                            </div>
                            <ChevronRight className={cn(
                                "w-4 h-4 transition-all",
                                activeSection === item.id ? "opacity-100 text-brand-400 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-50"
                            )} />
                        </button>
                    )
                })}
            </div>
            <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
               <p className="text-[10px] text-slate-400 dark:text-slate-500">Wersja 1.0.1</p>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 z-10 w-full flex justify-end pointer-events-none">
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors pointer-events-auto"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                   {renderContent()}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
