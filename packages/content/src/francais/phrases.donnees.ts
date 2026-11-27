/**
 * Données du chapitre « Types et formes de phrases » (CM1) : faits cités et banques de phrases.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Sens } from '../types.ts';

export interface Fait {
  readonly id: string;
  readonly source: string;
  readonly citation: string;
}

const PROGRAMME = 'francais-cycle3-2025';

export const FAITS: readonly Fait[] = [
  {
    id: 'types',
    source: PROGRAMME,
    citation: 'Identifier les trois types de phrases (déclaratif, interrogatif, impératif ou injonctif)',
  },
  {
    id: 'formes',
    source: PROGRAMME,
    citation: 'Identifier les principales formes de phrases (négative, exclamative)',
  },
  {
    id: 'vocabulaire',
    source: PROGRAMME,
    citation: 'types de phrases : déclaratives, interrogatives et impératives ; formes négative et exclamative',
  },
  {
    id: 'interroger',
    source: PROGRAMME,
    citation:
      'en employant le point d’interrogation et en utilisant diverses tournures ou intonations pour exprimer l’interrogation (inversion du sujet, est-ce que, intonation ascendante à l’oral, etc.)',
  },
  {
    id: 'transformer',
    source: PROGRAMME,
    citation: 'Transformer à l’oral puis à l’écrit des phrases d’un type à un autre, d’une forme à une autre',
  },
  {
    id: 'point-interrogation',
    source: 'cnrtl-interrogation',
    citation: "Interrogation contenue dans une phrase indépendante et qui se termine par un point d'interrogation",
  },
  {
    id: 'point-exclamation',
    source: 'cnrtl-exclamation',
    citation: "Signe de ponctuation dont on fait suivre l'exclamation",
  },
  {
    id: 'emotion',
    source: 'cnrtl-exclamation',
    citation: 'Cri exprimant une émotion vive',
  },
];

export const fait = (id: string): Fait => {
  const f = FAITS.find((x) => x.id === id);
  if (!f) throw new Error(`fait inconnu : ${id}`);
  return f;
};

/** Phrases sans signe final (le signe est ajouté selon le type). */
export const DECLARATIVES: readonly string[] = [
  'Le chat dort sur le canapé',
  'Mon frère range sa chambre',
  'Les oiseaux chantent le matin',
  'Nous mangeons à la cantine',
  'La maîtresse lit une histoire',
  'Il pleut depuis ce matin',
  'Ma sœur joue du piano',
  'Les élèves entrent en classe',
];

export const INTERROGATIVES: readonly string[] = [
  'Où as-tu rangé ton cahier',
  'Quand part le train',
  'Pourquoi le ciel est-il bleu',
  'Est-ce que tu aimes les pommes',
  'Qui a posé ce livre sur la table',
  'Combien coûte ce stylo',
  'Vas-tu au parc avec nous',
  'Que mange le chat',
];

export const IMPERATIVES: readonly string[] = [
  'Ferme la porte',
  'Écoute bien la consigne',
  'Prends ton cahier',
  'Lis la leçon à voix haute',
  'Sois à l’heure',
  'Range tes affaires',
];

export const EXCLAMATIVES: readonly string[] = [
  'Quel beau dessin',
  'Comme ce gâteau est bon',
  'Que ce paysage est magnifique',
  'Quelle belle surprise',
  'Comme tu as grandi',
  'Que ce film est drôle',
  'Quelle chance tu as',
];

/** Informations neutres : aucune ne porte d’émotion, le point est le seul signe attendu. */
export const INFORMATIONS: readonly string[] = [
  'La piscine ouvre à neuf heures',
  'Mon cahier est dans mon sac',
  'Le car part à huit heures',
  'La cantine ouvre à midi',
  'Mon frère a dix ans',
  'Le musée ferme le lundi',
  'Nous avons sport le jeudi',
  'La classe compte douze tables',
];

/** Phrases exclamatives dont l’ordre des mots est le seul possible. */
export const EXCLAMATIVES_A_RANGER: readonly string[] = [
  'Quel beau dessin',
  'Comme tu as grandi',
  'Quelle belle surprise',
  'Quelle chance tu as',
  'Comme tu chantes bien',
  'Quel joli jardin',
  'Que tu es rapide',
  'Quelle belle journée',
];

/** Questions qui commencent comme une exclamation (« Quel », « Que »…). */
export const FAUSSES_AMIES_QUESTIONS: readonly string[] = [
  'Quel âge as-tu',
  'Que fais-tu ce soir',
  'Quelle heure est-il',
  'Que cherches-tu',
  'Quel jour sommes-nous',
  'Quel livre préfères-tu',
];

