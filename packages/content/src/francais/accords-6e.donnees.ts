/**
 * Données du chapitre « Les accords » (6e) : faits cités et phrases écrites pour l'exercice. Les féminins et les
 * pluriels attestés au CM1 et au CM2 sont repris de leurs fichiers. Aucun prénom.
 */
import { FEMININS, PLURIELS_ALS, PLURIELS_AUX, PLURIELS_EAU, PLURIELS_OU_X, faitAccord } from './accords.donnees.ts';
import type { Genre, Nombre, SujetAccorde, VerbeEtre } from './accords.donnees.ts';
import { ADJ_PARTICULIERS, ADJ_REGULIERS, type Adj } from './accords-cm2.donnees.ts';
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

const REGLES: readonly Fait[] = [
  prog('a6-gn', 'Maîtriser la chaîne d’accords dans le groupe nominal, en lien avec l’analyse grammaticale'),
  prog('a6-sujet-verbe', 'Identifier le groupe sujet et raisonner sur l’accord sujet/verbe'),
  prog('a6-etre', 'Maîtriser l’accord du participe passé employé avec l’auxiliaire être'),
  prog(
    'a6-avoir',
    'Accorder le participe passé avec le complément d’objet direct (COD) pour les verbes étudiés et conjugués avec l’auxiliaire avoir (pronom personnel antéposé)',
  ),
  gram('a6-determinant', 'Le déterminant s’accorde en genre et en nombre avec le nom.'),
  gram('a6-adjectif', 'Il s’accorde en genre et en nombre avec le nom auquel il se rapporte.'),
  gram('a6-noyau', 'Le groupe nominal (GN) est un groupe syntaxique dont le noyau est un nom (N).'),
  gram('a6-gs', 'Le groupe sujet (GS) règle l’accord du verbe'),
  gram(
    'a6-gs-pronom',
    'Dans tous les cas, il est l’équivalent syntaxique d’un groupe nominal (GN) et peut être remplacé par il, elle ou cela',
  ),
  gram('a6-pronoms-sujets', 'pronoms personnels de fonction sujet : je, tu, il(s)'),
  gram('a6-forme-composee', 'formé au moyen de l’auxiliaire être ou avoir et du participe passé'),
  gram('a6-pronoms-cod', 'pronoms personnels de fonction complément d’objet direct : le, la, les'),
  gram('a6-pronoms-coi', 'pronoms personnels de fonction complément d’objet indirect : lui'),
  {
    id: 'a6-etre-regle',
    source: 'cnrtl-etre',
    citation: 'Le part. passé s’accorde en genre et en nombre avec le suj. du verbe.',
  },
  {
    id: 'a6-avoir-regle',
    source: 'cnrtl-avoir',
    citation:
      'Le part. passé s’accorde en genre et en nombre avec le compl. d’obj. du verbe si celui-ci précède le verbe.',
  },
  {
    id: 'a6-prendre',
    source: 'cnrtl-conj-prendre',
    citation:
      'prise … participe passé singulier féminin … pris … participe passé pluriel masculin … prises … participe passé pluriel féminin',
  },
  {
    id: 'a6-faire',
    source: 'cnrtl-conj-faire',
    citation:
      'faite … participe passé singulier féminin … faits … participe passé pluriel masculin … faites … participe passé pluriel féminin',
  },
];

export const CATEGORIES: readonly (readonly [Genre, Nombre])[] = [
  ['m', 'sg'],
  ['f', 'sg'],
  ['m', 'pl'],
  ['f', 'pl'],
];

// ───────────────────────── 1. Chaîne d'accord du groupe nominal ─────────────────────────

export interface Nom {
  readonly nom: string;
  readonly genre: Genre;
  readonly nombre: Nombre;
}

const nm = (nom: string, genre: Genre, nombre: Nombre): Nom => ({ nom, genre, nombre });

/** Noms à consonne initiale : « le », « la », « les » s'écrivent sans élision. */
export const NOMS_DET: readonly Nom[] = [
  nm('sac', 'm', 'sg'),
  nm('coffre', 'm', 'sg'),
  nm('tableau', 'm', 'sg'),
  nm('barque', 'f', 'sg'),
  nm('lampe', 'f', 'sg'),
  nm('malle', 'f', 'sg'),
  nm('paniers', 'm', 'pl'),
  nm('cartons', 'm', 'pl'),
  nm('tables', 'f', 'pl'),
  nm('valises', 'f', 'pl'),
];

