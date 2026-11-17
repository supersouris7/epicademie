import { choice, num, objective, traps, trueFalse } from '../build.ts';
import { add, dec, fmt, mul, r, sub, type Rational } from '../rational.ts';
import type { Chapter, Skill } from '../types.ts';

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

/* ───────────────────────── Calcul littéral ───────────────────────── */

type Motif = {
  name: string;
  cells: (n: number) => [number, number][];
  count: (n: number) => number;
  growth: number;
  base: number;
};

const MOTIFS: readonly Motif[] = [
  {
    name: 'L',
    cells: (n) => [
      ...Array.from({ length: n + 1 }, (_, i) => [i, 0] as [number, number]),
      ...Array.from({ length: n }, (_, i) => [0, i + 1] as [number, number]),
    ],
    count: (n) => 2 * n + 1,
    growth: 2,
    base: 1,
  },
  {
    name: 'croix',
    cells: (n) => [
      [n, n],
      ...Array.from(
        { length: n },
        (_, i) =>
          [
            [n - i - 1, n],
            [n + i + 1, n],
            [n, n - i - 1],
            [n, n + i + 1],
          ] as [number, number][],
      ).flat(),
    ],
    count: (n) => 4 * n + 1,
    growth: 4,
    base: 1,
  },
  {
    name: 'rectangle',
    cells: (n) =>
      Array.from(
        { length: n + 1 },
        (_, i) =>
          [
            [i, 0],
            [i, 1],
          ] as [number, number][],
      ).flat(),
    count: (n) => 2 * n + 2,
    growth: 2,
    base: 2,
  },
  {
    name: 'escalier',
    cells: (n) =>
      Array.from(
        { length: n },
        (_, i) =>
          [
            [i, 0],
            [i, 1],
            [i, 2],
          ] as [number, number][],
      ).flat(),
    count: (n) => 3 * n,
    growth: 3,
    base: 0,
  },
];

const motifs: Skill = {
  id: 'm5-motifs',
  title: 'Suites de motifs',
  lesson: {
    memo: [
      'Compte les carreaux des premières étapes, et regarde **combien on en ajoute à chaque fois**.',
      'Exemple : 3, 5, 7… on ajoute 2 à chaque étape. Donc l’étape 10, c’est 2 × 10 + 1 = 21 (le « + 1 » est ce qu’il y a en plus au départ).',
      'Pas besoin de dessiner les 10 étapes !',
    ],
    source: objective(
      'Identifier des régularités et poursuivre une suite de motifs évolutive. Trouver le nombre d’éléments pour une étape donnée',
    ),
  },
  generate(rng, level) {
    const m = rng.pick(MOTIFS);
    const step = level === 1 ? 4 : level === 2 ? rng.int(6, 10) : rng.pick([20, 50, 100]);
    const v = m.count(step);
    const formula = `${m.growth} × n${m.base ? ` + ${m.base}` : ''}`;
    return {
      prompt: `Voici les étapes 1, 2 et 3 d’un motif. Combien de carreaux à l’étape ${step} ?`,
      figure: { kind: 'pattern', steps: [1, 2, 3].map((n) => m.cells(n)) },
      answer: num(v),
      traps: traps(r(v), [
        [
          m.count(1) * step,
          `Le motif ne grandit pas proportionnellement : on ajoute ${m.growth} carreaux à chaque étape.`,
        ],
        [m.count(3) + (step - 3), `On ajoute ${m.growth} carreaux à chaque étape, pas 1.`],
      ]),
      hint: `Compte les carreaux des étapes 1, 2 et 3 : combien en ajoute-t-on à chaque fois ?`,
      steps: [
        `On compte : ${m.count(1)} carreaux, puis ${m.count(2)}, puis ${m.count(3)}. On en ajoute **${m.growth}** à chaque étape.`,
        `Donc à chaque étape n, il y a ${m.growth} × n carreaux${m.base ? `, plus ${m.base} qui ${m.base > 1 ? 'sont là' : 'est là'} dès le départ` : ''} : ${formula}. (Vérifie : étape 1 → ${m.growth} × 1${m.base ? ` + ${m.base}` : ''} = ${m.count(1)}.)`,
        `Étape ${step} : ${m.growth} × ${step}${m.base ? ` + ${m.base}` : ''} = **${v}**`,
      ],
      targetSeconds: level === 3 ? 60 : 30,
    };
  },
};

