import { useNavigate } from 'react-router-dom';
import { Activity, MessageSquare, UserMinus, Users, type LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useSpotlight } from '@/components/dashboard/useSpotlight';

interface DashboardStatsProps {
  working: number;
  absent: number;
  coverage: number;
  unread: number;
  scheduleLoading?: boolean;
  notificationsLoading?: boolean;
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: LucideIcon;
  accent: string;
  progress?: number;
  loading?: boolean;
  onClick?: () => void;
  index: number;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  progress,
  loading,
  onClick,
  index,
}: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const onMove = useSpotlight();
  const interactive = Boolean(onClick);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseMove={onMove}
      disabled={!interactive}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.06 + index * 0.07 }}
      className={`dash-glass dash-spotlight dash-lift flex flex-col gap-3 p-4 text-left sm:p-5 ${
        interactive ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ '--tile-accent': accent } as React.CSSProperties}
    >
      <div className="flex items-start justify-between">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-indigo-950/45 dark:text-indigo-100/50">
          {label}
        </p>
        <Icon className="size-[18px] shrink-0" strokeWidth={2.25} style={{ color: accent }} aria-hidden />
      </div>

      {loading ? (
        <Skeleton className="h-9 w-16 rounded-lg" />
      ) : (
        <p
          className="text-[2.1rem] font-semibold leading-none tracking-tight"
          style={{ color: accent }}
        >
          {value}
        </p>
      )}

      {typeof progress === 'number' && !loading ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-950/[0.08]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: accent }}
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </div>
      ) : (
        <p className="truncate text-xs text-indigo-950/45 dark:text-indigo-100/45">{hint}</p>
      )}
    </motion.button>
  );
}

export function DashboardStats({
  working,
  absent,
  coverage,
  unread,
  scheduleLoading,
  notificationsLoading,
}: DashboardStatsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <StatCard
        index={0}
        label="W pracy dziś"
        value={working}
        hint="osób na zmianie"
        icon={Users}
        accent="#6366f1"
        loading={scheduleLoading}
        onClick={() => navigate('/schedule')}
      />
      <StatCard
        index={1}
        label="Nieobecni"
        value={absent}
        hint="urlop · L4 · WS"
        icon={UserMinus}
        accent="#f472b6"
        loading={scheduleLoading}
        onClick={() => navigate('/vacations')}
      />
      <StatCard
        index={2}
        label="Obłożenie"
        value={`${Math.round(coverage)}%`}
        hint="względem normy"
        icon={Activity}
        accent="#06b6d4"
        progress={coverage}
        loading={scheduleLoading}
      />
      <StatCard
        index={3}
        label="Wiadomości"
        value={unread}
        hint={unread > 0 ? 'nieprzeczytane' : 'wszystko odczytane'}
        icon={MessageSquare}
        accent="#8b5cf6"
        loading={notificationsLoading}
        onClick={() => navigate('/chat')}
      />
    </div>
  );
}
