import type { Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { zoneIds, zoneName } from '../cartes.ts';
import { LIGNES_COMMUNES } from './communes-insee.ts';
import { METROPOLES } from './metropole.ts';
import { notion, type Fait, type Libre, type Notion } from './kit.ts';
import { DEPARTEMENTS_INSEE, ecritures, repereA, toucher, troisReperes } from './reperes.ts';

/**
 * Sixième, « Repères : la France et le monde » (lot ge-6e-05) : compétence du cycle 3 « Nommer et localiser les grands
 * repères géographiques », poursuivie en sixième. Sources du registre avec citation exacte : INSEE (fichiers des
 * départements et des communes), Géoconfluences, dictionnaires publiés par le CNRTL, notices de la BnF. La position
 * des zones vient du registre des cartes. Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

type Wrong = { readonly label: string; readonly why: string };
const faux = (...w: [string, string][]): Wrong[] => w.map(([label, why]) => ({ label, why }));

/** Fait à saisie libre : mêmes champs pour toutes les notions. */
const libre = (
  q: string,
  accepted: readonly string[],
  pieges: readonly [string, string][],
  source: { readonly quote: string; readonly src: string; readonly montre?: string },
  explain: string,
): Libre => ({ q, accepted, traps: pieges.map(([text, why]) => ({ text, why })), explain, ...source });

/** Un nom avec ou sans article (et sans accent). */
const noms = (nom: string, ...articles: string[]): string[] =>
  [nom, ...articles.map((a) => `${a}${nom}`)].flatMap((n) => [
    ...new Set([n, n.normalize('NFD').replace(/\p{M}/gu, '')]),
  ]);

const nomZone = (zone: string) => zoneName('monde', zone) ?? zone;

// ——— Notion 1 : les préfectures ———

const COMMUNES = 'insee-cog-2025-communes';

interface Commune {
  readonly code: string;
  readonly dep: string;
  readonly name: string;
  readonly ligne: string;
}

/** Communes lues dans les lignes officielles (code, département, nom en clair). */
export const COMMUNES_INSEE: readonly Commune[] = LIGNES_COMMUNES.map((ligne) => {
  const cells = ligne.slice(1, -1).split('","');
  return { code: cells[1] ?? '', dep: cells[3] ?? '', name: cells[9] ?? '', ligne };
});

interface Prefecture {
  readonly num: string;
  readonly departement: string;
  readonly ville: Commune;
}

const prefectureDe = (num: string): Prefecture => {
  const d = DEPARTEMENTS_INSEE.find((x) => x.code === num);
  const chefLieu = d?.ligne.slice(1, -1).split('","')[2];
  const ville = COMMUNES_INSEE.find((c) => c.code === chefLieu);
  if (!d || !ville) throw new Error(`Préfecture introuvable : ${num}`);
  return { num, departement: d.name, ville };
};

const liste = (p: Prefecture) =>
  `Listes officielles de l’INSEE : le département « ${p.departement} » (${p.num}) a pour chef-lieu la commune ${p.ville.code}, nommée ${p.ville.name}.`;

const pourquoi = (p: Prefecture) => `${p.ville.name} est la préfecture du département « ${p.departement} » (${p.num}).`;

const source = (p: Prefecture) => ({ quote: p.ville.ligne, src: COMMUNES, montre: liste(p) });

/** Pièges : une autre préfecture (numéro de département) ou une commune du département qui n’est pas le chef-lieu. */
const piege = (cible: Prefecture, autre: string): [string, string] => {
  const commune = COMMUNES_INSEE.find((c) => c.name === autre);
  if (commune) {
    return [autre, `${autre} se trouve bien dans ce département, mais le chef-lieu officiel est ${cible.ville.name}.`];
  }
  const p = prefectureDe(autre);
  return [p.ville.name, pourquoi(p)];
};

/** Fait « département → préfecture » ; `autres` : numéros de départements ou noms de communes pièges. */
const ville = (num: string, autres: readonly string[]): Fait => {
  const p = prefectureDe(num);
  return {
    q: `Quelle est la préfecture du département « ${p.departement} » (${num}) ?`,
    a: p.ville.name,
    wrong: autres.map((o) => {
      const [label, why] = piege(p, o);
      return { label, why };
    }),
    gap: [`Le département « ${p.departement} » (${num}) a pour préfecture `, '.', ecritures(p.ville.name)],
    explain: pourquoi(p),
    ...source(p),
  };
};

const villeLibre = (num: string, autres: readonly [string, string]): Libre => {
  const p = prefectureDe(num);
  return libre(
    `quelle est la préfecture du département « ${p.departement} » (${num}) ?`,
    ecritures(p.ville.name),
    autres.map((o) => piege(p, o)),
    source(p),
    pourquoi(p),
  );
};

/** Départements montrés sur la carte (France métropolitaine, bien séparés les uns des autres). */
const CARTE_PREFECTURES = ['29', '33', '31', '13', '06', '59', '67', '35', '44', '34', '63', '21', '50', '66', '25'];

const cartePrefectures = (rng: Rng, level: Level): QuestionDraft | undefined => {
  if (level < 3) return undefined;
  const metro = zoneIds('france-departements');
  const lieux = CARTE_PREFECTURES.filter((z) => metro.includes(z)).map((zone) => ({
    zone,
    cible: `le département dont la préfecture est ${prefectureDe(zone).ville.name}`,
  }));
  const hint = 'Trouve d’abord le nom du département, puis sa place près d’une mer ou d’une frontière.';
  if (level === 5) return troisReperes(rng, 'france-departements', lieux, hint);
  return toucher(
    rng,
    'france-departements',
    lieux,
    (l) => (level === 3 ? `Sur la carte, touche ${l.cible}.` : `Sans aide : localise ${l.cible}.`),
    hint,
  );
};

const CHEF_LIEU = 'La préfecture est installée au chef-lieu du département.';

const prefectures: Notion = {
  classe: '6e',
  id: 'g6-prefectures',
  title: 'Les préfectures',
  hint: 'La préfecture est au chef-lieu : ce n’est pas toujours la ville la plus connue du département.',
  memo: [
    'La **préfecture** est installée au **chef-lieu** du **département**. Exemple : Bordeaux pour la Gironde.',
    'Le **préfet** y représente l’État et le gouvernement.',
    'Piège : la préfecture n’est pas toujours la ville la plus connue. Dans le Finistère, c’est Quimper, pas Brest.',
  ],
  faits: [
    {
      q: 'Où la préfecture d’un département est-elle installée ?',
      a: 'au chef-lieu du département',
      wrong: faux(
        ['dans la capitale de la France', 'Chaque département a son propre chef-lieu, pas forcément Paris.'],
        ['au bord de la mer', 'Beaucoup de départements n’ont pas de littoral.'],
        ['dans la plus petite commune', 'Le chef-lieu est le centre administratif du département.'],
      ),
      gap: ['La préfecture est installée au ', ' du département.', ['chef-lieu', 'chef lieu']],
      quote: CHEF_LIEU,
      explain: 'Le chef-lieu est le centre administratif : la préfecture s’y trouve.',
      src: 'academie-chef-lieu',
    },
    {
      q: 'Dans chaque département français, qui représente l’État et le gouvernement ?',
      a: 'le préfet',
      wrong: faux(
        ['le maire', 'Le maire dirige une commune.'],
        ['le professeur', 'Il enseigne : il ne représente pas le gouvernement dans le département.'],
        ['le voyageur', 'Un voyageur ne représente pas l’État.'],
      ),
      gap: ['Le haut fonctionnaire qui représente l’État dans le département est le ', '.', ['préfet', 'prefet']],
      quote: "représentant l'État et le gouvernement dans chaque département français",
      explain: 'Le préfet est un haut fonctionnaire nommé pour représenter l’État dans le département.',
      src: 'cnrtl-prefet',
    },
    ville('33', ['69', '59', '13']),
    ville('69', ['33', '31', '13']),
    ville('59', ['62', '67', '33']),
    ville('13', ['06', '34', '31']),
    ville('31', ['33', '34', '69']),
    ville('44', ['35', '49', '33']),
    ville('67', ['68', '57', '21']),
    ville('34', ['30', '11', '31']),
    ville('06', ['83', '13', '34']),
    ville('35', ['22', '44', '56']),
    ville('29', ['56', '35', 'Brest']),
  ],
  paires3: [
    ['Gironde (33)', 'Bordeaux'],
    ['Haute-Garonne (31)', 'Toulouse'],
    ['Loire-Atlantique (44)', 'Nantes'],
  ],
  paires5: [
    ['Finistère (29)', 'Quimper'],
    ['Manche (50)', 'Saint-Lô'],
    ['Vendée (85)', 'La Roche-sur-Yon'],
    ['Haute-Saône (70)', 'Vesoul'],
    ['Creuse (23)', 'Guéret'],
  ],
  ordre: ['Gard', 'Haute-Garonne', 'Gers', 'Gironde'],
  consigne: {
    prompt: 'Range ces départements selon leur numéro, du plus petit au plus grand.',
    hint: 'Ces numéros vont de 30 à 33 : ils ne suivent pas tous l’ordre alphabétique.',
    why: 'Leurs numéros sont 30, 31, 32 et 33.',
    fin: 'Le premier est',
    quote: DEPARTEMENTS_INSEE.find((d) => d.code === '30')?.ligne ?? '',
    montre:
      'Listes officielles de l’INSEE : les numéros 30, 31, 32 et 33 désignent le Gard, la Haute-Garonne, le Gers et la Gironde.',
    src: 'insee-cog-2025-departements',
  },
  libres: [
    villeLibre('29', ['Brest', '56']),
    villeLibre('76', ['Le Havre', '14']),
    villeLibre('51', ['Reims', '10']),
    villeLibre('83', ['06', '13']),
    villeLibre('50', ['14', '61']),
    villeLibre('85', ['44', '79']),
    villeLibre('70', ['25', '39']),
    villeLibre('23', ['87', '19']),
    villeLibre('09', ['31', '65']),
    villeLibre('48', ['12', '07']),
    villeLibre('04', ['05', '84']),
    villeLibre('07', ['26', '48']),
  ],
  docs: [
    {
      title: 'Trois dossiers à envoyer',
      lines: [
        'Un premier dossier doit partir à la préfecture du département numéro 29.',
        'Un deuxième dossier est destiné à la préfecture du département numéro 76.',
        'Une employée précise : la ville la plus connue du département n’est pas toujours la bonne adresse.',
      ],
      qs: [
        {
          q: 'Dans quelle ville faut-il envoyer le premier dossier ?',
          a: 'Quimper',
          wrong: faux(piege(prefectureDe('29'), 'Brest'), piege(prefectureDe('29'), '56')),
          explain: 'Le numéro 29 désigne le Finistère. ' + pourquoi(prefectureDe('29')),
          ...source(prefectureDe('29')),
        },
        {
          q: 'Dans quelle ville faut-il envoyer le deuxième dossier ?',
          a: 'Rouen',
          wrong: faux(piege(prefectureDe('76'), 'Le Havre'), piege(prefectureDe('76'), '14')),
          explain: pourquoi(prefectureDe('76')),
          ...source(prefectureDe('76')),
        },
      ],
    },
    {
      title: 'Deux étapes d’un voyage',
      lines: [
        'Une famille part de la préfecture du département numéro 31.',
        'Elle rejoint ensuite la préfecture du département numéro 34.',
      ],
      qs: [
        {
          q: 'De quelle ville part la famille ?',
          a: 'Toulouse',
          wrong: faux(piege(prefectureDe('31'), '34'), piege(prefectureDe('31'), '33')),
          explain: pourquoi(prefectureDe('31')),
          ...source(prefectureDe('31')),
        },
        {
          q: 'Dans quelle ville arrive la famille ?',
          a: 'Montpellier',
          wrong: faux(piege(prefectureDe('34'), '31'), piege(prefectureDe('34'), '30')),
          explain: pourquoi(prefectureDe('34')),
          ...source(prefectureDe('34')),
        },
      ],
    },
  ],
  sources: ['cnrtl-prefecture', 'insee-cog-2025-departements'],
  carte: cartePrefectures,
};

// ——— Notion 2 : les continents et les océans ———

const G_CONTINENT = 'geoconfluences-continent';
const G_OCEAN = 'geoconfluences-ocean';

const Q_CONTINENT =
  'Un continent est, conformément à son étymologie (cum tenere, tenir ensemble), une immense étendue de terres émergées';
const Q_CINQ =
  'subdivisé traditionnellement, par convention, en cinq continents : l’Afrique, l’Amérique, l’Asie, l’Europe et l’Océanie';
const Q_ANTARCTIQUE =
  'exclut l’Antarctique, vaste ensemble de terres inhabitées, qui est cependant désormais également considéré comme un continent';
const Q_QUART = 'L’ensemble des terres émergées, soit un quart de la surface terrestre';
const Q_PENINSULE = 'l’Europe n’est en fait qu’une péninsule de l’Asie';
const Q_COUVRE = "L'Océan mondial couvre 70,8 % de la surface de la Terre";
const Q_TROIS =
  "Les trois plus vastes – l'océan Pacifique, l'océan Atlantique, l'océan Indien – ont des surfaces respectives de 180, 106 et 75 millions de km²";
const Q_ARCTIQUE = 'est le plus petit avec ses 14 millions de km²';
const Q_ISTHME = 'reliées une bande de terre très étroite, un isthme en Amérique centrale';

const cont = { quote: Q_CINQ, src: G_CONTINENT };
const oc = { quote: Q_TROIS, src: G_OCEAN };

const CONTINENTS = ['europe', 'asie', 'afrique', 'amerique-nord', 'amerique-sud', 'oceanie', 'antarctique'];
const OCEANS = ['atlantique', 'pacifique', 'indien', 'arctique'];

const carteMonde = (rng: Rng, level: Level): QuestionDraft => {
  const hint = 'Repère d’abord les océans, puis place les terres autour d’eux.';
  if (level <= 2) {
    const pool = level === 1 ? [...CONTINENTS.slice(0, 3), 'pacifique'] : rng.pick([CONTINENTS, OCEANS]);
    return repereA(rng, 'monde', { pool, n: level === 1 ? 3 : 4, quoi: 'quel continent ou océan' }, hint);
  }
  const lieux = (zones: readonly string[]) => zones.map((zone) => ({ zone, cible: `la zone « ${nomZone(zone)} »` }));
  if (level === 5) return troisReperes(rng, 'monde', lieux([...CONTINENTS, ...OCEANS]), hint);
  return toucher(
    rng,
    'monde',
    lieux(level === 3 ? CONTINENTS : [...CONTINENTS, ...OCEANS]),
    (l) => (level === 3 ? `Sur le planisphère, touche ${l.cible}.` : `Sans aide : localise ${l.cible}.`),
    hint,
  );
};

const continents: Notion = {
  classe: '6e',
  id: 'g6-continents-oceans',
  title: 'Continents et océans',
  hint: 'Un continent est fait de terres émergées ; un océan est une vaste étendue d’eau salée.',
  memo: [
    'Un **continent** est une immense étendue de terres émergées ; l’**Océan mondial** couvre 70,8 % de la Terre.',
    'La tradition compte cinq continents (Afrique, Amérique, Asie, Europe, Océanie) ; l’Antarctique est aussi considéré comme un continent. Notre carte sépare l’Amérique du Nord et l’Amérique du Sud.',
    'On compte traditionnellement cinq océans : Pacifique, Atlantique et Indien sont les plus vastes, l’Arctique est le plus petit. Le cinquième, l’océan Antarctique, parfois vu comme leur prolongement, n’est pas dessiné à part sur notre **planisphère**.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qu’un continent ?',
      a: 'une immense étendue de terres émergées',
      wrong: faux(
        ['une vaste étendue d’eau salée', 'L’eau salée forme l’océan.'],
        ['une grande agglomération', 'Une agglomération est un espace urbain.'],
        ['une petite île isolée', 'Le continent se distingue des îles, isolées par la mer.'],
      ),
      gap: ['Un continent est une immense étendue de terres ', '.', ['émergées', 'emergees', 'émergés']],
      quote: Q_CONTINENT,
      explain: 'Les terres émergées dépassent de l’eau.',
      src: G_CONTINENT,
    },
    {
      q: 'Quelle part de la surface terrestre l’Océan mondial couvre-t-il ?',
      a: '70,8 %',
      wrong: faux(
        ['un quart', 'Un quart, c’est environ la part des terres émergées.'],
        ['10 %', 'C’est beaucoup trop peu : l’Océan domine la surface.'],
        ['la totalité', 'Il reste les terres émergées.'],
      ),
      gap: ['L’Océan mondial couvre ', ' % de la surface de la Terre.', ['70,8', '70.8', '71']],
      quote: Q_COUVRE,
      explain: 'Les terres émergées occupent le reste de la surface.',
      src: G_OCEAN,
    },
    {
      q: 'Quel est l’océan le plus vaste ?',
      a: 'l’océan Pacifique',
      wrong: faux(
        ['l’océan Atlantique', 'Il mesure 106 millions de km², moins que le Pacifique.'],
        ['l’océan Arctique', 'C’est le plus petit.'],
        ['l’océan Indien', 'Il mesure 75 millions de km².'],
      ),
      gap: ['Le plus vaste océan est l’océan ', '.', ['Pacifique']],
      explain: 'Le Pacifique mesure 180 millions de km².',
      ...oc,
    },
    {
      q: 'Quel océan, au nord, est le plus petit ?',
      a: 'l’océan Arctique',
      wrong: faux(
        ['l’océan Indien', 'Il est plus grand : 75 millions de km².'],
        ['l’océan Atlantique', 'Il est le deuxième par sa taille.'],
        ['l’océan Pacifique', 'C’est au contraire le plus vaste.'],
      ),
      gap: ['Le plus petit océan est l’océan ', '.', ['Arctique']],
      quote: Q_ARCTIQUE,
      explain: 'L’océan Arctique couvre 14 millions de km².',
      src: G_OCEAN,
    },
    {
      q: 'Quel ensemble de terres, au sud, est désormais aussi considéré comme un continent ?',
      a: 'l’Antarctique',
      wrong: faux(
        ['l’Arctique', 'L’Arctique est un océan, au nord.'],
        ['l’océan Indien', 'C’est de l’eau salée.'],
        ['la Méditerranée', 'C’est une mer.'],
      ),
      gap: ['Le continent inhabité du grand sud est l’', '.', ['Antarctique']],
      quote: Q_ANTARCTIQUE,
      explain: 'La liste traditionnelle des cinq continents, centrée sur l’espace habité, le laissait de côté.',
      src: G_CONTINENT,
    },
    {
      q: 'Selon Géoconfluences, l’Europe n’est en fait qu’une péninsule de quel continent ?',
      a: 'l’Asie',
      wrong: faux(
        ['l’Afrique', 'La ressource rattache l’Europe, comme péninsule, à un autre continent.'],
        ['l’Océanie', 'L’Océanie est loin de l’Europe.'],
        ['l’Amérique', 'L’Europe ne forme pas une péninsule de l’Amérique.'],
      ),
      gap: ['L’Europe est une péninsule de l’', '.', ['Asie']],
      quote: Q_PENINSULE,
      explain: 'Europe et Asie forment un même bloc de terres.',
      src: G_CONTINENT,
    },
  ],
  paires3: [
    ['Continent', 'immense étendue de terres émergées'],
    ['Océan mondial', 'couvre 70,8 % de la Terre'],
    ['Pacifique', 'le plus vaste océan'],
  ],
  paires5: [
    ['Pacifique', '180 millions de km²'],
    ['Atlantique', '106 millions de km²'],
    ['Indien', '75 millions de km²'],
    ['Arctique', '14 millions de km²'],
    ['Antarctique', 'continent inhabité du grand sud'],
  ],
  ordre: ['Pacifique', 'Atlantique', 'Indien', 'Arctique'],
  consigne: {
    prompt: 'Classe ces océans du plus vaste au plus petit.',
    hint: 'Le premier borde à la fois l’Asie et l’Amérique.',
    why: 'Pacifique 180, Atlantique 106, Indien 75, puis Arctique 14 millions de km².',
    fin: 'Le plus vaste est',
    quote: Q_TROIS,
    src: G_OCEAN,
  },
  libres: [
    libre(
      'quel est le plus vaste des océans ?',
      noms('Pacifique', 'océan ', 'l’océan ', 'le '),
      [
        ['Atlantique', 'L’Atlantique est le deuxième.'],
        ['Indien', 'L’océan Indien est le troisième.'],
      ],
      oc,
      'Le Pacifique couvre 180 millions de km².',
    ),
    libre(
      'quel est le deuxième océan par sa surface ?',
      noms('Atlantique', 'océan ', 'l’océan ', 'l’'),
      [
        ['Pacifique', 'Le Pacifique est le premier.'],
        ['Indien', 'L’océan Indien vient en troisième.'],
      ],
      oc,
      'L’Atlantique couvre 106 millions de km².',
    ),
    libre(
      'quel océan couvre environ 75 millions de km² ?',
      noms('Indien', 'océan ', 'l’océan ', 'l’'),
      [
        ['Atlantique', 'L’Atlantique couvre 106 millions de km².'],
        ['Arctique', 'L’Arctique est bien plus petit.'],
      ],
      oc,
      'C’est l’océan Indien.',
    ),
    libre(
      'quel est le plus petit océan, situé au nord ?',
      noms('Arctique', 'océan ', 'l’océan ', 'l’'),
      [
        ['Antarctique', 'L’Antarctique est au sud : on le considère comme un continent.'],
        ['Indien', 'L’océan Indien couvre 75 millions de km² : il est bien plus grand.'],
      ],
      { quote: Q_ARCTIQUE, src: G_OCEAN },
      'L’Arctique est le plus petit.',
    ),
    libre(
      'quel continent de terres inhabitées est exclu de la liste traditionnelle des cinq ?',
      noms('Antarctique', 'l’'),
      [
        ['Arctique', 'L’Arctique est un océan.'],
        ['Océanie', 'L’Océanie fait partie de la liste traditionnelle.'],
      ],
      { quote: Q_ANTARCTIQUE, src: G_CONTINENT },
      'Il s’agit de l’Antarctique.',
    ),
    libre(
      'comment appelle-t-on la bande de terre très étroite qui relie les deux Amériques ?',
      ['isthme', 'un isthme', 'l’isthme'],
      [
        ['détroit', 'Un détroit est un passage d’eau, pas de terre.'],
        ['delta', 'Un delta est une embouchure de fleuve.'],
      ],
      { quote: Q_ISTHME, src: G_CONTINENT },
      'Un isthme relie deux ensembles de terres.',
    ),
  ],
  docs: [
    {
      title: 'Carnet de bord d’une navigatrice',
      lines: [
        'Le bateau quitte l’Europe et traverse l’océan qui la sépare de l’Amérique.',
        'Après l’Amérique, la navigatrice entre dans le plus vaste océan de la planète.',
        'Elle note : « Les terres émergées ne couvrent qu’une petite partie du globe. »',
      ],
      qs: [
        {
          q: 'Dans quel océan la navigatrice entre-t-elle à la deuxième ligne ?',
          a: 'l’océan Pacifique',
          wrong: faux(
            ['l’océan Atlantique', 'C’est le deuxième par sa surface, traversé au départ.'],
            ['l’océan Indien', 'Il n’est pas le plus vaste.'],
          ),
          explain: 'Le plus vaste océan est le Pacifique.',
          ...oc,
        },
        {
          q: 'Quelle part de la surface terrestre les terres émergées occupent-elles environ ?',
          a: 'un quart',
          wrong: faux(
            ['les trois quarts', 'C’est environ la part de l’eau, pas celle des terres.'],
            ['la totalité', 'L’Océan couvre la plus grande part.'],
          ),
          quote: Q_QUART,
          explain: 'La ressource parle d’un quart de la surface terrestre.',
          src: G_CONTINENT,
        },
      ],
    },
    {
      title: 'Les cinq anneaux',
      lines: [
        'Devant le drapeau olympique, un élève compte cinq anneaux.',
        'Il lit que la liste traditionnelle compte aussi cinq continents habités.',
        'Une camarade ajoute : « Il manque pourtant des terres très froides, au grand sud. »',
      ],
      qs: [
        {
          q: 'De quel ensemble de terres parle la camarade ?',
          a: 'l’Antarctique',
          wrong: faux(
            ['l’océan Arctique', 'C’est un océan, situé au nord.'],
            ['l’Océanie', 'L’Océanie figure dans la liste.'],
          ),
          quote: Q_ANTARCTIQUE,
          explain: 'La liste traditionnelle exclut l’Antarctique, désormais aussi considéré comme un continent.',
          src: G_CONTINENT,
        },
        {
          q: 'Quel nom figure dans la liste traditionnelle des cinq continents ?',
          a: 'l’Océanie',
          wrong: faux(
            ['l’océan Pacifique', 'C’est un océan.'],
            ['l’Antarctique', 'Il est exclu de la liste traditionnelle.'],
          ),
          explain: 'La liste cite l’Afrique, l’Amérique, l’Asie, l’Europe et l’Océanie.',
          ...cont,
        },
      ],
    },
  ],
  sources: [G_CONTINENT, G_OCEAN],
  carte: carteMonde,
};

