import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { HERO_NAMES, type HeroId } from '@questeo/shared';
import { HERO_COLORS } from '../../design/heroes.ts';
import { assetSrc, deliveredSrc } from '../../design/assets.ts';
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

/**
 * Carte de collection, dessinée en CSS (nette à toutes les tailles) : fond dégradé à la couleur du
 * personnage, halo derrière l'illustration, reflet en haut, plaque de nom en bas.
 * Sélectionnée : anneau doré, lueur et coche.
 */
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
      className={`relative flex w-full flex-col items-center overflow-hidden rounded-[22px] border-[3px] border-[var(--outline)] text-left shadow-[inset_0_2px_0_rgb(255_255_255/0.35),0_5px_0_var(--outline),0_12px_22px_rgb(0_0_0/0.35)] transition-shadow ${selected ? 'outline-gold outline-4 outline-offset-2 shadow-[inset_0_2px_0_rgb(255_255_255/0.35),0_5px_0_var(--outline),0_0_28px_color-mix(in_srgb,var(--gold)_70%,transparent)]' : ''} ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 42%, color-mix(in srgb, white 32%, ${color}) 0%, ${color} 45%, color-mix(in srgb, ${color} 55%, var(--outline)) 100%)`,
      }}
    >
      {/* Reflet en haut de la carte. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent"
      />
      {selected && (
        <span
          aria-hidden
          className="bg-gold text-on-light font-display absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--outline)] text-base"
        >
          ✓
        </span>
      )}
      <span className="relative flex w-full flex-1 items-end justify-center px-3 pt-3">{portrait}</span>
      <span className="relative w-full border-t-[3px] border-[var(--outline)] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)] px-2 py-1.5 text-center">
        <span className="font-display text-toon block truncate text-xl tracking-wide">{name}</span>
        {caption && <span className="text-on-color block text-sm font-bold">{caption}</span>}
      </span>
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
