import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Lock, Unlock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { cn } from '../utils';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';
import { useFreeSaturdays } from '../hooks/useFreeSaturdays';
import { FreeSaturdaysMobileList } from '../components/features/free-saturdays/FreeSaturdaysMobileList';
import { FreeSaturdaysDesktopTable } from '../components/features/free-saturdays/FreeSaturdaysDesktopTable';
import { PageBackgroundPattern } from '../components/shared/PageBackgroundPattern';
import { PageFooter } from '../components/shared/PageFooter';

interface FreeSaturdaysPageProps {
  session: Session;
}

export const FreeSaturdaysPage: React.FC<FreeSaturdaysPageProps> = ({ session }) => {
  const { employees } = useEmployees(session);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLocked, setIsLocked] = useState(true);
  const isMobile = useMobile();

  const { adjustments, setAdjustment, loading } = useFreeSaturdays(session.user.id, selectedYear, employees);

  return (
    <MainLayout pageTitle="Wolne Soboty">
      <div className="relative h-full w-full bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden flex flex-col">
        <PageBackgroundPattern />

        <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col min-h-0 relative z-10">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
            <div className="hidden md:block">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Wolne Soboty</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
                Rozliczenie roczne dla <span className="font-bold text-brand-600 dark:text-brand-400">{employees.length}</span> pracowników.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Year Picker */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  aria-label="Poprzedni rok"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >            <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <span className="px-3 font-bold text-slate-700 dark:text-slate-200 text-sm tabular-nums">{selectedYear}</span>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  aria-label="Następny rok"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >            <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Lock Toggle */}
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm',
                  isLocked
                    ? 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    : 'bg-orange-500 text-white border border-orange-500 hover:bg-orange-600',
                )}
                title={isLocked ? 'Odblokuj edycję' : 'Zablokuj edycję'}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="hidden sm:inline">{isLocked ? 'Zablokowane' : 'Edycja'}</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2 md:pb-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              </div>
            ) : isMobile ? (
              <FreeSaturdaysMobileList
                employees={employees}
                isLocked={isLocked}
                adjustments={adjustments}
                onSetAdjustment={setAdjustment}
              />
            ) : (
              <FreeSaturdaysDesktopTable
                employees={employees}
                isLocked={isLocked}
                adjustments={adjustments}
                onSetAdjustment={setAdjustment}
              />
            )}
          </div>
        </div>
        <PageFooter />
      </div>
    </MainLayout>
  );
};
