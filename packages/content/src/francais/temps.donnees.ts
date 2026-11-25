/**
 * Données du chapitre « Imparfait, futur et passé composé » (CM1) : faits cités, formes des verbes du programme et
 * phrases écrites pour l'exercice. Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation.
 */
import type { Fait } from './phrases.donnees.ts';
import { PERSONNES, avecSujet, forme, sourceDe, type Personne, type Sujet, type Verbe } from './present.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);
/** Fait tiré d'un article du Dictionnaire de l'Académie française (`source` : identifiant du registre). */
const acad = (id: string, article: string, citation: string): Fait => fait(`academie-${article}`)(id, citation);

const REGLES: readonly Fait[] = [
  prog('marques-temps', 'Savoir isoler et connaître les marques de temps de l’imparfait (-ai-, -i-) ; du futur (-r-)'),
  prog('marques-personne', 'Connaître les marques de personne pour le présent de l’indicatif, l’imparfait et le futur'),
  prog(
    'a-memoriser',
    'Conjugaisons à mémoriser et à maîtriser : présent de l’indicatif, imparfait, futur, passé composé des verbes être et avoir, des verbes du premier et du deuxième groupe et des verbes irréguliers du troisième groupe (faire, aller, dire, venir, pouvoir, voir, vouloir, prendre)',
  ),
  prog(
    'composition',
    'Connaître la composition du passé composé en deux parties (auxiliaire + participe passé) ; retrouver la forme infinitive du verbe',
  ),
  prog(
    'negation',
    'Effectuer la transformation à la forme négative d’un verbe au passé composé en insérant les adverbes de négation à leur juste place',
  ),
  prog('accord-etre', 'Accorder le participe passé avec le sujet dans le cas de l’emploi avec l’auxiliaire être'),
  gram(
    'marque-ai',
    'la désinence -aient comporte une marque de temps -ai- (que l’on retrouve dans je chantais, il chantait, etc.) et une marque de personne -ent',
  ),
  gram('temps-composes', 'formé au moyen de l’auxiliaire être ou avoir et du participe passé'),
  gram('exemples-composes', 'Passé composé : j’ai parlé ; je suis sorti(e)'),
  gram(
    'participe-forme',
    'le participe est utilisé pour former les formes composées des temps du verbe (Elle a chanté ; Elle est partie)',
  ),
  gram(
    'forme-negative',
    'La phrase de forme négative se caractérise par la présence d’adverbes de négation, du type ne…pas, ne… plus, ne…jamais, etc.',
  ),
  acad(
    'ne-auxiliaire',
    'ne',
    "Si le verbe est à un mode personnel, ce verbe ou, dans les formes composées, son auxiliaire, s'intercale entre ne et pas, ne et point, ne et guère",
  ),
  acad('ne-elision', 'ne', "adverbe de négation (s'élide devant une voyelle ou un h muet)"),
  acad('jamais', 'jamais', 'Avec la particule négative ne.'),
  acad('cedille', 'cedille', 'pour indiquer qu’elle se prononce comme un s sourd'),
  acad(
    'g-doux',
    'g',
    'Pour obtenir la même prononciation devant les voyelles a, o, u, on intercale un e entre le g et cette voyelle',
  ),
  acad('auxiliaires', 'auxiliaire', '« Avoir » et « être » sont les verbes auxiliaires par excellence.'),
];

// ───────────────────────── Formes ─────────────────────────

/**
 * Relevés sur la page de conjugaison du CNRTL de chaque verbe : imparfait puis futur simple (je, tu, il, nous, vous,
 * ils), puis participe passé (au masculin singulier, tel qu'il apparaît au passé composé).
 */
