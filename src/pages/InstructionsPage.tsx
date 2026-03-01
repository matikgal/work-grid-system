import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { BookOpen } from 'lucide-react';

import { IntroSection } from '../components/features/instructions/IntroSection';
import { ShiftsSection } from '../components/features/instructions/ShiftsSection';
import { VacationsSection } from '../components/features/instructions/VacationsSection';
import { OrdersSection } from '../components/features/instructions/OrdersSection';
import { EmployeesSection } from '../components/features/instructions/EmployeesSection';
import { TipsSection } from '../components/features/instructions/TipsSection';
import { PageBackgroundPattern } from '../components/shared/PageBackgroundPattern';
import { PageFooter } from '../components/shared/PageFooter';

export const InstructionsPage: React.FC = () => {
  return (
    <MainLayout pageTitle="Instrukcja">
      <div className="relative h-full w-full bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden flex flex-col">
        <PageBackgroundPattern />
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative z-10">
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-0">
                {/* Page Header */}
                <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                    <div className="hidden md:block">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Instrukcja</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Kompletny przewodnik po systemie Work Grid</p>
                    </div>
                    {/* Mobile spacing block */}
                    <div className="md:hidden h-2"></div>
                </div>

                {/* Content Container */}
                <div className="max-w-4xl mx-auto w-full space-y-12 pb-2 md:pb-4">
                    <IntroSection />
                    <ShiftsSection />
                    <VacationsSection />
                    <OrdersSection />
                    <EmployeesSection />
                    <TipsSection />
                </div>
            </div>
        </div>
        <PageFooter />
      </div>
    </MainLayout>
  );
};
