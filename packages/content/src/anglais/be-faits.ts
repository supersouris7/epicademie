/**
 * Anglais CM1, « Be et possessifs » (lot an-cm1-02) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 24/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme du cycle 3 d'Éduscol).
 * La page « personal pronouns » du British Council refuse les robots : les pronoms sujets sont cités dans le
 * tableau « Subject / Object / Possessive adjective » de la page « Possessives: adjectives ».
 */
import type { Fait } from './presentation-faits.ts';

export type Pronoun = 'I' | 'you' | 'he' | 'she' | 'it' | 'we' | 'they';

export interface PronounRow {
  readonly en: Pronoun;
  /** Forme de be au présent. */
  readonly be: 'am' | 'are' | 'is';
  /** Forme courte (contraction). */
  readonly short: string;
  readonly poss: string;
  /** À qui sert ce pronom (français, pour les explications). */
  readonly usage: string;
}

export const PRONOUNS: readonly PronounRow[] = [
  { en: 'I', be: 'am', short: 'I’m', poss: 'my', usage: 'moi, celui ou celle qui parle' },
  { en: 'you', be: 'are', short: 'you’re', poss: 'your', usage: 'celui ou ceux à qui on parle (tu ou vous)' },
  { en: 'he', be: 'is', short: 'he’s', poss: 'his', usage: 'un garçon ou un homme' },
  { en: 'she', be: 'is', short: 'she’s', poss: 'her', usage: 'une fille ou une femme' },
  { en: 'it', be: 'is', short: 'it’s', poss: 'its', usage: 'une chose ou un animal (un seul)' },
  { en: 'we', be: 'are', short: 'we’re', poss: 'our', usage: 'moi et d’autres personnes' },
  { en: 'they', be: 'are', short: 'they’re', poss: 'their', usage: 'plusieurs personnes, animaux ou choses' },
];

export const rowOf = (p: Pronoun): PronounRow => {
  const row = PRONOUNS.find((x) => x.en === p);
  if (!row) throw new Error(`pronom inconnu : ${p}`);
  return row;
};

/** Début de phrase : majuscule. */
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Fins de phrase qui vont avec tous les pronoms. */
export const PREDICATES = ['happy', 'tired', 'ready', 'in the garden', 'at home'] as const;

/** Sujets (écrits pour l'exercice ; prénoms des personnages du British Council) et leur pronom. */
export interface Subject {
  readonly en: string;
  readonly pro: Pronoun;
}
export const SUBJECTS: readonly Subject[] = [
  { en: 'Ana', pro: 'she' },
  { en: 'Yuna', pro: 'she' },
  { en: 'Emir', pro: 'he' },
  { en: 'Paul', pro: 'he' },
  { en: 'the cat', pro: 'it' },
  { en: 'the book', pro: 'it' },
  { en: 'Ana and Emir', pro: 'they' },
  { en: 'Paul and Yuna', pro: 'they' },
  { en: 'Emir and I', pro: 'we' },
  { en: 'Ana and I', pro: 'we' },
];

/** Propriétaires pour les adjectifs possessifs : `fr` complète « appartient à … ». */
export interface Owner {
  readonly fr: string;
  readonly pro: Pronoun;
}
export const OWNERS: readonly Owner[] = [
  { fr: 'moi', pro: 'I' },
  { fr: 'toi', pro: 'you' },
  { fr: 'Emir', pro: 'he' },
  { fr: 'Ana', pro: 'she' },
  { fr: 'au chat', pro: 'it' },
  { fr: 'Emir et moi', pro: 'we' },
  { fr: 'Ana et Emir', pro: 'they' },
];

/** Objets possédés : mot anglais et mot français (avec son article). */
export const THINGS: readonly { readonly en: string; readonly fr: string }[] = [
  { en: 'house', fr: 'La maison' },
  { en: 'bag', fr: 'Le sac' },
  { en: 'room', fr: 'La chambre' },
  { en: 'bike', fr: 'Le vélo' },
  { en: 'dog', fr: 'Le chien' },
];