export const DET: Readonly<Record<Genre, Readonly<Record<Nombre, string>>>> = {
  m: { sg: 'le', pl: 'les' },
  f: { sg: 'la', pl: 'les' },
};

/** Adjectifs placés avant le nom. */
export const ADJ_AVANT: readonly Adj[] = [ADJ_REGULIERS.grand, ADJ_REGULIERS.petit];

export interface GroupeEtendu {
  /** Groupe sans l'adjectif : déterminant, nom noyau, complément du nom. */
  readonly debut: string;
  readonly noyau: string;
  readonly genre: Genre;
  readonly nombre: Nombre;
  /** Nom du complément, d'un autre genre ou d'un autre nombre que le noyau. */
  readonly complement: string;
  readonly determinant: string;
  /** Adjectif qui ne peut décrire que le nom noyau. */
  readonly adjectif: Adj;
}

const ge = (
  [determinant, noyau, suite]: readonly [string, string, string],
  [genre, nombre]: readonly [Genre, Nombre],
  complement: string,
  adjectif: Adj,
): GroupeEtendu => ({
  debut: `${determinant} ${noyau} ${suite}`,
  determinant,
  noyau,
  genre,
  nombre,
  complement,
  adjectif,
});

const { grand, vert, lourd } = ADJ_REGULIERS;
const { content, heureux, doux, blanc, vif, léger } = ADJ_PARTICULIERS;

export const GROUPES_ETENDUS: readonly GroupeEtendu[] = [
  ge(['Les', 'lanternes', 'du vieux port'], ['f', 'pl'], 'port', lourd),
  ge(['La', 'laine', 'de ces moutons'], ['f', 'sg'], 'moutons', doux),
  ge(['Les', 'plumes', 'de l’oiseau'], ['f', 'pl'], 'oiseau', léger),
  ge(['Le', 'propriétaire', 'des vignes'], ['m', 'sg'], 'vignes', content),
  ge(['Les', 'visiteurs', 'de la galerie'], ['m', 'pl'], 'galerie', heureux),
  ge(['La', 'gardienne', 'des phares'], ['f', 'sg'], 'phares', content),
  ge(['Les', 'écailles', 'du poisson'], ['f', 'pl'], 'poisson', vert),
  ge(['Le', 'manteau', 'de la sorcière'], ['m', 'sg'], 'sorcière', vert),
  ge(['Les', 'flocons', 'de la nuit'], ['m', 'pl'], 'nuit', blanc),
  ge(['La', 'voix', 'des chanteurs'], ['f', 'sg'], 'chanteurs', doux),
  ge(['Les', 'regards', 'de la chatte'], ['m', 'pl'], 'chatte', vif),
  ge(['Les', 'caisses', 'du marchand'], ['f', 'pl'], 'marchand', lourd),
  ge(['La', 'tour', 'des remparts'], ['f', 'sg'], 'remparts', grand),
  ge(['Le', 'pas', 'des danseuses'], ['m', 'sg'], 'danseuses', léger),
];

export interface Transformation {
  readonly depart: readonly [string, string, string];
  readonly arrivee: readonly [string, string, string];
  readonly consigne: 'au pluriel' | 'au féminin';
  /** Faits qui attestent la forme du nom et de l'adjectif. */
  readonly faits: readonly string[];
}

const pluriels = [...PLURIELS_AUX, ...PLURIELS_EAU, ...PLURIELS_ALS, ...PLURIELS_OU_X];

const enPluriel = (det: 'un' | 'le', nom: string, a: Adj, genre: Genre = 'm'): Transformation => {
  const n = pluriels.find((x) => x.s === nom);
  if (!n) throw new Error(`pluriel inconnu : ${nom}`);
  return {
    depart: [det, nom, a[genre][0]],
    arrivee: [det === 'un' ? 'des' : 'les', n.p, a[genre][1]],
    consigne: 'au pluriel',
    faits: [n.fait, a.fait],
  };
};

