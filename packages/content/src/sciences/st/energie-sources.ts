import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Sources d'énergie : Soleil, vent, eau, bois, charbon, pétrole (programme du cycle 3) ———

type Cle = 'soleil' | 'vent' | 'eau' | 'bois' | 'charbon' | 'petrole';

interface Source {
  readonly nom: string;
  readonly accepte: readonly string[];
  /** Scène où cette source est reconnaissable sans ambiguïté. */
  readonly scene: string;
  readonly scene2: string;
  /** Appareil ou lieu qui l'utilise. */
  readonly appareil: string;
  readonly regle: string;
}

const SOURCES: Record<Cle, Source> = {
  soleil: {
    nom: 'le Soleil',
    accepte: ['soleil', 'le soleil'],
    scene: 'Des panneaux posés sur un toit reçoivent la lumière du ciel.',
    scene2: 'Une calculatrice solaire fonctionne sans pile, avec la lumière de la fenêtre.',
    appareil: 'Un panneau solaire',
    regle: 'il envoie sa lumière à la Terre',
  },
  vent: {
    nom: 'le vent',
    accepte: ['vent', 'le vent'],
    scene: 'Les grandes pales d’une éolienne tournent parce que l’air bouge.',
    scene2: 'Un voilier avance sans moteur, poussé par l’air qui souffle dans sa voile.',
    appareil: 'Une éolienne',
    regle: 'c’est de l’air qui se déplace',
  },
  eau: {
    nom: 'l’eau',
    accepte: ['eau', 'l’eau'],
    scene: 'Dans un barrage, l’eau tombe de haut et fait tourner une turbine.',
    scene2: 'L’eau d’une rivière pousse la roue d’un vieux moulin.',
    appareil: 'Un moulin à eau',
    regle: 'elle coule ou elle tombe et fait tourner une roue',
  },
  bois: {
    nom: 'le bois',
    accepte: ['bois', 'le bois'],
    scene: 'On fait brûler des bûches dans un poêle pour chauffer la maison.',
    scene2: 'Autour du feu de camp, on ajoute des branches pour qu’il continue de chauffer.',
    appareil: 'Un poêle à bûches',
    regle: 'il vient des arbres et on le brûle',
  },
  charbon: {
    nom: 'le charbon',
    accepte: ['charbon', 'le charbon'],
    scene: 'Dans une ancienne centrale, on brûle des morceaux de roche noire sortis d’une mine.',
    scene2: 'Autrefois, la locomotive d’un train à vapeur brûlait de la roche noire sortie d’une mine.',
    appareil: 'Une centrale à charbon',
    regle: 'c’est une roche noire, sortie d’une mine, que l’on brûle',
  },
  petrole: {
    nom: 'le pétrole',
    accepte: ['pétrole', 'le pétrole', 'petrole', 'le petrole'],
    scene: 'Une plate-forme pompe un liquide noir très profond sous le sol ou sous la mer.',
    scene2: 'Dans une raffinerie, un liquide noir pompé sous terre est transformé en carburant.',
    appareil: 'Un puits de pétrole',
    regle: 'c’est un liquide noir pompé sous terre',
  },
};
const CLES = Object.keys(SOURCES) as Cle[];

