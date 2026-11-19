import { choice, distinct, num, objective, traps, trueFalse } from '../../build.ts';
import { fmt, mul, r, type Rational } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';
import { TRIPLES } from './commun.ts';

/* ───────────────────────── Triangles ───────────────────────── */

/** Triangle (sommets A, B, C) à partir de deux angles en B et C, base BC horizontale. */
function triangleFromAngles(b: number, c: number) {
  const rad = Math.PI / 180;
  const base = 10;
  const ta = Math.tan(b * rad);
  const tc = Math.tan(c * rad);
  const x = (base * tc) / (ta + tc);
  const y = x * ta;
  return [
    { name: 'A', x, y },
    { name: 'B', x: 0, y: 0 },
    { name: 'C', x: base, y: 0 },
  ];
}

const triangleAngles: Skill = {
  id: 'm5-triangle-angles',
  title: 'Somme des angles d’un triangle',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Si on découpe les 3 coins d’un triangle et qu’on les met côte à côte, ils forment une ligne droite : **180°**, toujours !',
      'Donc l’angle qui manque = 180° − les deux autres.',
      'Isocèle : les deux angles du bas (à la base) sont jumeaux.',
    ],
    source: objective(
      'Connaitre la somme des angles d’un triangle et savoir la démontrer. Construire des triangles à partir de données partielles',
    ),
  },
  generate(rng, level) {
    if (level === 1) {
      const [b, c] = [rng.int(25, 80), rng.int(25, 80)];
      const a = 180 - b - c;
      return {
        prompt: 'Calcule la mesure de l’angle en A (en °).',
        figure: { kind: 'polygon', vertices: triangleFromAngles(b, c), angleLabels: ['?', `${b}°`, `${c}°`] },
        answer: num(a, '°'),
        traps: traps(r(a), [
          [360 - b - c, 'La somme des angles d’un triangle vaut 180°, pas 360°.'],
          [b + c, `On calcule 180° − ${b}° − ${c}°.`],
        ]),
        hint: 'Les trois angles d’un triangle font 180° en tout. Combien manque-t-il ?',
        steps: [
          'Les trois angles d’un triangle font toujours 180° ensemble.',
          `On a déjà ${b}° + ${c}° = ${b + c}°.`,
          `Il manque 180° − ${b + c}° = **${a}°**`,
        ],
      };
    }
    if (level === 2) {
      const apexGiven = rng.next() < 0.5;
      const base = rng.int(25, 75);
      const apex = 180 - 2 * base;
      const v = triangleFromAngles(base, base);
      return apexGiven
        ? {
            prompt: `ABC est isocèle en A et l’angle en A mesure ${apex}°. Combien mesure l’angle en B (en °) ?`,
            figure: { kind: 'polygon', vertices: v, angleLabels: [`${apex}°`, '?', null], ticks: [1, 0, 1] },
            answer: num(base, '°'),
            traps: traps(r(base), [
              [180 - apex, `Les deux angles à la base se partagent ${180 - apex}° : chacun vaut la moitié.`],
            ]),
            hint: 'Isocèle en A : les angles en B et C sont jumeaux. Combien de degrés leur reste-t-il à se partager ?',
            steps: [
              'Isocèle en A : les angles en B et C sont jumeaux (même mesure).',
              `Les trois angles font 180°. Il reste 180° − ${apex}° = ${180 - apex}° pour B et C ensemble.`,
              `Ils se partagent ça en deux : ${180 - apex} ÷ 2 = **${base}°**`,
            ],
          }
        : {
            prompt: `ABC est isocèle en A et l’angle en B mesure ${base}°. Combien mesure l’angle en A (en °) ?`,
            figure: { kind: 'polygon', vertices: v, angleLabels: ['?', `${base}°`, null], ticks: [1, 0, 1] },
            answer: num(apex, '°'),
            traps: traps(r(apex), [
              [180 - base, `L’angle en C mesure aussi ${base}° (isocèle) : il faut l’enlever aussi.`],
            ]),
            hint: 'Isocèle en A : l’angle en C est le jumeau de l’angle en B. Puis les trois font 180°.',
            steps: [
              `Isocèle en A : l’angle en C est le jumeau de B, il mesure aussi ${base}°.`,
              `B et C ensemble : ${base}° + ${base}° = ${2 * base}°.`,
              `Il reste pour A : 180° − ${2 * base}° = **${apex}°**`,
            ],
          };
    }
    const [x, y] = distinct(rng, 2, () => rng.int(20, 120));
    const z = rng.next() < 0.5 ? 180 - (x ?? 0) - (y ?? 0) : rng.int(20, 100);
    const ok = (x ?? 0) + (y ?? 0) + z === 180 && z > 0;
    return {
      prompt: `Peut-on construire un triangle dont les angles mesurent ${x}°, ${y}° et ${z}° ?`,
      ...trueFalse(ok, `${x} + ${y} + ${z} = ${(x ?? 0) + (y ?? 0) + z}° ; il faut exactement 180°.`),
      hint: 'Dans un triangle, les trois angles font exactement 180°. Additionne-les.',
      steps: [
        'Dans un triangle, les trois angles font toujours exactement 180°.',
        `On additionne : ${x} + ${y} + ${z} = ${(x ?? 0) + (y ?? 0) + z}°.`,
        ok ? 'Ça fait pile 180° : **oui**, c’est possible.' : `Ça ne fait pas 180° : **non**, c’est impossible.`,
      ],
      targetSeconds: 25,
    };
  },
};

