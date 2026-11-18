import { choice, distinct, num, traps } from '../build.ts';
import { add, dec, fmt, mul, r, type Rational } from '../rational.ts';
import type { Chapter, Figure } from '../types.ts';
import { big, bossOf, chapterOf, NAMES, skillsOf } from './kit.ts';

/** Programme de 6e (cycle 3, BO n°16 du 17 avril 2025) : grandeurs et mesures, géométrie. */
const S = skillsOf('6e');
const C = chapterOf('6e');

const LEN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'] as const;
const PI = r(314, 100);

/** Conversion d'une valeur entre deux unités d'une échelle de 10 en 10 (ou 100 en 100 : `step`). */
function convert(x: Rational, fromIndex: number, toIndex: number, step = 10): Rational {
  const p = toIndex - fromIndex;
  return p >= 0 ? mul(x, r(step ** p)) : mul(x, r(1, step ** -p));
}

/** Heures et minutes écrites « 2 h 05 » / « 45 min ». */
const hm = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, '0')}`;
};
/** Variantes acceptées pour un horaire écrit au clavier. */
const clockAnswers = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  const m = String(min % 60).padStart(2, '0');
  return [`${h} h ${m}`, `${h}h${m}`, `${h} h ${m} min`, `${h}h${m}min`, `${h}:${m}`, `${h} h${m}`, `${h}h ${m}`];
};

// ——— Longueurs et périmètres ———

const conversionsLongueur = S(
  'm6-conversions-longueur',
  'Convertir des longueurs',
  'Connaître et utiliser les unités de longueur et les relations entre elles (automatisme)',
  [
    'km, hm, dam, **m**, dm, cm, mm : on passe d’une unité à la suivante en multipliant ou divisant par **10**.',
    'Place le chiffre des unités sous l’unité de départ dans le tableau, puis lis le nombre jusqu’à l’unité d’arrivée.',
  ],
  (rng, level) => {
    const from = rng.int(0, 6);
    let to = rng.int(Math.max(0, from - (level === 1 ? 1 : 3)), Math.min(6, from + (level === 1 ? 1 : 3)));
    if (to === from) to = from < 6 ? from + 1 : from - 1;
    const x = level === 1 ? r(rng.int(2, 99)) : dec(rng.int(11, 999), rng.int(1, 2));
    const res = convert(x, from, to);
    const wrong = convert(x, to, from);
    const uf = LEN[from] ?? 'm';
    const ut = LEN[to] ?? 'm';
    return {
      prompt: `Complète : ${fmt(x)} ${uf} = … ${ut}`,
      answer: num(res, ut),
      traps: traps(res, [
        [
          wrong,
          `On passe à une unité plus ${to > from ? 'petite' : 'grande'} : le nombre doit devenir plus ${to > from ? 'grand' : 'petit'}.`,
        ],
      ]),
      hint: `Utilise le tableau : le chiffre des unités de ${fmt(x)} sous ${uf}, puis lis jusqu’à ${ut}.`,
      demo: { kind: 'conversion', table: 'longueur', value: x, from: uf, to: ut },
      steps: [
        `De ${uf} à ${ut}, il y a ${Math.abs(to - from)} rang${Math.abs(to - from) > 1 ? 's' : ''} : on ${to > from ? 'multiplie' : 'divise'} par ${big(10 ** Math.abs(to - from))}.`,
        `${fmt(x)} ${uf} = **${fmt(res)} ${ut}**.`,
      ],
      targetSeconds: 25,
    };
  },
  { tools: ['conversion-longueur'] },
);

const perimetreRectangle = S(
  'm6-perimetre-rectangle',
  'Périmètre du carré et du rectangle',
  'L’élève sait calculer le périmètre d’un carré et d’un rectangle (automatisme)',
  [
    'Le **périmètre**, c’est la longueur du tour de la figure.',
    'Rectangle : 2 × (longueur + largeur). Carré : 4 × côté.',
  ],
  (rng, level) => {
    const square = rng.int(0, 2) === 0;
    const L = level === 3 ? dec(rng.int(21, 99), 1) : r(rng.int(3, 25));
    const l = square ? L : level === 3 ? dec(rng.int(11, 49), 1) : r(rng.int(2, 15));
    const p = square ? mul(L, r(4)) : mul(add(L, l), r(2));
    const figure: Figure = {
      kind: 'polygon',
      vertices: [
        { name: 'A', x: 0, y: 0 },
        { name: 'B', x: 6, y: 0 },
        { name: 'C', x: 6, y: square ? 6 : 3.5 },
        { name: 'D', x: 0, y: square ? 6 : 3.5 },
      ],
      sideLabels: [`${fmt(L)} cm`, square ? null : `${fmt(l)} cm`, null, null],
      rightAngles: [0, 1, 2, 3],
      ...(square ? { ticks: [1, 1, 1, 1] } : {}),
    };
    return {
      prompt: square
        ? `Quel est le périmètre de ce carré de côté ${fmt(L)} cm ?`
        : `Quel est le périmètre de ce rectangle de ${fmt(L)} cm sur ${fmt(l)} cm ?`,
      figure,
      answer: num(p, 'cm'),
      traps: traps(p, [
        [square ? mul(L, L) : mul(L, l), 'Ça, c’est l’aire. Le périmètre est le **tour**.'],
        [square ? mul(L, r(2)) : add(L, l), 'Il faut faire **tout** le tour : 4 côtés.'],
      ]),
      hint: square ? 'Un carré a 4 côtés égaux.' : 'Fais le tour : longueur + largeur + longueur + largeur.',
      steps: [
        square
          ? `Les 4 côtés mesurent ${fmt(L)} cm : 4 × ${fmt(L)}.`
          : `Le tour : ${fmt(L)} + ${fmt(l)} + ${fmt(L)} + ${fmt(l)} = 2 × (${fmt(L)} + ${fmt(l)}).`,
        `Périmètre = **${fmt(p)} cm**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const perimetreDisque = S(
  'm6-perimetre-disque',
  'Périmètre d’un cercle',
  'Connaître la formule du périmètre d’un disque',
  [
    'Le périmètre d’un cercle est **proportionnel à son diamètre** : périmètre = π × diamètre (π ≈ 3,14).',
    'Avec le rayon : périmètre = 2 × π × rayon.',
  ],
  (rng, level) => {
    const useRadius = level !== 1;
    const v = rng.int(2, level === 3 ? 30 : 15);
    const diameter = useRadius ? 2 * v : v;
    const p = mul(r(diameter), PI);
    return {
      prompt: `Calcule le périmètre d’un cercle de ${useRadius ? 'rayon' : 'diamètre'} ${v} cm, en prenant π ≈ 3,14.`,
      figure: { kind: 'disk', radiusLabel: `${v} cm`, diameter: !useRadius },
      answer: num(p, 'cm'),
      traps: traps(p, [
        ...(useRadius
          ? [[mul(r(v), PI), 'Le rayon est la moitié du diamètre : périmètre = 2 × π × rayon.'] as const]
          : []),
        [mul(r(v * v), PI), 'Ça ressemble à une aire (π × r × r). Le périmètre = π × diamètre.'],
      ]),
      hint: useRadius ? 'Diamètre = 2 × rayon, puis périmètre = π × diamètre.' : 'Périmètre = π × diamètre.',
      steps: [
        useRadius ? `Diamètre = 2 × ${v} = ${diameter} cm.` : `Le diamètre vaut ${diameter} cm.`,
        `Périmètre ≈ 3,14 × ${diameter} = **${fmt(p)} cm**.`,
      ],
      targetSeconds: 35,
    };
  },
  { advice: 'calculatrice' },
);

