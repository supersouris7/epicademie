import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-matiere.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— États et changements d'état : noms, températures, paliers (6e) ———

type Etat = 'solide' | 'liquide' | 'gazeux';

interface Changement {
  readonly nom: string;
  readonly de: Etat;
  readonly vers: Etat;
  /** Réponses écrites acceptées. */
  readonly accepte: readonly string[];
  readonly situations: readonly string[];
}

const FUSION: Changement = {
  nom: 'fusion',
  de: 'solide',
  vers: 'liquide',
  accepte: ['fusion', 'la fusion'],
  situations: [
    'un glaçon qui devient de l’eau liquide dans un verre',
    'du chocolat solide qui fond dans une casserole',
  ],
};
const SOLIDIFICATION: Changement = {
  nom: 'solidification',
  de: 'liquide',
  vers: 'solide',
  accepte: ['solidification', 'la solidification'],
  situations: ['de l’eau qui devient de la glace au congélateur', 'de la cire liquide qui durcit en refroidissant'],
};
const VAPORISATION: Changement = {
  nom: 'vaporisation',
  de: 'liquide',
  vers: 'gazeux',
  accepte: [
    'vaporisation',
    'la vaporisation',
    'évaporation',
    'evaporation',
    'l’évaporation',
    'ébullition',
    'ebullition',
    'l’ébullition',
  ],
  situations: ['une flaque d’eau qui disparaît peu à peu au soleil', 'de l’eau qui bout et devient de la vapeur'],
};
const LIQUEFACTION: Changement = {
  nom: 'liquéfaction',
  de: 'gazeux',
  vers: 'liquide',
  accepte: ['liquéfaction', 'liquefaction', 'la liquéfaction', 'condensation', 'la condensation'],
  situations: [
    'la vapeur d’eau de l’air qui forme des gouttes sur une bouteille froide',
    'la vapeur d’une douche chaude qui se dépose en gouttes sur le miroir',
  ],
};
const CHANGEMENTS: readonly Changement[] = [FUSION, SOLIDIFICATION, VAPORISATION, LIQUEFACTION];
const INVERSE: ReadonlyMap<Changement, Changement> = new Map([
  [FUSION, SOLIDIFICATION],
  [SOLIDIFICATION, FUSION],
  [VAPORISATION, LIQUEFACTION],
  [LIQUEFACTION, VAPORISATION],
]);

const trajet = (c: Changement) => `de l’état ${c.de} à l’état ${c.vers}`;
const decrit = (c: Changement) => `La ${c.nom} fait passer ${trajet(c)}.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick([FUSION, SOLIDIFICATION, VAPORISATION]);
  const situation = rng.pick(c.situations);
  const { answer, traps: t } = choice(
    rng,
    maj(c.nom),
    [FUSION, SOLIDIFICATION, VAPORISATION].filter((x) => x !== c).map((x) => ({ label: maj(x.nom), why: decrit(x) })),
  );
  return {
    prompt: `On observe ${situation}. Quel est le nom de ce changement d’état ?`,
    answer,
    traps: t,
    hint: 'Repère l’état du corps au début, puis son état à la fin.',
    steps: ['On compare l’état de départ et l’état d’arrivée.', decrit(c), `C’est une **${c.nom}**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const c = rng.pick(CHANGEMENTS);
    const { answer, traps: tr } = choice(
      rng,
      maj(c.nom),
      CHANGEMENTS.filter((x) => x !== c).map((x) => ({ label: maj(x.nom), why: decrit(x) })),
    );
    return {
      prompt: `Quel changement d’état fait passer un corps ${trajet(c)} ?`,
      answer,
      traps: tr,
      hint: 'Pour chaque nom, cherche d’abord l’état de départ.',
      steps: ['Chaque changement d’état a un départ et une arrivée.', decrit(c), `C’est la **${c.nom}**.`],
      targetSeconds: 30,
    };
  }
  if (t === 1) {
    const c = rng.pick(CHANGEMENTS);
    const inv = INVERSE.get(c) ?? c;
    const { answer, traps: tr } = choice(
      rng,
      maj(inv.nom),
      CHANGEMENTS.filter((x) => x !== inv).map((x) => ({
        label: maj(x.nom),
        why: `${decrit(x)} Le chemin inverse va ${trajet(inv)}.`,
      })),
    );
    return {
      prompt: `Les changements d’état sont réversibles. Quel est le changement inverse de la ${c.nom} ?`,
      answer,
      traps: tr,
      hint: 'Échange l’état de départ et l’état d’arrivée.',
      steps: [decrit(c), `Le chemin inverse va ${trajet(inv)}.`, `Le changement inverse est la **${inv.nom}**.`],
      targetSeconds: 30,
    };
  }
  const trois = rng.shuffle(CHANGEMENTS).slice(0, 3);
  return {
    prompt: `Associe chaque changement d’état à son trajet : ${trois
      .map((c) => c.nom)
      .sort()
      .join(', ')}.`,
    answer: association(
      rng,
      trois.map((c) => [maj(c.nom), maj(trajet(c))]),
    ),
    hint: 'Commence par celui dont tu es le plus sûr.',
    steps: [
      'Chaque nom désigne un seul trajet entre deux états.',
      `Réponse : **${trois.map((c) => `${c.nom} → ${trajet(c)}`).join(' ; ')}**.`,
    ],
    targetSeconds: 45,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const c = rng.pick(CHANGEMENTS);
    const situation = rng.pick(c.situations);
    const { answer, traps: tr } = saisie(
      c.accepte,
      CHANGEMENTS.filter((x) => x !== c).map((x) => [x.nom, decrit(x)] as const),
    );
    return {
      prompt: `Écris le nom du changement d’état : ${situation}.`,
      answer,
      traps: tr,
      hint: 'Quel est l’état de départ ? Quel est l’état d’arrivée ?',
      steps: [`Ici, le corps passe ${trajet(c)}.`, `C’est la **${c.nom}**.`],
      targetSeconds: 30,
    };
  }
  if (t === 1) {
    const c = rng.pick(CHANGEMENTS);
    const etats: readonly Etat[] = ['solide', 'liquide', 'gazeux'];
    return {
      prompt: `Complète la définition de la ${c.nom}.`,
      answer: {
        kind: 'cloze',
        parts: [`La ${c.nom} est le passage de l’état `, ' à l’état ', '.'],
        blanks: [
          { mode: 'list', options: [...etats], correct: etats.indexOf(c.de) },
          { mode: 'list', options: [...etats], correct: etats.indexOf(c.vers) },
        ],
      },
      hint: 'Pense à un exemple de ce changement dans la cuisine ou la salle de bains.',
      steps: [`Départ : ${c.de} ; arrivée : ${c.vers}.`, `La ${c.nom} fait passer **${trajet(c)}**.`],
      targetSeconds: 35,
    };
  }
  const fond = rng.int(0, 1) === 0;
  const v = fond ? 0 : 100;
  return {
    prompt: `Dans les conditions habituelles, à quelle température ${
      fond ? 'la glace d’eau fond-elle' : 'l’eau bout-elle'
    }, en degrés Celsius ?`,
    answer: num(v, '°C'),
    traps: traps(r(v), [
      [
        fond ? 100 : 0,
        fond ? '100 °C est la température de l’eau bouillante.' : '0 °C est la température de la glace fondante.',
      ],
      [fond ? 32 : 90, 'Cette valeur n’est pas un des deux repères de l’échelle Celsius pour l’eau.'],
    ]),
    hint: 'L’échelle Celsius a été construite avec deux repères liés à l’eau.',
    steps: ['Les deux repères : la glace fondante et l’eau bouillante.', `La température cherchée est **${v} °C**.`],
    targetSeconds: 25,
  };
};

