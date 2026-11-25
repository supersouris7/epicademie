import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, saisie } from './outils.ts';

// ——— Alimentation équilibrée et habitudes favorables à la santé (programme ; repères de Santé publique France) ———
// Ton sobre : aucun aliment « interdit », aucun jugement sur le corps. Les repères alimentaires chiffrés sont ceux
// publiés pour les adultes ; ils sont toujours annoncés comme tels. Les repères d’activité visent les 6 à 17 ans.

const ADULTES = 'D’après les repères de Santé publique France pour les adultes,';

const SUCREES = ['un soda', 'un sirop dans l’eau', 'un jus de fruits', 'une eau aromatisée', 'une boisson énergisante'];
const FRUITS_LEGUMES = ['une pomme', 'des carottes', 'une banane', 'des haricots verts', 'une poire', 'une tomate'];
const SALES = ['de la charcuterie', 'des biscuits apéritifs'];
const LEGUMES_SECS = ['des lentilles', 'des pois chiches', 'des haricots secs'];

const niveau1 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const { answer, traps } = choice(rng, 'de l’eau', [
      { label: rng.pick(SUCREES), why: 'C’est une boisson sucrée : on la limite. L’eau est la boisson recommandée.' },
      { label: 'de la sauce', why: 'La sauce n’est pas une boisson. La boisson recommandée est l’eau.' },
    ]);
    return {
      prompt: 'Tu as soif. Quelle est la boisson recommandée ?',
      answer,
      traps,
      hint: 'Elle n’a ni sucre ni goût ajouté.',
      steps: ['On cherche la boisson recommandée.', 'La réponse est **de l’eau**.'],
      targetSeconds: 15,
    };
  }
  if (t === 1) {
    const bon = rng.pick(FRUITS_LEGUMES);
    const { answer, traps } = choice(rng, bon, [
      { label: rng.pick(SALES), why: 'Ce produit est à limiter : ce n’est ni un fruit ni un légume.' },
      { label: 'un bonbon', why: 'Un bonbon est un produit sucré, pas un fruit ni un légume.' },
    ]);
    return {
      prompt: 'Lequel est un fruit ou un légume ?',
      answer,
      traps,
      hint: 'Cherche ce qui pousse sur une plante et se mange tel quel.',
      steps: ['Les fruits et les légumes viennent de plantes.', `La réponse est **${bon}**.`],
      targetSeconds: 15,
    };
  }
  const bon = 'se brosser les dents';
  const { answer, traps } = choice(rng, bon, [
    { label: 'grignoter toute la nuit', why: 'La nuit sert à dormir. Se brosser les dents protège ta santé.' },
    { label: 'boire du soda au lit', why: 'Le soda est une boisson sucrée : on la limite.' },
  ]);
  return {
    prompt: 'Quel geste d’hygiène est bon pour ta santé ?',
    answer,
    traps,
    hint: 'Pense à ce que tu fais devant le lavabo.',
    steps: ['On cherche un geste d’hygiène.', `La réponse est **${bon}**.`],
    targetSeconds: 15,
  };
};

