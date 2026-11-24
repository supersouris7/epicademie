import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Développement et croissance : étapes d’un cycle de vie et formes associées (programme du cycle 3) ———

interface Mot {
  readonly mot: string;
  readonly accepte: readonly string[];
  readonly sens: string;
  readonly scene: string;
  readonly question: string;
}

const MOTS: readonly Mot[] = [
  {
    mot: 'la germination',
    accepte: ['germination', 'la germination'],
    sens: 'le moment où la graine développe sa jeune plante',
    scene: 'Dans le coton humide, une graine de haricot se réveille et développe une nouvelle plante.',
    question: 'Comment s’appelle ce moment ?',
  },
  {
    mot: 'la plantule',
    accepte: ['plantule', 'la plantule', 'une plantule'],
    sens: 'la jeune plante qui sort de la graine',
    scene: 'Une toute jeune plante, avec ses premières feuilles, est sortie de la graine.',
    question: 'Comment s’appelle cette jeune plante ?',
  },
  {
    mot: 'le têtard',
    accepte: ['têtard', 'le têtard', 'un têtard', 'tetard', 'le tetard'],
    sens: 'la larve de la grenouille',
    scene: 'Dans la mare, un petit de grenouille nage avec une grosse tête et ne vit que dans l’eau.',
    question: 'Comment s’appelle ce petit ?',
  },
  {
    mot: 'la chenille',
    accepte: ['chenille', 'la chenille', 'une chenille'],
    sens: 'la larve du papillon',
    scene: 'Sur une feuille, une larve de papillon au corps allongé, formé d’anneaux, grignote.',
    question: 'Comment s’appelle cette larve ?',
  },
  {
    mot: 'la chrysalide',
    accepte: ['chrysalide', 'la chrysalide', 'une chrysalide'],
    sens: 'l’état entre la chenille et le papillon',
    scene: 'Avant de devenir un papillon, la chenille passe par un état intermédiaire.',
    question: 'Comment s’appelle cet état ?',
  },
  {
    mot: 'le fruit',
    accepte: ['fruit', 'le fruit', 'un fruit'],
    sens: 'ce que la plante produit après la fleur',
    scene: 'La fleur du pommier a disparu. À sa place, la plante a produit quelque chose qui grossit.',
    question: 'Comment s’appelle ce qui grossit ?',
  },
];

function motDe(nom: string): Mot {
  const m = MOTS.find((x) => x.accepte[0] === nom);
  if (!m) throw new Error(`Mot inconnu : ${nom}`);
  return m;
}

const faux = (m: Mot) => ({ label: m.mot, why: `${maj(m.mot)}, c’est ${m.sens}. Relis la scène.` });

