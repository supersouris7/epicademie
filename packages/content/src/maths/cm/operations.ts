import { choice, num, traps } from '../../build.ts';
import { add, cmp, fmt, mul, r, sub } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { big, bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { exactDecimal } from './outils.ts';

export function buildOperations({ S, C, cm2, id, decs }: Contexte): Chapter {
  // ——— Opérations ———

  const additionPosee = S(
    id('addition-posee'),
    'Additionner et soustraire des décimaux',
    'Poser en colonnes et effectuer des additions et des soustractions de nombres décimaux',
    ['On aligne les **virgules** : unités sous unités, dixièmes sous dixièmes. Ajoute des 0 si besoin.'],
    (rng, level) => {
      const a = exactDecimal(rng, 10, 500, rng.int(1, decs));
      const b = exactDecimal(rng, 1, 99, rng.int(1, 2));
      const minus = level === 3;
      const [x, y] = minus && cmp(a, b) < 0 ? [b, a] : [a, b];
      const res = minus ? sub(x, y) : add(x, y);
      return {
        prompt: `Calcule ${fmt(x)} ${minus ? '−' : '+'} ${fmt(y)}.`,
        answer: num(res),
        traps: [],
        hint: 'Pose l’opération en alignant les virgules.',
        steps: [
          'On aligne les virgules et on calcule colonne par colonne.',
          `${fmt(x)} ${minus ? '−' : '+'} ${fmt(y)} = **${fmt(res)}**.`,
        ],
        targetSeconds: 40,
      };
    },
    { mental: true },
  );

  const multiplicationPosee = S(
    id('multiplication-posee'),
    cm2 ? 'Multiplier un décimal par un entier' : 'Multiplier deux entiers',
    cm2
      ? 'Poser et effectuer la multiplication d’un nombre décimal par un nombre entier'
      : 'Poser et effectuer des multiplications de deux nombres entiers',
    [
      'On multiplie comme des entiers, puis (pour un décimal) on met autant de chiffres après la virgule que dans le décimal.',
    ],
    (rng) => {
      const a = cm2 ? exactDecimal(rng, 1, 99, rng.int(1, 2)) : r(rng.int(12, 999));
      const b = rng.int(cm2 ? 2 : 11, cm2 ? 25 : 99);
      const res = mul(a, r(b));
      return {
        prompt: `Calcule ${fmt(a)} × ${b}.`,
        answer: num(res),
        traps: [],
        hint: cm2
          ? 'Calcule sans la virgule, puis replace-la.'
          : 'Décompose : multiplie par les unités, puis par les dizaines.',
        steps: [
          cm2
            ? 'On calcule sans la virgule puis on remet le même nombre de chiffres après la virgule.'
            : `${fmt(a)} × ${b % 10} et ${fmt(a)} × ${b - (b % 10)}, puis on additionne.`,
          `${fmt(a)} × ${b} = **${fmt(res)}**.`,
        ],
        targetSeconds: 50,
      };
    },
    { mental: true },
  );

  const division = S(
    id('division'),
    cm2 ? 'Division décimale' : 'Division euclidienne',
    cm2
      ? 'Poser et effectuer des divisions décimales avec un dividende décimal et un diviseur à un chiffre'
      : 'Poser et effectuer des divisions euclidiennes avec un diviseur à un chiffre',
    [
      cm2
        ? '7,5 ÷ 3 = 2,5 car 3 × 2,5 = 7,5. On place la virgule au quotient quand on abaisse le 1er chiffre après la virgule.'
        : '87 ÷ 4 : 4 × 21 = 84, il reste 3. On écrit 87 = 4 × 21 + 3.',
    ],
    (rng) => {
      const d = rng.int(2, 9);
      if (cm2) {
        const q = exactDecimal(rng, 1, 99, 1);
        const n = mul(q, r(d));
        return {
          prompt: `Calcule ${fmt(n)} ÷ ${d}.`,
          answer: num(q),
          traps: traps(q, [[mul(q, r(10)), 'Pense à placer la virgule dans le quotient.']]),
          hint: `Quel nombre multiplié par ${d} donne ${fmt(n)} ?`,
          steps: [`On pose la division de ${fmt(n)} par ${d}.`, `${fmt(n)} ÷ ${d} = **${fmt(q)}**.`],
          targetSeconds: 40,
        };
      }
      const q = rng.int(5, 99);
      const rest = rng.int(0, d - 1);
      const n = d * q + rest;
      return {
        prompt: `Dans la division de ${n} par ${d}, quel est le quotient ?`,
        answer: num(q),
        traps: traps(r(q), [
          [q + 1, `${d} × ${q + 1} = ${d * (q + 1)}, c’est plus que ${n}.`],
          [rest, 'Ça, c’est le reste.'],
        ]),
        hint: `Cherche le plus grand multiple de ${d} qui ne dépasse pas ${n}.`,
        steps: [`${n} = ${d} × ${q} + ${rest}.`, `Le quotient est **${q}**${rest ? ` (et il reste ${rest})` : ''}.`],
        targetSeconds: 35,
      };
    },
    { mental: true },
  );

  const estimerBase = S(
    id('estimer'),
    'Estimer un résultat',
    'Estimer le résultat d’une opération',
    [
      'L’**ordre de grandeur** est un résultat approché, trouvé de tête.',
      'Arrondis chaque nombre : 49 devient 50, 21 devient 20. Puis 50 × 20 = 1 000.',
    ],
    (rng) => {
      const a = rng.int(2, 9) * 10 + rng.pick([-1, 1, 2, -2]);
      const b = rng.int(2, 9) * 10 + rng.pick([-1, 1]);
      const ra = Math.round(a / 10) * 10;
      const rb = Math.round(b / 10) * 10;
      const est = ra * rb;
      return {
        prompt: `Choisis le nombre le plus proche de ${a} × ${b}, sans faire le calcul exact.`,
        ...choice(rng, big(est), [
          { label: big(est * 10), why: `C’est 10 fois trop grand : calcule ${ra} × ${rb}.` },
          { label: big(est / 10), why: `C’est 10 fois trop petit : calcule ${ra} × ${rb}.` },
        ]),
        hint: `Remplace ${a} et ${b} par la dizaine la plus proche (10, 20, 30…).`,
        steps: [
          `Arrondis ${a} : la dizaine la plus proche est ${ra}.`,
          `Arrondis ${b} : la dizaine la plus proche est ${rb}.`,
          `Multiplie les dizaines : ${ra / 10} × ${rb / 10} = ${est / 100}, puis ajoute deux zéros.`,
          `Choisis **${big(est)}** : c’est l’ordre de grandeur.`,
        ],
        targetSeconds: 30,
      };
    },
    { mental: true },
  );
  const estimer = { ...estimerBase, version: 2 };

  const parentheses = S(
    id('parentheses'),
    'Calculs avec parenthèses',
    cm2
      ? 'Savoir réaliser un calcul contenant une ou deux paires de parenthèses'
      : 'Savoir effectuer un calcul contenant des parenthèses',
    ['On calcule **d’abord** ce qui est entre parenthèses : (8 + 2) × 5 = 10 × 5 = 50.'],
    (rng, level) => {
      const a = rng.int(2, 15);
      const b = rng.int(2, 15);
      const c = rng.int(2, 9);
      if (cm2 && level === 3) {
        const d = rng.int(1, 9);
        const res = (a + b) * (c + d);
        return {
          prompt: `Calcule (${a} + ${b}) × (${c} + ${d}).`,
          answer: num(res),
          traps: traps(r(res), [[a + b * c + d, 'Calcule d’abord chaque parenthèse.']]),
          hint: 'Calcule chaque parenthèse, puis multiplie.',
          steps: [`(${a} + ${b}) = ${a + b} et (${c} + ${d}) = ${c + d}.`, `${a + b} × ${c + d} = **${res}**.`],
          targetSeconds: 30,
        };
      }
      const res = (a + b) * c;
      return {
        prompt: `Calcule (${a} + ${b}) × ${c}.`,
        answer: num(res),
        traps: traps(r(res), [[a + b * c, 'Les parenthèses passent en premier.']]),
        hint: 'Commence par la parenthèse.',
        steps: [`${a} + ${b} = ${a + b}.`, `${a + b} × ${c} = **${res}**.`],
        targetSeconds: 25,
      };
    },
    { mental: true },
  );

  const operations = C(
    id('operations'),
    'nombres',
    'Les quatre opérations',
    [additionPosee, multiplicationPosee, division, estimer, parentheses],
    bossOf(
      [
        S(
          id('boss-operations-sortie'),
          'Problème : la sortie scolaire',
          'Résoudre des problèmes mixtes en deux ou trois étapes',
          ['Calcule d’abord le prix total, puis partage.'],
          (rng) => {
            const n = rng.int(20, 30);
            const bus = rng.int(10, 20) * 10;
            const ticket = rng.int(3, 9);
            const total = bus + n * ticket;
            return {
              prompt: `${n} élèves vont au musée. Le car coûte ${bus} € en tout et l’entrée ${ticket} € par élève. Combien coûte la sortie en tout ?`,
              answer: num(total, '€'),
              traps: traps(r(total), [
                [bus + ticket, `L’entrée se paie pour chacun des ${n} élèves.`],
                [n * (bus + ticket), 'Le car ne se paie qu’une fois.'],
              ]),
              hint: 'Prix des entrées pour tous, plus le car.',
              steps: [
                `Entrées : ${n} × ${ticket} = ${n * ticket} €.`,
                `Avec le car : ${n * ticket} + ${bus} = **${total} €**.`,
              ],
              targetSeconds: 50,
            };
          },
        ),
        S(
          id('boss-operations-ficelle'),
          'Problème : les morceaux de ficelle',
          cm2
            ? 'Poser et effectuer des divisions décimales avec un dividende entier et un diviseur à un chiffre'
            : 'Poser et effectuer des divisions euclidiennes avec un diviseur à un chiffre',
          ['Partager une longueur en parts égales : division.'],
          (rng) => {
            const d = rng.int(2, 8);
            const each = cm2 ? exactDecimal(rng, 2, 30, 1) : r(rng.int(5, 30));
            const total = mul(each, r(d));
            return {
              prompt: `On coupe une ficelle de ${fmt(total)} m en ${d} morceaux de même longueur. Combien mesure chaque morceau ?`,
              answer: num(each, 'm'),
              traps: traps(each, [[mul(total, r(d)), 'On partage : c’est une division.']]),
              hint: `Divise ${fmt(total)} par ${d}.`,
              steps: [`${fmt(total)} ÷ ${d}.`, `= **${fmt(each)} m**.`],
              targetSeconds: 40,
            };
          },
        ),
      ],
      [
        S(
          id('boss-operations-piege'),
          'Piège : le reste',
          'Poser et effectuer des divisions euclidiennes avec un diviseur à un chiffre',
          ['Le reste est toujours **plus petit** que le diviseur.'],
          (rng) => {
            const d = rng.int(3, 9);
            const q = rng.int(4, 12);
            const rest = rng.int(1, d - 1);
            return {
              prompt: `Lina écrit : ${d * q + rest} = ${d} × ${q - 1} + ${rest + d}. A-t-elle trouvé le quotient de la division par ${d} ?`,
              ...choice(
                rng,
                'Non',
                [{ label: 'Oui', why: `Le reste ${rest + d} est plus grand que ${d} : on peut encore mettre ${d}.` }],
                true,
              ),
              hint: 'Le reste doit être plus petit que le diviseur.',
              steps: [`${rest + d} > ${d}.`, `**Non** : ${d * q + rest} = ${d} × ${q} + ${rest}.`],
              targetSeconds: 30,
            };
          },
        ),
      ],
    ),
  );

  return operations;
}
