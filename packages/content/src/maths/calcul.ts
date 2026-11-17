import { BO_MATHS, num, objective, traps } from '../build.ts';
import { add, dec, fmt, mul, r, sub, type Rational } from '../rational.ts';
import type { Chapter, Skill } from '../types.ts';

/** Nombre de chiffres après la virgule d'un décimal. */
const decimals = (x: Rational) => fmt(x).split(',')[1]?.length ?? 0;

/** Chemin de calcul « à partir d'un résultat facile » pour retrouver a × b. */
function tableTrick(a: number, b: number): { hint: string; steps: string[] } {
  const [big, small] = a >= b ? [a, b] : [b, a];
  if (small === 10 || big === 10) {
    const o = small === 10 ? big : small;
    return {
      hint: 'Multiplier par 10, c’est facile : on écrit un 0 à droite du nombre.',
      steps: [`× 10 : on écrit un 0 à droite de ${o}.`],
    };
  }
  if (small === 9 || big === 9) {
    const o = big === 9 ? small : big;
    return {
      hint: `Astuce du 9 : calcule d’abord ${o} × 10, puis enlève ${o}.`,
      steps: [`Astuce du 9 : ${o} × 10 = ${o * 10}.`, `On enlève une fois ${o} : ${o * 10} − ${o} = ${o * 9}.`],
    };
  }
  if (small === 5 || big === 5) {
    const o = big === 5 ? small : big;
    return {
      hint: `× 5, c’est la moitié de × 10 : pense à ${o} × 10.`,
      steps: [`× 5, c’est la moitié de × 10 : ${o} × 10 = ${o * 10}.`, `La moitié de ${o * 10}, c’est ${o * 5}.`],
    };
  }
  if (small === 2)
    return {
      hint: `× 2, c’est le double : ${big} + ${big}.`,
      steps: [`× 2, c’est le double : ${big} + ${big} = ${big * 2}.`],
    };
  if (small === 4)
    return {
      hint: `× 4, c’est le double du double : double ${big}, puis double encore.`,
      steps: [`× 4, c’est le double du double : ${big} × 2 = ${big * 2}, puis ${big * 2} × 2 = ${big * 4}.`],
    };
  if (big === 11 || big === 12) {
    const extra = big - 10;
    return {
      hint: `Découpe ${big} en 10 + ${extra} : calcule ${small} × 10, puis ajoute ${small} × ${extra}.`,
      steps: [
        `On découpe ${big} en 10 + ${extra}.`,
        `${small} × 10 = ${small * 10} et ${small} × ${extra} = ${small * extra}.`,
        `${small * 10} + ${small * extra} = ${small * big}.`,
      ],
    };
  }
  // 3, 6, 7, 8 : on part d'un résultat connu (× 5) et on ajoute ce qui manque.
  if (big > 5) {
    const rest = big - 5;
    return {
      hint: `Pars de ${small} × 5 = ${small * 5}, puis ajoute ${small} × ${rest}.`,
      steps: [
        `On part d’un résultat facile : ${small} × 5 = ${small * 5}.`,
        `Il manque encore ${rest} fois ${small} : ${small} × ${rest} = ${small * rest}.`,
        `${small * 5} + ${small * rest} = ${small * big}.`,
      ],
    };
  }
  return {
    hint: `Compte de ${small} en ${small}, ${big} fois.`,
    steps: [
      `On compte de ${small} en ${small}, ${big} fois : ${Array.from({ length: big }, (_, i) => small * (i + 1)).join(', ')}.`,
    ],
  };
}

