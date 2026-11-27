import { z } from 'zod';
import { ChestSchema, InventorySchema, ItemIdSchema } from './items.ts';
import { ContentIdSchema, LevelSchema, ResponseSchema } from './play.ts';

/** Contrats du combat de boss : l'état complet vit sur le serveur, le client affiche une vue. */

/** Les 7 questions : 4 mobs, puis le boss à 3 vies (2 problèmes en contexte, 1 piège). */
export const BATTLE_MOBS = 4;
export const BOSS_LIVES = 3;
export const HERO_HEARTS = 3;

export const BATTLE_STAGES = ['mob', 'probleme', 'piege'] as const;
export type BattleStage = (typeof BATTLE_STAGES)[number];
export const BATTLE_STATUSES = ['fighting', 'won', 'lost'] as const;
export type BattleStatus = (typeof BATTLE_STATUSES)[number];

export const BattleQuestionSchema = z.object({
  skillId: z.string(),
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  stage: z.enum(BATTLE_STAGES),
});
export type BattleQuestion = z.infer<typeof BattleQuestionSchema>;

const int = z.number().int().nonnegative();

/** Ce que voit le joueur (l'état complet vit sur le serveur). */
export const BattleViewSchema = z.object({
  id: z.uuid(),
  chapterId: z.string(),
  status: z.enum(BATTLE_STATUSES),
  hearts: int,
  maxHearts: int,
  bossLives: int,
  mobsDefeated: int,
  /** Rang de la question en cours (0 = 1er mob), sert aussi à choisir le mob affiché. */
  turn: int,
  shield: z.boolean(),
  hintShown: z.boolean(),
  /** Indice demandé sans objet : l'attaque de cette question est un peu moins forte. */
  weakAttack: z.boolean(),
  itemsUsed: int,
  /** Objets équipés encore disponibles dans ce combat (3 emplacements au plus). */
  equipped: z.array(ItemIdSchema).readonly(),
  question: BattleQuestionSchema.nullable(),
  inventory: InventorySchema,
});
export type BattleView = z.infer<typeof BattleViewSchema>;

/** Médaille d'une victoire contre un boss : selon les cœurs restants, diamant à 3 cœurs sans aide. */
export const BOSS_MEDALS = ['bronze', 'argent', 'or', 'diamant'] as const;
export type BossMedal = (typeof BOSS_MEDALS)[number];
export const BossMedalSchema = z.enum(BOSS_MEDALS);
export const BOSS_MEDAL_LABELS: Record<BossMedal, string> = {
  bronze: 'Bronze',
  argent: 'Argent',
  or: 'Or',
  diamant: 'Diamant',
};

/** `helps` : objets utilisés et indices demandés. */
export function bossMedal(hearts: number, maxHearts: number, helps: number): BossMedal | null {
  if (hearts <= 0) return null;
  if (hearts >= maxHearts) return helps === 0 ? 'diamant' : 'or';
  return hearts >= maxHearts - 1 ? 'argent' : 'bronze';
}

/** La meilleure de deux médailles (null = aucune). */
export function bestMedal(a: BossMedal | null, b: BossMedal | null): BossMedal | null {
  if (!a) return b;
  if (!b) return a;
  return BOSS_MEDALS.indexOf(a) >= BOSS_MEDALS.indexOf(b) ? a : b;
}

/**
 * Ce qui se passe à l'écran après une réponse :
 * - `hit` : bonne réponse, l'adversaire est touché (mob vaincu ou boss −1 vie) ;
 * - `riposte` : erreur, riposte (−1 cœur) ; l'adversaire reste et pose une autre question ;
 * - `blocked` : erreur, mais le bouclier absorbe la riposte.
 */
export const BATTLE_OUTCOMES = ['hit', 'riposte', 'blocked'] as const;
export type BattleOutcome = (typeof BATTLE_OUTCOMES)[number];

export const BattleAnswerResultSchema = z.object({
  correct: z.boolean(),
  invalid: z.boolean(),
  outcome: z.enum(BATTLE_OUTCOMES).nullable(),
  battle: BattleViewSchema,
});
export type BattleAnswerResult = z.infer<typeof BattleAnswerResultSchema>;

export const BattleSummarySchema = z.object({
  won: z.boolean(),
  firstWin: z.boolean(),
  xpGained: int,
  coinsGained: int,
  hearts: int,
  /** Médaille de ce combat (null si défaite) et si elle bat le record du boss. */
  medal: BossMedalSchema.nullable(),
  newBest: z.boolean(),
  /** Coffre de victoire, de la rareté de la médaille (parfois un cran au-dessus) ; null si défaite. */
  chest: ChestSchema.nullable(),
  /** Notion à renforcer en priorité : l'écran de défaite propose de s'y entraîner. */
  weakSkill: z.string().nullable(),
  /** Récap : réponses et réponses justes par notion (premiers essais). */
  skills: z.array(z.object({ skillId: z.string(), answered: int, correct: int })).readonly(),
  levelBefore: z.number().int().positive(),
  levelAfter: z.number().int().positive(),
});
export type BattleSummary = z.infer<typeof BattleSummarySchema>;

/** Progression des boss d'un profil. */
export const BossRecordSchema = z.object({
  chapterId: z.string(),
  wins: int,
  bestHearts: int,
  bestMedal: BossMedalSchema,
  firstWonAt: z.string(),
});
export type BossRecord = z.infer<typeof BossRecordSchema>;

export const BossOverviewSchema = z.object({
  records: z.array(BossRecordSchema).readonly(),
  /** Tout ce que le joueur possède ; la réserve = inventaire − objets équipés. */
  inventory: InventorySchema,
  /** Objets équipés pour les combats (3 emplacements au plus, types mélangés). */
  equipped: z.array(ItemIdSchema).readonly(),
});
export type BossOverview = z.infer<typeof BossOverviewSchema>;

export const BattleCreateSchema = z.object({
  profileId: z.uuid(),
  chapterId: ContentIdSchema,
});
export type BattleCreate = z.infer<typeof BattleCreateSchema>;

export const BattleAnswerSchema = z.object({
  /** Question répondue (refusée si ce n'est plus la question en cours). */
  skillId: ContentIdSchema,
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  response: ResponseSchema,
  durationMs: z.number().int().nonnegative().max(3_600_000),
});
export type BattleAnswer = z.infer<typeof BattleAnswerSchema>;

export const BattleItemSchema = z.object({ item: ItemIdSchema });
