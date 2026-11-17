import { choice, fraction, num, objective, traps } from '../build.ts';
import { add, cmp, fmt, frac, lcm, mul, r, rawFrac, sub, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Chapter, Level, Skill } from '../types.ts';

const SIMPLE: readonly [number, number][] = [
  [1, 2],
  [1, 4],
  [3, 4],
  [3, 2],
  [4, 2],
  [5, 2],
  [1, 10],
  [100, 100],
  [7, 1],
  [1, 5],
  [2, 5],
  [7, 10],
];

const decimales: Skill = {
  id: 'm5-fractions-decimales',
  title: 'Fractions et écriture décimale',
  lesson: {
    body: [
      'Une fraction est un quotient : {3/4} = 3 ÷ 4 = 0,75.',
      'À connaître : {1/2} = 0,5 ; {1/4} = 0,25 ; {3/4} = 0,75 ; {3/2} = 1,5 ; {5/2} = 2,5 ; {1/10} = 0,1 ; {1/5} = 0,2.',
      'Un même nombre a plusieurs écritures : 1,2 = {12/10} = {6/5} = 1 + {1/5} = 120 %.',
    ],
    example: { question: 'Écris {5/2} sous forme décimale.', steps: ['{5/2} = 5 ÷ 2 = 2,5.'] },
    source: objective(
      'Entretenir l’écriture décimale des fractions simples. Écrire un même nombre sous de multiples formes',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const k = rng.int(11, 19);
      const value = r(k, 10);
      const wrongForm = rawFrac(k, 100);
      const correct = rawFrac(k, 10);
      return {
        prompt: `Laquelle de ces écritures est égale à ${fmt(value)} ?`,
        ...choice(rng, correct, [
          { label: wrongForm, why: `${rawFrac(k, 100)} = ${fmt(r(k, 100))} : c’est 10 fois trop petit.` },
          { label: `${k} %`, why: `${k} % = ${rawFrac(k, 100)} = ${fmt(r(k, 100))}. Il faudrait ${k * 10} %.` },
          {
            label: `1 + ${rawFrac(k - 10, 100)}`,
            why: `${rawFrac(k - 10, 100)} = ${fmt(r(k - 10, 100))}, donc 1 + ${rawFrac(k - 10, 100)} = ${fmt(add(r(1), r(k - 10, 100)))}.`,
          },
        ]),
        steps: [`${fmt(value)} = ${k} dixièmes = **${rawFrac(k, 10)}**.`],
      };
    }
    const pool = level === 1 ? SIMPLE.slice(0, 7) : SIMPLE;
    const [n, d] = rng.pick(pool);
    const v = r(n, d);
    return {
      prompt: `Écris ${rawFrac(n, d)} sous forme décimale.`,
      answer: num(v),
      traps: traps(v, [
        [
          r(Number(`${n}${d}`) || 0, 10 ** String(d).length),
          `${rawFrac(n, d)} n’est pas « ${n},${d} » : c’est ${n} ÷ ${d}.`,
        ],
        [r(d, n), `C’est ${n} ÷ ${d}, pas ${d} ÷ ${n}.`],
      ]),
      steps: [`${rawFrac(n, d)} = ${n} ÷ ${d} = **${fmt(v)}**`],
      targetSeconds: 10,
    };
  },
};

