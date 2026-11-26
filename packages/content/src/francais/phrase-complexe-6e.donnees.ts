/**
 * Données du chapitre « La phrase complexe » (6e) : faits cités et banques de phrases écrites pour l'exercice.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte. Aucun prénom.
 */
import type { Fait } from './phrases.donnees.ts';
import { maj } from './phrase-simple.donnees.ts';
import { lowerFirst } from './outils.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

export const FAITS_PHRASE_COMPLEXE_6E: readonly Fait[] = [
  prog('notion-programme', 'Comprendre la notion de proposition'),
  prog('reperage-programme', 'Distinguer phrase simple et phrase complexe à partir du repérage des propositions'),
  prog(
    'articulation-programme',
    'Repérer les différents modes d’articulation des propositions au sein de la phrase complexe',
  ),
  prog('approfondir-programme', 'Approfondir les notions de juxtaposition, de coordination, de subordination'),
  prog(
    'roles-programme',
    'Distinguer le rôle de la conjonction de coordination et celui de la conjonction de subordination',
  ),
  gram(
    'proposition',
    'Une proposition est toujours formée d’un groupe sujet et d’un groupe verbal (voire également d’un complément circonstanciel)',
  ),
  gram(
    'proposition-ponctuation',
    'si la proposition est en début de phrase, elle ne se termine pas par un point et si elle n’est pas en début de phrase, elle ne commence pas par une majuscule',
  ),
  gram(
    'sujet-ellipse',
    'très souvent, lorsqu’il est le même dans plusieurs propositions juxtaposées ou coordonnées, le groupe sujet n’est exprimé que dans la première proposition',
  ),
  gram(
    'simple-complexe',
    'La phrase simple est formée d’une seule proposition tandis que la phrase complexe est formée de plusieurs propositions.',
  ),
  gram(
    'deux-types',
    'la phrase complexe par subordination, dans laquelle une proposition subordonnée est incluse dans la proposition principale',
  ),
  gram('independantes', 'Ces deux propositions situées sur le même plan sont nommées « propositions indépendantes ».'),
  gram(
    'juxtaposition',
    'Le terme « juxtaposition » est utilisé lorsque les propositions indépendantes ne sont pas reliées par une conjonction de coordination, mais par une virgule, un point-virgule ou par les deux points (:).',
  ),
  gram(
    'plus-de-deux',
    'Les relations de coordination et de juxtaposition peuvent s’établir entre plus de deux propositions.',
  ),
  gram(
    'coordination-mot',
    'La conjonction de coordination est un mot invariable reliant entre eux des mots (Pierre et Marie), des groupes de mots (la directrice de l’entreprise et la responsable du recrutement) et des propositions (Elle ne sait pas lire mais elle regarde les images) de même fonction et souvent de même nature',
  ),
  gram('coordination-liste', 'mais, ou, et, or, ni, car'),
  gram('donc', 'le mot donc n’est pas une conjonction de coordination, mais fonctionne comme un adverbe'),
  gram(
    'subordonnee',
    'Une proposition subordonnée se définit comme une proposition incluse dans une autre proposition, dite « principale » et dépendant de celle-ci',
  ),
  gram(
    'subordination-mot',
    'La conjonction de subordination est un mot invariable qui permet à une proposition subordonnée d’être incluse dans la proposition dite « principale »',
  ),
  gram('subordination-temps', 'quand, lorsque, dès que, pendant que'),
  gram('subordination-cause', 'parce que, puisque'),
  gram('subordination-hypothese', 'l’hypothèse (si, etc.)'),
  gram(
    'subordination-que',
    'La proposition subordonnée conjonctive est introduite par la conjonction de subordination que.',
  ),
];

export const faitPhraseComplexe6e = (id: string): Fait => {
  const x = FAITS_PHRASE_COMPLEXE_6E.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesPhraseComplexe6e = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitPhraseComplexe6e(id).source)]),
];

export const COORDINATION_6E = ['mais', 'ou', 'et', 'or', 'ni', 'car'] as const;
export const SUBORDINATION_6E = [
  'quand',
  'lorsque',
  'dès que',
  'pendant que',
  'parce que',
  'puisque',
  'si',
  'que',
] as const;

// ───────────────────────── Propositions ─────────────────────────

export interface Prop {
  /** Groupe sujet, en minuscules sauf début de phrase (voir `texte`). */
  readonly s: string;
  /** Verbe conjugué (un temps composé reste entier). */
  readonly v: string;
  /** Reste du groupe verbal et compléments. */
  readonly r: string;
}

const p = (s: string, v: string, r = ''): Prop => ({ s, v, r });
export const propTexte = (x: Prop): string => (x.r ? `${x.s} ${x.v} ${x.r}` : `${x.s} ${x.v}`);

