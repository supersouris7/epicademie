import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { COLOURS, DATES, DAYS, MONTHS, SEASONS, WEATHER, type SourcedDate, type Word } from './temps-faits.ts';

/**
 * Anglais CM1 — « Le temps qui passe » (lot an-cm1-03, docs/adr/0034). Programme : cycle 3, langues vivantes
 * (lexique de l'environnement immédiat ; « Faire une brève annonce (date, anniversaire…) »). Mots et phrases :
 * British Council et programmes officiels (voir temps-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes, CM1';
const source = (detail: string) =>
  `${PROGRAMME} — lexique de l’environnement immédiat de l’élève ; brève annonce (date, anniversaire). ${detail}`;

const at = <T>(list: readonly T[], i: number): T => {
  const x = list[i];
  if (x === undefined) throw new Error(`indice ${i} hors liste`);
  return x;
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** « de » élidé devant un prénom qui commence par une voyelle : d’Ana, d’Emir. */
const de = (name: string) => (/^[AEIOU]/.test(name) ? `d’${name}` : `de ${name}`);
const some = <T>(rng: Rng, list: readonly T[], n: number): T[] => rng.shuffle(list).slice(0, n);
const others = <T>(rng: Rng, list: readonly T[], not: T, n: number): T[] =>
  some(
    rng,
    list.filter((x) => x !== not),
    n,
  );
/** Mélange jusqu'à ce que l'ordre présenté ne soit plus l'ordre juste. */
function shuffledOther<T>(rng: Rng, list: readonly T[]): T[] {
  let out = rng.shuffle(list);
  while (out.every((x, i) => x === list[i])) out = rng.shuffle(list);
  return out;
}
const accepted = (w: Word): string[] => [w.en, ...(w.alt ?? [])];

// ——— Questions communes au vocabulaire ———

/** Niveau 1 : le mot anglais parmi 3. */
function pickEnglish(rng: Rng, list: readonly Word[], kind: string, hint: string): QuestionDraft {
  const w = rng.pick(list);
  const { answer, traps } = choice(
    rng,
    w.en,
    others(rng, list, w, 2).map((o) => ({ label: o.en, why: `« ${o.en} » veut dire « ${o.fr} ».` })),
  );
  return {
    prompt: `Comment dit-on « ${w.fr} » en anglais (${kind}) ?`,
    answer,
    traps,
    hint,
    steps: [`On cherche le mot anglais pour « ${w.fr} ».`, `Réponse : **${w.en}**`],
  };
}

