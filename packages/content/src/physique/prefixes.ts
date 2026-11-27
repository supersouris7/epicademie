import { choice, num, traps } from '../build.ts';
import { dec, fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, ordre, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesSignaux } from './donnees-signaux.ts';

// ——— Préfixes du Système international, tableau 3 du BIPM (5e) ———

export interface Prefixe {
  readonly nom: string;
  readonly symbole: string;
  /** Puissance de dix. */
  readonly exposant: number;
  /** Ce que fait le préfixe sur l'unité. */
  readonly sens: string;
}

export const PREFIXES: readonly Prefixe[] = [
  { nom: 'giga', symbole: 'G', exposant: 9, sens: '× 1 000 000 000 (un milliard)' },
  { nom: 'méga', symbole: 'M', exposant: 6, sens: '× 1 000 000 (un million)' },
  { nom: 'kilo', symbole: 'k', exposant: 3, sens: '× 1 000' },
  { nom: 'hecto', symbole: 'h', exposant: 2, sens: '× 100' },
  { nom: 'déca', symbole: 'da', exposant: 1, sens: '× 10' },
  { nom: 'déci', symbole: 'd', exposant: -1, sens: '÷ 10' },
  { nom: 'centi', symbole: 'c', exposant: -2, sens: '÷ 100' },
  { nom: 'milli', symbole: 'm', exposant: -3, sens: '÷ 1 000' },
  { nom: 'micro', symbole: 'μ', exposant: -6, sens: '÷ 1 000 000 (un million)' },
  { nom: 'nano', symbole: 'n', exposant: -9, sens: '÷ 1 000 000 000 (un milliard)' },
];
const par = (nom: string): Prefixe => {
  const p = PREFIXES.find((x) => x.nom === nom);
  if (!p) throw new Error(`Préfixe inconnu : ${nom}`);
  return p;
};
const COURANTS = ['kilo', 'hecto', 'déca', 'déci', 'centi', 'milli'].map(par);
const WHY = (p: Prefixe) => `Le préfixe ${p.nom} (${p.symbole}) correspond à ${p.sens}.`;

const qcmSens = (
  rng: Rng,
  p: Prefixe,
  faux: readonly Prefixe[],
  secondes: number,
  prompt = `Devant une unité, que signifie le préfixe « ${p.nom} » ?`,
): QuestionDraft => {
  const { answer, traps: t } = choice(
    rng,
    p.sens,
    faux.map((o) => ({ label: o.sens, why: `C’est le sens de « ${o.nom} ». ${WHY(p)}` })),
  );
  return {
    prompt,
    answer,
    traps: t,
    hint: 'Pense à un mot connu : kilomètre, centimètre, millimètre…',
    steps: ['Un préfixe multiplie ou divise l’unité.', WHY(p), `Réponse : **${p.sens}**.`],
    targetSeconds: secondes,
  };
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const trio = [par('kilo'), par('centi'), par('milli')];
  const p = rng.pick(trio);
  return qcmSens(
    rng,
    p,
    trio.filter((x) => x !== p),
    20,
    `Le préfixe « ${p.nom} », que fait-il à l’unité qu’il précède ?`,
  );
};

const associer = (rng: Rng, liste: readonly Prefixe[], n: 3 | 5): QuestionDraft => {
  const paires = rng.shuffle(liste).slice(0, n);
  return {
    prompt: `Associe chaque préfixe à son effet sur l’unité : ${paires
      .map((p) => p.nom)
      .sort()
      .join(' ; ')}.`,
    answer: association(
      rng,
      paires.map((p) => [p.nom, p.sens] as const),
    ),
    hint: 'Classe d’abord ceux qui agrandissent l’unité et ceux qui la divisent.',
    steps: ['Un préfixe change la taille de l’unité.', paires.map(WHY).join(' '), 'Chaque préfixe a **son** effet.'],
    targetSeconds: n === 3 ? 50 : 90,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) return associer(rng, COURANTS, 3);
  const p = rng.pick(COURANTS);
  return qcmSens(rng, p, rng.shuffle(COURANTS.filter((x) => x !== p)).slice(0, 3), 35);
};

