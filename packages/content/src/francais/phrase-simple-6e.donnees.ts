/**
 * Données du chapitre « La phrase simple » (6e) : faits cités et banques de phrases écrites pour
 * l'exercice (aucun prénom). Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa
 * citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';
import { lowerFirst } from './outils.ts';
import { maj } from './phrase-simple.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

export const FAITS_PHRASE_SIMPLE_6E: readonly Fait[] = [
  prog(
    'constituants-programme',
    'Identifier tous les constituants syntaxiques de la phrase simple étudiés précédemment',
  ),
  prog('attribut-cod-programme', 'Opposer et distinguer attribut du sujet et complément d’objet direct (COD)'),
  prog(
    'construction-programme',
    'Utiliser les manipulations syntaxiques et étudier la construction du verbe au service de la reconnaissance des constituants',
  ),
  prog(
    'complements-programme',
    'l’enseignement de la grammaire conduit l’élève à repérer et identifier les compléments du verbe',
  ),
  prog(
    'circonstanciel-programme',
    'La distinction du complément circonstanciel (de lieu, de temps ou de cause) est étudiée à partir du CM2 pour aboutir à une maîtrise en fin de cycle 3.',
  ),
  prog('accord-attribut-programme', 'identifier et appliquer la chaîne d’accords sujet/verbe, sujet/attribut du sujet'),
  gram(
    'phrase-type',
    'La phrase type (P) est composée de deux ou trois éléments : un groupe sujet (GS), un groupe verbal (GV) et, facultativement, un groupe circonstanciel (GC)',
  ),
  gram('deux-groupes', 'Ces deux éléments sont obligatoires pour qu’on ait une phrase type'),
  gram('phrase-simple', 'On parle de « phrase simple » quand une phrase ne comporte qu’une seule proposition'),
  gram('gs-accord', 'Le groupe sujet (GS) règle l’accord du verbe'),
  gram('gs-pronom', 'peut être remplacé par il, elle ou cela'),
  gram(
    'cod',
    'Lorsque le complément d’objet n’est introduit par aucune préposition (Je vois les enfants), le complément est dit « complément d’objet direct » (COD)',
  ),
  gram(
    'coi',
    'Lorsque le complément d’objet est introduit par une préposition (Je parle à quelqu’un), le complément est dit « complément d’objet indirect » (COI)',
  ),
  gram(
    'pronom-objet',
    'Les éléments de fonction COD ou COI sont toujours l’équivalent syntaxique d’un GN et peuvent être remplacés par un pronom',
  ),
  gram('coi-pronom', 'Dans le cas où le COI est un pronom, la préposition n’apparaît pas toujours : Il lui parle'),
  gram('deux-complements', 'Un GV peut comporter un ou deux compléments'),
  gram('deux-coi', 'Le facteur parle de ses vacances à sa collègue.'),
  gram('aller', 'Le verbe aller implique une destination (par conséquent à Paris est un COI dans Elle va à Paris).'),
  gram('attribut', 'L’attribut du sujet est un constituant obligatoire du GV dont le noyau est un verbe attributif.'),
  gram('attribut-nature', 'La fonction attribut du sujet peut être assurée par un GN ou par un adjectif'),
  gram('attributifs-rester', 'D’autres verbes attributifs ajoutent des nuances aspectuelles'),
  gram('attributifs-sembler', 'sembler, paraître, avoir l’air'),
  gram(
    'etre-auxiliaire',
    'il connaît des emplois attributifs, mais peut aussi être employé dans d’autres emplois, par exemple comme auxiliaire dans la formation des temps composés du verbe',
  ),
  gram(
    'circ-sens',
    'lieu de l’événement, moment de l’événement, cause de l’événement, etc. C’est pour cette raison que le complément circonstanciel est toujours facultatif',
  ),
  gram('circ-deplacement', 'qu’il peut par ailleurs être déplacé dans la phrase'),
  gram(
    'circ-nature',
    'La fonction complément circonstanciel peut être assurée par des groupes prépositionnels (GP), par des groupes nominaux (GN), par des adverbes ou par des propositions subordonnées.',
  ),
  gram('transitif-direct', 'est dit « transitif direct »'),
  gram('transitif-indirect', 'et le verbe est dit « transitif indirect »'),
  gram('intransitif', 'Les verbes qui n’admettent ni COD ni COI sont appelés « verbes intransitifs »'),
  gram(
    'double-emploi',
    'un verbe peut être à la fois intransitif (Les toits blanchissent) et transitif (La neige blanchit les toits)',
  ),
  gram('mesure', 'le complément des verbes de mesure sera analysé comme un COD'),
];

export const faitPhraseSimple6e = (id: string): Fait => {
  const x = FAITS_PHRASE_SIMPLE_6E.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesPhraseSimple6e = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitPhraseSimple6e(id).source)]),
];

// ───────────────────────── 1. Les constituants ─────────────────────────

/** Phrase type au sujet développé : `noyau` est le début de sujet qu'un élève pourrait croire complet. */
export interface Constituee {
  readonly gs: string;
  readonly noyau: string;
  readonly verbe: string;
  readonly suite: string;
  readonly gc: string;
  /** Pronom personnel qui remplace tout le groupe sujet. */
  readonly pronom: 'il' | 'elle' | 'ils' | 'elles';
}

