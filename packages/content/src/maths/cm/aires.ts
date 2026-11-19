import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildAires({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Périmètres et aires ———

  const perimetre = S(
    id('perimetre'),
    'Périmètre d’un polygone',
    'Résoudre des problèmes mettant en jeu les longueurs des côtés d’un polygone et son périmètre',
    [
      'Le **périmètre**, c’est la longueur du tour : on additionne les longueurs de tous les côtés. Carré : 4 fois le côté.',
    ],
    (rng, level) => {
      const sides = level === 1 ? 4 : level === 2 ? rng.int(3, 5) : 6;
      const lens = Array.from({ length: sides }, () => rng.int(2, 15));
      const square = level === 1 && rng.int(0, 1) === 1;
      if (square) lens.fill(lens[0] ?? 5);
      const p = lens.reduce((a, b) => a + b, 0);
      const names = ['A', 'B', 'C', 'D', 'E', 'F'];
      return {
        prompt: square
          ? `Quel est le périmètre d’un carré de ${lens[0]} cm de côté ?`
          : `Un polygone a des côtés de ${lens.join(' cm, ')} cm. Quel est son périmètre ?`,
        answer: num(p, 'cm'),
        traps: traps(r(p), [[p - (lens[0] ?? 0), 'Tu as oublié un côté.']]),
        hint: square ? 'Un carré a 4 côtés égaux.' : 'Additionne tous les côtés.',
        steps: [
          square ? `4 × ${lens[0]}.` : `${lens.join(' + ')}.`,
          `Périmètre : **${p} cm** (polygone ${names.slice(0, sides).join('')}).`,
        ],
        targetSeconds: 25,
      };
    },
  );

  const aireCarreaux = S(
    id('aire-carreaux'),
    'Aire en carreaux',
    cm2
      ? 'Déterminer l’aire d’un carré ou d’un rectangle'
      : 'Connaître et utiliser les centimètres carrés pour exprimer des aires',
    ['1 carreau de 1 cm de côté = **1 cm^2**. Un rectangle de 5 carreaux sur 3 contient 5 × 3 = 15 carreaux.'],
    (rng) => {
      const L = rng.int(2, 9);
      const l = rng.int(2, 6);
      return {
        prompt: `Un rectangle mesure ${L} cm sur ${l} cm, sur un quadrillage de carreaux de 1 cm. Quelle est son aire en cm^2 ?`,
        figure: {
          kind: 'grid',
          xMin: 0,
          xMax: L + 1,
          yMin: 0,
          yMax: l + 1,
          axes: false,
          points: [
            { name: 'A', x: 0, y: 0, color: 'muted' },
            { name: 'B', x: L, y: 0, color: 'muted' },
            { name: 'C', x: L, y: l, color: 'muted' },
            { name: 'D', x: 0, y: l, color: 'muted' },
          ],
          segments: [
            ['A', 'B'],
            ['B', 'C'],
            ['C', 'D'],
            ['D', 'A'],
          ],
        },
        answer: num(L * l, 'cm^2'),
        traps: traps(r(L * l), [
          [2 * (L + l), 'Ça, c’est le périmètre : l’aire compte les carreaux **à l’intérieur**.'],
        ]),
        hint: 'Combien de carreaux par rangée ? combien de rangées ?',
        steps: [`${L} carreaux par rangée, ${l} rangées.`, `${L} × ${l} = **${L * l} cm^2**.`],
        targetSeconds: 25,
      };
    },
  );

  const aireSkills: Skill[] = [perimetre, aireCarreaux];
  if (cm2) {
    aireSkills.push(
      S(
        id('conversions-aire'),
        'Convertir des aires',
        'Convertir des aires entre différentes unités',
        ['1 m^2 = 100 dm^2 et 1 dm^2 = 100 cm^2 : pour les aires, c’est × 100 d’une unité à la suivante.'],
        (rng) => {
          const u = ['m', 'dm', 'cm'];
          const from = rng.int(0, 1);
          const to = from + 1;
          const x = rng.int(2, 50);
          return {
            prompt: `Complète : ${x} ${u[from]}^2 = … ${u[to]}^2`,
            answer: num(x * 100, `${u[to]}^2`),
            traps: traps(r(x * 100), [[x * 10, 'Pour les aires, c’est × 100, pas × 10.']]),
            hint: 'Un carré de 1 dm de côté contient 10 × 10 carrés de 1 cm.',
            steps: [`1 ${u[from]}^2 = 100 ${u[to]}^2.`, `${x} × 100 = **${x * 100} ${u[to]}^2**.`],
            targetSeconds: 20,
          };
        },
        { tools: ['conversion-aire'] },
      ),
    );
  }

  const aires = C(
    id('aires'),
    'grandeurs',
    'Périmètres et aires',
    aireSkills,
    bossOf(
      [
        S(
          id('boss-aires-potager'),
          'Problème : le potager',
          'Résoudre des problèmes mettant en jeu les longueurs des côtés d’un polygone et son périmètre',
          ['Pour clôturer un terrain, on calcule son périmètre.'],
          (rng) => {
            const L = rng.int(5, 20);
            const l = rng.int(3, 12);
            return {
              prompt: `Un potager rectangulaire mesure ${L} m sur ${l} m. Quelle longueur de grillage faut-il pour en faire le tour ?`,
              answer: num(2 * (L + l), 'm'),
              traps: traps(r(2 * (L + l)), [
                [L * l, 'Ça, c’est l’aire. Le tour, c’est le périmètre.'],
                [L + l, 'Il y a 4 côtés : deux longueurs et deux largeurs.'],
              ]),
              hint: 'Fais le tour : longueur + largeur + longueur + largeur.',
              steps: [`${L} + ${l} + ${L} + ${l}.`, `= **${2 * (L + l)} m**.`],
              targetSeconds: 35,
            };
          },
        ),
        S(
          id('boss-aires-carrelage'),
          'Problème : le carrelage',
          'Déterminer des aires',
          ['Un sol de 6 carreaux sur 4 : 24 carreaux.'],
          (rng) => {
            const L = rng.int(4, 12);
            const l = rng.int(3, 8);
            return {
              prompt: `On pose des carreaux carrés de 1 m de côté sur un sol rectangulaire de ${L} m sur ${l} m. Combien de carreaux faut-il ?`,
              answer: num(L * l),
              traps: traps(r(L * l), [[2 * (L + l), 'Les carreaux couvrent la surface : on calcule l’aire.']]),
              hint: 'Combien de carreaux par rangée, combien de rangées ?',
              steps: [`${L} carreaux par rangée, ${l} rangées.`, `${L} × ${l} = **${L * l}** carreaux.`],
              targetSeconds: 35,
            };
          },
        ),
      ],
      [
        S(
          id('boss-aires-piege'),
          'Piège : même périmètre, même aire ?',
          'Comparer les aires de différentes figures planes',
          ['Deux rectangles de même périmètre n’ont pas forcément la même aire : 6 × 2 = 12, mais 4 × 4 = 16.'],
          (rng) => {
            const s = rng.int(4, 8);
            return {
              prompt: `Un carré de ${s} cm de côté et un rectangle de ${s + 2} cm sur ${s - 2} cm ont le même périmètre. Ont-ils la même aire ?`,
              ...choice(
                rng,
                'Non',
                [{ label: 'Oui', why: `Carré : ${s * s} cm^2 ; rectangle : ${(s + 2) * (s - 2)} cm^2.` }],
                true,
              ),
              hint: 'Calcule les deux aires.',
              steps: [
                `Carré : ${s} × ${s} = ${s * s}. Rectangle : ${s + 2} × ${s - 2} = ${(s + 2) * (s - 2)}.`,
                '**Non**, les aires sont différentes.',
              ],
              targetSeconds: 35,
            };
          },
        ),
      ],
    ),
  );

  return aires;
}
