/**
 * Anglais CM1, « Se présenter et saluer » (lot an-cm1-01) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 24/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme du cycle 3 d'Éduscol).
 */

export interface Fait {
  readonly id: string;
  readonly sourceId: string;
  /** Citation exacte du texte source. */
  readonly quote: string;
  /** Ce que le fait établit pour la notion. */
  readonly claim: string;
}

export type Role = 'saluer' | 'rencontre' | 'repondre' | 'conge';

export interface Phrase {
  readonly role: Role;
  readonly en: string;
  readonly fr: string;
  /** Situation donnée à l'élève (français, tutoiement). */
  readonly situation: string;
  /** Écritures acceptées en saisie. */
  readonly accepted: readonly string[];
}

export const PHRASES: Readonly<Record<Role, Phrase>> = {
  saluer: {
    role: 'saluer',
    en: 'Hello!',
    fr: 'bonjour',
    situation: 'Tu arrives en classe et tu dis bonjour à un copain.',
    accepted: ['Hello', 'Hello!', 'Hello.', 'Hi', 'Hi!', 'Hi.'],
  },
  rencontre: {
    role: 'rencontre',
    en: 'Nice to meet you.',
    fr: 'enchanté(e)',
    situation: 'Tu viens de rencontrer quelqu’un et tu es content de faire sa connaissance.',
    accepted: ['Nice to meet you', 'Nice to meet you.', 'Nice to meet you!'],
  },
  repondre: {
    role: 'repondre',
    en: 'You too.',
    fr: 'moi aussi',
    situation: 'Quelqu’un te dit « Nice to meet you. ». Tu réponds « moi aussi ».',
    accepted: ['You too', 'You too.', 'You too!'],
  },
  conge: {
    role: 'conge',
    en: 'Bye for now!',
    fr: 'au revoir',
    situation: 'Tu pars : tu dis au revoir à ton copain.',
    accepted: ['Bye for now', 'Bye for now!', 'Bye for now.'],
  },
};

export const ROLES: readonly Role[] = ['saluer', 'rencontre', 'repondre', 'conge'];

export const QUESTIONS = {
  name: { en: 'What’s your name?', asks: 'le prénom' },
  age: { en: 'How old are you?', asks: 'l’âge' },
  live: { en: 'Where do you live?', asks: 'le lieu où on habite' },
} as const;

/** Prénoms des personnages de la vidéo du British Council (aucun prénom d'élève réel). */
export const NAMES = ['Ana', 'Emir', 'Yuna', 'Vanya', 'Paul'] as const;

/** Villes citées dans la transcription « Talking about where you’re from ». */
export const CITIES = ['Glasgow', 'Istanbul', 'London', 'Cambridge'] as const;

/** Âges possibles d'un élève de cycle 3, avec un nombre cité par les cartes du British Council (6 à 12). */
export const AGES = [7, 8, 9, 10, 11, 12] as const;

/** Mots-nombres cités par le British Council (cartes 1-12, 13-24, fiche 10-100). */
const WORDS: Readonly<Record<number, string>> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
  21: 'twenty-one',
  22: 'twenty-two',
  23: 'twenty-three',
  24: 'twenty-four',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
};

/**
 * Mot d'un nombre : cité tel quel jusqu'à 24 et pour les dizaines ; 25 à 29 et 31 suivent la même règle
 * que « twenty-one » à « twenty-four » (dizaine, tiret, unité).
 */
export function wordOf(n: number): string | undefined {
  const cited = WORDS[n];
  if (cited) return cited;
  if (n >= 25 && n <= 29) return `twenty-${WORDS[n - 20]}`;
  if (n === 31) return 'thirty-one';
  return undefined;
}

/** Variantes d'écriture d'un mot-nombre composé (tiret ou espace). */
export const spellings = (word: string): string[] => (word.includes('-') ? [word, word.replace('-', ' ')] : [word]);

const unitsFact = (sourceId: string, from: number, to: number, quote: string): Fait[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i).map((n) => ({
    id: `nombre-${n}`,
    sourceId,
    quote,
    claim: `${n} s’écrit « ${WORDS[n]} »`,
  }));

