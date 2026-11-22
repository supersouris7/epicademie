import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { EvalChapter, Figure } from '../../types.ts';
import { chapter, skill } from './kit.ts';

/**
 * Domaines « Espace et géométrie » et données du CE2. Programme du cycle 2 (CE2), BO n°16 du
 * 17 avril 2025 : figures usuelles, angle droit, symétrie, solides, lecture de tableaux et de graphiques.
 */

const figures = skill(
  'mce2-figures',
  'Reconnaître les figures usuelles',
  'Reconnaître, nommer, décrire, reproduire, construire quelques figures géométriques : carré, rectangle, triangle rectangle, cercle',
  [
    'Un **carré** : 4 côtés de même longueur et 4 angles droits. Un **rectangle** : 4 angles droits, côtés opposés de même longueur.',
    'Un triangle rectangle : 3 côtés et 1 angle droit. Un cercle : tous ses points sont à la même distance du centre.',
  ],
  (rng, level) => {
    if (level === 1) {
      const items = [
        { name: 'carré', d: 'quatre côtés de même longueur et quatre angles droits' },
        { name: 'rectangle', d: 'quatre angles droits et deux longueurs différentes de ses deux largeurs' },
        { name: 'triangle rectangle', d: 'trois côtés dont deux forment un angle droit' },
        { name: 'cercle', d: 'tous ses points à la même distance de son centre' },
      ];
      const it = rng.pick(items);
      const { answer, traps: t } = choice(
        rng,
        it.name,
        items.filter((x) => x !== it).map((x) => ({ label: x.name, why: `Un ${x.name} a ${x.d}.` })),
      );
      return {
        prompt: `Quelle figure a ${it.d} ?`,
        answer,
        traps: t,
        hint: 'Compte les côtés et cherche les angles droits.',
        steps: [`On cherche la figure qui a ${it.d}.`, `C’est un **${it.name}**.`],
        targetSeconds: 20,
      };
    }
    if (level === 2) {
      const shapes: { fig: Figure; n: number; name: string }[] = [
        {
          name: 'carré',
          n: 4,
          fig: {
            kind: 'polygon',
            vertices: [
              { name: 'A', x: 0, y: 0 },
              { name: 'B', x: 4, y: 0 },
              { name: 'C', x: 4, y: 4 },
              { name: 'D', x: 0, y: 4 },
            ],
            rightAngles: [0, 1, 2, 3],
            ticks: [1, 1, 1, 1],
          },
        },
        {
          name: 'rectangle',
          n: 4,
          fig: {
            kind: 'polygon',
            vertices: [
              { name: 'E', x: 0, y: 0 },
              { name: 'F', x: 6, y: 0 },
              { name: 'G', x: 6, y: 3 },
              { name: 'H', x: 0, y: 3 },
            ],
            rightAngles: [0, 1, 2, 3],
          },
        },
        {
          name: 'triangle rectangle',
          n: 1,
          fig: {
            kind: 'polygon',
            vertices: [
              { name: 'K', x: 0, y: 0 },
              { name: 'L', x: 5, y: 0 },
              { name: 'M', x: 0, y: 3 },
            ],
            rightAngles: [0],
          },
        },
      ];
      const s = rng.pick(shapes);
      return {
        prompt: 'Combien d’angles droits cette figure a-t-elle ?',
        figure: s.fig,
        answer: num(s.n),
        traps: traps(r(s.n), [[s.n === 1 ? 3 : 2, 'Cherche les petits carrés qui marquent les angles droits.']]),
        hint: 'Les angles droits sont marqués par un petit carré dans le coin.',
        steps: [
          'On repère les coins marqués d’un petit carré : ce sont les angles droits.',
          `Cette figure en a **${s.n}**.`,
        ],
        targetSeconds: 15,
      };
    }
    const long = rng.int(5, 9);
    const wide = rng.int(2, long - 1);
    return {
      prompt: 'Ce rectangle a deux côtés connus. Quelle est la longueur du côté marqué « ? » (en cm) ?',
      figure: {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: long, y: 0 },
          { name: 'C', x: long, y: wide },
          { name: 'D', x: 0, y: wide },
        ],
        sideLabels: [`${long} cm`, `${wide} cm`, `${long} cm`, '?'],
        rightAngles: [0, 1, 2, 3],
      },
      answer: num(wide, 'cm'),
      traps: traps(r(wide), [[long, 'Le côté marqué est opposé à [BC], pas à [AB].']]),
      hint: 'Dans un rectangle, les côtés opposés ont la même longueur.',
      steps: [
        'Dans un rectangle, les côtés opposés sont égaux.',
        `Le côté « ? » est opposé à celui de ${wide} cm : **${wide} cm**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const solides = skill(
  'mce2-solides',
  'Cubes et pavés',
  'Reconnaître, nommer, décrire des solides : cube, pavé droit ; faces, arêtes, sommets',
  [
    'Le cube et le pavé droit ont 6 faces, 12 arêtes et 8 sommets.',
    'Les faces d’un cube sont toutes des carrés égaux ; celles d’un pavé sont des rectangles.',
  ],
  (rng, level) => {
    if (level === 3) {
      const cube = rng.int(0, 1) === 0;
      const { answer, traps: t } = choice(rng, cube ? 'cube' : 'pavé droit', [
        {
          label: cube ? 'pavé droit' : 'cube',
          why: cube ? 'Les faces d’un pavé sont des rectangles.' : 'Un cube a toutes ses faces carrées et égales.',
        },
        { label: 'cylindre', why: 'Un cylindre a des faces rondes.' },
      ]);
      return {
        prompt: cube
          ? 'Un solide a 6 faces toutes carrées et égales. C’est un …'
          : 'Un solide a 6 faces rectangulaires, de tailles différentes. C’est un …',
        answer,
        traps: t,
        hint: 'Regarde la forme des faces : carrées ou rectangles ?',
        steps: [
          cube ? 'Six faces carrées et égales.' : 'Six faces rectangulaires de tailles différentes.',
          `C’est un **${cube ? 'cube' : 'pavé droit'}**.`,
        ],
        targetSeconds: 20,
      };
    }
    const solid = rng.pick(['cube', 'pave'] as const);
    const asked =
      level === 1
        ? rng.pick([
            ['faces', 6],
            ['sommets', 8],
          ] as const)
        : rng.pick([
            ['arêtes', 12],
            ['sommets', 8],
            ['faces', 6],
          ] as const);
    const name = solid === 'cube' ? 'cube' : 'pavé droit';
    return {
      prompt: `Combien de ${asked[0]} un ${name} a-t-il ?`,
      figure: { kind: 'solid', solid, labels: [] },
      answer: num(asked[1]),
      traps: traps(r(asked[1]), [
        [asked[1] === 12 ? 8 : asked[1] - 2, 'Compte aussi les parties cachées de la figure.'],
      ]),
      hint: `Compte les ${asked[0]} une par une, sans oublier celles qu’on ne voit pas.`,
      steps: [`Un ${name} a 6 faces, 12 arêtes et 8 sommets.`, `Il a **${asked[1]}** ${asked[0]}.`],
      targetSeconds: 20,
    };
  },
);

const symetrie = skill(
  'mce2-symetrie',
  'Symétrie par rapport à un axe',
  'Reconnaître et utiliser les notions d’alignement, d’angle droit, d’égalité de longueurs, de symétrie axiale',
  [
    'Deux points sont symétriques par rapport à un axe quand l’axe est « au milieu » : même distance de chaque côté.',
    'On compte les carreaux entre le point et l’axe, puis autant de l’autre côté.',
  ],
  (rng, level) => {
    const vertical = level < 3;
    const gap = rng.int(1, 4);
    const side = rng.int(0, 1) === 0 ? -1 : 1;
    const along = rng.int(0, vertical ? 6 : 10);
    const x = vertical ? 5 + side * gap : along;
    const y = vertical ? along : 3 + side * Math.min(gap, 3);
    const target = vertical ? { x: 10 - x, y } : { x, y: 6 - y };
    return {
      prompt: 'Place le point A’, symétrique du point A par rapport à la droite (d).',
      figure: {
        kind: 'grid',
        xMin: 0,
        xMax: 10,
        yMin: 0,
        yMax: 6,
        axes: false,
        pick: true,
        points: [{ name: 'A', x, y }],
        axis: vertical ? { x1: 5, y1: 0, x2: 5, y2: 6 } : { x1: 0, y1: 3, x2: 10, y2: 3 },
      },
      answer: { kind: 'point', ...target },
      traps: [{ point: { x, y }, why: 'C’est le point de départ : le symétrique est de l’autre côté de l’axe.' }],
      hint: 'Compte les carreaux entre A et la droite, puis autant de l’autre côté.',
      steps: [
        `A est à ${Math.abs(vertical ? x - 5 : y - 3)} carreau${Math.abs(vertical ? x - 5 : y - 3) > 1 ? 'x' : ''} de la droite (d).`,
        `A’ est à la même distance de l’autre côté : **(${target.x} ; ${target.y})**.`,
      ],
      targetSeconds: 30,
    };
  },
);

// ——— Données ———

const diagramme = skill(
  'mce2-diagramme',
  'Lire un diagramme en barres',
  'Organisation et gestion de données : lire ou compléter un graphique simple (diagramme en barres)',
  [
    'Dans un diagramme en barres, la **hauteur** de la barre donne le nombre.',
    'Pour comparer, on lit les deux barres puis on calcule la différence.',
  ],
  (rng, level) => {
    const labels = distinct(rng, 4, () => rng.pick(['Vélo', 'Bus', 'À pied', 'Voiture', 'Trottinette', 'Train']));
    const values = distinct(rng, 4, () => rng.int(2, 14));
    const figure: Figure = {
      kind: 'bars',
      title: 'Comment viens-tu à l’école ?',
      bars: labels.map((label, i) => ({ label, value: values[i] ?? 0 })),
      unit: 'élèves',
    };
    const i = rng.int(0, 3);
    if (level === 1)
      return {
        prompt: `Combien d’élèves viennent « ${labels[i]} » ?`,
        figure,
        answer: num(values[i] ?? 0),
        traps: [],
        hint: 'Lis la hauteur de la barre.',
        steps: ['On lit la hauteur de la barre.', `**${values[i]}** élèves.`],
        targetSeconds: 15,
      };
    if (level === 2) {
      const total = values.reduce((a, b) => a + b, 0);
      return {
        prompt: 'Combien d’élèves ont répondu en tout ?',
        figure,
        answer: num(total),
        traps: traps(r(total), [[Math.max(...values), 'Additionne toutes les barres.']]),
        hint: 'Additionne les hauteurs de toutes les barres.',
        steps: [`${values.join(' + ')}.`, `= **${total}**.`],
        targetSeconds: 25,
      };
    }
    const hi = Math.max(...values);
    const lo = Math.min(...values);
    const labelOf = (v: number) => labels[values.indexOf(v)] ?? '';
    return {
      prompt: `Combien d’élèves de plus viennent « ${labelOf(hi)} » que « ${labelOf(lo)} » ?`,
      figure,
      answer: num(hi - lo),
      traps: traps(r(hi - lo), [[hi + lo, 'Pour comparer, on cherche l’écart : on soustrait.']]),
      hint: 'Lis les deux barres, puis cherche l’écart.',
      steps: [`« ${labelOf(hi)} » : ${hi} ; « ${labelOf(lo)} » : ${lo}.`, `${hi} − ${lo} = **${hi - lo}**.`],
      targetSeconds: 30,
    };
  },
);

const tableau = skill(
  'mce2-tableau',
  'Lire un tableau',
  'Organisation et gestion de données : prélever des données numériques, lire ou compléter un tableau',
  [
    'Dans un tableau, on lit la ligne et la colonne qui nous intéressent.',
    'Pour un total, on additionne toute la ligne.',
  ],
  (rng, level) => {
    const days = ['Lundi', 'Mardi', 'Jeudi', 'Vendredi'];
    const values = distinct(rng, 4, () => rng.int(3, 30));
    const figure: Figure = {
      kind: 'table',
      header: true,
      rows: [
        ['Jour', ...days],
        ['Livres prêtés', ...values.map(String)],
      ],
    };
    const i = rng.int(0, 3);
    if (level === 1)
      return {
        prompt: `Combien de livres ont été prêtés le ${days[i]?.toLowerCase()} ?`,
        figure,
        answer: num(values[i] ?? 0),
        traps: [],
        hint: 'Cherche la colonne du bon jour.',
        steps: [`On lit la colonne « ${days[i]} ».`, `**${values[i]}** livres.`],
        targetSeconds: 15,
      };
    if (level === 2) {
      const total = values.reduce((a, b) => a + b, 0);
      return {
        prompt: 'Combien de livres ont été prêtés dans la semaine ?',
        figure,
        answer: num(total),
        traps: traps(r(total), [[Math.max(...values), 'Additionne tous les jours.']]),
        hint: 'Additionne tous les nombres de la ligne.',
        steps: [`${values.join(' + ')}.`, `= **${total}**.`],
        targetSeconds: 30,
      };
    }
    const best = days[values.indexOf(Math.max(...values))] ?? '';
    const { answer, traps: t } = choice(
      rng,
      best,
      days
        .filter((d) => d !== best)
        .map((label) => ({ label, why: 'Compare tous les nombres : cherche le plus grand.' })),
    );
    return {
      prompt: 'Quel jour a-t-on prêté le plus de livres ?',
      figure,
      answer,
      traps: t,
      hint: 'Compare les nombres de la ligne et repère le plus grand.',
      steps: [`Le plus grand nombre est ${Math.max(...values)}.`, `C’est le **${best.toLowerCase()}**.`],
      targetSeconds: 25,
    };
  },
);

export const CE2_ESPACE: readonly EvalChapter[] = [
  chapter('mce2-geometrie', 'geometrie', 'Figures, angle droit, symétrie, solides', [figures, solides, symetrie]),
  chapter('mce2-donnees', 'donnees', 'Tableaux et diagrammes en barres', [diagramme, tableau]),
];