const tables: Skill = {
  id: 'm5-tables',
  mental: true,
  title: 'Tables de multiplication',
  lesson: {
    memo: [
      'On peut retourner une multiplication : 7 × 8 = 8 × 7. Ça fait deux fois moins de tables à retenir !',
      'Si tu bloques, pars d’un résultat facile : × 10 (on ajoute un 0), × 5 (la moitié de × 10), puis ajoute ou enlève ce qui manque.',
      'Exemple : 9 × 7 = 10 × 7 − 7 = 70 − 7 = 63.',
    ],
    source: objective('Entretenir la connaissance et l’utilisation des tables de multiplication'),
  },
  generate(rng, level) {
    const pool = level === 1 ? [2, 3, 4, 5, 10] : level === 2 ? [6, 7, 8, 9] : [6, 7, 8, 9, 11, 12];
    const a = rng.pick(pool);
    const b = rng.int(level === 1 ? 2 : 3, level === 3 ? 12 : 10);
    const p = a * b;
    const trick = tableTrick(a, b);
    if (level === 3 && rng.next() < 0.5) {
      return {
        prompt: `Complète : ${a} × … = ${p}`,
        answer: num(b),
        traps: traps(r(b), [[p - a, `${a} × ${b - 1} = ${p - a}, il manque encore ${a}.`]]),
        hint: `Récite la table de ${a} jusqu’à tomber sur ${p}.`,
        steps: [
          `On cherche combien de fois il faut prendre ${a} pour arriver à ${p}.`,
          `On récite la table de ${a} : … ${a} × ${b - 1} = ${p - a}, ${a} × ${b} = ${p}. Trouvé !`,
          `Il manque donc **${b}**.`,
        ],
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
      hint: trick.hint,
      steps: [...trick.steps, `Donc ${a} × ${b} = **${p}**.`],
      targetSeconds: 6,
    };
  },
};

const euclide: Skill = {
  id: 'm5-euclide',
  mental: true,
  title: 'Division euclidienne',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Diviser 17 par 5, c’est faire des paquets de 5 avec 17 objets.',
      'On fait 3 paquets (5 × 3 = 15) et il reste 2 objets : **quotient 3**, **reste 2**. On écrit 17 = 5 × 3 + 2.',
      'Le reste est toujours plus petit que 5, sinon on pourrait faire un paquet de plus !',
    ],
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
      `On fait des paquets de ${b} avec ${a} : combien de paquets complets ?`,
      `${b} × ${q} = ${b * q}, ça rentre. ${b} × ${q + 1} = ${b * (q + 1)}, c’est trop ! Donc ${q} paquets : le quotient est ${q}.`,
      `Il reste ${a} − ${b * q} = ${rest} (moins que ${b}, c’est bon) : le reste est ${rest}.`,
      `${a} = ${b} × ${q} + ${rest}, donc la réponse est **${askRest ? rest : q}**.`,
    ];
    const hint = `Cherche le plus grand nombre de la table de ${b} qui ne dépasse pas ${a}.`;
    return askRest
      ? {
          prompt: `Dans la division euclidienne de ${a} par ${b}, quel est le **reste** ?`,
          answer: num(rest),
          traps: traps(r(rest), [
            [q, `${q} est le quotient (le nombre de paquets). Le reste, c’est ce qui reste après ${b} × ${q}.`],
            [rest + b, `Le reste doit être plus petit que ${b} : tu peux encore faire un paquet de ${b}.`],
          ]),
          hint,
          steps,
        }
      : {
          prompt: `Dans la division euclidienne de ${a} par ${b}, quel est le **quotient** ?`,
          answer: num(q),
          traps: traps(r(q), [
            [rest, `${rest} est le reste. Le quotient, c’est le nombre de paquets de ${b}.`],
            [q + 1, `${b} × ${q + 1} = ${b * (q + 1)} : ça dépasse ${a}, on ne peut pas faire ce paquet-là.`],
          ]),
          hint,
          steps,
        };
  },
};

const decomposer: Skill = {
  id: 'm5-decomposer',
  mental: true,
  title: 'Décomposer en produit',
  lesson: {
    memo: [
      'Décomposer 21, c’est le retrouver dans une table : 21 est dans la table de 3, car 3 × 7 = 21.',
      'Pour compléter 63 = 7 × …, on récite la table de 7 jusqu’à 63 : 7 × 9 = 63.',
    ],
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
          `${p} − ${a} = ${p - a} : c’est une soustraction. Il faut le nombre qui, **multiplié** par ${a}, donne ${p}.`,
        ],
        [b + 1, `${a} × ${b + 1} = ${a * (b + 1)}, pas ${p}.`],
      ]),
      hint: `Récite la table de ${a} jusqu’à tomber sur ${p}.`,
      steps: [
        `On cherche : ${a} fois combien font ${p} ?`,
        `Dans la table de ${a} : ${a} × ${b} = ${p}.`,
        `Donc ${p} = ${a} × **${b}**.`,
      ],
      targetSeconds: 10,
    };
  },
};

