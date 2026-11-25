/**
 * Données du chapitre « Vocabulaire » (CM1) : faits cités et phrases écrites pour l'exercice. Chaque fait porte
 * l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const faits = new Map<string, Fait>();
/** Enregistre un fait et renvoie son identifiant. */
const fait = (id: string, source: string, citation: string): string => {
  faits.set(id, { id, source, citation });
  return id;
};
/** Article du Trésor de la langue française informatisé (`article` : identifiant `cnrtl-…`). */
const tlf = (id: string, article: string, citation: string) => fait(id, `cnrtl-${article}`, citation);
/** Article du Dictionnaire de l'Académie française, 9e édition (identifiant `academie-…`). */
const acad = (id: string, article: string, citation: string) => fait(id, `academie-${article}`, citation);

// ───────────────────────── Programme et définitions ─────────────────────────

fait('prog-synonymie', PROGRAMME, 'Comprendre et utiliser les notions de synonymie et antonymie');
fait('prog-relations', PROGRAMME, 'Établir des relations morphologiques et sémantiques entre les mots');
fait(
  'prog-inconnus',
  PROGRAMME,
  'Identifier les mots inconnus, lors de ses différentes lectures, et rechercher leur signification en s’appuyant sur la morphologie et sur le contexte',
);
fait(
  'prog-polysemie',
  PROGRAMME,
  'À l’oral et à l’écrit, utiliser à bon escient les mots polysémiques dans différents contextes disciplinaires',
);
tlf('def-synonyme', 'synonyme', "De forme différente et de même sens (ou de sens voisin) qu'un autre mot.");
acad('def-antonyme', 'antonyme', "Mot dont le sens s'oppose totalement à celui d'un autre.");
tlf(
  'def-famille',
  'famille',
  'Tous les mots dérivés et les mots composés formés sur un même radical constituent une famille de mots.',
);
tlf('def-radical', 'radical', 'Partie essentielle du mot formé sur une racine, qui sert de base');
acad(
  'def-prefixe',
  'prefixe',
  'Élément de composition placé avant un radical pour former une unité lexicale de sens différent',
);
tlf(
  'def-suffixe',
  'suffixe',
  "Affixe placé à la fin d'une unité lexicale, après le radical, et qui modifie le sens de ce radical.",
);
acad('def-polysemie', 'polysemie', "Caractère d'un mot qui présente plusieurs sens.");
acad('def-contexte', 'contexte', 'Ensemble du texte entourant un mot, une phrase, un passage.');

// ───────────────────────── Synonymes ─────────────────────────

/** Un mot, son synonyme (cité), une phrase où l'un remplace l'autre et trois mots qui ne conviennent pas. */
export interface Synonyme {
  readonly mot: string;
  readonly syn: string;
  /** Phrase avec « {} » à la place du mot : elle reste juste avec le synonyme. */
  readonly phrase: string;
  readonly faux: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  readonly faitId: string;
}

interface Cite {
  readonly article: string;
  readonly citation: string;
}

const synonyme = ({ article, citation, ...s }: Omit<Synonyme, 'faitId'> & Cite): Synonyme => ({
  ...s,
  faitId: tlf(`syn-${article}`, article, citation),
});

const contraire = (mot: string): string => `C’est le contraire : on cherche un mot de sens proche de « ${mot} ».`;
const ailleurs = (faux: string, mot: string): string => `« ${faux} » parle d’autre chose que « ${mot} ».`;
const famille = (faux: string, mot: string): string =>
  `« ${faux} » ressemble à « ${mot} », mais ce n’est pas la même sorte de mot : il ne peut pas le remplacer.`;

