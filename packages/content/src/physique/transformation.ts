import { choice, num, traps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-atomes.ts';

// ——— La transformation chimique (4e) ———

type Type = 'Une transformation chimique' | 'Un mélange' | 'Un changement d’état' | 'Un simple déplacement';

const POURQUOI: Readonly<Record<Type, string>> = {
  'Une transformation chimique': 'Il faudrait que de nouvelles substances se forment.',
  'Un mélange': 'Un mélange réunit des corps qui gardent leurs propriétés, sans nouvelle substance.',
  'Un changement d’état': 'Il faudrait qu’une même substance passe d’un état à un autre.',
  'Un simple déplacement': 'Ici, la matière ne reste pas telle quelle : relis ce qui lui arrive.',
};

const TYPIQUES = [
  { texte: 'Du carbone brûle : il disparaît et un nouveau gaz se forme.', bon: 'Une transformation chimique' },
  { texte: 'Du dihydrogène brûle et il apparaît de l’eau.', bon: 'Une transformation chimique' },
  { texte: 'Un glaçon fond dans un verre.', bon: 'Un changement d’état' },
  { texte: 'De l’eau gèle dans un bac à glaçons.', bon: 'Un changement d’état' },
  { texte: 'On dissout du sel dans de l’eau.', bon: 'Un mélange' },
  { texte: 'On verse du sable dans de l’eau.', bon: 'Un mélange' },
] as const;

const TROIS = ['Une transformation chimique', 'Un changement d’état', 'Un mélange'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  const x = rng.pick(TYPIQUES);
  const { answer, traps: t } = choice(
    rng,
    x.bon,
    TROIS.filter((k) => k !== x.bon).map((label) => ({ label, why: POURQUOI[label] })),
  );
  return {
    prompt: `Observe cette situation typique : « ${x.texte} » Qu’est-ce que c’est ?`,
    answer,
    traps: t,
    hint: 'Une nouvelle substance apparaît-elle ?',
    steps: ['Une transformation chimique change la composition : de nouvelles substances se forment.', `**${x.bon}**.`],
    targetSeconds: 30,
  };
};

const SITUATIONS: readonly { texte: string; type: Type }[] = [
  {
    texte: 'Du carbone brûle dans le dioxygène et du dioxyde de carbone se forme.',
    type: 'Une transformation chimique',
  },
  { texte: 'Du dihydrogène brûle dans le dioxygène et de l’eau se forme.', type: 'Une transformation chimique' },
  { texte: 'On agite du sucre dans de l’eau : on obtient de l’eau sucrée.', type: 'Un mélange' },
  { texte: 'On verse de l’huile dans de l’eau et on agite.', type: 'Un mélange' },
  { texte: 'Un glaçon devient de l’eau liquide.', type: 'Un changement d’état' },
  { texte: 'De la vapeur d’eau devient liquide sur une vitre froide.', type: 'Un changement d’état' },
  { texte: 'On pose un bécher d’eau sur une autre table.', type: 'Un simple déplacement' },
  { texte: 'On range un morceau de carbone dans une boîte.', type: 'Un simple déplacement' },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SITUATIONS);
  const { answer, traps: t } = choice(
    rng,
    s.type,
    (Object.keys(POURQUOI) as Type[]).filter((k) => k !== s.type).map((label) => ({ label, why: POURQUOI[label] })),
  );
  return {
    prompt: `${s.texte} De quoi s’agit-il ?`,
    answer,
    traps: t,
    hint: 'Demande-toi : une nouvelle substance apparaît-elle ? L’état change-t-il ? Plusieurs corps sont-ils réunis ?',
    steps: [
      'Nouvelle substance : transformation chimique. Même substance, autre état : changement d’état. Corps réunis sans nouvelle substance : mélange.',
      `**${s.type}**.`,
    ],
    targetSeconds: 40,
  };
};

const REACTIONS = [
  {
    phrase: 'Le carbone brûle dans le dioxygène : il se forme du dioxyde de carbone.',
    reactifs: ['le carbone', 'le dioxygène'],
    produit: 'le dioxyde de carbone',
  },
  {
    phrase: 'Le dihydrogène brûle dans le dioxygène : il se forme de l’eau.',
    reactifs: ['le dihydrogène', 'le dioxygène'],
    produit: 'l’eau',
  },
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const x = rng.pick(REACTIONS);
  const substance = rng.pick([...x.reactifs, x.produit]);
  const estProduit = substance === x.produit;
  const autre = rng.pick([...x.reactifs, x.produit].filter((s) => s !== substance));
  const autreProduit = autre === x.produit;
  const roles = ['un réactif', 'un produit'];
  return {
    prompt: `${x.phrase} Indique le rôle dans cette réaction : d’abord ${substance}, puis ${autre}.`,
    answer: {
      kind: 'cloze',
      parts: [`Dans cette transformation, ${substance} est `, ` et ${autre} est `, '.'],
      blanks: [
        { mode: 'list', options: roles, correct: estProduit ? 1 : 0 },
        { mode: 'list', options: roles, correct: autreProduit ? 1 : 0 },
      ],
    },
    hint: 'Les réactifs sont présents au départ et disparaissent ; les produits apparaissent.',
    steps: [
      'Les réactifs sont consommés ; les produits se forment.',
      `**${substance}** : ${roles[estProduit ? 1 : 0]} ; **${autre}** : ${roles[autreProduit ? 1 : 0]}.`,
    ],
    targetSeconds: 45,
  };
};

