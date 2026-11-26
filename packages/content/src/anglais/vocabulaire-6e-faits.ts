/**
 * Anglais 6e, « Vocabulaire thématique » (lot an-6e-09) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte : programme d'anglais du
 * collège (annexe 3 de l'arrêté du 5 mai 2025) et fiches LearnEnglish Kids du British Council. Les espaces et retours
 * à la ligne sont réduits à une espace. Les fiches déjà vérifiées pour le CM2 sont reprises telles quelles.
 *
 * Programme (6e, A1 / A1+) : lexique en lien avec les axes culturels (habitat, aliments, loisirs, paysages, contes,
 * émotions), cinq axes culturels et leurs objets d'étude. Les phrases et documents des exercices sont inventés.
 */
import { FAITS as FAITS_ECOLE } from './ecole-faits.ts';
import { FAITS as FAITS_SITUER } from './se-situer-faits.ts';
import type { Fait } from './presentation-faits.ts';

/** Nombre du nom, pour les petits mots admis devant lui : `one` (a/an/the), `many` (the/some), `mass`, `none`. */
export type Noun = 'one' | 'many' | 'mass' | 'none';

export interface Term {
  readonly en: string;
  readonly fr: string;
  /** Famille de mots proches : les propositions des niveaux 2 en sont tirées. */
  readonly group: string;
  /** Autres écritures ou synonymes acceptés. */
  readonly alt: readonly string[];
  readonly noun: Noun;
  /** Faute d'écriture typique. */
  readonly typo: string;
}

const term = (
  group: string,
  noun: Noun,
  ...[en, fr, typo, alt = []]: [en: string, fr: string, typo: string, alt?: readonly string[]]
): Term => ({ group, noun, en, fr, typo, alt });

// ——— École ———
export const SCHOOL: readonly Term[] = [
  term('affaires', 'one', 'pencil case', 'la trousse', 'pencil caze'),
  term('affaires', 'one', 'pencil sharpener', 'le taille-crayon', 'pencil sharpner', ['sharpener']),
  term('affaires', 'one', 'ruler', 'la règle', 'rouler'),
  term('affaires', 'many', 'scissors', 'les ciseaux', 'sissors', ['pair of scissors', 'a pair of scissors']),
  term('affaires', 'one', 'calculator', 'la calculatrice', 'calculater'),
  term('affaires', 'one', 'notebook', 'le cahier', 'notbook', ['exercise book']),
  term('affaires', 'one', 'eraser', 'la gomme', 'eraiser', ['rubber']),
  term('affaires', 'one', 'folder', 'le classeur ou la chemise', 'foldeur', ['binder']),
  term('matières', 'none', 'history', 'l’histoire (la matière)', 'histery'),
  term('matières', 'none', 'geography', 'la géographie', 'geografy'),
  term('matières', 'none', 'science', 'les sciences', 'sciense', ['sciences']),
  term('matières', 'none', 'art', 'les arts plastiques', 'arte', ['arts']),
  term('matières', 'none', 'maths', 'les maths', 'mathes', ['math', 'mathematics']),
  term('matières', 'none', 'music', 'la musique', 'musik'),
  term('vie scolaire', 'one', 'pupil', 'l’élève', 'pupill', ['student', 'schoolchild']),
  term('vie scolaire', 'one', 'uniform', 'l’uniforme', 'uniforme', ['school uniform']),
  term('vie scolaire', 'one', 'tie', 'la cravate', 'tye', ['necktie']),
  term('vie scolaire', 'mass', 'homework', 'les devoirs à la maison', 'homeworks'),
];

