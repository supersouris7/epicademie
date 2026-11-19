import { choice, fraction, num, traps } from '../../build.ts';
import { frac, gcd, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

const PRIMES = [2, 3, 5, 7, 11, 13];

/** Décomposition en facteurs premiers, écrite « 2^2 × 3 × 5 ». */
function factorize(n: number): { text: string; factors: [number, number][] } {
  const factors: [number, number][] = [];
  let m = n;
  for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23]) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e) factors.push([p, e]);
  }
  if (m > 1) factors.push([m, 1]);
  return { text: factors.map(([p, e]) => (e > 1 ? `${p}^${e}` : String(p))).join(' × '), factors };
}

// ——— Multiples, diviseurs, nombres premiers ———

const decomposition = S(
  'm3-decomposition',
  'Décomposer en facteurs premiers',
  'Factoriser un nombre entier positif : 60 = 2² × 3 × 5 (automatisme)',
  [
    'Un nombre **premier** a exactement deux diviseurs : 1 et lui-même (2, 3, 5, 7, 11, 13…).',
    'Pour décomposer 60 : 60 = 2 × 30 = 2 × 2 × 15 = 2 × 2 × 3 × 5 = 2^2 × 3 × 5.',
  ],
  (rng, level) => {
    const k = level === 1 ? 2 : level === 2 ? 3 : 4;
    const ps = Array.from({ length: k }, () => rng.pick(PRIMES.slice(0, level === 3 ? 5 : 3)));
    const n = ps.reduce((a, b) => a * b, 1);
    const { text } = factorize(n);
    const wrong1 =
      factorize(n).factors.length > 1 ? text.replace(/(\d+)(\^\d)?$/, (m0, p: string) => `${Number(p) * 2}`) : `${n}`;
    const nonPrime = n % 4 === 0 ? `4 × ${n / 4}` : `1 × ${text}`;
    return {
      prompt: `Quelle est la décomposition de ${n} en produit de facteurs premiers ?`,
      ...choice(rng, text, [
        { label: wrong1, why: `Calcule ce produit : il ne vaut pas ${n}.` },
        {
          label: nonPrime,
          why: nonPrime.startsWith('1') ? '1 n’est pas un nombre premier.' : '4 n’est pas premier : 4 = 2 × 2.',
        },
      ]),
      hint: 'Divise par 2 tant que tu peux, puis par 3, puis par 5…',
      steps: [
        `On divise par les nombres premiers dans l’ordre : ${n} = ${ps.sort((a, b) => a - b).join(' × ')}.`,
        `${n} = **${text}**.`,
      ],
      targetSeconds: 40,
    };
  },
  { mental: true },
);

