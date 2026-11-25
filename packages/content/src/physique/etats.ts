import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { association, maj, ordre, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { references } from './donnees-matiere.ts';

// ——— États de la matière et changements d'état (5e) ———

type Etat = 'solide' | 'liquide' | 'gazeux';
const ETATS: readonly Etat[] = ['solide', 'liquide', 'gazeux'];

const EXEMPLES: Record<Etat, readonly string[]> = {
  solide: ['un clou en fer', 'un glaçon', 'un morceau de bois', 'une pièce de monnaie'],
  liquide: ['de l’huile versée dans un verre', 'de l’eau du robinet', 'du lait dans une bouteille'],
  gazeux: ['l’air enfermé dans un ballon', 'de la vapeur d’eau', 'le dioxygène d’une bouteille de plongée'],
};

const PROPRIETE: Record<Etat, string> = {
  solide: 'a une forme et un volume déterminés',
  liquide: 'a un volume invariable, mais pas de forme propre',
  gazeux: 'occupe la totalité de l’espace du récipient qui le contient',
};

interface Changement {
  readonly nom: string;
  readonly de: Etat;
  readonly vers: Etat;
  /** Réponses écrites acceptées (variantes du cours, avec ou sans accents). */
  readonly accepte: readonly string[];
  readonly situations: readonly string[];
}

const CHANGEMENTS: readonly Changement[] = [
  {
    nom: 'fusion',
    de: 'solide',
    vers: 'liquide',
    accepte: ['fusion', 'la fusion'],
    situations: ['un glaçon qui devient de l’eau sur la table', 'du beurre qui devient liquide dans une casserole'],
  },
  {
    nom: 'solidification',
    de: 'liquide',
    vers: 'solide',
    accepte: ['solidification', 'la solidification'],
    situations: ['de l’eau qui devient de la glace au congélateur', 'de la cire liquide qui durcit en refroidissant'],
  },
  {
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
  },
  {
    nom: 'liquéfaction',
    de: 'gazeux',
    vers: 'liquide',
    accepte: ['liquéfaction', 'liquefaction', 'la liquéfaction', 'condensation', 'la condensation'],
    situations: [
      'la vapeur d’eau de l’air qui forme des gouttes sur une bouteille froide',
      'la vapeur d’une douche chaude qui forme de la buée liquide sur le miroir',
    ],
  },
];

const SUBLIMATION: Changement = {
  nom: 'sublimation',
  de: 'solide',
  vers: 'gazeux',
  accepte: ['sublimation', 'la sublimation'],
  situations: [
    'un solide qui passe directement à l’état gazeux, sans jamais devenir liquide',
    'des cristaux solides qui deviennent un gaz sans passer par l’état liquide',
  ],
};
const TOUS: readonly Changement[] = [...CHANGEMENTS, SUBLIMATION];

const trajet = (c: Changement) => `de l’état ${c.de} à l’état ${c.vers}`;
const pourquoi = (autre: Changement) => `La ${autre.nom} fait passer ${trajet(autre)}.`;

const niveau1 = (rng: Rng): QuestionDraft => {
  const etat = rng.pick(ETATS);
  const objet = rng.pick(EXEMPLES[etat]);
  const { answer, traps } = choice(
    rng,
    maj(etat),
    ETATS.filter((e) => e !== etat).map((e) => ({
      label: maj(e),
      why: `À l’état ${e}, un corps ${PROPRIETE[e]} : ce n’est pas le cas ici.`,
    })),
  );
  return {
    prompt: `Dans quel état physique se trouve ${objet} ?`,
    answer,
    traps,
    hint: 'Garde-t-il sa forme ? Garde-t-il son volume ?',
    steps: [
      'On regarde si le corps garde sa forme et son volume.',
      `Un corps à l’état ${etat} ${PROPRIETE[etat]}.`,
      `Il est à l’état **${etat}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    return {
      prompt: 'Associe chaque état de la matière à sa propriété.',
      answer: association(
        rng,
        ETATS.map((e) => [maj(e), maj(PROPRIETE[e])]),
      ),
      hint: 'Demande-toi lequel garde sa forme, lequel garde seulement son volume, lequel remplit tout.',
      steps: [
        'Le solide garde forme et volume ; le liquide garde seulement son volume.',
        `Réponse : **${ETATS.map((e) => `${e} → ${PROPRIETE[e]}`).join(' ; ')}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const c = rng.pick(CHANGEMENTS);
  const situation = rng.pick(c.situations);
  const { answer, traps } = choice(
    rng,
    maj(c.nom),
    CHANGEMENTS.filter((x) => x !== c).map((x) => ({ label: maj(x.nom), why: pourquoi(x) })),
  );
  return {
    prompt: `On observe ${situation}. Quel est le nom de ce changement d’état ?`,
    answer,
    traps,
    hint: 'Cherche l’état de départ, puis l’état d’arrivée.',
    steps: [`Ici, la matière passe ${trajet(c)}.`, `Ce passage s’appelle la ${c.nom} : **${maj(c.nom)}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CHANGEMENTS);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Complète la définition de la ${c.nom}.`,
      answer: {
        kind: 'cloze',
        parts: [`La ${c.nom} est le passage de l’état `, ' à l’état ', '.'],
        blanks: [c.de, c.vers].map((e) => ({ mode: 'list' as const, options: [...ETATS], correct: ETATS.indexOf(e) })),
      },
      hint: 'Pense à un exemple du quotidien, puis nomme l’état avant et l’état après.',
      steps: [`Exemple : ${c.situations[0]}.`, `La ${c.nom} fait passer **${trajet(c)}**.`],
      targetSeconds: 35,
    };
  }
  const { answer, traps } = saisie(
    c.accepte,
    CHANGEMENTS.filter((x) => x !== c).map((x) => [x.nom, pourquoi(x)] as const),
  );
  return {
    prompt: `Écris le nom du changement d’état : la matière passe ${trajet(c)}.`,
    answer,
    traps,
    hint: 'Le nom ressemble souvent à l’état d’arrivée ou à une action : fondre, devenir solide, devenir vapeur…',
    steps: [`Exemple : ${c.situations[0]}.`, `Réponse : **la ${c.nom}**.`],
    targetSeconds: 35,
  };
};

/** Confusion classique : un solide qui « fond » dans l'eau se dissout, il ne fond pas. */
const DISSOLUTIONS: readonly string[] = [
  'Un élève dit : « Le sucre fond dans mon thé. » On ne voit plus les grains.',
  'Une élève dit : « Le sel fond dans l’eau de cuisson. » On ne voit plus les grains.',
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 3);
  if (type === 0) {
    const cinq = TOUS.map((c) => [maj(c.nom), `De l’état ${c.de} à l’état ${c.vers}`] as const);
    return {
      prompt: 'Associe chacun des cinq changements d’état à son trajet.',
      answer: association(rng, cinq),
      hint: 'Commence par les changements que tu connais le mieux, puis déduis les autres.',
      steps: [
        'La sublimation va directement du solide au gaz.',
        `Réponse : **${cinq.map(([a, b]) => `${a} → ${b.toLowerCase()}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (type === 1) {
    const { answer, traps } = saisie(
      ['dissolution', 'la dissolution', 'une dissolution'],
      [
        [
          'fusion',
          'La fusion est le passage d’un solide à l’état liquide sous l’effet de la chaleur, sans ajout d’eau.',
        ],
        ['évaporation', 'L’évaporation fait passer de l’eau liquide à l’état gazeux.'],
      ],
    );
    return {
      prompt: `${rng.pick(DISSOLUTIONS)} Quel mot scientifique faut-il employer à la place de « fond » ? Écris le nom du phénomène.`,
      answer,
      traps,
      hint: 'Le solide se mélange à l’eau : ce n’est pas un changement d’état.',
      steps: [
        'La fusion transforme un solide en liquide sous l’effet de la chaleur.',
        'Ici, le solide se mélange complètement à l’eau.',
        'C’est une **dissolution**.',
      ],
      targetSeconds: 45,
    };
  }
  if (type === 2) {
    const c = rng.pick([SUBLIMATION, CHANGEMENTS[3] ?? SUBLIMATION]);
    const { answer, traps } = saisie(
      c.accepte,
      TOUS.filter((x) => x !== c).map((x) => [x.nom, pourquoi(x)] as const),
    );
    return {
      prompt: `Écris le nom du changement d’état observé : ${rng.pick(c.situations)}.`,
      answer,
      traps,
      hint: 'Repère l’état de départ et l’état d’arrivée, sans te fier à l’aspect.',
      steps: [`La matière passe ${trajet(c)}.`, `C’est la **${c.nom}**.`],
      targetSeconds: 45,
    };
  }
  const lies = rng.int(0, 1) === 0;
  const bon = lies ? 'Solide' : 'Liquide';
  const { answer, traps } = choice(rng, bon, [
    {
      label: lies ? 'Liquide' : 'Solide',
      why: lies
        ? 'À l’état liquide, la cohésion entre les molécules est faible : le corps coule.'
        : 'À l’état solide, les molécules sont fortement liées : le corps ne coule pas.',
    },
    { label: 'Gazeux', why: 'Un gaz occupe tout l’espace du récipient : ce n’est pas la description donnée.' },
  ]);
  return {
    prompt: lies
      ? 'À l’échelle des molécules : elles sont fortement liées les unes aux autres. De quel état s’agit-il ?'
      : 'À l’échelle des molécules : leur cohésion est faible, le corps coule mais garde son volume. De quel état s’agit-il ?',
    answer,
    traps,
    hint: 'Des molécules très liées empêchent le corps de se déformer.',
    steps: [
      'On relie le comportement des molécules à ce qu’on observe.',
      lies
        ? 'Des molécules fortement liées donnent une forme déterminée.'
        : 'Une faible cohésion laisse le corps couler.',
      `C’est l’état **${bon.toLowerCase()}**.`,
    ],
    targetSeconds: 45,
  };
};

/** Substances fictives : températures de changement d'état (°C) données dans l'exercice. */
const SUBSTANCES = ['A', 'B', 'C', 'D'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const nom = rng.pick(SUBSTANCES);
  const tf = rng.int(-8, 6) * 5;
  const te = tf + rng.int(10, 30) * 5;
  const figure = {
    kind: 'document' as const,
    title: `Fiche de la substance ${nom} (données de l’exercice)`,
    lines: [
      `La substance ${nom} est un corps pur.`,
      `Température de fusion : ${tf} °C.`,
      `Température d’ébullition : ${te} °C.`,
    ],
  };
  const type = rng.int(0, 2);
  if (type === 0) {
    const items = [
      `Substance ${nom} à l’état solide`,
      'Fusion',
      `Substance ${nom} à l’état liquide`,
      'Vaporisation',
      `Substance ${nom} à l’état gazeux`,
    ];
    return {
      prompt: `La substance ${nom} est chauffée à partir de ${tf - 10} °C jusqu’à ${te + 10} °C. Remets les étapes dans l’ordre.`,
      figure,
      answer: ordre(rng, items),
      hint: 'La température monte : quelle température rencontre-t-on la première ?',
      steps: [`La fusion a lieu à ${tf} °C, avant l’ébullition à ${te} °C.`, `Ordre : **${items.join(' → ')}**.`],
      targetSeconds: 80,
    };
  }
  if (type === 1) {
    const zone = rng.int(0, 2);
    const t = zone === 0 ? tf - rng.int(2, 9) : zone === 1 ? tf + rng.int(2, te - tf - 2) : te + rng.int(2, 20);
    const etat = ETATS[zone] ?? 'solide';
    const { answer, traps } = choice(
      rng,
      maj(etat),
      ETATS.filter((e) => e !== etat).map((e) => ({
        label: maj(e),
        why: `Compare ${t} °C aux deux températures : sous ${tf} °C le corps est solide, au-dessus de ${te} °C il est gazeux.`,
      })),
    );
    return {
      prompt: `Lis la fiche. Dans quel état se trouve la substance ${nom} à ${t} °C ?`,
      figure,
      answer,
      traps,
      hint: 'Place la température par rapport à la fusion et à l’ébullition.',
      steps: [
        `On compare ${t} °C avec ${tf} °C (fusion) et ${te} °C (ébullition).`,
        zone === 0
          ? 'La température est inférieure à celle de la fusion.'
          : zone === 1
            ? 'La température est entre la fusion et l’ébullition.'
            : 'La température est supérieure à celle de l’ébullition.',
        `La substance est à l’état **${etat}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const monte = rng.int(0, 1) === 0;
  const c = CHANGEMENTS[monte ? 0 : 1] ?? SUBLIMATION;
  const [debut, fin] = monte ? [tf - 5, tf + 5] : [tf + 5, tf - 5];
  const { answer, traps } = saisie(
    c.accepte,
    CHANGEMENTS.filter((x) => x !== c).map((x) => [x.nom, pourquoi(x)] as const),
  );
  return {
    prompt: `Lis la fiche. La température de la substance ${nom} passe de ${debut} °C à ${fin} °C. Écris le nom du changement d’état qui se produit.`,
    figure,
    answer,
    traps,
    hint: 'Quel état avant, quel état après la température de fusion ?',
    steps: [
      `On franchit ${tf} °C, la température de fusion, en ${monte ? 'chauffant' : 'refroidissant'}.`,
      `La substance passe ${trajet(c)}.`,
      `C’est la **${c.nom}**.`,
    ],
    targetSeconds: 70,
  };
};

export const etats: Skill = {
  id: 'p5-etats',
  title: 'États et changements d’état',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Trois états : **solide** (forme et volume déterminés), **liquide** (volume invariable, pas de forme propre), **gaz** (occupe tout l’espace).',
      '**Fusion** : solide → liquide. **Solidification** : liquide → solide. **Vaporisation** : liquide → gaz. **Liquéfaction** : gaz → liquide. **Sublimation** : solide → gaz.',
      'À l’échelle des molécules : très liées dans un solide, peu liées dans un liquide. Attention : le sucre ne « fond » pas dans le thé, il se dissout.',
    ],
    ...references(
      'etats-programme',
      'changements-programme',
      'microscopique-programme',
      'solide',
      'liquide-etat',
      'liquide-molecules',
      'gaz',
      'fusion',
      'solidification',
      'vaporisation',
      'liquefaction',
      'condensation',
      'ebullition',
      'evaporation',
      'sublimation',
    ),
  },
  generate: (rng, level) => ([niveau1, niveau2, niveau3, niveau4, niveau5][level - 1] ?? niveau1)(rng),
};
