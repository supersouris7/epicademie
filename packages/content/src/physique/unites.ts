import { choice, num, traps } from '../build.ts';
import { fmt, r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import { association, maj, saisie } from '../sciences/st/outils.ts';
import type { QuestionDraft, Skill } from '../types.ts';
import { referencesSignaux } from './donnees-signaux.ts';

// ——— Unités du Système international (5e) ; tableaux du BIPM ———

export interface Unite {
  readonly grandeur: string;
  /** Avec article, pour les phrases. */
  readonly la: string;
  readonly unite: string;
  readonly symbole: string;
}

export const UNITES: readonly Unite[] = [
  { grandeur: 'longueur', la: 'la longueur', unite: 'mètre', symbole: 'm' },
  { grandeur: 'masse', la: 'la masse', unite: 'kilogramme', symbole: 'kg' },
  { grandeur: 'durée', la: 'la durée', unite: 'seconde', symbole: 's' },
  { grandeur: 'intensité du courant', la: 'l’intensité du courant', unite: 'ampère', symbole: 'A' },
  { grandeur: 'température thermodynamique', la: 'la température thermodynamique', unite: 'kelvin', symbole: 'K' },
  { grandeur: 'fréquence', la: 'la fréquence', unite: 'hertz', symbole: 'Hz' },
  { grandeur: 'force', la: 'la force', unite: 'newton', symbole: 'N' },
  { grandeur: 'énergie', la: 'l’énergie', unite: 'joule', symbole: 'J' },
  { grandeur: 'puissance', la: 'la puissance', unite: 'watt', symbole: 'W' },
  { grandeur: 'tension électrique', la: 'la tension électrique', unite: 'volt', symbole: 'V' },
];
const BASE = UNITES.slice(0, 5);
const nomSymbole = (u: Unite) => `${u.unite} (${u.symbole})`;
/** Unité avec son article : « le mètre », « la seconde », « l’ampère ». */
const l = (u: Unite) => `${u.unite === 'ampère' ? 'l’' : u.unite === 'seconde' ? 'la ' : 'le '}${u.unite}`;
const WHY_UNITE = (u: Unite) => `${maj(l(u))} est l’unité utilisée pour ${u.la}.`;

const qcmUnite = (
  rng: Rng,
  u: Unite,
  faux: readonly { label: string; why: string }[],
  secondes: number,
  prompt = `Quelle est l’unité du Système international pour ${u.la} ?`,
) => {
  const { answer, traps: t } = choice(rng, nomSymbole(u), faux);
  return {
    prompt,
    answer,
    traps: t,
    hint: 'Pense à l’instrument qui mesure cette grandeur et à l’unité qu’il indique.',
    steps: [
      'Dans le Système international, chaque grandeur a son unité.',
      `${maj(u.la)} s’exprime avec ${l(u)}.`,
      `Réponse : **${nomSymbole(u)}**.`,
    ],
    targetSeconds: secondes,
  } satisfies QuestionDraft;
};

const niveau1 = (rng: Rng): QuestionDraft => {
  const trio = BASE.slice(0, 3);
  const u = rng.pick(trio);
  return qcmUnite(
    rng,
    u,
    trio.filter((x) => x !== u).map((x) => ({ label: nomSymbole(x), why: WHY_UNITE(x) })),
    20,
    `Pour mesurer ${u.la}, quelle unité de base utilise le Système international ?`,
  );
};

/** Unités proches mais qui ne sont pas l'unité SI de la grandeur. */
const PROCHES: Record<string, readonly { label: string; why: string }[]> = {
  longueur: [
    { label: 'kilomètre (km)', why: 'C’est un multiple du mètre ; l’unité du SI est le mètre.' },
    { label: 'centimètre (cm)', why: 'C’est un sous-multiple du mètre ; l’unité du SI est le mètre.' },
  ],
  masse: [
    { label: 'gramme (g)', why: 'Pour la masse, l’unité du SI est le kilogramme, même si son nom contient « kilo ».' },
    { label: 'newton (N)', why: 'Le newton mesure une force, pas une masse.' },
  ],
  durée: [
    { label: 'heure (h)', why: 'L’heure est utilisée, mais elle n’est pas l’unité du SI.' },
    { label: 'minute (min)', why: 'La minute est hors SI : 1 min = 60 s.' },
  ],
  'température thermodynamique': [
    { label: 'degré Celsius (°C)', why: 'Le degré Celsius est courant, mais l’unité de base demandée est le kelvin.' },
    { label: 'joule (J)', why: 'Le joule mesure une énergie.' },
  ],
};

const associerUnites = (rng: Rng, n: 3 | 5): QuestionDraft => {
  const paires = rng.shuffle(UNITES).slice(0, n);
  return {
    prompt: `Associe chaque grandeur au ${n === 3 ? 'nom' : 'symbole'} de son unité : ${paires
      .map((u) => u.grandeur)
      .sort()
      .join(' ; ')}.`,
    answer: association(
      rng,
      paires.map((u) => [u.grandeur, n === 3 ? u.unite : u.symbole] as const),
    ),
    hint: 'Commence par les grandeurs que tu mesures souvent.',
    steps: [
      'Chaque grandeur a une unité du Système international.',
      paires.map((u) => `${u.grandeur} : ${nomSymbole(u)}`).join(' ; ') + '.',
      'Chaque grandeur a **son** unité.',
    ],
    targetSeconds: n === 3 ? 50 : 80,
  };
};

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) return associerUnites(rng, 3);
  const u = rng.pick(UNITES.filter((x) => x.grandeur in PROCHES));
  const autre = rng.pick(UNITES.filter((x) => x !== u && !PROCHES[u.grandeur]?.some((p) => p.label === nomSymbole(x))));
  return qcmUnite(rng, u, [...(PROCHES[u.grandeur] ?? []), { label: nomSymbole(autre), why: WHY_UNITE(autre) }], 35);
};

