import { num, objective, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Block, Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Pensée informatique ───────────────────────── */

const blocsValeur: Skill = {
  id: 'm5-blocs-valeur',
  title: 'Prévoir le résultat d’un programme',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Joue l’ordinateur : lis les blocs **un par un, de haut en bas**, et note au brouillon la valeur de chaque variable.',
      '« mettre a à … » **remplace** la valeur. « ajouter 2 à a » **augmente** a de 2.',
    ],
    source: objective(
      'Prévoir la valeur d’une expression informatique avant son exécution. Identifier les entrées et sorties d’un programme',
    ),
  },
  generate(rng, level) {
    const input = rng.int(2, 9);
    const m = rng.int(2, 5);
    const k = rng.int(1, 9);
    const program: Block[] = [
      { op: 'ask', text: 'Choisis un nombre', answer: input },
      { op: 'set', variable: 'a', expr: `réponse × ${m}` },
      { op: 'change', variable: 'a', by: String(k) },
    ];
    let a = input * m + k;
    const s = rng.int(1, 5);
    if (level >= 2) {
      program.push({ op: 'set', variable: 'b', expr: `a − ${s}` });
      program.push({ op: 'say', expr: 'b' });
      a = a - s;
    } else {
      program.push({ op: 'say', expr: 'a' });
    }
    if (level === 3) {
      program.splice(program.length - 1, 0, { op: 'set', variable: 'b', expr: 'b × 2' });
      a *= 2;
    }
    return {
      prompt: `On répond ${input} à la question. Que dit le lutin à la fin ?`,
      figure: { kind: 'blocks', program },
      answer: num(a),
      traps: traps(r(a), [
        [input * m, `N’oublie pas le bloc « ajouter ${k} à a ».`],
        [input + m + k, `« réponse × ${m} » est une multiplication.`],
      ]),
      hint: 'Fais comme l’ordinateur : lis les blocs un par un et note la valeur de a (et de b) après chacun.',
      steps: [
        `On joue l’ordinateur, bloc par bloc. La réponse vaut ${input}.`,
        `a = ${input} × ${m} = ${input * m}, puis on ajoute ${k} : a = ${input * m + k}.`,
        ...(level >= 2
          ? [
              `b = ${input * m + k} − ${s} = ${input * m + k - s}${level === 3 ? `, puis b = ${input * m + k - s} × 2 = ${(input * m + k - s) * 2}` : ''}.`,
            ]
          : []),
        `Le lutin dit **${a}**.`,
      ],
      targetSeconds: 40,
    };
  },
};

const blocsBoucle: Skill = {
  id: 'm5-blocs-boucle',
  title: 'Boucle « répéter »',
  advice: 'brouillon',
  lesson: {
    memo: [
      '« répéter 4 fois » : on fait ce qu’il y a dedans **4 fois de suite**, comme 4 tours de manège.',
      'Note x au brouillon après chaque tour : x ← 2, puis + 3 à chaque tour : 5, 8, 11, 14.',
    ],
    source: objective(
      'Effectuer une boucle inconditionnelle simple permettant de répéter une séquence linéaire d’instructions un nombre précis de fois',
    ),
  },
  generate(rng, level) {
    const start = rng.int(0, 10);
    const n = rng.int(2, level === 1 ? 4 : 6);
    if (level === 3) {
      const m = 2;
      const begin = rng.int(1, 3);
      const v = begin * m ** n;
      return {
        prompt: 'Que dit le lutin à la fin ?',
        figure: {
          kind: 'blocks',
          program: [
            { op: 'set', variable: 'x', expr: String(begin) },
            { op: 'repeat', times: n, body: [{ op: 'set', variable: 'x', expr: 'x × 2' }] },
            { op: 'say', expr: 'x' },
          ],
        },
        answer: num(v),
        traps: traps(r(v), [
          [begin * 2 * n, `x est **doublé** à chaque tour (× 2 répété ${n} fois), on n’ajoute pas.`],
        ]),
        hint: 'Note x après chaque tour de boucle : à chaque tour, x est doublé.',
        steps: [
          `x commence à ${begin}. À chaque tour, x est multiplié par 2 (doublé), et il y a ${n} tours.`,
          `Tour par tour : ${Array.from({ length: n + 1 }, (_, i) => begin * 2 ** i).join(' → ')}.`,
          `Le lutin dit **${v}**.`,
        ],
      };
    }
    const k = rng.int(2, 9);
    const v = start + n * k;
    return {
      prompt: 'Que dit le lutin à la fin ?',
      figure: {
        kind: 'blocks',
        program: [
          { op: 'set', variable: 'x', expr: String(start) },
          { op: 'repeat', times: n, body: [{ op: 'change', variable: 'x', by: String(k) }] },
          { op: 'say', expr: 'x' },
        ],
      },
      answer: num(v),
      traps: traps(r(v), [
        [start + k, `Le bloc est répété ${n} fois, pas une seule.`],
        [n * k, `x commence à ${start}.`],
      ]),
      hint: `x commence à ${start}. Combien ajoute-t-on à chaque tour, et combien de tours ?`,
      steps: [
        `x commence à ${start}. À chaque tour, on ajoute ${k}, et il y a ${n} tours.`,
        `Tour par tour : ${Array.from({ length: n + 1 }, (_, i) => start + i * k).join(' → ')}.`,
        `Le lutin dit **${v}**.`,
      ],
      targetSeconds: 30,
    };
  },
};
export const algorithmique: Chapter = {
  id: 'm5-algorithmique',
  subject: 'maths',
  grade: '5e',
  domain: 'informatique',
  title: 'Programmation',
  skills: [blocsValeur, blocsBoucle],
};