const sans = (c: Cle) => CLES.filter((x) => x !== c);
const faux = (x: Cle) => ({ label: SOURCES[x].nom, why: `Ce n’est pas ${SOURCES[x].nom} : ${SOURCES[x].regle}.` });

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CLES);
  const autres = rng.shuffle(sans(c)).slice(0, 2);
  const { answer, traps } = choice(rng, SOURCES[c].nom, autres.map(faux));
  return {
    prompt: `${SOURCES[c].scene} Quelle est la source d’énergie ?`,
    answer,
    traps,
    hint: 'Cherche le mot-clé de la scène : lumière, air qui bouge, eau, bûches, roche noire ou liquide noir.',
    steps: [
      'Une source d’énergie, c’est ce dont on tire de l’énergie.',
      `Ici, ${SOURCES[c].regle}.`,
      `Source d’énergie : **${SOURCES[c].nom}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = rng.shuffle(CLES).slice(0, 3);
    return {
      prompt: `Associe chaque source d’énergie à ce qui l’utilise : ${trois.map((c) => SOURCES[c].nom).join(', ')}.`,
      answer: association(
        rng,
        trois.map((c) => [SOURCES[c].nom, SOURCES[c].appareil] as const),
      ),
      hint: 'Commence par la source qui t’évoque tout de suite un appareil, puis termine par élimination.',
      steps: [
        'Chaque appareil utilise une source précise.',
        'On relie ce que l’appareil reçoit : lumière, air, eau, bûches, roche noire ou liquide noir.',
        'Chaque source est reliée à **son** appareil.',
      ],
      targetSeconds: 45,
    };
  }
  const c = rng.pick(CLES);
  const { answer, traps } = choice(rng, SOURCES[c].nom, rng.shuffle(sans(c)).slice(0, 3).map(faux));
  return {
    prompt: `${SOURCES[c].scene2} Quelle source d’énergie est utilisée ?`,
    answer,
    traps,
    hint: 'Repère ce qui fait avancer ou chauffer l’objet dans la scène.',
    steps: [
      'On repère ce qui apporte l’énergie dans la scène.',
      `Ici, ${SOURCES[c].regle}.`,
      `Source d’énergie : **${SOURCES[c].nom}**.`,
    ],
    targetSeconds: 25,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const eolien = rng.int(0, 1) === 0;
    const juste = eolien
      ? [
          'Le vent fait tourner les pales d’une éolienne',
          'L’éolienne produit de l’électricité',
          'Le courant circule dans les fils',
          'Une lampe s’allume dans une maison',
        ]
      : [
          'L’eau est retenue en haut d’un barrage',
          'L’eau descend et fait tourner une turbine',
          'La centrale produit de l’électricité',
          'Une lampe s’allume dans une maison',
        ];
    return {
      prompt: eolien
        ? 'Du vent jusqu’à la lampe, remets les étapes dans l’ordre.'
        : 'De l’eau du barrage jusqu’à la lampe, remets les étapes dans l’ordre.',
      answer: ordre(rng, juste),
      hint: 'Pars de la source d’énergie et finis par l’appareil qui s’allume.',
      steps: ['On suit l’énergie depuis sa source jusqu’à l’appareil.', `Ordre : **${juste.join(' → ')}**.`],
      targetSeconds: 40,
    };
  }
  const c = rng.pick(CLES);
  const { answer, traps } = saisie(
    SOURCES[c].accepte,
    sans(c).map(
      (x) =>
        [
          SOURCES[x].accepte[SOURCES[x].accepte.length - 1] ?? '',
          `Ce n’est pas ${SOURCES[x].nom} : ${SOURCES[x].regle}.`,
        ] as const,
    ),
  );
  return {
    prompt: `${SOURCES[c].scene2} Écris le nom de la source d’énergie.`,
    answer,
    traps,
    hint: 'Pense à ce qui apporte l’énergie : de la lumière, de l’air, de l’eau, ou quelque chose que l’on brûle ou que l’on pompe.',
    steps: [
      'On repère ce qui apporte l’énergie dans la scène.',
      `Ici, ${SOURCES[c].regle}.`,
      `Source d’énergie : **${SOURCES[c].nom}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cinq = rng.shuffle(CLES).slice(0, 5);
    return {
      prompt: `Relie chaque source d’énergie à ce qui la décrit le mieux : ${cinq.map((c) => SOURCES[c].nom).join(', ')}.`,
      answer: association(
        rng,
        cinq.map((c) => [SOURCES[c].nom, SOURCES[c].regle.replace(/^./, (m) => m.toUpperCase())] as const),
      ),
      hint: 'Les trois sources que l’on brûle ou que l’on pompe se ressemblent : cherche la couleur et l’origine.',
      steps: [
        'Chaque source a un trait qui la distingue des autres.',
        'On élimine les descriptions que l’on est sûr d’avoir reconnues.',
        'Chaque source est reliée à **sa** description.',
      ],
      targetSeconds: 60,
    };
  }
  return {
    prompt: 'Complète la phrase.',
    answer: {
      kind: 'cloze',
      parts: ['La Terre reçoit de l’énergie du ', ' par la ', ' qu’il émet.'],
      blanks: [
        { mode: 'text', accepted: ['soleil'] },
        { mode: 'text', accepted: ['lumière'] },
      ],
    },
    hint: 'C’est l’astre qui éclaire le jour et qui chauffe la Terre.',
    steps: [
      'Sans cet astre, la Terre serait noire et glacée.',
      'Il envoie son énergie jusqu’à nous en émettant de la lumière.',
      'La Terre reçoit de l’énergie du **Soleil** par la **lumière** qu’il émet.',
    ],
    targetSeconds: 30,
  };
};

