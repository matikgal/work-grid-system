import React from 'react';
import { LayoutGrid, LogOut } from 'lucide-react';
import { cn } from '../../utils';
import { APP_CONFIG } from '../../config/app';

export interface AppNavItem {
  label: string;
  sub: string;
  active?: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  action: () => void;
  group?: string;
  accent?: string;
}

interface SidebarMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  menuItems: AppNavItem[];
  headerOffset: number;
  onLogout: () => void;
  onShowAbout: () => void;
  onShowTerms: () => void;
  onShowChangelog: () => void;
}

const DEFAULT_GROUP = 'Inne';

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  menuItems,
  headerOffset,
  onLogout,
  onShowAbout,
  onShowTerms,
  onShowChangelog,
}) => {
  const groups = menuItems.reduce<Record<string, AppNavItem[]>>((acc, item) => {
    const key = item.group || DEFAULT_GROUP;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const groupOrder = ['Start', 'Zespół', 'Sklep', 'System', DEFAULT_GROUP];

  return (
    <>
      <div
        className={cn(
          'app-nav-overlay fixed inset-x-0 bottom-0 z-40 bg-indigo-950/25 backdrop-blur-[2px] transition-opacity duration-300',
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{ top: headerOffset }}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />

      <aside
        className={cn(
          'fixed bottom-0 left-0 z-50 flex w-[min(20rem,calc(100vw-1rem))] flex-col overflow-hidden border-r border-white/60 bg-white/70 text-indigo-950 shadow-[12px_0_48px_-16px_rgba(49,46,129,0.5)] backdrop-blur-2xl transition-transform duration-300 ease-out sm:w-80 dark:border-white/10 dark:bg-[#14121f]/85 dark:text-indigo-50',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ top: headerOffset }}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen ? true : undefined}
      >
        {/* Aurora za szkłem — daje głębię i kolor */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -left-12 -top-10 h-52 w-52 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -right-10 top-1/3 h-56 w-56 rounded-full bg-violet-400/25 blur-3xl" />
          <div className="absolute -bottom-12 left-1/4 h-52 w-52 rounded-full bg-sky-400/25 blur-3xl" />
        </div>

        <div className="shrink-0 border-b border-white/40 bg-white/30 px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-white shadow-[0_8px_18px_-8px_rgba(99,102,241,0.9)]">
              <LayoutGrid className="size-[18px]" strokeWidth={2.25} aria-hidden />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                Nawigacja
              </p>
              <h2 className="text-lg font-semibold leading-tight tracking-tight">Panel modułów</h2>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-indigo-950/50 dark:text-indigo-100/55">
            Wybierz sekcję aplikacji
          </p>
        </div>

        <nav className="dash-scroll min-h-0 flex-1 overflow-y-auto px-2.5 py-3 sm:px-3" aria-label="Menu główne">
          {groupOrder.map((groupName) => {
            const items = groups[groupName];
            if (!items?.length) return null;

            return (
              <section key={groupName} className="mb-4 last:mb-2">
                <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-950/40 dark:text-indigo-100/45">
                  {groupName}
                </p>
                <ul className="space-y-1.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const accent = item.accent || '#6366f1';

                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          disabled={item.disabled}
                          onClick={() => {
                            if (item.disabled) return;
                            item.action();
                            setIsMenuOpen(false);
                          }}
                          style={{
                            borderLeft: item.active ? `3px solid ${accent}` : undefined,
                          }}
                          className={cn(
                            'group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/55 bg-white/55 p-2.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_26px_-16px_rgba(49,46,129,0.55)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]',
                            item.active && 'bg-white shadow-[0_12px_26px_-16px_rgba(49,46,129,0.5)] dark:bg-white/[0.08]',
                            item.disabled && 'cursor-not-allowed opacity-45 hover:translate-y-0 hover:shadow-sm',
                          )}
                        >
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                            style={{
                              background: `color-mix(in srgb, ${accent} 14%, #fff)`,
                              color: accent,
                              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 22%, transparent)`,
                            }}
                          >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-tight tracking-tight">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-indigo-950/50 group-hover:text-indigo-950/65 dark:text-indigo-100/50">
                              {item.sub}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-indigo-950/10 bg-white/40 p-3 sm:p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <button
            type="button"
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-rose-300/50 bg-rose-50/70 px-4 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-100/80 hover:shadow-[0_12px_26px_-16px_rgba(244,63,94,0.6)] dark:border-rose-400/20 dark:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
            Wyloguj się
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] text-indigo-950/45 dark:text-indigo-100/50">
            <button
              type="button"
              onClick={() => {
                onShowAbout();
                setIsMenuOpen(false);
              }}
              className="cursor-pointer transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              O aplikacji
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => {
                onShowChangelog();
                setIsMenuOpen(false);
              }}
              className="cursor-pointer transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              Co nowego
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => {
                onShowTerms();
                setIsMenuOpen(false);
              }}
              className="cursor-pointer transition-colors duration-200 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              Regulamin
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] font-medium tracking-wide text-indigo-950/40 dark:text-indigo-100/40">
            v{APP_CONFIG.APP_VERSION}
          </p>
        </div>
      </aside>
    </>
  );
};
