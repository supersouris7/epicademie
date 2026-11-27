import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { ordre } from '../st/outils.ts';
import { PROGRAMME } from './donnees-terre.ts';
import { qcm } from './kit.ts';
import { associer, document, ecrire, variantes } from './terre-kit.ts';

// ——— Roches : sédimentaires, magmatiques (plutoniques, volcaniques), métamorphiques ———

type Famille = 'sédimentaire' | 'magmatique' | 'métamorphique';
const FAMILLES: readonly Famille[] = ['sédimentaire', 'magmatique', 'métamorphique'];

const FORMATION: Readonly<Record<Famille, string>> = {
  sédimentaire: 'se forme à partir de particules déposées en couches, puis compactées et cimentées',
  magmatique: 'provient de la solidification d’un magma',
  métamorphique: 'résulte d’une transformation à l’état solide, sous l’effet de la pression et de la température',
};

/** Pourquoi : le mot qui trahit chaque famille. */
const REPERES: Readonly<Record<Famille, string>> = {
  sédimentaire: 'Les mots « dépôt » et « couches » signent une roche sédimentaire.',
  magmatique: 'Le mot « magma » (roche fondue) signe une roche magmatique.',
  métamorphique: 'La roche change sans fondre : « méta-morphose » veut dire changement de forme.',
};

const familleQcm = (rng: Rng, f: Famille, seconds: number) =>
  qcm(
    rng,
    {
      prompt: `Voici une roche : elle ${FORMATION[f]}. À quelle famille appartient-elle ?`,
      bonne: f,
      fausses: FAMILLES.filter((x) => x !== f).map((x) => [x, `Une roche ${x} ${FORMATION[x]}.`]),
      indice: 'Dépôt, fusion puis refroidissement, ou transformation sans fondre ?',
      explication: [`La famille se déduit du mode de formation : ici, la roche ${FORMATION[f]}.`, REPERES[f]],
    },
    seconds,
  );

type Groupe = 'sédimentaire' | 'plutonique' | 'volcanique' | 'métamorphique';

const GROUPES: Readonly<Record<Groupe, { readonly nom: string; readonly regle: string }>> = {
  sédimentaire: {
    nom: 'les roches sédimentaires',
    regle: 'Une roche sédimentaire se forme à partir de dépôts en couches.',
  },
  plutonique: {
    nom: 'les roches magmatiques plutoniques',
    regle: 'Une roche plutonique vient d’un magma refroidi lentement en profondeur.',
  },
  volcanique: {
    nom: 'les roches magmatiques volcaniques',
    regle: 'Une roche volcanique vient d’un magma refroidi brutalement en surface.',
  },
  métamorphique: {
    nom: 'les roches métamorphiques',
    regle: 'Une roche métamorphique s’est transformée à l’état solide.',
  },
};

/** Exemples sourcés : nom, famille, groupe et précision utile à la correction. */
const EXEMPLES: readonly {
  readonly nom: string;
  readonly f: Famille;
  readonly groupe: Groupe;
  readonly pourquoi: string;
}[] = [
  { nom: 'le grès', f: 'sédimentaire', groupe: 'sédimentaire', pourquoi: 'c’est un sable cimenté après compaction' },
  {
    nom: 'la craie',
    f: 'sédimentaire',
    groupe: 'sédimentaire',
    pourquoi: 'c’est une accumulation de micro-coquilles de petits organismes',
  },
  {
    nom: 'le granite',
    f: 'magmatique',
    groupe: 'plutonique',
    pourquoi: 'il vient de la cristallisation d’un magma en profondeur',
  },
  { nom: 'le basalte', f: 'magmatique', groupe: 'volcanique', pourquoi: 'c’est un magma refroidi en surface' },
  {
    nom: 'le gneiss',
    f: 'métamorphique',
    groupe: 'métamorphique',
    pourquoi: 'c’est une roche transformée, à lits clairs et sombres',
  },
  {
    nom: 'le schiste',
    f: 'métamorphique',
    groupe: 'métamorphique',
    pourquoi: 'ses minéraux transformés s’orientent en feuillets',
  },
];

