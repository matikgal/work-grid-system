import React, { useState } from 'react';
import { X, Settings, Palette, Type, Monitor, Moon, Sun, LayoutGrid, Calendar, Bell, Download, Database, Check } from 'lucide-react';
import { cn } from '../utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Local state for UI interactivity (mock settings)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [defaultView, setDefaultView] = useState<'week' | 'month'>('week');
  const [showWeekends, setShowWeekends] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [browserNotifs, setBrowserNotifs] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                    <Settings className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-xl text-slate-800">Ustawienia</h2>
                    <p className="text-xs text-slate-500">Dostosuj aplikację do swoich potrzeb</p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Sekcja: Wygląd */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Palette className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Wygląd i Motyw</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Motyw */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Wybierz motyw</label>
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
                                          ? "bg-brand-50 border-brand-200 text-brand-700 ring-1 ring-brand-200" 
                                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
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
                        <label className="text-sm font-semibold text-slate-700">Gęstość interfejsu</label>
                         <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex">
                            {[
                                { id: 'comfortable', label: 'Standardowa' },
                                { id: 'compact', label: 'Kompaktowa' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setDensity(opt.id as any)}
                                    className={cn(
                                        "flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all",
                                        density === opt.id
                                            ? "bg-white text-slate-800 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
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
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ustawienia Kalendarza</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
                        <div className="space-y-0.5">
                            <span className="text-sm font-semibold text-slate-700 block">Domyślny widok</span>
                            <span className="text-xs text-slate-500 block">Widok otwierany przy starcie aplikacji.</span>
                        </div>
                        <select 
                            value={defaultView}
                            onChange={(e) => setDefaultView(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none"
                        >
                            <option value="week">Widok Tygodniowy</option>
                            <option value="month">Widok Miesięczny</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white cursor-pointer" onClick={() => setShowWeekends(!showWeekends)}>
                        <div className="space-y-0.5">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700">Pokazuj weekendy</span>
                                {!showWeekends && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">Ukryte</span>}
                             </div>
                            <span className="text-xs text-slate-500 block">Uwzględnij soboty i niedziele w widoku.</span>
                        </div>
                        <div className={cn("w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full relative transition-colors", showWeekends ? "bg-brand-600" : "")}>
                            <div className={cn("absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform", showWeekends ? "translate-x-full border-white" : "")}></div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Sekcja: Dane i Eksport */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Database className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dane i Eksport</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group">
                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg shrink-0 group-hover:bg-emerald-200 transition-colors">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700 block">Eksportuj do PDF</span>
                            <span className="text-xs text-slate-500 mt-1 block">Pobierz aktualny widok grafiku jako plik do druku.</span>
                        </div>
                    </button>
                    
                     <button className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left group opacity-60 cursor-not-allowed" title="Funkcja niedostępna">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg shrink-0">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-slate-700 block">Eksport do Excel</span>
                            <span className="text-xs text-slate-500 mt-1 block">Pobierz dane w formacie .xlsx (Wkrótce).</span>
                        </div>
                    </button>
                </div>
            </section>

             {/* Sekcja: Inne (Powiadomienia) */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Bell className="w-4 h-4 text-brand-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Powiadomienia</h3>
                </div>

                <div className="space-y-2">
                     <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                             <input type="checkbox" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4" />
                             <span className="text-sm text-slate-700">Powiadomienia e-mail o zmianach</span>
                        </div>
                     </label>
                     <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2">
                             <input type="checkbox" checked={browserNotifs} onChange={() => setBrowserNotifs(!browserNotifs)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4" />
                             <span className="text-sm text-slate-700">Powiadomienia w przeglądarce</span>
                        </div>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Aktywne</span>
                     </label>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
             <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors text-sm"
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
