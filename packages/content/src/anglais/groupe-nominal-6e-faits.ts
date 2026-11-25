/**
 * Anglais 6e, « Le groupe nominal » (lot an-6e-05) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (programme d'anglais du collège ; copies d'archive web.archive.org des pages du British Council).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (6e) : « Repérer la place de l'adjectif épithète toujours à gauche du nom dans un GN » ; « Utiliser des
 * articles : a, the, Ø » ; « this/these, that/those » ; « foot/feet, child/children, woman/women » (A1+ :
 * person/people, knife/knives, mouse/mice, box/boxes) ; « Utiliser le génitif ». Les personnages et les scènes des
 * exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const ART = 'bc-articles-a-an-the';
const DEF = 'bc-definite-article';
const USE = 'bc-articles-the-no-article';
const DEM = 'bck-this-that';
const DEMREF = 'bc-demonstratives';
const COUNT = 'bc-count-nouns';
const ADJ = 'bck-adjectives';
const NP = 'bc-noun-phrases';
const POSS = 'bc-possessive-s';

export const FAITS: readonly Fait[] = [
  fait('programme-articles', PROG, 'Utiliser des articles : a, the, Ø', 'a, the et l’absence d’article sont en 6e.'),
  fait(
    'programme-demonstratifs',
    PROG,
    'Utiliser des déterminants démonstratifs : this/these, that/those',
    'this, these, that et those sont en 6e.',
  ),
  fait(
    'programme-pluriels',
    PROG,
    'Appliquer les règles d’accord élémentaires : there is/there are, foot/feet, child/children, woman/women',
    'foot → feet, child → children, woman → women.',
  ),
  fait(
    'programme-pluriels-a1plus',
    PROG,
    'Appliquer les règles d’accord élémentaire sur un champ lexical plus large : person/people, knife/knives, mouse/mice, box/boxes, etc.',
    'person → people, knife → knives, mouse → mice, box → boxes (A1+).',
  ),
  fait('programme-dents', PROG, 'tooth/teeth', 'tooth → teeth.'),
  fait(
    'programme-adjectif',
    PROG,
    'Repérer la place de l’adjectif épithète toujours à gauche du nom dans un GN',
    'L’adjectif épithète se place avant le nom.',
  ),
  fait(
    'programme-genitif',
    PROG,
    'Utiliser le génitif : greg’s friend, william’s children, harry’s wand, etc.',
    'Le génitif est au programme de 6e.',
  ),
  fait(
    'article-singulier',
    ART,
    'Singular, countable nouns always have an article – a/an or the (or another determiner – my, your, this, that, etc.).',
    'Un nom singulier dénombrable a toujours un article ou un autre déterminant.',
  ),
  fait(
    'article-metier',
    ART,
    "When we say what people's jobs are, we usually use a/an. He's an architect. She's a scientist. My grandmother was a teacher.",
    'a ou an devant un métier.',
  ),
  fait(
    'article-premiere-fois',
    ART,
    'We use a/an – the indefinite article – when we talk about something for the first time, or something that is part of a group or type. I saw a good film yesterday. Do you want a drink?',
    'a ou an : première mention, ou un élément parmi d’autres.',
  ),
  fait(
    'article-son',
    ART,
    "We use a when the word that follows it begins with a consonant sound. We use an when it's followed by a vowel sound.",
    'a devant un son de consonne, an devant un son de voyelle.',
  ),
  fait('article-heure', ART, 'It took me an hour to get home.', 'On dit an hour.'),
  fait(
    'article-connu',
    ART,
    "We use the – the definite article – when the listener already knows which thing we are talking about because it was mentioned before or because there's only one of them.",
    'the : chose déjà connue, déjà citée ou unique.',
  ),
  fait(
    'article-general',
    ART,
    'When we talk about things in general, we normally use a plural or uncountable noun with no article. Birds eat worms. Water freezes at 0°C. Children need a lot of sleep.',
    'Pas d’article pour des choses en général.',
  ),
  fait(
    'article-unique',
    DEF,
    'because there is only one: The Pope is visiting Russia. The moon is very bright tonight.',
    'the moon.',
  ),
  fait(
    'article-voiture',
    DEF,
    'Dad, can I borrow the car? (= the car that belongs to our family)',
    'the car de la famille.',
  ),
  fait(
    'article-instrument',
    DEF,
    'We use the definite article in this way to talk about musical instruments: Joe plays the piano really well.',
    'the devant un instrument de musique.',
  ),
  fait(
    'article-royaume',
    DEF,
    'countries whose names include words like kingdom, states or republic:',
    'the United Kingdom.',
  ),
  fait(
    'article-expressions',
    USE,
    "We don't usually use an article in expressions with bed, work and home. go to bed / be in bed go to work / be at work / start work / finish work go home",
    'go to bed, go to work, go home : sans article.',
  ),
  fait(
    'article-ecole',
    USE,
    'We also don’t normally use an article in expressions with school, university, prison and hospital. start school / go to school / be at school',
    'go to school : sans article quand on est élève.',
  ),
  fait(
    'article-villes',
    USE,
    "We don't normally use an article for continents, most countries, cities, towns, lakes, mountains or universities.",
    'Pas d’article devant une ville, un continent, la plupart des pays.',
  ),
  fait(
    'demonstratif-pres',
    DEM,
    'Use this and these to talk about things near us. Use this for one thing and these for more than one.',
    'this pour une seule chose proche, these pour plusieurs.',
  ),
  fait(
    'demonstratif-loin',
    DEM,
    'Use that and those to talk about things far away. Use that for one thing and those for more than one.',
    'that pour une seule chose éloignée, those pour plusieurs.',
  ),
  fait(
    'demonstratif-nom',
    DEMREF,
    'We can also use this, these, that and those with nouns.',
    'Les démonstratifs se placent aussi devant un nom.',
  ),
  fait(
    'pluriel-irreguliers',
    COUNT,
    'Some common nouns have irregular plurals: man>men woman>women child>children person>people foot>feet',
    'man, woman, child, person et foot ont un pluriel irrégulier.',
  ),
  fait(
    'pluriel-es',
    COUNT,
    'We add –es to nouns ending in –s, –ch, –sh, –ss, –x and –o: class>classes watch>watches gas>gases wish>wishes box>boxes potato>potatoes',
    'box → boxes : pluriel régulier en -es.',
  ),
  fait(
    'adjectif-invariable',
    ADJ,
    "We don't add s to the adjective when it's plural.",
    'L’adjectif ne prend pas de s au pluriel.',
  ),
  fait('adjectif-apres-be', ADJ, 'My brothers are short.', 'Après be, l’adjectif suit le verbe.'),
  fait(
    'adjectif-taille-couleur',
    ADJ,
    "Put size adjectives before colour adjectives. I've got a big, blue ball.",
    'La taille se place avant la couleur.',
  ),
  fait(
    'adjectif-ordre',
    NP,
    'determiners and quantifiers>numbers>adjectives + NOUNS',
    'Ordre : déterminant, nombre, adjectif, nom.',
  ),
  fait(
    'genitif-singulier',
    POSS,
    "When it is one person who owns something, we usually use 's.",
    'Un seul possesseur : ’s.',
  ),
  fait('genitif-place', POSS, "Possessive 's always comes after a noun or a name.", '’s suit un nom ou un prénom.'),
  fait(
    'genitif-s',
    POSS,
    "If a name or noun ends in s, we can add either ' or 's.",
    'Nom terminé par s : apostrophe seule ou ’s.',
  ),
  fait(
    'genitif-pluriel',
    POSS,
    "If the thing belongs to more than one person, we usually add ' after the s of the plural noun.",
    'Pluriel en -s : apostrophe après le s.',
  ),
  fait(
    'genitif-irregulier',
    POSS,
    "If the plural noun is irregular and doesn't end in s, we add 's.",
    'Pluriel irrégulier : ’s.',
  ),
];

export type Article = 'a' | 'an' | 'the' | 'Ø';

export interface ArticleSentence {
  /** Début de phrase (vide si le trou ouvre la phrase). */
  readonly before: string;
  readonly after: string;
  readonly article: Article;
  /** Contexte donné à l'élève, en français. */
  readonly context: string;
  /** Pourquoi cet article. */
  readonly why: string;
  /** La forme sans article se rencontre aussi : « Ø » n'est jamais proposé pour cette phrase. */
  readonly noZero?: boolean;
}

