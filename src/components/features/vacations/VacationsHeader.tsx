import React from 'react';
import { Palmtree, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils';

interface VacationsHeaderProps {
  isLocked: boolean;
  onToggleLock: () => void;
  selectedYear: number;
  onYearChange: (newYear: number) => void;
}

export const VacationsHeader: React.FC<VacationsHeaderProps> = ({
  isLocked,
  onToggleLock,
  selectedYear,
  onYearChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Palmtree className="w-6 h-6 text-orange-500" />
                    Urlopy
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Podsumowanie wykorzystanych urlopów w roku</p>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
             <button
                onClick={onToggleLock}
                className={cn(
                    "p-2 rounded-lg transition-all border flex items-center gap-2 text-sm font-bold shadow-sm",
                    isLocked 
                        ? "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 ring-1 ring-orange-200 dark:ring-orange-800"
                )}
                title={isLocked ? "Odblokuj edycję" : "Zablokuj edycję"}
             >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="hidden md:inline">{isLocked ? "Zablokowane" : "Edycja"}</span>
             </button>

             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => onYearChange(selectedYear - 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-4 font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">{selectedYear}</span>
                <button onClick={() => onYearChange(selectedYear + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
             </div>
        </div>
    </div>
  );
};
