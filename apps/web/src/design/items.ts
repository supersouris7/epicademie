import type { ChestRarity } from '@epicademie/shared';

/** Icônes des objets de combat. */
export const ITEM_ICONS = {
  bouclier: 'icons-items-bouclier',
  soin: 'icons-items-soin',
  indice: 'icons-navigation-hint',
} as const;

/** Image d'un coffre selon sa rareté, fermé ou ouvert. */
export const chestIcon = (rarity: ChestRarity, open = false) => `rewards-chests-${rarity}${open ? '-ouvert' : ''}`;
