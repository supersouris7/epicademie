import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice, type Option } from '../build.ts';
import { shuffled } from './kit.ts';
import { PREUVES, type Preuve } from './se-reperer-sources.ts';

/**
 * CM1, « Se repérer dans le temps » (lot hi-cm1-04) : compétence du programme d'histoire du cycle 3 travaillée
 * sur quatre notions. Les dates tirées au sort servent à s'entraîner ; les faits historiques sont ceux de
 * `PREUVES`, avec leur citation exacte. Les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

const PROG = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), histoire, classe de CM1';
const CREDIT = 'Texte écrit pour l’exercice.';

/** Élément d'indice connu (un indice hors liste serait un bug de génération). */
function at<T>(items: readonly T[], i: number): T {
  const item = items[i];
  if (item === undefined) throw new Error(`Indice hors liste : ${i}`);
  return item;
}

const ROMAINS: readonly (readonly [number, string])[] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** Chiffres romains de 1 à 39 (assez pour les siècles étudiés). */
export function toRoman(n: number): string {
  let rest = n;
  let out = '';
  for (const [value, letters] of ROMAINS) {
    while (rest >= value) {
      out += letters;
      rest -= value;
    }
  }
  return out;
}

/** Erreur d'écriture : on ajoute les lettres sans jamais retirer (IIII, VIIII). */
const additive = (n: number) => 'X'.repeat(Math.floor(n / 10)) + (n % 10 >= 5 ? 'V' : '') + 'I'.repeat(n % 5);

/** Siècle d'une année (avant comme après J.-C.) : le Ier va de 1 à 100. */
export const centuryOf = (year: number) => Math.ceil(year / 100);

const siecle = (c: number) => (c === 1 ? 'Ier' : `${toRoman(c)}e`);

/** Écritures acceptées d'un siècle saisi (romain ou arabe, avec ou sans « siècle »). */
function siecleForms(c: number): string[] {
  const roman = toRoman(c);
  const base =
    c === 1
      ? ['Ier', '1er', 'I', '1']
      : [`${roman}e`, `${c}e`, roman, String(c), `${roman}ème`, `${c}ème`, `${roman}eme`, `${c}eme`];
  return base.flatMap((f) => [f, `${f} siècle`, `${f} siecle`]);
}

/** Année écrite à la française : « 1 000 » n'est pas utilisé pour une date. */
const annee = (y: number) => (y < 0 ? `${-y} av. J.-C.` : `${y}`);
const apresJc = (y: number) => (y < 0 ? annee(y) : `${y} apr. J.-C.`);

const liste = (items: readonly string[]) => `${items.slice(0, -1).join(', ')} et ${items.at(-1) ?? ''}`;

const cite = (p: Preuve) => `La source dit : « ${p.quote} »`;

/** Termine une phrase par un point, sans le doubler après « J.-C. ». */
const point = (text: string) => (text.endsWith('.') ? text : `${text}.`);

const fin = (answer: string) =>
  answer.endsWith('.') ? `La réponse est donc : **${answer}**` : `La réponse est donc **${answer}**.`;

/** `n` entiers distincts, un par tranche (donc éloignés les uns des autres), dans un ordre au hasard. */
function distinctYears(rng: Rng, n: number, min: number, step: number): number[] {
  const slots = rng.shuffle(Array.from({ length: n + 2 }, (_, i) => i)).slice(0, n);
  return slots.map((s) => min + s * step + rng.int(0, step - 20));
}

interface QcmFait {
  readonly q: string;
  readonly a: string;
  readonly wrong: readonly Option[];
  readonly preuve: Preuve;
  readonly explain: string;
  readonly hint: string;
}

function qcm(rng: Rng, f: QcmFait): QuestionDraft {
  return {
    prompt: f.q,
    ...choice(rng, f.a, f.wrong),
    hint: f.hint,
    steps: [cite(f.preuve), f.explain, fin(f.a)],
    targetSeconds: 25,
  };
}

function association(
  rng: Rng,
  prompt: string,
  pairs: readonly (readonly [string, string])[],
  hint: string,
  explain: readonly Rich[],
): QuestionDraft {
  const left = pairs.map((p) => p[0]);
  const right = shuffled(
    rng,
    pairs.map((p) => p[1]),
  );
  return {
    prompt,
    answer: { kind: 'match', left, right, pairs: pairs.map((p) => right.indexOf(p[1])) },
    hint,
    steps: [...explain, `Voici les paires : **${pairs.map((p) => `${p[0]} → ${p[1]}`).join(' ; ')}**.`],
    targetSeconds: 45,
  };
}

interface Repere {
  readonly label: string;
  /** Valeur de tri (année, ou milieu de la période). */
  readonly t: number;
}

/** Remise en ordre, du plus ancien au plus récent. */
function ranger(rng: Rng, prompt: string, reperes: readonly Repere[], hint: string, how: string): QuestionDraft {
  const sorted = [...reperes].sort((a, b) => a.t - b.t).map((r) => r.label);
  const items = shuffled(rng, sorted);
  return {
    prompt,
    answer: { kind: 'order', items, correct: sorted.map((l) => items.indexOf(l)) },
    hint,
    steps: [how, ...sorted.map((l, i) => point(`${i + 1}. ${l}`)), `En premier vient **${sorted[0] ?? ''}**`],
    targetSeconds: 45,
  };
}