const sentence = (before: string, article: Article, after: string, context: string, why: string): ArticleSentence => ({
  before,
  article,
  after,
  context,
  why,
});
const JOB = 'On dit le métier de quelqu’un : a ou an.';
const ANY = 'Une chose parmi d’autres, pas encore connue : a ou an.';
const GENERAL = 'On parle de ces choses en général : aucun article (Ø).';

export const ARTICLE_SENTENCES: readonly ArticleSentence[] = [
  sentence('She’s', 'a', 'teacher.', 'son métier', JOB),
  sentence('My grandmother was', 'a', 'doctor.', 'son métier', JOB),
  sentence('He’s', 'a', 'scientist.', 'son métier', JOB),
  sentence('Yesterday, I saw', 'a', 'good film.', 'on parle de ce film pour la première fois', ANY),
  sentence('Do you want', 'a', 'drink?', 'une boisson, n’importe laquelle', ANY),
  sentence('He’s', 'an', 'architect.', 'son métier', `${JOB} « architect » commence par un son de voyelle : an.`),
  sentence(
    'I need',
    'an',
    'umbrella.',
    'un parapluie, n’importe lequel',
    `${ANY} « umbrella » commence par un son de voyelle : an.`,
  ),
  sentence('It took me', 'an', 'hour to get home.', 'une heure de trajet', 'Le h de « hour » ne s’entend pas : an.'),
  sentence('Look at', 'the', 'moon!', 'la Lune', 'Il n’y en a qu’une, tout le monde sait de quoi on parle : the.'),
  sentence('I’ve got a dog.', 'the', 'dog is black.', 'on reparle du même chien', 'Le chien a déjà été cité : the.'),
  sentence(
    'Dad, can I borrow',
    'the',
    'car?',
    'la voiture de la famille',
    'On sait de quelle voiture il s’agit : the.',
  ),
  {
    ...sentence('She plays', 'the', 'piano very well.', 'un instrument de musique', 'Devant un instrument joué : the.'),
    noZero: true,
  },
  sentence('They live in', 'the', 'United Kingdom.', 'le Royaume-Uni', 'Un nom de pays avec « Kingdom » prend the.'),
  sentence('', 'Ø', 'birds eat worms.', 'les oiseaux en général', GENERAL),
  sentence('', 'Ø', 'children need a lot of sleep.', 'les enfants en général', GENERAL),
  sentence('', 'Ø', 'water freezes at 0°C.', 'l’eau en général', GENERAL),
  sentence(
    'I go to',
    'Ø',
    'school at eight.',
    'j’y vais comme élève',
    '« go to school » (comme élève) : aucun article.',
  ),
  sentence('She goes to', 'Ø', 'bed at nine.', 'elle va se coucher', '« go to bed » : aucun article.'),
  sentence('My cousin lives in', 'Ø', 'London.', 'le nom d’une ville', 'Pas d’article devant le nom d’une ville.'),
];

