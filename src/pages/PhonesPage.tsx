import React, { useState, useRef, useCallback, useMemo } from "react";
import { Session } from "@supabase/supabase-js";
import { Lock, Unlock, Loader2, Printer, Phone } from "lucide-react";
import { MainLayout } from "../components/layout/MainLayout";
import { PageHeader } from "../components/shared/PageHeader";
import { cn } from "../utils";
import { useMobile } from "../hooks/useMobile";
import { useEmployees } from "../hooks/useEmployees";
import { PhonesMobileList } from "../components/features/phones/PhonesMobileList";
import { PhonesDesktopTable } from "../components/features/phones/PhonesDesktopTable";
import { PrintPhones } from "../components/features/phones/PrintPhones";
import { DashboardBackground } from "../components/dashboard/DashboardBackground";
import { PageFooter } from "../components/shared/PageFooter";
import "../components/dashboard/dashboard-modern.css";

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
      <div className="dash-modern">
        <DashboardBackground />

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col p-4 md:p-6 print:hidden">
          {/* Page Header */}
          <PageHeader
            title="Książka telefoniczna"
            icon={Phone}
            accent="#db2777"
            subtitle={
              <>
                Baza kontaktów dla{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                  {processedEmployees.length}
                </span>{" "}
                pracowników.
              </>
            }
            actions={
              <>
                {/* Print Button */}
                <button onClick={handlePrint} className="dash-btn dash-btn--ghost">
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Drukuj</span>
                </button>

                {/* Lock Toggle */}
                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={cn("dash-btn", isLocked ? "dash-btn--ghost" : "dash-btn--warn")}
                  title={isLocked ? "Odblokuj edycję" : "Zablokuj edycję"}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isLocked ? "Zablokowane" : "Edycja"}</span>
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
              <div className="dash-scroll min-h-0 flex-1 overflow-y-auto">
                <PhonesMobileList
                  employees={processedEmployees}
                  isLocked={isLocked}
                  onUpdatePhone={handleUpdatePhone}
                />
              </div>
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
