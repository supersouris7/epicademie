import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, maj, notion, ordre, qcm, saisie } from './outils.ts';

// ——— Algorithme en langage naturel, programme, instructions, données utilisées et produites ———

interface Systeme {
  readonly nom: string;
  readonly besoin: string;
  /** Étapes d'un algorithme, dans le seul ordre qui répond au besoin. */
  readonly etapes: readonly [string, string, string, string];
}

const SYSTEMES: readonly Systeme[] = [
  {
    nom: 'un portail automatique',
    besoin: 'laisser passer une voiture après un appui sur la télécommande, puis se refermer',
    etapes: [
      'attendre un appui sur la télécommande',
      'ouvrir le portail jusqu’au bout',
      'attendre 30 secondes portail ouvert',
      'refermer le portail',
    ],
  },
  {
    nom: 'un distributeur de savon',
    besoin: 'donner une dose de savon quand une main se présente, puis s’arrêter',
    etapes: [
      'attendre qu’une main soit détectée',
      'mettre la pompe en marche',
      'laisser la pompe tourner 1 seconde',
      'arrêter la pompe',
    ],
  },
  {
    nom: 'une lampe de couloir',
    besoin: 'éclairer pendant une minute après un appui sur le bouton',
    etapes: ['attendre un appui sur le bouton', 'allumer la lampe', 'attendre 1 minute', 'éteindre la lampe'],
  },
  {
    nom: 'un arroseur de plante',
    besoin: 'arroser quand la terre est sèche, pendant quelques secondes seulement',
    etapes: [
      'attendre que la terre soit mesurée comme sèche',
      'ouvrir l’arrivée d’eau',
      'laisser couler l’eau 5 secondes',
      'fermer l’arrivée d’eau',
    ],
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES);
  if (rng.int(0, 1) === 0) {
    const bonne = `${maj(s.etapes[0])}, puis ${s.etapes[1]}, puis ${s.etapes[2]}, puis ${s.etapes[3]}.`;
    return {
      prompt: `Pour ${s.nom}, laquelle de ces propositions est un algorithme ?`,
      ...qcm(rng, bonne, [
        {
          label: `La liste des pièces nécessaires pour fabriquer ${s.nom}.`,
          why: 'Une liste de pièces ne dit pas quoi faire, ni dans quel ordre.',
        },
        {
          label: `Une photographie sur laquelle on voit ${s.nom}.`,
          why: 'Une photographie montre l’objet : elle ne décrit pas les étapes à suivre.',
        },
      ]),
      hint: 'Un algorithme dit quoi faire, et dans quel ordre.',
      steps: [
        'Un algorithme est une suite finie d’étapes à appliquer dans un ordre précis.',
        'Seule une proposition enchaîne des actions dans l’ordre.',
        `La réponse est **${bonne}**`,
      ],
      targetSeconds: 35,
    };
  }
  const bonne = 'un algorithme';
  return {
    prompt: `Pour ${s.nom}, un élève écrit avec des phrases la suite ordonnée des étapes à suivre. Comment appelle-t-on ce texte ?`,
    ...qcm(rng, bonne, [
      { label: 'un capteur', why: 'Un capteur est un appareil, pas un texte qui décrit des étapes.' },
      { label: 'un matériau', why: 'Un matériau est la matière dont une pièce est faite.' },
    ]),
    hint: 'C’est le nom d’une méthode écrite étape par étape.',
    steps: ['Le texte décrit des étapes dans un ordre précis.', `C’est **${bonne}**.`],
    targetSeconds: 25,
  };
};

const DEFINITIONS: readonly (readonly [string, string])[] = [
  ['un algorithme', 'une suite d’étapes dans un ordre précis, que l’on peut écrire avec des phrases'],
  ['un programme', 'une suite d’instructions écrites dans un langage informatique, qui commande un appareil'],
  ['une instruction', 'une consigne formulée dans un langage de programmation'],
];

