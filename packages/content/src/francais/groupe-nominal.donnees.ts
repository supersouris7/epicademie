/**
 * Données du chapitre « Le groupe nominal » (CM1) : faits cités et banques de phrases écrites pour l'exercice.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const prog = (id: string, citation: string): Fait => ({ id, source: PROGRAMME, citation });
const tlfi = (id: string, source: string, citation: string): Fait => ({ id, source: `cnrtl-${source}`, citation });

export const FAITS_GN: readonly Fait[] = [
  prog(
    'elements',
    'Repérer des groupes nominaux dans une phrase simple et nommer les différents éléments qui les constituent : Dét. + Nom ; Dét. + Nom + Adj. ; Dét. + Adj.+ Nom',
  ),
  prog('noyau', 'Repérer et nommer le nom noyau dans le groupe nominal'),
  prog('epithete', 'Aborder la notion d’épithète'),
  prog('remplacer-sujet', 'Remplacer un groupe nominal sujet par un pronom personnel sujet'),
  prog('remplacer-objet', 'Remplacer un groupe nominal objet par un pronom personnel objet'),
  tlfi(
    'groupe-nominal',
    'nominal',
    "constitué d'un nom et des termes (déterminants, adjectifs, etc.) qui s'y rapportent",
  ),
  tlfi(
    'determinant',
    'determinant',
    "a pour fonction de le déterminer, c'est-à-dire d'en préciser le genre, le nombre",
  ),
  tlfi(
    'adjectif',
    'adjectif',
    'Partie du discours, variable en genre et en nombre, se rapportant dans la phrase au substantif',
  ),
  tlfi(
    'joint',
    'epithete',
    "Joint directement au substantif qu'il détermine, sans l'intermédiaire d'un verbe exprimé ou sous-entendu",
  ),
  tlfi(
    'pronom',
    'pronom',
    'Mot qui a la propriété de remplir dans une phrase les mêmes fonctions que le nom ou le syntagme nominal',
  ),
  tlfi('le', 'le', 'Le, la, les renvoient respectivement à un subst. masc., fém. ou plur.'),
  tlfi(
    'ils',
    'il',
    'Il(s) peut représenter des substantifs désignant des personnes de sexe masculin ou (au pluriel) féminin et masculin',
  ),
  tlfi('lui', 'lui', "lui/leur joue le rôle d'un régime indirect et est placé avant le verbe"),
];

export const faitGn = (id: string): Fait => {
  const x = FAITS_GN.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + articles du dictionnaire) des faits cités par une notion. */
export const sourcesGn = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitGn(id).source)]),
];

// Aucun prénom dans les phrases.

// ───────────────────────── Groupes nominaux ─────────────────────────

/** Un groupe nominal : déterminant, adjectif(s) avant le nom, nom noyau, adjectif(s) après. */
export interface Gn {
  readonly det: string;
  readonly avant?: string;
  readonly nom: string;
  readonly apres?: string;
}

export const texteGn = (g: Gn): string => [g.det, g.avant, g.nom, g.apres].filter(Boolean).join(' ');

/**
 * Une phrase : début, groupe nominal étudié, fin. C'est son seul groupe nominal, sauf si `autre` en signale un
 * second, sans adjectif, placé dans le début.
 */
export interface PhraseGn extends Gn {
  readonly debut: string;
  readonly fin: string;
  readonly autre?: { readonly det: string; readonly nom: string };
}

export const texteDe = (p: PhraseGn): string => {
  const s = [p.debut, texteGn(p), p.fin].filter(Boolean).join(' ');
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
};

const p = (debut: string, groupe: string, fin: string): PhraseGn => {
  const [det = '', avant = '', nom = '', apres = ''] = groupe.split('|');
  return { debut, det, nom, fin, ...(avant ? { avant } : {}), ...(apres ? { apres } : {}) };
};

