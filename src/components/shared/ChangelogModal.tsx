import React, { useState } from 'react';
import { X, GitCommit, Tag, Wrench, Zap, ShieldCheck, Palette, Package } from 'lucide-react';
import { CHANGELOG, ChangeTag } from '../../data/changelog';
import { APP_CONFIG } from '../../config/app';
import { cn } from '../../utils';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_META: Record<ChangeTag, { label: string; icon: React.ElementType; className: string }> = {
  feat:     { label: 'Nowość',      icon: Package,    className: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' },
  fix:      { label: 'Naprawa',     icon: Wrench,     className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  perf:     { label: 'Wydajność',   icon: Zap,        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  refactor: { label: 'Refaktor',    icon: GitCommit,  className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  security: { label: 'Bezp.',       icon: ShieldCheck, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  ui:       { label: 'Interfejs',   icon: Palette,    className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
};

const TagBadge: React.FC<{ tag: ChangeTag }> = ({ tag }) => {
  const meta = TAG_META[tag];
  const Icon = meta.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0', meta.className)}>
      <Icon className="w-2.5 h-2.5" />
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-0 animate-in zoom-in-95 duration-200 max-h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 id="changelog-title" className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-500" />
              Historia zmian
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {APP_CONFIG.APP_NAME} &nbsp;·&nbsp; {CHANGELOG.length} wydań
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          {(Object.entries(TAG_META) as [ChangeTag, typeof TAG_META[ChangeTag]][]).map(([tag, meta]) => {
            const Icon = meta.icon;
            return (
              <span key={tag} className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded', meta.className)}>
                <Icon className="w-2.5 h-2.5" />
                {meta.label}
              </span>
            );
          })}
        </div>

        {/* Releases list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
          {CHANGELOG.map((release) => {
            const isOpen = expanded === release.version;
            return (
              <div key={release.version}>
                <button
                  onClick={() => setExpanded(isOpen ? null : release.version)}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">
                      v{release.version}
                    </span>
                    {release.label && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        {release.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium tabular-nums">{release.date}</span>
                    <span className={cn(
                      'text-slate-400 transition-transform duration-200 text-base leading-none select-none',
                      isOpen && 'rotate-180',
                    )}>
                      ▾
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <ul className="px-6 pb-4 space-y-2">
                    {release.changes.map((entry, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                        <TagBadge tag={entry.tag} />
                        <span className="leading-snug pt-0.5">{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95 transform"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
