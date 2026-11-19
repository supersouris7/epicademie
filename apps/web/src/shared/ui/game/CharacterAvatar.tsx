import type { AvatarConfig } from '@questeo/shared';
import { Avatar } from '../Avatar.tsx';
import { GameIcon } from './GameIcon.tsx';

interface CharacterAvatarProps {
  readonly avatar: AvatarConfig;
  readonly size?: number;
  /** Niveau affiché dans un badge hexagonal (absent = pas de badge). */
  readonly level?: number;
  readonly label?: string;
}

/** Avatar de compte, seul (sans anneau autour : trop lourd visuellement), avec badge de niveau éventuel. */
export function CharacterAvatar({ avatar, size = 88, level, label = '' }: CharacterAvatarProps) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      <Avatar avatar={avatar} size={size} className="!border-0 !shadow-none" />
      {level !== undefined && (
        <span
          className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center"
          aria-label={`Niveau ${level}`}
        >
          <GameIcon id="icons-resources-level" size={40} className="absolute inset-0" />
          <span className="font-display text-toon relative text-base">{level}</span>
        </span>
      )}
    </div>
  );
}
