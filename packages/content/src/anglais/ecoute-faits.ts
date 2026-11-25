/**
 * Anglais CM1, « Écouter et comprendre » (lot an-cm1-06) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages et fiches PDF du British Council ; programme de langues
 * vivantes du cours moyen, arrêté du 26 février 2026, annexe 2). Les espaces et retours à la ligne des fiches PDF et du
 * programme sont réduits à une espace ; sur les cartes, les mots se suivent dans l'ordre de la fiche.
 */
import { wordOf, type Fait } from './presentation-faits.ts';

/** Nombre de 1 à 100 : cités jusqu'à 24 et pour les dizaines ; les autres suivent « dizaine-unité ». */
export function numberWord(n: number): string {
  if (n === 100) return 'a hundred';
  const cited = wordOf(n);
  if (cited) return cited;
  const unit = n % 10;
  return `${wordOf(n - unit)}-${wordOf(unit)}`;
}

export interface Order {
  /** Consigne anglaise (impératif, sans point). */
  readonly en: string;
  /** Même consigne en français (tutoiement). */
  readonly fr: string;
  /** La même consigne, interdite. */
  readonly not: string;
  /** Faute d'écriture typique. */
  readonly typo: string;
}

/** Consignes : fiche « Classroom language flashcards » (British Council). */
export const ORDERS: readonly Order[] = [
  { en: 'listen', fr: 'Écoute !', not: 'N’écoute pas !', typo: 'lissen' },
  { en: 'be quiet', fr: 'Tais-toi !', not: 'Ne te tais pas !', typo: 'be quite' },
  { en: 'sit down', fr: 'Assieds-toi !', not: 'Ne t’assieds pas !', typo: 'sit doun' },
  { en: 'stand up', fr: 'Lève-toi !', not: 'Ne te lève pas !', typo: 'stend up' },
  { en: 'jump', fr: 'Saute !', not: 'Ne saute pas !', typo: 'jomp' },
  { en: 'turn around', fr: 'Fais un tour sur toi-même !', not: 'Ne tourne pas sur toi-même !', typo: 'turn arond' },
  { en: 'clap', fr: 'Tape dans tes mains !', not: 'Ne tape pas dans tes mains !', typo: 'clapp' },
  { en: 'point', fr: 'Montre du doigt !', not: 'Ne montre pas du doigt !', typo: 'poynt' },
  { en: 'touch', fr: 'Touche !', not: 'Ne touche pas !', typo: 'toutch' },
  { en: 'sing', fr: 'Chante !', not: 'Ne chante pas !', typo: 'singue' },
  { en: 'write', fr: 'Écris !', not: 'N’écris pas !', typo: 'wite' },
  { en: 'colour', fr: 'Colorie !', not: 'Ne colorie pas !', typo: 'coulor' },
  { en: 'cut', fr: 'Découpe !', not: 'Ne découpe pas !', typo: 'cutt' },
  { en: 'tick', fr: 'Coche !', not: 'Ne coche pas !', typo: 'tik' },
  { en: 'circle', fr: 'Entoure !', not: 'N’entoure pas !', typo: 'cirkle' },
  { en: 'underline', fr: 'Souligne !', not: 'Ne souligne pas !', typo: 'underlign' },
];

const PROGRAMME = 'lve-cm-2026';
const CARDS = 'bck-flashcards-classroom';
const UK = 'bck-uk';
const HALLOWEEN = 'bck-halloween-answers';
const XMAS = 'bck-christmas-story';
const BONFIRE = 'bck-bonfire';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });

