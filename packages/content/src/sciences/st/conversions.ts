import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, ordre, saisie } from './outils.ts';

// ——— Conversions d'énergie : dispositifs réalisables en classe, formes du cours moyen ———

type Forme = 'pesanteur' | 'cinetique' | 'electrique';
const NOM: Record<Forme, string> = {
  pesanteur: 'énergie de pesanteur',
  cinetique: 'énergie cinétique',
  electrique: 'énergie électrique',
};
const ADJ: Record<Forme, readonly string[]> = {
  pesanteur: ['pesanteur', 'de pesanteur', 'énergie de pesanteur', 'l’énergie de pesanteur'],
  cinetique: ['cinétique', 'cinetique', 'énergie cinétique', 'l’énergie cinétique'],
  electrique: ['électrique', 'electrique', 'énergie électrique', 'l’énergie électrique'],
};
const INDICE: Record<Forme, string> = {
  pesanteur: 'elle dépend de l’altitude',
  cinetique: 'elle est liée au mouvement',
  electrique: 'c’est celle du courant qui circule dans les fils',
};
const FORMES = Object.keys(NOM) as Forme[];

interface Dispositif {
  readonly texte: string;
  readonly de: Forme;
  readonly vers: Forme;
  readonly why: string;
}

const DISPOSITIFS: readonly Dispositif[] = [
  {
    texte: 'On lâche une bille en haut d’une rampe en carton.',
    de: 'pesanteur',
    vers: 'cinetique',
    why: 'La bille perd de l’altitude et se met à rouler de plus en plus vite.',
  },
  {
    texte: 'On verse de l’eau de haut sur une petite roue à pales : la roue tourne.',
    de: 'pesanteur',
    vers: 'cinetique',
    why: 'L’eau tombe, perd de l’altitude et met la roue en mouvement.',
  },
  {
    texte: 'On souffle sur l’hélice d’une maquette reliée à un petit générateur : un courant apparaît.',
    de: 'cinetique',
    vers: 'electrique',
    why: 'Le mouvement de l’hélice sert à produire un courant électrique.',
  },
  {
    texte: 'On tourne la manivelle d’une lampe dynamo : un courant circule vers l’ampoule.',
    de: 'cinetique',
    vers: 'electrique',
    why: 'Le mouvement de la manivelle sert à produire un courant électrique.',
  },
];

