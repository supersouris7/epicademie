import { num, objective, traps, trueFalse } from '../../build.ts';
import { dec, fmt, fromNumber, mul, r, type Rational } from '../../rational.ts';
import type { AnswerSpec, Chapter, Skill } from '../../types.ts';
import { PI } from './commun.ts';

/* ───────────────────────── Espace ───────────────────────── */

const volumes: Skill = {
  id: 'm5-volumes',
  advice: 'calculatrice',
  title: 'Volume du cube, du pavé, du prisme',
  lesson: {
    memo: [
      'Le volume, c’est le nombre de petits cubes de 1 cm de côté qu’on peut ranger dedans.',
      'Pavé : on remplit le fond (longueur × largeur), puis on empile autant d’étages que la hauteur → L × ℓ × h.',
      'Prisme : même idée, aire du fond × hauteur. Cube : a × a × a.',
    ],
    source: objective('Calculer le volume du cube, du pavé droit, du prisme droit'),
  },
  generate(rng, level) {
    if (level === 1) {
      const a = rng.int(2, 10);
      const v = a ** 3;
      return {
        prompt: `Calcule le volume d’un cube d’arête ${a} cm (en cm^3).`,
        figure: { kind: 'solid', solid: 'cube', labels: [`${a} cm`] },
        answer: num(v, 'cm^3'),
        traps: traps(r(v), [
          [a * 3, `a^3 = a × a × a, pas a × 3.`],
          [a * a, `${a} × ${a} = ${a * a} est l’aire d’une face ; il faut encore × ${a}.`],
          [a * 12, `${a * 12} cm est la longueur totale des 12 arêtes.`],
        ]),
        hint: 'Combien de petits cubes au fond ? Et combien d’étages ?',
        steps: [
          `On imagine qu’on remplit le cube avec des petits cubes de 1 cm.`,
          `Au fond : ${a} rangées de ${a}, soit ${a} × ${a} = ${a * a} petits cubes.`,
          `On empile ${a} étages : ${a * a} × ${a} = **${v}** cm^3`,
        ],
      };
    }
    if (level === 2) {
      const [L, l, h] = [rng.int(3, 12), rng.int(2, 8), rng.int(2, 10)];
      const v = L * l * h;
      return {
        prompt: `Calcule le volume de ce pavé droit (en cm^3).`,
        figure: { kind: 'solid', solid: 'pave', labels: [`${L} cm`, `${l} cm`, `${h} cm`] },
        answer: num(v, 'cm^3'),
        traps: traps(r(v), [
          [L + l + h, 'On multiplie les trois dimensions, on ne les additionne pas.'],
          [L * l, `${L} × ${l} est l’aire de la base ; il faut encore multiplier par la hauteur.`],
        ]),
        hint: 'Combien de petits cubes au fond ? Et combien d’étages ?',
        steps: [
          `On imagine qu’on remplit le pavé avec des petits cubes de 1 cm.`,
          `Au fond : ${L} × ${l} = ${L * l} petits cubes.`,
          `On empile ${h} étages : ${L * l} × ${h} = **${v}** cm^3`,
        ],
      };
    }
    const [a, b] = [rng.int(2, 8) * 2, rng.int(2, 9)];
    const h = rng.int(3, 12);
    const base = (a * b) / 2;
    const v = base * h;
    return {
      prompt: `Un prisme droit a pour base un triangle rectangle dont les côtés de l’angle droit mesurent ${a} cm et ${b} cm. Sa hauteur est ${h} cm. Calcule son volume (en cm^3).`,
      figure: { kind: 'solid', solid: 'prisme', labels: [`${a} cm`, `${b} cm`, `${h} cm`] },
      answer: num(v, 'cm^3'),
      traps: traps(r(v), [
        [a * b * h, `L’aire d’un triangle rectangle est ${a} × ${b} ÷ 2 : il manque la division par 2.`],
      ]),
      hint: 'Calcule d’abord l’aire du triangle du fond (attention, c’est la moitié d’un rectangle !), puis multiplie par la hauteur.',
      steps: [
        `Le fond est un triangle rectangle : c’est la moitié d’un rectangle de ${a} cm sur ${b} cm.`,
        `Aire du fond : ${a} × ${b} ÷ 2 = ${base} cm^2.`,
        `On empile ${h} étages : ${base} × ${h} = **${v}** cm^3`,
      ],
      targetSeconds: 60,
    };
  },
};

