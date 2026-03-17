import React from "react";
import {
  FileText,
  Calendar,
  Clock,
  RotateCcw,
  MessageSquare,
  Menu,
  LogOut,
  Info,
  Tag,
  FileText as TermsIcon,
} from "lucide-react";
import { cn } from "../../utils";
import { APP_CONFIG } from "../../config/app";

interface MenuItem {
  label: string;
  sub: string;
  active?: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  action: () => void;
}

interface SidebarMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  menuItems: MenuItem[];
  onLogout: () => void;
  onShowAbout: () => void;
  onShowTerms: () => void;
  onShowChangelog: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  menuItems,
  onLogout,
  onShowAbout,
  onShowTerms,
  onShowChangelog,
}) => {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 bg-zinc-900/10 backdrop-blur-[1px] transition-opacity duration-300",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-out flex flex-col border-r border-slate-100 dark:border-slate-800",
          isMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mt-6 px-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Nawigacja
          </h2>
        </div>

        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  if (item.action) item.action();
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm flex items-center gap-3",
                  item.active
                    ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                  item.disabled &&
                    "opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent text-slate-400 dark:text-slate-600",
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4",
                    item.active
                      ? "text-emerald-600 dark:text-emerald-400"
                      : item.disabled
                        ? "text-slate-400 dark:text-slate-600"
                        : "text-slate-400 dark:text-slate-300",
                  )}
                />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100/80 hover:shadow-md border border-rose-100 rounded-xl transition-all font-semibold text-sm backdrop-blur-sm shadow-sm dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/20 dark:hover:bg-rose-900/20"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj się
          </button>

          <div className="flex justify-center items-center gap-3 mt-4 px-2 flex-wrap">
            <button
              onClick={() => {
                onShowAbout();
                setIsMenuOpen(false);
              }}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              O aplikacji
            </button>
            <span className="text-slate-300 dark:text-slate-600 text-[10px] select-none">
              •
            </span>
            <button
              onClick={() => {
                onShowChangelog();
                setIsMenuOpen(false);
              }}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Co nowego
            </button>
            <span className="text-slate-300 dark:text-slate-600 text-[10px] select-none">
              •
            </span>
            <button
              onClick={() => {
                onShowTerms();
                setIsMenuOpen(false);
              }}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Regulamin
            </button>
          </div>

          {/* <div className="mt-6 mb-2 text-center flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Wersja {APP_CONFIG.APP_VERSION}
                    </span>
                </div> */}
        </div>
      </div>
    </>
  );
};
