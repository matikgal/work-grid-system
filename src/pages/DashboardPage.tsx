import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { MainLayout } from '../components/layout/MainLayout';
import { 
  CalendarCheck,
  ArrowRight, 
  GithubLogo, 
  TreePalm,
  ShoppingBag,
  Coffee,
  UsersThree,
  FileText,
  Gear
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { APP_CONFIG } from '../config/app';
import { WeatherWidget } from '../components/features/dashboard/WeatherWidget';
import { DashboardNavBox } from '../components/features/dashboard/DashboardNavBox';

interface DashboardPageProps {
  session: Session;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ session }) => {
  const navigate = useNavigate();
  const { userName: contextUserName } = useAppContext();
  const [time, setTime] = useState(new Date());
  
  const userEmail = session.user.email || '';
  const displayUserName = contextUserName || userEmail.split('@')[0];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout pageTitle="Pulpit">
      <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-slate-950 w-full font-sans overflow-hidden relative">
         {/* Subtle Grid Pattern */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[1.0]" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}>
         </div>
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[1.0] hidden dark:block" 
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Main Scrollable Content Area */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
            <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-6 h-full">
            
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2 shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                             Panel Główny
                        </h2>
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                            Cześć, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 animate-gradient-x">{displayUserName}</span>
                        </h1>
                    </div>
                    <div className="flex flex-col items-end justify-center text-right">
                        <div className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tabular-nums leading-[0.8]">
                            {format(time, 'HH:mm')}
                        </div>
                        <div className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">
                            {format(time, 'd MMMM yyyy', { locale: pl })}
                        </div>
                    </div>
                </div>

                {/* Full Width Grid Layout - Auto-filling */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-3 md:gap-4 flex-1 md:h-full pb-24 md:pb-0"> 
                    
                    {/* 1. Main Feature: Schedule (Spans 2 cols, 2 rows) */}
                    <button 
                        onClick={() => navigate('/schedule')}
                        className="md:col-span-2 md:row-span-2 min-h-[300px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute -right-10 -bottom-10 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-500">
                            <CalendarCheck className="w-80 h-80" weight="duotone" />
                        </div>
                        
                        <div>
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <CalendarCheck className="w-6 h-6" weight="duotone" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Grafik Zmian
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm md:text-base leading-relaxed">
                                Zarządzaj czasem pracy. Sprawdź zmiany i planuj tydzień.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-sm font-bold text-blue-600 dark:text-blue-400 mt-4 bg-blue-50 dark:bg-blue-900/10 w-fit px-4 py-2 rounded-full">
                            <span>Otwórz grafik</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" weight="bold" />
                        </div>
                    </button>

                    {/* 2. Weather Widget (Spans 2 cols) */}
                    <WeatherWidget />

                    {/* 3. Mosaic Menu Items */}
                    <DashboardNavBox 
                        to="/vacations" 
                        title="Urlopy" 
                        description="Wnioski i limity"
                        colorTheme="rose"
                        icon={<TreePalm className="w-40 h-40" weight="duotone" />}
                    />

                    <DashboardNavBox 
                        to="/orders" 
                        title="Zamówienia" 
                        description="Logistyka"
                        colorTheme="emerald"
                        icon={<ShoppingBag className="w-40 h-40" weight="duotone" />}
                    />

                    <DashboardNavBox 
                        to="/free-saturdays" 
                        title="Wolne Soboty" 
                        description="Rozliczenie"
                        colorTheme="purple"
                        icon={<Coffee className="w-40 h-40" weight="duotone" />}
                    />

                    <DashboardNavBox 
                        to="/employees" 
                        title="Pracownicy" 
                        description="Zarządzanie kadrą"
                        colorTheme="indigo"
                        icon={<UsersThree className="w-40 h-40" weight="duotone" />}
                    />

                    <DashboardNavBox 
                        to="/instructions" 
                        title="Instrukcja" 
                        description="Dokumentacja"
                        colorTheme="gray"
                        icon={<FileText className="w-40 h-40" weight="duotone" />}
                    />

                    <DashboardNavBox 
                        to="/settings" 
                        title="Ustawienia" 
                        description="Konfiguracja"
                        colorTheme="slate"
                        icon={<Gear className="w-40 h-40" weight="duotone" />}
                    />
                </div>
            </div>
         </div>

         {/* Sticky Footer */}
         <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-4 w-full">
             <div className="max-w-[1920px] mx-auto w-full flex flex-row items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                 <div className="flex items-center gap-1">
                     <span>Autor:</span>
                     <a 
                        href="https://github.com/matikgal" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold"
                     >
                        <GithubLogo className="w-3.5 h-3.5" weight="fill" />
                        matikgal
                     </a>
                 </div>
                 
                 <div className="flex items-center gap-4">
                     <span className="opacity-50 hidden sm:inline">Work Grid System</span>
                     <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 font-mono text-[10px]">v{APP_CONFIG.APP_VERSION}</span>
                         <span>&copy; {APP_CONFIG.APP_YEAR}</span>
                     </div>
                 </div>
             </div>
         </div>

      </div>
    </MainLayout>
  );
};
