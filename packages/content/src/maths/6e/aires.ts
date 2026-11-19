import { num, traps } from '../../build.ts';
import { add, dec, fmt, mul, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C, convert } from './commun.ts';

// ——— Aires ———

const aireRectangle = S(
  'm6-aire-rectangle',
  'Aire du carré et du rectangle',
  'Connaître la formule de l’aire d’un carré ou d’un rectangle',
  [
    'L’**aire** mesure la surface. Rectangle : longueur × largeur. Carré : côté × côté.',
    'Une aire s’écrit en unités « carré » : cm^2, m^2…',
  ],
  (rng, level) => {
    const square = rng.int(0, 2) === 0;
    const L = level === 3 ? dec(rng.int(15, 99), 1) : r(rng.int(3, level === 1 ? 12 : 30));
    const l = square ? L : level === 3 ? r(rng.int(2, 9)) : r(rng.int(2, 12));
    const a = mul(L, l);
    return {
      prompt: square
        ? `Calcule l’aire d’un carré de côté ${fmt(L)} cm.`
        : `Calcule l’aire d’un rectangle de longueur ${fmt(L)} m et de largeur ${fmt(l)} m.`,
      answer: num(a, square ? 'cm^2' : 'm^2'),
      traps: traps(a, [
        [
          square ? mul(L, r(4)) : mul(add(L, l), r(2)),
          'Ça, c’est le périmètre (le tour). L’aire = longueur × largeur.',
        ],
        ...(square ? [[mul(L, r(2)), 'Côté × côté, pas côté × 2.'] as const] : []),
      ]),
      hint: square ? 'Aire du carré = côté × côté.' : 'Aire du rectangle = longueur × largeur.',
      steps: [
        square ? `Aire = ${fmt(L)} × ${fmt(L)}.` : `Aire = ${fmt(L)} × ${fmt(l)}.`,
        `Aire = **${fmt(a)} ${square ? 'cm^2' : 'm^2'}**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const conversionsAire = S(
  'm6-conversions-aire',
  'Convertir des aires',
  'Effectuer des conversions d’aire',
  [
    '1 m^2 = 100 dm^2 (un carré de 1 m de côté contient 10 × 10 carrés de 1 dm).',
    '1 dm^2 = 100 cm^2. Pour les aires, on multiplie ou divise par **100** à chaque unité.',
  ],
  (rng, level) => {
    const units = ['m', 'dm', 'cm'] as const;
    const from = rng.int(0, 2);
    let to = rng.int(0, 2);
    if (to === from) to = from === 2 ? 1 : from + 1;
    const x = level === 1 ? r(rng.int(1, 9)) : level === 2 ? r(rng.int(2, 99)) : dec(rng.int(11, 999), 1);
    const res = convert(x, from, to, 100);
    return {
      prompt: `Complète : ${fmt(x)} ${units[from]}^2 = … ${units[to]}^2`,
      answer: num(res, `${units[to]}^2`),
      traps: traps(res, [
        [convert(x, from, to, 10), 'Pour les aires, c’est × 100 (ou ÷ 100) à chaque unité, pas × 10.'],
      ]),
      hint: 'Pour les aires, on multiplie ou divise par 100 d’une unité à la voisine (1 m^2 vaut 100 dm^2).',
      demo: { kind: 'conversion', table: 'aire', value: x, from: `${units[from]}^2`, to: `${units[to]}^2` },
      steps: [
        `D’une unité d’aire à la voisine, on ${to > from ? 'multiplie' : 'divise'} par 100.`,
        `${fmt(x)} ${units[from]}^2 = **${fmt(res)} ${units[to]}^2**.`,
      ],
      targetSeconds: 25,
    };
  },
  { tools: ['conversion-aire'] },
);

const aireQuadrillage = S(
  'm6-aire-quadrillage',
  'Aire sur un quadrillage',
  'Dans des cas simples, l’élève sait déterminer l’aire d’une surface en s’appuyant sur un quadrillage (automatisme)',
  [
    'Chaque carreau de 1 cm de côté a une aire de 1 cm^2 : on **compte** les carreaux.',
    'Une figure en L : découpe-la en deux rectangles et additionne leurs aires.',
  ],
  (rng) => {
    const W = rng.int(4, 8);
    const H = rng.int(4, 8);
    const w = rng.int(1, W - 1);
    const h = rng.int(1, H - 1);
    const area = W * h + w * (H - h);
    return {
      prompt: 'Chaque carreau mesure 1 cm de côté. Quelle est l’aire de cette figure, en cm^2 ?',
      figure: {
        kind: 'grid',
        xMin: 0,
        xMax: W + 1,
        yMin: 0,
        yMax: H + 1,
        axes: false,
        points: [
          { name: 'A', x: 0, y: 0, color: 'muted' },
          { name: 'B', x: W, y: 0, color: 'muted' },
          { name: 'C', x: W, y: h, color: 'muted' },
          { name: 'D', x: w, y: h, color: 'muted' },
          { name: 'E', x: w, y: H, color: 'muted' },
          { name: 'F', x: 0, y: H, color: 'muted' },
        ],
        segments: [
          ['A', 'B'],
          ['B', 'C'],
          ['C', 'D'],
          ['D', 'E'],
          ['E', 'F'],
          ['F', 'A'],
        ],
      },
      answer: num(area, 'cm^2'),
      traps: traps(r(area), [
        [2 * (W + H), 'Ça, c’est le périmètre. L’aire, ce sont les carreaux **à l’intérieur**.'],
        [W * H, 'Le coin en haut à droite n’est pas dans la figure.'],
      ]),
      hint: 'Découpe la figure en deux rectangles et compte leurs carreaux.',
      steps: [
        `Rectangle du bas : ${W} × ${h} = ${W * h} carreaux. Rectangle du haut : ${w} × ${H - h} = ${w * (H - h)}.`,
        `Aire = ${W * h} + ${w * (H - h)} = **${area} cm^2**.`,
      ],
      targetSeconds: 35,
    };
  },
);

export const aires = C(
  'm6-aires',
  'grandeurs',
  'Aires',
  [aireRectangle, conversionsAire, aireQuadrillage],
  bossOf(
    [
      S(
        'm6-boss-aires-peinture',
        'Problème : la peinture',
        'Calculer l’aire d’un carré ou d’un rectangle',
        [
          'On calcule l’aire du mur, puis combien de pots il faut : on arrondit **au-dessus** (un pot entamé est un pot acheté).',
        ],
        (rng) => {
          const L = rng.int(4, 9);
          const H = rng.int(2, 3);
          const cover = rng.pick([5, 6, 8, 10]);
          const area = L * H;
          const pots = Math.ceil(area / cover);
          return {
            prompt: `Un mur mesure ${L} m de long et ${H} m de haut. Un pot de peinture couvre ${cover} m^2. Combien de pots faut-il acheter ?`,
            answer: num(pots),
            traps: traps(r(pots), [
              [
                Math.floor(area / cover),
                'Avec ce nombre de pots, il manque un peu de peinture : il faut un pot de plus.',
              ],
              [area, `${area} m^2 est l’aire du mur, pas le nombre de pots.`],
            ]),
            hint: 'Calcule l’aire du mur, puis combien de fois un pot entre dedans.',
            steps: [
              `Aire du mur : ${L} × ${H} = ${area} m^2.`,
              `${area} ÷ ${cover} ≈ ${fmt(r(Math.round((area / cover) * 100), 100))} : il faut **${pots}** pots.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm6-boss-aires-gazon',
        'Problème : le gazon',
        'Calculer l’aire d’un carré ou d’un rectangle',
        ['Aire à semer = aire du terrain − aire de la terrasse.'],
        (rng) => {
          const L = rng.int(10, 20);
          const l = rng.int(6, 12);
          const c = rng.int(2, 5);
          const res = L * l - c * c;
          return {
            prompt: `Un terrain rectangulaire de ${L} m sur ${l} m contient une terrasse carrée de ${c} m de côté. Quelle aire faut-il semer de gazon, en m^2 ?`,
            answer: num(res, 'm^2'),
            traps: traps(r(res), [
              [L * l, 'Il faut enlever la terrasse.'],
              [L * l - 4 * c, 'L’aire de la terrasse est côté × côté, pas 4 × côté.'],
            ]),
            hint: 'Aire du terrain moins aire de la terrasse.',
            steps: [
              `Terrain : ${L} × ${l} = ${L * l} m^2. Terrasse : ${c} × ${c} = ${c * c} m^2.`,
              `Gazon : ${L * l} − ${c * c} = **${res} m^2**.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-aires-piege',
        'Piège : doubler les côtés',
        'Calculer l’aire d’un carré ou d’un rectangle',
        ['Si on double le côté d’un carré, son aire est multipliée par **4** (2 × 2), pas par 2.'],
        (rng) => {
          const c = rng.int(2, 9);
          return {
            prompt: `Un carré a un côté de ${c} cm. On double la longueur de son côté. Par combien son aire est-elle multipliée ?`,
            answer: num(4),
            traps: traps(r(4), [
              [2, `Aire avant : ${c * c} cm^2 ; après : ${4 * c * c} cm^2. Ce n’est pas le double !`],
            ]),
            hint: `Calcule l’aire avant (côté ${c}) et après (côté ${2 * c}).`,
            steps: [
              `Avant : ${c} × ${c} = ${c * c} cm^2. Après : ${2 * c} × ${2 * c} = ${4 * c * c} cm^2.`,
              `${4 * c * c} ÷ ${c * c} = **4** : l’aire est multipliée par 4.`,
            ],
            targetSeconds: 35,
          };
        },
      ),
    ],
  ),
);
