import type { Chapter, Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, shuffledOther, some } from './temps.ts';
import {
  NAMED,
  PEOPLE,
  SINGLE,
  WRITTEN,
  asked,
  askedTraps,
  dotted,
  dottedTraps,
  isThird,
  listed,
  mids,
  type Person,
} from './outils-5e.ts';

/**
 * Anglais 5e — « Présent simple et be + ing » (lot an-5e-01, docs/adr/0034). Programme d’anglais du collège (arrêté
 * du 5 mai 2025) ; règles et formes : British Council (voir present-5e-faits.ts : chaque fait y porte sa source et sa
 * citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 5e';
const source = (detail: string) => `${PROGRAMME} — ${detail}. Règles et formes : British Council, LearnEnglish.`;

interface Activity {
  readonly base: string;
  /** Forme avec he, she, it. */
  readonly s: string;
  readonly ing: string;
  readonly obj: string;
  readonly fr: string;
}
const activity = (forms: readonly [string, string, string], obj: string, fr: string): Activity => ({
  base: forms[0],
  s: forms[1],
  ing: forms[2],
  obj,
  fr,
});

const ACTIVITIES: readonly Activity[] = [
  activity(['play', 'plays', 'playing'], 'football', 'jouer au foot'),
  activity(['watch', 'watches', 'watching'], 'TV', 'regarder la télé'),
  activity(['read', 'reads', 'reading'], 'comics', 'lire des BD'),
  activity(['cook', 'cooks', 'cooking'], 'dinner', 'préparer le dîner'),
  activity(['eat', 'eats', 'eating'], 'fruit', 'manger des fruits'),
  activity(['wear', 'wears', 'wearing'], 'a uniform', 'porter un uniforme'),
  activity(['ride', 'rides', 'riding'], 'a bike', 'faire du vélo'),
  activity(['write', 'writes', 'writing'], 'emails', 'écrire des courriels'),
  activity(['walk', 'walks', 'walking'], 'the dog', 'promener le chien'),
  activity(['make', 'makes', 'making'], 'cakes', 'faire des gâteaux'),
  activity(['do', 'does', 'doing'], 'the washing-up', 'faire la vaisselle'),
  activity(['have', 'has', 'having'], 'breakfast', 'prendre le petit-déjeuner'),
  activity(['visit', 'visits', 'visiting'], 'museums', 'visiter des musées'),
  activity(['study', 'studies', 'studying'], 'English', 'étudier l’anglais'),
];
const NOT_HAVE = ACTIVITIES.filter((a) => a.base !== 'have');
const HABITS = ['every day', 'every weekend', 'on Saturdays'] as const;
const NOWS = [
  { before: 'Look! ', after: '' },
  { before: '', after: ' right now' },
] as const;

const formFor = (p: Person, a: Activity) => (isThird(p) ? a.s : a.base);
const doFor = (p: Person) => (isThird(p) ? 'does' : 'do');
const dontFor = (p: Person) => (isThird(p) ? 'doesn’t' : 'don’t');
const beFor = (p: Person) => (isThird(p) ? 'is' : 'are');
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const He = (p: Person) => cap(p.pronoun);

const WHY_AUX = (p: Person) =>
  isThird(p)
    ? `Avec « ${p.mid} » (he ou she), on emploie does et doesn’t.`
    : `Avec « ${p.mid} », on emploie do et don’t ; does et doesn’t vont avec he, she, it.`;
const WHY_NO_S =
  'Après do, does, don’t ou doesn’t, le verbe reste à la base, sans -s : avec he, she, it, le -s est déjà dans does.';
const WHY_DO = 'Au présent simple, la négation et la question se construisent avec do ou does.';
const WHY_BE = 'Be ne sert pas à former le présent simple : am, is, are vont avec la forme en -ing.';
const WHY_HABIT = 'Une habitude, qui se répète, se dit au présent simple.';
const WHY_NOW = 'Une action en cours au moment où l’on parle se dit avec be + ing.';
const WHY_ING_ALONE = 'La forme en -ing a besoin de be : am, is ou are devant elle.';
const WHY_BE_BASE = 'Après be, il faut ici la forme en -ing, pas la base verbale.';
const WHY_S = 'Au présent simple, avec he, she, it, le verbe prend -s ou -es ; sinon il reste à la base.';
const WHY_STATE =
  'Ce verbe décrit un état (goût, envie, savoir) : il ne se met en général pas à la forme en -ing, même « maintenant ».';

const affirm = (p: Person, a: Activity, when: string) => `${p.text} ${formFor(p, a)} ${a.obj} ${when}.`;
const negate = (p: Person, a: Activity, when: string) => `${p.text} ${dontFor(p)} ${a.base} ${a.obj} ${when}.`;
const ask = (p: Person, a: Activity, when: string) => `${cap(doFor(p))} ${p.mid} ${a.base} ${a.obj} ${when}?`;

