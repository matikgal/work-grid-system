import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getWeekOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ViewMode } from '../../../types';

interface ScheduleHeaderLeftProps {
  currentDate: Date;
  viewMode: ViewMode;
  zoomLevel: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const ScheduleHeaderLeft: React.FC<ScheduleHeaderLeftProps> = ({
  currentDate,
  viewMode,
  zoomLevel,
  onPrev,
  onNext,
  onToday
}) => {
  return (
    <div className="flex items-center gap-1 md:gap-3" style={{ zoom: zoomLevel } as any}>
      <button onClick={onPrev} className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <div 
        className="text-center min-w-[100px] md:min-w-[120px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-1 transition-all active:scale-95 group/today"
        onClick={onToday}
        title="Powrót do dzisiaj"
      >
        <div className="flex flex-col items-center justify-center -space-y-0.5">
          <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-slate-100 capitalize whitespace-nowrap leading-tight group-hover/today:text-brand-600 dark:group-hover/today:text-brand-400">
            {viewMode === 'week' ? (
              <>{format(currentDate, 'LLLL', { locale: pl })} <span className="text-slate-400 dark:text-slate-500 font-normal">Tydz. {getWeekOfMonth(currentDate, { weekStartsOn: 1 })}</span></>
            ) : format(currentDate, 'LLLL yyyy', { locale: pl })}
          </h2>
          <span className="text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500 lowercase">
            {viewMode === 'week' ? (
              `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: pl })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: pl })}`
            ) : (
              `${format(startOfMonth(currentDate), 'd', { locale: pl })} - ${format(endOfMonth(currentDate), 'd MMM', { locale: pl })}`
            )}
          </span>
        </div>
      </div>
      <button onClick={onNext} className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors">
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
};
