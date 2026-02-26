import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { MainLayout } from '../components/layout/MainLayout';

// Modals
import { SystemResetModal } from '../components/shared/SystemResetModal';
import { FeedbackModal } from '../components/shared/FeedbackModal';
import { Employee } from '../types';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';

// Feature Hooks
import { useFreeSaturdays } from '../hooks/useFreeSaturdays';

// Feature Components
import { FreeSaturdaysHeader } from '../components/features/free-saturdays/FreeSaturdaysHeader';
import { FreeSaturdaysMobileList } from '../components/features/free-saturdays/FreeSaturdaysMobileList';
import { FreeSaturdaysDesktopTable } from '../components/features/free-saturdays/FreeSaturdaysDesktopTable';

interface FreeSaturdaysPageProps {
  session: Session;
}

export const FreeSaturdaysPage: React.FC<FreeSaturdaysPageProps> = ({ session }) => {
  const { employees } = useEmployees(session);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLocked, setIsLocked] = useState(true);

  // Modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const isMobile = useMobile();

  const {
      shiftsCount,
      adjustments,
      updateAdjustment
  } = useFreeSaturdays(session.user.id, selectedYear, employees);



  return (
    <MainLayout
      pageTitle="Wolne Soboty"
    >
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <FreeSaturdaysHeader 
                isLocked={isLocked}
                onToggleLock={() => setIsLocked(!isLocked)}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 pb-24">
                {isMobile ? (
                    // Mobile Card View
                    <FreeSaturdaysMobileList 
                        employees={employees}
                        isLocked={isLocked}
                        shiftsCount={shiftsCount}
                        adjustments={adjustments}
                        onUpdateAdjustment={updateAdjustment}
                    />
                ) : (
                    // Desktop Table View
                    <FreeSaturdaysDesktopTable 
                        employees={employees}
                        isLocked={isLocked}
                        shiftsCount={shiftsCount}
                        adjustments={adjustments}
                        onUpdateAdjustment={updateAdjustment}
                    />
                )}
            </div>
        </div>

      <SystemResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => window.location.reload()}
      />
      
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

    </MainLayout>
  );
};
