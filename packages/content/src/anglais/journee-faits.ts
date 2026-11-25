/**
 * Anglais CM2, « La journée » (lot an-cm2-03) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages et de la fiche du British Council ; programme du
 * cycle 3). Les espaces et retours à la ligne sont réduits à une espace.
 * La règle « bck-adverbs-frequency-rule » est celle de la version de 2019 de la page (copie d'archive
 * 20191230121612) : la version actuelle ne contient plus l'exemple cité.
 *
 * Programme : le présent, les horaires et la vie quotidienne relèvent du cycle 3. « always, sometimes, never » n'y
 * sont pas nommés : ce sont des mots d'un répertoire simple pour parler de sa vie quotidienne.
 */
import type { Fait } from './presentation-faits.ts';
import type { Word } from './temps-faits.ts';

// ——— Présent simple (I, you) ———
export interface Action {
  /** Base verbale anglaise. */
  readonly verb: string;
  readonly alt: readonly string[];
  readonly s: string;
  readonly ing: string;
  readonly rest: string;
  /** « jouer au foot » */
  readonly fr: string;
  /** « Je joue au foot. » */
  readonly i: string;
  /** « Je ne joue pas au foot. » */
  readonly iNot: string;
}
const act = (
  [verb, s, ing]: readonly [string, string, string],
  rest: string,
  [fr, i, iNot]: readonly [string, string, string],
  alt: readonly string[] = [],
): Action => ({ verb, alt, s, ing, rest, fr, i, iNot });
const PLAY = ['play', 'plays', 'playing'] as const;
const LIKE = ['like', 'likes', 'liking'] as const;

export const ACTIONS: readonly Action[] = [
  act(PLAY, 'football', ['jouer au foot', 'Je joue au foot.', 'Je ne joue pas au foot.']),
  act(PLAY, 'the piano', ['jouer du piano', 'Je joue du piano.', 'Je ne joue pas de piano.']),
  act(LIKE, 'pizza', ['aimer la pizza', 'J’aime la pizza.', 'Je n’aime pas la pizza.'], ['love']),
  act(LIKE, 'cats', ['aimer les chats', 'J’aime les chats.', 'Je n’aime pas les chats.'], ['love']),
  act(['live', 'lives', 'living'], 'in London', [
    'habiter à Londres',
    'J’habite à Londres.',
    'Je n’habite pas à Londres.',
  ]),
  act(['watch', 'watches', 'watching'], 'TV', [
    'regarder la télé',
    'Je regarde la télé.',
    'Je ne regarde pas la télé.',
  ]),
  act(['read', 'reads', 'reading'], 'comics', ['lire des BD', 'Je lis des BD.', 'Je ne lis pas de BD.']),
  act(['drink', 'drinks', 'drinking'], 'milk', ['boire du lait', 'Je bois du lait.', 'Je ne bois pas de lait.']),
  act(['sing', 'sings', 'singing'], 'songs', [
    'chanter des chansons',
    'Je chante des chansons.',
    'Je ne chante pas de chansons.',
  ]),
];

/** Actions qu'on peut faire plus ou moins souvent, avec la phrase française pour chaque adverbe. */
export interface Habit extends Action {
  readonly french: Readonly<Record<'always' | 'sometimes' | 'never', string>>;
}
const habit = (verb: string, rest: string, always: string, sometimes: string, never: string): Habit => {
  const a = ACTIONS.find((x) => x.verb === verb && x.rest === rest);
  if (!a) throw new Error(`action inconnue : ${verb} ${rest}`);
  return { ...a, french: { always, sometimes, never } };
};

export const HABITS: readonly Habit[] = [
  habit('play', 'football', 'Je joue toujours au foot.', 'Je joue parfois au foot.', 'Je ne joue jamais au foot.'),
  habit('play', 'the piano', 'Je joue toujours du piano.', 'Je joue parfois du piano.', 'Je ne joue jamais de piano.'),
  habit('watch', 'TV', 'Je regarde toujours la télé.', 'Je regarde parfois la télé.', 'Je ne regarde jamais la télé.'),
  habit('read', 'comics', 'Je lis toujours des BD.', 'Je lis parfois des BD.', 'Je ne lis jamais de BD.'),
  habit('drink', 'milk', 'Je bois toujours du lait.', 'Je bois parfois du lait.', 'Je ne bois jamais de lait.'),
  habit(
    'sing',
    'songs',
    'Je chante toujours des chansons.',
    'Je chante parfois des chansons.',
    'Je ne chante jamais de chansons.',
  ),
];