export const FAITS: readonly Fait[] = [
  fait(
    'programme-consignes',
    PROGRAMME,
    'l’élève peut comprendre l’ensemble des consignes utilisées en classe',
    'Comprendre les consignes de classe est attendu en fin de CM1.',
  ),
  fait(
    'programme-imperatif',
    PROGRAMME,
    'Reconnaitre quelques formes courantes de l’impératif à travers des consignes de classe, des instructions de jeu ou des étapes de recette de cuisine.',
    'L’impératif des consignes est au programme du CM1.',
  ),
  fait(
    'programme-interdiction',
    PROGRAMME,
    'il peut repérer une instruction dans un message (autorisation, obligation ou interdiction) pour s’y conformer',
    'Repérer une interdiction est un objectif (niveau A1+).',
  ),
  fait(
    'programme-chiffres',
    PROGRAMME,
    'Repérer les lettres de l’alphabet et les chiffres pour réaliser une tâche.',
    'Repérer les chiffres à l’oral est au programme du CM1.',
  ),
  fait(
    'programme-compter',
    PROGRAMME,
    'compter en utilisant la suite numérique des nombres (A1+) au-delà de 100.',
    'La suite des nombres est travaillée au CM1.',
  ),
  fait(
    'programme-mots',
    PROGRAMME,
    'il peut comprendre des mots familiers et des expressions courtes dans une conversation simple',
    'Comprendre des mots familiers est attendu en fin de CM1.',
  ),
  fait(
    'programme-informations',
    PROGRAMME,
    'l’élève peut isoler des informations simples dans un message explicite',
    'Isoler une information dans un message est un attendu.',
  ),
  fait(
    'programme-interrogatifs',
    PROGRAMME,
    'Reconnaitre les pronoms interrogatifs usuels',
    'Les mots interrogatifs sont au programme du CM1.',
  ),
  fait(
    'programme-culture',
    PROGRAMME,
    'Par ancrage culturel, il faut comprendre, non pas une thématique culturelle spécifique à aborder, mais une irrigation de l’apprentissage de la langue par des objets et contenus culturels qui le sous-tendent.',
    'Les repères culturels accompagnent l’apprentissage de la langue.',
  ),
  fait(
    'nombres-1-12',
    'bck-flashcards-1-12',
    'one two three four five six seven eight nine ten eleven twelve',
    'Mots-nombres de 1 à 12.',
  ),
  fait(
    'nombres-13-24',
    'bck-flashcards-13-24',
    'thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two twenty-three twenty-four',
    'Mots-nombres de 13 à 24 ; au-delà de 20, un tiret relie la dizaine et l’unité.',
  ),
  fait(
    'dizaines',
    'bck-flashcards-10-1000',
    'ten twenty thirty forty fifty sixty seventy eighty ninety a hundred',
    'Les dizaines de 10 à 90 et 100 (« a hundred »).',
  ),
  fait(
    'consignes-cartes',
    CARDS,
    'listen be quiet sit down stand up jump hop turn around clap point touch discuss sing write trace colour cut tick circle underline play a game',
    'Les consignes de classe en anglais.',
  ),
  fait(
    'consigne-lit',
    'bck-tidy',
    'Make your bed. Throw rubbish in the bin.',
    'À l’impératif, la consigne commence par le verbe, sans sujet.',
  ),
  fait(
    'consigne-livres',
    'bck-tidy',
    'Put books on your bookshelf.',
    'Les livres se rangent sur l’étagère (consigne « Put… »).',
  ),
  fait(
    'consigne-linge',
    'bck-tidy',
    'Put dirty clothes in the washing basket.',
    'Le linge sale va dans le panier à linge.',
  ),
  fait('consigne-poubelle', 'bck-tidy', 'Throw rubbish in the bin.', 'Les déchets vont à la poubelle.'),
  fait(
    'consigne-negative',
    'bck-school-note',
    "Please don't bring expensive things (like tablets or mobile phones) to school.",
    'Une interdiction commence par « don’t » devant le verbe.',
  ),
  fait(
    'royaume-uni-parties',
    UK,
    'England, Scotland, Wales and Northern Ireland are the four parts of the UK.',
    'Le Royaume-Uni compte quatre parties.',
  ),
  fait(
    'angleterre-ecosse',
    UK,
    'England is smaller bigger than Scotland.',
    'Correction de la fiche : l’Angleterre est plus grande que l’Écosse.',
  ),
  fait('drapeau-gallois', UK, 'There’s a dragon on the Welsh flag.', 'Le drapeau gallois porte un dragon.'),
  fait(
    'chaussee-geants',
    UK,
    'Lots of tourists visit the Giant’s Causeway in Northern Ireland.',
    'La Chaussée des Géants est en Irlande du Nord.',
  ),
  fait(
    'union-jack',
    UK,
    'The UK football team flag is often called the ‘Union Jack’.',
    'Correction de la fiche : le drapeau du Royaume-Uni est souvent appelé « Union Jack ».',
  ),
  fait(
    'capitale-angleterre',
    'bck-cities',
    'England’s capital. It has Big Ben, Westminster and Buckingham Palace.',
    'La capitale de l’Angleterre a Big Ben et Buckingham Palace.',
  ),
  fait(
    'londres',
    'bck-postcard-london',
    'write a postcard London Big Ben London Eye Tower Bridge red bus park queen',
    'Londres (London) : Big Ben, London Eye, Tower Bridge.',
  ),
  fait('halloween-date', HALLOWEEN, 'Halloween is on 31 October every year.', 'Halloween a lieu le 31 octobre.'),
  fait(
    'halloween-citrouille',
    HALLOWEEN,
    'Pumpkins with faces cut in them are called ‘jack o’lanterns’.',
    'Les citrouilles sculptées s’appellent « jack o’lanterns ».',
  ),
  fait(
    'halloween-bonbons',
    HALLOWEEN,
    '‘Trick or treat’ is a game where you play a trick on someone or get sweets.',
    '« Trick or treat » : jouer un tour ou recevoir des bonbons.',
  ),
  fait(
    'halloween-mots',
    HALLOWEEN,
    'bat witch broomstick black cat cauldron pumpkin ghost skeleton haunted house spider',
    'Les mots d’Halloween.',
  ),
  fait('noel-date', XMAS, 'Christmas is on December 25th.', 'Noël a lieu le 25 décembre.'),
  fait(
    'noel-sapin',
    XMAS,
    'We decorate our Christmas tree with baubles, tinsel and lights.',
    'On décore le sapin de Noël.',
  ),
  fait(
    'noel-repas',
    XMAS,
    'For Christmas dinner we eat turkey and then Christmas cake. My favourite part is pulling the crackers!',
    'Au repas de Noël : dinde, gâteau et « crackers ».',
  ),
  fait(
    'noel-santa',
    XMAS,
    'Children wait for Santa Claus to bring them presents.',
    'Les enfants attendent Santa Claus.',
  ),
  fait(
    'bonfire-date',
    BONFIRE,
    'People in Britain celebrate Bonfire Night every year on November 5th.',
    'Bonfire Night a lieu le 5 novembre en Grande-Bretagne.',
  ),
  fait(
    'bonfire-feux',
    BONFIRE,
    'Now, people go to see a bonfire and fireworks',
    'Pour Bonfire Night : un grand feu et des feux d’artifice.',
  ),
  fait(
    'paques-chasse',
    'bck-easter-answers',
    'Many children go on an egg hunt, looking for hidden',
    'À Pâques, beaucoup d’enfants cherchent des œufs cachés (egg hunt).',
  ),
  fait('paques-mois', 'bck-easter-answers', 'March or April.', 'Pâques a lieu en mars ou en avril.'),
  fait(
    'paques-mots',
    'bck-easter-answers',
    'eggs basket chocolates bunnies lamb chicks nest hot cross buns',
    'Les mots de Pâques.',
  ),
];
