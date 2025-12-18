import React from 'react';
import { format, getDay, isToday } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Employee, Shift, ViewMode } from '../types';
import { getShiftStyle, cn } from '../utils';

interface CalendarGridProps {
  days: Date[];
  employees: Employee[];
  shifts: Shift[];
  viewMode: ViewMode;
  onSlotClick: (employeeId: string, date: string, shift?: Shift) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, employees, shifts, viewMode, onSlotClick }) => {
  
  // Calculate daily totals (footer)
  const getDailyStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daysShifts = shifts.filter(s => s.date === dateStr);
    const totalHours = daysShifts.reduce((acc, curr) => acc + curr.duration, 0);
    return { count: daysShifts.length, hours: totalHours };
  };

  // Dynamic column width based on view mode
  // Week view: Larger columns (flex-1 or fixed large width). Month view: Fixed smaller width.
  const colWidthClass = viewMode === 'week' ? 'min-w-[140px] flex-1' : 'w-28 flex-shrink-0';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar">
      <div className={cn("min-w-max", viewMode === 'week' ? "w-full" : "")}>
        {/* Header Row */}
        <div className="flex sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
          <div className="w-64 sticky left-0 z-30 bg-white border-r border-slate-200 p-4 font-bold text-slate-700 flex items-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
            Pracownik
          </div>
          <div className="flex flex-1">
            {days.map((day) => {
              const isWeekend = getDay(day) === 0 || getDay(day) === 6;
              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    colWidthClass,
                    "p-3 text-center border-r border-slate-100 flex flex-col justify-center transition-all",
                    isWeekend ? "bg-slate-50/80" : "bg-white",
                    isToday(day) ? "bg-blue-50/50" : ""
                  )}
                >
                  <span className={cn("text-xs uppercase font-bold tracking-wide", isToday(day) ? "text-brand-600" : "text-slate-400")}>
                    {format(day, 'EEE', { locale: pl })}
                  </span>
                  <span className={cn("text-lg font-bold", isToday(day) ? "text-brand-700" : "text-slate-700")}>
                    {format(day, 'd MMM')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Rows */}
        <div>
          {employees.map((emp) => (
            <div key={emp.id} className="flex group hover:bg-white transition-colors">
              {/* Employee Name Column */}
              <div className="w-64 sticky left-0 z-10 bg-slate-50 group-hover:bg-white border-r border-slate-200 border-b border-slate-100 p-3 flex items-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
                 <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3",
                    emp.avatarColor
                  )}>
                    {emp.name.substring(0, 1)}
                 </div>
                 <div className="overflow-hidden">
                   <div className="text-sm font-medium text-slate-700 truncate">{emp.name}</div>
                   <div className="text-xs text-slate-400 truncate">{emp.role}</div>
                 </div>
              </div>

              {/* Days Columns */}
              <div className="flex flex-1">
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                  const shift = shifts.find(s => s.employeeId === emp.id && s.date === dateStr);

                  return (
                    <div 
                      key={`${emp.id}-${dateStr}`}
                      onClick={() => onSlotClick(emp.id, dateStr, shift)}
                      className={cn(
                        colWidthClass,
                        "h-24 border-r border-b border-slate-100 relative transition-all duration-200 cursor-pointer p-1.5",
                        isWeekend ? "bg-slate-50/50 group-hover:bg-slate-50/50" : "group-hover:bg-slate-50/30",
                        !shift && "hover:bg-slate-100"
                      )}
                    >
                      {shift ? (
                        <div className={cn(
                          "w-full h-full rounded-lg p-2 flex flex-col justify-center items-center shadow-sm border transition-transform hover:-translate-y-0.5",
                          getShiftStyle(shift.startTime)
                        )}>
                          <div className="text-xs font-bold opacity-90">{shift.startTime} - {shift.endTime}</div>
                          <div className="text-xs font-medium opacity-80 mt-1">
                            {shift.duration}h
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                            <span className="text-lg leading-none mb-0.5">+</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Row (Daily Totals) */}
        <div className="flex sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.1)]">
          <div className="w-64 sticky left-0 z-30 bg-slate-50 border-r border-slate-200 p-3 flex flex-col justify-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
             <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Razem Doba</span>
          </div>
          <div className="flex flex-1">
            {days.map((day) => {
              const stats = getDailyStats(day);
              const isWeekend = getDay(day) === 0 || getDay(day) === 6;
              return (
                <div 
                  key={`footer-${day.toISOString()}`}
                  className={cn(
                    colWidthClass,
                    "p-3 text-center border-r border-slate-200 flex flex-col justify-center",
                    isWeekend ? "bg-slate-100" : "bg-slate-50"
                  )}
                >
                  {stats.count > 0 ? (
                    <>
                      <span className="text-sm font-bold text-slate-700">{stats.hours}h</span>
                      <span className="text-[10px] text-slate-400 font-medium">{stats.count} os.</span>
                    </>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
