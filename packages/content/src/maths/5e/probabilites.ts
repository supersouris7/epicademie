import { choice, fraction, num, objective, traps } from '../../build.ts';
import { dec, fmt, frac, mul, r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Probabilités ───────────────────────── */

const probaVocab: Skill = {
  id: 'm5-probas-vocab',
  title: 'Vocabulaire des probabilités',
  lesson: {
    memo: [
      'Lancer un dé, c’est une **expérience aléatoire** : on ne peut pas savoir à l’avance ce qui va sortir.',
      'Chaque résultat possible (1, 2, 3…) est une **issue**. « Obtenir 7 » avec un dé est **impossible** (probabilité 0) ; « obtenir entre 1 et 6 » est **certain** (probabilité 1).',
    ],
    source: objective(
      'Utiliser le vocabulaire des probabilités dans des contextes concrets : expérience aléatoire, issue, évènement',
    ),
  },
  generate(rng, level) {
    const items = [
      {
        t: 'Obtenir 7 en lançant un dé à six faces est un évènement…',
        a: 'impossible',
        w: ['certain', 'probable', 'équiprobable'],
      },
      {
        t: 'Obtenir un nombre entre 1 et 6 en lançant un dé à six faces est un évènement…',
        a: 'certain',
        w: ['impossible', 'peu probable', 'rare'],
      },
      {
        t: 'Lancer une pièce et regarder la face obtenue est…',
        a: 'une expérience aléatoire',
        w: ['un évènement certain', 'un calcul', 'un évènement impossible'],
      },
      {
        t: 'Avec un dé, « obtenir 4 » est…',
        a: 'une issue',
        w: ['une expérience aléatoire', 'un évènement impossible', 'une probabilité'],
      },
      {
        t: 'Une probabilité est toujours…',
        a: 'comprise entre 0 et 1',
        w: ['supérieure à 1', 'un nombre entier', 'égale à {1/2}'],
      },
    ];
    const pool = level === 1 ? items.slice(0, 2) : items;
    const it = rng.pick(pool);
    return {
      prompt: it.t,
      ...choice(
        rng,
        it.a,
        it.w.map((label) => ({ label, why: `La bonne réponse : ${it.a}.` })),
      ),
      hint: 'Imagine que tu fais vraiment l’expérience : qu’est-ce qui peut arriver ?',
      steps: [
        'On imagine qu’on fait vraiment l’expérience.',
        it.a === 'impossible'
          ? 'Aucune face du dé ne porte 7 : ça ne peut jamais arriver.'
          : it.a === 'certain'
            ? 'Toutes les faces portent un nombre entre 1 et 6 : ça arrive à tous les coups.'
            : it.a === 'une expérience aléatoire'
              ? 'On ne peut pas savoir à l’avance si on aura pile ou face : c’est le hasard.'
              : it.a === 'une issue'
                ? '« Obtenir 4 », c’est un des résultats possibles du lancer.'
                : 'Une probabilité va de 0 (jamais) à 1 (à coup sûr).',
        `${it.t} **${it.a}**.`,
      ],
      targetSeconds: 15,
    };
  },
};

const probaCalcul: Skill = {
  id: 'm5-probas-calcul',
  title: 'Calculer une probabilité',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Probabilité = **ce qui m’arrange** sur **tout ce qui peut arriver**.',
      'Urne de 3 boules rouges et 5 bleues : 3 rouges m’arrangent, sur 8 boules en tout → {3/8}.',
      '« Une chance sur 4 », c’est {1/4} = 0,25 = 25 %.',
    ],
    source: objective('Attribuer des probabilités dans des cas simples (équiprobabilité)'),
  },
  generate(rng, level) {
    if (level === 1) {
      const events = [
        { t: 'obtenir 3', fav: 1 },
        { t: 'obtenir un nombre pair', fav: 3 },
        { t: 'obtenir un nombre strictement supérieur à 4', fav: 2 },
        { t: 'obtenir un multiple de 3', fav: 2 },
      ];
      const e = rng.pick(events);
      const p = r(e.fav, 6);
      return {
        prompt: `On lance un dé équilibré à six faces. Quelle est la probabilité d’${e.t} ?`,
        answer: fraction(p),
        traps: traps(p, [
          [r(6, e.fav), 'C’est favorables ÷ possibles, pas l’inverse.'],
          [r(e.fav, 5), 'Un dé a 6 faces, donc 6 issues possibles.'],
        ]),
        hint: `Combien de faces t’arrangent pour « ${e.t} » ? Et combien de faces en tout ?`,
        steps: [
          'Tout ce qui peut arriver : les 6 faces du dé.',
          `Ce qui m’arrange (« ${e.t} ») : ${e.fav === 1 ? 'la face 3' : e.fav === 3 ? 'les faces 2, 4 et 6' : e.t.includes('supérieur') ? 'les faces 5 et 6' : 'les faces 3 et 6'}, soit ${e.fav} face${e.fav > 1 ? 's' : ''}.`,
          `P = ${e.fav} sur 6 = **{${e.fav}/6}**${p.d !== 6 ? ` (ou **${frac(p)}** en simplifiant)` : ''}`,
        ],
      };
    }
    if (level === 2) {
      const red = rng.int(1, 8);
      const blue = rng.int(1, 8);
      const p = r(red, red + blue);
      return {
        prompt: `Une urne contient ${red} boule${red > 1 ? 's' : ''} rouge${red > 1 ? 's' : ''} et ${blue} boule${blue > 1 ? 's' : ''} bleue${blue > 1 ? 's' : ''}. On tire une boule au hasard. Quelle est la probabilité qu’elle soit rouge ?`,
        answer: fraction(p),
        traps: traps(p, [
          [r(red, blue), `On divise par le nombre **total** de boules (${red + blue}), pas par le nombre de bleues.`],
        ]),
        hint: 'Combien de boules rouges ? Et combien de boules en tout (rouges + bleues) ?',
        steps: [
          `Tout ce qui peut sortir : ${red} + ${blue} = ${red + blue} boules.`,
          `Ce qui m’arrange : les ${red} boule${red > 1 ? 's' : ''} rouge${red > 1 ? 's' : ''}.`,
          `P(rouge) = ${red} sur ${red + blue} = **{${red}/${red + blue}}**${p.d !== red + blue ? ` (ou **${frac(p)}**)` : ''}`,
        ],
      };
    }
    const n = rng.pick([2, 4, 5, 10]);
    const p = r(1, n);
    return {
      prompt: `Il y a « une chance sur ${n} » de gagner. Écris cette probabilité sous forme décimale.`,
      answer: num(p),
      traps: traps(p, [
        [r(n), `Une chance sur ${n}, c’est 1 ÷ ${n}.`],
        [mul(p, r(100)), 'C’est le pourcentage ; on demande l’écriture décimale.'],
      ]),
      hint: `« Une chance sur ${n} », c’est la fraction {1/${n}}, c’est-à-dire 1 ÷ ${n}.`,
      steps: [
        `« Une chance sur ${n} » s’écrit {1/${n}}.`,
        `La barre de fraction est une division : 1 ÷ ${n} = **${fmt(p)}**`,
      ],
    };
  },
};

