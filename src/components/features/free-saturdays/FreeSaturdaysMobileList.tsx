import React from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
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
        const isTailwindClass = emp.avatarColor?.startsWith('bg-');

        return (
          <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div
                className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm', emp.avatarColor)}
                style={!isTailwindClass ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}
              >
                {displayName(emp.name).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{displayName(emp.name)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.role}</p>
              </div>
              {!isLocked && (
                 <button
                   onClick={() => handleAddDate(emp.id)}
                   className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 flex items-center justify-center hover:bg-brand-100 transition-colors shrink-0"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase font-bold text-slate-400 mb-2">Daty wolnych sobót ({adjDates.filter(d => d).length})</div>
              {adjDates.length === 0 ? (
                <div className="text-sm text-slate-400 italic">Brak wpisanych dat</div>
              ) : (
                <div className="flex flex-col gap-2">
                   {adjDates.map((dateVal, i) => (
                     <div key={i} className="flex items-center gap-2">
                        {isLocked ? (
                           <div className={cn(
                             "flex-1 h-10 px-3 rounded-xl border text-sm font-medium transition-all flex items-center",
                             dateVal 
                               ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-300"
                               : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-500 border-dashed"
                           )}>
                              {dateVal || '—'}
                           </div>
                        ) : (
                           <>
                             <input
                               type="date"
                               value={dateVal}
                               onChange={(e) => handleDateChange(emp.id, i, e.target.value)}
                               className="flex-1 appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 focus:border-brand-500 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 outline-none transition-all shadow-sm focus:ring-2 focus:ring-brand-500/20 text-sm font-medium"
                             />
                             <button
                               onClick={() => handleRemoveDate(emp.id, i)}
                               className="w-10 h-10 flex items-center justify-center shrink-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors shrink-0"
                             >
                                <Trash2 className="w-4 h-4" />
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
