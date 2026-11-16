import { choice, distinct, nonZero, num, objective, traps, trueFalse } from '../build.ts';
import { dec, fmt, mul, r, type Rational } from '../rational.ts';
import type { Chapter, Skill, Trap } from '../types.ts';

const PI = dec(314, 2);
/** Triplets pythagoriciens (pied, hauteur, côté oblique) : longueurs affichées exactes. */
const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [9, 12, 15],
  [12, 5, 13],
];
const coord = (x: number, y: number) => `(${fmt(x)} ; ${fmt(y)})`;

/* ───────────────────────── Repérage ───────────────────────── */

const droiteDecimaux: Skill = {
  id: 'm5-droite-decimaux',
  title: 'Lire une abscisse décimale',
  lesson: {
    body: [
      'On cherche d’abord la valeur d’**une graduation** : écart entre deux nombres écrits ÷ nombre d’intervalles.',
      'Puis on compte les graduations depuis le nombre écrit le plus proche.',
    ],
    example: {
      question: 'Entre 2 et 3 il y a 10 intervalles ; A est 7 graduations après 2.',
      steps: ['Une graduation vaut 1 ÷ 10 = 0,1.', 'A = 2 + 7 × 0,1 = 2,7.'],
    },
    source: objective('Sur une droite graduée : lire l’abscisse d’un point donné ; placer un point d’abscisse donnée'),
  },
  generate(rng, level) {
    const sub = level === 1 ? 2 : level === 2 ? 5 : 10;
    const start = rng.int(0, level === 3 ? 20 : 8);
    const max = start + 2;
    let k = rng.int(1, 2 * sub - 1);
    while (k % sub === 0) k = rng.int(1, 2 * sub - 1);
    const value = r(start * sub + k, sub);
    return {
      prompt: 'Quelle est l’abscisse du point **A** ?',
      figure: {
        kind: 'numberLine',
        min: start,
        max,
        subdivisions: sub,
        labels: [start, start + 1, max],
        points: [{ name: 'A', at: value.n / value.d }],
      },
      answer: num(value),
      traps: traps(value, [
        [
          r(start * 10 + k, 10),
          `Ici une graduation vaut ${fmt(r(1, sub))}, pas 0,1 : il y a ${sub} intervalles par unité.`,
        ],
      ]),
      steps: [
        `Entre ${start} et ${start + 1} : ${sub} intervalles, donc une graduation vaut ${fmt(r(1, sub))}.`,
        `A est à ${k} graduations après ${start} : ${start} + ${k} × ${fmt(r(1, sub))} = **${fmt(value)}**`,
      ],
    };
  },
};

const coordonnees: Skill = {
  id: 'm5-coordonnees',
  title: 'Coordonnées dans un repère',
  lesson: {
    body: [
      'Les coordonnées d’un point s’écrivent (abscisse ; ordonnée) : on lit d’abord **sur l’axe horizontal**, puis **sur l’axe vertical**.',
      'B(−3 ; 2) : 3 unités à gauche de l’origine, puis 2 vers le haut.',
    ],
    example: {
      question: 'Placer C(2 ; −4).',
      steps: ['Abscisse 2 : 2 unités vers la droite.', 'Ordonnée −4 : 4 unités vers le bas.'],
    },
    source: objective(
      'Dans le plan muni d’un repère orthogonal : lire les coordonnées d’un point donné ; placer un point de coordonnées données',
    ),
  },
  generate(rng, level) {
    const lim = 5;
    const x = level === 1 ? rng.int(1, lim) : nonZero(rng, -lim, lim);
    let y = level === 1 ? rng.int(1, lim) : nonZero(rng, -lim, lim);
    if (y === x) y = -y;
    const base = { kind: 'grid' as const, xMin: -lim, xMax: lim, yMin: -lim, yMax: lim, axes: true };
    if (level === 3) {
      const t: Trap[] = [
        {
          point: { x: y, y: x },
          why: 'Abscisse et ordonnée inversées : on se déplace d’abord horizontalement (abscisse).',
        },
        { point: { x: -x, y }, why: 'Erreur de signe sur l’abscisse : négatif = à gauche.' },
        { point: { x, y: -y }, why: 'Erreur de signe sur l’ordonnée : négatif = vers le bas.' },
      ].filter((p) => !(p.point.x === x && p.point.y === y));
      return {
        prompt: `Touche le quadrillage pour placer le point B${coord(x, y)}.`,
        figure: { ...base, points: [], pick: true },
        answer: { kind: 'point', x, y },
        traps: t,
        steps: [
          `Abscisse ${fmt(x)} : ${Math.abs(x)} unité${Math.abs(x) > 1 ? 's' : ''} vers la ${x > 0 ? 'droite' : 'gauche'}.`,
          `Ordonnée ${fmt(y)} : ${Math.abs(y)} unité${Math.abs(y) > 1 ? 's' : ''} vers le ${y > 0 ? 'haut' : 'bas'}.`,
        ],
      };
    }
    return {
      prompt: 'Quelles sont les coordonnées du point **A** ?',
      figure: { ...base, points: [{ name: 'A', x, y, color: 'accent' }] },
      ...choice(rng, coord(x, y), [
        { label: coord(y, x), why: 'On écrit d’abord l’abscisse (axe horizontal), puis l’ordonnée.' },
        { label: coord(-x, y), why: 'Le signe de l’abscisse est faux.' },
        { label: coord(x, -y), why: 'Le signe de l’ordonnée est faux.' },
      ]),
      steps: [`Abscisse (horizontal) : ${fmt(x)} ; ordonnée (vertical) : ${fmt(y)}.`, `A**${coord(x, y)}**`],
    };
  },
};

