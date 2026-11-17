import { z } from 'zod';
import type { Inventory } from './battle.ts';
import { MODE_IDS } from './modes.ts';
import { SUBJECT_IDS } from './subjects.ts';

export const LevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const ResponseSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('number'), text: z.string().max(40) }),
  z.object({ kind: z.literal('fraction'), num: z.string().max(20), den: z.string().max(20) }),
  z.object({ kind: z.literal('choice'), index: z.number().int().min(0).max(20) }),
  z.object({ kind: z.literal('point'), x: z.number().int().min(-50).max(50), y: z.number().int().min(-50).max(50) }),
  z.object({ kind: z.literal('text'), text: z.string().max(80) }),
]);

export const SessionCreateSchema = z.object({
  profileId: z.uuid(),
  mode: z.enum(MODE_IDS),
  subject: z.enum(SUBJECT_IDS),
  chapterId: z.string().min(1).max(80),
  /** null = tout le chapitre. */
  skillId: z.string().min(1).max(80).nullable(),
});
export type SessionCreate = z.infer<typeof SessionCreateSchema>;

export const AnswerSubmitSchema = z.object({
  skillId: z.string().min(1).max(80),
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  variant: z.boolean(),
  response: ResponseSchema,
  durationMs: z.number().int().nonnegative().max(3_600_000),
});
export type AnswerSubmit = z.infer<typeof AnswerSubmitSchema>;

export interface AnswerResult {
  readonly correct: boolean;
  readonly invalid: boolean;
  readonly xp: number;
}

export interface SkillProgress {
  readonly skillId: string;
  readonly stage: 0 | 1 | 2 | 3;
  readonly due: string | null;
  readonly attempts: number;
  readonly correct: number;
  readonly recent: readonly boolean[];
  readonly maintained: number;
}

export interface SessionSkillSummary {
  readonly skillId: string;
  readonly answered: number;
  readonly correct: number;
  readonly stageBefore: number;
  readonly stageAfter: number;
  readonly due: string | null;
}

export interface SessionSummary {
  readonly regular: { readonly answered: number; readonly correct: number };
  readonly variants: { readonly answered: number; readonly correct: number };
  readonly scoreOn20: number;
  readonly xpGained: number;
  readonly coinsGained: number;
  readonly perfect: boolean;
  readonly levelBefore: number;
  readonly levelAfter: number;
  readonly skills: readonly SessionSkillSummary[];
  /** Objets de combat gagnés : bouclier (sans-faute), soin (notion acquise). */
  readonly items: Partial<Inventory>;
}
