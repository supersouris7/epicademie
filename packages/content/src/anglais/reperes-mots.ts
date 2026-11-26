import type { Chapter, Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { ended, gaps, pairs, typed } from './pronoms.ts';
import { at, others, some } from './temps.ts';
import { DAYS, MONTHS } from './temps-faits.ts';
import {
  COMPOUNDS,
  DERIVED,
  MARKERS,
  ORDINALS,
  type Compound,
  type Derived,
  type Ordinal,
  type Suffix,
} from './reperes-mots-faits.ts';

/**
 * Anglais 6e — « Temps, espace, formation des mots » (lot an-6e-07, docs/adr/0034). Programme d'anglais du
 * collège (arrêté du 5 mai 2025) ; formes et emplois : British Council (voir reperes-mots-faits.ts : chaque fait y
 * porte sa source et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Formes : British Council, ${pages}.`;
const ABOUT = 'Écrit pour l’exercice.';

const coin = (rng: Rng) => rng.int(0, 1) === 0;
const quoted = (list: readonly string[]) => list.map((l) => `« ${l} »`).join(' ');
const answered = (rows: readonly (readonly [string, string])[]) =>
  `Réponse : **${rows.map(([a, b]) => `${a} = ${b}`).join(' ; ')}**`;

/** Saisie : la première forme est la réponse montrée ; une erreur typique égale à une forme admise est écartée. */
function written(accepted: readonly string[], wrong: readonly (readonly [string, string])[]) {
  const ok = new Set(accepted.map((a) => a.toLowerCase()));
  return {
    answer: { kind: 'text' as const, accepted: ended(accepted) },
    traps: typed(
      at(accepted, 0),
      wrong.filter(([t]) => !ok.has(t.toLowerCase())),
    ),
  };
}

/** Texte à trous saisis, chaque trou pouvant admettre plusieurs formes. */
function cloze(lines: readonly (readonly [string, readonly string[], string])[]) {
  const base = gaps(lines.map(([before, forms, after]) => [before, at(forms, 0), after] as const));
  return { ...base, blanks: lines.map(([, forms]) => ({ mode: 'text' as const, accepted: [...forms] })) };
}
const shown = (lines: readonly (readonly [string, readonly string[], string])[]) =>
  `Réponse : **${lines.map(([, forms]) => at(forms, 0)).join(', ')}**`;

// ——— 1. marqueurs de temps ———
const marker = (en: string) => {
  const m = MARKERS.find((x) => x.en === en);
  if (!m) throw new Error(`marqueur inconnu : ${en}`);
  return m;
};
const whyMarker = (en: string) => `« ${en} » veut dire « ${marker(en).fr} ».`;
const MARKER_RULE = 'Un marqueur de temps dit quand se passe l’action.';

function markerSpot(rng: Rng): QuestionDraft {
  const m = rng.pick(MARKERS);
  const { answer, traps } = choice(
    rng,
    m.fr,
    others(rng, MARKERS, m, 2).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
  );
  return {
    prompt: `Que veut dire le marqueur de temps « ${m.en} » ?`,
    answer,
    traps,
    hint: 'Place l’expression sur une frise : avant, pendant ou après le moment où tu parles ?',
    steps: [MARKER_RULE, whyMarker(m.en), `Réponse : **${m.fr}**`],
  };
}

/** Familles de marqueurs faciles à confondre. */
const CLOSE: readonly (readonly string[])[] = [
  ['yesterday', 'today', 'tomorrow', 'now'],
  ['at the weekend', 'last weekend', 'on Saturday', 'in December'],
  ['now', 'then', 'today', 'this morning'],
];

function markerRecognise(rng: Rng): QuestionDraft {
  const family = rng.pick(CLOSE);
  if (coin(rng)) {
    const good = rng.pick(family);
    const { answer, traps } = choice(
      rng,
      good,
      others(rng, family, good, 3).map((o) => ({ label: o, why: whyMarker(o) })),
    );
    return {
      prompt: `Quelle expression veut dire « ${marker(good).fr} » ?`,
      answer,
      traps,
      hint: 'Les propositions se ressemblent : traduis-les une à une avant de choisir.',
      steps: [MARKER_RULE, whyMarker(good), `Réponse : **${good}**`],
    };
  }
  const rows = some(rng, family, 3).map((en) => [en, marker(en).fr] as const);
  return {
    prompt: `Associe chaque marqueur de temps à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Commence par l’expression que tu connais le mieux.',
    steps: [MARKER_RULE, answered(rows)],
  };
}

const WHY_IN = '« in » s’emploie devant un mois, une année, et dans in the morning, the afternoon, the evening.';
const WHY_ON = '« on » s’emploie devant un jour ou une date.';
const WHY_AT = '« at » s’emploie devant une heure, et dans at night et at the weekend.';
const WHY_TIME: Readonly<Record<'in' | 'on' | 'at', string>> = { in: WHY_IN, on: WHY_ON, at: WHY_AT };

interface TimeSlot {
  readonly before: string;
  readonly after: string;
  readonly prep: 'in' | 'on' | 'at';
  /** Vrai pour « the weekend » : « on » (usage surtout américain) est admis. */
  readonly weekend?: true;
}
const slot = (before: string, prep: TimeSlot['prep'], after: string): TimeSlot => ({ before, prep, after });
const SLOTS: readonly TimeSlot[] = [
  slot('I play football', 'on', 'Saturday.'),
  slot('I have PE', 'on', 'Monday.'),
  slot('School starts', 'on', '1 September.'),
  slot('My birthday is', 'in', 'December.'),
  slot('My sister was born', 'in', '2008.'),
  slot('I read', 'in', 'the evening.'),
  slot('We have maths', 'in', 'the morning.'),
  slot('The film starts', 'at', '7 o’clock.'),
  slot('I don’t like going out', 'at', 'night.'),
  { ...slot('We visit our grandparents', 'at', 'the weekend.'), weekend: true },
];

function markerPreposition(rng: Rng): QuestionDraft {
  const s = rng.pick(SLOTS);
  const forms = s.weekend ? [s.prep, 'on'] : [s.prep];
  const wrong = (['in', 'on', 'at'] as const).map((p) => [p, WHY_TIME[s.prep]] as const);
  return {
    prompt: `Écris la préposition de temps qui manque (in, on ou at) : « ${s.before} … ${s.after} »`,
    ...written(forms, wrong),
    hint: 'Regarde ce qui suit le trou : une heure, un jour, une date, un mois, une année ou un moment de la journée ?',
    steps: [
      WHY_TIME[s.prep],
      ...(s.weekend ? ['L’anglais britannique dit at the weekend ; on the weekend est surtout américain.'] : []),
      `Réponse : **${s.before} ${s.prep} ${s.after}**`,
    ],
  };
}

const WHY_NO_PREPOSITION = 'Devant this et last, l’anglais ne met pas de préposition.';
/** [français, formes admises, erreurs typiques]. */
const PRODUCE: readonly (readonly [string, readonly string[], readonly (readonly [string, string])[]])[] = [
  [
    'hier',
    ['yesterday'],
    [
      ['tomorrow', whyMarker('tomorrow')],
      ['last day', '« hier » se dit en un seul mot.'],
    ],
  ],
  [
    'demain',
    ['tomorrow'],
    [
      ['yesterday', whyMarker('yesterday')],
      ['tomorow', 'Il manque un « r ».'],
    ],
  ],
  [
    'aujourd’hui',
    ['today'],
    [
      ['now', whyMarker('now')],
      ['this day', '« aujourd’hui » se dit en un seul mot.'],
    ],
  ],
  [
    'maintenant',
    ['now', 'right now'],
    [
      ['then', whyMarker('then')],
      ['today', whyMarker('today')],
    ],
  ],
  [
    'ce matin',
    ['this morning'],
    [
      ['in this morning', WHY_NO_PREPOSITION],
      ['today morning', '« ce matin » se construit avec this.'],
    ],
  ],
  [
    'le week-end dernier',
    ['last weekend', 'last week-end'],
    [
      ['the last weekend', 'Pour « le week-end dernier », pas d’article devant last.'],
      ['at last weekend', WHY_NO_PREPOSITION],
      ['on last weekend', WHY_NO_PREPOSITION],
    ],
  ],
  [
    'l’été dernier',
    ['last summer'],
    [
      ['the last summer', 'Pour « l’été dernier », pas d’article devant last.'],
      ['in last summer', WHY_NO_PREPOSITION],
      ['summer last', 'last se place avant le nom.'],
    ],
  ],
];

function markerProduce(rng: Rng): QuestionDraft {
  const [fr, forms, wrong] = rng.pick(PRODUCE);
  return {
    prompt: `Écris en anglais le marqueur de temps « ${fr} ».`,
    ...written(forms, wrong),
    hint: 'Un seul mot pour un jour proche ou pour l’instant présent ; deux mots avec this ou last pour une période.',
    steps: [MARKER_RULE, `« ${fr} » se dit « ${at(forms, 0)} ».`, `Réponse : **${at(forms, 0)}**`],
  };
}

function markerDocument(rng: Rng): QuestionDraft {
  const day = rng.int(1, 3);
  const hour = rng.int(2, 6);
  const month = rng.pick(MONTHS).en;
  const [before, today, after] = [-1, 0, 1].map((d) => at(DAYS, day + d).en) as [string, string, string];
  const rows: (readonly [string, readonly string[], string])[] = [
    [`${before}: “We had a maths test `, ['yesterday'], '.”'],
    [`${today}: “We have PE `, ['today'], '.”'],
    [`${after}: “We have art `, ['tomorrow'], '.”'],
    ['“My party is ', ['on'], ' Saturday.”'],
    ['“The party starts ', ['at'], ` ${hour} o’clock.”`],
    ['“Our school trip is ', ['in'], ` ${month}.”`],
  ];
  // Ordre tiré du carnet : un même document attend toujours les mêmes réponses.
  const shift = (day + hour) % rows.length;
  const asked = [...rows.slice(shift), ...rows.slice(0, shift)];
  return {
    prompt:
      'Lis le carnet de Maya. Elle parle aujourd’hui : complète ses phrases avec yesterday, today, tomorrow, in, on ou at.',
    figure: {
      kind: 'document',
      title: 'Maya’s diary',
      lines: [
        `Today is ${today}.`,
        `${before}: maths test`,
        `${today}: PE`,
        `${after}: art`,
        `Saturday: party, ${hour} o’clock`,
        `${month}: school trip`,
      ],
      credit: ABOUT,
    },
    answer: cloze(asked),
    hint: 'Situe d’abord chaque jour par rapport à la 1re ligne ; pour les autres trous, regarde ce qui suit.',
    steps: [
      `La 1re ligne donne le repère : on est ${today}.`,
      `${before} est la veille : yesterday. ${after} est le lendemain : tomorrow.`,
      `${WHY_ON} ${WHY_AT} ${WHY_IN}`,
      shown(asked),
    ],
  };
}

const timeMarkers: Skill = {
  id: 'a6-marqueurs-temps',
  title: 'Les marqueurs de temps',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **marqueur de temps** dit quand : yesterday (hier), today (aujourd’hui), tomorrow (demain), now (maintenant), then (ensuite).',
      'Retiens : at 7 o’clock, at night, at the weekend ; on Saturday ; in December, in the morning. Devant last et this, rien : last weekend.',
    ],
    source: source('marqueurs temporels essentiels', '« Prepositions of time » et « How we make adverbials »'),
    sources: ['anglais-college-2025', 'bck-prepositions-time', 'bc-prepositions-time', 'bc-how-adverbials'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return markerSpot(rng);
    if (level === 2) return markerRecognise(rng);
    if (level === 3) return markerPreposition(rng);
    if (level === 4) return markerProduce(rng);
    return markerDocument(rng);
  },
};

// ——— 2. dates et ordinaux ———
const ordinal = (n: number): Ordinal => {
  const o = ORDINALS.find((x) => x.n === n);
  if (!o) throw new Error(`ordinal inconnu : ${n}`);
  return o;
};
const rank = (n: number) => (n === 1 ? '1er' : `${n}e`);
const CARDINALS: Readonly<Record<number, string>> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  21: 'twenty-one',
};
const ORDINAL_RULE = 'Une date se dit avec un nombre ordinal, celui qui donne le rang : le 1er, le 2e…';
const whyOrdinal = (o: Ordinal) => `« ${o.word} » (${o.short}) veut dire « ${rank(o.n)} ».`;

function ordinalSpot(rng: Rng): QuestionDraft {
  const o = rng.pick(ORDINALS);
  const wrong = others(rng, ORDINALS, o, 2);
  const { answer, traps } = choice(
    rng,
    o.word,
    wrong.map((w) => ({ label: w.word, why: whyOrdinal(w) })),
  );
  return {
    prompt: `Quel nombre ordinal anglais veut dire « ${rank(o.n)} » ?`,
    answer,
    traps,
    hint: 'Les rangs 1, 2 et 3 ont une forme à part, qui revient après les dizaines ; les autres finissent par -th, mais le mot du nombre change parfois un peu.',
    steps: [ORDINAL_RULE, whyOrdinal(o), `Réponse : **${o.word}**`],
  };
}

function ordinalShort(rng: Rng): QuestionDraft {
  const o = rng.pick(ORDINALS);
  const good = o.short.slice(-2);
  const { answer, traps } = choice(
    rng,
    o.short,
    ['st', 'nd', 'rd', 'th']
      .filter((end) => end !== good)
      .map((end) => ({
        label: `${o.n}${end}`,
        why: `L’abrégé reprend les deux dernières lettres du mot « ${o.word} » : ${good}.`,
      })),
  );
  return {
    prompt: `Quelle est l’écriture abrégée de « ${o.word} » ?`,
    answer,
    traps,
    hint: 'Observe la fin du mot écrit en toutes lettres.',
    steps: ['L’abrégé = le chiffre + les deux dernières lettres du mot.', `Réponse : **${o.short}**`],
  };
}

function ordinalMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, ORDINALS, 4).map((o) => [o.word, o.short] as const);
  return {
    prompt: `Associe chaque nombre ordinal à son écriture abrégée : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Les deux dernières lettres du mot se retrouvent après le chiffre.',
    steps: [ORDINAL_RULE, answered(rows)],
  };
}

const ordinalRecognise = (rng: Rng) => (coin(rng) ? ordinalShort(rng) : ordinalMatch(rng));

/** Formes erronées typiques d'un ordinal écrit en toutes lettres. */
function ordinalTraps(o: Ordinal): (readonly [string, string])[] {
  const cardinal = CARDINALS[o.n] ?? '';
  return [
    [cardinal, `« ${cardinal} » est le nombre qui compte ; pour un rang ou une date, il faut l’ordinal.`],
    [`${cardinal}th`, `On n’ajoute pas simplement -th à « ${cardinal} » : le mot s’écrit « ${o.word} ».`],
    [o.short, 'C’est l’écriture abrégée : la consigne demande le mot en toutes lettres.'],
    ...(o.word.includes('-')
      ? [[o.word.replace('-', ' '), `Il manque le trait d’union : « ${o.word} ».`] as const]
      : []),
  ];
}
/** Au niveau 3 : ordinaux formés en ajoutant simplement -th. */
const REGULAR = [4, 6, 10, 11] as const;
const IRREGULAR = [1, 2, 3, 5, 8, 9, 21] as const;

function ordinalWrite(rng: Rng): QuestionDraft {
  const o = ordinal(rng.pick(REGULAR));
  const cardinal = CARDINALS[o.n] ?? '';
  const month = rng.pick(MONTHS).en;
  return {
    prompt: `Écris en toutes lettres, en anglais, le nombre ordinal « ${rank(o.n)} » (le nombre « ${cardinal} » est donné) : « The party is on the … of ${month}. »`,
    ...written(
      [o.word],
      ordinalTraps(o).filter(([t]) => t !== o.word),
    ),
    hint: 'Pars du nombre donné et ajoute la terminaison des ordinaux réguliers.',
    steps: [
      'La plupart des ordinaux se forment avec le nombre suivi de -th.',
      `Réponse : **The party is on the ${o.word} of ${month}.**`,
    ],
  };
}

function ordinalIrregular(rng: Rng): QuestionDraft {
  const o = ordinal(rng.pick(IRREGULAR));
  const month = rng.pick(MONTHS);
  return {
    prompt: `La date est le ${o.n === 1 ? '1er' : o.n} ${month.fr}. Écris le mot qui manque, en toutes lettres : « My birthday is on the … of ${month.en}. »`,
    ...written([o.word], ordinalTraps(o)),
    hint: 'Ce rang a une orthographe particulière : récite les ordinaux depuis le début.',
    steps: [ORDINAL_RULE, whyOrdinal(o), `Réponse : **My birthday is on the ${o.word} of ${month.en}.**`],
  };
}

function dateWrite(rng: Rng): QuestionDraft {
  const o = ordinal(rng.pick(ORDINALS.map((x) => x.n)));
  const month = rng.pick(MONTHS);
  const m = month.en;
  const d = `${o.n}`;
  const forms = [
    `${d} ${m}`,
    `${o.short} ${m}`,
    `${m} ${o.short}`,
    `${m} ${d}`,
    `on ${d} ${m}`,
    `on ${o.short} ${m}`,
    `the ${o.short} of ${m}`,
    `on the ${o.short} of ${m}`,
    `${o.short} of ${m}`,
    `${m} the ${o.short}`,
    `on ${m} ${o.short}`,
    `on ${m} ${d}`,
    `on ${m} the ${o.short}`,
    `the ${o.short} ${m}`,
    `on the ${o.short} ${m}`,
  ];
  return {
    prompt: `Écris en anglais, avec le jour en chiffres, la date « le ${o.n === 1 ? '1er' : o.n} ${month.fr} ».`,
    ...written(
      forms,
      [
        [`${d} ${month.fr}`, `Le mois se dit en anglais : « ${m} ».`],
        [`${m} of ${d}`, '« of » ne suit pas le mois : on écrit the … of, puis le mois.'],
        [`${d} of ${m}`, 'Avec « of », on écrit l’ordinal précédé de the : the … of …'],
      ].filter(([t]) => !forms.some((f) => f.toLowerCase() === t?.toLowerCase())) as [string, string][],
    ),
    hint: 'Le jour en chiffres, puis le nom du mois en anglais, avec sa majuscule.',
    steps: [
      'La date s’écrit avec le jour et le mois : 19 October, ou October 19th.',
      `« ${month.fr} » se dit « ${m} ».`,
      `Réponse : **${d} ${m}**`,
    ],
  };
}

const ordinalProduce = (rng: Rng) => (coin(rng) ? ordinalIrregular(rng) : dateWrite(rng));

const NAMES = ['Ben', 'Emma', 'Leo', 'Maya', 'Sam', 'Zoe'] as const;

function dateDocument(rng: Rng): QuestionDraft {
  const names = some(rng, NAMES, 4).sort();
  const days = some(rng, ORDINALS, 4);
  const rows = names.map((name, i) => ({ name, day: at(days, i), month: rng.pick(MONTHS).en }));
  const asked = rows.map((r) => [`${r.name}’s birthday is on the `, [r.day.word], ` of ${r.month}.`] as const);
  return {
    prompt:
      'Lis le calendrier des anniversaires, puis écris chaque date comme on la dit : un ordinal en toutes lettres par trou.',
    figure: {
      kind: 'document',
      title: 'Birthdays',
      lines: rows.map((r) => `${r.name}: ${r.day.n} ${r.month}`),
      credit: ABOUT,
    },
    answer: cloze(asked),
    hint: 'Retrouve chaque prénom dans le calendrier, puis transforme le chiffre en rang.',
    steps: [
      'À l’écrit : 19 October. À l’oral : on the … of October, avec un ordinal.',
      ...rows.map((r) => `${r.name} : ${r.day.n} → ${r.day.word}.`),
      shown(asked),
    ],
  };
}

const dates: Skill = {
  id: 'a6-dates-ordinaux',
  title: 'Les dates et les nombres ordinaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **nombre ordinal** donne le rang : first (1st), second (2nd), third (3rd), puis souvent -th : fourth (4th).',
      'Une date s’écrit 5 May et se dit « on the fifth of May ».',
    ],
    source: source('dates et ordinaux', '« The great race » et « Prepositions of time »'),
    sources: [
      'anglais-college-2025',
      'bck-great-race',
      'bck-chant-nine-oclock',
      'bc-teens-numbers',
      'bc-prepositions-time',
      'bck-christmas-story',
    ],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return ordinalSpot(rng);
    if (level === 2) return ordinalRecognise(rng);
    if (level === 3) return ordinalWrite(rng);
    if (level === 4) return ordinalProduce(rng);
    return dateDocument(rng);
  },
};