const VOL_UNITS = [
  { u: 'm^3', p: 9 },
  { u: 'dm^3', p: 6 },
  { u: 'cm^3', p: 3 },
  { u: 'L', p: 6 },
  { u: 'cL', p: 4 },
  { u: 'mL', p: 3 },
] as const;

const conversionsVolume: Skill = {
  id: 'm5-conversions-volume',
  tools: ['conversion-volume'],
  title: 'Unités de volume et de contenance',
  lesson: {
    memo: [
      'Utilise le tableau de conversion ! Place le chiffre des unités dans la colonne de l’unité de départ, puis lis le nombre dans la colonne d’arrivée.',
      'À retenir : 1 L = 1 dm^3 (une bouteille d’eau) et 1 mL = 1 cm^3 (un petit dé).',
      'Vers une unité plus petite, le nombre devient plus grand : 1 L = 100 cL = 1 000 mL.',
    ],
    source: objective('Connaitre et convertir des unités usuelles (volume et capacité)'),
  },
  generate(rng, level) {
    const pool =
      level === 1
        ? VOL_UNITS.filter((u) => ['L', 'cL', 'mL'].includes(u.u))
        : level === 2
          ? VOL_UNITS.filter((u) => u.u !== 'cL')
          : VOL_UNITS;
    type Unit = (typeof VOL_UNITS)[number];
    let from: Unit = VOL_UNITS[0];
    let to: Unit = VOL_UNITS[1];
    let x = r(1);
    let power = 0;
    let result = r(1);
    // On évite les résultats peu réalistes (plus de 4 décimales ou plus de 10 millions).
    for (let guard = 0; guard < 50; guard++) {
      [from, to] = rng.shuffle<Unit>([...pool]).slice(0, 2) as [Unit, Unit];
      x = level === 1 ? r(rng.int(1, 9)) : dec(rng.int(11, 99), 1);
      power = from.p - to.p;
      result = power >= 0 ? mul(x, r(10 ** power)) : mul(x, r(1, 10 ** -power));
      if (10 ** 4 % result.d === 0 && result.n / result.d < 1e7) break;
    }
    const linear =
      from.u.includes('^3') && to.u.includes('^3')
        ? power >= 0
          ? mul(x, r(10 ** (power / 3)))
          : mul(x, r(1, 10 ** (-power / 3)))
        : null;
    const t: [Rational, string][] = [
      [
        power >= 0 ? mul(x, r(1, 10 ** power)) : mul(x, r(10 ** -power)),
        'Mauvais sens : vers une unité plus petite, le nombre devient plus grand.',
      ],
    ];
    if (linear) t.push([linear, 'Pour les volumes, on multiplie par 1 000 (et non 10) d’une unité à la suivante.']);
    return {
      prompt: `Complète : ${fmt(x)} ${from.u} = … ${to.u}`,
      answer: num(result, to.u),
      traps: traps(result, t),
      hint: `Utilise le tableau de conversion : chiffre des unités de ${fmt(x)} sous ${from.u}, puis lis le nombre jusqu’à la colonne ${to.u}.`,
      demo: { kind: 'conversion', table: 'volume', value: x, from: from.u, to: to.u },
      steps: [
        `On place ${fmt(x)} dans le tableau : le chiffre des unités va dans la colonne ${from.u}.`,
        power > 0
          ? `${to.u} est une unité plus petite que ${from.u} : il en faut plus. Le nombre devient ${fmt(10 ** power)} fois plus grand.`
          : `${to.u} est une unité plus grande que ${from.u} : il en faut moins. Le nombre devient ${fmt(10 ** -power)} fois plus petit.`,
        `On met la virgule juste après la colonne ${to.u}${power > 0 ? ' et on complète les cases vides par des 0' : ''}.`,
        `On lit : ${fmt(x)} ${from.u} = **${fmt(result)} ${to.u}**`,
      ],
    };
  },
};