// ——— 1. Formes affirmative, négative, interrogative ———
function formsSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(PEOPLE);
  const a = rng.pick(NOT_HAVE);
  const when = rng.pick(HABITS);
  const all = [
    { kind: 'affirmative', text: affirm(p, a, when), why: 'Cette phrase affirme : ni not, ni question.' },
    { kind: 'négative', text: negate(p, a, when), why: `Cette phrase dit non, avec ${dontFor(p)}.` },
    { kind: 'interrogative (une question)', text: ask(p, a, when), why: 'Cette phrase pose une question.' },
  ];
  const right = rng.pick(all);
  const { answer, traps } = choice(
    rng,
    right.text,
    all.filter((x) => x !== right).map((x) => ({ label: x.text, why: x.why })),
  );
  return {
    prompt: `Présent simple, « ${a.fr} » (${p.text}, ${when}) : quelle phrase est ${right.kind} ?`,
    answer,
    traps,
    hint: 'Observe le début et la fin de chaque phrase : un mot pour dire non ? un point d’interrogation ?',
    steps: [
      'Affirmative : sujet puis verbe. Négative : don’t ou doesn’t. Question : Do ou Does devant le sujet.',
      `Réponse : **${right.text}**`,
    ],
  };
}

function formsChoose(rng: Rng): QuestionDraft {
  const p = rng.pick(PEOPLE);
  const a = rng.pick(NOT_HAVE);
  const when = rng.pick(HABITS);
  const isQuestion = rng.int(0, 1) === 0;
  const otherDo = isThird(p) ? 'do' : 'does';
  const otherDont = isThird(p) ? 'don’t' : 'doesn’t';
  const tail = `${a.obj} ${when}`;
  const good = isQuestion ? ask(p, a, when) : negate(p, a, when);
  const { answer, traps } = choice(
    rng,
    good,
    isQuestion
      ? [
          { label: `${cap(otherDo)} ${p.mid} ${a.base} ${tail}?`, why: WHY_AUX(p) },
          { label: `${cap(doFor(p))} ${p.mid} ${a.s} ${tail}?`, why: WHY_NO_S },
          { label: `${cap(formFor(p, a))} ${p.mid} ${tail}?`, why: WHY_DO },
        ]
      : [
          { label: `${p.text} ${otherDont} ${a.base} ${tail}.`, why: WHY_AUX(p) },
          { label: `${p.text} ${dontFor(p)} ${a.s} ${tail}.`, why: WHY_NO_S },
          { label: `${p.text} not ${formFor(p, a)} ${tail}.`, why: WHY_DO },
        ],
  );
  return {
    prompt: `« ${affirm(p, a, when)} » Quelle ${isQuestion ? 'question' : 'phrase négative'} est correcte ?`,
    answer,
    traps,
    hint: 'Vérifie deux choses : le petit mot choisi pour ce sujet, puis la fin du verbe.',
    steps: [WHY_AUX(p), 'Le verbe qui suit reste à la base.', `Réponse : **${good}**`],
  };
}

function formsGaps(rng: Rng): QuestionDraft {
  const p = rng.pick(PEOPLE);
  const a = rng.pick(ACTIVITIES);
  const when = rng.pick(HABITS);
  const tail = `${a.obj} ${when}`;
  return {
    prompt: `Complète la phrase négative, puis la question : « ${affirm(p, a, when)} »`,
    answer: {
      kind: 'cloze',
      parts: [`Négation : ${p.text} `, ' ', ` ${tail}. Question : `, ` ${p.mid} `, ` ${tail}?`],
      blanks: [
        { mode: 'text', accepted: [dontFor(p), `${doFor(p)} not`] },
        { mode: 'text', accepted: [a.base] },
        { mode: 'text', accepted: [cap(doFor(p))] },
        { mode: 'text', accepted: [a.base] },
      ],
    },
    hint: 'Remplace le sujet par un pronom (he, she, they, we) pour choisir le petit mot. Puis regarde le verbe.',
    steps: [
      WHY_AUX(p),
      'Le verbe qui suit reste à la base.',
      `Réponse : **${negate(p, a, when)}** puis **${ask(p, a, when)}**`,
    ],
  };
}

function formsTransform(rng: Rng): QuestionDraft {
  const p = rng.pick(PEOPLE.filter((x) => x.pronoun !== 'we'));
  const a = rng.pick(NOT_HAVE);
  const when = rng.pick(HABITS);
  const tail = `${a.obj} ${when}`;
  if (rng.int(0, 1) === 0) {
    const build = (to: Person, aux: string, form: string) => `${aux} ${to.mid} ${form} ${tail}`;
    return {
      prompt: `Transforme en question (réponse attendue : oui ou non) : « ${affirm(p, a, when)} »`,
      answer: { kind: 'text', accepted: asked(mids(p).map((to) => build(to, cap(doFor(p)), a.base))) },
      traps: askedTraps(
        mids(p).flatMap((to) => [
          { text: build(to, isThird(p) ? 'Do' : 'Does', a.base), why: WHY_AUX(p) },
          { text: build(to, cap(doFor(p)), a.s), why: WHY_NO_S },
          { text: `${cap(formFor(p, a))} ${to.mid} ${tail}`, why: WHY_DO },
        ]),
      ),
      hint: 'La question commence par un petit mot placé avant le sujet. Puis vérifie la fin du verbe.',
      steps: [WHY_AUX(p), WHY_NO_S, `Réponse : **${ask(p, a, when)}**`],
    };
  }
  const build = (aux: string, form: string) => `${p.text} ${aux} ${form} ${tail}`;
  return {
    prompt: `Mets à la forme négative : « ${affirm(p, a, when)} »`,
    answer: {
      kind: 'text',
      accepted: dotted([build(dontFor(p), a.base), build(`${doFor(p)} not`, a.base)]),
    },
    traps: dottedTraps([
      { text: build(isThird(p) ? 'don’t' : 'doesn’t', a.base), why: WHY_AUX(p) },
      { text: build(dontFor(p), a.s), why: WHY_NO_S },
      { text: build('not', formFor(p, a)), why: WHY_DO },
    ]),
    hint: 'Il faut un petit mot qui dit non entre le sujet et le verbe. Que devient la fin du verbe ?',
    steps: [WHY_AUX(p), WHY_NO_S, `Réponse : **${negate(p, a, when)}**`],
  };
}

