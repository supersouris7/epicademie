import { choice, num, objective, traps, trueFalse } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Angles ───────────────────────── */

const anglesVocab: Skill = {
  id: 'm5-angles-vocab',
  title: 'Vocabulaire des angles',
  lesson: {
    memo: [
      'Droit = le coin d’une feuille (90°). Plat = une ligne droite (180°). **Aigu** = plus petit qu’un coin de feuille (« aigu » comme une pointe). **Obtus** = plus ouvert.',
      '**Supplémentaires** : ensemble, ils forment une ligne droite (180°).',
      '**Opposés par le sommet** : deux droites se croisent, les angles face à face sont pareils, comme les deux pointes d’un X.',
    ],
    source:
      objective(
        'Reconnaitre et citer sur une configuration géométrique des angles : angle plein, plat, nul, droit ; angles opposés par le sommet, adjacents, supplémentaires, aigus, obtus',
      ) + ' (automatisme)',
  },
  generate(rng, level) {
    if (level === 1) {
      const qs = [
        { q: 'Un angle droit mesure…', a: '90°', w: ['180°', '45°', '360°'] },
        { q: 'Un angle plat mesure…', a: '180°', w: ['90°', '360°', '0°'] },
        { q: `Un angle de ${rng.int(100, 170)}° est…`, a: 'obtus', w: ['aigu', 'droit', 'plat'] },
        { q: `Un angle de ${rng.int(10, 80)}° est…`, a: 'aigu', w: ['obtus', 'droit', 'plat'] },
        {
          q: 'Deux angles dont la somme fait 180° sont…',
          a: 'supplémentaires',
          w: ['opposés par le sommet', 'égaux', 'droits'],
        },
      ];
      const q = rng.pick(qs);
      return {
        prompt: q.q,
        ...choice(
          rng,
          q.a,
          q.w.map((label) => ({ label, why: `La bonne réponse est « ${q.a} ».` })),
        ),
        hint: 'Compare avec le coin d’une feuille (90°) et avec une ligne droite (180°).',
        steps: [
          q.a === 'obtus' || q.a === 'aigu'
            ? `On compare avec le coin d’une feuille (90°) : ${q.a === 'aigu' ? 'cet angle est plus petit, plus pointu' : 'cet angle est plus grand, plus ouvert, mais moins qu’une ligne droite (180°)'}.`
            : q.a === 'supplémentaires'
              ? 'Deux angles qui font 180° ensemble forment une ligne droite.'
              : `Repère : le coin d’une feuille fait 90°, une ligne droite fait 180°.`,
          `${q.q} **${q.a}**.`,
        ],
        targetSeconds: 10,
      };
    }
    const a = rng.int(20, 160);
    const opp = rng.next() < 0.5;
    const v = opp ? a : 180 - a;
    return {
      prompt: opp
        ? `Deux angles sont opposés par le sommet. L’un mesure ${a}°. Combien mesure l’autre (en °) ?`
        : `Deux angles sont supplémentaires. L’un mesure ${a}°. Combien mesure l’autre (en °) ?`,
      answer: num(v, '°'),
      traps: traps(
        r(v),
        opp
          ? [[180 - a, 'Des angles opposés par le sommet ont la **même** mesure.']]
          : [
              [90 - a, 'Supplémentaires : la somme fait 180°, pas 90°.'],
              [a, 'Supplémentaires ne veut pas dire égaux : la somme fait 180°.'],
            ],
      ),
      hint: opp
        ? 'Imagine un X : les deux angles face à face sont-ils différents ?'
        : 'Ensemble, les deux angles forment une ligne droite. Combien mesure une ligne droite ?',
      steps: opp
        ? [
            'Opposés par le sommet : deux droites se croisent comme un X, et les angles face à face sont pareils.',
            `Ils ont donc la même mesure : **${v}°**.`,
          ]
        : [
            'Supplémentaires : ensemble, les deux angles forment une ligne droite, soit 180°.',
            `Il manque donc 180° − ${a}° = **${v}°**.`,
          ],
      targetSeconds: 15,
    };
  },
};

/** Valeur de l'angle à la position p (0-7) quand la sécante fait l'angle θ avec deux parallèles. */
const angleAt = (theta: number, p: number) => (p % 2 === 0 ? theta : 180 - theta);
const PAIRS = [
  { a: 2, b: 4, name: 'alternes-internes' },
  { a: 3, b: 5, name: 'alternes-internes' },
  { a: 0, b: 4, name: 'correspondants' },
  { a: 1, b: 5, name: 'correspondants' },
  { a: 2, b: 6, name: 'correspondants' },
  { a: 3, b: 7, name: 'correspondants' },
  { a: 0, b: 2, name: 'opposés par le sommet' },
  { a: 5, b: 7, name: 'opposés par le sommet' },
];