const conv = (a: Forme, b: Forme) => `${NOM[a]} → ${NOM[b]}`;
const CONVERSIONS = [
  conv('pesanteur', 'cinetique'),
  conv('cinetique', 'electrique'),
  conv('electrique', 'pesanteur'),
  conv('cinetique', 'pesanteur'),
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DISPOSITIFS);
  const { answer, traps } = choice(
    rng,
    NOM[d.vers],
    FORMES.filter((f) => f !== d.vers).map((f) => ({ label: NOM[f], why: `Pense à la fin de l’expérience. ${d.why}` })),
  );
  return {
    prompt: `Expérience : ${d.texte} Quelle énergie obtient-on grâce à ce montage ?`,
    answer,
    traps,
    hint: 'Regarde ce qui se passe à la fin : ça bouge, ou un courant circule ?',
    steps: ['On observe la fin de l’expérience.', d.why, `On obtient de l’**${NOM[d.vers]}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const vues: readonly (readonly [string, string, Forme])[] = [
      rng.pick([
        ['pot de fleurs', 'Un pot de fleurs posé immobile sur un balcon.', 'pesanteur'],
        ['sac', 'Un sac accroché immobile en haut d’un mât.', 'pesanteur'],
      ] as const),
      rng.pick([
        ['toupie', 'Une toupie qui tourne sur la table.', 'cinetique'],
        ['chariot', 'Un chariot qui roule sur le sol plat.', 'cinetique'],
      ] as const),
      rng.pick([
        ['lampe', 'Le courant dans le fil d’une lampe.', 'electrique'],
        ['ville', 'Le courant dans les câbles d’une ville.', 'electrique'],
      ] as const),
    ];
    const noms = vues.map((v) => v[0]).sort();
    const trio = vues.map((v) => [v[1], NOM[v[2]]] as const);
    return {
      prompt: `Associe chaque observation à une forme d’énergie : ${noms.join(', ')}.`,
      answer: association(rng, trio),
      hint: 'Trois indices : la hauteur, le mouvement, le courant.',
      steps: [
        'Hauteur : énergie de pesanteur. Mouvement : énergie cinétique. Courant : énergie électrique.',
        'Chaque observation est reliée à **sa** forme.',
      ],
      targetSeconds: 45,
    };
  }
  const d = rng.pick(DISPOSITIFS);
  const bon = conv(d.de, d.vers);
  const { answer, traps } = choice(
    rng,
    bon,
    CONVERSIONS.filter((c) => c !== bon).map((label) => ({ label, why: `Relis le début puis la fin. ${d.why}` })),
  );
  return {
    prompt: `Expérience : ${d.texte} Quelle conversion d’énergie a lieu ?`,
    answer,
    traps,
    hint: 'La flèche va de l’énergie du début vers l’énergie de la fin.',
    steps: ['Une conversion se lit « départ → arrivée ».', d.why, `Conversion : **${bon}**.`],
    targetSeconds: 35,
  };
};

const CHAINES: readonly { titre: string; etapes: readonly string[]; why: string }[] = [
  {
    titre: 'la centrale hydro-électrique',
    etapes: [
      'L’eau est retenue en hauteur',
      'L’eau descend dans un tuyau',
      'La turbine tourne',
      'Un courant part dans les fils',
    ],
    why: 'On part de l’eau en hauteur et on finit par le courant.',
  },
  {
    titre: 'la lampe à manivelle',
    etapes: [
      'La main tourne la manivelle',
      'La dynamo tourne',
      'Un courant circule dans les fils',
      'L’ampoule s’allume',
    ],
    why: 'On part de la main et on finit par la lumière.',
  },
  {
    titre: 'la maquette d’éolienne',
    etapes: [
      'Le ventilateur souffle de l’air',
      'L’hélice de la maquette tourne',
      'Le générateur produit un courant',
      'Le voyant s’allume',
    ],
    why: 'On part du souffle et on finit par le voyant.',
  },
];

const niveau3 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const c = rng.pick(CHAINES);
    return {
      prompt: `Remets dans l’ordre ce qui se passe dans ${c.titre}.`,
      answer: ordre(rng, c.etapes),
      hint: 'Cherche l’étape qui déclenche toutes les autres.',
      steps: [c.why, `Ordre : **${c.etapes.join(' → ')}**.`],
      targetSeconds: 45,
    };
  }
  const d = rng.pick(DISPOSITIFS);
  const options = FORMES.map((f) => NOM[f]);
  return {
    prompt: `Expérience : ${d.texte} Complète la conversion.`,
    answer: {
      kind: 'cloze',
      parts: ['De l’', ' est convertie en ', '.'],
      blanks: [
        { mode: 'list', options, correct: FORMES.indexOf(d.de) },
        { mode: 'list', options, correct: FORMES.indexOf(d.vers) },
      ],
    },
    hint: 'Premier trou : le début de l’expérience. Second trou : la fin.',
    steps: ['On repère l’énergie du début, puis celle de la fin.', d.why, `**${conv(d.de, d.vers)}**.`],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const d = rng.pick(DISPOSITIFS);
  const entree = rng.int(0, 1) === 0;
  const bon = entree ? d.de : d.vers;
  const { answer, traps } = saisie(
    ADJ[bon],
    FORMES.filter((f) => f !== bon).map(
      (f) => [ADJ[f][0] ?? '', `L’${NOM[f]} ? Non : ${INDICE[f]}. Regarde bien ce montage. ${d.why}`] as const,
    ),
  );
  return {
    prompt: `${d.texte} Quelle forme d’énergie ${entree ? 'entre dans ce montage (au départ)' : 'sort de ce montage (à la fin)'} ? Écris son nom.`,
    answer,
    traps,
    hint: entree ? 'Observe la situation avant que l’effet se produise.' : 'Observe l’effet obtenu.',
    steps: [`On regarde ${entree ? 'le début' : 'la fin'} de l’expérience.`, d.why, `C’est l’**${NOM[bon]}**.`],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const haut = rng.pick([80, 100, 120]);
  const bas = rng.pick([20, 30, 40]);
  const figure = {
    kind: 'document' as const,
    title: 'Notre maquette de barrage',
    lines: [
      'Nous posons une bouteille pleine d’eau en hauteur.',
      'L’eau sort par un tuyau et tombe sur les pales d’une roue.',
      'La roue tourne et entraîne un petit générateur.',
      'Un voyant relié au générateur s’allume.',
      `Essai 1 : bouteille à ${haut} cm du sol. Essai 2 : bouteille à ${bas} cm du sol.`,
      'La roue reste au même endroit pendant les deux essais.',
    ],
  };
  const t = rng.int(0, 2);
  if (t === 0) {
    const juste = [NOM.pesanteur, NOM.cinetique, NOM.electrique];
    return {
      prompt: 'Lis le compte rendu. Range les formes d’énergie dans l’ordre, du début à la fin.',
      figure,
      answer: ordre(rng, juste),
      hint: 'Regarde d’abord l’eau immobile en haut, puis ce qui bouge, puis le voyant.',
      steps: [
        'L’eau en hauteur : énergie de pesanteur. La roue qui tourne : énergie cinétique.',
        'Le générateur produit un courant : énergie électrique.',
        `Ordre : **${juste.join(' → ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const bon = `à l’essai 1, à ${haut} cm`;
    const { answer, traps } = choice(rng, bon, [
      {
        label: `à l’essai 2, à ${bas} cm`,
        why: 'L’énergie de pesanteur dépend de l’altitude : plus bas, il y en a moins.',
      },
      {
        label: 'c’est pareil aux deux essais',
        why: 'La hauteur change entre les essais, donc l’énergie de pesanteur change.',
      },
    ]);
    return {
      prompt: 'Lis le compte rendu. Quand l’eau de la bouteille a-t-elle le plus d’énergie de pesanteur ?',
      figure,
      answer,
      traps,
      hint: 'L’énergie de pesanteur dépend de l’altitude.',
      steps: ['On compare les deux hauteurs.', `${haut} cm est plus haut que ${bas} cm.`, `Réponse : **${bon}**.`],
      targetSeconds: 50,
    };
  }
  const { answer, traps } = saisie(ADJ.cinetique, [
    ['pesanteur', 'L’énergie de pesanteur est celle de l’eau en hauteur, au début.'],
    ['électrique', 'L’énergie électrique apparaît après, grâce au générateur.'],
  ]);
  return {
    prompt: 'Lis le compte rendu. Quelle forme d’énergie a la roue pendant qu’elle tourne ? Écris son nom.',
    figure,
    answer,
    traps,
    hint: 'La roue bouge : à quelle forme est lié le mouvement ?',
    steps: [
      'La roue est en mouvement.',
      'L’énergie cinétique est liée au mouvement.',
      'C’est l’**énergie cinétique**.',
    ],
    targetSeconds: 45,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const conversions: Skill = {
  id: 'pcm2-conversions-energie',
  title: 'Les conversions d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **conversion d’énergie**, c’est le passage d’une forme à une autre. Quand une bille tombe, son **énergie de pesanteur** devient de l’**énergie cinétique**.',
      'Une éolienne ou une centrale hydro-électrique produit de l’**énergie électrique** à partir d’un mouvement. Cherche toujours le départ, puis l’arrivée !',
    ],
    source: `${PROGRAMME} : « Réaliser expérimentalement un dispositif de conversion d’énergie » ; « Identifier les formes d’énergie mises en jeu dans un dispositif de conversion d’énergie » ; « énergie de pesanteur (dépendant de l’altitude sur Terre), énergie cinétique (liée au mouvement) et énergie électrique, par exemple dans le contexte de la production d’électricité par une centrale hydro-électrique ou une éolienne » ; « au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique ».`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