/* ───────────────────────── Espace ───────────────────────── */

const volumes: Skill = {
  id: 'm5-volumes',
  tools: ['calculatrice'],
  title: 'Volume du cube, du pavé, du prisme',
  lesson: {
    body: [
      'Cube d’arête a : V = a × a × a = a^3.',
      'Pavé droit : V = L × ℓ × h.',
      'Prisme droit : V = aire de la base × hauteur.',
      'Si les longueurs sont en cm, le volume est en cm^3.',
    ],
    example: { question: 'Pavé de 5 cm × 3 cm × 2 cm.', steps: ['V = 5 × 3 × 2 = 30 cm^3.'] },
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
        steps: [`V = ${a} × ${a} × ${a} = **${v}** cm^3`],
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
        steps: [`V = L × ℓ × h = ${L} × ${l} × ${h} = **${v}** cm^3`],
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
      steps: [
        `Aire de la base : ${a} × ${b} ÷ 2 = ${base} cm^2.`,
        `V = aire de la base × hauteur = ${base} × ${h} = **${v}** cm^3`,
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
    body: [
      '1 m^3 = 1 000 dm^3 et 1 dm^3 = 1 000 cm^3 : on passe d’une unité à la suivante en × ou ÷ **1 000**.',
      '1 dm^3 = 1 L et 1 cm^3 = 1 mL. 1 L = 100 cL = 1 000 mL.',
    ],
    example: { question: '2,5 L = … cm^3', steps: ['2,5 L = 2,5 dm^3.', '2,5 × 1 000 = 2 500 cm^3.'] },
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
      steps: [
        'Rappels : 1 m^3 = 1 000 dm^3 = 1 000 000 cm^3 ; 1 dm^3 = 1 L = 100 cL = 1 000 mL ; 1 cm^3 = 1 mL.',
        `${fmt(x)} ${from.u} = **${fmt(result)} ${to.u}**`,
      ],
    };
  },
};