const anglesParalleles: Skill = {
  id: 'm5-angles-paralleles',
  title: 'Angles et droites parallèles',
  lesson: {
    memo: [
      '**Alternes-internes** : à l’**intérieur** des deux droites, de chaque côté de la sécante (ils dessinent un Z).',
      '**Correspondants** : à la **même place** à chaque croisement, comme si on faisait glisser un croisement sur l’autre (ils dessinent un F).',
      'Si les droites sont parallèles, ces angles sont égaux. Et s’ils sont égaux, les droites sont parallèles !',
    ],
    source: objective('Caractériser le parallélisme par les angles : angles alternes internes, angles correspondants'),
  },
  generate(rng, level) {
    const theta = rng.int(35, 75);
    const pair = rng.pick(level === 1 ? PAIRS.slice(0, 6) : PAIRS);
    if (level === 1 || (level === 2 && rng.next() < 0.5)) {
      const names = ['alternes-internes', 'correspondants', 'opposés par le sommet'];
      return {
        prompt: 'Les angles marqués a et b sont…',
        figure: {
          kind: 'parallels',
          angle: theta,
          parallel: true,
          marks: [
            { at: pair.a, label: 'a' },
            { at: pair.b, label: 'b' },
          ],
        },
        ...choice(
          rng,
          pair.name,
          names
            .filter((n) => n !== pair.name)
            .map((label) => ({
              label,
              why: `Regarde leur position : ${pair.name === 'alternes-internes' ? 'entre les deux droites, de part et d’autre de la sécante' : pair.name === 'correspondants' ? 'du même côté de la sécante, à la même place à chaque intersection' : 'au même sommet, l’un en face de l’autre'}.`,
            })),
        ),
        hint: 'Les angles sont-ils entre les deux droites ou dehors ? Du même côté de la sécante ou de chaque côté ?',
        steps: [
          pair.name === 'alternes-internes'
            ? 'a et b sont tous les deux **entre** les deux droites, et de chaque côté de la sécante : ils dessinent un Z.'
            : pair.name === 'correspondants'
              ? 'a et b sont à la **même place** à chaque croisement (même côté de la sécante) : ils dessinent un F.'
              : 'a et b sont au **même croisement**, l’un en face de l’autre, comme les pointes d’un X.',
          `Ce sont des angles **${pair.name}**.`,
        ],
      };
    }
    if (level === 3 && rng.next() < 0.5) {
      const parallel = rng.next() < 0.5;
      const other = parallel ? theta : theta + rng.pick([-6, -4, 4, 6]);
      const altPair = PAIRS[0] ?? { a: 2, b: 4 };
      return {
        prompt: `Les angles alternes-internes marqués mesurent ${theta}° et ${other}°. Les droites (d) et (d′) sont-elles parallèles ?`,
        figure: {
          kind: 'parallels',
          angle: theta,
          parallel,
          marks: [
            { at: altPair.a, label: `${theta}°` },
            { at: altPair.b, label: `${other}°` },
          ],
        },
        ...trueFalse(
          parallel,
          parallel
            ? 'Les angles alternes-internes sont égaux : les droites sont parallèles.'
            : 'Les angles alternes-internes ne sont pas égaux : les droites ne sont pas parallèles (même si elles semblent l’être).',
        ),
        hint: 'Les droites sont parallèles seulement si les deux angles alternes-internes sont exactement égaux. Ne te fie pas au dessin !',
        steps: [
          'On ne se fie pas au dessin : on regarde les mesures des angles alternes-internes.',
          parallel
            ? `Les deux angles mesurent ${theta}° : ils sont égaux.`
            : `${theta}° et ${other}° : ils ne sont pas égaux, même si c’est proche.`,
          parallel
            ? 'Donc les droites sont **parallèles** : c’est vrai.'
            : 'Donc les droites ne sont **pas parallèles** : c’est faux.',
        ],
      };
    }
    const given = angleAt(theta, pair.a);
    const asked = angleAt(theta, pair.b);
    return {
      prompt: `Les droites (d) et (d′) sont parallèles. L’angle a mesure ${given}°. Combien mesure l’angle b (en °) ?`,
      figure: {
        kind: 'parallels',
        angle: theta,
        parallel: true,
        marks: [
          { at: pair.a, label: `${given}°` },
          { at: pair.b, label: 'b' },
        ],
      },
      answer: num(asked, '°'),
      traps: traps(r(asked), [[180 - asked, `a et b sont ${pair.name} : ils sont égaux, pas supplémentaires.`]]),
      hint: `Comment s’appellent les angles a et b ? Que sait-on de ces angles quand les droites sont parallèles ?`,
      steps: [
        `On repère la position de a et b : ce sont des angles ${pair.name}.`,
        pair.name === 'opposés par le sommet'
          ? 'Des angles opposés par le sommet sont toujours égaux.'
          : `Comme (d) et (d′) sont parallèles, des angles ${pair.name} sont égaux.`,
        `Donc b = a = **${asked}°**`,
      ],
    };
  },
};

export const angles: Chapter = {
  id: 'm5-angles',
  subject: 'maths',
  grade: '5e',
  domain: 'geometrie',
  title: 'Angles',
  skills: [anglesVocab, anglesParalleles],
};
