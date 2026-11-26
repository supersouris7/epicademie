import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, shuffledOther, some } from './temps.ts';

/**
 * Anglais 5e — « Le futur » (lot an-5e-03, docs/adr/0034). Programme d'anglais du collège (arrêté du 5 mai 2025) ;
 * règles et formes : British Council (voir futur-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 5e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Règles : British Council, ${pages}.`;
export const ABOUT = 'Écrit pour l’exercice.';

export const coin = (rng: Rng) => rng.int(0, 1) === 0;
export const quoted = (list: readonly string[]) => list.map((l) => `« ${l} »`).join(' ');
/** Saisies acceptées : avec ou sans ponctuation finale. */
export const ended = (forms: readonly string[], marks: readonly string[] = ['.']) =>
  forms.flatMap((f) => [f, ...marks.flatMap((m) => [`${f}${m}`, `${f} ${m}`])]);
/** Une erreur typique reste reconnue avec ou sans ponctuation. */
export const endedTraps = (traps: readonly Trap[], marks: readonly string[] = ['.']): Trap[] =>
  traps.flatMap((t) => ('text' in t ? ended([t.text], marks).map((text) => ({ text, why: t.why })) : []));

/** Association : phrases à gauche, réponses mélangées à droite. */
export function pairs(rng: Rng, rows: readonly (readonly [string, string])[]) {
  const left = rows.map((r) => r[0]);
  const right = shuffledOther(
    rng,
    rows.map((r) => r[1]),
  );
  return { kind: 'match' as const, left, right, pairs: rows.map((r) => right.indexOf(r[1])) };
}
export const matchSteps = (intro: string, rows: readonly (readonly [string, string])[]) => [
  intro,
  ...rows.map(([l, r]) => `« ${l} » → ${r}.`),
  `Réponse : **${rows.map(([l, r]) => `${l} = ${r}`).join(' ; ')}**`,
];

/** Trou à liste : la bonne réponse d'abord dans `options`, puis mélange. */
export function listBlank(rng: Rng, right: string, wrong: readonly string[]) {
  const options = rng.shuffle([right, ...wrong]);
  return { mode: 'list' as const, options, correct: options.indexOf(right) };
}

type Be = 'am' | 'is' | 'are';
export interface Who {
  /** En début de phrase. */
  readonly text: string;
  /** Au milieu d'une phrase (question). */
  readonly mid: string;
  readonly be: Be;
}
const who = (text: string, be: Be, mid = text): Who => ({ text, mid, be });
export const PEOPLE: readonly Who[] = [
  who('Tom', 'is'),
  who('Lisa', 'is'),
  who('Emir', 'is'),
  who('Ana', 'is'),
  who('He', 'is', 'he'),
  who('She', 'is', 'she'),
  who('We', 'are', 'we'),
  who('They', 'are', 'they'),
];
const SUBJECTS: readonly Who[] = [who('I', 'am'), ...PEOPLE];
const SHORT: Readonly<Record<Be, string>> = { am: '’m', is: '’s', are: '’re' };
const otherBe = (b: Be): Be => (b === 'is' ? 'are' : 'is');

export interface Verb {
  readonly base: string;
  readonly ing: string;
  /** 3e personne du singulier. */
  readonly s: string;
  readonly fr: string;
}
const verb = (base: string, ing: string, s: string, fr: string): Verb => ({ base, ing, s, fr });
const VERBS: readonly Verb[] = [
  verb('play tennis', 'playing tennis', 'plays tennis', 'jouer au tennis'),
  verb('visit a museum', 'visiting a museum', 'visits a museum', 'visiter un musée'),
  verb('cook dinner', 'cooking dinner', 'cooks dinner', 'préparer le dîner'),
  verb('watch a film', 'watching a film', 'watches a film', 'regarder un film'),
  verb('learn Italian', 'learning Italian', 'learns Italian', 'apprendre l’italien'),
  verb('join a club', 'joining a club', 'joins a club', 'entrer dans un club'),
  verb('paint the door', 'painting the door', 'paints the door', 'peindre la porte'),
];
/** Verbes dont la forme en -ing change d'orthographe. */
const SPELLED: readonly Verb[] = [
  verb('swim in the lake', 'swimming in the lake', 'swims in the lake', 'nager dans le lac'),
  verb('run in the park', 'running in the park', 'runs in the park', 'courir dans le parc'),
  verb('make a cake', 'making a cake', 'makes a cake', 'faire un gâteau'),
  verb('have a party', 'having a party', 'has a party', 'faire une fête'),
  verb('come to the club', 'coming to the club', 'comes to the club', 'venir au club'),
  verb('ride a bike', 'riding a bike', 'rides a bike', 'faire du vélo'),
];
const WHEN = ['tomorrow', 'next week', 'next Saturday', 'this weekend'] as const;

const pickVerb = (rng: Rng) => rng.pick(VERBS);

