import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, maj } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { MOLECULES, composition, compte, references, total } from './donnees-atomes.ts';

// ——— Atomes et molécules (4e) ———

const niveau1 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MOLECULES);
  const { answer, traps: t } = choice(rng, 'D’atomes assemblés', [
    {
      label: 'De plusieurs liquides mélangés',
      why: 'Un mélange réunit plusieurs corps ; une molécule est une association d’atomes liés.',
    },
    {
      label: 'De très petites gouttes du corps',
      why: 'Une goutte contient un très grand nombre de molécules ; une molécule est faite d’atomes.',
    },
  ]);
  return {
    prompt: `De quoi une molécule ${m.de} est-elle constituée ?`,
    answer,
    traps: t,
    hint: 'Pense aux particules qui s’assemblent pour former les molécules.',
    steps: ['Une molécule est une association d’atomes.', 'Elle est constituée **d’atomes assemblés**.'],
    targetSeconds: 25,
  };
};

const MODELES = [
  { texte: 'un seul atome d’oxygène, isolé', bon: 'Un atome seul' },
  { texte: 'deux atomes d’oxygène liés entre eux', bon: 'Une molécule faite d’atomes identiques' },
  { texte: 'deux atomes d’hydrogène liés entre eux', bon: 'Une molécule faite d’atomes identiques' },
  {
    texte: 'un atome d’oxygène lié à deux atomes d’hydrogène',
    bon: 'Une molécule faite d’atomes différents',
  },
  {
    texte: 'un atome de carbone lié à quatre atomes d’hydrogène',
    bon: 'Une molécule faite d’atomes différents',
  },
  { texte: 'un seul atome de carbone, isolé', bon: 'Un atome seul' },
  {
    texte: 'deux groupes séparés, chacun formé de deux atomes d’oxygène liés',
    bon: 'Deux molécules identiques',
  },
  {
    texte: 'deux groupes séparés, chacun formé d’un atome d’oxygène lié à deux atomes d’hydrogène',
    bon: 'Deux molécules identiques',
  },
] as const;

const POURQUOI: Readonly<Record<(typeof MODELES)[number]['bon'], string>> = {
  'Un atome seul': 'Un atome seul n’est lié à aucun autre : ce n’est pas une association d’atomes.',
  'Une molécule faite d’atomes identiques': 'Il faut un seul groupe d’atomes liés, tous de la même sorte.',
  'Une molécule faite d’atomes différents': 'Il faut un seul groupe d’atomes liés, de plusieurs sortes.',
  'Deux molécules identiques': 'Il faut deux groupes séparés, composés des mêmes atomes.',
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const modele = rng.pick(MODELES);
  const { answer, traps: t } = choice(
    rng,
    modele.bon,
    (Object.keys(POURQUOI) as (typeof MODELES)[number]['bon'][])
      .filter((label) => label !== modele.bon)
      .map((label) => ({ label, why: POURQUOI[label] })),
  );
  return {
    prompt: `Un modèle montre ${modele.texte}. Que représente-t-il ?`,
    answer,
    traps: t,
    hint: 'Compte les groupes séparés, puis regarde si les atomes d’un groupe sont de la même sorte.',
    steps: [
      'Une molécule est un groupe d’atomes liés ; les atomes d’un corps simple sont semblables.',
      `**${modele.bon}**.`,
    ],
    targetSeconds: 35,
  };
};

const COMPOSEES = MOLECULES.filter((m) => m.atomes.length > 1);

const niveau3 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(COMPOSEES);
  const n = total(m);
  return {
    prompt: `Une molécule ${m.de} est formée de ${composition(m)}. Combien d’atomes contient-elle en tout ?`,
    answer: num(n),
    traps: traps(r(n), [
      [m.atomes.length, 'Tu as compté les sortes d’atomes : il faut compter tous les atomes.'],
      [1, 'Une molécule est un seul groupe, mais elle contient plusieurs atomes.'],
    ]),
    hint: 'Additionne les nombres d’atomes de chaque sorte.',
    steps: [`On additionne les atomes : ${m.atomes.map(([, k]) => k).join(' + ')}.`, `Total : **${n}** atomes.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const cinq = rng.shuffle(MOLECULES).slice(0, 5);
  return {
    prompt: `Associe chaque molécule à sa composition en atomes : ${cinq
      .map((m) => m.nom)
      .sort()
      .join(', ')}.`,
    answer: association(
      rng,
      cinq.map((m) => [maj(m.nom), composition(m)] as const),
    ),
    hint: 'Les préfixes aident : « di » veut dire deux, « mono » un seul.',
    steps: [
      'Le nom donne souvent un indice sur le nombre d’atomes.',
      `Réponse : ${cinq.map((m) => `**${m.nom}** → ${composition(m)}`).join(' ; ')}.`,
    ],
    targetSeconds: 80,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const [a, b] = rng.shuffle(MOLECULES.filter((m) => compte(m, 'O') > 0)).slice(0, 2) as [
    (typeof MOLECULES)[number],
    (typeof MOLECULES)[number],
  ];
  const x = rng.int(2, 6);
  const y = rng.int(2, 6);
  const n = x * compte(a, 'O') + y * compte(b, 'O');
  return {
    prompt: 'Lis la description du flacon. Combien d’atomes d’oxygène contient-il en tout ?',
    figure: {
      kind: 'document',
      title: 'Modèle d’un flacon fermé (données de l’exercice)',
      lines: [
        `Il contient ${x} molécules ${a.de} et ${y} molécules ${b.de}.`,
        `Une molécule ${a.de} : ${composition(a)}.`,
        `Une molécule ${b.de} : ${composition(b)}.`,
      ],
    },
    answer: num(n),
    traps: traps(r(n), [
      [x + y, 'C’est le nombre de molécules : on demande les atomes d’oxygène.'],
      [compte(a, 'O') + compte(b, 'O'), 'Il faut multiplier par le nombre de molécules de chaque sorte.'],
      [x * total(a) + y * total(b), 'Tu as compté tous les atomes : seuls ceux d’oxygène sont demandés.'],
    ]),
    hint: 'Calcule les atomes d’oxygène de chaque sorte de molécule, puis additionne.',
    steps: [
      `Pour chaque sorte : ${x} × ${compte(a, 'O')} = ${x * compte(a, 'O')} et ${y} × ${compte(b, 'O')} = ${y * compte(b, 'O')}.`,
      `Total : **${n}** atomes d’oxygène.`,
    ],
    targetSeconds: 100,
  };
};

export const atomesMolecules: Skill = {
  id: 'p4-atomes-molecules',
  title: 'Atomes et molécules',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Une **molécule** est une association d’**atomes** liés entre eux.',
      'Dans un corps simple, les atomes de la molécule sont semblables (le dioxygène : 2 atomes d’oxygène). L’eau, elle, réunit 2 atomes d’hydrogène et 1 atome d’oxygène.',
    ],
    ...references(
      'notions',
      'atome-molecules',
      'atome-partie',
      'molecule-association',
      'molecule-simple',
      'molecule-eau',
      'deux-atomes',
      'formule-dioxyde',
      'formule-methane',
      'formule-protoxyde',
      'formule-monoxyde',
      'formule-eau',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
