import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, maj, notion, qcm, saisie } from './outils.ts';
import { de } from './systemes.ts';

// ——— Constituants des chaînes d'énergie et d'information, et leur fonction ———

interface Constituant {
  readonly nom: string;
  readonly chaine: 'énergie' | 'information';
  readonly role: string;
}

const ENERGIE: readonly Constituant[] = [
  { nom: 'la batterie', chaine: 'énergie', role: 'stocker de l’énergie, la fournir, puis se recharger' },
  { nom: 'l’interrupteur', chaine: 'énergie', role: 'ouvrir ou fermer le circuit à la main' },
  { nom: 'le relais', chaine: 'énergie', role: 'laisser passer ou non le courant selon un ordre reçu' },
  { nom: 'le moteur électrique', chaine: 'énergie', role: 'convertir l’énergie électrique en mouvement de rotation' },
  { nom: 'le radiateur électrique', chaine: 'énergie', role: 'convertir l’énergie électrique en chaleur' },
  { nom: 'la courroie et ses poulies', chaine: 'énergie', role: 'transmettre un mouvement entre deux roues éloignées' },
];

const INFORMATION: readonly Constituant[] = [
  { nom: 'le capteur de température', chaine: 'information', role: 'mesurer la température' },
  { nom: 'le capteur de présence', chaine: 'information', role: 'détecter une personne ou un objet' },
  { nom: 'le capteur de distance', chaine: 'information', role: 'mesurer l’éloignement d’un obstacle' },
  { nom: 'le microcontrôleur', chaine: 'information', role: 'traiter les informations en exécutant un programme' },
  { nom: 'l’afficheur', chaine: 'information', role: 'montrer des informations à l’usager' },
];

const TOUS = [...ENERGIE, ...INFORMATION];

const appartient = (c: Constituant) =>
  `${maj(c.nom)} a pour rôle de ${c.role} : ce constituant appartient à la chaîne d’${c.chaine}.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const info = rng.int(0, 1) === 0;
  const bon = rng.pick(info ? INFORMATION : ENERGIE);
  const autres = rng.shuffle(info ? ENERGIE : INFORMATION).slice(0, 2);
  return {
    prompt: `Lequel de ces constituants fait partie de la chaîne d’${info ? 'information' : 'énergie'} ?`,
    ...qcm(
      rng,
      bon.nom,
      autres.map((c) => ({ label: c.nom, why: appartient(c) })),
    ),
    hint: info
      ? 'Cherche celui qui s’occupe d’une information.'
      : 'Cherche celui qui s’occupe de l’énergie nécessaire à l’action.',
    steps: [appartient(bon), `La réponse est **${bon.nom}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const bon = rng.pick(TOUS);
  const autres = rng.shuffle(TOUS.filter((c) => c !== bon)).slice(0, 3);
  return {
    prompt: `Quel constituant a pour rôle de ${bon.role} ?`,
    ...qcm(
      rng,
      bon.nom,
      autres.map((c) => ({ label: c.nom, why: `Pour ${c.nom}, le rôle est différent : ${c.role}.` })),
    ),
    hint: 'Pour chaque proposition, demande-toi ce qu’elle reçoit et ce qu’elle fait.',
    steps: [`On cherche le constituant capable de ${bon.role}.`, `La réponse est **${bon.nom}**.`],
    targetSeconds: 35,
  };
};

interface Nomme {
  readonly description: string;
  readonly accepte: readonly string[];
  readonly erreurs: readonly (readonly [string, string])[];
}

