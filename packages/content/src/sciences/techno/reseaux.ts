import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, formes, maj, notion, ordre, qcm, saisie } from './outils.ts';

// ——— Le réseau local : composants, liaisons, topologie, identification des terminaux ———

const TERMINAUX = [
  'un ordinateur portable',
  'une tablette',
  'une imprimante réseau',
  'un téléphone connecté au réseau',
  'un ordinateur fixe',
] as const;

const NON_TERMINAUX: readonly { nom: string; pourquoi: string }[] = [
  {
    nom: 'un commutateur',
    pourquoi: 'Un commutateur relie les appareils et dirige les trames : ce n’est pas un terminal.',
  },
  {
    nom: 'un routeur',
    pourquoi: 'Un routeur fait passer les paquets d’un réseau à un autre : ce n’est pas un terminal.',
  },
  { nom: 'un câble réseau', pourquoi: 'Un câble est une liaison filaire : il transporte les données.' },
  { nom: 'un point d’accès Wi-Fi', pourquoi: 'Un point d’accès donne une liaison sans fil aux appareils.' },
];

const LIAISONS: readonly { texte: string; filaire: boolean }[] = [
  { texte: 'Un ordinateur est branché au commutateur avec un câble.', filaire: true },
  { texte: 'Une tablette rejoint le réseau grâce au Wi-Fi.', filaire: false },
  { texte: 'Un téléphone se connecte au point d’accès sans aucun câble.', filaire: false },
  { texte: 'Une imprimante est reliée au commutateur par un câble.', filaire: true },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const bon = rng.pick(TERMINAUX);
    return {
      prompt:
        'Dans un réseau local, lequel de ces éléments est un terminal, c’est-à-dire un appareil dont on se sert au bout d’une liaison ?',
      ...qcm(
        rng,
        bon,
        rng
          .shuffle(NON_TERMINAUX)
          .slice(0, 2)
          .map((n) => ({ label: n.nom, why: n.pourquoi })),
      ),
      hint: 'Cherche l’appareil qu’une personne utilise pour envoyer ou recevoir des données.',
      steps: [
        'Un terminal est un appareil placé au bout du réseau, qui envoie ou reçoit des données pour son usager.',
        `Les autres éléments servent à relier les appareils.`,
        `La réponse est **${bon}**.`,
      ],
      targetSeconds: 25,
    };
  }
  const l = rng.pick(LIAISONS);
  const bonne = l.filaire ? 'une liaison filaire' : 'une liaison sans fil';
  return {
    prompt: `${l.texte} De quel type de liaison s’agit-il ?`,
    ...qcm(rng, bonne, [
      {
        label: l.filaire ? 'une liaison sans fil' : 'une liaison filaire',
        why: l.filaire
          ? 'Un câble transporte ici les données : la liaison n’est pas sans fil.'
          : 'Aucun câble n’est utilisé ici : la liaison n’est pas filaire.',
      },
      { label: 'aucune liaison', why: 'Pour communiquer sur un réseau, un appareil a besoin d’une liaison.' },
    ]),
    hint: 'Y a-t-il un câble entre les deux appareils ?',
    steps: [
      'On regarde ce qui relie les appareils.',
      'Avec un câble, la liaison est filaire ; avec le Wi-Fi, elle est sans fil.',
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 25,
  };
};

type Composant = 'commutateur' | 'routeur' | 'serveur' | 'point d’accès Wi-Fi';
const COMPOSANTS: readonly Composant[] = ['commutateur', 'routeur', 'serveur', 'point d’accès Wi-Fi'];

