import React, { useState, useEffect, useCallback } from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
import { Phone, Check, Loader2, User } from 'lucide-react';

interface PhonesMobileListProps {
  employees: Employee[];
  isLocked: boolean;
  onUpdatePhone: (employeeId: string, newPhone: string) => void;
}

interface PhoneInputMobileProps {
  value: string;
  onCommit: (val: string) => void;
  isSaving: boolean;
}

const PhoneInputMobile: React.FC<PhoneInputMobileProps> = ({ value, onCommit, isSaving }) => {
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
    <div className="relative flex items-center w-full">
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
            placeholder="Wpisz numer telefonu..."
            maxLength={20}
            className="w-full pl-9 pr-8 py-2.5 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all font-mono"
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

export const PhonesMobileList: React.FC<PhonesMobileListProps> = ({
  employees,
  isLocked,
  onUpdatePhone,
}) => {
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleUpdate = (employeeId: string, newVal: string) => {
      setSavingId(employeeId);
      onUpdatePhone(employeeId, newVal);
      setTimeout(() => setSavingId(null), 500);
  };

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mx-2">
        <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Brak pracowników w bazie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 pb-6">
      {employees.map((emp) => {
        if (emp.isSeparator) {
          return (
            <div key={emp.id} className="flex items-center gap-3 py-4">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              <span className="font-bold tracking-widest uppercase text-xs px-2 text-slate-400 dark:text-slate-500">
                {emp.name === 'separator' ? 'SEPARATOR' : emp.name}
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>
          );
        }

        const phoneValue = emp.phone || '';

        return (
          <div
            key={emp.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col gap-4"
          >
            {/* Header: Avatar + Name */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm shadow-sm border-[3px] border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800/50 shrink-0"
              >
                {displayName(emp.name).substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {displayName(emp.name)}
                </span>
              </div>
            </div>

            {/* Editing Section */}
            <div className="pt-2">
                <div className={cn(
                    "transition-all duration-300 origin-bottom",
                    isLocked ? "opacity-50 scale-y-95 pointer-events-none filter select-none" : "opacity-100 scale-y-100"
                )}>
                    <PhoneInputMobile 
                        value={phoneValue}
                        onCommit={(val) => handleUpdate(emp.id, val)}
                        isSaving={savingId === emp.id}
                    />
                </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