/** Propositions isolées, à sujets et verbes tous différents. */
export const PROPOSITIONS: readonly Prop[] = [
  p('le gardien', 'ferme', 'la grille'),
  p('la marée', 'monte', 'vite'),
  p('nos voisins', 'réparent', 'leur toiture'),
  p('le conteur', 'baisse', 'la voix'),
  p('les hirondelles', 'reviennent', 'au printemps'),
  p('ma cousine', 'collectionne', 'les timbres'),
  p('le volcan', 'gronde', 'sous la neige'),
  p('les marins', 'hissent', 'la voile'),
  p('un chevreuil', 'traverse', 'la clairière'),
  p('la bibliothécaire', 'range', 'les romans'),
  p('les randonneurs', 'consultent', 'la carte'),
  p('le boulanger', 'pétrit', 'la pâte'),
];

/** Groupes de mots sans verbe conjugué : ce ne sont pas des propositions. */
export const GROUPES_SANS_VERBE: readonly string[] = [
  'la grille du parc',
  'depuis ce matin',
  'un vieux phare isolé',
  'dans la clairière',
  'pour réparer la toiture',
  'les voiles blanches des bateaux',
  'avec une grande patience',
  'au sommet du volcan',
  'le roman de la bibliothèque',
  'avant la tombée de la nuit',
];

/** Phrases à sujet exprimé une seule fois : chaque verbe forme une proposition. */
export interface Ellipse {
  readonly texte: string;
  readonly sujet: string;
  readonly verbes: readonly string[];
}
const el = (texte: string, sujet: string, verbes: string): Ellipse => ({ texte, sujet, verbes: verbes.split('|') });

export const ELLIPSES: readonly Ellipse[] = [
  el('Le facteur arrive, ouvre la boîte et repart.', 'Le facteur', 'arrive|ouvre|repart'),
  el('La chouette observe le champ, puis plonge.', 'La chouette', 'observe|plonge'),
  el('Le cuisinier coupe les poireaux, les rince et les égoutte.', 'Le cuisinier', 'coupe|rince|égoutte'),
  el('Les marins hissent la voile et quittent le port.', 'Les marins', 'hissent|quittent'),
  el('Ma sœur prend son sac, salue le chien et part.', 'Ma sœur', 'prend|salue|part'),
  el('Le renard flaire la piste mais perd la trace.', 'Le renard', 'flaire|perd'),
  el('Nous rangeons la salle, éteignons les lampes et sortons.', 'Nous', 'rangeons|éteignons|sortons'),
  el('Le vieux pêcheur répare ses filets ou nettoie sa barque.', 'Le vieux pêcheur', 'répare|nettoie'),
];

// ───────────────────────── Phrases simples ─────────────────────────

export interface Simple {
  readonly texte: string;
  readonly verbe: string;
}
const si = (texte: string, verbe: string): Simple => ({ texte, verbe });

/** Une seule proposition : groupes longs, noms coordonnés, temps composés et infinitifs piègent. */
export const SIMPLES: readonly Simple[] = [
  si('Le gardien ferme la grille du parc.', 'ferme'),
  si('Les marins et les pêcheurs observent le ciel.', 'observent'),
  si('Depuis le début des vacances, ma cousine collectionne les timbres anciens.', 'collectionne'),
  si('Les randonneurs veulent atteindre le refuge avant la nuit.', 'veulent'),
  si('Le boulanger a préparé trois grandes tartes aux prunes.', 'a préparé'),
  si('Au fond de la clairière, un chevreuil broute des jeunes pousses.', 'broute'),
  si('La bibliothécaire range les romans, les albums et les revues.', 'range'),
  si('Nous allons visiter le château et son vieux donjon.', 'allons'),
  si('Le conteur parle d’une voix grave et lente.', 'parle'),
  si('Les hirondelles sont revenues sous le toit de la grange.', 'sont revenues'),
  si('Chaque soir, le chat gris du voisin traverse notre jardin.', 'traverse'),
  si('Le phare isolé éclaire la côte pendant toute la nuit.', 'éclaire'),
];

// ───────────────────────── Phrases complexes ─────────────────────────

export type Signe = ',' | ';' | ':';
export const NOM_SIGNE: Record<Signe, string> = { ',': 'une virgule', ';': 'un point-virgule', ':': 'les deux points' };

export interface Juxta {
  readonly a: Prop;
  readonly b: Prop;
  readonly signe: Signe;
}
const jx = (a: Prop, signe: Signe, b: Prop): Juxta => ({ a, signe, b });

export const texteJuxta = (j: Juxta): string =>
  `${maj(propTexte(j.a))}${j.signe === ',' ? ',' : ` ${j.signe}`} ${propTexte(j.b)}.`;

