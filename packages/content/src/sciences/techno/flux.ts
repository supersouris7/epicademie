import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, maj, notion, qcm, saisie } from './outils.ts';
import { de } from './systemes.ts';

// ——— Flux d'énergie, d'information et de matière ; conversions d'énergie ———

const TYPES = ['énergie', 'information', 'matière'] as const;
type Type = (typeof TYPES)[number];
const nomFlux = (t: Type) => (t === 'énergie' || t === 'information' ? `un flux d’${t}` : `un flux de ${t}`);

const DEFINITION: Readonly<Record<Type, string>> = {
  énergie: 'Un flux d’énergie fait circuler ce qui permet d’agir : courant d’alimentation, chaleur, mouvement.',
  information: 'Un flux d’information fait circuler une donnée : signal d’un capteur, message, ordre.',
  matière: 'Un flux de matière fait circuler quelque chose de matériel : eau, air, objets, aliments.',
};

const EXEMPLES: readonly { texte: string; type: Type }[] = [
  { texte: 'l’eau qui remplit le tambour d’un lave-linge', type: 'matière' },
  { texte: 'l’air et les poussières aspirés par un aspirateur', type: 'matière' },
  { texte: 'les colis déplacés sur un tapis roulant', type: 'matière' },
  { texte: 'les croquettes qui tombent d’un distributeur dans la gamelle', type: 'matière' },
  { texte: 'le courant qui alimente le moteur d’un ventilateur', type: 'énergie' },
  { texte: 'la chaleur qu’un radiateur diffuse dans la pièce', type: 'énergie' },
  { texte: 'le mouvement qu’une courroie amène du moteur à la roue', type: 'énergie' },
  { texte: 'le signal qu’un capteur de température envoie au microcontrôleur', type: 'information' },
  { texte: 'le message « porte ouverte » montré sur un afficheur', type: 'information' },
  { texte: 'l’ordre de marche envoyé par le microcontrôleur à un relais', type: 'information' },
];

const choisirFlux = (rng: Rng, bon: Type) =>
  qcm(
    rng,
    nomFlux(bon),
    TYPES.filter((t) => t !== bon).map((t) => ({ label: nomFlux(t), why: DEFINITION[t] })),
  );

const niveau1 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(EXEMPLES);
  return {
    prompt: `De quel flux s’agit-il : ${e.texte} ?`,
    ...choisirFlux(rng, e.type),
    hint: 'Est-ce une chose matérielle, ce qui permet d’agir, ou une donnée ?',
    steps: [DEFINITION[e.type], `C’est **${nomFlux(e.type)}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const paires = TYPES.map((t) => [maj(rng.pick(EXEMPLES.filter((e) => e.type === t)).texte), nomFlux(t)] as const);
  return {
    prompt: `Associe chaque exemple à son flux : ${rng
      .shuffle(paires)
      .map((p) => p[0].toLowerCase())
      .join(' ; ')}.`,
    answer: association(rng, paires),
    hint: 'Commence par l’exemple où l’on peut toucher ce qui circule.',
    steps: [
      'On regarde ce qui circule : de la matière, de l’énergie ou une information.',
      `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 45,
  };
};

interface Conversion {
  /** Constituant, avec sa précision éventuelle. */
  readonly nom: string;
  readonly entree: string;
  readonly sortie: string;
  readonly acceptees: readonly string[];
}

const variantes = (...mots: readonly string[]) =>
  mots.flatMap((m) => [m, `énergie ${m}`, `l’énergie ${m}`, `de l’énergie ${m}`]);

const MOTEUR: Conversion = {
  nom: 'un moteur électrique',
  entree: 'électrique',
  sortie: 'mécanique de rotation',
  acceptees: variantes('mécanique', 'cinétique', 'mécanique de rotation'),
};

const RADIATEUR: Conversion = {
  nom: 'un radiateur électrique',
  entree: 'électrique',
  sortie: 'thermique',
  acceptees: [...variantes('thermique'), 'chaleur', 'la chaleur', 'de la chaleur'],
};

