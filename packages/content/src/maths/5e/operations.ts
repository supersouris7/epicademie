import { choice, num, objective, traps, trueFalse } from '../../build.ts';
import { dec, div, fmt, mul, r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

const priorites: Skill = {
  id: 'm5-priorites',
  mental: true,
  title: 'Priorités opératoires',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Dans un calcul, il y a un ordre à respecter : d’abord **les parenthèses**, puis **× et ÷**, et à la fin **+ et −**.',
      'Exemple : 5 + 3 × 4. La multiplication passe avant : 3 × 4 = 12, puis 5 + 12 = 17 (et pas 32 !).',
      'Astuce : souligne au brouillon ce que tu calcules en premier.',
    ],
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
        hint: `Quelle opération passe en premier : ${op} ou × ?`,
        steps: [
          `Dans ${A} ${op} ${b} × ${c}, il y a ${op} et ×. La multiplication passe avant !`,
          `On calcule d’abord ${b} × ${c} = ${b * c}. Le calcul devient ${A} ${op} ${b * c}.`,
          `${A} ${op} ${b * c} = **${value}**`,
        ],
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
          hint: 'Les parenthèses passent avant tout le reste.',
          steps: [
            `Il y a des parenthèses : on commence par elles, même si × est d’habitude prioritaire.`,
            `${a} + ${b} = ${a + b}. Le calcul devient ${a + b} × ${c}.`,
            `${a + b} × ${c} = **${value}**`,
          ],
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
          hint: 'Dans l’ordre : parenthèses, puis multiplication, puis addition.',
          steps: [
            `1er : les parenthèses. ${b} + ${c} = ${b + c}. Le calcul devient ${a} × ${b + c} + ${d}.`,
            `2e : la multiplication. ${a} × ${b + c} = ${a * (b + c)}. Il reste ${a * (b + c)} + ${d}.`,
            `3e : l’addition. ${a * (b + c)} + ${d} = **${value}**`,
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
        hint: `Calcule d’abord la parenthèse : c’est tout ce paquet qu’on enlève à ${A}.`,
        steps: [
          `On commence par la parenthèse : ${b} + ${c} = ${b + c}.`,
          `On enlève tout le paquet à ${A} : ${A} − ${b + c} = **${value}**`,
        ],
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
      hint: 'Repère d’abord le × et le ÷ : ils passent avant + et −.',
      steps: [
        `× et ÷ passent avant + et − : on les calcule d’abord.`,
        `${b} × ${c} = ${b * c} et ${d} ÷ ${e} = ${d / e}. Le calcul devient ${a} + ${b * c} − ${d / e}.`,
        `Il ne reste que + et − : on va de gauche à droite. ${a} + ${b * c} = ${a + b * c}, puis ${a + b * c} − ${d / e} = **${value}**`,
      ],
      targetSeconds: 30,
    };
  },
};

const vocabulaire: Skill = {
  id: 'm5-vocabulaire',
  title: 'Somme, produit, termes, facteurs',
  lesson: {
    memo: [
      'Un calcul prend le nom de **la dernière opération** qu’on fait : + donne une somme, − une différence, × un produit, ÷ un quotient.',
      '3 + 4 × 5 : on fait 4 × 5 d’abord, puis le +. La dernière opération est +, c’est une **somme**.',
      'Les nombres d’une somme sont des **termes** ; ceux d’un produit sont des **facteurs**.',
    ],
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
        hint: asProduct
          ? `La parenthèse se calcule en entier avant de multiplier : c’est un seul bloc.`
          : `${b} × ${c} se calcule avant le + : c’est un seul bloc.`,
        steps: asProduct
          ? [
              `On regarde l’ordre de calcul : d’abord la parenthèse (${b} + ${c}), puis on multiplie par ${a}.`,
              `La parenthèse forme un seul bloc. Les deux nombres qu’on multiplie sont ${a} et (${b} + ${c}).`,
              `Les facteurs sont **${a} et (${b} + ${c})**.`,
            ]
          : [
              `On regarde l’ordre de calcul : d’abord ${b} × ${c}, puis on ajoute ${a}.`,
              `${b} × ${c} forme un seul bloc. Les deux nombres qu’on additionne sont ${a} et ${b} × ${c}.`,
              `Les termes sont **${a} et ${b} × ${c}**.`,
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
      hint: 'Fais le calcul dans ta tête : quelle opération fais-tu en dernier ?',
      steps: [
        `Pour nommer un calcul, on cherche l’opération qu’on fait **en dernier**.`,
        `Dans ${f.expr}, en respectant les priorités, la dernière opération est ${f.last}.`,
        `${f.last} donne ${names[f.kind] ?? ''} : ${f.expr} est **${names[f.kind] ?? ''}**.`,
      ],
      targetSeconds: 12,
    };
  },
};

