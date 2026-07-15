import React from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils';
import { APP_CONFIG } from '../../config/app';
import { UserAvatar } from '../shared/UserAvatar';
import type { ProfileAvatarId } from '../../config/profileAvatars';

type AppHeaderProps = {
  headerRef: React.RefObject<HTMLElement | null>;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onProfileClick: () => void;
  pageTitle?: string | null;
  userName?: string;
  userEmail?: string;
  userAvatarId?: ProfileAvatarId;
  headerLeft?: React.ReactNode;
  headerCenter?: React.ReactNode;
  headerRight?: React.ReactNode;
};

export const AppHeader = ({
  headerRef,
  isMenuOpen,
  onToggleMenu,
  onProfileClick,
  pageTitle,
  userName,
  userEmail,
  userAvatarId,
  headerLeft,
  headerCenter,
  headerRight,
}: AppHeaderProps) => {  const displayName = userName || userEmail?.split('@')[0] || '?';
  const showPageTitle = pageTitle !== null && pageTitle !== undefined;
  const title = showPageTitle ? pageTitle || APP_CONFIG.APP_HEADER_TITLE : null;

  return (
    <header
      ref={headerRef}
      className="app-header shrink-0 border-b border-white/50 bg-white/65 shadow-[0_6px_28px_-18px_rgba(49,46,129,0.5)] backdrop-blur-xl print:hidden"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 py-2 sm:px-3 lg:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleMenu}
            className="app-header__menu-btn shrink-0 cursor-pointer"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu modułów'}
          >
            <span className={cn('app-header__menu-icon', isMenuOpen && 'app-header__menu-icon--open')}>
              <Menu className="app-header__menu-icon-lines" strokeWidth={2} aria-hidden />
              <X className="app-header__menu-icon-close" strokeWidth={2} aria-hidden />
            </span>
          </button>

          {title && (
            <div className="app-header__title min-w-0 border-l border-indigo-950/10 pl-2 sm:pl-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">Moduł</p>
              <h1 className="truncate text-sm font-bold uppercase tracking-tight sm:text-base">{title}</h1>
            </div>
          )}

          {headerLeft && (
            <div className="hidden min-w-0 flex-1 items-center border-l border-indigo-950/10 pl-2 2xl:flex 2xl:pl-3">
              {headerLeft}
            </div>
          )}
        </div>

        {headerCenter && (
          <div className="order-3 flex w-full min-w-0 basis-full items-center justify-center border-t border-dashed border-indigo-950/10 pt-2 2xl:order-none 2xl:w-auto 2xl:flex-1 2xl:basis-auto 2xl:border-t-0 2xl:pt-0">
            {headerCenter}
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {headerRight && (
            <div className="flex items-center gap-2 border-r border-indigo-950/10 pr-2 sm:pr-3">{headerRight}</div>
          )}

          <button
            type="button"
            onClick={onProfileClick}
            className="app-header__user cursor-pointer"
            aria-label="Przejdź do ustawień profilu"
          >
            <span className="app-header__user-name max-w-[6.5rem] truncate sm:max-w-[11rem]">
              {displayName}
            </span>
            <UserAvatar avatarId={userAvatarId} name={displayName} size="md" className="app-header__user-avatar" />
          </button>        </div>
      </div>

      {headerLeft && (
        <div className="border-t border-dashed border-indigo-950/10 px-2 py-2 2xl:hidden sm:px-3">{headerLeft}</div>
      )}
    </header>
  );
};