const feminin = (mot: string) => {
  const x = FEMININS.find((y) => y.m === mot);
  if (!x) throw new Error(`féminin inconnu : ${mot}`);
  return x;
};

const auFeminin = (det: 'un' | 'le', nom: string, a: Adj): Transformation => {
  const n = feminin(nom);
  return {
    depart: [det, nom, a.m[0]],
    arrivee: [det === 'un' ? 'une' : 'la', n.f, a.f[0]],
    consigne: 'au féminin',
    faits: [n.fait, a.fait],
  };
};

export const TRANSFORMATIONS: readonly Transformation[] = [
  enPluriel('un', 'cheval', vif),
  enPluriel('un', 'animal', doux),
  enPluriel('le', 'bateau', blanc),
  enPluriel('un', 'cadeau', lourd),
  enPluriel('un', 'oiseau', vif),
  enPluriel('un', 'bal', léger),
  enPluriel('le', 'hibou', content),
  enPluriel('un', 'bocal', lourd),
  auFeminin('le', 'fermier', heureux),
  auFeminin('un', 'chien', vif),
  auFeminin('un', 'chat', blanc),
  auFeminin('le', 'lion', doux),
  auFeminin('un', 'musicien', content),
  auFeminin('le', 'champion', heureux),
  auFeminin('un', 'marchand', content),
];

// ───────────────────────── 2. Accord sujet-verbe raisonné ─────────────────────────

export type Pronom = 'il' | 'elle' | 'ils' | 'elles';
export const PRONOMS: readonly Pronom[] = ['il', 'elle', 'ils', 'elles'];

/** Pourquoi la phrase peut tromper. */
export type Cas = 'simple' | 'eloigne' | 'ecran' | 'inverse';

export interface PhraseSujet {
  readonly avant: string;
  /** Suite de la phrase, point compris. */
  readonly apres: string;
  readonly infinitif: string;
  /** [singulier, pluriel] au temps de la phrase. */
  readonly formes: readonly [string, string];
  readonly temps: 'présent' | 'imparfait';
  readonly groupeSujet: string;
  readonly noyau: string;
  readonly pronom: Pronom;
  readonly cas: Cas;
}

type Formes = readonly [string, readonly [string, string]];
const ps = (
  cas: Cas,
  [avant, apres]: readonly [string, string],
  [infinitif, formes]: Formes,
  [groupeSujet, noyau, pronom]: readonly [string, string, Pronom],
  temps: PhraseSujet['temps'] = 'présent',
): PhraseSujet => ({ avant, apres, infinitif, formes, temps, groupeSujet, noyau, pronom, cas });

export const nombreDe = (p: PhraseSujet): Nombre => (p.pronom.endsWith('s') ? 'pl' : 'sg');
export const verbeJuste = (p: PhraseSujet): string => p.formes[nombreDe(p) === 'sg' ? 0 : 1];
export const verbeFaux = (p: PhraseSujet): string => p.formes[nombreDe(p) === 'sg' ? 1 : 0];
/** Phrase entière avec un verbe donné ; la majuscule vient du début. */
export const textePhrase = (p: PhraseSujet, verbe: string): string =>
  `${p.avant}${p.avant ? ' ' : ''}${verbe} ${p.apres}`;

const CHANTER: Formes = ['chanter', ['chante', 'chantent']];
const DORMIR: Formes = ['dormir', ['dort', 'dorment']];
const GRINCER: Formes = ['grincer', ['grince', 'grincent']];
const OBSERVER: Formes = ['observer', ['observe', 'observent']];
const BRILLER: Formes = ['briller', ['brille', 'brillent']];
const ATTENDRE: Formes = ['attendre', ['attend', 'attendent']];
const SUIVRE: Formes = ['suivre', ['suit', 'suivent']];
const SALUER: Formes = ['saluer', ['salue', 'saluent']];
const SURVEILLER: Formes = ['surveiller', ['surveille', 'surveillent']];
const ACCOMPAGNER: Formes = ['accompagner', ['accompagne', 'accompagnent']];
const REPARER: Formes = ['réparer', ['répare', 'réparent']];
const FINIR: Formes = ['finir', ['finit', 'finissent']];
const JOUER: Formes = ['jouer', ['joue', 'jouent']];
const RESONNER: Formes = ['résonner', ['résonne', 'résonnent']];
const CHANTAIT: Formes = ['chanter', ['chantait', 'chantaient']];
const DORMAIT: Formes = ['dormir', ['dormait', 'dormaient']];
const BRILLAIT: Formes = ['briller', ['brillait', 'brillaient']];
const SUIVAIT: Formes = ['suivre', ['suivait', 'suivaient']];

