import type { HeroId } from '@questeo/shared';

/** Couleur de fond de carte par héros (d'après les planches). */
export const HERO_COLORS: Record<HeroId, string> = {
  alex: 'var(--info)',
  tao: 'var(--success)',
  lina: 'var(--pink)',
  ayla: 'var(--accent)',
  pixel: 'var(--af-gray-700)',
};
