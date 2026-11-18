import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { HERO_NAMES, type HeroId } from '@questeo/shared';
import { HERO_COLORS } from '../../design/heroes.ts';
import { assetSrc, deliveredSrc } from '../../design/assets.ts';
import { skinStyle } from '../../design/skin.ts';
import { useEntrance } from '../../lib/entrance.ts';

interface CharacterCardProps {
  readonly name: string;
  /** Illustration (portrait, avatar…). */
  readonly portrait: ReactNode;
  readonly color: string;
  readonly caption?: ReactNode;
  readonly selected?: boolean;
  readonly onClick?: () => void;
  /** Rôle radio (choix du héros) au lieu de bouton simple. */
  readonly radio?: boolean;
  readonly index?: number;
  readonly className?: string;
}

/** Carte de collection : fond coloré, illustration, bandeau de nom en bas. */
export function CharacterCard({
  name,
  portrait,
  color,
  caption,
  selected,
  onClick,
  radio,
  index = 0,
  className = '',
}: CharacterCardProps) {
  const enter = useEntrance();
  const skin = skinStyle('hud/frames/hero-card.webp', 22, '0.9rem');
  return (
    <motion.button
      type="button"
      onClick={onClick}
      role={radio ? 'radio' : undefined}
      aria-checked={radio ? Boolean(selected) : undefined}
      initial={enter ? { y: 24, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 220, damping: 16 }}
      whileTap={{ scale: 0.96 }}
      className={`cartoon relative flex w-full flex-col items-center overflow-hidden text-left ${selected ? 'ring-gold ring-4 ring-offset-2' : ''} ${className}`}
      style={{
        background: `linear-gradient(160deg, ${color}, color-mix(in srgb, ${color} 60%, var(--outline)))`,
        ...skin,
      }}
    >
      <span className="flex w-full flex-1 items-end justify-center px-3 pt-3">{portrait}</span>
      <span className="bg-accent-strong font-display text-toon w-full truncate px-2 py-1.5 text-center text-xl tracking-wide">
        {name}
      </span>
      {caption && (
        <span className="bg-accent-strong text-on-color w-full pb-2 text-center text-sm font-bold">{caption}</span>
      )}
    </motion.button>
  );
}

/** Héros en entier (pose d'attente), sinon portrait, sinon silhouette provisoire. */
export function HeroPortrait({ hero, size = 120 }: { readonly hero: HeroId; readonly size?: number }) {
  const src = deliveredSrc(`characters-${hero}-pose-idle`) ?? assetSrc(`characters-${hero}-portrait`);
  return src ? (
    <img
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      decoding="async"
      className="object-contain"
      style={{ width: size, height: size }}
    />
  ) : null;
}

/** Carte d'un héros jouable. */
export function HeroCard({
  hero,
  ...rest
}: Omit<CharacterCardProps, 'name' | 'portrait' | 'color'> & { readonly hero: HeroId; readonly size?: number }) {
  return (
    <CharacterCard
      name={HERO_NAMES[hero]}
      portrait={<HeroPortrait hero={hero} />}
      color={HERO_COLORS[hero]}
      {...rest}
    />
  );
}
