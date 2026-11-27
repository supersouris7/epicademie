/**
 * Anglais 5e, « Groupe nominal et pronoms » (lot an-5e-05) : données citées. Chaque fait porte l'identifiant de sa
 * source (registre `sources.ts`) et une citation exacte du texte consulté le 27/11/2026 (copies d'archive
 * web.archive.org des pages du British Council ; programme d'anglais du collège). Les espaces et retours à la ligne
 * sont réduits à une espace.
 *
 * Programme (5e) : much, many, some ; pronoms personnels réfléchis ; dérivation avec un suffixe ou un préfixe ;
 * antonymes. Les messages et phrases des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const MUCH = 'bck-much-many';
const QUANT = 'bc-quantifiers';
const UNC = 'bc-uncount-nouns';
const REFL = 'bc-reflexive-pronouns';
const AFF = 'bct-prefix-suffix';

export const FAITS: readonly Fait[] = [
  fait('programme-quantifieurs', PROG, 'Les quantifieurs : much, many, some', 'much, many et some sont au programme.'),
  fait(
    'much-many-quantite',
    MUCH,
    'We can use much and many to talk about quantities.',
    'much et many disent une quantité.',
  ),
  fait(
    'many-denombrable',
    MUCH,
    'For things we can count, we use many or a lot of (or lots of) in negative sentences and questions.',
    'many avec ce qui se compte, dans les questions et les négations.',
  ),
  fait(
    'much-indenombrable',
    MUCH,
    "For things we can't count, we use much or a lot of (or lots of) in negative sentences and questions.",
    'much avec ce qui ne se compte pas, dans les questions et les négations.',
  ),
  fait(
    'how-much-many',
    MUCH,
    "To ask about quantities, we use how many for things we can count and how much for things we can't count.",
    'how many pour ce qui se compte, how much pour le reste.',
  ),
  fait(
    'some-negation',
    QUANT,
    'We do not normally use the quantifier some in negative and interrogative sentences.',
    'En règle générale, some ne s’emploie pas dans les questions ni les négations.',
  ),
  fait('some-offre', QUANT, 'but we can use some for offers and requests', 'some sert à proposer et à demander.'),
  fait(
    'indenombrables',
    UNC,
    'Substances: food, water, wine, salt, bread, iron',
    'water, salt et bread sont indénombrables.',
  ),
  fait(
    'indenombrables-courants',
    UNC,
    'furniture | homework | knowledge | luggage',
    'furniture, homework et luggage sont indénombrables.',
  ),
  fait('indenombrables-argent', UNC, 'machinery | money | news | traffic', 'money est indénombrable.'),
  fait(
    'indenombrables-information',
    UNC,
    'Some common nouns in English like information are uncount nouns',
    'information est indénombrable.',
  ),
  fait('lait', MUCH, 'Do you drink much milk?', 'milk s’emploie avec much.'),
  fait(
    'programme-reflechis',
    PROG,
    'Les pronoms personnels réfléchis : myself, himself, themselves, etc.',
    'Les pronoms réfléchis sont au programme.',
  ),
  fait('reflechis-liste', REFL, 'singular: | myself | yourself | himself | herself | itself', 'Formes du singulier.'),
  fait('reflechis-pluriel', REFL, 'plural: | ourselves | yourselves | themselves', 'Formes du pluriel.'),
  fait(
    'reflechis-objet',
    REFL,
    'We use a reflexive pronoun as a direct object when the object is the same as the subject of the verb',
    'Le pronom réfléchi reprend le sujet.',
  ),
  fait(
    'reflechis-by',
    REFL,
    'to show that someone did something without any help',
    'by + pronom réfléchi : sans aide.',
  ),
  fait('reflechis-seul', REFL, 'to show that someone was alone', 'by + pronom réfléchi : seul.'),
  fait(
    'programme-derivation',
    PROG,
    'La dérivation des noms avec un suffixe ou un préfixe : recognise/recognisable/unrecognisable',
    'La dérivation est au programme ; recognise perd son e devant -able.',
  ),
  fait(
    'affixes-aide',
    AFF,
    'Prefixes and suffixes can help you understand a word.',
    'Préfixes et suffixes aident à comprendre un mot.',
  ),
  fait(
    'prefixe-contraire',
    AFF,
    'Some prefixes give adjectives the opposite meaning',
    'Certains préfixes donnent le sens contraire.',
  ),
  fait('prefixe-un', AFF, 'un- happy - unhappy', 'un- : happy → unhappy.'),
  fait('prefixes-autres', AFF, 'im- possible - impossible', 'im- : possible → impossible.'),
  fait('prefixe-dis', AFF, 'dis- satisfied - dissatisfied', 'dis- : satisfied → dissatisfied.'),
  fait('prefixe-ir', AFF, 'ir- regular - irregular', 'ir- : regular → irregular.'),
  fait('prefixe-il', AFF, 'il- legal - illegal', 'il- : legal → illegal.'),
  fait(
    'prefixe-anti',
    AFF,
    'Other prefixes make a word negative: anti- social - antisocial',
    'anti- rend le mot négatif : social → antisocial.',
  ),
  fait('suffixe-able', AFF, '-able - reliable / capable', '-able est un suffixe d’adjectif.'),
  fait(
    'programme-antonymes',
    PROG,
    'Utiliser des antonymes : separation/union, freedom/constraint, quiet/noisy, real/virtual, urban/rural, lonely/popular, etc.',
    'Paires d’antonymes citées par le programme.',
  ),
];
