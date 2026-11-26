import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { Figure, QuestionDraft, Skill } from '../types.ts';
import { referencesMouvement } from './donnees-mouvement.ts';

// ——— Trajectoire : la ligne décrite, rectiligne, circulaire ou autre courbe, selon le référentiel (5e) ———

type Forme = 'rectiligne' | 'circulaire' | 'autre';
const NOM: Record<Forme, string> = {
  rectiligne: 'rectiligne',
  circulaire: 'circulaire',
  autre: 'une autre courbe (ni droite ni cercle)',
};
const FORMES = Object.keys(NOM) as Forme[];
const WHY_FORME: Record<Forme, string> = {
  rectiligne: 'Rectiligne veut dire en ligne droite : les positions seraient alignées.',
  circulaire: 'Circulaire veut dire en cercle : toutes les positions seraient à la même distance d’un même centre.',
  autre: 'Les positions forment ici une figure plus simple : une droite ou un cercle.',
};

type Point = readonly [number, number];
/** Points à coordonnées entières d'un cercle de rayon 5, dans l'ordre du parcours. */
const CERCLE: readonly Point[] = [
  [5, 0],
  [4, 3],
  [3, 4],
  [0, 5],
  [-3, 4],
  [-4, 3],
  [-5, 0],
  [-4, -3],
  [-3, -4],
  [0, -5],
  [3, -4],
  [4, -3],
];

const positions = (rng: Rng, forme: Forme): Point[] => {
  if (forme === 'rectiligne') {
    const [dx, dy] = rng.pick<Point>([
      [2, 0],
      [0, 2],
      [2, 1],
      [2, -1],
      [1, 2],
      [2, 2],
    ]);
    return Array.from({ length: 6 }, (_, i) => [i * dx, i * dy]);
  }
  if (forme === 'circulaire') {
    const debut = rng.int(0, CERCLE.length - 1);
    const sens = rng.pick([1, -1]);
    return Array.from(
      { length: 10 },
      (_, i) => CERCLE[(debut + sens * i + 2 * CERCLE.length) % CERCLE.length] ?? [0, 0],
    );
  }
  const h = rng.pick([2, 3, 4]);
  const miroir = rng.pick([1, -1]);
  return [0, 1, 0, -1, 0, 1, 0].map((y, i) => [2 * i, miroir * y * h]);
};

const schema = (pts: readonly Point[]): Figure => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return {
    kind: 'grid',
    xMin: Math.min(...xs) - 1,
    xMax: Math.max(...xs) + 1,
    yMin: Math.min(...ys) - 1,
    yMax: Math.max(...ys) + 1,
    axes: false,
    points: pts.map(([x, y], i) => ({ name: String(i + 1), x, y })),
  };
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const forme = rng.pick(FORMES);
  const { answer, traps } = choice(
    rng,
    NOM[forme],
    FORMES.filter((f) => f !== forme).map((f) => ({ label: NOM[f], why: WHY_FORME[f] })),
  );
  return {
    prompt:
      'Le schéma montre les positions successives (1, 2, 3…) d’un point en mouvement. Comment est sa trajectoire ?',
    figure: schema(positions(rng, forme)),
    answer,
    traps,
    hint: 'Relie les positions dans l’ordre des numéros : quel trait obtiens-tu ?',
    steps: [
      'La trajectoire est la ligne décrite par le point : on relie ses positions dans l’ordre.',
      forme === 'rectiligne'
        ? 'Les positions sont alignées.'
        : forme === 'circulaire'
          ? 'Les positions sont placées sur un même cercle.'
          : 'La ligne ondule : elle n’est ni droite ni en cercle.',
      `La trajectoire est **${NOM[forme]}**.`,
    ],
    targetSeconds: 25,
  };
};

interface Scene {
  /** Description complète : objet observé et référentiel. */
  readonly texte: string;
  readonly forme: Forme;
  readonly why: string;
}

