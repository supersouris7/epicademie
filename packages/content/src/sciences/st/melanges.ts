import { choice, num, traps } from '../../build.ts';
import { add, r, sub } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Mélanges : séparer, dissoudre, masse conservée (programme du cycle 3) ———

type Technique = 'tamisage' | 'decantation' | 'filtration' | 'evaporation';

const TECHNIQUES: Record<Technique, { nom: string; regle: string; geste: string; accepte: readonly string[] }> = {
  tamisage: {
    nom: 'le tamisage',
    regle: 'on sépare des grains de tailles différentes avec un tamis',
    geste: 'On passe le mélange dans un tamis : les petits grains passent, les gros restent dessus.',
    accepte: ['tamisage', 'le tamisage', 'tamiser'],
  },
  decantation: {
    nom: 'la décantation',
    regle: 'on laisse un solide tomber au fond d’un liquide au repos, puis on verse le liquide',
    geste: 'On laisse le mélange reposer : le solide tombe au fond, puis on verse doucement le liquide.',
    accepte: ['décantation', 'la décantation', 'decantation', 'la decantation'],
  },
  filtration: {
    nom: 'la filtration',
    regle: 'un filtre arrête le solide et laisse passer le liquide',
    geste:
      'On verse le mélange sur du papier filtre dans un entonnoir : le liquide traverse, le solide reste sur le papier.',
    accepte: ['filtration', 'la filtration', 'filtrer'],
  },
  evaporation: {
    nom: 'l’évaporation',
    regle: 'on laisse l’eau partir en vapeur pour récupérer ce qui était dissous',
    geste: 'On laisse l’eau partir sous forme de vapeur : il reste ce qui était dissous.',
    accepte: ['évaporation', 'l’évaporation', 'evaporation', 'l’evaporation'],
  },
};
const CLES = Object.keys(TECHNIQUES) as Technique[];

/** Mélanges et technique qui convient (une seule possible dans l'énoncé). */
const BESOINS: readonly { besoin: string; technique: Technique; pourquoi: string }[] = [
  {
    besoin: 'séparer du sable fin et de gros graviers',
    technique: 'tamisage',
    pourquoi:
      'Il n’y a que des solides, de tailles différentes : un tamis les sépare. Sans liquide, il n’y a rien à filtrer.',
  },
  {
    besoin: 'séparer de la farine et des billes de verre',
    technique: 'tamisage',
    pourquoi: 'Il n’y a que des solides, de tailles différentes : un tamis laisse passer la farine, pas les billes.',
  },
  {
    besoin: 'récupérer le sel qui est dissous dans de l’eau salée',
    technique: 'evaporation',
    pourquoi: 'Le sel dissous traverse le filtre et ne tombe pas au fond : seule l’évaporation de l’eau le récupère.',
  },
  {
    besoin: 'récupérer le sucre qui est dissous dans de l’eau sucrée',
    technique: 'evaporation',
    pourquoi: 'Le sucre dissous traverse le filtre et ne tombe pas au fond : seule l’évaporation de l’eau le récupère.',
  },
];