const niveau1 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOTS);
  const { answer, traps: tr } = choice(
    rng,
    m.mot,
    rng
      .shuffle(MOTS.filter((x) => x !== m))
      .slice(0, 2)
      .map(faux),
  );
  return {
    prompt: `${m.scene} ${m.question}`,
    answer,
    traps: tr,
    hint: 'Plante ou animal ? Élimine d’abord les mots qui ne conviennent pas.',
    steps: ['Chaque forme du cycle de vie porte un nom.', `La scène montre ${m.sens}.`, `C’est **${m.mot}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(MOTS).slice(0, 3);
    return {
      prompt: `Associe chaque mot à son sens : ${trois.map((m) => m.mot).join(', ')}.`,
      answer: association(
        rng,
        trois.map((m) => [m.mot, maj(m.sens)] as const),
      ),
      hint: 'Commence par le mot que tu connais le mieux.',
      steps: [...trois.map((m) => `${maj(m.mot)} : ${m.sens}.`), 'Chaque mot est relié à **son** sens.'],
      targetSeconds: 45,
    };
  }
  const m = rng.pick(MOTS);
  const { answer, traps: tr } = choice(
    rng,
    maj(m.sens),
    rng
      .shuffle(MOTS.filter((x) => x !== m))
      .slice(0, 3)
      .map((x) => ({ label: maj(x.sens), why: `Cela décrit ${x.mot}, pas ${m.mot}.` })),
  );
  return {
    prompt: `Dans un cycle de vie, qu’est-ce que ${m.mot} ?`,
    answer,
    traps: tr,
    hint: 'Pense à l’être vivant concerné : plante, grenouille ou papillon ?',
    steps: ['Chaque mot désigne un moment ou une forme précise.', `${maj(m.mot)}, c’est **${m.sens}**.`],
    targetSeconds: 35,
  };
};

const CYCLES: readonly { de: string; etapes: readonly string[] }[] = [
  { de: 'du haricot, en partant de la graine', etapes: ['graine', 'plantule', 'plante fleurie', 'fruit'] },
  { de: 'de la grenouille, en partant de l’œuf', etapes: ['œuf', 'têtard', 'grenouille adulte'] },
  { de: 'du papillon, en partant de l’œuf', etapes: ['œuf', 'chenille', 'chrysalide', 'papillon adulte'] },
  {
    de: 'd’un animal, en partant de la naissance',
    etapes: ['naissance', 'croissance', 'reproduction', 'vieillissement', 'mort'],
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const c = rng.pick(CYCLES);
    return {
      prompt: `Remets dans l’ordre le cycle de vie ${c.de}.`,
      answer: ordre(rng, c.etapes),
      hint: 'Imagine l’être vivant tout petit, puis fais-le grandir.',
      steps: ['Un cycle de vie suit toujours le même ordre.', `Ordre : **${c.etapes.join(' → ')}**.`],
      targetSeconds: 45,
    };
  }
  const m = rng.pick(MOTS);
  const { answer, traps: tr } = saisie(
    m.accepte,
    MOTS.filter((x) => x !== m).map((x) => [x.accepte[0] ?? '', faux(x).why] as const),
  );
  return {
    prompt: `${m.scene} ${m.question} Écris le mot.`,
    answer,
    traps: tr,
    hint: `Le mot commence par « ${(m.accepte[0] ?? '').slice(0, 2)} ».`,
    steps: [`La scène montre ${m.sens}.`, `Le mot est **${m.mot}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cinq = rng.shuffle(MOTS).slice(0, 5);
    return {
      prompt: `Défi sans aide ! Relie chaque sens à son mot : ${cinq.map((m) => m.mot).join(', ')}.`,
      answer: association(
        rng,
        cinq.map((m) => [maj(m.sens), m.mot] as const),
      ),
      hint: 'Sépare d’abord ce qui concerne les plantes de ce qui concerne les animaux.',
      steps: [...cinq.map((m) => `${maj(m.sens)} : ${m.mot}.`), 'Chaque sens est relié à **son** mot.'],
      targetSeconds: 70,
    };
  }
  const cas = rng.pick([
    {
      avant: 'la chenille',
      apres: 'le papillon adulte',
      quoi: 'forme',
      bon: 'chrysalide',
      pieges: ['têtard', 'plantule'] as const,
    },
    {
      avant: 'l’œuf',
      apres: 'la grenouille adulte',
      quoi: 'larve',
      bon: 'têtard',
      pieges: ['chenille', 'chrysalide'] as const,
    },
    {
      avant: 'la graine',
      apres: 'la plante fleurie',
      quoi: 'forme',
      bon: 'plantule',
      pieges: ['fruit', 'chrysalide'] as const,
    },
    {
      avant: 'l’œuf de papillon',
      apres: 'la chrysalide',
      quoi: 'larve',
      bon: 'chenille',
      pieges: ['têtard', 'plantule'] as const,
    },
  ]);
  const juste = motDe(cas.bon);
  const { answer, traps: tr } = saisie(
    juste.accepte,
    cas.pieges.map((p) => [p, `Cette forme ne se place pas entre ${cas.avant} et ${cas.apres}.`] as const),
  );
  return {
    prompt: `Quelle ${cas.quoi} manque entre ${cas.avant} et ${cas.apres} ? Écris son nom.`,
    answer,
    traps: tr,
    hint: 'Récite le cycle de vie dans ta tête, sans sauter d’étape.',
    steps: ['On reconstruit le cycle de vie.', `Entre ${cas.avant} et ${cas.apres}, il y a **${juste.mot}**.`],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const plante = rng.pick(['haricot', 'pois']);
  const h1 = rng.pick([2, 3, 4]);
  const h2 = h1 + rng.pick([5, 6, 7]);
  const h3 = h2 + rng.pick([9, 11, 13]);
  const figure = {
    kind: 'document' as const,
    title: `Journal d’une graine de ${plante} (exemple inventé)`,
    lines: [
      'Jour 1 : la graine est posée sur du coton humide.',
      `Jour 6 : une jeune plante est sortie de la graine. Elle mesure ${h1} cm.`,
      `Jour 10 : la jeune plante, plantée en terre, mesure ${h2} cm.`,
      `Jour 20 : elle mesure ${h3} cm et porte plus de feuilles.`,
    ],
  };
  const sujet = `Lis le journal du ${plante} (${h1} cm, ${h2} cm, ${h3} cm).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `${sujet} De combien de centimètres la plante a-t-elle grandi entre le jour 10 et le jour 20 ?`,
      figure,
      answer: num(h3 - h2, 'cm'),
      traps: traps(r(h3 - h2), [
        [h3, 'C’est la hauteur au jour 20. La croissance est l’écart entre les deux jours.'],
        [h3 - h1, 'Tu es parti du jour 6. La question commence au jour 10.'],
        [h3 + h2, 'On cherche un écart : il faut soustraire.'],
      ]),
      hint: 'Repère les deux hauteurs demandées, puis soustrais.',
      steps: ['La croissance se voit à l’écart de taille.', `${h3} − ${h2}.`, `Elle a grandi de **${h3 - h2} cm**.`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const { answer, traps: tr } = saisie(
      ['plantule', 'la plantule', 'une plantule'],
      [
        ['graine', 'La graine était là au jour 1. Au jour 6, une jeune plante en est sortie.'],
        ['fruit', 'Le fruit vient après la fleur : le journal n’en parle pas.'],
      ],
    );
    return {
      prompt: `${sujet} Quel nom donne-t-on à la jeune plante sortie de la graine au jour 6 ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Le mot ressemble au mot « plante ».',
      steps: ['La graine a germé.', 'La jeune plante issue de la germination s’appelle la **plantule**.'],
      targetSeconds: 45,
    };
  }
  const bon = 'Elle a eu besoin de matière pour fabriquer ses nouvelles parties';
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: 'Elle a grandi sans fabriquer de matière',
      why: 'Plus grande et avec plus de feuilles : il y a plus de matière.',
    },
    {
      label: 'Elle a mangé des petits animaux pour grandir',
      why: 'Ce sont les animaux qui se nourrissent d’autres êtres vivants.',
    },
    { label: 'Elle est devenue un autre être vivant', why: 'Elle reste la même plante : elle a seulement grandi.' },
  ]);
  return {
    prompt: `${sujet} Entre le jour 6 et le jour 20, la plante grandit. Quelle explication est juste ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Pour grandir, un être vivant a besoin de quelque chose pour se construire.',
    steps: [
      'Grandir, c’est la croissance.',
      'La croissance et le développement demandent de la matière.',
      `Explication : **${bon}**.`,
    ],
    targetSeconds: 50,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const developpement: Skill = {
  id: 'vcm1-developpement',
  title: 'Développement et croissance',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **cycle de vie** passe par la naissance, la **croissance** (on grandit), la reproduction, le vieillissement et la mort. Pour grandir, un être vivant a besoin de matière.',
      'La forme change parfois ! Graine → **germination** → **plantule** → plante fleurie. Œuf → **embryon** (il se forme dans l’œuf) → **larve** (têtard, chenille) ou jeune → adulte.',
    ],
    source: `${PROGRAMME} : « les différentes étapes d’un cycle de vie (naissance, croissance, reproduction, vieillissement, mort) et les formes associées (graine-plantule-plante fleurie, œuf-embryon-larve ou jeune-adulte) » ; « le besoin de matière pour la croissance et le développement des êtres vivants » ; définitions : Trésor de la langue française (CNRTL).`,
    sources: [
      PROGRAMME,
      'cnrtl-germination',
      'cnrtl-embryon',
      'cnrtl-plantule',
      'cnrtl-fruit',
      'cnrtl-larve',
      'cnrtl-tetard',
      'cnrtl-chenille',
      'cnrtl-chrysalide',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
