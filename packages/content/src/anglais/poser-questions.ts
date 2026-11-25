import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { WH_WORDS } from './poser-questions-faits.ts';
import { wordOf } from './presentation-faits.ts';
import { at, de, shuffledOther, some } from './temps.ts';

/**
 * Anglais CM2 — « Poser des questions » (lot an-cm2-05, docs/adr/0034). Programme : cycle 3, langues vivantes
 * (poser des questions simples et y répondre), en vigueur au CM2 jusqu'à la rentrée 2027. Règles : British
 * Council (voir poser-questions-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes';
const source = (detail: string) => `${PROGRAMME} — poser des questions et y répondre. ${detail}`;

/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
/** Questions avec ou sans point d’interrogation (collé ou précédé d’une espace). */
const asked = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}?`, `${f} ?`]);
/** Réponses courtes : avec ou sans virgule, avec ou sans point. */
const short = (yes: boolean, who: string, verbs: readonly string[]) =>
  full(verbs.flatMap((v) => [`${yes ? 'Yes' : 'No'}, ${who} ${v}`, `${yes ? 'Yes' : 'No'} ${who} ${v}`]));

interface Kid {
  readonly name: string;
  readonly he: 'he' | 'she';
}
const KIDS: readonly Kid[] = [
  { name: 'Ana', he: 'she' },
  { name: 'Yuna', he: 'she' },
  { name: 'Lisa', he: 'she' },
  { name: 'Emir', he: 'he' },
  { name: 'Paul', he: 'he' },
  { name: 'Tom', he: 'he' },
];
const gender = (k: Kid) => `${k.name} est ${k.he === 'he' ? 'un garçon' : 'une fille'}.`;
const coin = (rng: Rng) => rng.int(0, 1) === 0;

// ——— 1. who, what, where, when ———
type Wh = (typeof WH_WORDS)[number]['en'];
const wh = (en: Wh) => {
  const w = WH_WORDS.find((x) => x.en === en);
  if (!w) throw new Error(`mot inconnu : ${en}`);
  return w;
};
const whyWh = (en: Wh) => `« ${en} » veut dire « ${wh(en).fr} » : on demande ${wh(en).asks}.`;
const otherWh = (en: Wh) => WH_WORDS.filter((w) => w.en !== en);

/** Question et réponse : une seule sorte de réponse convient à chaque question. */
interface Pair {
  readonly wh: Wh;
  readonly q: string;
  readonly a: string;
  /** La question en français. */
  readonly fr: string;
}
const pair = (w: Wh, rest: string, a: string, fr: string): Pair => ({ wh: w, q: `${w} ${rest}`, a, fr });
const PAIRS: readonly Pair[] = [
  pair('Who', 'is she?', 'She’s my sister.', 'Qui est-elle ?'),
  pair('Who', 'is that boy?', 'It’s my brother.', 'Qui est ce garçon ?'),
  pair('Who', 'is your teacher?', 'Mrs Brown.', 'Qui est ta maîtresse ?'),
  pair('What', 'is it?', 'It’s a ruler.', 'Qu’est-ce que c’est ?'),
  pair('What', 'is in your bag?', 'A pencil case.', 'Qu’y a-t-il dans ton sac ?'),
  pair('What', 'do you want for your birthday?', 'A new bike.', 'Que veux-tu pour ton anniversaire ?'),
  pair('Where', 'is my bag?', 'Under the desk.', 'Où est mon sac ?'),
  pair('Where', 'is the cat?', 'In the garden.', 'Où est le chat ?'),
  pair('Where', 'do you play football?', 'In the park.', 'Où joues-tu au foot ?'),
  pair('When', 'is your birthday?', 'In May.', 'Quand est ton anniversaire ?'),
  pair('When', 'is the match?', 'On Saturday.', 'Quand a lieu le match ?'),
  pair('When', 'do you get up?', 'At seven o’clock.', 'Quand te lèves-tu ?'),
];
const pairOf = (rng: Rng, w: Wh) => rng.pick(PAIRS.filter((p) => p.wh === w));

function whMeaning(rng: Rng): QuestionDraft {
  const w = rng.pick(WH_WORDS);
  const wrong = some(rng, otherWh(w.en), 2);
  if (coin(rng)) {
    const { answer, traps } = choice(
      rng,
      w.fr,
      wrong.map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
    );
    return {
      prompt: `Que veut dire « ${w.en} » ?`,
      answer,
      traps,
      hint: 'Pense à une question entendue en classe qui commence par ce mot. Que répond-on ?',
      steps: [whyWh(w.en), `Réponse : **${w.fr}**`],
    };
  }
  const { answer, traps } = choice(
    rng,
    w.en,
    wrong.map((o) => ({ label: o.en, why: whyWh(o.en) })),
  );
  return {
    prompt: `Ta question demande ${w.asks}. Par quel mot anglais commence-t-elle ?`,
    answer,
    traps,
    hint: 'Traduis chaque mot proposé en français. Lequel demande cela ?',
    steps: [whyWh(w.en), `Réponse : **${w.en}**`],
  };
}

/** Les réponses des trois autres sortes que celle de la question. */
const otherAnswers = (rng: Rng, p: Pair) =>
  otherWh(p.wh).map((o) => {
    const x = pairOf(rng, o.en);
    return { label: x.a, why: `« ${x.a} » dit ${o.asks} : cela répond à « ${o.en} ».` };
  });

function whRecognise(rng: Rng): QuestionDraft {
  const form = rng.int(0, 2);
  if (form === 0) {
    const words = some(rng, WH_WORDS, 3);
    const rows = words.map((w) => pairOf(rng, w.en));
    const left = rows.map((p) => p.q);
    const right = shuffledOther(
      rng,
      rows.map((p) => p.a),
    );
    return {
      prompt: `Associe chaque question à sa réponse : ${left.join(' ')}`,
      answer: { kind: 'match', left, right, pairs: rows.map((p) => right.indexOf(p.a)) },
      hint: 'Regarde le premier mot de chaque question : demande-t-il qui, quoi, où ou quand ?',
      steps: [
        ...rows.map((p) => `${p.q} → ${p.a} (${wh(p.wh).asks})`),
        `Réponse : **${rows.map((p) => `${p.q} ${p.a}`).join(' ; ')}**`,
      ],
    };
  }
  if (form === 1) {
    const p = rng.pick(PAIRS);
    const { answer, traps } = choice(rng, p.a, otherAnswers(rng, p));
    return {
      prompt: `On te demande : « ${p.q} » Quelle réponse va avec cette question ?`,
      answer,
      traps,
      hint: 'Le premier mot de la question dit quelle sorte de réponse chercher.',
      steps: [whyWh(p.wh), `Réponse : **${p.a}**`],
    };
  }
  // Les autres propositions suivent la question entendue : deux sons n’ont jamais les mêmes choix.
  const i = rng.int(0, PAIRS.length - 1);
  const [p, ...near] = [0, 1, 2, 3].map((step) => at(PAIRS, (i + step) % PAIRS.length)) as [Pair, ...Pair[]];
  const { answer, traps } = choice(
    rng,
    p.fr,
    near.map((x) => ({ label: x.fr, why: `« ${x.fr} » se dit « ${x.q} ».` })),
  );
  return {
    prompt: 'Écoute. Quelle question entends-tu ?',
    audio: { text: p.q, lang: 'en-GB' },
    answer,
    traps,
    hint: 'Écoute surtout le tout premier mot, puis le dernier.',
    steps: [`On entend « ${p.q} »`, whyWh(p.wh), `Réponse : **${p.fr}**`],
  };
}

/** Traps d'un trou « mot interrogatif ». */
const whTraps = (right: Wh) => otherWh(right).map((o) => ({ text: o.en, why: whyWh(o.en) }));

function whWrite(rng: Rng): QuestionDraft {
  const p = rng.pick(PAIRS);
  const rest = p.q.slice(p.wh.length + 1);
  return {
    prompt: `Complète la question (${p.fr}) : « … ${rest} »`,
    answer: { kind: 'text', accepted: [p.wh] },
    traps: whTraps(p.wh),
    hint: 'En français, que demande la question ? Une personne, une chose, un lieu ou un moment ?',
    steps: [whyWh(p.wh), `Réponse : **${p.q}**`],
  };
}

/** Niveau 4 : sans français, la réponse seule indique le mot à écrire. */
function whFromAnswer(rng: Rng): QuestionDraft {
  const p = rng.pick(PAIRS);
  const rest = p.q.slice(p.wh.length + 1);
  return {
    prompt: `Lis la réponse, puis écris le mot qui manque : « … ${rest} » — « ${p.a} »`,
    answer: { kind: 'text', accepted: [p.wh] },
    traps: [
      ...whTraps(p.wh),
      { text: 'How', why: '« How » veut dire « comment » : la réponse donnée ne dit pas une manière.' },
    ],
    hint: 'La réponse dit-elle une personne, une chose, un lieu ou un moment ?',
    steps: [`« ${p.a} » dit ${wh(p.wh).asks}.`, whyWh(p.wh), `Réponse : **${p.q}**`],
  };
}

const TOWNS = ['Glasgow', 'London', 'Cambridge', 'Istanbul'];
const BIRTH_MONTHS = ['January', 'March', 'May', 'June', 'September', 'October'];
const FOODS = ['pizza', 'pasta', 'rice', 'cheese', 'cake'];

interface Topic {
  readonly wh: Wh;
  /** La question sans son mot interrogatif. */
  readonly rest: string;
  /** Le début de la réponse. */
  readonly start: string;
  /** La phrase du message qui donne l'information. */
  readonly said: (value: string) => string;
  readonly values: readonly string[];
}
const TOPICS: readonly Topic[] = [
  {
    wh: 'Where',
    rest: 'do you live?',
    start: 'I live in',
    said: (v) => `I live in ${v}.`,
    values: TOWNS,
  },
  {
    wh: 'When',
    rest: 'is your birthday?',
    start: 'My birthday is in',
    said: (v) => `My birthday is in ${v}.`,
    values: BIRTH_MONTHS,
  },
  {
    wh: 'Who',
    rest: 'is your best friend?',
    start: 'My best friend is',
    said: (v) => `My best friend is ${v}.`,
    values: [],
  },
  {
    wh: 'What',
    rest: 'is your favourite food?',
    start: 'My favourite food is',
    said: (v) => `My favourite food is ${v}.`,
    values: FOODS,
  },
];

/** Niveau 5 : retrouver dans le bon message les informations, et le mot de chaque question. */
function whInterview(rng: Rng): QuestionDraft {
  const [kid, mate, ...friends] = some(rng, KIDS, 4) as [Kid, Kid, Kid, Kid];
  const facts = TOPICS.map((t) => {
    const pool = t.wh === 'Who' ? friends.map((f) => f.name) : t.values;
    const [mine, theirs] = some(rng, pool, 2) as [string, string];
    return { t, mine, theirs };
  });
  const message = (k: Kid, pick: (f: (typeof facts)[number]) => string) =>
    `${k.name}: ${rng
      .shuffle(facts)
      .map((f) => f.t.said(pick(f)))
      .join(' ')}`;
  const lines = rng.shuffle([message(kid, (f) => f.mine), message(mate, (f) => f.theirs)]);
  const rows = some(rng, facts, 2);
  const [a, b] = rows as [(typeof facts)[number], (typeof facts)[number]];
  return {
    prompt: `Lis les messages. Tu poses deux questions à ${kid.name}. Complète chaque question et sa réponse.`,
    figure: { kind: 'document', title: 'About me', lines, credit: 'Écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: ['1. « ', ` ${a.t.rest} » — « ${a.t.start} `, '. » 2. « ', ` ${b.t.rest} » — « ${b.t.start} `, '. »'],
      blanks: rows.flatMap((f) => [
        { mode: 'text' as const, accepted: [f.t.wh] },
        { mode: 'text' as const, accepted: [f.mine] },
      ]),
    },
    hint: `Pour le mot de chaque question, regarde ce que dit la réponse. Pour finir la réponse, lis seulement la ligne ${de(kid.name)}.`,
    steps: [
      ...rows.map((f) => `${whyWh(f.t.wh)} ${kid.name} écrit : « ${f.t.said(f.mine)} »`),
      `Réponse : **${rows.map((f) => `${f.t.wh}, ${f.mine}`).join(', ')}**`,
    ],
  };
}

const whQuestions: Skill = {
  id: 'acm2-mots-interrogatifs',
  title: 'Who, what, where, when',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **mot interrogatif** ouvre la question : **who** (qui), **what** (quoi, quel).',
      '**Where** demande un lieu (où) ; **when** demande un moment (quand).',
      'Exemple : Where is my bag? Under the desk.',
    ],
    source: source('Règles : British Council, LearnEnglish, « Questions and negatives » et « Present simple ».'),
    sources: ['cycle3-2020', 'bc-questions-negatives', 'bc-present-simple', 'bc-question-forms'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return whMeaning(rng);
    if (level === 2) return whRecognise(rng);
    if (level === 3) return whWrite(rng);
    if (level === 4) return whFromAnswer(rng);
    return whInterview(rng);
  },
};

// ——— 2. how old, how many ———
interface Counted {
  readonly one: string;
  readonly many: string;
  /** Pluriel français, après « Combien de ». */
  readonly fr: string;
}
const counted = (one: string, fr: string, many = `${one}s`): Counted => ({ one, many, fr });
const THINGS: readonly Counted[] = [
  counted('pen', 'stylos'),
  counted('book', 'livres'),
  counted('pencil', 'crayons'),
  counted('cat', 'chats'),
  counted('dog', 'chiens'),
  counted('rabbit', 'lapins'),
  counted('sandwich', 'sandwichs', 'sandwiches'),
];
const PETS = THINGS.filter((t) => ['cat', 'dog', 'rabbit'].includes(t.one)).concat(counted('hamster', 'hamsters'));
const WHY_OLD = '« How old » demande l’âge : « How old are you? » = « Quel âge as-tu ? »';
const WHY_MANY = '« How many » demande un nombre de choses : « combien de ».';

const AGE_QUESTIONS: readonly { readonly fr: string; readonly rest: string }[] = [
  { fr: 'Quel âge as-tu ?', rest: 'are you?' },
  { fr: 'Quel âge a-t-il ?', rest: 'is he?' },
  { fr: 'Quel âge a-t-elle ?', rest: 'is she?' },
  { fr: 'Quel âge a ta sœur ?', rest: 'is your sister?' },
  { fr: 'Quel âge a ton frère ?', rest: 'is your brother?' },
];

function howMeaning(rng: Rng): QuestionDraft {
  const t = rng.pick(THINGS);
  const form = rng.int(0, 2);
  if (form === 0) {
    const { answer, traps } = choice(rng, 'Quel âge as-tu ?', [
      { label: 'Comment vas-tu ?', why: '« Comment vas-tu ? » se dit « How are you? », sans « old ».' },
      { label: 'Comment t’appelles-tu ?', why: '« Comment t’appelles-tu ? » se dit « What’s your name? ».' },
    ]);
    return {
      prompt: 'Que veut dire « How old are you? » ?',
      answer,
      traps,
      hint: 'Souviens-toi de ce qu’on répond en classe quand on entend cette question.',
      steps: [WHY_OLD, 'Réponse : **Quel âge as-tu ?**'],
    };
  }
  const good = form === 1 ? 'How many' : 'How old';
  const { answer, traps } = choice(rng, good, [
    { label: form === 1 ? 'How old' : 'How many', why: form === 1 ? WHY_OLD : WHY_MANY },
    { label: 'How are', why: '« How are you? » demande comment ça va.' },
  ]);
  return {
    prompt:
      form === 1
        ? `Tu veux demander combien de ${t.fr}. Par quels mots commences-tu ta question ?`
        : `Tu veux demander l’âge ${rng.pick(['d’un copain', 'd’une copine', 'de ton correspondant'])}. Par quels mots commences-tu ta question ?`,
    answer,
    traps,
    hint: 'Un des groupes parle des années qu’on a, un autre d’un nombre de choses.',
    steps: [form === 1 ? WHY_MANY : WHY_OLD, `Réponse : **${good}**`],
  };
}

function howRecognise(rng: Rng): QuestionDraft {
  if (rng.int(0, 2) === 0) {
    // Les autres propositions suivent la chose entendue : deux sons n'ont jamais les mêmes choix.
    const i = rng.int(0, THINGS.length - 1);
    const [a, b, c] = [0, 1, 2].map((s) => at(THINGS, (i + s) % THINGS.length)) as [Counted, Counted, Counted];
    const good = `Combien de ${a.fr} as-tu ?`;
    const { answer, traps } = choice(rng, good, [
      { label: `Combien de ${b.fr} as-tu ?`, why: `« ${b.fr} » se dit « ${b.many} ».` },
      { label: `Combien de ${c.fr} as-tu ?`, why: `« ${c.fr} » se dit « ${c.many} ».` },
      { label: 'Quel âge as-tu ?', why: WHY_OLD },
    ]);
    return {
      prompt: 'Écoute. Que demande-t-on ?',
      audio: { text: `How many ${a.many} have you got?`, lang: 'en-GB' },
      answer,
      traps,
      hint: 'Écoute les deux premiers mots, puis le nom de la chose.',
      steps: [`On entend « How many ${a.many} have you got? »`, WHY_MANY, `Réponse : **${good}**`],
    };
  }
  const [t, u] = some(rng, PETS, 2) as [Counted, Counted];
  const n = rng.int(2, 6);
  const age = rng.int(7, 12);
  const isAge = coin(rng);
  const reply = isAge ? `I’m ${wordOf(age)}.` : `I’ve got ${wordOf(n)} ${t.many}.`;
  const good = isAge ? 'How old are you?' : `How many ${t.many} have you got?`;
  const { answer, traps } = choice(rng, good, [
    isAge
      ? { label: `How many ${t.many} have you got?`, why: `${WHY_MANY} Ici, la réponse dit un âge.` }
      : { label: 'How old are you?', why: `${WHY_OLD} Ici, la réponse dit combien d’animaux.` },
    isAge
      ? { label: 'How are you?', why: '« How are you? » demande comment ça va : on répond « I’m fine ».' }
      : { label: `How many ${u.many} have you got?`, why: `La réponse parle de « ${t.many} », pas de « ${u.many} ».` },
    { label: 'Where do you live?', why: '« Where » demande un lieu.' },
  ]);
  return {
    prompt: `Quelle question va avec cette réponse : « ${reply} » ?`,
    answer,
    traps,
    hint: 'La réponse dit-elle un âge ou un nombre de choses ?',
    steps: [isAge ? WHY_OLD : WHY_MANY, `Réponse : **${good}**`],
  };
}

const howTraps = (old: boolean) => [
  { text: old ? 'How many' : 'How old', why: old ? WHY_MANY : WHY_OLD },
  { text: 'How', why: 'Il faut deux mots : « How » puis un deuxième mot.' },
  old
    ? { text: 'What age', why: 'En anglais courant, on demande l’âge avec « How old ».' }
    : { text: 'How much', why: 'Devant des choses qu’on compte, on dit « How many », pas « How much ».' },
];

function howWrite(rng: Rng): QuestionDraft {
  const old = coin(rng);
  const a = rng.pick(AGE_QUESTIONS);
  const t = rng.pick(THINGS);
  const fr = old ? a.fr : `Combien de ${t.fr} as-tu ?`;
  const rest = old ? a.rest : `${t.many} have you got?`;
  const good = old ? 'How old' : 'How many';
  return {
    prompt: `Complète avec deux mots (${fr}) : « … … ${rest} »`,
    answer: { kind: 'text', accepted: [good] },
    traps: howTraps(old),
    hint: 'Le premier mot est le même pour l’âge et pour « combien ». Le second change.',
    steps: [old ? WHY_OLD : WHY_MANY, `Réponse : **${good} ${rest}**`],
  };
}

/** Niveau 4 : écrire la question entière. */
function howSentence(rng: Rng): QuestionDraft {
  if (coin(rng)) {
    const a = rng.pick(AGE_QUESTIONS);
    const good = `How old ${a.rest.slice(0, -1)}`;
    const verb = a.rest.split(' ')[0];
    const subject = a.rest.slice(0, -1).slice((verb ?? '').length + 1);
    return {
      prompt: `Écris la question en anglais : « ${a.fr} »`,
      answer: { kind: 'text', accepted: asked([good]) },
      traps: [
        { text: `How old ${subject} ${verb}?`, why: `Dans une question, « ${verb} » passe avant la personne.` },
        { text: `How many ${a.rest}`, why: WHY_MANY },
        { text: `How ${a.rest}`, why: 'Il manque « old » : sans lui, on ne demande pas l’âge.' },
      ],
      hint: 'Les deux mots de l’âge, puis le verbe « être », puis la personne.',
      steps: [WHY_OLD, `Puis le verbe avant la personne : « ${verb} ${subject} ».`, `Réponse : **${good}?**`],
    };
  }
  const t = rng.pick(THINGS);
  const good = `How many ${t.many} have you got`;
  return {
    prompt: `Écris la question en anglais (avec « got ») : « Combien de ${t.fr} as-tu ? » (${t.fr} : ${t.one})`,
    answer: { kind: 'text', accepted: asked([good]) },
    traps: [
      { text: `How many ${t.one} have you got?`, why: `Après « How many », le nom est au pluriel : « ${t.many} ».` },
      { text: `How much ${t.many} have you got?`, why: 'Devant des choses qu’on compte, on dit « How many ».' },
      { text: `How many ${t.many} you have got?`, why: 'Dans une question, « have » passe avant « you ».' },
    ],
    hint: 'Les deux mots pour « combien de », la chose au pluriel, puis « as-tu » : l’ordre change dans la question.',
    steps: [WHY_MANY, `La chose est au pluriel : « ${t.many} ». Puis « have you got ».`, `Réponse : **${good}?**`],
  };
}

const numberAnswers = (n: number) => [wordOf(n) ?? String(n), String(n)];

/** Niveau 5 : compléter les questions et trouver les nombres dans la bonne carte. */
function howProfile(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [a, b] = some(rng, PETS, 2) as [Counted, Counted];
  const [age, mateAge] = some(rng, [7, 8, 9, 10, 11, 12], 2) as [number, number];
  const [x, y, z, w] = some(rng, [2, 3, 4, 5, 6], 4) as [number, number, number, number];
  const card = (k: Kid, years: number, first: number, second: number) => {
    const pets = rng.shuffle([`${wordOf(first)} ${a.many}`, `${wordOf(second)} ${b.many}`]);
    return `${k.name}: I’m ${wordOf(years)}. I’ve got ${pets.join(' and ')}.`;
  };
  const lines = rng.shuffle([card(kid, age, x, y), card(mate, mateAge, z, w)]);
  const wanted = coin(rng) ? { pet: a, n: x } : { pet: b, n: y };
  const ageFirst = coin(rng);
  const he = kid.he;
  const rows = [
    {
      mid: ` is ${kid.name}? » — « ${he === 'he' ? 'He' : 'She'}’s `,
      ask: 'How old',
      n: age,
    },
    {
      mid: ` ${wanted.pet.many} has ${he} got? » — « `,
      ask: 'How many',
      n: wanted.n,
    },
  ];
  const [p, q] = (ageFirst ? rows : [...rows].reverse()) as [(typeof rows)[number], (typeof rows)[number]];
  return {
    prompt: `Lis les cartes. ${gender(kid)} Complète les deux questions sur ${kid.name} (deux mots) et leurs réponses (un nombre).`,
    figure: { kind: 'document', title: 'My card', lines, credit: 'Écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: ['1. « ', p.mid, '. » 2. « ', q.mid, '. »'],
      blanks: [p, q].flatMap((row) => [
        { mode: 'text' as const, accepted: [row.ask] },
        { mode: 'text' as const, accepted: numberAnswers(row.n) },
      ]),
    },
    hint: `Une question demande l’âge, l’autre un nombre d’animaux. Lis seulement la carte ${de(kid.name)}.`,
    steps: [
      `${WHY_OLD} La carte ${de(kid.name)} dit « I’m ${wordOf(age)}. »`,
      `${WHY_MANY} Elle dit aussi « ${wordOf(wanted.n)} ${wanted.pet.many} ».`,
      `Réponse : **${p.ask}, ${wordOf(p.n)}, ${q.ask}, ${wordOf(q.n)}**`,
    ],
  };
}

const howOldMany: Skill = {
  id: 'acm2-how-old-many',
  title: 'How old, how many',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**How old** demande l’âge : How old are you? I’m ten.',
      '**How many** demande un nombre de choses. Le nom prend le **pluriel** : How many pens have you got?',
      'Question : le verbe passe avant la personne (are you, have you got).',
    ],
    source: source('Règles : British Council, LearnEnglish, « Questions and negatives » et « Quantifiers ».'),
    sources: ['cycle3-2020', 'bc-questions-negatives', 'bc-quantifiers', 'bck-have-got', 'bck-flashcards-1-12'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return howMeaning(rng);
    if (level === 2) return howRecognise(rng);
    if (level === 3) return howWrite(rng);
    if (level === 4) return howSentence(rng);
    return howProfile(rng);
  },
};

// ——— 3. Do you…? Yes, I do ———
interface Habit {
  /** Verbe et complément, après « Do you ». */
  readonly en: string;
  readonly fr: string;
}
const HABITS: readonly Habit[] = [
  { en: 'like apples', fr: 'Aimes-tu les pommes ?' },
  { en: 'like bananas', fr: 'Aimes-tu les bananes ?' },
  { en: 'like chocolate', fr: 'Aimes-tu le chocolat ?' },
  { en: 'like cats', fr: 'Aimes-tu les chats ?' },
  { en: 'like music', fr: 'Aimes-tu la musique ?' },
  { en: 'play football', fr: 'Joues-tu au foot ?' },
  { en: 'play tennis', fr: 'Joues-tu au tennis ?' },
  { en: 'play the piano', fr: 'Joues-tu du piano ?' },
  { en: 'speak English', fr: 'Parles-tu anglais ?' },
];
const WHY_DO = 'Avec « you », la question au présent commence par « Do ».';
const WHY_SHORT = 'La réponse courte reprend « do » : Yes, I do. / No, I don’t.';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function doQuestionChoice(rng: Rng): QuestionDraft {
  const h = rng.pick(HABITS);
  const good = `Do you ${h.en}?`;
  const { answer, traps } = choice(rng, good, [
    { label: `You ${h.en}.`, why: `C’est une affirmation, pas une question. ${WHY_DO}` },
    { label: `Do they ${h.en}?`, why: '« they » veut dire « ils » ou « elles » : on ne parle pas à ton ami.' },
  ]);
  return {
    prompt: `Quelle phrase demande à un ami : « ${h.fr} » ?`,
    answer,
    traps,
    hint: 'Cherche une question, pas une affirmation. Puis vérifie à qui elle s’adresse : « tu ».',
    steps: [WHY_DO, `Réponse : **${good}**`],
  };
}

function doShortChoice(rng: Rng): QuestionDraft {
  const h = rng.pick(HABITS);
  const yes = coin(rng);
  if (rng.int(0, 2) === 0) {
    const i = HABITS.indexOf(h);
    const [b, c, d] = [1, 2, 3].map((s) => at(HABITS, (i + s) % HABITS.length)) as [Habit, Habit, Habit];
    const { answer, traps } = choice(
      rng,
      h.fr,
      [b, c, d].map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « Do you ${o.en}? ».` })),
    );
    return {
      prompt: 'Écoute. Quelle question te pose-t-on ?',
      audio: { text: `Do you ${h.en}?`, lang: 'en-GB' },
      answer,
      traps,
      hint: 'Après « Do you », écoute le verbe puis le dernier mot.',
      steps: [`On entend « Do you ${h.en}? »`, `Réponse : **${h.fr}**`],
    };
  }
  const word = yes ? 'Yes, I do.' : 'No, I don’t.';
  const { answer, traps } = choice(rng, word, [
    { label: yes ? 'No, I don’t.' : 'Yes, I do.', why: `Ici, tu veux répondre ${yes ? 'oui' : 'non'}.` },
    {
      label: yes ? 'Yes, I am.' : 'No, I’m not.',
      why: `La question commence par « Do », pas par « Are ». ${WHY_SHORT}`,
    },
    {
      label: yes ? 'Yes, I can.' : 'No, I can’t.',
      why: `La question commence par « Do », pas par « Can ». ${WHY_SHORT}`,
    },
  ]);
  return {
    prompt: `« Do you ${h.en}? » Tu veux répondre ${yes ? 'oui' : 'non'}. Que dis-tu ?`,
    answer,
    traps,
    hint: 'Regarde le premier mot de la question : la réponse le reprend.',
    steps: [WHY_SHORT, `Réponse : **${word}**`],
  };
}

