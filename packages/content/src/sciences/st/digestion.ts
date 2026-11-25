import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Digestion : le trajet des aliments et leurs changements (programme du cycle 3, définitions CNRTL) ———

type Cle = 'bouche' | 'oesophage' | 'estomac' | 'grele' | 'gros';

interface Etape {
  readonly nom: string;
  readonly role: string;
  /** Description proposée au niveau 2 (« quelle partie correspond à… »). */
  readonly description: string;
  readonly why: string;
  readonly accepte: readonly string[];
}

const TRAJET: Record<Cle, Etape> = {
  bouche: {
    nom: 'la bouche',
    role: 'les dents broient les aliments, mouillés par la salive',
    description: 'les dents y broient les aliments, mouillés par la salive',
    why: 'Dans la bouche, les dents broient les aliments et la salive les mouille.',
    accepte: ['bouche', 'la bouche', 'dans la bouche'],
  },
  oesophage: {
    nom: 'l’œsophage',
    role: 'les aliments avalés sont conduits vers l’estomac',
    description: 'ce conduit amène les aliments avalés jusqu’à l’estomac',
    why: 'L’œsophage est le conduit qui amène les aliments avalés jusqu’à l’estomac.',
    accepte: ['œsophage', 'oesophage', 'l’œsophage', 'l’oesophage', 'dans l’œsophage'],
  },
  estomac: {
    nom: 'l’estomac',
    role: 'les aliments sont brassés dans une poche',
    description: 'cette poche brasse les aliments et en fait une bouillie',
    why: 'L’estomac est une poche : les aliments y sont brassés et transformés.',
    accepte: ['estomac', 'l’estomac', 'dans l’estomac'],
  },
  grele: {
    nom: 'l’intestin grêle',
    role: 'une partie des aliments digérés passe dans le sang',
    description: 'une partie des aliments digérés y passe dans le sang',
    why: 'C’est la paroi de l’intestin grêle qui absorbe des produits de la digestion vers le sang.',
    accepte: [
      'intestin grêle',
      'intestin grele',
      'l’intestin grêle',
      'l’intestin grele',
      'petit intestin',
      'le petit intestin',
    ],
  },
  gros: {
    nom: 'le gros intestin',
    role: 'c’est la dernière partie du tube digestif',
    description: 'elle vient en dernier dans le tube digestif',
    why: 'Le gros intestin vient en dernier, après l’intestin grêle.',
    accepte: ['gros intestin', 'le gros intestin', 'dans le gros intestin', 'côlon', 'colon', 'le côlon', 'le colon'],
  },
};
const CLES = Object.keys(TRAJET) as Cle[];

/** Ce que devient la bouchée, dans l’ordre du trajet. */
const TEXTURES = [
  { lieu: 'bouche', forme: 'des morceaux broyés et mouillés de salive : le bol alimentaire' },
  { lieu: 'estomac', forme: 'une bouillie à moitié liquide : le chyme' },
  { lieu: 'grele', forme: 'une partie passe dans le sang' },
] as const;
const TEXTURE_WHY =
  'Les dents broient et la salive mouille : c’est le bol alimentaire. Dans l’estomac, la digestion en fait une bouillie, le chyme. Plus loin, dans l’intestin grêle, une partie passe dans le sang.';

/** Erreurs possibles quand on attend `bon` : les autres étapes, avec leur rôle. */
const autres = (bon: Cle) =>
  CLES.filter((k) => k !== bon).map((k) => ({
    label: TRAJET[k].nom,
    why: `${TRAJET[k].why} ${TRAJET[bon].why}`,
  }));