const disque: Skill = {
  id: 'm5-disque',
  tools: ['calculatrice'],
  title: 'Aire du disque, volume du cylindre',
  lesson: {
    body: [
      'Aire d’un disque de rayon r : A = π × r × r = π × r^2 (avec π ≈ 3,14).',
      'Attention : si on donne le diamètre, le rayon est la moitié.',
      'Volume d’un cylindre : V = aire du disque de base × hauteur = π × r^2 × h.',
    ],
    example: {
      question: 'Aire d’un disque de rayon 5 cm (π ≈ 3,14).',
      steps: ['A = 3,14 × 5 × 5 = 3,14 × 25 = 78,5 cm^2.'],
    },
    source: objective('Calculer l’aire du disque, le volume du cylindre de révolution'),
  },
  generate(rng, level) {
    const radius = rng.int(1, 10);
    const area = mul(PI, r(radius * radius));
    if (level === 3) {
      const h = rng.int(2, 10);
      const v = mul(area, r(h));
      return {
        prompt: `Calcule le volume d’un cylindre de rayon ${radius} cm et de hauteur ${h} cm (prends π ≈ 3,14, résultat en cm^3).`,
        figure: { kind: 'solid', solid: 'cylindre', labels: [`${radius} cm`, `${h} cm`] },
        answer: num(v, 'cm^3'),
        traps: traps(v, [
          [
            mul(mul(PI, r(2 * radius)), r(h)),
            'La base est un disque : on prend son **aire** π × r^2, pas son périmètre.',
          ],
          [area, `Il faut encore multiplier l’aire de la base par la hauteur ${h}.`],
        ]),
        steps: [
          `Aire de la base : 3,14 × ${radius}^2 = ${fmt(area)} cm^2.`,
          `V = ${fmt(area)} × ${h} = **${fmt(v)}** cm^3`,
        ],
        targetSeconds: 60,
      };
    }
    const givenDiameter = level === 2;
    return {
      prompt: givenDiameter
        ? `Calcule l’aire d’un disque de **diamètre** ${2 * radius} cm (prends π ≈ 3,14, résultat en cm^2).`
        : `Calcule l’aire d’un disque de rayon ${radius} cm (prends π ≈ 3,14, résultat en cm^2).`,
      figure: {
        kind: 'disk',
        radiusLabel: givenDiameter ? `${2 * radius} cm` : `${radius} cm`,
        diameter: givenDiameter,
      },
      answer: num(area, 'cm^2'),
      traps: traps(area, [
        [mul(PI, r(2 * radius)), 'π × diamètre donne le **périmètre** du cercle, pas l’aire.'],
        [mul(PI, r(4 * radius * radius)), 'Le diamètre a été utilisé à la place du rayon : r = diamètre ÷ 2.'],
        [mul(PI, r(2 * radius * radius)), 'r^2 = r × r, pas 2 × r.'],
      ]),
      steps: [
        ...(givenDiameter ? [`Rayon = ${2 * radius} ÷ 2 = ${radius} cm.`] : []),
        `A = 3,14 × ${radius} × ${radius} = 3,14 × ${radius * radius} = **${fmt(area)}** cm^2`,
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
    body: [
      'Un patron de cube est formé de **6 carrés** qui, pliés, recouvrent les 6 faces sans chevauchement.',
      'Jamais 4 carrés en carré 2 × 2, jamais 5 carrés alignés : ils se superposeraient au pliage.',
    ],
    example: {
      question: 'Une croix de 6 carrés est-elle un patron ?',
      steps: [
        'La bande de 4 forme le tour du cube, les 2 carrés de part et d’autre font le dessus et le dessous.',
        'Oui.',
      ],
    },
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
      steps: [
        isNet
          ? 'Une bande de 4 carrés fait le tour ; les 2 autres ferment le dessus et le dessous : **oui**.'
          : 'Au pliage, deux faces se superposent et une face reste ouverte : **non**.',
      ],
      targetSeconds: 25,
    };
  },
};

/* ───────────────────────── Symétries ───────────────────────── */

const symetrieAxiale: Skill = {
  id: 'm5-symetrie-axiale',
  title: 'Symétrie axiale sur quadrillage',
  lesson: {
    body: [
      'Le symétrique de A par rapport à la droite (d) est le point A′ tel que (d) soit la **médiatrice** de [AA′] : même distance à l’axe, de l’autre côté, perpendiculairement.',
    ],
    example: {
      question: 'A est 3 carreaux à gauche d’un axe vertical.',
      steps: ['A′ est 3 carreaux à droite, sur la même ligne.'],
    },
    source:
      objective(
        'Reconnaitre et construire le symétrique d’une figure par symétrie axiale, dont l’axe est vertical, horizontal, ou en diagonale sur quadrillage',
      ) + ' (automatisme)',
  },
  generate(rng, level) {
    const lim = 6;
    const kind = level === 1 ? 'v' : level === 2 ? rng.pick(['v', 'h'] as const) : 'd';
    const c = rng.int(-1, 1);
    let x = rng.int(-lim + 1, lim - 1);
    let y = rng.int(-lim + 1, lim - 1);
    if (kind === 'v' && x === c) x = c - rng.int(1, 3);
    if (kind === 'h' && y === c) y = c + rng.int(1, 3);
    if (kind === 'd' && x === y) x = y - rng.int(1, 3);
    const image = kind === 'v' ? { x: 2 * c - x, y } : kind === 'h' ? { x, y: 2 * c - y } : { x: y, y: x };
    const axis =
      kind === 'v'
        ? { x1: c, y1: -lim, x2: c, y2: lim }
        : kind === 'h'
          ? { x1: -lim, y1: c, x2: lim, y2: c }
          : { x1: -lim, y1: -lim, x2: lim, y2: lim };
    const inRange = Math.abs(image.x) <= lim && Math.abs(image.y) <= lim;
    if (!inRange) return symetrieAxiale.generate(rng, level);
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
        axis,
        pick: true,
      },
      answer: { kind: 'point', ...image },
      traps: [
        {
          point: { x: -x, y: -y },
          why: 'Ça, c’est une symétrie centrale (demi-tour). Ici on « plie » le long de la droite.',
        },
        ...(kind === 'v'
          ? [{ point: { x, y: 2 * c - y }, why: 'L’axe est vertical : A′ reste sur la même ligne horizontale que A.' }]
          : []),
      ].filter((t) => !(t.point.x === image.x && t.point.y === image.y)),
      steps: [
        'A′ est de l’autre côté de l’axe, à la même distance, et [AA′] est perpendiculaire à l’axe.',
        'Compte les carreaux entre A et l’axe, puis le même nombre de l’autre côté : A′ est le nœud entouré en vert.',
      ],
    };
  },
};

