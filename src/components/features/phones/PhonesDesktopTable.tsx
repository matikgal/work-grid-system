import React, { useState, useEffect, useCallback } from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
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
    <div className="relative flex items-center w-full max-w-[200px]">
        <div className="absolute left-3 text-slate-400">
             <Phone className="w-4 h-4" />
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
            className="w-full pl-9 pr-8 py-2 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all text-center"
        />
        {isSaving && (
            <div className="absolute right-3 text-brand-500">
                <Loader2 className="w-4 h-4 animate-spin" />
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
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Brak pracowników w systemie.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse relative">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-20 backdrop-blur-md">
            <tr>
              <th className="font-bold py-3 px-4 pl-6 border-b border-r border-slate-200 dark:border-slate-700/50 w-[80px]">Lp.</th>
              <th className="font-bold py-3 px-4 border-b border-r border-slate-200 dark:border-slate-700/50 min-w-[300px]">Pracownik</th>
              <th className="font-bold py-3 px-4 border-b border-slate-200 dark:border-slate-700/50 min-w-[200px] text-center">Numer telefonu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
            {employees.map((emp, index) => {
              if (emp.isSeparator) {
                return (
                  <tr key={emp.id} className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500">
                    <td className="py-2.5 px-4 pl-6 border-r border-slate-100 dark:border-slate-800 font-mono text-xs">{index + 1}</td>
                    <td colSpan={2} className="py-2.5 px-4 border-r border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                        <span className="font-bold tracking-widest uppercase text-xs px-2 opacity-50">
                          {emp.name === 'separator' ? 'SEPARATOR' : emp.name}
                        </span>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                      </div>
                    </td>
                  </tr>
                );
              }

              const phoneValue = emp.phone || '';

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="py-2 px-4 pl-6 border-r border-slate-100 dark:border-slate-800 text-slate-400 font-mono text-xs group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 border-r border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm shadow-sm border-[3px] border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800/50"
                      >
                        {displayName(emp.name).substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {displayName(emp.name)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-slate-100 dark:border-slate-800">
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
