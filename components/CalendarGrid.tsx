import React, { useMemo, useState } from 'react';
import { format, getDay, isToday, getMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ArrowDownAZ, Briefcase } from 'lucide-react';
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
  // Sorting state
  const [sortBy, setSortBy] = useState<'name' | 'role'>('name');

  // Initialize holidays for Poland
  const hd = useMemo(() => new Holidays('PL', { languages: ['pl'] }), []);
  
  // OPTIMIZATION: pre-calculate holiday info for days
  const daysInfo = useMemo(() => {
    return days.map((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const isWeekend = getDay(day) === 0 || getDay(day) === 6;
      const nextDay = days[index + 1];
      const isMonthChange = nextDay && getMonth(day) !== getMonth(nextDay);
      
      const holidayResult = hd.isHoliday(day);
      const holiday = Array.isArray(holidayResult) ? holidayResult[0] : (holidayResult || null);
      
      return {
        dateStr,
        day,
        isWeekend,
        isMonthChange,
        holiday,
        isHolidayDay: Boolean(holiday)
      };
    });
  }, [days, hd]);

  // OPTIMIZATION: Create a lookup map for shifts to avoid .find() in render loop
  const shiftsLookup = useMemo(() => {
    const lookup: Record<string, Shift> = {};
    shifts.forEach(shift => {
      lookup[`${shift.employeeId}-${shift.date}`] = shift;
    });
    return lookup;
  }, [shifts]);

  // OPTIMIZATION: Pre-calculate daily stats
  const dailyStatsLookup = useMemo(() => {
    const stats: Record<string, { count: number, hours: number }> = {};
    days.forEach(d => {
      stats[format(d, 'yyyy-MM-dd')] = { count: 0, hours: 0 };
    });
    shifts.forEach(s => {
      if (stats[s.date]) {
        stats[s.date].count += 1;
        stats[s.date].hours += s.duration;
      }
    });
    return stats;
  }, [shifts, days]);

  // Sort employees
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const roleComparison = a.role.localeCompare(b.role);
        if (roleComparison !== 0) return roleComparison;
        return a.name.localeCompare(b.name);
      }
    });
  }, [employees, sortBy]);

  // Dynamic column width based on view mode
  const colWidthClass = viewMode === 'week' ? 'min-w-[140px] flex-1' : 'flex-1 min-w-0 overflow-hidden';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar h-full">
      <div className={cn(viewMode === 'week' ? "min-w-max w-full" : "w-full min-w-0")}>
        {/* Header Row */}
        <div className="flex sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
          <div className="w-28 md:w-64 sticky left-0 z-30 bg-white border-r border-slate-200 p-2 md:p-4 font-bold text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 text-sm md:text-base">
            <span className="truncate">Pracownik</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
               <button 
                onClick={() => setSortBy('name')}
                className={cn(
                  "p-1 rounded hover:bg-white hover:shadow-sm transition-all",
                  sortBy === 'name' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400"
                )}
                title="Sortuj alfabetycznie"
               >
                 <ArrowDownAZ size={14} />
               </button>
               <button 
                onClick={() => setSortBy('role')}
                className={cn(
                  "p-1 rounded hover:bg-white hover:shadow-sm transition-all",
                  sortBy === 'role' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400"
                )}
                title="Sortuj po stanowisku"
               >
                 <Briefcase size={14} />
               </button>
            </div>
          </div>
          <div className="flex flex-1 w-0">
            {daysInfo.map(({ day, dateStr, isWeekend, isMonthChange, holiday, isHolidayDay }) => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    colWidthClass,
                    "p-2 text-center flex flex-col justify-center transition-all relative group/header",
                    isMonthChange ? "border-r-[3px] border-r-slate-300" : "border-r border-slate-100",
                    isHolidayDay ? "bg-amber-50/70" : (isWeekend ? "bg-slate-50/80" : "bg-white"),
                    isToday(day) ? "bg-blue-50/50" : ""
                  )}
                  title={holiday ? holiday.name : undefined}
                >
                  <span className={cn(
                    "uppercase font-bold tracking-wide block truncate",
                    viewMode === 'week' ? "text-xs" : "text-[10px]",
                    isToday(day) ? "text-brand-600" : (isHolidayDay ? "text-amber-600" : "text-slate-400")
                  )}>
                    {viewMode === 'week' 
                      ? format(day, 'EEE', { locale: pl })
                      : format(day, 'EEEEEE', { locale: pl })
                    }
                  </span>
                  <span className={cn(
                    "font-bold block truncate",
                    viewMode === 'week' ? "text-lg" : "text-sm",
                    isToday(day) ? "text-brand-700" : "text-slate-700"
                  )}>
                    {viewMode === 'week' 
                      ? format(day, 'd MMM', { locale: pl }) 
                      : format(day, 'd')
                    }
                  </span>
                  {holiday && viewMode === 'week' && (
                    <span className="block truncate font-medium text-amber-600/80 text-[10px] mt-1">
                       ({holiday.name})
                    </span>
                  )}
                </div>
            ))}
            {viewMode === 'month' && (
              <div className="w-[100px] shrink-0 p-2 text-center flex flex-col justify-center border-l-2 border-l-slate-200 bg-slate-50/80 font-bold text-slate-700 text-xs uppercase tracking-wider">
                Suma
              </div>
            )}
          </div>
        </div>

        {/* Body Rows */}
        <div>
          {sortedEmployees.map((emp, idx) => {
            const isAltRow = idx % 2 !== 0;
            const rowBaseClass = isAltRow ? "bg-slate-50" : "bg-white";

            return (
              <div 
                key={emp.id} 
                className={cn(
                  "flex group transition-colors",
                  viewMode === 'week' ? "h-24" : "h-14",
                  rowBaseClass
                )}
              >
                {/* Employee Name Column */}
                <div className={cn(
                  "w-28 md:w-64 sticky left-0 z-10 border-r border-slate-200 border-b border-slate-100 p-2 md:p-3 flex items-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0",
                  rowBaseClass,
                  "group-hover:bg-white transition-colors"
                )}>
                   <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 md:mr-3 shrink-0",
                      emp.avatarColor
                    )}>
                      {emp.name.substring(0, 1)}
                   </div>
                   <div className="overflow-hidden min-w-0">
                     <div className="text-sm font-medium text-slate-700 truncate">{emp.name}</div>
                     <div className="text-xs text-slate-400 truncate hidden md:block">{emp.role}</div>
                   </div>
                </div>

                {/* Days Columns */}
                <div className="flex flex-1 w-0">
                  {daysInfo.map(({ dateStr, isWeekend, isMonthChange, isHolidayDay }) => {
                    const shift = shiftsLookup[`${emp.id}-${dateStr}`];

                    return (
                      <div 
                        key={`${emp.id}-${dateStr}`}
                        onClick={() => onSlotClick(emp.id, dateStr, shift)}
                        className={cn(
                          colWidthClass,
                          "relative transition-all duration-200 cursor-pointer p-0.5 border-b border-slate-100 h-full",
                          viewMode === 'week' ? "p-1.5" : "",
                          isMonthChange ? "border-r-[3px] border-r-slate-300" : "border-r border-slate-100",
                          isHolidayDay 
                            ? "bg-amber-50/30 group-hover:bg-amber-50/50" 
                            : (isWeekend 
                                ? "bg-slate-50/50 group-hover:bg-slate-50/50" 
                                : "group-hover:bg-slate-50/30"),
                          !shift && "hover:bg-slate-100"
                        )}
                      >
                        {shift ? (
                          <div className={cn(
                            "w-full h-full rounded flex flex-col justify-center items-center shadow-sm border transition-transform hover:-translate-y-0.5",
                            viewMode === 'month' ? "text-[10px] leading-none" : "",
                            shift.type === 'vacation' ? "bg-rose-100 border-rose-300 text-rose-800" :
                            shift.type === 'dayoff' ? "bg-slate-100 border-slate-300 text-slate-500" :
                            getShiftStyle(shift.startTime)
                          )}>
                            {/* VACATION RENDER */}
                            {shift.type === 'vacation' ? (
                              viewMode === 'week' ? (
                                <>
                                  <div className="text-xs font-black tracking-widest opacity-90">URLOP</div>
                                  <div className="text-[10px] font-medium opacity-80 mt-1">8h</div>
                                </>
                              ) : (
                                <span className="font-bold">U</span>
                              )
                            ) 
                            /* DAYOFF RENDER */
                            : shift.type === 'dayoff' ? (
                              viewMode === 'week' ? (
                                <div className="text-[10px] font-bold text-center leading-tight">WOLNA<br/>SOBOTA</div>
                              ) : (
                                <span className="font-bold text-[9px]">-</span>
                              )
                            ) 
                            /* WORK SHIFT RENDER */
                            : (
                              viewMode === 'week' ? (
                                <>
                                  <div className="text-xs font-bold opacity-90">{shift.startTime} - {shift.endTime}</div>
                                  <div className="text-xs font-medium opacity-80 mt-1">{shift.duration}h</div>
                                </>
                              ) : (
                                <>
                                  <div className="font-bold">{shift.startTime}</div>
                                  <div className="opacity-75 font-medium">{shift.endTime}</div>
                                </>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className={cn(
                              "rounded-full bg-slate-200 text-slate-400 flex items-center justify-center",
                              viewMode === 'week' ? "w-6 h-6" : "w-4 h-4"
                            )}>
                              <span className={cn("leading-none", viewMode === 'week' ? "text-lg mb-0.5" : "text-sm")}>+</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {viewMode === 'month' && (() => {
                    // Calculate summary for this employee in the visible (monthly) view
                    let totalHours = 0;
                    let vacationDays = 0;
                    daysInfo.forEach(d => {
                       const s = shiftsLookup[`${emp.id}-${d.dateStr}`];
                       if (s) {
                         totalHours += s.duration;
                         if (s.type === 'vacation') vacationDays++;
                       }
                    });

                    return (
                      <div className="w-[100px] shrink-0 border-l-2 border-l-slate-200 bg-slate-50/30 flex flex-col justify-center items-center p-2 text-xs border-b border-b-slate-100 h-full">
                        <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                           {totalHours}h
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded-full mt-1 border border-rose-100">
                           Urlopy: {vacationDays}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Row (Daily Totals) */}
        <div className="flex sticky bottom-0 z-20 bg-slate-50 border-t border-slate-200 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.1)]">
          <div className="w-28 md:w-64 sticky left-0 z-30 bg-slate-50 border-r border-slate-200 p-2 md:p-3 flex flex-col justify-center shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
             <span className="text-[10px] md:text-xs font-bold uppercase text-slate-400 tracking-wider">Razem Doba</span>
          </div>
          <div className="flex flex-1 w-0">
            {daysInfo.map(({ dateStr, isWeekend, isMonthChange, isHolidayDay }) => {
              const stats = dailyStatsLookup[dateStr] || { count: 0, hours: 0 };
              
              return (
                <div 
                  key={`footer-${dateStr}`}
                  className={cn(
                    colWidthClass,
                    "text-center flex flex-col justify-center",
                    viewMode === 'week' ? "p-3" : "py-2 px-0.5",
                    isMonthChange ? "border-r-[3px] border-r-slate-300" : "border-r border-slate-200",
                    isHolidayDay ? "bg-amber-50/50" : (isWeekend ? "bg-slate-100" : "bg-slate-50")
                  )}
                >
                  {stats.count > 0 ? (
                    <span className={cn(
                      "font-bold", 
                      viewMode === 'week' ? "text-sm" : "text-[10px]",
                      stats.count === employees.length ? "text-emerald-600" : "text-rose-500"
                    )}>
                      {stats.count}/{employees.length}
                    </span>
                  ) : (
                    <span className="text-slate-300 font-medium">-</span>
                  )}
                </div>
              );
            })}
            {viewMode === 'month' && (
              <div className="w-[100px] shrink-0 border-l-2 border-l-slate-200 bg-slate-100 border-t border-t-slate-200">
                {/* Empty footer cell for alignment */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
