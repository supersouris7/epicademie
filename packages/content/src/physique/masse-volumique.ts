import { choice, num, traps } from '../build.ts';
import { dec, fmt, mul, r, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-matiere.ts';

// ——— Masse volumique : masse de 1 cm³, proportionnalité entre masse et volume (5e) ———

/** Masse de 1 cm³ en dixièmes de gramme (substance fictive, donnée de l'exercice). */
const dixiemes = (rng: Rng) => rng.pick([8, 12, 15, 25, 27, 45, 78, 89]);
const show = (x: Rational) => fmt(x);
const subst = (rng: Rng) => rng.pick(['A', 'B', 'C', 'D', 'E']);

const niveau1 = (rng: Rng): QuestionDraft => {
  const k = rng.int(2, 9);
  const s = subst(rng);
  if (rng.int(0, 1) === 0) {
    const bon = `1 cm³ de cette substance a une masse de ${k} g`;
    const { answer, traps: t } = choice(rng, bon, [
      {
        label: `1 g de cette substance occupe ${k} cm³`,
        why: 'La masse volumique donne la masse de 1 cm³, pas le volume de 1 g.',
      },
      {
        label: `Tout objet fait de cette substance a une masse de ${k} g`,
        why: 'La masse d’un objet dépend de son volume : la valeur donnée est celle de 1 cm³.',
      },
    ]);
    return {
      prompt: `La masse volumique de la substance ${s} est de ${k} grammes pour 1 cm³. Que signifie cette phrase ?`,
      answer,
      traps: t,
      hint: '« Volumique » : pour un volume de 1 cm³.',
      steps: ['La masse volumique est la masse de 1 cm³.', `Donc **${bon}**.`],
      targetSeconds: 30,
    };
  }
  const v = rng.int(3, 6);
  const { answer, traps: t } = choice(rng, `${k * v} g`, [
    { label: `${k} g`, why: 'C’est la masse d’un seul cm³ : il y en a plusieurs.' },
    { label: `${k + v} g`, why: 'On multiplie la masse d’un cm³ par le nombre de cm³ (on n’additionne pas).' },
  ]);
  return {
    prompt: `1 cm³ de la substance ${s} a une masse de ${k} g. Quelle est la masse de ${v} cm³ de cette substance ?`,
    answer,
    traps: t,
    hint: 'Deux fois plus de volume, c’est deux fois plus de masse.',
    steps: ['Pour une substance donnée, la masse est proportionnelle au volume.', `${v} × ${k} = **${k * v} g**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const v1 = rng.int(2, 8) * 5;
  const unite = rng.int(2, 9);
  const facteur = rng.pick([2, 3, 4, 5]);
  const m1 = v1 * unite;
  const v2 = v1 * facteur;
  const bon = m1 * facteur;
  const { answer, traps: t } = choice(rng, `${bon} g`, [
    { label: `${m1 + (v2 - v1)} g`, why: 'La masse augmente en proportion du volume : on ne lui ajoute pas des cm³.' },
    { label: `${m1} g`, why: 'Un volume plus grand de la même substance a une masse plus grande.' },
    { label: `${m1 * (facteur + 1)} g`, why: `Le volume est multiplié par ${facteur}, pas par ${facteur + 1}.` },
  ]);
  return {
    prompt: `${v1} cm³ de la substance ${subst(rng)} ont une masse de ${m1} g. Quelle est la masse de ${v2} cm³ de la même substance ?`,
    answer,
    traps: t,
    hint: 'Combien de fois le nouveau volume contient-il l’ancien ?',
    steps: [
      `${v2} = ${facteur} × ${v1} : le volume est multiplié par ${facteur}.`,
      'La masse est proportionnelle au volume : on multiplie la masse par le même nombre.',
      `${facteur} × ${m1} = **${bon} g**.`,
    ],
    targetSeconds: 40,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = subst(rng);
  if (rng.int(0, 1) === 0) {
    const k = rng.int(2, 9);
    const v = rng.int(3, 25);
    const m = k * v;
    return {
      prompt: `${v} cm³ de la substance ${s} ont une masse de ${m} g. Quelle est sa masse volumique, c’est-à-dire la masse de 1 cm³, en grammes ?`,
      answer: num(k, 'g'),
      traps: traps(r(k), [
        [m * v, 'Un seul cm³ a une masse plus petite que celle de tout l’échantillon : on partage la masse.'],
        [m - v, 'On partage la masse entre les cm³ : on divise, on ne soustrait pas.'],
      ]),
      hint: 'Partage la masse entre tous les cm³.',
      steps: [`${v} cm³ → ${m} g.`, `Pour 1 cm³, on divise par ${v} : ${m} ÷ ${v} = **${k} g**.`],
      targetSeconds: 45,
    };
  }
  const un = dec(dixiemes(rng), 1);
  const v = rng.int(2, 10) * 10;
  const m = mul(un, r(v));
  return {
    prompt: `1 cm³ de la substance ${s} a une masse de ${show(un)} g. Quelle est la masse d’un objet de ${v} cm³ fait de cette substance, en grammes ?`,
    answer: num(m, 'g'),
    traps: traps(m, [
      [r(v), 'C’est le nombre de cm³ : chacun n’a pas une masse de 1 g ici.'],
      [
        dec(v * 10 + un.n * (10 / un.d), 1),
        'On multiplie la masse de 1 cm³ par le nombre de cm³ (on n’additionne pas).',
      ],
    ]),
    hint: 'La masse d’un cm³ est donnée : combien de cm³ y a-t-il ?',
    steps: [`1 cm³ → ${show(un)} g.`, `${v} cm³ → ${v} × ${show(un)} = **${show(m)} g**.`],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const k = rng.int(2, 9);
    const v0 = rng.int(3, 8) * 10;
    const v = rng.int(2, 12);
    const m = k * v;
    return {
      prompt: `Un objet a une masse de ${m} g. Dans une éprouvette, l’eau passe de ${v0} mL à ${v0 + v} mL quand on l’immerge (1 mL = 1 cm³). Quelle est la masse de 1 cm³ de sa substance, en grammes ?`,
      answer: num(k, 'g'),
      traps: traps(r(k), [
        [m * v, 'Un seul cm³ a une masse plus petite que celle de l’objet entier : on partage la masse.'],
        [v, 'C’est le volume de l’objet. Il faut ensuite partager sa masse entre ces cm³.'],
      ]),
      hint: 'Le volume de l’objet est la différence entre les deux lectures.',
      steps: [
        `Volume de l’objet (déplacement d’eau) : ${v0 + v} − ${v0} = ${v} mL, soit ${v} cm³.`,
        `${v} cm³ → ${m} g.`,
        `1 cm³ → ${m} ÷ ${v} = **${k} g**.`,
      ],
      targetSeconds: 75,
    };
  }
  if (type === 1) {
    const un = dec(rng.pick([8, 12, 15, 25]), 1);
    const v = rng.int(2, 20) * 10;
    const m = mul(un, r(v));
    return {
      prompt: `1 cm³ d’un liquide a une masse de ${show(un)} g. Quel volume, en cm³, faut-il prélever pour en avoir ${show(m)} g ?`,
      answer: num(v, 'cm³'),
      traps: traps(r(v), [
        [mul(un, m), 'Cherche combien de fois la masse de 1 cm³ est contenue dans la masse voulue : on divise.'],
        [m, 'Le nombre de grammes n’est égal au nombre de cm³ que si 1 cm³ a une masse de 1 g.'],
      ]),
      hint: 'Combien de fois la masse de 1 cm³ « rentre »-t-elle dans la masse voulue ?',
      steps: [
        `Chaque cm³ apporte ${show(un)} g.`,
        `Nombre de cm³ : ${show(m)} ÷ ${show(un)} = ${v}, soit **${v} cm³**.`,
      ],
      targetSeconds: 75,
    };
  }
  const sens = rng.pick([
    { event: 'On chauffe un liquide sans perte de matière : sa masse reste la même, son volume augmente.', up: false },
    { event: 'On refroidit un liquide sans perte de matière : sa masse reste la même, son volume diminue.', up: true },
  ]);
  const bon = sens.up ? 'augmente' : 'diminue';
  return {
    prompt: `${sens.event} Que devient la masse de 1 cm³ de ce liquide (sa masse volumique) ? Complète la phrase.`,
    answer: {
      kind: 'cloze',
      parts: ['La masse de 1 cm³ de ce liquide ', '.'],
      blanks: [{ mode: 'list', options: ['augmente', 'diminue', 'reste la même'], correct: sens.up ? 0 : 1 }],
    },
    hint: 'La même masse occupe un volume différent.',
    steps: [
      `La même masse occupe un volume plus ${sens.up ? 'petit' : 'grand'}.`,
      `Chaque cm³ en reçoit donc une part plus ${sens.up ? 'grande' : 'petite'}.`,
      `La masse de 1 cm³ **${bon}** : la masse volumique dépend de la température.`,
    ],
    targetSeconds: 50,
  };
};

/** Substances de référence fictives : masse de 1 cm³ en dixièmes de gramme (données de l'exercice). */
const REFERENCES: readonly { nom: string; d: number }[] = [
  { nom: 'A', d: 27 },
  { nom: 'B', d: 45 },
  { nom: 'C', d: 78 },
  { nom: 'D', d: 89 },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const cible = rng.pick(REFERENCES);
  const v = rng.int(1, 5) * 10;
  const v0 = rng.int(3, 7) * 10;
  const m = mul(dec(cible.d, 1), r(v));
  const { answer, traps: t } = choice(
    rng,
    `Substance ${cible.nom}`,
    REFERENCES.filter((x) => x !== cible).map((x) => ({
      label: `Substance ${x.nom}`,
      why: `1 cm³ de la substance ${x.nom} a une masse de ${show(dec(x.d, 1))} g : ce n’est pas ce que l’on trouve pour l’objet.`,
    })),
    true,
  );
  return {
    prompt: 'Lis le document. De quelle substance de référence l’objet est-il fait ?',
    figure: {
      kind: 'document',
      title: 'Compte rendu de mesure (données de l’exercice)',
      lines: [
        ...REFERENCES.map((x) => `Substance ${x.nom} : 1 cm³ a une masse de ${show(dec(x.d, 1))} g.`),
        `Masse de l’objet : ${show(m)} g.`,
        `Éprouvette : ${v0} mL avant immersion, ${v0 + v} mL après (1 mL = 1 cm³).`,
      ],
    },
    answer,
    traps: t,
    hint: 'Trouve d’abord le volume de l’objet, puis la masse de 1 cm³ de sa substance.',
    steps: [
      `Volume : ${v0 + v} − ${v0} = ${v} cm³.`,
      `${v} cm³ → ${show(m)} g, donc 1 cm³ → ${show(m)} ÷ ${v} = ${show(dec(cible.d, 1))} g.`,
      `La mesure correspond à la **substance ${cible.nom}**.`,
    ],
    targetSeconds: 110,
  };
};

export const masseVolumique: Skill = {
  id: 'p5-masse-volumique',
  title: 'La masse volumique',
  levels: 5,
  version: 2,
  advice: 'brouillon',
  lesson: {
    memo: [
      'La **masse volumique** d’une substance est la masse de 1 cm³ de cette substance : par exemple, 1 cm³ a une masse de 2 g.',
      'Pour une même substance, la masse est proportionnelle au volume : 2 fois plus de volume, 2 fois plus de masse. Pour reconnaître une substance, cherche la masse de 1 cm³.',
      'La masse volumique dépend de la température.',
    ],
    ...references(
      'masse-volumique',
      'masse-volumique-mesure',
      'masse-volumique-especes',
      'masse-volumique-temperature',
      'proportionnalite',
      'volume-deplacement',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
