import React from 'react';
import { Palmtree } from 'lucide-react';
import { Employee } from '../../../types';
import { cn, stringToColor } from '../../../utils';

interface VacationsMobileListProps {
  employees: Employee[];
  isLocked: boolean;
  MONTHS: string[];
  vacationCounts: Record<string, number[]>;
  vacationBalances: Record<string, number>;
  vacationManual: Record<string, number[]>;
  highlightedEmployees: Set<string>;
  onUpdateBalance: (employeeId: string, value: string, isHighlighted: boolean, manualDays: number[]) => void;
  onUpdateManualDays: (employeeId: string, monthIndex: number, value: string, currentManual: number[], balance: number, isHighlighted: boolean) => void;
  onToggleHighlight: (employeeId: string, isCurrentlyHighlighted: boolean, balance: number, manualDays: number[]) => void;
  calculateTotal: (counts: number[], manuals: number[]) => number;
}

export const VacationsMobileList: React.FC<VacationsMobileListProps> = ({
  employees,
  isLocked,
  MONTHS,
  vacationCounts,
  vacationBalances,
  vacationManual,
  highlightedEmployees,
  onUpdateBalance,
  onUpdateManualDays,
  onToggleHighlight,
  calculateTotal,
}) => {
  return (
    <div className="space-y-3">
        {employees.map((emp) => {
            const counts = vacationCounts[emp.id] || Array(12).fill(0);
            const manuals = vacationManual[emp.id] || Array(12).fill(0);
            const total = calculateTotal(counts, manuals);
            const balance = vacationBalances[emp.id] ?? ''; 
            const balanceNum = vacationBalances[emp.id] || 0;
            const isTailwindClass = emp.avatarColor?.startsWith('bg-');
            const isHighlighted = highlightedEmployees.has(emp.id);

            return (
                <div key={emp.id} className={cn(
                    "rounded-xl p-4 shadow-sm border transition-all",
                    isHighlighted 
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}>
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <button 
                            disabled={isLocked}
                            onClick={() => onToggleHighlight(emp.id, isHighlighted, balanceNum, manuals)}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-all",
                                isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:scale-110 active:scale-95",
                                emp.avatarColor
                            )}
                            style={!isTailwindClass ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}
                        >
                            {isHighlighted ? <Palmtree className="w-5 h-5 text-white" /> : emp.name.charAt(0).toUpperCase()}
                        </button>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-white">{emp.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400">Zeszły rok/Inne:</span>
                                <input 
                                    type="number" 
                                    className="w-16 px-1.5 py-0.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                                    value={balance}
                                    onChange={(e) => onUpdateBalance(emp.id, e.target.value, isHighlighted, manuals)}
                                    placeholder="0"
                                    disabled={isLocked}
                                />
                            </div>
                        </div>
                        <div className="ml-auto text-right">
                            <span className="text-xs font-bold uppercase text-slate-400 block">Razem</span>
                            <span className="text-xl font-black text-orange-600 dark:text-orange-400">{total}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {MONTHS.map((month, idx) => (
                            <div key={month} className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">{month.substring(0, 3)}</span>
                                <div className="flex justify-center items-center gap-1">
                                    <span className={cn("text-sm font-bold", counts[idx] > 0 ? "text-slate-800 dark:text-white" : "text-slate-300 dark:text-slate-600")}>
                                        {counts[idx] || '-'}
                                    </span>
                                    {!isLocked && (
                                        <div className="flex items-center">
                                            <span className="text-xs text-orange-500 font-bold ml-1">+</span>
                                            <input
                                                type="number"
                                                value={manuals[idx] || 0}
                                                onChange={(e) => onUpdateManualDays(emp.id, idx, e.target.value, manuals, balanceNum, isHighlighted)}
                                                className="w-8 ml-1 text-center text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                                            />
                                        </div>
                                    )}
                                    {isLocked && (manuals[idx] || 0) > 0 && (
                                        <span className="text-xs text-orange-500 font-bold ml-1" title="Dni dodane ręcznie">
                                            +{manuals[idx]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
    </div>
  );
};
