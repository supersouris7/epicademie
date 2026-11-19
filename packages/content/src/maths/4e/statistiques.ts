import { choice, distinct, num, traps } from '../../build.ts';
import { fmt, isDecimal, r } from '../../rational.ts';
import { bossOf, NAMES, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Statistiques ———

const moyennePonderee = S(
  'm4-moyenne-ponderee',
  'Moyenne pondérée',
  'Calculer une moyenne pondérée dans le cas d’une série discrète de petits effectifs présentée sous forme de données brutes, d’un tableau ou d’un diagramme en barres',
  [
    'Moyenne pondérée = (valeur × effectif + …) ÷ effectif total. Avec 3 notes de 12 et 1 note de 16 : (3 × 12 + 16) ÷ 4 = 13.',
  ],
  (rng) => {
    const vals = distinct(rng, 3, () => rng.int(8, 18)).sort((a, b) => a - b);
    for (;;) {
      const eff = vals.map(() => rng.int(1, 6));
      const total = eff.reduce((a, b) => a + b, 0);
      const sum = vals.reduce((s, v, i) => s + v * (eff[i] ?? 0), 0);
      const mean = r(sum, total);
      const decimals = isDecimal(mean) ? (fmt(mean).split(',')[1]?.length ?? 0) : 99;
      if (decimals > 2) continue;
      return {
        prompt: 'Voici les notes d’un contrôle. Quelle est la moyenne de la classe ?',
        figure: {
          kind: 'table',
          header: true,
          rows: [
            ['Note', ...vals.map(String)],
            ['Effectif', ...eff.map(String)],
          ],
        },
        answer: num(mean),
        traps: [],
        hint: 'Multiplie chaque note par son effectif, additionne, puis divise par l’effectif total.',
        steps: [
          `Somme : ${vals.map((v, i) => `${v} × ${eff[i]}`).join(' + ')} = ${sum}. Effectif total : ${total}.`,
          `Moyenne : ${sum} ÷ ${total} = **${fmt(mean)}**.`,
        ],
        targetSeconds: 60,
      };
    }
  },
  { advice: 'calculatrice' },
);

const mediane = S(
  'm4-mediane',
  'Médiane d’une série',
  'Déterminer une médiane et l’interpréter dans le cas d’une série de petit effectif présentée sous forme de données brutes',
  [
    'On **range** les valeurs dans l’ordre. La médiane est au milieu : autant de valeurs en dessous qu’au-dessus.',
    'Nombre pair de valeurs : moyenne des deux du milieu.',
  ],
  (rng, level) => {
    const n = level === 1 ? 5 : level === 2 ? 7 : 6;
    const vals = Array.from({ length: n }, () => rng.int(1, 30));
    const sorted = [...vals].sort((a, b) => a - b);
    const med = n % 2 === 1 ? r(sorted[(n - 1) / 2] ?? 0) : r((sorted[n / 2 - 1] ?? 0) + (sorted[n / 2] ?? 0), 2);
    return {
      prompt: `Quelle est la médiane de cette série : ${vals.join(' ; ')} ?`,
      answer: num(med),
      traps: traps(med, [[vals[Math.floor(n / 2)] ?? 0, 'Il faut d’abord **ranger** les valeurs dans l’ordre.']]),
      hint: 'Range les valeurs dans l’ordre croissant, puis prends celle du milieu.',
      steps: [
        `Rangées : ${sorted.join(' ; ')}.`,
        n % 2 === 1
          ? `La ${(n + 1) / 2}e valeur est au milieu : **${fmt(med)}**.`
          : `Les deux du milieu : ${sorted[n / 2 - 1]} et ${sorted[n / 2]}. Médiane : **${fmt(med)}**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const etendue = S(
  'm4-etendue',
  'Étendue d’une série',
  'Calculer et interpréter l’étendue d’une série présentée sous forme de données brutes, d’un tableau, d’un diagramme en barres, d’un diagramme circulaire',
  ['Étendue = plus grande valeur − plus petite valeur. Elle mesure à quel point les valeurs sont **dispersées**.'],
  (rng) => {
    const vals = distinct(rng, 6, () => rng.int(-5, 35));
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return {
      prompt: `Températures relevées (°C) : ${vals.map(sgn).join(' ; ')}. Quelle est l’étendue ?`,
      answer: num(max - min, '°C'),
      traps: traps(r(max - min), [
        [max, 'L’étendue est un **écart** : plus grande − plus petite.'],
        [max + min, 'C’est une soustraction.'],
      ]),
      hint: 'Plus grande valeur − plus petite valeur.',
      steps: [
        `Plus grande : ${sgn(max)} ; plus petite : ${sgn(min)}.`,
        `${sgn(max)} − ${min < 0 ? `(${sgn(min)})` : min} = **${max - min} °C**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const valeurExtreme = S(
  'm4-valeur-extreme',
  'Moyenne, médiane et valeur extrême',
  'Comprendre l’évolution de la médiane et de la moyenne quand on ajoute une valeur extrême',
  ['Une valeur très grande (ou très petite) fait beaucoup bouger la **moyenne**, mais presque pas la **médiane**.'],
  (rng) => {
    const who = rng.pick(NAMES);
    return {
      prompt: `Dans une rue, 9 familles ont des salaires proches, et un milliardaire emménage. Quel indicateur change beaucoup ?`,
      ...choice(rng, 'La moyenne', [
        {
          label: 'La médiane',
          why: 'La médiane dépend du rang des valeurs : une seule valeur énorme la bouge à peine.',
        },
        { label: 'Aucun des deux', why: 'La moyenne additionne toutes les valeurs : elle grimpe beaucoup.' },
      ]),
      hint: `${who} se demande : quel indicateur utilise la **somme** de toutes les valeurs ?`,
      steps: [
        'La moyenne additionne toutes les valeurs : une valeur énorme la fait grimper.',
        'La médiane bouge à peine : c’est **la moyenne** qui change beaucoup.',
      ],
      targetSeconds: 25,
    };
  },
);

export const statistiques = C(
  'm4-statistiques',
  'donnees',
  'Statistiques',
  [moyennePonderee, mediane, etendue, valeurExtreme],
  bossOf(
    [
      S(
        'm4-boss-stats-note',
        'Problème : la note manquante',
        'Résoudre des problèmes faisant intervenir les différents indicateurs',
        ['Pour avoir 12 de moyenne sur 4 notes, il faut 4 × 12 = 48 points en tout.'],
        (rng) => {
          const target = rng.int(11, 14);
          let notes: number[] = [];
          let need = -1;
          while (need < 0 || need > 20) {
            notes = Array.from({ length: 3 }, () => rng.int(8, 17));
            need = target * 4 - notes.reduce((x, y) => x + y, 0);
          }
          return {
            prompt: `${rng.pick(NAMES)} a eu ${notes.join(', ')} aux trois premiers contrôles. Quelle note doit-il avoir au 4e pour avoir exactement ${target} de moyenne ?`,
            answer: num(need),
            traps: traps(r(need), [[target, 'Il faut compenser les autres notes : calcule le total nécessaire.']]),
            hint: `Pour ${target} de moyenne sur 4 notes, il faut ${target} × 4 points en tout.`,
            steps: [
              `Total nécessaire : ${target} × 4 = ${target * 4}. Déjà : ${notes.reduce((a, b) => a + b, 0)}.`,
              `Note manquante : ${target * 4} − ${notes.reduce((a, b) => a + b, 0)} = **${need}**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm4-boss-stats-comparer',
        'Problème : deux équipes',
        'Résoudre des problèmes de comparaison de séries statistiques',
        ['Deux séries de même moyenne peuvent être très différentes : l’étendue dit laquelle est la plus régulière.'],
        (rng) => {
          const m = rng.int(10, 14);
          const a = [m - 1, m, m + 1];
          const d = rng.int(4, 6);
          const b = [m - d, m, m + d];
          return {
            prompt: `Équipe A : scores ${a.join(', ')}. Équipe B : ${b.join(', ')}. Même moyenne. Quelle équipe est la plus régulière ?`,
            ...choice(
              rng,
              'L’équipe A',
              [{ label: 'L’équipe B', why: `Étendue de B : ${2 * d}, bien plus grande que celle de A (2).` }],
              true,
            ),
            hint: 'Compare les étendues.',
            steps: [
              `Étendue A : ${a[2]} − ${a[0]} = 2. Étendue B : ${b[2]} − ${b[0]} = ${2 * d}.`,
              'La plus petite étendue est la plus régulière : **l’équipe A**.',
            ],
            targetSeconds: 40,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-stats-piege',
        'Piège : la médiane sans ranger',
        'Déterminer une médiane et l’interpréter dans le cas d’une série de petit effectif présentée sous forme de données brutes',
        ['La médiane n’est pas la valeur écrite au milieu de la liste : il faut d’abord ranger.'],
        (rng) => {
          const vals = distinct(rng, 5, () => rng.int(1, 20));
          const sorted = [...vals].sort((a, b) => a - b);
          const med = sorted[2] ?? 0;
          if (vals[2] === med) {
            const tmp = vals[0] ?? 0;
            vals[0] = med;
            vals[2] = tmp;
          }
          return {
            prompt: `Quelle est la médiane de : ${vals.join(' ; ')} ?`,
            answer: num(med),
            traps: traps(r(med), [[vals[2] ?? 0, 'Il faut d’abord ranger les valeurs dans l’ordre.']]),
            hint: 'Range d’abord les valeurs.',
            steps: [`Rangées : ${sorted.join(' ; ')}.`, `Au milieu : **${med}**.`],
            targetSeconds: 30,
          };
        },
      ),
    ],
  ),
);
