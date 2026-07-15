import React from 'react';
import type { LucideIcon } from 'lucide-react';

/** Sekcja instrukcji — nagłówek z kolorową ikoną + szklana karta z treścią. */
export function InstructionSection({
  id,
  icon: Icon,
  title,
  accent,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `color-mix(in srgb, ${accent} 14%, #fff)`,
            color: accent,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 22%, transparent)`,
          }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="dash-glass space-y-5 p-6">{children}</div>
    </section>
  );
}

/** Pojedyncza pozycja w sekcji — ikona + tytuł + opis. */
export function InstructionItem({
  icon: Icon,
  title,
  accent = '#6366f1',
  children,
}: {
  icon: LucideIcon;
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${accent} 13%, #fff)`, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <strong className="block text-sm font-semibold">{title}</strong>
        <p className="mt-0.5 text-sm leading-relaxed text-indigo-950/60 dark:text-indigo-100/65">
          {children}
        </p>
      </div>
    </div>
  );
}

/** Akapit wprowadzający w sekcji. */
export function InstructionLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-indigo-950/65 dark:text-indigo-100/65">{children}</p>
  );
}
