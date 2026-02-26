import React from 'react';
import { Database, DownloadSimple, SquaresFour } from '@phosphor-icons/react';
import { cn } from '../../../utils';

interface DataExportSectionProps {
  isBackingUp: boolean;
  onBackup: () => void;
}

export const DataExportSection: React.FC<DataExportSectionProps> = ({ isBackingUp, onBackup }) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                <Database className="w-6 h-6" weight="duotone" />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dane i Eksport</h2>
                 <p className="text-xs text-gray-400 font-medium">Zarządzanie kopiami zapasowymi</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-950/20">
                <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <DownloadSimple className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Eksportuj do PDF</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium">Zapisz grafik jako plik do druku.</span>
                </div>
            </button>
            
             <button className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-950/20 opacity-60 cursor-not-allowed">
                <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl shrink-0">
                    <SquaresFour className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block">Eksport do Excel</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium">Wkrótce... format .xlsx</span>
                </div>
            </button>

            <button 
                onClick={onBackup}
                disabled={isBackingUp}
                className={cn(
                    "flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-950/20 col-span-1 md:col-span-2",
                    isBackingUp && "opacity-70 cursor-wait"
                )}
            >
                <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <Database className="w-6 h-6" weight="duotone" />
                </div>
                <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {isBackingUp ? 'Pobieranie danych...' : 'Pełna Kopia Zapasowa (JSON)'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium leading-relaxed max-w-lg">
                        Generuje kompletny zrzut bazy danych (pracownicy, grafiki, zamówienia, urlopy) w formacie JSON. Używaj regularnie.
                    </span>
                </div>
            </button>
        </div>
    </section>
  );
};
