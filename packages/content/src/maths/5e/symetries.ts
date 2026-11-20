import { num, objective, traps, trueFalse } from '../../build.ts';
import { dec, fmt, mul, r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Symétries ───────────────────────── */

const symetrieAxiale: Skill = {
  id: 'm5-symetrie-axiale',
  title: 'Symétrie axiale sur quadrillage',
  lesson: {
    memo: [
      'La symétrie axiale, c’est un **pliage** le long de la droite : A′ est l’endroit où A se poserait en pliant la feuille.',
      'Compte les carreaux de A jusqu’à l’axe (en allant tout droit vers lui), puis le même nombre de l’autre côté.',
    ],
    source:
      objective(
        'Reconnaitre et construire le symétrique d’une figure par symétrie axiale, dont l’axe est vertical, horizontal, ou en diagonale sur quadrillage',
      ) + ' (automatisme)',
  },
  generate(rng, level) {
    const lim = 6;
    const kind = level === 1 ? 'v' : level === 2 ? rng.pick(['v', 'h'] as const) : 'd';
    const c = rng.int(-1, 1);
    let x = rng.int(-lim + 1, lim - 1);
    let y = rng.int(-lim + 1, lim - 1);
    if (kind === 'v' && x === c) x = c - rng.int(1, 3);
    if (kind === 'h' && y === c) y = c + rng.int(1, 3);
    if (kind === 'd' && x === y) x = y - rng.int(1, 3);
    const image = axialImage(kind, c, { x, y });
    const axis = axisSegment(kind, c, lim);
    const inRange = Math.abs(image.x) <= lim && Math.abs(image.y) <= lim;
    if (!inRange) return symetrieAxiale.generate(rng, level);
    return {
      prompt: 'Touche le quadrillage pour placer A′, le symétrique de A par rapport à la droite rouge.',
      figure: {
        kind: 'grid',
        xMin: -lim,
        xMax: lim,
        yMin: -lim,
        yMax: lim,
        axes: false,
        points: [{ name: 'A', x, y, color: 'accent' }],
        axis,
        pick: true,
      },
      answer: { kind: 'point', ...image },
      traps: [
        {
          point: { x: -x, y: -y },
          why: 'Ça, c’est une symétrie centrale (demi-tour). Ici on « plie » le long de la droite.',
        },
        ...(kind === 'v'
          ? [{ point: { x, y: 2 * c - y }, why: 'L’axe est vertical : A′ reste sur la même ligne horizontale que A.' }]
          : []),
      ].filter((t) => !(t.point.x === image.x && t.point.y === image.y)),
      ...axialExplanation(kind, c, { x, y }),
    };
  },
};

/** Axe de symétrie sur quadrillage : vertical (x = c), horizontal (y = c) ou diagonale y = x. */
type AxisKind = 'v' | 'h' | 'd';
type Node = { readonly x: number; readonly y: number };

/** Symétrique d'un nœud par rapport à l'axe. */
function axialImage(kind: AxisKind, c: number, { x, y }: Node): Node {
  if (kind === 'v') return { x: 2 * c - x, y };
  if (kind === 'h') return { x, y: 2 * c - y };
  return { x: y, y: x };
}

/** Segment tracé pour l'axe, d'un bord à l'autre du quadrillage [−lim, lim]. */
function axisSegment(kind: AxisKind, c: number, lim: number) {
  if (kind === 'v') return { x1: c, y1: -lim, x2: c, y2: lim };
  if (kind === 'h') return { x1: -lim, y1: c, x2: lim, y2: c };
  return { x1: -lim, y1: -lim, x2: lim, y2: lim };
}

/** Indice et étapes : compter les carreaux jusqu'à l'axe (ou plier le long de la diagonale). */
function axialExplanation(kind: AxisKind, c: number, a: Node) {
  if (kind === 'd') {
    return {
      hint: 'Imagine qu’on plie la feuille le long de la diagonale rouge : où A se pose-t-il ? (Va vers l’axe en suivant les diagonales des carreaux.)',
      steps: [
        'On imagine qu’on plie la feuille le long de la droite rouge (la diagonale).',
        'Pour aller de A à l’axe, on avance en diagonale, perpendiculairement à lui, et on continue d’autant de l’autre côté.',
        'A′ est **le nœud entouré en vert** : en pliant, A tombe pile dessus.',
      ],
    };
  }
  const way = kind === 'v' ? 'à l’horizontale' : 'à la verticale';
  const squares = Math.abs((kind === 'v' ? a.x : a.y) - c);
  return {
    hint: `Compte les carreaux de A jusqu’à l’axe, en allant tout droit ${way}, puis le même nombre de l’autre côté.`,
    steps: [
      'On imagine qu’on plie la feuille le long de la droite rouge.',
      `De A jusqu’à l’axe, on compte ${squares} carreau${squares > 1 ? 'x' : ''}, en allant tout droit ${way}.`,
      `On en compte autant de l’autre côté, sur la même ${kind === 'v' ? 'ligne' : 'colonne'} : A′ est **le nœud entouré en vert**.`,
    ],
  };
}

const symetrieCentrale: Skill = {
  id: 'm5-symetrie-centrale',
  title: 'Symétrie centrale (demi-tour)',
  lesson: {
    memo: [
      'La symétrie centrale, c’est un **demi-tour** autour du point O, comme une aiguille qui tourne.',
      'Sur quadrillage : compte le trajet de A jusqu’à O (par exemple 2 à droite, 3 en haut), puis **refais exactement le même trajet** à partir de O.',
    ],
    source: objective('Définir le demi-tour, ou symétrie centrale'),
  },
  generate(rng) {
    const lim = 6;
    const ox = rng.int(-2, 2);
    const oy = rng.int(-2, 2);
    let dx = 0;
    let dy = 0;
    while (
      (dx === 0 && dy === 0) ||
      Math.abs(ox + dx) > lim ||
      Math.abs(oy + dy) > lim ||
      Math.abs(ox - dx) > lim ||
      Math.abs(oy - dy) > lim
    ) {
      dx = rng.int(-4, 4);
      dy = rng.int(-4, 4);
    }
    const A = { x: ox - dx, y: oy - dy };
    const image = { x: ox + dx, y: oy + dy };
    return {
      prompt: 'Touche le quadrillage pour placer A′, le symétrique de A par rapport au point O.',
      figure: {
        kind: 'grid',
        xMin: -lim,
        xMax: lim,
        yMin: -lim,
        yMax: lim,
        axes: false,
        points: [
          { name: 'A', ...A, color: 'accent' },
          { name: 'O', x: ox, y: oy, color: 'muted' },
        ],
        pick: true,
      },
      answer: { kind: 'point', ...image },
      traps: [
        {
          point: { x: 2 * ox - A.x, y: A.y },
          why: 'Ça ressemble à une symétrie axiale. En symétrie centrale, O doit être le **milieu** de [AA′].',
        },
        {
          point: { x: A.x, y: 2 * oy - A.y },
          why: 'Ça ressemble à une symétrie axiale. En symétrie centrale, O doit être le **milieu** de [AA′].',
        },
        {
          point: {
            x: ox + Math.sign(dx) * Math.ceil(Math.abs(dx) / 2),
            y: oy + Math.sign(dy) * Math.ceil(Math.abs(dy) / 2),
          },
          why: 'Trop près : A′ doit être aussi loin de O que A.',
        },
      ].filter((t) => !(t.point.x === image.x && t.point.y === image.y)),
      hint: 'Compte le trajet de A jusqu’à O (à l’horizontale puis à la verticale), et refais le même trajet à partir de O.',
      steps: [
        `On compte le trajet de A jusqu’à O : ${Math.abs(dx)} carreau${Math.abs(dx) > 1 ? 'x' : ''} ${dx >= 0 ? 'vers la droite' : 'vers la gauche'}, ${Math.abs(dy)} ${dy >= 0 ? 'vers le haut' : 'vers le bas'}.`,
        `On refait exactement le même trajet à partir de O : ${Math.abs(dx)} ${dx >= 0 ? 'vers la droite' : 'vers la gauche'}, ${Math.abs(dy)} ${dy >= 0 ? 'vers le haut' : 'vers le bas'}.`,
        'On arrive sur A′, **le nœud entouré en vert**. O est pile au milieu de A et A′.',
      ],
    };
  },
};

const proprietesSymetrie: Skill = {
  id: 'm5-symetrie-proprietes',
  title: 'Propriétés de la symétrie centrale',
  lesson: {
    memo: [
      'Un demi-tour, c’est comme faire tourner un dessin sur la table : il ne se déforme pas.',
      'Donc les longueurs, les angles et les aires **restent les mêmes**. Une droite devient une droite **parallèle** (elle est juste retournée).',
    ],
    source: objective('Connaitre les propriétés du demi-tour'),
  },
  generate(rng, level) {
    if (level === 1) {
      const l = dec(rng.int(15, 95), 1);
      return {
        prompt: `[AB] mesure ${fmt(l)} cm. [A′B′] est son symétrique par rapport à un point O. Combien mesure [A′B′] (en cm) ?`,
        answer: num(l, 'cm'),
        traps: traps(l, [[mul(l, r(2)), 'La symétrie centrale conserve les longueurs : on ne double pas.']]),
        hint: 'Quand on fait tourner un dessin d’un demi-tour, est-ce qu’il s’agrandit ?',
        steps: [
          `Le symétrique, c’est le segment après un demi-tour : on le fait tourner, sans l’étirer.`,
          `Un demi-tour ne change pas les longueurs.`,
          `Donc A′B′ = AB = **${fmt(l)}** cm.`,
        ],
        targetSeconds: 10,
      };
    }
    const statements = [
      { t: 'Une symétrie centrale conserve les longueurs.', v: true, why: 'Un demi-tour ne déforme pas la figure.' },
      {
        t: 'Une symétrie centrale conserve les mesures des angles.',
        v: true,
        why: 'Un demi-tour ne déforme pas la figure.',
      },
      {
        t: 'L’image d’une droite par une symétrie centrale est une droite parallèle.',
        v: true,
        why: 'Un demi-tour « retourne » la droite sans changer sa direction.',
      },
      {
        t: 'Le centre de symétrie est le milieu du segment [MM′].',
        v: true,
        why: 'C’est la définition du symétrique par rapport à un point.',
      },
      {
        t: 'L’image d’une droite par une symétrie centrale lui est perpendiculaire.',
        v: false,
        why: 'Elle lui est parallèle (ou confondue si elle passe par le centre).',
      },
      { t: 'Une symétrie centrale double les aires.', v: false, why: 'Elle conserve les aires.' },
      {
        t: 'Un point et son symétrique sont à des distances différentes du centre.',
        v: false,
        why: 'Le centre est le milieu de [MM′] : les distances sont égales.',
      },
    ];
    const s = rng.pick(statements);
    return {
      prompt: `Vrai ou faux : ${s.t}`,
      ...trueFalse(s.v, s.why),
      hint: 'Imagine un dessin qu’on fait tourner d’un demi-tour sur la table : qu’est-ce qui change, qu’est-ce qui reste pareil ?',
      steps: [
        'On imagine un dessin qu’on fait tourner d’un demi-tour : il ne se déforme pas, il est juste retourné.',
        s.why,
        `Donc c’est **${s.v ? 'vrai' : 'faux'}**.`,
      ],
    };
  },
};

export const symetries: Chapter = {
  id: 'm5-symetries',
  subject: 'maths',
  grade: '5e',
  domain: 'geometrie',
  title: 'Symétries',
  skills: [symetrieAxiale, symetrieCentrale, proprietesSymetrie],
};