export const PHRASES_SIMPLES: readonly PhraseSujet[] = [
  ps('simple', ['La rivière', 'sous le pont.'], CHANTER, ['La rivière', 'rivière', 'elle']),
  ps('simple', ['Les enfants', 'dans la cour.'], JOUER, ['Les enfants', 'enfants', 'ils']),
  ps('simple', ['Le vieux volet', 'toute la nuit.'], GRINCER, ['Le vieux volet', 'volet', 'il']),
  ps('simple', ['Les étoiles', 'au-dessus du toit.'], BRILLER, ['Les étoiles', 'étoiles', 'elles']),
  ps('simple', ['Mon grand-père', 'son travail avant midi.'], FINIR, ['Mon grand-père', 'grand-père', 'il']),
  ps('simple', ['Les voyageuses', 'le prochain train.'], ATTENDRE, ['Les voyageuses', 'voyageuses', 'elles']),
  ps('simple', ['La chouette', 'les souris du grenier.'], OBSERVER, ['La chouette', 'chouette', 'elle']),
  ps('simple', ['Les deux chiots', 'près du feu.'], DORMIR, ['Les deux chiots', 'chiots', 'ils']),
];

/** Sujet suivi d'un complément du nom d'un autre nombre. */
export const PHRASES_ELOIGNEES: readonly PhraseSujet[] = [
  ps('eloigne', ['Les volets de la maison', 'au moindre vent.'], GRINCER, ['Les volets de la maison', 'volets', 'ils']),
  ps('eloigne', ['La lumière des phares', 'au large.'], BRILLER, ['La lumière des phares', 'lumière', 'elle']),
  ps('eloigne', ['Les chiens du berger', 'sous la table.'], DORMIR, ['Les chiens du berger', 'chiens', 'ils']),
  ps('eloigne', ['Le propriétaire des chevaux', 'devant l’écurie.'], ATTENDRE, [
    'Le propriétaire des chevaux',
    'propriétaire',
    'il',
  ]),
  ps('eloigne', ['Les cloches de la chapelle', 'au loin.'], RESONNER, [
    'Les cloches de la chapelle',
    'cloches',
    'elles',
  ]),
  ps('eloigne', ['La sœur de mes voisins', 'dans la chorale.'], CHANTER, ['La sœur de mes voisins', 'sœur', 'elle']),
  ps('eloigne', ['Les cousines de mon ami', 'leurs devoirs.'], FINIR, ['Les cousines de mon ami', 'cousines', 'elles']),
  ps('eloigne', ['Le toit des granges', 'sous la pluie.'], BRILLER, ['Le toit des granges', 'toit', 'il']),
];

/** Un pronom complément placé juste avant le verbe ne le commande pas. */
export const PHRASES_ECRAN: readonly PhraseSujet[] = [
  ps('ecran', ['Le gardien les', 'depuis sa fenêtre.'], OBSERVER, ['Le gardien', 'gardien', 'il']),
  ps('ecran', ['Les élèves le', 'près du portail.'], SALUER, ['Les élèves', 'élèves', 'ils']),
  ps('ecran', ['La guide les', 'jusqu’au sommet.'], ACCOMPAGNER, ['La guide', 'guide', 'elle']),
  ps('ecran', ['Les chats la', 'en silence.'], SURVEILLER, ['Les chats', 'chats', 'ils']),
  ps('ecran', ['Le chien des fermiers les', 'dans le pré.'], SUIVRE, ['Le chien des fermiers', 'chien', 'il']),
  ps('ecran', ['Mes voisines le', 'à l’arrêt du car.'], SALUER, ['Mes voisines', 'voisines', 'elles']),
];

