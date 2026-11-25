/**
 * Données du chapitre « Le passé simple » (CM2) : faits cités, formes du passé simple relevées sur les pages de
 * conjugaison du CNRTL et phrases écrites pour l'exercice. Chaque fait porte l'identifiant de sa source (registre
 * `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';
import { PERSONNES, avecSujet, forme, sourceDe, type Personne, type Verbe } from './present.donnees.ts';
import { VERBES_TEMPS, conjugue, type VerbeTemps } from './temps.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);

const REGLES: readonly Fait[] = [
  prog(
    'ps-a-memoriser',
    'Conjugaisons à mémoriser et à maîtriser : passé simple, plus-que-parfait des verbes être et avoir, des verbes des premier et deuxième groupes, des verbes irréguliers du troisième groupe : faire, aller, dire, venir, pouvoir, voir, vouloir, prendre',
  ),
  prog(
    'ps-marques',
    'Identifier dans la terminaison des verbes conjugués : la marque de temps et la marque de personne',
  ),
  prog(
    'ps-radicaux',
    'L’enseignement de la conjugaison s’attache à l’identification des radicaux verbaux et de leurs terminaisons (marques de temps et de personne).',
  ),
  gram('ps-temps-simples', 'Temps simples : présent, imparfait, futur, passé simple, conditionnel présent'),
  gram('ps-chantai', 'Passé simple : je chantai'),
  gram('ps-imparfait-chantais', 'Imparfait : je chantais'),
  gram('ps-parlai-sortis', 'Passé simple : je parlai ; je sortis'),
  gram(
    'ps-indicatif-passe',
    'il permet de situer l’action désignée par le verbe dans le passé (passé simple et imparfait)',
  ),
  gram('ps-recit', 'Le récit, très souvent au passé simple ou à l’imparfait'),
  gram(
    'ps-marque-ai',
    'la désinence -aient comporte une marque de temps -ai- (que l’on retrouve dans je chantais, il chantait, etc.)',
  ),
  gram(
    'ps-groupe-1',
    'Les verbes du premier groupe sont ceux qui présentent un infinitif en -er. Ils se conjuguent à partir d’un seul radical, sur le modèle de chanter.',
  ),
  gram(
    'ps-groupe-2',
    'Les verbes du deuxième groupe présentent un infinitif en -ir et plusieurs formes de leur radical en -iss-',
  ),
  gram('ps-aller', 'le verbe aller n’est pas classé dans ce groupe, en dépit de sa forme d’infinitif'),
  gram('ps-plusieurs-radicaux', 'verbes à plus de trois radicaux : auxiliaires être et avoir ; savoir, pouvoir, aller'),
  fait('academie-cedille')('ps-cedille', 'pour indiquer qu’elle se prononce comme un s sourd'),
  fait('academie-g')(
    'ps-g-doux',
    'Pour obtenir la même prononciation devant les voyelles a, o, u, on intercale un e entre le g et cette voyelle',
  ),
];

// ───────────────────────── Formes du passé simple ─────────────────────────

/**
 * Passé simple de l'indicatif relevé sur la page de conjugaison du CNRTL de chaque verbe (portail lexical,
 * morphologie), dans l'ordre je, tu, il, nous, vous, ils.
 */