const shortTraps = (yes: boolean, who: string) => [
  {
    text: yes ? `No, ${who} don’t.` : `Yes, ${who} do.`,
    why: `Regarde bien : il faut répondre ${yes ? 'oui' : 'non'}.`,
  },
  {
    text: `${yes ? 'Yes' : 'No'}, ${who} ${who === 'I' ? 'am' : 'are'}${yes ? '' : ' not'}.`,
    why: 'La question commence par « Do » : réponds avec « do ».',
  },
  { text: yes ? 'Yes' : 'No', why: 'Fais la réponse courte complète : Yes ou No, la personne, puis do ou don’t.' },
];

function doShortWrite(rng: Rng): QuestionDraft {
  const h = rng.pick(HABITS);
  if (coin(rng)) {
    return {
      prompt: `Complète la question (${h.fr}) : « … you ${h.en}? »`,
      answer: { kind: 'text', accepted: ['Do'] },
      traps: [
        { text: 'Does', why: '« Does » va avec he, she, it. Avec you : « Do ».' },
        { text: 'Are', why: '« Are » est le verbe be. Devant un autre verbe, on met « Do ».' },
        { text: 'Can', why: '« Can » demande si on sait faire quelque chose.' },
      ],
      hint: 'Au présent, un petit mot ouvre la question.',
      steps: [WHY_DO, `Réponse : **Do you ${h.en}?**`],
    };
  }
  const yes = coin(rng);
  const good = yes ? 'Yes, I do' : 'No, I don’t';
  return {
    prompt: `Réponds ${yes ? 'oui' : 'non'} par une réponse courte : « Do you ${h.en}? »`,
    answer: { kind: 'text', accepted: short(yes, 'I', yes ? ['do'] : ['don’t', 'do not']) },
    traps: shortTraps(yes, 'I'),
    hint: 'Yes ou No, puis « je » en anglais, puis le premier mot de la question (avec « ne… pas » si c’est non).',
    steps: [WHY_SHORT, `Réponse : **${good}.**`],
  };
}

