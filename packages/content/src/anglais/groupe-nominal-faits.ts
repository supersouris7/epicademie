/**
 * Anglais CM2, « Le groupe nominal » (lot an-cm2-01) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme du cycle 3). Les
 * espaces et retours à la ligne sont réduits à une espace.
 */
import type { Fait } from './presentation-faits.ts';

export type PluralRule = 's' | 'es' | 'ies' | 'irregulier';

export interface Noun {
  readonly one: string;
  readonly many: string;
  /** Sens au singulier, en français. */
  readonly fr: string;
  readonly rule: PluralRule;
  /** Écritures fausses typiques du pluriel (hors singulier), toutes différentes du bon pluriel. */
  readonly wrong: readonly [string, string];
}

/** Noms et pluriels : tous tirés de la page « Count nouns ». */
export const NOUNS: readonly Noun[] = [
  { one: 'book', many: 'books', fr: 'livre', rule: 's', wrong: ['bookes', 'book’s'] },
  { one: 'school', many: 'schools', fr: 'école', rule: 's', wrong: ['schooles', 'school’s'] },
  { one: 'friend', many: 'friends', fr: 'ami', rule: 's', wrong: ['friendes', 'friend’s'] },
  { one: 'teacher', many: 'teachers', fr: 'professeur', rule: 's', wrong: ['teacheres', 'teacher’s'] },
  { one: 'idea', many: 'ideas', fr: 'idée', rule: 's', wrong: ['ideaes', 'idea’s'] },
  { one: 'boy', many: 'boys', fr: 'garçon', rule: 's', wrong: ['boies', 'boyes'] },
  { one: 'day', many: 'days', fr: 'jour', rule: 's', wrong: ['daies', 'dayes'] },
  { one: 'class', many: 'classes', fr: 'classe', rule: 'es', wrong: ['classs', 'class’s'] },
  { one: 'watch', many: 'watches', fr: 'montre', rule: 'es', wrong: ['watchs', 'watch’s'] },
  { one: 'wish', many: 'wishes', fr: 'souhait', rule: 'es', wrong: ['wishs', 'wish’s'] },
  { one: 'box', many: 'boxes', fr: 'boîte', rule: 'es', wrong: ['boxs', 'box’s'] },
  { one: 'potato', many: 'potatoes', fr: 'pomme de terre', rule: 'es', wrong: ['potatos', 'potato’s'] },
  { one: 'lady', many: 'ladies', fr: 'dame', rule: 'ies', wrong: ['ladys', 'ladyes'] },
  { one: 'country', many: 'countries', fr: 'pays', rule: 'ies', wrong: ['countrys', 'countryes'] },
  { one: 'party', many: 'parties', fr: 'fête', rule: 'ies', wrong: ['partys', 'partyes'] },
  { one: 'man', many: 'men', fr: 'homme', rule: 'irregulier', wrong: ['mans', 'mens'] },
  { one: 'woman', many: 'women', fr: 'femme', rule: 'irregulier', wrong: ['womans', 'womens'] },
  { one: 'child', many: 'children', fr: 'enfant', rule: 'irregulier', wrong: ['childs', 'childrens'] },
  { one: 'foot', many: 'feet', fr: 'pied', rule: 'irregulier', wrong: ['foots', 'feets'] },
  // « persons » existe en anglais formel : « person » n'est jamais demandé en saisie.
  { one: 'person', many: 'people', fr: 'personne', rule: 'irregulier', wrong: ['persones', 'peoplese'] },
];

/** Mot qui suit l'article ; `an` quand il commence par un son de voyelle. */
export interface ArticleWord {
  readonly word: string;
  readonly article: 'a' | 'an';
  readonly fr: string;
}

