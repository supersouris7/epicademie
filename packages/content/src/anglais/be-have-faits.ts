/**
 * Anglais 6e, « Be et have » (lot an-6e-02) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme d'anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (6e, A1 / A1+) : auxiliaires be et have au présent ; (A1+) was / were reconnus ; there is / there are.
 * « There was / there were » réunit ces deux derniers points. Les personnages et les phrases des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const BE = 'bck-present-be';
const PAST = 'bck-past-be';
const GOT = 'bck-have-got';
const HAVE = 'bc-have-got';
const QN = 'bc-questions-negatives';
const THERE = 'bc-there-is';
const DUMMY = 'bc-there-dummy';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-be-have',
    PROG,
    'Le présent simple : connaitre le présent des verbes les plus courants ainsi que les auxiliaires be et have',
    'be et have au présent sont au programme de 6e.',
  ),
  fait(
    'programme-was-were',
    PROG,
    '(A1+) L’expression du passé : reconnaitre quelques verbes les plus courants du prétérit : was/were, I was in London',
    'was et were sont au programme de 6e (niveau A1+).',
  ),
  fait(
    'programme-there',
    PROG,
    'Appliquer les règles d’accord élémentaires : there is/there are',
    'L’accord there is / there are est au programme de 6e.',
  ),
  fait(
    'be-formes',
    BE,
    'Use am for I. Use is for he, she and it. Use are for you, we and they.',
    'am avec I ; is avec he, she, it ; are avec you, we, they.',
  ),
  fait(
    'be-negation',
    BE,
    "For negatives, use not. I am not nine years old! = I'm not nine years old! She is not a teacher. = She's not a teacher. = She isn't a teacher.",
    'Négation : be + not ; formes courtes I’m not, she’s not, she isn’t.',
  ),
  fait(
    'be-question',
    BE,
    'For questions, change the order of am, is or are and the person. Are you Brazilian? Yes, I am.',
    'Question : be passe devant la personne ; réponse courte Yes, I am.',
  ),
  fait(
    'passe-emploi',
    PAST,
    'We can use the past simple of the verb to be to talk about situations and states in the past.',
    'Le prétérit de be parle d’une situation ou d’un état passés.',
  ),
  fait(
    'passe-formes',
    PAST,
    'Use was for I, he, she and it. Use were for you, we and they.',
    'was avec I, he, she, it ; were avec you, we, they.',
  ),
  fait(
    'passe-negation',
    PAST,
    "I was not late for school this morning. = I wasn't late for school this morning.",
    'Négation : was not = wasn’t.',
  ),
  fait(
    'passe-negation-pluriel',
    PAST,
    "We were not cold yesterday. = We weren't cold yesterday.",
    'Négation : were not = weren’t.',
  ),
  fait(
    'passe-question',
    PAST,
    'For questions, change the order of was or were and the person. Were you tired this morning? Yes, I was.',
    'Question : was ou were passe devant la personne ; à « Were you… ? » on répond avec I was.',
  ),
  fait(
    'have-formes',
    GOT,
    'Use have for I, you, we and they. Use has for he, she and it.',
    'have avec I, you, we, they ; has avec he, she, it.',
  ),
  fait(
    'have-emploi',
    GOT,
    'We can use have got to talk about our things, family members and parts of the body.',
    'have got : objets, famille, corps.',
  ),
  fait(
    'have-egal-have-got',
    HAVE,
    'In many situations, have and have got mean the same thing.',
    'have et have got veulent souvent dire la même chose.',
  ),
  fait('have-exemple', HAVE, 'She has got a good job. = She has a good job.', 'has got = has.'),
  fait(
    'have-got-negation',
    HAVE,
    "She has not got a brother. = She hasn't got a brother.",
    'Négation de have got : not après have ou has.',
  ),
  fait(
    'have-got-question',
    HAVE,
    'To make questions, use have/has + subject + got.',
    'Question avec have got : Have ou Has, sujet, got.',
  ),
  fait(
    'have-do',
    QN,
    'We make questions and negatives with have in two ways. Usually we use do/does or did: Do you have plenty of time? Does she have enough money?',
    'Avec have, on emploie d’habitude do ou does.',
  ),
  fait('have-sans-do', QN, "She hasn't any money.", 'Autre négation acceptée : hasn’t.'),
  fait(
    'there-nombre',
    THERE,
    'We use there is for singular nouns and there are for plural nouns.',
    'there is avec le singulier, there are avec le pluriel.',
  ),
  fait(
    'there-negation',
    THERE,
    "We often use there isn't a + singular noun, there isn't any + uncountable noun and there aren't any + plural noun.",
    'Négation : a au singulier, any au pluriel.',
  ),
  fait(
    'there-question',
    THERE,
    'For questions, we say Is there for singular nouns and uncountable nouns and Are there for plural nouns.',
    'Question : le verbe passe devant there.',
  ),
  fait('there-was', DUMMY, 'There was a nasty fight.', 'there was : une seule chose, dans le passé.'),
  fait(
    'there-were',
    DUMMY,
    'There were twenty people at the meeting.',
    'there were : plusieurs personnes ou choses, dans le passé.',
  ),
];