/** Le groupe nominal est sujet ; la fin de la phrase ne contient que le verbe (et un adverbe). */
export const SUJETS_SIMPLES: readonly PhraseGn[] = [
  p('', 'le|petit|chien|', 'aboie'),
  p('', 'un|gros|nuage|', 'passe'),
  p('', 'la|vieille|horloge|', 'sonne'),
  p('', 'une|jolie|fleur|', 'pousse'),
  p('', 'ce|grand|oiseau|', 'chante'),
  p('', 'le||chat|noir', 'dort'),
  p('', 'un||vent|froid', 'souffle'),
  p('', 'la||balle|rouge', 'roule vite'),
  p('', 'une||porte|verte', 'grince'),
  p('', 'mon||pull|bleu', 'sèche'),
];

/** Le sujet est un pronom : le seul groupe nominal complète le verbe. */
export const OBJETS_SIMPLES: readonly PhraseGn[] = [
  p('nous regardons', 'un|grand|arbre|', ''),
  p('tu dessines', 'une|petite|maison|', ''),
  p('elle porte', 'un|gros|sac|', ''),
  p('ils visitent', 'un|vieux|château|', ''),
  p('je cueille', 'une|belle|pomme|', ''),
  p('vous lavez', 'la||voiture|bleue', ''),
  p('on suit', 'le||chemin|étroit', ''),
  p('il lit', 'un||livre|passionnant', ''),
  p('elles ferment', 'la||fenêtre|ronde', ''),
  p('nous mangeons', 'une||soupe|chaude', ''),
];

/** Pièges : le groupe a deux adjectifs, et parfois le sujet vient après le verbe. */
export const GROUPES_LONGS: readonly PhraseGn[] = [
  p('au loin brille', 'une|immense|étoile|bleue', ''),
  { ...p('dans le ciel passe', 'un|petit|avion|blanc', ''), autre: { det: 'le', nom: 'ciel' } },
  p('nous admirons', 'un|immense|navire|gris', ''),
  p('elle caresse', 'un|gros|lapin|gris', ''),
  p('tu ramasses', 'une|jolie|feuille|jaune', ''),
  { ...p('sous le lit dort', 'un|vieux|matou|roux', ''), autre: { det: 'le', nom: 'lit' } },
  p('ils réparent', 'la|vieille|barque|verte', ''),
  p('je choisis', 'une|petite|valise|noire', ''),
];

// ───────────────────────── Constructions ─────────────────────────

export type Construction = 'dn' | 'dan' | 'dna' | 'dana';

export const NOM_CONSTRUCTION: Record<Construction, string> = {
  dn: 'déterminant + nom',
  dan: 'déterminant + adjectif + nom',
  dna: 'déterminant + nom + adjectif',
  dana: 'déterminant + adjectif + nom + adjectif',
};

export const GROUPES_PAR_CONSTRUCTION: Record<Construction, readonly string[]> = {
  dn: ['un cahier', 'la porte', 'des cerises', 'mon vélo', 'cette rivière', 'les bottes'],
  dan: ['un petit cahier', 'la grande porte', 'deux belles cerises', 'mon vieux vélo', 'cette longue rivière'],
  dna: ['un cahier rouge', 'la porte étroite', 'des cerises mûres', 'mon vélo vert', 'cette rivière calme'],
  dana: ['un petit cahier rouge', 'la grande porte étroite', 'mon vieux vélo vert', 'cette longue rivière calme'],
};

/** Une phrase par ligne, un seul groupe nominal chacune, avec sa construction. */
export const LIGNES_CONSTRUCTIONS: readonly (readonly [string, Construction])[] = [
  ['Nous voyons un phare.', 'dn'],
  ['Le facteur arrive.', 'dn'],
  ['Tu ouvres la boîte.', 'dn'],
  ['Mes cousines dansent.', 'dn'],
  ['Elle trouve une jolie coquille.', 'dan'],
  ['Le petit renard court.', 'dan'],
  ['Ils poussent un gros rocher.', 'dan'],
  ['La grande roue tourne.', 'dan'],
  ['Je porte un manteau chaud.', 'dna'],
  ['Le ciel gris menace.', 'dna'],
  ['Vous lisez une histoire drôle.', 'dna'],
  ['Une barque verte flotte.', 'dna'],
];

// ───────────────────────── Épithète ─────────────────────────