/** Saisie d'un nombre, avec ses erreurs typiques. */
function saisie(
  prompt: string,
  accepted: readonly string[],
  traps: readonly (readonly [string, string])[],
  hint: string,
  steps: readonly Rich[],
): QuestionDraft {
  const right = new Set(accepted.map((a) => a.toLowerCase()));
  const out: Trap[] = [];
  const seen = new Set<string>();
  for (const [text, why] of traps) {
    const key = text.toLowerCase();
    if (right.has(key) || seen.has(key)) continue;
    seen.add(key);
    out.push({ text, why });
  }
  return { prompt, answer: { kind: 'text', accepted }, traps: out, hint, steps, targetSeconds: 40 };
}

type Generator = (rng: Rng) => QuestionDraft;

function skill(
  id: string,
  title: string,
  memo: readonly Rich[],
  preuves: readonly Preuve[],
  levels: readonly [Generator, Generator, Generator, Generator, Generator],
): Skill {
  return {
    id,
    title,
    levels: 5,
    version: 1,
    lesson: { memo, source: PROG, sources: [...new Set(['cycle3-2020', ...preuves.map((p) => p.source)])] },
    generate: (rng: Rng, level: Level) => at(levels, level - 1)(rng),
  };
}

// ——— Notion 1 : siècles et chiffres romains ———

const LETTRES = 'I vaut 1, V vaut 5 et X vaut 10.';
const AJOUTER = 'Petite lettre après : on ajoute (VI = 6). Petite lettre avant : on enlève (IV = 4).';
const BORNES = 'Le Ier siècle va de l’année 1 à 100. Le IIe va de 101 à 200, et ainsi de suite.';

const FAITS_SIECLE: readonly QcmFait[] = [
  {
    q: 'Combien d’années dure un siècle ?',
    a: '100 ans',
    wrong: [
      { label: '10 ans', why: '10 ans, c’est beaucoup plus court : un siècle dure 100 ans.' },
      { label: '1 000 ans', why: '1 000 ans, c’est un millénaire, soit dix siècles.' },
    ],
    preuve: PREUVES.siecle,
    explain: 'Un siècle, c’est une durée de cent ans.',
    hint: 'Pense au mot « cent ».',
  },
  {
    q: 'En chiffres romains, que vaut la lettre X ?',
    a: '10',
    wrong: [
      { label: '1', why: 'Le chiffre 1 s’écrit I.' },
      { label: '5', why: 'Le chiffre 5 s’écrit V.' },
    ],
    preuve: PREUVES.lettres,
    explain: LETTRES,
    hint: 'Il y a trois lettres à connaître : I, V et X. X est la plus grande.',
  },
  {
    q: 'En chiffres romains, que vaut la lettre V ?',
    a: '5',
    wrong: [
      { label: '1', why: 'Le chiffre 1 s’écrit I.' },
      { label: '10', why: 'Le nombre 10 s’écrit X.' },
    ],
    preuve: PREUVES.lettres,
    explain: LETTRES,
    hint: 'Le V est entre le I et le X.',
  },
  {
    q: 'Avec quels chiffres écrit-on d’habitude le numéro d’un siècle ?',
    a: 'des chiffres romains',
    wrong: [
      { label: 'des notes de musique', why: 'Les notes servent à écrire la musique, pas les siècles.' },
      { label: 'des signes de ponctuation', why: 'La ponctuation sert à couper les phrases.' },
    ],
    preuve: PREUVES.siecleRomain,
    explain: 'On écrit par exemple « le XXe siècle ».',
    hint: 'Pense à la façon dont on écrit « XXe ».',
  },
];

const NOMBRES_ROMAINS = [4, 6, 9, 11, 14, 16] as const;

const siecles1: Generator = (rng) => qcm(rng, rng.pick(FAITS_SIECLE));

const siecles2: Generator = (rng) => {
  if (rng.int(0, 1) === 0) {
    const nombres = rng.shuffle([...NOMBRES_ROMAINS]).slice(0, 3);
    return association(
      rng,
      `Associe ces nombres romains à leur valeur : ${liste(nombres.map(toRoman))}.`,
      nombres.map((n) => [toRoman(n), String(n)] as const),
      'Regarde si la petite lettre est avant ou après la grande.',
      [LETTRES, AJOUTER],
    );
  }
  const n = rng.pick(NOMBRES_ROMAINS);
  const voisins = [n - 2, n + 2, n + 1, n - 1]
    .filter((v) => v > 0)
    .map((v) => ({ label: toRoman(v), why: `${toRoman(v)} vaut ${v}, pas ${n}.` }));
  const empile = {
    label: additive(n),
    why: 'On n’empile pas les I ainsi : on enlève avec une petite lettre placée avant.',
  };
  const wrong: Option[] = [empile, ...voisins]
    .filter((o, i, all) => o.label !== toRoman(n) && all.findIndex((x) => x.label === o.label) === i)
    .slice(0, 3);
  return {
    prompt: `Attention aux pièges ! Comment s’écrit ${n} en chiffres romains ?`,
    ...choice(rng, toRoman(n), wrong),
    hint: 'Cherche la grande lettre la plus proche, puis ajoute ou enlève.',
    steps: [cite(PREUVES.lettres), AJOUTER, fin(toRoman(n))],
    targetSeconds: 30,
  };
};