/** Cas réguliers : la première lettre et le premier son vont ensemble (pages « Articles » du British Council). */
export const ARTICLE_WORDS: readonly ArticleWord[] = [
  { word: 'pencil', article: 'a', fr: 'un crayon' },
  { word: 'banana', article: 'a', fr: 'une banane' },
  { word: 'lion', article: 'a', fr: 'un lion' },
  { word: 'sandwich', article: 'a', fr: 'un sandwich' },
  { word: 'car', article: 'a', fr: 'une voiture' },
  { word: 'book', article: 'a', fr: 'un livre' },
  { word: 'dog', article: 'a', fr: 'un chien' },
  { word: 'eraser', article: 'an', fr: 'une gomme' },
  { word: 'umbrella', article: 'an', fr: 'un parapluie' },
  { word: 'elephant', article: 'an', fr: 'un éléphant' },
  { word: 'apple', article: 'an', fr: 'une pomme' },
  { word: 'orange', article: 'an', fr: 'une orange' },
];

/** Cas qui piègent : un adjectif passe devant, ou le son ne suit pas la lettre. */
export const ARTICLE_TRICKY: readonly (ArticleWord & { readonly why: string })[] = [
  ...(
    [
      ['big umbrella', 'a', 'un grand parapluie'],
      ['orange pencil', 'an', 'un crayon orange'],
      ['old car', 'an', 'une vieille voiture'],
      ['big orange', 'a', 'une grosse orange'],
      ['old book', 'an', 'un vieux livre'],
      ['small elephant', 'a', 'un petit éléphant'],
      ['orange ball', 'an', 'un ballon orange'],
      ['white umbrella', 'a', 'un parapluie blanc'],
    ] as const
  ).map(([word, article, fr]) => ({
    word,
    article,
    fr,
    why: `Regarde le mot juste après : « ${word.split(' ')[0] ?? ''} » commence par un son de ${article === 'an' ? 'voyelle' : 'consonne'}.`,
  })),
  {
    word: 'university',
    article: 'a',
    fr: 'une université',
    why: '« university » commence par le son « you » : ce n’est pas un son de voyelle.',
  },
  {
    word: 'hour',
    article: 'an',
    fr: 'une heure',
    why: 'Dans « hour », le h ne s’entend pas : le mot commence par un son de voyelle.',
  },
];

/** Objets montrés avec this, that, these, those (singulier et pluriel). */
export const SHOWN: readonly { readonly one: string; readonly many: string; readonly fr: string }[] = [
  { one: 'book', many: 'books', fr: 'livre' },
  { one: 'pen', many: 'pens', fr: 'stylo' },
  { one: 'game', many: 'games', fr: 'jeu' },
  { one: 'toy', many: 'toys', fr: 'jouet' },
  { one: 'ball', many: 'balls', fr: 'ballon' },
  { one: 'bike', many: 'bikes', fr: 'vélo' },
  { one: 'teacher', many: 'teachers', fr: 'professeur' },
  { one: 'friend', many: 'friends', fr: 'ami' },
];

/** Nom décrit par un adjectif : formes françaises accordées. */
export interface Thing {
  readonly one: string;
  readonly many: string;
  readonly fr: string;
  readonly frMany: string;
  readonly feminine: boolean;
  /** Un animal : seules les couleurs naturelles sont proposées. */
  readonly animal: boolean;
}

export const THINGS: readonly Thing[] = [
  { one: 'ball', many: 'balls', fr: 'ballon', frMany: 'ballons', feminine: false, animal: false },
  { one: 'car', many: 'cars', fr: 'voiture', frMany: 'voitures', feminine: true, animal: false },
  { one: 'bag', many: 'bags', fr: 'sac', frMany: 'sacs', feminine: false, animal: false },
  { one: 'box', many: 'boxes', fr: 'boîte', frMany: 'boîtes', feminine: true, animal: false },
  { one: 'cat', many: 'cats', fr: 'chat', frMany: 'chats', feminine: false, animal: true },
  { one: 'dog', many: 'dogs', fr: 'chien', frMany: 'chiens', feminine: false, animal: true },
  { one: 'bird', many: 'birds', fr: 'oiseau', frMany: 'oiseaux', feminine: false, animal: true },
];

