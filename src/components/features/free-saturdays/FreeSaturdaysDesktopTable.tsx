import React, { useState, useEffect } from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
import { WsAdjustment } from '../../../services/adjustmentService';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { ConfirmModal } from '../../shared/ConfirmModal';

interface FreeSaturdaysDesktopTableProps {
  employees: Employee[];
  isLocked: boolean;
  adjustments: WsAdjustment[];
  onUpdateAdjustment: (employeeId: string, updates: { dates?: string[]; markedDates?: number[] }) => void;
}

export const FreeSaturdaysDesktopTable: React.FC<FreeSaturdaysDesktopTableProps> = ({
  employees,
  isLocked,
  adjustments,
  onUpdateAdjustment,
}) => {
  const [columnCount, setColumnCount] = useState(1);
  
  // Modal usuwania kolumny
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [colToDelete, setColToDelete] = useState<number | null>(null);

  // Zaktualizuj liczbę kolumn
  useEffect(() => {
    const maxDates = Math.max(0, ...adjustments.map((a) => (a.dates || []).length));
    if (maxDates > columnCount) {
      setColumnCount(Math.min(maxDates, 4));
    }
  }, [adjustments, columnCount]);

  const handleAddColumn = () => {
    setColumnCount((prev) => Math.min(prev + 1, 4));
  };

  const handleDeleteColumnPrompt = (index: number) => {
    setColToDelete(index);
    setIsConfirmModalOpen(true);
  };
  
  const confirmDeleteColumn = () => {
    if (colToDelete === null) return;
    employees.forEach((emp) => {
      const adj = adjustments.find(a => a.employeeId === emp.id);
      if (adj && adj.dates && adj.dates.length > colToDelete) {
        const newDates = adj.dates.filter((_, i) => i !== colToDelete);
        const newMarked = (adj.markedDates || [])
           .filter((x) => x !== colToDelete)
           .map((x) => (x > colToDelete ? x - 1 : x));
        onUpdateAdjustment(emp.id, { dates: newDates, markedDates: newMarked });
      } else if (adj && (adj.markedDates || []).includes(colToDelete)) {
        // Just in case they had a marked date without actual text, though unlikely
        const newMarked = (adj.markedDates || [])
           .filter((x) => x !== colToDelete)
           .map((x) => (x > colToDelete ? x - 1 : x));
        onUpdateAdjustment(emp.id, { markedDates: newMarked });
      }
    });
    setColumnCount(prev => Math.max(1, prev - 1));
    setColToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleDateChange = (employeeId: string, colIndex: number, newDate: string) => {
    const adj = adjustments.find((a) => a.employeeId === employeeId);
    let currentDates = adj?.dates ? [...adj.dates] : [];
    
    while (currentDates.length <= colIndex) {
      currentDates.push('');
    }
    
    currentDates[colIndex] = newDate;
    
    while (currentDates.length > 0 && !currentDates[currentDates.length - 1]) {
      currentDates.pop();
    }
    
    onUpdateAdjustment(employeeId, { dates: currentDates });
  };

  const toggleCell = (employeeId: string, colIndex: number) => {
    if (isLocked) return;
    const adj = adjustments.find((a) => a.employeeId === employeeId);
    const existingMarked = adj?.markedDates || [];
    let newMarked = [...existingMarked];
    
    if (newMarked.includes(colIndex)) {
      newMarked = newMarked.filter(i => i !== colIndex);
    } else {
      newMarked.push(colIndex);
    }
    onUpdateAdjustment(employeeId, { markedDates: newMarked });
  };

  const ArrayOfColumns = Array.from({ length: columnCount });

  return (
    <>
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider sticky left-0 bg-slate-50 dark:bg-[#151e2e] z-30 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">
                  Pracownik
                </th>
                {ArrayOfColumns.map((_, i) => (
                  <th key={i} className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center w-40 relative group/th">
                    <div className="flex items-center justify-center gap-2">
                       Data
                       {!isLocked && (
                         <button 
                            onClick={() => handleDeleteColumnPrompt(i)}
                            className="p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover/th:opacity-100"
                            title="Usuń całą kolumnę"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                       )}
                    </div>
                  </th>
                ))}
                {!isLocked && (
                  <th className="p-3 w-16 text-center shrink-0 border-l border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-[#151e2e]">
                    <button
                      onClick={handleAddColumn}
                      disabled={columnCount >= 4}
                      className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 flex items-center justify-center hover:bg-brand-200 dark:hover:bg-brand-900/60 transition-colors mx-auto shadow-sm ml-2 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={columnCount >= 4 ? "Osiągnięto limit kolumn (4)" : "Dodaj kolumnę daty"}
                    >
                      <Plus className="w-4 h-4 font-bold" />
                    </button>
                  </th>
                )}
                <th className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={columnCount + 2} className="p-8 text-center text-slate-500">Brak pracowników</td>
                </tr>
              ) : [...employees].sort((a, b) => {
                  const getLastName = (name: string) => {
                    const parts = name.trim().split(/\s+/);
                    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
                  };
                  return getLastName(a.name).localeCompare(getLastName(b.name), 'pl');
              }).map((emp, index) => {
                const adjDates = adjustments.find((a) => a.employeeId === emp.id)?.dates || [];
                const isTailwindClass = emp.avatarColor?.startsWith('bg-');
                const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={emp.id}
                    className={cn(
                      'group transition-colors',
                      isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50',
                      'hover:bg-slate-50 hover:dark:bg-slate-800/50'
                    )}
                  >
                    <td className={cn(
                      "p-3 sticky left-0 z-10 transition-colors shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b] group-hover:shadow-[1px_0_0_0_#e2e8f0] dark:group-hover:shadow-[1px_0_0_0_#334155]",
                      isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-[#151e2e]',
                      'group-hover:bg-slate-50 dark:group-hover:bg-[#151e2e]'
                    )}>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm',
                            emp.avatarColor,
                          )}
                          style={avatarStyle}
                        >
                          {displayName(emp.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 dark:text-slate-200 text-sm whitespace-nowrap">{displayName(emp.name)}</div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    
                    {ArrayOfColumns.map((_, i) => {
                      const dateValue = adjDates[i] || '';
                      
                      const adj = adjustments.find((a) => a.employeeId === emp.id);
                      const isCellSelected = (adj?.markedDates || []).includes(i);

                      return (
                        <td key={i} className={cn("p-2 text-center transition-colors relative group/td rounded-md box-border border-b-0", isCellSelected && "bg-amber-100 dark:bg-amber-900/40")}>
                          {isLocked ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <div className={cn(
                                "w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all",
                                isCellSelected ? "bg-amber-500 border-amber-500 shadow-md opacity-80 cursor-not-allowed" : "border-transparent bg-transparent opacity-0"
                              )}>
                                {isCellSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className={cn(
                                "inline-flex items-center justify-center min-w-[120px] h-9 px-3 rounded-xl border text-sm font-medium transition-all",
                                dateValue 
                                  ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-300 shadow-sm"
                                  : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-500 border-dashed"
                              )}>
                                 {dateValue ? dateValue : <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/input flex justify-center items-center gap-1.5">
                              <button 
                                onClick={() => toggleCell(emp.id, i)}
                                className={cn(
                                  "w-5 h-5 rounded flex items-center justify-center transition-all shrink-0 outline-none border cursor-pointer",
                                  isCellSelected ? "bg-amber-500 border-amber-500 shadow-md" : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 hover:border-amber-400 opacity-0 group-hover/td:opacity-100"
                                )}
                                title={isCellSelected ? "Odznacz komórkę" : "Zaznacz komórkę"}
                              >
                                {isCellSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                              </button>
                              <input
                                type="date"
                                value={dateValue}
                                onChange={(e) => handleDateChange(emp.id, i, e.target.value)}
                                className={cn(
                                   "w-[140px] appearance-none border rounded-xl px-3 py-1.5 outline-none transition-all shadow-sm focus:ring-2 focus:ring-brand-500/20 text-sm font-medium",
                                   isCellSelected 
                                     ? "bg-amber-50/50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/80 hover:border-amber-400 dark:hover:border-amber-600 text-amber-900 dark:text-amber-100" 
                                     : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 focus:border-brand-500 text-slate-700 dark:text-slate-200"
                                )}
                              />
                              {/* Clear option if date exists */}
                              {dateValue && (
                                <button
                                  onClick={() => handleDateChange(emp.id, i, '')}
                                  title="Wyczyść"
                                  className="absolute right-[-6px] top-[-6px] w-5 h-5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-rose-500 rounded-full flex items-center justify-center shadow-sm hover:scale-110 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all z-10 opacity-0 group-hover/input:opacity-100"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    
                    {!isLocked && (
                      <td className="p-3 border-l border-slate-100 dark:border-slate-800/50">
                         <span className="w-8"></span> {/* Placeholder matching header */}
                      </td>
                    )}
                    <td className="w-full min-w-[20px]"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteColumn}
        title="Usuń kolumnę danych"
        message="Czy na pewno chcesz usunąć tę kolumnę? Zostaną usunięte przypisane daty dla wszystkich pracowników z tej kolumny. Tej operacji nie cofniemy."
        confirmLabel="Tak, usuń"
        variant="danger"
      />
    </>
  );
};
