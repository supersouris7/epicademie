import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { maj, ordre, saisie } from './outils.ts';

// ——— Vitesse au cours moyen : mesurer et comparer, sans calculer sa valeur (calcul exigible en 6e) ———

/** Lettres des robots, mélangées pour que la réponse ne soit pas toujours la même. */
const lettres = (rng: Rng) => rng.shuffle(['A', 'B', 'C']);
const robot = (l: string) => `le robot ${l}`;
const EGAL = 'ils vont aussi vite';
const REGLE_DUREE = 'Sur la même distance, le plus rapide est celui qui met le moins de temps.';
const REGLE_DISTANCE = 'Pendant la même durée, le plus rapide est celui qui va le plus loin.';

const niveau1 = (rng: Rng): QuestionDraft => {
  const [x = 'A', y = 'B'] = lettres(rng);
  const t = rng.pick([10, 20, 30]);
  const loin = rng.int(6, 9);
  const pres = rng.int(2, 4);
  const [premier, second] = rng.shuffle([
    [x, loin],
    [y, pres],
  ] as const);
  const { answer, traps: tr } = choice(rng, robot(x), [
    { label: robot(y), why: `Le robot ${y} va moins loin dans le même temps. ${REGLE_DISTANCE}` },
    { label: EGAL, why: 'Les deux distances sont différentes pour la même durée : les vitesses sont différentes.' },
  ]);
  return {
    prompt: `En ${t} secondes, le robot ${premier?.[0]} parcourt ${premier?.[1]} m et le robot ${second?.[0]} parcourt ${second?.[1]} m. Qui est le plus rapide ?`,
    answer,
    traps: tr,
    hint: 'Les deux robots roulent pendant le même temps. Compare le chemin parcouru.',
    steps: ['La durée est la même.', REGLE_DISTANCE, `Le plus rapide est **${robot(x)}**.`],
    targetSeconds: 25,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const [x = 'A', y = 'B', z = 'C'] = lettres(rng);
  const d = rng.pick([5, 8, 10]);
  const t = rng.int(8, 12);
  const durees = [t, t + rng.int(2, 4), t + rng.int(6, 9)];
  const veutRapide = rng.int(0, 1) === 0;
  const bon = veutRapide ? x : z;
  const faux = [x, y, z].filter((l) => l !== bon);
  const regle = veutRapide ? REGLE_DUREE : 'Sur la même distance, le plus lent est celui qui met le plus de temps.';
  const liste = [
    [x, durees[0]],
    [y, durees[1]],
    [z, durees[2]],
  ]
    .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
    .map(([l, s]) => `${l} met ${s} s`)
    .join(', ');
  const { answer, traps: tr } = choice(rng, robot(bon), [
    ...faux.map((l) => ({ label: robot(l), why: regle })),
    { label: EGAL, why: 'La distance est la même mais les durées sont différentes : les vitesses aussi.' },
  ]);
  return {
    prompt: `Trois robots parcourent ${d} m. ${liste}. Qui est le plus ${veutRapide ? 'rapide' : 'lent'} ?`,
    answer,
    traps: tr,
    hint: 'La distance est la même pour tous. Regarde le temps de chacun.',
    steps: ['La distance est la même.', regle, `C’est **${robot(bon)}**.`],
    targetSeconds: 35,
  };
};

const COUREURS = ['la tortue mécanique', 'le robot rouleur', 'la voiture télécommandée', 'le train miniature'];

const niveau3 = (rng: Rng): QuestionDraft => {
  const t = rng.int(0, 2);
  if (t === 0) {
    const [a = '', b = '', c = ''] = rng.shuffle(COUREURS);
    const base = rng.int(2, 4);
    const dist = [base, base + rng.int(2, 3), base + rng.int(5, 7)];
    const lignes = [
      [a, dist[0]],
      [b, dist[1]],
      [c, dist[2]],
    ]
      .sort((p, q) => String(p[0]).localeCompare(String(q[0])))
      .map(([n, m]) => `${n} (${m} m)`)
      .join(' ; ');
    return {
      prompt: `En une minute, voici les distances parcourues : ${lignes}. Range du plus lent au plus rapide.`,
      answer: ordre(rng, [a, b, c]),
      hint: 'Même durée pour tous : le plus lent est celui qui va le moins loin.',
      steps: ['La durée est la même : une minute.', REGLE_DISTANCE, `Ordre : **${[a, b, c].join(' → ')}**.`],
      targetSeconds: 45,
    };
  }
  if (t === 1) {
    const depart = rng.int(2, 15);
    const duree = rng.int(11, 40);
    const arrivee = depart + duree;
    return {
      prompt: `Pour mesurer une vitesse, on chronomètre. Le chrono affiche ${depart} s au départ du robot et ${arrivee} s à l’arrivée. Combien de secondes dure le trajet ?`,
      answer: num(duree, 's'),
      traps: traps(r(duree), [
        [arrivee, 'C’est l’instant d’arrivée. La durée se calcule : arrivée moins départ.'],
        [arrivee + depart, 'On n’additionne pas les deux instants : la durée est l’intervalle entre eux.'],
      ]),
      hint: 'La durée est le temps écoulé entre les deux instants.',
      steps: ['Durée = instant d’arrivée − instant de départ.', `${arrivee} − ${depart}.`, `Durée : **${duree} s**.`],
      targetSeconds: 35,
    };
  }
  const memeDistance = rng.int(0, 1) === 0;
  const bon = memeDistance ? 'durées' : 'distances';
  return {
    prompt: `Complète la règle. Deux robots roulent ${memeDistance ? 'sur la même distance' : 'pendant la même durée'}.`,
    answer: {
      kind: 'cloze',
      parts: ['Pour savoir qui est le plus rapide, je compare leurs ', '.'],
      blanks: [{ mode: 'list', options: ['durées', 'distances', 'couleurs'], correct: memeDistance ? 0 : 1 }],
    },
    hint: 'Compare ce qui change d’un robot à l’autre.',
    steps: [
      memeDistance ? 'La distance est la même.' : 'La durée est la même.',
      `Ce qui change, ce sont les **${bon}**.`,
    ],
    targetSeconds: 30,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  // x : mesure écrite avec deux unités ; y : avec une seule. Le gagnant et l’ordre de l’énoncé sont tirés au sort.
  const [x = 'A', y = 'B'] = lettres(rng);
  const enDurees = rng.int(0, 1) === 0;
  const reste = rng.pick(enDurees ? [20, 30, 40] : [20, 30, 50]);
  const composee = (enDurees ? 60 : 100) + reste;
  const simple = composee + (rng.int(0, 1) === 0 ? -1 : 1) * rng.int(3, 9);
  // Le plus rapide : la plus petite durée, ou la plus grande distance.
  const simpleGagne = enDurees ? simple < composee : simple > composee;
  const bon = simpleGagne ? y : x;
  const perdant = simpleGagne ? x : y;
  const ecriture = enDurees ? `1 min ${reste} s` : `1 m ${reste} cm`;
  const unite = enDurees ? 's' : 'cm';
  const regle = enDurees ? REGLE_DUREE : REGLE_DISTANCE;
  const conversion = `${ecriture} = ${composee} ${unite}.`;
  const comparaison = `${simple} ${unite} ${simple < composee ? '<' : '>'} ${composee} ${unite}.`;
  const verbe = enDurees ? 'met' : 'parcourt';
  const [premiere, seconde] = rng.shuffle([
    `le robot ${x} ${verbe} ${ecriture}`,
    `le robot ${y} ${verbe} ${simple} ${unite}`,
  ]);
  const why = `${conversion} Or ${comparaison} ${regle}`;
  const { answer, traps: tr } = saisie(
    [bon, robot(bon), `robot ${bon}`],
    [
      [perdant, why],
      [`robot ${perdant}`, why],
    ],
  );
  return {
    prompt: `${enDurees ? 'Sur la même piste' : 'En 10 s'}, ${premiere} et ${seconde}. Écris la lettre du plus rapide.`,
    answer,
    traps: tr,
    hint: `Écris les deux ${enDurees ? 'durées' : 'distances'} dans la même unité avant de comparer.`,
    steps: [conversion, `${comparaison} ${regle}`, `Réponse : **${bon}**.`],
    targetSeconds: 50,
  };
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const [x = 'A', y = 'B', z = 'C'] = lettres(rng);
  const d = rng.int(4, 8);
  const t = rng.int(8, 14);
  const k = rng.int(2, 5);
  const plus = rng.int(2, 4);
  // z va plus loin que x en la même durée ; y met plus de temps que x pour la même distance : y < x < z.
  const lignes = [
    `${x} parcourt ${d} m en ${t} s.`,
    `${y} parcourt ${d} m en ${t + k} s.`,
    `${z} parcourt ${d + plus} m en ${t} s.`,
  ].sort();
  const figure = {
    kind: 'document' as const,
    title: 'La course des robots A, B et C',
    lines: ['Chaque robot avance toujours à la même allure.', ...lignes],
  };
  const classement = `${y} < ${x} < ${z}`;
  const etapes = [
    `Même distance : ${x} met moins de temps que ${y}, donc ${x} est plus rapide que ${y}.`,
    `Même durée : ${z} va plus loin que ${x}, donc ${z} est plus rapide que ${x}.`,
  ];
  const q = rng.int(0, 2);
  if (q === 2) {
    return {
      prompt: 'Lis le texte. Range les robots du plus lent au plus rapide.',
      figure,
      answer: ordre(rng, [robot(y), robot(x), robot(z)]),
      hint: 'Compare deux robots à la fois : ceux qui ont la même distance, puis ceux qui ont la même durée.',
      steps: [...etapes, `Classement : **${classement}** (du plus lent au plus rapide).`],
      targetSeconds: 70,
    };
  }
  const rapide = q === 0;
  const bon = rapide ? z : y;
  const { answer, traps: tr } = saisie(
    [bon, robot(bon), `robot ${bon}`],
    [
      [x, `${maj(robot(x))} est entre les deux autres. ${etapes.join(' ')}`],
      [rapide ? y : z, `Tu as pris l’autre extrémité du classement. ${etapes.join(' ')}`],
    ],
  );
  return {
    prompt: `Lis le texte. Quel robot est le plus ${rapide ? 'rapide' : 'lent'} ? Écris sa lettre.`,
    figure,
    answer,
    traps: tr,
    hint: 'Compare deux robots à la fois : ceux qui ont la même distance, puis ceux qui ont la même durée.',
    steps: [...etapes, `Le plus ${rapide ? 'rapide' : 'lent'} est **${bon}**.`],
    targetSeconds: 60,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const vitesse: Skill = {
  id: 'pcm2-vitesse',
  title: 'Comparer des vitesses',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **vitesse** relie le chemin parcouru et le temps mis. Pour la comparer, mesure la **distance** et la **durée**.',
      'Même distance : le plus rapide met le moins de temps. Même durée : le plus rapide va le plus loin. Exemple : 10 m en 8 s, c’est plus rapide que 10 m en 12 s.',
    ],
    source: `${PROGRAMME} : « des activités de mesure de distances, de durées (la durée est définie comme l’intervalle entre deux instants), et de vitesse » ; « En classe de sixième, seul le calcul de la valeur de la vitesse […] est exigible » (aucun calcul de vitesse ici). CNRTL, « vitesse » : « espace parcouru en fonction du temps mis à le parcourir ».`,
    sources: [PROGRAMME, 'cnrtl-vitesse'],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
