import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Settings,
  LayoutDashboard,
  UsersRound,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Coffee,
  Palmtree,
  ShoppingCart,
  Phone,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppContext } from '../../context/AppContext';
import { APP_CONFIG } from '../../config/app';
import { FeedbackModal } from '../shared/FeedbackModal';
import { SystemResetModal } from '../shared/SystemResetModal';
import { AboutModal } from '../shared/AboutModal';
import { TermsModal } from '../shared/TermsModal';
import { ChangelogModal } from '../shared/ChangelogModal';
import { AppHeader } from './AppHeader';
import { SidebarMenu, type AppNavItem } from './SidebarMenu';
import { LayoutMenuContext } from '../../context/LayoutMenuContext';

interface MainLayoutProps {
  children: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
  pageTitle?: string | null;
  /** Ukrywa globalny nagłówek — pulpit ma własny header */
  headerless?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerLeft,
  headerCenter,
  headerRight,
  pageTitle,
  headerless = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [headerOffset, setHeaderOffset] = useState(56);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSystemResetOpen, setIsSystemResetOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const { userName, userAvatarId } = useAppContext();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  useEffect(() => {
    const base = APP_CONFIG.APP_NAME;
    if (pageTitle === null) {
      document.title = `Grafik zmian · ${base}`;
    } else if (pageTitle) {
      document.title = `${pageTitle} · ${base}`;
    } else {
      document.title = base;
    }
  }, [pageTitle]);

  useEffect(() => {
    if (headerless) {
      setHeaderOffset(0);
      return;
    }
    const node = headerRef.current;
    if (!node) return;

    const updateOffset = () => setHeaderOffset(node.offsetHeight);
    updateOffset();

    const observer = new ResizeObserver(updateOffset);
    observer.observe(node);
    window.addEventListener('resize', updateOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, [headerless, pageTitle, headerLeft, headerCenter, headerRight]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems: AppNavItem[] = [
    {
      label: 'Pulpit',
      sub: 'Strona główna',
      group: 'Start',
      accent: '#059669',
      active: location.pathname === '/',
      icon: LayoutDashboard,
      action: () => navigate('/'),
    },
    {
      label: 'Grafik',
      sub: 'Grafik zmian',
      group: 'Start',
      accent: '#059669',
      active: location.pathname === '/schedule',
      icon: Calendar,
      action: () => navigate('/schedule'),
    },
    {
      label: 'Urlopy',
      sub: 'Wykorzystane dni',
      group: 'Zespół',
      accent: '#0284c7',
      active: location.pathname.includes('vacations'),
      icon: Palmtree,
      action: () => navigate('/vacations'),
    },
    {
      label: 'Pracownicy',
      sub: 'Dodaj / edytuj',
      group: 'Zespół',
      accent: '#7c3aed',
      active: location.pathname === '/employees',
      icon: UsersRound,
      action: () => navigate('/employees'),
    },
    {
      label: 'Wolne soboty',
      sub: 'Rozliczenie roczne',
      group: 'Zespół',
      accent: '#ca8a04',
      active: location.pathname.includes('free-saturdays'),
      icon: Coffee,
      action: () => navigate('/free-saturdays'),
    },
    {
      label: 'Telefony',
      sub: 'Numery kontaktowe',
      group: 'Zespół',
      accent: '#db2777',
      active: location.pathname.includes('phones'),
      icon: Phone,
      action: () => navigate('/phones'),
    },
    {
      label: 'Zamówienia',
      sub: 'Lista braków',
      group: 'Sklep',
      accent: '#d97706',
      active: location.pathname.includes('orders'),
      icon: ShoppingCart,
      action: () => navigate('/orders'),
    },
    {
      label: 'Czat',
      sub: 'Komunikacja sklepów',
      group: 'Sklep',
      accent: '#0d9488',
      active: location.pathname === '/chat',
      icon: MessageSquare,
      action: () => navigate('/chat'),
    },
    {
      label: 'Sieć sklepów',
      sub: 'Wkrótce dostępne',
      group: 'Sklep',
      accent: '#4f46e5',
      active: location.pathname === '/network',
      icon: Building2,
      disabled: true,
      action: () => navigate('/network'),
    },
    {
      label: 'Instrukcja',
      sub: 'Pomoc',
      group: 'System',
      accent: '#64748b',
      active: location.pathname === '/instructions',
      icon: BookOpen,
      action: () => navigate('/instructions'),
    },
    {
      label: 'Ustawienia',
      sub: 'Konfiguracja',
      group: 'System',
      accent: '#475569',
      active: location.pathname === '/settings',
      icon: Settings,
      action: () => navigate('/settings'),
    },
    {
      label: 'Przeładuj system',
      sub: 'Reset danych',
      group: 'System',
      accent: '#b45309',
      icon: RotateCcw,
      action: () => setIsSystemResetOpen(true),
    },
    {
      label: 'Zgłoś pomysł',
      sub: 'Feedback',
      group: 'System',
      accent: '#a16207',
      disabled: true,
      icon: Lightbulb,
      action: () => setIsFeedbackModalOpen(true),
    },
  ];

  const menuContextValue = React.useMemo(
    () => ({ toggleMenu: () => setIsMenuOpen((open) => !open) }),
    [],
  );

  return (
    <LayoutMenuContext.Provider value={menuContextValue}>
    <div className={`app-shell flex h-screen w-full flex-col overflow-hidden supports-[height:100dvh]:h-[100dvh] ${headerless ? '' : 'app-brutal'}`}>
      {!headerless && (
        <AppHeader
          headerRef={headerRef}
          isMenuOpen={isMenuOpen}
          onToggleMenu={() => setIsMenuOpen((open) => !open)}
          onProfileClick={() => navigate('/settings')}
          pageTitle={pageTitle}
          userName={userName}
          userAvatarId={userAvatarId}
          userEmail={userEmail}
          headerLeft={headerLeft}
          headerCenter={headerCenter}
          headerRight={headerRight}
        />
      )}

      <SidebarMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        menuItems={menuItems}
        headerOffset={headerOffset}
        onLogout={handleLogout}
        onShowAbout={() => setShowAbout(true)}
        onShowTerms={() => setShowTerms(true)}
        onShowChangelog={() => setShowChangelog(true)}
      />

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>

      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      <SystemResetModal
        isOpen={isSystemResetOpen}
        onClose={() => setIsSystemResetOpen(false)}
        onConfirm={() => window.location.reload()}
      />
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        onOpenChangelog={() => {
          setShowAbout(false);
          setShowChangelog(true);
        }}
      />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <ChangelogModal isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
    </div>
    </LayoutMenuContext.Provider>
  );
};
