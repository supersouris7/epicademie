import { choice, num, objective, traps, trueFalse } from '../build.ts';
import { dec, div, fmt, mul, r } from '../rational.ts';
import type { Chapter, Skill } from '../types.ts';

const priorites: Skill = {
  id: 'm5-priorites',
  title: 'Priorités opératoires',
  lesson: {
    body: [
      '1. On calcule d’abord **entre parenthèses**.',
      '2. Puis les **multiplications et divisions**, de gauche à droite.',
      '3. Enfin les **additions et soustractions**, de gauche à droite.',
    ],
    example: { question: 'Calcule 5 + 3 × 4.', steps: ['La multiplication d’abord : 3 × 4 = 12.', '5 + 12 = 17.'] },
    source: objective('Connaitre et utiliser les priorités opératoires'),
  },
  generate(rng, level) {
    const a = rng.int(2, 12);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    if (level === 1) {
      const minus = rng.next() < 0.4 && a + 20 > b * c;
      const A = minus ? b * c + rng.int(1, 20) : a;
      const value = minus ? A - b * c : A + b * c;
      const op = minus ? '−' : '+';
      const leftToRight = minus ? (A - b) * c : (A + b) * c;
      return {
        prompt: `Calcule ${A} ${op} ${b} × ${c}.`,
        answer: num(value),
        traps: traps(r(value), [
          [
            leftToRight,
            `Tu as calculé de gauche à droite : la multiplication est prioritaire sur ${minus ? 'la soustraction' : 'l’addition'}.`,
          ],
        ]),
        steps: [`La multiplication est prioritaire : ${b} × ${c} = ${b * c}.`, `${A} ${op} ${b * c} = **${value}**`],
      };
    }
    if (level === 2) {
      const form = rng.int(0, 2);
      if (form === 0) {
        const value = (a + b) * c;
        return {
          prompt: `Calcule (${a} + ${b}) × ${c}.`,
          answer: num(value),
          traps: traps(r(value), [
            [a + b * c, 'Les parenthèses passent avant la multiplication : on calcule d’abord ' + `${a} + ${b}.`],
          ]),
          steps: [`Parenthèses d’abord : ${a} + ${b} = ${a + b}.`, `${a + b} × ${c} = **${value}**`],
        };
      }
      if (form === 1) {
        const d = rng.int(1, 9);
        const value = a * (b + c) + d;
        return {
          prompt: `Calcule ${a} × (${b} + ${c}) + ${d}.`,
          answer: num(value),
          traps: traps(r(value), [
            [a * b + c + d, `Le ${a} multiplie toute la parenthèse ${b} + ${c}, pas seulement ${b}.`],
            [a * (b + c + d), `Le + ${d} est hors de la parenthèse : on l’ajoute à la fin.`],
          ]),
          steps: [
            `Parenthèses : ${b} + ${c} = ${b + c}.`,
            `Multiplication : ${a} × ${b + c} = ${a * (b + c)}.`,
            `Addition : ${a * (b + c)} + ${d} = **${value}**`,
          ],
        };
      }
      const A = b + c + rng.int(5, 30);
      const value = A - (b + c);
      return {
        prompt: `Calcule ${A} − (${b} + ${c}).`,
        answer: num(value),
        traps: traps(r(value), [
          [A - b + c, `On enlève **toute** la parenthèse (${b} + ${c} = ${b + c}), donc on enlève aussi ${c}.`],
        ]),
        steps: [`Parenthèses : ${b} + ${c} = ${b + c}.`, `${A} − ${b + c} = **${value}**`],
      };
    }
    const e = rng.int(2, 6);
    const d = e * rng.int(2, 9);
    const value = a + b * c - d / e;
    return {
      prompt: `Calcule ${a} + ${b} × ${c} − ${d} ÷ ${e}.`,
      answer: num(value),
      traps: traps(r(value), [
        [r((a + b) * c - d, e), 'Tu as calculé de gauche à droite : × et ÷ passent avant + et −.'],
      ]),
      steps: [
        `Multiplication et division d’abord : ${b} × ${c} = ${b * c} et ${d} ÷ ${e} = ${d / e}.`,
        `Puis de gauche à droite : ${a} + ${b * c} − ${d / e} = **${value}**`,
      ],
      targetSeconds: 30,
    };
  },
};

