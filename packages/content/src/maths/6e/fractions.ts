import { choice, fraction, num, traps } from '../../build.ts';
import { add, cmp, fmt, frac, mul, r, rawFrac, sub } from '../../rational.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C, versionDeux } from './commun.ts';

// ——— Fractions ———

const fractionQuotient = versionDeux(
  S(
    'm6-fraction-quotient',
    'La fraction, un quotient',
    'Comprendre et connaître la définition du quotient d’un entier a par un entier b non nul',
    ['{3/4}, c’est 3 partagé en 4 : {3/4} = 3 ÷ 4 = 0,75.', 'Le nombre qui, multiplié par 4, donne 3, c’est {3/4}.'],
    (rng, level) => {
      if (level === 1) {
        // Niveau 1 : moins d’un gâteau par personne, petits nombres, partage que l’on peut dessiner.
        const b = rng.int(3, 8);
        const a = rng.int(1, b - 1);
        return {
          prompt: `Complète avec une fraction : ${b} × … = ${a}`,
          answer: fraction(r(a, b)),
          traps: traps(r(a, b), [[r(b, a), `En haut, on écrit ${a} (le total). En bas, ${b} (le nombre de parts).`]]),
          hint: `Imagine ${a} à partager en ${b} parts égales.`,
          demo: { kind: 'fraction', parts: [{ num: a, den: b }] },
          steps: [
            `Regarde : ${b} fois le nombre caché doit donner ${a}.`,
            `Partage donc ${a} en ${b} parts égales : calcule ${a} ÷ ${b}.`,
            `Écris ce partage en fraction : ${a} en haut, ${b} en bas.`,
            `Vérifie : ${b} × ${rawFrac(a, b)} = ${a}. La réponse est **${rawFrac(a, b)}**.`,
          ],
          targetSeconds: 20,
        };
      }
      const b = rng.pick([2, 4, 5, 8, 10, 20, 25]);
      const a = rng.int(1, b * 3);
      const v = r(a, b);
      return {
        prompt: `Écris ${rawFrac(a, b)} avec une virgule (écriture décimale).`,
        answer: num(v),
        traps: traps(v, [[r(b, a), `La barre veut dire : ${a} divisé par ${b}, dans cet ordre.`]]),
        hint: `La barre de fraction veut dire « divisé par ».`,
        steps: [
          `Regarde la barre de ${rawFrac(a, b)} : elle veut dire « divisé par ».`,
          `Écris la division : ${a} ÷ ${b}.`,
          `Calcule : ${a} ÷ ${b} = **${fmt(v)}**.`,
        ],
        targetSeconds: 20,
      };
    },
    { mental: true },
  ),
);