export const FAITS: readonly Fait[] = [
  {
    id: 'programme-contact-social',
    sourceId: 'cycle3-2020',
    quote: 'Établir un contact social (saluer, se présenter, présenter quelqu’un, etc.)',
    claim: 'Saluer et se présenter font partie du programme (Réagir et dialoguer, cycle 3).',
  },
  {
    id: 'saluer-hello-hi',
    sourceId: 'bc-meeting-new-people',
    quote: 'Vanya: Hi. Emir: Hello.',
    claim: '« Hello » et « Hi » servent à saluer.',
  },
  {
    id: 'rencontre-nice-to-meet-you',
    sourceId: 'bc-meeting-new-people',
    quote: "Oh, hi, I'm Yuna. Nice to meet you.",
    claim: '« Nice to meet you » se dit en rencontrant quelqu’un.',
  },
  {
    id: 'repondre-you-too',
    sourceId: 'bc-meeting-new-people',
    quote: 'Nice to meet you. Emir: You too.',
    claim: '« You too » répond à « Nice to meet you ».',
  },
  {
    id: 'conge-bye-for-now',
    sourceId: 'bc-meeting-new-people',
    quote: 'Try and use some of these phrases the next time you meet new people in English. Bye for now!',
    claim: '« Bye for now! » se dit pour prendre congé.',
  },
  {
    id: 'je-suis-im',
    sourceId: 'bc-meeting-new-people',
    quote: "Hi, I'm Yuna.",
    claim: 'On se présente avec « I’m » + prénom.',
  },
  {
    id: 'mot-interrogatif-avant-verbe',
    sourceId: 'bc-question-forms',
    quote: 'If there is a question word (why, what, where, how, etc.), it goes before the verb.',
    claim: 'Le mot interrogatif (what, where, how) ouvre la question.',
  },
  {
    id: 'contraction-is',
    sourceId: 'bc-verb-be',
    quote: "He/She/It is, He/She/It's",
    claim: '« ’s » est la contraction de « is » (What’s = What is).',
  },
  {
    id: 'possessif-your',
    sourceId: 'bc-possessives-adjectives',
    quote: 'you you your',
    claim: 'Le possessif de « you » est « your » (« What’s your name? »).',
  },
  {
    id: 'how-old',
    sourceId: 'bc-possessives-adjectives',
    quote: 'How old is your sister',
    claim: 'On demande l’âge avec « How old ».',
  },
  {
    id: 'be-am-im',
    sourceId: 'bc-verb-be',
    quote: "I am, I'm You are, You're",
    claim: 'On donne son âge avec be : « I’m nine ».',
  },
  {
    id: 'where-do-you-work',
    sourceId: 'bc-question-forms',
    quote: 'You work at home. Do you work at home? Where do you work ?',
    claim: '« Where do you … ? » : mot interrogatif + do + you + verbe (work → live).',
  },
  {
    id: 'do-auxiliaire',
    sourceId: 'bc-question-forms',
    quote: 'we use the auxiliary verb do / does in the question',
    claim: 'Au présent simple, la question prend « do ».',
  },
  {
    id: 'live-in',
    sourceId: 'bc-where-from',
    quote: 'I live in Glasgow now.',
    claim: 'On dit où on habite avec « I live in » + ville.',
  },
  {
    id: 'where-from',
    sourceId: 'bc-where-from',
    quote: 'Where are you from?',
    claim: '« Where are you from? » demande d’où on vient, pas où on habite.',
  },
  {
    id: 'from-city',
    sourceId: 'bc-where-from',
    quote: "I'm from Istanbul.",
    claim: '« I’m from » + ville : d’où l’on vient.',
  },
  ...unitsFact('bck-flashcards-1-12', 1, 12, 'cartes « Numbers flashcards 1-12 » : one … twelve'),
  ...unitsFact('bck-flashcards-13-24', 13, 24, 'cartes « Numbers flashcards 13-24 » : thirteen … twenty-four'),
  {
    id: 'nombre-30',
    sourceId: 'bck-worksheet-10-100',
    quote: 'twenty thirty forty fifty',
    claim: '30 s’écrit « thirty » ; les dizaines : twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety.',
  },
  {
    id: 'nombres-25-31',
    sourceId: 'bck-flashcards-13-24',
    quote: 'twenty-one twenty-two twenty-three twenty-four',
    claim: '25 à 29 et 31 suivent la même règle : dizaine, tiret, unité (twenty-five, thirty-one).',
  },
];
