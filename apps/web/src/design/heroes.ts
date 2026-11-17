import type { HeroId } from '@questeo/shared';

/** Couleur de fond de carte par héros (d'après les planches). */
export const HERO_COLORS: Record<HeroId, string> = {
  nassim: 'var(--info)',
  tao: 'var(--success)',
  lina: 'var(--danger)',
  ayla: 'var(--accent)',
  pixel: 'var(--primary)',
};
