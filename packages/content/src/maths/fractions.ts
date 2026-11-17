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
    memo: [
      'La barre d’une fraction, c’est une division : {3/4} = 3 ÷ 4 = 0,75.',
      'Pense aux pièces : {1/2} € = 0,50 €, {1/4} € = 0,25 €, {3/4} € = 0,75 €, {1/10} € = 0,10 €.',
      'Un nombre a plusieurs écritures : 1,2 = 12 dixièmes = {12/10}.',
    ],
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
        hint: `Combien de dixièmes y a-t-il dans ${fmt(value)} ?`,
        steps: [
          `${fmt(value)}, c’est 1 unité et ${k - 10} dixième${k - 10 > 1 ? 's' : ''}.`,
          `1 unité = 10 dixièmes. Donc ${fmt(value)} = ${k} dixièmes.`,
          `${k} dixièmes s’écrit **${rawFrac(k, 10)}**.`,
        ],
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
      hint: `La barre de fraction veut dire « divisé par » : calcule ${n} ÷ ${d}.`,
      steps: [
        `La barre de fraction, c’est une division : ${rawFrac(n, d)} = ${n} ÷ ${d}.`,
        d === 2 || d === 4 || d === 5 || d === 10
          ? `Pense aux pièces : ${rawFrac(1, d)} d’euro = ${fmt(r(1, d))} €, donc ${rawFrac(n, d)} = ${n} × ${fmt(r(1, d))}.`
          : `On partage ${n} en ${d} parts égales.`,
        `${n} ÷ ${d} = **${fmt(v)}**`,
      ],
      targetSeconds: 10,
    };
  },
};

const quotient: Skill = {
  id: 'm5-fractions-quotient',
  title: 'La fraction comme quotient',
  lesson: {
    memo: [
      '3 × … = 7 : aucun entier ne marche. Le nombre qui marche, on l’écrit {7/3} (« 7 divisé par 3 »).',
      'C’est sa définition : 3 × {7/3} = 7. Le dénominateur « annule » la multiplication.',
    ],
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
        hint: `${rawFrac(b, a)}, c’est le nombre qui, multiplié par ${a}, donne… ?`,
        steps: [
          `${rawFrac(b, a)}, c’est « ${b} divisé par ${a} ».`,
          `Si on le multiplie par ${a}, on annule la division : on retrouve ${b}.`,
          `${a} × ${rawFrac(b, a)} = **${b}**`,
        ],
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
      hint: `Le nombre qui, multiplié par ${a}, donne ${b}, c’est « ${b} divisé par ${a} ». Comment l’écrire en fraction ?`,
      steps: [
        `On cherche le nombre qui, multiplié par ${a}, donne ${b}.`,
        `Ce nombre, c’est ${b} ÷ ${a}. En fraction : ${b} en haut, ${a} en bas.`,
        `La réponse est **${rawFrac(b, a)}** (et on vérifie : ${a} × ${rawFrac(b, a)} = ${b}).`,
      ],
      targetSeconds: 15,
    };
  },
};

const droite: Skill = {
  id: 'm5-fractions-droite',
  title: 'Fractions sur une droite graduée',
  lesson: {
    memo: [
      'Compte les **cases** (les intervalles) entre 0 et 1, pas les traits : s’il y a 3 cases, chaque case vaut {1/3}.',
      'Puis compte les cases de 0 jusqu’au point : 5 cases de {1/3}, ça fait {5/3}.',
    ],
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
      hint: 'Compte les cases entre 0 et 1 (pas les traits !), puis les cases entre 0 et A.',
      steps: [
        `Entre 0 et 1, on compte ${d} cases : chaque case vaut ${rawFrac(1, d)}.`,
        `De 0 jusqu’à A, on compte ${n} cases.`,
        `${n} cases de ${rawFrac(1, d)}, ça fait **${rawFrac(n, d)}**.`,
      ],
    };
  },
};

