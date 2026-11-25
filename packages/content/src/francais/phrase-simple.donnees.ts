/**
 * Données du chapitre « Analyser la phrase simple » (CM2) : faits cités et banques de phrases écrites pour
 * l'exercice (aucun prénom). Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa
 * citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';
import { lowerFirst } from './outils.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);
const inversion = fait('cnrtl-inversion');

export const FAITS_PHRASE_SIMPLE: readonly Fait[] = [
  prog('groupes-programme', 'Consolider l’identification du groupe sujet, groupe verbal, groupe circonstanciel'),
  prog('sujets-programme', 'Consolider l’identification des différents types de sujets rencontrés au CM1'),
  prog(
    'sujets-types',
    'Identifier les différents types de sujets (pronoms personnels, groupes nominaux, plusieurs noms)',
  ),
  prog('inverse-programme', 'Identifier le sujet inversé dans des cas simples'),
  prog('cod-coi-programme', 'Différencier complément d’objet direct et complément d’objet indirect'),
  prog('attribut-programme', 'Différencier attribut du sujet et complément d’objet'),
  prog('circonstanciels-programme', 'Différencier les compléments circonstanciels de temps, de lieu, de cause'),
  gram('deux-groupes', 'Ces deux éléments sont obligatoires pour qu’on ait une phrase type'),
  gram(
    'gc',
    'La phrase peut également comporter un élément apportant des informations complémentaires, non obligatoires : le groupe circonstanciel (GC).',
  ),
  gram('gv', 'Le groupe verbal (GV) se compose d’un verbe et d’un ou plusieurs constituants'),
  gram('gs-accord', 'Le groupe sujet (GS) règle l’accord du verbe'),
  gram('gs-pronom', 'il peut être constitué d’un pronom personnel'),
  gram('inversion-exemple', 'Inversion du sujet simple : Vas-tu à la plage ?'),
  inversion('ordre', 'Renversement d’un ordre considéré comme normal ou habituel, soit pour des mots isolés'),
  inversion('inversion-sujet', 'inversion du sujet'),
  gram(
    'cod',
    'Lorsque le complément d’objet n’est introduit par aucune préposition (Je vois les enfants), le complément est dit « complément d’objet direct » (COD)',
  ),
  gram(
    'coi',
    'Lorsque le complément d’objet est introduit par une préposition (Je parle à quelqu’un), le complément est dit « complément d’objet indirect » (COI)',
  ),
  gram('deux-complements', 'Un GV peut comporter un ou deux compléments'),
  gram('attribut', 'L’attribut du sujet est un constituant obligatoire du GV dont le noyau est un verbe attributif.'),
  gram('attribut-nature', 'La fonction attribut du sujet peut être assurée par un GN ou par un adjectif'),
  gram('attributifs-rester', 'D’autres verbes attributifs ajoutent des nuances aspectuelles'),
  gram('attributifs-sembler', 'sembler, paraître, avoir l’air'),
  gram(
    'circ-sens',
    'lieu de l’événement, moment de l’événement, cause de l’événement, etc. C’est pour cette raison que le complément circonstanciel est toujours facultatif',
  ),
  gram(
    'circ-nature',
    'La fonction complément circonstanciel peut être assurée par des groupes nominaux prépositionnels (GNP), par des groupes nominaux (GN), par des adverbes ou par des propositions subordonnées.',
  ),
  gram('circ-cause', 'à cause des conditions météorologiques'),
];

export const faitPhraseSimple = (id: string): Fait => {
  const x = FAITS_PHRASE_SIMPLE.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités par une notion. */
export const sourcesPhraseSimple = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitPhraseSimple(id).source)]),
];

export const maj = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ───────────────────────── 1. Les trois groupes ─────────────────────────

/** Phrase en trois groupes. `court` : le sujet incomplet qu'un élève pourrait écrire. */
export interface Phrase {
  readonly gs: string;
  readonly verbe: string;
  /** Ce qui suit le verbe dans le groupe verbal (vide si le verbe est seul). */
  readonly suite: string;
  readonly gc: string;
  readonly court?: string;
}

