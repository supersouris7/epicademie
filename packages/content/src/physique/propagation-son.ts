import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, maj, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesSignaux } from './donnees-signaux.ts';

// ——— Propagation du son : milieu matériel, vitesse, fréquence, risques auditifs (5e) ———

export type Domaine = 'infrason' | 'son audible' | 'ultrason';
/** Domaine d'un son pour l'oreille humaine (20 Hz à 20 000 Hz). */
export const domaine = (hz: number): Domaine => (hz < 20 ? 'infrason' : hz > 20000 ? 'ultrason' : 'son audible');
const DOMAINES: readonly Domaine[] = ['infrason', 'son audible', 'ultrason'];
const FREQUENCES: Record<Domaine, readonly number[]> = {
  infrason: [2, 5, 8, 10, 12, 15],
  'son audible': [50, 200, 440, 1000, 5000, 12000],
  ultrason: [25000, 40000, 50000, 80000, 100000],
};
const fmtHz = (n: number) => `${fmt(r(n))} Hz`;
const WHY_DOMAINE: Record<Domaine, string> = {
  infrason: 'Un infrason a une fréquence trop faible pour être entendue : en dessous d’environ 20 Hz.',
  'son audible': 'L’oreille humaine perçoit environ de 20 Hz à 20 000 Hz.',
  ultrason: 'Un ultrason dépasse environ 20 000 Hz : l’oreille humaine ne le perçoit pas.',
};

const VITESSE = 340;
const DONNEE_AIR = `On prend ${VITESSE} m/s pour la vitesse du son dans l’air.`;

interface Cas {
  readonly indice: string;
  readonly question: string;
  readonly bon: string;
  readonly faux: readonly (readonly [string, string])[];
  readonly why: string;
}

const qcm = (rng: Rng, c: Cas, secondes: number): QuestionDraft => {
  const { answer, traps: t } = choice(
    rng,
    c.bon,
    c.faux.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: c.question,
    answer,
    traps: t,
    hint: c.indice,
    steps: ['Un son est une vibration qui se propage dans la matière.', c.why, `Réponse : **${c.bon}**.`],
    targetSeconds: secondes,
  };
};

const CAS_N1: readonly Cas[] = [
  {
    indice: 'Pour passer, le son doit faire vibrer quelque chose.',
    question: 'Dans lequel de ces cas un son ne peut-il pas se propager ?',
    bon: 'dans le vide',
    faux: [
      ['dans l’air', 'L’air est un gaz : le son s’y propage très bien.'],
      ['dans l’eau', 'L’eau est un liquide : le son s’y propage.'],
    ],
    why: 'Le vide ne contient pas de matière qui puisse vibrer.',
  },
  {
    indice: 'Demande-toi ce qui transporte la vibration jusqu’à ton oreille.',
    question: 'De quoi un son a-t-il besoin pour se propager ?',
    bon: 'd’un milieu matériel (gaz, liquide ou solide)',
    faux: [
      ['du vide', 'Sans matière, rien ne peut transmettre la vibration.'],
      ['de lumière', 'On entend aussi dans le noir : la lumière n’est pas nécessaire.'],
    ],
    why: 'La vibration passe de proche en proche à travers la matière.',
  },
  {
    indice: 'Observe la corde juste après l’avoir pincée.',
    question: 'Que fait un objet qui produit un son, par exemple une corde de guitare ?',
    bon: 'il vibre',
    faux: [
      ['il émet de la lumière', 'Un objet sonore n’est pas pour autant une source de lumière.'],
      ['il change d’état', 'La corde reste solide : elle bouge rapidement d’avant en arrière.'],
    ],
    why: 'Un son vient d’une vibration, transmise ensuite par le milieu.',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) return qcm(rng, rng.pick(CAS_N1), 25);
  const d = rng.pick(DOMAINES);
  const f = rng.pick(FREQUENCES[d]);
  const { answer, traps: t } = choice(
    rng,
    d,
    DOMAINES.filter((x) => x !== d).map((x) => ({ label: x, why: WHY_DOMAINE[x] })),
  );
  return {
    prompt: `Une vibration a une fréquence de ${fmtHz(f)}. Pour l’oreille humaine, c’est…`,
    answer,
    traps: t,
    hint: 'Compare la fréquence aux deux repères : 20 Hz et 20 000 Hz.',
    steps: ['L’oreille humaine perçoit environ de 20 Hz à 20 000 Hz.', WHY_DOMAINE[d], `C’est un **${d}**.`],
    targetSeconds: 30,
  };
};