const accents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const niveau3 = (rng: Rng): QuestionDraft => {
  const u = rng.pick(UNITES);
  if (rng.int(0, 1) === 0) {
    const { answer, traps: t } = saisie(
      [...new Set([u.unite, accents(u.unite), l(u)])],
      [
        [u.symbole, `${u.symbole} est le symbole : on demande le nom écrit en toutes lettres.`],
        ...UNITES.filter((x) => x !== u)
          .slice(0, 3)
          .map((x) => [x.unite, WHY_UNITE(x)] as const),
      ],
    );
    return {
      prompt: `Écris en toutes lettres le nom de l’unité SI utilisée pour ${u.la}.`,
      answer,
      traps: t,
      hint: 'Pense à ce qui est écrit après le nombre quand on mesure cette grandeur, puis écris le nom en entier.',
      steps: [`On cherche l’unité utilisée pour ${u.la}.`, `Son symbole est ${u.symbole}.`, `C’est **${l(u)}**.`],
      targetSeconds: 35,
    };
  }
  const autres = rng.shuffle(UNITES.filter((x) => x !== u)).slice(0, 3);
  const options = rng.shuffle([u.symbole, ...autres.map((x) => x.symbole)]);
  return {
    prompt: `Complète pour ${u.la} : donne le nom puis le symbole de son unité SI.`,
    answer: {
      kind: 'cloze',
      parts: ['Unité : ', ' ; symbole : ', '.'],
      blanks: [
        { mode: 'text', accepted: [u.unite, accents(u.unite)] },
        { mode: 'list', options, correct: options.indexOf(u.symbole) },
      ],
    },
    hint: 'Le symbole est court : une ou deux lettres.',
    steps: [`On cherche l’unité utilisée pour ${u.la}.`, WHY_UNITE(u), `C’est **${nomSymbole(u)}**.`],
    targetSeconds: 45,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 3);
  if (type === 0) return associerUnites(rng, 5);
  if (type === 1) {
    const enHeures = rng.pick([true, false]);
    const n = rng.int(2, enHeures ? 5 : 30);
    const reste = rng.int(1, 5) * 10;
    const res = enHeures ? n * 3600 : n * 60 + reste;
    return {
      prompt: enHeures
        ? `Convertis ${n} h dans l’unité SI de durée, la seconde.`
        : `Une expérience dure ${n} min ${reste} s. Exprime cette durée en secondes.`,
      answer: num(r(res), 's'),
      traps: traps(
        r(res),
        enHeures
          ? [
              [r(n * 60), 'Tu as trouvé des minutes : chaque minute vaut encore 60 secondes.'],
              [r(n * 100), 'Les durées ne se comptent pas de 100 en 100 : 1 h = 3 600 s.'],
            ]
          : [
              [r(n * 100 + reste), '1 min vaut 60 s, pas 100 s.'],
              [r(n + reste), 'Convertis d’abord les minutes en secondes avant d’additionner.'],
            ],
      ),
      hint: '1 min = 60 s et 1 h = 60 min.',
      steps: [
        enHeures ? '1 h = 60 min = 3 600 s.' : '1 min = 60 s.',
        enHeures ? `${n} × 3 600.` : `${n} × 60 + ${reste}.`,
        `La durée est **${fmt(r(res))} s**.`,
      ],
      targetSeconds: 70,
    };
  }
  if (type === 2) {
    const n = rng.int(2, 12);
    const t = rng.pick([true, false]);
    const res = n * 1000;
    return {
      prompt: t
        ? `Un camion transporte une charge de ${n} t. Exprime cette masse dans l’unité SI de masse.`
        : `Une cuve contient ${n} m³ d’eau. Combien de litres cela fait-il ? (1 m³ = 1 000 dm³ et 1 L = 1 dm³)`,
      answer: num(r(res), t ? 'kg' : 'L'),
      traps: traps(r(res), [
        [r(n * 100), 'Le facteur est 1 000, pas 100.'],
        [r(n), 'La valeur change quand on change d’unité.'],
      ]),
      hint: t ? 'Une tonne contient combien de kilogrammes ?' : 'Passe par les décimètres cubes.',
      steps: [
        t ? '1 t = 1 000 kg.' : '1 m³ = 1 000 dm³ = 1 000 L.',
        `${n} × 1 000.`,
        `On obtient **${fmt(r(res))} ${t ? 'kg' : 'L'}**.`,
      ],
      targetSeconds: 60,
    };
  }
  const u = rng.pick(BASE);
  const { answer, traps: t } = saisie(
    [
      u.grandeur,
      `la ${u.grandeur}`,
      `une ${u.grandeur}`,
      `l’${u.grandeur}`,
      accents(u.grandeur),
      ...(u.grandeur === 'longueur' ? ['distance', 'la distance', 'une distance'] : []),
      ...(u.grandeur === 'durée' ? ['temps', 'le temps'] : []),
      ...(u.grandeur === 'intensité du courant'
        ? [
            'intensité',
            'l’intensité',
            'courant',
            'le courant',
            'courant électrique',
            'le courant électrique',
            'intensité du courant électrique',
            'l’intensité du courant électrique',
          ]
        : []),
      ...(u.grandeur === 'température thermodynamique' ? ['température', 'la température'] : []),
    ],
    [
      [u.unite, 'C’est le nom de l’unité : on demande la grandeur mesurée.'],
      ...BASE.filter((x) => x !== u).map((x) => [x.grandeur, WHY_UNITE(x)] as const),
    ],
  );
  return {
    prompt: `L’unité de symbole « ${u.symbole} » fait partie des unités de base du SI. Quelle grandeur mesure-t-elle ?`,
    answer,
    traps: t,
    hint: 'Retrouve d’abord le nom de l’unité à partir de son symbole.',
    steps: [
      `${u.symbole} est le symbole de l’unité « ${u.unite} ».`,
      WHY_UNITE(u),
      `La grandeur est **${u.grandeur}**.`,
    ],
    targetSeconds: 45,
  };
};

