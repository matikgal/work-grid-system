import { resolveEmployeeAvatar } from '@/utils';
import { cn } from '@/lib/utils';

type EmployeeAvatarProps = {
  name: string;
  colorClass?: string;
  /** Stabilne ziarno koloru (np. ID pracownika) — ten sam kolor wszędzie. */
  seed?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: 'h-7 w-7 text-[10px]',
  default: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
} as const;

export function EmployeeAvatar({ name, colorClass, seed, className, size = 'default' }: EmployeeAvatarProps) {
  const resolved = resolveEmployeeAvatar(colorClass, name, seed);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl font-medium ring-1 ring-white/60',
        sizeClasses[size],
        resolved.className,
        className,
      )}
      style={resolved.style}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