const perimetreCompose = S(
  'm6-perimetre-compose',
  'Périmètre de figures composées',
  'Calculer des périmètres de figures composées',
  [
    'On suit le **contour** de la figure, et seulement lui : les traits à l’intérieur ne comptent pas.',
    'Une forme en L : il faut parfois trouver une longueur manquante par soustraction.',
  ],
  (rng) => {
    const W = rng.int(6, 12);
    const H = rng.int(6, 12);
    const w = rng.int(2, W - 2);
    const h = rng.int(2, H - 2);
    // Forme en L : rectangle W × H privé du coin haut droit (W − w) × (H − h) — périmètre = 2(W + H).
    const p = 2 * (W + H);
    return {
      prompt: `Cette figure en forme de L a des angles droits. Calcule son périmètre en cm.`,
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: W, y: 0 },
          { name: 'C', x: W, y: h },
          { name: 'D', x: w, y: h },
          { name: 'E', x: w, y: H },
          { name: 'F', x: 0, y: H },
        ],
        sideLabels: [`${W} cm`, `${h} cm`, `${W - w} cm`, `${H - h} cm`, `${w} cm`, `${H} cm`],
        rightAngles: [0, 1, 2, 4, 5],
      },
      answer: num(p, 'cm'),
      traps: traps(r(p), [[W * h + w * (H - h), 'Ça, c’est l’aire. Le périmètre, c’est le tour.']]),
      hint: 'Additionne les 6 côtés du contour.',
      steps: [`On fait le tour : ${W} + ${h} + ${W - w} + ${H - h} + ${w} + ${H}.`, `Périmètre = **${p} cm**.`],
      targetSeconds: 40,
    };
  },
);