// ——— Loisirs ———
export const LEISURE: readonly Term[] = [
  term('lieux', 'one', 'cinema', 'le cinéma', 'cinima', ['movie theater', 'movie theatre']),
  term('lieux', 'one', 'swimming pool', 'la piscine', 'swiming pool', ['swimming-pool', 'pool']),
  term('lieux', 'one', 'skating rink', 'la patinoire', 'skating rinc', [
    'skating-rink',
    'ice rink',
    'ice-rink',
    'rink',
  ]),
  term('lieux', 'one', 'stadium', 'le stade', 'stadum'),
  term('lieux', 'one', 'library', 'la bibliothèque', 'librery'),
  term('lieux', 'one', 'sports hall', 'la salle de sport (le gymnase)', 'sport hal', ['gym', 'gymnasium']),
  term('activités', 'none', 'reading', 'la lecture', 'readding'),
  term('activités', 'none', 'dancing', 'la danse', 'danceing', ['dance']),
  term('activités', 'none', 'singing', 'le chant', 'singging'),
  term('activités', 'none', 'horse-riding', 'l’équitation', 'horse-rideing', ['horse riding', 'horseriding', 'riding']),
  term('activités', 'none', 'drawing', 'le dessin', 'drawwing'),
  term('activités', 'none', 'painting', 'la peinture', 'paintting'),
  term('activités', 'none', 'acting', 'le théâtre (jouer un rôle)', 'acteing'),
  term('activités', 'none', 'collecting', 'le fait de collectionner', 'colecting'),
  term('moments', 'none', 'at the weekend', 'le week-end', 'at the weekand', ['on the weekend', 'at weekends']),
  term('moments', 'none', 'after school', 'après l’école', 'after scool'),
  term('moments', 'none', 'every week', 'chaque semaine', 'every weak', ['each week']),
  term('moments', 'none', 'once a week', 'une fois par semaine', 'ones a week', ['one time a week']),
  term('jeux', 'many', 'dice', 'les dés', 'dices'),
  term('jeux', 'one', 'board game', 'le jeu de société', 'bord game', ['boardgame']),
  term('jeux', 'none', 'to win', 'gagner', 'to wine', ['win']),
  term('jeux', 'none', 'to lose', 'perdre', 'to loose', ['lose']),
];

// ——— Alimentation ———
export const FOODS: readonly Term[] = [
  term('repas', 'none', 'breakfast', 'le petit-déjeuner', 'brekfast'),
  term('repas', 'none', 'lunch', 'le déjeuner (le repas de midi)', 'lunsh'),
  term('repas', 'none', 'dinner', 'le dîner (le repas du soir)', 'diner', ['supper', 'evening meal']),
  term('repas', 'one', 'packed lunch', 'le repas de midi emporté de la maison', 'pack lunch'),
  term('sensations', 'none', 'hungry', 'affamé (qui a faim)', 'hangry'),
  term('sensations', 'none', 'thirsty', 'assoiffé (qui a soif)', 'thirsthy'),
  term('fruits et légumes', 'one', 'pear', 'la poire', 'peer', ['pears']),
  term('fruits et légumes', 'one', 'apricot', 'l’abricot', 'apricote', ['apricots']),
  term('fruits et légumes', 'one', 'pineapple', 'l’ananas', 'pinapple', ['pineapples']),
  term('fruits et légumes', 'one', 'cucumber', 'le concombre', 'cucomber', ['cucumbers']),
  term('fruits et légumes', 'one', 'tomato', 'la tomate', 'tomatoe', ['tomatoes']),
  term('fruits et légumes', 'one', 'zucchini', 'la courgette', 'zuchini', ['courgette', 'courgettes', 'zucchinis']),
  term('aliments', 'mass', 'meat', 'la viande', 'mete'),
  term('aliments', 'mass', 'sugar', 'le sucre', 'suger'),
  term('aliments', 'mass', 'bread', 'le pain', 'bred'),
  term('aliments', 'mass', 'cheese', 'le fromage', 'chese'),
  term('aliments', 'one', 'cake', 'le gâteau', 'caik', ['cakes']),
  term('plats', 'one', 'apple pie', 'la tarte aux pommes', 'apple py', ['apple tart']),
  term('plats', 'many', 'baked beans', 'les haricots à la sauce tomate', 'bake beans'),
  term('plats', 'many', 'spare ribs', 'les travers de porc', 'spare rips', ['spareribs', 'ribs']),
  term('plats', 'mass', 'maple taffy', 'la tire d’érable (une confiserie au sirop d’érable)', 'mapple taffy'),
];

