import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Les décomposeurs (6e) : la matière organique des êtres morts est décomposée, rôle des microorganismes ———

/** Êtres vivants qui décomposent (programme, TLFi « humus », Académie « moisissure », ministère « biodéchets »). */
const DECOMPOSEURS = ['des bactéries', 'des moisissures', 'des vers de terre'] as const;

const MORTS = [
  'une feuille tombée',
  'une brindille morte',
  'un fruit tombé de l’arbre',
  'un insecte mort',
  'une racine morte',
] as const;

const INERTES = ['un caillou', 'un morceau de verre', 'un grain de sable', 'une pièce en métal'] as const;

const VIVANTS_AUTRES = [
  { nom: 'un rosier qui fleurit', pourquoi: 'Le rosier fabrique sa matière : il ne décompose pas les restes ici.' },
  { nom: 'un oiseau qui chante', pourquoi: 'Chanter ne décompose rien.' },
  { nom: 'un lézard au soleil', pourquoi: 'Se chauffer ne décompose rien.' },
] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const m = rng.pick(MORTS);
    const [x, y] = rng.shuffle(INERTES) as unknown as [string, string];
    const { answer, traps: tr } = choice(rng, maj(m), [
      { label: maj(x), why: 'Cet objet n’est pas un reste d’être vivant.' },
      { label: maj(y), why: 'Cet objet n’est pas un reste d’être vivant.' },
    ]);
    return {
      prompt: 'Lequel est un reste d’être vivant, que des décomposeurs peuvent transformer ?',
      answer,
      traps: tr,
      hint: 'Cherche ce qui a été vivant.',
      steps: ['La matière des êtres vivants est décomposée après leur mort.', `Ici : **${m}**.`],
      targetSeconds: 25,
    };
  }
  const m = rng.pick(MORTS);
  const bon = 'Des êtres vivants la décomposent';
  const { answer, traps: tr } = choice(rng, bon, [
    {
      label: 'Ce reste s’évapore comme de l’eau',
      why: 'Les restes ne s’évaporent pas : des êtres vivants les transforment.',
    },
    { label: 'Ce reste ne change plus jamais', why: 'Après la mort, la matière organique est décomposée.' },
  ]);
  return {
    prompt: `Sur le sol, ${m} disparaît peu à peu. Pourquoi ?`,
    answer,
    traps: tr,
    hint: 'Pense à ce qui vit dans le sol.',
    steps: ['La matière organique est décomposée après la mort.', `Explication : **${bon}**.`],
    targetSeconds: 30,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = [
      ['La litière', 'La couche de feuilles et de débris à la surface du sol'],
      ['L’humus', 'La terre brune venant de la décomposition, qui aide à la fertilité'],
      ['Un microorganisme', 'Un être vivant si petit qu’on le voit au microscope'],
      ['Le lombric', 'Un ver de terre dont les galeries aèrent le sol'],
    ] as const;
    const trois = rng.shuffle(paires).slice(0, 3);
    return {
      prompt: `Associe chaque mot du sol à sa définition : ${trois.map((p) => p[0].toLowerCase()).join(' ; ')}.`,
      answer: association(rng, trois),
      hint: 'Commence par le mot que tu connais le mieux.',
      steps: ['Chaque mot a un sens précis.', 'Chaque mot est relié à **sa** définition.'],
      targetSeconds: 55,
    };
  }
  const bon = rng.pick(DECOMPOSEURS);
  const { answer, traps: tr } = choice(
    rng,
    maj(bon),
    VIVANTS_AUTRES.map((v) => ({ label: maj(v.nom), why: v.pourquoi })),
  );
  return {
    prompt: `Qui participe à la décomposition d’${rng.pick(['une feuille morte', 'une brindille morte', 'un fruit tombé'])} ?`,
    answer,
    traps: tr,
    hint: 'Pense aux êtres vivants du sol, souvent très petits.',
    steps: ['Des êtres vivants, souvent petits, décomposent les restes.', `Réponse : **${bon}**.`],
    targetSeconds: 35,
  };
};

