/**
 * Anglais CM2, « École, nourriture, animaux » (lot an-cm2-04) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages et fiches PDF du British Council ; programme du
 * cycle 3). Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme : l'école, les besoins quotidiens, les quantifieurs et « accepter, refuser » y figurent. Les animaux et
 * « I'd like » n'y sont pas nommés : mots d'un répertoire sur l'environnement et formule pour dire ce qu'on veut.
 * Les descriptions des documents (jardin, repas, commandes) sont inventées pour l'exercice.
 */
import type { Fait } from './presentation-faits.ts';
import type { Word } from './temps-faits.ts';

const word = (en: string, fr: string, typo: string, alt: readonly string[] = []): Word => ({ en, fr, typo, alt });

// ——— L'école ———
/** Fiche « Classroom objects flashcards ». */
export const SCHOOL_THINGS: readonly Word[] = [
  word('pen', 'le stylo', 'penn'),
  word('pencil', 'le crayon à papier', 'pensil'),
  word('ruler', 'la règle', 'rouler'),
  word('bag', 'le sac', 'bage', ['school bag', 'schoolbag']),
  word('glue', 'la colle', 'glu', ['glue stick']),
  word('scissors', 'les ciseaux', 'sissors'),
  word('desk', 'le bureau d’élève', 'desck'),
  word('eraser', 'la gomme', 'eraiser', ['rubber']),
  word('pencil case', 'la trousse', 'pencil caze'),
  word('pencil sharpener', 'le taille-crayon', 'pencil sharpner', ['sharpener']),
  word('calculator', 'la calculatrice', 'calculater'),
  word('notebook', 'le cahier', 'notbook', ['exercise book']),
  word('folder', 'le classeur ou la chemise', 'foldeur', ['binder']),
  word('felt tips', 'les feutres', 'felt tipes', ['felt-tips', 'felt tip pens', 'felt-tip pens', 'felt pens']),
];

/** Fiche « School subjects flashcards ». */
export const SCHOOL_SUBJECTS: readonly Word[] = [
  word('English', 'l’anglais', 'Inglish'),
  word('maths', 'les maths', 'mathes', ['math', 'mathematics']),
  word('science', 'les sciences', 'sciense', ['sciences']),
  word('history', 'l’histoire', 'histery'),
  word('geography', 'la géographie', 'geografy'),
  word('music', 'la musique', 'musik'),
  word('art', 'les arts plastiques', 'arte', ['arts']),
  word('P.E.', 'le sport à l’école (EPS)', 'P.I.', ['PE', 'P.E']),
];

export interface Riddle {
  readonly en: string;
  readonly clue: string;
}

export const SCHOOL_RIDDLES: readonly Riddle[] = [
  { en: 'scissors', clue: 'Je coupe le papier.' },
  { en: 'ruler', clue: 'Je t’aide à tracer un trait bien droit.' },
  { en: 'glue', clue: 'Je fais tenir une feuille sur une autre.' },
  { en: 'eraser', clue: 'J’efface tes traits de crayon.' },
  { en: 'calculator', clue: 'Je fais les calculs quand tu appuies sur mes touches.' },
  { en: 'pencil sharpener', clue: 'Je taille la pointe de ton crayon.' },
  { en: 'pencil case', clue: 'Je range tes stylos et tes crayons.' },
];

// ——— La nourriture ———
/** Fiches « Food flashcards » (séries 1 et 2). */
export const FOOD: readonly Word[] = [
  word('bread', 'le pain', 'bred'),
  word('cheese', 'le fromage', 'chese'),
  word('rice', 'le riz', 'rise'),
  word('eggs', 'les œufs', 'egges', ['egg']),
  word('fish', 'le poisson', 'fich'),
  word('meat', 'la viande', 'mete'),
  word('chicken', 'le poulet', 'chiken'),
  word('cake', 'le gâteau', 'caik'),
  word('pasta', 'les pâtes', 'pasto'),
  word('chips', 'les frites', 'chipps'),
  word('crisps', 'les chips', 'crips'),
  word('ice cream', 'la glace', 'ice creem', ['ice-cream']),
  word('sweets', 'les bonbons', 'sweats', ['sweet']),
  word('jam', 'la confiture', 'jame'),
  word('yoghurt', 'le yaourt', 'yaourt', ['yogurt']),
  word('sausage', 'la saucisse', 'sausige', ['sausages']),
];