function formsDocument(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const mate = rng.pick(NAMED.filter((x) => x !== p));
  const [yes, no] = some(rng, NOT_HAVE, 2) as [Activity, Activity];
  const says = (a: Activity, does: boolean) => `I ${does ? '' : 'don’t '}${a.base} ${a.obj}.`;
  // L’autre message dit le contraire : il faut lire le bon.
  const lines = rng.shuffle([
    `${p.text}: ${rng.shuffle([says(yes, true), says(no, false)]).join(' ')}`,
    `${mate.text}: ${rng.shuffle([says(yes, false), says(no, true)]).join(' ')}`,
  ]);
  return {
    prompt: `Lis les messages. Complète le compte rendu sur ${p.text} : « ${yes.fr} », puis « ${no.fr} ».`,
    figure: { kind: 'document', title: 'About us', lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [
        `${p.text} `,
        ` ${yes.obj}. ${He(p)} `,
        ` ${no.obj}. « `,
        ` ${p.text} `,
        ` ${no.obj}? » « No, ${p.pronoun} `,
        '. »',
      ],
      blanks: [
        { mode: 'text', accepted: [yes.s] },
        { mode: 'text', accepted: [`doesn’t ${no.base}`, `does not ${no.base}`] },
        { mode: 'text', accepted: ['Does'] },
        { mode: 'text', accepted: [no.base] },
        { mode: 'text', accepted: ['doesn’t', 'does not'] },
      ],
    },
    hint: `Lis seulement le message de ce prénom : ${p.text}. Ce message dit « I » ; toi, tu parles de ${p.text} à la 3e personne.`,
    steps: [
      `Message : « ${says(yes, true)} » → à la 3e personne : **${yes.s}**.`,
      `Message : « ${says(no, false)} » → **doesn’t ${no.base}**.`,
      WHY_NO_S,
      `Réponse : **${yes.s}** ; **doesn’t ${no.base}** ; **Does**, **${no.base}** ; **doesn’t**`,
    ],
  };
}

const forms: Skill = {
  id: 'a5-present-formes',
  title: 'Présent simple : affirmer, nier, questionner',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **présent simple** dit une habitude ou ce qui est vrai : She plays football every weekend.',
      'Non : don’t ou doesn’t (he, she, it) puis la **base verbale** : She doesn’t play.',
      'Question : Do ou Does, le sujet, puis la base : Does she play? Be fait exception : il se passe de do.',
    ],
    source: source('présent simple : forme affirmative, négative et interrogative'),
    sources: ['anglais-college-2025', 'bc-present-simple', 'bc-questions-negatives', 'bck-present-simple-continuous'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return formsSpot(rng);
    if (level === 2) return formsChoose(rng);
    if (level === 3) return formsGaps(rng);
    if (level === 4) return formsTransform(rng);
    return formsDocument(rng);
  },
};

// ——— 2. Choisir entre présent simple et be + ing ———
/** Phrase à trou : habitude (présent simple) ou action en cours (be + ing). */
function context(rng: Rng, p: Person, a: Activity) {
  const now = rng.int(0, 1) === 0;
  const when = rng.pick(HABITS);
  const n = rng.pick(NOWS);
  const sentence = (verb: string) =>
    now ? `${n.before}${p.text} ${verb} ${a.obj}${n.after}.` : `${p.text} ${verb} ${a.obj} ${when}.`;
  const right = now ? `${beFor(p)} ${a.ing}` : formFor(p, a);
  const clue = now
    ? `« ${(n.before || n.after).trim()} » : l’action se passe maintenant.`
    : `« ${when} » : c’est une habitude.`;
  return { now, sentence, right, clue, why: now ? WHY_NOW : WHY_HABIT };
}
/** Sans « We » : « Look! We are… » ferait parler de soi comme d’une scène observée. */
const SUBJECTS = PEOPLE.filter((p) => p.pronoun !== 'we');

function tenseSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(SUBJECTS);
  const a = rng.pick(ACTIVITIES);
  const c = context(rng, p, a);
  const other = isThird(p) ? a.base : a.s;
  const { answer, traps } = choice(rng, c.right, [
    { label: c.now ? formFor(p, a) : `${beFor(p)} ${a.ing}`, why: c.why },
    { label: other, why: c.now ? c.why : WHY_S },
  ]);
  return {
    prompt: `Complète (${a.base}) : « ${c.sentence('…')} »`,
    answer,
    traps,
    hint: 'Cherche le mot qui dit quand : est-ce que cela se répète, ou est-ce que cela se passe maintenant ?',
    steps: [c.clue, c.why, `Réponse : **${c.sentence(c.right)}**`],
  };
}

