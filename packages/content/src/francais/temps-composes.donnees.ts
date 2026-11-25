/**
 * Données du chapitre « Les temps composés » (CM2) : faits cités, formes relevées sur les pages de conjugaison du
 * CNRTL et phrases écrites pour l'exercice. Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et
 * sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';
import { PERSONNES, avecSujet, forme, sourceDe, type Personne, type Sujet, type Verbe } from './present.donnees.ts';
import { passeSimple, type VerbePs } from './passe-simple.donnees.ts';
import {
  auxiliaireDe,
  conjugue,
  participeAccorde,
  passeCompose,
  type SujetAccorde,
  type VerbeTemps,
} from './temps.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);
/** Fait tiré d'un article du Dictionnaire de l'Académie française (`article` : identifiant sans accent). */
const acad = (id: string, article: string, citation: string): Fait => fait(`academie-${article}`)(id, citation);

const REGLES: readonly Fait[] = [
  prog(
    'tc-a-memoriser',
    'Conjugaisons à mémoriser et à maîtriser : passé simple, plus-que-parfait des verbes être et avoir, des verbes des premier et deuxième groupes, des verbes irréguliers du troisième groupe : faire, aller, dire, venir, pouvoir, voir, vouloir, prendre',
  ),
  prog(
    'tc-composition',
    'Connaître la composition en deux parties (auxiliaire + participe passé) des temps composés (passé composé et plus-que-parfait)',
  ),
  prog(
    'tc-negation',
    'Effectuer la transformation à la forme négative d’un verbe aux temps composés en plaçant les adverbes de négation au bon emplacement',
  ),
  prog(
    'tc-marques',
    'Identifier dans la terminaison des verbes conjugués : la marque de temps et la marque de personne',
  ),
  prog(
    'tc-radical',
    'Consolider la connaissance des variations du radical pour certains verbes du premier groupe et du troisième groupe',
  ),
  prog(
    'tc-radicaux-terminaisons',
    'L’enseignement de la conjugaison s’attache à l’identification des radicaux verbaux et de leurs terminaisons (marques de temps et de personne).',
  ),
  prog('tc-marques-cm1', 'Savoir isoler et connaître les marques de temps de l’imparfait (-ai-, -i-) ; du futur (-r-)'),
  prog(
    'tc-variations-cm1',
    'Mettre en évidence les variations du radical pour certains verbes du premier groupe (verbes dont l’avant-dernière syllabe contient un e muet ou un é, les verbes en -yer, en -eler et -eter, en -cer, -ger)',
  ),
  gram(
    'tc-liste',
    'Temps composés : passé composé, plus-que-parfait, futur antérieur, passé antérieur, conditionnel passé',
  ),
  gram('tc-forme', 'formé au moyen de l’auxiliaire être ou avoir et du participe passé'),
  gram('tc-pqp-chante', 'Plus-que-parfait : j’avais chanté'),
  gram('tc-pc-chante', 'Passé composé : j’ai chanté'),
  gram('tc-pqp-parle', 'Plus-que-parfait : j’avais parlé ; j’étais sorti(e)'),
  gram('tc-pc-parle', 'Passé composé : j’ai parlé ; je suis sorti(e)'),
  gram(
    'tc-forme-negative',
    'La phrase de forme négative se caractérise par la présence d’adverbes de négation, du type ne…pas, ne… plus, ne…jamais, etc.',
  ),
  gram(
    'tc-desinence',
    'la désinence du verbe conjugué se décompose elle-même en plusieurs morphèmes flexionnels nommés « marques » : marque de temps et marque de personne',
  ),
  gram('tc-marque-temps', 'Marque de temps : -ai- marque de l’imparfait dans chantaient'),
  gram('tc-marque-personne', 'Marque de personne : -ent marque de troisième personne du pluriel dans chantaient'),
  gram(
    'tc-deux-radicaux',
    'verbes à deux radicaux : par exemple, lire (radical li- dans je lis, tu lis, etc. ; radical lis- dans nous lisons, vous lisez, etc.)',
  ),
  gram('tc-plusieurs-radicaux', 'verbes à plus de trois radicaux : auxiliaires être et avoir ; savoir, pouvoir, aller'),
  gram(
    'tc-groupe-1',
    'Les verbes du premier groupe sont ceux qui présentent un infinitif en -er. Ils se conjuguent à partir d’un seul radical, sur le modèle de chanter.',
  ),
  acad(
    'tc-ne-auxiliaire',
    'ne',
    "Si le verbe est à un mode personnel, ce verbe ou, dans les formes composées, son auxiliaire, s'intercale entre ne et pas, ne et point, ne et guère",
  ),
  acad('tc-ne-elision', 'ne', "adverbe de négation (s'élide devant une voyelle ou un h muet)"),
  acad('tc-jamais', 'jamais', 'Avec la particule négative ne.'),
  acad('tc-appeler', 'appeler', "j'appelle, nous appelons"),
  acad('tc-jeter', 'jeter', 'je jette, nous jetons'),
  acad('tc-acheter', 'acheter', "j'achète, nous achetons"),
  acad('tc-broyer', 'broyer', 'je broie, nous broyons'),
  acad('tc-cedille', 'cedille', 'pour indiquer qu’elle se prononce comme un s sourd'),
  acad(
    'tc-g-doux',
    'g',
    'Pour obtenir la même prononciation devant les voyelles a, o, u, on intercale un e entre le g et cette voyelle',
  ),
];