const symetrieCentrale: Skill = {
  id: 'm5-symetrie-centrale',
  title: 'Symétrie centrale (demi-tour)',
  lesson: {
    body: [
      'Le symétrique de A par rapport au point O est le point A′ tel que **O est le milieu de [AA′]** : c’est un demi-tour autour de O.',
      'Sur quadrillage : on compte le déplacement de A vers O, et on le refait une fois de plus à partir de O.',
    ],
    example: {
      question: 'Pour aller de A à O : 2 à droite, 3 en haut.',
      steps: ['On refait le même trajet à partir de O : 2 à droite, 3 en haut.', 'On arrive en A′.'],
    },
    source: objective('Définir le demi-tour, ou symétrie centrale'),
  },
  generate(rng) {
    const lim = 6;
    const ox = rng.int(-2, 2);
    const oy = rng.int(-2, 2);
    let dx = 0;
    let dy = 0;
    while (
      (dx === 0 && dy === 0) ||
      Math.abs(ox + dx) > lim ||
      Math.abs(oy + dy) > lim ||
      Math.abs(ox - dx) > lim ||
      Math.abs(oy - dy) > lim
    ) {
      dx = rng.int(-4, 4);
      dy = rng.int(-4, 4);
    }
    const A = { x: ox - dx, y: oy - dy };
    const image = { x: ox + dx, y: oy + dy };
    return {
      prompt: 'Touche le quadrillage pour placer A′, le symétrique de A par rapport au point O.',
      figure: {
        kind: 'grid',
        xMin: -lim,
        xMax: lim,
        yMin: -lim,
        yMax: lim,
        axes: false,
        points: [
          { name: 'A', ...A, color: 'accent' },
          { name: 'O', x: ox, y: oy, color: 'muted' },
        ],
        pick: true,
      },
      answer: { kind: 'point', ...image },
      traps: [
        {
          point: { x: 2 * ox - A.x, y: A.y },
          why: 'Ça ressemble à une symétrie axiale. En symétrie centrale, O doit être le **milieu** de [AA′].',
        },
        {
          point: { x: A.x, y: 2 * oy - A.y },
          why: 'Ça ressemble à une symétrie axiale. En symétrie centrale, O doit être le **milieu** de [AA′].',
        },
        {
          point: {
            x: ox + Math.sign(dx) * Math.ceil(Math.abs(dx) / 2),
            y: oy + Math.sign(dy) * Math.ceil(Math.abs(dy) / 2),
          },
          why: 'Trop près : A′ doit être aussi loin de O que A.',
        },
      ].filter((t) => !(t.point.x === image.x && t.point.y === image.y)),
      steps: [
        `De A à O : ${Math.abs(dx)} ${dx >= 0 ? 'vers la droite' : 'vers la gauche'}, ${Math.abs(dy)} ${dy >= 0 ? 'vers le haut' : 'vers le bas'}.`,
        'On refait le même déplacement à partir de O : on obtient A′, et O est le milieu de [AA′].',
      ],
    };
  },
};

