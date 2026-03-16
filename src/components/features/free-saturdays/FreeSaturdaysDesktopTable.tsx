import React, { useState, useCallback } from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
import { WsAdjustment } from '../../../services/adjustmentService';

interface FreeSaturdaysDesktopTableProps {
  employees: Employee[];
  isLocked: boolean;
  adjustments: WsAdjustment[];
  onSetAdjustment: (employeeId: string, newVal: number) => void;
}

interface StepperInputProps {
  value: number;
  onCommit: (val: number) => void;
}

const StepperInput: React.FC<StepperInputProps> = ({ value, onCommit }) => {
  const [draft, setDraft] = useState(String(value));

  React.useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = useCallback((raw: string) => {
    const parsed = parseInt(raw, 10);
    const next = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setDraft(String(next));
    onCommit(next);
  }, [onCommit]);

  const handleBlur = useCallback(() => commitDraft(draft), [commitDraft, draft]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') e.currentTarget.blur();
      if (e.key === 'Escape') {
        setDraft(String(value));
        e.currentTarget.blur();
      }
    },
    [value],
  );

  const step = useCallback((delta: number) => {
    const next = Math.max(0, value + delta);
    onCommit(next);
  }, [value, onCommit]);

  const btnBase =
    'w-7 h-7 rounded-full flex items-center justify-center text-base font-bold leading-none transition-colors select-none ' +
    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ' +
    'hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-900/40 dark:hover:text-brand-400 ' +
    'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Zmniejsz"
        className={btnBase}
      >
        −
      </button>
      <input
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-14 text-center font-mono font-bold text-sm rounded-lg px-1 py-1',
          'bg-white dark:bg-slate-800 border border-brand-400 dark:border-brand-500',
          'text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        )}
        aria-label="Liczba wolnych sobót"
      />
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Zwiększ"
        className={btnBase}
      >
        +
      </button>
    </div>
  );
};

export const FreeSaturdaysDesktopTable: React.FC<FreeSaturdaysDesktopTableProps> = ({
  employees,
  isLocked,
  adjustments,
  onSetAdjustment,
}) => {
  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Pracownik</th>
            <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">Wolne Soboty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={2} className="p-8 text-center text-slate-500">Brak pracowników</td>
            </tr>
          ) : employees.map((emp, index) => {
            const adj = adjustments.find(a => a.employeeId === emp.id)?.adjustment ?? 0;
            const isTailwindClass = emp.avatarColor?.startsWith('bg-');
            const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };
            const isEven = index % 2 === 0;

            return (
              <tr
                key={emp.id}
                className={cn(
                  'group transition-colors',
                  isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-900/50',
                  'hover:bg-slate-50 hover:dark:bg-slate-800/50',
                )}
              >
                <td className="p-2 md:p-3">
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
                      <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{displayName(emp.name)}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{emp.role}</div>
                    </div>
                  </div>
                </td>
                <td className="p-2 md:p-3 text-center">
                  {isLocked ? (
                    <span className="font-mono text-slate-700 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm">
                      {adj}
                    </span>
                  ) : (
                    <div className="flex justify-center">
                      <StepperInput
                        value={adj}
                        onCommit={(val) => onSetAdjustment(emp.id, val)}
                      />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