const triangleAire: Skill = {
  id: 'm5-triangle-aire',
  title: 'Aire d’un triangle',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Un triangle, c’est la **moitié d’un rectangle** : aire = base × hauteur ÷ 2.',
      'La hauteur, c’est la distance « tout droit » du sommet jusqu’à la base : elle fait un **angle droit** avec la base (le petit carré sur le dessin).',
      'Un côté penché n’est pas la hauteur !',
    ],
    source: objective('Calculer l’aire d’un triangle'),
  },
  generate(rng, level) {
    // Côté oblique affiché exact grâce aux triplets pythagoriciens (niveau 3 : moitiés).
    const [tf, th, ts] = rng.pick(TRIPLES);
    const scale = level === 3 ? r(1, 2) : r(1);
    const foot = level === 1 ? rng.int(1, 6) : (tf * scale.n) / scale.d;
    const h: Rational = level === 1 ? r(rng.int(2, 12)) : mul(r(th), scale);
    const side: Rational | null = level === 1 ? null : mul(r(ts), scale);
    const b = Math.ceil(foot) + rng.int(1, 6);
    const area = mul(mul(r(b), h), r(1, 2));
    const hv = h.n / h.d;
    return {
      prompt: 'Calcule l’aire de ce triangle (en cm^2).',
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: foot, y: hv },
          { name: 'B', x: 0, y: 0 },
          { name: 'C', x: b, y: 0 },
        ],
        sideLabels: [side ? `${fmt(side)} cm` : null, `${b} cm`, null],
        extra: [{ from: { x: foot, y: hv }, to: { x: foot, y: 0 }, label: `${fmt(h)} cm`, rightAngleAtEnd: true }],
      },
      answer: num(area, 'cm^2'),
      traps: traps(area, [
        [mul(r(b), h), 'Il manque la division par 2.'],
        ...(side
          ? ([
              [
                mul(mul(r(b), side), r(1, 2)),
                `Le côté de ${fmt(side)} cm n’est pas la hauteur : la hauteur est perpendiculaire à la base.`,
              ],
            ] as [Rational, string][])
          : []),
      ]),
      hint: 'Repère la hauteur : c’est le trait en pointillés avec l’angle droit. Puis base × hauteur ÷ 2.',
      steps: [
        `La base est le côté du bas : ${b} cm. La hauteur est le pointillé avec l’angle droit : ${fmt(h)} cm${side ? ` (pas le côté penché de ${fmt(side)} cm !)` : ''}.`,
        `Un triangle, c’est la moitié d’un rectangle de ${b} cm sur ${fmt(h)} cm : ${b} × ${fmt(h)} = ${fmt(mul(r(b), h))}.`,
        `On prend la moitié : ${fmt(mul(r(b), h))} ÷ 2 = **${fmt(area)}** cm^2`,
      ],
      targetSeconds: 30,
    };
  },
};