const TABLE = {
  chanter: [
    'chantais chantais chantait chantions chantiez chantaient',
    'chanterai chanteras chantera chanterons chanterez chanteront',
    'chanté',
  ],
  jouer: ['jouais jouais jouait jouions jouiez jouaient', 'jouerai joueras jouera jouerons jouerez joueront', 'joué'],
  parler: [
    'parlais parlais parlait parlions parliez parlaient',
    'parlerai parleras parlera parlerons parlerez parleront',
    'parlé',
  ],
  danser: [
    'dansais dansais dansait dansions dansiez dansaient',
    'danserai danseras dansera danserons danserez danseront',
    'dansé',
  ],
  marcher: [
    'marchais marchais marchait marchions marchiez marchaient',
    'marcherai marcheras marchera marcherons marcherez marcheront',
    'marché',
  ],
  sauter: [
    'sautais sautais sautait sautions sautiez sautaient',
    'sauterai sauteras sautera sauterons sauterez sauteront',
    'sauté',
  ],
  regarder: [
    'regardais regardais regardait regardions regardiez regardaient',
    'regarderai regarderas regardera regarderons regarderez regarderont',
    'regardé',
  ],
  écouter: [
    'écoutais écoutais écoutait écoutions écoutiez écoutaient',
    'écouterai écouteras écoutera écouterons écouterez écouteront',
    'écouté',
  ],
  dessiner: [
    'dessinais dessinais dessinait dessinions dessiniez dessinaient',
    'dessinerai dessineras dessinera dessinerons dessinerez dessineront',
    'dessiné',
  ],
  porter: [
    'portais portais portait portions portiez portaient',
    'porterai porteras portera porterons porterez porteront',
    'porté',
  ],
  trouver: [
    'trouvais trouvais trouvait trouvions trouviez trouvaient',
    'trouverai trouveras trouvera trouverons trouverez trouveront',
    'trouvé',
  ],
  aimer: ['aimais aimais aimait aimions aimiez aimaient', 'aimerai aimeras aimera aimerons aimerez aimeront', 'aimé'],
  manger: [
    'mangeais mangeais mangeait mangions mangiez mangeaient',
    'mangerai mangeras mangera mangerons mangerez mangeront',
    'mangé',
  ],
  avancer: [
    'avançais avançais avançait avancions avanciez avançaient',
    'avancerai avanceras avancera avancerons avancerez avanceront',
    'avancé',
  ],
  finir: [
    'finissais finissais finissait finissions finissiez finissaient',
    'finirai finiras finira finirons finirez finiront',
    'fini',
  ],
  choisir: [
    'choisissais choisissais choisissait choisissions choisissiez choisissaient',
    'choisirai choisiras choisira choisirons choisirez choisiront',
    'choisi',
  ],
  remplir: [
    'remplissais remplissais remplissait remplissions remplissiez remplissaient',
    'remplirai rempliras remplira remplirons remplirez rempliront',
    'rempli',
  ],
  rougir: [
    'rougissais rougissais rougissait rougissions rougissiez rougissaient',
    'rougirai rougiras rougira rougirons rougirez rougiront',
    'rougi',
  ],
  réussir: [
    'réussissais réussissais réussissait réussissions réussissiez réussissaient',
    'réussirai réussiras réussira réussirons réussirez réussiront',
    'réussi',
  ],
  applaudir: [
    'applaudissais applaudissais applaudissait applaudissions applaudissiez applaudissaient',
    'applaudirai applaudiras applaudira applaudirons applaudirez applaudiront',
    'applaudi',
  ],
  bondir: [
    'bondissais bondissais bondissait bondissions bondissiez bondissaient',
    'bondirai bondiras bondira bondirons bondirez bondiront',
    'bondi',
  ],
  obéir: [
    'obéissais obéissais obéissait obéissions obéissiez obéissaient',
    'obéirai obéiras obéira obéirons obéirez obéiront',
    'obéi',
  ],
  être: ['étais étais était étions étiez étaient', 'serai seras sera serons serez seront', 'été'],
  avoir: ['avais avais avait avions aviez avaient', 'aurai auras aura aurons aurez auront', 'eu'],
  faire: ['faisais faisais faisait faisions faisiez faisaient', 'ferai feras fera ferons ferez feront', 'fait'],
  aller: ['allais allais allait allions alliez allaient', 'irai iras ira irons irez iront', 'allé'],
  dire: ['disais disais disait disions disiez disaient', 'dirai diras dira dirons direz diront', 'dit'],
  venir: [
    'venais venais venait venions veniez venaient',
    'viendrai viendras viendra viendrons viendrez viendront',
    'venu',
  ],
  pouvoir: [
    'pouvais pouvais pouvait pouvions pouviez pouvaient',
    'pourrai pourras pourra pourrons pourrez pourront',
    'pu',
  ],
  voir: ['voyais voyais voyait voyions voyiez voyaient', 'verrai verras verra verrons verrez verront', 'vu'],
  vouloir: [
    'voulais voulais voulait voulions vouliez voulaient',
    'voudrai voudras voudra voudrons voudrez voudront',
    'voulu',
  ],
  prendre: [
    'prenais prenais prenait prenions preniez prenaient',
    'prendrai prendras prendra prendrons prendrez prendront',
    'pris',
  ],
} as const satisfies Partial<Record<Verbe, readonly [string, string, string]>>;

