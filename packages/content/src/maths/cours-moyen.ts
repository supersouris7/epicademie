import { choice, distinct, fraction, num, traps } from '../build.ts';
import { add, cmp, dec, fmt, frac, mul, r, rawFrac, sub, toNumber, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Chapter, Figure, Skill } from '../types.ts';
import { big, bossOf, chapterOf, NAMES, skillsOf } from './kit.ts';

/**
 * Programmes du CM1 et du CM2 (cycle 3, BO n°16 du 17 avril 2025). Les deux années ont la même structure ;
 * les bornes changent : nombres jusqu'à 999 999 (CM1) ou 999 999 999 (CM2), décimaux jusqu'aux centièmes
 * (CM1) ou millièmes (CM2), fractions de dénominateur ≤ 20 (CM1) ou ≤ 60 (CM2)…
 */

type CM = 'cm1' | 'cm2';

const UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

/** Nombre de 0 à 99 en lettres (orthographe de 1990 : traits d'union partout). */
function under100(n: number): string {
  if (n <= 16) return UNITS[n] ?? '';
  if (n < 20) return `dix-${UNITS[n - 10] ?? ''}`;
  if (n < 70) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return TENS[t] ?? '';
    return u === 1 ? `${TENS[t]}-et-un` : `${TENS[t]}-${UNITS[u]}`;
  }
  if (n < 80) return n === 71 ? 'soixante-et-onze' : `soixante-${under100(n - 60)}`;
  if (n === 80) return 'quatre-vingts';
  return `quatre-vingt-${under100(n - 80)}`;
}
/** 0 à 999 en lettres. */
function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return under100(rest);
  const head = h === 1 ? 'cent' : `${UNITS[h]}-cent${rest === 0 ? 's' : ''}`;
  return rest === 0 ? head : `${head}-${under100(rest)}`;
}
/** Entier jusqu'à 999 999 999 en lettres (« mille » invariable, « millions » au pluriel, « cents » final). */
export function inWords(n: number): string {
  if (n === 0) return 'zéro';
  const m = Math.floor(n / 1_000_000);
  const k = Math.floor((n % 1_000_000) / 1000);
  const u = n % 1000;
  const parts: string[] = [];
  if (m) parts.push(`${under1000(m)}-million${m > 1 ? 's' : ''}`);
  if (k) parts.push(k === 1 ? 'mille' : `${under1000(k).replace(/(cent|vingt)s$/, '$1')}-mille`);
  if (u) parts.push(under1000(u));
  return parts.join('-');
}

/** Décimal à `d` décimales dont le dernier chiffre n'est pas nul. */
function exactDecimal(rng: Rng, min: number, max: number, d: number): Rational {
  for (;;) {
    const v = rng.int(min * 10 ** d, max * 10 ** d);
    if (d === 0 || v % 10 !== 0) return dec(v, d);
  }
}

/** Heures et minutes écrites « 2 h 05 » / « 45 min ». */
const hm = (min: number) =>
  min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;

