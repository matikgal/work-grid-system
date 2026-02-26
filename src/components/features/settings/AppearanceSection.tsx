import React from 'react';
import { Palette, Sun, Moon, Desktop } from '@phosphor-icons/react';
import { cn } from '../../../utils';
import { Theme } from '../../../context/ThemeContext';

interface AppearanceSectionProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isCompactMode: boolean;
  setIsCompactMode: (isCompact: boolean) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ theme, setTheme, isCompactMode, setIsCompactMode }) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Palette className="w-6 h-6" weight="duotone" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wygląd i Motyw</h2>
                <p className="text-xs text-gray-400 font-medium">Personalizacja interfejsu</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Motyw */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Wybierz motyw</label>
                <div className="grid grid-cols-3 gap-3">
                     {[
                        { id: 'light', label: 'Jasny', icon: Sun },
                        { id: 'dark', label: 'Ciemny', icon: Moon },
                        { id: 'system', label: 'System', icon: Desktop },
                     ].map((opt) => (
                         <button
                            key={opt.id}
                            onClick={() => setTheme(opt.id as Theme)}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-3",
                                theme === opt.id 
                                  ? "bg-brand-50/50 border-brand-500 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400 shadow-sm" 
                                  : "bg-white border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100/80 hover:text-gray-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                            )}
                         >
                             <opt.icon className="w-6 h-6" weight={theme === opt.id ? "fill" : "regular"} />
                             <span className="text-xs font-bold">{opt.label}</span>
                         </button>
                     ))}
                </div>
            </div>

            {/* Gęstość */}
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Gęstość interfejsu</label>
                 <div className="bg-gray-100 dark:bg-slate-950 p-1.5 rounded-xl flex">
                    {[
                        { id: 'comfortable', label: 'Standardowa' },
                        { id: 'compact', label: 'Kompaktowa' }
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setIsCompactMode(opt.id === 'compact')}
                            className={cn(
                                "flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all",
                                (isCompactMode ? 'compact' : 'comfortable') === opt.id
                                    ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md"
                                    : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                 </div>
                 <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Tryb kompaktowy mieści więcej informacji na ekranie, zmniejszając odstępy w tabelach.
                 </p>
            </div>
        </div>
    </section>
  );
};