const probaFrequence: Skill = {
  id: 'm5-probas-frequences',
  title: 'Échelle de probabilité et fréquences',
  lesson: {
    memo: [
      'L’échelle va de **0 (jamais)** à **1 (à coup sûr)**. Au milieu, {1/2} : une chance sur deux, comme pile ou face.',
      'La **fréquence**, c’est ce qu’on a vraiment observé : 23 piles sur 50 lancers → 23 ÷ 50 = 0,46. Si on lance beaucoup, elle se rapproche de 0,5.',
    ],
    source: objective(
      'Positionner sur une échelle de probabilité des évènements. Répéter matériellement une expérience aléatoire simple. Enregistrer les résultats observés dans un tableau d’effectifs et de fréquences',
    ),
  },
  generate(rng, level) {
    if (level <= 2) {
      const items = [
        { t: 'obtenir pile en lançant une pièce équilibrée', a: '{1/2}' },
        { t: 'obtenir 10 fois de suite la valeur 1 avec un dé', a: 'proche de 0' },
        { t: 'ne pas trouver la bonne combinaison au loto', a: 'proche de 1' },
        { t: 'obtenir 2 en lançant un dé équilibré', a: '{1/6}' },
        { t: 'un évènement impossible', a: '0' },
        { t: 'un évènement certain', a: '1' },
      ];
      const it = rng.pick(items);
      const all = ['0', 'proche de 0', '{1/6}', '{1/2}', 'proche de 1', '1'];
      return {
        prompt: `Où placer « ${it.t} » sur l’échelle de probabilité ?`,
        ...choice(
          rng,
          it.a,
          all
            .filter((x) => x !== it.a)
            .slice(0, 3)
            .map((label) => ({ label, why: `La bonne position est ${it.a}.` })),
        ),
        hint: 'Ça arrive jamais (0), rarement (proche de 0), une fois sur deux ({1/2}), presque toujours (proche de 1) ou toujours (1) ?',
        steps: [
          'L’échelle va de 0 (jamais) à 1 (toujours), avec {1/2} au milieu (une fois sur deux).',
          it.a === '{1/2}'
            ? 'Pile ou face : une chance sur deux.'
            : it.a === '{1/6}'
              ? 'Une face sur les 6 du dé : une chance sur 6.'
              : it.a === 'proche de 0'
                ? 'C’est possible, mais il faudrait beaucoup de chance : ça n’arrive presque jamais.'
                : it.a === 'proche de 1'
                  ? 'Gagner au loto est très rare, donc perdre arrive presque toujours.'
                  : it.a === '0'
                    ? 'Impossible : ça n’arrive jamais.'
                    : 'Certain : ça arrive à tous les coups.',
          `On le place à **${it.a}**.`,
        ],
      };
    }
    const throws = rng.pick([20, 25, 50]);
    const success = rng.int(Math.round(throws * 0.3), Math.round(throws * 0.7));
    const f = r(success, throws);
    return {
      prompt: `On lance ${throws} fois une pièce et on obtient ${success} fois pile. Quelle est la fréquence de « pile » (en décimal) ?`,
      answer: num(f),
      traps: traps(f, [
        [dec(5, 1), '0,5 est la probabilité théorique ; la fréquence observée se calcule avec les résultats obtenus.'],
        [r(throws, success), 'Fréquence = nombre de piles ÷ nombre de lancers.'],
      ]),
      hint: 'La fréquence, c’est ce qu’on a observé : nombre de piles ÷ nombre de lancers.',
      steps: [
        `La fréquence, c’est ce qu’on a vraiment observé : ${success} piles sur ${throws} lancers.`,
        `${success} ÷ ${throws} = **${fmt(f)}** (proche de 0,5, la probabilité théorique, mais pas forcément égale).`,
      ],
    };
  },
};
export const probabilites: Chapter = {
  id: 'm5-probabilites',
  subject: 'maths',
  grade: '5e',
  domain: 'donnees',
  title: 'Probabilités',
  skills: [probaVocab, probaCalcul, probaFrequence],
};