export const JUXTAPOSEES: readonly Juxta[] = [
  jx(p('le vent', 'se lève'), ',', p('les volets', 'claquent')),
  jx(p('le professeur', 'entre'), ';', p('la classe', 'se tait')),
  jx(p('nous', 'restons', 'à la maison'), ':', p('la neige', 'bloque', 'la route')),
  jx(p('la cloche', 'sonne'), ',', p('les élèves', 'sortent')),
  jx(p('le jardinier', 'taille', 'la haie'), ';', p('son voisin', 'arrose', 'les fleurs')),
  jx(p('je', 'prends', 'un manteau'), ':', p('le froid', 'pique', 'les joues')),
  jx(p('la marée', 'monte'), ',', p('les pêcheurs', 'rentrent')),
  jx(p('le soleil', 'brille'), ';', p('la neige', 'fond')),
  jx(p('le public', 'se lève'), ':', p('le spectacle', 'commence')),
  jx(p('ma tante', 'chante'), ',', p('mon oncle', 'joue', 'du piano')),
  jx(p('les lampes', 's’allument'), ';', p('la ville', 'se réveille')),
  jx(p('le chien', 'aboie'), ':', p('un inconnu', 'approche')),
];

export interface Coord {
  readonly a: Prop;
  readonly mot: 'et' | 'mais' | 'car' | 'ou' | 'or';
  readonly b: Prop;
}
const co = (a: Prop, mot: Coord['mot'], b: Prop): Coord => ({ a, mot, b });

/** « mais », « car » et « or » sont précédés d'une virgule dans ces phrases. */
const virguleAvant = (mot: Coord['mot']) => mot === 'mais' || mot === 'car' || mot === 'or';
export const texteCoord = (c: Coord): string =>
  `${maj(propTexte(c.a))}${virguleAvant(c.mot) ? ',' : ''} ${c.mot} ${propTexte(c.b)}.`;

export const COORDONNEES: readonly Coord[] = [
  co(p('le chien', 'aboie'), 'et', p('le chat', 'se cache')),
  co(p('la lune', 'brille'), 'mais', p('la rue', 'reste', 'sombre')),
  co(p('je', 'mets', 'des bottes'), 'car', p('le chemin', 'est', 'boueux')),
  co(p('tu', 'ranges', 'ta chambre'), 'ou', p('tu', 'laves', 'la vaisselle')),
  co(p('les marins', 'hissent', 'la voile'), 'et', p('le bateau', 'quitte', 'le port')),
  co(p('le ciel', 'se couvre'), 'mais', p('la pluie', 'tarde')),
  co(p('nous', 'restons', 'au chaud'), 'car', p('le vent', 'souffle', 'fort')),
  co(p('le renard', 'attend'), 'et', p('la poule', 'picore')),
  co(p('vous', 'prenez', 'le bus'), 'ou', p('vous', 'marchez', 'jusqu’au stade')),
  co(p('le musée', 'devait', 'ouvrir'), 'or', p('la porte', 'reste', 'close')),
  co(p('mon frère', 'dessine'), 'et', p('ma sœur', 'lit')),
  co(p('la route', 'est', 'longue'), 'mais', p('le paysage', 'est', 'superbe')),
];

/** Phrases à deux conjonctions : l'une relie deux noms, l'autre deux propositions. */
export interface Double {
  readonly texte: string;
  /** Conjonction reliant deux noms. */
  readonly noms: 'et' | 'ou';
  /** Conjonction reliant les deux propositions. */
  readonly props: 'mais' | 'car' | 'et' | 'ou';
  /** La conjonction entre les noms vient en premier dans la phrase. */
  readonly nomsDabord: boolean;
  /** Verbe de la seconde proposition. */
  readonly verbe2: string;
}
const db = (texte: string, conjonctions: string, verbe2: string, nomsDabord = true): Double => {
  const [noms, props] = conjonctions.split('|') as [Double['noms'], Double['props']];
  return { texte, noms, props, nomsDabord, verbe2 };
};

export const DOUBLES: readonly Double[] = [
  db('Le chien et le chat dorment, mais le perroquet crie.', 'et|mais', 'crie'),
  db('Tu prends un pull ou une veste, car le vent fraîchit.', 'ou|car', 'fraîchit'),
  db('Mon oncle et ma tante arrivent, mais le repas refroidit.', 'et|mais', 'refroidit'),
  db('Le renard ou la fouine rôde, car les poules s’agitent.', 'ou|car', 's’agitent'),
  db('Les poires et les pommes mûrissent, mais les prunes manquent.', 'et|mais', 'manquent'),
  db('La brume et la pluie arrivent, car le temps change.', 'et|car', 'change'),
  db('La pluie tombe, mais le chien et le chat restent dehors.', 'et|mais', 'restent', false),
  db('Je porte les sacs, car mon père et ma mère déchargent la voiture.', 'et|car', 'déchargent', false),
  db('Le gardien patiente, mais les parents ou les voisins tardent.', 'ou|mais', 'tardent', false),
  db('La classe se tait, car le directeur et la gardienne entrent.', 'et|car', 'entrent', false),
];

