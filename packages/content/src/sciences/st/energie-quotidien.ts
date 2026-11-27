import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Énergie et vie quotidienne : conversions simples et usages (programme du cycle 3) ———

type Forme = 'pesanteur' | 'cinétique' | 'électrique';
const NOM: Record<Forme, string> = {
  pesanteur: 'énergie de pesanteur',
  cinétique: 'énergie cinétique',
  électrique: 'énergie électrique',
};
const FORMES = Object.keys(NOM) as Forme[];

interface Conversion {
  readonly de: Forme;
  readonly vers: Forme;
  readonly scene: string;
  readonly phrase: string;
}

const CONVERSIONS: readonly Conversion[] = [
  {
    de: 'pesanteur',
    vers: 'cinétique',
    scene: 'Une bille tombe du haut d’une table.',
    phrase: 'Pendant la chute, l’énergie de pesanteur est convertie en énergie cinétique.',
  },
  {
    de: 'pesanteur',
    vers: 'cinétique',
    scene: 'L’eau d’une chute tombe sur la roue d’un moulin à eau et la fait tourner.',
    phrase: 'L’eau qui tombe perd de l’altitude : son énergie de pesanteur est convertie en énergie cinétique.',
  },
  {
    de: 'pesanteur',
    vers: 'cinétique',
    scene: 'Un enfant se laisse glisser du haut d’un toboggan.',
    phrase: 'En descendant, il perd de l’altitude et gagne du mouvement.',
  },
  {
    de: 'cinétique',
    vers: 'électrique',
    scene: 'Le vent fait tourner une éolienne qui produit du courant.',
    phrase: 'Le mouvement des pales est converti en énergie électrique.',
  },
  {
    de: 'cinétique',
    vers: 'électrique',
    scene: 'L’eau qui dévale un tuyau fait tourner la turbine d’une centrale hydro-électrique, qui produit du courant.',
    phrase: 'Le mouvement de la turbine est converti en énergie électrique.',
  },
];

const texteConv = (c: Conversion) => `${NOM[c.de]} → ${NOM[c.vers]}`;
const TOUTES: readonly string[] = [
  'énergie de pesanteur → énergie cinétique',
  'énergie cinétique → énergie électrique',
  'énergie cinétique → énergie de pesanteur',
  'énergie électrique → énergie de pesanteur',
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CONVERSIONS);
  const { answer, traps } = choice(
    rng,
    NOM[c.vers],
    FORMES.filter((f) => f !== c.vers).map((f) => ({
      label: NOM[f],
      why:
        f === c.de
          ? 'C’est l’énergie de départ : elle est convertie en une autre forme.'
          : `Ce n’est pas l’${NOM[f]} : ${c.phrase.replace(/^./, (m) => m.toLowerCase())}`,
    })),
  );
  return {
    prompt: `${c.scene} Au départ, il y a de l’${NOM[c.de]}. En quelle forme est-elle convertie ?`,
    answer,
    traps,
    hint: 'Regarde ce que fait l’objet ou l’eau à la fin de la scène.',
    steps: [
      'Convertir, c’est passer d’une forme d’énergie à une autre.',
      c.phrase,
      `Elle est convertie en **${NOM[c.vers]}**.`,
    ],
    targetSeconds: 25,
  };
};

