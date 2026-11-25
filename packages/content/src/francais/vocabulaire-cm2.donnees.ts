/**
 * Données du chapitre « Vocabulaire » (CM2) : faits cités et phrases écrites pour l'exercice. Chaque fait porte
 * l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const faits = new Map<string, Fait>();
/** Identifiant de source : le mot sans accents (« règle » → « regle »). */
const slug = (mot: string): string => mot.normalize('NFD').replace(/\p{M}/gu, '').replace('œ', 'oe').replace(/-$/, '');
/** Enregistre un fait et renvoie son identifiant (préfixé pour ne pas se confondre avec ceux du CM1). */
const fait = (id: string, source: string, citation: string): string => {
  faits.set(id, { id, source, citation });
  return id;
};
/** Article du Dictionnaire de l'Académie française, 9e édition (identifiant `academie-…`). */
const acad = (article: string, citation: string, id = article) =>
  fait(`v2-${id}`, `academie-${slug(article)}`, citation);
/** Article du Trésor de la langue française informatisé (identifiant `cnrtl-…`). */
const tlf = (id: string, article: string, citation: string) => fait(`v2-${id}`, `cnrtl-${slug(article)}`, citation);

// ───────────────────────── Programme et définitions ─────────────────────────

fait('v2-prog-relations', PROGRAMME, 'Approfondir les relations morphologiques et sémantiques entre les mots');
fait(
  'v2-prog-morphologie',
  PROGRAMME,
  'Se servir du contexte et de la morphologie pour comprendre les mots inconnus rencontrés au cours de sa lecture',
);
fait(
  'v2-prog-classe',
  PROGRAMME,
  'Donner des exemples de synonymes et d’antonymes qui respectent la classe grammaticale du mot cible',
);
fait('v2-prog-generique', PROGRAMME, 'siège est l’hyperonyme de tabouret, banc, chaise, etc. qui sont ses hyponymes');
fait(
  'v2-prog-expressions',
  PROGRAMME,
  'aux mots délimités par des critères graphiques s’ajoutent les expressions et les unités polylexicales (poule mouillée, sur un pied d’égalité, donner son feu vert à, etc.)',
);
tlf(
  'def-famille',
  'famille',
  'Tous les mots dérivés et les mots composés formés sur un même radical constituent une famille de mots.',
);
tlf('def-radical', 'radical', 'Partie essentielle du mot formé sur une racine, qui sert de base');
tlf('def-synonyme', 'synonyme', "De forme différente et de même sens (ou de sens voisin) qu'un autre mot.");
acad('antonyme', "Mot dont le sens s'oppose totalement à celui d'un autre.", 'def-antonyme');
acad(
  'prefixe',
  'Élément de composition placé avant un radical pour former une unité lexicale de sens différent',
  'def-prefixe',
);
tlf(
  'def-suffixe',
  'suffixe',
  "Affixe placé à la fin d'une unité lexicale, après le radical, et qui modifie le sens de ce radical.",
);
acad(
  'locution',
  "Groupe de mots réunis par l'usage en une formule dont le sens ou l'emploi sont nettement déterminés.",
  'def-locution',
);
acad('expression', "Terme, tour qu'on emploie pour exprimer ce qu'on veut dire.", 'def-expression');

// ───────────────────────── Familles de mots ─────────────────────────

export interface Membre {
  readonly mot: string;
  /** Facile : le mot simple se voit sans changement. */
  readonly visible: boolean;
  readonly phrase: string;
  readonly faitId: string;
}

export interface Intrus {
  readonly mot: string;
  readonly pourquoi: string;
  readonly phrase: string;
  readonly faitId: string;
}

export interface Famille {
  readonly base: string;
  readonly membres: readonly Membre[];
  readonly intrus?: Intrus;
}

const membre = (mot: string, citation: string, visible: boolean, phrase: string): Membre => ({
  mot,
  visible,
  phrase,
  faitId: acad(mot, citation, `fam-${mot}`),
});
const intrus = (mot: string, citation: string, pourquoi: string, phrase: string): Intrus => ({
  mot,
  pourquoi,
  phrase,
  faitId: acad(mot, citation, `intrus-${mot}`),
});