const formules: Skill = {
  id: 'm5-formules',
  title: 'Produire une formule',
  lesson: {
    memo: [
      'Une lettre, c’est un nombre qu’on ne connaît pas encore. Essaie avec un vrai nombre pour vérifier !',
      'Avec x = 5 : le double, c’est 2 × 5 = 10 → 2 × x. Le carré, c’est 5 × 5 = 25 → x^2. Le suivant, c’est 6 → x + 1.',
    ],
    source: objective('Produire des formules (double, triple, carré, successeur, prédécesseur, aire, périmètre, etc.)'),
  },
  generate(rng, level) {
    const k = rng.int(2, 9);
    const all: { text: string; correct: string; wrong: { label: string; why: string }[] }[] = [
      {
        text: 'le double du nombre x',
        correct: '2 × x',
        wrong: [
          { label: 'x^2', why: 'x^2 = x × x est le carré, pas le double.' },
          { label: 'x + 2', why: 'x + 2 ajoute 2 ; le double, c’est 2 fois x.' },
        ],
      },
      {
        text: 'le carré du nombre x',
        correct: 'x^2',
        wrong: [
          { label: '2 × x', why: '2 × x est le double ; le carré est x × x.' },
          { label: 'x + x', why: 'x + x = 2x, le double.' },
        ],
      },
      {
        text: 'le successeur de l’entier n',
        correct: 'n + 1',
        wrong: [
          { label: 'n − 1', why: 'n − 1 est le prédécesseur (celui d’avant).' },
          { label: '2 × n', why: 'Le successeur est l’entier qui suit : n + 1.' },
        ],
      },
      {
        text: 'le prédécesseur de l’entier n',
        correct: 'n − 1',
        wrong: [
          { label: 'n + 1', why: 'n + 1 est le successeur (celui d’après).' },
          { label: 'n ÷ 2', why: 'Le prédécesseur est l’entier juste avant : n − 1.' },
        ],
      },
      {
        text: 'le périmètre d’un carré de côté c',
        correct: '4 × c',
        wrong: [
          { label: 'c^2', why: 'c^2 = c × c est l’aire du carré, pas son périmètre.' },
          { label: 'c + 4', why: 'Le périmètre est la somme des 4 côtés : c + c + c + c = 4 × c.' },
        ],
      },
      {
        text: 'l’aire d’un carré de côté c',
        correct: 'c^2',
        wrong: [
          { label: '4 × c', why: '4 × c est le périmètre ; l’aire est c × c.' },
          { label: '2 × c', why: 'L’aire est c × c = c^2.' },
        ],
      },
      {
        text: 'l’aire d’un rectangle de longueur L et de largeur ℓ',
        correct: 'L × ℓ',
        wrong: [
          { label: '2 × (L + ℓ)', why: '2 × (L + ℓ) est le périmètre du rectangle.' },
          { label: 'L + ℓ', why: 'L’aire d’un rectangle est longueur × largeur.' },
        ],
      },
      {
        text: `le triple du nombre n, augmenté de ${k}`,
        correct: `3 × n + ${k}`,
        wrong: [
          { label: `3 × (n + ${k})`, why: `Ici on augmente n de ${k} avant de tripler ; l’énoncé triple d’abord.` },
          { label: `n + 3 + ${k}`, why: 'Le triple, c’est 3 × n.' },
        ],
      },
    ];
    const pool = level === 1 ? all.slice(0, 4) : level === 2 ? all.slice(2, 7) : all.slice(4);
    const f = rng.pick(pool);
    return {
      prompt: `Quelle expression donne ${f.text} ?`,
      ...choice(rng, f.correct, f.wrong),
      hint: 'Essaie avec un vrai nombre à la place de la lettre (par exemple 5) : quelle expression donne le bon résultat ?',
      steps: [
        `Astuce : on essaie avec un vrai nombre à la place de la lettre, par exemple 5.`,
        `${f.text.charAt(0).toUpperCase()}${f.text
          .slice(1)
          .replace(/ (x|n|c)\b/, ' 5')
          .replace('L et de largeur ℓ', '5 et de largeur 3')} : ${f.correct
          .replace(/\bx\b|\bn\b|\bc\b/g, '5')
          .replace('L', '5')
          .replace('ℓ', '3')
          .replace('5^2', '5 × 5')}.`,
        `Avec la lettre, ça s’écrit **${f.correct}**.`,
      ],
    };
  },
};

