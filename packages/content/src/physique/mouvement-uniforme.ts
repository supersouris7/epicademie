import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import { association, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesMouvement } from './donnees-mouvement.ts';

// ——— Mouvement uniforme, accéléré ou ralenti ; direction, sens et valeur de la vitesse (5e) ———

type Allure = 'uniforme' | 'accéléré' | 'ralenti';
const ALLURES: readonly Allure[] = ['uniforme', 'accéléré', 'ralenti'];
const WHY: Record<Allure, string> = {
  uniforme:
    'Mouvement uniforme : la valeur de la vitesse est constante, les distances parcourues en des durées égales sont égales.',
  accéléré: 'Mouvement accéléré : la vitesse augmente, les distances parcourues en des durées égales grandissent.',
  ralenti: 'Mouvement ralenti : la vitesse diminue, les distances parcourues en des durées égales raccourcissent.',
};

/** Distances parcourues pendant des durées égales successives (données de l'exercice). */
const distances = (rng: Rng, allure: Allure, n: number): number[] => {
  if (allure === 'uniforme') {
    const d = rng.int(2, 9);
    return Array.from({ length: n }, () => d);
  }
  const pas = rng.int(1, 3);
  const base = rng.int(1, 6);
  const croissantes = Array.from({ length: n }, (_, i) => base + i * pas);
  return allure === 'accéléré' ? croissantes : croissantes.reverse();
};

const cumul = (d: readonly number[]) => d.reduce<number[]>((acc, x) => [...acc, (acc.at(-1) ?? 0) + x], [0]);

const autres = (a: Allure) => ALLURES.filter((x) => x !== a).map((x) => ({ label: x, why: WHY[x] }));

const niveau1 = (rng: Rng): QuestionDraft => {
  const allure = rng.pick(ALLURES);
  const pas = rng.int(1, 2);
  const regulier = rng.int(2, 3);
  const d =
    allure === 'uniforme'
      ? Array.from({ length: 4 }, () => regulier)
      : allure === 'accéléré'
        ? [1, 1 + pas, 1 + 2 * pas, 1 + 3 * pas]
        : [1 + 3 * pas, 1 + 2 * pas, 1 + pas, 1];
  const gauche = rng.int(0, 1) === 1;
  const x = cumul(d).map((v) => (gauche ? -v : v));
  const { answer, traps } = choice(rng, allure, autres(allure));
  return {
    prompt:
      'Le schéma montre un mobile toutes les secondes, des positions 1 à 5, le long d’une droite. Son mouvement est…',
    figure: {
      kind: 'grid',
      xMin: Math.min(...x) - 1,
      xMax: Math.max(...x) + 1,
      yMin: -1,
      yMax: 1,
      axes: false,
      points: x.map((v, i) => ({ name: String(i + 1), x: v, y: 0 })),
    },
    answer,
    traps,
    hint: 'Compare les écarts entre deux positions voisines, dans l’ordre des numéros.',
    steps: [
      'Les positions sont prises à des durées égales : on compare les écarts.',
      WHY[allure],
      `Le mouvement est **${allure}**.`,
    ],
    targetSeconds: 25,
  };
};

const liste = (d: readonly number[]) => d.map((x) => `${x} m`).join(' puis ');

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const series = ALLURES.map((a) => [liste(distances(rng, a, 4)), a] as const);
    return {
      prompt: `Voici les distances parcourues seconde après seconde par trois chariots : ${series
        .map((s) => s[0])
        .sort()
        .join(' | ')}. Associe chaque série à son mouvement.`,
      answer: association(rng, series),
      hint: 'Les distances restent-elles égales, grandissent-elles ou diminuent-elles ?',
      steps: [
        'Chaque distance correspond à la même durée : 1 s.',
        ALLURES.map((a) => WHY[a]).join(' '),
        'Chaque série a **son** mouvement.',
      ],
      targetSeconds: 55,
    };
  }
  const allure = rng.pick(ALLURES);
  const d = distances(rng, allure, 4);
  const { answer, traps } = choice(rng, allure, [
    ...autres(allure),
    {
      label: 'd’abord accéléré, puis ralenti',
      why: 'Il faudrait des distances qui grandissent puis diminuent.',
    },
  ]);
  return {
    prompt: `Pendant 4 secondes de suite, un chariot parcourt : ${liste(d)} (une distance par seconde). Son mouvement est…`,
    answer,
    traps,
    hint: 'Compare les distances parcourues pendant des durées égales.',
    steps: [`On compare : ${liste(d)}.`, WHY[allure], `Le mouvement est **${allure}**.`],
    targetSeconds: 35,
  };
};

const VARIANTES: Record<Allure, readonly string[]> = {
  uniforme: ['uniforme'],
  accéléré: ['accéléré', 'accélérée', 'accelere'],
  ralenti: ['ralenti', 'ralentie', 'décéléré', 'décélérée', 'decelere'],
};

/** Mots proches mais imprécis : le terme attendu pour une vitesse constante est « uniforme ». */
const IMPRECIS = ['constant', 'régulier'] as const;