// ——— Maison ———
export const HOME: readonly Term[] = [
  term('pièces', 'one', 'bedroom', 'la chambre', 'bedrom'),
  term('pièces', 'one', 'kitchen', 'la cuisine', 'kitchin'),
  term('pièces', 'one', 'bathroom', 'la salle de bains', 'bathrom'),
  term('pièces', 'one', 'living room', 'le salon', 'livin room', ['living-room', 'lounge', 'sitting room']),
  term('pièces', 'one', 'dining room', 'la salle à manger', 'dinning room', ['dining-room']),
  term('parties', 'one', 'garden', 'le jardin', 'gardin', ['yard']),
  term('parties', 'one', 'window', 'la fenêtre', 'windo'),
  term('parties', 'one', 'door', 'la porte', 'dor'),
  term('parties', 'one', 'wall', 'le mur', 'wal'),
  term('parties', 'one', 'roof', 'le toit', 'rouf'),
  term('meubles', 'one', 'wardrobe', 'l’armoire à vêtements', 'wardrob', ['closet']),
  term('meubles', 'one', 'shelf', 'l’étagère', 'shelve'),
  term('meubles', 'one', 'armchair', 'le fauteuil', 'armchaire'),
  term('meubles', 'one', 'bookcase', 'la bibliothèque (le meuble à livres)', 'bookcaze', ['bookshelf', 'bookshelves']),
  term('meubles', 'one', 'fridge', 'le réfrigérateur', 'frigde', ['refrigerator']),
  term('logements', 'one', 'flat', 'l’appartement', 'flatt', ['apartment']),
  term(
    'logements',
    'one',
    'semi-detached house',
    'la maison jumelée (collée à une autre d’un côté)',
    'semi detach house',
    ['semi detached house', 'semi'],
  ),
  term('voisinage', 'one', 'neighbour', 'le voisin', 'neighbourg', ['neighbor']),
  term('voisinage', 'one', 'neighbourhood', 'le quartier', 'neighbourhod', ['neighborhood', 'district']),
  term('description', 'mass', 'furniture', 'les meubles (le mobilier)', 'furnitures'),
  term('description', 'none', 'cosy', 'douillet (où l’on se sent bien)', 'cosey', ['cozy']),
  term('description', 'none', 'comfortable', 'confortable', 'confortable'),
];

// ——— Axes culturels ———
export const AXES = [
  'Personnes et personnages',
  'Le quotidien : vivre, jouer, apprendre',
  'Pays et paysages',
  'Imaginaire, contes et légendes',
  'Arts et expression des sentiments',
] as const;

export interface Study {
  /** Rang de l'axe (0 à 4). */
  readonly axis: number;
  /** Objet d'étude, tel que le programme l'écrit. */
  readonly name: string;
  /** Assez parlant pour le niveau 1. */
  readonly plain: boolean;
}
const study = (axis: number, name: string, plain = false): Study => ({ axis, name, plain });

export const STUDIES: readonly Study[] = [
  study(0, 'Journal de bord et journal intime'),
  study(0, 'Familles fictives et réelles', true),
  study(0, 'Les animaux à l’origine de leçons de vie dans les fictions'),
  study(0, 'Masques et costumes'),
  study(1, 'Les lieux de vie des élèves des pays anglophones'),
  study(1, 'Sports populaires et traditionnels', true),
  study(1, 'L’école et son organisation', true),
  study(1, 'Les vacances aux États-Unis et leurs spécificités'),
  study(2, 'À la découverte du fleuve Mississippi', true),
  study(2, 'Les Highlands en Écosse'),
  study(2, 'Les parcs nationaux du Kenya, avec leur faune et flore', true),
  study(2, 'Mers et océans dans les pays anglophones, un bain linguistique'),
  study(3, 'L’image du dragon', true),
  study(3, 'L’Irlande, terre de mythes et de légendes', true),
  study(3, 'It’s a kind of magic : sorciers et magiciens dans le folklore et la fiction', true),
  study(3, 'L’univers poétique et farfelu du Dr. Seuss'),
  study(4, 'Réalité augmentée, un regard sur l’art'),
  study(4, 'Le pouvoir évocateur de la musique', true),
  study(4, 'L’imagerie des fêtes de fin d’année'),
  study(4, 'Supercalifragilisticexpialidocious et la musicalité de la langue anglaise'),
];

