import { choice, distinct, nonZero, num, objective, traps, trueFalse } from '../build.ts';
import { dec, fmt, fromNumber, mul, r, type Rational } from '../rational.ts';
import type { AnswerSpec, Chapter, Skill, Trap } from '../types.ts';

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
    memo: [
      'Avant tout, trouve ce que vaut **une case** : compte les cases entre deux nombres écrits (pas les traits !).',
      '10 cases entre 2 et 3 → une case vaut 0,1. 5 cases → une case vaut 0,2. 2 cases → 0,5.',
      'Puis pars du nombre écrit juste avant le point et avance case par case.',
    ],
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
      hint: `Compte les cases entre ${start} et ${start + 1} : combien vaut une case ?`,
      steps: [
        `Entre ${start} et ${start + 1}, on compte ${sub} cases. Une case vaut donc 1 ÷ ${sub} = ${fmt(r(1, sub))}.`,
        k < sub
          ? `On part de ${start} et on avance de ${k} case${k > 1 ? 's' : ''} jusqu’à A : ${k} × ${fmt(r(1, sub))} = ${fmt(r(k, sub))}.`
          : `On part de ${start + 1} (le nombre écrit juste avant A) et on avance de ${k - sub} case${k - sub > 1 ? 's' : ''} : ${k - sub} × ${fmt(r(1, sub))} = ${fmt(r(k - sub, sub))}.`,
        `A = ${k < sub ? start : start + 1} + ${fmt(r(k < sub ? k : k - sub, sub))} = **${fmt(value)}**`,
      ],
    };
  },
};

const coordonnees: Skill = {
  id: 'm5-coordonnees',
  title: 'Coordonnées dans un repère',
  lesson: {
    memo: [
      'Pour aller à B(−3 ; 2), pars du centre : **d’abord on marche** (horizontal : 3 vers la gauche), **ensuite on monte** (vertical : 2 vers le haut).',
      'Moyen de retenir : « on prend l’ascenseur après avoir marché dans le couloir ». Négatif = gauche ou bas.',
    ],
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
        hint: `Pars du centre : d’abord ${fmt(x)} à l’horizontale, puis ${fmt(y)} à la verticale. Négatif = gauche ou bas.`,
        steps: [
          `On part du centre du repère (l’origine).`,
          `1er nombre, ${fmt(x)} : on marche de ${Math.abs(x)} case${Math.abs(x) > 1 ? 's' : ''} vers la ${x > 0 ? 'droite' : 'gauche'}${x < 0 ? ' (négatif = gauche)' : ''}.`,
          `2e nombre, ${fmt(y)} : on ${y > 0 ? 'monte' : 'descend'} de ${Math.abs(y)} case${Math.abs(y) > 1 ? 's' : ''}${y < 0 ? ' (négatif = bas)' : ''}. Le point B est **là, entouré en vert**.`,
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
      hint: 'Pars du centre : combien de cases à l’horizontale pour être sous (ou sur) A ? Puis combien à la verticale ?',
      steps: [
        `On part du centre et on va jusqu’à A en deux temps.`,
        `À l’horizontale : ${Math.abs(x)} case${Math.abs(x) > 1 ? 's' : ''} vers la ${x > 0 ? 'droite' : 'gauche'} → ${fmt(x)}. C’est le 1er nombre.`,
        `À la verticale : ${Math.abs(y)} case${Math.abs(y) > 1 ? 's' : ''} vers le ${y > 0 ? 'haut' : 'bas'} → ${fmt(y)}. C’est le 2e nombre : A**${coord(x, y)}**.`,
      ],
    };
  },
};

/* ───────────────────────── Espace ───────────────────────── */

