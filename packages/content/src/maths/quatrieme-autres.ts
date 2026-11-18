import { choice, distinct, fraction, num, traps } from '../build.ts';
import { dec, fmt, frac, isDecimal, mul, r } from '../rational.ts';
import type { Block, Chapter, Figure } from '../types.ts';
import { bossOf, chapterOf, MINUS, NAMES, sgn, skillsOf } from './kit.ts';

/** Programme de 4e (cycle 4, BO n°10 du 5 mars 2026) : géométrie, données, fonctions, informatique. */
const S = skillsOf('4e');
const C = chapterOf('4e');

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

/** Arrondi au dixième d'un nombre réel positif, en rationnel exact. */
const tenth = (x: number) => r(Math.round(x * 10), 10);
const unit = (x: number) => r(Math.round(x));

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

const transformations = C(
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

// ——— Pyramides et cônes ———

const volumePyramide = S(
  'm4-volume-pyramide',
  'Volume d’une pyramide',
  'Connaitre le volume de la pyramide et du cône de révolution',
  ['Volume d’une pyramide = **aire de la base × hauteur ÷ 3**. C’est le tiers du prisme de même base et même hauteur.'],
  (rng, level) => {
    const c = rng.int(2, 9);
    const h = 3 * rng.int(1, 6);
    const base = level === 1 ? c * c : c * rng.int(2, 9);
    const v = (base * h) / 3;
    return {
      prompt:
        level === 1
          ? `Une pyramide a une base carrée de ${c} cm de côté et une hauteur de ${h} cm. Calcule son volume en cm^3.`
          : `Une pyramide a une base d’aire ${base} cm^2 et une hauteur de ${h} cm. Calcule son volume en cm^3.`,
      answer: num(v, 'cm^3'),
      traps: traps(r(v), [[base * h, 'N’oublie pas de diviser par 3.']]),
      hint: 'Volume = aire de la base × hauteur ÷ 3.',
      steps: [
        level === 1 ? `Aire de la base : ${c} × ${c} = ${base} cm^2.` : `Aire de la base : ${base} cm^2.`,
        `${base} × ${h} ÷ 3 = **${v} cm^3**.`,
      ],
      targetSeconds: 35,
    };
  },
  { advice: 'calculatrice' },
);

const volumeCone = S(
  'm4-volume-cone',
  'Volume d’un cône',
  'Connaitre le volume de la pyramide et du cône de révolution',
  ['Volume d’un cône = **π × r × r × h ÷ 3** (l’aire du disque de base × hauteur ÷ 3).'],
  (rng) => {
    const rad = rng.int(2, 9);
    const h = rng.int(3, 15);
    const exact = (Math.PI * rad * rad * h) / 3;
    const approx = (3.14 * rad * rad * h) / 3;
    return {
      prompt: `Un cône a un rayon de base de ${rad} cm et une hauteur de ${h} cm. Calcule son volume en cm^3, arrondi à l’unité.`,
      answer: { ...num(unit(exact), 'cm^3'), accept: [unit(approx)], round: 0 },
      traps: traps(unit(exact), [
        [unit(exact * 3), 'N’oublie pas de diviser par 3.'],
        [unit((Math.PI * 2 * rad * h) / 3), 'L’aire de la base est π × r × r, pas 2 × π × r.'],
      ]),
      hint: 'Aire de la base (π × r × r), × hauteur, ÷ 3.',
      steps: [
        `Aire de la base : π × ${rad} × ${rad} ≈ ${fmt(tenth(Math.PI * rad * rad))} cm^2.`,
        `Volume ≈ ${fmt(tenth(Math.PI * rad * rad))} × ${h} ÷ 3 ≈ **${fmt(unit(exact))} cm^3**.`,
      ],
      targetSeconds: 50,
    };
  },
  { advice: 'calculatrice' },
);

const volumesUsuels = S(
  'm4-volumes-usuels',
  'Volumes : prisme et cylindre',
  'Connaitre et utiliser les formules du volume d’un cube, d’un pavé, d’un prisme, d’un cylindre (automatisme)',
  ['Prisme droit et cylindre : volume = **aire de la base × hauteur** (sans diviser par 3).'],
  (rng) => {
    const cyl = rng.int(0, 1) === 1;
    if (cyl) {
      const rad = rng.int(2, 8);
      const h = rng.int(3, 15);
      const exact = Math.PI * rad * rad * h;
      return {
        prompt: `Calcule le volume d’un cylindre de rayon ${rad} cm et de hauteur ${h} cm, arrondi à l’unité (en cm^3).`,
        figure: { kind: 'solid', solid: 'cylindre', labels: [`${rad} cm`, `${h} cm`] },
        answer: { ...num(unit(exact), 'cm^3'), accept: [unit(3.14 * rad * rad * h)], round: 0 },
        traps: traps(unit(exact), [[unit(exact / 3), 'On ne divise par 3 que pour les cônes et les pyramides.']]),
        hint: 'Volume = π × r × r × h.',
        steps: [`π × ${rad} × ${rad} × ${h}.`, `≈ **${fmt(unit(exact))} cm^3**.`],
        targetSeconds: 40,
      };
    }
    const a = rng.int(3, 10);
    const b = 2 * rng.int(2, 6);
    const h = rng.int(4, 15);
    const v = (a * b * h) / 2;
    return {
      prompt: `Un prisme droit a pour base un triangle rectangle de côtés ${a} cm et ${b} cm (les côtés de l’angle droit) et une hauteur de ${h} cm. Calcule son volume en cm^3.`,
      figure: { kind: 'solid', solid: 'prisme', labels: [`${b} cm`, `${a} cm`, `${h} cm`] },
      answer: num(v, 'cm^3'),
      traps: traps(r(v), [
        [a * b * h, 'L’aire du triangle rectangle est (base × hauteur) ÷ 2.'],
        [r(v, 3), 'Un prisme n’est pas une pyramide : pas de ÷ 3.'],
      ]),
      hint: 'Aire du triangle de base, puis × hauteur du prisme.',
      steps: [
        `Aire de la base : ${a} × ${b} ÷ 2 = ${(a * b) / 2} cm^2.`,
        `Volume : ${(a * b) / 2} × ${h} = **${v} cm^3**.`,
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const reconnaitreSolides = S(
  'm4-pyramide-cone',
  'Reconnaître pyramides et cônes',
  'Reconnaitre des solides (pyramide, cône de révolution)',
  [
    'Une **pyramide** a une base polygonale et des faces latérales **triangulaires** qui se rejoignent au sommet. Un **cône** a une base en disque.',
  ],
  (rng) => {
    const n = rng.int(3, 8);
    const q = rng.pick(['faces latérales', 'faces en tout', 'arêtes']);
    const a = q === 'faces latérales' ? n : q === 'faces en tout' ? n + 1 : 2 * n;
    return {
      prompt: `Une pyramide a pour base un polygone à ${n} côtés. Combien a-t-elle de ${q} ?`,
      answer: num(a),
      traps: traps(r(a), [
        [
          q === 'faces latérales' ? n + 1 : n,
          q === 'arêtes'
            ? 'Compte aussi les arêtes qui montent vers le sommet.'
            : q === 'faces en tout'
              ? 'Pense à la base.'
              : 'La base n’est pas une face latérale.',
        ],
      ]),
      hint: 'Une face latérale par côté de la base ; une arête latérale par sommet de la base.',
      steps: [
        `Base à ${n} côtés : ${n} faces latérales, ${n} arêtes de base et ${n} arêtes latérales.`,
        `Donc **${a}** ${q}.`,
      ],
      targetSeconds: 25,
    };
  },
);

const espace = C(
  'm4-espace',
  'geometrie',
  'Pyramides, cônes et volumes',
  [reconnaitreSolides, volumePyramide, volumeCone, volumesUsuels],
  bossOf(
    [
      S(
        'm4-boss-espace-louvre',
        'Problème : la pyramide du Louvre',
        'Connaitre le volume de la pyramide et du cône de révolution',
        ['Pyramide à base carrée : (côté × côté) × hauteur ÷ 3.'],
        (rng) => {
          const c = rng.int(30, 36);
          const h = rng.int(20, 22);
          const v = (c * c * h) / 3;
          return {
            prompt: `Une pyramide de verre a une base carrée de ${c} m de côté et une hauteur de ${h} m. Calcule son volume en m^3, arrondi à l’unité.`,
            answer: { ...num(unit(v), 'm^3'), round: 0 },
            traps: traps(unit(v), [[c * c * h, 'N’oublie pas de diviser par 3.']]),
            hint: 'Aire de la base × hauteur ÷ 3.',
            steps: [`Base : ${c} × ${c} = ${c * c} m^2.`, `${c * c} × ${h} ÷ 3 ≈ **${fmt(unit(v))} m^3**.`],
            targetSeconds: 50,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-espace-glace',
        'Problème : le cornet de glace',
        'Connaitre le volume de la pyramide et du cône de révolution',
        ['Un cornet est un cône : π × r × r × h ÷ 3. 1 cm^3 = 1 mL.'],
        (rng) => {
          const rad = rng.int(2, 4);
          const h = rng.int(9, 14);
          const v = (Math.PI * rad * rad * h) / 3;
          return {
            prompt: `Un cornet conique a un rayon de ${rad} cm et une hauteur de ${h} cm. Combien de mL de glace contient-il quand il est rempli à ras bord ? (arrondi à l’unité)`,
            answer: { ...num(unit(v), 'mL'), accept: [unit((3.14 * rad * rad * h) / 3)], round: 0 },
            traps: traps(unit(v), [[unit(v * 3), 'Un cône : on divise par 3.']]),
            hint: 'Volume du cône en cm^3, et 1 cm^3 = 1 mL.',
            steps: [`π × ${rad} × ${rad} × ${h} ÷ 3 ≈ ${fmt(unit(v))} cm^3.`, `Soit **${fmt(unit(v))} mL**.`],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm4-boss-espace-piege',
        'Piège : pyramide et prisme',
        'Connaitre le volume de la pyramide et du cône de révolution',
        ['Une pyramide a un volume **3 fois plus petit** qu’un prisme de même base et même hauteur.'],
        (rng) => {
          const v = 3 * rng.int(10, 100);
          return {
            prompt: `Un prisme a un volume de ${v} cm^3. Quel est le volume d’une pyramide de même base et de même hauteur ?`,
            answer: num(v / 3, 'cm^3'),
            traps: traps(r(v / 3), [
              [v, 'La pyramide est 3 fois plus petite.'],
              [v / 2 === Math.floor(v / 2) ? v / 2 : v * 2, 'C’est le tiers, pas la moitié.'],
            ]),
            hint: 'Volume de la pyramide = volume du prisme ÷ 3.',
            steps: [
              'La pyramide occupe le tiers du prisme de même base et même hauteur.',
              `${v} ÷ 3 = **${v / 3} cm^3**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

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

const triangles = C(
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

const parallelogrammes = C(
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

// ——— Statistiques ———

const moyennePonderee = S(
  'm4-moyenne-ponderee',
  'Moyenne pondérée',
  'Calculer une moyenne pondérée dans le cas d’une série discrète de petits effectifs présentée sous forme de données brutes, d’un tableau ou d’un diagramme en barres',
  [
    'Moyenne pondérée = (valeur × effectif + …) ÷ effectif total. Avec 3 notes de 12 et 1 note de 16 : (3 × 12 + 16) ÷ 4 = 13.',
  ],
  (rng) => {
    const vals = distinct(rng, 3, () => rng.int(8, 18)).sort((a, b) => a - b);
    for (;;) {
      const eff = vals.map(() => rng.int(1, 6));
      const total = eff.reduce((a, b) => a + b, 0);
      const sum = vals.reduce((s, v, i) => s + v * (eff[i] ?? 0), 0);
      const mean = r(sum, total);
      const decimals = isDecimal(mean) ? (fmt(mean).split(',')[1]?.length ?? 0) : 99;
      if (decimals > 2) continue;
      return {
        prompt: 'Voici les notes d’un contrôle. Quelle est la moyenne de la classe ?',
        figure: {
          kind: 'table',
          header: true,
          rows: [
            ['Note', ...vals.map(String)],
            ['Effectif', ...eff.map(String)],
          ],
        },
        answer: num(mean),
        traps: [],
        hint: 'Multiplie chaque note par son effectif, additionne, puis divise par l’effectif total.',
        steps: [
          `Somme : ${vals.map((v, i) => `${v} × ${eff[i]}`).join(' + ')} = ${sum}. Effectif total : ${total}.`,
          `Moyenne : ${sum} ÷ ${total} = **${fmt(mean)}**.`,
        ],
        targetSeconds: 60,
      };
    }
  },
  { advice: 'calculatrice' },
);

const mediane = S(
  'm4-mediane',
  'Médiane d’une série',
  'Déterminer une médiane et l’interpréter dans le cas d’une série de petit effectif présentée sous forme de données brutes',
  [
    'On **range** les valeurs dans l’ordre. La médiane est au milieu : autant de valeurs en dessous qu’au-dessus.',
    'Nombre pair de valeurs : moyenne des deux du milieu.',
  ],
  (rng, level) => {
    const n = level === 1 ? 5 : level === 2 ? 7 : 6;
    const vals = Array.from({ length: n }, () => rng.int(1, 30));
    const sorted = [...vals].sort((a, b) => a - b);
    const med = n % 2 === 1 ? r(sorted[(n - 1) / 2] ?? 0) : r((sorted[n / 2 - 1] ?? 0) + (sorted[n / 2] ?? 0), 2);
    return {
      prompt: `Quelle est la médiane de cette série : ${vals.join(' ; ')} ?`,
      answer: num(med),
      traps: traps(med, [[vals[Math.floor(n / 2)] ?? 0, 'Il faut d’abord **ranger** les valeurs dans l’ordre.']]),
      hint: 'Range les valeurs dans l’ordre croissant, puis prends celle du milieu.',
      steps: [
        `Rangées : ${sorted.join(' ; ')}.`,
        n % 2 === 1
          ? `La ${(n + 1) / 2}e valeur est au milieu : **${fmt(med)}**.`
          : `Les deux du milieu : ${sorted[n / 2 - 1]} et ${sorted[n / 2]}. Médiane : **${fmt(med)}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const etendue = S(
  'm4-etendue',
  'Étendue d’une série',
  'Calculer et interpréter l’étendue d’une série présentée sous forme de données brutes, d’un tableau, d’un diagramme en barres, d’un diagramme circulaire',
  ['Étendue = plus grande valeur − plus petite valeur. Elle mesure à quel point les valeurs sont **dispersées**.'],
  (rng) => {
    const vals = distinct(rng, 6, () => rng.int(-5, 35));
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return {
      prompt: `Températures relevées (°C) : ${vals.map(sgn).join(' ; ')}. Quelle est l’étendue ?`,
      answer: num(max - min, '°C'),
      traps: traps(r(max - min), [
        [max, 'L’étendue est un **écart** : plus grande − plus petite.'],
        [max + min, 'C’est une soustraction.'],
      ]),
      hint: 'Plus grande valeur − plus petite valeur.',
      steps: [
        `Plus grande : ${sgn(max)} ; plus petite : ${sgn(min)}.`,
        `${sgn(max)} − ${min < 0 ? `(${sgn(min)})` : min} = **${max - min} °C**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const valeurExtreme = S(
  'm4-valeur-extreme',
  'Moyenne, médiane et valeur extrême',
  'Comprendre l’évolution de la médiane et de la moyenne quand on ajoute une valeur extrême',
  ['Une valeur très grande (ou très petite) fait beaucoup bouger la **moyenne**, mais presque pas la **médiane**.'],
  (rng) => {
    const who = rng.pick(NAMES);
    return {
      prompt: `Dans une rue, 9 familles ont des salaires proches, et un milliardaire emménage. Quel indicateur change beaucoup ?`,
      ...choice(rng, 'La moyenne', [
        {
          label: 'La médiane',
          why: 'La médiane dépend du rang des valeurs : une seule valeur énorme la bouge à peine.',
        },
        { label: 'Aucun des deux', why: 'La moyenne additionne toutes les valeurs : elle grimpe beaucoup.' },
      ]),
      hint: `${who} se demande : quel indicateur utilise la **somme** de toutes les valeurs ?`,
      steps: [
        'La moyenne additionne toutes les valeurs : une valeur énorme la fait grimper.',
        'La médiane bouge à peine : c’est **la moyenne** qui change beaucoup.',
      ],
      targetSeconds: 25,
    };
  },
);

const statistiques = C(
  'm4-statistiques',
  'donnees',
  'Statistiques',
  [moyennePonderee, mediane, etendue, valeurExtreme],
  bossOf(
    [
      S(
        'm4-boss-stats-note',
        'Problème : la note manquante',
        'Résoudre des problèmes faisant intervenir les différents indicateurs',
        ['Pour avoir 12 de moyenne sur 4 notes, il faut 4 × 12 = 48 points en tout.'],
        (rng) => {
          const target = rng.int(11, 14);
          let notes: number[] = [];
          let need = -1;
          while (need < 0 || need > 20) {
            notes = Array.from({ length: 3 }, () => rng.int(8, 17));
            need = target * 4 - notes.reduce((x, y) => x + y, 0);
          }
          return {
            prompt: `${rng.pick(NAMES)} a eu ${notes.join(', ')} aux trois premiers contrôles. Quelle note doit-il avoir au 4e pour avoir exactement ${target} de moyenne ?`,
            answer: num(need),
            traps: traps(r(need), [[target, 'Il faut compenser les autres notes : calcule le total nécessaire.']]),
            hint: `Pour ${target} de moyenne sur 4 notes, il faut ${target} × 4 points en tout.`,
            steps: [
              `Total nécessaire : ${target} × 4 = ${target * 4}. Déjà : ${notes.reduce((a, b) => a + b, 0)}.`,
              `Note manquante : ${target * 4} − ${notes.reduce((a, b) => a + b, 0)} = **${need}**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm4-boss-stats-comparer',
        'Problème : deux équipes',
        'Résoudre des problèmes de comparaison de séries statistiques',
        ['Deux séries de même moyenne peuvent être très différentes : l’étendue dit laquelle est la plus régulière.'],
        (rng) => {
          const m = rng.int(10, 14);
          const a = [m - 1, m, m + 1];
          const d = rng.int(4, 6);
          const b = [m - d, m, m + d];
          return {
            prompt: `Équipe A : scores ${a.join(', ')}. Équipe B : ${b.join(', ')}. Même moyenne. Quelle équipe est la plus régulière ?`,
            ...choice(
              rng,
              'L’équipe A',
              [{ label: 'L’équipe B', why: `Étendue de B : ${2 * d}, bien plus grande que celle de A (2).` }],
              true,
            ),
            hint: 'Compare les étendues.',
            steps: [
              `Étendue A : ${a[2]} − ${a[0]} = 2. Étendue B : ${b[2]} − ${b[0]} = ${2 * d}.`,
              'La plus petite étendue est la plus régulière : **l’équipe A**.',
            ],
            targetSeconds: 40,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-stats-piege',
        'Piège : la médiane sans ranger',
        'Déterminer une médiane et l’interpréter dans le cas d’une série de petit effectif présentée sous forme de données brutes',
        ['La médiane n’est pas la valeur écrite au milieu de la liste : il faut d’abord ranger.'],
        (rng) => {
          const vals = distinct(rng, 5, () => rng.int(1, 20));
          const sorted = [...vals].sort((a, b) => a - b);
          const med = sorted[2] ?? 0;
          if (vals[2] === med) {
            const tmp = vals[0] ?? 0;
            vals[0] = med;
            vals[2] = tmp;
          }
          return {
            prompt: `Quelle est la médiane de : ${vals.join(' ; ')} ?`,
            answer: num(med),
            traps: traps(r(med), [[vals[2] ?? 0, 'Il faut d’abord ranger les valeurs dans l’ordre.']]),
            hint: 'Range d’abord les valeurs.',
            steps: [`Rangées : ${sorted.join(' ; ')}.`, `Au milieu : **${med}**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);

// ——— Probabilités ———

const contraire = S(
  'm4-proba-contraire',
  'Évènement contraire',
  'Calculer la probabilité d’un évènement et de l’évènement contraire',
  ['P(non A) = 1 − P(A). Si la probabilité qu’il pleuve est 0,3, celle qu’il ne pleuve pas est 0,7.'],
  (rng, level) => {
    if (level === 1) {
      const p = dec(rng.int(1, 99), 2);
      const q = r(100 - p.n * (100 / p.d), 100);
      return {
        prompt: `La probabilité de gagner à un jeu est ${fmt(p)}. Quelle est la probabilité de ne pas gagner ?`,
        answer: num(q),
        traps: traps(q, [[p, 'Ne pas gagner, c’est l’évènement **contraire**.']]),
        hint: 'L’évènement contraire : P(contraire) = 1 − P(gagner).',
        steps: [`1 − ${fmt(p)}.`, `= **${fmt(q)}**.`],
        targetSeconds: 15,
      };
    }
    const d = rng.int(5, 12);
    const n = rng.int(1, d - 1);
    return {
      prompt: `P(A) = ${frac(r(n, d))}. Quelle est la probabilité de l’évènement contraire de A ?`,
      answer: fraction(r(d - n, d)),
      traps: traps(r(d - n, d), [[r(n, d), 'L’évènement contraire a la probabilité 1 − P(A).']]),
      hint: 'La probabilité du contraire vaut 1 − P(A).',
      steps: [`1 − ${frac(r(n, d))} = {${d}/${d}} − ${frac(r(n, d))}.`, `= **${frac(r(d - n, d))}**.`],
      targetSeconds: 20,
    };
  },
);

const deuxEpreuves = S(
  'm4-deux-epreuves',
  'Expériences à deux épreuves',
  'Exemples simples d’expériences aléatoires à deux épreuves (par exemple, lancer de deux pièces, d’une pièce et d’un dé, de deux dés, etc.)',
  [
    'On liste toutes les issues avec un **tableau** ou un **arbre** : deux pièces → PP, PF, FP, FF (4 issues).',
    'Deux dés → 6 × 6 = 36 issues.',
  ],
  (rng, level) => {
    if (level === 1) {
      const target = rng.pick([
        { t: 'deux « pile »', n: 1 },
        { t: 'un « pile » et un « face »', n: 2 },
        { t: 'au moins un « pile »', n: 3 },
      ]);
      return {
        prompt: `On lance deux pièces. Quelle est la probabilité d’obtenir ${target.t} ?`,
        answer: fraction(r(target.n, 4)),
        traps: traps(r(target.n, 4), [[r(1, 3), 'Il y a 4 issues : PP, PF, FP, FF (PF et FP sont différentes).']]),
        hint: 'Liste les 4 issues : PP, PF, FP, FF.',
        steps: [
          'Issues : PP, PF, FP, FF (4 issues).',
          `Favorables : ${target.n}. Probabilité **${frac(r(target.n, 4))}**.`,
        ],
        targetSeconds: 30,
      };
    }
    const sum = rng.int(2, 12);
    const ways = 6 - Math.abs(7 - sum);
    return {
      prompt: `On lance deux dés équilibrés et on additionne. Quelle est la probabilité d’obtenir ${sum} ?`,
      answer: fraction(r(ways, 36)),
      traps: traps(r(ways, 36), [[r(1, 11), 'Les 11 sommes ne sont pas équiprobables : il y a 36 issues.']]),
      hint: 'Fais un tableau 6 × 6 des sommes.',
      steps: [
        `Dans le tableau 6 × 6 (36 issues), la somme ${sum} apparaît ${ways} fois.`,
        `Probabilité : ${frac(r(ways, 36)) === `{${ways}/36}` ? '' : `{${ways}/36} = `}**${frac(r(ways, 36))}**.`,
      ],
      targetSeconds: 50,
    };
  },
);

const vocabEnsembliste = S(
  'm4-reunion-intersection',
  'Réunion, intersection, impossible',
  'Définir : complémentaire, réunion, intersection, ensemble vide (évènement impossible)',
  [
    'A ∩ B (« A et B ») : les deux à la fois. A ∪ B (« A ou B ») : au moins l’un des deux.',
    'Un évènement impossible correspond à l’ensemble vide.',
  ],
  (rng) => {
    const q = rng.pick([
      {
        p: 'On lance un dé. A : « pair », B : « supérieur à 3 ». Combien d’issues réalisent A ∩ B ?',
        a: 2,
        w: 4,
        why: 'A ∩ B : pair **et** > 3 → 4 et 6.',
      },
      {
        p: 'On lance un dé. A : « pair », B : « supérieur à 3 ». Combien d’issues réalisent A ∪ B ?',
        a: 4,
        w: 6,
        why: 'A ∪ B : pair **ou** > 3 → 2, 4, 5, 6.',
      },
      {
        p: 'On lance un dé. A : « 1 », B : « pair ». Combien d’issues réalisent A ∩ B ?',
        a: 0,
        w: 4,
        why: '1 n’est pas pair : A ∩ B est impossible (ensemble vide).',
      },
    ]);
    return {
      prompt: q.p,
      answer: num(q.a),
      traps: traps(r(q.a), [[q.w, q.why]]),
      hint: '∩ : « et » (les deux à la fois) ; ∪ : « ou » (au moins un).',
      steps: [q.why, `Il y a **${q.a}** issue${q.a > 1 ? 's' : ''}.`],
      targetSeconds: 30,
    };
  },
);

const probabilites = C(
  'm4-probabilites',
  'donnees',
  'Probabilités',
  [contraire, deuxEpreuves, vocabEnsembliste],
  bossOf(
    [
      S(
        'm4-boss-probas-menu',
        'Problème : le menu surprise',
        'Exemples simples d’expériences aléatoires à deux épreuves',
        ['2 entrées et 3 plats : 2 × 3 = 6 menus possibles, chacun avec la probabilité {1/6}.'],
        (rng) => {
          const e = rng.int(2, 4);
          const p = rng.int(2, 5);
          return {
            prompt: `Une cantine tire au hasard une entrée parmi ${e} et un plat parmi ${p}. Quelle est la probabilité d’avoir exactement ton entrée et ton plat préférés ?`,
            answer: fraction(r(1, e * p)),
            traps: traps(r(1, e * p), [[r(1, e + p), `On multiplie les choix : ${e} × ${p} menus.`]]),
            hint: 'Combien de menus différents sont possibles ?',
            steps: [`${e} × ${p} = ${e * p} menus équiprobables.`, `Un seul convient : **{1/${e * p}}**.`],
            targetSeconds: 40,
          };
        },
      ),
      S(
        'm4-boss-probas-sondage',
        'Problème : la loterie',
        'Calculer la probabilité d’un évènement et de l’évènement contraire',
        ['P(au moins un) = 1 − P(aucun).'],
        (rng) => {
          const p = rng.pick([r(1, 4), r(1, 5), r(2, 5)]);
          const q = r(p.d - p.n, p.d);
          const both = mul(q, q);
          const atLeast = r(both.d - both.n, both.d);
          return {
            prompt: `À chaque tirage, la probabilité de gagner est ${frac(p)}. On joue deux fois (tirages indépendants). Quelle est la probabilité de gagner au moins une fois ?`,
            answer: fraction(atLeast),
            traps: traps(atLeast, [
              [mul(p, r(2)), 'On ne double pas : calcule d’abord la probabilité de perdre les deux fois.'],
            ]),
            hint: 'Calcule la probabilité de perdre deux fois, puis prends le contraire.',
            steps: [
              `Perdre une fois : ${frac(q)} ; deux fois : ${frac(q)} × ${frac(q)} = ${frac(both)}.`,
              `Au moins une victoire : 1 − ${frac(both)} = **${frac(atLeast)}**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-probas-piege',
        'Piège : 2 issues, 1 chance sur 2 ?',
        'Calculer la probabilité d’un évènement et de l’évènement contraire',
        ['Deux issues ne veut pas dire une chance sur deux : tout dépend si elles sont équiprobables.'],
        (rng) => {
          const red = rng.int(1, 3);
          const blue = rng.int(red + 2, 9);
          return {
            prompt: `Un sac contient ${red} boule${red > 1 ? 's' : ''} rouge${red > 1 ? 's' : ''} et ${blue} bleues. Tirer une rouge : est-ce une chance sur deux, puisqu’il y a deux couleurs ?`,
            ...choice(rng, `Non : ${frac(r(red, red + blue))}`, [
              { label: 'Oui : {1/2}', why: 'Les deux couleurs n’ont pas autant de boules.' },
            ]),
            hint: 'Compte les boules, pas les couleurs.',
            steps: [
              `${red} rouge${red > 1 ? 's' : ''} sur ${red + blue} boules.`,
              `**Non : ${frac(r(red, red + blue))}**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

// ——— Proportionnalité ———

const quatriemeProportionnelle = S(
  'm4-quatrieme-proportionnelle',
  'Quatrième proportionnelle',
  'Déterminer une quatrième proportionnelle',
  ['Si 3 kg coûtent 7,50 €, 5 kg coûtent 7,50 × 5 ÷ 3 = 12,50 € (produit en croix ou retour à l’unité).'],
  (rng) => {
    const a = rng.int(2, 9);
    let b = rng.int(2, 15);
    if (b === a) b++;
    const u = r(rng.int(5, 40), rng.pick([1, 2, 4, 5, 10]));
    const ya = mul(u, r(a));
    const yb = mul(u, r(b));
    return {
      prompt: `Le prix est proportionnel à la masse. ${a} kg coûtent ${fmt(ya)} €. Combien coûtent ${b} kg ?`,
      answer: num(yb, '€'),
      traps: traps(yb, [[mul(ya, r(a, b)), 'Attention à l’ordre : prix × nouvelle masse ÷ ancienne masse.']]),
      hint: `Calcule d’abord le prix d’un seul kilo : ${fmt(ya)} ÷ ${a}.`,
      steps: [`Prix d’un kg : ${fmt(ya)} ÷ ${a} = ${fmt(u)} €.`, `${b} kg : ${b} × ${fmt(u)} = **${fmt(yb)} €**.`],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const coefficientMultiplicateur = S(
  'm4-coefficient-multiplicateur',
  'Augmentation, diminution en pourcentage',
  'Rendre compte d’une augmentation ou une diminution exprimée en pourcentages au moyen d’un coefficient multiplicateur',
  [
    'Augmenter de t % : multiplier par **1 + t/100** (+20 % → × 1,2). Diminuer de t % : multiplier par **1 − t/100** (−20 % → × 0,8).',
  ],
  (rng, level) => {
    const t = rng.pick([5, 10, 15, 20, 25, 30, 40, 50]);
    const up = rng.int(0, 1) === 1;
    const k = r(100 + (up ? t : -t), 100);
    if (level === 1) {
      return {
        prompt: `${up ? 'Augmenter' : 'Diminuer'} de ${t} %, c’est multiplier par quel nombre ?`,
        answer: num(k),
        traps: traps(k, [
          [r(t, 100), `Il faut garder le prix de départ (100 %) ${up ? 'et ajouter' : 'et enlever'} ${t} %.`],
          [
            r(100 + (up ? -t : t), 100),
            up
              ? 'Une augmentation : le coefficient est plus grand que 1.'
              : 'Une diminution : le coefficient est plus petit que 1.',
          ],
        ]),
        hint: `100 % ${up ? '+' : '−'} ${t} % = ${100 + (up ? t : -t)} %.`,
        steps: [`100 % ${up ? '+' : '−'} ${t} % = ${100 + (up ? t : -t)} %.`, `Coefficient : **${fmt(k)}**.`],
        targetSeconds: 20,
      };
    }
    const price = rng.int(2, 40) * 10;
    const res = mul(r(price), k);
    return {
      prompt: `Un article à ${price} € ${up ? 'augmente' : 'baisse'} de ${t} %. Quel est son nouveau prix ?`,
      answer: num(res, '€'),
      traps: traps(res, [
        [mul(r(price), r(100 + (up ? -t : t), 100)), up ? 'C’est une augmentation.' : 'C’est une baisse.'],
        [r(price + (up ? t : -t)), `On ${up ? 'n’ajoute' : 'n’enlève'} pas ${t} €, mais ${t} %.`],
      ]),
      hint: `Multiplie ${price} par ${fmt(k)}.`,
      steps: [`Coefficient : ${fmt(k)}.`, `${price} × ${fmt(k)} = **${fmt(res)} €**.`],
      targetSeconds: 35,
    };
  },
  { advice: 'calculatrice' },
);

const partage = S(
  'm4-partage-proportionnel',
  'Partage proportionnel, ratio',
  'Résoudre des problèmes de partage proportionnel',
  ['Partager 60 € dans le ratio 1 : 2 → 3 parts égales de 20 € ; l’un reçoit 1 part (20 €), l’autre 2 parts (40 €).'],
  (rng) => {
    const p = rng.int(1, 4);
    const q = rng.int(p + 1, 6);
    const part = rng.int(3, 20);
    const total = (p + q) * part;
    const [a, b] = distinct(rng, 2, () => rng.pick(NAMES));
    return {
      prompt: `${a} et ${b} se partagent ${total} € dans le ratio ${p} : ${q}. Combien reçoit ${b} ?`,
      answer: num(q * part, '€'),
      traps: traps(r(q * part), [
        [p * part, `Ça, c’est la part de ${a}.`],
        [r(total, 2), 'Le partage n’est pas équitable : il suit le ratio.'],
      ]),
      hint: `Le ratio ${p} : ${q} fait ${p + q} parts égales.`,
      steps: [
        `${p} + ${q} = ${p + q} parts : une part vaut ${total} ÷ ${p + q} = ${part} €.`,
        `${b} reçoit ${q} parts : **${q * part} €**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const grandeursQuotients = S(
  'm4-grandeurs-quotients',
  'Vitesse moyenne',
  'Utiliser des grandeurs quotients, avec ou sans unités',
  ['Vitesse = distance ÷ durée. 150 km en 2 h → 75 km/h. Distance = vitesse × durée.'],
  (rng, level) => {
    const v = rng.int(4, 13) * 10;
    const h = level === 1 ? rng.int(2, 5) : rng.pick([r(1, 2), r(3, 2), r(5, 2), r(1, 4), r(3, 4)]);
    const hR = typeof h === 'number' ? r(h) : h;
    const d = mul(r(v), hR);
    const durText = typeof h === 'number' ? `${h} h` : `${fmt(hR)} h`;
    return {
      prompt: `Une voiture parcourt ${fmt(d)} km en ${durText}. Quelle est sa vitesse moyenne, en km/h ?`,
      answer: num(v, 'km/h'),
      traps: traps(r(v), [[mul(d, hR), 'Vitesse = distance **÷** durée.']]),
      hint: 'Vitesse = distance ÷ durée (en heures).',
      steps: [`${fmt(d)} ÷ ${fmt(hR)}.`, `= **${v} km/h**.`],
      targetSeconds: 30,
    };
  },
  { advice: 'calculatrice' },
);

const proportionnalite = C(
  'm4-proportionnalite',
  'fonctions',
  'Proportionnalité et pourcentages',
  [quatriemeProportionnelle, coefficientMultiplicateur, partage, grandeursQuotients],
  bossOf(
    [
      S(
        'm4-boss-propor-trajet',
        'Problème : le trajet en vélo',
        'Utiliser des grandeurs quotients, avec ou sans unités',
        ['Durée = distance ÷ vitesse. 30 km à 20 km/h → 1,5 h = 1 h 30.'],
        (rng) => {
          const v = rng.pick([12, 15, 20]);
          const minutes = rng.pick([15, 30, 45, 90]);
          const d = (v * minutes) / 60;
          return {
            prompt: `${rng.pick(NAMES)} roule à ${v} km/h pour aller au collège, à ${fmt(r(Math.round(d * 100), 100))} km. Combien de minutes dure le trajet ?`,
            answer: num(minutes, 'min'),
            traps: traps(r(minutes), [
              [r(Math.round((d / v) * 100), 100), 'Ça, c’est en heures : convertis en minutes (× 60).'],
            ]),
            hint: 'Durée en heures = distance ÷ vitesse, puis × 60.',
            steps: [
              `${fmt(r(Math.round(d * 100), 100))} ÷ ${v} = ${fmt(r(minutes, 60))} h.`,
              `${fmt(r(minutes, 60))} × 60 = **${minutes} min**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm4-boss-propor-hausse-baisse',
        'Problème : hausse puis baisse',
        'Rendre compte d’une augmentation ou une diminution exprimée en pourcentages au moyen d’un coefficient multiplicateur',
        ['+ 10 % puis − 10 % : × 1,1 × 0,9 = × 0,99. On ne revient pas au prix de départ !'],
        (rng) => {
          const t = rng.pick([10, 20, 50]);
          const p = rng.int(2, 10) * 100;
          const res = mul(mul(r(p), r(100 + t, 100)), r(100 - t, 100));
          return {
            prompt: `Un vélo à ${p} € augmente de ${t} %, puis le nouveau prix baisse de ${t} %. Quel est le prix final ?`,
            answer: num(res, '€'),
            traps: traps(res, [[p, 'La baisse porte sur le **nouveau** prix, plus grand.']]),
            hint: `Multiplie par ${fmt(r(100 + t, 100))}, puis par ${fmt(r(100 - t, 100))}.`,
            steps: [
              `${p} × ${fmt(r(100 + t, 100))} = ${fmt(mul(r(p), r(100 + t, 100)))} €.`,
              `× ${fmt(r(100 - t, 100))} = **${fmt(res)} €**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm4-boss-propor-piege',
        'Piège : la moyenne des vitesses',
        'Utiliser des grandeurs quotients, avec ou sans unités',
        ['Vitesse moyenne = distance totale ÷ durée totale, pas la moyenne des vitesses.'],
        (rng) => {
          const d = 60;
          const v1 = 30;
          const v2 = rng.pick([60, 20]);
          const t = d / v1 + d / v2;
          const vm = r(2 * d * 10, Math.round(t * 10));
          return {
            prompt: `Un cycliste fait ${d} km à ${v1} km/h, puis revient (${d} km) à ${v2} km/h. Sa vitesse moyenne sur l’aller-retour est-elle ${(v1 + v2) / 2} km/h ?`,
            ...choice(rng, `Non : ${fmt(vm)} km/h`, [
              { label: `Oui : ${(v1 + v2) / 2} km/h`, why: 'Il passe plus de temps à la vitesse la plus lente.' },
            ]),
            hint: 'Calcule la durée totale et la distance totale.',
            steps: [
              `Durées : ${d / v1} h + ${fmt(r(d, v2))} h = ${fmt(r(Math.round(t * 10), 10))} h pour ${2 * d} km.`,
              `Vitesse moyenne : ${2 * d} ÷ ${fmt(r(Math.round(t * 10), 10))} = **${fmt(vm)} km/h**, donc non.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
  ),
);

// ——— Fonctions ———

const programmeCalcul = S(
  'm4-programme-calcul',
  'Programme de calcul',
  'Savoir appliquer un programme de calcul à deux (plusieurs) étapes à un nombre simple puis à une variable',
  ['On applique les étapes **dans l’ordre**. Avec x : « multiplier par 3 puis ajouter 4 » donne 3x + 4.'],
  (rng, level) => {
    const a = rng.int(2, 6);
    const b = rng.int(1, 9);
    if (level === 3) {
      const good = `${a}(x + ${b})`;
      return {
        prompt: `Programme : choisir x, ajouter ${b}, multiplier le résultat par ${a}. Quelle expression obtient-on ?`,
        ...choice(rng, good, [
          { label: `${a}x + ${b}`, why: `On ajoute ${b} **avant** de multiplier : il faut des parenthèses.` },
          { label: `x + ${a * b}`, why: 'Toute la somme est multipliée.' },
        ]),
        hint: 'Écris chaque étape : x, puis x + …, puis (x + …) × …',
        steps: [`x → x + ${b} → (x + ${b}) × ${a}.`, `Expression : **${good}**.`],
        targetSeconds: 30,
      };
    }
    const x = level === 1 ? rng.int(1, 10) : -rng.int(1, 10);
    const res = (x + b) * a;
    return {
      prompt: `Programme : choisir un nombre, ajouter ${b}, multiplier par ${a}. Quel résultat avec ${sgn(x)} ?`,
      answer: num(res),
      traps: traps(r(res), [[x * a + b, `On ajoute ${b} **d’abord**.`]]),
      hint: 'Fais les étapes dans l’ordre.',
      steps: [`${sgn(x)} + ${b} = ${sgn(x + b)}.`, `${sgn(x + b)} × ${a} = **${sgn(res)}**.`],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const remonter = S(
  'm4-remonter-programme',
  'Remonter un programme de calcul',
  'Savoir retrouver le nombre de départ après avoir remonté un programme de calcul simple',
  [
    'On part de la fin et on fait les **opérations inverses** dans l’ordre inverse : « ×3 puis +4 » se remonte par « −4 puis ÷3 ».',
  ],
  (rng) => {
    const a = rng.int(2, 9);
    const b = rng.int(1, 15);
    const x = rng.int(1, 12);
    const res = a * x + b;
    return {
      prompt: `Programme : multiplier par ${a}, puis ajouter ${b}. On obtient ${res}. Quel était le nombre de départ ?`,
      answer: num(x),
      traps: traps(r(x), [
        [r(res, a), `Remonte d’abord le « + ${b} ».`],
        [r(res - b), `Il faut encore diviser par ${a}.`],
      ]),
      hint: `Opérations inverses dans l’ordre inverse : −${b}, puis ÷${a}.`,
      steps: [`${res} − ${b} = ${res - b}.`, `${res - b} ÷ ${a} = **${x}**.`],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const formuleGrandeur = S(
  'm4-formule',
  'Une grandeur en fonction d’une autre',
  'Produire une formule littérale représentant la dépendance d’une grandeur en fonction d’une autre',
  ['Prix = 2 × nombre de cafés + 5 (pour une entrée à 5 €) : on écrit P = 2n + 5, puis on remplace n par la valeur.'],
  (rng) => {
    const per = rng.int(2, 9);
    const fixed = rng.int(3, 20);
    const n = rng.int(2, 15);
    return {
      prompt: `Une salle de jeux coûte ${fixed} € l’entrée plus ${per} € par partie. Avec la formule P = ${per}n + ${fixed}, combien paie-t-on pour ${n} parties ?`,
      answer: num(per * n + fixed, '€'),
      traps: traps(r(per * n + fixed), [
        [per * n, `N’oublie pas l’entrée (${fixed} €).`],
        [(per + fixed) * n, 'L’entrée ne se paie qu’une fois.'],
      ]),
      hint: `Remplace n par ${n}.`,
      steps: [`P = ${per} × ${n} + ${fixed}.`, `= ${per * n} + ${fixed} = **${per * n + fixed} €**.`],
      targetSeconds: 30,
    };
  },
);

const lireGraphique = S(
  'm4-lire-graphique',
  'Lire un graphique',
  'Représenter l’expression d’une grandeur en fonction d’une autre par un graphique',
  [
    'Pour lire sur un graphique : pars de la valeur sur l’axe horizontal, monte jusqu’à la courbe, puis lis sur l’axe vertical.',
  ],
  (rng) => {
    const a = rng.int(1, 3);
    const b = rng.int(0, 4);
    const pts = Array.from({ length: 7 }, (_, x) => ({ x, y: a * x + b }));
    const x = rng.int(1, 6);
    return {
      prompt: `Ce graphique donne le prix (en €) en fonction du nombre de tickets. Combien coûtent ${x} tickets ?`,
      figure: { kind: 'chart', xLabel: 'Tickets', yLabel: 'Prix (€)', points: pts, line: true },
      answer: num(a * x + b, '€'),
      traps: traps(r(a * x + b), [[x, 'Lis la valeur sur l’axe **vertical** (le prix).']]),
      hint: `Pars de ${x} sur l’axe horizontal, monte jusqu’à la droite.`,
      steps: [
        `Au-dessus de ${x}, la droite est à la hauteur ${a * x + b}.`,
        `${x} tickets coûtent **${a * x + b} €**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const fonctions = C(
  'm4-fonctions',
  'fonctions',
  'Programmes de calcul et fonctions',
  [programmeCalcul, remonter, formuleGrandeur, lireGraphique],
  bossOf(
    [
      S(
        'm4-boss-fonctions-taxi',
        'Problème : le taxi',
        'Produire une formule littérale représentant la dépendance d’une grandeur en fonction d’une autre',
        ['Prix = prise en charge + prix au km × distance.'],
        (rng) => {
          const base = rng.pick([3, 4, 5]);
          const km = r(rng.pick([12, 15, 18, 20]), 10);
          const d = rng.int(4, 25);
          const res = mul(km, r(d));
          const total = r(res.n * 1 + base * res.d, res.d);
          return {
            prompt: `Un taxi coûte ${base} € de prise en charge plus ${fmt(km)} € par km. Combien coûte une course de ${d} km ?`,
            answer: num(total, '€'),
            traps: traps(total, [[res, `N’oublie pas la prise en charge (${base} €).`]]),
            hint: `Prix = prise en charge + prix au km × nombre de km.`,
            steps: [`${fmt(km)} × ${d} = ${fmt(res)} €.`, `${fmt(res)} + ${base} = **${fmt(total)} €**.`],
            targetSeconds: 45,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-fonctions-mystere',
        'Problème : le nombre mystère',
        'Savoir retrouver le nombre de départ après avoir remonté un programme de calcul simple',
        ['On remonte : opérations inverses, dans l’ordre inverse.'],
        (rng) => {
          const x = rng.int(2, 15);
          const a = rng.int(2, 5);
          const b = rng.int(2, 9);
          const res = (x - b) * a;
          return {
            prompt: `Je choisis un nombre, je lui retire ${b}, puis je multiplie par ${a}. J’obtiens ${sgn(res)}. Quel nombre ai-je choisi ?`,
            answer: num(x),
            traps: traps(r(x), [
              [r(res, a), `Il faut encore ajouter ${b}.`],
              [r(res + b, a), 'Remonte dans l’ordre inverse : d’abord ÷, puis +.'],
            ]),
            hint: `Divise par ${a}, puis ajoute ${b}.`,
            steps: [`${sgn(res)} ÷ ${a} = ${sgn(res / a)}.`, `${sgn(res / a)} + ${b} = **${x}**.`],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-fonctions-piege',
        'Piège : l’ordre des étapes',
        'Savoir appliquer un programme de calcul à deux (plusieurs) étapes à un nombre simple puis à une variable',
        ['« Ajouter 2 puis multiplier par 5 » donne 5(x + 2) = 5x + 10, pas 5x + 2.'],
        (rng) => {
          const a = rng.int(3, 7);
          const b = rng.int(2, 6);
          const good = `${a}x + ${a * b}`;
          return {
            prompt: `Programme : ajouter ${b} à x, puis multiplier par ${a}. Quelle expression développée obtient-on ?`,
            ...choice(rng, good, [
              { label: `${a}x + ${b}`, why: `Le ${b} est aussi multiplié par ${a}.` },
              { label: `${a + b}x`, why: 'On ne mélange pas les x et les nombres.' },
            ]),
            hint: `Écris ${a}(x + ${b}) puis développe.`,
            steps: [`${a}(x + ${b}) = ${a}x + ${a} × ${b}.`, `= **${good}**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);

// ——— Algorithmique ———

const conditionnelle = S(
  'm4-conditionnelle',
  'Instruction conditionnelle',
  'Écrire des instructions conditionnelles',
  [
    '« si condition alors … sinon … » : on teste la condition ; si elle est vraie on fait le premier bloc, sinon le second.',
  ],
  (rng) => {
    const limit = rng.int(10, 20);
    const n = rng.int(1, 30);
    const program: Block[] = [
      { op: 'ask', text: 'Quel nombre ?', answer: n },
      {
        op: 'if',
        cond: `réponse > ${limit}`,
        then: [{ op: 'say', expr: 'réponse − 10' }],
        else: [{ op: 'say', expr: 'réponse × 2' }],
      },
    ];
    const res = n > limit ? n - 10 : n * 2;
    return {
      prompt: `On répond ${n}. Que dit le lutin ?`,
      figure: { kind: 'blocks', program },
      answer: num(res),
      traps: traps(r(res), [
        [n > limit ? n * 2 : n - 10, `${n} > ${limit} est ${n > limit ? 'vrai' : 'faux'} : regarde le bon bloc.`],
      ]),
      hint: `Teste d’abord : ${n} > ${limit} ?`,
      steps: [
        `${n} > ${limit} est ${n > limit ? 'vrai' : 'faux'} : on exécute le bloc « ${n > limit ? 'alors' : 'sinon'} ».`,
        `Le lutin dit **${sgn(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const variable = S(
  'm4-variable',
  'Suivre une variable',
  'Manipuler une variable',
  [
    'Une **variable** est une boîte qui contient un nombre. « mettre x à 5 » remplace le contenu ; « ajouter 2 à x » l’augmente.',
  ],
  (rng) => {
    const a = rng.int(1, 9);
    const b = rng.int(2, 5);
    const c = rng.int(1, 9);
    const program: Block[] = [
      { op: 'set', variable: 'x', expr: String(a) },
      { op: 'set', variable: 'x', expr: `x × ${b}` },
      { op: 'change', variable: 'x', by: String(c) },
      { op: 'say', expr: 'x' },
    ];
    const res = a * b + c;
    return {
      prompt: 'Que dit le lutin ?',
      figure: { kind: 'blocks', program },
      answer: num(res),
      traps: traps(r(res), [
        [a + c, `La 2e ligne change x : x devient ${a} × ${b}.`],
        [(a + c) * b, 'Suis l’ordre des blocs.'],
      ]),
      hint: 'Suis la valeur de x ligne par ligne.',
      steps: [`x = ${a}, puis x = ${a} × ${b} = ${a * b}.`, `Puis x = ${a * b} + ${c} = **${res}**.`],
      targetSeconds: 30,
    };
  },
);

const modifierProgramme = S(
  'm4-modifier-programme',
  'Modifier un programme',
  'Modifier un programme donné pour changer son comportement',
  [
    'Pour changer le résultat d’une boucle, on peut changer le **nombre de répétitions** ou ce qu’on ajoute à chaque tour.',
  ],
  (rng) => {
    const step = rng.int(2, 6);
    const target = step * rng.int(4, 12);
    const times = target / step;
    return {
      prompt: `Le programme part de 0 et répète « ajouter ${step} ». Combien de répétitions faut-il pour finir à ${target} ?`,
      figure: {
        kind: 'blocks',
        program: [
          { op: 'set', variable: 'total', expr: '0' },
          { op: 'repeat', times: 0, body: [{ op: 'change', variable: 'total', by: String(step) }] },
          { op: 'say', expr: 'total' },
        ],
      },
      answer: num(times),
      traps: traps(r(times), [[target, `Chaque tour ajoute ${step} : combien de tours pour ${target} ?`]]),
      hint: `Combien de fois ${step} dans ${target} ?`,
      steps: [`On ajoute ${step} à chaque tour.`, `${target} ÷ ${step} = **${times}** répétitions.`],
      targetSeconds: 25,
    };
  },
);

const algorithmique = C(
  'm4-algorithmique',
  'informatique',
  'Algorithmique',
  [conditionnelle, variable, modifierProgramme],
  bossOf(
    [
      S(
        'm4-boss-algo-ticket',
        'Problème : le prix du billet',
        'Représenter des conditions simples',
        ['Un programme de tarif : si l’âge est inférieur à 12, demi-tarif, sinon plein tarif.'],
        (rng) => {
          const full = rng.int(8, 16) * 2;
          const age = rng.int(5, 40);
          const program: Block[] = [
            { op: 'ask', text: 'Ton âge ?', answer: age },
            {
              op: 'if',
              cond: 'réponse < 12',
              then: [{ op: 'say', expr: `${full} ÷ 2` }],
              else: [{ op: 'say', expr: String(full) }],
            },
          ];
          const res = age < 12 ? full / 2 : full;
          return {
            prompt: `${rng.pick(NAMES)} a ${age} ans. Combien paie-t-il ?`,
            figure: { kind: 'blocks', program },
            answer: num(res, '€'),
            traps: traps(r(res), [[age < 12 ? full : full / 2, `${age} < 12 est ${age < 12 ? 'vrai' : 'faux'}.`]]),
            hint: `Teste ${age} < 12.`,
            steps: [`${age} < 12 est ${age < 12 ? 'vrai' : 'faux'}.`, `Il paie **${res} €**.`],
            targetSeconds: 30,
          };
        },
      ),
      S(
        'm4-boss-algo-compteur',
        'Problème : le compteur de points',
        'Manipuler une variable',
        ['Dans une boucle, la variable change à chaque tour : suis-la tour par tour.'],
        (rng) => {
          const times = rng.int(3, 6);
          const start = rng.int(1, 3);
          let v = start;
          for (let i = 0; i < times; i++) v *= 2;
          return {
            prompt: 'Que dit le lutin ?',
            figure: {
              kind: 'blocks',
              program: [
                { op: 'set', variable: 'points', expr: String(start) },
                { op: 'repeat', times, body: [{ op: 'set', variable: 'points', expr: 'points × 2' }] },
                { op: 'say', expr: 'points' },
              ],
            },
            answer: num(v),
            traps: traps(r(v), [[start * 2 * times, `On double à chaque tour : ce n’est pas × 2 × ${times}.`]]),
            hint: 'Double la valeur à chaque tour.',
            steps: [`${start} doublé ${times} fois : ${start} × 2^${times}.`, `= **${v}**.`],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-algo-piege',
        'Piège : strictement ou pas ?',
        'Représenter des conditions simples',
        ['« réponse > 10 » est **faux** si la réponse vaut 10 : il faudrait « ≥ ».'],
        (rng) => {
          const limit = rng.int(10, 20);
          const program: Block[] = [
            { op: 'ask', text: 'Score ?', answer: limit },
            {
              op: 'if',
              cond: `réponse > ${limit}`,
              then: [{ op: 'say', expr: '1' }],
              else: [{ op: 'say', expr: '0' }],
            },
          ];
          return {
            prompt: `On répond ${limit}. Que dit le lutin ?`,
            figure: { kind: 'blocks', program },
            answer: num(0),
            traps: traps(r(0), [
              [1, `${limit} > ${limit} est faux : ${limit} n’est pas strictement plus grand que lui-même.`],
            ]),
            hint: `${limit} est-il **strictement** plus grand que ${limit} ?`,
            steps: [`${limit} > ${limit} est faux.`, 'On exécute « sinon » : le lutin dit **0**.'],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

export const QUATRIEME_AUTRES: readonly Chapter[] = [
  transformations,
  espace,
  triangles,
  parallelogrammes,
  statistiques,
  probabilites,
  proportionnalite,
  fonctions,
  algorithmique,
];
