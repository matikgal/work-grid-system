import React from 'react';
import { Save, User } from 'lucide-react';
import { cn } from '../../../utils';
import { PROFILE_AVATARS, type ProfileAvatarId } from '../../../config/profileAvatars';
import { UserAvatar } from '../../shared/UserAvatar';
import { SettingsSection } from './SettingsSection';

interface ProfileSectionProps {
  localUserName: string;
  userName: string;
  userAvatarId: ProfileAvatarId;
  setLocalUserName: (name: string) => void;
  onSelectAvatar: (id: ProfileAvatarId) => void;
  isSavingProfile: boolean;
  onSaveProfile: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  localUserName,
  userName,
  userAvatarId,
  setLocalUserName,
  onSelectAvatar,
  isSavingProfile,
  onSaveProfile,
}) => (
  <SettingsSection title="Twój profil" subtitle="Dane personalne" icon={User} accent="#6366f1">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <UserAvatar avatarId={userAvatarId} name={localUserName || userName} size="lg" />
        <p className="settings-hint text-center sm:text-left">Twój awatar w menu</p>
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <p className="settings-label mb-2.5">Wybierz awatar</p>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {PROFILE_AVATARS.map((avatar) => {
              const active = userAvatarId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => onSelectAvatar(avatar.id)}
                  className={cn(
                    'group flex cursor-pointer items-center justify-center rounded-2xl border-2 p-1.5 transition-all duration-200',
                    active
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-[0_8px_20px_-12px_rgba(99,102,241,0.7)]'
                      : 'border-transparent hover:-translate-y-0.5 hover:bg-indigo-50/40',
                  )}
                  aria-label={`Awatar: ${avatar.label}`}
                  aria-pressed={active}
                >
                  <span
                    className={cn(
                      'rounded-full transition-transform duration-200 group-hover:scale-105',
                      active && 'ring-2 ring-indigo-400 ring-offset-2',
                    )}
                  >
                    <UserAvatar avatarId={avatar.id} name={avatar.label} size="md" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="display-name" className="settings-label">
            Nazwa wyświetlana
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="display-name"
              type="text"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              placeholder="Wpisz swoje imię..."
              className="settings-input min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={onSaveProfile}
              disabled={isSavingProfile || localUserName === userName}
              className="settings-btn settings-btn--primary flex items-center justify-center gap-2 sm:w-auto"
            >
              <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
              {isSavingProfile ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
          <p className="settings-hint">To imię pojawia się na pulpicie i w górnym pasku aplikacji.</p>
        </div>
      </div>
    </div>
  </SettingsSection>
);
