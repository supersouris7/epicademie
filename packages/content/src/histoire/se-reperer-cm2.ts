import type { Level, Rich, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { PREUVES } from './se-reperer-cm2-sources.ts';
import type { Preuve } from './se-reperer-sources.ts';
import {
  association,
  at,
  cite,
  fin,
  liste,
  qcm,
  ranger,
  saisie,
  siecle,
  siecleForms,
  type Generator,
  type QcmFait,
} from './se-reperer.ts';

/**
 * CM2, « Se repérer dans le temps » (lot hi-cm2-04) : compétence du programme d'histoire du cycle 3 travaillée sur
 * quatre notions. Les années tirées au sort servent à s'entraîner ; les faits historiques sont ceux de `PREUVES`,
 * avec leur citation exacte. Les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

const PROG = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), histoire, classe de CM2';
const CREDIT = 'Texte écrit pour l’exercice.';
const SOUSTRAIRE = 'Durée = année récente − année ancienne.';

const maj = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const document = (title: string, lines: readonly string[], credit = CREDIT) => ({
  kind: 'document' as const,
  title,
  lines,
  credit,
});

/** Constructions imaginaires des textes du niveau 5 (toujours signalées comme inventées). */
const INVENTIONS = [
  'le moulin',
  'la halle',
  'le pont',
  'la fontaine',
  'la tour',
  'la mairie',
  'le lavoir',
  'la gare',
] as const;

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

// ——— Notion 1 : la frise des grandes périodes ———

export interface Periode {
  readonly nom: string;
  /** Avec son article, pour les phrases. */
  readonly le: string;
  /** Bornes, dites avec les mots de l'élève. */
  readonly bornes: string;
  readonly accepted: readonly string[];
  readonly preuves: readonly Preuve[];
}

/** Écritures acceptées : avec ou sans article, avec ou sans accents. */
function formes(le: string, noms: readonly string[]): string[] {
  const sansAccent = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '');
  return [...new Set(noms.flatMap((n) => [n, `${le}${n}`]).flatMap((f) => [f, sansAccent(f)]))];
}

/** Les cinq périodes, dans l'ordre du temps. */
export const PERIODES: readonly Periode[] = [
  {
    nom: 'Préhistoire',
    le: 'la Préhistoire',
    bornes: 'avant les témoignages écrits',
    accepted: formes('la ', ['Préhistoire']),
    preuves: [PREUVES.prehistoire],
  },
  {
    nom: 'Antiquité',
    le: 'l’Antiquité',
    bornes: 'des débuts de l’écriture à 476',
    accepted: formes('l’', ['Antiquité']),
    preuves: [PREUVES.antiquite, PREUVES.ancienne],
  },
  {
    nom: 'Moyen Âge',
    le: 'le Moyen Âge',
    bornes: 'de 476 à 1453 ou 1492',
    accepted: formes('le ', ['Moyen Âge', 'Moyen-Âge']),
    preuves: [PREUVES.moyenAge1453, PREUVES.moyenAge1492],
  },
  {
    nom: 'Temps modernes',
    le: 'les Temps modernes',
    bornes: 'de la fin du Moyen Âge à la Révolution française',
    accepted: [
      ...formes('les ', ['Temps modernes']),
      ...formes('le ', ['Temps moderne']),
      ...formes('l’', ['époque moderne']),
      ...formes('la ', ['période moderne']),
    ],
    preuves: [PREUVES.modernes],
  },
  {
    nom: 'Époque contemporaine',
    le: 'l’époque contemporaine',
    bornes: 'de 1789 à nos jours',
    accepted: [...formes('l’', ['époque contemporaine']), ...formes('la ', ['période contemporaine']), 'contemporaine'],
    preuves: [PREUVES.contemporaine],
  },
];

const [PREHISTOIRE, ANTIQUITE, MOYEN_AGE, MODERNES, CONTEMPORAINE] = PERIODES as [
  Periode,
  Periode,
  Periode,
  Periode,
  Periode,
];

const SENS = 'Sur la frise, on va du plus ancien au plus récent.';
const FRISE = `Dans l’ordre : ${PERIODES.map((p) => p.le).join(', puis ')}.`;
const DEUX_DATES = 'Pour la fin du Moyen Âge, des historiens choisissent 1453, d’autres 1492.';

const rang = (p: Periode) => PERIODES.indexOf(p);

/** Pourquoi une autre période n'est pas la bonne. */
const pasElle = (p: Periode) => `Non : ${p.le}, c’est ${p.bornes}.`;

/**
 * Années franchement à l'intérieur d'une période (après J.-C.) : jamais une borne, jamais entre 1453 et 1492, où les
 * deux dates de fin du Moyen Âge donneraient deux réponses.
 */
const ANNEES: readonly (readonly [Periode, number, number])[] = [
  [ANTIQUITE, 50, 400],
  [MOYEN_AGE, 550, 1400],
  [MODERNES, 1520, 1750],
  [CONTEMPORAINE, 1820, 2000],
];

function anneeAuHasard(rng: Rng): { periode: Periode; year: number } {
  const [periode, min, max] = rng.pick(ANNEES);
  return { periode, year: rng.int(min, max) };
}

const preuvePeriode = (p: Periode) => p.preuves.map(cite);

/** Les limites de la période, dites avec les mots de l'élève. */
const limites = (p: Periode) => `${maj(p.le)} : ${p.bornes}.`;