const ph = (gs: string, verbe: string, suite: string, gc: string, court?: string): Phrase => ({
  gs,
  verbe,
  suite,
  gc,
  ...(court ? { court } : {}),
});

export const PHRASES: readonly Phrase[] = [
  ph('Le facteur', 'distribue', 'le courrier', 'chaque matin'),
  ph('Les élèves de la classe', 'préparent', 'une exposition', 'depuis lundi'),
  ph('Ma voisine', 'arrose', 'ses tomates', 'le soir'),
  ph('Le petit chien', 'cache', 'son os', 'avant la sieste'),
  ph('Les pêcheurs', 'réparent', 'leurs filets', 'sur le quai'),
  ph('La boulangère', 'prépare', 'des brioches', 'avant l’ouverture'),
  ph('Les deux équipes', 'saluent', 'le public', 'à la fin du match'),
  ph('Un écureuil', 'grignote', 'une noisette', 'au pied du chêne'),
  ph('Mon oncle', 'répare', 'la barrière', 'dans son jardin'),
  ph('Les abeilles', 'visitent', 'les fleurs', 'au printemps'),
];

/** Sujets variés : pronom, groupe nominal long, plusieurs noms. */
export const SUJETS_VARIES: readonly Phrase[] = [
  ph('Nous', 'observons', 'les étoiles', 'ce soir'),
  ph('Elles', 'préparent', 'un gâteau', 'dans la cuisine'),
  ph('Vous', 'rangez', 'vos cahiers', 'avant la sortie'),
  ph('Le chat et le lapin', 'dorment', '', 'près du feu', 'Le chat'),
  ph('Ma sœur et mon frère', 'plantent', 'un arbre', 'derrière la maison', 'Ma sœur'),
  ph('Le clown et l’acrobate', 'répètent', 'leur numéro', 'sous le chapiteau', 'Le clown'),
  ph('Les escargots du jardin', 'mangent', 'les salades', 'après la pluie', 'Les escargots'),
  ph('La fille de nos voisins', 'joue', 'de la flûte', 'chaque soir', 'La fille'),
  ph('Le capitaine du bateau', 'consulte', 'la carte', 'depuis une heure', 'Le capitaine'),
];

export const gv = (p: Phrase): string => (p.suite ? `${p.verbe} ${p.suite}` : p.verbe);
/** Phrase avec le groupe circonstanciel à la fin. */
export const aLaFin = (p: Phrase): string => `${p.gs} ${gv(p)} ${p.gc}.`;
/** Phrase avec le groupe circonstanciel au début. */
export const auDebut = (p: Phrase): string => `${maj(p.gc)}, ${lowerFirst(p.gs)} ${gv(p)}.`;

// ───────────────────────── 2. Le sujet inversé ─────────────────────────

export interface Inversion {
  readonly phrase: string;
  readonly sujet: string;
  readonly verbe: string;
  /** Mots que l'on peut prendre à tort pour le sujet. */
  readonly leurre: string;
}

const inv = (phrase: string, sujet: string, verbe: string, leurre: string): Inversion => ({
  phrase,
  sujet,
  verbe,
  leurre,
});

/** La phrase commence par un groupe circonstanciel. */
export const INVERSES_LIEU: readonly Inversion[] = [
  inv('Dans le ciel brille la lune.', 'la lune', 'brille', 'Dans le ciel'),
  inv('Sur la branche chantent deux oiseaux.', 'deux oiseaux', 'chantent', 'Sur la branche'),
  inv('Au fond du jardin dort un hérisson.', 'un hérisson', 'dort', 'Au fond du jardin'),
  inv('Sous le vieux pont coule la rivière.', 'la rivière', 'coule', 'Sous le vieux pont'),
  inv('Au sommet de la tour flotte un drapeau.', 'un drapeau', 'flotte', 'Au sommet de la tour'),
  inv('Dans la cour résonnent des rires.', 'des rires', 'résonnent', 'Dans la cour'),
  inv('Au bord du chemin poussent des coquelicots.', 'des coquelicots', 'poussent', 'Au bord du chemin'),
];

