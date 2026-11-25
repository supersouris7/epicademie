import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { numberWord, ORDERS, type Order } from './ecoute-faits.ts';
import { spellings } from './presentation-faits.ts';
import { PETS, SPORTS } from './gouts-faits.ts';
import { COLOURS, DAYS, WEATHER, type Word } from './temps-faits.ts';
import { at, shuffledOther, some } from './temps.ts';

/**
 * Anglais CM1 — « Écouter et comprendre » (lot an-cm1-06, docs/adr/0034). Programme : langues vivantes,
 * cours moyen première année (arrêté du 26 février 2026, compréhension de l'oral : chiffres, consignes à
 * l'impératif, mots familiers, informations d'un message, repères culturels). Mots et faits : British Council
 * (voir ecoute-faits.ts : chaque fait y porte sa source et sa citation).
 *
 * Toute notion mêle des questions d'écoute et des questions à lire (alternative sans voix anglaise).
 */
const PROGRAMME =
  'Programme de langues vivantes, cours moyen première année (arrêté du 26 février 2026, BO n° 12, annexe 2)';
const source = (detail: string) => `${PROGRAMME} — compréhension de l’oral, repères culturels. ${detail}`;

/** « de » élidé devant un prénom qui commence par une voyelle. */
const de = (name: string) => (/^[AEIOU]/.test(name) ? `d’${name}` : `de ${name}`);
/** « que » élidé devant un prénom qui commence par une voyelle. */
const que = (name: string) => (/^[AEIOU]/.test(name) ? `qu’${name}` : `que ${name}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`, `${f}!`]);
const flip = (rng: Rng) => rng.int(0, 1) === 0;
const written = (rng: Rng, lines: readonly string[], title: string) => ({
  kind: 'document' as const,
  title,
  lines: [...lines],
  credit: 'Écrit pour l’exercice.',
});
const KIDS = ['Ana', 'Emir', 'Yuna', 'Tom', 'Lisa', 'Paul'] as const;

// ——— 1. Les nombres entendus ———

const sound = (text: string) => ({ text, lang: 'en-GB' });
const isTeen = (n: number) => n >= 13 && n <= 19;
const whyNumber = (x: number, n: number) => `« ${numberWord(x)} » veut dire ${x}, pas ${n}.`;
const numberChoice = (rng: Rng, n: number, wrong: readonly number[]) =>
  choice(
    rng,
    String(n),
    wrong.map((x) => ({ label: String(x), why: whyNumber(x, n) })),
  );

/** Niveau 1 : de 1 à 12, trois propositions. */
function heardSmall(rng: Rng): QuestionDraft {
  const n = rng.int(1, 12);
  // Les propositions dépendent du nombre : deux nombres entendus n’ont jamais les mêmes.
  const { answer, traps } = numberChoice(rng, n, [((n + 3) % 12) + 1, ((n + 6) % 12) + 1]);
  const heard = flip(rng);
  return {
    prompt: heard ? 'Écoute. Quel nombre entends-tu ?' : `Lis le mot « ${numberWord(n)} ». Quel nombre est-ce ?`,
    ...(heard ? { audio: sound(`${numberWord(n)}.`) } : {}),
    answer,
    traps,
    hint: 'Récite tout bas « one, two, three… » et compte sur tes doigts.',
    steps: [
      `« ${numberWord(n)} » veut dire ${n} : en comptant depuis « one », on arrive à ce mot.`,
      `Réponse : **${n}**`,
    ],
  };
}

/** Niveau 2 : -teen (13 à 19) ou -ty (les dizaines). */
function heardTeen(rng: Rng): QuestionDraft {
  const k = rng.int(3, 9);
  const teen = flip(rng);
  const n = teen ? 10 + k : 10 * k;
  const wrong = teen ? [10 * k, k, 10 * k + 1] : [10 + k, 10 * k + k, k];
  const { answer, traps } = numberChoice(rng, n, wrong);
  const heard = flip(rng);
  return {
    prompt: heard
      ? 'Écoute bien la fin du mot. Quel nombre entends-tu ?'
      : `Lis le mot « ${numberWord(n)} ». Quel nombre est-ce ?`,
    ...(heard ? { audio: sound(`${numberWord(n)}.`) } : {}),
    answer,
    traps,
    hint: 'La fin du mot compte : -teen (de 13 à 19) ou -ty (les dizaines) ?',
    steps: [
      `« ${numberWord(n)} » finit par ${teen ? '-teen : c’est un nombre de 13 à 19' : '-ty : c’est une dizaine'}.`,
      `Réponse : **${n}**`,
    ],
  };
}

/** Messages à nombre fixe : un même énoncé attend toujours la même réponse. */
interface Message {
  readonly ask: string;
  readonly text: (word: string) => string;
  readonly n: number;
}
const MESSAGES: readonly Message[] = [
  { ask: 'Combien d’autocollants a Tom ?', text: (w) => `Tom has got ${w} stickers.`, n: 35 },
  { ask: 'Combien de livres a Ana ?', text: (w) => `Ana has got ${w} books.`, n: 24 },
  { ask: 'Quel est le numéro de la maison de Paul ?', text: (w) => `Paul’s house is number ${w}.`, n: 58 },
  { ask: 'Combien de billes a Lisa ?', text: (w) => `Lisa has got ${w} marbles.`, n: 47 },
  { ask: 'Combien d’élèves y a-t-il à l’école ?', text: (w) => `There are ${w} children in my school.`, n: 90 },
  { ask: 'Quel est le numéro du bus d’Emir ?', text: (w) => `Emir takes bus number ${w}.`, n: 62 },
  { ask: 'Combien de cartes a Yuna ?', text: (w) => `Yuna has got ${w} cards.`, n: 13 },
  { ask: 'Combien de pages a le livre de Tom ?', text: (w) => `Tom’s book has got ${w} pages.`, n: 76 },
  { ask: 'Combien de bonbons y a-t-il dans le sac ?', text: (w) => `There are ${w} sweets in the bag.`, n: 18 },
  { ask: 'Quel âge a le grand-père d’Ana ?', text: (w) => `Ana’s grandpa is ${w}.`, n: 81 },
];

/** Explication d'un nombre composé : dizaine puis unité. */
const parts = (n: number) =>
  n > 20 && n % 10 !== 0
    ? `« ${numberWord(n)} » : « ${numberWord(n - (n % 10))} » (${n - (n % 10)}) puis « ${numberWord(n % 10)} » (${n % 10}).`
    : `« ${numberWord(n)} » est un nombre à apprendre en un seul mot : ${n}.`;

const digitTraps = (n: number) => {
  const swapped = (n % 10) * 10 + Math.floor(n / 10);
  const near = isTeen(n) ? (n - 10) * 10 : n + 10 > 99 ? n - 10 : n + 10;
  return [
    ...(swapped !== n && swapped > 9
      ? [{ text: String(swapped), why: 'Tu as inversé les chiffres : d’abord la dizaine, puis l’unité.' }]
      : []),
    { text: String(near), why: `Vérifie la dizaine et la fin du mot : « ${numberWord(n)} » veut dire ${n}.` },
    {
      text: String(Math.floor(n / 10)),
      why: `Il faut deux chiffres : « ${numberWord(n)} » veut dire ${n}.`,
    },
  ];
};

