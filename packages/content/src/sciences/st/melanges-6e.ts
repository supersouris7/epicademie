import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-matiere.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Mélanges : liquides non miscibles, composition de l'air, gaz à effet de serre (6e) ———

/** Observations données dans l'énoncé, après agitation puis repos : on conclut à partir de ce qu'on voit. */
const ESSAIS: readonly { liquides: string; miscibles: boolean; vu: string }[] = [
  { liquides: 'de l’eau et de l’huile', miscibles: false, vu: 'on voit deux couches l’une au-dessus de l’autre' },
  { liquides: 'de l’eau et du white-spirit', miscibles: false, vu: 'deux couches se reforment' },
  { liquides: 'de l’eau et de l’essence', miscibles: false, vu: 'on distingue nettement deux liquides superposés' },
  { liquides: 'de l’eau et du sirop', miscibles: true, vu: 'on ne voit qu’un seul liquide, de même couleur partout' },
  { liquides: 'de l’eau et du vinaigre', miscibles: true, vu: 'on ne voit qu’un seul liquide uniforme' },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(ESSAIS);
  const bon = e.miscibles ? 'Ils sont miscibles' : 'Ils ne sont pas miscibles';
  const { answer, traps: t } = choice(rng, bon, [
    {
      label: e.miscibles ? 'Ils ne sont pas miscibles' : 'Ils sont miscibles',
      why: e.miscibles
        ? 'On ne distingue qu’un seul liquide : ils se sont mélangés de façon homogène.'
        : 'Deux couches restent visibles : ils ne se mélangent pas de façon homogène.',
    },
    { label: 'L’un des deux a disparu', why: 'Rien ne disparaît : les deux liquides sont toujours là.' },
  ]);
  return {
    prompt: `On agite ${e.liquides}, puis on laisse reposer : ${e.vu}. Que peut-on dire de ces liquides ?`,
    answer,
    traps: t,
    hint: 'Combien de couches vois-tu après le repos ?',
    steps: ['Des liquides miscibles forment un mélange homogène ; sinon ils restent en couches.', `**${bon}**.`],
    targetSeconds: 25,
  };
};