export interface Subord {
  readonly principale: Prop;
  readonly mot: (typeof SUBORDINATION_6E)[number];
  readonly sub: Prop;
  /** La subordonnée ouvre la phrase. */
  readonly debut: boolean;
}
const su = (principale: Prop, mot: Subord['mot'], sub: Prop, debut = false): Subord => ({
  principale,
  mot,
  sub,
  debut,
});

export const subTexte = (x: Subord): string => `${x.mot} ${propTexte(x.sub)}`;
export const principaleTexte = (x: Subord): string => propTexte(x.principale);
export const texteSubord = (x: Subord): string =>
  x.debut ? `${maj(subTexte(x))}, ${lowerFirst(principaleTexte(x))}.` : `${maj(principaleTexte(x))} ${subTexte(x)}.`;

/** Subordonnée après la principale. */
export const SUB_FIN: readonly Subord[] = [
  su(p('les oiseaux', 'chantent'), 'quand', p('le jour', 'se lève')),
  su(p('je', 'ferme', 'la fenêtre'), 'parce que', p('le vent', 'souffle')),
  su(p('nous', 'irons', 'au parc'), 'si', p('la pluie', 'cesse')),
  su(p('mon voisin', 'siffle'), 'lorsque', p('son chien', 'revient')),
  su(p('tu', 'peux', 'sortir'), 'puisque', p('ton travail', 'est', 'fini')),
  su(p('le public', 'applaudit'), 'dès que', p('le rideau', 'tombe')),
  su(p('la soupe', 'chauffe'), 'pendant que', p('tu', 'mets', 'la table')),
  su(p('le guide', 'pense'), 'que', p('le sentier', 'est', 'fermé')),
  su(p('les élèves', 'savent'), 'que', p('la visite', 'commence', 'tôt')),
  su(p('la chouette', 'se réveille'), 'quand', p('la nuit', 'tombe')),
];

/** Subordonnée en tête de phrase : la virgule qui la suit n'indique pas une juxtaposition. */
export const SUB_DEBUT: readonly Subord[] = [
  su(p('les élèves', 'sortent'), 'quand', p('la cloche', 'sonne'), true),
  su(p('nous', 'ferons', 'un bonhomme'), 'si', p('la neige', 'tombe'), true),
  su(p('je', 'marche', 'lentement'), 'parce que', p('le sol', 'glisse'), true),
  su(p('mon père', 'sort', 'la tarte'), 'lorsque', p('le four', 'sonne'), true),
  su(p('nous', 'allumons', 'une lampe'), 'puisque', p('la nuit', 'arrive'), true),
  su(p('la voiture', 'démarre'), 'dès que', p('le feu', 'passe', 'au vert'), true),
  su(p('le chat', 'surveille', 'le bocal'), 'pendant que', p('le poisson', 'nage'), true),
  su(p('le jardinier', 'couvre', 'les semis'), 'quand', p('le gel', 'menace'), true),
];

/** Phrases avec une subordonnée et deux propositions coordonnées : une conjonction de chaque sorte. */
export interface Mixte {
  readonly texte: string;
  readonly subordination: (typeof SUBORDINATION_6E)[number];
  readonly coordination: (typeof COORDINATION_6E)[number];
}
const mx = (texte: string, subordination: Mixte['subordination'], coordination: Mixte['coordination']): Mixte => ({
  texte,
  subordination,
  coordination,
});

export const MIXTES: readonly Mixte[] = [
  mx('Quand il pleut, je lis ou je dessine.', 'quand', 'ou'),
  mx('La classe sort, mais le gardien attend que la pluie cesse.', 'que', 'mais'),
  mx('Je prends un parapluie, car je sais que le ciel changera.', 'que', 'car'),
  mx('Si le vent faiblit, nous sortons le bateau et nous pêchons.', 'si', 'et'),
  mx('Le chien jappe lorsque la porte grince, mais le chat dort.', 'lorsque', 'mais'),
  mx('Dès que le soleil paraît, la neige fond et le chemin brille.', 'dès que', 'et'),
  mx('Tu restes ici parce que la nuit tombe, ou tu prends une lampe.', 'parce que', 'ou'),
  mx('Puisque le musée est fermé, nous marchons et nous discutons.', 'puisque', 'et'),
];

/** Mots à classer : conjonctions des deux sortes et « donc », qui est un adverbe. */
export type Classe6e = 'conjonction de coordination' | 'conjonction de subordination' | 'adverbe';
export const classeDe = (mot: string): Classe6e =>
  mot === 'donc'
    ? 'adverbe'
    : (COORDINATION_6E as readonly string[]).includes(mot)
      ? 'conjonction de coordination'
      : 'conjonction de subordination';
