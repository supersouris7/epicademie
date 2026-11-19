import { choice, num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { bossOf, MINUS } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Transformations ———

const demiTour = S(
  'm4-demi-tour',
  'Symétrique par demi-tour',
  'Construire le symétrique d’un point par demi-tour (automatisme)',
  [
    'Le symétrique de A par **demi-tour** de centre O : O est le **milieu** de [AA′]. On va de A à O, puis on continue d’autant.',
  ],
  (rng) => {
    const lim = 5;
    for (;;) {
      const o = { x: rng.int(-1, 1), y: rng.int(-1, 1) };
      const a = { x: rng.int(-4, 4), y: rng.int(-4, 4) };
      if (a.x === o.x && a.y === o.y) continue;
      const img = { x: 2 * o.x - a.x, y: 2 * o.y - a.y };
      if (Math.abs(img.x) > lim || Math.abs(img.y) > lim) continue;
      return {
        prompt: 'Touche le quadrillage pour placer A′, le symétrique de A par demi-tour de centre O.',
        figure: {
          kind: 'grid',
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          axes: false,
          points: [
            { name: 'A', x: a.x, y: a.y, color: 'accent' },
            { name: 'O', x: o.x, y: o.y, color: 'muted' },
          ],
          pick: true,
        },
        answer: { kind: 'point', ...img },
        traps: [
          { point: { x: 2 * o.x - a.x, y: a.y }, why: 'Le demi-tour inverse les deux directions, pas seulement une.' },
        ].filter((t) => !(t.point.x === img.x && t.point.y === img.y)),
        hint: 'Compte le déplacement de A jusqu’à O, puis refais-le une deuxième fois à partir de O.',
        steps: [
          `De A à O : ${o.x - a.x >= 0 ? '+' : MINUS}${Math.abs(o.x - a.x)} en largeur et ${o.y - a.y >= 0 ? '+' : MINUS}${Math.abs(o.y - a.y)} en hauteur.`,
          'On refait le même trajet depuis O : A′ est **le nœud entouré en vert**.',
        ],
        targetSeconds: 30,
      };
    }
  },
);

const translation = S(
  'm4-translation',
  'Image par une translation',
  'Comprendre l’effet d’une translation',
  [
    'Une **translation** fait glisser toute la figure, sans la tourner : chaque point bouge du même déplacement (même direction, même sens, même longueur).',
  ],
  (rng) => {
    const lim = 5;
    for (;;) {
      const a = { x: rng.int(-4, 2), y: rng.int(-4, 2) };
      const b = { x: a.x + rng.int(-3, 3), y: a.y + rng.int(-3, 3) };
      if (a.x === b.x && a.y === b.y) continue;
      const m = { x: rng.int(-4, 4), y: rng.int(-4, 4) };
      const img = { x: m.x + b.x - a.x, y: m.y + b.y - a.y };
      if (
        Math.abs(img.x) > lim ||
        Math.abs(img.y) > lim ||
        Math.abs(b.x) > lim ||
        Math.abs(b.y) > lim ||
        (m.x === a.x && m.y === a.y) ||
        (m.x === b.x && m.y === b.y)
      )
        continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      return {
        prompt: 'La translation transforme A en B. Touche le quadrillage pour placer M′, l’image de M.',
        figure: {
          kind: 'grid',
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          axes: false,
          points: [
            { name: 'A', x: a.x, y: a.y, color: 'muted' },
            { name: 'B', x: b.x, y: b.y, color: 'muted' },
            { name: 'M', x: m.x, y: m.y, color: 'accent' },
          ],
          segments: [['A', 'B']],
          pick: true,
        },
        answer: { kind: 'point', ...img },
        traps: [{ point: { x: m.x - dx, y: m.y - dy }, why: 'Attention au sens : de A **vers** B.' }],
        hint: 'Compte le déplacement de A à B (en largeur, en hauteur), et fais le même à partir de M.',
        steps: [
          `De A à B : ${dx >= 0 ? '+' : MINUS}${Math.abs(dx)} en largeur, ${dy >= 0 ? '+' : MINUS}${Math.abs(dy)} en hauteur.`,
          'Même déplacement depuis M : M′ est **le nœud entouré en vert**.',
        ],
        targetSeconds: 30,
      };
    }
  },
);

const conservation = S(
  'm4-conservation',
  'Ce que conservent les transformations',
  'Connaitre et utiliser les propriétés de conservations des translations',
  [
    'Symétries et translations **conservent** les longueurs, les angles, les aires et le parallélisme : l’image est une copie exacte.',
  ],
  (rng) => {
    const t = rng.pick(['translation', 'symétrie axiale', 'symétrie centrale (demi-tour)']);
    const q = rng.pick([
      () => {
        const v = rng.int(3, 15);
        return {
          p: `Par une ${t}, le segment [EF] de ${v} cm a pour image [E′F′]. Combien mesure [E′F′] ?`,
          a: num(v, 'cm'),
          val: r(v),
          why: 'Les longueurs sont conservées.',
        };
      },
      () => {
        const v = rng.int(20, 150);
        return {
          p: `Par une ${t}, un angle de ${v}° a pour image un angle de combien de degrés ?`,
          a: num(v, '°'),
          val: r(v),
          why: 'Les angles sont conservés.',
        };
      },
      () => {
        const v = rng.int(5, 60);
        return {
          p: `Par une ${t}, un triangle d’aire ${v} cm^2 a pour image un triangle d’aire… ?`,
          a: num(v, 'cm^2'),
          val: r(v),
          why: 'Les aires sont conservées.',
        };
      },
    ])();
    return {
      prompt: q.p,
      answer: q.a,
      traps: traps(q.val, [[mul(q.val, r(2)), q.why]]),
      hint: 'L’image par ces transformations est une copie exacte de la figure.',
      steps: [q.why, `Même mesure : **${fmt(q.val)}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

export const transformations = C(
  'm4-transformations',
  'geometrie',
  'Translations et symétries',
  [demiTour, translation, conservation],
  bossOf(
    [
      S(
        'm4-boss-transfo-pavage',
        'Problème : le pavage',
        'Connaitre et utiliser les propriétés de conservations des translations',
        ['Dans un pavage par translation, tous les motifs sont des copies : même aire.'],
        (rng) => {
          const a = rng.int(3, 12);
          const n = rng.int(5, 20);
          return {
            prompt: `Un motif de ${a} cm^2 est reproduit ${n} fois par des translations pour faire une frise. Quelle aire couvrent les ${n} motifs ?`,
            answer: num(a * n, 'cm^2'),
            traps: traps(r(a * n), [[a, `Il y a ${n} motifs, chacun de même aire.`]]),
            hint: 'Chaque copie a la même aire que le motif.',
            steps: [
              `La translation conserve les aires : chaque motif fait ${a} cm^2.`,
              `${n} × ${a} = **${a * n} cm^2**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
      S(
        'm4-boss-transfo-robot',
        'Problème : le robot qui glisse',
        'Comprendre l’effet d’une translation',
        ['Deux translations à la suite : on additionne les déplacements.'],
        (rng) => {
          const a = rng.int(2, 6);
          const b = rng.int(2, 6);
          const c = rng.int(1, 4);
          return {
            prompt: `Un robot glisse de ${a} cases vers la droite, puis de ${b} cases vers la droite et ${c} vers le haut. De combien de cases vers la droite s’est-il déplacé en tout ?`,
            answer: num(a + b),
            traps: traps(r(a + b), [[a + b + c, `Le déplacement vers le haut (${c}) ne compte pas vers la droite.`]]),
            hint: 'Additionne seulement les déplacements vers la droite.',
            steps: [`Vers la droite : ${a} + ${b}.`, `= **${a + b}** cases.`],
            targetSeconds: 25,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-transfo-piege',
        'Piège : la translation fait-elle tourner ?',
        'Comprendre l’effet d’une translation',
        ['Une translation ne fait **jamais** tourner une figure : elle la fait glisser.'],
        (rng) => ({
          prompt: 'Par une translation, une flèche qui pointe vers le haut peut-elle pointer vers la droite ?',
          ...choice(
            rng,
            'Non',
            [{ label: 'Oui', why: 'Une translation fait glisser sans tourner : la flèche garde sa direction.' }],
            true,
          ),
          hint: 'Une translation : glisser ou tourner ?',
          steps: [
            'Une translation fait glisser la figure sans la tourner.',
            '**Non** : la flèche pointe toujours vers le haut.',
          ],
          targetSeconds: 15,
        }),
      ),
    ],
  ),
);
