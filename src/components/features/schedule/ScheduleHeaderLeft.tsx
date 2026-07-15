import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getWeekOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ViewMode } from '../../../types';

interface ScheduleHeaderLeftProps {
  currentDate: Date;
  viewMode: ViewMode;
  zoomLevel: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const ScheduleHeaderLeft: React.FC<ScheduleHeaderLeftProps> = ({
  currentDate,
  viewMode,
  zoomLevel,
  onPrev,
  onNext,
  onToday,
}) => {
  return (
    <div
      className="schedule-header-left"
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'left center' }}
    >
      <button type="button" onClick={onPrev} aria-label="Wstecz" className="schedule-header-nav-btn">
        <ChevronLeft className="schedule-header-nav-btn__icon" strokeWidth={2} />
      </button>

      <div
        className="schedule-header-date group/today"
        onClick={onToday}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToday();
          }
        }}
        role="button"
        tabIndex={0}
        title="Powrót do dzisiaj"
      >
        <div className="schedule-header-date__inner">
          <p className="schedule-header-date__title">
            {viewMode === 'week' ? (
              <>
                {format(currentDate, 'LLLL', { locale: pl })}{' '}
                <span className="schedule-header-date__week">
                  Tydz. {getWeekOfMonth(currentDate, { weekStartsOn: 1 })}
                </span>
              </>
            ) : (
              format(currentDate, 'LLLL yyyy', { locale: pl })
            )}
          </p>
          <p className="schedule-header-date__range">
            {viewMode === 'week'
              ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: pl })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: pl })}`
              : `${format(startOfMonth(currentDate), 'd', { locale: pl })} - ${format(endOfMonth(currentDate), 'd MMM', { locale: pl })}`}
          </p>
        </div>
      </div>

      <button type="button" onClick={onNext} aria-label="Dalej" className="schedule-header-nav-btn">
        <ChevronRight className="schedule-header-nav-btn__icon" strokeWidth={2} />
      </button>
    </div>
  );
};
