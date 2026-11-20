import { ITEMS, type Chest, type ChestRarity, type Inventory } from '@questeo/shared';

/**
 * Coffres d'équipement de l'entraînement (docs/SPEC.md §6.2 bis) : un coffre GARANTI à chaque
 * série terminée (décision du 20/11/2026) ; un sans-faute améliore la rareté. Le coffre est
 * commun, rare ou épique et contient des objets tirés au hasard et des pièces. Jamais achetable.
 */

/** Commun : pièces ; rare : équipement ; épique : équipement et rubis. */
export const CHEST_CONTENT: Record<
  ChestRarity,
  { readonly items: number; readonly coins: number; readonly rubies: number }
> = {
  commun: { items: 0, coins: 25, rubies: 0 },
  rare: { items: 1, coins: 10, rubies: 0 },
  epique: { items: 2, coins: 40, rubies: 1 },
};

/** Rareté : 60 % commun, 30 % rare, 10 % épique ; un sans-faute améliore la rareté. */
export function rollRarity(random: number, perfect: boolean): ChestRarity {
  const r = perfect ? random * 0.85 + 0.15 : random;
  if (r >= 0.9) return 'epique';
  if (r >= 0.6) return 'rare';
  return 'commun';
}

/** Tire le coffre de fin de série. `random` renvoie un nombre dans [0, 1). */
export function rollChest(correct: number, total: number, random: () => number): Chest {
  const rarity = rollRarity(random(), correct === total && total > 0);
  const { items: count, coins, rubies } = CHEST_CONTENT[rarity];
  const items: Partial<Inventory> = {};
  for (let i = 0; i < count; i++) {
    const item = ITEMS[Math.floor(random() * ITEMS.length)] ?? 'indice';
    items[item] = (items[item] ?? 0) + 1;
  }
  return { rarity, items, coins, rubies };
}