const saisieAllure = (allure: Allure) =>
  saisie(VARIANTES[allure], [
    ...ALLURES.filter((a) => a !== allure).map(
      (a) => [a, `${WHY[a]} Ce n’est pas ce que montrent les données.`] as const,
    ),
    ...IMPRECIS.map(
      (m) =>
        [
          m,
          allure === 'uniforme'
            ? 'Tu as la bonne idée, mais en physique on dit que ce mouvement est « uniforme ».'
            : `Les distances ne sont pas égales ici. ${WHY[allure]}`,
        ] as const,
    ),
  ]);

const MOBILES = ['un coureur', 'une trottinette', 'un robot', 'une luge'] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const allure = rng.pick(ALLURES);
  const duree = rng.pick([2, 5, 10]);
  const d = distances(rng, allure, 3);
  const mobile = rng.pick(MOBILES);
  const { answer, traps } = saisieAllure(allure);
  return {
    prompt: `On suit ${mobile} pendant trois durées égales de ${duree} s. Distances parcourues : ${liste(d)}. Écris l’adjectif qui qualifie son mouvement.`,
    answer,
    traps,
    hint: 'Les durées sont égales : seule la comparaison des distances suffit.',
    steps: ['À durées égales, on compare les distances.', WHY[allure], `Le mouvement est **${allure}**.`],
    targetSeconds: 40,
  };
};

interface Situation {
  readonly texte: string;
  readonly direction: boolean;
  readonly sens: 'reste le même' | 'change' | null;
  readonly valeur: 0 | 1 | 2;
  readonly why: string;
}

const VALEURS = ['reste constante', 'augmente', 'diminue'];