/** Niveau 2 : comprendre un mot (4 choix) ou relier 3 paires. */
function understand(rng: Rng, list: readonly Word[], kind: string): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const w = rng.pick(list);
    const { answer, traps } = choice(
      rng,
      w.fr,
      others(rng, list, w, 3).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} » en anglais.` })),
    );
    return {
      prompt: `Que veut dire « ${w.en} » (${kind}) ?`,
      answer,
      traps,
      hint: 'Dis le mot à voix haute. Dans quelle chanson ou quelle phrase l’as-tu entendu ?',
      steps: [`On lit le mot anglais « ${w.en} ».`, `Il veut dire **${w.fr}**.`],
    };
  }
  return pairs(rng, list, 3);
}

function pairs(rng: Rng, list: readonly Word[], n: number): QuestionDraft {
  const rows = some(rng, list, n);
  const left = rows.map((w) => w.en);
  const right = shuffledOther(
    rng,
    rows.map((w) => w.fr),
  );
  return {
    prompt: `Associe chaque mot anglais à son sens : ${left.join(', ')}.`,
    answer: { kind: 'match', left, right, pairs: rows.map((w) => right.indexOf(w.fr)) },
    hint: 'Commence par le mot que tu connais le mieux. Les autres seront plus faciles.',
    steps: [
      'On relie chaque mot anglais à son sens.',
      ...rows.map((w) => `${w.en} → ${w.fr}`),
      `Réponse : **${rows.map((w) => `${w.en} = ${w.fr}`).join(' ; ')}**`,
    ],
  };
}

/** Niveau 3 : écrire le mot. */
function write(rng: Rng, list: readonly Word[], kind: string): QuestionDraft {
  const w = rng.pick(list);
  const other = at(others(rng, list, w, 1), 0);
  return {
    prompt: `Écris en anglais (${kind}) : « ${w.fr} »`,
    answer: { kind: 'text', accepted: accepted(w) },
    traps: [
      { text: w.typo, why: `Presque ! Regarde bien les lettres : le mot s’écrit « ${w.en} ».` },
      { text: other.en, why: `« ${other.en} » veut dire « ${other.fr} ».` },
    ],
    hint: `Le mot commence par « ${w.en.slice(0, 1)} » et compte ${w.en.length} lettres.`,
    steps: [`On cherche le mot anglais pour « ${w.fr} ».`, `Réponse : **${w.en}**`],
  };
}

/** Mot suivant ou précédent dans un cycle (jours, mois, saisons). */
function neighbour(rng: Rng, list: readonly Word[], unit: string): QuestionDraft {
  const i = rng.int(0, list.length - 1);
  const next = rng.int(0, 1) === 0;
  const w = at(list, i);
  const good = at(list, (i + (next ? 1 : list.length - 1)) % list.length);
  const bad = at(list, (i + (next ? list.length - 1 : 1)) % list.length);
  const two = at(list, (i + (next ? 2 : list.length - 2)) % list.length);
  const where = next ? 'juste après' : 'juste avant';
  return {
    prompt: `Écris en anglais ${unit} qui vient ${where} « ${w.en} ».`,
    answer: { kind: 'text', accepted: accepted(good) },
    traps: [
      { text: bad.en, why: `Attention au sens : « ${bad.en} » vient ${next ? 'avant' : 'après'} « ${w.en} ».` },
      { text: good.typo, why: `Le bon choix, mais regarde les lettres : « ${good.en} ».` },
      ...(two.en !== bad.en && two.en !== good.en
        ? [{ text: two.en, why: `Tu as sauté un pas : « ${two.en} » est deux places plus loin.` }]
        : []),
    ],
    hint: 'Récite la liste dans l’ordre, du début, et arrête-toi sur le mot donné.',
    steps: [
      `« ${w.en} » veut dire « ${w.fr} ».`,
      `Dans la liste, ${where} vient « ${good.fr} ».`,
      `Réponse : **${good.en}**`,
    ],
  };
}

/** Remettre des mots d'un cycle dans l'ordre (suite continue, sans passer par la fin de liste). */
function ordering(rng: Rng, list: readonly Word[], n: number, unit: string): QuestionDraft {
  const start = rng.int(0, list.length - n);
  const right = list.slice(start, start + n).map((w) => w.en);
  const items = shuffledOther(rng, right);
  return {
    prompt: `Remets ${unit} dans l’ordre, à partir de « ${at(right, 0)} » : ${items.join(', ')}.`,
    answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
    hint: 'Récite la liste dans ta tête, en commençant par le premier mot donné.',
    steps: ['On suit l’ordre de la liste, un mot après l’autre.', `Réponse : **${right.join(', ')}**`],
  };
}

// ——— 1. Les couleurs ———
const THINGS: readonly { readonly one: string; readonly many: string; readonly fr: string }[] = [
  { one: 'cat', many: 'cats', fr: 'chats' },
  { one: 'bag', many: 'bags', fr: 'sacs' },
  { one: 'ball', many: 'balls', fr: 'ballons' },
  { one: 'car', many: 'cars', fr: 'voitures' },
  { one: 'bird', many: 'birds', fr: 'oiseaux' },
];
const PLURAL_FR: Readonly<Record<string, readonly [string, string]>> = {
  red: ['rouges', 'rouges'],
  blue: ['bleus', 'bleues'],
  green: ['verts', 'vertes'],
  black: ['noirs', 'noires'],
  white: ['blancs', 'blanches'],
  yellow: ['jaunes', 'jaunes'],
};
const colourWord = (en: string): Word => {
  const w = COLOURS.find((c) => c.en === en);
  if (!w) throw new Error(`couleur inconnue : ${en}`);
  return w;
};

const colours: Skill = {
  id: 'acm1-couleurs',
  title: 'Les couleurs',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Les couleurs : red (rouge), yellow (jaune), blue (bleu), green (vert), pink (rose), purple (violet).',
      'Aussi : orange (orange), brown (marron), black (noir), white (blanc), grey (gris).',
      'La couleur est un **adjectif** : elle se place avant le nom et ne prend pas de s. Exemple : three black cats.',
    ],
    source: source('Mots : British Council, « Colours flashcards » et « Adjectives ».'),
    sources: ['cycle3-2020', 'bck-flashcards-colours', 'bck-adjectives'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        COLOURS.slice(0, 6),
        'une couleur',
        'Pense à la couleur, puis au mot entendu en classe ou en chanson.',
      );
    if (level === 2) return understand(rng, COLOURS, 'une couleur');
    if (level === 3) return write(rng, COLOURS, 'une couleur');
    if (level === 4) {
      const thing = rng.pick(THINGS);
      const c = colourWord(rng.pick(Object.keys(PLURAL_FR)));
      const feminine = thing.fr === 'voitures';
      const frColour = at(PLURAL_FR[c.en] ?? [], feminine ? 1 : 0);
      const [n, num] = rng.pick([
        [2, 'two'],
        [3, 'three'],
        [4, 'four'],
        [5, 'five'],
      ] as const);
      const good = `${num} ${c.en} ${thing.many}`;
      return {
        prompt: `Écris en anglais, en lettres : « ${n} ${thing.fr} ${frColour} ».`,
        answer: { kind: 'text', accepted: [good, `${good}.`] },
        traps: [
          { text: `${num} ${thing.many} ${c.en}`, why: 'En anglais, la couleur se place avant le nom.' },
          { text: `${num} ${c.en}s ${thing.many}`, why: 'Un adjectif anglais ne prend jamais de s au pluriel.' },
          { text: `${num} ${c.en} ${thing.one}`, why: 'Il y en a plusieurs : le nom prend un s.' },
        ],
        hint: `« ${thing.fr} » se dit « ${thing.many} ». Dans l’ordre : le nombre, la couleur, puis le nom.`,
        steps: [
          `On écrit le nombre : « ${num} ».`,
          `Puis la couleur sans s : « ${c.en} ». Puis le nom : « ${thing.many} ».`,
          `Réponse : **${good}**`,
        ],
      };
    }
    const things = some(rng, ['bag', 'ball', 'car', 'bike'], 3);
    // « orange » demanderait « an » : on l'écarte de la question.
    const picked = some(
      rng,
      COLOURS.filter((x) => x.en !== 'orange'),
      3,
    );
    const kids = some(rng, ['Emir', 'Ana', 'Yuna', 'Paul'], 3);
    const i = rng.int(0, 2);
    const thing = at(things, i);
    const c = at(picked, i);
    const good = `a ${c.en} ${thing}`;
    const forms = accepted(c).map((colour) => `a ${colour} ${thing}`);
    return {
      prompt: `Lis les messages. Un des objets est ${c.fr}. Écris-le en anglais avec sa couleur, en commençant par « a ».`,
      figure: {
        kind: 'document',
        title: 'Our things',
        lines: kids.map((k, j) => `${k}: My ${at(things, j)} is ${at(picked, j).en}.`),
        credit: 'Écrit pour l’exercice.',
      },
      answer: { kind: 'text', accepted: forms.flatMap((f) => [f, `${f}.`]) },
      traps: [
        { text: `a ${thing} ${c.en}`, why: 'En anglais, la couleur se place avant le nom.' },
        { text: `${c.en} ${thing}`, why: 'Il manque le petit mot « a » au début.' },
        ...[0, 1, 2]
          .filter((j) => j !== i)
          .map((j) => ({
            text: `a ${at(picked, j).en} ${at(things, j)}`,
            why: `Cet objet est ${at(picked, j).fr}. Cherche l’objet ${c.fr}.`,
          })),
      ],
      hint: 'Traduis d’abord la couleur et cherche-la dans les messages. En anglais, la place-t-on avant ou après l’objet ?',
      steps: [
        `« ${c.fr} » se dit « ${c.en} ».`,
        `On lit : « My ${thing} is ${c.en}. »`,
        'La couleur se place avant le nom.',
        `Réponse : **${good}**`,
      ],
    };
  },
};

// ——— 2. Les jours ———
const MENU = ['chicken soup', 'green salad', 'vegetable soup', 'egg salad', 'lentil soup'];

const days: Skill = {
  id: 'acm1-jours',
  title: 'Les jours de la semaine',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La semaine : Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
      'En anglais, un jour commence par une **majuscule**. Exemple : on Monday (le lundi).',
    ],
    source: source(
      'Jours : British Council (menu d’école, « Prepositions of time ») ; programme d’anglais du collège.',
    ),
    sources: ['cycle3-2020', 'bck-lunch-menu', 'bck-prepositions-time', 'anglais-college-2025'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return pickEnglish(rng, DAYS, 'un jour', 'Pense à la date écrite au tableau le matin.');
    if (level === 2) return understand(rng, DAYS, 'un jour');
    if (level === 3) return write(rng, DAYS, 'un jour');
    if (level === 4) return rng.int(0, 1) === 0 ? neighbour(rng, DAYS, 'le jour') : ordering(rng, DAYS, 5, 'ces jours');
    const soups = rng.shuffle(MENU);
    // Menu du lundi au vendredi : on part d'un plat et on avance (ou recule) d'un jour, sans sortir du menu.
    const step = rng.int(0, 1) === 0 ? 1 : -1;
    const i = step === 1 ? rng.int(0, 3) : rng.int(1, 4);
    const from = at(DAYS, i);
    const wanted = at(DAYS, i + step);
    const opposite = at(DAYS, (i - step + DAYS.length) % DAYS.length);
    const dish = at(soups, i);
    const when = step === 1 ? 'le lendemain' : 'la veille';
    const meaning = step === 1 ? 'le jour juste après' : 'le jour juste avant';
    return {
      prompt: `Lis le menu (les lignes sont mélangées). Cherche ${when} (${meaning}) du jour où l’on mange « ${dish} ». Écris ce jour en anglais.`,
      figure: {
        kind: 'document',
        title: 'Lunch menu',
        lines: shuffledOther(
          rng,
          soups.map((s, j) => `${at(DAYS, j).en}: ${s}`),
        ),
        credit: 'Écrit pour l’exercice, d’après un menu d’école du British Council.',
      },
      answer: { kind: 'text', accepted: accepted(wanted) },
      traps: [
        { text: from.en, why: `« ${from.en} » est le jour de « ${dish} ». On demande ${when}.` },
        { text: opposite.en, why: `Attention au sens : on demande ${when}.` },
        { text: wanted.fr, why: 'C’est le bon jour, mais il faut l’écrire en anglais.' },
        { text: wanted.typo, why: `Regarde bien les lettres : « ${wanted.en} ».` },
      ],
      hint: `Trouve d’abord le jour du plat. Puis ${step === 1 ? 'avance' : 'recule'} d’un jour dans la semaine.`,
      steps: [
        `« ${dish} » est sur la ligne de « ${from.en} » (${from.fr}).`,
        `${cap(when)} de ce jour, c’est ${wanted.fr}.`,
        `Réponse : **${wanted.en}**`,
      ],
    };
  },
};

// ——— 3. Les mois ———
const months: Skill = {
  id: 'acm1-mois',
  title: 'Les mois de l’année',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’année compte 12 mois : January, February, March, April, May, June, July, August, September, October…',
      '…puis November et December. Chaque mois prend une **majuscule**. Exemple : in May (en mai).',
    ],
    source: source('Mois : British Council, chanson « Time for another year ».'),
    sources: ['cycle3-2020', 'bck-song-year', 'bc-prepositions-time'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(rng, MONTHS, 'un mois', 'Beaucoup de mois ressemblent au français. Compare les débuts.');
    if (level === 2) return understand(rng, MONTHS, 'un mois');
    if (level === 3) return write(rng, MONTHS, 'un mois');
    if (level === 4)
      return rng.int(0, 1) === 0 ? neighbour(rng, MONTHS, 'le mois') : ordering(rng, MONTHS, 5, 'ces mois');
    const kids = some(rng, ['Emir', 'Ana', 'Yuna', 'Paul'], 3);
    const i = rng.int(0, 10);
    const wanted = at(MONTHS, i + 1);
    const before = at(MONTHS, i);
    const [extra1, extra2] = some(
      rng,
      MONTHS.filter((m) => m !== wanted && m !== before),
      2,
    ) as [Word, Word];
    const owner = at(kids, 0);
    const lines = rng.shuffle([
      `${owner}: My birthday is in the month after ${before.en}.`,
      `${at(kids, 1)}: My birthday is in ${extra1.en}.`,
      `${at(kids, 2)}: My birthday is in ${extra2.en}.`,
    ]);
    return {
      prompt: `Lis les messages. En quel mois est l’anniversaire ${de(owner)} ? Écris le mois en anglais.`,
      figure: { kind: 'document', title: 'Birthdays', lines, credit: 'Écrit pour l’exercice.' },
      answer: { kind: 'text', accepted: accepted(wanted) },
      traps: [
        { text: before.en, why: `« after » veut dire « après » : il faut le mois qui suit « ${before.en} ».` },
        { text: wanted.fr, why: 'C’est le bon mois, mais il faut l’écrire en anglais.' },
        { text: extra1.en, why: `C’est le mois ${de(at(kids, 1))}. Lis la ligne ${de(owner)}.` },
      ],
      hint: '« after » veut dire « après ». Récite les mois jusqu’au mois écrit.',
      steps: [
        `${owner} dit : le mois après « ${before.en} ».`,
        `Après « ${before.en} » vient « ${wanted.en} ».`,
        `Réponse : **${wanted.en}**`,
      ],
    };
  },
};

// ——— 4. Les saisons ———
const CLUES: readonly { readonly season: string; readonly en: string; readonly fr: string }[] = [
  { season: 'spring', en: 'Flowers open and baby lambs play.', fr: 'les fleurs s’ouvrent, les agneaux jouent' },
  { season: 'spring', en: 'New green leaves grow on the trees.', fr: 'de nouvelles feuilles vertes poussent' },
  { season: 'summer', en: 'We swim in the sea in the hot sun.', fr: 'on nage dans la mer sous un soleil chaud' },
  { season: 'summer', en: 'We eat ice cream. The days are long.', fr: 'on mange des glaces, les jours sont longs' },
  {
    season: 'autumn',
    en: 'The leaves turn brown and drop to the ground.',
    fr: 'les feuilles deviennent marron et tombent par terre',
  },
  { season: 'autumn', en: 'Squirrels collect their nuts.', fr: 'les écureuils ramassent leurs noisettes' },
  { season: 'winter', en: 'We wait for snow. It is very cold.', fr: 'on attend la neige, il fait très froid' },
  { season: 'winter', en: 'The lake is freezing and my nose is red.', fr: 'le lac gèle et mon nez est rouge' },
];
const season = (en: string): Word => {
  const w = SEASONS.find((s) => s.en === en);
  if (!w) throw new Error(`saison inconnue : ${en}`);
  return w;
};

const seasons: Skill = {
  id: 'acm1-saisons',
  title: 'Les saisons',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Les quatre saisons : spring (printemps), summer (été), autumn (automne), winter (hiver).',
      'Pour dire « en été », « en hiver », on met **in** : in summer, in winter.',
      'En anglais américain, l’automne se dit aussi fall.',
    ],
    source: source('Saisons : British Council, poème « Spring to winter » et « Prepositions of time ».'),
    sources: ['cycle3-2020', 'bck-spring-winter', 'bc-prepositions-time', 'bck-song-year', 'bc-british-american'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        SEASONS,
        'une saison',
        'Pense au temps qu’il fait et à ce que tu fais à ce moment de l’année.',
      );
    if (level === 2) return understand(rng, SEASONS, 'une saison');
    if (level === 3) return write(rng, SEASONS, 'une saison');
    if (level === 4) {
      if (rng.int(0, 1) === 0) return neighbour(rng, SEASONS, 'la saison');
      const w = rng.pick(SEASONS);
      const fr = { spring: 'au printemps', summer: 'en été', autumn: 'en automne', winter: 'en hiver' }[w.en];
      return {
        prompt: `Écris en anglais, en deux mots : « ${fr ?? ''} ».`,
        answer: { kind: 'text', accepted: accepted(w).flatMap((s) => [`in ${s}`, `in the ${s}`]) },
        traps: [
          { text: `on ${w.en}`, why: '« on » va avec un jour ou une date. Pour une saison, on met « in ».' },
          { text: `at ${w.en}`, why: '« at » va avec une heure. Pour une saison, on met « in ».' },
          { text: w.en, why: 'Il manque le petit mot devant la saison.' },
        ],
        hint: 'Un petit mot de deux lettres, puis la saison.',
        steps: ['Devant une saison, on met « in ».', `Réponse : **in ${w.en}**`],
      };
    }
    const first = rng.pick(CLUES);
    const good = season(first.season);
    return {
      prompt: 'Lis le texte. De quelle saison parle-t-il ? Écris-la en anglais.',
      figure: {
        kind: 'document',
        title: 'Which season?',
        lines: [first.en],
        credit: 'Écrit pour l’exercice, d’après un poème du British Council.',
      },
      answer: { kind: 'text', accepted: accepted(good) },
      traps: [
        ...SEASONS.filter((s) => s !== good).map((s) => ({
          text: s.en,
          why: `Ce n’est pas ${s.fr}. Relis la scène : ${first.fr}.`,
        })),
        { text: good.typo, why: `La bonne saison, mais elle s’écrit « ${good.en} ».` },
      ],
      hint: 'Imagine la scène. Quel temps fait-il ? Que font les gens ou la nature ?',
      steps: [`Le texte dit : ${first.fr}.`, `Cela se passe pendant ${good.fr}.`, `Réponse : **${good.en}**`],
    };
  },
};

// ——— 5. La date ———
const suffix = (n: number): string =>
  n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th';
const dateEn = (d: SourcedDate) => `${d.day} ${d.month}`;
const frMonth = (en: string) => MONTHS.find((m) => m.en === en)?.fr ?? en;
const dateFr = (d: SourcedDate) => `${d.day === 1 ? '1er' : d.day} ${frMonth(d.month)}`;
const dateAccepted = ({ day, month }: SourcedDate): string[] => {
  const o = `${day}${suffix(day)}`;
  return [
    `${day} ${month}`,
    `${o} ${month}`,
    `the ${o} of ${month}`,
    `${o} of ${month}`,
    `${month} ${day}`,
    `${month} ${o}`,
    `${month} the ${o}`,
  ];
};
/** Date précédée (ou non) de « on ». */
const withOn = (forms: readonly string[]): string[] => forms.flatMap((f) => [f, `on ${f}`]);
/** Date avec son jour de la semaine : « Friday 5 July », « Friday, July 5th ». */
const withDay = (weekday: string, forms: readonly string[]): string[] =>
  forms.flatMap((f) => [`${weekday} ${f}`, `${weekday}, ${f}`]);
const otherMonth = (rng: Rng, month: string): string => rng.pick(MONTHS.filter((m) => m.en !== month)).en;

const date: Skill = {
  id: 'acm1-date',
  title: 'La date',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour écrire la date : le numéro, puis le mois (19 October = 19 octobre). Avec le jour : Friday 31 October.',
      'Devant un jour ou une date, on met **on**. Devant un mois seul, on met **in** : on 19 October, in October.',
    ],
    source: source('Dates : British Council, « Prepositions of time » ; programme d’anglais du collège (ordinaux).'),
    sources: [
      'cycle3-2020',
      'bc-prepositions-time',
      'bck-prepositions-time',
      'bck-halloween-invitation',
      'bck-sports-day',
      'anglais-college-2025',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    const d = rng.pick(DATES);
    if (level === 1) {
      const m = otherMonth(rng, d.month);
      const { answer, traps } = choice(rng, dateEn(d), [
        { label: `${d.day} ${m}`, why: `« ${m} » veut dire « ${frMonth(m)} » : ce n’est pas le bon mois.` },
        {
          label: `${d.day > 20 ? d.day - 10 : d.day + 10} ${d.month}`,
          why: 'Le mois est bon, mais le numéro du jour a changé.',
        },
      ]);
      return {
        prompt: `Comment écrit-on « le ${dateFr(d)} » en anglais ?`,
        answer,
        traps,
        hint: 'Vérifie les deux morceaux : le numéro, puis le mois.',
        steps: [`Le numéro est ${d.day}, le mois est « ${d.month} ».`, `Réponse : **${dateEn(d)}**`],
      };
    }
    if (level === 2) {
      const [kind, text, good] = rng.pick([
        ['une date', `My birthday is … ${dateEn(d)}.`, 'on'],
        ['un jour', `The party is … ${rng.pick(DAYS).en}.`, 'on'],
        ['un mois', `My birthday is … ${d.month}.`, 'in'],
        ['une saison', `We swim in the sea … ${rng.pick(['summer', 'spring'])}.`, 'in'],
      ] as const);
      const why: Readonly<Record<string, string>> = {
        on: '« on » va avec un jour ou une date.',
        in: '« in » va avec un mois, une saison ou une année.',
        at: '« at » va avec une heure.',
      };
      const { answer, traps } = choice(
        rng,
        good,
        ['on', 'in', 'at']
          .filter((x) => x !== good)
          .map((x) => ({ label: x, why: `${why[x] ?? ''} Ici, après le trou, on lit ${kind}.` })),
      );
      return {
        prompt: `Complète : « ${text} »`,
        answer,
        traps,
        hint: 'Regarde le mot après le trou : un jour, une date, un mois ou une saison ?',
        steps: [`Après le trou, on lit ${kind}.`, why[good] ?? '', `Réponse : **${good}**`],
      };
    }
    if (level === 3) {
      const m = otherMonth(rng, d.month);
      return {
        prompt: `Écris en anglais la date : « le ${dateFr(d)} ».`,
        answer: { kind: 'text', accepted: withOn(dateAccepted(d)) },
        traps: [
          { text: `${d.day} ${frMonth(d.month)}`, why: `Écris le mois en anglais : « ${d.month} ».` },
          { text: `${d.day} ${m}`, why: `« ${m} » veut dire « ${frMonth(m)} ».` },
          { text: d.month, why: 'Il manque le numéro du jour.' },
        ],
        hint: 'Écris d’abord le numéro, puis le mois en anglais avec sa majuscule.',
        steps: [`Le numéro : ${d.day}.`, `Le mois : « ${d.month} ».`, `Réponse : **${dateEn(d)}**`],
      };
    }
    if (level === 4) {
      if (rng.int(0, 1) === 0) {
        const other = rng.pick(DATES.filter((x) => x.month !== d.month));
        return {
          prompt: `Écris « on » ou « in » dans chaque trou : « The match is … ${dateEn(d)}. The party is … ${other.month}. »`,
          answer: {
            kind: 'cloze',
            parts: ['The match is ', ` ${dateEn(d)}. The party is `, ` ${other.month}.`],
            blanks: [
              { mode: 'text', accepted: ['on'] },
              { mode: 'text', accepted: ['in'] },
            ],
          },
          hint: 'Un trou après l’autre : y a-t-il un numéro de jour, ou seulement un mois ?',
          steps: [
            `« ${dateEn(d)} » est une date : on écrit **on**.`,
            `« ${other.month} » est un mois seul : on écrit **in**.`,
          ],
        };
      }
      const day = rng.pick(DAYS);
      const good = `on ${day.en} ${dateEn(d)}`;
      return {
        prompt: `Écris en anglais, avec le petit mot qui va devant : « le ${day.fr} ${dateFr(d)} ».`,
        answer: { kind: 'text', accepted: withDay(day.en, dateAccepted(d)).map((f) => `on ${f}`) },
        traps: [
          { text: `${day.en} ${dateEn(d)}`, why: 'Il manque le petit mot qui va devant une date.' },
          { text: `in ${day.en} ${dateEn(d)}`, why: '« in » va avec un mois seul. Devant une date, on met « on ».' },
          { text: `on ${day.en} ${d.day} ${frMonth(d.month)}`, why: `Écris le mois en anglais : « ${d.month} ».` },
        ],
        hint: 'Trouve d’abord le petit mot qui va devant une date. Chaque jour et chaque mois prend une majuscule.',
        steps: [
          'Devant une date, on met « on ».',
          `Le jour : « ${day.en} ». Le numéro : ${d.day}. Le mois : « ${d.month} ».`,
          `Réponse : **${good}**`,
        ],
      };
    }
    const start = rng.int(1, 20);
    const month = rng.pick(MONTHS).en;
    const gap = rng.int(1, 4);
    const asked = at(DAYS, gap);
    const good: SourcedDate = { day: start + gap, month };
    return {
      prompt: `Lis le mot de la classe. Quelle est la date de « ${asked.en} » si la semaine commence le « ${start} ${month} » ? Écris-la en anglais.`,
      figure: {
        kind: 'document',
        title: 'School week',
        lines: [`Week beginning: Monday ${start} ${month}`, `${asked.en}: class trip!`],
        credit: 'Écrit pour l’exercice.',
      },
      answer: {
        kind: 'text',
        accepted: withOn([...dateAccepted(good), ...withDay(asked.en, dateAccepted(good))]),
      },
      traps: [
        { text: `${start} ${month}`, why: `C’est la date de « Monday ». Compte les jours jusqu’à « ${asked.en} ».` },
        { text: `${good.day + 1} ${month}`, why: 'Tu as compté un jour de trop.' },
        { text: asked.en, why: 'On demande la date : un numéro et un mois.' },
      ],
      hint: 'Monday a le premier numéro. Ajoute 1 à chaque jour qui suit.',
      steps: [
        `« Monday » est le ${start}.`,
        `De « Monday » à « ${asked.en} », on avance de ${gap} jour${gap > 1 ? 's' : ''}.`,
        `Réponse : **${dateEn(good)}**`,
      ],
    };
  },
};

// ——— 6. La météo ———
const weather: Skill = {
  id: 'acm1-meteo',
  title: 'La météo',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour demander le temps qu’il fait : « What’s the weather like today? ».',
      'Réponds avec **it’s** et un mot de la météo. Exemple : It’s hot and sunny. (Il fait chaud et beau.)',
      'Le ciel : sunny (ensoleillé), rainy (pluvieux), cloudy (nuageux), windy (venteux), snowy (neigeux).',
      'Aussi : stormy (orageux), foggy (avec du brouillard), hot (chaud), cold (froid).',
    ],
    source: source('Météo : British Council, « Weather flashcards » et « The weather where I live ».'),
    sources: ['cycle3-2020', 'bck-flashcards-weather', 'bck-weather-live', 'bck-weather-your-turn'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        WEATHER.slice(0, 5),
        'la météo',
        'Imagine le ciel de ce jour-là, puis pense au mot entendu en classe ou en chanson.',
      );
    if (level === 2) {
      if (rng.int(0, 2) === 0) {
        const w = rng.pick(WEATHER);
        const { answer, traps } = choice(
          rng,
          w.fr,
          others(rng, WEATHER, w, 3).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
        );
        return {
          prompt: 'Écoute. Quel temps fait-il ?',
          audio: { text: `It’s ${w.en} today.`, lang: 'en-GB' },
          answer,
          traps,
          hint: 'Écoute bien le mot juste avant « today ».',
          steps: [`On entend « It’s ${w.en} today. »`, `Réponse : **${w.fr}**`],
        };
      }
      return understand(rng, WEATHER, 'la météo');
    }
    if (level === 3) return write(rng, WEATHER, 'la météo');
    if (level === 4) {
      const w = rng.pick(WEATHER);
      const other = at(others(rng, WEATHER, w, 1), 0);
      const forms = accepted(w);
      return {
        prompt: `Réponds à « What’s the weather like? » par une phrase avec « it’s » : le temps est « ${w.fr} ».`,
        answer: {
          kind: 'text',
          accepted: forms.flatMap((f) => [`It’s ${f}`, `It’s ${f}.`, `It is ${f}`, `It is ${f}.`]),
        },
        traps: [
          { text: w.en, why: 'Le mot est bon. Fais une phrase : commence par « It’s ».' },
          { text: `Its ${w.en}.`, why: '« its » veut dire « son » ou « sa ». Il faut « it’s », avec une apostrophe.' },
          { text: `It’s ${other.en}.`, why: `« ${other.en} » veut dire « ${other.fr} ».` },
        ],
        hint: 'Commence par « It’s », puis ajoute le mot de la météo.',
        steps: [`Le temps « ${w.fr} » se dit « ${w.en} ».`, `Réponse : **It’s ${w.en}.**`],
      };
    }
    // Deux villes ont un seul mot en commun : il faut comparer, puis écrire la phrase.
    const common = rng.pick(['cold', 'windy', 'cloudy']);
    const [a, b, c, d] = rng.shuffle(['cold', 'windy', 'cloudy', 'rainy', 'snowy'].filter((x) => x !== common)) as [
      string,
      string,
      string,
      string,
    ];
    const [first, second, third] = some(rng, ['London', 'Glasgow', 'Cardiff', 'Belfast'], 3) as [
      string,
      string,
      string,
    ];
    const day = rng.pick(DAYS).en;
    const pair = (x: string, y: string) => rng.shuffle([x, y]).join(' and ');
    const lines = rng.shuffle([
      `In ${first}, it’s ${pair(common, a)}.`,
      `In ${second}, it’s ${pair(common, b)}.`,
      `In ${third}, it’s ${pair(c, d)}.`,
    ]);
    const frWord = WEATHER.find((w) => w.en === common)?.fr ?? common;
    return {
      prompt: `Lis le bulletin. Quel temps fait-il à la fois à ${first} et à ${second} ? Réponds en anglais avec « it’s » et un seul mot.`,
      figure: {
        kind: 'document',
        title: `Weather on ${day}`,
        lines,
        credit: 'Bulletin imaginaire, écrit pour l’exercice.',
      },
      answer: { kind: 'text', accepted: [`It’s ${common}`, `It’s ${common}.`, `It is ${common}`, `It is ${common}.`] },
      traps: [
        { text: common, why: 'Le mot est bon. Fais une phrase : commence par « It’s ».' },
        { text: `It’s ${a}.`, why: `Ce temps est écrit pour ${first}, mais pas pour ${second}.` },
        { text: `It’s ${b}.`, why: `Ce temps est écrit pour ${second}, mais pas pour ${first}.` },
        { text: `Its ${common}.`, why: '« its » veut dire « son » ou « sa ». Il faut « it’s », avec une apostrophe.' },
      ],
      hint: 'Lis les lignes de ces deux villes. Quel mot revient dans les deux ?',
      steps: [
        `${first} : « ${common} » et « ${a} ». ${second} : « ${common} » et « ${b} ».`,
        `Le mot commun est « ${common} » (${frWord}).`,
        `Réponse : **It’s ${common}.**`,
      ],
    };
  },
};

export const ENGLISH_TIME_CHAPTER: Chapter = {
  id: 'acm1-temps',
  subject: 'anglais',
  grade: 'cm1',
  domain: 'langue',
  title: 'Le temps qui passe',
  skills: [colours, days, months, seasons, date, weather],
};
