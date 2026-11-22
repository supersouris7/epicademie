import { z } from 'zod';

/**
 * Recommandation de travail d'un parent à son enfant (décision du 22/11/2026) : une notion et un
 * petit mot facultatif. Visible seulement par le parent et l'enfant concerné. L'enfant la voit à
 * l'accueil ; quand il fait l'entraînement de cette notion, elle passe à « faite » avec son score.
 */

/** Longueur maximale du mot du parent. */
export const RECOMMENDATION_NOTE_MAX = 140;
/** Recommandations en attente au plus, par enfant. */
export const RECOMMENDATION_PENDING_MAX = 3;

export const RECOMMENDATION_STATUSES = ['en-attente', 'faite', 'annulee'] as const;
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

/** Corps de création : mot vide = pas de mot. */
export const RecommendationCreateSchema = z.object({
  skillId: z.string().min(1).max(100),
  note: z
    .string()
    .trim()
    .max(RECOMMENDATION_NOTE_MAX, `Le mot est limité à ${RECOMMENDATION_NOTE_MAX} caractères.`)
    .transform((s) => (s === '' ? null : s))
    .nullish()
    .transform((s) => s ?? null),
});
export type RecommendationCreate = z.input<typeof RecommendationCreateSchema>;

/** Recommandation en attente, telle que l'enfant la voit. */
export const RecommendationSchema = z.object({
  id: z.uuid(),
  profileId: z.uuid(),
  skillId: z.string(),
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

/** Vue du parent : toutes les étapes, avec le résultat quand elle est faite. */
export const FamilyRecommendationSchema = RecommendationSchema.extend({
  profileName: z.string(),
  status: z.enum(RECOMMENDATION_STATUSES),
  doneAt: z.string().nullable(),
  /** Réponses justes du premier coup / réponses de l'entraînement (null tant que pas faite). */
  correct: z.number().int().nonnegative().nullable(),
  answered: z.number().int().nonnegative().nullable(),
});
export type FamilyRecommendation = z.infer<typeof FamilyRecommendationSchema>;
