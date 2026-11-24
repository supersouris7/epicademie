import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Formes d'énergie du CM : pesanteur, cinétique, électrique (programme du cycle 3) ———

type Forme = 'pesanteur' | 'cinetique' | 'electrique';

interface Def {
  readonly nom: string;
  readonly accepte: readonly string[];
  readonly regle: string;
  /** Définition courte, sans le nom de la forme. */
  readonly def: string;
  /** Scènes où cette forme est la seule évidente. */
  readonly scenes: readonly string[];
}

const FORMES: Record<Forme, Def> = {
  pesanteur: {
    nom: 'l’énergie de pesanteur',
    accepte: ['énergie de pesanteur', 'l’énergie de pesanteur', 'pesanteur', 'energie de pesanteur'],
    regle: 'elle dépend de l’altitude : plus l’objet est haut, plus il en a',
    def: 'L’énergie qui dépend de l’altitude',
    scenes: [
      'Une pierre est posée, immobile, tout en haut d’une falaise.',
      'Une bille est tenue, immobile, en haut d’un toboggan.',
      'L’eau d’un lac de montagne est retenue en haut d’un barrage.',
    ],
  },
  cinetique: {
    nom: 'l’énergie cinétique',
    accepte: ['énergie cinétique', 'l’énergie cinétique', 'cinétique', 'energie cinetique', 'cinetique'],
    regle: 'elle est liée au mouvement : un objet qui bouge en a',
    def: 'L’énergie liée au mouvement',
    scenes: [
      'Une voiture roule vite sur une route toute plate.',
      'Un cycliste file sur une piste toute plate.',
      'Le vent souffle fort et pousse une voile.',
    ],
  },
  electrique: {
    nom: 'l’énergie électrique',
    accepte: ['énergie électrique', 'l’énergie électrique', 'électrique', 'energie electrique', 'electrique'],
    regle: 'c’est celle du courant qui circule dans les fils',
    def: 'L’énergie du courant qui circule dans les fils',
    scenes: [
      'Du courant circule dans le câble d’un chargeur de téléphone.',
      'Du courant circule dans un câble qui relie une éolienne au village.',
      'Le courant de la prise arrive dans le fil d’un grille-pain.',
    ],
  },
};
const CLES = Object.keys(FORMES) as Forme[];
const sans = (f: Forme) => CLES.filter((x) => x !== f);
const faux = (x: Forme) => ({ label: FORMES[x].nom, why: `Ce n’est pas ${FORMES[x].nom} : ${FORMES[x].regle}.` });

