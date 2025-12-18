import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Calendar, Home, Settings, X, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils'; // Assuming cn is available in utils, or inline it if simple

interface MainLayoutProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  onAddEmployee?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  headerLeft,
  headerCenter,
  headerRight,
  onAddEmployee 
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { label: 'Grafik', sub: 'Grafik zmian', active: true },
    { label: 'Dashboard', sub: 'Statystyki', disabled: true },
    { label: 'Ustawienia', sub: 'Konfiguracja', disabled: true },
  ];

  const infoItems = [
    { label: 'O aplikacji', onClick: () => setShowAbout(true) },
    { label: 'Regulamin', onClick: () => setShowTerms(true) },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAFA] font-sans text-slate-900">
       {/* Global Header */}
        <header className="h-16 bg-white grid grid-cols-[auto_1fr_auto] items-center px-6 border-b border-gray-100 z-50 shrink-0 gap-4">
           {/* Left Section: Menu + Title + Navigation */}
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-2">
                 <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-all active:scale-95"
                 >
                     {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                 </button>
                 <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden md:block">Grafik</h1>
              </div>

              {headerLeft && (
                  <div className="flex items-center border-l border-gray-100 pl-4">
                      {headerLeft}
                  </div>
              )}
           </div>

           {/* Center Section: Templates */}
           <div className="flex justify-center items-center h-full py-1">
               {headerCenter}
           </div>
           
           {/* Right Section: View Controls + User */}
           <div className="flex items-center gap-4">
              {headerRight && (
                  <div className="flex items-center border-r border-gray-100 pr-4 h-8 gap-2">
                      {headerRight}
                  </div>
              )}
              <div className="flex items-center gap-3 shrink-0">
                 <span className="hidden sm:inline text-sm font-bold text-slate-700">{userEmail.split('@')[0]}</span>
                 <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                     {userEmail.charAt(0).toUpperCase()}
                 </div>
              </div>
           </div>
        </header>

       {/* Sidebar Overlay */}
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
            "fixed top-16 bottom-0 left-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-out flex flex-col border-r border-slate-100",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
       >
           <div className="mt-6 px-6 mb-6">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">Nawigacja</h2>
           </div>
           
           <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
               {/* Main Navigation */}
               <div className="space-y-1">
                   {menuItems.map((item, index) => (
                       <button 
                         key={index}
                         disabled={item.disabled}
                         onClick={() => !item.disabled && setIsMenuOpen(false)}
                         className={cn(
                           "w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm",
                           item.active 
                             ? "bg-emerald-50 text-emerald-700 font-bold" 
                             : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium",
                           item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                         )}
                       >
                           {item.label}
                       </button>
                   ))}
                   
                   {onAddEmployee && (
                       <button 
                         onClick={() => {
                             onAddEmployee();
                             setIsMenuOpen(false);
                         }}
                         className="w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center gap-2"
                       >
                           Zarządzaj pracownikami
                       </button>
                   )}
               </div>

           </nav>

           {/* Minimal Footer */}
           <div className="p-6 border-t border-slate-100 bg-slate-50/50">
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100/80 hover:shadow-md border border-rose-100 rounded-xl transition-all font-semibold text-sm backdrop-blur-sm shadow-sm"
               >
                   <LogOut className="w-4 h-4" />
                   Wyloguj się
               </button>
               
               <div className="flex justify-between items-center mt-4 px-2">
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
               <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                   <h3 className="text-xl font-bold mb-4">O aplikacji</h3>
                   <div className="space-y-3 text-slate-600 text-sm">
                       <p>System Grafik to nowoczesne narzędzie do zarządzania czasem pracy w małych i średnich przedsiębiorstwach.</p>
                       <p>Wersja: <strong>2.1.0 (Build 2025)</strong></p>
                       <p>Created by: <strong>Mateusz Gałuszka</strong></p>
                       
                       <div className="pt-2">
                           <p className="font-bold text-slate-800 mb-1">Planowane funkcje:</p>
                           <ul className="list-disc list-inside text-xs space-y-1 ml-1 text-slate-500">
                               <li>Pełna responsywność (Mobile/Tablet)</li>
                               <li>Zaawansowane raporty i statystyki</li>
                               <li>Eksport do PDF/Excel</li>
                           </ul>
                       </div>

                       <div className="pt-2">
                           <a href="https://github.com/matikgal" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium flex items-center gap-1">
                               github.com/matikgal
                           </a>
                       </div>

                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mt-4 text-xs text-slate-500">
                           Stack technologiczny: React, TailwindCSS, Supabase, Vite.
                       </div>
                   </div>
                   <button onClick={() => setShowAbout(false)} className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">Zamknij</button>
               </div>
           </div>
       )}

       {showTerms && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTerms(false)} />
               <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                   <h3 className="text-xl font-bold mb-4 shrink-0">Regulamin</h3>
                   <div className="space-y-3 text-slate-600 text-sm overflow-y-auto pr-2 custom-scrollbar flex flex-col items-center justify-center min-h-[150px]">
                       <p className="text-lg  text-slate-500 font-medium text-center">Do uzupełnienia kiedyś może</p>
                       
                       <div className="mt-2 pt-4 w-full text-center">
                           <p className="text-xs text-slate-400 font-medium">Właścicielem zdjęć jest Paulinka</p>
                       </div>
                   </div>
                   <button onClick={() => setShowTerms(false)} className="mt-6 w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shrink-0">Akceptuję i zamykam</button>
               </div>
           </div>
       )}
    </div>
  );
};