const volumes: Skill = {
  id: 'm5-volumes',
  tools: ['calculatrice'],
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
  tools: ['calculatrice'],
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

/* ───────────────────────── Symétries ───────────────────────── */

const symetrieAxiale: Skill = {
  id: 'm5-symetrie-axiale',
  title: 'Symétrie axiale sur quadrillage',
  lesson: {
    memo: [
      'La symétrie axiale, c’est un **pliage** le long de la droite : A′ est l’endroit où A se poserait en pliant la feuille.',
      'Compte les carreaux de A jusqu’à l’axe (en allant tout droit vers lui), puis le même nombre de l’autre côté.',
    ],
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
      hint:
        kind === 'd'
          ? 'Imagine qu’on plie la feuille le long de la diagonale rouge : où A se pose-t-il ? (Va vers l’axe en suivant les diagonales des carreaux.)'
          : `Compte les carreaux de A jusqu’à l’axe, en allant tout droit ${kind === 'v' ? 'à l’horizontale' : 'à la verticale'}, puis le même nombre de l’autre côté.`,
      steps:
        kind === 'd'
          ? [
              'On imagine qu’on plie la feuille le long de la droite rouge (la diagonale).',
              'Pour aller de A à l’axe, on avance en diagonale, perpendiculairement à lui, et on continue d’autant de l’autre côté.',
              'A′ est **le nœud entouré en vert** : en pliant, A tombe pile dessus.',
            ]
          : [
              'On imagine qu’on plie la feuille le long de la droite rouge.',
              `De A jusqu’à l’axe, on compte ${Math.abs((kind === 'v' ? x : y) - c)} carreau${Math.abs((kind === 'v' ? x : y) - c) > 1 ? 'x' : ''}, en allant tout droit ${kind === 'v' ? 'à l’horizontale' : 'à la verticale'}.`,
              `On en compte autant de l’autre côté, sur la même ${kind === 'v' ? 'ligne' : 'colonne'} : A′ est **le nœud entouré en vert**.`,
            ],
    };
  },
};

const symetrieCentrale: Skill = {
  id: 'm5-symetrie-centrale',
  title: 'Symétrie centrale (demi-tour)',
  lesson: {
    memo: [
      'La symétrie centrale, c’est un **demi-tour** autour du point O, comme une aiguille qui tourne.',
      'Sur quadrillage : compte le trajet de A jusqu’à O (par exemple 2 à droite, 3 en haut), puis **refais exactement le même trajet** à partir de O.',
    ],
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
      hint: 'Compte le trajet de A jusqu’à O (à l’horizontale puis à la verticale), et refais le même trajet à partir de O.',
      steps: [
        `On compte le trajet de A jusqu’à O : ${Math.abs(dx)} carreau${Math.abs(dx) > 1 ? 'x' : ''} ${dx >= 0 ? 'vers la droite' : 'vers la gauche'}, ${Math.abs(dy)} ${dy >= 0 ? 'vers le haut' : 'vers le bas'}.`,
        `On refait exactement le même trajet à partir de O : ${Math.abs(dx)} ${dx >= 0 ? 'vers la droite' : 'vers la gauche'}, ${Math.abs(dy)} ${dy >= 0 ? 'vers le haut' : 'vers le bas'}.`,
        'On arrive sur A′, **le nœud entouré en vert**. O est pile au milieu de A et A′.',
      ],
    };
  },
};

const proprietesSymetrie: Skill = {
  id: 'm5-symetrie-proprietes',
  title: 'Propriétés de la symétrie centrale',
  lesson: {
    memo: [
      'Un demi-tour, c’est comme faire tourner un dessin sur la table : il ne se déforme pas.',
      'Donc les longueurs, les angles et les aires **restent les mêmes**. Une droite devient une droite **parallèle** (elle est juste retournée).',
    ],
    source: objective('Connaitre les propriétés du demi-tour'),
  },
  generate(rng, level) {
    if (level === 1) {
      const l = dec(rng.int(15, 95), 1);
      return {
        prompt: `[AB] mesure ${fmt(l)} cm. [A′B′] est son symétrique par rapport à un point O. Combien mesure [A′B′] (en cm) ?`,
        answer: num(l, 'cm'),
        traps: traps(l, [[mul(l, r(2)), 'La symétrie centrale conserve les longueurs : on ne double pas.']]),
        hint: 'Quand on fait tourner un dessin d’un demi-tour, est-ce qu’il s’agrandit ?',
        steps: [
          `Le symétrique, c’est le segment après un demi-tour : on le fait tourner, sans l’étirer.`,
          `Un demi-tour ne change pas les longueurs.`,
          `Donc A′B′ = AB = **${fmt(l)}** cm.`,
        ],
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
      hint: 'Imagine un dessin qu’on fait tourner d’un demi-tour sur la table : qu’est-ce qui change, qu’est-ce qui reste pareil ?',
      steps: [
        'On imagine un dessin qu’on fait tourner d’un demi-tour : il ne se déforme pas, il est juste retourné.',
        s.why,
        `Donc c’est **${s.v ? 'vrai' : 'faux'}**.`,
      ],
    };
  },
};

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

/* ───────────────────────── Parallélogrammes ───────────────────────── */

const paraProprietes: Skill = {
  id: 'm5-para-proprietes',
  title: 'Propriétés des parallélogrammes',
  lesson: {
    memo: [
      'C’est une famille : le **parallélogramme** est le parent. Ses diagonales se coupent en leur milieu.',
      'Le **rectangle** a en plus des diagonales de même longueur. Le **losange** a en plus des diagonales perpendiculaires (en croix).',
      'Le **carré** a tout : c’est à la fois un rectangle et un losange.',
    ],
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
        hint: 'Milieu commun → parallélogramme. Même longueur en plus → rectangle. En croix en plus → losange. Les deux → carré.',
        steps: [
          'Les diagonales qui se coupent en leur milieu, c’est la base : c’est au moins un parallélogramme.',
          c.a === 'un parallélogramme'
            ? 'Rien d’autre n’est dit (ni même longueur, ni perpendiculaires) : on ne peut pas en dire plus.'
            : c.a === 'un rectangle'
              ? 'En plus, elles ont la même longueur : c’est le signe du rectangle.'
              : c.a === 'un losange'
                ? 'En plus, elles sont perpendiculaires (en croix) : c’est le signe du losange.'
                : 'En plus, elles ont la même longueur (rectangle) ET sont perpendiculaires (losange) : les deux à la fois.',
          `C’est forcément **${c.a}**.`,
        ],
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
      hint: 'Pense à la famille : parallélogramme (parent) → rectangle et losange → carré (qui a tout).',
      steps: [
        'Rappel de la famille : tous sont des parallélogrammes ; le rectangle et le losange ont un « super-pouvoir » chacun, le carré a les deux.',
        s.why,
        `Donc c’est **${s.v ? 'vrai' : 'faux'}**.`,
      ],
      targetSeconds: 15,
    };
  },
};

