import { choice, num, objective, traps, trueFalse } from '../build.ts';
import { add, dec, fmt, mul, r, sub, type Rational } from '../rational.ts';
import type { Chapter, Skill } from '../types.ts';

/* ───────────────────────── Puissances ───────────────────────── */

const notation: Skill = {
  id: 'm5-puissances-notation',
  title: 'Carré et cube : notation',
  lesson: {
    body: [
      'a^2 (« a au carré ») = a × a. a^3 (« a au cube ») = a × a × a.',
      'Attention : 5^3 = 5 × 5 × 5 = 125, pas 5 × 3 = 15.',
      'À connaître : 10^3 = 1 000 (1 m^3 = 1 000 dm^3).',
    ],
    example: {
      question: 'Écris 64 comme carré puis comme cube.',
      steps: ['64 = 8 × 8 = 8^2.', '64 = 4 × 4 × 4 = 4^3.'],
    },
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
        steps: [`${product} : ${cube ? 'trois' : 'deux'} facteurs égaux à ${a} → **${correct}**.`],
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
        steps: [`${a}^3 = ${a} × ${a} × ${a} = ${a * a} × ${a} = **${v}**`],
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
      steps: [
        cu
          ? `${fmt(n)} = ${cu.replace('^3', '')} × ${cu.replace('^3', '')} × ${cu.replace('^3', '')} = **${cu}**`
          : `${fmt(n)} = ${sq.replace('^2', '')} × ${sq.replace('^2', '')} = **${sq}**`,
      ],
    };
  },
};

const carres: Skill = {
  id: 'm5-carres',
  title: 'Carrés de 0 à 12',
  lesson: {
    body: [
      'À savoir par cœur : 0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.',
      'Le carré de 7 se note 7^2 = 7 × 7 = 49.',
    ],
    example: { question: 'Quel nombre a pour carré 121 ?', steps: ['11 × 11 = 121.', 'C’est 11.'] },
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
        steps: [`${a} × ${a} = ${a * a}, donc c’est **${a}**.`],
        targetSeconds: 10,
      };
    }
    return {
      prompt: `Calcule ${a}^2.`,
      answer: num(a * a),
      traps: traps(r(a * a), [[a * 2, `${a}^2 = ${a} × ${a}, pas ${a} × 2.`]]),
      steps: [`${a}^2 = ${a} × ${a} = **${a * a}**`],
      targetSeconds: 6,
    };
  },
};

const expressionsPuissances: Skill = {
  id: 'm5-puissances-expressions',
  title: 'Calculs avec des puissances',
  advice: 'brouillon',
  lesson: {
    body: [
      'Les puissances se calculent **avant** les multiplications et les additions (sauf parenthèses).',
      '2 × 5^2 = 2 × 25 = 50, alors que (2 × 5)^2 = 10^2 = 100.',
      'Avec une lettre : pour x = 3, x^2 + 1 = 3^2 + 1 = 9 + 1 = 10.',
    ],
    example: { question: 'Calcule 3 + 4^2.', steps: ['4^2 = 16.', '3 + 16 = 19.'] },
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
        steps: [`${b}^2 = ${b * b}.`, `${a} + ${b * b} = **${v}**`],
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
        steps: [`${b}^2 = ${b * b}.`, `${a} × ${b * b} = **${v}**`],
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
      steps: [`On remplace x par ${x} : ${x}^2 + ${k}.`, `= ${x * x} + ${k} = **${v}**`],
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
    body: [
      'On observe ce qui est **ajouté à chaque étape** (la régularité).',
      'Si on ajoute 4 carreaux à chaque étape et qu’il y en a 5 à l’étape 1, l’étape n en a 4 × n + 1.',
    ],
    example: {
      question: 'Étape 1 : 3 carreaux, étape 2 : 5, étape 3 : 7. Combien à l’étape 10 ?',
      steps: ['On ajoute 2 à chaque étape, et 3 = 2 × 1 + 1.', 'Étape n : 2 × n + 1. Étape 10 : 2 × 10 + 1 = 21.'],
    },
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
      steps: [
        `Étapes 1, 2, 3 : ${m.count(1)}, ${m.count(2)}, ${m.count(3)} carreaux — on ajoute **${m.growth}** à chaque étape.`,
        `Étape n : ${formula}.`,
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
    body: [
      'Une lettre représente un nombre quelconque. Le double de x : 2 × x (noté 2x) ; son carré : x × x = x^2 ; son successeur : x + 1.',
      'Périmètre d’un carré de côté c : 4 × c ; aire : c × c = c^2.',
    ],
    example: {
      question: 'Le triple d’un nombre n, augmenté de 5 ?',
      steps: ['Le triple : 3 × n.', 'Augmenté de 5 : 3 × n + 5.'],
    },
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
      steps: [`${f.text.charAt(0).toUpperCase()}${f.text.slice(1)} : **${f.correct}**.`],
    };
  },
};

