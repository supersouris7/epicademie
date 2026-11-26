import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, maj, notion, ordre, qcm, saisie } from './outils.ts';
import {
  FONCTIONS_INFORMATION as F,
  ROLE_INFORMATION,
  de,
  SYSTEMES_INFORMATION,
  type FonctionInformation,
  type SystemeInformation,
} from './systemes.ts';

// ——— Chaîne d'information : acquérir, traiter, communiquer ———

const POURQUOI: Readonly<Record<FonctionInformation, string>> = {
  acquérir: 'Acquérir, c’est prélever une information : un capteur mesure, un bouton reçoit la consigne de l’usager.',
  traiter: 'Traiter, c’est exécuter le programme dans la partie commande, par exemple un microcontrôleur.',
  communiquer: 'Communiquer, c’est faire sortir le résultat : message pour l’usager ou ordre pour la chaîne d’énergie.',
};

const verbe = (bonne: FonctionInformation) =>
  saisie(
    [bonne, ...(bonne === 'acquérir' ? ['acquerir'] : []), `${bonne} l’information`, `${bonne} les informations`],
    [
      ...F.filter((f) => f !== bonne).map((f) => [f, POURQUOI[f]] as const),
      ['distribuer', 'Distribuer est une fonction de la chaîne d’énergie : laisser passer ou non l’énergie.'],
    ],
  );