// ——— 3. prépositions de lieu ———
interface Place {
  /** Formes admises ; la première est celle que l'on montre. */
  readonly forms: readonly [string, ...string[]];
  readonly fr: string;
  /** Phrase de niveau 3. */
  readonly before: string;
  readonly after: string;
}
const place = (fr: string, before: string, after: string, ...forms: [string, ...string[]]): Place => ({
  forms,
  fr,
  before,
  after,
});
const PLACES: readonly Place[] = [
  place('dans', 'The keys are', 'the box.', 'in', 'inside'),
  place('sur', 'The book is', 'the table.', 'on'),
  place('sous', 'The cat is sitting', 'the chair.', 'under', 'underneath', 'below', 'beneath'),
  place('au-dessus de', 'The lamp is', 'the table.', 'above', 'over'),
  place('devant', 'The bike is', 'the house.', 'in front of'),
  place('derrière', 'The dog is hiding', 'the door.', 'behind'),
  place('à côté de', 'Come and sit', 'me.', 'next to', 'beside'),
  place('entre', 'The library is', 'the bank and the museum.', 'between'),
  place('en face de', 'The bank is', 'the cinema.', 'opposite', 'across from'),
];
const placeOf = (word: string) => {
  const p = PLACES.find((x) => x.forms[0] === word);
  if (!p) throw new Error(`préposition inconnue : ${word}`);
  return p;
};
const whyPlace = (p: Place) => `« ${p.forms[0]} » veut dire « ${p.fr} ».`;
/** « devant » et « en face de » sont trop proches en français pour être proposés ensemble (niveaux 1 et 2). */
const NEAR_IN_FRENCH = ['in front of', 'opposite'] as const;
/** Les prépositions proposables avec `target` (ou dans une association) : jamais les deux voisines à la fois. */
function proposable(rng: Rng, target?: Place): readonly Place[] {
  const kept = NEAR_IN_FRENCH.find((w) => w === target?.forms[0]) ?? rng.pick(NEAR_IN_FRENCH);
  return PLACES.filter((p) => p.forms[0] === kept || !NEAR_IN_FRENCH.some((w) => w === p.forms[0]));
}
const PLACE_RULE = 'Une préposition de lieu se place devant le nom et dit où se trouve une personne ou un objet.';

function placeSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(PLACES);
  const { answer, traps } = choice(
    rng,
    p.fr,
    others(rng, proposable(rng, p), p, 2).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.forms[0]} ».` })),
  );
  return {
    prompt: `Que veut dire la préposition « ${p.forms[0]} » ?`,
    answer,
    traps,
    hint: 'Imagine un objet et une boîte : où le mot place-t-il l’objet ?',
    steps: [PLACE_RULE, whyPlace(p), `Réponse : **${p.fr}**`],
  };
}

function placeRecognise(rng: Rng): QuestionDraft {
  if (coin(rng)) {
    const p = rng.pick(PLACES);
    const { answer, traps } = choice(
      rng,
      p.forms[0],
      others(rng, proposable(rng, p), p, 3).map((o) => ({ label: o.forms[0], why: whyPlace(o) })),
    );
    return {
      prompt: `Quelle préposition anglaise veut dire « ${p.fr} » ?`,
      answer,
      traps,
      hint: 'Traduis chaque proposition avant de choisir.',
      steps: [PLACE_RULE, whyPlace(p), `Réponse : **${p.forms[0]}**`],
    };
  }
  const rows = some(rng, proposable(rng), 4).map((p) => [p.forms[0], p.fr] as const);
  return {
    prompt: `Associe chaque préposition à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Commence par les prépositions que tu connais le mieux.',
    steps: [PLACE_RULE, answered(rows)],
  };
}