const substitution: Skill = {
  id: 'm5-substitution',
  title: 'Calculer une expression littérale',
  advice: 'brouillon',
  lesson: {
    body: [
      'On remplace la lettre par sa valeur, en **rétablissant le signe ×** : pour x = 4, 3x = 3 × 4 = 12 (et pas 34 !).',
      'Puis on respecte les priorités opératoires.',
    ],
    example: { question: 'Calcule 5x − 7 pour x = 3.', steps: ['5 × 3 − 7.', '= 15 − 7 = 8.'] },
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
        steps: [`On remplace : ${a} × (${x} + ${c}).`, `= ${a} × ${x + c} = **${v}**`],
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
      steps: [
        `On remplace x par ${fmt(x)} : ${a} × ${fmt(x)} + ${b}.`,
        `= ${fmt(mul(r(a), x))} + ${b} = **${fmt(v)}**`,
      ],
    };
  },
};

const testerEgalite: Skill = {
  id: 'm5-tester-egalite',
  title: 'Tester une égalité',
  lesson: {
    body: [
      'Pour tester une égalité pour une valeur de x, on calcule **séparément** chaque membre, puis on compare.',
      'Si les deux résultats sont égaux, l’égalité est vraie pour cette valeur ; sinon elle est fausse.',
    ],
    example: {
      question: '3x + 2 = 5x − 4 pour x = 3 ?',
      steps: ['À gauche : 3 × 3 + 2 = 11.', 'À droite : 5 × 3 − 4 = 11.', '11 = 11 : l’égalité est vraie pour x = 3.'],
    },
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
      steps: [
        `Membre de gauche : ${a} × ${x} + ${b} = ${left}.`,
        `Membre de droite : ${c} × ${x} ${sign} = ${right}.`,
        isTrue ? `${left} = ${right} : **vraie** pour x = ${x}.` : `${left} ≠ ${right} : **fausse** pour x = ${x}.`,
      ],
      targetSeconds: 40,
    };
  },
};

const natureLitterale: Skill = {
  id: 'm5-nature-litterale',
  title: 'Somme ou produit (expressions)',
  lesson: {
    body: [
      'Comme pour les nombres, une expression porte le nom de sa **dernière opération** : 3x + 2 est une somme ; 5(x + 4) est un produit.',
    ],
    example: {
      question: '2(x − 1) est-il une somme ou un produit ?',
      steps: ['On calcule x − 1, puis on multiplie par 2 : dernière opération ×.', 'C’est un produit.'],
    },
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
      steps: [`Dernière opération : ${f.sum ? '+' : '×'}. C’est **${correct.toLowerCase()}**.`],
      targetSeconds: 10,
    };
  },
};

