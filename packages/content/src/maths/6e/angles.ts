import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Angles et triangles ———

const natureAngle = S(
  'm6-nature-angle',
  'Angles : aigu, droit, obtus, plat',
  'Connaître et utiliser les angles ainsi que le lexique et les notations qui s’y rapportent',
  ['Angle **aigu** : moins de 90°. **Droit** : 90°. **Obtus** : entre 90° et 180°. **Plat** : 180°.'],
  (rng) => {
    const kind = rng.pick(['aigu', 'droit', 'obtus', 'plat'] as const);
    const deg = kind === 'aigu' ? rng.int(10, 85) : kind === 'droit' ? 90 : kind === 'obtus' ? rng.int(95, 175) : 180;
    const labels = { aigu: 'Aigu', droit: 'Droit', obtus: 'Obtus', plat: 'Plat' };
    return {
      prompt: `Un angle mesure ${deg}°. Comment s’appelle-t-il ?`,
      ...choice(
        rng,
        labels[kind],
        (Object.keys(labels) as (keyof typeof labels)[])
          .filter((k) => k !== kind)
          .map((k) => ({ label: labels[k], why: 'Aigu < 90° ; droit = 90° ; obtus entre 90° et 180° ; plat = 180°.' })),
        true,
      ),
      hint: 'Compare la mesure à 90° et à 180°.',
      steps: [
        `${deg}° ${deg < 90 ? '< 90°' : deg === 90 ? '= 90°' : deg < 180 ? 'est entre 90° et 180°' : '= 180°'}.`,
        `C’est un angle **${labels[kind].toLowerCase()}**.`,
      ],
      targetSeconds: 10,
    };
  },
  { mental: true },
);

const sommeAngles = S(
  'm6-somme-angles',
  'Somme des angles d’un triangle',
  'Connaître la valeur de la somme des mesures des angles d’un triangle',
  ['Dans **tout** triangle, la somme des trois angles vaut **180°**.'],
  (rng) => {
    const a = rng.int(20, 100);
    const b = rng.int(20, 160 - a - 1);
    const c = 180 - a - b;
    return {
      prompt: `Dans le triangle ABC, l’angle A mesure ${a}° et l’angle B mesure ${b}°. Combien mesure l’angle C ?`,
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: 6, y: 0 },
          { name: 'C', x: 2.5, y: 3.5 },
        ],
        angleLabels: [`${a}°`, `${b}°`, '?'],
      },
      answer: num(c, '°'),
      traps: traps(r(c), [[360 - a - b, 'La somme des angles d’un triangle vaut 180°, pas 360°.']]),
      hint: 'La somme des trois angles vaut 180°.',
      steps: [`${a} + ${b} = ${a + b}.`, `C = 180 − ${a + b} = **${c}°**.`],
      targetSeconds: 20,
    };
  },
);

const trianglesParticuliers = S(
  'm6-triangles-particuliers',
  'Angles des triangles particuliers',
  'Connaître et utiliser les propriétés angulaires des triangles particuliers : triangle rectangle, triangle isocèle, triangle équilatéral',
  [
    'Triangle **équilatéral** : 3 angles de 60°. Triangle **isocèle** : les 2 angles à la base sont égaux.',
    'Triangle **rectangle** : un angle droit, les deux autres font 90° ensemble.',
  ],
  (rng, level) => {
    const kind = level === 1 ? 'rect' : level === 2 ? 'iso-base' : rng.pick(['iso-sommet', 'equi'] as const);
    if (kind === 'rect') {
      const a = rng.int(15, 75);
      return {
        prompt: `Un triangle rectangle a un angle de ${a}°. Combien mesure le troisième angle ?`,
        answer: num(90 - a, '°'),
        traps: traps(r(90 - a), [[180 - a, 'N’oublie pas l’angle droit (90°).']]),
        hint: 'Un angle fait 90°. Les trois font 180°.',
        steps: [`180 − 90 − ${a}.`, `= **${90 - a}°**.`],
        targetSeconds: 15,
      };
    }
    if (kind === 'iso-base') {
      const top = 2 * rng.int(10, 70);
      const base = (180 - top) / 2;
      return {
        prompt: `ABC est isocèle en A et l’angle A mesure ${top}°. Combien mesure l’angle B ?`,
        answer: num(base, '°'),
        traps: traps(r(base), [[180 - top, 'Les angles B et C sont égaux : partage ce qui reste en deux.']]),
        hint: 'B et C sont égaux et A + B + C = 180°.',
        steps: [`B + C = 180 − ${top} = ${180 - top}°.`, `B = ${180 - top} ÷ 2 = **${base}°**.`],
        targetSeconds: 25,
      };
    }
    if (kind === 'equi') {
      return {
        prompt: 'Combien mesure chaque angle d’un triangle équilatéral ?',
        answer: num(60, '°'),
        traps: traps(r(60), [[90, 'Les 3 angles sont égaux et font 180° en tout.']]),
        hint: '3 angles égaux, 180° en tout.',
        steps: ['Les 3 angles sont égaux.', '180 ÷ 3 = **60°**.'],
        targetSeconds: 10,
      };
    }
    const base = rng.int(20, 80);
    return {
      prompt: `ABC est isocèle en A et l’angle B mesure ${base}°. Combien mesure l’angle A ?`,
      answer: num(180 - 2 * base, '°'),
      traps: traps(r(180 - 2 * base), [[180 - base, `B et C sont égaux : il faut enlever deux fois ${base}°.`]]),
      hint: 'Isocèle en A : B et C sont égaux.',
      steps: [`C = B = ${base}°.`, `A = 180 − 2 × ${base} = **${180 - 2 * base}°**.`],
      targetSeconds: 25,
    };
  },
);

