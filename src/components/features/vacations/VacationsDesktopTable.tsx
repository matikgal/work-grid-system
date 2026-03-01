import React from 'react';
import { Palmtree } from 'lucide-react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';

interface VacationsDesktopTableProps {
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

export const VacationsDesktopTable: React.FC<VacationsDesktopTableProps> = ({
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
            <tr>
                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider w-[250px]">Pracownik</th>
                {MONTHS.map(month => (
                    <th key={month} className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">{month.substring(0, 3)}</th>
                ))}
                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center bg-slate-100 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700">Suma</th>
            </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-700">
            {employees.length === 0 ? (
                <tr>
                    <td colSpan={14} className="p-8 text-center text-slate-500">Brak pracowników</td>
                </tr>
            ) : employees.map((emp, index) => {
                const counts = vacationCounts[emp.id] || Array(12).fill(0);
                const manuals = vacationManual[emp.id] || Array(12).fill(0);
                const total = calculateTotal(counts, manuals);
                const balanceInput = vacationBalances[emp.id] ?? 0;
                const remaining = balanceInput - total;
                
                const isTailwindClass = emp.avatarColor?.startsWith('bg-');
                const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };

                const isEven = index % 2 === 0;
                const isHighlighted = highlightedEmployees.has(emp.id);

                return (
                    <tr key={emp.id} className={cn(
                        "group transition-colors",
                        isHighlighted 
                            ? "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30" 
                            : (isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900/50"),
                        !isHighlighted && "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}>
                        <td className="p-3 border-r-2 border-slate-300 dark:border-slate-700">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    <button 
                                        disabled={isLocked}
                                        onClick={() => onToggleHighlight(emp.id, isHighlighted, balanceInput, manuals)}
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-all",
                                            isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:scale-110 active:scale-95",
                                            emp.avatarColor
                                        )}
                                        style={avatarStyle}
                                        title={isLocked ? "Odblokuj edycję aby zaznaczyć" : "Kliknij aby wyróżnić"}
                                    >
                                        {isHighlighted ? <Palmtree className="w-4 h-4 text-white" /> : displayName(emp.name).charAt(0).toUpperCase()}
                                    </button>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{displayName(emp.name)}</div>
                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">{emp.role}</div>
                                    </div>
                                </div>
                                
                               <div className="flex flex-col items-center shrink-0">
                                    <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Zaległe</span>
                                    <input 
                                        type="number" 
                                        className="w-16 h-8 px-1 text-sm font-bold text-center border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-300 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                                        value={balanceInput || ''}
                                        onChange={(e) => onUpdateBalance(emp.id, e.target.value, isHighlighted, manuals)}
                                        placeholder="0"
                                        title="Dni zaległe lub przeniesione"
                                        disabled={isLocked}
                                    />
                                </div>
                            </div>
                        </td>
                        {counts.map((count, idx) => (
                            <td key={idx} className="p-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-0 relative">
                                <div className="flex flex-col justify-center items-center gap-1 h-full min-h-[50px]">
                                    {!isLocked ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                                <input
                                                type="number"
                                                value={manuals[idx] || 0}
                                                onChange={(e) => onUpdateManualDays(emp.id, idx, e.target.value, manuals, balanceInput, isHighlighted)}
                                                className="w-full max-w-[60px] h-10 text-center text-lg font-bold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                            />
                                            {count > 0 && (
                                                <div className="absolute -top-2 -right-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 shadow-sm z-10" title={`Urlop z grafiku: ${count}`}>
                                                    +{count}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <span className={cn(
                                                "font-mono text-base px-3 py-1.5 rounded-lg transition-colors",
                                                (count + (manuals[idx] || 0)) > 0 
                                                    ? "font-bold text-slate-800 dark:text-slate-100 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800" 
                                                    : "text-slate-300 dark:text-slate-600"
                                            )}>
                                                {(count + (manuals[idx] || 0)) || '-'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </td>
                        ))}
                        <td className="p-3 text-center bg-slate-100 dark:bg-slate-800/40 border-l-2 border-slate-300 dark:border-slate-700">
                            <span className={cn(
                                "font-black text-xl",
                                remaining < 0 ? "text-green-600 dark:text-green-400" : (remaining > 0 ? "text-orange-600 dark:text-orange-400" : "text-slate-400")
                            )}>{remaining}</span>
                        </td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    </div>
  );
};
