import { z } from 'zod';
import type { BattleState } from '@questeo/engine';
import { BATTLE_STATUSES, BattleQuestionSchema, ItemIdSchema } from '@questeo/shared';

/**
 * Format de l'état d'un combat stocké en base (`sessions.battle`, jsonb).
 *
 * L'état est écrit par une version du serveur et relu par une autre (déploiement pendant un
 * combat) : il est donc VERSIONNÉ et VALIDÉ à la lecture, jamais simplement « casté ».
 * - Toute évolution du type `BattleState` (@questeo/engine) qui change ce format doit
 *   incrémenter `BATTLE_STATE_VERSION` ; le contrôle de type ci-dessous rappelle de mettre le
 *   schéma à jour.
 * - Un état d'une autre version, ou illisible, n'est pas converti : le combat est clos sans
 *   récompense ni pénalité et l'enfant en relance un (décision du 20/11/2026, voir
 *   docs/adr/0009-etat-des-combats.md).
 */

/** Version du format stocké. À incrémenter à chaque changement de `BattleState`. */
export const BATTLE_STATE_VERSION = 1;

const count = z.number().int().nonnegative();

const BattleStateSchema = z.object({
  status: z.enum(BATTLE_STATUSES),
  hearts: count,
  maxHearts: count,
  bossLives: count,
  mobsDefeated: count,
  turn: count,
  order: z.array(z.string()).readonly(),
  shield: z.boolean(),
  hintShown: z.boolean(),
  itemsUsed: count,
  equipped: z.array(ItemIdSchema).readonly(),
  question: BattleQuestionSchema.nullable(),
  answered: count,
  correct: count,
  misses: z.array(z.string()).readonly(),
  seen: z.array(z.string()).readonly(),
}) satisfies z.ZodType<BattleState>;

const StoredBattleSchema = z.object({
  v: z.literal(BATTLE_STATE_VERSION),
  state: BattleStateSchema,
});

/** Enveloppe stockée en base. */
export type StoredBattle = z.infer<typeof StoredBattleSchema>;

/**
 * État à écrire en base (avec sa version).
 *
 * Contrôle à la compilation, dans les deux sens : `satisfies` ci-dessus garantit que ce que le
 * schéma relit est un `BattleState`, et le type de retour ci-dessous qu'un `BattleState` entre
 * dans le schéma. Une erreur de type ici ou là signifie que le moteur a changé le format :
 * mettre à jour le schéma ET incrémenter `BATTLE_STATE_VERSION`.
 */
export const storeBattle = (state: BattleState): StoredBattle => ({ v: BATTLE_STATE_VERSION, state });

/** État relu en base, ou `null` s'il vient d'une autre version ou s'il est illisible. */
export function readBattle(raw: unknown): BattleState | null {
  const parsed = StoredBattleSchema.safeParse(raw);
  return parsed.success ? parsed.data.state : null;
}