const traduire: Skill = {
  id: 'm5-traduire',
  title: 'Programme de calcul en une expression',
  advice: 'brouillon',
  lesson: {
    memo: [
      'On écrit les étapes dans l’ordre. Si une étape s’applique à **tout ce qu’on a déjà calculé**, on le met entre parenthèses.',
      '« Choisir 5, ajouter 3, multiplier par 4 » → (5 + 3) × 4. Sans parenthèses, 5 + 3 × 4 ne multiplierait que le 3 !',
    ],
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
        hint: 'Fais les étapes une par une, dans l’ordre du programme.',
        steps: [
          `On suit le programme étape par étape, comme une recette.`,
          `On choisit ${x}, on ajoute ${a} : ${x} + ${a} = ${x + a}.`,
          `On multiplie **ce résultat** par ${b} : ${x + a} × ${b} = ${(x + a) * b}.`,
          `On enlève ${c} : ${(x + a) * b} − ${c} = **${value}**`,
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
          `On choisit ${x} et on ajoute ${a} : ça s’écrit ${x} + ${a}.`,
          `Ensuite on multiplie **tout ce résultat** par ${b}. Sans parenthèses, × ${b} ne s’appliquerait qu’à ${a} (× est prioritaire).`,
          `On protège ${x} + ${a} avec des parenthèses : **(${x} + ${a}) × ${b}**.`,
        ]
      : [
          `On choisit ${x} et on le multiplie par ${b} : ça s’écrit ${x} × ${b}.`,
          `Ensuite on ajoute ${a}. × est déjà prioritaire, donc pas besoin de parenthèses.`,
          `L’expression est **${x} × ${b} + ${a}**.`,
        ];
    return {
      prompt: addFirst
        ? `Programme : choisir ${x}, ajouter ${a}, puis multiplier par ${b}. Quelle expression lui correspond ?`
        : `Programme : choisir ${x}, multiplier par ${b}, puis ajouter ${a}. Quelle expression lui correspond ?`,
      ...choice(rng, correct, wrong),
      hint: addFirst
        ? `La multiplication doit s’appliquer à tout ${x} + ${a}. Comment l’écrire ?`
        : `Souviens-toi : × se calcule avant +, même sans parenthèses.`,
      steps,
    };
  },
};

const distributivite: Skill = {
  id: 'm5-distributivite',
  mental: true,
  title: 'Distributivité (calcul astucieux)',
  lesson: {
    memo: [
      '7 × 102, c’est 7 fois 100 **plus** 7 fois 2 : 700 + 14 = 714. On découpe le nombre difficile en morceaux faciles.',
      'Ça marche aussi avec − : 9 × 98 = 9 × 100 − 9 × 2 = 900 − 18 = 882.',
      'Attention : le 7 multiplie **chaque morceau**, pas seulement le 100 !',
    ],
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
        hint: `Le ${m} revient deux fois. Et que vaut ${a} + ${100 - a} ?`,
        steps: [
          `On a ${a} fois ${m}, plus ${100 - a} fois ${m}.`,
          `En tout, ça fait (${a} + ${100 - a}) fois ${m}, soit 100 fois ${m} : ${m} × (${a} + ${100 - a}) = ${m} × 100.`,
          `${m} × 100 = **${value}**. Pas besoin de calculer ${m} × ${a} !`,
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
      hint: `Découpe ${big} en 100 ${plus ? '+' : '−'} ${small}, et multiplie chaque morceau par ${k}.`,
      steps: [
        `${big} est proche de 100 : ${big} = 100 ${plus ? '+' : '−'} ${small}.`,
        `${k} fois ${big}, c’est ${k} fois 100, ${plus ? 'plus' : 'moins'} ${k} fois ${small} : ${k} × 100 = ${k * 100} et ${k} × ${small} = ${k * small}.`,
        `${k * 100} ${plus ? '+' : '−'} ${k * small} = **${value}**`,
      ],
      targetSeconds: 25,
    };
  },
};

