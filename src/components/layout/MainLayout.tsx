import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Calendar, Settings, X, LayoutDashboard, UsersRound, BookOpen, Lightbulb, RotateCcw, Coffee, Palmtree, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';

// Modals
import { FeedbackModal } from '../shared/FeedbackModal';
import { SystemResetModal } from '../shared/SystemResetModal';
import { AboutModal } from '../shared/AboutModal';
import { TermsModal } from '../shared/TermsModal';
import { ChangelogModal } from '../shared/ChangelogModal';
import { SidebarMenu } from './SidebarMenu';

interface MainLayoutProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  pageTitle?: string | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  headerLeft,
  headerCenter,
  headerRight,
  pageTitle
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  // Internal Modal States
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSystemResetOpen, setIsSystemResetOpen] = useState(false);

  // App Context
  const { userName } = useAppContext();

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
    { label: 'Zarządzaj pracownikami', sub: 'Dodaj/Edytuj', active: location.pathname === '/employees', disabled: false, icon: UsersRound, action: () => navigate('/employees') },
    { label: 'Instrukcja', sub: 'Pomoc', disabled: false, icon: BookOpen, action: () => navigate('/instructions') },
    { label: 'Przeładuj system', sub: 'Reset danych', disabled: false, icon: RotateCcw, action: () => setIsSystemResetOpen(true) },
    { label: 'Zgłoś pomysł', sub: 'Feedback', disabled: true, icon: Lightbulb, action: () => setIsFeedbackModalOpen(true) },
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
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{pageTitle || 'Grafik'}</h1>
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

       {/* Sidebar component replacing raw markup */}
       <SidebarMenu
           isMenuOpen={isMenuOpen}
           setIsMenuOpen={setIsMenuOpen}
           menuItems={menuItems}
           onLogout={handleLogout}
           onShowAbout={() => setShowAbout(true)}
           onShowTerms={() => setShowTerms(true)}
           onShowChangelog={() => setShowChangelog(true)}
       />

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

       {/* Modals for About/Terms/Changelog */}
       <AboutModal
         isOpen={showAbout}
         onClose={() => setShowAbout(false)}
         onOpenChangelog={() => { setShowAbout(false); setShowChangelog(true); }}
       />
       <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
       <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />

    </div>
  );
};