const WH_DO: readonly { readonly fr: string; readonly en: string; readonly wh: string; readonly trap: string }[] = [
  { fr: 'Où habites-tu ?', en: 'Where do you live', wh: 'Where', trap: 'When' },
  { fr: 'Où joues-tu au foot ?', en: 'Where do you play football', wh: 'Where', trap: 'What' },
  { fr: 'Quand joues-tu au tennis ?', en: 'When do you play tennis', wh: 'When', trap: 'Where' },
  { fr: 'Quand te lèves-tu ?', en: 'When do you get up', wh: 'When', trap: 'Where' },
  { fr: 'Que veux-tu ?', en: 'What do you want', wh: 'What', trap: 'Who' },
];

/** Niveau 4 : la question entière, une question avec un mot interrogatif, ou une réponse avec we / they. */
function doProduce(rng: Rng): QuestionDraft {
  const form = rng.int(0, 2);
  if (form === 0) {
    const h = rng.pick(HABITS);
    const good = `Do you ${h.en}`;
    return {
      prompt: `Écris la question en anglais : « ${h.fr} »`,
      answer: { kind: 'text', accepted: asked([good]) },
      traps: [
        { text: `You ${h.en}?`, why: `Il manque « Do » au début. ${WHY_DO}` },
        { text: `Are you ${h.en}?`, why: '« Are » est le verbe be : ici, il faut « Do ».' },
        { text: `Does you ${h.en}?`, why: 'Avec « you », on dit « Do ».' },
      ],
      hint: 'Trois blocs : le petit mot de la question, « tu », puis le verbe et la suite.',
      steps: [WHY_DO, `Réponse : **${good}?**`],
    };
  }
  if (form === 1) {
    const x = rng.pick(WH_DO);
    const rest = x.en.slice(x.wh.length + 4);
    return {
      prompt: `Écris la question en anglais : « ${x.fr} »`,
      answer: { kind: 'text', accepted: asked([x.en]) },
      traps: [
        { text: `${x.wh} you ${rest.slice(4)}?`, why: 'Il manque « do » entre le mot interrogatif et « you ».' },
        { text: `${x.trap} do ${rest}?`, why: 'Ce n’est pas le bon mot interrogatif.' },
        { text: `Do you ${rest.slice(4)} ${x.wh.toLowerCase()}?`, why: 'Le mot interrogatif se place au début.' },
      ],
      hint: 'Le mot interrogatif d’abord, puis la question habituelle avec « you ».',
      steps: [`On commence par « ${x.wh} », puis « do you ».`, `Réponse : **${x.en}?**`],
    };
  }
  const h = rng.pick(HABITS);
  const yes = coin(rng);
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const we = coin(rng);
  const who = we ? 'we' : 'they';
  const question = we ? `Do you and ${mate.name} ${h.en}?` : `Do ${kid.name} and ${mate.name} ${h.en}?`;
  const good = `${yes ? 'Yes' : 'No'}, ${who} ${yes ? 'do' : 'don’t'}`;
  return {
    prompt: `Réponds ${yes ? 'oui' : 'non'} par une réponse courte : « ${question} »`,
    answer: { kind: 'text', accepted: short(yes, who, yes ? ['do'] : ['don’t', 'do not']) },
    traps: [
      {
        text: `${yes ? 'Yes' : 'No'}, I ${yes ? 'do' : 'don’t'}.`,
        why: we ? 'On parle de toi et d’un ami : « we » (nous).' : 'On parle de deux autres personnes : « they ».',
      },
      ...shortTraps(yes, who),
    ],
    hint: 'Combien de personnes ? Es-tu l’une d’elles ? Choisis le bon pronom, puis reprends « do ».',
    steps: [
      we ? `« you and ${mate.name} » : toi et un ami, c’est « we ».` : 'Deux autres personnes : « they ».',
      `Réponse : **${good}.**`,
    ],
  };
}

