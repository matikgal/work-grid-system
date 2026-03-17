import React, { useState, useRef, useCallback, useMemo } from "react";
import { Session } from "@supabase/supabase-js";
import { Lock, Unlock, Loader2, Printer } from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";
import { cn } from "../utils";
import { useMobile } from "../hooks/useMobile";
import { useEmployees } from "../hooks/useEmployees";
import { PhonesMobileList } from "../components/features/phones/PhonesMobileList";
import { PhonesDesktopTable } from "../components/features/phones/PhonesDesktopTable";
import { PrintPhones } from "../components/features/phones/PrintPhones";
import { PageBackgroundPattern } from "../components/shared/PageBackgroundPattern";
import { PageFooter } from "../components/shared/PageFooter";

interface PhonesPageProps {
  session: Session;
}

export const PhonesPage: React.FC<PhonesPageProps> = ({ session }) => {
  const { employees, loading, updateEmployee } = useEmployees(session);

  const [isLocked, setIsLocked] = useState(true);
  const isMobile = useMobile();

  const processedEmployees = useMemo(() => {
    const getLastName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    };

    return [...employees]
      .filter((e) => !e.isSeparator)
      .sort((a, b) =>
        getLastName(a.name).localeCompare(getLastName(b.name), "pl"),
      );
  }, [employees]);

  const handleUpdatePhone = useCallback(
    (employeeId: string, phone: string) => {
      updateEmployee(employeeId, { phone });
    },
    [updateEmployee],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <MainLayout pageTitle="Numery telefonów">
      <div className="relative h-full w-full bg-[#FAFAFA] dark:bg-slate-950 overflow-hidden flex flex-col">
        <PageBackgroundPattern />

        <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col min-h-0 relative z-10 print:hidden">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
            <div className="hidden md:block">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Książka telefoniczna
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
                Baza kontaktów dla{" "}
                <span className="font-bold text-brand-600 dark:text-brand-400">
                  {processedEmployees.length}
                </span>{" "}
                pracowników.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm font-bold text-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Drukuj</span>
              </button>

              {/* Lock Toggle */}
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm",
                  isLocked
                    ? "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    : "bg-orange-500 text-white border border-orange-500 hover:bg-orange-600",
                )}
                title={isLocked ? "Odblokuj edycję" : "Zablokuj edycję"}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isLocked ? "Zablokowane" : "Edycja"}
                </span>
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
              <PhonesMobileList
                employees={processedEmployees}
                isLocked={isLocked}
                onUpdatePhone={handleUpdatePhone}
              />
            ) : (
              <PhonesDesktopTable
                employees={processedEmployees}
                isLocked={isLocked}
                onUpdatePhone={handleUpdatePhone}
              />
            )}
          </div>
        </div>

        <PrintPhones employees={processedEmployees} />

        <div className="print:hidden">
          <PageFooter />
        </div>
      </div>
    </MainLayout>
  );
};
