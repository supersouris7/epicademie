import { choice, num, traps } from '../../build.ts';
import { dec, fmt, mul, r, type Rational } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-matiere.ts';
import { association, maj, saisie } from './outils.ts';

// ——— Masse et volume : unités, gaz recueilli, proportionnalité, liquides superposés (6e) ———

const MASSES = ['la tonne (t)', 'le quintal (q)', 'le kilogramme (kg)', 'le gramme (g)', 'le milligramme (mg)'];
const VOLUMES = [
  'le litre (L)',
  'le millilitre (mL)',
  'le centimètre cube (cm³)',
  'le décimètre cube (dm³)',
  'le mètre cube (m³)',
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const volume = rng.int(0, 1) === 0;
  const bon = rng.pick(volume ? VOLUMES : MASSES);
  const autres = rng.shuffle(volume ? MASSES : VOLUMES).slice(0, 2);
  const { answer, traps: t } = choice(
    rng,
    maj(bon),
    autres.map((a) => ({
      label: maj(a),
      why: `${maj(a)} est une unité de ${volume ? 'masse' : 'volume'}.`,
    })),
  );
  return {
    prompt: `Laquelle de ces unités mesure ${volume ? 'un volume' : 'une masse'} ?`,
    answer,
    traps: t,
    hint: 'La masse se lit sur une balance ; le volume dit la place occupée.',
    steps: [
      volume ? 'Le volume mesure la place occupée.' : 'La masse se mesure avec une balance.',
      `La bonne unité est **${bon}**.`,
    ],
    targetSeconds: 20,
  };
};

interface Egalite {
  readonly gauche: string;
  readonly droite: string;
  readonly faux: readonly string[];
}
const EGALITES: readonly Egalite[] = [
  { gauche: '1 L', droite: '1 dm³', faux: ['1 cm³', '1 m³', '10 dm³'] },
  { gauche: '1 mL', droite: '1 cm³', faux: ['1 dm³', '1 m³', '10 cm³'] },
  { gauche: '1 m³', droite: '1 000 L', faux: ['1 L', '100 L', '10 L'] },
  { gauche: '1 t', droite: '1 000 kg', faux: ['100 kg', '10 kg', '10 000 kg'] },
  { gauche: '1 q', droite: '100 kg', faux: ['1 000 kg', '10 kg', '1 kg'] },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const e = rng.pick(EGALITES);
    const { answer, traps: t } = choice(
      rng,
      e.droite,
      e.faux.map((f) => ({ label: f, why: `Non : ${e.gauche} est égal à ${e.droite}, pas à ${f}.` })),
    );
    return {
      prompt: `À quoi est égal ${e.gauche} ?`,
      answer,
      traps: t,
      hint: e.gauche.endsWith('t') || e.gauche.endsWith('q') ? 'Compte en kilogrammes.' : 'Relie les litres aux cubes.',
      steps: ['On utilise la correspondance entre les unités.', `${e.gauche} = **${e.droite}**.`],
      targetSeconds: 30,
    };
  }
  const trois = rng.shuffle(EGALITES).slice(0, 3);
  return {
    prompt: `Associe chaque quantité à son égale : ${trois
      .map((e) => e.gauche)
      .sort()
      .join(', ')}.`,
    answer: association(
      rng,
      trois.map((e) => [e.gauche, e.droite]),
    ),
    hint: 'Sépare d’abord les masses des volumes.',
    steps: [
      'Une masse ne peut être égale qu’à une masse, un volume qu’à un volume.',
      `Réponse : **${trois.map((e) => `${e.gauche} = ${e.droite}`).join(' ; ')}**.`,
    ],
    targetSeconds: 45,
  };
};

interface Conversion {
  readonly de: string;
  readonly vers: string;
  /** Nombre de « vers » dans un « de ». */
  readonly facteur: Rational;
  readonly regle: string;
}
const CONVERSIONS: readonly Conversion[] = [
  { de: 'L', vers: 'mL', facteur: r(1000), regle: '1 L = 1 000 mL' },
  { de: 'L', vers: 'cm³', facteur: r(1000), regle: '1 L = 1 dm³ = 1 000 cm³' },
  { de: 'm³', vers: 'L', facteur: r(1000), regle: '1 m³ = 1 000 L' },
  { de: 'dm³', vers: 'L', facteur: r(1), regle: '1 dm³ = 1 L' },
  { de: 'mL', vers: 'cm³', facteur: r(1), regle: '1 mL = 1 cm³' },
  { de: 't', vers: 'kg', facteur: r(1000), regle: '1 t = 1 000 kg' },
  { de: 'q', vers: 'kg', facteur: r(100), regle: '1 q = 100 kg' },
  { de: 'kg', vers: 'g', facteur: r(1000), regle: '1 kg = 1 000 g' },
];

