import React, { useState } from 'react';
import { 
  Palette, Sun, Moon, Desktop, CalendarCheck, 
  Check, DownloadSimple, Database, SquaresFour, Bell, 
  CaretDown, User, FloppyDisk 
} from '@phosphor-icons/react';
import { MainLayout } from '../components/layout/MainLayout';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { cn } from '../utils';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

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
              appName: 'WorkGrid System',
              version: '1.0.0',
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
      } catch (error) {
          console.error('Backup failed:', error);
          toast.error('Błąd podczas tworzenia kopii zapasowej.');
      } finally {
          setIsBackingUp(false);
      }
  };

  const handleSaveProfile = () => {
      setIsSavingProfile(true);
      // Simulate API call delay
      setTimeout(() => {
          setUserName(localUserName);
          toast.success('Nazwa użytkownika została zaktualizowana');
          setIsSavingProfile(false);
      }, 500);
  };

  return (
    <MainLayout pageTitle="Ustawienia">
      <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-slate-950 w-full font-sans overflow-hidden relative">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[1.0]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[1.0] hidden dark:block" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <div className="max-w-4xl mx-auto w-full space-y-8 pb-24">
            
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

            {/* Profil Użytkownika */}
            <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                        <User className="w-6 h-6" weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Twój Profil</h2>
                        <p className="text-xs text-gray-400 font-medium">Dane personalne</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-slate-600 border border-dashed border-gray-200 dark:border-slate-700">
                        <User className="w-10 h-10" weight="fill" />
                    </div>
                    <div className="flex-1 space-y-5 w-full"> {/* Removed max-w-md, added w-full */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nazwa wyświetlana</label>
                            <div className="flex flex-col sm:flex-row gap-2"> {/* Changed to flex-col on mobile */}
                                <input 
                                    type="text" 
                                    value={localUserName}
                                    onChange={(e) => setLocalUserName(e.target.value)}
                                    placeholder="Wpisz swoje imię..."
                                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white placeholder:text-gray-400 font-medium transition-all w-full"
                                />
                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile || localUserName === userName}
                                    className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95 transform w-full sm:w-auto"
                                >
                                    {isSavingProfile ? '...' : <><FloppyDisk className="w-5 h-5" weight="fill" /> Zapisz</>}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 font-medium">To imię będzie widoczne na pulpicie w sekcji powitalnej.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Wygląd */}
            <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                        <Palette className="w-6 h-6" weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wygląd i Motyw</h2>
                        <p className="text-xs text-gray-400 font-medium">Personalizacja interfejsu</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Motyw */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Wybierz motyw</label>
                        <div className="grid grid-cols-3 gap-3">
                             {[
                                { id: 'light', label: 'Jasny', icon: Sun },
                                { id: 'dark', label: 'Ciemny', icon: Moon },
                                { id: 'system', label: 'System', icon: Desktop },
                             ].map((opt) => (
                                 <button
                                    key={opt.id}
                                    onClick={() => setTheme(opt.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-3",
                                        theme === opt.id 
                                          ? "bg-brand-50/50 border-brand-500 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400 shadow-sm" 
                                          : "bg-white border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100/80 hover:text-gray-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                                    )}
                                 >
                                     <opt.icon className="w-6 h-6" weight={theme === opt.id ? "fill" : "regular"} />
                                     <span className="text-xs font-bold">{opt.label}</span>
                                 </button>
                             ))}
                        </div>
                    </div>

                    {/* Gęstość */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Gęstość interfejsu</label>
                         <div className="bg-gray-100 dark:bg-slate-950 p-1.5 rounded-xl flex">
                            {[
                                { id: 'comfortable', label: 'Standardowa' },
                                { id: 'compact', label: 'Kompaktowa' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setIsCompactMode(opt.id === 'compact')}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-lg text-xs font-bold transition-all",
                                        (isCompactMode ? 'compact' : 'comfortable') === opt.id
                                            ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-md"
                                            : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                         </div>
                         <p className="text-xs text-gray-400 leading-relaxed font-medium">
                            Tryb kompaktowy mieści więcej informacji na ekranie, zmniejszając odstępy w tabelach.
                         </p>
                    </div>
                </div>
            </section>

            {/* Kalendarz */}
            <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                        <CalendarCheck className="w-6 h-6" weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kalendarz</h2>
                        <p className="text-xs text-gray-400 font-medium">Opcje wyświetlania grafiku</p>
                    </div>
                </div>

                <div className="space-y-4 w-full"> {/* Removed max-w-3xl, added w-full */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors bg-gray-50/50 dark:bg-slate-950/30 gap-4">
                        <div className="space-y-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 block">Domyślny widok</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Widok otwierany przy starcie grafiku.</span>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <button 
                                onClick={() => setIsViewSelectOpen(!isViewSelectOpen)}
                                className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl px-4 py-3 w-full md:min-w-[200px] justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                            >
                                <span>{viewMode === 'week' ? 'Widok Tygodniowy' : 'Widok Miesięczny'}</span>
                                <CaretDown className="w-4 h-4 text-gray-400" weight="bold" />
                            </button>
                            
                            {isViewSelectOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsViewSelectOpen(false)} />
                                    <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                                        {[
                                            { value: 'week', label: 'Widok Tygodniowy' },
                                            { value: 'month', label: 'Widok Miesięczny' }
                                        ].map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    setViewMode(opt.value as any);
                                                    setIsViewSelectOpen(false);
                                                }}
                                                className={cn(
                                                    "px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between rounded-lg transition-colors",
                                                    viewMode === opt.value
                                                        ? "bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium"
                                                )}
                                            >
                                                {opt.label}
                                                {viewMode === opt.value && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" weight="bold" />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div onClick={() => setShowWeekends(!showWeekends)} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-colors bg-gray-50/50 dark:bg-slate-950/30 cursor-pointer gap-4 group">
                        <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Pokazuj weekendy</span>
                                {!showWeekends && <span className="text-[10px] bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Ukryte</span>}
                             </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Uwzględnij soboty i niedziele w widoku grafiku.</span>
                        </div>
                        <div className={cn("w-14 h-8 bg-gray-200 dark:bg-slate-800 rounded-full relative transition-colors duration-300", showWeekends ? "bg-brand-600 dark:bg-brand-500" : "")}>
                            <div className={cn("absolute top-[4px] left-[4px] bg-white rounded-full h-6 w-6 transition-transform duration-300 shadow-md", showWeekends ? "translate-x-6" : "")}></div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Dane i Eksport */}
             <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                        <Database className="w-6 h-6" weight="duotone" />
                    </div>
                    <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dane i Eksport</h2>
                         <p className="text-xs text-gray-400 font-medium">Zarządzanie kopiami zapasowymi</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-950/20">
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                            <DownloadSimple className="w-6 h-6" weight="duotone" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Eksportuj do PDF</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium">Zapisz grafik jako plik do druku.</span>
                        </div>
                    </button>
                    
                     <button className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-950/20 opacity-60 cursor-not-allowed">
                        <div className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl shrink-0">
                            <SquaresFour className="w-6 h-6" weight="duotone" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white block">Eksport do Excel</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium">Wkrótce... format .xlsx</span>
                        </div>
                    </button>

                    <button 
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        className={cn(
                            "flex items-start gap-4 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left group bg-white dark:bg-slate-950/20 col-span-1 md:col-span-2",
                            isBackingUp && "opacity-70 cursor-wait"
                        )}
                    >
                        <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                            <Database className="w-6 h-6" weight="duotone" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {isBackingUp ? 'Pobieranie danych...' : 'Pełna Kopia Zapasowa (JSON)'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium leading-relaxed max-w-lg">
                                Generuje kompletny zrzut bazy danych (pracownicy, grafiki, zamówienia, urlopy) w formacie JSON. Używaj regularnie.
                            </span>
                        </div>
                    </button>
                </div>
            </section>

             {/* Powiadomienia */}
             <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400">
                        <Bell className="w-6 h-6" weight="duotone" />
                    </div>
                    <div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Powiadomienia</h2>
                         <p className="text-xs text-gray-400 font-medium">Alerty i komunikaty</p>
                    </div>
                </div>

                <div className="space-y-4 w-full"> {/* Removed max-w-3xl, added w-full */}
                     <div 
                        onClick={() => setEmailNotifs(!emailNotifs)}
                        className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group bg-gray-50/50 dark:bg-slate-950/30"
                     >
                        <div className="flex items-center gap-4">
                             <div className={cn(
                                 "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                 emailNotifs 
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20" 
                                    : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 group-hover:border-brand-400 dark:group-hover:border-brand-500"
                             )}>
                                 {emailNotifs && <Check className="w-3.5 h-3.5" weight="bold" />}
                             </div>
                             <div>
                                 <span className="block text-sm font-bold text-gray-900 dark:text-white">Powiadomienia E-mail</span>
                                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Otrzymuj podsumowania zmian na e-mail.</span>
                             </div>
                        </div>
                     </div>

                     <div 
                        onClick={() => setBrowserNotifs(!browserNotifs)}
                        className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group bg-gray-50/50 dark:bg-slate-950/30"
                     >
                        <div className="flex items-center gap-4">
                             <div className={cn(
                                 "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                 browserNotifs 
                                    ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20" 
                                    : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 group-hover:border-brand-400 dark:group-hover:border-brand-500"
                             )}>
                                 {browserNotifs && <Check className="w-3.5 h-3.5" weight="bold" />}
                             </div>
                             <div>
                                 <span className="block text-sm font-bold text-gray-900 dark:text-white">Powiadomienia w przeglądarce</span>
                                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pokaż alerty o ważnych zdarzeniach w rogu ekranu.</span>
                             </div>
                        </div>
                        {browserNotifs && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-500/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/30">WŁĄCZONE</span>}
                     </div>
                </div>
            </section>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};
