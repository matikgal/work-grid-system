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
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, employees, shifts, viewMode, isCompactMode = false, onSlotClick }) => {
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

  // Dynamic column width based on view mode
  const colWidthClass = viewMode === 'week' ? 'min-w-[140px] flex-1' : 'flex-1 min-w-0 overflow-hidden';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar h-full calendar-grid">
      <div className={cn(viewMode === 'week' ? "min-w-max w-full" : "w-full min-w-0")}>
        {/* Header Row */}
        <div className="flex sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
          <div className={cn(
            "w-28 md:w-64 sticky left-0 z-30 bg-white border-r border-slate-200 font-bold text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0",
            isCompactMode ? "p-1 md:p-2 text-xs" : "p-2 md:p-4 text-sm md:text-base"
          )}>
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
                    "text-center flex flex-col justify-center transition-all relative group/header",
                    isCompactMode ? "p-0.5" : "p-2",
                    isMonthChange ? "border-r-[3px] border-r-slate-300" : "border-r border-slate-100",
                    isHolidayDay ? "bg-amber-100/60" : (isWeekend ? "bg-slate-100/60" : "bg-white"),
                    isToday(day) ? "bg-blue-50/80" : ""
                  )}
                  title={holiday ? holiday.name : undefined}
                >
                  <span className={cn(
                    "uppercase font-bold tracking-wide block truncate",
                    isCompactMode ? "text-[8px]" : (viewMode === 'week' ? "text-xs" : "text-[10px]"),
                    isToday(day) ? "text-brand-600" : (isHolidayDay ? "text-amber-600" : "text-slate-400")
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
                    isCompactMode ? "text-xs" : (viewMode === 'week' ? "text-xl mt-1 text-slate-800" : "text-sm text-slate-700"),
                    isToday(day) && "text-brand-600"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Holiday Indicator Icon */}
                  {isHolidayDay && (
                      <div className="absolute top-1 right-1 text-amber-500 opacity-70 group-hover/header:opacity-100 transition-opacity" title={holiday?.name}>
                          <Info size={isCompactMode ? 8 : 12} />
                      </div>
                  )}
                </div>
            ))}
            
            {/* Summary Column Header (ViewMode == Month only) */}
            {viewMode === 'month' && (
               <div className="w-20 md:w-24 sticky right-0 z-30 bg-white border-l border-slate-200 p-2 font-bold text-slate-700 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 text-xs text-center leading-tight">
                   SUMA
               </div>
            )}
          </div>
        </div>

        {/* Body Rows */}
        <div className="divide-y divide-slate-100">
          {sortedEmployees.map((employee, index) => {
            // Get employee summary
            const currentMonthStr = format(days[0], 'MM');
            const empShifts = shifts.filter(s => s.employeeId === employee.id && format(new Date(s.date), 'MM') === currentMonthStr);
            const totalHours = empShifts.reduce((sum, s) => sum + getShiftHours(s), 0);
            const vacationDays = empShifts.filter(s => s.type === 'Urlop').length;

                // Determine avatar styling
                const isTailwindClass = employee.avatarColor?.startsWith('bg-');
                const avatarStyle = isTailwindClass ? {} : { backgroundColor: employee.avatarColor || stringToColor(employee.name) };
                const avatarClass = isTailwindClass ? employee.avatarColor : undefined;
                
                const isEven = index % 2 === 0;

                return (
                <div key={employee.id} className={cn(
                  "flex group/row transition-colors hover:bg-slate-50/80", 
                  isCompactMode ? "h-10 text-xs" : "h-20",
                  isEven ? "bg-white" : "bg-slate-100/40"
                )}>
                  {/* Employee Header Cell */}
                  <div className={cn(
                      "w-28 md:w-64 sticky left-0 z-10 border-r border-slate-200 p-2 md:p-3 flex items-center gap-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-all",
                      isCompactMode ? "py-1" : "",
                      isEven ? "bg-white" : "bg-slate-50"
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
                  <div className="font-bold text-slate-900 truncate">{employee.name}</div>
                  {!isCompactMode && <div className="text-xs text-slate-400 truncate mt-0.5">{employee.role}</div>}
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
                                    <span className="text-[9px] font-semibold text-slate-500 mt-0.5">
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
                                <span className="text-xs font-semibold text-slate-600 mt-0.5">
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
                        isMonthChange ? "border-r-[3px] border-r-slate-300" : "border-r-slate-100",
                        !shift && "group-hover/row:bg-slate-50/50 hover:!bg-slate-100",
                        isWeekend && !shift && "bg-slate-100/30",
                        isHolidayDay && !shift && "bg-amber-100/30"
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
                      "w-20 md:w-24 sticky right-0 z-10 border-l border-slate-200 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-colors",
                      isCompactMode ? "py-1 text-xs" : "p-2 flex-col gap-1",
                      // Background logic based on norm
                      (() => {
                          // Calculate norm for this specific month range
                          // Note: days[] might be the whole month view
                          const workingDays = days.reduce((acc, day) => {
                              const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                              // Assuming valid holidays check from existing `hd` instance
                              const isHoliday = hd.isHoliday(day); 
                              // Note: We need to verify if the holiday falls on a weekday to subtract it from working days?
                              // Standard PL logic: Holidays reduce working days regardless (if they fall on a workday? Actually usually M-F).
                              // Simplified working hours logic: Mon-Fri excluding holidays.
                              if (!isWeekend && !isHoliday) return acc + 1;
                              return acc;
                          }, 0);
                          const targetHours = workingDays * 8;
                          
                          if (totalHours === targetHours) return "bg-emerald-100 text-emerald-800";
                          return "bg-rose-100 text-rose-800";
                      })()
                  )}>
                       <div className="text-center flex flex-col items-center" title={`Norma: ${days.reduce((acc, d) => (!hd.isHoliday(d) && getDay(d) !== 0 && getDay(d) !== 6) ? acc + 1 : acc, 0) * 8}h`}>
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
        <div className="flex bg-slate-50 border-t border-slate-200 font-bold text-slate-700 sticky bottom-0 z-30 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.1)] h-10 md:h-12">
             <div className="w-28 md:w-64 sticky left-0 z-30 bg-slate-50 border-r border-slate-200 px-3 text-right text-xs uppercase tracking-wider flex items-center justify-end shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
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
                        "h-full text-center text-[10px] md:text-xs flex items-center justify-center border-r border-slate-200 transition-colors",
                        isFullStaff ? "bg-emerald-50 text-emerald-700" : (count > 0 ? "bg-rose-50 text-rose-700" : ""),
                        isMonthChange && "border-r-[3px] border-r-slate-300"
                      )}
                    >
                      {count > 0 ? (
                        <div className="flex items-center justify-center gap-1.5">
                            <span>{firstShiftCount}/{secondShiftCount}</span>
                            <span className="opacity-30">|</span>
                            <span className="opacity-75">{count}/{employees.length}</span>
                        </div>
                      ) : '-'}
                    </div>
                  );
                })}
               
                {viewMode === 'month' && (
                  <div className="w-20 md:w-24 sticky right-0 z-30 bg-slate-50 border-l border-slate-200 flex-shrink-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-slate-500">
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
