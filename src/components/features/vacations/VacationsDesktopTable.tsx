import React from 'react';
import { Palmtree } from 'lucide-react';
import { Employee } from '../../../types';
import { cn, getAvatarColor, displayName } from '../../../utils';

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
    <div className="dash-glass flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="dash-scroll min-h-0 flex-1 overflow-auto">
        <table className="dash-table">
          <thead className="dash-thead">
            <tr>
            <th className="dash-th w-[250px]">
              Pracownik
            </th>
            {MONTHS.map((month) => (
              <th key={month} className="dash-th dash-th--center">
                {month.substring(0, 3)}
              </th>
            ))}
            <th className="dash-th dash-th--sum">
              Suma
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan={14} className="p-8 text-center text-indigo-950/50 dark:text-indigo-100/50">
                Brak pracowników
              </td>
            </tr>
          ) : (
            employees.map((emp, index) => {
              const counts = vacationCounts[emp.id] || Array(12).fill(0);
              const manuals = vacationManual[emp.id] || Array(12).fill(0);
              const total = calculateTotal(counts, manuals);
              const balanceInput = vacationBalances[emp.id] ?? 0;
              const remaining = balanceInput - total;

              const isEven = index % 2 === 0;
              const isHighlighted = highlightedEmployees.has(emp.id);

              return (
                <tr
                  key={emp.id}
                  className={cn(
                    'group border-b border-indigo-950/[0.06] transition-colors last:border-0 dark:border-white/[0.06]',
                    isHighlighted
                      ? 'bg-amber-200/30 hover:bg-amber-200/45 dark:bg-amber-400/10 dark:hover:bg-amber-400/15'
                      : cn(
                          isEven ? 'bg-white/35 dark:bg-white/[0.02]' : 'bg-transparent',
                          'hover:bg-indigo-500/[0.06] dark:hover:bg-white/[0.05]',
                        ),
                  )}
                >
                  <td className="dash-td border-r border-indigo-950/10 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          disabled={isLocked}
                          onClick={() => onToggleHighlight(emp.id, isHighlighted, balanceInput, manuals)}
                          className={cn(
                            'dash-table-avatar transition-all',
                            isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-110 active:scale-95',
                          )}
                          style={{ backgroundColor: getAvatarColor(emp.id) }}
                          title={isLocked ? 'Odblokuj edycję aby zaznaczyć' : 'Kliknij aby wyróżnić'}
                        >
                          {isHighlighted ? <Palmtree className="h-4 w-4 text-white" /> : displayName(emp.name).charAt(0).toUpperCase()}
                        </button>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{displayName(emp.name)}</div>
                          <div className="truncate text-[10px] font-medium uppercase tracking-wider text-indigo-950/40 dark:text-indigo-100/45">
                            {emp.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-center">
                        <span className="mb-0.5 text-[9px] font-semibold uppercase text-indigo-950/40 dark:text-indigo-100/45">
                          Zaległe
                        </span>
                        <input
                          type="number"
                          className="h-8 w-16 rounded-md border border-indigo-950/12 bg-white/70 px-1 text-center text-sm font-semibold text-indigo-950 transition-all placeholder:text-indigo-950/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 disabled:opacity-50 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
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
                    <td key={idx} className="relative border-r border-indigo-950/[0.06] p-2 text-center last:border-0 dark:border-white/[0.06]">
                      <div className="flex h-full min-h-[50px] flex-col items-center justify-center gap-1">
                        {!isLocked ? (
                          <div className="relative flex h-full w-full items-center justify-center">
                            <input
                              type="number"
                              value={manuals[idx] || 0}
                              onChange={(e) => onUpdateManualDays(emp.id, idx, e.target.value, manuals, balanceInput, isHighlighted)}
                              className="h-10 w-full max-w-[60px] rounded-lg border border-indigo-950/12 bg-white/70 text-center text-lg font-semibold text-indigo-950 transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
                            />
                            {count > 0 && (
                              <div
                                className="absolute -top-2 -right-1 z-10 rounded-full border border-sky-500/25 bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 shadow-sm dark:text-sky-300"
                                title={`Urlop z grafiku: ${count}`}
                              >
                                +{count}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span
                              className={cn(
                                'rounded-lg px-3 py-1.5 font-mono text-base transition-colors',
                                count + (manuals[idx] || 0) > 0
                                  ? 'border border-indigo-500/20 bg-indigo-500/12 font-semibold text-indigo-800 dark:text-indigo-200'
                                  : 'text-indigo-950/25 dark:text-indigo-100/25',
                              )}
                            >
                              {count + (manuals[idx] || 0) || '-'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="dash-td dash-td--sum">
                    <span
                      className={cn(
                        'inline-flex min-w-[2.75rem] items-center justify-center rounded-full px-2.5 py-1 text-lg font-bold',
                        remaining < 0
                          ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                          : remaining > 0
                            ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
                            : 'text-indigo-950/35 dark:text-indigo-100/35',
                      )}
                    >
                      {remaining}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