const c = (
  gs: string,
  noyau: string,
  [verbe, suite]: readonly [string, string],
  gc: string,
  pronom: Constituee['pronom'],
): Constituee => ({ gs, noyau, verbe, suite, gc, pronom });

export const CONSTITUEES: readonly Constituee[] = [
  c('Les élèves de sixième', 'Les élèves', ['préparent', 'un exposé'], 'depuis une semaine', 'ils'),
  c('La gardienne du musée', 'La gardienne', ['ferme', 'les grandes portes'], 'à la tombée du jour', 'elle'),
  c('Les ruches du verger voisin', 'Les ruches', ['abritent', 'des milliers d’abeilles'], 'au printemps', 'elles'),
  c('Le capitaine du vieux navire', 'Le capitaine', ['consulte', 'ses cartes'], 'avant le départ', 'il'),
  c('Les habitants de la vallée', 'Les habitants', ['surveillent', 'la rivière'], 'pendant les orages', 'ils'),
  c('La nouvelle voisine du troisième étage', 'La nouvelle voisine', ['arrose', 'ses plantes'], 'chaque soir', 'elle'),
  c('Les marins du port', 'Les marins', ['réparent', 'leurs filets'], 'sur le quai', 'ils'),
  c('Les pages de ce vieil album', 'Les pages', ['racontent', 'l’histoire du village'], 'avec précision', 'elles'),
  c(
    'Le conservateur de la bibliothèque',
    'Le conservateur',
    ['classe', 'les manuscrits anciens'],
    'dans la réserve',
    'il',
  ),
];

export const gvC = (p: Constituee): string => `${p.verbe} ${p.suite}`;
export const phraseFin = (p: Constituee): string => `${p.gs} ${gvC(p)} ${p.gc}.`;
export const phraseDebut = (p: Constituee): string => `${maj(p.gc)}, ${lowerFirst(p.gs)} ${gvC(p)}.`;

/** Sujet placé après le verbe, avec un complément de temps et un complément de lieu. */
export interface Inversee {
  readonly temps: string;
  readonly lieu: string;
  readonly verbe: string;
  readonly gs: string;
}

const inv = (temps: string, lieu: string, verbe: string, gs: string): Inversee => ({ temps, lieu, verbe, gs });

