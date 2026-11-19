import { choice, num, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Statistiques ———

const effectifsCumules = S(
  'm3-effectifs-cumules',
  'Effectifs cumulés croissants',
  'Calculer des effectifs cumulés croissants',
  [
    'L’effectif cumulé d’une valeur = nombre de données **inférieures ou égales** à cette valeur : on additionne au fur et à mesure.',
  ],
  (rng) => {
    const vals = [0, 1, 2, 3, 4];
    const eff = vals.map(() => rng.int(1, 9));
    const k = rng.int(1, 4);
    const cum = eff.slice(0, k + 1).reduce((a, b) => a + b, 0);
    return {
      prompt: `Nombre de frères et sœurs des élèves. Quel est l’effectif cumulé croissant de la valeur ${k} ?`,
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Frères et sœurs', ...vals.map(String)],
          ['Effectif', ...eff.map(String)],
        ],
      },
      answer: num(cum),
      traps: traps(r(cum), [[eff[k] ?? 0, 'L’effectif cumulé additionne aussi les valeurs avant.']]),
      hint: `Additionne les effectifs des valeurs de 0 à ${k}.`,
      steps: [`${eff.slice(0, k + 1).join(' + ')}.`, `= **${cum}**.`],
      targetSeconds: 30,
    };
  },
);

const quartiles = S(
  'm3-quartiles',
  'Quartiles et médiane',
  'Donner les quartiles et la médiane d’une série donnée sous forme de tableau d’effectifs ou de diagramme en barres',
  [
    'Q1 : la plus petite valeur telle qu’**au moins 25 %** des données soient inférieures ou égales. Q3 : pareil avec **75 %**.',
    'Avec N données rangées : Q1 est à la position N ÷ 4 (arrondie au-dessus).',
  ],
  (rng, level) => {
    const n = rng.pick([8, 11, 12, 15, 20]);
    const vals = Array.from({ length: n }, () => rng.int(1, 20)).sort((a, b) => a - b);
    const which = level === 1 ? 'Q1' : level === 2 ? 'Q3' : rng.pick(['Q1', 'Q3']);
    const pos = Math.ceil((which === 'Q1' ? n : 3 * n) / 4);
    const v = vals[pos - 1] ?? 0;
    return {
      prompt: `Série rangée (${n} valeurs) : ${vals.join(' ; ')}. Quel est le ${which === 'Q1' ? 'premier' : 'troisième'} quartile ?`,
      answer: num(v),
      traps: traps(r(v), [[vals[Math.floor(n / 2)] ?? 0, 'Ça, c’est autour de la médiane.']]),
      hint: `Position : ${which === 'Q1' ? `${n} ÷ 4` : `3 × ${n} ÷ 4`}, arrondi à l’entier au-dessus.`,
      steps: [
        `${which === 'Q1' ? `${n} ÷ 4` : `3 × ${n} ÷ 4`} = ${fmt(r(which === 'Q1' ? n : 3 * n, 4))} → ${pos}e valeur.`,
        `${which} = **${v}**.`,
      ],
      targetSeconds: 50,
    };
  },
);

const interpreter = S(
  'm3-interpreter-stats',
  'Comprendre une boîte à moustaches',
  'Construire et utiliser des boites à moustache pour représenter les valeurs de position d’une série statistique',
  [
    'Boîte à moustaches : min, Q1, médiane, Q3, max. La moitié des valeurs est entre Q1 et Q3 ; un quart sous Q1, un quart au-dessus de Q3.',
  ],
  (rng) => {
    const q1 = rng.int(5, 9);
    const med = q1 + rng.int(1, 3);
    const q3 = med + rng.int(1, 4);
    const q = rng.pick([
      { p: `Q1 = ${q1}. Quel pourcentage des valeurs est inférieur ou égal à ${q1} (au moins) ?`, a: 25, w: 50 },
      {
        p: `La médiane vaut ${med}. Quel pourcentage des valeurs est inférieur ou égal à ${med} (au moins) ?`,
        a: 50,
        w: 25,
      },
      { p: `Q3 = ${q3}. Quel pourcentage des valeurs est inférieur ou égal à ${q3} (au moins) ?`, a: 75, w: 25 },
    ]);
    return {
      prompt: q.p,
      answer: num(q.a, '%'),
      traps: traps(r(q.a), [[q.w, 'Q1 : 25 % ; médiane : 50 % ; Q3 : 75 %.']]),
      hint: 'Q1 → 25 %, médiane → 50 %, Q3 → 75 %.',
      steps: ['Les quartiles coupent la série en 4 parts.', `Réponse : **${q.a} %**.`],
      targetSeconds: 20,
    };
  },
);