const LIKED = ['apples', 'bananas', 'cats', 'music', 'chocolate', 'snakes'];
const PLAYED = ['football', 'tennis', 'rugby', 'golf'];

/** Niveau 5 : répondre à la place d'un enfant d'après son message, puis lui poser une question. */
function doInterview(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [liked, disliked] = some(rng, LIKED, 2) as [string, string];
  const [sport, other] = some(rng, PLAYED, 2) as [string, string];
  const card = (k: Kid, yes: string, no: string, play: string) =>
    `${k.name}: ${rng.shuffle([`I like ${yes}.`, `I don’t like ${no}.`, `I play ${play}.`]).join(' ')}`;
  // Le camarade pense le contraire : il faut lire la bonne ligne.
  const lines = rng.shuffle([card(kid, liked, disliked, sport), card(mate, disliked, liked, other)]);
  const answers = rng.shuffle([
    { thing: liked, yes: true },
    { thing: disliked, yes: false },
  ]);
  const [a, b] = answers as [(typeof answers)[number], (typeof answers)[number]];
  const say = (y: boolean) => ({ mode: 'text' as const, accepted: [y ? 'Yes' : 'No'] });
  const verb = (y: boolean) => ({ mode: 'text' as const, accepted: y ? ['do'] : ['don’t', 'do not'] });
  return {
    prompt: `Lis les messages. Tu interroges ${kid.name}. Écris ses deux réponses, puis complète ta dernière question.`,
    figure: { kind: 'document', title: 'My likes', lines, credit: 'Écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: [
        `1. « Do you like ${a.thing}? » — « `,
        ', I ',
        `. » 2. « Do you like ${b.thing}? » — « `,
        ', I ',
        '. » 3. « ',
        ' ',
        ' play ',
        '? » — « Yes, I do. »',
      ],
      blanks: [
        say(a.yes),
        verb(a.yes),
        say(b.yes),
        verb(b.yes),
        { mode: 'text', accepted: ['Do'] },
        { mode: 'text', accepted: ['you'] },
        { mode: 'text', accepted: [sport] },
      ],
    },
    hint: `Lis seulement la ligne ${de(kid.name)}. Cherche « don’t », puis « play ». Qui interroges-tu à la fin ?`,
    steps: [
      ...answers.map(
        (x) =>
          `${kid.name} écrit « I ${x.yes ? 'like' : 'don’t like'} ${x.thing}. » → ${x.yes ? 'Yes, I do' : 'No, I don’t'}.`,
      ),
      `${kid.name} écrit « I play ${sport}. » Ta question : « Do you play ${sport}? »`,
      `Réponse : **${answers.map((x) => (x.yes ? 'Yes, do' : 'No, don’t')).join(', ')}, Do, you, ${sport}**`,
    ],
  };
}