const vocabulaire: Skill = {
  id: 'm5-vocabulaire',
  title: 'Somme, produit, termes, facteurs',
  lesson: {
    body: [
      'Un calcul porte le nom de la **dernière opération** effectuée (en respectant les priorités).',
      '3 + 4 × 5 est une **somme** (on finit par +) ; (3 + 4) × 5 est un **produit**.',
      'Dans une somme, on additionne des **termes** ; dans un produit, on multiplie des **facteurs**.',
    ],
    example: {
      question: 'Nature de 7 × (2 + 3) ?',
      steps: [
        'On calcule d’abord 2 + 3, puis on multiplie : la dernière opération est ×.',
        'C’est un produit de facteurs 7 et (2 + 3).',
      ],
    },
    source: objective('Nommer un calcul, distinguer sommes et produits, termes et facteurs'),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const c = rng.int(2, 9);
    const names = ['une somme', 'une différence', 'un produit', 'un quotient'] as const;
    if (level === 3) {
      const asProduct = rng.next() < 0.5;
      const expr = asProduct ? `${a} × (${b} + ${c})` : `${a} + ${b} × ${c}`;
      const q = choice(
        rng,
        asProduct ? `${a} et (${b} + ${c})` : `${a} et ${b} × ${c}`,
        asProduct
          ? [
              { label: `${b} et ${c}`, why: `${b} et ${c} sont les termes de la somme dans la parenthèse.` },
              { label: `${a} et ${b}`, why: `${a} multiplie toute la parenthèse (${b} + ${c}).` },
            ]
          : [
              { label: `${a} et ${b}`, why: `La multiplication ${b} × ${c} se calcule d’abord : c’est un seul terme.` },
              { label: `${b} et ${c}`, why: `${b} et ${c} sont les facteurs du produit, pas les termes de la somme.` },
            ],
      );
      return {
        prompt: `${expr} est ${asProduct ? 'un produit' : 'une somme'}. Quels sont ses **${asProduct ? 'facteurs' : 'termes'}** ?`,
        ...q,
        steps: [
          asProduct
            ? `La dernière opération est × : les facteurs sont ${a} et (${b} + ${c}).`
            : `La dernière opération est + : les termes sont ${a} et ${b} × ${c}.`,
        ],
      };
    }
    const forms =
      level === 1
        ? [
            { expr: `${a} + ${b}`, kind: 0, last: '+' },
            { expr: `${a + b} − ${b}`, kind: 1, last: '−' },
            { expr: `${a} × ${b}`, kind: 2, last: '×' },
            { expr: `${a * b} ÷ ${b}`, kind: 3, last: '÷' },
          ]
        : [
            { expr: `${a} + ${b} × ${c}`, kind: 0, last: '+' },
            { expr: `(${a} + ${b}) × ${c}`, kind: 2, last: '×' },
            { expr: `${a} × ${b} − ${c}`, kind: 1, last: '−' },
            { expr: `${a} × (${b} − 1)`, kind: 2, last: '×' },
          ];
    const f = rng.pick(forms);
    const q = choice(
      rng,
      names[f.kind] ?? '',
      names
        .filter((_, i) => i !== f.kind)
        .map((label) => ({
          label,
          why: `La dernière opération effectuée est ${f.last} : c’est donc ${names[f.kind] ?? ''}.`,
        })),
    );
    return {
      prompt: `Le calcul ${f.expr} est…`,
      ...q,
      steps: [
        `On repère la dernière opération effectuée (priorités) : ${f.last}.`,
        `${f.expr} est **${names[f.kind] ?? ''}**.`,
      ],
      targetSeconds: 12,
    };
  },
};

