import { choice, num, traps } from '../../build.ts';
import { add, cmp, dec, fmt, mul, r, sub, toNumber } from '../../rational.ts';
import { big, bossOf, NAMES } from '../kit.ts';
import { S, C, exactDecimal } from './commun.ts';

// ——— Calcul avec les décimaux ———

const addDecimaux = S(
  'm6-add-decimaux',
  'Additionner et soustraire des décimaux',
  'Additionner et soustraire des nombres décimaux',
  [
    'On aligne les **virgules** : unités sous unités, dixièmes sous dixièmes.',
    'Ajoute des zéros pour avoir autant de chiffres après la virgule : 12,5 − 3,27 = 12,50 − 3,27.',
  ],
  (rng, level) => {
    const a = exactDecimal(rng, 1, level === 1 ? 20 : 100, level === 1 ? 1 : 2);
    const b = exactDecimal(rng, 1, level === 1 ? 20 : 50, level === 3 ? 1 : level === 1 ? 1 : 2);
    const minus = level === 3 || rng.int(0, 1) === 1;
    const [x, y] = minus && cmp(a, b) < 0 ? [b, a] : [a, b];
    const res = minus ? sub(x, y) : add(x, y);
    return {
      prompt: `Calcule ${fmt(x)} ${minus ? '−' : '+'} ${fmt(y)}.`,
      answer: num(res),
      hint: 'Pose l’opération en alignant les virgules (ajoute des zéros si besoin).',
      steps: [
        `On aligne les virgules : ${fmt(x)} et ${fmt(y)}, avec autant de chiffres après la virgule.`,
        `${fmt(x)} ${minus ? '−' : '+'} ${fmt(y)} = **${fmt(res)}**.`,
      ],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const fois10 = S(
  'm6-fois-10',
  'Multiplier et diviser par 10, 100, 1 000 ou par 0,1…',
  'Multiplier un nombre entier ou un nombre décimal par 0,1, par 0,01, et par 0,001',
  [
    '× 10 : chaque chiffre devient 10 fois plus grand, il glisse d’un rang vers la gauche. ÷ 10 : il glisse vers la droite.',
    'Multiplier par 0,1, c’est **diviser par 10** ; par 0,01, c’est diviser par 100.',
  ],
  (rng, level) => {
    const x = exactDecimal(rng, 0, 999, rng.int(0, 2));
    const k = rng.pick([10, 100, 1000]);
    const kind =
      level === 1 ? 'mul' : level === 2 ? rng.pick(['mul', 'div'] as const) : rng.pick(['p01', 'div'] as const);
    if (kind === 'p01') {
      const f = r(1, k);
      const res = mul(x, f);
      return {
        prompt: `Calcule ${fmt(x)} × ${fmt(f)}.`,
        answer: num(res),
        traps: traps(res, [[mul(x, r(k)), `× ${fmt(f)}, c’est **diviser** par ${k}, pas multiplier.`]]),
        hint: `Multiplier par ${fmt(f)}, c’est diviser par ${k}.`,
        steps: [
          `× ${fmt(f)} revient à ÷ ${k} : les chiffres glissent de ${String(k).length - 1} rang${k > 10 ? 's' : ''} vers la droite.`,
          `${fmt(x)} × ${fmt(f)} = **${fmt(res)}**.`,
        ],
        targetSeconds: 15,
      };
    }
    const res = kind === 'mul' ? mul(x, r(k)) : mul(x, r(1, k));
    const wrong = kind === 'mul' ? mul(x, r(1, k)) : mul(x, r(k));
    return {
      prompt: `Calcule ${fmt(x)} ${kind === 'mul' ? '×' : '÷'} ${big(k)}.`,
      answer: num(res),
      traps: traps(res, [
        [wrong, kind === 'mul' ? '× : le nombre devient plus grand.' : '÷ : le nombre devient plus petit.'],
      ]),
      hint: `${kind === 'mul' ? '×' : '÷'} ${big(k)} : les chiffres glissent de ${String(k).length - 1} rang${k > 10 ? 's' : ''} vers la ${kind === 'mul' ? 'gauche' : 'droite'}.`,
      steps: [
        `Chaque chiffre devient ${big(k)} fois plus ${kind === 'mul' ? 'grand' : 'petit'} : il glisse de ${String(k).length - 1} rang${k > 10 ? 's' : ''}.`,
        `${fmt(x)} ${kind === 'mul' ? '×' : '÷'} ${big(k)} = **${fmt(res)}**.`,
      ],
      targetSeconds: 12,
    };
  },
  { mental: true },
);

const produitDecimaux = S(
  'm6-produit-decimaux',
  'Multiplier deux décimaux',
  'Calculer le produit de deux nombres décimaux',
  [
    'On calcule **sans les virgules**, puis on met dans le résultat autant de chiffres après la virgule qu’il y en a en tout dans les deux nombres.',
    '2,5 × 1,3 : 25 × 13 = 325, et 1 + 1 = 2 chiffres après la virgule → 3,25.',
  ],
  (rng, level) => {
    const da = level === 1 ? 1 : rng.int(1, 2);
    const db = level === 3 ? 1 : 0;
    const a = exactDecimal(rng, 0, level === 1 ? 9 : 20, da);
    const b = level === 1 ? r(rng.int(2, 9)) : exactDecimal(rng, 1, 9, Math.max(db, 1));
    const res = mul(a, b);
    const ia = Math.round(toNumber(a) * 10 ** da);
    const ib = Math.round(toNumber(b) * b.d);
    const decs = da + (b.d === 1 ? 0 : String(b.d).length - 1);
    return {
      prompt: `Calcule ${fmt(a)} × ${fmt(b)}.`,
      answer: num(res),
      traps: traps(res, [
        [
          r(ia * ib, 10 ** Math.max(0, decs - 1)),
          `Il faut ${decs} chiffre${decs > 1 ? 's' : ''} après la virgule en tout.`,
        ],
      ]),
      hint: 'Calcule sans les virgules, puis compte les chiffres après la virgule dans les deux nombres.',
      steps: [
        `Sans les virgules : ${ia} × ${ib} = ${ia * ib}.`,
        `${decs} chiffre${decs > 1 ? 's' : ''} après la virgule en tout : ${fmt(a)} × ${fmt(b)} = **${fmt(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const ordreGrandeur = S(
  'm6-ordre-grandeur',
  'Ordre de grandeur',
  'Contrôler les résultats à l’aide d’ordres de grandeur',
  [
    'Un **ordre de grandeur**, c’est un calcul facile avec des nombres arrondis : 48,7 × 3,1 ≈ 50 × 3 = 150.',
    'Il sert à vérifier un résultat : si on trouve 1 509, il y a une erreur de virgule !',
  ],
  (rng) => {
    const a = exactDecimal(rng, 11, 99, 1);
    const b = exactDecimal(rng, 2, 9, 1);
    const ra = Math.round(toNumber(a) / 10) * 10;
    const rb = Math.round(toNumber(b));
    const est = ra * rb;
    const exact = mul(a, b);
    const opts = [est, est * 10, Math.round(est / 10)];
    return {
      prompt: `Sans poser l’opération, quel est l’ordre de grandeur de ${fmt(a)} × ${fmt(b)} ?`,
      ...choice(
        rng,
        big(est),
        opts.slice(1).map((o) => ({
          label: big(o),
          why: 'Arrondis chaque nombre puis multiplie : la virgule ne doit pas sauter.',
        })),
      ),
      hint: `Arrondis ${fmt(a)} à la dizaine et ${fmt(b)} à l’unité.`,
      steps: [
        `${fmt(a)} ≈ ${ra} et ${fmt(b)} ≈ ${rb}.`,
        `${ra} × ${rb} = **${big(est)}** (le vrai résultat est ${fmt(exact)}).`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const problemesMultiplication = S(
  'm6-problemes-multiplication',
  'Problèmes : multiplier des décimaux',
  'Résoudre des problèmes mettant en jeu des multiplications entre des nombres décimaux',
  [
    'Prix de plusieurs kilos = prix d’un kilo × nombre de kilos, même si ce nombre est décimal (2,5 kg).',
    'Aire d’un rectangle = longueur × largeur, aussi avec des décimaux.',
  ],
  (rng, level) => {
    const kind = rng.pick(['prix', 'aire'] as const);
    if (kind === 'prix') {
      const price = exactDecimal(rng, 1, 9, level === 1 ? 1 : 2);
      const kg = level === 1 ? r(rng.int(2, 6)) : exactDecimal(rng, 1, 4, 1);
      const res = mul(price, kg);
      const item = rng.pick(['pommes', 'tomates', 'cerises', 'carottes']);
      return {
        prompt: `Les ${item} coûtent ${fmt(price)} € le kilo. Combien paie-t-on pour ${fmt(kg)} kg ?`,
        answer: num(res, '€'),
        traps: traps(res, [
          [
            add(price, kg),
            'On paie le prix d’un kilo **autant de fois** qu’il y a de kilos : c’est une multiplication.',
          ],
        ]),
        hint: 'Prix total = prix d’un kilo × nombre de kilos.',
        steps: [
          `On multiplie le prix d’un kilo par le nombre de kilos : ${fmt(price)} × ${fmt(kg)}.`,
          `${fmt(price)} × ${fmt(kg)} = **${fmt(res)} €**.`,
        ],
        targetSeconds: 40,
      };
    }
    const L = exactDecimal(rng, 2, 12, 1);
    const l = level === 1 ? r(rng.int(2, 6)) : exactDecimal(rng, 1, 5, 1);
    const res = mul(L, l);
    return {
      prompt: `Un tapis rectangulaire mesure ${fmt(L)} m sur ${fmt(l)} m. Quelle est son aire, en m^2 ?`,
      answer: num(res, 'm^2'),
      traps: traps(res, [[mul(add(L, l), r(2)), 'Ça, c’est le périmètre. L’aire = longueur × largeur.']]),
      hint: 'Aire d’un rectangle = longueur × largeur.',
      steps: [`Aire = longueur × largeur = ${fmt(L)} × ${fmt(l)}.`, `= **${fmt(res)} m^2**.`],
      targetSeconds: 40,
    };
  },
);

export const calcul = C(
  'm6-calcul',
  'nombres',
  'Calculer avec les décimaux',
  [addDecimaux, fois10, produitDecimaux, ordreGrandeur, problemesMultiplication],
  bossOf(
    [
      S(
        'm6-boss-calcul-courses',
        'Problème : les courses',
        'Résoudre des problèmes mettant en jeu des multiplications entre des nombres décimaux',
        ['Calcule le prix de chaque article (prix × quantité), puis additionne, puis compare au budget.'],
        (rng) => {
          const who = rng.pick(NAMES);
          const p1 = exactDecimal(rng, 1, 5, 2);
          const q1 = rng.int(2, 4);
          const p2 = exactDecimal(rng, 2, 9, 1);
          const total = add(mul(p1, r(q1)), p2);
          const budget = r(Math.ceil(toNumber(total) / 5) * 5 + 5);
          const rest = sub(budget, total);
          return {
            prompt: `${who} a ${fmt(budget)} €. Il achète ${q1} cahiers à ${fmt(p1)} € et un stylo à ${fmt(p2)} €. Combien lui reste-t-il ?`,
            answer: num(rest, '€'),
            traps: traps(rest, [
              [sub(budget, add(p1, p2)), `Il y a ${q1} cahiers : multiplie d’abord ${fmt(p1)} par ${q1}.`],
              [total, 'Ça, c’est ce qu’il dépense. On demande ce qui **reste**.'],
            ]),
            hint: `Calcule d’abord le prix des ${q1} cahiers, puis la dépense totale.`,
            steps: [
              `Cahiers : ${q1} × ${fmt(p1)} = ${fmt(mul(p1, r(q1)))} €. Avec le stylo : ${fmt(total)} €.`,
              `Il reste ${fmt(budget)} − ${fmt(total)} = **${fmt(rest)} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm6-boss-calcul-carrelage',
        'Problème : le carrelage',
        'Résoudre des problèmes mettant en jeu des multiplications entre des nombres décimaux',
        ['Aire d’un rectangle = longueur × largeur, puis prix total = aire × prix au m^2.'],
        (rng) => {
          const L = r(rng.int(3, 6));
          const l = exactDecimal(rng, 2, 4, 1);
          const price = r(rng.int(12, 30));
          const area = mul(L, l);
          const total = mul(area, price);
          return {
            prompt: `Une pièce rectangulaire mesure ${fmt(L)} m sur ${fmt(l)} m. Le carrelage coûte ${fmt(price)} € le m^2. Combien coûte le carrelage de la pièce ?`,
            answer: num(total, '€'),
            traps: traps(total, [
              [mul(price, mul(add(L, l), r(2))), 'Tu as utilisé le périmètre : le carrelage couvre une **aire**.'],
            ]),
            hint: 'Calcule d’abord l’aire de la pièce.',
            steps: [
              `Aire : ${fmt(L)} × ${fmt(l)} = ${fmt(area)} m^2.`,
              `Prix : ${fmt(area)} × ${fmt(price)} = **${fmt(total)} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-calcul-piege',
        'Piège : multiplier rend-il toujours plus grand ?',
        'Comprendre le sens de la multiplication de deux nombres décimaux',
        ['Multiplier par un nombre plus petit que 1 rend **plus petit** : 8 × 0,5 = 4.'],
        (rng) => {
          const x = r(rng.int(12, 80));
          const f = dec(rng.int(1, 9), 1);
          const res = mul(x, f);
          return {
            prompt: `${fmt(x)} × ${fmt(f)} est-il plus grand ou plus petit que ${fmt(x)} ?`,
            ...choice(
              rng,
              'Plus petit',
              [
                {
                  label: 'Plus grand',
                  why: `Multiplier par ${fmt(f)}, qui est plus petit que 1, rend le nombre plus petit.`,
                },
              ],
              true,
            ),
            hint: `${fmt(f)} est-il plus grand ou plus petit que 1 ?`,
            steps: [
              `${fmt(f)} < 1 : on prend moins d’une fois ${fmt(x)}.`,
              `${fmt(x)} × ${fmt(f)} = ${fmt(res)} : c’est **plus petit**.`,
            ],
            targetSeconds: 15,
          };
        },
      ),
    ],
  ),
);
