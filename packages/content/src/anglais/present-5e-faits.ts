/**
 * Anglais 5e, « Présent simple et be + ing » (lot an-5e-01) : données citées.
 * Chaque fait porte l’identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 26/11/2026 (copies d’archive web.archive.org des pages du British Council ; programme d’anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (5e, A1+ / A2) : présent simple (affirmatif, négatif, interrogatif), présent be + ing, adverbes de fréquence,
 * marqueurs temporels.
 * Les personnages et les phrases des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const PS = 'bc-present-simple';
const QN = 'bc-questions-negatives';
const PSPC = 'bck-present-simple-continuous';
const PC = 'bc-present-continuous';
const ADV = 'bck-adverbs-frequency';
const TADV = 'bct-adverbs-frequency';
const PAST = 'bc-past-simple';
const TREG = 'bct-past-regular';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-present',
    PROG,
    'Le présent simple : forme affirmative, négative et interrogative',
    'Les trois formes du présent simple sont au programme de 5e.',
  ),
  fait(
    'programme-be-ing',
    PROG,
    'Le présent be+ing : reconnaitre quelques formes courantes : He is wearing a uniform, They are walking to school',
    'Le présent be + ing est au programme de 5e.',
  ),
  fait(
    'programme-adverbes',
    PROG,
    'Utiliser des adverbes de fréquence',
    'Les adverbes de fréquence sont au programme de 5e.',
  ),
  fait(
    'programme-marqueurs',
    PROG,
    'Utiliser des marqueurs temporels simples : today, this morning, tomorrow, yesterday, etc.',
    'Marqueurs : today, this morning, tomorrow, yesterday.',
  ),
  fait(
    'programme-marqueurs-a2',
    PROG,
    '(A2) Utiliser des marqueurs temporels : at two o’clock, every day, last month, six months ago, in two years, etc.',
    'Marqueurs : every day, last month, six months ago, in two years.',
  ),
  fait('base', PS, 'The present tense is the base form of the verb:', 'Au présent : la base verbale.'),
  fait('troisieme', PS, 'We use does for the third person singular', 'does avec he, she, it ; do avec les autres.'),
  fait(
    'negation',
    PS,
    "We use doesn't for the third person singular",
    'Négation : doesn’t (he, she, it), don’t sinon.',
  ),
  fait('habitude', PS, 'something that happens regularly in the present:', 'Le présent simple dit ce qui se répète.'),
  fait(
    'do-sauf',
    QN,
    'For all verbs except be and have , we use do/does or did to make Yes/No questions in the present simple and past simple',
    'Questions avec do, does ou did, sauf be et have.',
  ),
  fait('verbe-s', PSPC, 'For the present simple, add s or es for he , she and it .', '-s ou -es avec he, she, it.'),
  fait(
    'maintenant',
    PSPC,
    'We can use the present continuous to talk about things we are doing now.',
    'be + ing : ce qu’on fait maintenant.',
  ),
  fait(
    'regulier',
    PSPC,
    'We can use the present simple to talk about things we do regularly.',
    'Présent simple : ce qu’on fait régulièrement.',
  ),
  fait(
    'forme-ing',
    PSPC,
    'For the present continuous, use am , is or are and ing . For the negative, use not .',
    'am, is, are + -ing ; négation avec not.',
  ),
  fait(
    'etats',
    PC,
    'We do not normally use the continuous with stative verbs',
    'Les verbes d’état ne se mettent en général pas en be + ing.',
  ),
  fait(
    'sens-adverbes',
    ADV,
    'Always means every time. Usually means most times. Sometimes means a small number of times. Never means no times.',
    'Sens de always, usually, sometimes, never.',
  ),
  fait('place-adverbe', ADV, 'We usually put the adverb before the verb.', 'L’adverbe se place avant le verbe.'),
  fait('place-be', ADV, 'If the verb is to be , we put the adverb after the verb.', 'Après be.'),
  fait(
    'echelle',
    TADV,
    '100% 0% always usually/normally often sometimes occasionally hardly ever never',
    'Ordre : always, usually, often, sometimes, never.',
  ),
  fait(
    'never',
    TADV,
    'Be careful with never . It is already negative, so we can’t use it with not .',
    'never ne s’emploie pas avec not.',
  ),
  fait('ago', PAST, 'we often use expressions with ago with the past simple:', 'ago s’emploie avec le prétérit.'),
  fait(
    'passe-reperes',
    TREG,
    'It is often used with past time references (e.g. yesterday, two years ago).',
    'yesterday, two years ago : marqueurs du passé.',
  ),
];
