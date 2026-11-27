import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Représenter un dispositif par une chaîne d'énergie (programme : « fin de sixième ») ———

type Forme = 'pesanteur' | 'cinetique' | 'chimique' | 'electrique' | 'lumineuse';
const NOM: Record<Forme, string> = {
  pesanteur: 'énergie de pesanteur',
  cinetique: 'énergie cinétique',
  chimique: 'énergie chimique',
  electrique: 'énergie électrique',
  lumineuse: 'énergie lumineuse',
};
const ADJ: Record<Forme, readonly [string, string]> = {
  pesanteur: ['de pesanteur', 'pesanteur'],
  cinetique: ['cinétique', 'cinetique'],
  chimique: ['chimique', 'chimique'],
  electrique: ['électrique', 'electrique'],
  lumineuse: ['lumineuse', 'lumineuse'],
};
const variantes = (f: Forme) => {
  const [a, b] = ADJ[f];
  const noms = [NOM[f], `énergie ${b}`, `energie ${a}`, `energie ${b}`];
  return [...new Set([a, b, ...noms, ...noms.map((n) => `l’${n}`)])];
};

interface Montage {
  readonly titre: string;
  readonly situation: string;
  readonly depart: Forme;
  readonly arrivee: Forme;
  /** Étapes de la chaîne, dans l'ordre. */
  readonly chaine: readonly string[];
  readonly why: string;
}

const MONTAGES: readonly Montage[] = [
  {
    titre: 'd’une petite voiture à pile',
    situation: 'Une pile alimente le moteur d’une petite voiture, qui avance.',
    depart: 'chimique',
    arrivee: 'cinetique',
    chaine: [
      'la pile : énergie chimique',
      'les fils : énergie électrique',
      'le moteur',
      'la voiture : énergie cinétique',
    ],
    why: 'La pile fournit de l’énergie électrique à partir de l’énergie chimique ; le moteur produit du mouvement.',
  },
  {
    titre: 'd’une lampe à pile',
    situation: 'Une pile alimente la lampe d’une lampe de poche, qui éclaire.',
    depart: 'chimique',
    arrivee: 'lumineuse',
    chaine: ['la pile : énergie chimique', 'les fils : énergie électrique', 'la lampe', 'la pièce : énergie lumineuse'],
    why: 'La pile fournit de l’énergie électrique ; la lampe la convertit en lumière.',
  },
  {
    titre: 'de la chute d’une pomme',
    situation: 'Une pomme tombe de l’arbre et prend de la vitesse jusqu’à toucher presque le sol.',
    depart: 'pesanteur',
    arrivee: 'cinetique',
    chaine: [
      'la pomme sur la branche : énergie de pesanteur',
      'la chute',
      'la pomme qui tombe vite : énergie cinétique',
    ],
    why: 'Pendant la chute, l’énergie de pesanteur est convertie en énergie cinétique.',
  },
];
const FORMES = Object.keys(NOM) as Forme[];
const autres = (f: Forme) => FORMES.filter((x) => x !== f);

const niveau1 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MONTAGES);
  const bon = NOM[m.arrivee];
  const faux = rng
    .shuffle(autres(m.arrivee).filter((f) => f !== 'electrique'))
    .slice(0, 2)
    .map((f) => ({ label: NOM[f], why: `${maj(NOM[f])} n’est pas ce que l’on obtient à la fin. ${m.why}` }));
  const { answer, traps: tr } = choice(rng, bon, faux);
  return {
    prompt: `${m.situation} Quelle forme d’énergie obtient-on à la fin ?`,
    answer,
    traps: tr,
    hint: 'Observe l’effet : de la lumière, ou un mouvement ?',
    steps: ['On regarde le bout de la chaîne.', m.why, `Réponse : **${bon}**.`],
    targetSeconds: 25,
  };
};

const STOCKABLES: readonly Forme[] = ['pesanteur', 'cinetique', 'chimique'];
const TRANSFERTS: readonly Forme[] = ['electrique', 'lumineuse'];

