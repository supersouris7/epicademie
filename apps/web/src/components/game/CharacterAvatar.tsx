import type { AvatarConfig } from '@questeo/shared';
import { assetSrc } from '../../design/assets.ts';
import { Avatar } from '../Avatar.tsx';
import { GameIcon } from './GameIcon.tsx';

interface CharacterAvatarProps {
  readonly avatar: AvatarConfig;
  readonly size?: number;
  /** Niveau affiché dans un badge hexagonal (absent = pas de badge). */
  readonly level?: number;
  readonly label?: string;
}

/** Avatar de compte dans l'anneau de jeu (image « avatar-ring » une fois livrée, sinon anneau CSS violet et orange). */
export function CharacterAvatar({ avatar, size = 88, level, label = '' }: CharacterAvatarProps) {
  const ring = assetSrc('hud-frames-avatar-ring');
  const ringIsFinal = ring?.endsWith('.webp');
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      {/* L'anneau illustré est épais (trou ≈ 55 % de sa largeur) : il déborde un peu du cadre
          et l'avatar remplit exactement le trou, pour ne pas couper la tête. */}
      <div
        className={`bg-surface-2 absolute overflow-hidden rounded-full ${ringIsFinal ? 'inset-[16%]' : 'inset-[9%]'}`}
      >
        <Avatar
          avatar={avatar}
          size={Math.round(size * (ringIsFinal ? 0.68 : 0.82))}
          className="!border-0 !shadow-none"
        />
      </div>
      {ringIsFinal && ring ? (
        <img
          src={ring}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-[-9%] h-[118%] w-[118%] max-w-none"
        />
      ) : (
        <div
          aria-hidden
          className="border-accent pointer-events-none absolute inset-0 rounded-full border-[6px] shadow-[0_0_0_3px_var(--outline),inset_0_0_0_3px_var(--outline),var(--drop-sm)]"
        >
          {[
            'top-[-9px] left-1/2 -translate-x-1/2',
            'bottom-[-9px] left-1/2 -translate-x-1/2',
            'left-[-9px] top-1/2 -translate-y-1/2',
            'right-[-9px] top-1/2 -translate-y-1/2',
          ].map((p) => (
            <span key={p} className={`bg-primary border-outline absolute h-3 w-3 rounded-sm border-2 ${p}`} />
          ))}
        </div>
      )}
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
