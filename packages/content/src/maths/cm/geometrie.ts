import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildGeometrie({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Géométrie ———

  const figures = S(
    id('figures'),
    'Reconnaître les figures',
    'Utiliser le vocabulaire géométrique approprié dans le contexte d’apprentissage des notions correspondantes',
    [
      'Carré : 4 côtés égaux et 4 angles droits. Rectangle : 4 angles droits. Losange : 4 côtés égaux.' +
        (cm2 ? ' Trapèze : 2 côtés parallèles.' : ''),
      'Triangle isocèle : 2 côtés égaux ; équilatéral : 3 côtés égaux ; rectangle : un angle droit.',
    ],
    (rng) => {
      const q = rng.pick([
        { d: '4 côtés égaux et 4 angles droits', a: 'Un carré' },
        { d: '4 angles droits, mais des côtés pas tous égaux', a: 'Un rectangle' },
        { d: '4 côtés égaux, sans angle droit', a: 'Un losange' },
        { d: '3 côtés égaux', a: 'Un triangle équilatéral' },
        { d: '3 côtés dont 2 égaux', a: 'Un triangle isocèle' },
        ...(cm2 ? [{ d: '4 côtés dont seulement 2 sont parallèles', a: 'Un trapèze' }] : []),
      ]);
      const all = [
        'Un carré',
        'Un rectangle',
        'Un losange',
        'Un triangle équilatéral',
        'Un triangle isocèle',
        ...(cm2 ? ['Un trapèze'] : []),
      ];
      return {
        prompt: `Quelle figure a ${q.d} ?`,
        ...choice(
          rng,
          q.a,
          distinct(rng, 3, () => rng.pick(all.filter((x) => x !== q.a))).map((x) => ({
            label: x,
            why: 'Vérifie les côtés égaux et les angles droits.',
          })),
        ),
        hint: 'Regarde les côtés égaux et les angles droits.',
        steps: [`${q.d.charAt(0).toUpperCase() + q.d.slice(1)}.`, `C’est **${q.a.toLowerCase()}**.`],
        targetSeconds: 15,
      };
    },
  );

  const cercle = S(
    id('cercle'),
    'Cercle et disque',
    'Décrire et reconnaître un cercle et un disque comme un ensemble de points caractérisés par leur distance à un point donné',
    ['Tous les points du cercle sont à la même distance du centre : le **rayon**. Le **diamètre** vaut 2 rayons.'],
    (rng) => {
      const rad = rng.int(2, 12);
      const askD = rng.int(0, 1) === 1;
      return {
        prompt: askD
          ? `Le rayon d’un cercle mesure ${rad} cm. Combien mesure son diamètre ?`
          : `Le diamètre d’un cercle mesure ${2 * rad} cm. Combien mesure son rayon ?`,
        figure: { kind: 'disk', radiusLabel: askD ? `${rad} cm` : `${2 * rad} cm`, diameter: !askD },
        answer: num(askD ? 2 * rad : rad, 'cm'),
        traps: traps(r(askD ? 2 * rad : rad), [[askD ? rad : 2 * rad, 'Le diamètre vaut 2 rayons.']]),
        hint: 'Diamètre = 2 × rayon.',
        steps: [
          'Le diamètre traverse le cercle en passant par le centre : 2 rayons.',
          `**${askD ? 2 * rad : rad} cm**.`,
        ],
        targetSeconds: 12,
      };
    },
    { mental: true },
  );

  const symetrie = S(
    id('symetrie'),
    'Compléter par symétrie',
    'Compléter une figure pour la rendre symétrique par rapport à une droite donnée, horizontale ou verticale',
    [
      'On « plie » la feuille le long de la droite : compte les carreaux jusqu’à la droite, puis autant de l’autre côté.',
    ],
    (rng) => {
      const lim = 5;
      for (;;) {
        const vertical = rng.int(0, 1) === 1;
        const c = 0;
        const x = rng.int(-4, 4);
        const y = rng.int(-4, 4);
        if ((vertical && x === c) || (!vertical && y === c)) continue;
        const img = vertical ? { x: -x, y } : { x, y: -y };
        const dist = Math.abs(vertical ? x : y);
        return {
          prompt: 'Touche le quadrillage pour placer le symétrique de A par rapport à la droite rouge.',
          figure: {
            kind: 'grid',
            xMin: -lim,
            xMax: lim,
            yMin: -lim,
            yMax: lim,
            axes: false,
            points: [{ name: 'A', x, y, color: 'accent' }],
            axis: vertical ? { x1: 0, y1: -lim, x2: 0, y2: lim } : { x1: -lim, y1: 0, x2: lim, y2: 0 },
            pick: true,
          },
          answer: { kind: 'point', ...img },
          traps: [],
          hint: 'Compte les carreaux de A jusqu’à la droite, puis autant de l’autre côté.',
          steps: [
            `A est à ${dist} carreau${dist > 1 ? 'x' : ''} de la droite.`,
            'Le symétrique est **le nœud entouré en vert**.',
          ],
          targetSeconds: 25,
        };
      }
    },
  );

  const solides = S(
    id('solides'),
    'Les solides',
    'Nommer un cube, une boule, un pavé, un cône, une pyramide, un cylindre et un prisme droit',
    [
      'Cube : 6 faces carrées. Pavé : 6 faces rectangulaires. Pyramide : faces triangulaires qui se rejoignent au sommet. Cylindre : 2 disques.',
    ],
    (rng) => {
      const q = rng.pick([
        { p: 'Combien de faces a un cube ?', a: 6, w: 4 },
        { p: 'Combien de sommets a un cube ?', a: 8, w: 6 },
        { p: 'Combien d’arêtes a un pavé droit ?', a: 12, w: 8 },
        { p: 'Combien de faces triangulaires a une pyramide à base carrée ?', a: 4, w: 5 },
      ]);
      return {
        prompt: q.p,
        figure: { kind: 'solid', solid: q.p.includes('pavé') ? 'pave' : 'cube', labels: [] },
        answer: num(q.a),
        traps: traps(r(q.a), [[q.w, 'Compte aussi ce qui est caché (en pointillés).']]),
        hint: 'Compte aussi les éléments cachés à l’arrière.',
        steps: ['On compte devant, puis derrière (en pointillés).', `Réponse : **${q.a}**.`],
        targetSeconds: 15,
      };
    },
  );

  const deplacements = S(
    id('deplacements'),
    'Programmer un déplacement',
    'Connaître et utiliser le vocabulaire lié aux déplacements',
    ['Un programme de déplacement : on suit les instructions **une par une**, dans l’ordre.'],
    (rng, level) => {
      const lim = 5;
      for (;;) {
        const start = { x: rng.int(-2, 2), y: rng.int(-2, 2) };
        let { x, y } = start;
        const n = level === 1 ? 2 : 3;
        const dirs = [
          { t: 'droite', dx: 1, dy: 0 },
          { t: 'gauche', dx: -1, dy: 0 },
          { t: 'haut', dx: 0, dy: 1 },
          { t: 'bas', dx: 0, dy: -1 },
        ];
        const moves = Array.from({ length: n }, () => ({ d: rng.pick(dirs), k: rng.int(1, 3) }));
        for (const m of moves) {
          x += m.d.dx * m.k;
          y += m.d.dy * m.k;
        }
        if (Math.abs(x) > lim || Math.abs(y) > lim || (x === start.x && y === start.y)) continue;
        const text = moves
          .map((m) => `${m.k} ${m.d.t === 'haut' || m.d.t === 'bas' ? `vers le ${m.d.t}` : `vers la ${m.d.t}`}`)
          .join(', puis ');
        return {
          prompt: `Le robot part de R : ${text}. Touche le point d’arrivée.`,
          figure: {
            kind: 'grid',
            xMin: -lim,
            xMax: lim,
            yMin: -lim,
            yMax: lim,
            axes: false,
            points: [{ name: 'R', ...start, color: 'accent' }],
            pick: true,
          },
          answer: { kind: 'point', x, y },
          traps: [],
          hint: 'Suis les instructions une par une avec ton doigt.',
          steps: ['On part de R et on suit chaque instruction.', 'Le robot arrive sur **le nœud entouré en vert**.'],
          targetSeconds: 30,
        };
      }
    },
  );

  const geometrie = C(
    id('geometrie'),
    'geometrie',
    'Figures, symétrie et solides',
    [figures, cercle, symetrie, solides, deplacements],
    bossOf(
      [
        S(
          id('boss-geometrie-patron'),
          'Problème : la boîte cubique',
          'Reconnaître un patron d’un cube',
          ['Le patron d’un cube a 6 carrés : un par face.'],
          (rng) => {
            const c = rng.int(2, 9);
            return {
              prompt: `On construit une boîte cubique de ${c} cm d’arête avec du carton (sans couvercle : 5 faces). Combien de carrés de ${c} cm de côté faut-il découper ?`,
              answer: num(5),
              traps: traps(r(5), [[6, 'Sans couvercle : une face de moins.']]),
              hint: 'Un cube a 6 faces ; sans couvercle…',
              steps: ['Un cube a 6 faces carrées.', 'Sans couvercle : **5** carrés.'],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-geometrie-roue'),
          'Problème : les rayons de la roue',
          'Décrire et reconnaître un cercle et un disque comme un ensemble de points caractérisés par leur distance à un point donné',
          ['Tous les rayons d’un cercle ont la même longueur.'],
          (rng) => {
            const d = 2 * rng.int(20, 35);
            return {
              prompt: `Une roue de vélo a un diamètre de ${d} cm. Combien mesure chaque rayon (du centre au bord) ?`,
              answer: num(d / 2, 'cm'),
              traps: traps(r(d / 2), [[d, 'Le rayon est la moitié du diamètre.']]),
              hint: 'Rayon = diamètre ÷ 2.',
              steps: [`${d} ÷ 2.`, `= **${d / 2} cm**.`],
              targetSeconds: 20,
            };
          },
        ),
      ],
      [
        S(
          id('boss-geometrie-piege'),
          'Piège : un carré est-il un rectangle ?',
          'Utiliser le vocabulaire géométrique approprié',
          ['Un carré a 4 angles droits : c’est un rectangle particulier (et aussi un losange particulier).'],
          (rng) => ({
            prompt: 'Un carré est-il un rectangle ?',
            ...choice(rng, 'Oui', [{ label: 'Non', why: 'Un rectangle a 4 angles droits ; le carré aussi.' }], true),
            hint: 'Qu’est-ce qu’un rectangle ? Un quadrilatère avec…',
            steps: [
              'Un rectangle est un quadrilatère à 4 angles droits.',
              'Le carré a 4 angles droits : **oui**, c’est un rectangle particulier.',
            ],
            targetSeconds: 20,
          }),
        ),
      ],
    ),
  );

  return geometrie;
}
