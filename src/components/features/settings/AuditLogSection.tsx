import React from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ScrollText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../../services/auditService';
import { supabase } from '../../../lib/supabase';
import { SettingsSection } from './SettingsSection';

export const AuditLogSection: React.FC = () => {
  const [userId, setUserId] = React.useState('');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit_logs', userId],
    queryFn: () => auditService.getRecent(userId),
    enabled: !!userId,
  });

  const ACTION_LABELS: Record<string, string> = {
    shift_saved: 'Zapisano zmianę',
    shift_deleted: 'Usunięto zmianę',
    vacation_request_created: 'Nowy wniosek urlopowy',
    vacation_request_approved: 'Zaakceptowano wniosek',
    vacation_request_rejected: 'Odrzucono wniosek',
    store_updated: 'Zaktualizowano sklep',
    employee_imported: 'Import pracowników',
  };

  return (
    <SettingsSection title="Dziennik zdarzeń" subtitle="Ostatnie operacje w systemie" icon={ScrollText} accent="#64748b">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" aria-hidden />
        </div>
      ) : logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-indigo-950/45 dark:text-indigo-100/50">
          Brak wpisów w dzienniku
        </p>
      ) : (
        <div className="dash-scroll max-h-64 space-y-1.5 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-indigo-950/[0.08] bg-white/55 px-3 py-2.5 text-xs dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="font-semibold text-indigo-950/75 dark:text-indigo-100/75">
                {ACTION_LABELS[log.action] || log.action}
              </span>
              <span className="shrink-0 text-[10px] tabular-nums text-indigo-950/45 dark:text-indigo-100/45">
                {format(new Date(log.createdAt), 'd MMM HH:mm', { locale: pl })}
              </span>
            </div>
          ))}
        </div>
      )}
    </SettingsSection>
  );
};
