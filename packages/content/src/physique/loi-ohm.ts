import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesElectricite } from './donnees-electricite.ts';

// ——— La loi d'Ohm (4e) ———

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      question: 'Pour un conducteur ohmique, quelle relation est la loi d’Ohm ?',
      bon: 'U = R × I',
      pourquoi: 'La tension est proportionnelle à l’intensité ; le coefficient qui les relie est la résistance R.',
      faux: [
        ['U = R + I', 'La tension s’obtient en multipliant R par I, pas en les additionnant.'],
        ['U = R − I', 'La tension s’obtient en multipliant R par I, pas en les soustrayant.'],
      ],
    },
    {
      question: 'Quelle est l’unité de la résistance électrique ?',
      bon: 'L’ohm (Ω)',
      pourquoi: 'La résistance R s’exprime en ohms, de symbole Ω.',
      faux: [
        ['L’ampère (A)', 'L’ampère est l’unité de l’intensité.'],
        ['Le volt (V)', 'Le volt est l’unité de la tension.'],
      ],
    },
    {
      question:
        'Dans un circuit en série, on garde le même générateur et on remplace la résistance par une plus grande. Que fait l’intensité ?',
      bon: 'Elle diminue',
      pourquoi: 'La résistance s’oppose au passage du courant : plus elle est grande, moins le courant est intense.',
      faux: [
        ['Elle augmente', 'Une plus grande résistance s’oppose davantage au passage du courant.'],
        ['Elle ne change pas', 'La résistance a un effet sur l’intensité.'],
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
    hint: 'La résistance s’oppose au passage du courant et relie la tension à l’intensité.',
    steps: [cas.pourquoi, `Réponse : **${cas.bon}**.`],
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = [
      ['U (tension)', 'volt (V)'],
      ['I (intensité)', 'ampère (A)'],
      ['R (résistance)', 'ohm (Ω)'],
    ] as const;
    return {
      prompt: 'Dans la loi d’Ohm U = R × I, associe chaque lettre à son unité.',
      answer: association(rng, paires),
      hint: 'Dis d’abord ce que désigne chaque lettre, puis pense à son appareil de mesure.',
      steps: ['U est la tension, I l’intensité, R la résistance.', 'Réponse : **U → volt ; I → ampère ; R → ohm**.'],
      targetSeconds: 45,
    };
  }
  const cherche = rng.pick(['U', 'I', 'R'] as const);
  const bons = { U: 'U = R × I', I: 'I = U ÷ R', R: 'R = U ÷ I' } as const;
  const faux = {
    U: ['U = R ÷ I', 'U = I ÷ R', 'U = R + I'],
    I: ['I = U × R', 'I = R ÷ U', 'I = U − R'],
    R: ['R = U × I', 'R = I ÷ U', 'R = U − I'],
  } as const;
  const nom = { U: 'la tension U', I: 'l’intensité I', R: 'la résistance R' }[cherche];
  const { answer, traps: t } = choice(
    rng,
    bons[cherche],
    faux[cherche].map((label) => ({ label, why: `Pars de U = R × I, puis isole ${nom}.` })),
  );
  return {
    prompt: `Pour un conducteur ohmique, quelle écriture permet de calculer ${nom} ?`,
    answer,
    traps: t,
    hint: 'Pars de la relation entre U, R et I et cherche à laisser la grandeur seule.',
    steps: [
      'U = R × I.',
      {
        U: 'La tension est déjà seule d’un côté : **U = R × I**.',
        I: 'I est multiplié par R : on divise les deux côtés par R, donc **I = U ÷ R**.',
        R: 'R est multiplié par I : on divise les deux côtés par I, donc **R = U ÷ I**.',
      }[cherche],
    ],
    targetSeconds: 45,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const res = rng.pick([5, 10, 15, 20, 25, 50]);
  const i = rng.int(2, 9);
  const u = res * i;
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Un conducteur ohmique de résistance ${res} Ω est traversé par un courant de ${i} A. Quelle est la tension à ses bornes, en V ?`,
      answer: num(u, 'V'),
      traps: traps(r(u), [
        [res + i, 'U = R × I : on multiplie, on n’additionne pas.'],
        [r(res, i), 'On ne divise pas la résistance par l’intensité pour trouver U.'],
      ]),
      hint: 'Écris la loi d’Ohm, puis remplace chaque lettre par sa valeur.',
      steps: ['U = R × I.', `U = ${res} × ${i} = **${u} V**.`],
      targetSeconds: 50,
    };
  }
  return {
    prompt: `On applique ${u} V aux bornes d’un conducteur ohmique de ${res} Ω. Quelle est l’intensité du courant qui le traverse, en A ?`,
    answer: num(i, 'A'),
    traps: traps(r(i), [
      [u * res, 'Pour I, on divise la tension par la résistance : on ne multiplie pas.'],
      [r(res, u), 'I = U ÷ R, et non R ÷ U.'],
      [u - res, 'La loi d’Ohm ne soustrait pas les grandeurs.'],
    ]),
    hint: 'Pars de U = R × I et isole l’intensité.',
    steps: ['U = R × I, donc I = U ÷ R.', `I = ${u} ÷ ${res} = **${i} A**.`],
    targetSeconds: 60,
  };
};

const RESISTANCES = [50, 100, 150, 200, 220, 330, 470] as const;

const niveau4 = (rng: Rng): QuestionDraft => {
  const res = rng.pick(RESISTANCES);
  const ma = rng.pick([10, 20, 30, 40, 50]);
  const u = r(res * ma, 1000);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Aux bornes d’un conducteur ohmique, on mesure ${fmt(u)} V quand il est traversé par ${ma} mA. Quelle est sa résistance, en Ω ?`,
      answer: num(res, 'Ω'),
      traps: traps(r(res), [
        [r(res, 1000), 'Convertis les milliampères en ampères avant de diviser.'],
        [r(res * ma * ma, 1_000_000), 'R = U ÷ I : on divise, on ne multiplie pas.'],
        [r(1, res), 'R = U ÷ I, et non I ÷ U.'],
      ]),
      hint: 'Mets l’intensité dans l’unité de la loi d’Ohm, puis isole R.',
      steps: [`${ma} mA = ${fmt(r(ma, 1000))} A.`, 'R = U ÷ I.', `R = ${fmt(u)} ÷ ${fmt(r(ma, 1000))} = **${res} Ω**.`],
      targetSeconds: 90,
    };
  }
  return {
    prompt: `Une tension de ${fmt(u)} V est appliquée à un conducteur ohmique de ${res} Ω. Quelle est l’intensité du courant, en mA ?`,
    answer: num(ma, 'mA'),
    traps: traps(r(ma), [
      [r(ma, 1000), 'Ce résultat est en ampères : la question demande des milliampères.'],
      [r(res * res * ma, 1000), 'I = U ÷ R : on divise, on ne multiplie pas.'],
      [r(ma, 10), '1 A = 1 000 mA.'],
    ]),
    hint: 'Calcule d’abord I en ampères, puis change d’unité.',
    steps: ['I = U ÷ R.', `I = ${fmt(u)} ÷ ${res} = ${fmt(r(ma, 1000))} A.`, `${fmt(r(ma, 1000))} A = **${ma} mA**.`],
    targetSeconds: 90,
  };
};

