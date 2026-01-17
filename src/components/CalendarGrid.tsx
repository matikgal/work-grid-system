import React, { useMemo, useState } from "react";
import { format, getDay, isToday, getMonth } from "date-fns";
import { pl } from "date-fns/locale";
import Holidays from "date-holidays";
import { Info, Lock, Unlock } from "lucide-react";
import { Employee, Shift, ViewMode } from "../types";
import { getShiftStyle, cn, stringToColor } from "../utils";
import { SHIFT_TYPES } from "../constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CalendarGridProps {
  days: Date[];
  employees: Employee[];
  shifts: Shift[];
  viewMode: ViewMode;
  isCompactMode?: boolean;
  onSlotClick: (employeeId: string, date: string, shift?: Shift) => void;
  workingDaysCount?: number;
  onReorder?: (newOrder: Employee[]) => void;
  onDayClick?: (date: Date) => void;
}

interface SortableRowProps {
  employee: Employee;
  children: React.ReactNode;
  isLocked: boolean;
}

const SortableRow = ({ employee, children, isLocked }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: employee.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: "relative" as const,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  employees,
  shifts,
  viewMode,
  isCompactMode = false,
  onSlotClick,
  workingDaysCount,
  onReorder,
  onDayClick,
}) => {
  const [isLocked, setIsLocked] = useState(true);

  // Initialize holidays for Poland
  const hd = useMemo(() => new Holidays("PL", { languages: ["pl"] }), []);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = employees.findIndex((e) => e.id === active.id);
      const newIndex = employees.findIndex((e) => e.id === over.id);

      if (onReorder) {
        onReorder(arrayMove(employees, oldIndex, newIndex));
      }
    }
  };

  // OPTIMIZATION: pre-calculate holiday info for days
  const daysInfo = useMemo(() => {
    return days.map((day, index) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const isWeekend = getDay(day) === 0 || getDay(day) === 6;
      const nextDay = days[index + 1];
      const isMonthChange = nextDay && getMonth(day) !== getMonth(nextDay);

      const holidayResult = hd.isHoliday(day);
      const holiday = Array.isArray(holidayResult)
        ? holidayResult[0]
        : holidayResult || null;

      return {
        dateStr,
        day,
        isWeekend,
        isMonthChange,
        holiday,
        isHolidayDay: Boolean(holiday),
      };
    });
  }, [days, hd]);

  // OPTIMIZATION: Create a lookup map for shifts to avoid .find() in render loop
  const shiftsLookup = useMemo(() => {
    const lookup: Record<string, Shift> = {};
    shifts.forEach((shift) => {
      lookup[`${shift.employeeId}-${shift.date}`] = shift;
    });
    return lookup;
  }, [shifts]);

  // OPTIMIZATION: Shift hours calculation helper
  const getShiftHours = (shift: Shift) => {
    if (shift.type === SHIFT_TYPES.VACATION) return 8;
    if (shift.type === SHIFT_TYPES.FREE_SATURDAY) return 0;
    if (shift.type === SHIFT_TYPES.HOLIDAY) return 0;
    if (shift.type === SHIFT_TYPES.SICK_LEAVE_L4) return 8;
    if (shift.type === SHIFT_TYPES.WS) return 0;
    if (shift.type === SHIFT_TYPES.WORK_8) return 0;
    return shift.duration || 0;
  };

  // OPTIMIZATION: detailed working hours calculation for current view
  const targetMonthlyHours = useMemo(() => {
    if (viewMode !== "month") return 0;

    if (workingDaysCount !== undefined && workingDaysCount > 0) {
      return workingDaysCount * 8;
    }

    return days.reduce((acc, day) => {
      const dayOfWeek = getDay(day);
      const isWorkingDay = dayOfWeek !== 0 && dayOfWeek !== 6;
      let hours = isWorkingDay ? 8 : 0;
      
      const isHoliday = hd.isHoliday(day);
      if (isHoliday && dayOfWeek !== 0) {
          hours -= 8;
      }
      return acc + hours;
    }, 0);
  }, [days, hd, viewMode, workingDaysCount]);

  // OPTIMIZATION: Pre-calculate employee monthly stats using lookups instead of array filtering
  const employeeSummaryStats = useMemo(() => {
    // Only needed for month view where we show totals
    if (viewMode !== "month") return {};

    const stats: Record<string, { totalHours: number; vacationDays: number }> =
      {};

    employees.forEach((emp) => {
      let h = 0;
      let v = 0;

      daysInfo.forEach((info) => {
        const shift = shiftsLookup[`${emp.id}-${info.dateStr}`];
        if (shift) {
          h += getShiftHours(shift);
          if (shift.type === SHIFT_TYPES.VACATION) v++;
        }
      });

      stats[emp.id] = { totalHours: h, vacationDays: v };
    });

    return stats;
  }, [employees, daysInfo, shiftsLookup, viewMode]);

  // Dynamic column width based on view mode
  const colWidthClass =
    viewMode === "week"
      ? "flex-1 min-w-0" // Week view: Fit to screen, no scroll
      : isCompactMode
      ? "min-w-[28px] flex-1"
      : "min-w-[40px] flex-1";

  const activeEmployeesCount = employees.filter(e => !e.isSeparator).length;

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 relative custom-scrollbar h-full calendar-grid overscroll-contain">
      <div
        className={cn(viewMode === "week" ? "min-w-0 w-full" : "min-w-full w-max")}
      >
        {/* Header Row */}
        <div className="flex sticky top-0 z-20 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
          <div
            className={cn(
              "w-28 md:w-64 sticky left-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0",
              isCompactMode
                ? "p-1 md:p-2 text-xs"
                : "p-2 md:p-4 text-sm md:text-base"
            )}
          >
            <span className="truncate">Pracownik</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={cn(
                  "p-1 rounded hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all",
                  !isLocked
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-400 dark:text-slate-500"
                )}
                title={
                  isLocked ? "Odblokuj edycję kolejności" : "Zablokuj kolejność"
                }
              >
                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
            </div>
          </div>
          <div className="flex flex-1 w-0">
            {daysInfo.map(
              ({
                day,
                dateStr,
                isWeekend,
                isMonthChange,
                holiday,
                isHolidayDay,
              }) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    colWidthClass,
                    "text-center flex flex-col justify-center transition-all relative group/header overflow-visible z-10",
                    isCompactMode ? "p-0.5" : "p-2",
                    isMonthChange
                      ? "border-r-[3px] border-r-slate-300 dark:border-r-slate-600"
                      : "border-r border-slate-100 dark:border-slate-800",
                    isHolidayDay
                      ? "bg-amber-50 dark:bg-amber-900/10"
                      : isWeekend
                      ? "bg-slate-50 dark:bg-slate-800/50"
                      : "bg-white dark:bg-slate-900",
                    isToday(day) ? "bg-blue-50/80 dark:bg-brand-900/10" : ""
                  )}
                  onClick={() => onDayClick && onDayClick(day)}
                >
                  <span
                    className={cn(
                      "uppercase font-bold tracking-wide block truncate",
                      isCompactMode
                        ? "text-[8px]"
                        : viewMode === "week"
                        ? "text-xs"
                        : "text-[10px]",
                      isToday(day)
                        ? "text-brand-600 dark:text-brand-400"
                        : isHolidayDay
                        ? "text-amber-600 dark:text-amber-500"
                        : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {isCompactMode
                      ? format(day, "EEEEE", { locale: pl })
                      : viewMode === "week"
                      ? format(day, "EEE", { locale: pl })
                      : format(day, "EEEEEE", { locale: pl })}
                  </span>
                  <span
                    className={cn(
                      "font-bold block truncate",
                      isCompactMode
                        ? "text-xs"
                        : viewMode === "week"
                        ? "text-xl mt-1 text-slate-800 dark:text-slate-200"
                        : "text-sm text-slate-700 dark:text-slate-300",
                      isToday(day) && "text-brand-600 dark:text-brand-400"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {isHolidayDay && (
                    <div className="absolute top-1 right-1 text-amber-500 opacity-70 group-hover/header:opacity-100 transition-opacity z-50">
                      <Info size={isCompactMode ? 10 : 14} />
                      <div className="absolute top-full right-0 mt-2 w-max max-w-[150px] px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/header:opacity-100 group-hover/header:visible transition-all duration-200 z-[100] pointer-events-none text-center">
                        <div className="font-semibold">{holiday?.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {viewMode === "month" && (
              <div className="w-20 md:w-24 sticky right-0 z-30 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-2 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 text-xs text-center leading-tight">
                SUMA
              </div>
            )}
          </div>
        </div>

        {/* Body Rows */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={employees.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((employee, index) => {
                const stats = employeeSummaryStats[employee.id] || {
                  totalHours: 0,
                  vacationDays: 0,
                };
                const { totalHours, vacationDays } = stats;

                const isTailwindClass = employee.avatarColor?.startsWith("bg-");
                const avatarStyle = isTailwindClass
                  ? {}
                  : {
                      backgroundColor:
                        employee.avatarColor || stringToColor(employee.name),
                    };
                const avatarClass = isTailwindClass
                  ? employee.avatarColor
                  : undefined;

                const isEven = index % 2 === 0;

                // Row Color Logic
                let rowBgClass = "bg-white dark:bg-slate-900";
                if (!employee.isSeparator) {
                   if (employee.rowColor === 'blue') rowBgClass = "bg-blue-100 dark:bg-blue-900/30";
                   if (employee.rowColor === 'red') rowBgClass = "bg-red-100 dark:bg-red-900/30";
                   if (employee.rowColor === 'green') rowBgClass = "bg-emerald-100 dark:bg-emerald-900/30";
                }

                return (
                  <SortableRow
                    key={employee.id}
                    employee={employee}
                    isLocked={isLocked}
                  >
                    <div
                      className={cn(
                        "flex group/row transition-all duration-75 relative",
                        isCompactMode ? "h-10 text-xs" : "h-20",
                        employee.isSeparator 
                             ? "bg-slate-100/50 dark:bg-slate-800/50" 
                             : (isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50"),
                        !isLocked && "cursor-grab active:cursor-grabbing border-b border-transparent",
                         !employee.isSeparator && "hover:z-20 hover:ring-1 hover:ring-blue-600 dark:hover:ring-blue-400 hover:shadow-lg"
                      )}
                    >
                      {/* Employee Header Cell */}
                      <div
                        className={cn(
                          "w-28 md:w-64 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 p-2 md:p-3 flex items-center gap-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-all",
                          rowBgClass,
                          isCompactMode ? "py-1" : "",
                          // FIX: Use brightness filter instead of background override to preserve rowColor
                          !employee.isSeparator && "group-hover/row:brightness-95 dark:group-hover/row:brightness-110"
                        )}
                      >
                       {employee.isSeparator ? (
                           <div className="w-full h-full"></div>
                       ) : (
                        <>
                            <div
                            className={cn(
                                "rounded-full flex items-center justify-center text-white font-bold shrink-0 transition-all",
                                isCompactMode
                                ? "w-6 h-6 text-[10px]"
                                : "w-10 h-10 text-sm shadow-sm",
                                avatarClass
                            )}
                            style={avatarStyle}
                            >
                            {employee.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover/row:text-blue-700 dark:group-hover/row:text-blue-400 transition-colors">
                                {employee.name}
                            </div>
                            {!isCompactMode && (
                                <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {employee.role}
                                </div>
                            )}
                            </div>
                        </>
                       )}
                      </div>

                      {/* Shift Cells */}
                      <div className="flex flex-1 w-0">
                        {daysInfo.map(
                          ({
                            day,
                            dateStr,
                            isWeekend,
                            isMonthChange,
                            isHolidayDay,
                          }) => {
                             if (employee.isSeparator) {
                                  return (
                                    <div
                                        key={dateStr}
                                        className={cn(
                                            colWidthClass,
                                            "border-r relative flex items-center justify-center p-0.5 pointer-events-none select-none",
                                            isMonthChange
                                                ? "border-r-[3px] border-r-slate-300 dark:border-r-slate-700"
                                                : "border-r-slate-100 dark:border-r-slate-800",
                                            "bg-slate-50/50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-700 font-mono text-lg"
                                        )}
                                    >
                                        ✗
                                    </div>
                                  );
                             }

                            const shift =
                              shiftsLookup[`${employee.id}-${dateStr}`];
                            const style = shift
                              ? getShiftStyle(shift.type || "work")
                              : null;

                            const getShiftContent = () => {
                              if (!shift) return null;

                              if (isCompactMode) {
                                let abbr = "";
                                if (shift.type === SHIFT_TYPES.FREE_SATURDAY)
                                  abbr = "WS";
                                else if (shift.type === SHIFT_TYPES.VACATION)
                                  abbr = "U";
                                else if (shift.type === SHIFT_TYPES.HOLIDAY)
                                  abbr = "Ś";
                                else if (shift.type === SHIFT_TYPES.SICK_LEAVE_L4)
                                  abbr = "L4";
                                else if (shift.type === SHIFT_TYPES.WS)
                                  abbr = "WS";
                                else if (shift.type === SHIFT_TYPES.WORK_8)
                                  abbr = "8";
                                else {
                                  const start = parseInt(
                                    shift.startTime.split(":")[0]
                                  );
                                  const end = parseInt(
                                    shift.endTime.split(":")[0]
                                  );
                                  abbr = `${start}-${end}`;
                                }
                                return (
                                  <span
                                    className={cn("font-bold", style?.text)}
                                  >
                                    {abbr}
                                  </span>
                                );
                              }

                              if (viewMode === "month") {
                                let abbr = "8";
                                if (shift.type === SHIFT_TYPES.FREE_SATURDAY)
                                  abbr = "WS";
                                if (shift.type === SHIFT_TYPES.VACATION)
                                  abbr = "URL";
                                if (shift.type === SHIFT_TYPES.HOLIDAY)
                                  abbr = "ŚW";
                                if (shift.type === SHIFT_TYPES.SICK_LEAVE_L4)
                                  abbr = "L4";
                                if (shift.type === SHIFT_TYPES.WS)
                                  abbr = "WS";
                                if (shift.type === SHIFT_TYPES.WORK_8)
                                  abbr = "8";

                                const startH = shift.startTime.split(":")[0];
                                const endH = shift.endTime.split(":")[0];

                                return (
                                  <div className="flex flex-col items-center justify-center leading-none">
                                    <span
                                      className={cn(
                                        "text-[10px] font-bold uppercase",
                                        style?.text
                                      )}
                                    >
                                      {abbr}
                                    </span>
                                    {shift.duration > 0 && shift.type !== SHIFT_TYPES.WS && shift.type !== SHIFT_TYPES.WORK_8 && (
                                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-300 mt-0.5">
                                        {startH}-{endH}
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold uppercase truncate w-full text-center",
                                      style?.text
                                    )}
                                  >
                                    {shift.type}
                                  </span>
                                  {shift.duration > 0 && shift.type !== SHIFT_TYPES.WS && shift.type !== SHIFT_TYPES.WORK_8 && (
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 mt-0.5">
                                      {shift.startTime}-{shift.endTime}
                                    </span>
                                  )}
                                  <div className="absolute top-0 right-0 px-1 py-0.5 bg-white/50 text-[8px] font-bold text-slate-500 rounded-bl backdrop-blur-[1px]">
                                    {shift.duration}h
                                  </div>
                                </>
                              );
                            };

                            return (
                              <div
                                key={dateStr}
                                onPointerDown={(e) => {
                                  // Prevent auto-drag when interacting with cells if locked or if slot click is intended
                                }}
                                onClick={() =>
                                  onSlotClick(employee.id, dateStr, shift)
                                }
                                className={cn(
                                  colWidthClass,
                                  "border-r relative transition-all cursor-pointer flex items-center justify-center p-0.5",
                                  isMonthChange
                                    ? "border-r-[3px] border-r-slate-300 dark:border-r-slate-700"
                                    : "border-r-slate-100 dark:border-r-slate-800",
                                  !shift &&
                                    "group-hover/row:bg-blue-50/50 dark:group-hover/row:bg-blue-900/20 hover:!bg-blue-100 dark:hover:!bg-blue-800/40",
                                  isWeekend &&
                                    !shift &&
                                    "bg-slate-50 dark:bg-slate-900",
                                  isHolidayDay &&
                                    !shift &&
                                    "bg-amber-50/50 dark:bg-amber-900/10"
                                )}
                              >
                                {shift ? (
                                  <div
                                    className={cn(
                                      "w-full h-full rounded transition-all shadow-sm flex items-center justify-center overflow-hidden relative",
                                      style?.bg,
                                      style?.border,
                                      "border",
                                      isCompactMode ? "" : "flex-col p-1"
                                    )}
                                  >
                                    {getShiftContent()}
                                  </div>
                                ) : (
                                  <div className="w-full h-full rounded hover:bg-slate-200/50 transition-colors" />
                                )}
                              </div>
                            );
                          }
                        )}

                        {viewMode === "month" && (
                          <div
                            className={cn(
                              "w-20 md:w-24 sticky right-0 z-10 border-l border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0 transition-colors",
                              isCompactMode
                                ? "py-1 text-xs"
                                : "p-2 flex-col gap-1",
                              employee.isSeparator 
                                ? "bg-slate-50 dark:bg-slate-900" 
                                : (totalHours === targetMonthlyHours
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover/row:brightness-95 dark:group-hover/row:brightness-110"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 group-hover/row:brightness-95 dark:group-hover/row:brightness-110")
                            )}
                          >
                            {employee.isSeparator ? (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                            ) : (
                                <>
                                    <div
                                    className="text-center flex flex-col items-center"
                                    title={`Norma: ${targetMonthlyHours}h`}
                                    >
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
                                </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </SortableRow>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Footer Row (Totals) */}
        <div className="flex bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-400 sticky bottom-0 z-30 shadow-[0_-4px_8px_-4px_rgba(0,0,0,0.1)] h-10 md:h-12">
          <div className="w-28 md:w-64 sticky left-0 z-30 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 px-3 text-right text-xs uppercase tracking-wider flex items-center justify-end shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] flex-shrink-0">
            Suma (1zm/2zm | obecni):
          </div>
          <div className="flex flex-1 w-0">
            {daysInfo.map(({ dateStr, isMonthChange }) => {
              const shiftsForDay = shifts.filter((s) => s.date === dateStr);
              const count = shiftsForDay.length; // Separators don't have shifts so this count essentially excludes them unless data is dirty
              const isFullStaff = count === activeEmployeesCount && count > 0;

              const firstShiftCount = shiftsForDay.filter(
                (s) => s.startTime === "06:00"
              ).length;
              const secondShiftCount = shiftsForDay.filter(
                (s) => s.startTime === "14:00"
              ).length;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    colWidthClass,
                    "h-full text-center text-[10px] md:text-xs flex items-center justify-center border-r border-slate-200 dark:border-slate-800 transition-colors",
                    isFullStaff
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400"
                      : count > 0
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-900/10 dark:text-rose-400"
                      : "",
                    isMonthChange &&
                      "border-r-[3px] border-r-slate-300 dark:border-r-slate-700"
                  )}
                >
                  {count > 0 ? (
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        viewMode === "month" ? "flex-col gap-0.5" : "gap-1.5"
                      )}
                    >
                      <span
                        className={cn(
                          "font-bold",
                          viewMode === "month" ? "text-[11px] leading-none" : ""
                        )}
                      >
                        {firstShiftCount}/{secondShiftCount}
                      </span>

                      {viewMode !== "month" && (
                        <span className="opacity-30">|</span>
                      )}

                      <span
                        className={cn(
                          "opacity-75",
                          viewMode === "month"
                            ? "text-[11px] leading-none font-normal"
                            : ""
                        )}
                      >
                        {count}/{activeEmployeesCount}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
              );
            })}

            {viewMode === "month" && (
              <div className="w-20 md:w-24 sticky right-0 z-30 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-shrink-0 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                {activeEmployeesCount} os.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