const CAS_N2: readonly Cas[] = [
  {
    indice: 'Compare ce dont la lumière et le son ont besoin pour se propager.',
    question:
      'Un réveil sonne sous une cloche en verre. On retire peu à peu l’air à l’intérieur. Qu’observe-t-on à la fin ?',
    bon: 'on voit encore le réveil, mais on ne l’entend presque plus',
    faux: [
      [
        'on ne le voit plus, mais on l’entend toujours',
        'La lumière traverse le vide ; le son, lui, a besoin de matière.',
      ],
      ['on l’entend plus fort', 'Moins il y a de matière pour vibrer, plus le son a du mal à passer.'],
      ['rien ne change pour le son', 'Le son a besoin d’un milieu matériel : retirer l’air le gêne.'],
    ],
    why: 'La lumière se propage dans le vide, pas le son.',
  },
  {
    indice: 'Compare un sifflet et une grosse caisse : lequel vibre le plus vite ?',
    question: 'Un son a une fréquence plus élevée qu’un autre. Comment le perçoit-on ?',
    bon: 'plus aigu',
    faux: [
      ['plus grave', 'Un son grave correspond au contraire à une fréquence faible.'],
      ['plus lent à arriver', 'La fréquence décrit le nombre de vibrations par seconde, pas la durée du trajet.'],
      [
        'forcément plus fort',
        'La force d’un son (son intensité, exprimée en décibels) est une autre caractéristique que la fréquence.',
      ],
    ],
    why: 'Plus la fréquence est élevée, plus le son est aigu.',
  },
  {
    indice: 'Pense à ce qui abîme l’oreille : la force du son et la durée d’écoute.',
    question: 'Quel geste protège le mieux ton audition ?',
    bon: 'baisser le volume et faire des pauses quand le son est fort',
    faux: [
      [
        'monter le volume pour habituer les oreilles',
        'Plus le son est fort, plus il risque d’abîmer les cellules de l’oreille.',
      ],
      [
        'écouter fort, car les cellules de l’oreille se réparent vite',
        'Les sons forts peuvent détruire des cellules de l’oreille interne (les cellules ciliées), et c’est irréversible.',
      ],
      ['garder le casque toute la journée au maximum', 'Une exposition longue à des niveaux élevés abîme l’audition.'],
    ],
    why: 'Des niveaux sonores élevés détruisent de façon irréversible des cellules de l’oreille.',
  },
  {
    indice: 'Pense au mot « fréquent » : combien de fois quelque chose se répète-t-il ?',
    question: 'Que mesure la fréquence d’un son ?',
    bon: 'le nombre de vibrations par seconde',
    faux: [
      ['la distance parcourue en une seconde', 'C’est la vitesse du son.'],
      ['la force du son, en décibels', 'Les décibels expriment l’intensité sonore.'],
      ['la durée totale du son', 'La fréquence compte les vibrations dans chaque seconde.'],
    ],
    why: 'La fréquence s’exprime en hertz (Hz) : nombre de vibrations par seconde.',
  },
];

const associerFrequences = (rng: Rng): QuestionDraft => {
  const paires = DOMAINES.map((d) => [fmtHz(rng.pick(FREQUENCES[d])), d] as const);
  return {
    prompt: `Associe chaque fréquence à sa catégorie pour l’oreille humaine : ${paires
      .map((p) => p[0])
      .sort()
      .join(' ; ')}.`,
    answer: association(rng, paires),
    hint: 'Les deux repères sont 20 Hz et 20 000 Hz.',
    steps: [
      'En dessous de 20 Hz : infrason ; au-dessus de 20 000 Hz : ultrason.',
      paires.map(([f, d]) => `${f} : ${d}`).join(' ; ') + '.',
      'Chaque fréquence a **sa** catégorie.',
    ],
    targetSeconds: 50,
  };
};