const SCENES: readonly Scene[] = [
  {
    texte: 'la cabine d’un ascenseur, par rapport à l’immeuble',
    forme: 'rectiligne',
    why: 'La cabine monte ou descend sans dévier : sa trajectoire est une droite.',
  },
  {
    texte: 'une bille lâchée sans vitesse, à l’abri du vent, par rapport au sol',
    forme: 'rectiligne',
    why: 'La bille tombe à la verticale : sa trajectoire est une droite.',
  },
  {
    texte: 'le bout de la grande aiguille d’une horloge, par rapport au cadran',
    forme: 'circulaire',
    why: 'Le bout de l’aiguille reste à la même distance du centre : il décrit un cercle.',
  },
  {
    texte: 'un siège de manège qui tourne à plat, par rapport au sol',
    forme: 'circulaire',
    why: 'Le siège tourne autour de l’axe du manège : il décrit un cercle.',
  },
  {
    texte: 'un skieur qui slalome entre des piquets, par rapport à la piste',
    forme: 'autre',
    why: 'Le skieur tourne d’un côté puis de l’autre : la ligne ondule.',
  },
  {
    texte: 'une voiture sur une route de montagne en lacets, par rapport à la route',
    forme: 'autre',
    why: 'La voiture enchaîne des virages dans les deux sens : ni droite ni cercle.',
  },
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const bon = 'la ligne décrite par un objet au cours de son mouvement';
    const { answer, traps } = choice(rng, bon, [
      {
        label: 'la distance parcourue en une seconde',
        why: 'Une distance par unité de temps renseigne sur la vitesse.',
      },
      { label: 'le temps mis pour aller d’un point à un autre', why: 'C’est la durée du déplacement, pas une ligne.' },
      {
        label: 'l’objet par rapport auquel on observe le mouvement',
        why: 'Ce point de repère sert de référentiel : ce n’est pas la ligne décrite.',
      },
    ]);
    return {
      prompt: 'Qu’appelle-t-on la trajectoire d’un objet ?',
      answer,
      traps,
      hint: 'Pense à la trace que laisserait l’objet en se déplaçant.',
      steps: ['La trajectoire est un tracé, pas une durée ni une distance par seconde.', `C’est **${bon}**.`],
      targetSeconds: 30,
    };
  }
  const trio = FORMES.map((f) => rng.pick(SCENES.filter((s) => s.forme === f)));
  return {
    prompt: `Associe chaque situation à la forme de sa trajectoire : ${trio
      .map((s) => s.texte.split(',')[0] ?? '')
      .sort()
      .join(' ; ')}.`,
    answer: association(
      rng,
      trio.map((s) => [s.texte, NOM[s.forme]] as const),
    ),
    hint: 'Imagine la trace laissée par chaque objet, vue depuis la référence indiquée.',
    steps: [
      'On imagine la ligne décrite dans chaque situation.',
      trio.map((s) => s.why).join(' '),
      'Chaque situation a **sa** trajectoire.',
    ],
    targetSeconds: 55,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SCENES.filter((x) => x.forme !== 'autre'));
  const bon = s.forme === 'rectiligne' ? 'rectiligne' : 'circulaire';
  return {
    prompt: `On observe ${s.texte}. Complète la phrase avec les mots justes.`,
    answer: {
      kind: 'cloze',
      parts: ['La ligne décrite est la ', ' ; ici, elle est ', '.'],
      blanks: [
        { mode: 'text', accepted: ['trajectoire'] },
        { mode: 'text', accepted: [bon] },
      ],
    },
    hint: 'Le premier mot nomme la ligne ; le second est un adjectif qui dit sa forme.',
    steps: [s.why, `La ligne décrite est la **trajectoire**, ici **${bon}**.`],
    targetSeconds: 45,
  };
};

