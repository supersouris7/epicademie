import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { references } from './donnees-6e-mouvement-energie.ts';
import { association, saisie } from './outils.ts';

// ——— Décrire un mouvement : trajectoire, vitesse, point de vue ; rotation et révolution de la Terre (6e) ———

type Forme = 'rectiligne' | 'circulaire';
type Allure = 'constante' | 'variable';

interface Scene {
  readonly texte: string;
  readonly reference: string;
  readonly forme: Forme;
  readonly allure: Allure;
}

const SCENES: readonly Scene[] = [
  {
    texte: 'Une valise avance sur un tapis roulant droit, qui défile toujours à la même vitesse.',
    reference: 'au sol',
    forme: 'rectiligne',
    allure: 'constante',
  },
  {
    texte: 'Une cabine d’ascenseur démarre, monte tout droit de plus en plus vite, puis freine.',
    reference: 'à l’immeuble',
    forme: 'rectiligne',
    allure: 'variable',
  },
  {
    texte: 'Le bout d’une aiguille des secondes tourne régulièrement, toujours à la même vitesse.',
    reference: 'au centre du cadran',
    forme: 'circulaire',
    allure: 'constante',
  },
  {
    texte: 'Un point au bord d’un manège tourne de plus en plus vite au démarrage.',
    reference: 'au sol',
    forme: 'circulaire',
    allure: 'variable',
  },
  {
    texte: 'Un chariot roule sur un rail droit et ralentit jusqu’à l’arrêt.',
    reference: 'au rail',
    forme: 'rectiligne',
    allure: 'variable',
  },
  {
    texte: 'Un point d’une pale de ventilateur tourne régulièrement, à vitesse inchangée.',
    reference: 'à l’axe du ventilateur',
    forme: 'circulaire',
    allure: 'constante',
  },
];

const avecRef = (s: Scene) => `${s.texte} On l’observe par rapport ${s.reference}.`;
const whyForme = (f: Forme) =>
  f === 'rectiligne' ? 'La trajectoire est une droite.' : 'La trajectoire est un cercle.';
const whyAllure = (a: Allure) =>
  a === 'constante' ? 'La valeur de la vitesse ne change pas.' : 'La valeur de la vitesse change au cours du temps.';
const nomme = (f: Forme, a: Allure) => `${f} ${a === 'constante' ? 'uniforme' : 'à vitesse variable'}`;
/** Explique seulement ce qui est faux dans la description choisie. */
const whyDescription = (vue: { forme: Forme; allure: Allure }, f: Forme, a: Allure) =>
  [vue.forme === f ? '' : whyForme(vue.forme), vue.allure === a ? '' : whyAllure(vue.allure)].filter(Boolean).join(' ');
const FORMES: readonly Forme[] = ['rectiligne', 'circulaire'];
const ALLURES: readonly Allure[] = ['constante', 'variable'];

