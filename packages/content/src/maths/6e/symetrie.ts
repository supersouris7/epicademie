import { choice, num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Symétrie axiale ———

const symetriquePoint = S(
  'm6-symetrique-point',
  'Construire le symétrique d’un point',
  'Connaître la définition du symétrique d’un point par rapport à une droite',
  [
    'A′ est le symétrique de A par rapport à la droite d : la droite d est la **médiatrice** de [AA′].',
    'Sur un quadrillage : compte les carreaux de A jusqu’à la droite, puis autant de l’autre côté.',
  ],
  (rng, level) => {
    const lim = 5;
    const vertical = level === 1 || rng.int(0, 1) === 1;
    const c = rng.int(-1, 1);
    let x = rng.int(-lim + 1, lim - 1);
    let y = rng.int(-lim + 1, lim - 1);
    if (vertical && x === c) x = c - rng.int(1, 3);
    if (!vertical && y === c) y = c + rng.int(1, 3);
    const image = vertical ? { x: 2 * c - x, y } : { x, y: 2 * c - y };
    if (Math.abs(image.x) > lim || Math.abs(image.y) > lim) return symetriquePoint.generate(rng, level);
    const dist = Math.abs((vertical ? x : y) - c);
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
        axis: vertical ? { x1: c, y1: -lim, x2: c, y2: lim } : { x1: -lim, y1: c, x2: lim, y2: c },
        pick: true,
      },
      answer: { kind: 'point', ...image },
      traps: [{ point: { x: -x, y: -y }, why: 'Ça, c’est un demi-tour. Ici, on plie le long de la droite.' }].filter(
        (t) => !(t.point.x === image.x && t.point.y === image.y),
      ),
      hint: `Compte les carreaux de A jusqu’à la droite, puis le même nombre de l’autre côté.`,
      steps: [
        `A est à ${dist} carreau${dist > 1 ? 'x' : ''} de la droite.`,
        `A′ est à ${dist} carreau${dist > 1 ? 'x' : ''} de l’autre côté : **le nœud entouré en vert**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const axesSymetrie = S(
  'm6-axes-symetrie',
  'Axes de symétrie des figures',
  'Il reconnaît si une figure possède un ou plusieurs axes de symétrie (automatisme)',
  [
    'Un **axe de symétrie** partage la figure en deux moitiés qui se superposent par pliage.',
    'Carré : 4 axes ; rectangle : 2 ; losange : 2 ; triangle équilatéral : 3 ; triangle isocèle : 1 ; cercle : une infinité.',
  ],
  (rng) => {
    const f = rng.pick([
      { n: 'un carré', a: '4' },
      { n: 'un rectangle (non carré)', a: '2' },
      { n: 'un losange (non carré)', a: '2' },
      { n: 'un triangle équilatéral', a: '3' },
      { n: 'un triangle isocèle (non équilatéral)', a: '1' },
      { n: 'un cercle', a: 'Une infinité' },
    ]);
    return {
      prompt: `Combien d’axes de symétrie a ${f.n} ?`,
      ...choice(
        rng,
        f.a,
        ['1', '2', '3', '4', 'Une infinité']
          .filter((x) => x !== f.a)
          .slice(0, 3)
          .map((x) => ({ label: x, why: 'Imagine les pliages qui superposent les deux moitiés.' })),
      ),
      hint: 'Imagine tous les pliages qui font se superposer les deux moitiés.',
      steps: [
        'On cherche toutes les droites de pliage qui superposent les deux moitiés.',
        `${f.n.charAt(0).toUpperCase() + f.n.slice(1)} : **${f.a}** axe${f.a === '1' ? '' : 's'}.`,
      ],
      targetSeconds: 15,
    };
  },
);

const proprietesSymetrie = S(
  'm6-proprietes-symetrie',
  'Ce que conserve la symétrie',
  'Connaître et utiliser les propriétés de la symétrie axiale pour effectuer des constructions',
  [
    'La symétrie axiale **conserve** les longueurs, les angles, les aires : la figure symétrique est la même, retournée.',
  ],
  (rng) => {
    const q = rng.pick([
      () => {
        const l = rng.int(3, 12);
        return {
          p: `[AB] mesure ${l} cm. Combien mesure son symétrique [A′B′] ?`,
          a: num(l, 'cm'),
          v: r(l),
          why: 'La symétrie conserve les longueurs.',
        };
      },
      () => {
        const a = rng.int(20, 160);
        return {
          p: `Un angle mesure ${a}°. Combien mesure son symétrique ?`,
          a: num(a, '°'),
          v: r(a),
          why: 'La symétrie conserve les angles.',
        };
      },
      () => {
        const a = rng.int(5, 40);
        return {
          p: `Une figure a une aire de ${a} cm^2. Quelle est l’aire de sa symétrique ?`,
          a: num(a, 'cm^2'),
          v: r(a),
          why: 'La symétrie conserve les aires.',
        };
      },
    ])();
    return {
      prompt: q.p,
      answer: q.a,
      traps: traps(q.v, [[mul(q.v, r(2)), q.why]]),
      hint: 'Que se passe-t-il quand on plie une feuille : la figure change-t-elle de taille ?',
      steps: [q.why, `Même mesure : **${fmt(q.v)}**.`],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

export const symetrie = C(
  'm6-symetrie',
  'geometrie',
  'Symétrie axiale',
  [symetriquePoint, axesSymetrie, proprietesSymetrie],
  bossOf(
    [
      S(
        'm6-boss-symetrie-papillon',
        'Problème : le papillon',
        'Connaître et utiliser les propriétés de la symétrie axiale pour effectuer des constructions',
        ['Une figure symétrique : chaque moitié est l’image de l’autre, avec les mêmes longueurs.'],
        (rng) => {
          const half = rng.int(4, 15);
          return {
            prompt: `Les deux ailes d’un papillon sont symétriques par rapport à son corps. Une aile a un tour de ${half} cm. Quelle est la longueur du tour des deux ailes réunies ?`,
            answer: num(2 * half, 'cm'),
            traps: traps(r(2 * half), [[half, 'Il y a deux ailes, de même tour.']]),
            hint: 'Les deux ailes sont superposables : même longueur.',
            steps: [
              `Chaque aile a un tour de ${half} cm (la symétrie conserve les longueurs).`,
              `Deux ailes : **${2 * half} cm**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm6-boss-symetrie-miroir',
        'Problème : le miroir',
        'Connaître la définition du symétrique d’un point par rapport à une droite',
        ['Dans un miroir, ton image est aussi loin derrière le miroir que toi devant.'],
        (rng) => {
          const d = rng.int(2, 9) * 10;
          return {
            prompt: `${rng.pick(NAMES)} est à ${d} cm d’un miroir. Quelle distance sépare ${rng.pick(['le joueur', 'l’enfant'])} de son image ?`,
            answer: num(2 * d, 'cm'),
            traps: traps(r(2 * d), [
              [d, 'L’image est aussi loin derrière le miroir : il faut compter les deux côtés.'],
            ]),
            hint: 'L’image est le symétrique par rapport au miroir.',
            steps: [`L’image est à ${d} cm derrière le miroir.`, `${d} + ${d} = **${2 * d} cm**.`],
            targetSeconds: 25,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-symetrie-piege',
        'Piège : le rectangle et ses diagonales',
        'Il reconnaît si une figure possède un ou plusieurs axes de symétrie (automatisme)',
        [
          'Les diagonales d’un rectangle (non carré) **ne sont pas** des axes de symétrie : en pliant, les coins ne se superposent pas.',
        ],
        (rng) => ({
          prompt: 'Une diagonale d’un rectangle (qui n’est pas un carré) est-elle un axe de symétrie ?',
          ...choice(
            rng,
            'Non',
            [{ label: 'Oui', why: 'Plie un rectangle le long d’une diagonale : les coins ne se superposent pas.' }],
            true,
          ),
          hint: 'Imagine le pliage d’une feuille A4 le long de sa diagonale.',
          steps: [
            'En pliant le long de la diagonale, les deux moitiés ne se superposent pas.',
            '**Non** : un rectangle a seulement 2 axes (les médiatrices de ses côtés).',
          ],
          targetSeconds: 20,
        }),
      ),
    ],
  ),
);