// ——— 1. will ———
const WHY_WILL_S = 'will ne prend jamais de -s, même avec he ou she.';
const WHY_WILL_BASE = 'Après will ou won’t, le verbe reste à la base verbale : sans to et sans -s.';
const WHY_PRESENT = 'La forme demandée est will : le présent simple n’emploie pas will.';
const WHY_PAST = 'Cette phrase est au passé : elle ne parle pas de l’avenir.';
const WHY_HABIT = 'Cette phrase décrit une habitude, pas un moment à venir.';
const WILL_RULE = 'Pour une prévision, will se place devant la base verbale, à toutes les personnes.';

interface Forecast {
  readonly future: string;
  readonly past: string;
  readonly habit: string;
}
const forecast = (future: string, past: string, habit: string): Forecast => ({ future, past, habit });
const FORECASTS: readonly Forecast[] = [
  forecast('I will be a vet.', 'I was a vet.', 'I work with a vet every Monday.'),
  forecast('She will live in York.', 'She lived in York.', 'She lives in York.'),
  forecast('They will have a big house.', 'They had a big house.', 'They clean the house every Saturday.'),
  forecast('He will travel to India.', 'He travelled to India.', 'He travels by bus every day.'),
  forecast('It will be sunny tomorrow.', 'It was sunny yesterday.', 'It is often sunny here.'),
  forecast('We will win the match.', 'We won the match.', 'We play a match every Sunday.'),
];

function willSpot(rng: Rng): QuestionDraft {
  const f = rng.pick(FORECASTS);
  const { answer, traps } = choice(rng, f.future, [
    { label: f.past, why: WHY_PAST },
    { label: f.habit, why: WHY_HABIT },
  ]);
  return {
    prompt: 'Quelle phrase fait une prévision pour l’avenir ?',
    answer,
    traps,
    hint: 'Cherche le petit mot placé devant le verbe qui projette vers l’avenir.',
    steps: [WILL_RULE, `Réponse : **${f.future}**`],
  };
}

function willForm(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const v = pickVerb(rng);
  const w = rng.pick(WHEN);
  const say = (middle: string) => `${s.text} ${middle} ${w}.`;
  const good = say(`will ${v.base}`);
  const { answer, traps } = choice(rng, good, [
    { label: say(`wills ${v.base}`), why: WHY_WILL_S },
    { label: say(`will to ${v.base}`), why: WHY_WILL_BASE },
    { label: say(`will ${v.ing}`), why: WHY_WILL_BASE },
  ]);
  return {
    prompt: `Quelle phrase est correcte avec will pour dire ce qui arrivera (${v.fr}) ?`,
    answer,
    traps,
    hint: 'Regarde deux endroits : la fin de will, puis la forme du verbe qui suit.',
    steps: [WILL_RULE, WHY_WILL_BASE, `Réponse : **${good}**`],
  };
}

function willWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const v = pickVerb(rng);
  const w = rng.pick(WHEN);
  const accepted = [`will ${v.base}`, `’ll ${v.base}`];
  return {
    prompt: `Écris la fin de la prévision avec will et le verbe « to ${v.base} » (${v.fr}) : « ${s.text} … ${w}. »`,
    answer: { kind: 'text', accepted },
    traps: [
      { text: `wills ${v.base}`, why: WHY_WILL_S },
      { text: `will to ${v.base}`, why: WHY_WILL_BASE },
      { text: `will ${v.s}`, why: WHY_WILL_BASE },
      { text: v.s, why: WHY_PRESENT },
    ],
    hint: 'Deux éléments dans le trou au minimum : l’auxiliaire de la prévision, puis le verbe sans rien lui ajouter.',
    steps: [WILL_RULE, WHY_WILL_BASE, `Réponse : **${s.text} will ${v.base} ${w}.**`],
  };
}

function willNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const v = pickVerb(rng);
  const w = rng.pick(WHEN);
  const accepted = ['won’t', 'will not', '’ll not'].map(
    (m) => `${s.text}${m.startsWith('’') ? '' : ' '}${m} ${v.base} ${w}`,
  );
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} will ${v.base} ${w}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${s.text} willn’t ${v.base} ${w}`, why: 'La contraction de will not est irrégulière : won’t.' },
      { text: `${s.text} doesn’t will ${v.base} ${w}`, why: 'will porte lui-même la négation : ni do ni does.' },
      { text: `${s.text} don’t will ${v.base} ${w}`, why: 'will porte lui-même la négation : ni do ni does.' },
      { text: `${s.text} not will ${v.base} ${w}`, why: 'not se place après will, jamais devant.' },
      { text: `${s.text} won’t to ${v.base} ${w}`, why: WHY_WILL_BASE },
    ]),
    hint: 'Aucun auxiliaire à ajouter. La forme courte a une orthographe particulière.',
    steps: [
      'will porte lui-même la négation : will not, que l’on contracte en won’t.',
      WHY_WILL_BASE,
      `Réponse : **${s.text} won’t ${v.base} ${w}.**`,
    ],
  };
}

function willQuestion(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const v = pickVerb(rng);
  const w = rng.pick(WHEN);
  const good = `Will ${s.mid} ${v.base} ${w}`;
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} will ${v.base} ${w}. »`,
    answer: { kind: 'text', accepted: ended([good], ['?']) },
    traps: endedTraps(
      [
        { text: `Does ${s.mid} will ${v.base} ${w}`, why: 'will pose la question lui-même : ni do ni does.' },
        { text: `Do ${s.mid} will ${v.base} ${w}`, why: 'will pose la question lui-même : ni do ni does.' },
        { text: `Will ${s.mid} to ${v.base} ${w}`, why: WHY_WILL_BASE },
        { text: `${s.text} will ${v.base} ${w}`, why: 'Dans la question, will passe devant le sujet.' },
      ],
      ['?'],
    ),
    hint: 'Aucun mot à ajouter : change seulement l’ordre de deux éléments.',
    steps: ['Dans la question, will passe devant le sujet.', `Réponse : **${good}?**`],
  };
}