export const SYNONYMES: readonly Synonyme[] = [
  synonyme({
    mot: 'content',
    syn: 'satisfait',
    article: 'content',
    citation: 'Synon. heureux, enchanté, ravi, satisfait.',
    phrase: 'Mon voisin est {}.',
    faux: [
      ['triste', contraire('content')],
      ['pressé', ailleurs('pressé', 'content')],
      ['contenter', famille('contenter', 'content')],
    ],
  }),
  synonyme({
    mot: 'triste',
    syn: 'malheureux',
    article: 'triste',
    citation: 'Synon. abattu, affligé, découragé, désespéré, malheureux',
    phrase: 'Ce garçon est {} ce soir.',
    faux: [
      ['gai', contraire('triste')],
      ['bavard', ailleurs('bavard', 'triste')],
      ['tristesse', famille('tristesse', 'triste')],
    ],
  }),
  synonyme({
    mot: 'terminer',
    syn: 'finir',
    article: 'terminer',
    citation: 'Synon. achever, finir.',
    phrase: 'Je vais {} mon dessin.',
    faux: [
      ['commencer', contraire('terminer')],
      ['cacher', ailleurs('cacher', 'terminer')],
      ['terminaison', famille('terminaison', 'terminer')],
    ],
  }),
  synonyme({
    mot: 'peur',
    syn: 'frayeur',
    article: 'peur',
    citation: 'Synon. crainte, effroi, épouvante, frayeur, terreur',
    phrase: 'Le chat a eu une grande {}.',
    faux: [
      ['joie', contraire('peur')],
      ['faim', ailleurs('faim', 'peur')],
      ['peureux', famille('peureux', 'peur')],
    ],
  }),
  synonyme({
    mot: 'difficile',
    syn: 'ardu',
    article: 'difficile',
    citation: 'Synon. ardu, compliqué, délicat, malaisé',
    phrase: 'Ce problème est {}.',
    faux: [
      ['facile', contraire('difficile')],
      ['rond', ailleurs('rond', 'difficile')],
      ['difficulté', famille('difficulté', 'difficile')],
    ],
  }),
  synonyme({
    mot: 'regarder',
    syn: 'observer',
    article: 'regarder',
    citation: 'Synon. considérer, contempler, examiner, fixer, inspecter, observer, scruter',
    phrase: 'J’aime {} les étoiles.',
    faux: [
      ['écouter', ailleurs('écouter', 'regarder')],
      ['oublier', ailleurs('oublier', 'regarder')],
      ['regard', famille('regard', 'regarder')],
    ],
  }),
  synonyme({
    mot: 'méchant',
    syn: 'cruel',
    article: 'mechant',
    citation: 'Synon. cruel, féroce, malfaisant, sauvage',
    phrase: 'L’ogre du conte est {}.',
    faux: [
      ['gentil', contraire('méchant')],
      ['lointain', ailleurs('lointain', 'méchant')],
      ['méchanceté', famille('méchanceté', 'méchant')],
    ],
  }),
  synonyme({
    mot: 'brave',
    syn: 'courageux',
    article: 'brave',
    citation: 'Synon. courageux, hardi, intrépide',
    phrase: 'Ce pompier est {}.',
    faux: [
      ['peureux', contraire('brave')],
      ['pointu', ailleurs('pointu', 'brave')],
      ['bravoure', famille('bravoure', 'brave')],
    ],
  }),
  synonyme({
    mot: 'craintif',
    syn: 'peureux',
    article: 'craintif',
    citation: 'Synon. anxieux, inquiet, peureux',
    phrase: 'Ce petit chien est {}.',
    faux: [
      ['hardi', contraire('craintif')],
      ['sucré', ailleurs('sucré', 'craintif')],
      ['crainte', famille('crainte', 'craintif')],
    ],
  }),
  synonyme({
    mot: 'maison',
    syn: 'demeure',
    article: 'maison',
    citation: 'Synon. construction, demeure, établissement, immeuble.',
    phrase: 'Voici une belle {} au bord de l’eau.',
    faux: [
      ['barque', ailleurs('barque', 'maison')],
      ['forêt', ailleurs('forêt', 'maison')],
      ['jardin', ailleurs('jardin', 'maison')],
    ],
  }),
  synonyme({
    mot: 'habit',
    syn: 'costume',
    article: 'habit',
    citation: 'Synon. costume, habillement, tenue.',
    phrase: 'Il porte un {} noir.',
    faux: [
      ['placard', ailleurs('placard', 'habit')],
      ['repas', ailleurs('repas', 'habit')],
      ['habiller', famille('habiller', 'habit')],
    ],
  }),
  synonyme({
    mot: 'joli',
    syn: 'mignon',
    article: 'joli',
    citation: 'Synon. mignon, girond',
    phrase: 'Regarde ce {} petit chat.',
    faux: [
      ['vilain', contraire('joli')],
      ['lent', ailleurs('lent', 'joli')],
      ['joliment', famille('joliment', 'joli')],
    ],
  }),
  synonyme({
    mot: 'rusé',
    syn: 'malin',
    article: 'ruse',
    citation: 'Synon. astucieux, fin, finaud, futé, machiavélique, malin',
    phrase: 'Le renard est {}.',
    faux: [
      ['naïf', contraire('rusé')],
      ['mouillé', ailleurs('mouillé', 'rusé')],
      ['ruse', famille('ruse', 'rusé')],
    ],
  }),
  synonyme({
    mot: 'immense',
    syn: 'énorme',
    article: 'immense',
    citation: 'Synon. démesuré, énorme, géant.',
    phrase: 'Un {} rocher bloque la route.',
    faux: [
      ['minuscule', contraire('immense')],
      ['joyeux', ailleurs('joyeux', 'immense')],
      ['immensité', famille('immensité', 'immense')],
    ],
  }),
  synonyme({
    mot: 'drôle',
    syn: 'amusant',
    article: 'drole',
    citation: 'synon. amusant, cocasse, comique',
    phrase: 'Ce clown est très {}.',
    faux: [
      ['ennuyeux', contraire('drôle')],
      ['profond', ailleurs('profond', 'drôle')],
      ['drôlement', famille('drôlement', 'drôle')],
    ],
  }),
  synonyme({
    mot: 'sauter',
    syn: 'bondir',
    article: 'sauter',
    citation: 'Synon. bondir.',
    phrase: 'Je vois le chat {} sur la table.',
    faux: [
      ['dormir', ailleurs('dormir', 'sauter')],
      ['lire', ailleurs('lire', 'sauter')],
      ['saut', famille('saut', 'sauter')],
    ],
  }),
  synonyme({
    mot: 'cacher',
    syn: 'dissimuler',
    article: 'cacher',
    citation: 'Synon. dissimuler.',
    phrase: 'Il veut {} son cadeau.',
    faux: [
      ['montrer', contraire('cacher')],
      ['chanter', ailleurs('chanter', 'cacher')],
      ['cachette', famille('cachette', 'cacher')],
    ],
  }),
  synonyme({
    mot: 'habile',
    syn: 'adroit',
    article: 'habile',
    citation: 'Synon. adroit, capable, fin',
    phrase: 'Ce jongleur est très {}.',
    faux: [
      ['maladroit', contraire('habile')],
      ['gelé', ailleurs('gelé', 'habile')],
      ['habileté', famille('habileté', 'habile')],
    ],
  }),
];

