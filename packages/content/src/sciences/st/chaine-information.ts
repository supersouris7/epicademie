import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Objets programmables : capteurs, actionneurs, chaînes d'information et d'action (cours moyen) ———

interface Element {
  readonly nom: string;
  readonly capteur: boolean;
  readonly why: string;
}

const CAPTEURS: readonly Element[] = [
  { nom: 'le microphone d’un robot', capteur: true, why: 'Il capte les sons : il recueille une information.' },
  {
    nom: 'la cellule qui mesure la lumière',
    capteur: true,
    why: 'Elle mesure la lumière : elle recueille une information.',
  },
  {
    nom: 'la sonde de température d’une mini-serre',
    capteur: true,
    why: 'Elle mesure la température : elle recueille une information.',
  },
  { nom: 'le lecteur de badge d’un portail', capteur: true, why: 'Il lit le badge : il recueille une information.' },
  {
    nom: 'le dispositif qui repère les obstacles',
    capteur: true,
    why: 'Il repère un obstacle : il recueille une information.',
  },
  {
    nom: 'le dispositif qui repère un passant',
    capteur: true,
    why: 'Il repère un passant : il recueille une information.',
  },
];
const ACTIONNEURS: readonly Element[] = [
  { nom: 'le moteur des roues d’un robot', capteur: false, why: 'Il fait tourner les roues : il agit.' },
  { nom: 'le moteur d’un portail automatique', capteur: false, why: 'Il fait bouger le portail : il agit.' },
  { nom: 'le moteur d’un volet roulant', capteur: false, why: 'Il fait monter ou descendre le volet : il agit.' },
  { nom: 'le moteur d’une porte automatique', capteur: false, why: 'Il fait bouger la porte : il agit.' },
  { nom: 'la lampe d’un lampadaire', capteur: false, why: 'Elle produit de la lumière : elle agit.' },
  { nom: 'la résistance d’un chauffage soufflant', capteur: false, why: 'Elle produit de la chaleur : elle agit.' },
];
const MOTEUR = [
  'moteur',
  'le moteur',
  'un moteur',
  'moteur électrique',
  'le moteur électrique',
  'un moteur électrique',
];
const MOT = (e: Element) => (e.capteur ? 'capteur' : 'actionneur');
const AUTRE = (e: Element) => (e.capteur ? 'actionneur' : 'capteur');

const niveau1 = (rng: Rng): QuestionDraft => {
  const cherche = rng.int(0, 1) === 0;
  const bon = rng.pick(cherche ? CAPTEURS : ACTIONNEURS);
  const faux = rng.shuffle(cherche ? ACTIONNEURS : CAPTEURS).slice(0, 2);
  const { answer, traps: tr } = choice(
    rng,
    bon.nom,
    faux.map((f) => ({ label: f.nom, why: `${f.why} C’est un ${MOT(f)}.` })),
  );
  return {
    prompt: `Lequel de ces éléments est un ${cherche ? 'capteur' : 'actionneur'} ?`,
    answer,
    traps: tr,
    hint: cherche ? 'Un capteur repère quelque chose.' : 'Un actionneur fait bouger ou agir quelque chose.',
    steps: ['Un capteur recueille une information ; un actionneur agit.', bon.why, `Réponse : **${bon.nom}**.`],
    targetSeconds: 25,
  };
};