const fractionsEgales = S(
  'm6-fractions-egales',
  'Égalités de fractions',
  'Établir des égalités de fractions',
  [
    'On ne change pas une fraction en multipliant (ou divisant) **le numérateur et le dénominateur par le même nombre** : {2/3} = {8/12}.',
  ],
  (rng, level) => {
    const b = rng.int(2, 9);
    const a = rng.int(1, b - 1);
    const k = rng.int(2, level === 1 ? 5 : 9);
    const askTop = level !== 1 || rng.int(0, 1) === 1;
    const missing = askTop ? a * k : b * k;
    return {
      prompt: askTop ? `Complète : ${rawFrac(a, b)} = {…/${b * k}}` : `Complète : ${rawFrac(a, b)} = {${a * k}/…}`,
      answer: num(missing),
      traps: traps(r(missing), [
        [
          askTop ? a + (b * k - b) : b + (a * k - a),
          'On ne fait pas une addition : on multiplie en haut **et** en bas par le même nombre.',
        ],
      ]),
      hint: askTop
        ? `Par combien a-t-on multiplié ${b} pour obtenir ${b * k} ?`
        : `Par combien a-t-on multiplié ${a} pour obtenir ${a * k} ?`,
      steps: [
        `${askTop ? `${b} × ${k} = ${b * k}` : `${a} × ${k} = ${a * k}`} : on a multiplié par ${k}.`,
        `On fait pareil de l’autre côté : ${askTop ? a : b} × ${k} = **${missing}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const comparerFractions = S(
  'm6-comparer-fractions',
  'Comparer et ranger des fractions',
  'Comparer et encadrer des fractions',
  [
    'Même dénominateur : la plus grande fraction a le plus grand numérateur ({5/8} > {3/8}).',
    'Sinon, on les écrit avec le même dénominateur : {2/3} = {8/12} et {3/4} = {9/12}.',
  ],
  (rng, level) => {
    if (level === 3) {
      const d = rng.int(2, 9);
      const n = rng.int(d + 1, 5 * d - 1);
      if (n % d === 0) return comparerFractions.generate(rng, level);
      const lo = Math.floor(n / d);
      return {
        prompt: `Entre quels entiers consécutifs se trouve ${rawFrac(n, d)} ? Donne le plus petit.`,
        answer: num(lo),
        traps: traps(r(lo), [[lo + 1, `${lo + 1} = {${(lo + 1) * d}/${d}} est plus grand que ${rawFrac(n, d)}.`]]),
        hint: `Combien de fois ${d} dans ${n} ?`,
        steps: [
          `${n} = ${d} × ${lo} + ${n - d * lo}, donc ${rawFrac(n, d)} = ${lo} + ${rawFrac(n - d * lo, d)}.`,
          `**${lo}** < ${rawFrac(n, d)} < ${lo + 1}.`,
        ],
        targetSeconds: 20,
      };
    }
    const d1 = rng.int(2, 6);
    const k = level === 1 ? 1 : rng.int(2, 3);
    const d2 = d1 * k;
    const a = rng.int(1, d1 - 1 || 1);
    let b = rng.int(1, d2 - 1);
    if (a * k === b) b = b === 1 ? 2 : b - 1;
    const sign = cmp(r(a, d1), r(b, d2)) < 0 ? '<' : '>';
    return {
      prompt: `Compare : ${rawFrac(a, d1)} … ${rawFrac(b, d2)}`,
      ...choice(
        rng,
        sign,
        [
          {
            label: sign === '<' ? '>' : '<',
            why: 'Mets les deux fractions au même dénominateur avant de comparer les numérateurs.',
          },
        ],
        true,
      ),
      hint:
        k === 1
          ? 'Même dénominateur : compare les numérateurs.'
          : `Écris ${rawFrac(a, d1)} avec le dénominateur ${d2}.`,
      steps: [
        k === 1 ? 'Même dénominateur : on compare les numérateurs.' : `${rawFrac(a, d1)} = ${rawFrac(a * k, d2)}.`,
        `${rawFrac(a * k, d2)} ${sign} ${rawFrac(b, d2)}, donc ${rawFrac(a, d1)} **${sign}** ${rawFrac(b, d2)}.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const additionFractions = S(
  'm6-addition-fractions',
  'Additionner et soustraire des fractions',
  'Additionner et soustraire des fractions',
  [
    'Même dénominateur : on additionne les numérateurs et on **garde** le dénominateur : {2/7} + {3/7} = {5/7}.',
    'Sinon, on met d’abord au même dénominateur : {1/2} + {1/4} = {2/4} + {1/4} = {3/4}.',
  ],
  (rng, level) => {
    const d = rng.int(3, 12);
    const k = level === 1 ? 1 : rng.int(2, 3);
    const d2 = d * k;
    const a = rng.int(1, d - 1);
    const b = rng.int(1, d2 - 1);
    const minus = level === 3 && a * k > b;
    const res = minus ? sub(r(a, d), r(b, d2)) : add(r(a, d), r(b, d2));
    const raw = minus ? a * k - b : a * k + b;
    return {
      prompt: `Calcule ${rawFrac(a, d)} ${minus ? '−' : '+'} ${rawFrac(b, d2)}.`,
      answer: fraction(res),
      traps: traps(res, [
        [r(minus ? a - b : a + b, minus ? Math.max(1, d2 - d) : d + d2), 'On n’additionne pas les dénominateurs !'],
      ]),
      hint:
        k === 1
          ? 'Même dénominateur : additionne les numérateurs.'
          : `Écris ${rawFrac(a, d)} avec le dénominateur ${d2}.`,
      steps: [
        k === 1 ? 'Même dénominateur : on travaille sur les numérateurs.' : `${rawFrac(a, d)} = ${rawFrac(a * k, d2)}.`,
        `${rawFrac(a * k, d2)} ${minus ? '−' : '+'} ${rawFrac(b, d2)} = ${rawFrac(raw, d2)}${frac(res) === rawFrac(raw, d2) ? '' : ` = ${frac(res)}`} : **${frac(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const fractionEntier = S(
  'm6-fraction-fois-entier',
  'Fraction d’un nombre, fraction × entier',
  'Utiliser une multiplication pour appliquer une fraction à un nombre entier',
  [
    'Prendre {3/4} de 20 : 20 ÷ 4 = 5, puis 3 × 5 = 15. C’est aussi {3/4} × 20.',
    'Multiplier une fraction par un entier : on multiplie le numérateur. 4 × {2/9} = {8/9}.',
  ],
  (rng, level) => {
    if (level === 1) {
      const n = rng.int(2, 6);
      const d = rng.int(n + 1, 15);
      const a = rng.int(1, d - 1);
      const res = mul(r(n), r(a, d));
      return {
        prompt: `Calcule ${n} × ${rawFrac(a, d)}.`,
        answer: fraction(res),
        traps: traps(res, [[r(n * a, n * d), 'On multiplie seulement le numérateur.']]),
        hint: 'Multiplie le numérateur, garde le dénominateur.',
        steps: [`${n} × ${rawFrac(a, d)} = {${n} × ${a}/${d}} = ${rawFrac(n * a, d)}.`, `Résultat : **${frac(res)}**.`],
        targetSeconds: 15,
      };
    }
    const d = rng.pick([2, 3, 4, 5, 6, 8, 10]);
    const a = rng.int(1, d - 1);
    const part = rng.int(2, level === 2 ? 12 : 40);
    const total = d * part;
    return {
      prompt: `Calcule ${rawFrac(a, d)} de ${total}.`,
      answer: num(a * part),
      traps: traps(r(a * part), [[part, `${total} ÷ ${d} = ${part}, c’est une seule part : il en faut ${a}.`]]),
      hint: `Partage ${total} en ${d} parts égales.`,
      steps: [
        `Une part : ${total} ÷ ${d} = ${part}.`,
        `${a} part${a > 1 ? 's' : ''} : ${a} × ${part} = **${a * part}**.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const problemesFractions = S(
  'm6-problemes-fractions',
  'Problèmes avec des fractions',
  'Résoudre des problèmes mettant en jeu des fractions',
  [
    'Le tout vaut 1 (ou {4/4}, {5/5}…). Ce qui reste = 1 − ce qu’on a pris.',
    'Une fraction d’une quantité : on divise par le dénominateur, puis on multiplie par le numérateur.',
  ],
  (rng, level) => {
    const d = rng.pick([4, 5, 6, 8, 10]);
    const a = rng.int(1, d - 2);
    const total = d * rng.int(2, level === 1 ? 5 : 12);
    const who = rng.pick(NAMES);
    const restPart = d - a;
    const res = (total / d) * restPart;
    return {
      prompt: `${who} a ${total} billes. Il en donne ${rawFrac(a, d)} à sa sœur. Combien de billes lui reste-t-il ?`,
      answer: num(res),
      traps: traps(r(res), [[(total / d) * a, `Ça, c’est ce qu’il **donne**. On demande ce qui reste.`]]),
      hint: `Calcule ${rawFrac(a, d)} de ${total}, puis enlève-le.`,
      steps: [
        `Il donne ${rawFrac(a, d)} de ${total} = ${(total / d) * a} billes.`,
        `Il lui reste ${total} − ${(total / d) * a} = **${res}** billes.`,
      ],
      targetSeconds: 40,
    };
  },
);

export const fractions = C(
  'm6-fractions',
  'nombres',
  'Fractions',
  [fractionQuotient, fractionsEgales, comparerFractions, additionFractions, fractionEntier, problemesFractions],
  bossOf(
    [
      versionDeux(
        S(
          'm6-boss-fractions-gateau',
          'Problème : le gâteau',
          'Résoudre des problèmes mettant en jeu des fractions',
          ['Le gâteau entier vaut {8/8}. Si on mange {3/8}, il reste {8/8} − {3/8} = {5/8}.'],
          (rng) => {
            const [d1, d2] = rng.pick([
              [4, 8],
              [3, 6],
              [2, 8],
              [5, 10],
              [3, 12],
            ] as const);
            const b = rng.int(1, d2 / 2 - 1 || 1);
            const k = d2 / d1;
            const eaten = add(r(1, d1), r(b, d2));
            const rest = sub(r(1), eaten);
            const left = d2 - k - b;
            const same = rawFrac(left, d2) === frac(rest);
            return {
              prompt: `Lina mange ${rawFrac(1, d1)} du gâteau. Tao en mange ${rawFrac(b, d2)}. Quelle fraction du gâteau reste-t-il ?`,
              answer: fraction(rest),
              traps: traps(rest, [[eaten, 'Ça, c’est ce qui est **mangé**. On demande ce qui reste.']]),
              hint: `Coupe le gâteau en ${d2} parts égales. Combien de parts mange chacun ?`,
              demo: {
                kind: 'fraction',
                shape: 'cake',
                parts: [
                  { num: 1, den: d1 },
                  { num: k, den: d2 },
                  { num: b, den: d2 },
                ],
              },
              steps: [
                `Coupe le gâteau en ${d2} parts : ${rawFrac(1, d1)}, c’est pareil que ${rawFrac(k, d2)}.`,
                `Compte les parts mangées : ${k} + ${b} = ${k + b}, donc ${rawFrac(k + b, d2)}.`,
                `Enlève-les du gâteau entier : ${rawFrac(d2, d2)} − ${rawFrac(k + b, d2)} = ${rawFrac(left, d2)}.`,
                same
                  ? `Écris la réponse : il reste **${frac(rest)}** du gâteau.`
                  : `Simplifie si tu veux : il reste **${frac(rest)}** du gâteau.`,
              ],
              targetSeconds: 50,
            };
          },
        ),
      ),
      S(
        'm6-boss-fractions-classe',
        'Problème : la classe',
        'Utiliser une multiplication pour appliquer une fraction à un nombre entier',
        ['{2/5} de 30 : 30 ÷ 5 = 6, puis 2 × 6 = 12.'],
        (rng) => {
          const d = rng.pick([3, 4, 5, 6]);
          const a = rng.int(1, d - 1);
          const n = d * rng.int(5, 8);
          return {
            prompt: `Il y a ${n} élèves dans le collège-club. Les ${rawFrac(a, d)} font du foot. Combien d’élèves font du foot ?`,
            answer: num((n / d) * a),
            traps: traps(r((n / d) * a), [
              [n / d, 'Ça, c’est une seule part.'],
              [n - (n / d) * a, 'Ça, ce sont ceux qui **ne** font **pas** de foot.'],
            ]),
            hint: `Partage ${n} en ${d} parts égales.`,
            steps: [`${n} ÷ ${d} = ${n / d}.`, `${a} × ${n / d} = **${(n / d) * a}** élèves.`],
            targetSeconds: 40,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-fractions-piege',
        'Piège : additionner les dénominateurs',
        'Additionner et soustraire des fractions',
        ['{1/2} + {1/2} = 1, pas {2/4} ! On ne touche pas au dénominateur quand il est le même.'],
        (rng) => {
          const d = rng.int(3, 9);
          const a = rng.int(1, d - 2);
          const b = rng.int(1, d - a - 1 || 1);
          const ok = rawFrac(a + b, d);
          return {
            prompt: `Combien font ${rawFrac(a, d)} + ${rawFrac(b, d)} ?`,
            ...choice(rng, ok, [
              {
                label: rawFrac(a + b, 2 * d),
                why: `On n’additionne pas les dénominateurs : des ${d}ᵉˢ plus des ${d}ᵉˢ donnent des ${d}ᵉˢ.`,
              },
              { label: rawFrac(a * b, d), why: 'On additionne les numérateurs, on ne les multiplie pas.' },
            ]),
            hint: `Des ${d}ᵉˢ plus des ${d}ᵉˢ, ça donne des ${d}ᵉˢ.`,
            steps: [
              `${a} ${d}ᵉˢ + ${b} ${d}ᵉˢ = ${a + b} ${d}ᵉˢ.`,
              `Donc ${rawFrac(a, d)} + ${rawFrac(b, d)} = **${ok}**.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