const niveau2 = (rng: Rng): QuestionDraft =>
  rng.int(0, 2) === 0 ? associerFrequences(rng) : qcm(rng, rng.pick(CAS_N2), 40);

const niveau3 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const t = rng.int(2, 12);
    const d = VITESSE * t;
    return {
      prompt: `${DONNEE_AIR} Quelle distance, en mètres, le son parcourt-il en ${t} s ?`,
      answer: num(r(d), 'm'),
      traps: traps(r(d), [
        [r(VITESSE + t), 'Chaque seconde apporte la même distance : on multiplie.'],
        [r(VITESSE), 'C’est la distance parcourue en une seule seconde.'],
      ]),
      hint: 'Distance parcourue = distance en une seconde × nombre de secondes.',
      steps: ['d = v × t.', `d = ${VITESSE} × ${t}.`, `Le son parcourt **${d} m**.`],
      targetSeconds: 50,
    };
  }
  if (type === 1) {
    const t = rng.int(2, 12);
    const d = VITESSE * t;
    return {
      prompt: `${DONNEE_AIR} En combien de secondes le son parcourt-il ${d} m dans l’air ?`,
      answer: num(r(t), 's'),
      traps: traps(r(t), [
        [r(d * VITESSE), 'Cherche combien de fois 340 m tiennent dans la distance : on divise.'],
        [r(d - VITESSE), 'On ne soustrait pas : on divise la distance par la vitesse.'],
      ]),
      hint: 'Combien de fois la distance d’une seconde tient-elle dans la distance totale ?',
      steps: ['t = d ÷ v.', `t = ${d} ÷ ${VITESSE}.`, `La durée est **${t} s**.`],
      targetSeconds: 50,
    };
  }
  const d = rng.pick<Domaine>(['infrason', 'ultrason']);
  const bas = d === 'infrason';
  return {
    prompt: `Complète : une vibration de fréquence ${bas ? 'trop faible' : 'trop élevée'} pour être entendue par l’oreille humaine est un …, et la fréquence s’exprime en …`,
    answer: {
      kind: 'cloze',
      parts: ['C’est un ', ' ; la fréquence s’exprime en ', '.'],
      blanks: [
        { mode: 'text', accepted: [d] },
        { mode: 'text', accepted: ['hertz', 'Hz'] },
      ],
    },
    hint: 'Situe cette vibration par rapport à la plage entendue, puis pense à l’unité qui compte les vibrations par seconde.',
    steps: [
      WHY_DOMAINE[d],
      'L’unité de fréquence est le hertz, de symbole Hz.',
      `C’est un **${d}**, mesuré en **hertz**.`,
    ],
    targetSeconds: 45,
  };
};