export const statistiques = C(
  'm3-statistiques',
  'donnees',
  'Statistiques',
  [effectifsCumules, quartiles, interpreter],
  bossOf(
    [
      S(
        'm3-boss-stats-concours',
        'Problème : la sélection',
        'Comprendre et interpréter des données statistiques',
        ['« Le quart des meilleurs » : ce sont les valeurs au-dessus de Q3.'],
        (rng) => {
          const q3 = rng.int(13, 16);
          const note = q3 + rng.pick([-2, -1, 1, 2]);
          const ok = note >= q3;
          return {
            prompt: `Au concours, Q3 = ${q3}. Le quart des meilleurs (notes ≥ Q3) est sélectionné. Avec ${note}, Jade est-elle sûre d’être sélectionnée ?`,
            ...choice(
              rng,
              ok ? 'Oui' : 'Non',
              [{ label: ok ? 'Non' : 'Oui', why: `Compare ${note} à Q3 = ${q3}.` }],
              true,
            ),
            hint: 'Compare la note à Q3.',
            steps: [`${note} ${ok ? '≥' : '<'} ${q3}.`, `**${ok ? 'Oui' : 'Non'}**.`],
            targetSeconds: 25,
          };
        },
      ),
      S(
        'm3-boss-stats-temperature',
        'Problème : deux villes',
        'Comprendre et interpréter des données statistiques',
        ['L’écart Q3 − Q1 (écart interquartile) mesure la dispersion de la moitié centrale des valeurs.'],
        (rng) => {
          const a1 = rng.int(8, 12);
          const a3 = a1 + rng.int(2, 4);
          const b1 = rng.int(5, 9);
          const b3 = b1 + rng.int(8, 12);
          return {
            prompt: `Ville A : Q1 = ${a1} °C, Q3 = ${a3} °C. Ville B : Q1 = ${b1} °C, Q3 = ${b3} °C. Quelle ville a des températures les plus régulières ?`,
            ...choice(
              rng,
              'La ville A',
              [{ label: 'La ville B', why: `Q3 − Q1 vaut ${b3 - b1} pour B contre ${a3 - a1} pour A.` }],
              true,
            ),
            hint: 'Compare les écarts Q3 − Q1.',
            steps: [
              `A : ${a3} − ${a1} = ${a3 - a1}. B : ${b3} − ${b1} = ${b3 - b1}.`,
              'Le plus petit écart : **la ville A**.',
            ],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm3-boss-stats-piege',
        'Piège : la médiane et la moyenne',
        'Comprendre et interpréter des données statistiques',
        ['La médiane n’est pas forcément proche de la moyenne : une valeur extrême tire la moyenne.'],
        (rng) => {
          const base = rng.int(10, 14);
          const vals = [base, base, base + 1, base + 1, base + 40];
          const mean = r(
            vals.reduce((a, b) => a + b, 0),
            5,
          );
          return {
            prompt: `Série : ${vals.join(' ; ')}. Quelle est la médiane ?`,
            answer: num(base + 1),
            traps: traps(r(base + 1), [[mean, 'Ça, c’est la moyenne, tirée vers le haut par la valeur extrême.']]),
            hint: 'La valeur du milieu, une fois rangées.',
            steps: [
              'Les valeurs sont déjà rangées : la 3e est au milieu.',
              `Médiane : **${base + 1}** (la moyenne vaut ${fmt(mean)}).`,
            ],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
