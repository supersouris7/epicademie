import { BO_MATHS, num, objective, traps } from '../build.ts';
import { add, dec, fmt, mul, r, sub } from '../rational.ts';
import type { Chapter, Skill } from '../types.ts';

const tables: Skill = {
  id: 'm5-tables',
  title: 'Tables de multiplication',
  lesson: {
    body: [
      'Les tables doivent venir **sans calculer** : elles servent partout (fractions, divisibilité, calcul mental).',
      'Astuces : a × b = b × a (on peut retourner) ; × 9 = × 10 − une fois le nombre ; × 5 = moitié de × 10.',
    ],
    example: { question: 'Calcule 7 × 8.', steps: ['7 × 8 = 56 (« 5, 6, 7, 8 » : 56 = 7 × 8).'] },
    source: objective('Entretenir la connaissance et l’utilisation des tables de multiplication'),
  },
  generate(rng, level) {
    const pool = level === 1 ? [2, 3, 4, 5, 10] : level === 2 ? [6, 7, 8, 9] : [6, 7, 8, 9, 11, 12];
    const a = rng.pick(pool);
    const b = rng.int(level === 1 ? 2 : 3, level === 3 ? 12 : 10);
    const p = a * b;
    if (level === 3 && rng.next() < 0.5) {
      return {
        prompt: `Complète : ${a} × … = ${p}`,
        answer: num(b),
        traps: traps(r(b), [[p - a, `${a} × ${b - 1} = ${p - a}, il manque encore ${a}.`]]),
        steps: [`On cherche combien de fois ${a} dans ${p}.`, `${a} × ${b} = ${p}, donc il manque **${b}**.`],
        targetSeconds: 8,
      };
    }
    return {
      prompt: `Calcule ${a} × ${b}.`,
      answer: num(p),
      traps: traps(r(p), [
        [a + b, `Tu as additionné ${a} et ${b} au lieu de les multiplier.`],
        [a * (b - 1), `${a} × ${b - 1} = ${a * (b - 1)} : tu t’es arrêté une ligne trop tôt dans la table.`],
        [a * (b + 1), `${a} × ${b + 1} = ${a * (b + 1)} : une ligne trop loin dans la table.`],
      ]),
      steps: [`${a} × ${b} = **${p}**`],
      targetSeconds: 6,
    };
  },
};

const euclide: Skill = {
  id: 'm5-euclide',
  title: 'Division euclidienne',
  advice: 'brouillon',
  lesson: {
    body: [
      'Diviser a par b (division euclidienne), c’est trouver le **quotient** q et le **reste** r tels que a = b × q + r avec r < b.',
      'Le reste est toujours **plus petit que le diviseur**.',
    ],
    example: {
      question: 'Division euclidienne de 17 par 5.',
      steps: ['5 × 3 = 15 ≤ 17 et 5 × 4 = 20 > 17, donc q = 3.', '17 − 15 = 2, donc r = 2 : 17 = 5 × 3 + 2.'],
    },
    source: objective(
      'Déterminer le quotient et le reste dans une division euclidienne, par exemple, savoir que 17 = 3 × 5 + 2',
    ),
  },
  generate(rng, level) {
    const b = rng.int(level === 1 ? 2 : 3, level === 1 ? 5 : level === 2 ? 9 : 12);
    const q = rng.int(2, level === 3 ? 12 : 9);
    const rest = rng.int(1, b - 1);
    const a = b * q + rest;
    const askRest = rng.next() < 0.5;
    const steps = [
      `${b} × ${q} = ${b * q} ≤ ${a} et ${b} × ${q + 1} = ${b * (q + 1)} > ${a}, donc le quotient est ${q}.`,
      `${a} − ${b * q} = ${rest}, donc le reste est ${rest}.`,
      `**${a} = ${b} × ${q} + ${rest}**`,
    ];
    return askRest
      ? {
          prompt: `Dans la division euclidienne de ${a} par ${b}, quel est le **reste** ?`,
          answer: num(rest),
          traps: traps(r(rest), [
            [q, `${q} est le quotient ; le reste est ce qui reste après ${b} × ${q}.`],
            [rest + b, `Le reste doit être plus petit que ${b} : on peut encore mettre ${b} une fois de plus.`],
          ]),
          steps,
        }
      : {
          prompt: `Dans la division euclidienne de ${a} par ${b}, quel est le **quotient** ?`,
          answer: num(q),
          traps: traps(r(q), [
            [rest, `${rest} est le reste ; le quotient est le nombre de fois que ${b} « rentre » dans ${a}.`],
            [q + 1, `${b} × ${q + 1} = ${b * (q + 1)} dépasse ${a}.`],
          ]),
          steps,
        };
  },
};

