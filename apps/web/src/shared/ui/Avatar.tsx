import type { AvatarConfig } from '@questeo/shared';
import { useAvatarUri } from '../lib/avatar.ts';

interface AvatarProps {
  readonly avatar: AvatarConfig;
  readonly size?: number;
  readonly className?: string;
  readonly label?: string;
}

export function Avatar({ avatar, size = 96, className = '', label = '' }: AvatarProps) {
  const uri = useAvatarUri(avatar);
  return (
    <div
      className={`cartoon bg-surface-2 shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, borderRadius: '9999px' }}
      role="img"
      aria-label={label}
    >
      {uri && <img src={uri} alt="" className="h-full w-full" draggable={false} />}
    </div>
  );
}