const CONVERSIONS: readonly Conversion[] = [
  MOTEUR,
  {
    nom: 'un vérin électrique',
    entree: 'électrique',
    sortie: 'mécanique de translation',
    acceptees: variantes('mécanique', 'cinétique', 'mécanique de translation'),
  },
  { nom: 'une lampe', entree: 'électrique', sortie: 'lumineuse', acceptees: [...variantes('lumineuse'), 'lumière'] },
  RADIATEUR,
  {
    nom: 'une génératrice entraînée par une roue',
    entree: 'cinétique',
    sortie: 'électrique',
    acceptees: [...variantes('électrique'), 'électricité', 'de l’électricité', 'l’électricité'],
  },
];

const transformation = (c: Conversion) => `énergie ${c.entree} → énergie ${c.sortie}`;

const niveau3 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CONVERSIONS);
  const generatrice = c.entree !== 'électrique';
  const erreurs: (readonly [string, string])[] = [
    [c.entree, `L’énergie ${c.entree} est celle que reçoit ce constituant : on demande celle qu’il fournit.`],
    [
      'potentielle',
      'L’énergie potentielle est une réserve liée à la position : ce n’est pas ce que fournit ce constituant.',
    ],
    generatrice
      ? ['thermique', 'La chaleur n’est ici qu’une perte : la machine sert à produire une autre énergie.']
      : [
          'chimique',
          'L’énergie chimique est une réserve, par exemple dans une pile : ce constituant n’en produit pas.',
        ],
  ];
  return {
    prompt: `Quelle forme d’énergie utile fournit ${c.nom} ? Écris-la.`,
    ...saisie(c.acceptees, erreurs),
    hint: 'Observe ce que le constituant produit : mouvement, lumière, chaleur ou électricité.',
    steps: [
      `Ce constituant reçoit de l’énergie ${c.entree} et la convertit.`,
      `Il fournit de l’énergie **${c.sortie}**.`,
    ],
    targetSeconds: 35,
  };
};

/** Cas moins immédiats : un même support (fil, ondes, tuyau) peut porter des flux différents. */
const CAS_FINS: readonly { texte: string; type: Type }[] = [
  { texte: 'le courant qui recharge la batterie d’une trottinette', type: 'énergie' },
  { texte: 'le courant qui traverse un fil pour faire tourner un moteur', type: 'énergie' },
  { texte: 'le signal électrique qu’un capteur de distance envoie par un fil', type: 'information' },
  { texte: 'la consigne envoyée sans fil par une télécommande', type: 'information' },
  { texte: 'l’eau chaude qu’une cafetière verse dans la tasse', type: 'matière' },
  { texte: 'les grains de café qui descendent vers le broyeur', type: 'matière' },
];

