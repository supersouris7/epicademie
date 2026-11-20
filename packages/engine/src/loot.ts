import { AVAILABLE_HEROES, ITEMS, type Chest, type ChestRarity, type HeroId, type Inventory } from '@questeo/shared';
import { ECONOMY } from './economy.ts';

/**
 * Coffres d'équipement de l'entraînement (docs/SPEC.md §6.2 bis) : un coffre GARANTI à chaque
 * série terminée (décision du 20/11/2026) ; un sans-faute améliore la rareté. Le coffre est
 * commun, rare ou épique et contient des objets tirés au hasard, des pièces, parfois un rubis
 * et parfois un Acad-Héros (seule façon d'en obtenir, décision du 20/11/2026). Jamais achetable.
 * Paramètres : `ECONOMY.chest` (economy.ts).
 */

/** Commun : pièces ; rare : équipement ; épique : équipement et rubis. */
export const CHEST_CONTENT = ECONOMY.chest.content;

/** Rareté ; un sans-faute améliore le tirage. */
export function rollRarity(random: number, perfect: boolean): ChestRarity {
  const { perfectBoost, epicFrom, rareFrom } = ECONOMY.chest;
  const r = perfect ? random * (1 - perfectBoost) + perfectBoost : random;
  if (r >= epicFrom) return 'epique';
  if (r >= rareFrom) return 'rare';
  return 'commun';
}

/**
 * Acad-Héros éventuel du coffre : tiré parmi les héros disponibles que le joueur n'a pas ; s'il
 * les a tous, le héros tiré est un doublon converti en pièces.
 */
function rollHero(rarity: ChestRarity, owned: ReadonlySet<HeroId>, random: () => number): Chest['hero'] {
  if (random() >= ECONOMY.chest.heroChance[rarity]) return null;
  const missing = AVAILABLE_HEROES.filter((h) => !owned.has(h));
  const pool = missing.length > 0 ? missing : AVAILABLE_HEROES;
  const id = pool[Math.floor(random() * pool.length)] ?? AVAILABLE_HEROES[0] ?? 'alex';
  return { id, duplicate: missing.length === 0 };
}

/** Tire le coffre de fin de série. `random` renvoie un nombre dans [0, 1). */
export function rollChest(
  correct: number,
  total: number,
  random: () => number,
  owned: ReadonlySet<HeroId> = new Set(),
): Chest {
  const rarity = rollRarity(random(), correct === total && total > 0);
  const { items: count, coins, rubies } = CHEST_CONTENT[rarity];
  const items: Partial<Inventory> = {};
  for (let i = 0; i < count; i++) {
    const item = ITEMS[Math.floor(random() * ITEMS.length)] ?? 'indice';
    items[item] = (items[item] ?? 0) + 1;
  }
  const hero = rollHero(rarity, owned, random);
  return { rarity, items, coins: coins + (hero?.duplicate ? ECONOMY.chest.duplicateHeroCoins : 0), rubies, hero };
}
