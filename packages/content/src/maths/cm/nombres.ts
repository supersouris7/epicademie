import { choice, distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { big, bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { inWords } from './outils.ts';

export function buildNombres({ S, C, cm2, id }: Contexte): Chapter {
  const maxN = cm2 ? 999_999_999 : 999_999;

  // ——— Les nombres entiers ———

  const lireNombre = S(
    id('lire-nombres'),
    'Lire et écrire les grands nombres',
    `Connaître la suite écrite et la suite orale des nombres jusqu’à ${cm2 ? '999 999 999' : '999 999'}`,
    [
      'Pour lire un grand nombre, fais des **tranches de 3 chiffres** en partant de la droite : ' +
        (cm2 ? 'millions, mille, unités.' : 'mille, puis unités.'),
      '« Mille » ne prend jamais de « s » ; « cent » en prend un seulement s’il termine le nombre (deux-cents, mais deux-cent-trois).',
    ],
    (rng, level) => {
      const n =
        level === 1
          ? rng.int(1001, 99_999)
          : level === 2
            ? rng.int(100_001, 999_999)
            : rng.int(cm2 ? 1_000_001 : 100_001, maxN);
      const good = inWords(n);
      const swap = inWords(
        Math.floor(n / 1000) + (n % 1000) * 1000 > maxN ? n + 1 : Math.floor(n / 1000) + (n % 1000) * 1000,
      );
      const plusOne = inWords(n + (n % 1000 === 999 ? -1 : 1) * (n % 100 === 0 ? 1 : 10));
      return {
        prompt: `Comment s’écrit ${big(n)} en lettres ?`,
        ...choice(rng, good, [
          { label: swap, why: 'Fais des tranches de 3 chiffres depuis la droite, puis lis-les de gauche à droite.' },
          { label: plusOne, why: 'Relis chaque tranche chiffre par chiffre.' },
        ]),
        hint: 'Coupe le nombre en tranches de 3 chiffres en partant de la droite.',
        steps: [`Tranches : ${big(n)}.`, `On lit : **${good}**.`],
        targetSeconds: 30,
      };
    },
  );

  const valeurChiffre = S(
    id('valeur-chiffre'),
    'Valeur d’un chiffre',
    'Connaître la valeur des chiffres en fonction de leur position dans un nombre',
    [
      'Dans 254 708, le 4 est le chiffre des **unités de mille** : il vaut 4 000.',
      'Unités, dizaines, centaines, puis mille, dizaines de mille, centaines de mille' +
        (cm2 ? ', puis millions…' : '.'),
    ],
    (rng, level) => {
      const n = rng.int(level === 1 ? 1000 : 100_000, level === 3 ? maxN : 999_999);
      const digits = String(n);
      const pos = rng.int(0, digits.length - 1);
      const dgt = Number(digits[pos]);
      if (dgt === 0) return valeurChiffre.generate(rng, level);
      const place = 10 ** (digits.length - 1 - pos);
      const names = [
        'unités',
        'dizaines',
        'centaines',
        'unités de mille',
        'dizaines de mille',
        'centaines de mille',
        'millions',
        'dizaines de millions',
        'centaines de millions',
      ];
      const rank = names[digits.length - 1 - pos] ?? '';
      return {
        prompt: `Dans ${big(n)}, que vaut le chiffre ${dgt} des ${rank} ?`,
        answer: num(dgt * place),
        traps: traps(r(dgt * place), [[dgt, `${dgt} est le chiffre ; il vaut ${dgt} ${rank}.`]]),
        hint: `Le chiffre des ${rank} vaut ce chiffre × ${big(place)}.`,
        steps: [
          `C’est le chiffre des ${rank} : 1 ${rank.replace(/s( |$)/, '$1')} = ${big(place)}.`,
          `${dgt} × ${big(place)} = **${big(dgt * place)}**.`,
        ],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

  const comparerEntiers = S(
    id('comparer-entiers'),
    'Comparer et ranger des nombres',
    'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles =, < et >',
    [
      'Le nombre qui a **le plus de chiffres** est le plus grand. S’ils en ont autant, compare chiffre par chiffre depuis la gauche.',
    ],
    (rng, level) => {
      if (level === 3) {
        const base = rng.int(10_000, Math.floor(maxN / 10));
        const vals = distinct(
          rng,
          4,
          () => base + rng.pick([rng.int(1, 9) * 1000, rng.int(1, 9) * 100, rng.int(1, 9) * 10, rng.int(0, 9)]),
        );
        const min = Math.min(...vals);
        return {
          prompt: `Quel est le plus **petit** nombre : ${vals.map(big).join(' ; ')} ?`,
          ...choice(
            rng,
            big(min),
            vals
              .filter((v) => v !== min)
              .map((v) => ({ label: big(v), why: 'Compare chiffre par chiffre en partant de la gauche.' })),
          ),
          hint: 'Ils ont le même nombre de chiffres : compare de gauche à droite.',
          steps: [
            'Même nombre de chiffres : on compare chiffre par chiffre depuis la gauche.',
            `Le plus petit est **${big(min)}**.`,
          ],
          targetSeconds: 30,
        };
      }
      const a = rng.int(1000, level === 1 ? 99_999 : maxN);
      let b = level === 1 ? rng.int(1000, 99_999) : a + rng.pick([-1, 1]) * rng.pick([1, 10, 100, 1000]);
      if (b === a) b++;
      const sign = a < b ? '<' : '>';
      return {
        prompt: `Compare : ${big(a)} … ${big(b)}`,
        ...choice(
          rng,
          sign,
          [
            {
              label: sign === '<' ? '>' : '<',
              why: 'Compare d’abord le nombre de chiffres, puis chiffre par chiffre depuis la gauche.',
            },
          ],
          true,
        ),
        hint: 'Compte les chiffres, puis compare de gauche à droite.',
        steps: [
          'On compare le nombre de chiffres, puis chiffre par chiffre depuis la gauche.',
          `${big(a)} **${sign}** ${big(b)}.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const demiDroite = S(
    id('demi-droite'),
    'Repérer un nombre sur une demi-droite graduée',
    'Savoir placer des nombres et repérer des points sur une demi-droite graduée',
    ['Regarde d’abord de combien on avance à **chaque petit trait** : 1 ? 10 ? 100 ? 1 000 ?'],
    (rng, level) => {
      const step = level === 1 ? 10 : level === 2 ? 100 : 1000;
      const start = rng.int(1, 9) * step * 10;
      const k = rng.int(1, 9);
      const at = start + k * step;
      return {
        prompt: `Sur cette demi-droite, chaque petit trait vaut ${big(step)}. Quel nombre est au point A ?`,
        figure: {
          kind: 'numberLine',
          min: start,
          max: start + 10 * step,
          subdivisions: 1 / step,
          labels: [start, start + 10 * step],
          points: [{ name: 'A', at }],
        },
        answer: num(at),
        traps: traps(r(at), [[start + k, `Un trait vaut ${big(step)}, pas 1.`]]),
        hint: `Compte les traits depuis ${big(start)} : chacun vaut ${big(step)}.`,
        steps: [`A est ${k} traits après ${big(start)}.`, `${big(start)} + ${k} × ${big(step)} = **${big(at)}**.`],
        targetSeconds: 25,
      };
    },
  );

  const multiples = S(
    id('multiples'),
    'Multiples et diviseurs',
    'Savoir déterminer si un nombre entier donné est un multiple d’un nombre entier inférieur ou égal à 10',
    [
      'Multiple de 2 : se termine par 0, 2, 4, 6, 8. De 5 : par 0 ou 5. De 10 : par 0.',
      'Pour les autres, utilise les tables : 63 est multiple de 7 car 7 × 9 = 63.',
    ],
    (rng, level) => {
      const k = level === 1 ? rng.pick([2, 5, 10]) : rng.int(3, 9);
      const yes = rng.int(0, 1) === 1;
      const n = yes ? k * rng.int(3, level === 1 ? 300 : 12) : k * rng.int(3, 12) + rng.int(1, k - 1);
      return {
        prompt: `${big(n)} est-il un multiple de ${k} ?`,
        ...choice(
          rng,
          yes ? 'Oui' : 'Non',
          [
            {
              label: yes ? 'Non' : 'Oui',
              why: yes
                ? `${big(n)} = ${k} × ${big(n / k)}.`
                : `${big(n)} n’est pas dans la table de ${k} : il y a un reste.`,
            },
          ],
          true,
        ),
        hint: k === 2 || k === 5 || k === 10 ? `Regarde le chiffre des unités.` : `Cherche dans la table de ${k}.`,
        steps: [
          yes
            ? `${big(n)} = ${k} × ${big(n / k)}.`
            : `${big(n)} = ${k} × ${Math.floor(n / k)} + ${n % k} : il reste ${n % k}.`,
          `**${yes ? 'Oui' : 'Non'}**.`,
        ],
        targetSeconds: 15,
      };
    },
    { mental: true },
  );

  const nombres = C(
    id('nombres'),
    'nombres',
    'Les nombres entiers',
    [lireNombre, valeurChiffre, comparerEntiers, demiDroite, multiples],
    bossOf(
      [
        S(
          id('boss-nombres-cheque'),
          'Problème : le chèque',
          `Connaître la suite écrite et la suite orale des nombres jusqu’à ${cm2 ? '999 999 999' : '999 999'}`,
          ['Sur un chèque, on écrit la somme en chiffres et en lettres.'],
          (rng) => {
            const n = rng.int(1001, 9999);
            return {
              prompt: `Sur un chèque, il est écrit « ${inWords(n)} euros ». Écris la somme en chiffres.`,
              answer: num(n, '€'),
              traps: traps(r(n), [[n + 1000 > 9999 ? n - 1000 : n + 1000, 'Relis la partie avant « mille ».']]),
              hint: 'Ce qui est avant « mille » donne les milliers ; ce qui est après, le reste.',
              steps: [`« ${inWords(n)} » : ${Math.floor(n / 1000)} mille et ${n % 1000}.`, `Soit **${big(n)} €**.`],
              targetSeconds: 35,
            };
          },
        ),
        S(
          id('boss-nombres-stade'),
          'Problème : le stade',
          'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles =, < et >',
          ['Pour savoir lequel est le plus grand, compare chiffre par chiffre depuis la gauche.'],
          (rng) => {
            const a = rng.int(20_000, 80_000);
            const b = a + rng.pick([-1, 1]) * rng.int(100, 900);
            const [x, y] = distinct(rng, 2, () => rng.pick(['Marseille', 'Lyon', 'Lille', 'Nantes', 'Rennes', 'Nice']));
            const winner = a > b ? x : y;
            return {
              prompt: `Le stade de ${x} a accueilli ${big(a)} spectateurs, celui de ${y} ${big(b)}. Quel stade a accueilli le plus de spectateurs ?`,
              ...choice(
                rng,
                winner ?? '',
                [{ label: (a > b ? y : x) ?? '', why: 'Compare chiffre par chiffre depuis la gauche.' }],
                true,
              ),
              hint: 'Même nombre de chiffres : compare depuis la gauche.',
              steps: [`${big(a)} ${a > b ? '>' : '<'} ${big(b)}.`, `C’est **${winner}**.`],
              targetSeconds: 30,
            };
          },
        ),
      ],
      [
        S(
          id('boss-nombres-piege'),
          'Piège : le zéro',
          'Connaître la valeur des chiffres en fonction de leur position dans un nombre',
          ['Un zéro au milieu d’un nombre compte : 3 050 n’est pas 350.'],
          (rng) => {
            const t = rng.int(2, 9);
            const u = rng.int(10, 90);
            const n = t * 1000 + u;
            return {
              prompt: `Écris en chiffres : ${inWords(n)}.`,
              answer: num(n),
              traps: traps(r(n), [
                [t * 100 + u, `Il y a ${t} **mille** : le nombre a 4 chiffres, avec un 0 aux centaines.`],
              ]),
              hint: 'Combien de milliers ? de centaines ? (attention au zéro)',
              steps: [`${t} mille, 0 centaine et ${u}.`, `**${big(n)}**.`],
              targetSeconds: 25,
            };
          },
        ),
      ],
    ),
  );

  return nombres;
}