const droitesRemarquables: Skill = {
  id: 'm5-droites-remarquables',
  title: 'Hauteurs, médianes, médiatrices',
  lesson: {
    memo: [
      'Regarde les codages sur le dessin ! Un **angle droit** (petit carré) et un **milieu** (petits traits égaux).',
      '**Hauteur** : part d’un sommet + angle droit. **Médiane** : part d’un sommet + arrive au milieu. **Médiatrice** : milieu + angle droit (elle ne passe pas forcément par un sommet).',
    ],
    source: objective(
      'Définir et tracer les hauteurs dans un triangle. Définir et tracer les médianes. Connaitre les propriétés des médiatrices et du cercle circonscrit',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const st = [
        {
          t: 'Les trois hauteurs d’un triangle se coupent en un même point.',
          v: true,
          why: 'Les hauteurs sont concourantes.',
        },
        {
          t: 'Une médiane partage un triangle en deux triangles de même aire.',
          v: true,
          why: 'Les deux triangles ont la même base (moitiés du côté) et la même hauteur.',
        },
        {
          t: 'Le centre du cercle circonscrit est le point de concours des médiatrices.',
          v: true,
          why: 'Il est à égale distance des trois sommets.',
        },
        {
          t: 'Le centre du cercle circonscrit est le point de concours des médianes.',
          v: false,
          why: 'C’est le point de concours des **médiatrices**.',
        },
        {
          t: 'Une hauteur passe toujours par le milieu du côté opposé.',
          v: false,
          why: 'C’est la médiane qui passe par le milieu ; la hauteur est perpendiculaire au côté.',
        },
      ];
      const s = rng.pick(st);
      return {
        prompt: `Vrai ou faux : ${s.t}`,
        ...trueFalse(s.v, s.why),
        hint: 'Rappelle-toi : hauteur = angle droit, médiane = milieu, médiatrice = milieu + angle droit.',
        steps: [
          'Hauteur = sommet + angle droit. Médiane = sommet + milieu. Médiatrice = milieu + angle droit.',
          s.why,
          `Donc c’est **${s.v ? 'vrai' : 'faux'}**.`,
        ],
      };
    }
    const ax = rng.int(2, 8);
    const ay = rng.int(5, 9);
    const verts = [
      { name: 'A', x: ax, y: ay },
      { name: 'B', x: 0, y: 0 },
      { name: 'C', x: 10, y: 0 },
    ];
    const kinds = level === 1 ? ['hauteur', 'médiane'] : ['hauteur', 'médiane', 'médiatrice'];
    const kind = rng.pick(kinds);
    const extra =
      kind === 'hauteur'
        ? { from: { x: ax, y: ay }, to: { x: ax, y: 0 }, rightAngleAtEnd: true }
        : kind === 'médiane'
          ? { from: { x: ax, y: ay }, to: { x: 5, y: 0 }, midpointOf: [1, 2] as const }
          : {
              from: { x: 5, y: 6 },
              to: { x: 5, y: 0 },
              rightAngleAtEnd: true,
              midpointOf: [1, 2] as const,
              infinite: true,
            };
    if (kind === 'hauteur' && ax === 5) extra.to = { x: 5, y: 0 };
    const names = ['une hauteur', 'une médiane', 'une médiatrice', 'une bissectrice'];
    const correct = `une ${kind}`;
    return {
      prompt: 'La droite en pointillés est…',
      figure: { kind: 'polygon', vertices: verts, extra: [extra] },
      ...choice(
        rng,
        correct,
        names
          .filter((n) => n !== correct)
          .map((label) => ({
            label,
            why:
              kind === 'hauteur'
                ? 'Elle passe par A et est perpendiculaire à [BC] (angle droit) : c’est une hauteur.'
                : kind === 'médiane'
                  ? 'Elle relie A au milieu de [BC] (codage) : c’est une médiane.'
                  : 'Elle est perpendiculaire à [BC] en son milieu : c’est une médiatrice.',
          })),
      ),
      hint: 'Regarde les codages : y a-t-il un angle droit (petit carré) ? un milieu (petits traits) ? La droite part-elle d’un sommet ?',
      steps: [
        'On regarde les codages sur le dessin : petit carré = angle droit, petits traits = milieu.',
        kind === 'hauteur'
          ? 'Ici : la droite part du sommet A et fait un angle droit avec [BC]. Pas de milieu.'
          : kind === 'médiane'
            ? 'Ici : la droite part du sommet A et arrive au milieu de [BC]. Pas d’angle droit.'
            : 'Ici : la droite coupe [BC] en son milieu, avec un angle droit. Elle ne part pas d’un sommet.',
        kind === 'hauteur'
          ? 'Sommet + angle droit : c’est **une hauteur**.'
          : kind === 'médiane'
            ? 'Sommet + milieu : c’est **une médiane**.'
            : 'Milieu + angle droit : c’est **une médiatrice**.',
      ],
    };
  },
};

export const triangles: Chapter = {
  id: 'm5-triangles',
  subject: 'maths',
  grade: '5e',
  domain: 'geometrie',
  title: 'Triangles',
  skills: [triangleAngles, triangleAire, droitesRemarquables],
};
