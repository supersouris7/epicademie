import { choice, distinct, num, traps } from '../../build.ts';
import { add, cmp, dec, fmt, r, rawFrac, toNumber } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { big, bossOf, NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { exactDecimal } from './outils.ts';

export function buildDecimaux({ S, C, cm2, id, decs }: Contexte): Chapter {
  // ——— Nombres décimaux ———

  const fractionDecimale = S(
    id('fraction-decimale'),
    'Fractions décimales et virgule',
    'Passer d’une écriture sous forme d’une fraction décimale ou d’une somme de fractions décimales à une écriture à virgule et réciproquement',
    [
      '{1/10} = 0,1 (un dixième) ; {1/100} = 0,01 (un centième)' + (cm2 ? ' ; {1/1000} = 0,001 (un millième).' : '.'),
      '35,78 = 35 + {7/10} + {8/100}.',
    ],
    (rng, level) => {
      const d = level === 1 ? 1 : rng.int(1, decs);
      const n = rng.int(2, level === 1 ? 99 : 9999);
      const v = r(n, 10 ** d);
      if (level === 3) {
        const u = rng.int(1, 50);
        const t = rng.int(1, 9);
        const c = rng.int(1, 9);
        const x = add(add(r(u), r(t, 10)), r(c, 100));
        return {
          prompt: `Écris avec une virgule : ${u} + ${rawFrac(t, 10)} + ${rawFrac(c, 100)}.`,
          answer: num(x),
          traps: traps(x, [
            [add(add(r(u), r(c, 10)), r(t, 100)), 'Les dixièmes viennent juste après la virgule, puis les centièmes.'],
          ]),
          hint: 'Dixièmes : 1er chiffre après la virgule ; centièmes : 2e.',
          steps: [`${u} unités, ${t} dixièmes, ${c} centièmes.`, `**${fmt(x)}**.`],
          targetSeconds: 20,
        };
      }
      return {
        prompt: `Écris ${rawFrac(n, 10 ** d)} avec une virgule.`,
        answer: num(v),
        traps: traps(v, [
          [
            r(n, 10 ** (d + 1)),
            `${big(10 ** d)} a ${d} zéro${d > 1 ? 's' : ''} : ${d} chiffre${d > 1 ? 's' : ''} après la virgule.`,
          ],
        ]),
        hint: `${big(10 ** d)} a ${d} zéro${d > 1 ? 's' : ''} : combien de chiffres après la virgule ?`,
        steps: [`Il faut ${d} chiffre${d > 1 ? 's' : ''} après la virgule.`, `${rawFrac(n, 10 ** d)} = **${fmt(v)}**.`],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const chiffreDecimal = S(
    id('chiffres-decimaux'),
    'Dixièmes, centièmes' + (cm2 ? ', millièmes' : ''),
    `Connaître et utiliser les relations entre unités simples, dixièmes${cm2 ? ', centièmes et millièmes' : ' et centièmes'}`,
    [
      'Juste après la virgule : les **dixièmes**, puis les **centièmes**' + (cm2 ? ', puis les **millièmes**.' : '.'),
      '1 unité = 10 dixièmes = 100 centièmes.',
    ],
    (rng) => {
      const x = exactDecimal(rng, 1, 99, decs);
      const digits = fmt(x).split(',')[1] ?? '';
      const pos = rng.int(0, digits.length - 1);
      const names = ['dixièmes', 'centièmes', 'millièmes'];
      const dgt = Number(digits[pos]);
      const other = Number(digits[(pos + 1) % digits.length]);
      return {
        prompt: `Quel est le chiffre des **${names[pos]}** dans ${fmt(x)} ?`,
        answer: num(dgt),
        traps: traps(r(dgt), [
          [other, `Compte les rangs après la virgule : dixièmes, centièmes${cm2 ? ', millièmes' : ''}.`],
        ]),
        hint: 'Après la virgule : dixièmes, puis centièmes' + (cm2 ? ', puis millièmes.' : '.'),
        steps: [`Le ${pos + 1}e chiffre après la virgule est celui des ${names[pos]}.`, `C’est **${dgt}**.`],
        targetSeconds: 12,
      };
    },
    { mental: true },
  );

  const comparerDecimaux = S(
    id('comparer-decimaux'),
    'Comparer des nombres décimaux',
    'Comparer, encadrer, intercaler, ordonner, par ordre croissant ou décroissant, des nombres décimaux donnés par leur écriture à virgule en utilisant les symboles =, < et >',
    [
      'Compare d’abord les parties entières, puis les dixièmes, puis les centièmes. 2,5 > 2,15 car 5 dixièmes > 1 dixième.',
    ],
    (rng) => {
      const u = rng.int(0, 30);
      const a = add(r(u), dec(rng.int(1, 9), 1));
      const b = add(r(u), dec(rng.int(11, 99), 2));
      const sign = cmp(a, b) < 0 ? '<' : cmp(a, b) > 0 ? '>' : '=';
      return {
        prompt: `Compare : ${fmt(a)} … ${fmt(b)}`,
        ...choice(
          rng,
          sign,
          ['<', '>', '=']
            .filter((x) => x !== sign)
            .map((x) => ({
              label: x,
              why: 'Compare chiffre par chiffre : dixièmes d’abord, pas le nombre de chiffres.',
            })),
          true,
        ),
        hint: `Écris ${fmt(a)} avec deux chiffres après la virgule pour comparer.`,
        steps: [
          `${fmt(a)} = ${toNumber(a).toFixed(2).replace('.', ',')} : on compare les centièmes.`,
          `${fmt(a)} **${sign}** ${fmt(b)}.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const arrondir = S(
    id('arrondi'),
    'Partie entière et arrondi à l’unité',
    'Savoir donner la partie entière et l’arrondi à l’entier d’un nombre décimal',
    ['La **partie entière** de 7,8 est 7. L’**arrondi** à l’unité de 7,8 est 8 (le plus proche entier).'],
    (rng, level) => {
      const x = exactDecimal(rng, 1, 99, 1);
      const lo = Math.floor(toNumber(x));
      const tenthDigit = Math.round((toNumber(x) - lo) * 10);
      const round = tenthDigit >= 5 ? lo + 1 : lo;
      const askRound = level !== 1;
      return {
        prompt: askRound ? `Arrondis ${fmt(x)} à l’unité.` : `Quelle est la partie entière de ${fmt(x)} ?`,
        answer: num(askRound ? round : lo),
        traps: traps(r(askRound ? round : lo), [
          [
            askRound ? (round === lo ? lo + 1 : lo) : tenthDigit,
            askRound
              ? `Le chiffre des dixièmes est ${tenthDigit} : ${tenthDigit >= 5 ? 'on monte' : 'on garde'}.`
              : 'La partie entière, c’est ce qui est avant la virgule.',
          ],
        ]),
        hint: askRound ? 'Regarde le chiffre des dixièmes : 5 ou plus, on monte.' : 'Ce qui est avant la virgule.',
        steps: [
          askRound
            ? `${fmt(x)} est entre ${lo} et ${lo + 1} ; dixièmes : ${tenthDigit}.`
            : 'La partie entière est le nombre avant la virgule.',
          `**${askRound ? round : lo}**.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const droiteDecimale = S(
    id('droite-decimale'),
    'Décimaux sur une demi-droite graduée',
    'Placer un nombre décimal en écriture à virgule sur une demi-droite graduée et repérer un point d’une demi-droite graduée par un nombre décimal',
    ['Entre 2 et 3, il y a 10 petits traits : chacun vaut **un dixième** (0,1).'],
    (rng) => {
      const start = rng.int(0, 8);
      const k = rng.int(1, 9);
      const at = add(r(start), r(k, 10));
      return {
        prompt: `L’unité est partagée en 10. Quel nombre est au point A ?`,
        figure: {
          kind: 'numberLine',
          min: start,
          max: start + 1,
          subdivisions: 10,
          labels: [start, start + 1],
          points: [{ name: 'A', at: toNumber(at) }],
        },
        answer: num(at),
        traps: traps(at, [[r(start + k), 'Un petit trait vaut un dixième, pas 1.']]),
        hint: `Chaque petit trait vaut 0,1. Compte les traits depuis ${start}.`,
        steps: [`A est ${k} dixièmes après ${start}.`, `**${fmt(at)}**.`],
        targetSeconds: 20,
      };
    },
  );

  const decimaux = C(
    id('decimaux'),
    'nombres',
    'Les nombres décimaux',
    [fractionDecimale, chiffreDecimal, comparerDecimaux, arrondir, droiteDecimale],
    bossOf(
      [
        S(
          id('boss-decimaux-course'),
          'Problème : le saut en longueur',
          'Comparer, encadrer, intercaler, ordonner, par ordre croissant ou décroissant, des nombres décimaux',
          ['Le plus long saut gagne : compare les mètres, puis les dixièmes, puis les centièmes.'],
          (rng) => {
            const who = distinct(rng, 3, () => rng.pick(NAMES));
            const jumps = distinct(rng, 3, () => add(r(3), dec(rng.int(1, 99), 2)), fmt);
            const best = jumps.reduce((m, j) => (cmp(j, m) > 0 ? j : m));
            const winner = who[jumps.indexOf(best)] ?? '';
            return {
              prompt: `Saut en longueur : ${who.map((w, i) => `${w} ${fmt(jumps[i] ?? r(0))} m`).join(', ')}. Qui a sauté le plus loin ?`,
              ...choice(
                rng,
                winner,
                who
                  .filter((w) => w !== winner)
                  .map((w) => ({ label: w, why: 'Compare les dixièmes, puis les centièmes.' })),
              ),
              hint: 'Tous ont sauté 3 m et quelques : compare les dixièmes.',
              steps: [`Le plus grand nombre est ${fmt(best)}.`, `C’est **${winner}**.`],
              targetSeconds: 35,
            };
          },
        ),
        S(
          id('boss-decimaux-monnaie'),
          'Problème : la monnaie',
          'Passer d’une écriture sous forme d’une fraction décimale ou d’une somme de fractions décimales à une écriture à virgule et réciproquement',
          ['1 € = 100 centimes : 3 € et 45 centimes = 3,45 €.'],
          (rng) => {
            const e = rng.int(1, 20);
            const c = rng.int(1, 99);
            return {
              prompt: `Dans ma tirelire, il y a ${e} € et ${c} centimes. Écris cette somme en euros, avec une virgule.`,
              answer: num(add(r(e), r(c, 100)), '€'),
              traps: traps(add(r(e), r(c, 100)), [
                [add(r(e), r(c, 10)), '1 centime = 0,01 € : les centimes occupent 2 chiffres après la virgule.'],
              ]),
              hint: '1 centime, c’est un centième d’euro.',
              steps: [
                `${c} centimes = ${fmt(r(c, 100))} €.`,
                `${e} + ${fmt(r(c, 100))} = **${fmt(add(r(e), r(c, 100)))} €**.`,
              ],
              targetSeconds: 30,
            };
          },
        ),
      ],
      [
        S(
          id('boss-decimaux-piege'),
          'Piège : 2,15 ou 2,5 ?',
          'Comparer, encadrer, intercaler, ordonner, par ordre croissant ou décroissant, des nombres décimaux',
          ['Plus de chiffres ne veut pas dire plus grand : 2,5 = 2,50 > 2,15.'],
          (rng) => {
            const u = rng.int(1, 9);
            const big1 = add(r(u), r(rng.int(5, 9), 10));
            const small = add(r(u), dec(rng.int(11, 49), 2));
            return {
              prompt: `Lequel est le plus grand : ${fmt(small)} ou ${fmt(big1)} ?`,
              ...choice(
                rng,
                fmt(big1),
                [
                  {
                    label: fmt(small),
                    why: `${fmt(big1)} = ${toNumber(big1).toFixed(2).replace('.', ',')} : compare les centièmes.`,
                  },
                ],
                true,
              ),
              hint: 'Écris les deux nombres avec deux chiffres après la virgule.',
              steps: [
                `${fmt(big1)} = ${toNumber(big1).toFixed(2).replace('.', ',')}.`,
                `Le plus grand est **${fmt(big1)}**.`,
              ],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  return decimaux;
}