const substitution: Skill = {
  id: 'm5-substitution',
  title: 'Calculer une expression littérale',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Quand un nombre est collé à une lettre, il y a un × caché : 3x veut dire 3 × x.',
      'Pour x = 4 : 3x = 3 × 4 = 12, et surtout pas « 34 » !',
      'Ensuite, on respecte l’ordre : × avant +.',
    ],
    source: objective('Calculer la valeur d’une expression littérale par substitution'),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(1, 15);
    if (level === 3) {
      const x = rng.int(2, 9);
      const c = rng.int(1, 5);
      const v = a * (x + c);
      return {
        prompt: `Calcule ${a}(x + ${c}) pour x = ${x}.`,
        answer: num(v),
        traps: traps(r(v), [
          [a * x + c, `${a}(x + ${c}) = ${a} × (x + ${c}) : le ${a} multiplie toute la parenthèse.`],
        ]),
        hint: `${a}(x + ${c}) veut dire ${a} × (x + ${c}). Remplace x, puis calcule la parenthèse d’abord.`,
        steps: [
          `${a}(x + ${c}) cache un × : c’est ${a} × (x + ${c}).`,
          `On remplace x par ${x} : ${a} × (${x} + ${c}). La parenthèse d’abord : ${x} + ${c} = ${x + c}.`,
          `${a} × ${x + c} = **${v}**`,
        ],
      };
    }
    const x: Rational = level === 2 ? dec(rng.int(11, 49), 1) : r(rng.int(2, 9));
    const v = add(mul(r(a), x), r(b));
    const concat = level === 1 ? r(Number(`${a}${x.n}`) + b) : null;
    return {
      prompt: `Calcule ${a}x + ${b} pour x = ${fmt(x)}.`,
      answer: num(v),
      traps: traps(v, [
        ...(concat
          ? ([
              [concat, `${a}x veut dire ${a} × x : avec x = ${fmt(x)}, c’est ${a} × ${fmt(x)}, pas « ${a}${fmt(x)} ».`],
            ] as [Rational, string][])
          : []),
        [mul(r(a), add(x, r(b))), 'La multiplication se fait avant l’addition.'],
      ]),
      hint: `${a}x cache un × : c’est ${a} × x. Remplace x par ${fmt(x)}.`,
      steps: [
        `${a}x veut dire ${a} × x (il y a un × caché).`,
        `On remplace x par ${fmt(x)} : ${a} × ${fmt(x)} + ${b}. La multiplication d’abord : ${a} × ${fmt(x)} = ${fmt(mul(r(a), x))}.`,
        `${fmt(mul(r(a), x))} + ${b} = **${fmt(v)}**`,
      ],
    };
  },
};

const testerEgalite: Skill = {
  id: 'm5-tester-egalite',
  title: 'Tester une égalité',
  lesson: {
    memo: [
      'Une égalité, c’est comme une balance : on calcule ce qu’il y a à gauche, puis ce qu’il y a à droite.',
      'Si les deux côtés donnent le même nombre, la balance est équilibrée : c’est **vrai**. Sinon, c’est faux.',
    ],
    source: objective(
      'Tester si une égalité entre expressions algébriques comportant une variable est vraie ou fausse',
    ),
  },
  generate(rng, level) {
    const a = rng.int(2, 6);
    const c = rng.int(a + 1, 9);
    const x = rng.int(1, level === 1 ? 5 : 9);
    const b = rng.int(1, 20);
    const makeTrue = rng.next() < 0.5;
    // a x + b = c x − d, avec d choisi pour que l'égalité soit vraie (ou presque) en x
    const d = c * x - (a * x + b) + (makeTrue ? 0 : rng.pick([-2, -1, 1, 2]));
    const left = a * x + b;
    const right = c * x - d;
    const isTrue = left === right;
    const sign = d >= 0 ? `− ${d}` : `+ ${-d}`;
    return {
      prompt: `L’égalité ${a}x + ${b} = ${c}x ${sign} est-elle vraie pour x = ${x} ?`,
      ...trueFalse(isTrue, `À gauche : ${a} × ${x} + ${b} = ${left} ; à droite : ${c} × ${x} ${sign} = ${right}.`),
      hint: `Remplace x par ${x} à gauche, puis à droite. Les deux côtés donnent-ils le même nombre ?`,
      steps: [
        `Comme une balance : on calcule chaque côté séparément, en remplaçant x par ${x}.`,
        `À gauche : ${a} × ${x} + ${b} = ${a * x} + ${b} = ${left}.`,
        `À droite : ${c} × ${x} ${sign} = ${c * x} ${sign} = ${right}.`,
        isTrue
          ? `${left} = ${right} : la balance est équilibrée, c’est **vrai**.`
          : `${left} ≠ ${right} : la balance penche, c’est **faux**.`,
      ],
      targetSeconds: 40,
    };
  },
};