// ───────────────────────── Temps composés ─────────────────────────

export type Compose = 'passé composé' | 'plus-que-parfait';
export const COMPOSES: readonly Compose[] = ['passé composé', 'plus-que-parfait'];

/** Auxiliaire du temps composé : au présent (passé composé) ou à l'imparfait (plus-que-parfait). */
export const auxiliaireAu = (t: Compose, v: VerbeTemps, p: Personne): string =>
  t === 'passé composé' ? forme(auxiliaireDe(v), p) : conjugue('imparfait', auxiliaireDe(v), p);

/** Groupe verbal au plus-que-parfait : « avais chanté », « était venue ». */
export const plusQueParfait = (v: VerbeTemps, s: SujetAccorde): string =>
  `${auxiliaireAu('plus-que-parfait', v, s.personne)} ${participeAccorde(v, s)}`;

export const composeAu = (t: Compose, v: VerbeTemps, s: SujetAccorde): string =>
  t === 'passé composé' ? passeCompose(v, s) : plusQueParfait(v, s);

// ───────────────────────── Premier groupe : radical qui varie ─────────────────────────

export type Famille1 = 'double' | 'accent' | 'yer' | 'cer' | 'ger';

/**
 * Imparfait puis futur simple (je, tu, il, nous, vous, ils), relevés sur la page de conjugaison du CNRTL de chaque
 * verbe. Le présent est déjà relevé au CM1 (`present.donnees.ts`).
 */
const TABLE_1 = {
  appeler: [
    'appelais appelais appelait appelions appeliez appelaient',
    'appellerai appelleras appellera appellerons appellerez appelleront',
  ],
  jeter: ['jetais jetais jetait jetions jetiez jetaient', 'jetterai jetteras jettera jetterons jetterez jetteront'],
  acheter: [
    'achetais achetais achetait achetions achetiez achetaient',
    'achèterai achèteras achètera achèterons achèterez achèteront',
  ],
  lever: ['levais levais levait levions leviez levaient', 'lèverai lèveras lèvera lèverons lèverez lèveront'],
  mener: ['menais menais menait menions meniez menaient', 'mènerai mèneras mènera mènerons mènerez mèneront'],
  semer: ['semais semais semait semions semiez semaient', 'sèmerai sèmeras sèmera sèmerons sèmerez sèmeront'],
  peser: ['pesais pesais pesait pesions pesiez pesaient', 'pèserai pèseras pèsera pèserons pèserez pèseront'],
  peler: ['pelais pelais pelait pelions peliez pelaient', 'pèlerai pèleras pèlera pèlerons pèlerez pèleront'],
  essuyer: [
    'essuyais essuyais essuyait essuyions essuyiez essuyaient',
    'essuierai essuieras essuiera essuierons essuierez essuieront',
  ],
  nettoyer: [
    'nettoyais nettoyais nettoyait nettoyions nettoyiez nettoyaient',
    'nettoierai nettoieras nettoiera nettoierons nettoierez nettoieront',
  ],
  employer: [
    'employais employais employait employions employiez employaient',
    'emploierai emploieras emploiera emploierons emploierez emploieront',
  ],
  appuyer: [
    'appuyais appuyais appuyait appuyions appuyiez appuyaient',
    'appuierai appuieras appuiera appuierons appuierez appuieront',
  ],
  commencer: [
    'commençais commençais commençait commencions commenciez commençaient',
    'commencerai commenceras commencera commencerons commencerez commenceront',
  ],
  lancer: [
    'lançais lançais lançait lancions lanciez lançaient',
    'lancerai lanceras lancera lancerons lancerez lanceront',
  ],
  nager: ['nageais nageais nageait nagions nagiez nageaient', 'nagerai nageras nagera nagerons nagerez nageront'],
  ranger: [
    'rangeais rangeais rangeait rangions rangiez rangeaient',
    'rangerai rangeras rangera rangerons rangerez rangeront',
  ],
} as const satisfies Partial<Record<Verbe, readonly [string, string]>>;

