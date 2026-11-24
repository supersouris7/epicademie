import { z } from 'zod';
import { ChestSchema } from './items.ts';
import { MODE_IDS } from './modes.ts';
import { SubjectInputSchema } from './subjects.ts';

/** Contrats de l'entraînement (parties hors boss) : création, réponses, bilan, progression. */

/** Niveaux de difficulté : 1 à 3 (notions existantes), jusqu'à 5 pour les nouvelles (docs/adr/0034). */
export const LevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export type Level = z.infer<typeof LevelSchema>;

/** Identifiant de notion ou de chapitre du contenu (`maths-5e-fractions`…). */
export const ContentIdSchema = z.string().min(1).max(80);

export const ResponseSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('number'), text: z.string().max(40) }),
  z.object({ kind: z.literal('fraction'), num: z.string().max(20), den: z.string().max(20) }),
  z.object({ kind: z.literal('choice'), index: z.number().int().min(0).max(20) }),
  z.object({ kind: z.literal('point'), x: z.number().int().min(-50).max(50), y: z.number().int().min(-50).max(50) }),
  /** Zone touchée sur une carte (identifiant de zone, ex. `53`, `fra`, `atlantique`). */
  z.object({ kind: z.literal('zone'), zone: z.string().regex(/^[a-z0-9-]{1,30}$/i) }),
  z.object({ kind: z.literal('text'), text: z.string().max(80) }),
  /** Ordre : indices des éléments dans l'ordre choisi (6 éléments au plus). */
  z.object({ kind: z.literal('order'), order: z.array(z.number().int().min(0).max(11)).min(2).max(12).readonly() }),
  /** Association : indice de la colonne de droite choisi pour chaque élément de gauche. */
  z.object({ kind: z.literal('match'), pairs: z.array(z.number().int().min(0).max(11)).min(2).max(12).readonly() }),
  /** Texte à trous : une saisie par trou. */
  z.object({ kind: z.literal('cloze'), answers: z.array(z.string().max(80)).min(1).max(12).readonly() }),
  /** « Je ne sais pas » : compte comme une erreur. */
  z.object({ kind: z.literal('unknown') }),
]);

export const SessionCreateSchema = z.object({
  profileId: z.uuid(),
  mode: z.enum(MODE_IDS),
  subject: SubjectInputSchema,
  chapterId: ContentIdSchema,
  /** null = tout le chapitre. */
  skillId: ContentIdSchema.nullable(),
  /** Épreuve du chapitre : série mélangée de toutes ses notions (mode entraînement, skillId null). */
  epreuve: z.boolean().optional(),
});
export type SessionCreate = z.infer<typeof SessionCreateSchema>;

export const SessionCreatedSchema = z.object({ id: z.uuid() });

export const AnswerSubmitSchema = z.object({
  skillId: ContentIdSchema,
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  variant: z.boolean(),
  response: ResponseSchema,
  /** Temps de réponse : bonus de vitesse et rythme conseillé (aucun autre usage). */
  durationMs: z.number().int().nonnegative().max(3_600_000),
  /**
   * 1 : première réponse (compte pour le score et la progression) ; 2 : second essai après
   * l'indice (enregistré comme « réussite avec aide », sans XP ni effet sur la médaille).
   */
  attempt: z.union([z.literal(1), z.literal(2)]).default(1),
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
  /** Jour de dernière pratique (fuseau de la famille) : le moteur espace les répétitions. */
  lastPracticed: DaySchema.nullable(),
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

/** Résultat d'une Épreuve du chapitre (calculé par le serveur sur les réponses enregistrées). */
export const EpreuveResultSchema = z.object({
  chapterId: z.string(),
  passed: z.boolean(),
  /** Première validation du chapitre : coffre « chapitre » et trophée gagnés maintenant. */
  rewarded: z.boolean(),
  /** Chapitre déjà validé avant cette épreuve. */
  alreadyValidated: z.boolean(),
  /** Notion la plus ratée (conseil d'entraînement), null si aucune erreur. */
  weakestSkillId: z.string().nullable(),
});
export type EpreuveResult = z.infer<typeof EpreuveResultSchema>;

/** Trophée de chapitre (épreuve réussie). */
export const ChapterTrophySchema = z.object({ chapterId: z.string(), obtainedAt: z.iso.datetime() });
export type ChapterTrophy = z.infer<typeof ChapterTrophySchema>;

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
  /** Présent seulement pour une Épreuve du chapitre. */
  epreuve: EpreuveResultSchema.optional(),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