// ——— Notion 3 : grands fleuves et chaînes de montagnes ———

const G_FLEUVE = 'geoconfluences-fleuve-riviere';
const G_CONFLUENCE = 'geoconfluences-confluence';
const G_DELTA = 'geoconfluences-delta';
const G_HIMALAYA = 'geoconfluences-himalaya';
const G_GANGE = 'geoconfluences-gange';
const G_YANGZI = 'geoconfluences-yangzi';
const G_LITHIUM = 'geoconfluences-lithium';
const G_AMAZONIE = 'geoconfluences-amazonie';

const F_FLEUVE = {
  quote: 'Un fleuve est un cours d’eau dont l’exutoire est la mer ou l’océan.',
  src: G_FLEUVE,
};
const F_AFFLUENT = {
  quote:
    'Une rivière, elle, se jette dans un fleuve ou dans une autre rivière. On dit qu’elle est l’affluent de ce cours d’eau.',
  src: G_FLEUVE,
};
const F_CONFLUENT = { quote: 'Le point de rencontre s’appelle un confluent ou une confluence.', src: G_FLEUVE };
const F_BASSIN = {
  quote: 'L’ensemble formé par un fleuve et tous ses affluents s’appelle un bassin versant.',
  src: G_FLEUVE,
};
const F_DELTA = { quote: 'le fleuve se sépare alors en plusieurs bras', src: G_DELTA };
const F_NIL = { quote: 'comme ceux du Nil (Égypte), du Yangzi ou de la Rivière des Perles (Chine)', src: G_DELTA };
const F_MISSISSIPPI = { quote: 'comme ceux du Mississippi (États-Unis) ou du Mékong (Vietnam)', src: G_DELTA };
const F_AMAZONE = { quote: 'le fleuve Amazone ayant le bassin versant le plus important au monde', src: G_AMAZONIE };
const F_DANUBE = { quote: 'Belgrade (confluence du Danube et de la Save)', src: G_CONFLUENCE };
const F_YANGZI = {
  quote: 'est un fleuve chinois, le troisième du monde par sa longueur (6 300 km)',
  src: G_YANGZI,
};
const F_GANGE = {
  quote:
    'il court sur 2 500 km entre sa source au glacier de Gangotri (Uttarkhand) et le delta situé surtout au Bangladesh',
  src: G_GANGE,
};
const F_HIMALAYA = { quote: 'est la plus haute chaîne de montagne au monde', src: G_HIMALAYA };
const F_EVEREST = { quote: 'est le point culminant de la terre avec 8 849 m', src: G_HIMALAYA };
const F_ANDES = {
  quote:
    'dans l’Altiplano de la Cordillère des Andes, principalement au Chili (premier producteur mondial), en Argentine et en Bolivie',
  src: G_LITHIUM,
};
const F_ROCHEUSES = {
  quote: 'la très longue chaîne montagneuse située dans la partie occidentale des États-Unis et du Canada',
  src: 'academie-rocheux',
};
const F_ALPES = { quote: "Nom de la chaîne de montagnes qui sépare la France de l'Italie.", src: 'cnrtl-alpes' };
const F_CHAINE = {
  quote: 'Suite ininterrompue de montagnes généralement élevées caractérisées par une structure commune',
  src: 'cnrtl-chaine',
};