/** Sujet placé après le verbe. */
export const PHRASES_INVERSEES: readonly PhraseSujet[] = [
  ps('inverse', ['Au fond du bois', 'un merle.'], CHANTER, ['un merle', 'merle', 'il']),
  ps('inverse', ['Dans la vallée', 'les cloches du village.'], RESONNER, [
    'les cloches du village',
    'cloches',
    'elles',
  ]),
  ps('inverse', ['Le sentier que', 'les marcheurs est étroit.'], SUIVRE, ['les marcheurs', 'marcheurs', 'ils']),
  ps('inverse', ['La barque que', 'le pêcheur est vieille.'], REPARER, ['le pêcheur', 'pêcheur', 'il']),
  ps('inverse', ['Sous le préau', 'deux élèves de sixième.'], ATTENDRE, ['deux élèves de sixième', 'élèves', 'ils']),
  ps('inverse', ['Chaque soir', 'les premières lampes.'], BRILLER, ['les premières lampes', 'lampes', 'elles']),
];

/** Récit à l'imparfait (niveau 5). */
export const PHRASES_RECIT: readonly PhraseSujet[] = [
  ps('inverse', ['Au loin', 'les oiseaux.'], CHANTAIT, ['les oiseaux', 'oiseaux', 'ils'], 'imparfait'),
  ps(
    'eloigne',
    ['Les gardiens du musée', 'sur un banc.'],
    DORMAIT,
    ['Les gardiens du musée', 'gardiens', 'ils'],
    'imparfait',
  ),
  ps(
    'eloigne',
    ['La lampe des voyageurs', 'faiblement.'],
    BRILLAIT,
    ['La lampe des voyageurs', 'lampe', 'elle'],
    'imparfait',
  ),
  ps('ecran', ['Un vieux renard les', 'sans bruit.'], SUIVAIT, ['Un vieux renard', 'renard', 'il'], 'imparfait'),
  ps('inverse', ['Dans la grange', 'une chouette.'], DORMAIT, ['une chouette', 'chouette', 'elle'], 'imparfait'),
  ps('ecran', ['Les bergères le', 'à travers la lande.'], SUIVAIT, ['Les bergères', 'bergères', 'elles'], 'imparfait'),
];

/** Phrases au présent où le sujet est plus difficile à trouver. */
export const PHRASES_PIEGES: readonly PhraseSujet[] = [...PHRASES_ELOIGNEES, ...PHRASES_ECRAN, ...PHRASES_INVERSEES];

export const PHRASES_SUJET: readonly PhraseSujet[] = [
  ...PHRASES_SIMPLES,
  ...PHRASES_ELOIGNEES,
  ...PHRASES_ECRAN,
  ...PHRASES_INVERSEES,
  ...PHRASES_RECIT,
];

// ───────────────────────── 3. Participe passé avec être ─────────────────────────

const sa = (texte: string, genre: Genre, nombre: Nombre, raison?: string): SujetAccorde => ({
  texte,
  genre,
  nombre,
  ...(raison ? { raison } : {}),
});

/** Un sujet de chaque genre et nombre, avec des noms qui montrent leur genre. */
export const SUJETS_CHOIX: readonly (readonly [string, string, string, string])[] = [
  ['Le moniteur', 'La monitrice', 'Les moniteurs', 'Les monitrices'],
  ['Le voisin', 'La voisine', 'Les voisins', 'Les voisines'],
  ['Mon cousin', 'Ma cousine', 'Mes cousins', 'Mes cousines'],
  ['Le champion', 'La championne', 'Les champions', 'Les championnes'],
  ['Le musicien', 'La musicienne', 'Les musiciens', 'Les musiciennes'],
];

/** Sujets suivis d'un complément d'un autre genre ou d'un autre nombre. */
export const SUJETS_ELOIGNES: readonly SujetAccorde[] = [
  sa('La sœur de mes voisins', 'f', 'sg', 'Le nom noyau est « sœur ».'),
  sa('Le frère de mes amies', 'm', 'sg', 'Le nom noyau est « frère ».'),
  sa('Les amies de mon frère', 'f', 'pl', 'Le nom noyau est « amies ».'),
  sa('Les cousins de ma voisine', 'm', 'pl', 'Le nom noyau est « cousins ».'),
  sa('La directrice des musées', 'f', 'sg', 'Le nom noyau est « directrice ».'),
  sa('Les joueuses du club', 'f', 'pl', 'Le nom noyau est « joueuses ».'),
  sa('Le gardien des tours', 'm', 'sg', 'Le nom noyau est « gardien ».'),
  sa('Les garçons de la classe', 'm', 'pl', 'Le nom noyau est « garçons ».'),
];

