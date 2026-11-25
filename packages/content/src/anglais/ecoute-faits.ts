/**
 * Anglais CM2, « Écouter et comprendre » (lot an-cm2-06) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council : LearnEnglish Kids et
 * LearnEnglish Teens ; programme de langues vivantes du cours moyen, arrêté du 26 février 2026, annexe 2 ;
 * programme du cycle 3, 2020). Les espaces et retours à la ligne sont réduits à une espace.
 */
import type { Fait } from './presentation-faits.ts';

/** Une fête des pays anglophones (pages « Read UK » de LearnEnglish Teens). */
export interface Festival {
  readonly en: string;
  /** Autres noms anglais acceptés. */
  readonly alt?: readonly string[];
  /** Date ou période, en français. */
  readonly date: string;
  /** Jour et mois en anglais (fêtes à date fixe seulement). */
  readonly day?: number;
  readonly month?: string;
  /** Ce que l'on fait ce jour-là, en français. */
  readonly custom: string;
  /** Faute d'écriture typique. */
  readonly typo: string;
}

export const FESTIVALS: readonly Festival[] = [
  {
    en: 'Halloween',
    date: '31 octobre',
    day: 31,
    month: 'October',
    custom: 'des citrouilles-lanternes et des déguisements',
    typo: 'Haloween',
  },
  {
    en: 'Bonfire Night',
    alt: ['Guy Fawkes Night'],
    date: '5 novembre',
    day: 5,
    month: 'November',
    custom: 'des feux de joie et des feux d’artifice',
    typo: 'Bonfir Night',
  },
  {
    en: 'Christmas',
    date: '25 décembre',
    day: 25,
    month: 'December',
    custom: 'des cartes de vœux et des cadeaux',
    typo: 'Chrismas',
  },
  {
    en: 'Pancake Day',
    alt: ['Shrove Tuesday'],
    date: 'un mardi de février ou de mars',
    custom: 'des crêpes et des courses de crêpes',
    typo: 'Pancak Day',
  },
];

/** Pays anglophones cités par la page « Pancake Day », et pays cités comme « autres ». */
export const ENGLISH_COUNTRIES: readonly { readonly en: string; readonly fr: string }[] = [
  { en: 'the UK', fr: 'le Royaume-Uni' },
  { en: 'Ireland', fr: 'l’Irlande' },
  { en: 'Australia', fr: 'l’Australie' },
  { en: 'Canada', fr: 'le Canada' },
];
export const OTHER_COUNTRIES: readonly string[] = ['l’Espagne', 'l’Italie', 'le Brésil'];

/** Questions d'un dialogue au café ou entre amis (transcriptions LearnEnglish Teens). */
export const QUESTIONS: readonly { readonly en: string; readonly topic: string }[] = [
  { en: 'How much is that?', topic: 'le prix' },
  { en: 'What time is the film?', topic: 'l’heure du film' },
  { en: 'What’s your table number?', topic: 'le numéro de la table' },
  { en: 'Would you like a drink?', topic: 'si tu veux une boisson' },
  { en: 'What would you like?', topic: 'ce que tu veux commander' },
];

