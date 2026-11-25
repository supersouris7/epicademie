/**
 * Anglais CM2, « Se situer » (lot an-cm2-02) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages et fiches du British Council ; programme du cycle 3).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme : les quatre notions relèvent du cycle 3 (prépositions de lieu ; environnement urbain et habitat ;
 * dialoguer sur la maison ; décrire des lieux). « there is / there are » n'y est pas nommé : c'est la structure
 * simple qui sert à décrire des lieux.
 */
import type { Fait } from './presentation-faits.ts';
import type { Word } from './temps-faits.ts';

// ——— there is / there are ———
export interface Countable {
  readonly one: string;
  readonly many: string;
  /** Avec l'article français : « un chien ». */
  readonly fr: string;
  readonly frMany: string;
}
const thing = (one: string, fr: string, frMany: string, many = `${one}s`): Countable => ({ one, many, fr, frMany });

/** Lieux et ce qu'on peut raisonnablement y trouver. */
export const SCENES: readonly { readonly en: string; readonly fr: string; readonly things: readonly Countable[] }[] = [
  {
    en: 'in the bedroom',
    fr: 'dans la chambre',
    things: [thing('bed', 'un lit', 'lits'), thing('lamp', 'une lampe', 'lampes'), thing('cat', 'un chat', 'chats')],
  },
  {
    en: 'in the garden',
    fr: 'dans le jardin',
    things: [
      thing('dog', 'un chien', 'chiens'),
      thing('chair', 'une chaise', 'chaises'),
      thing('table', 'une table', 'tables'),
    ],
  },
  {
    en: 'in the living room',
    fr: 'dans le salon',
    things: [
      thing('sofa', 'un canapé', 'canapés'),
      thing('armchair', 'un fauteuil', 'fauteuils'),
      thing('window', 'une fenêtre', 'fenêtres'),
    ],
  },
  {
    en: 'in my town',
    fr: 'dans ma ville',
    things: [
      thing('park', 'un parc', 'parcs'),
      thing('bank', 'une banque', 'banques'),
      thing('school', 'une école', 'écoles'),
    ],
  },
];

/** Lieux comptés sur les notes du niveau 5 (tous commencent par un son de consonne : « a »). */
export const COUNTED_PLACES: readonly Countable[] = [
  thing('bank', 'une banque', 'banques'),
  thing('shop', 'un magasin', 'magasins'),
  thing('park', 'un parc', 'parcs'),
  thing('school', 'une école', 'écoles'),
  thing('cinema', 'un cinéma', 'cinémas'),
  thing('library', 'une bibliothèque', 'bibliothèques', 'libraries'),
];

// ——— Prépositions de lieu ———
export interface Preposition {
  readonly en: string;
  readonly fr: string;
  /** Autres écritures anglaises acceptées. */
  readonly alt: readonly string[];
  readonly typo: string;
  /** Phrase à trou et sa traduction. */
  readonly sentence: readonly [before: string, after: string];
  readonly sentenceFr: string;
}

