import React, { useState, useEffect, useCallback } from 'react';
import { Employee } from '../../../types';
import { cn, getAvatarColor, displayName } from '../../../utils';
import { Phone, Check, Loader2 } from 'lucide-react';

interface PhonesDesktopTableProps {
  employees: Employee[];
  isLocked: boolean;
  onUpdatePhone: (employeeId: string, newPhone: string) => void;
}

interface PhoneInputProps {
  value: string;
  onCommit: (val: string) => void;
  isSaving: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onCommit, isSaving }) => {
  const [draft, setDraft] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraft(value);
    }
  }, [value, isFocused]);

  const commitDraft = useCallback(() => {
    if (draft !== value) {
      onCommit(draft);
    }
  }, [onCommit, draft, value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    commitDraft();
  }, [commitDraft]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') e.currentTarget.blur();
      if (e.key === 'Escape') {
        setDraft(value);
        e.currentTarget.blur();
      }
    },
    [value],
  );

  return (
    <div className="relative flex w-full max-w-[200px] items-center">
        <div className="absolute left-3 text-indigo-950/40 dark:text-indigo-100/40">
             <Phone className="h-4 w-4" />
        </div>
        <input
            type="tel"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="np. 123 456 789"
            maxLength={20}
            className="w-full rounded-xl border border-indigo-950/12 bg-white/70 py-2 pl-9 pr-8 text-center text-sm font-semibold text-indigo-950 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
        />
        {isSaving && (
            <div className="absolute right-3 text-indigo-500">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        )}
        {!isSaving && draft === value && draft.trim() !== '' && !isFocused && (
            <div className="absolute right-3 text-emerald-500">
                <Check className="w-4 h-4" />
            </div>
        )}
    </div>
  );
};

export const PhonesDesktopTable: React.FC<PhonesDesktopTableProps> = ({
  employees,
  isLocked,
  onUpdatePhone,
}) => {
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleUpdate = (employeeId: string, newVal: string) => {
      setSavingId(employeeId);
      onUpdatePhone(employeeId, newVal);
      setTimeout(() => setSavingId(null), 500); // UI feedback
  };

  if (employees.length === 0) {
    return (
      <div className="dash-glass flex flex-col items-center justify-center border-dashed p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
          <Phone className="h-8 w-8" />
        </div>
        <p className="font-medium text-indigo-950/55 dark:text-indigo-100/55">Brak pracowników w systemie.</p>
      </div>
    );
  }

  return (
    <div className="dash-glass flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="dash-scroll min-h-0 flex-1 overflow-auto">
        <table className="dash-table relative">
          <thead className="dash-thead">
            <tr>
              <th className="dash-th w-[80px] !pl-6">Lp.</th>
              <th className="dash-th min-w-[300px]">Pracownik</th>
              <th className="dash-th dash-th--center min-w-[200px]">Numer telefonu</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {employees.map((emp, index) => {
              if (emp.isSeparator) {
                return (
                  <tr key={emp.id} className="text-indigo-950/40 dark:text-indigo-100/40">
                    <td className="dash-td !py-2.5 !pl-6 font-mono text-xs">{index + 1}</td>
                    <td colSpan={2} className="dash-td !py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-indigo-950/12 dark:bg-white/10"></div>
                        <span className="px-2 text-xs font-bold uppercase tracking-widest opacity-70">
                          {emp.name === 'separator' ? 'SEPARATOR' : emp.name}
                        </span>
                        <div className="h-px flex-1 bg-indigo-950/12 dark:bg-white/10"></div>
                      </div>
                    </td>
                  </tr>
                );
              }

              const phoneValue = emp.phone || '';

              return (
                <tr key={emp.id} className="group dash-trow">
                  <td className="dash-td !py-2 !pl-6 font-mono text-xs text-indigo-950/35 transition-colors group-hover:text-indigo-600 dark:text-indigo-100/35">
                    {index + 1}
                  </td>
                  <td className="dash-td !py-2">
                    <div className="flex items-center gap-4">
                      <div
                        className="dash-table-avatar"
                        style={{ backgroundColor: getAvatarColor(emp.id) }}
                      >
                        {displayName(emp.name).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-tight">
                          {displayName(emp.name)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="dash-td !py-2">
                    <div className={cn(
                        "flex items-center justify-center transition-all duration-300",
                        isLocked ? "opacity-60 scale-95 pointer-events-none filter select-none" : "opacity-100 scale-100"
                    )}>
                        <PhoneInput 
                            value={phoneValue}
                            onCommit={(val) => handleUpdate(emp.id, val)}
                            isSaving={savingId === emp.id}
                        />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