const placeTraps = (good: readonly string[]) =>
  PLACES.filter((p) => !p.forms.some((f) => good.includes(f))).map((p) => [p.forms[0], whyPlace(p)] as const);

function placeWrite(rng: Rng): QuestionDraft {
  const p = rng.pick(PLACES);
  return {
    prompt: `Écris la préposition qui veut dire « ${p.fr} » : « ${p.before} … ${p.after} »`,
    ...written(p.forms, placeTraps(p.forms)),
    hint: 'Revois la liste des prépositions de lieu : certaines s’écrivent en plusieurs mots.',
    steps: [PLACE_RULE, whyPlace(p), `Réponse : **${p.before} ${p.forms[0]} ${p.after}**`],
  };
}

const WHY_SURFACE = '« on » : l’objet est posé ou fixé sur une surface ; on dit aussi on the fifth floor.';
const WHY_ACTIVITY = '« at » : lieu d’une activité (at work, at home) ou adresse précise avec un numéro.';
const WHY_INSIDE = '« in » : à l’intérieur d’un espace, comme dans in the world.';
const WHY_FRONT = 'Pour dire « devant », l’anglais emploie trois mots : in front of.';

/** Erreur typique : seule (explication de la ligne) ou avec sa propre explication. */
type Wrong = string | readonly [string, string];
const notBehind = (word: string) => [word, `« derrière », pour situer, se dit « behind » et non « ${word} ».`] as const;
/** Niveau 4 : [indication, début, fin, formes admises, explication, erreurs typiques]. */
const FIXED: readonly (readonly [string, string, string, readonly [string, ...string[]], string, readonly Wrong[]])[] =
  [
    ['au mur', 'There is a poster', 'the wall.', ['on'], WHY_SURFACE, ['at', 'in']],
    ['au cinquième étage', 'We live', 'the fifth floor.', ['on'], WHY_SURFACE, ['at', 'in']],
    ['au travail', 'My mum is', 'work.', ['at'], WHY_ACTIVITY, ['in', 'on', 'to']],
    ['à la maison', 'I am', 'home today.', ['at'], WHY_ACTIVITY, ['in', 'on', 'to']],
    ['au numéro 15', 'I live', '15 Craig Street.', ['at'], WHY_ACTIVITY, ['on', 'to']],
    ['dans le monde', 'It is the biggest lake', 'the world.', ['in'], WHY_INSIDE, ['on', 'at']],
    ['devant', 'Please don’t stand', 'the door.', ['in front of'], WHY_FRONT, ['in front', 'front of', 'before of']],
    [
      'à côté de',
      'My desk is',
      'the window.',
      ['next to', 'beside'],
      '« next to » s’écrit en deux mots.',
      ['next', 'next of', 'near of'],
    ],
    [
      'en face de',
      'Our school is',
      'the park.',
      ['opposite', 'across from'],
      '« opposite » ne prend pas de « of » ni de « to ».',
      [
        'opposite of',
        ['in front of', '« in front of » veut dire « devant » ; « en face de », de l’autre côté, se dit « opposite ».'],
        'face to',
      ],
    ],
    [
      'derrière',
      'There is a garden',
      'the house.',
      ['behind'],
      '« behind » s’emploie seul, sans « of ».',
      ['behind of', notBehind('after'), notBehind('back')],
    ],
  ];