const natureLitterale: Skill = {
  id: 'm5-nature-litterale',
  title: 'Somme ou produit (expressions)',
  lesson: {
    memo: [
      'Imagine que tu remplaces x par un nombre et que tu fais le calcul. **La dernière opération** donne le nom.',
      '3x + 2 : on fait 3 × x, puis + 2. Dernière opération + → une **somme**.',
      '5(x + 4) : on fait la parenthèse, puis × 5. Dernière opération × → un **produit**.',
    ],
    source: objective('Déterminer si une expression littérale est une somme ou un produit'),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const b = rng.int(1, 9);
    const forms = [
      { e: `${a}x + ${b}`, sum: true },
      { e: `${a}(x + ${b})`, sum: false },
      { e: `x^2 + ${b}`, sum: true },
      { e: `${a}x × ${b}`, sum: false },
      { e: `(x + ${b}) × (x − 1)`, sum: false },
      { e: `${a} + ${b}x`, sum: true },
    ];
    const f = rng.pick(level === 1 ? forms.slice(0, 2) : forms);
    const correct = f.sum ? 'Une somme' : 'Un produit';
    return {
      prompt: `L’expression ${f.e} est…`,
      ...choice(
        rng,
        correct,
        [
          {
            label: f.sum ? 'Un produit' : 'Une somme',
            why: `La dernière opération de ${f.e} est ${f.sum ? '+' : '×'}.`,
          },
        ],
        true,
      ),
      hint: 'Remplace x par un nombre et fais le calcul dans ta tête : quelle opération fais-tu en dernier ?',
      steps: [
        `On imagine le calcul avec un nombre à la place de x, en respectant les priorités.`,
        `Dans ${f.e}, l’opération faite en dernier est ${f.sum ? '+' : '×'}.`,
        `${f.sum ? '+' : '×'} en dernier : c’est **${correct.toLowerCase()}**.`,
      ],
      targetSeconds: 10,
    };
  },
};