const egales: Skill = {
  id: 'm5-fractions-egales',
  title: 'Fractions égales',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Couper chaque part de pizza en 2 : on a 2 fois plus de parts, 2 fois plus petites. La quantité ne change pas !',
      'Donc on peut multiplier **le haut et le bas** par le même nombre : {2/3} = {4/6} = {10/15}.',
    ],
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
        hint: `Par combien a-t-on multiplié ${n} pour obtenir ${n * k} ? Fais pareil en bas.`,
        steps: [
          `En haut, ${n} est devenu ${n * k} : on a multiplié par ${k} (${n} × ${k} = ${n * k}).`,
          `Pour garder la même fraction, on multiplie aussi le bas par ${k}.`,
          `${d} × ${k} = **${d * k}**`,
        ],
      };
    }
    return {
      prompt: `Complète : ${rawFrac(n, d)} = {…/${d * k}}`,
      answer: num(n * k),
      traps: traps(r(n * k), [
        [n + (d * k - d), `On multiplie, on n’ajoute pas : ${d} × ${k} = ${d * k}, donc on calcule ${n} × ${k}.`],
        [n, 'Si le dénominateur change, le numérateur doit changer aussi.'],
      ]),
      hint: `Par combien a-t-on multiplié ${d} pour obtenir ${d * k} ? Fais pareil en haut.`,
      steps: [
        `En bas, ${d} est devenu ${d * k} : on a multiplié par ${k} (${d} × ${k} = ${d * k}).`,
        `Pour garder la même fraction, on multiplie aussi le haut par ${k}.`,
        `${n} × ${k} = **${n * k}**`,
      ],
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
      : `On met les deux fractions au même dénominateur, ${den} : ${a[1] === 1 ? `${a[0]} = ${rawFrac(a2, den)}` : a[1] === den ? `${rawFrac(a[0], a[1])} ne change pas` : `${rawFrac(a[0], a[1])} = ${rawFrac(a2, den)} (× ${den / a[1]} en haut et en bas)`} et ${b[1] === den ? `${rawFrac(b[0], b[1])} ne change pas` : `${rawFrac(b[0], b[1])} = ${rawFrac(b2, den)} (× ${den / b[1]} en haut et en bas)`}.`;
  return { den, a2, b2, line };
}

const comparer: Skill = {
  id: 'm5-fractions-comparer',
  title: 'Comparer des fractions',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Si les parts ont la même taille (même dénominateur), il suffit de compter les parts : {5/8} > {3/8}.',
      'Sinon, on redécoupe pour avoir des parts de même taille (même dénominateur), puis on compte.',
      'Astuce : compare à 1. {8/3} est plus grand que 1, {6/7} est plus petit que 1.',
    ],
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
      hint:
        a[1] === b[1]
          ? 'Les parts ont la même taille : compare simplement le nombre de parts (le numérateur).'
          : 'Les dénominateurs sont différents : mets d’abord les deux fractions au même dénominateur.',
      steps: [
        a[1] === b[1]
          ? `Même dénominateur : les parts ont la même taille, on compare juste le nombre de parts.`
          : `Les dénominateurs sont différents : les parts n’ont pas la même taille. On ne peut pas encore comparer.`,
        ...(a[1] === b[1] ? [] : [s.line]),
        `${s.a2} part${s.a2 > 1 ? 's' : ''} ${correct === '<' ? 'c’est moins que' : correct === '>' ? 'c’est plus que' : 'c’est autant que'} ${s.b2} part${s.b2 > 1 ? 's' : ''}, donc **${rawFrac(...a)} ${correct} ${rawFrac(...b)}**.`,
      ],
      targetSeconds: 25,
    };
  },
};