const quotient: Skill = {
  id: 'm5-fractions-quotient',
  title: 'La fraction comme quotient',
  lesson: {
    body: [
      '{7/3} est le nombre qui, multiplié par 3, donne 7 : 3 × {7/3} = 7.',
      'Pour compléter 3 × … = 7, on écrit donc … = {7/3}.',
    ],
    example: { question: 'Complète : 5 × … = 2.', steps: ['Le nombre cherché est 2 ÷ 5 = {2/5}.'] },
    source: objective(
      'Faire vivre la notion de nombre quotient en complétant des multiplications à trou : 3 × … = 7 puis 3 × 7/3 = …',
    ),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    let b = rng.int(1, 12);
    while (b % a === 0) b = rng.int(1, 12);
    if (level === 2 && rng.next() < 0.5) {
      return {
        prompt: `Calcule ${a} × ${rawFrac(b, a)}.`,
        answer: num(b),
        traps: traps(r(b), [[a * b, `${rawFrac(b, a)} est le nombre qui, multiplié par ${a}, donne ${b}.`]]),
        steps: [`Par définition du quotient, ${a} × ${rawFrac(b, a)} = **${b}**.`],
        targetSeconds: 10,
      };
    }
    const value = r(b, a);
    return {
      prompt: `Complète : ${a} × … = ${b}`,
      answer: fraction(value),
      traps: traps(value, [
        [r(a, b), `C’est ${b} ÷ ${a}, donc ${rawFrac(b, a)}, pas ${rawFrac(a, b)}.`],
        [b - a, 'C’est une multiplication à trou, pas une addition.'],
      ]),
      steps: [
        `Le nombre cherché est ${b} ÷ ${a}, qui s’écrit **${rawFrac(b, a)}**.`,
        `Vérification : ${a} × ${rawFrac(b, a)} = ${b}.`,
      ],
      targetSeconds: 15,
    };
  },
};

const droite: Skill = {
  id: 'm5-fractions-droite',
  title: 'Fractions sur une droite graduée',
  lesson: {
    body: [
      'Si l’unité est partagée en d parts égales, chaque graduation vaut {1/d}.',
      'Un point situé à n graduations de zéro a pour abscisse {n/d}.',
    ],
    example: {
      question: 'Unité partagée en 3 ; A est à 5 graduations de 0.',
      steps: ['Une graduation vaut {1/3}.', 'A a pour abscisse {5/3}.'],
    },
    source: objective('Lire l’abscisse d’un point sur une droite graduée en tiers, en quarts, en moitiés, en dixièmes'),
  },
  generate(rng, level) {
    const d = level === 1 ? rng.pick([2, 4]) : level === 2 ? rng.pick([3, 4, 5]) : rng.pick([3, 6, 10]);
    const max = level === 3 ? 2 : 3;
    let n = rng.int(1, max * d - 1);
    while (n % d === 0) n = rng.int(1, max * d - 1);
    const value = r(n, d);
    return {
      prompt: 'Quelle est l’abscisse du point **A** ? (écris-la en fraction)',
      figure: {
        kind: 'numberLine',
        min: 0,
        max,
        subdivisions: d,
        labels: Array.from({ length: max + 1 }, (_, i) => i),
        points: [{ name: 'A', at: n / d }],
      },
      answer: fraction(value),
      traps: traps(value, [
        [r(n, d + 1), `L’unité est partagée en ${d} parts (compte les intervalles, pas les traits).`],
        [r(n, 10), `Une graduation vaut ${rawFrac(1, d)}, pas ${rawFrac(1, 10)}.`],
      ]),
      steps: [
        `L’unité est partagée en ${d} : une graduation vaut ${rawFrac(1, d)}.`,
        `A est à ${n} graduations de 0 : son abscisse est **${rawFrac(n, d)}**.`,
      ],
    };
  },
};

const egales: Skill = {
  id: 'm5-fractions-egales',
  title: 'Fractions égales',
  advice: 'brouillon',
  lesson: {
    body: [
      'On ne change pas une fraction en multipliant (ou divisant) le numérateur **et** le dénominateur par un même nombre non nul.',
      '{2/3} = {2 × 5/3 × 5} = {10/15}.',
    ],
    example: {
      question: 'Complète : {4/7} = {…/14}.',
      steps: ['7 × 2 = 14, donc on multiplie aussi 4 par 2.', '{4/7} = {8/14}.'],
    },
    source: objective('Reconnaitre des fractions égales : 2/3 = …/15 ; 4/7 = …/14'),
  },
  generate(rng, level) {
    const d = rng.int(2, 9);
    let n = rng.int(1, d * 2);
    while (n % d === 0) n = rng.int(1, d * 2);
    const k = rng.int(2, level === 1 ? 4 : 9);
    const askDen = level === 3 && rng.next() < 0.5;
    if (askDen) {
      return {
        prompt: `Complète : ${rawFrac(n, d)} = {${n * k}/…}`,
        answer: num(d * k),
        traps: traps(r(d * k), [
          [d + (n * k - n), `On multiplie, on n’ajoute pas : ${n} × ${k} = ${n * k}, donc ${d} × ${k}.`],
        ]),
        steps: [`${n} × ${k} = ${n * k} : on multiplie aussi le dénominateur par ${k}.`, `${d} × ${k} = **${d * k}**`],
      };
    }
    return {
      prompt: `Complète : ${rawFrac(n, d)} = {…/${d * k}}`,
      answer: num(n * k),
      traps: traps(r(n * k), [
        [n + (d * k - d), `On multiplie, on n’ajoute pas : ${d} × ${k} = ${d * k}, donc on calcule ${n} × ${k}.`],
        [n, 'Si le dénominateur change, le numérateur doit changer aussi.'],
      ]),
      steps: [`${d} × ${k} = ${d * k} : on multiplie aussi le numérateur par ${k}.`, `${n} × ${k} = **${n * k}**`],
      targetSeconds: 15,
    };
  },
};