const developper: Skill = {
  id: 'm5-developper',
  title: 'Développer et factoriser',
  advice: 'brouillon',
  lesson: {
    memo: [
      '**Développer** 3(x + 5) : le 3 distribue une multiplication à **chacun** dans la parenthèse : 3 × x + 3 × 5 = 3x + 15.',
      '**Factoriser**, c’est l’inverse : dans 4x + 12, on repère que 4 est dans les deux (12 = 4 × 3), donc 4x + 12 = 4(x + 3).',
    ],
    source: objective(
      'Exploiter les relations k(a + b) = ka + kb ou k(a – b) = ka – kb pour factoriser, ou développer une expression littérale',
    ),
  },
  generate(rng, level) {
    const k = rng.int(2, 9);
    const b = rng.int(1, 9);
    const minus = level >= 2 && rng.next() < 0.5;
    const op = minus ? '−' : '+';
    if (level === 3) {
      const correct = `${k}(x ${op} ${b})`;
      return {
        prompt: `Factorise ${k}x ${op} ${k * b}.`,
        ...choice(rng, correct, [
          {
            label: `${k}(x ${op} ${k * b})`,
            why: `${k}(x ${op} ${k * b}) redonne ${k}x ${op} ${k * k * b} : il faut ${k * b} = ${k} × ${b}.`,
          },
          {
            label: `${k}x(1 ${op} ${b})`,
            why: `Le facteur commun est ${k}, pas ${k}x (le deuxième terme n’a pas de x).`,
          },
          { label: `x(${k} ${op} ${k * b})`, why: 'x n’est pas un facteur du deuxième terme.' },
        ]),
        hint: `Quel nombre se retrouve dans ${k}x et dans ${k * b} ? (${k * b} = ${k} × …)`,
        steps: [
          `On cherche ce qui est commun aux deux morceaux : ${k}x = ${k} × x et ${k * b} = ${k} × ${b}.`,
          `Le ${k} est dans les deux : on le sort devant une parenthèse.`,
          `${k}x ${op} ${k * b} = **${correct}** (vérifie en développant : ${k} × x ${op} ${k} × ${b}).`,
        ],
      };
    }
    const correct = `${k}x ${op} ${k * b}`;
    return {
      prompt: `Développe ${k}(x ${op} ${b}).`,
      ...choice(rng, correct, [
        { label: `${k}x ${op} ${b}`, why: `${k} multiplie **aussi** ${b} : ${k} × ${b} = ${k * b}.` },
        { label: `${k + b}x`, why: `On ne peut pas additionner ${k}x et ${b} : ce ne sont pas des termes semblables.` },
        { label: `${k}x ${op} ${k + b}`, why: `${k} × ${b} = ${k * b}, pas ${k + b}.` },
      ]),
      hint: `Le ${k} doit multiplier chacun des deux termes dans la parenthèse : x et ${b}.`,
      steps: [
        `Le ${k} devant la parenthèse multiplie **chacun** des termes à l’intérieur : x et ${b}.`,
        `${k} × x = ${k}x et ${k} × ${b} = ${k * b}.`,
        `${k}(x ${op} ${b}) = **${correct}**`,
      ],
    };
  },
};

const reduire: Skill = {
  id: 'm5-reduire',
  title: 'Réduire une expression',
  advice: 'brouillon',
  lesson: {
    memo: [
      'Pense à des fruits : 3x + 5x, c’est 3 pommes + 5 pommes = 8 pommes → 8x.',
      'Dans 2x + 7 + 4x − 3, on range : les pommes (2x + 4x = 6x) d’un côté, les nombres seuls (7 − 3 = 4) de l’autre → 6x + 4.',
      'On ne mélange jamais les pommes et les nombres seuls !',
    ],
    source: objective('Réduire une expression littérale de la forme ax + b, où a et b sont des nombres décimaux'),
  },
  generate(rng, level) {
    const a = rng.int(2, 9);
    const c = rng.int(2, 9);
    if (level === 1) {
      const correct = `${a + c}x`;
      return {
        prompt: `Réduis ${a}x + ${c}x.`,
        ...choice(rng, correct, [
          { label: `${a + c}x^2`, why: 'On additionne des x (comme 3 pommes + 5 pommes) : x reste x, pas x^2.' },
          { label: `${a * c}x`, why: `${a} x plus ${c} x : on additionne ${a} et ${c}.` },
        ]),
        hint: `Pense à des pommes : ${a} pommes + ${c} pommes = ?`,
        steps: [
          `x, c’est comme une pomme : ${a}x + ${c}x, c’est ${a} pommes + ${c} pommes.`,
          `${a} + ${c} = ${a + c} pommes. On ne multiplie pas, et x reste x (pas x^2).`,
          `${a}x + ${c}x = **${correct}**`,
        ],
        targetSeconds: 10,
      };
    }
    const b = rng.int(1, 9);
    const d = rng.int(1, 9);
    const useDec = level === 3;
    const A: Rational = useDec ? dec(rng.int(11, 49), 1) : r(a);
    const C: Rational = useDec ? dec(rng.int(11, 49), 1) : r(c);
    const minus = rng.next() < 0.5 && b > d;
    const xs = add(A, C);
    const cst = minus ? b - d : b + d;
    const correct = `${fmt(xs)}x + ${cst}`;
    return {
      prompt: `Réduis ${fmt(A)}x + ${b} + ${fmt(C)}x ${minus ? '−' : '+'} ${d}.`,
      ...choice(rng, correct, [
        { label: `${fmt(add(xs, r(cst)))}x`, why: 'On ne peut pas ajouter les nombres seuls aux termes en x.' },
        { label: `${fmt(xs)}x + ${minus ? b + d : Math.abs(b - d)}`, why: `Attention au signe devant ${d}.` },
        { label: `${fmt(xs)}x^2 + ${cst}`, why: 'x + x = 2x, pas x^2 : x reste x.' },
      ]),
      hint: 'Range d’un côté les termes avec x, de l’autre les nombres seuls.',
      steps: [
        `On range comme des fruits : les « x » ensemble, les nombres seuls ensemble.`,
        `Les x : ${fmt(A)}x + ${fmt(C)}x = ${fmt(xs)}x. Les nombres : ${b} ${minus ? '−' : '+'} ${d} = ${cst}.`,
        `On ne peut pas mélanger les deux : **${correct}**`,
      ],
    };
  },
};