export type Verbe1 = keyof typeof TABLE_1;

export const FAMILLE_1: Record<Verbe1, Famille1> = {
  appeler: 'double',
  jeter: 'double',
  acheter: 'accent',
  lever: 'accent',
  mener: 'accent',
  semer: 'accent',
  peser: 'accent',
  peler: 'accent',
  essuyer: 'yer',
  nettoyer: 'yer',
  employer: 'yer',
  appuyer: 'yer',
  commencer: 'cer',
  lancer: 'cer',
  nager: 'ger',
  ranger: 'ger',
};
export const VERBES_1 = Object.keys(TABLE_1) as Verbe1[];

export type Temps1 = 'imparfait' | 'futur';
export const conjugue1 = (t: Temps1, v: Verbe1, p: Personne): string =>
  TABLE_1[v][t === 'imparfait' ? 0 : 1].split(' ')[PERSONNES.indexOf(p)] ?? '';

/** Fin de phrase de chaque verbe du premier groupe, valable avec tous les sujets. Écrites pour l'exercice. */
export const FINS_1: Record<Verbe1, string> = {
  appeler: 'le chien',
  jeter: 'les dés',
  acheter: 'un cahier',
  lever: 'la main',
  mener: 'le jeu',
  semer: 'des graines',
  peser: 'les pommes',
  peler: 'une orange',
  essuyer: 'les verres',
  nettoyer: 'la table',
  employer: 'une règle',
  appuyer: 'sur le bouton',
  commencer: 'un dessin',
  lancer: 'la balle',
  nager: 'dans le lac',
  ranger: 'les livres',
};

/** Le fait de l'Académie qui montre la variation de chaque famille. */
export const FAIT_FAMILLE: Record<Famille1, string> = {
  double: 'tc-appeler',
  accent: 'tc-acheter',
  yer: 'tc-broyer',
  cer: 'tc-cedille',
  ger: 'tc-g-doux',
};

// ───────────────────────── Troisième groupe : radicaux multiples ─────────────────────────

export type Temps3 = 'présent' | 'imparfait' | 'futur' | 'passé simple';
export const TEMPS_3: readonly Temps3[] = ['présent', 'imparfait', 'futur', 'passé simple'];

/** Être, avoir et les huit verbes irréguliers du programme : formes du CM1 et du passé simple (CM2). */
export type Verbe3 = VerbeTemps & VerbePs;
export const VERBES_3: readonly Verbe3[] = [
  'être',
  'avoir',
  'faire',
  'aller',
  'dire',
  'venir',
  'pouvoir',
  'voir',
  'vouloir',
  'prendre',
];
export const HUIT_3: readonly Verbe3[] = VERBES_3.filter((v) => v !== 'être' && v !== 'avoir');

export const conjugue3 = (t: Temps3, v: Verbe3, p: Personne): string => {
  if (t === 'présent') return forme(v, p);
  if (t === 'passé simple') return passeSimple(v, p);
  return conjugue(t, v, p);
};