/** Fraction aléatoire (n/d, d ∈ dens), non entière. */
function randomFrac(rng: Rng, dens: readonly number[], maxN?: number): [number, number] {
  const d = rng.pick(dens);
  let n = rng.int(1, maxN ?? d * 2);
  while (n % d === 0) n = rng.int(1, maxN ?? d * 2);
  return [n, d];
}

function commonDenSteps(
  a: [number, number],
  b: [number, number],
): { den: number; a2: number; b2: number; line: string } {
  const den = lcm(a[1], b[1]);
  const a2 = a[0] * (den / a[1]);
  const b2 = b[0] * (den / b[1]);
  const line =
    a[1] === b[1]
      ? 'Les dénominateurs sont déjà égaux.'
      : `Même dénominateur ${den} : ${rawFrac(a[0], a[1])} = ${rawFrac(a2, den)} et ${rawFrac(b[0], b[1])} = ${rawFrac(b2, den)}.`;
  return { den, a2, b2, line };
}

const comparer: Skill = {
  id: 'm5-fractions-comparer',
  title: 'Comparer des fractions',
  advice: 'brouillon',
  lesson: {
    body: [
      'Même dénominateur : la plus grande est celle qui a le plus grand numérateur.',
      'Sinon, on les met **au même dénominateur**, ou on les compare à 1 ({8/3} > 1 > {6/7}).',
      'Même numérateur : la plus grande est celle qui a le plus **petit** dénominateur ({8/12} > {8/21}).',
    ],
    example: {
      question: 'Compare {3/4} et {7/18}.',
      steps: ['Au dénominateur 36 : {3/4} = {27/36} et {7/18} = {14/36}.', '27 > 14, donc {3/4} > {7/18}.'],
    },
    source: objective('Comparer des fractions'),
  },
  generate(rng, level) {
    let a: [number, number];
    let b: [number, number];
    if (level === 1) {
      const d = rng.int(3, 12);
      a = [rng.int(1, d * 2), d];
      b = [rng.int(1, d * 2), d];
      while (b[0] === a[0]) b = [rng.int(1, d * 2), d];
    } else if (level === 2) {
      const d = rng.int(2, 6);
      const k = rng.int(2, 4);
      a = randomFrac(rng, [d]);
      b = randomFrac(rng, [d * k]);
      if (rng.next() < 0.5) [a, b] = [b, a];
    } else {
      a = randomFrac(rng, [3, 4, 5, 6, 7, 8, 9]);
      b = randomFrac(rng, [3, 4, 5, 6, 7, 8, 9, 12]);
    }
    const c = cmp(r(...a), r(...b));
    const signs = ['<', '=', '>'];
    const correct = signs[c + 1] ?? '=';
    const s = commonDenSteps(a, b);
    const naive = cmp(r(a[0]), r(b[0]));
    return {
      prompt: `Compare : ${rawFrac(...a)} … ${rawFrac(...b)}`,
      ...choice(
        rng,
        correct,
        signs
          .filter((x) => x !== correct)
          .map((label) => ({
            label,
            why:
              signs[naive + 1] === label && a[1] !== b[1]
                ? 'On ne compare pas les numérateurs si les dénominateurs sont différents : il faut d’abord le même dénominateur.'
                : `Au même dénominateur : ${rawFrac(s.a2, s.den)} et ${rawFrac(s.b2, s.den)}.`,
          })),
        true,
      ),
      steps: [s.line, `${s.a2} ${correct} ${s.b2}, donc **${rawFrac(...a)} ${correct} ${rawFrac(...b)}**.`],
      targetSeconds: 25,
    };
  },
};

