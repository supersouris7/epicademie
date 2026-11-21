import type { AvatarConfig } from '@questeo/shared';

/** Image d'un portrait de profil (« 01 » à « 25 »). */
const avatarSrc = (avatar: Pick<AvatarConfig, 'seed'>) => `/assets/avatars/${avatar.seed}.webp`;

interface AvatarProps {
  readonly avatar: AvatarConfig;
  readonly size?: number;
  readonly className?: string;
  readonly label?: string;
}

/** Avatar d'un profil : un des 25 portraits dessinés (déjà ronds, avec leur contour). */
export function Avatar({ avatar, size = 96, className = '', label = '' }: AvatarProps) {
  return (
    <img
      src={avatarSrc(avatar)}
      alt={label}
      role={label ? 'img' : 'presentation'}
      width={size}
      height={size}
      draggable={false}
      decoding="async"
      className={`shrink-0 rounded-full object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