function build(g: CM): Chapter[] {
  const S = skillsOf(g);
  const C = chapterOf(g);
  const cm2 = g === 'cm2';
  const id = (x: string) => `m${g}-${x}`;
  const maxN = cm2 ? 999_999_999 : 999_999;
  const decs = cm2 ? 3 : 2;
  const maxDen = cm2 ? 60 : 20;

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
        ),
      ],
      [
        S(
          id('boss-mental-piege'),
          'Piège : 6 × 7',
          'Connaître des faits numériques usuels relatifs aux nombres entiers',
          ['6 × 7 = 42 et 7 × 8 = 56 : les plus « piégeuses » des tables.'],
          (rng) => {
            const [a, b] = rng.pick([
              [6, 7],
              [7, 8],
              [6, 8],
              [8, 9],
              [7, 9],
              [6, 9],
            ] as const);
            return {
              prompt: `Combien font ${a} × ${b} ?`,
              answer: num(a * b),
              traps: traps(r(a * b), [
                [a * b + a, `Il y a une fois ${a} de trop.`],
                [a * b - a, `Il manque une fois ${a}.`],
              ]),
              hint: `Pars de ${a} × 5 = ${a * 5} puis ajoute ${a} × ${b - 5}.`,
              steps: [
                `${a} × 5 = ${a * 5} ; ${a} × ${b - 5} = ${a * (b - 5)}.`,
                `${a * 5} + ${a * (b - 5)} = **${a * b}**.`,
              ],
              targetSeconds: 12,
            };
          },
        ),
      ],
    ),
  );

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

  const estimer = S(
    id('estimer'),
    'Estimer un résultat',
    'Estimer le résultat d’une opération',
    ['Pour estimer, on arrondit : 49 × 21 ≈ 50 × 20 = 1 000. Ça permet de vérifier un calcul.'],
    (rng) => {
      const a = rng.int(2, 9) * 10 + rng.pick([-1, 1, 2, -2]);
      const b = rng.int(2, 9) * 10 + rng.pick([-1, 1]);
      const est = Math.round(a / 10) * 10 * Math.round(b / 10) * 10;
      return {
        prompt: `Sans calculer exactement, quel est l’ordre de grandeur de ${a} × ${b} ?`,
        ...choice(rng, big(est), [
          { label: big(est * 10), why: 'Arrondis chaque nombre à la dizaine.' },
          { label: big(est / 10), why: 'Arrondis chaque nombre à la dizaine, puis multiplie.' },
        ]),
        hint: `Arrondis ${a} et ${b} à la dizaine.`,
        steps: [
          `${a} ≈ ${Math.round(a / 10) * 10} et ${b} ≈ ${Math.round(b / 10) * 10}.`,
          `Ordre de grandeur : **${big(est)}** (exact : ${big(a * b)}).`,
        ],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

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

  // ——— Résolution de problèmes ———

  const additifs = S(
    id('problemes-additifs'),
    'Problèmes : parties et tout, comparaison',
    cm2
      ? 'Résoudre des problèmes additifs en une ou plusieurs étapes'
      : 'Résoudre des problèmes additifs en une étape des types « parties-tout » et « comparaison »',
    [
      'Le **tout** = somme des parties. Une partie = tout − autre partie. Attention : « de plus » ne veut pas toujours dire addition !',
    ],
    (rng, level) => {
      const who = distinct(rng, 2, () => rng.pick(NAMES));
      if (level === 1) {
        const a = rng.int(120, 900);
        const total = a + rng.int(100, 900);
        return {
          prompt: `Dans une école, il y a ${total} élèves. ${a} sont des filles. Combien y a-t-il de garçons ?`,
          answer: num(total - a),
          traps: traps(r(total - a), [[total + a, 'On cherche une partie : on enlève l’autre partie du tout.']]),
          hint: 'Tout − filles = garçons.',
          steps: [`${total} − ${a}.`, `= **${total - a}** garçons.`],
          targetSeconds: 30,
        };
      }
      const a = rng.int(20, 200);
      const diff = rng.int(5, 80);
      return {
        prompt: `${who[0]} a ${a + diff} points. C’est ${diff} points de plus que ${who[1]}. Combien de points a ${who[1]} ?`,
        answer: num(a),
        traps: traps(r(a), [
          [a + 2 * diff, `« de plus que ${who[1]} » : c’est ${who[0]} qui en a plus, donc ${who[1]} en a moins.`],
        ]),
        hint: `Qui en a le plus ? ${who[1]} en a ${diff} de moins.`,
        steps: [`${who[1]} en a ${diff} de moins que ${who[0]}.`, `${a + diff} − ${diff} = **${a}**.`],
        targetSeconds: 40,
      };
    },
  );

  const multiplicatifs = S(
    id('problemes-multiplicatifs'),
    'Problèmes : fois plus, fois moins',
    'Résoudre des problèmes de comparaison multiplicative',
    ['« 3 fois plus » → multiplication. « 3 fois moins » → division.'],
    (rng) => {
      const a = rng.int(3, 20);
      const k = rng.int(2, 6);
      const more = rng.int(0, 1) === 1;
      const who = distinct(rng, 2, () => rng.pick(NAMES));
      const base = more ? a : a * k;
      const res = more ? a * k : a;
      return {
        prompt: `${who[0]} a ${base} images. ${who[1]} en a ${k} fois ${more ? 'plus' : 'moins'}. Combien ${who[1]} a-t-il d’images ?`,
        answer: num(res),
        traps: traps(r(res), [
          [
            more ? a + k : base - k,
            `« ${k} fois ${more ? 'plus' : 'moins'} » : on ${more ? 'multiplie' : 'divise'} par ${k}.`,
          ],
        ]),
        hint: `${k} fois ${more ? 'plus' : 'moins'} : ${more ? 'multiplie' : 'divise'}.`,
        steps: [`${base} ${more ? '×' : '÷'} ${k}.`, `= **${res}**.`],
        targetSeconds: 25,
      };
    },
  );

  const etapes = S(
    id('problemes-etapes'),
    'Problèmes en plusieurs étapes',
    'Résoudre des problèmes mixtes en deux ou trois étapes',
    ['Lis bien la question, puis cherche les **étapes** : ce qu’il faut calculer d’abord pour pouvoir répondre.'],
    (rng) => {
      const packs = rng.int(3, 9);
      const per = rng.int(4, 12);
      const eaten = rng.int(2, packs * per - 1);
      return {
        prompt: `On achète ${packs} paquets de ${per} gâteaux. On en mange ${eaten}. Combien en reste-t-il ?`,
        answer: num(packs * per - eaten),
        traps: traps(r(packs * per - eaten), [
          [packs + per - eaten, `Il y a ${packs} paquets de ${per} : c’est une multiplication.`],
          [packs * per, `N’oublie pas les ${eaten} gâteaux mangés.`],
        ]),
        hint: 'Étape 1 : combien de gâteaux en tout ? Étape 2 : enlève ceux mangés.',
        steps: [
          `En tout : ${packs} × ${per} = ${packs * per}.`,
          `Reste : ${packs * per} − ${eaten} = **${packs * per - eaten}**.`,
        ],
        targetSeconds: 40,
      };
    },
  );

  const denombrement = S(
    id('denombrement'),
    'Problèmes de dénombrement',
    'Résoudre des problèmes de dénombrement',
    ['3 pantalons et 4 t-shirts : pour chaque pantalon, 4 t-shirts possibles → 3 × 4 = 12 tenues.'],
    (rng) => {
      const a = rng.int(2, 5);
      const b = rng.int(2, 6);
      return {
        prompt: `${rng.pick(NAMES)} a ${a} pantalons et ${b} t-shirts. Combien de tenues différentes (un pantalon + un t-shirt) peut-il composer ?`,
        answer: num(a * b),
        traps: traps(r(a * b), [[a + b, 'Chaque pantalon va avec chaque t-shirt : on multiplie.']]),
        hint: 'Pour chaque pantalon, combien de t-shirts possibles ?',
        steps: [`Chaque pantalon peut aller avec ${b} t-shirts.`, `${a} × ${b} = **${a * b}** tenues.`],
        targetSeconds: 30,
      };
    },
  );

  const optimisation = S(
    id('optimisation'),
    'Problèmes d’optimisation',
    'Résoudre des problèmes d’optimisation',
    ['« Le moins possible de boîtes » : on remplit les boîtes au maximum, et une de plus s’il en reste.'],
    (rng) => {
      const cap = rng.int(6, 12);
      const n = rng.int(30, 120);
      const boxes = Math.ceil(n / cap);
      return {
        prompt: `On doit ranger ${n} livres dans des cartons de ${cap} livres au maximum. Combien de cartons faut-il au minimum ?`,
        answer: num(boxes),
        traps: traps(r(boxes), [
          [Math.floor(n / cap), n % cap ? `Il reste ${n % cap} livres : il faut un carton de plus.` : 'Compte bien.'],
        ]),
        hint: `Combien de cartons pleins ? Reste-t-il des livres ?`,
        steps: [
          `${n} = ${cap} × ${Math.floor(n / cap)} + ${n % cap}.`,
          n % cap
            ? `${Math.floor(n / cap)} cartons pleins + 1 pour le reste : **${boxes}**.`
            : `**${boxes}** cartons pleins.`,
        ],
        targetSeconds: 35,
      };
    },
  );

  const problemes = C(
    id('problemes'),
    'nombres',
    'Résoudre des problèmes',
    [additifs, multiplicatifs, etapes, denombrement, optimisation],
    bossOf(
      [
        S(
          id('boss-problemes-cinema'),
          'Problème : la séance de cinéma',
          'Résoudre des problèmes mixtes en deux ou trois étapes',
          ['Additionne les prix de chaque catégorie de billets.'],
          (rng) => {
            const ad = rng.int(1, 3);
            const ch = rng.int(1, 4);
            const pa = rng.int(8, 12);
            const pc = rng.int(4, 7);
            return {
              prompt: `Au cinéma : ${pa} € la place adulte, ${pc} € la place enfant. Une famille de ${ad} adulte${ad > 1 ? 's' : ''} et ${ch} enfant${ch > 1 ? 's' : ''} paie avec un billet de 50 €. Combien lui rend-on ?`,
              answer: num(50 - ad * pa - ch * pc, '€'),
              traps: traps(r(50 - ad * pa - ch * pc), [
                [ad * pa + ch * pc, 'Ça, c’est le prix payé. On demande la monnaie rendue.'],
              ]),
              hint: 'Calcule le prix total, puis enlève-le de 50 €.',
              steps: [
                `Total : ${ad} × ${pa} + ${ch} × ${pc} = ${ad * pa + ch * pc} €.`,
                `Monnaie : 50 − ${ad * pa + ch * pc} = **${50 - ad * pa - ch * pc} €**.`,
              ],
              targetSeconds: 60,
            };
          },
        ),
        S(
          id('boss-problemes-glaces'),
          'Problème : les glaces',
          'Résoudre des problèmes de dénombrement',
          ['2 boules de parfums différents parmi 4 parfums : on liste sans compter deux fois la même paire.'],
          (rng) => {
            const n = rng.int(3, 6);
            const pairs = (n * (n - 1)) / 2;
            return {
              prompt: `Un glacier propose ${n} parfums. Combien de cornets différents à 2 boules de parfums **différents** peut-on faire (l’ordre ne compte pas) ?`,
              answer: num(pairs),
              traps: traps(r(pairs), [
                [n * (n - 1), 'Fraise-vanille et vanille-fraise, c’est le même cornet.'],
                [n * n, 'Les deux parfums doivent être différents.'],
              ]),
              hint: 'Liste les paires : chaque parfum avec ceux qui viennent après lui.',
              steps: [`${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')}.`, `= **${pairs}** cornets.`],
              targetSeconds: 60,
            };
          },
        ),
      ],
      [
        S(
          id('boss-problemes-piege'),
          'Piège : « de plus » mais soustraction',
          'Résoudre des problèmes additifs en une étape des types « parties-tout » et « comparaison »',
          ['« Lina a 5 billes de plus que Tao » : c’est Tao qui en a **moins**.'],
          (rng) => {
            const t = rng.int(10, 40);
            const k = rng.int(3, 9);
            return {
              prompt: `Lina a ${t} billes. Elle en a ${k} de plus que Tao. Combien Tao a-t-il de billes ?`,
              answer: num(t - k),
              traps: traps(r(t - k), [[t + k, 'C’est Lina qui en a plus : Tao en a moins.']]),
              hint: 'Qui en a le plus ?',
              steps: [`Lina en a ${k} de plus, donc Tao en a ${k} de moins.`, `${t} − ${k} = **${t - k}**.`],
              targetSeconds: 25,
            };
          },
        ),
      ],
    ),
  );

  // ——— Algèbre ———

  const egaliteTrous = S(
    id('egalite-trous'),
    'Égalités à trous',
    'Trouver le nombre manquant dans une égalité à trous',
    ['Le signe = veut dire « vaut la même chose ». 178 − … = 6 × 8 : calcule 6 × 8 = 48, puis 178 − 48 = 130.'],
    (rng, level) => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      if (level === 3) {
        const x = rng.int(10, 90);
        const n = a * b + x;
        return {
          prompt: `Complète : ${n} − … = ${a} × ${b}`,
          answer: num(x),
          traps: traps(r(x), [[n - a * b + 2 * a * b, 'Calcule d’abord le côté droit.']]),
          hint: `Calcule ${a} × ${b}, puis cherche ce qu’il faut enlever à ${n}.`,
          steps: [`${a} × ${b} = ${a * b}.`, `${n} − ${a * b} = **${x}**.`],
          targetSeconds: 30,
        };
      }
      const c = rng.int(5, 50);
      return {
        prompt: `Complète : ${c} + … = ${c + a * b}`,
        answer: num(a * b),
        traps: traps(r(a * b), [[2 * c + a * b, 'On cherche ce qu’il faut **ajouter** : fais une soustraction.']]),
        hint: `Que faut-il ajouter à ${c} ? Calcule ${c + a * b} − ${c}.`,
        steps: [`${c + a * b} − ${c}.`, `= **${a * b}**.`],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

  const programmeCalcul = S(
    id('programme-calcul'),
    'Programme de calcul',
    cm2 ? 'Exécuter ou produire un programme de calcul' : 'Exécuter un programme de calcul',
    ['On fait les étapes **dans l’ordre** : choisir 5, ajouter 2 (7), multiplier par 4 (28).'],
    (rng, level) => {
      const x = rng.int(1, 15);
      const a = rng.int(1, 9);
      const b = rng.int(2, 6);
      const c = cm2 && level === 3 ? rng.int(1, 9) : 0;
      const res = (x + a) * b - c;
      return {
        prompt: `Programme : choisir ${x}, ajouter ${a}, multiplier le résultat par ${b}${c ? `, retirer ${c}` : ''}. Quel nombre obtient-on ?`,
        answer: num(res),
        traps: traps(r(res), [[x + a * b - c, `On multiplie **le résultat** (${x} + ${a}) par ${b}.`]]),
        hint: 'Fais les étapes une par une.',
        steps: [
          `${x} + ${a} = ${x + a} ; × ${b} = ${(x + a) * b}${c ? ` ; − ${c} = ${res}` : ''}.`,
          `On obtient **${res}**.`,
        ],
        targetSeconds: 30,
      };
    },
    { mental: true },
  );

  const suites = S(
    id('suites'),
    'Suites de nombres',
    'Identifier et formuler une règle de calcul pour poursuivre une suite de nombres',
    [
      'Cherche ce qui se passe d’un nombre au suivant : + 5 ? − 2 ? × 2 ? Parfois la règle alterne (+ 5, − 2, + 5, − 2…).',
    ],
    (rng, level) => {
      if (level === 3) {
        const up = rng.int(3, 7);
        const down = rng.int(1, up - 1);
        const s = [rng.int(10, 80)];
        for (let i = 1; i < 6; i++) s.push((s[i - 1] ?? 0) + (i % 2 ? up : -down));
        const next = (s[5] ?? 0) + up;
        return {
          prompt: `Trouve le nombre suivant : ${s.join(' ; ')} ; …`,
          answer: num(next),
          traps: traps(r(next), [[(s[5] ?? 0) - down, `La règle alterne : + ${up}, puis − ${down}.`]]),
          hint: 'Regarde les écarts : ils alternent.',
          steps: [`La règle alterne : + ${up}, − ${down}, + ${up}…`, `${s[5]} + ${up} = **${next}**.`],
          targetSeconds: 35,
        };
      }
      const double = level === 2 && rng.int(0, 1) === 1;
      const start = rng.int(1, 9);
      const step = rng.int(3, 12);
      const s = Array.from({ length: 5 }, (_, i) => (double ? start * 2 ** i : start + step * i));
      const next = double ? start * 32 : start + step * 5;
      return {
        prompt: `Trouve le nombre suivant : ${s.join(' ; ')} ; …`,
        answer: num(next),
        traps: traps(r(next), [
          [
            double ? (s[4] ?? 0) + (s[4] ?? 0) - (s[3] ?? 0) : next + step,
            double ? 'Chaque nombre est le double du précédent.' : `On ajoute ${step} à chaque fois.`,
          ],
        ]),
        hint: 'Comment passe-t-on d’un nombre au suivant ?',
        steps: [
          double ? 'Chaque nombre est le double du précédent.' : `On ajoute ${step} à chaque fois.`,
          `Le suivant est **${next}**.`,
        ],
        targetSeconds: 25,
      };
    },
    { mental: true },
  );

  const motifs = S(
    id('motifs'),
    'Suites de motifs',
    cm2
      ? 'Trouver le nombre d’éléments pour une étape donnée dans une suite de motifs évolutive'
      : 'Identifier des régularités et poursuivre une suite de motifs évolutive',
    ['Regarde combien d’éléments **s’ajoutent** à chaque étape.'],
    (rng, level) => {
      const step = rng.int(2, 4);
      const start = rng.int(1, 3);
      const count = (k: number) => start + step * (k - 1);
      const target = cm2 && level === 3 ? rng.int(10, 20) : 4;
      return {
        prompt: `Étape 1 : ${count(1)} carreaux ; étape 2 : ${count(2)} ; étape 3 : ${count(3)}. Combien de carreaux à l’étape ${target} ?`,
        figure: {
          kind: 'pattern',
          steps: [1, 2, 3].map((k) =>
            Array.from({ length: count(k) }, (_, i) => [i % 6, Math.floor(i / 6)] as [number, number]),
          ),
        },
        answer: num(count(target)),
        traps: traps(r(count(target)), [[step * target, `On part de ${start}, pas de 0.`]]),
        hint: `On ajoute ${step} carreaux à chaque étape.`,
        steps: [
          `De l’étape 1 à l’étape ${target} : ${target - 1} ajouts de ${step}.`,
          `${count(1)} + ${target - 1} × ${step} = **${count(target)}**.`,
        ],
        targetSeconds: 30,
      };
    },
  );

  const algebre = C(
    id('algebre'),
    'nombres',
    'Égalités, suites et programmes',
    [egaliteTrous, programmeCalcul, suites, motifs],
    bossOf(
      [
        S(
          id('boss-algebre-ciseaux'),
          'Problème : ciseaux et stylos',
          'Résoudre des problèmes algébriques',
          ['2 ciseaux et 3 stylos coûtent 20 € ; si un stylo coûte 2 €, les ciseaux coûtent (20 − 6) ÷ 2 = 7 €.'],
          (rng) => {
            const st = rng.int(1, 4);
            const ci = rng.int(3, 9);
            const total = 2 * ci + 3 * st;
            return {
              prompt: `2 paires de ciseaux et 3 stylos coûtent ${total} €. Un stylo coûte ${st} €. Combien coûte une paire de ciseaux ?`,
              answer: num(ci, '€'),
              traps: traps(r(ci), [[r(total - st, 2), `Il y a 3 stylos : enlève ${3 * st} €.`]]),
              hint: 'Enlève d’abord le prix des 3 stylos.',
              steps: [
                `Stylos : 3 × ${st} = ${3 * st} €. Reste ${total - 3 * st} € pour 2 ciseaux.`,
                `${total - 3 * st} ÷ 2 = **${ci} €**.`,
              ],
              targetSeconds: 50,
            };
          },
        ),
        S(
          id('boss-algebre-tshirts'),
          'Problème : la commande',
          'Exécuter un programme de calcul',
          ['Prix = nombre de t-shirts × 12 + 5 de livraison.'],
          (rng) => {
            const n = rng.int(2, 9);
            const p = rng.int(8, 15);
            const ship = rng.int(3, 8);
            return {
              prompt: `Des t-shirts coûtent ${p} € chacun, plus ${ship} € de livraison pour toute la commande. Combien paie-t-on pour ${n} t-shirts ?`,
              answer: num(n * p + ship, '€'),
              traps: traps(r(n * p + ship), [[n * (p + ship), 'La livraison se paie une seule fois.']]),
              hint: `(${n} × ${p}) + ${ship}.`,
              steps: [`${n} × ${p} = ${n * p}.`, `${n * p} + ${ship} = **${n * p + ship} €**.`],
              targetSeconds: 40,
            };
          },
        ),
      ],
      [
        S(
          id('boss-algebre-piege'),
          'Piège : le signe égal',
          'Trouver le nombre manquant dans une égalité à trous',
          ['5 + 3 = … + 6 : il faut 2 (et pas 8), car les deux côtés doivent valoir 8.'],
          (rng) => {
            const a = rng.int(4, 12);
            const b = rng.int(2, 9);
            const c = rng.int(1, a + b - 1);
            return {
              prompt: `Complète : ${a} + ${b} = … + ${c}`,
              answer: num(a + b - c),
              traps: traps(r(a + b - c), [
                [a + b, 'Le côté droit doit valoir la même chose que le côté gauche, avec le + ' + String(c) + '.'],
              ]),
              hint: 'Les deux côtés valent la même chose.',
              steps: [`${a} + ${b} = ${a + b}.`, `… + ${c} = ${a + b}, donc **${a + b - c}**.`],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  // ——— Grandeurs : longueurs, masses, contenances ———

  const LEN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];
  const MASS = ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'];
  const CAP = ['hL', 'daL', 'L', 'dL', 'cL', 'mL'];
  const convert = (x: Rational, from: number, to: number) =>
    to >= from ? mul(x, r(10 ** (to - from))) : mul(x, r(1, 10 ** (from - to)));

  const conversion = (
    key: string,
    title: string,
    objective: string,
    units: string[],
    table: 'longueur' | 'masse' | 'volume',
    memo: string,
  ) =>
    S(
      id(key),
      title,
      objective,
      [memo, 'D’une unité à la suivante, on multiplie ou on divise par **10**.'],
      (rng, level) => {
        const from = rng.int(0, units.length - 1);
        let to = rng.int(
          Math.max(0, from - (level === 1 ? 1 : 3)),
          Math.min(units.length - 1, from + (level === 1 ? 1 : 3)),
        );
        if (to === from) to = from < units.length - 1 ? from + 1 : from - 1;
        const x = level === 3 ? exactDecimal(rng, 1, 99, 1) : r(rng.int(2, 99));
        const res = convert(x, from, to);
        const uf = units[from] ?? '';
        const ut = units[to] ?? '';
        return {
          prompt: `Complète : ${fmt(x)} ${uf} = … ${ut}`,
          answer: num(res, ut),
          traps: traps(res, [
            [
              convert(x, to, from),
              `${ut} est une unité plus ${to > from ? 'petite' : 'grande'} : le nombre doit devenir plus ${to > from ? 'grand' : 'petit'}.`,
            ],
          ]),
          hint: `Place le chiffre des unités de ${fmt(x)} sous ${uf} dans le tableau, puis lis jusqu’à ${ut}.`,
          demo: { kind: 'conversion', table, value: x, from: uf, to: ut },
          steps: [
            `De ${uf} à ${ut} : ${Math.abs(to - from)} rang${Math.abs(to - from) > 1 ? 's' : ''}, on ${to > from ? 'multiplie' : 'divise'} par ${big(10 ** Math.abs(to - from))}.`,
            `${fmt(x)} ${uf} = **${fmt(res)} ${ut}**.`,
          ],
          targetSeconds: 25,
        };
      },
      {
        tools: [
          table === 'longueur' ? 'conversion-longueur' : table === 'masse' ? 'conversion-masse' : 'conversion-volume',
        ],
      },
    );

  const longueurs = conversion(
    'conversions-longueur',
    'Convertir des longueurs',
    'Connaître les relations entre les unités de longueur',
    LEN,
    'longueur',
    '1 km = 1 000 m ; 1 m = 100 cm ; 1 cm = 10 mm.',
  );
  const masses = conversion(
    'conversions-masse',
    'Convertir des masses',
    'Connaître les relations entre les unités de masse',
    MASS,
    'masse',
    '1 kg = 1 000 g ; 1 g = 1 000 mg. (Et 1 tonne = 1 000 kg.)',
  );
  const contenances = conversion(
    'conversions-contenance',
    'Convertir des contenances',
    'Connaître les relations entre les unités de contenance',
    CAP,
    'volume',
    '1 L = 10 dL = 100 cL = 1 000 mL ; 1 hL = 100 L.',
  );

  const uniteAdaptee = S(
    id('unite-adaptee'),
    'Choisir l’unité adaptée',
    'Choisir une unité adaptée pour exprimer une longueur',
    [
      'Une fourmi : quelques mm. Une porte : environ 2 m. Une ville à l’autre : des km. Un œuf : environ 60 g. Une voiture : environ 1 tonne.',
    ],
    (rng) => {
      const q = rng.pick([
        { p: 'la longueur d’une fourmi', a: 'mm', w: ['m', 'km'] },
        { p: 'la distance entre deux villes', a: 'km', w: ['m', 'cm'] },
        { p: 'la hauteur d’une porte', a: 'm', w: ['km', 'mm'] },
        { p: 'la masse d’un œuf', a: 'g', w: ['kg', 't'] },
        { p: 'la masse d’un camion', a: 't', w: ['g', 'kg'] },
        { p: 'la contenance d’une cuillère', a: 'mL', w: ['L', 'hL'] },
        { p: 'la contenance d’une baignoire', a: 'L', w: ['mL', 'cL'] },
      ]);
      return {
        prompt: `Quelle unité choisir pour mesurer ${q.p} ?`,
        ...choice(
          rng,
          q.a,
          q.w.map((w) => ({ label: w, why: 'Imagine la mesure : le nombre serait-il raisonnable ?' })),
        ),
        hint: 'Imagine l’objet : est-il tout petit, moyen, ou très grand ?',
        steps: [`Pour ${q.p}, un nombre raisonnable s’écrit en ${q.a}.`, `L’unité adaptée est **${q.a}**.`],
        targetSeconds: 15,
      };
    },
  );

  const mesures = C(
    id('mesures'),
    'grandeurs',
    'Longueurs, masses, contenances',
    [longueurs, masses, contenances, uniteAdaptee],
    bossOf(
      [
        S(
          id('boss-mesures-randonnee'),
          'Problème : la randonnée',
          'Connaître les relations entre les unités de longueur',
          ['Pour additionner des longueurs, mets-les dans la même unité : 2 km 300 m = 2 300 m.'],
          (rng) => {
            const a = rng.int(1, 5);
            const b = rng.int(100, 900);
            return {
              prompt: `Le matin, on marche ${a} km ; l’après-midi, ${b} m. Combien de mètres en tout ?`,
              answer: num(a * 1000 + b, 'm'),
              traps: traps(r(a * 1000 + b), [[a + b, `${a} km = ${a * 1000} m : convertis d’abord.`]]),
              hint: '1 km = 1 000 m.',
              steps: [`${a} km = ${big(a * 1000)} m.`, `${big(a * 1000)} + ${b} = **${big(a * 1000 + b)} m**.`],
              targetSeconds: 40,
            };
          },
          { tools: ['conversion-longueur'] },
        ),
        S(
          id('boss-mesures-confiture'),
          'Problème : la confiture',
          'Connaître les relations entre les unités de masse',
          ['1 kg = 1 000 g : 3 pots de 250 g font 750 g.'],
          (rng) => {
            const pot = rng.pick([125, 250, 500]);
            const n = rng.int(2, 8);
            return {
              prompt: `On remplit ${n} pots de ${pot} g de confiture. Combien de grammes de confiture faut-il ?`,
              answer: num(n * pot, 'g'),
              traps: traps(r(n * pot), [[n + pot, 'C’est une multiplication.']]),
              hint: `${n} fois ${pot} g.`,
              steps: [`${n} × ${pot}.`, `= **${big(n * pot)} g**.`],
              targetSeconds: 30,
            };
          },
        ),
      ],
      [
        S(
          id('boss-mesures-piege'),
          'Piège : 1 L = 100 cL',
          'Connaître les relations entre les unités de contenance',
          ['1 L = 100 cL (et pas 10) : une canette de 33 cL fait 0,33 L.'],
          (rng) => {
            const cl = rng.int(15, 95);
            return {
              prompt: `Une bouteille contient ${cl} cL. Combien de litres ?`,
              answer: num(r(cl, 100), 'L'),
              traps: traps(r(cl, 100), [[r(cl, 10), '1 L = 100 cL, pas 10.']]),
              hint: '1 L = 100 cL.',
              demo: { kind: 'conversion', table: 'volume', value: r(cl), from: 'cL', to: 'L' },
              steps: [`${cl} cL = ${cl} ÷ 100 L.`, `= **${fmt(r(cl, 100))} L**.`],
              targetSeconds: 20,
            };
          },
          { tools: ['conversion-volume'] },
        ),
      ],
    ),
  );

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

  // ——— Durées ———

  const convertirDurees = S(
    id('durees'),
    'Heures, minutes' + (cm2 ? ', secondes' : ''),
    cm2
      ? 'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge (instants et durées sont exprimés en heure, minute et seconde)'
      : 'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge (instants et durées sont exprimés en heure et minute)',
    ['1 h = 60 min' + (cm2 ? ' ; 1 min = 60 s.' : '.'), 'Une demi-heure = 30 min ; un quart d’heure = 15 min.'],
    (rng, level) => {
      if (level === 1) {
        const q = rng.pick([
          { p: 'une demi-heure', a: 30 },
          { p: 'un quart d’heure', a: 15 },
          { p: 'trois quarts d’heure', a: 45 },
          { p: '2 heures', a: 120 },
          { p: '1 h 30', a: 90 },
        ]);
        return {
          prompt: `Combien de minutes dans ${q.p} ?`,
          answer: num(q.a, 'min'),
          traps: traps(r(q.a), [[q.a === 30 ? 50 : q.a === 90 ? 130 : q.a + 10, '1 h = 60 min.']]),
          hint: '1 heure = 60 minutes.',
          steps: ['1 h = 60 min.', `${q.p} = **${q.a} min**.`],
          targetSeconds: 12,
        };
      }
      if (cm2 && level === 3) {
        const m = rng.int(2, 9);
        const s = rng.int(5, 55);
        return {
          prompt: `Combien de secondes dans ${m} min ${s} s ?`,
          answer: num(m * 60 + s, 's'),
          traps: traps(r(m * 60 + s), [[m * 100 + s, '1 min = 60 s, pas 100.']]),
          hint: '1 min = 60 s.',
          steps: [`${m} min = ${m * 60} s.`, `${m * 60} + ${s} = **${m * 60 + s} s**.`],
          targetSeconds: 25,
        };
      }
      const start = rng.int(8 * 12, 17 * 12) * 5;
      const dur = rng.int(3, 20) * 5;
      return {
        prompt: `Un film commence à ${hm(start)} et finit à ${hm(start + dur)}. Combien de minutes dure-t-il ?`,
        answer: num(dur, 'min'),
        traps: traps(r(dur), [
          [
            Math.floor((start + dur) / 60) * 100 + ((start + dur) % 60) - (Math.floor(start / 60) * 100 + (start % 60)),
            'Une heure, c’est 60 min : passe par l’heure ronde.',
          ],
        ]),
        hint: 'Compte jusqu’à l’heure ronde, puis le reste.',
        steps: [`De ${hm(start)} à ${hm(start + dur)}.`, `Le film dure **${dur} min**.`],
        targetSeconds: 30,
      };
    },
    { mental: true },
  );

  const horaire = S(
    id('horaire'),
    'Calculer une heure d’arrivée',
    cm2
      ? 'Résoudre des problèmes à une ou plusieurs étapes impliquant des durées'
      : 'Résoudre des problèmes à une ou deux étapes impliquant des durées',
    ['Heure d’arrivée = heure de départ + durée. 9 h 45 + 30 min : 9 h 45 + 15 min = 10 h, + 15 min = 10 h 15.'],
    (rng) => {
      const start = rng.int(8 * 12, 18 * 12) * 5;
      const dur = rng.int(2, 18) * 5;
      const end = start + dur;
      const h = Math.floor(end / 60);
      const m = String(end % 60).padStart(2, '0');
      return {
        prompt: `Le bus part à ${hm(start)}. Le trajet dure ${dur} min. À quelle heure arrive-t-il ? (écris par exemple 10 h 05)`,
        answer: {
          kind: 'text',
          accepted: [`${h} h ${m}`, `${h}h${m}`, `${h} h${m}`, `${h}h ${m}`, `${h}:${m}`, `${h} h ${m} min`],
        },
        traps: [],
        hint: `Ajoute d’abord ce qu’il faut pour arriver à l’heure ronde après ${hm(start)}.`,
        steps: [`${hm(start)} + ${dur} min.`, `Il arrive à **${h} h ${m}**.`],
        targetSeconds: 35,
      };
    },
  );

  const durees = C(
    id('durees'),
    'grandeurs',
    'Heures et durées',
    [convertirDurees, horaire],
    bossOf(
      [
        S(
          id('boss-durees-recette'),
          'Problème : la recette',
          'Résoudre des problèmes à une ou deux étapes impliquant des durées',
          ['Additionne les durées, puis convertis : 75 min = 1 h 15.'],
          (rng) => {
            const a = rng.int(2, 6) * 5;
            const b = rng.int(6, 12) * 5;
            return {
              prompt: `Une recette demande ${a} min de préparation et ${b} min de cuisson. Combien de minutes en tout ?`,
              answer: num(a + b, 'min'),
              traps: traps(r(a + b), [[b - a, 'On additionne les deux durées.']]),
              hint: 'Additionne les deux durées.',
              steps: [`${a} + ${b}.`, `= **${a + b} min**${a + b >= 60 ? ` (${hm(a + b)})` : ''}.`],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-durees-ecole'),
          'Problème : la journée d’école',
          'Résoudre des problèmes à une ou deux étapes impliquant des durées',
          ['Matin + après-midi : on additionne les durées de chaque partie.'],
          (rng) => {
            const morning = rng.pick([180, 165, 195]);
            const afternoon = rng.pick([150, 165, 180]);
            return {
              prompt: `Le matin dure ${hm(morning)} et l’après-midi ${hm(afternoon)}. Combien de minutes de classe par jour ?`,
              answer: num(morning + afternoon, 'min'),
              traps: traps(r(morning + afternoon), [
                [morning + afternoon - 60, 'Convertis bien chaque durée en minutes.'],
              ]),
              hint: 'Convertis chaque durée en minutes, puis additionne.',
              steps: [
                `${hm(morning)} = ${morning} min ; ${hm(afternoon)} = ${afternoon} min.`,
                `= **${morning + afternoon} min**.`,
              ],
              targetSeconds: 45,
            };
          },
        ),
      ],
      [
        S(
          id('boss-durees-piege'),
          'Piège : 1 h 50 ou 1 h 30 ?',
          'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge',
          ['1,5 h = 1 h 30 (une demi-heure = 30 min), pas 1 h 50.'],
          (rng) => {
            const h = rng.int(1, 3);
            return {
              prompt: `Combien de minutes dans ${h} heure${h > 1 ? 's' : ''} et demie ?`,
              answer: num(h * 60 + 30, 'min'),
              traps: traps(r(h * 60 + 30), [[h * 60 + 50, 'Une demi-heure = 30 min.']]),
              hint: 'Une demi-heure, c’est la moitié de 60 min.',
              steps: [`${h} h = ${h * 60} min, une demi-heure = 30 min.`, `= **${h * 60 + 30} min**.`],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

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

  // ——— Angles ———

  const anglesSkills: Skill[] = [
    S(
      id('angles'),
      'Comparer des angles',
      'Comparer des angles',
      ['Un angle **aigu** est plus petit qu’un angle droit ; un angle **obtus** est plus grand.'],
      (rng) => {
        const q = rng.pick([
          { p: 'Un angle plus petit qu’un angle droit est…', a: 'aigu', w: ['obtus', 'plat'] },
          { p: 'Un angle plus grand qu’un angle droit (mais pas plat) est…', a: 'obtus', w: ['aigu', 'droit'] },
          { p: 'L’angle formé par les deux aiguilles à 3 h est…', a: 'droit', w: ['aigu', 'obtus'] },
          { p: 'L’angle formé par les aiguilles à 1 h est…', a: 'aigu', w: ['droit', 'obtus'] },
          { p: 'L’angle formé par les aiguilles à 5 h est…', a: 'obtus', w: ['aigu', 'droit'] },
        ]);
        return {
          prompt: q.p,
          ...choice(
            rng,
            q.a,
            q.w.map((w) => ({ label: w, why: 'Compare avec un angle droit (le coin d’une feuille).' })),
          ),
          hint: 'Compare avec le coin d’une feuille (angle droit).',
          steps: ['On compare avec un angle droit.', `C’est un angle **${q.a}**.`],
          targetSeconds: 15,
        };
      },
    ),
  ];
  if (cm2) {
    anglesSkills.push(
      S(
        id('mesure-angles'),
        'Angle droit et degrés',
        'Savoir qu’un angle droit mesure 90°',
        ['Un angle droit mesure **90°**. Sa moitié (par pliage) mesure 45°. Deux angles droits font 180°.'],
        (rng) => {
          const q = rng.pick([
            { p: 'Combien de degrés mesure un angle droit ?', a: 90, w: 100 },
            { p: 'On plie un angle droit en deux. Combien mesure chaque moitié ?', a: 45, w: 90 },
            { p: 'Combien de degrés font deux angles droits côte à côte ?', a: 180, w: 90 },
            { p: 'Combien de degrés font trois angles de 30° mis côte à côte ?', a: 90, w: 60 },
          ]);
          return {
            prompt: q.p,
            answer: num(q.a, '°'),
            traps: traps(r(q.a), [[q.w, 'Un angle droit mesure 90°.']]),
            hint: 'Rappelle-toi la mesure d’un angle droit en degrés.',
            steps: ['Un angle droit mesure 90°.', `Réponse : **${q.a}°**.`],
            targetSeconds: 15,
          };
        },
      ),
    );
  }
  const angles = C(
    id('angles'),
    'geometrie',
    'Les angles',
    anglesSkills,
    bossOf(
      [
        S(
          id('boss-angles-horloge'),
          'Problème : l’horloge',
          'Utiliser le lexique spécifique associé aux angles',
          ['À 3 h et à 9 h, les aiguilles forment un angle droit ; à 6 h, un angle plat.'],
          (rng) => {
            const q = rng.pick([
              { h: 3, a: 'droit' },
              { h: 9, a: 'droit' },
              { h: 6, a: 'plat' },
              { h: 2, a: 'aigu' },
              { h: 4, a: 'obtus' },
            ]);
            return {
              prompt: `À ${q.h} h pile, quel angle forment les aiguilles de l’horloge ?`,
              ...choice(
                rng,
                q.a,
                ['droit', 'plat', 'aigu', 'obtus']
                  .filter((x) => x !== q.a)
                  .map((x) => ({ label: x, why: 'Imagine les aiguilles : 3 h = angle droit, 6 h = angle plat.' })),
              ),
              hint: 'À 3 h, les aiguilles forment un angle droit.',
              steps: ['On imagine la position des aiguilles.', `L’angle est **${q.a}**.`],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-angles-equerre'),
          'Problème : l’équerre',
          'Comparer des angles',
          ['L’équerre sert à vérifier un angle droit.'],
          (rng) => ({
            prompt: 'Quel instrument utilise-t-on pour vérifier qu’un angle est droit ?',
            ...choice(rng, 'L’équerre', [
              { label: 'Le compas', why: 'Le compas trace des cercles.' },
              { label: 'La règle', why: 'La règle trace et mesure des segments.' },
            ]),
            hint: 'Il a lui-même un angle droit.',
            steps: ['L’équerre possède un angle droit.', 'On utilise **l’équerre**.'],
            targetSeconds: 15,
          }),
        ),
      ],
      [
        S(
          id('boss-angles-piege'),
          'Piège : la longueur des côtés',
          'Comparer des angles',
          ['La taille d’un angle ne dépend **pas** de la longueur de ses côtés : seulement de son ouverture.'],
          (rng) => ({
            prompt: 'Si on allonge les côtés d’un angle, l’angle devient-il plus grand ?',
            ...choice(
              rng,
              'Non',
              [{ label: 'Oui', why: 'L’ouverture ne change pas quand on allonge les côtés.' }],
              true,
            ),
            hint: 'Un angle, c’est une ouverture.',
            steps: ['La mesure d’un angle dépend de son ouverture, pas de la longueur des côtés.', '**Non**.'],
            targetSeconds: 15,
          }),
        ),
      ],
    ),
  );

  // ——— Données ———

  const lireDonnees = S(
    id('lire-donnees'),
    'Lire un tableau, un diagramme',
    'Lire et interpréter les données d’un tableau à simple ou double entrée, d’un diagramme en barres ou d’une courbe',
    ['Dans un diagramme en barres, la **hauteur** de la barre donne le nombre.'],
    (rng, level) => {
      const labels = distinct(rng, 4, () => rng.pick(['Vélo', 'Bus', 'À pied', 'Voiture', 'Trottinette', 'Train']));
      const values = labels.map(() => rng.int(2, 12));
      const figure: Figure = {
        kind: 'bars',
        title: 'Comment viens-tu à l’école ?',
        bars: labels.map((label, i) => ({ label, value: values[i] ?? 0 })),
        unit: 'élèves',
      };
      if (level === 1) {
        const i = rng.int(0, 3);
        return {
          prompt: `Combien d’élèves viennent « ${labels[i]} » ?`,
          figure,
          answer: num(values[i] ?? 0),
          traps: [],
          hint: 'Lis la hauteur de la barre.',
          steps: ['On lit la hauteur de la barre.', `**${values[i]}** élèves.`],
          targetSeconds: 15,
        };
      }
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
    },
  );

  const problemeDonnees = S(
    id('probleme-donnees'),
    'Résoudre un problème avec un tableau',
    cm2
      ? 'Résoudre des problèmes en une ou deux étapes en utilisant les données d’un tableau, d’un diagramme en barres, d’un diagramme circulaire ou d’une courbe'
      : 'Résoudre des problèmes en une ou plusieurs étapes en utilisant les données d’un tableau à simple ou double entrée, d’un diagramme en barres ou d’une courbe',
    ['Repère les cases utiles du tableau, puis calcule.'],
    (rng) => {
      const items = ['Pomme', 'Banane', 'Poire', 'Kiwi'];
      const prices = items.map(() => rng.int(1, 4));
      const i = rng.int(0, 3);
      const n = rng.int(2, 6);
      return {
        prompt: `Combien coûtent ${n} ${items[i]?.toLowerCase()}s ?`,
        figure: {
          kind: 'table',
          header: true,
          rows: [
            ['Fruit', ...items],
            ['Prix (€)', ...prices.map(String)],
          ],
        },
        answer: num(n * (prices[i] ?? 0), '€'),
        traps: traps(r(n * (prices[i] ?? 0)), [[n + (prices[i] ?? 0), 'C’est une multiplication.']]),
        hint: 'Lis le prix d’un fruit, puis multiplie.',
        steps: [
          `Une ${items[i]?.toLowerCase()} coûte ${prices[i]} €.`,
          `${n} × ${prices[i]} = **${n * (prices[i] ?? 0)} €**.`,
        ],
        targetSeconds: 30,
      };
    },
  );

  const donnees = C(
    id('donnees'),
    'donnees',
    'Tableaux et diagrammes',
    [lireDonnees, problemeDonnees],
    bossOf(
      [
        S(
          id('boss-donnees-meteo'),
          'Problème : la météo',
          'Lire et interpréter les données d’un tableau',
          ['Cherche la plus grande (ou la plus petite) valeur du tableau.'],
          (rng) => {
            const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
            const t = distinct(rng, 5, () => rng.int(5, 25));
            const min = Math.min(...t);
            const day = days[t.indexOf(min)] ?? '';
            return {
              prompt: 'Quel jour a-t-il fait le plus froid ?',
              figure: {
                kind: 'table',
                header: true,
                rows: [
                  ['Jour', ...days],
                  ['Température (°C)', ...t.map(String)],
                ],
              },
              ...choice(
                rng,
                day,
                days
                  .filter((d) => d !== day)
                  .slice(0, 3)
                  .map((d) => ({ label: d, why: 'Le plus froid : la plus petite température.' })),
              ),
              hint: 'Cherche la plus petite température.',
              steps: [`La plus petite température est ${min} °C.`, `C’est **${day}**.`],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-donnees-ecart'),
          'Problème : l’écart',
          'Résoudre des problèmes en une ou plusieurs étapes en utilisant les données d’un tableau',
          ['L’écart entre deux valeurs : la plus grande moins la plus petite.'],
          (rng) => {
            const labels = distinct(rng, 3, () => rng.pick(['Foot', 'Danse', 'Judo', 'Tennis', 'Basket']));
            const values = labels.map(() => rng.int(3, 20));
            const max = Math.max(...values);
            const min = Math.min(...values);
            return {
              prompt: 'Combien d’élèves de plus dans le sport le plus pratiqué que dans le moins pratiqué ?',
              figure: {
                kind: 'bars',
                title: 'Sports pratiqués',
                bars: labels.map((label, i) => ({ label, value: values[i] ?? 0 })),
                unit: 'élèves',
              },
              answer: num(max - min),
              traps: traps(r(max - min), [[max + min, 'On cherche l’écart : une soustraction.']]),
              hint: 'Plus haute barre − plus basse barre.',
              steps: [`Plus haute : ${max} ; plus basse : ${min}.`, `${max} − ${min} = **${max - min}**.`],
              targetSeconds: 35,
            };
          },
        ),
      ],
      [
        S(
          id('boss-donnees-piege'),
          'Piège : lire la bonne barre',
          'Lire et interpréter les données d’un diagramme en barres',
          ['Vérifie l’étiquette sous la barre avant de lire sa hauteur.'],
          (rng) => {
            const a = rng.int(4, 12);
            const b = rng.int(4, 12) + 1;
            return {
              prompt: `Le diagramme montre ${a} chats et ${b === a ? b + 1 : b} chiens. Combien de chats ?`,
              answer: num(a),
              traps: traps(r(a), [[b === a ? b + 1 : b, 'Ça, c’est le nombre de chiens.']]),
              hint: 'Lis bien la question : on veut les chats.',
              steps: ['On repère la barre des chats.', `**${a}** chats.`],
              targetSeconds: 15,
            };
          },
        ),
      ],
    ),
  );

  // ——— Probabilités ———

  const issues = S(
    id('issues'),
    'Les issues possibles',
    'Identifier toutes les issues possibles lors d’une expérience aléatoire simple',
    ['Un dé à 6 faces : 6 issues possibles (1, 2, 3, 4, 5, 6). Une pièce : 2 issues (pile, face).'],
    (rng) => {
      const q = rng.pick([
        { p: 'Combien d’issues possibles quand on lance un dé à 6 faces ?', a: 6, w: 1 },
        { p: 'Combien d’issues possibles quand on lance une pièce ?', a: 2, w: 1 },
        {
          p: 'On tire une carte parmi les 4 couleurs (cœur, carreau, trèfle, pique). Combien d’issues pour la couleur ?',
          a: 4,
          w: 2,
        },
        { p: 'Une roue a 8 secteurs numérotés de 1 à 8. Combien d’issues possibles ?', a: 8, w: 4 },
      ]);
      return {
        prompt: q.p,
        answer: num(q.a),
        traps: traps(r(q.a), [[q.w, 'Compte tous les résultats possibles.']]),
        hint: 'Liste tous les résultats possibles.',
        steps: ['On liste tous les résultats possibles.', `Il y en a **${q.a}**.`],
        targetSeconds: 15,
      };
    },
  );

  const chances = S(
    id('chances'),
    cm2 ? 'a chances sur b' : 'Certain, possible, impossible',
    cm2
      ? 'Dans une situation d’équiprobabilité, lors d’une expérience aléatoire simple, exprimer la probabilité d’un évènement sous la forme « a chances sur b »'
      : 'Comparer des issues d’expériences aléatoires ou des évènements selon leur probabilité de réalisation',
    [
      cm2
        ? 'Obtenir un nombre pair avec un dé : 3 chances sur 6 (2, 4 ou 6).'
        : '« Obtenir 7 avec un dé » est **impossible**. « Obtenir un nombre de 1 à 6 » est **certain**.',
      'Ce n’est pas parce qu’il y a deux issues qu’elles ont chacune une chance sur deux !',
    ],
    (rng) => {
      if (cm2) {
        const q = rng.pick([
          { p: 'un nombre pair avec un dé à 6 faces', a: 3, b: 6 },
          { p: 'un 6 avec un dé à 6 faces', a: 1, b: 6 },
          { p: 'un nombre plus grand que 4 avec un dé à 6 faces', a: 2, b: 6 },
          { p: 'une boule rouge dans un sac de 3 rouges et 5 bleues', a: 3, b: 8 },
        ]);
        return {
          prompt: `Combien de chances sur ${q.b} d’obtenir ${q.p} ?`,
          answer: num(q.a),
          traps: traps(r(q.a), [[q.b - q.a, 'Compte les issues **favorables**.']]),
          hint: 'Compte les issues qui conviennent.',
          steps: [`Issues favorables : ${q.a} sur ${q.b}.`, `**${q.a}** chances sur ${q.b}.`],
          targetSeconds: 20,
        };
      }
      const q = rng.pick([
        { p: 'obtenir 7 en lançant un dé à 6 faces', a: 'Impossible' },
        { p: 'obtenir un nombre entre 1 et 6 en lançant un dé à 6 faces', a: 'Certain' },
        { p: 'obtenir 3 en lançant un dé à 6 faces', a: 'Possible' },
        { p: 'tirer une boule bleue d’un sac qui ne contient que des boules rouges', a: 'Impossible' },
      ]);
      return {
        prompt: `Cet évènement est-il certain, possible ou impossible : ${q.p} ?`,
        ...choice(
          rng,
          q.a,
          ['Certain', 'Possible', 'Impossible']
            .filter((x) => x !== q.a)
            .map((x) => ({ label: x, why: 'Certain : ça arrive à coup sûr ; impossible : jamais.' })),
          true,
        ),
        hint: 'Est-ce que ça peut arriver ? À coup sûr ?',
        steps: [`${q.p.charAt(0).toUpperCase() + q.p.slice(1)}.`, `C’est **${q.a.toLowerCase()}**.`],
        targetSeconds: 15,
      };
    },
  );

  const comparerChances = S(
    id('comparer-chances'),
    'Comparer des chances',
    cm2
      ? 'Comparer des probabilités dans des cas simples'
      : 'Comprendre que ce n’est pas parce qu’il y a deux issues possibles que chacune a une chance sur deux de se réaliser',
    ['Plus il y a de boules d’une couleur, plus on a de chances de la tirer.'],
    (rng) => {
      const red = rng.int(1, 9);
      let blue = rng.int(1, 9);
      if (blue === red) blue++;
      const best = red > blue ? 'Rouge' : 'Bleue';
      return {
        prompt: `Un sac contient ${red} boules rouges et ${blue} boules bleues. Quelle couleur a le plus de chances d’être tirée ?`,
        ...choice(rng, best, [
          {
            label: best === 'Rouge' ? 'Bleue' : 'Rouge',
            why: 'La couleur qui a le plus de boules a le plus de chances.',
          },
          { label: 'Autant de chances', why: 'Il n’y a pas le même nombre de boules de chaque couleur.' },
        ]),
        hint: 'Quelle couleur a le plus de boules ?',
        steps: [`${red} rouges contre ${blue} bleues.`, `**${best}**.`],
        targetSeconds: 15,
      };
    },
  );

  const probabilites = C(
    id('probabilites'),
    'donnees',
    'Le hasard et les chances',
    [issues, chances, comparerChances],
    bossOf(
      [
        S(
          id('boss-probas-roue'),
          'Problème : la roue de la kermesse',
          'Comparer des issues d’expériences aléatoires ou des évènements selon leur probabilité de réalisation',
          ['Une roue de 10 secteurs égaux dont 3 gagnants : 3 chances sur 10.'],
          (rng) => {
            const n = rng.pick([6, 8, 10]);
            const win = rng.int(1, n - 1);
            return {
              prompt: `Une roue a ${n} secteurs égaux, dont ${win} gagnant${win > 1 ? 's' : ''}. Combien de chances sur ${n} de gagner ?`,
              answer: num(win),
              traps: traps(r(win), [[n - win, 'Ça, ce sont les chances de **perdre**.']]),
              hint: 'Compte les secteurs gagnants.',
              steps: [
                `${win} secteur${win > 1 ? 's' : ''} gagnant${win > 1 ? 's' : ''} sur ${n}.`,
                `**${win}** chances sur ${n}.`,
              ],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-probas-billes'),
          'Problème : quel sac ?',
          'Comparer des issues d’expériences aléatoires ou des évènements selon leur probabilité de réalisation',
          ['Pour comparer deux sacs, regarde la part de boules gagnantes.'],
          (rng) => {
            const a = rng.int(1, 3);
            return {
              prompt: `Sac A : ${a} boule${a > 1 ? 's' : ''} rouge${a > 1 ? 's' : ''} et ${a * 3} noires. Sac B : ${a} boule${a > 1 ? 's' : ''} rouge${a > 1 ? 's' : ''} et ${a} noire${a > 1 ? 's' : ''}. On gagne en tirant une rouge. Quel sac choisir ?`,
              ...choice(rng, 'Le sac B', [
                { label: 'Le sac A', why: 'Le sac A a beaucoup plus de boules noires.' },
                { label: 'C’est pareil', why: 'Même nombre de rouges, mais pas le même nombre de noires.' },
              ]),
              hint: 'Dans quel sac les rouges sont-elles le moins « noyées » ?',
              steps: [
                `Sac A : ${a} chance${a > 1 ? 's' : ''} sur ${4 * a}. Sac B : ${a} sur ${2 * a}.`,
                'On choisit **le sac B**.',
              ],
              targetSeconds: 40,
            };
          },
        ),
      ],
      [
        S(
          id('boss-probas-piege'),
          'Piège : deux issues, une chance sur deux ?',
          'Comprendre que ce n’est pas parce qu’il y a deux issues possibles que chacune a une chance sur deux de se réaliser',
          ['Gagner ou perdre au loto : deux issues, mais pas du tout une chance sur deux !'],
          (rng) => ({
            prompt:
              'Une roue a 1 secteur gagnant et 9 perdants (tous égaux). Il y a deux issues : gagner ou perdre. A-t-on une chance sur deux de gagner ?',
            ...choice(rng, 'Non', [{ label: 'Oui', why: '1 secteur sur 10 seulement est gagnant.' }], true),
            hint: 'Compte les secteurs.',
            steps: ['1 secteur gagnant sur 10.', '**Non** : 1 chance sur 10.'],
            targetSeconds: 20,
          }),
        ),
      ],
    ),
  );

  // ——— Proportionnalité ———

  const identifier = S(
    id('propor-identifier'),
    'Est-ce proportionnel ?',
    'Identifier une situation de proportionnalité',
    ['Deux grandeurs sont proportionnelles si « 2 fois plus de l’une » donne toujours « 2 fois plus de l’autre ».'],
    (rng) => {
      const q = rng.pick([
        { s: 'le prix payé et le nombre de baguettes (même prix pour chaque baguette)', yes: true },
        { s: 'l’âge d’un enfant et sa taille', yes: false },
        { s: 'le nombre de tours de piste et la distance parcourue', yes: true },
        { s: 'le nombre de joueurs d’une équipe et le nombre de buts marqués', yes: false },
      ]);
      return {
        prompt: `Ces deux grandeurs sont-elles proportionnelles : ${q.s} ?`,
        ...choice(
          rng,
          q.yes ? 'Oui' : 'Non',
          [
            {
              label: q.yes ? 'Non' : 'Oui',
              why: q.yes
                ? 'Si on double l’une, l’autre double aussi.'
                : 'Doubler l’une ne double pas forcément l’autre.',
            },
          ],
          true,
        ),
        hint: 'Si on double la première, la seconde double-t-elle forcément ?',
        steps: [
          q.yes
            ? 'Si on double la première, la seconde double aussi.'
            : 'Doubler la première ne double pas forcément la seconde.',
          `**${q.yes ? 'Oui' : 'Non'}**.`,
        ],
        targetSeconds: 20,
      };
    },
  );

  const foisPlus = S(
    id('propor-fois-plus'),
    'Fois plus, fois moins',
    'Savoir résoudre un problème de proportionnalité',
    ['« 4 pains coûtent 7 € ; 12 pains, c’est 3 fois plus de pains, donc 3 fois plus cher : 21 €. »'],
    (rng) => {
      const a = rng.int(2, 5);
      const k = rng.int(2, 5);
      const p = rng.int(3, 12);
      const item = rng.pick(['pains aux raisins', 'bouteilles de jus', 'cahiers', 'tickets de bus']);
      return {
        prompt: `${a} ${item} coûtent ${p} €. Combien coûtent ${a * k} ${item} ?`,
        answer: num(p * k, '€'),
        traps: traps(r(p * k), [[p + (a * k - a), `Il y a ${k} fois plus de ${item}, donc on paie ${k} fois plus.`]]),
        hint: `${a * k}, c’est combien de fois ${a} ?`,
        steps: [
          `${a * k} = ${k} × ${a} : ${k} fois plus de ${item}.`,
          `Donc ${k} fois plus cher : ${k} × ${p} = **${p * k} €**.`,
        ],
        targetSeconds: 25,
      };
    },
  );

  const additivite = S(
    id('propor-additivite'),
    'Proportionnalité en additionnant',
    'Savoir résoudre un problème de proportionnalité',
    ['Si 3 kg coûtent 6 € et 2 kg coûtent 4 €, alors 5 kg (3 + 2) coûtent 6 + 4 = 10 €.'],
    (rng) => {
      const u = rng.int(2, 6);
      const a = rng.int(2, 5);
      let b = rng.int(2, 5);
      if (a === b) b++;
      return {
        prompt: `${a} kg de cerises coûtent ${a * u} € et ${b} kg coûtent ${b * u} €. Combien coûtent ${a + b} kg ?`,
        answer: num((a + b) * u, '€'),
        traps: traps(r((a + b) * u), [
          [a * u * b * u, 'On additionne : ' + String(a + b) + ' kg = ' + String(a) + ' kg + ' + String(b) + ' kg.'],
        ]),
        hint: `${a + b} kg = ${a} kg + ${b} kg.`,
        steps: [`${a + b} kg = ${a} kg + ${b} kg.`, `${a * u} + ${b * u} = **${(a + b) * u} €**.`],
        targetSeconds: 25,
      };
    },
  );

  const proportionnalite = C(
    id('proportionnalite'),
    'fonctions',
    'Proportionnalité',
    [identifier, foisPlus, additivite],
    bossOf(
      [
        S(
          id('boss-propor-crepes'),
          'Problème : les crêpes',
          'Savoir résoudre un problème de proportionnalité',
          ['Pour 2 fois plus de crêpes, il faut 2 fois plus de chaque ingrédient.'],
          (rng) => {
            const eggs = rng.int(2, 4);
            const k = rng.int(2, 4);
            return {
              prompt: `Pour 10 crêpes, il faut ${eggs} œufs. Combien d’œufs pour ${10 * k} crêpes ?`,
              answer: num(eggs * k),
              traps: traps(r(eggs * k), [
                [eggs + 10 * (k - 1), 'On ne fait pas une addition : c’est ' + String(k) + ' fois plus de crêpes.'],
              ]),
              hint: `${10 * k} crêpes, c’est combien de fois 10 crêpes ?`,
              steps: [`${10 * k} = ${k} × 10.`, `${k} × ${eggs} = **${eggs * k}** œufs.`],
              targetSeconds: 30,
            };
          },
        ),
        S(
          id('boss-propor-essence'),
          'Problème : le jardinier',
          'Savoir résoudre un problème de proportionnalité',
          ['Si 4 rangées demandent 20 plants, 2 rangées (la moitié) en demandent 10.'],
          (rng) => {
            const plants = rng.int(3, 9);
            const rows = rng.pick([4, 6, 8]);
            return {
              prompt: `Pour ${rows} rangées, le jardinier plante ${plants * rows} salades. Combien pour ${rows / 2} rangées ?`,
              answer: num((plants * rows) / 2),
              traps: traps(r((plants * rows) / 2), [
                [plants * rows - rows / 2, 'C’est 2 fois moins de rangées : 2 fois moins de salades.'],
              ]),
              hint: `${rows / 2}, c’est la moitié de ${rows}.`,
              steps: [
                `${rows / 2} rangées = la moitié de ${rows}.`,
                `${plants * rows} ÷ 2 = **${(plants * rows) / 2}** salades.`,
              ],
              targetSeconds: 30,
            };
          },
        ),
      ],
      [
        S(
          id('boss-propor-piege'),
          'Piège : tout n’est pas proportionnel',
          'Identifier une situation de proportionnalité',
          ['À 10 ans, on ne mesure pas 2 fois plus qu’à 5 ans !'],
          (rng) => {
            const h = rng.int(105, 115);
            return {
              prompt: `À 5 ans, Noah mesurait ${h} cm. Mesurera-t-il ${2 * h} cm à 10 ans ?`,
              ...choice(rng, 'Non', [{ label: 'Oui', why: 'La taille n’est pas proportionnelle à l’âge.' }], true),
              hint: 'La taille double-t-elle quand l’âge double ?',
              steps: [
                `${2 * h} cm, ce serait plus de 2 m à 10 ans !`,
                '**Non** : la taille n’est pas proportionnelle à l’âge.',
              ],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  return [
    nombres,
    fractions,
    decimaux,
    calculMental,
    operations,
    problemes,
    algebre,
    mesures,
    aires,
    durees,
    geometrie,
    angles,
    donnees,
    probabilites,
    proportionnalite,
  ];
}

export const CM1: readonly Chapter[] = build('cm1');
export const CM2: readonly Chapter[] = build('cm2');