/** Questions avec un mot interrogatif. */
export const INVERSES_QUESTION: readonly Inversion[] = [
  inv('Où dort le chat ?', 'le chat', 'dort', 'Où'),
  inv('Quand part le train ?', 'le train', 'part', 'Quand'),
  inv('Que prépare ton frère ?', 'ton frère', 'prépare', 'Que'),
  inv('Où travaille ta cousine ?', 'ta cousine', 'travaille', 'Où'),
  inv('Combien coûte ce livre ?', 'ce livre', 'coûte', 'Combien'),
  inv('Quand commencent les vacances ?', 'les vacances', 'commencent', 'Quand'),
];

/** Après des paroles rapportées : le verbe de parole précède son sujet. */
export const INCISES: readonly Inversion[] = [
  inv('« La mer est calme », annonce le capitaine.', 'le capitaine', 'annonce', 'La mer'),
  inv('« Les cahiers sont rangés », constate la maîtresse.', 'la maîtresse', 'constate', 'Les cahiers'),
  inv('« La clé est retrouvée », crie mon petit frère.', 'mon petit frère', 'crie', 'La clé'),
  inv('« Le soleil tape fort », soupire le jardinier.', 'le jardinier', 'soupire', 'Le soleil'),
  inv('« Le repas est prêt », dit mon père.', 'mon père', 'dit', 'Le repas'),
  inv('« La route est longue », répond le chauffeur.', 'le chauffeur', 'répond', 'La route'),
];

/** Questions où le pronom suit le verbe, avec un trait d'union. */
export const INVERSES_PRONOM: readonly Inversion[] = [
  inv('Viens-tu avec nous ?', 'tu', 'Viens', 'nous'),
  inv('Où allez-vous ce matin ?', 'vous', 'allez', 'ce matin'),
  inv('Partent-ils en vacances ?', 'ils', 'Partent', 'vacances'),
  inv('Chante-t-elle dans la chorale ?', 'elle', 'Chante', 'la chorale'),
  inv('Pouvons-nous ouvrir la fenêtre ?', 'nous', 'Pouvons', 'la fenêtre'),
  inv('Connais-tu cette chanson ?', 'tu', 'Connais', 'cette chanson'),
];

/** Phrases à l'ordre habituel : sujet avant le verbe. */
export const ORDRE_HABITUEL: readonly Inversion[] = [
  inv('Dans le ciel, un avion passe.', 'un avion', 'passe', 'Dans le ciel'),
  inv('Le soir, les voisins discutent.', 'les voisins', 'discutent', 'Le soir'),
  inv('Au printemps, les cerisiers fleurissent.', 'les cerisiers', 'fleurissent', 'Au printemps'),
  inv('Sous la pluie, le facteur court.', 'le facteur', 'court', 'Sous la pluie'),
  inv('Près du feu, le chien ronfle.', 'le chien', 'ronfle', 'Près du feu'),
  inv('Dans la mare, les grenouilles sautent.', 'les grenouilles', 'sautent', 'Dans la mare'),
  inv('Après le repas, mon grand-père lit.', 'mon grand-père', 'lit', 'Après le repas'),
];

// ───────────────────────── 3. COD ou COI ─────────────────────────

/** Un seul complément d'objet et un complément circonstanciel. */
export interface Objet {
  readonly s: string;
  readonly verbe: string;
  readonly obj: string;
  readonly type: 'COD' | 'COI';
  /** Préposition du COI. */
  readonly prep?: string;
  readonly circ: string;
}

const cod = (s: string, verbe: string, obj: string, circ: string): Objet => ({ s, verbe, obj, type: 'COD', circ });
const coi = (s: string, verbe: string, prep: string, nom: string, circ: string): Objet => ({
  s,
  verbe,
  obj: `${prep} ${nom}`,
  type: 'COI',
  prep,
  circ,
});