const equations: Skill = {
  id: 'm5-equations',
  title: 'Équations ax = c et x + b = c',
  advice: 'brouillon',
  lesson: {
    memo: [
      'x est un nombre caché. On cherche lequel rend l’égalité vraie.',
      'x + 5 = 12 : quel nombre plus 5 fait 12 ? On fait l’inverse : 12 − 5 = 7.',
      '4x = 28 : 4 fois quel nombre fait 28 ? On fait l’inverse : 28 ÷ 4 = 7. Puis on vérifie : 4 × 7 = 28 ✔',
    ],
    source: objective(
      'Résoudre des équations du type ax = c ou x + b = c par des méthodes arithmétiques s’appuyant sur les opérations inverses',
    ),
  },
  generate(rng, level) {
    const mult = level >= 2 && rng.next() < 0.6;
    if (mult) {
      const a = rng.int(2, 9);
      const x: Rational = level === 3 ? dec(rng.int(11, 99), 1) : r(rng.int(2, 12));
      const c = mul(r(a), x);
      return {
        prompt: `Résous : ${a}x = ${fmt(c)}`,
        answer: num(x),
        traps: traps(x, [
          [sub(c, r(a)), `${a}x veut dire ${a} × x : on divise par ${a}, on ne soustrait pas.`],
          [mul(c, r(a)), `On fait l’opération inverse de × ${a} : ÷ ${a}.`],
        ]),
        hint: `${a}x veut dire ${a} × x. Quelle est l’opération inverse de « × ${a} » ?`,
        steps: [
          `${a}x = ${fmt(c)} veut dire : ${a} fois quel nombre fait ${fmt(c)} ?`,
          `Pour défaire « × ${a} », on fait l’inverse : on divise par ${a}. ${fmt(c)} ÷ ${a} = ${fmt(x)}.`,
          `On vérifie : ${a} × ${fmt(x)} = ${fmt(c)} ✔. Donc x = **${fmt(x)}**.`,
        ],
      };
    }
    const b: Rational = level === 3 ? dec(rng.int(11, 99), 1) : r(rng.int(2, 30));
    const x: Rational = level === 3 ? dec(rng.int(11, 99), 1) : r(rng.int(2, 40));
    const c = add(x, b);
    return {
      prompt: `Résous : x + ${fmt(b)} = ${fmt(c)}`,
      answer: num(x),
      traps: traps(x, [[add(c, b), `L’opération inverse de + ${fmt(b)} est − ${fmt(b)}.`]]),
      hint: `Quel nombre plus ${fmt(b)} fait ${fmt(c)} ? Fais l’opération inverse de « + ${fmt(b)} ».`,
      steps: [
        `x + ${fmt(b)} = ${fmt(c)} veut dire : quel nombre plus ${fmt(b)} fait ${fmt(c)} ?`,
        `Pour défaire « + ${fmt(b)} », on fait l’inverse : on enlève ${fmt(b)}. ${fmt(c)} − ${fmt(b)} = ${fmt(x)}.`,
        `On vérifie : ${fmt(x)} + ${fmt(b)} = ${fmt(c)} ✔. Donc x = **${fmt(x)}**.`,
      ],
      targetSeconds: 25,
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

export const litteral: Chapter = {
  id: 'm5-litteral',
  subject: 'maths',
  grade: '5e',
  domain: 'nombres',
  title: 'Calcul littéral',
  skills: [motifs, formules, substitution, testerEgalite, natureLitterale, developper, reduire, equations],
};