/** Niveau 3 : écrire en chiffres un nombre entendu (ou lu) entre 20 et 99. */
function heardDigits(rng: Rng): QuestionDraft {
  if (flip(rng)) {
    const m = rng.pick(MESSAGES);
    return {
      prompt: `Écoute. ${m.ask} Écris le nombre en chiffres.`,
      audio: sound(m.text(numberWord(m.n))),
      answer: { kind: 'text', accepted: [String(m.n)] },
      traps: digitTraps(m.n),
      hint: 'Repère le nombre dans la phrase, puis écoute bien sa fin : -teen, -ty, ou un deuxième petit nombre ?',
      steps: ['On repère le mot-nombre dans la phrase.', parts(m.n), `Réponse : **${m.n}**`],
    };
  }
  const n = rng.int(2, 9) * 10 + rng.int(1, 9);
  return {
    prompt: `Écris en chiffres : « ${numberWord(n)} ».`,
    answer: { kind: 'text', accepted: [String(n)] },
    traps: digitTraps(n),
    hint: 'La partie avant le tiret donne la dizaine, la partie après donne l’unité.',
    steps: [parts(n), `Réponse : **${n}**`],
  };
}

/** Niveau 4 : écrire le nombre en lettres, sans propositions. */
function heardWords(rng: Rng): QuestionDraft {
  const heard = flip(rng);
  const m = rng.pick(MESSAGES);
  const n = heard ? m.n : rng.int(2, 9) * 10 + rng.int(0, 9);
  const word = numberWord(n);
  const other = numberWord(isTeen(n) ? (n - 10) * 10 : n % 10 === 0 ? n / 10 + 10 : n - (n % 10));
  return {
    prompt: heard ? `Écoute. ${m.ask} Écris le nombre en lettres, en anglais.` : `Écris ${n} en lettres, en anglais.`,
    ...(heard ? { audio: sound(m.text(word)) } : {}),
    answer: { kind: 'text', accepted: spellings(word) },
    traps: [
      { text: word.replace('-', ''), why: 'Entre la dizaine et l’unité, on met un tiret (ou on sépare les mots).' },
      { text: other, why: `« ${other} » n’est pas le même nombre : on veut ${n}.` },
      { text: String(n), why: 'On demande le nombre en lettres, en anglais, pas en chiffres.' },
      ...(word.startsWith('forty')
        ? [{ text: word.replace('forty', 'fourty'), why: '« forty » s’écrit sans « u », même si « four » en a un.' }]
        : []),
    ].filter((t) => !spellings(word).includes(t.text)),
    hint: 'De 13 à 19, le mot finit par -teen. Après 20, écris la dizaine (-ty), puis l’unité s’il y en a une.',
    steps: [`On cherche le mot anglais pour ${n}.`, parts(n), `Réponse : **${word}**`],
  };
}

/** Niveau 5 : plusieurs nombres dans un message, il faut garder le bon. */
function heardContext(rng: Rng): QuestionDraft {
  const kid = rng.pick(KIDS);
  const i = KIDS.indexOf(kid);
  const age = 7 + i;
  const house = 31 + i * 11;
  const cards = 15 + i * 7;
  const text = `Hello, I’m ${kid}. I’m ${numberWord(age)}. My house is number ${numberWord(house)}. I’ve got ${numberWord(cards)} cards.`;
  const asked = rng.pick([
    {
      q: `Quel est le numéro de la maison ${de(kid)}`,
      n: house,
      other: cards,
      clue: `My house is number ${numberWord(house)}.`,
    },
    { q: `Combien de cartes a ${kid}`, n: cards, other: house, clue: `I’ve got ${numberWord(cards)} cards.` },
  ]);
  const heard = flip(rng);
  return {
    prompt: `${heard ? 'Écoute' : 'Lis'} le message ${de(kid)}. ${asked.q} ? Écris le nombre en chiffres.`,
    ...(heard ? { audio: sound(text) } : { figure: written(rng, text.split(/(?<=\.) /), 'A message') }),
    answer: { kind: 'text', accepted: [String(asked.n)] },
    traps: [
      { text: String(asked.other), why: 'C’est un autre nombre du message : relis ou réécoute le mot juste à côté.' },
      { text: String(age), why: `C’est l’âge ${de(kid)} : il est dit dans « I’m ${numberWord(age)} ».` },
    ],
    hint: 'Il y a trois nombres. Cherche le mot qui dit de quoi on parle : « house » ou « cards » ?',
    steps: [`On cherche la phrase qui parle de la chose demandée : « ${asked.clue} »`, `Réponse : **${asked.n}**`],
  };
}

const numbersHeard: Skill = {
  id: 'acm1-nombres-entendus',
  title: 'Les nombres entendus',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Écoute la fin du mot : **-teen** (thirteen, 13) ou **-ty** (thirty, 30). Elle change tout !',
      'Les grands nombres se construisent : la dizaine, un **tiret**, puis l’unité. forty-two = 42.',
    ],
    source: source('Nombres : British Council, LearnEnglish Kids (cartes 1-12, 13-24 et 10-1000).'),
    sources: ['lve-cm-2026', 'bck-flashcards-1-12', 'bck-flashcards-13-24', 'bck-flashcards-10-1000'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return heardSmall(rng);
    if (level === 2) return heardTeen(rng);
    if (level === 3) return heardDigits(rng);
    if (level === 4) return heardWords(rng);
    return heardContext(rng);
  },
};

// ——— 2. Les consignes de classe (impératif) ———

const bang = (s: string) => `${cap(s)}!`;
const dont = (o: Order) => `Don’t ${o.en}`;
const verbs = (o: Order) => [o.en, ...(o.alt ?? [])];
/** Écritures justes d'une consigne (variantes admises, avec ou sans « please »). */
const forms = (o: Order) =>
  full(verbs(o).flatMap((b) => [b, `${b} please`, `${b}, please`, `please ${b}`, `please, ${b}`]));
/** Interdictions justes : « please » se place avant « don’t » ou à la fin, jamais après « don’t ». */
const negativeForms = (o: Order) =>
  full(
    verbs(o).flatMap((b) =>
      ['don’t', 'do not'].flatMap((no) => [
        `${no} ${b}`,
        `${no} ${b} please`,
        `${no} ${b}, please`,
        `please ${no} ${b}`,
        `please, ${no} ${b}`,
      ]),
    ),
  );
/** Consignes dont l’interdiction est naturelle (pas « Don’t be quiet! »). */
type Negatable = Order & { readonly not: string };
const NEGATABLE: readonly Negatable[] = ORDERS.filter((o): o is Negatable => o.not !== undefined);
const WHY_IMPERATIVE = 'Une consigne commence par le verbe : pas de « you », pas de « to ».';

