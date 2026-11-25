import { z } from 'zod';
import { GRADES } from './grades.ts';
import { LevelSchema } from './play.ts';
import { SUBJECT_IDS } from './subjects.ts';

/**
 * Fiabilité pédagogique : signalements de questions par les familles, état de validation des
 * notions, désactivation par l'administration (docs/adr/0014-fiabilite-pedagogique.md).
 */

export const REPORT_REASONS = [
  'bug',
  'son',
  'mauvaise-reponse',
  'ambigue',
  'correction-incomprehensible',
  'difficulte',
  'affichage',
  'autre',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  bug: 'Ça ne marche pas (bug)',
  son: 'Problème de son',
  'mauvaise-reponse': 'La réponse attendue est fausse',
  ambigue: 'La question n’est pas claire',
  'correction-incomprehensible': 'L’explication est difficile à comprendre',
  difficulte: 'Trop facile ou trop difficile',
  affichage: 'Problème d’affichage',
  autre: 'Autre problème',
};

/** Motifs du signalement général (hors question), formulés simplement pour les enfants. */
export const GENERAL_REPORT_REASONS = ['bug', 'affichage', 'son', 'difficulte', 'autre'] as const;

/** Motifs du signalement d'une question précise (le reste relève du signalement général). */
export const QUESTION_REPORT_REASONS = [
  'mauvaise-reponse',
  'ambigue',
  'correction-incomprehensible',
  'difficulte',
  'autre',
] as const;

/** Nature d'un signalement : sur une question précise, ou général (écran, bug, son…). */
export const REPORT_KINDS = ['question', 'general'] as const;

export const REPORT_STATUSES = ['nouveau', 'en-cours', 'resolu', 'rejete'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  nouveau: 'Nouveau',
  'en-cours': 'En cours',
  resolu: 'Résolu',
  rejete: 'Rejeté',
};

/** Signalement envoyé depuis une question (aucun texte libre obligatoire). */
export const ReportCreateSchema = z.object({
  profileId: z.uuid(),
  skillId: z.string().min(1).max(80),
  level: LevelSchema,
  seed: z.number().int().nonnegative(),
  reason: z.enum(REPORT_REASONS),
  /** Précision facultative (500 caractères au plus, lue seulement par l'administration). */
  comment: z.string().trim().max(500).optional(),
});
export type ReportCreate = z.infer<typeof ReportCreateSchema>;

/**
 * Signalement général, depuis n'importe quel écran. L'écran (route sans identifiant) et la version
 * de l'appli sont ajoutés automatiquement par l'appli ; aucun identifiant de profil n'est envoyé.
 */
export const GeneralReportCreateSchema = z.object({
  reason: z.enum(GENERAL_REPORT_REASONS),
  comment: z.string().trim().max(500).optional(),
  screen: z.string().max(200),
  appVersion: z.string().max(40),
});
export type GeneralReportCreate = z.infer<typeof GeneralReportCreateSchema>;

export const ReportSchema = z.object({
  id: z.uuid(),
  kind: z.enum(REPORT_KINDS),
  /** Notion, niveau, graine et version : seulement pour un signalement de question. */
  skillId: z.string().nullable(),
  level: LevelSchema.nullable(),
  seed: z.number().int().nonnegative().nullable(),
  skillVersion: z.number().int().positive().nullable(),
  screen: z.string().nullable(),
  appVersion: z.string().nullable(),
  reason: z.enum(REPORT_REASONS),
  comment: z.string().nullable(),
  status: z.enum(REPORT_STATUSES),
  adminNote: z.string().nullable(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});
export type Report = z.infer<typeof ReportSchema>;

export const ReportUpdateSchema = z.object({
  status: z.enum(REPORT_STATUSES),
  adminNote: z.string().trim().max(1000).optional(),
});

/** État de validation d'une notion. */
export const VALIDATION_STATES = ['relue', 'validee-auto', 'signalee', 'problemes-auto', 'desactivee'] as const;
export type ValidationState = (typeof VALIDATION_STATES)[number];

export const VALIDATION_STATE_LABELS: Record<ValidationState, string> = {
  relue: 'Relue par l’équipe',
  'validee-auto': 'Contrôles automatiques réussis',
  signalee: 'Signalée, à examiner',
  'problemes-auto': 'Contrôles automatiques en échec',
  desactivee: 'Désactivée',
};

/** Libellés courts (badges et compteurs de la console). */
export const VALIDATION_STATE_SHORT_LABELS: Record<ValidationState, string> = {
  relue: 'Relue',
  'validee-auto': 'OK',
  signalee: 'Signalée',
  'problemes-auto': 'En échec',
  desactivee: 'Désactivée',
};

export const ContentSkillSchema = z.object({
  skillId: z.string(),
  title: z.string(),
  chapterId: z.string(),
  subject: z.enum(SUBJECT_IDS),
  grade: z.enum(GRADES),
  /** Question de boss (problème, piège) plutôt que notion d'entraînement. */
  boss: z.boolean(),
  version: z.number().int().positive(),
  /** Référence au programme officiel. */
  source: z.string(),
  state: z.enum(VALIDATION_STATES),
  disabled: z.boolean(),
  /** Version relue par l'équipe (null : jamais relue). */
  reviewedVersion: z.number().int().positive().nullable(),
  openReports: z.number().int().nonnegative(),
  autoIssues: z.array(z.string()),
});
export type ContentSkill = z.infer<typeof ContentSkillSchema>;

export const ContentUpdateSchema = z.object({
  disabled: z.boolean().optional(),
  /** Marque la version actuelle comme relue. */
  reviewed: z.boolean().optional(),
  note: z.string().trim().max(1000).optional(),
});

export const CONTENT_ACTIONS = ['desactivation', 'reactivation', 'relecture'] as const;
export const ContentEventSchema = z.object({
  action: z.enum(CONTENT_ACTIONS),
  version: z.number().int().positive(),
  note: z.string().nullable(),
  at: z.string(),
});

/** Notions désactivées : le jeu ne les propose plus (l'historique reste). */
export const DisabledContentSchema = z.object({ skills: z.array(z.string()) });