/** Le même adjectif, épithète dans une phrase et séparé du nom par un verbe dans les autres. */
export interface Contraste {
  readonly adjectif: string;
  readonly nom: string;
  readonly epithete: string;
  readonly separes: readonly [string, string, string];
}

const contraste = (det: string, nom: string, adjectif: string, verbe: string): Contraste => ({
  adjectif,
  nom,
  epithete: `${det} ${nom} ${adjectif} ${verbe}.`,
  separes: [`${det} ${nom} est ${adjectif}.`, `${det} ${nom} semble ${adjectif}.`, `${det} ${nom} reste ${adjectif}.`],
});

export const CONTRASTES: readonly Contraste[] = [
  contraste('Le', 'chien', 'calme', 'dort'),
  contraste('La', 'porte', 'lourde', 'grince'),
  contraste('Le', 'ciel', 'gris', 'menace'),
  contraste('La', 'soupe', 'chaude', 'fume'),
  contraste('Le', 'chemin', 'étroit', 'monte'),
  contraste('La', 'lampe', 'neuve', 'brille'),
  contraste('Le', 'linge', 'humide', 'pend'),
  contraste('La', 'mer', 'froide', 'gronde'),
];

/** Une phrase avec un seul adjectif, épithète du nom indiqué. */
export interface Epithete {
  readonly texte: string;
  readonly nom: string;
  readonly adjectif: string;
  readonly verbe: string;
}

const ep = (texte: string, nom: string, adjectif: string, verbe: string): Epithete => ({
  texte,
  nom,
  adjectif,
  verbe,
});

export const EPITHETES: readonly Epithete[] = [
  ep('La petite souris trotte.', 'souris', 'petite', 'trotte'),
  ep('Un vent froid secoue les branches.', 'vent', 'froid', 'secoue'),
  ep('Le jardinier plante un jeune pommier.', 'pommier', 'jeune', 'plante'),
  ep('Une lumière douce éclaire la pièce.', 'lumière', 'douce', 'éclaire'),
  ep('Les enfants construisent une grande cabane.', 'cabane', 'grande', 'construisent'),
  ep('Un énorme camion bloque la rue.', 'camion', 'énorme', 'bloque'),
  ep('La chatte guette un oiseau imprudent.', 'oiseau', 'imprudent', 'guette'),
  ep('Des vagues géantes frappent le port.', 'vagues', 'géantes', 'frappent'),
  ep('Nous traversons une forêt sombre.', 'forêt', 'sombre', 'traversons'),
  ep('Le vieux pêcheur répare son filet.', 'pêcheur', 'vieux', 'répare'),
];

/**
 * Deux adjectifs : l'un est épithète du nom indiqué, l'autre est séparé de son propre nom (`nomSepare`) par un verbe.
 * `place` dit si l'épithète se trouve avant ou après le verbe.
 */
export interface EpithetePiege extends Epithete {
  readonly separe: string;
  readonly nomSepare: string;
  readonly place: 'avant' | 'apres';
}

/** Épithète avant le verbe : les deux adjectifs se rapportent au même nom. */
const piege = (texte: string, nom: string, adjectif: string, verbe: string, separe: string): EpithetePiege => ({
  ...ep(texte, nom, adjectif, verbe),
  separe,
  nomSepare: nom,
  place: 'avant',
});

/** Épithète après le verbe : l'autre adjectif, placé avant elle, se rapporte au sujet. */
const piegeApres = (
  texte: string,
  nom: string,
  adjectif: string,
  verbe: string,
  [separe, nomSepare]: readonly [string, string],
): EpithetePiege => ({ ...ep(texte, nom, adjectif, verbe), separe, nomSepare, place: 'apres' });