const doYou: Skill = {
  id: 'acm2-do-you',
  title: 'Do you…? Yes, I do',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Au présent, ta question commence par **Do** : Do you like bananas?',
      '**Réponse courte** : Yes, I do. / No, I don’t. On ne répète pas le verbe.',
      'Pour toi et un ami : Yes, we do. Pour deux autres personnes : Yes, they do.',
    ],
    source: source(
      'Règles : British Council, LearnEnglish Kids, « Like and don’t like » ; LearnEnglish, « Present simple ».',
    ),
    sources: ['cycle3-2020', 'bck-like', 'bc-present-simple', 'bc-present-simple-a1', 'bc-question-forms'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return doQuestionChoice(rng);
    if (level === 2) return doShortChoice(rng);
    if (level === 3) return doShortWrite(rng);
    if (level === 4) return doProduce(rng);
    return doInterview(rng);
  },
};

// ——— 4. Can you…? ———
interface Ability {
  readonly en: string;
  /** « Sais-tu … ? » */
  readonly fr: string;
  readonly alt?: readonly string[];
}
const ABILITIES: readonly Ability[] = [
  { en: 'swim', fr: 'nager' },
  { en: 'dance', fr: 'danser' },
  { en: 'ride a bike', fr: 'faire du vélo', alt: ['ride a bicycle', 'cycle'] },
  { en: 'speak English', fr: 'parler anglais' },
  { en: 'play the guitar', fr: 'jouer de la guitare', alt: ['play guitar'] },
  { en: 'play the piano', fr: 'jouer du piano', alt: ['play piano'] },
  { en: 'run fast', fr: 'courir vite', alt: ['run quickly'] },
];
const WHY_CAN = 'Dans une question, « Can » passe devant la personne : Can you swim?';
const WHY_CAN_SHORT = 'La réponse courte reprend « can » : Yes, I can. / No, I can’t.';
const WHY_BARE = 'Après « can », le verbe reste seul : pas de « to », pas de s.';
const NOT_CAN = ['can’t', 'cannot', 'can not'];

