import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { BookOpen } from 'lucide-react';

import { IntroSection } from '../components/features/instructions/IntroSection';
import { ShiftsSection } from '../components/features/instructions/ShiftsSection';
import { VacationsSection } from '../components/features/instructions/VacationsSection';
import { OrdersSection } from '../components/features/instructions/OrdersSection';
import { EmployeesSection } from '../components/features/instructions/EmployeesSection';
import { TipsSection } from '../components/features/instructions/TipsSection';

export const InstructionsPage: React.FC = () => {
  return (
    <MainLayout pageTitle="Instrukcja">
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                    Instrukcja Obsługi
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kompletny przewodnik po systemie Work Grid</p>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-12 pb-24">
                <IntroSection />
                <ShiftsSection />
                <VacationsSection />
                <OrdersSection />
                <EmployeesSection />
                <TipsSection />
            </div>
        </div>
      </div>
    </MainLayout>
  );
};