/** Mots du programme rattachés aux thèmes des axes (famille, paysages, contes, émotions). */
export const AXIS_WORDS: readonly Term[] = [
  term('famille', 'one', 'family', 'la famille', 'familly'),
  term('famille', 'one', 'uncle', 'l’oncle', 'uncel'),
  term('famille', 'one', 'aunt', 'la tante', 'ant'),
  term('paysages', 'one', 'river', 'la rivière ou le fleuve', 'rivor'),
  term('paysages', 'one', 'lake', 'le lac', 'lac'),
  term('paysages', 'one', 'coast', 'la côte (le bord de mer)', 'cost', ['seaside', 'coastline']),
  term('paysages', 'one', 'forest', 'la forêt', 'forrest', ['wood', 'woods']),
  term('paysages', 'one', 'island', 'l’île', 'iland', ['isle']),
  term('paysages', 'one', 'cliff', 'la falaise', 'clif'),
  term('paysages', 'one', 'valley', 'la vallée', 'vallee'),
  term('paysages', 'one', 'hill', 'la colline', 'hil'),
  term('paysages', 'one', 'meadow', 'le pré (la prairie)', 'medow', ['field']),
  term('contes', 'one', 'witch', 'la sorcière', 'wich'),
  term('contes', 'one', 'wizard', 'le sorcier', 'wizzard', ['sorcerer', 'magician']),
  term('contes', 'one', 'fairy tale', 'le conte de fées', 'fairy tail', ['fairytale', 'fairy-tale']),
  term('contes', 'one', 'dwarf', 'le nain', 'dwaf'),
  term('contes', 'one', 'haunted castle', 'le château hanté', 'haunted castel'),
  term('émotions', 'none', 'happy', 'heureux', 'hapy', ['glad']),
  term('émotions', 'none', 'angry', 'en colère', 'angri', ['cross']),
  term('émotions', 'none', 'afraid', 'effrayé (qui a peur)', 'affraid', ['scared', 'frightened']),
  term('émotions', 'none', 'disappointed', 'déçu', 'disapointed'),
];

// ——— Citations ———
const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';

const REPRIS: readonly Fait[] = [
  ...FAITS_ECOLE.filter((f) => ['ecole-objets', 'ecole-matieres', 'nourriture-1'].includes(f.id)),
  ...FAITS_SITUER.filter((f) =>
    [
      'maison-pieces-1',
      'maison-pieces-2',
      'maison-parties-1',
      'maison-parties-2',
      'meubles-1',
      'meubles-2',
      'meubles-3',
    ].includes(f.id),
  ),
];