const traduire: Skill = {
  id: 'm5-traduire',
  title: 'Programme de calcul en une expression',
  lesson: {
    body: [
      'On traduit chaque étape dans l’ordre. Quand une étape doit s’appliquer à **tout le résultat précédent**, on met ce résultat entre parenthèses.',
      '« Choisir 5, ajouter 3, multiplier par 4 » → (5 + 3) × 4.',
    ],
    example: {
      question: 'Choisir 6, multiplier par 2, soustraire 5.',
      steps: ['6 × 2, puis − 5 : 6 × 2 − 5 (pas de parenthèses nécessaires, × est prioritaire).'],
    },
    source: objective(
      'Traduire un problème, une succession donnée d’opérations, un programme de calcul, en une seule expression, en faisant appel ou non à des parenthèses',
    ),
  },
  generate(rng, level) {
    const x = rng.int(2, 9);
    const a = rng.int(2, 9);
    const b = rng.int(2, 6);
    if (level === 3) {
      const c = rng.int(1, 9);
      const value = (x + a) * b - c;
      return {
        prompt: `Programme : choisir ${x}, ajouter ${a}, multiplier par ${b}, enlever ${c}. Quel est le résultat ?`,
        answer: num(value),
        traps: traps(r(value), [
          [x + a * b - c, `Le « multiplier par ${b} » s’applique à tout ${x} + ${a} : il faut des parenthèses.`],
        ]),
        steps: [
          `Expression : (${x} + ${a}) × ${b} − ${c}.`,
          `= ${x + a} × ${b} − ${c} = ${(x + a) * b} − ${c} = **${value}**`,
        ],
        targetSeconds: 30,
      };
    }
    const addFirst = level === 1 || rng.next() < 0.5;
    const correct = addFirst ? `(${x} + ${a}) × ${b}` : `${x} × ${b} + ${a}`;
    const wrong = addFirst
      ? [
          { label: `${x} + ${a} × ${b}`, why: `Sans parenthèses, × ${b} ne s’applique qu’à ${a}.` },
          {
            label: `${x} × ${b} + ${a}`,
            why: 'L’ordre des étapes n’est pas respecté : on ajoute avant de multiplier.',
          },
          { label: `${x} + (${a} × ${b})`, why: `Ici aussi × ${b} ne s’applique qu’à ${a}.` },
        ]
      : [
          {
            label: `${x} × (${b} + ${a})`,
            why: `On multiplie d’abord ${x} par ${b}, puis on ajoute ${a} au résultat.`,
          },
          {
            label: `(${x} + ${a}) × ${b}`,
            why: 'L’ordre des étapes n’est pas respecté : on multiplie avant d’ajouter.',
          },
          { label: `${x} + ${a} × ${b}`, why: `Cette expression multiplie ${a} par ${b}, pas ${x}.` },
        ];
    const steps = addFirst
      ? [
          `Choisir ${x}, ajouter ${a} : ${x} + ${a}.`,
          `Multiplier **le tout** par ${b} : on met des parenthèses → **(${x} + ${a}) × ${b}**.`,
        ]
      : [
          `Choisir ${x}, multiplier par ${b} : ${x} × ${b}.`,
          `Ajouter ${a} : **${x} × ${b} + ${a}** (× est déjà prioritaire).`,
        ];
    return {
      prompt: addFirst
        ? `Programme : choisir ${x}, ajouter ${a}, puis multiplier par ${b}. Quelle expression lui correspond ?`
        : `Programme : choisir ${x}, multiplier par ${b}, puis ajouter ${a}. Quelle expression lui correspond ?`,
      ...choice(rng, correct, wrong),
      steps,
    };
  },
};

