import { choice, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf, MINUS, sgn } from '../kit.ts';
import { S, C, tenth } from './commun.ts';

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

export const racines = C(
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