export const INVERSEES: readonly Inversee[] = [
  inv('au petit matin', 'sur la place du marché', 's’installent', 'les marchands ambulants'),
  inv('en fin d’après-midi', 'derrière la colline', 'disparaît', 'le soleil d’automne'),
  inv('chaque printemps', 'le long de la rivière', 'fleurissent', 'les arbres fruitiers'),
  inv('à la nuit tombée', 'au fond de la forêt', 'résonne', 'le cri d’une chouette'),
  inv('depuis des siècles', 'au sommet de la falaise', 'veille', 'un phare solitaire'),
  inv('après la pluie', 'dans les fossés', 'chantent', 'de nombreuses grenouilles'),
];

export const phraseInversee = (i: Inversee): string => `${maj(i.temps)}, ${i.lieu}, ${i.verbe} ${i.gs}.`;

// ───────────────────────── 2. Attribut du sujet ou COD ─────────────────────────

/** Le même groupe nominal, attribut après un verbe attributif, ou COD après un autre verbe. */
export interface Paire {
  readonly s: string;
  readonly attributif: string;
  readonly groupe: string;
  readonly action: string;
}

const paire = (s: string, attributif: string, groupe: string, action: string): Paire => ({
  s,
  attributif,
  groupe,
  action,
});

export const PAIRES: readonly Paire[] = [
  paire('La nouvelle directrice', 'devient', 'une alliée précieuse', 'rencontre'),
  paire('Mon voisin de palier', 'reste', 'un ami fidèle', 'invite'),
  paire('Cette jeune femme', 'est', 'une navigatrice expérimentée', 'interroge'),
  paire('Le frère du boulanger', 'devient', 'un artisan reconnu', 'félicite'),
  paire('La cousine de ma voisine', 'paraît', 'une personne discrète', 'accueille'),
  paire('Ce vieil homme', 'semble', 'un conteur passionnant', 'écoute'),
  paire('La capitaine de l’équipe', 'reste', 'une joueuse modeste', 'remercie'),
  paire('Le nouvel élève', 'est', 'un excellent dessinateur', 'observe'),
];

/** Attribut (adjectif ou groupe) après des verbes attributifs variés. */
export interface Attribut6e {
  readonly s: string;
  readonly verbe: string;
  readonly att: string;
  readonly circ: string;
}

const att = (s: string, verbe: string, a: string, circ: string): Attribut6e => ({ s, verbe, att: a, circ });

export const ATTRIBUTS_6E: readonly Attribut6e[] = [
  att('Les spectateurs', 'paraissent', 'très émus', 'après le final'),
  att('La rivière', 'semble', 'particulièrement calme', 'ce matin'),
  att('Ces explorateurs', 'restent', 'prudents', 'dans la grotte'),
  att('La vieille horloge', 'est', 'une pièce unique', 'dans ce musée'),
  att('Les rues du port', 'deviennent', 'désertes', 'en hiver'),
  att('Mon grand-père', 'a l’air', 'ravi de sa trouvaille', 'depuis midi'),
];

/** Phrase avec un COD développé. */
export interface Direct {
  readonly s: string;
  readonly verbe: string;
  readonly cod: string;
  readonly circ: string;
  /** Pronom personnel qui remplace le COD. */
  readonly pronom: 'le' | 'la' | 'les';
}

const dir = (s: string, verbe: string, cod: string, circ: string, pronom: Direct['pronom']): Direct => ({
  s,
  verbe,
  cod,
  circ,
  pronom,
});

export const DIRECTS: readonly Direct[] = [
  dir('Le guide', 'décrit', 'la façade du château', 'devant les visiteurs', 'la'),
  dir('Les archéologues', 'nettoient', 'les poteries anciennes', 'avec soin', 'les'),
  dir('La bibliothécaire', 'range', 'le dictionnaire illustré', 'après la fermeture', 'le'),
  dir('Mon oncle', 'répare', 'la barrière du jardin', 'ce dimanche', 'la'),
  dir('Les musiciens', 'accordent', 'leurs instruments', 'avant le concert', 'les'),
  dir('L’astronome', 'observe', 'le ciel d’été', 'depuis la colline', 'le'),
];