const SITUATIONS: readonly Situation[] = [
  {
    texte: 'Un siège de manège tourne en rond en parcourant des distances égales pendant des durées égales.',
    direction: true,
    sens: null,
    valeur: 0,
    why: 'Sur un cercle, la direction de la vitesse change sans cesse, mais ici sa valeur reste constante.',
  },
  {
    texte: 'Une voiture prend un virage et son compteur indique toujours la même valeur.',
    direction: true,
    sens: null,
    valeur: 0,
    why: 'Dans un virage, la direction change ; le compteur montre que la valeur ne change pas.',
  },
  {
    texte: 'Un train démarre sur une voie droite : il va de plus en plus vite.',
    direction: false,
    sens: 'reste le même',
    valeur: 1,
    why: 'La voie est droite (même direction), le train avance du même côté (même sens) et la valeur augmente.',
  },
  {
    texte: 'Un vélo freine sur une route droite, sans faire demi-tour.',
    direction: false,
    sens: 'reste le même',
    valeur: 2,
    why: 'La route est droite, le vélo avance du même côté et la valeur de sa vitesse diminue.',
  },
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const s = rng.pick(SITUATIONS);
    const uniforme = s.valeur === 0;
    return {
      prompt: `${s.texte} Complète la description.`,
      answer: {
        kind: 'cloze',
        parts: ['La direction de la vitesse ', ' ; sa valeur ', ' ; le mouvement ', ' uniforme.'],
        blanks: [
          { mode: 'list', options: ['reste la même', 'change'], correct: s.direction ? 1 : 0 },
          { mode: 'list', options: VALEURS, correct: s.valeur },
          { mode: 'list', options: ['est', 'n’est pas'], correct: uniforme ? 0 : 1 },
        ],
      },
      hint: 'La direction dépend de la forme du trajet ; « uniforme » dépend seulement de la valeur.',
      steps: [
        s.why,
        `Le mouvement **${uniforme ? 'est' : 'n’est pas'} uniforme** : seule la valeur de la vitesse en décide.`,
      ],
      targetSeconds: 70,
    };
  }
  if (type === 1) {
    const monte = rng.int(0, 1) === 0;
    const objet = rng.pick(['un ascenseur', 'un monte-charge', 'un drone', 'le panier d’une grue']);
    const bon = 'le sens change, la direction reste la même';
    const { answer, traps } = choice(rng, bon, [
      {
        label: 'la direction change, le sens reste le même',
        why: 'La droite suivie est toujours la verticale : la direction est la même.',
      },
      {
        label: 'ni la direction ni le sens ne changent',
        why: 'Monter puis descendre, c’est se déplacer dans deux sens opposés.',
      },
      {
        label: 'la direction et le sens changent',
        why: 'L’objet reste sur la même verticale : sa direction ne change pas.',
      },
    ]);
    return {
      prompt: `En ligne droite verticale, ${objet} ${monte ? 'monte, puis redescend' : 'descend, puis remonte'}. Entre ces deux parties du trajet, qu’observe-t-on pour la vitesse ?`,
      answer,
      traps,
      hint: 'La direction est la droite suivie ; le sens dit vers quel côté on va sur cette droite.',
      steps: [
        'La direction est la droite suivie : ici la verticale, dans les deux parties.',
        'Le sens passe du haut vers le bas, ou l’inverse.',
        `Donc **${bon}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const allure = rng.pick(ALLURES);
  const dt = rng.pick([2, 5, 10]);
  const pos = cumul(distances(rng, allure, 3));
  const { answer, traps } = saisieAllure(allure);
  return {
    prompt:
      'Le relevé donne la distance parcourue depuis le départ, en ligne droite. Écris l’adjectif qui qualifie le mouvement.',
    figure: {
      kind: 'table',
      header: true,
      rows: [
        ['Instant (s)', ...pos.map((_, i) => String(i * dt))],
        ['Distance depuis le départ (m)', ...pos.map(String)],
      ],
    },
    answer,
    traps,
    hint: 'La distance depuis le départ augmente toujours : calcule ce qui est parcouru dans chaque intervalle.',
    steps: [
      `Distances par intervalle de ${dt} s (différences) : ${liste(pos.slice(1).map((p, i) => p - (pos[i] ?? 0)))}.`,
      WHY[allure],
      `Le mouvement est **${allure}**.`,
    ],
    targetSeconds: 75,
  };
};

const FORMES = ['rectiligne', 'circulaire'] as const;
const LIEUX = { rectiligne: 'sur une piste droite', circulaire: 'sur un circuit circulaire' } as const;
const PHASES = ['A', 'B', 'C'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  // Une seule phase uniforme : la question « quelle phase ? » n'a qu'une réponse.
  const allures = rng.shuffle([...ALLURES]);
  const phases = PHASES.map((nom, i) => {
    const allure = allures[i] ?? 'uniforme';
    const forme = rng.pick(FORMES);
    return { nom, allure, forme, d: distances(rng, allure, 3) };
  });
  const figure = {
    kind: 'document' as const,
    title: 'Essai d’un véhicule télécommandé (données de l’exercice)',
    lines: phases.map(
      (p) => `Phase ${p.nom}, ${LIEUX[p.forme]} : distances parcourues toutes les 2 s : ${liste(p.d)}.`,
    ),
  };
  const cible = rng.pick(phases);
  if (rng.int(0, 1) === 0) {
    const allure = rng.pick(ALLURES);
    const bonne = phases.find((p) => p.allure === allure) ?? cible;
    const { answer, traps } = choice(
      rng,
      `La phase ${bonne.nom}`,
      phases
        .filter((p) => p !== bonne)
        .map((p) => ({ label: `La phase ${p.nom}`, why: `Phase ${p.nom} : ${liste(p.d)}. ${WHY[p.allure]}` }))
        .concat({ label: 'Aucune phase', why: `Relis la phase ${bonne.nom} : ${liste(bonne.d)}.` }),
    );
    return {
      prompt: `Lis le document. Pendant quelle phase le mouvement est-il ${allure} ?`,
      figure,
      answer,
      traps,
      hint: 'La forme du trajet ne compte pas ici : compare les distances de chaque phase.',
      steps: [
        'Dans chaque phase, les durées sont égales : on compare les distances.',
        WHY[allure],
        `C’est **la phase ${bonne.nom}**.`,
      ],
      targetSeconds: 80,
    };
  }
  const nom = (forme: string, allure: Allure) => `${forme} et ${allure}`;
  const autreForme = cible.forme === 'rectiligne' ? 'circulaire' : 'rectiligne';
  const autreAllure = rng.pick(ALLURES.filter((a) => a !== cible.allure));
  const bon = nom(cible.forme, cible.allure);
  const { answer, traps } = choice(rng, bon, [
    {
      label: nom(autreForme, cible.allure),
      why: `La forme vient du lieu : phase ${cible.nom}, ${LIEUX[cible.forme]}.`,
    },
    { label: nom(cible.forme, autreAllure), why: `Phase ${cible.nom} : ${liste(cible.d)}. ${WHY[cible.allure]}` },
    { label: nom(autreForme, autreAllure), why: `La forme et l’allure sont à revoir pour la phase ${cible.nom}.` },
  ]);
  return {
    prompt: `Lis le document. Comment qualifier le mouvement pendant la phase ${cible.nom} ?`,
    figure,
    answer,
    traps,
    hint: 'Cherche deux informations : la forme de la trajectoire, puis l’évolution des distances.',
    steps: [
      `Forme : ${LIEUX[cible.forme]}, la trajectoire est ${cible.forme}.`,
      WHY[cible.allure],
      `Le mouvement est **${bon}**.`,
    ],
    targetSeconds: 90,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const mouvementUniforme: Skill = {
  id: 'p5-mouvement-uniforme',
  title: 'Mouvement uniforme ou non',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Dans un **mouvement uniforme**, la valeur de la vitesse est constante : en des durées égales, on parcourt des distances égales.',
      'Sinon, le mouvement peut être **accéléré** (la valeur augmente) ou **ralenti** (elle diminue).',
      'La vitesse a une direction, un sens et une valeur : sur un manège régulier, la valeur est constante mais la direction change. La direction est la droite suivie ; le sens indique vers quel côté on avance sur cette droite.',
    ],
    ...referencesMouvement(
      'uniforme-programme',
      'uniforme-definition',
      'circulaire-uniforme',
      'vitesse-caracteres',
      'accelere',
      'accelere-mecanique',
      'ralentir',
      'direction',
      'sens',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
