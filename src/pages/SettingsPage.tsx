import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config/app';
import { employeeService } from '../services/employeeService';
import { parseEmployeeImportFile } from '../lib/employeeImport';
import { employeeKeys } from '../hooks/useEmployees';
import { useQueryClient } from '@tanstack/react-query';
import { PageFooter } from '../components/shared/PageFooter';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import '../components/dashboard/dashboard-modern.css';

import { ProfileSection } from '../components/features/settings/ProfileSection';
import { AppearanceSection } from '../components/features/settings/AppearanceSection';
import { CalendarSettingsSection } from '../components/features/settings/CalendarSettingsSection';
import { DataExportSection } from '../components/features/settings/DataExportSection';
import { NotificationsSection } from '../components/features/settings/NotificationsSection';
import { AuditLogSection } from '../components/features/settings/AuditLogSection';
import { OrganizationSection } from '../components/features/settings/OrganizationSection';
import { EmployeeImportSection } from '../components/features/settings/EmployeeImportSection';
import { PROFILE_AVATARS, type ProfileAvatarId } from '../config/profileAvatars';
import { exportEmployeesToExcel } from '../lib/excelExport';

const formatDate = (date: Date) => date.toISOString().replace(/[:.]/g, '-');

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    viewMode,
    setViewMode,
    isCompactMode,
    setIsCompactMode,
    showWeekends,
    setShowWeekends,
    userName,
    setUserName,
    userAvatarId,
    setUserAvatarId,
    weatherLocation,
    setWeatherLocation,
  } = useAppContext();

  const [localUserName, setLocalUserName] = useState(userName);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [browserNotifs, setBrowserNotifs] = useState(true);
  const [isViewSelectOpen, setIsViewSelectOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExportingEmployees, setIsExportingEmployees] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      toast.info('Rozpoczynam tworzenie kopii zapasowej...');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Musisz być zalogowany, aby utworzyć kopię zapasową.');
        return;
      }

      const [
        { data: employees, error: employeesError },
        { data: shifts, error: shiftsError },
        { data: orders, error: ordersError },
        { data: monthlyConfigs, error: configsError },
        { data: vacationBalances, error: vacationsError },
        { data: wsAdjustments, error: adjustmentsError },
      ] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('shifts').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('monthly_configs').select('*'),
        supabase.from('vacation_balances').select('*'),
        supabase.from('ws_adjustments').select('*'),
      ]);

      const queryError =
        employeesError || shiftsError || ordersError || configsError || vacationsError || adjustmentsError;
      if (queryError) throw queryError;

      const orderIds = (orders || []).map((order) => order.id);
      let items: Record<string, unknown>[] = [];
      let shopResponses: Record<string, unknown>[] = [];

      if (orderIds.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .in('order_id', orderIds);
        if (itemsError) throw itemsError;
        items = itemsData || [];

        const itemIds = items.map((item) => item.id as string);
        if (itemIds.length > 0) {
          const { data: responsesData, error: responsesError } = await supabase
            .from('shop_responses')
            .select('*')
            .in('item_id', itemIds);
          if (responsesError) throw responsesError;
          shopResponses = responsesData || [];
        }
      }

      const backupData = {
        timestamp: new Date().toISOString(),
        appName: APP_CONFIG.APP_NAME,
        version: APP_CONFIG.APP_VERSION,
        data: {
          employees: employees || [],
          shifts: shifts || [],
          orders: orders || [],
          items,
          shop_responses: shopResponses,
          monthly_configs: monthlyConfigs || [],
          vacation_balances: vacationBalances || [],
          ws_adjustments: wsAdjustments || [],
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-grafik-pracy-${formatDate(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Kopia zapasowa pobrana pomyślnie!');
    } catch {
      toast.error('Błąd podczas tworzenia kopii zapasowej.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      setUserName(localUserName);
      toast.success('Nazwa użytkownika została zaktualizowana');
      setIsSavingProfile(false);
    }, 500);
  };

  const handleSelectAvatar = (id: ProfileAvatarId) => {
    if (id === userAvatarId) return;
    setUserAvatarId(id);
    const label = PROFILE_AVATARS.find((avatar) => avatar.id === id)?.label ?? 'Awatar';
    toast.success(`Zmieniono awatar: ${label}`);
  };

  const handleExportEmployees = async () => {
    try {
      setIsExportingEmployees(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const employees = await employeeService.getAll(user.id);
      await exportEmployeesToExcel(employees);
      toast.success('Lista pracowników wyeksportowana');
    } catch {
      toast.error('Błąd eksportu pracowników');
    } finally {
      setIsExportingEmployees(false);
    }
  };

  const handleEmployeeImport = async (file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Brak sesji');

    const text = await file.text();
    const rows = parseEmployeeImportFile(text, file.name);
    const existing = await employeeService.getAll(user.id);
    const existingNames = new Set(existing.map((e) => e.name.trim().toLowerCase()));
    const result = await employeeService.importEmployees(user.id, rows, existingNames);
    queryClient.invalidateQueries({ queryKey: employeeKeys.all(user.id) });
    toast.success(`Import zakończony: ${result.imported} dodanych`);
    return result;
  };

  return (
    <MainLayout pageTitle="Ustawienia">
      <div className="dash-modern">
        <DashboardBackground />
        <div className="dash-scroll relative z-10 min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl space-y-4 px-3 py-5 sm:space-y-5 sm:px-4 lg:px-6">
            <header className="pb-1 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                {APP_CONFIG.APP_NAME}
              </p>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
                <span className="dash-gradient-text">Ustawienia</span>
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-indigo-950/55 dark:text-indigo-100/60">
                Profil, wygląd, kalendarz, sklep i pogoda, kopie zapasowe oraz powiadomienia.
              </p>
            </header>

            <ProfileSection
              localUserName={localUserName}
              userName={userName}
              userAvatarId={userAvatarId}
              setLocalUserName={setLocalUserName}
              onSelectAvatar={handleSelectAvatar}
              isSavingProfile={isSavingProfile}
              onSaveProfile={handleSaveProfile}
            />

            <AppearanceSection
              isCompactMode={isCompactMode}
              setIsCompactMode={setIsCompactMode}
            />

            <CalendarSettingsSection
              viewMode={viewMode}
              setViewMode={setViewMode}
              showWeekends={showWeekends}
              setShowWeekends={setShowWeekends}
              isViewSelectOpen={isViewSelectOpen}
              setIsViewSelectOpen={setIsViewSelectOpen}
            />

            <OrganizationSection
              weatherLocation={weatherLocation}
              onWeatherLocationChange={(loc) => {
                setWeatherLocation(loc);
                toast.success(`Lokalizacja pogody: ${loc.name}`);
              }}
            />

            <EmployeeImportSection onImport={handleEmployeeImport} />

            <DataExportSection
              isBackingUp={isBackingUp}
              onBackup={handleBackup}
              onExportEmployees={handleExportEmployees}
              isExportingEmployees={isExportingEmployees}
            />

            <NotificationsSection
              emailNotifs={emailNotifs}
              setEmailNotifs={setEmailNotifs}
              browserNotifs={browserNotifs}
              setBrowserNotifs={setBrowserNotifs}
            />

            <AuditLogSection />
          </div>
        </div>

        <PageFooter />
      </div>
    </MainLayout>
  );
};