export const OBJETS: readonly Objet[] = [
  cod('Le jardinier', 'arrose', 'les fleurs', 'à midi'),
  cod('Le boulanger', 'pétrit', 'la pâte', 'avant le lever du jour'),
  cod('Les enfants', 'observent', 'les fourmis', 'dans la cour'),
  cod('Ma cousine', 'prépare', 'une salade', 'pour le dîner'),
  cod('Les élèves', 'relisent', 'leur texte', 'avant la dictée'),
  cod('Mon voisin', 'lave', 'sa voiture', 'le samedi'),
  coi('Ma voisine', 'parle', 'à', 'son chien', 'dans la rue'),
  coi('Mon oncle', 'téléphone', 'à', 'sa sœur', 'le dimanche'),
  coi('Les enfants', 'rêvent', 'de', 'la mer', 'pendant la nuit'),
  coi('Le chiot', 'obéit', 'à', 'son maître', 'au parc'),
  coi('La gardienne', 'pense', 'à', 'ses vacances', 'dans le bus'),
  coi('Le maire', 'parle', 'de', 'la fête', 'à la radio'),
];

/** Deux compléments d'objet (un COD et un COI) et un complément circonstanciel. */
export interface DeuxObjets {
  readonly s: string;
  readonly verbe: string;
  readonly cod: string;
  readonly coi: string;
  readonly circ: string;
}

const deux = (s: string, verbe: string, cod: string, coi: string, circ: string): DeuxObjets => ({
  s,
  verbe,
  cod,
  coi,
  circ,
});

export const DEUX_OBJETS: readonly DeuxObjets[] = [
  deux('Le facteur', 'donne', 'une lettre', 'à ma voisine', 'ce matin'),
  deux('Ma tante', 'envoie', 'une carte', 'à son neveu', 'chaque été'),
  deux('Le maître', 'prête', 'un dictionnaire', 'à son élève', 'pendant la leçon'),
  deux('Mon grand-père', 'raconte', 'une histoire', 'aux enfants', 'le soir'),
  deux('La guide', 'montre', 'le plan', 'aux visiteurs', 'à l’entrée'),
  deux('Mon frère', 'offre', 'un bouquet', 'à notre grand-mère', 'dans le salon'),
  deux('Le vendeur', 'rend', 'la monnaie', 'à la cliente', 'à la caisse'),
  deux('Ma sœur', 'demande', 'un conseil', 'à son professeur', 'après le cours'),
  deux('La bibliothécaire', 'propose', 'un roman', 'à ce lecteur', 'le mercredi'),
];

// ───────────────────────── 4. Attribut du sujet ou complément d'objet ─────────────────────────

/** Le même groupe nominal, attribut après un verbe attributif, ou COD après un autre verbe. */
export interface Jumelles {
  readonly s: string;
  readonly attributif: string;
  readonly groupe: string;
  readonly action: string;
}

const jum = (s: string, attributif: string, groupe: string, action: string): Jumelles => ({
  s,
  attributif,
  groupe,
  action,
});

export const JUMELLES: readonly Jumelles[] = [
  jum('Ma tante', 'est', 'une grande artiste', 'admire'),
  jum('Mon voisin', 'devient', 'un excellent jardinier', 'félicite'),
  jum('Cette élève', 'reste', 'une bonne camarade', 'aide'),
  jum('Mon cousin', 'est', 'un pompier courageux', 'interroge'),
  jum('La dame du premier étage', 'devient', 'une amie de la famille', 'invite'),
  jum('Ce garçon', 'est', 'un champion de natation', 'applaudit'),
  jum('Ma mère', 'reste', 'la capitaine de l’équipe', 'remercie'),
  jum('Le boulanger', 'devient', 'le nouveau maire', 'rencontre'),
];

/** Adjectif attribut, après des verbes attributifs variés. */
export interface AttributAdjectif {
  readonly s: string;
  readonly verbe: string;
  readonly adj: string;
  readonly circ: string;
}

const att = (s: string, verbe: string, adj: string, circ: string): AttributAdjectif => ({ s, verbe, adj, circ });

export const ATTRIBUTS: readonly AttributAdjectif[] = [
  att('Le lac', 'reste', 'calme', 'ce matin'),
  att('Cette histoire', 'semble', 'vraie', 'au début'),
  att('Les élèves', 'paraissent', 'surpris', 'après l’annonce'),
  att('Mon chat', 'a l’air', 'fatigué', 'ce soir'),
  att('Le ciel', 'devient', 'gris', 'dans l’après-midi'),
  att('La soupe', 'est', 'brûlante', 'à midi'),
  att('Ces biscuits', 'semblent', 'délicieux', 'au goûter'),
  att('Les rues', 'deviennent', 'désertes', 'la nuit'),
];