const decomposer: Skill = {
  id: 'm5-decomposer',
  title: 'Décomposer en produit',
  lesson: {
    body: [
      'Grâce aux tables, on écrit un entier comme produit de deux nombres différents de 1 : 21 = 3 × 7, 48 = 6 × 8.',
    ],
    example: { question: 'Complète : 63 = 7 × …', steps: ['Dans la table de 7 : 7 × 9 = 63.', 'Donc 63 = 7 × 9.'] },
    source: objective(
      'Utiliser les tables de multiplication pour factoriser des nombres entiers décomposables en produit de deux nombres différents de 1, par exemple, 21 = 3 × 7',
    ),
  },
  generate(rng, level) {
    const a = rng.int(level === 1 ? 2 : 3, level === 1 ? 5 : 9);
    const b = rng.int(level === 3 ? 6 : 2, 9);
    const p = a * b;
    return {
      prompt: `Complète : ${p} = ${a} × …`,
      answer: num(b),
      traps: traps(r(b), [
        [
          p - a,
          `${p} − ${a} = ${p - a} : c’est une soustraction, il faut le nombre qui **multiplié** par ${a} donne ${p}.`,
        ],
        [b + 1, `${a} × ${b + 1} = ${a * (b + 1)}, pas ${p}.`],
      ]),
      steps: [`On cherche ${p} dans la table de ${a}.`, `${a} × ${b} = ${p}, donc **${p} = ${a} × ${b}**.`],
      targetSeconds: 10,
    };
  },
};

const produitsDecimaux: Skill = {
  id: 'm5-produits-decimaux',
  title: 'Produits avec des décimaux',
  advice: 'brouillon',
  lesson: {
    body: [
      'On calcule le produit **sans la virgule** avec les tables, puis on replace la virgule : le résultat a autant de chiffres après la virgule que les deux facteurs réunis.',
      '0,6 × 7 : 6 × 7 = 42, un chiffre après la virgule → 4,2.',
    ],
    example: {
      question: 'Calcule 40 × 0,03.',
      steps: ['4 × 3 = 12.', '40 = 4 × 10 et 0,03 = 3 ÷ 100, donc 40 × 0,03 = 12 × 10 ÷ 100 = 1,2.'],
    },
    source: objective('Savoir calculer des produits en lien avec les tables : 0,6 × 7 ; 40 × 0,03'),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    // niveau 1 : 0,b × a ; niveau 2 : 0,0b × a ou a0 × 0,b ; niveau 3 : a0 × 0,0b ou a00 × 0,0b
    const [left, right]: [ReturnType<typeof r>, ReturnType<typeof r>] =
      level === 1
        ? [dec(b, 1), r(a)]
        : level === 2
          ? rng.next() < 0.5
            ? [dec(b, 2), r(a)]
            : [r(a * 10), dec(b, 1)]
          : rng.next() < 0.5
            ? [r(a * 10), dec(b, 2)]
            : [r(a * 100), dec(b, 2)];
    const p = mul(left, right);
    return {
      prompt: `Calcule ${fmt(left)} × ${fmt(right)}.`,
      answer: num(p),
      traps: traps(p, [
        [mul(p, r(10)), 'La virgule est mal placée : le résultat est 10 fois trop grand.'],
        [mul(p, r(1, 10)), 'La virgule est mal placée : le résultat est 10 fois trop petit.'],
        [a * b, `${a} × ${b} = ${a * b}, mais il faut ensuite replacer la virgule.`],
      ]),
      steps: [
        `Sans virgule : ${a} × ${b} = ${a * b}.`,
        `On replace la virgule : ${fmt(left)} × ${fmt(right)} = **${fmt(p)}**.`,
      ],
      targetSeconds: 15,
    };
  },
};

