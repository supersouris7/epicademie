import { z } from 'zod';
import { ChestSchema } from './items.ts';
import { MODE_IDS } from './modes.ts';
import { SUBJECT_IDS } from './subjects.ts';

/** Contrats de l'entraînement (parties hors boss) : création, réponses, bilan, progression. */

export const LevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Level = z.infer<typeof LevelSchema>;

/** Identifiant de notion ou de chapitre du contenu (`maths-5e-fractions`…). */
export const ContentIdSchema = z.string().min(1).max(80);

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
  chapterId: ContentIdSchema,
  /** null = tout le chapitre. */
  skillId: ContentIdSchema.nullable(),
});
export type SessionCreate = z.infer<typeof SessionCreateSchema>;

export const SessionCreatedSchema = z.object({ id: z.uuid() });

export const AnswerSubmitSchema = z.object({
  skillId: ContentIdSchema,
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  variant: z.boolean(),
  response: ResponseSchema,
  durationMs: z.number().int().nonnegative().max(3_600_000),
});
export type AnswerSubmit = z.infer<typeof AnswerSubmitSchema>;

export const ConfusedSchema = z.object({ skillId: ContentIdSchema });

export const AnswerResultSchema = z.object({
  correct: z.boolean(),
  /** Réponse illisible (ex. « 3,,2 ») : ni juste ni fausse, le joueur la corrige. */
  invalid: z.boolean(),
  xp: z.number().int().nonnegative(),
});
export type AnswerResult = z.infer<typeof AnswerResultSchema>;

/** Étape de répétition espacée : 0 nouvelle, 1 à revoir, 2 en cours, 3 acquise. */
export const StageSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);
/** Jour AAAA-MM-JJ. */
export const DaySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const SkillProgressSchema = z.object({
  skillId: z.string(),
  stage: StageSchema,
  due: DaySchema.nullable(),
  attempts: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  recent: z.array(z.boolean()).readonly(),
  maintained: z.number().int().nonnegative(),
  /** Meilleure série sur la notion (0 à 5) : fixe la médaille (5 Or, 4 Argent, 3 Bronze). */
  best: z.number().int().min(0).max(5),
});
export type SkillProgress = z.infer<typeof SkillProgressSchema>;

const Tally = z.object({ answered: z.number().int().nonnegative(), correct: z.number().int().nonnegative() });

export const SessionSkillSummarySchema = z.object({
  skillId: z.string(),
  answered: z.number().int().nonnegative(),
  correct: z.number().int().nonnegative(),
  stageBefore: z.number().int(),
  stageAfter: z.number().int(),
  /** Meilleure série avant et après la partie (médaille). */
  bestBefore: z.number().int(),
  bestAfter: z.number().int(),
  due: DaySchema.nullable(),
});
export type SessionSkillSummary = z.infer<typeof SessionSkillSummarySchema>;

export const SessionSummarySchema = z.object({
  regular: Tally,
  variants: Tally,
  scoreOn20: z.number().min(0).max(20),
  xpGained: z.number().int().nonnegative(),
  coinsGained: z.number().int().nonnegative(),
  perfect: z.boolean(),
  levelBefore: z.number().int().positive(),
  levelAfter: z.number().int().positive(),
  skills: z.array(SessionSkillSummarySchema).readonly(),
  /** Coffre d'équipement tiré au hasard (plus probable avec un bon score), ou null. */
  chest: ChestSchema.nullable(),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