const willHard = (rng: Rng) => (coin(rng) ? willNegative(rng) : willQuestion(rng));

const GIRLS = ['Ana', 'Lisa', 'Yuna'] as const;
const BOYS = ['Tom', 'Emir', 'Paul'] as const;
export interface Kid {
  readonly name: string;
  readonly pronoun: 'he' | 'she';
}
export const pickKid = (rng: Rng): Kid =>
  coin(rng) ? { name: rng.pick(GIRLS), pronoun: 'she' } : { name: rng.pick(BOYS), pronoun: 'he' };
export const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

function willDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [a, b, c] = some(rng, VERBS, 3) as [Verb, Verb, Verb];
  const values = [coin(rng), coin(rng), coin(rng)] as const;
  const word = (yes: boolean) => (yes ? 'yes' : 'no');
  const modal = (yes: boolean) => (yes ? 'will' : 'won’t');
  const forms = (yes: boolean) => (yes ? ['will', '’ll'] : ['won’t', 'will not']);
  const last = values[2];
  return {
    prompt: `Lis les prévisions sur la vie future ${/^[AEIOU]/.test(k.name) ? 'd’' : 'de '}${k.name} (yes = cela arrivera, no = cela n’arrivera pas), puis complète avec will, won’t, Yes ou No. Au dernier trou, écris l’activité de la dernière ligne à la base verbale.`,
    figure: {
      kind: 'document',
      title: `${k.name} in ten years`,
      lines: [
        `${a.base}: ${word(values[0])}`,
        `${b.base}: ${word(values[1])}`,
        `${c.base}: ${word(values[2])}`,
        `Verb for the last sentence: to ${a.base}`,
      ],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `${k.name} `,
        ` ${a.base}. ${cap(k.pronoun)} `,
        ` ${b.base}. « `,
        ` ${k.pronoun} ${c.base}? » « `,
        `, ${k.pronoun} `,
        `. » Question about the last line: does ${k.pronoun} want to `,
        `?`,
      ],
      blanks: [
        { mode: 'text', accepted: forms(values[0]) },
        { mode: 'text', accepted: forms(values[1]) },
        { mode: 'text', accepted: ['Will'] },
        { mode: 'text', accepted: [last ? 'Yes' : 'No'] },
        { mode: 'text', accepted: last ? ['will'] : ['won’t', 'will not'] },
        { mode: 'text', accepted: [a.base] },
      ],
    },
    hint: 'Retrouve chaque activité sur sa ligne. La question commence par l’auxiliaire ; le verbe ne reçoit rien.',
    steps: [
      '« yes » : will ; « no » : won’t. Ces formes ne changent pas avec he ou she.',
      'Dans la question, will passe devant le sujet ; la réponse courte reprend Yes ou No, la personne, puis will ou won’t.',
      `Après to, comme après will, la base verbale : **${a.base}**.`,
      `Réponse : **${modal(values[0])}, ${modal(values[1])}, Will, ${last ? 'Yes' : 'No'}, ${modal(last)}, ${a.base}**`,
    ],
  };
}

const will: Skill = {
  id: 'a5-will',
  title: 'Will : prévoir l’avenir',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Will** (contracté en ’ll) fait une **prévision** : I will be a vet. / She’ll live in York.',
      'Après will vient la **base verbale**, sans to ni -s. La **négation** est will not, contractée en **won’t**.',
      'Question : will passe devant le sujet. Will you travel? Yes, I will.',
    ],
    source: source('expression du futur avec will', '« Will, future predictions »'),
    sources: ['anglais-college-2025', 'bck-will-predictions'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return willSpot(rng);
    if (level === 2) return willForm(rng);
    if (level === 3) return willWrite(rng);
    if (level === 4) return willHard(rng);
    return willDocument(rng);
  },
};

// ——— 2. be going to / 3. be + ing de projet ———
/** Les deux constructions partagent am, is, are : seul ce qui suit change. */
interface Frame {
  readonly name: string;
  /** Groupe verbal après am/is/are. */
  readonly tail: (v: Verb) => string;
  readonly rule: string;
}
const GOING: Frame = {
  name: 'be going to',
  tail: (v) => `going to ${v.base}`,
  rule: 'be going to se construit avec am, is ou are, puis going to, puis la base verbale.',
};
const ING: Frame = {
  name: 'le présent be + ing',
  tail: (v) => v.ing,
  rule: 'Le présent be + ing se construit avec am, is ou are, puis le verbe en -ing.',
};
const WHY_NO_BE = 'Il manque am, is ou are devant la suite du groupe verbal.';
const WHY_BE = 'am, is ou are s’accorde avec le sujet : I am ; he, she, une personne : is ; we, they : are.';
const WHY_AFTER_GOING = 'Après going to vient la base verbale, sans -s et sans -ing.';
const WHY_AFTER_BE = 'Après am, is ou are, ce projet veut le verbe en -ing.';