const conversion = (c: Conversion, v: Rational): QuestionDraft => {
  const res = mul(v, c.facteur);
  const faux: [Rational, string][] =
    c.facteur.n === 1
      ? [
          [mul(v, r(1000)), `Il n’y a rien à multiplier : ${c.regle}.`],
          [mul(v, dec(1, 3)), `Il n’y a rien à diviser : ${c.regle}.`],
        ]
      : [
          [v, `Tu n’as pas converti : ${c.regle}.`],
          [mul(v, r(c.facteur.n === 100 ? 1000 : 100)), `Mauvais facteur : ${c.regle}.`],
          [mul(v, dec(1, c.facteur.n === 100 ? 2 : 3)), `Tu as divisé au lieu de multiplier : ${c.regle}.`],
        ];
  return {
    prompt: `Convertis : ${fmt(v)} ${c.de} = … ${c.vers}`,
    answer: num(res, c.vers),
    traps: traps(res, faux),
    hint: 'Écris d’abord l’égalité entre les deux unités.',
    steps: [
      `Règle : ${c.regle}.`,
      c.facteur.n === 1
        ? 'Les deux unités sont égales : le nombre ne change pas.'
        : `On calcule ${fmt(v)} × ${fmt(c.facteur)}.`,
      `Résultat : **${fmt(res)} ${c.vers}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => conversion(rng.pick(CONVERSIONS), r(rng.int(2, 25)));

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) {
    // Conversion inverse (vers la plus grande unité), avec un résultat décimal.
    const c = rng.pick(CONVERSIONS.filter((x) => x.facteur.n > 1));
    const v = rng.int(15, 95) * (c.facteur.n / 20);
    const res = dec((v * 1000) / c.facteur.n, 3);
    return {
      prompt: `Convertis : ${fmt(v)} ${c.vers} = … ${c.de}`,
      answer: num(res, c.de),
      traps: traps(res, [
        [r(v * c.facteur.n), `Tu as multiplié au lieu de diviser : ${c.regle}.`],
        [r(v), `Tu n’as pas converti : ${c.regle}.`],
        [mul(res, r(10)), `Mauvais facteur : ${c.regle}.`],
      ]),
      hint: 'On passe à une unité plus grande : le nombre devient plus petit.',
      steps: [
        `Règle : ${c.regle}.`,
        `On calcule ${fmt(v)} ÷ ${fmt(c.facteur)}.`,
        `Résultat : **${fmt(res)} ${c.de}**.`,
      ],
      targetSeconds: 45,
    };
  }
  if (t === 1) {
    const avant = rng.int(2, 6) * 50;
    const gaz = rng.int(3, 18) * 5;
    return {
      prompt: `Une éprouvette graduée retournée contient ${avant} mL d’eau. Un gaz y entre et chasse de l’eau : il reste ${avant - gaz} mL d’eau. Quel volume de gaz a été recueilli, en mL ?`,
      answer: num(gaz, 'mL'),
      traps: traps(r(gaz), [
        [avant, 'C’est le volume d’eau du départ, pas le volume de gaz.'],
        [avant - gaz, 'C’est le volume d’eau qui reste, pas le volume de gaz.'],
      ]),
      hint: 'Le gaz prend exactement la place de l’eau qu’il chasse.',
      steps: [
        'On mesure un volume de gaz par déplacement de liquide.',
        `Le gaz occupe la place de l’eau chassée : **${gaz} mL**.`,
      ],
      targetSeconds: 45,
    };
  }
  if (t === 2) {
    return {
      prompt: 'Associe chaque quantité à son égale.',
      answer: association(rng, [
        ['2 L', '2 dm³'],
        ['2 mL', '2 cm³'],
        ['2 m³', '2 000 L'],
        ['2 t', '2 000 kg'],
        ['2 q', '200 kg'],
      ]),
      hint: 'Commence par les masses, puis les volumes.',
      steps: [
        'On utilise 1 L = 1 dm³, 1 mL = 1 cm³, 1 m³ = 1 000 L, 1 t = 1 000 kg et 1 q = 100 kg.',
        'Réponse : **2 L = 2 dm³ ; 2 mL = 2 cm³ ; 2 m³ = 2 000 L ; 2 t = 2 000 kg ; 2 q = 200 kg**.',
      ],
      targetSeconds: 70,
    };
  }
  const v = rng.int(2, 9) * 10;
  const a = rng.int(7, 9) * v;
  const b = rng.int(10, 13) * v;
  const xPlusLeger = rng.int(0, 1) === 0;
  const mx = fmt(dec(xPlusLeger ? a : b, 1));
  const my = fmt(dec(xPlusLeger ? b : a, 1));
  const haut = xPlusLeger ? 'X' : 'Y';
  const { answer, traps: tr } = saisie(
    [haut, `le liquide ${haut}`, `liquide ${haut}`],
    [[xPlusLeger ? 'Y' : 'X', 'Ce liquide a la plus grande masse pour le même volume : il se place en dessous.']],
  );
  return {
    prompt: `Deux liquides non miscibles : ${v} mL du liquide X ont une masse de ${mx} g, ${v} mL du liquide Y une masse de ${my} g. Quel liquide forme la couche du dessus ? Écris X ou Y.`,
    answer,
    traps: tr,
    hint: 'Compare les masses : les volumes sont les mêmes.',
    steps: [
      'À volume égal, le liquide qui a la plus petite masse reste au-dessus.',
      `Le liquide **${haut}** forme la couche du dessus.`,
    ],
    targetSeconds: 50,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  const v1 = rng.int(2, 6) * 10;
  const parCm3 = rng.int(2, 9);
  const m1 = v1 * parCm3;
  const k = rng.int(2, 5);
  const figure = {
    kind: 'document' as const,
    title: 'Le métal inconnu (données de l’exercice)',
    lines: [
      'Les pièces sont faites du même métal : c’est un corps homogène (identique en tout point).',
      `Une pièce de ${v1} cm³ a une masse de ${m1} g.`,
    ],
  };
  if (t === 0) {
    const v2 = v1 * k;
    return {
      prompt: `Lis le document. Quelle est la masse d’une pièce de ${v2} cm³ du même métal, en g ?`,
      figure,
      answer: num(m1 * k, 'g'),
      traps: traps(r(m1 * k), [
        [m1 + (v2 - v1), 'La proportionnalité multiplie : on n’ajoute pas la différence des volumes.'],
        [m1, 'Le volume a changé, donc la masse change aussi.'],
      ]),
      hint: 'Combien de fois le nouveau volume contient-il le premier ?',
      steps: [
        `Le volume est multiplié par ${v2} ÷ ${v1} = ${k}.`,
        `La masse, proportionnelle au volume, est multipliée par ${k} : ${m1} × ${k}.`,
        `Masse : **${m1 * k} g**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (t === 1) {
    const m2 = m1 * k;
    return {
      prompt: `Lis le document. Quel est le volume d’une pièce du même métal qui a une masse de ${m2} g, en cm³ ?`,
      figure,
      answer: num(v1 * k, 'cm³'),
      traps: traps(r(v1 * k), [
        [v1 + (m2 - m1), 'On n’ajoute pas la différence des masses : on utilise la proportionnalité.'],
        [m2, 'C’est la masse, en grammes, pas le volume.'],
      ]),
      hint: 'Cherche par combien la masse a été multipliée.',
      steps: [
        `La masse est multipliée par ${m2} ÷ ${m1} = ${k}.`,
        `Le volume aussi : ${v1} × ${k}.`,
        `Volume : **${v1 * k} cm³**.`,
      ],
      targetSeconds: 80,
    };
  }
  const eau = rng.int(2, 6) * 20;
  const d = rng.int(2, 4);
  const n = rng.int(2, 4);
  return {
    prompt: `Lis le document. Quelle est la masse de ${n} L de ce liquide, en g ?`,
    figure: {
      kind: 'document',
      title: 'Carnet de laboratoire (données de l’exercice)',
      lines: [
        'Le liquide Z est homogène (identique en tout point).',
        `On en mesure ${eau} cm³ : leur masse est ${eau * d} g.`,
        `On veut maintenant en préparer ${n} L.`,
      ],
    },
    answer: num(n * 1000 * d, 'g'),
    traps: traps(r(n * 1000 * d), [
      [n * d, 'Convertis les litres en cm³ avant de calculer : 1 L = 1 000 cm³.'],
      [n * 1000, `C’est le volume en cm³ : chaque cm³ de ce liquide a une masse de ${d} g.`],
      [eau * d * n, 'On cherche la masse de plusieurs litres, pas plusieurs fois celle de la première mesure.'],
    ]),
    hint: 'Trouve la masse de 1 cm³, puis convertis les litres.',
    steps: [
      `${eau} cm³ ont une masse de ${eau * d} g : 1 cm³ a une masse de ${d} g.`,
      `${n} L = ${fmt(n * 1000)} cm³.`,
      `Masse : **${fmt(n * 1000 * d)} g**.`,
    ],
    targetSeconds: 90,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const masseVolumeMatiere: Skill = {
  id: 'p6-masse-volume',
  title: 'Masse et volume',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **masse** se mesure avec une **balance** ; le **volume** dit la place occupée (1 L = 1 dm³, 1 mL = 1 cm³, 1 m³ = 1 000 L, 1 t = 1 000 kg, 1 q = 100 kg). Le volume d’un gaz se mesure par **déplacement de liquide**.',
      'Pour un corps homogène, la masse est proportionnelle au volume : deux fois plus de volume, deux fois plus de masse. Entre deux liquides non miscibles, à volume égal, le plus léger reste au-dessus.',
    ],
    ...references(
      'vocabulaire',
      'balance',
      'deplacement',
      'volume-gaz',
      'conversions',
      'meme-volume',
      'proportionnalite',
      'position-liquides',
      'litre',
      'tonne',
      'quintal',
      'surnager',
      'kilo',
      'milli',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