// ───────────────────────── Antonymes ─────────────────────────

export interface Antonyme {
  readonly mot: string;
  readonly contraire: string;
  readonly phrase: string;
  /** Un mot de sens proche, tentant mais faux. */
  readonly proche: string;
  readonly faitId: string;
}

const antonyme = ({
  article,
  citation,
  inverse,
  ...a
}: Omit<Antonyme, 'faitId' | 'contraire'> & Cite & { readonly inverse: string }): Antonyme => ({
  ...a,
  contraire: inverse,
  faitId: tlf(`ant-${article}`, article, citation),
});

export const ANTONYMES: readonly Antonyme[] = [
  antonyme({
    mot: 'froid',
    inverse: 'chaud',
    article: 'froid',
    citation: 'Anton. chaud.',
    proche: 'glacé',
    phrase: 'Ce soir, le vent est {}.',
  }),
  antonyme({
    mot: 'lourd',
    inverse: 'léger',
    article: 'lourd',
    citation: 'Anton. léger.',
    proche: 'pesant',
    phrase: 'Mon cartable est {}.',
  }),
  antonyme({
    mot: 'bas',
    inverse: 'haut',
    article: 'bas',
    citation: 'Anton. haut.',
    proche: 'petit',
    phrase: 'Ce mur est {}.',
  }),
  antonyme({
    mot: 'ouvrir',
    inverse: 'fermer',
    article: 'ouvrir',
    citation: 'Anton. fermer',
    proche: 'entrouvrir',
    phrase: 'Je vais {} la porte.',
  }),
  antonyme({
    mot: 'vide',
    inverse: 'plein',
    article: 'vide',
    citation: 'Anton. empli, plein, rempli.',
    proche: 'creux',
    phrase: 'Le seau est {}.',
  }),
  antonyme({
    mot: 'sale',
    inverse: 'propre',
    article: 'sale',
    citation: 'Anton. propre.',
    proche: 'taché',
    phrase: 'Mon pull est {}.',
  }),
  antonyme({
    mot: 'mou',
    inverse: 'dur',
    article: 'mou',
    citation: 'Anton. dur.',
    proche: 'tendre',
    phrase: 'Ce coussin est {}.',
  }),
  antonyme({
    mot: 'jeune',
    inverse: 'vieux',
    article: 'jeune',
    citation: 'Anton. âgé, vieux.',
    proche: 'petit',
    phrase: 'Ce chien est {}.',
  }),
  antonyme({
    mot: 'long',
    inverse: 'court',
    article: 'long',
    citation: 'Anton. court.',
    proche: 'grand',
    phrase: 'Ce chemin est {}.',
  }),
  antonyme({
    mot: 'large',
    inverse: 'étroit',
    article: 'large',
    citation: 'Anton. étroit.',
    proche: 'grand',
    phrase: 'Ce couloir est {}.',
  }),
  antonyme({
    mot: 'triste',
    inverse: 'gai',
    article: 'triste',
    citation: 'anton. gai, réjoui.',
    proche: 'malheureux',
    phrase: 'Son air est {}.',
  }),
  antonyme({
    mot: 'méchant',
    inverse: 'gentil',
    article: 'mechant',
    citation: 'anton. gentil',
    proche: 'cruel',
    phrase: 'Le loup du conte est {}.',
  }),
  antonyme({
    mot: 'possible',
    inverse: 'impossible',
    article: 'possible',
    citation: 'Anton. impossible.',
    proche: 'faisable',
    phrase: 'Ce saut est {}.',
  }),
  antonyme({
    mot: 'visible',
    inverse: 'invisible',
    article: 'visible',
    citation: 'Anton. invisible.',
    proche: 'apparent',
    phrase: 'Le trésor est {}.',
  }),
  antonyme({
    mot: 'reculer',
    inverse: 'avancer',
    article: 'reculer',
    citation: 'Anton. avancer.',
    proche: 'se retirer',
    phrase: 'La voiture doit {}.',
  }),
  antonyme({
    mot: 'clair',
    inverse: 'obscur',
    article: 'clair',
    citation: 'Anton. sombre, obscur.',
    proche: 'lumineux',
    phrase: 'Ce grenier est {}.',
  }),
  antonyme({
    mot: 'craintif',
    inverse: 'hardi',
    article: 'craintif',
    citation: 'anton. décidé, hardi, résolu.',
    proche: 'peureux',
    phrase: 'Ce petit renard est {}.',
  }),
];

/** Contraire fabriqué avec un préfixe (« in- », « im- », « dé- »). */
export interface Contraire {
  readonly mot: string;
  readonly contraire: string;
  readonly prefixe: 'in-' | 'im-' | 'dé-';
  readonly faitId: string;
}

tlf('prefixe-in', 'prefixe-in', "il sert à indiquer la négation, la privation, l'absence ou le contraire de qqc.");
tlf('prefixe-de', 'prefixe-de', "la négation, la destruction de qqc., l'action ou l'état contraire, inverse.");
tlf('forme-im', 'prefixe-in', 'IN-1, IL-, IM-, IR-,préfixe');