/** Phrases fausses : sans be, mauvais accord, mauvaise forme du verbe. */
function wrongForms(frame: Frame, s: Who, v: Verb) {
  return [
    { middle: frame.tail(v), why: WHY_NO_BE },
    { middle: `${otherBe(s.be)} ${frame.tail(v)}`, why: WHY_BE },
    frame === GOING
      ? { middle: `${s.be} going to ${v.s}`, why: WHY_AFTER_GOING }
      : { middle: `${s.be} ${v.base}`, why: WHY_AFTER_BE },
  ];
}

function frameForm(rng: Rng, frame: Frame): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const v = pickVerb(rng);
  const w = rng.pick(WHEN);
  const say = (middle: string) => `${s.text} ${middle} ${w}.`;
  const good = say(`${s.be} ${frame.tail(v)}`);
  const { answer, traps } = choice(
    rng,
    good,
    wrongForms(frame, s, v).map((x) => ({ label: say(x.middle), why: x.why })),
  );
  return {
    prompt: `Quelle phrase est correcte avec ${frame.name} (${v.fr}) ?`,
    answer,
    traps,
    hint: 'Vérifie trois choses : la présence de be, son accord avec le sujet, puis la forme du verbe.',
    steps: [frame.rule, WHY_BE, `Réponse : **${good}**`],
  };
}

function frameWrite(rng: Rng, frame: Frame, verbs: readonly Verb[]): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const v = rng.pick(verbs);
  const w = rng.pick(WHEN);
  const accepted = [`${s.be} ${frame.tail(v)}`, `${SHORT[s.be]} ${frame.tail(v)}`];
  return {
    prompt: `Complète avec ${frame.name} et le verbe « to ${v.base} » (${v.fr}) : « ${s.text} … ${w}. »`,
    answer: { kind: 'text', accepted },
    traps: wrongForms(frame, s, v).map((x) => ({ text: x.middle, why: x.why })),
    hint: 'Commence par la forme de be qui va avec le sujet, puis construis la suite.',
    steps: [frame.rule, WHY_BE, `Réponse : **${s.text} ${s.be} ${frame.tail(v)} ${w}.**`],
  };
}

/** Écritures de la négation : isn’t / is not / ’s not. */
const negated = (s: Who): readonly string[] =>
  s.be === 'am'
    ? [`${s.text} am not`, `${s.text}’m not`]
    : [`${s.text} ${s.be} not`, `${s.text} ${s.be}n’t`, `${s.text}${SHORT[s.be]} not`];

function frameNegative(rng: Rng, frame: Frame, verbs: readonly Verb[]): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const v = rng.pick(verbs);
  const w = rng.pick(WHEN);
  const tail = `${frame.tail(v)} ${w}`;
  const accepted = negated(s).map((n) => `${n} ${tail}`);
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} ${s.be} ${tail}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${s.text} not ${s.be} ${tail}`, why: 'not se place après am, is ou are.' },
      { text: `${s.text} don’t ${tail}`, why: 'be porte lui-même la négation : ni don’t ni doesn’t.' },
      { text: `${s.text} doesn’t ${tail}`, why: 'be porte lui-même la négation : ni don’t ni doesn’t.' },
      { text: `${s.text} not ${tail}`, why: WHY_NO_BE },
    ]),
    hint: 'Un seul mot à ajouter. Où se place-t-il par rapport à be ?',
    steps: ['La négation not se place juste après am, is ou are.', `Réponse : **${at(accepted, 0)}.**`],
  };
}

function frameQuestion(rng: Rng, frame: Frame, verbs: readonly Verb[]): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const v = rng.pick(verbs);
  const w = rng.pick(WHEN);
  const tail = `${frame.tail(v)} ${w}`;
  const good = `${cap(s.be)} ${s.mid} ${tail}`;
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} ${s.be} ${tail}. »`,
    answer: { kind: 'text', accepted: ended([good], ['?']) },
    traps: endedTraps(
      [
        { text: `Does ${s.mid} ${tail}`, why: 'be pose la question lui-même : ni do ni does.' },
        { text: `Do ${s.mid} ${tail}`, why: 'be pose la question lui-même : ni do ni does.' },
        { text: `${s.text} ${s.be} ${tail}`, why: 'Dans la question, am, is ou are passe devant le sujet.' },
        { text: `${cap(otherBe(s.be))} ${s.mid} ${tail}`, why: WHY_BE },
      ],
      ['?'],
    ),
    hint: 'Aucun mot à ajouter : change seulement l’ordre de deux éléments.',
    steps: ['Dans la question, am, is ou are passe devant le sujet.', `Réponse : **${good}?**`],
  };
}