/** Fiche « Fruit flashcards ». */
export const FRUIT: readonly Word[] = [
  word('apple', 'la pomme', 'aple', ['apples']),
  word('banana', 'la banane', 'bananna', ['bananas']),
  word('orange', 'l’orange', 'orenge', ['oranges']),
  word('strawberry', 'la fraise', 'strawbery', ['strawberries']),
  word('pear', 'la poire', 'paire', ['pears']),
  word('peach', 'la pêche', 'peche', ['peaches']),
  word('cherry', 'la cerise', 'chery', ['cherries']),
  word('grapes', 'le raisin', 'graps', ['grape']),
  word('pineapple', 'l’ananas', 'pinapple', ['pineapples']),
  word('melon', 'le melon', 'mellon', ['melons']),
];

/** Fiche « Vegetables flashcards ». */
export const VEGETABLES: readonly Word[] = [
  word('potato', 'la pomme de terre', 'potatoe', ['potatoes']),
  word('carrot', 'la carotte', 'carot', ['carrots']),
  word('peas', 'les petits pois', 'pease', ['pea']),
  word('onion', 'l’oignon', 'onyon', ['onions']),
  word('cucumber', 'le concombre', 'cucomber', ['cucumbers']),
  word('lettuce', 'la salade (laitue)', 'lettus'),
  word('mushrooms', 'les champignons', 'mushrums', ['mushroom']),
  word('cabbage', 'le chou', 'cabage', ['cabbages']),
];

/** Fiche « Drinks flashcards ». */
export const DRINKS: readonly Word[] = [
  word('water', 'l’eau', 'watter'),
  word('milk', 'le lait', 'milck'),
  word('orange juice', 'le jus d’orange', 'orange juce'),
  word('tea', 'le thé', 'tee'),
  word('hot chocolate', 'le chocolat chaud', 'hot chocolat'),
  word('lemonade', 'la limonade', 'lemonad'),
];

// ——— some / any ———
/** Noms qu'on ne compte pas, avec leur traduction après « du, de la, de l’ ». */
export const UNCOUNTABLE: readonly { readonly en: string; readonly some: string }[] = [
  { en: 'milk', some: 'du lait' },
  { en: 'water', some: 'de l’eau' },
  { en: 'bread', some: 'du pain' },
  { en: 'rice', some: 'du riz' },
];

export interface Counted {
  readonly one: string;
  readonly article: 'a' | 'an';
  readonly many: string;
}

export const COUNTABLE: readonly Counted[] = [
  { one: 'banana', article: 'a', many: 'bananas' },
  { one: 'pear', article: 'a', many: 'pears' },
  { one: 'sandwich', article: 'a', many: 'sandwiches' },
  { one: 'biscuit', article: 'a', many: 'biscuits' },
  { one: 'apple', article: 'an', many: 'apples' },
  { one: 'orange', article: 'an', many: 'oranges' },
  { one: 'egg', article: 'an', many: 'eggs' },
];

// ——— Les animaux ———
/** Fiches « Bugs », « Birds » et « Wild animals » (série 2). */
export const BUGS: readonly Word[] = [
  word('bee', 'l’abeille', 'bea'),
  word('ant', 'la fourmi', 'antt'),
  word('fly', 'la mouche', 'flie'),
  word('spider', 'l’araignée', 'spyder'),
  word('butterfly', 'le papillon', 'buterfly'),
  word('ladybird', 'la coccinelle', 'ladybirde'),
  word('caterpillar', 'la chenille', 'caterpilar'),
  word('mosquito', 'le moustique', 'mosquitto'),
  word('dragonfly', 'la libellule', 'dragonflie'),
  word('grasshopper', 'la sauterelle', 'grashopper'),
];

export const OTHER_ANIMALS: readonly Word[] = [
  word('duck', 'le canard', 'duk'),
  word('frog', 'la grenouille', 'frogg'),
  word('owl', 'le hibou ou la chouette', 'oul'),
  word('wolf', 'le loup', 'woolf'),
  word('snail', 'l’escargot', 'snale'),
  word('squirrel', 'l’écureuil', 'squirel'),
  word('seal', 'le phoque', 'seel'),
  word('deer', 'le cerf', 'dear'),
  word('eagle', 'l’aigle', 'eagel'),
  word('dove', 'la colombe', 'duv'),
  word('flamingo', 'le flamant rose', 'flamengo'),
  word('leopard', 'le léopard', 'leopar'),
];