const niveau2 = (rng: Rng): QuestionDraft => {
  const transfert = rng.int(0, 1) === 0;
  const bon = rng.pick(transfert ? TRANSFERTS : STOCKABLES);
  // Une seule bonne réponse : toutes les autres propositions sont de l'autre famille.
  const faux = (transfert ? STOCKABLES : TRANSFERTS).map((f) => ({
    label: NOM[f],
    why: `${maj(NOM[f])} : ${transfert ? 'elle peut être stockée' : 'c’est un transfert d’énergie'}.`,
  }));
  const { answer, traps: tr } = choice(rng, NOM[bon], faux);
  return {
    prompt: transfert
      ? 'Laquelle de ces énergies correspond à un transfert d’énergie ?'
      : 'Laquelle de ces énergies peut être stockée ?',
    answer,
    traps: tr,
    hint: 'Une énergie de transfert passe d’un objet à un autre, par un fil ou par la lumière.',
    steps: [
      'On sépare les énergies stockées et les transferts.',
      transfert
        ? 'Les énergies électrique et lumineuse correspondent à des transferts.'
        : 'Les énergies de pesanteur, cinétique et chimique peuvent être stockées.',
      `Réponse : **${NOM[bon]}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const m = rng.pick(MONTAGES);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Remets dans l’ordre la chaîne d’énergie ${m.titre}.`,
      answer: ordre(rng, m.chaine),
      hint: 'Pars de l’énergie du début, avant que quelque chose se produise.',
      steps: [m.why, `Ordre : **${m.chaine.join(' → ')}**.`],
      targetSeconds: 50,
    };
  }
  const options = FORMES.map((f) => NOM[f]);
  return {
    prompt: `${m.situation} Complète la conversion, du début à la fin.`,
    answer: {
      kind: 'cloze',
      parts: ['Au début : ', '. À la fin : ', '.'],
      blanks: [
        { mode: 'list', options, correct: FORMES.indexOf(m.depart) },
        { mode: 'list', options, correct: FORMES.indexOf(m.arrivee) },
      ],
    },
    hint: 'Le premier trou décrit la réserve de départ, le second l’effet obtenu.',
    steps: [m.why, `**Début : ${NOM[m.depart]} ; fin : ${NOM[m.arrivee]}**.`],
    targetSeconds: 40,
  };
};