function canChoice(rng: Rng): QuestionDraft {
  const a = rng.pick(ABILITIES);
  const good = `Can you ${a.en}?`;
  const { answer, traps } = choice(rng, good, [
    { label: `You can ${a.en}.`, why: `C’est une affirmation, pas une question. ${WHY_CAN}` },
    { label: `Can I ${a.en}?`, why: '« I » veut dire « je » : la question parle de moi, pas de ton ami.' },
  ]);
  return {
    prompt: `Quelle phrase demande à un ami : « Sais-tu ${a.fr} ? » ?`,
    answer,
    traps,
    hint: 'Dans une vraie question, l’ordre des mots change. Vérifie aussi à qui elle s’adresse : « tu ».',
    steps: [WHY_CAN, `Réponse : **${good}**`],
  };
}

function canShortChoice(rng: Rng): QuestionDraft {
  const a = rng.pick(ABILITIES);
  if (rng.int(0, 2) === 0) {
    const i = ABILITIES.indexOf(a);
    const [b, c, d] = [1, 2, 3].map((s) => at(ABILITIES, (i + s) % ABILITIES.length)) as [Ability, Ability, Ability];
    const good = `Sais-tu ${a.fr} ?`;
    const { answer, traps } = choice(
      rng,
      good,
      [b, c, d].map((o) => ({ label: `Sais-tu ${o.fr} ?`, why: `« ${o.fr} » se dit « ${o.en} ».` })),
    );
    return {
      prompt: 'Écoute. Qu’est-ce qu’on te demande ?',
      audio: { text: `Can you ${a.en}?`, lang: 'en-GB' },
      answer,
      traps,
      hint: 'Après « Can you », écoute bien l’action.',
      steps: [`On entend « Can you ${a.en}? »`, `Réponse : **${good}**`],
    };
  }
  const yes = coin(rng);
  const good = yes ? 'Yes, I can.' : 'No, I can’t.';
  const { answer, traps } = choice(rng, good, [
    { label: yes ? 'No, I can’t.' : 'Yes, I can.', why: `Ici, tu veux répondre ${yes ? 'oui' : 'non'}.` },
    {
      label: yes ? 'Yes, I do.' : 'No, I don’t.',
      why: `La question commence par « Can », pas par « Do ». ${WHY_CAN_SHORT}`,
    },
    { label: yes ? 'Yes, I am.' : 'No, I’m not.', why: `La question commence par « Can ». ${WHY_CAN_SHORT}` },
  ]);
  return {
    prompt: `« Can you ${a.en}? » Tu veux répondre ${yes ? 'oui' : 'non'}. Que dis-tu ?`,
    answer,
    traps,
    hint: 'La réponse reprend le premier mot de la question.',
    steps: [WHY_CAN_SHORT, `Réponse : **${good}**`],
  };
}