export const FAITS: readonly Fait[] = [
  {
    id: 'programme-conversation',
    sourceId: 'lve-cm-2026',
    quote:
      'il peut comprendre des mots familiers et des expressions courtes dans une conversation simple, à condition que l’interlocuteur parle lentement et très distinctement',
    claim: 'Au CM2, l’élève comprend une conversation simple dite lentement : notion « dialogue court ».',
  },
  {
    id: 'programme-prix',
    sourceId: 'lve-cm-2026',
    quote:
      'l’élève peut lister et transmettre, à l’écrit ou à l’oral, des informations d’un intérêt immédiat : noms, nombres, prix, détails factuels',
    claim: 'Au CM2, l’élève relève et transmet des nombres et des prix entendus.',
  },
  {
    id: 'programme-horaire',
    sourceId: 'lve-cm-2026',
    quote:
      'Transmettre les principales informations factuelles d’un prospectus, d’une invitation (lieu, horaire, prix, etc.).',
    claim: 'Au CM2 (A1+), l’élève transmet l’horaire et le prix d’une invitation.',
  },
  {
    id: 'programme-date',
    sourceId: 'lve-cm-2026',
    quote: 'Situer dans le temps : exprimer une date ou des repères temporels simples.',
    claim: 'Au cours moyen, l’élève situe dans le temps avec une date ou une heure.',
  },
  {
    id: 'programme-culture',
    sourceId: 'lve-cm-2026',
    quote: 'l’élève peut identifier une similitude ou une différence culturelle',
    claim: 'Au CM2, l’élève repère des faits culturels des pays anglophones.',
  },
  {
    id: 'programme-celebrations',
    sourceId: 'lve-cm-2026',
    quote: 'Repérer les mots familiers (A1+) puis en identifier le thème (traditions, histoire, célébrations, etc.).',
    claim: 'Au CM2, l’élève repère dans un texte court le thème des traditions et des fêtes.',
  },
  {
    id: 'programme-c3-fetes',
    sourceId: 'cycle3-2020',
    quote:
      'Modes de vie, fêtes et traditions, quelques repères historiques et géographiques, quelques personnages de la culture de l’aire concernée',
    claim: 'Le programme du cycle 3 fait découvrir les fêtes et traditions des pays de la langue.',
  },
  {
    id: 'programme-c3-horaire-prix',
    sourceId: 'cycle3-2020',
    quote: 'Dialoguer pour échanger / obtenir des renseignements (itinéraire, horaire, prix, etc.).',
    claim: 'Le programme du cycle 3 fait échanger sur un horaire ou un prix dans un dialogue.',
  },
  {
    id: 'heure-o-clock',
    sourceId: 'bck-tell-time',
    quote: "When the big hand is pointing to the twelve, we say it's o'clock.",
    claim: 'Heure pile : « o’clock » (four o’clock = 4:00).',
  },
  {
    id: 'heure-quarter-past',
    sourceId: 'bck-tell-time',
    quote: "When the big hand is pointing to the three, we say it's quarter past.",
    claim: '« quarter past » = et quart (quarter past five = 5:15).',
  },
  {
    id: 'heure-half-past',
    sourceId: 'bck-tell-time',
    quote: "When the big hand is pointing to the six, we say it's half past.",
    claim: '« half past » = et demie (half past five = 5:30).',
  },
  {
    id: 'heure-quarter-to',
    sourceId: 'bck-tell-time',
    quote: "And, finally, when the big hand is on the nine, we say it's quarter to.",
    claim: '« quarter to » = moins le quart, avant l’heure suivante (quarter to six = 5:45).',
  },
  {
    id: 'heure-cinq-minutes',
    sourceId: 'bck-tell-time',
    quote: "Well, we count the minutes in fives. So, now it's five past six, it's ten past six, it's quarter past six",
    claim: 'Avant la demie, on compte les minutes par cinq avec « past » : ten past six = 6:10.',
  },
  {
    id: 'heure-to',
    sourceId: 'bck-tell-time',
    quote:
      "After half past, it changes. Then we count how many minutes there are before the next hour. It's twenty-five to seven, it's twenty to seven",
    claim: 'Après la demie, on compte les minutes avant l’heure suivante avec « to » : twenty to seven = 6:40.',
  },
  {
    id: 'heure-film',
    sourceId: 'bc-teens-cinema',
    quote: "Jack: What time is the film? Ismael: At 8 o'clock. Let’s meet at 7:30 outside the cinema.",
    claim: 'Dialogue : « What time is…? » demande l’heure ; « At … » donne l’heure d’un rendez-vous.',
  },
  {
    id: 'cafe-commande',
    sourceId: 'bc-teens-cafe',
    quote: 'Café worker: Next, please! What would you like? Andi: Can I have a burger, please?',
    claim: 'Au café : « What would you like? » (que veux-tu ?) ; « Can I have…, please? » pour commander.',
  },
  {
    id: 'cafe-boisson',
    sourceId: 'bc-teens-cafe',
    quote: 'Café worker: Would you like a drink? Andi: Yes, can I have an apple juice, please?',
    claim: '« Would you like a drink? » propose une boisson.',
  },
  {
    id: 'cafe-table',
    sourceId: 'bc-teens-cafe',
    quote: "What's your table number? Andi: Table 3.",
    claim: '« What’s your table number? » demande le numéro de la table.',
  },
  {
    id: 'cafe-prix',
    sourceId: 'bc-teens-cafe',
    quote: "Andi: Table 3. How much is that? Café worker: That's £8.37, please.",
    claim: '« How much is that? » demande le prix ; le prix s’écrit avec le signe £ : « That’s £8.37, please. »',
  },
  {
    id: 'date-ordinal-chant',
    sourceId: 'bck-chant-nine-oclock',
    quote: 'And once a year my birthday On the twenty-first of June.',
    claim: 'Une date se dit avec un nombre ordinal : « on the twenty-first of June » (le 21 juin).',
  },
  {
    id: 'date-ordinal-ecrit',
    sourceId: 'bc-teens-numbers',
    quote: '25th June',
    claim: 'À l’écrit, l’ordinal garde ses deux dernières lettres : 25th June.',
  },
  {
    id: 'date-second',
    sourceId: 'bc-prepositions-time',
    quote: 'dates on 30 July on the second of August',
    claim: '« on the second of August » : 2 se dit « second » dans une date.',
  },
  {
    id: 'pays-anglophones',
    sourceId: 'bc-teens-pancake-day',
    quote: 'It is celebrated in English-speaking countries like the UK, Ireland, Australia and Canada.',
    claim: 'Le Royaume-Uni, l’Irlande, l’Australie et le Canada sont des pays anglophones.',
  },
  {
    id: 'pays-autres',
    sourceId: 'bc-teens-pancake-day',
    quote: 'In others like Spain, Italy or Brazil, Shrove Tuesday is at the end of Carnival.',
    claim: 'L’Espagne, l’Italie et le Brésil sont cités à part, comme « autres » pays.',
  },
  {
    id: 'pancake-date',
    sourceId: 'bc-teens-pancake-day',
    quote: 'Pancake Day is always on a Tuesday in February or March.',
    claim: 'Pancake Day (ou Shrove Tuesday) tombe un mardi de février ou de mars.',
  },
  {
    id: 'pancake-course',
    sourceId: 'bc-teens-pancake-day',
    quote: 'Another tradition on Pancake Day in the UK is pancake racing.',
    claim: 'Pour Pancake Day, on mange des crêpes et on fait des courses de crêpes.',
  },
  {
    id: 'halloween-date',
    sourceId: 'bc-teens-halloween',
    quote: "October 31 is Halloween and it's celebrated in many countries around the world.",
    claim: 'Halloween a lieu le 31 octobre.',
  },
  {
    id: 'halloween-coutumes',
    sourceId: 'bc-teens-halloween',
    quote:
      'When you think of Halloween, you probably think of pumpkin lanterns, fancy-dress costumes and children asking for sweets.',
    claim: 'Pour Halloween : citrouilles-lanternes, déguisements, enfants qui demandent des bonbons.',
  },
  {
    id: 'halloween-origine',
    sourceId: 'bc-teens-halloween',
    quote: 'Halloween traditions actually come from Ireland, Scotland, England and Wales',
    claim: 'Les traditions d’Halloween viennent d’Irlande et de Grande-Bretagne.',
  },
  {
    id: 'bonfire-date',
    sourceId: 'bc-teens-bonfire-night',
    quote:
      'In the UK, Bonfire Night (or Guy Fawkes Night) is celebrated on 5 November and the night skies are filled with colour.',
    claim: 'Au Royaume-Uni, Bonfire Night (ou Guy Fawkes Night) a lieu le 5 novembre.',
  },
  {
    id: 'bonfire-feux',
    sourceId: 'bc-teens-bonfire-night',
    quote: 'All over Britain there are firework displays and bonfires',
    claim: 'Pour Bonfire Night, il y a des feux d’artifice et des feux de joie.',
  },
  {
    id: 'christmas-fete',
    sourceId: 'bc-teens-christmas',
    quote: 'Christmas in the UK is the biggest holiday of the year.',
    claim: 'Au Royaume-Uni, Christmas (Noël) est la plus grande fête de l’année.',
  },
  {
    id: 'christmas-date',
    sourceId: 'bc-teens-christmas',
    quote:
      'It’s very common to send Christmas cards to friends, family, colleagues, classmates and neighbours in the weeks leading up to 25 December.',
    claim: 'Christmas a lieu le 25 décembre ; on envoie des cartes de vœux et on offre des cadeaux.',
  },
];