const premier = S(
  'm3-premier',
  'Nombre premier ou non ?',
  'Appliquer les critères de divisibilité par 2, 3, 5, 9 (automatisme)',
  [
    'Pour savoir si n est premier, cherche un diviseur parmi 2, 3, 5, 7… Critère de 3 : la somme des chiffres est dans la table de 3.',
  ],
  (rng) => {
    const primes = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    const composites = [51, 57, 87, 91, 93, 111, 117, 119, 121, 133, 143, 169];
    const isP = rng.int(0, 1) === 1;
    const n = isP ? rng.pick(primes) : rng.pick(composites);
    const div = isP ? 0 : ([3, 7, 11, 13].find((d) => n % d === 0) ?? 3);
    return {
      prompt: `${n} est-il un nombre premier ?`,
      ...choice(
        rng,
        isP ? 'Oui' : 'Non',
        [
          {
            label: isP ? 'Non' : 'Oui',
            why: isP ? `${n} n’est divisible ni par 2, 3, 5, 7, ni par 11.` : `${n} = ${div} × ${n / div}.`,
          },
        ],
        true,
      ),
      hint: 'Essaie de diviser par 2, 3, 5, 7, 11… (critère de 3 : somme des chiffres).',
      steps: [
        isP ? `Aucun nombre premier jusqu’à √${n} ne divise ${n}.` : `${n} = ${div} × ${n / div}.`,
        `Donc **${isP ? 'oui, il est premier' : 'non, il n’est pas premier'}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const irreductible = S(
  'm3-irreductible',
  'Rendre une fraction irréductible',
  'Rendre irréductible une fraction',
  [
    'On décompose numérateur et dénominateur en facteurs premiers et on **barre les facteurs communs** : {84/90} = {2 × 2 × 3 × 7/2 × 3 × 3 × 5} = {14/15}.',
  ],
  (rng, level) => {
    let a = rng.int(2, 15);
    let b = rng.int(2, 15);
    while (gcd(a, b) !== 1 || a === b) {
      a = rng.int(2, 15);
      b = rng.int(2, 15);
    }
    const k = level === 1 ? rng.pick([6, 8, 9, 10, 12]) : rng.pick([12, 14, 15, 18, 21, 24, 28, 30, 36]);
    const v = r(a, b);
    return {
      prompt: `Rends irréductible {${a * k}/${b * k}}.`,
      answer: fraction(v),
      hint: `Décompose ${a * k} et ${b * k} en facteurs premiers.`,
      steps: [
        `${a * k} = ${factorize(a * k).text} et ${b * k} = ${factorize(b * k).text}.`,
        `On barre les facteurs communs (${factorize(k).text}) : **${frac(v)}**.`,
      ],
      targetSeconds: 40,
    };
  },
  { mental: true },
);

export const arithmetique = C(
  'm3-arithmetique',
  'nombres',
  'Nombres premiers et fractions irréductibles',
  [decomposition, premier, irreductible],
  bossOf(
    [
      S(
        'm3-boss-arith-bouquets',
        'Problème : les bouquets identiques',
        'Résoudre des problèmes faisant appel à des fractions',
        ['Le plus grand nombre de bouquets identiques = le plus grand diviseur commun aux deux quantités.'],
        (rng) => {
          const g = rng.pick([4, 6, 8, 9, 12]);
          let a = rng.int(2, 9);
          let b = rng.int(2, 9);
          while (gcd(a, b) !== 1 || a === b) {
            a = rng.int(2, 9);
            b = rng.int(2, 9);
          }
          return {
            prompt: `Une fleuriste a ${g * a} roses et ${g * b} tulipes. Elle veut faire le plus grand nombre possible de bouquets identiques, en utilisant toutes les fleurs. Combien de bouquets ?`,
            answer: num(g),
            traps: traps(r(g), [
              [a + b, `Ça, c’est le nombre de fleurs par bouquet.`],
              [r(g, 2), 'Ce n’est pas le **plus grand** diviseur commun.'],
            ]),
            hint: `Cherche le plus grand nombre qui divise à la fois ${g * a} et ${g * b}.`,
            steps: [
              `${g * a} = ${factorize(g * a).text} et ${g * b} = ${factorize(g * b).text}.`,
              `Plus grand diviseur commun : **${g}** bouquets (${a} roses et ${b} tulipes chacun).`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm3-boss-arith-feux',
        'Problème : les deux phares',
        'Factoriser un nombre entier positif : 60 = 2² × 3 × 5 (automatisme)',
        [
          'Deux phares qui s’allument toutes les 6 s et toutes les 8 s se rallument ensemble au plus petit multiple commun : 24 s.',
        ],
        (rng) => {
          const [a, b] = rng.pick([
            [6, 8],
            [4, 10],
            [6, 9],
            [10, 15],
            [8, 12],
            [12, 18],
          ] as const);
          const l = (a * b) / gcd(a, b);
          return {
            prompt: `Un phare s’allume toutes les ${a} s, un autre toutes les ${b} s. Ils viennent de s’allumer ensemble. Dans combien de secondes se rallumeront-ils ensemble ?`,
            answer: num(l, 's'),
            traps: traps(r(l), [[a * b, `${a * b} marche, mais ce n’est pas le **premier** moment commun.`]]),
            hint: `Cherche le plus petit multiple commun à ${a} et ${b}.`,
            steps: [
              `Multiples de ${b} : ${b}, ${2 * b}, ${3 * b}… lequel est aussi multiple de ${a} ?`,
              `Le premier est **${l} s**.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-arith-piege',
        'Piège : 1 est-il premier ?',
        'Mettre une fraction sous forme irréductible',
        ['1 n’est **pas** premier : il n’a qu’un seul diviseur. 2 est le seul nombre premier pair.'],
        (rng) => {
          const q = rng.pick([
            {
              p: '1 est-il un nombre premier ?',
              a: 'Non',
              w: 'Oui',
              why: 'Un nombre premier a **exactement deux** diviseurs ; 1 n’en a qu’un.',
            },
            {
              p: '2 est-il un nombre premier ?',
              a: 'Oui',
              w: 'Non',
              why: '2 a exactement deux diviseurs : 1 et 2. C’est le seul premier pair.',
            },
            {
              p: '51 est-il un nombre premier ?',
              a: 'Non',
              w: 'Oui',
              why: '5 + 1 = 6 : 51 est divisible par 3 (51 = 3 × 17).',
            },
          ]);
          return {
            prompt: q.p,
            ...choice(rng, q.a, [{ label: q.w, why: q.why }], true),
            hint: 'Un nombre premier a exactement deux diviseurs distincts.',
            steps: [q.why, `Réponse : **${q.a}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