/**
 * Formes à rattacher à leur infinitif (niveau 1 de la notion « variations du radical ») : deux infinitifs proches
 * à l'écrit, qui n'ont jamais cette forme. Choisis pour qu'aucun autre verbe n'ait la même forme (« il vit » est exclu :
 * c'est aussi le présent de « vivre »).
 */
export const FORMES_A_RATTACHER: readonly {
  readonly v: Verbe3;
  readonly t: Temps3;
  readonly p: Personne;
  readonly faux: readonly [string, string];
}[] = [
  { v: 'venir', t: 'futur', p: 'nous', faux: ['vendre', 'vider'] },
  { v: 'venir', t: 'passé simple', p: 'il', faux: ['vendre', 'vivre'] },
  { v: 'prendre', t: 'passé simple', p: 'ils', faux: ['prier', 'priver'] },
  { v: 'faire', t: 'futur', p: 'je', faux: ['fermer', 'fêter'] },
  { v: 'faire', t: 'passé simple', p: 'ils', faux: ['fixer', 'filer'] },
  { v: 'pouvoir', t: 'futur', p: 'il', faux: ['pourrir', 'pousser'] },
  { v: 'voir', t: 'futur', p: 'nous', faux: ['verser', 'vernir'] },
  { v: 'vouloir', t: 'présent', p: 'ils', faux: ['voler', 'veiller'] },
  { v: 'aller', t: 'futur', p: 'ils', faux: ['rire', 'lire'] },
  { v: 'aller', t: 'présent', p: 'je', faux: ['valoir', 'vider'] },
  { v: 'dire', t: 'passé simple', p: 'nous', faux: ['dîner', 'diminuer'] },
  { v: 'être', t: 'passé simple', p: 'il', faux: ['fumer', 'finir'] },
  { v: 'avoir', t: 'futur', p: 'tu', faux: ['aimer', 'aider'] },
];

// ───────────────────────── Faits des formes ─────────────────────────

/** Sujets tels qu'ils figurent sur les pages de conjugaison. */
const SUJETS_PAGE: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle/on',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
};

const sujetPage = (p: Personne): SujetAccorde => ({ texte: SUJETS_PAGE[p], personne: p, genre: 'm' });

/** Plus-que-parfait de chaque verbe, tel qu'il se lit sur la page (« … » remplace la prononciation). */
const VERBES_PQP: readonly VerbeTemps[] = [
  'chanter',
  'jouer',
  'parler',
  'danser',
  'marcher',
  'sauter',
  'regarder',
  'écouter',
  'dessiner',
  'porter',
  'trouver',
  'aimer',
  'manger',
  'avancer',
  'finir',
  'choisir',
  'remplir',
  'rougir',
  'réussir',
  'applaudir',
  'bondir',
  'obéir',
  ...VERBES_3,
];

const CONJUGAISONS_PQP: readonly Fait[] = VERBES_PQP.map((v) => ({
  id: `plus-que-parfait-${v}`,
  source: sourceDe(v),
  citation: PERSONNES.map((p) => avecSujet(SUJETS_PAGE[p], plusQueParfait(v, sujetPage(p)))).join(' … '),
}));

const CONJUGAISONS_1: readonly Fait[] = VERBES_1.flatMap((v) =>
  (['imparfait', 'futur'] as const).map((t) => ({
    id: `${t}-1-${v}`,
    source: sourceDe(v),
    citation: PERSONNES.map((p) => avecSujet(SUJETS_PAGE[p], conjugue1(t, v, p))).join(' … '),
  })),
);

export const FAITS_TEMPS_COMPOSES: readonly Fait[] = [...REGLES, ...CONJUGAISONS_PQP, ...CONJUGAISONS_1];

export const faitTempsComposes = (id: string): Fait => {
  const x = FAITS_TEMPS_COMPOSES.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités et des verbes travaillés par une notion. */
export const sourcesTempsComposes = (faits: readonly string[], verbes: readonly Verbe[]): string[] => [
  ...new Set([PROGRAMME, ...faits.map((id) => faitTempsComposes(id).source), ...verbes.map(sourceDe)]),
];

/** Sujets à genre connu ou pronoms sans « je » : l'élision « j’ » ne laisse jamais un trou ambigu. */
export const sansJe = (liste: readonly Sujet[]): Sujet[] => liste.filter((s) => s.personne !== 'je');