/** Équations fournies dans l’exercice : coefficients des réactifs et des produits. */
const EQUATIONS = [
  { texte: '2 H₂ + O₂ → 2 H₂O', consomme: 'dioxygène', parProduit: 'molécules d’eau', ratio: [1, 2] },
  { texte: '2 H₂ + O₂ → 2 H₂O', consomme: 'dihydrogène', parProduit: 'molécules d’eau', ratio: [2, 2] },
  { texte: 'C + O₂ → CO₂', consomme: 'dioxygène', parProduit: 'molécules de dioxyde de carbone', ratio: [1, 1] },
] as const;

const niveau4 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(EQUATIONS);
  const k = rng.int(2, 9);
  const produits = k * e.ratio[1];
  const n = k * e.ratio[0];
  return {
    prompt: `L’équation fournie est ${e.texte}. Pour former ${produits} ${e.parProduit}, combien de molécules de ${e.consomme} sont consommées ?`,
    answer: num(n),
    traps: traps(r(n), [
      [produits, 'Ce nombre est celui des produits : lis le coefficient devant chaque molécule de l’équation.'],
      [n * 2, 'Compte les molécules, pas les atomes : regarde le coefficient devant la formule.'],
      [e.ratio[0], 'C’est le nombre pour une seule fois l’équation : adapte à la quantité de produit demandée.'],
    ]),
    hint: 'Combien de fois faut-il écrire l’équation pour obtenir le nombre de produits demandé ?',
    steps: [
      `Dans l’équation, le coefficient (sans chiffre, il vaut 1) est ${e.ratio[0]} pour le ${e.consomme} et ${e.ratio[1]} pour le produit.`,
      `L’équation se répète ${k} fois : ${k} × ${e.ratio[0]} = **${n}**.`,
    ],
    targetSeconds: 80,
  };
};

const EXPERIENCES = [
  {
    avant: 'Avant : de l’eau liquide, formée de molécules H₂O.',
    apres: 'Après : de la vapeur d’eau, formée de molécules H₂O.',
    bon: 'Un changement d’état : les molécules sont les mêmes',
  },
  {
    avant: 'Avant : de la glace, formée de molécules H₂O.',
    apres: 'Après : de l’eau liquide, formée de molécules H₂O.',
    bon: 'Un changement d’état : les molécules sont les mêmes',
  },
  {
    avant: 'Avant : des molécules H₂ et des molécules O₂.',
    apres: 'Après : des molécules H₂O.',
    bon: 'Une transformation chimique : les atomes se sont réarrangés',
  },
  {
    avant: 'Avant : du carbone C et des molécules O₂.',
    apres: 'Après : des molécules CO₂.',
    bon: 'Une transformation chimique : les atomes se sont réarrangés',
  },
  {
    avant: 'Avant : des molécules O₂ dans un flacon, des molécules H₂ dans un autre.',
    apres: 'Après : les molécules H₂ et O₂ sont dans le même flacon.',
    bon: 'Un mélange : les molécules sont les mêmes, seulement réunies',
  },
] as const;

const CONCLUSIONS: readonly { label: string; why: string }[] = [
  {
    label: 'Un changement d’état : les molécules sont les mêmes',
    why: 'Un changement d’état garde les mêmes molécules d’une même substance, dans un autre état.',
  },
  {
    label: 'Une transformation chimique : les atomes se sont réarrangés',
    why: 'Il faudrait que de nouvelles molécules apparaissent : compare avant et après.',
  },
  {
    label: 'Un mélange : les molécules sont les mêmes, seulement réunies',
    why: 'Un mélange réunit plusieurs sortes de molécules sans les modifier.',
  },
  {
    label: 'Des atomes nouveaux ont été créés',
    why: 'Les atomes ne sont pas créés : ils se redistribuent.',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(EXPERIENCES);
  const { answer, traps: t } = choice(
    rng,
    e.bon,
    CONCLUSIONS.filter((c) => c.label !== e.bon),
  );
  return {
    prompt: 'Lis le compte rendu et choisis la conclusion juste.',
    figure: {
      kind: 'document',
      title: 'Compte rendu d’expérience (données de l’exercice)',
      lines: [e.avant, e.apres],
    },
    answer,
    traps: t,
    hint: 'Compare les molécules avant et après : sont-elles les mêmes ?',
    steps: [
      'Si de nouvelles molécules apparaissent, les atomes se sont redistribués : c’est chimique. Sinon, les molécules sont conservées.',
      `**${e.bon}**.`,
    ],
    targetSeconds: 100,
  };
};

export const transformationChimique: Skill = {
  id: 'p4-transformation-chimique',
  title: 'La transformation chimique',
  levels: 5,
  version: 1,
  advice: 'brouillon',
  lesson: {
    memo: [
      'Dans une **transformation chimique**, des **réactifs** sont consommés et des **produits** se forment : la composition change. Exemple : carbone + dioxygène → dioxyde de carbone.',
      'Les atomes ne sont ni créés ni détruits : ils se redistribuent pour former de nouvelles molécules.',
      'Un changement d’état ou un mélange ne crée pas de nouvelle substance. On décrit la réaction par une équation : C + O₂ → CO₂.',
    ],
    ...references(
      'distinguer',
      'redistribution',
      'equation',
      'transformation-chimique',
      'reaction',
      'reactif',
      'produit',
      'melange-sans-combinaison',
      'co2-complete',
      'eau-combinaison',
      'formule-eau',
      'formule-dioxyde',
      'deux-atomes',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