const entier: Skill = {
  id: 'm5-fractions-entier',
  title: 'Partie entière d’une fraction',
  lesson: {
    body: [
      'Pour écrire {17/5} = 3 + {2/5} : dans 17, combien de fois 5 ? 3 fois (15), reste 2.',
      'C’est la division euclidienne : 17 = 5 × 3 + 2.',
    ],
    example: {
      question: 'Écris {23/4} comme entier + fraction inférieure à 1.',
      steps: ['23 = 4 × 5 + 3.', '{23/4} = 5 + {3/4}.'],
    },
    source: objective(
      'Écrire une fraction sous la forme d’une somme d’un nombre entier et d’une fraction inférieure à 1 : 17/5 = 3 + 2/5',
    ),
  },
  generate(rng, level) {
    const d = rng.int(2, level === 1 ? 5 : 9);
    const q = rng.int(1, level === 1 ? 4 : 9);
    const rest = rng.int(1, d - 1);
    const n = d * q + rest;
    const steps = [`${n} = ${d} × ${q} + ${rest}.`, `Donc ${rawFrac(n, d)} = **${q} + ${rawFrac(rest, d)}**.`];
    if (level === 3) {
      return {
        prompt: `Complète : ${rawFrac(n, d)} = ${q} + …`,
        answer: fraction(r(rest, d)),
        traps: traps(r(rest, d), [
          [r(n - q, d), `${q} = ${rawFrac(q * d, d)} : il faut enlever ${q * d} au numérateur, pas ${q}.`],
        ]),
        steps,
      };
    }
    return {
      prompt: `Complète : ${rawFrac(n, d)} = … + ${rawFrac(rest, d)}`,
      answer: num(q),
      traps: traps(r(q), [
        [rest, `${rest} est le reste : on cherche combien de fois ${d} « rentre » dans ${n}.`],
        [q + 1, `${d} × ${q + 1} = ${d * (q + 1)} dépasse ${n}.`],
      ]),
      steps,
      targetSeconds: 15,
    };
  },
};