/** Lignes mal écrites : symbole avec une majuscule fautive, un point ou un pluriel, ou sans espace. */
const FAUTES: readonly { readonly ligne: string; readonly why: string; readonly juste: string }[] = [
  { ligne: 'Masse du sac : 4 Kg', juste: '4 kg', why: 'Le symbole du kilogramme est « kg », avec un k minuscule.' },
  {
    ligne: 'Après 12 s. de course, il s’arrête',
    juste: 'Après 12 s de course',
    why: 'Un symbole n’est pas suivi d’un point au milieu d’une phrase.',
  },
  {
    ligne: 'La table mesure 2 ms de long',
    juste: '2 m de long',
    why: 'Un symbole reste invariable au pluriel ; « ms » désigne d’ailleurs la milliseconde.',
  },
  {
    ligne: 'Tension de la pile : 9 v',
    juste: '9 V',
    why: 'Le volt vient d’un nom propre : son symbole est une majuscule, V.',
  },
  { ligne: 'Hauteur du mur : 3M', juste: '3 m', why: 'Le mètre se note « m » minuscule, après une espace.' },
  { ligne: 'Puissance de la lampe : 8 w', juste: '8 W', why: 'Le watt vient d’un nom propre : son symbole est W.' },
];
const CORRECTES = [
  'Distance du stade : 250 m',
  'Masse du chariot : 15 kg',
  'Durée de la mesure : 40 s',
  'Intensité du courant : 2 A',
  'Température de l’échantillon : 290 K',
  'Fréquence du diapason : 440 Hz',
  'Énergie reçue : 60 J',
] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const type = rng.int(0, 2);
  if (type === 0) {
    const f = rng.pick(FAUTES);
    const lignes = rng.shuffle([f.ligne, ...rng.shuffle(CORRECTES).slice(0, 3)]);
    const bonne = `ligne ${lignes.indexOf(f.ligne) + 1}`;
    const { answer, traps: t } = choice(
      rng,
      bonne,
      lignes
        .map((_, i) => `ligne ${i + 1}`)
        .filter((x) => x !== bonne)
        .map((label) => ({
          label,
          why: 'Cette ligne est correctement écrite. Cherche une faute de majuscule, de point, de pluriel ou d’espace dans un symbole.',
        })),
    );
    return {
      prompt: 'Lis la fiche de mesures. Quelle ligne ne respecte pas les règles d’écriture du Système international ?',
      figure: { kind: 'document', title: 'Fiche de mesures (exercice)', lines: lignes },
      answer,
      traps: t,
      hint: 'Vérifie les majuscules, les points et les pluriels des symboles.',
      steps: [
        'On contrôle chaque symbole : casse, point, pluriel, espace.',
        `${f.why} On devrait lire « ${f.juste} ».`,
        `C’est la **${bonne}**.`,
      ],
      targetSeconds: 90,
    };
  }
  if (type === 1) {
    const v = rng.int(2, 8);
    const min = rng.int(2, 6);
    const d = v * min * 60;
    return {
      prompt: 'Lis la fiche. Calcule la vitesse moyenne de la coureuse en mètres par seconde.',
      figure: {
        kind: 'document',
        title: 'Fiche d’entraînement (données de l’exercice)',
        lines: [`Distance parcourue : ${d} m.`, `Durée de la course : ${min} min.`],
      },
      answer: num(r(v), 'm/s'),
      traps: traps(r(v), [
        [r(d / min), 'C’est une vitesse en mètres par minute : convertis la durée en secondes.'],
        [r(d * min), 'La vitesse s’obtient en divisant la distance par la durée.'],
      ]),
      hint: 'Pour des m/s, il faut une durée en secondes.',
      steps: [`${min} min = ${min * 60} s.`, 'v = d ÷ t.', `${d} ÷ ${min * 60} = **${v} m/s**.`],
      targetSeconds: 110,
    };
  }
  const grandeurs = rng.shuffle(UNITES).slice(0, 4);
  const cible = rng.pick(grandeurs);
  const lignes = grandeurs.map((u, i) => `Relevé ${i + 1} : ${rng.int(2, 90)} ${u.symbole}.`);
  const rang = grandeurs.indexOf(cible) + 1;
  const { answer, traps: t } = choice(
    rng,
    `Relevé ${rang}`,
    grandeurs
      .map((u, i) => ({ u, i }))
      .filter(({ u }) => u !== cible)
      .map(({ u, i }) => ({ label: `Relevé ${i + 1}`, why: WHY_UNITE(u) })),
  );
  return {
    prompt: `Lis le cahier de laboratoire. Quel relevé donne la valeur de ${cible.la} ?`,
    figure: { kind: 'document', title: 'Cahier de laboratoire (données de l’exercice)', lines: lignes },
    answer,
    traps: t,
    hint: 'Identifie le symbole d’unité de chaque relevé.',
    steps: [
      'Une grandeur s’exprime par un nombre suivi d’une unité.',
      `${maj(cible.la)} se mesure en ${nomSymbole(cible)}.`,
      `C’est le **Relevé ${rang}**.`,
    ],
    targetSeconds: 80,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const unitesSi: Skill = {
  id: 'p5-unites',
  title: 'Les unités du Système international',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Une **grandeur** se mesure : on écrit un nombre, une espace, puis une **unité** (12 s).',
      'Dans le **Système international** : mètre (m) pour la longueur, kilogramme (kg) pour la masse, seconde (s) pour la durée, ampère (A) pour le courant, kelvin (K) pour la température ; on utilise aussi le hertz (Hz) pour la fréquence, le newton (N) pour la force, le joule (J) pour l’énergie, le watt (W) pour la puissance et le volt (V) pour la tension.',
      'Un symbole ne prend ni point ni « s » au pluriel, et il commence par une majuscule seulement si le nom de l’unité vient d’un nom propre : 5 kg, 9 V.',
    ],
    ...referencesSignaux(
      'unites-c3',
      'valeur',
      'si',
      'metre',
      'kilogramme',
      'seconde',
      'ampere',
      'kelvin',
      'derivees',
      'energie-puissance',
      'puissance',
      'tension',
      'symboles',
      'majuscule',
      'espace',
      'hors-si',
      'heure',
      'litre',
      'tonne',
    ),
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
