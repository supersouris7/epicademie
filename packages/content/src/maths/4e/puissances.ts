import { num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { bossOf, MINUS, par, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

/** Exposant écrit en mini-balisage (un chiffre : ^5 ; sinon en clair). */
const pow = (base: string, e: number) => (e < 10 ? `${base}^${e}` : `${base} puissance ${e}`);

// ——— Puissances ———

const puissanceDefinition = S(
  'm4-puissance-definition',
  'Puissance d’un nombre',
  'Définir les puissances d’exposant positif d’un nombre a',
  ['a^n = a × a × … × a (n facteurs). 2^5 = 2 × 2 × 2 × 2 × 2 = 32. Attention : 2^5 n’est pas 2 × 5 !'],
  (rng, level) => {
    const base = level === 3 ? -rng.int(2, 3) : rng.int(2, level === 1 ? 3 : 5);
    const e = rng.int(2, level === 2 ? 4 : 5);
    const res = base ** e;
    return {
      prompt: `Calcule ${base < 0 ? `(${sgn(base)})` : base}^${e}.`,
      answer: num(res),
      traps: traps(r(res), [
        [
          base * e,
          `${base < 0 ? `(${sgn(base)})` : base}^${e} n’est pas ${sgn(base)} × ${e} : c’est ${e} facteurs égaux à ${sgn(base)}.`,
        ],
        [-res, 'Attention au signe : compte les facteurs négatifs.'],
      ]),
      hint: `Écris les ${e} facteurs, puis multiplie.`,
      steps: [`${Array.from({ length: e }, () => par(base)).join(' × ')}.`, `= **${sgn(res)}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const produitPuissances = S(
  'm4-produit-puissances',
  'Multiplier des puissances',
  'Multiplier des puissances d’exposant entier naturel d’un même nombre entre elles',
  ['a^m × a^n = a^(m+n) : on **additionne** les exposants. 2^3 × 2^4 = 2^7 (3 + 4 facteurs 2).'],
  (rng, level) => {
    const base = rng.pick(['a', 'x', '5', '7', '10']);
    const m = rng.int(2, 5);
    const n = rng.int(2, 4);
    if (level === 3) {
      const a = rng.int(2, 5);
      const b = rng.int(2, 5);
      const e = rng.int(2, 3);
      return {
        prompt: `Écris ${a}^${e} × ${b}^${e} sous la forme d’une seule puissance d’exposant ${e} : quelle est la base ?`,
        answer: num(a * b),
        traps: traps(r(a * b), [[a + b, 'a^n × b^n = (a × b)^n : on multiplie les bases.']]),
        hint: 'Même exposant : a^n × b^n = (a × b)^n.',
        steps: [`${a}^${e} × ${b}^${e} = (${a} × ${b})^${e}.`, `La base est **${a * b}**.`],
        targetSeconds: 20,
      };
    }
    return {
      prompt: `${pow(base, m)} × ${pow(base, n)} = ${base}^… : quel est l’exposant ?`,
      answer: num(m + n),
      traps: traps(r(m + n), [[m * n, 'On additionne les exposants : on compte les facteurs.']]),
      hint: `Compte tous les facteurs ${base} : ${m} d’un côté, ${n} de l’autre.`,
      steps: [
        `${m} facteurs ${base}, puis ${n} facteurs ${base} : ${m} + ${n} facteurs.`,
        `L’exposant est **${m + n}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const puissances10 = S(
  'm4-puissances-10',
  'Puissances de 10',
  'Résoudre des problèmes faisant intervenir des puissances',
  ['10^n = 1 suivi de n zéros : 10^6 = 1 000 000 (un million).', '3,2 × 10^3 = 3 200 : la virgule avance de 3 rangs.'],
  (rng, level) => {
    const n = rng.int(2, 7);
    if (level === 1) {
      return {
        prompt: `Combien de zéros dans l’écriture de 10^${n} ?`,
        answer: num(n),
        traps: traps(r(n), [[n + 1, `10^${n} s’écrit 1 suivi de ${n} zéros.`]]),
        hint: '10^2 = 100 : 2 zéros.',
        steps: [`10^${n} = 1${'0'.repeat(n)}.`, `Il y a **${n}** zéros.`],
        targetSeconds: 10,
      };
    }
    const x = r(rng.int(11, 99), 10);
    const res = mul(x, r(10 ** n));
    return {
      prompt: `Calcule ${fmt(x)} × 10^${n}.`,
      answer: num(res),
      traps: traps(res, [[mul(x, r(10 * n)), `10^${n} n’est pas 10 × ${n}.`]]),
      hint: `× 10^${n} : la virgule avance de ${n} rangs vers la droite.`,
      steps: [`10^${n} = ${fmt(r(10 ** n))}.`, `${fmt(x)} × ${fmt(r(10 ** n))} = **${fmt(res)}**.`],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

export const puissances = C(
  'm4-puissances',
  'nombres',
  'Puissances',
  [puissanceDefinition, produitPuissances, puissances10],
  bossOf(
    [
      S(
        'm4-boss-puissances-bacteries',
        'Problème : les bactéries',
        'Résoudre des problèmes faisant intervenir des puissances',
        ['Si une population double chaque heure, après n heures elle est multipliée par 2^n.'],
        (rng) => {
          const h = rng.int(3, 8);
          const start = rng.pick([1, 3, 5, 10]);
          return {
            prompt: `Une colonie de ${start} bactérie${start > 1 ? 's' : ''} double chaque heure. Combien y en a-t-il après ${h} heures ?`,
            answer: num(start * 2 ** h),
            traps: traps(r(start * 2 ** h), [
              [start * 2 * h, `Doubler à chaque heure, c’est multiplier par 2, ${h} fois : 2^${h}.`],
            ]),
            hint: `Multiplie ${start} par 2, ${h} fois.`,
            steps: [`Après ${h} h : ${start} × 2^${h} = ${start} × ${2 ** h}.`, `= **${start * 2 ** h}** bactéries.`],
            targetSeconds: 45,
          };
        },
        { advice: 'calculatrice' },
      ),
      S(
        'm4-boss-puissances-cubes',
        'Problème : le grand cube',
        'Résoudre des problèmes faisant intervenir des puissances',
        ['Un cube de n petits cubes d’arête contient n^3 petits cubes.'],
        (rng) => {
          const n = rng.int(3, 9);
          return {
            prompt: `Un grand cube a ${n} petits cubes sur chaque arête. Combien de petits cubes contient-il ?`,
            answer: num(n ** 3),
            traps: traps(r(n ** 3), [
              [n * 3, `C’est ${n}^3 = ${n} × ${n} × ${n}, pas ${n} × 3.`],
              [n * n, `${n} × ${n}, c’est un seul étage.`],
            ]),
            hint: `${n} × ${n} cubes par étage, et ${n} étages.`,
            steps: [`${n}^3 = ${n} × ${n} × ${n}.`, `= **${n ** 3}** petits cubes.`],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-puissances-piege',
        'Piège : (−2)^2 ou −2^2 ?',
        'Définir les puissances d’exposant positif d’un nombre a',
        ['(−3)^2 = (−3) × (−3) = 9, mais −3^2 = −(3 × 3) = −9 : l’exposant ne s’applique qu’à ce qui est juste avant.'],
        (rng) => {
          const a = rng.int(2, 6);
          return {
            prompt: `Calcule ${MINUS}${a}^2 (sans parenthèses).`,
            answer: num(-a * a),
            traps: traps(r(-a * a), [
              [a * a, `Sans parenthèses, le carré ne porte que sur ${a} : ${MINUS}${a}^2 = ${MINUS}(${a} × ${a}).`],
            ]),
            hint: 'Sans parenthèses, sur quoi porte l’exposant ?',
            steps: [`L’exposant porte seulement sur ${a} : ${a}^2 = ${a * a}.`, `${MINUS}${a}^2 = **${sgn(-a * a)}**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