const siecles3: Generator = (rng) => {
  const n = rng.int(2, 21);
  const r = toRoman(n);
  if (rng.int(0, 1) === 0) {
    return saisie(
      `Écris ${n} en chiffres romains.`,
      [r],
      [
        [additive(n), 'Ne répète pas la même lettre quatre fois : place un I avant la grande lettre.'],
        [toRoman(n + 1), `Tu as écrit ${n + 1}. Il en faut un de moins.`],
        [toRoman(n - 1), `Tu as écrit ${n - 1}. Il en manque un.`],
      ],
      'Découpe le nombre avec des 10, des 5 et des 1.',
      [LETTRES, AJOUTER, fin(r)],
    );
  }
  return saisie(
    `Le nombre romain ${r} : écris-le avec nos chiffres habituels.`,
    [String(n)],
    [
      [String(n + 1), 'Tu as compté un de trop. Relis lettre par lettre.'],
      [String(n - 1), 'Il t’en manque un. Relis lettre par lettre.'],
      [String(n + 2), 'Une petite lettre placée avant une grande s’enlève.'],
    ],
    'Lis de gauche à droite : ajoute, ou enlève si la petite lettre est devant.',
    [LETTRES, AJOUTER, fin(String(n))],
  );
};

const siecles4: Generator = (rng) => {
  // Une fois sur trois, une année « ronde » : le piège classique.
  const year = rng.int(0, 2) === 0 ? rng.int(2, 20) * 100 : rng.int(101, 2000);
  const c = centuryOf(year);
  const traps = [c - 1, c + 1].flatMap((wrong) => {
    const why =
      wrong < c
        ? 'Tu as gardé un siècle de moins. Les années 1 à 100 forment déjà le Ier siècle.'
        : year % 100 === 0
          ? 'C’est un siècle trop loin. Une année qui finit par 00 termine son siècle.'
          : 'C’est un siècle trop loin. Compte à partir du Ier siècle : années 1 à 100.';
    return [siecle(wrong), `${wrong}e`, `${siecle(wrong)} siècle`].map((t) => [t, why] as const);
  });
  return saisie(
    `Sans proposition : dans quel siècle se trouve l’année ${year} ?`,
    siecleForms(c),
    traps,
    'Compte les centaines, puis demande-toi si l’année finit par 00.',
    [
      cite(PREUVES.bornes),
      BORNES,
      `L’année ${year} est entre ${(c - 1) * 100 + 1} et ${c * 100}.`,
      fin(`${siecle(c)} siècle`),
    ],
  );
};

const siecles5: Generator = (rng) => {
  const years = distinctYears(rng, 4, 501, 200);
  const objets = ['La clé', 'Le vase', 'La pièce', 'La lampe'];
  const k = rng.int(0, 3);
  const year = at(years, k);
  const c = centuryOf(year);
  return {
    prompt: `Lis le texte, puis réponds. Quel objet date du ${siecle(c)} siècle ?`,
    figure: {
      kind: 'document',
      title: 'La vitrine du petit musée',
      lines: objets.map((o, i) => `${o} : fabrication en ${years[i]}.`),
      credit: CREDIT,
    },
    ...choice(
      rng,
      at(objets, k),
      objets.flatMap((label, i) =>
        i === k ? [] : [{ label, why: `${label} date du ${siecle(centuryOf(at(years, i)))} siècle (${years[i]}).` }],
      ),
    ),
    hint: 'Calcule le siècle de chaque date, ligne par ligne.',
    steps: [
      cite(PREUVES.bornes),
      BORNES,
      `Le ${siecle(c)} siècle va de ${(c - 1) * 100 + 1} à ${c * 100}.`,
      fin(at(objets, k)),
    ],
    targetSeconds: 60,
  };
};

// ——— Notion 2 : la frise chronologique ———

const SENS = 'Sur nos frises, le temps avance de haut en bas : en haut, c’est le plus ancien.';

const FAITS_FRISE: readonly QcmFait[] = [
  {
    q: 'À quoi sert une frise chronologique ?',
    a: 'à représenter le temps',
    wrong: [
      { label: 'à mesurer une distance', why: 'Pour une distance, on utilise une règle ou l’échelle d’une carte.' },
      { label: 'à donner la météo', why: 'La météo annonce le temps qu’il fait, pas le temps qui passe.' },
    ],
    preuve: PREUVES.frise,
    explain: 'La frise chronologique est un dessin qui montre le temps.',
    hint: 'Le mot « chronologique » parle du temps.',
  },
  {
    q: 'Quel mot désigne une durée de mille ans ?',
    a: 'un millénaire',
    wrong: [
      { label: 'un siècle', why: 'Un siècle dure cent ans.' },
      { label: 'une semaine', why: 'Une semaine ne dure que sept jours.' },
    ],
    preuve: PREUVES.millenaire,
    explain: 'Un millénaire, c’est mille ans.',
    hint: 'Le début du mot ressemble à « mille ».',
  },
  {
    q: 'Quel mot désigne une durée de cent ans ?',
    a: 'un siècle',
    wrong: [
      { label: 'un millénaire', why: 'Un millénaire dure mille ans.' },
      { label: 'un mois', why: 'Un mois dure quelques semaines.' },
    ],
    preuve: PREUVES.siecle,
    explain: 'Un siècle, c’est cent ans.',
    hint: 'Ce mot sert aussi à numéroter les époques : le XXe…',
  },
];