export type VerbeTemps = keyof typeof TABLE;
export const VERBES_TEMPS = Object.keys(TABLE) as VerbeTemps[];

export type TempsSimple = 'imparfait' | 'futur';

export const conjugue = (t: TempsSimple, v: VerbeTemps, p: Personne): string =>
  TABLE[v][t === 'imparfait' ? 0 : 1].split(' ')[PERSONNES.indexOf(p)] ?? '';

export const participe = (v: VerbeTemps): string => TABLE[v][2];

/** Verbes qui forment leur passé composé avec « être » (relevés sur leur page de conjugaison). */
const AVEC_ETRE: readonly VerbeTemps[] = ['aller', 'venir'];
export const auxiliaireDe = (v: VerbeTemps): 'être' | 'avoir' => (AVEC_ETRE.includes(v) ? 'être' : 'avoir');

export interface SujetAccorde extends Sujet {
  /** Genre connu : nécessaire pour accorder le participe passé avec « être ». */
  readonly genre?: 'm' | 'f';
}

/** Participe passé tel qu'il s'écrit avec ce sujet : accordé avec « être », invariable ici avec « avoir ». */
export const participeAccorde = (v: VerbeTemps, s: SujetAccorde): string => {
  if (auxiliaireDe(v) === 'avoir') return participe(v);
  if (!s.genre) throw new Error(`genre inconnu : ${s.texte}`);
  const pluriel = s.personne === 'nous' || s.personne === 'vous' || s.personne === 'ils';
  return `${participe(v)}${s.genre === 'f' ? 'e' : ''}${pluriel ? 's' : ''}`;
};

export const auxiliaire = (v: VerbeTemps, p: Personne): string => forme(auxiliaireDe(v), p);

/** Groupe verbal au passé composé : « as chanté », « est allée ». */
export const passeCompose = (v: VerbeTemps, s: SujetAccorde): string =>
  `${auxiliaire(v, s.personne)} ${participeAccorde(v, s)}`;

export type Negation = 'pas' | 'jamais' | 'plus';

/** « ne » devient « n’ » devant une voyelle. */
export const neDevant = (mot: string): 'n’' | 'ne ' => (/^[aeéêiouh]/.test(mot) ? 'n’' : 'ne ');

/** Groupe verbal négatif : les mots de négation encadrent l'auxiliaire. */
export const negatif = (v: VerbeTemps, s: SujetAccorde, adverbe: Negation): string => {
  const aux = auxiliaire(v, s.personne);
  return `${neDevant(aux)}${aux} ${adverbe} ${participeAccorde(v, s)}`;
};

/** Phrase au passé composé, à la forme positive (« J’ai chanté la chanson. »). */
export const phrasePositive = (s: SujetAccorde, v: VerbeTemps): string =>
  `${avecSujet(s.texte, passeCompose(v, s))} ${FINS[v]}.`;

// ───────────────────────── Faits des formes ─────────────────────────

export type TempsCite = TempsSimple | 'compose';

/** Sujets tels qu'ils figurent sur les pages de conjugaison. */
const SUJETS_PAGE: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle/on',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
};

const ligne = (v: VerbeTemps, t: TempsCite): string =>
  PERSONNES.map((p) =>
    avecSujet(
      SUJETS_PAGE[p],
      t === 'compose' ? passeCompose(v, { texte: p, personne: p, genre: 'm' }) : conjugue(t, v, p),
    ),
  ).join(' … ');

const CONJUGAISONS: readonly Fait[] = VERBES_TEMPS.flatMap((v) =>
  (['imparfait', 'futur', 'compose'] as const).map((t) => ({
    id: `${t}-${v}`,
    source: sourceDe(v),
    citation: ligne(v, t),
  })),
);

export const FAITS_TEMPS: readonly Fait[] = [...REGLES, ...CONJUGAISONS];