/** Phrases où « être » ou un autre verbe n'introduit ni attribut ni COD : le mot fait partie du verbe composé. */
export interface Composee {
  readonly phrase: string;
  readonly mot: string;
}

export const COMPOSEES: readonly Composee[] = [
  { phrase: 'Les voisins sont partis tôt.', mot: 'partis' },
  { phrase: 'La lettre est arrivée ce matin.', mot: 'arrivée' },
  { phrase: 'Les promeneurs sont revenus avant la nuit.', mot: 'revenus' },
  { phrase: 'Ma tante est montée au grenier.', mot: 'montée' },
];

/** Adjectif attribut à accorder (`…` dans le texte). */
export interface Accord6e {
  readonly texte: string;
  readonly sujet: string;
  readonly options: readonly [string, string, string, string];
  readonly correct: number;
}

const acc = (sujet: string, verbe: string, base: string, correct: number): Accord6e => ({
  texte: `${sujet} ${verbe} …….`,
  sujet,
  options: [base, `${base}e`, `${base}s`, `${base}es`],
  correct,
});

export const ACCORDS_6E: readonly Accord6e[] = [
  acc('Les fenêtres de la mairie', 'restent', 'ouvert', 3),
  acc('La plage du village', 'paraît', 'désert', 1),
  acc('Les sommets des montagnes', 'semblent', 'lointain', 2),
  acc('Les valises des voyageurs', 'sont', 'lourd', 3),
  acc('Les volets de la maison', 'restent', 'fermé', 2),
];

// ───────────────────────── 3. Le COI ─────────────────────────

/** Sujet, verbe, COI introduit par une préposition, complément circonstanciel. */
export interface Indirect {
  readonly s: string;
  readonly verbe: string;
  readonly prep: string;
  readonly nom: string;
  readonly circ: string;
}

const ind = (s: string, verbe: string, prep: string, nom: string, circ: string): Indirect => ({
  s,
  verbe,
  prep,
  nom,
  circ,
});

export const coiDe = (i: Indirect): string => `${i.prep} ${i.nom}`;

export const INDIRECTS: readonly Indirect[] = [
  ind('Le jeune apprenti', 'obéit', 'à', 'son maître d’atelier', 'sans discuter'),
  ind('Les habitants', 'se souviennent', 'de', 'la grande inondation', 'chaque printemps'),
  ind('La gardienne', 'téléphone', 'à', 'sa fille', 'le dimanche'),
  ind('Cette décision', 'déplaît', 'aux', 'riverains', 'depuis le début'),
  ind('Les marins', 'rêvent', 'de', 'la terre ferme', 'pendant la traversée'),
  ind('Le vieux conteur', 'parle', 'de', 'son enfance', 'au coin du feu'),
  ind('Le chiot', 'ressemble', 'à', 'sa mère', 'depuis sa naissance'),
];

/** COI exprimé par un pronom placé avant le verbe. */
export interface Pronominal {
  readonly phrase: string;
  readonly coi: string;
  readonly sujet: string;
  readonly verbe: string;
  /** Autre groupe de la phrase, qu'on pourrait prendre pour le COI. */
  readonly leurre: string;
}

const pro = (phrase: string, coi: string, sujet: string, verbe: string, leurre: string): Pronominal => ({
  phrase,
  coi,
  sujet,
  verbe,
  leurre,
});

export const PRONOMINAUX: readonly Pronominal[] = [
  pro('Ma voisine nous téléphone chaque soir.', 'nous', 'Ma voisine', 'téléphone', 'chaque soir'),
  pro('Cette musique me plaît beaucoup.', 'me', 'Cette musique', 'plaît', 'beaucoup'),
  pro('Le chien lui obéit sans hésiter.', 'lui', 'Le chien', 'obéit', 'sans hésiter'),
  pro('Les voyageurs leur écrivent depuis Lima.', 'leur', 'Les voyageurs', 'écrivent', 'depuis Lima'),
  pro('Ce tableau vous appartient désormais.', 'vous', 'Ce tableau', 'appartient', 'désormais'),
  pro('La guide te répondra dans un instant.', 'te', 'La guide', 'répondra', 'dans un instant'),
  pro('Le jardinier lui parle près de la serre.', 'lui', 'Le jardinier', 'parle', 'près de la serre'),
];

