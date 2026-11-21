import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { HERO_NAMES, type HeroId } from '@questeo/shared';
import { CharacterSprite } from './CharacterSprite.tsx';
import { useEntrance } from '../../lib/entrance.ts';

interface CharacterCardProps {
  readonly name: string;
  /** Illustration (portrait, avatar…). */
  readonly portrait: ReactNode;
  readonly caption?: ReactNode;
  readonly selected?: boolean;
  readonly onClick?: () => void;
  /** Rôle radio (choix du héros) au lieu de bouton simple. */
  readonly radio?: boolean;
  readonly index?: number;
  readonly className?: string;
  /** Illustration centrée dans la carte (avatar) ; sinon posée en bas (personnage en pied). */
  readonly centered?: boolean;
}

/**
 * Carte de collection, dessinée en CSS (nette à toutes les tailles) : fond gris neutre,
 * reflet en haut et plaque de nom en bas.
 */
export function CharacterCard({
  name,
  portrait,
  caption,
  selected,
  onClick,
  radio,
  index = 0,
  className = '',
  centered = false,
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
      className={`relative flex w-full flex-col items-center overflow-hidden rounded-[22px] border-4 border-[var(--outline)] bg-clip-padding text-left shadow-[inset_0_3px_0_rgb(255_255_255/0.4),0_6px_0_var(--outline),0_14px_26px_rgb(0_0_0/0.4)] transition-shadow ${className}`}
      style={{
        background:
          'radial-gradient(circle at 50% 42%, var(--af-gray-300), var(--af-gray-500) 55%, var(--af-gray-700))',
      }}
    >
      {/* Reflet en haut de la carte. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent"
      />
      <span
        className={`relative flex w-full flex-1 justify-center px-3 ${centered ? 'items-center py-2' : 'items-end pt-3'}`}
      >
        {portrait}
      </span>
      <span className="relative w-full border-t-[3px] border-[var(--outline)] bg-gradient-to-b from-[var(--af-gray-500)] to-[var(--af-gray-700)] px-2 py-1.5 text-center">
        <span className="font-display text-toon block truncate text-xl tracking-wide">{name}</span>
        {caption && <span className="text-on-color block text-sm font-bold">{caption}</span>}
      </span>
    </motion.button>
  );
}

/** Héros en entier, dans son animation sur place (bande de 8 images). */
export function HeroPortrait({ hero, size = 120 }: { readonly hero: HeroId; readonly size?: number }) {
  return <CharacterSprite hero={hero} state="idle" height={size} />;
}

/** Carte d'un héros jouable. */
export function HeroCard({
  hero,
  ...rest
}: Omit<CharacterCardProps, 'name' | 'portrait'> & { readonly hero: HeroId; readonly size?: number }) {
  return <CharacterCard name={HERO_NAMES[hero]} portrait={<HeroPortrait hero={hero} />} {...rest} />;
}