function placeFixed(rng: Rng): QuestionDraft {
  const [cue, before, after, forms, why, wrong] = rng.pick(FIXED);
  return {
    prompt: `Complète (${cue}) : « ${before} … ${after} »`,
    ...written(
      forms,
      wrong.map((w) => (typeof w === 'string' ? ([w, why] as const) : w)),
    ),
    hint: 'Surface, intérieur, lieu d’activité ou position par rapport à un objet : choisis, puis vérifie le nombre de mots.',
    steps: [PLACE_RULE, why, `Réponse : **${before} ${forms[0]} ${after}**`],
  };
}

/** Niveau 5 : [phrase du récit en français, début, préposition, fin]. */
const SCENES: readonly (readonly [string, string, string, string])[] = [
  ['Le chat dort sous le lit.', 'The cat is sleeping ', 'under', ' the bed.'],
  ['Le chien est assis devant la porte.', 'The dog is sitting ', 'in front of', ' the door.'],
  ['Ben marche à côté de son vélo.', 'Ben is walking ', 'next to', ' his bike.'],
  ['La balle est dans le sac.', 'The ball is ', 'in', ' the bag.'],
  ['L’oiseau vole au-dessus de la maison.', 'The bird is flying ', 'above', ' the house.'],
  ['Emma saute derrière le mur.', 'Emma is jumping ', 'behind', ' the wall.'],
  ['La banque est en face du cinéma.', 'The bank is ', 'opposite', ' the cinema.'],
  ['La table est entre le canapé et la fenêtre.', 'The table is ', 'between', ' the sofa and the window.'],
  ['Le livre est sur la chaise.', 'The book is ', 'on', ' the chair.'],
];

function placeDocument(rng: Rng): QuestionDraft {
  const scenes = some(rng, SCENES, 4);
  const asked = scenes.map(([, before, word, after]) => [before, placeOf(word).forms, after] as const);
  return {
    prompt: 'Lis la scène décrite en français, puis complète sa version anglaise : une préposition de lieu par trou.',
    figure: { kind: 'document', title: 'The scene', lines: scenes.map((s) => s[0]), credit: ABOUT },
    answer: cloze(asked),
    hint: 'Dans chaque ligne, repère les mots qui situent, puis reconstruis-les en anglais.',
    steps: [PLACE_RULE, ...scenes.map(([fr, , word]) => `« ${fr} » : ${whyPlace(placeOf(word))}`), shown(asked)],
  };
}

const places: Skill = {
  id: 'a6-prepositions-lieu',
  title: 'Les prépositions de lieu',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **préposition** de lieu dit où : in (dans), on (sur), under (sous), above (au-dessus), between (entre), behind (derrière).',
      'Retiens aussi : in front of (devant), next to (à côté de), opposite (en face de).',
      'Elle se place devant le nom : The cat is under the chair. Pense aussi à at home, at work, on the wall.',
    ],
    source: source(
      'prépositions de lieu et verbes d’action',
      '« Prepositions of place » et « Adverbials of location »',
    ),
    sources: ['anglais-college-2025', 'bck-prepositions-place', 'bc-prepositions-place', 'bc-adverbials-location'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return placeSpot(rng);
    if (level === 2) return placeRecognise(rng);
    if (level === 3) return placeWrite(rng);
    if (level === 4) return placeFixed(rng);
    return placeDocument(rng);
  },
};