export const faitTemps = (id: string): Fait => {
  const x = FAITS_TEMPS.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités et des verbes travaillés par une notion. */
export const sourcesTemps = (faits: readonly string[], verbes: readonly Verbe[]): string[] => [
  ...new Set([PROGRAMME, ...faits.map((id) => faitTemps(id).source), ...verbes.map(sourceDe)]),
];

// ───────────────────────── Phrases et verbes par groupe ─────────────────────────

/** Fin de phrase de chaque verbe, valable avec tous les sujets, à la forme positive comme négative. */
export const FINS: Record<VerbeTemps, string> = {
  chanter: 'la chanson',
  jouer: 'au ballon',
  parler: 'à voix basse',
  danser: 'dans la cour',
  marcher: 'vers l’école',
  sauter: 'très haut',
  regarder: 'le ciel',
  écouter: 'la maîtresse',
  dessiner: 'ce dragon',
  porter: 'le sac',
  trouver: 'la réponse',
  aimer: 'ce film',
  manger: 'la soupe',
  avancer: 'vers la porte',
  finir: 'le puzzle',
  choisir: 'ce livre',
  remplir: 'la gourde',
  rougir: 'de plaisir',
  réussir: 'le tour de magie',
  applaudir: 'les artistes',
  bondir: 'de joie',
  obéir: 'à la consigne',
  être: 'en retard',
  avoir: 'peur',
  faire: 'le gâteau',
  aller: 'à la piscine',
  dire: 'la vérité',
  venir: 'à la fête',
  pouvoir: 'entrer',
  voir: 'la mer',
  vouloir: 'ce cadeau',
  prendre: 'le bus',
};

/** Verbes en -er dont le radical ne change jamais. */
export const REGULIERS_ER: readonly VerbeTemps[] = [
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
export const REGULIERS_IR: readonly VerbeTemps[] = [
  'finir',
  'choisir',
  'remplir',
  'rougir',
  'réussir',
  'applaudir',
  'bondir',
  'obéir',
];
export const REGULIERS: readonly VerbeTemps[] = [...REGULIERS_ER, ...REGULIERS_IR];

/** Être, avoir et les huit verbes irréguliers du troisième groupe cités par le programme. */
export const IRREGULIERS_CITES: readonly VerbeTemps[] = [
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

const accorde = (texte: string, personne: Personne, genre: 'm' | 'f'): SujetAccorde => ({ texte, personne, genre });

/** Sujets au genre connu (verbes conjugués avec « être »). Aucun prénom. */
export const SUJETS_ACCORDES: readonly SujetAccorde[] = [
  accorde('Il', 'il', 'm'),
  accorde('Elle', 'il', 'f'),
  accorde('Mon voisin', 'il', 'm'),
  accorde('La fille', 'il', 'f'),
  accorde('La sœur de mes copains', 'il', 'f'),
  accorde('Ils', 'ils', 'm'),
  accorde('Elles', 'ils', 'f'),
  accorde('Les garçons', 'ils', 'm'),
  accorde('Mes copines', 'ils', 'f'),
  accorde('Le garçon et la fille', 'ils', 'm'),
];

/** Participes passés fautifs tentants, pour les verbes irréguliers. */
export const PARTICIPES_FAUTIFS: Partial<Record<VerbeTemps, readonly string[]>> = {
  être: ['êtré', 'étais'],
  avoir: ['avé', 'eut'],
  faire: ['faisé', 'fais'],
  aller: ['alli', 'allais'],
  dire: ['disé', 'di'],
  venir: ['veni', 'venir'],
  pouvoir: ['pouvé', 'peu'],
  voir: ['voyé', 'voit'],
  vouloir: ['voulé', 'veut'],
  prendre: ['prendu', 'prit'],
};

/** Infinitifs fautifs tentants : un autre mot qui ressemble au participe passé. */
export const INFINITIFS_FAUTIFS: Partial<Record<VerbeTemps, string>> = {
  pouvoir: 'puer',
  voir: 'vivre',
  prendre: 'prier',
  dire: 'diter',
  faire: 'faiter',
};

/** Radicaux au futur fautifs tentants (l'infinitif gardé à tort), pour la personne « il ». */
export const FUTURS_FAUTIFS: Partial<Record<VerbeTemps, string>> = {
  être: 'êtrera',
  avoir: 'avoira',
  faire: 'faira',
  aller: 'allera',
  venir: 'venira',
  pouvoir: 'pouvoira',
  voir: 'voira',
  vouloir: 'voulera',
  prendre: 'prendera',
  dire: 'disera',
};
