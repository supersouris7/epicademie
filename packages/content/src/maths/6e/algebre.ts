import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Pensée algébrique ———

const egaliteTrous = S(
  'm6-egalites-trous',
  'Égalités à trous',
  'Compléter des égalités à trous multiplicatives',
  [
    'Le signe = veut dire « vaut la même chose ». Dans 7 × … = 56, cherche le nombre qui, multiplié par 7, donne 56 : 56 ÷ 7 = 8.',
    'Dans 178 − … = 6 × 8, calcule d’abord le côté connu : 6 × 8 = 48, puis 178 − 48 = 130.',
  ],
  (rng, level) => {
    if (level === 3) {
      const a = rng.int(5, 9);
      const b = rng.int(5, 9);
      const x = rng.int(20, 90);
      const n = a * b + x;
      return {
        prompt: `Complète : ${n} − … = ${a} × ${b}`,
        answer: num(x),
        traps: traps(r(x), [[n - a - b, `Le côté droit vaut ${a} × ${b} = ${a * b}, pas ${a + b}.`]]),
        hint: `Calcule d’abord ${a} × ${b}.`,
        steps: [`${a} × ${b} = ${a * b}. On cherche ${n} − … = ${a * b}.`, `${n} − ${a * b} = **${x}**.`],
        targetSeconds: 25,
      };
    }
    const a = rng.int(2, 12);
    const x = rng.int(2, 12);
    const plus = level === 1;
    return {
      prompt: plus ? `Complète : ${a} + … = ${a + x * 3}` : `Complète : ${a} × … = ${a * x}`,
      answer: num(plus ? x * 3 : x),
      traps: traps(r(plus ? x * 3 : x), [
        [plus ? a + a + x * 3 : a * a * x, 'On cherche le nombre manquant : fais l’opération inverse.'],
      ]),
      hint: plus ? 'Que faut-il ajouter ? Fais une soustraction.' : 'Fais une division.',
      steps: [
        plus ? `On fait l’opération inverse : ${a + x * 3} − ${a}.` : `On fait l’opération inverse : ${a * x} ÷ ${a}.`,
        `Le nombre manquant est **${plus ? x * 3 : x}**.`,
      ],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

const problemesAlgebriques = S(
  'm6-problemes-algebriques',
  'Problèmes algébriques (modèle en barres)',
  'Utiliser des modèles pré-algébriques pour résoudre des problèmes algébriques',
  [
    'Dessine des **barres** : 3 stylos identiques et un cahier à 4 € coûtent 10 € → les 3 barres valent 10 − 4 = 6 €, une barre vaut 2 €.',
  ],
  (rng, level) => {
    const n = rng.int(2, level === 1 ? 4 : 6);
    const unit = rng.int(2, 9);
    const extra = rng.int(1, 9);
    const total = n * unit + extra;
    const item = rng.pick(['stylos', 'gommes', 'cahiers', 'badges']);
    return {
      prompt: `${n} ${item} identiques et un sac à ${extra} € coûtent ${total} € en tout. Combien coûte un ${item.slice(0, -1)} ?`,
      answer: num(unit, '€'),
      traps: traps(r(unit), [
        [r(total, n), `Enlève d’abord le prix du sac (${extra} €).`],
        [total - extra, `${total - extra} € est le prix des ${n} ${item} ensemble.`],
      ]),
      hint: `Enlève le prix du sac, puis partage entre les ${n} ${item}.`,
      steps: [
        `Sans le sac : ${total} − ${extra} = ${total - extra} € pour ${n} ${item}.`,
        `Un ${item.slice(0, -1)} : ${total - extra} ÷ ${n} = **${unit} €**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const motifs = S(
  'm6-motifs',
  'Suites de motifs',
  'Identifier la structure d’un motif évolutif en repérant une régularité et en identifiant une structure',
  [
    'Regarde ce qui **s’ajoute** d’une étape à la suivante : si on ajoute toujours 3 carreaux, l’étape 10 a 3 × 10 + (ce qu’il y a au départ).',
  ],
  (rng, level) => {
    const step = rng.int(2, 4);
    const start = rng.int(1, 3);
    const count = (k: number) => start + step * (k - 1);
    const target = level === 1 ? 4 : level === 2 ? rng.int(6, 10) : rng.int(15, 30);
    const shapes = [1, 2, 3].map((k) =>
      Array.from({ length: count(k) }, (_, i) => [i % 6, Math.floor(i / 6)] as [number, number]),
    );
    return {
      prompt: `Étape 1 : ${count(1)} carreaux, étape 2 : ${count(2)}, étape 3 : ${count(3)}. Combien de carreaux à l’étape ${target} ?`,
      figure: { kind: 'pattern', steps: shapes },
      answer: num(count(target)),
      traps: traps(r(count(target)), [
        [
          step * target,
          `Au départ il y a ${start} carreau${start > 1 ? 'x' : ''}, et on en ajoute ${step} à chaque étape **suivante**.`,
        ],
      ]),
      hint: `On ajoute ${step} carreaux à chaque étape. Combien d’ajouts entre l’étape 1 et l’étape ${target} ?`,
      steps: [
        `De l’étape 1 à l’étape ${target}, on ajoute ${target - 1} fois ${step} carreaux.`,
        `${count(1)} + ${target - 1} × ${step} = **${count(target)}** carreaux.`,
      ],
      targetSeconds: 30,
    };
  },
);

export const algebre = C(
  'm6-algebre',
  'nombres',
  'Pensée algébrique',
  [egaliteTrous, problemesAlgebriques, motifs],
  bossOf(
    [
      S(
        'm6-boss-algebre-cinema',
        'Problème : le cinéma',
        'Utiliser des modèles pré-algébriques pour résoudre des problèmes algébriques',
        [
          '2 adultes et 3 enfants : si une place enfant coûte 2 € de moins, dessine les barres et enlève les différences.',
        ],
        (rng) => {
          const child = rng.int(4, 8);
          const diff = rng.int(2, 4);
          const adult = child + diff;
          const total = 2 * adult + 3 * child;
          return {
            prompt: `Au cinéma, une place adulte coûte ${diff} € de plus qu’une place enfant. 2 adultes et 3 enfants paient ${total} €. Combien coûte une place enfant ?`,
            answer: num(child, '€'),
            traps: traps(r(child), [
              [r(total, 5), `Les places adulte coûtent ${diff} € de plus : enlève d’abord 2 × ${diff} €.`],
              [adult, 'Ça, c’est le prix d’une place adulte.'],
            ]),
            hint: `Si les adultes payaient le prix enfant, on paierait ${2 * diff} € de moins.`,
            steps: [
              `Sans le supplément des adultes : ${total} − 2 × ${diff} = ${total - 2 * diff} € pour 5 places enfant.`,
              `Une place enfant : ${total - 2 * diff} ÷ 5 = **${child} €**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm6-boss-algebre-tables',
        'Problème : les tables de la fête',
        'Identifier la structure d’un motif évolutif en repérant une régularité et en identifiant une structure',
        ['Une table seule : 4 places. Deux tables collées : 6 places. Chaque table ajoutée apporte 2 places.'],
        (rng) => {
          const n = rng.int(5, 15);
          const seats = 2 * n + 2;
          return {
            prompt: `Une table carrée accueille 4 personnes. Quand on colle les tables en ligne, 2 tables accueillent 6 personnes, 3 tables 8 personnes. Combien de personnes avec ${n} tables ?`,
            answer: num(seats),
            traps: traps(r(seats), [[4 * n, 'En collant les tables, on perd les places entre elles.']]),
            hint: 'Chaque table ajoutée apporte 2 places.',
            steps: [
              `On part de 4 places et on ajoute 2 places pour chacune des ${n - 1} autres tables.`,
              `4 + 2 × ${n - 1} = **${seats}** personnes.`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-algebre-piege',
        'Piège : le signe égal',
        'Compléter des égalités à trous multiplicatives',
        ['Le signe = relie deux expressions égales : dans 5 + 3 = … + 6, on cherche 2 (et pas 8).'],
        (rng) => {
          const a = rng.int(4, 12);
          const b = rng.int(3, 9);
          const c = rng.int(1, a + b - 1);
          const x = a + b - c;
          return {
            prompt: `Complète : ${a} + ${b} = … + ${c}`,
            answer: num(x),
            traps: traps(r(x), [
              [a + b, `${a} + ${b} = ${a + b}, mais à droite il y a déjà « + ${c} ».`],
              [a + b + c, 'Le signe = veut dire « vaut la même chose » des deux côtés.'],
            ]),
            hint: 'Les deux côtés doivent valoir la même chose.',
            steps: [
              `À gauche : ${a} + ${b} = ${a + b}.`,
              `À droite, il faut ${a + b} : … + ${c} = ${a + b}, donc **${x}**.`,
            ],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
