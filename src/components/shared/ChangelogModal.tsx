import React, { useState } from 'react';
import { X, GitCommit, Tag, Wrench, Zap, ShieldCheck, Palette, Package, ChevronDown } from 'lucide-react';
import { CHANGELOG, ChangeTag } from '../../data/changelog';
import { APP_CONFIG } from '../../config/app';
import { cn } from '../../utils';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_META: Record<ChangeTag, { label: string; icon: React.ElementType; className: string }> = {
  feat:     { label: 'Nowość',    icon: Package,    className: 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300' },
  fix:      { label: 'Naprawa',   icon: Wrench,     className: 'bg-rose-500/15 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300' },
  perf:     { label: 'Wydajność', icon: Zap,        className: 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300' },
  refactor: { label: 'Refaktor',  icon: GitCommit,  className: 'bg-slate-500/15 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300' },
  security: { label: 'Bezp.',     icon: ShieldCheck, className: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300' },
  ui:       { label: 'Interfejs', icon: Palette,    className: 'bg-violet-500/15 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300' },
};

const TagBadge: React.FC<{ tag: ChangeTag }> = ({ tag }) => {
  const meta = TAG_META[tag];
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold', meta.className)}>
      <Icon className="h-2.5 w-2.5" />
      {meta.label}
    </span>
  );
};

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  const [expanded, setExpanded] = useState<string | null>(CHANGELOG[0]?.version ?? null);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-indigo-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-in zoom-in-95 relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 text-indigo-950 shadow-[0_28px_70px_-28px_rgba(49,46,129,0.65)] backdrop-blur-2xl duration-200 dark:border-white/10 dark:bg-[#14121f]/90 dark:text-indigo-50">
        {/* Aurora za szkłem */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-violet-400/25 blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/45 px-6 py-4 dark:border-white/10">
          <div>
            <h3
              id="changelog-title"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-sky-300"
            >
              <Tag className="h-5 w-5 text-violet-500 dark:text-violet-300" />
              Historia zmian
            </h3>
            <p className="mt-0.5 text-xs text-indigo-950/50 dark:text-indigo-100/55">
              {APP_CONFIG.APP_NAME} &nbsp;·&nbsp; {CHANGELOG.length} wydań
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-xl p-1.5 text-indigo-950/50 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/55"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex shrink-0 flex-wrap gap-2 border-b border-white/45 bg-white/30 px-6 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
          {(Object.entries(TAG_META) as [ChangeTag, (typeof TAG_META)[ChangeTag]][]).map(([tag, meta]) => {
            const Icon = meta.icon;
            return (
              <span key={tag} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold', meta.className)}>
                <Icon className="h-2.5 w-2.5" />
                {meta.label}
              </span>
            );
          })}
        </div>

        {/* Releases list */}
        <div className="dash-scroll flex-1 divide-y divide-white/45 overflow-y-auto dark:divide-white/10">
          {CHANGELOG.map((release) => {
            const isOpen = expanded === release.version;
            return (
              <div key={release.version}>
                <button
                  onClick={() => setExpanded(isOpen ? null : release.version)}
                  className="flex w-full items-center justify-between px-6 py-3.5 text-left transition-colors hover:bg-white/40 dark:hover:bg-white/[0.04]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-indigo-950 dark:text-white">
                      v{release.version}
                    </span>
                    {release.label && (
                      <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_14px_-8px_rgba(99,102,241,0.9)]">
                        {release.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tabular-nums text-indigo-950/45 dark:text-indigo-100/45">
                      {release.date}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-indigo-950/40 transition-transform duration-200 dark:text-indigo-100/45',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {isOpen && (
                  <ul className="animate-in fade-in slide-in-from-top-1 space-y-2 px-6 pb-4 duration-200">
                    {release.changes.map((entry, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-indigo-950/65 dark:text-indigo-100/65"
                      >
                        <TagBadge tag={entry.tag} />
                        <span className="pt-0.5 leading-snug">{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-white/45 bg-white/30 p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_-12px_rgba(99,102,241,0.9)] transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
