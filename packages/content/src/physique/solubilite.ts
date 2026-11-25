import { choice, num, traps } from '../build.ts';
import { dec, fmt, mul, r, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-matiere.ts';

// ——— Solubilité et miscibilité (5e) ———

const SOLUTIONS: readonly { solute: string; boisson: string }[] = [
  { solute: 'sel', boisson: 'eau salée' },
  { solute: 'sucre', boisson: 'eau sucrée' },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SOLUTIONS);
  const solvant = rng.int(0, 1) === 0;
  const bon = solvant ? 'L’eau' : `Le ${s.solute}`;
  const { answer, traps: t } = choice(rng, bon, [
    {
      label: solvant ? `Le ${s.solute}` : 'L’eau',
      why: solvant
        ? 'C’est la substance dissoute : le soluté.'
        : 'C’est la substance qui dissout l’autre : le solvant.',
    },
    { label: 'Le verre', why: 'Le verre est le récipient : il ne se dissout pas et ne dissout rien ici.' },
  ]);
  return {
    prompt: `Dans un verre d’${s.boisson}, quel est le ${solvant ? 'solvant' : 'soluté'} ?`,
    answer,
    traps: t,
    hint: 'Le solvant dissout ; le soluté est dissous.',
    steps: [
      'Le solvant est la substance qui dissout ; le soluté est celle qui est dissoute.',
      `C’est **${bon.toLowerCase()}**.`,
    ],
    targetSeconds: 25,
  };
};

