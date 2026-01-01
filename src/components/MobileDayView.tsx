import React, { useMemo } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Share2, Plus, Clock, User } from 'lucide-react';
import { Employee, Shift } from '../types';
import { cn, stringToColor, getShiftStyle } from '../utils';

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
  workingDaysCount
}) => {
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, [employees]);

  const getShiftForEmployee = (employeeId: string) => {
    return shifts.find(s => s.employeeId === employeeId && s.date === dateKey);
  };

  const dayShifts = shifts.filter(s => s.date === dateKey);
  const totalEmployees = dayShifts.length;
  const totalHours = dayShifts.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header Controls - Moved here from DashboardPage header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => onDateChange(subDays(currentDate, 1))}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
              >
                  <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                      {format(currentDate, 'EEEE', { locale: pl })}
                  </h2>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {format(currentDate, 'd MMMM yyyy', { locale: pl })}
                  </span>
              </div>

              <button 
                onClick={() => onDateChange(addDays(currentDate, 1))}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
              >
                  <ChevronRight className="w-5 h-5" />
              </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Obsada</span>
                  <div className="flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{totalEmployees}</span>
                  </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Godziny</span>
                  <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{totalHours}h</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
          {sortedEmployees.map(employee => {
              const shift = getShiftForEmployee(employee.id);
              
              // Shift Styles
              let shiftStyleClasses = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700";
              
              if (shift) {
                  const style = getShiftStyle(shift.type || '');
                  shiftStyleClasses = `${style.bg} ${style.border} ${style.text}`;
              }

              return (
                  <div 
                      key={employee.id}
                      onClick={() => onSlotClick(employee.id, dateKey, shift)}
                      className={cn(
                          "relative rounded-2xl p-4 border transition-all active:scale-[0.98] shadow-sm flex items-center justify-between gap-4",
                          shiftStyleClasses
                      )}
                  >
                      <div className="flex items-center gap-3">
                          <div 
                              className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0",
                                  employee.avatarColor
                              )}
                              style={!employee.avatarColor?.startsWith('bg-') ? { backgroundColor: employee.avatarColor || stringToColor(employee.name) } : {}}
                          >
                              <span className="text-white drop-shadow-md">
                                  {employee.name.charAt(0).toUpperCase()}
                              </span>
                          </div>
                          <div>
                              <h3 className={cn("font-bold text-base leading-tight", shift ? "opacity-100" : "text-slate-700 dark:text-slate-200")}>
                                  {employee.name}
                              </h3>
                              <p className={cn("text-xs font-medium opacity-70", shift ? "" : "text-slate-500 dark:text-slate-400")}>
                                  {employee.role || 'Pracownik'}
                              </p>
                          </div>
                      </div>

                      <div className="flex items-center">
                          {shift ? (
                              <div className="flex flex-col items-end">
                                  <span className="text-lg font-black tracking-tight leading-none">
                                      {shift.type}
                                  </span>
                                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-0.5">
                                      {shift.duration}h
                                  </span>
                              </div>
                          ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                  <Plus className="w-5 h-5" />
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}
          
          {employees.length === 0 && (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                  <p>Brak pracowników</p>
              </div>
          )}
      </div>
    </div>
  );
};
