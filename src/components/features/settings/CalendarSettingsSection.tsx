import React from 'react';
import { CalendarCheck, CaretDown, Check } from '@phosphor-icons/react';
import { cn } from '../../../utils';

interface CalendarSettingsSectionProps {
  viewMode: 'week' | 'month';
  setViewMode: (mode: 'week' | 'month') => void;
  showWeekends: boolean;
  setShowWeekends: (show: boolean) => void;
  isViewSelectOpen: boolean;
  setIsViewSelectOpen: (open: boolean) => void;
}

export const CalendarSettingsSection: React.FC<CalendarSettingsSectionProps> = ({ 
  viewMode, 
  setViewMode, 
  showWeekends, 
  setShowWeekends,
  isViewSelectOpen,
  setIsViewSelectOpen
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <CalendarCheck className="w-6 h-6" weight="duotone" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kalendarz</h2>
                <p className="text-xs text-gray-400 font-medium">Opcje wyświetlania grafiku</p>
            </div>
        </div>

        <div className="space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors bg-gray-50/50 dark:bg-slate-950/30 gap-4">
                <div className="space-y-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">Domyślny widok</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Widok otwierany przy starcie grafiku.</span>
                </div>
                <div className="relative w-full md:w-auto">
                    <button 
                        onClick={() => setIsViewSelectOpen(!isViewSelectOpen)}
                        className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 w-full md:min-w-[200px] justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <span>{viewMode === 'week' ? 'Widok Tygodniowy' : 'Widok Miesięczny'}</span>
                        <CaretDown className="w-4 h-4 text-gray-400" weight="bold" />
                    </button>
                    
                    {isViewSelectOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsViewSelectOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                                {[
                                    { value: 'week', label: 'Widok Tygodniowy' },
                                    { value: 'month', label: 'Widok Miesięczny' }
                                ].map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => {
                                            setViewMode(opt.value as any);
                                            setIsViewSelectOpen(false);
                                        }}
                                        className={cn(
                                            "px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between rounded-lg transition-colors",
                                            viewMode === opt.value
                                                ? "bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium"
                                        )}
                                    >
                                        {opt.label}
                                        {viewMode === opt.value && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" weight="bold" />}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div onClick={() => setShowWeekends(!showWeekends)} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors bg-gray-50/50 dark:bg-slate-950/30 cursor-pointer gap-4 group">
                <div className="space-y-1">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Pokazuj weekendy</span>
                        {!showWeekends && <span className="text-[10px] bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ukryte</span>}
                     </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Uwzględnij soboty i niedziele w widoku grafiku.</span>
                </div>
                <div className={cn("w-14 h-8 bg-gray-200 dark:bg-slate-800 rounded-full relative transition-colors duration-300", showWeekends ? "bg-brand-600 dark:bg-brand-500" : "")}>
                    <div className={cn("absolute top-[4px] left-[4px] bg-white rounded-full h-6 w-6 transition-transform duration-300 shadow-md", showWeekends ? "translate-x-6" : "")}></div>
                </div>
            </div>
        </div>
    </section>
  );
};
