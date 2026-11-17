import { ITEMS, type Chest, type ChestRarity, type Inventory } from '@questeo/shared';

/**
 * Coffres d'équipement de l'entraînement (docs/SPEC.md §6.2 bis) : en fin de série, une chance de coffre
 * d'autant plus grande que le score est bon (sans-faute = coffre garanti). Le coffre est commun, rare ou
 * épique et contient des objets tirés au hasard et des pièces. Jamais achetable.
 */

/** Chance d'obtenir un coffre selon la part de bonnes réponses de la série. */
export function chestChance(correct: number, total: number): number {
  if (total <= 0) return 0;
  const rate = correct / total;
  if (rate >= 1) return 1;
  if (rate >= 0.8) return 0.6;
  if (rate >= 0.6) return 0.35;
  return 0.1;
}

/** Contenu par rareté : nombre d'objets et pièces. */
export const CHEST_CONTENT: Record<ChestRarity, { readonly items: number; readonly coins: number }> = {
  commun: { items: 1, coins: 10 },
  rare: { items: 2, coins: 20 },
  epique: { items: 3, coins: 40 },
};

/** Rareté : 60 % commun, 30 % rare, 10 % épique ; un sans-faute améliore la rareté. */
export function rollRarity(random: number, perfect: boolean): ChestRarity {
  const r = perfect ? random * 0.85 + 0.15 : random;
  if (r >= 0.9) return 'epique';
  if (r >= 0.6) return 'rare';
  return 'commun';
}

/** Tire un coffre (ou rien). `random` renvoie un nombre dans [0, 1). */
export function rollChest(correct: number, total: number, random: () => number): Chest | null {
  if (random() >= chestChance(correct, total)) return null;
  const rarity = rollRarity(random(), correct === total && total > 0);
  const { items: count, coins } = CHEST_CONTENT[rarity];
  const items: Partial<Inventory> = {};
  for (let i = 0; i < count; i++) {
    const item = ITEMS[Math.floor(random() * ITEMS.length)] ?? 'indice';
    items[item] = (items[item] ?? 0) + 1;
  }
  return { rarity, items, coins };
}
