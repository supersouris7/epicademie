import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Block } from '../../types.ts';
import { bossOf, NAMES, sgn } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Algorithmique ———

const conditionnelle = S(
  'm4-conditionnelle',
  'Instruction conditionnelle',
  'Écrire des instructions conditionnelles',
  [
    '« si condition alors … sinon … » : on teste la condition ; si elle est vraie on fait le premier bloc, sinon le second.',
  ],
  (rng) => {
    const limit = rng.int(10, 20);
    const n = rng.int(1, 30);
    const program: Block[] = [
      { op: 'ask', text: 'Quel nombre ?', answer: n },
      {
        op: 'if',
        cond: `réponse > ${limit}`,
        then: [{ op: 'say', expr: 'réponse − 10' }],
        else: [{ op: 'say', expr: 'réponse × 2' }],
      },
    ];
    const res = n > limit ? n - 10 : n * 2;
    return {
      prompt: `On répond ${n}. Que dit le lutin ?`,
      figure: { kind: 'blocks', program },
      answer: num(res),
      traps: traps(r(res), [
        [n > limit ? n * 2 : n - 10, `${n} > ${limit} est ${n > limit ? 'vrai' : 'faux'} : regarde le bon bloc.`],
      ]),
      hint: `Teste d’abord : ${n} > ${limit} ?`,
      steps: [
        `${n} > ${limit} est ${n > limit ? 'vrai' : 'faux'} : on exécute le bloc « ${n > limit ? 'alors' : 'sinon'} ».`,
        `Le lutin dit **${sgn(res)}**.`,
      ],
      targetSeconds: 30,
    };
  },
);

const variable = S(
  'm4-variable',
  'Suivre une variable',
  'Manipuler une variable',
  [
    'Une **variable** est une boîte qui contient un nombre. « mettre x à 5 » remplace le contenu ; « ajouter 2 à x » l’augmente.',
  ],
  (rng) => {
    const a = rng.int(1, 9);
    const b = rng.int(2, 5);
    const c = rng.int(1, 9);
    const program: Block[] = [
      { op: 'set', variable: 'x', expr: String(a) },
      { op: 'set', variable: 'x', expr: `x × ${b}` },
      { op: 'change', variable: 'x', by: String(c) },
      { op: 'say', expr: 'x' },
    ];
    const res = a * b + c;
    return {
      prompt: 'Que dit le lutin ?',
      figure: { kind: 'blocks', program },
      answer: num(res),
      traps: traps(r(res), [
        [a + c, `La 2e ligne change x : x devient ${a} × ${b}.`],
        [(a + c) * b, 'Suis l’ordre des blocs.'],
      ]),
      hint: 'Suis la valeur de x ligne par ligne.',
      steps: [`x = ${a}, puis x = ${a} × ${b} = ${a * b}.`, `Puis x = ${a * b} + ${c} = **${res}**.`],
      targetSeconds: 30,
    };
  },
);

const modifierProgramme = S(
  'm4-modifier-programme',
  'Modifier un programme',
  'Modifier un programme donné pour changer son comportement',
  [
    'Pour changer le résultat d’une boucle, on peut changer le **nombre de répétitions** ou ce qu’on ajoute à chaque tour.',
  ],
  (rng) => {
    const step = rng.int(2, 6);
    const target = step * rng.int(4, 12);
    const times = target / step;
    return {
      prompt: `Le programme part de 0 et répète « ajouter ${step} ». Combien de répétitions faut-il pour finir à ${target} ?`,
      figure: {
        kind: 'blocks',
        program: [
          { op: 'set', variable: 'total', expr: '0' },
          { op: 'repeat', times: 0, body: [{ op: 'change', variable: 'total', by: String(step) }] },
          { op: 'say', expr: 'total' },
        ],
      },
      answer: num(times),
      traps: traps(r(times), [[target, `Chaque tour ajoute ${step} : combien de tours pour ${target} ?`]]),
      hint: `Combien de fois ${step} dans ${target} ?`,
      steps: [`On ajoute ${step} à chaque tour.`, `${target} ÷ ${step} = **${times}** répétitions.`],
      targetSeconds: 25,
    };
  },
);

