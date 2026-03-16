import React, { useState } from 'react';
import { Loader2, Maximize2, Minimize2, MoreHorizontal, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '../../../utils';
import { ViewMode } from '../../../types';

interface ScheduleHeaderRightProps {
  workingDaysCount: number;
  onWorkingDaysChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  isCompactMode: boolean;
  onCompactModeToggle: () => void;
  isPrinting: boolean;
  onPrint: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ScheduleHeaderRight: React.FC<ScheduleHeaderRightProps> = ({
  workingDaysCount,
  onWorkingDaysChange,
  zoomLevel,
  onZoomChange,
  isCompactMode,
  onCompactModeToggle,
  isPrinting,
  onPrint,
  viewMode,
  onViewModeChange
}) => {
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-2" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'right center' }}>
      {/* Desktop Tools (2xl+) */}
      <div className="hidden 2xl:flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1.5 shadow-sm h-[34px]">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Dni robocze:</span>
          <input 
            type="number" 
            value={workingDaysCount || ''} 
            onChange={onWorkingDaysChange}
            className="w-8 text-center bg-transparent border-b border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs focus:outline-none focus:border-brand-500 p-0"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">dni</span>
        </div>
        
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-1 shadow-sm h-[34px]">
          <button 
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))} 
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors active:scale-95"
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-8 text-center tabular-nums">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button 
            onClick={() => onZoomChange(Math.min(1.5, zoomLevel + 0.1))} 
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors active:scale-95"
            disabled={zoomLevel >= 1.5}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button 
          onClick={onCompactModeToggle}
          className={cn(
            "p-2 rounded-lg transition-all border active:scale-95", 
            isCompactMode ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600"
          )}
          title={isCompactMode ? "Pełny widok" : "Kompaktowo"}
        >
          {isCompactMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        <button 
          onClick={onPrint}
          disabled={isPrinting}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all active:scale-95 shadow-sm disabled:opacity-50"
          title="Drukuj grafik miesiąca"
        >
          {isPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Printer className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Tablet/Laptop Mini Menu (< 2xl) */}
      <div className="2xl:hidden relative">
        <button 
          onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
          className={cn("p-2 rounded-lg border transition-all active:scale-95", toolsMenuOpen ? "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-white" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        
        {toolsMenuOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setToolsMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-[70] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
              {/* Working Days */}
              <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-slate-500">Dni robocze</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number" 
                    value={workingDaysCount || ''} 
                    onChange={onWorkingDaysChange}
                    className="w-8 text-center bg-transparent border-b border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs focus:outline-none p-0"
                  />
                </div>
              </div>

              {/* Zoom */}
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Powiększenie</span>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                  <button onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))} disabled={zoomLevel <= 0.5} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm disabled:opacity-50"><ZoomOut className="w-3 h-3"/></button>
                  <span className="text-[10px] font-bold w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={() => onZoomChange(Math.min(1.5, zoomLevel + 0.1))} disabled={zoomLevel >= 1.5} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm disabled:opacity-50"><ZoomIn className="w-3 h-3"/></button>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

              {/* Actions */}
              <button onClick={onCompactModeToggle} className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                {isCompactMode ? <Maximize2 className="w-3.5 h-3.5 text-emerald-600" /> : <Minimize2 className="w-3.5 h-3.5" />}
                {isCompactMode ? "Pełny widok" : "Tryb kompaktowy"}
              </button>

              <button onClick={onPrint} className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                {isPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Printer className="w-3.5 h-3.5" />}
                Drukuj grafik
              </button>
            </div>
          </>
        )}
      </div>

      <div className="hidden sm:flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
        <button onClick={() => onViewModeChange('week')} className={cn("px-2.5 py-1.5 rounded-md transition-all", viewMode === 'week' ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")}>Tydzień</button>
        <button onClick={() => onViewModeChange('month')} className={cn("px-2.5 py-1.5 rounded-md transition-all", viewMode === 'month' ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")}>Miesiąc</button>
      </div>
    </div>
  );
};