function orderMeaning(rng: Rng): QuestionDraft {
  const i = rng.int(0, ORDERS.length - 1);
  const o = at(ORDERS, i);
  // Les autres propositions dépendent de la consigne : deux consignes entendues n’ont jamais les mêmes.
  const wrong = [3, 7].map((step) => at(ORDERS, (i + step) % ORDERS.length));
  const { answer, traps } = choice(
    rng,
    o.fr,
    wrong.map((w) => ({ label: w.fr, why: `« ${w.fr} » se dit « ${bang(w.en)} ».` })),
  );
  const heard = flip(rng);
  return {
    prompt: heard
      ? 'Écoute la maîtresse. Que dois-tu faire ?'
      : `La consigne est « ${bang(o.en)} ». Que dois-tu faire ?`,
    ...(heard ? { audio: sound(bang(o.en)) } : {}),
    answer,
    traps,
    hint: 'Mime la consigne dans ta tête, comme en classe d’anglais.',
    steps: [`« ${bang(o.en)} » veut dire « ${o.fr} ».`, `Réponse : **${o.fr}**`],
  };
}

function orderSecond(rng: Rng): QuestionDraft {
  if (flip(rng)) {
    const rows = some(rng, ORDERS, 3);
    const left = rows.map((o) => bang(o.en));
    const right = shuffledOther(
      rng,
      rows.map((o) => o.fr),
    );
    return {
      prompt: `Associe chaque consigne à son sens : ${left.join(' ')}`,
      answer: { kind: 'match', left, right, pairs: rows.map((o) => right.indexOf(o.fr)) },
      hint: 'Commence par la consigne que tu entends le plus souvent.',
      steps: [
        'On relie chaque consigne à son sens.',
        ...rows.map((o) => `${bang(o.en)} → ${o.fr}`),
        `Réponse : **${rows.map((o) => `${bang(o.en)} = ${o.fr}`).join(' ; ')}**`,
      ],
    };
  }
  const o = rng.pick(ORDERS);
  const others = some(
    rng,
    ORDERS.filter((x) => x !== o),
    3,
  );
  const { answer, traps } = choice(
    rng,
    bang(o.en),
    others.map((w) => ({ label: bang(w.en), why: `« ${bang(w.en)} » veut dire « ${w.fr} ».` })),
  );
  return {
    prompt: `Ton camarade doit faire ceci : « ${o.fr} » Que lui dis-tu en anglais ?`,
    answer,
    traps,
    hint: 'Pense au geste, puis au verbe anglais qui va avec.',
    steps: [`On cherche le verbe anglais pour « ${o.fr} ».`, `Réponse : **${bang(o.en)}**`],
  };
}

/** Consigne donnée à chaque enfant : l'énoncé change avec la réponse. */
const SAID: readonly (readonly [string, number])[] = [
  ['Ana', 3],
  ['Emir', 2],
  ['Yuna', 10],
  ['Tom', 15],
  ['Lisa', 11],
  ['Paul', 12],
];

function orderWrite(rng: Rng): QuestionDraft {
  const heard = flip(rng);
  const [kid, index] = rng.pick(SAID);
  const o = heard ? at(ORDERS, index) : rng.pick(ORDERS);
  const other = at(
    some(
      rng,
      ORDERS.filter((x) => x !== o),
      1,
    ),
    0,
  );
  return {
    prompt: heard
      ? `Écoute la consigne donnée à ${kid}. Écris-la en anglais.`
      : `Écris en anglais la consigne : « ${o.fr} »`,
    ...(heard ? { audio: sound(bang(o.en)) } : {}),
    answer: { kind: 'text', accepted: forms(o) },
    traps: [
      { text: o.typo, why: `Presque ! Regarde les lettres : « ${o.en} ».` },
      { text: `you ${o.en}`, why: WHY_IMPERATIVE },
      { text: `to ${o.en}`, why: WHY_IMPERATIVE },
      { text: other.en, why: `« ${other.en} » veut dire « ${other.fr} ».` },
    ],
    hint: `La consigne commence par le verbe, qui débute par « ${o.en.slice(0, 1)} ».`,
    steps: ['Une consigne : on dit le verbe tout seul.', `Réponse : **${bang(o.en)}**`],
  };
}

function orderNegative(rng: Rng): QuestionDraft {
  const i = rng.int(0, NEGATABLE.length - 1);
  const o = at(NEGATABLE, i);
  if (flip(rng)) {
    const no = flip(rng);
    // L’écart avec le second verbe dépend du sens : deux phrases entendues n’ont jamais les mêmes propositions.
    const w = at(NEGATABLE, (i + (no ? 7 : 4)) % NEGATABLE.length);
    const good = no ? o.not : o.fr;
    const otherVerb = 'Ce n’est pas le verbe entendu.';
    // Deux verbes × deux sens : la bonne réponse ne se devine pas à partir des propositions.
    const { answer, traps } = choice(rng, good, [
      {
        label: no ? o.fr : o.not,
        why: no ? 'Tu as entendu « don’t » : c’est une interdiction.' : 'Pas de « don’t » : on te demande de le faire.',
      },
      { label: w.fr, why: otherVerb },
      { label: w.not, why: otherVerb },
    ]);
    return {
      prompt: 'Écoute bien le début. Que dit la maîtresse ?',
      audio: sound(no ? `${dont(o)}!` : bang(o.en)),
      answer,
      traps,
      hint: 'Y a-t-il « don’t » au début ? Puis trouve le verbe.',
      steps: [
        no
          ? '« Don’t » devant le verbe veut dire non : c’est interdit.'
          : 'La phrase commence par le verbe : il faut le faire.',
        `Réponse : **${good}**`,
      ],
    };
  }
  return {
    prompt: `Interdis en anglais : « ${o.not} »`,
    answer: { kind: 'text', accepted: negativeForms(o) },
    traps: [
      { text: `no ${o.en}`, why: 'Pour interdire, on utilise « Don’t » devant le verbe, pas « no ».' },
      { text: `not ${o.en}`, why: 'Il manque « Do » : « Don’t » ou « Do not ».' },
      { text: o.en, why: 'Cette consigne demande de le faire. Ici, c’est interdit.' },
      { text: `don’t to ${o.en}`, why: 'Après « Don’t », le verbe reste seul.' },
      { text: `don’t please ${o.en}`, why: '« please » se met au début ou à la fin, pas après « Don’t ».' },
    ],
    hint: 'Un petit mot négatif vient avant le verbe.',
    steps: ['On met « Don’t » devant le verbe.', `Réponse : **${dont(o)}!**`],
  };
}

