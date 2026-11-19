import { choice, fraction, num, traps } from '../../build.ts';
import { add, div, frac, gcd, mul, neg, r, rawFrac, sub } from '../../rational.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Nombres rationnels ———

const simplifier = S(
  'm4-simplifier',
  'Simplifier une fraction',
  'Simplifier une fraction',
  [
    'On **divise** le numérateur et le dénominateur par un même nombre : {12/18} = {6/9} = {2/3}.',
    'Astuce : utilise les tables (2, 3, 5…) jusqu’à ne plus pouvoir.',
  ],
  (rng, level) => {
    const b = rng.int(2, 9);
    let a = rng.int(1, b * 2);
    while (gcd(a, b) !== 1) a++;
    const k = level === 1 ? rng.pick([2, 3, 5, 10]) : rng.int(2, level === 2 ? 9 : 15);
    const v = r(a, b);
    return {
      prompt: `Simplifie le plus possible ${rawFrac(a * k, b * k)}.`,
      answer: fraction(v),
      traps: traps(v, [
        [r(a * k - k + 1, b * k - k + 1), 'On ne soustrait pas : on divise en haut et en bas par le même nombre.'],
      ]),
      hint: `Cherche un diviseur commun à ${a * k} et ${b * k}.`,
      steps: [`${a * k} et ${b * k} sont tous deux dans la table de ${k}.`, `On divise par ${k} : **${frac(v)}**.`],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const produitFractions = S(
  'm4-produit-fractions',
  'Multiplier des fractions',
  'Calculer le produit de nombres rationnels',
  [
    'On multiplie les numérateurs entre eux et les dénominateurs entre eux : {2/3} × {4/5} = {8/15}.',
    'Simplifie avant si tu peux : {3/4} × {8/9} = {3 × 8/4 × 9} = {2/3}.',
  ],
  (rng, level) => {
    const a = rng.int(1, 9);
    const b = rng.int(2, 9);
    const c = rng.int(1, 9);
    const d = rng.int(2, 9);
    const sa = level === 3 && rng.int(0, 1) === 1 ? -1 : 1;
    const res = mul(r(sa * a, b), r(c, d));
    return {
      prompt: `Calcule ${rawFrac(sa * a, b)} × ${rawFrac(c, d)} et donne le résultat simplifié.`,
      answer: fraction(res),
      traps: traps(res, [
        [r(sa * a * d + c * b, b * d), 'Pour multiplier, pas besoin de même dénominateur : haut × haut, bas × bas.'],
        [neg(res), 'Attention au signe.'],
      ]),
      hint: 'Numérateur × numérateur, dénominateur × dénominateur, puis simplifie.',
      steps: [
        `${rawFrac(sa * a, b)} × ${rawFrac(c, d)} = ${rawFrac(sa * a * c, b * d)}.`,
        `Simplifié : **${frac(res)}**.`,
      ],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const inverse = S(
  'm4-inverse',
  'Inverse d’un nombre',
  'Définir l’inverse d’un nombre et connaitre sa notation',
  [
    'L’**inverse** de x, c’est le nombre qui, multiplié par x, donne 1. L’inverse de {3/4} est {4/3} ; l’inverse de 5 est {1/5}.',
  ],
  (rng, level) => {
    if (level === 1) {
      const n = rng.int(2, 12);
      return {
        prompt: `Quel est l’inverse de ${n} ?`,
        answer: fraction(r(1, n)),
        traps: traps(r(1, n), [[r(-n), `Ça, c’est l’opposé. L’inverse multiplié par ${n} doit donner 1.`]]),
        hint: `Quel nombre multiplié par ${n} donne 1 ?`,
        steps: [`${n} × {1/${n}} = 1.`, `L’inverse de ${n} est **{1/${n}}**.`],
        targetSeconds: 10,
      };
    }
    const a = rng.int(1, 9);
    let b = rng.int(2, 9);
    if (a === b) b++;
    const s = level === 3 && rng.int(0, 1) === 1 ? -1 : 1;
    const v = r(s * b, a);
    return {
      prompt: `Quel est l’inverse de ${rawFrac(s * a, b)} ?`,
      answer: fraction(v),
      traps: traps(v, [
        [r(-s * a, b), 'Ça, c’est l’opposé : on change le signe. L’inverse « retourne » la fraction.'],
        [neg(v), 'L’inverse garde le même signe.'],
      ]),
      hint: 'On « retourne » la fraction.',
      steps: [`${rawFrac(s * a, b)} × ${rawFrac(s * b, a)} = 1.`, `L’inverse est **${frac(v)}**.`],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const diviserFractions = S(
  'm4-diviser-fractions',
  'Diviser des fractions',
  'Diviser des fractions',
  ['Diviser par une fraction, c’est **multiplier par son inverse** : {2/3} ÷ {4/5} = {2/3} × {5/4} = {10/12} = {5/6}.'],
  (rng) => {
    const a = rng.int(1, 9);
    const b = rng.int(2, 9);
    const c = rng.int(1, 9);
    const d = rng.int(2, 9);
    const res = div(r(a, b), r(c, d));
    return {
      prompt: `Calcule ${rawFrac(a, b)} ÷ ${rawFrac(c, d)} et donne le résultat simplifié.`,
      answer: fraction(res),
      traps: traps(res, [
        [mul(r(a, b), r(c, d)), 'On multiplie par l’**inverse** de la 2e fraction.'],
        [r(a * c, b * d === 0 ? 1 : b * d), 'On ne divise pas « haut par haut » : on multiplie par l’inverse.'],
      ]),
      hint: `Remplace « ÷ ${rawFrac(c, d)} » par « × ${rawFrac(d, c)} ».`,
      steps: [
        `${rawFrac(a, b)} ÷ ${rawFrac(c, d)} = ${rawFrac(a, b)} × ${rawFrac(d, c)} = ${rawFrac(a * d, b * c)}.`,
        `Simplifié : **${frac(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const fractionDeFraction = S(
  'm4-fraction-de-fraction',
  'Fraction d’une fraction, d’une quantité',
  'Calculer et représenter la fraction d’une fraction, d’un nombre, d’une quantité',
  ['Prendre {2/3} de {3/4}, c’est multiplier : {2/3} × {3/4} = {6/12} = {1/2}.'],
  (rng) => {
    const a = rng.int(1, 4);
    const b = rng.int(a + 1, 6);
    const c = rng.int(1, 4);
    const d = rng.int(c + 1, 8);
    const res = mul(r(a, b), r(c, d));
    const who = rng.pick(NAMES);
    return {
      prompt: `${who} a mangé ${rawFrac(c, d)} d’un gâteau ; ${rawFrac(a, b)} de ce morceau était du chocolat. Quelle fraction du gâteau entier est ce chocolat ?`,
      answer: fraction(res),
      traps: traps(res, [[add(r(a, b), r(c, d)), `« Les ${rawFrac(a, b)} de » se traduit par une multiplication.`]]),
      hint: `« ${rawFrac(a, b)} de ${rawFrac(c, d)} » : multiplie.`,
      steps: [
        `${rawFrac(a, b)} de ${rawFrac(c, d)} = ${rawFrac(a, b)} × ${rawFrac(c, d)} = ${rawFrac(a * c, b * d)}.`,
        `Simplifié : **${frac(res)}**.`,
      ],
      targetSeconds: 35,
    };
  },
);

const expressionsFractions = S(
  'm4-expressions-fractions',
  'Calculs avec plusieurs opérations',
  'Calculer la valeur d’expressions comportant plusieurs opérations avec des fractions',
  ['Les priorités valent aussi pour les fractions : la multiplication passe avant l’addition.'],
  (rng) => {
    const d = rng.pick([2, 3, 4, 5, 6]);
    const a = rng.int(1, 5);
    const b = rng.int(1, 4);
    const c = rng.int(2, 5);
    const res = add(r(a, d), mul(r(b, c), r(c, d)));
    return {
      prompt: `Calcule ${rawFrac(a, d)} + ${rawFrac(b, c)} × ${rawFrac(c, d)} et donne le résultat simplifié.`,
      answer: fraction(res),
      traps: traps(res, [[mul(add(r(a, d), r(b, c)), r(c, d)), 'La multiplication passe avant l’addition.']]),
      hint: 'Calcule d’abord le produit.',
      steps: [
        `${rawFrac(b, c)} × ${rawFrac(c, d)} = ${rawFrac(b * c, c * d)} = ${frac(r(b, d))}.`,
        `${rawFrac(a, d)} + ${frac(r(b, d))} = **${frac(res)}**.`,
      ],
      targetSeconds: 40,
    };
  },
  { mental: true },
);

export const rationnels = C(
  'm4-rationnels',
  'nombres',
  'Nombres rationnels',
  [simplifier, produitFractions, inverse, diviserFractions, fractionDeFraction, expressionsFractions],
  bossOf(
    [
      S(
        'm4-boss-rationnels-bouteilles',
        'Problème : remplir des gourdes',
        'Résoudre des problèmes mobilisant les opérations sur les fractions : addition, soustraction, multiplication, division, inverse',
        ['Combien de gourdes de {1/4} L dans 3 L ? 3 ÷ {1/4} = 3 × 4 = 12.'],
        (rng) => {
          const liters = rng.int(2, 9);
          const g = rng.pick([2, 3, 4, 5]);
          return {
            prompt: `Avec un bidon de ${liters} L, combien peut-on remplir de gourdes de {1/${g}} L ?`,
            answer: num(liters * g),
            traps: traps(r(liters * g), [[r(liters, g), `Diviser par {1/${g}}, c’est multiplier par ${g}.`]]),
            hint: `Combien de fois {1/${g}} dans ${liters} ? Divise par {1/${g}}.`,
            steps: [`${liters} ÷ {1/${g}} = ${liters} × ${g}.`, `= **${liters * g}** gourdes.`],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm4-boss-rationnels-heritage',
        'Problème : le partage',
        'Résoudre des problèmes mobilisant les opérations sur les fractions',
        ['La moitié du reste : on calcule d’abord le reste, puis on en prend la moitié (on multiplie).'],
        (rng) => {
          const a = rng.pick([3, 4, 5]);
          const rest = sub(r(1), r(1, a));
          const second = mul(r(1, 2), rest);
          return {
            prompt: `Lina prend {1/${a}} d’une pizza. Tao prend la moitié de ce qui reste. Quelle fraction de la pizza Tao prend-il ?`,
            answer: fraction(second),
            traps: traps(second, [[r(1, 2), 'Tao prend la moitié **du reste**, pas de la pizza entière.']]),
            hint: `Calcule d’abord ce qui reste après Lina.`,
            steps: [
              `Reste : 1 − {1/${a}} = ${frac(rest)}.`,
              `La moitié : {1/2} × ${frac(rest)} = **${frac(second)}**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-rationnels-piege',
        'Piège : inverse ou opposé ?',
        'Exprimer l’opposé d’un nombre rationnel',
        ['L’opposé de {2/3} est −{2/3} (on change le signe). L’inverse de {2/3} est {3/2} (on retourne).'],
        (rng) => {
          const a = rng.int(2, 7);
          const b = rng.int(a + 1, 9);
          return {
            prompt: `Quel est l’**opposé** de ${rawFrac(a, b)} ?`,
            ...choice(rng, rawFrac(-a, b), [
              { label: rawFrac(b, a), why: 'Ça, c’est l’inverse. L’opposé change seulement le signe.' },
              { label: rawFrac(-b, a), why: 'L’opposé ne retourne pas la fraction.' },
            ]),
            hint: 'Opposé : même distance à zéro, de l’autre côté.',
            steps: [
              'L’opposé change le signe, sans retourner la fraction.',
              `L’opposé de ${rawFrac(a, b)} est **${rawFrac(-a, b)}**.`,
            ],
            targetSeconds: 15,
          };
        },
      ),
    ],
  ),
);