const GAZ_SERRE = ['la vapeur d’eau', 'le dioxyde de carbone', 'le méthane'];
const GAZ_AUTRES = ['l’azote', 'l’oxygène', 'l’argon'];
const PART: readonly (readonly [string, string])[] = [
  ['L’azote', 'environ 78 %'],
  ['L’oxygène', 'environ 21 %'],
  ['L’argon et les gaz rares', 'environ 1 %'],
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Associe chaque gaz à sa part dans l’air sec.',
      answer: association(rng, PART),
      hint: 'Le gaz le plus abondant n’est pas celui qu’on respire pour vivre.',
      steps: [
        'L’air sec est un mélange de plusieurs gaz.',
        'Réponse : **azote → environ 78 % ; oxygène → environ 21 % ; argon et gaz rares → environ 1 %**.',
      ],
      targetSeconds: 40,
    };
  }
  if (t === 1) {
    const rang = rng.int(0, 1);
    const bon = rang === 0 ? 'L’azote' : 'L’oxygène';
    const { answer, traps: tr } = choice(
      rng,
      bon,
      ['L’azote', 'L’oxygène', 'L’argon', 'Le dioxyde de carbone']
        .filter((g) => g !== bon)
        .map((g) => ({
          label: g,
          why: `L’air sec contient 78 % d’azote et 21 % d’oxygène : ce n’est pas ${g.toLowerCase()}.`,
        })),
    );
    return {
      prompt: `Quel est le ${rang === 0 ? 'gaz le plus abondant' : 'deuxième gaz le plus abondant'} de l’air sec ?`,
      answer,
      traps: tr,
      hint: 'Compare les pourcentages des gaz de l’air.',
      steps: ['L’air sec : 78 % d’azote, 21 % d’oxygène, 1 % d’autres gaz.', `Réponse : **${bon}**.`],
      targetSeconds: 25,
    };
  }
  const bon = rng.pick(GAZ_SERRE);
  const { answer, traps: tr } = choice(
    rng,
    maj(bon),
    GAZ_AUTRES.map((g) => ({
      label: maj(g),
      why: 'Ce gaz fait partie de l’air, mais il n’est pas cité parmi les gaz à effet de serre.',
    })),
  );
  return {
    prompt: 'Lequel de ces gaz contribue à l’effet de serre ?',
    answer,
    traps: tr,
    hint: 'Pense aux gaz que l’on met en cause quand on parle du climat, et à l’eau présente dans l’air.',
    steps: [
      'La vapeur d’eau, le dioxyde de carbone et le méthane sont des gaz à effet de serre.',
      `**${maj(bon)}** contribue à l’effet de serre.`,
    ],
    targetSeconds: 25,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) {
    const { answer, traps: tr } = saisie(
      ['décantation', 'la décantation', 'decantation', 'la decantation', 'décanter', 'decanter'],
      [
        ['filtration', 'Un filtre retient des solides : il ne sépare pas deux liquides en couches.'],
        ['évaporation', 'L’évaporation fait partir un liquide en vapeur : on perdrait ce liquide.'],
        ['tamisage', 'Le tamisage sépare des grains de tailles différentes.'],
      ],
    );
    return {
      prompt:
        'Deux liquides non miscibles forment deux couches. Quel nom porte la technique qui les sépare après repos ?',
      answer,
      traps: tr,
      hint: 'C’est le même nom que pour laisser un solide se déposer au fond d’un liquide.',
      steps: ['On laisse reposer, puis on sépare les couches.', 'C’est la **décantation**.'],
      targetSeconds: 35,
    };
  }
  if (t === 1) {
    const miscible = rng.int(0, 1) === 0;
    const bon = miscible ? 'miscibles' : 'non miscibles';
    const { answer, traps: tr } = saisie(
      miscible ? ['miscibles', 'miscible'] : ['non miscibles', 'non miscible', 'non-miscibles', 'immiscibles'],
      [
        [
          miscible ? 'non miscibles' : 'miscibles',
          'Regarde si les liquides forment un mélange homogène ou deux couches.',
        ],
      ],
    );
    return {
      prompt: miscible
        ? 'Comment qualifie-t-on deux liquides qui se mélangent de façon homogène ?'
        : 'Comment qualifie-t-on deux liquides qui restent en deux couches après repos ?',
      answer,
      traps: tr,
      hint: 'L’adjectif vient du mot « mélanger ».',
      steps: ['Miscible : qui peut se mélanger de façon homogène.', `Ces liquides sont **${bon}**.`],
      targetSeconds: 30,
    };
  }
  if (t === 2) {
    const azote = rng.int(0, 1) === 0;
    const v = azote ? 78 : 21;
    return {
      prompt: `Quel pourcentage d’${azote ? 'azote' : 'oxygène'} contient l’air sec ?`,
      answer: num(v, '%'),
      traps: traps(r(v), [
        [azote ? 21 : 78, `C’est le pourcentage ${azote ? 'd’oxygène' : 'd’azote'}.`],
        [1, 'C’est la part de l’argon et des gaz rares.'],
      ]),
      hint: 'Les trois parts de l’air sec s’additionnent pour faire 100 %.',
      steps: ['L’air sec : 78 % d’azote, 21 % d’oxygène, 1 % d’argon et de gaz rares.', `Réponse : **${v} %**.`],
      targetSeconds: 25,
    };
  }
  return {
    prompt: 'Complète la phrase sur l’air.',
    answer: {
      kind: 'cloze',
      parts: ['L’air est un ', ' de gaz : il contient surtout de l’', ', puis de l’', '.'],
      blanks: [
        { mode: 'list', options: ['mélange', 'liquide', 'solide'], correct: 0 },
        { mode: 'list', options: ['azote', 'oxygène', 'argon'], correct: 0 },
        { mode: 'list', options: ['azote', 'oxygène', 'argon'], correct: 1 },
      ],
    },
    hint: 'Le gaz le plus abondant représente près de quatre cinquièmes de l’air.',
    steps: [
      'L’air sec réunit plusieurs gaz.',
      'Réponse : un **mélange**, surtout de l’**azote**, puis de l’**oxygène**.',
    ],
    targetSeconds: 40,
  };
};

