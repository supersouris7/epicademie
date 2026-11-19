import { choice, fraction, num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { bossOf, MINUS, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

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

export const puissances = C(
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