// ——— 4. suffixes -y, -er, -ly ———
const SUFFIX_ROLE: Readonly<Record<Suffix, string>> = {
  y: 'Le suffixe -y forme un adjectif à partir d’un nom : il décrit.',
  er: 'Le suffixe -er forme un nom à partir d’un verbe : la personne ou l’objet qui fait l’action.',
  ly: 'Le suffixe -ly forme un adverbe à partir d’un adjectif : il dit comment se fait l’action.',
};
const KIND: Readonly<Record<Suffix, string>> = { y: 'un adjectif', er: 'un nom', ly: 'un adverbe' };
const REGULAR_WORDS = DERIVED.filter((d) => !d.changes);
const whyDerived = (d: Derived) => `« ${d.word} » veut dire « ${d.fr} » (de « ${d.base} », ${d.baseFr}).`;

/** Adverbes dont les sens français se recouvrent : jamais l'un en distracteur de l'autre. */
const SAME_SENSE: readonly (readonly string[])[] = [
  ['quietly', 'gently'],
  ['happily', 'fortunately'],
  ['badly', 'terribly'],
];
const overlaps = (a: Derived, b: Derived) =>
  SAME_SENSE.some((group) => group.includes(a.word) && group.includes(b.word));

function suffixSpot(rng: Rng): QuestionDraft {
  const d = rng.pick(DERIVED);
  const other = rng.pick(DERIVED.filter((x) => x.base !== d.base && !overlaps(d, x)));
  const { answer, traps } = choice(
    rng,
    d.fr,
    [
      { label: d.baseFr, why: `« ${d.baseFr} » est le sens de la base « ${d.base} », sans suffixe.` },
      { label: other.fr, why: `« ${other.fr} » se dit « ${other.word} ».` },
    ].filter((o) => o.label !== d.fr),
  );
  return {
    prompt: `Que veut dire « ${d.word} » ?`,
    answer,
    traps,
    hint: 'Cherche le petit mot caché au début, puis demande-toi ce que la fin ajoute.',
    steps: [SUFFIX_ROLE[d.suffix], whyDerived(d), `Réponse : **${d.fr}**`],
  };
}