const canShortTraps = (yes: boolean, who: string) => [
  {
    text: yes ? `No, ${who} can’t.` : `Yes, ${who} can.`,
    why: `Regarde bien : il faut répondre ${yes ? 'oui' : 'non'}.`,
  },
  {
    text: yes ? `Yes, ${who} do.` : `No, ${who} don’t.`,
    why: 'La question commence par « Can » : réponds avec « can » ou « can’t ».',
  },
  { text: yes ? 'Yes' : 'No', why: 'Fais la réponse courte complète : Yes ou No, la personne, puis can ou can’t.' },
];

function canWrite(rng: Rng): QuestionDraft {
  const a = rng.pick(ABILITIES);
  if (coin(rng)) {
    return {
      prompt: `Complète la question (Sais-tu ${a.fr} ?) : « … you ${a.en}? »`,
      answer: { kind: 'text', accepted: ['Can'] },
      traps: [
        { text: 'Do', why: '« Do you… ? » demande une habitude. Pour « savoir faire », on dit « Can ».' },
        { text: 'Are', why: '« Are » est le verbe be : il ne dit pas ce qu’on sait faire.' },
        { text: 'Cans', why: '« can » ne prend jamais de s.' },
      ],
      hint: 'Quel petit mot veut dire « savoir faire » ?',
      steps: [WHY_CAN, `Réponse : **Can you ${a.en}?**`],
    };
  }
  const yes = coin(rng);
  return {
    prompt: `Réponds ${yes ? 'oui' : 'non'} par une réponse courte : « Can you ${a.en}? »`,
    answer: { kind: 'text', accepted: short(yes, 'I', yes ? ['can'] : NOT_CAN) },
    traps: canShortTraps(yes, 'I'),
    hint: 'Yes ou No, puis « je » en anglais, puis le premier mot de la question (avec « ne… pas » si c’est non).',
    steps: [WHY_CAN_SHORT, `Réponse : **${yes ? 'Yes, I can' : 'No, I can’t'}.**`],
  };
}