/** Fleuves du planisphère interrogés sur la carte. */
const FLEUVES = ['nil', 'amazone', 'mississippi', 'danube'];

const carteFleuves = (rng: Rng, level: Level): QuestionDraft => {
  const hint = 'Cherche sur quel continent coule le fleuve avant de suivre son tracé.';
  if (level <= 2) {
    return repereA(rng, 'monde', { pool: FLEUVES, n: level === 1 ? 3 : 4, quoi: 'quel fleuve' }, hint);
  }
  const indices: Record<string, string> = {
    nil: 'le fleuve dont le delta se trouve en Égypte',
    amazone: 'le fleuve au plus grand bassin versant du monde',
    mississippi: 'le fleuve dont le delta se trouve aux États-Unis',
    danube: 'le fleuve qui reçoit la Save à Belgrade',
  };
  const lieux = FLEUVES.map((zone) => ({
    zone,
    cible: level === 3 ? `le fleuve « ${nomZone(zone)} »` : (indices[zone] ?? ''),
  }));
  if (level === 5) return troisReperes(rng, 'monde', lieux, hint);
  return toucher(
    rng,
    'monde',
    lieux,
    (l) => (level === 3 ? `Sur le planisphère, touche ${l.cible}.` : `Sans aide : localise ${l.cible}.`),
    hint,
  );
};