const developper: Skill = {
  id: 'm5-developper',
  title: 'Développer et factoriser',
  advice: 'brouillon',
  lesson: {
    body: [
      '**Développer** : k(a + b) = ka + kb ; k(a − b) = ka − kb (on distribue k à chaque terme).',
      '**Factoriser** : c’est l’inverse, on fait apparaître le facteur commun : 4x + 12 = 4 × x + 4 × 3 = 4(x + 3).',
    ],
    example: { question: 'Développe 3(x + 5).', steps: ['3 × x + 3 × 5.', '= 3x + 15.'] },
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
        steps: [`${k}x ${op} ${k * b} = ${k} × x ${op} ${k} × ${b}.`, `Facteur commun ${k} : **${correct}**.`],
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
      steps: [`${k}(x ${op} ${b}) = ${k} × x ${op} ${k} × ${b}.`, `= **${correct}**`],
    };
  },
};

const reduire: Skill = {
  id: 'm5-reduire',
  title: 'Réduire une expression',
  advice: 'brouillon',
  lesson: {
    body: [
      'On regroupe les termes « en x » ensemble et les nombres ensemble : 3x + 5x = 8x (3 x plus 5 x font 8 x).',
      '2x + 7 + 4x − 3 = 6x + 4. On ne mélange jamais les x et les nombres seuls.',
    ],
    example: {
      question: 'Réduis 5x + 2 + 3x + 6.',
      steps: ['Termes en x : 5x + 3x = 8x.', 'Nombres : 2 + 6 = 8.', 'Résultat : 8x + 8.'],
    },
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
        steps: [`${a}x + ${c}x = (${a} + ${c})x = **${correct}**`],
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
      steps: [
        `Termes en x : ${fmt(A)}x + ${fmt(C)}x = ${fmt(xs)}x.`,
        `Nombres : ${b} ${minus ? '−' : '+'} ${d} = ${cst}.`,
        `Résultat : **${correct}**`,
      ],
    };
  },
};

const equations: Skill = {
  id: 'm5-equations',
  title: 'Équations ax = c et x + b = c',
  advice: 'brouillon',
  lesson: {
    body: [
      'La lettre est une **inconnue** : on cherche le nombre qui rend l’égalité vraie.',
      'x + b = c : on fait l’opération inverse, x = c − b.',
      'a × x = c : on divise, x = c ÷ a.',
      'On vérifie toujours en remplaçant x par la solution trouvée.',
    ],
    example: { question: 'Résous 4x = 26.', steps: ['x = 26 ÷ 4 = 6,5.', 'Vérification : 4 × 6,5 = 26.'] },
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
        steps: [`x = ${fmt(c)} ÷ ${a} = **${fmt(x)}**`, `Vérification : ${a} × ${fmt(x)} = ${fmt(c)}.`],
      };
    }
    const b: Rational = level === 3 ? dec(rng.int(11, 99), 1) : r(rng.int(2, 30));
    const x: Rational = level === 3 ? dec(rng.int(11, 99), 1) : r(rng.int(2, 40));
    const c = add(x, b);
    return {
      prompt: `Résous : x + ${fmt(b)} = ${fmt(c)}`,
      answer: num(x),
      traps: traps(x, [[add(c, b), `L’opération inverse de + ${fmt(b)} est − ${fmt(b)}.`]]),
      steps: [`x = ${fmt(c)} − ${fmt(b)} = **${fmt(x)}**`, `Vérification : ${fmt(x)} + ${fmt(b)} = ${fmt(c)}.`],
      targetSeconds: 25,
    };
  },
};

export const puissances: Chapter = {
  id: 'm5-puissances',
  subject: 'maths',
  domain: 'nombres',
  title: 'Puissances',
  skills: [notation, carres, expressionsPuissances],
};

export const litteral: Chapter = {
  id: 'm5-litteral',
  subject: 'maths',
  domain: 'nombres',
  title: 'Calcul littéral',
  skills: [motifs, formules, substitution, testerEgalite, natureLitterale, developper, reduire, equations],
};
