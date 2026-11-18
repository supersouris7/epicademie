import { choice, distinct, fraction, nonZero, num, traps } from '../build.ts';
import { add, dec, fmt, frac, gcd, mul, r, type Rational } from '../rational.ts';
import type { Block, Chapter, Figure } from '../types.ts';
import { bossOf, chapterOf, MINUS, NAMES, par, sgn, skillsOf } from './kit.ts';

/** Programme de 3e (cycle 4, BO n°10 du 5 mars 2026), dans l'ordre du programme. */
const S = skillsOf('3e');
const C = chapterOf('3e');

const PRIMES = [2, 3, 5, 7, 11, 13];
const tenth = (x: number) => r(Math.round(x * 10), 10);
const unit = (x: number) => r(Math.round(x));
const DEG = Math.PI / 180;

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

/** Polynôme ax + b écrit proprement. */
const lin = (a: number, b: number, x = 'x') => {
  const ax = a === 1 ? x : a === -1 ? `${MINUS}${x}` : `${sgn(a)}${x}`;
  if (b === 0) return ax;
  return `${ax} ${b < 0 ? MINUS : '+'} ${Math.abs(b)}`;
};
/** Trinôme ax² + bx + c. */
const tri = (a: number, b: number, c: number) => {
  const parts: string[] = [];
  parts.push(a === 1 ? 'x^2' : a === -1 ? `${MINUS}x^2` : `${sgn(a)}x^2`);
  if (b) parts.push(`${b < 0 ? MINUS : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`);
  if (c) parts.push(`${c < 0 ? MINUS : '+'} ${Math.abs(c)}`);
  return parts.join(' ');
};

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

