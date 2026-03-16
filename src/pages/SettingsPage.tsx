import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { APP_CONFIG } from '../config/app';
import { PageBackgroundPattern } from '../components/shared/PageBackgroundPattern';
import { PageFooter } from '../components/shared/PageFooter';

import { ProfileSection } from '../components/features/settings/ProfileSection';
import { AppearanceSection } from '../components/features/settings/AppearanceSection';
import { CalendarSettingsSection } from '../components/features/settings/CalendarSettingsSection';
import { DataExportSection } from '../components/features/settings/DataExportSection';
import { NotificationsSection } from '../components/features/settings/NotificationsSection';

const formatDate = (date: Date) => {
    return date.toISOString().replace(/[:.]/g, '-');
};

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { 
    viewMode, setViewMode, 
    isCompactMode, setIsCompactMode, 
    showWeekends, setShowWeekends,
    userName, setUserName
  } = useAppContext();
  
  const [localUserName, setLocalUserName] = useState(userName);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [browserNotifs, setBrowserNotifs] = useState(true);
  const [isViewSelectOpen, setIsViewSelectOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleBackup = async () => {
      try {
          setIsBackingUp(true);
          toast.info('Rozpoczynam tworzenie kopii zapasowej...');

          const [
              { data: employees },
              { data: shifts },
              { data: orders },
              { data: orderItems },
              { data: configs },
              { data: vacations }
          ] = await Promise.all([
              supabase.from('employees').select('*'),
              supabase.from('shifts').select('*'),
              supabase.from('orders').select('*'),
              supabase.from('order_items').select('*'),
              supabase.from('monthly_configs').select('*'),
              supabase.from('vacation_balances').select('*')
          ]);

          const backupData = {
              timestamp: new Date().toISOString(),
              appName: APP_CONFIG.APP_NAME,
              version: APP_CONFIG.APP_VERSION,
              data: {
                  employees: employees || [],
                  shifts: shifts || [],
                  orders: orders || [],
                  order_items: orderItems || [],
                  monthly_configs: configs || [],
                  vacation_balances: vacations || []
              }
          };

          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `backup-workgrid-${formatDate(new Date())}.json`;
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

  return (
    <MainLayout pageTitle="Ustawienia">
      <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-slate-950 w-full font-sans overflow-hidden relative">
        <PageBackgroundPattern />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-4xl mx-auto w-full space-y-8 pb-2 md:pb-4">
            
            <div className="space-y-1">
                 <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                      Konfiguracja
                 </h2>
                 <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                     Ustawienia
                 </h1>
                 <p className="text-gray-500 dark:text-gray-400 max-w-lg text-lg">
                    Dostosuj działanie i wygląd aplikacji do swoich preferencji.
                 </p>
            </div>

            <ProfileSection 
                localUserName={localUserName} 
                userName={userName} 
                setLocalUserName={setLocalUserName} 
                isSavingProfile={isSavingProfile} 
                onSaveProfile={handleSaveProfile} 
            />

            <AppearanceSection 
                theme={theme} 
                setTheme={setTheme} 
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

            <DataExportSection 
                isBackingUp={isBackingUp} 
                onBackup={handleBackup} 
            />

            <NotificationsSection 
                emailNotifs={emailNotifs} 
                setEmailNotifs={setEmailNotifs} 
                browserNotifs={browserNotifs} 
                setBrowserNotifs={setBrowserNotifs} 
            />

          </div>
        </div>
        
        <PageFooter />
      </div>
    </MainLayout>
  );
};