export const FAMILLES: readonly Famille[] = [
  {
    base: 'grand',
    membres: [
      membre('grandir', 'Dérivé de grand.', true, 'Le jeune arbre va « grandir ».'),
      membre('grandeur', 'Dérivé de grand.', true, 'On mesure la « grandeur » de la salle.'),
      membre('agrandir', 'Dérivé de grand.', false, 'Nous allons « agrandir » la photo.'),
    ],
    intrus: intrus(
      'grange',
      'dérivé du latin classique granum, « grain, graine ».',
      '« Grange » vient d’un mot latin qui voulait dire « grain ». Elle ne vient pas de « grand ».',
      'Le foin est rangé dans la « grange ».',
    ),
  },
  {
    base: 'bois',
    membres: [
      membre('boiserie', 'Dérivé de bois.', true, 'Une belle « boiserie » couvre le mur.'),
      membre('reboiser', 'Dérivé de boiser.', false, 'Après le feu, on va « reboiser » la colline.'),
      membre('déboisement', 'Dérivé de déboiser.', false, 'Le « déboisement » a laissé la pente nue.'),
    ],
    intrus: intrus(
      'boisson',
      '« action de boire »',
      '« Boisson » vient d’un mot latin qui voulait dire « action de boire ». Rien à voir avec « bois ».',
      'Quelle « boisson » veux-tu ?',
    ),
  },
  {
    base: 'mer',
    membres: [
      membre('marée', 'Dérivé de mer .', false, 'À « marée » basse, on voit les rochers.'),
      membre('marin', "Personne qui connaît l'art de la navigation sur mer", false, 'Le « marin » regarde l’horizon.'),
    ],
    intrus: intrus(
      'marteau',
      'Issu du latin martulus, marculus, diminutif de marcus, « marteau ».',
      '« Marteau » vient d’un mot latin qui désignait déjà un marteau. Il ne vient pas de « mer ».',
      'Je plante un clou avec le « marteau ».',
    ),
  },
  {
    base: 'fleur',
    membres: [
      membre(
        'floral',
        'Qui appartient aux fleurs, qui concerne la fleur ou les fleurs.',
        false,
        'Voici un décor « floral ».',
      ),
      membre('fleurir', 'Produire des fleurs, se couvrir de fleurs', true, 'Les lilas vont « fleurir ».'),
    ],
  },
  {
    base: 'dent',
    membres: [
      membre('denture', 'Dérivé de dent.', true, 'Le chien a une belle « denture ».'),
      membre('dentaire', 'de dens, dentis, « dent »', true, 'Voici le cabinet « dentaire ».'),
    ],
  },
  {
    base: 'chant',
    membres: [
      membre('chanteur', 'Personne qui chante.', true, 'Le « chanteur » salue le public.'),
      membre('chantonner', 'Dérivé de chanter.', true, 'J’aime « chantonner » le matin.'),
    ],
    intrus: intrus(
      'chantier',
      'Du latin cantherius, « cheval de charge »',
      '« Chantier » vient d’un mot latin qui voulait dire « cheval de charge ». Rien à voir avec « chant ».',
      'Les maçons arrivent sur le « chantier ».',
    ),
  },
  {
    base: 'camp',
    membres: [
      membre('camper', 'Dérivé de camp.', true, 'Cet été, nous allons « camper ».'),
      membre('campement', 'Dérivé de camper.', true, 'Les scouts montent leur « campement ».'),
      membre('campeur', 'Dérivé de camper', true, 'Un « campeur » plie sa tente.'),
    ],
  },
  {
    base: 'lait',
    membres: [
      membre('laiteux', 'Dérivé de lait.', true, 'Ce liquide a un aspect « laiteux ».'),
      membre('allaiter', 'Nourrir de son lait.', false, 'La chatte va « allaiter » ses petits.'),
    ],
  },
  {
    base: 'poisson',
    membres: [
      membre('poissonnier', 'Dérivé de poisson.', true, 'Le « poissonnier » ouvre sa boutique.'),
      membre('poissonnerie', 'Dérivé de poisson.', true, 'La « poissonnerie » est près du port.'),
    ],
  },
];

// ───────────────────────── Préfixes ─────────────────────────

export type Prefixe = 're-' | 'dé-' | 'in-' | 'im-';

export const SENS_PREFIXE: Readonly<Record<Prefixe, string>> = {
  're-': 'de nouveau',
  'dé-': 'l’action contraire',
  'in-': 'ne… pas (le contraire)',
  'im-': 'ne… pas (le contraire)',
};

export const FAITS_PREFIXES: readonly string[] = [
  tlf('prefixe-re', 'prefixe-re', 'Le préf. exprime la répét. du procès ou sa reprise après une interruption'),
  acad('in9', 'Préfixe négatif servant à former des adjectifs', 'prefixe-in'),
  acad('de9', "pour former le contraire d'un verbe ou d'un substantif", 'prefixe-de'),
  tlf('prefixe-im', 'prefixe-in', 'In- + b ou p > imb-, imp-'),
  tlf('prefixe-imm', 'prefixe-in', 'In- + m a) > imm-'),
];

/** Mot construit avec un préfixe : le sens est écrit sans le mot lui-même. */
export interface Prefixe_ {
  readonly mot: string;
  readonly base: string;
  readonly prefixe: Prefixe;
  readonly definition: string;
  /** Phrase avec « {} » à la place du mot. */
  readonly phrase: string;
  readonly faitId: string;
}

const prefixe = (
  p: Prefixe,
  [base, mot]: readonly [string, string],
  citation: string,
  definition: string,
  phrase: string,
): Prefixe_ => ({ prefixe: p, base, mot, definition, phrase, faitId: acad(mot, citation, `pre-${mot}`) });