const fleuves: Notion = {
  classe: '6e',
  id: 'g6-fleuves-montagnes',
  title: 'Grands fleuves et chaînes de montagnes',
  hint: 'Distingue le cours d’eau (il coule vers la mer) et le relief (une suite de sommets).',
  memo: [
    'Un **fleuve** rejoint la mer ou l’océan ; un **affluent** le rejoint à un **confluent**. L’ensemble forme un **bassin versant**.',
    'Grands fleuves : Amazone (plus grand bassin versant), Nil (delta en Égypte), Mississippi, Yangzi, Gange, Danube.',
    'Une **chaîne de montagnes** est une suite de sommets : Himalaya (la plus haute), Andes, Rocheuses, Alpes.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qui distingue un fleuve d’une rivière ?',
      a: 'un fleuve se jette dans la mer ou l’océan',
      wrong: faux(
        ['un fleuve se jette dans une rivière', 'C’est la rivière qui se jette dans un fleuve ou une autre rivière.'],
        ['un fleuve ne coule jamais', 'Un fleuve est un cours d’eau.'],
        ['un fleuve est toujours en montagne', 'Un fleuve se termine à la mer.'],
      ),
      gap: ['Un fleuve est un cours d’eau qui se jette dans la ', ' ou l’océan.', ['mer']],
      explain: 'L’exutoire est l’endroit où l’eau sort du bassin : pour un fleuve, la mer ou l’océan.',
      ...F_FLEUVE,
    },
    {
      q: 'Comment appelle-t-on une rivière qui se jette dans un autre cours d’eau ?',
      a: 'un affluent',
      wrong: faux(
        ['un delta', 'Un delta est une forme d’embouchure.'],
        ['un massif', 'Un massif est un relief.'],
        ['un continent', 'Un continent est une étendue de terres.'],
      ),
      gap: ['La rivière qui rejoint un autre cours d’eau est son ', '.', ['affluent']],
      explain: 'L’affluent apporte son eau au cours d’eau qu’il rejoint.',
      ...F_AFFLUENT,
    },
    {
      q: 'Comment appelle-t-on l’ensemble formé par un fleuve et tous ses affluents ?',
      a: 'un bassin versant',
      wrong: faux(
        ['une chaîne de montagnes', 'Une chaîne est une suite de montagnes.'],
        ['un planisphère', 'Un planisphère est une carte.'],
        ['un estuaire', 'Un estuaire est une embouchure.'],
      ),
      gap: ['Un fleuve et tous ses affluents forment un ', ' versant.', ['bassin']],
      explain: 'Toute l’eau de cet ensemble rejoint le même point de sortie.',
      ...F_BASSIN,
    },
    {
      q: 'Quel fleuve a le bassin versant le plus important au monde ?',
      a: 'l’Amazone',
      wrong: faux(
        ['le Danube', 'Le Danube est un fleuve d’Europe : son bassin n’est pas le plus grand.'],
        ['le Gange', 'Le Gange est le plus grand cours d’eau sud-asiatique, pas le plus grand bassin.'],
        ['le Nil', 'La source donne ce record à un autre fleuve.'],
      ),
      gap: ['Le fleuve au bassin versant le plus grand du monde est l’', '.', ['Amazone']],
      explain: 'La ressource cite son bassin comme le plus important de la planète.',
      ...F_AMAZONE,
    },
    {
      q: 'Dans quel pays se trouve le delta du Nil ?',
      a: 'en Égypte',
      wrong: faux(
        ['aux États-Unis', 'C’est le delta du Mississippi qui est aux États-Unis.'],
        ['en Chine', 'Le delta du Yangzi est en Chine.'],
        ['au Vietnam', 'Le delta du Mékong est au Vietnam.'],
      ),
      gap: ['Le delta du Nil se trouve en ', '.', ['Égypte', 'Egypte']],
      explain: 'La ressource cite le delta du Nil en Égypte.',
      ...F_NIL,
    },
    {
      q: 'Quel fleuve a son delta aux États-Unis ?',
      a: 'le Mississippi',
      wrong: faux(
        ['le Nil', 'Le delta du Nil est en Égypte.'],
        ['le Mékong', 'Le delta du Mékong est au Vietnam.'],
        ['le Yangzi', 'Le Yangzi coule en Chine.'],
      ),
      gap: ['Le fleuve dont le delta est aux États-Unis est le ', '.', ['Mississippi']],
      explain: 'La ressource associe le Mississippi aux États-Unis.',
      ...F_MISSISSIPPI,
    },
    {
      q: 'Où le delta du Gange se trouve-t-il surtout ?',
      a: 'au Bangladesh',
      wrong: faux(
        ['en Égypte', 'En Égypte se trouve le delta du Nil.'],
        ['au Vietnam', 'Au Vietnam se trouve le delta du Mékong.'],
        ['aux États-Unis', 'Aux États-Unis se trouve le delta du Mississippi.'],
      ),
      gap: ['Le Gange a son delta surtout au ', '.', ['Bangladesh']],
      explain: 'Le Gange court sur 2 500 km avant ce delta.',
      ...F_GANGE,
    },
    {
      q: 'Quelle est la plus haute chaîne de montagnes du monde ?',
      a: 'l’Himalaya',
      wrong: faux(
        ['les Alpes', 'Les Alpes séparent la France de l’Italie : elles sont moins hautes.'],
        ['les Rocheuses', 'Les Rocheuses sont en Amérique du Nord : elles sont moins hautes.'],
        ['les Andes', 'Les Andes sont très longues, mais l’Himalaya est plus haut.'],
      ),
      gap: ['La plus haute chaîne de montagnes du monde est l’', '.', ['Himalaya']],
      explain: 'Elle porte le sommet le plus élevé, l’Everest (8 849 m).',
      ...F_HIMALAYA,
    },
    {
      q: 'Quelle chaîne de montagnes sépare la France de l’Italie ?',
      a: 'les Alpes',
      wrong: faux(
        ['l’Himalaya', 'L’Himalaya est en Asie.'],
        ['les Andes', 'Les Andes sont en Amérique du Sud.'],
        ['les Rocheuses', 'Les Rocheuses sont en Amérique du Nord.'],
      ),
      gap: ['La chaîne qui sépare la France de l’Italie : les ', '.', ['Alpes']],
      explain: 'Les Alpes forment cette limite entre les deux pays.',
      ...F_ALPES,
    },
    {
      q: 'Quelle cordillère s’étend notamment au Chili, en Argentine et en Bolivie ?',
      a: 'les Andes',
      wrong: faux(
        ['les Alpes', 'Les Alpes séparent la France de l’Italie.'],
        ['l’Himalaya', 'L’Himalaya est la plus haute chaîne du monde, en Asie.'],
        ['les Rocheuses', 'Les Rocheuses sont dans l’ouest des États-Unis et du Canada.'],
      ),
      gap: ['La Cordillère des ', ' s’étend notamment au Chili et en Bolivie.', ['Andes']],
      explain: 'La Cordillère des Andes est en Amérique du Sud.',
      ...F_ANDES,
    },
  ],
  paires3: [
    ['Himalaya', 'la plus haute chaîne'],
    ['Alpes', 'entre la France et l’Italie'],
    ['Amazone', 'plus grand bassin versant'],
  ],
  paires5: [
    ['Nil', 'delta en Égypte'],
    ['Mississippi', 'delta aux États-Unis'],
    ['Gange', 'delta surtout au Bangladesh'],
    ['Rocheuses', 'ouest des États-Unis et du Canada'],
    ['Andes', 'Chili, Argentine, Bolivie'],
  ],
  ordre: ['Yangzi (6 300 km)', 'Gange (2 500 km)', 'Têt (115 km)', 'Dives (105 km)'],
  consigne: {
    prompt: 'Classe ces cours d’eau du plus long au plus court.',
    hint: 'Les deux fleuves côtiers français sont les plus courts.',
    why: 'Yangzi 6 300 km, Gange 2 500 km, Têt 115 km, Dives 105 km.',
    fin: 'Le plus long est',
    quote: 'la Dives, qui parcourt 105 kilomètres avant de se jeter dans la Manche ou la Têt, qui parcourt 115 km',
    src: G_FLEUVE,
  },
  libres: [
    libre(
      'comment s’appelle l’endroit où deux cours d’eau se rencontrent ?',
      ['confluent', 'un confluent', 'le confluent', 'confluence', 'une confluence', 'la confluence'],
      [
        ['affluent', 'L’affluent est le cours d’eau qui rejoint l’autre, pas le lieu de rencontre.'],
        ['delta', 'Un delta est une embouchure en plusieurs bras.'],
      ],
      F_CONFLUENT,
      'C’est le confluent, ou confluence.',
    ),
    libre(
      'comment appelle-t-on une embouchure où le fleuve se sépare en plusieurs bras ?',
      ['delta', 'un delta', 'le delta'],
      [
        ['estuaire', 'Un estuaire s’ouvre largement : le fleuve ne se divise pas en bras.'],
        ['confluent', 'Un confluent réunit deux cours d’eau.'],
      ],
      F_DELTA,
      'C’est un delta.',
    ),
    libre(
      'quel est le point culminant de la Terre, dans l’Himalaya ?',
      ['Everest', 'l’Everest', 'mont Everest', 'le mont Everest'],
      [
        ['mont Blanc', 'Le mont Blanc est dans les Alpes.'],
        ['Himalaya', 'L’Himalaya est la chaîne ; on demande son plus haut sommet.'],
      ],
      F_EVEREST,
      'L’Everest culmine à 8 849 m.',
    ),
    libre(
      'comment appelle-t-on l’endroit où un fleuve rejoint la mer ou l’océan ?',
      ['embouchure', 'l’embouchure', 'une embouchure'],
      [
        ['source', 'La source est le début du cours d’eau.'],
        ['affluent', 'Un affluent est une rivière qui rejoint un cours d’eau.'],
      ],
      { quote: 'On parle aussi d’embouchure pour l’endroit ou le fleuve rejoint l’océan.', src: G_FLEUVE },
      'L’embouchure est le lieu où le fleuve rejoint l’océan.',
    ),
    libre(
      'quel fleuve chinois est le troisième du monde par sa longueur ?',
      ['Yangzi', 'le Yangzi', 'Yangzi Jiang', 'Yang-Tsé-Kiang', 'Yang-Tsé'],
      [
        ['Gange', 'Le Gange coule en Inde et au Bangladesh.'],
        ['Mékong', 'Le delta du Mékong est au Vietnam.'],
      ],
      F_YANGZI,
      'Le Yangzi mesure 6 300 km.',
    ),
    libre(
      'quelle chaîne de montagnes très longue est située dans l’ouest des États-Unis et du Canada ?',
      ['Rocheuses', 'les Rocheuses', 'montagnes Rocheuses', 'les montagnes Rocheuses'],
      [
        ['Andes', 'Les Andes sont en Amérique du Sud.'],
        ['Alpes', 'Les Alpes sont en Europe.'],
      ],
      F_ROCHEUSES,
      'Ce sont les montagnes Rocheuses.',
    ),
    libre(
      'quel fleuve reçoit la Save à Belgrade ?',
      ['Danube', 'le Danube'],
      [
        ['Nil', 'Le Nil coule en Afrique.'],
        ['Rhône', 'Le Rhône reçoit la Saône à Lyon, pas la Save.'],
      ],
      F_DANUBE,
      'La confluence de Belgrade réunit le Danube et la Save.',
    ),
  ],
  docs: [
    {
      title: 'L’expédition fluviale',
      lines: [
        'Une équipe étudie un fleuve qui reçoit de très nombreuses rivières.',
        'À l’embouchure, le fleuve se divise en plusieurs bras sur une plaine.',
        'Le carnet précise que ce delta est en Égypte.',
      ],
      qs: [
        {
          q: 'De quel fleuve parle le carnet ?',
          a: 'le Nil',
          wrong: faux(
            ['le Mississippi', 'Le delta du Mississippi est aux États-Unis.'],
            ['le Yangzi', 'Le delta du Yangzi est en Chine.'],
          ),
          explain: 'Le delta cité en Égypte est celui du Nil.',
          ...F_NIL,
        },
        {
          q: 'Comment appelle-t-on les rivières qui rejoignent ce fleuve ?',
          a: 'des affluents',
          wrong: faux(
            ['des deltas', 'Un delta est la forme de l’embouchure.'],
            ['des massifs', 'Un massif est un relief.'],
          ),
          explain: 'Une rivière qui se jette dans un autre cours d’eau en est l’affluent.',
          ...F_AFFLUENT,
        },
      ],
    },
    {
      title: 'Les projets d’une alpiniste',
      lines: [
        'Une alpiniste rêve d’abord de la chaîne qui sépare la France de l’Italie.',
        'Puis elle veut gravir le point culminant de la Terre.',
      ],
      qs: [
        {
          q: 'Quelle est la première chaîne dont elle rêve ?',
          a: 'les Alpes',
          wrong: faux(
            ['l’Himalaya', 'L’Himalaya, en Asie, concerne sa deuxième étape.'],
            ['les Andes', 'Les Andes sont en Amérique du Sud.'],
          ),
          explain: 'Les Alpes séparent la France de l’Italie.',
          ...F_ALPES,
        },
        {
          q: 'Dans quelle chaîne se trouve le sommet de sa deuxième étape ?',
          a: 'l’Himalaya',
          wrong: faux(
            ['les Alpes', 'Les Alpes sont sa première étape.'],
            ['les Rocheuses', 'Les Rocheuses sont en Amérique du Nord.'],
          ),
          explain: 'Le point culminant de la Terre, l’Everest, est dans l’Himalaya.',
          ...F_EVEREST,
        },
      ],
    },
  ],
  sources: [F_CHAINE.src, 'cnrtl-cordillere'],
  carte: carteFleuves,
};