const frameHard = (rng: Rng, frame: Frame, verbs: readonly Verb[]) =>
  coin(rng) ? frameNegative(rng, frame, verbs) : frameQuestion(rng, frame, verbs);

const INTENTIONS: readonly { readonly plan: string; readonly past: string; readonly habit: string }[] = [
  { plan: 'I’m going to learn the drums.', past: 'I learned the drums.', habit: 'I play the drums every day.' },
  { plan: 'She’s going to visit Leeds.', past: 'She visited Leeds.', habit: 'She often visits Leeds.' },
  { plan: 'We’re going to paint the room.', past: 'We painted the room.', habit: 'We paint on Fridays.' },
  { plan: 'He’s going to join a choir.', past: 'He joined a choir.', habit: 'He sings in a choir every week.' },
  { plan: 'They’re going to buy a boat.', past: 'They bought a boat.', habit: 'They usually travel by boat.' },
];

function goingSpot(rng: Rng): QuestionDraft {
  const x = rng.pick(INTENTIONS);
  const { answer, traps } = choice(rng, x.plan, [
    { label: x.past, why: WHY_PAST },
    { label: x.habit, why: WHY_HABIT },
  ]);
  return {
    prompt: 'Quelle phrase annonce un projet ?',
    answer,
    traps,
    hint: 'Un projet n’est pas encore réalisé et ne se répète pas chaque semaine.',
    steps: ['going to, précédé de am, is ou are, annonce ce qu’on a l’intention de faire.', `Réponse : **${x.plan}**`],
  };
}

interface Entry {
  readonly kid: string;
  readonly v: Verb;
  readonly day: string;
}
const DAYS = ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'] as const;

/** Document : trois projets ; la forme de be change d'un sujet à l'autre. */
function frameDocument(rng: Rng, frame: Frame, verbs: readonly Verb[]): QuestionDraft {
  const names = some(rng, [...GIRLS, ...BOYS], 2);
  const [a, b, c] = some(rng, verbs, 3) as [Verb, Verb, Verb];
  const days = some(rng, DAYS, 3);
  const entries: readonly Entry[] = [
    { kid: at(names, 0), v: a, day: at(days, 0) },
    { kid: `${at(names, 0)} and ${at(names, 1)}`, v: b, day: at(days, 1) },
    { kid: 'I', v: c, day: at(days, 2) },
  ];
  const order = rng.shuffle(entries);
  const beOf = (e: Entry): Be => (e.kid === 'I' ? 'am' : e.kid.includes(' and ') ? 'are' : 'is');
  const answers = order.map((e) => `${beOf(e)} ${frame.tail(e.v)}`);
  const parts = ['', ...order.map((e) => ` on ${e.day}. `)].map((p, i) => {
    const next = order[i];
    return next ? `${p}${next.kid} ` : p.trimEnd();
  });
  return {
    prompt: `Lis le carnet des projets, puis écris chaque projet avec ${frame.name}. La ligne « Me » parle de toi : utilise I.`,
    figure: {
      kind: 'document',
      title: 'Our plans',
      lines: rng.shuffle(entries).map((e) => `${e.day} — ${e.kid === 'I' ? 'Me' : e.kid}: ${e.v.base}`),
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts,
      blanks: order.map((e) => ({
        mode: 'text' as const,
        accepted: [`${beOf(e)} ${frame.tail(e.v)}`, `${SHORT[beOf(e)]} ${frame.tail(e.v)}`],
      })),
    },
    hint: 'Pour chaque trou : combien de personnes ? Choisis la forme de be, puis construis le verbe.',
    steps: [frame.rule, WHY_BE, `Réponse : **${answers.join(', ')}**`],
  };
}

const beGoingTo: Skill = {
  id: 'a5-be-going-to',
  title: 'Be going to : annoncer un projet',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Be going to** annonce un projet : I’m going to learn the drums.',
      'Construis am, is ou are + going to + **base verbale** : She is going to swim.',
      '**Négation** : She isn’t going to swim. Question : Is she going to swim?',
    ],
    source: source('expression du futur avec be going to + BV', '« Going to, plans »'),
    sources: ['anglais-college-2025', 'bck-going-to-plans'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return goingSpot(rng);
    if (level === 2) return frameForm(rng, GOING);
    if (level === 3) return frameWrite(rng, GOING, VERBS);
    if (level === 4) return frameHard(rng, GOING, VERBS);
    return frameDocument(rng, GOING, VERBS);
  },
};

const MEETINGS: readonly { readonly later: string; readonly now: string; readonly past: string }[] = [
  { later: 'I’m meeting Sam tomorrow.', now: 'I’m talking to Sam right now.', past: 'I met Sam yesterday.' },
  { later: 'She’s seeing the dentist on Friday.', now: 'She’s talking now.', past: 'She saw the dentist last week.' },
  { later: 'We’re having a party next Saturday.', now: 'We’re having lunch now.', past: 'We had a party last night.' },
  {
    later: 'He’s playing a match on Sunday.',
    now: 'Look, he’s playing now.',
    past: 'He played a match on TV yesterday.',
  },
  {
    later: 'They’re flying to Rome next week.',
    now: 'They’re sleeping at the moment.',
    past: 'They flew to Rome in May.',
  },
];