const SITUATIONS = [
  {
    q: 'Un robot doit s’arrêter avant un mur. Quel élément repère le mur ?',
    bon: 'le petit dispositif placé à l’avant',
    faux: [
      ['le moteur', 'Le moteur fait bouger le robot ; il ne repère rien.'],
      ['la roue', 'La roue sert à rouler ; elle ne repère pas le mur.'],
      ['la coque', 'La coque protège le robot ; elle ne recueille pas d’information.'],
    ],
    why: 'Pour repérer un obstacle, il faut un capteur.',
  },
  {
    q: 'Un robot doit avancer. Quel élément fait tourner ses roues ?',
    bon: 'le moteur',
    faux: [
      ['le microphone', 'Le microphone capte les sons ; il ne fait pas rouler.'],
      ['la cellule qui mesure la lumière', 'Elle mesure la lumière ; elle ne fait pas rouler.'],
      ['la coque', 'La coque protège le robot ; elle ne fait pas rouler.'],
    ],
    why: 'Pour agir sur les roues, il faut un actionneur : le moteur.',
  },
  {
    q: 'Un éclairage public s’allume quand la nuit tombe. Quel élément repère la baisse de lumière ?',
    bon: 'la petite cellule en haut du mât',
    faux: [
      ['la lampe', 'La lampe éclaire ; elle ne repère pas la nuit.'],
      ['le poteau', 'Le poteau porte la lampe ; il ne recueille pas d’information.'],
      ['le relais', 'Le relais commande l’éclairage ; il ne mesure pas la lumière.'],
    ],
    why: 'Pour repérer un niveau de lumière réduit, il faut un capteur.',
  },
  {
    q: 'Un passant approche d’un lampadaire intelligent. Quel élément produit la lumière attendue ?',
    bon: 'la lampe',
    faux: [
      ['le dispositif qui repère un passant', 'Il recueille l’information ; il n’éclaire pas.'],
      ['le boîtier de contrôle', 'Le boîtier reçoit l’information et décide ; il n’éclaire pas.'],
      ['le poteau', 'Le poteau porte la lampe ; il n’éclaire pas.'],
    ],
    why: 'Pour produire la lumière, il faut un actionneur : la lampe.',
  },
  {
    q: 'Un conducteur passe son badge devant un portail. Quel élément recueille cette information ?',
    bon: 'le lecteur',
    faux: [
      ['le moteur', 'Le moteur ouvre le portail ; il ne lit pas le badge.'],
      ['la grille', 'La grille ferme l’entrée ; elle ne recueille pas d’information.'],
      ['le boîtier de contrôle', 'Le boîtier reçoit l’information ; il ne lit pas lui-même le badge.'],
    ],
    why: 'Pour lire un badge, il faut un capteur.',
  },
  {
    q: 'Il fait trop froid dans la pièce. Quel élément du chauffage soufflant produit la chaleur ?',
    bon: 'la résistance',
    faux: [
      ['la sonde', 'La sonde mesure la température ; elle ne chauffe pas.'],
      ['le boîtier de contrôle', 'Le boîtier décide ; il ne chauffe pas la pièce.'],
      ['le bouton de réglage', 'Le bouton sert à choisir la température ; il ne chauffe pas.'],
    ],
    why: 'Pour produire la chaleur attendue, il faut un actionneur : la résistance.',
  },
  {
    q: 'Une mini-serre doit signaler qu’il fait trop chaud. Quel élément mesure la température ?',
    bon: 'la sonde',
    faux: [
      ['l’écran d’affichage', 'L’écran montre la température ; il ne la mesure pas.'],
      ['la vitre', 'La vitre ferme la serre ; elle ne recueille pas d’information.'],
      ['le boîtier de contrôle', 'Le boîtier reçoit la mesure ; il ne la prend pas.'],
    ],
    why: 'Pour mesurer une température, il faut un capteur.',
  },
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SITUATIONS);
  const { answer, traps: tr } = choice(
    rng,
    s.bon,
    s.faux.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: s.q,
    answer,
    traps: tr,
    hint: 'Faut-il recueillir une information, ou agir ?',
    steps: ['On cherche la mission de l’élément.', s.why, `C’est **${s.bon}**.`],
    targetSeconds: 30,
  };
};

