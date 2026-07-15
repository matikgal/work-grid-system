import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ShiftConflict } from '../../../lib/shiftConflicts';
import { Employee } from '../../../types';

interface ShiftConflictBannerProps {
  conflicts: ShiftConflict[];
  employees: Employee[];
}

export const ShiftConflictBanner: React.FC<ShiftConflictBannerProps> = ({
  conflicts,
  employees,
}) => {
  if (conflicts.length === 0) return null;

  const getName = (id: string) => employees.find((e) => e.id === id)?.name || 'Pracownik';

  return (
    <div className="schedule-conflict-banner shrink-0" role="alert">
      <AlertTriangle className="schedule-conflict-banner__icon h-5 w-5" strokeWidth={2} />
      <div>
        <p className="schedule-conflict-banner__title">
          Wykryto {conflicts.length} konflikt{conflicts.length > 1 ? 'ów' : ''} w grafiku
        </p>
        <ul className="schedule-conflict-banner__list space-y-0.5">
          {conflicts.slice(0, 5).map((c) => (
            <li key={`${c.employeeId}-${c.date}`}>
              {getName(c.employeeId)} — {c.message}
            </li>
          ))}
          {conflicts.length > 5 && (
            <li className="opacity-70">…i {conflicts.length - 5} więcej</li>
          )}
        </ul>
      </div>
    </div>
  );
};
