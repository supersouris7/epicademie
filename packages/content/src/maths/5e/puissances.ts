import { choice, num, objective, traps } from '../../build.ts';
import { fmt, r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Puissances ───────────────────────── */

const notation: Skill = {
  id: 'm5-puissances-notation',
  mental: true,
  title: 'Carré et cube : notation',
  lesson: {
    memo: [
      'Le petit nombre en haut dit **combien de fois on écrit le nombre** dans la multiplication : 5^3 = 5 × 5 × 5 = 125.',
      'Ce n’est pas 5 × 3 = 15 ! « Au carré » = 2 fois, « au cube » = 3 fois.',
      'À connaître : 10^3 = 10 × 10 × 10 = 1 000.',
    ],
    source: objective(
      'Découvrir la notion de puissance d’un nombre et sa notation dans le cas du carré et du cube. Connaitre le cube de 10. Savoir écrire un nombre sous la forme d’une puissance 2 ou 3',
    ),
  },
  generate(rng, level) {
    if (level === 1) {
      const a = rng.int(2, 9);
      const cube = rng.next() < 0.4;
      const product = cube ? `${a} × ${a} × ${a}` : `${a} × ${a}`;
      const correct = cube ? `${a}^3` : `${a}^2`;
      return {
        prompt: `Comment s’écrit ${product} ?`,
        ...choice(rng, correct, [
          {
            label: cube ? `3^${a}` : `2^${a}`,
            why: `On écrit le nombre répété (${a}) en bas, et le nombre de facteurs en exposant.`,
          },
          {
            label: cube ? `${a} × 3` : `${a} × 2`,
            why: `${a} × ${cube ? 3 : 2} = ${a} + ${a}${cube ? ` + ${a}` : ''} : c’est une addition répétée, pas une multiplication répétée.`,
          },
          {
            label: cube ? `${a}^2` : `${a}^3`,
            why: `Il y a ${cube ? 3 : 2} facteurs ${a} : l’exposant est ${cube ? 3 : 2}.`,
          },
        ]),
        hint: `Combien de fois le nombre ${a} est-il écrit dans la multiplication ?`,
        steps: [
          `Dans ${product}, le nombre ${a} est écrit ${cube ? '3' : '2'} fois.`,
          `On écrit ${a} en gros, et le nombre de fois (${cube ? 3 : 2}) en petit en haut.`,
          `${product} = **${correct}**`,
        ],
        targetSeconds: 10,
      };
    }
    if (level === 2) {
      const a = rng.pick([2, 3, 4, 5, 10]);
      const v = a ** 3;
      return {
        prompt: `Calcule ${a}^3.`,
        answer: num(v),
        traps: traps(r(v), [
          [a * 3, `${a}^3 = ${a} × ${a} × ${a}, pas ${a} × 3.`],
          [a * a, `${a}^2 = ${a * a} ; le cube a un facteur ${a} de plus.`],
        ]),
        hint: `${a}^3, c’est ${a} écrit 3 fois dans une multiplication.`,
        steps: [
          `${a}^3, c’est ${a} × ${a} × ${a} (et surtout pas ${a} × 3).`,
          `On calcule deux par deux : ${a} × ${a} = ${a * a}, puis ${a * a} × ${a} = ${v}.`,
          `${a}^3 = **${v}**`,
        ],
        targetSeconds: 12,
      };
    }
    const forms: [number, string, string][] = [
      [64, '8^2', '4^3'],
      [8, '', '2^3'],
      [27, '', '3^3'],
      [125, '', '5^3'],
      [1000, '', '10^3'],
      [49, '7^2', ''],
      [81, '9^2', ''],
      [144, '12^2', ''],
    ];
    const [n, sq, cu] = rng.pick(forms);
    const correct = cu || sq;
    const exp = cu ? 3 : 2;
    const base = Number(correct.split('^')[0]);
    return {
      prompt: `Quelle écriture est égale à ${fmt(n)} ?`,
      ...choice(
        rng,
        correct,
        [
          ...(n % 2 === 0
            ? [
                {
                  label: `${n / 2}^2`,
                  why: `${n / 2}^2 = ${n / 2} × ${n / 2} = ${fmt((n / 2) ** 2)}, pas ${fmt(n)} (le carré n’est pas le double).`,
                },
              ]
            : []),
          ...(n % 3 === 0
            ? [{ label: `${n / 3}^3`, why: `${n / 3}^3 = ${fmt((n / 3) ** 3)} : le cube n’est pas le triple.` }]
            : []),
          {
            label: `${Math.round(Math.sqrt(n)) + 1}^2`,
            why: `${Math.round(Math.sqrt(n)) + 1}^2 = ${fmt((Math.round(Math.sqrt(n)) + 1) ** 2)}, pas ${fmt(n)}.`,
          },
          { label: `${base + 1}^${exp}`, why: `${base + 1}^${exp} = ${fmt((base + 1) ** exp)}, pas ${fmt(n)}.` },
        ].filter((o) => o.label !== correct && o.label !== sq && o.label !== cu),
      ),
      hint: 'Calcule chaque proposition : 4^3 = 4 × 4 × 4, etc.',
      steps: [
        `Pour chaque proposition, on calcule la vraie multiplication (pas « nombre × exposant » !).`,
        cu
          ? `${cu} = ${base} × ${base} × ${base} = ${base * base} × ${base} = ${fmt(n)}. C’est celle-là !`
          : `${sq} = ${base} × ${base} = ${fmt(n)}. C’est celle-là !`,
        `La bonne écriture est **${correct}**.`,
      ],
    };
  },
};

const carres: Skill = {
  id: 'm5-carres',
  mental: true,
  title: 'Carrés de 0 à 12',
  lesson: {
    memo: [
      'Le carré d’un nombre, c’est ce nombre multiplié **par lui-même** : 7^2 = 7 × 7 = 49.',
      'Imagine un carré de 7 cases sur 7 cases : il contient 49 cases.',
      'À connaître : 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.',
    ],
    source: objective('Connaitre les carrés des entiers de 0 à 12'),
  },
  generate(rng, level) {
    const a = rng.int(level === 1 ? 2 : 6, level === 1 ? 9 : 12);
    if (level === 3) {
      return {
        prompt: `Quel nombre entier positif a pour carré ${a * a} ?`,
        answer: num(a),
        traps: traps(r(a), [
          [
            r(a * a, 2),
            `Le carré n’est pas le double : ${a * a} ÷ 2 ne convient pas, on cherche n tel que n × n = ${a * a}.`,
          ],
        ]),
        hint: `Cherche un nombre qui, multiplié par lui-même, donne ${a * a}.`,
        steps: [
          `On cherche un nombre qui, multiplié par lui-même, donne ${a * a}.`,
          `On essaie : ${a - 1} × ${a - 1} = ${(a - 1) ** 2}, trop petit. ${a} × ${a} = ${a * a}, trouvé !`,
          `C’est **${a}**.`,
        ],
        targetSeconds: 10,
      };
    }
    return {
      prompt: `Calcule ${a}^2.`,
      answer: num(a * a),
      traps: traps(r(a * a), [[a * 2, `${a}^2 = ${a} × ${a}, pas ${a} × 2.`]]),
      hint: `${a}^2, c’est ${a} multiplié par lui-même.`,
      steps: [`${a}^2, c’est ${a} multiplié par lui-même (pas par 2 !).`, `${a}^2 = ${a} × ${a} = **${a * a}**`],
      targetSeconds: 6,
    };
  },
};

const expressionsPuissances: Skill = {
  id: 'm5-puissances-expressions',
  title: 'Calculs avec des puissances',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Le petit exposant colle au nombre **juste à sa gauche**, et se calcule en premier (après les parenthèses).',
      '2 × 5^2 : on calcule d’abord 5^2 = 25, puis 2 × 25 = 50.',
      'Avec une lettre, on remplace : pour x = 3, x^2 + 1 = 3 × 3 + 1 = 10.',
    ],
    source: objective(
      'Calculer la valeur numérique d’expressions contenant des puissances simples, additions, soustractions et produits. Calculer la valeur d’une expression littérale contenant une puissance simple',
    ),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(2, 6);
    if (level === 1) {
      const v = a + b * b;
      return {
        prompt: `Calcule ${a} + ${b}^2.`,
        answer: num(v),
        traps: traps(r(v), [
          [(a + b) ** 2, `La puissance porte seulement sur ${b} : on calcule ${b}^2 d’abord.`],
          [a + b * 2, `${b}^2 = ${b} × ${b}, pas ${b} × 2.`],
        ]),
        hint: `Le carré ne concerne que ${b}, et il se calcule en premier.`,
        steps: [
          `L’exposant ^2 colle seulement au ${b}, et il passe en premier.`,
          `${b}^2 = ${b} × ${b} = ${b * b}. Le calcul devient ${a} + ${b * b}.`,
          `${a} + ${b * b} = **${v}**`,
        ],
      };
    }
    if (level === 2) {
      const v = a * b * b;
      return {
        prompt: `Calcule ${a} × ${b}^2.`,
        answer: num(v),
        traps: traps(r(v), [
          [(a * b) ** 2, `La puissance porte seulement sur ${b}, pas sur ${a} × ${b}.`],
          [a * b * 2, `${b}^2 = ${b * b}, pas ${b * 2}.`],
        ]),
        hint: `Le carré ne concerne que ${b}, et il se calcule avant la multiplication.`,
        steps: [
          `L’exposant ^2 colle seulement au ${b}, et il passe avant la multiplication.`,
          `${b}^2 = ${b} × ${b} = ${b * b}. Le calcul devient ${a} × ${b * b}.`,
          `${a} × ${b * b} = **${v}**`,
        ],
      };
    }
    const x = rng.int(2, 6);
    const k = rng.int(1, 9);
    const v = x * x + k;
    return {
      prompt: `Pour x = ${x}, calcule x^2 + ${k}.`,
      answer: num(v),
      traps: traps(r(v), [
        [2 * x + k, `x^2 = x × x = ${x} × ${x}, pas 2 × ${x}.`],
        [(x + k) ** 2, 'La puissance porte seulement sur x.'],
      ]),
      hint: `Remplace x par ${x}, puis calcule le carré en premier.`,
      steps: [
        `On remplace x par ${x} : x^2 + ${k} devient ${x}^2 + ${k}.`,
        `Le carré d’abord : ${x}^2 = ${x} × ${x} = ${x * x}.`,
        `${x * x} + ${k} = **${v}**`,
      ],
    };
  },
};

export const puissances: Chapter = {
  id: 'm5-puissances',
  subject: 'maths',
  grade: '5e',
  domain: 'nombres',
  title: 'Puissances',
  skills: [notation, carres, expressionsPuissances],
};
