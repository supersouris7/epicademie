/**
 * Anglais 6e, « Temps, espace, formation des mots » (lot an-6e-07) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 26/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme d'anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace ; les cellules d'un tableau sont séparées par « | ».
 *
 * Programme (6e) : marqueurs temporels essentiels ; dates avec les ordinaux ; prépositions de lieu et verbes
 * d'action associés ; suffixes de dérivation ; (A1+) noms composés. Dire l'année à voix haute (A1+) n'est pas
 * interrogé ici. Les personnages, carnets, affiches et messages des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

export interface Marker {
  readonly en: string;
  readonly fr: string;
}
/** Les marqueurs du programme, puis « this morning » (British Council). */
export const MARKERS: readonly Marker[] = [
  { en: 'today', fr: 'aujourd’hui' },
  { en: 'tomorrow', fr: 'demain' },
  { en: 'yesterday', fr: 'hier' },
  { en: 'now', fr: 'maintenant' },
  { en: 'then', fr: 'ensuite' },
  { en: 'this morning', fr: 'ce matin' },
  { en: 'on Saturday', fr: 'samedi' },
  { en: 'in December', fr: 'en décembre' },
  { en: 'at the weekend', fr: 'pendant le week-end' },
  { en: 'last weekend', fr: 'le week-end dernier' },
];

export interface Ordinal {
  readonly n: number;
  readonly word: string;
  readonly short: string;
}
/** Ordinaux dont l'écriture en toutes lettres figure dans les textes cités. */
export const ORDINALS: readonly Ordinal[] = [
  { n: 1, word: 'first', short: '1st' },
  { n: 2, word: 'second', short: '2nd' },
  { n: 3, word: 'third', short: '3rd' },
  { n: 4, word: 'fourth', short: '4th' },
  { n: 5, word: 'fifth', short: '5th' },
  { n: 6, word: 'sixth', short: '6th' },
  { n: 8, word: 'eighth', short: '8th' },
  { n: 9, word: 'ninth', short: '9th' },
  { n: 10, word: 'tenth', short: '10th' },
  { n: 11, word: 'eleventh', short: '11th' },
  { n: 21, word: 'twenty-first', short: '21st' },
];

export type Suffix = 'y' | 'er' | 'ly';
export interface Derived {
  readonly base: string;
  readonly baseFr: string;
  readonly word: string;
  readonly fr: string;
  readonly suffix: Suffix;
  /** Vrai si l'ajout du suffixe change l'orthographe de la base. */
  readonly changes?: true;
}
const derived = (suffix: Suffix, base: string, baseFr: string, word: string, fr: string): Derived => ({
  base,
  baseFr,
  word,
  fr,
  suffix,
  ...(word === `${base}${suffix}` ? {} : { changes: true as const }),
});
/** Paires base → mot dérivé, toutes attestées par un fait. */
export const DERIVED: readonly Derived[] = [
  derived('y', 'cloud', 'nuage', 'cloudy', 'nuageux'),
  derived('y', 'rain', 'pluie', 'rainy', 'pluvieux'),
  derived('y', 'snow', 'neige', 'snowy', 'neigeux'),
  derived('y', 'sport', 'sport', 'sporty', 'sportif'),
  derived('y', 'sun', 'soleil', 'sunny', 'ensoleillé'),
  derived('er', 'sing', 'chanter', 'singer', 'chanteur'),
  derived('er', 'play', 'jouer', 'player', 'joueur'),
  derived('er', 'teach', 'enseigner', 'teacher', 'professeur'),
  derived('er', 'work', 'travailler', 'worker', 'travailleur'),
  derived('er', 'sell', 'vendre', 'seller', 'vendeur'),
  derived('er', 'write', 'écrire', 'writer', 'écrivain'),
  derived('er', 'drive', 'conduire', 'driver', 'conducteur'),
  derived('er', 'make', 'fabriquer', 'maker', 'fabricant'),
  derived('ly', 'quiet', 'calme', 'quietly', 'calmement'),
  derived('ly', 'bad', 'mauvais', 'badly', 'mal'),
  derived('ly', 'quick', 'rapide', 'quickly', 'rapidement'),
  derived('ly', 'sudden', 'soudain', 'suddenly', 'soudainement'),
  derived('ly', 'careful', 'prudent', 'carefully', 'prudemment'),
  derived('ly', 'fortunate', 'chanceux', 'fortunately', 'heureusement'),
  derived('ly', 'happy', 'joyeux', 'happily', 'joyeusement'),
  derived('ly', 'easy', 'facile', 'easily', 'facilement'),
  derived('ly', 'gentle', 'doux', 'gently', 'doucement'),
  derived('ly', 'terrible', 'terrible', 'terribly', 'terriblement'),
];