function choixPeriode(q: string, bonne: Periode, autres: readonly Periode[], hint: string): QcmFait {
  return {
    q,
    a: bonne.le,
    wrong: autres.map((p) => ({ label: p.le, why: pasElle(p) })),
    preuve: at(bonne.preuves, 0),
    explain: `${maj(bonne.le)} : ${bonne.bornes}.`,
    hint,
  };
}

const FAITS_PERIODES: readonly QcmFait[] = [
  choixPeriode(
    'Quelle période vient avant les témoignages écrits ?',
    PREHISTOIRE,
    [MODERNES, CONTEMPORAINE],
    'Regarde tout au début de la frise.',
  ),
  choixPeriode(
    'Dans quelle période vivons-nous aujourd’hui ?',
    CONTEMPORAINE,
    [ANTIQUITE, MOYEN_AGE],
    'C’est la période la plus récente de la frise.',
  ),
  choixPeriode(
    'Quelle période vient juste après l’Antiquité ?',
    MOYEN_AGE,
    [PREHISTOIRE, CONTEMPORAINE],
    'Récite la frise dans l’ordre.',
  ),
  choixPeriode(
    'Quelle période se termine à la Révolution française ?',
    MODERNES,
    [PREHISTOIRE, ANTIQUITE],
    'Elle se place juste avant la période où nous vivons.',
  ),
];

const periodes1: Generator = (rng) => qcm(rng, rng.pick(FAITS_PERIODES));

const periodes2: Generator = (rng) => {
  if (rng.int(0, 2) === 0) {
    const choisies = rng.shuffle([...PERIODES]).slice(0, 3);
    return association(
      rng,
      `Associe chaque période à ses limites : ${liste(choisies.map((p) => p.le))}.`,
      choisies.map((p) => [p.nom, p.bornes] as const),
      'Place d’abord les périodes sur la frise.',
      choisies.flatMap(preuvePeriode),
    );
  }
  const { periode, year } = anneeAuHasard(rng);
  return {
    prompt: `Attention aux pièges ! Dans quelle période se place l’année ${year} ?`,
    ...choice(
      rng,
      periode.le,
      PERIODES.filter((p) => p !== periode && p !== PREHISTOIRE).map((p) => ({ label: p.le, why: pasElle(p) })),
    ),
    hint: 'Compare l’année avec les grandes dates : 476, puis la fin du Moyen Âge, puis 1789.',
    steps: [...preuvePeriode(periode), limites(periode), `L’année ${year} est dans cette période.`, fin(periode.le)],
    targetSeconds: 35,
  };
};

const BORNES_SAISIE = [
  {
    q: 'En quelle année commence le Moyen Âge ?',
    year: 476,
    traps: [
      [1789, 'C’est le début de l’époque contemporaine.'],
      [800, 'En 800, Charlemagne est couronné : le Moyen Âge a déjà commencé.'],
      [1453, '1453 est une date choisie pour la fin du Moyen Âge, pas pour son début.'],
      [1492, '1492 est une date choisie pour la fin du Moyen Âge, pas pour son début.'],
    ],
    preuve: PREUVES.moyenAge1453,
  },
  {
    q: 'En quelle année commence l’époque contemporaine ?',
    year: 1789,
    traps: [
      [476, 'C’est le début du Moyen Âge.'],
      [1892, 'En 1892, la République fête ses cent ans : la période a déjà commencé.'],
      [1453, 'Après 1453, ce sont les Temps modernes qui commencent.'],
      [1492, 'Après 1492, ce sont les Temps modernes qui commencent.'],
    ],
    preuve: PREUVES.contemporaine,
  },
  {
    q: 'En quelle année l’Antiquité se termine-t-elle ?',
    year: 476,
    traps: [
      [1789, 'En 1789, c’est la fin des Temps modernes.'],
      [800, 'En 800, Charlemagne est couronné : l’Antiquité est finie.'],
      [1453, 'En 1453, c’est le Moyen Âge qui se termine, selon des historiens.'],
      [1492, 'En 1492, c’est le Moyen Âge qui se termine, selon des historiens.'],
    ],
    preuve: PREUVES.antiquite,
  },
] as const;

const periodes3: Generator = (rng) => {
  if (rng.int(0, 1) === 0) {
    const choisies = rng.shuffle([...PERIODES]).slice(0, rng.int(3, 4));
    return ranger(
      rng,
      `Range ces périodes, de la plus ancienne à la plus récente : ${liste(choisies.map((p) => p.le))}.`,
      choisies.map((p) => ({ label: p.nom, t: rang(p) })),
      'Récite toute la frise, puis garde seulement les périodes demandées.',
      `${SENS} ${FRISE}`,
    );
  }
  const b = rng.pick(BORNES_SAISIE);
  return saisie(
    b.q,
    [String(b.year)],
    b.traps.map(([y, why]) => [String(y), why] as const),
    'Trois grandes dates découpent la frise. Laquelle convient ici ?',
    [cite(b.preuve), fin(String(b.year))],
  );
};