const TERMES: readonly (readonly [string, string])[] = [
  ['infrason', 'vibration de fréquence trop faible pour être entendue'],
  ['ultrason', 'vibration de fréquence supérieure à environ 20 000 Hz'],
  ['hertz', 'unité de fréquence'],
  ['décibel', 'unité qui exprime l’intensité d’un son'],
  ['écho', 'répétition d’un son renvoyé par un obstacle'],
];

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 3);
  if (type === 0) {
    const paires = rng.shuffle(TERMES);
    return {
      prompt: `Associe chaque terme à sa définition : ${paires
        .map((p) => p[0])
        .sort()
        .join(' ; ')}.`,
      answer: association(rng, paires),
      hint: 'Sépare d’abord les unités des phénomènes.',
      steps: [
        'On distingue deux unités, deux domaines de fréquence et un phénomène de réflexion.',
        paires.map(([m, d]) => `${m} : ${d}`).join(' ; ') + '.',
        'Chaque terme a **sa** définition.',
      ],
      targetSeconds: 80,
    };
  }
  if (type === 1) {
    const d = rng.pick<Domaine>(['infrason', 'ultrason']);
    const f = rng.pick(FREQUENCES[d]);
    const autre = d === 'infrason' ? 'ultrason' : 'infrason';
    const { answer, traps: t } = saisie(
      [d, `un ${d}`, `${d}s`, d.replace('son', '-son'), `un ${d.replace('son', '-son')}`],
      [
        [autre, WHY_DOMAINE[d]],
        ['son audible', `Ce son sort de la plage 20 Hz – 20 000 Hz. ${WHY_DOMAINE[d]}`],
      ],
    );
    return {
      prompt: `Un capteur détecte une vibration de ${fmtHz(f)} qu’aucun élève n’entend. Quel nom donne-t-on à ce type de vibration ?`,
      answer,
      traps: t,
      hint: 'Est-elle sous le domaine audible ou au-dessus ?',
      steps: [`${fmtHz(f)} est hors de la plage entendue.`, WHY_DOMAINE[d], `C’est un **${d}**.`],
      targetSeconds: 40,
    };
  }
  if (type === 2) {
    const t = rng.int(1, 5) * 2;
    const d = (VITESSE * t) / 2;
    return {
      prompt: `${DONNEE_AIR} Tu cries face à une falaise et tu entends l’écho ${t} s plus tard. À quelle distance, en mètres, se trouve la falaise ?`,
      answer: num(r(d), 'm'),
      traps: traps(r(d), [
        [r(VITESSE * t), 'C’est le trajet aller-retour : la falaise est à la moitié.'],
        [r(VITESSE / 2), 'Tu as oublié de tenir compte de la durée mesurée.'],
      ]),
      hint: 'Pendant ce temps, le son va jusqu’à la falaise puis revient.',
      steps: [
        `Le son parcourt ${VITESSE} × ${t} = ${fmt(r(VITESSE * t))} m en aller-retour.`,
        'La falaise est à la moitié de ce trajet.',
        `${fmt(r(VITESSE * t))} ÷ 2 = **${fmt(r(d))} m**.`,
      ],
      targetSeconds: 80,
    };
  }
  const t = rng.int(2, 12);
  const d = VITESSE * t;
  return {
    prompt: `${DONNEE_AIR} Pendant un orage, tu vois un éclair puis tu entends le tonnerre ${t} s après (la lumière arrive presque immédiatement). À quelle distance, en mètres, l’éclair a-t-il eu lieu ?`,
    answer: num(r(d), 'm'),
    traps: traps(r(d), [
      [r(d / 2), 'Le tonnerre ne fait pas d’aller-retour : il vient de l’éclair jusqu’à toi.'],
      [r(300000 * t), 'La durée mesurée est celle du son, pas celle de la lumière.'],
    ]),
    hint: 'Quel signal met tout ce temps à venir : la lumière ou le son ?',
    steps: [
      'La lumière arrive presque tout de suite ; le son met un temps mesurable.',
      `d = v × t = ${VITESSE} × ${t}.`,
      `L’éclair a eu lieu à environ **${d} m**.`,
    ],
    targetSeconds: 80,
  };
};