function tenseChoose(rng: Rng): QuestionDraft {
  const p = rng.pick(SUBJECTS);
  const a = rng.pick(ACTIVITIES);
  const c = context(rng, p, a);
  const { answer, traps } = choice(rng, c.right, [
    { label: c.now ? formFor(p, a) : `${beFor(p)} ${a.ing}`, why: c.why },
    { label: `${beFor(p)} ${a.base}`, why: c.now ? WHY_BE_BASE : WHY_BE },
    { label: a.ing, why: WHY_ING_ALONE },
  ]);
  return {
    prompt: `Quelle forme du verbe « ${a.base} » convient ? « ${c.sentence('…')} »`,
    answer,
    traps,
    hint: 'Commence par le moment (habitude ou maintenant), puis vérifie que la forme est complète.',
    steps: [c.clue, c.why, `Réponse : **${c.sentence(c.right)}**`],
  };
}

function tenseType(rng: Rng): QuestionDraft {
  const p = rng.pick(SUBJECTS);
  const a = rng.pick(ACTIVITIES);
  const c = context(rng, p, a);
  // Forme courte après le sujet : « Tom’s eating », « They’re eating ».
  const short = isThird(p) ? [`’s ${a.ing}`] : p.text === 'They' ? [`’re ${a.ing}`] : [];
  const accepted = c.now ? [c.right, ...short] : [c.right];
  const wrong = c.now ? formFor(p, a) : `${beFor(p)} ${a.ing}`;
  return {
    prompt: `Écris le verbe « ${a.base} » au bon temps : « ${c.sentence('…')} »`,
    answer: { kind: 'text', accepted },
    traps: [
      { text: wrong, why: c.why },
      { text: a.ing, why: c.now ? WHY_ING_ALONE : WHY_HABIT },
    ],
    hint: 'Repère le mot qui dit quand. Si la forme demande deux mots, écris les deux.',
    steps: [c.clue, c.why, `Réponse : **${c.sentence(c.right)}**`],
  };
}

interface State {
  readonly p: number;
  readonly base: string;
  readonly form: string;
  readonly ing: string;
  readonly rest: string;
}
/** Verbes d’état cités par la page « Present continuous » : like, want, know, understand. */
const STATES: readonly State[] = [
  { p: 0, base: 'like', form: 'likes', ing: 'is liking', rest: 'this song' },
  { p: 2, base: 'want', form: 'wants', ing: 'is wanting', rest: 'a sandwich' },
  { p: 3, base: 'know', form: 'knows', ing: 'is knowing', rest: 'the answer' },
  { p: 6, base: 'understand', form: 'understand', ing: 'are understanding', rest: 'the question' },
  { p: 7, base: 'want', form: 'want', ing: 'are wanting', rest: 'a new game' },
];
const STATE_TIMES = ['now', 'right now'] as const;

function tenseTricky(rng: Rng): QuestionDraft {
  if (rng.int(0, 2) === 0) {
    const s = rng.pick(STATES);
    const p = at(PEOPLE, s.p);
    const when = rng.pick(STATE_TIMES);
    return {
      prompt: `Attention au sens du verbe. Écris « ${s.base} » au bon temps : « ${p.text} … ${s.rest} ${when}. »`,
      answer: { kind: 'text', accepted: [s.form] },
      traps: [{ text: s.ing, why: WHY_STATE }],
      hint: 'Ce verbe décrit-il une action que l’on voit se faire, ou un état (goût, envie, savoir) ?',
      steps: [WHY_STATE, `Réponse : **${p.text} ${s.form} ${s.rest} ${when}.**`],
    };
  }
  const p = rng.pick(SUBJECTS);
  const a = rng.pick(ACTIVITIES);
  const now = rng.int(0, 1) === 0;
  // « right now » seulement : « He doesn’t play now » (de nos jours) serait aussi défendable.
  const when = now ? 'right now' : rng.pick(HABITS);
  const right = now ? `${beFor(p)}n’t ${a.ing}` : `${dontFor(p)} ${a.base}`;
  const long = now ? `${beFor(p)} not ${a.ing}` : `${doFor(p)} not ${a.base}`;
  const short = isThird(p) ? [`’s not ${a.ing}`] : p.text === 'They' ? [`’re not ${a.ing}`] : [];
  const accepted = [right, long, ...(now ? short : [])];
  return {
    prompt: `Écris à la forme négative (${a.base}) : « ${p.text} … ${a.obj} ${when}. »`,
    answer: { kind: 'text', accepted },
    traps: [
      { text: now ? `${dontFor(p)} ${a.base}` : `${beFor(p)}n’t ${a.ing}`, why: now ? WHY_NOW : WHY_HABIT },
      { text: `not ${now ? a.ing : formFor(p, a)}`, why: now ? WHY_ING_ALONE : WHY_DO },
    ],
    hint: 'Choisis d’abord le temps d’après le moment. Chaque temps a sa façon de dire non.',
    steps: [
      now ? WHY_NOW : WHY_HABIT,
      now ? 'Pour nier be + ing, on place not après am, is ou are.' : WHY_DO,
      `Réponse : **${p.text} ${right} ${a.obj} ${when}.**`,
    ],
  };
}