const LETTRES_FRISE = ['A', 'B', 'C', 'D'] as const;

/** Frise dessinée en texte : repères donnés dans l'ordre du temps. */
const frise = (title: string, marks: readonly string[]) => ({
  kind: 'document' as const,
  title,
  lines: ['Le temps avance de haut en bas sur cette frise.', ...marks.map((m) => `│ ${m}`), '▼'],
  credit: CREDIT,
});

const frise1: Generator = (rng) => qcm(rng, rng.pick(FAITS_FRISE));

const frise2: Generator = (rng) => {
  if (rng.int(0, 2) === 0) {
    return association(
      rng,
      'Associe chaque mot du temps à ce qui lui correspond.',
      [
        ['Siècle', 'cent ans'],
        ['Millénaire', 'mille ans'],
        ['Frise chronologique', 'dessin du temps'],
      ],
      'Cherche d’abord les deux durées.',
      [cite(PREUVES.siecle), cite(PREUVES.millenaire)],
    );
  }
  const start = rng.int(2, 8) * 100;
  const years = LETTRES_FRISE.map((_, i) => start + i * 300);
  const k = rng.int(0, 3);
  const year = at(years, k);
  return {
    prompt: `Attention aux pièges ! Sur la frise, quel repère est placé entre ${year - 100} et ${year + 100} ?`,
    figure: frise(
      'Frise des repères',
      LETTRES_FRISE.map((l, i) => `${years[i]} : repère ${l}`),
    ),
    ...choice(
      rng,
      `le repère ${LETTRES_FRISE[k]}`,
      LETTRES_FRISE.flatMap((l, i) =>
        i === k ? [] : [{ label: `le repère ${l}`, why: `Le repère ${l} est en ${years[i]}, hors de l’intervalle.` }],
      ),
    ),
    hint: 'Lis le nombre écrit devant chaque repère.',
    steps: [SENS, `On cherche une année entre ${year - 100} et ${year + 100}.`, fin(`le repère ${LETTRES_FRISE[k]}`)],
    targetSeconds: 30,
  };
};

const frise3: Generator = (rng) => {
  if (rng.int(0, 1) === 0) {
    const years = distinctYears(rng, 4, 101, 300);
    return ranger(
      rng,
      `Place ces années sur la frise, de la plus ancienne à la plus récente : ${liste(years.map(String))}.`,
      years.map((y) => ({ label: String(y), t: y })),
      'Cherche d’abord le plus petit nombre.',
      SENS,
    );
  }
  const start = rng.int(1, 14) * 100;
  const hole = rng.int(1, 3);
  const years = Array.from({ length: 5 }, (_, i) => start + i * 100);
  const answer = at(years, hole);
  const q = saisie(
    `Complète la frise : quelle année se cache sous l’étoile (frise de ${start} à ${start + 400}) ?`,
    [String(answer)],
    [
      [String(answer - 100), 'C’est la graduation juste avant l’étoile. Avance d’un cran.'],
      [String(answer + 100), 'C’est la graduation juste après l’étoile. Recule d’un cran.'],
      [String(answer - 90), 'Ici, on avance de 100 en 100, pas de 10 en 10.'],
    ],
    'Regarde de combien on avance d’une graduation à la suivante.',
    [SENS, 'On avance de 100 ans à chaque graduation.', fin(String(answer))],
  );
  return {
    ...q,
    figure: frise(
      'Frise graduée',
      years.map((y, i) => (i === hole ? '★' : String(y))),
    ),
  };
};

const frise4: Generator = (rng) => {
  const a = rng.int(2, 9) * 100 + rng.int(0, 1) * 50;
  const b = a + rng.int(3, 9) * 100;
  const gap = b - a;
  if (rng.int(0, 1) === 0) {
    return saisie(
      `Sans proposition : sur la frise, combien d’années séparent ${a} et ${b} ?`,
      [String(gap), `${gap} ans`],
      [
        [String(a + b), 'Tu as ajouté. Pour une durée, on soustrait la date ancienne de la date récente.'],
        [String(gap / 100), 'Tu as compté les siècles. La question demande des années.'],
        [String(gap + 100), 'Cent ans de trop : vérifie ta soustraction.'],
      ],
      'Pars de la date la plus ancienne et avance jusqu’à l’autre.',
      ['Durée = date récente − date ancienne.', `${b} − ${a} = ${gap}.`, fin(`${gap} ans`)],
    );
  }
  const siecles = gap / 100;
  return saisie(
    `Sans proposition : combien de siècles s’écoulent entre ${a} et ${b} ?`,
    [String(siecles), `${siecles} siècles`],
    [
      [String(gap), 'Ce sont des années. Un siècle vaut 100 ans.'],
      [String(siecles + 1), 'Tu as compté les graduations au lieu des intervalles.'],
      [String(siecles - 1), 'Il manque un siècle : compte chaque bond de 100 ans.'],
    ],
    'Avance de 100 ans en 100 ans et compte les bonds.',
    [cite(PREUVES.siecle), `${b} − ${a} = ${gap} ans, soit ${siecles} fois 100 ans.`, fin(`${siecles} siècles`)],
  );
};