const niveau1 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(F);
  return {
    prompt: `Dans la chaîne d’information, quelle fonction consiste à ${ROLE_INFORMATION[f]} ?`,
    ...qcm(rng, f, [
      { label: 'convertir', why: 'Convertir appartient à la chaîne d’énergie : changer la forme de l’énergie.' },
      { label: 'alimenter', why: 'Alimenter appartient à la chaîne d’énergie : fournir l’énergie.' },
    ]),
    hint: 'Écarte les verbes qui parlent d’énergie.',
    steps: [POURQUOI[f], `La réponse est **${f}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES_INFORMATION);
  if (rng.int(0, 1) === 0) {
    const paires = F.map((f) => [f, ROLE_INFORMATION[f]] as const);
    return {
      prompt: `La chaîne d’information ${de(s.nom)} a trois fonctions. Associe chacune à son rôle.`,
      answer: association(rng, paires),
      hint: 'L’information entre, elle est utilisée, puis un résultat sort.',
      steps: [
        'Chaque verbe correspond à un moment du trajet de l’information.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const f = rng.pick(F);
  const phrase: Record<FonctionInformation, string> = {
    acquérir: `${s.capteur} mesure ou repère ${s.grandeur}`,
    traiter: 'le microcontrôleur exécute le programme avec la donnée reçue',
    communiquer: `${s.sortie} informe l’usager`,
  };
  return {
    prompt: `Dans ${s.nom}, ${phrase[f]}. De quelle fonction s’agit-il ?`,
    ...qcm(rng, f, [
      ...F.filter((x) => x !== f).map((x) => ({ label: x, why: POURQUOI[x] })),
      {
        label: 'distribuer',
        why: 'Distribuer est une fonction de la chaîne d’énergie, pas de la chaîne d’information.',
      },
    ]),
    hint: 'L’information est-elle recueillie, utilisée par le programme ou envoyée vers l’extérieur ?',
    steps: [POURQUOI[f], `La réponse est **${f}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES_INFORMATION);
  if (rng.int(0, 1) === 0) {
    const suite = [
      `${s.capteur} prélève l’information`,
      'le microcontrôleur exécute le programme',
      'un ordre est envoyé à la chaîne d’énergie',
      `${s.actionneur} agit`,
    ].map(maj);
    return {
      prompt: `Dans ${s.nom}, range les étapes, depuis ${s.grandeur} jusqu’à l’action.`,
      answer: ordre(rng, suite),
      hint: 'Suis les trois verbes de la chaîne d’information ; l’action vient après.',
      steps: [
        'Acquérir, puis traiter, puis communiquer ; la chaîne d’énergie agit ensuite.',
        `L’ordre est : **${suite.join(' → ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const f = rng.pick(F);
  return {
    prompt: `Écris le verbe qui nomme cette fonction de la chaîne d’information : ${ROLE_INFORMATION[f]}.`,
    ...verbe(f),
    hint: 'Trois verbes : un pour l’entrée, un pour le programme, un pour la sortie.',
    steps: [POURQUOI[f], `La réponse est **${f}**.`],
    targetSeconds: 35,
  };
};

const CAS: readonly { texte: string; fonction: FonctionInformation }[] = [
  { texte: 'Un usager appuie sur un bouton pour donner sa consigne à une machine.', fonction: 'acquérir' },
  { texte: 'À l’avant d’un robot, un capteur à ultrasons mesure l’éloignement d’un mur.', fonction: 'acquérir' },
  { texte: 'Le programme compare la température reçue à la température demandée.', fonction: 'traiter' },
  {
    texte: 'Le microcontrôleur calcule, à partir des données reçues, s’il faut ouvrir la fenêtre.',
    fonction: 'traiter',
  },
  { texte: 'Un afficheur montre à l’usager la température de la pièce.', fonction: 'communiquer' },
  { texte: 'Un avertisseur sonore prévient les passants qu’un portail va bouger.', fonction: 'communiquer' },
  { texte: 'La partie commande envoie au relais l’ordre de laisser passer le courant.', fonction: 'communiquer' },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  return {
    prompt: `${c.texte} Quelle fonction de la chaîne d’information est décrite ? Écris le verbe.`,
    ...verbe(c.fonction),
    hint: 'Demande-toi si l’information entre, si elle est utilisée par le programme, ou si un résultat sort.',
    steps: [POURQUOI[c.fonction], `La réponse est **${c.fonction}**.`],
    targetSeconds: 40,
  };
};

const fiche = (s: SystemeInformation) => ({
  kind: 'document' as const,
  title: `Fiche : ${s.nom}`,
  lines: [
    `Capteur : ${s.capteur} (${s.grandeur}).`,
    'Partie commande : le microcontrôleur et son programme.',
    `Message pour l’usager : ${s.sortie}.`,
    `Chaîne d’énergie : ${s.actionneur}.`,
  ],
});

const PANNES: readonly { fonction: FonctionInformation; constat: (s: SystemeInformation) => string }[] = [
  {
    fonction: 'acquérir',
    constat: (s) =>
      `Le programme fonctionne, mais aucune donnée sur ${s.grandeur} ne parvient au microcontrôleur : le capteur est hors service.`,
  },
  {
    fonction: 'traiter',
    constat: () =>
      'Les données du capteur parviennent au microcontrôleur, mais le programme est bloqué : aucune décision n’est prise.',
  },
  {
    fonction: 'communiquer',
    constat: () =>
      'Le microcontrôleur prend la bonne décision, mais ni le message pour l’usager ni l’ordre pour la chaîne d’énergie ne sortent.',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES_INFORMATION);
  if (rng.int(0, 2) === 0) {
    const paires = [
      [maj(s.capteur), 'acquérir'],
      ['Le microcontrôleur', 'traiter'],
      [maj(s.sortie), 'communiquer'],
    ] as const;
    return {
      prompt: `Lis la fiche ${de(s.nom)}. Associe chaque constituant à sa fonction dans la chaîne d’information.`,
      figure: fiche(s),
      answer: association(rng, paires),
      hint: 'Repère sur la fiche ce qui mesure, ce qui exécute le programme et ce qui informe.',
      steps: [
        'La fiche suit le trajet de l’information.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const p = rng.pick(PANNES);
  return {
    prompt: `${p.constat(s)} Quelle fonction de la chaîne d’information n’est plus assurée ? Écris le verbe.`,
    figure: fiche(s),
    ...verbe(p.fonction),
    hint: 'Suis l’information sur la fiche : à quel endroit s’arrête-t-elle ?',
    steps: [
      `La fonction touchée est celle qui consiste à ${ROLE_INFORMATION[p.fonction]}.`,
      `La réponse est **${p.fonction}**.`,
    ],
    targetSeconds: 60,
  };
};

export const chaineInformation = notion(
  {
    id: 't4-chaine-information',
    title: 'La chaîne d’information',
    memo: [
      'La **chaîne d’information** a trois fonctions : acquérir (prélever les données), traiter (exécuter le programme), communiquer (informer l’usager ou donner un ordre à la chaîne d’énergie).',
      'Exemple d’une porte automatique : un **capteur** repère une personne, le **microcontrôleur** décide, l’ordre d’ouvrir part vers la chaîne d’énergie.',
    ],
    classe: '4e',
    attendu: 'Identifier les constituants de la chaîne d’information d’un objet réel et les associer à leur fonction',
    sources: ['eduscol-sti-chaine-information', 'eduscol-sti-capteurs-ihm'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
