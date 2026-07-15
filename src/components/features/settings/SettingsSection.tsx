import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../../utils';

type SettingsSectionProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const SettingsSection = ({
  title,
  subtitle,
  icon: Icon,
  accent = '#6366f1',
  headerRight,
  children,
  className = '',
}: SettingsSectionProps) => (
  <section
    className={cn('dash-glass p-5 sm:p-6', className)}
    style={{ '--tile-accent': accent } as React.CSSProperties}
  >
    <div className="flex items-start justify-between gap-3 border-b border-white/40 pb-4">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, #fff)`,
            color: accent,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 22%, transparent)`,
          }}
        >
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            Sekcja
          </p>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-xs text-indigo-950/55 dark:text-indigo-100/55">{subtitle}</p>
        </div>
      </div>
      {headerRight}
    </div>
    <div className="pt-5">{children}</div>
  </section>
);