function ingSpot(rng: Rng): QuestionDraft {
  const x = rng.pick(MEETINGS);
  const { answer, traps } = choice(rng, x.later, [
    { label: x.now, why: 'Ici be + ing décrit une action en cours, au moment où l’on parle.' },
    { label: x.past, why: WHY_PAST },
  ]);
  return {
    prompt: 'Quelle phrase annonce quelque chose de prévu pour plus tard ?',
    answer,
    traps,
    hint: 'Regarde le moment indiqué dans chaque phrase.',
    steps: [
      'Avec un moment à venir (tomorrow, next week, on Friday), be + ing annonce un projet organisé.',
      `Réponse : **${x.later}**`,
    ],
  };
}

const ALL_ING: readonly Verb[] = [...VERBS, ...SPELLED];

const beIngProject: Skill = {
  id: 'a5-be-ing-projet',
  title: 'Be + ing : un projet organisé',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le présent **be + ing** annonce un **projet** déjà organisé : I’m visiting my friend tomorrow.',
      'Construis am, is ou are + verbe en -ing. Attention : swim → swimming, make → making.',
      'Un mot de temps (tomorrow, on Friday) montre qu’on parle de l’avenir.',
    ],
    source: source('présent be + ing utilisé pour un futur proche', '« Present continuous, future arrangements »'),
    sources: ['anglais-college-2025', 'bck-continuous-future'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return ingSpot(rng);
    if (level === 2) return frameForm(rng, ING);
    if (level === 3) return frameWrite(rng, ING, VERBS);
    if (level === 4) return frameHard(rng, ING, SPELLED);
    return frameDocument(rng, ING, ALL_ING);
  },
};

// ——— 4. choisir la forme ———
type Kind = 'now' | 'plan' | 'arranged' | 'seen' | 'belief';
/** Verbe d’une situation : base verbale, prétérit, forme en -ing. */
type Parts = readonly [base: string, past: string, ing: string];
interface Case {
  /** Situation, en français. */
  readonly fr: string;
  /** Phrase à trou : avant, après. */
  readonly before: string;
  readonly after: string;
  readonly be: Be;
  readonly verb: Parts;
}
const kase = (fr: string, before: string, be: Be, v: Parts, after: string): Case => ({
  fr,
  before,
  be,
  verb: v,
  after,
});
const CASES: Readonly<Record<Kind, readonly Case[]>> = {
  now: [
    kase(
      'Le téléphone sonne, tu décides à l’instant de répondre.',
      'OK, I',
      'am',
      ['answer', 'answered', 'answering'],
      'it.',
    ),
    kase(
      'Ton ami a froid, tu proposes à l’instant de fermer la fenêtre.',
      'Wait, I',
      'am',
      ['close', 'closed', 'closing'],
      'the window.',
    ),
    kase(
      'On sonne à la porte : tu te décides sur le moment.',
      'Don’t move, I',
      'am',
      ['open', 'opened', 'opening'],
      'the door.',
    ),
    kase(
      'Tu découvres qu’il n’y a plus de pain et tu te décides aussitôt.',
      'Oh! I',
      'am',
      ['buy', 'bought', 'buying'],
      'some bread.',
    ),
  ],
  plan: [
    kase(
      'Tu as décidé le mois dernier d’apprendre la guitare.',
      'I',
      'am',
      ['learn', 'learned', 'learning'],
      'the guitar.',
    ),
    kase(
      'Lisa a décidé depuis longtemps de repeindre sa chambre.',
      'Lisa',
      'is',
      ['paint', 'painted', 'painting'],
      'her room.',
    ),
    kase(
      'Les voisins ont décidé il y a des semaines d’adopter un chien.',
      'They',
      'are',
      ['adopt', 'adopted', 'adopting'],
      'a dog.',
    ),
    kase(
      'Tom a choisi depuis la rentrée de s’inscrire au club photo.',
      'Tom',
      'is',
      ['join', 'joined', 'joining'],
      'the photo club.',
    ),
  ],
  arranged: [
    kase(
      'C’est convenu avec Jane : samedi à 8 heures, devant le cinéma.',
      'I',
      'am',
      ['meet', 'met', 'meeting'],
      'Jane on Saturday at 8.',
    ),
    kase(
      'Rendez-vous confirmé chez le dentiste : lundi à 10 heures.',
      'Emir',
      'is',
      ['see', 'saw', 'seeing'],
      'the dentist on Monday at 10.',
    ),
    kase(
      'Le cours est réservé avec le professeur : mardi à 5 heures, au gymnase.',
      'We',
      'are',
      ['meet', 'met', 'meeting'],
      'our coach on Tuesday at 5.',
    ),
    kase(
      'La table est réservée avec des amis : ce soir à 7 heures, au restaurant.',
      'We',
      'are',
      ['have', 'had', 'having'],
      'dinner there at 7.',
    ),
  ],
  seen: [
    kase('Tu vois de gros nuages noirs.', 'Look at those clouds! It', 'is', ['rain', 'rained', 'raining'], 'soon.'),
    kase(
      'Tu vois un enfant en équilibre au bord d’une chaise.',
      'Careful! He',
      'is',
      ['fall', 'fell', 'falling'],
      'off the chair.',
    ),
    kase(
      'Tu vois une pile d’assiettes qui penche.',
      'Look! The plates',
      'are',
      ['fall', 'fell', 'falling'],
      'on the floor.',
    ),
    kase(
      'Tu vois un ballon qui file droit vers la vitre.',
      'Watch out! The ball',
      'is',
      ['break', 'broke', 'breaking'],
      'the window.',
    ),
  ],
  belief: [
    kase(
      'Tu donnes ton avis sur la finale de la semaine prochaine.',
      'I think our team',
      'is',
      ['win', 'won', 'winning'],
      'the final next week.',
    ),
    kase(
      'Tu donnes ton avis sur la vie dans cinquante ans.',
      'I think people',
      'are',
      ['live', 'lived', 'living'],
      'longer in the future.',
    ),
    kase(
      'Tu es sûr que ton ami aimera le film de ce soir.',
      'I’m sure you',
      'are',
      ['enjoy', 'enjoyed', 'enjoying'],
      'the film tonight.',
    ),
    kase(
      'Tu imagines le temps de demain, sans rien avoir observé.',
      'I think it',
      'is',
      ['be', 'was', 'being'],
      'a nice day tomorrow.',
    ),
  ],
};
const REASONS: Readonly<Record<Kind, { readonly label: string; readonly why: string }>> = {
  now: { label: 'décision prise à l’instant', why: 'La décision est prise au moment où l’on parle : will.' },
  plan: { label: 'projet décidé avant de parler', why: 'La décision est prise avant de parler : be going to.' },
  arranged: {
    label: 'rendez-vous fixé avec quelqu’un',
    why: 'C’est confirmé avec une autre personne, à une heure connue : on emploie surtout be + ing.',
  },
  seen: { label: 'prévision d’après ce qu’on voit', why: 'On voit un indice maintenant : be going to.' },
  belief: { label: 'avis sur l’avenir', why: 'On dit ce que l’on pense de l’avenir : will.' },
};
const KINDS = Object.keys(REASONS) as Kind[];