export const CONTRAIRES_PREFIXES: readonly Contraire[] = [
  { mot: 'possible', contraire: 'impossible', prefixe: 'im-', faitId: 'ant-possible' },
  { mot: 'visible', contraire: 'invisible', prefixe: 'in-', faitId: 'ant-visible' },
  { mot: 'connu', contraire: 'inconnu', prefixe: 'in-', faitId: tlf('inconnu', 'inconnu', 'préf. in-1') },
  { mot: 'faire', contraire: 'défaire', prefixe: 'dé-', faitId: tlf('defaire-faire', 'prefixe-de', 'défaire/faire') },
  { mot: 'monter', contraire: 'démonter', prefixe: 'dé-', faitId: tlf('demonter', 'prefixe-de', 'démonter/monter') },
  { mot: 'nouer', contraire: 'dénouer', prefixe: 'dé-', faitId: tlf('denouer', 'prefixe-de', 'dénouer/nouer') },
];

// ───────────────────────── Familles de mots ─────────────────────────

export interface Membre {
  readonly mot: string;
  /** Autres mots simples justes (« rang » pour « déranger », dérivé de « ranger », lui-même de « rang »). */
  readonly aussi?: readonly string[];
  readonly faitId: string;
}

export interface Famille {
  /** Le mot simple de la famille. */
  readonly base: string;
  readonly membres: readonly Membre[];
  /** Mot qui ressemble mais n'est pas de la famille, avec sa vraie origine. */
  readonly intrus?: { readonly mot: string; readonly pourquoi: string; readonly faitId: string };
}

const derive = (mot: string, article: string, citation: string, aussi?: readonly string[]): Membre => ({
  mot,
  faitId: acad(`fam-${article}`, article, citation),
  ...(aussi ? { aussi } : {}),
});
const deriveTlf = (mot: string, article: string, citation: string): Membre => ({
  mot,
  faitId: tlf(`fam-${article}`, article, citation),
});

export const FAMILLES: readonly Famille[] = [
  {
    base: 'dent',
    membres: [derive('dentiste', 'dentiste', 'Dérivé de dent.'), deriveTlf('dentier', 'dentier', 'Dér. de dent')],
  },
  {
    base: 'fleur',
    membres: [
      derive('fleuriste', 'fleuriste', 'Dérivé de fleur.'),
      derive('floraison', 'floraison', 'Dérivé de fleur.'),
    ],
  },
  {
    base: 'lait',
    membres: [derive('laitage', 'laitage', 'Dérivé de lait.'), derive('laiterie', 'laiterie', 'Dérivé de lait.')],
  },
  {
    base: 'jardin',
    membres: [
      derive('jardinier', 'jardinier', 'Dérivé de jardin.'),
      derive('jardinage', 'jardinage', 'Dérivé de jardin.'),
      derive('jardiner', 'jardiner', 'Dérivé de jardin.'),
    ],
  },
  {
    base: 'laver',
    membres: [
      derive('lavage', 'lavage', 'Dérivé de laver.'),
      derive('lavoir', 'lavoir', 'Dérivé de laver.'),
      derive('délaver', 'delaver', 'Dérivé de laver.'),
    ],
    intrus: {
      mot: 'lave',
      pourquoi: 'La « lave » du volcan vient d’un mot italien. Elle ne vient pas de « laver ».',
      faitId: acad('intrus-lave', 'lave', "Emprunté de l'italien lava"),
    },
  },
  {
    base: 'terre',
    membres: [
      derive('enterrer', 'enterrer', 'Dérivé de terre.'),
      derive('atterrir', 'atterrir', 'Dérivé de terre.'),
      deriveTlf('terrasse', 'terrasse', 'Dér. de terre'),
      deriveTlf('souterrain', 'souterrain', 'Formé de sous-*, de terre*'),
    ],
    intrus: {
      mot: 'terrible',
      pourquoi: '« Terrible » vient d’un mot latin qui veut dire « effrayant ». Rien à voir avec la terre.',
      faitId: tlf('intrus-terrible', 'terrible', 'Empr. au lat. terribilis « effrayant, épouvantable »'),
    },
  },
  {
    base: 'sable',
    membres: [
      derive('ensabler', 'ensabler', 'Dérivé de sable.'),
      deriveTlf('sableux', 'sableux', 'Dér. de sable'),
      deriveTlf('sablier', 'sablier', 'Dér. de sable'),
    ],
  },
  {
    base: 'ranger',
    membres: [
      derive('déranger', 'deranger', 'Dérivé de ranger.', ['rang']),
      derive('rangement', 'rangement', 'Dérivé de ranger', ['rang']),
      derive('arranger', 'arranger', 'Dérivé de ranger.', ['rang']),
    ],
    intrus: {
      mot: 'orange',
      pourquoi: '« Orange » contient « range », mais ce mot vient de l’arabe et du persan.',
      faitId: acad('intrus-orange', 'orange', "de l'arabe narang(a), lui-même emprunté du persan narang"),
    },
  },
  {
    base: 'lent',
    membres: [
      derive('lentement', 'lentement', 'Dérivé de lent.'),
      derive('lenteur', 'lenteur', 'Dérivé de lent.'),
      derive('ralentir', 'ralentir', "Dérivé de l'ancien verbe alentir, lui-même dérivé de lent."),
    ],
    intrus: {
      mot: 'lentille',
      pourquoi: '« Lentille » vient d’un mot latin qui désignait déjà la lentille. Elle ne vient pas de « lent ».',
      faitId: acad('intrus-lentille', 'lentille', 'Issu du latin lenticula, de même sens.'),
    },
  },
];

