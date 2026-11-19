import { choice, distinct, fraction, num, traps } from '../../build.ts';
import { frac, r, rawFrac } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';
import { bossOf, NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildFractions({ S, C, cm2, id }: Contexte): Chapter {
  const maxDen = cm2 ? 60 : 20;

  // ——— Fractions ———

  const lireFraction = S(
    id('lire-fraction'),
    'Lire et représenter une fraction',
    'Savoir interpréter, représenter, écrire et lire des fractions',
    ['{3/8} : on partage l’unité en **8 parts égales** (le dénominateur) et on en prend **3** (le numérateur).'],
    (rng) => {
      const d = rng.int(3, 12);
      const n = rng.int(1, d - 1);
      const what = rng.pick(['une pizza', 'une tablette de chocolat', 'une tarte', 'un ruban']);
      return {
        prompt: `On partage ${what} en ${d} parts égales et on en prend ${n}. Quelle fraction a-t-on prise ?`,
        answer: fraction(r(n, d)),
        traps: traps(r(n, d), [
          [r(d, n), 'Le dénominateur (en bas) est le nombre de parts en tout.'],
          [r(n, d - n), 'En bas : le nombre total de parts.'],
        ]),
        hint: 'En bas : le nombre de parts égales. En haut : le nombre de parts prises.',
        steps: [
          `${d} parts égales → dénominateur ${d}. ${n} prises → numérateur ${n}.`,
          `C’est **${rawFrac(n, d)}**${frac(r(n, d)) === rawFrac(n, d) ? '' : ` (= ${frac(r(n, d))})`}.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const fractionEntier = S(
    id('fraction-entier'),
    'Fraction plus grande que 1',
    'Savoir écrire une fraction supérieure à 1 comme la somme d’un entier et d’une fraction inférieure à 1',
    ['{7/4} = {4/4} + {3/4} = 1 + {3/4}. On cherche combien de fois le dénominateur « tient » dans le numérateur.'],
    (rng, level) => {
      const d = rng.int(2, Math.min(12, maxDen));
      const e = rng.int(1, level === 1 ? 2 : 5);
      const rest = rng.int(1, d - 1);
      const n = e * d + rest;
      if (level === 3) {
        return {
          prompt: `Écris ${e} + ${rawFrac(rest, d)} comme une seule fraction de dénominateur ${d} : quel est le numérateur ?`,
          answer: num(n),
          traps: traps(r(n), [[e + rest, `${e} = {${e * d}/${d}} : il faut ${e * d} ${d}ᵉˢ.`]]),
          hint: `Combien de ${d}ᵉˢ dans ${e} unité${e > 1 ? 's' : ''} ?`,
          steps: [
            `${e} = {${e * d}/${d}}.`,
            `{${e * d}/${d}} + ${rawFrac(rest, d)} = {${n}/${d}} : le numérateur est **${n}**.`,
          ],
          targetSeconds: 25,
        };
      }
      return {
        prompt: `${rawFrac(n, d)} = … + ${rawFrac(rest, d)}. Quel est l’entier ?`,
        answer: num(e),
        traps: traps(r(e), [[n - rest, `${n - rest} ${d}ᵉˢ, c’est ${e} unité${e > 1 ? 's' : ''}.`]]),
        hint: `Combien de fois ${d} dans ${n} ?`,
        steps: [`${n} = ${d} × ${e} + ${rest}.`, `${rawFrac(n, d)} = **${e}** + ${rawFrac(rest, d)}.`],
        targetSeconds: 25,
      };
    },
    { mental: true },
  );

  const comparerFractions = S(
    id('comparer-fractions'),
    'Comparer des fractions',
    'Comparer des fractions',
    [
      'Même dénominateur : la plus grande a le plus grand numérateur.',
      'Même numérateur : la plus grande a le plus **petit** dénominateur ({1/3} > {1/5} : des parts plus grosses).',
    ],
    (rng, level) => {
      if (level === 2) {
        const n = rng.int(1, 5);
        const [a, b] = distinct(rng, 2, () => rng.int(n + 1, 12));
        const sign = (a ?? 0) < (b ?? 0) ? '>' : '<';
        return {
          prompt: `Compare : ${rawFrac(n, a ?? 2)} … ${rawFrac(n, b ?? 3)}`,
          ...choice(
            rng,
            sign,
            [
              {
                label: sign === '<' ? '>' : '<',
                why: 'Même numérateur : plus le dénominateur est grand, plus les parts sont petites.',
              },
            ],
            true,
          ),
          hint: 'Même nombre de parts prises : lesquelles sont les plus grosses ?',
          steps: [
            'Même numérateur : on compare la taille des parts.',
            `${rawFrac(n, a ?? 2)} **${sign}** ${rawFrac(n, b ?? 3)}.`,
          ],
          targetSeconds: 20,
        };
      }
      const d = rng.int(3, Math.min(20, maxDen));
      const [a, b] = distinct(rng, 2, () => rng.int(1, level === 3 ? 2 * d : d - 1));
      const sign = (a ?? 0) < (b ?? 0) ? '<' : '>';
      return {
        prompt: `Compare : ${rawFrac(a ?? 1, d)} … ${rawFrac(b ?? 2, d)}`,
        ...choice(
          rng,
          sign,
          [{ label: sign === '<' ? '>' : '<', why: 'Même dénominateur : compare les numérateurs.' }],
          true,
        ),
        hint: 'Même dénominateur : compare les numérateurs.',
        steps: [
          'Même taille de parts : on compare le nombre de parts.',
          `${rawFrac(a ?? 1, d)} **${sign}** ${rawFrac(b ?? 2, d)}.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const addFractions = S(
    id('additionner-fractions'),
    'Additionner et soustraire des fractions',
    'Additionner et soustraire des fractions',
    ['Même dénominateur : on additionne les numérateurs et on **garde** le dénominateur : {2/7} + {3/7} = {5/7}.'],
    (rng, level) => {
      const d = rng.int(3, Math.min(level === 3 ? maxDen : 12, 30));
      const a = rng.int(1, d - 1);
      const b = rng.int(1, d - 1);
      const minus = level === 3 && a > b;
      const res = minus ? a - b : a + b;
      return {
        prompt: `Calcule ${rawFrac(a, d)} ${minus ? '−' : '+'} ${rawFrac(b, d)}.`,
        answer: { kind: 'fraction', value: r(res, d) },
        traps: traps(r(res, d), [
          [r(res, minus ? 1 : 2 * d), 'On garde le dénominateur : ce sont toujours des ' + String(d) + 'ᵉˢ.'],
        ]),
        hint: `Des ${d}ᵉˢ ${minus ? 'moins' : 'plus'} des ${d}ᵉˢ, ça donne des ${d}ᵉˢ.`,
        steps: [
          `${a} ${minus ? '−' : '+'} ${b} = ${res}, et on garde ${d}.`,
          `= **${rawFrac(res, d)}**${frac(r(res, d)) === rawFrac(res, d) ? '' : ` (= ${frac(r(res, d))})`}.`,
        ],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

  const fractionQuantite = S(
    id('fraction-quantite'),
    'Fraction d’une quantité',
    'Déterminer une fraction d’une quantité ou d’une grandeur',
    [
      cm2 ? '{3/4} de 20 : 20 ÷ 4 = 5, puis 3 × 5 = 15.' : 'Un tiers de 12 billes : 12 ÷ 3 = 4 billes.',
      'On partage d’abord en parts égales (dénominateur), puis on prend le bon nombre de parts.',
    ],
    (rng, level) => {
      const d = rng.pick([2, 3, 4, 5, 10]);
      const unitOnly = !cm2 || level === 1;
      const n = unitOnly || d === 2 ? 1 : rng.int(2, d - 1);
      const part = rng.int(2, 25);
      const total = d * part;
      const names = ['la moitié', 'le tiers', 'le quart', 'le cinquième', 'le dixième'];
      const label = n === 1 ? (names[[2, 3, 4, 5, 10].indexOf(d)] ?? rawFrac(1, d)) : `les ${rawFrac(n, d)}`;
      return {
        prompt: `Combien font ${label} de ${total} ?`,
        answer: num(n * part),
        traps: traps(r(n * part), [
          [total - n * part, 'Tu as calculé ce qui reste.'],
          [total * d, `On **partage** ${total} en ${d}.`],
        ]),
        hint: `Partage ${total} en ${d} parts égales.`,
        steps: [`${total} ÷ ${d} = ${part}.`, n === 1 ? `**${part}**.` : `${n} × ${part} = **${n * part}**.`],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

  const fractionSkills: Skill[] = [lireFraction, fractionEntier, comparerFractions, addFractions, fractionQuantite];
  if (cm2) {
    fractionSkills.push(
      S(
        id('entier-fois-fraction'),
        'Entier × fraction',
        'Calculer le produit d’un entier et d’une fraction',
        ['3 × {2/7} = {2/7} + {2/7} + {2/7} = {6/7} : on multiplie le numérateur.'],
        (rng) => {
          const k = rng.int(2, 6);
          const d = rng.int(3, 15);
          const n = rng.int(1, d - 1);
          return {
            prompt: `Calcule ${k} × ${rawFrac(n, d)}.`,
            answer: { kind: 'fraction', value: r(k * n, d) },
            traps: traps(r(k * n, d), [[r(k * n, k * d), 'On ne multiplie que le numérateur.']]),
            hint: `${k} fois ${rawFrac(n, d)}, c’est ${rawFrac(n, d)} + … (${k} fois).`,
            steps: [
              `${k} × ${rawFrac(n, d)} = ${rawFrac(k * n, d)}.`,
              `**${rawFrac(k * n, d)}**${frac(r(k * n, d)) === rawFrac(k * n, d) ? '' : ` (= ${frac(r(k * n, d))})`}.`,
            ],
            targetSeconds: 20,
          };
        },
        { mental: true },
      ),
    );
  }

  const fractions = C(
    id('fractions'),
    'nombres',
    'Les fractions',
    fractionSkills,
    bossOf(
      [
        S(
          id('boss-fractions-gateau'),
          'Problème : le gâteau partagé',
          'Additionner et soustraire des fractions',
          ['Le gâteau entier vaut {8/8}. Ce qui reste = {8/8} − ce qui est mangé.'],
          (rng) => {
            const d = rng.pick([6, 8, 10, 12]);
            const a = rng.int(1, 3);
            const b = rng.int(1, 3);
            const rest = d - a - b;
            return {
              prompt: `Un gâteau est coupé en ${d} parts égales. Lina en mange ${a}, Tao ${b}. Quelle fraction du gâteau reste-t-il ?`,
              answer: { kind: 'fraction', value: r(rest, d) },
              traps: traps(r(rest, d), [[r(a + b, d), 'Ça, c’est ce qui est **mangé**.']]),
              hint: `Le gâteau entier vaut {${d}/${d}}.`,
              steps: [
                `Mangé : ${rawFrac(a + b, d)}.`,
                `Reste : {${d}/${d}} − ${rawFrac(a + b, d)} = **${rawFrac(rest, d)}**.`,
              ],
              targetSeconds: 35,
            };
          },
        ),
        S(
          id('boss-fractions-billes'),
          'Problème : les billes',
          'Déterminer une fraction d’une quantité ou d’une grandeur',
          ['Le quart de 24 billes : 24 ÷ 4 = 6.'],
          (rng) => {
            const d = rng.pick([2, 3, 4, 5]);
            const part = rng.int(3, 12);
            const total = d * part;
            const who = rng.pick(NAMES);
            return {
              prompt: `${who} a ${total} billes. Il en donne ${rawFrac(1, d)} à son ami. Combien lui en reste-t-il ?`,
              answer: num(total - part),
              traps: traps(r(total - part), [[part, 'Ça, c’est ce qu’il **donne**.']]),
              hint: `Calcule d’abord ${rawFrac(1, d)} de ${total}.`,
              steps: [
                `${rawFrac(1, d)} de ${total} = ${total} ÷ ${d} = ${part}.`,
                `Il reste ${total} − ${part} = **${total - part}**.`,
              ],
              targetSeconds: 35,
            };
          },
        ),
      ],
      [
        S(
          id('boss-fractions-piege'),
          'Piège : le plus gros dénominateur',
          'Comparer des fractions',
          ['{1/8} est plus **petit** que {1/4} : on partage en plus de parts, donc chaque part est plus petite.'],
          (rng) => {
            const [a, b] = distinct(rng, 2, () => rng.int(2, 10)).sort((x, y) => x - y);
            return {
              prompt: `Que préfères-tu, si tu aimes le chocolat : ${rawFrac(1, a ?? 2)} ou ${rawFrac(1, b ?? 3)} de la même tablette ?`,
              ...choice(
                rng,
                rawFrac(1, a ?? 2),
                [{ label: rawFrac(1, b ?? 3), why: `Partager en ${b} parts donne des parts plus petites qu’en ${a}.` }],
                true,
              ),
              hint: 'Plus on partage, plus les parts sont…',
              steps: [
                `${b} parts sont plus petites que ${a} parts de la même tablette.`,
                `On préfère **${rawFrac(1, a ?? 2)}**.`,
              ],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  return fractions;
}