const FRISE_PROGRAMME = [
  { year: 800, text: 'Charlemagne est couronné empereur', preuve: PREUVES.charlemagne },
  { year: 1789, text: 'La Révolution commence', preuve: PREUVES.revolution },
  { year: 1804, text: 'Napoléon est proclamé empereur des Français', preuve: PREUVES.napoleon },
] as const;

const frise5: Generator = (rng) => {
  const figure = frise(
    'La frise de la classe',
    FRISE_PROGRAMME.map((e) => `${e.year} : ${e.text}`),
  );
  if (rng.int(0, 1) === 0) {
    const [i, j] = rng.pick([
      [0, 1],
      [0, 2],
      [1, 2],
    ] as const);
    const from = FRISE_PROGRAMME[i];
    const to = FRISE_PROGRAMME[j];
    const gap = to.year - from.year;
    return {
      prompt: `Lis la frise, puis réponds. Combien d’années séparent les repères ${from.year} et ${to.year} ?`,
      figure,
      ...choice(rng, `${gap} ans`, [
        { label: `${gap + 100} ans`, why: 'Un siècle de trop : refais la soustraction.' },
        { label: `${gap + 10} ans`, why: 'Dix ans de trop : attention à la retenue.' },
        { label: `${from.year + to.year} ans`, why: 'Tu as ajouté les dates. Il faut les soustraire.' },
      ]),
      hint: 'Soustrais la date la plus ancienne de la plus récente.',
      steps: [cite(from.preuve), cite(to.preuve), `${to.year} − ${from.year} = ${gap}.`, fin(`${gap} ans`)],
      targetSeconds: 60,
    };
  }
  const k = rng.int(0, 2);
  const e = at(FRISE_PROGRAMME, k);
  const c = centuryOf(e.year);
  return {
    prompt: `Lis la frise, puis réponds. Quel événement se place au ${siecle(c)} siècle ?`,
    figure,
    ...choice(
      rng,
      e.text,
      FRISE_PROGRAMME.flatMap((o, i) =>
        i === k
          ? []
          : [{ label: o.text, why: `Cet événement date de ${o.year}, au ${siecle(centuryOf(o.year))} siècle.` }],
      ),
    ),
    hint: 'Trouve le siècle de chaque année de la frise.',
    steps: [cite(e.preuve), `L’année ${e.year} est au ${siecle(c)} siècle.`, fin(e.text)],
    targetSeconds: 60,
  };
};

// ——— Notion 3 : avant et après J.-C. ———

const REBOURS = 'Avant J.-C., plus le nombre est grand, plus la date est ancienne.';
const DEPART = 'Après J.-C., plus le nombre est grand, plus la date est récente.';

const FAITS_JC: readonly QcmFait[] = [
  {
    q: 'Que veut dire « av. J.-C. » ?',
    a: 'avant Jésus-Christ',
    wrong: [
      { label: 'après Jésus-Christ', why: '« Après » s’abrège « apr. », et non « av. ».' },
      { label: 'avant Jules César', why: 'Les lettres J.-C. désignent Jésus-Christ, pas Jules César.' },
    ],
    preuve: PREUVES.jc,
    explain: '« av. » veut dire avant, et J.-C. désigne Jésus-Christ.',
    hint: '« av. » est le début d’un petit mot qui parle du temps.',
  },
  {
    q: 'À quel moment commence l’ère chrétienne ?',
    a: 'à la date présumée de la naissance de Jésus-Christ',
    wrong: [
      {
        label: 'au couronnement de Charlemagne',
        why: 'Charlemagne est couronné en 800 : l’ère a déjà commencé.',
      },
      { label: 'au début de la Révolution', why: 'La Révolution commence en 1789, bien après le début de l’ère.' },
    ],
    preuve: PREUVES.ere,
    explain: 'C’est le point de départ du compte des années. « Présumée » veut dire supposée.',
    hint: 'Pense à ce que veut dire le mot « chrétienne ».',
  },
  {
    q: 'Quelle expression veut dire la même chose que « avant Jésus-Christ » ?',
    a: 'avant notre ère',
    wrong: [
      { label: 'de notre ère', why: '« De notre ère » désigne le temps après le point de départ.' },
      { label: 'à notre époque', why: '« À notre époque » veut dire aujourd’hui.' },
    ],
    preuve: PREUVES.jc,
    explain: 'On peut dire « avant J.-C. » ou « avant notre ère ».',
    hint: 'Cherche l’expression qui parle du temps d’avant le point de départ.',
  },
];

/** Deux dates avant et deux après J.-C., toutes distinctes. */
function datesMelangees(rng: Rng): number[] {
  const avant = distinctYears(rng, 2, 100, 200).map((y) => -y);
  return rng.shuffle([...avant, ...distinctYears(rng, 2, 100, 200)]);
}

const jc1: Generator = (rng) => qcm(rng, rng.pick(FAITS_JC));

const jc2: Generator = (rng) => {
  const dates = datesMelangees(rng);
  const oldest = Math.min(...dates);
  return {
    prompt: 'Attention aux pièges ! Quelle date est la plus ancienne ?',
    ...choice(
      rng,
      apresJc(oldest),
      dates
        .filter((d) => d !== oldest)
        .map((d) => ({
          label: apresJc(d),
          why:
            d < 0 ? `${REBOURS} Une autre date est encore plus ancienne.` : 'Une date avant J.-C. est plus ancienne.',
        })),
    ),
    hint: 'Regarde d’abord les dates avant J.-C. Elles se comptent à rebours.',
    steps: [cite(PREUVES.ere), REBOURS, fin(apresJc(oldest))],
    targetSeconds: 30,
  };
};

