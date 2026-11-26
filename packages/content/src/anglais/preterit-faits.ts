/**
 * Anglais 5e, « Le prétérit » (lot an-5e-01) : données citées.
 * Chaque fait porte l’identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 26/11/2026 (copies d’archive web.archive.org des pages du British Council ; programme d’anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (5e, A1+ / A2) : prétérit (was / were, verbes réguliers et irréguliers), phrases négatives et interrogatives,
 * raconter au passé.
 * Les personnages et les phrases des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const PAST = 'bc-past-simple';
const IRR = 'british-council-irregular-verbs';
const TREG = 'bct-past-regular';
const TIRR = 'bct-past-irregular';
const KQ = 'bck-past-questions';
const KS = 'bck-past-sentences';
const QN = 'bc-questions-negatives';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-passe',
    PROG,
    'L’expression du passé : reconnaitre quelques verbes les plus courants du prétérit : was/were, verbes réguliers et irréguliers, I watched a documentary, I discovered artists, I went to the museum, etc.',
    'Prétérit au programme de 5e : was, were, réguliers, irréguliers.',
  ),
  fait(
    'programme-passe-a2',
    PROG,
    '(A2) L’expression du passé : utiliser les verbes les plus courants du prétérit (réguliers et irréguliers)',
    'Niveau A2 : employer le prétérit.',
  ),
  fait(
    'programme-phrases',
    PROG,
    'Former des phrases simples (affirmatives, négatives avec not et interrogatives)',
    'Négation et questions au programme.',
  ),
  fait(
    'programme-connecteurs',
    PROG,
    'Utiliser quelques connecteurs chronologiques ou logiques : first, then, like, for example, so, etc.',
    'first, then : pour ordonner un récit.',
  ),
  fait('ed', PAST, 'With most verbs, the past tense is formed by adding –ed', 'La plupart des verbes : -ed.'),
  fait('fini', PAST, 'something that happened once in the past :', 'Le prétérit raconte un fait du passé.'),
  fait('did', PAST, 'We use did to make questions with the past simple:', 'Question avec did.'),
  fait('didnt', PAST, 'to make negatives with the past simple:', 'Négation avec didn’t.'),
  fait('liste', IRR, 'Irregular verbs', 'Tableau des verbes irréguliers (verbs.ts).'),
  fait('regle-e', TREG, 'If a verb ends in – e , you add –d .', 'Fin en -e : -d.'),
  fait(
    'regle-double',
    TREG,
    'If a verb ends in a vowel and a consonant, the consonant is usually doubled before – ed .',
    'Consonne souvent doublée.',
  ),
  fait(
    'regle-y',
    TREG,
    'If a verb ends in consonant and – y , you take off the y and add – ied .',
    'Consonne + y : -ied.',
  ),
  fait('regle-voyelle-y', TREG, 'But if the word ends in a vowel and – y , you add –ed .', 'Voyelle + y : -ed.'),
  fait('meme-forme', TREG, "No, the form doesn't change.", 'Même forme à toutes les personnes.'),
  fait(
    'apprendre',
    TIRR,
    'Some verbs are irregular. Their past forms do not end in –ed .',
    'Les irréguliers ne finissent pas par -ed.',
  ),
  fait('be', TIRR, 'The past form is was for I, he, she and it , but were for you, we and they.', 'was / were.'),
  fait(
    'question-base',
    KQ,
    "Use did and the verb, but don't change the verb to the past form.",
    'Après did : la base.',
  ),
  fait('reponse-courte', KQ, "We make yes or no answers with did or didn't .", 'Réponses courtes avec did, didn’t.'),
  fait(
    'negation-base',
    KS,
    "For negatives, use didn't and the verb, but don't change the verb to the past form.",
    'Après didn’t : la base.',
  ),
  fait(
    'be-sans-did',
    QN,
    'Here are the question forms and negative forms for be in the present simple and past simple',
    'Be a ses propres formes de question et de négation (Was he? He was not).',
  ),
];