/** Niveau 4 : écrire la question avec he ou she, ou répondre à propos d'un enfant nommé. */
function canProduce(rng: Rng): QuestionDraft {
  const a = rng.pick(ABILITIES);
  if (coin(rng)) {
    const [who, fr] = rng.pick([
      ['you', `Sais-tu ${a.fr} ?`],
      ['he', `Sait-il ${a.fr} ?`],
      ['she', `Sait-elle ${a.fr} ?`],
      ['they', `Savent-ils ${a.fr} ?`],
    ] as const);
    const good = `Can ${who} ${a.en}`;
    const forms = [a.en, ...(a.alt ?? [])].map((x) => `Can ${who} ${x}`);
    return {
      prompt: `Écris la question en anglais : « ${fr} »`,
      answer: { kind: 'text', accepted: asked(forms) },
      traps: [
        { text: `${cap(who)} can ${a.en}?`, why: WHY_CAN },
        { text: `Can ${who} to ${a.en}?`, why: WHY_BARE },
        { text: `Do ${who} can ${a.en}?`, why: 'Pas de « do » avec « can ».' },
      ],
      hint: 'Le petit mot de « savoir faire » d’abord, puis la personne, puis l’action seule.',
      steps: [WHY_CAN, WHY_BARE, `Réponse : **${good}?**`],
    };
  }
  const kid = rng.pick(KIDS);
  const yes = coin(rng);
  const good = yes ? `Yes, ${kid.he} can` : `No, ${kid.he} can’t`;
  const other = kid.he === 'he' ? 'she' : 'he';
  return {
    prompt: `${gender(kid)} Réponds ${yes ? 'oui' : 'non'} par une réponse courte : « Can ${kid.name} ${a.en}? »`,
    answer: { kind: 'text', accepted: short(yes, kid.he, yes ? ['can'] : NOT_CAN) },
    traps: [
      {
        text: yes ? `Yes, ${other} can.` : `No, ${other} can’t.`,
        why: `Pour ${kid.name}, on dit « ${kid.he} ».`,
      },
      ...canShortTraps(yes, kid.he),
    ],
    hint: `Remplace ${kid.name} par « he » (garçon) ou « she » (fille). Puis reprends le premier mot de la question.`,
    steps: [`Pour ${kid.name}, on dit « ${kid.he} ».`, `Réponse : **${good}.**`],
  };
}

/** Niveau 5 : lire deux messages, répondre à deux questions sur un enfant et en poser une. */
function canInterview(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [yesA, noA, ask] = some(rng, ABILITIES, 3) as [Ability, Ability, Ability];
  const card = (k: Kid, yes: Ability, no: Ability) =>
    `${k.name}: ${rng.shuffle([`I can ${yes.en}.`, `I can’t ${no.en}.`]).join(' ')}`;
  const lines = rng.shuffle([card(kid, yesA, noA), card(mate, noA, yesA)]);
  const rows = rng.shuffle([
    { a: yesA, yes: true },
    { a: noA, yes: false },
  ]);
  const [p, q] = rows as [(typeof rows)[number], (typeof rows)[number]];
  const say = (y: boolean) => ({ mode: 'text' as const, accepted: [y ? 'Yes' : 'No'] });
  const modal = (y: boolean) => ({ mode: 'text' as const, accepted: y ? ['can'] : NOT_CAN });
  const pronoun = { mode: 'text' as const, accepted: [kid.he] };
  return {
    prompt: `Lis les messages. ${gender(kid)} Complète les réponses sur ${kid.name}, puis ta question à ${mate.name} : « Sais-tu ${ask.fr} ? »`,
    figure: { kind: 'document', title: 'What can you do?', lines, credit: 'Écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: [
        `1. « Can ${kid.name} ${p.a.en}? » — « `,
        ', ',
        ' ',
        `. » 2. « Can ${kid.name} ${q.a.en}? » — « `,
        ', ',
        ' ',
        '. » 3. « ',
        ' ',
        ' ',
        '? »',
      ],
      blanks: [
        say(p.yes),
        pronoun,
        modal(p.yes),
        say(q.yes),
        pronoun,
        modal(q.yes),
        { mode: 'text', accepted: ['Can'] },
        { mode: 'text', accepted: ['you'] },
        { mode: 'text', accepted: [ask.en, ...(ask.alt ?? [])] },
      ],
    },
    hint: `Lis seulement la ligne ${de(kid.name)}. Pour la dernière question, commence par le mot de « savoir faire ».`,
    steps: [
      ...rows.map(
        (r) =>
          `${kid.name} écrit « I ${r.yes ? 'can' : 'can’t'} ${r.a.en}. » → ${r.yes ? 'Yes' : 'No'}, ${kid.he} ${r.yes ? 'can' : 'can’t'}.`,
      ),
      `Ta question : « Can you ${ask.en}? »`,
      `Réponse : **${rows.map((r) => `${r.yes ? 'Yes' : 'No'}, ${kid.he}, ${r.yes ? 'can' : 'can’t'}`).join(', ')}, Can, you, ${ask.en}**`,
    ],
  };
}

const canYou: Skill = {
  id: 'acm2-can-you',
  title: 'Can you…?',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Can** demande si on sait faire : Can you swim? Le verbe reste seul, sans « to ».',
      'Dans la question, Can passe devant la personne : Can she play the piano?',
      '**Réponse courte** : Yes, I can. / No, she can’t.',
    ],
    source: source('Règles : British Council, LearnEnglish Kids, « Can and can’t ».'),
    sources: ['cycle3-2020', 'bck-can', 'bc-can-could', 'bc-question-forms'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return canChoice(rng);
    if (level === 2) return canShortChoice(rng);
    if (level === 3) return canWrite(rng);
    if (level === 4) return canProduce(rng);
    return canInterview(rng);
  },
};

export const ENGLISH_QUESTIONS_CHAPTER: Chapter = {
  id: 'acm2-poser-questions',
  subject: 'anglais',
  grade: 'cm2',
  domain: 'langue',
  title: 'Poser des questions',
  skills: [whQuestions, howOldMany, doYou, canYou],
};