export const FAITS: readonly Fait[] = [
  fait(
    'programme-axe-quotidien',
    PROG,
    'Partir à la découverte de la réalité des jeunes anglophones, dans les spécificités de leur environnement quotidien, à l’école et dans les temps de loisirs',
    'L’école et les loisirs relèvent de l’axe « Le quotidien : vivre, jouer, apprendre ».',
  ),
  fait(
    'programme-eleve',
    PROG,
    'He is a pupil of Hogwarts. His best friends are Hermione and Ron. They wear uniforms with a tie.',
    'pupil, uniform, tie : l’élève, l’uniforme, la cravate.',
  ),
  fait(
    'programme-habitudes',
    PROG,
    'to go to school, to do one’s homework, to go to bed, etc.',
    'homework : les devoirs.',
  ),
  fait(
    'programme-loisirs-a1',
    PROG,
    'A1 lieux de loisirs : cinema, bowling, swimming-pool, skating rink, stadium, gym, etc. ; activités : reading, doing sport, listening to music, dancing, playing tennis, playing an instrument, singing, horse-riding, etc., blocs lexicalisés : at the weekend, in the morning, after school, every week, etc.',
    'Lieux, activités et moments des loisirs (A1).',
  ),
  fait(
    'programme-loisirs-a1plus',
    PROG,
    'A1+ comme A1 et autres termes tels que des lieux de loisirs ou des activités : sports hall, aqua park, library, indoor, outdoor, water sports, to have fun, to enjoy, to see friends, collecting, painting, drawing, acting, etc., blocs lexicalisés : during my free/spare time, two hours a week, once a week, etc.',
    'Lieux, activités et moments des loisirs (A1+).',
  ),
  fait(
    'programme-jeu',
    PROG,
    'A1 to play, player, card, dice, board game, it is your turn, to start, to win, to lose, etc.',
    'Les mots du jeu.',
  ),
  fait(
    'programme-aliments-a1',
    PROG,
    'A1 breakfast, lunch, dinner, to be hungry, to be thirsty, meat, vegetables (tomato, cucumber, zucchini, etc.) fruit (pear, apricot, pineapple, etc.), cake, sugar, etc.',
    'Repas, sensations et aliments (A1).',
  ),
  fait(
    'programme-aliments-a1plus',
    PROG,
    'lunch box, dinner time, packed lunch, baked beans, spare ribs, apple pie, maple taffy, etc.',
    'Mots composés de l’alimentation (A1+).',
  ),
  fait(
    'programme-maison-a1',
    PROG,
    'A1 house, flat, apartment, room, bedroom, living-room, kitchen, garden, window, door, wall, etc.',
    'La maison (A1).',
  ),
  fait(
    'programme-maison-a1plus',
    PROG,
    'semi-detached house, neighbour, neighbourhood, the house next door, furniture, to decorate, to paint, comfortable, cosy, etc.',
    'La maison et le voisinage (A1+).',
  ),
  fait(
    'programme-famille',
    PROG,
    'A1 family, parents, mother, father, brother, sister, uncle, aunt, cousin, child/children, etc.',
    'La famille.',
  ),
  fait(
    'programme-paysages-a1',
    PROG,
    'A1 country, state, union, island, isle, continent, ocean, sea, lake, coast, beach, forest, mountains, desert, river, landscape, beautiful, colourful, vast, etc.',
    'Les paysages (A1).',
  ),
  fait(
    'programme-paysages-a1plus',
    PROG,
    'tree, flower, plant, nature, field, meadow, hill, cliff, canyon, valley, rock, bush, etc.',
    'Les paysages (A1+).',
  ),
  fait(
    'programme-contes-a1',
    PROG,
    'A1 fairy tale, story, legend, witch, magic, magician, haunted castle, far away, isolated, etc.',
    'Les contes et légendes (A1).',
  ),
  fait(
    'programme-contes-a1plus',
    PROG,
    'dragon, dwarf, leprechaun, banshee, magician, wizard, sorcerer, poison',
    'Les contes et légendes (A1+).',
  ),
  fait(
    'programme-emotions',
    PROG,
    'A1 happy, sad, tired, angry, surprised, afraid, scared, great!, wonderful!, I’m glad, what a shame!, etc. A1+ comme A1 et autres termes tels que enjoy, tense, disappointed, cross',
    'Les émotions.',
  ),
  fait(
    'programme-cinq-axes',
    PROG,
    'Les cinq axes culturels doivent obligatoirement être traités dans l’année.',
    'Les cinq axes sont étudiés en 6e.',
  ),
  ...AXES.map((axis, i) =>
    fait(`programme-axe-${i + 1}`, PROG, `Axe ${i + 1}. ${axis}`, `L’axe ${i + 1} s’intitule « ${axis} ».`),
  ),
  ...STUDIES.map((s, i) =>
    fait(`programme-objet-${i + 1}`, PROG, s.name, `Objet d’étude possible de l’axe ${s.axis + 1}.`),
  ),
  ...REPRIS,
];
