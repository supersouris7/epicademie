import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { EvalChapter, Figure } from '../../types.ts';
import { chapter, skill } from './kit.ts';

/**
 * Domaines « Espace et géométrie » et données du CE2. Programme du cycle 2 (CE2), BO n°41 du
 * 31 octobre 2024 : figures usuelles, angle droit, symétrie, solides, lecture de tableaux et de graphiques.
 */

const figures = skill(
  'mce2-figures',
  'Reconnaître les figures usuelles',
  'Reconnaitre, nommer et décrire le carré, le rectangle, le triangle, le triangle rectangle et le losange ; connaitre les propriétés des angles et les égalités de longueur pour les carrés, les rectangles et les losanges',
  [
    'Un **carré** : 4 côtés de même longueur et 4 angles droits. Un **rectangle** : 4 angles droits, côtés opposés de même longueur.',
    'Un **losange** : 4 côtés de même longueur (mais pas forcément des angles droits). Un triangle rectangle : 3 côtés et 1 angle droit.',
  ],
  (rng, level) => {
    if (level === 1) {
      const items = [
        { name: 'carré', d: 'quatre côtés de même longueur et quatre angles droits' },
        { name: 'rectangle', d: 'quatre angles droits et deux longueurs différentes de ses deux largeurs' },
        { name: 'triangle rectangle', d: 'trois côtés dont deux forment un angle droit' },
        { name: 'losange', d: 'quatre côtés de même longueur et aucun angle droit' },
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
          name: 'losange',
          n: 0,
          fig: {
            kind: 'polygon',
            vertices: [
              { name: 'P', x: 0, y: 2 },
              { name: 'Q', x: 3, y: 0 },
              { name: 'R', x: 6, y: 2 },
              { name: 'S', x: 3, y: 4 },
            ],
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
  'Cubes, pavés et pyramides',
  'Nommer un cube, un pavé, une pyramide ou un cylindre ; décrire un cube, un pavé ou une pyramide avec les termes « face », « sommet » et « arête » ; connaitre le nombre et la nature des faces d’un cube ou d’un pavé',
  [
    'Le cube et le pavé droit ont 6 faces, 12 arêtes et 8 sommets.',
    'Les faces d’un cube sont toutes des carrés égaux ; celles d’un pavé sont des rectangles. Une pyramide a des faces triangulaires et une base.',
  ],
  (rng, level) => {
    if (level === 3 && rng.int(0, 2) === 2) {
      const asked = rng.pick([
        ['faces', 5],
        ['sommets', 5],
        ['arêtes', 8],
      ] as const);
      return {
        prompt: `Une pyramide a pour base un carré. Combien de ${asked[0]} a-t-elle ?`,
        answer: num(asked[1]),
        traps: traps(r(asked[1]), [[4, 'N’oublie pas la base, ni les éléments de la base.']]),
        hint: 'Compte ceux de la base, puis ceux qui montent vers le sommet.',
        steps: [
          'La base carrée a 4 sommets et 4 côtés ; 4 faces triangulaires montent vers le sommet.',
          `Une pyramide à base carrée a **${asked[1]}** ${asked[0]}.`,
        ],
        targetSeconds: 30,
      };
    }
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
  'Compléter, sur une feuille quadrillée, une figure simple pour la rendre symétrique par rapport à un axe donné (vertical ou horizontal)',
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
  'Lire et interpréter les données d’un diagramme en barres ; résoudre des problèmes en utilisant les données d’un diagramme en barres',
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
  'Lire un tableau à double entrée',
  'Lire et interpréter les données d’un tableau à double entrée ; résoudre des problèmes en utilisant les données d’un tableau à double entrée',
  [
    'Dans un tableau à double entrée, une ligne et une colonne donnent la case à leur croisement.',
    'Pour un total, on additionne les cases utiles.',
  ],
  (rng, level) => {
    const modes = ['À pied', 'En vélo', 'En bus'];
    const girls = distinct(rng, 3, () => rng.int(8, 40));
    const boys = distinct(rng, 3, () => rng.int(8, 40));
    const figure: Figure = {
      kind: 'table',
      header: true,
      rows: [['', 'Filles', 'Garçons'], ...modes.map((m, i) => [m, String(girls[i] ?? 0), String(boys[i] ?? 0)])],
    };
    const i = rng.int(0, 2);
    const mode = (modes[i] ?? '').toLowerCase();
    if (level === 1) {
      const girl = rng.int(0, 1) === 0;
      const v = (girl ? girls : boys)[i] ?? 0;
      return {
        prompt: `Combien de ${girl ? 'filles' : 'garçons'} viennent à l’école ${mode} ?`,
        figure,
        answer: num(v),
        traps: traps(r(v), [[(girl ? boys : girls)[i] ?? 0, 'Regarde bien la colonne : filles ou garçons ?']]),
        hint: 'Cherche la ligne du moyen de transport et la colonne demandée.',
        steps: [
          `On lit la case à la croisée de la ligne « ${modes[i]} » et de la colonne « ${girl ? 'Filles' : 'Garçons'} ».`,
          `**${v}** ${girl ? 'filles' : 'garçons'}.`,
        ],
        targetSeconds: 15,
      };
    }
    if (level === 2) {
      const total = (girls[i] ?? 0) + (boys[i] ?? 0);
      return {
        prompt: `Combien d’élèves viennent à l’école ${mode} ?`,
        figure,
        answer: num(total),
        traps: traps(r(total), [[Math.max(girls[i] ?? 0, boys[i] ?? 0), 'Il faut compter les filles et les garçons.']]),
        hint: 'Additionne les deux cases de la ligne.',
        steps: [`Filles : ${girls[i]} ; garçons : ${boys[i]}.`, `${girls[i]} + ${boys[i]} = **${total}**.`],
        targetSeconds: 25,
      };
    }
    const all = [...girls, ...boys].reduce((a, b) => a + b, 0);
    const here = (girls[i] ?? 0) + (boys[i] ?? 0);
    return {
      prompt: `Combien d’élèves ne viennent pas à l’école ${mode} ?`,
      figure,
      answer: num(all - here),
      traps: traps(r(all - here), [[here, 'On cherche ceux qui ne viennent PAS ' + mode + '.']]),
      hint: 'Calcule d’abord le nombre total d’élèves du tableau.',
      steps: [`Total du tableau : ${all} élèves ; ${mode} : ${here}.`, `${all} − ${here} = **${all - here}**.`],
      targetSeconds: 50,
    };
  },
);

export const CE2_ESPACE: readonly EvalChapter[] = [
  chapter('mce2-geometrie', 'geometrie', 'Figures, angle droit, symétrie, solides', [figures, solides, symetrie]),
  chapter('mce2-donnees', 'donnees', 'Tableaux et diagrammes en barres', [diagramme, tableau]),
];