const produitsDecimaux: Skill = {
  id: 'm5-produits-decimaux',
  mental: true,
  title: 'Produits avec des décimaux',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Oublie d’abord la virgule et calcule avec les tables : pour 0,6 × 7, on fait 6 × 7 = 42.',
      'Puis on remet la virgule : 0,6 a 1 chiffre après la virgule, donc le résultat aussi → **4,2**.',
      'Vérifie que c’est logique : 0,6 c’est un peu plus que la moitié de 1, donc 0,6 × 7 fait un peu plus que la moitié de 7.',
    ],
    source: objective('Savoir calculer des produits en lien avec les tables : 0,6 × 7 ; 40 × 0,03'),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    // niveau 1 : 0,b × a ; niveau 2 : 0,0b × a ou a0 × 0,b ; niveau 3 : a0 × 0,0b ou a00 × 0,0b
    const [left, right]: [Rational, Rational] =
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
    const zeros = (x: Rational) => (x.d === 1 ? String(x.n).length - 1 : 0);
    const after = decimals(left) + decimals(right);
    const extraZeros = zeros(left) + zeros(right);
    const [intPart, decPart] = left.d === 1 ? [left, right] : [right, left];
    return {
      prompt: `Calcule ${fmt(left)} × ${fmt(right)}.`,
      answer: num(p),
      traps: traps(p, [
        [mul(p, r(10)), 'La virgule est mal placée : le résultat est 10 fois trop grand.'],
        [mul(p, r(1, 10)), 'La virgule est mal placée : le résultat est 10 fois trop petit.'],
        [a * b, `${a} × ${b} = ${a * b}, c’est le bon début ! Mais il faut ensuite remettre la virgule.`],
      ]),
      hint: `Calcule d’abord ${a} × ${b} sans t’occuper de la virgule, puis replace-la.`,
      steps: [
        `On oublie la virgule et les zéros : ${a} × ${b} = ${a * b}.`,
        ...(extraZeros > 0
          ? [
              `${fmt(intPart)}, c’est ${intPart.n / 10 ** extraZeros} × ${10 ** extraZeros} : ${a * b} × ${10 ** extraZeros} = ${a * b * 10 ** extraZeros}.`,
            ]
          : []),
        `${fmt(decPart)} a ${after} chiffre${after > 1 ? 's' : ''} après la virgule : on décale la virgule de ${after} rang${after > 1 ? 's' : ''} vers la gauche.`,
        `${fmt(left)} × ${fmt(right)} = **${fmt(p)}**`,
      ],
      targetSeconds: 15,
    };
  },
};

const fois10: Skill = {
  id: 'm5-fois-10',
  mental: true,
  title: 'Multiplier et diviser par 10, 100, 1 000',
  lesson: {
    memo: [
      '× 10 : le nombre devient 10 fois plus grand, la virgule saute d’un rang **vers la droite** (× 100 : 2 rangs, × 1 000 : 3 rangs).',
      '÷ 10 : le nombre devient plus petit, la virgule saute **vers la gauche**. S’il manque des chiffres, on ajoute des zéros.',
      'Piège : 2,5 × 10 = 25, pas 2,50 ! « Ajouter un zéro » ne marche que pour les entiers.',
    ],
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
    const ranks = `${zeros} rang${zeros > 1 ? 's' : ''}`;
    return {
      prompt: `Calcule ${fmt(x)} ${op} ${fmt(p)}.`,
      answer: num(result),
      traps: traps(result, [
        [
          wrongWay,
          `Mauvais sens : ${divide ? 'diviser rend le nombre plus petit' : 'multiplier rend le nombre plus grand'}.`,
        ],
        [
          mul(result, r(10)),
          `${fmt(p)} a ${zeros} zéro${zeros > 1 ? 's' : ''} : la virgule doit bouger de ${ranks}, pas plus.`,
        ],
        [
          mul(result, r(1, 10)),
          `${fmt(p)} a ${zeros} zéro${zeros > 1 ? 's' : ''} : la virgule doit bouger de ${ranks}, pas moins.`,
        ],
      ]),
      hint: `${fmt(p)} a ${zeros} zéro${zeros > 1 ? 's' : ''} : la virgule saute de ${ranks}. ${divide ? 'On divise : le nombre doit devenir plus petit.' : 'On multiplie : le nombre doit devenir plus grand.'}`,
      steps: [
        divide
          ? `On divise par ${fmt(p)} : le nombre va devenir ${fmt(p)} fois plus petit.`
          : `On multiplie par ${fmt(p)} : le nombre va devenir ${fmt(p)} fois plus grand.`,
        `${fmt(p)} a ${zeros} zéro${zeros > 1 ? 's' : ''}, donc la virgule saute de ${ranks} vers la ${divide ? 'gauche' : 'droite'}${x.d === 1 && !divide ? ' (pour un entier : on écrit les zéros à droite)' : ''}.`,
        `${fmt(x)} ${op} ${fmt(p)} = **${fmt(result)}**`,
      ],
      targetSeconds: 12,
    };
  },
};