function suffixRecognise(rng: Rng): QuestionDraft {
  if (coin(rng)) {
    const d = rng.pick(DERIVED);
    const good = KIND[d.suffix];
    const { answer, traps } = choice(
      rng,
      good,
      ['un adjectif', 'un nom', 'un adverbe', 'un verbe']
        .filter((k) => k !== good)
        .map((k) => ({ label: k, why: SUFFIX_ROLE[d.suffix] })),
    );
    return {
      prompt: `« ${d.word} » vient de « ${d.base} ». Quelle sorte de mot est « ${d.word} » ?`,
      answer,
      traps,
      hint: 'Regarde le suffixe : sert-il à décrire, à nommer ou à dire comment ?',
      steps: [SUFFIX_ROLE[d.suffix], `Réponse : **${good}**`],
    };
  }
  const rows = (['y', 'er', 'ly'] as const)
    .map((s) => rng.pick(DERIVED.filter((d) => d.suffix === s)))
    .map((d) => [d.word, d.fr] as const);
  return {
    prompt: `Associe chaque mot dérivé à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Pour chaque mot, retrouve la base, puis regarde le suffixe.',
    steps: ['Un suffixe change la sorte du mot et son sens.', answered(rows)],
  };
}

function suffixWrite(rng: Rng): QuestionDraft {
  const d = rng.pick(REGULAR_WORDS);
  const wrong = (['y', 'er', 'ly'] as const)
    .filter((s) => s !== d.suffix)
    .map((s) => [`${d.base}${s}`, SUFFIX_ROLE[d.suffix]] as const);
  return {
    prompt: `Ajoute un suffixe à « ${d.base} » (${d.baseFr}) pour écrire ${KIND[d.suffix]} qui veut dire « ${d.fr} ».`,
    ...written([d.word], [...wrong, [d.base, 'C’est la base seule : il manque le suffixe.']]),
    hint: 'Choisis entre -y (décrire), -er (qui fait l’action) et -ly (comment).',
    steps: [SUFFIX_ROLE[d.suffix], `**${d.base}** + -${d.suffix}`, `Réponse : **${d.word}**`],
  };
}

/** Niveau 4, orthographe et exceptions : [phrase, base, formes admises, explication, erreurs typiques]. */
const TRICKY: readonly (readonly [string, string, readonly [string, ...string[]], string, readonly string[]])[] = [
  ['It is a very … day.', 'sun', ['sunny'], 'On double le n : sun → sunny.', ['suny', 'sun', 'sunly']],
  [
    'My aunt is a … .',
    'write',
    ['writer'],
    'Le e final de write sert déjà : writer.',
    ['writeer', 'writter', 'writor'],
  ],
  [
    'He is a bus … .',
    'drive',
    ['driver'],
    'drive se termine par e : on ajoute seulement r.',
    ['driveer', 'drivver', 'drivor'],
  ],
  [
    'She is a jewellery … .',
    'make',
    ['maker'],
    'make se termine par e : on ajoute seulement r.',
    ['makeer', 'makker', 'makor'],
  ],
  [
    'He wants to be a film … .',
    'act',
    ['actor'],
    'Exception à connaître : act donne actor, avec -or.',
    ['acter', 'acty', 'actly'],
  ],
  ['She won … .', 'easy', ['easily'], 'Le y devient i devant -ly : easy → easily.', ['easyly', 'easly', 'easy']],
  [
    'The children are playing … .',
    'happy',
    ['happily'],
    'Le y devient i devant -ly : happy → happily.',
    ['happyly', 'happly', 'happy'],
  ],
  [
    'Close the door … .',
    'gentle',
    ['gently'],
    'Le e final disparaît : gentle → gently.',
    ['gentlely', 'gentlly', 'gentle'],
  ],
  [
    'I dance … .',
    'terrible',
    ['terribly'],
    'Le e final disparaît : terrible → terribly.',
    ['terriblely', 'terriblly', 'terrible'],
  ],
  [
    'You speak English very … .',
    'good',
    ['well'],
    'L’adverbe de good est irrégulier : well.',
    ['goodly', 'good', 'goodely'],
  ],
  [
    'My mum drives very … .',
    'fast',
    ['fast'],
    'fast garde la même forme comme adverbe ; après very, pas de comparatif en -er.',
    ['fastly', 'faster', 'fasty'],
  ],
  [
    'Do you work very …?',
    'hard',
    ['hard'],
    'hard garde la même forme (hardly a un autre sens) ; après very, pas de comparatif en -er.',
    ['hardly', 'harder', 'hardy'],
  ],
];

function suffixTricky(rng: Rng): QuestionDraft {
  const [sentence, base, forms, why, wrong] = rng.pick(TRICKY);
  return {
    prompt: `Complète avec le mot formé sur « ${base} » : « ${sentence} »`,
    ...written(
      forms,
      wrong.map((w) => [w, why] as const),
    ),
    hint: 'Attention à l’orthographe : une lettre peut doubler, changer ou disparaître, et il y a des exceptions.',
    steps: [`La base est « ${base} ».`, why, `Réponse : **${forms[0]}**`],
  };
}

/** Niveau 5 : [ligne du portrait, début, mot, fin]. */
const PORTRAIT: readonly (readonly [string, string, string, string])[] = [
  ['Maya likes to sing.', 'Maya is a good ', 'singer', '.'],
  ['Ben loves to play tennis.', 'Ben is a tennis ', 'player', '.'],
  ['Mr Hill can teach maths.', 'Mr Hill is a maths ', 'teacher', '.'],
  ['Mrs Cole likes to drive buses.', 'Mrs Cole is a bus ', 'driver', '.'],
  ['There are many clouds today.', 'The sky is ', 'cloudy', '.'],
  ['There is a lot of rain this week.', 'It is a ', 'rainy', ' week.'],
  ['Zoe loves sport.', 'Zoe is very ', 'sporty', '.'],
  ['Leo is a quiet boy.', 'Leo speaks ', 'quietly', '.'],
  ['Emma is careful with her bike.', 'Emma rides her bike ', 'carefully', '.'],
  ['Sam is happy when he sings.', 'Sam sings ', 'happily', '.'],
  ['The rabbit is quick.', 'The rabbit runs ', 'quickly', '.'],
];
const derivedOf = (word: string) => {
  const d = DERIVED.find((x) => x.word === word);
  if (!d) throw new Error(`mot dérivé inconnu : ${word}`);
  return d;
};

function suffixDocument(rng: Rng): QuestionDraft {
  const bySuffix = (s: Suffix) => PORTRAIT.filter(([, , w]) => derivedOf(w).suffix === s);
  const one = (['y', 'er', 'ly'] as const).map((s) => rng.pick(bySuffix(s)));
  const extra = rng.pick(PORTRAIT.filter((p) => !one.includes(p)));
  const rows = rng.shuffle([...one, extra]);
  const asked = rows.map(([, before, word, after]) => [before, [word], after] as const);
  return {
    prompt:
      'Lis le message, puis redis chaque information avec un mot en -y, -er ou -ly formé sur un mot de la même ligne.',
    figure: { kind: 'document', title: 'My class', lines: rows.map((r) => r[0]), credit: ABOUT },
    answer: cloze(asked),
    hint: 'Pour chaque trou, demande-toi : faut-il décrire, nommer une personne ou dire comment ?',
    steps: [
      `${SUFFIX_ROLE.y} ${SUFFIX_ROLE.er} ${SUFFIX_ROLE.ly}`,
      ...rows.map(([, , w]) => `${derivedOf(w).base} → ${w}.`),
      shown(asked),
    ],
  };
}

const suffixes: Skill = {
  id: 'a6-suffixes',
  title: 'Les suffixes -y, -er, -ly',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **suffixe** s’ajoute à la fin d’un mot : cloud → cloudy (adjectif), sing → singer (nom), quiet → quietly (**adverbe**).',
      'L’orthographe change parfois : sunny, writer, happily. Exceptions : actor, well, fast.',
    ],
    source: source('suffixes de dérivation', '« Adverbials of manner », « Adverbs » et « Noun modifiers »'),
    sources: [
      'anglais-college-2025',
      'bc-adverbials-manner',
      'bck-adverbs',
      'bc-noun-modifiers',
      'bck-flashcards-weather',
      'bck-weather-live',
      'bck-spring-winter',
      'bck-great-race',
      'bck-adjectives',
    ],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return suffixSpot(rng);
    if (level === 2) return suffixRecognise(rng);
    if (level === 3) return suffixWrite(rng);
    if (level === 4) return suffixTricky(rng);
    return suffixDocument(rng);
  },
};

// ——— 5. noms composés ———
const COMPOUND_RULE = 'Dans un nom composé, le premier mot précise, le second dit ce qu’est la chose.';
const parts = (c: Compound) => `« ${c.en} » : ${c.head} (la chose), précisé par ${c.modifier}.`;

function compoundSpot(rng: Rng): QuestionDraft {
  const c = rng.pick(COMPOUNDS);
  const { answer, traps } = choice(
    rng,
    c.fr,
    others(rng, COMPOUNDS, c, 2).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
  );
  return {
    prompt: `Que désigne le nom composé « ${c.en} » ?`,
    answer,
    traps,
    hint: 'Coupe le mot en deux et commence par le sens du second.',
    steps: [COMPOUND_RULE, parts(c), `Réponse : **${c.fr}**`],
  };
}

const WHY_ORDER = 'L’ordre est inversé : en anglais, le mot qui précise vient en premier.';
const WHY_OF = 'Un nom composé met les deux mots côte à côte, sans « of ».';
const WHY_GENITIVE = 'Pas de ’s ici : les deux noms se placent simplement l’un après l’autre.';
const reversed = (c: Compound) => (c.en.includes(' ') ? `${c.head} ${c.modifier}` : `${c.head}${c.modifier}`);
const wrongCompounds = (c: Compound): (readonly [string, string])[] => [
  [reversed(c), WHY_ORDER],
  [`${c.head} of ${c.modifier}`, WHY_OF],
  [`${c.modifier}’s ${c.head}`, WHY_GENITIVE],
];

function compoundRecognise(rng: Rng): QuestionDraft {
  if (coin(rng)) {
    const c = rng.pick(COMPOUNDS);
    const { answer, traps } = choice(
      rng,
      c.en,
      wrongCompounds(c).map(([label, why]) => ({ label, why })),
    );
    return {
      prompt: `Quel nom composé veut dire « ${c.fr} » ?`,
      answer,
      traps,
      hint: 'Cherche le mot principal : en anglais, il se place à la fin.',
      steps: [COMPOUND_RULE, parts(c), `Réponse : **${c.en}**`],
    };
  }
  const rows = some(rng, COMPOUNDS, 4).map((c) => [c.en, c.fr] as const);
  return {
    prompt: `Associe chaque nom composé à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Lis d’abord le second mot de chaque nom composé.',
    steps: [COMPOUND_RULE, answered(rows)],
  };
}

