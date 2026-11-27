import { num, traps } from '../../build.ts';
import { dec, fmt, mul, r, rawFrac } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { big, bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { exactDecimal } from './outils.ts';

export function buildCalculMental({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Calcul mental ———

  const tables = S(
    id('tables'),
    'Tables de multiplication',
    'Connaître des faits numériques usuels relatifs aux nombres entiers',
    ['7 × 8 = 8 × 7 : on peut retourner une multiplication. Astuce : × 9 = × 10 puis on enlève une fois.'],
    (rng) => {
      const a = rng.int(2, 10);
      const b = rng.int(2, 10);
      return {
        prompt: `Calcule ${a} × ${b}.`,
        answer: num(a * b),
        traps: traps(r(a * b), [
          [a + b, 'C’est une multiplication, pas une addition.'],
          [a * (b - 1), `Il manque une fois ${a}.`],
        ]),
        hint:
          b === 10 || b === 5
            ? `${b} fois ${a} : compte de ${a} en ${a}.`
            : `Pars d’un résultat facile, comme ${a} × 5 ou ${a} × 10, puis ajuste.`,
        steps: [`${a} × ${b} : ${b} fois ${a}.`, `= **${a * b}**.`],
        targetSeconds: 8,
      };
    },
    { mental: true },
  );

  const ajouter9 = S(
    id('ajouter-9'),
    'Ajouter ou soustraire 9, 19, 29…',
    `Ajouter ou soustraire 8, 9, 18, 19, 28, 29${cm2 ? ', …, 98 ou 99' : ', 38 ou 39'}, à un nombre`,
    [
      '+ 9 : on ajoute 10 puis on enlève 1. + 19 : on ajoute 20 puis on enlève 1. − 29 : on enlève 30 puis on rajoute 1.',
    ],
    (rng, level) => {
      const k = rng.pick(
        cm2 ? [9, 19, 29, 39, 49, 59, 69, 79, 89, 99, 8, 18, 28, 38, 48, 98] : [8, 9, 18, 19, 28, 29, 38, 39],
      );
      const n = rng.int(level === 1 ? 20 : 100, level === 1 ? 99 : 999);
      const minus = level === 3 && n > k;
      const res = minus ? n - k : n + k;
      const round = k + (k % 10 === 9 ? 1 : 2);
      const corr = round - k;
      return {
        prompt: `Calcule ${n} ${minus ? '−' : '+'} ${k}.`,
        answer: num(res),
        traps: traps(r(res), [
          [
            minus ? n - round : n + round,
            `Tu as ${minus ? 'enlevé' : 'ajouté'} ${round} : il faut corriger de ${corr}.`,
          ],
        ]),
        hint: `${minus ? 'Enlève' : 'Ajoute'} ${round}, puis ${minus ? 'rajoute' : 'enlève'} ${corr}.`,
        steps: [
          `${n} ${minus ? '−' : '+'} ${round} = ${minus ? n - round : n + round}.`,
          `${minus ? '+' : '−'} ${corr} : **${res}**.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const fois10 = S(
    id('fois-10'),
    cm2 ? 'Multiplier, diviser par 10, 100, 1 000' : 'Multiplier par 10, 100, 1 000',
    cm2 ? 'Multiplier un nombre décimal par 10, 100 ou 1 000' : 'Multiplier un nombre entier par 10, 100 ou 1 000',
    [
      '× 10 : chaque chiffre devient 10 fois plus grand, il glisse d’un rang vers la gauche (on écrit un 0 pour un entier).',
      cm2 ? '÷ 10 : chaque chiffre glisse d’un rang vers la droite.' : '× 100 : deux rangs ; × 1 000 : trois rangs.',
    ],
    (rng, level) => {
      const k = rng.pick([10, 100, 1000]);
      const x = cm2 && level > 1 ? exactDecimal(rng, 1, 99, rng.int(1, 2)) : r(rng.int(2, 999));
      const divide = cm2 && level === 3;
      const res = divide ? mul(x, r(1, k)) : mul(x, r(k));
      return {
        prompt: `Calcule ${fmt(x)} ${divide ? '÷' : '×'} ${big(k)}.`,
        answer: num(res),
        traps: traps(res, [
          [
            divide ? mul(x, r(k)) : mul(x, r(1, k)),
            divide ? 'Diviser rend le nombre plus petit.' : 'Multiplier par ' + big(k) + ' rend le nombre plus grand.',
          ],
        ]),
        hint: `Les chiffres glissent de ${String(k).length - 1} rang${k > 10 ? 's' : ''} vers la ${divide ? 'droite' : 'gauche'}.`,
        steps: [
          `× ou ÷ ${big(k)} : ${String(k).length - 1} rang${k > 10 ? 's' : ''}.`,
          `${fmt(x)} ${divide ? '÷' : '×'} ${big(k)} = **${fmt(res)}**.`,
        ],
        targetSeconds: 12,
      };
    },
    { mental: true },
  );

  const fois5 = S(
    id('fois-4-5-8'),
    'Multiplier par 4, 5 ou 8',
    'Multiplier un nombre entier par 4 ou par 8',
    ['× 4 : le double du double. × 8 : on double trois fois. × 5 : la moitié de × 10.'],
    (rng) => {
      const k = rng.pick([4, 5, 8]);
      const n = rng.int(12, 99);
      return {
        prompt: `Calcule ${n} × ${k}.`,
        answer: num(n * k),
        traps: traps(r(n * k), [[n * k - n, `Il manque une fois ${n}.`]]),
        hint:
          k === 5
            ? `Calcule ${n} × 10, puis prends la moitié.`
            : `Double ${n}${k === 8 ? ' trois fois' : ' deux fois'}.`,
        steps: [
          k === 5
            ? `${n} × 10 = ${n * 10}, la moitié : ${n * 5}.`
            : `${n} → ${n * 2} → ${n * 4}${k === 8 ? ` → ${n * 8}` : ''}.`,
          `= **${n * k}**.`,
        ],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

  const fractionsUsuelles = S(
    id('fractions-usuelles'),
    'Fractions usuelles et décimaux',
    'Connaître l’écriture décimale de fractions usuelles',
    ['{1/2} = 0,5 ; {1/4} = 0,25 ; {3/4} = 0,75 ; {1/10} = 0,1 ; {1/5} = 0,2.'],
    (rng) => {
      const q = rng.pick([
        [1, 2],
        [1, 4],
        [3, 4],
        [1, 10],
        [1, 5],
        [2, 5],
        [3, 2],
      ] as const);
      const v = r(q[0], q[1]);
      return {
        prompt: `Écris ${rawFrac(q[0], q[1])} sous forme décimale.`,
        answer: num(v),
        traps: traps(v, [[dec(Number(`${q[0]}${q[1]}`) % 100, 1), `${rawFrac(q[0], q[1])}, c’est ${q[0]} ÷ ${q[1]}.`]]),
        hint: `${rawFrac(q[0], q[1])} = ${q[0]} ÷ ${q[1]}.`,
        steps: [`${q[0]} ÷ ${q[1]}.`, `= **${fmt(v)}**.`],
        targetSeconds: 10,
      };
    },
    { mental: true },
  );

  const calculMental = C(
    id('calcul-mental'),
    'nombres',
    'Calcul mental',
    [tables, ajouter9, fois10, fois5, fractionsUsuelles],
    bossOf(
      [
        S(
          id('boss-mental-boulangerie'),
          'Problème : la boulangerie',
          'Utiliser ses connaissances en numération pour calculer mentalement',
          ['Prix de 10 objets : × 10 ; prix de 100 : × 100.'],
          (rng) => {
            const p = rng.int(2, 9);
            const n = rng.pick([10, 100]);
            return {
              prompt: `Un croissant coûte ${p} €. Combien coûtent ${n} croissants ?`,
              answer: num(p * n, '€'),
              traps: traps(r(p * n), [[p + n, 'C’est une multiplication.']]),
              hint: `× ${n} : on écrit ${n === 10 ? 'un zéro' : 'deux zéros'}.`,
              steps: [`${p} × ${n}.`, `= **${p * n} €**.`],
              targetSeconds: 20,
            };
          },
          { mental: true },
        ),
        S(
          id('boss-mental-cartes'),
          'Problème : les cartes',
          'Ajouter ou soustraire 8, 9, 18, 19, 28, 29, à un nombre',
          ['Ajouter 19 : ajouter 20, puis enlever 1.'],
          (rng) => {
            const n = rng.int(30, 150);
            const k = rng.pick([9, 19, 29]);
            return {
              prompt: `Tao a ${n} cartes. Il en gagne ${k}. Combien en a-t-il maintenant ?`,
              answer: num(n + k),
              traps: traps(r(n + k), [[n + k + 1, `Ajouter ${k}, c’est ajouter ${k + 1} puis enlever 1.`]]),
              hint: `Ajoute ${k + 1}, puis enlève 1.`,
              steps: [`${n} + ${k + 1} = ${n + k + 1}.`, `− 1 : **${n + k}**.`],
              targetSeconds: 20,
            };
          },
          { mental: true },
        ),
      ],
      [
        {
          ...S(
            id('boss-mental-piege'),
            'Piège : les tables difficiles',
            'Connaître des faits numériques usuels relatifs aux nombres entiers',
            ['Pour une table difficile, pars de la table de 5.', '6 × 7 : 5 × 7 = 35, puis encore 7, ça fait 42.'],
            (rng) => {
              const a = rng.int(6, 9);
              const b = rng.int(6, 9);
              return {
                prompt: `Calcule de tête : ${a} × ${b}.`,
                answer: num(a * b),
                traps: traps(r(a * b), [
                  [a * b + a, `Il y a une fois ${a} de trop.`],
                  [a * b - a, `Il manque une fois ${a}.`],
                ]),
                hint: `Pars de ${a} × 5, puis ajoute le reste.`,
                steps: [
                  `Calcule d’abord le plus facile : ${a} × 5 = ${a * 5}.`,
                  `Calcule ce qui manque : ${a} × ${b - 5} = ${a * (b - 5)}.`,
                  `Ajoute les deux : ${a * 5} + ${a * (b - 5)}.`,
                  `Écris la réponse : **${a * b}**.`,
                ],
                targetSeconds: 15,
              };
            },
            { mental: true },
          ),
          version: 2,
        },
      ],
    ),
  );

  return calculMental;
}
