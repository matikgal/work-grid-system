import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DashboardModuleId, MODULE_ACCENTS, MODULE_ICONS } from './dashboardModules';

type DashboardModuleTileProps = {
  title: string;
  shortLabel?: string;
  description?: string;
  moduleId: DashboardModuleId;
  onClick: () => void;
  featured?: boolean;
  className?: string;
};

export const DashboardModuleTile = ({
  title,
  shortLabel,
  description,
  moduleId,
  onClick,
  featured = false,
  className = '',
}: DashboardModuleTileProps) => {
  const accent = MODULE_ACCENTS[moduleId];
  const Icon = MODULE_ICONS[moduleId];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ '--tile-accent': accent } as React.CSSProperties}
      className={`app-tile dashboard-tile group flex min-h-0 w-full cursor-pointer flex-col justify-between overflow-hidden border-2 border-black bg-white p-3 text-left sm:p-4 ${
        featured ? 'dashboard-tile--featured' : ''
      } ${className}`}
    >
      <Icon
        className={`dashboard-tile__watermark ${featured ? 'dashboard-tile__watermark--featured' : ''}`}
        strokeWidth={1.25}
        aria-hidden
      />

      <div className="dashboard-tile__content flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <span
            className="dashboard-tile__icon flex shrink-0 items-center justify-center border-2 border-black bg-[#faf9f7] p-1.5 sm:p-2"
            style={{ boxShadow: `3px 3px 0 ${accent}33` }}
          >
            <Icon
              className={featured ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-4 w-4 sm:h-5 sm:w-5'}
              style={{ color: accent }}
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
          <ArrowRight
            className="dashboard-tile__arrow h-3.5 w-3.5 shrink-0 text-black/30 sm:h-4 sm:w-4"
            strokeWidth={2}
            aria-hidden
          />
        </div>

        <div className="mt-auto pt-2 sm:pt-3">
          {shortLabel && (
            <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 sm:text-[10px]">{shortLabel}</p>
          )}
          <h3
            className={`font-bold uppercase leading-tight tracking-wide ${
              featured ? 'text-lg sm:text-2xl lg:text-3xl' : 'text-xs sm:text-sm lg:text-base'
            }`}
          >
            {title}
          </h3>
          {description && (
            <p
              className={`mt-1 line-clamp-2 leading-snug text-black/55 group-hover:text-black/70 ${
                featured ? 'text-[11px] sm:text-xs lg:text-sm' : 'text-[10px] sm:text-[11px]'
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};