/** Informations qui commencent par « Comme » pour donner une raison. */
export const FAUSSES_AMIES_RAISONS: readonly string[] = [
  'Comme il pleut, nous restons ici',
  'Comme il est tard, je rentre',
  'Comme il fait froid, je mets un bonnet',
  'Comme j’ai faim, je prends une pomme',
];

/** Informations à transformer en exclamation avec « Comme » (réponses justes, signe compris à part). */
export const A_EXCLAMER: readonly { readonly declarative: string; readonly accepted: readonly string[] }[] = [
  { declarative: 'Ce gâteau est bon', accepted: ['Comme ce gâteau est bon', 'Comme est bon ce gâteau'] },
  { declarative: 'Tu as grandi', accepted: ['Comme tu as grandi'] },
  { declarative: 'Ce film est drôle', accepted: ['Comme ce film est drôle', 'Comme est drôle ce film'] },
  { declarative: 'Tu chantes bien', accepted: ['Comme tu chantes bien'] },
  { declarative: 'Ce jardin est joli', accepted: ['Comme ce jardin est joli', 'Comme est joli ce jardin'] },
  { declarative: 'Il fait chaud', accepted: ['Comme il fait chaud'] },
  { declarative: 'Tu cours vite', accepted: ['Comme tu cours vite'] },
];

/** Même idée dite de trois façons : déclarative, interrogative (est-ce que ou inversion), impérative. */
export interface Triplet {
  readonly declarative: string;
  readonly interrogative: string;
  readonly imperative: string;
  /** Sujet de la phrase déclarative (il disparaît à l’impératif). */
  readonly sujet: string;
  /** Ce que devient le verbe dans l’ordre. */
  readonly verbe: string;
  /** Forme fautive fréquente (« s » gardé), s’il y en a une. */
  readonly faute?: string;
}

export const TRIPLETS: readonly Triplet[] = [
  {
    declarative: 'Tu ranges ta chambre',
    interrogative: 'Est-ce que tu ranges ta chambre',
    imperative: 'Range ta chambre',
    sujet: 'tu',
    verbe: 'Ici, « ranges » perd son « s » : « Range ».',
    faute: 'Ranges ta chambre',
  },
  {
    declarative: 'Vous écoutez la radio',
    interrogative: 'Écoutez-vous la radio',
    imperative: 'Écoutez la radio',
    sujet: 'vous',
    verbe: 'Ici, « écoutez » ne change pas.',
  },
  {
    declarative: 'Tu lis cette histoire',
    interrogative: 'Lis-tu cette histoire',
    imperative: 'Lis cette histoire',
    sujet: 'tu',
    verbe: 'Ici, « lis » garde son « s ».',
  },
  {
    declarative: 'Nous partons à huit heures',
    interrogative: 'Partons-nous à huit heures',
    imperative: 'Partons à huit heures',
    sujet: 'nous',
    verbe: 'Ici, « partons » ne change pas.',
  },
  {
    declarative: 'Tu prends ton manteau',
    interrogative: 'Prends-tu ton manteau',
    imperative: 'Prends ton manteau',
    sujet: 'tu',
    verbe: 'Ici, « prends » garde son « s ».',
  },
  {
    declarative: 'Tu ouvres la fenêtre',
    interrogative: 'Est-ce que tu ouvres la fenêtre',
    imperative: 'Ouvre la fenêtre',
    sujet: 'tu',
    verbe: 'Ici, « ouvres » perd son « s » : « Ouvre ».',
    faute: 'Ouvres la fenêtre',
  },
];

/** Une question posée de trois façons. */
export interface Question3 {
  readonly declarative: string;
  readonly intonation: string;
  readonly estCeQue: string;
  readonly inversion: string;
  readonly sujet: string;
  readonly verbe: string;
}

export const QUESTIONS: readonly Question3[] = [
  {
    declarative: 'Tu viens',
    sujet: 'tu',
    verbe: 'viens',
    intonation: 'Tu viens',
    estCeQue: 'Est-ce que tu viens',
    inversion: 'Viens-tu',
  },
  {
    declarative: 'Il mange',
    sujet: 'il',
    verbe: 'mange',
    intonation: 'Il mange',
    estCeQue: 'Est-ce qu’il mange',
    inversion: 'Mange-t-il',
  },
  {
    declarative: 'Vous partez',
    sujet: 'vous',
    verbe: 'partez',
    intonation: 'Vous partez',
    estCeQue: 'Est-ce que vous partez',
    inversion: 'Partez-vous',
  },
  {
    declarative: 'Elle chante',
    sujet: 'elle',
    verbe: 'chante',
    intonation: 'Elle chante',
    estCeQue: 'Est-ce qu’elle chante',
    inversion: 'Chante-t-elle',
  },
  {
    declarative: 'Tu aimes ce livre',
    sujet: 'tu',
    verbe: 'aimes',
    intonation: 'Tu aimes ce livre',
    estCeQue: 'Est-ce que tu aimes ce livre',
    inversion: 'Aimes-tu ce livre',
  },
  {
    declarative: 'Ils jouent au ballon',
    sujet: 'ils',
    verbe: 'jouent',
    intonation: 'Ils jouent au ballon',
    estCeQue: 'Est-ce qu’ils jouent au ballon',
    inversion: 'Jouent-ils au ballon',
  },
  {
    declarative: 'Nous commençons',
    sujet: 'nous',
    verbe: 'commençons',
    intonation: 'Nous commençons',
    estCeQue: 'Est-ce que nous commençons',
    inversion: 'Commençons-nous',
  },
  {
    declarative: 'Elle finit son dessin',
    sujet: 'elle',
    verbe: 'finit',
    intonation: 'Elle finit son dessin',
    estCeQue: 'Est-ce qu’elle finit son dessin',
    inversion: 'Finit-elle son dessin',
  },
];

