import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-mouvement-energie.ts';
import { association } from './outils.ts';

// ——— Vitesse d'un mouvement uniforme : valeur calculée à partir de la distance et de la durée (6e) ———
// Programme : seul le calcul de la valeur de la vitesse est exigible (ni distance ni durée à partir de la vitesse).

const grand = (n: number) => n.toLocaleString('fr-FR');

const MOBILES = ['un robot', 'un chariot', 'une trottinette', 'un drone', 'un train miniature'];
const REGLE = 'Vitesse = distance parcourue ÷ durée.';
const uniforme = (m: string, d: string, t: string) => `En mouvement uniforme, ${m} parcourt ${d} en ${t}.`;

/** Vitesse entière et durée : la distance en découle, la division tombe juste. */
const tirage = (rng: Rng) => {
  const v = rng.int(3, 12);
  const t = rng.pick([2, 4, 5, 6, 8, 10].filter((x) => x !== v));
  return { v, t, d: v * t, mobile: rng.pick(MOBILES) };
};

const pieges = (v: number, d: number, t: number) =>
  traps(r(v), [
    [d * t, `Tu as multiplié. ${REGLE}`],
    [d - t, `Tu as soustrait. ${REGLE}`],
    [d + t, `Tu as additionné. ${REGLE}`],
    [r(t, d), `Tu as divisé dans le mauvais sens. ${REGLE}`],
  ]);

const niveau1 = (rng: Rng): QuestionDraft => {
  const { d, t, mobile } = tirage(rng);
  const bon = `${d} ÷ ${t}`;
  const { answer, traps: tr } = choice(rng, bon, [
    { label: `${d} × ${t}`, why: `La vitesse n’est pas un produit. ${REGLE}` },
    { label: `${t} ÷ ${d}`, why: `On divise la distance par la durée, pas l’inverse. ${REGLE}` },
  ]);
  return {
    prompt: `${uniforme(mobile, `${d} m`, `${t} s`)} Quel calcul donne sa vitesse en m/s ?`,
    answer,
    traps: tr,
    hint: 'L’unité m/s se lit « mètres par seconde » : combien de mètres pour une seconde ?',
    steps: [REGLE, `Le calcul est **${bon}**.`],
    targetSeconds: 25,
  };
};