const CAS: readonly { texte: string; bon: 'rectiligne' | 'circulaire'; why: string }[] = [
  {
    texte: 'La valve d’une roue de vélo, observée par rapport à l’axe de la roue, pendant que le vélo roule.',
    bon: 'circulaire',
    why: 'Par rapport à l’axe, la valve reste à la même distance et tourne autour : elle décrit un cercle.',
  },
  {
    texte: 'L’axe d’une roue d’un vélo qui roule tout droit sur un sol plat, observé par rapport au sol.',
    bon: 'rectiligne',
    why: 'La roue tourne, mais son axe avance tout droit à hauteur constante.',
  },
  {
    texte: 'La poignée d’une porte qu’on ouvre, observée par rapport au mur.',
    bon: 'circulaire',
    why: 'La porte tourne autour de ses gonds : la poignée décrit un arc de cercle.',
  },
  {
    texte: 'Le siège d’une balançoire dont les cordes restent tendues, observé par rapport au portique.',
    bon: 'circulaire',
    why: 'Le siège va et vient à distance constante de la barre : il décrit un arc de cercle.',
  },
  {
    texte: 'Un passager assis dans un tramway qui suit une voie droite, observé par rapport au trottoir.',
    bon: 'rectiligne',
    why: 'Le passager est entraîné par le tramway, qui avance en ligne droite par rapport au trottoir.',
  },
  {
    texte: 'Une planète autour du Soleil, dans un premier modèle simplifié, observée par rapport au Soleil.',
    bon: 'circulaire',
    why: 'Dans ce modèle simplifié, la trajectoire de la planète est un cercle.',
  },
  {
    texte: 'Le crochet d’une grue qui descend une charge à la verticale, sans balancement, observé par rapport au sol.',
    bon: 'rectiligne',
    why: 'Le crochet descend suivant une verticale : une droite.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(CAS);
  const autre = c.bon === 'circulaire' ? 'rectiligne' : 'circulaire';
  const { answer, traps } = saisie(
    [c.bon],
    [
      [autre, c.why],
      ['immobile', `Par rapport à la référence choisie, la position change bien. ${c.why}`],
    ],
  );
  return {
    prompt: `${c.texte} Qualifie la trajectoire par un adjectif.`,
    answer,
    traps,
    hint: 'Place-toi sur la référence citée et suis seulement le point demandé.',
    steps: [
      'La forme de la trajectoire se décide depuis la référence indiquée.',
      c.why,
      `La trajectoire est **${c.bon}**.`,
    ],
    targetSeconds: 45,
  };
};

interface Compte {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly vues: readonly { q: string; forme: Forme; why: string }[];
}

const COMPTES: readonly Compte[] = [
  {
    titre: 'La pastille sur la roue',
    lignes: [
      'Une pastille est collée au bord d’une roue de vélo.',
      'Le vélo avance en ligne droite sur un sol plat.',
      'Filmée depuis l’axe de la roue, la pastille tourne en restant à la même distance de l’axe.',
      'Filmée depuis le trottoir, la pastille dessine une suite d’arches.',
      'Filmé depuis le trottoir, l’axe reste à la même hauteur et avance sans dévier.',
    ],
    vues: [
      {
        q: 'la pastille par rapport à l’axe de la roue',
        forme: 'circulaire',
        why: 'Ligne 3 : distance constante à l’axe.',
      },
      { q: 'la pastille par rapport au trottoir', forme: 'autre', why: 'Ligne 4 : des arches, ni droite ni cercle.' },
      { q: 'l’axe de la roue par rapport au trottoir', forme: 'rectiligne', why: 'Ligne 5 : il avance sans dévier.' },
    ],
  },
  {
    titre: 'Le colis et le drone',
    lignes: [
      'Un drone vole en ligne droite, à altitude constante, et lâche un colis.',
      'On admet ici que le colis reste exactement sous le drone pendant sa chute.',
      'Une caméra fixée sous le drone voit le colis s’éloigner à la verticale.',
      'Une caméra posée au sol voit le colis suivre une ligne courbe qui n’est pas un cercle.',
      'La caméra au sol voit le drone avancer sans changer de direction.',
    ],
    vues: [
      { q: 'le colis par rapport au drone', forme: 'rectiligne', why: 'Ligne 3 : il s’éloigne suivant une verticale.' },
      { q: 'le colis par rapport au sol', forme: 'autre', why: 'Ligne 4 : une courbe qui n’est pas un cercle.' },
      { q: 'le drone par rapport au sol', forme: 'rectiligne', why: 'Lignes 1 et 5 : il vole en ligne droite.' },
    ],
  },
  {
    titre: 'La grande roue',
    lignes: [
      'Une grande roue tourne devant une place.',
      'Une cabine reste toujours à la même distance du centre de la roue.',
      'Un passager assis dans la cabine pose son sac sur ses genoux, sans le bouger.',
      'Au pied de la roue, un navire de fête foraine glisse tout droit sur un rail.',
    ],
    vues: [
      {
        q: 'la cabine par rapport au sol de la place',
        forme: 'circulaire',
        why: 'Ligne 2 : distance constante au centre de la roue.',
      },
      { q: 'le navire par rapport au sol de la place', forme: 'rectiligne', why: 'Ligne 4 : il glisse tout droit.' },
    ],
  },
];

const niveau5 = (rng: Rng): QuestionDraft => {
  const c = rng.pick(COMPTES);
  const v = rng.pick(c.vues);
  const { answer, traps } = choice(rng, NOM[v.forme], [
    ...FORMES.filter((f) => f !== v.forme).map((f) => ({
      label: NOM[f],
      why: `La forme dépend de l’objet observé et de la référence choisie. ${v.why}`,
    })),
    {
      label: 'aucune : l’objet reste immobile dans ce référentiel',
      why: `La position change au cours du temps par rapport à cette référence. ${v.why}`,
    },
  ]);
  return {
    prompt: `Lis le document. Quelle trajectoire observe-t-on pour ${v.q} ?`,
    figure: { kind: 'document', title: c.titre, lines: c.lignes },
    answer,
    traps,
    hint: 'Repère la référence citée dans la question, puis la ligne du document qui s’y rapporte.',
    steps: [
      'La trajectoire dépend du référentiel : on retient la ligne qui correspond à la question.',
      v.why,
      `Réponse : **${NOM[v.forme]}**.`,
    ],
    targetSeconds: 70,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const trajectoireNotion: Skill = {
  id: 'p5-trajectoire',
  title: 'La trajectoire',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **trajectoire** est la ligne décrite par un point d’un objet au cours de son mouvement.',
      'Elle est **rectiligne** si c’est une droite, **circulaire** si c’est un cercle (ou un arc de cercle) ; sinon c’est une autre courbe.',
      'Précise toujours par rapport à quoi tu observes : la valve d’un vélo décrit un cercle par rapport à l’axe, pas par rapport à la route.',
    ],
    ...referencesMouvement('formes', 'trajectoire-definition', 'rectiligne', 'circulaire', 'point-de-vue', 'planetes'),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