// ——— Notion 4 : les grandes métropoles ———

const G_METROPOLE = 'geoconfluences-metropole';
const G_MEGAPOLES = 'geoconfluences-megapoles';
const G_VILLES = 'geoconfluences-villes-mondiales';

const M_DEF = {
  quote: 'La métropole est avant tout un ensemble urbain de grande importance qui exerce des fonctions de commandement',
  src: G_METROPOLE,
};
const M_CRITERES = {
  quote:
    'Le poids et la croissance démographiques ne sont pas des critères déterminants dans la définition des métropoles.',
  src: G_METROPOLE,
};
const M_MEGAPOLE = {
  quote: "des populations égales ou supérieures à 10 millions d'habitants",
  src: G_MEGAPOLES,
};
const M_2025 = {
  quote:
    "33 mégapoles (megacities) dépassaient les dix millions d'habitants (dont 19 en Asie, 5 en Amérique latine, 4 en Afrique, 3 en Europe et 2 en Amérique du Nord)",
  src: G_MEGAPOLES,
};
const M_MONDIALE = {
  quote: "désigne les métropoles se situant au niveau supérieur de la hiérarchie urbaine à l'échelle mondiale",
  src: G_VILLES,
};
const M_TROIS = { quote: "il n'y avait que trois villes globales : Tokyo, Londres et New York", src: G_VILLES };

