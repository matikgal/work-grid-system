import React from 'react';
import { X, LayoutDashboard, Github, Globe, Cpu, Database, Code2, Tag } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';
import { CHANGELOG } from '../../data/changelog';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChangelog: () => void;
}

const TECH_STACK = [
  { icon: Code2,    label: 'React 18 + TypeScript',  desc: 'Warstwa UI' },
  { icon: Database, label: 'Supabase (PostgreSQL)',   desc: 'Backend & Auth' },
  { icon: Cpu,      label: 'TanStack Query',          desc: 'Zarządzanie stanem serwera' },
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-0 animate-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 id="about-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">O aplikacji</h3>
          <button
            onClick={onClose}
            aria-label="Zamknij"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5 text-sm text-slate-600 dark:text-slate-400">

          {/* App identity */}
          <div className="text-center py-4 border-y border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <LayoutDashboard className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{APP_CONFIG.APP_NAME}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
              v{APP_CONFIG.APP_VERSION} &nbsp;·&nbsp; Build {APP_CONFIG.APP_BUILD}
            </p>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-xs leading-relaxed px-4">
              {APP_CONFIG.APP_DESCRIPTION}
            </p>
          </div>

          {/* Metadata */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-slate-500">Autor</span>
              <span className="font-semibold text-slate-900 dark:text-white">{APP_CONFIG.APP_AUTHOR}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-slate-500">Rok</span>
              <span className="font-semibold text-slate-900 dark:text-white">{APP_CONFIG.APP_YEAR}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5">
              <span className="text-slate-500">Ostatnia wersja</span>
              <button
                onClick={() => { onClose(); setTimeout(onOpenChangelog, 150); }}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <Tag className="w-3 h-3" />
                v{latestRelease.version} ({latestRelease.date})
              </button>
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Stack technologiczny</p>
            <div className="space-y-2">
              {TECH_STACK.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-800">
                  <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{label}</span>
                    <span className="text-slate-400 text-xs ml-2">{desc}</span>
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
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <a
              href="https://matikgal.github.io/portfolio/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Kontakt
            </a>
            <button
              onClick={() => { onClose(); setTimeout(onOpenChangelog, 150); }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors text-xs font-bold text-white"
            >
              <Tag className="w-3.5 h-3.5" />
              Changelog
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 pb-4 pt-0 text-center">
          <p className="text-[10px] text-slate-400">
            Wszelkie prawa zastrzeżone &copy; {APP_CONFIG.APP_YEAR} {APP_CONFIG.APP_AUTHOR}
          </p>
        </div>
      </div>
    </div>
  );
};
