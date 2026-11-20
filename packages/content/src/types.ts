import type { Grade, SubjectId } from '@questeo/shared';
import type { Rational } from './rational.ts';
import type { Rng } from './rng.ts';

/**
 * Texte enrichi en mini-balisage :
 * - `{3/4}` fraction empilée ;
 * - `^2` exposant (un chiffre) ;
 * - `**gras**`.
 */
export type Rich = string;

export type Level = 1 | 2 | 3;

/** Figures décrites par des données ; le rendu SVG est fait par l'application. */
export type Figure =
  | {
      readonly kind: 'numberLine';
      readonly min: number;
      readonly max: number;
      /** Nombre de sous-graduations par unité. */
      readonly subdivisions: number;
      /** Valeurs écrites sous la droite (les autres graduations restent muettes). */
      readonly labels: readonly number[];
      readonly points: readonly { name: string; at: number }[];
    }
  | {
      readonly kind: 'grid';
      /** Bornes du quadrillage (repère si `axes`). */
      readonly xMin: number;
      readonly xMax: number;
      readonly yMin: number;
      readonly yMax: number;
      readonly axes: boolean;
      readonly points: readonly { name: string; x: number; y: number; color?: 'accent' | 'muted' }[];
      readonly segments?: readonly [string, string][];
      /** Axe de symétrie tracé (droite passant par deux nœuds). */
      readonly axis?: { readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number };
      /** Le point à placer est saisi en touchant un nœud du quadrillage. */
      readonly pick?: boolean;
    }
  | {
      readonly kind: 'polygon';
      /** Sommets dans un repère libre (unités arbitraires, y vers le haut). */
      readonly vertices: readonly { name: string; x: number; y: number }[];
      readonly sideLabels?: readonly (string | null)[];
      readonly angleLabels?: readonly (string | null)[];
      /** Segments supplémentaires (hauteur, médiane…), en pointillés. */
      readonly extra?: readonly {
        readonly from: { x: number; y: number };
        readonly to: { x: number; y: number };
        readonly label?: string;
        /** Angle droit marqué à l'extrémité `to`. */
        readonly rightAngleAtEnd?: boolean;
        /** Point `to` milieu d'un côté : codage des deux moitiés égales. */
        readonly midpointOf?: readonly [number, number];
        /** Droite prolongée au-delà des points (médiatrice). */
        readonly infinite?: boolean;
      }[];
      readonly rightAngles?: readonly number[];
      /** Codage des côtés égaux : même nombre de traits pour les côtés de même longueur. */
      readonly ticks?: readonly number[];
    }
  | { readonly kind: 'disk'; readonly radiusLabel: string; readonly diameter?: boolean }
  | {
      readonly kind: 'solid';
      readonly solid: 'cube' | 'pave' | 'cylindre' | 'prisme';
      readonly labels: readonly string[];
    }
  | {
      readonly kind: 'parallels';
      /** Angle (degrés) entre la sécante et les parallèles. */
      readonly angle: number;
      /** Angles marqués : position 0-7 (4 autour de chaque intersection, sens horaire depuis le haut-droite). */
      readonly marks: readonly { at: number; label: string }[];
      readonly parallel: boolean;
    }
  | {
      readonly kind: 'bars';
      readonly title: string;
      readonly bars: readonly { label: string; value: number }[];
      readonly unit?: string;
    }
  | {
      readonly kind: 'table';
      readonly rows: readonly (readonly string[])[];
      /** La première colonne est un en-tête. */
      readonly header: boolean;
    }
  | {
      readonly kind: 'chart';
      readonly xLabel: string;
      readonly yLabel: string;
      readonly points: readonly { x: number; y: number }[];
      readonly line: boolean;
    }
  | { readonly kind: 'blocks'; readonly program: readonly Block[] }
  | { readonly kind: 'pattern'; readonly steps: readonly (readonly [number, number][])[] };

/** Programme par blocs (façon Scratch) pour la pensée informatique. */
export type Block =
  | { readonly op: 'ask'; readonly text: string; readonly answer: number }
  | { readonly op: 'set'; readonly variable: string; readonly expr: string }
  | { readonly op: 'change'; readonly variable: string; readonly by: string }
  | { readonly op: 'say'; readonly expr: string }
  | { readonly op: 'repeat'; readonly times: number; readonly body: readonly Block[] }
  /** Si … alors … sinon … (4e : instructions conditionnelles). */
  | { readonly op: 'if'; readonly cond: string; readonly then: readonly Block[]; readonly else?: readonly Block[] }
  /** Répéter jusqu'à … (3e : boucle conditionnelle). */
  | { readonly op: 'until'; readonly cond: string; readonly body: readonly Block[] };

export type AnswerSpec =
  | {
      readonly kind: 'number';
      readonly value: Rational;
      readonly unit?: string;
      /** Autres réponses justes (ex. arrondi obtenu avec π ≈ 3,14 au lieu de la touche π). */
      readonly accept?: readonly Rational[];
      /** Réponse à arrondir à ce nombre de décimales : une valeur proche non arrondie reçoit un rappel. */
      readonly round?: number;
    }
  | { readonly kind: 'fraction'; readonly value: Rational }
  | { readonly kind: 'choice'; readonly options: readonly Rich[]; readonly correct: number }
  | { readonly kind: 'point'; readonly x: number; readonly y: number }
  /** Réponse écrite (clavier) : comparée sans tenir compte de la casse, des espaces doublés ni de l'apostrophe typographique. */
  | { readonly kind: 'text'; readonly accepted: readonly string[] };

