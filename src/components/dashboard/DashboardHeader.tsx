import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Clock, CloudSun, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { findStoreByWeatherLocation } from '@/config/stores';
import type { WeatherLocation } from '@/config/app';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherSnapshot {
  temperature: number;
  condition: string;
}

interface DashboardHeaderProps {
  userName: string;
  storeLocation: WeatherLocation;
  time: Date;
  weather: WeatherSnapshot | null;
  weatherLoading: boolean;
}

const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

/** Powitanie zależne od pory dnia — żeby się człowiekowi chciało :) */
function greetingWord(hour: number): string {
  if (hour < 6) return 'Dobrej nocy';
  if (hour < 12) return 'Dzień dobry';
  if (hour < 18) return 'Cześć';
  return 'Dobry wieczór';
}

export function DashboardHeader({
  userName,
  storeLocation,
  time,
  weather,
  weatherLoading,
}: DashboardHeaderProps) {
  const reduceMotion = useReducedMotion();
  const store = findStoreByWeatherLocation(storeLocation);
  const storeLabel = store ? `Sklep ${store.city}` : storeLocation.name;
  const greeting = greetingWord(time.getHours());

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex shrink-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500/90">
          Pulpit kierownika
        </p>
        <h1 className="mt-2 flex flex-wrap items-baseline gap-x-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
          <span>{greeting},</span>
          <span className="dash-gradient-text">{userName}</span>
        </h1>
        <p className="mt-3 flex items-center gap-2 text-base text-indigo-950/55 dark:text-indigo-100/60">
          <span className="flex size-6 items-center justify-center rounded-lg bg-white/60 text-indigo-500 shadow-sm dark:bg-white/10">
            <MapPin className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="truncate font-medium">
            {storeLabel} · {capitalize(format(time, 'EEEE, d MMMM', { locale: pl }))}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-stretch gap-2.5">
        <div className="dash-pill">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 text-indigo-600">
            <Clock className="size-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <p className="text-[0.72rem] font-medium text-indigo-950/45 dark:text-indigo-100/50">Teraz</p>
            <p className="tnum text-2xl font-semibold leading-tight tracking-tight">
              {format(time, 'HH:mm')}
            </p>
          </div>
        </div>

        <div className="dash-pill">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/20 to-cyan-300/10 text-sky-600">
            <CloudSun className="size-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[0.72rem] font-medium text-indigo-950/45 dark:text-indigo-100/50">Pogoda</p>
            {weatherLoading ? (
              <Skeleton className="mt-1 h-6 w-24 rounded-md" />
            ) : (
              <p className="truncate text-base font-semibold leading-tight">
                {weather
                  ? `${Math.round(weather.temperature)}° · ${weather.condition.toLowerCase()}`
                  : 'Brak danych'}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
