import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ArrowRight, CalendarDays, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeAvatar } from '@/components/dashboard/EmployeeAvatar';
import type { TodayAbsentRow, TodayShiftRow } from '@/lib/dashboardSchedule';
import { formatShiftClock } from '@/lib/dashboardSchedule';

interface TodaySchedulePanelProps {
  working: TodayShiftRow[];
  absent: TodayAbsentRow[];
  loading?: boolean;
  isMock?: boolean;
}

export function TodaySchedulePanel({ working, absent, loading, isMock }: TodaySchedulePanelProps) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const today = new Date();
  // Pełna obsada to 14 osób na zmianie (100% obłożenia).
  const coverage = working.length > 0 ? Math.min(100, (working.length / 14) * 100) : 0;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.14 }}
      className="dash-glass flex min-h-0 flex-col overflow-hidden"
    >
      {/* Nagłówek */}
      <header className="flex items-center justify-between gap-3 border-b border-white/40 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/18 to-violet-500/10 text-indigo-600">
            <CalendarDays className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Dziś w grafiku</h2>
            <p className="text-xs text-indigo-950/45 dark:text-indigo-100/55">
              {format(today, 'EEEE, d MMMM', { locale: pl })}
            </p>
          </div>
        </div>
        {!loading && working.length > 0 && (
          <div className="hidden min-w-[7.5rem] sm:block">
            <div className="flex items-center justify-between text-xs text-indigo-950/50 dark:text-indigo-100/55">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden /> Obłożenie
              </span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {working.length}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-indigo-950/[0.08]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${coverage}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Lista pracujących */}
      <div className="dash-scroll min-h-0 flex-1 overflow-y-auto px-3 py-1.5">
        {loading ? (
          <div className="space-y-1 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="size-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : working.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/50 text-indigo-400 dark:bg-white/5">
              <CalendarDays className="size-6" aria-hidden />
            </span>
            <p className="text-sm font-medium text-indigo-950/55 dark:text-indigo-100/55">Brak zaplanowanych zmian na dziś</p>
          </div>
        ) : (
          <ul className="py-0.5">
            {working.map((row, index) => (
              <motion.li
                key={row.id}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.18 + index * 0.04 }}
                className="flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-white/45 dark:hover:bg-white/[0.05]"
              >
                <EmployeeAvatar name={row.name} colorClass={row.avatarColor} seed={row.employeeId} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{row.name}</p>
                  <p className="truncate text-xs text-indigo-950/45 dark:text-indigo-100/50">
                    {row.role}
                  </p>
                </div>
                <span className="dash-chip shrink-0">
                  {formatShiftClock(row.startTime)}–{formatShiftClock(row.endTime)}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Nieobecni */}
      <div className="border-t border-white/40 px-5 py-3.5">
        <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-indigo-950/45 dark:text-indigo-100/50">
          Nieobecni dziś
        </p>
        {absent.length === 0 ? (
          <p className="text-sm text-indigo-950/55 dark:text-indigo-100/60">Wszyscy obecni 🎉</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {absent.map((row) => (
              <li key={row.employeeId} className="dash-chip gap-2 py-1 pl-1 pr-2.5">
                <EmployeeAvatar name={row.name} colorClass={row.avatarColor} seed={row.employeeId} size="sm" />
                {row.name}
                <span className="rounded-full bg-gradient-to-r from-rose-400/20 to-pink-400/15 px-1.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-rose-600">
                  {row.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Stopka */}
      <footer className="flex items-center justify-between gap-3 border-t border-white/40 px-5 py-3.5">
        <span className="text-xs text-indigo-950/45 dark:text-indigo-100/50">
          {isMock ? 'Dane przykładowe' : `${working.length} zmian zaplanowanych`}
        </span>
        <button type="button" className="dash-btn" onClick={() => navigate('/schedule')}>
          Otwórz grafik
          <ArrowRight className="dash-btn__arrow size-4" aria-hidden />
        </button>
      </footer>
    </motion.section>
  );
}
