import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Dissolution : disparaître à la vue, récupérer par évaporation, masse conservée (programme du cycle 3) ———

/** Observations données dans l'énoncé : on conclut à partir de ce qu'on voit. */
const ESSAIS: readonly { solide: string; observation: string; dissous: boolean }[] = [
  { solide: 'du sel', observation: 'Après avoir remué, tu ne vois plus de grains : l’eau est claire.', dissous: true },
  {
    solide: 'du sucre',
    observation: 'Après avoir remué, tu ne vois plus de grains : l’eau est claire.',
    dissous: true,
  },
  { solide: 'du sirop en poudre', observation: 'Après avoir remué, la poudre n’est plus visible.', dissous: true },
  { solide: 'du sable', observation: 'Après avoir remué, les grains retombent au fond.', dissous: false },
  {
    solide: 'de petits cailloux',
    observation: 'Après avoir remué, les cailloux restent visibles au fond.',
    dissous: false,
  },
  {
    solide: 'des billes de verre',
    observation: 'Après avoir remué, les billes restent visibles au fond.',
    dissous: false,
  },
];

const DISSOUS = 'Le solide s’est dissous';
const NON_DISSOUS = 'Le solide ne s’est pas dissous';
const PERDU = 'Le solide n’existe plus du tout';

const niveau1 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(ESSAIS);
  const bon = e.dissous ? DISSOUS : NON_DISSOUS;
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: e.dissous ? NON_DISSOUS : DISSOUS,
      why: e.dissous
        ? 'On ne voit plus de grains : le solide s’est dissous dans l’eau.'
        : 'On voit encore le solide au fond : il ne s’est pas dissous.',
    },
    { label: PERDU, why: 'Un solide ne disparaît pas : même dissous, il reste dans l’eau.' },
  ]);
  return {
    prompt: `Tu mets ${e.solide} dans un verre d’eau. ${e.observation} Que peux-tu dire ?`,
    answer,
    traps: tr,
    hint: 'Vois-tu encore des morceaux ou des grains ?',
    steps: [
      'On regarde si le solide est encore visible après avoir remué.',
      e.dissous
        ? 'Il n’est plus visible, mais il est toujours dans l’eau.'
        : 'Il est encore visible : il ne s’est pas mélangé complètement à l’eau.',
      `Conclusion : **${bon.toLowerCase()}**.`,
    ],
    targetSeconds: 25,
  };
};

