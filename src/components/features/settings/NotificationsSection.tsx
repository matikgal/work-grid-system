import React from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Bell, CheckCheck, Loader2, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../utils';
import { SettingsSection } from './SettingsSection';

interface NotificationsSectionProps {
  emailNotifs: boolean;
  setEmailNotifs: (enabled: boolean) => void;
  browserNotifs: boolean;
  setBrowserNotifs: (enabled: boolean) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-sky-600" strokeWidth={1.75} />,
  warning: <AlertCircle className="h-4 w-4 text-amber-600" strokeWidth={1.75} />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />,
};

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  emailNotifs,
  setEmailNotifs,
  browserNotifs,
  setBrowserNotifs,
}) => {
  const [userId, setUserId] = React.useState('');
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(userId);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  return (
    <SettingsSection
      title="Powiadomienia"
      subtitle="Alerty w aplikacji"
      icon={Bell}
      accent="#db2777"
      headerRight={
        unreadCount > 0 ? (
          <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
            <span className="rounded-full bg-rose-500/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-600">
              {unreadCount} nowych
            </span>
            <button
              type="button"
              onClick={() => markAllRead()}
              className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-indigo-950/55 transition-colors hover:text-indigo-600 dark:text-indigo-100/55"
            >
              <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Oznacz wszystkie
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="settings-row cursor-not-allowed opacity-60">
          <span className="text-sm font-semibold">E-mail (wkrótce)</span>
          <input type="checkbox" checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} disabled />
        </label>
        <label className="settings-row cursor-not-allowed opacity-60">
          <span className="text-sm font-semibold">Przeglądarka (wkrótce)</span>
          <input
            type="checkbox"
            checked={browserNotifs}
            onChange={(e) => setBrowserNotifs(e.target.checked)}
            disabled
          />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" aria-hidden />
        </div>
      ) : notifications.length === 0 ? (
        <p className="py-8 text-center text-sm text-indigo-950/45 dark:text-indigo-100/50">
          Brak powiadomień
        </p>
      ) : (
        <div className="dash-scroll max-h-80 space-y-2 overflow-y-auto">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn(
                'flex w-full cursor-pointer items-start gap-3 rounded-xl border border-indigo-950/10 bg-white/55 p-3 text-left transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.04]',
                !n.isRead && 'border-rose-300/40 bg-rose-50/70 dark:bg-rose-500/10',
              )}
            >
              {TYPE_ICONS[n.type] || TYPE_ICONS.info}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                {n.body && <p className="mt-1 text-xs text-indigo-950/60 dark:text-indigo-100/60">{n.body}</p>}
                <p className="mt-1 text-[10px] tabular-nums text-indigo-950/45 dark:text-indigo-100/45">
                  {format(new Date(n.createdAt), 'd MMM yyyy, HH:mm', { locale: pl })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </SettingsSection>
  );
};