export const PREPOSITIONS: readonly Preposition[] = [
  {
    en: 'in',
    fr: 'dans',
    alt: ['inside'],
    typo: 'inn',
    sentence: ['The cat is', 'the box.'],
    sentenceFr: 'Le chat est dans la boîte.',
  },
  {
    en: 'on',
    fr: 'sur',
    alt: ['on top of'],
    typo: 'one',
    sentence: ['The book is', 'the table.'],
    sentenceFr: 'Le livre est sur la table.',
  },
  {
    en: 'under',
    fr: 'sous',
    alt: ['underneath', 'below'],
    typo: 'undur',
    sentence: ['The dog is', 'the bed.'],
    sentenceFr: 'Le chien est sous le lit.',
  },
  {
    en: 'next to',
    fr: 'à côté de',
    alt: ['beside'],
    typo: 'next at',
    sentence: ['The chair is', 'the door.'],
    sentenceFr: 'La chaise est à côté de la porte.',
  },
  {
    en: 'in front of',
    fr: 'devant',
    alt: [],
    typo: 'in front',
    sentence: ['The car is', 'the house.'],
    sentenceFr: 'La voiture est devant la maison.',
  },
  {
    en: 'behind',
    fr: 'derrière',
    alt: [],
    typo: 'behing',
    sentence: ['The ball is', 'the sofa.'],
    sentenceFr: 'Le ballon est derrière le canapé.',
  },
  {
    en: 'between',
    fr: 'entre',
    alt: ['in between'],
    typo: 'betwen',
    sentence: ['The lamp is', 'the bed and the wardrobe.'],
    sentenceFr: 'La lampe est entre le lit et l’armoire.',
  },
  {
    en: 'opposite',
    fr: 'en face de',
    alt: ['across from'],
    typo: 'oposite',
    sentence: ['The bank is', 'the school.'],
    sentenceFr: 'La banque est en face de l’école.',
  },
];

/** at, in ou on : le français ne dit pas la même chose (pages « Prepositions of place » du British Council). */
export const FIXED_PLACES: readonly {
  readonly en: 'at' | 'in' | 'on';
  readonly sentence: readonly [string, string];
  readonly fr: string;
  readonly why: string;
}[] = [
  {
    en: 'at',
    sentence: ['I’m', 'home.'],
    fr: 'Je suis à la maison.',
    why: 'On dit « at home » : « at » pour un lieu où l’on fait quelque chose.',
  },
  { en: 'at', sentence: ['My mum is', 'work.'], fr: 'Ma mère est au travail.', why: 'On dit « at work ».' },
  {
    en: 'at',
    sentence: ['I live', '15 Craig Street.'],
    fr: 'J’habite au 15, Craig Street.',
    why: 'Devant une adresse avec un numéro, on met « at ».',
  },
  {
    en: 'on',
    sentence: ['There are pictures', 'the wall.'],
    fr: 'Il y a des images au mur.',
    why: 'Les images sont posées contre une surface : « on the wall ».',
  },
  {
    en: 'on',
    sentence: ['We live', 'the fifth floor.'],
    fr: 'Nous habitons au cinquième étage.',
    why: 'Pour un étage, on dit « on » : on the fifth floor.',
  },
  {
    en: 'in',
    sentence: ['It’s the best park', 'the world.'],
    fr: 'C’est le meilleur parc du monde.',
    why: 'On dit « in the world » (dans le monde).',
  },
];

/** Meubles des notes du niveau 5, avec les prépositions qui vont bien avec chacun. */
export const SPOTS: readonly {
  readonly en: string;
  readonly fr: string;
  /** Forme après « à côté ». */
  readonly de: string;
  readonly with: readonly string[];
}[] = [
  { en: 'bed', fr: 'le lit', de: 'du lit', with: ['on', 'under', 'next to'] },
  { en: 'table', fr: 'la table', de: 'de la table', with: ['on', 'under', 'next to'] },
  { en: 'sofa', fr: 'le canapé', de: 'du canapé', with: ['on', 'behind', 'in front of', 'next to'] },
  { en: 'wardrobe', fr: 'l’armoire', de: 'de l’armoire', with: ['in', 'in front of', 'next to'] },
  { en: 'box', fr: 'la boîte', de: 'de la boîte', with: ['in', 'behind', 'next to'] },
];

export const LOOSE_THINGS: readonly Countable[] = [
  thing('cat', 'un chat', 'chats'),
  thing('ball', 'un ballon', 'ballons'),
  thing('bag', 'un sac', 'sacs'),
  thing('book', 'un livre', 'livres'),
  thing('toy', 'un jouet', 'jouets'),
];

// ——— La maison ———
const w = (en: string, fr: string, typo: string, alt?: readonly string[]): Word => ({
  en,
  fr,
  typo,
  ...(alt ? { alt } : {}),
});

