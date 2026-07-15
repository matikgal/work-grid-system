import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, MessageSquare } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  DASHBOARD_NAV_MODULES,
  type DashboardNavModuleId,
} from '@/config/dashboardNavModules';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpotlight } from '@/components/dashboard/useSpotlight';

interface DashboardSidePanelProps {
  unreadCount: number;
  notificationsLoading?: boolean;
}

const MODULE_ACCENT: Record<DashboardNavModuleId, string> = {
  vacations: '#0ea5e9',
  orders: '#f59e0b',
  employees: '#8b5cf6',
  phones: '#ec4899',
  'free-saturdays': '#14b8a6',
  chat: '#6366f1',
  network: '#6366f1',
  instructions: '#06b6d4',
  settings: '#64748b',
};

export function DashboardSidePanel({ unreadCount, notificationsLoading }: DashboardSidePanelProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const onMove = useSpotlight();

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="dash-glass flex min-h-0 flex-col p-4 sm:p-5"
    >
      <header className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-indigo-500/90">
            Nawigacja
          </p>
          <h2 className="mt-0.5 text-xl font-semibold tracking-tight">Szybki dostęp</h2>
        </div>
        <span className="rounded-full bg-white/55 px-2.5 py-1 text-xs font-medium text-indigo-950/55 shadow-sm dark:bg-white/10 dark:text-indigo-100/60">
          {DASHBOARD_NAV_MODULES.length} modułów
        </span>
      </header>

      <div className="dash-scroll dash-tiles min-h-0 flex-1 overflow-y-auto">
        {DASHBOARD_NAV_MODULES.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.button
              key={mod.id}
              type="button"
              onMouseMove={onMove}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: 0.24 + index * 0.035 }}
              onClick={() => navigate(mod.path)}
              className="dash-tile dash-spotlight dash-lift"
              style={{ '--tile-accent': MODULE_ACCENT[mod.id] } as React.CSSProperties}
            >
              <span className="dash-tile__text">
                <span className="dash-tile__title">{mod.title}</span>
                <span className="dash-tile__sub line-clamp-2">{mod.subtitle}</span>
              </span>
              <span className="dash-tile__icon">
                <Icon size={20} strokeWidth={2} aria-hidden />
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Wiadomości */}
      <button
        type="button"
        onClick={() => navigate('/chat')}
        onMouseMove={onMove}
        className="dash-glass--soft dash-spotlight mt-4 flex w-full cursor-pointer items-center gap-3 border border-white/50 p-3.5 text-left"
        style={{ '--tile-accent': '#8b5cf6' } as React.CSSProperties}
      >
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-600">
          <MessageSquare className="size-5" strokeWidth={2} aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 px-1 text-[0.62rem] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] font-semibold">Wiadomości</p>
          {notificationsLoading ? (
            <Skeleton className="mt-1 h-3.5 w-28 rounded-md" />
          ) : (
            <p className="flex items-center gap-1 text-xs text-indigo-950/55 dark:text-indigo-100/60">
              <Bell className="size-3" aria-hidden />
              {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : 'Wszystko odczytane'}
            </p>
          )}
        </div>
        <ArrowRight className="size-4 shrink-0 text-indigo-400" aria-hidden />
      </button>
    </motion.aside>
  );
}