/** Sujets placés après le verbe. */
export const SUJETS_INVERSES: readonly SujetAccorde[] = [
  sa('les nageuses', 'f', 'pl', '« les nageuses » est placé après le verbe.'),
  sa('la factrice', 'f', 'sg', '« la factrice » est placé après le verbe.'),
  sa('les pompiers', 'm', 'pl', '« les pompiers » est placé après le verbe.'),
  sa('le guide', 'm', 'sg', '« le guide » est placé après le verbe.'),
  sa('les voisines', 'f', 'pl', '« les voisines » est placé après le verbe.'),
  sa('la championne', 'f', 'sg', '« la championne » est placé après le verbe.'),
];

export const VERBES_INVERSES: readonly string[] = ['arriver', 'partir', 'entrer', 'rentrer', 'venir', 'sortir'];

export const VERBES_ETRE_6E: readonly VerbeEtre[] = [
  { infinitif: 'arriver', participe: 'arrivé', fin: 'à la gare' },
  { infinitif: 'partir', participe: 'parti', fin: 'avant l’aube' },
  { infinitif: 'tomber', participe: 'tombé', fin: 'sur le sentier' },
  { infinitif: 'rester', participe: 'resté', fin: 'au refuge' },
  { infinitif: 'entrer', participe: 'entré', fin: 'dans la bibliothèque' },
  { infinitif: 'venir', participe: 'venu', fin: 'au concert' },
  { infinitif: 'aller', participe: 'allé', fin: 'au musée' },
  { infinitif: 'rentrer', participe: 'rentré', fin: 'avant le soir' },
  { infinitif: 'sortir', participe: 'sorti', fin: 'sous la pluie' },
];

export const verbeEtre6e = (infinitif: string): VerbeEtre => {
  const v = VERBES_ETRE_6E.find((x) => x.infinitif === infinitif);
  if (!v) throw new Error(`verbe inconnu : ${infinitif}`);
  return v;
};

// ───────────────────────── 4. Participe passé avec avoir ─────────────────────────

export interface Verbe {
  readonly infinitif: string;
  readonly participe: string;
}

const vb = (infinitif: string, participe: string): Verbe => ({ infinitif, participe });

const LAVER = vb('laver', 'lavé');
const RANGER = vb('ranger', 'rangé');
const FERMER = vb('fermer', 'fermé');
const TROUVER = vb('trouver', 'trouvé');
const REGARDER = vb('regarder', 'regardé');
const CHOISIR = vb('choisir', 'choisi');
const V_FINIR = vb('finir', 'fini');
const PRENDRE = vb('prendre', 'pris');
const FAIRE = vb('faire', 'fait');

export interface Complement {
  /** COD avec son déterminant. */
  readonly cod: string;
  readonly genre: Genre;
  readonly nombre: Nombre;
  readonly verbe: Verbe;
}

const co = (cod: string, genre: Genre, nombre: Nombre, verbe: Verbe): Complement => ({ cod, genre, nombre, verbe });

