/**
 * Données du chapitre « Types et formes de phrases » (CM1) : faits cités et banques de phrases.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
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

/** Même idée dite de trois façons : déclarative, interrogative (est-ce que ou inversion), impérative. */
export interface Triplet {
  readonly declarative: string;
  readonly interrogative: string;
  readonly imperative: string;
}

export const TRIPLETS: readonly Triplet[] = [
  {
    declarative: 'Tu ranges ta chambre',
    interrogative: 'Est-ce que tu ranges ta chambre',
    imperative: 'Range ta chambre',
  },
  { declarative: 'Vous écoutez la radio', interrogative: 'Écoutez-vous la radio', imperative: 'Écoutez la radio' },
  { declarative: 'Tu lis cette histoire', interrogative: 'Lis-tu cette histoire', imperative: 'Lis cette histoire' },
  {
    declarative: 'Nous partons à huit heures',
    interrogative: 'Partons-nous à huit heures',
    imperative: 'Partons à huit heures',
  },
  { declarative: 'Tu prends ton manteau', interrogative: 'Prends-tu ton manteau', imperative: 'Prends ton manteau' },
  {
    declarative: 'Tu ouvres la fenêtre',
    interrogative: 'Est-ce que tu ouvres la fenêtre',
    imperative: 'Ouvre la fenêtre',
  },
];

/** Une question posée de trois façons. */
export interface Question3 {
  readonly declarative: string;
  readonly intonation: string;
  readonly estCeQue: string;
  readonly inversion: string;
}

export const QUESTIONS: readonly Question3[] = [
  { declarative: 'Tu viens', intonation: 'Tu viens', estCeQue: 'Est-ce que tu viens', inversion: 'Viens-tu' },
  { declarative: 'Il mange', intonation: 'Il mange', estCeQue: 'Est-ce qu’il mange', inversion: 'Mange-t-il' },
  {
    declarative: 'Vous partez',
    intonation: 'Vous partez',
    estCeQue: 'Est-ce que vous partez',
    inversion: 'Partez-vous',
  },
  {
    declarative: 'Elle chante',
    intonation: 'Elle chante',
    estCeQue: 'Est-ce qu’elle chante',
    inversion: 'Chante-t-elle',
  },
  {
    declarative: 'Tu aimes ce livre',
    intonation: 'Tu aimes ce livre',
    estCeQue: 'Est-ce que tu aimes ce livre',
    inversion: 'Aimes-tu ce livre',
  },
  {
    declarative: 'Ils jouent au ballon',
    intonation: 'Ils jouent au ballon',
    estCeQue: 'Est-ce qu’ils jouent au ballon',
    inversion: 'Jouent-ils au ballon',
  },
  {
    declarative: 'Nous commençons',
    intonation: 'Nous commençons',
    estCeQue: 'Est-ce que nous commençons',
    inversion: 'Commençons-nous',
  },
  {
    declarative: 'Elle finit son dessin',
    intonation: 'Elle finit son dessin',
    estCeQue: 'Est-ce qu’elle finit son dessin',
    inversion: 'Finit-elle son dessin',
  },
];

/** Phrase affirmative et ses formes négatives (ne… pas, ne… jamais, ne… plus). */
export interface Negation {
  readonly affirmative: string;
  readonly pas: string;
  readonly jamais: string;
  readonly plus: string;
}

export const NEGATIONS: readonly Negation[] = [
  {
    affirmative: 'Le chien dort',
    pas: 'Le chien ne dort pas',
    jamais: 'Le chien ne dort jamais',
    plus: 'Le chien ne dort plus',
  },
  {
    affirmative: 'Je joue au ballon',
    pas: 'Je ne joue pas au ballon',
    jamais: 'Je ne joue jamais au ballon',
    plus: 'Je ne joue plus au ballon',
  },
  {
    affirmative: 'Nous aimons les carottes',
    pas: 'Nous n’aimons pas les carottes',
    jamais: 'Nous n’aimons jamais les carottes',
    plus: 'Nous n’aimons plus les carottes',
  },
  {
    affirmative: 'Elle ouvre la fenêtre',
    pas: 'Elle n’ouvre pas la fenêtre',
    jamais: 'Elle n’ouvre jamais la fenêtre',
    plus: 'Elle n’ouvre plus la fenêtre',
  },
  {
    affirmative: 'Tu parles fort',
    pas: 'Tu ne parles pas fort',
    jamais: 'Tu ne parles jamais fort',
    plus: 'Tu ne parles plus fort',
  },
  {
    affirmative: 'Ils finissent leur travail',
    pas: 'Ils ne finissent pas leur travail',
    jamais: 'Ils ne finissent jamais leur travail',
    plus: 'Ils ne finissent plus leur travail',
  },
];