/** Unités de départ et d'arrivée (préfixe, unité de base) : le facteur vaut toujours une puissance de dix entière. */
const COUPLES = [
  { de: 'km', vers: 'm', k: 1000 },
  { de: 'kg', vers: 'g', k: 1000 },
  { de: 'm', vers: 'cm', k: 100 },
  { de: 'm', vers: 'mm', k: 1000 },
  { de: 's', vers: 'ms', k: 1000 },
  { de: 'L', vers: 'mL', k: 1000 },
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const c = rng.pick(COUPLES);
    const n = rng.int(2, 40);
    const res = n * c.k;
    return {
      prompt: `Convertis : ${n} ${c.de} = ? ${c.vers}`,
      answer: num(r(res), c.vers),
      traps: traps(r(res), [
        [r(n * (c.k === 100 ? 1000 : 100)), `Le facteur entre ${c.de} et ${c.vers} est ${c.k}.`],
        [
          dec(Math.round((n / c.k) * 1000000), 6),
          'L’unité d’arrivée est plus petite : il en faut davantage, on multiplie.',
        ],
      ]),
      hint: `Combien de ${c.vers} dans 1 ${c.de} ?`,
      steps: [`1 ${c.de} = ${c.k} ${c.vers}.`, `${n} × ${c.k}.`, `${n} ${c.de} = **${fmt(r(res))} ${c.vers}**.`],
      targetSeconds: 40,
    };
  }
  if (type === 1) {
    const c = rng.pick(COUPLES);
    return {
      prompt: `Complète l’égalité entre ${c.de} et ${c.vers}.`,
      answer: {
        kind: 'cloze',
        parts: [`1 ${c.de} = `, ` ${c.vers}`],
        blanks: [{ mode: 'text', accepted: c.k === 1000 ? ['1000', '1 000'] : [String(c.k)] }],
      },
      hint: 'Le préfixe te donne le facteur.',
      steps: [
        `Il faut compter les ${c.vers} contenus dans 1 ${c.de}.`,
        'Le préfixe indique le facteur.',
        `1 ${c.de} = **${c.k} ${c.vers}**.`,
      ],
      targetSeconds: 30,
    };
  }
  // Longueurs toutes différentes, une par préfixe.
  const mm = rng.int(2, 9);
  const cm = rng.int(2, 9);
  const m = rng.int(1, 9);
  const km = rng.int(1, 9);
  const longueurs = [`${mm} mm`, `${cm} cm`, `${m} m`, `${km} km`];
  return {
    prompt: `Range ces longueurs de la plus petite à la plus grande : ${[...longueurs].sort().join(' ; ')}.`,
    answer: ordre(rng, longueurs),
    hint: 'Compare d’abord les préfixes : milli, centi, aucun, kilo.',
    steps: [
      'mm < cm < m < km pour des nombres inférieurs à 10.',
      `${longueurs.join(' < ')}.`,
      'La plus petite est en **mm**.',
    ],
    targetSeconds: 45,
  };
};

