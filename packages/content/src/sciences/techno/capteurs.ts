import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, formes, maj, notion, ordre, qcm, saisie } from './outils.ts';

// ——— Capteurs, actionneurs et interface humain-machine : entrées et sorties d'un système ———

const CAPTEURS: readonly { nom: string; mesure: string; situation: string }[] = [
  {
    nom: 'un capteur de température',
    mesure: 'réagir à la température',
    situation: 'savoir s’il fait trop chaud dans une serre',
  },
  {
    nom: 'un capteur de présence',
    mesure: 'repérer qu’une personne est là',
    situation: 'savoir si quelqu’un se trouve dans un couloir',
  },
  {
    nom: 'un capteur de distance',
    mesure: 'évaluer à quelle distance se trouve un obstacle',
    situation: 'savoir à combien de centimètres un robot est d’un mur',
  },
  { nom: 'un microphone', mesure: 'réagir aux sons', situation: 'repérer qu’une personne frappe dans ses mains' },
];

const ACTIONNEURS = ['un moteur électrique', 'un vérin électrique', 'un vérin pneumatique'] as const;

const AFFICHEUR = {
  nom: 'un afficheur',
  pourquoi: 'Un afficheur appartient à l’interface humain-machine : il montre une information à l’usager.',
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const capteur = rng.int(0, 1) === 0;
  const bon = capteur ? rng.pick(CAPTEURS).nom : rng.pick(ACTIONNEURS);
  const intrus = capteur ? rng.pick(ACTIONNEURS) : rng.pick(CAPTEURS).nom;
  // Seul l’afficheur : un bouton pourrait se défendre comme capteur.
  const autre = AFFICHEUR;
  return {
    prompt: `Lequel de ces constituants est un ${capteur ? 'capteur' : 'actionneur'} ?`,
    ...qcm(rng, bon, [
      {
        label: intrus,
        why: capteur
          ? `${maj(intrus)} est un actionneur : il convertit une énergie pour agir.`
          : `${maj(intrus)} est un capteur : il réagit à un phénomène et donne un signal.`,
      },
      { label: autre.nom, why: autre.pourquoi },
    ]),
    hint: capteur ? 'Cherche celui qui recueille une information.' : 'Cherche celui qui produit un mouvement.',
    steps: [
      capteur
        ? 'Un capteur est sensible à un phénomène physique et le transforme en un signal.'
        : 'Un actionneur convertit une énergie pour agir, par exemple en produisant un mouvement.',
      `La réponse est **${bon}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const trois = rng.shuffle(CAPTEURS).slice(0, 3);
    const paires = trois.map((c) => [c.nom, c.mesure] as const);
    return {
      prompt: `Associe chaque capteur à son rôle : ${paires.map((p) => p[0]).join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Le nom de chaque capteur donne un indice sur le phénomène auquel il est sensible.',
      steps: [
        'Chaque capteur est sensible à un phénomène particulier.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const c = rng.pick(CAPTEURS);
  return {
    prompt: `Quel capteur choisir pour ${c.situation} ?`,
    ...qcm(
      rng,
      c.nom,
      CAPTEURS.filter((x) => x !== c).map((x) => ({
        label: x.nom,
        why: `${maj(x.nom)} sert à ${x.mesure} : ce n’est pas l’information cherchée.`,
      })),
    ),
    hint: 'Quelle information veut-on obtenir : une chaleur, une personne, un éloignement ou un son ?',
    steps: [
      'On choisit le capteur d’après l’information à recueillir.',
      `On a besoin d’un capteur qui sert à ${c.mesure}.`,
      `La réponse est **${c.nom}**.`,
    ],
    targetSeconds: 35,
  };
};

const SITUATIONS: readonly { texte: string; capteur: boolean }[] = [
  { texte: 'Dans un portail automatique, un constituant fait bouger le battant.', capteur: false },
  { texte: 'Dans un portail automatique, un constituant repère qu’une voiture est encore au passage.', capteur: true },
  { texte: 'Dans une serre, un constituant réagit à la chaleur de l’air et envoie un signal.', capteur: true },
  { texte: 'Dans une serre, un vérin pousse la fenêtre de toit pour l’ouvrir.', capteur: false },
  { texte: 'Dans un robot, un constituant fait tourner les roues.', capteur: false },
  { texte: 'À l’avant d’un robot, un constituant évalue l’éloignement d’un obstacle.', capteur: true },
  { texte: 'Dans une porte coulissante, un constituant signale qu’une personne approche.', capteur: true },
  { texte: 'Dans une porte coulissante, un constituant déplace les panneaux.', capteur: false },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SITUATIONS);
  const mot = s.capteur ? 'capteur' : 'actionneur';
  const faux = s.capteur ? 'actionneur' : 'capteur';
  const erreur = s.capteur
    ? 'Un actionneur agit ; ici le constituant recueille une information.'
    : 'Un capteur recueille une information ; ici le constituant agit en produisant un mouvement.';
  return {
    prompt: `${s.texte} S’agit-il d’un capteur ou d’un actionneur ? Écris le mot.`,
    ...saisie(
      [...formes(mot, 'un'), s.capteur ? 'le capteur' : 'l’actionneur'],
      [
        ...formes(faux, 'un').map((f) => [f, erreur] as const),
        ['bouton', 'Un bouton sert à l’usager pour donner un ordre : ce n’est pas le cas ici.'],
      ],
    ),
    hint: 'Demande-toi : ce constituant recueille-t-il une information, ou agit-il ?',
    steps: [
      'Un capteur recueille une information ; un actionneur convertit une énergie pour agir.',
      `La réponse est **${mot}**.`,
    ],
    targetSeconds: 30,
  };
};

const ROLES: readonly (readonly [string, string])[] = [
  ['un capteur de température', 'donner au programme un signal qui dépend de la température'],
  ['un capteur de distance', 'donner au programme un signal qui dépend de l’éloignement d’un obstacle'],
  ['un bouton', 'permettre à l’usager de donner un ordre en appuyant'],
  ['un afficheur', 'montrer une information à l’usager'],
  ['un moteur électrique', 'convertir de l’énergie électrique en mouvement de rotation'],
  ['un vérin électrique', 'convertir de l’énergie électrique en mouvement de translation (en ligne droite)'],
  ['un microphone', 'donner un signal qui dépend des sons'],
];

const SYSTEMES: readonly { nom: string; capteur: string; actionneur: string; support: string }[] = [
  {
    nom: 'une barrière de parking',
    capteur: 'le capteur de présence',
    actionneur: 'le moteur électrique',
    support: 'le poteau métallique',
  },
  {
    nom: 'une serre automatisée',
    capteur: 'le capteur de température',
    actionneur: 'le vérin de la fenêtre',
    support: 'la paroi vitrée',
  },
  {
    nom: 'un robot aspirateur',
    capteur: 'le capteur de distance',
    actionneur: 'le moteur des roues',
    support: 'la coque en plastique',
  },
  {
    nom: 'une porte coulissante',
    capteur: 'le détecteur de mouvement',
    actionneur: 'le moteur de la porte',
    support: 'le cadre de la porte',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const paires = rng.shuffle(ROLES).slice(0, 5);
    return {
      prompt: `Associe chaque constituant à son rôle : ${paires.map((p) => p[0]).join(', ')}.`,
      answer: association(rng, paires),
      hint: 'Sépare d’abord ce qui recueille, ce qui agit et ce qui sert à l’usager ; puis précise.',
      steps: [
        'Les capteurs recueillent, les actionneurs agissent, l’interface sert aux échanges avec l’usager.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const s = rng.pick(SYSTEMES);
  const entree = rng.int(0, 1) === 0;
  const bonne = entree ? s.capteur : s.actionneur;
  return {
    prompt: `Dans ${s.nom}, quel constituant est lié à ${entree ? 'une entrée' : 'une sortie'} du programme ?`,
    figure: { kind: 'document', title: `Constituants : ${s.nom}`, lines: [s.capteur, s.actionneur, s.support] },
    ...qcm(rng, bonne, [
      {
        label: entree ? s.actionneur : s.capteur,
        why: entree
          ? 'Cet actionneur reçoit un ordre du programme : il est lié à une sortie.'
          : 'Ce capteur fournit une donnée au programme : il est lié à une entrée.',
      },
      { label: s.support, why: 'Cette pièce tient ou protège le système : elle n’échange pas de donnée.' },
    ]),
    hint: 'Une entrée apporte une donnée au programme ; une sortie transmet son ordre.',
    steps: [
      'Les données des capteurs sont des entrées ; les sorties peuvent commander des actionneurs.',
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SYSTEMES);
  const figure = {
    kind: 'document' as const,
    title: `Fiche : ${s.nom}`,
    lines: [
      `Entrée du programme : ${s.capteur}.`,
      'Traitement : le programme.',
      `Sortie du programme : ${s.actionneur}.`,
      `Structure : ${s.support}.`,
    ],
  };
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const suite = [
      `${s.capteur} envoie un signal`,
      'le programme traite cette donnée',
      'le programme envoie un ordre en sortie',
      `${s.actionneur} agit`,
    ].map(maj);
    return {
      prompt: `Dans ${s.nom}, range les étapes depuis le phénomène observé jusqu’à l’action.`,
      figure,
      answer: ordre(rng, suite),
      hint: 'L’information entre, elle est traitée, puis un ordre sort.',
      steps: [
        'La donnée va de l’entrée vers la sortie en passant par le programme.',
        `L’ordre est : **${suite.join(' → ')}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const capteurEnCause = sorte === 1;
  const bonne = capteurEnCause ? s.capteur : s.actionneur;
  const observation = capteurEnCause
    ? 'Lors d’un essai, l’actionneur fonctionne quand on le commande directement, mais le programme ne reçoit aucun signal en entrée. Le programme, les câbles et l’alimentation sont corrects.'
    : 'Lors d’un essai, le programme reçoit le bon signal en entrée et envoie le bon ordre en sortie, mais rien ne bouge. Le programme, les câbles et l’alimentation sont corrects, et rien ne bloque le mécanisme.';
  return {
    prompt: `${observation} Quel constituant faut-il contrôler en priorité ?`,
    figure,
    ...qcm(rng, bonne, [
      {
        label: capteurEnCause ? s.actionneur : s.capteur,
        why: capteurEnCause
          ? 'L’essai montre que l’actionneur fonctionne.'
          : 'Le programme reçoit le bon signal : le capteur remplit son rôle.',
      },
      { label: s.support, why: 'Cette pièce ne fournit aucun signal et ne reçoit aucun ordre.' },
      { label: 'le programme', why: 'L’énoncé indique que le programme est correct.' },
    ]),
    hint: 'Suis la chaîne de l’entrée à la sortie : à quel endroit s’arrête-t-elle ?',
    steps: [
      'On suit le trajet : capteur, programme, ordre, actionneur.',
      capteurEnCause
        ? 'Rien n’arrive en entrée alors que le reste fonctionne.'
        : 'L’ordre part bien, mais l’action ne se produit pas.',
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 60,
  };
};

export const capteurs = notion(
  {
    id: 't5-capteurs-actionneurs',
    title: 'Capteurs et actionneurs',
    memo: [
      'Un **capteur** réagit à un phénomène (chaleur, présence, distance, son) et donne un signal au programme : c’est une entrée. Un **actionneur** reçoit une énergie et la convertit pour agir : moteur, vérin.',
      'Exemple : le capteur de présence détecte une voiture, le programme décide, le moteur lève la barrière. Les boutons et les afficheurs forment l’**interface humain-machine**.',
    ],
    attendu:
      'Identifier des constituants de la chaîne d’information d’un OST (l’organisation de la chaîne d’information étant fournie)',
    sources: ['academie-capteur', 'academie-moteur', 'eduscol-sti-actionneurs'],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