const jc3: Generator = (rng) => {
  const dates = datesMelangees(rng);
  return ranger(
    rng,
    point(`Range ces dates, de la plus ancienne à la plus récente : ${liste(dates.map(apresJc))}`),
    dates.map((d) => ({ label: apresJc(d), t: d })),
    'Place d’abord toutes les dates avant J.-C.',
    `${cite(PREUVES.ere)}. ${REBOURS} ${DEPART}`,
  );
};

const jc4: Generator = (rng) => {
  if (rng.int(0, 1) === 0) {
    const recent = rng.int(1, 4) * 100;
    const ancien = recent + rng.int(1, 5) * 100 + 50;
    const gap = ancien - recent;
    return saisie(
      `Sans aide : combien d’années séparent ${ancien} av. J.-C. et ${recent} av. J.-C. ?`,
      [String(gap), `${gap} ans`],
      [
        [String(ancien + recent), 'Les deux dates sont du même côté : on soustrait, on n’ajoute pas.'],
        [String(gap + 100), 'Cent ans de trop : refais la soustraction.'],
        [String(ancien), 'C’est la date elle-même. Cherche la durée entre les deux.'],
      ],
      'Les deux dates sont avant J.-C. Cherche l’écart entre les deux nombres.',
      [REBOURS, `${ancien} − ${recent} = ${gap}.`, fin(`${gap} ans`)],
    );
  }
  const year = rng.int(0, 2) === 0 ? rng.int(2, 9) * 100 : rng.int(101, 999);
  const c = centuryOf(year);
  const accepted = siecleForms(c).flatMap((f) => [f, `${f} av. J.-C.`, `${f} avant J.-C.`]);
  return saisie(
    `Sans aide : dans quel siècle avant J.-C. se trouve l’année ${year} av. J.-C. ?`,
    accepted,
    [c - 1, c + 1].flatMap((w) =>
      [siecle(w), `${w}e`, `${siecle(w)} siècle`, `${siecle(w)} siècle av. J.-C.`].map(
        (t) => [t, 'Ce n’est pas ce siècle. Avant J.-C., le Ier va de 100 à 1, le IIe de 200 à 101.'] as const,
      ),
    ),
    'Avant J.-C., les siècles se comptent aussi à partir du point de départ.',
    [
      cite(PREUVES.siecle),
      `Le ${siecle(c)} siècle av. J.-C. va de ${c * 100} à ${(c - 1) * 100 + 1} av. J.-C.`,
      fin(`${siecle(c)} siècle av. J.-C.`),
    ],
  );
};

const jc5: Generator = (rng) => {
  const dates = datesMelangees(rng);
  const objets = ['L’amphore', 'La statue', 'Le bijou', 'La tablette'];
  const mode = rng.pick(['ancien', 'recent', 'soie'] as const);
  const lines = [
    'Au musée, la guide présente quatre objets imaginaires.',
    ...objets.map((o, i) => point(`${o} date de ${apresJc(at(dates, i))}`)),
  ];
  if (mode === 'soie') {
    const year = rng.int(101, 200);
    return {
      prompt: 'Lis le texte, puis réponds. Quelle date est dans le siècle où commence ce commerce ?',
      figure: {
        kind: 'document',
        title: 'La route entre Rome et la Chine',
        lines: [
          'Un commerce régulier relie Rome et la Chine.',
          'Il existe depuis le IIe siècle avant J.-C.',
          'Des marchandises voyagent très loin.',
        ],
        credit: 'Texte écrit pour l’exercice, d’après le programme du cycle 3.',
      },
      ...choice(rng, `${year} av. J.-C.`, [
        { label: `${year} apr. J.-C.`, why: 'Cette date est après J.-C. Le texte dit avant J.-C.' },
        { label: `${year - 100} av. J.-C.`, why: 'Cette date est au Ier siècle avant J.-C.' },
        { label: `${year + 100} av. J.-C.`, why: 'Cette date est au IIIe siècle avant J.-C.' },
      ]),
      hint: 'Repère les mots « avant J.-C. » et le numéro du siècle.',
      steps: [cite(PREUVES.routeSoie), 'Le IIe siècle av. J.-C. va de 200 à 101 av. J.-C.', fin(`${year} av. J.-C.`)],
      targetSeconds: 60,
    };
  }
  const target = mode === 'ancien' ? Math.min(...dates) : Math.max(...dates);
  const k = dates.indexOf(target);
  return {
    prompt: `Lis le texte, puis réponds. Quel objet est le plus ${mode === 'ancien' ? 'ancien' : 'récent'} ?`,
    figure: { kind: 'document', title: 'La visite au musée', lines, credit: CREDIT },
    ...choice(
      rng,
      at(objets, k),
      objets.flatMap((label, i) =>
        i === k
          ? []
          : [{ label, why: `${point(`${label} date de ${apresJc(at(dates, i))}`)} Compare avec les autres dates.` }],
      ),
    ),
    hint: 'Sépare les dates avant J.-C. et les dates après J.-C.',
    steps: [REBOURS, DEPART, fin(at(objets, k))],
    targetSeconds: 60,
  };
};

// ——— Notion 4 : ordonner des événements ———

