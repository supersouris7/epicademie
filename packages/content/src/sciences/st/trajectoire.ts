import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, saisie } from './outils.ts';

// ——— Trajectoire : forme de la ligne suivie, toujours par rapport à une référence (programme du cycle 3) ———

type Forme = 'droite' | 'cercle' | 'courbe';
const NOM: Record<Forme, string> = {
  droite: 'une droite',
  cercle: 'un cercle',
  courbe: 'une courbe qui n’est pas un cercle',
};

interface Scene {
  /** Nom court, pour l’énoncé d’une association. */
  readonly nom: string;
  readonly texte: string;
  readonly reference: string;
  readonly forme: Forme;
  readonly why: string;
}

const SCENES: readonly Scene[] = [
  {
    nom: 'ascenseur',
    texte: 'Un ascenseur monte tout droit dans un immeuble.',
    reference: 'à l’immeuble',
    forme: 'droite',
    why: 'Par rapport à l’immeuble, la cabine monte sans tourner : elle suit une droite.',
  },
  {
    nom: 'valise',
    texte: 'Une valise avance sur un tapis roulant tout droit.',
    reference: 'au sol',
    forme: 'droite',
    why: 'Par rapport au sol, la valise suit le tapis, tout droit : elle suit une droite.',
  },
  {
    nom: 'grande roue',
    texte: 'Une cabine de grande roue fait un tour complet.',
    reference: 'au sol',
    forme: 'cercle',
    why: 'La cabine tourne autour du centre de la roue : elle suit un cercle.',
  },
  {
    nom: 'disque',
    texte: 'Un point coloré est peint au bord d’un disque qui tourne.',
    reference: 'à l’axe de rotation',
    forme: 'cercle',
    why: 'Le point tourne autour de l’axe : il suit un cercle.',
  },
  {
    nom: 'ballon',
    texte: 'Un ballon est lancé en l’air vers un panier, assez loin.',
    reference: 'au sol',
    forme: 'courbe',
    why: 'Le ballon monte puis redescend en avançant : sa trace est arrondie, sans faire un cercle.',
  },
];

const avecRef = (s: Scene) => `${s.texte} Par rapport ${s.reference},`;
const FORMES = Object.keys(NOM) as Forme[];

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SCENES.filter((x) => x.forme !== 'courbe'));
  const { answer, traps } = choice(rng, NOM[s.forme], [
    { label: NOM[s.forme === 'droite' ? 'cercle' : 'droite'], why: s.why },
    { label: 'un zigzag', why: `Un zigzag change sans arrêt de direction d’un coup sec. ${s.why}` },
  ]);
  return {
    prompt: `${avecRef(s)} quelle ligne est suivie ?`,
    answer,
    traps,
    hint: 'Imagine le trait de crayon que laisserait l’objet en bougeant.',
    steps: ['La trajectoire est la ligne suivie par l’objet.', s.why, `La trajectoire est **${NOM[s.forme]}**.`],
    targetSeconds: 20,
  };
};

const DEFINITIONS = [
  {
    q: 'Comment appelle-t-on la ligne suivie par un objet qui se déplace ?',
    bon: 'sa trajectoire',
    faux: ['sa durée', 'sa distance', 'son point de vue'],
  },
  {
    q: 'Quel mot désigne la chose par rapport à laquelle on décrit un mouvement ?',
    bon: 'le point de vue',
    faux: ['la trajectoire', 'la durée', 'la distance'],
  },
] as const;