const CONVERSIONS: readonly (readonly [string, string])[] = [
  ['1 km', '1 000 m'],
  ['1 min', '60 s'],
  ['1 h', '60 min'],
  ['1 jour', '24 h'],
  ['1 h 30 min', '90 min'],
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const paires = rng.shuffle(CONVERSIONS).slice(0, 3);
    return {
      prompt: `Associe les mesures égales : ${paires
        .map((p) => p[0])
        .sort()
        .join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Distingue les distances et les durées avant d’associer.',
      steps: [
        '1 km = 1 000 m ; 1 jour = 24 h ; 1 h = 60 min ; 1 min = 60 s.',
        `Réponse : **${paires.map(([a, b]) => `${a} = ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const { v, t, d, mobile } = tirage(rng);
  const bon = `${v} m/s`;
  const { answer, traps: tr } = choice(rng, bon, [
    { label: `${d * t} m/s`, why: `Tu as multiplié la distance par la durée. ${REGLE}` },
    { label: `${d - t} m/s`, why: `Tu as soustrait la durée de la distance. ${REGLE}` },
    { label: `${v} s/m`, why: 'L’unité est inversée : une vitesse s’écrit ici en mètres par seconde (m/s).' },
  ]);
  return {
    prompt: `${uniforme(mobile, `${d} m`, `${t} s`)} Quelle est sa vitesse ?`,
    answer,
    traps: tr,
    hint: 'Cherche la distance parcourue pendant une seule seconde, et vérifie l’unité.',
    steps: [REGLE, `${d} ÷ ${t} = ${v}.`, `La vitesse est **${bon}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const { v, t, d, mobile } = tirage(rng);
  const forme = rng.int(0, 2);
  if (forme === 0) {
    const h = rng.int(2, 5);
    const kmh = rng.int(12, 95);
    const km = h * kmh;
    return {
      prompt: `${uniforme('un véhicule', `${km} km`, `${h} h`)} Calcule sa vitesse en km/h.`,
      answer: num(kmh, 'km/h'),
      traps: pieges(kmh, km, h),
      hint: 'Les kilomètres par heure disent combien de kilomètres sont parcourus en une heure.',
      steps: [REGLE, `${km} ÷ ${h} = ${kmh}.`, `La vitesse est **${kmh} km/h**.`],
      targetSeconds: 45,
    };
  }
  if (forme === 1) {
    return {
      prompt: `${uniforme(mobile, `${d} m`, `${t} s`)} Complète le calcul de sa vitesse.`,
      answer: {
        kind: 'cloze',
        parts: ['Vitesse = ', ' ÷ ', ' = ', ' m/s.'],
        blanks: [
          { mode: 'text', accepted: [String(d)] },
          { mode: 'text', accepted: [String(t)] },
          { mode: 'text', accepted: [String(v)] },
        ],
      },
      hint: 'La distance s’écrit en premier, la durée en second.',
      steps: [REGLE, `Réponse : **${d} ÷ ${t} = ${v} m/s**.`],
      targetSeconds: 45,
    };
  }
  return {
    prompt: `${uniforme(mobile, `${d} m`, `${t} s`)} Calcule sa vitesse en m/s.`,
    answer: num(v, 'm/s'),
    traps: pieges(v, d, t),
    hint: 'Partage la distance entre toutes les secondes.',
    steps: [REGLE, `${d} ÷ ${t} = ${v}.`, `La vitesse est **${v} m/s**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const forme = rng.int(0, 2);
  if (forme === 0) {
    // Distance en kilomètres et durée en minutes, vitesse demandée en m/s.
    const min = rng.int(2, 6);
    const v = rng.pick([5, 10, 15, 20, 25]);
    const metres = v * min * 60;
    const km = (metres / 1000).toLocaleString('fr-FR');
    return {
      prompt: `${uniforme('une voiture', `${km} km`, `${min} min`)} Calcule sa vitesse en m/s.`,
      answer: num(v, 'm/s'),
      traps: traps(r(v), [
        [r(metres, min), 'Tu as trouvé des mètres par minute : convertis aussi la durée en secondes.'],
        [metres * min * 60, `Tu as multiplié. ${REGLE}`],
      ]),
      hint: 'Convertis d’abord la distance en mètres et la durée en secondes.',
      steps: [
        `${km} km = ${metres} m ; ${min} min = ${min * 60} s.`,
        `${metres} ÷ ${min * 60} = ${v}.`,
        `La vitesse est **${v} m/s**.`,
      ],
      targetSeconds: 80,
    };
  }
  if (forme === 1) {
    // Révolution d'une planète imaginaire : jours à convertir en heures.
    const lettre = rng.pick(['A', 'B', 'C', 'D']);
    const jours = rng.pick([5, 10, 20, 50]);
    const v = rng.int(2, 9) * 10000;
    const km = v * jours * 24;
    return {
      prompt: `Données de l’exercice : autour de son étoile, la planète imaginaire ${lettre} parcourt ${grand(km)} km en ${jours} jours, en mouvement uniforme. Calcule sa vitesse en km/h.`,
      answer: num(v, 'km/h'),
      traps: traps(r(v), [
        [v * 24, 'Tu as trouvé des kilomètres par jour : convertis les jours en heures.'],
        [r(km, jours * 60), 'Un jour compte 24 heures, pas 60.'],
      ]),
      hint: 'Combien d’heures durent ces jours ?',
      steps: [
        `${jours} jours = ${jours} × 24 = ${jours * 24} h.`,
        `${grand(km)} ÷ ${jours * 24} = ${grand(v)}.`,
        `La vitesse est **${grand(v)} km/h**.`,
      ],
      targetSeconds: 90,
    };
  }
  const paires: readonly (readonly [string, string])[] = [
    ['3 km', '3 000 m'],
    ['3 min', '180 s'],
    ['3 h', '180 min'],
    ['3 jours', '72 h'],
    ['1 h 3 min', '63 min'],
  ];
  return {
    prompt: 'Associe chaque mesure à son écriture dans une autre unité.',
    answer: association(rng, paires),
    hint: 'Attention : deux écritures contiennent le même nombre mais pas la même unité.',
    steps: [
      '1 km = 1 000 m ; 1 jour = 24 h ; 1 h = 60 min ; 1 min = 60 s.',
      `Réponse : **${paires.map(([a, b]) => `${a} = ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 75,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const v = rng.int(3, 9);
  const pas = rng.pick([2, 5, 10]);
  // La phase A est uniforme ; en phase B la distance parcourue pendant des durées égales change.
  const a = [0, 1, 2, 3].map((i) => [i * pas, i * pas * v] as const);
  const [tFin = 0, dFin = 0] = a.at(-1) ?? [];
  const b1 = dFin + pas * (v - 1);
  const b2 = b1 + pas * (v - 2);
  const figure = {
    kind: 'document' as const,
    title: 'Relevé d’un véhicule radiocommandé (données de l’exercice)',
    lines: [
      'Le véhicule avance en ligne droite. Distances mesurées depuis le départ.',
      ...a.map(([t, d]) => `À ${t} s : ${d} m.`),
      `À ${tFin + pas} s : ${b1} m.`,
      `À ${tFin + 2 * pas} s : ${b2} m.`,
    ],
  };
  const forme = rng.int(0, 2);
  if (forme === 0) {
    return {
      prompt: `Lis le relevé. Calcule la vitesse du véhicule entre 0 s et ${tFin} s, en m/s.`,
      figure,
      answer: num(v, 'm/s'),
      traps: traps(r(v), [
        [dFin, 'C’est la distance parcourue, pas la vitesse. Divise-la par la durée.'],
        [pas * v, `C’est la distance parcourue en ${pas} s, pas en 1 s.`],
        [r(b2, tFin + 2 * pas), 'Tu as pris tout le trajet, dont une partie n’est pas uniforme.'],
      ]),
      hint: 'Repère la distance parcourue et la durée sur l’intervalle demandé seulement.',
      steps: [
        `Entre 0 s et ${tFin} s, le véhicule parcourt ${dFin} m, régulièrement.`,
        `${dFin} ÷ ${tFin} = ${v}.`,
        `La vitesse est **${v} m/s**.`,
      ],
      targetSeconds: 80,
    };
  }
  if (forme === 1) {
    return {
      prompt: `Lis le relevé. Calcule la vitesse du véhicule entre 0 s et ${tFin} s, en mètres par minute.`,
      figure,
      answer: num(v * 60, 'm/min'),
      traps: traps(r(v * 60), [
        [v, 'C’est la vitesse en mètres par seconde : une minute compte 60 secondes.'],
        [dFin * 60, 'Tu n’as pas divisé la distance par la durée.'],
      ]),
      hint: 'Calcule d’abord la distance parcourue en une seconde, puis en une minute.',
      steps: [
        `${dFin} ÷ ${tFin} = ${v} m/s.`,
        `En 60 s : ${v} × 60 = ${v * 60}.`,
        `La vitesse est **${v * 60} m/min**.`,
      ],
      targetSeconds: 90,
    };
  }
  const bon = `La vitesse est constante jusqu’à ${tFin} s, puis elle varie`;
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: 'La vitesse est constante pendant tout le relevé',
      why: `Après ${tFin} s, les distances parcourues toutes les ${pas} s ne sont plus les mêmes.`,
    },
    {
      label: `La vitesse varie dès le départ, puis elle est constante après ${tFin} s`,
      why: `Jusqu’à ${tFin} s, le véhicule parcourt la même distance toutes les ${pas} s.`,
    },
    {
      label: 'La vitesse augmente, car la distance depuis le départ augmente',
      why: 'La distance depuis le départ augmente dès qu’on avance : compare les distances parcourues sur des durées égales.',
    },
  ]);
  return {
    prompt: 'Lis le relevé. Quelle conclusion sur la vitesse est exacte ?',
    figure,
    answer,
    traps: tr,
    hint: 'Soustrais deux relevés qui se suivent, pour chaque intervalle.',
    steps: [
      `Distances toutes les ${pas} s : ${pas * v}, ${pas * v}, ${pas * v}, ${b1 - dFin} puis ${b2 - b1} m.`,
      `**${bon}**.`,
    ],
    targetSeconds: 80,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const vitesseUniforme: Skill = {
  id: 'p6-vitesse',
  title: 'Calculer une vitesse',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'En **mouvement uniforme**, la **vitesse** se calcule en divisant la **distance** parcourue par la **durée** : 20 m en 4 s donnent 20 ÷ 4 = 5 m/s.',
      'Avant de calculer, choisis les unités : 1 km = 1 000 m, 1 jour = 24 h, 1 h = 60 min, 1 min = 60 s.',
    ],
    ...references(
      'calcul',
      'constante-variable',
      'conversions-planetes',
      'uniforme',
      'quotient',
      'kilo',
      'jour',
      'heure',
      'minute',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
