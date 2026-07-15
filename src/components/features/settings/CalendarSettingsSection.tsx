import React from 'react';
import { CalendarCheck, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../../utils';
import { SettingsSection } from './SettingsSection';

interface CalendarSettingsSectionProps {
  viewMode: 'week' | 'month';
  setViewMode: (mode: 'week' | 'month') => void;
  showWeekends: boolean;
  setShowWeekends: (show: boolean) => void;
  isViewSelectOpen: boolean;
  setIsViewSelectOpen: (open: boolean) => void;
}

export const CalendarSettingsSection: React.FC<CalendarSettingsSectionProps> = ({
  viewMode,
  setViewMode,
  showWeekends,
  setShowWeekends,
  isViewSelectOpen,
  setIsViewSelectOpen,
}) => (
  <SettingsSection title="Kalendarz" subtitle="Opcje wyświetlania grafiku" icon={CalendarCheck} accent="#0284c7">
    <div className="space-y-3">
      <div className="settings-row">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Domyślny widok</p>
          <p className="settings-hint mt-1">Widok otwierany przy starcie grafiku.</p>
        </div>
        <div className="relative w-full sm:w-52">
          <button
            type="button"
            onClick={() => setIsViewSelectOpen(!isViewSelectOpen)}
            className="settings-input flex w-full cursor-pointer items-center justify-between gap-2 text-left"
          >
            <span className="text-sm font-medium">{viewMode === 'week' ? 'Tydzień' : 'Miesiąc'}</span>
            <ChevronDown className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          </button>
          {isViewSelectOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Zamknij listę"
                onClick={() => setIsViewSelectOpen(false)}
              />
              <div className="absolute top-full right-0 z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-indigo-950/10 bg-white/90 shadow-[0_16px_32px_-16px_rgba(49,46,129,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-[#14121f]/90">
                {[
                  { value: 'week' as const, label: 'Widok tygodniowy' },
                  { value: 'month' as const, label: 'Widok miesięczny' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setViewMode(opt.value);
                      setIsViewSelectOpen(false);
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-white/5',
                      viewMode === opt.value && 'bg-indigo-50 dark:bg-white/5',
                    )}
                  >
                    {opt.label}
                    {viewMode === opt.value && <Check className="h-4 w-4 text-indigo-600" strokeWidth={2} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowWeekends(!showWeekends)}
        className="settings-row w-full cursor-pointer text-left transition-colors hover:bg-white"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">Pokazuj weekendy</p>
            {!showWeekends && (
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                Ukryte
              </span>
            )}
          </div>
          <p className="settings-hint mt-1">Soboty i niedziele w widoku grafiku.</p>
        </div>
        <div
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300',
            showWeekends ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-indigo-950/15',
          )}
          aria-hidden
        >
          <div
            className={cn(
              'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300',
              showWeekends ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
            )}
          />
        </div>
      </button>
    </div>
  </SettingsSection>
);
