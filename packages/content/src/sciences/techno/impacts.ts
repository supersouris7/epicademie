import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, formes, maj, notion, qcm, saisie } from './outils.ts';

// ——— Systèmes d'information, partage, responsabilité de chacun face aux dérives, incidences ———

const PERSONNELLES = [
  'le nom et le prénom d’une personne',
  'la position géographique du téléphone d’une personne',
  'le numéro qui identifie un élève',
  'l’identifiant en ligne d’un utilisateur',
] as const;

const NON_PERSONNELLES: readonly string[] = [
  'la température mesurée dans une serre',
  'la longueur d’un pont',
  'la masse d’un colis vide',
  'la capacité d’une clé USB neuve',
  'la hauteur d’une montagne',
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const bonne = rng.pick(PERSONNELLES);
  return {
    prompt: 'Laquelle de ces informations est une donnée personnelle ?',
    ...qcm(
      rng,
      bonne,
      rng
        .shuffle(NON_PERSONNELLES)
        .slice(0, 2)
        .map((x) => ({ label: x, why: `« ${maj(x)} » ne se rapporte à aucune personne identifiée ou identifiable.` })),
    ),
    hint: 'Une donnée personnelle se rapporte à une personne que l’on peut reconnaître.',
    steps: [
      'Une donnée personnelle se rapporte à une personne identifiée ou identifiable.',
      'Un nom, un numéro, une position ou un identifiant en ligne peuvent désigner une personne.',
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 25,
  };
};

type Derive = 'cyberharcèlement' | 'usurpation d’identité' | 'atteinte à la vie privée' | 'accès frauduleux';
const DERIVES: readonly Derive[] = [
  'cyberharcèlement',
  'usurpation d’identité',
  'atteinte à la vie privée',
  'accès frauduleux',
];

const SENS: Record<Derive, string> = {
  cyberharcèlement: 'des messages agressifs répétés, envoyés par voie électronique contre une personne',
  'usurpation d’identité':
    'le fait de se faire passer pour une autre personne pour lui nuire ou troubler sa tranquillité',
  'atteinte à la vie privée': 'le fait de dévoiler ou d’exposer ce qui relève de l’intimité d’une personne',
  'accès frauduleux': 'le fait d’entrer ou de rester sans autorisation dans un compte ou un système',
};

const CAS: readonly { texte: string; derive: Derive }[] = [
  {
    texte: 'Pendant des semaines, un élève reçoit chaque soir des messages moqueurs d’un groupe.',
    derive: 'cyberharcèlement',
  },
  {
    texte:
      'Plusieurs élèves envoient, l’un après l’autre, des messages blessants au même camarade, en sachant que d’autres le font aussi.',
    derive: 'cyberharcèlement',
  },
  {
    texte: 'Quelqu’un crée un compte au nom d’un camarade et publie des messages qui lui font du tort.',
    derive: 'usurpation d’identité',
  },
  {
    texte: 'Une personne utilise le nom et la photo d’une autre pour envoyer des insultes en son nom.',
    derive: 'usurpation d’identité',
  },
  {
    texte: 'Un élève diffuse sans accord une photo prise chez un camarade, dans sa chambre.',
    derive: 'atteinte à la vie privée',
  },
  {
    texte: 'Le contenu d’un message personnel est recopié et affiché devant toute la classe sans accord.',
    derive: 'atteinte à la vie privée',
  },
  {
    texte: 'Un élève devine le mot de passe d’un autre et entre dans son espace numérique sans autorisation.',
    derive: 'accès frauduleux',
  },
  {
    texte: 'Une personne contourne la protection d’un système pour consulter des dossiers auxquels elle n’a pas droit.',
    derive: 'accès frauduleux',
  },
];

const why = (d: Derive) => `« ${maj(d)} » désigne ${SENS[d]}.`;

const niveau2 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  return {
    prompt: `${c.texte} De quelle dérive s’agit-il surtout ?`,
    ...qcm(
      rng,
      c.derive,
      DERIVES.filter((d) => d !== c.derive).map((d) => ({ label: d, why: why(d) })),
    ),
    hint: 'Répétition, faux nom, intimité dévoilée ou entrée sans autorisation ?',
    steps: ['On cherche ce qui caractérise la situation.', why(c.derive), `La réponse est **${c.derive}**.`],
    targetSeconds: 40,
  };
};

const ROLES_SI: readonly { texte: string; bonne: string }[] = [
  {
    texte:
      'Au collège, les notes et les devoirs sont saisis dans un espace numérique, puis consultés par les familles.',
    bonne: 'stocker des données et les partager avec les personnes autorisées',
  },
  {
    texte:
      'Dans une bibliothèque, les emprunts sont enregistrés, et les agents consultent la liste des livres disponibles.',
    bonne: 'enregistrer des données et les rendre consultables par plusieurs personnes',
  },
];