function tenseDocument(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const [usual, today] = some(rng, ACTIVITIES, 2) as [Activity, Activity];
  const lines = [
    `Every Saturday: ${p.text} — ${usual.base} ${usual.obj}.`,
    `Today is Saturday. Right now: ${p.text} — ${today.base} ${today.obj}.`,
  ];
  return {
    prompt: `Lis les notes sur ${p.text} (habitude : « ${usual.fr} » ; en ce moment : « ${today.fr} »). Complète le message.`,
    figure: { kind: 'document', title: 'Notes', lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [
        `On Saturdays, ${p.text} usually `,
        ` ${usual.obj}. But look! Today, ${p.pronoun} `,
        ` ${today.obj}. ${He(p)} `,
        ` ${usual.obj} right now.`,
      ],
      blanks: [
        { mode: 'text', accepted: [usual.s] },
        { mode: 'text', accepted: [`is ${today.ing}`, `’s ${today.ing}`] },
        { mode: 'text', accepted: [`isn’t ${usual.ing}`, `is not ${usual.ing}`] },
      ],
    },
    hint: '« usually » annonce une habitude ; « look! » et « right now » montrent ce qui se passe maintenant. La dernière phrase dit ce qui ne se passe pas.',
    steps: [
      `Habitude : ${WHY_HABIT} → **${usual.s}**.`,
      `En ce moment : ${WHY_NOW} → **is ${today.ing}**.`,
      `En ce moment, on ne fait pas l’activité habituelle → **isn’t ${usual.ing}**.`,
      `Réponse : **${usual.s}** ; **is ${today.ing}** ; **isn’t ${usual.ing}**`,
    ],
  };
}

const tense: Skill = {
  id: 'a5-present-ou-be-ing',
  title: 'Présent simple ou be + ing ?',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Habitude : **présent simple**. I play basketball every Sunday.',
      'Maintenant : **présent be + ing** (am, is, are puis verbe en -ing). I’m playing hockey now.',
      'Les **verbes d’état** (like, want, know, understand) restent en général au présent simple.',
    ],
    source: source('présent simple et présent be + ing'),
    sources: ['anglais-college-2025', 'bck-present-simple-continuous', 'bc-present-continuous', 'bc-present-simple'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return tenseSpot(rng);
    if (level === 2) return tenseChoose(rng);
    if (level === 3) return tenseType(rng);
    if (level === 4) return tenseTricky(rng);
    return tenseDocument(rng);
  },
};

// ——— 3. Adverbes de fréquence ———
/** Du plus fréquent au moins fréquent (British Council, « Adverbs of frequency »). */
export const ADVERBS = [
  { en: 'always', fr: 'toujours' },
  { en: 'usually', fr: 'd’habitude' },
  { en: 'often', fr: 'souvent' },
  { en: 'sometimes', fr: 'parfois' },
  { en: 'never', fr: 'jamais' },
] as const;
const FIXED = ['always', 'never'] as const;
const DIRECT = ACTIVITIES.filter((a) => ['play', 'cook', 'eat', 'wear', 'do', 'walk'].includes(a.base));
const ADJECTIVES = ['late', 'hungry', 'happy', 'busy', 'tired'] as const;
const WHY_BEFORE = 'Avec un verbe ordinaire, l’adverbe se place avant le verbe.';
const WHY_AFTER_BE = 'Avec be, l’adverbe se place après be.';
const WHY_NEVER = '« never » est déjà négatif : on ne l’emploie pas avec not.';

function adverbSpot(rng: Rng): QuestionDraft {
  const three = ADVERBS.filter((a) => ['always', 'sometimes', 'never'].includes(a.en));
  const w = rng.pick(three);
  const toEnglish = rng.int(0, 1) === 0;
  const { answer, traps } = choice(
    rng,
    toEnglish ? w.en : w.fr,
    three
      .filter((o) => o !== w)
      .map((o) => ({ label: toEnglish ? o.en : o.fr, why: `« ${o.en} » veut dire « ${o.fr} ».` })),
  );
  return {
    prompt: toEnglish
      ? `Quel adverbe de fréquence veut dire « ${w.fr} » ?`
      : `Que veut dire l’adverbe de fréquence « ${w.en} » ?`,
    answer,
    traps,
    hint: 'Place les trois mots sur une échelle : à chaque fois, de temps en temps, pas une seule fois.',
    steps: ['Un adverbe de fréquence dit combien de fois.', `Réponse : **${w.en}** = **${w.fr}**`],
  };
}

function adverbScale(rng: Rng): QuestionDraft {
  const kept = new Set(some(rng, ADVERBS, rng.int(3, 4)).map((a) => a.en));
  const sorted: string[] = ADVERBS.filter((a) => kept.has(a.en)).map((a) => a.en);
  const items = shuffledOther(rng, sorted);
  return {
    prompt: `Range du plus fréquent au moins fréquent : ${listed(items)}.`,
    answer: { kind: 'order', items, correct: sorted.map((w) => items.indexOf(w)) },
    hint: 'Commence par les deux bouts : celui qui veut dire « à chaque fois », celui qui veut dire « aucune fois ».',
    steps: [
      'Ordre du plus fréquent au moins fréquent : always, usually, often, sometimes, never.',
      `Réponse : **${sorted.join(' → ')}**`,
    ],
  };
}