const niveau1 = (rng: Rng): QuestionDraft => {
  const f = rng.pick(CLES);
  const { answer, traps } = choice(rng, FORMES[f].nom, sans(f).map(faux));
  return {
    prompt: `${rng.pick(FORMES[f].scenes)} Quelle forme d’énergie voit-on surtout ici ?`,
    answer,
    traps,
    hint: 'Cherche un mot-clé : en haut, qui bouge, ou courant dans les fils.',
    steps: [
      'Chaque forme d’énergie a son indice : la hauteur, le mouvement ou le courant.',
      `Ici, ${FORMES[f].regle}.`,
      `Forme d’énergie : **${FORMES[f].nom}**.`,
    ],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Associe chaque situation à la forme d’énergie.',
      answer: association(rng, [
        [FORMES.pesanteur.scenes[0] ?? '', 'énergie de pesanteur'],
        [FORMES.cinetique.scenes[1] ?? '', 'énergie cinétique'],
        [FORMES.electrique.scenes[2] ?? '', 'énergie électrique'],
      ]),
      hint: 'Haut et immobile, qui bouge, courant dans un fil : trois indices, trois formes.',
      steps: [
        'On cherche l’indice de chaque situation.',
        'Haut : pesanteur. Mouvement : cinétique. Courant dans un fil : électrique.',
        'Chaque situation est reliée à **sa** forme.',
      ],
      targetSeconds: 45,
    };
  }
  const f = rng.pick(CLES);
  const bonne = rng.pick(FORMES[f].scenes);
  const autres = sans(f).flatMap((x) => FORMES[x].scenes.map((s) => ({ x, s })));
  const mauvaises = rng.shuffle(autres).slice(0, 3);
  const { answer, traps } = choice(
    rng,
    bonne,
    mauvaises.map(({ x, s }) => ({ label: s, why: `Ici, c’est plutôt ${FORMES[x].nom} : ${FORMES[x].regle}.` })),
  );
  return {
    prompt: `Dans quelle situation voit-on surtout ${FORMES[f].nom} ?`,
    answer,
    traps,
    hint: FORMES[f].regle.replace(/^./, (m) => m.toUpperCase()) + '.',
    steps: [
      `Pour ${FORMES[f].nom}, ${FORMES[f].regle}.`,
      'On garde la situation qui montre cet indice.',
      `Bonne situation : **${bonne}**`,
    ],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const juste = [
      'La bille est immobile tout en haut du toboggan',
      'Elle descend et prend de la vitesse',
      'Elle roule vite en bas du toboggan',
    ];
    return {
      prompt: 'Une bille descend un toboggan. Remets les étapes dans l’ordre.',
      answer: ordre(rng, juste),
      hint: 'Au début, la bille est haut placée et ne bouge pas.',
      steps: [
        'La bille part de tout en haut (énergie de pesanteur) et finit en mouvement (énergie cinétique).',
        `Ordre : **${juste.join(' → ')}**.`,
      ],
      targetSeconds: 35,
    };
  }
  const f = rng.pick(CLES);
  const { answer, traps } = saisie(
    FORMES[f].accepte,
    sans(f).map((x) => [FORMES[x].accepte[1] ?? '', `Ce n’est pas ${FORMES[x].nom} : ${FORMES[x].regle}.`] as const),
  );
  return {
    prompt: `${FORMES[f].def} s’appelle comment ? Écris son nom.`,
    answer,
    traps,
    hint: 'Les trois formes du CM : pesanteur, cinétique, électrique.',
    steps: [
      'On relie la définition au nom de la forme.',
      `${FORMES[f].def} : ${FORMES[f].regle}.`,
      `Forme d’énergie : **${FORMES[f].nom}**.`,
    ],
    targetSeconds: 30,
  };
};

const CAS_CINETIQUE: readonly { q: string; oui: boolean; why: string }[] = [
  {
    q: 'Une balle est immobile dans ta main. A-t-elle de l’énergie cinétique ?',
    oui: false,
    why: 'La balle ne bouge pas : sans mouvement, pas d’énergie cinétique.',
  },
  {
    q: 'Un ballon roule sur le sol. A-t-il de l’énergie cinétique ?',
    oui: true,
    why: 'Le ballon bouge : il a de l’énergie cinétique.',
  },
  {
    q: 'Un livre est posé sur une table. A-t-il de l’énergie cinétique ?',
    oui: false,
    why: 'Le livre ne bouge pas : il n’a pas d’énergie cinétique.',
  },
  {
    q: 'Un train traverse la gare à toute vitesse. A-t-il de l’énergie cinétique ?',
    oui: true,
    why: 'Le train bouge : il a de l’énergie cinétique.',
  },
];

