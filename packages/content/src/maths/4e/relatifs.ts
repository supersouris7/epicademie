import { choice, distinct, nonZero, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf, MINUS, NAMES, par, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

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

export const relatifs = C(
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