/** Phrase caractéristique de chaque catégorie (association). */
const SIGNALS: Readonly<Record<Kind, readonly string[]>> = {
  now: ['The phone is ringing. OK, I’ll answer it.', 'You look cold. Wait, I’ll close the window.'],
  plan: ['I decided last month: I’m going to learn the drums.', 'We chose long ago: we’re going to paint the room.'],
  arranged: [
    'It’s confirmed: I’m meeting Jane at 8 on Saturday.',
    'It’s booked: we’re seeing the coach at 5 on Friday.',
  ],
  seen: ['Look at those black clouds! It’s going to rain.', 'He’s on the edge of the chair! He’s going to fall.'],
  belief: ['I think Brazil will win the World Cup.', 'I’m sure you will enjoy the film.'],
};

type Form = 'will' | 'going' | 'ing';
/** La forme que la règle du cours prévoit pour la situation. */
const EXPECTED: Readonly<Record<Kind, Form>> = {
  now: 'will',
  belief: 'will',
  plan: 'going',
  seen: 'going',
  arranged: 'ing',
};
/** Écritures d’une forme : entière puis contractée. */
function writings(form: Form, c: Case): [string, string] {
  const [base, , ing] = c.verb;
  if (form === 'will') return [`will ${base}`, `’ll ${base}`];
  const tail = form === 'going' ? `going to ${base}` : ing;
  return [`${c.be} ${tail}`, `${SHORT[c.be]} ${tail}`];
}
/** Après I et It, la phrase affichée emploie la forme contractée. */
function shown(form: Form, c: Case): string {
  const [full, short] = writings(form, c);
  return /\b(I|It|He)$/.test(c.before) ? short : full;
}
const sentenceOf = (c: Case, form: string) => `${c.before}${form.startsWith('’') ? '' : ' '}${form} ${c.after}`;

/** Formes écartées : la forme voisine que la règle exclut (ou une forme mal construite) et le passé. */
function wrongOptions(kind: Kind, c: Case) {
  const near =
    kind === 'belief'
      ? { form: `wills ${c.verb[0]}`, why: 'will ne prend jamais de -s.' }
      : { form: shown(kind === 'now' ? 'going' : 'will', c), why: REASONS[kind].why };
  return [near, { form: c.verb[1], why: WHY_PAST }];
}

function chooseQcm(rng: Rng): QuestionDraft {
  const kind = rng.pick(['now', 'seen', 'plan'] as const);
  const c = rng.pick(CASES[kind]);
  const good = sentenceOf(c, shown(EXPECTED[kind], c));
  const { answer, traps } = choice(
    rng,
    good,
    wrongOptions(kind, c).map((w) => ({ label: sentenceOf(c, w.form), why: w.why })),
  );
  return {
    prompt: `${c.fr} D’après la règle du cours, quelle phrase convient ?`,
    answer,
    traps,
    hint: 'La chose est-elle passée ? Sinon, quand a-t-on décidé, ou que voit-on ?',
    steps: [REASONS[kind].why, `Réponse : **${good}**`],
  };
}