interface Evenement extends Repere {
  /** Date écrite comme dans le programme. */
  readonly date: string;
  readonly preuve: Preuve;
}

const MIGRATIONS: Evenement = {
  label: 'Des peuples venus de l’est commencent à s’installer dans l’empire romain',
  date: 'à partir du IVe siècle',
  t: 350,
  preuve: PREUVES.migrations,
};
const CHUTE: Evenement = {
  label: 'L’empire romain d’Occident s’effondre',
  date: 'vers la fin du Ve siècle',
  t: 480,
  preuve: PREUVES.migrations,
};
const CHARLEMAGNE: Evenement = {
  label: 'Charlemagne est couronné empereur',
  date: 'en 800',
  t: 800,
  preuve: PREUVES.charlemagne,
};
const LOUIS_IX: Evenement = {
  label: 'Louis IX est roi',
  date: 'au XIIIe siècle',
  t: 1250,
  preuve: PREUVES.louisIx,
};
const REVOLUTION: Evenement = {
  label: 'La Révolution commence',
  date: 'en 1789',
  t: 1789,
  preuve: PREUVES.revolution,
};
const NAPOLEON: Evenement = {
  label: 'Napoléon est proclamé empereur des Français',
  date: 'en 1804',
  t: 1804,
  preuve: PREUVES.napoleon,
};

export const EVENEMENTS: readonly Evenement[] = [MIGRATIONS, CHUTE, CHARLEMAGNE, LOUIS_IX, REVOLUTION, NAPOLEON];

const dated = (e: Evenement) => `${e.label} (${e.date})`;

const FAITS_ORDRE: readonly QcmFait[] = [
  {
    q: 'Que veut dire ranger des événements dans l’ordre chronologique ?',
    a: 'les ranger selon le moment où ils arrivent',
    wrong: [
      { label: 'les ranger par ordre alphabétique', why: 'L’alphabet range les lettres, pas les moments.' },
      { label: 'les ranger du plus court nom au plus long', why: 'La longueur du nom ne dit rien du temps.' },
    ],
    preuve: PREUVES.chronologie,
    explain: 'La chronologie présente les faits les uns après les autres, dans leur ordre.',
    hint: 'Pense au temps qui passe.',
  },
];

const premier: Generator = (rng) => {
  const choisis = rng.shuffle([...EVENEMENTS]).slice(0, 3);
  const [first, ...apres] = [...choisis].sort((a, b) => a.t - b.t) as [Evenement, ...Evenement[]];
  return {
    prompt: 'Lequel de ces événements arrive en premier ?',
    ...choice(
      rng,
      dated(first),
      apres.map((e) => ({ label: dated(e), why: `Cet événement arrive plus tard : ${e.date}.` })),
    ),
    hint: 'Compare les siècles et les années entre parenthèses.',
    steps: [cite(first.preuve), 'La date la plus ancienne arrive en premier.', fin(dated(first))],
    targetSeconds: 25,
  };
};

const ordre1: Generator = (rng) => (rng.int(0, 3) === 0 ? qcm(rng, at(FAITS_ORDRE, 0)) : premier(rng));

const ordre2: Generator = (rng) => {
  const i = rng.int(1, 3);
  const ref = at(EVENEMENTS, i);
  const next = at(EVENEMENTS, i + 1);
  // Au moins un événement antérieur parmi les pièges.
  const avant = rng.pick(EVENEMENTS.slice(0, i));
  const reste = EVENEMENTS.filter((e) => e !== ref && e !== next && e !== avant);
  const autres = [avant, ...rng.shuffle(reste).slice(0, 2)];
  return {
    prompt: `Attention aux pièges ! Parmi ces événements, lequel arrive le premier après : « ${dated(ref)} » ?`,
    ...choice(
      rng,
      dated(next),
      autres.map((e) => ({
        label: dated(e),
        why: e.t < ref.t ? 'Cet événement arrive avant.' : 'Il arrive après, mais un autre arrive plus tôt.',
      })),
    ),
    hint: 'Écarte ce qui est avant, puis prends le plus proche.',
    steps: [
      cite(next.preuve),
      `On cherche le premier événement qui suit : ${ref.label} (${ref.date}).`,
      fin(dated(next)),
    ],
    targetSeconds: 35,
  };
};

const ordre3: Generator = (rng) => {
  const choisis = rng.shuffle([...EVENEMENTS]).slice(0, 4);
  return ranger(
    rng,
    `Range ces quatre événements, du plus ancien au plus récent. Dates à placer : ${choisis.map((e) => e.date).join(' ; ')}.`,
    choisis.map((e) => ({ label: dated(e), t: e.t })),
    'Lis les dates : un siècle en chiffres romains se compare aux années.',
    'On range selon les dates. Le XIIIe siècle va de 1201 à 1300.',
  );
};

const ordre4: Generator = (rng) => {
  const melange = rng.shuffle([...EVENEMENTS]);
  const ecarte = at(melange, 0).label;
  const choisis = melange.slice(1);
  if (rng.int(0, 1) === 0) {
    return ranger(
      rng,
      `Sans les dates, remets en ordre cinq événements. On met de côté « ${ecarte} ».`,
      choisis.map((e) => ({ label: e.label, t: e.t })),
      'Souviens-toi : les temps anciens, puis les rois, puis la Révolution.',
      `On retrouve les dates : ${[...choisis]
        .sort((a, b) => a.t - b.t)
        .map((e) => e.date)
        .join(', ')}.`,
    );
  }
  return association(
    rng,
    `Sans aide, associe cinq événements à leur date. On met de côté « ${ecarte} ».`,
    choisis.map((e) => [e.label, e.date] as const),
    'Commence par les dates dont tu es sûr.',
    ['Chaque événement a un repère dans le temps.', ...choisis.map((e) => cite(e.preuve))],
  );
};