export interface Compound {
  readonly en: string;
  readonly fr: string;
  /** Le premier mot, qui précise. */
  readonly modifier: string;
  /** Le second mot, qui dit ce qu'est la chose. */
  readonly head: string;
}
const compound = (modifier: string, head: string, fr: string, glued = false): Compound => ({
  en: glued ? `${modifier}${head}` : `${modifier} ${head}`,
  fr,
  modifier,
  head,
});
export const COMPOUNDS: readonly Compound[] = [
  compound('snow', 'man', 'bonhomme de neige', true),
  compound('police', 'man', 'agent de police', true),
  compound('boy', 'friend', 'petit ami', true),
  compound('bed', 'room', 'chambre à coucher', true),
  compound('lunch', 'box', 'boîte à déjeuner'),
  compound('dinner', 'time', 'heure du dîner'),
  compound('apple', 'pie', 'tarte aux pommes'),
  compound('car', 'door', 'portière de voiture'),
  compound('kitchen', 'window', 'fenêtre de la cuisine'),
  compound('chair', 'leg', 'pied de chaise'),
  compound('coat', 'pocket', 'poche de manteau'),
  compound('village', 'church', 'église du village'),
  compound('shopping', 'list', 'liste de courses'),
  compound('swimming', 'lesson', 'cours de natation'),
  compound('washing', 'machine', 'machine à laver'),
];

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const TIME_K = 'bck-prepositions-time';
const TIME = 'bc-prepositions-time';
const HOW = 'bc-how-adverbials';
const RACE = 'bck-great-race';
const PLACE_K = 'bck-prepositions-place';
const PLACE = 'bc-prepositions-place';
const LOCATION = 'bc-adverbials-location';
const MANNER = 'bc-adverbials-manner';
const ADVERBS = 'bck-adverbs';
const WEATHER = 'bck-flashcards-weather';
const MODIFIERS = 'bc-noun-modifiers';