export type Response =
  | { readonly kind: 'number'; readonly text: string }
  | { readonly kind: 'fraction'; readonly num: string; readonly den: string }
  | { readonly kind: 'choice'; readonly index: number }
  | { readonly kind: 'point'; readonly x: number; readonly y: number }
  | { readonly kind: 'text'; readonly text: string };

/** Erreur typique prévue : valeur fausse attendue et explication ciblée. */
export type Trap =
  | { readonly value: Rational; readonly why: Rich }
  | { readonly option: number; readonly why: Rich }
  | { readonly point: { x: number; y: number }; readonly why: Rich }
  | { readonly text: string; readonly why: Rich };

export interface Question {
  readonly skillId: string;
  readonly level: Level;
  readonly seed: number;
  readonly prompt: Rich;
  readonly figure?: Figure;
  readonly answer: AnswerSpec;
  readonly traps: readonly Trap[];
  /**
   * Explication pas à pas, sur le ton de Questy qui parle à l'enfant : ce qu'on cherche,
   * comment on s'y prend et pourquoi. Une bulle par étape ; la dernière donne la réponse en gras.
   */
  readonly steps: readonly Rich[];
  /** Indice pour le 2e essai : met sur la voie sans donner la réponse. */
  readonly hint: Rich;
  /** Animation montrée dans l'explication (ex. le nombre placé dans le tableau de conversion). */
  readonly demo?: Demo;
  /** Temps « confortable » en secondes (bonus de vitesse au-dessous). */
  readonly targetSeconds: number;
}

export type QuestionDraft = Omit<Question, 'skillId' | 'level' | 'seed' | 'traps' | 'targetSeconds'> & {
  readonly traps?: readonly Trap[];
  readonly targetSeconds?: number;
};

/** Conversion montrée dans le tableau : le nombre placé sous son unité, puis lu dans l'unité demandée. */
export interface Demo {
  readonly kind: 'conversion';
  readonly table: 'longueur' | 'aire' | 'volume' | 'masse';
  readonly value: Rational;
  readonly from: string;
  readonly to: string;
}

export interface Lesson {
  /** « Le truc à retenir » : 2-3 phrases courtes à hauteur d'enfant, avec un mini-exemple. */
  readonly memo: readonly Rich[];
  /** Référence : objectif du programme officiel et éventuelle source complémentaire. */
  readonly source: string;
}

/** Outils d'aide en plus du pavé, du brouillon et de la calculatrice (toujours là sauf `mental`). */
export type Tool = 'conversion-longueur' | 'conversion-aire' | 'conversion-volume' | 'conversion-masse';

/** Conseil donné par Questy au début de chaque question de la notion. */
export type Advice = 'calculatrice' | 'brouillon';

export interface Skill {
  readonly id: string;
  readonly title: string;
  readonly tools?: readonly Tool[];
  /**
   * Calcul visé : savoir calculer est l'objectif de la notion (tables, opérations, relatifs, fractions…),
   * donc pas de calculatrice. Ailleurs elle est toujours proposée : un calcul annexe (un carré, une
   * aire…) ne doit pas bloquer l'enfant.
   */
  readonly mental?: true;
  /** Conseil de Questy à la 1re question de la notion (aucun par défaut). */
  readonly advice?: Advice;
  readonly lesson: Lesson;
  readonly generate: (rng: Rng, level: Level) => QuestionDraft;
  /**
   * Version de la notion (1 par défaut). À incrémenter quand le générateur change les énoncés ou
   * les réponses : l'historique des réponses garde la version avec laquelle l'élève a répondu.
   */
  readonly version?: number;
}

/** Version d'une notion (1 si non précisée). */
export const skillVersion = (skill: Pick<Skill, 'version'> | undefined) => skill?.version ?? 1;

/** Domaines des programmes officiels (maths cycles 3 et 4). */
export const DOMAINS = {
  nombres: 'Nombres et calculs',
  grandeurs: 'Grandeurs et mesures',
  geometrie: 'Espace et géométrie',
  donnees: 'Données et probabilités',
  fonctions: 'Proportionnalité, fonctions',
  informatique: 'Pensée informatique',
} as const;
export type DomainId = keyof typeof DOMAINS;

/** Combat de boss d'un chapitre : 2 problèmes en contexte puis 1 piège (docs/SPEC.md §6.2 bis). */
export interface BossContent {
  readonly problems: readonly Skill[];
  readonly traps: readonly Skill[];
}

export interface Chapter {
  readonly id: string;
  readonly subject: SubjectId;
  readonly grade: Grade;
  readonly domain: DomainId;
  readonly title: string;
  readonly skills: readonly Skill[];
  /** Absent : boss « À venir ». */
  readonly boss?: BossContent;
}

export interface CheckResult {
  readonly correct: boolean;
  /** Saisie illisible (ex. « 3,,2 ») : on redemande sans compter d'erreur. */
  readonly invalid?: boolean;
  /** Explication de l'erreur typique reconnue, le cas échéant. */
  readonly why?: Rich;
}
