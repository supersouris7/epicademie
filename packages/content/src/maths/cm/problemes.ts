import { distinct, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { bossOf, NAMES } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildProblemes({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Résolution de problèmes ———

  const additifs = S(
    id('problemes-additifs'),
    'Problèmes : parties et tout, comparaison',
    cm2
      ? 'Résoudre des problèmes additifs en une ou plusieurs étapes'
      : 'Résoudre des problèmes additifs en une étape des types « parties-tout » et « comparaison »',
    [
      'Le **tout** = somme des parties. Une partie = tout − autre partie. Attention : « de plus » ne veut pas toujours dire addition !',
    ],
    (rng, level) => {
      const who = distinct(rng, 2, () => rng.pick(NAMES));
      if (level === 1) {
        const a = rng.int(120, 900);
        const total = a + rng.int(100, 900);
        return {
          prompt: `Dans une école, il y a ${total} élèves. ${a} sont des filles. Combien y a-t-il de garçons ?`,
          answer: num(total - a),
          traps: traps(r(total - a), [[total + a, 'On cherche une partie : on enlève l’autre partie du tout.']]),
          hint: 'Tout − filles = garçons.',
          steps: [`${total} − ${a}.`, `= **${total - a}** garçons.`],
          targetSeconds: 30,
        };
      }
      const a = rng.int(20, 200);
      const diff = rng.int(5, 80);
      return {
        prompt: `${who[0]} a ${a + diff} points. C’est ${diff} points de plus que ${who[1]}. Combien de points a ${who[1]} ?`,
        answer: num(a),
        traps: traps(r(a), [
          [a + 2 * diff, `« de plus que ${who[1]} » : c’est ${who[0]} qui en a plus, donc ${who[1]} en a moins.`],
        ]),
        hint: `Qui en a le plus ? ${who[1]} en a ${diff} de moins.`,
        steps: [`${who[1]} en a ${diff} de moins que ${who[0]}.`, `${a + diff} − ${diff} = **${a}**.`],
        targetSeconds: 40,
      };
    },
  );

  const multiplicatifs = S(
    id('problemes-multiplicatifs'),
    'Problèmes : fois plus, fois moins',
    'Résoudre des problèmes de comparaison multiplicative',
    ['« 3 fois plus » → multiplication. « 3 fois moins » → division.'],
    (rng) => {
      const a = rng.int(3, 20);
      const k = rng.int(2, 6);
      const more = rng.int(0, 1) === 1;
      const who = distinct(rng, 2, () => rng.pick(NAMES));
      const base = more ? a : a * k;
      const res = more ? a * k : a;
      return {
        prompt: `${who[0]} a ${base} images. ${who[1]} en a ${k} fois ${more ? 'plus' : 'moins'}. Combien ${who[1]} a-t-il d’images ?`,
        answer: num(res),
        traps: traps(r(res), [
          [
            more ? a + k : base - k,
            `« ${k} fois ${more ? 'plus' : 'moins'} » : on ${more ? 'multiplie' : 'divise'} par ${k}.`,
          ],
        ]),
        hint: `${k} fois ${more ? 'plus' : 'moins'} : ${more ? 'multiplie' : 'divise'}.`,
        steps: [`${base} ${more ? '×' : '÷'} ${k}.`, `= **${res}**.`],
        targetSeconds: 25,
      };
    },
  );

  const etapes = S(
    id('problemes-etapes'),
    'Problèmes en plusieurs étapes',
    'Résoudre des problèmes mixtes en deux ou trois étapes',
    ['Lis bien la question, puis cherche les **étapes** : ce qu’il faut calculer d’abord pour pouvoir répondre.'],
    (rng) => {
      const packs = rng.int(3, 9);
      const per = rng.int(4, 12);
      const eaten = rng.int(2, packs * per - 1);
      return {
        prompt: `On achète ${packs} paquets de ${per} gâteaux. On en mange ${eaten}. Combien en reste-t-il ?`,
        answer: num(packs * per - eaten),
        traps: traps(r(packs * per - eaten), [
          [packs + per - eaten, `Il y a ${packs} paquets de ${per} : c’est une multiplication.`],
          [packs * per, `N’oublie pas les ${eaten} gâteaux mangés.`],
        ]),
        hint: 'Étape 1 : combien de gâteaux en tout ? Étape 2 : enlève ceux mangés.',
        steps: [
          `En tout : ${packs} × ${per} = ${packs * per}.`,
          `Reste : ${packs * per} − ${eaten} = **${packs * per - eaten}**.`,
        ],
        targetSeconds: 40,
      };
    },
  );

  const denombrement = S(
    id('denombrement'),
    'Problèmes de dénombrement',
    'Résoudre des problèmes de dénombrement',
    ['3 pantalons et 4 t-shirts : pour chaque pantalon, 4 t-shirts possibles → 3 × 4 = 12 tenues.'],
    (rng) => {
      const a = rng.int(2, 5);
      const b = rng.int(2, 6);
      return {
        prompt: `${rng.pick(NAMES)} a ${a} pantalons et ${b} t-shirts. Combien de tenues différentes (un pantalon + un t-shirt) peut-il composer ?`,
        answer: num(a * b),
        traps: traps(r(a * b), [[a + b, 'Chaque pantalon va avec chaque t-shirt : on multiplie.']]),
        hint: 'Pour chaque pantalon, combien de t-shirts possibles ?',
        steps: [`Chaque pantalon peut aller avec ${b} t-shirts.`, `${a} × ${b} = **${a * b}** tenues.`],
        targetSeconds: 30,
      };
    },
  );

  const optimisation = S(
    id('optimisation'),
    'Problèmes d’optimisation',
    'Résoudre des problèmes d’optimisation',
    ['« Le moins possible de boîtes » : on remplit les boîtes au maximum, et une de plus s’il en reste.'],
    (rng) => {
      const cap = rng.int(6, 12);
      const n = rng.int(30, 120);
      const boxes = Math.ceil(n / cap);
      return {
        prompt: `On doit ranger ${n} livres dans des cartons de ${cap} livres au maximum. Combien de cartons faut-il au minimum ?`,
        answer: num(boxes),
        traps: traps(r(boxes), [
          [Math.floor(n / cap), n % cap ? `Il reste ${n % cap} livres : il faut un carton de plus.` : 'Compte bien.'],
        ]),
        hint: `Combien de cartons pleins ? Reste-t-il des livres ?`,
        steps: [
          `${n} = ${cap} × ${Math.floor(n / cap)} + ${n % cap}.`,
          n % cap
            ? `${Math.floor(n / cap)} cartons pleins + 1 pour le reste : **${boxes}**.`
            : `**${boxes}** cartons pleins.`,
        ],
        targetSeconds: 35,
      };
    },
  );

  const problemes = C(
    id('problemes'),
    'nombres',
    'Résoudre des problèmes',
    [additifs, multiplicatifs, etapes, denombrement, optimisation],
    bossOf(
      [
        S(
          id('boss-problemes-cinema'),
          'Problème : la séance de cinéma',
          'Résoudre des problèmes mixtes en deux ou trois étapes',
          ['Additionne les prix de chaque catégorie de billets.'],
          (rng) => {
            const ad = rng.int(1, 3);
            const ch = rng.int(1, 4);
            const pa = rng.int(8, 12);
            const pc = rng.int(4, 7);
            return {
              prompt: `Au cinéma : ${pa} € la place adulte, ${pc} € la place enfant. Une famille de ${ad} adulte${ad > 1 ? 's' : ''} et ${ch} enfant${ch > 1 ? 's' : ''} paie avec un billet de 50 €. Combien lui rend-on ?`,
              answer: num(50 - ad * pa - ch * pc, '€'),
              traps: traps(r(50 - ad * pa - ch * pc), [
                [ad * pa + ch * pc, 'Ça, c’est le prix payé. On demande la monnaie rendue.'],
              ]),
              hint: 'Calcule le prix total, puis enlève-le de 50 €.',
              steps: [
                `Total : ${ad} × ${pa} + ${ch} × ${pc} = ${ad * pa + ch * pc} €.`,
                `Monnaie : 50 − ${ad * pa + ch * pc} = **${50 - ad * pa - ch * pc} €**.`,
              ],
              targetSeconds: 60,
            };
          },
        ),
        S(
          id('boss-problemes-glaces'),
          'Problème : les glaces',
          'Résoudre des problèmes de dénombrement',
          ['2 boules de parfums différents parmi 4 parfums : on liste sans compter deux fois la même paire.'],
          (rng) => {
            const n = rng.int(3, 6);
            const pairs = (n * (n - 1)) / 2;
            return {
              prompt: `Un glacier propose ${n} parfums. Combien de cornets différents à 2 boules de parfums **différents** peut-on faire (l’ordre ne compte pas) ?`,
              answer: num(pairs),
              traps: traps(r(pairs), [
                [n * (n - 1), 'Fraise-vanille et vanille-fraise, c’est le même cornet.'],
                [n * n, 'Les deux parfums doivent être différents.'],
              ]),
              hint: 'Liste les paires : chaque parfum avec ceux qui viennent après lui.',
              steps: [`${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(' + ')}.`, `= **${pairs}** cornets.`],
              targetSeconds: 60,
            };
          },
        ),
      ],
      [
        S(
          id('boss-problemes-piege'),
          'Piège : « de plus » mais soustraction',
          'Résoudre des problèmes additifs en une étape des types « parties-tout » et « comparaison »',
          ['« Lina a 5 billes de plus que Tao » : c’est Tao qui en a **moins**.'],
          (rng) => {
            const t = rng.int(10, 40);
            const k = rng.int(3, 9);
            return {
              prompt: `Lina a ${t} billes. Elle en a ${k} de plus que Tao. Combien Tao a-t-il de billes ?`,
              answer: num(t - k),
              traps: traps(r(t - k), [[t + k, 'C’est Lina qui en a plus : Tao en a moins.']]),
              hint: 'Qui en a le plus ?',
              steps: [`Lina en a ${k} de plus, donc Tao en a ${k} de moins.`, `${t} − ${k} = **${t - k}**.`],
              targetSeconds: 25,
            };
          },
        ),
      ],
    ),
  );

  return problemes;
}