const fois10: Skill = {
  id: 'm5-fois-10',
  title: 'Multiplier et diviser par 10, 100, 1\u00a0000',
  lesson: {
    body: [
      '× 10, × 100, × 1 000 : chaque chiffre prend une valeur 10, 100, 1 000 fois plus grande ; la virgule se décale de 1, 2, 3 rangs **vers la droite**.',
      '÷ 10, ÷ 100, ÷ 1 000 : décalage **vers la gauche**. On complète avec des zéros si besoin.',
      'Attention : « ajouter un zéro » ne marche pas avec les décimaux (2,5 × 10 = 25, pas 2,50).',
    ],
    example: {
      question: 'Calcule 3,7 ÷ 100.',
      steps: ['On décale la virgule de 2 rangs vers la gauche : 3,7 → 0,037.'],
    },
    source: objective('Multiplier et diviser par 10, 100, 1 000'),
  },
  generate(rng, level) {
    const p = rng.pick(level === 1 ? [10, 100] : [10, 100, 1000]);
    const divide = level > 1 && rng.next() < 0.5;
    const x = level === 1 ? r(rng.int(2, 99)) : dec(rng.int(11, 999), rng.int(1, 2));
    const result = divide ? mul(x, r(1, p)) : mul(x, r(p));
    const wrongWay = divide ? mul(x, r(p)) : mul(x, r(1, p));
    const op = divide ? '÷' : '×';
    const zeros = String(p).length - 1;
    return {
      prompt: `Calcule ${fmt(x)} ${op} ${fmt(p)}.`,
      answer: num(result),
      traps: traps(result, [
        [
          wrongWay,
          `Mauvais sens : ${divide ? 'diviser rend le nombre plus petit' : 'multiplier rend le nombre plus grand'}.`,
        ],
        [mul(result, r(10)), `La virgule doit bouger de ${zeros} rang${zeros > 1 ? 's' : ''}, pas plus.`],
        [mul(result, r(1, 10)), `La virgule doit bouger de ${zeros} rang${zeros > 1 ? 's' : ''}, pas plus.`],
      ]),
      steps: [
        `${op} ${fmt(p)} : la virgule se décale de ${zeros} rang${zeros > 1 ? 's' : ''} vers la ${divide ? 'gauche' : 'droite'}.`,
        `${fmt(x)} ${op} ${fmt(p)} = **${fmt(result)}**`,
      ],
      targetSeconds: 12,
    };
  },
};

const decimauxAdd: Skill = {
  id: 'm5-decimaux-add',
  title: 'Additionner et soustraire des décimaux',
  advice: 'brouillon',
  lesson: {
    body: [
      'On aligne les virgules (unités sous unités, dixièmes sous dixièmes…). On peut compléter avec des zéros : 3,8 = 3,80.',
      'En calcul mental : 2,7 + 1,4 = 2,7 + 0,3 + 1,1 = 4,1.',
    ],
    example: { question: 'Calcule 5,25 + 3,8.', steps: ['5,25 + 3,80 (on aligne les virgules).', '= 9,05'] },
    source: objective('Additionner et soustraire des décimaux, par exemple, 2,7 + 1,4 ; 3,4 – 0,8'),
  },
  generate(rng, level) {
    const minus = rng.next() < 0.5;
    let a = level === 3 ? dec(rng.int(101, 999), 2) : dec(rng.int(11, 99), 1);
    let b = level === 3 ? dec(rng.int(11, 99), 1) : dec(rng.int(level === 1 ? 1 : 11, level === 1 ? 9 : 99), 1);
    if (minus && a.n * b.d < b.n * a.d) [a, b] = [b, a];
    const result = minus ? sub(a, b) : add(a, b);
    const op = minus ? '−' : '+';
    const t: [ReturnType<typeof r>, string][] = [];
    if (level === 3) {
      // Erreur d'alignement à droite : 5,25 + 3,8 → 5,25 + 0,38
      const misaligned = minus ? sub(a, mul(b, r(1, 10))) : add(a, mul(b, r(1, 10)));
      t.push([
        misaligned,
        'Les virgules n’étaient pas alignées : il faut écrire ' +
          fmt(b) +
          ' = ' +
          fmt(b) +
          '0 et aligner les virgules.',
      ]);
    }
    return {
      prompt: `Calcule ${fmt(a)} ${op} ${fmt(b)}.`,
      answer: num(result),
      traps: traps(result, [
        ...t,
        [minus ? add(a, b) : sub(a, b), `Attention au signe : c’est une ${minus ? 'soustraction' : 'addition'}.`],
      ]),
      steps: [`On aligne les virgules : ${fmt(a)} ${op} ${fmt(b)}.`, `= **${fmt(result)}**`],
      targetSeconds: 15,
    };
  },
};

export const calcul: Chapter = {
  id: 'm5-calcul',
  subject: 'maths',
  domain: 'nombres',
  title: 'Calcul mental',
  skills: [tables, euclide, decomposer, produitsDecimaux, fois10, decimauxAdd],
};

export const SOURCE_NOTE = BO_MATHS;
