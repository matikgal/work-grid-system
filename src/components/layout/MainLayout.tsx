import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Calendar, Home, Settings, X, ChevronRight, LayoutDashboard, UsersRound, BookOpen, Lightbulb, RotateCcw, Coffee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils'; // Assuming cn is available in utils, or inline it if simple

interface MainLayoutProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  onAddEmployee?: () => void;
  onOpenInstructions?: () => void;
  onOpenFeedback?: () => void;
  onOpenSettings?: () => void;
  onResetSystem?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  headerLeft,
  headerCenter,
  headerRight,
  onAddEmployee,
  onOpenInstructions,
  onOpenFeedback,
  onOpenSettings,
  onResetSystem
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { label: 'Grafik', sub: 'Grafik zmian', active: location.pathname === '/' || location.pathname === '/work-grid-system/' || location.pathname === '/work-grid-system', icon: Calendar, action: () => navigate('/') },
    { label: 'Wolne Soboty', sub: 'Rozliczenie roczne', active: location.pathname.includes('free-saturdays'), icon: Coffee, action: () => navigate('/free-saturdays') },
    { label: 'Zarządzaj pracownikami', sub: 'Dodaj/Edytuj', disabled: !onAddEmployee, icon: UsersRound, action: onAddEmployee },
    { label: 'Instrukcja', sub: 'Pomoc', disabled: !onOpenInstructions, icon: BookOpen, action: onOpenInstructions },
    { label: 'Przeładuj system', sub: 'Reset danych', disabled: !onResetSystem, icon: RotateCcw, action: onResetSystem },
    { label: 'Dashboard', sub: 'Statystyki', disabled: true, icon: LayoutDashboard },
    { label: 'Zgłoś pomysł', sub: 'Feedback', disabled: true, icon: Lightbulb, action: onOpenFeedback },
    { label: 'Ustawienia', sub: 'Konfiguracja', disabled: !onOpenSettings, icon: Settings, action: onOpenSettings },
  ];

  const infoItems = [
    { label: 'O aplikacji', onClick: () => setShowAbout(true) },
    { label: 'Regulamin', onClick: () => setShowTerms(true) },
  ];

  return (
    <div className="flex flex-col h-screen supports-[height:100dvh]:h-[100dvh] w-full bg-[#FAFAFA] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
       {/* Global Header */}
       {/* Global Header */}
       {/* Global Header */}
        <header className="min-h-16 h-auto py-2 2xl:py-0 bg-white dark:bg-slate-900 flex flex-wrap 2xl:flex-nowrap items-center justify-between px-6 border-b border-gray-100 dark:border-slate-800 z-50 shrink-0 gap-x-4 gap-y-2">
           {/* Left Section: Menu + Title + Navigation */}
           <div className="flex items-center gap-4 shrink-0 order-1">
              <div className="flex items-center gap-2 mr-2">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="p-2 -ml-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 text-slate-600 dark:text-slate-400"
                 >
                     {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                 </button>
                 <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight hidden md:block">Grafik</h1>
              </div>

              {headerLeft && (
                  <div className="flex items-center border-l border-gray-100 pl-4">
                      {headerLeft}
                  </div>
              )}
           </div>

           {/* Center Section: Templates - Responsive wrapping */}
           {/* On mobile/tablet/laptop: order-3 (new line), w-full (centered), with separator line */}
           {/* On large desktop (2xl): order-2 (middle), w-auto, no separator */}
           <div className="order-3 2xl:order-2 w-full 2xl:w-auto flex justify-center items-center min-w-0 mx-2 mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 2xl:mt-0 2xl:pt-0 2xl:border-0">
               {headerCenter}
           </div>
           
           {/* Right Section: View Controls + User */}
           <div className="flex items-center gap-4 shrink-0 order-2 2xl:order-3 ml-auto 2xl:ml-0">
              {headerRight && (
                  <div className="flex items-center border-r border-gray-100 pr-4 h-8 gap-2">
                      {headerRight}
                  </div>
              )}
               <div className="hidden 2xl:flex items-center gap-3 shrink-0">
                 <span className="hidden sm:inline text-sm font-bold text-slate-700 dark:text-slate-300">{userEmail.split('@')[0]}</span>
                 <div 
                    className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs select-none overflow-hidden relative ring-2 ring-white dark:ring-slate-700 hover:scale-105 active:scale-95 transition-all"
                  >
                      {userEmail.charAt(0).toUpperCase()}
                  </div>
               </div>
           </div>
        </header>

       {/* Sidebar Overlay */}
       <div 
          className={cn(
            "fixed inset-0 top-16 z-40 bg-zinc-900/10 backdrop-blur-[1px] transition-opacity duration-300",
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMenuOpen(false)}
       />
       
       {/* Sidebar Panel - Minimalist Design */}
       <div 
          className={cn(
            "fixed top-16 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-out flex flex-col border-r border-slate-100 dark:border-slate-800",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
       >
           <div className="mt-6 px-6 mb-6">
               <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Nawigacja</h2>
           </div>
           
           <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
               {/* Main Navigation */}
               <div className="space-y-1">
                   {menuItems.map((item, index) => (
                       <button 
                         key={index}
                         disabled={item.disabled}
                         onClick={() => {
                            if (item.disabled) return;
                            if (item.action) item.action();
                            setIsMenuOpen(false);
                         }}
                         className={cn(
                           "w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm flex items-center gap-3",
                           item.active 
                             ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-900/20 dark:text-emerald-400" 
                             : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                           item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent text-slate-400 dark:text-slate-600"
                         )}
                       >
                           <item.icon className={cn("w-4 h-4", item.active ? "text-emerald-600 dark:text-emerald-400" : (item.disabled ? "text-slate-400 dark:text-slate-600" : "text-slate-400 dark:text-slate-300"))} />
                           {item.label}
                       </button>
                   ))}
               </div>

           </nav>

           {/* Minimal Footer */}
           <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100/80 hover:shadow-md border border-rose-100 rounded-xl transition-all font-semibold text-sm backdrop-blur-sm shadow-sm dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/20 dark:hover:bg-rose-900/20"
               >
                   <LogOut className="w-4 h-4" />
                   Wyloguj się
               </button>
               
                <div className="flex justify-center items-center gap-4 mt-4 px-2">
                    <button onClick={() => { setShowAbout(true); setIsMenuOpen(false); }} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors">
                        O aplikacji
                    </button>
                    <span className="text-slate-300 text-[10px] select-none">•</span>
                    <button onClick={() => { setShowTerms(true); setIsMenuOpen(false); }} className="text-[10px] font-medium text-slate-400 hover:text-slate-600 transition-colors">
                        Regulamin
                    </button>
                </div>
           </div>
       </div>

       {/* Page Content */}
       <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
       </main>

       {/* Modals for About/Terms */}
       {showAbout && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
               <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                   <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">O aplikacji</h3>
                   <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
                       <p>System Grafik to nowoczesne narzędzie do zarządzania czasem pracy w małych i średnich przedsiębiorstwach.</p>
                        <p>Wersja: <strong className="text-slate-900 dark:text-slate-200">2.1.0 (Build 2025)</strong></p>
                        <p className="select-none">
                          Created by: <strong className="text-slate-900 dark:text-slate-200">Mateusz Gałuszka</strong>
                        </p>
                       
                       <div className="pt-2">
                           <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Planowane funkcje:</p>
                           <ul className="list-disc list-inside text-xs space-y-1 ml-1 text-slate-500 dark:text-slate-400">
                               <li>Pełna responsywność (Mobile/Tablet)</li>
                               <li>Zaawansowane raporty i statystyki</li>
                               <li>Eksport do PDF/Excel</li>
                           </ul>
                       </div>

                       <div className="pt-2">
                           <a href="https://github.com/matikgal" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1">
                               github.com/matikgal
                           </a>
                       </div>

                       <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 mt-4 text-xs text-slate-500 dark:text-slate-400">
                           Stack technologiczny: React, TailwindCSS, Supabase, Vite.
                       </div>
                   </div>
                   <button onClick={() => setShowAbout(false)} className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors">Zamknij</button>
               </div>
           </div>
       )}

       {showTerms && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTerms(false)} />
               <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                   <h3 className="text-xl font-bold mb-4 shrink-0 text-slate-900 dark:text-white">Regulamin</h3>
                   <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm overflow-y-auto pr-2 custom-scrollbar flex flex-col items-center justify-center min-h-[150px]">
                       <p className="text-lg text-slate-500 dark:text-slate-400 font-medium text-center">Do uzupełnienia kiedyś może</p>
                       
                       <div className="mt-2 pt-4 w-full text-center">
                           <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Właścicielem zdjęć jest Paulinka</p>
                       </div>
                   </div>
                   <button onClick={() => setShowTerms(false)} className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shrink-0">Akceptuję i zamykam</button>
               </div>
           </div>
       )}
    </div>
  );
};