export const EPITHETES_PIEGES: readonly EpithetePiege[] = [
  piege('La vieille tour paraît solide.', 'tour', 'vieille', 'paraît', 'solide'),
  piege('Le chemin étroit semble long.', 'chemin', 'étroit', 'semble', 'long'),
  piege('Ce gros gâteau est délicieux.', 'gâteau', 'gros', 'est', 'délicieux'),
  piege('La mer calme devient grise.', 'mer', 'calme', 'devient', 'grise'),
  piege('Un petit chiot reste sage.', 'chiot', 'petit', 'reste', 'sage'),
  piege('La robe neuve est élégante.', 'robe', 'neuve', 'est', 'élégante'),
  piege('Le grand sapin paraît triste.', 'sapin', 'grand', 'paraît', 'triste'),
  piege('Une rivière profonde devient dangereuse.', 'rivière', 'profonde', 'devient', 'dangereuse'),
  piegeApres('Le chaton est ravi de sa balle rouge.', 'balle', 'rouge', 'est', ['ravi', 'chaton']),
  piegeApres('La rue devient calme après le dernier bus.', 'bus', 'dernier', 'devient', ['calme', 'rue']),
  piegeApres('Le jardin semble joli avec ce grand arbre.', 'arbre', 'grand', 'semble', ['joli', 'jardin']),
  piegeApres('La classe reste silencieuse devant le film passionnant.', 'film', 'passionnant', 'reste', [
    'silencieuse',
    'classe',
  ]),
  piegeApres('Le chien est content de son os énorme.', 'os', 'énorme', 'est', ['content', 'chien']),
  piegeApres('La salle paraît gaie grâce aux rideaux jaunes.', 'rideaux', 'jaunes', 'paraît', ['gaie', 'salle']),
  piegeApres('Le marin est fier de son nouveau bateau.', 'bateau', 'nouveau', 'est', ['fier', 'marin']),
  piegeApres('Le gâteau devient joli avec des fraises mûres.', 'fraises', 'mûres', 'devient', ['joli', 'gâteau']),
];

// ───────────────────────── Remplacer par un pronom ─────────────────────────

export type PronomSujet = 'il' | 'elle' | 'ils' | 'elles';
export const PRONOMS_SUJETS: readonly PronomSujet[] = ['il', 'elle', 'ils', 'elles'];

/** Phrase au groupe sujet, avec le verbe au nombre du sujet et à l'autre nombre. */
export interface SujetPronom {
  /** Début du groupe, sans le nom (« La petite »). */
  readonly debut: string;
  readonly nom: string;
  readonly suite: string;
  readonly autreNombre: string;
  readonly pronom: PronomSujet;
}

const sj = (debut: string, nom: string, suite: string, autreNombre: string, pronom: PronomSujet): SujetPronom => ({
  debut,
  nom,
  suite,
  autreNombre,
  pronom,
});

export const SUJETS_PRONOMS: readonly SujetPronom[] = [
  sj('La petite', 'fille', 'chante', 'chantent', 'elle'),
  sj('Le vieux', 'marin', 'raconte une histoire', 'racontent une histoire', 'il'),
  sj('Les jeunes', 'poulains', 'galopent', 'galope', 'ils'),
  sj('Les grandes', 'voiles', 'claquent', 'claque', 'elles'),
  sj('La grande', 'girafe', 'mange des feuilles', 'mangent des feuilles', 'elle'),
  sj('Ce gros', 'ours', 'cherche du miel', 'cherchent du miel', 'il'),
  sj('Mes nouvelles', 'chaussures', 'brillent', 'brille', 'elles'),
  sj('Les petits', 'canards', 'nagent', 'nage', 'ils'),
  sj('Une jolie', 'coccinelle', 'grimpe sur la tige', 'grimpent sur la tige', 'elle'),
  sj('Le joyeux', 'clown', 'salue le public', 'saluent le public', 'il'),
];

export const groupeSujet = (s: SujetPronom): string => `${s.debut} ${s.nom}`;

/** Deux noms réunis par « et » : un seul pronom au pluriel. */
export const SUJETS_DOUBLES: readonly {
  readonly groupe: string;
  readonly suite: string;
  readonly pronom: 'ils' | 'elles';
}[] = [
  { groupe: 'Le roi et la reine', suite: 'saluent la foule', pronom: 'ils' },
  { groupe: 'La boulangère et le boulanger', suite: 'pétrissent la pâte', pronom: 'ils' },
  { groupe: 'La tante et la nièce', suite: 'jardinent', pronom: 'elles' },
  { groupe: 'La mère et la fille', suite: 'chantent', pronom: 'elles' },
];

