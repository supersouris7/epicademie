import { z } from 'zod';
import { CHEST_RARITIES, ChestSchema } from './items.ts';
import { DaySchema, LevelSchema, ResponseSchema } from './play.ts';
import { SUBJECT_IDS, SubjectInputSchema } from './subjects.ts';

/**
 * Arène d'évaluation (docs/adr/0030-arene-evaluation.md) : vocabulaire commun au moteur, au
 * serveur et au web. Les contrats d'API viendront s'y ajouter avec le service.
 */

/** Les trois épreuves. */
export const EVALUATION_KINDS = ['origines', 'progression', 'maitres'] as const;
export type EvaluationKind = (typeof EVALUATION_KINDS)[number];

/** Les 7 états d'une compétence (ordre de l'arbre de décision, §4 de la conception). */
export const COMPETENCE_STATES = [
  'non-etudiee',
  'non-evaluee',
  'evaluation-insuffisante',
  'en-difficulte',
  'maitrisee',
  'a-consolider',
  'en-cours',
] as const;
export type CompetenceState = (typeof COMPETENCE_STATES)[number];

/** Rôle d'une compétence dans un bilan : notée, prérequis exploré ou avancée (hors score). */
export const EVALUATION_ROLES = ['score', 'prerequis', 'avance'] as const;
export type EvaluationRole = (typeof EVALUATION_ROLES)[number];

/** Déclaration de l'élève : chapitre déjà vu en classe, pas encore vu, ou ne sait pas. */
export const STUDIED_STATUSES = ['vu', 'pas-vu', 'ne-sait-pas'] as const;
export type StudiedStatus = (typeof STUDIED_STATUSES)[number];

export const EvaluationKindSchema = z.enum(EVALUATION_KINDS);
export const CompetenceStateSchema = z.enum(COMPETENCE_STATES);
export const EvaluationRoleSchema = z.enum(EVALUATION_ROLES);
export const StudiedStatusSchema = z.enum(STUDIED_STATUSES);
const SubjectSchema = z.enum(SUBJECT_IDS);
const Percent = z.number().min(0).max(100);

/** Chemin : profil et matière. */
export const EvaluationSubjectParamsSchema = z.object({ id: z.uuid(), subject: SubjectInputSchema });

export const EvaluationCreateSchema = z.object({
  profileId: z.uuid(),
  subject: SubjectInputSchema,
  kind: EvaluationKindSchema,
});
export type EvaluationCreate = z.infer<typeof EvaluationCreateSchema>;

export const EvaluationStartedSchema = z.object({
  id: z.uuid(),
  resumed: z.boolean(),
  plan: z.object({ questions: z.number().int(), domains: z.array(z.string()) }),
});
export type EvaluationStarted = z.infer<typeof EvaluationStartedSchema>;

/** Question choisie par le serveur ; le client la génère avec (notion, niveau, graine). */
export const EvaluationQuestionSchema = z.object({
  skillId: z.string(),
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  index: z.number().int().positive(),
  planned: z.number().int().positive(),
  domain: z.string(),
  role: EvaluationRoleSchema,
});
export type EvaluationQuestion = z.infer<typeof EvaluationQuestionSchema>;

export const EvaluationNextSchema = z.union([
  z.object({ done: z.literal(false), question: EvaluationQuestionSchema }),
  z.object({ done: z.literal(true), canExploreAdvanced: z.boolean() }),
]);
export type EvaluationNext = z.infer<typeof EvaluationNextSchema>;

export const EvaluationAnswerSchema = z.object({
  skillId: z.string().min(1).max(80),
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  /** « Je ne sais pas » : `{ kind: 'unknown' }` (observation fausse). */
  response: ResponseSchema,
  durationMs: z.number().int().nonnegative().max(3_600_000),
});
export type EvaluationAnswer = z.infer<typeof EvaluationAnswerSchema>;

/** Jamais de juste/faux pendant l'épreuve (décision du client). */
export const EvaluationAnswerResultSchema = z.object({
  recorded: z.boolean(),
  /** Réponse illisible : redemandée, sans compter. */
  invalid: z.boolean().optional(),
  progress: z.object({
    index: z.number().int(),
    planned: z.number().int(),
    byDomain: z.record(z.string(), z.number().int()),
  }),
});
export type EvaluationAnswerResult = z.infer<typeof EvaluationAnswerResultSchema>;

export const AdvancedChoiceSchema = z.object({ accept: z.boolean() });

export const StudiedChapterSchema = z.object({ chapterId: z.string().max(80), status: StudiedStatusSchema });
export const StudiedChaptersUpdateSchema = z.object({ chapters: z.array(StudiedChapterSchema).max(60) });
export type StudiedChaptersUpdate = z.infer<typeof StudiedChaptersUpdateSchema>;
export const StudiedChapterViewSchema = z.object({
  chapterId: z.string(),
  title: z.string(),
  domain: z.string(),
  status: StudiedStatusSchema,
  /** Pré-coché « vu » d'après l'entraînement (aucune déclaration enregistrée). */
  suggested: z.boolean(),
});
export type StudiedChapterView = z.infer<typeof StudiedChapterViewSchema>;