export const algorithmique = C(
  'm4-algorithmique',
  'informatique',
  'Algorithmique',
  [conditionnelle, variable, modifierProgramme],
  bossOf(
    [
      S(
        'm4-boss-algo-ticket',
        'Problème : le prix du billet',
        'Représenter des conditions simples',
        ['Un programme de tarif : si l’âge est inférieur à 12, demi-tarif, sinon plein tarif.'],
        (rng) => {
          const full = rng.int(8, 16) * 2;
          const age = rng.int(5, 40);
          const program: Block[] = [
            { op: 'ask', text: 'Ton âge ?', answer: age },
            {
              op: 'if',
              cond: 'réponse < 12',
              then: [{ op: 'say', expr: `${full} ÷ 2` }],
              else: [{ op: 'say', expr: String(full) }],
            },
          ];
          const res = age < 12 ? full / 2 : full;
          return {
            prompt: `${rng.pick(NAMES)} a ${age} ans. Combien paie-t-il ?`,
            figure: { kind: 'blocks', program },
            answer: num(res, '€'),
            traps: traps(r(res), [[age < 12 ? full : full / 2, `${age} < 12 est ${age < 12 ? 'vrai' : 'faux'}.`]]),
            hint: `Teste ${age} < 12.`,
            steps: [`${age} < 12 est ${age < 12 ? 'vrai' : 'faux'}.`, `Il paie **${res} €**.`],
            targetSeconds: 30,
          };
        },
      ),
      S(
        'm4-boss-algo-compteur',
        'Problème : le compteur de points',
        'Manipuler une variable',
        ['Dans une boucle, la variable change à chaque tour : suis-la tour par tour.'],
        (rng) => {
          const times = rng.int(3, 6);
          const start = rng.int(1, 3);
          let v = start;
          for (let i = 0; i < times; i++) v *= 2;
          return {
            prompt: 'Que dit le lutin ?',
            figure: {
              kind: 'blocks',
              program: [
                { op: 'set', variable: 'points', expr: String(start) },
                { op: 'repeat', times, body: [{ op: 'set', variable: 'points', expr: 'points × 2' }] },
                { op: 'say', expr: 'points' },
              ],
            },
            answer: num(v),
            traps: traps(r(v), [[start * 2 * times, `On double à chaque tour : ce n’est pas × 2 × ${times}.`]]),
            hint: 'Double la valeur à chaque tour.',
            steps: [`${start} doublé ${times} fois : ${start} × 2^${times}.`, `= **${v}**.`],
            targetSeconds: 35,
          };
        },
      ),
    ],
    [
      S(
        'm4-boss-algo-piege',
        'Piège : strictement ou pas ?',
        'Représenter des conditions simples',
        ['« réponse > 10 » est **faux** si la réponse vaut 10 : il faudrait « ≥ ».'],
        (rng) => {
          const limit = rng.int(10, 20);
          const program: Block[] = [
            { op: 'ask', text: 'Score ?', answer: limit },
            {
              op: 'if',
              cond: `réponse > ${limit}`,
              then: [{ op: 'say', expr: '1' }],
              else: [{ op: 'say', expr: '0' }],
            },
          ];
          return {
            prompt: `On répond ${limit}. Que dit le lutin ?`,
            figure: { kind: 'blocks', program },
            answer: num(0),
            traps: traps(r(0), [
              [1, `${limit} > ${limit} est faux : ${limit} n’est pas strictement plus grand que lui-même.`],
            ]),
            hint: `${limit} est-il **strictement** plus grand que ${limit} ?`,
            steps: [`${limit} > ${limit} est faux.`, 'On exécute « sinon » : le lutin dit **0**.'],
            targetSeconds: 25,
          };
        },
      ),
    ],
  ),
);