const DEFS = {
  sédimentaire: 'une roche formée par l’accumulation de particules déposées par l’eau ou le vent',
  magmatique: 'une roche issue de la solidification d’un magma',
  métamorphique: 'une roche transformée à l’état solide par la pression et la température',
  plutonique: 'une roche magmatique à gros cristaux, refroidie lentement en profondeur',
  volcanique: 'une roche magmatique refroidie brutalement après être montée en surface',
  strate: 'une couche de sédiments empilée sur d’autres',
} as const;
type Terme = keyof typeof DEFS;

const GRES = [
  'Des roches en surface sont altérées et érodées',
  'Les particules sont transportées par l’eau ou le vent',
  'Elles se déposent en sédiments',
  'Les couches s’empilent et se compactent',
  'Les grains sont cimentés entre eux',
];

const PROFOND = [
  'Une roche s’enfouit en profondeur',
  'La pression et la température augmentent',
  'La roche fond et forme un magma',
  'Le magma monte',
  'Il refroidit et cristallise en une roche magmatique',
];

const SAISIES: readonly {
  readonly t: Terme;
  readonly accepted: readonly string[];
  readonly erreurs: readonly Terme[];
  /** Réponse juste mais trop large ou trop précise : explication propre. */
  readonly autres?: readonly (readonly [string, string])[];
}[] = [
  { t: 'sédimentaire', accepted: variantes('sédimentaire', 'une roche', 'roche'), erreurs: ['métamorphique'] },
  {
    t: 'magmatique',
    accepted: variantes('magmatique', 'une roche', 'roche'),
    erreurs: ['métamorphique', 'sédimentaire'],
    autres: [['volcanique', '« volcanique » ne désigne qu’une partie des roches issues d’un magma.']],
  },
  { t: 'métamorphique', accepted: variantes('métamorphique', 'une roche', 'roche'), erreurs: ['magmatique'] },
  {
    t: 'plutonique',
    accepted: variantes('plutonique', 'une roche', 'roche'),
    erreurs: ['volcanique'],
    autres: [['magmatique', 'C’est bien une roche magmatique, mais on attend l’adjectif plus précis.']],
  },
  {
    t: 'volcanique',
    accepted: variantes('volcanique', 'une roche', 'roche'),
    erreurs: ['plutonique'],
    autres: [['magmatique', 'C’est bien une roche magmatique, mais on attend l’adjectif plus précis.']],
  },
  { t: 'strate', accepted: [...variantes('strate', 'une', 'la'), 'strates', 'des strates'], erreurs: [] },
];

interface Echantillon {
  readonly indices: string;
  readonly nom: string;
  readonly famille: Famille;
  /** L’observation décisive. */
  readonly pourquoi: string;
}

const ECHANTILLONS: readonly Echantillon[] = [
  {
    indices: 'gros cristaux de quartz, de feldspath et de mica serrés sans espace',
    nom: 'granite',
    famille: 'magmatique',
    pourquoi: 'De gros cristaux serrés montrent un magma refroidi lentement en profondeur : c’est le granite.',
  },
  {
    indices: 'roche sombre à pâte compacte, sans grains visibles, près d’un volcan',
    nom: 'basalte',
    famille: 'magmatique',
    pourquoi: 'Une pâte sombre sans grains visibles montre une lave refroidie vite en surface : c’est le basalte.',
  },
  {
    indices: 'grains de sable collés par un ciment, disposés en couches',
    nom: 'grès',
    famille: 'sédimentaire',
    pourquoi: 'Un sable déposé en couches puis cimenté donne le grès.',
  },
  {
    indices: 'roche blanche et friable (elle s’effrite) formée de minuscules coquilles',
    nom: 'craie',
    famille: 'sédimentaire',
    pourquoi: 'Une accumulation de minuscules coquilles donne une roche blanche et tendre : la craie.',
  },
  {
    indices: 'lits clairs et lits sombres alternés, minéraux transformés sans fusion',
    nom: 'gneiss',
    famille: 'métamorphique',
    pourquoi: 'Des lits clairs et sombres formés sans fusion sont la marque du gneiss.',
  },
];