const distributivite: Skill = {
  id: 'm5-distributivite',
  title: 'Distributivité (calcul astucieux)',
  lesson: {
    body: [
      'k × (a + b) = k × a + k × b et k × (a − b) = k × a − k × b.',
      'Utile en calcul mental : 7 × 102 = 7 × 100 + 7 × 2 = 714.',
    ],
    example: { question: 'Calcule 9 × 98.', steps: ['9 × 98 = 9 × (100 − 2) = 9 × 100 − 9 × 2.', '= 900 − 18 = 882.'] },
    source: objective('Connaitre et utiliser la distributivité simple sur des exemples numériques'),
  },
  generate(rng, level) {
    const k = rng.int(3, 9);
    if (level === 3) {
      const a = rng.int(11, 89);
      const m = rng.int(3, 25);
      const value = m * 100;
      return {
        prompt: `Calcule astucieusement ${m} × ${a} + ${m} × ${100 - a}.`,
        answer: num(value),
        traps: traps(r(value), [[m * 100 * 2, `On factorise par ${m} : ${m} × (${a} + ${100 - a}) = ${m} × 100.`]]),
        steps: [
          `On factorise : ${m} × ${a} + ${m} × ${100 - a} = ${m} × (${a} + ${100 - a}).`,
          `= ${m} × 100 = **${value}**`,
        ],
        targetSeconds: 30,
      };
    }
    const small = rng.int(1, level === 1 ? 3 : 4);
    const plus = level === 1 || rng.next() < 0.5;
    const big = plus ? 100 + small : 100 - small;
    const value = k * big;
    return {
      prompt: `Calcule ${k} × ${big} de tête.`,
      answer: num(value),
      traps: traps(r(value), [
        [
          plus ? k * 100 + small : k * 100 - small,
          `Le ${k} multiplie aussi le ${small} : ${k} × ${small} = ${k * small}.`,
        ],
      ]),
      steps: [
        `${k} × ${big} = ${k} × (100 ${plus ? '+' : '−'} ${small}) = ${k} × 100 ${plus ? '+' : '−'} ${k} × ${small}.`,
        `= ${k * 100} ${plus ? '+' : '−'} ${k * small} = **${value}**`,
      ],
      targetSeconds: 25,
    };
  },
};

const multiples: Skill = {
  id: 'm5-multiples',
  title: 'Multiples et diviseurs',
  lesson: {
    body: [
      'a est un **multiple** de b (et b un **diviseur** de a) s’il existe un entier k tel que a = b × k.',
      '42 = 7 × 6 : 42 est un multiple de 7 ; 7 est un diviseur de 42.',
    ],
    example: {
      question: '5 est-il un diviseur de 32 ?',
      steps: ['5 × 6 = 30 et 5 × 7 = 35 : 32 n’est pas dans la table de 5.', 'Non, 5 n’est pas un diviseur de 32.'],
    },
    source: objective('Utiliser les notions de multiples et diviseurs'),
  },
  generate(rng, level) {
    const b = rng.int(3, level === 1 ? 9 : 12);
    if (level === 3) {
      const k = rng.int(3, 9);
      const n = b * k;
      const nonDivisors = [b + 1, k + 1, n - 1].filter((v) => v > 1 && n % v !== 0);
      const q = choice(
        rng,
        String(b),
        nonDivisors.slice(0, 3).map((v) => ({ label: String(v), why: `${n} ÷ ${v} ne tombe pas juste.` })),
      );
      return {
        prompt: `Lequel de ces nombres est un **diviseur** de ${n} ?`,
        ...q,
        steps: [`${n} = ${b} × ${k} : donc ${b} est un diviseur de ${n}.`],
      };
    }
    const isTrue = rng.next() < 0.5;
    const k = rng.int(3, 12);
    const a = isTrue ? b * k : b * k + rng.int(1, b - 1);
    const asMultiple = level === 1 || rng.next() < 0.5;
    const statement = asMultiple ? `${a} est un multiple de ${b}.` : `${b} est un diviseur de ${a}.`;
    return {
      prompt: `Vrai ou faux : ${statement}`,
      ...trueFalse(
        isTrue,
        isTrue
          ? `${a} = ${b} × ${k} : c’est vrai.`
          : `${a} n’est pas dans la table de ${b} (${b} × ${k} = ${b * k}, ${b} × ${k + 1} = ${b * (k + 1)}).`,
      ),
      steps: [
        isTrue
          ? `${a} = ${b} × ${k}, donc c’est **vrai**.`
          : `${b} × ${k} = ${b * k} et ${b} × ${k + 1} = ${b * (k + 1)} : ${a} n’est pas dans la table de ${b}, donc c’est **faux**.`,
      ],
      targetSeconds: 12,
    };
  },
};

const digitSum = (n: number) =>
  String(n)
    .split('')
    .reduce((s, d) => s + Number(d), 0);