export const PREFIXES: readonly Prefixe_[] = [
  prefixe(
    're-',
    ['commencer', 'recommencer'],
    'Dérivé de commencer.',
    'commencer de nouveau',
    'La partie est finie : on va {}.',
  ),
  prefixe(
    're-',
    ['copier', 'recopier'],
    'Dérivé de copier.',
    'copier de nouveau',
    'Ma phrase est raturée : je vais la {}.',
  ),
  prefixe('re-', ['dire', 'redire'], 'Dérivé de dire.', 'dire de nouveau', 'Tu n’as pas entendu ? Je vais te le {}.'),
  prefixe(
    're-',
    ['planter', 'replanter'],
    'Dérivé de planter.',
    'planter de nouveau',
    'La fleur est arrachée : il faut la {}.',
  ),
  prefixe(
    'dé-',
    ['coiffer', 'décoiffer'],
    'Dérivé de coiffer.',
    'faire le contraire de « coiffer »',
    'Le vent va me {} et mettre mes cheveux en désordre.',
  ),
  prefixe(
    'dé-',
    ['plier', 'déplier'],
    'Dérivé de plier.',
    'faire le contraire de « plier »',
    'Pour lire la carte, il faut la {}.',
  ),
  prefixe(
    'dé-',
    ['brancher', 'débrancher'],
    'Dérivé de brancher.',
    'faire le contraire de « brancher »',
    'Avant de nettoyer la lampe, il faut la {}.',
  ),
  prefixe(
    'dé-',
    ['boucher', 'déboucher'],
    'Dérivé du verbe boucher.',
    'faire le contraire de « boucher »',
    'L’évier est bouché : papa va le {}.',
  ),
  prefixe(
    'in-',
    ['capable', 'incapable'],
    "Qui n'est pas capable",
    'le contraire de « capable »',
    'Il est trop fatigué : il est {} de continuer.',
  ),
  prefixe(
    'in-',
    ['correct', 'incorrect'],
    "Qui n'est pas correct.",
    'le contraire de « correct »',
    'Ce mot est mal accordé : la phrase est {}.',
  ),
  prefixe(
    'in-',
    ['utile', 'inutile'],
    "Qui n'est d'aucune utilité, qui ne sert à rien.",
    'le contraire de « utile »',
    'Il fait beau : le parapluie est {}.',
  ),
  prefixe(
    'in-',
    ['exact', 'inexact'],
    "Dérivé d'exact.",
    'le contraire de « exact »',
    'Le résultat est faux : le calcul est {}.',
  ),
  prefixe(
    'im-',
    ['patient', 'impatient'],
    'Qui manque de patience',
    'le contraire de « patient »',
    'Il ne tient plus en place : il est {}.',
  ),
  prefixe(
    'im-',
    ['poli', 'impoli'],
    'Qui est sans politesse.',
    'le contraire de « poli »',
    'Il ne dit jamais merci : il est {}.',
  ),
  prefixe(
    'im-',
    ['prudent', 'imprudent'],
    'Qui manque de prudence.',
    'le contraire de « prudent »',
    'Il traverse sans regarder : il est {}.',
  ),
  prefixe(
    'im-',
    ['mobile', 'immobile'],
    "Qui n'est animé d'aucun mouvement.",
    'le contraire de « mobile »',
    'La statue ne bouge pas : elle reste {}.',
  ),
];

/** Mots qui commencent comme un préfixe mais n'en contiennent pas ici. */
export const FAUX_PREFIXES: readonly Intrus[] = [
  intrus(
    'reptile',
    'Emprunté du latin reptilis, « qui rampe »',
    '« Reptile » vient d’un mot latin qui voulait dire « qui rampe ». « re » n’y veut pas dire « de nouveau ».',
    'Le « reptile » se chauffe au soleil.',
  ),
  intrus(
    'image',
    'Emprunté du latin imaginem',
    '« Image » vient d’un mot latin qui désignait déjà une image. « im » n’y veut pas dire « ne… pas ».',
    'Je colle une « image ».',
  ),
  intrus(
    'indigo',
    "parce que l'indigo provenait de l'Inde.",
    '« Indigo » vient d’un mot qui parlait de l’Inde. « in » n’y veut pas dire « ne… pas ».',
    'Elle porte un pull « indigo ».',
  ),
];

// ───────────────────────── Suffixes ─────────────────────────

export type Classe = 'nom' | 'adjectif' | 'adverbe';

export interface Suffixe {
  readonly mot: string;
  readonly base: string;
  readonly suffixe: string;
  /** Sens, écrit pour l'élève. */
  readonly sens: string;
  readonly classe: Classe;
  readonly definition: string;
  readonly phrase: string;
  readonly faitId: string;
}

const PETIT = 'quelque chose de petit';
const AGENT = 'la personne qui fait l’action';
const ACTION = 'l’action';
const MANIERE = 'la manière (comment ?)';
const QUALITE = 'comment est quelqu’un ou quelque chose';
const ARBRE = 'l’arbre qui donne un fruit';
const LIEU = 'le lieu où l’on vend ou fabrique';

