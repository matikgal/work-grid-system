import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { MainLayout } from '../components/layout/MainLayout';
import { 
  CalendarCheck,
  MapPin, 
  ArrowRight, 
  GithubLogo, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Wind, 
  UsersThree, 
  Gear,
  TreePalm,
  ShoppingBag,
  Coffee,
  FileText
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils';
import { APP_CONFIG } from '../config/app';

interface DashboardPageProps {
  session: Session;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ session }) => {
  const navigate = useNavigate();
  const { userName: contextUserName } = useAppContext();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const userEmail = session.user.email || '';
  const displayUserName = contextUserName || userEmail.split('@')[0];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=49.8225&longitude=19.0444&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
      })
      .catch(err => console.error(err));
  }, []);

  const getWeatherIcon = (code: number) => {
    const className = "w-10 h-10 text-slate-700 dark:text-slate-200";
    if (code === 0) return <Sun className={className} weight="fill" />;
    if (code >= 51) return <CloudRain className={className} weight="fill" />;
    if (code >= 71) return <CloudSnow className={className} weight="fill" />;
    return <Cloud className={className} weight="fill" />;
  };

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
                        {/* Background Decoration */}
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
                    <div className="md:col-span-2 min-h-[220px] md:min-h-0 h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        {/* Top: Current Weather */}
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    <MapPin className="w-3.5 h-3.5" weight="fill" />
                                    Bielsko-Biała
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        {weather?.current?.temperature_2m ? Math.round(weather.current.temperature_2m) : '--'}°
                                    </span>
                                    {weather?.current?.wind_speed_10m && (
                                        <span className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                            <Wind className="w-3.5 h-3.5" weight="bold" />
                                            {weather.current.wind_speed_10m} km/h
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="relative z-10 scale-110 transform p-2">
                                {getWeatherIcon(weather?.current?.weather_code || 0)}
                            </div>
                        </div>

                        {/* Bottom: Extra Info (New Row) */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50 w-full">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Wilgotność</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                   92% {/* Mock data or fetch real if available in future */}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Ciśnienie</span>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                   1015 hPa {/* Mock data */}
                                </span>
                            </div>
                             <div className="flex flex-col ml-auto text-right md:text-left">
                                <span className="text-[10px] uppercase font-bold text-indigo-500">Jakość powietrza</span>
                                <span className="text-sm font-bold text-emerald-500">
                                   Dobra
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Mosaic Menu Items (Fill remaining space) */}
                    <button 
                        onClick={() => navigate('/vacations')}
                        className="min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-rose-200 dark:hover:border-rose-900 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                    >
                         {/* Large Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 text-rose-50 dark:text-rose-900/20">
                             <TreePalm className="w-40 h-40" weight="duotone" />
                        </div>

                        <div className="flex flex-col justify-between h-full relative z-10">
                            <div className="flex justify-end w-full">
                                 <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 transition-colors -rotate-45 group-hover:rotate-0" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Urlopy</h3>
                                <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Wnioski i limity</p>
                            </div>
                        </div>
                    </button>

                    {/* Orders */}
                    <button 
                        onClick={() => navigate('/orders')}
                        className="min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                    >
                        {/* Large Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 text-emerald-50 dark:text-emerald-900/20">
                             <ShoppingBag className="w-40 h-40" weight="duotone" />
                        </div>

                        <div className="flex flex-col justify-between h-full relative z-10">
                             <div className="flex justify-end w-full">
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors -rotate-45 group-hover:rotate-0" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Zamówienia</h3>
                                <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Logistyka</p>
                            </div>
                        </div>
                    </button>

                     {/* Free Saturdays */}
                     <button 
                        onClick={() => navigate('/free-saturdays')}
                        className="min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                    >
                         {/* Large Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 text-purple-50 dark:text-purple-900/20">
                             <Coffee className="w-40 h-40" weight="duotone" />
                        </div>

                        <div className="flex flex-col justify-between h-full relative z-10">
                             <div className="flex justify-end w-full">
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors -rotate-45 group-hover:rotate-0" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Wolne Soboty</h3>
                                <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Rozliczenie</p>
                            </div>
                        </div>
                    </button>

                     {/* Manage Employees */}
                     <button 
                        onClick={() => navigate('/schedule')}
                        className="min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                    >
                        {/* Large Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 text-indigo-50 dark:text-indigo-900/20">
                             <UsersThree className="w-40 h-40" weight="duotone" />
                        </div>

                        <div className="flex flex-col justify-between h-full relative z-10">
                             <div className="flex justify-end w-full">
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors -rotate-45 group-hover:rotate-0" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Pracownicy</h3>
                                <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Zarządzanie kadrą</p>
                            </div>
                        </div>
                    </button>

                     {/* Instructions */}
                     <button 
                        onClick={() => navigate('/instructions')}
                        className="min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                    >
                         {/* Large Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 text-gray-50 dark:text-gray-800">
                             <FileText className="w-40 h-40" weight="duotone" />
                        </div>
                        
                        <div className="flex flex-col justify-between h-full relative z-10">
                             <div className="flex justify-end w-full">
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors -rotate-45 group-hover:rotate-0" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Instrukcja</h3>
                                <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Dokumentacja</p>
                            </div>
                        </div>
                    </button>

                    {/* Settings (New) */}
                    <button 
                        onClick={() => navigate('/settings')}
                        className="min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all group text-left relative overflow-hidden"
                    >
                         {/* Large Decorative Icon */}
                        <div className="absolute -right-6 -bottom-6 text-slate-100 dark:text-slate-800">
                             <Gear className="w-40 h-40" weight="duotone" />
                        </div>

                        <div className="flex flex-col justify-between h-full relative z-10">
                            <div className="flex justify-end w-full">
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-slate-500 transition-colors -rotate-45 group-hover:rotate-0" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Ustawienia</h3>
                                <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">Konfiguracja</p>
                            </div>
                        </div>
                    </button>

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