function orderRead(rng: Rng): QuestionDraft {
  if (flip(rng)) {
    const picked = some(rng, ORDERS, 4);
    const markers = ['First', 'Then', 'Next', 'Finally'];
    const lines = rng.shuffle(picked.map((o, i) => `${at(markers, i)}, ${o.en}.`));
    const right = picked.map((o) => o.fr);
    const items = shuffledOther(rng, right);
    return {
      prompt: 'Lis les consignes du jeu. Remets les actions dans l’ordre (First, puis Then, Next, Finally).',
      figure: written(rng, lines, 'Our game'),
      answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
      hint: 'Cherche d’abord la ligne qui commence par « First ».',
      steps: ['First = d’abord ; Then = ensuite ; Next = après ; Finally = enfin.', `Réponse : **${right.join(' ')}**`],
    };
  }
  const [kid, mate] = some(rng, KIDS, 2) as [string, string];
  // Chaque verbe est interdit sur l’une des deux lignes.
  const [a, b] = some(rng, NEGATABLE, 2) as [Negatable, Negatable];
  const lines = rng.shuffle([`Teacher: ${kid}, ${a.en}. Don’t ${b.en}.`, `Teacher: ${mate}, ${b.en}. Don’t ${a.en}.`]);
  const forbidden = flip(rng);
  const target = forbidden ? b : a;
  const wrong = forbidden ? a : b;
  return {
    prompt: forbidden
      ? `Lis. Qu’est-ce ${que(kid)} ne doit pas faire ? Réponds en anglais avec « Don’t … ».`
      : `Lis. Que doit faire ${kid} ? Écris la consigne en anglais.`,
    figure: written(rng, lines, 'In class'),
    answer: { kind: 'text', accepted: forbidden ? negativeForms(target) : forms(target) },
    traps: [
      {
        text: forbidden ? `don’t ${wrong.en}` : wrong.en,
        why: `Lis la ligne ${de(kid)}, et regarde s’il y a « Don’t ».`,
      },
      {
        text: forbidden ? target.en : `don’t ${wrong.en}`,
        why: forbidden
          ? 'Ici, c’est interdit : commence par « Don’t ».'
          : 'Cette consigne est interdite : c’est l’autre.',
      },
    ],
    hint: `Trouve la ligne qui parle à ${kid}. « Don’t » marque ce qui est interdit.`,
    steps: [
      `La maîtresse dit à ${kid} : « ${cap(a.en)}. Don’t ${b.en}. »`,
      `Réponse : **${forbidden ? dont(b) : cap(a.en)}**`,
    ],
  };
}

const instructions: Skill = {
  id: 'acm1-consignes',
  title: 'Les consignes de classe',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une consigne commence par le verbe : c’est l’**impératif**. Sit down! = Assieds-toi !',
      'Pour interdire, ajoute **don’t** devant le verbe : Don’t write! = N’écris pas !',
    ],
    source: source('Consignes : British Council, « Classroom language flashcards » et textes de lecture.'),
    sources: ['lve-cm-2026', 'bck-flashcards-classroom', 'bck-tidy', 'bck-school-note'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return orderMeaning(rng);
    if (level === 2) return orderSecond(rng);
    if (level === 3) return orderWrite(rng);
    if (level === 4) return orderNegative(rng);
    return orderRead(rng);
  },
};

// ——— 3. Les mots-clés d'une phrase ———

interface Theme {
  readonly fr: string;
  readonly words: readonly Word[];
  readonly say: (w: string) => string;
}
const THEMES: readonly Theme[] = [
  { fr: 'les couleurs', words: COLOURS, say: (w) => `My bag is ${w}.` },
  { fr: 'les animaux', words: PETS.slice(0, 6), say: (w) => `Look! It is a ${w}.` },
  { fr: 'les sports', words: SPORTS.slice(0, 5), say: (w) => `We love ${w}.` },
  { fr: 'les jours', words: DAYS, say: (w) => `See you on ${w}.` },
  { fr: 'la météo', words: WEATHER, say: (w) => `It is ${w} today.` },
];

function keyColour(rng: Rng): QuestionDraft {
  const i = rng.int(0, COLOURS.length - 1);
  const w = at(COLOURS, i);
  const wrong = [3, 7].map((step) => at(COLOURS, (i + step) % COLOURS.length));
  const { answer, traps } = choice(
    rng,
    w.fr,
    wrong.map((x) => ({ label: x.fr, why: `« ${x.fr} » se dit « ${x.en} ».` })),
  );
  const heard = flip(rng);
  const thing = rng.pick(['bag', 'book', 'hat']);
  return {
    prompt: heard
      ? 'Écoute la phrase. Quelle couleur entends-tu ?'
      : `Lis : « My ${thing} is ${w.en}. » Quelle couleur est dite ?`,
    ...(heard ? { audio: sound(`My ${thing} is ${w.en}.`) } : {}),
    answer,
    traps,
    hint: 'Tu n’as pas besoin de tout comprendre : cherche seulement le mot de couleur.',
    steps: [`Le mot-clé est « ${w.en} » : « ${w.en} » veut dire « ${w.fr} ».`, `Réponse : **${w.fr}**`],
  };
}

const ASKS: readonly { readonly en: string; readonly fr: string }[] = [
  { en: 'Where do you live?', fr: 'le lieu où tu habites' },
  { en: 'How old are you?', fr: 'ton âge' },
  { en: 'What’s your name?', fr: 'ton prénom' },
];

function keyTheme(rng: Rng): QuestionDraft {
  if (rng.int(0, 2) === 0) {
    const q = rng.pick(ASKS);
    const { answer, traps } = choice(rng, q.fr, [
      ...ASKS.filter((x) => x !== q).map((x) => ({ label: x.fr, why: `Cette demande se dit « ${x.en} ».` })),
      { label: 'ta couleur préférée', why: `Ici, le mot du début est « ${q.en.split(' ')[0]} » : relis la question.` },
    ]);
    return {
      prompt: `Lis la question « ${q.en} ». Que veut-on savoir ?`,
      answer,
      traps,
      hint: 'Regarde les premiers mots : « Where », « How old » ou « What’s your name » ?',
      steps: [`Le mot du début de « ${q.en} » indique ce qu’on cherche.`, `Réponse : **${q.fr}**`],
    };
  }
  const t = rng.int(0, THEMES.length - 1);
  const theme = at(THEMES, t);
  const w = rng.pick(theme.words);
  // Les trois autres thèmes dépendent du bon : deux phrases entendues n’ont jamais les mêmes propositions.
  const wrong = THEMES.filter((_, i) => i !== t && i !== (t + 1) % THEMES.length);
  const { answer, traps } = choice(
    rng,
    theme.fr,
    wrong.map((x) => ({
      label: x.fr,
      why: `« ${w.en} » veut dire « ${w.fr} » : le thème est « ${theme.fr} », pas « ${x.fr} ».`,
    })),
  );
  const heard = flip(rng);
  return {
    prompt: heard ? 'Écoute la phrase. De quoi parle-t-on ?' : `Lis : « ${theme.say(w.en)} » De quoi parle-t-on ?`,
    ...(heard ? { audio: sound(theme.say(w.en)) } : {}),
    answer,
    traps,
    hint: 'Trouve le mot le plus important de la phrase : à quelle famille de mots appartient-il ?',
    steps: [`Le mot-clé est « ${w.en} » (${w.fr}).`, `Réponse : **${theme.fr}**`],
  };
}