const suf = (
  [suffixe, base, mot]: readonly [string, string, string],
  citation: string,
  [sens, classe]: readonly [string, Classe],
  definition: string,
  phrase: string,
): Suffixe => ({ suffixe, base, mot, sens, classe, definition, phrase, faitId: acad(mot, citation, `suf-${mot}`) });

export const SUFFIXES: readonly Suffixe[] = [
  suf(
    ['-ette', 'cloche', 'clochette'],
    'Petite cloche',
    [PETIT, 'nom'],
    'une petite cloche',
    'La chèvre porte une {} au cou.',
  ),
  suf(
    ['-ette', 'planche', 'planchette'],
    'Petite planche',
    [PETIT, 'nom'],
    'une petite planche',
    'Je cloue une {} sur la boîte.',
  ),
  suf(
    ['-et', 'jardin', 'jardinet'],
    'Petit jardin.',
    [PETIT, 'nom'],
    'un petit jardin',
    'Devant la porte, il y a un {}.',
  ),
  suf(
    ['-et', 'garçon', 'garçonnet'],
    'Petit garçon.',
    [PETIT, 'nom'],
    'un petit garçon',
    'Un {} de trois ans joue au sable.',
  ),
  suf(
    ['-eur', 'coiffer', 'coiffeur'],
    'Personne qui fait métier de laver, de couper',
    [AGENT, 'nom'],
    'la personne qui coiffe',
    'Le {} me coupe les cheveux.',
  ),
  suf(
    ['-eur', 'chercher', 'chercheur'],
    'Personne qui cherche.',
    [AGENT, 'nom'],
    'la personne qui cherche',
    'Un {} d’or fouille la rivière.',
  ),
  suf(
    ['-eur', 'patiner', 'patineur'],
    'Personne qui pratique le patinage.',
    [AGENT, 'nom'],
    'la personne qui patine',
    'Le {} glisse sur la glace.',
  ),
  suf(
    ['-age', 'nettoyer', 'nettoyage'],
    'Action de nettoyer.',
    [ACTION, 'nom'],
    'l’action de nettoyer',
    'Après la fête, place au {} !',
  ),
  suf(
    ['-age', 'bavarder', 'bavardage'],
    'Action de bavarder.',
    [ACTION, 'nom'],
    'l’action de bavarder',
    'Chut ! Arrêtez ce {}.',
  ),
  suf(
    ['-ment', 'facile', 'facilement'],
    'Dérivé de facile.',
    [MANIERE, 'adverbe'],
    'd’une manière facile',
    'Tu as résolu l’énigme très {}.',
  ),
  suf(
    ['-ment', 'doux', 'doucement'],
    "D'une manière douce.",
    [MANIERE, 'adverbe'],
    'd’une manière douce',
    'Ferme la porte {}.',
  ),
  suf(
    ['-ment', 'rapide', 'rapidement'],
    "d'une manière rapide.",
    [MANIERE, 'adverbe'],
    'd’une manière rapide',
    'Le feu se propage {}.',
  ),
  suf(
    ['-eux', 'danger', 'dangereux'],
    'Dérivé de danger.',
    [QUALITE, 'adjectif'],
    'qui met en danger',
    'Ce virage est {}.',
  ),
  suf(
    ['-eux', 'honte', 'honteux'],
    'Dérivé de honte.',
    [QUALITE, 'adjectif'],
    'qui a ou qui cause de la honte',
    'Il baisse la tête, tout {}.',
  ),
  suf(
    ['-eux', 'lait', 'laiteux'],
    "Qui a l'aspect, la consistance ou la couleur du lait.",
    [QUALITE, 'adjectif'],
    'qui a l’aspect du lait',
    'De la tige coule un liquide {}.',
  ),
  suf(
    ['-ier', 'poire', 'poirier'],
    'Dérivé de poire.',
    [ARBRE, 'nom'],
    'l’arbre qui donne des poires',
    'Un {} pousse dans le verger.',
  ),
  suf(
    ['-ier', 'cerise', 'cerisier'],
    'Dérivé de cerise.',
    [ARBRE, 'nom'],
    'l’arbre qui donne des cerises',
    'Le {} est couvert de fruits rouges.',
  ),
  suf(
    ['-erie', 'poisson', 'poissonnerie'],
    "Lieu où l'on vend aux particuliers des poissons",
    [LIEU, 'nom'],
    'le lieu où l’on vend du poisson',
    'J’achète des crevettes à la {}.',
  ),
  suf(
    ['-erie', 'boulanger', 'boulangerie'],
    'Local où se fait et se vend le pain.',
    [LIEU, 'nom'],
    'le lieu où l’on fait et vend le pain',
    'Je prends une baguette à la {}.',
  ),
];

// ───────────────────────── Synonymes et antonymes ─────────────────────────

export type ClasseMot = 'nom' | 'verbe' | 'adjectif';

