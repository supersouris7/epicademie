import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association } from '../sciences/st/outils.ts';
import type { Figure, QuestionDraft, Skill } from '../types.ts';
import { referencesInteractions } from './donnees-interactions.ts';

// ——— Les forces et leur représentation (4e) ———

interface Situation {
  readonly texte: string;
  readonly point: string;
  readonly direction: 'horizontale' | 'verticale';
  readonly sens: 'vers la droite' | 'vers la gauche' | 'vers le haut' | 'vers le bas';
}

const SITUATIONS: readonly Situation[] = [
  {
    texte: 'Une main tire la poignée d’un chariot horizontalement, vers la droite',
    point: 'la poignée du chariot',
    direction: 'horizontale',
    sens: 'vers la droite',
  },
  {
    texte: 'Un fil vertical tire vers le haut le crochet d’une caisse',
    point: 'le crochet de la caisse',
    direction: 'verticale',
    sens: 'vers le haut',
  },
  {
    texte: 'Un cordage tire horizontalement, vers la gauche, l’anneau d’un bateau',
    point: 'l’anneau du bateau',
    direction: 'horizontale',
    sens: 'vers la gauche',
  },
  {
    texte: 'Un enfant appuie verticalement, vers le bas, sur le bouton d’un tampon',
    point: 'le bouton du tampon',
    direction: 'verticale',
    sens: 'vers le bas',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.int(0, 2);
  if (cas === 0) {
    const { answer, traps: t } = choice(rng, 'le newton', [
      { label: 'le kilogramme', why: 'Le kilogramme mesure une masse, pas une force.' },
      { label: 'le mètre', why: 'Le mètre mesure une longueur.' },
    ]);
    return {
      prompt: 'Quelle est l’unité de la valeur d’une force dans le Système international ?',
      answer,
      traps: t,
      hint: 'Elle porte le nom d’un physicien anglais ; son symbole est N.',
      steps: ['La valeur d’une force se mesure avec une unité propre.', 'C’est **le newton** (symbole N).'],
      targetSeconds: 25,
    };
  }
  if (cas === 1) {
    const { answer, traps: t } = choice(rng, 'un dynamomètre', [
      {
        label: 'une balance de cuisine graduée en grammes',
        why: 'Elle affiche des grammes : une masse, pas une force.',
      },
      { label: 'un thermomètre', why: 'Le thermomètre mesure une température.' },
    ]);
    return {
      prompt: 'Quel appareil mesure la valeur d’une force ?',
      answer,
      traps: t,
      hint: 'Son nom contient « dyna- », qui évoque la force.',
      steps: ['Il faut un appareil destiné à mesurer l’intensité des forces.', 'C’est **un dynamomètre**.'],
      targetSeconds: 25,
    };
  }
  const s = rng.pick(SITUATIONS);
  const { answer, traps: t } = choice(rng, s.point, [
    { label: s.sens, why: 'C’est le sens de la force, pas l’endroit où elle s’applique.' },
    { label: s.direction, why: 'C’est la direction de la force, pas l’endroit où elle s’applique.' },
  ]);
  return {
    prompt: `${s.texte}. Quel est le point d’application de cette force ?`,
    answer,
    traps: t,
    hint: 'Cherche l’endroit de l’objet où l’action s’exerce.',
    steps: ['Le point d’application est l’endroit où la force s’exerce sur l’objet.', `C’est **${s.point}**.`],
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SITUATIONS);
  const valeur = rng.int(2, 12) * 5;
  return {
    prompt: `${s.texte}, avec une force de valeur ${valeur} N. Associe chaque caractéristique à sa description.`,
    answer: association(rng, [
      ['point d’application', s.point],
      ['direction', s.direction],
      ['sens', s.sens],
      ['valeur', `${valeur} N`],
    ]),
    hint: 'La direction est une droite ; le sens dit vers quel côté ; la valeur est un nombre avec son unité.',
    steps: [
      'Une force se caractérise par quatre éléments.',
      `**Point d’application : ${s.point} ; direction : ${s.direction} ; sens : ${s.sens} ; valeur : ${valeur} N**.`,
    ],
    targetSeconds: 50,
  };
};

/** Flèche d'origine A et de pointe B, de `n` carreaux dans le sens donné. */
const fleche = (sens: Situation['sens'], n: number): Figure => {
  const bout = {
    'vers la droite': [n, 0],
    'vers la gauche': [-n, 0],
    'vers le haut': [0, n],
    'vers le bas': [0, -n],
  }[sens] as [number, number];
  return {
    kind: 'grid',
    xMin: -7,
    xMax: 7,
    yMin: -7,
    yMax: 7,
    axes: false,
    points: [
      { name: 'A', x: 0, y: 0, color: 'accent' },
      { name: 'B', x: bout[0], y: bout[1] },
    ],
    segments: [['A', 'B']],
  };
};

const SENS = ['vers la droite', 'vers la gauche', 'vers le haut', 'vers le bas'] as const;
const LECTURE = 'La force est représentée par la flèche partant de A (origine) et finissant en B (pointe).';

const niveau3 = (rng: Rng): QuestionDraft => {
  const sens = rng.pick(SENS);
  const n = rng.int(2, 7);
  const echelle = rng.pick([2, 5, 10, 20] as const);
  const valeur = n * echelle;
  return {
    prompt: `${LECTURE} Échelle : 1 carreau représente ${echelle} N. Quelle est la valeur de la force, en N ?`,
    figure: fleche(sens, n),
    answer: num(r(valeur), 'N'),
    traps: traps(r(valeur), [
      [n, 'C’est la longueur en carreaux : applique l’échelle.'],
      [n + echelle, 'On multiplie le nombre de carreaux par la valeur d’un carreau, on n’additionne pas.'],
      [echelle, 'C’est la valeur d’un seul carreau.'],
    ]),
    hint: 'Compte les carreaux entre A et B, puis applique l’échelle.',
    steps: [`La flèche mesure ${n} carreaux.`, `${n} × ${echelle} = **${valeur} N**.`],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const sens = rng.pick(SENS);
  const n = rng.int(2, 7);
  const echelle = rng.pick([25, 50, 150, 250] as const);
  const valeur = n * echelle;
  if (rng.int(0, 1) === 0) {
    const direction = sens === 'vers le haut' || sens === 'vers le bas' ? 1 : 0;
    return {
      prompt: `${LECTURE} Échelle : 1 carreau représente ${echelle} N. Décris complètement la force.`,
      figure: fleche(sens, n),
      answer: {
        kind: 'cloze',
        parts: ['Point d’application : le point ', ' ; direction : ', ' ; sens : ', ' ; valeur : ', ' N.'],
        blanks: [
          { mode: 'text', accepted: ['A'] },
          { mode: 'list', options: ['horizontale', 'verticale'], correct: direction },
          { mode: 'list', options: [...SENS], correct: SENS.indexOf(sens) },
          { mode: 'text', accepted: [String(valeur)] },
        ],
      },
      hint: 'L’origine de la flèche, la droite qui la porte, le côté de la pointe, puis la longueur avec l’échelle.',
      steps: [
        'La flèche porte les quatre caractéristiques : origine, droite, pointe et longueur.',
        `**A ; ${direction ? 'verticale' : 'horizontale'} ; ${sens} ; ${valeur} N** (${n} × ${echelle}).`,
      ],
      targetSeconds: 80,
    };
  }
  return {
    prompt: `Une force de valeur ${valeur} N doit être représentée à l’échelle 1 cm pour ${echelle} N. Quelle longueur, en cm, aura la flèche ?`,
    answer: num(r(n), 'cm'),
    traps: traps(r(n), [
      [valeur, 'C’est la valeur de la force : divise-la par la valeur représentée par 1 cm.'],
      [valeur * echelle, 'Pour trouver une longueur, divise la valeur par l’échelle au lieu de multiplier.'],
      [valeur - echelle, 'On divise la valeur par ce que représente 1 cm, on ne soustrait pas.'],
    ]),
    hint: 'Combien de fois la valeur représentée par 1 cm tient-elle dans la valeur de la force ?',
    steps: ['La longueur est proportionnelle à la valeur.', `${valeur} ÷ ${echelle} = **${n} cm**.`],
    targetSeconds: 60,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const e1 = rng.pick([5, 10] as const);
  const e2 = rng.pick([20, 25] as const);
  const n1 = rng.int(4, 8);
  // F2 diffère de F1, avec une flèche plus courte mais une valeur plus grande : la longueur seule trompe.
  const n2 = n1 - 1;
  const v1 = n1 * e1;
  const v2 = n2 * e2;
  const comparaison = rng.int(0, 1) === 0;
  // Pour la comparaison, la force la plus grande est tantôt F1, tantôt F2.
  const inverse = comparaison && rng.int(0, 1) === 0;
  const schema = (i: number, e: number, n: number) =>
    `Schéma ${i} : échelle 1 cm pour ${e} N ; la force F${i} est une flèche de ${n} cm.`;
  const lignes = [
    inverse ? schema(1, e2, n2) : schema(1, e1, n1),
    inverse ? schema(2, e1, n1) : schema(2, e2, n2),
    'Les deux flèches sont horizontales, pointées vers la droite.',
  ];
  const figure: Figure = { kind: 'document', title: 'Deux schémas de forces (données de l’exercice)', lines: lignes };
  if (comparaison) {
    const [f1, f2] = inverse
      ? [`${n2} × ${e2} = ${v2}`, `${n1} × ${e1} = ${v1}`]
      : [`${n1} × ${e1} = ${v1}`, `${n2} × ${e2} = ${v2}`];
    const why = `F1 = ${f1} N ; F2 = ${f2} N : les échelles diffèrent.`;
    const bon = inverse ? 'la force F1' : 'la force F2';
    const { answer, traps: t } = choice(rng, bon, [
      { label: inverse ? 'la force F2' : 'la force F1', why },
      { label: 'les deux forces ont la même valeur', why },
      { label: 'on ne peut pas les comparer', why: `Chaque échelle est donnée, on peut calculer. ${why}` },
    ]);
    return {
      prompt: 'Lis le document. Laquelle des deux forces a la plus grande valeur ?',
      figure,
      answer,
      traps: t,
      hint: 'La longueur ne suffit pas : lis l’échelle de chaque schéma.',
      steps: [why, `La plus grande valeur est celle de **${bon}**.`],
      targetSeconds: 100,
    };
  }
  return {
    prompt: `Lis le document. Sur le schéma 1 (échelle 1 cm pour ${e1} N), quelle longueur, en cm, aurait une flèche représentant la force F2 ?`,
    figure,
    answer: num(r(v2, e1), 'cm'),
    traps: traps(r(v2, e1), [
      [n2, 'La longueur dépend de l’échelle : recalcule avec l’échelle du schéma 1.'],
      [v2, 'C’est la valeur de F2 en newtons : convertis-la en longueur avec l’échelle du schéma 1.'],
      [n1, 'C’est la longueur de F1, pas celle de F2.'],
    ]),
    hint: 'Calcule d’abord la valeur de F2, puis reporte-la à l’échelle du schéma 1.',
    steps: [`Valeur de F2 : ${n2} × ${e2} = ${v2} N.`, `Sur le schéma 1 : ${v2} ÷ ${e1} = **${fmt(r(v2, e1))} cm**.`],
    targetSeconds: 120,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const forcesNotion: Skill = {
  id: 'p4-forces',
  title: 'Les forces et leur représentation',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **force** modélise une action : elle a un **point d’application**, une direction, un sens et une valeur, mesurée en **newtons** (N) avec un dynamomètre.',
      'On la représente par une flèche partant du point d’application ; à l’échelle 1 cm pour 10 N, une force de 30 N se dessine avec 3 cm.',
    ],
    ...referencesInteractions(
      'modeliser-force',
      'force-caracteres',
      'representer',
      'vecteur',
      'vecteur-lie',
      'newton',
      'dynamometre',
      'direction',
      'sens',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