export interface Translation {
  readonly fr: string;
  /** Mots anglais donnés, sans les articles. */
  readonly words: string;
  readonly accepted: readonly string[];
  readonly wrong: readonly (readonly [string, string])[];
  readonly why: string;
}

const translation = (
  fr: string,
  words: string,
  accepted: readonly string[],
  wrong: readonly (readonly [string, string])[],
  why: string,
): Translation => ({ fr, words, accepted, wrong, why });
const NO_THE = 'On parle en général : pas de « the ».';
const NEED_A = 'Au singulier, une chose que l’on peut compter ne reste pas seule : il faut un article.';

export const TRANSLATIONS: readonly Translation[] = [
  translation(
    'Les chats aiment le lait. (en général)',
    'cats / like / milk',
    ['Cats like milk'],
    [
      ['The cats like the milk', NO_THE],
      ['The cats like milk', NO_THE],
      ['Cats like the milk', NO_THE],
    ],
    GENERAL,
  ),
  translation(
    'Les enfants ont besoin de sommeil. (en général)',
    'children / need / sleep',
    ['Children need sleep'],
    [
      ['The children need sleep', NO_THE],
      ['Children need the sleep', NO_THE],
      ['Children need a sleep', GENERAL],
    ],
    GENERAL,
  ),
  translation(
    'Elle est médecin.',
    'she / is / doctor',
    ['She is a doctor', 'She’s a doctor'],
    [
      ['She is doctor', 'En anglais, un métier prend « a » ou « an ».'],
      ['She is the doctor', '« the doctor » désignerait un médecin déjà connu. Ici, on dit son métier.'],
      ['She is an doctor', '« doctor » commence par un son de consonne : a.'],
    ],
    JOB,
  ),
  translation(
    'Il est architecte.',
    'he / is / architect',
    ['He is an architect', 'He’s an architect'],
    [
      ['He is architect', 'En anglais, un métier prend « a » ou « an ».'],
      ['He is a architect', '« architect » commence par un son de voyelle : an.'],
      ['He is the architect', '« the architect » désignerait un architecte déjà connu. Ici, on dit son métier.'],
    ],
    JOB,
  ),
  translation(
    'J’ai besoin d’un parapluie. (n’importe lequel)',
    'I / need / umbrella',
    ['I need an umbrella'],
    [
      ['I need umbrella', NEED_A],
      ['I need a umbrella', '« umbrella » commence par un son de voyelle : an.'],
      ['I need the umbrella', '« the umbrella » désignerait un parapluie précis.'],
    ],
    ANY,
  ),
  translation(
    'Regarde la Lune !',
    'look at / moon',
    ['Look at the moon'],
    [
      ['Look at moon', NEED_A],
      ['Look at a moon', 'La Lune est unique : the.'],
    ],
    'Il n’y a qu’une Lune : the.',
  ),
  translation(
    'Elle joue du piano.',
    'she / plays / piano',
    ['She plays the piano', 'She plays piano'],
    [['She plays a piano', 'Devant un instrument joué, on emploie « the ».']],
    'Un instrument de musique joué : the.',
  ),
  translation(
    'Je vais à l’école à huit heures. (comme élève)',
    'I / go to / school / at eight',
    ['I go to school at eight'],
    [
      ['I go to the school at eight', 'Comme élève, on dit « go to school », sans article.'],
      ['I go to a school at eight', 'Comme élève, on dit « go to school », sans article.'],
    ],
    '« go to school » : aucun article.',
  ),
];