const GRANDS = ['giga', 'méga', 'kilo', 'centi', 'milli', 'micro', 'nano'].map(par);

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 3);
  if (type === 0) return associer(rng, GRANDS, 5);
  if (type === 1) {
    const p = rng.pick(GRANDS.filter((x) => x.nom !== 'kilo' && x.nom !== 'centi'));
    const { answer, traps: t } = saisie(
      [p.nom, p.nom.normalize('NFD').replace(/[̀-ͯ]/g, '')],
      [
        ...GRANDS.filter((x) => x !== p)
          .slice(0, 4)
          .map((x) => [x.nom, WHY(x)] as const),
        [p.symbole, `${p.symbole} est le symbole : on demande le nom du préfixe.`],
      ],
    );
    return {
      prompt: `Écris le nom du préfixe qui correspond à « ${p.sens} ».`,
      answer,
      traps: t,
      hint: 'Compare avec milli et méga : million, millionième, milliard…',
      steps: ['On cherche le préfixe du tableau du Système international.', WHY(p), `C’est **${p.nom}**.`],
      targetSeconds: 45,
    };
  }
  if (type === 2) {
    const n = rng.int(2, 9);
    const cas = rng.pick([
      { de: 'cm', vers: 'mm', res: n * 10, faux: n * 100 },
      { de: 'MHz', vers: 'kHz', res: n * 1000, faux: n * 1000000 },
      { de: 'km', vers: 'cm', res: n * 100000, faux: n * 1000 },
      { de: 'GHz', vers: 'MHz', res: n * 1000, faux: n * 100 },
      { de: 'mg', vers: 'μg', res: n * 1000, faux: n * 1000000 },
      { de: 'ms', vers: 'μs', res: n * 1000, faux: n * 100 },
    ] as const);
    return {
      prompt: `Convertis : ${n} ${cas.de} = ? ${cas.vers}`,
      answer: num(r(cas.res), cas.vers),
      traps: traps(r(cas.res), [
        [r(cas.faux), 'Passe par les préfixes un à un : le facteur est le rapport des deux préfixes.'],
        [r(n), 'Les préfixes sont différents : la valeur change.'],
      ]),
      hint: 'Compare les deux préfixes : de combien l’unité d’arrivée est-elle plus petite ?',
      steps: [
        `1 ${cas.de} = ${fmt(r(cas.res / n))} ${cas.vers}.`,
        `${n} × ${fmt(r(cas.res / n))}.`,
        `${n} ${cas.de} = **${fmt(r(cas.res))} ${cas.vers}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const g = rng.int(2, 99) * 5;
  const res = dec(g, 3);
  return {
    prompt: `Exprime ${g} g dans l’unité SI de masse, le kilogramme.`,
    answer: num(res, 'kg'),
    traps: traps(res, [
      [dec(g, 2), 'Il faut diviser par 1 000, pas par 100.'],
      [r(g * 1000), 'Le kilogramme est plus grand que le gramme : le nombre diminue.'],
    ]),
    hint: 'Combien de grammes dans 1 kg ?',
    steps: ['1 kg = 1 000 g.', `${g} ÷ 1 000.`, `${g} g = **${fmt(res)} kg**.`],
    targetSeconds: 70,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const kg = rng.int(1, 3);
    const g = rng.int(2, 9) * 50;
    const mg = rng.int(1, 9) * 1000;
    const total = kg * 1000 + g + mg / 1000;
    return {
      prompt: 'Lis la liste de matériel. Quelle est la masse totale, en grammes ?',
      figure: {
        kind: 'document',
        title: 'Colis du laboratoire (données de l’exercice)',
        lines: [`Support métallique : ${kg} kg.`, `Boîte de verrerie : ${g} g.`, `Sachet de poudre : ${mg} mg.`],
      },
      answer: num(r(total), 'g'),
      traps: traps(r(total), [
        [r(kg + g + mg), 'On ne peut additionner que des valeurs écrites dans la même unité.'],
        [r(kg * 100 + g + mg / 1000), '1 kg vaut 1 000 g, pas 100 g.'],
      ]),
      hint: 'Convertis chaque masse en grammes avant d’additionner.',
      steps: [
        `${kg} kg = ${kg * 1000} g et ${mg} mg = ${mg / 1000} g.`,
        `${kg * 1000} + ${g} + ${mg / 1000}.`,
        `La masse totale est **${total} g**.`,
      ],
      targetSeconds: 130,
    };
  }
  if (type === 1) {
    const khz = rng.pick([25, 30, 40, 50, 80]);
    const res = khz * 1000;
    return {
      prompt: 'Lis la notice. Quelle est la fréquence émise par le capteur, exprimée en hertz ?',
      figure: {
        kind: 'document',
        title: 'Notice d’un capteur de distance (exercice)',
        lines: [
          `Le capteur émet une vibration de ${khz} kHz.`,
          'L’oreille humaine perçoit environ de 20 Hz à 20 000 Hz.',
          'Le capteur reçoit ensuite l’écho renvoyé par l’obstacle.',
        ],
      },
      answer: num(r(res), 'Hz'),
      traps: traps(r(res), [
        [r(khz), 'Le préfixe kilo multiplie l’unité : le nombre en hertz est plus grand.'],
        [r(khz * 100), 'Kilo vaut 1 000, pas 100.'],
      ]),
      hint: 'Que signifie le « k » de kHz ?',
      steps: ['1 kHz = 1 000 Hz.', `${khz} × 1 000.`, `La fréquence est **${fmt(r(res))} Hz** : c’est un ultrason.`],
      targetSeconds: 100,
    };
  }
  // Trois longueurs d'ordres de grandeur voisins, jamais égales une fois converties.
  const mm = rng.int(2, 8) * 10 + rng.int(1, 9);
  const um = rng.int(15, 95) * 1000 + 500;
  const cm = rng.int(2, 9);
  const pieces = rng.shuffle([
    { nom: 'Tige A', v: mm, u: 'mm', um: 1000 },
    { nom: 'Fil B', v: um, u: 'μm', um: 1 },
    { nom: 'Bande C', v: cm, u: 'cm', um: 10000 },
  ]);
  const courte = pieces.reduce((a, b) => (a.v * a.um <= b.v * b.um ? a : b));
  const { answer, traps: t } = choice(
    rng,
    courte.nom,
    pieces
      .filter((x) => x !== courte)
      .map((x) => ({
        label: x.nom,
        why: `${x.nom} mesure ${fmt(r(x.v * x.um))} μm : ce n’est pas la plus courte.`,
      })),
  );
  return {
    prompt: 'Lis les mesures. Quelle pièce est la plus courte ?',
    figure: {
      kind: 'document',
      title: 'Longueurs relevées (données de l’exercice)',
      lines: pieces.map((x) => `${x.nom} : ${fmt(r(x.v))} ${x.u}.`),
    },
    answer,
    traps: t,
    hint: 'Mets les trois valeurs dans la même unité avant de comparer.',
    steps: [
      '1 mm = 1 000 μm et 1 cm = 10 000 μm.',
      pieces.map((x) => `${x.nom} : ${fmt(r(x.v * x.um))} μm`).join(' ; ') + '.',
      `La plus courte est **${courte.nom}**.`,
    ],
    targetSeconds: 110,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const prefixesSi: Skill = {
  id: 'p5-prefixes',
  title: 'Les préfixes du SI',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Un **préfixe** placé devant une unité la multiplie ou la divise : kilo (k) = × 1 000, hecto (h) = × 100, déca (da) = × 10, déci (d) = ÷ 10, centi (c) = ÷ 100, milli (m) = ÷ 1 000, donc 3 km = 3 000 m et 250 mg = 0,25 g.',
      'Plus loin : méga (M) = un million de fois, giga (G) = un milliard de fois, micro (μ) = un millionième, nano (n) = un milliardième.',
      'Attention aux majuscules et aux minuscules : M (méga) n’est pas m (milli).',
    ],
    ...referencesSignaux(
      'prefixes-c3',
      'prefixes',
      'tableau-multiples',
      'tableau-grands',
      'mot-unique',
      'cas-kilogramme',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
