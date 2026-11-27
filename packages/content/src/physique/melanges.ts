import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { association, maj, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-matiere.ts';

// ——— Corps purs et mélanges (5e) ———

const PURS: readonly string[] = [
  'un liquide qui ne contient que de l’eau',
  'un clou qui ne contient que du fer',
  'un gaz qui ne contient que du dioxygène',
  'un fil qui ne contient que du cuivre',
  'un anneau qui ne contient que de l’or',
];
const MELANGES: readonly string[] = [
  'de l’eau salée',
  'de l’air',
  'de l’eau sucrée',
  'de l’eau avec du sirop',
  'de l’eau boueuse',
];

/** Observations données dans l'énoncé : on conclut à partir de ce qu'on voit. */
const HOMOGENES: readonly string[] = [
  'De l’eau salée limpide : on ne distingue aucun grain.',
  'De l’eau colorée par du sirop : la couleur est la même partout et on ne distingue qu’un seul liquide.',
  'De l’eau sucrée après agitation : on ne voit plus le sucre.',
];
const HETEROGENES: readonly string[] = [
  'De l’eau et du sable : on voit les grains au fond.',
  'De l’eau et de l’huile : deux couches sont visibles.',
  'Une boue : on distingue des morceaux de terre dans l’eau.',
];

const DEFINITIONS: readonly (readonly [string, string])[] = [
  ['Corps pur', 'Ne contient aucune matière étrangère détectable'],
  ['Mélange', 'Associe plusieurs corps qui gardent leurs propriétés'],
  ['Mélange homogène', 'On ne peut pas distinguer ses constituants'],
  ['Mélange hétérogène', 'Ses éléments sont de nature différente et se distinguent'],
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const cherchePur = rng.int(0, 1) === 0;
  const bon = rng.pick(cherchePur ? PURS : MELANGES);
  const autres = rng.shuffle(cherchePur ? MELANGES : PURS).slice(0, 2);
  const { answer, traps } = choice(
    rng,
    maj(bon),
    autres.map((a) => ({
      label: maj(a),
      why: cherchePur
        ? 'C’est un mélange : plusieurs corps y sont associés.'
        : 'Il ne contient qu’une seule matière : aucune autre n’y est mêlée.',
    })),
  );
  return {
    prompt: `Lequel de ces trois échantillons est ${cherchePur ? 'un corps pur' : 'un mélange'} ?`,
    answer,
    traps,
    hint: 'Combien de sortes de matière y a-t-il dans chaque échantillon ?',
    steps: [
      'Un corps pur ne contient aucune autre matière ; un mélange associe plusieurs corps.',
      `La bonne réponse est : **${bon}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const trois = rng.shuffle(DEFINITIONS).slice(0, 3);
    return {
      prompt: `Associe chaque terme à sa description : ${trois
        .map(([t]) => t.toLowerCase())
        .sort()
        .join(', ')}.`,
      answer: association(rng, trois),
      hint: 'Un mélange homogène a l’air « uni » ; un hétérogène montre ses constituants.',
      steps: [
        'On distingue corps pur et mélange, puis les deux sortes de mélanges.',
        `Réponse : **${trois.map(([t, d]) => `${t} → ${d.toLowerCase()}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const homogene = rng.int(0, 1) === 0;
  const bon = rng.pick(homogene ? HOMOGENES : HETEROGENES);
  const autres = rng.shuffle(homogene ? HETEROGENES : HOMOGENES);
  const { answer, traps } = choice(rng, bon, [
    ...autres.map((a) => ({
      label: a,
      why: homogene
        ? 'On distingue ses constituants : ce mélange est hétérogène.'
        : 'On ne distingue pas ses constituants : ce mélange est homogène.',
    })),
  ]);
  return {
    prompt: `Quel échantillon est un mélange ${homogene ? 'homogène' : 'hétérogène'} ?`,
    answer,
    traps,
    hint: 'Peut-on voir les différents constituants ?',
    steps: [
      'Dans un mélange homogène, on ne distingue pas les constituants ; dans un hétérogène, on les voit.',
      `La bonne réponse est : **${bon}**`,
    ],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const homogene = rng.int(0, 1) === 0;
    const obs = rng.pick(homogene ? HOMOGENES : HETEROGENES);
    const bon = homogene ? 'homogène' : 'hétérogène';
    const { answer, traps } = saisie(homogene ? ['homogène', 'homogene'] : ['hétérogène', 'heterogene'], [
      [
        homogene ? 'hétérogène' : 'homogène',
        homogene
          ? 'Hétérogène : on distinguerait les constituants. Ce n’est pas le cas ici.'
          : 'Homogène : on ne distinguerait pas les constituants. Ici, on les voit.',
      ],
      ['pur', 'Plusieurs corps sont associés : ce n’est pas un corps pur.'],
    ]);
    return {
      prompt: `${obs} Ce mélange est-il homogène ou hétérogène ? Écris le mot.`,
      answer,
      traps,
      hint: '« Hétéro » signifie différent, « homo » signifie semblable.',
      steps: [
        'On regarde si l’on distingue les constituants.',
        homogene ? 'On ne les distingue pas.' : 'On les distingue.',
        `Le mélange est **${bon}**.`,
      ],
      targetSeconds: 35,
    };
  }
  const option = (correct: number) => ({
    mode: 'list' as const,
    options: ['pur', 'homogène', 'hétérogène'],
    correct,
  });
  const homogene = rng.int(0, 1) === 0;
  const echantillon = rng.pick(homogene ? HOMOGENES : HETEROGENES);
  return {
    prompt: `Observe : « ${echantillon} » Complète la phrase.`,
    answer: {
      kind: 'cloze',
      parts: ['C’est un mélange ', '. Ses constituants ', ' à l’œil.'],
      blanks: [
        option(homogene ? 1 : 2),
        {
          mode: 'list',
          options: ['ne se distinguent pas', 'se distinguent'],
          correct: homogene ? 0 : 1,
        },
      ],
    },
    hint: 'Regarde ce que l’observation dit de ce que l’on voit.',
    steps: [
      homogene ? 'La composition paraît uniforme.' : 'On voit des parties différentes.',
      `C’est un mélange **${homogene ? 'homogène' : 'hétérogène'}**.`,
    ],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const limpide = 'L’aspect ne suffit pas : de l’eau salée est limpide et c’est pourtant un mélange.';
    const { question, rep } = rng.pick([
      { question: 'Une eau parfaitement limpide est-elle forcément un corps pur ?', rep: 'non' },
      { question: 'Un liquide transparent et incolore est-il forcément un corps pur ?', rep: 'non' },
      { question: 'Un liquide où l’on ne distingue rien est-il forcément un corps pur ?', rep: 'non' },
      { question: 'Une eau parfaitement limpide peut-elle être un mélange ?', rep: 'oui' },
      { question: 'Un liquide où l’on ne distingue rien peut-il contenir une matière dissoute ?', rep: 'oui' },
    ]);
    const { answer, traps } = saisie([rep], [[rep === 'oui' ? 'non' : 'oui', limpide]]);
    return {
      prompt: `${question} Réponds par oui ou non.`,
      answer,
      traps,
      hint: 'Pense à ce que contient une eau salée.',
      steps: [
        'Un mélange homogène a l’air uni : on ne voit pas ses constituants.',
        'Voir un liquide limpide ne prouve donc pas qu’il est pur.',
        `La réponse est **${rep}**.`,
      ],
      targetSeconds: 40,
    };
  }
  if (type === 1) {
    const formule = rng.pick([
      'Quel gaz représente environ les 4/5 de l’air ? Écris son nom.',
      'L’air est un mélange de gaz. Quel gaz en constitue environ les 4/5 ? Écris son nom.',
    ]);
    const { answer, traps } = saisie(
      ['azote', 'l’azote', 'diazote', 'le diazote'],
      [
        ['dioxygène', 'Le dioxygène est présent dans l’air, mais ce n’est pas le gaz le plus abondant.'],
        ['oxygène', 'L’oxygène est présent dans l’air, mais ce n’est pas le gaz le plus abondant.'],
        ['dioxyde de carbone', 'Le dioxyde de carbone n’est présent qu’en très petite quantité dans l’air.'],
      ],
    );
    return {
      prompt: formule,
      answer,
      traps,
      hint: 'Ce n’est pas le gaz que nous utilisons en respirant.',
      steps: [
        'L’air n’est pas un corps pur : il associe plusieurs gaz.',
        'Celui qui occupe environ 4/5 est l’**azote** (diazote).',
      ],
      targetSeconds: 35,
    };
  }
  return {
    prompt: 'Associe chaque échantillon à la bonne description.',
    answer: association(rng, [
      ['De l’eau pure', 'Corps pur liquide'],
      ['De l’eau salée limpide', 'Mélange homogène liquide'],
      ['De l’eau avec du sable', 'Mélange hétérogène solide et liquide'],
      ['De l’air', 'Mélange de gaz'],
      ['Du fer pur', 'Corps pur solide'],
    ]),
    hint: 'Cherche d’abord si l’échantillon est pur, puis son état.',
    steps: [
      'On sépare les corps purs des mélanges, puis on regarde l’état et l’aspect.',
      'Réponse : **eau pure → corps pur liquide ; eau limpide avec un solide dissous → mélange homogène ; eau et sable → mélange hétérogène ; air → mélange de gaz ; métal pur → corps pur solide**.',
    ],
    targetSeconds: 70,
  };
};

/** Substances de référence fictives : température de fusion (°C), données de l'exercice. */
const REFERENCES: readonly { nom: string; tf: number }[] = [
  { nom: 'A', tf: 44 },
  { nom: 'B', tf: 54 },
  { nom: 'C', tf: 69 },
  { nom: 'D', tf: 80 },
];
/** Paliers qui ne figurent pas dans le tableau. */
const HORS_TABLEAU: readonly number[] = [49, 61, 74];
const CAS = ['reference', 'absent', 'melange'] as const;

/** Relevés pendant la fusion : palier constant, ou température qui continue de monter (en passant par `t`). */
const releves = (cas: (typeof CAS)[number], t: number) =>
  (cas === 'melange' ? [t - 3, t, t + 3, t + 6] : [t, t, t, t]).map((x) => `${x} °C`).join(' ; ');

const releveDeFusion = (rng: Rng): QuestionDraft => {
  const solides = (rng.int(0, 1) === 0 ? ['X', 'Y'] : ['X', 'Y', 'Z']).map((nom) => {
    const cas = rng.pick(CAS);
    const ref = rng.pick(REFERENCES);
    return { nom, cas, ref, t: cas === 'absent' ? rng.pick(HORS_TABLEAU) : ref.tf };
  });
  const cible = rng.pick(solides);
  const autre = rng.pick(REFERENCES.filter((x) => x !== cible.ref));
  const corpsPur = (nom: string) => `Le corps pur ${nom}`;
  const MELANGE = 'Un mélange';
  const ABSENT = 'Un corps pur absent du tableau';
  const bon = cible.cas === 'melange' ? MELANGE : cible.cas === 'absent' ? ABSENT : corpsPur(cible.ref.nom);
  const why =
    cible.cas === 'melange'
      ? 'La température continue de monter pendant la fusion : il n’y a pas de palier, ce n’est pas un corps pur.'
      : cible.cas === 'absent'
        ? `Le solide fond à température constante (${cible.t} °C), une valeur qui n’est pas dans le tableau.`
        : `Le solide fond à température constante : ce palier à ${cible.t} °C correspond à la substance ${cible.ref.nom}.`;
  const { answer, traps } = choice(
    rng,
    bon,
    [MELANGE, ABSENT, corpsPur(cible.ref.nom), corpsPur(autre.nom)]
      .filter((label) => label !== bon)
      .map((label) => ({ label, why })),
  );
  return {
    prompt: `Lis le document. Que peut-on conclure pour le solide ${cible.nom} ?`,
    figure: {
      kind: 'document',
      title: 'Relevés pendant la fusion, une mesure par minute (données de l’exercice)',
      lines: [
        ...REFERENCES.map((x) => `Substance ${x.nom} (corps pur) : fusion à ${x.tf} °C.`),
        ...solides.map((s) => `Solide ${s.nom} : ${releves(s.cas, s.t)}.`),
      ],
    },
    answer,
    traps,
    hint: 'Regarde d’abord si la température reste constante pendant la fusion, puis compare avec le tableau.',
    steps: ['Un corps pur fond à température constante : on cherche un palier.', why, `Conclusion : **${bon}**.`],
    targetSeconds: 90,
  };
};

const ETIQUETTES = [
  {
    bon: 'Un corps pur',
    lignes: ['Liquide limpide, on n’y voit aucun dépôt.', 'Contenu : de l’eau, aucune autre matière détectée.'],
    indice: 'Une seule matière est présente : c’est un corps pur.',
  },
  {
    bon: 'Un mélange homogène',
    lignes: ['Liquide limpide, on n’y voit aucun dépôt.', 'Contenu : eau ; matières dissoutes : calcium, sodium.'],
    indice: 'Plusieurs matières sont associées et on ne les distingue pas.',
  },
  {
    bon: 'Un mélange hétérogène',
    lignes: ['Liquide avec un dépôt visible au fond.', 'Contenu : eau, pulpe de fruit, sucre.'],
    indice: 'Plusieurs matières sont associées et on distingue un dépôt.',
  },
] as const;

const etiquette = (rng: Rng): QuestionDraft => {
  const e = rng.pick(ETIQUETTES);
  const nom = rng.pick(['Source du Val', 'Les Pins', 'Le Roc']);
  const { answer, traps } = choice(
    rng,
    e.bon,
    ETIQUETTES.filter((x) => x !== e).map((x) => ({
      label: x.bon,
      why: `${e.indice} Ce n’est donc pas ${x.bon.toLowerCase()}.`,
    })),
  );
  return {
    prompt: `Lis l’étiquette du flacon « ${nom} ». De quel type de matière s’agit-il ?`,
    figure: { kind: 'document', title: 'Étiquette (inventée pour l’exercice)', lines: [...e.lignes] },
    answer,
    traps,
    hint: 'Compare ce que l’on voit et ce que l’étiquette indique.',
    steps: [
      'On compte les matières présentes, puis on regarde si on les distingue.',
      e.indice,
      `C’est **${e.bon.toLowerCase()}**.`,
    ],
    targetSeconds: 70,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => (rng.int(0, 2) === 0 ? etiquette(rng) : releveDeFusion(rng));

export const corpsPurs: Skill = {
  id: 'p5-corps-purs-melanges',
  title: 'Corps purs et mélanges',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **corps pur** ne contient aucune matière étrangère. Un **mélange** associe plusieurs corps qui gardent leurs propriétés.',
      'Mélange **homogène** : on ne distingue pas les constituants (eau salée). Mélange **hétérogène** : on les voit (eau et sable). Limpide ne veut pas dire pur !',
      'L’air est un mélange de gaz, dont environ 4/5 d’azote. Un corps pur fond à température constante (un palier), ce qui aide à l’identifier ; si la température monte encore pendant la fusion, il n’est pas pur.',
    ],
    ...references(
      'corps-pur',
      'melange',
      'homogene',
      'heterogene',
      'azote',
      'identifier-corps-purs',
      'paliers',
      'palier-corps-pur',
      'limpide',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