export interface Plural {
  readonly one: string;
  readonly many: string;
  /** Sens au singulier, en français. */
  readonly fr: string;
  /** Écritures fausses typiques, toutes différentes du bon pluriel. */
  readonly wrong: readonly [string, string];
}

/** Pluriels irréguliers cités par le programme (6e). « persons » existe : il n'est ni demandé ni piégé. */
export const PLURALS: readonly Plural[] = [
  { one: 'man', many: 'men', fr: 'homme', wrong: ['mans', 'mens'] },
  { one: 'woman', many: 'women', fr: 'femme', wrong: ['womans', 'womens'] },
  { one: 'child', many: 'children', fr: 'enfant', wrong: ['childs', 'childrens'] },
  { one: 'foot', many: 'feet', fr: 'pied', wrong: ['foots', 'feets'] },
  { one: 'tooth', many: 'teeth', fr: 'dent', wrong: ['tooths', 'teeths'] },
  { one: 'person', many: 'people', fr: 'personne', wrong: ['persones', 'peoplees'] },
  { one: 'mouse', many: 'mice', fr: 'souris', wrong: ['mices', 'mousees'] },
  { one: 'knife', many: 'knives', fr: 'couteau', wrong: ['knifes', 'knive'] },
];

export interface Shown {
  readonly one: string;
  readonly many: string;
}