const ROLE: Record<Composant, string> = {
  commutateur: 'filtrer, transférer et distribuer les trames selon l’adresse de destination',
  routeur: 'transmettre des paquets d’un réseau à un autre',
  serveur: 'répondre aux demandes d’autres appareils ou d’utilisateurs connectés',
  'point d’accès Wi-Fi': 'offrir une connexion sans fil à plusieurs appareils',
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(COMPOSANTS).slice(0, 3);
    const paires = trois.map((c) => [c, ROLE[c]] as const);
    return {
      prompt: `Associe chaque composant à son rôle : ${paires.map((p) => p[0]).join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Repère les mots « trames », « d’un réseau à un autre », « demandes » ou « sans fil ».',
      steps: [
        'Chaque composant d’un réseau a un rôle précis.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const c = rng.pick(COMPOSANTS);
  return {
    prompt: `Quel composant sert à ${ROLE[c]} ?`,
    ...qcm(
      rng,
      c,
      COMPOSANTS.filter((x) => x !== c).map((x) => ({ label: x, why: `Le ${x} sert à ${ROLE[x]}.` })),
    ),
    hint: 'Pense aux mots clés : trames, plusieurs réseaux, demandes, sans fil.',
    steps: [
      'On retrouve le composant à partir de son rôle.',
      `Le ${c} sert à ${ROLE[c]}.`,
      `La réponse est **le ${c}**.`,
    ],
    targetSeconds: 35,
  };
};

/** Trajet d'un message entre deux terminaux reliés au même commutateur. */
const TRAJETS: readonly (readonly [string, string])[] = [
  ['l’ordinateur du bureau', 'l’imprimante'],
  ['le poste de l’atelier', 'le serveur de fichiers'],
  ['le poste de la salle informatique', 'le poste du professeur'],
  ['l’ordinateur d’accueil', 'le poste de la bibliothèque'],
];

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const [depart, arrivee] = rng.pick(TRAJETS);
    const suite = [
      `${maj(depart)} émet les données`,
      'les données suivent la première liaison',
      'le commutateur lit l’adresse de destination',
      'les données suivent la liaison choisie',
      `${maj(arrivee)} reçoit les données`,
    ];
    return {
      prompt: `Un réseau local relie ${depart} et ${arrivee} à un même commutateur. Range les étapes du trajet des données dans l’ordre.`,
      answer: ordre(rng, suite),
      hint: 'Les données partent d’un terminal, passent par le commutateur, puis arrivent à destination.',
      steps: [
        'Les données partent d’un terminal, traversent une liaison, puis le commutateur les dirige.',
        `L’ordre est : **${suite.join(' → ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const c = rng.pick(COMPOSANTS.filter((x) => x !== 'point d’accès Wi-Fi'));
  return {
    prompt: `Écris le nom du composant qui sert à ${ROLE[c]}.`,
    ...saisie(
      [...formes(c, 'le'), `un ${c}`],
      COMPOSANTS.filter((x) => x !== c).map((x) => [x, `Le ${x} sert à ${ROLE[x]}.`] as const),
    ),
    hint: 'Ce composant fait partie de ceux d’un réseau : relis les verbes du rôle demandé.',
    steps: ['On associe un rôle à un composant.', `Le ${c} sert à ${ROLE[c]}.`, `La réponse est **${c}**.`],
    targetSeconds: 40,
  };
};

interface Poste {
  readonly nom: string;
  readonly id: string;
}

const NOMS_POSTES = ['Poste A', 'Poste B', 'Poste C', 'Imprimante', 'Serveur de fichiers'] as const;

const postes = (rng: Rng, n: number): Poste[] => {
  const numeros = rng.shuffle([11, 12, 13, 14, 15, 16, 17, 18, 19]);
  return rng
    .shuffle(NOMS_POSTES)
    .slice(0, n)
    .map((nom, i) => ({ nom, id: `T-${numeros[i]}` }));
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const liste = postes(rng, 4);
    const cible = rng.pick(liste);
    return {
      prompt: `Dans ce réseau local, quel identifiant faut-il indiquer pour envoyer des données à : ${cible.nom} ?`,
      figure: {
        kind: 'document',
        title: 'Terminaux du réseau local',
        lines: liste.map((p) => `${p.nom} : identifiant ${p.id}`),
      },
      ...saisie(
        [cible.id],
        liste.filter((p) => p !== cible).map((p) => [p.id, `${p.id} est l’identifiant de : ${p.nom}.`] as const),
      ),
      hint: 'Chaque terminal a son propre identifiant : cherche la bonne ligne.',
      steps: [
        'Pour communiquer sur un réseau local, il faut identifier le terminal destinataire.',
        `Le terminal demandé est : ${cible.nom}.`,
        `La réponse est **${cible.id}**.`,
      ],
      targetSeconds: 35,
    };
  }
  if (sorte === 1) {
    const paires: readonly (readonly [string, string])[] = [
      ...COMPOSANTS.map((c) => [c, ROLE[c]] as const),
      ['liaison filaire', 'relier deux appareils par un câble'],
    ];
    const choisies = rng.shuffle(paires);
    return {
      prompt: `Associe chaque élément du réseau à son rôle : ${choisies.map((p) => p[0]).join(', ')}.`,
      answer: association(rng, choisies),
      hint: 'Commence par la liaison, puis distingue ce qui dirige, ce qui relie des réseaux et ce qui répond.',
      steps: [
        'Les composants d’un réseau ont des rôles différents.',
        `Réponse : **${choisies.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const c = rng.pick([
    {
      prompt: 'Pourquoi faut-il identifier chaque terminal d’un réseau local ?',
      bonne: 'pour que les données arrivent au bon terminal',
      pieges: [
        {
          label: 'pour que les câbles soient plus courts',
          why: 'L’identifiant ne change rien à la longueur des liaisons.',
        },
        {
          label: 'pour que les fichiers occupent moins d’octets',
          why: 'La taille d’un fichier ne dépend pas de l’identifiant du terminal.',
        },
        {
          label: 'pour que le Wi-Fi remplace le commutateur',
          why: 'Identifier un terminal ne change pas la liaison utilisée.',
        },
      ],
    },
    {
      prompt: 'Sur un réseau local, deux terminaux ont le même identifiant. Quel est le problème ?',
      bonne: 'on ne peut pas savoir à quel terminal les données sont destinées',
      pieges: [
        {
          label: 'les deux terminaux deviennent des commutateurs',
          why: 'Un identifiant ne change pas le rôle d’un appareil.',
        },
        { label: 'les données vont deux fois plus vite', why: 'Un doublon n’accélère rien : il crée une confusion.' },
        {
          label: 'tous les fichiers du réseau passent en lecture seule',
          why: 'Les droits sur les fichiers n’ont aucun lien avec ce doublon.',
        },
      ],
    },
  ]);
  return {
    prompt: c.prompt,
    ...qcm(rng, c.bonne, c.pieges),
    hint: 'Imagine deux maisons avec la même adresse : que se passe-t-il pour le courrier ?',
    steps: [
      'Sur un réseau, chaque terminal doit pouvoir être désigné sans ambiguïté.',
      'L’identifiant désigne le destinataire des données.',
      `La réponse est **${c.bonne}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const liste = rng.shuffle(NOMS_POSTES).slice(0, 4);
  const sansFil = rng.int(0, 3);
  const lines = [
    'Un commutateur est au centre du réseau local.',
    ...liste.map((nom, i) =>
      i === sansFil
        ? `${nom} : relié en Wi-Fi à un point d’accès, branché au commutateur.`
        : `${nom} : relié au commutateur par un câble.`,
    ),
  ];
  const figure = { kind: 'document' as const, title: 'Description d’un réseau local', lines };
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const cable = rng.pick(liste.filter((_, i) => i !== sansFil));
    const bonne = `${cable} seulement`;
    return {
      prompt: `Le câble de l’élément « ${cable} » est débranché. Quel élément ne peut plus communiquer sur le réseau ?`,
      figure,
      ...qcm(rng, bonne, [
        ...liste
          .filter((n) => n !== cable)
          .slice(0, 2)
          .map((n) => ({ label: `${n} seulement`, why: `La liaison de « ${n} » n’est pas touchée par ce câble.` })),
        { label: 'tous les éléments du réseau', why: 'Les autres ont leur propre liaison vers le commutateur.' },
      ]),
      hint: 'Chaque élément a sa propre liaison : laquelle est coupée ?',
      steps: [
        'Dans ce réseau, chaque élément a sa propre liaison vers le commutateur.',
        `Seule la liaison de « ${cable} » est coupée.`,
        `La réponse est **${bonne}**.`,
      ],
      targetSeconds: 55,
    };
  }
  if (sorte === 1) {
    const bonne = 'aucun élément ne peut plus communiquer avec les autres';
    return {
      prompt: 'Le commutateur tombe en panne. D’après la description, quelle conséquence est la bonne ?',
      figure,
      ...qcm(rng, bonne, [
        {
          label: 'seul l’élément en Wi-Fi ne peut plus communiquer avec les autres',
          why: 'Les éléments câblés passent aussi par le commutateur : ils sont touchés.',
        },
        {
          label: 'seuls les éléments câblés ne peuvent plus communiquer avec les autres',
          why: 'Le point d’accès Wi-Fi est lui aussi branché au commutateur.',
        },
        {
          label: 'rien ne change, les câbles suffisent',
          why: 'Sans commutateur, les trames ne sont plus transférées entre les liaisons.',
        },
      ]),
      hint: 'Regarde par quel appareil passent toutes les liaisons.',
      steps: [
        'Toutes les liaisons aboutissent au commutateur, directement ou par le point d’accès.',
        'Sans lui, les données ne sont plus transférées d’une liaison à l’autre.',
        `La réponse est **${bonne}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const bonne = 'en étoile';
  return {
    prompt: `D’après la description (${liste.join(', ')}), comment appelle-t-on la forme de ce réseau, c’est-à-dire sa topologie ?`,
    figure,
    ...qcm(rng, bonne, [
      { label: 'en anneau', why: 'Un anneau formerait une boucle : ici, les liaisons partent d’un centre.' },
      { label: 'en bus', why: 'Les appareils ne sont pas tous branchés le long d’une même ligne.' },
      { label: 'sans aucune liaison', why: 'Chaque élément a bien une liaison, filaire ou sans fil.' },
    ]),
    hint: 'Imagine le dessin : d’où partent les liaisons ?',
    steps: [
      'La topologie décrit la façon dont les composants sont reliés.',
      'Les liaisons rayonnent à partir du commutateur central.',
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 50,
  };
};

export const reseaux = notion(
  {
    id: 't5-reseaux',
    title: 'Le réseau local',
    memo: [
      'Un **réseau local** relie des **terminaux** (ordinateur, tablette, imprimante) par des **liaisons** filaires ou sans fil (Wi-Fi). Le **commutateur** distribue les données, le **routeur** les fait passer d’un réseau à un autre, le **serveur** répond aux demandes.',
      'La **topologie** est la forme du réseau : en étoile, tout part d’un centre. Chaque terminal doit être identifié pour recevoir ses données.',
    ],
    attendu:
      'Identifier les composants qui constituent un réseau local (terminaux, commutateurs, liaisons filaires et sans fil (WiFi)) et sa topologie',
    sources: ['ue-reglement-801-2013', 'academie-serveur', 'cnrtl-etoile'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
