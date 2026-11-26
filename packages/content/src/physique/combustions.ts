import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-atomes.ts';

// ——— Les combustions (4e) ———

const FEUX = [
  { phrase: 'Un morceau de charbon brûle dans l’air.', combustible: 'Le charbon' },
  { phrase: 'Du bois brûle dans une cheminée.', combustible: 'Le bois' },
  { phrase: 'Le méthane brûle dans une gazinière.', combustible: 'Le méthane' },
  { phrase: 'Du dihydrogène brûle dans l’air.', combustible: 'Le dihydrogène' },
] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(FEUX);
  const { answer, traps: t } = choice(rng, f.combustible, [
    { label: 'Le dioxygène de l’air', why: 'Le dioxygène permet la combustion : c’est le comburant.' },
    { label: 'La chaleur', why: 'La chaleur est dégagée par la combustion : ce n’est pas une substance.' },
  ]);
  return {
    prompt: `${f.phrase} Quel est le combustible ?`,
    answer,
    traps: t,
    hint: 'Le combustible est la matière qui brûle et produit de la chaleur.',
    steps: ['Le combustible est la matière dont la combustion produit de la chaleur.', `**${f.combustible}**.`],
    targetSeconds: 25,
  };
};

type Role = 'Le combustible' | 'Le comburant' | 'Un produit' | 'Ce n’est pas une substance';

const CAS: readonly { reaction: string; element: string; role: Role }[] = [
  {
    reaction: 'Le carbone brûle dans le dioxygène et forme du dioxyde de carbone.',
    element: 'le carbone',
    role: 'Le combustible',
  },
  {
    reaction: 'Le carbone brûle dans le dioxygène et forme du dioxyde de carbone.',
    element: 'le dioxygène',
    role: 'Le comburant',
  },
  {
    reaction: 'Le carbone brûle dans le dioxygène et forme du dioxyde de carbone.',
    element: 'le dioxyde de carbone',
    role: 'Un produit',
  },
  {
    reaction: 'Le dihydrogène brûle dans le dioxygène et forme de l’eau.',
    element: 'le dihydrogène',
    role: 'Le combustible',
  },
  {
    reaction: 'Le dihydrogène brûle dans le dioxygène et forme de l’eau.',
    element: 'le dioxygène',
    role: 'Le comburant',
  },
  { reaction: 'Le dihydrogène brûle dans le dioxygène et forme de l’eau.', element: 'l’eau', role: 'Un produit' },
  {
    reaction: 'Le carbone brûle dans le dioxygène et dégage de la chaleur.',
    element: 'la chaleur',
    role: 'Ce n’est pas une substance',
  },
  {
    reaction: 'Le dihydrogène brûle dans le dioxygène et dégage de la chaleur.',
    element: 'la chaleur',
    role: 'Ce n’est pas une substance',
  },
];

const POURQUOI: Readonly<Record<Role, string>> = {
  'Le combustible': 'Le combustible est la matière qui brûle.',
  'Le comburant': 'Le comburant est le corps qui, en se combinant avec un autre, permet sa combustion.',
  'Un produit': 'Un produit se forme pendant la combustion.',
  'Ce n’est pas une substance': 'Ici, il s’agit bien d’une matière qui participe à la combustion.',
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  const { answer, traps: t } = choice(
    rng,
    c.role,
    (Object.keys(POURQUOI) as Role[]).filter((k) => k !== c.role).map((label) => ({ label, why: POURQUOI[label] })),
  );
  return {
    prompt: `${c.reaction} Quel est le rôle de ${c.element} ?`,
    answer,
    traps: t,
    hint: 'Qu’est-ce qui brûle ? Qu’est-ce qui permet de brûler ? Qu’est-ce qui se forme ?',
    steps: [
      'Combustible : ce qui brûle. Comburant : ce qui permet de brûler. Produit : ce qui se forme.',
      `${c.element.charAt(0).toUpperCase() + c.element.slice(1)} : **${c.role.toLowerCase()}**.`,
    ],
    targetSeconds: 35,
  };
};

