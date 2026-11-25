/**
 * Données du chapitre « Phrase simple et phrase complexe » (CM2) : faits cités et banques de phrases écrites
 * pour l'exercice. Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

export const FAITS_PHRASE_COMPLEXE: readonly Fait[] = [
  prog('reperage', 'Distinguer phrase simple et phrase complexe à partir du repérage des verbes conjugués'),
  prog('temps-composes', 'Connaître la composition en deux parties (auxiliaire + participe passé) des temps composés'),
  prog(
    'subordination-programme',
    'Identifier et nommer les conjonctions de subordination (en lien avec l’introduction des phrases complexes)',
  ),
  prog('coordination-programme', 'Identifier et nommer les conjonctions de coordination'),
  gram(
    'modes-personnels',
    'Les modes personnels sont sensibles à l’expression de la personne et du nombre et parfois du genre.',
  ),
  gram('modes-non-personnels', 'Les modes non personnels sont l’infinitif et le participe.'),
  gram(
    'composes',
    'Les temps conjugués sans auxiliaire sont appelés les temps simples, les temps conjugués avec auxiliaire sont appelés les temps composés.',
  ),
  gram(
    'simple-complexe',
    'La phrase simple est formée d’une seule proposition tandis que la phrase complexe est formée de plusieurs propositions.',
  ),
  gram('sujet-une-fois', 'le groupe sujet n’est exprimé que dans la première proposition'),
  gram('coordination-mot', 'La conjonction de coordination est un mot invariable reliant entre eux des mots'),
  gram('coordination-liste', 'mais, ou, et, or, ni, car'),
  gram('subordination-mot', 'La conjonction de subordination est un mot invariable'),
  gram('subordination-temps', 'quand, lorsque, dès que, pendant que'),
  gram('subordination-cause', 'comme, parce que, puisque'),
  gram('subordination-hypothese', 'si, au cas où, à condition que'),
];

export const faitPhraseComplexe = (id: string): Fait => {
  const x = FAITS_PHRASE_COMPLEXE.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesPhraseComplexe = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitPhraseComplexe(id).source)]),
];

// Aucun prénom dans les phrases.

// ───────────────────────── Phrases à verbes repérés ─────────────────────────

export interface PhraseVerbes {
  readonly texte: string;
  /** Verbes conjugués dans l'ordre de la phrase ; un temps composé compte pour un seul verbe. */
  readonly verbes: readonly string[];
  /** Verbes à l'infinitif : ils ne se comptent pas. */
  readonly infinitifs: readonly string[];
  /** Un nom de la phrase. */
  readonly nom: string;
}

const pv = (texte: string, verbes: string, nom: string, infinitifs = ''): PhraseVerbes => ({
  texte,
  verbes: verbes.split('|'),
  infinitifs: infinitifs ? infinitifs.split('|') : [],
  nom,
});

/** Cas typiques : verbes à un temps simple, sans infinitif. Un, deux ou trois verbes. */
export const PHRASES_TYPIQUES: readonly PhraseVerbes[] = [
  pv('Le chat dort sur le lit.', 'dort', 'chat'),
  pv('Mon voisin arrose ses tomates.', 'arrose', 'voisin'),
  pv('Les enfants jouent dans la cour.', 'jouent', 'cour'),
  pv('La cloche sonne à midi.', 'sonne', 'cloche'),
  pv('Le chien aboie et le chat miaule.', 'aboie|miaule', 'chien'),
  pv('La pluie tombe quand nous sortons.', 'tombe|sortons', 'pluie'),
  pv('Tu mets la table et je coupe le pain.', 'mets|coupe', 'table'),
  pv('Le bébé rit parce que son frère chante.', 'rit|chante', 'frère'),
  pv('Le vent souffle, les volets claquent, la porte grince.', 'souffle|claquent|grince', 'volets'),
  pv('Je lis, tu dessines et ma sœur dort.', 'lis|dessines|dort', 'sœur'),
];

/** Phrases simples qui ont l'air longues : un seul verbe conjugué. */
export const SIMPLES_PIEGES: readonly PhraseVerbes[] = [
  pv('Le chien veut sortir dans le jardin.', 'veut', 'jardin', 'sortir'),
  pv('Nous allons préparer un gâteau aux pommes.', 'allons', 'gâteau', 'préparer'),
  pv('Mon cousin aime lire avant de dormir.', 'aime', 'cousin', 'lire|dormir'),
  pv('La fermière part chercher ses moutons.', 'part', 'fermière', 'chercher'),
  pv('Le jardinier a planté des radis.', 'a planté', 'radis'),
  pv('Les élèves ont terminé leur affiche.', 'ont terminé', 'affiche'),
  pv('Nous sommes partis très tôt ce matin.', 'sommes partis', 'matin'),
  pv('Le renard avait caché son repas.', 'avait caché', 'renard'),
  pv('Le chat et le chien dorment près du feu.', 'dorment', 'feu'),
  pv('Ma tante achète des poires et des noix.', 'achète', 'noix'),
];

/** Phrases complexes avec pièges : infinitif, temps composé ou sujet écrit une seule fois. */
export const COMPLEXES_PIEGES: readonly PhraseVerbes[] = [
  pv('Le gardien ferme la grille et rentre chez lui.', 'ferme|rentre', 'grille'),
  pv('La chatte saute, attrape la ficelle et s’enfuit.', 'saute|attrape|s’enfuit', 'ficelle'),
  pv('Nous avons rangé la classe quand la cloche a sonné.', 'avons rangé|a sonné', 'cloche'),
  pv('Mon frère veut jouer, mais il doit finir son travail.', 'veut|doit', 'travail', 'jouer|finir'),
  pv('Le facteur a posé le colis et il est reparti.', 'a posé|est reparti', 'colis'),
  pv('Je prends mon manteau parce que je vais sortir.', 'prends|vais', 'manteau', 'sortir'),
  pv(
    'Les randonneurs avaient marché longtemps, ils voulaient dormir.',
    'avaient marché|voulaient',
    'randonneurs',
    'dormir',
  ),
];