// ——— La routine ———
export interface Routine extends Word {
  /** « Je me lève. » */
  readonly i: string;
  /** Phrase à un mot manquant : début, fin, mots justes, erreur typique et son explication. */
  readonly gap: {
    readonly before: string;
    readonly after: string;
    readonly words: readonly string[];
    readonly trap: string;
    readonly why: string;
  };
}
const routine = (
  [en, fr, i, typo]: readonly [string, string, string, string],
  alt: readonly string[],
  [before, after, words, trap, why]: readonly [string, string, readonly string[], string, string],
): Routine => ({ en, fr, i, typo, alt, gap: { before, after, words, trap, why } });

/** Les douze cartes « Daily routines », dans l'ordre de la fiche (qui est celui d'une journée d'école). */
export const ROUTINES: readonly Routine[] = [
  routine(
    ['wake up', 'se réveiller', 'Je me réveille.', 'wake op'],
    [],
    ['I', 'up.', ['wake'], 'get', '« get up », c’est se lever. Se réveiller, c’est « wake up ».'],
  ),
  routine(
    ['get up', 'se lever', 'Je me lève.', 'get op'],
    [],
    ['I', 'up.', ['get'], 'wake', '« wake up », c’est se réveiller. Se lever, c’est « get up ».'],
  ),
  routine(
    ['have a shower', 'prendre une douche', 'Je prends une douche.', 'have a shouer'],
    ['take a shower'],
    ['I', 'a shower.', ['have', 'take'], 'do', 'On ne dit pas « do a shower » : on dit « have a shower ».'],
  ),
  routine(
    ['get dressed', 's’habiller', 'Je m’habille.', 'get dresed'],
    [],
    ['I get', '.', ['dressed'], 'dress', 'Après « get », le mot finit par -ed : « get dressed ».'],
  ),
  routine(
    ['have breakfast', 'prendre le petit déjeuner', 'Je prends le petit déjeuner.', 'have brekfast'],
    ['eat breakfast'],
    ['I have', '.', ['breakfast'], 'lunch', '« lunch » est le repas de midi. Le matin, c’est « breakfast ».'],
  ),
  routine(
    ['clean my teeth', 'se brosser les dents', 'Je me brosse les dents.', 'clean my teath'],
    ['brush my teeth', 'clean your teeth', 'brush your teeth'],
    ['I clean my', '.', ['teeth'], 'tooth', '« tooth » veut dire une seule dent. Plusieurs dents : « teeth ».'],
  ),
  routine(
    ['go to school', 'aller à l’école', 'Je vais à l’école.', 'go to scool'],
    [],
    ['I go', 'school.', ['to'], 'at', '« at » dit où l’on est. Pour aller vers l’école : « go to school ».'],
  ),
  routine(
    ['have lunch', 'déjeuner à midi', 'Je prends le repas de midi.', 'have lonch'],
    ['eat lunch'],
    ['I', 'lunch.', ['have', 'eat'], 'do', 'On ne dit pas « do lunch » ici : on dit « have lunch ».'],
  ),
  routine(
    ['go home', 'rentrer à la maison', 'Je rentre à la maison.', 'go hom'],
    ['go back home', 'come home', 'come back home', 'get home'],
    ['I go', '.', ['home', 'back home'], 'to home', 'Devant « home », pas de « to » : on dit « go home ».'],
  ),
  routine(
    ['do homework', 'faire ses devoirs', 'Je fais mes devoirs.', 'do homwork'],
    ['do my homework', 'do your homework'],
    ['I', 'my homework.', ['do'], 'make', 'Pour les devoirs, on utilise « do », pas « make ».'],
  ),
  routine(
    ['have dinner', 'dîner', 'Je dîne.', 'have diner'],
    ['eat dinner'],
    ['I have', '.', ['dinner'], 'diner', 'Presque ! « dinner » s’écrit avec deux n.'],
  ),
  routine(
    ['go to bed', 'aller se coucher', 'Je vais me coucher.', 'go to bad'],
    [],
    ['I go to', '.', ['bed'], 'the bed', 'On dit « go to bed », sans « the ».'],
  ),
];

/** Étapes dont l'ordre dans une journée d'école ne se discute pas (les autres peuvent changer de place). */
export const DAY_CHAIN: readonly string[] = [
  'wake up',
  'get up',
  'have breakfast',
  'go to school',
  'have lunch',
  'go home',
  'have dinner',
  'go to bed',
];

// ——— always, sometimes, never ———
export const ADVERBS = [
  { en: 'always', fr: 'toujours', meaning: 'à chaque fois' },
  { en: 'sometimes', fr: 'parfois', meaning: 'un petit nombre de fois' },
  { en: 'never', fr: 'jamais', meaning: 'aucune fois' },
] as const;

// ——— Citations ———
const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const card = (r: Routine): Fait =>
  fait(`routine-${r.en.replaceAll(' ', '-')}`, 'bck-flashcards-daily-routines', r.en, `« ${r.en} » = ${r.fr}.`);

