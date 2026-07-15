import React from 'react';
import { Employee } from '../../../types';
import { cn, getAvatarColor, displayName } from '../../../utils';
import { WsAdjustment } from '../../../services/adjustmentService';
import { Plus, Trash2 } from 'lucide-react';

interface FreeSaturdaysMobileListProps {
  employees: Employee[];
  isLocked: boolean;
  adjustments: WsAdjustment[];
  onSetAdjustment: (employeeId: string, newVal: string[]) => void;
}

export const FreeSaturdaysMobileList: React.FC<FreeSaturdaysMobileListProps> = ({
  employees,
  isLocked,
  adjustments,
  onSetAdjustment,
}) => {
  const handleDateChange = (employeeId: string, colIndex: number, newDate: string) => {
    const adj = adjustments.find((a) => a.employeeId === employeeId);
    let currentDates = adj?.dates ? [...adj.dates] : [];
    
    while (currentDates.length <= colIndex) {
      currentDates.push('');
    }
    currentDates[colIndex] = newDate;
    
    // Cleanup empty from end
    while (currentDates.length > 0 && !currentDates[currentDates.length - 1]) {
      currentDates.pop();
    }
    
    onSetAdjustment(employeeId, currentDates);
  };

  const handleAddDate = (employeeId: string) => {
     const adj = adjustments.find((a) => a.employeeId === employeeId);
     const currentDates = adj?.dates ? [...adj.dates] : [];
     currentDates.push('');
     onSetAdjustment(employeeId, currentDates);
  };

  const handleRemoveDate = (employeeId: string, indexToRemove: number) => {
     const adj = adjustments.find((a) => a.employeeId === employeeId);
     if (!adj?.dates) return;
     const currentDates = adj.dates.filter((_, i) => i !== indexToRemove);
     onSetAdjustment(employeeId, currentDates);
  };

  return (
    <div className="space-y-3">
      {employees.map((emp) => {
        const adjDates = adjustments.find(a => a.employeeId === emp.id)?.dates || [];

        return (
          <div key={emp.id} className="dash-glass p-4">
            <div className="mb-4 flex items-center gap-3 border-b border-white/40 pb-3 dark:border-white/10">
              <div
                className="dash-table-avatar dash-table-avatar--lg"
                style={{ backgroundColor: getAvatarColor(emp.id) }}
              >
                {displayName(emp.name).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold tracking-tight">{displayName(emp.name)}</h3>
                <p className="truncate text-xs text-indigo-950/50 dark:text-indigo-100/50">{emp.role}</p>
              </div>
              {!isLocked && (
                 <button
                   onClick={() => handleAddDate(emp.id)}
                   className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/12 text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
                 >
                   <Plus className="h-5 w-5" />
                 </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="mb-2 text-xs font-semibold uppercase text-indigo-950/40 dark:text-indigo-100/45">Daty wolnych sobót ({adjDates.filter(d => d).length})</div>
              {adjDates.length === 0 ? (
                <div className="text-sm italic text-indigo-950/40 dark:text-indigo-100/45">Brak wpisanych dat</div>
              ) : (
                <div className="flex flex-col gap-2">
                   {adjDates.map((dateVal, i) => (
                     <div key={i} className="flex items-center gap-2">
                        {isLocked ? (
                           <div className={cn(
                             "flex h-10 flex-1 items-center rounded-xl border px-3 text-sm font-medium transition-all",
                             dateVal
                               ? "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                               : "border-dashed border-indigo-950/15 bg-white/40 text-indigo-950/35 dark:border-white/10 dark:bg-white/[0.03] dark:text-indigo-100/35"
                           )}>
                              {dateVal || '—'}
                           </div>
                        ) : (
                           <>
                             <input
                               type="date"
                               value={dateVal}
                               onChange={(e) => handleDateChange(emp.id, i, e.target.value)}
                               className="flex-1 appearance-none rounded-xl border border-indigo-950/12 bg-white/70 px-3 py-2 text-sm font-medium text-indigo-950 shadow-sm outline-none transition-all hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
                             />
                             <button
                               onClick={() => handleRemoveDate(emp.id, i)}
                               className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                             >
                                <Trash2 className="h-4 w-4" />
                             </button>
                           </>
                        )}
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
