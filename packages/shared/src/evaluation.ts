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
