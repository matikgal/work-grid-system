import React, { useState, useEffect } from 'react';
import { Employee } from '../../../types';
import { cn, getAvatarColor, displayName } from '../../../utils';
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
      <div className="dash-glass mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden">
        <div className="dash-scroll relative min-h-0 flex-1 overflow-auto">
          <table className="dash-table min-w-max">
            <thead className="dash-thead">
              <tr>
                <th className="dash-th dash-th--sticky-left !z-30">
                  Pracownik
                </th>
                {ArrayOfColumns.map((_, i) => (
                  <th key={i} className="dash-th dash-th--center group/th relative w-40">
                    <div className="flex items-center justify-center gap-2">
                       Data
                       {!isLocked && (
                         <button
                            onClick={() => handleDeleteColumnPrompt(i)}
                            className="rounded-full p-1 text-indigo-950/25 opacity-0 transition-all hover:bg-rose-500/12 hover:text-rose-500 group-hover/th:opacity-100 dark:text-indigo-100/30"
                            title="Usuń całą kolumnę"
                         >
                            <Trash2 className="h-3.5 w-3.5" />
                         </button>
                       )}
                    </div>
                  </th>
                ))}
                {!isLocked && (
                  <th className="dash-th w-16 shrink-0 border-l border-indigo-950/10 dark:border-white/10">
                    <button
                      onClick={handleAddColumn}
                      disabled={columnCount >= 4}
                      className="mx-auto ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/12 text-indigo-600 shadow-sm transition-colors hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-30 dark:text-indigo-300"
                      title={columnCount >= 4 ? "Osiągnięto limit kolumn (4)" : "Dodaj kolumnę daty"}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </th>
                )}
                <th className="dash-th w-full"></th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={columnCount + 2} className="p-8 text-center text-indigo-950/50 dark:text-indigo-100/50">Brak pracowników</td>
                </tr>
              ) : [...employees].sort((a, b) => {
                  const getLastName = (name: string) => {
                    const parts = name.trim().split(/\s+/);
                    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
                  };
                  return getLastName(a.name).localeCompare(getLastName(b.name), 'pl');
              }).map((emp, index) => {
                const adjDates = adjustments.find((a) => a.employeeId === emp.id)?.dates || [];
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={emp.id}
                    className={cn('group dash-trow last:border-0', isEven && 'dash-trow--alt')}
                  >
                    <td className="dash-td dash-td--sticky-left">
                      <div className="flex items-center gap-3">
                        <div
                          className="dash-table-avatar"
                          style={{ backgroundColor: getAvatarColor(emp.id) }}
                        >
                          {displayName(emp.name).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="whitespace-nowrap text-sm font-semibold">{displayName(emp.name)}</div>
                          <div className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-indigo-950/40 dark:text-indigo-100/45">{emp.role}</div>
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
                                "inline-flex h-9 min-w-[120px] items-center justify-center rounded-xl border px-3 text-sm font-medium transition-all",
                                dateValue
                                  ? "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 shadow-sm dark:text-indigo-300"
                                  : "border-dashed border-indigo-950/15 bg-white/40 text-indigo-950/35 dark:border-white/10 dark:bg-white/[0.03] dark:text-indigo-100/35"
                              )}>
                                 {dateValue ? dateValue : <span className="text-indigo-950/25 dark:text-indigo-100/25">—</span>}
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/input flex justify-center items-center gap-1.5">
                              <button
                                onClick={() => toggleCell(emp.id, i)}
                                className={cn(
                                  "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border outline-none transition-all",
                                  isCellSelected ? "border-amber-500 bg-amber-500 shadow-md" : "border-indigo-950/15 bg-white/70 opacity-0 hover:border-amber-400 group-hover/td:opacity-100 dark:border-white/15 dark:bg-white/10"
                                )}
                                title={isCellSelected ? "Odznacz komórkę" : "Zaznacz komórkę"}
                              >
                                {isCellSelected && <CheckSquare className="h-3.5 w-3.5 text-white" />}
                              </button>
                              <input
                                type="date"
                                value={dateValue}
                                onChange={(e) => handleDateChange(emp.id, i, e.target.value)}
                                className={cn(
                                   "w-[140px] appearance-none rounded-xl border px-3 py-1.5 text-sm font-medium shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20",
                                   isCellSelected
                                     ? "border-amber-300 bg-amber-50/60 text-amber-900 hover:border-amber-400 dark:border-amber-700/80 dark:bg-amber-900/20 dark:text-amber-100 dark:hover:border-amber-600"
                                     : "border-indigo-950/12 bg-white/70 text-indigo-950 hover:border-indigo-400 focus:border-indigo-500 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
                                )}
                              />
                              {/* Clear option if date exists */}
                              {dateValue && (
                                <button
                                  onClick={() => handleDateChange(emp.id, i, '')}
                                  title="Wyczyść"
                                  className="absolute right-[-6px] top-[-6px] z-10 flex h-5 w-5 items-center justify-center rounded-full border border-indigo-950/10 bg-white text-rose-500 opacity-0 shadow-sm transition-all hover:scale-110 hover:bg-rose-50 group-hover/input:opacity-100 dark:border-white/10 dark:bg-[#14121f] dark:hover:bg-rose-500/10"
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
                      <td className="border-l border-indigo-950/10 p-3 dark:border-white/10">
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