/** Phrase dont l'adjectif attribut est à accorder (`……` dans le texte). */
export interface AccordAttribut {
  readonly texte: string;
  readonly sujet: string;
  readonly options: readonly [string, string, string, string];
  readonly correct: number;
}

const acc = (sujet: string, verbe: string, base: string, correct: number): AccordAttribut => ({
  texte: `${sujet} ${verbe} …….`,
  sujet,
  options: [base, `${base}e`, `${base}s`, `${base}es`],
  correct,
});

export const ACCORDS_ATTRIBUT: readonly AccordAttribut[] = [
  acc('Les fenêtres', 'restent', 'ouvert', 3),
  acc('La cour', 'semble', 'désert', 1),
  acc('Les nuages', 'deviennent', 'noir', 2),
  acc('Les valises', 'paraissent', 'lourd', 3),
  acc('La mer', 'est', 'bleu', 1),
  acc('Les murs', 'sont', 'vert', 2),
];

// ───────────────────────── 5. Temps, lieu, cause ─────────────────────────

export type Circonstance = 'temps' | 'lieu' | 'cause';
export const CIRCONSTANCES: readonly Circonstance[] = ['temps', 'lieu', 'cause'];

/** Une action avec un complément circonstanciel de chaque sorte. */
export interface Triple {
  readonly action: string;
  readonly temps: string;
  readonly lieu: string;
  readonly cause: string;
}

const tri = (action: string, temps: string, lieu: string, cause: string): Triple => ({ action, temps, lieu, cause });

export const TRIPLES: readonly Triple[] = [
  tri('le match s’arrête', 'à midi', 'sur le stade', 'à cause de l’orage'),
  tri('les enfants jouent', 'cet après-midi', 'dans le salon', 'à cause de la pluie'),
  tri('les ouvriers réparent un toit', 'ce matin', 'dans le village', 'à cause de la tempête'),
  tri('les voitures roulent lentement', 'depuis une heure', 'sur le pont', 'à cause du brouillard'),
  tri('les élèves mangent', 'ce jeudi', 'sous le préau', 'à cause des travaux'),
  tri('le jardinier arrose les salades', 'chaque soir', 'dans le potager', 'à cause de la chaleur'),
  tri('les oiseaux se taisent', 'en fin de journée', 'dans la forêt', 'à cause du bruit'),
  tri('les promeneurs marchent vite', 'avant la nuit', 'sur le sentier', 'à cause du froid'),
];

/** Compléments circonstanciels moins évidents : adverbe, groupe nominal, prépositions variées. */
export interface Circ {
  readonly phrase: string;
  readonly cc: string;
  readonly type: Circonstance;
}

const circ = (phrase: string, cc: string, type: Circonstance): Circ => ({ phrase, cc, type });

export const CIRCONSTANCIELS: readonly Circ[] = [
  circ('Le car part dans une heure.', 'dans une heure', 'temps'),
  circ('Le spectacle commence à vingt heures.', 'à vingt heures', 'temps'),
  circ('Le facteur passe le matin.', 'le matin', 'temps'),
  circ('Les élèves se taisent pendant la lecture.', 'pendant la lecture', 'temps'),
  circ('Les hirondelles reviennent au printemps.', 'au printemps', 'temps'),
  circ('Les campeurs dorment sous les arbres.', 'sous les arbres', 'lieu'),
  circ('Ici, les marchands vendent des fruits.', 'ici', 'lieu'),
  circ('Les musiciens jouent devant la mairie.', 'devant la mairie', 'lieu'),
  circ('Mon père lit le journal dans le train.', 'dans le train', 'lieu'),
  circ('Le gazon jaunit à cause de la sécheresse.', 'à cause de la sécheresse', 'cause'),
  circ('Le train est arrêté en raison de la neige.', 'en raison de la neige', 'cause'),
  circ('Le chaton se cache par peur de l’orage.', 'par peur de l’orage', 'cause'),
  circ('La fête est annulée à cause du vent.', 'à cause du vent', 'cause'),
  circ('Les voitures ralentissent à cause du verglas.', 'à cause du verglas', 'cause'),
];