const paraAire: Skill = {
  id: 'm5-para-aire',
  title: 'Aire d’un parallélogramme',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Coupe le petit triangle d’un côté du parallélogramme et recolle-le de l’autre : ça fait un **rectangle** !',
      'Donc aire = base × hauteur, comme un rectangle. La hauteur, c’est le trait avec l’angle droit, pas le côté penché.',
    ],
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
      hint: 'Imagine qu’on découpe le petit triangle et qu’on le recolle de l’autre côté : quel rectangle obtiens-tu ?',
      steps: [
        'On découpe le petit triangle d’un côté et on le recolle de l’autre : le parallélogramme devient un rectangle.',
        `Ce rectangle a pour longueur la base (${b} cm) et pour largeur la hauteur (${fmt(h)} cm, le trait avec l’angle droit)${side ? `. Le côté penché de ${fmt(side)} cm ne sert pas` : ''}.`,
        `Aire = ${b} × ${fmt(h)} = **${fmt(area)}** cm^2 (pas de ÷ 2 : ce n’est pas un triangle).`,
      ],
    };
  },
};

const LENGTH = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

const conversionsLA: Skill = {
  id: 'm5-conversions-longueur-aire',
  tools: ['conversion-longueur', 'conversion-aire'],
  title: 'Convertir longueurs et aires',
  lesson: {
    memo: [
      'Utilise le tableau de conversion ! Le chiffre des unités va dans la colonne de l’unité de départ.',
      'Longueurs : **1 chiffre par colonne** (× 10 d’une unité à l’autre). Aires : **2 chiffres par colonne** (× 100), car un carré de 1 dm de côté contient 10 × 10 = 100 petits carrés de 1 cm.',
      'Vers une unité plus petite, le nombre devient plus grand.',
    ],
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
      hint: `Utilise le tableau de conversion : chiffre des unités de ${fmt(x)} ${area ? 'dans la 2e case de' : 'sous'} ${from}${sup}, puis lis jusqu’à ${to}${sup}.${area ? ' Attention : 2 cases par unité pour les aires !' : ''}`,
      demo: {
        kind: 'conversion',
        table: area ? 'aire' : 'longueur',
        value: x,
        from: `${from}${sup}`,
        to: `${to}${sup}`,
      },
      steps: [
        `On place ${fmt(x)} dans le tableau : le chiffre des unités va dans ${area ? 'la case de droite de la colonne' : 'la colonne'} ${from}${sup}.`,
        `De ${from}${sup} à ${to}${sup}, on se déplace de ${Math.abs(steps)} colonne${Math.abs(steps) > 1 ? 's' : ''}${area ? ` de 2 cases, soit ${2 * Math.abs(steps)} cases` : ''} vers la ${steps >= 0 ? 'droite' : 'gauche'} : le nombre devient ${fmt(factor ** Math.abs(steps))} fois plus ${steps >= 0 ? 'grand' : 'petit'}.`,
        `On met la virgule juste après ${area ? 'la dernière case de ' : ''}la colonne ${to}${sup}${steps > 0 ? ' et on complète les cases vides par des 0' : ''}.`,
        `On lit : ${fmt(x)} ${from}${sup} = **${fmt(result)} ${to}${sup}**`,
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