const GROUPES = [
  { nom: 'boisson sucrée', exemples: SUCREES, why: 'Cette boisson a un goût sucré : on la limite.' },
  {
    nom: 'légume sec',
    exemples: LEGUMES_SECS,
    why: 'Les légumes secs sont des graines comme les lentilles. Les repères les comptent à part des fruits et légumes.',
  },
  { nom: 'produit salé', exemples: SALES, why: 'C’est un produit à limiter, comme les autres produits salés.' },
  {
    nom: 'fruit ou légume',
    exemples: FRUITS_LEGUMES,
    why: 'C’est un fruit ou un légume, comme la pomme ou la carotte.',
  },
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  const trois = rng.shuffle(GROUPES).slice(0, 3);
  if (rng.int(0, 1) === 0) {
    const paires = trois.map((g) => [rng.pick(g.exemples), g.nom] as const);
    return {
      prompt: `Associe chaque exemple à sa famille : ${paires
        .map((p) => p[0])
        .sort()
        .join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Pose-toi la question : est-ce que ça se boit ? Est-ce salé ? Est-ce une graine ?',
      steps: ['On regarde chaque exemple.', trois.map((g) => g.why).join(' '), 'Chaque exemple a **sa** famille.'],
      targetSeconds: 50,
    };
  }
  const g = rng.pick(GROUPES);
  const bon = rng.pick(g.exemples);
  // Un jus de fruits n’est jamais proposé contre « fruit ou légume » : le piège serait discutable à cet âge.
  const faux = GROUPES.filter((x) => x.nom !== g.nom).map((x) => ({
    label: rng.pick(x.exemples.filter((e) => g.nom !== 'fruit ou légume' || e !== 'un jus de fruits')),
    why: x.why,
  }));
  const { answer, traps } = choice(rng, bon, faux);
  return {
    prompt: `Lequel de ces exemples appartient à la famille « ${g.nom} » ?`,
    answer,
    traps,
    hint: 'Élimine d’abord ce que tu reconnais dans une autre famille.',
    steps: ['On cherche l’exemple de la bonne famille.', g.why, `La réponse est **${bon}**.`],
    targetSeconds: 30,
  };
};

const REPERES = [
  {
    q: `${ADULTES} combien de fruits et légumes faut-il manger au moins par jour ? Écris le nombre.`,
    bon: ['5', 'cinq'],
    mot: '5',
    pieges: [
      ['1', 'Un seul ne suffit pas : le repère est d’au moins 5 par jour.'],
      ['2', 'Deux fruits ne suffisent pas : on compte aussi les légumes, au moins 5 en tout.'],
    ],
  },
  {
    q: 'De 6 à 17 ans, combien d’heures d’activité physique faut-il faire au moins par jour ? Écris le nombre.',
    bon: ['1', 'une', 'un', '1 heure', 'une heure', '1h', '1 h'],
    mot: '1',
    pieges: [
      ['0', 'Il faut bouger chaque jour.'],
      ['30', 'Attention à l’unité : on demande des heures, pas des minutes.'],
      ['60', 'Tu as compté en minutes. La question demande un nombre d’heures.'],
    ],
  },
  {
    q: 'De 6 à 17 ans, le temps d’écran pour les loisirs se limite à combien d’heures par jour ? Écris le nombre.',
    bon: ['2', 'deux', '2 heures', 'deux heures', '2h', '2 h'],
    mot: '2',
    pieges: [
      ['5', 'C’est trop. La limite de loisir est de 2 heures par jour.'],
      ['10', 'C’est beaucoup trop. La limite de loisir est de 2 heures par jour.'],
    ],
  },
  {
    q: `${ADULTES} combien de fois par semaine, au moins, faut-il manger des légumes secs ? Écris le nombre.`,
    bon: ['2', 'deux', '2 fois', 'deux fois'],
    mot: '2',
    pieges: [
      ['0', 'Les légumes secs sont à mettre au menu chaque semaine.'],
      ['5', 'Le repère de 5 concerne les fruits et légumes, chaque jour.'],
    ],
  },
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 1);
  if (t === 0) {
    const r = rng.pick(REPERES);
    const { answer, traps } = saisie(r.bon, r.pieges);
    return {
      prompt: r.q,
      answer,
      traps,
      hint: 'Rappelle-toi les nombres du mémo. Vérifie l’unité demandée.',
      steps: ['On cherche le repère chiffré.', `La réponse est **${r.mot}**.`],
      targetSeconds: 35,
    };
  }
  const salade = rng.pick(FRUITS_LEGUMES);
  return {
    prompt: `Léna prépare son goûter avec ${salade}. Complète ses bons réflexes.`,
    answer: {
      kind: 'cloze',
      parts: ['Pour boire, elle choisit surtout : ', '. Pour ses repas, elle pense à la ', ' des aliments.'],
      blanks: [
        {
          mode: 'text',
          accepted: ['eau', 'l’eau', 'de l’eau', 'eau du robinet', 'l’eau du robinet', 'de l’eau du robinet'],
        },
        { mode: 'list', options: ['couleur de l’emballage', 'variété', 'publicité'], correct: 1 },
      ],
    },
    hint: 'Le premier mot est la boisson recommandée. Ensuite : changer souvent d’aliments.',
    steps: [
      'L’eau est la boisson recommandée.',
      'Changer souvent d’aliments, c’est la variété.',
      'Réponses : **eau** et **variété**.',
    ],
    targetSeconds: 40,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt:
        'Repères de Santé publique France (repas : adultes ; mouvement : 6 à 17 ans). Relie chaque sujet à son conseil.',
      answer: association(rng, [
        ['les fruits et légumes', 'au moins 5 par jour'],
        ['les légumes secs', 'au moins 2 fois par semaine'],
        ['les boissons sucrées', 'à limiter le plus possible'],
        ['l’eau', 'la seule boisson recommandée'],
        ['bouger, de 6 à 17 ans', 'au moins 1 heure par jour'],
      ]),
      hint: 'Commence par la boisson, puis repère les mots « jour » et « semaine ».',
      steps: ['Chaque repère a un conseil précis.', 'Chaque repère est relié à **son** conseil.'],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const jus = rng.pick(SUCREES.filter((x) => x !== 'un soda'));
    const bon = 'une boisson sucrée';
    const { answer, traps } = choice(rng, bon, [
      {
        label: 'de l’eau, à volonté',
        why: 'Santé publique France compte cette boisson parmi les boissons sucrées : ce n’est pas de l’eau.',
      },
      { label: 'un fruit entier', why: 'Boire n’est pas croquer un fruit entier.' },
      { label: 'un légume sec', why: 'Un légume sec est une graine, comme la lentille.' },
    ]);
    return {
      prompt: `Piège possible ! Dans quelle famille faut-il ranger ${jus} ?`,
      answer,
      traps,
      hint: 'Pense au goût de cette boisson, pas à son nom.',
      steps: [
        'Jus de fruits, sirops, eaux aromatisées et boissons énergisantes sont des boissons sucrées.',
        `La réponse est **${bon}**.`,
      ],
      targetSeconds: 35,
    };
  }
  const fruits = rng.int(1, 3);
  const velo = rng.pick([15, 20, 25]);
  const jeu = rng.pick([10, 15, 20]);
  const r = rng.pick([
    {
      q: `${ADULTES} il faut au moins 5 fruits et légumes par jour. Un adulte en a déjà mangé ${fruits}. Combien lui en manque-t-il au minimum ? Écris le nombre.`,
      accepte: [String(5 - fruits)],
      mot: String(5 - fruits),
      explication: `Le repère est 5. On calcule 5 − ${fruits}.`,
      pieges: [
        ['5', 'C’est le repère entier. Retire ce qui est déjà mangé.'],
        [String(fruits), 'C’est ce qui est déjà mangé. On cherche ce qui manque.'],
      ],
    },
    {
      q: `Zoé a 10 ans. Aujourd’hui, elle a fait ${velo} minutes de vélo et ${jeu} minutes de jeu de ballon. Combien de minutes lui manque-t-il pour atteindre le repère d’activité physique ? Écris le nombre.`,
      accepte: [String(60 - velo - jeu), `${60 - velo - jeu} minutes`, `${60 - velo - jeu} min`],
      mot: `${60 - velo - jeu} minutes`,
      explication: `Le repère est 1 heure, soit 60 minutes. On calcule 60 − ${velo} − ${jeu}.`,
      pieges: [
        [String(velo + jeu), 'C’est ce qu’elle a déjà fait. On cherche ce qui manque pour 60 minutes.'],
        [String(60 - velo), 'Tu as oublié le jeu de ballon : il compte aussi.'],
        ['1', 'Le repère est d’une heure, mais on demande les minutes qui manquent.'],
      ],
    },
    {
      q: 'Les lentilles, les pois chiches et les haricots secs forment quelle famille d’aliments ? Écris deux mots.',
      accepte: [
        'légumes secs',
        'les légumes secs',
        'des légumes secs',
        'légume sec',
        'legumes secs',
        'légumineuses',
        'les légumineuses',
        'des légumineuses',
        'legumineuses',
      ],
      mot: 'les légumes secs',
      explication: 'Les repères les citent à part des fruits et légumes.',
      pieges: [
        ['fruits', 'Ce sont des graines sèches, pas des fruits du verger.'],
        ['légumes verts', 'Les lentilles sont des graines sèches : on les range à part.'],
      ],
    },
  ]);
  const { answer, traps } = saisie(
    r.accepte,
    r.pieges.map((p) => [p[0] ?? '', p[1] ?? ''] as const),
  );
  return {
    prompt: r.q,
    answer,
    traps,
    hint: 'Rappelle-toi le repère du mémo, puis compare-le avec ce qui est écrit.',
    steps: ['On cherche le repère utile.', r.explication, `La réponse est **${r.mot}**.`],
    targetSeconds: 45,
  };
};

/** Journées inventées d’enfants (repères de mouvement et d’écran, de 6 à 17 ans). */
const JOURNEES = [
  { enfant: 'Noa', matin: 'pain, une pomme et de l’eau', gouter: 'un soda', activite: 15, ecran: 3 },
  { enfant: 'Tao', matin: 'des céréales et un sirop dans l’eau', gouter: 'une poire', activite: 20, ecran: 4 },
  { enfant: 'Maya', matin: 'du pain et un jus de fruits', gouter: 'une banane', activite: 35, ecran: 5 },
] as const;

/** Journées inventées d’adultes (repères alimentaires pour les adultes). `fruits` : fruits et légumes écrits. */
const ADULTES_JOURNEES = [
  {
    nom: 'M. Diallo',
    lignes: [
      'Matin : une pomme et du café.',
      'Midi : des carottes, du riz et des lentilles.',
      'Goûter : un soda « light ».',
      'Soir : une tomate et de l’eau.',
    ],
    fruits: 3,
    sucree: 'le soda « light »',
  },
  {
    nom: 'Mme Garcia',
    lignes: [
      'Matin : du pain et un jus de fruits.',
      'Midi : des haricots verts et des pâtes.',
      'Goûter : une eau aromatisée sucrée.',
      'Soir : une poire et de l’eau.',
    ],
    fruits: 2,
    sucree: 'le jus de fruits',
  },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t < 2) {
    const j = rng.pick(JOURNEES);
    const manque = 60 - j.activite;
    const figure = {
      kind: 'document' as const,
      title: `La journée de ${j.enfant} (exemple inventé)`,
      lines: [
        `${j.enfant} a 10 ans.`,
        `Matin : ${j.matin}.`,
        'Midi : des carottes, du riz et de l’eau.',
        `Goûter : ${j.gouter}.`,
        `Après l’école : ${j.activite} minutes à vélo, puis ${j.ecran} heures d’écran de loisir (jeux vidéo).`,
      ],
    };
    if (t === 0) {
      const { answer, traps } = saisie(
        [String(manque), `${manque} minutes`, `${manque} min`],
        [
          [String(j.activite), 'C’est le temps déjà fait. On cherche ce qui manque pour 1 heure.'],
          ['60', 'C’est le repère entier (1 heure). Retire le temps déjà fait.'],
          [String(j.ecran), 'Les heures d’écran ne comptent pas comme de l’activité physique.'],
        ],
      );
      return {
        prompt: `Lis la journée de ${j.enfant}. Combien de minutes d’activité physique manque-t-il pour atteindre le repère ? Écris le nombre.`,
        figure,
        answer,
        traps,
        hint: 'Convertis d’abord le repère en minutes, puis compare avec la journée.',
        steps: [
          'Le repère : au moins 1 heure par jour, soit 60 minutes.',
          `On calcule 60 − ${j.activite}.`,
          `Il manque **${manque}** minutes.`,
        ],
        targetSeconds: 70,
      };
    }
    const bon = `Faire ${manque} minutes d’activité en plus et descendre à 2 heures d’écran`;
    const { answer, traps } = choice(rng, bon, [
      {
        label: `Faire ${manque} minutes d’activité en plus et garder ${j.ecran} heures d’écran`,
        why: 'Le mouvement est réglé, mais l’écran de loisir dépasse encore 2 heures.',
      },
      {
        label: 'Descendre à 2 heures d’écran sans bouger davantage',
        why: `Les écrans sont réglés, mais ${j.activite} minutes d’activité, c’est moins d’1 heure.`,
      },
      {
        label: `Faire ${manque - 10} minutes d’activité en plus et descendre à 2 heures d’écran`,
        why: `Calcule : ${j.activite} + ${manque - 10} n’atteint pas 60 minutes.`,
      },
    ]);
    return {
      prompt: `Lis la journée de ${j.enfant}. Quel changement permet de respecter les deux repères : mouvement et écrans ?`,
      figure,
      answer,
      traps,
      hint: 'Vérifie les deux repères, un par un, pour chaque proposition.',
      steps: [
        'Repères : au moins 1 heure d’activité, au plus 2 heures d’écran de loisir.',
        `Il manque ${manque} minutes, et ${j.ecran} heures dépassent 2 heures.`,
        `Réponse : **${bon}**.`,
      ],
      targetSeconds: 75,
    };
  }
  const a = rng.pick(ADULTES_JOURNEES);
  const figure = {
    kind: 'document' as const,
    title: `La journée de ${a.nom} (adulte, exemple inventé)`,
    lines: a.lignes,
  };
  if (t === 2) {
    const manque = 5 - a.fruits;
    const bon = `Ajouter ${manque} fruits ou légumes`;
    const { answer, traps } = choice(rng, bon, [
      {
        label: manque === 2 ? 'Ajouter 1 fruit ou légume' : `Ajouter ${manque - 1} fruits ou légumes`,
        why: 'Compte : on arrive à 4 seulement. Le repère est d’au moins 5.',
      },
      {
        label: `Ajouter ${manque} portions de lentilles`,
        why: 'Les légumes secs sont comptés à part des fruits et légumes.',
      },
      {
        label: `Ajouter ${manque} verres de jus de fruits`,
        why: 'Santé publique France compte le jus de fruits parmi les boissons sucrées.',
      },
    ]);
    return {
      prompt: `Lis la journée de ${a.nom}. D’après les repères pour les adultes, quel changement permet d’atteindre le repère des fruits et légumes ?`,
      figure,
      answer,
      traps,
      hint: 'Compte les fruits et légumes écrits, sans les légumes secs ni les boissons.',
      steps: [
        `On trouve ${a.fruits} fruits et légumes dans la journée.`,
        `Il en faut au moins 5 : il en manque ${manque}.`,
        `Réponse : **${bon}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const bon = 'Remplacer toutes les boissons sucrées par de l’eau';
  const { answer, traps } = choice(rng, bon, [
    {
      label: `Remplacer ${a.sucree} par un sirop dans l’eau`,
      why: 'Le sirop est aussi une boisson sucrée.',
    },
    {
      label: 'Choisir des boissons « light » à la place',
      why: 'Santé publique France compte les sodas « light » parmi les boissons sucrées.',
    },
    {
      label: 'Boire des eaux aromatisées sucrées à la place',
      why: 'Les eaux aromatisées sont comptées parmi les boissons sucrées.',
    },
  ]);
  return {
    prompt: `Lis la journée de ${a.nom}. D’après les repères pour les adultes, quel changement répond au repère sur les boissons ?`,
    figure,
    answer,
    traps,
    hint: 'Repère chaque boisson sucrée de la journée. Une boisson « light » compte-t-elle ?',
    steps: [`Dans la journée, on trouve notamment ${a.sucree} : c’est une boisson sucrée.`, `Réponse : **${bon}**.`],
    targetSeconds: 70,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const alimentation: Skill = {
  id: 'vcm2-alimentation',
  title: 'Bien manger et bouger',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **alimentation variée** aide ta santé. Repères pour les adultes : au moins 5 fruits et légumes par jour, des **légumes secs** 2 fois par semaine. Bois de l’eau et limite chaque **boisson sucrée**.',
      'De 6 à 17 ans : au moins 1 heure d’**activité physique** par jour, et 2 heures d’écran de loisir au plus. Et brosse-toi les dents !',
    ],
    source: `${PROGRAMME} : « Citer quelques comportements alimentaires et règles d’hygiène favorables à la santé (équilibre alimentaire, qualité sanitaire des aliments, brossage des dents, etc.) ». Santé publique France (repères pour les adultes) : « L’eau est la seule boisson recommandée » ; (6 à 17 ans) : « pratiquer au moins une heure par jour d’activité physique ».`,
    sources: [PROGRAMME, 'spf-alimentation-2019', 'spf-activite-physique-2017'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