export const SHOWN: readonly Shown[] = [
  { one: 'book', many: 'books' },
  { one: 'bag', many: 'bags' },
  { one: 'ball', many: 'balls' },
  { one: 'bike', many: 'bikes' },
  { one: 'poster', many: 'posters' },
  { one: 'game', many: 'games' },
  { one: 'pen', many: 'pens' },
];

export interface Described {
  readonly one: string;
  readonly many: string;
  readonly fr: string;
  readonly frMany: string;
  readonly feminine: boolean;
}

const described = (one: string, many: string, fr: string, frMany: string, feminine = false): Described => ({
  one,
  many,
  fr,
  frMany,
  feminine,
});
export const THINGS: readonly Described[] = [
  described('house', 'houses', 'maison', 'maisons', true),
  described('car', 'cars', 'voiture', 'voitures', true),
  described('bag', 'bags', 'sac', 'sacs'),
  described('box', 'boxes', 'boîte', 'boîtes', true),
  described('dog', 'dogs', 'chien', 'chiens'),
  described('cat', 'cats', 'chat', 'chats'),
  described('mouse', 'mice', 'souris', 'souris', true),
];

export interface Adjective {
  readonly en: string;
  readonly alt?: string;
  /** Masculin, féminin, masculin pluriel, féminin pluriel. */
  readonly fr: readonly [string, string, string, string];
}

export const SIZES: readonly Adjective[] = [
  { en: 'big', fr: ['grand', 'grande', 'grands', 'grandes'] },
  { en: 'small', alt: 'little', fr: ['petit', 'petite', 'petits', 'petites'] },
];

export const COLOURS: readonly Adjective[] = [
  { en: 'black', fr: ['noir', 'noire', 'noirs', 'noires'] },
  { en: 'white', fr: ['blanc', 'blanche', 'blancs', 'blanches'] },
  { en: 'grey', alt: 'gray', fr: ['gris', 'grise', 'gris', 'grises'] },
  { en: 'brown', fr: ['marron', 'marron', 'marron', 'marron'] },
];

export interface Owner {
  /** Possesseur en anglais, sans la marque du génitif. */
  readonly en: string;
  /** « de Tom », « de mes parents ». */
  readonly fr: string;
  /** one : un seul ; s : un seul, terminé par s ; plural : pluriel en -s ; irregular : pluriel irrégulier. */
  readonly kind: 'one' | 's' | 'plural' | 'irregular';
}

const owner = (en: string, fr: string, kind: Owner['kind'] = 'one'): Owner => ({ en, fr, kind });
export const OWNERS: readonly Owner[] = [
  owner('Tom', 'de Tom'),
  owner('Greg', 'de Greg'),
  owner('Harry', 'de Harry'),
  owner('Lisa', 'de Lisa'),
  owner('my friend', 'de mon ami'),
  owner('my sister', 'de ma sœur'),
  owner('James', 'de James', 's'),
  owner('Chris', 'de Chris', 's'),
  owner('my parents', 'de mes parents', 'plural'),
  owner('the twins', 'des jumeaux', 'plural'),
  owner('my cousins', 'de mes cousins', 'plural'),
  owner('the girls', 'des filles', 'plural'),
  owner('the children', 'des enfants', 'irregular'),
  owner('the women', 'des femmes', 'irregular'),
  owner('the men', 'des hommes', 'irregular'),
];

/** Choses possédées : mot anglais et groupe français avec article. */
export const OWNED: readonly (readonly [string, string])[] = [
  ['bike', 'le vélo'],
  ['bag', 'le sac'],
  ['dog', 'le chien'],
  ['room', 'la chambre'],
  ['house', 'la maison'],
  ['garden', 'le jardin'],
  ['ball', 'le ballon'],
];
