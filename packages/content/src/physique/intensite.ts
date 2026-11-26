import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesElectricite } from './donnees-electricite.ts';

// ——— L'intensité du courant (4e) ———

const DIPOLES = ['la lampe', 'le moteur', 'la résistance', 'la DEL'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      question: 'Avec quel appareil mesure-t-on l’intensité d’un courant électrique ?',
      bon: 'Un ampèremètre',
      faux: [
        ['Un voltmètre', 'Le voltmètre mesure une tension.'],
        ['Un thermomètre', 'Le thermomètre mesure une température.'],
      ],
    },
    {
      question: 'Quelle est l’unité de l’intensité du courant électrique ?',
      bon: 'L’ampère (A)',
      faux: [
        ['Le volt (V)', 'Le volt est l’unité de la tension.'],
        ['La seconde (s)', 'La seconde est une unité de durée.'],
      ],
    },
    {
      question: 'Comment branche-t-on un ampèremètre pour mesurer l’intensité qui traverse un moteur ?',
      bon: 'En série avec le moteur',
      faux: [
        ['En dérivation aux bornes du moteur', 'En dérivation, c’est le branchement du voltmètre.'],
        ['Sans le relier au circuit', 'Le courant à mesurer doit traverser l’appareil.'],
      ],
    },
  ] as const);
  const { answer, traps: t } = choice(
    rng,
    cas.bon,
    cas.faux.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: cas.question,
    answer,
    traps: t,
    hint: 'Pense au nom de la grandeur, de son unité et de son appareil de mesure.',
    steps: ['L’intensité se mesure en ampères avec un ampèremètre branché en série.', `Réponse : **${cas.bon}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DIPOLES);
  const trois = [
    ['Ampère (A)', 'Unité de l’intensité'],
    ['Ampèremètre', `Appareil placé en série avec ${d}`],
    ['Voltmètre', `Appareil placé en dérivation aux bornes de ${d}`],
  ] as const;
  return {
    prompt: `On étudie ${d} dans un circuit. Associe chaque mot à sa description.`,
    answer: association(rng, trois),
    hint: 'Un appareil mesure le courant qui le traverse, l’autre compare deux points.',
    steps: [
      'L’ampèremètre se place sur le chemin du courant ; le voltmètre se place entre les deux bornes.',
      `Réponse : **${trois.map(([a, b]) => `${a} → ${b.toLowerCase()}`).join(' ; ')}**.`,
    ],
    targetSeconds: 50,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DIPOLES);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `On veut mesurer l’intensité du courant qui traverse ${d}. Complète le protocole.`,
      answer: {
        kind: 'cloze',
        parts: [
          'On branche un ampèremètre en ',
          '. Pour une valeur positive, le courant entre par la borne ',
          ' et sort par la borne COM.',
        ],
        blanks: [
          { mode: 'text', accepted: ['série', 'serie'] },
          { mode: 'list', options: ['V', 'A', 'Ω'], correct: 1 },
        ],
      },
      hint: 'Le courant doit traverser l’appareil ; la borne porte le symbole de l’unité mesurée.',
      steps: [
        'L’ampèremètre est traversé par le courant à mesurer.',
        'Réponse : en **série**, entrée par la borne **A**.',
      ],
      targetSeconds: 60,
    };
  }
  const i = rng.int(2, 90) * 10;
  const { answer, traps: t } = saisie(
    ['intensité', 'l’intensité', 'intensite', 'intensité du courant', 'l’intensité du courant'],
    [
      ['tension', 'La tension se mesure en volts, avec un voltmètre.'],
      ['résistance', 'La résistance s’exprime en ohms.'],
    ],
  );
  return {
    prompt: `Un appareil placé en série avec ${d} affiche ${i} mA. Quelle grandeur électrique mesure-t-il ? Écris son nom.`,
    answer,
    traps: t,
    hint: 'Regarde le symbole de l’unité et la place de l’appareil.',
    steps: [
      'mA signifie milliampère, un sous-multiple de l’ampère.',
      'La grandeur mesurée est l’**intensité** du courant.',
    ],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const ma = rng.int(1, 99) * 10 + rng.pick([0, 5]);
    const versA = rng.int(0, 1) === 0;
    const amperes = r(ma, 1000);
    const valeur = versA ? amperes : r(ma);
    return {
      prompt: versA
        ? `Un ampèremètre affiche ${ma} mA. Exprime cette intensité en ampères.`
        : `Une intensité vaut ${fmt(amperes)} A. Exprime-la en milliampères.`,
      answer: num(valeur, versA ? 'A' : 'mA'),
      traps: traps(
        valeur,
        versA
          ? [
              [r(ma, 100), '« milli » veut dire un millième : on divise par 1 000, pas par 100.'],
              [r(ma * 1000), 'Le milliampère est plus petit que l’ampère : le nombre d’ampères est plus petit.'],
            ]
          : [
              [r(ma, 10), '« milli » veut dire un millième : on multiplie par 1 000, pas par 100.'],
              [r(ma, 1_000_000), 'Le milliampère est plus petit que l’ampère : il en faut davantage.'],
            ],
      ),
      hint: 'Le préfixe « milli » désigne le millième de l’unité.',
      steps: [
        '1 A = 1 000 mA.',
        versA ? `${ma} ÷ 1 000 = **${fmt(amperes)} A**.` : `${fmt(amperes)} × 1 000 = **${ma} mA**.`,
      ],
      targetSeconds: 60,
    };
  }
  const paires = [
    ['Intensité', 'Se mesure en ampères'],
    ['Tension', 'Se mesure en volts'],
    ['Ampèremètre en série', 'Le courant à mesurer le traverse'],
    ['Court-circuit', 'L’intensité augmente et les conducteurs chauffent dangereusement'],
    ['Circuit ouvert', 'Une interruption empêche le courant de passer'],
  ] as const;
  return {
    prompt: 'Associe chacun des cinq éléments à ce qui le caractérise.',
    answer: association(rng, paires),
    hint: 'Sépare les grandeurs, l’appareil et les deux états anormaux ou coupés du circuit.',
    steps: [
      'Chaque élément se reconnaît à son unité, à sa place ou à son effet sur le courant.',
      `Réponse : **${paires.map(([a, b]) => `${a} → ${b.toLowerCase()}`).join(' ; ')}**.`,
    ],
    targetSeconds: 80,
  };
};

const APPAREILS = ['le moteur', 'le ruban de DEL', 'la sonnette', 'le ventilateur'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  // Limite en ampères, mesures en milliampères : un seul appareil dépasse la limite.
  const limite = rng.pick([200, 500, 800]);
  const trois = rng.shuffle(APPAREILS).slice(0, 3);
  const coupable = rng.int(0, 2);
  const mesures = trois.map((_, i) => (i === coupable ? limite + rng.int(1, 9) * 10 : limite - rng.int(1, 9) * 10));
  const nom = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const bon = nom(trois[coupable] ?? '');
  const { answer, traps: t } = choice(
    rng,
    bon,
    [
      ...trois.flatMap((a, i) =>
        i === coupable ? [] : [{ label: nom(a), why: `${mesures[i]} mA est inférieur à la limite de ${limite} mA.` }],
      ),
      { label: 'Aucun des trois', why: `Une mesure dépasse la limite une fois convertie : ${limite} mA.` },
    ],
    true,
  );
  return {
    prompt: 'Lis le document. Pour quel appareil le fil prévu n’est-il pas adapté ?',
    figure: {
      kind: 'document',
      title: 'Montage d’essai (situation inventée)',
      lines: [
        `Le fil utilisé ne doit pas être parcouru par une intensité supérieure à ${fmt(r(limite, 1000))} A.`,
        'Chaque appareil est essayé seul, avec ce fil et un ampèremètre en série.',
        ...trois.map((a, i) => `Avec ${a}, l’ampèremètre affiche ${mesures[i]} mA.`),
      ],
    },
    answer,
    traps: t,
    hint: 'Écris la limite et les mesures dans la même unité avant de comparer.',
    steps: [
      `La limite vaut ${fmt(r(limite, 1000))} A, soit ${limite} mA.`,
      'Pour la sécurité, l’intensité dans un fil ne doit pas dépasser la valeur prévue.',
      `Seul ${trois[coupable]} dépasse la limite : **${bon}**.`,
    ],
    targetSeconds: 100,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const intensiteNotion: Skill = {
  id: 'p4-intensite',
  title: 'L’intensité du courant',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’**intensité du courant** se note I et s’exprime en **ampères** (A). On la mesure avec un **ampèremètre** branché **en série** : le courant entre par la borne A et sort par la borne COM.',
      'Exemple : 250 mA = 0,25 A. Un fil ne doit pas dépasser l’intensité prévue pour la sécurité, et un **court-circuit** la fait augmenter dangereusement.',
    ],
    ...referencesElectricite(
      'intensite',
      'ampere',
      'amperemetre',
      'amperemetre-serie',
      'amperemetre-bornes',
      'voltmetre-derivation',
      'milli',
      'limite-fil',
      'court-circuit',
      'securite',
      'circuit-ouvert',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
