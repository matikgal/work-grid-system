import React from 'react';
import { X, LayoutDashboard, Github, Globe, Cpu, Database, Code2, Tag, Zap } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';
import { CHANGELOG } from '../../data/changelog';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangelog: () => void;
}

const TECH_STACK = [
  { icon: Code2, label: 'React 19 + TypeScript', desc: 'Warstwa UI' },
  { icon: Zap, label: 'Vite + Tailwind CSS v4', desc: 'Build & style' },
  { icon: Database, label: 'Supabase (PostgreSQL)', desc: 'Backend & Auth' },
  { icon: Cpu, label: 'TanStack Query', desc: 'Stan serwera' },
];

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenChangelog }) => {
  if (!isOpen) return null;

  const latestRelease = CHANGELOG[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-indigo-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/80 text-indigo-950 shadow-[0_28px_70px_-28px_rgba(49,46,129,0.65)] backdrop-blur-2xl duration-200 dark:border-white/10 dark:bg-[#14121f]/90 dark:text-indigo-50">
        {/* Aurora za szkłem */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -right-12 top-1/4 h-52 w-52 rounded-full bg-violet-400/25 blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-5">
          <h3
            id="about-modal-title"
            className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-sky-300"
          >
            O aplikacji
          </h3>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-xl p-1.5 text-indigo-950/50 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/55"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-6 text-sm text-indigo-950/65 dark:text-indigo-100/65">
          {/* App identity */}
          <div className="rounded-2xl border border-white/55 bg-white/50 py-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-white shadow-[0_12px_28px_-10px_rgba(99,102,241,0.9)]">
              <LayoutDashboard className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-bold tracking-tight text-indigo-950 dark:text-white">
              {APP_CONFIG.APP_NAME}
            </h4>
            <p className="mt-1 font-mono text-xs text-indigo-950/50 dark:text-indigo-100/50">
              v{APP_CONFIG.APP_VERSION} &nbsp;·&nbsp; Build {APP_CONFIG.APP_BUILD}
            </p>
            <p className="mt-2 px-5 text-xs leading-relaxed text-indigo-950/55 dark:text-indigo-100/55">
              {APP_CONFIG.APP_DESCRIPTION}
            </p>
          </div>

          {/* Metadata */}
          <div className="divide-y divide-white/50 overflow-hidden rounded-2xl border border-white/55 bg-white/50 text-xs dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-indigo-950/50 dark:text-indigo-100/50">Autor</span>
              <span className="font-semibold text-indigo-950 dark:text-white">
                {APP_CONFIG.APP_AUTHOR}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-indigo-950/50 dark:text-indigo-100/50">Rok</span>
              <span className="font-semibold text-indigo-950 dark:text-white">
                {APP_CONFIG.APP_YEAR}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-indigo-950/50 dark:text-indigo-100/50">Ostatnia wersja</span>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(onOpenChangelog, 150);
                }}
                className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
              >
                <Tag className="h-3 w-3" />
                v{latestRelease.version} ({latestRelease.date})
              </button>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-950/40 dark:text-indigo-100/45">
              Stack technologiczny
            </p>
            <div className="space-y-2">
              {TECH_STACK.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/55 bg-white/50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/18 to-violet-500/10 text-violet-600 dark:text-violet-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-indigo-950/85 dark:text-indigo-50/90">
                      {label}
                    </span>
                    <span className="ml-2 text-xs text-indigo-950/45 dark:text-indigo-100/45">
                      {desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-2">
            <a
              href={APP_CONFIG.APP_AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/55 bg-white/50 py-2 text-xs font-semibold text-indigo-950/65 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-indigo-100/70 dark:hover:bg-white/[0.08]"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://matikgal.github.io/portfolio/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/55 bg-white/50 py-2 text-xs font-semibold text-indigo-950/65 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-indigo-100/70 dark:hover:bg-white/[0.08]"
            >
              <Globe className="h-3.5 w-3.5" />
              Kontakt
            </a>
            <button
              onClick={() => {
                onClose();
                setTimeout(onOpenChangelog, 150);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-bold text-white shadow-[0_10px_22px_-12px_rgba(99,102,241,0.9)] transition-transform hover:-translate-y-0.5"
            >
              <Tag className="h-3.5 w-3.5" />
              Changelog
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/45 px-6 pb-4 pt-3 text-center dark:border-white/10">
          <p className="text-[10px] text-indigo-950/40 dark:text-indigo-100/40">
            Wszelkie prawa zastrzeżone &copy; {APP_CONFIG.APP_YEAR} {APP_CONFIG.APP_AUTHOR}
          </p>
        </div>
      </div>
    </div>
  );
};
