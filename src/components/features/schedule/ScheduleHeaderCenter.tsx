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
  zoomLevel,
}) => {
  return (
    <div
      className="schedule-header-shifts no-scrollbar"
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
    >
      {SHIFT_TEMPLATES.map((template, index) => {
        const style = getShiftStyle(template.label);
        const isActive = activeTemplate?.id === template.id;

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(isActive ? null : template)}
            className={cn(
              'schedule-header-shift-btn group px-2.5 py-1.5',
              style.bg,
              style.border,
              style.text,
              isActive
                ? 'schedule-header-shift-btn--active'
                : 'border-opacity-50 opacity-90 hover:border-opacity-100 hover:opacity-100',
            )}
          >
            <span className="schedule-header-shift-kbd">{index + 1}</span>
            <span className="whitespace-nowrap">{template.displayLabel || template.label}</span>
          </button>
        );
      })}
    </div>
  );
};
