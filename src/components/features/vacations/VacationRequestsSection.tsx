/**
 * Wnioski urlopowe — moduł na przyszłość (dostęp pracowników, osobne konta).
 * Obecnie aplikacja tylko dla kierowników; sekcja nie jest podpięta w UI.
 */
import React, { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Palmtree, Plus, Check, X, Loader2 } from 'lucide-react';
import { useVacationRequests } from '../../../hooks/useVacationRequests';
import { Employee } from '../../../types';
import { auditService } from '../../../services/auditService';
import { notificationService } from '../../../services/notificationService';
import { cn } from '../../../utils';
import { toast } from 'sonner';

interface VacationRequestsSectionProps {
  session: Session;
  employees: Employee[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Oczekuje',
  approved: 'Zaakceptowany',
  rejected: 'Odrzucony',
};

export const VacationRequestsSection: React.FC<VacationRequestsSectionProps> = ({
  session,
  employees,
}) => {
  const userId = session.user.id;
  const { requests, loading, createRequest, updateStatus } = useVacationRequests(userId);

  const [showForm, setShowForm] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name || '—';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !dateFrom || !dateTo) return;

    const days = differenceInCalendarDays(parseISO(dateTo), parseISO(dateFrom)) + 1;
    if (days < 1) {
      toast.error('Data końcowa musi być po dacie początkowej');
      return;
    }

    setSubmitting(true);
    try {
      const req = await createRequest({ employeeId, dateFrom, dateTo, daysCount: days, reason });
      await auditService.log(userId, 'vacation_request_created', 'vacation_requests', req.id);
      await notificationService.create(
        userId,
        'Nowy wniosek urlopowy',
        `${getEmployeeName(employeeId)}: ${dateFrom} – ${dateTo}`,
        'info',
      );
      toast.success('Wniosek urlopowy złożony');
      setShowForm(false);
      setEmployeeId('');
      setDateFrom('');
      setDateTo('');
      setReason('');
    } catch {
      toast.error('Nie udało się złożyć wniosku. Uruchom migrację Fazy 3 w Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateStatus({ id, status });
      await auditService.log(userId, `vacation_request_${status}`, 'vacation_requests', id);
      toast.success(status === 'approved' ? 'Wniosek zaakceptowany' : 'Wniosek odrzucony');
    } catch {
      toast.error('Błąd aktualizacji statusu');
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Wnioski urlopowe</h2>
            <p className="text-xs text-slate-500">Składanie i akceptacja wniosków</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nowy wniosek
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
          >
            <option value="">Wybierz pracownika</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} required className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} required className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Powód (opcjonalnie)" className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" />
          <button type="submit" disabled={submitting} className="md:col-span-2 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Złóż wniosek'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Brak wniosków urlopowych</p>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div key={req.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{getEmployeeName(req.employeeId)}</p>
                <p className="text-xs text-slate-500">{req.dateFrom} → {req.dateTo} ({req.daysCount} dni)</p>
                {req.reason && <p className="text-xs text-slate-400 mt-0.5">{req.reason}</p>}
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase px-2 py-1 rounded-full',
                req.status === 'pending' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                req.status === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                req.status === 'rejected' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              )}>
                {STATUS_LABELS[req.status]}
              </span>
              {req.status === 'pending' && (
                <div className="flex gap-1">
                  <button onClick={() => handleStatus(req.id, 'approved')} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200" title="Akceptuj"><Check className="w-4 h-4" /></button>
                  <button onClick={() => handleStatus(req.id, 'rejected')} className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200" title="Odrzuć"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
