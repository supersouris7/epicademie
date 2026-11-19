import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildAlgebre({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Algèbre ———

  const egaliteTrous = S(
    id('egalite-trous'),
    'Égalités à trous',
    'Trouver le nombre manquant dans une égalité à trous',
    ['Le signe = veut dire « vaut la même chose ». 178 − … = 6 × 8 : calcule 6 × 8 = 48, puis 178 − 48 = 130.'],
    (rng, level) => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      if (level === 3) {
        const x = rng.int(10, 90);
        const n = a * b + x;
        return {
          prompt: `Complète : ${n} − … = ${a} × ${b}`,
          answer: num(x),
          traps: traps(r(x), [[n - a * b + 2 * a * b, 'Calcule d’abord le côté droit.']]),
          hint: `Calcule ${a} × ${b}, puis cherche ce qu’il faut enlever à ${n}.`,
          steps: [`${a} × ${b} = ${a * b}.`, `${n} − ${a * b} = **${x}**.`],
          targetSeconds: 30,
        };
      }
      const c = rng.int(5, 50);
      return {
        prompt: `Complète : ${c} + … = ${c + a * b}`,
        answer: num(a * b),
        traps: traps(r(a * b), [[2 * c + a * b, 'On cherche ce qu’il faut **ajouter** : fais une soustraction.']]),
        hint: `Que faut-il ajouter à ${c} ? Calcule ${c + a * b} − ${c}.`,
        steps: [`${c + a * b} − ${c}.`, `= **${a * b}**.`],
        targetSeconds: 20,
      };
    },
    { mental: true },
  );

  const programmeCalcul = S(
    id('programme-calcul'),
    'Programme de calcul',
    cm2 ? 'Exécuter ou produire un programme de calcul' : 'Exécuter un programme de calcul',
    ['On fait les étapes **dans l’ordre** : choisir 5, ajouter 2 (7), multiplier par 4 (28).'],
    (rng, level) => {
      const x = rng.int(1, 15);
      const a = rng.int(1, 9);
      const b = rng.int(2, 6);
      const c = cm2 && level === 3 ? rng.int(1, 9) : 0;
      const res = (x + a) * b - c;
      return {
        prompt: `Programme : choisir ${x}, ajouter ${a}, multiplier le résultat par ${b}${c ? `, retirer ${c}` : ''}. Quel nombre obtient-on ?`,
        answer: num(res),
        traps: traps(r(res), [[x + a * b - c, `On multiplie **le résultat** (${x} + ${a}) par ${b}.`]]),
        hint: 'Fais les étapes une par une.',
        steps: [
          `${x} + ${a} = ${x + a} ; × ${b} = ${(x + a) * b}${c ? ` ; − ${c} = ${res}` : ''}.`,
          `On obtient **${res}**.`,
        ],
        targetSeconds: 30,
      };
    },
    { mental: true },
  );

  const suites = S(
    id('suites'),
    'Suites de nombres',
    'Identifier et formuler une règle de calcul pour poursuivre une suite de nombres',
    [
      'Cherche ce qui se passe d’un nombre au suivant : + 5 ? − 2 ? × 2 ? Parfois la règle alterne (+ 5, − 2, + 5, − 2…).',
    ],
    (rng, level) => {
      if (level === 3) {
        const up = rng.int(3, 7);
        const down = rng.int(1, up - 1);
        const s = [rng.int(10, 80)];
        for (let i = 1; i < 6; i++) s.push((s[i - 1] ?? 0) + (i % 2 ? up : -down));
        const next = (s[5] ?? 0) + up;
        return {
          prompt: `Trouve le nombre suivant : ${s.join(' ; ')} ; …`,
          answer: num(next),
          traps: traps(r(next), [[(s[5] ?? 0) - down, `La règle alterne : + ${up}, puis − ${down}.`]]),
          hint: 'Regarde les écarts : ils alternent.',
          steps: [`La règle alterne : + ${up}, − ${down}, + ${up}…`, `${s[5]} + ${up} = **${next}**.`],
          targetSeconds: 35,
        };
      }
      const double = level === 2 && rng.int(0, 1) === 1;
      const start = rng.int(1, 9);
      const step = rng.int(3, 12);
      const s = Array.from({ length: 5 }, (_, i) => (double ? start * 2 ** i : start + step * i));
      const next = double ? start * 32 : start + step * 5;
      return {
        prompt: `Trouve le nombre suivant : ${s.join(' ; ')} ; …`,
        answer: num(next),
        traps: traps(r(next), [
          [
            double ? (s[4] ?? 0) + (s[4] ?? 0) - (s[3] ?? 0) : next + step,
            double ? 'Chaque nombre est le double du précédent.' : `On ajoute ${step} à chaque fois.`,
          ],
        ]),
        hint: 'Comment passe-t-on d’un nombre au suivant ?',
        steps: [
          double ? 'Chaque nombre est le double du précédent.' : `On ajoute ${step} à chaque fois.`,
          `Le suivant est **${next}**.`,
        ],
        targetSeconds: 25,
      };
    },
    { mental: true },
  );

  const motifs = S(
    id('motifs'),
    'Suites de motifs',
    cm2
      ? 'Trouver le nombre d’éléments pour une étape donnée dans une suite de motifs évolutive'
      : 'Identifier des régularités et poursuivre une suite de motifs évolutive',
    ['Regarde combien d’éléments **s’ajoutent** à chaque étape.'],
    (rng, level) => {
      const step = rng.int(2, 4);
      const start = rng.int(1, 3);
      const count = (k: number) => start + step * (k - 1);
      const target = cm2 && level === 3 ? rng.int(10, 20) : 4;
      return {
        prompt: `Étape 1 : ${count(1)} carreaux ; étape 2 : ${count(2)} ; étape 3 : ${count(3)}. Combien de carreaux à l’étape ${target} ?`,
        figure: {
          kind: 'pattern',
          steps: [1, 2, 3].map((k) =>
            Array.from({ length: count(k) }, (_, i) => [i % 6, Math.floor(i / 6)] as [number, number]),
          ),
        },
        answer: num(count(target)),
        traps: traps(r(count(target)), [[step * target, `On part de ${start}, pas de 0.`]]),
        hint: `On ajoute ${step} carreaux à chaque étape.`,
        steps: [
          `De l’étape 1 à l’étape ${target} : ${target - 1} ajouts de ${step}.`,
          `${count(1)} + ${target - 1} × ${step} = **${count(target)}**.`,
        ],
        targetSeconds: 30,
      };
    },
  );

  const algebre = C(
    id('algebre'),
    'nombres',
    'Égalités, suites et programmes',
    [egaliteTrous, programmeCalcul, suites, motifs],
    bossOf(
      [
        S(
          id('boss-algebre-ciseaux'),
          'Problème : ciseaux et stylos',
          'Résoudre des problèmes algébriques',
          ['2 ciseaux et 3 stylos coûtent 20 € ; si un stylo coûte 2 €, les ciseaux coûtent (20 − 6) ÷ 2 = 7 €.'],
          (rng) => {
            const st = rng.int(1, 4);
            const ci = rng.int(3, 9);
            const total = 2 * ci + 3 * st;
            return {
              prompt: `2 paires de ciseaux et 3 stylos coûtent ${total} €. Un stylo coûte ${st} €. Combien coûte une paire de ciseaux ?`,
              answer: num(ci, '€'),
              traps: traps(r(ci), [[r(total - st, 2), `Il y a 3 stylos : enlève ${3 * st} €.`]]),
              hint: 'Enlève d’abord le prix des 3 stylos.',
              steps: [
                `Stylos : 3 × ${st} = ${3 * st} €. Reste ${total - 3 * st} € pour 2 ciseaux.`,
                `${total - 3 * st} ÷ 2 = **${ci} €**.`,
              ],
              targetSeconds: 50,
            };
          },
        ),
        S(
          id('boss-algebre-tshirts'),
          'Problème : la commande',
          'Exécuter un programme de calcul',
          ['Prix = nombre de t-shirts × 12 + 5 de livraison.'],
          (rng) => {
            const n = rng.int(2, 9);
            const p = rng.int(8, 15);
            const ship = rng.int(3, 8);
            return {
              prompt: `Des t-shirts coûtent ${p} € chacun, plus ${ship} € de livraison pour toute la commande. Combien paie-t-on pour ${n} t-shirts ?`,
              answer: num(n * p + ship, '€'),
              traps: traps(r(n * p + ship), [[n * (p + ship), 'La livraison se paie une seule fois.']]),
              hint: `(${n} × ${p}) + ${ship}.`,
              steps: [`${n} × ${p} = ${n * p}.`, `${n * p} + ${ship} = **${n * p + ship} €**.`],
              targetSeconds: 40,
            };
          },
        ),
      ],
      [
        S(
          id('boss-algebre-piege'),
          'Piège : le signe égal',
          'Trouver le nombre manquant dans une égalité à trous',
          ['5 + 3 = … + 6 : il faut 2 (et pas 8), car les deux côtés doivent valoir 8.'],
          (rng) => {
            const a = rng.int(4, 12);
            const b = rng.int(2, 9);
            const c = rng.int(1, a + b - 1);
            return {
              prompt: `Complète : ${a} + ${b} = … + ${c}`,
              answer: num(a + b - c),
              traps: traps(r(a + b - c), [
                [a + b, 'Le côté droit doit valoir la même chose que le côté gauche, avec le + ' + String(c) + '.'],
              ]),
              hint: 'Les deux côtés valent la même chose.',
              steps: [`${a} + ${b} = ${a + b}.`, `… + ${c} = ${a + b}, donc **${a + b - c}**.`],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  return algebre;
}
