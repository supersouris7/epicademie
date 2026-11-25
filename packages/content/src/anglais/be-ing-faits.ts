/**
 * Anglais 6e, « Be + ing » (lot an-6e-04) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme d'anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (6e, A1+) : « Le présent be + ing : reconnaitre quelques formes courantes » ; « Le présent be + ing
 * utilisé pour exprimer un futur proche » ; « Exprimer une intention sous forme lexicalisée : I want to, I would
 * like to ». Les personnages, les agendas et les messages des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const PC = 'bc-present-continuous';
const PSPC = 'bck-present-simple-continuous';
const FUT = 'bck-continuous-future';
const TALK = 'bc-talking-future';
const INF = 'bc-verbs-infinitive';
const WOULD = 'bc-will-would';
const LIKE = 'bck-like-ing';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-be-ing',
    PROG,
    'Le présent be + ing : reconnaitre quelques formes courantes : He is wearing a kilt, They are making a blueberry pie',
    'Le présent be + ing est au programme de 6e (A1+).',
  ),
  fait(
    'programme-futur',
    PROG,
    'Le présent be + ing utilisé pour exprimer un futur proche : I’m visiting my family this weekend',
    'be + ing sert aussi à parler d’un futur proche.',
  ),
  fait(
    'programme-intention',
    PROG,
    'Exprimer une intention sous forme lexicalisée : I want to, I would like to',
    'I want to et I would like to disent une intention.',
  ),
  fait(
    'forme',
    PC,
    'The present continuous is made from the present tense of the verb be and the –ing form of a verb:',
    'be au présent (am, is, are), puis le verbe en -ing.',
  ),
  fait(
    'en-cours',
    PC,
    'activities at the moment of speaking:',
    'be + ing dit ce qui se passe au moment où l’on parle.',
  ),
  fait(
    'question',
    PC,
    'We make questions by putting am, is or are in front of the subject:',
    'Question : am, is ou are passe devant le sujet.',
  ),
  fait(
    'negation',
    PC,
    "We make negatives by putting not (or n't) after am, is or are:",
    'Négation : not (ou n’t) après am, is ou are.',
  ),
  fait(
    'etat',
    PC,
    'We do not normally use the continuous with stative verbs.',
    'Les verbes d’état (like, want, know…) ne se mettent pas en be + ing.',
  ),
  fait(
    'etat-liste',
    PC,
    'believe dislike know like love hate prefer realise recognise remember suppose think (= believe) understand want wish',
    'like, know et want sont des verbes d’état.',
  ),
  fait(
    'simple-ou-be-ing',
    PSPC,
    'We can use the present simple to talk about things we do regularly. We can use the present continuous to talk about things we are doing now.',
    'Habitude : présent simple ; action en cours : be + ing.',
  ),
  fait(
    'futur-projet',
    FUT,
    'We can use the present continuous to talk about future arrangements.',
    'be + ing dit un projet déjà organisé.',
  ),
  fait(
    'futur-question',
    FUT,
    'For questions, change the order of am, is or are and the person.',
    'Question sur un projet : même changement d’ordre.',
  ),
  fait(
    'futur-negation',
    FUT,
    "We aren't going to school next week.",
    'Un projet à la forme négative : be + not + verbe en -ing.',
  ),
  fait('futur-plans', TALK, 'We can use the present continuous for plans or arrangements:', 'be + ing : un projet.'),
  fait('want-would', TALK, "I'd like to go to university.", 'I’d like to + base verbale parle d’un souhait futur.'),
  fait('wants', TALK, 'George wants to buy a new car.', 'Avec une 3e personne : wants to + base verbale.'),
  fait(
    'infinitif',
    INF,
    'Some verbs are followed by the infinitive with to:',
    'Certains verbes sont suivis de to et de la base verbale.',
  ),
  fait(
    'infinitif-liste',
    INF,
    'choose decide expect forget hate hope intend learn like love mean plan prefer remember want would like/love',
    'want et would like se construisent avec to.',
  ),
  fait(
    'would-like',
    WOULD,
    "I would like …, I'd like … (you)(to) ... to say what we want or what we want to do:",
    'I would like to (I’d like to) dit ce qu’on veut faire.',
  ),
  fait(
    'would-like-offre',
    WOULD,
    'would you like ..., would you like to ... for offers and invitations:',
    'Would you like to… ? propose ou invite.',
  ),
  fait(
    'can-capacite',
    'bck-can',
    "We can use can and can't to talk about abilities in the present.",
    'can dit ce qu’on sait faire.',
  ),
  fait('forme-wear', PROG, 'He is wearing a kilt', 'wear → wearing.'),
  fait('forme-make', PROG, 'They are making a blueberry pie', 'make → making.'),
  fait('forme-work', PC, 'I am working', 'work → working.'),
  fait('forme-talk', PC, 'He is talking', 'talk → talking.'),
  fait('forme-sleep', PC, 'The children are sleeping.', 'sleep → sleeping.'),
  fait('forme-listen', PC, 'Are you listening?', 'listen → listening.'),
  fait('forme-play', PSPC, "I'm playing hockey now.", 'play → playing.'),
  fait('forme-eat', PSPC, "She's eating an apple now.", 'eat → eating.'),
  fait('forme-study', PSPC, "She's studying English now.", 'study → studying.'),
  fait('forme-do', PSPC, 'Are you doing your homework now?', 'do → doing.'),
  fait('forme-go', PSPC, "I'm going to the park now.", 'go → going.'),
  fait('forme-visit', FUT, "I'm visiting my friend tomorrow.", 'visit → visiting.'),
  fait('forme-have', FUT, "I'm having a party for my birthday.", 'have → having.'),
  fait('forme-stay', FUT, 'My brother is staying home tonight.', 'stay → staying.'),
  fait('forme-swim', 'bc-ing-forms', 'I love swimming.', 'swim → swimming.'),
  fait('forme-sit', 'bc-continuous-aspect', 'How long have you been sitting there?', 'sit → sitting.'),
  fait('forme-read', LIKE, 'Do you like reading?', 'read → reading.'),
  fait('forme-cook', LIKE, 'I like cooking.', 'cook → cooking.'),
  fait('forme-watch', LIKE, 'We love watching TV.', 'watch → watching.'),
  fait('forme-clean', LIKE, 'They hate cleaning.', 'clean → cleaning.'),
];
