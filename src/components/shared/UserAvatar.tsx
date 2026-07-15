import { cn } from '../../utils';
import { getProfileAvatar, getProfileAvatarUri } from '../../config/profileAvatars';

type UserAvatarProps = {
  avatarId?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizePx: Record<NonNullable<UserAvatarProps['size']>, number> = {
  sm: 28,
  md: 40,
  lg: 80,
  xl: 96,
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarId,
  name,
  size = 'md',
  className = '',
}) => {
  const avatar = getProfileAvatar(avatarId);
  const px = sizePx[size];

  return (
    <span
      className={cn('user-avatar overflow-hidden rounded-full', className)}
      style={{ width: px, height: px }}
    >
      <img
        src={getProfileAvatarUri(avatar.id)}
        alt={name ? `Awatar: ${name}` : `Awatar ${avatar.label}`}
        width={px}
        height={px}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  );
};
