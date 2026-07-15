import React from 'react';
import { Palette, Sun, Moon, Lock } from 'lucide-react';
import { cn } from '../../../utils';
import { SettingsSection } from './SettingsSection';

interface AppearanceSectionProps {
  isCompactMode: boolean;
  setIsCompactMode: (isCompact: boolean) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  isCompactMode,
  setIsCompactMode,
}) => (
  <SettingsSection title="Wygląd" subtitle="Motyw i gęstość interfejsu" icon={Palette} accent="#7c3aed">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="settings-label">Motyw</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="settings-chip settings-chip--active flex flex-col items-center gap-2 py-3">
            <Sun className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            <span>Jasny</span>
          </div>
          <div
            className="settings-chip flex cursor-not-allowed flex-col items-center gap-2 py-3 opacity-50"
            aria-disabled="true"
            title="Tryb ciemny jest tymczasowo niedostępny"
          >
            <span className="relative">
              <Moon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              <Lock className="absolute -bottom-1 -right-1.5 h-3 w-3" strokeWidth={2.5} aria-hidden />
            </span>
            <span>Ciemny</span>
          </div>
        </div>
        <p className="settings-hint">
          Tryb ciemny jest tymczasowo wyłączony — pracujemy nad dopracowaniem kontrastu i czytelności.
          Aplikacja działa w jasnym motywie.
        </p>
      </div>

      <div className="space-y-3">
        <p className="settings-label">Gęstość interfejsu</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-indigo-950/10 bg-white/40 p-1">
          {[
            { id: 'comfortable', label: 'Standardowa', compact: false },
            { id: 'compact', label: 'Kompaktowa', compact: true },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setIsCompactMode(opt.compact)}
              className={cn(
                'settings-chip cursor-pointer py-2.5 transition-colors duration-200',
                isCompactMode === opt.compact && 'settings-chip--active',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="settings-hint">Tryb kompaktowy zmniejsza odstępy w tabelach grafiku.</p>
      </div>
    </div>
  </SettingsSection>
);