export const FAITS: readonly Fait[] = [
  // Marqueurs de temps
  fait(
    'programme-marqueurs',
    PROG,
    'Utiliser quelques marqueurs temporels essentiels : today, tomorrow, yesterday, now, then, on Saturday, in December, at the weekend, last weekend, etc.',
    'Les marqueurs de temps essentiels de la 6e.',
  ),
  fait(
    'regle-in-on-at',
    TIME_K,
    'Use in before months and years, on before days and dates, and at before times.',
    'in devant un mois ou une année, on devant un jour ou une date, at devant une heure.',
  ),
  fait(
    'moments-journee',
    TIME_K,
    'in the morning / afternoon / evening',
    'in the morning, the afternoon, the evening.',
  ),
  fait('nuit', TIME_K, 'at night', 'On dit at night.'),
  fait(
    'date-naissance',
    TIME_K,
    "She was born in 2008, on 12 June, at 7 o'clock.",
    'in l’année, on la date, at l’heure.',
  ),
  fait(
    'week-end',
    TIME,
    'We also use at with some specific phrases such as at the weekend and at night.',
    'at the weekend en anglais britannique.',
  ),
  fait(
    'week-end-americain',
    TIME,
    'We can also say on weekends or on the weekend. This is more common in American English.',
    'on the weekend est surtout américain : il est accepté aussi.',
  ),
  fait('ce-matin', HOW, 'It rained this morning.', 'this morning s’emploie sans préposition.'),
  fait('ete-dernier', HOW, 'They went to Cambodia last summer.', 'last + moment s’emploie sans préposition.'),

  // Dates et ordinaux
  fait(
    'programme-dates',
    PROG,
    'Exprimer les dates : indiquer la date du jour en utilisant les ordinaux',
    'La date se dit avec les nombres ordinaux.',
  ),
  fait(
    'ordinaux-1-2',
    RACE,
    'The first year will be the Year of the Rat and the second will be the Year of the Ox.',
    'first = 1er, second = 2e.',
  ),
  fait('ordinal-3', RACE, 'The third year will be the Year of the Tiger.', 'third = 3e.'),
  fait('ordinal-4', RACE, 'The fourth year will be the Year of the Rabbit', 'fourth = 4e.'),
  fait('ordinal-5', RACE, 'The fifth year is the Year of the Dragon.', 'fifth = 5e.'),
  fait('ordinal-6', RACE, 'So the snake has the sixth year.', 'sixth = 6e.'),
  fait(
    'ordinaux-8-10',
    RACE,
    'The goat is eighth, the monkey is ninth and the rooster is tenth',
    'eighth, ninth, tenth.',
  ),
  fait('ordinal-11', RACE, 'The eleventh is the Year of the Dog', 'eleventh = 11e.'),
  fait(
    'ordinal-21',
    'bck-chant-nine-oclock',
    'And once a year my birthday On the twenty-first of June.',
    'twenty-first = 21e.',
  ),
  fait(
    'ordinal-abrege',
    'bc-teens-numbers',
    '25th June',
    'En abrégé, l’ordinal garde les deux dernières lettres du mot.',
  ),
  fait('date-ecrite', TIME, "It's his birthday on 19 October.", 'Une date écrite : on + numéro + mois.'),
  fait('date-dite', TIME, 'dates on 30 July on the second of August', 'À l’oral : on the second of August.'),
  fait(
    'date-mois-numero',
    'bck-christmas-story',
    'Christmas is on December 25th.',
    'On écrit aussi le mois puis le numéro.',
  ),

  // Prépositions de lieu
  fait(
    'programme-prepositions',
    PROG,
    'Utiliser quelques prépositions permettant des repérages dans l’espace : on, in, under, over, between, in front of, above, etc., et les verbes d’action associés : to go, to sit, to jump, to walk, etc.',
    'Les prépositions et les verbes d’action de la 6e.',
  ),
  fait('avant-nom', PLACE_K, 'Prepositions go before nouns.', 'La préposition se place devant le nom.'),
  fait('sous', PLACE_K, "The cat isn't on the chair. It's under the chair!", 'on = sur, under = sous.'),
  fait(
    'devant-derriere',
    PLACE_K,
    "There's a small garden in front of the house, and a big garden behind it.",
    'in front of = devant, behind = derrière.',
  ),
  fait('a-cote', PLACE_K, "I don't like sitting next to my brother in the car.", 'next to = à côté de ; in = dans.'),
  fait('entre', PLACE_K, 'The library is between the bank and the museum.', 'between = entre.'),
  fait('en-face', PLACE_K, 'Is your school opposite the park?', 'opposite = en face de.'),
  fait(
    'liste-lieu',
    LOCATION,
    'above | among | at | behind | below | beneath | beside | between | by | in | in between | inside | near | next to | on | opposite | outside | over',
    'above et over sont des prépositions de lieu (au-dessus de, par-dessus).',
  ),
  fait('surface', PLACE, 'We use on to talk about location on a surface.', 'on : sur une surface.'),
  fait('mur', PLACE, 'There are pictures on the wall.', 'On dit on the wall.'),
  fait('etage', PLACE, 'We live on the fifth floor.', 'On dit on the fifth floor.'),
  fait('travail', PLACE, "I'm at work.", 'On dit at work.'),
  fait('maison', PLACE, "She's working at home today.", 'On dit at home.'),
  fait('ecole', PLACE, 'The children are at school.', 'On dit at school.'),
  fait('monde', PLACE, 'in the world', 'On dit in the world.'),
  fait('adresse', PLACE, 'I live at 15 Craig Street.', 'at devant une adresse avec un numéro.'),

  // Suffixes
  fait(
    'programme-suffixes',
    PROG,
    'Repérer certains suffixes pour dériver un nom en adjectif : cloud/cloudy, sport/sporty, un nom en nom : magic/magician, music/musician, ou un verbe en nom : act/actor/actress, sing/singer, write/writer, ou un adjectif en adverbe : happy/happily, fortunate/fortunately, etc.',
    '-y forme un adjectif, -er un nom à partir d’un verbe, -ly un adverbe ; actor prend -or.',
  ),
  fait('meteo-y', WEATHER, 'rainy cloudy windy snowy', 'rainy, cloudy, snowy.'),
  fait('soleil-y', 'bck-weather-live', "Today it's hot and sunny in Brazil.", 'sunny = ensoleillé.'),
  fait('soleil', 'bck-spring-winter', 'Children swimming in the sea Ice cream in the hot bright sun', 'sun = soleil.'),
  fait('neige', 'bck-spring-winter', 'All the children wish for snow', 'snow = neige.'),
  fait('pluie', RACE, 'I had to make some rain for thirsty people to drink.', 'rain = pluie.'),
  fait(
    'metiers-programme',
    PROG,
    'a policeman, a teacher, a pilot, a driver',
    'teacher et driver sont des noms de métier en -er.',
  ),
  fait('joueur', PROG, 'to play, player, card, dice, board game', 'play → player.'),
  fait(
    'noms-er',
    MODIFIERS,
    'We often use noun modifiers with nouns ending in –er: an office worker a jewellery maker a potato peeler',
    'worker et maker sont des noms en -er.',
  ),
  fait('vendeur', MODIFIERS, 'the old newspaper seller', 'sell → seller.'),
  fait(
    'adverbes-ly',
    MANNER,
    'Adverbs of manner are usually formed from adjectives by adding –ly: bad > badly | quiet > quietly | sudden > suddenly',
    'Adjectif + -ly = adverbe de manière.',
  ),
  fait(
    'adverbes-orthographe',
    MANNER,
    'but sometimes there are changes in spelling: easy > easily | gentle > gently | careful > carefully',
    'easily, gently, carefully.',
  ),
  fait('bien', MANNER, 'The adverb formed from good is well:', 'L’adverbe de good est well.'),
  fait(
    'hardly',
    MANNER,
    'hardly and lately have different meanings from hard and late',
    'hardly ne veut pas dire la même chose que hard.',
  ),
  fait(
    'sans-ly',
    ADVERBS,
    "Some adverbs don't have ly. I don't write Italian well. My mum drives fast. Do you work hard?",
    'fast, hard et well ne prennent pas -ly.',
  ),
  fait(
    'role-adverbe',
    ADVERBS,
    'We can use adverbs to describe how somebody does something.',
    'Un adverbe dit comment on fait une action.',
  ),
  fait(
    'exemples-adverbes',
    ADVERBS,
    'She ran quickly. They sang beautifully. The children are playing happily. I dance terribly.',
    'quickly, happily, terribly.',
  ),
  fait(
    'role-adjectif',
    'bck-adjectives',
    'We can use adjectives to describe people, places and things.',
    'Un adjectif décrit une personne, un lieu ou une chose.',
  ),

  // Noms composés
  fait(
    'programme-composes',
    PROG,
    'Repérer les noms composés et leur construction, le déterminant qui précède le déterminé : snowman, policeman, boyfriend, bedroom, etc.',
    '(A1+) Le mot qui précise vient avant le mot principal.',
  ),
  fait(
    'composes-lexique',
    PROG,
    'y compris en mots-composés : lunch box, dinner time, packed lunch, baked beans, spare ribs, apple pie',
    'lunch box, dinner time, apple pie.',
  ),
  fait(
    'deux-noms',
    MODIFIERS,
    'We often use two nouns together to show that one thing is a part of something else: the village church the car door the kitchen window the chair leg my coat pocket',
    'Deux noms côte à côte : le premier précise le second.',
  ),
  fait(
    'pas-de-genitif',
    MODIFIERS,
    "We do not use a possessive form for these things. We do NOT talk about: the car's door the kitchen's window the chair's leg",
    'Pas de ’s dans ces noms composés.',
  ),
  fait(
    'composes-ing',
    MODIFIERS,
    'We often use nouns ending in -ing as noun modifiers: a shopping list a swimming lesson a walking holiday a washing machine',
    'shopping list, swimming lesson, washing machine.',
  ),
];
