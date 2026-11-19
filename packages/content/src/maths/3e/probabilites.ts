import { choice, fraction, num, traps } from '../../build.ts';
import { fmt, frac, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

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

export const probabilites = C(
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