const ROLES: readonly (readonly [string, string])[] = [
  ['la pile', 'fournit de l’énergie électrique à partir de l’énergie chimique'],
  ['la photopile', 'produit de l’électricité à partir de l’énergie du Soleil'],
  ['le moteur', 'produit un mouvement'],
  ['la lampe', 'donne de la lumière'],
  ['la pomme sur la branche', 'a de l’énergie de pesanteur'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    return {
      prompt: 'Relie chaque élément à son rôle dans une chaîne d’énergie.',
      answer: association(rng, ROLES),
      hint: 'Commence par les deux objets qui fournissent de l’électricité.',
      steps: [
        'La pile part de l’énergie chimique, la photopile de l’énergie du Soleil.',
        'Chaque élément est relié à **son** rôle.',
      ],
      targetSeconds: 60,
    };
  }
  const m = rng.pick(MONTAGES);
  const debut = rng.int(0, 1) === 0;
  const bon = debut ? m.depart : m.arrivee;
  const { answer, traps: tr } = saisie(
    variantes(bon),
    autres(bon).flatMap((f) =>
      variantes(f).map((v) => [v, `${maj(NOM[f])} ? Non. Relis le montage : ${m.why}`] as const),
    ),
  );
  return {
    prompt: `${m.situation} Quelle forme d’énergie y a-t-il ${debut ? 'au départ' : 'à la fin'} ? Écris son nom.`,
    answer,
    traps: tr,
    hint: debut ? 'Qu’est-ce qui est stocké avant que l’effet commence ?' : 'Qu’observe-t-on au bout de la chaîne ?',
    steps: [m.why, `C’est l’**${NOM[bon]}**.`],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const piles = rng.int(2, 3);
  const lampes = rng.int(1, 2);
  const figure = {
    kind: 'document' as const,
    title: 'La maquette du robot jouet',
    lines: [
      `Le robot jouet contient ${piles} piles.`,
      'Les piles alimentent un moteur qui fait tourner les roues.',
      `Les piles alimentent aussi ${lampes === 1 ? 'une lampe' : 'deux lampes'} sur sa tête.`,
      `Quand le robot roule, ${lampes === 1 ? 'la lampe brille' : 'les lampes brillent'}.`,
    ],
  };
  const t = rng.int(0, 2);
  if (t === 0) {
    const n = 1 + lampes;
    return {
      prompt: 'Lis la description. Combien d’appareils reçoivent l’énergie électrique des piles ?',
      figure,
      answer: num(n),
      traps: traps(r(n), [
        [1, 'Le moteur n’est pas seul : les piles alimentent aussi l’éclairage.'],
        [n + piles, 'Tu as compté les piles : elles envoient l’énergie, elles ne la reçoivent pas.'],
      ]),
      hint: 'Cherche tout ce que les piles alimentent.',
      steps: [
        'Les piles alimentent le moteur.',
        `Elles alimentent aussi ${lampes === 1 ? 'la lampe' : 'les deux lampes'}.`,
        `Il y a **${n}** appareils.`,
      ],
      targetSeconds: 60,
    };
  }
  if (t === 1) {
    const chaine = [
      'les piles : énergie chimique',
      'les fils : énergie électrique',
      'le moteur',
      'les roues : énergie cinétique',
    ];
    return {
      prompt: 'Lis la description. Range les étapes de la chaîne d’énergie des roues.',
      figure,
      answer: ordre(rng, chaine),
      hint: 'Commence par la réserve d’énergie du robot.',
      steps: [
        'La réserve est dans les piles ; l’électricité circule vers le moteur.',
        `Ordre : **${chaine.join(' → ')}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const { answer, traps: tr } = saisie(variantes('electrique'), [
    ...variantes('chimique').map((v) => [v, 'L’énergie chimique reste dans les piles : elle est stockée.'] as const),
    ...variantes('lumineuse').map(
      (v) => [v, 'La lumière sort de la lampe, elle ne circule pas dans les fils.'] as const,
    ),
    ...variantes('cinetique').map(
      (v) => [v, 'L’énergie cinétique est celle du mouvement, à la sortie du moteur.'] as const,
    ),
  ]);
  return {
    prompt:
      'Lis la description. Quelle forme d’énergie est transférée par les fils, des piles vers le moteur ? Écris son nom.',
    figure,
    answer,
    traps: tr,
    hint: 'Cette énergie correspond à un transfert, le long des fils.',
    steps: ['Les piles envoient de l’énergie dans les fils.', 'C’est l’**énergie électrique**.'],
    targetSeconds: 45,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const chaineEnergie: Skill = {
  id: 'p6-chaine-energie',
  title: 'La chaîne d’énergie',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **chaîne d’énergie** montre, dans l’ordre, d’où vient l’énergie et ce qu’elle devient : pile (**énergie chimique**) → fils (énergie électrique) → moteur → roues (énergie cinétique).',
      'On distingue l’énergie qui peut être stockée (chimique, pesanteur, cinétique) des **transferts d’énergie** (électrique, lumineuse). Cherche le départ, puis l’arrivée !',
    ],
    source: `${PROGRAMME} : « en rendre compte par la représentation d’une chaîne énergétique » ; « distinguer les énergies qui peuvent être stockées (énergies de pesanteur, cinétique, chimique, nucléaire et thermique) de celles qui correspondent à des transferts énergétiques (énergies électrique et lumineuse) » ; « conversion d’énergie chimique en énergie cinétique dans un dispositif constitué d’un moteur alimenté par une pile électrique » ; « transfert d’énergie électrique vers une lampe » ; « au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique ». Académie française : pile, « fournit de l’énergie électrique à partir de l’énergie chimique » ; récepteur, « convertissent l’énergie électrique […] en une autre forme d’énergie, lumineuse, thermique, mécanique ou chimique » ; photopile, « produire de l’électricité à partir de l’énergie solaire » ; moteur, « produire de l’énergie mécanique, du mouvement ».`,
    sources: [PROGRAMME, 'academie-pile', 'academie-recepteur', 'academie-photopile', 'academie-moteur'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