const acceptes = (t: Type) => {
  const article = t === 'matière' ? 'de la ' : 'de l’';
  const flux = t === 'matière' ? `flux de ${t}` : `flux d’${t}`;
  return [t, `${article}${t}`, t === 'matière' ? `la ${t}` : `l’${t}`, flux, `un ${flux}`];
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = CONVERSIONS.map((c) => [c.nom, transformation(c)] as const);
    return {
      prompt: `Associe chaque constituant à la transformation d’énergie qu’il réalise : ${rng
        .shuffle(paires)
        .map((p) => p[0])
        .join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Pour chacun, cherche d’abord ce qu’il reçoit, puis ce qu’il produit.',
      steps: [
        'Une conversion change la forme de l’énergie : on lit l’entrée puis la sortie.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const cas = rng.pick(CAS_FINS);
  return {
    prompt: `Écris le nom de ce qui circule (énergie, information ou matière) : ${cas.texte}.`,
    ...saisie(
      acceptes(cas.type),
      TYPES.filter((t) => t !== cas.type).map((t) => [t, DEFINITION[t]] as const),
    ),
    hint: 'Demande-toi à quoi sert ce qui circule : agir, renseigner, ou être lui-même déplacé et transformé.',
    steps: [DEFINITION[cas.type], `La réponse est **${cas.type}**.`],
    targetSeconds: 35,
  };
};

const FICHES: readonly {
  nom: string;
  matiere: string;
  energie: string;
  information: string;
  conversion: Conversion;
}[] = [
  {
    nom: 'un lave-linge',
    matiere: 'L’eau entre dans le tambour.',
    energie: 'Le courant du réseau alimente le moteur.',
    information: 'Le capteur de niveau envoie un signal au microcontrôleur.',
    conversion: MOTEUR,
  },
  {
    nom: 'un sèche-mains',
    matiere: 'L’air est soufflé sur les mains.',
    energie: 'Le courant du réseau alimente la résistance chauffante.',
    information: 'Le capteur de présence envoie un signal au microcontrôleur.',
    conversion: { ...RADIATEUR, nom: 'la résistance chauffante' },
  },
  {
    nom: 'un distributeur de croquettes',
    matiere: 'Les croquettes tombent dans la gamelle.',
    energie: 'La batterie alimente le moteur.',
    information: 'Le bouton envoie la demande au microcontrôleur.',
    conversion: MOTEUR,
  },
  {
    nom: 'une serre automatisée',
    matiere: 'L’eau d’arrosage coule jusqu’aux plantes.',
    energie: 'Le courant alimente le moteur de la pompe.',
    information: 'Le capteur d’humidité envoie un signal au microcontrôleur.',
    conversion: MOTEUR,
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(FICHES);
  const lignes = rng.shuffle([
    [f.matiere, 'matière'],
    [f.energie, 'énergie'],
    [f.information, 'information'],
  ] as const);
  const figure = {
    kind: 'document' as const,
    title: `Fiche : ${f.nom}`,
    lines: lignes.map((l) => l[0]),
  };
  if (rng.int(0, 1) === 0) {
    const paires = lignes.map(([, t], k) => [`la ligne ${k + 1}`, nomFlux(t)] as const);
    return {
      prompt: `Lis la fiche ${de(f.nom)}. Associe chaque ligne au flux qu’elle décrit.`,
      figure,
      answer: association(rng, paires),
      hint: 'Dans chaque ligne, repère ce qui se déplace.',
      steps: [
        'On caractérise un flux par ce qui circule.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const c = f.conversion;
  // « le moteur électrique » ou « la résistance chauffante » de la fiche.
  const sujet = c.nom.startsWith('un ') ? 'le moteur' : c.nom;
  return {
    prompt: `Dans ${f.nom}, quelle transformation d’énergie réalise ${sujet} ?`,
    figure,
    ...qcm(rng, transformation(c), [
      {
        label: `énergie ${c.sortie} → énergie ${c.entree}`,
        why: 'Le sens est inversé : l’entrée est ce que le constituant reçoit.',
      },
      {
        label: 'énergie électrique → énergie lumineuse',
        why: 'C’est la transformation réalisée par une lampe : ce constituant n’est pas là pour éclairer.',
      },
      {
        label: 'énergie lumineuse → énergie électrique',
        why: 'Ce constituant reçoit du courant : son entrée est électrique.',
      },
    ]),
    hint: 'La fiche indique ce qui alimente ce constituant ; demande-toi ensuite ce qu’il produit.',
    steps: [
      `Le courant l’alimente (entrée électrique) et il produit de l’énergie ${c.sortie}.`,
      `La réponse est **${transformation(c)}**.`,
    ],
    targetSeconds: 55,
  };
};

export const flux = notion(
  {
    id: 't4-flux',
    title: 'Flux et transformations d’énergie',
    memo: [
      'Dans un système, trois sortes de **flux** circulent : l’énergie (ce qui permet d’agir), l’information (une donnée ou un ordre) et la matière (eau, air, objets).',
      'Un convertisseur change la forme de l’énergie : le moteur reçoit de l’électricité et fournit un mouvement ; la **génératrice** fait l’inverse.',
    ],
    classe: '4e',
    attendu: 'Les flux d’information, d’énergie et de matière sont abordés et caractérisés',
    sources: [
      'eduscol-sti-chaine-energie',
      'eduscol-sti-formes-energie',
      'eduscol-sti-actionneurs',
      'academie-radiateur',
      'academie-generatrice',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
