import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Parallélogrammes ———

const diagonales = S(
  'm4-diagonales',
  'Parallélogrammes particuliers et diagonales',
  'Reconnaitre un parallélogramme particulier à partir de ses propriétés caractéristiques, notamment à partir des propriétés de ses diagonales (automatisme)',
  [
    'Diagonales de même milieu → **parallélogramme**. En plus de même longueur → **rectangle**. En plus perpendiculaires → **losange**. Les deux → **carré**.',
  ],
  (rng) => {
    const q = rng.pick([
      { d: 'ont le même milieu', a: 'Un parallélogramme' },
      { d: 'ont le même milieu et la même longueur', a: 'Un rectangle' },
      { d: 'ont le même milieu et sont perpendiculaires', a: 'Un losange' },
      { d: 'ont le même milieu, la même longueur et sont perpendiculaires', a: 'Un carré' },
    ]);
    return {
      prompt: `Les diagonales d’un quadrilatère ${q.d}. Quelle est sa nature la plus précise ?`,
      ...choice(
        rng,
        q.a,
        ['Un parallélogramme', 'Un rectangle', 'Un losange', 'Un carré']
          .filter((x) => x !== q.a)
          .map((x) => ({
            label: x,
            why: 'Même milieu → parallélogramme ; + même longueur → rectangle ; + perpendiculaires → losange.',
          })),
      ),
      hint: 'Même milieu → parallélogramme ; même longueur → rectangle ; perpendiculaires → losange.',
      steps: [`Diagonales qui ${q.d}.`, `C’est **${q.a.toLowerCase()}**.`],
      targetSeconds: 20,
    };
  },
);

const proprietesParallelogramme = S(
  'm4-proprietes-parallelogramme',
  'Calculer dans un parallélogramme',
  'Reconnaitre un parallélogramme à l’aide de sa définition ou d’une propriété caractéristique grâce aux codages (automatisme)',
  [
    'Dans un parallélogramme : côtés opposés de même longueur, angles opposés égaux, deux angles consécutifs font **180°**.',
  ],
  (rng) => {
    const a = rng.int(40, 140);
    const ask = rng.pick(['oppose', 'consecutif'] as const);
    const v = ask === 'oppose' ? a : 180 - a;
    return {
      prompt: `ABCD est un parallélogramme et l’angle A mesure ${a}°. Combien mesure l’angle ${ask === 'oppose' ? 'C' : 'B'} ?`,
      answer: num(v, '°'),
      traps: traps(r(v), [
        [
          ask === 'oppose' ? 180 - a : a,
          ask === 'oppose'
            ? 'A et C sont opposés : ils sont égaux.'
            : 'A et B sont consécutifs : ils font 180° ensemble.',
        ],
      ]),
      hint: 'Angles opposés : égaux. Angles consécutifs : 180° ensemble.',
      steps: [
        ask === 'oppose' ? 'A et C sont opposés : égaux.' : 'A et B sont consécutifs : A + B = 180°.',
        `Angle ${ask === 'oppose' ? 'C' : 'B'} = **${v}°**.`,
      ],
      targetSeconds: 20,
    };
  },
);

export const parallelogrammes = C(
  'm4-parallelogrammes',
  'geometrie',
  'Parallélogrammes',
  [diagonales, proprietesParallelogramme],
  bossOf(
    [
      S(
        'm4-boss-para-cerf-volant',
        'Problème : le cerf-volant losange',
        'Reconnaitre un parallélogramme particulier à partir de ses propriétés caractéristiques',
        ['Les diagonales d’un losange se coupent en leur milieu à angle droit : 4 triangles rectangles.'],
        (rng) => {
          const [a, b, c] = rng.pick([
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
          ] as const);
          return {
            prompt: `Un cerf-volant a la forme d’un losange dont les diagonales mesurent ${2 * a} dm et ${2 * b} dm. Quelle est la longueur d’un côté ?`,
            answer: num(c, 'dm'),
            traps: traps(r(c), [[a + b, 'Utilise Pythagore dans un des 4 triangles rectangles.']]),
            hint: 'Les demi-diagonales et un côté forment un triangle rectangle.',
            steps: [
              `Demi-diagonales : ${a} dm et ${b} dm, à angle droit.`,
              `côté^2 = ${a * a} + ${b * b} = ${c * c} : côté = **${c} dm**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-para-cadre',
        'Problème : le cadre bien d’équerre',
        'Construire des rectangles sans équerre',
        ['Un parallélogramme dont les diagonales ont la même longueur est un rectangle.'],
        (rng) => {
          const d1 = rng.int(80, 120);
          const same = rng.int(0, 1) === 1;
          const d2 = same ? d1 : d1 + rng.int(1, 4);
          return {
            prompt: `Un menuisier mesure les diagonales d’un cadre en forme de parallélogramme : ${d1} cm et ${d2} cm. Le cadre est-il rectangle ?`,
            ...choice(
              rng,
              same ? 'Oui' : 'Non',
              [
                {
                  label: same ? 'Non' : 'Oui',
                  why: 'Un parallélogramme est un rectangle exactement quand ses diagonales ont la même longueur.',
                },
              ],
              true,
            ),
            hint: 'Parallélogramme + diagonales de même longueur → ?',
            steps: [
              `Diagonales : ${d1} cm et ${d2} cm, ${same ? 'égales' : 'différentes'}.`,
              `**${same ? 'Oui' : 'Non'}**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-para-piege',
        'Piège : le losange est-il un carré ?',
        'Reconnaitre un parallélogramme particulier à partir de ses propriétés caractéristiques',
        ['Un losange a 4 côtés égaux, mais ses angles ne sont pas forcément droits : ce n’est pas toujours un carré.'],
        (rng) => ({
          prompt: 'Un quadrilatère a 4 côtés de même longueur. Est-ce forcément un carré ?',
          ...choice(rng, 'Non, c’est un losange', [
            { label: 'Oui', why: 'Un losange « penché » a 4 côtés égaux sans angle droit.' },
          ]),
          hint: 'Pense à un losange « penché ».',
          steps: [
            '4 côtés égaux : c’est un losange.',
            'Il faut en plus un angle droit pour un carré : **non, c’est un losange**.',
          ],
          targetSeconds: 20,
        }),
      ),
    ],
  ),
);