const SIGNAUX = ['Signal A', 'Signal B', 'Signal C', 'Signal D', 'Signal E'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const nbAudibles = rng.int(1, 3);
    const hors = rng.shuffle([...FREQUENCES.infrason, ...FREQUENCES.ultrason]).slice(0, SIGNAUX.length - nbAudibles);
    const freqs = rng.shuffle([...rng.shuffle(FREQUENCES['son audible']).slice(0, nbAudibles), ...hors]);
    const lignes = freqs.map((f, i) => `${SIGNAUX[i] ?? 'Signal'} : ${fmtHz(f)}.`);
    return {
      prompt: 'Lis le relevé. Combien de ces signaux sonores l’oreille humaine peut-elle entendre ?',
      figure: { kind: 'document', title: 'Relevé d’un détecteur (données de l’exercice)', lines: lignes },
      answer: num(r(nbAudibles)),
      traps: traps(r(nbAudibles), [
        [r(SIGNAUX.length), 'Tous les signaux ne sont pas audibles : compare chacun à 20 Hz et 20 000 Hz.'],
        [r(SIGNAUX.length - nbAudibles), 'Tu as compté les signaux inaudibles.'],
      ]),
      hint: 'Garde seulement les fréquences comprises entre les deux repères.',
      steps: [
        'Plage entendue : environ 20 Hz à 20 000 Hz.',
        `Signaux audibles : ${freqs
          .filter((f) => domaine(f) === 'son audible')
          .map(fmtHz)
          .join(', ')}.`,
        `Il y en a **${nbAudibles}**.`,
      ],
      targetSeconds: 90,
    };
  }
  if (type === 1) {
    const t = rng.int(1, 6) * 2;
    const v = 1500;
    const d = (v * t) / 2;
    return {
      prompt: 'Lis le journal de bord. À quelle profondeur, en mètres, se trouve le fond sous le bateau ?',
      figure: {
        kind: 'document',
        title: 'Journal de bord (données de l’exercice)',
        lines: [
          'Le sonar du bateau envoie un ultrason vers le fond, à la verticale.',
          `L’écho revient au bateau ${t} s après l’émission.`,
          `Pour cet exercice, l’ultrason parcourt ${fmt(r(v))} m chaque seconde dans l’eau.`,
        ],
      },
      answer: num(r(d), 'm'),
      traps: traps(r(d), [
        [r(v * t), 'Cette distance est l’aller-retour : le fond est à la moitié.'],
        [r(VITESSE * t), 'Dans l’eau, utilise la vitesse indiquée dans le journal, pas celle de l’air.'],
      ]),
      hint: 'L’ultrason descend puis remonte.',
      steps: [
        `Trajet total : ${fmt(r(v))} × ${t} = ${fmt(r(v * t))} m.`,
        'La profondeur est la moitié de l’aller-retour.',
        `${fmt(r(v * t))} ÷ 2 = **${fmt(r(d))} m**.`,
      ],
      targetSeconds: 110,
    };
  }
  const a = rng.int(5, 9);
  const b = a - rng.int(1, 4);
  const rapproche = (a - b) * VITESSE;
  const premier = rng.pick(['À 18 h 02', 'À 18 h 04']);
  return {
    prompt: 'Lis les notes. De combien de mètres l’orage s’est-il rapproché entre les deux éclairs ?',
    figure: {
      kind: 'document',
      title: 'Notes d’un observateur (données de l’exercice)',
      lines: [
        `${premier} : tonnerre entendu ${a} s après l’éclair.`,
        `Deux minutes plus tard : tonnerre entendu ${b} s après l’éclair.`,
        DONNEE_AIR,
        'La lumière de l’éclair arrive presque immédiatement.',
      ],
    },
    answer: num(r(rapproche), 'm'),
    traps: traps(r(rapproche), [
      [r(a - b), 'C’est l’écart de durée en secondes : transforme-le en distance.'],
      [r(b * VITESSE), 'C’est la distance du second éclair, pas l’écart entre les deux.'],
      [r((a + b) * VITESSE), 'Il faut la différence des deux distances, pas leur somme.'],
    ]),
    hint: 'Calcule la distance de chaque éclair, puis compare.',
    steps: [
      `1er éclair : ${VITESSE} × ${a} = ${a * VITESSE} m.`,
      `2e éclair : ${VITESSE} × ${b} = ${b * VITESSE} m.`,
      `${maj('écart')} : ${a * VITESSE} − ${b * VITESSE} = **${rapproche} m**.`,
    ],
    targetSeconds: 120,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const propagationSon: Skill = {
  id: 'p5-propagation-son',
  title: 'La propagation du son',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un son est une vibration qui se propage dans un **milieu matériel** (gaz, liquide ou solide) : dans le **vide**, il ne passe pas.',
      'Dans l’air, il parcourt environ 340 m par seconde, donc distance = vitesse × durée : un tonnerre entendu 3 s après l’éclair vient d’environ 1 km.',
      'La **fréquence**, en **hertz** (Hz), compte les vibrations par seconde : on entend d’environ 20 à 20 000 Hz, en dessous ce sont des **infrasons**, au-dessus des **ultrasons** ; les sons trop forts peuvent abîmer l’oreille pour toujours.',
    ],
    ...referencesSignaux(
      'son-conditions',
      'son-distance',
      'son-frequence',
      'risques-auditifs',
      'son-milieu',
      'ondes-matiere',
      'ondes-lumiere',
      'vitesse-son',
      'orage',
      'echo',
      'sonar',
      'frequence',
      'grave-aigu',
      'audible',
      'infrason',
      'ultrason',
      'decibel',
      'cellules-ciliees',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
