import type { BadgeCategory, BadgeTier } from '@questeo/shared';
import { BADGE_CATEGORIES, BADGE_TIERS } from '@questeo/shared';
import { versioned } from './assets.ts';

/** Une médaille par badge et par rang : `rewards/badges/<badge>-<rang>.webp` (planche du 21/11/2026). */
export const BADGE_IMAGES: readonly {
  readonly category: BadgeCategory;
  readonly tier: BadgeTier;
  readonly file: string;
}[] = BADGE_CATEGORIES.flatMap((category) =>
  BADGE_TIERS.map((tier) => ({ category, tier, file: `rewards/badges/${category}-${tier}.webp` })),
);

/** URL (versionnée pour le cache navigateur) de l'image d'un badge à un rang donné. */
export const badgeSrc = (category: BadgeCategory, tier: BadgeTier): string =>
  versioned(`/assets/rewards/badges/${category}-${tier}.webp`);
