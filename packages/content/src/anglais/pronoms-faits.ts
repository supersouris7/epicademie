/**
 * Anglais 6e, « Les pronoms » (lot an-6e-06) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 26/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme d'anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace ; les cellules d'un tableau sont séparées par « | ».
 *
 * Programme (6e) : pronoms personnels sujets et compléments, déterminants possessifs, (A1+) pronoms possessifs,
 * tournures « This is… And that is… », mots interrogatifs who, what, where, when et (A1+) why, how.
 * « which » et « whose » n'y figurent pas en 6e : ils ne sont pas interrogés. Les personnages, messages et
 * dialogues des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

export type Subject = 'I' | 'you' | 'he' | 'she' | 'it' | 'we' | 'they';

export interface Row {
  readonly subject: Subject;
  readonly object: string;
  /** Déterminant possessif. */
  readonly det: string;
  /** Pronom possessif ; `it` n'en a pas. */
  readonly pronoun: string | null;
  /** Qui ou quoi le pronom désigne. */
  readonly who: string;
  /** Sens du déterminant en français. */
  readonly detFr: string;
  /** Sens du pronom possessif en français. */
  readonly pronounFr: string;
}

type Forms = readonly [subject: Subject, object: string, det: string, pronoun: string | null];
const row = ([subject, object, det, pronoun]: Forms, who: string, detFr: string, pronounFr: string): Row => ({
  subject,
  object,
  det,
  pronoun,
  who,
  detFr,
  pronounFr,
});

/** Le tableau des pages « Personal pronouns » et « Possessives: pronouns » du British Council. */
export const ROWS: readonly Row[] = [
  row(['I', 'me', 'my', 'mine'], 'la personne qui parle', 'mon, ma, mes', 'le mien'),
  row(['you', 'you', 'your', 'yours'], 'la ou les personnes à qui l’on parle', 'ton, ta, votre', 'le tien, le vôtre'),
  row(['he', 'him', 'his', 'his'], 'un homme ou un garçon', 'son, sa (à lui)', 'le sien (à lui)'),
  row(['she', 'her', 'her', 'hers'], 'une femme ou une fille', 'son, sa (à elle)', 'le sien (à elle)'),
  row(['it', 'it', 'its', null], 'une chose', 'son, sa (d’une chose ou d’un animal)', ''),
  row(['we', 'us', 'our', 'ours'], 'un groupe dont fait partie la personne qui parle', 'notre, nos', 'le nôtre'),
  row(['they', 'them', 'their', 'theirs'], 'plusieurs personnes ou plusieurs choses', 'leur, leurs', 'le leur'),
];

export const rowOf = (subject: Subject): Row => {
  const found = ROWS.find((r) => r.subject === subject);
  if (!found) throw new Error(`pronom inconnu : ${subject}`);
  return found;
};

export type WhWord = 'Who' | 'What' | 'Where' | 'When' | 'Why' | 'How';