const niveau1 = (rng: Rng): QuestionDraft => {
  const cas = rng.pick([
    {
      q: 'Tu croques dans une pomme. Où commence la digestion ?',
      bon: 'dans la bouche',
      why: 'La digestion commence dès que les dents broient la pomme, dans la bouche.',
      faux: [
        {
          label: 'dans le cœur',
          why: 'Le cœur fait circuler le sang. La pomme n’y passe pas : elle commence par la bouche.',
        },
        { label: 'dans les cheveux', why: 'Les cheveux ne reçoivent pas la pomme. Elle entre par la bouche.' },
      ],
    },
    {
      q: 'Qu’est-ce qui sert à broyer un morceau de carotte ?',
      bon: 'les dents',
      why: 'Les dents saisissent, retiennent et broient les aliments.',
      faux: [
        { label: 'les oreilles', why: 'Les oreilles servent à entendre. Pour broyer, il faut les dents.' },
        {
          label: 'les ongles',
          why: 'Les ongles protègent le bout des doigts. Dans la bouche, ce sont les dents qui broient.',
        },
      ],
    },
    {
      q: 'Quel liquide mouille la bouchée de pain dans ta bouche ?',
      bon: 'la salive',
      why: 'La salive mouille la bouche et participe à la digestion.',
      faux: [
        { label: 'les larmes', why: 'Les larmes mouillent les yeux. Dans la bouche, c’est la salive.' },
        { label: 'la sueur', why: 'La sueur sort par la peau. Dans la bouche, c’est la salive.' },
      ],
    },
  ]);
  const { answer, traps } = choice(rng, cas.bon, cas.faux);
  return {
    prompt: cas.q,
    answer,
    traps,
    hint: 'Imagine ce qui se passe au moment où tu manges.',
    steps: ['On suit l’aliment dès le début de son trajet.', cas.why, `La réponse est **${cas.bon}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 2) {
    return {
      prompt: 'Suis la bouchée de pain : relie chaque partie à ce que devient la bouchée.',
      answer: association(
        rng,
        TEXTURES.map((x) => [TRAJET[x.lieu].nom, x.forme] as const),
      ),
      hint: 'La bouchée devient de plus en plus molle en avançant. Où est-elle encore en morceaux ?',
      steps: ['La texture de la bouchée change le long du trajet.', TEXTURE_WHY, 'Chaque partie a **sa** texture.'],
      targetSeconds: 50,
    };
  }
  if (t === 0) {
    const trio = rng.shuffle(CLES).slice(0, 3);
    return {
      prompt: `Associe chaque partie à ce qui s’y passe : ${trio
        .map((k) => TRAJET[k].nom)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trio.map((k) => [TRAJET[k].nom, TRAJET[k].role] as const),
      ),
      hint: 'Pense au trajet : on broie, on avale, on brasse, puis on absorbe.',
      steps: [
        'Chaque partie du tube digestif a son rôle.',
        trio.map((k) => TRAJET[k].why).join(' '),
        'Chaque partie est reliée à **son** rôle.',
      ],
      targetSeconds: 50,
    };
  }
  const bon = rng.pick(CLES);
  const { answer, traps } = choice(rng, TRAJET[bon].nom, rng.shuffle(autres(bon)).slice(0, 3));
  return {
    prompt: `Quelle partie du tube digestif correspond à cette description : « ${TRAJET[bon].description} » ?`,
    answer,
    traps,
    hint: 'Suis la bouchée depuis les dents : à quel moment du voyage es-tu ?',
    steps: ['On cherche la partie décrite.', TRAJET[bon].why, `La réponse est **${TRAJET[bon].nom}**.`],
    targetSeconds: 30,
  };
};