/** Lignes de texte pour le niveau 5 de la forme négative : (ligne, négative ?). */
export const LIGNES_NEGATION: readonly { readonly text: string; readonly negative: boolean }[] = [
  { text: 'Je ne vois plus le bateau.', negative: true },
  { text: 'Nous n’allons jamais au cinéma le lundi.', negative: true },
  { text: 'Il ne neige pas ici.', negative: true },
  { text: 'Ne cours pas dans le couloir !', negative: true },
  { text: 'Elle ne chante plus.', negative: true },
  { text: 'Le soleil brille.', negative: false },
  { text: 'Tu connais ce jeu.', negative: false },
  { text: 'Nous mangeons à midi.', negative: false },
  { text: 'Range ta chambre.', negative: false },
  { text: 'Les enfants jouent dans la cour.', negative: false },
];

/** Compléter une phrase exclamative : début manquant, réponses justes, et erreurs typiques avec leur raison. */
export interface Amorce {
  readonly rest: string;
  readonly accepted: readonly string[];
  readonly wrong: readonly { readonly text: string; readonly why: string }[];
}

export const AMORCES: readonly Amorce[] = [
  {
    rest: 'ce gâteau est bon !',
    accepted: ['Comme', 'Que'],
    wrong: [
      {
        text: 'Quel',
        why: '« Quel » accompagne un nom (Quel beau dessin !). Ici, le mot placé avant « ce gâteau est bon » ne s’accorde avec aucun nom.',
      },
      { text: 'Est-ce que', why: '« Est-ce que » sert à poser une question, pas à s’exclamer.' },
    ],
  },
  {
    rest: 'belle surprise !',
    accepted: ['Quelle'],
    wrong: [
      { text: 'Quel', why: '« Surprise » est un nom féminin : on écrit Quelle.' },
      {
        text: 'Comme',
        why: '« Comme » s’emploie avec un verbe ou un adjectif, ici le nom « surprise » demande Quelle.',
      },
    ],
  },
  {
    rest: 'beau dessin !',
    accepted: ['Quel'],
    wrong: [
      { text: 'Quelle', why: '« Dessin » est un nom masculin : on écrit Quel.' },
      { text: 'Comme', why: '« Comme » s’emploie avec un verbe ou un adjectif, ici le nom « dessin » demande Quel.' },
    ],
  },
  {
    rest: 'tu as grandi !',
    accepted: ['Comme', 'Que'],
    wrong: [
      { text: 'Quel', why: '« Quel » accompagne un nom, or il n’y a pas de nom ici.' },
      { text: 'Quelle', why: '« Quelle » accompagne un nom féminin, or il n’y a pas de nom ici.' },
    ],
  },
  {
    rest: 'chance tu as !',
    accepted: ['Quelle'],
    wrong: [
      { text: 'Quel', why: '« Chance » est un nom féminin : on écrit Quelle.' },
      { text: 'Comme', why: 'Devant le nom « chance », on écrit Quelle.' },
    ],
  },
  {
    rest: 'ce film est drôle !',
    accepted: ['Que', 'Comme'],
    wrong: [
      { text: 'Quel', why: '« Quel » accompagne un nom, mais ici le mot manquant se place devant « ce film ».' },
      { text: 'Est-ce que', why: '« Est-ce que » sert à poser une question, pas à s’exclamer.' },
    ],
  },
];
