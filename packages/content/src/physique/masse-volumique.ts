import { choice, num, traps } from '../build.ts';
import { dec, fmt, mul, r, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-matiere.ts';

// ——— Masse volumique : proportionnalité masse-volume, relation m = ρ × V (5e) ———

/** Masse volumique « ronde » en dixièmes de g/cm³ (substance fictive, donnée de l'exercice). */
const rho10 = (rng: Rng) => rng.pick([8, 12, 15, 25, 27, 45, 78, 89]);
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
        why: 'La masse volumique donne la masse d’une unité de volume, pas le volume d’une unité de masse.',
      },
      {
        label: `Tout objet fait de cette substance pèse ${k} g`,
        why: 'La masse d’un objet dépend de son volume : seule la masse d’une unité de volume est fixée.',
      },
    ]);
    return {
      prompt: `La substance ${s} a une masse volumique de ${k} g/cm³. Que signifie cette phrase ?`,
      answer,
      traps: t,
      hint: '« Volumique » : pour une unité de volume.',
      steps: ['La masse volumique est la masse de l’unité de volume.', `Donc **${bon}**.`],
      targetSeconds: 30,
    };
  }
  const v = rng.int(2, 6);
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
    const d = rho10(rng);
    const v = rng.int(2, 10) * 10;
    const rho = dec(d, 1);
    const m = mul(rho, r(v));
    return {
      prompt: `La substance ${s} a une masse volumique de ${show(rho)} g/cm³. Quelle est la masse d’un objet de ${v} cm³ fait de cette substance, en grammes ?`,
      answer: num(m, 'g'),
      traps: traps(m, [
        [r(v), 'C’est le volume, pas la masse : il faut multiplier par la masse volumique.'],
        [dec(v * 10 + d, 1), 'On multiplie la masse volumique par le volume (on n’additionne pas).'],
      ]),
      hint: 'La masse d’un cm³ est donnée : combien de cm³ y a-t-il ?',
      steps: ['m = ρ × V.', `m = ${show(rho)} × ${v} = **${show(m)} g**.`],
      targetSeconds: 45,
    };
  }
  const rho = rng.int(2, 9);
  const v = rng.int(3, 25);
  const m = rho * v;
  return {
    prompt: `Un échantillon de la substance ${s} a une masse de ${m} g pour un volume de ${v} cm³. Quelle est la masse volumique, en g/cm³ ?`,
    answer: num(rho, 'g/cm³'),
    traps: traps(r(rho), [
      [m * v, 'On divise la masse par le volume : ρ = m ÷ V (pas m × V).'],
      [m - v, 'La masse d’un cm³ se trouve par un partage : on divise, on ne soustrait pas.'],
    ]),
    hint: 'Combien de grammes pour un seul cm³ ?',
    steps: ['ρ = m ÷ V : on cherche la masse d’un cm³.', `ρ = ${m} ÷ ${v} = **${rho} g/cm³**.`],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const rho = rng.int(2, 9);
    const v0 = rng.int(3, 8) * 10;
    const v = rng.int(2, 12);
    const m = rho * v;
    return {
      prompt: `Un objet a une masse de ${m} g. Dans une éprouvette, l’eau passe de ${v0} mL à ${v0 + v} mL quand on l’immerge. Quelle est sa masse volumique, en g/mL ?`,
      answer: num(rho, 'g/mL'),
      traps: traps(r(rho), [
        [m * v, 'Il faut diviser la masse par le volume, pas multiplier.'],
        [v, 'C’est le volume de l’objet. Il faut ensuite diviser sa masse par ce volume.'],
      ]),
      hint: 'Le volume de l’objet est la différence entre les deux lectures.',
      steps: [
        `Volume de l’objet (déplacement d’eau) : ${v0 + v} − ${v0} = ${v} mL.`,
        'ρ = m ÷ V.',
        `ρ = ${m} ÷ ${v} = **${rho} g/mL**.`,
      ],
      targetSeconds: 75,
    };
  }
  if (type === 1) {
    const d = rng.pick([8, 12, 15, 25]);
    const v = rng.int(2, 20) * 10;
    const rho = dec(d, 1);
    const m = mul(rho, r(v));
    return {
      prompt: `Un liquide a une masse volumique de ${show(rho)} g/cm³. Quel volume, en cm³, faut-il prélever pour en avoir ${show(m)} g ?`,
      answer: num(v, 'cm³'),
      traps: traps(r(v), [
        [mul(rho, m), 'Pour trouver un volume, on divise la masse par la masse volumique : V = m ÷ ρ.'],
        [m, 'La masse n’est pas égale au volume quand ρ n’est pas 1 g/cm³.'],
      ]),
      hint: 'Dans m = ρ × V, quelle opération donne V ?',
      steps: ['m = ρ × V, donc V = m ÷ ρ.', `V = ${show(m)} ÷ ${show(rho)} = **${v} cm³**.`],
      targetSeconds: 75,
    };
  }
  const sens = rng.pick([
    { event: 'On chauffe un liquide sans perte de matière : sa masse reste la même, son volume augmente.', up: false },
    { event: 'On refroidit un liquide sans perte de matière : sa masse reste la même, son volume diminue.', up: true },
  ]);
  const bon = sens.up ? 'augmente' : 'diminue';
  return {
    prompt: `${sens.event} Sa masse volumique augmente-t-elle, diminue-t-elle ou reste-t-elle la même ? Complète la phrase.`,
    answer: {
      kind: 'cloze',
      parts: ['La masse volumique ', '.'],
      blanks: [{ mode: 'list', options: ['augmente', 'diminue', 'reste la même'], correct: sens.up ? 0 : 1 }],
    },
    hint: 'La même masse est répartie dans un volume différent.',
    steps: [
      'ρ = m ÷ V, avec la masse inchangée.',
      sens.up ? 'On divise par un volume plus petit.' : 'On divise par un volume plus grand.',
      `La masse volumique **${bon}** : elle dépend de la température.`,
    ],
    targetSeconds: 50,
  };
};