function matchReasons(rng: Rng, n: number): QuestionDraft {
  const kinds = some(rng, KINDS, n);
  const rows = kinds.map((k) => [rng.pick(SIGNALS[k]), REASONS[k].label] as const);
  return {
    prompt: `Associe chaque phrase à la raison de la forme employée : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Cherche les indices : moment de la décision, rendez-vous, chose visible, avis.',
    steps: matchSteps(
      'will : décision à l’instant ou avis ; be going to : projet déjà décidé ou indice visible ; be + ing : rendez-vous.',
      rows,
    ),
  };
}

/**
 * Saisie. Pour un projet ou un rendez-vous, be going to et be + ing se défendent tous deux ; pour un avis
 * (« I think… »), will et be going to aussi : les deux sont acceptés.
 */
const ACCEPTED: Readonly<Record<Kind, readonly Form[]>> = {
  now: ['will'],
  seen: ['going'],
  plan: ['going', 'ing'],
  arranged: ['ing', 'going'],
  belief: ['will', 'going'],
};

function chooseWrite(rng: Rng, kinds: readonly Kind[]): QuestionDraft {
  const kind = rng.pick(kinds);
  const c = rng.pick(CASES[kind]);
  const [base, past] = c.verb;
  const refused: readonly Form[] = kind === 'now' ? ['going'] : kind === 'belief' ? [] : ['will'];
  const traps: Trap[] = [
    ...refused.flatMap((f) => writings(f, c).map((text) => ({ text, why: REASONS[kind].why }))),
    { text: past, why: WHY_PAST },
    { text: `will to ${base}`, why: WHY_WILL_BASE },
    { text: `going to ${base}`, why: WHY_NO_BE },
  ];
  return {
    prompt: `${c.fr} D’après la règle du cours, complète avec la forme du futur qui convient, verbe « to ${base} » : « ${c.before} … ${c.after} »`,
    answer: { kind: 'text', accepted: ACCEPTED[kind].flatMap((f) => writings(f, c)) },
    traps,
    hint: 'Demande-toi quand la décision a été prise, ou sur quoi repose la prévision.',
    steps: [REASONS[kind].why, `Réponse : **${sentenceOf(c, shown(EXPECTED[kind], c))}**`],
  };
}

/** Document : quatre phrases à compléter en écrivant le verbe à la forme du futur prévue. */
function chooseDocument(rng: Rng): QuestionDraft {
  const items = some(rng, KINDS, 4).map((kind) => ({ kind, c: rng.pick(CASES[kind]) }));
  const answers = items.map(({ kind, c }) => shown(EXPECTED[kind], c));
  const parts = [
    ...items.map(({ c }, i) => `${i === 0 ? '' : ` ${at(items, i - 1).c.after} `}${i + 1}. ${c.before} `),
    ` ${at(items, items.length - 1).c.after}`,
  ];
  return {
    prompt:
      'Lis les quatre situations. D’après la règle du cours, complète chaque phrase en écrivant le verbe indiqué à la forme du futur qui convient.',
    figure: {
      kind: 'document',
      title: 'Four situations',
      lines: items.map(({ c }, i) => `${i + 1}. ${c.fr} (verbe : to ${c.verb[0]})`),
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts,
      blanks: items.map(({ kind, c }, i) => ({
        mode: 'text' as const,
        accepted: [...new Set([at(answers, i), ...ACCEPTED[kind].flatMap((f) => writings(f, c))])],
      })),
    },
    hint: 'Pour chaque ligne : décision à l’instant, projet ancien, rendez-vous, indice visible ou simple avis ?',
    steps: [...items.map(({ kind }, i) => `${i + 1}. ${REASONS[kind].why}`), `Réponse : **${answers.join(', ')}**`],
  };
}

const chooseForm: Skill = {
  id: 'a5-choisir-futur',
  title: 'Choisir la bonne forme du futur',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Will** : **décision** prise à l’instant (I’ll answer it) ou avis sur l’avenir (I think they will win).',
      '**Be going to** : projet décidé avant, ou **prévision** d’après ce qu’on voit (It’s going to rain).',
      '**Be + ing** : surtout pour un **rendez-vous** fixé avec quelqu’un (I’m meeting Jane at 8).',
    ],
    source: source(
      'expression du futur avec will, be going to et le présent be + ing',
      '« Future forms: will, be going to and present continuous », « Talking about the future »',
    ),
    sources: ['anglais-college-2025', 'bc-future-forms', 'bc-talking-future'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return chooseQcm(rng);
    if (level === 2) return matchReasons(rng, 5);
    if (level === 3) return chooseWrite(rng, ['now', 'seen']);
    if (level === 4) return chooseWrite(rng, ['plan', 'arranged', 'belief']);
    return chooseDocument(rng);
  },
};

export const ENGLISH_FUTURE_CHAPTER: Chapter = {
  id: 'a5-futur',
  subject: 'anglais',
  grade: '5e',
  domain: 'langue',
  title: 'Le futur',
  skills: [will, beGoingTo, beIngProject, chooseForm],
};
