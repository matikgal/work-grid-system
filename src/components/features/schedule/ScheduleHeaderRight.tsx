import React, { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Printer,
  ZoomIn,
  ZoomOut,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../../../utils';
import { ViewMode } from '../../../types';
import type { SumDisplay } from '../../shared/CalendarGrid';

interface ScheduleHeaderRightProps {
  workingDaysCount: number;
  onWorkingDaysChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wsTarget: number;
  onWsTargetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sumDisplay: SumDisplay;
  onSumDisplayChange: (mode: SumDisplay) => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  isCompactMode: boolean;
  onCompactModeToggle: () => void;
  isPrinting: boolean;
  onPrint: () => void;
  onExportExcel?: () => void;
  isExporting?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const SUM_DISPLAY_OPTIONS: { value: SumDisplay; label: string }[] = [
  { value: 'days', label: 'Dni' },
  { value: 'ws', label: 'WS' },
  { value: 'both', label: 'Oba' },
];

export const ScheduleHeaderRight: React.FC<ScheduleHeaderRightProps> = ({
  workingDaysCount,
  onWorkingDaysChange,
  wsTarget,
  onWsTargetChange,
  sumDisplay,
  onSumDisplayChange,
  zoomLevel,
  onZoomChange,
  isCompactMode,
  onCompactModeToggle,
  isPrinting,
  onPrint,
  onExportExcel,
  isExporting,
  viewMode,
  onViewModeChange,
}) => {
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Zamknij przybornik po kliknięciu poza nim (fixed backdrop nie działał — nadrzędny element ma transform: scale)
  useEffect(() => {
    if (!toolsMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolsMenuOpen(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [toolsMenuOpen]);

  return (
    <div
      className="flex items-center gap-2"
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'right center' }}
    >
      <div className="relative" ref={toolsRef}>
        <button
          type="button"
          onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
          className={cn(
            'schedule-header-tools-btn',
            toolsMenuOpen && 'schedule-header-icon-btn--active',
          )}
          aria-expanded={toolsMenuOpen}
          aria-label="Narzędzia grafiku"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Narzędzia</span>
        </button>

        {toolsMenuOpen && (
          <>
            <div className="schedule-header-menu-panel">
              <div className="schedule-header-menu-row">
                <span className="schedule-header-tool-label">Dni robocze</span>
                <input
                  type="number"
                  value={workingDaysCount || ''}
                  onChange={onWorkingDaysChange}
                  className="schedule-header-tool-input"
                  aria-label="Liczba dni roboczych"
                />
              </div>

              <div className="schedule-header-menu-row">
                <span className="schedule-header-tool-label">WS (limit)</span>
                <input
                  type="number"
                  value={wsTarget || ''}
                  onChange={onWsTargetChange}
                  className="schedule-header-tool-input"
                  aria-label="Limit WS (wolnych sobót)"
                />
              </div>

              <div className="schedule-header-menu-row">
                <span className="text-xs font-semibold">Suma pokazuje</span>
                <div className="schedule-header-view-toggle" role="group" aria-label="Co pokazać w sumie">
                  {SUM_DISPLAY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onSumDisplayChange(opt.value)}
                      className={cn(
                        'schedule-header-view-btn',
                        sumDisplay === opt.value && 'schedule-header-view-btn--active',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="schedule-header-menu-row">
                <span className="text-xs font-semibold">Powiększenie</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
                    disabled={zoomLevel <= 0.5}
                    className="schedule-header-zoom-btn"
                    aria-label="Pomniejsz"
                  >
                    <ZoomOut className="h-3 w-3" strokeWidth={2} />
                  </button>
                  <span className="w-8 text-center text-[10px] font-bold tabular-nums">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onZoomChange(Math.min(1.5, zoomLevel + 0.1))}
                    disabled={zoomLevel >= 1.5}
                    className="schedule-header-zoom-btn"
                    aria-label="Powiększ"
                  >
                    <ZoomIn className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="schedule-header-menu-divider" />

              <button type="button" onClick={onCompactModeToggle} className="schedule-header-menu-item">
                {isCompactMode ? (
                  <Maximize2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
                ) : (
                  <Minimize2 className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {isCompactMode ? 'Pełny widok' : 'Tryb kompaktowy'}
              </button>

              {onExportExcel && (
                <button
                  type="button"
                  onClick={onExportExcel}
                  disabled={isExporting}
                  className="schedule-header-menu-item"
                >
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  Eksport Excel
                </button>
              )}

              <button type="button" onClick={onPrint} className="schedule-header-menu-item">
                {isPrinting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                Drukuj grafik
              </button>
            </div>
          </>
        )}
      </div>

      <div className="schedule-header-view-toggle">
        <button
          type="button"
          onClick={() => onViewModeChange('week')}
          className={cn(
            'schedule-header-view-btn',
            viewMode === 'week' && 'schedule-header-view-btn--active',
          )}
        >
          Tydzień
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('month')}
          className={cn(
            'schedule-header-view-btn',
            viewMode === 'month' && 'schedule-header-view-btn--active',
          )}
        >
          Miesiąc
        </button>
      </div>
    </div>
  );
};
