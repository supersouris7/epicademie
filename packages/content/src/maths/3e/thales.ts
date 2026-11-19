import { choice, num, traps } from '../../build.ts';
import { add, fmt, mul, r, type Rational } from '../../rational.ts';
import type { Figure } from '../../types.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Thalès ———

const thalesFigure = (butterfly: boolean): Figure =>
  butterfly
    ? {
        // Papillon schématique : (AN) et (BP) se coupent en M, (AB) // (NP).
        kind: 'grid',
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        axes: false,
        points: [
          { name: 'A', x: -2, y: 2 },
          { name: 'B', x: -2, y: -2 },
          { name: 'M', x: 0, y: 0, color: 'accent' },
          { name: 'N', x: 4, y: -4 },
          { name: 'P', x: 4, y: 4 },
        ],
        segments: [
          ['A', 'N'],
          ['B', 'P'],
          ['A', 'B'],
          ['N', 'P'],
        ],
      }
    : {
        kind: 'polygon',
        vertices: [
          { name: 'A', x: 3, y: 5 },
          { name: 'B', x: 0, y: 0 },
          { name: 'C', x: 8, y: 0 },
        ],
        // M sur [AB] et N sur [AC] à la même hauteur : (MN) // (BC).
        extra: [{ from: { x: 1.2, y: 2 }, to: { x: 6, y: 2 }, label: 'MN' }],
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

export const thales = C(
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