export const FAITS: readonly Fait[] = [
  {
    id: 'programme-grammaire',
    sourceId: 'cycle3-2020',
    quote:
      'Grammaire : contrôle limité de quelques structures et formes grammaticales simples appartenant à un répertoire mémorisé.',
    claim: 'Le programme demande de contrôler quelques formes grammaticales simples (be, pronoms, possessifs).',
  },
  {
    id: 'programme-questions',
    sourceId: 'cycle3-2020',
    quote: 'Poser des questions simples.',
    claim: 'Poser des questions simples est une compétence de « Réagir et dialoguer ».',
  },
  {
    id: 'programme-structures',
    sourceId: 'cycle3-2020',
    quote: 'Mobiliser des structures simples pour écrire des phrases en s’appuyant sur une trame connue.',
    claim: 'Écrire des phrases simples sur une trame connue (« I am … », « Is she … ? »).',
  },
  {
    id: 'be-present',
    sourceId: 'bc-verb-be',
    quote: "I am, I'm You are, You're He/She/It is, He/She/It's We are, we're You are, you're They are, they're",
    claim: 'be au présent : I am, you are, he/she/it is, we are, you are, they are ; formes courtes I’m, you’re, he’s…',
  },
  {
    id: 'be-question',
    sourceId: 'bc-verb-be',
    quote: 'Am I? Are you? Is he/she it? Are we? Are you? Are they?',
    claim: 'La question avec be place be avant le pronom : Am I ? Are you ? Is he ? Are we ? Are they ?',
  },
  {
    id: 'pronoms-sujets',
    sourceId: 'bc-possessives-adjectives',
    quote:
      'Subject Object Possessive adjective I me my you you your he him his she her her it it its we us our they them their',
    claim: 'Les pronoms sujets sont I, you, he, she, it, we, they.',
  },
  {
    id: 'possessifs',
    sourceId: 'bc-possessives-adjectives',
    quote: 'I me my you you your he him his she her her it it its we us our they them their',
    claim: 'Possessif de chaque pronom : my, your, his, her, its, our, their.',
  },
  {
    id: 'possessifs-emploi',
    sourceId: 'bc-possessives-adjectives',
    quote: "That's our house . My car is very old.",
    claim: 'Le possessif montre à qui appartient une chose et se place devant le nom.',
  },
  {
    id: 'possessifs-famille',
    sourceId: 'bc-possessives-adjectives',
    quote: 'My mother is a doctor. How old is your sister ?',
    claim: 'Le possessif s’emploie aussi pour la famille.',
  },
  {
    id: 'possessifs-corps',
    sourceId: 'bc-possessives-adjectives',
    quote: "He's broken his arm . She's washing her hair . I need to clean my teeth .",
    claim: 'Avec le corps, on emploie le possessif (his arm, her hair, my teeth) et pas « the ».',
  },
  {
    id: 'its-sans-apostrophe',
    sourceId: 'bc-possessives-adjectives',
    quote: "The possessive adjective its does not have an apostrophe ('): That bird has broken its ( NOT it's ) wing.",
    claim: '« its » (possessif) s’écrit sans apostrophe ; « it’s » veut dire « it is ».',
  },
  {
    id: 'its-it-is',
    sourceId: 'bc-possessives-adjectives',
    quote: "it's always means it is or it has",
    claim: '« it’s » veut toujours dire « it is » (ou « it has »).',
  },
  {
    id: 'inversion',
    sourceId: 'bc-question-forms',
    quote: 'I am late. Am I late? I can help. Can I help? She is sleeping. Is she sleeping?',
    claim: 'Pour poser la question, on place be avant le sujet : She is … → Is she … ?',
  },
  {
    id: 'mot-interrogatif',
    sourceId: 'bc-question-forms',
    quote: 'If there is a question word ( why , what , where , how , etc.), it goes before the verb.',
    claim: 'Le mot interrogatif se place avant le verbe : Why are you late ?',
  },
  {
    id: 'question-be-exemple',
    sourceId: 'bc-question-forms',
    quote: 'Are you late? Why are you late?',
    claim: 'Avec be, la question se pose sans « do » : Are you late ? Why are you late ?',
  },
];
