import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

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

export const volumes = C(
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