// ───────────────────────── Préfixes et suffixes ─────────────────────────

export interface Affixe {
  readonly forme: string;
  readonly place: 'préfixe' | 'suffixe';
  /** Sens, écrit pour l'élève. */
  readonly sens: string;
  readonly faitId: string;
}

const affixe = (forme: string, place: Affixe['place'], sens: string, faitId: string): Affixe => ({
  forme,
  place,
  sens,
  faitId,
});

export const AFFIXES = {
  re: affixe(
    're-',
    'préfixe',
    'faire de nouveau',
    tlf('prefixe-re', 'prefixe-re', 'Le préf. exprime la répét. du procès ou sa reprise après une interruption'),
  ),
  de: affixe('dé-', 'préfixe', 'faire le contraire', 'prefixe-de'),
  in: affixe('in-', 'préfixe', 'ne pas, le contraire', 'prefixe-in'),
  pre: affixe(
    'pré-',
    'préfixe',
    'avant',
    tlf('prefixe-pre', 'prefixe-pre', "prae «avant, devant», marquant l'antériorité temp."),
  ),
  ette: affixe(
    '-ette',
    'suffixe',
    'quelque chose de petit',
    tlf(
      'suffixe-ette',
      'suffixe-ette',
      'Suff. dimin., du lat. -ittum, -ittam, formateur en fr. de très nombreux dér. exprimant la petitesse',
    ),
  ),
  eur: affixe(
    '-eur',
    'suffixe',
    'la personne qui fait l’action',
    tlf('suffixe-eur', 'suffixe-eur', "Suff. formant des noms d'agents."),
  ),
  able: affixe(
    '-able',
    'suffixe',
    'qu’on peut faire',
    tlf('suffixe-able', 'suffixe-able', "(« que l'on peut » + infinitif)"),
  ),
  age: affixe(
    '-age',
    'suffixe',
    'une action',
    tlf('suffixe-age', 'suffixe-age', "Suff. formateur de subst. d'action ou de subst. à valeur coll."),
  ),
  metier: affixe(
    '-ier',
    'suffixe',
    'la personne qui exerce un métier',
    tlf('suffixe-ier-metier', 'suffixe-ier', 'La personne exerce une activité à caractère professionnel.'),
  ),
  arbre: affixe(
    '-ier',
    'suffixe',
    'l’arbre qui donne un fruit',
    tlf(
      'suffixe-ier-arbre',
      'suffixe-ier',
      "l'arbre ou la plante qui produit le fruit, la fleur, la feuille ou la graine",
    ),
  ),
} as const;

/** Un mot construit : affixe + mot simple, avec sa définition pour l'élève. */
export interface Construit {
  readonly mot: string;
  readonly base: string;
  readonly affixe: Affixe;
  /** « Un mot qui veut dire … » (sans le mot lui-même). */
  readonly definition: string;
  /** Phrase avec « {} » à la place du mot. */
  readonly phrase: string;
  readonly faitId: string;
}

export const CONSTRUITS: readonly Construit[] = [
  {
    mot: 'refaire',
    base: 'faire',
    affixe: AFFIXES.re,
    faitId: acad('con-refaire', 'refaire', 'Dérivé de faire.'),
    definition: 'faire de nouveau',
    phrase: 'Mon dessin est raté : je vais le {}.',
  },
  {
    mot: 'relire',
    base: 'lire',
    affixe: AFFIXES.re,
    faitId: acad('con-relire', 'relire', 'Dérivé de lire.'),
    definition: 'lire de nouveau',
    phrase: 'Avant de rendre ta copie, tu dois la {}.',
  },
  {
    mot: 'défaire',
    base: 'faire',
    affixe: AFFIXES.de,
    faitId: 'defaire-faire',
    definition: 'faire le contraire de « faire »',
    phrase: 'Ce nœud me gêne : pour libérer la corde, je dois le {}.',
  },
  {
    mot: 'démonter',
    base: 'monter',
    affixe: AFFIXES.de,
    faitId: 'demonter',
    definition: 'faire le contraire de « monter » un meuble',
    phrase: 'Pour déménager, il faut {} l’étagère.',
  },
  {
    mot: 'inconnu',
    base: 'connu',
    affixe: AFFIXES.in,
    faitId: 'inconnu',
    definition: 'qui n’est pas connu',
    phrase: 'Ce mot m’est {}.',
  },
  {
    mot: 'maisonnette',
    base: 'maison',
    affixe: AFFIXES.ette,
    faitId: acad('con-maisonnette', 'maisonnette', 'Dérivé de maison.'),
    definition: 'une petite maison',
    phrase: 'Au fond du jardin, il y a une {}.',
  },
  {
    mot: 'fillette',
    base: 'fille',
    affixe: AFFIXES.ette,
    faitId: acad('con-fillette', 'fillette', 'Dérivé de fille.'),
    definition: 'une petite fille',
    phrase: 'Une {} joue dans la cour.',
  },
  {
    mot: 'danseur',
    base: 'danser',
    affixe: AFFIXES.eur,
    faitId: acad('con-danseur', 'danseur', 'Dérivé de danser.'),
    definition: 'un homme qui danse',
    phrase: 'Ce {} tourne sur la scène.',
  },
  {
    mot: 'nageur',
    base: 'nager',
    affixe: AFFIXES.eur,
    faitId: acad('con-nageur', 'nageur', 'Dérivé de nager.'),
    definition: 'un homme qui nage',
    phrase: 'Ce {} traverse toute la piscine.',
  },
  {
    mot: 'mangeable',
    base: 'manger',
    affixe: AFFIXES.able,
    faitId: tlf('con-mangeable', 'mangeable', 'Dér. de manger1 *; suff. -able*.'),
    definition: 'qu’on peut manger',
    phrase: 'Ce fruit est un peu mou, mais il reste {}.',
  },
  {
    mot: 'lavage',
    base: 'laver',
    affixe: AFFIXES.age,
    faitId: 'fam-lavage',
    definition: 'l’action de laver',
    phrase: 'Après le {}, la voiture brille.',
  },
  {
    mot: 'jardinier',
    base: 'jardin',
    affixe: AFFIXES.metier,
    faitId: 'fam-jardinier',
    definition: 'la personne dont le métier est de soigner un jardin',
    phrase: 'Le {} taille les rosiers.',
  },
  {
    mot: 'pommier',
    base: 'pomme',
    affixe: AFFIXES.arbre,
    faitId: acad('con-pommier', 'pommier', 'Dérivé de pomme'),
    definition: 'l’arbre qui donne des pommes',
    phrase: 'Le {} est couvert de fruits rouges.',
  },
];

