import React from 'react';
import { Upload, Users } from 'lucide-react';
import { parseEmployeeImportFile } from '../../../lib/employeeImport';
import { SettingsSection } from './SettingsSection';

interface EmployeeImportSectionProps {
  onImport: (file: File) => Promise<{ imported: number; skipped: number }>;
}

export const EmployeeImportSection: React.FC<EmployeeImportSectionProps> = ({ onImport }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsImporting(true);
    setLastResult(null);
    try {
      const text = await file.text();
      const preview = parseEmployeeImportFile(text, file.name);
      if (preview.length === 0) {
        setLastResult('Plik nie zawiera pracowników do importu.');
        return;
      }
      const result = await onImport(file);
      setLastResult(`Zaimportowano ${result.imported} pracowników (pominięto: ${result.skipped}).`);
    } catch {
      setLastResult('Import nie powiódł się. Sprawdź format pliku CSV lub JSON.');
    } finally {
      setIsImporting(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <SettingsSection title="Import pracowników" subtitle="CSV lub JSON z kopii zapasowej" icon={Users} accent="#7c3aed">
      <p className="settings-hint leading-relaxed">
        CSV: <strong>Imię i nazwisko;Rola;Telefon</strong> (separator <code>;</code> lub <code>,</code>).
        JSON: sekcja <code>data.employees</code> z kopii zapasowej.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <button
        type="button"
        disabled={isImporting}
        onClick={() => inputRef.current?.click()}
        className="settings-btn settings-btn--primary mt-4 flex items-center gap-2"
      >
        <Upload className="h-4 w-4" strokeWidth={2} aria-hidden />
        {isImporting ? 'Importowanie...' : 'Wybierz plik CSV / JSON'}
      </button>

      {lastResult && (
        <p className="mt-3 rounded-xl border border-indigo-950/10 bg-white/55 px-3 py-2.5 text-xs font-medium text-indigo-950/70 dark:border-white/10 dark:bg-white/[0.04] dark:text-indigo-100/70">
          {lastResult}
        </p>
      )}
    </SettingsSection>
  );
};
