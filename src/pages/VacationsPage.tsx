import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { MainLayout } from '../components/layout/MainLayout';


import { Employee } from '../types';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';

// Feature Hooks
import { useVacations } from '../hooks/useVacations';

// Feature Components
import { VacationsHeader } from '../components/features/vacations/VacationsHeader';
import { VacationsMobileList } from '../components/features/vacations/VacationsMobileList';
import { VacationsDesktopTable } from '../components/features/vacations/VacationsDesktopTable';

interface VacationsPageProps {
  session: Session;
}

const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const VacationsPage: React.FC<VacationsPageProps> = ({ session }) => {
  const { employees: allEmployees, addEmployee, updateEmployee, deleteEmployee } = useEmployees(session);
  
  const employees = React.useMemo(() => {
    return allEmployees
      .filter(e => e.isVisibleInVacations !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allEmployees]);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLocked, setIsLocked] = useState(true);
  const isMobile = useMobile();

  const employeeIds = React.useMemo(() => employees.map(e => e.id), [employees]);

  const {
      vacationCounts,
      vacationBalances,
      highlightedEmployees,
      vacationManual,
      updateBalance,
      updateManualDays,
      toggleHighlight
  } = useVacations(session.user.id, selectedYear, employeeIds);

  const handleSaveEmployee = async (employee: Employee, isNew: boolean) => {
      if (isNew) {
        addEmployee(
          employee.name, 
          employee.role, 
          employee.avatarColor,
          employee.isSeparator,
          employee.rowColor,
          employee.isVisibleInSchedule,
          employee.isVisibleInVacations
        );
      } else {
        updateEmployee(employee.id, { 
          name: employee.name, 
          role: employee.role,
          isVisibleInSchedule: employee.isVisibleInSchedule,
          isVisibleInVacations: employee.isVisibleInVacations
        });
      }
  };

  const calculateTotal = (counts: number[], manuals: number[]) => {
      return counts.reduce((a, b, i) => a + b + (manuals[i] || 0), 0);
  };

  return (
    <MainLayout
      pageTitle="Urlopy"
    >
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <VacationsHeader 
                isLocked={isLocked}
                onToggleLock={() => setIsLocked(!isLocked)}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 pb-24">
                {isMobile ? (
                    // Mobile Card View
                    <VacationsMobileList 
                        employees={employees}
                        isLocked={isLocked}
                        MONTHS={MONTHS}
                        vacationCounts={vacationCounts}
                        vacationBalances={vacationBalances}
                        vacationManual={vacationManual}
                        highlightedEmployees={highlightedEmployees}
                        onUpdateBalance={updateBalance}
                        onUpdateManualDays={updateManualDays}
                        onToggleHighlight={toggleHighlight}
                        calculateTotal={calculateTotal}
                    />
                ) : (
                    // Desktop Table View
                    <VacationsDesktopTable
                        employees={employees}
                        isLocked={isLocked}
                        MONTHS={MONTHS}
                        vacationCounts={vacationCounts}
                        vacationBalances={vacationBalances}
                        vacationManual={vacationManual}
                        highlightedEmployees={highlightedEmployees}
                        onUpdateBalance={updateBalance}
                        onUpdateManualDays={updateManualDays}
                        onToggleHighlight={toggleHighlight}
                        calculateTotal={calculateTotal}
                    />
                )}
            </div>
        </div>

    </MainLayout>
  );
};
