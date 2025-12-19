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
      <span className={cn("inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold border", className)}>
          {children}
      </span>
  );

  const Key = ({ children }: { children: React.ReactNode }) => (
      <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-md text-slate-700 font-mono text-xs shadow-[0px_2px_0px_rgba(0,0,0,0.1)] mx-1">
          {children}
      </kbd>
  );

  const renderContent = () => {
      switch (activeSection) {
          case 'intro':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-4">Witaj w Grafiku Pracy</h2>
                          <p className="text-slate-600 leading-relaxed text-base">
                              Kompleksowe narzędzie do zarządzania czasem pracy. Planuj zmiany, kontroluj normy godzinowe i generuj czytelne raporty w kilka sekund.
                          </p>
                      </div>
                      
                      <div className="space-y-6">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
                                  <Layout className="w-5 h-5 text-brand-600" />
                                  Intuicyjny Interfejs
                              </h3>
                              <p className="text-slate-600">Przejrzysty widok tygodniowy i miesięczny z systemem kolorów.</p>
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-900 text-lg mb-2 flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-brand-600" />
                                  Kontrola Norm
                               </h3>
                               <p className="text-slate-600">Automatyczne przeliczanie godzin i dni roboczych.</p>
                            </div>
                      </div>
                  </div>
              );
          case 'shifts':
              return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <MousePointerClick className="w-5 h-5 text-brand-600" />
                              Dodawanie Zmian
                          </h3>
                          <div className="space-y-4">
                             <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 font-bold text-slate-400">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Metoda "Kliknij i Wybierz"</h4>
                                    <p className="text-slate-600 text-sm mt-1">Kliknij dowolną pustą kratkę w kalendarzu, aby otworzyć okno wyboru zmiany. Wybierz typ zmiany (np. 6-14) i zatwierdź.</p>
                                </div>
                             </div>
                             <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 font-bold text-slate-400">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Szybkie Dodawanie (Pasek Narzędzi)</h4>
                                    <p className="text-slate-600 text-sm mt-1 mb-2">Wybierz typ zmiany z paska na górze ekranu:</p>
                                    <div className="flex gap-2 mb-2">
                                        <ShiftBadge className="bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm opacity-100 ring-2 ring-slate-800 ring-offset-1">1 6-14</ShiftBadge>
                                        <ShiftBadge className="bg-indigo-100 border-indigo-300 text-indigo-800 opacity-50">2 14-22</ShiftBadge>
                                    </div>
                                    <p className="text-slate-600 text-sm">Gdy przycisk jest aktywny (obwódka), każde kliknięcie w kalendarz wstawi tę zmianę.</p>
                                </div>
                             </div>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Command className="w-5 h-5 text-brand-600" />
                              Skróty Klawiszowe
                          </h3>
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                              <table className="w-full text-sm">
                                  <tbody className="divide-y divide-slate-100">
                                      <tr className="hover:bg-slate-50">
                                          <td className="p-3 text-slate-500">Wybór szablonu 1 (6-14)</td>
                                          <td className="p-3 text-right"><Key>1</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50">
                                          <td className="p-3 text-slate-500">Wybór szablonu 2 (14-22)</td>
                                          <td className="p-3 text-right"><Key>2</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50">
                                          <td className="p-3 text-slate-500">Wybór szablonu 3 (10-18)</td>
                                          <td className="p-3 text-right"><Key>3</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50">
                                          <td className="p-3 text-slate-500">Wybór szablonu 4 Urlop</td>
                                          <td className="p-3 text-right"><Key>4</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50">
                                          <td className="p-3 text-slate-500">Wybór szablonu 5 Wolna Sobota</td>
                                          <td className="p-3 text-right"><Key>5</Key></td>
                                      </tr>
                                      <tr className="hover:bg-slate-50">
                                          <td className="p-3 text-slate-500">Anuluj wybór / Zamknij</td>
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
                      <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-start gap-3">
                          <Info className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm">Kolory w programie pozwalają na błyskawiczne odróżnienie typu zmiany. Poniżej znajduje się pełna legenda.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <ShiftBadge className="w-24 h-8 bg-emerald-100 border-emerald-300 text-emerald-800 mr-4 text-sm">6-14</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 block text-sm">Zmiana Poranna</strong>
                                    <span className="text-xs text-slate-500">Standardowe 8h pracy.</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <ShiftBadge className="w-24 h-8 bg-indigo-100 border-indigo-300 text-indigo-800 mr-4 text-sm">14-22</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 block text-sm">Zmiana Popołudniowa</strong>
                                    <span className="text-xs text-slate-500">Standardowe 8h pracy.</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <ShiftBadge className="w-24 h-8 bg-purple-100 border-purple-300 text-purple-800 mr-4 text-sm">10-18</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 block text-sm">Zmiana Średnia</strong>
                                    <span className="text-xs text-slate-500">Pośrednie godziny pracy (8h).</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <ShiftBadge className="w-24 h-8 bg-orange-100 border-orange-300 text-orange-800 mr-4 text-sm">Urlop</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 block text-sm">Urlop Wypoczynkowy</strong>
                                    <span className="text-xs text-slate-500">Liczony jako <span className="font-bold text-slate-700">8 godzin</span> pracy do normy.</span>
                                </div>
                            </div>
                            <div className="flex items-center p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <ShiftBadge className="w-24 h-8 bg-slate-100 border-slate-300 text-slate-500 mr-4 text-sm">Wolna Sob.</ShiftBadge>
                                <div>
                                    <strong className="text-slate-800 block text-sm">Wolna Sobota</strong>
                                    <span className="text-xs text-slate-500">Dzień wolny od pracy za święto (0h).</span>
                                </div>
                            </div>
                      </div>
                  </div>
              );
          case 'norm':
             return (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="prose prose-sm text-slate-600">
                         <h3 className="text-slate-800 font-bold text-lg mb-2">Czym są Dni Robocze?</h3>
                         <p>
                             To liczba dni w miesiącu, która stanowi podstawę do wyliczenia etatu (normy godzinowej). 
                             System automatycznie wylicza dni robocze (bez weekendów i świąt), ale pozwala na ręczną korektę.
                         </p>
                     </div>

                     <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Narzędzie w Prawym Górnym Rogu</span>
                         <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm scale-125 origin-center my-4">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Dni robocze:</span>
                             <span className="w-8 text-center bg-transparent border-b border-emerald-500 text-emerald-600 font-bold text-xs p-0">20</span>
                             <span className="text-[10px] text-slate-400 font-bold">dni</span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-sm mt-2">
                            Kliknij w liczbę i wpisz właściwą wartość. System przeliczy normę (np. 20 dni * 8h = 160h) i zaktualizuje kolory w podsumowaniu.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                             <div className="font-bold text-emerald-800 text-lg">160h</div>
                             <div className="text-xs text-emerald-600 font-medium">Norma Wyrobiona</div>
                             <p className="text-[10px] text-emerald-600/70 mt-1">Kolor Zielony</p>
                         </div>
                         <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-100">
                             <div className="font-bold text-rose-800 text-lg">152h</div>
                             <div className="text-xs text-rose-600 font-medium">Brakuje Godzin</div>
                             <p className="text-[10px] text-rose-600/70 mt-1">Kolor Czerwony</p>
                         </div>
                     </div>
                 </div>
             );
          case 'print':
              return (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4">
                          <div className="bg-slate-100 p-4 rounded-full">
                              <Printer className="w-8 h-8 text-slate-600" />
                          </div>
                          <div>
                              <h3 className="font-bold text-lg text-slate-800">Drukowanie Raportu</h3>
                              <p className="text-slate-500 text-sm">Generowanie PDF lub wydruk fizyczny.</p>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">1</span>
                              <span className="text-sm text-slate-700">Wybierz widok (Tydzień lub Miesiąc).</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">2</span>
                               <span className="text-sm text-slate-700">Kliknij ikonę drukarki w prawym górnym rogu.</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">3</span>
                               <span className="text-sm text-slate-700">W oknie drukowania wybierz orientację <strong className="text-slate-900">Poziomą (Landscape)</strong>.</span>
                          </div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                          <p className="text-xs text-slate-500 italic">
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sidebar Navigation */}
        <div className="w-72 bg-slate-50 border-r border-slate-100 flex flex-col flex-shrink-0">
            <div className="p-6 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3 text-brand-700">
                    <h2 className="font-bold text-xl tracking-tight text-slate-800">Instrukcja</h2>
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
                                    ? "bg-white text-brand-700 shadow-sm border border-slate-100" 
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn("w-4 h-4", activeSection === item.id ? "text-brand-500" : "text-slate-400")} />
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
            <div className="p-4 text-center border-t border-slate-100">
               <p className="text-[10px] text-slate-400">Wersja 1.0.1</p>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 z-10 w-full flex justify-end pointer-events-none">
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors pointer-events-auto"
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