interface Kept {
  readonly kid: string;
  readonly text: string;
  readonly sport: string;
  readonly day: string;
}
const SAYING: readonly Kept[] = [
  { kid: 'Ana', text: 'Hi! I play tennis on Monday.', sport: 'tennis', day: 'Monday' },
  { kid: 'Emir', text: 'Hello! I play football on Friday.', sport: 'football', day: 'Friday' },
  { kid: 'Yuna', text: 'Hi! I play basketball on Tuesday.', sport: 'basketball', day: 'Tuesday' },
  { kid: 'Tom', text: 'Hello! I play rugby on Saturday.', sport: 'rugby', day: 'Saturday' },
  { kid: 'Lisa', text: 'Hi! I play badminton on Thursday.', sport: 'badminton', day: 'Thursday' },
  { kid: 'Paul', text: 'Hello! I play hockey on Wednesday.', sport: 'hockey', day: 'Wednesday' },
];

function keyWrite(rng: Rng): QuestionDraft {
  const m = rng.pick(SAYING);
  const sport = flip(rng);
  const good = sport ? m.sport : m.day;
  const bad = sport ? m.day : m.sport;
  const heard = flip(rng);
  return {
    prompt: `${heard ? 'Écoute' : 'Lis'} le message ${de(m.kid)}. Écris en anglais le mot qui dit ${sport ? 'le sport' : 'le jour'}.`,
    ...(heard ? { audio: sound(m.text) } : { figure: written(rng, [`${m.kid}: ${m.text}`], 'A message') }),
    answer: { kind: 'text', accepted: full([good]) },
    traps: [
      {
        text: bad,
        why: `« ${bad} » dit ${sport ? 'le jour' : 'le sport'}. On cherche ${sport ? 'le sport' : 'le jour'}.`,
      },
      { text: 'play', why: '« play » veut dire « jouer » : ce n’est pas le mot demandé.' },
    ],
    hint: sport ? 'Le sport vient juste après « play ».' : 'Le jour vient juste après « on ».',
    steps: [`Dans le message, on repère ${sport ? 'le sport' : 'le jour'}.`, `Réponse : **${good}**`],
  };
}

const OWNERS: readonly {
  readonly kid: string;
  readonly a: string;
  readonly petA: string;
  readonly b: string;
  readonly petB: string;
}[] = [
  { kid: 'Ana', a: 'brother', petA: 'cat', b: 'sister', petB: 'dog' },
  { kid: 'Tom', a: 'sister', petA: 'rabbit', b: 'brother', petB: 'hamster' },
  { kid: 'Yuna', a: 'mum', petA: 'dog', b: 'dad', petB: 'cat' },
  { kid: 'Paul', a: 'dad', petA: 'parrot', b: 'mum', petB: 'rabbit' },
];
const PET_FR: Readonly<Record<string, string>> = {
  cat: 'le chat',
  dog: 'le chien',
  rabbit: 'le lapin',
  hamster: 'le hamster',
  parrot: 'le perroquet',
};

/** Autres mots admis pour une personne de la famille (comme dans le lot « famille »). */
const ALIASES: Readonly<Record<string, readonly string[]>> = {
  mum: ['mom', 'mummy', 'mommy', 'mother'],
  dad: ['daddy', 'father'],
};

function keyWho(rng: Rng): QuestionDraft {
  const o = rng.pick(OWNERS);
  const first = flip(rng);
  const pet = first ? o.petA : o.petB;
  const good = first ? o.a : o.b;
  const other = first ? o.b : o.a;
  const lines = [`My ${o.a} has got a ${o.petA}.`, `My ${o.b} has got a ${o.petB}.`];
  const heard = flip(rng);
  return {
    prompt: `${heard ? 'Écoute' : 'Lis'} ${o.kid} parler de sa famille. Qui a ${PET_FR[pet]?.replace(/^le /, 'un ')} ? Réponds en anglais.`,
    ...(heard ? { audio: sound(lines.join(' ')) } : { figure: written(rng, lines, `${o.kid}’s family`) }),
    answer: {
      kind: 'text',
      accepted: full(
        [good, ...(ALIASES[good] ?? [])].flatMap((p) => [
          p,
          ...['my', 'the', 'his', 'her', `${o.kid}’s`].map((d) => `${d} ${p}`),
        ]),
      ),
    },
    traps: [
      { text: other, why: `« ${other} » a l’autre animal : retrouve la phrase qui dit « ${pet} ».` },
      { text: pet, why: `« ${pet} », c’est l’animal. On demande la personne.` },
    ],
    hint: `Cherche la phrase qui contient « ${pet} » : la personne est au début.`,
    steps: [`La phrase avec « ${pet} » parle de « my ${good} ».`, `Réponse : **${good}**`],
  };
}

const INVITES: readonly {
  readonly kid: string;
  readonly day: string;
  readonly place: string;
  readonly colour: string;
}[] = [
  { kid: 'Ana', day: 'Saturday', place: 'park', colour: 'red' },
  { kid: 'Emir', day: 'Sunday', place: 'garden', colour: 'blue' },
  { kid: 'Yuna', day: 'Wednesday', place: 'school', colour: 'green' },
  { kid: 'Tom', day: 'Friday', place: 'house', colour: 'yellow' },
  { kid: 'Lisa', day: 'Monday', place: 'park', colour: 'purple' },
  { kid: 'Paul', day: 'Thursday', place: 'garden', colour: 'orange' },
];

function keyInvite(rng: Rng): QuestionDraft {
  const v = rng.pick(INVITES);
  const lines = [
    'Hello! It is my birthday.',
    `Come to my party on ${v.day}.`,
    `We meet in the ${v.place}.`,
    `Wear something ${v.colour}.`,
    `Love, ${v.kid}`,
  ];
  const asked = rng.pick([
    { q: 'Quel jour est la fête', good: v.day, also: [`on ${v.day}`], why: 'le jour vient après « on »' },
    {
      q: 'Où se retrouve-t-on',
      good: v.place,
      also: [`the ${v.place}`, `in the ${v.place}`],
      why: 'le lieu vient après « in the »',
    },
    { q: 'Quelle couleur faut-il porter', good: v.colour, also: [], why: 'la couleur vient après « something »' },
  ]);
  return {
    prompt: `Lis l’invitation ${de(v.kid)}. ${asked.q} ? Réponds avec un mot anglais.`,
    figure: written(rng, lines, 'My party'),
    answer: { kind: 'text', accepted: full([asked.good, ...asked.also]) },
    traps: [v.day, v.place, v.colour, 'birthday']
      .filter((x) => x !== asked.good)
      .map((x) => ({ text: x, why: `« ${x} » est dans l’invitation, mais ce n’est pas ce qu’on demande.` })),
    hint: `Repère le bon indice : ${asked.why}.`,
    steps: [`Pour cette question, ${asked.why}.`, `Réponse : **${asked.good}**`],
  };
}

