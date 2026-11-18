import { choice, distinct, fraction, nonZero, num, traps } from '../build.ts';
import { add, div, fmt, frac, gcd, mul, neg, r, rawFrac, sub } from '../rational.ts';
import type { Chapter } from '../types.ts';
import { bossOf, chapterOf, MINUS, NAMES, par, sgn, skillsOf } from './kit.ts';

/** Programme de 4e (cycle 4, BO n°10 du 5 mars 2026) : nombres et calculs. */
const S = skillsOf('4e');
const C = chapterOf('4e');

/** Exposant écrit en mini-balisage (un chiffre : ^5 ; sinon en clair). */
const pow = (base: string, e: number) => (e < 10 ? `${base}^${e}` : `${base} puissance ${e}`);

// ——— Relatifs : multiplication et division ———

const produitRelatifs = S(
  'm4-produit-relatifs',
  'Multiplier des relatifs',
  'Multiplier deux nombres relatifs : d’abord dans le cas où un seul des facteurs est négatif, puis, grâce à la distributivité, dans le cas où les deux facteurs sont négatifs',
  [
    'Règle des signes : **même signe → résultat positif** ; signes contraires → résultat négatif.',
    '(−3) × (−4) = 12 ; (−3) × 4 = −12. Avec plusieurs facteurs : compte les signes « − » (pair → +, impair → −).',
  ],
  (rng, level) => {
    if (level === 3) {
      const xs = distinct(rng, 3, () => nonZero(rng, -6, 6));
      const res = xs.reduce((p, x) => p * x, 1);
      const negs = xs.filter((x) => x < 0).length;
      return {
        prompt: `Calcule ${xs.map(par).join(' × ')}.`,
        answer: num(res),
        traps: traps(r(res), [
          [
            -res,
            `Il y a ${negs} facteur${negs > 1 ? 's' : ''} négatif${negs > 1 ? 's' : ''} : ${negs % 2 === 0 ? 'nombre pair → positif' : 'nombre impair → négatif'}.`,
          ],
        ]),
        hint: 'Compte les facteurs négatifs : pair → positif, impair → négatif. Puis multiplie les distances à zéro.',
        steps: [
          `${negs} facteur${negs > 1 ? 's' : ''} négatif${negs > 1 ? 's' : ''} → résultat ${negs % 2 === 0 ? 'positif' : 'négatif'}.`,
          `${xs.map((x) => Math.abs(x)).join(' × ')} = ${Math.abs(res)}, donc **${sgn(res)}**.`,
        ],
        targetSeconds: 25,
      };
    }
    const a = level === 1 ? -rng.int(2, 9) : nonZero(rng, -9, 9);
    const b = level === 1 ? rng.int(2, 9) : -rng.int(2, 9);
    const res = a * b;
    return {
      prompt: `Calcule ${par(a)} × ${par(b)}.`,
      answer: num(res),
      traps: traps(r(res), [
        [
          -res,
          a < 0 === b < 0 ? 'Même signe : le produit est positif.' : 'Signes contraires : le produit est négatif.',
        ],
        [a + b, 'C’est une multiplication, pas une addition.'],
      ]),
      hint: 'Même signe → positif ; signes contraires → négatif.',
      steps: [
        `${a < 0 === b < 0 ? 'Même signe' : 'Signes contraires'} : le résultat est ${res > 0 ? 'positif' : 'négatif'}.`,
        `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(res)}, donc **${sgn(res)}**.`,
      ],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const quotientRelatifs = S(
  'm4-quotient-relatifs',
  'Diviser des relatifs',
  'Diviser deux nombres relatifs',
  ['Pour la division, même règle des signes que pour la multiplication : (−20) ÷ (−4) = 5 ; (−20) ÷ 4 = −5.'],
  (rng) => {
    const q = nonZero(rng, -12, 12);
    const d = nonZero(rng, -9, 9);
    const n = q * d;
    return {
      prompt: `Calcule ${par(n)} ÷ ${par(d)}.`,
      answer: num(q),
      traps: traps(r(q), [
        [
          -q,
          n < 0 === d < 0 ? 'Même signe : le quotient est positif.' : 'Signes contraires : le quotient est négatif.',
        ],
      ]),
      hint: 'Même règle des signes que pour la multiplication.',
      steps: [
        `${n < 0 === d < 0 ? 'Même signe' : 'Signes contraires'} → ${q > 0 ? 'positif' : 'négatif'}.`,
        `${Math.abs(n)} ÷ ${Math.abs(d)} = ${Math.abs(q)}, donc **${sgn(q)}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const enchainementRelatifs = S(
  'm4-enchainement-relatifs',
  'Enchaîner des opérations avec des relatifs',
  'Savoir calculer un enchainement d’opérations avec des nombres relatifs',
  ['Priorités : d’abord les parenthèses, puis × et ÷, puis + et −. Puis la règle des signes à chaque étape.'],
  (rng, level) => {
    const a = nonZero(rng, -9, 9);
    const b = nonZero(rng, -6, 6);
    const c = nonZero(rng, -6, 6);
    if (level === 3) {
      const res = (a + b) * c;
      return {
        prompt: `Calcule (${sgn(a)} + ${par(b)}) × ${par(c)}.`,
        answer: num(res),
        traps: traps(r(res), [[a + b * c, 'Les parenthèses passent en premier.']]),
        hint: 'Calcule d’abord la parenthèse.',
        steps: [`${sgn(a)} + ${par(b)} = ${sgn(a + b)}.`, `${par(a + b)} × ${par(c)} = **${sgn(res)}**.`],
        targetSeconds: 30,
      };
    }
    const res = a + b * c;
    return {
      prompt: `Calcule ${sgn(a)} + ${par(b)} × ${par(c)}.`,
      answer: num(res),
      traps: traps(r(res), [[(a + b) * c, 'La multiplication passe avant l’addition.']]),
      hint: 'La multiplication est prioritaire.',
      steps: [`${par(b)} × ${par(c)} = ${sgn(b * c)}.`, `${sgn(a)} + ${par(b * c)} = **${sgn(res)}**.`],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const vocabulaireRelatifs = S(
  'm4-vocabulaire-calcul',
  'Somme, produit, quotient : la dernière opération',
  'Utiliser le vocabulaire (somme, quotient, etc.) à partir d’un enchainement d’opérations dans un programme de calcul et inversement',
  [
    'La **nature** d’une expression, c’est sa **dernière** opération : (3 + 4) × 5 est un produit ; 3 + 4 × 5 est une somme.',
  ],
  (rng) => {
    const a = nonZero(rng, -9, 9);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const forms = [
      { e: `(${sgn(a)} + ${b}) × ${c}`, n: 'Un produit' },
      { e: `${sgn(a)} + ${b} × ${c}`, n: 'Une somme' },
      { e: `(${sgn(a)} − ${b}) ÷ ${c}`, n: 'Un quotient' },
      { e: `${sgn(a)} × ${b} − ${c}`, n: 'Une différence' },
    ];
    const f = rng.pick(forms);
    return {
      prompt: `Quelle est la nature de l’expression ${f.e} ?`,
      ...choice(
        rng,
        f.n,
        ['Un produit', 'Une somme', 'Un quotient', 'Une différence']
          .filter((x) => x !== f.n)
          .map((x) => ({ label: x, why: 'Cherche l’opération qu’on fait en **dernier**.' })),
      ),
      hint: 'Quelle opération fait-on en dernier, avec les priorités ?',
      steps: [
        'On applique les priorités et on regarde la dernière opération effectuée.',
        `C’est **${f.n.toLowerCase()}**.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const relatifs = C(
  'm4-relatifs',
  'nombres',
  'Multiplier et diviser des relatifs',
  [produitRelatifs, quotientRelatifs, enchainementRelatifs, vocabulaireRelatifs],
  bossOf(
    [
      S(
        'm4-boss-relatifs-congelateur',
        'Problème : le congélateur',
        'Savoir calculer un enchainement d’opérations avec des nombres relatifs',
        ['Une baisse de 3 °C par heure pendant 5 h : 5 × (−3) = −15 °C de variation.'],
        (rng) => {
          const t0 = rng.int(5, 20);
          const drop = rng.int(2, 6);
          const h = rng.int(3, 8);
          const res = t0 + h * -drop;
          return {
            prompt: `Il fait ${t0} °C dans un congélateur qu’on vient de brancher. La température baisse de ${drop} °C par heure pendant ${h} h. Quelle température atteint-il ?`,
            answer: num(res, '°C'),
            traps: traps(r(res), [
              [t0 + h * drop, 'La température **baisse** : la variation est négative.'],
              [h * -drop, `N’oublie pas la température de départ (${t0} °C).`],
            ]),
            hint: `Variation : ${h} × (${MINUS}${drop}).`,
            steps: [
              `Variation : ${h} × (${MINUS}${drop}) = ${sgn(-h * drop)} °C.`,
              `${t0} + (${sgn(-h * drop)}) = **${sgn(res)} °C**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm4-boss-relatifs-quiz',
        'Problème : le quiz à points négatifs',
        'Savoir calculer un enchainement d’opérations avec des nombres relatifs',
        ['Bonne réponse +3, mauvaise −2 : score = 3 × bonnes + (−2) × mauvaises.'],
        (rng) => {
          const good = rng.int(2, 8);
          const bad = rng.int(3, 10);
          const res = 3 * good - 2 * bad;
          return {
            prompt: `Dans un quiz, une bonne réponse rapporte 3 points et une mauvaise en fait perdre 2. ${rng.pick(NAMES)} a ${good} bonnes réponses et ${bad} mauvaises. Quel est son score ?`,
            answer: num(res),
            traps: traps(r(res), [[3 * good + 2 * bad, 'Les mauvaises réponses **enlèvent** des points.']]),
            hint: `3 × ${good} + (${MINUS}2) × ${bad}.`,
            steps: [
              `3 × ${good} = ${3 * good} et (${MINUS}2) × ${bad} = ${sgn(-2 * bad)}.`,
              `${3 * good} + (${sgn(-2 * bad)}) = **${sgn(res)}**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-relatifs-piege',
        'Piège : moins par moins',
        'Multiplier deux nombres relatifs',
        ['« Moins par moins donne plus » vaut pour la **multiplication**, pas pour l’addition : (−3) + (−4) = −7.'],
        (rng) => {
          const a = rng.int(2, 9);
          const b = rng.int(2, 9);
          return {
            prompt: `Calcule (${MINUS}${a}) + (${MINUS}${b}).`,
            answer: num(-(a + b)),
            traps: traps(r(-(a + b)), [
              [a + b, '« Moins par moins donne plus », c’est pour la multiplication. Ici, on ajoute deux dettes.'],
              [a * b, 'C’est une addition.'],
            ]),
            hint: 'Deux nombres négatifs qu’on ajoute : comme deux dettes.',
            steps: [
              `On ajoute deux nombres négatifs : on s’enfonce sous zéro.`,
              `(${MINUS}${a}) + (${MINUS}${b}) = **${sgn(-(a + b))}**.`,
            ],
            targetSeconds: 15,
          };
        },
      ),
    ],
  ),
);

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

const rationnels = C(
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

// ——— Puissances ———

const puissanceDefinition = S(
  'm4-puissance-definition',
  'Puissance d’un nombre',
  'Définir les puissances d’exposant positif d’un nombre a',
  ['a^n = a × a × … × a (n facteurs). 2^5 = 2 × 2 × 2 × 2 × 2 = 32. Attention : 2^5 n’est pas 2 × 5 !'],
  (rng, level) => {
    const base = level === 3 ? -rng.int(2, 3) : rng.int(2, level === 1 ? 3 : 5);
    const e = rng.int(2, level === 2 ? 4 : 5);
    const res = base ** e;
    return {
      prompt: `Calcule ${base < 0 ? `(${sgn(base)})` : base}^${e}.`,
      answer: num(res),
      traps: traps(r(res), [
        [
          base * e,
          `${base < 0 ? `(${sgn(base)})` : base}^${e} n’est pas ${sgn(base)} × ${e} : c’est ${e} facteurs égaux à ${sgn(base)}.`,
        ],
        [-res, 'Attention au signe : compte les facteurs négatifs.'],
      ]),
      hint: `Écris les ${e} facteurs, puis multiplie.`,
      steps: [`${Array.from({ length: e }, () => par(base)).join(' × ')}.`, `= **${sgn(res)}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const produitPuissances = S(
  'm4-produit-puissances',
  'Multiplier des puissances',
  'Multiplier des puissances d’exposant entier naturel d’un même nombre entre elles',
  ['a^m × a^n = a^(m+n) : on **additionne** les exposants. 2^3 × 2^4 = 2^7 (3 + 4 facteurs 2).'],
  (rng, level) => {
    const base = rng.pick(['a', 'x', '5', '7', '10']);
    const m = rng.int(2, 5);
    const n = rng.int(2, 4);
    if (level === 3) {
      const a = rng.int(2, 5);
      const b = rng.int(2, 5);
      const e = rng.int(2, 3);
      return {
        prompt: `Écris ${a}^${e} × ${b}^${e} sous la forme d’une seule puissance d’exposant ${e} : quelle est la base ?`,
        answer: num(a * b),
        traps: traps(r(a * b), [[a + b, 'a^n × b^n = (a × b)^n : on multiplie les bases.']]),
        hint: 'Même exposant : a^n × b^n = (a × b)^n.',
        steps: [`${a}^${e} × ${b}^${e} = (${a} × ${b})^${e}.`, `La base est **${a * b}**.`],
        targetSeconds: 20,
      };
    }
    return {
      prompt: `${pow(base, m)} × ${pow(base, n)} = ${base}^… : quel est l’exposant ?`,
      answer: num(m + n),
      traps: traps(r(m + n), [[m * n, 'On additionne les exposants : on compte les facteurs.']]),
      hint: `Compte tous les facteurs ${base} : ${m} d’un côté, ${n} de l’autre.`,
      steps: [
        `${m} facteurs ${base}, puis ${n} facteurs ${base} : ${m} + ${n} facteurs.`,
        `L’exposant est **${m + n}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const puissances10 = S(
  'm4-puissances-10',
  'Puissances de 10',
  'Résoudre des problèmes faisant intervenir des puissances',
  ['10^n = 1 suivi de n zéros : 10^6 = 1 000 000 (un million).', '3,2 × 10^3 = 3 200 : la virgule avance de 3 rangs.'],
  (rng, level) => {
    const n = rng.int(2, 7);
    if (level === 1) {
      return {
        prompt: `Combien de zéros dans l’écriture de 10^${n} ?`,
        answer: num(n),
        traps: traps(r(n), [[n + 1, `10^${n} s’écrit 1 suivi de ${n} zéros.`]]),
        hint: '10^2 = 100 : 2 zéros.',
        steps: [`10^${n} = 1${'0'.repeat(n)}.`, `Il y a **${n}** zéros.`],
        targetSeconds: 10,
      };
    }
    const x = r(rng.int(11, 99), 10);
    const res = mul(x, r(10 ** n));
    return {
      prompt: `Calcule ${fmt(x)} × 10^${n}.`,
      answer: num(res),
      traps: traps(res, [[mul(x, r(10 * n)), `10^${n} n’est pas 10 × ${n}.`]]),
      hint: `× 10^${n} : la virgule avance de ${n} rangs vers la droite.`,
      steps: [`10^${n} = ${fmt(r(10 ** n))}.`, `${fmt(x)} × ${fmt(r(10 ** n))} = **${fmt(res)}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const puissances = C(
  'm4-puissances',
  'nombres',
  'Puissances',
  [puissanceDefinition, produitPuissances, puissances10],
  bossOf(
    [
      S(
        'm4-boss-puissances-bacteries',
        'Problème : les bactéries',
        'Résoudre des problèmes faisant intervenir des puissances',
        ['Si une population double chaque heure, après n heures elle est multipliée par 2^n.'],
        (rng) => {
          const h = rng.int(3, 8);
          const start = rng.pick([1, 3, 5, 10]);
          return {
            prompt: `Une colonie de ${start} bactérie${start > 1 ? 's' : ''} double chaque heure. Combien y en a-t-il après ${h} heures ?`,
            answer: num(start * 2 ** h),
            traps: traps(r(start * 2 ** h), [
              [start * 2 * h, `Doubler à chaque heure, c’est multiplier par 2, ${h} fois : 2^${h}.`],
            ]),
            hint: `Multiplie ${start} par 2, ${h} fois.`,
            steps: [`Après ${h} h : ${start} × 2^${h} = ${start} × ${2 ** h}.`, `= **${start * 2 ** h}** bactéries.`],
            targetSeconds: 45,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-puissances-cubes',
        'Problème : le grand cube',
        'Résoudre des problèmes faisant intervenir des puissances',
        ['Un cube de n petits cubes d’arête contient n^3 petits cubes.'],
        (rng) => {
          const n = rng.int(3, 9);
          return {
            prompt: `Un grand cube a ${n} petits cubes sur chaque arête. Combien de petits cubes contient-il ?`,
            answer: num(n ** 3),
            traps: traps(r(n ** 3), [
              [n * 3, `C’est ${n}^3 = ${n} × ${n} × ${n}, pas ${n} × 3.`],
              [n * n, `${n} × ${n}, c’est un seul étage.`],
            ]),
            hint: `${n} × ${n} cubes par étage, et ${n} étages.`,
            steps: [`${n}^3 = ${n} × ${n} × ${n}.`, `= **${n ** 3}** petits cubes.`],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-puissances-piege',
        'Piège : (−2)^2 ou −2^2 ?',
        'Définir les puissances d’exposant positif d’un nombre a',
        ['(−3)^2 = (−3) × (−3) = 9, mais −3^2 = −(3 × 3) = −9 : l’exposant ne s’applique qu’à ce qui est juste avant.'],
        (rng) => {
          const a = rng.int(2, 6);
          return {
            prompt: `Calcule ${MINUS}${a}^2 (sans parenthèses).`,
            answer: num(-a * a),
            traps: traps(r(-a * a), [
              [a * a, `Sans parenthèses, le carré ne porte que sur ${a} : ${MINUS}${a}^2 = ${MINUS}(${a} × ${a}).`],
            ]),
            hint: 'Sans parenthèses, sur quoi porte l’exposant ?',
            steps: [`L’exposant porte seulement sur ${a} : ${a}^2 = ${a * a}.`, `${MINUS}${a}^2 = **${sgn(-a * a)}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

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

const racines = C(
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

// ——— Calcul littéral et algébrique ———

const developper = S(
  'm4-developper',
  'Développer avec la distributivité',
  'Connaitre et utiliser la distributivité simple pour développer et factoriser une expression algébrique',
  ['k(a + b) = ka + kb : on distribue k à **chaque** terme. 3(x + 4) = 3x + 12 ; −2(x − 5) = −2x + 10.'],
  (rng, level) => {
    const k = level === 3 ? -rng.int(2, 6) : rng.int(2, 9);
    const b = nonZero(rng, -9, 9);
    const c = k * b;
    const expr = `${k < 0 ? sgn(k) : k}(x ${b < 0 ? MINUS : '+'} ${Math.abs(b)})`;
    const good = `${sgn(k)}x ${c < 0 ? MINUS : '+'} ${Math.abs(c)}`;
    return {
      prompt: `Développe ${expr}.`,
      ...choice(rng, good, [
        {
          label: `${sgn(k)}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)}`,
          why: `Il faut multiplier **aussi** ${sgn(b)} par ${sgn(k)}.`,
        },
        { label: `${sgn(k)}x ${c < 0 ? '+' : MINUS} ${Math.abs(c)}`, why: 'Attention à la règle des signes.' },
        { label: `x ${c < 0 ? MINUS : '+'} ${Math.abs(c)}`, why: `Il faut multiplier x par ${sgn(k)} aussi.` },
      ]),
      hint: `Multiplie ${sgn(k)} par x, puis ${sgn(k)} par ${sgn(b)}.`,
      steps: [`${sgn(k)} × x = ${sgn(k)}x et ${par(k)} × ${par(b)} = ${sgn(c)}.`, `${expr} = **${good}**.`],
      targetSeconds: 25,
    };
  },
);

const factoriser = S(
  'm4-factoriser',
  'Factoriser',
  'Connaitre et utiliser la distributivité simple pour développer et factoriser une expression algébrique',
  ['Factoriser, c’est l’inverse de développer : 6x + 15 = 3(2x + 5). On cherche un **facteur commun**.'],
  (rng) => {
    const k = rng.int(2, 9);
    const a = rng.int(1, 6);
    let b = rng.int(1, 9);
    while (gcd(a, b) !== 1) b++;
    const good = `${k}(${a === 1 ? '' : a}x + ${b})`;
    return {
      prompt: `Factorise ${k * a}x + ${k * b}.`,
      ...choice(rng, good, [
        { label: `${k}(${a === 1 ? '' : a}x + ${k * b})`, why: `Il faut diviser **les deux** termes par ${k}.` },
        { label: `${k * a}(x + ${k * b})`, why: `${k * a} ne divise pas ${k * b} ; cherche le facteur commun.` },
        { label: `${k}x(${a} + ${b})`, why: 'Le second terme ne contient pas x.' },
      ]),
      hint: `Quel nombre divise à la fois ${k * a} et ${k * b} ?`,
      steps: [
        `${k * a}x = ${k} × ${a === 1 ? '' : a}x et ${k * b} = ${k} × ${b}.`,
        `${k * a}x + ${k * b} = **${good}**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const reduire = S(
  'm4-reduire',
  'Réduire une expression',
  'Connaitre et utiliser : 1 × x = x ; x + x = 2x ; x × x = x² ; 3x + 2x = 5x ; 3x × 2x = 6x² (automatisme)',
  [
    'On regroupe les termes « en x » ensemble et les nombres ensemble : 3x + 5 + 2x − 1 = 5x + 4.',
    'Attention : 3x × 2x = 6x^2, mais 3x + 2x = 5x.',
  ],
  (rng, level) => {
    if (level === 3) {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const good = `${a * b}x^2`;
      return {
        prompt: `Réduis ${a}x × ${b}x.`,
        ...choice(rng, good, [
          { label: `${a + b}x`, why: 'C’est une multiplication : x × x = x^2.' },
          { label: `${a * b}x`, why: 'x × x = x^2.' },
          { label: `${a + b}x^2`, why: `On multiplie les nombres : ${a} × ${b}.` },
        ]),
        hint: 'Multiplie les nombres entre eux, et x × x = x^2.',
        steps: [`${a} × ${b} = ${a * b} et x × x = x^2.`, `${a}x × ${b}x = **${good}**.`],
        targetSeconds: 20,
      };
    }
    const a = rng.int(2, 9);
    const b = nonZero(rng, -9, 9);
    const c = rng.int(1, 9);
    const d = nonZero(rng, -9, 9);
    const x = a + c;
    const k = b + d;
    const good = k === 0 ? `${x}x` : `${x}x ${k < 0 ? MINUS : '+'} ${Math.abs(k)}`;
    return {
      prompt: `Réduis ${a}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)} + ${c}x ${d < 0 ? MINUS : '+'} ${Math.abs(d)}.`,
      ...choice(rng, good, [
        { label: `${x + k}x`, why: 'On ne peut pas ajouter des « x » et des nombres seuls.' },
        {
          label: k === 0 ? `${a * c}x` : `${a * c}x ${k < 0 ? MINUS : '+'} ${Math.abs(k)}`,
          why: `${a}x + ${c}x = ${x}x : on additionne.`,
        },
        { label: `${x}x ${k < 0 ? '+' : MINUS} ${Math.abs(k) || 1}`, why: 'Attention aux signes des nombres.' },
      ]),
      hint: 'Regroupe les x ensemble et les nombres ensemble.',
      steps: [
        `Les x : ${a}x + ${c}x = ${x}x. Les nombres : ${sgn(b)} + ${par(d)} = ${sgn(k)}.`,
        `Résultat : **${good}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const equationAffine = S(
  'm4-equation',
  'Résoudre ax + b = c',
  'Résoudre une équation du premier degré du type ax + b = c',
  [
    'Pour 3x + 5 = 20 : on enlève 5 des deux côtés (3x = 15), puis on divise par 3 (x = 5).',
    'Vérifie toujours : 3 × 5 + 5 = 20 ✔.',
  ],
  (rng, level) => {
    const a = level === 3 ? nonZero(rng, -9, 9) : rng.int(2, 9);
    const x = nonZero(rng, -10, 10);
    const b = nonZero(rng, -15, 15);
    const c = a * x + b;
    return {
      prompt: `Résous ${a === -1 ? MINUS : a === 1 ? '' : sgn(a)}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = ${sgn(c)}. Donne x.`,
      answer: num(x),
      traps: traps(r(x), [
        [r(c + b, a), `Pour enlever ${sgn(b)}, on fait l’opération inverse.`],
        [r(c - b), `Il faut encore diviser par ${sgn(a)}.`],
      ]),
      hint: `Enlève d’abord ${sgn(b)} des deux côtés, puis divise par ${sgn(a)}.`,
      steps: [`${sgn(a)}x = ${sgn(c)} − ${par(b)} = ${sgn(c - b)}.`, `x = ${sgn(c - b)} ÷ ${par(a)} = **${sgn(x)}**.`],
      targetSeconds: 35,
    };
  },
  { mental: true },
);

const mettreEnEquation = S(
  'm4-mise-en-equation',
  'Mettre un problème en équation',
  'Mettre en équation un problème et le résoudre à l’aide d’une équation du premier degré du type ax + b = cx + d',
  ['Choisis x (le nombre cherché), écris l’égalité de l’énoncé, puis résous : 5x + 3 = 2x + 18 → 3x = 15 → x = 5.'],
  (rng) => {
    const x = rng.int(2, 12);
    const a = rng.int(3, 7);
    const c = rng.int(1, a - 1);
    const b = rng.int(1, 15);
    const d = (a - c) * x + b;
    return {
      prompt: `Je pense à un nombre. Si je le multiplie par ${a} et que j’ajoute ${b}, j’obtiens la même chose que si je le multiplie par ${c} et que j’ajoute ${d}. Quel est ce nombre ?`,
      answer: num(x),
      traps: traps(r(x), [
        [r(d - b, a + c), `Les x sont des deux côtés : on retire ${c}x des deux côtés (${a}x − ${c}x).`],
      ]),
      hint: `Écris ${a}x + ${b} = ${c}x + ${d}, puis rassemble les x d’un côté.`,
      steps: [`${a}x + ${b} = ${c}x + ${d}, donc ${a - c}x = ${d - b}.`, `x = ${d - b} ÷ ${a - c} = **${x}**.`],
      targetSeconds: 60,
    };
  },
);

const litteral = C(
  'm4-litteral',
  'nombres',
  'Calcul littéral et équations',
  [developper, factoriser, reduire, equationAffine, mettreEnEquation],
  bossOf(
    [
      S(
        'm4-boss-litteral-forfaits',
        'Problème : deux forfaits',
        'Mettre en équation un problème et le résoudre à l’aide d’une équation du premier degré du type ax + b = cx + d',
        ['Forfait A : 2x + 10 ; forfait B : 4x. Même prix quand 2x + 10 = 4x, soit x = 5.'],
        (rng) => {
          const pa = rng.int(2, 5);
          const fee = rng.int(2, 6) * 5;
          const pb = pa + rng.pick([1, 2, 5].filter((k) => fee % k === 0));
          const x = fee / (pb - pa);
          return {
            prompt: `Club A : ${fee} € d’inscription puis ${pa} € par séance. Club B : ${pb} € par séance, sans inscription. Pour combien de séances les deux clubs coûtent-ils le même prix ?`,
            answer: num(x),
            traps: traps(r(x), [
              [r(fee, pb + pa), `Écris ${fee} + ${pa}x = ${pb}x : on soustrait ${pa}x des deux côtés.`],
            ]),
            hint: `Écris ${fee} + ${pa}x = ${pb}x.`,
            steps: [
              `${fee} + ${pa}x = ${pb}x, donc ${fee} = ${pb - pa}x.`,
              `x = ${fee} ÷ ${pb - pa} = **${x}** séances.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm4-boss-litteral-rectangle',
        'Problème : le périmètre',
        'Résoudre une équation du premier degré du type ax + b = c',
        ['Un rectangle de côtés x et x + 3 a pour périmètre 2(x + x + 3) = 4x + 6.'],
        (rng) => {
          const x = rng.int(3, 15);
          const k = rng.int(2, 6);
          const p = 2 * (x + x + k);
          return {
            prompt: `Un rectangle a une largeur x et une longueur x + ${k} (en cm). Son périmètre vaut ${p} cm. Combien vaut x ?`,
            answer: num(x, 'cm'),
            traps: traps(r(x), [[r(p - k, 2), `Le périmètre vaut 2 × (x + x + ${k}) = 4x + ${2 * k}.`]]),
            hint: `Écris 4x + ${2 * k} = ${p}.`,
            steps: [
              `2(x + x + ${k}) = 4x + ${2 * k} = ${p}, donc 4x = ${p - 2 * k}.`,
              `x = ${p - 2 * k} ÷ 4 = **${x} cm**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-litteral-piege',
        'Piège : 3 + 2x',
        'Connaitre et utiliser : 1 × x = x ; x + x = 2x ; x × x = x² ; 3x + 2x = 5x ; 3x × 2x = 6x² (automatisme)',
        ['3 + 2x ne se réduit pas en 5x : on n’ajoute pas un nombre et des « x ».'],
        (rng) => {
          const a = rng.int(2, 9);
          const b = rng.int(2, 9);
          return {
            prompt: `Peut-on réduire ${a} + ${b}x ?`,
            ...choice(rng, `Non, ${a} + ${b}x est déjà réduit`, [
              { label: `Oui : ${a + b}x`, why: `Pour x = 0 : ${a} + ${b}x vaut ${a}, mais ${a + b}x vaut 0.` },
              { label: `Oui : ${a * b}x`, why: 'On ne mélange pas les nombres et les x.' },
            ]),
            hint: 'Teste avec x = 0 : les deux écritures donnent-elles la même chose ?',
            steps: [
              `Pour x = 0 : ${a} + ${b} × 0 = ${a}, alors que ${a + b} × 0 = 0.`,
              `**Non, ${a} + ${b}x est déjà réduit**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

export const QUATRIEME_NOMBRES: readonly Chapter[] = [relatifs, rationnels, puissances, racines, litteral];
