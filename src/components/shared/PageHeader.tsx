import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface PageHeaderProps {
  /** Tytuł strony (renderowany gradientem aurora) */
  title: string;
  /** Podtytuł / opis pod tytułem */
  subtitle?: React.ReactNode;
  /** Ikona w kafelku po lewej stronie tytułu */
  icon?: LucideIcon;
  /** Kolor akcentu ikony (domyślnie indygo) */
  accent?: string;
  /** Przyciski / kontrolki po prawej stronie */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Ujednolicony nagłówek podstrony — ten sam układ, rozmiar tytułu i odstępy
 * na wszystkich widokach (Urlopy, Pracownicy, Telefony, Zamówienia, ...).
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  accent = '#6366f1',
  actions,
  className,
}) => (
  <div
    className={cn(
      'mb-6 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center',
      className,
    )}
  >
    <div className="flex min-w-0 items-center gap-3">
      {Icon && (
        <span
          className="dash-head-icon"
          style={{ '--tile-accent': accent } as React.CSSProperties}
        >
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
          <span className="dash-gradient-text">{title}</span>
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-indigo-950/55 dark:text-indigo-100/60">{subtitle}</p>
        )}
      </div>
    </div>

    {actions && (
      <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto md:flex-nowrap md:justify-end">
        {actions}
      </div>
    )}
  </div>
);
