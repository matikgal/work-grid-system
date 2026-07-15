import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Lock, Unlock, ChevronLeft, ChevronRight, Loader2, Palmtree } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';
import { useVacations } from '../hooks/useVacations';
import { cn } from '../utils';
import { VacationsMobileList } from '../components/features/vacations/VacationsMobileList';
import { VacationsDesktopTable } from '../components/features/vacations/VacationsDesktopTable';
import { exportVacationsToExcel } from '../lib/excelExport';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import '../components/dashboard/dashboard-modern.css';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface VacationsPageProps {
  session: Session;
}

const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const VacationsPage: React.FC<VacationsPageProps> = ({ session }) => {
  const { employees: allEmployees, loading: employeesLoading } = useEmployees(session);
  
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
  const [isExporting, setIsExporting] = useState(false);
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



  const calculateTotal = (counts: number[], manuals: number[]) => {
      return counts.reduce((a, b, i) => a + b + (manuals[i] || 0), 0);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportVacationsToExcel(employees, vacationCounts, vacationBalances, selectedYear);
      toast.success('Urlopy wyeksportowane do Excel');
    } catch {
      toast.error('Błąd eksportu do Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MainLayout pageTitle="Urlopy">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col p-4 md:p-6">

            {/* Page Header */}
            <PageHeader
              title="Urlopy"
              icon={Palmtree}
              accent="#0284c7"
              subtitle={
                <>
                  Podsumowanie wykorzystanych urlopów dla{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">{employees.length}</span> pracowników.
                </>
              }
              actions={
                <>
                  {/* Year Picker */}
                  <div className="flex items-center rounded-full border border-indigo-500/18 bg-white/60 p-1 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <button
                      onClick={() => setSelectedYear(selectedYear - 1)}
                      aria-label="Poprzedni rok"
                      className="rounded-full p-1.5 text-indigo-950/55 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/60"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm font-semibold tabular-nums tracking-tight">{selectedYear}</span>
                    <button
                      onClick={() => setSelectedYear(selectedYear + 1)}
                      aria-label="Następny rok"
                      className="rounded-full p-1.5 text-indigo-950/55 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/60"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Lock Toggle */}
                  <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={cn('dash-btn', isLocked ? 'dash-btn--ghost' : 'dash-btn--warn')}
                    title={isLocked ? 'Odblokuj edycję' : 'Zablokuj edycję'}
                  >
                    {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    <span className="hidden sm:inline">{isLocked ? 'Zablokowane' : 'Edycja'}</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="dash-btn dash-btn--success"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">{isExporting ? 'Eksport...' : 'Excel'}</span>
                  </button>
                </>
              }
            />

            {/* Content */}
            <div className="flex min-h-0 flex-1 flex-col pb-2 md:pb-4">
                {employeesLoading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    </div>
                ) : isMobile ? (
                    <div className="dash-scroll min-h-0 flex-1 overflow-y-auto pr-1">
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
                    </div>
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
