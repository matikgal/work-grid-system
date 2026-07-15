import React, { useEffect, useMemo, useRef, useState } from "react";
import { format, getDay, isToday, getMonth } from "date-fns";
import { pl } from "date-fns/locale";
import Holidays from "date-holidays";
import { Info, Lock, Unlock } from "lucide-react";
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
import { Employee, Shift, ViewMode } from "../../types";
import { getShiftStyle, cn, displayName, resolveEmployeeAvatar, getMonthlyHoursStatus } from "../../utils";
import { SHIFT_TYPES } from "../../constants";

interface CalendarGridProps {
  days: Date[];
  employees: Employee[];
  shifts: Shift[];
  viewMode: ViewMode;
  isCompactMode?: boolean;
  onSlotClick: (employeeId: string, date: string, shift?: Shift) => void;
  workingDaysCount?: number;
  wsTarget?: number;
  sumDisplay?: SumDisplay;
  /** Gdy aktywny jest szablon zmiany — pozwala „malować" zmiany przeciągnięciem po komórkach */
  paintEnabled?: boolean;
  onReorder?: (newOrder: Employee[]) => void;
  onDayClick?: (date: Date) => void;
}

export type SumDisplay = 'days' | 'ws' | 'both';

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
  wsTarget = 0,
  sumDisplay = 'days',
  paintEnabled = false,
  onReorder,
  onDayClick,
}) => {
  const [isLocked, setIsLocked] = useState(true);

  // „Malowanie" zmian przeciągnięciem — aktywne tylko gdy wybrany jest szablon i wiersze są zablokowane
  const paintActive = paintEnabled && isLocked;
  const [paintCells, setPaintCells] = useState<Set<string>>(() => new Set());
  const paintCellsRef = useRef<Set<string>>(new Set());
  const isPaintingRef = useRef(false);

  const updateSelection = (next: Set<string>) => {
    paintCellsRef.current = next;
    setPaintCells(next);
  };
  const startPaint = (empId: string, dateStr: string) => {
    isPaintingRef.current = true;
    updateSelection(new Set([`${empId}__${dateStr}`]));
  };
  const extendPaint = (empId: string, dateStr: string) => {
    if (!isPaintingRef.current) return;
    const key = `${empId}__${dateStr}`;
    if (paintCellsRef.current.has(key)) return;
    const next = new Set(paintCellsRef.current);
    next.add(key);
    updateSelection(next);
  };

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

  // Po puszczeniu przycisku: wypełnij wszystkie zaznaczone komórki aktywnym szablonem
  useEffect(() => {
    if (!paintActive) return;
    const finishPaint = () => {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;
      const cells = Array.from(paintCellsRef.current);
      updateSelection(new Set());
      cells.forEach((key) => {
        const [empId, dateStr] = key.split('__');
        const existing = shiftsLookup[`${empId}-${dateStr}`];
        onSlotClick(empId, dateStr, existing);
      });
    };
    window.addEventListener('pointerup', finishPaint);
    window.addEventListener('pointercancel', finishPaint);
    return () => {
      window.removeEventListener('pointerup', finishPaint);
      window.removeEventListener('pointercancel', finishPaint);
    };
  }, [paintActive, shiftsLookup, onSlotClick]);

  // OPTIMIZATION: Shift hours calculation helper
  const getShiftHours = (shift: Shift) => {
    if (shift.type === SHIFT_TYPES.VACATION) return 8;
    if (shift.type === SHIFT_TYPES.FREE_SATURDAY) return 0;
    if (shift.type === SHIFT_TYPES.HOLIDAY) return 0;
    if (shift.type === SHIFT_TYPES.SICK_LEAVE_L4) return 8;
    if (shift.type === SHIFT_TYPES.WS) return 0;
    if (shift.type === SHIFT_TYPES.WS_ON_DEMAND) return 0;
    if (shift.type === SHIFT_TYPES.WORK_8) return 8;
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

    const stats: Record<
      string,
      { totalHours: number; vacationDays: number; wsCount: number }
    > = {};

    employees.forEach((emp) => {
      let h = 0;
      let v = 0;
      let ws = 0;

      daysInfo.forEach((info) => {
        const shift = shiftsLookup[`${emp.id}-${info.dateStr}`];
        if (shift) {
          h += getShiftHours(shift);
          if (shift.type === SHIFT_TYPES.VACATION) v++;
          if (
            shift.type === SHIFT_TYPES.WS ||
            shift.type === SHIFT_TYPES.WS_ON_DEMAND
          )
            ws++;
        }
      });

      stats[emp.id] = { totalHours: h, vacationDays: v, wsCount: ws };
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
    <div className="schedule-grid flex-1 overflow-auto relative custom-scrollbar h-full overscroll-contain">
      <div
        className={cn(viewMode === "week" ? "min-w-0 w-full" : "min-w-full w-max")}
      >
        {/* Header Row */}
        <div className="schedule-grid__header flex sticky top-0 z-20">
          <div
            className={cn(
              "schedule-grid__corner w-28 md:w-64 sticky left-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-2 flex-shrink-0",
              isCompactMode
                ? "p-1 md:p-2 text-xs"
                : "p-2 md:p-4 text-sm md:text-base"
            )}
          >
            <span className="truncate">Pracownik</span>
            <div className="schedule-grid__lock-wrap flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsLocked(!isLocked)}
                className={cn(
                  "schedule-grid__lock-btn",
                  !isLocked && "schedule-grid__lock-btn--unlocked"
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
                    "schedule-grid__day-col text-center flex flex-col justify-center relative group/header overflow-visible z-10",
                    isCompactMode ? "p-0.5" : "p-2",
                    isMonthChange && "schedule-grid__day-col--month-end",
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
                    <div className="absolute top-1 right-1 text-amber-600 opacity-80 group-hover/header:opacity-100 transition-opacity z-50">
                      <Info size={isCompactMode ? 10 : 14} />
                      <div className="schedule-grid__holiday-tip">
                        <div className="font-semibold">{holiday?.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {viewMode === "month" && (
              <div className="schedule-grid__sum-col schedule-grid__sum-head w-20 md:w-24 sticky right-0 z-30 p-2 flex items-center justify-center flex-shrink-0 text-xs text-center leading-tight">
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
            <div className="schedule-grid__body">
              {employees.map((employee, index) => {
                const stats = employeeSummaryStats[employee.id] || {
                  totalHours: 0,
                  vacationDays: 0,
                  wsCount: 0,
                };
                const { totalHours, vacationDays, wsCount } = stats;

                const avatar = resolveEmployeeAvatar(employee.avatarColor, employee.name, employee.id);

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
                        "schedule-grid__row flex group/row transition-all duration-75 relative",
                        isCompactMode ? "h-10 text-xs" : "h-20",
                        employee.isSeparator
                          ? "schedule-grid__row--separator bg-slate-100/50 dark:bg-slate-800/50"
                          : isEven
                          ? "bg-white dark:bg-slate-900"
                          : "bg-slate-50/50 dark:bg-slate-900/50",
                        !isLocked && "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      {/* Employee Header Cell */}
                      <div
                        className={cn(
                          "schedule-grid__employee-cell w-28 md:w-64 sticky left-0 z-10 p-2 md:p-3 flex items-center gap-3 flex-shrink-0",
                          rowBgClass,
                          isCompactMode ? "py-1" : ""
                        )}
                      >
                       {employee.isSeparator ? (
                           <div className="w-full h-full"></div>
                       ) : (
                        <>
                            <div
                            className={cn(
                                "schedule-grid__avatar",
                                isCompactMode
                                ? "w-6 h-6 text-[10px]"
                                : "w-10 h-10 text-sm",
                                avatar.className
                            )}
                            style={avatar.style}
                            >
                            {displayName(employee.name).charAt(0)}
                            </div>
                            <div className="min-w-0">
                            <div className="schedule-grid__employee-name truncate">
                                {displayName(employee.name)}
                            </div>
                            {!isCompactMode && (
                                <div className="schedule-grid__employee-role truncate mt-0.5">
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
                                            "schedule-grid__cell border-r relative flex items-center justify-center p-0.5 pointer-events-none select-none",
                                            isMonthChange && "schedule-grid__cell--month-end",
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
                                else if (shift.type === SHIFT_TYPES.WS_ON_DEMAND)
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
                                if (shift.type === SHIFT_TYPES.WS_ON_DEMAND)
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
                                    {shift.duration > 0 && shift.type !== SHIFT_TYPES.WS && shift.type !== SHIFT_TYPES.WS_ON_DEMAND && shift.type !== SHIFT_TYPES.WORK_8 && (
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
                                  {shift.duration > 0 && shift.type !== SHIFT_TYPES.WS && shift.type !== SHIFT_TYPES.WS_ON_DEMAND && shift.type !== SHIFT_TYPES.WORK_8 && (
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 mt-0.5">
                                      {shift.startTime}-{shift.endTime}
                                    </span>
                                  )}
                                  <div className="schedule-grid__shift-duration">
                                    {shift.duration}h
                                  </div>
                                </>
                              );
                            };

                            const isPainted = paintCells.has(
                              `${employee.id}__${dateStr}`
                            );

                            return (
                              <div
                                key={dateStr}
                                onPointerDown={(e) => {
                                  if (!paintActive || e.button !== 0) return;
                                  e.preventDefault();
                                  // Zwolnij domyślne przechwycenie wskaźnika, aby pointerenter działał na kolejnych komórkach (dotyk)
                                  try {
                                    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
                                  } catch {
                                    /* ignore */
                                  }
                                  startPaint(employee.id, dateStr);
                                }}
                                onPointerEnter={() => {
                                  if (paintActive) extendPaint(employee.id, dateStr);
                                }}
                                onClick={() => {
                                  // Gdy malujemy, wypełnienie obsługuje pointerup
                                  if (paintActive) return;
                                  onSlotClick(employee.id, dateStr, shift);
                                }}
                                className={cn(
                                  colWidthClass,
                                  "schedule-grid__cell relative flex items-center justify-center p-0.5",
                                  paintActive && "cursor-crosshair select-none",
                                  isMonthChange && "schedule-grid__cell--month-end",
                                  !shift && "schedule-grid__cell--empty",
                                  !shift &&
                                    "group-hover/row:bg-emerald-50/40 dark:group-hover/row:bg-emerald-900/15",
                                  isWeekend &&
                                    !shift &&
                                    "bg-slate-50 dark:bg-slate-900",
                                  isHolidayDay &&
                                    !shift &&
                                    "bg-amber-50/50 dark:bg-amber-900/10",
                                  isPainted && "schedule-grid__cell--painting"
                                )}
                              >
                                {shift ? (
                                  <div
                                    className={cn(
                                      "schedule-grid__shift",
                                      style?.bg,
                                      style?.border,
                                      isCompactMode ? "" : "flex-col p-1"
                                    )}
                                  >
                                    {getShiftContent()}
                                  </div>
                                ) : (
                                  <div className="schedule-grid__empty" />
                                )}
                              </div>
                            );
                          }
                        )}

                        {viewMode === "month" && (
                          <div
                            className={cn(
                              "schedule-grid__sum-col w-20 md:w-24 sticky right-0 z-10 flex items-center justify-center flex-shrink-0 transition-colors",
                              isCompactMode
                                ? "py-1 text-xs"
                                : "p-2 flex-col gap-1",
                              employee.isSeparator
                                ? "bg-slate-50 dark:bg-slate-900"
                                : (() => {
                                    const status = getMonthlyHoursStatus(totalHours, targetMonthlyHours);
                                    return {
                                      ok: "schedule-grid__sum-cell--ok",
                                      low: "schedule-grid__sum-cell--low",
                                      high: "schedule-grid__sum-cell--high",
                                    }[status];
                                  })()
                            )}
                          >
                            {employee.isSeparator ? (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                            ) : (
                                <div
                                  className="flex w-full flex-col items-center justify-center leading-tight"
                                  title={`Norma: ${targetMonthlyHours}h${sumDisplay !== 'days' ? ` • WS: ${wsCount}${wsTarget ? `/${wsTarget}` : ''}` : ''}`}
                                >
                                    {!isCompactMode && (
                                      <span className="text-[8px] font-semibold uppercase tracking-wide opacity-45">
                                        {[sumDisplay !== 'ws' && 'h/d', sumDisplay !== 'days' && 'ws']
                                          .filter(Boolean)
                                          .join('/')}
                                      </span>
                                    )}
                                    <span className="schedule-grid__sum-values whitespace-nowrap font-bold tabular-nums text-[10px] md:text-[11px]">
                                      {[
                                        sumDisplay !== 'ws' &&
                                          `${totalHours}h/${parseFloat((totalHours / 8).toFixed(2))}d`,
                                        sumDisplay !== 'days' &&
                                          `${wsCount}${wsTarget ? `/${wsTarget}` : ''}ws`,
                                      ]
                                        .filter(Boolean)
                                        .join('/')}
                                    </span>
                                    {sumDisplay !== 'ws' && !isCompactMode && vacationDays > 0 && (
                                      <span className="schedule-grid__vac-badge mt-0.5">
                                        {vacationDays}d url.
                                      </span>
                                    )}
                                </div>
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
        <div className="schedule-grid__footer flex sticky bottom-0 z-30 h-10 md:h-12">
          <div className="schedule-grid__footer-corner w-28 md:w-64 sticky left-0 z-30 px-3 text-right flex items-center justify-end flex-shrink-0">
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
                    "schedule-grid__footer-cell h-full text-center text-[10px] md:text-xs flex items-center justify-center transition-colors",
                    isFullStaff
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400"
                      : count > 0
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-900/10 dark:text-rose-400"
                      : "",
                    isMonthChange && "schedule-grid__footer-cell--month-end"
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
              <div className="schedule-grid__sum-col schedule-grid__sum-head w-20 md:w-24 sticky right-0 z-30 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
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
