import React, { useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';
import { Employee, Shift } from '../../types';
import { cn, getShiftStyle, displayName, resolveEmployeeAvatar } from '../../utils';

interface MobileDayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  employees: Employee[];
  shifts: Shift[];
  onSlotClick: (employeeId: string, date: string, existingShift?: Shift) => void;
  workingDaysCount?: number;
}

export const MobileDayView: React.FC<MobileDayViewProps> = ({
  currentDate,
  onDateChange,
  employees,
  shifts,
  onSlotClick,
}) => {
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [employees]);

  const getShiftForEmployee = (employeeId: string) => {
    return shifts.find((s) => s.employeeId === employeeId && s.date === dateKey);
  };

  const dayShifts = shifts.filter((s) => s.date === dateKey);
  const totalEmployees = dayShifts.length;
  const totalHours = dayShifts.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="schedule-mobile flex h-full flex-col">
      <div className="schedule-mobile__header">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onDateChange(subDays(currentDate, 1))}
            className="schedule-header-nav-btn"
            aria-label="Poprzedni dzień"
          >
            <ChevronLeft className="schedule-header-nav-btn__icon" strokeWidth={2} />
          </button>

          <div className="flex flex-col items-center text-center">
            <h2 className="text-base font-bold uppercase capitalize">{format(currentDate, 'EEEE', { locale: pl })}</h2>
            <span className="text-xs font-semibold text-black/50 dark:text-white/50">
              {format(currentDate, 'd MMMM yyyy', { locale: pl })}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onDateChange(addDays(currentDate, 1))}
            className="schedule-header-nav-btn"
            aria-label="Następny dzień"
          >
            <ChevronRight className="schedule-header-nav-btn__icon" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="schedule-mobile__stat">
            <span className="schedule-mobile__stat-label">Obsada</span>
            <div className="mt-0.5 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-[#059669]" strokeWidth={2} />
              <span className="text-lg font-bold">{totalEmployees}</span>
            </div>
          </div>
          <div className="schedule-mobile__stat">
            <span className="schedule-mobile__stat-label">Godziny</span>
            <div className="mt-0.5 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-sky-600" strokeWidth={2} />
              <span className="text-lg font-bold">{totalHours}h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 pb-24">
        {sortedEmployees.map((employee) => {
          const shift = getShiftForEmployee(employee.id);
          const avatar = resolveEmployeeAvatar(employee.avatarColor, employee.name, employee.id);

          let shiftStyleClasses = 'schedule-mobile__card--empty';
          if (shift) {
            const style = getShiftStyle(shift.type || '');
            shiftStyleClasses = `${style.bg} ${style.border} ${style.text}`;
          }

          return (
            <div
              key={employee.id}
              onClick={() => onSlotClick(employee.id, dateKey, shift)}
              className={cn('schedule-mobile__card', shiftStyleClasses)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn('schedule-mobile__avatar', avatar.className)}
                  style={avatar.style}
                >
                  {displayName(employee.name).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">{displayName(employee.name)}</h3>
                  <p className="text-xs font-medium opacity-70">{employee.role || 'Pracownik'}</p>
                </div>
              </div>

              <div className="flex items-center">
                {shift ? (
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black leading-none tracking-tight">{shift.type}</span>
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest opacity-70">
                      {shift.duration}h
                    </span>
                  </div>
                ) : (
                  <div className="schedule-mobile__add-btn">
                    <Plus className="h-5 w-5" strokeWidth={2} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {employees.length === 0 && (
          <div className="py-10 text-center text-sm text-black/45 dark:text-white/45">
            <p>Brak pracowników</p>
          </div>
        )}
      </div>
    </div>
  );
};
