import { choice, fraction, num, traps } from '../../build.ts';
import { dec, fmt, frac, mul, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Probabilités ———

const contraire = S(
  'm4-proba-contraire',
  'Évènement contraire',
  'Calculer la probabilité d’un évènement et de l’évènement contraire',
  ['P(non A) = 1 − P(A). Si la probabilité qu’il pleuve est 0,3, celle qu’il ne pleuve pas est 0,7.'],
  (rng, level) => {
    if (level === 1) {
      const p = dec(rng.int(1, 99), 2);
      const q = r(100 - p.n * (100 / p.d), 100);
      return {
        prompt: `La probabilité de gagner à un jeu est ${fmt(p)}. Quelle est la probabilité de ne pas gagner ?`,
        answer: num(q),
        traps: traps(q, [[p, 'Ne pas gagner, c’est l’évènement **contraire**.']]),
        hint: 'L’évènement contraire : P(contraire) = 1 − P(gagner).',
        steps: [`1 − ${fmt(p)}.`, `= **${fmt(q)}**.`],
        targetSeconds: 15,
      };
    }
    const d = rng.int(5, 12);
    const n = rng.int(1, d - 1);
    return {
      prompt: `P(A) = ${frac(r(n, d))}. Quelle est la probabilité de l’évènement contraire de A ?`,
      answer: fraction(r(d - n, d)),
      traps: traps(r(d - n, d), [[r(n, d), 'L’évènement contraire a la probabilité 1 − P(A).']]),
      hint: 'La probabilité du contraire vaut 1 − P(A).',
      steps: [`1 − ${frac(r(n, d))} = {${d}/${d}} − ${frac(r(n, d))}.`, `= **${frac(r(d - n, d))}**.`],
      targetSeconds: 20,
    };
  },
);

const deuxEpreuves = S(
  'm4-deux-epreuves',
  'Expériences à deux épreuves',
  'Exemples simples d’expériences aléatoires à deux épreuves (par exemple, lancer de deux pièces, d’une pièce et d’un dé, de deux dés, etc.)',
  [
    'On liste toutes les issues avec un **tableau** ou un **arbre** : deux pièces → PP, PF, FP, FF (4 issues).',
    'Deux dés → 6 × 6 = 36 issues.',
  ],
  (rng, level) => {
    if (level === 1) {
      const target = rng.pick([
        { t: 'deux « pile »', n: 1 },
        { t: 'un « pile » et un « face »', n: 2 },
        { t: 'au moins un « pile »', n: 3 },
      ]);
      return {
        prompt: `On lance deux pièces. Quelle est la probabilité d’obtenir ${target.t} ?`,
        answer: fraction(r(target.n, 4)),
        traps: traps(r(target.n, 4), [[r(1, 3), 'Il y a 4 issues : PP, PF, FP, FF (PF et FP sont différentes).']]),
        hint: 'Liste les 4 issues : PP, PF, FP, FF.',
        steps: [
          'Issues : PP, PF, FP, FF (4 issues).',
          `Favorables : ${target.n}. Probabilité **${frac(r(target.n, 4))}**.`,
        ],
        targetSeconds: 30,
      };
    }
    const sum = rng.int(2, 12);
    const ways = 6 - Math.abs(7 - sum);
    return {
      prompt: `On lance deux dés équilibrés et on additionne. Quelle est la probabilité d’obtenir ${sum} ?`,
      answer: fraction(r(ways, 36)),
      traps: traps(r(ways, 36), [[r(1, 11), 'Les 11 sommes ne sont pas équiprobables : il y a 36 issues.']]),
      hint: 'Fais un tableau 6 × 6 des sommes.',
      steps: [
        `Dans le tableau 6 × 6 (36 issues), la somme ${sum} apparaît ${ways} fois.`,
        `Probabilité : ${frac(r(ways, 36)) === `{${ways}/36}` ? '' : `{${ways}/36} = `}**${frac(r(ways, 36))}**.`,
      ],
      targetSeconds: 50,
    };
  },
);

const vocabEnsembliste = S(
  'm4-reunion-intersection',
  'Réunion, intersection, impossible',
  'Définir : complémentaire, réunion, intersection, ensemble vide (évènement impossible)',
  [
    'A ∩ B (« A et B ») : les deux à la fois. A ∪ B (« A ou B ») : au moins l’un des deux.',
    'Un évènement impossible correspond à l’ensemble vide.',
  ],
  (rng) => {
    const q = rng.pick([
      {
        p: 'On lance un dé. A : « pair », B : « supérieur à 3 ». Combien d’issues réalisent A ∩ B ?',
        a: 2,
        w: 4,
        why: 'A ∩ B : pair **et** > 3 → 4 et 6.',
      },
      {
        p: 'On lance un dé. A : « pair », B : « supérieur à 3 ». Combien d’issues réalisent A ∪ B ?',
        a: 4,
        w: 6,
        why: 'A ∪ B : pair **ou** > 3 → 2, 4, 5, 6.',
      },
      {
        p: 'On lance un dé. A : « 1 », B : « pair ». Combien d’issues réalisent A ∩ B ?',
        a: 0,
        w: 4,
        why: '1 n’est pas pair : A ∩ B est impossible (ensemble vide).',
      },
    ]);
    return {
      prompt: q.p,
      answer: num(q.a),
      traps: traps(r(q.a), [[q.w, q.why]]),
      hint: '∩ : « et » (les deux à la fois) ; ∪ : « ou » (au moins un).',
      steps: [q.why, `Il y a **${q.a}** issue${q.a > 1 ? 's' : ''}.`],
      targetSeconds: 30,
    };
  },
);

export const probabilites = C(
  'm4-probabilites',
  'donnees',
  'Probabilités',
  [contraire, deuxEpreuves, vocabEnsembliste],
  bossOf(
    [
      S(
        'm4-boss-probas-menu',
        'Problème : le menu surprise',
        'Exemples simples d’expériences aléatoires à deux épreuves',
        ['2 entrées et 3 plats : 2 × 3 = 6 menus possibles, chacun avec la probabilité {1/6}.'],
        (rng) => {
          const e = rng.int(2, 4);
          const p = rng.int(2, 5);
          return {
            prompt: `Une cantine tire au hasard une entrée parmi ${e} et un plat parmi ${p}. Quelle est la probabilité d’avoir exactement ton entrée et ton plat préférés ?`,
            answer: fraction(r(1, e * p)),
            traps: traps(r(1, e * p), [[r(1, e + p), `On multiplie les choix : ${e} × ${p} menus.`]]),
            hint: 'Combien de menus différents sont possibles ?',
            steps: [`${e} × ${p} = ${e * p} menus équiprobables.`, `Un seul convient : **{1/${e * p}}**.`],
            targetSeconds: 40,
          };
        },
      ),
      S(
        'm4-boss-probas-sondage',
        'Problème : la loterie',
        'Calculer la probabilité d’un évènement et de l’évènement contraire',
        ['P(au moins un) = 1 − P(aucun).'],
        (rng) => {
          const p = rng.pick([r(1, 4), r(1, 5), r(2, 5)]);
          const q = r(p.d - p.n, p.d);
          const both = mul(q, q);
          const atLeast = r(both.d - both.n, both.d);
          return {
            prompt: `À chaque tirage, la probabilité de gagner est ${frac(p)}. On joue deux fois (tirages indépendants). Quelle est la probabilité de gagner au moins une fois ?`,
            answer: fraction(atLeast),
            traps: traps(atLeast, [
              [mul(p, r(2)), 'On ne double pas : calcule d’abord la probabilité de perdre les deux fois.'],
            ]),
            hint: 'Calcule la probabilité de perdre deux fois, puis prends le contraire.',
            steps: [
              `Perdre une fois : ${frac(q)} ; deux fois : ${frac(q)} × ${frac(q)} = ${frac(both)}.`,
              `Au moins une victoire : 1 − ${frac(both)} = **${frac(atLeast)}**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-probas-piege',
        'Piège : 2 issues, 1 chance sur 2 ?',
        'Calculer la probabilité d’un évènement et de l’évènement contraire',
        ['Deux issues ne veut pas dire une chance sur deux : tout dépend si elles sont équiprobables.'],
        (rng) => {
          const red = rng.int(1, 3);
          const blue = rng.int(red + 2, 9);
          return {
            prompt: `Un sac contient ${red} boule${red > 1 ? 's' : ''} rouge${red > 1 ? 's' : ''} et ${blue} bleues. Tirer une rouge : est-ce une chance sur deux, puisqu’il y a deux couleurs ?`,
            ...choice(rng, `Non : ${frac(r(red, red + blue))}`, [
              { label: 'Oui : {1/2}', why: 'Les deux couleurs n’ont pas autant de boules.' },
            ]),
            hint: 'Compte les boules, pas les couleurs.',
            steps: [
              `${red} rouge${red > 1 ? 's' : ''} sur ${red + blue} boules.`,
              `**Non : ${frac(r(red, red + blue))}**.`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