// ───────────────────────── Mots polysémiques ─────────────────────────

export interface Sens {
  /** Sens écrit pour l'élève. */
  readonly sens: string;
  readonly phrase: string;
  readonly faitId: string;
}

export interface Polyseme {
  readonly mot: string;
  readonly article: 'un' | 'une';
  readonly sens: readonly Sens[];
}

const sensDe = (article: string, n: string, citation: string, sens: string, phrase: string): Sens => ({
  sens,
  phrase,
  faitId: acad(`sens-${article}-${n}`, article, citation),
});

/** Dans chaque phrase, « ___ » remplace le mot. Les mots à plusieurs sens courants (niveaux 1 à 3). */
export const POLYSEMES: readonly Polyseme[] = [
  {
    mot: 'feuille',
    article: 'une',
    sens: [
      sensDe(
        'feuille',
        'arbre',
        'Organe végétal, généralement mince et plat',
        'la partie verte et plate d’une plante',
        'Une ___ tombe de la branche du chêne.',
      ),
      sensDe(
        'feuille',
        'papier',
        'Morceau de papier généralement rectangulaire, sur lequel on écrit, on dessine.',
        'un morceau de papier pour écrire',
        'Écris ton nom en haut de la ___.',
      ),
      sensDe(
        'feuille',
        'plaque',
        "Mince plaque d'une matière quelconque.",
        'une plaque très mince',
        'Le toit est couvert d’une ___ de métal.',
      ),
    ],
  },
  {
    mot: 'glace',
    article: 'une',
    sens: [
      sensDe('glace', 'gel', 'Eau solidifiée par le gel.', 'de l’eau gelée', 'En hiver, la mare est couverte de ___.'),
      sensDe(
        'glace',
        'dessert',
        "Préparation à base de lait ou de crème parfumés qu'on fait congeler.",
        'un dessert froid et parfumé',
        'Au dessert, je prends une ___ à la vanille.',
      ),
      sensDe(
        'glace',
        'miroir',
        'Plaque de verre ou de cristal dont on fait des miroirs, des vitrages.',
        'une plaque de verre, comme un miroir',
        'Elle se regarde dans la ___ de l’entrée.',
      ),
    ],
  },
  {
    mot: 'carte',
    article: 'une',
    sens: [
      sensDe(
        'carte',
        'menu',
        'Liste des mets, des vins, proposés au choix du client, avec leur prix.',
        'la liste des plats au restaurant',
        'Au restaurant, nous lisons la ___.',
      ),
      sensDe(
        'carte',
        'terre',
        'Ce qui représente le globe terrestre ou une de ses parties.',
        'le dessin d’un pays ou de la Terre',
        'Montre la France sur la ___.',
      ),
      sensDe(
        'carte',
        'postale',
        'Carte postale illustrée, dont un côté porte une image',
        'un carton illustré qu’on envoie',
        'De la mer, je t’envoie une ___ avec une photo.',
      ),
    ],
  },
  {
    mot: 'bouton',
    article: 'un',
    sens: [
      sensDe(
        'bouton',
        'fleur',
        'Bourgeon non épanoui pouvant donner naissance à une fleur',
        'une fleur pas encore ouverte',
        'La rose est encore en ___.',
      ),
      sensDe(
        'bouton',
        'vetement',
        'Petite pièce de matière dure, le plus souvent ronde, cousue sur un vêtement',
        'un petit rond cousu qui ferme un habit',
        'J’ai perdu un ___ de ma chemise.',
      ),
    ],
  },
  {
    mot: 'plume',
    article: 'une',
    sens: [
      sensDe(
        'plume',
        'oiseau',
        "garnis de barbes et de duvet, qui recouvrent l'épiderme des oiseaux",
        'ce qui couvre le corps des oiseaux',
        'Le pigeon a perdu une ___.',
      ),
      sensDe(
        'plume',
        'ecrire',
        'petite lame de métal, pointue et fendue',
        'un objet pointu pour écrire à l’encre',
        'La ___ de mon stylo gratte le papier.',
      ),
    ],
  },
];

