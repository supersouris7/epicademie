import { choice, nonZero, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf, MINUS, par, sgn } from '../kit.ts';
import { S, C, lin } from './commun.ts';

/** Trinôme ax² + bx + c. */
const tri = (a: number, b: number, c: number) => {
  const parts: string[] = [];
  parts.push(a === 1 ? 'x^2' : a === -1 ? `${MINUS}x^2` : `${sgn(a)}x^2`);
  if (b) parts.push(`${b < 0 ? MINUS : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`);
  if (c) parts.push(`${c < 0 ? MINUS : '+'} ${Math.abs(c)}`);
  return parts.join(' ');
};

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

export const litteral = C(
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