export const COMPLEMENTS: readonly Complement[] = [
  co('la nappe', 'f', 'sg', LAVER),
  co('les assiettes', 'f', 'pl', LAVER),
  co('le bol', 'm', 'sg', LAVER),
  co('les verres', 'm', 'pl', LAVER),
  co('les cartes', 'f', 'pl', RANGER),
  co('le matériel', 'm', 'sg', RANGER),
  co('la trousse', 'f', 'sg', RANGER),
  co('les cahiers', 'm', 'pl', RANGER),
  co('la fenêtre', 'f', 'sg', FERMER),
  co('les volets', 'm', 'pl', FERMER),
  co('la solution', 'f', 'sg', TROUVER),
  co('les indices', 'm', 'pl', TROUVER),
  co('le trésor', 'm', 'sg', TROUVER),
  co('les clés', 'f', 'pl', TROUVER),
  co('les photographies', 'f', 'pl', REGARDER),
  co('le documentaire', 'm', 'sg', REGARDER),
  co('les chaussures', 'f', 'pl', CHOISIR),
  co('la couverture', 'f', 'sg', CHOISIR),
  co('la maquette', 'f', 'sg', V_FINIR),
  co('les exercices', 'm', 'pl', V_FINIR),
  co('les photos', 'f', 'pl', PRENDRE),
  co('la route', 'f', 'sg', PRENDRE),
  co('les billets', 'm', 'pl', PRENDRE),
  co('le train', 'm', 'sg', PRENDRE),
  co('les crêpes', 'f', 'pl', FAIRE),
  co('la vaisselle', 'f', 'sg', FAIRE),
  co('les lits', 'm', 'pl', FAIRE),
  co('le gâteau', 'm', 'sg', FAIRE),
];

/** Participe accordé : féminin en « e », pluriel en « s » (« pris » reste « pris » au masculin pluriel). */
export const accordeAvoir = (participe: string, genre: Genre, nombre: Nombre): string => {
  const base = `${participe}${genre === 'f' ? 'e' : ''}`;
  return nombre === 'pl' && !base.endsWith('s') ? `${base}s` : base;
};

export interface Auteur {
  readonly texte: string;
  readonly aux: string;
}

export const AUTEURS: readonly Auteur[] = [
  { texte: 'Je', aux: 'ai' },
  { texte: 'Tu', aux: 'as' },
  { texte: 'Il', aux: 'a' },
  { texte: 'Elle', aux: 'a' },
  { texte: 'Nous', aux: 'avons' },
  { texte: 'Ils', aux: 'ont' },
  { texte: 'Elles', aux: 'ont' },
];

/** Pronom personnel qui reprend le COD, devant l'auxiliaire. */
export const pronomCod = (x: Complement): string => (x.nombre === 'pl' ? 'les' : 'l’');
/** « Je les ai », « Tu l’as ». */
export const debutAvant = (a: Auteur, x: Complement): string =>
  x.nombre === 'pl' ? `${a.texte} les ${a.aux}` : `${a.texte} l’${a.aux}`;
/** « J’ai », « Tu as ». */
export const debutApres = (a: Auteur): string => (a.texte === 'Je' ? 'J’ai' : `${a.texte} ${a.aux}`);

/** Compléments d'objet indirect repris par « lui » ou « leur » : le participe ne s'accorde pas. */
export interface Indirect {
  readonly coi: string;
  readonly pronom: 'lui' | 'leur';
  readonly verbe: Verbe;
  /** Fin de la phrase. */
  readonly suite: string;
}

const ci = (coi: string, pronom: Indirect['pronom'], verbe: Verbe, suite: string): Indirect => ({
  coi,
  pronom,
  verbe,
  suite,
});

export const INDIRECTS: readonly Indirect[] = [
  ci('mes cousines', 'leur', vb('parler', 'parlé'), 'ce matin'),
  ci('la libraire', 'lui', vb('demander', 'demandé'), 'un conseil'),
  ci('mes voisines', 'leur', vb('téléphoner', 'téléphoné'), 'hier soir'),
  ci('ma grand-mère', 'lui', vb('raconter', 'raconté'), 'une histoire'),
  ci('les bibliothécaires', 'leur', vb('répondre', 'répondu'), 'par écrit'),
];

// ───────────────────────── Faits et sources ─────────────────────────

/** Faits du chapitre, plus ceux du CM1 et du CM2 qui attestent les formes reprises. */
export const FAITS_ACCORDS_6E: readonly Fait[] = [
  ...REGLES,
  ...[
    ...new Set([
      ...TRANSFORMATIONS.flatMap((t) => t.faits),
      ...GROUPES_ETENDUS.map((g) => g.adjectif.fait),
      ...ADJ_AVANT.map((a) => a.fait),
    ]),
  ].map(faitAccord),
];

export const faitAccord6e = (id: string): Fait => {
  const x = FAITS_ACCORDS_6E.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

export const sourcesAccords6e = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitAccord6e(id).source)]),
];