const periodes4: Generator = (rng) => {
  const mode = rng.pick(['annee', 'annee', 'relier', 'fin'] as const);
  if (mode === 'relier') {
    return association(
      rng,
      'Sans aide : associe chacune des cinq périodes à ses limites.',
      PERIODES.map((p) => [p.nom, p.bornes] as const),
      'Commence par les périodes dont tu es sûr.',
      [FRISE, DEUX_DATES],
    );
  }
  if (mode === 'fin') {
    return saisie(
      'Sans proposition : écris une année que des historiens choisissent pour la fin du Moyen Âge.',
      ['1453', '1492'],
      [
        ['476', 'C’est le début du Moyen Âge, pas sa fin.'],
        ['1789', 'En 1789, ce sont les Temps modernes qui se terminent.'],
        ['800', 'En 800, on est en plein Moyen Âge.'],
      ],
      'Elle se situe au XVe siècle.',
      [cite(PREUVES.moyenAge1453), cite(PREUVES.moyenAge1492), DEUX_DATES, fin('1453 ou 1492')],
    );
  }
  const { periode, year } = anneeAuHasard(rng);
  return saisie(
    `Sans proposition : écris le nom de la période de l’année ${year}.`,
    periode.accepted,
    PERIODES.filter((p) => p !== periode).flatMap((p) => p.accepted.map((t) => [t, pasElle(p)] as const)),
    'Retrouve les grandes dates qui découpent la frise.',
    [...preuvePeriode(periode), limites(periode), `L’année ${year} est dans cette période.`, fin(periode.le)],
  );
};

/** Siècles entièrement dans une période (ni le Ve, ni le XVe, ni le XVIIIe, à cheval sur une borne). */
const SIECLES: readonly (readonly [Periode, readonly number[]])[] = [
  [ANTIQUITE, [2, 3, 4]],
  [MOYEN_AGE, [7, 9, 11, 13, 14]],
  [MODERNES, [16, 17]],
  [CONTEMPORAINE, [19, 20]],
];

const periodes5: Generator = (rng) => {
  const objets = rng.shuffle(['La clé', 'Le vase', 'La pièce', 'La lampe', 'La coupe', 'La cloche']).slice(0, 4);
  const vitrine = SIECLES.map(([periode, siecles], i) => ({ periode, c: rng.pick(siecles), nom: at(objets, i) }));
  const figure = document(
    'La vitrine d’un musée imaginaire',
    rng.shuffle(vitrine.map((o) => `${o.nom} date du ${siecle(o.c)} siècle après J.-C.`)),
  );
  const cible = rng.pick(vitrine);
  const preuves = [
    ...preuvePeriode(cible.periode),
    limites(cible.periode),
    `${cible.nom} date du ${siecle(cible.c)} siècle : de ${(cible.c - 1) * 100 + 1} à ${cible.c * 100}.`,
  ];
  const hint = 'Transforme le siècle en années, puis place-le sur la frise.';
  if (rng.int(0, 1) === 0) {
    const q = saisie(
      `Lis le texte, puis réponds. Écris le nom de la période de cet objet : « ${cible.nom} ».`,
      cible.periode.accepted,
      PERIODES.filter((p) => p !== cible.periode).flatMap((p) => p.accepted.map((t) => [t, pasElle(p)] as const)),
      hint,
      [...preuves, fin(cible.periode.le)],
    );
    return { ...q, figure, targetSeconds: 60 };
  }
  return {
    prompt: `Lis le texte, puis réponds. Quel objet date de cette période : ${cible.periode.le} ?`,
    figure,
    ...choice(
      rng,
      cible.nom,
      vitrine
        .filter((o) => o !== cible)
        .map((o) => ({ label: o.nom, why: `${o.nom} date du ${siecle(o.c)} siècle. Sa période : ${o.periode.le}.` })),
    ),
    hint,
    steps: [...preuves, fin(cible.nom)],
    targetSeconds: 60,
  };
};

// ——— Les repères datés du cycle 3 ———

export interface Repere {
  /** Phrase au présent, sans point. */
  readonly label: string;
  /** Groupe nominal, pour les énoncés. */
  readonly court: string;
  /** Année de tri (Louis IX : milieu de son siècle). */
  readonly t: number;
  /** Date telle qu'on la retient. */
  readonly date: string;
  readonly preuve: Preuve;
}

const repere = (label: string, court: string, t: number, preuve: Preuve, date = `en ${t}`): Repere => ({
  label,
  court,
  t,
  date,
  preuve,
});

const CHARLEMAGNE = repere(
  'Charlemagne est couronné empereur',
  'le couronnement de Charlemagne',
  800,
  PREUVES.charlemagne,
);
const LOUIS_IX = repere('Louis IX est roi', 'le règne de Louis IX', 1250, PREUVES.louisIx, 'au XIIIe siècle');
const REVOLUTION = repere('La Révolution commence', 'le début de la Révolution', 1789, PREUVES.revolution);
const NAPOLEON = repere(
  'Napoléon est proclamé empereur',
  'la proclamation de Napoléon empereur',
  1804,
  PREUVES.napoleon,
);
const SUFFRAGE = repere(
  'Le suffrage universel des hommes est instauré',
  'le suffrage universel des hommes',
  1848,
  PREUVES.suffrage,
);
const GRATUITE = repere('La gratuité de l’école est votée', 'le vote de l’école gratuite', 1881, PREUVES.gratuite);
const OBLIGATION = repere('L’école devient obligatoire', 'l’école obligatoire', 1882, PREUVES.gratuite);
const CENT = repere('La République fête ses cent ans', 'le centenaire de la République', 1892, PREUVES.cent);
const CULTES = repere('Une loi garantit le libre exercice des cultes', 'la loi sur les cultes', 1905, PREUVES.cultes);
const FEMMES = repere('Les femmes obtiennent le droit de vote', 'le droit de vote des femmes', 1944, PREUVES.femmes);