const WHY_MOT: Record<string, string> = {
  'sa durée': 'La durée est le temps écoulé, pas la ligne suivie.',
  'sa distance': 'La distance est une longueur, mesurée en mètres par exemple, pas la forme de la ligne.',
  'son point de vue': 'Le point de vue dit « par rapport à quoi » on observe.',
  'la trajectoire': 'La trajectoire est la ligne suivie par l’objet.',
  'la durée': 'La durée est le temps écoulé entre deux instants.',
  'la distance': 'La distance est une longueur, pas la référence choisie.',
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trio = FORMES.map((f) => rng.pick(SCENES.filter((x) => x.forme === f)));
    return {
      prompt: `Associe chaque scène à la forme de sa trajectoire : ${trio
        .map((s) => s.nom)
        .sort()
        .join(', ')}.`,
      answer: association(
        rng,
        trio.map((s) => [`${s.texte} (par rapport ${s.reference})`, NOM[s.forme]] as const),
      ),
      hint: 'Imagine la trace de chaque objet : bien droite, bien ronde, ou seulement arrondie ?',
      steps: [
        'On imagine la ligne suivie par chaque objet.',
        trio.map((s) => s.why).join(' '),
        'Chaque scène est reliée à **sa** trajectoire.',
      ],
      targetSeconds: 50,
    };
  }
  const d = rng.pick(DEFINITIONS);
  const { answer, traps } = choice(
    rng,
    d.bon,
    d.faux.map((label) => ({ label, why: WHY_MOT[label] ?? 'Ce n’est pas ce mot.' })),
  );
  return {
    prompt: d.q,
    answer,
    traps,
    hint: 'Demande-toi : cherche-t-on un trait, un temps, une longueur ou une référence ?',
    steps: [
      'Trajectoire : la ligne suivie. Durée : le temps. Distance : la longueur. Point de vue : la référence.',
      `La bonne réponse est **${d.bon}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const { answer, traps } = saisie(
      ['trajectoire', 'la trajectoire', 'sa trajectoire'],
      [
        ['distance', 'La distance est une longueur. On cherche le nom de la ligne suivie.'],
        ['durée', 'La durée est un temps. On cherche le nom de la ligne suivie.'],
      ],
    );
    return {
      prompt: 'Écris le mot manquant : la ligne que suit un objet en mouvement s’appelle sa …',
      answer,
      traps,
      hint: 'Ce n’est ni la durée ni la distance : on cherche le nom du trait que dessine l’objet.',
      steps: ['On cherche le nom de la ligne suivie.', 'C’est la **trajectoire**.'],
      targetSeconds: 25,
    };
  }
  const s = rng.pick(SCENES.filter((x) => x.forme !== 'courbe'));
  const droit = s.forme === 'droite';
  const bon = droit ? 'rectiligne' : 'circulaire';
  const { answer, traps } = saisie(
    [bon],
    [
      [droit ? 'circulaire' : 'rectiligne', s.why],
      ['courbe', `Il y a un mot plus précis. ${s.why}`],
    ],
  );
  return {
    prompt: `${avecRef(s)} la trajectoire est-elle rectiligne ou circulaire ? Écris le bon mot.`,
    answer,
    traps,
    hint: 'Rectiligne veut dire « en ligne droite ». Circulaire veut dire « en cercle ».',
    steps: ['On imagine la ligne suivie.', s.why, `La trajectoire est **${bon}**.`],
    targetSeconds: 30,
  };
};

const REPERES: readonly { q: string; bon: 'rectiligne' | 'circulaire'; why: string }[] = [
  {
    q: 'La valve d’une roue de vélo, observée par rapport au centre de la roue, pendant que le vélo roule.',
    bon: 'circulaire',
    why: 'Par rapport au centre de la roue, la valve reste à la même distance et tourne autour : elle suit un cercle.',
  },
  {
    q: 'Le centre de la roue d’un vélo qui roule tout droit sur un sol plat, observé par rapport au sol.',
    bon: 'rectiligne',
    why: 'Le centre de la roue reste à la même hauteur et avance tout droit.',
  },
  {
    q: 'Le bout d’une pale d’éolienne qui tourne, observé par rapport à son axe.',
    bon: 'circulaire',
    why: 'La pale tourne autour de l’axe : son bout suit un cercle.',
  },
  {
    q: 'Un passager assis dans un bus qui roule sur une route toute droite, observé par rapport au trottoir.',
    bon: 'rectiligne',
    why: 'Le passager voyage avec le bus, qui avance tout droit par rapport au trottoir.',
  },
  {
    q: 'Un enfant assis sur un tourniquet qui tourne, observé par rapport au sol du parc.',
    bon: 'circulaire',
    why: 'Par rapport au sol, l’enfant tourne autour du centre du tourniquet.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 3) === 0) {
    return {
      prompt: 'Relie chaque mot à sa définition.',
      answer: association(rng, [
        ['trajectoire', 'la ligne suivie par l’objet'],
        ['rectiligne', 'en ligne droite'],
        ['circulaire', 'en cercle'],
        ['point de vue', 'la référence choisie pour observer'],
        ['durée', 'le temps entre deux instants'],
      ]),
      hint: 'Commence par les mots dont tu es sûr, puis termine par élimination.',
      steps: [
        'Chaque mot a un seul sens ici.',
        'Rectiligne et circulaire décrivent la forme de la trajectoire.',
        'Chaque mot est relié à **sa** définition.',
      ],
      targetSeconds: 60,
    };
  }
  const c = rng.pick(REPERES);
  const { answer, traps } = saisie(
    c.bon === 'circulaire'
      ? ['circulaire', 'en cercle', 'cercle', 'un cercle']
      : ['rectiligne', 'droite', 'en ligne droite'],
    [
      [c.bon === 'circulaire' ? 'rectiligne' : 'circulaire', c.why],
      ['immobile', `Par rapport à la référence choisie, l’objet change bien de place. ${c.why}`],
    ],
  );
  return {
    prompt: `${c.q} Quelle est la forme de la trajectoire ? Écris un adjectif.`,
    answer,
    traps,
    hint: 'Place-toi à la référence indiquée et suis l’objet des yeux.',
    steps: ['On observe depuis la référence indiquée.', c.why, `La trajectoire est **${c.bon}**.`],
    targetSeconds: 40,
  };
};

interface Recit {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly vues: readonly { q: string; bon: string; why: string }[];
}

const FIXE = 'il ne bouge pas';
const REPONSES = [NOM.droite, NOM.cercle, NOM.courbe, FIXE];

const RECITS: readonly Recit[] = [
  {
    titre: 'La balle dans le train',
    lignes: [
      'Un train roule tout droit, toujours à la même allure.',
      'Assise à sa place, une voyageuse lâche une balle.',
      'Elle la voit tomber tout droit à ses pieds.',
      'Depuis le quai, un observateur voit la balle descendre tout en avançant avec le train.',
      'Pour lui, la trace de la balle est arrondie, sans être un cercle.',
    ],
    vues: [
      {
        q: 'Quelle est la trajectoire de la balle par rapport à la voyageuse ?',
        bon: NOM.droite,
        why: 'Ligne 3 : pour elle, la balle tombe tout droit.',
      },
      {
        q: 'Quelle est la trajectoire de la balle par rapport à l’observateur sur le quai ?',
        bon: NOM.courbe,
        why: 'Lignes 4 et 5 : pour lui, la trace est arrondie sans être un cercle.',
      },
    ],
  },
  {
    titre: 'La gommette sur la roue',
    lignes: [
      'Zoé colle une gommette au bord d’une roue de vélo.',
      'Vue depuis le centre de la roue, la gommette tourne en rond.',
      'Le vélo roule ensuite tout droit.',
      'Vue depuis le trottoir, la gommette dessine une suite d’arches, comme des ponts.',
    ],
    vues: [
      {
        q: 'Quelle est la trajectoire de la gommette par rapport au centre de la roue ?',
        bon: NOM.cercle,
        why: 'Ligne 2 : la gommette tourne en rond autour du centre.',
      },
      {
        q: 'Quelle est la trajectoire de la gommette par rapport au trottoir ?',
        bon: NOM.courbe,
        why: 'Ligne 4 : les arches sont des courbes qui ne sont pas des cercles.',
      },
    ],
  },
  {
    titre: 'Sur le manège',
    lignes: [
      'Un manège tourne dans le parc.',
      'Sami est assis sur un cheval de bois.',
      'Sa sœur est assise juste à côté, sur un autre cheval.',
      'Leur père les regarde, debout sur le sol du parc.',
    ],
    vues: [
      {
        q: 'Quelle est la trajectoire de Sami par rapport à son père ?',
        bon: NOM.cercle,
        why: 'Par rapport au sol, Sami tourne avec le manège.',
      },
      {
        q: 'Comment Sami se déplace-t-il par rapport à sa sœur ?',
        bon: FIXE,
        why: 'Les deux enfants tournent ensemble et restent à la même place l’un par rapport à l’autre.',
      },
    ],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const r = rng.pick(RECITS);
  const v = rng.pick(r.vues);
  const { answer, traps } = choice(
    rng,
    v.bon,
    REPONSES.filter((x) => x !== v.bon).map((label) => ({ label, why: `Relis le point de vue demandé. ${v.why}` })),
  );
  return {
    prompt: `Lis le texte. ${v.q}`,
    figure: { kind: 'document', title: r.titre, lines: r.lignes },
    answer,
    traps,
    hint: 'Repère d’abord la référence citée dans la question, puis cherche la ligne qui en parle.',
    steps: ['La trajectoire dépend du point de vue.', v.why, `Réponse : **${v.bon}**.`],
    targetSeconds: 55,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const trajectoire: Skill = {
  id: 'pcm2-trajectoire',
  title: 'La trajectoire',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **trajectoire**, c’est la ligne que suit un objet qui bouge. Elle peut être **rectiligne** (droite), **circulaire** (cercle) ou une autre courbe.',
      'Précise toujours ton **point de vue** : « par rapport à… ». Par rapport à l’axe, un point d’un disque suit un cercle.',
    ],
    source: `${PROGRAMME} : « Observer et identifier le mouvement rectiligne ou circulaire d’un objet, en précisant le point de vue » ; « le Soleil décrit une courbe dans le ciel du point de vue de la cour de récréation ». CNRTL, « trajectoire » : « Courbe décrite par le centre de gravité d’un mobile. »`,
    sources: [PROGRAMME, 'cnrtl-trajectoire'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
