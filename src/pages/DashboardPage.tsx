import { useState, useEffect, useMemo } from 'react';
import { Session } from '@supabase/supabase-js';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppContext } from '@/context/AppContext';
import { buildWeatherForecastUrl } from '@/config/app';
import { useEmployees } from '@/hooks/useEmployees';
import { useShifts } from '@/hooks/useShifts';
import { useNotifications } from '@/hooks/useNotifications';
import { DashboardBackground } from '@/components/dashboard/DashboardBackground';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TodaySchedulePanel } from '@/components/dashboard/TodaySchedulePanel';
import { DashboardSidePanel } from '@/components/dashboard/DashboardSidePanel';
import { PageFooter } from '@/components/shared/PageFooter';
import { buildTodaySchedule, MOCK_TODAY_SCHEDULE } from '@/lib/dashboardSchedule';
import '@/components/dashboard/dashboard-modern.css';

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

interface DashboardPageProps {
  session: Session;
}

const getConditionLabel = (code: number): string => {
  if (code === 0) return 'Bezchmurnie';
  if (code <= 3) return 'Częściowe zachmurzenie';
  if (code <= 48) return 'Zachmurzenie';
  if (code <= 55) return 'Mżawka';
  if (code <= 67) return 'Deszcz';
  if (code <= 77) return 'Śnieg';
  if (code <= 82) return 'Przelotne opady';
  return 'Burza';
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ session }) => {
  const { userName: contextUserName, weatherLocation } = useAppContext();
  const [time, setTime] = useState(() => new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const userEmail = session.user.email || '';
  const displayUserName = contextUserName || userEmail.split('@')[0];

  const { employees, loading: employeesLoading } = useEmployees(session);
  const scheduleEmployees = useMemo(
    () => employees.filter((e) => !e.isSeparator && !e.isArchived && e.isVisibleInSchedule !== false),
    [employees],
  );
  const { shifts, loading: shiftsLoading } = useShifts(scheduleEmployees, new Date(), session.user.id);
  const { unreadCount, loading: notificationsLoading } = useNotifications(session.user.id);

  const scheduleLoading = employeesLoading || shiftsLoading;
  const useMockData = !scheduleLoading && scheduleEmployees.length === 0;

  const { working, absent } = useMemo(() => {
    if (useMockData) return MOCK_TODAY_SCHEDULE;
    return buildTodaySchedule(scheduleEmployees, shifts);
  }, [useMockData, scheduleEmployees, shifts]);

  // Pełna obsada to 14 osób na zmianie (100% obłożenia).
  const coverage = working.length > 0 ? Math.min(100, (working.length / 14) * 100) : 0;

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setWeatherLoading(true);
    fetch(buildWeatherForecastUrl(weatherLocation))
      .then((res) => {
        if (!res.ok) throw new Error('Weather fetch failed');
        return res.json();
      })
      .then((data: WeatherData) => {
        setWeather(data);
        setWeatherLoading(false);
      })
      .catch(() => setWeatherLoading(false));
  }, [weatherLocation]);

  const weatherSnapshot = weather
    ? {
        temperature: weather.current.temperature_2m,
        condition: getConditionLabel(weather.current.weather_code),
      }
    : null;

  return (
    <MainLayout pageTitle="Pulpit">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="dash-scroll relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:gap-5 lg:p-6">
          <DashboardHeader
            userName={displayUserName}
            storeLocation={weatherLocation}
            time={time}
            weather={weatherSnapshot}
            weatherLoading={weatherLoading}
          />

          <DashboardStats
            working={working.length}
            absent={absent.length}
            coverage={coverage}
            unread={unreadCount}
            scheduleLoading={scheduleLoading}
            notificationsLoading={notificationsLoading}
          />

          <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.15fr] lg:gap-5">
            <TodaySchedulePanel
              working={working}
              absent={absent}
              loading={scheduleLoading}
              isMock={useMockData}
            />
            <DashboardSidePanel
              unreadCount={unreadCount}
              notificationsLoading={notificationsLoading}
            />
          </main>
        </div>

        <PageFooter className="mx-4 mb-4 rounded-2xl border border-white/50 bg-white/55 lg:mx-6 lg:mb-5" />
      </div>
    </MainLayout>
  );
};