const A_NOMMER: readonly Nomme[] = [
  {
    description: 'Ce constituant stocke de l’énergie électrique, alimente un objet et peut être rechargé.',
    accepte: ['batterie', 'la batterie', 'une batterie', 'accumulateur', 'un accumulateur', 'l’accumulateur'],
    erreurs: [
      ['pile', 'Une pile fournit de l’énergie, mais on la jette quand elle est vide : elle ne se recharge pas ici.'],
      ['moteur', 'Un moteur convertit l’énergie : il ne la stocke pas.'],
    ],
  },
  {
    description: 'Ce dispositif à deux positions, manœuvré à la main, ouvre ou ferme le circuit électrique.',
    accepte: ['interrupteur', 'l’interrupteur', 'un interrupteur'],
    erreurs: [
      ['relais', 'Le relais agit sur un ordre de la chaîne d’information, pas sous la main de l’usager.'],
      ['capteur', 'Un capteur mesure une grandeur : il appartient à la chaîne d’information.'],
    ],
  },
  {
    description: 'Ce composant laisse passer ou non l’électricité selon l’ordre reçu de la chaîne d’information.',
    accepte: ['relais', 'le relais', 'un relais'],
    erreurs: [
      ['interrupteur', 'L’interrupteur est manœuvré à la main ; ici la commande vient de la chaîne d’information.'],
      [
        'microcontrôleur',
        'Le microcontrôleur donne l’ordre ; ici on cherche le composant qui le reçoit pour distribuer.',
      ],
    ],
  },
  {
    description: 'Ce composant électronique programmable traite les informations venant des capteurs.',
    accepte: ['microcontrôleur', 'le microcontrôleur', 'un microcontrôleur', 'microcontroleur'],
    erreurs: [
      ['capteur', 'Le capteur recueille l’information ; il n’exécute pas le programme.'],
      ['relais', 'Le relais distribue l’énergie sur ordre : il ne traite pas les informations.'],
    ],
  },
  {
    description:
      'Cet instrument mesure une grandeur physique et transmet l’information sous forme de signal électrique.',
    accepte: ['capteur', 'le capteur', 'un capteur'],
    erreurs: [
      ['actionneur', 'Un actionneur agit ; ici on mesure.'],
      ['afficheur', 'Un afficheur montre une information à l’usager : il ne mesure rien.'],
    ],
  },
  {
    description: 'Cette machine, entraînée par un mouvement, produit de l’électricité.',
    accepte: [
      'génératrice',
      'la génératrice',
      'une génératrice',
      'generatrice',
      'générateur',
      'un générateur',
      'dynamo',
      'une dynamo',
      'alternateur',
      'un alternateur',
    ],
    erreurs: [
      ['moteur', 'Un moteur électrique fait l’inverse : il reçoit de l’électricité et produit un mouvement.'],
      ['batterie', 'Une batterie stocke l’énergie : elle ne la produit pas à partir d’un mouvement.'],
    ],
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const n = rng.pick(A_NOMMER);
  const [bon = ''] = n.accepte;
  return {
    prompt: `${n.description} Écris son nom.`,
    ...saisie(n.accepte, n.erreurs),
    hint: 'Repère le verbe de la description : stocker, couper, traiter, mesurer ou produire.',
    steps: ['Le rôle décrit permet de reconnaître le constituant.', `La réponse est **${bon}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const paires = rng
    .shuffle(TOUS)
    .slice(0, 5)
    .map((c) => [c.nom, c.role] as const);
  return {
    prompt: `Associe chacun des cinq constituants à son rôle : ${paires.map((p) => p[0]).join(', ')}.`,
    answer: association(rng, paires),
    hint: 'Sépare d’abord les constituants qui s’occupent de l’énergie de ceux qui s’occupent de l’information.',
    steps: [
      'Chaque constituant remplit un rôle précis dans l’une des deux chaînes.',
      `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 80,
  };
};

/** Systèmes automatisés complets : les deux chaînes d'un même objet. */
const AUTOMATISES = [
  {
    nom: 'un portail coulissant',
    capteur: 'le capteur de présence',
    mesure: 'détecte une voiture',
    alimentation: 'la prise reliée au réseau électrique',
    transmission: 'le pignon et la crémaillère',
  },
  {
    nom: 'une barrière de parking',
    capteur: 'le capteur de présence',
    mesure: 'détecte une voiture',
    alimentation: 'la batterie',
    transmission: 'les engrenages',
  },
  {
    nom: 'un ventilateur de serre',
    capteur: 'le capteur de température',
    mesure: 'mesure la température de l’air',
    alimentation: 'la batterie',
    transmission: 'la courroie et ses poulies',
  },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(AUTOMATISES);
  const figure = {
    kind: 'document' as const,
    title: `Fiche : ${s.nom}`,
    lines: [
      `${maj(s.capteur)} ${s.mesure}.`,
      'Le microcontrôleur exécute le programme.',
      `L’énergie est fournie par ce constituant : ${s.alimentation}.`,
      'Un ordre arrive sur le relais, qui laisse passer ou non le courant.',
      'Le moteur électrique reçoit le courant et se met à tourner.',
      `Le mouvement passe ensuite par ce mécanisme : ${s.transmission}.`,
    ],
  };
  const cibles = [
    { demande: 'acquiert l’information', bon: s.capteur },
    { demande: 'traite l’information', bon: 'le microcontrôleur' },
    { demande: 'distribue l’énergie', bon: 'le relais' },
    { demande: 'convertit l’énergie', bon: 'le moteur électrique' },
    { demande: 'transmet l’énergie jusqu’à l’action', bon: s.transmission },
    { demande: 'alimente le système en énergie', bon: s.alimentation },
  ];
  const cible = rng.pick(cibles);
  const autres = rng.shuffle(cibles.filter((x) => x !== cible)).slice(0, 3);
  return {
    prompt: `D’après la fiche ${de(s.nom)}, quel constituant ${cible.demande} ?`,
    figure,
    ...qcm(
      rng,
      cible.bon,
      autres.map((x) => ({ label: x.bon, why: `Sur la fiche, ce constituant est celui qui ${x.demande}.` })),
    ),
    hint: 'Retrouve la ligne de la fiche qui décrit cette action.',
    steps: [
      'Chaque ligne de la fiche décrit le rôle d’un constituant, dans l’une des deux chaînes.',
      `La réponse est **${cible.bon}**.`,
    ],
    targetSeconds: 55,
  };
};

export const constituants = notion(
  {
    id: 't4-constituants',
    title: 'Les constituants des deux chaînes',
    memo: [
      'Un constituant se reconnaît à ce qu’il fait. Énergie : batterie (stocke), interrupteur ou **relais** (laisse passer ou non), moteur ou radiateur (convertit), courroie ou **engrenage** (transmet).',
      'Information : **capteur** (mesure), **microcontrôleur** (traite), boutons et afficheur (échanges avec l’usager).',
    ],
    classe: '4e',
    attendu:
      'les élèves explorent et étudient les composants et les solutions techniques qui constituent les chaînes d’énergie et d’information',
    sources: [
      'eduscol-sti-alimenter-distribuer',
      'eduscol-sti-capteurs-ihm',
      'eduscol-sti-chaine-energie',
      'eduscol-sti-formes-energie',
      'eduscol-sti-trottinette',
      'academie-radiateur',
      'academie-generatrice',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
