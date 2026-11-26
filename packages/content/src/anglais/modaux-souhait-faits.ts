/**
 * Anglais 5e, « Modaux, souhait, opinion » (lot an-5e-03) : données citées. Chaque fait porte l'identifiant de sa
 * source (registre `sources.ts`) et une citation exacte du texte consulté le 26/11/2026 (copies d'archive
 * web.archive.org des pages du British Council ; programme d'anglais du collège). Les espaces et retours à la ligne
 * sont réduits à une espace.
 *
 * Programme (5e, A2) : should / shouldn’t, could / couldn’t ; souhait sous forme lexicalisée (I wish to, I would love
 * to) ; opinion (I think, I believe, For me, In my opinion). Les personnages et messages des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const SUGG = 'bc-suggestions-obligations';
const COULD = 'bck-could';
const REF = 'bc-can-could';
const INF = 'bc-verbs-infinitive';
const WOULD = 'bc-will-would';
const PC = 'bc-present-continuous';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-modaux',
    PROG,
    'Les auxiliaires de modalité : should/shouldn’t, could/couldn’t',
    'should, shouldn’t, could et couldn’t sont au programme de 5e (niveau A2).',
  ),
  fait(
    'should-conseil',
    SUGG,
    'We use should and shouldn’t to make suggestions and give advice',
    'should et shouldn’t servent à proposer et à conseiller.',
  ),
  fait('should-exemple', SUGG, 'You should send an email.', 'Après should, le verbe est à la base verbale.'),
  fait('shouldnt-exemple', SUGG, 'You shouldn’t go by train.', 'shouldn’t déconseille ; le verbe reste à la base.'),
  fait(
    'could-passe',
    COULD,
    'We can use could and couldn’t to talk about abilities in the past.',
    'could et couldn’t disent ce qu’on savait ou ne savait pas faire.',
  ),
  fait(
    'could-base',
    COULD,
    'Use the infinitive without to after could and couldn’t.',
    'Après could, base verbale sans to.',
  ),
  fait(
    'could-question',
    COULD,
    'For questions, change the order of could and the person.',
    'Dans la question, could passe devant le sujet.',
  ),
  fait(
    'could-negation',
    REF,
    'The negative form of could is couldn’t in spoken English and could not in written English.',
    'La négation est couldn’t ou could not.',
  ),
  fait(
    'could-autorisation',
    REF,
    'could is more formal and polite than can',
    'Could I… ? demande poliment une autorisation.',
  ),
  fait(
    'could-demande',
    REF,
    'We use could you … as a polite way of telling or asking someone to do something',
    'Could you… ? demande poliment à quelqu’un de faire quelque chose.',
  ),
  fait('could-suggestion', REF, 'We use could to make suggestions', 'could sert à faire une suggestion.'),
  fait(
    'programme-souhait',
    PROG,
    'L’expression du souhait sous forme lexicalisée : I wish to, I would love to, etc.',
    'I wish to et I would love to expriment un souhait (programme de 5e).',
  ),
  fait(
    'souhait-infinitif',
    INF,
    'Many verbs in English are followed by the infinitive with to.',
    'Le verbe qui suit est à l’infinitif avec to.',
  ),
  fait(
    'souhait-would',
    WOULD,
    'to say what we want or what we want to do',
    'would (like / love) dit ce que l’on veut ou ce que l’on veut faire.',
  ),
  fait(
    'programme-opinion',
    PROG,
    'L’expression de l’opinion à l’aide d’expressions telles que I think, I believe, For me, In my opinion, etc.',
    'I think, I believe, For me et In my opinion introduisent une opinion (programme de 5e).',
  ),
  fait(
    'opinion-exemple',
    PROG,
    'I think the penguin looks sad.',
    'I think se place devant la phrase qui donne l’avis.',
  ),
  fait(
    'opinion-statif',
    PC,
    'We do not normally use the continuous with stative verbs.',
    'think (au sens de croire) et believe ne prennent pas la forme en -ing.',
  ),
];