/** Verbe construit avec deux COI : l'un en « de », l'autre en « à ». */
export interface DeuxCoi {
  readonly s: string;
  readonly verbe: string;
  readonly de: string;
  readonly a: string;
  readonly circ: string;
  /** Pronom qui remplace le COI en « à ». */
  readonly pronom: 'lui' | 'leur';
}

const dc = (s: string, [de, a]: readonly [string, string], circ: string, pronom: DeuxCoi['pronom']): DeuxCoi => ({
  s,
  verbe: 'parle',
  de,
  a,
  circ,
  pronom,
});

export const DEUX_COI: readonly DeuxCoi[] = [
  dc('Le facteur', ['de ses vacances', 'à sa collègue'], 'pendant la tournée', 'lui'),
  dc('La conservatrice', ['de la nouvelle exposition', 'aux journalistes'], 'ce matin', 'leur'),
  dc('Mon grand-père', ['de son métier', 'à ses petits-enfants'], 'après le repas', 'leur'),
  dc('La capitaine', ['du prochain match', 'à son équipe'], 'dans le vestiaire', 'lui'),
  dc('Le maire', ['des travaux', 'aux commerçants'], 'pendant la réunion', 'leur'),
];

// ───────────────────────── 4. Les compléments circonstanciels ─────────────────────────

export type Sens = 'temps' | 'lieu' | 'cause';
export const SENS: readonly Sens[] = ['temps', 'lieu', 'cause'];
export type Nature = 'un groupe nominal' | 'un groupe prépositionnel' | 'un adverbe' | 'un groupe adjectival';
export const NATURES: readonly Nature[] = [
  'un groupe nominal',
  'un groupe prépositionnel',
  'un adverbe',
  'un groupe adjectival',
];

export interface Circonstanciel {
  /** Phrase sans le complément, commençant par une majuscule, sans point. */
  readonly reste: string;
  readonly cc: string;
  readonly sens: Sens;
  readonly nature: Nature;
}

const cc = (reste: string, groupe: string, sens: Sens, nature: Nature): Circonstanciel => ({
  reste,
  cc: groupe,
  sens,
  nature,
});

export const CIRCONSTANCIELS_6E: readonly Circonstanciel[] = [
  cc('Le facteur distribue le courrier', 'le matin', 'temps', 'un groupe nominal'),
  cc('La bibliothèque ouvre ses portes', 'chaque mercredi', 'temps', 'un groupe nominal'),
  cc('Les campeurs plantent leur tente', 'près du ruisseau', 'lieu', 'un groupe prépositionnel'),
  cc('Le match est reporté', 'à cause de l’orage', 'cause', 'un groupe prépositionnel'),
  cc('Les hirondelles reviennent', 'au printemps', 'temps', 'un groupe prépositionnel'),
  cc('Les ouvriers travaillent', 'aujourd’hui', 'temps', 'un adverbe'),
  cc('Les marchands vendent leurs fruits', 'ici', 'lieu', 'un adverbe'),
  cc('Les randonneurs font halte', 'sous les grands sapins', 'lieu', 'un groupe prépositionnel'),
  cc('Les musiciens répètent', 'la nuit', 'temps', 'un groupe nominal'),
];

export const phraseCcFin = (x: Circonstanciel): string => `${x.reste} ${x.cc}.`;
export const phraseCcDebut = (x: Circonstanciel): string => `${maj(x.cc)}, ${lowerFirst(x.reste)}.`;

/** Phrase avec un complément de temps, un de lieu et un de cause. */
export interface TroisCc {
  readonly action: string;
  readonly temps: string;
  readonly lieu: string;
  readonly cause: string;
}