/** Repères du CM1 et du CM2, du plus ancien au plus récent. */
export const REPERES: readonly Repere[] = [
  CHARLEMAGNE,
  LOUIS_IX,
  REVOLUTION,
  NAPOLEON,
  SUFFRAGE,
  GRATUITE,
  OBLIGATION,
  CENT,
  CULTES,
  FEMMES,
];

/** Repères datés d'une année (Louis IX est repéré par son siècle). */
const DATES = REPERES.filter((r) => r !== LOUIS_IX);

const date = (r: Repere) => `${r.label} (${r.date})`;

// ——— Notion 2 : ordonner et situer des faits ———

/** Pour ordonner : un seul des deux repères sur l'école (1881 et 1882 se suivent de trop près). */
const A_ORDONNER = REPERES.filter((r) => r !== OBLIGATION);

const CHRONO = 'On range les faits du plus ancien au plus récent.';

const ordre1: Generator = (rng) => {
  const choisis = rng.shuffle([...A_ORDONNER]).slice(0, 3);
  const dernier = rng.int(0, 1) === 0;
  const sorted = [...choisis].sort((a, b) => (dernier ? b.t - a.t : a.t - b.t));
  const [bon, ...autres] = sorted as [Repere, ...Repere[]];
  return {
    prompt: dernier ? 'Lequel de ces faits est le plus récent ?' : 'Lequel de ces faits est le plus ancien ?',
    ...choice(
      rng,
      date(bon),
      autres.map((r) => ({
        label: date(r),
        why: dernier ? `Ce fait arrive plus tôt : ${r.date}.` : `Ce fait arrive plus tard : ${r.date}.`,
      })),
    ),
    hint: 'Compare les dates entre parenthèses.',
    steps: [cite(bon.preuve), CHRONO, fin(date(bon))],
    targetSeconds: 25,
  };
};

const ordre2: Generator = (rng) => {
  const apres = rng.int(0, 1) === 0;
  const file = apres ? A_ORDONNER : [...A_ORDONNER].reverse();
  const i = rng.int(1, file.length - 2);
  const ref = at(file, i);
  const bon = at(file, i + 1);
  const avant = rng.pick(file.slice(0, i));
  const reste = file.filter((r) => r !== ref && r !== bon && r !== avant);
  const autres = [avant, ...rng.shuffle(reste).slice(0, 2)];
  const mot = apres ? 'après' : 'avant';
  return {
    prompt: `Attention aux pièges ! Quel fait arrive juste ${mot} celui-ci : « ${date(ref)} » ?`,
    ...choice(
      rng,
      date(bon),
      autres.map((r) => ({
        label: date(r),
        why:
          r === avant
            ? `Ce fait ne vient pas ${mot} : il arrive ${r.date}.`
            : `Il vient bien ${mot}, mais un autre fait est plus proche.`,
      })),
    ),
    hint: 'Écarte le mauvais côté de la frise, puis prends le plus proche.',
    steps: [cite(bon.preuve), `On cherche le fait le plus proche ${mot} : ${ref.label} (${ref.date}).`, fin(date(bon))],
    targetSeconds: 35,
  };
};

const ordre3: Generator = (rng) => {
  const choisis = rng.shuffle([...A_ORDONNER]).slice(0, 4);
  return ranger(
    rng,
    `Range du plus ancien au plus récent : ${liste(choisis.map((r) => r.court))}.`,
    choisis.map((r) => ({ label: date(r), t: r.t })),
    choisis.includes(LOUIS_IX)
      ? 'Lis les dates : le XIIIe siècle va de 1201 à 1300.'
      : 'Lis les dates : après J.-C., la plus petite année est la plus ancienne.',
    CHRONO,
  );
};

const ordre4: Generator = (rng) => {
  const choisis = rng.shuffle([...A_ORDONNER]).slice(0, 5);
  const noms = liste(choisis.map((r) => r.court));
  if (rng.int(0, 1) === 0) {
    const sorted = [...choisis].sort((a, b) => a.t - b.t);
    return ranger(
      rng,
      `Sans les dates, remets en ordre : ${noms}.`,
      choisis.map((r) => ({ label: r.label, t: r.t })),
      'Sépare d’abord ce qui arrive avant la Révolution et après.',
      `On retrouve les dates : ${sorted.map((r) => r.date).join(', ')}.`,
    );
  }
  return association(
    rng,
    `Sans aide, situe chaque fait à sa date : ${noms}.`,
    choisis.map((r) => [r.label, r.date] as const),
    'Commence par les dates dont tu es sûr.',
    choisis.map((r) => cite(r.preuve)),
  );
};

/** Assez éloignés pour qu'un fait inventé, à moins de dix ans de l'un, ne dépasse aucun autre. */
const ANCRES: readonly Repere[] = [REVOLUTION, NAPOLEON, SUFFRAGE, CENT, FEMMES];

const RANGS = ['premier', 'deuxième', 'troisième', 'quatrième', 'cinquième'] as const;

