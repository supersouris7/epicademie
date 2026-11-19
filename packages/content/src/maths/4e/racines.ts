import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Racine carrée ———

const racineCarree = S(
  'm4-racine-carree',
  'Racine carrée',
  'Comprendre et connaitre la définition de la racine carrée d’un nombre positif',
  [
    '√a est le nombre **positif** dont le carré vaut a : √49 = 7 car 7^2 = 49.',
    'Un carré d’aire 49 cm^2 a un côté de √49 = 7 cm.',
  ],
  (rng, level) => {
    const n = rng.int(level === 1 ? 1 : 4, level === 1 ? 10 : 15);
    if (level === 3) {
      return {
        prompt: `Un carré a une aire de ${n * n} cm^2. Quelle est la longueur de son côté ?`,
        answer: num(n, 'cm'),
        traps: traps(r(n), [[r(n * n, 4), 'Ça, c’est l’aire divisée par 4. Le côté c vérifie c × c = aire.']]),
        hint: `Quel nombre multiplié par lui-même donne ${n * n} ?`,
        steps: [
          `Côté × côté = ${n * n}, donc côté = √${n * n}.`,
          `${n} × ${n} = ${n * n} : le côté mesure **${n} cm**.`,
        ],
        targetSeconds: 20,
      };
    }
    return {
      prompt: `Donne la valeur de √${n * n}.`,
      answer: num(n),
      traps: traps(r(n), [
        [r(n * n, 2), `La racine carrée n’est pas la moitié : cherche le nombre qui, au carré, donne ${n * n}.`],
      ]),
      hint: `Quel nombre au carré donne ${n * n} ?`,
      steps: [`${n}^2 = ${n * n}.`, `Donc √${n * n} = **${n}**.`],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const encadrerRacine = S(
  'm4-encadrer-racine',
  'Encadrer une racine carrée',
  'Encadrer la racine carrée d’un entier par deux nombres entiers consécutifs',
  ['√50 est entre 7 et 8 car 7^2 = 49 < 50 < 64 = 8^2.'],
  (rng) => {
    const lo = rng.int(2, 11);
    const n = rng.int(lo * lo + 1, (lo + 1) * (lo + 1) - 1);
    return {
      prompt: `√${n} est compris entre deux entiers consécutifs. Quel est le plus petit ?`,
      answer: num(lo),
      traps: traps(r(lo), [
        [lo + 1, `${lo + 1}^2 = ${(lo + 1) ** 2} est plus grand que ${n}.`],
        [Math.floor(n / 2), 'La racine n’est pas la moitié du nombre.'],
      ]),
      hint: `Cherche les carrés parfaits juste en dessous et juste au-dessus de ${n}.`,
      steps: [`${lo}^2 = ${lo * lo} < ${n} < ${(lo + 1) ** 2} = ${lo + 1}^2.`, `Donc **${lo}** < √${n} < ${lo + 1}.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

export const racines = C(
  'm4-racines',
  'nombres',
  'Racine carrée',
  [racineCarree, encadrerRacine],
  bossOf(
    [
      S(
        'm4-boss-racines-jardin',
        'Problème : le potager carré',
        'Comprendre et connaitre la définition de la racine carrée d’un nombre positif',
        ['Côté d’un carré = √aire. Périmètre = 4 × côté.'],
        (rng) => {
          const c = rng.int(4, 15);
          return {
            prompt: `Un potager carré a une aire de ${c * c} m^2. Quelle longueur de clôture faut-il pour l’entourer ?`,
            answer: num(4 * c, 'm'),
            traps: traps(r(4 * c), [
              [c, 'Ça, c’est un seul côté.'],
              [4 * c * c, 'Trouve d’abord le côté avec la racine carrée.'],
            ]),
            hint: 'Trouve d’abord le côté : √aire.',
            steps: [`Côté = √${c * c} = ${c} m.`, `Clôture = 4 × ${c} = **${4 * c} m**.`],
            targetSeconds: 40,
          };
        },
      ),
      S(
        'm4-boss-racines-carrelage',
        'Problème : les dalles',
        'Encadrer la racine carrée d’un entier par deux nombres entiers consécutifs',
        ['Pour faire le plus grand carré possible avec n dalles, cherche le plus grand carré parfait ≤ n.'],
        (rng) => {
          const lo = rng.int(4, 12);
          const n = rng.int(lo * lo + 1, (lo + 1) ** 2 - 1);
          return {
            prompt: `Avec ${n} dalles carrées, on veut faire le plus grand carré possible (sans couper de dalle). Combien de dalles aura-t-il sur un côté ?`,
            answer: num(lo),
            traps: traps(r(lo), [
              [lo + 1, `Un carré de ${lo + 1} × ${lo + 1} demande ${(lo + 1) ** 2} dalles : trop.`],
            ]),
            hint: `Cherche le plus grand carré parfait qui ne dépasse pas ${n}.`,
            steps: [`${lo}^2 = ${lo * lo} ≤ ${n} < ${(lo + 1) ** 2}.`, `Le carré aura **${lo}** dalles par côté.`],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-racines-piege',
        'Piège : la racine d’une somme',
        'Comprendre et connaitre la définition de la racine carrée d’un nombre positif',
        ['√(9 + 16) = √25 = 5, et pas √9 + √16 = 7 !'],
        (rng) => {
          const [a, b, c] = rng.pick([
            [3, 4, 5],
            [6, 8, 10],
            [5, 12, 13],
            [8, 15, 17],
          ] as const);
          return {
            prompt: `Donne la valeur de √(${a * a} + ${b * b}).`,
            answer: num(c),
            traps: traps(r(c), [[a + b, `On ne peut pas « couper » la racine : calcule d’abord ${a * a} + ${b * b}.`]]),
            hint: 'Calcule d’abord ce qu’il y a sous la racine.',
            steps: [`${a * a} + ${b * b} = ${c * c}.`, `√${c * c} = **${c}**.`],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