const proprietesSymetrie: Skill = {
  id: 'm5-symetrie-proprietes',
  title: 'Propriétés de la symétrie centrale',
  lesson: {
    body: [
      'La symétrie centrale **conserve** les longueurs, les angles, les aires et l’alignement.',
      'L’image d’une droite est une droite **parallèle**. Le centre O est le milieu de chaque segment [MM′].',
    ],
    example: {
      question: '[AB] mesure 4 cm. Combien mesure son symétrique [A′B′] ?',
      steps: ['La symétrie centrale conserve les longueurs : A′B′ = 4 cm.'],
    },
    source: objective('Connaitre les propriétés du demi-tour'),
  },
  generate(rng, level) {
    if (level === 1) {
      const l = dec(rng.int(15, 95), 1);
      return {
        prompt: `[AB] mesure ${fmt(l)} cm. [A′B′] est son symétrique par rapport à un point O. Combien mesure [A′B′] (en cm) ?`,
        answer: num(l, 'cm'),
        traps: traps(l, [[mul(l, r(2)), 'La symétrie centrale conserve les longueurs : on ne double pas.']]),
        steps: [`La symétrie centrale conserve les longueurs : A′B′ = AB = **${fmt(l)}** cm.`],
        targetSeconds: 10,
      };
    }
    const statements = [
      { t: 'Une symétrie centrale conserve les longueurs.', v: true, why: 'Un demi-tour ne déforme pas la figure.' },
      {
        t: 'Une symétrie centrale conserve les mesures des angles.',
        v: true,
        why: 'Un demi-tour ne déforme pas la figure.',
      },
      {
        t: 'L’image d’une droite par une symétrie centrale est une droite parallèle.',
        v: true,
        why: 'Un demi-tour « retourne » la droite sans changer sa direction.',
      },
      {
        t: 'Le centre de symétrie est le milieu du segment [MM′].',
        v: true,
        why: 'C’est la définition du symétrique par rapport à un point.',
      },
      {
        t: 'L’image d’une droite par une symétrie centrale lui est perpendiculaire.',
        v: false,
        why: 'Elle lui est parallèle (ou confondue si elle passe par le centre).',
      },
      { t: 'Une symétrie centrale double les aires.', v: false, why: 'Elle conserve les aires.' },
      {
        t: 'Un point et son symétrique sont à des distances différentes du centre.',
        v: false,
        why: 'Le centre est le milieu de [MM′] : les distances sont égales.',
      },
    ];
    const s = rng.pick(statements);
    return {
      prompt: `Vrai ou faux : ${s.t}`,
      ...trueFalse(s.v, s.why),
      steps: [`${s.v ? '**Vrai**' : '**Faux**'} : ${s.why}`],
    };
  },
};

/* ───────────────────────── Angles ───────────────────────── */

const anglesVocab: Skill = {
  id: 'm5-angles-vocab',
  title: 'Vocabulaire des angles',
  lesson: {
    body: [
      'Angle droit : 90°. Angle plat : 180°. Aigu : moins de 90°. Obtus : entre 90° et 180°.',
      '**Supplémentaires** : somme 180°. **Opposés par le sommet** : de part et d’autre d’un même sommet, ils ont la même mesure.',
      'La **bissectrice** partage un angle en deux angles égaux. Équerres : 30°, 60°, 90° ou 45°, 45°, 90°.',
    ],
    example: {
      question: 'Deux angles opposés par le sommet ; l’un mesure 35°.',
      steps: ['Ils ont la même mesure : l’autre mesure 35°.'],
    },
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
        steps: [`${q.q} **${q.a}**.`],
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
      steps: [opp ? `Opposés par le sommet ⇒ même mesure : **${v}°**.` : `Supplémentaires ⇒ 180° − ${a}° = **${v}°**.`],
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
    body: [
      'Une sécante coupe deux droites. Deux angles **alternes-internes** sont entre les deux droites, de part et d’autre de la sécante. Deux angles **correspondants** sont du même côté de la sécante, à la même place à chaque intersection.',
      'Si les deux droites sont **parallèles**, les angles alternes-internes sont égaux, et les angles correspondants aussi.',
      'Réciproquement : si deux angles alternes-internes (ou correspondants) sont égaux, les droites sont parallèles.',
    ],
    example: {
      question: '(d) // (d′) et un angle alterne-interne mesure 65°.',
      steps: ['Droites parallèles ⇒ angles alternes-internes égaux.', 'L’autre mesure 65°.'],
    },
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
        steps: [`a et b sont **${pair.name}**.`],
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
        steps: [
          parallel
            ? 'Alternes-internes égaux ⇒ droites **parallèles**.'
            : `${theta}° ≠ ${other}° ⇒ droites **non parallèles**.`,
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
      steps: [
        `a et b sont ${pair.name}${pair.name === 'opposés par le sommet' ? '' : ' et (d) // (d′)'} : ils sont égaux.`,
        `b = **${asked}°**`,
      ],
    };
  },
};

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
  lesson: {
    body: [
      'Dans un triangle, la somme des trois angles vaut **180°**.',
      'Triangle isocèle : les deux angles à la base sont égaux. Équilatéral : trois angles de 60°. Rectangle : un angle de 90°, les deux autres font 90° à eux deux.',
    ],
    example: {
      question: 'Deux angles mesurent 48° et 75°. Le troisième ?',
      steps: ['180 − 48 − 75 = 57.', 'Il mesure 57°.'],
    },
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
        steps: [`180° − ${b}° − ${c}° = **${a}°**`],
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
            steps: [
              `Les angles en B et C sont égaux (isocèle en A) et valent ensemble 180° − ${apex}° = ${180 - apex}°.`,
              `B = ${180 - apex} ÷ 2 = **${base}°**`,
            ],
          }
        : {
            prompt: `ABC est isocèle en A et l’angle en B mesure ${base}°. Combien mesure l’angle en A (en °) ?`,
            figure: { kind: 'polygon', vertices: v, angleLabels: ['?', `${base}°`, null], ticks: [1, 0, 1] },
            answer: num(apex, '°'),
            traps: traps(r(apex), [
              [180 - base, `L’angle en C mesure aussi ${base}° (isocèle) : il faut l’enlever aussi.`],
            ]),
            steps: [
              `Isocèle en A : l’angle en C mesure aussi ${base}°.`,
              `A = 180° − ${base}° − ${base}° = **${apex}°**`,
            ],
          };
    }
    const [x, y] = distinct(rng, 2, () => rng.int(20, 120));
    const z = rng.next() < 0.5 ? 180 - (x ?? 0) - (y ?? 0) : rng.int(20, 100);
    const ok = (x ?? 0) + (y ?? 0) + z === 180 && z > 0;
    return {
      prompt: `Peut-on construire un triangle dont les angles mesurent ${x}°, ${y}° et ${z}° ?`,
      ...trueFalse(ok, `${x} + ${y} + ${z} = ${(x ?? 0) + (y ?? 0) + z}° ; il faut exactement 180°.`),
      steps: [
        `${x} + ${y} + ${z} = ${(x ?? 0) + (y ?? 0) + z}.`,
        ok ? 'La somme fait 180° : **oui**.' : 'La somme ne fait pas 180° : **non**.',
      ],
      targetSeconds: 25,
    };
  },
};

