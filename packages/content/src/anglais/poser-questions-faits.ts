/**
 * Anglais CM2, « Poser des questions » (lot an-cm2-05) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme du cycle 3).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme : le cycle 3 demande de poser des questions simples et d'y répondre. « who, what, where, when »,
 * « how old, how many » et « Can you…? » n'y sont pas nommés : ce sont les moyens anglais de cette compétence.
 * Les personnages, messages et situations des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });

/** Les quatre mots interrogatifs de la notion, dans l'ordre : personne, chose, lieu, moment. */
export const WH_WORDS: readonly {
  readonly en: 'Who' | 'What' | 'Where' | 'When';
  /** Sens en français. */
  readonly fr: string;
  /** Ce que la question demande. */
  readonly asks: string;
}[] = [
  { en: 'Who', fr: 'qui', asks: 'une personne' },
  { en: 'What', fr: 'quoi (ou quel)', asks: 'une chose' },
  { en: 'Where', fr: 'où', asks: 'un lieu' },
  { en: 'When', fr: 'quand', asks: 'un moment' },
];

export const FAITS: readonly Fait[] = [
  fait('programme-questions', 'cycle3-2020', 'Poser des questions simples.', 'Poser des questions est au programme.'),
  fait(
    'programme-repondre',
    'cycle3-2020',
    'Répondre à des questions simples et en poser pour poursuivre / relancer la conversation.',
    'Répondre à des questions et en poser est au programme.',
  ),
  fait(
    'programme-modeles',
    'cycle3-2020',
    "L'élève peut répondre à des questions dans un premier temps, puis il peut en poser grâce à des modèles.",
    'Au niveau A1, on répond puis on pose des questions avec des modèles.',
  ),
  fait(
    'wh-liste',
    'bc-questions-negatives',
    'Wh-questions are questions which start with a word like what, when, where, which, who, whose, why and how.',
    'who, what, where, when et how ouvrent des questions.',
  ),
  fait(
    'wh-where',
    'bc-questions-negatives',
    'Where are they working?',
    '« Where » demande un lieu (They are working in a shop).',
  ),
  fait(
    'wh-when',
    'bc-questions-negatives',
    'When did they arrive?',
    '« When » demande un moment (They arrived at six).',
  ),
  fait(
    'wh-who',
    'bc-questions-negatives',
    'Who is he seeing tomorrow?',
    '« Who » demande une personne (He is seeing Joe tomorrow).',
  ),
  fait(
    'wh-what',
    'bc-questions-negatives',
    'What do you want for your birthday?',
    '« What » demande une chose (I want a computer for my birthday).',
  ),
  fait(
    'wh-do',
    'bc-present-simple',
    'Where do Angela and Rita live? What does Angela do? When does Rita usually get up?',
    'Avec where, what, when, la question au présent prend do ou does.',
  ),
  fait(
    'wh-who-sans-do',
    'bc-present-simple',
    "But questions with who often don't use do or does: Who lives in London?",
    '« Who » sujet : pas de do.',
  ),
  fait(
    'mot-avant-verbe',
    'bc-question-forms',
    'If there is a question word (why, what, where, how, etc.), it goes before the verb.',
    'Le mot interrogatif se place au début, avant le verbe.',
  ),
  fait('how-old', 'bc-questions-negatives', 'How old are you?', '« How old » demande l’âge.'),
  fait(
    'how-many',
    'bc-questions-negatives',
    'How many people came to the meeting?',
    '« How many » demande un nombre ; le nom qui suit est au pluriel (people).',
  ),
  fait(
    'how-many-nombre',
    'bc-quantifiers',
    'We use quantifiers when we want to give someone information about the number of something: how much or how many.',
    '« How many » porte sur un nombre.',
  ),
  fait(
    'many-comptables',
    'bc-quantifiers',
    'Some quantifiers can be used only with count nouns:',
    '« many » va avec les noms qu’on peut compter.',
  ),
  fait(
    'have-got-question',
    'bck-have-got',
    'For questions, change the order of have or has and the person.',
    'Question : How many pens have you got?',
  ),
  fait(
    'nombres',
    'bck-flashcards-1-12',
    'two three four five six seven eight nine ten eleven twelve',
    'Les nombres en lettres, de 2 à 12 (cartes « Numbers flashcards 1-12 »).',
  ),
  fait('do-question', 'bck-like', 'Do you like bananas? Yes, I do.', 'Question avec do ; réponse courte avec do.'),
  fait(
    'do-personnes',
    'bck-like',
    'Make questions with do for I, you, we and they and with does for he, she and it.',
    'do avec I, you, we, they ; does avec he, she, it.',
  ),
  fait(
    'do-reponses',
    'bc-present-simple-a1',
    "Yes, I/you/we/they do, Yes, he/she/it does, or No, I/you/we/they don't",
    'Réponses courtes : Yes, I do. No, I don’t.',
  ),
  fait(
    'do-exemples',
    'bc-present-simple',
    'Do you play the piano? Where do you live?',
    '« Do you play…? » et « Where do you live? ».',
  ),
  fait(
    'can-question',
    'bck-can',
    'For questions, change the order of can and the person.',
    'Question : Can passe devant la personne.',
  ),
  fait('can-oui', 'bck-can', 'Can you swim? Yes, I can.', 'Réponse courte : Yes, I can.'),
  fait('can-non', 'bck-can', "Can she play the piano? No, she can't.", 'Réponse courte : No, she can’t.'),
  fait(
    'can-infinitif',
    'bck-can',
    "Use the infinitive without to after can and can't.",
    'Après can : le verbe sans to.',
  ),
  fait('can-parler', 'bck-can', 'They can speak English.', 'speak English = parler anglais.'),
  fait('can-velo', 'bck-can', "He can't ride a bike.", 'ride a bike = faire du vélo.'),
  fait('can-courir', 'bck-can', 'You can run fast.', 'run fast = courir vite.'),
  fait('can-guitare', 'bck-can', "They can't play the guitar.", 'play the guitar = jouer de la guitare.'),
  fait('can-piano', 'bck-can', "Can she play the piano? No, she can't.", 'play the piano = jouer du piano.'),
  fait('can-danser', 'bc-can-could', "They can't dance very well.", 'dance = danser.'),
];