const ordre5: Generator = (rng) => {
  const ancres = rng.shuffle([...ANCRES]).slice(0, 3);
  const noms = rng.shuffle([...INVENTIONS]);
  const inventes = rng
    .shuffle([...ancres])
    .slice(0, 2)
    .map((ancre, i) => {
      const d = rng.int(2, 7);
      const sens = rng.pick(['avant', 'après'] as const);
      return { nom: `On construit ${at(noms, i)}`, ancre, d, sens, t: ancre.t + (sens === 'avant' ? -d : d) };
    });
  const tous = [...ancres.map((r) => ({ label: r.label, t: r.t })), ...inventes.map((e) => ({ label: e.nom, t: e.t }))];
  const figure = document(
    'Le carnet de la guide, tout mélangé',
    rng.shuffle([
      ...ancres.map((r) => `Fait du programme : « ${r.label} ».`),
      ...inventes.map((e) => `Fait inventé : « ${e.nom} » ${e.d} ans ${e.sens} ${e.ancre.court}.`),
    ]),
    'Texte écrit pour l’exercice ; les faits du programme sont signalés.',
  );
  const calculs = [
    `Dates à connaître : ${ancres.map((r) => `« ${r.label} » ${r.date}`).join(' ; ')}.`,
    ...inventes.map((e) => `« ${e.nom} » : ${e.ancre.t} ${e.sens === 'avant' ? '−' : '+'} ${e.d} = ${e.t}.`),
  ];
  const hint = 'Retrouve les dates du programme, puis calcule celles des faits inventés.';
  if (rng.int(0, 1) === 0) {
    const q = ranger(
      rng,
      'Lis le carnet, puis remets les cinq faits dans l’ordre du temps.',
      tous,
      hint,
      calculs.join(' '),
    );
    return { ...q, steps: [...ancres.map((r) => cite(r.preuve)), ...q.steps], figure, targetSeconds: 100 };
  }
  const sorted = [...tous].sort((a, b) => a.t - b.t);
  const k = rng.int(1, 3);
  const bon = at(sorted, k);
  return {
    prompt: `Lis le carnet, puis réponds. Dans l’ordre du temps, quel fait arrive en ${at(RANGS, k)} ?`,
    figure,
    ...choice(
      rng,
      bon.label,
      sorted.flatMap((e, i) =>
        i === k ? [] : [{ label: e.label, why: `Ce fait date de ${e.t} : il arrive en ${at(RANGS, i)}.` }],
      ),
    ),
    hint,
    steps: [...ancres.map((r) => cite(r.preuve)), ...calculs, fin(bon.label)],
    targetSeconds: 100,
  };
};

// ——— Notion 3 : les durées ———

const FAITS_DUREE: readonly QcmFait[] = [
  {
    q: 'Qu’est-ce qu’une durée ?',
    a: 'le temps entre un début et une fin',
    wrong: [
      { label: 'la distance entre deux villes', why: 'Une distance se mesure sur le terrain, pas dans le temps.' },
      { label: 'le nom d’une période', why: 'Le nom d’une période ne dit pas combien de temps elle dure.' },
    ],
    preuve: PREUVES.duree,
    explain: 'Une durée va d’un début jusqu’à une fin.',
    hint: 'Pense au verbe « durer ».',
  },
  {
    q: 'Combien d’années dure un siècle ?',
    a: '100 ans',
    wrong: [
      { label: '10 ans', why: '10 ans, c’est dix fois moins qu’un siècle.' },
      { label: '1 000 ans', why: '1 000 ans, c’est un millénaire.' },
    ],
    preuve: PREUVES.siecle,
    explain: 'Un siècle, c’est cent ans.',
    hint: 'Pense au mot « cent ».',
  },
  {
    q: 'Combien d’années dure un millénaire ?',
    a: '1 000 ans',
    wrong: [
      { label: '100 ans', why: '100 ans, c’est un siècle.' },
      { label: '10 ans', why: '10 ans, c’est beaucoup trop court.' },
    ],
    preuve: PREUVES.millenaire,
    explain: 'Un millénaire, c’est mille ans.',
    hint: 'Le début du mot ressemble à « mille ».',
  },
];

const durees1: Generator = (rng) => {
  if (rng.int(0, 1) === 0) return qcm(rng, rng.pick(FAITS_DUREE));
  const a = rng.int(10, 18) * 100;
  const gap = rng.pick([10, 20, 50]);
  return {
    prompt: `Combien d’années s’écoulent de ${a} à ${a + gap} ?`,
    ...choice(rng, `${gap} ans`, [
      { label: `${gap + 100} ans`, why: 'Cent ans de trop : les deux années sont proches.' },
      { label: `${a + a + gap} ans`, why: 'Tu as ajouté les années. Pour une durée, on soustrait.' },
    ]),
    hint: 'Compte à partir de la première année jusqu’à la seconde.',
    steps: [cite(PREUVES.duree), `${a + gap} − ${a} = ${gap}.`, fin(`${gap} ans`)],
    targetSeconds: 25,
  };
};

const durees2: Generator = (rng) => {
  if (rng.int(0, 1) === 0) {
    const depart = rng.int(11, 17) * 100;
    const gaps = rng.shuffle([5, 15, 25, 50, 105, 150, 250]).slice(0, 3);
    const paires = gaps.map((g, i) => [`de ${depart + i} à ${depart + i + g}`, `${g} ans`] as const);
    return association(
      rng,
      `Associe chaque intervalle à sa durée : ${liste(paires.map((p) => p[0]))}.`,
      paires,
      'Soustrais pour chaque intervalle.',
      [SOUSTRAIRE, ...gaps.map((g, i) => `${depart + i + g} − ${depart + i} = ${g}.`)],
    );
  }
  const [x, y] = rng.shuffle([...DATES.filter((r) => r !== OBLIGATION)]) as [Repere, Repere];
  const [a, b] = [x, y].sort((m, n) => m.t - n.t) as [Repere, Repere];
  const gap = b.t - a.t;
  const faux = [
    [gap + 10, 'Dix ans de trop : vérifie les dizaines.'],
    [gap + 100, 'Cent ans de trop : vérifie les centaines.'],
    [a.t + b.t, 'Tu as ajouté les années. Pour une durée, on soustrait.'],
    [gap + 2, 'Deux ans de trop : vérifie les unités.'],
  ] as const;
  return {
    prompt: `Attention aux pièges ! Combien d’années séparent ${a.t} (${a.court}) et ${b.t} (${b.court}) ?`,
    ...choice(
      rng,
      `${gap} ans`,
      rng
        .shuffle([...faux])
        .slice(0, 3)
        .map(([v, why]) => ({ label: `${v} ans`, why })),
    ),
    hint: 'Enlève la petite année à la grande.',
    steps: [cite(a.preuve), cite(b.preuve), SOUSTRAIRE, `${b.t} − ${a.t} = ${gap}.`, fin(`${gap} ans`)],
    targetSeconds: 40,
  };
};