/** Mots dont les sens sont moins familiers (niveaux 4 et 5). */
export const POLYSEMES_EXPERTS: readonly Polyseme[] = [
  {
    mot: 'règle',
    article: 'une',
    sens: [
      sensDe(
        'regle',
        'outil',
        'Instrument rigide, long et droit, qui sert à guider la main pour tracer des lignes',
        'un instrument droit pour tracer',
        'Trace un trait avec ta ___.',
      ),
      sensDe(
        'regle',
        'usage',
        'Usage, pratique reconnus et constitués en norme dans une société.',
        'ce qu’il faut respecter',
        'Dire merci est une ___ de politesse.',
      ),
    ],
  },
  {
    mot: 'pièce',
    article: 'une',
    sens: [
      sensDe(
        'piece',
        'maison',
        "Chacune des parties d'une maison ou d'un appartement",
        'une partie d’un logement, entre des murs',
        'La cuisine est la plus grande ___ de la maison.',
      ),
      sensDe(
        'piece',
        'mecanisme',
        "Chacune des parties d'un mécanisme, d'un assemblage",
        'une partie d’un objet monté',
        'Il manque une ___ pour réparer le vélo.',
      ),
    ],
  },
  {
    mot: 'note',
    article: 'une',
    sens: [
      sensDe(
        'note',
        'ecole',
        "Appréciation d'un travail, d'un comportement, exprimée de manière conventionnelle par un chiffre ou une lettre.",
        'un chiffre ou une lettre qui juge un travail',
        'J’ai eu une bonne ___ à ma dictée.',
      ),
      sensDe(
        'note',
        'musique',
        'Chacun des différents signes qui, par leur position et par leur forme, figurent les sons musicaux',
        'un signe qui représente un son en musique',
        'La flûte joue une ___ très aiguë.',
      ),
    ],
  },
  {
    mot: 'éclair',
    article: 'un',
    sens: [
      sensDe(
        'eclair',
        'orage',
        'Lumière vive et soudaine, dessinant le plus souvent un trait ou une ligne brisée',
        'une lumière vive pendant l’orage',
        'Un ___ a illuminé le ciel noir.',
      ),
      sensDe(
        'eclair',
        'instant',
        'Instant, très court moment.',
        'un moment très court',
        'En un ___, le chat a disparu.',
      ),
    ],
  },
  {
    mot: 'pile',
    article: 'une',
    sens: [
      sensDe(
        'pile',
        'tas',
        "Ensemble d'objets semblables, placés les uns sur les autres.",
        'des objets posés les uns sur les autres',
        'Range cette ___ d’assiettes.',
      ),
      sensDe(
        'pile',
        'energie',
        "Appareil, dispositif qui fournit de l'énergie électrique",
        'un petit objet qui donne de l’électricité',
        'La lampe ne marche plus : change la ___.',
      ),
    ],
  },
  {
    mot: 'opération',
    article: 'une',
    sens: [
      sensDe(
        'operation',
        'medecin',
        "Intervention chirurgicale pratiquée sur le corps de l'homme ou de l'animal.",
        'un acte fait par un chirurgien',
        'Après son ___, mon oncle se repose à l’hôpital.',
      ),
      sensDe(
        'operation',
        'maths',
        "Action qu'on effectue selon une loi déterminée",
        'un calcul',
        'L’addition est une ___.',
      ),
    ],
  },
];

// ───────────────────────── Sens d'un mot inconnu ─────────────────────────

export interface Inconnu {
  readonly mot: string;
  /** Texte avec le mot et des indices autour. */
  readonly phrase: string;
  /** Sens simple, écrit pour l'élève. */
  readonly sens: string;
  /** Les mots de la phrase qui aident. */
  readonly indice: string;
  /** Contresens tentant, avec son explication. */
  readonly piege: readonly [string, string];
  readonly faitId: string;
}

const inconnu = ({ article, citation, ...i }: Omit<Inconnu, 'faitId'> & Cite): Inconnu => ({
  ...i,
  faitId: acad(`ctx-${article}`, article, citation),
});

