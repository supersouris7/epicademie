import { z } from 'zod';
import { LevelSchema, ResponseSchema } from './play.ts';

/** Objets à usage unique, gagnés à l'entraînement et utilisés pendant un combat de boss. */
export const ITEMS = ['bouclier', 'soin', 'indice'] as const;
export type ItemId = (typeof ITEMS)[number];
export type Inventory = Record<ItemId, number>;

export const ITEM_INFO: Record<ItemId, { readonly name: string; readonly effect: string; readonly earn: string }> = {
  bouclier: { name: 'Bouclier', effect: 'Bloque la prochaine riposte', earn: 'Dans les coffres de l’entraînement' },
  soin: { name: 'Soin', effect: 'Rend 1 cœur', earn: 'Dans les coffres de l’entraînement' },
  indice: {
    name: 'Indice',
    effect: 'Affiche l’indice de la question',
    earn: 'Dans les coffres, ou avec des pièces',
  },
};

/** Coffre d'équipement gagné au hasard en fin de série d'entraînement. */
export type ChestRarity = 'commun' | 'rare' | 'epique';
export interface Chest {
  readonly rarity: ChestRarity;
  readonly items: Partial<Inventory>;
  readonly coins: number;
}

/** Stock maximal par objet, emplacements d'équipement (objets utilisables par combat), prix de l'indice. */
export const MAX_ITEM_STOCK = 9;
export const MAX_ITEMS_PER_BATTLE = 3;
export const HINT_PRICE = 20;

export const ItemIdSchema = z.enum(ITEMS);

/** Les 7 questions : 4 mobs, puis le boss à 3 vies (2 problèmes en contexte, 1 piège). */
export const BATTLE_MOBS = 4;
export const BOSS_LIVES = 3;
export const HERO_HEARTS = 3;

export type BattleStage = 'mob' | 'probleme' | 'piege';
export type BattleStatus = 'fighting' | 'won' | 'lost';

export interface BattleQuestion {
  readonly skillId: string;
  readonly level: 1 | 2 | 3;
  readonly seed: number;
  readonly stage: BattleStage;
}

/** Ce que voit le joueur (l'état complet vit sur le serveur). */
export interface BattleView {
  readonly id: string;
  readonly chapterId: string;
  readonly status: BattleStatus;
  readonly hearts: number;
  readonly maxHearts: number;
  readonly bossLives: number;
  readonly mobsDefeated: number;
  /** Rang de la question en cours (0 = 1er mob), sert aussi à choisir le mob affiché. */
  readonly turn: number;
  readonly shield: boolean;
  readonly hintShown: boolean;
  readonly itemsUsed: number;
  /** Objets équipés encore disponibles dans ce combat (3 emplacements au plus). */
  readonly equipped: readonly ItemId[];
  readonly question: BattleQuestion | null;
  readonly inventory: Inventory;
}

/** Médaille d'une victoire contre un boss : selon les cœurs restants, diamant à 3 cœurs sans objet. */
export const BOSS_MEDALS = ['bronze', 'argent', 'or', 'diamant'] as const;
export type BossMedal = (typeof BOSS_MEDALS)[number];
export const BOSS_MEDAL_LABELS: Record<BossMedal, string> = {
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
  diamant: 'Diamant',
};

export function bossMedal(hearts: number, maxHearts: number, itemsUsed: number): BossMedal | null {
  if (hearts <= 0) return null;
  if (hearts >= maxHearts) return itemsUsed === 0 ? 'diamant' : 'or';
  return hearts >= maxHearts - 1 ? 'argent' : 'bronze';
}

/** La meilleure de deux médailles (null = aucune). */
export function bestMedal(a: BossMedal | null, b: BossMedal | null): BossMedal | null {
  if (!a) return b;
  if (!b) return a;
  return BOSS_MEDALS.indexOf(a) >= BOSS_MEDALS.indexOf(b) ? a : b;
}

/** Ce qui se passe à l'écran après une réponse. */
export type BattleOutcome =
  /** Bonne réponse : tir, l'adversaire est touché (mob vaincu ou boss −1 vie). */
  | 'hit'
  /** Erreur contre un mob : riposte (−1 cœur), puis le mob s'enfuit. */
  | 'riposte'
  /** Erreur, mais le bouclier absorbe la riposte. */
  | 'blocked';

export interface BattleAnswerResult {
  readonly correct: boolean;
  readonly invalid: boolean;
  readonly outcome: BattleOutcome | null;
  readonly battle: BattleView;
}

export interface BattleSummary {
  readonly won: boolean;
  readonly firstWin: boolean;
  readonly xpGained: number;
  readonly coinsGained: number;
  readonly hearts: number;
  /** Médaille de ce combat (null si défaite) et si elle bat le record du boss. */
  readonly medal: BossMedal | null;
  readonly newBest: boolean;
  /** Objets du coffre (1re victoire). */
  readonly items: Partial<Inventory>;
  /** Notion la plus ratée : l'écran de défaite propose de s'y entraîner. */
  readonly weakSkill: string | null;
  readonly levelBefore: number;
  readonly levelAfter: number;
}

/** Progression des boss d'un profil. */
export interface BossRecord {
  readonly chapterId: string;
  readonly wins: number;
  readonly bestHearts: number;
  readonly bestMedal: BossMedal;
  readonly firstWonAt: string;
}

export interface BossOverview {
  readonly records: readonly BossRecord[];
  /** Tout ce que le joueur possède ; la réserve = inventaire − objets équipés. */
  readonly inventory: Inventory;
  /** Objets équipés pour les combats (3 emplacements au plus, types mélangés). */
  readonly equipped: readonly ItemId[];
}

/** Équipement choisi avant un combat : jusqu'à 3 objets pris dans la réserve. */
export const EquipmentSchema = z.object({ items: z.array(ItemIdSchema).max(MAX_ITEMS_PER_BATTLE) });
export type Equipment = z.infer<typeof EquipmentSchema>;

/** Garde les objets équipés que l'inventaire couvre encore (3 au plus). */
export function sanitizeEquipped(items: readonly ItemId[], inventory: Inventory): ItemId[] {
  const left: Inventory = { ...inventory };
  const out: ItemId[] = [];
  for (const item of items) {
    if (out.length >= MAX_ITEMS_PER_BATTLE || left[item] <= 0) continue;
    left[item]--;
    out.push(item);
  }
  return out;
}

export const BattleCreateSchema = z.object({
  profileId: z.uuid(),
  chapterId: z.string().min(1).max(80),
});
export type BattleCreate = z.infer<typeof BattleCreateSchema>;

export const BattleAnswerSchema = z.object({
  /** Question répondue (refusée si ce n'est plus la question en cours). */
  skillId: z.string().min(1).max(80),
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  response: ResponseSchema,
  durationMs: z.number().int().nonnegative().max(3_600_000),
});
export type BattleAnswer = z.infer<typeof BattleAnswerSchema>;

export const BattleItemSchema = z.object({ item: ItemIdSchema });

export const BuySchema = z.object({ profileId: z.uuid(), item: z.literal('indice') });