const keywords: Skill = {
  id: 'acm1-mots-cles',
  title: 'Les mots-clés d’une phrase',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Tu n’as pas besoin de tout comprendre. Cherche le **mot-clé** : celui qui répond à la question.',
      'Un **mot interrogatif** t’aide : Where = où, How old = quel âge. Exemple : « I play tennis on Monday » → jour : Monday.',
    ],
    source: source('Mots familiers : listes des lots précédents (British Council).'),
    sources: [
      'lve-cm-2026',
      'bc-question-forms',
      'bck-flashcards-colours',
      'bck-flashcards-pets',
      'bck-flashcards-sports',
      'bck-flashcards-weather',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return keyColour(rng);
    if (level === 2) return keyTheme(rng);
    if (level === 3) return keyWrite(rng);
    if (level === 4) return keyWho(rng);
    return keyInvite(rng);
  },
};

// ——— 4. Repères culturels : le Royaume-Uni et ses fêtes ———

interface Question1 {
  readonly q: string;
  readonly good: string;
  /** Explication donnée dans la correction. */
  readonly because: string;
  readonly wrong: readonly (readonly [string, string])[];
}
/** Niveau 1 : chaque question a son indice, qui ne contient pas la réponse. */
const EASY: readonly (Question1 & { readonly hint: string })[] = [
  {
    q: 'Quelle fête a lieu le 31 octobre ?',
    good: 'Halloween',
    hint: 'Pense à la fête d’automne où l’on se déguise.',
    because: 'Halloween se fête chaque année le 31 octobre.',
    wrong: [
      ['Christmas', 'Christmas (Noël) a lieu le 25 décembre.'],
      ['Easter', 'Easter (Pâques) tombe en mars ou en avril.'],
    ],
  },
  {
    q: 'Quelle fête a lieu le 25 décembre ?',
    good: 'Christmas',
    hint: 'Pense à la fête d’hiver où l’on offre des cadeaux.',
    because: 'Christmas, c’est Noël : le 25 décembre.',
    wrong: [
      ['Halloween', 'Halloween a lieu le 31 octobre.'],
      ['Bonfire Night', 'Bonfire Night a lieu le 5 novembre.'],
    ],
  },
  {
    q: 'À Halloween, on creuse un visage dans…',
    good: 'une citrouille',
    hint: 'C’est un gros légume orange.',
    because: 'On creuse des visages dans les citrouilles : les « jack o’lanterns ».',
    wrong: [
      ['un sapin', 'Le sapin décoré, c’est pour Noël.'],
      ['un œuf', 'Les œufs, c’est surtout à Pâques.'],
    ],
  },
  {
    q: 'Que décore-t-on à Noël ?',
    good: 'le sapin',
    hint: 'Pense à ce qu’on installe dans le salon en décembre.',
    because: 'À Noël, on décore le sapin avec des boules, des guirlandes et des lumières.',
    wrong: [
      ['une citrouille', 'La citrouille creusée, c’est pour Halloween.'],
      ['un feu de joie', 'Le grand feu, c’est pour Bonfire Night.'],
    ],
  },
  {
    q: 'Dans quelle ville se trouve Big Ben ?',
    good: 'London',
    hint: 'C’est la capitale de l’Angleterre : son nom anglais commence par « L ».',
    because: 'Big Ben est un monument de Londres, « London » en anglais.',
    wrong: [
      ['Paris', 'Paris est en France : Big Ben est à Londres.'],
      ['England', 'England est un pays, pas une ville : la ville est London.'],
    ],
  },
  {
    q: 'Que cherchent beaucoup d’enfants à Pâques, au Royaume-Uni ?',
    good: 'des œufs cachés',
    hint: 'Au printemps, on en trouve souvent en chocolat, dans le jardin.',
    because: 'À Pâques, beaucoup d’enfants font la chasse aux œufs : « egg hunt ».',
    wrong: [
      ['des citrouilles', 'Les citrouilles, c’est Halloween.'],
      ['des cadeaux sous le sapin', 'Les cadeaux sous le sapin, c’est Noël.'],
    ],
  },
];

function ukEasy(rng: Rng): QuestionDraft {
  const item = rng.pick(EASY);
  const { answer, traps } = choice(
    rng,
    item.good,
    item.wrong.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: item.q,
    answer,
    traps,
    hint: item.hint,
    steps: [item.because, `Réponse : **${item.good}**`],
  };
}

const PARTS: readonly Question1[] = [
  {
    q: 'Combien de parties compte le Royaume-Uni (the UK) ?',
    good: 'quatre',
    because: 'Les quatre parties sont England, Scotland, Wales et Northern Ireland.',
    wrong: [
      ['deux', 'Le Royaume-Uni compte quatre parties, pas deux.'],
      ['trois', 'Il manque Northern Ireland : quatre parties.'],
      ['six', 'Il y en a quatre : England, Scotland, Wales, Northern Ireland.'],
    ],
  },
  {
    q: 'Quel drapeau porte un dragon ?',
    good: 'le drapeau du pays de Galles (Wales)',
    because: 'Le dragon est dessiné sur le drapeau gallois, c’est-à-dire du pays de Galles.',
    wrong: [
      ['le drapeau de l’Angleterre (England)', 'Le dragon est sur le drapeau gallois (du pays de Galles).'],
      ['le drapeau de l’Écosse (Scotland)', 'Le dragon est sur le drapeau gallois (du pays de Galles).'],
      [
        'le drapeau de la France',
        'La France ne fait pas partie du Royaume-Uni : le dragon est sur le drapeau du pays de Galles.',
      ],
    ],
  },
  {
    q: 'Quelle est la capitale de l’Angleterre, où l’on voit Buckingham Palace ?',
    good: 'London',
    because: 'London a Big Ben et Buckingham Palace : c’est la capitale de l’Angleterre.',
    wrong: [
      ['Paris', 'Paris est la capitale de la France.'],
      ['Wales', 'Wales est le pays de Galles, pas la capitale de l’Angleterre.'],
      ['Scotland', 'Scotland est l’Écosse, pas la capitale de l’Angleterre.'],
    ],
  },
  {
    q: 'Quel pays du Royaume-Uni est plus grand que l’Écosse (Scotland) ?',
    good: 'l’Angleterre (England)',
    because: 'L’Angleterre est plus grande que l’Écosse.',
    wrong: [
      ['le pays de Galles (Wales)', 'C’est l’Angleterre qui est plus grande que l’Écosse.'],
      ['l’Irlande du Nord (Northern Ireland)', 'C’est l’Angleterre qui est plus grande que l’Écosse.'],
      ['la France', 'La France ne fait pas partie du Royaume-Uni.'],
    ],
  },
  {
    q: 'Où se trouve la Chaussée des Géants (Giant’s Causeway) ?',
    good: 'en Irlande du Nord (Northern Ireland)',
    because: 'La Chaussée des Géants est un lieu visité en Irlande du Nord.',
    wrong: [
      ['en Angleterre (England)', 'La Chaussée des Géants est en Irlande du Nord.'],
      ['en Écosse (Scotland)', 'La Chaussée des Géants est en Irlande du Nord.'],
      ['au pays de Galles (Wales)', 'La Chaussée des Géants est en Irlande du Nord.'],
    ],
  },
];

