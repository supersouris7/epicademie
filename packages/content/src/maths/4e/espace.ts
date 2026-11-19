import { num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C, tenth } from './commun.ts';

const unit = (x: number) => r(Math.round(x));

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

export const espace = C(
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