const bissectrice = S(
  'm6-bissectrice',
  'Bissectrice d’un angle',
  'Connaître la définition de la bissectrice d’un angle saillant',
  ['La **bissectrice** partage un angle en deux angles **égaux** : chacun mesure la moitié.'],
  (rng, level) => {
    const a = 2 * rng.int(15, 85);
    const half = level !== 3;
    return {
      prompt: half
        ? `Un angle mesure ${a}°. On trace sa bissectrice. Combien mesure chacun des deux angles obtenus ?`
        : `La bissectrice d’un angle forme deux angles de ${a / 2}°. Combien mesure l’angle de départ ?`,
      answer: num(half ? a / 2 : a, '°'),
      traps: traps(
        r(half ? a / 2 : a),
        [[half ? a : a / 4, 'La bissectrice partage l’angle en **deux** angles égaux.']].filter(([v]) =>
          Number.isInteger(v),
        ) as [number, string][],
      ),
      hint: 'La bissectrice coupe l’angle en deux moitiés égales.',
      steps: [
        'La bissectrice partage l’angle en deux angles égaux.',
        half ? `${a} ÷ 2 = **${a / 2}°**.` : `2 × ${a / 2} = **${a}°**.`,
      ],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

export const angles = C(
  'm6-angles',
  'geometrie',
  'Angles et triangles',
  [natureAngle, sommeAngles, trianglesParticuliers, bissectrice],
  bossOf(
    [
      S(
        'm6-boss-angles-toit',
        'Problème : le toit',
        'Connaître et utiliser les propriétés angulaires des triangles particuliers',
        ['Un toit symétrique est un triangle isocèle : les deux angles du bas sont égaux.'],
        (rng) => {
          const base = rng.int(25, 50);
          return {
            prompt: `Le pignon d’une maison est un triangle isocèle. Chaque angle à la base mesure ${base}°. Combien mesure l’angle au sommet du toit ?`,
            answer: num(180 - 2 * base, '°'),
            traps: traps(r(180 - 2 * base), [[180 - base, `Il y a **deux** angles de ${base}°.`]]),
            hint: 'Les trois angles font 180° et les deux angles du bas sont égaux.',
            steps: [
              `Les deux angles du bas : 2 × ${base} = ${2 * base}°.`,
              `Sommet : 180 − ${2 * base} = **${180 - 2 * base}°**.`,
            ],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm6-boss-angles-pizza',
        'Problème : les parts de pizza',
        'Connaître et utiliser les angles ainsi que le lexique et les notations qui s’y rapportent',
        ['Un tour complet fait 360°. Des parts égales : 360 ÷ nombre de parts.'],
        (rng) => {
          const n = rng.pick([3, 4, 5, 6, 8, 9, 10, 12]);
          return {
            prompt: `Une pizza ronde est coupée en ${n} parts égales depuis le centre. Quel est l’angle de chaque part ?`,
            answer: num(360 / n, '°'),
            traps: traps(r(360 / n), [[Math.round(180 / n), 'Un tour complet fait 360°, pas 180°.']]),
            hint: 'Un tour complet = 360°.',
            steps: ['Le tour complet de la pizza fait 360°.', `360 ÷ ${n} = **${360 / n}°**.`],
            targetSeconds: 25,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-angles-piege',
        'Piège : deux angles obtus',
        'Connaître la valeur de la somme des mesures des angles d’un triangle',
        ['Deux angles obtus font déjà plus de 180° : impossible dans un triangle.'],
        (rng) => {
          const a = rng.int(95, 120);
          const b = rng.int(95, 120);
          return {
            prompt: `Peut-on construire un triangle avec un angle de ${a}° et un angle de ${b}° ?`,
            answer: { kind: 'choice', options: ['Oui', 'Non'], correct: 1 },
            traps: [{ option: 0, why: `${a} + ${b} = ${a + b}°, déjà plus que 180°.` }],
            hint: 'La somme des trois angles d’un triangle vaut 180°.',
            steps: [`${a} + ${b} = ${a + b}°, ce qui dépasse 180°.`, '**Non**, ce triangle est impossible.'],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