function addSubSkill(id: string, title: string, minus: boolean): Skill {
  const op = minus ? '−' : '+';
  return {
    id,
    title,
    advice: 'brouillon',
    lesson: {
      body: [
        `On ne peut ${minus ? 'soustraire' : 'additionner'} que des fractions de **même dénominateur** : on ${minus ? 'soustrait' : 'additionne'} les numérateurs et on garde le dénominateur.`,
        'Sinon, on met d’abord au même dénominateur (un multiple commun).',
        'Erreur classique : ' +
          (minus ? '{5/6} − {1/2} n’est pas {4/4}' : '{1/2} + {1/3} n’est pas {2/5}') +
          ' ; on n’ajoute jamais les dénominateurs.',
      ],
      example: minus
        ? { question: 'Calcule {4/7} − {2/21}.', steps: ['{4/7} = {12/21}.', '{12/21} − {2/21} = {10/21}.'] }
        : {
            question: 'Calcule {2/5} + {1/4}.',
            steps: ['Dénominateur commun 20 : {2/5} = {8/20} et {1/4} = {5/20}.', '{8/20} + {5/20} = {13/20}.'],
          },
      source: objective('Additionner et soustraire des fractions de dénominateurs quelconques'),
    },
    generate(rng, level) {
      let a: [number, number];
      let b: [number, number];
      if (level === 1) {
        const d = rng.int(3, 12);
        a = [rng.int(1, d - 1), d];
        b = [rng.int(1, d - 1), d];
      } else if (level === 2) {
        const d = rng.int(2, 7);
        a = randomFrac(rng, [d], d);
        b = randomFrac(rng, [d * rng.int(2, 3)]);
        if (rng.next() < 0.5) [a, b] = [b, a];
      } else if (rng.next() < 0.3) {
        // entier ± fraction (3 + 2/5 ; 1 − 2/3)
        const k = minus ? rng.int(1, 3) : rng.int(1, 4);
        a = [k, 1];
        b = randomFrac(rng, [3, 4, 5, 6, 7], minus ? rng.int(1, 3) : undefined);
        if (minus) b = [Math.min(b[0], b[1] - 1) || 1, b[1]];
      } else {
        a = randomFrac(rng, [2, 3, 4, 5, 6]);
        b = randomFrac(rng, [3, 4, 5, 7]);
        while (b[1] === a[1]) b = randomFrac(rng, [3, 4, 5, 7]);
      }
      if (minus && cmp(r(...a), r(...b)) < 0) [a, b] = [b, a];
      const value = minus ? sub(r(...a), r(...b)) : add(r(...a), r(...b));
      const s = commonDenSteps(a, b);
      const wrongBoth: Rational | null =
        a[1] + (minus ? -b[1] : b[1]) > 0 ? r(a[0] + (minus ? -b[0] : b[0]), a[1] + (minus ? -b[1] : b[1])) : null;
      const t: [Rational, string][] = [];
      if (wrongBoth)
        t.push([
          wrongBoth,
          `On ne ${minus ? 'soustrait' : 'additionne'} pas les dénominateurs : on met au même dénominateur, puis on ${minus ? 'soustrait' : 'additionne'} seulement les numérateurs.`,
        ]);
      if (a[1] !== b[1]) {
        const naive = r(a[0] + (minus ? -b[0] : b[0]), Math.max(a[1], b[1]));
        t.push([
          naive,
          'Il faut d’abord transformer les deux fractions pour qu’elles aient le même dénominateur (multiplier numérateur **et** dénominateur).',
        ]);
      }
      const show = (x: [number, number]) => (x[1] === 1 ? String(x[0]) : rawFrac(...x));
      const res = rawFrac(minus ? s.a2 - s.b2 : s.a2 + s.b2, s.den);
      return {
        prompt: `Calcule ${show(a)} ${op} ${show(b)}.`,
        answer: fraction(value),
        traps: traps(value, t),
        steps: [
          s.line,
          `${rawFrac(s.a2, s.den)} ${op} ${rawFrac(s.b2, s.den)} = ${res}${res !== frac(value) ? ` = ${frac(value)}` : ''}.`,
          `Résultat : **${frac(value)}**${value.d !== 1 && (minus ? s.a2 - s.b2 : s.a2 + s.b2) !== value.n ? ' (toute fraction égale est acceptée)' : ''}.`,
        ],
        targetSeconds: level === 1 ? 15 : 40,
      };
    },
  };
}

const addition = addSubSkill('m5-fractions-addition', 'Additionner des fractions', false);
const soustraction = addSubSkill('m5-fractions-soustraction', 'Soustraire des fractions', true);

const dunNombre: Skill = {
  id: 'm5-fractions-dun-nombre',
  title: 'Prendre une fraction d’un nombre',
  lesson: {
    body: [
      'Le {1/3} de 18, c’est 18 partagé en 3 : 18 ÷ 3 = 6.',
      'Les {2/3} de 18, c’est 2 fois le tiers : 2 × 6 = 12.',
    ],
    example: {
      question: 'Calcule les {3/4} de 30.',
      steps: ['Le quart de 30 : 30 ÷ 4 = 7,5.', 'Les trois quarts : 3 × 7,5 = 22,5.'],
    },
    source: objective('Prendre une fraction simple d’un nombre : le 1/3 de 18 ; le 1/4 de 12'),
  },
  generate(rng, level) {
    // Niveau 3 : résultat décimal (dénominateur 2, 4, 5 ou 10 et nombre non multiple).
    const d = level === 3 ? rng.pick([2, 4, 5, 10]) : rng.int(2, level === 1 ? 5 : 8);
    const n = level === 1 || d === 2 ? 1 : rng.int(2, d - 1);
    const x = level === 3 ? rng.int(1, 9) * d + rng.int(1, d - 1) : rng.int(2, 12) * d;
    const value = mul(r(n, d), r(x));
    return {
      prompt: `Calcule ${n === 1 ? 'le' : 'les'} ${rawFrac(n, d)} de ${x}.`,
      answer: num(value),
      traps: traps(value, [
        [r(x, d), `C’est seulement ${rawFrac(1, d)} de ${x} : il faut encore multiplier par ${n}.`],
        [mul(r(x), r(n)), `Il faut d’abord partager ${x} en ${d}.`],
      ]),
      steps: [
        `${rawFrac(1, d)} de ${x} : ${x} ÷ ${d} = ${fmt(r(x, d))}.`,
        ...(n > 1
          ? [`${rawFrac(n, d)} de ${x} : ${n} × ${fmt(r(x, d))} = **${fmt(value)}**`]
          : [`Résultat : **${fmt(value)}**`]),
      ],
      targetSeconds: 15,
    };
  },
};

