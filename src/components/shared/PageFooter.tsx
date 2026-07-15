import React from 'react';
import { Github, Heart } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';
import { cn } from '../../utils';

type PageFooterProps = {
  className?: string;
};

/** Wspólna stopka w stylu „aurora glass" — link do GitHuba + wersja. */
export const PageFooter: React.FC<PageFooterProps> = ({ className = '' }) => (
  <footer
    className={cn(
      'relative z-10 shrink-0 border-t border-white/50 bg-white/55 backdrop-blur-xl print:hidden dark:border-white/10 dark:bg-[#14121f]/70',
      className,
    )}
  >
    <div className="flex w-full items-center justify-between gap-4 px-3 py-2.5 sm:px-4">
      <a
        href={APP_CONFIG.APP_AUTHOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 text-sm font-medium text-indigo-950/65 transition-colors hover:text-indigo-600 dark:text-indigo-100/65 dark:hover:text-indigo-300"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-white/60 text-indigo-600 shadow-sm transition-transform group-hover:-translate-y-0.5 dark:bg-white/10">
          <Github className="size-4" aria-hidden />
        </span>
        matikgal
      </a>

      <span className="inline-flex items-center gap-1.5 text-xs text-indigo-950/45 dark:text-indigo-100/50">
        <Heart className="size-3 fill-rose-400/70 text-rose-400" aria-hidden />
        <span className="tnum font-medium">v{APP_CONFIG.APP_VERSION}</span>
      </span>
    </div>
  </footer>
);
