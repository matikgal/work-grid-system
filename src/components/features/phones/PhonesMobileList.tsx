import React, { useState, useEffect, useCallback } from 'react';
import { Employee } from '../../../types';
import { cn, getAvatarColor, displayName } from '../../../utils';
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
    <div className="relative flex w-full items-center">
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
            placeholder="Wpisz numer telefonu..."
            maxLength={20}
            className="w-full rounded-xl border border-indigo-950/12 bg-white/70 py-2.5 pl-9 pr-8 font-mono text-sm font-semibold text-indigo-950 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50"
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
      <div className="dash-glass mx-2 flex flex-col items-center justify-center border-dashed p-8 text-center">
        <User className="mb-3 h-12 w-12 text-indigo-950/25 dark:text-indigo-100/25" />
        <p className="font-medium text-indigo-950/55 dark:text-indigo-100/55">Brak pracowników w bazie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 pb-6">
      {employees.map((emp) => {
        if (emp.isSeparator) {
          return (
            <div key={emp.id} className="flex items-center gap-3 py-4">
              <div className="h-px flex-1 bg-indigo-950/12 dark:bg-white/10"></div>
              <span className="px-2 text-xs font-bold uppercase tracking-widest text-indigo-950/40 dark:text-indigo-100/45">
                {emp.name === 'separator' ? 'SEPARATOR' : emp.name}
              </span>
              <div className="h-px flex-1 bg-indigo-950/12 dark:bg-white/10"></div>
            </div>
          );
        }

        const phoneValue = emp.phone || '';

        return (
          <div
            key={emp.id}
            className="dash-glass relative flex flex-col gap-4 overflow-hidden p-4"
          >
            {/* Header: Avatar + Name */}
            <div className="flex items-center gap-3 border-b border-white/40 pb-3 dark:border-white/10">
              <div
                className="dash-table-avatar dash-table-avatar--lg"
                style={{ backgroundColor: getAvatarColor(emp.id) }}
              >
                {displayName(emp.name).charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight">
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