export type PronomObjetGn = 'le' | 'la' | 'les' | 'lui' | 'leur';
export const PRONOMS_OBJETS_GN: readonly PronomObjetGn[] = ['le', 'la', 'les', 'lui', 'leur'];

/** Phrase au groupe objet (direct, ou introduit par « à »). Les verbes commencent par une consonne. */
export interface ObjetPronom {
  readonly sujet: string;
  readonly verbe: string;
  readonly groupe: string;
  readonly pronom: PronomObjetGn;
}

const ob = (sujet: string, verbe: string, groupe: string, pronom: PronomObjetGn): ObjetPronom => ({
  sujet,
  verbe,
  groupe,
  pronom,
});

export const OBJETS_PRONOMS: readonly ObjetPronom[] = [
  ob('Je', 'regarde', 'la belle lune', 'la'),
  ob('Tu', 'ranges', 'le grand coffre', 'le'),
  ob('Nous', 'cueillons', 'les fraises mûres', 'les'),
  ob('Elle', 'répare', 'la vieille radio', 'la'),
  ob('Il', 'promène', 'le petit chien', 'le'),
  ob('Vous', 'lavez', 'les verres sales', 'les'),
  ob('Je', 'parle', 'à la nouvelle voisine', 'lui'),
  ob('Tu', 'souris', 'au petit garçon', 'lui'),
  ob('Nous', 'téléphonons', 'à nos grands cousins', 'leur'),
  ob('Elle', 'répond', 'aux jeunes élèves', 'leur'),
];

export const phraseAvecGroupe = (o: ObjetPronom): string => `${o.sujet} ${o.verbe} ${o.groupe}.`;
export const phraseAvecPronom = (o: ObjetPronom, pronom: string = o.pronom): string =>
  `${o.sujet} ${pronom} ${o.verbe}.`;

/** Deux lignes qui répètent un groupe objet : on réécrit la seconde avec deux pronoms. */
export interface Reprise {
  readonly sujet: string;
  readonly premier: string;
  readonly groupe: string;
  readonly reprise: string;
  readonly verbe: string;
  readonly pronomSujet: PronomSujet;
  readonly pronom: 'le' | 'la' | 'les';
}

export const REPRISES: readonly Reprise[] = [
  {
    sujet: 'Le jardinier',
    premier: 'cueille',
    groupe: 'une grosse pomme',
    reprise: 'la grosse pomme',
    verbe: 'lave',
    pronomSujet: 'il',
    pronom: 'la',
  },
  {
    sujet: 'La boulangère',
    premier: 'prépare',
    groupe: 'un gâteau doré',
    reprise: 'le gâteau doré',
    verbe: 'décore',
    pronomSujet: 'elle',
    pronom: 'le',
  },
  {
    sujet: 'Les maçons',
    premier: 'montent',
    groupe: 'un grand mur',
    reprise: 'le grand mur',
    verbe: 'peignent',
    pronomSujet: 'ils',
    pronom: 'le',
  },
  {
    sujet: 'Les couturières',
    premier: 'coupent',
    groupe: 'des tissus colorés',
    reprise: 'les tissus colorés',
    verbe: 'plient',
    pronomSujet: 'elles',
    pronom: 'les',
  },
  {
    sujet: 'La bergère',
    premier: 'compte',
    groupe: 'ses jeunes moutons',
    reprise: 'les jeunes moutons',
    verbe: 'rassemble',
    pronomSujet: 'elle',
    pronom: 'les',
  },
  {
    sujet: 'Le peintre',
    premier: 'dessine',
    groupe: 'une vieille barque',
    reprise: 'la vieille barque',
    verbe: 'colorie',
    pronomSujet: 'il',
    pronom: 'la',
  },
  {
    sujet: 'Les pompiers',
    premier: 'déroulent',
    groupe: 'un long tuyau',
    reprise: 'le long tuyau',
    verbe: 'branchent',
    pronomSujet: 'ils',
    pronom: 'le',
  },
  {
    sujet: 'La vétérinaire',
    premier: 'soigne',
    groupe: 'une petite chatte',
    reprise: 'la petite chatte',
    verbe: 'caresse',
    pronomSujet: 'elle',
    pronom: 'la',
  },
];
