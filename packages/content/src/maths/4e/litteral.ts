import { choice, nonZero, num, traps } from '../../build.ts';
import { gcd, r } from '../../rational.ts';
import { bossOf, MINUS, par, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Calcul littéral et algébrique ———

const developper = S(
  'm4-developper',
  'Développer avec la distributivité',
  'Connaitre et utiliser la distributivité simple pour développer et factoriser une expression algébrique',
  ['k(a + b) = ka + kb : on distribue k à **chaque** terme. 3(x + 4) = 3x + 12 ; −2(x − 5) = −2x + 10.'],
  (rng, level) => {
    const k = level === 3 ? -rng.int(2, 6) : rng.int(2, 9);
    const b = nonZero(rng, -9, 9);
    const c = k * b;
    const expr = `${k < 0 ? sgn(k) : k}(x ${b < 0 ? MINUS : '+'} ${Math.abs(b)})`;
    const good = `${sgn(k)}x ${c < 0 ? MINUS : '+'} ${Math.abs(c)}`;
    return {
      prompt: `Développe ${expr}.`,
      ...choice(rng, good, [
        {
          label: `${sgn(k)}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)}`,
          why: `Il faut multiplier **aussi** ${sgn(b)} par ${sgn(k)}.`,
        },
        { label: `${sgn(k)}x ${c < 0 ? '+' : MINUS} ${Math.abs(c)}`, why: 'Attention à la règle des signes.' },
        { label: `x ${c < 0 ? MINUS : '+'} ${Math.abs(c)}`, why: `Il faut multiplier x par ${sgn(k)} aussi.` },
      ]),
      hint: `Multiplie ${sgn(k)} par x, puis ${sgn(k)} par ${sgn(b)}.`,
      steps: [`${sgn(k)} × x = ${sgn(k)}x et ${par(k)} × ${par(b)} = ${sgn(c)}.`, `${expr} = **${good}**.`],
      targetSeconds: 25,
    };
  },
);

const factoriser = S(
  'm4-factoriser',
  'Factoriser',
  'Connaitre et utiliser la distributivité simple pour développer et factoriser une expression algébrique',
  ['Factoriser, c’est l’inverse de développer : 6x + 15 = 3(2x + 5). On cherche un **facteur commun**.'],
  (rng) => {
    const k = rng.int(2, 9);
    const a = rng.int(1, 6);
    let b = rng.int(1, 9);
    while (gcd(a, b) !== 1) b++;
    const good = `${k}(${a === 1 ? '' : a}x + ${b})`;
    return {
      prompt: `Factorise ${k * a}x + ${k * b}.`,
      ...choice(rng, good, [
        { label: `${k}(${a === 1 ? '' : a}x + ${k * b})`, why: `Il faut diviser **les deux** termes par ${k}.` },
        { label: `${k * a}(x + ${k * b})`, why: `${k * a} ne divise pas ${k * b} ; cherche le facteur commun.` },
        { label: `${k}x(${a} + ${b})`, why: 'Le second terme ne contient pas x.' },
      ]),
      hint: `Quel nombre divise à la fois ${k * a} et ${k * b} ?`,
      steps: [
        `${k * a}x = ${k} × ${a === 1 ? '' : a}x et ${k * b} = ${k} × ${b}.`,
        `${k * a}x + ${k * b} = **${good}**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const reduire = S(
  'm4-reduire',
  'Réduire une expression',
  'Connaitre et utiliser : 1 × x = x ; x + x = 2x ; x × x = x² ; 3x + 2x = 5x ; 3x × 2x = 6x² (automatisme)',
  [
    'On regroupe les termes « en x » ensemble et les nombres ensemble : 3x + 5 + 2x − 1 = 5x + 4.',
    'Attention : 3x × 2x = 6x^2, mais 3x + 2x = 5x.',
  ],
  (rng, level) => {
    if (level === 3) {
      const a = rng.int(2, 6);
      const b = rng.int(2, 6);
      const good = `${a * b}x^2`;
      return {
        prompt: `Réduis ${a}x × ${b}x.`,
        ...choice(rng, good, [
          { label: `${a + b}x`, why: 'C’est une multiplication : x × x = x^2.' },
          { label: `${a * b}x`, why: 'x × x = x^2.' },
          { label: `${a + b}x^2`, why: `On multiplie les nombres : ${a} × ${b}.` },
        ]),
        hint: 'Multiplie les nombres entre eux, et x × x = x^2.',
        steps: [`${a} × ${b} = ${a * b} et x × x = x^2.`, `${a}x × ${b}x = **${good}**.`],
        targetSeconds: 20,
      };
    }
    const a = rng.int(2, 9);
    const b = nonZero(rng, -9, 9);
    const c = rng.int(1, 9);
    const d = nonZero(rng, -9, 9);
    const x = a + c;
    const k = b + d;
    const good = k === 0 ? `${x}x` : `${x}x ${k < 0 ? MINUS : '+'} ${Math.abs(k)}`;
    return {
      prompt: `Réduis ${a}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)} + ${c}x ${d < 0 ? MINUS : '+'} ${Math.abs(d)}.`,
      ...choice(rng, good, [
        { label: `${x + k}x`, why: 'On ne peut pas ajouter des « x » et des nombres seuls.' },
        {
          label: k === 0 ? `${a * c}x` : `${a * c}x ${k < 0 ? MINUS : '+'} ${Math.abs(k)}`,
          why: `${a}x + ${c}x = ${x}x : on additionne.`,
        },
        { label: `${x}x ${k < 0 ? '+' : MINUS} ${Math.abs(k) || 1}`, why: 'Attention aux signes des nombres.' },
      ]),
      hint: 'Regroupe les x ensemble et les nombres ensemble.',
      steps: [
        `Les x : ${a}x + ${c}x = ${x}x. Les nombres : ${sgn(b)} + ${par(d)} = ${sgn(k)}.`,
        `Résultat : **${good}**.`,
      ],
      targetSeconds: 25,
    };
  },
);

const equationAffine = S(
  'm4-equation',
  'Résoudre ax + b = c',
  'Résoudre une équation du premier degré du type ax + b = c',
  [
    'Pour 3x + 5 = 20 : on enlève 5 des deux côtés (3x = 15), puis on divise par 3 (x = 5).',
    'Vérifie toujours : 3 × 5 + 5 = 20 ✔.',
  ],
  (rng, level) => {
    const a = level === 3 ? nonZero(rng, -9, 9) : rng.int(2, 9);
    const x = nonZero(rng, -10, 10);
    const b = nonZero(rng, -15, 15);
    const c = a * x + b;
    return {
      prompt: `Résous ${a === -1 ? MINUS : a === 1 ? '' : sgn(a)}x ${b < 0 ? MINUS : '+'} ${Math.abs(b)} = ${sgn(c)}. Donne x.`,
      answer: num(x),
      traps: traps(r(x), [
        [r(c + b, a), `Pour enlever ${sgn(b)}, on fait l’opération inverse.`],
        [r(c - b), `Il faut encore diviser par ${sgn(a)}.`],
      ]),
      hint: `Enlève d’abord ${sgn(b)} des deux côtés, puis divise par ${sgn(a)}.`,
      steps: [`${sgn(a)}x = ${sgn(c)} − ${par(b)} = ${sgn(c - b)}.`, `x = ${sgn(c - b)} ÷ ${par(a)} = **${sgn(x)}**.`],
      targetSeconds: 35,
    };
  },
  { mental: true },
);

const mettreEnEquation = S(
  'm4-mise-en-equation',
  'Mettre un problème en équation',
  'Mettre en équation un problème et le résoudre à l’aide d’une équation du premier degré du type ax + b = cx + d',
  ['Choisis x (le nombre cherché), écris l’égalité de l’énoncé, puis résous : 5x + 3 = 2x + 18 → 3x = 15 → x = 5.'],
  (rng) => {
    const x = rng.int(2, 12);
    const a = rng.int(3, 7);
    const c = rng.int(1, a - 1);
    const b = rng.int(1, 15);
    const d = (a - c) * x + b;
    return {
      prompt: `Je pense à un nombre. Si je le multiplie par ${a} et que j’ajoute ${b}, j’obtiens la même chose que si je le multiplie par ${c} et que j’ajoute ${d}. Quel est ce nombre ?`,
      answer: num(x),
      traps: traps(r(x), [
        [r(d - b, a + c), `Les x sont des deux côtés : on retire ${c}x des deux côtés (${a}x − ${c}x).`],
      ]),
      hint: `Écris ${a}x + ${b} = ${c}x + ${d}, puis rassemble les x d’un côté.`,
      steps: [`${a}x + ${b} = ${c}x + ${d}, donc ${a - c}x = ${d - b}.`, `x = ${d - b} ÷ ${a - c} = **${x}**.`],
      targetSeconds: 60,
    };
  },
);

export const litteral = C(
  'm4-litteral',
  'nombres',
  'Calcul littéral et équations',
  [developper, factoriser, reduire, equationAffine, mettreEnEquation],
  bossOf(
    [
      S(
        'm4-boss-litteral-forfaits',
        'Problème : deux forfaits',
        'Mettre en équation un problème et le résoudre à l’aide d’une équation du premier degré du type ax + b = cx + d',
        ['Forfait A : 2x + 10 ; forfait B : 4x. Même prix quand 2x + 10 = 4x, soit x = 5.'],
        (rng) => {
          const pa = rng.int(2, 5);
          const fee = rng.int(2, 6) * 5;
          const pb = pa + rng.pick([1, 2, 5].filter((k) => fee % k === 0));
          const x = fee / (pb - pa);
          return {
            prompt: `Club A : ${fee} € d’inscription puis ${pa} € par séance. Club B : ${pb} € par séance, sans inscription. Pour combien de séances les deux clubs coûtent-ils le même prix ?`,
            answer: num(x),
            traps: traps(r(x), [
              [r(fee, pb + pa), `Écris ${fee} + ${pa}x = ${pb}x : on soustrait ${pa}x des deux côtés.`],
            ]),
            hint: `Écris ${fee} + ${pa}x = ${pb}x.`,
            steps: [
              `${fee} + ${pa}x = ${pb}x, donc ${fee} = ${pb - pa}x.`,
              `x = ${fee} ÷ ${pb - pa} = **${x}** séances.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm4-boss-litteral-rectangle',
        'Problème : le périmètre',
        'Résoudre une équation du premier degré du type ax + b = c',
        ['Un rectangle de côtés x et x + 3 a pour périmètre 2(x + x + 3) = 4x + 6.'],
        (rng) => {
          const x = rng.int(3, 15);
          const k = rng.int(2, 6);
          const p = 2 * (x + x + k);
          return {
            prompt: `Un rectangle a une largeur x et une longueur x + ${k} (en cm). Son périmètre vaut ${p} cm. Combien vaut x ?`,
            answer: num(x, 'cm'),
            traps: traps(r(x), [[r(p - k, 2), `Le périmètre vaut 2 × (x + x + ${k}) = 4x + ${2 * k}.`]]),
            hint: `Écris 4x + ${2 * k} = ${p}.`,
            steps: [
              `2(x + x + ${k}) = 4x + ${2 * k} = ${p}, donc 4x = ${p - 2 * k}.`,
              `x = ${p - 2 * k} ÷ 4 = **${x} cm**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-litteral-piege',
        'Piège : 3 + 2x',
        'Connaitre et utiliser : 1 × x = x ; x + x = 2x ; x × x = x² ; 3x + 2x = 5x ; 3x × 2x = 6x² (automatisme)',
        ['3 + 2x ne se réduit pas en 5x : on n’ajoute pas un nombre et des « x ».'],
        (rng) => {
          const a = rng.int(2, 9);
          const b = rng.int(2, 9);
          return {
            prompt: `Peut-on réduire ${a} + ${b}x ?`,
            ...choice(rng, `Non, ${a} + ${b}x est déjà réduit`, [
              { label: `Oui : ${a + b}x`, why: `Pour x = 0 : ${a} + ${b}x vaut ${a}, mais ${a + b}x vaut 0.` },
              { label: `Oui : ${a * b}x`, why: 'On ne mélange pas les nombres et les x.' },
            ]),
            hint: 'Teste avec x = 0 : les deux écritures donnent-elles la même chose ?',
            steps: [
              `Pour x = 0 : ${a} + ${b} × 0 = ${a}, alors que ${a + b} × 0 = 0.`,
              `**Non, ${a} + ${b}x est déjà réduit**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
