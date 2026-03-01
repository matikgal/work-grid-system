import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Lock, Unlock, ChevronLeft, ChevronRight, Palmtree } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { Employee } from '../types';
import { cn } from '../utils';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';
import { useVacations } from '../hooks/useVacations';
import { VacationsMobileList } from '../components/features/vacations/VacationsMobileList';
import { VacationsDesktopTable } from '../components/features/vacations/VacationsDesktopTable';
import { PageBackgroundPattern } from '../components/shared/PageBackgroundPattern';
import { PageFooter } from '../components/shared/PageFooter';

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
      .sort((a, b) => {
        const lastA = a.name.trim().split(/\s+/).slice(1).join(' ') || a.name;
        const lastB = b.name.trim().split(/\s+/).slice(1).join(' ') || b.name;
        return lastA.localeCompare(lastB, 'pl');
      });
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
    <MainLayout pageTitle="Urlopy">
      <div className="relative h-full w-full bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden flex flex-col">
        <PageBackgroundPattern />

        <div className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-8 flex flex-col min-h-0 relative z-10">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 shrink-0">
                <div className="hidden md:block">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Urlopy</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
                      Podsumowanie wykorzystanych urlopów dla <span className="font-bold text-brand-600 dark:text-brand-400">{employees.length}</span> pracowników.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    {/* Year Picker */}
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm">
                        <button 
                          onClick={() => setSelectedYear(selectedYear - 1)} 
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>
                        <span className="px-3 font-bold text-slate-700 dark:text-slate-200 text-sm tabular-nums">{selectedYear}</span>
                        <button 
                          onClick={() => setSelectedYear(selectedYear + 1)} 
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>

                    {/* Lock Toggle */}
                    <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm",
                            isLocked 
                                ? "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                : "bg-orange-500 text-white border border-orange-500 hover:bg-orange-600"
                        )}
                        title={isLocked ? "Odblokuj edycję" : "Zablokuj edycję"}
                    >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isLocked ? "Zablokowane" : "Edycja"}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2 md:pb-4">
                {isMobile ? (
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
        <PageFooter />
      </div>
    </MainLayout>
  );
};