const metropoleDe = (nom: string) => {
  const m = METROPOLES.find((x) => x.nom === nom);
  if (!m) throw new Error(`Métropole inconnue : ${nom}`);
  return m;
};

const preuve = (nom: string) => {
  const m = metropoleDe(nom);
  return {
    quote: m.notice,
    src: m.src,
    montre: `La notice de la Bibliothèque nationale de France est « ${m.notice} » : ${m.nom} est ${m.pays}.`,
  };
};

/** « au Japon » → « Japon » : le nom du pays seul. */
const paysDe = (nom: string) => metropoleDe(nom).pays.replace(/^(au|aux|en) /, '');

const situer = (nom: string, autres: readonly string[]): Fait => {
  const m = metropoleDe(nom);
  return {
    q: `Dans quel pays se trouve la métropole de ${nom} ?`,
    a: m.pays,
    wrong: autres.map((o) => ({ label: metropoleDe(o).pays, why: `C’est le pays de ${o}.` })),
    gap: [`La métropole de ${nom} se trouve ${m.pays.split(' ')[0]} `, '.', ecritures(paysDe(nom))],
    explain: `${nom} est ${m.pays}.`,
    ...preuve(nom),
  };
};

/** Saisie du pays d’une métropole ; `variantes` : autres écritures justes. */
const paysLibre = (nom: string, autres: readonly [string, string], ...variantes: string[]): Libre => {
  const m = metropoleDe(nom);
  return libre(
    `dans quel pays se trouve la métropole de ${nom} ?`,
    [paysDe(nom), m.pays, ...variantes].flatMap((p) => ecritures(p)),
    autres.map((o) => [paysDe(o), `C’est le pays de ${o}.`]),
    preuve(nom),
    `${nom} est ${m.pays}.`,
  );
};