const multiples: Skill = {
  id: 'm5-multiples',
  mental: true,
  title: 'Multiples et diviseurs',
  lesson: {
    memo: [
      '42 est dans la table de 7 (7 × 6 = 42). On dit : 42 est un **multiple** de 7, et 7 est un **diviseur** de 42.',
      'Pour vérifier, on cherche le nombre dans la table : 32 n’est pas dans la table de 5 (5 × 6 = 30, 5 × 7 = 35), donc 5 ne divise pas 32.',
    ],
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
        hint: `Un diviseur de ${n}, c’est un nombre dont la table contient ${n}.`,
        steps: [
          `On cherche un nombre dont la table contient ${n}.`,
          `${b} × ${k} = ${n} : ${n} est dans la table de ${b}.`,
          `Donc **${b}** est un diviseur de ${n}.`,
        ],
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
      hint: `Est-ce que ${a} est dans la table de ${b} ?`,
      steps: [
        `On se demande : ${a} est-il dans la table de ${b} ?`,
        isTrue
          ? `${b} × ${k} = ${a}. Oui, il y est !`
          : `${b} × ${k} = ${b * k} et ${b} × ${k + 1} = ${b * (k + 1)} : on saute par-dessus ${a}. Il n’y est pas.`,
        isTrue ? `Donc c’est **vrai**.` : `Donc c’est **faux**.`,
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
  mental: true,
  title: 'Critères de divisibilité',
  lesson: {
    memo: [
      'Par 2, 5 et 10, on regarde **le dernier chiffre** : pair pour 2 ; 0 ou 5 pour 5 ; 0 pour 10.',
      'Par 3 et 9, on **additionne les chiffres** : 471 → 4 + 7 + 1 = 12. 12 est dans la table de 3 mais pas de 9, donc 471 est divisible par 3, pas par 9.',
    ],
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
        ? `${String(n).split('').join(' + ')} = ${s}. ${s} ${s % d === 0 ? 'est' : 'n’est pas'} dans la table de ${d}.`
        : `Le dernier chiffre de ${n} est ${unit}${n % d === 0 ? ' : ça marche' : ' : ça ne marche pas'}.`;
    const whyWrong =
      level === 3 && d === 9 && !isTrue
        ? `${s} est divisible par 3 mais **pas par 9** : ${n} est divisible par 3, pas par 9.`
        : reason;
    return {
      prompt: `Vrai ou faux : ${n} est divisible par ${d}.`,
      ...trueFalse(isTrue, whyWrong),
      hint:
        d === 3 || d === 9
          ? `Pour ${d}, additionne les chiffres de ${n}.`
          : `Pour ${d}, regarde seulement le dernier chiffre de ${n}.`,
      steps: [
        d === 3 || d === 9
          ? `Pour savoir si un nombre est divisible par ${d}, on additionne ses chiffres.`
          : `Pour savoir si un nombre est divisible par ${d}, on regarde son dernier chiffre : il doit être ${d === 2 ? '0, 2, 4, 6 ou 8' : d === 5 ? '0 ou 5' : '0'}.`,
        reason,
        isTrue ? `Donc c’est **vrai**.` : `Donc c’est **faux**.`,
      ],
      targetSeconds: 15,
    };
  },
};

const divDecimal: Skill = {
  id: 'm5-division-decimal',
  mental: true,
  title: 'Diviser par un nombre décimal',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Diviser par un nombre à virgule, c’est difficile. Alors on se débarrasse de la virgule !',
      'On multiplie **les deux nombres** par 10 (ou 100) : le résultat ne change pas. 4,2 ÷ 0,6 = 42 ÷ 6 = 7.',
      'C’est comme partager : 42 bonbons pour 6, ou 4,2 kg pour 0,6 kg, ça fait le même nombre de parts.',
    ],
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
      hint: `Multiplie les deux nombres par ${shift} pour que ${fmt(divisor)} n’ait plus de virgule.`,
      steps: [
        `${fmt(divisor)} a une virgule : on s’en débarrasse en multipliant **les deux nombres** par ${shift}.`,
        `${fmt(dividend)} × ${shift} = ${fmt(mul(dividend, r(shift)))} et ${fmt(divisor)} × ${shift} = ${fmt(mul(divisor, r(shift)))}. Le calcul devient ${fmt(mul(dividend, r(shift)))} ÷ ${fmt(mul(divisor, r(shift)))}.`,
        `${fmt(mul(dividend, r(shift)))} ÷ ${fmt(mul(divisor, r(shift)))} = **${fmt(div(dividend, divisor))}** (vérifie : ${fmt(mul(divisor, r(shift)))} × ${fmt(div(dividend, divisor))} = ${fmt(mul(dividend, r(shift)))}).`,
      ],
      targetSeconds: 30,
    };
  },
};

export const operations: Chapter = {
  id: 'm5-operations',
  subject: 'maths',
  grade: '5e',
  domain: 'nombres',
  title: 'Opérations et priorités',
  skills: [priorites, vocabulaire, traduire, distributivite, multiples, divisibilite, divDecimal],
};
