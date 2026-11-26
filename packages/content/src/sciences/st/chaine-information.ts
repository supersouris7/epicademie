import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
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
  {
    nom: 'le capteur d’obstacle d’un robot',
    capteur: true,
    why: 'Il repère un obstacle : il recueille une information.',
  },
  {
    nom: 'le détecteur de présence d’un lampadaire',
    capteur: true,
    why: 'Il repère un passant : il recueille une information.',
  },
  {
    nom: 'le capteur de lumière d’un éclairage',
    capteur: true,
    why: 'Il repère qu’il fait sombre : il recueille une information.',
  },
  { nom: 'le microphone d’un robot', capteur: true, why: 'Il capte les sons : il recueille une information.' },
];
const ACTIONNEURS: readonly Element[] = [
  { nom: 'le moteur des roues d’un robot', capteur: false, why: 'Il fait tourner les roues : il agit.' },
  { nom: 'le moteur d’un portail automatique', capteur: false, why: 'Il fait bouger le portail : il agit.' },
  { nom: 'le moteur d’un volet roulant', capteur: false, why: 'Il fait monter ou descendre le volet : il agit.' },
  { nom: 'le moteur d’une porte automatique', capteur: false, why: 'Il fait bouger la porte : il agit.' },
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
    bon: 'le capteur d’obstacle',
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
      ['le capteur d’obstacle', 'Le capteur repère les obstacles ; il ne fait pas rouler.'],
      ['le microphone', 'Le microphone capte les sons ; il ne fait pas rouler.'],
      ['le capteur de lumière', 'Il repère la lumière ; il ne fait pas rouler.'],
    ],
    why: 'Pour agir sur les roues, il faut un actionneur : le moteur.',
  },
  {
    q: 'Un éclairage public s’allume quand la nuit tombe. Quel élément repère la baisse de lumière ?',
    bon: 'le capteur de lumière',
    faux: [
      ['la lampe', 'La lampe éclaire ; elle ne repère pas la nuit.'],
      ['le poteau', 'Le poteau porte la lampe ; il ne recueille pas d’information.'],
      ['le moteur', 'Un moteur sert à faire bouger ; il ne repère pas la lumière.'],
    ],
    why: 'Pour repérer un niveau de lumière réduit, il faut un capteur.',
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
  const t = rng.int(0, 2);
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
  ['le capteur d’obstacle', 'repère un obstacle'],
  ['le capteur de lumière', 'repère qu’il fait sombre'],
  ['le microphone', 'capte les sons'],
  ['le moteur', 'fait tourner les roues'],
  ['le relais', 'commande l’éclairage'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Relie chaque élément d’un objet programmable à son rôle.',
      answer: association(rng, ROLES),
      hint: 'Commence par les capteurs : chacun repère une chose différente.',
      steps: [
        'Les capteurs recueillent des informations ; le moteur et le relais agissent.',
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
      hint: 'Les moteurs font agir ; les autres repèrent.',
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
    [bon, `un ${bon}`],
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
  readonly capteurs: readonly string[];
  readonly actionneur: string;
}

const OBJETS: readonly Objet[] = [
  {
    titre: 'Le robot de la classe',
    lignes: [
      'Un capteur d’obstacle regarde devant le robot.',
      'Un capteur de lumière mesure s’il fait sombre.',
      'Le boîtier de contrôle suit le programme.',
      'Un moteur fait tourner les roues.',
    ],
    capteurs: ['capteur d’obstacle', 'capteur de lumière'],
    actionneur: 'moteur',
  },
  {
    titre: 'La porte automatique',
    lignes: [
      'Un détecteur de présence repère une personne.',
      'Le boîtier de contrôle reçoit l’information.',
      'Un moteur ouvre la porte.',
    ],
    capteurs: ['détecteur de présence'],
    actionneur: 'moteur',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const o = rng.pick(OBJETS);
  const figure = { kind: 'document' as const, title: o.titre, lines: [...o.lignes] };
  const t = rng.int(0, 1);
  if (t === 0) {
    const n = o.capteurs.length;
    return {
      prompt: 'Lis la fiche. Combien de capteurs cet objet possède-t-il ?',
      figure,
      answer: num(n),
      traps: traps(r(n), [
        [n + 1, 'Tu as compté le moteur ou le boîtier. Aucun des deux ne recueille d’information dans cette fiche.'],
        [o.lignes.length, 'Tu as compté toutes les lignes. Compte seulement les éléments qui repèrent.'],
      ]),
      hint: 'Cherche les éléments qui repèrent ou mesurent quelque chose.',
      steps: [`Les capteurs sont : ${o.capteurs.join(', ')}.`, `Il y en a **${n}**.`],
      targetSeconds: 55,
    };
  }
  const { answer, traps: tr } = saisie(
    ['moteur', 'le moteur', 'un moteur'],
    [
      ...o.capteurs.map((c) => [c, 'C’est un capteur : il recueille une information, il n’agit pas.'] as const),
      ['boîtier de contrôle', 'Le boîtier de contrôle suit le programme ; la fiche indique quel élément agit.'],
    ],
  );
  return {
    prompt: 'Lis la fiche. Quel élément est l’actionneur ? Écris son nom.',
    figure,
    answer,
    traps: tr,
    hint: 'L’actionneur fait bouger quelque chose.',
    steps: ['On cherche l’élément qui agit.', 'L’actionneur de cette fiche est le **moteur**.'],
    targetSeconds: 50,
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
      'Un **capteur** repère quelque chose et en tire un signal : un obstacle, une présence, le manque de lumière. Il est dans la **chaîne d’information**.',
      'Un **actionneur** agit : le moteur fait tourner les roues du robot. Il est dans la **chaîne d’action**. À toi de repérer qui sent et qui agit !',
    ],
    source: `${PROGRAMME} : « Identifier la chaîne d’information et d’action (exemple d’un éclairage public intelligent : détecteur de présence, boîtier de contrôle, relais de commande d’éclairage, etc.) » ; « Repérer les capteurs et les actionneurs (moteur électrique, etc.) présents dans un objet programmable » ; « capteurs (utilisés pour détecter la présence d’obstacles, ou un niveau de luminosité réduit en fin de journée, etc.) ». Académie française : capteur, « Appareil sensible à un phénomène physique, qu’il transforme en un signal » ; moteur, « produire de l’énergie mécanique, du mouvement ».`,
    sources: [PROGRAMME, 'academie-capteur', 'academie-moteur'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
