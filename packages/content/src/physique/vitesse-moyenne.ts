import { choice, num, traps } from '../build.ts';
import { dec, div, fmt, isDecimal, mul, r, type Rational } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesMouvement } from './donnees-mouvement.ts';

// ——— Vitesse moyenne et relation entre vitesse, distance et durée (5e) ———

const MOBILES = ['Un cycliste', 'Un scooter', 'Un bateau', 'Un bus'] as const;

const niveau1 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 5) === 0) {
    const bon = 'on divise la distance parcourue par la durée';
    const { answer, traps: t } = choice(rng, bon, [
      {
        label: 'on multiplie la distance parcourue par la durée',
        why: 'Mettre plus de temps ne rend pas plus rapide : on divise.',
      },
      {
        label: 'on divise la durée par la distance parcourue',
        why: 'On obtiendrait un temps par kilomètre, pas une vitesse.',
      },
    ]);
    return {
      prompt: 'Comment calcule-t-on une vitesse moyenne ?',
      answer,
      traps: t,
      hint: 'Pense à « kilomètres par heure ».',
      steps: ['La vitesse moyenne dit la distance parcourue par unité de temps.', `Donc **${bon}**.`],
      targetSeconds: 25,
    };
  }
  const v = rng.int(10, 40);
  const mobile = rng.pick(MOBILES);
  const { answer, traps: t } = choice(rng, `${v} km/h`, [
    { label: `${v} km`, why: 'Des kilomètres mesurent une distance, pas une vitesse.' },
    { label: `${v} h`, why: 'Des heures mesurent une durée, pas une vitesse.' },
  ]);
  return {
    prompt: `${mobile} parcourt ${v} km en 1 heure. Quelle est sa vitesse moyenne ?`,
    answer,
    traps: t,
    hint: 'Une vitesse s’exprime avec une unité de distance « par » une unité de temps.',
    steps: [`${v} km sont parcourus en 1 h.`, `La vitesse moyenne est **${v} km/h**.`],
    targetSeconds: 20,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  const v = rng.int(2, 9);
  const t = rng.int(11, 20);
  const d = v * t;
  const { answer, traps: tr } = choice(rng, `${v} m/s`, [
    { label: `${d * t} m/s`, why: 'On ne multiplie pas la distance par la durée : on divise.' },
    { label: `${d - t} m/s`, why: 'On ne soustrait pas la durée à la distance : on divise.' },
    { label: `${d} m/s`, why: `${d} m est la distance totale, parcourue en ${t} s et non en 1 s.` },
  ]);
  return {
    prompt: `Une trottinette parcourt ${d} m en ${t} s. Quelle est sa vitesse moyenne ?`,
    answer,
    traps: tr,
    hint: 'Combien de mètres pour une seule seconde ?',
    steps: ['Vitesse moyenne = distance ÷ durée.', `${d} ÷ ${t} = ${v}, soit **${v} m/s**.`],
    targetSeconds: 40,
  };
};

const nombre = (value: Rational, unit: string, liste: readonly (readonly [Rational, string])[]) => ({
  answer: num(value, unit),
  traps: traps(
    value,
    liste.filter(([v]) => isDecimal(v)),
  ),
});

const niveau3 = (rng: Rng): QuestionDraft => {
  const v = rng.int(3, 25);
  const t = rng.int(2, 12);
  const d = v * t;
  const type = rng.int(0, 2);
  if (type === 0) {
    const [uD, uT, uV] = rng.pick([
      ['m', 's', 'm/s'],
      ['km', 'h', 'km/h'],
    ] as const);
    return {
      prompt: `Un mobile parcourt ${d} ${uD} en ${t} ${uT}. Calcule sa vitesse moyenne, en ${uV}.`,
      ...nombre(r(v), uV, [
        [r(d * t), 'On divise la distance par la durée, on ne les multiplie pas.'],
        [r(d - t), 'On divise la distance par la durée, on ne soustrait pas.'],
      ]),
      hint: 'Distance parcourue pour une seule unité de temps.',
      steps: ['v = d ÷ t.', `v = ${d} ÷ ${t} = **${v} ${uV}**.`],
      targetSeconds: 40,
    };
  }
  if (type === 1) {
    return {
      prompt: `Un chariot a un mouvement uniforme à ${v} m/s. Quelle distance, en mètres, parcourt-il en ${t} s ?`,
      ...nombre(r(d), 'm', [
        [r(v + t), 'Chaque seconde apporte la même distance : on multiplie.'],
        [div(r(v), r(t)), 'La distance augmente avec la durée : on multiplie, on ne divise pas.'],
      ]),
      hint: 'Que parcourt le chariot en 1 s ? Et en plusieurs secondes ?',
      steps: ['Mouvement uniforme : d = v × t.', `d = ${v} × ${t} = **${d} m**.`],
      targetSeconds: 45,
    };
  }
  return {
    prompt: `Une voiture a un mouvement uniforme à ${v} m/s. Combien de secondes lui faut-il pour parcourir ${d} m ?`,
    ...nombre(r(t), 's', [
      [r(d * v), 'Cherche combien de fois la distance parcourue en 1 s est contenue dans le total : on divise.'],
      [r(d - v), 'On ne soustrait pas la vitesse à la distance : on divise.'],
    ]),
    hint: 'Combien de fois la distance d’une seconde tient-elle dans la distance totale ?',
    steps: ['Mouvement uniforme : t = d ÷ v.', `t = ${d} ÷ ${v} = **${t} s**.`],
    targetSeconds: 45,
  };
};

