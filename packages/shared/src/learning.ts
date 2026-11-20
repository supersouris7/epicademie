import { z } from 'zod';
import { MODE_IDS } from './modes.ts';
import { SUBJECT_IDS } from './subjects.ts';

/**
 * Suivi des apprentissages d'un enfant (lu par l'enfant et le tableau de bord parent).
 *
 * Principes (docs/adr/0013-suivi-des-apprentissages.md) :
 * - pas de « pourcentage de maîtrise » : un état pédagogique par notion, en mots ;
 * - la maîtrise personnelle ne se fonde que sur les **premières réponses individuelles sans
 *   aide** ; les réussites avec aide (indice, second essai) et les réponses collectives (TV,
 *   raid, parent à côté) sont comptées à part ;
 * - données minimales : aucune donnée d'identité, seulement les réponses du jeu.
 */

/** État pédagogique d'une notion. */
export const SKILL_STATUSES = ['non-commencee', 'a-travailler', 'en-progression', 'a-consolider', 'acquise'] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];

export const SKILL_STATUS_LABELS: Record<SkillStatus, string> = {
  'non-commencee': 'Pas encore commencée',
  'a-travailler': 'À travailler',
  'en-progression': 'En progression',
  'a-consolider': 'À consolider',
  acquise: 'Acquise',
};

export const TRENDS = ['hausse', 'stable', 'baisse'] as const;
export type Trend = (typeof TRENDS)[number];

const count = z.number().int().nonnegative();
/** Part de réussite entre 0 et 1, ou null si trop peu de réponses pour en parler. */
const rate = z.number().min(0).max(1).nullable();

/** Comptes de réponses, séparés selon l'aide et le contexte. */
export const TallySchema = z.object({
  /** Premières réponses individuelles (base de la maîtrise personnelle). */
  answered: count,
  /** … dont justes sans aide (« réussite autonome »). */
  autonomous: count,
  /** Réussites avec aide : indice affiché ou second essai. */
  helped: count,
  /** Aides utilisées (indices, seconds essais). */
  hints: count,
  /** Réponses collectives (TV, raid) : jamais dans la maîtrise personnelle. */
  collective: count,
});
export type Tally = z.infer<typeof TallySchema>;

export const SkillLearningSchema = z.object({
  skillId: z.string(),
  chapterId: z.string(),
  subject: z.enum(SUBJECT_IDS),
  status: z.enum(SKILL_STATUSES),
  tally: TallySchema,
  /** Réussite autonome sur les dernières réponses (au plus 10), null s'il y en a moins de 4. */
  recentRate: rate,
  /** Évolution : 5 dernières réponses comparées aux 5 précédentes (null si trop peu). */
  trend: z.enum(TRENDS).nullable(),
  lastPracticed: z.string().nullable(),
  /** Prochaine révision prévue (répétition espacée), jour AAAA-MM-JJ. */
  nextReview: z.string().nullable(),
  /** Erreurs typiques qui reviennent (au moins 2 fois), de la plus fréquente à la moins fréquente. */
  recurringErrors: z.array(z.object({ text: z.string(), count })),
});
export type SkillLearning = z.infer<typeof SkillLearningSchema>;

export const ChapterLearningSchema = z.object({
  chapterId: z.string(),
  subject: z.enum(SUBJECT_IDS),
  tally: TallySchema,
  /** Nombre de notions par état. */
  statuses: z.record(z.enum(SKILL_STATUSES), count),
});

export const SubjectLearningSchema = z.object({
  subject: z.enum(SUBJECT_IDS),
  tally: TallySchema,
  statuses: z.record(z.enum(SKILL_STATUSES), count),
});

export const WeekLearningSchema = z.object({
  /** Lundi de la semaine (AAAA-MM-JJ). */
  week: z.string(),
  tally: TallySchema,
  modes: z.array(z.enum(MODE_IDS)),
});

export const LearningReportSchema = z.object({
  /** Jour du calcul (AAAA-MM-JJ). */
  day: z.string(),
  tally: TallySchema,
  lastActivity: z.string().nullable(),
  subjects: z.array(SubjectLearningSchema),
  chapters: z.array(ChapterLearningSchema),
  skills: z.array(SkillLearningSchema),
  /** Notions à retravailler en priorité (au plus 5). */
  toRework: z.array(z.string()),
  /** Révisions à faire aujourd'hui ou en retard (au plus 5). */
  dueReviews: z.array(z.string()),
  /** 8 dernières semaines, de la plus ancienne à la plus récente. */
  weeks: z.array(WeekLearningSchema),
});
export type LearningReport = z.infer<typeof LearningReportSchema>;

// ——— Badges (conditions : @questeo/engine/badges.ts) ———

export const BADGE_CATEGORIES = ['boss', 'parfait', 'perseverance', 'chapitres', 'consolidees', 'coffres'] as const;
export type BadgeCategory = (typeof BADGE_CATEGORIES)[number];
export const BADGE_TIERS = ['bronze', 'argent', 'or', 'diamant'] as const;
export type BadgeTier = (typeof BADGE_TIERS)[number];

export const BadgeProgressSchema = z.object({
  category: z.enum(BADGE_CATEGORIES),
  title: z.string(),
  how: z.string(),
  /** Compteur actuel. */
  value: z.number().int().nonnegative(),
  /** Grade atteint (null : pas encore de grade). */
  tier: z.enum(BADGE_TIERS).nullable(),
  /** Seuil du grade suivant (null : diamant atteint). */
  next: z.number().int().positive().nullable(),
});
export type BadgeProgress = z.infer<typeof BadgeProgressSchema>;