const ordre5: Generator = (rng) => {
  // Le récit raconte les événements dans le désordre : il faut s'appuyer sur les dates.
  const choisis = rng.shuffle([...EVENEMENTS]).slice(0, 4);
  const sorted = [...choisis].sort((a, b) => a.t - b.t);
  const debuts = [
    'La guide parle d’abord de ceci',
    'Elle raconte ensuite ceci',
    'Puis elle ajoute ceci',
    'Elle finit par ceci',
  ];
  const figure = {
    kind: 'document' as const,
    title: 'Le récit dans le désordre',
    lines: choisis.map((e, i) => `${debuts[i]} : ${e.date}, « ${e.label} ».`),
    credit: 'Texte écrit pour l’exercice, d’après le programme du cycle 3.',
  };
  if (rng.int(0, 1) === 0) {
    return {
      ...ranger(
        rng,
        'Lis le récit : la guide mélange tout ! Remets les événements dans l’ordre du temps.',
        choisis.map((e) => ({ label: e.label, t: e.t })),
        'Ne suis pas l’ordre du texte : suis les dates.',
        'On cherche la date de chaque événement dans le récit.',
      ),
      figure,
      targetSeconds: 70,
    };
  }
  const rang = rng.int(1, 2);
  const target = at(sorted, rang);
  const nom = rang === 1 ? 'deuxième' : 'troisième';
  return {
    prompt: `Lis le récit, puis réponds. Dans l’ordre du temps, quel événement vient en ${nom} ?`,
    figure,
    ...choice(
      rng,
      target.label,
      sorted.flatMap((e, i) =>
        i === rang
          ? []
          : [{ label: e.label, why: `Dans l’ordre du temps, il vient en position ${i + 1} (${e.date}).` }],
      ),
    ),
    hint: 'Ne suis pas l’ordre du texte : numérote les dates.',
    steps: [cite(target.preuve), `Dans l’ordre : ${sorted.map((e) => e.date).join(', ')}.`, fin(target.label)],
    targetSeconds: 70,
  };
};

// ——— Chapitre ———

export const SKILLS: readonly Skill[] = [
  skill(
    'hcm1-siecles-romains',
    'Siècles et chiffres romains',
    [
      'Un **siècle** dure cent ans. Son numéro s’écrit en **chiffres romains** : I vaut 1, V vaut 5, X vaut 10.',
      'Petite lettre après, on ajoute : VI = 6. Petite lettre avant, on enlève : IV = 4.',
      'Le Ier siècle va de 1 à 100. Ainsi, 1789 est au XVIIIe siècle, et 1800 aussi !',
    ],
    [
      PREUVES.siecle,
      PREUVES.bornes,
      PREUVES.lettres,
      PREUVES.quatre,
      PREUVES.neuf,
      PREUVES.quatorze,
      PREUVES.siecleRomain,
    ],
    [siecles1, siecles2, siecles3, siecles4, siecles5],
  ),
  skill(
    'hcm1-frise-chronologique',
    'La frise chronologique',
    [
      'La **frise chronologique** est un dessin du temps. On y place des dates, de la plus ancienne à la plus récente.',
      'Un **siècle** dure 100 ans. Un **millénaire** dure 1 000 ans.',
      'Pour une durée, soustrais : de 800 à 1800, il y a 1 000 ans.',
    ],
    [PREUVES.frise, PREUVES.siecle, PREUVES.millenaire, PREUVES.charlemagne, PREUVES.revolution, PREUVES.napoleon],
    [frise1, frise2, frise3, frise4, frise5],
  ),
  skill(
    'hcm1-avant-apres-jc',
    'Avant et après J.-C.',
    [
      'L’**ère chrétienne** commence à la date supposée de la naissance de Jésus-Christ. C’est le point de départ.',
      '**J.-C.** veut dire Jésus-Christ. On écrit « av. J.-C. » avant ce point, « apr. J.-C. » après.',
      'Avant J.-C., on compte à rebours : 500 av. J.-C. est plus ancien que 100 av. J.-C.',
    ],
    [PREUVES.ere, PREUVES.jc, PREUVES.siecle, PREUVES.routeSoie, PREUVES.charlemagne, PREUVES.revolution],
    [jc1, jc2, jc3, jc4, jc5],
  ),
  skill(
    'hcm1-ordonner-evenements',
    'Ordonner des événements',
    [
      'La **chronologie** range les faits dans l’ordre où ils arrivent. Cherche d’abord leurs dates !',
      'Un **événement** plus ancien a une date plus petite après J.-C. : 800 vient avant 1789.',
      'Repères : Charlemagne en 800, Louis IX au XIIIe siècle, la Révolution en 1789, Napoléon empereur en 1804.',
    ],
    [PREUVES.ordonner, PREUVES.chronologie, ...EVENEMENTS.map((e) => e.preuve)],
    [ordre1, ordre2, ordre3, ordre4, ordre5],
  ),
];