const triangleAire: Skill = {
  id: 'm5-triangle-aire',
  title: 'Aire d’un triangle',
  lesson: {
    body: [
      'Aire d’un triangle = **base × hauteur ÷ 2**, la hauteur étant perpendiculaire à la base.',
      'On n’utilise pas la longueur d’un côté oblique comme hauteur.',
    ],
    example: { question: 'Base 8 cm, hauteur 5 cm.', steps: ['8 × 5 ÷ 2 = 20 cm^2.'] },
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
      steps: [
        `Base ${b} cm, hauteur ${fmt(h)} cm (la hauteur est perpendiculaire à la base).`,
        `A = ${b} × ${fmt(h)} ÷ 2 = **${fmt(area)}** cm^2`,
      ],
      targetSeconds: 30,
    };
  },
};

const droitesRemarquables: Skill = {
  id: 'm5-droites-remarquables',
  title: 'Hauteurs, médianes, médiatrices',
  lesson: {
    body: [
      '**Hauteur** : passe par un sommet et est perpendiculaire au côté opposé. Les 3 hauteurs sont concourantes.',
      '**Médiane** : relie un sommet au milieu du côté opposé. Elle partage le triangle en deux triangles de même aire.',
      '**Médiatrice** d’un côté : perpendiculaire à ce côté en son milieu. Les 3 médiatrices se coupent au centre du cercle circonscrit.',
    ],
    example: {
      question: 'Segment issu de A, perpendiculaire à [BC].',
      steps: ['Il passe par un sommet et est perpendiculaire au côté opposé : c’est une hauteur.'],
    },
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
        steps: [`${s.v ? '**Vrai**' : '**Faux**'} : ${s.why}`],
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
      steps: [
        kind === 'hauteur'
          ? 'Passe par un sommet + perpendiculaire au côté opposé ⇒ **hauteur**.'
          : kind === 'médiane'
            ? 'Relie un sommet au milieu du côté opposé ⇒ **médiane**.'
            : 'Perpendiculaire à un côté en son milieu ⇒ **médiatrice**.',
      ],
    };
  },
};

/* ───────────────────────── Parallélogrammes ───────────────────────── */

