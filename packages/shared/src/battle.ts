import { z } from 'zod';
import { LevelSchema, ResponseSchema } from './play.ts';

/** Objets à usage unique, gagnés à l'entraînement et utilisés pendant un combat de boss. */
export const ITEMS = ['bouclier', 'soin', 'indice'] as const;
export type ItemId = (typeof ITEMS)[number];
export type Inventory = Record<ItemId, number>;

export const ITEM_INFO: Record<ItemId, { readonly name: string; readonly effect: string; readonly earn: string }> = {
  bouclier: {
    name: 'Bouclier',
    effect: 'Bloque la prochaine riposte',
    earn: 'Gagné par un sans-faute à l’entraînement',
  },
  soin: { name: 'Soin', effect: 'Rend 1 cœur', earn: 'Gagné quand une notion est acquise' },
  indice: { name: 'Indice', effect: 'Affiche l’indice de la question', earn: 'S’achète avec des pièces' },
};

/** Stock maximal par objet, objets utilisables par combat, prix de l'indice. */
export const MAX_ITEM_STOCK = 9;
export const MAX_ITEMS_PER_BATTLE = 3;
export const HINT_PRICE = 20;

export const ItemIdSchema = z.enum(ITEMS);

/** Les 10 questions : 7 mobs, puis le boss à 3 vies (2 problèmes en contexte, 1 piège). */
export const BATTLE_MOBS = 7;
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
  readonly question: BattleQuestion | null;
  readonly inventory: Inventory;
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
  readonly firstWonAt: string;
}

export interface BossOverview {
  readonly records: readonly BossRecord[];
  readonly inventory: Inventory;
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