const arithmetique = C(
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

// ——— Puissances et notation scientifique ———

const exposantNegatif = S(
  'm3-exposant-negatif',
  'Puissances d’exposant négatif',
  'Définir les puissances d’exposant négatif d’un nombre',
  ['a^(−n) = {1/a^n}. 10^(−3) = {1/1000} = 0,001 ; 2^(−1) = {1/2}.'],
  (rng, level) => {
    const n = rng.int(1, 5);
    if (level === 1) {
      return {
        prompt: `Écris 10 puissance ${MINUS}${n} en écriture décimale.`,
        answer: num(r(1, 10 ** n)),
        traps: traps(r(1, 10 ** n), [
          [r(-(10 ** n)), 'Un exposant négatif ne donne pas un nombre négatif : c’est un inverse.'],
          [r(1, 10 ** (n + 1)), `Il y a ${n} chiffre${n > 1 ? 's' : ''} après la virgule (le 1 compris).`],
        ]),
        hint: `10 puissance ${MINUS}${n} = {1/10^${n}}.`,
        steps: [`10 puissance ${MINUS}${n} = {1/${fmt(r(10 ** n))}}.`, `= **${fmt(r(1, 10 ** n))}**.`],
        targetSeconds: 15,
      };
    }
    const a = rng.pick([2, 3, 4, 5]);
    const e = rng.int(1, a === 2 ? 4 : 2);
    return {
      prompt: `Écris ${a} puissance ${MINUS}${e} sous forme de fraction.`,
      answer: fraction(r(1, a ** e)),
      traps: traps(r(1, a ** e), [
        [r(-(a ** e)), 'Un exposant négatif donne un **inverse**, pas un nombre négatif.'],
        [r(1, a * e), `${a}^${e} n’est pas ${a} × ${e}.`],
      ]),
      hint: `${a} puissance ${MINUS}${e} = {1/${a}^${e}}.`,
      steps: [`${a}^${e} = ${a ** e}.`, `${a} puissance ${MINUS}${e} = **{1/${a ** e}}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const quotientPuissances = S(
  'm3-quotient-puissances',
  'Multiplier et diviser des puissances',
  'Multiplier et diviser des puissances',
  ['a^m × a^n = a^(m+n) ; a^m ÷ a^n = a^(m−n). 10^5 ÷ 10^2 = 10^3.'],
  (rng) => {
    const m = rng.int(3, 9);
    const n = rng.int(1, m + 3);
    const divide = rng.int(0, 1) === 1;
    const res = divide ? m - n : m + n;
    return {
      prompt: `10^${m} ${divide ? '÷' : '×'} 10^${n} = 10 puissance … : quel est l’exposant ?`,
      answer: num(res),
      traps: traps(r(res), [
        [
          divide ? m + n : m * n,
          divide
            ? 'Pour diviser, on **soustrait** les exposants.'
            : 'Pour multiplier, on **additionne** les exposants.',
        ],
      ]),
      hint: divide ? 'Diviser : on soustrait les exposants.' : 'Multiplier : on additionne les exposants.',
      steps: [divide ? `${m} − ${n} = ${sgn(res)}.` : `${m} + ${n} = ${res}.`, `L’exposant est **${sgn(res)}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const notationScientifique = S(
  'm3-notation-scientifique',
  'Notation scientifique',
  'Déterminer la notation scientifique d’un nombre',
  ['Notation scientifique : a × 10^n avec **1 ≤ a < 10**. 45 000 = 4,5 × 10^4 ; 0,0032 = 3,2 × 10^(−3).'],
  (rng, level) => {
    const digits = rng.int(11, 99);
    const big = level !== 3;
    const n = big ? rng.int(3, 8) : -rng.int(2, 6);
    const value = big ? mul(r(digits), r(10 ** (n - 1))) : mul(r(digits), r(1, 10 ** (-n + 1)));
    return {
      prompt: `Écris ${fmt(value)} en notation scientifique : ${fmt(r(digits, 10))} × 10 puissance … Quel est l’exposant ?`,
      answer: num(n),
      traps: traps(r(n), [
        [
          n + (big ? -1 : 1),
          'Compte de combien de rangs la virgule se déplace pour obtenir ' + fmt(r(digits, 10)) + '.',
        ],
        [
          -n,
          big ? 'Un grand nombre : l’exposant est positif.' : 'Un nombre plus petit que 1 : l’exposant est négatif.',
        ],
      ]),
      hint: `De combien de rangs faut-il déplacer la virgule pour passer de ${fmt(r(digits, 10))} à ${fmt(value)} ?`,
      steps: [
        `${fmt(r(digits, 10))} × 10 puissance ${sgn(n)} = ${fmt(value)} : la virgule se déplace de ${Math.abs(n)} rangs.`,
        `L’exposant est **${sgn(n)}**.`,
      ],
      targetSeconds: 30,
    };
  },
  { mental: true },
);

const problemesPuissances = S(
  'm3-problemes-scientifique',
  'Problèmes en notation scientifique',
  'Résoudre des problèmes notamment en utilisant la notation scientifique',
  ['Pour multiplier en notation scientifique : (a × 10^m) × (b × 10^n) = (a × b) × 10^(m+n).'],
  (rng) => {
    const a = rng.int(2, 4);
    const m = rng.int(3, 6);
    const b = rng.int(2, 3);
    const n = rng.int(2, 4);
    return {
      prompt: `Calcule (${a} × 10^${m}) × (${b} × 10^${n}). Le résultat s’écrit ${a * b} × 10 puissance … : quel est l’exposant ?`,
      answer: num(m + n),
      traps: traps(r(m + n), [[m * n, 'On additionne les exposants des puissances de 10.']]),
      hint: 'Multiplie les nombres devant, et additionne les exposants.',
      steps: [`${a} × ${b} = ${a * b} et 10^${m} × 10^${n} = 10 puissance ${m + n}.`, `L’exposant est **${m + n}**.`],
      targetSeconds: 25,
    };
  },
  { mental: true },
);

const puissances = C(
  'm3-puissances',
  'nombres',
  'Puissances et notation scientifique',
  [exposantNegatif, quotientPuissances, notationScientifique, problemesPuissances],
  bossOf(
    [
      S(
        'm3-boss-puissances-lumiere',
        'Problème : la lumière du Soleil',
        'Résoudre des problèmes notamment en utilisant la notation scientifique',
        ['Durée = distance ÷ vitesse. La lumière va à environ 3 × 10^5 km/s ; le Soleil est à environ 1,5 × 10^8 km.'],
        () => {
          return {
            prompt:
              'La lumière parcourt environ 3 × 10^5 km par seconde. Le Soleil est à environ 1,5 × 10^8 km de la Terre. Combien de secondes met sa lumière pour nous parvenir ?',
            answer: num(500, 's'),
            traps: traps(r(500), [
              [50, 'Calcule bien les puissances : 10^8 ÷ 10^5 = 10^3.'],
              [r(45, 1), 'Il faut diviser, pas multiplier.'],
            ]),
            hint: 'Divise la distance par la vitesse.',
            steps: [
              '1,5 × 10^8 ÷ (3 × 10^5) = (1,5 ÷ 3) × 10^3 = 0,5 × 10^3.',
              '= **500 s** (un peu plus de 8 minutes).',
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-puissances-cellules',
        'Problème : la taille d’une cellule',
        'Résoudre des problèmes notamment en utilisant la notation scientifique',
        ['1 µm = 10^(−6) m. Combien de cellules de 10 µm alignées sur 1 cm ? 10^(−2) ÷ 10^(−5) = 10^3.'],
        (rng) => {
          const size = rng.pick([10, 20, 50]);
          const count = 10000 / size;
          return {
            prompt: `Une cellule mesure environ ${size} µm (1 µm = 10 puissance ${MINUS}6 m). Combien de cellules peut-on aligner sur 1 cm ?`,
            answer: num(count),
            traps: traps(r(count), [
              [count * 10, '1 cm = 10 000 µm.'],
              [count / 10, '1 cm = 10 000 µm.'],
            ]),
            hint: 'Convertis 1 cm en µm : 1 cm = 10 000 µm.',
            steps: ['1 cm = 10 puissance −2 m = 10 000 µm.', `10 000 ÷ ${size} = **${count}** cellules.`],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm3-boss-puissances-piege',
        'Piège : 10^(−2) est-il négatif ?',
        'Définir les puissances d’exposant négatif d’un nombre',
        ['10 puissance −2 = 0,01 : un exposant négatif donne un nombre **positif** plus petit que 1.'],
        (rng) => ({
          prompt: '10 puissance −2 est-il un nombre négatif ?',
          ...choice(rng, 'Non, il vaut 0,01', [
            { label: 'Oui, il vaut −100', why: 'L’exposant négatif signifie « inverse » : {1/100}.' },
            { label: 'Oui, il vaut −20', why: '10 puissance −2 = {1/10^2}.' },
          ]),
          hint: '10 puissance −2 = {1/10^2}.',
          steps: ['10 puissance −2 = {1/100}.', '**Non, il vaut 0,01**, un nombre positif.'],
          targetSeconds: 15,
        }),
      ),
    ],
  ),
);

// ——— Racine carrée : x² = a ———

const equationCarre = S(
  'm3-equation-carre',
  'Résoudre x² = a',
  'Résoudre analytiquement et graphiquement des équations de la forme x² = a',
  ['x^2 = a : si a > 0, **deux solutions** √a et −√a ; si a = 0, une seule (0) ; si a < 0, **aucune**.'],
  (rng, level) => {
    if (level === 3) {
      const a = rng.pick([-rng.int(1, 30), 0, rng.int(1, 12) ** 2]);
      const n = a > 0 ? 2 : a === 0 ? 1 : 0;
      return {
        prompt: `Combien de solutions a l’équation x^2 = ${sgn(a)} ?`,
        answer: num(n),
        traps: traps(r(n), [
          [
            a > 0 ? 1 : a === 0 ? 2 : 1,
            a > 0
              ? `${Math.sqrt(a)} et ${MINUS}${Math.sqrt(a)} conviennent tous les deux.`
              : a === 0
                ? 'Seul 0 a pour carré 0.'
                : 'Un carré n’est jamais négatif.',
          ],
        ]),
        hint: 'Un carré est toujours positif ou nul.',
        steps: [
          a > 0
            ? `${Math.sqrt(a)}^2 = ${a} et (${MINUS}${Math.sqrt(a)})^2 = ${a}.`
            : a === 0
              ? 'Seul 0 a pour carré 0.'
              : 'Un carré est toujours positif : impossible.',
          `**${n}** solution${n > 1 ? 's' : ''}.`,
        ],
        targetSeconds: 25,
      };
    }
    const s = rng.int(2, 12);
    return {
      prompt: `L’équation x^2 = ${s * s} a deux solutions. Donne la solution **négative**.`,
      answer: num(-s),
      traps: traps(r(-s), [
        [s, 'C’est la solution positive.'],
        [r(-(s * s), 2), 'La solution est la racine carrée, avec un signe −.'],
      ]),
      hint: `Quels nombres ont pour carré ${s * s} ?`,
      steps: [`${s}^2 = ${s * s} et (${MINUS}${s})^2 = ${s * s}.`, `La solution négative est **${MINUS}${s}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const problemesRacine = S(
  'm3-problemes-racine',
  'Problèmes avec la racine carrée',
  'Résoudre des problèmes utilisant la racine carrée',
  ['Un carré d’aire 50 m^2 a un côté de √50 ≈ 7,1 m.'],
  (rng) => {
    let a = rng.int(10, 200);
    while (Number.isInteger(Math.sqrt(a))) a++;
    const c = Math.sqrt(a);
    return {
      prompt: `Une parcelle carrée a une aire de ${a} m^2. Quelle est la longueur de son côté, arrondie au dixième ?`,
      answer: { ...num(tenth(c), 'm'), round: 1 },
      traps: traps(tenth(c), [
        [r(a, 4), 'Ce n’est pas le quart de l’aire : côté × côté = aire.'],
        [r(a, 2), 'Côté × côté = aire : prends la racine carrée.'],
      ]),
      hint: 'Côté = √aire.',
      steps: [`Côté = √${a}.`, `≈ **${fmt(tenth(c))} m**.`],
      targetSeconds: 30,
    };
  },
  { advice: 'calculatrice' },
);

const racines = C(
  'm3-racines',
  'nombres',
  'Racine carrée et équations x² = a',
  [equationCarre, problemesRacine],
  bossOf(
    [
      S(
        'm3-boss-racines-chute',
        'Problème : la chute d’un objet',
        'Résoudre des problèmes utilisant la racine carrée',
        ['Un objet lâché parcourt environ 5 × t^2 mètres en t secondes. Pour 45 m : t^2 = 9, t = 3 s.'],
        (rng) => {
          const t = rng.int(2, 6);
          const h = 5 * t * t;
          return {
            prompt: `Un caillou lâché d’une hauteur h (en m) met t secondes à tomber, avec h ≈ 5 × t^2. Du haut d’une falaise de ${h} m, combien de secondes met-il ?`,
            answer: num(t, 's'),
            traps: traps(r(t), [
              [r(h, 5), `${h} ÷ 5 = ${h / 5}, c’est t^2 : il reste à prendre la racine.`],
              [r(h, 10), 't^2 = h ÷ 5, puis racine carrée.'],
            ]),
            hint: `t^2 = ${h} ÷ 5.`,
            steps: [`t^2 = ${h} ÷ 5 = ${t * t}.`, `t = √${t * t} = **${t} s**.`],
            targetSeconds: 50,
          };
        },
      ),
      S(
        'm3-boss-racines-tapis',
        'Problème : agrandir un tapis',
        'Résoudre des problèmes utilisant la racine carrée',
        ['Pour doubler l’aire d’un carré, son côté est multiplié par √2 ≈ 1,41.'],
        (rng) => {
          const c = rng.int(2, 9);
          const area = 2 * c * c;
          const side = Math.sqrt(area);
          return {
            prompt: `Un tapis carré de ${c} m de côté. On en veut un autre, carré, d’aire double. Quel sera son côté, arrondi au dixième ?`,
            answer: { ...num(tenth(side), 'm'), round: 1 },
            traps: traps(tenth(side), [[2 * c, 'Doubler le côté multiplie l’aire par 4.']]),
            hint: `Aire voulue : 2 × ${c}^2. Puis côté = √aire.`,
            steps: [`Aire voulue : 2 × ${c * c} = ${area} m^2.`, `Côté = √${area} ≈ **${fmt(tenth(side))} m**.`],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm3-boss-racines-piege',
        'Piège : une seule solution ?',
        'Résoudre analytiquement et graphiquement des équations de la forme x² = a',
        ['x^2 = 25 a deux solutions : 5 et −5. Ne pas oublier la négative !'],
        (rng) => {
          const s = rng.int(2, 12);
          return {
            prompt: `Quelles sont les solutions de x^2 = ${s * s} ?`,
            ...choice(rng, `${s} et ${MINUS}${s}`, [
              { label: `${s} seulement`, why: `(${MINUS}${s})^2 = ${s * s} aussi.` },
              { label: `${s * s} et ${MINUS}${s * s}`, why: `Cherche les nombres dont le carré vaut ${s * s}.` },
            ]),
            hint: 'Un nombre et son opposé ont le même carré.',
            steps: [`${s}^2 = ${s * s} et (${MINUS}${s})^2 = ${s * s}.`, `Solutions : **${s} et ${MINUS}${s}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

// ——— Calcul littéral ———

const doubleDistributivite = S(
  'm3-double-distributivite',
  'Double distributivité',
  'Utiliser la double distributivité pour développer et factoriser des expressions dont le facteur est apparent',
  [
    '(a + b)(c + d) = ac + ad + bc + bd : chaque terme de la 1re parenthèse multiplie chaque terme de la 2e.',
    '(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6.',
  ],
  (rng, level) => {
    const a = level === 1 ? rng.int(1, 6) : nonZero(rng, -7, 7);
    const b = level === 1 ? rng.int(1, 6) : nonZero(rng, -7, 7);
    const good = tri(1, a + b, a * b);
    return {
      prompt: `Développe et réduis (x ${a < 0 ? MINUS : '+'} ${Math.abs(a)})(x ${b < 0 ? MINUS : '+'} ${Math.abs(b)}).`,
      ...choice(rng, good, [
        { label: tri(1, 0, a * b), why: 'Il manque les termes « croisés » : x × b et a × x.' },
        { label: tri(1, a * b, a + b), why: 'Les nombres se multiplient (a × b) et les x s’additionnent.' },
        { label: tri(2, a + b, a * b), why: 'x × x = x^2, pas 2x^2.' },
      ]),
      hint: 'Chaque terme de la 1re parenthèse multiplie chaque terme de la 2e : 4 produits.',
      steps: [
        `x × x + x × ${par(b)} + ${par(a)} × x + ${par(a)} × ${par(b)}.`,
        `= x^2 ${a + b < 0 ? MINUS : '+'} ${Math.abs(a + b)}x ${a * b < 0 ? MINUS : '+'} ${Math.abs(a * b)} = **${good}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const identites = S(
  'm3-identites',
  'Identités remarquables',
  'Manipuler les trois identités remarquables pour développer et factoriser',
  ['(a + b)^2 = a^2 + 2ab + b^2 ; (a − b)^2 = a^2 − 2ab + b^2 ; (a − b)(a + b) = a^2 − b^2.'],
  (rng, level) => {
    const b = rng.int(1, 9);
    const kind = level === 1 ? 'plus' : level === 2 ? 'moins' : 'diff';
    if (kind === 'diff') {
      const good = `(x ${MINUS} ${b})(x + ${b})`;
      return {
        prompt: `Factorise x^2 ${MINUS} ${b * b}.`,
        ...choice(rng, good, [
          { label: `(x ${MINUS} ${b})^2`, why: `(x − ${b})^2 = x^2 − ${2 * b}x + ${b * b}.` },
          { label: `(x ${MINUS} ${b * b})(x + ${b * b})`, why: `${b * b} = ${b}^2 : on utilise ${b}.` },
        ]),
        hint: `a^2 − b^2 = (a − b)(a + b), avec ${b * b} = ${b}^2.`,
        steps: [`x^2 ${MINUS} ${b * b} = x^2 ${MINUS} ${b}^2.`, `= **${good}**.`],
        targetSeconds: 30,
      };
    }
    const plus = kind === 'plus';
    const good = tri(1, plus ? 2 * b : -2 * b, b * b);
    return {
      prompt: `Développe (x ${plus ? '+' : MINUS} ${b})^2.`,
      ...choice(rng, good, [
        { label: tri(1, 0, b * b), why: 'Il manque le double produit 2 × x × ' + String(b) + '.' },
        { label: tri(1, plus ? b : -b, b * b), why: `Le double produit vaut 2 × x × ${b} = ${2 * b}x.` },
        {
          label: tri(1, plus ? 2 * b : -2 * b, plus ? 2 * b : -(b * b)),
          why: `${b}^2 = ${b * b}${plus ? '' : ', positif'}.`,
        },
      ]),
      hint: plus ? '(a + b)^2 = a^2 + 2ab + b^2.' : '(a − b)^2 = a^2 − 2ab + b^2.',
      steps: [`a = x, b = ${b} : a^2 = x^2, 2ab = ${2 * b}x, b^2 = ${b * b}.`, `= **${good}**.`],
      targetSeconds: 30,
    };
  },
);

const produitNul = S(
  'm3-produit-nul',
  'Équation produit nul',
  'Résoudre une équation produit nul',
  ['Un produit est nul si et seulement si **l’un de ses facteurs** est nul : (x − 3)(x + 5) = 0 ⟺ x = 3 ou x = −5.'],
  (rng) => {
    const a = nonZero(rng, -9, 9);
    let b = nonZero(rng, -9, 9);
    if (b === a) b = -a || 1;
    const sols = [a, b].sort((p, q) => p - q);
    const good = `${sgn(sols[0] ?? 0)} et ${sgn(sols[1] ?? 0)}`;
    const f = (v: number) => `(x ${v < 0 ? '+' : MINUS} ${Math.abs(v)})`;
    return {
      prompt: `Résous ${f(a)}${f(b)} = 0.`,
      ...choice(rng, good, [
        {
          label: `${sgn(-(sols[0] ?? 0))} et ${sgn(-(sols[1] ?? 0))}`,
          why: `x − ${Math.abs(a)} = 0 donne x = ${Math.abs(a)} : attention au signe.`,
        },
        { label: sgn(a * b), why: 'Un produit nul : on annule **chaque** facteur séparément.' },
      ]),
      hint: 'Un produit est nul quand l’un des facteurs est nul : annule chaque parenthèse.',
      steps: [`${f(a)} = 0 donne x = ${sgn(a)} ; ${f(b)} = 0 donne x = ${sgn(b)}.`, `Solutions : **${good}**.`],
      targetSeconds: 30,
    };
  },
);

const inequation = S(
  'm3-inequation',
  'Inéquation ax ≥ b',
  'Résoudre analytiquement et graphiquement une inéquation du premier degré du type ax ⩾ b',
  ['On résout comme une équation, mais **diviser par un nombre négatif change le sens** : −2x ≥ 6 ⟺ x ≤ −3.'],
  (rng, level) => {
    const a = level === 3 ? -rng.int(2, 6) : rng.int(2, 9);
    const s = nonZero(rng, -9, 9);
    const b = a * s;
    const good = a > 0 ? `x ≥ ${sgn(s)}` : `x ≤ ${sgn(s)}`;
    return {
      prompt: `Résous ${sgn(a)}x ≥ ${sgn(b)}.`,
      ...choice(rng, good, [
        {
          label: a > 0 ? `x ≤ ${sgn(s)}` : `x ≥ ${sgn(s)}`,
          why:
            a > 0
              ? 'On divise par un nombre positif : le sens ne change pas.'
              : 'On divise par un nombre **négatif** : le sens change.',
        },
        { label: `x ≥ ${sgn(b - a)}`, why: `On divise par ${sgn(a)}, on ne soustrait pas.` },
      ]),
      hint: `Divise les deux membres par ${sgn(a)}${a < 0 ? ' (attention, il est négatif)' : ''}.`,
      steps: [`On divise par ${sgn(a)}${a < 0 ? ', négatif : le sens s’inverse' : ''}.`, `**${good}**.`],
      targetSeconds: 30,
    };
  },
);

const opposeExpression = S(
  'm3-oppose-expression',
  'Supprimer des parenthèses précédées de −',
  'Prendre l’opposé d’une expression : savoir que – (5 – 4x) = –5 + 4x (automatisme)',
  ['Un signe − devant une parenthèse change **tous** les signes à l’intérieur : −(5 − 4x) = −5 + 4x.'],
  (rng) => {
    const a = nonZero(rng, -9, 9);
    const b = nonZero(rng, -9, 9);
    const inside = lin(a, b);
    const good = lin(-a, -b);
    return {
      prompt: `Supprime les parenthèses : ${MINUS}(${inside}).`,
      ...choice(rng, good, [
        { label: lin(-a, b), why: 'Le − change **tous** les signes.' },
        { label: lin(a, -b), why: 'Le − change **tous** les signes, y compris le premier.' },
      ]),
      hint: 'Change le signe de chaque terme de la parenthèse.',
      steps: [`On change le signe de ${lin(a, 0)} et de ${sgn(b)}.`, `${MINUS}(${inside}) = **${good}**.`],
      targetSeconds: 20,
    };
  },
);

const litteral = C(
  'm3-litteral',
  'nombres',
  'Calcul littéral et équations',
  [doubleDistributivite, identites, produitNul, inequation, opposeExpression],
  bossOf(
    [
      S(
        'm3-boss-litteral-cadre',
        'Problème : le cadre photo',
        'Utiliser la double distributivité pour développer et factoriser des expressions dont le facteur est apparent',
        ['Un carré de côté x + 2 a pour aire (x + 2)^2 = x^2 + 4x + 4.'],
        (rng) => {
          const b = rng.int(1, 5);
          const x = rng.int(5, 20);
          return {
            prompt: `Une photo carrée de côté x cm est entourée d’un cadre de ${b} cm de large de chaque côté. Pour x = ${x}, quelle est l’aire du cadre seul (sans la photo), en cm^2 ?`,
            answer: num((x + 2 * b) ** 2 - x * x, 'cm^2'),
            traps: traps(r((x + 2 * b) ** 2 - x * x), [
              [(x + 2 * b) ** 2, 'Il faut enlever l’aire de la photo.'],
              [(x + b) ** 2 - x * x, `Le cadre ajoute ${b} cm **de chaque côté** : le grand côté vaut x + ${2 * b}.`],
            ]),
            hint: `Grand carré de côté x + ${2 * b}, moins la photo de côté x.`,
            steps: [
              `Grand carré : (${x} + ${2 * b})^2 = ${(x + 2 * b) ** 2}. Photo : ${x}^2 = ${x * x}.`,
              `Cadre : ${(x + 2 * b) ** 2} − ${x * x} = **${(x + 2 * b) ** 2 - x * x} cm^2**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm3-boss-litteral-astuce',
        'Problème : le calcul astucieux',
        'Manipuler les trois identités remarquables pour développer et factoriser',
        ['101^2 = (100 + 1)^2 = 10 000 + 200 + 1 = 10 201. Et 99 × 101 = (100 − 1)(100 + 1) = 10 000 − 1.'],
        (rng) => {
          const k = rng.int(1, 4);
          const res = 10000 - k * k;
          return {
            prompt: `Sans calculatrice : ${100 - k} × ${100 + k} = ?`,
            answer: num(res),
            traps: traps(r(res), [[10000, `(a − b)(a + b) = a^2 − b^2 : il faut enlever ${k}^2.`]]),
            hint: `Pense à (100 − ${k})(100 + ${k}).`,
            steps: [`(100 − ${k})(100 + ${k}) = 100^2 − ${k}^2.`, `= 10 000 − ${k * k} = **${res}**.`],
            targetSeconds: 45,
          };
        },
        { mental: true },
      ),
    ],
    [
      S(
        'm3-boss-litteral-piege',
        'Piège : (x + 3)^2',
        'Manipuler les trois identités remarquables pour développer et factoriser',
        ['(x + 3)^2 n’est **pas** x^2 + 9 : il manque le double produit 6x.'],
        (rng) => {
          const b = rng.int(2, 9);
          return {
            prompt: `(x + ${b})^2 = x^2 + ${b * b} ?`,
            ...choice(rng, `Non : x^2 + ${2 * b}x + ${b * b}`, [
              { label: 'Oui', why: `Teste x = 1 : (1 + ${b})^2 = ${(1 + b) ** 2}, mais 1 + ${b * b} = ${1 + b * b}.` },
            ]),
            hint: 'Teste avec x = 1.',
            steps: [
              `Pour x = 1 : (1 + ${b})^2 = ${(1 + b) ** 2} ≠ ${1 + b * b}.`,
              `**Non : x^2 + ${2 * b}x + ${b * b}**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

// ——— Thalès ———

const thalesFigure = (butterfly: boolean): Figure =>
  butterfly
    ? {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 4 },
          { name: 'M', x: 3, y: 2 },
          { name: 'B', x: 0, y: 0 },
        ],
        extra: [
          { from: { x: 3, y: 2 }, to: { x: 7.5, y: -1 }, label: 'N' },
          { from: { x: 3, y: 2 }, to: { x: 7.5, y: 5 }, label: 'P' },
          { from: { x: 7.5, y: 5 }, to: { x: 7.5, y: -1 } },
        ],
      }
    : {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 0, y: 0 },
          { name: 'B', x: 8, y: 0 },
          { name: 'C', x: 3, y: 5 },
        ],
        extra: [{ from: { x: 1.2, y: 2 }, to: { x: 6, y: 2 }, label: '(MN)' }],
      };

const thalesLongueur = S(
  'm3-thales-longueur',
  'Thalès : calculer une longueur',
  'Connaitre et appliquer le théorème de Thalès, sa réciproque, sa contraposée (configurations des triangles emboités et configuration dite du papillon)',
  [
    'Si (MN) // (BC), avec M sur [AB] et N sur [AC] : {AM/AB} = {AN/AC} = {MN/BC}. On écrit les rapports puis on fait un produit en croix.',
  ],
  (rng, level) => {
    const k = rng.pick([r(1, 2), r(1, 3), r(2, 3), r(3, 4), r(2, 5), r(3, 5)]);
    const ab = rng.int(2, 6) * k.d;
    const bc = rng.int(2, 8) * k.d;
    const am = mul(r(ab), k);
    const mn = mul(r(bc), k);
    const askBig = level === 3;
    return {
      prompt: askBig
        ? `Dans le triangle ABC, M ∈ [AB], N ∈ [AC] et (MN) // (BC). AM = ${fmt(am)} cm, AB = ${ab} cm et MN = ${fmt(mn)} cm. Calcule BC.`
        : `Dans le triangle ABC, M ∈ [AB], N ∈ [AC] et (MN) // (BC). AM = ${fmt(am)} cm, AB = ${ab} cm et BC = ${bc} cm. Calcule MN.`,
      figure: thalesFigure(false),
      answer: num(askBig ? r(bc) : mn, 'cm'),
      traps: traps(askBig ? r(bc) : mn, [
        [askBig ? mul(mn, k) : mul(r(bc), r(k.d, k.n)), 'Écris bien les rapports : petit triangle sur grand triangle.'],
      ]),
      hint: '{AM/AB} = {MN/BC} : écris l’égalité puis fais un produit en croix.',
      steps: [
        `{AM/AB} = {MN/BC} : {${fmt(am)}/${ab}} = ${askBig ? `{${fmt(mn)}/BC}` : `{MN/${bc}}`}.`,
        askBig
          ? `BC = ${fmt(mn)} × ${ab} ÷ ${fmt(am)} = **${bc} cm**.`
          : `MN = ${fmt(am)} × ${bc} ÷ ${ab} = **${fmt(mn)} cm**.`,
      ],
      targetSeconds: 60,
    };
  },
  { advice: 'calculatrice' },
);

const thalesPapillon = S(
  'm3-thales-papillon',
  'Thalès : configuration papillon',
  'Connaitre et appliquer le théorème de Thalès, sa réciproque, sa contraposée (configurations des triangles emboités et configuration dite du papillon)',
  ['Papillon : les droites (AN) et (BP) se coupent en M, et (AB) // (NP). Alors {MA/MN} = {MB/MP} = {AB/NP}.'],
  (rng) => {
    const k = rng.int(2, 4);
    const ma = rng.int(2, 6);
    const ab = rng.int(2, 6);
    return {
      prompt: `Les droites (AN) et (BP) se coupent en M, et (AB) // (NP). MA = ${ma} cm, MN = ${ma * k} cm et AB = ${ab} cm. Calcule NP.`,
      figure: thalesFigure(true),
      answer: num(ab * k, 'cm'),
      traps: traps(r(ab * k), [[r(ab, k), 'Le grand triangle est du côté de N et P : NP est plus grand que AB.']]),
      hint: '{MA/MN} = {AB/NP}.',
      steps: [
        `{MA/MN} = {AB/NP} : {${ma}/${ma * k}} = {${ab}/NP}.`,
        `NP = ${ab} × ${ma * k} ÷ ${ma} = **${ab * k} cm**.`,
      ],
      targetSeconds: 60,
    };
  },
  { advice: 'calculatrice' },
);

const thalesReciproque = S(
  'm3-thales-reciproque',
  'Les droites sont-elles parallèles ?',
  'Connaitre et appliquer le théorème de Thalès, sa réciproque, sa contraposée',
  [
    'On compare {AM/AB} et {AN/AC} (points alignés dans le même ordre) : égaux → parallèles (réciproque) ; différents → pas parallèles (contraposée).',
  ],
  (rng) => {
    const k = rng.pick([r(1, 2), r(1, 3), r(2, 3)]);
    const ab = rng.int(2, 5) * k.d;
    const ac = rng.int(2, 5) * k.d;
    const parallel = rng.int(0, 1) === 1;
    const am = mul(r(ab), k);
    const an = parallel ? mul(r(ac), k) : add(mul(r(ac), k), r(1, 2));
    return {
      prompt: `A, M, B sont alignés, ainsi que A, N, C (dans cet ordre). AM = ${fmt(am)}, AB = ${ab}, AN = ${fmt(an)}, AC = ${ac}. Les droites (MN) et (BC) sont-elles parallèles ?`,
      ...choice(
        rng,
        parallel ? 'Oui' : 'Non',
        [{ label: parallel ? 'Non' : 'Oui', why: `Compare {AM/AB} = ${fmt2(am, ab)} et {AN/AC} = ${fmt2(an, ac)}.` }],
        true,
      ),
      hint: 'Calcule {AM/AB} et {AN/AC} et compare-les.',
      steps: [
        `{AM/AB} ≈ ${fmt2(am, ab)} et {AN/AC} ≈ ${fmt2(an, ac)}.`,
        parallel
          ? 'Égaux : d’après la réciproque de Thalès, **oui**.'
          : 'Différents : d’après la contraposée, **non**.',
      ],
      targetSeconds: 60,
    };
  },
  { advice: 'calculatrice' },
);

/** Quotient arrondi au centième, écrit en français. */
function fmt2(a: Rational, b: number) {
  return fmt(r(Math.round((a.n / a.d / b) * 100), 100));
}

const thales = C(
  'm3-thales',
  'geometrie',
  'Théorème de Thalès',
  [thalesLongueur, thalesPapillon, thalesReciproque],
  bossOf(
    [
      S(
        'm3-boss-thales-arbre',
        'Problème : la hauteur de l’arbre',
        'Connaitre et appliquer le théorème de Thalès',
        [
          'L’ombre d’un bâton et celle d’un arbre forment deux triangles emboîtés : {hauteur arbre/hauteur bâton} = {ombre arbre/ombre bâton}.',
        ],
        (rng) => {
          const stick = rng.int(1, 2);
          const sShadow = rng.int(2, 4);
          const k = rng.int(4, 9);
          return {
            prompt: `Un bâton vertical de ${stick} m a une ombre de ${sShadow} m. Au même moment, l’ombre d’un arbre mesure ${sShadow * k} m. Quelle est la hauteur de l’arbre ?`,
            answer: num(stick * k, 'm'),
            traps: traps(r(stick * k), [
              [
                r(sShadow * k * sShadow, stick),
                'Écris bien : hauteur arbre ÷ hauteur bâton = ombre arbre ÷ ombre bâton.',
              ],
            ]),
            hint: `L’ombre de l’arbre est ${k} fois plus longue.`,
            steps: [`{h/${stick}} = {${sShadow * k}/${sShadow}} = ${k}.`, `h = ${k} × ${stick} = **${stick * k} m**.`],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm3-boss-thales-riviere',
        'Problème : la largeur de la rivière',
        'Connaitre et appliquer le théorème de Thalès (configuration dite du papillon)',
        ['Papillon : on mesure les petits côtés sur la rive accessible, Thalès donne la largeur.'],
        (rng) => {
          const a = rng.int(3, 8);
          const k = rng.int(3, 6);
          const b = rng.int(2, 6);
          return {
            prompt: `Pour mesurer une rivière, Inès forme un papillon : MA = ${a} m, MN = ${a * k} m (de l’autre côté) et AB = ${b} m avec (AB) // (NP). Quelle est la largeur NP ?`,
            figure: thalesFigure(true),
            answer: num(b * k, 'm'),
            traps: traps(r(b * k), [[b + a * k, 'Utilise les rapports de Thalès, pas une addition.']]),
            hint: '{MA/MN} = {AB/NP}.',
            steps: [`{${a}/${a * k}} = {${b}/NP}.`, `NP = ${b} × ${k} = **${b * k} m**.`],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-thales-piege',
        'Piège : le mauvais rapport',
        'Connaitre et appliquer le théorème de Thalès',
        [
          'Dans Thalès, on compare les côtés du **petit** triangle (AM, AN, MN) à ceux du **grand** (AB, AC, BC) — pas AM à MB.',
        ],
        (rng) => {
          const am = rng.int(2, 5);
          const mb = rng.int(2, 5);
          return {
            prompt: `(MN) // (BC), AM = ${am} cm et MB = ${mb} cm. Quel rapport vaut {MN/BC} ?`,
            ...choice(rng, `{${am}/${am + mb}}`, [
              { label: `{${am}/${mb}}`, why: 'On compare AM à AB (le côté entier), pas à MB.' },
              { label: `{${mb}/${am + mb}}`, why: 'Le petit triangle est AMN : on prend AM.' },
            ]),
            hint: 'AB = AM + MB.',
            steps: [`AB = ${am} + ${mb} = ${am + mb}.`, `{MN/BC} = {AM/AB} = **{${am}/${am + mb}}**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);

// ——— Trigonométrie ———

const rightAt = (angleLabel: string, labels: [string | null, string | null, string | null]): Figure => ({
  kind: 'polygon',
  vertices: [
    { name: 'A', x: 0, y: 0 },
    { name: 'B', x: 7, y: 0 },
    { name: 'C', x: 0, y: 4 },
  ],
  sideLabels: labels,
  angleLabels: [null, angleLabel, null],
  rightAngles: [0],
});

const trigoChoisir = S(
  'm3-trigo-choisir',
  'Quel rapport trigonométrique ?',
  'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
  ['cos = {adjacent/hypoténuse} ; sin = {opposé/hypoténuse} ; tan = {opposé/adjacent}. Astuce : « SOH CAH TOA ».'],
  (rng) => {
    const q = rng.pick([
      { known: 'le côté adjacent et l’hypoténuse', a: 'Le cosinus' },
      { known: 'le côté opposé et l’hypoténuse', a: 'Le sinus' },
      { known: 'le côté opposé et le côté adjacent', a: 'La tangente' },
    ]);
    return {
      prompt: `Dans un triangle rectangle, on connaît ${q.known} à un angle. Quel rapport utiliser pour trouver l’angle ?`,
      ...choice(
        rng,
        q.a,
        ['Le cosinus', 'Le sinus', 'La tangente']
          .filter((x) => x !== q.a)
          .map((x) => ({
            label: x,
            why: 'CAH : cos = adjacent/hypoténuse ; SOH : sin = opposé/hypoténuse ; TOA : tan = opposé/adjacent.',
          })),
        true,
      ),
      hint: 'SOH CAH TOA.',
      steps: [`On connaît ${q.known}.`, `On utilise **${q.a.toLowerCase()}**.`],
      targetSeconds: 20,
    };
  },
);

const trigoLongueur = S(
  'm3-trigo-longueur',
  'Calculer une longueur avec la trigonométrie',
  'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
  ['ABC rectangle en A : cos(B) = {AB/BC}, donc AB = BC × cos(B). Calculatrice en **degrés** !'],
  (rng, level) => {
    const angle = rng.int(20, 70);
    const bc = rng.int(5, 20);
    const kind = level === 1 ? 'cos' : level === 2 ? 'sin' : 'tan';
    if (kind === 'tan') {
      const ab = rng.int(4, 15);
      const ac = ab * Math.tan(angle * DEG);
      return {
        prompt: `ABC est rectangle en A, AB = ${ab} cm et l’angle B mesure ${angle}°. Calcule AC, arrondi au dixième.`,
        figure: rightAt(`${angle}°`, [`${ab} cm`, null, '?']),
        answer: { ...num(tenth(ac), 'cm'), round: 1 },
        traps: traps(tenth(ac), [
          [tenth(ab / Math.tan(angle * DEG)), 'tan(B) = {AC/AB} : on multiplie par AB.'],
          [tenth(ab * Math.sin(angle * DEG)), 'AC est opposé à B et AB adjacent : c’est la tangente.'],
        ]),
        hint: 'AC est opposé à B, AB adjacent : tan(B) = {AC/AB}.',
        steps: [`tan(${angle}°) = {AC/${ab}}, donc AC = ${ab} × tan(${angle}°).`, `AC ≈ **${fmt(tenth(ac))} cm**.`],
        targetSeconds: 50,
      };
    }
    const v = kind === 'cos' ? bc * Math.cos(angle * DEG) : bc * Math.sin(angle * DEG);
    const side = kind === 'cos' ? 'AB' : 'AC';
    return {
      prompt: `ABC est rectangle en A, BC = ${bc} cm et l’angle B mesure ${angle}°. Calcule ${side}, arrondi au dixième.`,
      figure: rightAt(`${angle}°`, [kind === 'cos' ? '?' : null, `${bc} cm`, kind === 'sin' ? '?' : null]),
      answer: { ...num(tenth(v), 'cm'), round: 1 },
      traps: traps(tenth(v), [
        [
          tenth(kind === 'cos' ? bc * Math.sin(angle * DEG) : bc * Math.cos(angle * DEG)),
          kind === 'cos' ? 'AB est **adjacent** à B : c’est le cosinus.' : 'AC est **opposé** à B : c’est le sinus.',
        ],
        [tenth(bc / Math.cos(angle * DEG)), 'On multiplie par l’hypoténuse, on ne divise pas.'],
      ]),
      hint: kind === 'cos' ? 'cos(B) = {AB/BC}.' : 'sin(B) = {AC/BC}.',
      steps: [
        `${kind}(${angle}°) = {${side}/${bc}}, donc ${side} = ${bc} × ${kind}(${angle}°).`,
        `${side} ≈ **${fmt(tenth(v))} cm**.`,
      ],
      targetSeconds: 50,
    };
  },
  { advice: 'calculatrice' },
);

const trigoAngle = S(
  'm3-trigo-angle',
  'Calculer un angle avec la trigonométrie',
  'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
  ['Si cos(B) = 0,5, alors B = arccos(0,5) = 60° (touches « cos^(−1) » ou « Acs » de la calculatrice).'],
  (rng) => {
    const ab = rng.int(3, 12);
    const bc = rng.int(ab + 2, ab + 10);
    const angle = Math.acos(ab / bc) / DEG;
    return {
      prompt: `ABC est rectangle en A, AB = ${ab} cm et BC = ${bc} cm. Calcule l’angle B, arrondi au degré.`,
      figure: rightAt('?', [`${ab} cm`, `${bc} cm`, null]),
      answer: { ...num(unit(angle), '°'), round: 0 },
      traps: traps(unit(angle), [
        [unit(Math.asin(ab / bc) / DEG), 'AB est **adjacent** à B : c’est le cosinus.'],
        [unit(90 - angle + 0.0001), 'Ça, c’est l’angle C.'],
      ]),
      hint: 'AB est adjacent à B, BC est l’hypoténuse : cos(B) = {AB/BC}.',
      steps: [`cos(B) = {${ab}/${bc}}.`, `B = arccos({${ab}/${bc}}) ≈ **${fmt(unit(angle))}°**.`],
      targetSeconds: 50,
    };
  },
  { advice: 'calculatrice' },
);

const trigonometrie = C(
  'm3-trigonometrie',
  'geometrie',
  'Trigonométrie',
  [trigoChoisir, trigoLongueur, trigoAngle],
  bossOf(
    [
      S(
        'm3-boss-trigo-rampe',
        'Problème : la rampe d’accès',
        'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
        ['Une rampe de longueur L qui monte d’un angle a s’élève de L × sin(a).'],
        (rng) => {
          const L = rng.int(4, 12);
          const a = rng.int(3, 10);
          const h = L * Math.sin(a * DEG);
          return {
            prompt: `Une rampe de ${L} m de long fait un angle de ${a}° avec le sol. De quelle hauteur monte-t-elle, en m, arrondi au centième ?`,
            answer: { ...num(r(Math.round(h * 100), 100), 'm'), round: 2 },
            traps: traps(r(Math.round(h * 100), 100), [
              [r(Math.round(L * Math.cos(a * DEG) * 100), 100), 'La hauteur est **opposée** à l’angle : sinus.'],
            ]),
            hint: 'La rampe est l’hypoténuse, la hauteur est opposée à l’angle.',
            steps: [
              `sin(${a}°) = {h/${L}}, donc h = ${L} × sin(${a}°).`,
              `h ≈ **${fmt(r(Math.round(h * 100), 100))} m**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-trigo-cerf',
        'Problème : la hauteur de l’immeuble',
        'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
        ['À d mètres d’un immeuble, on voit son sommet sous un angle a : hauteur = d × tan(a).'],
        (rng) => {
          const d = rng.int(20, 60);
          const a = rng.int(25, 60);
          const h = d * Math.tan(a * DEG);
          return {
            prompt: `À ${d} m du pied d’un immeuble, on voit son sommet sous un angle de ${a}° avec l’horizontale. Quelle est sa hauteur, arrondie au mètre ?`,
            answer: { ...num(unit(h), 'm'), round: 0 },
            traps: traps(unit(h), [
              [unit(d * Math.sin(a * DEG)), 'On connaît le côté adjacent et on cherche l’opposé : tangente.'],
            ]),
            hint: 'tan(angle) = {hauteur/distance}.',
            steps: [`tan(${a}°) = {h/${d}}, donc h = ${d} × tan(${a}°).`, `h ≈ **${fmt(unit(h))} m**.`],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm3-boss-trigo-piege',
        'Piège : un cosinus plus grand que 1 ?',
        'Connaitre et utiliser les lignes trigonométriques dans le triangle rectangle : cosinus, sinus, tangente',
        [
          'cos = adjacent ÷ hypoténuse, et l’hypoténuse est le plus grand côté : un cosinus est toujours **inférieur à 1**.',
        ],
        (rng) => {
          const v = dec(rng.int(11, 19), 1);
          return {
            prompt: `Tao trouve cos(B) = ${fmt(v)}. Est-ce possible ?`,
            ...choice(
              rng,
              'Non',
              [{ label: 'Oui', why: 'L’hypoténuse est le plus grand côté : adjacent ÷ hypoténuse < 1.' }],
              true,
            ),
            hint: 'Quel est le plus grand côté d’un triangle rectangle ?',
            steps: [
              'cos(B) = adjacent ÷ hypoténuse, et l’hypoténuse est plus longue que l’adjacent.',
              `Donc cos(B) < 1 : **non**, ${fmt(v)} est impossible.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

// ——— Espace : boule, sphère, sections ———

const volumeBoule = S(
  'm3-volume-boule',
  'Volume d’une boule',
  'Connaitre et utiliser la formule du volume d’une boule de rayon donné',
  ['Volume d’une boule de rayon r : **{4/3} × π × r^3**.'],
  (rng) => {
    const rad = rng.int(2, 12);
    const v = (4 / 3) * Math.PI * rad ** 3;
    return {
      prompt: `Calcule le volume d’une boule de rayon ${rad} cm, arrondi à l’unité (en cm^3).`,
      answer: { ...num(unit(v), 'cm^3'), accept: [unit((4 / 3) * 3.14 * rad ** 3)], round: 0 },
      traps: traps(unit(v), [
        [unit(4 * Math.PI * rad * rad), 'Ça, c’est l’aire de la sphère. Le volume utilise r^3.'],
        [unit((4 / 3) * Math.PI * rad * rad), 'Le rayon est au **cube**.'],
      ]),
      hint: '{4/3} × π × r × r × r.',
      steps: [`{4/3} × π × ${rad}^3 = {4/3} × π × ${rad ** 3}.`, `≈ **${fmt(unit(v))} cm^3**.`],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const sections = S(
  'm3-sections',
  'Sections de solides',
  'Visualiser et réaliser des sections de pavé parallèlement à une face, de cylindre parallèlement ou perpendiculairement à son axe, d’une boule',
  [
    'Pavé coupé parallèlement à une face → **rectangle** de même taille que la face. Cylindre coupé ⟂ à l’axe → **disque** ; parallèlement → **rectangle**. Boule → **disque** (cercle).',
  ],
  (rng) => {
    const q = rng.pick([
      { p: 'un pavé droit coupé par un plan parallèle à une face', a: 'Un rectangle' },
      { p: 'un cylindre coupé par un plan perpendiculaire à son axe', a: 'Un disque' },
      { p: 'un cylindre coupé par un plan parallèle à son axe', a: 'Un rectangle' },
      { p: 'une boule coupée par un plan', a: 'Un disque' },
      { p: 'un cube coupé par un plan parallèle à une face', a: 'Un carré' },
    ]);
    return {
      prompt: `Quelle est la forme de la section d’${q.p} ?`,
      ...choice(
        rng,
        q.a,
        ['Un rectangle', 'Un disque', 'Un carré', 'Un triangle']
          .filter((x) => x !== q.a)
          .map((x) => ({ label: x, why: 'Imagine qu’on coupe le solide avec un couteau bien droit.' })),
      ),
      hint: 'Imagine la tranche obtenue en coupant au couteau.',
      steps: ['On imagine la tranche plate obtenue en coupant le solide.', `La section est **${q.a.toLowerCase()}**.`],
      targetSeconds: 20,
    };
  },
);

const sphere = S(
  'm3-sphere',
  'Sphère et grands cercles',
  'Définir la boule et la sphère. Définir les grands cercles, le diamètre',
  [
    'La **sphère** est la surface (l’enveloppe) ; la **boule** est le solide plein. Un **grand cercle** a le même centre et le même rayon que la sphère (l’équateur).',
  ],
  (rng) => {
    const rad = rng.int(3, 15);
    const askDiam = rng.int(0, 1) === 1;
    return {
      prompt: askDiam
        ? `Une sphère a un rayon de ${rad} cm. Quel est le rayon d’un de ses grands cercles ?`
        : `Une balle a un diamètre de ${2 * rad} cm. Quel est son rayon ?`,
      answer: num(rad, 'cm'),
      traps: traps(r(rad), [
        [
          2 * rad,
          askDiam ? 'Un grand cercle a **le même rayon** que la sphère.' : 'Le rayon est la moitié du diamètre.',
        ],
      ]),
      hint: askDiam ? 'Un grand cercle passe par le centre de la sphère.' : 'Rayon = diamètre ÷ 2.',
      steps: [
        askDiam ? 'Un grand cercle a le même centre et le même rayon que la sphère.' : 'Rayon = diamètre ÷ 2.',
        `**${rad} cm**.`,
      ],
      targetSeconds: 15,
    };
  },
);

const espace = C(
  'm3-espace',
  'geometrie',
  'Sphère, boule et sections',
  [sphere, volumeBoule, sections],
  bossOf(
    [
      S(
        'm3-boss-espace-balles',
        'Problème : la boîte de balles',
        'Connaitre et utiliser la formule du volume d’une boule de rayon donné',
        ['Une boîte cylindrique contient 3 balles empilées : hauteur = 3 diamètres, rayon = rayon des balles.'],
        (rng) => {
          const rad = rng.int(2, 4);
          const cyl = Math.PI * rad * rad * 6 * rad;
          const balls = 3 * (4 / 3) * Math.PI * rad ** 3;
          const empty = cyl - balls;
          return {
            prompt: `Une boîte cylindrique de rayon ${rad} cm et de hauteur ${6 * rad} cm contient 3 balles de rayon ${rad} cm. Quel volume reste vide, arrondi au cm^3 ?`,
            answer: { ...num(unit(empty), 'cm^3'), round: 0 },
            traps: traps(unit(empty), [
              [unit(balls), 'Ça, c’est le volume des balles.'],
              [unit(cyl), 'Il faut enlever le volume des balles.'],
            ]),
            hint: 'Volume du cylindre − volume des 3 balles.',
            steps: [
              `Cylindre : π × ${rad}^2 × ${6 * rad} ≈ ${fmt(unit(cyl))}. Balles : 3 × {4/3} × π × ${rad}^3 ≈ ${fmt(unit(balls))}.`,
              `Vide ≈ **${fmt(unit(empty))} cm^3** (un tiers de la boîte !).`,
            ],
            targetSeconds: 90,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-espace-fromage',
        'Problème : la tranche de fromage',
        'Visualiser et réaliser des sections de pavé parallèlement à une face',
        ['Une tranche parallèle à une face d’un pavé est un rectangle de mêmes dimensions que cette face.'],
        (rng) => {
          const L = rng.int(8, 20);
          const l = rng.int(4, 10);
          return {
            prompt: `Un bloc de fromage en forme de pavé mesure ${L} cm × ${l} cm × 6 cm. On le coupe parallèlement à la face ${L} cm × ${l} cm. Quelle est l’aire de la tranche, en cm^2 ?`,
            answer: num(L * l, 'cm^2'),
            traps: traps(r(L * l), [[L * l * 6, 'C’est une aire (une tranche plate), pas un volume.']]),
            hint: 'La section est un rectangle identique à cette face.',
            steps: [`La section est un rectangle de ${L} cm sur ${l} cm.`, `Aire : **${L * l} cm^2**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-espace-piege',
        'Piège : doubler le rayon',
        'Connaitre et utiliser la formule du volume d’une boule de rayon donné',
        ['Le volume dépend de r^3 : doubler le rayon multiplie le volume par 2^3 = **8**.'],
        () => {
          return {
            prompt: 'On double le rayon d’une boule. Par combien son volume est-il multiplié ?',
            answer: num(8),
            traps: traps(r(8), [
              [2, 'Le rayon est au cube : 2 × 2 × 2.'],
              [4, 'Le volume dépend de r^3, pas r^2.'],
            ]),
            hint: 'Le volume dépend de r × r × r.',
            steps: ['(2r)^3 = 2^3 × r^3 = 8 × r^3.', 'Le volume est multiplié par **8**.'],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

// ——— Translations et vecteurs ———

const vecteurImage = S(
  'm3-vecteur-image',
  'Translation de vecteur donné',
  'Définir et utiliser la translation : définition ponctuelle avec parallélogramme',
  [
    'L’image de M par la translation de vecteur {AB} est M′ tel que ABM′M soit un parallélogramme : M glisse comme A va vers B.',
  ],
  (rng) => {
    const lim = 5;
    for (;;) {
      const dx = nonZero(rng, -4, 4);
      const dy = rng.int(-4, 4);
      const m = { x: rng.int(-4, 4), y: rng.int(-4, 4) };
      const img = { x: m.x + dx, y: m.y + dy };
      if (Math.abs(img.x) > lim || Math.abs(img.y) > lim) continue;
      return {
        prompt: `Le vecteur u se déplace de ${Math.abs(dx)} carreau${Math.abs(dx) > 1 ? 'x' : ''} vers la ${dx > 0 ? 'droite' : 'gauche'}${dy ? ` et de ${Math.abs(dy)} vers le ${dy > 0 ? 'haut' : 'bas'}` : ''}. Touche l’image de M par la translation de vecteur u.`,
        figure: {
          kind: 'grid',
          xMin: -lim,
          xMax: lim,
          yMin: -lim,
          yMax: lim,
          axes: false,
          points: [{ name: 'M', x: m.x, y: m.y, color: 'accent' }],
          pick: true,
        },
        answer: { kind: 'point', ...img },
        traps: [{ point: { x: m.x - dx, y: m.y - dy }, why: 'Attention au sens du vecteur.' }].filter(
          (t) => Math.abs(t.point.x) <= lim && Math.abs(t.point.y) <= lim,
        ),
        hint: 'Fais le même déplacement que le vecteur, à partir de M.',
        steps: [`On part de M et on applique le déplacement du vecteur u.`, 'L’image est **le nœud entouré en vert**.'],
        targetSeconds: 30,
      };
    }
  },
);

const chasles = S(
  'm3-chasles',
  'Somme de vecteurs, relation de Chasles',
  'Découvrir et utiliser la relation de Chasles',
  ['Relation de Chasles : **{AB} + {BC} = {AC}** (le point du milieu « s’efface »). Et {AB} + {BA} = vecteur nul.'],
  (rng) => {
    const [a, b, c] = distinct(rng, 3, () => rng.pick(['A', 'B', 'C', 'D', 'E', 'M', 'N']));
    const good = `→${a}${c}`;
    return {
      prompt: `Simplifie →${a}${b} + →${b}${c}.`,
      ...choice(rng, good, [
        { label: `→${c}${a}`, why: 'Attention au sens : on part de ' + String(a) + '.' },
        { label: `→${b}${b}`, why: `C’est ${b} qui « s’efface ».` },
        { label: `→${a}${b}${c}`, why: 'Un vecteur a deux extrémités.' },
      ]),
      hint: 'Chasles : →AB + →BC = →AC.',
      steps: [
        `Le point ${b} est à la fin du 1er vecteur et au début du 2e : il s’efface.`,
        `→${a}${b} + →${b}${c} = **${good}**.`,
      ],
      targetSeconds: 20,
    };
  },
);

const vecteursEgaux = S(
  'm3-vecteurs-egaux',
  'Vecteurs égaux et parallélogramme',
  'Définir et utiliser les notions de vecteur, de vecteurs égaux, de vecteur nul, d’opposé d’un vecteur',
  ['→AB = →DC ⟺ ABCD est un parallélogramme (éventuellement aplati). L’opposé de →AB est →BA.'],
  (rng) => {
    const q = rng.pick([
      { p: 'ABCD est un parallélogramme. Quel vecteur est égal à →AB ?', a: '→DC', w: ['→CD', '→BC', '→AD'] },
      { p: 'ABCD est un parallélogramme. Quel vecteur est égal à →AD ?', a: '→BC', w: ['→CB', '→DC', '→AB'] },
      { p: 'Quel est l’opposé du vecteur →EF ?', a: '→FE', w: ['→EF', '→EE', '→FF'] },
    ]);
    return {
      prompt: q.p,
      ...choice(
        rng,
        q.a,
        q.w.map((w) => ({ label: w, why: 'Même direction, même sens, même longueur : vérifie le sens.' })),
      ),
      hint: 'Deux vecteurs égaux ont même direction, même sens et même longueur.',
      steps: ['On compare direction, sens et longueur.', `Réponse : **${q.a}**.`],
      targetSeconds: 20,
    };
  },
);

const vecteurs = C(
  'm3-vecteurs',
  'geometrie',
  'Translations et vecteurs',
  [vecteurImage, vecteursEgaux, chasles],
  bossOf(
    [
      S(
        'm3-boss-vecteurs-bateau',
        'Problème : le bateau et le courant',
        'Définir et utiliser la somme de deux vecteurs par enchainement de deux translations',
        [
          'Deux déplacements à la suite : on additionne les vecteurs (on additionne les déplacements en largeur, puis en hauteur).',
        ],
        (rng) => {
          const a = rng.int(2, 8);
          const b = rng.int(1, 5);
          return {
            prompt: `Un bateau avance de ${a} km vers l’est, puis le courant le déplace de ${b} km vers l’est et 3 km vers le nord. De combien de km vers l’est s’est-il déplacé en tout ?`,
            answer: num(a + b, 'km'),
            traps: traps(r(a + b), [[a + b + 3, 'Le déplacement vers le nord est dans une autre direction.']]),
            hint: 'Additionne les déplacements vers l’est seulement.',
            steps: [`Vers l’est : ${a} + ${b}.`, `= **${a + b} km**.`],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm3-boss-vecteurs-chasles',
        'Problème : l’itinéraire',
        'Découvrir et utiliser la relation de Chasles',
        ['→AB + →BC + →CD = →AD : seuls le départ et l’arrivée comptent.'],
        (rng) => {
          const pts = distinct(rng, 4, () => rng.pick(['A', 'B', 'C', 'D', 'E', 'F']));
          const [p, q, s, t] = pts;
          return {
            prompt: `Simplifie →${p}${q} + →${q}${s} + →${s}${t}.`,
            ...choice(rng, `→${p}${t}`, [
              { label: `→${t}${p}`, why: 'Le départ est ' + String(p) + '.' },
              { label: `→${p}${s}`, why: 'Il reste un vecteur à ajouter.' },
            ]),
            hint: 'Applique Chasles deux fois.',
            steps: [
              `→${p}${q} + →${q}${s} = →${p}${s}, puis →${p}${s} + →${s}${t} = →${p}${t}.`,
              `Résultat : **→${p}${t}**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-vecteurs-piege',
        'Piège : →AB = →CD veut-il dire ABCD parallélogramme ?',
        'Définir et utiliser la translation : définition ponctuelle avec parallélogramme',
        [
          '→AB = →DC ⟺ ABCD parallélogramme. Avec →AB = →CD, c’est ABDC qui est un parallélogramme (attention à l’ordre !).',
        ],
        (rng) => ({
          prompt: 'Si →AB = →CD, quel quadrilatère est un parallélogramme ?',
          ...choice(rng, 'ABDC', [
            { label: 'ABCD', why: 'Pour ABCD, il faudrait →AB = →DC.' },
            { label: 'ACBD', why: 'Suis les extrémités dans l’ordre : A → B, puis D, puis C.' },
          ]),
          hint: '→AB = →DC ⟺ ABCD parallélogramme. Ici le 2e vecteur va de C vers D.',
          steps: ['→AB = →CD : on lit A, B, puis D, puis C.', 'C’est **ABDC** qui est un parallélogramme.'],
          targetSeconds: 30,
        }),
      ),
    ],
  ),
);

// ——— Statistiques ———

const effectifsCumules = S(
  'm3-effectifs-cumules',
  'Effectifs cumulés croissants',
  'Calculer des effectifs cumulés croissants',
  [
    'L’effectif cumulé d’une valeur = nombre de données **inférieures ou égales** à cette valeur : on additionne au fur et à mesure.',
  ],
  (rng) => {
    const vals = [0, 1, 2, 3, 4];
    const eff = vals.map(() => rng.int(1, 9));
    const k = rng.int(1, 4);
    const cum = eff.slice(0, k + 1).reduce((a, b) => a + b, 0);
    return {
      prompt: `Nombre de frères et sœurs des élèves. Quel est l’effectif cumulé croissant de la valeur ${k} ?`,
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Frères et sœurs', ...vals.map(String)],
          ['Effectif', ...eff.map(String)],
        ],
      },
      answer: num(cum),
      traps: traps(r(cum), [[eff[k] ?? 0, 'L’effectif cumulé additionne aussi les valeurs avant.']]),
      hint: `Additionne les effectifs des valeurs de 0 à ${k}.`,
      steps: [`${eff.slice(0, k + 1).join(' + ')}.`, `= **${cum}**.`],
      targetSeconds: 30,
    };
  },
);

const quartiles = S(
  'm3-quartiles',
  'Quartiles et médiane',
  'Donner les quartiles et la médiane d’une série donnée sous forme de tableau d’effectifs ou de diagramme en barres',
  [
    'Q1 : la plus petite valeur telle qu’**au moins 25 %** des données soient inférieures ou égales. Q3 : pareil avec **75 %**.',
    'Avec N données rangées : Q1 est à la position N ÷ 4 (arrondie au-dessus).',
  ],
  (rng, level) => {
    const n = rng.pick([8, 11, 12, 15, 20]);
    const vals = Array.from({ length: n }, () => rng.int(1, 20)).sort((a, b) => a - b);
    const which = level === 1 ? 'Q1' : level === 2 ? 'Q3' : rng.pick(['Q1', 'Q3']);
    const pos = Math.ceil((which === 'Q1' ? n : 3 * n) / 4);
    const v = vals[pos - 1] ?? 0;
    return {
      prompt: `Série rangée (${n} valeurs) : ${vals.join(' ; ')}. Quel est le ${which === 'Q1' ? 'premier' : 'troisième'} quartile ?`,
      answer: num(v),
      traps: traps(r(v), [[vals[Math.floor(n / 2)] ?? 0, 'Ça, c’est autour de la médiane.']]),
      hint: `Position : ${which === 'Q1' ? `${n} ÷ 4` : `3 × ${n} ÷ 4`}, arrondi à l’entier au-dessus.`,
      steps: [
        `${which === 'Q1' ? `${n} ÷ 4` : `3 × ${n} ÷ 4`} = ${fmt(r(which === 'Q1' ? n : 3 * n, 4))} → ${pos}e valeur.`,
        `${which} = **${v}**.`,
      ],
      targetSeconds: 50,
    };
  },
);

const interpreter = S(
  'm3-interpreter-stats',
  'Comprendre une boîte à moustaches',
  'Construire et utiliser des boites à moustache pour représenter les valeurs de position d’une série statistique',
  [
    'Boîte à moustaches : min, Q1, médiane, Q3, max. La moitié des valeurs est entre Q1 et Q3 ; un quart sous Q1, un quart au-dessus de Q3.',
  ],
  (rng) => {
    const q1 = rng.int(5, 9);
    const med = q1 + rng.int(1, 3);
    const q3 = med + rng.int(1, 4);
    const q = rng.pick([
      { p: `Q1 = ${q1}. Quel pourcentage des valeurs est inférieur ou égal à ${q1} (au moins) ?`, a: 25, w: 50 },
      {
        p: `La médiane vaut ${med}. Quel pourcentage des valeurs est inférieur ou égal à ${med} (au moins) ?`,
        a: 50,
        w: 25,
      },
      { p: `Q3 = ${q3}. Quel pourcentage des valeurs est inférieur ou égal à ${q3} (au moins) ?`, a: 75, w: 25 },
    ]);
    return {
      prompt: q.p,
      answer: num(q.a, '%'),
      traps: traps(r(q.a), [[q.w, 'Q1 : 25 % ; médiane : 50 % ; Q3 : 75 %.']]),
      hint: 'Q1 → 25 %, médiane → 50 %, Q3 → 75 %.',
      steps: ['Les quartiles coupent la série en 4 parts.', `Réponse : **${q.a} %**.`],
      targetSeconds: 20,
    };
  },
);

const statistiques = C(
  'm3-statistiques',
  'donnees',
  'Statistiques',
  [effectifsCumules, quartiles, interpreter],
  bossOf(
    [
      S(
        'm3-boss-stats-concours',
        'Problème : la sélection',
        'Comprendre et interpréter des données statistiques',
        ['« Le quart des meilleurs » : ce sont les valeurs au-dessus de Q3.'],
        (rng) => {
          const q3 = rng.int(13, 16);
          const note = q3 + rng.pick([-2, -1, 1, 2]);
          const ok = note >= q3;
          return {
            prompt: `Au concours, Q3 = ${q3}. Le quart des meilleurs (notes ≥ Q3) est sélectionné. Avec ${note}, Jade est-elle sûre d’être sélectionnée ?`,
            ...choice(
              rng,
              ok ? 'Oui' : 'Non',
              [{ label: ok ? 'Non' : 'Oui', why: `Compare ${note} à Q3 = ${q3}.` }],
              true,
            ),
            hint: 'Compare la note à Q3.',
            steps: [`${note} ${ok ? '≥' : '<'} ${q3}.`, `**${ok ? 'Oui' : 'Non'}**.`],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm3-boss-stats-temperature',
        'Problème : deux villes',
        'Comprendre et interpréter des données statistiques',
        ['L’écart Q3 − Q1 (écart interquartile) mesure la dispersion de la moitié centrale des valeurs.'],
        (rng) => {
          const a1 = rng.int(8, 12);
          const a3 = a1 + rng.int(2, 4);
          const b1 = rng.int(5, 9);
          const b3 = b1 + rng.int(8, 12);
          return {
            prompt: `Ville A : Q1 = ${a1} °C, Q3 = ${a3} °C. Ville B : Q1 = ${b1} °C, Q3 = ${b3} °C. Quelle ville a des températures les plus régulières ?`,
            ...choice(
              rng,
              'La ville A',
              [{ label: 'La ville B', why: `Q3 − Q1 vaut ${b3 - b1} pour B contre ${a3 - a1} pour A.` }],
              true,
            ),
            hint: 'Compare les écarts Q3 − Q1.',
            steps: [
              `A : ${a3} − ${a1} = ${a3 - a1}. B : ${b3} − ${b1} = ${b3 - b1}.`,
              'Le plus petit écart : **la ville A**.',
            ],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-stats-piege',
        'Piège : la médiane et la moyenne',
        'Comprendre et interpréter des données statistiques',
        ['La médiane n’est pas forcément proche de la moyenne : une valeur extrême tire la moyenne.'],
        (rng) => {
          const base = rng.int(10, 14);
          const vals = [base, base, base + 1, base + 1, base + 40];
          const mean = r(
            vals.reduce((a, b) => a + b, 0),
            5,
          );
          return {
            prompt: `Série : ${vals.join(' ; ')}. Quelle est la médiane ?`,
            answer: num(base + 1),
            traps: traps(r(base + 1), [[mean, 'Ça, c’est la moyenne, tirée vers le haut par la valeur extrême.']]),
            hint: 'La valeur du milieu, une fois rangées.',
            steps: [
              'Les valeurs sont déjà rangées : la 3e est au milieu.',
              `Médiane : **${base + 1}** (la moyenne vaut ${fmt(mean)}).`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);

// ——— Probabilités ———

const reunion = S(
  'm3-proba-reunion',
  'P(A ou B)',
  'Connaitre et savoir appliquer la relation P(A ∪ B) + P(A ∩ B) = P(A) + P(B)',
  ['P(A ∪ B) = P(A) + P(B) − P(A ∩ B) : on enlève ce qu’on a compté deux fois.'],
  (rng) => {
    const a = rng.int(2, 6);
    const b = rng.int(2, 6);
    const ab = rng.int(1, Math.min(a, b) - 1 || 1);
    const d = 10;
    const res = r(a + b - ab, d);
    return {
      prompt: `P(A) = ${fmt(r(a, d))}, P(B) = ${fmt(r(b, d))} et P(A ∩ B) = ${fmt(r(ab, d))}. Calcule P(A ∪ B).`,
      answer: num(res),
      traps: traps(res, [[r(a + b, d), 'P(A ∩ B) a été comptée deux fois : il faut l’enlever.']]),
      hint: 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
      steps: [`${fmt(r(a, d))} + ${fmt(r(b, d))} − ${fmt(r(ab, d))}.`, `= **${fmt(res)}**.`],
      targetSeconds: 30,
    };
  },
);

const stabilisation = S(
  'm3-stabilisation',
  'Fréquence et probabilité',
  'Observer la stabilisation des fréquences lorsqu’on augmente le nombre de répétitions de l’expérience aléatoire, faire le lien entre fréquence et probabilité selon le nombre de répétitions',
  [
    'Sur un grand nombre de répétitions, la fréquence observée **se stabilise** autour de la probabilité : on peut l’utiliser pour l’estimer.',
  ],
  (rng) => {
    const n = rng.pick([1000, 2000, 5000]);
    const p = rng.pick([r(1, 4), r(1, 5), r(3, 10), r(2, 5)]);
    const k = Math.round((n * p.n) / p.d) + rng.int(-n / 100, n / 100);
    const f = r(k, n);
    return {
      prompt: `Une punaise lancée ${n} fois tombe ${k} fois sur la pointe. Quelle probabilité peut-on estimer (en écriture décimale) ?`,
      answer: num(f),
      traps: traps(f, [[r(1, 2), 'La punaise n’est pas une pièce : on estime avec la fréquence observée.']]),
      hint: `Fréquence = ${k} ÷ ${n}.`,
      steps: [`Avec beaucoup de lancers, la fréquence approche la probabilité : ${k} ÷ ${n}.`, `≈ **${fmt(f)}**.`],
      targetSeconds: 30,
    };
  },
  { advice: 'calculatrice' },
);

const independantes = S(
  'm3-independantes',
  'Expériences indépendantes',
  'Simuler des expériences aléatoires indépendantes',
  [
    'Pour deux épreuves indépendantes, on **multiplie** les probabilités le long des branches de l’arbre : P(6 puis 6) = {1/6} × {1/6} = {1/36}.',
  ],
  (rng) => {
    const q = rng.pick([
      { p: 'On lance deux fois un dé. Probabilité d’obtenir deux 6 ?', a: r(1, 36), w: r(2, 6) },
      { p: 'On lance trois fois une pièce. Probabilité d’obtenir trois « face » ?', a: r(1, 8), w: r(3, 2) },
      { p: 'On lance un dé et une pièce. Probabilité d’obtenir 6 et « pile » ?', a: r(1, 12), w: r(2, 3) },
    ]);
    return {
      prompt: q.p,
      answer: fraction(q.a),
      traps: traps(q.a, [[q.w, 'Pour des épreuves indépendantes à la suite, on **multiplie** les probabilités.']]),
      hint: 'Multiplie les probabilités de chaque épreuve.',
      steps: ['Les épreuves sont indépendantes : on multiplie.', `Probabilité : **${frac(q.a)}**.`],
      targetSeconds: 30,
    };
  },
);

const probabilites = C(
  'm3-probabilites',
  'donnees',
  'Probabilités',
  [reunion, independantes, stabilisation],
  bossOf(
    [
      S(
        'm3-boss-probas-code',
        'Problème : le cadenas',
        'Simuler des expériences aléatoires indépendantes',
        ['Un code à 3 chiffres (de 0 à 9) : 10 × 10 × 10 = 1 000 codes possibles.'],
        (rng) => {
          const n = rng.int(2, 4);
          return {
            prompt: `Un cadenas a un code de ${n} chiffres (chacun de 0 à 9). En tapant un code au hasard, quelle est la probabilité de l’ouvrir du premier coup ?`,
            answer: fraction(r(1, 10 ** n)),
            traps: traps(r(1, 10 ** n), [[r(1, 10 * n), `Il y a 10 choix pour chaque chiffre : 10^${n} codes.`]]),
            hint: 'Combien de codes différents ?',
            steps: [`10^${n} = ${fmt(r(10 ** n))} codes, un seul est bon.`, `Probabilité : **{1/${10 ** n}}**.`],
            targetSeconds: 40,
          };
        },
      ),
      S(
        'm3-boss-probas-sport',
        'Problème : les sports',
        'Connaitre et savoir appliquer la relation P(A ∪ B) + P(A ∩ B) = P(A) + P(B)',
        ['P(foot ou basket) = P(foot) + P(basket) − P(les deux).'],
        (rng) => {
          const n = 30;
          const f = rng.int(10, 18);
          const b = rng.int(6, 12);
          const both = rng.int(2, 5);
          const res = r(f + b - both, n);
          return {
            prompt: `Dans une classe de ${n} élèves, ${f} font du foot, ${b} du basket et ${both} les deux. On choisit un élève au hasard : probabilité qu’il fasse du foot ou du basket ?`,
            answer: fraction(res),
            traps: traps(res, [[r(f + b, n), `Les ${both} élèves qui font les deux sont comptés deux fois.`]]),
            hint: 'Foot + basket − les deux.',
            steps: [`${f} + ${b} − ${both} = ${f + b - both} élèves.`, `Probabilité : **${frac(res)}**.`],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-probas-piege',
        'Piège : l’erreur de d’Alembert',
        'Simuler des expériences aléatoires indépendantes',
        ['Avec deux pièces, il y a 4 issues (PP, PF, FP, FF), pas 3 : « une de chaque » a une probabilité {1/2}.'],
        (rng) => ({
          prompt: 'On lance deux pièces. Probabilité d’obtenir un « pile » et un « face » ?',
          ...choice(rng, '{1/2}', [
            { label: '{1/3}', why: 'PF et FP sont deux issues différentes : 4 issues en tout.' },
            { label: '{1/4}', why: 'Deux issues conviennent : PF et FP.' },
          ]),
          hint: 'Liste les 4 issues : PP, PF, FP, FF.',
          steps: ['Issues : PP, PF, FP, FF.', 'PF et FP conviennent : **{1/2}**.'],
          targetSeconds: 25,
        }),
      ),
    ],
  ),
);

// ——— Fonctions ———

const imageAntecedent = S(
  'm3-image-antecedent',
  'Image et antécédent',
  'Définir et connaitre le vocabulaire : image, antécédents',
  [
    'f(3) = 7 : **7 est l’image** de 3 et **3 est un antécédent** de 7.',
    'Image : on remplace x. Antécédent : on résout f(x) = valeur.',
  ],
  (rng, level) => {
    const a = nonZero(rng, -5, 5);
    const b = rng.int(-9, 9);
    const x = rng.int(-6, 6);
    const y = a * x + b;
    if (level === 3) {
      return {
        prompt: `f(x) = ${lin(a, b)}. Quel est l’antécédent de ${sgn(y)} par f ?`,
        answer: num(x),
        traps: traps(r(x), [
          [a * y + b, 'Ça, c’est l’**image** de ' + sgn(y) + '. On cherche x tel que f(x) = ' + sgn(y) + '.'],
        ]),
        hint: `Résous ${lin(a, b)} = ${sgn(y)}.`,
        steps: [
          `${lin(a, 0)} = ${sgn(y)} − ${par(b)} = ${sgn(y - b)}.`,
          `x = ${sgn(y - b)} ÷ ${par(a)} = **${sgn(x)}**.`,
        ],
        targetSeconds: 35,
      };
    }
    return {
      prompt: `f(x) = ${lin(a, b)}. Calcule l’image de ${sgn(x)}.`,
      answer: num(y),
      traps: traps(r(y), [[a + x + b, `${lin(a, 0)} signifie ${sgn(a)} × x.`]]),
      hint: `Remplace x par ${sgn(x)}.`,
      steps: [`f(${sgn(x)}) = ${sgn(a)} × ${par(x)} ${b < 0 ? MINUS : '+'} ${Math.abs(b)}.`, `= **${sgn(y)}**.`],
      targetSeconds: 25,
    };
  },
);

const lineaire = S(
  'm3-lineaire',
  'Fonctions linéaires',
  'Définir et utiliser les fonctions linéaires',
  [
    'Une fonction **linéaire** s’écrit f(x) = ax : elle traduit une situation de **proportionnalité** ; sa droite passe par l’origine.',
    'Si f(4) = 12, alors a = 12 ÷ 4 = 3.',
  ],
  (rng) => {
    const a = nonZero(rng, -6, 9);
    const x = nonZero(rng, -6, 9);
    return {
      prompt: `f est une fonction linéaire et f(${sgn(x)}) = ${sgn(a * x)}. Quel est son coefficient a ?`,
      answer: num(a),
      traps: traps(r(a), [
        [a * x - x, 'f(x) = ax : on divise, on ne soustrait pas.'],
        [r(x, a * x), 'C’est l’inverse : a = f(x) ÷ x.'],
      ]),
      hint: 'f(x) = a × x : a = f(x) ÷ x.',
      steps: [`a = ${sgn(a * x)} ÷ ${par(x)}.`, `a = **${sgn(a)}**.`],
      targetSeconds: 25,
    };
  },
);

const affineGraphique = S(
  'm3-affine-graphique',
  'Fonction affine : lire a et b',
  'Déterminer graphiquement les coefficients d’une fonction affine',
  [
    'f(x) = ax + b : **b** est l’ordonnée à l’origine (où la droite coupe l’axe vertical) ; **a** est ce dont on monte quand x augmente de 1.',
  ],
  (rng, level) => {
    const a = rng.int(1, 3);
    const b = rng.int(0, 6);
    const pts = Array.from({ length: 6 }, (_, x) => ({ x, y: a * x + b }));
    const askB = level === 1;
    return {
      prompt: `La droite représente f(x) = ax + b. Combien vaut ${askB ? 'b' : 'a'} ?`,
      figure: { kind: 'chart', xLabel: 'x', yLabel: 'f(x)', points: pts, line: true },
      answer: num(askB ? b : a),
      traps: traps(r(askB ? b : a), [
        [
          askB ? a : b,
          askB ? 'b se lit sur l’axe vertical, quand x = 0.' : 'a : de combien monte la droite quand x augmente de 1 ?',
        ],
      ]),
      hint: askB
        ? 'Où la droite coupe-t-elle l’axe vertical (x = 0) ?'
        : 'Quand x augmente de 1, de combien f(x) augmente-t-il ?',
      steps: [
        askB ? `Pour x = 0, la droite est à la hauteur ${b}.` : `De x = 0 à x = 1, f passe de ${b} à ${a + b}.`,
        `${askB ? 'b' : 'a'} = **${askB ? b : a}**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const affineCalcul = S(
  'm3-affine',
  'Fonctions affines',
  'Définir et utiliser les fonctions affines',
  ['f(x) = ax + b. Avec deux points : a = {f(x₂) − f(x₁)/x₂ − x₁}, puis b = f(x₁) − a × x₁.'],
  (rng) => {
    const a = nonZero(rng, -5, 5);
    const b = rng.int(-9, 9);
    const x1 = rng.int(-3, 2);
    const x2 = x1 + rng.int(1, 4);
    return {
      prompt: `f est affine, f(${sgn(x1)}) = ${sgn(a * x1 + b)} et f(${sgn(x2)}) = ${sgn(a * x2 + b)}. Calcule a.`,
      answer: num(a),
      traps: traps(r(a), [
        [r(x2 - x1, a * (x2 - x1)), 'C’est à l’envers : écart des images ÷ écart des x.'],
        [a * (x2 - x1), `Divise par l’écart des x (${x2 - x1}).`],
      ]),
      hint: 'a = (écart des images) ÷ (écart des x).',
      steps: [
        `a = (${sgn(a * x2 + b)} − ${par(a * x1 + b)}) ÷ (${sgn(x2)} − ${par(x1)}) = ${sgn(a * (x2 - x1))} ÷ ${x2 - x1}.`,
        `a = **${sgn(a)}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const fonctionCarre = S(
  'm3-fonction-carre',
  'La fonction carré',
  'Représenter la fonction carré',
  ['f(x) = x^2 : l’image est toujours positive ou nulle ; f(−3) = f(3) = 9 (la courbe est symétrique).'],
  (rng) => {
    const x = nonZero(rng, -9, 9);
    return {
      prompt: `f(x) = x^2. Calcule f(${sgn(x)}).`,
      answer: num(x * x),
      traps: traps(r(x * x), [
        [-(x * x), 'Un carré est toujours positif : (−a)^2 = a^2.'],
        [2 * x, 'x^2 = x × x, pas 2 × x.'],
      ]),
      hint: `Le carré de ${sgn(x)}, c’est ${par(x)} × ${par(x)}.`,
      steps: [`f(${sgn(x)}) = ${par(x)} × ${par(x)}.`, `= **${x * x}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const fonctions = C(
  'm3-fonctions',
  'fonctions',
  'Fonctions linéaires et affines',
  [imageAntecedent, lineaire, affineGraphique, affineCalcul, fonctionCarre],
  bossOf(
    [
      S(
        'm3-boss-fonctions-forfaits',
        'Problème : deux abonnements',
        'Résoudre graphiquement des équations et des inéquations linéaires',
        [
          'Abonnement A : f(x) = 3x (linéaire). B : g(x) = 2x + 10 (affine). Même prix quand 3x = 2x + 10, soit x = 10.',
        ],
        (rng) => {
          const pa = rng.int(3, 6);
          const pb = pa - rng.int(1, 2);
          const fee = (pa - pb) * rng.int(4, 12);
          const x = fee / (pa - pb);
          return {
            prompt: `Piscine : tarif A à ${pa} € l’entrée ; tarif B avec carte à ${fee} € puis ${pb} € l’entrée. À partir de combien d’entrées le tarif B devient-il plus avantageux (strictement) ?`,
            answer: num(x + 1),
            traps: traps(r(x + 1), [[x, `Pour ${x} entrées, les deux tarifs sont égaux : il en faut une de plus.`]]),
            hint: `Résous ${pa}x = ${fee} + ${pb}x.`,
            steps: [
              `${pa}x = ${fee} + ${pb}x ⟺ ${pa - pb}x = ${fee} ⟺ x = ${x} (prix égaux).`,
              `B est moins cher à partir de **${x + 1}** entrées.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm3-boss-fonctions-taxi',
        'Problème : retrouver la formule',
        'Définir et utiliser les fonctions affines',
        ['Prix = a × distance + b : a est le prix par km (pente), b la prise en charge.'],
        (rng) => {
          const a = rng.int(1, 3);
          const b = rng.int(2, 6);
          const d1 = rng.int(2, 5);
          const d2 = d1 + rng.int(3, 8);
          return {
            prompt: `Un taxi facture ${a * d1 + b} € pour ${d1} km et ${a * d2 + b} € pour ${d2} km (fonction affine). Combien coûte la prise en charge (prix pour 0 km) ?`,
            answer: num(b, '€'),
            traps: traps(r(b), [[a, 'Ça, c’est le prix par km (a). La prise en charge est b.']]),
            hint: 'Trouve d’abord le prix par km : écart de prix ÷ écart de distance.',
            steps: [
              `a = (${a * d2 + b} − ${a * d1 + b}) ÷ (${d2} − ${d1}) = ${a} € par km.`,
              `b = ${a * d1 + b} − ${a} × ${d1} = **${b} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-fonctions-piege',
        'Piège : image ou antécédent ?',
        'Définir et connaitre le vocabulaire : image, antécédents',
        ['f(2) = 5 : 5 est l’**image** de 2, et 2 est **un antécédent** de 5 (pas l’inverse !).'],
        (rng) => {
          const x = rng.int(2, 9);
          const y = rng.int(10, 30);
          return {
            prompt: `f(${x}) = ${y}. Quelle phrase est juste ?`,
            ...choice(rng, `${y} est l’image de ${x}`, [
              { label: `${x} est l’image de ${y}`, why: 'L’image est le résultat, f(x).' },
              { label: `${y} est un antécédent de ${x}`, why: 'L’antécédent est le nombre de départ, x.' },
            ]),
            hint: 'f(nombre de départ) = image.',
            steps: [`f(${x}) = ${y} : on part de ${x} et on obtient ${y}.`, `**${y} est l’image de ${x}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);

// ——— Proportionnalité et pourcentages ———

const evolution = S(
  'm3-evolution',
  'Traduire une évolution en pourcentage',
  'Traduire une augmentation ou une diminution en pourcentages',
  ['Taux d’évolution = {valeur finale − valeur initiale/valeur initiale} × 100. De 80 à 100 : +20 ÷ 80 = +25 %.'],
  (rng) => {
    const v0 = rng.pick([20, 40, 50, 80, 200, 250]);
    const t = rng.pick([-50, -25, -20, -10, 10, 20, 25, 50, 75]);
    const v1 = (v0 * (100 + t)) / 100;
    return {
      prompt: `Un prix passe de ${v0} € à ${fmt(r(v1 * 100, 100))} €. De quel pourcentage a-t-il évolué ? (négatif si baisse)`,
      answer: num(t, '%'),
      traps: traps(r(t), [
        [
          r(Math.round((v1 - v0) * 100), 100),
          `${fmt(r(Math.round((v1 - v0) * 100), 100))} €, c’est l’évolution en euros : divise par ${v0} puis × 100.`,
        ],
        [-t, 'Attention au sens : hausse ou baisse ?'],
      ]),
      hint: `(${fmt(r(v1 * 100, 100))} − ${v0}) ÷ ${v0} × 100.`,
      steps: [
        `Écart : ${fmt(r(Math.round((v1 - v0) * 100), 100))} €. Divisé par ${v0} : ${fmt(r(t, 100))}.`,
        `Soit **${sgn(t)} %**.`,
      ],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const partageRatio = S(
  'm3-partage-ratio',
  'Partager selon un ratio',
  'Partager une masse en trois parts selon un certain ratio (automatisme)',
  ['Ratio 2 : 3 : 5 → 10 parts égales. 200 g partagés : une part = 20 g, donc 40 g, 60 g et 100 g.'],
  (rng) => {
    const parts = [rng.int(1, 4), rng.int(1, 4), rng.int(1, 5)];
    const total = parts.reduce((a, b) => a + b, 0);
    const unitPart = rng.int(5, 40);
    const k = rng.int(0, 2);
    return {
      prompt: `On partage ${total * unitPart} g de farine en trois parts selon le ratio ${parts.join(' : ')}. Combien pèse la part n°${k + 1} ?`,
      answer: num((parts[k] ?? 0) * unitPart, 'g'),
      traps: traps(r((parts[k] ?? 0) * unitPart), [
        [r(total * unitPart, 3), 'Les parts ne sont pas égales : elles suivent le ratio.'],
      ]),
      hint: `Le ratio fait ${total} parts égales en tout.`,
      steps: [
        `${total * unitPart} ÷ ${total} = ${unitPart} g par part.`,
        `${parts[k]} part${(parts[k] ?? 0) > 1 ? 's' : ''} : **${(parts[k] ?? 0) * unitPart} g**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const lineaireProportionnalite = S(
  'm3-lineaire-proportionnalite',
  'Proportionnalité et fonction linéaire',
  'Relier fonctions linéaires et proportionnalité',
  ['Une situation de proportionnalité de coefficient k se traduit par la fonction linéaire f(x) = kx.'],
  (rng) => {
    const price = r(rng.int(12, 40), 10);
    return {
      prompt: `L’essence coûte ${fmt(price)} € le litre. Quelle fonction donne le prix f(x) pour x litres ?`,
      ...choice(rng, `f(x) = ${fmt(price)}x`, [
        { label: `f(x) = x + ${fmt(price)}`, why: 'Le prix est proportionnel au nombre de litres : on multiplie.' },
        { label: `f(x) = {x/${fmt(price)}}`, why: 'Chaque litre coûte ' + fmt(price) + ' € : on multiplie.' },
      ]),
      hint: 'Prix = prix d’un litre × nombre de litres.',
      steps: ['C’est une situation de proportionnalité : fonction linéaire.', `**f(x) = ${fmt(price)}x**.`],
      targetSeconds: 25,
    };
  },
);

const proportionnalite = C(
  'm3-proportionnalite',
  'fonctions',
  'Pourcentages et ratios',
  [evolution, partageRatio, lineaireProportionnalite],
  bossOf(
    [
      S(
        'm3-boss-propor-population',
        'Problème : la population',
        'Traduire une augmentation ou une diminution en pourcentages',
        ['+10 % deux années de suite : × 1,1 × 1,1 = × 1,21, soit +21 % (pas +20 %).'],
        (rng) => {
          const t = rng.pick([10, 20]);
          const k = (100 + t) / 100;
          const tot = Math.round((k * k - 1) * 100);
          return {
            prompt: `Une ville gagne ${t} % d’habitants par an, deux années de suite. De quel pourcentage a-t-elle augmenté en deux ans ?`,
            answer: num(tot, '%'),
            traps: traps(r(tot), [
              [
                2 * t,
                `La 2e hausse s’applique à une population déjà augmentée : × ${fmt(r(100 + t, 100))} × ${fmt(r(100 + t, 100))}.`,
              ],
            ]),
            hint: `Multiplie par ${fmt(r(100 + t, 100))} deux fois.`,
            steps: [
              `${fmt(r(100 + t, 100))} × ${fmt(r(100 + t, 100))} = ${fmt(r(Math.round(k * k * 100), 100))}.`,
              `Hausse de **${tot} %**.`,
            ],
            targetSeconds: 50,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm3-boss-propor-heritage',
        'Problème : le partage selon l’âge',
        'Partager une somme entre deux personnes âgées de 20 et 30 ans proportionnellement à leur âge (automatisme)',
        ['Partager proportionnellement à 20 et 30 ans : ratio 20 : 30 = 2 : 3, donc 5 parts.'],
        (rng) => {
          const a = rng.int(8, 14);
          const b = rng.int(a + 1, 18);
          const unitPart = rng.int(2, 10) * 5;
          const total = (a + b) * unitPart;
          return {
            prompt: `Deux frères de ${a} et ${b} ans se partagent ${total} € proportionnellement à leur âge. Combien reçoit l’aîné ?`,
            answer: num(b * unitPart, '€'),
            traps: traps(r(b * unitPart), [
              [r(total, 2), 'Le partage suit les âges, il n’est pas équitable.'],
              [a * unitPart, 'Ça, c’est la part du plus jeune.'],
            ]),
            hint: `${a} + ${b} = ${a + b} parts.`,
            steps: [
              `Une part : ${total} ÷ ${a + b} = ${unitPart} €.`,
              `L’aîné : ${b} × ${unitPart} = **${b * unitPart} €**.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-propor-piege',
        'Piège : −50 % puis +50 %',
        'Traduire une augmentation ou une diminution en pourcentages',
        ['−50 % puis +50 % : × 0,5 × 1,5 = × 0,75. On a perdu 25 % !'],
        (rng) => {
          const p = rng.int(2, 10) * 40;
          return {
            prompt: `Une action vaut ${p} €. Elle perd 50 %, puis regagne 50 %. Combien vaut-elle ?`,
            answer: num((p * 3) / 4, '€'),
            traps: traps(r((p * 3) / 4), [[p, 'Les 50 % de hausse portent sur la valeur déjà divisée par deux.']]),
            hint: 'Calcule étape par étape.',
            steps: [`−50 % : ${p / 2} €. +50 % de ${p / 2} : + ${p / 4} €.`, `Valeur finale : **${(p * 3) / 4} €**.`],
            targetSeconds: 35,
          };
        },
      ),
    ],
  ),
);

// ——— Algorithmique ———

const boucleConditionnelle = S(
  'm3-boucle-conditionnelle',
  'Boucle « répéter jusqu’à »',
  'Utiliser une boucle conditionnelle',
  [
    '« répéter jusqu’à condition » : on refait le bloc tant que la condition est **fausse**, et on s’arrête dès qu’elle devient vraie.',
  ],
  (rng) => {
    const step = rng.int(3, 9);
    const limit = rng.int(20, 60);
    const start = rng.int(0, 5);
    let v = start;
    let turns = 0;
    while (!(v > limit)) {
      v += step;
      turns++;
    }
    const program: Block[] = [
      { op: 'set', variable: 'n', expr: String(start) },
      { op: 'until', cond: `n > ${limit}`, body: [{ op: 'change', variable: 'n', by: String(step) }] },
      { op: 'say', expr: 'n' },
    ];
    return {
      prompt: 'Que dit le lutin à la fin ?',
      figure: { kind: 'blocks', program },
      answer: num(v),
      traps: traps(r(v), [
        [v - step, `Avec ${v - step}, la condition « n > ${limit} » est encore fausse : la boucle continue.`],
      ]),
      hint: `Ajoute ${step} jusqu’à dépasser ${limit}.`,
      steps: [
        `n vaut ${start}, puis ${Array.from({ length: Math.min(turns, 6) }, (_, i) => start + step * (i + 1)).join(', ')}${turns > 6 ? '…' : ''}.`,
        `La première valeur > ${limit} est **${v}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const conditionsComposees = S(
  'm3-conditions-composees',
  'Conditions composées (et, ou)',
  'Utiliser des conditions composées',
  ['« A et B » est vrai si **les deux** sont vraies. « A ou B » est vrai si **au moins une** est vraie.'],
  (rng) => {
    const x = rng.int(0, 30);
    const lo = rng.int(5, 12);
    const hi = rng.int(15, 25);
    const useAnd = rng.int(0, 1) === 1;
    const cond = useAnd ? `x > ${lo} et x < ${hi}` : `x < ${lo} ou x > ${hi}`;
    const truth = useAnd ? x > lo && x < hi : x < lo || x > hi;
    const program: Block[] = [
      { op: 'set', variable: 'x', expr: String(x) },
      { op: 'if', cond, then: [{ op: 'say', expr: '1' }], else: [{ op: 'say', expr: '0' }] },
    ];
    return {
      prompt: 'Que dit le lutin ?',
      figure: { kind: 'blocks', program },
      answer: num(truth ? 1 : 0),
      traps: traps(r(truth ? 1 : 0), [
        [truth ? 0 : 1, useAnd ? '« et » : les deux conditions doivent être vraies.' : '« ou » : une seule suffit.'],
      ]),
      hint: `Teste chaque condition avec x = ${x}.`,
      steps: [`Avec x = ${x} : « ${cond} » est ${truth ? 'vraie' : 'fausse'}.`, `Le lutin dit **${truth ? 1 : 0}**.`],
      targetSeconds: 30,
    };
  },
);

const structurer = S(
  'm3-structurer',
  'Programme complet avec variables',
  'Approfondir la notion de variables',
  ['Suis chaque variable ligne par ligne ; dans une boucle, note leurs valeurs à chaque tour.'],
  (rng) => {
    const times = rng.int(3, 5);
    const program: Block[] = [
      { op: 'set', variable: 'a', expr: '1' },
      { op: 'set', variable: 'b', expr: '0' },
      {
        op: 'repeat',
        times,
        body: [
          { op: 'change', variable: 'b', by: 'a' },
          { op: 'set', variable: 'a', expr: 'a × 2' },
        ],
      },
      { op: 'say', expr: 'b' },
    ];
    let a = 1;
    let b = 0;
    for (let i = 0; i < times; i++) {
      b += a;
      a *= 2;
    }
    return {
      prompt: 'Que dit le lutin à la fin ?',
      figure: { kind: 'blocks', program },
      answer: num(b),
      traps: traps(r(b), [
        [a, 'Le lutin dit b, pas a.'],
        [times, 'b reçoit a à chaque tour, et a double.'],
      ]),
      hint: 'Fais un tableau : a et b à chaque tour.',
      steps: [
        `Tours : b = ${Array.from({ length: times }, (_, i) => 2 ** i).join(' + ')} et a double à chaque fois.`,
        `b = **${b}**.`,
      ],
      targetSeconds: 50,
    };
  },
);

const algorithmique = C(
  'm3-algorithmique',
  'informatique',
  'Algorithmique',
  [conditionsComposees, boucleConditionnelle, structurer],
  bossOf(
    [
      S(
        'm3-boss-algo-epargne',
        'Problème : l’épargne',
        'Utiliser une boucle conditionnelle',
        ['« répéter jusqu’à épargne ≥ objectif » : on compte les tours de boucle.'],
        (rng) => {
          const per = rng.int(5, 15);
          const goal = rng.int(60, 200);
          const months = Math.ceil(goal / per);
          return {
            prompt: `${rng.pick(NAMES)} met ${per} € de côté chaque mois, en partant de 0, jusqu’à avoir au moins ${goal} €. Combien de mois faut-il ?`,
            figure: {
              kind: 'blocks',
              program: [
                { op: 'set', variable: 'épargne', expr: '0' },
                { op: 'set', variable: 'mois', expr: '0' },
                {
                  op: 'until',
                  cond: `épargne ≥ ${goal}`,
                  body: [
                    { op: 'change', variable: 'épargne', by: String(per) },
                    { op: 'change', variable: 'mois', by: '1' },
                  ],
                },
                { op: 'say', expr: 'mois' },
              ],
            },
            answer: num(months),
            traps: traps(r(months), [
              [Math.floor(goal / per), 'Il faut **atteindre** l’objectif : un mois de plus si besoin.'],
            ]),
            hint: `Combien de fois ${per} pour atteindre ${goal} ?`,
            steps: [
              `${goal} ÷ ${per} ≈ ${fmt(r(Math.round((goal / per) * 100), 100))}.`,
              `Il faut **${months}** mois.`,
            ],
            targetSeconds: 45,
          };
        },
      ),
      S(
        'm3-boss-algo-acces',
        'Problème : le manège',
        'Utiliser des conditions composées',
        ['Accès au manège : taille ≥ 1,30 m **et** âge ≥ 10 ans. Il faut les deux.'],
        (rng) => {
          const t = r(rng.int(120, 145), 100);
          const age = rng.int(7, 14);
          const ok = t.n / t.d >= 1.3 && age >= 10;
          return {
            prompt: `Règle : on monte si taille ≥ 1,30 m et âge ≥ 10 ans. Noah mesure ${fmt(t)} m et a ${age} ans. Peut-il monter ?`,
            ...choice(
              rng,
              ok ? 'Oui' : 'Non',
              [{ label: ok ? 'Non' : 'Oui', why: '« et » : les deux conditions doivent être vraies.' }],
              true,
            ),
            hint: 'Teste les deux conditions.',
            steps: [
              `Taille ≥ 1,30 : ${t.n / t.d >= 1.3 ? 'vrai' : 'faux'}. Âge ≥ 10 : ${age >= 10 ? 'vrai' : 'faux'}.`,
              `**${ok ? 'Oui' : 'Non'}**.`,
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-algo-piege',
        'Piège : la boucle infinie',
        'Utiliser une boucle conditionnelle',
        ['Si la condition d’arrêt ne devient jamais vraie, la boucle ne s’arrête jamais.'],
        (rng) => {
          const s = rng.int(2, 5);
          return {
            prompt: `n part de 0. « répéter jusqu’à n = 7 : ajouter ${s * 2} à n ». La boucle s’arrête-t-elle ?`,
            ...choice(rng, 'Non, jamais', [
              { label: 'Oui, quand n dépasse 7', why: 'La condition est « n = 7 », pas « n > 7 ».' },
              { label: 'Oui, au bout de 7 tours', why: `n vaut toujours un multiple de ${s * 2}, jamais 7.` },
            ]),
            hint: `Quelles valeurs prend n ? 0, ${s * 2}, ${s * 4}…`,
            steps: [
              `n prend les valeurs 0, ${s * 2}, ${s * 4}… (que des nombres pairs).`,
              'n ne vaut jamais 7 : **non, jamais** (boucle infinie).',
            ],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);

export const TROISIEME: readonly Chapter[] = [
  arithmetique,
  puissances,
  racines,
  litteral,
  thales,
  trigonometrie,
  espace,
  vecteurs,
  statistiques,
  probabilites,
  fonctions,
  proportionnalite,
  algorithmique,
];