const PASSE_SIMPLE = {
  chanter: 'chantai chantas chanta chantâmes chantâtes chantèrent',
  jouer: 'jouai jouas joua jouâmes jouâtes jouèrent',
  parler: 'parlai parlas parla parlâmes parlâtes parlèrent',
  danser: 'dansai dansas dansa dansâmes dansâtes dansèrent',
  marcher: 'marchai marchas marcha marchâmes marchâtes marchèrent',
  sauter: 'sautai sautas sauta sautâmes sautâtes sautèrent',
  regarder: 'regardai regardas regarda regardâmes regardâtes regardèrent',
  écouter: 'écoutai écoutas écouta écoutâmes écoutâtes écoutèrent',
  dessiner: 'dessinai dessinas dessina dessinâmes dessinâtes dessinèrent',
  porter: 'portai portas porta portâmes portâtes portèrent',
  trouver: 'trouvai trouvas trouva trouvâmes trouvâtes trouvèrent',
  aimer: 'aimai aimas aima aimâmes aimâtes aimèrent',
  manger: 'mangeai mangeas mangea mangeâmes mangeâtes mangèrent',
  avancer: 'avançai avanças avança avançâmes avançâtes avancèrent',
  commencer: 'commençai commenças commença commençâmes commençâtes commencèrent',
  lancer: 'lançai lanças lança lançâmes lançâtes lancèrent',
  nager: 'nageai nageas nagea nageâmes nageâtes nagèrent',
  ranger: 'rangeai rangeas rangea rangeâmes rangeâtes rangèrent',
  finir: 'finis finis finit finîmes finîtes finirent',
  choisir: 'choisis choisis choisit choisîmes choisîtes choisirent',
  remplir: 'remplis remplis remplit remplîmes remplîtes remplirent',
  rougir: 'rougis rougis rougit rougîmes rougîtes rougirent',
  réussir: 'réussis réussis réussit réussîmes réussîtes réussirent',
  applaudir: 'applaudis applaudis applaudit applaudîmes applaudîtes applaudirent',
  bondir: 'bondis bondis bondit bondîmes bondîtes bondirent',
  obéir: 'obéis obéis obéit obéîmes obéîtes obéirent',
  grandir: 'grandis grandis grandit grandîmes grandîtes grandirent',
  être: 'fus fus fut fûmes fûtes furent',
  avoir: 'eus eus eut eûmes eûtes eurent',
  faire: 'fis fis fit fîmes fîtes firent',
  aller: 'allai allas alla allâmes allâtes allèrent',
  dire: 'dis dis dit dîmes dîtes dirent',
  venir: 'vins vins vint vînmes vîntes vinrent',
  pouvoir: 'pus pus put pûmes pûtes purent',
  voir: 'vis vis vit vîmes vîtes virent',
  vouloir: 'voulus voulus voulut voulûmes voulûtes voulurent',
  prendre: 'pris pris prit prîmes prîtes prirent',
} as const satisfies Partial<Record<Verbe, string>>;

export type VerbePs = keyof typeof PASSE_SIMPLE;
export const VERBES_PS = Object.keys(PASSE_SIMPLE) as VerbePs[];

export const passeSimple = (v: VerbePs, p: Personne): string => PASSE_SIMPLE[v].split(' ')[PERSONNES.indexOf(p)] ?? '';

/** Présent du même verbe (formes déjà relevées au CM1). */
export const present = (v: VerbePs, p: Personne): string => forme(v, p);

/** Verbes dont l'imparfait est relevé au CM1 (`temps.donnees.ts`). */
export const VERBES_IMPARFAIT: readonly (VerbePs & VerbeTemps)[] = VERBES_PS.filter((v): v is VerbePs & VerbeTemps =>
  (VERBES_TEMPS as readonly string[]).includes(v),
);
export const imparfait = (v: VerbePs & VerbeTemps, p: Personne): string => conjugue('imparfait', v, p);

// ───────────────────────── Verbes par notion ─────────────────────────

/** Premier groupe : radical qui ne change jamais. */
export const ER_REGULIERS: readonly VerbePs[] = [
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
];
/** Premier groupe : un e après le g, ou une cédille sous le c, devant a. */
export const ER_GER: readonly VerbePs[] = ['manger', 'nager', 'ranger'];
export const ER_CER: readonly VerbePs[] = ['avancer', 'commencer', 'lancer'];
export const ER_VARIANTES: readonly VerbePs[] = [...ER_GER, ...ER_CER];

export const IR_DEUXIEME: readonly VerbePs[] = [
  'finir',
  'choisir',
  'remplir',
  'rougir',
  'réussir',
  'applaudir',
  'bondir',
  'obéir',
  'grandir',
];

export const ETRE_AVOIR: readonly VerbePs[] = ['être', 'avoir'];

/** Les huit verbes irréguliers du troisième groupe cités par le programme. */
export const HUIT_IRREGULIERS: readonly VerbePs[] = [
  'faire',
  'aller',
  'dire',
  'venir',
  'pouvoir',
  'voir',
  'vouloir',
  'prendre',
];

