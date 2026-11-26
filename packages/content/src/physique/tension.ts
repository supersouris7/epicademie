import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesElectricite } from './donnees-electricite.ts';

// ——— La tension électrique (4e) ———

const DIPOLES = ['la lampe', 'le moteur', 'la résistance', 'la DEL'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      question: 'Avec quel appareil mesure-t-on une tension électrique ?',
      bon: 'Un voltmètre',
      faux: [
        ['Un ampèremètre', 'L’ampèremètre mesure l’intensité du courant, pas la tension.'],
        ['Un chronomètre', 'Le chronomètre mesure une durée.'],
      ],
    },
    {
      question: 'Quelle est l’unité de la tension électrique ?',
      bon: 'Le volt (V)',
      faux: [
        ['L’ampère (A)', 'L’ampère est l’unité de l’intensité du courant.'],
        ['Le mètre (m)', 'Le mètre est une unité de longueur.'],
      ],
    },
    {
      question: 'Comment branche-t-on un voltmètre pour mesurer la tension aux bornes d’une lampe ?',
      bon: 'En dérivation aux bornes de la lampe',
      faux: [
        ['En série avec la lampe', 'En série, c’est le branchement de l’ampèremètre.'],
        ['Sans le relier à la lampe', 'Le voltmètre doit être relié aux deux bornes de la lampe.'],
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
    steps: ['La tension se mesure en volts avec un voltmètre branché en dérivation.', `Réponse : **${cas.bon}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DIPOLES);
  const bon = `Un voltmètre en dérivation aux bornes de ${d}`;
  const { answer, traps: t } = choice(rng, bon, [
    { label: `Un voltmètre en série avec ${d}`, why: 'Le voltmètre compare deux points : il se place en dérivation.' },
    {
      label: `Un ampèremètre en série avec ${d}`,
      why: 'Ce montage mesure l’intensité du courant, pas la tension.',
    },
    {
      label: `Un ampèremètre en dérivation aux bornes de ${d}`,
      why: 'L’ampèremètre ne mesure pas une tension et se branche en série.',
    },
  ]);
  return {
    prompt: `Quel montage permet de mesurer la tension aux bornes de ${d} ?`,
    answer,
    traps: t,
    hint: 'Choisis d’abord l’appareil, puis sa place : sur la boucle ou entre deux points.',
    steps: [
      `La tension aux bornes de ${d} se mesure entre ses deux bornes : on ajoute un voltmètre en dérivation.`,
      `Réponse : **${bon}**.`,
    ],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DIPOLES);
  const v = rng.int(2, 12);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Pour mesurer la tension aux bornes de ${d}, qui doit valoir environ ${v} V, complète le protocole.`,
      answer: {
        kind: 'cloze',
        parts: ['On utilise un ', ' branché en ', ' aux bornes du dipôle.'],
        blanks: [
          { mode: 'text', accepted: ['voltmètre', 'voltmetre'] },
          { mode: 'text', accepted: ['dérivation', 'derivation', 'parallèle', 'parallele'] },
        ],
      },
      hint: 'Le premier mot est un appareil ; le second dit où il se place.',
      steps: [
        'La tension se mesure entre les deux bornes du dipôle, sans ouvrir la boucle.',
        'Réponse : **voltmètre** en **dérivation**.',
      ],
      targetSeconds: 60,
    };
  }
  const { answer, traps: t } = saisie(
    ['tension', 'la tension', 'tension électrique', 'la tension électrique'],
    [
      ['intensité', 'L’intensité se mesure en ampères, avec un ampèremètre.'],
      ['résistance', 'La résistance se mesure en ohms.'],
    ],
  );
  return {
    prompt: `Un voltmètre branché aux bornes de ${d} affiche ${v} V. Quelle grandeur électrique vient-on de mesurer ? Écris son nom.`,
    answer,
    traps: t,
    hint: 'Regarde l’appareil utilisé et le symbole de l’unité affichée.',
    steps: ['Le voltmètre donne une valeur en volts.', 'Cette valeur est la **tension** électrique.'],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 2);
  if (cas === 0) {
    const paires = [
      ['Tension', 'Se mesure en volts'],
      ['Voltmètre', 'Appareil branché en dérivation'],
      ['Borne', 'Endroit d’un appareil où l’on attache un fil'],
      ['Surtension', 'Tension anormalement élevée'],
      ['Sous-tension', 'Tension inférieure à la normale'],
    ] as const;
    return {
      prompt: 'Associe chacun des cinq mots à sa description.',
      answer: association(rng, paires),
      hint: 'Commence par les deux mots qui comparent une tension à la normale.',
      steps: [
        'Le préfixe aide : « sur » signale un excès, « sous » un manque.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b.toLowerCase()}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  if (cas === 1) {
    const mv = rng.int(11, 99) * 100 + rng.pick([0, 50]);
    const versV = rng.int(0, 1) === 0;
    const volts = r(mv, 1000);
    const valeur = versV ? volts : r(mv);
    return {
      prompt: versV
        ? `Un voltmètre affiche ${fmt(r(mv))} mV. Exprime cette tension en volts.`
        : `Une tension vaut ${fmt(volts)} V. Exprime-la en millivolts.`,
      answer: num(valeur, versV ? 'V' : 'mV'),
      traps: traps(
        valeur,
        versV
          ? [
              [r(mv, 100), '« milli » veut dire un millième : on divise par 1 000, pas par 100.'],
              [r(mv * 1000), 'Un millivolt est plus petit qu’un volt : le nombre de volts est plus petit.'],
            ]
          : [
              [r(mv, 10), '« milli » veut dire un millième : on multiplie par 1 000, pas par 100.'],
              [r(mv, 1_000_000), 'Le millivolt est plus petit que le volt : il en faut davantage.'],
            ],
      ),
      hint: 'Le préfixe « milli » désigne le millième de l’unité.',
      steps: [
        '1 V = 1 000 mV.',
        versV ? `${fmt(r(mv))} ÷ 1 000 = **${fmt(volts)} V**.` : `${fmt(volts)} × 1 000 = **${fmt(r(mv))} mV**.`,
      ],
      targetSeconds: 60,
    };
  }
  const nominale = rng.pick([3, 6, 9, 12]);
  const haute = rng.int(0, 1) === 0;
  const appliquee = haute ? nominale * 2 : nominale / 3;
  const { answer, traps: t } = saisie(
    haute
      ? ['surtension', 'la surtension', 'en surtension']
      : ['sous-tension', 'sous tension', 'la sous-tension', 'en sous-tension'],
    [
      [
        haute ? 'sous-tension' : 'surtension',
        haute ? 'La tension reçue dépasse la valeur prévue.' : 'La tension reçue est plus faible que la valeur prévue.',
      ],
      [
        'tension nominale',
        'La tension nominale est la valeur prévue pour la lampe : on demande le nom de la situation où elle reçoit autre chose.',
      ],
    ],
  );
  return {
    prompt: `Une lampe de tension nominale ${nominale} V reçoit ${fmt(r(appliquee))} V. Comment appelle-t-on cette situation ? Écris un mot.`,
    answer,
    traps: t,
    hint: 'Compare la tension reçue à la tension nominale, puis choisis le préfixe qui convient.',
    steps: [
      `La tension reçue (${fmt(r(appliquee))} V) est ${haute ? 'bien plus grande' : 'bien plus petite'} que la tension nominale (${nominale} V).`,
      `C’est une **${haute ? 'surtension' : 'sous-tension'}** : la lampe ne fonctionne pas normalement.`,
    ],
    targetSeconds: 50,
  };
};

const NOMS = ['A', 'B', 'C'] as const;
const NOMINALES = [3, 6, 12] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  // Une seule lampe reçoit sa tension nominale ; les deux autres en sont très éloignées (le double ou le tiers).
  const bonne = rng.int(0, 2);
  const nominales = rng.shuffle(NOMINALES);
  const recues = nominales.map((n, i) => (i === bonne ? n * 1000 : rng.pick([n * 2000, (n * 1000) / 3])));
  const lignes = nominales.map(
    (n, i) => `Lampe ${NOMS[i]} : tension nominale ${n} V ; le voltmètre affiche ${fmt(r(recues[i] ?? 0))} mV.`,
  );
  const bon = `La lampe ${NOMS[bonne]}`;
  const { answer, traps: t } = choice(
    rng,
    bon,
    [
      ...NOMS.flatMap((n, i) =>
        i === bonne
          ? []
          : [
              {
                label: `La lampe ${n}`,
                why: `Convertis ses millivolts en volts : ${fmt(r(recues[i] ?? 0, 1000))} V, loin de ${nominales[i]} V.`,
              },
            ],
      ),
      { label: 'Aucune des trois', why: `${bon} reçoit exactement sa tension nominale une fois la mesure convertie.` },
    ],
    true,
  );
  return {
    prompt: 'Lis le relevé. Quelle lampe reçoit une tension proche de sa tension nominale ?',
    figure: { kind: 'document', title: 'Relevé de mesures (situation inventée)', lines: lignes },
    answer,
    traps: t,
    hint: 'Mets d’abord toutes les mesures dans la même unité que la tension nominale.',
    steps: [
      '1 V = 1 000 mV : on convertit chaque mesure en volts, puis on compare à la tension nominale de la même lampe.',
      nominales.map((n, i) => `${NOMS[i]} : ${fmt(r(recues[i] ?? 0, 1000))} V pour ${n} V`).join(' ; '),
      `Réponse : **${bon}**.`,
    ],
    targetSeconds: 100,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const tensionNotion: Skill = {
  id: 'p4-tension',
  title: 'La tension électrique',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **tension électrique** se note U, se mesure entre deux points et s’exprime en **volts** (V). On la lit sur un **voltmètre** branché **en dérivation** : borne V du côté où le courant arrive, borne COM de l’autre.',
      'Pour fonctionner normalement, un appareil doit recevoir une tension proche de sa **tension nominale**. Exemple : 6 000 mV = 6 V, parfait pour une lampe « 6 V ». Bien au-dessus, c’est une **surtension** ; bien en dessous, une **sous-tension**.',
    ],
    ...referencesElectricite(
      'tension',
      'volt',
      'voltmetre',
      'voltmetre-derivation',
      'voltmetre-bornes',
      'tension-sans-courant',
      'nominale',
      'surtension',
      'sous-tension',
      'borne',
      'milli',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
