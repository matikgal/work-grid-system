import React from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { cn } from '../../../utils';

interface FreeSaturdaysHeaderProps {
  isLocked: boolean;
  onToggleLock: () => void;
  selectedYear: number;
  onYearChange: (newYear: number) => void;
}

export const FreeSaturdaysHeader: React.FC<FreeSaturdaysHeaderProps> = ({
  isLocked,
  onToggleLock,
  selectedYear,
  onYearChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4">
        <div className="flex items-center gap-4">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Wolne Soboty</h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Podsumowanie i rozliczenie roczne</p>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => onYearChange(selectedYear - 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-4 font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">{selectedYear}</span>
                <button onClick={() => onYearChange(selectedYear + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
             </div>

             <button 
                onClick={onToggleLock}
                className={cn(
                "flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium transition-all shadow-sm text-sm",
                !isLocked ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500"
                )}
            >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="hidden md:inline">{isLocked ? "Zablokowany" : "Edycja włączona"}</span>
            </button>
        </div>
    </div>
  );
};