const OBJETS: readonly { monte: string; descend: string }[] = [
  {
    monte: 'Une pierre est portée de plus en plus haut, jusqu’au sommet d’un mur.',
    descend: 'Une pierre glisse du haut d’une pente jusqu’en bas.',
  },
  {
    monte: 'Un seau est hissé de plus en plus haut dans un puits.',
    descend: 'Un seau descend de plus en plus bas dans un puits.',
  },
  {
    monte: 'Une caisse est montée à l’étage par un monte-charge.',
    descend: 'Une caisse est descendue à la cave par un monte-charge.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const cas = rng.pick(CAS_CINETIQUE);
    const { answer, traps } = saisie(cas.oui ? ['oui'] : ['non'], [[cas.oui ? 'non' : 'oui', cas.why]]);
    return {
      prompt: `${cas.q} Réponds par oui ou non.`,
      answer,
      traps,
      hint: 'L’énergie cinétique est liée au mouvement : est-ce que ça bouge ?',
      steps: ['L’énergie cinétique est liée au mouvement.', cas.why, `Réponse : **${cas.oui ? 'oui' : 'non'}**.`],
      targetSeconds: 25,
    };
  }
  const monte = rng.int(0, 1) === 0;
  const o = rng.pick(OBJETS);
  const bonne = monte ? 'augmente' : 'diminue';
  const { answer, traps } = saisie(
    [bonne],
    [
      [
        monte ? 'diminue' : 'augmente',
        'L’énergie de pesanteur dépend de l’altitude : si l’objet monte elle augmente, s’il descend elle diminue.',
      ],
    ],
  );
  return {
    prompt: `${monte ? o.monte : o.descend} Son énergie de pesanteur augmente ou diminue ? Écris le bon verbe.`,
    answer,
    traps,
    hint: 'L’énergie de pesanteur dépend de l’altitude : plus c’est haut, plus il y en a.',
    steps: [
      'On regarde si l’altitude de l’objet monte ou descend.',
      monte ? 'L’objet monte : son altitude augmente.' : 'L’objet descend : son altitude diminue.',
      `Son énergie de pesanteur **${bonne}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const juste = ['énergie de pesanteur', 'énergie cinétique', 'énergie électrique'];
    return {
      prompt: 'Lis le texte. Remets dans l’ordre les formes d’énergie, du départ à l’arrivée.',
      figure: {
        kind: 'document',
        title: 'Une centrale hydro-électrique',
        lines: [
          'L’eau d’un lac est retenue en haut d’un barrage.',
          'Elle dévale un grand tuyau et fait tourner une turbine.',
          'La turbine produit du courant qui part dans les fils.',
        ],
      },
      answer: ordre(rng, juste),
      hint: 'D’abord l’eau est en haut, puis elle bouge, puis le courant part.',
      steps: [
        'L’eau retenue en haut a de l’énergie de pesanteur.',
        'En dévalant le tuyau, elle bouge : énergie cinétique.',
        `Le courant dans les fils : énergie électrique. Ordre : **${juste.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const cas =
    t === 1
      ? {
          titre: 'Une centrale hydro-électrique',
          lignes: [
            'L’eau d’un lac est retenue en haut d’un barrage.',
            'Elle dévale un grand tuyau à toute vitesse et fait tourner une turbine.',
          ],
          q: 'Quelle forme d’énergie a surtout l’eau pendant qu’elle dévale le tuyau à toute vitesse ?',
          f: 'cinetique' as Forme,
        }
      : {
          titre: 'Une éolienne',
          lignes: [
            'Le vent fait tourner les pales d’une éolienne.',
            'Un câble envoie le courant de l’éolienne vers un village.',
          ],
          q: 'Quelle forme d’énergie circule dans le câble qui part vers le village ?',
          f: 'electrique' as Forme,
        };
  const { answer, traps } = choice(rng, FORMES[cas.f].nom, sans(cas.f).map(faux));
  return {
    prompt: `Lis le texte. ${cas.q}`,
    figure: { kind: 'document', title: cas.titre, lines: cas.lignes },
    answer,
    traps,
    hint: 'Relève le mot-clé de la question : altitude, mouvement ou courant.',
    steps: [
      'On repère dans le texte ce que fait l’objet ou l’eau à cet instant.',
      `Ici, ${FORMES[cas.f].regle}.`,
      `Forme d’énergie : **${FORMES[cas.f].nom}**.`,
    ],
    targetSeconds: 45,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const formesEnergie: Skill = {
  id: 'pcm1-formes-energie',
  title: 'Les formes d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’**énergie** existe sous plusieurs formes. L’**énergie de pesanteur** dépend de l’**altitude** : une bille tout en haut d’un toboggan en a beaucoup.',
      'L’**énergie cinétique** est liée au mouvement : plus ça bouge, plus il y en a. L’**énergie électrique** est celle du courant qui circule dans les fils.',
    ],
    source: `${PROGRAMME} : « énergie de pesanteur (dépendant de l’altitude sur Terre), énergie cinétique (liée au mouvement) et énergie électrique, par exemple dans le contexte de la production d’électricité par une centrale hydro-électrique ou une éolienne ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