const tri = (action: string, temps: string, lieu: string, cause: string): TroisCc => ({ action, temps, lieu, cause });

export const TROIS_CC: readonly TroisCc[] = [
  tri('les pêcheurs patientent', 'depuis trois jours', 'sur le quai', 'à cause de la tempête'),
  tri('les promeneurs pressent le pas', 'en fin de journée', 'dans le sous-bois', 'à cause du froid'),
  tri('le guide interrompt la visite', 'à midi', 'devant la chapelle', 'à cause de la chaleur'),
  tri('les trains circulent au ralenti', 'ce matin', 'dans la vallée', 'à cause du brouillard'),
  tri('les ouvriers arrêtent le chantier', 'ce lundi', 'au bord du canal', 'à cause des inondations'),
];

/** Groupe introduit ou non par une préposition, dont la fonction demande réflexion. */
export interface Ambigu {
  readonly phrase: string;
  readonly groupe: string;
  readonly fonction: 'complément circonstanciel' | 'COI' | 'COD';
  readonly raison: string;
}

const amb = (phrase: string, groupe: string, fonction: Ambigu['fonction'], raison: string): Ambigu => ({
  phrase,
  groupe,
  fonction,
  raison,
});

export const AMBIGUS: readonly Ambigu[] = [
  amb('Le car part à midi.', 'à midi', 'complément circonstanciel', 'il dit quand et se déplace en tête de phrase'),
  amb('La nuit, le veilleur surveille le port.', 'La nuit', 'complément circonstanciel', 'il dit quand et se supprime'),
  amb('Le veilleur redoute la nuit.', 'la nuit', 'COD', 'il complète « redoute » sans préposition'),
  amb('La randonneuse va à la gare.', 'à la gare', 'COI', 'le verbe « aller » demande une destination'),
  amb('Le chien obéit à son maître.', 'à son maître', 'COI', 'le verbe « obéir » se construit avec « à »'),
  amb('Le chien ronfle dans sa niche.', 'dans sa niche', 'complément circonstanciel', 'il dit où et se supprime'),
  amb('La fillette rêve de la mer.', 'de la mer', 'COI', 'le verbe « rêver » se construit avec « de »'),
  amb('Le soir, on ferme les volets.', 'les volets', 'COD', 'il complète « ferme » sans préposition'),
];

// ───────────────────────── 5. La construction du verbe ─────────────────────────

export type Construction = 'transitif direct' | 'transitif indirect' | 'intransitif' | 'attributif';
export const CONSTRUCTIONS: readonly Construction[] = [
  'transitif direct',
  'transitif indirect',
  'intransitif',
  'attributif',
];

export const EXPLICATION: Record<Construction, string> = {
  'transitif direct': 'le verbe a un complément d’objet sans préposition (COD)',
  'transitif indirect': 'le verbe a un complément d’objet introduit par une préposition (COI)',
  intransitif: 'le verbe n’a ni COD ni COI',
  attributif: 'le verbe relie le sujet à son attribut',
};

export interface Emploi {
  readonly phrase: string;
  readonly verbe: string;
  readonly construction: Construction;
  /** Complément d'objet ou attribut ; absent pour un emploi intransitif. */
  readonly complement?: string;
}

const em = (phrase: string, verbe: string, construction: Construction, complement?: string): Emploi => ({
  phrase,
  verbe,
  construction,
  ...(complement ? { complement } : {}),
});