const CLUES: readonly (readonly [string, string])[] = [
  ['Halloween', '31 October'],
  ['Christmas', '25 December'],
  ['Bonfire Night', '5 November'],
  ['Easter', 'egg hunt'],
  ['London', 'Big Ben'],
  ['Wales', 'a dragon on the flag'],
  ['Northern Ireland', 'the Giant’s Causeway'],
];

function match(rng: Rng, n: number): QuestionDraft {
  const rows = some(rng, CLUES, n);
  const left = rows.map(([a]) => a);
  const right = shuffledOther(
    rng,
    rows.map(([, b]) => b),
  );
  return {
    prompt: `Associe chaque nom à son indice : ${left.join(', ')}.`,
    answer: { kind: 'match', left, right, pairs: rows.map(([, b]) => right.indexOf(b)) },
    hint: 'Commence par la fête ou le lieu dont tu es sûr.',
    steps: [
      'On relie chaque nom à son indice.',
      ...rows.map(([a, b]) => `${a} → ${b}`),
      `Réponse : **${rows.map(([a, b]) => `${a} = ${b}`).join(' ; ')}**`,
    ],
  };
}

function ukSecond(rng: Rng): QuestionDraft {
  if (flip(rng)) return match(rng, 3);
  const item = rng.pick(PARTS);
  const { answer, traps } = choice(
    rng,
    item.good,
    item.wrong.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: item.q,
    answer,
    traps,
    hint: 'Souviens-toi des quatre parties du Royaume-Uni et de leurs indices.',
    steps: [item.because, `Réponse : **${item.good}**`],
  };
}

interface Typed {
  readonly q: string;
  readonly good: readonly string[];
  readonly traps: readonly (readonly [string, string])[];
  readonly hint: string;
  readonly because: string;
}
const WORDS_TO_WRITE: readonly Typed[] = [
  {
    q: 'Écris en anglais le nom de la fête du 31 octobre.',
    good: ['Halloween'],
    traps: [
      ['Haloween', 'Presque ! Il faut deux « l » : Halloween.'],
      ['Christmas', 'Christmas, c’est Noël, le 25 décembre.'],
    ],
    because: 'Le 31 octobre, c’est Halloween.',
    hint: 'La fête des citrouilles creusées.',
  },
  {
    q: 'Écris en anglais le mot « citrouille ».',
    good: ['pumpkin', 'a pumpkin', 'the pumpkin'],
    traps: [
      ['pumkin', 'Presque ! Il y a un « p » au milieu : pumpkin.'],
      ['witch', '« witch » veut dire « sorcière ».'],
    ],
    because: 'La citrouille, « pumpkin », est un symbole d’Halloween.',
    hint: 'Le mot commence par « p ».',
  },
  {
    q: 'Écris en anglais le mot « sorcière ».',
    good: ['witch', 'a witch', 'the witch'],
    traps: [
      ['wich', 'Presque ! Il manque le « t » : witch.'],
      ['ghost', '« ghost » veut dire « fantôme ».'],
    ],
    because: '« witch » est un mot d’Halloween : la sorcière.',
    hint: 'Le mot commence par « w ».',
  },
  {
    q: 'Écris en anglais le mot « fantôme ».',
    good: ['ghost', 'a ghost', 'the ghost'],
    traps: [
      ['gost', 'Presque ! Il manque le « h » : ghost.'],
      ['bat', '« bat » veut dire « chauve-souris ».'],
    ],
    because: '« ghost » est un mot d’Halloween : le fantôme.',
    hint: 'Le mot commence par « g ».',
  },
  {
    q: 'Écris en anglais le nom de Noël.',
    good: ['Christmas'],
    traps: [
      ['Chrismas', 'Presque ! Il manque le « t » : Christmas.'],
      ['Easter', 'Easter, c’est Pâques.'],
    ],
    because: 'Noël se dit « Christmas » : on le fête le 25 décembre.',
    hint: 'La fête du 25 décembre.',
  },
  {
    q: 'Écris en anglais le nom de Pâques.',
    good: ['Easter'],
    traps: [
      ['Ester', 'Presque ! Il manque le « a » : Easter.'],
      ['Christmas', 'Christmas, c’est Noël.'],
    ],
    because: 'Pâques se dit « Easter » : on cherche des œufs au printemps.',
    hint: 'La fête des œufs en chocolat, au printemps.',
  },
];

const FACTS_TO_WRITE: readonly Typed[] = [
  {
    q: 'Quel pays du Royaume-Uni a un dragon sur son drapeau ? Réponds en anglais.',
    good: ['Wales'],
    traps: [
      ['England', 'England est l’Angleterre : le dragon est sur le drapeau du pays de Galles.'],
      ['Scotland', 'Scotland est l’Écosse : le dragon est sur le drapeau du pays de Galles.'],
    ],
    because: 'Le drapeau du pays de Galles, « Wales », porte un dragon.',
    hint: 'Son nom anglais commence par « W ».',
  },
  {
    q: 'Dans quel pays du Royaume-Uni est la Chaussée des Géants ? Réponds en anglais.',
    good: ['Northern Ireland'],
    traps: [
      ['Ireland', 'Précise la partie du Royaume-Uni : « Northern » veut dire « du Nord ».'],
      ['Scotland', 'Scotland est l’Écosse : la Chaussée des Géants est en Irlande du Nord.'],
    ],
    because: 'La Chaussée des Géants est en Irlande du Nord, « Northern Ireland ».',
    hint: 'Son nom anglais a deux mots et commence par « N ».',
  },
  {
    q: 'Quelle est la capitale de l’Angleterre ? Écris son nom en anglais.',
    good: ['London'],
    traps: [
      ['Londres', 'C’est le nom français : en anglais, on écrit « London ».'],
      ['England', 'England est le pays : on demande la ville.'],
    ],
    because: 'La capitale de l’Angleterre, avec Big Ben, est « London ».',
    hint: 'On y voit Big Ben.',
  },
  {
    q: 'Comment appelle-t-on souvent le drapeau du Royaume-Uni ?',
    good: ['Union Jack', 'the Union Jack', 'Union Flag', 'the Union Flag'],
    traps: [
      ['Big Ben', 'Big Ben est un monument de Londres.'],
      ['Jack o’lantern', 'C’est la citrouille creusée d’Halloween.'],
    ],
    because: 'Le drapeau du Royaume-Uni est souvent appelé « Union Jack ».',
    hint: 'Un nom en deux mots : le premier commence par « U ».',
  },
  {
    q: 'À Halloween, quelle phrase de jeu signifie : jouer un tour ou recevoir des bonbons ?',
    good: ['trick or treat', 'trick-or-treat'],
    traps: [
      ['happy birthday', 'C’est pour un anniversaire.'],
      ['trick and treat', 'Presque ! On dit « or » (ou), pas « and ».'],
    ],
    because: '« Trick or treat » : on joue un tour ou on reçoit des bonbons.',
    hint: 'Trois mots : le premier veut dire « un tour ».',
  },
  {
    q: 'Quelle fête du 5 novembre se passe avec un grand feu et des feux d’artifice ?',
    good: ['Bonfire Night'],
    traps: [
      ['Halloween', 'Halloween a lieu le 31 octobre.'],
      ['Christmas', 'Christmas a lieu le 25 décembre.'],
    ],
    because: 'Le 5 novembre, c’est Bonfire Night : grand feu et feux d’artifice.',
    hint: 'Son nom anglais parle d’un feu et d’une nuit.',
  },
];