/** « lunch box » et « dinner time » s'écrivent aussi en un mot. */
const GLUED_ALSO: readonly string[] = ['lunch box', 'dinner time'];
const compoundForms = (c: Compound) => (GLUED_ALSO.includes(c.en) ? [c.en, c.en.replace(' ', '')] : [c.en]);
function compoundTraps(c: Compound): (readonly [string, string])[] {
  return [
    ...wrongCompounds(c),
    [`${c.modifier}'s ${c.head}`, WHY_GENITIVE],
    ...(c.en.includes(' ') ? [] : [[`${c.modifier} ${c.head}`, `« ${c.en} » s’écrit en un seul mot.`] as const]),
  ];
}

function compoundBuild(rng: Rng): QuestionDraft {
  const c = rng.pick(COMPOUNDS);
  // Les deux mots sont présentés dans l'ordre alphabétique, qui ne dit rien du bon ordre.
  const [a, b] = [c.head, c.modifier].sort() as [string, string];
  return {
    prompt: `Forme le nom composé qui veut dire « ${c.fr} » avec les mots « ${a} » et « ${b} » (${c.en.includes(' ') ? 'en deux mots' : 'en un seul mot'}).`,
    ...written(compoundForms(c), compoundTraps(c)),
    hint: 'Demande-toi lequel des deux mots dit ce qu’est la chose : il se place à la fin.',
    steps: [COMPOUND_RULE, parts(c), `Réponse : **${c.en}**`],
  };
}

/** Niveau 4 : sans les mots anglais ; seuls les composés dont chaque mot est courant. */
const FROM_FRENCH = [
  'snowman',
  'bedroom',
  'apple pie',
  'kitchen window',
  'coat pocket',
  'village church',
  'shopping list',
  'swimming lesson',
  'washing machine',
  'dinner time',
] as const;
const compoundOf = (en: string) => {
  const c = COMPOUNDS.find((x) => x.en === en);
  if (!c) throw new Error(`nom composé inconnu : ${en}`);
  return c;
};

function compoundProduce(rng: Rng): QuestionDraft {
  const c = compoundOf(rng.pick(FROM_FRENCH));
  // « cours de natation » se lit aussi au pluriel.
  const plural = c.en === 'swimming lesson' ? ['swimming lessons'] : [];
  return {
    // Les initiales désignent les mots attendus : d'autres traductions justes existent (apple tart, grocery list…).
    prompt: `Écris le nom composé anglais qui veut dire « ${c.fr} » (initiales des deux mots qui le forment : « ${c.modifier.charAt(0)} » puis « ${c.head.charAt(0)} »).`,
    ...written([...compoundForms(c), ...plural], compoundTraps(c)),
    hint: 'Traduis les deux idées séparément, puis place en dernier celle qui nomme la chose.',
    steps: [COMPOUND_RULE, parts(c), `Réponse : **${c.en}**`],
  };
}

/** Niveau 5 : [ligne du message, début, nom composé, fin]. */
const NOTES: readonly (readonly [string, string, string, string])[] = [
  ['Dad’s car has got a red door.', 'The ', 'car door', ' is red.'],
  ['There is a small window in the kitchen.', 'Open the ', 'kitchen window', ', please.'],
  ['My coat has got a big pocket.', 'The key is in my ', 'coat pocket', '.'],
  ['One leg of the chair is broken.', 'The ', 'chair leg', ' is broken.'],
  ['Our village has got an old church.', 'We visit the ', 'village church', '.'],
  ['Mum writes a list before she goes shopping.', 'Her ', 'shopping list', ' is on the table.'],
  ['On Friday, I have got a lesson: we learn to go swimming.', 'My ', 'swimming lesson', ' is on Friday.'],
  ['This machine is for washing clothes.', 'The ', 'washing machine', ' is new.'],
];

function compoundDocument(rng: Rng): QuestionDraft {
  const rows = some(rng, NOTES, 4);
  const asked = rows.map(([, before, word, after]) => [before, compoundForms(compoundOf(word)), after] as const);
  return {
    prompt:
      'Lis les notes, puis redis chaque information plus court : un nom composé par trou (deux mots pris dans la ligne).',
    figure: { kind: 'document', title: 'Home notes', lines: rows.map((r) => r[0]), credit: ABOUT },
    answer: cloze(asked),
    hint: 'Dans chaque ligne, trouve la chose dont on parle et le mot qui la précise ; mets la chose en dernier.',
    steps: [COMPOUND_RULE, ...rows.map(([, , w]) => parts(compoundOf(w))), shown(asked)],
  };
}

const compounds: Skill = {
  id: 'a6-noms-composes',
  title: 'Les noms composés',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **nom composé** réunit deux mots : le premier précise, le second dit la chose : apple pie = une tarte aux pommes.',
      'Pas de « of » ni de ’s : kitchen window. Certains s’écrivent en un seul mot : bedroom, snowman.',
    ],
    source: source('(A1+) noms composés', '« Noun modifiers »'),
    sources: ['anglais-college-2025', 'bc-noun-modifiers'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return compoundSpot(rng);
    if (level === 2) return compoundRecognise(rng);
    if (level === 3) return compoundBuild(rng);
    if (level === 4) return compoundProduce(rng);
    return compoundDocument(rng);
  },
};

export const ENGLISH_WORDS_6E_CHAPTER: Chapter = {
  id: 'a6-temps-espace-mots',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Temps, espace, formation des mots',
  skills: [timeMarkers, dates, places, suffixes, compounds],
};
