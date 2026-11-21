import {
  AVAILABLE_HEROES,
  BOSS_MEDALS,
  CHEST_RARITIES,
  ITEMS,
  type BossMedal,
  type Chest,
  type ChestRarity,
  type HeroId,
  type Inventory,
} from '@questeo/shared';
import { ECONOMY } from './economy.ts';

/**
 * Coffres d'équipement (docs/SPEC.md §6.2 bis). Décision du 21/11/2026 :
 * - entraînement : un coffre seulement quand toute la série est juste (au 2e essai compris) ;
 *   un sans-faute du premier coup améliore le tirage ;
 * - boss : un coffre à chaque victoire, de la rareté de la médaille (bronze → commun … diamant →
 *   légendaire), avec une chance de monter d'un cran.
 * Le coffre contient des objets tirés au hasard, des pièces, parfois des rubis et parfois un
 * Acad-Héros. Jamais achetable. Paramètres : `ECONOMY.chest` (economy.ts).
 */

/** Pièces, objets et rubis selon la rareté. */
export const CHEST_CONTENT = ECONOMY.chest.content;

/** Rareté d'un coffre d'entraînement ; un sans-faute du premier coup améliore le tirage. */
export function rollRarity(random: number, perfect: boolean): ChestRarity {
  const { perfectBoost, legendaryFrom, epicFrom, rareFrom } = ECONOMY.chest;
  const r = perfect ? random * (1 - perfectBoost) + perfectBoost : random;
  if (r >= legendaryFrom) return 'legendaire';
  if (r >= epicFrom) return 'epique';
  if (r >= rareFrom) return 'rare';
  return 'commun';
}

/** Rareté d'un coffre de boss : celle de la médaille, parfois un cran au-dessus. */
export function bossRarity(medal: BossMedal, random: number): ChestRarity {
  const base = BOSS_MEDALS.indexOf(medal);
  const up = random < ECONOMY.chest.bossUpgradeChance ? 1 : 0;
  return CHEST_RARITIES[Math.min(CHEST_RARITIES.length - 1, base + up)] ?? 'commun';
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

/** Remplit un coffre de la rareté donnée. `random` renvoie un nombre dans [0, 1). */
export function fillChest(rarity: ChestRarity, random: () => number, owned: ReadonlySet<HeroId> = new Set()): Chest {
  const { items: count, coins, rubies } = CHEST_CONTENT[rarity];
  const items: Partial<Inventory> = {};
  for (let i = 0; i < count; i++) {
    const item = ITEMS[Math.floor(random() * ITEMS.length)] ?? 'indice';
    items[item] = (items[item] ?? 0) + 1;
  }
  const hero = rollHero(rarity, owned, random);
  return { rarity, items, coins: coins + (hero?.duplicate ? ECONOMY.chest.duplicateHeroCoins : 0), rubies, hero };
}

/** Série d'entraînement : `solved` questions trouvées (1er ou 2e essai), dont `firstTry` du premier coup. */
export interface SeriesResult {
  readonly total: number;
  readonly solved: number;
  readonly firstTry: number;
}

/** Coffre de fin de série : seulement si toute la série est juste (sinon null). */
export function trainingChest(
  series: SeriesResult,
  random: () => number,
  owned: ReadonlySet<HeroId> = new Set(),
): Chest | null {
  if (series.total === 0 || series.solved < series.total) return null;
  return fillChest(rollRarity(random(), series.firstTry === series.total), random, owned);
}

/** Coffre de victoire contre un boss, selon la médaille. */
export function bossChest(medal: BossMedal, random: () => number, owned: ReadonlySet<HeroId> = new Set()): Chest {
  return fillChest(bossRarity(medal, random()), random, owned);
}