const niveau1 = (rng: Rng): QuestionDraft => {
  const s = rng.pick(SCENES);
  if (rng.int(0, 1) === 0) {
    const autre: Forme = s.forme === 'rectiligne' ? 'circulaire' : 'rectiligne';
    const { answer, traps } = choice(rng, s.forme, [
      { label: autre, why: whyForme(s.forme) },
      { label: 'en zigzag', why: `Rien ne change brusquement de direction ici. ${whyForme(s.forme)}` },
    ]);
    return {
      prompt: `${avecRef(s)} Comment qualifier la forme de ce mouvement ?`,
      answer,
      traps,
      hint: 'Imagine la ligne suivie : une droite, un cercle, ou une ligne brisée ?',
      steps: ['On regarde la forme de la trajectoire.', whyForme(s.forme), `Le mouvement est **${s.forme}**.`],
      targetSeconds: 25,
    };
  }
  const bon = s.allure === 'constante' ? 'sa valeur est constante' : 'sa valeur est variable';
  const { answer, traps } = choice(rng, bon, [
    {
      label: s.allure === 'constante' ? 'sa valeur est variable' : 'sa valeur est constante',
      why: whyAllure(s.allure),
    },
    { label: 'sa valeur est nulle pendant tout le trajet', why: 'L’objet se déplace : sa vitesse n’est pas nulle.' },
  ]);
  return {
    prompt: `${avecRef(s)} Que peut-on dire de sa vitesse ?`,
    answer,
    traps,
    hint: 'Cherche dans le texte si l’allure change ou reste la même.',
    steps: ['On regarde si l’allure change.', whyAllure(s.allure), `Réponse : **${bon}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    const forme = rng.pick(FORMES);
    const paires: readonly (readonly [string, string])[] = [
      [`Mouvement ${forme}`, forme === 'rectiligne' ? 'La trajectoire est une droite' : 'La trajectoire est un cercle'],
      ['Mouvement uniforme', 'La valeur de la vitesse reste constante'],
      ['Point de vue', 'Référence par rapport à laquelle on décrit le mouvement'],
    ];
    return {
      prompt: `Mouvement ${forme}, mouvement uniforme, point de vue : associe chaque expression à sa signification.`,
      answer: association(rng, paires),
      hint: 'Une expression parle de la ligne suivie, une autre de la vitesse, la dernière de l’observation.',
      steps: [
        'Un mouvement se décrit par sa trajectoire, sa vitesse et le point de vue.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const s = rng.pick(SCENES);
  const bon = nomme(s.forme, s.allure);
  const { answer, traps } = choice(
    rng,
    bon,
    FORMES.flatMap((f) => ALLURES.map((a) => ({ f, a })))
      .filter(({ f, a }) => f !== s.forme || a !== s.allure)
      .map(({ f, a }) => ({ label: nomme(f, a), why: whyDescription(s, f, a) })),
  );
  return {
    prompt: `${avecRef(s)} Quelle description convient ?`,
    answer,
    traps,
    hint: 'Réponds à deux questions : quelle est la forme de la trajectoire ? La vitesse change-t-elle ?',
    steps: [whyForme(s.forme), whyAllure(s.allure), `Le mouvement est **${bon}**.`],
    targetSeconds: 35,
  };
};

const MOBILES = ['un robot', 'un chariot', 'une draisienne', 'un train miniature'];

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const constante = rng.int(0, 1) === 0;
    const pas = rng.int(2, 9);
    const ecarts = constante ? [pas, pas, pas] : [pas, pas + rng.int(1, 3), pas + rng.int(4, 6)];
    const positions = ecarts.reduce<number[]>((acc, e) => [...acc, (acc.at(-1) ?? 0) + e], [0]);
    const bon: Allure = constante ? 'constante' : 'variable';
    const why = constante
      ? 'Les distances parcourues pendant des durées égales sont égales.'
      : 'Les distances parcourues pendant des durées égales sont différentes.';
    const { answer, traps } = saisie([bon], [[constante ? 'variable' : 'constante', why]]);
    return {
      prompt: `Relevé de ${rng.pick(MOBILES)}, toutes les secondes, depuis le départ : ${positions.map((p) => `${p} m`).join(' ; ')}. La vitesse est-elle constante ou variable ? Écris le bon mot.`,
      answer,
      traps,
      hint: 'Calcule la distance parcourue pendant chaque seconde.',
      steps: [`Distances par seconde : ${ecarts.join(' m, ')} m.`, why, `La vitesse est **${bon}**.`],
      targetSeconds: 50,
    };
  }
  if (t === 1) {
    return {
      prompt: 'Complète la phrase sur les mouvements de la Terre.',
      answer: {
        kind: 'cloze',
        parts: [
          'La durée d’un jour est associée à la ',
          ' de la Terre autour de l’axe des pôles ; la durée d’une année à sa ',
          ' autour du Soleil.',
        ],
        blanks: [
          { mode: 'list', options: ['rotation', 'révolution', 'trajectoire'], correct: 0 },
          { mode: 'list', options: ['rotation', 'révolution', 'trajectoire'], correct: 1 },
        ],
      },
      hint: 'Un mouvement fait tourner la Terre sur elle-même, l’autre la fait tourner autour du Soleil.',
      steps: [
        'Autour de son axe : rotation. Autour du Soleil : révolution.',
        'Réponse : **rotation** puis **révolution**.',
      ],
      targetSeconds: 40,
    };
  }
  const s = rng.pick(SCENES);
  const uniforme = s.allure === 'constante';
  return {
    prompt: `${avecRef(s)} Complète la description.`,
    answer: {
      kind: 'cloze',
      parts: ['Le mouvement est ', ' et la valeur de la vitesse est ', '.'],
      blanks: [
        { mode: 'list', options: ['rectiligne', 'circulaire'], correct: s.forme === 'rectiligne' ? 0 : 1 },
        { mode: 'list', options: ['constante', 'variable'], correct: uniforme ? 0 : 1 },
      ],
    },
    hint: 'Le premier mot décrit la trajectoire, le second l’évolution de la vitesse.',
    steps: [whyForme(s.forme), whyAllure(s.allure), `Réponse : **${s.forme}**, vitesse **${s.allure}**.`],
    targetSeconds: 35,
  };
};

const MOTS: readonly { q: string; accepte: readonly string[]; faux: readonly (readonly [string, string])[] }[] = [
  {
    q: 'Quel nom porte le mouvement de la Terre autour de l’axe des pôles, associé à la durée d’un jour ?',
    accepte: ['rotation', 'la rotation', 'une rotation', 'mouvement de rotation'],
    faux: [['révolution', 'La révolution est le mouvement de la Terre autour du Soleil.']],
  },
  {
    q: 'Quel nom porte le mouvement de la Terre autour du Soleil, associé à la durée d’une année ?',
    accepte: ['révolution', 'revolution', 'la révolution', 'une révolution', 'mouvement de révolution'],
    faux: [['rotation', 'La rotation est ici le mouvement autour de l’axe des pôles.']],
  },
  {
    q: 'Quel adjectif désigne le point de vue qui prend le centre du Soleil comme référence ?',
    accepte: ['héliocentrique', 'heliocentrique'],
    faux: [
      ['circulaire', 'Cet adjectif décrit la forme d’une trajectoire, pas la référence choisie.'],
      ['uniforme', 'Cet adjectif décrit une vitesse constante, pas la référence choisie.'],
    ],
  },
  {
    q: 'Quel adjectif qualifie un mouvement dont la valeur de la vitesse reste constante ?',
    accepte: ['uniforme', 'mouvement uniforme'],
    faux: [
      ['constant', 'C’est la valeur de la vitesse qui est constante ; le mouvement, lui, est dit uniforme.'],
      ['rectiligne', 'Rectiligne décrit la forme de la trajectoire, pas la vitesse.'],
      ['circulaire', 'Circulaire décrit la forme de la trajectoire, pas la vitesse.'],
    ],
  },
];

/** Situations où la réponse change avec le point de vue. */
const RELATIFS: readonly { q: string; bon: 'immobile' | 'en mouvement'; why: string }[] = [
  {
    q: 'Un voyageur reste assis dans un train qui roule. Par rapport au train',
    bon: 'immobile',
    why: 'Il ne change pas de position par rapport au train.',
  },
  {
    q: 'Un voyageur reste assis dans un train qui roule. Par rapport au quai',
    bon: 'en mouvement',
    why: 'Il change de position par rapport au quai.',
  },
  {
    q: 'Une enfant reste assise sur un manège qui tourne. Par rapport au sol',
    bon: 'en mouvement',
    why: 'Elle change de position par rapport au sol.',
  },
  {
    q: 'Une enfant reste assise sur un manège qui tourne. Par rapport au siège',
    bon: 'immobile',
    why: 'Elle ne change pas de position par rapport au siège.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const m = rng.pick(MOTS);
    const { answer, traps } = saisie(m.accepte, m.faux);
    return {
      prompt: m.q,
      answer,
      traps,
      hint: 'Demande-toi si la question porte sur une forme, une vitesse, une référence ou un mouvement de la Terre.',
      steps: ['On cherche le terme scientifique exact.', `Réponse : **${m.accepte[0]}**.`],
      targetSeconds: 35,
    };
  }
  if (t === 1) {
    const paires: readonly (readonly [string, string])[] = [
      ['Rotation de la Terre', 'Associée à la durée d’un jour'],
      ['Révolution de la Terre', 'Associée à la durée d’une année'],
      ['Point de vue héliocentrique', 'Référence : le centre du Soleil'],
      ['Mouvement rectiligne', 'Trajectoire en ligne droite'],
      ['Mouvement uniforme', 'Vitesse de valeur constante'],
    ];
    return {
      prompt: 'Associe les cinq expressions à ce qui leur correspond.',
      answer: association(rng, paires),
      hint: 'Commence par les deux expressions qui décrivent la trajectoire ou la vitesse.',
      steps: [
        'Chaque expression a une seule correspondance.',
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 70,
    };
  }
  const c = rng.pick(RELATIFS);
  const { answer, traps } = saisie(c.bon === 'immobile' ? ['immobile'] : ['en mouvement', 'mouvement', 'mobile'], [
    [c.bon === 'immobile' ? 'en mouvement' : 'immobile', c.why],
  ]);
  return {
    prompt: `${c.q}, cette personne est-elle immobile ou en mouvement ?`,
    answer,
    traps,
    hint: 'Sa position change-t-elle par rapport à la référence citée ?',
    steps: ['On compare la position à la référence indiquée.', c.why, `La personne est **${c.bon}**.`],
    targetSeconds: 40,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const forme = rng.pick(FORMES);
  const allure = rng.pick(ALLURES);
  const pas = rng.int(3, 8);
  const ecarts = allure === 'constante' ? [pas, pas, pas] : [pas + 6, pas + 3, pas];
  const figure = {
    kind: 'document' as const,
    title: 'Suivi d’un mobile (données de l’exercice)',
    lines: [
      forme === 'rectiligne'
        ? 'Vu depuis la salle, le mobile suit un rail parfaitement droit.'
        : 'Vu depuis la salle, le mobile reste toujours à la même distance d’un piquet central et tourne autour.',
      `Pendant la 1re seconde, il parcourt ${ecarts[0]} dm.`,
      `Pendant la 2e seconde, il parcourt ${ecarts[1]} dm.`,
      `Pendant la 3e seconde, il parcourt ${ecarts[2]} dm.`,
      'Une petite caméra est fixée sur le mobile.',
    ],
  };
  if (rng.int(0, 2) === 0) {
    const { answer, traps } = saisie(
      ['immobile'],
      [['en mouvement', 'La caméra est fixée au mobile : sa position par rapport à lui ne change pas.']],
    );
    return {
      prompt: 'Lis le document. Par rapport à la caméra, le mobile est-il immobile ou en mouvement ?',
      figure,
      answer,
      traps,
      hint: 'La référence n’est plus la salle : relis la dernière ligne.',
      steps: [
        'La caméra se déplace avec le mobile.',
        'Par rapport à elle, il ne change pas de position : il est **immobile**.',
      ],
      targetSeconds: 60,
    };
  }
  const bon = nomme(forme, allure);
  const { answer, traps } = choice(
    rng,
    bon,
    FORMES.flatMap((f) => ALLURES.map((a) => ({ f, a })))
      .filter(({ f, a }) => f !== forme || a !== allure)
      .map(({ f, a }) => ({ label: nomme(f, a), why: whyDescription({ forme, allure }, f, a) })),
  );
  return {
    prompt: 'Lis le document. Quel est le mouvement du mobile par rapport à la salle ?',
    figure,
    answer,
    traps,
    hint: 'Utilise la première ligne pour la forme, puis compare les trois distances.',
    steps: [
      whyForme(forme),
      `Distances en une seconde : ${ecarts.join(' dm, ')} dm. ${whyAllure(allure)}`,
      `Le mouvement est **${bon}**.`,
    ],
    targetSeconds: 65,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const typesMouvements: Skill = {
  id: 'p6-types-mouvements',
  title: 'Les types de mouvements',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un mouvement se décrit par rapport à un **point de vue**. Sa trajectoire peut être **rectiligne** (une droite) ou **circulaire** (un cercle). C’est un **mouvement uniforme** si la valeur de la vitesse reste constante.',
      'La **rotation** de la Terre autour de l’axe des pôles est associée à la durée d’un jour ; sa **révolution** autour du Soleil, du point de vue **héliocentrique**, à la durée d’une année.',
    ],
    ...references(
      'point-de-vue',
      'rectiligne',
      'circulaire',
      'uniforme',
      'constante-variable',
      'annee-jour',
      'rotation',
      'revolution',
      'heliocentrique',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
