/**
 * Paramètres de l'Arène d'évaluation (docs/ARENE-EVALUATION.md §3, §5, §7). Une seule constante,
 * testée : aucune valeur chiffrée ailleurs dans le moteur.
 */
export const EVALUATION = {
  questions: {
    /** Nombre fixe de questions de l'épreuve, annoncé au lancement (moins si le programme est trop petit). */
    target: 16,
    /** Une épreuve ne se termine pas « conclue » avant ce nombre (borné par le programme choisi). */
    min: 12,
    /** Plafond absolu, défis bonus compris (les prérequis restent dans le nombre fixe). */
    max: 20,
  },
  /** Seuils d'un appui sur 3 niveaux. */
  warmupQuestions: 2,
  maxDurationMs: 15 * 60_000,
  expiryDays: 7,
  /** Besoin en questions d'une compétence : déjà suffisamment observée / sinon. */
  need: { verified: 1, unverified: 2 },
  /** Une compétence reçoit au plus ce nombre de questions notées (hors preuve de niveau 2). */
  maxPerCompetence: 3,
  /** Niveau global : réussite minimale et maximale après `globalLevelAfter` réponses. */
  globalLevelAfter: 4,
  globalLevelLow: 0.4,
  globalLevelHigh: 0.8,
  /** Protection contre le découragement. */
  errorsToEase: 4,
  errorsToStop: 7,
  exploration: {
    maxPrerequisites: 2,
    questionsPerPrerequisite: 2,
    maxAdvanced: 3,
    questionsPerAdvanced: 2,
    /** Réussite globale minimale pour proposer les avancées. */
    advancedMinRate: 0.8,
  },
  seedAttempts: 5,
  seedMemoryDays: 60,
  /** Observations : poids de la source, fraîcheur, bornes de lecture. */
  observation: {
    maxPerCompetence: 20,
    sourceWeight: { evaluation: 1, solo: 0.5, versus: 0.25, none: 0 },
  },
  /** « Suffisamment observée » (§3.3). */
  sufficient: { minWeight: 2, minCount: 2, arenaDays: 90, othersWeight: 3, othersDays: 2 },
  /** États (§4). */
  state: { difficulty: 0.5, mastered: 0.8, minCorrect: 2, masteredMaxAgeDays: 120 },
  /** Valeur d'un état dans la maîtrise (§4). */
  stateValue: { maitrisee: 1, 'a-consolider': 0.75, 'en-cours': 0.5, 'en-difficulte': 0 },
  /** Maîtrise (§7) : poids d'une essentielle, seuil d'affichage, arrondi. */
  weights: { essential: 2, other: 1 },
  minWeightForMastery: 4,
  displayStep: 5,
  /** Comparaison de deux bilans : compétences communes minimales. */
  minCommon: 3,
  /** Titre « Bilan des Maîtres » complet : couverture minimale. */
  maitresFullCoverage: 90,
} as const;

/** Ordre de tourniquet des domaines (égalité : N, G, E, D, F, I). */
export const DOMAIN_ORDER = ['nombres', 'grandeurs', 'geometrie', 'donnees', 'fonctions', 'informatique'] as const;