const OBSERVATIONS: readonly {
  texte: string;
  bon: string;
  pourquoi: string;
  faux: readonly { label: string; why: string }[];
}[] = [
  {
    texte: 'Après agitation, un solide ne se voit plus dans l’eau.',
    bon: 'Le solide est soluble dans l’eau',
    pourquoi: 'Le solide se dissout dans l’eau.',
    faux: [
      { label: 'Le solide est insoluble dans l’eau', why: 'Il ne se voit plus : il s’est dissous.' },
      {
        label: 'Le solide et l’eau sont deux liquides miscibles',
        why: 'Ce qu’on ajoute ici est un solide : on dit qu’il est soluble.',
      },
      {
        label: 'La solution est forcément saturée',
        why: 'Saturée veut dire que plus rien ne peut se dissoudre : rien ne le montre ici.',
      },
    ],
  },
  {
    texte: 'Après agitation, un solide reste en entier au fond de l’eau, sans changer.',
    bon: 'Le solide est insoluble dans l’eau',
    pourquoi: 'Le solide ne se dissout pas.',
    faux: [
      { label: 'Le solide est soluble dans l’eau', why: 'Un solide soluble se dissout : celui-ci reste entier.' },
      {
        label: 'La solution est saturée : une partie du solide s’est dissoute',
        why: 'Le solide reste en entier, sans changer : on n’en voit aucune partie se dissoudre.',
      },
      {
        label: 'Le solide et l’eau sont miscibles',
        why: 'Miscibles veut dire qu’ils forment un mélange homogène : on voit encore le solide.',
      },
    ],
  },
  {
    texte: 'On verse un liquide dans l’eau, on agite : on obtient un seul liquide homogène.',
    bon: 'Les deux liquides sont miscibles',
    pourquoi: 'Les deux liquides forment un mélange homogène.',
    faux: [
      { label: 'Les deux liquides ne sont pas miscibles', why: 'On verrait alors deux couches.' },
      { label: 'Le liquide versé est insoluble dans l’eau', why: 'On le distinguerait encore de l’eau.' },
      {
        label: 'La solution est forcément saturée',
        why: 'Saturée veut dire que plus rien ne peut se dissoudre : rien ne le montre ici.',
      },
    ],
  },
  {
    texte: 'On verse un liquide dans l’eau, on agite puis on laisse reposer : deux couches se forment.',
    bon: 'Les deux liquides ne sont pas miscibles',
    pourquoi: 'Les deux liquides ne forment pas un mélange homogène.',
    faux: [
      { label: 'Les deux liquides sont miscibles', why: 'Des liquides miscibles forment un seul liquide homogène.' },
      { label: 'Le liquide versé s’est dissous entièrement', why: 'On verrait alors un seul liquide.' },
      { label: 'On a obtenu un mélange homogène', why: 'Deux couches se distinguent : le mélange est hétérogène.' },
    ],
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const o = rng.pick(OBSERVATIONS);
  const { answer, traps: t } = choice(rng, o.bon, o.faux);
  return {
    prompt: `${o.texte} Quelle conclusion tires-tu ?`,
    answer,
    traps: t,
    hint: 'Soluble parle d’une substance qui se dissout ; miscible parle d’un mélange homogène, ici entre liquides.',
    steps: [o.pourquoi, `Conclusion : **${o.bon.toLowerCase()}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SOLUTIONS);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Complète les phrases à propos de l’${s.boisson}.`,
      answer: {
        kind: 'cloze',
        parts: [`L’eau est le `, `. Le ${s.solute} est le `, '.'],
        blanks: [
          { mode: 'list', options: ['soluté', 'solvant'], correct: 1 },
          { mode: 'list', options: ['soluté', 'solvant'], correct: 0 },
        ],
      },
      hint: 'L’un dissout, l’autre est dissous.',
      steps: ['L’eau dissout, elle est le solvant.', `Réponse : **solvant**, puis **soluté** pour le ${s.solute}.`],
      targetSeconds: 35,
    };
  }
  const { answer, traps: t } = saisie(
    ['saturée', 'saturee', 'saturé', 'sature'],
    [
      ['miscible', 'Miscible se dit de deux corps qui se mélangent de façon homogène.'],
      ['insoluble', 'Le solide s’est d’abord dissous : il n’est pas insoluble.'],
    ],
  );
  return {
    prompt: `On ajoute du ${s.solute} dans de l’eau jusqu’à ce qu’il ne se dissolve plus : un dépôt reste au fond. Comment qualifie-t-on la solution ?`,
    answer,
    traps: t,
    hint: 'La solution contient le maximum de substance dissoute possible.',
    steps: [
      'L’eau contient le maximum de substance qu’elle peut dissoudre à cette température.',
      'La solution est **saturée**.',
    ],
    targetSeconds: 40,
  };
};

/** Solubilités fictives (g par litre d'eau à la température de l'expérience), données de l'exercice. */
const solubilite = (rng: Rng) => rng.int(3, 30) * 10;
const volumes: readonly { texte: string; v: Rational }[] = [
  { texte: '0,5', v: dec(5, 1) },
  { texte: '2', v: r(2) },
  { texte: '3', v: r(3) },
  { texte: '0,2', v: dec(2, 1) },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const sol = solubilite(rng);
  const { texte, v } = rng.pick(volumes);
  const max = mul(r(sol), v);
  const type = rng.int(0, 2);
  if (type === 0) {
    return {
      prompt: `La solubilité d’un solide X est de ${sol} g par litre d’eau. Quelle masse maximale, en grammes, peut-on dissoudre dans ${texte} L d’eau ?`,
      answer: num(max, 'g'),
      traps: traps(max, [
        [r(sol), 'C’est la masse pour 1 L : il faut tenir compte du volume d’eau.'],
        [dec(sol * 10 + v.n * (10 / v.d), 1), 'On multiplie la solubilité par le volume (on n’additionne pas).'],
      ]),
      hint: 'La masse dissoute maximale est proportionnelle au volume d’eau.',
      steps: [`Pour 1 L : ${sol} g.`, `Pour ${texte} L : ${sol} × ${texte} = **${fmt(max)} g**.`],
      targetSeconds: 70,
    };
  }
  if (type === 1) {
    const surplus = rng.int(2, 9) * 5;
    const verse = max.n / max.d + surplus;
    return {
      prompt: `La solubilité d’un solide Y est de ${sol} g par litre d’eau. On en verse ${fmt(r(verse))} g dans ${texte} L d’eau et on agite longtemps. Quelle masse, en grammes, reste non dissoute ?`,
      answer: num(surplus, 'g'),
      traps: traps(r(surplus), [
        [max, 'C’est la masse qui se dissout : on demande ce qui reste au fond.'],
        [verse, 'Une partie du solide se dissout : tout ne reste pas au fond.'],
      ]),
      hint: 'Calcule d’abord la masse maximale que cette eau peut dissoudre.',
      steps: [
        `Masse maximale dissoute : ${sol} × ${texte} = ${fmt(max)} g.`,
        `Reste : ${fmt(r(verse))} − ${fmt(max)} = **${surplus} g**.`,
      ],
      targetSeconds: 90,
    };
  }
  return {
    prompt: 'Associe chacun des cinq mots à sa description.',
    answer: association(rng, [
      ['Soluté', 'Substance dissoute'],
      ['Solvant', 'Substance qui dissout'],
      ['Solution saturée', 'Contient le maximum de substance dissoute possible'],
      ['Insoluble', 'Ne peut pas être dissous'],
      ['Miscible', 'Se mélange à un autre corps de façon homogène'],
    ]),
    hint: 'Commence par les mots en « sol… » : qui dissout, qui est dissous ?',
    steps: [
      'Le solvant dissout, le soluté est dissous.',
      'Réponse : **soluté → dissous ; solvant → dissout ; saturée → maximum dissous ; insoluble → ne se dissout pas ; miscible → mélange homogène**.',
    ],
    targetSeconds: 70,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const diviseur = rng.pick([2, 4, 5]);
  const volume = 1000 / diviseur;
  const masse = rng.int(4, 12) * 5;
  const sol = masse * diviseur;
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Lis le compte rendu. Estime la solubilité du solide Z, en grammes par litre d’eau.',
      figure: {
        kind: 'document',
        title: 'Compte rendu d’expérience (données de l’exercice)',
        lines: [
          `On verse ${volume} mL d’eau dans un bécher.`,
          'On ajoute le solide Z par petites quantités en agitant, à température constante.',
          `Jusqu’à ${masse} g au total, tout se dissout.`,
          'Ensuite, chaque ajout reste au fond.',
        ],
      },
      answer: num(sol, 'g/L'),
      traps: traps(r(sol), [
        [masse, `C’est la masse dissoute dans ${volume} mL : il faut la ramener à 1 L.`],
        [masse * volume, 'On ne multiplie pas la masse par le nombre de mL.'],
      ]),
      hint: `Combien de fois ${volume} mL tient-il dans 1 000 mL ?`,
      steps: [`1 L = 1 000 mL = ${diviseur} × ${volume} mL.`, `Solubilité : ${masse} × ${diviseur} = **${sol} g/L**.`],
      targetSeconds: 100,
    };
  }
  // Deux volumes d'eau différents : il faut ramener les masses au même volume (100 mL) avant de comparer.
  const [petit, grand] = rng.pick([
    [100, 200],
    [100, 250],
    [200, 250],
    [200, 500],
    [250, 500],
  ] as const);
  const base = rng.int(5, 15) * 20;
  const cas = rng.int(0, 3);
  // cas 0 : égalité ; cas 1 : le plus grand volume gagne ; cas 2 et 3 : le plus soluble a la plus petite masse.
  const sPetit = cas === 0 ? base : cas === 1 ? base : base + 20;
  const sGrand = cas === 0 ? base : cas === 1 ? base + 20 : base;
  const a = { s: sPetit, v: petit };
  const b = { s: sGrand, v: grand };
  const [p, q] = rng.int(0, 1) === 0 ? [a, b] : [b, a];
  const bon = p.s === q.s ? 'Les deux autant' : p.s > q.s ? 'Le solide P' : 'Le solide Q';
  const { answer, traps: t } = choice(
    rng,
    bon,
    ['Le solide P', 'Le solide Q', 'Les deux autant']
      .filter((label) => label !== bon)
      .map((label) => ({
        label,
        why: 'Les volumes d’eau sont différents : compare les masses dissoutes pour un même volume (100 mL).',
      })),
  );
  const pour100 = (x: { s: number }) => x.s / 10;
  return {
    prompt: 'Lis les résultats. Lequel des deux solides est le plus soluble dans l’eau ?',
    figure: {
      kind: 'document',
      title: 'Résultats (données de l’exercice, même température)',
      lines: [
        `Solide P : au maximum ${(p.s * p.v) / 1000} g dissous dans ${p.v} mL d’eau.`,
        `Solide Q : au maximum ${(q.s * q.v) / 1000} g dissous dans ${q.v} mL d’eau.`,
      ],
    },
    answer,
    traps: t,
    hint: 'Compare les deux solides pour la même quantité d’eau.',
    steps: [
      `Pour 100 mL d’eau, P : ${pour100(p)} g ; Q : ${pour100(q)} g.`,
      p.s === q.s ? 'Les deux masses sont égales : **les deux autant**.' : `**${bon}** est le plus soluble.`,
    ],
    targetSeconds: 100,
  };
};

export const solubiliteNotion: Skill = {
  id: 'p5-solubilite',
  title: 'Solubilité et miscibilité',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Dans une solution, le **solvant** (souvent l’eau) dissout le **soluté**. Un solide qui se dissout est **soluble** ; sinon il est insoluble.',
      'Quand plus rien ne se dissout, la solution est **saturée**. La **solubilité** est la masse maximale dissoute dans un volume donné, à une température donnée : 36 g dans 100 mL, c’est 360 g/L.',
      'Deux liquides qui forment un mélange homogène sont **miscibles**.',
    ],
    ...references(
      'solubilite-programme',
      'soluble',
      'insoluble',
      'solvant',
      'solute',
      'saturee',
      'solubilite',
      'miscible',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