const CHAUFFE: readonly string[] = [
  'De la glace à −10 °C',
  'La glace qui fond à 0 °C',
  'De l’eau liquide à 50 °C',
  'L’eau qui bout à 100 °C',
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 3);
  if (t === 0) {
    const c = rng.pick(CHANGEMENTS);
    const inv = INVERSE.get(c) ?? c;
    const { answer, traps: tr } = saisie(inv.accepte, [
      [c.nom, `La ${c.nom} est le changement de départ, pas son inverse.`],
      ...CHANGEMENTS.filter((x) => x !== c && x !== inv).map((x) => [x.nom, decrit(x)] as const),
    ]);
    return {
      prompt: `Un corps a subi une ${c.nom}. Écris le nom du changement d’état qui le ramène à son état de départ.`,
      answer,
      traps: tr,
      hint: 'Réversible : on peut refaire le chemin dans l’autre sens.',
      steps: [decrit(c), `Pour revenir, il faut passer ${trajet(inv)}.`, `C’est la **${inv.nom}**.`],
      targetSeconds: 40,
    };
  }
  if (t === 1) {
    return {
      prompt: 'On chauffe de la glace prise à −10 °C. Range les observations dans l’ordre où elles se produisent.',
      answer: ordre(rng, CHAUFFE),
      hint: 'La température monte au cours du chauffage.',
      steps: [
        'En chauffant, la température monte ; elle reste fixe pendant la fusion et pendant l’ébullition.',
        `Ordre : **${CHAUFFE.join(' → ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  if (t === 2) {
    return {
      prompt: 'Associe chacun des quatre changements d’état à un exemple.',
      answer: association(
        rng,
        CHANGEMENTS.map((c) => [maj(c.nom), maj(c.situations[1] ?? c.nom)]),
      ),
      hint: 'Pour chaque exemple, note l’état de départ et l’état d’arrivée.',
      steps: [
        'On trouve le départ et l’arrivée dans chaque exemple.',
        `Réponse : **${CHANGEMENTS.map((c) => `${c.nom} → ${c.situations[1] ?? ''}`).join(' ; ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const bulles = rng.int(0, 1) === 0;
  const bon = bulles ? 'ébullition' : 'évaporation';
  const autre = bulles ? 'évaporation' : 'ébullition';
  const { answer, traps: tr } = saisie(
    bulles ? ['ébullition', 'ebullition', 'l’ébullition'] : ['évaporation', 'evaporation', 'l’évaporation'],
    [
      [
        autre,
        bulles
          ? 'L’évaporation se fait progressivement à la surface, sans bulles formées dans le liquide.'
          : 'L’ébullition forme des bulles de vapeur dans la masse du liquide.',
      ],
      ['fusion', 'La fusion concerne un solide qui devient liquide.'],
    ],
  );
  return {
    prompt: bulles
      ? 'Des bulles de vapeur se forment dans toute la masse d’un liquide et crèvent à la surface. Quel mot précis désigne ce phénomène ?'
      : 'L’eau d’un verre disparaît lentement par sa surface, sans aucune bulle. Quel mot précis désigne ce phénomène ?',
    answer,
    traps: tr,
    hint: 'Ce sont deux façons de passer de l’état liquide à l’état gazeux : regarde où le gaz se forme.',
    steps: [
      bulles ? 'Le gaz se forme dans le liquide, en bulles.' : 'Le passage est progressif et se fait à la surface.',
      `C’est l’**${bon}**.`,
    ],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  // Courbe de température d'un corps A (valeurs inventées, annoncées comme relevés).
  const chauffe = rng.int(0, 1) === 0;
  const depart: Etat = rng.pick(chauffe ? (['solide', 'liquide'] as const) : (['liquide', 'gazeux'] as const));
  const c = chauffe
    ? depart === 'solide'
      ? FUSION
      : VAPORISATION
    : depart === 'liquide'
      ? SOLIDIFICATION
      : LIQUEFACTION;
  const palier = rng.int(8, 30) * 5;
  const pas = rng.int(2, 6) * 5;
  const duree = rng.int(2, 4);
  const s = chauffe ? 1 : -1;
  const temps = [palier - 2 * s * pas, palier - s * pas, ...Array<number>(duree + 1).fill(palier), palier + s * pas];
  const figure = {
    kind: 'document' as const,
    title: 'Relevés du corps A (données de l’exercice)',
    lines: [
      `Au départ, le corps A est à l’état ${depart}. On le ${chauffe ? 'chauffe' : 'refroidit'} régulièrement.`,
      ...temps.map((v, i) => `Minute ${i} : ${v} °C`),
    ],
  };
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Lis les relevés. Quelle est la température du palier, en degrés Celsius ?',
      figure,
      answer: num(palier, '°C'),
      traps: traps(r(palier), [
        [temps[0] ?? 0, 'C’est la température de départ, avant le palier.'],
        [temps[temps.length - 1] ?? 0, 'C’est la dernière température relevée, après le palier.'],
      ]),
      hint: 'Un palier : la température ne change plus pendant plusieurs minutes.',
      steps: [
        'On cherche une valeur qui se répète d’une minute à l’autre.',
        `La température reste à **${palier} °C** : c’est le palier.`,
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Lis les relevés. Combien de minutes dure le palier de température ?',
      figure,
      answer: num(duree, 'min'),
      traps: traps(r(duree), [
        [duree + 1, 'Tu as compté les relevés : la durée est l’écart entre le premier et le dernier relevé du palier.'],
        [temps.length - 1, 'C’est la durée de toute l’expérience.'],
      ]),
      hint: 'Repère la première et la dernière minute où la température est la même.',
      steps: [
        `Le palier commence à la minute 2 et finit à la minute ${2 + duree}.`,
        `Il dure ${2 + duree} − 2 = **${duree} min**.`,
      ],
      targetSeconds: 70,
    };
  }
  const { answer, traps: tr } = choice(
    rng,
    maj(c.nom),
    CHANGEMENTS.filter((x) => x !== c).map((x) => ({ label: maj(x.nom), why: decrit(x) })),
  );
  return {
    prompt: 'Lis les relevés. Quel changement d’état se produit pendant le palier ?',
    figure,
    answer,
    traps: tr,
    hint: 'Utilise l’état de départ et le sens : chauffe-t-on ou refroidit-on ?',
    steps: [
      `Au départ le corps est ${depart} et on le ${chauffe ? 'chauffe' : 'refroidit'}.`,
      `Pendant le palier, il passe ${trajet(c)}.`,
      `C’est la **${c.nom}**.`,
    ],
    targetSeconds: 75,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const etatsMatiere: Skill = {
  id: 'p6-etats',
  title: 'États et changements d’état',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La matière existe à l’état **solide**, **liquide** ou **gazeux**. La **fusion** (solide → liquide) et la **solidification** sont inverses, comme la **vaporisation** (liquide → gaz) et la **liquéfaction** : un **changement d’état** est réversible.',
      'Quand on suit la température au cours du temps, un **palier de température** (elle ne bouge plus) peut signaler un changement d’état : la glace fond à 0 °C et l’eau bout à 100 °C dans les conditions habituelles.',
    ],
    ...references(
      'etats',
      'reversibles',
      'temperatures',
      'paliers',
      'fusion',
      'solidification',
      'vaporisation',
      'liquefaction',
      'evaporation',
      'ebullition',
      'eau-reperes',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
