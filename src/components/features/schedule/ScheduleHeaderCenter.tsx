import React from 'react';
import { SHIFT_TEMPLATES } from '../../../constants';
import { ShiftTemplate } from '../../../types';
import { cn, getShiftStyle } from '../../../utils';

interface ScheduleHeaderCenterProps {
  activeTemplate: ShiftTemplate | null;
  onSelectTemplate: (template: ShiftTemplate | null) => void;
  zoomLevel: number;
}

export const ScheduleHeaderCenter: React.FC<ScheduleHeaderCenterProps> = ({
  activeTemplate,
  onSelectTemplate,
  zoomLevel
}) => {
  return (
    <div className="flex flex-nowrap items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm" style={{ zoom: zoomLevel } as any}>
      {SHIFT_TEMPLATES.map((template, index) => {
        const style = getShiftStyle(template.label);
        return (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(activeTemplate?.id === template.id ? null : template)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all active:scale-95 text-center min-w-[85px] relative group",
              style.bg, 
              activeTemplate?.id === template.id ? "border-slate-950 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/40 shadow-md scale-105 z-10" : cn(style.border, "border-opacity-50 shadow-sm opacity-90 hover:opacity-100 hover:border-opacity-100"),
              style.text
            )}
          >
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white shadow-sm">
              {index + 1}
            </span>
            <span className="whitespace-nowrap">{template.label}</span>
          </button>
        );
      })}
    </div>
  );
};