/** Un mot, son synonyme ou son antonyme de même classe (cité), et un mot de la bonne famille mais d'une autre classe. */
export interface Paire {
  readonly relation: 'synonyme' | 'antonyme';
  readonly classe: ClasseMot;
  readonly mot: string;
  readonly reponse: string;
  /** Mot voisin de la réponse, d'une autre classe : le piège. */
  readonly autreClasse: readonly [string, ClasseMot | 'adverbe'];
  /** Phrase avec « {} » à la place du mot. */
  readonly phrase: string;
  readonly faitId: string;
}

const paire =
  (relation: Paire['relation']) =>
  (
    classe: ClasseMot,
    [mot, reponse]: readonly [string, string],
    [article, citation]: readonly [string, string],
    autreClasse: Paire['autreClasse'],
    phrase: string,
  ): Paire => ({
    relation,
    classe,
    mot,
    reponse,
    autreClasse,
    phrase,
    faitId: tlf(`${relation}-${mot}`, article, citation),
  });
const syn = paire('synonyme');
const ant = paire('antonyme');

export const PAIRES: readonly Paire[] = [
  syn(
    'nom',
    ['victoire', 'triomphe'],
    ['victoire', 'Synon. réussite, triomphe'],
    ['triompher', 'verbe'],
    'Quelle belle {} !',
  ),
  syn(
    'nom',
    ['richesse', 'fortune'],
    ['richesse', 'Synon. fortune, opulence'],
    ['fortuné', 'adjectif'],
    'Il pense à sa {}.',
  ),
  syn(
    'nom',
    ['courage', 'bravoure'],
    ['courage', 'Synon. bravoure, cran, intrépidité, témérité, vaillance'],
    ['brave', 'adjectif'],
    'On admire son {}.',
  ),
  syn(
    'nom',
    ['vacarme', 'tapage'],
    ['vacarme', 'Synon. chahut, chambard (fam.), tapage, tumulte'],
    ['tapageur', 'adjectif'],
    'Quel {} dans la cour !',
  ),
  syn(
    'verbe',
    ['craindre', 'redouter'],
    ['craindre', 'Synon. avoir peur de, redouter'],
    ['redoutable', 'adjectif'],
    'Il semble {} l’orage.',
  ),
  syn(
    'verbe',
    ['féliciter', 'complimenter'],
    ['féliciter', 'Synon. complimenter, congratuler'],
    ['compliment', 'nom'],
    'Je viens te {}.',
  ),
  syn('verbe', ['monter', 'grimper'], ['monter', 'Synon. grimper'], ['grimpeur', 'nom'], 'Le chat veut {} à l’arbre.'),
  syn(
    'verbe',
    ['encourager', 'stimuler'],
    ['encourager', 'Synon. enhardir, stimuler'],
    ['stimulant', 'adjectif'],
    'Il faut {} l’équipe.',
  ),
  syn(
    'adjectif',
    ['prudent', 'prévoyant'],
    ['prudent', 'Synon. avisé, circonspect, mesuré, prévoyant, réfléchi, sage'],
    ['prévoir', 'verbe'],
    'Mon oncle est {}.',
  ),
  syn('adjectif', ['sincère', 'franc'], ['sincère', 'Synon. franc3, loyal'], ['franchise', 'nom'], 'Ton ami est {}.'),
  syn(
    'adjectif',
    ['fragile', 'frêle'],
    ['fragile', 'Synon. délicat, faible, frêle, vulnérable'],
    ['fragilité', 'nom'],
    'Ce petit pont semble {}.',
  ),
  syn(
    'adjectif',
    ['paresseux', 'indolent'],
    ['paresseux', 'Synon. apathique, indolent, inerte, lent, négligent, nonchalant'],
    ['indolence', 'nom'],
    'Ce chat est {}.',
  ),
  ant(
    'nom',
    ['victoire', 'défaite'],
    ['victoire', 'anton. défaite, échec, insuccès, revers'],
    ['vaincu', 'adjectif'],
    'Après la {}, on rentre.',
  ),
  ant(
    'nom',
    ['richesse', 'pauvreté'],
    ['richesse', 'anton. besoin, dénuement, misère, pauvreté'],
    ['pauvre', 'adjectif'],
    'Le conte parle de {}.',
  ),
  ant(
    'nom',
    ['courage', 'lâcheté'],
    ['courage', 'anton. couardise, faiblesse, lâcheté, poltronnerie'],
    ['lâche', 'adjectif'],
    'On juge son {}.',
  ),
  ant('nom', ['succès', 'échec'], ['succès', 'échec, revers'], ['échouer', 'verbe'], 'Le spectacle est un {}.'),
  ant('nom', ['haine', 'amour'], ['haine', 'anton. amour'], ['aimable', 'adjectif'], 'Le conte parle de {}.'),
  ant(
    'verbe',
    ['vendre', 'acheter'],
    ['vendre', 'Anton. acheter, acquérir'],
    ['achat', 'nom'],
    'Elle veut {} un vélo.',
  ),
  ant('verbe', ['gagner', 'perdre'], ['gagner', 'Anton. perdre'], ['perte', 'nom'], 'Je peux {} la partie.'),
  ant('verbe', ['ralentir', 'accélérer'], ['ralentir', 'Anton. accélérer'], ['accélération', 'nom'], 'Le car va {}.'),
  ant('verbe', ['remplir', 'vider'], ['remplir', 'Anton. vider'], ['vide', 'adjectif'], 'Il faut {} le seau.'),
  ant(
    'verbe',
    ['attaquer', 'défendre'],
    ['attaquer', 'Anton. défendre'],
    ['défense', 'nom'],
    'Les chevaliers vont {} le château.',
  ),
  ant(
    'verbe',
    ['détruire', 'construire'],
    ['détruire', 'Anton. construire'],
    ['construction', 'nom'],
    'Ils vont {} la cabane.',
  ),
  ant(
    'adjectif',
    ['prudent', 'imprudent'],
    ['prudent', 'anton. imprudent'],
    ['imprudence', 'nom'],
    'Ce cycliste est {}.',
  ),
  ant('adjectif', ['généreux', 'avare'], ['généreux', 'Anton. avare'], ['avarice', 'nom'], 'Ce roi est {}.'),
  ant(
    'adjectif',
    ['timide', 'audacieux'],
    ['timide', 'anton. audacieux, effronté, entreprenant, hardi'],
    ['audace', 'nom'],
    'Ce garçon est {}.',
  ),
  ant(
    'adjectif',
    ['paresseux', 'travailleur'],
    ['paresseux', 'anton. actif, bûcheur (fam.), laborieux, travailleur'],
    ['travail', 'nom'],
    'Ce lutin est {}.',
  ),
  ant(
    'adjectif',
    ['fragile', 'solide'],
    ['fragile', 'Anton. résistant, robuste, solide'],
    ['solidité', 'nom'],
    'Ce banc est {}.',
  ),
  ant(
    'adjectif',
    ['sincère', 'menteur'],
    ['sincère', 'anton. faux1, hypocrite, menteur'],
    ['mensonge', 'nom'],
    'Ce voisin est {}.',
  ),
];