const nonAcceptes = (t: Technique) => CLES.filter((x) => x !== t);

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      scene: 'On veut séparer du sable fin et de gros graviers : on les passe dans un tamis.',
      t: 'tamisage' as const,
    },
    { scene: 'On verse de l’eau et du sable dans un entonnoir garni de papier filtre.', t: 'filtration' as const },
    {
      scene: 'On laisse de l’eau salée au soleil jusqu’à ce que l’eau disparaisse : il reste du sel.',
      t: 'evaporation' as const,
    },
  ]);
  const trois: Technique[] = ['tamisage', 'filtration', 'evaporation'];
  const { answer, traps: tr } = choice(
    rng,
    TECHNIQUES[cas.t].nom,
    trois
      .filter((x) => x !== cas.t)
      .map((x) => ({
        label: TECHNIQUES[x].nom,
        why: `Ce n’est pas ${TECHNIQUES[x].nom} : ${TECHNIQUES[x].regle}.`,
      })),
  );
  return {
    prompt: `${cas.scene} Quelle technique de séparation est utilisée ?`,
    answer,
    traps: tr,
    hint: 'Regarde l’outil ou le geste : tamis, papier filtre, ou eau qui s’en va.',
    steps: [
      'On repère l’outil ou le geste de la scène.',
      `Ici, ${TECHNIQUES[cas.t].regle}.`,
      `Technique : **${TECHNIQUES[cas.t].nom}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.pick(CLES);
  const mel =
    t === 'tamisage'
      ? 'du sable fin et de gros graviers'
      : t === 'evaporation'
        ? 'de l’eau salée'
        : t === 'decantation'
          ? 'de l’eau et de la terre'
          : 'de l’eau et du sable';
  const { answer, traps: tr } = choice(
    rng,
    TECHNIQUES[t].nom,
    nonAcceptes(t).map((x) => ({
      label: TECHNIQUES[x].nom,
      why: `Ce n’est pas ${TECHNIQUES[x].nom} : ${TECHNIQUES[x].regle}.`,
    })),
  );
  return {
    prompt: `Mélange : ${mel}. ${TECHNIQUES[t].geste} Comment s’appelle cette technique ?`,
    answer,
    traps: tr,
    hint: 'Chaque technique a son geste : tamis, repos, filtre ou eau qui s’évapore.',
    steps: [
      'On compare le geste décrit avec chaque technique.',
      `Ici, ${TECHNIQUES[t].regle}.`,
      `Technique : **${TECHNIQUES[t].nom}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const sel = rng.int(0, 1) === 0;
    const juste = sel
      ? [
          'On verse l’eau salée dans une assiette creuse',
          'On pose l’assiette au soleil',
          'L’eau part sous forme de vapeur',
          'Il reste des cristaux de sel',
        ]
      : [
          'On verse de l’eau et de la terre dans un verre',
          'On laisse le verre immobile',
          'La terre tombe au fond du verre',
          'On verse doucement l’eau du dessus',
        ];
    return {
      prompt: sel
        ? 'Pour récupérer le sel d’une eau salée, remets les étapes dans l’ordre.'
        : 'Pour séparer de l’eau et de la terre par décantation, remets les étapes dans l’ordre.',
      answer: ordre(rng, juste),
      hint: sel
        ? 'Commence par mettre l’eau salée quelque part, et finis par ce qui reste.'
        : 'Il faut d’abord attendre que la terre ait le temps de tomber.',
      steps: [
        sel
          ? 'L’eau salée est d’abord versée, puis chauffée par le soleil : l’eau s’évapore.'
          : 'On met le mélange dans le verre, on attend, la terre se dépose, et seulement alors on verse.',
        `Ordre : **${juste.join(' → ')}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const b = rng.pick(BESOINS);
  const { answer, traps: tr } = saisie(
    TECHNIQUES[b.technique].accepte,
    nonAcceptes(b.technique).flatMap((x) => TECHNIQUES[x].accepte.slice(0, 1).map((m) => [m, b.pourquoi] as const)),
  );
  return {
    prompt: `Quelle technique permet de ${b.besoin} ? Écris son nom.`,
    answer,
    traps: tr,
    hint: 'Il y a un liquide ou non ? Le solide est-il dissous ?',
    steps: [
      'On regarde si le mélange contient un liquide, et si le solide est dissous.',
      b.pourquoi,
      `Technique : **${TECHNIQUES[b.technique].nom}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Associe chaque mot à ce qui se passe.',
      answer: association(rng, [
        ['le tamisage', 'Des grains de tailles différentes sont séparés par un tamis'],
        ['la décantation', 'Le solide tombe au fond du liquide au repos, puis on verse le liquide'],
        ['la filtration', 'Le liquide traverse un papier filtre, le solide reste dessus'],
        ['l’évaporation', 'L’eau part en vapeur, ce qui était dissous reste'],
        ['la dissolution', 'Le solide disparaît dans l’eau : on ne le voit plus, mais il est toujours là'],
      ]),
      hint: 'Relie d’abord ceux dont tu es sûr : le tamis, le filtre, la vapeur… puis termine par élimination.',
      steps: [
        'Chaque mot correspond à un geste ou à un phénomène précis.',
        'La dissolution est la seule qui n’est pas une technique de séparation : le solide se mélange à l’eau.',
        'Chaque mot est relié à **sa** description.',
      ],
      targetSeconds: 60,
    };
  }
  const cas = rng.pick([
    { s: 'du sel', oui: true, why: 'Le sel se dissout : on le voit disparaître, mais il est toujours dans l’eau.' },
    {
      s: 'du sucre',
      oui: true,
      why: 'Le sucre se dissout : on le voit disparaître, mais il est toujours dans l’eau.',
    },
    {
      s: 'du sable',
      oui: false,
      why: 'Le sable ne se dissout pas : ses grains restent visibles et tombent au fond.',
    },
    { s: 'des cailloux', oui: false, why: 'Les cailloux ne se dissolvent pas : ils restent visibles au fond.' },
  ]);
  const { answer, traps: tr } = saisie(cas.oui ? ['oui'] : ['non'], [[cas.oui ? 'non' : 'oui', cas.why]]);
  return {
    prompt: `On remue ${cas.s} dans un verre d’eau. Le solide se dissout-il ? Réponds par oui ou non.`,
    answer,
    traps: tr,
    hint: 'Après avoir remué, est-ce que tu vois encore des morceaux ou des grains au fond ?',
    steps: [
      'Un solide qui se dissout disparaît à la vue, mais il est toujours dans l’eau.',
      cas.oui ? 'Ici, le solide disparaît dans l’eau.' : 'Ici, le solide reste visible au fond.',
      `Il se dissout ? **${cas.oui ? 'oui' : 'non'}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  // Niveau 5 : masse conservée, ou technique à reconnaître dans un récit.
  const type = rng.int(0, 5);
  if (type <= 1) {
    const sel = rng.int(1, 5) * 10;
    const eau = rng.int(1, 5) * 100;
    if (type === 0) {
      return {
        prompt: 'Quelle est la masse de l’eau salée obtenue, en g ?',
        figure: {
          kind: 'document',
          title: 'Une expérience',
          lines: [
            `On pèse ${eau} g d’eau.`,
            `On y dissout ${sel} g de sel en remuant.`,
            'Le sel a disparu : on ne le voit plus.',
          ],
        },
        answer: num(eau + sel, 'g'),
        traps: traps(r(eau + sel), [
          [eau, 'Le sel a disparu à la vue, mais il est toujours là : sa masse compte.'],
          [sub(r(eau), r(sel)), 'Le sel ne fait pas perdre de masse : on additionne.'],
        ]),
        hint: 'Quand on mélange, rien ne se perd : la masse totale se conserve.',
        steps: [
          'La masse totale se conserve : on additionne l’eau et le sel.',
          `${eau} + ${sel}.`,
          `Masse de l’eau salée : **${eau + sel} g**.`,
        ],
        targetSeconds: 50,
      };
    }
    return {
      prompt: 'Quelle masse de sel récupère-t-on, en g ?',
      figure: {
        kind: 'document',
        title: 'Une expérience',
        lines: [
          `On dissout du sel dans ${eau} g d’eau : l’eau salée pèse ${eau + sel} g.`,
          'On la verse dans une assiette au soleil.',
          'Toute l’eau s’évapore : il reste du sel.',
        ],
      },
      answer: num(sel, 'g'),
      traps: traps(r(sel), [
        [eau + sel, 'Ça, c’est la masse de l’eau salée : l’eau est partie en vapeur.'],
        [add(r(eau), r(eau + sel)), 'On ne les additionne pas : on cherche ce qui reste quand l’eau est partie.'],
      ]),
      hint: 'La masse totale se conserve : l’eau salée = eau + sel.',
      steps: [
        'L’eau salée pèse autant que l’eau plus le sel.',
        `Sel = ${eau + sel} − ${eau}.`,
        `On récupère **${sel} g** de sel.`,
      ],
      targetSeconds: 50,
    };
  }
  const recit = [
    {
      t: 'evaporation' as const,
      titre: 'Dans un marais salant',
      lignes: [
        'L’eau de mer entre dans de grands bassins peu profonds.',
        'Le soleil et le vent chauffent l’eau, qui part dans l’air.',
        'Au fond, il reste du sel que l’on ramasse.',
      ],
    },
    {
      t: 'decantation' as const,
      titre: 'Après l’orage',
      lignes: [
        'Un seau d’eau boueuse reste immobile pendant une heure.',
        'La terre est tombée au fond ; l’eau du dessus est plus claire.',
        'On verse doucement cette eau claire dans une bouteille.',
      ],
    },
    {
      t: 'tamisage' as const,
      titre: 'Au jardin',
      lignes: [
        'Un jardinier verse de la terre dans un grand tamis.',
        'Les cailloux restent sur le tamis.',
        'La terre fine tombe en dessous.',
      ],
    },
    {
      t: 'filtration' as const,
      titre: 'En classe',
      lignes: [
        'On verse de l’eau trouble, pleine de sable, dans un entonnoir.',
        'Dans l’entonnoir, il y a un papier filtre.',
        'L’eau tombe dans le verre ; le sable reste sur le papier.',
      ],
    },
  ] as const;
  const c = recit[type - 2] ?? recit[0];
  const { answer, traps: tr } = choice(
    rng,
    TECHNIQUES[c.t].nom,
    nonAcceptes(c.t).map((x) => ({
      label: TECHNIQUES[x].nom,
      why: `Ce n’est pas ${TECHNIQUES[x].nom} : ${TECHNIQUES[x].regle}.`,
    })),
  );
  return {
    prompt: 'Lis le texte. Quelle technique de séparation est utilisée ?',
    figure: { kind: 'document', title: c.titre, lines: c.lignes },
    answer,
    traps: tr,
    hint: 'Cherche ce qui se passe : un outil (tamis, filtre), du repos, ou de l’eau qui s’en va.',
    steps: [
      'On cherche le geste qui sépare les deux matières.',
      `Ici, ${TECHNIQUES[c.t].regle}.`,
      `Technique : **${TECHNIQUES[c.t].nom}**.`,
    ],
    targetSeconds: 45,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const melanges: Skill = {
  id: 'pcm1-melanges',
  title: 'Les mélanges',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **mélange** réunit plusieurs matières. Pour le séparer : le **tamisage** (grains de tailles différentes), la **décantation** (le solide tombe au fond), la **filtration** (un filtre retient le solide).',
      'Certains solides se **dissolvent** dans l’eau : le sel disparaît à la vue ! L’**évaporation** le récupère. Et la masse totale ne change pas quand on mélange.',
    ],
    source: `${PROGRAMME} : « Séparer les constituants d’un mélange de solides ou d’un mélange solide-liquide par tamisage, décantation, filtration » ; « Observer que certains solides peuvent se dissoudre dans l’eau et qu’il est possible de les récupérer par évaporation » ; « la masse totale se conserve lors du mélange d’un solide dans un liquide ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