/** Arrondi décimal d'un nombre réel (π × …) en rationnel exact. */
const roundTo = (x: number, decimals: number) => fromNumber(Math.round(x * 10 ** decimals) / 10 ** decimals);

/** Les trois écritures d'un « π × k » : touche π arrondie au dixième, 3,14 arrondi, 3,14 non arrondi. */
const piForms = (k: number) => [roundTo(Math.PI * k, 1), roundTo(3.14 * k, 1), mul(PI, r(k))] as const;

const disque: Skill = {
  id: 'm5-disque',
  advice: 'calculatrice',
  title: 'Aire du disque, volume du cylindre',
  lesson: {
    memo: [
      'Aire d’un disque = π × rayon × rayon. À la calculatrice : touche π, puis × r × r.',
      'Le **rayon**, c’est du centre au bord. Le **diamètre**, c’est tout le travers : le rayon en est la moitié.',
      'Arrondir au dixième : on garde 1 chiffre après la virgule (78,539… → 78,5). Le cylindre, c’est un disque empilé sur toute la hauteur : aire du disque × hauteur.',
    ],
    source: objective('Calculer l’aire du disque, le volume du cylindre de révolution'),
  },
  generate(rng, level) {
    const radius = rng.int(1, 10);
    const answer = (k: number, unit: string): AnswerSpec => ({
      kind: 'number',
      value: piForms(k)[0],
      unit,
      accept: [piForms(k)[1]],
      round: 1,
    });
    const wrong = (k: number, why: string) => piForms(k).map((v) => [v, why] as const);
    const unrounded = (k: number) => [[piForms(k)[2], 'Presque ! Arrondis ton résultat au dixième.'] as const];
    const approx = (k: number) => `${fmt(roundTo(Math.PI * k, 4))}…`;
    const k = radius * radius;
    if (level === 3) {
      const h = rng.int(2, 10);
      return {
        prompt: `Calcule le volume d’un cylindre de rayon ${radius} cm et de hauteur ${h} cm, en cm^3, arrondi au dixième.`,
        figure: { kind: 'solid', solid: 'cylindre', labels: [`${radius} cm`, `${h} cm`] },
        answer: answer(k * h, 'cm^3'),
        traps: traps(piForms(k * h)[0], [
          ...unrounded(k * h),
          ...wrong(2 * radius * h, 'La base est un disque : on prend son **aire** π × r^2, pas son périmètre.'),
          ...wrong(k, `Il faut encore multiplier l’aire de la base par la hauteur ${h}.`),
        ]),
        hint: 'Calcule d’abord l’aire du disque du fond (π × r × r), puis multiplie par la hauteur. Et n’oublie pas d’arrondir !',
        steps: [
          `Un cylindre, c’est un disque empilé sur toute la hauteur. On calcule d’abord l’aire du disque du fond.`,
          `Aire du fond : π × ${radius} × ${radius} = ${k} × π.`,
          `On multiplie par la hauteur ${h} : ${k} × π × ${h} = ${k * h} × π. La calculatrice donne ${approx(k * h)}`,
          `On arrondit au dixième (1 chiffre après la virgule) : **${fmt(piForms(k * h)[0])}** cm^3. Avec π ≈ 3,14, on trouve ${fmt(piForms(k * h)[1])}, c’est juste aussi.`,
        ],
        targetSeconds: 60,
      };
    }
    const givenDiameter = level === 2;
    return {
      prompt: givenDiameter
        ? `Calcule l’aire d’un disque de **diamètre** ${2 * radius} cm, en cm^2, arrondie au dixième.`
        : `Calcule l’aire d’un disque de rayon ${radius} cm, en cm^2, arrondie au dixième.`,
      figure: {
        kind: 'disk',
        radiusLabel: givenDiameter ? `${2 * radius} cm` : `${radius} cm`,
        diameter: givenDiameter,
      },
      answer: answer(k, 'cm^2'),
      traps: traps(piForms(k)[0], [
        ...unrounded(k),
        ...wrong(2 * radius, 'π × diamètre donne le **périmètre** du cercle, pas l’aire.'),
        ...wrong(4 * k, 'Le diamètre a été utilisé à la place du rayon : r = diamètre ÷ 2.'),
        ...wrong(2 * radius * radius, 'r^2 = r × r, pas 2 × r.'),
      ]),
      hint: givenDiameter
        ? 'Attention : on te donne le diamètre. Le rayon, c’est la moitié ! Puis π × r × r.'
        : 'Aire du disque = π × rayon × rayon. Utilise la touche π, puis arrondis.',
      steps: [
        ...(givenDiameter
          ? [
              `Attention : ${2 * radius} cm, c’est le diamètre (tout le travers). Le rayon, c’est la moitié : ${2 * radius} ÷ 2 = ${radius} cm.`,
            ]
          : []),
        `Aire du disque = π × rayon × rayon = π × ${radius} × ${radius}.`,
        `À la calculatrice : π × ${radius} × ${radius} = ${approx(k)}`,
        `On arrondit au dixième (1 chiffre après la virgule) : **${fmt(piForms(k)[0])}** cm^2. Avec π ≈ 3,14, on trouve ${fmt(piForms(k)[1])}, c’est juste aussi.`,
      ],
      targetSeconds: 45,
    };
  },
};