/** Niveau 3 : remettre en ordre et compléter. */
function appliquer(rng: Rng): QuestionDraft {
  const forme = rng.int(0, 2);
  if (forme === 0) {
    const gres = rng.int(0, 1) === 0;
    const suite = gres ? GRES : PROFOND;
    return {
      prompt: gres
        ? 'Remets dans l’ordre la formation d’un grès.'
        : 'Remets dans l’ordre le trajet d’une roche qui devient magmatique après avoir fondu.',
      answer: ordre(rng, suite),
      hint: gres ? 'Tout commence par l’usure d’une roche en surface.' : 'La roche doit d’abord s’enfouir.',
      steps: [
        gres
          ? 'Érosion, transport, dépôt, compaction, cimentation.'
          : 'Enfouissement, fusion, remontée, refroidissement.',
        `Dernière étape : **${suite[suite.length - 1]}**.`,
      ],
      targetSeconds: 60,
    };
  }
  if (forme === 1) {
    const lente = rng.int(0, 1) === 0;
    return {
      prompt: `Complète : un magma qui refroidit ${lente ? 'lentement en profondeur' : 'brutalement en surface'}.`,
      answer: {
        kind: 'cloze',
        parts: ['Les cristaux sont ', ' et la roche est dite ', '.'],
        blanks: [
          { mode: 'list', options: ['gros', 'très petits ou invisibles'], correct: lente ? 0 : 1 },
          { mode: 'list', options: ['plutonique', 'volcanique', 'sédimentaire'], correct: lente ? 0 : 1 },
        ],
      },
      hint: 'La vitesse de refroidissement joue sur la taille des cristaux.',
      steps: [
        lente
          ? 'Un refroidissement lent laisse les cristaux grandir.'
          : 'Un refroidissement brutal ne laisse pas aux cristaux le temps de grandir.',
        `La roche est **${lente ? 'plutonique' : 'volcanique'}**.`,
      ],
      targetSeconds: 35,
    };
  }
  return {
    prompt: 'Complète la formation d’une roche métamorphique.',
    answer: {
      kind: 'cloze',
      parts: ['La roche se transforme en restant à l’état ', ', quand la pression et la température ', '.'],
      blanks: [
        { mode: 'list', options: ['solide', 'liquide', 'gazeux'], correct: 0 },
        { mode: 'list', options: ['diminuent', 'augmentent', 'disparaissent'], correct: 1 },
      ],
    },
    hint: 'Si elle fondait, on obtiendrait un magma.',
    steps: [
      'Le métamorphisme transforme les minéraux sans fusion.',
      'La roche reste **solide** quand pression et température **augmentent**.',
    ],
    targetSeconds: 35,
  };
}

/** Niveau 5 : carnet de terrain inventé. */
function carnet(rng: Rng): QuestionDraft {
  const lieu = rng.pick(['Ambel', 'Kerlou', 'Auches']);
  const e = rng.pick(ECHANTILLONS);
  const lines = [
    `Carnet de terrain « ${lieu} » (lieu inventé).`,
    `Échantillon : ${e.indices}.`,
    'On cherche à raconter comment cette roche s’est formée.',
  ];
  const figure = document(`Échantillon : ${lieu}`, lines);
  if (rng.int(0, 1) === 0) {
    const autres = rng.shuffle(ECHANTILLONS.filter((x) => x.nom !== e.nom)).slice(0, 3);
    const q = qcm(
      rng,
      {
        prompt: `D’après le carnet de terrain « ${lieu} » (${e.indices}), de quelle roche s’agit-il le plus probablement ?`,
        bonne: e.nom,
        fausses: autres.map((a) => [a.nom, `On attendrait plutôt : ${a.indices}.`]),
        indice: 'Relis l’aspect des grains : cristaux, grains collés, coquilles ou lits ?',
        explication: [e.pourquoi],
      },
      55,
    );
    return { ...q, figure };
  }
  const histoire: Readonly<Record<Famille, string>> = {
    magmatique: 'Un magma s’est refroidi et a cristallisé',
    sédimentaire: 'Des particules se sont déposées en couches puis ont été compactées et cimentées',
    métamorphique: 'Une roche s’est transformée à l’état solide sous pression et température élevées',
  };
  const q = qcm(
    rng,
    {
      prompt: `D’après le carnet de terrain « ${lieu} » (${e.indices}), quelle histoire explique cette roche ?`,
      bonne: histoire[e.famille],
      fausses: FAMILLES.filter((x) => x !== e.famille).map((x) => [
        histoire[x],
        `Cette histoire donnerait une roche ${x}.`,
      ]),
      indice: 'Identifie d’abord la famille de la roche.',
      explication: [e.pourquoi, `C’est donc une roche ${e.famille} : elle ${FORMATION[e.famille]}.`],
    },
    55,
  );
  return { ...q, figure };
}