const piegesDuree = (a: number, b: number) =>
  [
    [String(a + b), 'Tu as ajouté les années. Pour une durée, on soustrait.'],
    [String(b - a + 10), 'Dix ans de trop : refais la soustraction.'],
    [String(b - a + 100), 'Cent ans de trop : vérifie les centaines.'],
    [String(b - a - 10), 'Il manque dix ans : refais la soustraction.'],
  ] as const;

/** Cas régulier : chaque chiffre se soustrait sans retenue. */
const durees3: Generator = (rng) => {
  const c = rng.int(10, 18);
  const [d1, u1] = [rng.int(0, 4), rng.int(0, 4)];
  const a = c * 100 + d1 * 10 + u1;
  const b = a + rng.int(0, 1) * 100 + rng.int(1, 5) * 10 + rng.int(0, 5);
  const gap = b - a;
  return saisie(
    `Combien d’années s’écoulent de ${a} à ${b} ?`,
    [String(gap), `${gap} ans`],
    piegesDuree(a, b),
    'Soustrais les unités, puis les dizaines, puis les centaines.',
    [SOUSTRAIRE, `${b} − ${a} = ${gap}.`, fin(`${gap} ans`)],
  );
};

const durees4: Generator = (rng) => {
  if (rng.int(0, 1) === 0) {
    // Avec retenue : les unités de l'année ancienne sont plus grandes.
    const a = rng.int(10, 18) * 100 + rng.int(3, 9) * 10 + rng.int(5, 9);
    const b = (Math.floor(a / 100) + rng.int(1, 2)) * 100 + rng.int(0, 2) * 10 + rng.int(0, 4);
    const gap = b - a;
    const siecleSuivant = (Math.floor(a / 100) + 1) * 100;
    // Erreur de retenue : le plus petit chiffre retiré du plus grand, colonne par colonne.
    const chiffre = (n: number, rang: number) => Math.floor(n / rang) % 10;
    const sansRetenue = [1000, 100, 10, 1].reduce((n, r) => n + r * Math.abs(chiffre(b, r) - chiffre(a, r)), 0);
    return saisie(
      `Sans proposition : combien d’années séparent ${a} et ${b} ?`,
      [String(gap), `${gap} ans`],
      [
        [String(sansRetenue), 'Attention à la retenue : retire l’année entière, pas chaque chiffre à part.'],
        ...piegesDuree(a, b),
      ],
      'Avance d’abord jusqu’au siècle suivant, puis continue.',
      [
        SOUSTRAIRE,
        `Par bonds : de ${a} à ${siecleSuivant}, il y a ${siecleSuivant - a} ans ; de ${siecleSuivant} à ${b}, il y a ${b - siecleSuivant} ans.`,
        `${siecleSuivant - a} + ${b - siecleSuivant} = ${gap}.`,
        fin(`${gap} ans`),
      ],
    );
  }
  // À l'envers : on connaît la durée, on cherche l'année.
  const r = rng.pick([REVOLUTION, NAPOLEON, SUFFRAGE, CENT, CULTES, FEMMES]);
  const gap = rng.int(12, 99);
  const apres = rng.int(0, 1) === 0;
  const year = apres ? r.t + gap : r.t - gap;
  const calcul = `${r.t} ${apres ? '+' : '−'} ${gap} = ${year}.`;
  return saisie(
    `Sans proposition : quelle année tombe ${gap} ans ${apres ? 'après' : 'avant'} ${r.t} ?`,
    [String(year)],
    [
      [
        String(apres ? r.t - gap : r.t + gap),
        apres ? '« Après » : on avance, donc on ajoute.' : '« Avant » : on recule, donc on soustrait.',
      ],
      [String(year + 10), 'Dix ans d’écart : vérifie les dizaines.'],
      [String(year - 100), 'Cent ans d’écart : vérifie les centaines.'],
    ],
    'Demande-toi si le temps avance ou recule.',
    [cite(r.preuve), calcul, fin(String(year))],
  );
};