/** Phrase affirmative et ses formes négatives (ne… pas, ne… jamais, ne… plus). */
export interface Negation {
  readonly affirmative: string;
  readonly verbe: string;
  readonly pas: string;
  readonly jamais: string;
  readonly plus: string;
}

export const NEGATIONS: readonly Negation[] = [
  {
    affirmative: 'Le chien dort',
    verbe: 'dort',
    pas: 'Le chien ne dort pas',
    jamais: 'Le chien ne dort jamais',
    plus: 'Le chien ne dort plus',
  },
  {
    affirmative: 'Je joue au ballon',
    verbe: 'joue',
    pas: 'Je ne joue pas au ballon',
    jamais: 'Je ne joue jamais au ballon',
    plus: 'Je ne joue plus au ballon',
  },
  {
    affirmative: 'Nous aimons les carottes',
    verbe: 'aimons',
    pas: 'Nous n’aimons pas les carottes',
    jamais: 'Nous n’aimons jamais les carottes',
    plus: 'Nous n’aimons plus les carottes',
  },
  {
    affirmative: 'Elle ouvre la fenêtre',
    verbe: 'ouvre',
    pas: 'Elle n’ouvre pas la fenêtre',
    jamais: 'Elle n’ouvre jamais la fenêtre',
    plus: 'Elle n’ouvre plus la fenêtre',
  },
  {
    affirmative: 'Tu parles anglais',
    verbe: 'parles',
    pas: 'Tu ne parles pas anglais',
    jamais: 'Tu ne parles jamais anglais',
    plus: 'Tu ne parles plus anglais',
  },
  {
    affirmative: 'Ils finissent leur travail',
    verbe: 'finissent',
    pas: 'Ils ne finissent pas leur travail',
    jamais: 'Ils ne finissent jamais leur travail',
    plus: 'Ils ne finissent plus leur travail',
  },
];

/**
 * « Sens » de chaque notion (README §9) : une phrase montrée à l’enfant et le passage exact qui l’appuie.
 */
export const SENS = {
  types: {
    type: 'usage',
    text: 'Reconnaître le type d’une phrase t’aide à comprendre son effet dans un texte.',
    source: PROGRAMME,
    citation:
      'Identifier les trois types de phrases (déclaratif, interrogatif, impératif ou injonctif) et comprendre leurs effets dans un texte simple',
  },
  question: {
    type: 'histoire',
    text: 'En 1550, un livre de grammaire parlait déjà du point d’interrogation.',
    source: 'cnrtl-interrogation',
    citation: "1550 gramm. interrogacion, point d'interrogacion (L. Meigret, Tretté de la gramm. fr.",
  },
  negation: {
    type: 'savais-tu',
    text: 'Dans « ne… pas », « pas » vient d’un nom ajouté à « ne » pour le renforcer.',
    source: 'cnrtl-ne',
    citation:
      'Négation ne renforcée par des subst.: ne ... gout(t)e*, ne ... mie*, ne ... mot*, ne ... nient (néant*), ne ... pas*, ne ... point*, ne ... rien*; ces groupes destinés à renforcer la négation totale',
  },
  exclamative: {
    type: 'savais-tu',
    text: 'Le point d’exclamation s’est aussi appelé « point d’admiration ».',
    source: 'cnrtl-exclamation',
    citation: "Synon. vieilli point admiratif (Ac. 1798), point d'admiration (Ac. 1835, 1878)",
  },
  ponctuation: {
    type: 'usage',
    text: 'Quand tu lis à voix haute, tu tiens compte de la ponctuation.',
    source: PROGRAMME,
    citation:
      'Lire à voix haute un texte court, après préparation, sans confondre les graphèmes, même complexes et en tenant compte des marques de ponctuation',
  },
} as const satisfies Record<string, Sens>;