const DONNEES: readonly {
  texte: string;
  utilisee: string;
  produite: string;
  intrus: readonly [string, string];
}[] = [
  {
    texte: 'Si la température mesurée dépasse 25 °C, alors mettre le ventilateur en marche, sinon l’arrêter.',
    utilisee: 'la température mesurée',
    produite: 'l’ordre de marche ou d’arrêt du ventilateur',
    intrus: ['la masse du ventilateur', 'la couleur de la pièce'],
  },
  {
    texte: 'Si une présence est détectée, alors allumer la lampe, sinon l’éteindre.',
    utilisee: 'la détection d’une présence',
    produite: 'l’ordre d’allumer ou d’éteindre la lampe',
    intrus: ['le prix de la lampe', 'la hauteur du plafond'],
  },
  {
    texte: 'Si la distance mesurée devant le robot est inférieure à 10 cm, alors arrêter les moteurs, sinon avancer.',
    utilisee: 'la distance mesurée',
    produite: 'l’ordre envoyé aux moteurs',
    intrus: ['le matériau du châssis', 'le nom du robot'],
  },
  {
    texte: 'Si la lumière mesurée est faible, alors fermer le volet, sinon l’ouvrir.',
    utilisee: 'la lumière mesurée',
    produite: 'l’ordre d’ouvrir ou de fermer le volet',
    intrus: ['la largeur de la fenêtre', 'la peinture du volet'],
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    return {
      prompt: 'Associe chaque mot à sa définition : un algorithme, un programme, une instruction.',
      answer: association(rng, DEFINITIONS),
      hint: 'Un seul de ces mots désigne une seule consigne ; un autre peut s’écrire avec des phrases.',
      steps: [
        'On distingue la méthode, sa traduction pour la machine et chacune des consignes.',
        `Réponse : **${DEFINITIONS.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const c = rng.pick(DONNEES);
  const utilisee = rng.int(0, 1) === 0;
  const bonne = utilisee ? c.utilisee : c.produite;
  const autre = utilisee ? c.produite : c.utilisee;
  return {
    prompt: `Voici un algorithme : « ${c.texte} » Quelle est la donnée ${utilisee ? 'utilisée' : 'produite'} par cet algorithme ?`,
    ...qcm(rng, bonne, [
      {
        label: autre,
        why: utilisee
          ? 'Cette donnée est le résultat du programme : elle est produite, pas utilisée.'
          : 'Cette donnée entre dans le programme : elle est utilisée, pas produite.',
      },
      { label: c.intrus[0], why: 'L’algorithme ne mentionne pas cette information.' },
      { label: c.intrus[1], why: 'L’algorithme ne mentionne pas cette information.' },
    ]),
    hint: 'Utilisée : ce que le programme consulte pour décider. Produite : l’ordre qu’il donne en retour.',
    steps: [
      'On cherche ce qui entre dans le programme et ce qui en sort.',
      `Entrée : ${c.utilisee}. Sortie : ${c.produite}.`,
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 50,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 3) === 0) {
    const s = rng.pick(SYSTEMES);
    return {
      prompt: `Pour ${s.nom}, un texte décrit avec des phrases, dans l’ordre, les étapes à suivre. Écris le nom de ce texte (un seul mot).`,
      ...saisie(
        ['algorithme', 'un algorithme', 'l’algorithme'],
        [
          ['programme', 'Un programme est écrit dans un langage informatique ; ici le texte est en phrases.'],
          ['instruction', 'Une instruction est une seule consigne ; ici il y a toute la suite des étapes.'],
        ],
      ),
      hint: 'Ce texte s’écrit avec des phrases, avant d’être traduit pour la machine.',
      steps: ['Les étapes sont décrites dans l’ordre, avec des phrases.', 'La réponse est **algorithme**.'],
      targetSeconds: 30,
    };
  }
  const s = rng.pick(SYSTEMES);
  return {
    prompt: `Besoin : ${s.nom} doit ${s.besoin}. Range les étapes de l’algorithme dans l’ordre.`,
    answer: ordre(rng, s.etapes),
    hint: 'Que faut-il attendre avant d’agir ? Qu’est-ce qui doit être commencé avant d’être arrêté ?',
    steps: [
      'Un algorithme s’exécute dans l’ordre : on attend, on agit, on laisse durer, puis on termine.',
      `L’ordre est : **${s.etapes.join(' → ')}**.`,
    ],
    targetSeconds: 55,
  };
};

interface Traduction {
  readonly objet: string;
  /** Grandeur mesurée, seuil, action si vrai, action sinon. */
  readonly grandeur: string;
  readonly comparaison: 'supérieure' | 'inférieure';
  readonly unite: string;
  readonly seuils: readonly number[];
  readonly oui: string;
  readonly non: string;
}

const TRADUCTIONS: readonly Traduction[] = [
  {
    objet: 'un ventilateur automatique',
    grandeur: 'température',
    comparaison: 'supérieure',
    unite: '°C',
    seuils: [22, 24, 26, 28],
    oui: 'mettre le ventilateur en marche',
    non: 'arrêter le ventilateur',
  },
  {
    objet: 'un robot',
    grandeur: 'distance',
    comparaison: 'inférieure',
    unite: 'cm',
    seuils: [5, 10, 15, 20],
    oui: 'arrêter les moteurs',
    non: 'faire avancer le robot',
  },
  {
    objet: 'un radiateur',
    grandeur: 'température',
    comparaison: 'inférieure',
    unite: '°C',
    seuils: [17, 18, 19, 20],
    oui: 'allumer le chauffage',
    non: 'éteindre le chauffage',
  },
];

/** Trou à liste : propositions mélangées. */
const liste = (rng: Rng, bonne: string, fausses: readonly string[]) => {
  const options = rng.shuffle([bonne, ...fausses]);
  return { mode: 'list' as const, options, correct: options.indexOf(bonne) };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.pick(TRADUCTIONS);
  const seuil = rng.pick(t.seuils);
  const lines = [
    'répéter indéfiniment',
    `    si ${t.grandeur} ${t.comparaison === 'supérieure' ? '>' : '<'} ${seuil} ${t.unite} alors`,
    `        ${t.oui}`,
    '    sinon',
    `        ${t.non}`,
  ];
  const autre = t.comparaison === 'supérieure' ? 'inférieure' : 'supérieure';
  return {
    prompt: `Traduis en langage naturel le programme d’${t.objet} (seuil : ${seuil} ${t.unite}). Complète le texte.`,
    figure: { kind: 'document', title: 'Programme', lines },
    answer: {
      kind: 'cloze',
      parts: [
        '',
        ' on recommence les actions suivantes. Si la valeur mesurée de la ',
        ' est ',
        ` à ${seuil} ${t.unite}, il faut `,
        ' ; sinon, il faut ',
        '.',
      ],
      blanks: [
        liste(rng, 'Sans arrêt,', ['Une seule fois,', 'Jamais,']),
        liste(rng, t.grandeur, [t.grandeur === 'distance' ? 'température' : 'distance', 'durée']),
        liste(rng, t.comparaison, [autre, 'égale']),
        liste(rng, t.oui, [t.non]),
        liste(rng, t.non, [t.oui]),
      ],
    },
    traps: [],
    hint: 'Le signe « > » se lit « est supérieur à » et « < » se lit « est inférieur à ».',
    steps: [
      '« Répéter indéfiniment » signifie que le programme recommence sans arrêt.',
      'La condition compare la mesure au seuil ; « alors » donne l’action si elle est vraie, « sinon » l’autre.',
      `Il faut donc **${t.oui}** si la ${t.grandeur} est ${t.comparaison} à ${seuil} ${t.unite}, sinon **${t.non}**.`,
    ],
    targetSeconds: 80,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.pick(TRADUCTIONS);
  const seuil = rng.pick(t.seuils);
  const ecart = rng.int(1, 3);
  const dessus = rng.int(0, 1) === 0;
  const mesure = dessus ? seuil + ecart : seuil - ecart;
  const vraie = t.comparaison === 'supérieure' ? mesure > seuil : mesure < seuil;
  const figure = {
    kind: 'document' as const,
    title: `Algorithme d’${t.objet}`,
    lines: [
      'Répéter sans arrêt :',
      `    mesurer la ${t.grandeur} ;`,
      `    si la ${t.grandeur} est ${t.comparaison} à ${seuil} ${t.unite}, ${t.oui} ;`,
      `    sinon, ${t.non}.`,
    ],
  };
  if (rng.int(0, 1) === 0) {
    const bonne = vraie ? t.oui : t.non;
    return {
      prompt: `La mesure vaut ${mesure} ${t.unite}. D’après l’algorithme, quelle action est commandée ?`,
      figure,
      ...qcm(rng, bonne, [
        {
          label: vraie ? t.non : t.oui,
          why: `Compare ${mesure} ${t.unite} au seuil de ${seuil} ${t.unite} : la condition est ${vraie ? 'vraie' : 'fausse'}.`,
        },
        { label: 'aucune action', why: 'L’algorithme prévoit une action dans les deux cas : « si » et « sinon ».' },
        {
          label: 'les deux actions en même temps',
          why: 'Avec « si… sinon », une seule des deux actions est exécutée à chaque passage.',
        },
      ]),
      hint: 'La condition est-elle vraie pour cette mesure ?',
      steps: [
        `La condition est : ${t.grandeur} ${t.comparaison} à ${seuil} ${t.unite}.`,
        `Avec ${mesure} ${t.unite}, elle est ${vraie ? 'vraie' : 'fausse'}.`,
        `L’action commandée est : **${bonne}**.`,
      ],
      targetSeconds: 50,
    };
  }
  // Modification du seuil : la mesure, strictement entre les deux seuils, fait changer l'action.
  const delta = rng.int(2, 4);
  const nouveau = dessus ? seuil + delta : seuil - delta;
  const entre = dessus ? seuil + rng.int(1, delta - 1) : seuil - rng.int(1, delta - 1);
  const apres = t.comparaison === 'supérieure' ? entre > nouveau : entre < nouveau;
  const bonne = apres ? t.oui : t.non;
  return {
    prompt: `On modifie l’algorithme d’${t.objet} : le seuil passe de ${seuil} ${t.unite} à ${nouveau} ${t.unite}. Après cette modification, quelle action est commandée pour une mesure de ${entre} ${t.unite} ?`,
    figure,
    ...qcm(rng, bonne, [
      {
        label: apres ? t.non : t.oui,
        why: `C’est l’action commandée avant la modification, avec le seuil de ${seuil} ${t.unite}. Le seuil vaut maintenant ${nouveau} ${t.unite}.`,
      },
      { label: 'aucune action', why: 'L’algorithme prévoit une action dans les deux cas : « si » et « sinon ».' },
      {
        label: 'les deux actions en même temps',
        why: 'Avec « si… sinon », une seule des deux actions est exécutée à chaque passage.',
      },
    ]),
    hint: 'Remplace l’ancien seuil par le nouveau dans la condition, puis teste la mesure.',
    steps: [
      `La nouvelle condition est : ${t.grandeur} ${t.comparaison} à ${nouveau} ${t.unite}.`,
      `Avec ${entre} ${t.unite}, elle est ${apres ? 'vraie' : 'fausse'}, alors qu’elle était ${apres ? 'fausse' : 'vraie'} avant la modification.`,
      `L’action commandée est : **${bonne}**.`,
    ],
    targetSeconds: 65,
  };
};

export const algorithme = notion(
  {
    id: 't5-algorithme',
    title: 'Algorithme et programme',
    memo: [
      'Un **algorithme** est une suite d’étapes à suivre dans un ordre précis pour résoudre un problème. On peut l’écrire avec des phrases. Traduit dans un langage informatique, il devient un **programme**, fait d’**instructions**.',
      'Un programme utilise des données (une mesure, un appui) et en produit d’autres (un ordre « allumer »). Exemple : « si la pièce est sombre, alors allumer la lampe ».',
    ],
    attendu:
      'Comprendre et traduire en un algorithme en langage naturel le programme associé à une fonctionnalité d’un OST',
    sources: ['academie-algorithme', 'academie-programme', 'academie-instruction'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