const USAGES = [
  ['le chauffage', 'Un radiateur'],
  ['les transports', 'Une voiture'],
  ['la production d’électricité', 'Une éolienne'],
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    return {
      prompt: 'Associe chaque usage de l’énergie à un exemple.',
      answer: association(
        rng,
        USAGES.map(([u, e]) => [u, e] as const),
      ),
      hint: 'Pense à ce que fait chaque objet : chauffer, déplacer ou fabriquer du courant.',
      steps: [
        'L’énergie sert à se chauffer, à se déplacer et à produire de l’électricité.',
        'On relie chaque usage à l’objet qui le montre.',
        'Chaque usage est relié à **son** exemple.',
      ],
      targetSeconds: 40,
    };
  }
  // La chaîne complète (turbine) a deux conversions vraies : on ne la propose qu'au niveau 1, où le départ est donné.
  const c = rng.pick(CONVERSIONS.slice(0, 4));
  const bonne = texteConv(c);
  const { answer, traps } = choice(
    rng,
    bonne,
    TOUTES.filter((x) => x !== bonne).map((x) => ({ label: x, why: `Ce n’est pas la bonne conversion : ${c.phrase}` })),
  );
  return {
    prompt: `${c.scene} Quelle conversion d’énergie a lieu ?`,
    answer,
    traps,
    hint: 'Cherche d’où part l’énergie (haut, mouvement…) et où elle arrive.',
    steps: ['Une conversion se lit « départ → arrivée ».', c.phrase, `Conversion : **${bonne}**.`],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    return {
      prompt: 'Complète la phrase du programme.',
      answer: {
        kind: 'cloze',
        parts: ['Au cours de la chute d’un objet, son énergie de ', ' est convertie en énergie ', '.'],
        blanks: [
          { mode: 'list', options: ['pesanteur', 'cinétique', 'électrique'], correct: 0 },
          { mode: 'list', options: ['pesanteur', 'cinétique', 'électrique'], correct: 1 },
        ],
      },
      hint: 'Pendant une chute, l’objet perd de l’altitude et gagne du mouvement.',
      steps: [
        'Au départ, l’objet est haut : énergie de pesanteur.',
        'À l’arrivée, il bouge vite : énergie cinétique.',
        'L’énergie de **pesanteur** est convertie en énergie **cinétique**.',
      ],
      targetSeconds: 30,
    };
  }
  if (t === 1) {
    const juste = [
      'Le vent fait tourner les pales d’une éolienne',
      'L’éolienne produit de l’électricité',
      'Le courant circule dans les fils',
      'Une lampe s’allume dans la maison',
    ];
    return {
      prompt: 'Du vent jusqu’à la lampe, remets la chaîne d’énergie dans l’ordre.',
      answer: ordre(rng, juste),
      hint: 'Pars du vent et finis par la lampe.',
      steps: ['On suit l’énergie, étape par étape.', `Ordre : **${juste.join(' → ')}**.`],
      targetSeconds: 40,
    };
  }
  const monte = rng.int(0, 1) === 0;
  const { answer, traps } = saisie(
    monte
      ? ['cinétique', 'énergie cinétique', 'cinetique', 'energie cinetique', 'l’énergie cinétique']
      : ['électrique', 'énergie électrique', 'electrique', 'energie electrique', 'l’énergie électrique'],
    [
      [
        monte ? 'électrique' : 'cinétique',
        'Relis la scène : cherche si l’énergie finale est du mouvement ou du courant.',
      ],
      [
        'pesanteur',
        'L’énergie de pesanteur dépend de l’altitude : ici on cherche la forme d’énergie obtenue à la fin de la scène.',
      ],
    ],
  );
  return {
    prompt: monte
      ? 'Un enfant glisse sur un toboggan. À la fin, il va vite. Quelle forme d’énergie a-t-il gagnée ? Écris son nom (un mot suffit).'
      : 'Une éolienne tourne et un câble emporte le courant. Quelle forme d’énergie sort de l’éolienne ? Écris son nom (un mot suffit).',
    answer,
    traps,
    hint: monte ? 'Il va vite : c’est lié au mouvement.' : 'Le courant circule dans le câble.',
    steps: [
      'On regarde la forme d’énergie à la fin de la scène.',
      monte ? 'L’enfant bouge vite.' : 'Du courant circule dans le câble.',
      `Forme d’énergie : **${monte ? 'cinétique' : 'électrique'}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const { answer, traps } = saisie(
      ['électrique', 'énergie électrique', 'electrique', 'energie electrique', 'l’énergie électrique'],
      [
        [
          'cinétique',
          'Le mouvement de la turbine est la forme du milieu : à la sortie, du courant circule dans les fils.',
        ],
        [
          'pesanteur',
          'L’énergie de pesanteur est celle du départ, quand l’eau est en haut : pas celle produite pour la maison.',
        ],
      ],
    );
    return {
      prompt:
        'Dans une centrale hydro-électrique, l’eau dévale un tuyau et fait tourner une turbine. Quelle forme d’énergie est produite pour la maison ? Écris-la en un mot.',
      answer,
      traps,
      hint: 'Pour la maison, il faut du courant dans les fils.',
      steps: [
        'L’eau en haut a de l’énergie de pesanteur, puis de l’énergie cinétique en dévalant.',
        'La turbine convertit ce mouvement en courant.',
        'L’énergie produite est l’énergie **électrique**.',
      ],
      targetSeconds: 35,
    };
  }
  const monte = t === 1;
  const { answer, traps } = saisie(monte ? ['diminue'] : ['augmente'], [
    [
      monte ? 'augmente' : 'diminue',
      monte
        ? 'Regarde l’altitude : elle baisse quand l’objet tombe, et c’est elle qui décide de l’énergie de pesanteur.'
        : 'Regarde la vitesse : la bille va de plus en plus vite, donc son énergie cinétique augmente.',
    ],
  ]);
  return {
    prompt: monte
      ? 'Une bille tombe du haut d’une table : pendant la chute, son énergie de pesanteur augmente ou diminue ?'
      : 'Une bille tombe du haut d’une table : pendant la chute, son énergie cinétique augmente ou diminue ?',
    answer,
    traps,
    hint: monte ? 'L’altitude de la bille baisse.' : 'La bille va de plus en plus vite.',
    steps: [
      monte ? 'L’énergie de pesanteur dépend de l’altitude.' : 'L’énergie cinétique est liée au mouvement.',
      monte ? 'La bille perd de l’altitude.' : 'La bille prend de la vitesse : elle bouge de plus en plus.',
      `Elle **${monte ? 'diminue' : 'augmente'}**.`,
    ],
    targetSeconds: 35,
  };
};

const DOCS: readonly { titre: string; lignes: readonly string[]; q: string; bonne: string; why: string }[] = [
  {
    titre: 'Un moulin à eau',
    lignes: [
      'Un ruisseau descend d’une colline et tombe sur la roue d’un vieux moulin.',
      'La roue tourne et fait avancer la meule qui écrase le blé.',
    ],
    q: 'Quelle conversion d’énergie fait tourner la roue ?',
    bonne: 'énergie de pesanteur → énergie cinétique',
    why: 'L’eau perd de l’altitude en tombant et fait bouger la roue.',
  },
  {
    titre: 'Une éolienne',
    lignes: [
      'Dans la plaine, le vent fait tourner les pales d’une éolienne.',
      'Un câble emporte le courant jusqu’au village.',
    ],
    q: 'Quelle conversion d’énergie a lieu dans l’éolienne ?',
    bonne: 'énergie cinétique → énergie électrique',
    why: 'Le mouvement des pales est converti en courant.',
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const juste = ['énergie de pesanteur', 'énergie cinétique', 'énergie électrique'];
    return {
      prompt: 'Lis le texte. Remets dans l’ordre les formes d’énergie, de l’eau du lac à la lampe.',
      figure: {
        kind: 'document',
        title: 'De l’eau du lac à la lampe',
        lines: [
          'L’eau d’un lac est retenue en haut d’un barrage.',
          'Elle dévale un tuyau et fait tourner une turbine.',
          'Le courant produit voyage dans les fils jusqu’à une lampe.',
        ],
      },
      answer: ordre(rng, juste),
      hint: 'Haut, mouvement, courant.',
      steps: [
        'L’eau en haut : énergie de pesanteur. Elle bouge dans le tuyau : énergie cinétique.',
        'La turbine produit du courant : énergie électrique.',
        `Ordre : **${juste.join(' → ')}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const d = rng.pick(DOCS);
  const { answer, traps } = choice(
    rng,
    d.bonne,
    TOUTES.filter((x) => x !== d.bonne).map((x) => ({ label: x, why: `Ce n’est pas la bonne conversion : ${d.why}` })),
  );
  return {
    prompt: `Lis le texte. ${d.q}`,
    figure: { kind: 'document', title: d.titre, lines: d.lignes },
    answer,
    traps,
    hint: 'Une conversion se lit « départ → arrivée » : cherche ce qui bouge et ce qui est produit.',
    steps: ['On repère la forme d’énergie au départ, puis à l’arrivée.', d.why, `Conversion : **${d.bonne}**.`],
    targetSeconds: 45,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const energieQuotidien: Skill = {
  id: 'pcm1-energie-quotidien',
  title: 'L’énergie dans la vie quotidienne',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’énergie sert à se chauffer, à se déplacer et à produire de l’électricité. Elle change souvent de forme : c’est une **conversion d’énergie**.',
      'Quand un objet tombe, son énergie de pesanteur est convertie en énergie cinétique. Une éolienne convertit le mouvement de ses pales en énergie électrique.',
    ],
    source: `${PROGRAMME} : « au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique » ; « conversion d’énergie potentielle en énergie cinétique dans un dispositif mécanique (moulin à eau par exemple) » ; « (chauffage, moyens de transport, production d’électricité, etc.) » ; « Réaliser expérimentalement un dispositif de conversion d’énergie ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