/** Fiche « Animal body parts flashcards ». `many` : le nom se dit au pluriel dans « It’s got … ». */
export interface BodyPart extends Word {
  /** Groupe après « It’s got » : « a tail », « wings », « fur ». */
  readonly got: string;
  /** « une queue », « des ailes » */
  readonly has: string;
}
const part = (en: string, fr: string, typo: string, got: string, has: string): BodyPart => ({
  ...word(en, fr, typo),
  got,
  has,
});

export const BODY_PARTS: readonly BodyPart[] = [
  part('tail', 'la queue', 'tale', 'a tail', 'une queue'),
  part('wings', 'les ailes', 'wins', 'wings', 'des ailes'),
  part('paws', 'les pattes (avec des coussinets)', 'pows', 'paws', 'des pattes à coussinets'),
  part('claws', 'les griffes', 'clows', 'claws', 'des griffes'),
  part('whiskers', 'les moustaches', 'wiskers', 'whiskers', 'des moustaches'),
  part('beak', 'le bec', 'beek', 'a beak', 'un bec'),
  part('fins', 'les nageoires', 'finns', 'fins', 'des nageoires'),
  part('fur', 'la fourrure', 'furr', 'fur', 'de la fourrure'),
  part('feathers', 'les plumes', 'fethers', 'feathers', 'des plumes'),
  part('scales', 'les écailles', 'scails', 'scales', 'des écailles'),
  part('shell', 'la coquille ou la carapace', 'shel', 'a shell', 'une coquille'),
];

// ——— Citations ———
const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });

export const FAITS: readonly Fait[] = [
  fait(
    'programme-ecole',
    'cycle3-2020',
    'Dialoguer sur des sujets familiers (école, loisirs, maison, etc.).',
    'Le programme du cycle 3 fait parler de l’école.',
  ),
  fait(
    'programme-quotidien',
    'cycle3-2020',
    'pour des informations sur la personne, les besoins quotidiens, son environnement',
    'Le programme du cycle 3 fait parler des besoins quotidiens et de l’environnement.',
  ),
  fait(
    'programme-quantifieurs',
    'cycle3-2020',
    'les quantifieurs',
    'Le programme du cycle 3 compte les quantifieurs dans la grammaire.',
  ),
  fait(
    'programme-propositions',
    'cycle3-2020',
    'Réagir à des propositions, dans des situations de la vie courante (remercier, féliciter, présenter des excuses, accepter, refuser, etc.).',
    'Le programme du cycle 3 fait réagir à une proposition.',
  ),
  fait(
    'ecole-objets',
    'bck-flashcards-classroom-objects',
    'pencil case pen pencil eraser pencil sharpener ruler glue scissors crayons felt tips stickers calculator notebook folder bag desk',
    'Les noms anglais des affaires de classe.',
  ),
  fait(
    'ecole-matieres',
    'bck-flashcards-school-subjects',
    'English maths science history geography music art P.E.',
    'Les noms anglais des matières.',
  ),
  fait(
    'nourriture-1',
    'bck-flashcards-food-1',
    'bread cheese pasta rice eggs fish meat sandwich pizza chips nuts yoghurt chocolate sweets cake ice cream',
    'Des noms anglais d’aliments.',
  ),
  fait(
    'nourriture-2',
    'bck-flashcards-food-2',
    'chicken sausage hamburger noodles pie toast jam jelly doughnut biscuits crisps coconut',
    'D’autres noms anglais d’aliments.',
  ),
  fait(
    'fruits',
    'bck-flashcards-fruit',
    'apple banana orange strawberry pear peach cherry grapes kiwi pineapple melon watermelon',
    'Les noms anglais des fruits.',
  ),
  fait(
    'legumes',
    'bck-flashcards-vegetables',
    'potato carrot peas broccoli pepper green beans cabbage mushrooms onion leeks courgettes aubergine corn sweet potato cucumber lettuce',
    'Les noms anglais des légumes.',
  ),
  fait(
    'boissons',
    'bck-flashcards-drinks',
    'orange juice lemonade cola water milk milkshake hot chocolate tea',
    'Les noms anglais des boissons.',
  ),
  fait(
    'some-affirmative',
    'bck-countable-uncountable',
    'Use a or an before singular nouns. Use some before plural nouns and uncountable nouns in positive sentences.',
    'a ou an devant un singulier ; some devant un pluriel ou un indénombrable, dans une phrase qui dit « oui ».',
  ),
  fait(
    'any-negative',
    'bck-countable-uncountable',
    'Use any before plural nouns and uncountable nouns in negative sentences and questions.',
    'any dans les phrases négatives et les questions.',
  ),
  fait(
    'some-any-exemple',
    'bck-countable-uncountable',
    "There's some water but there isn't any juice. Is there any cola?",
    'some, puis any.',
  ),
  fait(
    'indenombrable',
    'bck-countable-uncountable',
    "We can use uncountable nouns for things we can't count. There's some bread and cheese on the table.",
    'Un nom indénombrable désigne ce qu’on ne compte pas : bread, cheese.',
  ),
  fait(
    'indenombrables-exemples',
    'bc-nouns-countable',
    'Uncountable nouns cannot be counted, e.g. air, rice, water, etc.',
    'rice et water sont indénombrables.',
  ),
  fait(
    'some-lait',
    'bc-nouns-countable',
    "We use some with uncountable nouns in positive sentences and any with negatives. There's some milk in the fridge.",
    'some milk dans une phrase affirmative.',
  ),
  fait(
    'some-demande',
    'bc-nouns-countable',
    'But when we are offering something or asking for something, we normally use some.',
    'Pour proposer ou demander, on emploie d’habitude some.',
  ),
  fait('some-demande-exemple', 'bc-nouns-countable', 'Can we have some more chairs, please?', 'some dans une demande.'),
  fait(
    'insectes',
    'bck-flashcards-bugs',
    'ant bee fly ladybird caterpillar butterfly spider mosquito cockroach beetle dragonfly grasshopper',
    'Les noms anglais de petites bêtes.',
  ),
  fait('oiseaux', 'bck-flashcards-birds', 'duck robin dove owl eagle vulture flamingo emu', 'Des noms d’oiseaux.'),
  fait(
    'animaux-sauvages',
    'bck-flashcards-wild-2',
    'cheetah leopard orangutan boa constrictor meerkat lemur black bear grizzly bear panda bear koala seal wolf deer squirrel frog snail',
    'Des noms d’animaux sauvages.',
  ),
  fait(
    'corps-animaux',
    'bck-flashcards-animal-body',
    'tail wings paws claws whiskers beak horn fins fur feathers scales shell hoof fang jaws snout',
    'Les noms anglais des parties du corps d’un animal.',
  ),
  fait(
    'have-got-corps',
    'bck-have-got',
    'We can use have got to talk about our things, family members and parts of the body.',
    '« have got » dit ce qu’on a, y compris les parties du corps.',
  ),
  fait(
    'like-dire',
    'bck-like',
    "We can use like and don't like to say things are good or bad.",
    '« I like » dit qu’on aime.',
  ),
  fait(
    'would-like-vouloir',
    'bc-will-would',
    'I would like …, I’d like … (you)(to) ... to say what we want or what we want to do: I’d like that one, please.',
    '« I’d like » (I would like) dit ce qu’on veut.',
  ),
  fait(
    'would-like-proposer',
    'bc-will-would',
    'would you like ..., would you like to ... for offers and invitations: Would you like another drink?',
    '« Would you like…? » propose ou invite.',
  ),
  fait(
    'cafe-commande',
    'bc-teens-cafe',
    'Café worker: Next, please! What would you like?',
    'Au café : « What would you like? »',
  ),
  fait('cafe-id-like', 'bc-teens-cafe', "Andi: Yeah, I'd like some banana cake.", 'Commander avec « I’d like some… ».'),
  fait(
    'cafe-boisson',
    'bc-teens-cafe',
    'Café worker: Would you like a drink?',
    '« Would you like a drink? » propose une boisson.',
  ),
];
