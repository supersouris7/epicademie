import {
  BOSS_MEDALS,
  CHEST_RARITIES,
  ITEMS,
  type BossMedal,
  type Chest,
  type ChestRarity,
  type Inventory,
} from '@epicademie/shared';
import { ECONOMY } from './economy.ts';

/**
 * Coffres d'équipement (docs/SPEC.md §6.2 bis). Décision du 21/11/2026 :
 * - entraînement : un coffre seulement quand toute la série est juste (au 2e essai compris) ;
 *   un sans-faute du premier coup améliore le tirage ;
 * - boss : un coffre à chaque victoire, de la rareté de la médaille (bronze → commun … diamant →
 *   légendaire), avec une chance de monter d'un cran.
 * Le coffre contient des objets tirés au hasard, des pièces et parfois des rubis. Jamais achetable. Paramètres : `ECONOMY.chest` (economy.ts).
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

/** Remplit un coffre de la rareté donnée. `random` renvoie un nombre dans [0, 1). */
export function fillChest(rarity: ChestRarity, random: () => number): Chest {
  const { items: count, coins, rubies } = CHEST_CONTENT[rarity];
  const items: Partial<Inventory> = {};
  for (let i = 0; i < count; i++) {
    const item = ITEMS[Math.floor(random() * ITEMS.length)] ?? 'indice';
    items[item] = (items[item] ?? 0) + 1;
  }
  // Plus d'Acad-Héros dans les coffres (21/11/2026) : les héros se choisissent librement.
  return { rarity, items, coins, rubies, hero: null };
}

/** Série d'entraînement : `solved` questions trouvées (1er ou 2e essai), dont `firstTry` du premier coup. */
export interface SeriesResult {
  readonly total: number;
  readonly solved: number;
  readonly firstTry: number;
}

/** Coffre de fin de série : seulement si toute la série est juste (sinon null). */
export function trainingChest(series: SeriesResult, random: () => number): Chest | null {
  if (series.total === 0 || series.solved < series.total) return null;
  return fillChest(rollRarity(random(), series.firstTry === series.total), random);
}

/** Coffre de victoire contre un boss, selon la médaille. */
export function bossChest(medal: BossMedal, random: () => number): Chest {
  return fillChest(bossRarity(medal, random()), random);
}

/**
 * Défis (décision du 21/11/2026) : un coffre dès un score minimum, meilleur avec le score.
 * Contre-la-montre : 8 / 15 / 22 / 30 bonnes réponses ; Survie : 5 / 10 / 15 / 20.
 */
export const DEFI_CHEST_STEPS = {
  chrono: [8, 15, 22, 30],
  survie: [5, 10, 15, 20],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type DefiKind = keyof typeof DEFI_CHEST_STEPS;

/** Rareté du coffre d'un défi selon le nombre de bonnes réponses (null sous le minimum). */
export function defiRarity(kind: DefiKind, correct: number): ChestRarity | null {
  const reached = DEFI_CHEST_STEPS[kind].filter((step) => correct >= step).length;
  return reached === 0 ? null : (CHEST_RARITIES[reached - 1] ?? 'commun');
}

/** Coffre de fin de défi (null sous le score minimum). */
export function defiChest(kind: DefiKind, correct: number, random: () => number): Chest | null {
  const rarity = defiRarity(kind, correct);
  return rarity ? fillChest(rarity, random) : null;
}

/** Bonus d'XP de fin de défi : 2 par bonne réponse, au plus 60. */
export const defiBonusXp = (correct: number) => Math.min(60, 2 * correct);
