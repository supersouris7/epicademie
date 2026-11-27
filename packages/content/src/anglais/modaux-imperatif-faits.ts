/**
 * Anglais 6e, « Modaux et impératif » (lot an-6e-03) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme d'anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (6e, A1 / A1+) : can / can’t ; (A1+) must / mustn’t ; impératif (formes courantes) ; impératif négatif,
 * avec la tournure « No cheating! ». Les personnages, les fiches et les règlements des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const CAN = 'bck-can';
const CAN_REF = 'bc-can-could';
const ALLOW = 'bc-permission';
const BAN = 'bc-modals-permission';
const MUST = 'bck-must';
const IMP = 'bck-imperatives';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-modaux',
    PROG,
    'Les auxiliaires de modalité : can/can’t, (a1+) must/mustn’t',
    'can, can’t, must et mustn’t sont au programme de 6e (must et mustn’t au niveau A1+).',
  ),
  fait(
    'programme-autorisation',
    PROG,
    'Demander et exprimer l’autorisation et l’interdiction en contexte connu : You can take photos but you can’t feed the animals.',
    'can et can’t disent aussi l’autorisation et l’interdiction.',
  ),
  fait('programme-demande', PROG, 'Can I open the window, please?', 'Can I… ? sert à demander l’autorisation.'),
  fait(
    'programme-imperatif',
    PROG,
    'L’impératif : reconnaitre quelques formes courantes (en prenant appui notamment sur les consignes de classe déjà connues d’un certain nombre d’élèves) : Look! Listen! Don’t forget your textbook! Come to the board! Open the window!',
    'L’impératif et les consignes de classe sont au programme de 6e.',
  ),
  fait(
    'programme-consignes',
    PROG,
    'Donner quelques consignes simples, ritualisées, avec des verbes fréquemment utilisés : Come in! Sit down. Get ready.',
    'Donner une consigne simple : Come in, Sit down, Get ready.',
  ),
  fait(
    'programme-imperatif-negatif',
    PROG,
    'L’impératif à la forme négative : Don’t walk on the grass! ainsi que le gérondif : No cheating!',
    'L’impératif négatif et la tournure No + verbe en -ing sont au programme de 6e.',
  ),
  fait(
    'can-capacite',
    CAN,
    "We can use can and can't to talk about abilities in the present.",
    'can et can’t disent ce qu’on sait faire ou non.',
  ),
  fait('can-base', CAN, "Use the infinitive without to after can and can't.", 'Après can et can’t : le verbe sans to.'),
  fait('can-question', CAN, 'For questions, change the order of can and the person.', 'Question : can passe devant.'),
  fait('can-reponse-oui', CAN, 'Can you swim? Yes, I can.', 'Réponse courte : Yes, I can.'),
  fait('can-reponse-non', CAN, "Can she play the piano? No, she can't.", 'Réponse courte : No, she can’t.'),
  fait(
    'can-cannot',
    CAN_REF,
    "The negative form is can't in spoken English and cannot in written English.",
    'La négation de can s’écrit can’t ou cannot.',
  ),
  fait('can-demander', ALLOW, 'We use can to ask for permission to do something:', 'can demande une autorisation.'),
  fait('can-autoriser', ALLOW, 'We use can to give permission:', 'can donne une autorisation.'),
  fait(
    'can-refuser',
    ALLOW,
    "We use can't and may not to refuse permission or say that someone does not have permission:",
    'can’t refuse une autorisation.',
  ),
  fait(
    'interdire-deux-modaux',
    BAN,
    "We use can't and mustn't to show that something is prohibited – it is not allowed.",
    'can’t et mustn’t expriment tous deux une interdiction.',
  ),
  fait(
    'must-not',
    BAN,
    'We use must not to talk about what is not permitted.',
    'must not, forme longue de mustn’t, dit ce qui n’est pas permis.',
  ),
  fait(
    'must-regles',
    MUST,
    "We can use must and mustn't to talk about rules and obligations.",
    'must et mustn’t disent les règles et les obligations.',
  ),
  fait('must-sens', MUST, "Must means 'Do it!'", 'must : il faut le faire.'),
  fait('mustnt-sens', MUST, "Mustn't means 'Don't do it!'", 'mustn’t : il ne faut pas le faire.'),
  fait(
    'must-base',
    MUST,
    "Use the infinitive without to after must and mustn't.",
    'Après must et mustn’t : le verbe sans to.',
  ),
  fait(
    'imperatif-emploi',
    IMP,
    'We can use imperatives to give orders and instructions.',
    'L’impératif donne un ordre ou une consigne.',
  ),
  fait(
    'imperatif-forme',
    IMP,
    'The imperative is the same as the verb. We use the verb without you.',
    'L’impératif est la base verbale, sans you.',
  ),
  fait(
    'imperatif-negation',
    IMP,
    "For a negative order or instruction, use don't.",
    'Impératif négatif : don’t devant le verbe.',
  ),
  fait('imperatif-be', IMP, "Don't be late!", 'Avec be aussi : Don’t be late!'),
  fait(
    'imperatif-please',
    IMP,
    'Use please to be more polite. Please put the plates on the table.',
    'please rend la consigne plus polie.',
  ),
];
