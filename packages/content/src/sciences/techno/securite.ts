import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, formes, maj, notion, qcm, saisie } from './outils.ts';

// ——— Règles de sécurité d'un environnement numérique et respect de la propriété intellectuelle ———

interface Situation {
  readonly texte: string;
  readonly bonne: string;
  readonly fausses: readonly { label: string; why: string }[];
  readonly pourquoi: string;
}

const REFLEXES: readonly Situation[] = [
  {
    texte: 'Un logiciel de la tablette propose une mise à jour officielle.',
    bonne: 'installer la mise à jour',
    fausses: [
      { label: 'la refuser pour toujours', why: 'Sans mise à jour, le logiciel garde ses faiblesses connues.' },
      { label: 'supprimer tous ses fichiers', why: 'Supprimer des fichiers ne met pas le logiciel à jour.' },
    ],
    pourquoi: 'Les mises à jour font partie des pratiques de base de la sécurité numérique.',
  },
  {
    texte: 'Un travail important n’existe qu’en un seul exemplaire, sur une clé USB.',
    bonne: 'faire une sauvegarde sur un autre support',
    fausses: [
      { label: 'renommer le fichier', why: 'Un nouveau nom ne crée pas de copie en cas de perte.' },
      {
        label: 'attendre que la clé soit pleine',
        why: 'Une perte peut arriver avant : il faut une copie dès maintenant.',
      },
    ],
    pourquoi: 'Une sauvegarde est une copie qui protège les données contre leur disparition.',
  },
  {
    texte: 'Un message inconnu demande de cliquer vite sur un lien pour « sauver son compte ».',
    bonne: 'ne pas cliquer et prévenir un adulte',
    fausses: [
      {
        label: 'cliquer pour vérifier ce qu’il y a derrière',
        why: 'Cliquer peut ouvrir une page qui vole des informations.',
      },
      {
        label: 'répondre en envoyant son mot de passe',
        why: 'Un mot de passe ne s’envoie jamais en réponse à un message.',
      },
    ],
    pourquoi: 'Ce type de message trompeur (hameçonnage) cherche à obtenir des informations.',
  },
  {
    texte: 'Un camarade demande ton mot de passe pour se connecter à ta place.',
    bonne: 'refuser de le communiquer',
    fausses: [
      {
        label: 'le lui donner à voix basse',
        why: 'Même à voix basse, il pourrait se connecter en se faisant passer pour toi.',
      },
      { label: 'l’écrire sur la table', why: 'N’importe qui pourrait alors le lire et l’utiliser.' },
    ],
    pourquoi:
      'Le mot de passe sert à confirmer ton identité : le partager permet à autrui de se faire passer pour toi.',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(REFLEXES);
  return {
    prompt: `${s.texte} Quel est le bon réflexe ?`,
    ...qcm(rng, s.bonne, s.fausses),
    hint: 'Demande-toi quelle action protège le mieux tes données et ton compte.',
    steps: ['On cherche l’action qui protège les données.', s.pourquoi, `La réponse est **${s.bonne}**.`],
    targetSeconds: 30,
  };
};

type Notion = 'identification' | 'authentification' | 'sauvegarde' | 'trace numérique';
const TERMES: readonly Notion[] = ['identification', 'authentification', 'sauvegarde', 'trace numérique'];

const SENS: Record<Notion, string> = {
  identification: 'indiquer qui l’on est avec des données qui désignent une seule personne',
  authentification: 'confirmer que l’identité annoncée est bien la bonne',
  sauvegarde: 'copier des données sur un support pour ne pas les perdre',
  'trace numérique': 'information laissée par l’usage d’un appareil ou d’un service, comme une position géographique',
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(TERMES).slice(0, 3);
    const paires = trois.map((t) => [t, SENS[t]] as const);
    return {
      prompt: `Associe chaque mot à ce qu’il désigne : ${trois.join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Distingue « dire qui l’on est » et « le prouver ».',
      steps: [
        'Ces mots décrivent la sécurité et les informations laissées en ligne.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const t = rng.pick(TERMES);
  return {
    prompt: `Quel mot correspond à cette définition : « ${SENS[t]} » ?`,
    ...qcm(
      rng,
      t,
      TERMES.filter((x) => x !== t).map((x) => ({ label: x, why: `« ${maj(x)} » désigne : ${SENS[x]}.` })),
    ),
    hint: 'Se présenter, prouver, copier ou laisser une marque ?',
    steps: ['On retrouve le mot à partir de sa définition.', `${maj(t)} : ${SENS[t]}.`, `La réponse est **${t}**.`],
    targetSeconds: 35,
  };
};

const SAISIES: readonly { texte: string; mot: Notion; article: 'l’' | 'la' | 'une' }[] = [
  {
    texte: 'Pour ouvrir sa session, un élève saisit son mot de passe, qui confirme son identité.',
    mot: 'authentification',
    article: 'l’',
  },
  { texte: 'Un élève tape son nom d’utilisateur pour indiquer qui il est.', mot: 'identification', article: 'l’' },
  {
    texte: 'Chaque semaine, on copie les dossiers importants sur un disque externe pour ne pas les perdre.',
    mot: 'sauvegarde',
    article: 'la',
  },
  {
    texte: 'Après un trajet, le téléphone garde en mémoire les positions par lesquelles son propriétaire est passé.',
    mot: 'trace numérique',
    article: 'une',
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SAISIES);
  return {
    prompt: `${s.texte} Écris le mot (ou le groupe de mots) du vocabulaire de la sécurité numérique qui correspond.`,
    ...saisie(
      formes(s.mot, s.article),
      TERMES.filter((x) => x !== s.mot).map((x) => [x, `« ${maj(x)} » désigne : ${SENS[x]}.`] as const),
    ),
    hint: 'Cette action sert-elle à se présenter, à le prouver, à conserver ou à laisser une marque ?',
    steps: [
      'On repère ce que fait l’action décrite.',
      `${maj(s.mot)} : ${SENS[s.mot]}.`,
      `La réponse est **${s.mot}**.`,
    ],
    targetSeconds: 40,
  };
};

const REGLES: readonly { texte: string; regle: string }[] = [
  {
    texte: 'Un élève recopie plusieurs pages d’un roman récent et les met en ligne sans l’accord de l’auteur.',
    regle: 'obtenir l’accord de l’auteur avant de diffuser son œuvre',
  },
  {
    texte: 'Un exposé reprend des phrases d’un site en les présentant comme les siennes.',
    regle: 'ne pas présenter comme sien le travail d’autrui',
  },
  {
    texte: 'Un élève utilise le mot de passe d’un camarade, trouvé par hasard, pour entrer dans son compte.',
    regle: 'pas d’accès frauduleux à un système',
  },
  {
    texte: 'Un site veut enregistrer sur l’appareil des informations non indispensables pour suivre la navigation.',
    regle: 'consentement avant d’enregistrer des informations',
  },
  {
    texte: 'Un travail de groupe n’existe qu’en un seul fichier sur un seul ordinateur.',
    regle: 'sauvegarde des données',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const cinq = rng.shuffle(REGLES);
    const paires = cinq.map((r) => [r.texte, r.regle] as const);
    return {
      prompt: `Associe chaque situation à la règle concernée : ${paires.map((p) => p[0]).join(' ')}`,
      answer: association(rng, paires),
      hint: 'Pour chaque situation, repère ce qui est en jeu : une œuvre, un compte, un appareil ou un fichier.',
      steps: [
        'Chaque situation met en jeu une règle différente.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 100,
    };
  }
  if (sorte === 1) {
    const accord = rng.shuffle(['consentement', 'nom', 'prix']);
    const qualite = rng.shuffle(['illicite', 'conseillée', 'gratuite']);
    return {
      prompt: 'Complète la règle du droit d’auteur (Code de la propriété intellectuelle).',
      answer: {
        kind: 'cloze',
        parts: ['Toute reproduction d’une œuvre faite sans le ', ' de l’auteur est ', '.'],
        blanks: [
          { mode: 'list', options: accord, correct: accord.indexOf('consentement') },
          { mode: 'list', options: qualite, correct: qualite.indexOf('illicite') },
        ],
      },
      hint: 'L’auteur doit-il donner son accord ? Que se passe-t-il sans cet accord ?',
      steps: [
        'L’auteur d’une œuvre a des droits sur elle du seul fait de sa création.',
        'La réponse est : sans le **consentement** de l’auteur, la reproduction est **illicite**.',
      ],
      targetSeconds: 50,
    };
  }
  const r = rng.pick(REGLES);
  return {
    prompt: `${r.texte} Quelle règle est concernée ?`,
    ...qcm(
      rng,
      r.regle,
      REGLES.filter((x) => x !== r)
        .slice(0, 3)
        .map((x) => ({ label: x.regle, why: `« ${maj(x.regle)} » concerne une autre situation : ${x.texte}` })),
    ),
    hint: 'Qu’est-ce qui est menacé : le travail d’un auteur, un compte, un appareil ou des données ?',
    steps: [
      'On repère ce qui est menacé.',
      `La situation relève de la règle « ${r.regle} ».`,
      `La réponse est **${r.regle}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 1);
  if (sorte === 0) {
    const bonne = 'Ne pas cliquer et demander à un adulte de vérifier';
    const objet = rng.pick(['de la bibliothèque', 'de la cantine', 'de l’environnement numérique de travail']);
    return {
      prompt: `Lis ce message reçu au sujet du compte ${objet}. Quelle réaction respecte les règles de sécurité ?`,
      figure: {
        kind: 'document',
        title: 'Message reçu',
        lines: [
          'Expéditeur : adresse inconnue.',
          `« Votre compte ${objet} sera supprimé dans une heure. »`,
          '« Cliquez sur ce lien et saisissez votre mot de passe. »',
        ],
      },
      ...qcm(rng, bonne, [
        {
          label: 'Saisir vite son mot de passe pour sauver le compte',
          why: 'L’urgence est un piège : le mot de passe serait remis à un inconnu.',
        },
        {
          label: 'Transférer le message à tous les camarades pour les inviter à cliquer',
          why: 'Cela ferait courir le même risque à d’autres personnes.',
        },
        {
          label: 'Répondre à l’expéditeur en donnant son nom et sa classe',
          why: 'On donne alors des informations personnelles à un inconnu.',
        },
      ]),
      hint: 'Que cherche à obtenir cet expéditeur ?',
      steps: [
        'Expéditeur inconnu, urgence, demande de mot de passe : ce sont des signes d’hameçonnage.',
        'On ne suit pas le lien et on demande de l’aide.',
        `La réponse est **${bonne}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const sujet = rng.pick(['les volcans', 'les ponts', 'les énergies', 'les robots']);
  const bonne =
    'Demander l’accord de l’auteur ou utiliser une image dont la réutilisation est autorisée, puis la créditer';
  return {
    prompt: `Un élève prépare un exposé sur ${sujet} destiné à être publié sur le site du collège. Il trouve en ligne une photo signée d’un photographe. Que doit-il faire ?`,
    ...qcm(rng, bonne, [
      {
        label: 'La publier puisqu’elle est visible par tout le monde',
        why: 'Être visible en ligne ne donne pas le droit de reproduire une œuvre.',
      },
      {
        label: 'Effacer la signature avant de la publier',
        why: 'Effacer la signature n’enlève pas les droits de l’auteur : la reproduction reste sans consentement.',
      },
      {
        label: 'La publier en indiquant que c’est lui qui l’a prise',
        why: 'S’attribuer le travail d’autrui est un plagiat.',
      },
    ]),
    hint: 'À qui appartient la photo, et qui peut autoriser sa reproduction ?',
    steps: [
      'L’auteur d’une œuvre a des droits sur elle du seul fait de sa création.',
      'La reproduire sans son consentement est illicite.',
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 60,
  };
};

export const securite = notion(
  {
    id: 't5-securite-numerique',
    title: 'Règles et sécurité du numérique',
    memo: [
      'Protège ton environnement : **mises à jour**, mot de passe gardé pour toi, **sauvegarde** des données, méfiance face au **hameçonnage**. L’**identification** dit qui tu es, l’**authentification** le confirme.',
      'Une œuvre a un auteur : la reproduire sans son consentement est illicite (**propriété intellectuelle**). Citer ses sources évite le **plagiat**.',
    ],
    attendu:
      'Identifier des règles permettant de sécuriser un environnement numérique (bases de la cybersécurité) et des règles de respect de la propriété intellectuelle',
    sources: [
      'ue-cybersecurite-2019-881',
      'ue-nis2-2022-2555',
      'ue-eidas-910-2014',
      'academie-sauvegarde',
      'academie-plagiat',
      'cpi-l111-1',
      'cpi-l122-4',
      'code-penal-323-1',
      'loi-informatique-libertes-82',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