const paraProprietes: Skill = {
  id: 'm5-para-proprietes',
  title: 'Propriétés des parallélogrammes',
  lesson: {
    body: [
      '**Parallélogramme** : côtés opposés parallèles. Ses côtés opposés ont la même longueur et ses **diagonales se coupent en leur milieu** (et réciproquement).',
      '**Rectangle** : parallélogramme avec un angle droit ; diagonales de même longueur.',
      '**Losange** : parallélogramme avec deux côtés consécutifs égaux ; diagonales perpendiculaires.',
      '**Carré** : à la fois rectangle et losange.',
    ],
    example: {
      question: 'Diagonales qui se coupent en leur milieu et sont perpendiculaires ?',
      steps: ['Milieu commun ⇒ parallélogramme ; perpendiculaires ⇒ losange.'],
    },
    source: objective(
      'Connaitre les propriétés caractéristiques des côtés opposés et des diagonales. Définir les parallélogrammes particuliers (rectangle, losange, carré)',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const cases = [
        { d: 'ses diagonales se coupent en leur milieu', a: 'un parallélogramme' },
        { d: 'ses diagonales se coupent en leur milieu et ont la même longueur', a: 'un rectangle' },
        { d: 'ses diagonales se coupent en leur milieu et sont perpendiculaires', a: 'un losange' },
        { d: 'ses diagonales se coupent en leur milieu, sont perpendiculaires et ont la même longueur', a: 'un carré' },
      ];
      const c = rng.pick(cases);
      const all = ['un parallélogramme', 'un rectangle', 'un losange', 'un carré', 'un trapèze'];
      return {
        prompt: `Un quadrilatère dont ${c.d} est forcément…`,
        ...choice(
          rng,
          c.a,
          all
            .filter((x) => x !== c.a)
            .slice(0, 3)
            .map((label) => ({
              label,
              why: `Milieu commun ⇒ parallélogramme ; même longueur ⇒ rectangle ; perpendiculaires ⇒ losange ; les deux ⇒ carré. Ici : ${c.a}.`,
            })),
        ),
        steps: [`${c.d.charAt(0).toUpperCase()}${c.d.slice(1)} ⇒ **${c.a}**.`],
      };
    }
    const st =
      level === 1
        ? [
            {
              t: 'Les diagonales d’un parallélogramme se coupent en leur milieu.',
              v: true,
              why: 'C’est une propriété caractéristique du parallélogramme.',
            },
            {
              t: 'Les côtés opposés d’un parallélogramme ont la même longueur.',
              v: true,
              why: 'C’est une propriété du parallélogramme.',
            },
            {
              t: 'Les diagonales d’un parallélogramme ont toujours la même longueur.',
              v: false,
              why: 'Seulement pour le rectangle (et le carré).',
            },
            {
              t: 'Les diagonales d’un parallélogramme sont toujours perpendiculaires.',
              v: false,
              why: 'Seulement pour le losange (et le carré).',
            },
          ]
        : [
            {
              t: 'Les diagonales d’un rectangle ont la même longueur.',
              v: true,
              why: 'C’est une propriété du rectangle.',
            },
            {
              t: 'Les diagonales d’un losange sont perpendiculaires.',
              v: true,
              why: 'C’est une propriété du losange.',
            },
            {
              t: 'Un carré est un losange.',
              v: true,
              why: 'Un carré a 4 côtés égaux : c’est un losange (et un rectangle).',
            },
            {
              t: 'Un losange a toujours quatre angles droits.',
              v: false,
              why: 'Seul le carré est un losange avec des angles droits.',
            },
            {
              t: 'Un rectangle a toujours quatre côtés de même longueur.',
              v: false,
              why: 'Seul le carré est un rectangle avec 4 côtés égaux.',
            },
          ];
    const s = rng.pick(st);
    return {
      prompt: `Vrai ou faux : ${s.t}`,
      ...trueFalse(s.v, s.why),
      steps: [`${s.v ? '**Vrai**' : '**Faux**'} : ${s.why}`],
      targetSeconds: 15,
    };
  },
};

const paraAire: Skill = {
  id: 'm5-para-aire',
  title: 'Aire d’un parallélogramme',
  lesson: {
    body: [
      'Aire d’un parallélogramme = **base × hauteur** (la hauteur est perpendiculaire à la base).',
      'On n’utilise pas le côté oblique : ce n’est pas la hauteur.',
    ],
    example: {
      question: 'Base 7 cm, hauteur 4 cm, côté oblique 5 cm.',
      steps: ['A = 7 × 4 = 28 cm^2 (le 5 cm ne sert pas).'],
    },
    source: objective('Savoir calculer l’aire d’un parallélogramme et de figures complexes'),
  },
  generate(rng, level) {
    const [tf, th, ts] = rng.pick(TRIPLES);
    const scale = level === 3 ? r(1, 2) : r(1);
    const shift = level === 1 ? rng.int(1, 3) : (tf * scale.n) / scale.d;
    const h: Rational = level === 1 ? r(rng.int(2, 9)) : mul(r(th), scale);
    const side: Rational | null = level === 1 ? null : mul(r(ts), scale);
    const b = rng.int(4, 12);
    const hv = h.n / h.d;
    const area = mul(r(b), h);
    return {
      prompt: 'Calcule l’aire de ce parallélogramme (en cm^2).',
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: b, y: 0 },
          { name: 'C', x: b + shift, y: hv },
          { name: 'D', x: shift, y: hv },
        ],
        sideLabels: [`${b} cm`, side ? `${fmt(side)} cm` : null, null, null],
        extra: [{ from: { x: shift, y: hv }, to: { x: shift, y: 0 }, label: `${fmt(h)} cm`, rightAngleAtEnd: true }],
      },
      answer: num(area, 'cm^2'),
      traps: traps(area, [
        [mul(mul(r(b), h), r(1, 2)), 'Pas de division par 2 : c’est la formule du triangle.'],
        ...(side
          ? ([
              [mul(r(b), side), 'Le côté oblique n’est pas la hauteur : la hauteur est perpendiculaire à la base.'],
            ] as [Rational, string][])
          : []),
      ]),
      steps: [`A = base × hauteur = ${b} × ${fmt(h)} = **${fmt(area)}** cm^2`],
    };
  },
};