// ───────────────────────── Mot générique et mots particuliers ─────────────────────────

export interface Groupe {
  readonly generique: string;
  /** Écritures acceptées pour le mot générique. */
  readonly accepte: readonly string[];
  /** Groupes à ne pas mêler dans une question : leurs sens se recouvrent. */
  readonly voisins?: readonly string[];
  readonly particuliers: readonly { readonly mot: string; readonly faitId: string }[];
}

const groupe = (
  generique: string,
  accepte: readonly string[],
  particuliers: readonly (readonly [string, string])[],
  voisins?: readonly string[],
): Groupe => ({
  generique,
  accepte,
  ...(voisins ? { voisins } : {}),
  particuliers: particuliers.map(([mot, citation]) => ({ mot, faitId: acad(mot, citation, `gen-${mot}`) })),
});

export const GROUPES: readonly Groupe[] = [
  groupe(
    'siège',
    ['siège', 'sièges'],
    [
      ['chaise', 'Siège à dossier, sans bras.'],
      ['fauteuil', 'Siège à dossier et à bras.'],
      ['banc', 'Siège étroit et allongé, avec ou sans dossier'],
    ],
    ['meuble'],
  ),
  groupe(
    'fruit',
    ['fruit', 'fruits'],
    [
      ['pomme', 'Fruit du pommier'],
      ['poire', 'Fruit du poirier'],
      ['cerise', 'Petit fruit charnu à noyau'],
      ['banane', 'Fruit du bananier'],
      ['fraise', 'Fruit du fraisier'],
    ],
  ),
  groupe(
    'arbre',
    ['arbre', 'arbres'],
    [
      ['chêne', 'Grand arbre forestier'],
      ['bouleau', 'Arbre forestier de la famille des Bétulacées'],
      ['peuplier', 'Arbre de la famille des Salicacées'],
    ],
  ),
  groupe(
    'poisson',
    ['poisson', 'poissons'],
    [
      ['sardine', 'Poisson de mer de la famille des Clupéidés'],
      ['saumon', 'Poisson migrateur de la famille des Salmonidés'],
      ['carpe', "Poisson d'eau douce"],
    ],
  ),
  groupe(
    'meuble',
    ['meuble', 'meubles'],
    [
      ['armoire', 'Meuble à une ou plusieurs portes'],
      ['buffet', 'Meuble de salle à manger, de cuisine'],
      ['commode', "Meuble à hauteur d'appui"],
    ],
    ['siège'],
  ),
  groupe(
    'véhicule',
    ['véhicule', 'véhicules'],
    [
      ['camion', 'Grand véhicule automobile de forte puissance'],
      ['autobus', 'Grand véhicule automobile qui sert à transporter des personnes'],
      ['bicyclette', "Véhicule à deux roues d'égale dimension"],
    ],
  ),
  groupe(
    'outil',
    ['outil', 'outils'],
    [
      ['scie', 'Outil muni d’une lame d’acier dentelée'],
      ['marteau', "Outil composé d'une tête en métal fixée à un manche"],
      ['rabot', 'Outil de menuisier'],
    ],
    ['instrument de musique'],
  ),
  groupe(
    'instrument de musique',
    ['instrument de musique', 'instruments de musique', 'instrument', 'instruments'],
    [
      ['piano', 'Instrument de musique à clavier'],
      ['harpe', "Instrument de musique composé d'un cadre de bois triangulaire"],
      ['guitare', 'Instrument de musique à cordes pincées'],
      ['clarinette', 'Instrument à vent, de la famille des bois'],
    ],
    ['outil'],
  ),
];