/** Substances de référence fictives (g/cm³, données de l'exercice). */
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
      why: `La substance ${x.nom} a une masse volumique de ${show(dec(x.d, 1))} g/cm³ : ce n’est pas la valeur calculée.`,
    })),
    true,
  );
  return {
    prompt: 'Lis le document. De quelle substance de référence l’objet est-il fait ?',
    figure: {
      kind: 'document',
      title: 'Compte rendu de mesure (données de l’exercice)',
      lines: [
        ...REFERENCES.map((x) => `Substance ${x.nom} : masse volumique ${show(dec(x.d, 1))} g/cm³.`),
        `Masse de l’objet : ${show(m)} g.`,
        `Éprouvette : ${v0} mL avant immersion, ${v0 + v} mL après (1 mL = 1 cm³).`,
      ],
    },
    answer,
    traps: t,
    hint: 'Trouve d’abord le volume de l’objet, puis calcule sa masse volumique.',
    steps: [
      `Volume : ${v0 + v} − ${v0} = ${v} cm³.`,
      `ρ = ${show(m)} ÷ ${v} = ${show(dec(cible.d, 1))} g/cm³.`,
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
      'La **masse volumique** ρ est la masse d’une unité de volume : 2 g/cm³ veut dire que 1 cm³ a une masse de 2 g.',
      'Pour une même substance, masse et volume sont proportionnels : m = ρ × V, donc ρ = m ÷ V et V = m ÷ ρ.',
      'Elle aide à reconnaître une substance et dépend de la température.',
    ],
    ...references(
      'masse-volumique',
      'masse-volumique-mesure',
      'masse-volumique-especes',
      'masse-volumique-temperature',
      'proportionnalite',
      'quotient-4e',
      'volume-deplacement',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
