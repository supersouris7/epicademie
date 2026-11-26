import { choice, num, traps } from '../build.ts';
import { add, fmt, r, sub, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesElectricite } from './donnees-electricite.ts';

// ——— Les lois des circuits (4e) ———

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      question: 'Dans un circuit qui ne contient que des dipôles en série, comment est l’intensité du courant ?',
      bon: 'La même en tout point',
      pourquoi:
        'En série, le courant n’a qu’un chemin : il traverse chaque dipôle l’un après l’autre, sans se partager.',
      faux: [
        ['Plus forte près de la pile', 'Le courant ne s’use pas : l’intensité est la même partout dans la boucle.'],
        ['Nulle après la première lampe', 'Dans une boucle fermée, le courant traverse tous les dipôles.'],
      ],
    },
    {
      question: 'Deux lampes sont branchées en dérivation. Comment sont les tensions à leurs bornes ?',
      bon: 'Égales',
      pourquoi:
        'En dérivation, les deux lampes sont reliées aux deux mêmes points : la tension entre ces points est la même.',
      faux: [
        ['Leur somme vaut zéro', 'Les deux lampes sont entre les mêmes points : leurs tensions sont les mêmes.'],
        ['Toujours différentes', 'Entre les mêmes deux points, la tension est la même.'],
      ],
    },
    {
      question: 'Comment appelle-t-on un point d’un circuit où plusieurs conducteurs sont reliés ?',
      bon: 'Un nœud',
      pourquoi: 'Un nœud est un point de rencontre : le courant peut s’y partager entre plusieurs branches.',
      faux: [
        ['Une maille', 'Une maille est un parcours fermé, pas un point.'],
        ['Un dipôle', 'Un dipôle est un composant à deux bornes.'],
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
    hint: 'Imagine le chemin du courant : une seule boucle, ou plusieurs branches reliées.',
    steps: [cas.pourquoi, `Réponse : **${cas.bon}**.`],
    targetSeconds: 30,
  };
};