function adverbOrder(rng: Rng): QuestionDraft {
  const p = rng.pick(SINGLE);
  const adverb = rng.pick(FIXED);
  const withBe = rng.int(0, 1) === 0;
  const a = rng.pick(DIRECT);
  const adjective = rng.pick(ADJECTIVES);
  const words = withBe ? [p.text, 'is', adverb, adjective] : [p.text, adverb, a.s, a.obj];
  const items = shuffledOther(rng, words);
  return {
    prompt: `Remets la phrase dans l’ordre : ${listed(items)}.`,
    answer: { kind: 'order', items, correct: words.map((w) => items.indexOf(w)) },
    hint: 'Regarde le verbe : est-ce be, ou un autre verbe ? La place de l’adverbe en dépend.',
    steps: [withBe ? WHY_AFTER_BE : WHY_BEFORE, `Réponse : **${words.join(' ')}.**`],
  };
}

function adverbInsert(rng: Rng): QuestionDraft {
  const p = rng.pick(PEOPLE);
  const adverb = rng.pick(FIXED);
  const withBe = rng.int(0, 1) === 0;
  const a = rng.pick(DIRECT);
  const adjective = rng.pick(ADJECTIVES);
  const verb = withBe ? beFor(p) : formFor(p, a);
  const end = withBe ? adjective : a.obj;
  const good = withBe ? `${p.text} ${verb} ${adverb} ${end}` : `${p.text} ${adverb} ${verb} ${end}`;
  const misplaced = withBe ? `${p.text} ${adverb} ${verb} ${end}` : `${p.text} ${verb} ${adverb} ${end}`;
  const negated = withBe ? `${p.text} ${verb}n’t never ${end}` : `${p.text} ${dontFor(p)} never ${a.base} ${end}`;
  return {
    prompt: `Réécris la phrase en ajoutant « ${adverb} » à sa place : « ${p.text} ${verb} ${end}. »`,
    answer: { kind: 'text', accepted: dotted([good]) },
    traps: dottedTraps([
      { text: misplaced, why: withBe ? WHY_AFTER_BE : WHY_BEFORE },
      ...(adverb === 'never' ? [{ text: negated, why: WHY_NEVER }] : []),
    ]),
    hint: 'Trouve le verbe, puis demande-toi si c’est be : l’adverbe se met d’un côté ou de l’autre.',
    steps: [withBe ? WHY_AFTER_BE : WHY_BEFORE, `Réponse : **${good}.**`],
  };
}

function adverbDiary(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const rows = rng.shuffle(
    some(rng, DIRECT, 3).map((a, i) => ({
      a,
      adverb: at(['always', 'sometimes', 'never'] as const, i),
      days: at([7, rng.int(2, 3), 0], i),
    })),
  );
  const options = ['always', 'sometimes', 'never'];
  return {
    prompt: `Lis le relevé de la semaine de ${p.text} (${rows.map((r) => r.a.fr).join(', ')}). Complète avec l’adverbe, puis le verbe.`,
    figure: {
      kind: 'document',
      title: `${p.text}’s week`,
      lines: rows.map((r) => `${r.a.base} ${r.a.obj}: ${r.days} days out of 7`),
      credit: WRITTEN,
    },
    answer: {
      kind: 'cloze',
      parts: [
        ...rows.flatMap((_, i) => [i === 0 ? `${p.text} ` : ` ${at(rows, i - 1).a.obj}. ${He(p)} `, ' ']),
        ` ${at(rows, 2).a.obj}.`,
      ],
      blanks: rows.flatMap((r) => [
        { mode: 'list' as const, options, correct: options.indexOf(r.adverb) },
        { mode: 'text' as const, accepted: [r.a.s] },
      ]),
    },
    hint: 'Compte les jours sur 7 : tous, quelques-uns ou aucun ? Puis accorde le verbe avec he ou she.',
    steps: [
      ...rows.map(
        (r) => `${r.a.base} ${r.a.obj} : ${r.days ? `${r.days} jours` : 'aucun jour'} sur 7 → **${r.adverb}**.`,
      ),
      'Avec he ou she, le verbe prend -s ou -es, même avec never.',
      `Réponse : **${rows.map((r) => `${r.adverb} ${r.a.s}`).join(' ; ')}**`,
    ],
  };
}

const adverbs: Skill = {
  id: 'a5-adverbes-frequence',
  title: 'Les adverbes de fréquence',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **adverbe de fréquence** dit combien de fois : always, usually, often, sometimes, never.',
      'Il se place avant le verbe (She always does her homework), mais après be (He is sometimes late).',
      'never est déjà négatif : He never forgets his homework (sans not).',
    ],
    source: source('adverbes de fréquence'),
    sources: ['anglais-college-2025', 'bck-adverbs-frequency', 'bct-adverbs-frequency'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return adverbSpot(rng);
    if (level === 2) return adverbScale(rng);
    if (level === 3) return adverbOrder(rng);
    if (level === 4) return adverbInsert(rng);
    return adverbDiary(rng);
  },
};