const CountsSchema = z.object({
  evaluated: z.number().int(),
  mastered: z.number().int(),
  inProgress: z.number().int(),
  struggling: z.number().int(),
});
const DomainScoreSchema = z.object({ domain: z.string(), mastery: Percent.nullable(), coverage: Percent });

export const EvaluationCompetenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: z.string(),
  essential: z.boolean(),
  role: EvaluationRoleSchema,
  state: CompetenceStateSchema,
  weakestSkillId: z.string().nullable(),
});

export const EvaluationProgressSchema = z.object({
  comparedWith: z.uuid(),
  common: z.number().int(),
  masteryBefore: Percent.nullable(),
  masteryAfter: Percent.nullable(),
  newlyMastered: z.array(z.string()),
  resolved: z.array(z.string()),
  persistent: z.array(z.string()),
  regressions: z.array(z.string()),
});

export const EvaluationRewardsSchema = z.object({
  xp: z.number().int(),
  coins: z.number().int(),
  chest: z.enum(CHEST_RARITIES).nullable(),
  /** Épreuve dans sa période récompensée (sinon récompense réduite, sans coffre). */
  inPeriod: z.boolean(),
  /** Contenu du coffre reçu (à la clôture seulement ; null ensuite). */
  chestContent: ChestSchema.nullable(),
});

export const EvaluationResultSchema = z.object({
  id: z.uuid(),
  kind: EvaluationKindSchema,
  subject: SubjectSchema,
  referentialGrade: z.string(),
  referentialVersion: z.number().int(),
  finishedAt: z.iso.datetime(),
  partial: z.boolean(),
  /** 0–100 non arrondi ; null sans compétence évaluée. Le client arrondit à 5 %. */
  mastery: Percent.nullable(),
  /** Maîtrise affichable (au moins 4 points de poids évalués). */
  masteryDisplayable: z.boolean(),
  coverage: Percent,
  studied: Percent.nullable(),
  counts: CountsSchema,
  questions: z.number().int(),
  domains: z.array(DomainScoreSchema),
  competences: z.array(EvaluationCompetenceSchema),
  strengths: z.array(z.string()),
  toWork: z.array(z.string()),
  notEvaluated: z.array(z.string()),
  notStudied: z.array(z.string()),
  /** Prérequis explorés et à retravailler. */
  prerequisitesToRework: z.array(z.string()),
  /** Origines : compétences de la classe à consolider ; Maîtres : essentielles à préparer pour la classe suivante. */
  forNextYear: z.array(z.string()),
  progress: EvaluationProgressSchema.nullable(),
  priorities: z.array(z.string()).max(3),
  trainings: z.array(z.object({ chapterId: z.string(), skillId: z.string() })).max(3),
  rewards: EvaluationRewardsSchema,
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

export const EvaluationReviewSchema = z.object({
  questions: z.array(
    z.object({
      skillId: z.string(),
      level: LevelSchema,
      seed: z.number().int(),
      response: z.unknown(),
      correct: z.boolean(),
      role: EvaluationRoleSchema,
    }),
  ),
});
export type EvaluationReview = z.infer<typeof EvaluationReviewSchema>;

export const EvaluationListItemSchema = z.object({
  id: z.uuid(),
  kind: EvaluationKindSchema,
  subject: SubjectSchema,
  referentialGrade: z.string(),
  referentialVersion: z.number().int(),
  schoolYear: z.number().int(),
  finishedAt: z.iso.datetime(),
  partial: z.boolean(),
  mastery: Percent.nullable(),
  coverage: Percent.nullable(),
  studied: Percent.nullable(),
  evaluatedCount: z.number().int(),
  masteredCount: z.number().int(),
});
export type EvaluationListItem = z.infer<typeof EvaluationListItemSchema>;

const KindOfferSchema = z.object({
  kind: EvaluationKindSchema,
  /** Épreuve jouable (référentiel et contenu présents). */
  available: z.boolean(),
  referentialGrade: z.string().nullable(),
  /** Récompense complète possible maintenant. */
  rewardable: z.boolean(),
  recommended: z.boolean(),
  /** Raison de la recommandation (null si non recommandée). */
  reason: z.string().nullable(),
});

export const EvaluationHomeSchema = z.object({
  subject: SubjectSchema,
  /** Classe de l'élève (null : « Indique ta classe dans ton profil »). */
  grade: z.string().nullable(),
  /** Matière sans référentiel : « Bientôt ». */
  available: z.boolean(),
  kinds: z.array(KindOfferSchema),
  open: z.object({ id: z.uuid(), kind: EvaluationKindSchema, startedAt: z.iso.datetime() }).nullable(),
  history: z.array(EvaluationListItemSchema),
  /** Entraînements conseillés par le dernier bilan (3 au plus). */
  trainings: z.array(z.object({ chapterId: z.string(), skillId: z.string() })).max(3),
});
export type EvaluationHome = z.infer<typeof EvaluationHomeSchema>;

export const EvaluationSummarySchema = z.object({
  subjects: z.array(
    z.object({
      subject: SubjectSchema,
      history: z.array(EvaluationListItemSchema),
      latest: EvaluationResultSchema.nullable(),
    }),
  ),
  today: DaySchema,
});
export type EvaluationSummary = z.infer<typeof EvaluationSummarySchema>;