export const FAITS: readonly Fait[] = [
  fait(
    'programme-present',
    'cycle3-2020',
    "Le verbe : son accord avec le sujet ; l'expression du temps : présent, passé, futur",
    'Le programme du cycle 3 fait exprimer le présent.',
  ),
  fait(
    'programme-quotidien',
    'cycle3-2020',
    'pour des informations sur la personne, les besoins quotidiens, son environnement',
    'Le programme du cycle 3 fait parler de la vie quotidienne.',
  ),
  fait(
    'programme-horaire',
    'cycle3-2020',
    'Dialoguer pour échanger / obtenir des renseignements (itinéraire, horaire, prix, etc.).',
    'Le programme du cycle 3 fait demander et donner un horaire.',
  ),
  fait(
    'present-base',
    'bc-present-simple',
    'The present tense is the base form of the verb: I work in London.',
    'Avec I, le verbe garde sa base.',
  ),
  fait(
    'present-troisieme',
    'bc-present-simple',
    'But with the third person singular (she/he/it), we add an –s',
    'Le -s est réservé à he, she, it.',
  ),
  fait(
    'present-habitude',
    'bc-present-simple',
    'something that happens regularly in the present: I play football every weekend.',
    'Le présent simple dit une habitude.',
  ),
  fait(
    'present-negation',
    'bc-present-simple',
    "I like tennis but I don't like football. (don't = do not)",
    'Négation avec I : don’t + base.',
  ),
  fait('present-question', 'bc-present-simple-a1', 'For questions, we use do or does.', 'Question avec you : Do you…?'),
  fait(
    'present-you',
    'bc-present-simple-a1',
    "You go to the gym.You don't go to the gym.Do you go to the gym?",
    'Avec you : base, don’t + base, Do you + base.',
  ),
  fait(
    'present-reponses',
    'bc-present-simple-a1',
    "Yes, I/you/we/they do, Yes, he/she/it does, or No, I/you/we/they don't",
    'Réponses courtes : Yes, I do. No, I don’t.',
  ),
  fait('heure-question', 'bck-tell-time', "What time is it? I'm hungry!", 'Pour demander l’heure : What time is it?'),
  fait(
    'heure-o-clock',
    'bck-tell-time',
    "When the big hand is pointing to the twelve, we say it's o'clock.",
    'Heure pile : o’clock.',
  ),
  fait(
    'heure-quarter-past',
    'bck-tell-time',
    "When the big hand is pointing to the three, we say it's quarter past.",
    'quarter past = et quart.',
  ),
  fait(
    'heure-half-past',
    'bck-tell-time',
    "When the big hand is pointing to the six, we say it's half past.",
    'half past = et demie.',
  ),
  fait(
    'heure-quarter-to',
    'bck-tell-time',
    "And, finally, when the big hand is on the nine, we say it's quarter to.",
    'quarter to = moins le quart.',
  ),
  fait(
    'heure-cinq-minutes',
    'bck-tell-time',
    "Well, we count the minutes in fives. So, now it's five past six, it's ten past six, it's quarter past six",
    'Avant la demie : minutes + past + heure.',
  ),
  fait(
    'heure-to',
    'bck-tell-time',
    "After half past, it changes. Then we count how many minutes there are before the next hour. It's twenty-five to seven, it's twenty to seven",
    'Après la demie : minutes qui restent + to + heure suivante.',
  ),
  fait(
    'heure-at',
    'bck-prepositions-time',
    'Use in before months and years, on before days and dates, and at before times.',
    'Devant une heure, on met at.',
  ),
  fait(
    'heure-routine',
    'bc-present-simple-a1',
    'What time do you get up at weekends?',
    'Pour demander l’heure d’une habitude : What time do you…?',
  ),
  ...ROUTINES.map(card),
  fait(
    'frequence-role',
    'bck-adverbs-frequency',
    'We can use adverbs of frequency to say how often we do something.',
    'Ces mots disent combien de fois on fait quelque chose.',
  ),
  fait(
    'frequence-sens',
    'bck-adverbs-frequency',
    'Always means every time. Usually means most times. Sometimes means a small number of times. Never means no times.',
    'always = à chaque fois ; sometimes = un petit nombre de fois ; never = aucune fois.',
  ),
  fait(
    'frequence-place',
    'bck-adverbs-frequency',
    'We usually put the adverb before the verb.',
    'L’adverbe se place avant le verbe.',
  ),
  fait(
    'frequence-piege',
    'bck-adverbs-frequency-rule',
    'He sometimes drinks cola. (NOT He drinks sometimes cola.)',
    'On ne met pas l’adverbe entre le verbe et son complément.',
  ),
];