// ——— 4. Marqueurs de temps ———
type Moment = 'past' | 'habit' | 'now' | 'future';
interface Marker {
  readonly en: string;
  readonly fr: string;
  readonly moment: Moment;
  /** Autres écritures acceptées. */
  readonly alt?: readonly string[];
}
const MARKERS: readonly Marker[] = [
  { en: 'yesterday', fr: 'hier', moment: 'past' },
  { en: 'last week', fr: 'la semaine dernière', moment: 'past' },
  { en: 'last month', fr: 'le mois dernier', moment: 'past' },
  { en: 'two days ago', fr: 'il y a deux jours', moment: 'past', alt: ['2 days ago'] },
  { en: 'six months ago', fr: 'il y a six mois', moment: 'past', alt: ['6 months ago'] },
  { en: 'every day', fr: 'tous les jours', moment: 'habit', alt: ['each day'] },
  { en: 'now', fr: 'maintenant', moment: 'now', alt: ['right now'] },
  { en: 'this morning', fr: 'ce matin', moment: 'now' },
  { en: 'tomorrow', fr: 'demain', moment: 'future' },
  { en: 'in two years', fr: 'dans deux ans', moment: 'future', alt: ['in 2 years'] },
];
const marked = (moment: Moment) => MARKERS.filter((m) => m.moment === moment && m.en !== 'this morning');
const MOMENT_FR: Record<Moment, string> = {
  past: 'le passé',
  habit: 'une habitude',
  now: 'le moment présent',
  future: 'l’avenir',
};
const meaning = (m: Marker) => `« ${m.en} » veut dire « ${m.fr} ».`;

function markerSpot(rng: Rng): QuestionDraft {
  const three = (['past', 'now', 'future'] as const).map((moment) => rng.pick(marked(moment)));
  const right = rng.pick(three);
  const shown = rng.shuffle(three.map((m) => m.en));
  const { answer, traps } = choice(
    rng,
    right.en,
    three.filter((m) => m !== right).map((m) => ({ label: m.en, why: meaning(m) })),
  );
  return {
    prompt: `Parmi ${listed(shown)}, quel marqueur de temps annonce ${MOMENT_FR[right.moment]} ?`,
    answer,
    traps,
    hint: 'Traduis chaque marqueur dans ta tête, puis place-le : avant, maintenant ou après.',
    steps: [meaning(right), `Réponse : **${right.en}**`],
  };
}

const FRAMES = [
  { moment: 'past', frames: ['Tom visited London …', 'My parents watched a film …', 'Lisa played tennis …'] },
  { moment: 'habit', frames: ['My dad cooks dinner …', 'Maya walks the dog …', 'My parents read the news …'] },
  { moment: 'now', frames: ['Look! Emir is swimming …', 'Listen! My sister is singing …', 'We are having lunch …'] },
] as const;
/** Marqueurs impossibles avec chaque temps (jamais défendables). */
const IMPOSSIBLE: Record<(typeof FRAMES)[number]['moment'], readonly string[]> = {
  past: ['right now', 'tomorrow', 'in two years'],
  habit: ['yesterday', 'two days ago', 'last week'],
  now: ['yesterday', 'two days ago', 'last month'],
};
const TENSE_OF = {
  past: 'Le verbe est au passé : il faut un moment terminé.',
  habit: 'Le présent simple raconte ici une habitude : il faut un marqueur de répétition.',
  now: 'be + ing montre ici une action en cours : il faut un marqueur du moment présent.',
} as const;

function markerRecognise(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const rows = some(
      rng,
      MARKERS.filter((m) => m.en !== 'this morning'),
      3,
    );
    const left = rows.map((m) => m.en);
    const right = shuffledOther(
      rng,
      rows.map((m) => m.fr),
    );
    return {
      prompt: `Associe chaque marqueur de temps à son sens : ${listed(left)}.`,
      answer: { kind: 'match', left, right, pairs: rows.map((m) => right.indexOf(m.fr)) },
      hint: 'Repère les petits mots « last », « ago » et « in » : ils changent la direction dans le temps.',
      steps: [...rows.map(meaning), `Réponse : **${rows.map((m) => `${m.en} → ${m.fr}`).join(', ')}**`],
    };
  }
  const group = rng.pick(FRAMES);
  const frame = rng.pick(group.frames);
  const good =
    group.moment === 'past' ? rng.pick(marked('past')).en : group.moment === 'habit' ? 'every day' : 'right now';
  const { answer, traps } = choice(
    rng,
    good,
    IMPOSSIBLE[group.moment].map((label) => ({ label, why: TENSE_OF[group.moment] })),
  );
  return {
    prompt: `Complète « ${frame} » : quel marqueur choisir parmi ${listed([good, ...IMPOSSIBLE[group.moment]].sort())} ?`,
    answer,
    traps,
    hint: 'Regarde d’abord le verbe : à quel temps est-il ?',
    steps: [TENSE_OF[group.moment], `Réponse : **${frame.replace('…', `${good}.`)}**`],
  };
}

