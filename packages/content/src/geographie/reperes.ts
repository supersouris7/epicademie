import type { Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { zoneIds, zoneName, type MapId } from '../cartes.ts';
import { LIGNES_DEPARTEMENTS } from './departements-insee.ts';
import { notion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * CM2, « Repères : France et Europe » (lot ge-cm2-04) : compétence du cycle 3 « Nommer et localiser les grands repères
 * géographiques ». Sources du registre avec citation exacte : INSEE (fichier des départements), Union européenne (fiches
 * des États membres, faits et chiffres), Dictionnaire de l’Académie française. La position des zones vient du registre
 * des cartes. Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

type Wrong = { readonly label: string; readonly why: string };

// ——— Outils de carte ———

const nom = (map: MapId, zone: string) => zoneName(map, zone) ?? zone;

interface Lieu {
  readonly zone: string;
  /** Texte qui désigne le lieu dans la consigne (nom, numéro, capitale…). */
  readonly cible: string;
}

/** Toucher une zone : les erreurs typiques nomment la zone touchée. */
function toucher(
  rng: Rng,
  map: MapId,
  pool: readonly Lieu[],
  prompt: (l: Lieu) => string,
  hint: string,
): QuestionDraft {
  const l = rng.pick(pool);
  const traps: Trap[] = rng
    .shuffle(pool.filter((o) => o.zone !== l.zone))
    .slice(0, 2)
    .map((o) => ({ zone: o.zone, why: `Tu as touché : ${nom(map, o.zone)}. Cherche encore ${l.cible}.` }));
  return {
    prompt: prompt(l),
    figure: { kind: 'map', map },
    answer: { kind: 'zone', map, zone: l.zone },
    traps,
    hint,
    steps: [
      `On cherche ${l.cible} sur la carte.`,
      'On part d’un endroit connu, puis on avance : nord, sud, est ou ouest.',
      `La bonne zone est **${nom(map, l.zone)}**.`,
    ],
    targetSeconds: 35,
  };
}

/** Trois zones repérées A, B, C : quelle lettre montre la cible ? */
function troisReperes(rng: Rng, map: MapId, pool: readonly Lieu[], hint: string): QuestionDraft {
  const lieux = rng.shuffle([...pool]).slice(0, 3);
  const reperes = lieux.map((l, i) => ({ ...l, label: 'ABC'.charAt(i) }));
  const target = rng.pick(reperes);
  const wrong = reperes
    .filter((r) => r !== target)
    .map((r) => ({ label: r.label, why: `Le repère ${r.label} montre : ${nom(map, r.zone)}.` }));
  return {
    prompt: `Observe les trois repères. Lequel montre ${target.cible} ?`,
    figure: {
      kind: 'map',
      map,
      highlight: reperes.map((r) => r.zone),
      marks: reperes.map((r) => ({ zone: r.zone, label: r.label })),
    },
    ...choice(rng, target.label, wrong, true),
    hint,
    steps: [
      `On cherche ${target.cible}.`,
      'On compare la place de chaque lettre sur la carte.',
      `C’est le repère **${target.label}** : ${nom(map, target.zone)}.`,
    ],
    targetSeconds: 45,
  };
}

/** Une zone repérée A : la nommer parmi `n` propositions. */
function repereA(
  rng: Rng,
  map: MapId,
  { pool, n, quoi }: { readonly pool: readonly string[]; readonly n: number; readonly quoi: string },
  hint: string,
): QuestionDraft {
  const zone = rng.pick(pool);
  const wrong = rng
    .shuffle(pool.filter((z) => z !== zone))
    .slice(0, n - 1)
    .map((z) => ({ label: nom(map, z), why: `Ce n’est pas ici : « ${nom(map, z)} » est ailleurs sur la carte.` }));
  return {
    prompt: `Sur cette carte, ${quoi} porte le repère A ?`,
    figure: { kind: 'map', map, highlight: [zone], marks: [{ zone, label: 'A' }] },
    ...choice(rng, nom(map, zone), wrong),
    hint,
    steps: [
      'Regarde où est posée la lettre A.',
      'Compare avec ce que tu connais tout autour.',
      `Le repère A montre : **${nom(map, zone)}**.`,
    ],
    targetSeconds: 25,
  };
}

// ——— Notion 1 : départements ———

const INSEE = 'insee-cog-2025-departements';

interface Departement {
  readonly code: string;
  readonly name: string;
  readonly ligne: string;
}

/** Départements lus dans les lignes officielles (1re colonne : code ; dernière : nom). */
export const DEPARTEMENTS_INSEE: readonly Departement[] = LIGNES_DEPARTEMENTS.map((ligne) => {
  const cells = ligne.slice(1, -1).split('","');
  return { code: cells[0] ?? '', name: cells[6] ?? '', ligne };
});

const dep = (code: string): Departement => {
  const d = DEPARTEMENTS_INSEE.find((x) => x.code === code);
  if (!d) throw new Error(`Département inconnu : ${code}`);
  return d;
};

/** Saisie d’un nom : avec ou sans traits d’union et accents (la notion ne porte pas sur l’orthographe). */
const ecritures = (name: string): string[] => {
  const sansAccent = name.normalize('NFD').replace(/\p{M}/gu, '');
  return [...new Set([name, sansAccent].flatMap((n) => [n, n.replaceAll('-', ' ')]))];
};

const liste = (d: Departement) => `Dans la liste de l’INSEE : numéro ${d.code}, département « ${d.name} ».`;

/** Fait « numéro → nom » ; les erreurs sont d’autres départements, avec leur vrai numéro. */
const numero = (code: string, autres: readonly string[]): Fait => {
  const d = dep(code);
  return {
    q: `Quel département porte le numéro ${code} ?`,
    a: d.name,
    wrong: autres.map((o) => ({ label: dep(o).name, why: `${dep(o).name} porte le numéro ${o}.` })),
    gap: [`Le département numéro ${code} s’appelle : `, '.', ecritures(d.name)],
    quote: d.ligne,
    montre: liste(d),
    explain: `Le numéro ${code} désigne ce département : ${d.name}.`,
    src: INSEE,
  };
};

/** Saisie « nom → numéro ». */
const code = (c: string, article: string, pieges: readonly [string, string]): Libre => {
  const d = dep(c);
  return {
    q: `quel est le numéro du département ${article}${d.name} ?`,
    accepted: c.startsWith('0') ? [c, c.slice(1)] : [c],
    traps: pieges.map((p) => ({ text: p, why: `Le numéro ${p} est celui d’un autre département : ${dep(p).name}.` })),
    quote: d.ligne,
    montre: liste(d),
    explain: `Ce département porte le numéro ${c}.`,
    src: INSEE,
  };
};

/** Grands départements, faciles à repérer sur la carte (bords de mer, frontières, Paris). */
const CARTE_DEPARTEMENTS = ['29', '33', '59', '13', '06', '64', '67', '50', '66', '56', '17', '40'];
/** Tous les départements de la carte (France métropolitaine). */
const METRO = zoneIds('france-departements');

/** Numéro → nom, tirés dans toute la liste officielle. */
function numeroAuHasard(rng: Rng): QuestionDraft {
  const [d, ...autres] = rng.shuffle([...DEPARTEMENTS_INSEE]).slice(0, 4) as [Departement, ...Departement[]];
  return {
    prompt: `Attention aux pièges ! Quel département porte le numéro ${d.code} ?`,
    ...choice(
      rng,
      d.name,
      autres.map((o) => ({ label: o.name, why: `${o.name} porte le numéro ${o.code}.` })),
    ),
    hint: 'Beaucoup de numéros suivent l’ordre alphabétique des noms.',
    steps: [liste(d), 'Chaque département a son propre numéro.', `La réponse est donc **${d.name}**.`],
    targetSeconds: 25,
  };
}

const carteDepartements = (rng: Rng, level: Level): QuestionDraft | undefined => {
  if (level === 1) return undefined;
  if (level === 2) return numeroAuHasard(rng);
  const lieux = (cible: (d: Departement) => string) =>
    CARTE_DEPARTEMENTS.filter((z) => METRO.includes(z)).map((z) => ({ zone: z, cible: cible(dep(z)) }));
  const hint = 'Pense aux bords de la carte : la mer et les pays voisins sont de bons repères.';
  if (level === 3) {
    return toucher(
      rng,
      'france-departements',
      lieux((d) => `le département « ${d.name} » (${d.code})`),
      (l) => `Touche ${l.cible} sur la carte.`,
      hint,
    );
  }
  if (level === 4) {
    return toucher(
      rng,
      'france-departements',
      lieux((d) => `le département numéro ${d.code}`),
      (l) => `Sans aide : touche ${l.cible} sur la carte.`,
      'Retrouve d’abord le nom qui va avec ce numéro.',
    );
  }
  return troisReperes(
    rng,
    'france-departements',
    lieux((d) => `le département numéro ${d.code}`),
    'Retrouve le nom qui va avec le numéro, puis cherche sa place.',
  );
};

const Q_DEPARTEMENT = 'Division administrative du territoire français.';
const Q_PREFECTURE = 'Lyon est la préfecture du département du Rhône.';

const departements: Notion = {
  classe: 'CM2',
  id: 'gcm2-departements',
  title: 'Les départements français',
  hint: 'Souvent, les numéros suivent l’ordre alphabétique. La Corse et l’outre-mer ont des numéros à part.',
  memo: [
    'La France est découpée en **départements**. Chacun a un nom et un numéro. Exemple : 29, c’est le Finistère.',
    'Beaucoup de numéros suivent l’ordre alphabétique : 01 Ain, 02 Aisne, 03 Allier. Paris porte le 75.',
    'Deux cas à part : la Corse (2A et 2B) et les départements d’**outre-mer** (de 971 à 976).',
  ],
  faits: [
    {
      q: 'En France, qu’est-ce qu’un département ?',
      a: 'une partie du territoire, pour l’administrer',
      wrong: [
        { label: 'un pays voisin de la France', why: 'Un département fait partie de la France.' },
        { label: 'une rue d’une ville', why: 'Un département est bien plus grand : il contient des communes.' },
        { label: 'un océan', why: 'Un océan est de l’eau salée. Un département est un territoire.' },
      ],
      gap: ['Un département est une division administrative du ', ' français.', ['territoire']],
      choix: ['territoire', 'continent', 'océan'],
      quote: Q_DEPARTEMENT,
      explain: 'La France est divisée en départements pour être administrée.',
      src: 'academie-departement',
    },
    numero('75', ['13', '59', '33']),
    numero('29', ['35', '56', '22']),
    numero('33', ['31', '34', '30']),
    numero('59', ['62', '69', '57']),
    numero('13', ['83', '31', '06']),
    numero('2A', ['2B', '06', '66']),
    numero('971', ['972', '973', '974']),
    {
      q: 'Quelle ville est la préfecture du département du Rhône ?',
      a: 'Lyon',
      wrong: [
        { label: 'Lille', why: 'Lille n’est pas dans le Rhône : elle est dans le Nord.' },
        { label: 'Bordeaux', why: 'Bordeaux n’est pas dans le Rhône : elle est en Gironde.' },
        { label: 'Marseille', why: 'Marseille n’est pas dans le Rhône : elle est dans les Bouches-du-Rhône.' },
      ],
      gap: ['La préfecture du département du Rhône est ', '.', ['Lyon']],
      quote: Q_PREFECTURE,
      explain: 'La préfecture est la ville où réside le préfet. Pour le Rhône, c’est Lyon.',
      src: 'academie-prefecture',
    },
  ],
  paires3: [
    ['Numéro 75', 'Paris'],
    ['Numéro 29', 'Finistère'],
    ['Numéro 33', 'Gironde'],
  ],
  paires5: [
    ['Numéro 59', 'Nord'],
    ['Numéro 13', 'Bouches-du-Rhône'],
    ['Numéro 2B', 'Haute-Corse'],
    ['Numéro 974', 'La Réunion'],
    ['Numéro 03', 'Allier'],
  ],
  ordre: ['Ain', 'Aisne', 'Allier', 'Alpes-de-Haute-Provence'],
  consigne: {
    prompt: 'Range ces départements selon leur numéro, du plus petit au plus grand.',
    hint: 'Pour ces départements, l’ordre alphabétique des noms t’aide.',
    why: 'Leurs numéros sont 01, 02, 03 et 04 : ils suivent ici l’ordre alphabétique.',
    fin: 'Le premier est',
    quote: dep('01').ligne,
    montre: liste(dep('01')),
    src: INSEE,
  },
  libres: [
    code('29', 'du ', ['35', '56']),
    code('59', 'du ', ['62', '69']),
    code('33', 'de la ', ['31', '34']),
    code('2B', 'de la ', ['2A', '06']),
    code('974', 'de ', ['971', '973']),
    code('03', 'de l’', ['01', '02']),
    code('13', 'des ', ['83', '84']),
    code('976', 'de ', ['974', '972']),
  ],
  docs: [
    {
      title: 'La plaque du colis',
      lines: [
        'Un colis part pour la Bretagne.',
        'Sur l’étiquette, le facteur lit le nom d’un département : Finistère.',
        'Un second colis va dans le département numéro 33.',
      ],
      qs: [
        {
          q: 'Quel numéro va avec le département du premier colis ?',
          a: '29',
          wrong: [
            { label: '33', why: 'Le 33 est le numéro du second colis : la Gironde.' },
            { label: '35', why: 'Le 35 est l’Ille-et-Vilaine, pas le Finistère.' },
          ],
          quote: dep('29').ligne,
          montre: liste(dep('29')),
          explain: 'Le premier colis va dans le Finistère, numéro 29.',
          src: INSEE,
        },
        {
          q: 'Dans quel département va le second colis ?',
          a: 'la Gironde',
          wrong: [
            { label: 'le Finistère', why: 'C’est le département du premier colis.' },
            { label: 'le Gers', why: 'Le Gers porte le numéro 32.' },
          ],
          quote: dep('33').ligne,
          montre: liste(dep('33')),
          explain: 'Le numéro 33 désigne la Gironde.',
          src: INSEE,
        },
      ],
    },
    {
      title: 'Deux cousines',
      lines: [
        'La première cousine habite dans le département numéro 2A.',
        'La seconde habite dans le département numéro 972.',
      ],
      qs: [
        {
          q: 'Où habite la première cousine ?',
          a: 'en Corse-du-Sud',
          wrong: [
            { label: 'en Haute-Corse', why: 'La Haute-Corse porte le numéro 2B.' },
            { label: 'dans l’Aisne', why: 'L’Aisne porte le numéro 02, sans la lettre A.' },
          ],
          quote: dep('2A').ligne,
          montre: liste(dep('2A')),
          explain: 'Le 2A est la Corse-du-Sud.',
          src: INSEE,
        },
        {
          q: 'Dans quel département habite la seconde cousine ?',
          a: 'la Martinique',
          wrong: [
            { label: 'la Guadeloupe', why: 'La Guadeloupe porte le numéro 971.' },
            { label: 'la Guyane', why: 'La Guyane porte le numéro 973.' },
          ],
          quote: dep('972').ligne,
          montre: liste(dep('972')),
          explain: 'Le 972 est la Martinique, un département d’outre-mer.',
          src: INSEE,
        },
      ],
    },
  ],
  carte: carteDepartements,
};

// ——— Notion 2 : pays et capitales d’Europe ———

interface Pays {
  readonly zone: string;
  /** Nom avec article : « de l’Allemagne ». */
  readonly de: string;
  readonly capitale: string;
  /** Écritures acceptées en saisie. */
  readonly accepted: readonly string[];
}

const pays = (zone: string, de: string, capitale: string, ...variantes: string[]): Pays => ({
  zone,
  de,
  capitale,
  accepted: [capitale, ...variantes],
});

/** États membres de l’Union européenne étudiés ici (fiches « Pays de l’UE »). */
export const PAYS: readonly Pays[] = [
  pays('fra', 'de la France', 'Paris'),
  pays('deu', 'de l’Allemagne', 'Berlin'),
  pays('esp', 'de l’Espagne', 'Madrid'),
  pays('ita', 'de l’Italie', 'Rome'),
  pays('bel', 'de la Belgique', 'Bruxelles'),
  pays('prt', 'du Portugal', 'Lisbonne'),
  pays('pol', 'de la Pologne', 'Varsovie'),
  pays('grc', 'de la Grèce', 'Athènes', 'Athenes'),
  pays('aut', 'de l’Autriche', 'Vienne'),
  pays('nld', 'des Pays-Bas', 'Amsterdam'),
  pays('irl', 'de l’Irlande', 'Dublin'),
  pays('swe', 'de la Suède', 'Stockholm'),
  pays('dnk', 'du Danemark', 'Copenhague'),
  pays('hun', 'de la Hongrie', 'Budapest'),
  pays('cze', 'de la Tchéquie', 'Prague'),
  pays('rou', 'de la Roumanie', 'Bucarest'),
  pays('bgr', 'de la Bulgarie', 'Sofia'),
  pays('hrv', 'de la Croatie', 'Zagreb'),
  pays('fin', 'de la Finlande', 'Helsinki'),
];

const paysDe = (zone: string): Pays => {
  const p = PAYS.find((x) => x.zone === zone);
  if (!p) throw new Error(`Pays inconnu : ${zone}`);
  return p;
};

/** Citation exacte de la fiche du pays. */
const quoteCapitale = (p: Pays) =>
  p.zone === 'nld'
    ? 'Capitale : Amsterdam; le Parlement et le gouvernement ont leur siège à La Haye.'
    : `Capitale : ${p.capitale}`;

const pourquoi = (p: Pays) => `${p.capitale} est la capitale ${p.de}.`;

const capitale = (zone: string, autres: readonly string[]): Fait => {
  const p = paysDe(zone);
  return {
    q: `Quelle est la capitale ${p.de} ?`,
    a: p.capitale,
    wrong: autres.map((o) => ({ label: paysDe(o).capitale, why: pourquoi(paysDe(o)) })),
    gap: [`La capitale ${p.de} est `, '.', p.accepted],
    quote: quoteCapitale(p),
    explain: pourquoi(p),
    src: `ue-pays-${zone}`,
  };
};

const capitaleLibre = (zone: string, pieges: readonly [string, string]): Libre => {
  const p = paysDe(zone);
  return {
    q: `quelle est la capitale ${p.de} ?`,
    accepted: p.accepted,
    traps: pieges.map((o) => ({ text: paysDe(o).capitale, why: pourquoi(paysDe(o)) })),
    quote: quoteCapitale(p),
    explain: pourquoi(p),
    src: `ue-pays-${zone}`,
  };
};

const EUROPE_FACILES = ['fra', 'deu', 'esp', 'ita', 'prt', 'pol', 'grc', 'swe'];

const carteEurope = (rng: Rng, level: Level): QuestionDraft => {
  const hint = 'Pars de la France, puis regarde tes voisins, au nord, à l’est ou au sud.';
  if (level <= 2) {
    return repereA(rng, 'europe', { pool: EUROPE_FACILES, n: level === 1 ? 3 : 4, quoi: 'quel pays' }, hint);
  }
  const lieux = (zones: readonly string[], cible: (p: Pays) => string) =>
    zones.map((z) => ({ zone: z, cible: cible(paysDe(z)) }));
  if (level === 3) {
    return toucher(
      rng,
      'europe',
      lieux(EUROPE_FACILES, (p) => `le pays « ${nom('europe', p.zone)} »`),
      (l) => `Touche ${l.cible} sur la carte de l’Europe.`,
      hint,
    );
  }
  const parCapitale = lieux(
    PAYS.map((p) => p.zone).filter((z) => z !== 'fra'),
    (p) => `le pays dont la capitale est ${p.capitale}`,
  );
  if (level === 4) {
    return toucher(
      rng,
      'europe',
      parCapitale,
      (l) => `Sans aide : touche ${l.cible}.`,
      'Trouve d’abord le nom du pays, puis sa place sur la carte.',
    );
  }
  return troisReperes(rng, 'europe', parCapitale, 'Trouve d’abord le nom du pays, puis la bonne lettre.');
};

const Q_CAPITALE = 'La ville qui occupe le premier rang dans un État, une province, et où siège le gouvernement.';
const Q_MEMBRES = 'Nombre actuel d’États membres : 27';

const capitales: Notion = {
  classe: 'CM2',
  id: 'gcm2-europe-capitales',
  title: 'Pays et capitales d’Europe',
  hint: 'Pense à chaque pays avec sa ville principale. Attention : chaque pays a sa propre capitale.',
  memo: [
    'En Europe, il y a beaucoup de pays. L’**Union européenne** en réunit 27.',
    'La **capitale** est la ville au premier rang dans un pays. Exemple : Rome est la capitale de l’Italie.',
    'Piège : aux Pays-Bas, la capitale est Amsterdam, mais le gouvernement siège à La Haye.',
  ],
  faits: [
    {
      q: 'En général, qu’est-ce que la capitale d’un pays ?',
      a: 'la ville qui occupe le premier rang',
      wrong: [
        { label: 'le plus long cours d’eau', why: 'Un cours d’eau n’est pas une ville.' },
        { label: 'la plus haute montagne', why: 'Une montagne n’est pas une ville.' },
        { label: 'un village au bord de la frontière', why: 'La capitale est la ville de premier rang du pays.' },
      ],
      gap: ['La capitale est la ville qui occupe le premier ', ' dans un État.', ['rang']],
      choix: ['rang', 'train', 'étage'],
      quote: Q_CAPITALE,
      explain: 'La capitale est la ville qui a le premier rang dans un État.',
      src: 'academie-capitale',
    },
    {
      q: 'Combien d’États membres compte l’Union européenne ?',
      a: '27',
      wrong: [
        { label: '6', why: '6, c’est le nombre de pays du tout début.' },
        { label: '12', why: 'Il y en a bien plus : plus du double.' },
        { label: '5', why: 'Il y en a bien plus que 5.' },
      ],
      gap: ['L’Union européenne compte ', ' États membres.', ['27', 'vingt-sept', 'vingt sept']],
      quote: Q_MEMBRES,
      explain: 'L’Union européenne réunit 27 pays.',
      src: 'ue-faits',
    },
    capitale('fra', ['ita', 'esp', 'bel']),
    capitale('deu', ['aut', 'pol', 'bel']),
    capitale('esp', ['prt', 'ita', 'grc']),
    capitale('ita', ['grc', 'esp', 'aut']),
    capitale('bel', ['nld', 'fra', 'dnk']),
    capitale('prt', ['esp', 'ita', 'irl']),
  ],
  paires3: [
    ['Allemagne', 'Berlin'],
    ['Espagne', 'Madrid'],
    ['Italie', 'Rome'],
  ],
  paires5: [
    ['Pologne', 'Varsovie'],
    ['Grèce', 'Athènes'],
    ['Autriche', 'Vienne'],
    ['Pays-Bas', 'Amsterdam'],
    ['Suède', 'Stockholm'],
  ],
  libres: [
    capitaleLibre('pol', ['cze', 'hun']),
    capitaleLibre('grc', ['ita', 'bgr']),
    capitaleLibre('aut', ['deu', 'hun']),
    {
      ...capitaleLibre('nld', ['bel', 'dnk']),
      traps: [
        { text: 'La Haye', why: 'Le gouvernement siège à La Haye, mais la capitale est Amsterdam.' },
        { text: 'Bruxelles', why: pourquoi(paysDe('bel')) },
      ],
    },
    capitaleLibre('swe', ['dnk', 'fin']),
    capitaleLibre('irl', ['prt', 'dnk']),
    capitaleLibre('dnk', ['swe', 'fin']),
    capitaleLibre('hun', ['aut', 'rou']),
    capitaleLibre('cze', ['pol', 'hrv']),
    capitaleLibre('rou', ['bgr', 'hun']),
    capitaleLibre('bgr', ['rou', 'grc']),
    capitaleLibre('hrv', ['cze', 'aut']),
    capitaleLibre('fin', ['swe', 'dnk']),
  ],
  docs: [
    {
      title: 'Un voyage en train',
      lines: [
        'Une voyageuse part de la capitale de la France.',
        'Elle s’arrête dans la capitale de la Belgique.',
        'Elle termine son voyage dans la capitale des Pays-Bas.',
      ],
      qs: [
        {
          q: 'Dans quelle ville s’arrête-t-elle au milieu du voyage ?',
          a: 'Bruxelles',
          wrong: [
            { label: 'Amsterdam', why: 'Amsterdam est la fin du voyage.' },
            { label: 'Berlin', why: pourquoi(paysDe('deu')) },
          ],
          quote: quoteCapitale(paysDe('bel')),
          explain: pourquoi(paysDe('bel')),
          src: 'ue-pays-bel',
        },
        {
          q: 'Dans quelle ville termine-t-elle son voyage ?',
          a: 'Amsterdam',
          wrong: [
            { label: 'La Haye', why: 'Le gouvernement siège à La Haye, mais la capitale est Amsterdam.' },
            { label: 'Bruxelles', why: 'Bruxelles est l’arrêt du milieu.' },
          ],
          quote: quoteCapitale(paysDe('nld')),
          explain: pourquoi(paysDe('nld')),
          src: 'ue-pays-nld',
        },
      ],
    },
    {
      title: 'Cartes postales',
      lines: ['Un élève reçoit une carte postale de Lisbonne.', 'Une autre carte arrive de Varsovie.'],
      qs: [
        {
          q: 'De quel pays vient la première carte ?',
          a: 'du Portugal',
          wrong: [
            { label: 'de l’Espagne', why: pourquoi(paysDe('esp')) },
            { label: 'de la Pologne', why: 'La Pologne, c’est la seconde carte.' },
          ],
          quote: quoteCapitale(paysDe('prt')),
          explain: pourquoi(paysDe('prt')),
          src: 'ue-pays-prt',
        },
        {
          q: 'De quel pays vient la seconde carte ?',
          a: 'de la Pologne',
          wrong: [
            { label: 'du Portugal', why: 'Le Portugal, c’est la première carte.' },
            { label: 'de la Tchéquie', why: pourquoi(paysDe('cze')) },
          ],
          quote: quoteCapitale(paysDe('pol')),
          explain: pourquoi(paysDe('pol')),
          src: 'ue-pays-pol',
        },
      ],
    },
  ],
  carte: carteEurope,
};

// ——— Notion 3 : continents et océans ———

const CONTINENT = 'academie-continent';
const OCEAN = 'academie-ocean';

const Q_CONTINENT = "Vaste étendue de terres émergées, d'un seul tenant, entourée par les océans.";
const Q_TIERS = 'Les continents couvrent un peu moins du tiers de la surface du globe.';
const Q_CINQ = "Les cinq continents sont l'Europe, l'Asie, l'Afrique, l'Amérique et l'Océanie.";
const Q_LISTE = "L'Eurasie, l'Afrique, les Amériques, l'Australie et l'Antarctique sont des continents.";
const Q_OCEAN = "La vaste étendue d'eau salée qui couvre à peu près les trois quarts de la surface de la Terre.";
const Q_OCEANS = "L'océan Atlantique. L'océan Pacifique. L'océan Indien. L'océan Glacial arctique.";
const Q_AUSTRAL = "De l'extrême sud de la Terre, austral.";
const Q_PACIFIQUE = "ainsi nommé par Magellan parce qu'il n'y avait pas rencontré de tempêtes.";
const Q_TRANSATLANTIQUE = "Qui traverse l'océan Atlantique";

const CONTINENTS = ['europe', 'asie', 'afrique', 'amerique-nord', 'amerique-sud', 'oceanie', 'antarctique'];
const OCEANS = ['atlantique', 'pacifique', 'indien', 'arctique'];

const carteMonde = (rng: Rng, level: Level): QuestionDraft => {
  const hint = 'La mer et la terre : regarde d’abord si le repère est sur l’eau ou sur le sol.';
  if (level === 1) {
    return repereA(
      rng,
      'monde',
      { pool: ['europe', 'afrique', 'antarctique', 'atlantique'], n: 3, quoi: 'quel continent ou océan' },
      hint,
    );
  }
  if (level === 2) {
    return rng.int(0, 1) === 0
      ? repereA(rng, 'monde', { pool: CONTINENTS, n: 4, quoi: 'quel continent' }, hint)
      : repereA(rng, 'monde', { pool: OCEANS, n: 4, quoi: 'quel océan' }, hint);
  }
  const lieux = (zones: readonly string[]) =>
    zones.map((z) => ({
      zone: z,
      cible: OCEANS.includes(z) ? `l’${nom('monde', z).replace('Océan', 'océan')}` : `la zone « ${nom('monde', z)} »`,
    }));
  if (level === 3) {
    return toucher(rng, 'monde', lieux(CONTINENTS), (l) => `Touche ${l.cible} sur le planisphère.`, hint);
  }
  if (level === 4) {
    return toucher(rng, 'monde', lieux(OCEANS), (l) => `Sans aide : touche ${l.cible} sur le planisphère.`, hint);
  }
  return troisReperes(rng, 'monde', lieux([...CONTINENTS, ...OCEANS]), hint);
};

const faux = (...w: [string, string][]): Wrong[] => w.map(([label, why]) => ({ label, why }));

const continents: Notion = {
  classe: 'CM2',
  id: 'gcm2-continents-oceans',
  title: 'Continents et océans',
  hint: 'Demande-toi d’abord : est-ce de la terre ou de l’eau salée ?',
  memo: [
    'Un **continent** est une très grande étendue de terre. Exemple : l’Afrique.',
    'Un **océan** est une immense étendue d’eau salée : Atlantique, Pacifique, Indien, Arctique.',
    'La liste traditionnelle cite cinq continents : Europe, Asie, Afrique, Amérique, Océanie. L’Antarctique, au sud, est aussi un continent.',
    'Sur certaines cartes, l’Amérique est montrée en deux parties : Amérique du Nord et Amérique du Sud.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’un continent ?',
      a: 'une vaste étendue de terre entourée par les océans',
      wrong: faux(
        ['une vaste étendue d’eau salée', 'L’eau salée, c’est l’océan.'],
        ['un grand cours d’eau', 'Un grand cours d’eau est un fleuve.'],
        ['une grande ville', 'Une ville est bien plus petite qu’un continent.'],
      ),
      gap: ['Un continent est une vaste étendue de terres émergées, entourée par les ', '.', ['océans', 'oceans']],
      choix: ['océans', 'déserts', 'montagnes'],
      quote: Q_CONTINENT,
      explain:
        'Les terres émergées sont celles qui dépassent de l’eau. Un continent est fait de ces terres, avec des océans autour.',
      src: CONTINENT,
    },
    {
      q: 'Qu’est-ce que l’Océan ?',
      a: 'une vaste étendue d’eau salée',
      wrong: faux(
        ['une vaste étendue de terre', 'Une vaste étendue de terre est un continent.'],
        ['un lac de montagne', 'Un lac est bien plus petit et entouré de terre.'],
        ['un désert de sable', 'Un désert est sur la terre : l’Océan est de l’eau salée.'],
      ),
      gap: ['L’Océan est une vaste étendue d’eau ', '.', ['salée', 'salee']],
      quote: Q_OCEAN,
      explain: 'L’Océan est de l’eau salée qui couvre une très grande partie de la Terre.',
      src: OCEAN,
    },
    {
      q: 'Quelle part de la surface de la Terre l’Océan couvre-t-il à peu près ?',
      a: 'les trois quarts',
      wrong: faux(
        ['un dixième', 'C’est beaucoup trop peu : l’eau salée domine.'],
        ['un quart', 'C’est l’inverse : l’eau couvre environ trois parts sur quatre.'],
        ['toute la surface', 'Il reste les continents, faits de terre.'],
      ),
      gap: ['L’Océan couvre à peu près les trois ', ' de la surface de la Terre.', ['quarts']],
      choix: ['quarts', 'dixièmes', 'centièmes'],
      quote: Q_OCEAN,
      explain: 'Imagine quatre parts : environ trois sont couvertes d’eau salée.',
      src: OCEAN,
    },
    {
      q: 'Quel nom fait partie de la liste traditionnelle des cinq continents ?',
      a: 'l’Océanie',
      wrong: faux(
        ['l’océan Indien', 'C’est un océan : de l’eau salée, pas un continent.'],
        ['l’océan Pacifique', 'C’est un océan, malgré un nom qui ressemble un peu à Océanie.'],
        ['la France', 'La France est un pays, situé en Europe.'],
      ),
      gap: [
        'Les cinq continents traditionnels : Europe, Asie, Afrique, Amérique et ',
        '.',
        ['Océanie', 'Oceanie', 'l’Océanie'],
      ],
      quote: Q_CINQ,
      explain: 'La liste traditionnelle cite l’Europe, l’Asie, l’Afrique, l’Amérique et l’Océanie.',
      src: CONTINENT,
    },
    {
      q: 'Lequel de ces noms est celui d’un océan ?',
      a: 'l’Atlantique',
      wrong: faux(
        ['l’Afrique', 'L’Afrique est un continent.'],
        ['l’Asie', 'L’Asie est un continent.'],
        ['l’Europe', 'L’Europe est un continent.'],
      ),
      gap: [
        'Voici des océans : le Pacifique, l’Indien, l’Arctique et l’',
        ' (il commence par « Atl »).',
        ['Atlantique'],
      ],
      quote: Q_OCEANS,
      explain: 'L’Atlantique est l’un des océans.',
      src: OCEAN,
    },
    {
      q: 'Quel continent se trouve à l’extrême sud de la Terre ?',
      a: 'l’Antarctique',
      wrong: faux(
        ['l’Europe', 'L’Europe est au nord de l’Afrique, loin de l’extrême sud.'],
        ['l’Asie', 'L’Asie n’est pas à l’extrême sud de la Terre.'],
        ['l’océan Arctique', 'L’Arctique est un océan, tout au nord.'],
      ),
      gap: ['Le continent de l’extrême sud de la Terre est l’', '.', ['Antarctique']],
      quote: Q_AUSTRAL,
      explain: 'Antarctique veut dire : de l’extrême sud de la Terre.',
      src: 'academie-antarctique',
    },
  ],
  paires3: [
    ['Continent', 'Grande étendue de terre'],
    ['Océan', 'Grande étendue d’eau salée'],
    ['Antarctique', 'Continent de l’extrême sud'],
  ],
  paires5: [
    ['Europe', 'Continent où se trouve la France métropolitaine'],
    ['Pacifique', 'Océan nommé par le navigateur Magellan'],
    ['Antarctique', 'Continent de l’extrême sud'],
    ['Atlantique', 'Océan d’un voyage transatlantique'],
    ['Océanie', 'Partie du monde au nom proche du mot « océan »'],
  ],
  libres: [
    {
      q: 'comment s’appelle une vaste étendue de terres émergées, entourée par les océans ?',
      accepted: ['un continent', 'continent', 'le continent'],
      traps: [
        { text: 'océan', why: 'Un océan est de l’eau salée.' },
        { text: 'pays', why: 'Un pays est un État : ici, on parle d’une immense étendue de terre.' },
      ],
      quote: Q_CONTINENT,
      explain: 'C’est la définition d’un continent.',
      src: CONTINENT,
    },
    {
      q: 'quel océan le navigateur Magellan a-t-il nommé parce qu’il n’y avait pas rencontré de tempêtes ?',
      accepted: ['le Pacifique', 'Pacifique', 'océan Pacifique', 'l’océan Pacifique'],
      traps: [
        { text: 'Atlantique', why: 'Le nom donné par Magellan évoque le calme : c’est le Pacifique.' },
        { text: 'Indien', why: 'L’océan Indien n’a pas reçu ce nom de Magellan.' },
      ],
      quote: Q_PACIFIQUE,
      explain: 'Pacifique veut aussi dire « tranquille ».',
      src: 'academie-pacifique',
    },
    {
      q: 'quel continent se trouve à l’extrême sud de la Terre ?',
      accepted: ['l’Antarctique', 'Antarctique'],
      traps: [
        { text: 'Arctique', why: 'L’Arctique est au nord. Le préfixe « ant » veut dire à l’opposé.' },
        { text: 'Afrique', why: 'L’Afrique n’est pas à l’extrême sud de la Terre.' },
      ],
      quote: Q_AUSTRAL,
      explain: 'Le continent de l’extrême sud est l’Antarctique.',
      src: 'academie-antarctique',
    },
    {
      q: 'quel océan un navire transatlantique traverse-t-il ?',
      accepted: ['l’Atlantique', 'Atlantique', 'océan Atlantique', 'l’océan Atlantique'],
      traps: [
        { text: 'Pacifique', why: 'Dans « transatlantique », on entend « atlantique ».' },
        { text: 'Indien', why: 'Dans « transatlantique », on entend « atlantique ».' },
      ],
      quote: Q_TRANSATLANTIQUE,
      explain: 'Transatlantique : qui traverse l’océan Atlantique.',
      src: 'cnrtl-transatlantique',
    },
  ],
  docs: [
    {
      title: 'Le carnet d’une navigatrice',
      lines: [
        'Une navigatrice quitte un port et traverse l’Atlantique.',
        'Elle pose le pied sur une immense terre, entourée par les océans.',
        'Plus tard, elle rêve d’aller sur le continent de l’extrême sud.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on l’immense terre de la ligne 2 ?',
          a: 'un continent',
          wrong: faux(
            ['un océan', 'Un océan est de l’eau : elle y navigue, elle n’y pose pas le pied.'],
            ['un fleuve', 'Un fleuve est un cours d’eau.'],
          ),
          quote: Q_CONTINENT,
          explain: 'Une grande terre entourée par les océans est un continent.',
          src: CONTINENT,
        },
        {
          q: 'De quel continent rêve-t-elle ?',
          a: 'l’Antarctique',
          wrong: faux(
            ['l’Europe', 'L’Europe n’est pas à l’extrême sud.'],
            ['l’Asie', 'L’Asie n’est pas à l’extrême sud.'],
          ),
          quote: Q_AUSTRAL,
          explain: 'Le continent de l’extrême sud est l’Antarctique.',
          src: 'academie-antarctique',
        },
      ],
    },
    {
      title: 'La Terre vue de loin',
      lines: ['Sur une image de la Terre, un élève voit surtout de l’eau salée.', 'Il voit aussi de grandes terres.'],
      qs: [
        {
          q: 'À peu près quelle part de la surface l’Océan couvre-t-il ?',
          a: 'les trois quarts',
          wrong: faux(
            ['un quart', 'C’est trop peu : l’élève voit surtout de l’eau.'],
            ['un dixième', 'C’est beaucoup trop peu.'],
          ),
          quote: Q_OCEAN,
          explain: 'L’Océan couvre à peu près les trois quarts de la surface.',
          src: OCEAN,
        },
        {
          q: 'Et les grandes terres, quelle part couvrent-elles ?',
          a: 'un peu moins d’un tiers',
          wrong: faux(
            ['les trois quarts', 'C’est la part de l’eau salée.'],
            ['presque toute la surface', 'L’élève voit surtout de l’eau.'],
          ),
          quote: Q_TIERS,
          explain: 'Les continents couvrent un peu moins du tiers du globe.',
          src: CONTINENT,
        },
      ],
    },
    {
      title: 'Le jeu des listes',
      lines: [
        'En classe, une équipe récite la liste traditionnelle des cinq continents.',
        'Elle dit : Europe, Asie, Afrique, Amérique… puis elle hésite.',
      ],
      qs: [
        {
          q: 'Quel nom manque à la liste de l’équipe ?',
          a: 'l’Océanie',
          wrong: faux(['le Pacifique', 'Le Pacifique est un océan.'], ['l’Atlantique', 'L’Atlantique est un océan.']),
          quote: Q_CINQ,
          explain: 'La liste traditionnelle se termine par l’Océanie.',
          src: CONTINENT,
        },
        {
          q: 'Un autre élève ajoute un continent situé tout au sud. Lequel ?',
          a: 'l’Antarctique',
          wrong: faux(
            ['l’océan Indien', 'C’est un océan, pas un continent.'],
            ['l’Europe', 'L’Europe est déjà dans la liste, et elle n’est pas tout au sud.'],
          ),
          quote: Q_LISTE,
          explain: 'L’Antarctique est aussi un continent.',
          src: CONTINENT,
        },
      ],
    },
  ],
  carte: carteMonde,
};

export const NOTIONS: readonly Notion[] = [departements, capitales, continents];

/** La notion des départements existait en 3 niveaux : même identifiant, nouvelle version. */
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => ({
  ...notion(n),
  version: n.id === 'gcm2-departements' ? 2 : 1,
}));