function writeFrom(rng: Rng, list: readonly Typed[]): QuestionDraft {
  const item = rng.pick(list);
  const good = at(item.good, 0);
  return {
    prompt: item.q,
    answer: { kind: 'text', accepted: full(item.good) },
    traps: item.traps.map(([text, why]) => ({ text, why })),
    hint: item.hint,
    steps: [item.because, `Réponse : **${good}**`],
  };
}

const CARDS5: readonly {
  readonly lines: readonly string[];
  readonly good: string;
  readonly month: string;
  /** Mots de la carte qui prouvent la fête, avec leur sens. */
  readonly clues: string;
}[] = [
  {
    lines: ['Dear Ana,', 'Tonight we cut a face in a pumpkin.', 'I am dressed as a witch. Trick or treat!', 'Emir'],
    good: 'Halloween',
    month: 'October',
    clues: '« pumpkin » (citrouille), « witch » (sorcière) et « Trick or treat »',
  },
  {
    lines: ['Dear Tom,', 'We decorate the tree with lights.', 'We eat turkey and we pull crackers.', 'Lisa'],
    good: 'Christmas',
    month: 'December',
    clues: '« tree » (sapin), « turkey » (dinde) et « crackers » (papillotes à pétard)',
  },
  {
    lines: ['Dear Yuna,', 'We go to see a big bonfire.', 'We watch the fireworks in the dark sky.', 'Paul'],
    good: 'Bonfire Night',
    month: 'November',
    clues: '« bonfire » (grand feu) et « fireworks » (feux d’artifice)',
  },
  {
    lines: ['Dear Paul,', 'Santa comes with presents for the children.', 'I leave some food for him.', 'Ana'],
    good: 'Christmas',
    month: 'December',
    clues: '« Santa » (le père Noël) et « presents » (cadeaux)',
  },
  {
    lines: ['Dear Lisa,', 'There are ghosts and bats on our door.', 'The black cat sleeps near the pumpkin.', 'Tom'],
    good: 'Halloween',
    month: 'October',
    clues: '« ghosts » (fantômes), « bats » (chauves-souris) et « pumpkin » (citrouille)',
  },
];

function ukRead(rng: Rng): QuestionDraft {
  if (rng.int(0, 3) === 0) {
    const lines = [
      'Hi! I am in the capital of England.',
      'Today I see Big Ben and Tower Bridge.',
      'I go on a red bus.',
    ];
    return {
      prompt: 'Lis la carte postale. De quelle ville vient-elle ? Écris son nom en anglais.',
      figure: written(rng, lines, 'A postcard'),
      answer: { kind: 'text', accepted: full(['London']) },
      traps: [
        { text: 'England', why: 'England est le pays : on cherche la ville.' },
        { text: 'Londres', why: 'C’est le nom français : écris le nom anglais.' },
      ],
      hint: 'Big Ben et Tower Bridge sont dans la capitale de l’Angleterre.',
      steps: ['Big Ben et Tower Bridge sont à London.', 'Réponse : **London**'],
    };
  }
  const card = rng.pick(CARDS5);
  const month = flip(rng);
  const good = month ? card.month : card.good;
  const wrongName = CARDS5.find((c) => c.good !== card.good) ?? card;
  return {
    prompt: month
      ? 'Lis la carte. Dans quel mois a lieu cette fête ? Écris le mois en anglais.'
      : 'Lis la carte. De quelle fête parle-t-elle ? Écris son nom en anglais.',
    figure: written(rng, card.lines, 'A card'),
    answer: { kind: 'text', accepted: full([good]) },
    traps: month
      ? [
          { text: wrongName.month, why: `Ce mois est celui d’une autre fête (${wrongName.good}). Relis les indices.` },
          { text: card.good, why: 'C’est la fête : on demande le mois, en anglais.' },
        ]
      : [
          { text: wrongName.good, why: 'Les indices de la carte ne vont pas avec cette fête.' },
          { text: card.month, why: 'C’est le mois : on demande le nom de la fête.' },
        ],
    hint: 'Cherche les objets de la carte : citrouille, sapin, feu ? Chaque fête a les siens.',
    steps: [
      `Les indices ${card.clues} montrent la fête **${card.good}**${month ? ` : le mois est « ${card.month} »` : ''}.`,
      `Réponse : **${good}**`,
    ],
  };
}

const landmarks: Skill = {
  id: 'acm1-reperes-uk',
  title: 'Le Royaume-Uni et ses fêtes',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **Royaume-Uni** (the UK) a quatre parties : England = Angleterre (plus grande que l’Écosse), Scotland = Écosse, Wales = pays de Galles, Northern Ireland = Irlande du Nord.',
      'À Londres (London), capitale de l’Angleterre : Big Ben, Buckingham Palace, Tower Bridge. Le drapeau gallois (du pays de Galles) porte un dragon. En Irlande du Nord : la Chaussée des Géants (Giant’s Causeway). Le drapeau du Royaume-Uni est souvent appelé Union Jack.',
      'Fêtes : Halloween (31 October : pumpkin = citrouille, witch = sorcière, ghost = fantôme ; « Trick or treat » : jouer un tour ou recevoir des bonbons), **Bonfire Night** (5 November : grand feu, feux d’artifice), Christmas (25 December : on décore le sapin), Easter (Pâques, au printemps : chasse aux œufs cachés, egg hunt).',
    ],
    source: source(
      'Faits : British Council, LearnEnglish Kids (fiches sur le Royaume-Uni, Londres, Halloween, Noël, Bonfire Night et Pâques).',
    ),
    sources: [
      'lve-cm-2026',
      'bck-uk',
      'bck-cities',
      'bck-postcard-london',
      'bck-halloween-answers',
      'bck-christmas-story',
      'bck-bonfire',
      'bck-easter-answers',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return ukEasy(rng);
    if (level === 2) return ukSecond(rng);
    if (level === 3) return writeFrom(rng, WORDS_TO_WRITE);
    if (level === 4) return flip(rng) ? writeFrom(rng, FACTS_TO_WRITE) : match(rng, 5);
    return ukRead(rng);
  },
};

export const ENGLISH_LISTENING_CHAPTER: Chapter = {
  id: 'acm1-ecouter-comprendre',
  subject: 'anglais',
  grade: 'cm1',
  domain: 'langue',
  title: 'Écouter et comprendre',
  skills: [numbersHeard, instructions, keywords, landmarks],
};