/** Durées en minutes et leur écriture en heures (en centièmes). */
const MINUTES = [
  { min: 15, h: 25 },
  { min: 30, h: 50 },
  { min: 45, h: 75 },
  { min: 90, h: 150 },
] as const;

const niveau4 = (rng: Rng): QuestionDraft => {
  const duree = rng.pick(MINUTES);
  const h = dec(duree.h, 2);
  const v = rng.int(2, 8) * 4;
  const d = mul(r(v), h);
  if (rng.int(0, 1) === 0) {
    return {
      prompt: `Un cycliste parcourt ${fmt(d)} km en ${duree.min} min. Calcule sa vitesse moyenne, en km/h.`,
      ...nombre(r(v), 'km/h', [
        [div(d, r(duree.min)), 'Ce résultat est en km par minute : convertis d’abord la durée en heures.'],
        [mul(d, h), 'On divise la distance par la durée, même si la durée est inférieure à 1 h.'],
      ]),
      hint: 'Des km/h demandent une durée en heures : 60 min = 1 h.',
      steps: [
        `${duree.min} min = ${duree.min} ÷ 60 h = ${fmt(h)} h.`,
        'v = d ÷ t.',
        `v = ${fmt(d)} ÷ ${fmt(h)} = **${v} km/h**.`,
      ],
      targetSeconds: 80,
    };
  }
  return {
    prompt: `Un tramway a un mouvement uniforme à ${v} km/h. Quelle distance, en km, parcourt-il en ${duree.min} min ?`,
    ...nombre(d, 'km', [
      [r(v * duree.min), 'La vitesse est donnée par heure : convertis les minutes en heures avant de multiplier.'],
      [div(r(v), h), 'La distance s’obtient en multipliant la vitesse par la durée.'],
    ]),
    hint: 'Exprime la durée en heures, puis utilise la relation entre vitesse, distance et durée.',
    steps: [
      `${duree.min} min = ${fmt(h)} h.`,
      'Mouvement uniforme : d = v × t.',
      `d = ${v} × ${fmt(h)} = **${fmt(d)} km**.`,
    ],
    targetSeconds: 80,
  };
};

const ecrire = (heures: number) => {
  const h = Math.floor(heures);
  return heures === h ? `${h} h` : h === 0 ? '30 min' : `${h} h 30 min`;
};

/** Deux étapes et une pause de 30 min : durées en heures. */
const TRAJETS = [
  { t1: 1, t2: 0.5, total: 2 },
  { t1: 1, t2: 1.5, total: 3 },
  { t1: 2, t2: 1.5, total: 4 },
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const trajet = rng.pick(TRAJETS);
  const v = rng.int(5, 10) * 2;
  const total = v * trajet.total;
  // La première étape est plus rapide que la moyenne : la pause compte.
  const d1 = (v + rng.int(1, 3) * 2) * trajet.t1;
  const d2 = total - d1;
  const v1 = d1 / trajet.t1;
  const v2 = dec(Math.round((d2 / trajet.t2) * 100), 2);
  const moyenneDesVitesses = dec(Math.round(((v1 + d2 / trajet.t2) / 2) * 100), 2);
  return {
    prompt:
      'Lis le carnet de route. Quelle est la vitesse moyenne, en km/h, sur l’ensemble du trajet, pause comprise ?',
    figure: {
      kind: 'document',
      title: 'Carnet de route d’une randonnée à vélo (données de l’exercice)',
      lines: [
        `Étape 1 : ${d1} km parcourus en ${ecrire(trajet.t1)}.`,
        'Pause : 30 min, sans avancer.',
        `Étape 2 : ${d2} km parcourus en ${ecrire(trajet.t2)}.`,
      ],
    },
    ...nombre(r(v), 'km/h', [
      [
        moyenneDesVitesses,
        'Ne fais pas la moyenne des vitesses des étapes : divise la distance totale par la durée totale.',
      ],
      [
        dec(Math.round((total / (trajet.total - 0.5)) * 100), 2),
        'La question compte la pause : ajoute ses 30 min à la durée.',
      ],
      [dec(Math.round(v1 * 100), 2), 'C’est la vitesse moyenne de la seule étape 1.'],
      [v2, 'C’est la vitesse moyenne de la seule étape 2.'],
    ]),
    hint: 'Calcule d’abord la distance totale, puis la durée totale entre le départ et l’arrivée.',
    steps: [
      `Distance totale : ${d1} + ${d2} = ${total} km.`,
      `Durée totale : ${ecrire(trajet.t1)} + 30 min + ${ecrire(trajet.t2)} = ${trajet.total} h.`,
      `Vitesse moyenne : ${total} ÷ ${trajet.total} = **${v} km/h**.`,
    ],
    targetSeconds: 150,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const vitesseMoyenne: Skill = {
  id: 'p5-vitesse-moyenne',
  title: 'La vitesse moyenne',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **vitesse moyenne** est la distance parcourue divisée par la durée : v = d ÷ t. Par exemple, 100 m en 20 s donnent 5 m/s.',
      'Dans un mouvement uniforme, tu en déduis aussi d = v × t et t = d ÷ v. Accorde les unités : des km/h vont avec des km et des heures.',
    ],
    ...referencesMouvement('relation', 'vitesse-definition', 'vitesse-moyenne', 'caracteriser'),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