const NOMS_TRAJET = CLES.map((k) => TRAJET[k].nom);

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 3) {
    const suite = [
      'un morceau croqué dans l’assiette',
      'des morceaux broyés et mouillés de salive (bol alimentaire)',
      'une bouillie à moitié liquide (chyme)',
      'une partie passe dans le sang',
    ];
    return {
      prompt: 'Remets dans l’ordre ce que devient une bouchée pendant son voyage.',
      answer: ordre(rng, suite),
      hint: 'Au début, l’aliment est entier. Puis il devient de plus en plus petit et mou.',
      steps: ['La texture change tout au long du trajet.', TEXTURE_WHY, `Ordre : **${suite.join(' → ')}**.`],
      targetSeconds: 50,
    };
  }
  if (t === 0) {
    // 4 ou 5 parties du trajet, sans changer l’ordre.
    const saute = rng.int(-1, CLES.length - 1);
    const suite = NOMS_TRAJET.filter((_, i) => i !== saute);
    return {
      prompt: `Range dans l’ordre le trajet d’une bouchée : ${[...suite].sort().join(', ')}.`,
      answer: ordre(rng, suite),
      hint: 'Commence là où tu croques, puis suis la bouchée de plus en plus loin dans le corps.',
      steps: [
        'La bouchée avance toujours dans le même sens.',
        'Bouche, œsophage, estomac, intestin grêle, gros intestin.',
        `Ordre : **${suite.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète : le début de la digestion.',
      answer: {
        kind: 'cloze',
        parts: ['Les ', ' broient les aliments. La ', ' les mouille.'],
        blanks: [
          { mode: 'list', options: ['veines', 'dents', 'oreilles'], correct: 1 },
          { mode: 'text', accepted: ['salive'] },
        ],
      },
      hint: 'Le second mot désigne le liquide de la bouche. Il commence par « sa ».',
      steps: ['Tout commence dans la bouche.', 'Mots : **dents** et **salive**.'],
      targetSeconds: 40,
    };
  }
  const bon = rng.pick(['estomac', 'oesophage'] as const);
  const e = TRAJET[bon];
  const { answer, traps } = saisie(e.accepte, [
    [bon === 'estomac' ? 'œsophage' : 'estomac', e.why],
    ['intestin', `L’intestin (grêle ou gros) vient après l’estomac. ${e.why}`],
  ]);
  return {
    prompt:
      bon === 'estomac'
        ? 'Écris le nom de la poche où les aliments sont brassés, après avoir été avalés.'
        : 'Écris le nom du conduit qui amène les aliments avalés jusqu’à l’estomac.',
    answer,
    traps,
    hint: bon === 'estomac' ? 'Son nom commence par « es ».' : 'Son nom commence par la lettre « œ ».',
    steps: ['On cherche une partie du tube digestif.', e.why, `La réponse est **${e.nom}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const paires = rng
      .shuffle([
        ['digestion', 'transformation des aliments dans le tube digestif'],
        ['mastication', 'action de broyer les aliments avec les dents'],
        ['salive', 'liquide qui mouille la bouche'],
        ['bol alimentaire', 'aliments mâchés et mouillés, avalés en une fois'],
        ['chyme', 'bouillie formée par la digestion dans la bouche et l’estomac'],
        ['œsophage', 'conduit qui mène à l’estomac'],
        ['gros intestin', 'dernière partie du tube digestif'],
      ] as const)
      .slice(0, 5);
    return {
      prompt: `Relie chaque mot à sa définition : ${paires
        .map((p) => p[0])
        .sort()
        .join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Commence par les mots dont tu es sûr, puis termine par élimination.',
      steps: ['Chaque mot a un seul sens ici.', 'Chaque mot est relié à **sa** définition.'],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const cas = rng.pick([
      {
        q: 'Comment appelle-t-on l’action de broyer les aliments avec les dents ? Écris un mot.',
        accepte: ['mastication', 'la mastication', 'mastiquer', 'mâcher', 'macher', 'mâchage', 'machage', 'le mâchage'],
        mot: 'mastication',
        pieges: [
          ['digestion', 'La digestion regroupe toutes les transformations. Ici, on parle seulement des dents.'],
          ['salive', 'La salive est un liquide, pas l’action des dents.'],
        ],
      },
      {
        q: 'Comment appelle-t-on toutes les transformations des aliments dans le tube digestif ? Écris un mot.',
        accepte: ['digestion', 'la digestion'],
        mot: 'digestion',
        pieges: [
          ['mastication', 'La mastication est seulement le travail des dents.'],
          ['circulation', 'La circulation est le trajet du sang.'],
        ],
      },
      {
        q: 'Dans l’estomac, la bouchée devient une bouillie à moitié liquide. Quel est son nom savant ? Écris un mot.',
        accepte: ['chyme', 'le chyme', 'un chyme'],
        mot: 'chyme',
        pieges: [
          ['bol alimentaire', 'Le bol alimentaire, c’est avant : les aliments mâchés et mouillés qu’on avale.'],
          ['salive', 'La salive est le liquide de la bouche, pas la bouillie de l’estomac.'],
        ],
      },
      {
        q: 'Tu mâches et mouilles une bouchée, puis tu l’avales. Comment s’appelle ce que tu avales ? Écris deux mots.',
        accepte: ['bol alimentaire', 'le bol alimentaire', 'un bol alimentaire'],
        mot: 'bol alimentaire',
        pieges: [
          ['chyme', 'Le chyme vient après : c’est la bouillie formée dans l’estomac.'],
          ['salive', 'La salive mouille la bouchée, mais ce n’est pas la bouchée entière.'],
        ],
      },
    ] as const);
    const { answer, traps } = saisie(cas.accepte, cas.pieges);
    return {
      prompt: cas.q,
      answer,
      traps,
      hint: 'Demande-toi : à quel moment du voyage es-tu, et parle-t-on d’un geste ou de ce qu’il forme ?',
      steps: ['On cherche le mot exact.', `La réponse est **${cas.mot}**.`],
      targetSeconds: 35,
    };
  }
  const cas = rng.pick<{ bon: Cle; q: string }>([
    {
      bon: 'grele',
      q: 'Après la digestion, une partie des aliments digérés passe dans le sang. À travers la paroi de quelle partie ?',
    },
    { bon: 'grele', q: 'Quelle partie du tube digestif se trouve juste entre l’estomac et le gros intestin ?' },
    { bon: 'gros', q: 'Quelle partie du tube digestif vient juste après l’intestin grêle ?' },
    { bon: 'oesophage', q: 'Tu viens d’avaler une bouchée. Quel conduit traverse-t-elle avant l’estomac ?' },
  ]);
  const e = TRAJET[cas.bon];
  const intestin =
    cas.bon === 'grele' || cas.bon === 'gros'
      ? 'Précise lequel : il y a l’intestin grêle et le gros intestin.'
      : `Il y a deux intestins, et ils viennent après l’estomac. ${e.why}`;
  const { answer, traps } = saisie(e.accepte, [
    ...CLES.filter((k) => k !== cas.bon).map((k) => [TRAJET[k].nom, `${TRAJET[k].why} ${e.why}`] as const),
    ['intestin', intestin],
  ]);
  return {
    prompt: `${cas.q} Écris son nom.`,
    answer,
    traps,
    hint: 'Récite le trajet dans ta tête, en partant de la bouche.',
    steps: ['On suit le trajet dans l’ordre.', e.why, `La réponse est **${e.nom}**.`],
    targetSeconds: 40,
  };
};

const ALIMENTS = [
  { nom: 'une tartine', mot: 'la tartine' },
  { nom: 'un morceau de pomme', mot: 'la pomme' },
  { nom: 'une bouchée de riz', mot: 'le riz' },
] as const;

/** Moments du récit, dans l’ordre ; les noms des parties et des textures n’y figurent pas. */
const MOMENTS = [
  'Ses dents travaillent et sa bouche se remplit de salive.',
  'Il avale : tout descend par un long conduit.',
  'Une poche brasse longuement ce repas.',
  'Plus loin, dans un long tuyau, une partie passe dans le sang.',
] as const;

/** Une phrase fausse à la place d’un moment du récit. */
const ERREURS = [
  {
    rang: 0,
    faux: 'Ses dents travaillent et sa bouche sèche complètement.',
    why: 'Dans la bouche, la salive mouille les aliments : la bouche ne sèche pas.',
  },
  {
    rang: 1,
    faux: 'Il avale : tout descend directement dans le gros intestin.',
    why: 'Après la bouche, la bouchée passe par l’œsophage puis l’estomac. Le gros intestin vient en dernier.',
  },
  {
    rang: 2,
    faux: 'Une poche brasse ce repas, qui redevient un morceau entier.',
    why: 'Dans l’estomac, la digestion fait des aliments une bouillie : ils ne redeviennent pas entiers.',
  },
  {
    rang: 3,
    faux: 'Plus loin, le morceau entier passe tel quel dans le sang.',
    why: 'Seule une partie des aliments digérés passe dans le sang, après avoir été transformée.',
  },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const aliment = rng.pick(ALIMENTS);
  const document = (lines: readonly string[]) => ({
    kind: 'document' as const,
    title: 'Le voyage d’une bouchée',
    lines: [`Sami mange ${aliment.nom}.`, ...lines],
  });
  const figure = document(MOMENTS);
  const sujet = `Lis le récit sur ${aliment.mot}.`;
  const t = rng.int(0, 3);
  if (t === 0) {
    const bon = 'une bouillie à moitié liquide';
    const { answer, traps } = choice(rng, bon, [
      {
        label: 'des morceaux tout juste broyés et mouillés',
        why: 'C’est la forme dans la bouche, avant d’avaler : le bol alimentaire.',
      },
      { label: 'un morceau entier, comme dans l’assiette', why: 'Les dents l’ont déjà broyé dès le début du récit.' },
      { label: 'du sang', why: 'Les aliments ne se changent pas en sang dans la poche. Une partie y passe plus loin.' },
    ]);
    return {
      prompt: `${sujet} Après avoir été brassé dans la poche, à quoi ressemble le repas ?`,
      figure,
      answer,
      traps,
      hint: 'Trouve d’abord le nom de la poche. Que devient le repas à cet endroit ?',
      steps: ['La poche est l’estomac.', TEXTURE_WHY, `Réponse : **${bon}** (le chyme).`],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    return {
      prompt: `Les moments de l’histoire sont mélangés. Remets-les dans l’ordre.`,
      figure: {
        kind: 'document',
        title: 'Des notes en désordre',
        lines: [`Sami mange ${aliment.nom}. Ses notes sur le voyage de la bouchée se sont mélangées.`],
      },
      answer: ordre(rng, MOMENTS),
      hint: 'Commence par la bouche. On avale avant de brasser.',
      steps: [
        'La bouchée avance toujours dans le même sens.',
        'Bouche, œsophage, estomac, intestin grêle.',
        `Ordre : **${MOMENTS.join(' → ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (t === 2) {
    const e = rng.pick(ERREURS);
    const recit = MOMENTS.map((m, i) => (i === e.rang ? e.faux : m));
    const { answer, traps } = choice(
      rng,
      e.faux,
      recit
        .filter((m) => m !== e.faux)
        .map((label) => ({ label, why: `Cette phrase est juste. Cherche une phrase qui contredit le trajet.` })),
    );
    return {
      prompt: `${sujet} Une erreur s’est glissée dedans. Quelle phrase est fausse ?`,
      figure: document(recit),
      answer,
      traps,
      hint: 'Pour chaque phrase, demande-toi : où est la bouchée, et sous quelle forme ?',
      steps: ['On vérifie le trajet et les changements de texture.', e.why],
      targetSeconds: 70,
    };
  }
  const cas = rng.pick([
    {
      q: 'Comment s’appelle ce que Sami avale, après le travail des dents et de la salive ? Écris deux mots.',
      accepte: ['bol alimentaire', 'le bol alimentaire', 'un bol alimentaire'],
      mot: 'bol alimentaire',
      why: 'Les aliments mâchés et mouillés de salive, avalés en une fois, forment le bol alimentaire.',
      pieges: [
        ['chyme', 'Le chyme vient plus tard, après le brassage dans l’estomac.'],
        ['salive', 'La salive mouille la bouchée, mais ne la désigne pas.'],
      ],
    },
    {
      q: 'Quel est le nom de la poche qui brasse le repas dans ce récit ? Écris un mot.',
      accepte: TRAJET.estomac.accepte,
      mot: 'l’estomac',
      why: TRAJET.estomac.why,
      pieges: [
        ['œsophage', 'L’œsophage est le long conduit, avant la poche.'],
        ['intestin', 'L’intestin (grêle ou gros) vient après la poche.'],
      ],
    },
    {
      q: 'Où une partie du repas passe-t-elle dans le sang ? Écris le nom complet de cet endroit.',
      accepte: TRAJET.grele.accepte,
      mot: 'l’intestin grêle',
      why: TRAJET.grele.why,
      pieges: [
        ['intestin', 'Précise lequel : il y a l’intestin grêle et le gros intestin.'],
        ['gros intestin', 'Le gros intestin vient en dernier. Le passage dans le sang cité ici se fait avant.'],
      ],
    },
  ] as const);
  const { answer, traps } = saisie(cas.accepte, cas.pieges);
  return {
    prompt: `${sujet} ${cas.q}`,
    figure,
    answer,
    traps,
    hint: 'Repère le moment du voyage dont parle la question, puis rappelle-toi les noms du mémo.',
    steps: ['On retrouve ce moment dans le récit.', cas.why, `La réponse est **${cas.mot}**.`],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const digestion: Skill = {
  id: 'vcm2-digestion',
  title: 'La digestion',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **digestion** transforme les aliments. La **mastication** les broie et la **salive** les mouille : tu avales une sorte de pâte, le **bol alimentaire**. Il descend par l’**œsophage**.',
      'Dans l’**estomac**, il devient une bouillie, le **chyme**. Dans l’**intestin grêle**, une partie passe dans le sang. Le **gros intestin** vient en dernier !',
    ],
    source: `${PROGRAMME} : « Identifier et localiser la transformation des aliments dans l’appareil digestif (mastication par les dents, changements de texture lors du trajet) ». Trésor de la langue française (CNRTL), « bol » : « Quantité d'aliments mastiqués et imprégnés de salive déglutis en une seule fois » ; « chyme » : « Bouillie semi-liquide […] provenant de la digestion buccale et gastrique des aliments » ; « chyle » : « absorbé par la paroi de l’intestin grêle pour être conduit dans la circulation sanguine ».`,
    sources: [
      PROGRAMME,
      'cnrtl-digestion',
      'cnrtl-mastication',
      'cnrtl-dent',
      'cnrtl-salive',
      'cnrtl-bol',
      'cnrtl-chyme',
      'cnrtl-oesophage',
      'cnrtl-estomac',
      'cnrtl-intestin',
      'cnrtl-chyle',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
