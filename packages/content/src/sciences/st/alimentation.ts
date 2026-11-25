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
  { nom: 'légume sec', exemples: LEGUMES_SECS, why: 'Les légumes secs sont des graines comme les lentilles.' },
  { nom: 'produit salé', exemples: SALES, why: 'C’est un produit à limiter, comme les autres produits salés.' },
  { nom: 'fruit ou légume', exemples: FRUITS_LEGUMES, why: 'Il vient d’une plante : c’est un fruit ou un légume.' },
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
    bon: ['1', 'une', 'un', '1 heure', 'une heure'],
    mot: '1',
    pieges: [
      ['0', 'Il faut bouger chaque jour.'],
      ['30', 'Attention à l’unité : on demande des heures, pas des minutes.'],
    ],
  },
  {
    q: 'De 6 à 17 ans, le temps d’écran pour les loisirs se limite à combien d’heures par jour ? Écris le nombre.',
    bon: ['2', 'deux', '2 heures', 'deux heures'],
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
      parts: ['Pour boire, elle choisit de l’', '. Pour ses repas, elle pense à la ', ' des aliments.'],
      blanks: [
        { mode: 'text', accepted: ['eau'] },
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
        why: 'Même avec de l’eau dedans, un goût sucré ajoute du sucre ou un édulcorant.',
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
  const r = rng.pick([
    {
      q: 'Écris la seule boisson recommandée par Santé publique France aux adultes.',
      accepte: ['eau', 'l’eau', 'de l’eau'],
      mot: 'l’eau',
      pieges: [
        ['jus de fruits', 'Le jus de fruits compte parmi les boissons sucrées.'],
        ['soda', 'Le soda est une boisson sucrée.'],
      ],
    },
    {
      q: 'Les lentilles, les pois chiches et les haricots secs forment quelle famille d’aliments ? Écris deux mots.',
      accepte: ['légumes secs', 'les légumes secs', 'des légumes secs', 'légume sec', 'legumes secs'],
      mot: 'les légumes secs',
      pieges: [
        ['fruits', 'Ce sont des graines sèches, pas des fruits du verger.'],
        ['légumes verts', 'Les lentilles sont des graines sèches : on les range à part.'],
      ],
    },
  ] as const);
  const { answer, traps } = saisie(r.accepte, r.pieges);
  return {
    prompt: r.q,
    answer,
    traps,
    hint: 'Relis le mémo : la boisson sans goût ajouté, ou la famille des graines sèches.',
    steps: ['On cherche le mot exact.', `La réponse est **${r.mot}**.`],
    targetSeconds: 35,
  };
};

const JOURNEES = [
  {
    enfant: 'Noa',
    lignes: [
      'Matin : pain, une pomme et de l’eau.',
      'Midi : des carottes, du riz, des lentilles et de l’eau.',
      'Goûter : un soda.',
      'Après l’école : 15 minutes à vélo, puis 3 heures de jeux vidéo.',
    ],
    manque: 'Bouger plus longtemps et réduire le temps d’écran',
    boisson: 'Remplacer le soda par de l’eau',
  },
  {
    enfant: 'Tao',
    lignes: [
      'Matin : des céréales et un sirop dans l’eau.',
      'Midi : des haricots verts, du poisson et de l’eau.',
      'Goûter : une poire.',
      'Après l’école : 20 minutes de marche, puis 4 heures devant un écran.',
    ],
    manque: 'Bouger plus longtemps et réduire le temps d’écran',
    boisson: 'Remplacer le sirop par de l’eau',
  },
  {
    enfant: 'Maya',
    lignes: [
      'Matin : du pain et un jus de fruits.',
      'Midi : une tomate, des pâtes et de l’eau.',
      'Goûter : une banane.',
      'Après l’école : 10 minutes à pied, puis 5 heures de vidéos.',
    ],
    manque: 'Bouger plus longtemps et réduire le temps d’écran',
    boisson: 'Remplacer le jus de fruits par de l’eau',
  },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const j = rng.pick(JOURNEES);
  const figure = { kind: 'document' as const, title: `La journée de ${j.enfant} (exemple inventé)`, lines: j.lignes };
  const surBoisson = rng.int(0, 1) === 0;
  const bon = surBoisson ? j.boisson : j.manque;
  const faux = surBoisson
    ? [
        { label: 'Supprimer toute l’eau', why: 'L’eau est la boisson recommandée : on la garde.' },
        { label: 'Ajouter du sucre dans le verre', why: 'On cherche à limiter les boissons sucrées.' },
        {
          label: 'Remplacer le fruit du goûter par des biscuits apéritifs',
          why: 'Les biscuits apéritifs sont à limiter. Ici, on cherche à changer la boisson.',
        },
      ]
    : [
        { label: 'Ajouter encore une heure d’écran', why: 'Le temps d’écran de loisir est déjà trop long.' },
        { label: 'Ne plus bouger du tout', why: 'Il faut au moins une heure d’activité physique par jour.' },
        { label: 'Sauter le repas du midi', why: 'Le corps a besoin d’aliments. Regarde la dernière ligne.' },
      ];
  const { answer, traps } = choice(rng, bon, faux);
  return {
    prompt: surBoisson
      ? `Lis la journée de ${j.enfant}. Quel changement répond au repère sur les boissons ?`
      : `Lis la journée de ${j.enfant}. Quel changement répond aux repères sur le mouvement et les écrans ?`,
    figure,
    answer,
    traps,
    hint: surBoisson
      ? 'Cherche la boisson qui a un goût sucré.'
      : 'Compare la dernière ligne avec 1 heure et 2 heures.',
    steps: [
      surBoisson
        ? 'On cherche la boisson sucrée dans la journée.'
        : 'Repères : au moins 1 heure d’activité, au plus 2 heures d’écran de loisir.',
      `Réponse : **${bon}**.`,
    ],
    targetSeconds: 60,
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
