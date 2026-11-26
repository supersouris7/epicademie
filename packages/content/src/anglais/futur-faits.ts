/**
 * Anglais 5e, « Le futur » (lot an-5e-03) : données citées. Chaque fait porte l'identifiant de sa source (registre
 * `sources.ts`) et une citation exacte du texte consulté le 26/11/2026 (copies d'archive web.archive.org des pages du
 * British Council ; programme d'anglais du collège). Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (5e, A2) : « L’expression du futur avec will et be going to + BV » ; le présent be + ing pour un futur
 * proche. Les personnages, messages et agendas des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const WILL = 'bck-will-predictions';
const GOING = 'bck-going-to-plans';
const ARR = 'bck-continuous-future';
const FORMS = 'bc-future-forms';
const TALK = 'bc-talking-future';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-futur',
    PROG,
    'L’expression du futur avec will et be going to + BV',
    'will et be going to suivi de la base verbale sont au programme de 5e (niveau A2).',
  ),
  fait(
    'programme-be-ing-futur',
    PROG,
    'Le présent be+ing utilisé pour exprimer un futur proche : I’m watching a rugby match tonight',
    'Le présent be + ing peut annoncer un futur proche.',
  ),
  fait('will-prevision', WILL, 'We can use will to make predictions about the future.', 'will annonce une prévision.'),
  fait('will-contraction', WILL, 'We can contract will, especially when we’re speaking.', 'will se contracte en ’ll.'),
  fait(
    'will-negation',
    WILL,
    'For negatives, use not. We usually contract will and not to make won’t.',
    'La négation est will not, contractée en won’t.',
  ),
  fait(
    'will-base',
    WILL,
    'Use the infinitive without to after will and won’t.',
    'Après will et won’t, le verbe est à la base verbale, sans to.',
  ),
  fait(
    'will-question',
    WILL,
    'For questions, change the order of will and the person.',
    'Dans la question, will passe devant le sujet.',
  ),
  fait('going-plans', GOING, 'We can use going to to talk about our future plans.', 'going to annonce un projet.'),
  fait(
    'going-forme',
    GOING,
    'Use am, is or are with going to and the infinitive.',
    'La forme est am, is ou are, puis going to, puis la base verbale.',
  ),
  fait(
    'going-negation',
    GOING,
    'For negatives, use not after am, is or are.',
    'La négation se place après am, is ou are.',
  ),
  fait(
    'going-question',
    GOING,
    'For questions, change the order of am, is or are and the person.',
    'Dans la question, am, is ou are passe devant le sujet.',
  ),
  fait(
    'be-ing-rendez-vous',
    ARR,
    'We can use the present continuous to talk about future arrangements.',
    'Le présent be + ing annonce une chose organisée pour l’avenir.',
  ),
  fait('be-ing-forme', ARR, 'Use am, is or are and ing.', 'La forme est am, is ou are, puis le verbe en -ing.'),
  fait('be-ing-negation', ARR, 'For negatives, use not.', 'La négation s’écrit avec not.'),
  fait(
    'be-ing-question',
    ARR,
    'For questions, change the order of am, is or are and the person.',
    'Dans la question, am, is ou are passe devant le sujet.',
  ),
  fait(
    'choix-trois-formes',
    FORMS,
    'We use different verb forms to talk about our plans for the future, depending on what kind of plan it is: a spontaneous plan, a pre-decided plan or an arrangement.',
    'La forme du futur dépend du type de projet.',
  ),
  fait(
    'choix-will',
    FORMS,
    'We use will to talk about spontaneous plans decided at the moment of speaking.',
    'will : décision prise au moment où l’on parle.',
  ),
  fait(
    'choix-going',
    FORMS,
    'We use going to to talk about plans decided before the moment of speaking.',
    'be going to : projet décidé avant de parler.',
  ),
  fait(
    'choix-be-ing',
    FORMS,
    'We usually use the present continuous when the plan is an arrangement – already confirmed with at least one other person and we know the time and place.',
    'be + ing : rendez-vous confirmé avec une autre personne, heure et lieu connus.',
  ),
  fait(
    'choix-indice',
    TALK,
    'to make predictions based on evidence we can see: Be careful! You are going to fall.',
    'be going to : prévision fondée sur ce que l’on voit.',
  ),
  fait(
    'choix-avis',
    TALK,
    'when we express beliefs about the future: It will be a nice day tomorrow. I think Brazil will win the World Cup.',
    'will : ce que l’on pense de l’avenir.',
  ),
];
