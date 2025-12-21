import React, { useMemo, useState } from 'react';
import { format, getDay, isToday, getMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ArrowDownAZ, Briefcase, Info } from 'lucide-react';
import { Employee, Shift, ViewMode } from '../types';
import { getShiftStyle, cn, stringToColor } from '../utils';

interface CalendarGridProps {
  days: Date[];
  employees: Employee[];
  shifts: Shift[];
  viewMode: ViewMode;
  isCompactMode?: boolean;
  onSlotClick: (employeeId: string, date: string, shift?: Shift) => void;
  workingDaysCount?: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, employees, shifts, viewMode, isCompactMode = false, onSlotClick, workingDaysCount }) => {
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

  // OPTIMIZATION: Shift hours calculation helper
  const getShiftHours = (shift: Shift) => {
    if (shift.type === 'Urlop') return 8;
    if (shift.type === 'Wolna Sobota') return 0;
    // For other shifts, use stored duration, or default to 8 if duration is missing/0 but it's a work type?
    // User said "kazda inna zmiana to 8h". Let's assume if duration is 0 and it's not Wolna Sobota, it might be 8.
    // But safe bet is fallback to duration. 
    return shift.duration || 0;
  };

  // OPTIMIZATION: Pre-calculate daily stats
  const dailyStatsLookup = useMemo(() => {
    const stats: Record<string, { count: number, hours: number }> = {};
    days.forEach(d => {
      stats[format(d, 'yyyy-MM-dd')] = { count: 0, hours: 0 };
    });
    shifts.forEach(s => {
      if (stats[s.date]) {
        stats[s.date].count += 1;
        stats[s.date].hours += getShiftHours(s);
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

  // OPTIMIZATION: detailed working hours calculation for current view
  const targetMonthlyHours = useMemo(() => {
    if (viewMode !== 'month') return 0;
    
    if (workingDaysCount !== undefined && workingDaysCount > 0) {
        return workingDaysCount * 8;
    }
    
    return days.reduce((acc, day) => {
      const isWeekend = getDay(day) === 0 || getDay(day) === 6;
      // We can use the pre-calculated daysInfo for holiday check if indices match, but daysInfo is mapped from days.
      // Or just check hd here. hd is memoized.
      const isHoliday = hd.isHoliday(day);
      if (!isWeekend && !isHoliday) return acc + 8;
      return acc;
    }, 0);
  }, [days, hd, viewMode, workingDaysCount]);

  // OPTIMIZATION: Pre-calculate employee monthly stats using lookups instead of array filtering
  const employeeSummaryStats = useMemo(() => {
    // Only needed for month view where we show totals
    if (viewMode !== 'month') return {};
    
    const stats: Record<string, { totalHours: number, vacationDays: number }> = {};
    
    // We use the days displayed in the grid to calculate the monthly sum.
    // This matches the current logic where strict month view passes correct start/end of month.
    employees.forEach(emp => {
      let h = 0;
      let v = 0;
      
      daysInfo.forEach(info => {
        const shift = shiftsLookup[`${emp.id}-${info.dateStr}`];
        if (shift) {
            h += getShiftHours(shift);
            if (shift.type === 'Urlop') v++;
        }
      });
      
      stats[emp.id] = { totalHours: h, vacationDays: v };
    });
    
    return stats;
  }, [employees, daysInfo, shiftsLookup, viewMode]);

  // Dynamic column width based on view mode
  const colWidthClass = viewMode === 'week' ? 'min-w-[140px] flex-1' : 'flex-1 min-w-0 overflow-hidden';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 relative custom-scrollbar h-full calendar-grid">
      <div className={cn(viewMode === 'week' ? "min-w-max w-full" : "w-full min-w-0")}>
        {/* Header Row */}
        <div className="flex sticky top-0 z-20 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
          <div className={cn(
            "w-28 md:w-64 sticky left-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0",
            isCompactMode ? "p-1 md:p-2 text-xs" : "p-2 md:p-4 text-sm md:text-base"
          )}>
            <span className="truncate">Pracownik</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
               <button 
                onClick={() => setSortBy('name')}
                className={cn(
                  "p-1 rounded hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all",
                  sortBy === 'name' ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-slate-400 dark:text-slate-500"
                )}
                title="Sortuj alfabetycznie"
               >
                 <ArrowDownAZ size={14} />
               </button>
               <button 
                onClick={() => setSortBy('role')}
                className={cn(
                  "p-1 rounded hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all",
                  sortBy === 'role' ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm" : "text-slate-400 dark:text-slate-500"
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
                    "text-center flex flex-col justify-center transition-all relative group/header",
                    isCompactMode ? "p-0.5" : "p-2",
                    isMonthChange ? "border-r-[3px] border-r-slate-300 dark:border-r-slate-600" : "border-r border-slate-100 dark:border-slate-800",
                    isHolidayDay ? "bg-amber-50 dark:bg-amber-900/10" : (isWeekend ? "bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-900"),
                    isToday(day) ? "bg-blue-50/80 dark:bg-brand-900/10" : ""
                  )}
                >
                  <span className={cn(
                    "uppercase font-bold tracking-wide block truncate",
                    isCompactMode ? "text-[8px]" : (viewMode === 'week' ? "text-xs" : "text-[10px]"),
                    isToday(day) ? "text-brand-600 dark:text-brand-400" : (isHolidayDay ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500")
                  )}>
                    {isCompactMode 
                      ? format(day, 'EEEEE', { locale: pl })
                      : (viewMode === 'week' 
                          ? format(day, 'EEE', { locale: pl })
                          : format(day, 'EEEEEE', { locale: pl })
                        )
                    }
                  </span>
                  <span className={cn(
                    "font-bold block truncate",
                    isCompactMode ? "text-xs" : (viewMode === 'week' ? "text-xl mt-1 text-slate-800 dark:text-slate-200" : "text-sm text-slate-700 dark:text-slate-300"),
                    isToday(day) && "text-brand-600 dark:text-brand-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Holiday Indicator Icon */}
                  {isHolidayDay && (
                      <div className="absolute top-1 right-1 text-amber-500 opacity-70 group-hover/header:opacity-100 transition-opacity">
                          <Info size={isCompactMode ? 10 : 14} />
                          {/* Custom Tooltip */}
                          <div className="absolute top-full right-0 mt-2 w-max max-w-[150px] px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/header:opacity-100 group-hover/header:visible transition-all duration-200 z-[60] pointer-events-none text-center">
                                <div className="font-semibold">{holiday?.name}</div>
                          </div>
                      </div>
                  )}
                </div>
            ))}
            
            {/* Summary Column Header (ViewMode == Month only) */}
            {viewMode === 'month' && (
               <div className="w-20 md:w-24 sticky right-0 z-30 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-2 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 text-xs text-center leading-tight">
                   SUMA
               </div>
            )}
          </div>
        </div>

        {/* Body Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedEmployees.map((employee, index) => {
            // Get employee summary from pre-calculated lookup instead of on-the-fly filtering
            const stats = employeeSummaryStats[employee.id] || { totalHours: 0, vacationDays: 0 };
            const { totalHours, vacationDays } = stats;

                // Determine avatar styling
                const isTailwindClass = employee.avatarColor?.startsWith('bg-');
                const avatarStyle = isTailwindClass ? {} : { backgroundColor: employee.avatarColor || stringToColor(employee.name) };
                const avatarClass = isTailwindClass ? employee.avatarColor : undefined;
                
                const isEven = index % 2 === 0;

                return (
                <div key={employee.id} className={cn(
                  "flex group/row transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50", 
                  isCompactMode ? "h-10 text-xs" : "h-20",
                  isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                )}>
                  {/* Employee Header Cell */}
                  <div className={cn(
                      "w-28 md:w-64 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 p-2 md:p-3 flex items-center gap-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-all",
                      isCompactMode ? "py-1" : "",
                      isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"
                  )}>
                    <div 
                      className={cn(
                        "rounded-full flex items-center justify-center text-white font-bold shrink-0 transition-all", 
                        isCompactMode ? "w-6 h-6 text-[10px]" : "w-10 h-10 text-sm shadow-sm",
                        avatarClass
                      )} 
                      style={avatarStyle}
                    >
                      {employee.name.charAt(0)}
                    </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{employee.name}</div>
                  {!isCompactMode && <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{employee.role}</div>}
                </div>
              </div>
              
              {/* Shift Cells */}
              <div className="flex flex-1 w-0">
                {daysInfo.map(({ day, dateStr, isWeekend, isMonthChange, isHolidayDay }) => {
                  const shift = shiftsLookup[`${employee.id}-${dateStr}`];
                  const style = shift ? getShiftStyle(shift.type) : null;
                  
                  // Helper for displaying shift content
                  const getShiftContent = () => {
                    if (!shift) return null;

                    if (isCompactMode) {
                        let abbr = '';
                        if (shift.type === 'Wolna Sobota') abbr = 'WS';
                        else if (shift.type === 'Urlop') abbr = 'U';
                        else {
                             const start = parseInt(shift.startTime.split(':')[0]);
                             const end = parseInt(shift.endTime.split(':')[0]);
                             abbr = `${start}-${end}`;
                        }
                        return <span className={cn("font-bold", style?.text)}>{abbr}</span>;
                    }

                    if (viewMode === 'month') {
                        // Compact view for month mode
                        let abbr = '8';
                        if (shift.type === 'Wolna Sobota') abbr = 'WS';
                        if (shift.type === 'Urlop') abbr = 'URL';

                        const startH = shift.startTime.split(':')[0];
                        const endH = shift.endTime.split(':')[0];

                        return (
                            <div className="flex flex-col items-center justify-center leading-none">
                                <span className={cn("text-[10px] font-bold uppercase", style?.text)}>
                                    {abbr}
                                </span>
                                {shift.duration > 0 && (
                                    <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-300 mt-0.5">
                                        {startH}-{endH}
                                    </span>
                                )}
                            </div>
                        );
                    }

                    // Default Week View
                    return (
                        <>
                            <span className={cn("text-[10px] font-bold uppercase truncate w-full text-center", style?.text)}>
                                {shift.type}
                            </span>
                            {shift.duration > 0 && (
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 mt-0.5">
                                {shift.startTime}-{shift.endTime}
                                </span>
                            )}
                            {/* Duration Badge */}
                            <div className="absolute top-0 right-0 px-1 py-0.5 bg-white/50 text-[8px] font-bold text-slate-500 rounded-bl backdrop-blur-[1px]">
                                {shift.duration}h
                            </div>
                        </>
                    );
                  };

                  return (
                    <div 
                      key={dateStr}
                      onClick={() => onSlotClick(employee.id, dateStr, shift)}
                      className={cn(
                        colWidthClass,
                        "border-r relative transition-all cursor-pointer flex items-center justify-center p-0.5",
                        isMonthChange ? "border-r-[3px] border-r-slate-300 dark:border-r-slate-700" : "border-r-slate-100 dark:border-r-slate-800",
                        !shift && "group-hover/row:bg-slate-50/50 dark:group-hover/row:bg-slate-800/20 hover:!bg-slate-100 dark:hover:!bg-slate-800/80",
                        isWeekend && !shift && "bg-slate-50 dark:bg-slate-900",
                        isHolidayDay && !shift && "bg-amber-50/50 dark:bg-amber-900/10"
                      )}
                    >
                      {shift ? (
                        <div className={cn(
                          "w-full h-full rounded transition-all shadow-sm flex items-center justify-center overflow-hidden relative",
                          style?.bg, style?.border, "border",
                          isCompactMode ? "" : "flex-col p-1"
                        )}>
                           {getShiftContent()}
                        </div>
                      ) : (
                         /* Empty slot hover effect */
                         <div className="w-full h-full rounded hover:bg-slate-200/50 transition-colors" />
                      )}
                    </div>
                  );
                })}
                 
                 {/* Summary Column Logic (Updated for ViewMode==Month) */}
                {viewMode === 'month' && (
                  <div className={cn(
                      "w-20 md:w-24 sticky right-0 z-10 border-l border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-colors",
                      isCompactMode ? "py-1 text-xs" : "p-2 flex-col gap-1",
                      // Background logic based on norm
                      totalHours === targetMonthlyHours ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                  )}>
                       <div className="text-center flex flex-col items-center" title={`Norma: ${targetMonthlyHours}h`}>
                          <div className="font-bold leading-tight">
                              {totalHours}h
                              <span className="text-[10px] opacity-75 font-normal ml-1">
                                  / {parseFloat((totalHours / 8).toFixed(2))}d
                              </span>
                          </div>
                       </div>
                       {!isCompactMode && (
                        <div className="text-center" title="Dni urlopu">
                            <span className="text-[10px] font-medium text-amber-600 bg-white/50 px-1.5 py-0.5 rounded-full border border-amber-100/50">
                                {vacationDays}d url.
                            </span>
                        </div>
                       )}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
        
        {/* Footer Row (Totals) */}
        <div className="flex bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-400 sticky bottom-0 z-30 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.1)] h-10 md:h-12">
             <div className="w-28 md:w-64 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-3 text-right text-xs uppercase tracking-wider flex items-center justify-end shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
               Suma (1zm/2zm | obecni):
             </div>
             <div className="flex flex-1 w-0">
                {daysInfo.map(({ dateStr, isMonthChange }) => {
                  const shiftsForDay = shifts.filter(s => s.date === dateStr);
                  const count = shiftsForDay.length;
                  const isFullStaff = count === employees.length && count > 0;
                  
                  // Count specific shifts
                  const firstShiftCount = shiftsForDay.filter(s => s.startTime === '06:00').length;
                  const secondShiftCount = shiftsForDay.filter(s => s.startTime === '14:00').length;

                  return (
                    <div 
                      key={dateStr}
                      className={cn(
                        colWidthClass,
                        "h-full text-center text-[10px] md:text-xs flex items-center justify-center border-r border-slate-200 dark:border-slate-800 transition-colors",
                        isFullStaff ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400" : (count > 0 ? "bg-rose-50 text-rose-700 dark:bg-rose-900/10 dark:text-rose-400" : ""),
                        isMonthChange && "border-r-[3px] border-r-slate-300 dark:border-r-slate-700"
                      )}
                    >
                      {count > 0 ? (
                        <div className={cn(
                            "flex items-center justify-center",
                            viewMode === 'month' ? "flex-col gap-0.5" : "gap-1.5"
                        )}>
                            <span className={cn(
                                "font-bold", 
                                viewMode === 'month' ? "text-[11px] leading-none" : ""
                            )}>
                                {firstShiftCount}/{secondShiftCount}
                            </span>
                            
                            {viewMode !== 'month' && <span className="opacity-30">|</span>}
                            
                            <span className={cn(
                                "opacity-75",
                                viewMode === 'month' ? "text-[11px] leading-none font-normal" : ""
                            )}>
                                {count}/{employees.length}
                            </span>
                        </div>
                      ) : '-'}
                    </div>
                  );
                })}
               
                {viewMode === 'month' && (
                  <div className="w-20 md:w-24 sticky right-0 z-30 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    {employees.length} os.
                  </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};

export default CalendarGrid;