const SEPARATION: readonly string[] = [
  'Verser le mélange dans une ampoule à décanter',
  'Laisser reposer',
  'Vérifier que deux couches sont bien visibles',
  'Recueillir chaque liquide dans un récipient différent',
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Pour séparer deux liquides non miscibles, remets les étapes dans l’ordre.',
      answer: ordre(rng, SEPARATION),
      hint: 'On ne sépare que ce qui a eu le temps de se mettre en couches.',
      steps: ['Il faut verser, attendre, observer, puis recueillir.', `Ordre : **${SEPARATION.join(' → ')}**.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    const paires: readonly (readonly [string, string])[] = [
      ['Mélange homogène', 'On ne distingue pas ses constituants'],
      ['Liquides miscibles', 'Ils peuvent se mélanger de façon homogène'],
      ['Décantation', 'Séparation après un temps de repos'],
      ['Air', 'Mélange gazeux de l’atmosphère'],
      ['Gaz à effet de serre', 'La vapeur d’eau en est un'],
    ];
    return {
      prompt: 'Associe chaque expression à la description qui lui correspond.',
      answer: association(rng, paires),
      hint: 'Repère d’abord les deux expressions qui parlent de gaz.',
      steps: [
        'Chaque expression a une seule description.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const gaz = rng.pick([
    {
      nom: 'méthane',
      source: 'les élevages de ruminants et les rizières inondées',
      accepte: ['méthane', 'le méthane', 'methane', 'CH4'],
    },
    {
      nom: 'dioxyde de carbone',
      source: 'la combustion de pétrole et de gaz, et la déforestation',
      accepte: ['dioxyde de carbone', 'le dioxyde de carbone', 'gaz carbonique', 'le gaz carbonique', 'CO2'],
    },
  ]);
  const { answer, traps: tr } = saisie(gaz.accepte, [
    ['oxygène', 'L’oxygène n’est pas cité parmi les gaz à effet de serre.'],
    ['azote', 'L’azote n’est pas cité parmi les gaz à effet de serre.'],
    [
      gaz.nom === 'méthane' ? 'dioxyde de carbone' : 'méthane',
      `Ce n’est pas la source principale décrite ici : pense au ${gaz.nom === 'méthane' ? 'gaz émis par les ruminants' : 'gaz émis par les combustions'}.`,
    ],
  ]);
  return {
    prompt: `Quel gaz à effet de serre est notamment émis, du fait des activités humaines, par ${gaz.source} ?`,
    answer,
    traps: tr,
    hint: 'Pense aux deux gaz à effet de serre autres que la vapeur d’eau.',
    steps: ['On relie une activité au gaz qu’elle émet.', `C’est le **${gaz.nom}**.`],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const litres = rng.int(2, 9) * 100;
    const azote = rng.int(0, 1) === 0;
    const part = azote ? 78 : 21;
    const res = (litres * part) / 100;
    return {
      prompt: `Lis le document. Quel volume d’${azote ? 'azote' : 'oxygène'} contient cette quantité d’air, en L ?`,
      figure: {
        kind: 'document',
        title: 'Une réserve d’air (données de l’exercice)',
        lines: [
          `Une réserve contient ${litres} L d’air sec.`,
          'Dans cet exercice, sur 100 L d’air sec : 78 L d’azote, 21 L d’oxygène et 1 L d’autres gaz.',
        ],
      },
      answer: num(res, 'L'),
      traps: traps(r(res), [
        [part, 'C’est la quantité contenue dans 100 L seulement.'],
        [(litres * (azote ? 21 : 78)) / 100, `Tu as pris la part ${azote ? 'de l’oxygène' : 'de l’azote'}.`],
      ]),
      hint: 'Combien de fois 100 L la réserve contient-elle ?',
      steps: [`${litres} L = ${litres / 100} fois 100 L.`, `${litres / 100} × ${part} = **${res} L**.`],
      targetSeconds: 70,
    };
  }
  const masseX = rng.int(7, 9) * 10;
  const masseY = rng.int(10, 12) * 10;
  const xLeger = rng.int(0, 1) === 0;
  const [mx, my] = xLeger ? [masseX, masseY] : [masseY, masseX];
  const haut = xLeger ? 'X' : 'Y';
  const bas = xLeger ? 'Y' : 'X';
  const figure = {
    kind: 'document' as const,
    title: 'Deux liquides (données de l’exercice)',
    lines: [
      'Les liquides X et Y ne sont pas miscibles.',
      `100 mL de X ont une masse de ${mx} g.`,
      `100 mL de Y ont une masse de ${my} g.`,
      'On les verse dans une ampoule à décanter, puis on laisse reposer.',
    ],
  };
  if (t === 1) {
    const bon = `Le liquide ${haut} surnage, le liquide ${bas} est au fond`;
    const { answer, traps: tr } = choice(rng, bon, [
      {
        label: `Le liquide ${bas} surnage, le liquide ${haut} est au fond`,
        why: 'À volume égal, le liquide le plus lourd se place en dessous.',
      },
      { label: 'Les deux liquides forment un mélange homogène', why: 'Le document dit qu’ils ne sont pas miscibles.' },
    ]);
    return {
      prompt: 'Lis le document. Qu’observe-t-on après le repos ?',
      figure,
      answer,
      traps: tr,
      hint: 'Les volumes comparés sont les mêmes : compare les masses.',
      steps: [`À volume égal, ${haut} a la plus petite masse.`, `**${bon}**.`],
      targetSeconds: 60,
    };
  }
  const { answer, traps: tr } = saisie(
    [bas, `le liquide ${bas}`, `liquide ${bas}`],
    [[haut, 'Ce liquide est le plus léger : il est au-dessus, on ne le recueille pas en premier par le bas.']],
  );
  return {
    prompt: 'Lis le document. On vide l’ampoule par le bas. Quel liquide sort en premier ? Écris X ou Y.',
    figure,
    answer,
    traps: tr,
    hint: 'Trouve d’abord quel liquide est au fond.',
    steps: [
      `Le liquide le plus lourd pour 100 mL est au fond : ${bas}.`,
      `Le premier liquide recueilli est **${bas}**.`,
    ],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const melangesMatiere: Skill = {
  id: 'p6-melanges',
  title: 'Mélanges : liquides et air',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Dans un **mélange**, plusieurs corps sont associés. Deux liquides **miscibles** forment un **mélange homogène** ; sinon ils restent en couches et on les sépare par **décantation**, dans une **ampoule à décanter**.',
      'L’air est un mélange gazeux : environ 78 % d’azote, 21 % d’oxygène et 1 % d’autres gaz. La vapeur d’eau, le dioxyde de carbone et le méthane contribuent à l’**effet de serre**.',
    ],
    ...references(
      'separation-liquides',
      'decanter',
      'miscible',
      'homogene',
      'melange',
      'position-liquides',
      'surnager',
      'air-programme',
      'air-composition',
      'air-vapeur',
      'serre-naturels',
      'serre-methane',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