export const roches: Skill = {
  id: 'v4-roches',
  title: 'Les roches',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Trois familles : une **roche sédimentaire** vient de dépôts en **strates** (grès, craie) ; une **roche métamorphique** s’est transformée à l’état solide (gneiss, schiste).',
      'Une **roche magmatique** vient d’un magma refroidi : lentement en profondeur, elle a de gros cristaux (**plutonique** : granite) ; vite en surface, elle est **volcanique** (basalte).',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Expliquer quelques phénomènes géologiques à partir du contexte géodynamique global. »`,
    sources: [
      PROGRAMME,
      'brgm-cycle-roches',
      'brgm-tour-geologique',
      'academie-magmatique',
      'academie-sedimentaire',
      'academie-gneiss',
      'academie-metamorphique',
      'academie-sediment',
      'academie-metamorphisme',
      'academie-granite',
      'academie-basalte',
      'academie-craie',
      'academie-plutonique',
    ],
  },
  generate: (rng, level) => {
    if (level === 1) return familleQcm(rng, rng.pick(FAMILLES), 30);
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const e = rng.pick(EXEMPLES);
        const bonne = GROUPES[e.groupe];
        return qcm(
          rng,
          {
            prompt: `Dans quel groupe de roches classe-t-on ${e.nom} ?`,
            bonne: bonne.nom,
            fausses: Object.values(GROUPES)
              .filter((g) => g !== bonne)
              .map((g) => [g.nom, g.regle] as const),
            indice: 'Pense à la manière dont cette roche s’est formée.',
            explication: [`En effet, ${e.pourquoi}.`],
          },
          35,
        );
      }
      const choix = FAMILLES.map((f) => rng.pick(EXEMPLES.filter((e) => e.f === f)));
      return associer(
        rng,
        choix.map((c) => [c.nom, `roche ${c.f}`] as const),
        {
          prompt: `Associe chaque roche à sa famille : ${choix.map((c) => c.nom).join(', ')}.`,
          indice: 'Dépôt en couches, magma refroidi ou transformation sans fusion ?',
          explication: 'On relie chaque roche à son mode de formation.',
        },
        45,
      );
    }
    if (level === 3) return appliquer(rng);
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        const serie = rng.int(0, 1);
        const paires: readonly (readonly [string, string])[] =
          serie === 0
            ? (['sédimentaire', 'métamorphique', 'plutonique', 'volcanique', 'strate'] as const).map(
                (t) => [t, DEFS[t]] as const,
              )
            : EXEMPLES.filter((e) => e.nom !== 'le gneiss').map((e) => [e.nom, e.pourquoi] as const);
        return associer(
          rng,
          paires,
          {
            prompt:
              serie === 0
                ? 'Associe chaque mot des roches à sa définition.'
                : 'Associe chaque roche à ce qui explique sa formation.',
            indice: 'Repère d’abord les roches ou les mots les plus faciles.',
            explication: 'On relie chaque élément à son mode de formation.',
          },
          75,
        );
      }
      const s = rng.pick(SAISIES);
      if (s.t === 'strate') {
        return ecrire(
          {
            prompt: `Écris le terme qui désigne ${DEFS[s.t]}.`,
            accepted: s.accepted,
            erreurs: [
              ['sédiment', 'Un sédiment est le dépôt de particules ; une couche porte un autre nom.'],
              ['cristal', 'Un cristal est un grain minéral, pas une couche.'],
            ],
            indice: 'Ce mot désigne une couche, souvent visible dans les falaises.',
            explication: `La définition décrit ${DEFS[s.t]}.`,
          },
          35,
        );
      }
      return ecrire(
        {
          prompt: `Comment nomme-t-on ${DEFS[s.t]} ? Écris l’adjectif.`,
          accepted: s.accepted,
          erreurs: [...s.erreurs.map((e) => [e, `« ${e} » désigne ${DEFS[e]}.`] as const), ...(s.autres ?? [])],
          indice: 'Pense à la manière dont la roche s’est formée.',
          explication: `La définition décrit ${DEFS[s.t]}.`,
        },
        35,
      );
    }
    return carnet(rng);
  },
};