export interface Adjective {
  readonly en: string;
  readonly alt?: string;
  /** Masculin, féminin, masculin pluriel, féminin pluriel. */
  readonly fr: readonly [string, string, string, string];
}

export const SIZES: readonly Adjective[] = [
  { en: 'big', fr: ['grand', 'grande', 'grands', 'grandes'] },
  { en: 'small', fr: ['petit', 'petite', 'petits', 'petites'] },
];

export const NATURAL_COLOURS: readonly Adjective[] = [
  { en: 'black', fr: ['noir', 'noire', 'noirs', 'noires'] },
  { en: 'white', fr: ['blanc', 'blanche', 'blancs', 'blanches'] },
  { en: 'grey', alt: 'gray', fr: ['gris', 'grise', 'gris', 'grises'] },
];

export const ALL_COLOURS: readonly Adjective[] = [
  ...NATURAL_COLOURS,
  { en: 'blue', fr: ['bleu', 'bleue', 'bleus', 'bleues'] },
  { en: 'red', fr: ['rouge', 'rouge', 'rouges', 'rouges'] },
  { en: 'green', fr: ['vert', 'verte', 'verts', 'vertes'] },
];

export const FAITS: readonly Fait[] = [
  {
    id: 'programme-groupe-nominal',
    sourceId: 'cycle3-2020',
    quote: 'Le nom et le pronom ; le genre et le nombre ; les articles ; les possessifs ; les démonstratifs ;',
    claim: 'Le nombre des noms, les articles et les démonstratifs sont au programme du cycle 3.',
  },
  {
    id: 'programme-adjectif',
    sourceId: 'cycle3-2020',
    quote: 'l’adjectif qualificatif : sa place, son accord',
    claim: 'La place et l’accord de l’adjectif sont au programme du cycle 3.',
  },
  {
    id: 'pluriel-nombre',
    sourceId: 'bc-count-nouns',
    quote: 'Plural count nouns refer to more than one person or thing',
    claim: 'Le pluriel désigne plusieurs personnes ou choses.',
  },
  {
    id: 'pluriel-s',
    sourceId: 'bc-count-nouns',
    quote: 'We usually add –s to make a plural noun: book>books school>schools friend>friends',
    claim: 'En général, on ajoute -s.',
  },
  {
    id: 'pluriel-es',
    sourceId: 'bc-count-nouns',
    quote:
      'We add –es to nouns ending in –s, –ch, –sh, –ss, –x and –o: class>classes watch>watches gas>gases wish>wishes box>boxes potato>potatoes',
    claim: 'Après -s, -ch, -sh, -ss, -x et -o, on ajoute -es.',
  },
  {
    id: 'pluriel-ies',
    sourceId: 'bc-count-nouns',
    quote:
      'When a noun ends in a consonant and –y, we make the plural with –ies: lady>ladies country>countries party>parties',
    claim: 'Consonne + y : le pluriel est en -ies.',
  },
  {
    id: 'pluriel-voyelle-y',
    sourceId: 'bc-count-nouns',
    quote: 'If a noun ends in a vowel and –y, we simply add –s: boy>boys day>days',
    claim: 'Voyelle + y : on ajoute -s.',
  },
  {
    id: 'pluriel-irreguliers',
    sourceId: 'bc-count-nouns',
    quote: 'Some common nouns have irregular plurals: man>men woman>women child>children person>people foot>feet',
    claim: 'man, woman, child, person et foot ont un pluriel irrégulier.',
  },
  {
    id: 'pluriel-exemples',
    sourceId: 'bc-count-nouns',
    quote: 'teachers books wishes ideas',
    claim: 'teachers, books, wishes et ideas sont des pluriels.',
  },
  {
    id: 'article-singulier',
    sourceId: 'bck-articles',
    quote: 'We use a and an with singular nouns. We use a before a consonant sound and an before a vowel sound.',
    claim: 'a et an vont avec un nom singulier ; le choix dépend du son qui suit.',
  },
  {
    id: 'article-exemples',
    sourceId: 'bck-articles',
    quote: "I've got a pencil and an eraser. There's a big umbrella and an orange pencil case in my bag.",
    claim: 'On dit a pencil, an eraser, a big umbrella, an orange pencil case.',
  },
  {
    id: 'article-the',
    sourceId: 'bck-articles',
    quote: 'The first time we mention a noun, we use a or an. The next time, we use the.',
    claim: 'La première fois a ou an, ensuite the.',
  },
  {
    id: 'article-reprise',
    sourceId: 'bck-articles',
    quote: "We've got an old car. The car is blue.",
    claim: 'an old car, puis the car.',
  },
  {
    id: 'article-son',
    sourceId: 'bc-indefinite-article',
    quote: 'a banana (starts with /b/) a university (starts with /j/)',
    claim: 'On dit a university, à cause du son.',
  },
  {
    id: 'article-heure',
    sourceId: 'bc-indefinite-article',
    quote:
      'an orange (starts with /o/) an hour (starts with /au/) Note that the choice of a or an depends on sound, not spelling.',
    claim: 'On dit an hour : le choix dépend du son, pas de l’écriture.',
  },
  {
    id: 'article-pluriel',
    sourceId: 'bc-indefinite-article',
    quote: 'We do not use an indefinite article with plural nouns',
    claim: 'Pas de a ni de an devant un pluriel.',
  },
  {
    id: 'demonstratif-distance',
    sourceId: 'bck-this-that',
    quote:
      'We can use this and these to talk about things near us. We can use that and those to talk about things far away.',
    claim: 'this et these : près ; that et those : loin.',
  },
  {
    id: 'demonstratif-pres',
    sourceId: 'bck-this-that',
    quote: 'Use this and these to talk about things near us. Use this for one thing and these for more than one.',
    claim: 'this pour une seule chose proche, these pour plusieurs.',
  },
  {
    id: 'demonstratif-loin',
    sourceId: 'bck-this-that',
    quote: 'Use that and those to talk about things far away. Use that for one thing and those for more than one.',
    claim: 'that pour une seule chose éloignée, those pour plusieurs.',
  },
  {
    id: 'demonstratif-avec-nom',
    sourceId: 'bc-demonstratives',
    quote: 'We can also use this, these, that and those with nouns.',
    claim: 'Les démonstratifs peuvent se placer devant un nom.',
  },
  {
    id: 'adjectif-role',
    sourceId: 'bck-adjectives',
    quote: "We can use adjectives to describe people, places and things. We've got a small car. I saw a white bird.",
    claim: 'L’adjectif décrit : a small car, a white bird.',
  },
  {
    id: 'adjectif-invariable',
    sourceId: 'bck-adjectives',
    quote: "We don't add s to the adjective when it's plural.",
    claim: 'L’adjectif ne prend pas de s au pluriel.',
  },
  {
    id: 'adjectif-exemple-pluriel',
    sourceId: 'bck-adjectives',
    quote: "We've got three black cats.",
    claim: 'On dit three black cats.',
  },
  {
    id: 'adjectif-taille-couleur',
    sourceId: 'bck-adjectives',
    quote: "Put size adjectives before colour adjectives. I've got a big, blue ball.",
    claim: 'La taille se place avant la couleur.',
  },
  {
    id: 'adjectif-avant-nom',
    sourceId: 'bc-noun-phrases',
    quote: 'These parts of the noun phrase are called premodifiers because they go before the noun.',
    claim: 'Les adjectifs d’un groupe nominal se placent avant le nom.',
  },
  {
    id: 'adjectif-ordre-groupe',
    sourceId: 'bc-noun-phrases',
    quote: 'determiners and quantifiers>numbers>adjectives + NOUNS',
    claim: 'Ordre : déterminant, nombre, adjectif, nom.',
  },
  {
    id: 'adjectif-apres-be',
    sourceId: 'bck-adjectives',
    quote: 'My brothers are short.',
    claim: 'Après le verbe be, l’adjectif suit le verbe.',
  },
];