const carteMetropoles = (rng: Rng, level: Level): QuestionDraft | undefined => {
  if (level < 3) return undefined;
  const parContinent = ['asie', 'amerique-nord', 'amerique-sud', 'europe', 'afrique'].map((zone) => {
    const m = rng.pick(METROPOLES.filter((x) => x.continent === zone));
    return { zone, cible: `le continent de la métropole de ${m.nom}` };
  });
  const hint = 'Retrouve d’abord le pays de la métropole, puis son continent.';
  if (level === 5) return troisReperes(rng, 'monde', parContinent, hint);
  return toucher(
    rng,
    'monde',
    parContinent,
    (l) => (level === 3 ? `Sur le planisphère, touche ${l.cible}.` : `Sans aide : localise ${l.cible}.`),
    hint,
  );
};

const grandesMetropoles: Notion = {
  classe: '6e',
  id: 'g6-grandes-metropoles',
  title: 'Localiser les grandes métropoles',
  hint: 'Pense au pays de la ville, puis à son continent.',
  memo: [
    'Une **métropole** exerce des fonctions de commandement ; une **mégapole** compte au moins 10 millions d’habitants.',
    'Repères : Tokyo (Japon), New York (États-Unis), Londres (Royaume-Uni), Paris (France), Shanghai (Chine), São Paulo (Brésil), Le Caire (Égypte).',
    'Les **villes mondiales** sont au sommet de la hiérarchie urbaine. Une ville très peuplée n’est pas forcément une métropole influente.',
  ],
  faits: [
    {
      q: 'Qu’est-ce qui définit avant tout une métropole ?',
      a: 'des fonctions de commandement',
      wrong: faux(
        ['la présence d’un fleuve', 'Un cours d’eau ne suffit pas à faire une métropole.'],
        ['une altitude élevée', 'L’altitude ne définit pas une métropole.'],
        ['un très petit nombre d’habitants', 'Une métropole est un ensemble urbain de grande importance.'],
      ),
      gap: ['Une métropole exerce des fonctions de ', '.', ['commandement']],
      explain: 'Elle commande, organise et donne une impulsion à une région.',
      ...M_DEF,
    },
    {
      q: 'À partir de combien d’habitants parle-t-on de mégapole selon l’ONU ?',
      a: '10 millions',
      wrong: faux(
        ['100 000', 'C’est bien trop peu.'],
        ['1 million', 'Le seuil est dix fois plus élevé.'],
        ['100 millions', 'C’est dix fois trop.'],
      ),
      gap: ['Une mégapole compte au moins ', ' millions d’habitants.', ['10', 'dix']],
      explain: 'Certains géographes retiennent d’autres seuils, mais l’ONU fixe 10 millions.',
      ...M_MEGAPOLE,
    },
    {
      q: 'En 2025, sur quel continent se trouve le plus grand nombre de mégapoles ?',
      a: 'l’Asie',
      wrong: faux(
        ['l’Europe', 'L’Europe n’en compte que 3.'],
        ['l’Amérique du Nord', 'Elle n’en compte que 2.'],
        ['l’Afrique', 'L’Afrique en compte 4.'],
      ),
      gap: ['Le continent qui compte le plus de mégapoles en 2025 est l’', '.', ['Asie']],
      explain: 'L’Asie en compte 19 sur 33.',
      ...M_2025,
    },
    situer('Tokyo', ['Shanghai', 'Séoul', 'Bangkok']),
    situer('Shanghai', ['Tokyo', 'Jakarta', 'Bangkok']),
    situer('New York', ['São Paulo', 'Londres', 'Le Caire']),
    situer('Londres', ['Paris', 'New York', 'Le Caire']),
    situer('São Paulo', ['New York', 'Le Caire', 'Paris']),
    situer('Le Caire', ['Londres', 'São Paulo', 'Bangkok']),
  ],
  paires3: [
    ['Tokyo', 'Japon'],
    ['New York', 'États-Unis'],
    ['Le Caire', 'Égypte'],
  ],
  paires5: [
    ['Shanghai', 'Chine'],
    ['Jakarta', 'Indonésie'],
    ['São Paulo', 'Brésil'],
    ['Londres', 'Royaume-Uni'],
    ['Séoul', 'Corée du Sud'],
  ],
  ordre: ['Asie', 'Amérique latine', 'Afrique', 'Europe', 'Amérique du Nord'],
  consigne: {
    prompt: 'En 2025, classe ces régions selon leur nombre de mégapoles, de la plus à la moins nombreuse.',
    hint: 'L’Asie est largement en tête ; l’Amérique du Nord ferme la liste.',
    why: 'Asie 19, Amérique latine 5, Afrique 4, Europe 3, Amérique du Nord 2.',
    fin: 'La région qui en compte le plus est',
    ...M_2025,
  },
  libres: [
    paysLibre('Tokyo', ['Shanghai', 'Séoul'], 'le Japon'),
    paysLibre('Shanghai', ['Tokyo', 'Jakarta'], 'la Chine'),
    paysLibre('Jakarta', ['Bangkok', 'Shanghai'], 'l’Indonésie'),
    paysLibre('Séoul', ['Tokyo', 'Shanghai'], 'la Corée du Sud', 'Corée'),
    paysLibre('Bangkok', ['Jakarta', 'Séoul'], 'la Thaïlande'),
    paysLibre('New York', ['São Paulo', 'Londres'], 'les États-Unis', 'USA', 'Etats-Unis d’Amérique'),
    paysLibre('São Paulo', ['New York', 'Le Caire'], 'le Brésil'),
    paysLibre('Le Caire', ['São Paulo', 'Londres'], 'l’Égypte'),
    paysLibre('Londres', ['Paris', 'New York'], 'le Royaume-Uni', 'Angleterre', 'l’Angleterre'),
  ],
  docs: [
    {
      title: 'Des villes qui commandent',
      lines: [
        'Un reportage compare des villes au sommet de la hiérarchie urbaine mondiale.',
        'Une première analyse retenait seulement trois villes globales.',
        'L’une est au Japon, l’autre au Royaume-Uni, la dernière aux États-Unis.',
      ],
      qs: [
        {
          q: 'Quelles étaient ces trois villes globales ?',
          a: 'Tokyo, Londres et New York',
          wrong: faux(
            ['Paris, Shanghai et Le Caire', 'Ces villes sont des repères, mais pas ces trois villes-là.'],
            [
              'Séoul, Jakarta et Bangkok',
              'Ces trois villes sont en Asie : l’analyse citait aussi l’Europe et l’Amérique.',
            ],
          ),
          explain: 'Le classement initial retenait Tokyo, Londres et New York.',
          ...M_TROIS,
        },
        {
          q: 'Comment appelle-t-on les métropoles au niveau supérieur de la hiérarchie urbaine mondiale ?',
          a: 'des villes mondiales',
          wrong: faux(
            ['des chefs-lieux', 'Un chef-lieu est le centre administratif d’une circonscription.'],
            ['des préfectures', 'La préfecture concerne un département français.'],
          ),
          explain: 'On les appelle villes mondiales, ou villes globales.',
          ...M_MONDIALE,
        },
      ],
    },
    {
      title: 'La ville la plus peuplée',
      lines: [
        'Une ville dépasse les dix millions d’habitants.',
        'Un élève affirme : « Elle exerce donc forcément un grand pouvoir sur le monde. »',
      ],
      qs: [
        {
          q: 'Comment nomme-t-on, selon l’ONU, une agglomération de cette taille ?',
          a: 'une mégapole',
          wrong: faux(
            ['un chef-lieu', 'Un chef-lieu est un centre administratif.'],
            ['un bassin versant', 'Un bassin versant concerne les fleuves.'],
          ),
          explain: 'À partir de 10 millions d’habitants, on parle de mégapole.',
          ...M_MEGAPOLE,
        },
        {
          q: 'Que faut-il répondre à l’élève ?',
          a: 'la population ne suffit pas à définir une métropole',
          wrong: faux(
            [
              'il a raison, la population fait tout',
              'La ressource dit que le poids démographique n’est pas déterminant.',
            ],
            ['une ville peuplée n’est jamais une métropole', 'Certaines grandes villes sont bien des métropoles.'],
          ),
          explain: 'Les fonctions de commandement comptent davantage que le nombre d’habitants.',
          ...M_CRITERES,
        },
      ],
    },
  ],
  carte: carteMetropoles,
};

export const NOTIONS: readonly Notion[] = [prefectures, continents, fleuves, grandesMetropoles];

/** La notion historique garde son identifiant ; ses énoncés changent (version 2). */
export const SKILLS: readonly Skill[] = NOTIONS.map((n) =>
  n.id === 'g6-prefectures' ? { ...notion(n), version: 2 } : notion(n),
);