export const EMPLOIS: readonly Emploi[] = [
  em('Les chevaux galopent dans la plaine.', 'galopent', 'intransitif'),
  em('Le soleil brille sur le port.', 'brille', 'intransitif'),
  em('Le vieux chien ronfle près du poêle.', 'ronfle', 'intransitif'),
  em('Les feuilles tremblent au moindre souffle.', 'tremblent', 'intransitif'),
  em('Le boulanger pétrit la pâte avant l’aube.', 'pétrit', 'transitif direct', 'la pâte'),
  em('Les archéologues photographient les mosaïques.', 'photographient', 'transitif direct', 'les mosaïques'),
  em('La gardienne ferme les grilles du parc.', 'ferme', 'transitif direct', 'les grilles du parc'),
  em('Le jeune apprenti obéit à son maître.', 'obéit', 'transitif indirect', 'à son maître'),
  em('Les marins rêvent de la terre ferme.', 'rêvent', 'transitif indirect', 'de la terre ferme'),
  em('Cette ruelle ressemble à un labyrinthe.', 'ressemble', 'transitif indirect', 'à un labyrinthe'),
  em('La mer reste calme malgré le vent.', 'reste', 'attributif', 'calme'),
  em('Ces coureurs paraissent épuisés.', 'paraissent', 'attributif', 'épuisés'),
  em('Le jeune arbre devient un géant.', 'devient', 'attributif', 'un géant'),
];

/** Préposition qui construit le verbe (une seule possible dans la phrase). */
export interface Regime {
  readonly avant: string;
  readonly apres: string;
  readonly prep: 'à' | 'de';
  readonly infinitif: string;
}

const reg = (avant: string, prep: Regime['prep'], apres: string, infinitif: string): Regime => ({
  avant,
  apres,
  prep,
  infinitif,
});

export const REGIMES: readonly Regime[] = [
  reg('Le chiot obéit', 'à', 'son maître.', 'obéir'),
  reg('Ce petit chat ressemble', 'à', 'sa mère.', 'ressembler'),
  reg('Ce vacarme nuit', 'à', 'la concentration.', 'nuire'),
  reg('Toute la classe participe', 'à', 'cette enquête.', 'participer'),
  reg('La récolte dépend', 'de', 'la météo.', 'dépendre'),
  reg('Mon grand-père se souvient', 'de', 'son premier voyage.', 'se souvenir'),
  reg('Les voyageurs se méfient', 'de', 'cette passerelle.', 'se méfier'),
  reg('L’enquêteur doute', 'de', 'ce témoignage.', 'douter'),
];

/** Un même verbe, avec deux constructions. */
export interface Double {
  readonly infinitif: string;
  readonly intransitif: string;
  readonly direct: string;
  readonly cod: string;
}

const dbl = (infinitif: string, intransitif: string, direct: string, cod: string): Double => ({
  infinitif,
  intransitif,
  direct,
  cod,
});

export const DOUBLES: readonly Double[] = [
  dbl('blanchir', 'Les toits blanchissent.', 'La neige blanchit les toits.', 'les toits'),
  dbl('sortir', 'Le chat sort.', 'Le voisin sort la poubelle.', 'la poubelle'),
  dbl('monter', 'Les prix montent.', 'Le porteur monte les valises.', 'les valises'),
  dbl('cuire', 'Le pain cuit.', 'Le boulanger cuit le pain.', 'le pain'),
  dbl('casser', 'La branche casse.', 'Le vent casse la branche.', 'la branche'),
  dbl('sonner', 'La cloche sonne.', 'Le gardien sonne la cloche.', 'la cloche'),
];

/** Cas moins attendus : verbe de mesure, destination, pronom complément. */
export const CAS_PARTICULIERS: readonly Emploi[] = [
  em('Ce sac pèse cinq kilos.', 'pèse', 'transitif direct', 'cinq kilos'),
  em('Cette table mesure deux mètres.', 'mesure', 'transitif direct', 'deux mètres'),
  em('La randonneuse va à la gare.', 'va', 'transitif indirect', 'à la gare'),
  em('La musique lui plaît.', 'plaît', 'transitif indirect', 'lui'),
  em('Les enfants la regardent.', 'regardent', 'transitif direct', 'la'),
  em('Sa réponse semble juste.', 'semble', 'attributif', 'juste'),
  em('Les toits blanchissent sous la neige.', 'blanchissent', 'intransitif'),
];