/** Mots des fiches « Home » et « Furniture » (« garage » et « table », écrits comme en français, restent hors des questions). */
export const HOUSE: readonly Word[] = [
  w('house', 'maison', 'hous'),
  w('bedroom', 'chambre', 'bedrom'),
  w('bathroom', 'salle de bains', 'bathrom'),
  w('kitchen', 'cuisine (la pièce)', 'kichen'),
  w('garden', 'jardin', 'gardin', ['yard']),
  w('door', 'porte', 'dor'),
  w('window', 'fenêtre', 'windo'),
  w('bed', 'lit', 'bedd'),
  w('chair', 'chaise', 'chear'),
  w('living room', 'salon', 'living rom', ['sitting room', 'lounge']),
  w('dining room', 'salle à manger', 'dinning room'),
  w('hall', 'entrée', 'haul', ['hallway', 'entrance hall']),
  w('balcony', 'balcon', 'balcon'),
  w('stairs', 'escalier', 'sters', ['staircase']),
  w('roof', 'toit', 'rouf'),
  w('wardrobe', 'armoire à vêtements', 'wardrob', ['closet']),
  w('shelf', 'étagère', 'shelv'),
  w('lamp', 'lampe', 'lampe'),
  w('sofa', 'canapé', 'soffa', ['couch', 'settee']),
  w('armchair', 'fauteuil', 'armchear', ['arm chair']),
  w('bookcase', 'bibliothèque (le meuble)', 'bookase', ['bookshelf', 'book case']),
  w('cupboard', 'placard', 'cubboard'),
  w('fridge', 'réfrigérateur', 'frige', ['refrigerator']),
  w('oven', 'four', 'ovan'),
  w('shower', 'douche', 'shouer'),
  w('bath', 'baignoire', 'baf', ['bathtub']),
  w('sink', 'évier', 'sinc'),
  w('toilet', 'toilettes', 'toilette', ['toilets']),
];

export const HOUSE_RIDDLES: readonly { readonly en: string; readonly clue: string }[] = [
  { en: 'fridge', clue: 'Cet appareil garde le lait au froid.' },
  { en: 'oven', clue: 'Cet appareil chauffe pour cuire un gâteau.' },
  { en: 'kitchen', clue: 'C’est la pièce où l’on prépare les repas.' },
  { en: 'bedroom', clue: 'C’est la pièce où tu dors.' },
  { en: 'living room', clue: 'C’est la pièce avec le canapé, où l’on se repose ensemble.' },
  { en: 'dining room', clue: 'C’est la pièce faite pour manger à table.' },
  { en: 'stairs', clue: 'Tu montes ces marches pour aller à l’étage.' },
  { en: 'roof', clue: 'Il couvre le haut de la maison et la protège de la pluie.' },
  { en: 'wardrobe', clue: 'C’est le grand meuble où l’on suspend les vêtements.' },
  { en: 'armchair', clue: 'C’est un siège confortable avec des bras, pour une seule personne.' },
  { en: 'bookcase', clue: 'C’est un meuble à étagères pour ranger les livres.' },
  { en: 'shower', clue: 'Tu te laves debout sous cette eau qui tombe.' },
];

/** Pièce à deviner (niveau 5) : indices en anglais, sans le nom de la pièce. */
export const ROOMS: readonly { readonly en: string; readonly lines: readonly string[] }[] = [
  {
    en: 'bedroom',
    lines: ['There is a bed.', 'There is a wardrobe next to the bed.', 'I sleep here.'],
  },
  {
    en: 'bathroom',
    lines: ['There is a shower.', 'There is a bath opposite the door.', 'I wash here.'],
  },
  {
    en: 'kitchen',
    lines: ['There is a fridge next to the oven.', 'There are cupboards on the wall.', 'We cook here.'],
  },
  {
    en: 'living room',
    lines: ['There is a big sofa.', 'There are two armchairs in front of the TV.', 'We watch TV here.'],
  },
  {
    en: 'dining room',
    lines: ['There are six chairs around a big table.', 'We have dinner here.', 'We cook in another room.'],
  },
  {
    en: 'garden',
    lines: ['There is a big tree.', 'There are flowers behind the house.', 'We play outside here.'],
  },
];