/** Les mots interrogatifs du programme de 6e (why et how au niveau A1+). */
export const WH: readonly {
  readonly en: WhWord;
  readonly fr: string;
  /** Ce que la question demande. */
  readonly asks: string;
}[] = [
  { en: 'Who', fr: 'qui', asks: 'une personne' },
  { en: 'What', fr: 'quoi (que, quel)', asks: 'une chose ou une activité' },
  { en: 'Where', fr: 'où', asks: 'un lieu' },
  { en: 'When', fr: 'quand', asks: 'un moment' },
  { en: 'Why', fr: 'pourquoi', asks: 'une raison' },
  { en: 'How', fr: 'comment', asks: 'une manière ou un état' },
];

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const PERSONAL = 'bc-personal-pronouns';
const DET = 'bc-possessives-adjectives';
const POSS = 'bc-possessives-pronouns';
const QUESTIONS = 'bc-questions-negatives';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-sujets',
    PROG,
    'Utiliser les pronoms personnels sujets : I, you, he, she, it, we, they',
    'Les pronoms sujets sont au programme de 6e.',
  ),
  fait(
    'programme-complements',
    PROG,
    'Utiliser les pronoms personnels compléments : me, you, him, her, it, them, etc.',
    'Les pronoms compléments sont au programme de 6e.',
  ),
  fait(
    'programme-determinants',
    PROG,
    'Utiliser le déterminant possessif : my father, your mother, his/her brother, her, its, our, your, their',
    'Le déterminant possessif est au programme de 6e.',
  ),
  fait(
    'programme-possessifs',
    PROG,
    '(A1+) Utiliser les pronoms possessifs : mine, yours, his, hers, theirs, ours, etc.',
    'Les pronoms possessifs sont au programme de 6e, au niveau A1+.',
  ),
  fait(
    'programme-presentatif',
    PROG,
    'Utiliser les pronoms dans les tournures présentatives : this is…And that is…',
    '« This is… » et « That is… » présentent quelqu’un ou quelque chose.',
  ),
  fait(
    'programme-mots-interrogatifs',
    PROG,
    'Reconnaitre les mots interrogatifs usuels : who?, what?, where?, when?, (A1+) why?, how?',
    'who, what, where, when, why et how sont au programme de 6e.',
  ),
  fait(
    'programme-questions-apprises',
    PROG,
    'What’s your name? Where do you live? (A1+) How old are you? Why is he sad?',
    'Les mots interrogatifs s’apprennent dans des questions usuelles.',
  ),
  fait(
    'tableau-personnels',
    PERSONAL,
    'I | me | you | you | he | him | she | her | it | it | we | us | you | you | they | them',
    'Pronoms sujets et compléments.',
  ),
  fait(
    'sujet-du-verbe',
    PERSONAL,
    'We use subject pronouns as the subject of a verb:',
    'Le pronom sujet est le sujet du verbe.',
  ),
  fait(
    'sujet-obligatoire',
    PERSONAL,
    'English clauses always have a subject.',
    'Une phrase anglaise a toujours un sujet (sauf à l’impératif).',
  ),
  fait(
    'it-sujet',
    PERSONAL,
    'If there is no other subject, we use it or there. We call this a dummy subject.',
    '« It » sert de sujet quand aucun autre sujet n’existe (météo, heure).',
  ),
  fait(
    'he-she-they',
    PERSONAL,
    'We use he/him to refer to men, and she/her to refer to women.',
    'He et him : un homme ; she et her : une femme.',
  ),
  fait(
    'presenter',
    PERSONAL,
    "This is Jack. He's my brother.",
    'Après une présentation, un pronom reprend la personne.',
  ),
  fait(
    'complement-du-verbe',
    PERSONAL,
    'We use object pronouns as the object of a verb:',
    'Le pronom complément est le complément du verbe.',
  ),
  fait(
    'complement-apres-preposition',
    PERSONAL,
    'and after prepositions: She is waiting for me.',
    'Après une préposition, on emploie le pronom complément.',
  ),
  fait(
    'tableau-determinants',
    DET,
    'I | me | my | you | you | your | he | him | his | she | her | her | it | it | its | we | us | our | they | them | their',
    'Déterminants (adjectifs) possessifs.',
  ),
  fait(
    'determinant-appartenance',
    DET,
    'to show something belongs to somebody:',
    'Le possessif dit à qui appartient une chose.',
  ),
  fait('determinant-corps', DET, 'for parts of the body:', 'Le possessif s’emploie aussi avec les parties du corps.'),
  fait(
    'its-sans-apostrophe',
    DET,
    "The possessive adjective its does not have an apostrophe ('):",
    'its (possessif) s’écrit sans apostrophe ; it’s veut dire it is ou it has.',
  ),
  fait(
    'tableau-pronoms-possessifs',
    POSS,
    'I | me | my | mine | you | you | your | yours | he | him | his | his | she | her | her | hers | it | it | its | - | we | us | our | ours | they | them | their | theirs',
    'Pronoms possessifs ; « it » n’en a pas dans ce tableau.',
  ),
  fait(
    'possessif-sans-apostrophe',
    POSS,
    'Possessive pronouns do not have an apostrophe:',
    'Un pronom possessif ne prend jamais d’apostrophe.',
  ),
  fait(
    'possessif-remplace',
    POSS,
    'We can use a possessive pronoun instead of a full noun phrase to avoid repeating words:',
    'Le pronom possessif remplace le déterminant et le nom pour éviter une répétition.',
  ),
  fait(
    'possessif-exemple',
    POSS,
    'Her coat is grey. Mine is brown. (INSTEAD OF [My coat] is brown.)',
    '« Mine » remplace « my coat ».',
  ),
  fait(
    'wh-liste-6e',
    QUESTIONS,
    'Wh-questions are questions which start with a word like what, when, where, which, who, whose, why and how.',
    'Les questions ouvertes commencent par un mot interrogatif.',
  ),
  fait('wh-where-6e', QUESTIONS, 'Where are they working?', '« Where » demande un lieu (They are working in a shop).'),
  fait('wh-when-6e', QUESTIONS, 'When did they arrive?', '« When » demande un moment (They arrived at six).'),
  fait('wh-who-6e', QUESTIONS, 'Who is he seeing tomorrow?', '« Who » demande une personne (He is seeing Joe).'),
  fait(
    'wh-what-6e',
    QUESTIONS,
    'What do you want for your birthday?',
    '« What » demande une chose (I want a computer).',
  ),
  fait('wh-why-6e', QUESTIONS, 'Why have they been working hard?', '« Why » demande la raison d’une action.'),
  fait('wh-how-6e', QUESTIONS, 'How are you?', '« How » ouvre la question sur l’état de quelqu’un.'),
  fait('wh-how-old-6e', QUESTIONS, 'How old are you?', '« How old » demande l’âge.'),
];
