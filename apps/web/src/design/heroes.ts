import type { HeroId } from '@questeo/shared';

/** Couleur de fond de carte par héros (d'après les planches). */
export const HERO_COLORS: Record<HeroId, string> = {
  alex: 'var(--primary)',
  zoe: 'var(--pink)',
  leo: 'var(--info)',
  mia: 'var(--subject-maths)',
};
