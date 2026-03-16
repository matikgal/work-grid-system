import React, { useState, useCallback } from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
import { WsAdjustment } from '../../../services/adjustmentService';

interface FreeSaturdaysMobileListProps {
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
    'w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold leading-none transition-colors select-none ' +
    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ' +
    'hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-900/40 dark:hover:text-brand-400 ' +
    'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

  return (
    <div className="flex items-center gap-2">
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
          'w-16 text-center font-mono font-bold text-lg rounded-lg px-1 py-1',
          'bg-white dark:bg-slate-700 border border-brand-400 dark:border-brand-500',
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

export const FreeSaturdaysMobileList: React.FC<FreeSaturdaysMobileListProps> = ({
  employees,
  isLocked,
  adjustments,
  onSetAdjustment,
}) => {
  return (
    <div className="space-y-3">
      {employees.map((emp) => {
        const adj = adjustments.find(a => a.employeeId === emp.id)?.adjustment ?? 0;
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
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{displayName(emp.name)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400">Wolne Soboty</span>
              {isLocked ? (
                <span className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {adj}
                </span>
              ) : (
                <StepperInput value={adj} onCommit={(val) => onSetAdjustment(emp.id, val)} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