const decimauxAdd: Skill = {
  id: 'm5-decimaux-add',
  mental: true,
  title: 'Additionner et soustraire des décimaux',
  advice: 'brouillon',
  lesson: {
    memo: [
      'On pose le calcul en mettant **les virgules l’une sous l’autre** : unités sous unités, dixièmes sous dixièmes.',
      'S’il manque un chiffre, on ajoute un zéro : 3,8 = 3,80. Ça ne change pas le nombre !',
      'Exemple : 5,25 + 3,80 = 9,05.',
    ],
    source: objective('Additionner et soustraire des décimaux, par exemple, 2,7 + 1,4 ; 3,4 – 0,8'),
  },
  generate(rng, level) {
    const minus = rng.next() < 0.5;
    let a = level === 3 ? dec(rng.int(101, 999), 2) : dec(rng.int(11, 99), 1);
    let b = level === 3 ? dec(rng.int(11, 99), 1) : dec(rng.int(level === 1 ? 1 : 11, level === 1 ? 9 : 99), 1);
    if (minus && a.n * b.d < b.n * a.d) [a, b] = [b, a];
    const result = minus ? sub(a, b) : add(a, b);
    const op = minus ? '−' : '+';
    const places = Math.max(decimals(a), decimals(b));
    const padded = (x: Rational) => fmt(x) + '0'.repeat(places - decimals(x));
    const t: [Rational, string][] = [];
    if (level === 3) {
      // Erreur d'alignement à droite : 5,25 + 3,8 → 5,25 + 0,38
      const misaligned = minus ? sub(a, mul(b, r(1, 10))) : add(a, mul(b, r(1, 10)));
      t.push([
        misaligned,
        `Les virgules n’étaient pas l’une sous l’autre : écris ${fmt(b)} = ${padded(b)} pour bien aligner.`,
      ]);
    }
    const sameLength = decimals(a) === decimals(b);
    const aInt = r(Math.floor(a.n / a.d));
    const bInt = r(Math.floor(b.n / b.d));
    const aDec = sub(a, aInt);
    const bDec = sub(b, bInt);
    return {
      prompt: `Calcule ${fmt(a)} ${op} ${fmt(b)}.`,
      answer: num(result),
      traps: traps(result, [
        ...t,
        [minus ? add(a, b) : sub(a, b), `Attention au signe : c’est une ${minus ? 'soustraction' : 'addition'}.`],
      ]),
      hint: 'Pose le calcul avec les virgules l’une sous l’autre (ajoute un zéro s’il manque un chiffre).',
      steps: [
        sameLength
          ? `On pose le calcul, virgule sous virgule : ${fmt(a)} ${op} ${fmt(b)}.`
          : `On aligne les virgules en ajoutant un zéro : ${padded(a)} ${op} ${padded(b)}.`,
        ...(minus
          ? bInt.n === 0
            ? []
            : [
                `On enlève d’abord la partie entière : ${fmt(a)} − ${fmt(bInt)} = ${fmt(sub(a, bInt))}.`,
                `Puis la partie décimale : ${fmt(sub(a, bInt))} − ${fmt(bDec)} = ${fmt(result)}.`,
              ]
          : [
              `Parties entières : ${fmt(aInt)} + ${fmt(bInt)} = ${fmt(add(aInt, bInt))}. Parties décimales : ${fmt(aDec)} + ${fmt(bDec)} = ${fmt(add(aDec, bDec))}.`,
              `On rassemble : ${fmt(add(aInt, bInt))} + ${fmt(add(aDec, bDec))} = ${fmt(result)}.`,
            ]),
        `${fmt(a)} ${op} ${fmt(b)} = **${fmt(result)}**`,
      ],
      targetSeconds: 15,
    };
  },
};

export const calcul: Chapter = {
  id: 'm5-calcul',
  subject: 'maths',
  grade: '5e',
  domain: 'nombres',
  title: 'Calcul mental',
  skills: [tables, euclide, decomposer, produitsDecimaux, fois10, decimauxAdd],
};

export const SOURCE_NOTE = BO_MATHS;