const SAISIES = [
  {
    question: 'Le carbone brûle complètement dans l’air. Quel gaz se forme ? Écris son nom ou sa formule.',
    accepted: ['dioxyde de carbone', 'le dioxyde de carbone', 'CO2', 'CO₂', 'gaz carbonique'],
    erreurs: [
      ['monoxyde de carbone', 'Le monoxyde de carbone se forme quand la combustion est incomplète.'],
      ['dioxygène', 'Le dioxygène est le comburant, il est consommé.'],
    ],
    reponse: 'dioxyde de carbone',
  },
  {
    question:
      'Une combustion incomplète peut dégager un gaz très toxique, incolore et inodore. Écris son nom ou sa formule.',
    accepted: ['monoxyde de carbone', 'le monoxyde de carbone', 'CO', 'oxyde de carbone'],
    erreurs: [
      ['dioxyde de carbone', 'Le dioxyde de carbone vient de la combustion complète du carbone.'],
      ['dioxygène', 'Le dioxygène est le comburant des combustions dans l’air.'],
    ],
    reponse: 'monoxyde de carbone',
  },
  {
    question: 'Dans les combustions qui ont lieu dans l’air, quel gaz joue le rôle de comburant ?',
    accepted: ['dioxygène', 'le dioxygène', 'oxygène', 'l’oxygène', 'dioxygene', 'oxygene', 'O2', 'O₂'],
    erreurs: [
      ['diazote', 'L’air contient surtout du diazote, mais c’est l’oxygène de l’air qui permet la combustion.'],
      ['dioxyde de carbone', 'Le dioxyde de carbone est un produit de la combustion du carbone.'],
    ],
    reponse: 'dioxygène',
  },
  {
    question: 'Le dihydrogène brûle dans le dioxygène. Quelle substance se forme ? Écris son nom ou sa formule.',
    accepted: ['eau', 'l’eau', 'de l’eau', 'H2O', 'H₂O'],
    erreurs: [
      ['dioxyde de carbone', 'Il n’y a pas de carbone parmi les réactifs.'],
      ['dihydrogène', 'Le dihydrogène est le combustible : il est consommé.'],
    ],
    reponse: 'eau',
  },
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const q = rng.pick(SAISIES);
  const { answer, traps: t } = saisie(q.accepted, q.erreurs);
  return {
    prompt: q.question,
    answer,
    traps: t,
    hint: 'Repère le combustible, le comburant et ce qui se forme.',
    steps: ['Une combustion associe un combustible et un comburant et forme des produits.', `**${q.reponse}**.`],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const v = rng.int(2, 20) * 5;
    const o = v / 5;
    return {
      prompt: `L’air contient environ un cinquième de dioxygène. Combien de litres de dioxygène y a-t-il à peu près dans ${v} L d’air ?`,
      answer: num(o, 'L'),
      traps: traps(r(o), [
        [v - o, 'C’est le reste de l’air : on demande le dioxygène, un cinquième.'],
        [v * 5, 'Un cinquième se calcule en divisant par 5, pas en multipliant.'],
        [v, 'L’air ne contient pas que du dioxygène.'],
      ]),
      hint: 'Un cinquième : partage le volume d’air en 5 parts égales.',
      steps: ['Un cinquième revient à diviser par 5.', `${v} ÷ 5 = **${o} L**.`],
      targetSeconds: 50,
    };
  }
  return {
    prompt: 'Associe chacun de ces cinq mots à sa description.',
    answer: association(rng, [
      ['Combustible', 'Matière dont la combustion produit de la chaleur'],
      ['Comburant', 'Corps qui permet la combustion en se combinant avec un autre'],
      ['Dioxyde de carbone', 'Produit de la combustion complète du carbone'],
      ['Monoxyde de carbone', 'Gaz très toxique d’une combustion incomplète'],
      ['Eau', 'Produit de la combustion du dihydrogène'],
    ]),
    hint: 'Commence par les produits : chacun dépend du combustible et de la façon dont il brûle.',
    steps: [
      'Combustible et comburant sont les réactifs ; les autres mots désignent des produits.',
      'Réponse : **combustible → produit de la chaleur ; comburant → permet la combustion ; dioxyde de carbone → combustion complète du carbone ; monoxyde de carbone → toxique, combustion incomplète ; eau → combustion du dihydrogène**.',
    ],
    targetSeconds: 75,
  };
};

const BOCAUX = [
  { reste: 'Il reste du carbone, mais plus de dioxygène.', bon: 'Le comburant est épuisé' },
  { reste: 'Il reste du dioxygène, mais plus de carbone.', bon: 'Le combustible est épuisé' },
  {
    reste: 'Il ne reste ni carbone ni dioxygène.',
    bon: 'Le combustible et le comburant sont tous deux épuisés',
  },
] as const;

const RAISONS = [
  'Le comburant est épuisé',
  'Le combustible est épuisé',
  'Le combustible et le comburant sont tous deux épuisés',
  'La masse des réactifs a été détruite',
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const b = rng.pick(BOCAUX);
  const k = rng.int(2, 9);
  const { answer, traps: t } = choice(
    rng,
    b.bon,
    RAISONS.filter((x) => x !== b.bon).map((label) => ({
      label,
      why:
        label === 'La masse des réactifs a été détruite'
          ? 'La matière ne disparaît pas : les atomes se redistribuent dans les produits.'
          : 'Regarde ce qui reste dans le bocal à la fin.',
    })),
  );
  return {
    prompt: 'Lis le compte rendu. Pourquoi la combustion s’est-elle arrêtée ?',
    figure: {
      kind: 'document',
      title: 'Compte rendu d’expérience (données de l’exercice)',
      lines: [
        `On enflamme ${k} g de carbone dans un bocal fermé contenant du dioxygène.`,
        'La combustion s’arrête au bout d’un moment.',
        b.reste,
      ],
    },
    answer,
    traps: t,
    hint: 'Une combustion a besoin à la fois d’un combustible et d’un comburant.',
    steps: [
      'La combustion cesse quand un des réactifs manque.',
      `D’après le compte rendu : **${b.bon.toLowerCase()}**.`,
    ],
    targetSeconds: 100,
  };
};

export const combustions: Skill = {
  id: 'p4-combustions',
  title: 'Les combustions',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Une **combustion** est une transformation chimique qui dégage de la chaleur : un **combustible** (bois, charbon, méthane) réagit avec un **comburant**, le plus souvent le dioxygène de l’air.',
      'La combustion complète du carbone forme du dioxyde de carbone ; celle du dihydrogène forme de l’eau.',
      'Une combustion incomplète peut dégager du monoxyde de carbone, un gaz très toxique sans couleur ni odeur.',
    ],
    ...references(
      'combustions-programme',
      'combustion',
      'comburant',
      'combustible',
      'air-oxygene',
      'co2-complete',
      'eau-combinaison',
      'formule-monoxyde',
      'formule-eau',
      'formule-dioxyde',
      'redistribution',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