const longueurs = C(
  'm6-longueurs',
  'grandeurs',
  'Longueurs et périmètres',
  [conversionsLongueur, perimetreRectangle, perimetreDisque, perimetreCompose],
  bossOf(
    [
      S(
        'm6-boss-longueurs-cloture',
        'Problème : la clôture',
        'Résoudre des problèmes impliquant des longueurs',
        ['Une clôture fait le **tour** du terrain : c’est un périmètre. On enlève la largeur du portail.'],
        (rng) => {
          const L = rng.int(12, 40);
          const l = rng.int(8, 25);
          const gate = rng.int(2, 4);
          const p = 2 * (L + l) - gate;
          return {
            prompt: `Un jardin rectangulaire mesure ${L} m sur ${l} m. On l’entoure d’un grillage, sauf un portail de ${gate} m. Combien de mètres de grillage faut-il ?`,
            answer: num(p, 'm'),
            traps: traps(r(p), [
              [2 * (L + l), `N’oublie pas d’enlever le portail (${gate} m).`],
              [L * l, 'Ça, c’est l’aire du jardin.'],
            ]),
            hint: 'Calcule le tour du jardin, puis enlève le portail.',
            steps: [
              `Tour du jardin : 2 × (${L} + ${l}) = ${2 * (L + l)} m.`,
              `Sans le portail : ${2 * (L + l)} − ${gate} = **${p} m**.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
      S(
        'm6-boss-longueurs-roue',
        'Problème : la roue du vélo',
        'Savoir que le périmètre du disque est proportionnel à son diamètre',
        ['À chaque tour, la roue avance de son périmètre : π × diamètre.'],
        (rng) => {
          const d = rng.pick([50, 60, 70]);
          const turns = rng.int(10, 50);
          const one = mul(r(d), PI);
          const total = mul(one, r(turns));
          return {
            prompt: `Une roue de vélo a un diamètre de ${d} cm. Quelle distance parcourt le vélo, en cm, quand la roue fait ${turns} tours ? (π ≈ 3,14)`,
            answer: num(total, 'cm'),
            traps: traps(total, [[one, `Ça, c’est un seul tour. La roue en fait ${turns}.`]]),
            hint: 'Un tour de roue = le périmètre de la roue.',
            steps: [
              `Un tour : 3,14 × ${d} = ${fmt(one)} cm.`,
              `${turns} tours : ${fmt(one)} × ${turns} = **${fmt(total)} cm**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm6-boss-longueurs-piege',
        'Piège : les unités',
        'Connaître et utiliser les unités de longueur et les relations entre elles (automatisme)',
        ['Avant d’additionner des longueurs, mets-les dans la **même unité**.'],
        (rng) => {
          const m = rng.int(1, 5);
          const cm = rng.int(10, 90);
          const total = add(r(m), r(cm, 100));
          return {
            prompt: `Une planche de ${m} m et une planche de ${cm} cm sont mises bout à bout. Quelle longueur totale, en m ?`,
            answer: num(total, 'm'),
            traps: traps(total, [[m + cm, `On n’additionne pas des m et des cm : ${cm} cm = ${fmt(r(cm, 100))} m.`]]),
            hint: `Convertis d’abord ${cm} cm en m.`,
            steps: [`${cm} cm = ${fmt(r(cm, 100))} m.`, `${m} + ${fmt(r(cm, 100))} = **${fmt(total)} m**.`],
            targetSeconds: 30,
          };
        },
        { tools: ['conversion-longueur'] },
      ),
    ],
  ),
);

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

const aires = C(
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

// ——— Volumes ———

const volumeCubes = S(
  'm6-volume-cubes',
  'Volume en cubes unités',
  'Déterminer un volume',
  [
    'Un cube de 1 cm d’arête a un volume de **1 cm^3**.',
    'Un pavé de 4 cubes de long, 3 de large et 2 de haut : 4 × 3 = 12 cubes par étage, 2 étages → 24 cm^3.',
  ],
  (rng, level) => {
    const L = rng.int(2, level === 1 ? 4 : 7);
    const l = rng.int(2, level === 1 ? 3 : 5);
    const h = rng.int(2, level === 1 ? 3 : 5);
    const v = L * l * h;
    return {
      prompt: `Un pavé est fait de cubes de 1 cm d’arête : ${L} cubes de long, ${l} de large et ${h} de haut. Quel est son volume, en cm^3 ?`,
      figure: { kind: 'solid', solid: 'pave', labels: [`${L} cm`, `${l} cm`, `${h} cm`] },
      answer: num(v, 'cm^3'),
      traps: traps(r(v), [
        [L + l + h, 'On ne fait pas une addition : compte les cubes étage par étage.'],
        [L * l, `${L * l} cubes, c’est un seul étage. Il y en a ${h}.`],
      ]),
      hint: 'Compte les cubes d’un étage, puis multiplie par le nombre d’étages.',
      steps: [`Un étage : ${L} × ${l} = ${L * l} cubes.`, `${h} étages : ${L * l} × ${h} = **${v} cm^3**.`],
      targetSeconds: 30,
    };
  },
);

const comparerVolumes = S(
  'm6-comparer-volumes',
  'Comparer des volumes',
  'Comparer des volumes',
  ['Pour comparer deux volumes faits de cubes identiques, on compte les cubes de chacun.'],
  (rng) => {
    const a = [rng.int(2, 5), rng.int(2, 5), rng.int(2, 4)];
    const b = [rng.int(2, 5), rng.int(2, 5), rng.int(2, 4)];
    const vol = (t: number[]) => t.reduce((p, x) => p * x, 1);
    if (vol(a) === vol(b)) b[0] = (b[0] ?? 2) + 1;
    const va = vol(a);
    const vb = vol(b);
    const winner = va > vb ? 'La boîte A' : 'La boîte B';
    return {
      prompt: `La boîte A contient ${a.join(' × ')} cubes, la boîte B contient ${b.join(' × ')} cubes (des cubes identiques). Laquelle a le plus grand volume ?`,
      ...choice(
        rng,
        winner,
        [{ label: va > vb ? 'La boîte B' : 'La boîte A', why: 'Calcule le nombre de cubes de chaque boîte.' }],
        true,
      ),
      hint: 'Calcule le nombre de cubes de chaque boîte.',
      steps: [`A : ${va} cubes. B : ${vb} cubes.`, `**${winner}** a le plus grand volume.`],
      targetSeconds: 30,
    };
  },
);

const volumes = C(
  'm6-volumes',
  'grandeurs',
  'Volumes',
  [volumeCubes, comparerVolumes],
  bossOf(
    [
      S(
        'm6-boss-volumes-carton',
        'Problème : le carton de dés',
        'Déterminer un volume',
        ['Nombre de dés = dés en longueur × dés en largeur × nombre de couches.'],
        (rng) => {
          const side = rng.pick([2, 3]);
          const n = [rng.int(2, 5), rng.int(2, 4), rng.int(2, 3)];
          const box = n.map((k) => k * side);
          const total = (n[0] ?? 0) * (n[1] ?? 0) * (n[2] ?? 0);
          return {
            prompt: `Un carton mesure ${box[0]} cm × ${box[1]} cm × ${box[2]} cm. Combien de dés cubiques de ${side} cm d’arête peut-on y ranger ?`,
            answer: num(total),
            traps: traps(r(total), [
              [(box[0] ?? 0) * (box[1] ?? 0) * (box[2] ?? 0), 'Ça, c’est le volume en cm^3. Un dé ne mesure pas 1 cm.'],
            ]),
            hint: `Combien de dés tiennent dans chaque direction ? (${box[0]} ÷ ${side}…)`,
            steps: [`Dans chaque direction : ${n.join(', ')} dés.`, `${n.join(' × ')} = **${total}** dés.`],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm6-boss-volumes-tour',
        'Problème : la tour de cubes',
        'Déterminer un volume',
        ['Une tour en escalier : on additionne les cubes de chaque marche.'],
        (rng) => {
          const steps = rng.int(3, 6);
          const width = rng.int(2, 4);
          const total = width * ((steps * (steps + 1)) / 2);
          return {
            prompt: `Un escalier de cubes a ${steps} marches. La 1re marche est une colonne de 1 cube de haut, la 2e de 2 cubes… et chaque colonne a une profondeur de ${width} cubes. Combien de cubes en tout ?`,
            answer: num(total),
            traps: traps(r(total), [[steps * width, 'Chaque marche est plus haute que la précédente.']]),
            hint: `Compte les cubes d’une rangée (1 + 2 + … + ${steps}), puis multiplie par ${width}.`,
            steps: [
              `Une rangée : ${Array.from({ length: steps }, (_, i) => i + 1).join(' + ')} = ${(steps * (steps + 1)) / 2}.`,
              `${width} rangées : **${total}** cubes.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-volumes-piege',
        'Piège : surface ou volume ?',
        'Connaître l’unité centimètre cube',
        ['cm : longueur. cm^2 : aire (surface). cm^3 : volume (ce qu’on peut remplir).'],
        (rng) => {
          const q = rng.pick([
            { p: 'la quantité d’eau dans un aquarium', a: 'cm^3', why: 'De l’eau qui remplit : c’est un volume.' },
            { p: 'la surface d’une feuille de papier', a: 'cm^2', why: 'Une surface plate : c’est une aire.' },
            { p: 'la longueur d’un crayon', a: 'cm', why: 'Une longueur se mesure en cm.' },
          ]);
          return {
            prompt: `Quelle unité convient pour mesurer ${q.p} ?`,
            ...choice(
              rng,
              q.a,
              ['cm', 'cm^2', 'cm^3'].filter((u) => u !== q.a).map((u) => ({ label: u, why: q.why })),
            ),
            hint: 'cm : longueur ; cm^2 : surface ; cm^3 : volume.',
            steps: [q.why, `L’unité qui convient est **${q.a}**.`],
            targetSeconds: 15,
          };
        },
      ),
    ],
  ),
);

// ——— Durées ———

const convertirDurees = S(
  'm6-convertir-durees',
  'Convertir des durées',
  'Convertir des durées',
  [
    '1 h = 60 min ; 1 min = 60 s ; 1 jour = 24 h. Attention : ce n’est **pas** 100 !',
    'Une demi-heure = 30 min ; un quart d’heure = 15 min ; trois quarts d’heure = 45 min.',
  ],
  (rng, level) => {
    if (level === 1) {
      const h = rng.int(2, 9);
      return {
        prompt: `Combien de minutes dans ${h} h ?`,
        answer: num(h * 60, 'min'),
        traps: traps(r(h * 60), [[h * 100, '1 h = 60 min, pas 100.']]),
        hint: '1 h = 60 min.',
        steps: [`1 h = 60 min, donc ${h} h = ${h} × 60.`, `= **${h * 60} min**.`],
        targetSeconds: 12,
      };
    }
    if (level === 2) {
      const h = rng.int(1, 5);
      const m = rng.int(5, 55);
      return {
        prompt: `Convertis ${h} h ${String(m).padStart(2, '0')} en minutes.`,
        answer: num(h * 60 + m, 'min'),
        traps: traps(r(h * 60 + m), [[h * 100 + m, '1 h = 60 min, pas 100.']]),
        hint: 'Convertis les heures en minutes, puis ajoute les minutes.',
        steps: [`${h} h = ${h * 60} min.`, `${h * 60} + ${m} = **${h * 60 + m} min**.`],
        targetSeconds: 20,
      };
    }
    const total = rng.int(70, 400);
    return {
      prompt: `${total} min, c’est combien d’heures **complètes** ?`,
      answer: num(Math.floor(total / 60), 'h'),
      traps: traps(r(Math.floor(total / 60)), [[Math.floor(total / 100), '1 h = 60 min : divise par 60.']]),
      hint: `Combien de fois 60 dans ${total} ?`,
      steps: [
        `${total} = 60 × ${Math.floor(total / 60)} + ${total % 60}.`,
        `${total} min = ${hm(total)} : **${Math.floor(total / 60)} h** complètes.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const calculerHoraires = S(
  'm6-horaires',
  'Calculer un horaire ou une durée',
  'Effectuer des calculs sur des horaires et des durées',
  [
    'Pour trouver l’heure d’arrivée : heure de départ + durée. Passe par l’heure « ronde » : 14 h 45 + 30 min = 15 h 15.',
    'Pour une durée entre deux horaires, compte d’abord jusqu’à l’heure ronde.',
  ],
  (rng, level) => {
    const startR = rng.int(7 * 12, 19 * 12) * 5;
    const durR = level === 1 ? rng.int(1, 11) * 5 : rng.int(5, 30) * 5;
    if (level === 3) {
      const end = startR + durR;
      return {
        prompt: `Un film commence à ${hm(startR)} et finit à ${hm(end)}. Combien dure-t-il, en minutes ?`,
        answer: num(durR, 'min'),
        traps: traps(r(durR), [
          [
            Math.floor(end / 60) * 100 + (end % 60) - (Math.floor(startR / 60) * 100 + (startR % 60)),
            'Il y a 60 min dans une heure, pas 100 : passe par l’heure ronde.',
          ],
        ]),
        hint: `Compte de ${hm(startR)} jusqu’à l’heure ronde, puis jusqu’à ${hm(end)}.`,
        steps: [
          `De ${hm(startR)} à ${hm(end)} : on compte heure par heure, puis les minutes.`,
          `Le film dure ${hm(durR)}, soit **${durR} min**.`,
        ],
        targetSeconds: 40,
      };
    }
    const end = startR + durR;
    return {
      prompt: `Le bus part à ${hm(startR)}. Le trajet dure ${hm(durR)}. À quelle heure arrive-t-il ? (écris par exemple 14 h 05)`,
      answer: { kind: 'text', accepted: clockAnswers(end) },
      traps: [],
      hint: `Ajoute d’abord ce qu’il faut pour arriver à l’heure ronde après ${hm(startR)}.`,
      steps: [
        `${hm(startR)} + ${hm(durR)} : on ajoute les heures, puis les minutes (60 min = 1 h).`,
        `Le bus arrive à **${clockAnswers(end)[0]}**.`,
      ],
      targetSeconds: 35,
    };
  },
);

const problemesDurees = S(
  'm6-problemes-durees',
  'Jours, années, siècles',
  'Résoudre des problèmes impliquant des horaires et des durées',
  [
    '1 année = 365 jours (366 si elle est bissextile) ; 1 siècle = 100 ans ; 1 millénaire = 1 000 ans.',
    '1 semaine = 7 jours ; 1 jour = 24 h.',
  ],
  (rng) => {
    const q = rng.pick([
      () => {
        const n = rng.int(2, 9);
        return {
          prompt: `Combien d’heures dans ${n} jours ?`,
          a: n * 24,
          u: 'h',
          wrong: n * 12,
          why: '1 jour = 24 h.',
          step: `${n} × 24`,
        };
      },
      () => {
        const n = rng.int(2, 12);
        return {
          prompt: `Combien de jours dans ${n} semaines ?`,
          a: n * 7,
          u: 'jours',
          wrong: n * 5,
          why: '1 semaine = 7 jours.',
          step: `${n} × 7`,
        };
      },
      () => {
        const n = rng.int(2, 20);
        return {
          prompt: `Combien d’années dans ${n} siècles ?`,
          a: n * 100,
          u: 'ans',
          wrong: n * 1000,
          why: '1 siècle = 100 ans.',
          step: `${n} × 100`,
        };
      },
      () => {
        const n = rng.int(2, 5);
        return {
          prompt: `Combien de secondes dans ${n} min ?`,
          a: n * 60,
          u: 's',
          wrong: n * 100,
          why: '1 min = 60 s.',
          step: `${n} × 60`,
        };
      },
    ])();
    return {
      prompt: q.prompt,
      answer: num(q.a, q.u),
      traps: traps(r(q.a), [[q.wrong, q.why]]),
      hint: q.why,
      steps: [q.why, `${q.step} = **${q.a} ${q.u}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const durees = C(
  'm6-durees',
  'grandeurs',
  'Horaires et durées',
  [convertirDurees, calculerHoraires, problemesDurees],
  bossOf(
    [
      S(
        'm6-boss-durees-entrainement',
        'Problème : l’entraînement',
        'Résoudre des problèmes impliquant des horaires et des durées',
        ['Total = durée d’une séance × nombre de séances, puis on convertit en heures et minutes.'],
        (rng) => {
          const per = rng.pick([45, 50, 75, 90]);
          const n = rng.int(2, 5);
          const total = per * n;
          return {
            prompt: `${rng.pick(NAMES)} s’entraîne ${n} fois par semaine, ${per} min à chaque fois. Combien de minutes par semaine ?`,
            answer: num(total, 'min'),
            traps: traps(r(total), [[per + n, 'C’est une multiplication : la même durée plusieurs fois.']]),
            hint: `${per} min, ${n} fois.`,
            steps: [`${per} × ${n} = ${total} min.`, `Soit ${hm(total)} : **${total} min**.`],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm6-boss-durees-train',
        'Problème : le train',
        'Effectuer des calculs sur des horaires et des durées',
        ['Pour une durée qui passe une heure ronde : compte jusqu’à l’heure ronde, puis le reste.'],
        (rng) => {
          const dep = rng.int(8, 16) * 60 + rng.int(7, 11) * 5;
          const dur = rng.int(5, 20) * 5 + 60;
          const arr = dep + dur;
          return {
            prompt: `Un train part à ${hm(dep)} et arrive à ${hm(arr)}. Combien de minutes dure le trajet ?`,
            answer: num(dur, 'min'),
            traps: traps(r(dur), [
              [
                Math.floor(arr / 60) * 100 + (arr % 60) - Math.floor(dep / 60) * 100 - (dep % 60),
                'Une heure, c’est 60 min, pas 100.',
              ],
            ]),
            hint: `De ${hm(dep)} à ${hm(Math.ceil(dep / 60) * 60)}, puis jusqu’à ${hm(arr)}.`,
            steps: [
              `De ${hm(dep)} à ${hm(Math.ceil(dep / 60) * 60)} : ${Math.ceil(dep / 60) * 60 - dep} min. Puis jusqu’à ${hm(arr)} : ${arr - Math.ceil(dep / 60) * 60} min.`,
              `En tout : **${dur} min** (${hm(dur)}).`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-durees-piege',
        'Piège : 1,5 h',
        'Convertir des durées',
        ['1,5 h, c’est 1 h et une **demi**-heure : 1 h 30, pas 1 h 50 !'],
        (rng) => {
          const h = rng.int(1, 4);
          return {
            prompt: `Combien de minutes dans ${h},5 h ?`,
            answer: num(h * 60 + 30, 'min'),
            traps: traps(r(h * 60 + 30), [
              [h * 60 + 50, '0,5 h, c’est une demi-heure : 30 min.'],
              [h * 100 + 50, '1 h = 60 min, et 0,5 h = 30 min.'],
            ]),
            hint: '0,5 h, c’est la moitié d’une heure.',
            steps: [`${h} h = ${h * 60} min et 0,5 h = 30 min.`, `${h * 60} + 30 = **${h * 60 + 30} min**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

// ——— Distances, cercles, médiatrice ———

const milieuDistance = S(
  'm6-milieu',
  'Distance et milieu d’un segment',
  'Connaître et utiliser la définition du milieu d’un segment',
  ['Le **milieu** M de [AB] est sur le segment et à égale distance de A et de B : AM = MB = AB ÷ 2.'],
  (rng, level) => {
    const ab = level === 1 ? 2 * rng.int(2, 15) : dec(rng.int(21, 199), 1);
    const AB = typeof ab === 'number' ? r(ab) : ab;
    const askWhole = level === 3;
    const half = mul(AB, r(1, 2));
    return {
      prompt: askWhole
        ? `M est le milieu de [AB] et AM = ${fmt(half)} cm. Combien mesure AB ?`
        : `M est le milieu du segment [AB] et AB = ${fmt(AB)} cm. Combien mesure AM ?`,
      answer: num(askWhole ? AB : half, 'cm'),
      traps: traps(askWhole ? AB : half, [
        [
          askWhole ? half : AB,
          askWhole ? 'AB est le segment entier : deux fois AM.' : 'AM n’est que la moitié du segment.',
        ],
      ]),
      hint: 'Le milieu partage le segment en deux longueurs égales.',
      steps: [
        askWhole ? 'AB = AM + MB = 2 × AM.' : 'AM = AB ÷ 2.',
        `${askWhole ? 'AB' : 'AM'} = **${fmt(askWhole ? AB : half)} cm**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const cercleVocabulaire = S(
  'm6-cercle',
  'Cercle : rayon, diamètre, corde',
  'Connaître les définitions d’un cercle, d’un disque, d’un rayon, d’un diamètre, d’une corde',
  [
    'Tous les points du **cercle** sont à la même distance du centre : c’est le **rayon**.',
    'Le **diamètre** passe par le centre : il vaut 2 rayons. Une **corde** relie deux points du cercle.',
  ],
  (rng, level) => {
    if (level === 1) {
      const rad = rng.int(2, 15);
      const askD = rng.int(0, 1) === 1;
      return {
        prompt: askD
          ? `Un cercle a un rayon de ${rad} cm. Quel est son diamètre ?`
          : `Un cercle a un diamètre de ${2 * rad} cm. Quel est son rayon ?`,
        answer: num(askD ? 2 * rad : rad, 'cm'),
        traps: traps(
          r(askD ? 2 * rad : rad),
          [[askD ? rad / 2 : 4 * rad, 'Le diamètre vaut **deux** rayons.']].filter(([v]) => Number.isInteger(v)) as [
            number,
            string,
          ][],
        ),
        hint: 'Diamètre = 2 × rayon.',
        steps: ['Le diamètre vaut deux rayons.', `Réponse : **${askD ? 2 * rad : rad} cm**.`],
        targetSeconds: 10,
      };
    }
    const rad = rng.int(3, 9);
    const dist = rng.pick([rad - rng.int(1, 2), rad, rad + rng.int(1, 3)]);
    const where = dist < rad ? 'À l’intérieur du cercle' : dist === rad ? 'Sur le cercle' : 'À l’extérieur du cercle';
    return {
      prompt: `Un cercle a pour centre O et pour rayon ${rad} cm. Le point P est tel que OP = ${dist} cm. Où est P ?`,
      ...choice(
        rng,
        where,
        ['À l’intérieur du cercle', 'Sur le cercle', 'À l’extérieur du cercle']
          .filter((w) => w !== where)
          .map((w) => ({ label: w, why: `Compare OP = ${dist} cm au rayon ${rad} cm.` })),
        true,
      ),
      hint: 'Compare la distance OP au rayon.',
      steps: [
        `Les points du cercle sont exactement à ${rad} cm de O.`,
        `OP = ${dist} cm : P est **${where.toLowerCase()}**.`,
      ],
      targetSeconds: 15,
    };
  },
);

const mediatrice = S(
  'm6-mediatrice',
  'Médiatrice d’un segment',
  'Comprendre et utiliser la propriété caractéristique de la médiatrice d’un segment',
  [
    'La **médiatrice** de [AB] est la droite perpendiculaire à [AB] qui passe par son milieu.',
    'Tout point de la médiatrice est **à égale distance** de A et de B : MA = MB.',
  ],
  (rng, level) => {
    const d = rng.int(3, 12);
    if (level === 1) {
      return {
        prompt: `M est sur la médiatrice de [AB] et MA = ${d} cm. Combien mesure MB ?`,
        answer: num(d, 'cm'),
        traps: traps(r(d), [[2 * d, 'Un point de la médiatrice est à **égale** distance de A et de B.']]),
        hint: 'Que sais-tu des distances d’un point de la médiatrice aux extrémités ?',
        steps: ['Un point de la médiatrice est à égale distance de A et de B.', `MB = MA = **${d} cm**.`],
        targetSeconds: 12,
      };
    }
    const e = d + rng.int(1, 3);
    const on = rng.int(0, 1) === 1;
    return {
      prompt: `N est un point tel que NA = ${d} cm et NB = ${on ? d : e} cm. N est-il sur la médiatrice de [AB] ?`,
      ...choice(
        rng,
        on ? 'Oui' : 'Non',
        [
          {
            label: on ? 'Non' : 'Oui',
            why: on
              ? 'NA = NB : N est bien à égale distance de A et B.'
              : 'NA ≠ NB : N n’est pas à égale distance de A et B.',
          },
        ],
        true,
      ),
      hint: 'Un point est sur la médiatrice exactement quand il est à égale distance de A et de B.',
      steps: [
        `NA = ${d} cm et NB = ${on ? d : e} cm : ${on ? 'égales' : 'différentes'}.`,
        `Donc **${on ? 'oui' : 'non'}**, N ${on ? 'est' : 'n’est pas'} sur la médiatrice.`,
      ],
      targetSeconds: 15,
    };
  },
);

const cercles = C(
  'm6-cercles',
  'geometrie',
  'Distances, cercles et médiatrice',
  [milieuDistance, cercleVocabulaire, mediatrice],
  bossOf(
    [
      S(
        'm6-boss-cercles-chevre',
        'Problème : la chèvre',
        'Résoudre des problèmes mettant en jeu des distances à un point',
        [
          'Une chèvre attachée par une corde à un piquet peut aller partout à une distance **inférieure ou égale** à la longueur de la corde : dans un disque.',
        ],
        (rng) => {
          const rope = rng.int(3, 10);
          const herb = rope + rng.pick([-2, -1, 1, 2]);
          const can = herb <= rope;
          return {
            prompt: `Une chèvre est attachée à un piquet par une corde de ${rope} m. Une touffe d’herbe est à ${herb} m du piquet. La chèvre peut-elle la manger ?`,
            ...choice(
              rng,
              can ? 'Oui' : 'Non',
              [{ label: can ? 'Non' : 'Oui', why: `Compare ${herb} m à la longueur de la corde (${rope} m).` }],
              true,
            ),
            hint: 'La chèvre peut aller jusqu’à la longueur de la corde, pas plus loin.',
            steps: [
              `La chèvre atteint tous les points à ${rope} m ou moins du piquet.`,
              `${herb} m ${can ? '≤' : '>'} ${rope} m : **${can ? 'oui' : 'non'}**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm6-boss-cercles-tresor',
        'Problème : le trésor',
        'Résoudre des problèmes en s’appuyant sur la propriété caractéristique de la médiatrice',
        ['Un point à égale distance de deux arbres est sur la médiatrice du segment qui les relie.'],
        (rng) => {
          const d = rng.int(4, 15);
          return {
            prompt: `Le trésor est à égale distance du chêne et du pin. Il est à ${d} pas du chêne. À combien de pas du pin est-il ?`,
            answer: num(d),
            traps: traps(r(d), [[2 * d, 'À **égale** distance : la même.']]),
            hint: '« À égale distance » : même distance des deux arbres.',
            steps: [
              'Le trésor est sur la médiatrice du segment chêne–pin : même distance aux deux arbres.',
              `Il est à **${d}** pas du pin.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-cercles-piege',
        'Piège : rayon ou diamètre ?',
        'Connaître les définitions d’un cercle, d’un disque, d’un rayon, d’un diamètre, d’une corde',
        ['Le compas s’ouvre de la longueur du **rayon**, pas du diamètre.'],
        (rng) => {
          const D = 2 * rng.int(3, 10);
          return {
            prompt: `Pour tracer un cercle de ${D} cm de diamètre, de combien faut-il écarter le compas ?`,
            answer: num(D / 2, 'cm'),
            traps: traps(r(D / 2), [[D, 'L’écartement du compas, c’est le rayon : la moitié du diamètre.']]),
            hint: 'La pointe est au centre, la mine sur le cercle : c’est quelle longueur ?',
            steps: [
              'Entre la pointe (centre) et la mine (cercle), il y a un rayon.',
              `Rayon = ${D} ÷ 2 = **${D / 2} cm**.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

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

const angles = C(
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

const symetrie = C(
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

// ——— Vision dans l'espace ———

const reconnaitreSolides = S(
  'm6-solides',
  'Reconnaître les solides',
  'L’élève identifie dans un ensemble de solides lesquels sont des pyramides, des boules, des cubes, des cylindres, des pavés, des cônes ou des prismes droits (automatisme)',
  [
    'Cube : 6 faces carrées. Pavé : 6 faces rectangles. Pyramide : une base et des faces **triangulaires** qui se rejoignent en un sommet.',
    'Cylindre : deux disques. Cône : un disque et une pointe. Boule : toute ronde.',
  ],
  (rng) => {
    const s = rng.pick([
      { d: '6 faces, toutes des carrés identiques', a: 'Un cube' },
      { d: '6 faces rectangulaires', a: 'Un pavé droit' },
      { d: 'une base carrée et 4 faces triangulaires qui se rejoignent en un sommet', a: 'Une pyramide' },
      { d: 'deux bases en forme de disque et une face courbe', a: 'Un cylindre' },
      { d: 'une base en forme de disque et une pointe', a: 'Un cône' },
      { d: 'deux bases triangulaires identiques et 3 faces rectangulaires', a: 'Un prisme droit' },
    ]);
    const all = ['Un cube', 'Un pavé droit', 'Une pyramide', 'Un cylindre', 'Un cône', 'Un prisme droit'];
    return {
      prompt: `Quel solide a ${s.d} ?`,
      ...choice(
        rng,
        s.a,
        distinct(rng, 3, () => rng.pick(all.filter((x) => x !== s.a))).map((x) => ({
          label: x,
          why: 'Regarde la forme des faces.',
        })),
      ),
      hint: 'Regarde la forme et le nombre des faces.',
      steps: [`${s.d.charAt(0).toUpperCase() + s.d.slice(1)}.`, `C’est **${s.a.toLowerCase()}**.`],
      targetSeconds: 15,
    };
  },
);

const cubeFaces = S(
  'm6-faces-aretes',
  'Faces, arêtes, sommets',
  'Voir dans l’espace des assemblages de cubes',
  ['Un cube a **6** faces, **12** arêtes et **8** sommets. Un pavé aussi !'],
  (rng) => {
    const q = rng.pick([
      { p: 'faces', a: 6, w: 4 },
      { p: 'arêtes', a: 12, w: 8 },
      { p: 'sommets', a: 8, w: 6 },
    ]);
    const solid = rng.pick(['un cube', 'un pavé droit']);
    return {
      prompt: `Combien ${solid} a-t-il de **${q.p}** ?`,
      figure: { kind: 'solid', solid: solid === 'un cube' ? 'cube' : 'pave', labels: [] },
      answer: num(q.a),
      traps: traps(r(q.a), [[q.w, 'Pense aussi aux éléments cachés, à l’arrière.']]),
      hint: 'Compte aussi ce qui est caché derrière (en pointillés).',
      steps: [
        'Faces : 6 (dessus, dessous, 4 côtés). Arêtes : 4 en haut, 4 en bas, 4 verticales. Sommets : 4 en haut, 4 en bas.',
        `${solid.charAt(0).toUpperCase() + solid.slice(1)} a **${q.a}** ${q.p}.`,
      ],
      targetSeconds: 15,
    };
  },
);

const espace = C(
  'm6-espace',
  'geometrie',
  'Vision dans l’espace',
  [reconnaitreSolides, cubeFaces],
  bossOf(
    [
      S(
        'm6-boss-espace-peinture',
        'Problème : le cube peint',
        'Voir dans l’espace des assemblages de cubes',
        ['Un gros cube fait de 3 × 3 × 3 petits cubes : seuls ceux de surface sont peints.'],
        (rng) => {
          const n = rng.int(2, 4);
          const corners = 8;
          return {
            prompt: `On assemble ${n * n * n} petits cubes en un gros cube de ${n} × ${n} × ${n}, puis on peint tout l’extérieur. Combien de petits cubes ont exactement 3 faces peintes ?`,
            answer: num(corners),
            traps: traps(r(corners), [[6, 'Ce sont les cubes des **coins** : combien de coins a un cube ?']]),
            hint: 'Un petit cube a 3 faces peintes quand il est dans un coin.',
            steps: [
              '3 faces peintes = un cube placé dans un coin du gros cube.',
              'Un cube a 8 sommets : **8** petits cubes.',
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm6-boss-espace-aretes',
        'Problème : la structure en pailles',
        'Voir dans l’espace des assemblages de cubes',
        ['Les pailles sont les arêtes du pavé : il y en a 12, 4 de chaque longueur.'],
        (rng) => {
          const [L, l, h] = [rng.int(10, 30), rng.int(5, 20), rng.int(5, 15)];
          const total = 4 * (L + l + h);
          return {
            prompt: `On construit un pavé droit en pailles de ${L} cm, ${l} cm et ${h} cm (une paille par arête). Quelle longueur de paille faut-il en tout ?`,
            answer: num(total, 'cm'),
            traps: traps(r(total), [
              [L + l + h, 'Un pavé a 12 arêtes : 4 de chaque longueur.'],
              [2 * (L + l + h), 'Compte bien les 12 arêtes : 4 de chaque longueur.'],
            ]),
            hint: 'Un pavé a 12 arêtes : 4 longueurs, 4 largeurs, 4 hauteurs.',
            steps: [`4 × ${L} + 4 × ${l} + 4 × ${h}.`, `= **${total} cm**.`],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-espace-piege',
        'Piège : le cylindre a-t-il des arêtes ?',
        'L’élève identifie dans un ensemble de solides lesquels sont des pyramides, des boules, des cubes, des cylindres, des pavés, des cônes ou des prismes droits (automatisme)',
        ['Un cylindre n’a ni sommet ni arête droite : ses bords sont des cercles.'],
        (rng) => ({
          prompt: 'Combien de sommets a un cylindre ?',
          ...choice(rng, '0', [
            { label: '2', why: 'Les bords d’un cylindre sont des cercles : pas de « pointe ».' },
            { label: '8', why: 'Ça, c’est un pavé.' },
          ]),
          hint: 'Un sommet est une « pointe » où des arêtes se rejoignent.',
          steps: ['Un cylindre a deux disques et une face courbe : aucune pointe.', 'Il a **0** sommet.'],
          targetSeconds: 15,
        }),
      ),
    ],
  ),
);

export const SIXIEME_MESURES: readonly Chapter[] = [
  longueurs,
  aires,
  volumes,
  durees,
  cercles,
  angles,
  symetrie,
  espace,
];