// ───────────────────────── Expressions et locutions ─────────────────────────

export interface Expression {
  /** Expression complète, à l'infinitif ou figée. */
  readonly texte: string;
  readonly sorte: 'expression' | 'locution';
  readonly sens: string;
  /** Sens pris au pied de la lettre ou contresens : le piège. */
  readonly piege: readonly [string, string];
  /** Mot à retrouver (il figure dans `texte`). */
  readonly trou: string;
  /** Phrase avec l'expression entre guillemets. */
  readonly phrase: string;
  readonly faitId: string;
}

const expression = (
  { article, citation, ...e }: Omit<Expression, 'faitId'> & { readonly article: string; readonly citation: string },
  id: string,
): Expression => ({ ...e, faitId: acad(article, citation, `exp-${id}`) });

export const EXPRESSIONS: readonly Expression[] = [
  expression(
    {
      texte: 'une poule mouillée',
      sorte: 'expression',
      sens: 'une personne très peureuse',
      piege: ['un oiseau sous la pluie', 'C’est le sens mot à mot. Ici, on parle d’une personne.'],
      trou: 'poule',
      phrase: 'Il n’ose pas entrer : quelle « poule mouillée » !',
      article: 'poule',
      citation: "Une poule mouillée, une personne très craintive, qui n'a aucun courage.",
    },
    'poule',
  ),
  expression(
    {
      texte: 'mettre les pieds dans le plat',
      sorte: 'expression',
      sens: 'dire ce qu’il fallait taire',
      piege: ['marcher dans son assiette', 'C’est le sens mot à mot. L’expression parle d’une parole maladroite.'],
      trou: 'plat',
      phrase: 'Il a « mis les pieds dans le plat » : la surprise est dévoilée.',
      article: 'pied',
      citation: "Mettre les pieds dans le plat, dire ce qu'il faudrait taire",
    },
    'plat',
  ),
  expression(
    {
      texte: 'casser les pieds à quelqu’un',
      sorte: 'expression',
      sens: 'l’embêter',
      piege: ['le blesser à la jambe', 'C’est le sens mot à mot. Personne n’est blessé.'],
      trou: 'pieds',
      phrase: 'Arrête de me « casser les pieds » avec ta chanson !',
      article: 'pied',
      citation: "Casser les pieds à quelqu'un, l'importuner.",
    },
    'casser',
  ),
  expression(
    {
      texte: 'tomber dans les pommes',
      sorte: 'expression',
      sens: 's’évanouir',
      piege: ['chuter dans un panier de fruits', 'C’est le sens mot à mot. Il n’y a aucun fruit ici.'],
      trou: 'pommes',
      phrase: 'Il faisait si chaud qu’elle a failli « tomber dans les pommes ».',
      article: 'pomme',
      citation: "Tomber dans les pommes, perdre connaissance, s'évanouir.",
    },
    'pommes',
  ),
  expression(
    {
      texte: 'donner sa langue au chat',
      sorte: 'expression',
      sens: 'avouer qu’on ne trouve pas la réponse',
      piege: ['nourrir son animal', 'C’est le sens mot à mot. L’expression parle d’une devinette.'],
      trou: 'langue',
      phrase: 'Je ne trouve pas la devinette : je « donne ma langue au chat ».',
      article: 'langue',
      citation: 'avouer son impuissance à répondre à une question, à une devinette.',
    },
    'langue',
  ),
  expression(
    {
      texte: 'poser un lapin',
      sorte: 'expression',
      sens: 'ne pas venir à un rendez-vous',
      piege: ['installer un animal sur une table', 'C’est le sens mot à mot. L’expression parle d’un rendez-vous.'],
      trou: 'lapin',
      phrase: 'Je l’ai attendu une heure : il m’a « posé un lapin ».',
      article: 'lapin',
      citation: "Poser un lapin à quelqu'un, ne pas venir à un rendez-vous.",
    },
    'lapin',
  ),
  expression(
    {
      texte: 'avoir le cœur sur la main',
      sorte: 'expression',
      sens: 'être très généreux',
      piege: ['être blessé à la main', 'C’est le sens mot à mot. L’expression parle d’une qualité.'],
      trou: 'cœur',
      phrase: 'Il partage tout : il « a le cœur sur la main ».',
      article: 'cœur',
      citation: 'Avoir le cœur sur la main, être très généreux.',
    },
    'cœur',
  ),
  expression(
    {
      texte: 'coûter les yeux de la tête',
      sorte: 'expression',
      sens: 'coûter très cher',
      piege: ['faire mal aux yeux', 'C’est le sens mot à mot. L’expression parle d’un prix.'],
      trou: 'yeux',
      phrase: 'Ce vélo « coûte les yeux de la tête » !',
      article: 'œil',
      citation: 'Coûter les yeux de la tête, coûter horriblement cher.',
    },
    'yeux',
  ),
  expression(
    {
      texte: 'mettre la puce à l’oreille',
      sorte: 'expression',
      sens: 'faire naître un soupçon',
      piege: ['donner des démangeaisons', 'C’est le sens mot à mot. L’expression parle d’un doute.'],
      trou: 'puce',
      phrase: 'Les miettes m’ont « mis la puce à l’oreille » : qui a mangé le gâteau ?',
      article: 'puce',
      citation: "Mettre à quelqu'un la puce à l'oreille, éveiller chez lui des soupçons, des inquiétudes.",
    },
    'puce',
  ),
  expression(
    {
      texte: 'avoir un poil dans la main',
      sorte: 'expression',
      sens: 'être paresseux',
      piege: ['avoir les mains velues', 'C’est le sens mot à mot. L’expression parle d’un défaut.'],
      trou: 'poil',
      phrase: 'Il ne veut rien faire : il « a un poil dans la main ».',
      article: 'poil',
      citation: 'Avoir un poil dans la main, être porté à la paresse.',
    },
    'poil',
  ),
  expression(
    {
      texte: 'donner un coup de main',
      sorte: 'expression',
      sens: 'aider',
      piege: ['frapper quelqu’un', 'C’est le contraire d’une aide. « Un coup de main » est un service.'],
      trou: 'coup',
      phrase: 'Peux-tu me « donner un coup de main » pour ranger ?',
      article: 'main',
      citation: "donner un coup de main à quelqu'un, lui prêter assistance, lui venir en aide.",
    },
    'main',
  ),
  expression(
    {
      texte: 'avoir la main verte',
      sorte: 'expression',
      sens: 'réussir ce qu’on plante au jardin',
      piege: ['avoir les doigts pleins de peinture', 'C’est le sens mot à mot. L’expression parle du jardinage.'],
      trou: 'verte',
      phrase: 'Ses plantes poussent bien : il « a la main verte ».',
      article: 'main',
      citation: 'Avoir la main verte, jardiner, planter avec une réussite particulière.',
    },
    'verte',
  ),
  expression(
    {
      texte: 'donner le feu vert',
      sorte: 'expression',
      sens: 'donner l’autorisation d’agir',
      piege: ['allumer une flamme colorée', 'C’est le sens mot à mot. L’expression parle d’une permission.'],
      trou: 'feu',
      phrase: 'La maîtresse « donne le feu vert » : le projet peut démarrer.',
      article: 'feu',
      citation: "Donner, obtenir le feu vert, l'autorisation d'agir, d'entreprendre quelque chose.",
    },
    'feu',
  ),
  expression(
    {
      texte: 'tout à coup',
      sorte: 'locution',
      sens: 'soudain',
      piege: ['petit à petit', 'C’est le contraire : « tout à coup » arrive d’un seul moment.'],
      trou: 'coup',
      phrase: 'Nous lisions. « Tout à coup », la lumière s’éteint.',
      article: 'coup',
      citation: 'Tout à coup, soudainement.',
    },
    'coup',
  ),
  expression(
    {
      texte: 'sur-le-champ',
      sorte: 'locution',
      sens: 'tout de suite',
      piege: ['au milieu d’une prairie', 'C’est le sens mot à mot. La locution parle du temps.'],
      trou: 'champ',
      phrase: 'Le capitaine veut une réponse « sur-le-champ ».',
      article: 'champ',
      citation: "Sur-le-champ, sur l'heure même, sans délai.",
    },
    'champ',
  ),
  expression(
    {
      texte: 'de bonne heure',
      sorte: 'locution',
      sens: 'tôt',
      piege: ['avec joie', '« Bonne » ne parle pas ici de la joie. La locution parle de l’heure.'],
      trou: 'heure',
      phrase: 'Demain, nous partons « de bonne heure ».',
      article: 'heure',
      citation: 'De bonne heure, tôt ; précocement.',
    },
    'heure',
  ),
];

export const FAITS_VOCABULAIRE_CM2: readonly Fait[] = [...faits.values()];

export const faitVocabulaireCm2 = (id: string): Fait => {
  const x = faits.get(id);
  if (!x) throw new RangeError(`fait inconnu : ${id}`);
  return x;
};

/** Sources d'une notion : le programme puis les articles de tous les faits utilisés. */
export const sourcesVocabulaireCm2 = (ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitVocabulaireCm2(id).source)]),
];
