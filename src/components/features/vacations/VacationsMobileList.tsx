import React from 'react';
import { Palmtree } from 'lucide-react';
import { Employee } from '../../../types';
import { cn, getAvatarColor, displayName } from '../../../utils';

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
        const isHighlighted = highlightedEmployees.has(emp.id);

        return (
          <div
            key={emp.id}
            className={cn(
              'dash-glass p-4 transition-all',
              isHighlighted && 'ring-1 ring-amber-400/50',
            )}
          >
            <div className="mb-4 flex items-center gap-3 border-b border-white/40 pb-3 dark:border-white/10">
              <button
                disabled={isLocked}
                onClick={() => onToggleHighlight(emp.id, isHighlighted, balanceNum, manuals)}
                className={cn(
                  'dash-table-avatar dash-table-avatar--lg transition-all',
                  isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-110 active:scale-95',
                )}
                style={{ backgroundColor: getAvatarColor(emp.id) }}
              >
                {isHighlighted ? <Palmtree className="h-5 w-5 text-white" /> : displayName(emp.name).charAt(0).toUpperCase()}
              </button>
              <div className="flex-1">
                <h3 className="font-semibold tracking-tight">{displayName(emp.name)}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-indigo-950/45 dark:text-indigo-100/50">Zeszły rok/Inne:</span>
                  <input
                    type="number"
                    className="w-16 rounded-md border border-indigo-950/12 bg-white/70 px-1.5 py-0.5 text-sm text-indigo-950 focus:border-indigo-500 focus:outline-none disabled:opacity-50 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
                    value={balance}
                    onChange={(e) => onUpdateBalance(emp.id, e.target.value, isHighlighted, manuals)}
                    placeholder="0"
                    disabled={isLocked}
                  />
                </div>
              </div>
              <div className="ml-auto text-right">
                <span className="block text-xs font-semibold uppercase text-indigo-950/40 dark:text-indigo-100/45">Razem</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-300">{total}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((month, idx) => (
                <div
                  key={month}
                  className="rounded-lg border border-white/40 bg-white/45 p-1.5 text-center dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span className="mb-0.5 block text-[9px] font-semibold uppercase text-indigo-950/40 dark:text-indigo-100/45">
                    {month.substring(0, 3)}
                  </span>
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        counts[idx] > 0 ? 'text-indigo-950 dark:text-indigo-50' : 'text-indigo-950/25 dark:text-indigo-100/25',
                      )}
                    >
                      {counts[idx] || '-'}
                    </span>
                    {!isLocked && (
                      <div className="flex items-center">
                        <span className="ml-1 text-xs font-bold text-indigo-500">+</span>
                        <input
                          type="number"
                          value={manuals[idx] || 0}
                          onChange={(e) => onUpdateManualDays(emp.id, idx, e.target.value, manuals, balanceNum, isHighlighted)}
                          className="ml-1 w-8 rounded border border-indigo-950/12 bg-white/70 text-center text-xs text-indigo-950 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
                        />
                      </div>
                    )}
                    {isLocked && (manuals[idx] || 0) > 0 && (
                      <span className="ml-1 text-xs font-bold text-indigo-500" title="Dni dodane ręcznie">
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