const SALINES: readonly string[] = [
  'Tu as une eau salée, bien claire. Tu veux retrouver le sel.',
  'Un marais salant (un bassin au bord de la mer où l’on récolte le sel) contient de l’eau de mer. On veut récolter le sel.',
  'Au labo, tu as dissous du sel dans de l’eau. Tu veux le récupérer sec.',
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const situation = rng.pick(SALINES);
  const { answer, traps: tr } = choice(rng, 'Laisser l’eau s’évaporer', [
    { label: 'Filtrer l’eau', why: 'Le sel dissous traverse le filtre avec l’eau : le filtre ne l’arrête pas.' },
    { label: 'Passer l’eau dans un tamis', why: 'Le sel dissous passe à travers les trous avec l’eau.' },
    {
      label: 'Laisser reposer l’eau, puis la verser',
      why: 'Le sel dissous ne tombe pas au fond : le repos ne le sépare pas.',
    },
  ]);
  return {
    prompt: `${situation} Que dois-tu faire ?`,
    answer,
    traps: tr,
    hint: 'Il faut faire partir l’eau, et garder ce qui était dissous.',
    steps: [
      'Un solide dissous ne se voit plus : un filtre ne peut pas l’arrêter.',
      'Quand l’eau part en vapeur, le sel reste.',
      'Il faut **laisser l’eau s’évaporer**.',
    ],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const solide = rng.pick(['Le sel', 'Le sucre']);
    return {
      prompt: `Complète les deux phrases sur ${solide.toLowerCase()}.`,
      answer: {
        kind: 'cloze',
        parts: [`${solide} se `, ' dans l’eau. Pour le retrouver, on laisse l’eau s’', '.'],
        blanks: [
          { mode: 'list', options: ['dissout', 'évapore', 'dépose'], correct: 0 },
          { mode: 'text', accepted: ['évaporer', 'evaporer'] },
        ],
      },
      hint: 'Le premier mot dit que le solide ne se voit plus dans l’eau. Le second dit que l’eau part en vapeur.',
      steps: [
        `${solide} n’est plus visible : il s’est mélangé complètement à l’eau.`,
        'Pour le retrouver, on fait partir l’eau en vapeur.',
        'Réponse : **dissout**, puis **évaporer**.',
      ],
      targetSeconds: 40,
    };
  }
  const eau = rng.int(1, 9) * 100;
  const sel = rng.int(1, 6) * 5;
  return {
    prompt: `Tu dissous ${sel} g de sel dans ${eau} g d’eau. Quelle est la masse du mélange, en grammes ?`,
    answer: num(eau + sel, 'g'),
    traps: traps(r(eau + sel), [
      [eau, 'Le sel dissous est toujours là : sa masse compte aussi.'],
      [eau - sel, 'La dissolution ne fait pas perdre de masse : on additionne.'],
    ]),
    hint: 'Rien ne se perd pendant la dissolution : la masse totale se conserve.',
    steps: [
      'La masse totale se conserve quand on mélange un solide dans un liquide.',
      `On additionne : ${eau} + ${sel}.`,
      `Le mélange a une masse de **${eau + sel} g**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const sel = rng.int(1, 6) * 5;
    const eau = rng.int(1, 9) * 100;
    return {
      prompt: `Une eau salée pèse ${eau + sel} g. Elle contient ${eau} g d’eau. Toute l’eau s’évapore. Combien de grammes de sel restent ?`,
      answer: num(sel, 'g'),
      traps: traps(r(sel), [
        [eau + sel, 'C’est la masse de l’eau salée : l’eau est partie en vapeur.'],
        [eau, 'C’est la masse de l’eau, qui s’est évaporée. Le sel est ce qui reste.'],
      ]),
      hint: 'La masse de l’eau salée, c’est l’eau plus le sel.',
      steps: [
        'La masse totale se conserve : eau salée = eau + sel.',
        `Sel = ${eau + sel} − ${eau}.`,
        `Il reste **${sel} g** de sel.`,
      ],
      targetSeconds: 60,
    };
  }
  if (type === 1) {
    const kilos = rng.int(1, 3);
    const sel = rng.int(1, 9) * 10;
    const total = kilos * 1000 + sel;
    return {
      prompt: `Tu dissous ${sel} g de sel dans ${kilos} kg d’eau. Quelle est la masse du mélange, en grammes ?`,
      answer: num(total, 'g'),
      traps: traps(r(total), [
        [kilos + sel, 'Il faut d’abord écrire les deux masses avec la même unité : 1 kg = 1 000 g.'],
        [kilos * 1000, 'Le sel dissous compte aussi dans la masse.'],
      ]),
      hint: 'Mets les deux masses dans la même unité avant de les additionner.',
      steps: [
        `On convertit : ${kilos} kg = ${kilos * 1000} g.`,
        `La masse se conserve : ${kilos * 1000} + ${sel}.`,
        `Le mélange a une masse de **${total} g**.`,
      ],
      targetSeconds: 70,
    };
  }
  const { answer, traps: tr } = saisie(
    ['non'],
    [['oui', 'Le sel dissous ne se voit plus, mais il est toujours là : on peut le récupérer par évaporation.']],
  );
  return {
    prompt: `${rng.pick(['Un élève', 'Un camarade', 'Une élève'])} affirme : « Le sel dissous dans l’eau a disparu pour toujours. » A-t-on raison de le dire ? Réponds par oui ou non.`,
    answer,
    traps: tr,
    hint: 'Pense à ce qu’on voit quand toute l’eau s’est évaporée.',
    steps: [
      'Le sel dissous ne se voit plus, mais il est toujours dans l’eau.',
      'Quand l’eau s’évapore, il réapparaît.',
      'La réponse est **non**.',
    ],
    targetSeconds: 35,
  };
};

const SEPARATION: readonly string[] = [
  'Ajouter de l’eau au mélange de sable et de sel, puis remuer',
  'Filtrer : le sable reste sur le papier filtre',
  'Laisser l’eau salée s’évaporer dans une assiette',
  'Récupérer le sel au fond de l’assiette',
];

const niveau5 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    return {
      prompt: 'Lis la mission, puis remets les étapes dans l’ordre.',
      figure: {
        kind: 'document',
        title: 'Mission : le sable salé',
        lines: [
          'Tu reçois un mélange sec de sable et de sel.',
          'Le sel se dissout dans l’eau. Le sable ne s’y dissout pas.',
          'But : retrouver le sable d’un côté et le sel sec de l’autre.',
        ],
      },
      answer: ordre(rng, SEPARATION),
      hint: 'Quel solide l’eau peut-elle emporter à travers le filtre ?',
      steps: [
        'L’eau dissout le sel, pas le sable.',
        'Le filtre retient le sable, l’eau salée passe. L’évaporation rend le sel.',
        `Ordre : **${SEPARATION.join(' → ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const verre = rng.int(2, 5) * 50;
  const eau = rng.int(2, 5) * 50;
  const sel = rng.int(1, 6) * 5;
  const tare = rng.int(0, 1) === 0;
  const total = tare ? eau + sel : verre + eau + sel;
  return {
    prompt: tare
      ? 'Lis l’expérience. Quelle masse affiche la balance à la fin, en grammes ?'
      : 'Lis l’expérience. La balance n’a pas été tarée. Quelle masse affiche-t-elle à la fin, en grammes ?',
    figure: {
      kind: 'document',
      title: 'Carnet d’expérience',
      lines: [
        `Un verre vide pèse ${verre} g.`,
        tare
          ? 'On pose le verre sur la balance et on fait la tare (la balance affiche 0).'
          : 'On pose le verre sur la balance, sans faire la tare.',
        `On verse ${eau} g d’eau dans le verre.`,
        `On ajoute ${sel} g de sel et on remue jusqu’à ce qu’on ne le voie plus.`,
      ],
    },
    answer: num(total, 'g'),
    traps: traps(r(total), [
      [tare ? eau : verre + eau, 'Le sel dissous est toujours là : sa masse compte.'],
      [
        tare ? verre + eau + sel : eau + sel,
        tare ? 'La tare efface la masse du verre : il ne faut pas la compter.' : 'Sans tare, la masse du verre compte.',
      ],
    ]),
    hint: 'Demande-toi ce que la balance compte : le verre, l’eau, le sel ?',
    steps: [
      tare ? 'Avec la tare, la masse du verre n’est pas comptée.' : 'Sans tare, la balance compte aussi le verre.',
      'La masse totale se conserve : le sel dissous compte toujours.',
      `La balance affiche **${total} g**.`,
    ],
    targetSeconds: 80,
  };
};

const niveaux = (rng: Rng, level: number): QuestionDraft => {
  if (level === 2 && rng.int(0, 2) === 0) {
    return {
      prompt: 'Associe chaque mot à sa définition.',
      answer: association(rng, [
        ['se dissoudre', 'se mélanger complètement à l’eau, au point de ne plus se voir'],
        ['s’évaporer', 'passer de l’eau liquide à la vapeur'],
        ['soluble', 'qui peut se dissoudre dans un liquide'],
      ]),
      hint: 'Un mot parle d’un solide dans l’eau, un autre de l’eau qui part.',
      steps: [
        'On cherche l’action de chaque mot.',
        'Réponse : **se dissoudre → ne plus se voir dans l’eau ; s’évaporer → devenir vapeur ; soluble → qui peut se dissoudre**.',
      ],
      targetSeconds: 40,
    };
  }
  return ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng);
};

export const dissolution: Skill = {
  id: 'pcm2-dissolution',
  title: 'La dissolution',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Certains solides peuvent se **dissoudre** dans l’eau : le sel ne se voit plus, mais il est toujours là ! On dit qu’il est **soluble**.',
      'Pour le retrouver, laisse l’eau s’**évaporer**. Et la **masse** totale ne change pas : 100 g d’eau + 10 g de sel = 110 g.',
    ],
    source: `${PROGRAMME} : « Observer que certains solides peuvent se dissoudre dans l’eau et qu’il est possible de les récupérer par évaporation » ; « Mettre en évidence expérimentalement que la masse totale se conserve lors du mélange d’un solide dans un liquide ».`,
    sources: [PROGRAMME, 'cnrtl-sel', 'cnrtl-soluble'],
  },
  generate: niveaux,
};
