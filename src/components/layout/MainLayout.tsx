import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Calendar, Home, Settings, X, ChevronRight, LayoutDashboard, UsersRound, BookOpen, Lightbulb, RotateCcw, Coffee, Palmtree, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils';
import { useAppContext } from '../../context/AppContext';

// Modals
import { FeedbackModal } from '../FeedbackModal';
import { SystemResetModal } from '../SystemResetModal';
import { APP_CONFIG } from '../../config/app';

interface MainLayoutProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  onAddEmployee?: () => void;
  pageTitle?: string | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  headerLeft,
  headerCenter,
  headerRight,
  onAddEmployee,
  pageTitle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Internal Modal States
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSystemResetOpen, setIsSystemResetOpen] = useState(false);

  // App Context
  const { 
      userName
  } = useAppContext();

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
    { label: 'Pulpit', sub: 'Przegląd', active: location.pathname === '/', icon: LayoutDashboard, action: () => navigate('/') },
    { label: 'Grafik', sub: 'Grafik zmian', active: location.pathname === '/schedule', icon: Calendar, action: () => navigate('/schedule') },
    { label: 'Wolne Soboty', sub: 'Rozliczenie roczne', active: location.pathname.includes('free-saturdays'), icon: Coffee, action: () => navigate('/free-saturdays') },
    { label: 'Urlopy', sub: 'Wykorzystane dni', active: location.pathname.includes('vacations'), icon: Palmtree, action: () => navigate('/vacations') },
    { label: 'Zamówienia', sub: 'Lista braków', active: location.pathname.includes('orders'), icon: ShoppingCart, action: () => navigate('/orders') },
    { label: 'Zarządzaj pracownikami', sub: 'Dodaj/Edytuj', disabled: false, icon: UsersRound, action: onAddEmployee || (() => navigate('/schedule')) },
    { label: 'Instrukcja', sub: 'Pomoc', disabled: false, icon: BookOpen, action: () => navigate('/instructions') },
    { label: 'Przeładuj system', sub: 'Reset danych', disabled: false, icon: RotateCcw, action: () => setIsSystemResetOpen(true) },
    { label: 'Zgłoś pomysł', sub: 'Feedback', disabled: false, icon: Lightbulb, action: () => setIsFeedbackModalOpen(true) },
    { label: 'Ustawienia', sub: 'Konfiguracja', disabled: false, icon: Settings, action: () => navigate('/settings') },
  ];

  return (
    <div className="flex flex-col h-screen supports-[height:100dvh]:h-[100dvh] w-full bg-[#FAFAFA] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
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
                 {pageTitle !== null && (
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight hidden md:block">{pageTitle || 'Grafik'}</h1>
                 )}
              </div>

              {headerLeft && (
                  <div className="flex items-center border-l border-gray-100 pl-4">
                      {headerLeft}
                  </div>
              )}
           </div>

           {/* Center Section: Templates - Responsive wrapping */}
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
                 <span className="hidden sm:inline text-sm font-bold text-slate-700 dark:text-slate-300">{userName || userEmail.split('@')[0]}</span>
                 <div 
                    className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs select-none overflow-hidden relative ring-2 ring-white dark:ring-slate-700 hover:scale-105 active:scale-95 transition-all"
                  >
                      {(userName || userEmail).charAt(0).toUpperCase()}
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

       {/* Global Modals */}
       <FeedbackModal 
         isOpen={isFeedbackModalOpen} 
         onClose={() => setIsFeedbackModalOpen(false)} 
       />
       <SystemResetModal
         isOpen={isSystemResetOpen}
         onClose={() => setIsSystemResetOpen(false)}
         onConfirm={() => window.location.reload()}
       />

       {/* Modals for About/Terms */}
       {showAbout && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAbout(false)} />
               <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                   <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white">O aplikacji</h3>
                       <button onClick={() => setShowAbout(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                           <X className="w-5 h-5 text-slate-500" />
                       </button>
                   </div>
                   
                   <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
                       <div className="text-center py-4 border-b border-slate-100 dark:border-slate-800">
                           <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                               <LayoutDashboard className="w-8 h-8" strokeWidth={1.5} />
                           </div>
                           <h4 className="text-lg font-bold text-slate-900 dark:text-white">{APP_CONFIG.APP_NAME}</h4>
                           <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">v{APP_CONFIG.APP_VERSION} (Build {APP_CONFIG.APP_BUILD})</p>
                       </div>

                       <p className="leading-relaxed text-center px-4">
                           {APP_CONFIG.APP_DESCRIPTION}
                       </p>
                       
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                           <div className="flex justify-between">
                               <span className="text-slate-500 dark:text-slate-400">Autor:</span>
                               <span className="font-medium text-slate-900 dark:text-white">{APP_CONFIG.APP_AUTHOR}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-slate-500 dark:text-slate-400">Rok:</span>
                               <span className="font-medium text-slate-900 dark:text-white">{APP_CONFIG.APP_YEAR}</span>
                           </div>
                           <div className="flex justify-between">
                               <span className="text-slate-500 dark:text-slate-400">Kontakt:</span>
                               <a href={APP_CONFIG.APP_AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                                   GitHub Profil
                               </a>
                           </div>
                       </div>
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                       <p className="text-[10px] text-slate-400">
                           Wszelkie prawa zastrzeżone &copy; {APP_CONFIG.APP_YEAR} <br/>
                           Design & Development by {APP_CONFIG.APP_AUTHOR}
                       </p>
                   </div>
               </div>
           </div>
       )}

       {showTerms && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTerms(false)} />
               <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl p-0 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col overflow-hidden">
                   
                   {/* Header */}
                   <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                       <div>
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Regulamin Serwisu</h3>
                           <p className="text-xs text-slate-500 dark:text-slate-400">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
                       </div>
                       <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                           <X className="w-5 h-5 text-slate-500" />
                       </button>
                   </div>

                   {/* Scrollable Content */}
                   <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                       <section>
                           <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Postanowienia ogólne</h4>
                           <p>
                               Niniejszy regulamin określa zasady korzystania z systemu <strong>{APP_CONFIG.APP_NAME}</strong>.
                               Dostęp do aplikacji jest możliwy wyłącznie dla autoryzowanych pracowników i administratorów.
                               Korzystanie z serwisu oznacza akceptację poniższych warunków.
                           </p>
                       </section>

                       <section>
                           <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Zasady użytkowania</h4>
                           <ul className="list-disc list-inside space-y-1 ml-1">
                               <li>Użytkownik zobowiązuje się do korzystania z systemu zgodnie z jego przeznaczeniem.</li>
                               <li>Zabrania się wprowadzania fałszywych danych oraz prób nieautoryzowanego dostępu.</li>
                               <li>Hasła dostępowe są poufne i nie mogą być udostępniane osobom trzecim.</li>
                           </ul>
                       </section>

                       <section>
                           <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Ochrona danych (RODO)</h4>
                           <p>
                               System przetwarza dane osobowe pracowników w zakresie niezbędnym do planowania i ewidencji czasu pracy.
                               Administratorem danych jest operator systemu. Dane są chronione zgodnie z obowiązującymi przepisami prawa.
                           </p>
                       </section>

                       <section>
                           <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Odpowiedzialność</h4>
                           <p>
                               Twórca oprogramowania nie ponosi odpowiedzialności za błędy w grafikach wynikające z wprowadzenia niepoprawnych danych przez użytkowników.
                               System służy jako narzędzie wspomagające, a ostateczna weryfikacja zgodności z Kodeksem Pracy leży po stronie Pracodawcy.
                           </p>
                       </section>

                        <section className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-4">
                           <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Nota Prawna</h4>
                           <p className="text-xs">
                               Oprogramowanie <strong>{APP_CONFIG.APP_NAME}</strong> jest dostarczane w modelu "as is" (takim jaki jest), bez gwarancji jakiegokolwiek rodzaju.
                               Twórca (Mateusz Gałuszka) zachowuje wszelkie prawa autorskie do kodu źródłowego i projektu interfejsu.
                           </p>
                       </section>
                   </div>

                   {/* Footer */}
                   <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                       <button 
                           onClick={() => setShowTerms(false)} 
                           className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10 active:scale-95 transform"
                       >
                           Zamknij
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};