const ECLAIRAGE = [
  'un passant approche',
  'le détecteur de présence le repère',
  'le boîtier de contrôle reçoit l’information et décide',
  'le relais allume la lampe',
] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 3) {
    const { answer, traps: tr } = saisie(MOTEUR, [
      ['capteur', 'Un capteur recueille une information ; il ne fait pas tourner les roues.'],
      ['roue', 'La roue est entraînée ; cherche ce qui la fait tourner.'],
      ['boîtier de contrôle', 'Le boîtier de contrôle décide ; il ne fait pas tourner les roues lui-même.'],
    ]);
    return {
      prompt: 'Quel actionneur fait tourner les roues d’un robot ? Écris son nom.',
      answer,
      traps: tr,
      hint: 'Il utilise de l’énergie pour produire du mouvement.',
      steps: ['On cherche l’élément qui produit le mouvement.', 'C’est le **moteur** électrique.'],
      targetSeconds: 30,
    };
  }
  if (t === 0) {
    return {
      prompt: 'Éclairage public intelligent : remets dans l’ordre ce qui se passe.',
      answer: ordre(rng, ECLAIRAGE),
      hint: 'D’abord, quelque chose se passe dans la rue. Ensuite, le système le repère.',
      steps: [
        'Le détecteur recueille l’information, le boîtier décide, le relais commande la lampe.',
        `Ordre : **${ECLAIRAGE.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const e = rng.pick([...CAPTEURS, ...ACTIONNEURS]);
  if (t === 1) {
    const { answer, traps: tr } = saisie(
      [MOT(e), `un ${MOT(e)}`],
      [
        [AUTRE(e), e.why],
        [`un ${AUTRE(e)}`, e.why],
      ],
    );
    return {
      prompt: `Écris « capteur » ou « actionneur » : ${e.nom}, c’est un …`,
      answer,
      traps: tr,
      hint: 'Demande-toi : repère-t-il quelque chose, ou fait-il agir ?',
      steps: [e.why, `C’est un **${MOT(e)}**.`],
      targetSeconds: 25,
    };
  }
  const chaine = e.capteur ? 'information' : 'action';
  const { answer, traps: tr } = choice(rng, `la chaîne d’${chaine}`, [
    { label: `la chaîne d’${e.capteur ? 'action' : 'information'}`, why: e.why },
  ]);
  return {
    prompt: `Dans quelle chaîne se trouve ${e.nom} ?`,
    answer,
    traps: tr,
    hint: 'Les capteurs sont dans une chaîne, les actionneurs dans l’autre.',
    steps: [e.why, `Il appartient à **la chaîne d’${chaine}**.`],
    targetSeconds: 30,
  };
};

const ROLES: readonly (readonly [string, string])[] = [
  ['le microphone', 'capte les sons'],
  ['la sonde d’une mini-serre', 'mesure la température'],
  ['le lecteur de badge', 'reconnaît qui se présente au portail'],
  ['le moteur', 'fait tourner les roues'],
  ['la lampe', 'éclaire la rue'],
  ['la résistance d’un chauffage', 'produit de la chaleur'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque élément d’un objet programmable à son rôle.',
      answer: association(rng, ROLES),
      hint: 'Commence par les éléments dont tu connais bien le rôle.',
      steps: [
        'Les capteurs recueillent des informations ; les actionneurs agissent.',
        'Chaque élément est relié à **son** rôle.',
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const elements = rng.shuffle([...rng.shuffle(CAPTEURS).slice(0, 2), ...rng.shuffle(ACTIONNEURS).slice(0, 2)]);
    return {
      prompt: `Classe ces éléments : ${elements.map((e) => e.nom).join(', ')}.`,
      answer: {
        kind: 'cloze',
        parts: [...elements.map((e, i) => `${i === 0 ? '' : ' ; '}${maj(e.nom)} : `), '.'],
        blanks: elements.map((e) => ({
          mode: 'list' as const,
          options: ['capteur', 'actionneur'],
          correct: e.capteur ? 0 : 1,
        })),
      },
      hint: 'Pour chacun, demande-toi : recueille-t-il une information, ou agit-il ?',
      steps: [
        'Un capteur recueille une information ; un actionneur agit.',
        `Classement : **${elements.map((e) => `${e.nom} (${MOT(e)})`).join(', ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const capteur = rng.int(0, 1) === 0;
  const bon = capteur ? 'capteur' : 'actionneur';
  const why = capteur
    ? 'L’élément qui recueille une information est un capteur.'
    : 'L’élément qui agit, comme un moteur, est un actionneur.';
  const { answer, traps: tr } = saisie(
    capteur
      ? ['capteur', 'un capteur', 'le capteur', 'détecteur', 'un détecteur', 'le détecteur']
      : ['actionneur', 'un actionneur', 'l’actionneur'],
    [
      [capteur ? 'actionneur' : 'capteur', why],
      [capteur ? 'un actionneur' : 'un capteur', why],
    ],
  );
  return {
    prompt: capteur
      ? 'Comment s’appelle un élément qui recueille une information, par exemple la présence d’un obstacle ?'
      : 'Comment s’appelle un élément qui agit, par exemple le moteur d’un robot ?',
    answer,
    traps: tr,
    hint: 'Les deux mots à connaître désignent celui qui repère et celui qui fait.',
    steps: [why, `C’est un **${bon}**.`],
    targetSeconds: 30,
  };
};

interface Objet {
  readonly titre: string;
  readonly lignes: readonly string[];
  /** Éléments de la chaîne, de l'information recueillie jusqu'à l'action. */
  readonly chaine: readonly string[];
  /** Pièce de l'objet qui ne recueille rien et ne produit pas l'action. */
  readonly autre: string;
}

const OBJETS: readonly Objet[] = [
  {
    titre: 'Le robot de la classe',
    lignes: [
      'Un moteur fait tourner les roues.',
      'La coque protège les pièces.',
      'Le boîtier de contrôle suit le programme et donne les ordres.',
      'À l’avant, un petit dispositif repère les murs.',
    ],
    chaine: ['le dispositif à l’avant', 'le boîtier de contrôle', 'le moteur'],
    autre: 'la coque',
  },
  {
    titre: 'L’éclairage public intelligent',
    lignes: [
      'Une lampe peut éclairer la rue.',
      'Un relais reçoit l’ordre et commande la lampe.',
      'Le poteau porte l’ensemble.',
      'Un petit dispositif repère les passants.',
      'Le boîtier de contrôle reçoit l’information et décide.',
    ],
    chaine: ['le dispositif qui repère les passants', 'le boîtier de contrôle', 'le relais', 'la lampe'],
    autre: 'le poteau',
  },
  {
    titre: 'La porte automatique',
    lignes: [
      'Un moteur ouvre la porte.',
      'La vitre laisse voir à travers la porte.',
      'Une cellule placée en haut repère une personne.',
      'Le boîtier de contrôle reçoit l’information et donne l’ordre.',
    ],
    chaine: ['la cellule', 'le boîtier de contrôle', 'le moteur'],
    autre: 'la vitre',
  },
  {
    titre: 'Le chauffage soufflant',
    lignes: [
      'Une résistance produit de la chaleur.',
      'Le boîtier de contrôle compare et donne l’ordre.',
      'Une sonde mesure la température de la pièce.',
      'Une grille ferme la façade de l’appareil.',
    ],
    chaine: ['la sonde', 'le boîtier de contrôle', 'la résistance'],
    autre: 'la grille',
  },
  {
    titre: 'Le portail à badge',
    lignes: [
      'Un moteur fait bouger le portail.',
      'Un poteau en pierre tient le portail.',
      'Le boîtier de contrôle vérifie le badge et donne l’ordre.',
      'Un lecteur reconnaît le badge du conducteur.',
    ],
    chaine: ['le lecteur', 'le boîtier de contrôle', 'le moteur'],
    autre: 'le poteau en pierre',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const o = rng.pick(OBJETS);
  const figure = { kind: 'document' as const, title: o.titre, lines: [...o.lignes] };
  const debut = o.chaine[0] ?? '';
  const fin = o.chaine[o.chaine.length - 1] ?? '';
  const raisons = `Dans cette fiche, **${debut}** recueille l’information et **${fin}** agit.`;
  if (rng.int(0, 1) === 0) {
    const paire = (a: string, b: string) => `${a}, puis ${b}`;
    const { answer, traps: tr } = choice(rng, paire(debut, fin), [
      { label: paire(fin, debut), why: 'Les deux rôles sont inversés : on recueille d’abord, on agit ensuite.' },
      {
        label: paire('le boîtier de contrôle', fin),
        why: 'Le boîtier de contrôle reçoit l’information et décide ; ce n’est pas lui qui la recueille au départ.',
      },
      { label: paire(debut, o.autre), why: 'La seconde pièce de cette paire ne produit pas l’action attendue.' },
    ]);
    return {
      prompt: `Lis la fiche « ${o.titre} ». Quelle paire donne le capteur, puis l’actionneur ?`,
      figure,
      answer,
      traps: tr,
      hint: 'Cherche d’abord ce qui recueille une information, puis ce qui agit à la fin.',
      steps: [raisons, `Réponse : **${paire(debut, fin)}**.`],
      targetSeconds: 55,
    };
  }
  return {
    prompt: `Lis la fiche « ${o.titre} ». Remets la chaîne en ordre, de l’information recueillie jusqu’à l’action.`,
    figure,
    answer: ordre(rng, o.chaine),
    hint: 'La fiche ne donne pas les éléments dans l’ordre. Qui recueille ? Qui décide ? Qui agit ?',
    steps: [raisons, `Ordre : **${o.chaine.join(' → ')}**.`],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const chaineInformation: Skill = {
  id: 'tcm2-chaine-information',
  title: 'Capteurs et actionneurs',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **capteur** acquiert (recueille) une information : un son, une température, la présence d’un obstacle. Il fait partie de la **chaîne d’information**.',
      'Un **actionneur** transforme l’énergie qu’il reçoit en action attendue : le moteur fait tourner les roues du robot. Il fait partie de la **chaîne d’action**. À toi de repérer qui recueille et qui agit !',
    ],
    source: `${PROGRAMME} : « Identifier la chaîne d’information et d’action (exemple d’un éclairage public intelligent : détecteur de présence, boîtier de contrôle, relais de commande d’éclairage, etc.) » ; « Repérer les capteurs et les actionneurs (moteur électrique, etc.) présents dans un objet programmable » ; « capteurs (utilisés pour détecter la présence d’obstacles, ou un niveau de luminosité réduit en fin de journée, etc.) ». Éduscol STI, « La chaîne d’information » : « identifier les constituants de la chaîne d’information d’un OST et de connaître les fonctions des constituants suivants : capteurs » ; « le système acquiert des informations : rôle des capteurs, des codeurs et des détecteurs et il transforme l’énergie qu’il reçoit en action(s) attendue(s) par l’utilisateur : rôle des actionneurs ». Éduscol STI, « La chaîne d’action » : « Structure d’une chaîne d’action • Les actionneurs ». Académie française : capteur, « Appareil sensible à un phénomène physique, qu’il transforme en un signal » ; moteur, « produire de l’énergie mécanique, du mouvement » ; récepteur, « Les ampoules, les résistances, les moteurs électriques, les électrolyseurs sont des récepteurs ».`,
    sources: [
      PROGRAMME,
      'eduscol-chaine-information',
      'eduscol-chaine-information-synthese',
      'eduscol-chaine-action',
      'academie-capteur',
      'academie-moteur',
      'academie-recepteur',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
