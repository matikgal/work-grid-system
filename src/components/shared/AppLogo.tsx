import React from 'react';
import { APP_CONFIG, publicAssetUrl } from '@/config/app';
import { cn } from '@/utils';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className,
}) => (
  <div className={cn('flex items-center gap-2.5', className)}>
    <img
      src={publicAssetUrl(APP_CONFIG.LOGO_PATH)}
      alt={APP_CONFIG.APP_HEADER_TITLE}
      className={cn('rounded-xl shadow-sm object-cover', sizeMap[size])}
    />
    {showText && (
      <div className="leading-tight">
        <span className="font-bold tracking-tight text-slate-900 dark:text-white">
          {APP_CONFIG.APP_HEADER_TITLE}
        </span>
      </div>
    )}
  </div>
);