const ETAPES = [
  'Une feuille tombe sur le sol',
  'Des êtres vivants du sol la décomposent',
  'Il se forme de l’humus',
  'L’humus contribue à la fertilité du sol',
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Raconte la vie d’une feuille morte : remets les étapes dans l’ordre.',
      answer: ordre(rng, ETAPES),
      hint: 'Tout commence par la chute de la feuille.',
      steps: ['La décomposition transforme la matière organique.', `Ordre : **${ETAPES.join(' → ')}**.`],
      targetSeconds: 55,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète la phrase sur le sol.',
      answer: {
        kind: 'cloze',
        parts: ['Après la mort des êtres vivants, leur matière ', ' est ', ' par des êtres vivants.'],
        blanks: [
          { mode: 'text', accepted: ['organique'] },
          { mode: 'text', accepted: ['décomposée', 'decomposee'] },
        ],
      },
      hint: 'Relis la première phrase du mémo.',
      steps: [
        'La matière des êtres vivants est dite organique.',
        'Elle est **décomposée** : c’est de la matière **organique**.',
      ],
      targetSeconds: 45,
    };
  }
  const cible = rng.pick([
    {
      texte: 'La couche de débris végétaux peu altérés, à la surface du sol',
      mot: 'litière',
      accepte: ['litière', 'la litière', 'litiere', 'une litière'],
    },
    {
      texte: 'La terre brune qui vient de la décomposition des débris',
      mot: 'humus',
      accepte: ['humus', 'l’humus', 'un humus'],
    },
  ]);
  const { answer, traps: tr } = saisie(cible.accepte, [
    [cible.mot === 'humus' ? 'litière' : 'humus', 'Ce mot désigne un autre moment : relis la description.'],
    ['sable', 'Le sable est un matériau minéral, pas ce qui est décrit.'],
  ]);
  return {
    prompt: `${cible.texte} : comment s’appelle-t-elle ? Écris le mot.`,
    answer,
    traps: tr,
    hint: 'Les deux mots du mémo : l’un est en surface, l’autre vient après la décomposition.',
    steps: ['On lit la description.', `Le mot est **${cible.mot}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const paires = [
      ['La litière', 'Des débris végétaux peu altérés, à la surface du sol'],
      ['L’humus', 'Une terre brune issue de la décomposition'],
      ['Une moisissure', 'Un champignon microscopique sur de la matière organique humide'],
      ['Les bactéries', 'Des microorganismes'],
      ['Le lombric', 'Un ver de terre qui aère le sol'],
    ] as const;
    const toutes = rng.shuffle(paires);
    return {
      prompt: `Associe chaque élément à sa description : ${toutes.map((p) => p[0].toLowerCase()).join(' ; ')}.`,
      answer: association(rng, toutes),
      hint: 'Repère d’abord les êtres vivants.',
      steps: ['On distingue les êtres vivants et la matière du sol.', 'Chaque élément est relié à **sa** description.'],
      targetSeconds: 80,
    };
  }
  if (t === 1) {
    const { answer, traps: tr } = saisie(
      [
        'microorganismes',
        'des microorganismes',
        'les microorganismes',
        'micro-organismes',
        'des micro-organismes',
        'les micro-organismes',
        'microorganisme',
        'micro-organisme',
        'microbes',
        'des microbes',
      ],
      [
        ['champignons', 'Certains champignons sont grands : le mot demandé désigne tout ce qui est microscopique.'],
        ['végétaux', 'Les végétaux ne sont pas des êtres microscopiques en général.'],
      ],
    );
    return {
      prompt: `Les bactéries sont des êtres vivants microscopiques. Sans propositions : quel grand nom désigne ces êtres, qui jouent un rôle clé dans la décomposition ?`,
      answer,
      traps: tr,
      hint: 'Leur nom dit qu’ils sont très petits.',
      steps: ['Les bactéries sont microscopiques.', 'Ce sont des **microorganismes**.'],
      targetSeconds: 45,
    };
  }
  const qui = rng.pick(['Une moisissure', 'Des taches duveteuses']);
  const { answer, traps: tr } = saisie(
    [
      'champignon',
      'un champignon',
      'des champignons',
      'champignons',
      'un champignon microscopique',
      'champignon microscopique',
    ],
    [
      ['bactérie', 'La moisissure n’est pas une bactérie : c’est un autre groupe.'],
      ['virus', 'La moisissure n’est pas un virus : elle forme des taches duveteuses visibles.'],
    ],
  );
  return {
    prompt: `${qui === 'Une moisissure' ? 'Une moisissure se développe sur du pain humide.' : 'Des taches duveteuses de moisissure poussent sur un fruit oublié.'} À quel groupe d’êtres vivants la moisissure appartient-elle ?`,
    answer,
    traps: tr,
    hint: 'Certains êtres de ce groupe poussent en forêt et ont un chapeau.',
    steps: ['La moisissure se développe sur de la matière organique humide.', 'C’est un **champignon** microscopique.'],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const depart = rng.pick([20, 24, 30]);
  const fin = depart - rng.pick([9, 12, 15]);
  const temoin = depart - rng.pick([0, 1]);
  const figure = {
    kind: 'document' as const,
    title: 'Expérience sur des feuilles mortes (exemple inventé)',
    lines: [
      `Deux boîtes contiennent ${depart} feuilles mortes humides.`,
      'Boîte A : on ajoute de la terre de jardin avec ses êtres vivants.',
      'Boîte B : on ajoute la même terre, chauffée très fort pour tuer ses êtres vivants.',
      `Après deux mois, il reste ${fin} feuilles entières en A et ${temoin} en B.`,
      'Les deux boîtes restent au même endroit.',
    ],
  };
  const sujet = `Lis l’expérience (départ ${depart} ; fin : A ${fin}, B ${temoin}).`;
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: `${sujet} Combien de feuilles entières ont disparu dans la boîte A ?`,
      figure,
      answer: num(depart - fin),
      traps: traps(r(depart - fin), [
        [fin, 'C’est le nombre de feuilles qui restent. Soustrais-le au nombre de départ.'],
        [depart + fin, 'On cherche ce qui a disparu : il faut soustraire.'],
      ]),
      hint: 'Fais « départ moins ce qui reste » pour la boîte A.',
      steps: [`${depart} − ${fin}.`, `Il manque **${depart - fin}** feuilles entières.`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const bon = 'Les êtres vivants de la terre aident à décomposer les feuilles';
    const { answer, traps: tr } = choice(rng, bon, [
      {
        label: 'La terre chauffée décompose plus vite les feuilles',
        why: `C’est l’inverse : en B il reste ${temoin} feuilles entières, en A seulement ${fin}.`,
      },
      {
        label: 'Les feuilles disparaissent toutes seules, sans êtres vivants',
        why: 'En B, sans êtres vivants au départ, les feuilles restent presque toutes entières.',
      },
      {
        label: 'C’est le lieu qui explique la différence',
        why: 'Les deux boîtes sont au même endroit : le lieu ne change pas.',
      },
    ]);
    return {
      prompt: `${sujet} Que montre la comparaison ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Cherche la seule différence entre les deux boîtes.',
      steps: ['La seule différence : les êtres vivants de la terre.', `Conclusion : **${bon}**.`],
      targetSeconds: 70,
    };
  }
  const bon = 'La boîte B';
  const { answer, traps: tr } = choice(rng, bon, [
    { label: 'La boîte A', why: 'La boîte A teste la présence des êtres vivants : elle les contient.' },
    {
      label: 'Aucune des deux',
      why: 'Il faut une boîte pour comparer : laquelle n’a plus d’êtres vivants au départ ?',
    },
  ]);
  return {
    prompt: `${sujet} Quelle boîte sert de comparaison, sans êtres vivants au départ ?`,
    figure,
    answer,
    traps: tr,
    hint: 'Relis la préparation de la terre.',
    steps: ['On a chauffé la terre d’une boîte pour tuer ses êtres vivants.', 'C’est la **boîte B**.'],
    targetSeconds: 50,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const decomposeurs: Skill = {
  id: 'v6-decomposeurs',
  title: 'Les décomposeurs du sol',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Après sa mort, la **matière organique** d’un être vivant est **décomposée**, par exemple dans le sol.',
      'Les **décomposeurs** sont des êtres vivants comme les **microorganismes** (bactéries) ou les moisissures. La **litière** peu à peu transformée donne de l’**humus**.',
    ],
    source: `${PROGRAMME} : « Mettre en évidence que la matière organique des êtres vivants est décomposée après leur mort (exemple du sol) » ; « Dégager le rôle clé des êtres vivants, en particulier des microorganismes, dans la décomposition de la matière organique » ; humus (TLFi), litière, moisissure, microorganisme, lombric (Académie française) ; lombricomposteur (ministère chargé de la transition écologique).`,
    sources: [
      PROGRAMME,
      'cnrtl-humus',
      'academie-litiere',
      'academie-moisissure',
      'academie-micro-organisme',
      'academie-lombric',
      'ecologie-biodechets',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