const RECITS: readonly { c: Cle; titre: string; lignes: readonly string[]; pourquoi: string }[] = [
  {
    c: 'vent',
    titre: 'Sur la colline',
    lignes: [
      'Sur la colline, trois grandes éoliennes tournent lentement.',
      'Quand l’air ne bouge pas, elles s’arrêtent.',
      'Le courant qu’elles produisent part vers le village.',
    ],
    pourquoi: 'Les éoliennes tournent quand l’air bouge : elles utilisent le vent.',
  },
  {
    c: 'eau',
    titre: 'Dans la vallée',
    lignes: [
      'Un grand mur de béton retient l’eau du lac.',
      'Une partie de l’eau descend dans un tuyau et fait tourner une turbine.',
      'Plus l’eau tombe de haut, plus la turbine tourne fort.',
    ],
    pourquoi: 'C’est l’eau qui tombe qui fait tourner la turbine : la source est l’eau.',
  },
  {
    c: 'bois',
    titre: 'Au chalet',
    lignes: [
      'Chaque soir, on met des bûches dans la cheminée.',
      'Les flammes chauffent toute la pièce.',
      'Le matin, il reste de la cendre grise.',
    ],
    pourquoi: 'Les bûches viennent des arbres : on brûle du bois pour se chauffer.',
  },
  {
    c: 'soleil',
    titre: 'Sur le toit de l’école',
    lignes: [
      'Des panneaux sont posés sur le toit, face au ciel.',
      'Par temps clair, ils reçoivent beaucoup de lumière.',
      'Quand le ciel est très sombre, ils produisent moins.',
    ],
    pourquoi: 'Les panneaux fonctionnent grâce à la lumière du ciel : la source est le Soleil.',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.pick(RECITS);
  const { answer, traps } = choice(rng, SOURCES[t.c].nom, rng.shuffle(sans(t.c)).slice(0, 3).map(faux));
  return {
    prompt: 'Lis le texte. Quelle source d’énergie est utilisée ?',
    figure: { kind: 'document', title: t.titre, lines: t.lignes },
    answer,
    traps,
    hint: 'Relève dans le texte ce qui apporte l’énergie : lumière, air, eau qui tombe, bûches…',
    steps: [
      'On cherche dans le texte ce qui apporte l’énergie.',
      t.pourquoi,
      `Source d’énergie : **${SOURCES[t.c].nom}**.`,
    ],
    targetSeconds: 40,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const sourcesEnergie: Skill = {
  id: 'pcm1-sources-energie',
  title: 'Les sources d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **source d’énergie**, c’est ce dont on tire de l’**énergie** : le Soleil, le vent, l’eau, le bois, le charbon, le pétrole. Une éolienne utilise le vent, un barrage utilise l’eau !',
      'Le Soleil est la source la plus importante : la Terre reçoit son énergie par la lumière. Il fait vivre les êtres vivants et aide aussi les activités humaines.',
    ],
    source: `${PROGRAMME} : « différentes ressources en énergie (Soleil, eau, vent, pétrole, bois, charbon, dihydrogène, combustible nucléaire (uranium), etc.) » ; « L’importance de l’énergie reçue du Soleil pour la vie sur Terre et pour les activités humaines est mentionnée » ; « la Terre reçoit de l’énergie du Soleil par la lumière qu’il émet ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