export const estComplexe = (p: PhraseVerbes): boolean => p.verbes.length > 1;
export const estCompose = (verbe: string): boolean => verbe.includes(' ');

// ───────────────────────── Réunir deux phrases simples ─────────────────────────

export interface Reunion {
  readonly a: string;
  readonly mot: string;
  /** Seconde phrase, sans majuscule ni point. */
  readonly b: string;
}

const re = (a: string, mot: string, b: string): Reunion => ({ a, mot, b });

export const REUNIONS: readonly Reunion[] = [
  re('Le chien aboie', 'et', 'le chat se cache'),
  re('Le soleil brille', 'mais', 'le vent reste froid'),
  re('Je prends un pull', 'car', 'le temps se gâte'),
  re('Nous restons dedans', 'parce que', 'la neige tombe'),
  re('Tu mets la table', 'pendant que', 'la soupe chauffe'),
  re('Les élèves se lèvent', 'quand', 'la cloche sonne'),
  re('Ma sœur dessine', 'et', 'mon frère lit'),
  re('Le jardinier rentre', 'lorsque', 'la nuit tombe'),
];

export const texteReunion = (r: Reunion): string => `${r.a} ${r.mot} ${r.b}.`;

// ───────────────────────── Mots qui relient ─────────────────────────

export type Classe = 'conjonction de coordination' | 'conjonction de subordination';
export const CLASSES: readonly Classe[] = ['conjonction de coordination', 'conjonction de subordination'];

export const COORDINATION = ['mais', 'ou', 'et', 'or', 'ni', 'car'] as const;

export interface Lien {
  readonly texte: string;
  /** Le seul mot qui relie les deux verbes conjugués, en minuscules. */
  readonly mot: string;
  readonly classe: Classe;
  /** Trois autres mots de la phrase : verbe conjugué, nom, déterminant. */
  readonly verbe: string;
  readonly nom: string;
  readonly det: string;
}

const lien =
  (classe: Classe) =>
  (texte: string, mot: string, autres: string): Lien => {
    const [verbe = '', nom = '', det = ''] = autres.split('|');
    return { texte, mot, classe, verbe, nom, det };
  };
const co = lien('conjonction de coordination');
const su = lien('conjonction de subordination');

/** Le mot qui relie est au milieu de la phrase. */
export const LIENS_MILIEU: readonly Lien[] = [
  co('Le chien aboie et le chat miaule.', 'et', 'aboie|chien|le'),
  co('La lune brille, mais la rue reste sombre.', 'mais', 'brille|lune|la'),
  co('Tu ranges ta chambre ou tu laves la vaisselle.', 'ou', 'ranges|chambre|ta'),
  co('Je mets des bottes, car le chemin est boueux.', 'car', 'mets|chemin|des'),
  su('Les oiseaux chantent quand le jour se lève.', 'quand', 'chantent|jour|les'),
  su('Je ferme la fenêtre parce que le vent souffle.', 'parce que', 'ferme|vent|la'),
  su('Nous irons au parc si la pluie cesse.', 'si', 'irons|parc|la'),
  su('Mon voisin siffle lorsque son chien revient.', 'lorsque', 'siffle|voisin|son'),
  su('Tu peux sortir puisque ton travail est fini.', 'puisque', 'peux|travail|ton'),
  su('Le public applaudit dès que le rideau tombe.', 'dès que', 'applaudit|rideau|le'),
];

/** Piège : la conjonction de subordination ouvre la phrase. */
export const LIENS_DEBUT: readonly Lien[] = [
  su('Quand la cloche sonne, les élèves sortent.', 'quand', 'sonne|cloche|les'),
  su('Si la neige tombe, nous ferons un bonhomme.', 'si', 'tombe|neige|un'),
  su('Parce que le sol glisse, je marche lentement.', 'parce que', 'glisse|sol|le'),
  su('Lorsque le four sonne, mon père sort la tarte.', 'lorsque', 'sonne|four|mon'),
  su('Puisque la nuit arrive, nous allumons une lampe.', 'puisque', 'arrive|nuit|une'),
  su('Dès que le feu passe au vert, la voiture démarre.', 'dès que', 'passe|feu|la'),
];

/** Piège : un premier « et » ou « ou » relie seulement deux noms. */
export const LIENS_INTRUS: readonly Lien[] = [
  su('Le chat et le chien dorment quand il pleut.', 'quand', 'dorment|chien|le'),
  su('Je prends une pomme ou une poire si j’ai faim.', 'si', 'prends|poire|une'),
  su('Mon père et ma mère sourient lorsque je chante.', 'lorsque', 'sourient|mère|mon'),
  su('Les poules et les canards accourent dès que je siffle.', 'dès que', 'accourent|canards|les'),
  co('Le coq et la poule picorent, mais le chat dort.', 'mais', 'picorent|poule|la'),
  co('Tu prends un sac ou un panier, car nous partons.', 'car', 'prends|panier|un'),
  co('Le matin et le soir, tu lis ou tu dessines.', 'ou', 'lis|soir|le'),
];