const ACCEPTEES = {
  'usurpation d’identité': [...formes('usurpation d’identité', 'l’'), 'une usurpation d’identité'],
  cyberharcèlement: [
    ...['cyberharcèlement', 'cyber-harcèlement', 'cyber harcèlement'].flatMap((m) => [...formes(m, 'le'), `un ${m}`]),
    ...formes('harcèlement en ligne', 'le'),
    ...formes('harcèlement numérique', 'le'),
  ],
} as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 1);
  if (sorte === 0) {
    const cas = rng.pick(CAS.filter((c) => c.derive === 'cyberharcèlement' || c.derive === 'usurpation d’identité'));
    const d = cas.derive as keyof typeof ACCEPTEES;
    return {
      prompt: `${cas.texte} Écris le nom de la dérive.`,
      ...saisie(
        ACCEPTEES[d],
        DERIVES.filter((x) => x !== d).map((x) => [x, why(x)] as const),
      ),
      hint: 'S’agit-il de messages répétés ou d’un faux nom ?',
      steps: ['On cherche le nom précis de la dérive.', why(d), `La réponse est **${d}**.`],
      targetSeconds: 45,
    };
  }
  return {
    prompt: 'Écris le numéro national contre le harcèlement et le cyberharcèlement (4 chiffres).',
    ...saisie(
      ['3018', '30 18'],
      [
        ['3020', 'Le numéro national unique pour le harcèlement et le cyberharcèlement est aujourd’hui le 3018.'],
        ['17', 'Le 17 est le numéro de la police et de la gendarmerie en urgence ; le numéro demandé a 4 chiffres.'],
      ],
    ),
    hint: 'Un numéro à 4 chiffres, le même contre le harcèlement et le cyberharcèlement.',
    steps: [
      'Un numéro national unique permet d’alerter en cas de harcèlement.',
      'Le même numéro sert aussi pour le cyberharcèlement.',
      'La réponse est le **3018**.',
    ],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 1);
  if (sorte === 0) {
    const cinq: readonly (readonly [string, string])[] = [
      ...DERIVES.map((d) => [d, SENS[d]] as const),
      ['donnée personnelle', 'information qui se rapporte à une personne identifiée ou identifiable'],
    ];
    const paires = rng.shuffle(cinq);
    return {
      prompt: `Associe chaque mot à sa définition : ${paires.map((p) => p[0]).join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Commence par les mots qui contiennent un indice : « identité », « privée ».',
      steps: [
        'Chaque mot décrit une donnée ou une dérive précise.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 90,
    };
  }
  const c = rng.pick([
    {
      texte: 'Un élève reçoit dans un groupe un message qui humilie un camarade, déjà visé plusieurs fois.',
      bonne: 'ne pas le relayer, garder une preuve et alerter un adulte',
      fausses: [
        {
          label: 'le relayer à d’autres, puisqu’il n’en est pas l’auteur',
          why: 'Relayer ajoute une agression de plus : chacun est responsable de ce qu’il envoie.',
        },
        {
          label: 'ajouter un commentaire moqueur pour suivre le groupe',
          why: 'Participer à la répétition engage sa responsabilité.',
        },
        {
          label: 'ne rien faire, car cela ne concerne que la victime',
          why: 'La victime a du mal à se défendre seule : alerter un adulte l’aide.',
        },
      ],
    },
    {
      texte: 'Un élève trouve la session d’un camarade restée ouverte sur un ordinateur du collège.',
      bonne: 'fermer la session sans rien consulter et prévenir son camarade',
      fausses: [
        { label: 'publier un message amusant à sa place', why: 'Écrire en son nom, c’est se faire passer pour lui.' },
        { label: 'lire ses messages puis les raconter', why: 'Ses messages relèvent de sa vie privée.' },
        {
          label: 'noter son mot de passe pour plus tard',
          why: 'Garder son accès pour s’en servir sans autorisation est interdit.',
        },
      ],
    },
    {
      texte: 'Un élève veut publier une photo de groupe où l’on reconnaît ses camarades.',
      bonne: 'demander l’accord des personnes reconnaissables avant de publier',
      fausses: [
        {
          label: 'publier d’abord et demander ensuite',
          why: 'Une fois publiée, l’image peut être copiée : l’accord vient avant.',
        },
        {
          label: 'publier sans demander, puisque c’est lui qui a pris la photo',
          why: 'Prendre la photo ne supprime pas le droit des autres au respect de leur vie privée.',
        },
        {
          label: 'ajouter les noms de chacun pour que tout le monde les reconnaisse',
          why: 'Ajouter les noms diffuse encore plus de données personnelles.',
        },
      ],
    },
  ]);
  return {
    prompt: `${c.texte} Quel comportement est responsable ?`,
    ...qcm(rng, c.bonne, c.fausses),
    hint: 'Pense aux conséquences pour la personne concernée.',
    steps: [
      'Chacun est responsable de ce qu’il publie, relaie ou consulte.',
      'On protège la personne concernée et on demande de l’aide si besoin.',
      `La réponse est **${c.bonne}**.`,
    ],
    targetSeconds: 50,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const bonne =
      'En 2020, environ une part sur dix de l’électricité consommée en France dans l’année allait au numérique';
    return {
      prompt: 'D’après ce document sur les incidences du numérique, quelle affirmation est exacte ?',
      figure: {
        kind: 'document',
        title: 'Numérique et environnement',
        credit: 'Ministère de la Transition écologique',
        lines: [
          'En 2020, le numérique représentait 2,5 % de l’empreinte carbone annuelle de la France',
          'et 10 % de sa consommation électrique annuelle.',
        ],
      },
      ...qcm(rng, bonne, [
        {
          label: 'En 2020, environ une part sur dix de l’empreinte carbone annuelle de la France venait du numérique',
          why: 'Une part sur dix, soit 10 %, concerne l’électricité ; pour l’empreinte carbone, le document donne 2,5 %.',
        },
        {
          label: 'En 2020, le numérique pesait plus lourd dans l’empreinte carbone que dans la consommation électrique',
          why: 'C’est l’inverse : 2,5 % de l’empreinte carbone, contre 10 % de la consommation électrique.',
        },
        {
          label: 'En 2020, la plus grande partie de l’électricité consommée en France allait au numérique',
          why: '10 % est une petite partie du total : la plus grande partie dépasserait 50 %.',
        },
      ]),
      hint: 'Associe chaque pourcentage à la bonne grandeur.',
      steps: [
        'Le document donne deux grandeurs : empreinte carbone et consommation électrique.',
        '2,5 % porte sur l’empreinte carbone, 10 % sur l’électricité.',
        '10 %, c’est environ une part sur dix.',
        `La réponse est : **${bonne}**.`,
      ],
      targetSeconds: 55,
    };
  }
  if (sorte === 1) {
    const r = rng.pick(ROLES_SI);
    return {
      prompt: `${r.texte} Quel est ici le rôle du système d’information ?`,
      ...qcm(rng, r.bonne, [
        {
          label: 'stocker des données sans permettre à d’autres personnes de les consulter',
          why: 'Ici, les données saisies sont justement consultées ensuite : elles sont partagées.',
        },
        {
          label: 'rendre les données visibles et modifiables par n’importe qui',
          why: 'Le partage est réservé aux personnes autorisées, pour protéger les données.',
        },
        {
          label: 'transmettre des données une seule fois, sans les conserver',
          why: 'Pour consulter les données plus tard, il faut les conserver.',
        },
      ]),
      hint: 'Que deviennent les données après leur saisie ?',
      steps: [
        'Un système d’information réunit des appareils et des données stockées, traitées et transmises.',
        'Ici, les données saisies sont ensuite consultées par d’autres.',
        `La réponse est **${r.bonne}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const nombre = rng.int(3, 6);
  const bonne =
    'chaque élève qui envoie un message blessant participe à la répétition et peut être tenu pour responsable';
  return {
    prompt: `Lis le récit. Quelle phrase décrit correctement la responsabilité des élèves ?`,
    figure: {
      kind: 'document',
      title: 'Récit',
      lines: [
        `Dans un groupe en ligne, ${nombre} élèves envoient chacun un seul message blessant au même camarade.`,
        'Chacun a lu les messages des autres avant d’écrire le sien.',
      ],
    },
    ...qcm(rng, bonne, [
      {
        label: 'personne n’est responsable, car chacun n’a écrit qu’une fois',
        why: 'La loi vise aussi des messages successifs de plusieurs personnes qui savent qu’ils se répètent.',
      },
      {
        label: 'seul le premier élève qui a écrit est responsable',
        why: 'Les suivants savaient qu’ils ajoutaient une agression : ils sont aussi concernés.',
      },
      {
        label: 'ce n’est pas grave, puisque cela se passe seulement en ligne',
        why: 'Le recours à un moyen numérique n’efface rien : la loi le retient même comme une circonstance aggravante.',
      },
    ]),
    hint: 'Que savait chaque élève au moment d’écrire ?',
    steps: [
      'Des messages successifs de plusieurs personnes peuvent former une répétition.',
      'Chacun savait que d’autres avaient déjà écrit.',
      `La réponse est : **${bonne}**.`,
    ],
    targetSeconds: 65,
  };
};

export const impacts = notion(
  {
    id: 't5-impacts-numerique',
    title: 'Impacts du numérique sur la société',
    memo: [
      'Un **système d’information** stocke et partage des données. Les **données personnelles** désignent quelqu’un : on les protège, comme sa **vie privée**.',
      'Chacun est responsable : se faire passer pour autrui afin de lui nuire (**usurpation d’identité**) ou participer à un **cyberharcèlement** est puni par la loi. Victime ou témoin : garde une preuve, alerte un adulte, contacte le 3018.',
    ],
    attendu:
      'Appréhender la responsabilité de chacun dans les dérives (cyberviolence, atteinte à la vie privée, aux données personnelles, usurpation d’identité)',
    sources: [
      'rgpd-2016-679',
      'code-civil-9',
      'code-penal-226-4-1',
      'code-penal-222-33-2-2',
      'code-penal-323-1',
      'education-cyberharcelement',
      'education-politique-harcelement',
      'ue-nis2-2022-2555',
      'ecologie-numerique-responsable',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
