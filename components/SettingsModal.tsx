import React, { useState } from 'react';
import { X, Settings, Palette, Type, Monitor, Moon, Sun, LayoutGrid, Calendar, Bell, Download, Database, Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import { useTheme } from '../context/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  isCompactMode: boolean;
  onCompactModeChange: (mode: boolean) => void;
  showWeekends: boolean;
  onShowWeekendsChange: (show: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose,
    viewMode,
    onViewModeChange,
    isCompactMode,
    onCompactModeChange,
    showWeekends,
    onShowWeekendsChange
}) => {
  const { theme, setTheme } = useTheme();
  
  // Local state for notifications only as they are not yet implemented globally
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [browserNotifs, setBrowserNotifs] = useState(true);
  const [isViewSelectOpen, setIsViewSelectOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-400">
                    <Settings className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Ustawienia</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Dostosuj aplikację do swoich potrzeb</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Sekcja: Wygląd */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Palette className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Wygląd i Motyw</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Motyw */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Wybierz motyw</label>
                        <div className="grid grid-cols-3 gap-2">
                             {[
                                { id: 'light', label: 'Jasny', icon: Sun },
                                { id: 'dark', label: 'Ciemny', icon: Moon },
                                { id: 'system', label: 'System', icon: Monitor },
                             ].map((opt) => (
                                 <button
                                    key={opt.id}
                                    onClick={() => setTheme(opt.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                        theme === opt.id 
                                          ? "bg-brand-50 border-brand-200 text-brand-700 ring-1 ring-brand-200 dark:bg-brand-900/20 dark:border-brand-500/50 dark:text-brand-400" 
                                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                                    )}
                                 >
                                     <opt.icon className="w-5 h-5" />
                                     <span className="text-xs font-medium">{opt.label}</span>
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Gęstość */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gęstość interfejsu</label>
                         <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex">
                            {[
                                { id: 'comfortable', label: 'Standardowa' },
                                { id: 'compact', label: 'Kompaktowa' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => onCompactModeChange(opt.id === 'compact')}
                                    className={cn(
                                        "flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all",
                                        (isCompactMode ? 'compact' : 'comfortable') === opt.id
                                            ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                         </div>
                         <p className="text-[10px] text-slate-400 leading-tight">
                            Tryb kompaktowy mieści więcej informacji na ekranie, zmniejszając odstępy.
                         </p>
                    </div>
                </div>
            </section>

            {/* Sekcja: Kalendarz */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Ustawienia Kalendarza</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-800/50">
                        <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">Domyślny widok</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Widok otwierany przy starcie aplikacji.</span>
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setIsViewSelectOpen(!isViewSelectOpen)}
                                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg px-3 py-2 min-w-[180px] justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span>{viewMode === 'week' ? 'Widok Tygodniowy' : 'Widok Miesięczny'}</span>
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </button>
                            
                            {isViewSelectOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsViewSelectOpen(false)} />
                                    <div className="absolute top-full right-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                        {[
                                            { value: 'week', label: 'Widok Tygodniowy' },
                                            { value: 'month', label: 'Widok Miesięczny' }
                                        ].map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    onViewModeChange(opt.value as any);
                                                    setIsViewSelectOpen(false);
                                                }}
                                                className={cn(
                                                    "px-3 py-2 text-sm cursor-pointer flex items-center justify-between",
                                                    viewMode === opt.value
                                                        ? "bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-medium"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                )}
                                            >
                                                {opt.label}
                                                {viewMode === opt.value && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-800/50 cursor-pointer" onClick={() => onShowWeekendsChange(!showWeekends)}>
                        <div className="space-y-0.5">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pokazuj weekendy</span>
                                {!showWeekends && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">Ukryte</span>}
                             </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block">Uwzględnij soboty i niedziele w widoku.</span>
                        </div>
                        <div className={cn("w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full relative transition-colors", showWeekends ? "bg-brand-600 dark:bg-brand-500" : "")}>
                            <div className={cn("absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-sm", showWeekends ? "translate-x-full" : "")}></div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Sekcja: Dane i Eksport */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Dane i Eksport</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-800/20">
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/30 transition-colors">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Eksportuj do PDF</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Pobierz aktualny widok grafiku jako plik do druku.</span>
                        </div>
                    </button>
                    
                     <button className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group opacity-60 cursor-not-allowed bg-white dark:bg-slate-800/20" title="Funkcja niedostępna">
                        <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-2 rounded-lg shrink-0">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Eksport do Excel</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Pobierz dane w formacie .xlsx (Wkrótce).</span>
                        </div>
                    </button>
                </div>
            </section>

             {/* Sekcja: Inne (Powiadomienia) */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Powiadomienia</h3>
                </div>

                <div className="space-y-2">
                     <div 
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                     >
                        <div className="flex items-center gap-3">
                             <div className={cn(
                                 "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                 emailNotifs 
                                    ? "bg-brand-600 border-brand-600 text-white" 
                                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-brand-400 dark:group-hover:border-brand-500"
                             )}>
                                 {emailNotifs && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                             </div>
                             <span className="text-sm text-slate-700 dark:text-slate-300">Powiadomienia e-mail o zmianach</span>
                        </div>
                     </div>

                     <div 
                        onClick={() => setBrowserNotifs(!browserNotifs)}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                     >
                        <div className="flex items-center gap-3">
                             <div className={cn(
                                 "w-5 h-5 rounded border flex items-center justify-center transition-all",
                                 browserNotifs 
                                    ? "bg-brand-600 border-brand-600 text-white" 
                                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-brand-400 dark:group-hover:border-brand-500"
                             )}>
                                 {browserNotifs && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                             </div>
                             <span className="text-sm text-slate-700 dark:text-slate-300">Powiadomienia w przeglądarce</span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-500/20">Aktywne</span>
                     </div>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
             <button
                onClick={onClose}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors text-sm"
             >
                Anuluj
             </button>
             <button
                onClick={onClose}
                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2"
             >
                <Check className="w-4 h-4" />
                Zapisz zmiany
             </button>
        </div>
      </div>
    </div>
  );
};