// ——— La ville ———
/** Mots de la fiche « Places in a town » (« statue », écrit comme en français, reste hors des questions de mots). */
export const TOWN: readonly Word[] = [
  w('school', 'école', 'scool'),
  w('library', 'bibliothèque', 'libary'),
  w('cinema', 'cinéma', 'cinima', ['movie theater', 'movie theatre']),
  w('bank', 'banque', 'banc'),
  w('park', 'parc', 'parc'),
  w('street', 'rue', 'stret'),
  w('bridge', 'pont', 'brige'),
  w('theatre', 'théâtre', 'theatr', ['theater']),
  w('stadium', 'stade', 'stadiom'),
  w('airport', 'aéroport', 'aeroport'),
  w('factory', 'usine', 'factori'),
  w('town hall', 'mairie', 'town hal', ['townhall']),
  w('sports centre', 'centre sportif', 'sport centre', ['sports center', 'sport center']),
  w('train station', 'gare', 'train stasion', ['station', 'railway station']),
];

export const TOWN_RIDDLES: readonly { readonly en: string; readonly clue: string }[] = [
  { en: 'library', clue: 'Tu y empruntes des livres.' },
  { en: 'school', clue: 'Les élèves y vont pour apprendre.' },
  { en: 'cinema', clue: 'Tu y regardes un film sur un grand écran.' },
  { en: 'theatre', clue: 'Des comédiens y jouent une pièce sur une scène.' },
  { en: 'bank', clue: 'Les adultes y gardent leur argent.' },
  { en: 'airport', clue: 'Tu y vas pour prendre l’avion.' },
  { en: 'train station', clue: 'Tu y vas pour prendre le train.' },
  { en: 'factory', clue: 'Des ouvriers et des machines y fabriquent des objets.' },
  { en: 'town hall', clue: 'C’est le bâtiment où travaille le maire.' },
  { en: 'bridge', clue: 'Il permet de passer au-dessus d’une rivière.' },
  { en: 'stadium', clue: 'Des milliers de personnes y regardent un grand match.' },
  { en: 'park', clue: 'C’est un espace vert de la ville, avec des arbres.' },
];

/** Lieux placés sur le plan du niveau 5. */
export const MAP_PLACES: readonly string[] = [
  'school',
  'library',
  'cinema',
  'theatre',
  'bank',
  'town hall',
  'sports centre',
  'train station',
  'factory',
  'park',
];