const entier: Skill = {
  id: 'm5-fractions-entier',
  title: 'Partie entière d’une fraction',
  lesson: {
    memo: [
      '{17/5}, c’est 17 cinquièmes. Avec 5 cinquièmes, on fait 1 unité entière.',
      'Avec 17 cinquièmes, on fait 3 unités (15 cinquièmes) et il en reste 2 : {17/5} = 3 + {2/5}.',
    ],
    source: objective(
      'Écrire une fraction sous la forme d’une somme d’un nombre entier et d’une fraction inférieure à 1 : 17/5 = 3 + 2/5',
    ),
  },
  generate(rng, level) {
    const d = rng.int(2, level === 1 ? 5 : 9);
    const q = rng.int(1, level === 1 ? 4 : 9);
    const rest = rng.int(1, d - 1);
    const n = d * q + rest;
    const steps = [
      `${d} parts de ${rawFrac(1, d)}, ça fait 1 unité entière. Combien d’unités entières avec ${n} parts ?`,
      `${d} × ${q} = ${d * q} : on fait ${q} unité${q > 1 ? 's' : ''} entière${q > 1 ? 's' : ''}, et il reste ${n} − ${d * q} = ${rest} part${rest > 1 ? 's' : ''}.`,
      `Donc ${rawFrac(n, d)} = **${q} + ${rawFrac(rest, d)}**.`,
    ];
    const hint = `Avec ${d} parts, on fait 1 unité. Combien d’unités complètes avec ${n} parts ?`;
    if (level === 3) {
      return {
        prompt: `Complète : ${rawFrac(n, d)} = ${q} + …`,
        answer: fraction(r(rest, d)),
        traps: traps(r(rest, d), [
          [r(n - q, d), `${q} = ${rawFrac(q * d, d)} : il faut enlever ${q * d} au numérateur, pas ${q}.`],
        ]),
        hint,
        steps,
      };
    }
    return {
      prompt: `Complète : ${rawFrac(n, d)} = … + ${rawFrac(rest, d)}`,
      hint,
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
      memo: [
        `Le dénominateur, c’est la **taille des parts** ; le numérateur, c’est le **nombre de parts**.`,
        `On ${minus ? 'enlève' : 'ajoute'} des parts de même taille : {5/7} ${op} {1/7} = {${minus ? 4 : 6}/7}. La taille des parts (7) ne change pas !`,
        'Si les parts n’ont pas la même taille, on redécoupe d’abord pour avoir le même dénominateur.',
      ],
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
        hint:
          a[1] === b[1]
            ? `Les parts ont la même taille : ${minus ? 'enlève' : 'ajoute'} les numérateurs et garde le dénominateur.`
            : `Mets d’abord les deux fractions au même dénominateur (un nombre qui est dans la table de ${a[1]} et de ${b[1]}).`,
        steps: [
          a[1] === b[1]
            ? `Même dénominateur : les parts ont la même taille, on peut ${minus ? 'les enlever' : 'les ajouter'} directement.`
            : `Les dénominateurs sont différents : les parts n’ont pas la même taille. Il faut redécouper !`,
          ...(a[1] === b[1] ? [] : [s.line]),
          `On ${minus ? 'enlève' : 'ajoute'} les parts : ${s.a2} ${op} ${s.b2} = ${minus ? s.a2 - s.b2 : s.a2 + s.b2}, et le dénominateur reste ${s.den}.`,
          `${rawFrac(s.a2, s.den)} ${op} ${rawFrac(s.b2, s.den)} = **${res}**${res !== frac(value) ? ` (ou **${frac(value)}** en simplifiant, les deux sont justes)` : ''}.`,
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
    memo: [
      'Le {1/3} de 18 bonbons : on partage les 18 bonbons en 3 tas égaux. Un tas = 18 ÷ 3 = 6.',
      'Les {2/3} de 18 : on prend 2 tas. 2 × 6 = 12.',
      'Le dénominateur dit en combien on partage, le numérateur combien de tas on prend.',
    ],
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
      hint: `Partage d’abord ${x} en ${d} parts égales${n > 1 ? `, puis prends-en ${n}` : ''}.`,
      steps: [
        `Le dénominateur ${d} dit : on partage ${x} en ${d} parts égales.`,
        `Une part : ${x} ÷ ${d} = ${fmt(r(x, d))}.`,
        ...(n > 1
          ? [`Le numérateur ${n} dit : on prend ${n} parts. ${n} × ${fmt(r(x, d))} = **${fmt(value)}**`]
          : [`On prend une seule part : **${fmt(value)}**`]),
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
    memo: [
      'La pizza entière, c’est 1. Coupée en 12, c’est {12/12}.',
      'Tom mange {1/4} = {3/12}, Léa {1/3} = {4/12}. Ils ont mangé {7/12}, il reste {12/12} − {7/12} = {5/12}.',
      'Dessine la pizza au brouillon : ça aide beaucoup !',
    ],
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
      hint: askRest
        ? 'Calcule d’abord ce qui a été pris en tout (même dénominateur !), puis enlève-le du tout, qui vaut 1.'
        : 'Additionne les deux fractions, après les avoir mises au même dénominateur.',
      steps: [
        a[1] === b[1] ? 'Les deux fractions ont déjà le même dénominateur.' : s.line,
        `Pris en tout : ${rawFrac(s.a2, s.den)} + ${rawFrac(s.b2, s.den)} = ${rawFrac(s.a2 + s.b2, s.den)}${rawFrac(s.a2 + s.b2, s.den) !== frac(eaten) ? ` = ${frac(eaten)}` : ''}.`,
        ...(askRest
          ? [
              `Le tout vaut 1, c’est-à-dire ${rawFrac(s.den, s.den)}.`,
              `Il reste ${rawFrac(s.den, s.den)} − ${rawFrac(s.a2 + s.b2, s.den)} = **${rawFrac(s.den - s.a2 - s.b2, s.den)}**${rawFrac(s.den - s.a2 - s.b2, s.den) !== frac(value) ? ` = **${frac(value)}**` : ''}.`,
            ]
          : [`Réponse : **${frac(value)}**.`]),
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