function markerType(rng: Rng): QuestionDraft {
  const m = rng.pick(MARKERS);
  const traps =
    m.moment === 'past' && m.en.endsWith('ago')
      ? [{ text: `ago ${m.en.replace(' ago', '')}`, why: '« ago » se place après la durée.' }]
      : m.en.startsWith('last')
        ? [{ text: `the ${m.en}`, why: '« last week », « last month » s’emploient ici sans the.' }]
        : [];
  return {
    prompt: `Écris en anglais le marqueur de temps « ${m.fr} ».`,
    answer: { kind: 'text', accepted: [m.en, ...(m.alt ?? [])] },
    traps,
    hint: 'Demande-toi si l’on regarde en arrière, maintenant, ou en avant ; puis retrouve le petit mot qui va avec.',
    steps: [meaning(m), `Réponse : **${m.en}**`],
  };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'] as const;
const DAYS_FR = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;

function markerCount(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const past = rng.int(0, 1) === 0;
  const gap = rng.int(2, 5);
  const today = past ? rng.int(gap, 6) : rng.int(0, 6 - gap);
  const event = past ? today - gap : today + gap;
  const word = at(NUMBERS, gap);
  const good = past ? `${word} days ago` : `in ${word} days`;
  const digits = past ? `${gap} days ago` : `in ${gap} days`;
  const verb = past ? 'visited the museum' : 'is visiting the museum';
  return {
    prompt: `Aujourd’hui, nous sommes ${at(DAYS_FR, today)}. « ${p.text} ${verb} on ${at(DAYS, event)} » (la même semaine). Complète avec « ${past ? 'ago' : 'in'} » : « ${p.text} ${verb} … . »`,
    answer: { kind: 'text', accepted: [good, digits, ...(past ? [] : [`${good}’ time`])] },
    traps: [
      {
        text: past ? `in ${word} days` : `${word} days ago`,
        why: past ? '« in … days » regarde vers l’avenir.' : '« … ago » regarde vers le passé.',
      },
      past
        ? { text: `ago ${word} days`, why: '« ago » se place après la durée.' }
        : { text: `${word} days in`, why: '« in » se place avant la durée.' },
    ],
    hint: 'Compte les jours entre aujourd’hui et l’évènement, puis place le petit mot du bon côté.',
    steps: [
      `Entre ${at(DAYS_FR, past ? event : today)} et ${at(DAYS_FR, past ? today : event)}, il y a ${gap} jours.`,
      past ? '« il y a » se dit avec la durée puis **ago**.' : '« dans » se dit **in** puis la durée.',
      `Réponse : **${good}**`,
    ],
  };
}

const PAST_EVENTS = [
  { base: 'visit', past: 'visited', obj: 'the museum' },
  { base: 'watch', past: 'watched', obj: 'a match' },
  { base: 'play', past: 'played', obj: 'tennis' },
] as const;

function markerDiary(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const event = rng.pick(PAST_EVENTS);
  const [habit, current] = some(rng, ACTIVITIES, 2) as [Activity, Activity];
  const gap = rng.int(2, 4);
  const today = rng.int(gap, 6);
  const habitOptions = rng.shuffle(['every day', 'yesterday', 'last week']);
  const nowOptions = rng.shuffle(['right now', 'two days ago', 'last month']);
  const lines = rng.shuffle([
    `${at(DAYS, today - gap)}: ${event.base} ${event.obj}`,
    `Every day: ${habit.base} ${habit.obj}`,
    `Now: ${current.base} ${current.obj}`,
  ]);
  return {
    prompt: `Nous sommes ${at(DAYS_FR, today)}. Lis les notes de ${p.text}, puis complète le message (verbe « ${event.base} », nombre de jours et marqueurs).`,
    figure: { kind: 'document', title: `${p.text}’s notes`, lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [
        `${p.text} `,
        ` ${event.obj} `,
        ` days ago. ${He(p)} ${habit.s} ${habit.obj} `,
        `. ${He(p)} is ${current.ing} ${current.obj} `,
        '.',
      ],
      blanks: [
        { mode: 'text', accepted: [event.past] },
        { mode: 'text', accepted: [at(NUMBERS, gap), String(gap)] },
        { mode: 'list', options: habitOptions, correct: habitOptions.indexOf('every day') },
        { mode: 'list', options: nowOptions, correct: nowOptions.indexOf('right now') },
      ],
    },
    hint: 'Pour chaque phrase, regarde le temps du verbe, puis retrouve la ligne des notes qui correspond.',
    steps: [
      `« … days ago » est du passé : **${event.past}**.`,
      `De ${at(DAYS_FR, today - gap)} à ${at(DAYS_FR, today)} : **${at(NUMBERS, gap)}** jours.`,
      'Habitude (présent simple) : **every day**. Action en cours (be + ing) : **right now**.',
      `Réponse : **${event.past}** ; **${at(NUMBERS, gap)}** ; **every day** ; **right now**`,
    ],
  };
}

const markers: Skill = {
  id: 'a5-marqueurs-temps',
  title: 'Les marqueurs de temps et le bon temps',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **marqueur de temps** dit quand : every day (habitude), now (maintenant), yesterday (passé).',
      '« ago » (il y a) suit la durée : two days ago. « in » (dans) la précède : in two years.',
      'Le marqueur aide à choisir le temps du verbe : présent simple, be + ing ou **prétérit**.',
    ],
    source: source('marqueurs temporels'),
    sources: [
      'anglais-college-2025',
      'bc-past-simple',
      'bct-past-regular',
      'bck-present-simple-continuous',
      'bc-present-simple',
    ],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return markerSpot(rng);
    if (level === 2) return markerRecognise(rng);
    if (level === 3) return markerType(rng);
    if (level === 4) return markerCount(rng);
    return markerDiary(rng);
  },
};

export const ENGLISH_PRESENT_5E_CHAPTER: Chapter = {
  id: 'a5-present',
  subject: 'anglais',
  grade: '5e',
  domain: 'langue',
  title: 'Présent simple et be + ing',
  skills: [forms, tense, adverbs, markers],
};