const LENGTH = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

const conversionsLA: Skill = {
  id: 'm5-conversions-longueur-aire',
  tools: ['conversion-longueur', 'conversion-aire'],
  title: 'Convertir longueurs et aires',
  lesson: {
    body: [
      'Longueurs : km, hm, dam, m, dm, cm, mm — on passe d’une unité à la suivante en × ou ÷ **10**.',
      'Aires : km^2, hm^2, dam^2, m^2, dm^2, cm^2, mm^2 — on passe d’une unité à la suivante en × ou ÷ **100** (1 m^2 = 100 dm^2, car 1 m × 1 m = 10 dm × 10 dm).',
    ],
    example: { question: '450 cm^2 = … dm^2', steps: ['1 dm^2 = 100 cm^2.', '450 ÷ 100 = 4,5 dm^2.'] },
    source: objective(
      'Résoudre des problèmes faisant appel à des conversions d’unités de longueur et d’unités d’aires',
    ),
  },
  generate(rng, level) {
    const area = level >= 2;
    const i = rng.int(level === 3 ? 2 : 3, 5);
    const j = Math.min(6, Math.max(0, i + rng.pick(level === 1 ? [1, 2, -1] : [1, -1, 2])));
    const from = LENGTH[i] ?? 'm';
    const to = LENGTH[j] ?? 'cm';
    const x = level === 1 ? dec(rng.int(11, 99), 1) : dec(rng.int(1, 999), rng.int(0, 1));
    const factor = area ? 100 : 10;
    const steps = j - i;
    const result = steps >= 0 ? mul(x, r(factor ** steps)) : mul(x, r(1, factor ** -steps));
    const linear = steps >= 0 ? mul(x, r(10 ** steps)) : mul(x, r(1, 10 ** -steps));
    const sup = area ? '^2' : '';
    return {
      prompt: `Complète : ${fmt(x)} ${from}${sup} = … ${to}${sup}`,
      answer: num(result, `${to}${sup}`),
      traps: traps(result, [
        ...(area
          ? ([[linear, 'Pour les aires, on multiplie (ou divise) par 100 d’une unité à la suivante, pas par 10.']] as [
              Rational,
              string,
            ][])
          : []),
        [
          steps >= 0 ? mul(x, r(1, factor ** steps)) : mul(x, r(factor ** -steps)),
          'Mauvais sens : vers une unité plus petite, le nombre devient plus grand.',
        ],
      ]),
      steps: [
        `De ${from}${sup} à ${to}${sup} : ${Math.abs(steps)} rang${Math.abs(steps) > 1 ? 's' : ''}, donc ${steps >= 0 ? '×' : '÷'} ${fmt(factor ** Math.abs(steps))}.`,
        `${fmt(x)} ${from}${sup} = **${fmt(result)} ${to}${sup}**`,
      ],
    };
  },
};

export const reperage: Chapter = {
  id: 'm5-reperage',
  subject: 'maths',
  domain: 'geometrie',
  title: 'Repérage',
  skills: [droiteDecimaux, coordonnees],
};

export const espace: Chapter = {
  id: 'm5-espace',
  subject: 'maths',
  domain: 'geometrie',
  title: 'Solides et volumes',
  skills: [volumes, conversionsVolume, disque, patron],
};

export const symetries: Chapter = {
  id: 'm5-symetries',
  subject: 'maths',
  domain: 'geometrie',
  title: 'Symétries',
  skills: [symetrieAxiale, symetrieCentrale, proprietesSymetrie],
};

export const angles: Chapter = {
  id: 'm5-angles',
  subject: 'maths',
  domain: 'geometrie',
  title: 'Angles',
  skills: [anglesVocab, anglesParalleles],
};

export const triangles: Chapter = {
  id: 'm5-triangles',
  subject: 'maths',
  domain: 'geometrie',
  title: 'Triangles',
  skills: [triangleAngles, triangleAire, droitesRemarquables],
};

export const parallelogrammes: Chapter = {
  id: 'm5-parallelogrammes',
  subject: 'maths',
  domain: 'geometrie',
  title: 'Parallélogrammes',
  skills: [paraProprietes, paraAire, conversionsLA],
};