const problemes: Skill = {
  id: 'm5-fractions-problemes',
  title: 'Problèmes avec des fractions',
  advice: 'brouillon',
  lesson: {
    body: [
      'Le tout correspond à 1 : si on a utilisé {1/4} puis {1/3}, il reste 1 − ({1/4} + {1/3}).',
      'On additionne ou soustrait les fractions après les avoir mises au même dénominateur.',
    ],
    example: {
      question: 'Tom mange {1/4} d’une pizza, Léa {1/3}. Quelle part reste-t-il ?',
      steps: ['Mangé : {1/4} + {1/3} = {3/12} + {4/12} = {7/12}.', 'Reste : 1 − {7/12} = {5/12}.'],
    },
    source: objective('Résoudre des problèmes avec des additions et soustractions de fractions'),
  },
  generate(rng, level) {
    const names = rng.shuffle(['Inès', 'Noah', 'Jade', 'Sacha', 'Léo', 'Maya']);
    const thing = rng.pick(['d’une pizza', 'd’un gâteau', 'd’une tablette de chocolat', 'du trajet']);
    const a = randomFrac(rng, level === 1 ? [6] : [2, 3, 4, 5], 1);
    let b = randomFrac(rng, level === 1 ? [6] : [3, 4, 6, 8], 1);
    while (cmp(add(r(...a), r(...b)), r(1)) >= 0) b = [1, b[1] * 2];
    const eaten = add(r(...a), r(...b));
    const askRest = level >= 2;
    const value = askRest ? sub(r(1), eaten) : eaten;
    const s = commonDenSteps(a, b);
    const verb = thing === 'du trajet' ? 'parcourt' : 'mange';
    return {
      prompt: `${names[0] ?? 'Inès'} ${verb} ${rawFrac(...a)} ${thing}, puis ${names[1] ?? 'Noah'} ${verb} ${rawFrac(...b)} ${thing}. ${askRest ? 'Quelle fraction reste-t-il ?' : 'Quelle fraction en tout ?'}`,
      answer: fraction(value),
      traps: traps(value, [
        [r(a[0] + b[0], a[1] + b[1]), 'On n’additionne pas les dénominateurs : il faut un dénominateur commun.'],
        ...(askRest
          ? ([[eaten, `${frac(eaten)} est la part utilisée ; il reste 1 − ${frac(eaten)}.`]] as [Rational, string][])
          : []),
      ]),
      steps: [
        s.line,
        `En tout : ${rawFrac(s.a2, s.den)} + ${rawFrac(s.b2, s.den)} = ${frac(eaten)}.`,
        ...(askRest ? [`Il reste 1 − ${frac(eaten)} = **${frac(value)}**.`] : [`Réponse : **${frac(value)}**.`]),
      ],
      targetSeconds: 60,
    };
  },
};

export const fractions: Chapter = {
  id: 'm5-fractions',
  subject: 'maths',
  domain: 'nombres',
  title: 'Fractions',
  skills: [decimales, quotient, droite, egales, comparer, entier, addition, soustraction, dunNombre, problemes],
};

export type { Level };