/** Niveau 5 : une seule année du programme ou du texte, puis deux calculs enchaînés. */
const durees5: Generator = (rng) => {
  const [x, y] = rng.shuffle([...INVENTIONS]) as [string, string, ...string[]];
  const avant = rng.int(11, 29);
  const apres = rng.int(12, 39);
  const base = CENT.t;
  const figure = document(
    'La chronique d’un village imaginaire',
    rng.shuffle([
      `Fait du programme : en ${base}, la République fête ses cent ans.`,
      `Fait inventé : on construit ${x} ${avant} ans avant cette fête.`,
      `Fait inventé : on construit ${y} ${apres} ans après cette fête.`,
    ]),
    'Texte écrit pour l’exercice ; la fête de 1892 vient du programme.',
  );
  const calculs = [cite(CENT.preuve), `${maj(x)} : ${base} − ${avant} = ${base - avant}.`];
  if (rng.int(0, 1) === 0) {
    const gap = avant + apres;
    const q = saisie(
      `Lis le texte, puis réponds. Combien d’années séparent les deux constructions : ${x} et ${y} ?`,
      [String(gap), `${gap} ans`],
      [
        [String(Math.abs(apres - avant)), 'Les deux faits sont de part et d’autre de la fête : on ajoute les écarts.'],
        [String(avant), `C’est l’écart entre la fête et une seule construction.`],
        [String(apres), `C’est l’écart entre la fête et une seule construction.`],
      ],
      'Place la fête au milieu d’une frise, puis les deux constructions.',
      [
        ...calculs,
        `${maj(y)} : ${base} + ${apres} = ${base + apres}.`,
        `${base + apres} − ${base - avant} = ${gap}.`,
        fin(`${gap} ans`),
      ],
    );
    return { ...q, figure, targetSeconds: 90 };
  }
  // En quelle année la première construction a-t-elle cent ans ?
  const year = base - avant + 100;
  const q = saisie(
    `Lis le texte, puis réponds. En quelle année cette construction fête-t-elle ses cent ans : ${x} ?`,
    [String(year)],
    [
      [String(base + 100), 'C’est cent ans après la fête, pas après la construction.'],
      [String(base - avant), 'C’est l’année de la construction. Ajoute encore un siècle.'],
      [String(base + avant + 100), '« Avant la fête » : il faut soustraire pour trouver la construction.'],
    ],
    'Trouve d’abord l’année de la construction.',
    [...calculs, `Cent ans plus tard : ${base - avant} + 100 = ${year}.`, fin(String(year))],
  );
  return { ...q, figure, targetSeconds: 90 };
};

// ——— Notion 4 : les repères du cycle 3 ———

const autresReperes = (r: Repere, ecart: number) => DATES.filter((x) => x !== r && Math.abs(x.t - r.t) >= ecart);

const reperes1: Generator = (rng) => {
  const r = rng.pick(DATES);
  // Propositions très éloignées dans le temps.
  const loin = rng.shuffle([476, 800, 1200, 1515, 1650, 1789, 1892, 1990].filter((y) => Math.abs(y - r.t) >= 90));
  return {
    prompt: `En quelle année place-t-on ce repère : « ${r.label} » ?`,
    ...choice(
      rng,
      String(r.t),
      loin.slice(0, 2).map((y) => ({ label: String(y), why: `${y} est très loin de la bonne date sur la frise.` })),
    ),
    hint: 'Place le repère sur la frise : très loin dans le passé, ou plus près de nous ?',
    steps: [cite(r.preuve), `${r.label} ${r.date}.`, fin(String(r.t))],
    targetSeconds: 25,
  };
};

const reperes2: Generator = (rng) => {
  if (rng.int(0, 2) === 0) {
    const choisis = rng.shuffle(DATES.filter((r) => r !== OBLIGATION)).slice(0, 3);
    return association(
      rng,
      `Associe chaque repère à son année : ${liste(choisis.map((r) => r.court))}.`,
      choisis.map((r) => [r.label, String(r.t)] as const),
      'Commence par le plus ancien.',
      choisis.map((r) => cite(r.preuve)),
    );
  }
  const r = rng.pick(DATES);
  const autres = rng.shuffle(autresReperes(r, 2)).slice(0, 3);
  return {
    prompt: `Attention aux pièges ! Que se passe-t-il en ${r.t} ?`,
    ...choice(
      rng,
      r.label,
      autres.map((x) => ({ label: x.label, why: `Ce repère date de ${x.t}.` })),
    ),
    hint: 'Retrouve la date de chaque proposition.',
    steps: [cite(r.preuve), `${r.label} ${r.date}.`, fin(r.label)],
    targetSeconds: 35,
  };
};

const piegesRepere = (r: Repere) =>
  autresReperes(r, 1).map((x) => [String(x.t), `${x.t}, c’est un autre repère : ${x.court}.`] as const);

const reperes3: Generator = (rng) => {
  if (rng.int(0, 5) === 0) {
    return {
      prompt: 'Complète la phrase : « Louis IX est roi au … siècle. »',
      answer: {
        kind: 'cloze',
        parts: ['Louis IX est roi au ', ' siècle.'],
        blanks: [{ mode: 'text', accepted: siecleForms(13).filter((f) => !/si[eè]cle/.test(f)) }],
      },
      hint: 'C’est un roi du Moyen Âge. Écris son siècle en chiffres romains.',
      steps: [cite(LOUIS_IX.preuve), fin('XIIIe siècle')],
      targetSeconds: 30,
    };
  }
  const r = rng.pick(DATES);
  return {
    prompt: `Complète la phrase : « ${r.label} en … »`,
    answer: { kind: 'cloze', parts: [`${r.label} en `, '.'], blanks: [{ mode: 'text', accepted: [String(r.t)] }] },
    hint: 'Imagine la frise : quel repère vient avant, lequel vient après ?',
    steps: [cite(r.preuve), `${r.label} ${r.date}.`, fin(String(r.t))],
    targetSeconds: 30,
  };
};