export const INCONNUS: readonly Inconnu[] = [
  inconnu({
    mot: 'dérobé',
    article: 'derober',
    citation: 'Enlever furtivement, voler.',
    phrase: 'La pie a dérobé ma bague brillante : elle est partie avec sans que je la voie.',
    sens: 'volé',
    indice: 'elle est partie avec sans que je la voie',
    piege: ['lavé', 'La pie emporte la bague, elle ne la nettoie pas.'],
  }),
  inconnu({
    mot: 'chétif',
    article: 'chetif',
    citation: 'Faible, débile',
    phrase: 'Ce petit arbre est chétif : son tronc est tout mince et il perd ses feuilles.',
    sens: 'faible',
    indice: 'son tronc est tout mince et il perd ses feuilles',
    piege: ['très fort', 'Un tronc tout mince montre le contraire de la force.'],
  }),
  inconnu({
    mot: 'gravi',
    article: 'gravir',
    citation: 'Monter peu à peu, parfois avec effort.',
    phrase: 'Nous avons gravi la colline : à chaque pas, nous étions un peu plus haut et plus essoufflés.',
    sens: 'monté avec effort',
    indice: 'un peu plus haut et plus essoufflés',
    piege: ['descendu en courant', 'On est de plus en plus haut : on ne descend pas.'],
  }),
  inconnu({
    mot: 'dévalé',
    article: 'devaler',
    citation: "descendre rapidement le long d'une pente.",
    phrase: 'Le ballon a dévalé la pente : il roulait vers le bas de plus en plus vite.',
    sens: 'descendu très vite',
    indice: 'vers le bas de plus en plus vite',
    piege: ['grimpé lentement', 'Il roule vers le bas, et de plus en plus vite.'],
  }),
  inconnu({
    mot: 'festin',
    article: 'festin',
    citation: "Repas de fête, d'apparat.",
    phrase: 'Pour le mariage, on prépare un festin : de grandes tables, beaucoup de plats et un gâteau.',
    sens: 'un grand repas de fête',
    indice: 'le mariage, beaucoup de plats et un gâteau',
    piege: ['un petit goûter rapide', 'Il y a de grandes tables et beaucoup de plats.'],
  }),
  inconnu({
    mot: 'maussade',
    article: 'maussade',
    citation: "Qui laisse paraître, souvent sans cause apparente, de l'ennui et du mécontentement",
    phrase: 'Ce matin, mon frère est maussade : il boude, soupire et ne veut parler à personne.',
    sens: 'de mauvaise humeur',
    indice: 'il boude et soupire',
    piege: ['très joyeux', 'Quelqu’un qui boude n’est pas joyeux.'],
  }),
  inconnu({
    mot: 'flâner',
    article: 'flaner',
    citation: 'Se promener sans but précis et à loisir.',
    phrase: 'Le dimanche, nous aimons flâner : nous marchons doucement, sans savoir où aller.',
    sens: 'se promener sans se presser',
    indice: 'doucement, sans savoir où aller',
    piege: ['courir pour arriver à l’heure', 'On marche doucement et sans but.'],
  }),
  inconnu({
    mot: 'détalé',
    article: 'detaler',
    citation: "se sauver, s'enfuir.",
    phrase: 'En entendant le chien, le lapin a détalé : en une seconde, il avait disparu.',
    sens: 'filé à toute vitesse',
    indice: 'en une seconde, il avait disparu',
    piege: ['dormi tranquillement', 'Le lapin disparaît très vite : il ne dort pas.'],
  }),
  inconnu({
    mot: 'averse',
    article: 'averse',
    citation: 'Pluie subite et abondante.',
    phrase: 'Une averse nous a surpris : en quelques minutes, nos habits étaient trempés.',
    sens: 'une forte pluie soudaine',
    indice: 'surpris, trempés',
    piege: ['un grand soleil', 'Des habits trempés viennent de l’eau, pas du soleil.'],
  }),
  inconnu({
    mot: 'brise',
    article: 'brise',
    citation: 'Petit vent frais et doux.',
    phrase: 'Une brise fait bouger doucement les rideaux et nous rafraîchit.',
    sens: 'un petit vent doux',
    indice: 'bouger doucement, rafraîchit',
    piege: ['une violente tempête', 'Les rideaux bougent doucement : ce n’est pas une tempête.'],
  }),
  inconnu({
    mot: 's’assoupit',
    article: 'assoupir',
    citation: 'Endormir à demi.',
    phrase: 'Après le repas, Grand-père s’assoupit : ses yeux se ferment et sa tête penche.',
    sens: 's’endort à moitié',
    indice: 'ses yeux se ferment',
    piege: ['se met à courir', 'Les yeux se ferment : il se repose.'],
  }),
  inconnu({
    mot: 'scrute',
    article: 'scruter',
    citation: 'Examiner, étudier une chose de façon à la pénétrer',
    phrase: 'Le marin scrute l’horizon : il fixe la mer longtemps pour ne rien manquer.',
    sens: 'regarde très attentivement',
    indice: 'il fixe longtemps pour ne rien manquer',
    piege: ['ferme les yeux', 'Pour ne rien manquer, il faut bien regarder.'],
  }),
  inconnu({
    mot: 'rassasié',
    article: 'rassasier',
    citation: "Apaiser pleinement la faim de quelqu'un.",
    phrase: 'J’ai mangé deux assiettes : je suis rassasié et je ne veux plus rien.',
    sens: 'qui n’a plus faim',
    indice: 'je ne veux plus rien',
    piege: ['affamé', 'Après deux assiettes, on ne veut plus manger.'],
  }),
  inconnu({
    mot: 'faufile',
    article: 'faufiler',
    citation: 'Se frayer un chemin, se glisser.',
    phrase: 'La souris se faufile entre deux caisses : elle passe par un tout petit espace.',
    sens: 'se glisse',
    indice: 'elle passe par un tout petit espace',
    piege: ['reste immobile', 'Elle passe d’un endroit à un autre : elle bouge.'],
  }),
];

export const FAITS_VOCABULAIRE: readonly Fait[] = [...faits.values()];

export const faitVocabulaire = (id: string): Fait => {
  const x = faits.get(id);
  if (!x) throw new RangeError(`fait inconnu : ${id}`);
  return x;
};

/** Sources d'une notion : le programme puis les articles de tous les faits utilisés. */
export const sourcesVocabulaire = (ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitVocabulaire(id).source)]),
];