const divisibilite: Skill = {
  id: 'm5-divisibilite',
  title: 'Critères de divisibilité',
  lesson: {
    body: [
      'Par **2** : le chiffre des unités est 0, 2, 4, 6 ou 8. Par **5** : il est 0 ou 5. Par **10** : il est 0.',
      'Par **3** : la somme des chiffres est divisible par 3. Par **9** : la somme des chiffres est divisible par 9.',
    ],
    example: {
      question: '471 est-il divisible par 3 ? par 9 ?',
      steps: ['4 + 7 + 1 = 12.', '12 est divisible par 3 mais pas par 9 : 471 est divisible par 3, pas par 9.'],
    },
    source:
      objective('Connaitre les critères de divisibilité par 3 et par 9') +
      ' ; automatisme : « Mobiliser les critères de divisibilité par 2, 5 et 10 »',
  },
  generate(rng, level) {
    const d = level === 1 ? rng.pick([2, 5, 10]) : rng.pick([3, 9]);
    const isTrue = rng.next() < 0.5;
    let n = 0;
    for (let guard = 0; guard < 200; guard++) {
      n = rng.int(level === 3 ? 1000 : 100, level === 3 ? 9999 : 999);
      // Niveau 3, critère 9 : piège « divisible par 3 mais pas par 9 ».
      if (level === 3 && d === 9 && !isTrue && !(n % 3 === 0 && n % 9 !== 0)) continue;
      if ((n % d === 0) === isTrue) break;
    }
    const s = digitSum(n);
    const unit = n % 10;
    const reason =
      d === 3 || d === 9
        ? `La somme des chiffres vaut ${String(n).split('').join(' + ')} = ${s}, ${s % d === 0 ? '' : 'qui n’est pas '}divisible par ${d}${s % d === 0 ? '' : ''}.`
        : `Le chiffre des unités est ${unit}.`;
    const whyWrong =
      level === 3 && d === 9 && !isTrue
        ? `${s} est divisible par 3 mais **pas par 9** : ${n} est divisible par 3, pas par 9.`
        : reason;
    return {
      prompt: `Vrai ou faux : ${n} est divisible par ${d}.`,
      ...trueFalse(isTrue, whyWrong),
      steps: [reason, isTrue ? '**Vrai**.' : '**Faux**.'],
      targetSeconds: 15,
    };
  },
};

const divDecimal: Skill = {
  id: 'm5-division-decimal',
  title: 'Diviser par un nombre décimal',
  lesson: {
    body: [
      'Un quotient ne change pas si on multiplie le dividende **et** le diviseur par un même nombre.',
      'Pour diviser par un décimal, on multiplie les deux par 10, 100… pour que le diviseur devienne entier.',
    ],
    example: {
      question: 'Calcule 4,2 ÷ 0,6.',
      steps: ['On multiplie les deux par 10 : 4,2 ÷ 0,6 = 42 ÷ 6.', '42 ÷ 6 = 7.'],
    },
    source: objective('Diviser par un nombre décimal'),
  },
  generate(rng, level) {
    const q = level === 3 ? dec(rng.int(11, 95), 1) : r(rng.int(2, 9));
    const divisor = level === 1 ? dec(rng.int(2, 9), 1) : level === 2 ? dec(rng.int(2, 9), 2) : dec(rng.int(2, 9), 1);
    const dividend = mul(q, divisor);
    const shift = level === 2 ? 100 : 10;
    return {
      prompt: `Calcule ${fmt(dividend)} ÷ ${fmt(divisor)}.`,
      answer: num(q),
      traps: traps(q, [
        [mul(q, r(1, 10)), `Il faut multiplier le dividende **et** le diviseur par ${shift}.`],
        [mul(q, r(1, shift)), `Il faut multiplier le dividende **et** le diviseur par ${shift}.`],
        [mul(dividend, divisor), 'C’est une division, pas une multiplication.'],
      ]),
      steps: [
        `On multiplie les deux nombres par ${shift} : ${fmt(dividend)} ÷ ${fmt(divisor)} = ${fmt(mul(dividend, r(shift)))} ÷ ${fmt(mul(divisor, r(shift)))}.`,
        `= **${fmt(div(dividend, divisor))}**`,
      ],
      targetSeconds: 30,
    };
  },
};

export const operations: Chapter = {
  id: 'm5-operations',
  subject: 'maths',
  title: 'Opérations et priorités',
  skills: [priorites, vocabulaire, traduire, distributivite, multiples, divisibilite, divDecimal],
};