const NOMS = ['A', 'B', 'C'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const res = rng.pick([50, 100, 200] as const);
  const ma = rng.pick([20, 30, 40, 50]);
  if (rng.int(0, 1) === 0) {
    const lampe = rng.int(2, 5);
    const uR = r(res * ma, 1000);
    const pile = r(res * ma + lampe * 1000, 1000);
    return {
      prompt: 'Lis le document. Quelle est l’intensité du courant dans le circuit, en mA ?',
      figure: {
        kind: 'document',
        title: 'Montage en série (situation inventée)',
        lines: [
          'La pile, la lampe L et un conducteur ohmique D sont en série.',
          `Tension aux bornes de la pile : ${fmt(pile)} V.`,
          `Tension aux bornes de la lampe L : ${lampe} V.`,
          `Résistance de D : ${res} Ω.`,
        ],
      },
      answer: num(ma, 'mA'),
      traps: traps(r(ma), [
        [
          r(res * ma + lampe * 1000, res),
          'La tension aux bornes de D n’est pas celle de la pile : retire celle de la lampe.',
        ],
        [r(lampe * 1000, res), 'On applique la loi d’Ohm à D avec sa propre tension, pas celle de la lampe.'],
        [r(ma, 1000), 'Ce résultat est en ampères : la question demande des milliampères.'],
      ]),
      hint: 'Cherche d’abord la tension aux bornes de D grâce à la loi des tensions en série.',
      steps: [
        'En série : U pile = UL + UD, donc il faut d’abord trouver UD.',
        `UD = ${fmt(pile)} − ${lampe} = ${fmt(uR)} V.`,
        `Loi d’Ohm : I = UD ÷ R = ${fmt(uR)} ÷ ${res} = ${fmt(r(ma, 1000))} A, soit **${ma} mA**.`,
      ],
      targetSeconds: 150,
    };
  }
  const ohmique = rng.int(0, 2);
  const courants = [10, 20, 30];
  // Les dipôles non ohmiques : la tension n’est pas proportionnelle à l’intensité.
  const ecarts = rng.shuffle([
    [0, 1, 3],
    [2, 3, 3],
  ]);
  let k = 0;
  const lignes = NOMS.map((n, d) => {
    const ecart = d === ohmique ? [0, 0, 0] : (ecarts[k++] ?? [0, 1, 3]);
    const mesures = courants.map((c, j) => `${fmt(r(res * c + (ecart[j] ?? 0) * 500, 1000))} V pour ${c} mA`);
    return `Dipôle ${n} : ${mesures.join(' ; ')}.`;
  });
  const bon = `Le dipôle ${NOMS[ohmique]}`;
  const { answer, traps: t } = choice(
    rng,
    bon,
    [
      ...NOMS.flatMap((n, d) =>
        d === ohmique
          ? []
          : [{ label: `Le dipôle ${n}`, why: 'Pour ce dipôle, le quotient U ÷ I change d’une mesure à l’autre.' }],
      ),
      { label: 'Aucun des trois', why: `Pour le dipôle ${NOMS[ohmique]}, le quotient U ÷ I reste le même.` },
    ],
    true,
  );
  return {
    prompt: 'Lis les mesures. Quel dipôle se comporte comme un conducteur ohmique ?',
    figure: { kind: 'document', title: 'Mesures (situation inventée)', lines: lignes },
    answer,
    traps: t,
    hint: 'Vérifie si la tension est proportionnelle à l’intensité, mesure après mesure.',
    steps: [
      'Un conducteur ohmique a une tension proportionnelle à l’intensité : U ÷ I est constant.',
      `Seul le dipôle ${NOMS[ohmique]} garde le même quotient, soit R = ${res} Ω.`,
      `Réponse : **${bon}**.`,
    ],
    targetSeconds: 150,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const loiOhm: Skill = {
  id: 'p4-loi-ohm',
  title: 'La loi d’Ohm',
  levels: 5,
  version: 2,
  advice: 'brouillon',
  lesson: {
    memo: [
      'La **résistance électrique** R, en **ohms** (Ω), mesure l’opposition au passage du courant. Un **conducteur ohmique** vérifie la loi d’Ohm : U = R × I, avec U en volts et I en ampères.',
      'Exemple : R = 100 Ω et I = 20 mA = 0,02 A donnent U = 100 × 0,02 = 2 V. Un ohmmètre ne s’utilise jamais sur un circuit alimenté.',
    ],
    ...referencesElectricite(
      'ohm-programme',
      'ohm-relation',
      'resistance',
      'ohm-unite',
      'ohm-bipm',
      'resistance-intensite',
      'ohmmetre',
      'loi-mailles',
      'milli',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