const reperes4: Generator = (rng) => {
  if (rng.int(0, 2) === 0) {
    const choisis = rng.shuffle(DATES.filter((r) => r !== OBLIGATION)).slice(0, 5);
    return association(
      rng,
      `Sans aide, associe chaque repère à son année : ${liste(choisis.map((r) => r.court))}.`,
      choisis.map((r) => [r.label, String(r.t)] as const),
      'Commence par les dates dont tu es sûr.',
      choisis.map((r) => cite(r.preuve)),
    );
  }
  const r = rng.pick(DATES);
  return saisie(
    `Sans proposition : écris l’année de ce repère : « ${r.label} ».`,
    [String(r.t)],
    piegesRepere(r),
    'Place-le sur ta frise : quel repère vient avant, lequel vient après ?',
    [cite(r.preuve), `${r.label} ${r.date}.`, fin(String(r.t))],
  );
};

/** Décalages d'une date fausse : loin de la vraie date, jamais celle d'un autre repère. */
const DECALAGES = [-30, -20, 20, 30] as const;

const reperes5: Generator = (rng) => {
  const choisis = rng.shuffle(DATES.filter((r) => r !== OBLIGATION)).slice(0, 4);
  const faux = at(choisis, 0);
  const erreur = faux.t + rng.pick(DECALAGES.filter((d) => DATES.every((r) => r.t !== faux.t + d)));
  const ligne = (r: Repere) => `${r.label} en ${r === faux ? erreur : r.t}.`;
  const figure = document(
    'L’exposé à corriger',
    rng.shuffle([...choisis]).map(ligne),
    'Texte écrit pour l’exercice : une date a été changée exprès.',
  );
  const hint = 'Vérifie les phrases une par une avec ta frise.';
  const preuves = [cite(faux.preuve), `${faux.label} ${faux.date}, et non en ${erreur}.`];
  if (rng.int(0, 1) === 0) {
    const q = saisie(
      'Lis l’exposé : une date est fausse. Écris la bonne année.',
      [String(faux.t)],
      [
        [String(erreur), 'C’est justement la date fausse du texte. Corrige-la.'],
        ...choisis
          .slice(1)
          .map((r) => [String(r.t), `La phrase datée de ${r.t} est juste. Cherche l’autre erreur.`] as const),
      ],
      hint,
      [...preuves, fin(String(faux.t))],
    );
    return { ...q, figure, targetSeconds: 90 };
  }
  return {
    prompt: 'Lis l’exposé : quelle phrase contient une date fausse ?',
    figure,
    ...choice(
      rng,
      ligne(faux),
      choisis.slice(1).map((r) => ({ label: ligne(r), why: `Cette phrase est juste : ${r.label} ${r.date}.` })),
    ),
    hint,
    steps: [...preuves, fin(ligne(faux))],
    targetSeconds: 90,
  };
};

// ——— Chapitre ———

export const SKILLS: readonly Skill[] = [
  skill(
    'hcm2-frise-periodes',
    'La frise des grandes périodes',
    [
      'Sur la **frise chronologique** : **Préhistoire**, **Antiquité**, **Moyen Âge**, **Temps modernes**, **époque contemporaine**.',
      'Trois dates repères : 476, puis 1453 ou 1492, puis 1789. Chacune ouvre une nouvelle **période**.',
      'La Préhistoire vient avant les témoignages écrits. Charlemagne, en 800 ? C’est le Moyen Âge !',
    ],
    [PREUVES.periodes, PREUVES.frise, ...PERIODES.flatMap((p) => p.preuves), PREUVES.charlemagne, PREUVES.cent],
    [periodes1, periodes2, periodes3, periodes4, periodes5],
  ),
  skill(
    'hcm2-ordonner',
    'Ordonner et situer des faits',
    [
      'La **chronologie** range les faits dans leur ordre. Cherche la date de chaque **événement**.',
      'Après J.-C., la plus petite année est la plus ancienne : 1848 vient avant 1905.',
      'Un fait sans date ? Aide-toi d’un **repère** : « 3 ans après 1789 », c’est 1792.',
    ],
    [PREUVES.ordonner, PREUVES.chronologie, ...A_ORDONNER.map((r) => r.preuve)],
    [ordre1, ordre2, ordre3, ordre4, ordre5],
  ),
  skill(
    'hcm2-durees',
    'Calculer des durées',
    [
      'Une **durée**, c’est le temps entre un début et une fin. Un **siècle** dure 100 ans.',
      'Pour trouver une durée, soustrais : de 1789 à 1892, il y a 1892 − 1789 = 103 ans.',
      'Ou avance par bonds : de 1789 à 1800 (11 ans), puis de 1800 à 1892 (92 ans). 11 + 92 = 103.',
    ],
    [PREUVES.duree, PREUVES.siecle, PREUVES.millenaire, ...DATES.map((r) => r.preuve)],
    [durees1, durees2, durees3, durees4, durees5],
  ),
  skill(
    'hcm2-reperes-cycle3',
    'Les repères du cycle 3',
    [
      'Un **repère** est une date à savoir par cœur. Il t’aide à placer les autres faits.',
      'Retiens : 800 Charlemagne, XIIIe siècle Louis IX, 1789 la Révolution, 1804 Napoléon, 1848 le **suffrage universel** des hommes.',
      'Puis la République : 1881 et 1882 l’école, 1892 son **centenaire**, 1905 les cultes, 1944 le vote des femmes.',
    ],
    [PREUVES.memoriser, ...REPERES.map((r) => r.preuve)],
    [reperes1, reperes2, reperes3, reperes4, reperes5],
  ),
];