const LOIS = [
  ['Intensité en série', 'En série, I est la même en tout point de la boucle'],
  ['Additivité des tensions', 'En série, U du générateur = somme des tensions des récepteurs'],
  [
    'Additivité des intensités',
    'À un nœud, la somme des intensités qui arrivent égale la somme de celles qui repartent',
  ],
  ['Unicité des tensions', 'En dérivation, les dipôles ont la même tension'],
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(LOIS).slice(0, 3);
    return {
      prompt: `Associe chaque loi à son énoncé : ${trois
        .map(([a]) => a.toLowerCase())
        .sort()
        .join(', ')}.`,
      answer: association(rng, trois),
      hint: 'Repère les mots « somme », « même » et « nœud ».',
      steps: [
        'Chaque loi porte soit sur les intensités, soit sur les tensions, en série ou en dérivation.',
        `Réponse : **${trois.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const [nom, enonce] = rng.pick(LOIS);
  const { answer, traps: t } = choice(
    rng,
    nom,
    LOIS.filter(([a]) => a !== nom).map(([label, autre]) => ({ label, why: `Cette loi dit : ${autre}.` })),
  );
  return {
    prompt: `Quelle loi correspond à cet énoncé : « ${enonce} » ?`,
    answer,
    traps: t,
    hint: 'Demande-toi quelle grandeur est concernée, puis comment les dipôles sont montés.',
    steps: [
      'On repère la grandeur citée (intensité ou tension), puis le montage (série, dérivation ou nœud).',
      `Réponse : **${nom}**.`,
    ],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 3);
  const a = rng.int(2, 9);
  const b = a + rng.int(1, 8);
  if (cas === 0) {
    return {
      prompt: `Une pile de ${a + b} V alimente deux lampes en série. La tension aux bornes de la première vaut ${a} V. Quelle est la tension aux bornes de la seconde, en V ?`,
      answer: num(b, 'V'),
      traps: traps(r(b), [
        [a + b, 'La tension de la pile se partage entre les deux lampes en série.'],
        [a + b + a, 'On soustrait la tension connue de celle de la pile.'],
        [a, 'Les deux lampes en série n’ont pas forcément la même tension.'],
      ]),
      hint: 'Écris la relation entre la tension de la pile et celles des deux lampes en série.',
      steps: ['En série : U pile = U1 + U2.', `U2 = ${a + b} − ${a} = **${b} V**.`],
      targetSeconds: 60,
    };
  }
  if (cas === 1) {
    return {
      prompt: `Deux moteurs sont en dérivation. Le courant du générateur se sépare en ${a} A dans le premier et ${b} A dans le second. Quelle est l’intensité dans la branche principale, en A ?`,
      answer: num(a + b, 'A'),
      traps: traps(r(a + b), [
        [b - a, 'À un nœud, les intensités des branches s’additionnent.'],
        [b, 'La branche principale alimente les deux branches.'],
      ]),
      hint: 'Au nœud, compare ce qui arrive et ce qui repart.',
      steps: ['Loi des nœuds : I = I1 + I2.', `I = ${a} + ${b} = **${a + b} A**.`],
      targetSeconds: 60,
    };
  }
  if (cas === 2) {
    const i = rng.int(11, 80) * 10;
    return {
      prompt: `Une pile, une lampe et un moteur sont en série. L’intensité vaut ${i} mA dans la lampe. Quelle est l’intensité dans le moteur, en mA ?`,
      answer: num(i, 'mA'),
      traps: traps(r(i), [
        [r(i, 2), 'En série, le courant n’est pas partagé : il traverse chaque dipôle.'],
        [i * 2, 'L’intensité ne s’additionne pas en série.'],
        [0, 'Le circuit est fermé : un courant traverse le moteur.'],
      ]),
      hint: 'Y a-t-il un nœud entre la lampe et le moteur ?',
      steps: ['En série, l’intensité est la même en tout point.', `Le moteur est traversé par **${i} mA**.`],
      targetSeconds: 45,
    };
  }
  return {
    prompt: `Une lampe et une résistance sont en dérivation aux bornes d’une pile. La tension aux bornes de la lampe vaut ${a} V. Quelle est la tension aux bornes de la résistance, en V ?`,
    answer: num(a, 'V'),
    traps: traps(r(a), [
      [r(a, 2), 'En dérivation, la tension n’est pas partagée.'],
      [a * 2, 'Les tensions en dérivation sont égales : on ne les additionne pas.'],
      [0, 'La résistance est entre les mêmes points que la lampe : sa tension n’est pas nulle.'],
    ]),
    hint: 'Les deux dipôles sont-ils reliés aux mêmes points ?',
    steps: ['Unicité des tensions en dérivation.', `La résistance a aussi **${a} V**.`],
    targetSeconds: 45,
  };
};

/** Entier de milliampères écrit en ampères. */
const enA = (ma: number) => fmt(r(ma, 1000));

const niveau4 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 2);
  if (cas === 0) {
    const u1 = r(rng.int(11, 45), 10);
    const u2 = r(rng.int(11, 45), 10);
    const u3 = r(rng.int(11, 45), 10);
    const total = add(add(u1, u2), u3);
    return {
      prompt: `Trois dipôles A, B et C sont en série avec une pile de ${fmt(total)} V. On mesure ${fmt(u1)} V aux bornes de A et ${fmt(u3)} V aux bornes de C. Quelle est la tension aux bornes de B, en V ?`,
      answer: num(u2, 'V'),
      traps: traps(u2, [
        [sub(total, u1), 'Il faut retirer aussi la tension aux bornes de C.'],
        [add(u1, u3), 'C’est la somme des deux tensions connues : retire-la de celle de la pile.'],
        [total, 'La tension de la pile se partage entre les trois dipôles.'],
      ]),
      hint: 'La loi d’additivité porte sur tous les récepteurs de la maille.',
      steps: [
        'Une seule maille : U pile = UA + UB + UC.',
        `UB = ${fmt(total)} − ${fmt(u1)} − ${fmt(u3)} = **${fmt(u2)} V**.`,
      ],
      targetSeconds: 80,
    };
  }
  if (cas === 1) {
    const i1 = rng.int(11, 60) * 10;
    const i2 = rng.int(11, 60) * 10;
    const total = i1 + i2;
    return {
      prompt: `À un nœud arrive un courant de ${enA(total)} A qui repart dans deux branches. La première est traversée par ${i1} mA. Quelle est l’intensité dans la seconde, en mA ?`,
      answer: num(i2, 'mA'),
      traps: traps(r(i2), [
        [total + i1, 'L’intensité qui arrive est la somme des deux branches : on soustrait.'],
        [total, 'Tout le courant ne passe pas dans la seconde branche.'],
        [r(i1 * 1000 - total, 1000), 'Convertis d’abord les ampères en milliampères.'],
      ]),
      hint: 'Même unité pour les deux intensités, puis loi des nœuds.',
      steps: [
        `${enA(total)} A = ${total} mA.`,
        'Loi des nœuds : I = I1 + I2.',
        `I2 = ${total} − ${i1} = **${i2} mA**.`,
      ],
      targetSeconds: 90,
    };
  }
  const i = [rng.int(11, 40) * 10, rng.int(41, 70) * 10, rng.int(71, 99) * 10] as const;
  const somme = i[0] + i[1] + i[2];
  return {
    prompt: `Trois lampes sont en dérivation. Les branches sont traversées par ${i[0]} mA, ${i[1]} mA et ${i[2]} mA. Quelle est l’intensité fournie par le générateur, en A ?`,
    answer: num(r(somme, 1000), 'A'),
    traps: traps(r(somme, 1000), [
      [somme, 'La réponse est demandée en ampères : divise par 1 000.'],
      [r(i[2], 1000), 'Le générateur alimente les trois branches, pas seulement la plus intense.'],
      [r(somme, 100), '1 A = 1 000 mA.'],
    ]),
    hint: 'Les branches se rejoignent : réunis les courants, puis change d’unité.',
    steps: [
      'Loi d’additivité des intensités : le générateur fournit la somme des intensités des branches.',
      `${i[0]} + ${i[1]} + ${i[2]} = ${somme} mA.`,
      `${somme} mA = **${enA(somme)} A**.`,
    ],
    targetSeconds: 90,
  };
};

export interface Mixte {
  /** Tensions en volts, intensités en milliampères. */
  readonly pile: number;
  readonly lampe: number;
  readonly total: number;
  readonly brancheA: number;
}

const tirerMixte = (rng: Rng): Mixte => {
  const lampe = rng.int(2, 6);
  const brancheA = rng.int(11, 40) * 10;
  return { lampe, pile: lampe + rng.int(2, 8), brancheA, total: brancheA + rng.int(11, 40) * 10 };
};

const lignesMixte = (m: Mixte) => [
  `La pile fournit ${m.pile} V.`,
  'La lampe L est en série avec la pile ; après elle, le circuit se sépare en deux branches en dérivation, A et B, qui se rejoignent avant de revenir à la pile.',
  `Voltmètre aux bornes de la lampe L : ${m.lampe} V.`,
  `Ampèremètre placé en série avec la lampe L : ${enA(m.total)} A.`,
  `Ampèremètre placé dans la branche A : ${m.brancheA} mA.`,
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const m = tirerMixte(rng);
  const figure = { kind: 'document' as const, title: 'Montage (situation inventée)', lines: lignesMixte(m) };
  if (rng.int(0, 1) === 0) {
    const u: Rational = r(m.pile - m.lampe);
    return {
      prompt:
        'Lis le document. Quelle est la tension aux bornes du dipôle de la branche B, en V ? Chaque branche contient un seul dipôle.',
      figure,
      answer: num(u, 'V'),
      traps: traps(u, [
        [m.pile, 'La lampe L prend une partie de la tension de la pile.'],
        [m.lampe, 'La tension de la lampe L n’est pas celle de la branche B.'],
        [m.pile + m.lampe, 'Dans la maille, on retire la tension de la lampe à celle de la pile.'],
      ]),
      hint: 'Suis une maille passant par la pile, la lampe L et la branche B.',
      steps: ['Maille pile, lampe L, branche B : U pile = UL + UB.', `UB = ${m.pile} − ${m.lampe} = **${fmt(u)} V**.`],
      targetSeconds: 120,
    };
  }
  const ib = m.total - m.brancheA;
  return {
    prompt: 'Lis le document. Quelle est l’intensité du courant dans la branche B, en mA ?',
    figure,
    answer: num(ib, 'mA'),
    traps: traps(r(ib), [
      [m.total, 'Le courant de la lampe L se partage entre les branches A et B.'],
      [m.total + m.brancheA, 'À un nœud, l’intensité qui arrive est la somme des branches : on soustrait.'],
      [m.brancheA, 'Les branches A et B ne sont pas forcément parcourues par la même intensité.'],
    ]),
    hint: 'La lampe L est avant le nœud : son intensité est celle qui arrive.',
    steps: [
      `${enA(m.total)} A = ${m.total} mA : c’est l’intensité qui arrive au nœud.`,
      'Loi des nœuds : I = IA + IB.',
      `IB = ${m.total} − ${m.brancheA} = **${ib} mA**.`,
    ],
    targetSeconds: 120,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const loisCircuits: Skill = {
  id: 'p4-lois-circuits',
  title: 'Les lois des circuits',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      '**En série** (une seule **maille**) : l’intensité est la même partout et la tension du générateur est la somme des tensions des récepteurs (**loi d’additivité des tensions**). Exemple : 9 V = 4 V + 5 V.',
      '**En dérivation** : les dipôles ont la même tension (**unicité des tensions**) et, à un **nœud**, l’intensité qui arrive est la somme de celles qui repartent (**loi d’additivité des intensités**). Exemple : 300 mA = 100 mA + 200 mA.',
    ],
    ...referencesElectricite(
      'exploiter',
      'dipoles',
      'serie-programme',
      'additivite-tensions',
      'additivite-intensites',
      'unicite-programme',
      'noeud',
      'maille',
      'lois-seconde',
      'loi-noeuds',
      'loi-mailles',
      'unicite',
      'ordre-dipoles',
      'milli',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