export const FAITS: readonly Fait[] = [
  {
    id: 'programme-prepositions',
    sourceId: 'cycle3-2020',
    quote: 'les principales prépositions (de lieu, de temps...)',
    claim: 'Les prépositions de lieu sont au programme du cycle 3.',
  },
  {
    id: 'programme-ville',
    sourceId: 'cycle3-2020',
    quote:
      "L'environnement urbain : les espaces verts, l’habitat et l’écohabitat (notamment les maisons passives, les toits végétalisés, etc.).",
    claim: 'La ville et l’habitat sont au lexique du cycle 3.',
  },
  {
    id: 'programme-maison',
    sourceId: 'cycle3-2020',
    quote: 'Dialoguer sur des sujets familiers (école, loisirs, maison, etc.).',
    claim: 'La maison est un sujet de dialogue au programme.',
  },
  {
    id: 'programme-decrire',
    sourceId: 'cycle3-2020',
    quote: 'Décrire des objets, des lieux.',
    claim: 'Décrire des lieux (avec there is / there are) est au programme.',
  },
  {
    id: 'there-exister',
    sourceId: 'bc-there-is',
    quote: 'We use there is to say that something exists or is in a place.',
    claim: 'there is dit qu’une chose existe ou se trouve quelque part.',
  },
  {
    id: 'there-nombre',
    sourceId: 'bc-there-is',
    quote: 'We use there is for singular nouns and there are for plural nouns.',
    claim: 'there is avec le singulier, there are avec le pluriel.',
  },
  {
    id: 'there-contraction',
    sourceId: 'bc-there-is',
    quote:
      "We can say there's instead of there is. We often say this when we speak. But there is no short form for there are.",
    claim: 'there’s est la forme courte de there is.',
  },
  {
    id: 'there-negation',
    sourceId: 'bc-there-is',
    quote:
      "For negatives, we use there isn't or there's not (= there is not) for singular and there aren't (= there are not) for plural.",
    claim: 'Négation : there isn’t (singulier), there aren’t (pluriel).',
  },
  {
    id: 'there-any',
    sourceId: 'bc-there-is',
    quote:
      "We often use there isn't a + singular noun, there isn't any + uncountable noun and there aren't any + plural noun.",
    claim: 'On dit there isn’t a… et there aren’t any….',
  },
  {
    id: 'there-question',
    sourceId: 'bc-there-is',
    quote: 'For questions, we say Is there for singular nouns and uncountable nouns and Are there for plural nouns.',
    claim: 'Question : Is there…? (singulier), Are there…? (pluriel).',
  },
  {
    id: 'there-reponse',
    sourceId: 'bc-there-is',
    quote:
      "To answer, we say Yes, there is (not Yes, there's) or No, there isn't, or Yes, there are or No, there aren't.",
    claim: 'Réponse courte : Yes, there is (sans contraction), No, there isn’t.',
  },
  {
    id: 'prep-avant-nom',
    sourceId: 'bck-prepositions-place',
    quote: 'We can use prepositions of place to say where things are.',
    claim: 'Une préposition de lieu dit où est une chose.',
  },
  {
    id: 'prep-sous',
    sourceId: 'bck-prepositions-place',
    quote: "The cat isn't on the chair. It's under the chair!",
    claim: 'on = sur, under = sous.',
  },
  {
    id: 'prep-devant-derriere',
    sourceId: 'bck-prepositions-place',
    quote: "There's a small garden in front of the house, and a big garden behind it.",
    claim: 'in front of = devant, behind = derrière.',
  },
  {
    id: 'prep-a-cote',
    sourceId: 'bck-prepositions-place',
    quote: "I don't like sitting next to my brother in the car.",
    claim: 'next to = à côté de ; in = dans.',
  },
  {
    id: 'prep-entre',
    sourceId: 'bck-prepositions-place',
    quote: 'The library is between the bank and the museum.',
    claim: 'between = entre deux choses.',
  },
  {
    id: 'prep-en-face',
    sourceId: 'bck-prepositions-place',
    quote: 'Is your school opposite the park?',
    claim: 'opposite = en face de.',
  },
  {
    id: 'prep-fiche-1',
    sourceId: 'bck-flashcards-prepositions',
    quote: 'in on under next to',
    claim: 'in, on, under et next to sont des prépositions de lieu.',
  },
  {
    id: 'prep-fiche-2',
    sourceId: 'bck-flashcards-prepositions',
    quote: 'in front of behind between opposite',
    claim: 'in front of, behind, between et opposite sont des prépositions de lieu.',
  },
  {
    id: 'prep-in',
    sourceId: 'bc-prepositions-place',
    quote:
      'We use in to talk about a place that is inside a bigger space, such as a box, a house, a city or a country.',
    claim: 'in : à l’intérieur d’un espace.',
  },
  {
    id: 'prep-in-monde',
    sourceId: 'bc-prepositions-place',
    quote: 'in the world',
    claim: 'On dit in the world.',
  },
  {
    id: 'prep-on',
    sourceId: 'bc-prepositions-place',
    quote: 'We use on to talk about location on a surface.',
    claim: 'on : sur une surface.',
  },
  {
    id: 'prep-mur',
    sourceId: 'bc-prepositions-place',
    quote: 'There are pictures on the wall.',
    claim: 'On dit on the wall.',
  },
  {
    id: 'prep-etage',
    sourceId: 'bc-prepositions-place',
    quote: 'We live on the fifth floor.',
    claim: 'On dit on the fifth floor.',
  },
  {
    id: 'prep-at',
    sourceId: 'bc-prepositions-place',
    quote: 'We use at in many common phrases, especially when we are talking about a place for a specific activity.',
    claim: 'at : lieu d’une activité, dans des expressions courantes.',
  },
  {
    id: 'prep-travail',
    sourceId: 'bc-prepositions-place',
    quote: "I'm at work.",
    claim: 'On dit at work.',
  },
  {
    id: 'prep-maison',
    sourceId: 'bc-prepositions-place',
    quote: "She's working at home today.",
    claim: 'On dit at home.',
  },
  {
    id: 'prep-adresse',
    sourceId: 'bc-prepositions-place',
    quote: 'I live at 15 Craig Street.',
    claim: 'at devant une adresse avec un numéro.',
  },
  {
    id: 'maison-pieces-1',
    sourceId: 'bck-flashcards-home',
    quote: 'house bedroom bathroom living room',
    claim: 'house, bedroom, bathroom, living room.',
  },
  {
    id: 'maison-pieces-2',
    sourceId: 'bck-flashcards-home',
    quote: 'kitchen dining room hall balcony',
    claim: 'kitchen, dining room, hall, balcony.',
  },
  {
    id: 'maison-parties-1',
    sourceId: 'bck-flashcards-home',
    quote: 'garden garage window door',
    claim: 'garden, garage, window, door.',
  },
  {
    id: 'maison-parties-2',
    sourceId: 'bck-flashcards-home',
    quote: 'stairs floor roof bricks',
    claim: 'stairs, roof.',
  },
  {
    id: 'meubles-1',
    sourceId: 'bck-flashcards-furniture',
    quote: 'bed wardrobe shelf lamp',
    claim: 'bed, wardrobe, shelf, lamp.',
  },
  {
    id: 'meubles-2',
    sourceId: 'bck-flashcards-furniture',
    quote: 'sofa armchair bookcase cupboard',
    claim: 'sofa, armchair, bookcase, cupboard.',
  },
  {
    id: 'meubles-3',
    sourceId: 'bck-flashcards-furniture',
    quote: 'fridge oven table chair',
    claim: 'fridge, oven, table, chair.',
  },
  {
    id: 'meubles-4',
    sourceId: 'bck-flashcards-furniture',
    quote: 'shower bath sink toilet',
    claim: 'shower, bath, sink, toilet.',
  },
  {
    id: 'ville-1',
    sourceId: 'bck-flashcards-town',
    quote: 'school library cinema theatre',
    claim: 'school, library, cinema, theatre.',
  },
  {
    id: 'ville-2',
    sourceId: 'bck-flashcards-town',
    quote: 'bank town hall sports centre stadium',
    claim: 'bank, town hall, sports centre, stadium.',
  },
  {
    id: 'ville-3',
    sourceId: 'bck-flashcards-town',
    quote: 'train station airport factory park',
    claim: 'train station, airport, factory, park.',
  },
  {
    id: 'ville-4',
    sourceId: 'bck-flashcards-town',
    quote: 'street bridge statue farm',
    claim: 'street, bridge, statue.',
  },
  {
    id: 'ville-librairie',
    sourceId: 'bc-prepositions-place',
    quote: "There's a bookshop in the shopping centre.",
    claim: 'Un magasin de livres se dit bookshop (et non library).',
  },
];