/** Patrons : 6 carrés sur quadrillage ; [x, y] des cases. */
const CUBE_NETS: readonly [number, number][][] = [
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
  ],
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [2, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 2],
  ],
];
const NOT_NETS: readonly [number, number][][] = [
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ], // rectangle 3 × 2
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [2, 1],
  ], // 5 en ligne
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ], // carré 2 × 2
  [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ], // deux faces superposées
];

const patron: Skill = {
  id: 'm5-patron-cube',
  title: 'Patron d’un cube',
  lesson: {
    memo: [
      'Un patron, c’est le cube « déplié » à plat : 6 carrés qui, en pliant, ferment toutes les faces.',
      'Imagine le pliage : choisis un carré comme fond, et relève les autres autour.',
      'Ça ne marche jamais avec 4 carrés en bloc 2 × 2, ni avec 5 carrés en ligne : deux faces se chevaucheraient.',
    ],
    source: objective('Reconnaitre un patron d’un cube') + ' (automatisme)',
  },
  generate(rng) {
    const isNet = rng.next() < 0.5;
    const cells = isNet ? rng.pick(CUBE_NETS) : rng.pick(NOT_NETS);
    return {
      prompt: 'Ce dessin est-il un patron de cube ?',
      figure: { kind: 'pattern', steps: [cells] },
      ...trueFalse(
        isNet,
        isNet
          ? 'En pliant, chaque carré recouvre une face différente : c’est un patron.'
          : 'Au pliage, deux carrés se superposent (carré 2 × 2, 5 alignés ou 4 faces autour d’un même sommet).',
      ),
      hint: 'Choisis un carré comme fond du cube et imagine qu’on relève les autres autour. Est-ce que tout se ferme sans chevauchement ?',
      steps: [
        'On imagine le pliage : un carré sert de fond, et on relève les autres autour.',
        isNet
          ? 'Ici, une bande de 4 carrés fait le tour du cube, et les 2 autres viennent fermer le dessus et le dessous.'
          : 'Ici, en relevant les carrés, deux d’entre eux arrivent au même endroit, et une face reste ouverte.',
        isNet ? 'Toutes les faces sont fermées : c’est **bien un patron**.' : 'Ce n’est **pas un patron** de cube.',
      ],
      targetSeconds: 25,
    };
  },
};

export const espace: Chapter = {
  id: 'm5-espace',
  subject: 'maths',
  grade: '5e',
  domain: 'geometrie',
  title: 'Solides et volumes',
  skills: [volumes, conversionsVolume, disque, patron],
};
