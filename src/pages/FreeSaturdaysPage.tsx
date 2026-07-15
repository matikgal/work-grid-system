import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Lock, Unlock, ChevronLeft, ChevronRight, Loader2, Coffee } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { cn } from '../utils';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';
import { useFreeSaturdays } from '../hooks/useFreeSaturdays';
import { FreeSaturdaysMobileList } from '../components/features/free-saturdays/FreeSaturdaysMobileList';
import { FreeSaturdaysDesktopTable } from '../components/features/free-saturdays/FreeSaturdaysDesktopTable';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import '../components/dashboard/dashboard-modern.css';

interface FreeSaturdaysPageProps {
  session: Session;
}

export const FreeSaturdaysPage: React.FC<FreeSaturdaysPageProps> = ({ session }) => {
  const { employees } = useEmployees(session);
  const activeEmployees = employees.filter(e => !e.isSeparator && e.isVisibleInSchedule !== false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLocked, setIsLocked] = useState(true);
  const isMobile = useMobile();
  const { adjustments, setAdjustment, updateAdjustment, loading } = useFreeSaturdays(session.user.id, selectedYear, activeEmployees);

  return (
    <MainLayout pageTitle="Wolne Soboty">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col p-4 md:p-6">

          {/* Page Header */}
          <PageHeader
            title="Wolne Soboty"
            icon={Coffee}
            accent="#ca8a04"
            subtitle={
              <>
                Rozliczenie roczne dla{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">{activeEmployees.length}</span> pracowników.
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
              </>
            }
          />

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col pb-2 md:pb-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : isMobile ? (
              <div className="dash-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                <FreeSaturdaysMobileList
                  employees={activeEmployees}
                  isLocked={isLocked}
                  adjustments={adjustments}
                  onSetAdjustment={setAdjustment}
                />
              </div>
            ) : (
              <FreeSaturdaysDesktopTable
                employees={activeEmployees}
                isLocked={isLocked}
                adjustments={adjustments}
                onUpdateAdjustment={updateAdjustment}
              />
            )}
          </div>
        </div>
        <PageFooter />
      </div>
    </MainLayout>
  );
};
