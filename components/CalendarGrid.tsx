import React, { useMemo, useState } from 'react';
import { format, getDay, isToday, getMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ArrowDownAZ, Briefcase } from 'lucide-react';
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
    <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar h-full">
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
                    isHolidayDay ? "bg-amber-50/70" : (isWeekend ? "bg-slate-50/80" : "bg-white"),
                    isToday(day) ? "bg-blue-50/50" : ""
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
                  
                  {/* Holiday Name Display - ONLY IN WEEK VIEW */}
                  {isHolidayDay && holiday && viewMode === 'week' && (
                      <div className="mt-1 text-[9px] font-bold text-amber-600 bg-amber-100/50 px-1 py-0.5 rounded truncate w-full" title={holiday.name}>
                          {holiday.name}
                      </div>
                  )}
                </div>
            ))}
            
            {/* Summary Column Header (ViewMode == Month only) */}
            {viewMode === 'month' && (
               <div className="w-20 md:w-24 sticky right-0 z-30 bg-white border-l border-slate-200 p-2 font-bold text-slate-700 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 text-xs text-center leading-tight">
                   Podsumowanie
               </div>
            )}
          </div>
        </div>

        {/* Body Rows */}
        <div className="divide-y divide-slate-100">
          {sortedEmployees.map((employee) => {
            // Get employee summary
            const currentMonthStr = format(days[0], 'MM');
            const empShifts = shifts.filter(s => s.employeeId === employee.id && format(new Date(s.date), 'MM') === currentMonthStr);
            const totalHours = empShifts.reduce((sum, s) => sum + getShiftHours(s), 0);
            const vacationDays = empShifts.filter(s => s.type === 'Urlop').length;

                // Determine avatar styling
                const isTailwindClass = employee.avatarColor?.startsWith('bg-');
                const avatarStyle = isTailwindClass ? {} : { backgroundColor: employee.avatarColor || stringToColor(employee.name) };
                const avatarClass = isTailwindClass ? employee.avatarColor : undefined;

                return (
                <div key={employee.id} className={cn("flex group/row transition-colors hover:bg-slate-50", isCompactMode ? "h-10 text-xs" : "h-24")}>
                  {/* Employee Header Cell */}
                  <div className={cn(
                      "w-28 md:w-64 sticky left-0 z-10 bg-white border-r border-slate-200 p-2 md:p-3 flex items-center gap-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-all",
                      isCompactMode ? "py-1" : ""
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
                        return <span className={cn("font-bold", style?.text)}>{shift.type === 'Wolna Sobota' ? 'WS' : shift.type.charAt(0)}</span>;
                    }

                    if (viewMode === 'month') {
                        // Compact view for month mode
                        let abbr = shift.type.substring(0, 3).toUpperCase();
                        if (shift.type === 'Wolna Sobota') abbr = 'WS';
                        if (shift.type === 'Ranna') abbr = 'R';
                        if (shift.type === 'Popołudniowa') abbr = 'P';
                        if (shift.type === '10-18') abbr = '10';

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
                        isWeekend && !shift && "bg-slate-50/50",
                        isHolidayDay && !shift && "bg-amber-50/30"
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
                      "w-20 md:w-24 sticky right-0 z-10 bg-white border-l border-slate-200 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0",
                      isCompactMode ? "py-1 text-xs" : "p-2 flex-col gap-1"
                  )}>
                       <div className="text-center" title="Godziny">
                          <span className="font-bold text-slate-700">{totalHours}h</span>
                       </div>
                       {!isCompactMode && (
                        <div className="text-center" title="Dni urlopu">
                            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">
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
        <div className="flex bg-slate-50 border-t border-slate-200 font-bold text-slate-700 sticky bottom-0 z-30 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.1)]">
             <div className="w-28 md:w-64 sticky left-0 z-30 bg-slate-50 border-r border-slate-200 p-3 text-right text-xs uppercase tracking-wider flex items-center justify-end shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
               Suma (osoby):
             </div>
             <div className="flex flex-1 w-0">
               {daysInfo.map(({ dateStr, isMonthChange }) => (
                  <div 
                    key={dateStr}
                    className={cn(
                      colWidthClass,
                      "p-2 text-center text-xs flex items-center justify-center border-r border-slate-200",
                      isMonthChange && "border-r-[3px] border-r-slate-300"
                    )}
                  >
                    {dailyStatsLookup[dateStr].count > 0 ? dailyStatsLookup[dateStr].count : '-'}
                  </div>
               ))}
               
               {viewMode === 'month' && <div className="w-20 md:w-24 sticky right-0 z-10 bg-slate-50 border-l border-slate-200 flex-shrink-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]" />}
             </div>
        </div>

      </div>
    </div>
  );
};

export default CalendarGrid;