/** Fin de phrase de chaque verbe, valable avec tous les sujets. Phrases écrites pour l'exercice. */
export const FINS_PS: Record<VerbePs, string> = {
  chanter: 'une chanson',
  jouer: 'au ballon',
  parler: 'à voix basse',
  danser: 'dans la cour',
  marcher: 'vers la forêt',
  sauter: 'dans la flaque',
  regarder: 'les étoiles',
  écouter: 'le conteur',
  dessiner: 'un dragon',
  porter: 'le panier',
  trouver: 'la clé',
  aimer: 'ce spectacle',
  manger: 'la tarte',
  avancer: 'vers la porte',
  commencer: 'la partie',
  lancer: 'la balle',
  nager: 'dans le lac',
  ranger: 'la cabane',
  finir: 'le puzzle',
  choisir: 'un livre',
  remplir: 'la gourde',
  rougir: 'de plaisir',
  réussir: 'le tour de magie',
  applaudir: 'les artistes',
  bondir: 'de joie',
  obéir: 'au capitaine',
  grandir: 'très vite',
  être: 'en retard',
  avoir: 'peur',
  faire: 'un gâteau',
  aller: 'à la plage',
  dire: 'la vérité',
  venir: 'à la fête',
  pouvoir: 'entrer',
  voir: 'la mer',
  vouloir: 'ce cadeau',
  prendre: 'le bus',
};

/** Débuts de récit (phrases écrites pour l'exercice) : un complément de temps, puis la phrase. */
export const DEBUTS_RECIT: readonly string[] = [
  'Ce jour-là,',
  'Soudain,',
  'Le lendemain,',
  'Un matin,',
  'Tout à coup,',
  'Ce soir-là,',
];

/**
 * Passés simples fautifs tentants (personne « il », puis « ils ») : la voyelle d'un autre modèle (a au lieu de i,
 * i au lieu de a), avec le radical de l'infinitif ou du présent gardé à tort.
 */
export const VOYELLE_FAUTIVE: Record<VerbePs, readonly [string, string]> = {
  chanter: ['chantit', 'chantirent'],
  jouer: ['jouit', 'jouirent'],
  parler: ['parlit', 'parlirent'],
  danser: ['dansit', 'dansirent'],
  marcher: ['marchit', 'marchirent'],
  sauter: ['sautit', 'sautirent'],
  regarder: ['regardit', 'regardirent'],
  écouter: ['écoutit', 'écoutirent'],
  dessiner: ['dessinit', 'dessinirent'],
  porter: ['portit', 'portirent'],
  trouver: ['trouvit', 'trouvirent'],
  aimer: ['aimit', 'aimirent'],
  manger: ['mangit', 'mangirent'],
  avancer: ['avancit', 'avancirent'],
  commencer: ['commencit', 'commencirent'],
  lancer: ['lancit', 'lancirent'],
  nager: ['nagit', 'nagirent'],
  ranger: ['rangit', 'rangirent'],
  finir: ['fina', 'finèrent'],
  choisir: ['choisa', 'choisèrent'],
  remplir: ['rempla', 'remplèrent'],
  rougir: ['rouga', 'rougèrent'],
  réussir: ['réussa', 'réussèrent'],
  applaudir: ['applauda', 'applaudèrent'],
  bondir: ['bonda', 'bondèrent'],
  obéir: ['obéa', 'obéèrent'],
  grandir: ['granda', 'grandèrent'],
  être: ['êta', 'êtèrent'],
  avoir: ['ava', 'avèrent'],
  faire: ['faisa', 'faisèrent'],
  aller: ['allit', 'allirent'],
  dire: ['disa', 'disèrent'],
  venir: ['venit', 'venirent'],
  pouvoir: ['pouva', 'pouvèrent'],
  voir: ['voya', 'voyèrent'],
  vouloir: ['voulit', 'voulirent'],
  prendre: ['prena', 'prenèrent'],
};

// ───────────────────────── Faits ─────────────────────────

/** Sujets tels qu'ils figurent sur les pages de conjugaison. */
const SUJETS_PAGE: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle/on',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
};

/** Une ligne par verbe : les formes telles qu'elles se lisent sur la page (« … » remplace la prononciation). */
const CONJUGAISONS: readonly Fait[] = VERBES_PS.map((v) => ({
  id: `passe-simple-${v}`,
  source: sourceDe(v),
  citation: PERSONNES.map((p) => avecSujet(SUJETS_PAGE[p], passeSimple(v, p))).join(' … '),
}));

export const FAITS_PASSE_SIMPLE: readonly Fait[] = [...REGLES, ...CONJUGAISONS];

export const faitPasseSimple = (id: string): Fait => {
  const x = FAITS_PASSE_SIMPLE.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités et des verbes travaillés par une notion. */
export const sourcesPasseSimple = (faits: readonly string[], verbes: readonly VerbePs[]): string[] => [
  ...new Set([PROGRAMME, ...faits.map((id) => faitPasseSimple(id).source), ...verbes.map(sourceDe)]),
];
