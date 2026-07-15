import React from 'react';
import { Database, Download, Table2 } from 'lucide-react';
import { cn } from '../../../utils';
import { SettingsSection } from './SettingsSection';

interface DataExportSectionProps {
  isBackingUp: boolean;
  onBackup: () => void;
  onExportEmployees?: () => void;
  isExportingEmployees?: boolean;
}

export const DataExportSection: React.FC<DataExportSectionProps> = ({
  isBackingUp,
  onBackup,
  onExportEmployees,
  isExportingEmployees,
}) => (
  <SettingsSection title="Dane i eksport" subtitle="Kopie zapasowe i pliki" icon={Database} accent="#d97706">
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="settings-action-card opacity-60">
        <span className="settings-action-card__icon">
          <Download className="h-5 w-5 text-[#059669]" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Eksport do PDF</p>
          <p className="settings-hint mt-1">Użyj przycisku Drukuj w module grafiku.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExportEmployees}
        disabled={!onExportEmployees || isExportingEmployees}
        className={cn(
          'settings-action-card cursor-pointer text-left transition-colors duration-200 hover:bg-white dark:hover:bg-white/[0.07]',
          (!onExportEmployees || isExportingEmployees) && 'cursor-wait opacity-70',
        )}
      >
        <span className="settings-action-card__icon">
          <Table2 className="h-5 w-5 text-[#0284c7]" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {isExportingEmployees ? 'Eksportowanie...' : 'Pracownicy → Excel'}
          </p>
          <p className="settings-hint mt-1">Plik .xlsx z listą kadry.</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onBackup}
        disabled={isBackingUp}
        className={cn(
          'settings-action-card cursor-pointer text-left transition-colors duration-200 hover:bg-white dark:hover:bg-white/[0.07] md:col-span-2',
          isBackingUp && 'cursor-wait opacity-70',
        )}
      >
        <span className="settings-action-card__icon">
          <Database className="h-5 w-5 text-[#d97706]" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {isBackingUp ? 'Pobieranie danych...' : 'Pełna kopia zapasowa (JSON)'}
          </p>
          <p className="settings-hint mt-1">
            Zrzut pracowników, grafików, zamówień i urlopów. Zalecane regularne pobieranie.
          </p>
        </div>
      </button>
    </div>
  </SettingsSection>
);
