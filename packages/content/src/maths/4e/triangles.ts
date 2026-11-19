import { choice, num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import type { Figure } from '../../types.ts';
import { bossOf } from '../kit.ts';
import { S, C, tenth } from './commun.ts';

const TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [9, 12, 15],
  [7, 24, 25],
  [20, 21, 29],
  [12, 16, 20],
] as const;

/** Triangle rectangle en A (sommets A, B, C), côtés de l'angle droit AB et AC. */
const rightTriangle = (ab: string | null, ac: string | null, bc: string | null): Figure => ({
  kind: 'polygon',
  vertices: [
    { name: 'A', x: 0, y: 0 },
    { name: 'B', x: 6, y: 0 },
    { name: 'C', x: 0, y: 4 },
  ],
  sideLabels: [ab, bc, ac],
  rightAngles: [0],
});

// ——— Triangles : Pythagore, droite des milieux ———

const pythagoreHypotenuse = S(
  'm4-pythagore-hypotenuse',
  'Pythagore : calculer l’hypoténuse',
  'Connaitre le théorème de Pythagore, sa réciproque, sa contraposée',
  [
    'Dans un triangle rectangle : **hypoténuse^2 = côté^2 + côté^2** (l’hypoténuse est le côté en face de l’angle droit, le plus long).',
  ],
  (rng, level) => {
    if (level === 3) {
      const a = rng.int(2, 12);
      const b = rng.int(2, 12);
      const c = Math.sqrt(a * a + b * b);
      if (Number.isInteger(c)) return pythagoreHypotenuse.generate(rng, 2);
      return {
        prompt: `ABC est rectangle en A, AB = ${a} cm et AC = ${b} cm. Calcule BC, arrondi au dixième.`,
        figure: rightTriangle(`${a} cm`, `${b} cm`, '?'),
        answer: { ...num(tenth(c), 'cm'), round: 1 },
        traps: traps(tenth(c), [[r(a + b), 'On additionne les **carrés**, puis on prend la racine carrée.']]),
        hint: 'BC^2 = AB^2 + AC^2, puis la racine carrée.',
        steps: [
          `BC^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}.`,
          `BC = √${a * a + b * b} ≈ **${fmt(tenth(c))} cm**.`,
        ],
        targetSeconds: 50,
      };
    }
    const [a, b, c] = rng.pick(TRIPLES);
    const k = level === 1 ? 1 : rng.int(1, 2);
    return {
      prompt: `ABC est rectangle en A, AB = ${a * k} cm et AC = ${b * k} cm. Calcule BC.`,
      figure: rightTriangle(`${a * k} cm`, `${b * k} cm`, '?'),
      answer: num(c * k, 'cm'),
      traps: traps(r(c * k), [[(a + b) * k, 'On additionne les **carrés**, puis on prend la racine carrée.']]),
      hint: 'BC est l’hypoténuse : BC^2 = AB^2 + AC^2.',
      steps: [
        `BC^2 = ${a * k}^2 + ${b * k}^2 = ${(a * k) ** 2} + ${(b * k) ** 2} = ${(c * k) ** 2}.`,
        `BC = √${(c * k) ** 2} = **${c * k} cm**.`,
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const pythagoreCote = S(
  'm4-pythagore-cote',
  'Pythagore : calculer un côté de l’angle droit',
  'Connaitre le théorème de Pythagore, sa réciproque, sa contraposée',
  ['Si on connaît l’hypoténuse, on **soustrait** : AB^2 = BC^2 − AC^2.'],
  (rng) => {
    const [a, b, c] = rng.pick(TRIPLES);
    return {
      prompt: `ABC est rectangle en A, BC = ${c} cm (l’hypoténuse) et AC = ${b} cm. Calcule AB.`,
      figure: rightTriangle('?', `${b} cm`, `${c} cm`),
      answer: num(a, 'cm'),
      traps: traps(r(a), [
        [r(Math.round(Math.sqrt(b * b + c * c) * 10), 10), 'BC est l’hypoténuse : on **soustrait** les carrés.'],
        [c - b, 'On travaille avec les **carrés** des longueurs.'],
      ]),
      hint: 'AB^2 = BC^2 − AC^2.',
      steps: [`AB^2 = ${c}^2 − ${b}^2 = ${c * c} − ${b * b} = ${a * a}.`, `AB = √${a * a} = **${a} cm**.`],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const reciproque = S(
  'm4-pythagore-reciproque',
  'Le triangle est-il rectangle ?',
  'Connaitre le théorème de Pythagore, sa réciproque, sa contraposée',
  [
    'On compare le carré du plus grand côté à la somme des carrés des deux autres : égal → rectangle (réciproque) ; différent → pas rectangle (contraposée).',
  ],
  (rng) => {
    const [a, b, c] = rng.pick(TRIPLES);
    const right = rng.int(0, 1) === 1;
    const cc = right ? c : c + 1;
    return {
      prompt: `Un triangle a des côtés de ${a} cm, ${b} cm et ${cc} cm. Est-il rectangle ?`,
      ...choice(
        rng,
        right ? 'Oui' : 'Non',
        [{ label: right ? 'Non' : 'Oui', why: `Compare ${cc}^2 = ${cc * cc} et ${a}^2 + ${b}^2 = ${a * a + b * b}.` }],
        true,
      ),
      hint: 'Compare le carré du plus grand côté à la somme des carrés des deux autres.',
      steps: [
        `${cc}^2 = ${cc * cc} et ${a}^2 + ${b}^2 = ${a * a + b * b}.`,
        right
          ? 'Égalité : d’après la réciproque de Pythagore, **oui**, il est rectangle.'
          : 'Pas d’égalité : d’après la contraposée, **non**, il n’est pas rectangle.',
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const droiteMilieux = S(
  'm4-droite-milieux',
  'Droite des milieux',
  'Connaitre les trois théorèmes relatifs à la droite des milieux dans un triangle',
  [
    'Le segment qui joint les **milieux** de deux côtés est **parallèle** au 3e côté et mesure **la moitié** de sa longueur.',
  ],
  (rng, level) => {
    const bc = 2 * rng.int(3, 15);
    const whole = level === 3;
    return {
      prompt: whole
        ? `Dans ABC, I est le milieu de [AB], J celui de [AC], et IJ = ${bc / 2} cm. Combien mesure BC ?`
        : `Dans ABC, I est le milieu de [AB] et J celui de [AC]. BC = ${bc} cm. Combien mesure IJ ?`,
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 2, y: 5 },
          { name: 'B', x: 0, y: 0 },
          { name: 'C', x: 7, y: 0 },
        ],
        sideLabels: [null, whole ? '?' : `${bc} cm`, null],
        extra: [{ from: { x: 1, y: 2.5 }, to: { x: 4.5, y: 2.5 }, label: whole ? `${bc / 2} cm` : 'IJ' }],
      },
      answer: num(whole ? bc : bc / 2, 'cm'),
      traps: traps(r(whole ? bc : bc / 2), [[whole ? bc / 2 : bc, 'IJ mesure **la moitié** de BC.']]),
      hint: 'La droite des milieux mesure la moitié du 3e côté.',
      steps: [
        'IJ joint les milieux de deux côtés : IJ = BC ÷ 2.',
        whole ? `BC = 2 × ${bc / 2} = **${bc} cm**.` : `IJ = ${bc} ÷ 2 = **${bc / 2} cm**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const cercleCirconscrit = S(
  'm4-cercle-circonscrit',
  'Triangle rectangle et cercle circonscrit',
  'Déterminer le centre du cercle circonscrit d’un triangle rectangle',
  [
    'Le cercle circonscrit à un triangle rectangle a pour **diamètre l’hypoténuse** : son centre est le milieu de l’hypoténuse.',
  ],
  (rng) => {
    const [, , c] = rng.pick(TRIPLES);
    return {
      prompt: `ABC est rectangle en A et BC = ${c} cm. Quel est le rayon de son cercle circonscrit ?`,
      answer: num(r(c, 2), 'cm'),
      traps: traps(r(c, 2), [[c, 'BC est le **diamètre** du cercle : le rayon en est la moitié.']]),
      hint: 'L’hypoténuse est un diamètre du cercle circonscrit.',
      steps: ['L’hypoténuse [BC] est un diamètre du cercle circonscrit.', `Rayon = ${c} ÷ 2 = **${fmt(r(c, 2))} cm**.`],
      targetSeconds: 20,
    };
  },
);

export const triangles = C(
  'm4-triangles',
  'geometrie',
  'Pythagore et droite des milieux',
  [pythagoreHypotenuse, pythagoreCote, reciproque, droiteMilieux, cercleCirconscrit],
  bossOf(
    [
      S(
        'm4-boss-triangles-echelle',
        'Problème : l’échelle',
        'Connaitre le théorème de Pythagore, sa réciproque, sa contraposée',
        ['Le mur, le sol et l’échelle forment un triangle rectangle : l’échelle est l’hypoténuse.'],
        (rng) => {
          const [a, b, c] = rng.pick([
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
            [9, 12, 15],
          ] as const);
          const k = rng.pick([r(1, 2), r(1)]);
          const foot = mul(r(a), k);
          const len = mul(r(c), k);
          const hgt = mul(r(b), k);
          return {
            prompt: `Une échelle de ${fmt(len)} m est posée contre un mur vertical. Son pied est à ${fmt(foot)} m du mur. À quelle hauteur touche-t-elle le mur ?`,
            answer: num(hgt, 'm'),
            traps: traps(hgt, [
              [
                r(Math.round(Math.sqrt(toN(len) ** 2 + toN(foot) ** 2) * 10), 10),
                'L’échelle est l’hypoténuse : on **soustrait** les carrés.',
              ],
            ]),
            hint: 'hauteur^2 = échelle^2 − distance au mur^2.',
            steps: [
              `h^2 = ${fmt(len)}^2 − ${fmt(foot)}^2 = ${fmt(mul(len, len))} − ${fmt(mul(foot, foot))} = ${fmt(mul(hgt, hgt))}.`,
              `h = √${fmt(mul(hgt, hgt))} = **${fmt(hgt)} m**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-triangles-ecran',
        'Problème : la diagonale de l’écran',
        'Connaitre le théorème de Pythagore, sa réciproque, sa contraposée',
        ['La diagonale d’un rectangle est l’hypoténuse du triangle rectangle formé avec deux côtés.'],
        (rng) => {
          const [a, b, c] = rng.pick(TRIPLES);
          const k = rng.int(2, 4);
          return {
            prompt: `Un écran rectangulaire mesure ${a * k} cm sur ${b * k} cm. Quelle est la longueur de sa diagonale ?`,
            answer: num(c * k, 'cm'),
            traps: traps(r(c * k), [[(a + b) * k, 'On additionne les carrés, puis racine carrée.']]),
            hint: 'diagonale^2 = longueur^2 + largeur^2.',
            steps: [`d^2 = ${(a * k) ** 2} + ${(b * k) ** 2} = ${(c * k) ** 2}.`, `d = **${c * k} cm**.`],
            targetSeconds: 50,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm4-boss-triangles-piege',
        'Piège : quel est le plus grand côté ?',
        'Mener un travail de logique sur la réciproque et la contraposée',
        ['Pour tester si un triangle est rectangle, le carré à isoler est celui du **plus grand** côté.'],
        (rng) => {
          const [a, b, c] = rng.pick(TRIPLES);
          return {
            prompt: `Un triangle a des côtés ${b} cm, ${c} cm et ${a} cm. Quelle égalité faut-il tester ?`,
            ...choice(rng, `${c}^2 = ${a}^2 + ${b}^2`, [
              { label: `${a}^2 = ${b}^2 + ${c}^2`, why: 'L’hypoténuse est le **plus grand** côté.' },
              { label: `${b}^2 = ${a}^2 + ${c}^2`, why: `${c} est le plus grand côté.` },
            ]),
            hint: 'L’hypoténuse éventuelle est le plus grand côté.',
            steps: [`Le plus grand côté est ${c} cm.`, `On teste **${c}^2 = ${a}^2 + ${b}^2**.`],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

/** Valeur numérique d'un rationnel. */
function toN(x: { n: number; d: number }) {
  return x.n / x.d;
}
