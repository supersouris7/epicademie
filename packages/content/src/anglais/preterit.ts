import type { Chapter, Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, shuffledOther, some } from './temps.ts';
import { IRREGULAR_VERBS, regularised, verbsFor, type IrregularVerb } from './verbs.ts';
import { PAST_PARTICIPLE_SKILL } from './grammaire.ts';
import {
  NAMED,
  PEOPLE,
  SINGLE,
  WRITTEN,
  asked,
  askedTraps,
  dotted,
  dottedTraps,
  listed,
  mids,
  type Person,
} from './outils-5e.ts';

/**
 * Anglais 5e — « Le prétérit » (lot an-5e-01, docs/adr/0034). Programme d’anglais du collège (arrêté du 5 mai 2025) ;
 * règles et formes : British Council (voir preterit-faits.ts) ; verbes irréguliers : verbs.ts.
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 5e';
const source = (detail: string) => `${PROGRAMME} — ${detail}. Formes et règles : British Council, LearnEnglish.`;
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// ——— 1. Verbes réguliers ———
type Spelling = 'ed' | 'd' | 'double' | 'ied' | 'vowel-y';
interface RegularVerb {
  readonly base: string;
  readonly past: string;
  readonly spelling: Spelling;
  readonly fr: string;
  readonly obj: string;
}
const reg = (spelling: Spelling, base: string, past: string, fr: string, obj: string): RegularVerb => ({
  spelling,
  base,
  past,
  fr,
  obj,
});

export const REGULAR_VERBS: readonly RegularVerb[] = [
  reg('ed', 'start', 'started', 'commencer', 'a new book'),
  reg('ed', 'jump', 'jumped', 'sauter', 'into the pool'),
  reg('ed', 'call', 'called', 'appeler', 'a friend'),
  reg('ed', 'work', 'worked', 'travailler', 'in the garden'),
  reg('ed', 'want', 'wanted', 'vouloir', 'a sandwich'),
  reg('ed', 'watch', 'watched', 'regarder', 'a documentary'),
  reg('ed', 'walk', 'walked', 'marcher', 'to the park'),
  reg('d', 'like', 'liked', 'aimer', 'the film'),
  reg('d', 'agree', 'agreed', 'être d’accord', 'with me'),
  reg('d', 'arrive', 'arrived', 'arriver', 'at school'),
  reg('d', 'escape', 'escaped', 's’échapper', 'from the maze'),
  reg('double', 'stop', 'stopped', 's’arrêter', 'at the shop'),
  reg('double', 'plan', 'planned', 'organiser', 'a party'),
  reg('ied', 'try', 'tried', 'essayer', 'a new sport'),
  reg('ied', 'carry', 'carried', 'porter', 'a heavy bag'),
  reg('ied', 'study', 'studied', 'étudier', 'the map'),
  reg('vowel-y', 'play', 'played', 'jouer', 'tennis'),
  reg('vowel-y', 'enjoy', 'enjoyed', 'apprécier', 'the show'),
  reg('vowel-y', 'stay', 'stayed', 'rester', 'at home'),
];
const SIMPLE = REGULAR_VERBS.filter((v) => v.spelling === 'ed' || v.spelling === 'd');
const TRICKY = REGULAR_VERBS.filter((v) => !SIMPLE.includes(v));

const SPELLING: Record<Spelling, string> = {
  ed: 'On ajoute -ed à la base verbale.',
  d: 'Le verbe finit par -e : on ajoute seulement -d.',
  double: 'Voyelle puis consonne à la fin : ici, la consonne est doublée avant -ed.',
  ied: 'Consonne puis -y à la fin : le y disparaît, on ajoute -ied.',
  'vowel-y': 'Voyelle puis -y à la fin : on garde le y et on ajoute -ed.',
};
/** Orthographe fausse typique de chaque groupe. */
export const misspelt = (v: RegularVerb): string => {
  if (v.spelling === 'ed') return `${v.base}d`;
  if (v.spelling === 'd') return `${v.base}ed`;
  if (v.spelling === 'double') return `${v.base}ed`;
  if (v.spelling === 'ied') return `${v.base}ed`;
  return `${v.base.slice(0, -1)}ied`;
};
const third = (base: string) =>
  /[^aeiou]y$/.test(base) ? `${base.slice(0, -1)}ies` : /(ch|sh)$/.test(base) ? `${base}es` : `${base}s`;
const WHY_PRESENT = 'C’est une forme du présent ; au passé, le verbe régulier se termine par -ed.';

function regularSpot(rng: Rng): QuestionDraft {
  const v = rng.pick(SIMPLE);
  const { answer, traps } = choice(rng, v.past, [
    { label: third(v.base), why: WHY_PRESENT },
    { label: v.base, why: 'C’est la base verbale : rien n’indique le passé.' },
  ]);
  return {
    prompt: `Quelle forme du verbe « ${v.base} » (${v.fr}) est au prétérit ?`,
    answer,
    traps,
    hint: 'Regarde la fin de chaque forme : laquelle porte la marque du passé ?',
    steps: [SPELLING[v.spelling], `Réponse : **${v.past}**`],
  };
}

function regularSpell(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const rows = [rng.pick(SIMPLE), ...some(rng, TRICKY, 2)];
    const left = rows.map((v) => v.base);
    const right = shuffledOther(
      rng,
      rows.map((v) => v.past),
    );
    return {
      prompt: `Associe chaque verbe à son prétérit : ${listed(left)}.`,
      answer: { kind: 'match', left, right, pairs: rows.map((v) => right.indexOf(v.past)) },
      hint: 'Repère le début de chaque verbe, puis observe ce qui change à la fin.',
      steps: [
        ...rows.map((v) => `${v.base} : ${SPELLING[v.spelling]}`),
        `Réponse : **${rows.map((v) => `${v.base} → ${v.past}`).join(', ')}**`,
      ],
    };
  }
  const v = rng.pick(TRICKY);
  const { answer, traps } = choice(rng, v.past, [
    { label: misspelt(v), why: SPELLING[v.spelling] },
    { label: third(v.base), why: WHY_PRESENT },
    { label: v.base, why: 'C’est la base verbale : rien n’indique le passé.' },
  ]);
  return {
    prompt: `Quelle est la bonne orthographe du prétérit de « ${v.base} » (${v.fr}) ?`,
    answer,
    traps,
    hint: 'Observe les deux dernières lettres de la base verbale.',
    steps: [SPELLING[v.spelling], `Réponse : **${v.past}**`],
  };
}

function regularType(rng: Rng, pool: readonly RegularVerb[]): QuestionDraft {
  const p = rng.pick(PEOPLE);
  const v = rng.pick(pool);
  const when = rng.pick(['Yesterday', 'Last week', 'Two days ago'] as const);
  return {
    prompt: `Écris le verbe « ${v.base} » au prétérit : « ${when}, ${p.mid} … ${v.obj}. »`,
    answer: { kind: 'text', accepted: [v.past] },
    traps: [
      { text: v.base, why: `« ${when} » annonce le passé : le verbe doit changer.` },
      { text: misspelt(v), why: SPELLING[v.spelling] },
      { text: third(v.base), why: WHY_PRESENT },
    ],
    hint: 'La terminaison est la même pour toutes les personnes. Vérifie la fin de la base verbale.',
    steps: [
      'Au prétérit, la forme est la même avec I, you, he, she, we et they.',
      SPELLING[v.spelling],
      `Réponse : **${when}, ${p.mid} ${v.past} ${v.obj}.**`,
    ],
  };
}

function regularDocument(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const first = rng.pick(SIMPLE.filter((v) => v.base !== 'agree'));
  const second = rng.pick(TRICKY);
  const lines = [
    `Every Saturday, ${p.text} ${third(first.base)} ${first.obj}.`,
    `Then ${p.pronoun} ${third(second.base)} ${second.obj}.`,
  ];
  return {
    prompt: `Lis l’habitude de ${p.text} (« ${first.fr} », puis « ${second.fr} »), puis raconte samedi dernier au prétérit.`,
    figure: { kind: 'document', title: 'Saturdays', lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [`Last Saturday, ${p.text} `, ` ${first.obj}. Then ${p.pronoun} `, ` ${second.obj}.`],
      blanks: [
        { mode: 'text', accepted: [first.past] },
        { mode: 'text', accepted: [second.past] },
      ],
    },
    hint: 'Retrouve d’abord la base verbale (enlève la marque de he ou she), puis forme le passé.',
    steps: [
      `${third(first.base)} → base « ${first.base} ». ${SPELLING[first.spelling]}`,
      `${third(second.base)} → base « ${second.base} ». ${SPELLING[second.spelling]}`,
      `Réponse : **${first.past}** ; **${second.past}**`,
    ],
  };
}

const regular: Skill = {
  id: 'a5-preterit-regulier',
  title: 'Le prétérit des verbes réguliers',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Le **prétérit** raconte un fait terminé. Un **verbe régulier** prend -ed : call → called.',
      'Fin en -e : ajoute -d (like → liked). Consonne + y : try → tried. Mais play → played.',
      'Voyelle + consonne : la consonne est souvent doublée (stop → stopped).',
    ],
    source: source('prétérit des verbes réguliers'),
    sources: ['anglais-college-2025', 'bc-past-simple', 'bct-past-regular'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return regularSpot(rng);
    if (level === 2) return regularSpell(rng);
    if (level === 3) return regularType(rng, SIMPLE);
    if (level === 4) return regularType(rng, TRICKY);
    return regularDocument(rng);
  },
};

// ——— 2. Verbes irréguliers ———
const both = (past: readonly string[]) => past.join(' / ');
const irregular = (base: string): IrregularVerb => {
  const v = IRREGULAR_VERBS.find((x) => x.base === base);
  if (!v) throw new Error(`verbe irrégulier inconnu : ${base}`);
  return v;
};
const pastOf = (base: string) => at(irregular(base).past, 0);
const WHY_IRREGULAR = (v: IrregularVerb) => `« ${v.base} » est irrégulier : pas de -ed au prétérit.`;
const WHY_PARTICIPLE = (p: string) => `« ${p} » est une autre forme du verbe (participe passé), pas le prétérit.`;
const principal = (v: IrregularVerb) => [
  `« to ${v.base} » veut dire « ${v.french} ».`,
  `C’est un verbe irrégulier : prétérit **${both(v.past)}**, à apprendre.`,
];
const irregularTraps = (v: IrregularVerb) => [
  ...(v.past.includes(regularised(v.base)) ? [] : [{ text: regularised(v.base), why: WHY_IRREGULAR(v) }]),
  ...(v.past.includes(v.participle) || v.participle === v.base
    ? []
    : [{ text: v.participle, why: WHY_PARTICIPLE(v.participle) }]),
];
const NOT_BE = IRREGULAR_VERBS.filter((v) => v.base !== 'be');
/** Verbes dont le prétérit diffère de la base (cost, cut, let, put, set sont invariables). */
const CHANGING = NOT_BE.filter((v) => !v.past.includes(v.base));

function irregularSpot(rng: Rng): QuestionDraft {
  const v = rng.pick(CHANGING.filter((x) => x.tier === 1));
  const right = pastOf(v.base);
  const { answer, traps } = choice(rng, right, [
    { label: regularised(v.base), why: WHY_IRREGULAR(v) },
    { label: v.base, why: 'C’est la base verbale : rien n’indique le passé.' },
  ]);
  return {
    prompt: `Quel est le prétérit de « to ${v.base} » (${v.french}) ? Choisis.`,
    answer,
    traps,
    hint: 'Ce verbe est irrégulier : la terminaison habituelle du passé ne convient pas.',
    steps: [...principal(v), `Réponse : **${right}**`],
  };
}

function irregularPairs(rng: Rng): QuestionDraft {
  const rows: IrregularVerb[] = some(
    rng,
    CHANGING.filter((v) => v.tier <= 2),
    4,
  );
  const left = rows.map((v) => v.base);
  const right = shuffledOther(
    rng,
    rows.map((v) => pastOf(v.base)),
  );
  return {
    prompt: `Associe chaque verbe irrégulier à son prétérit : ${listed(left)}.`,
    answer: { kind: 'match', left, right, pairs: rows.map((v) => right.indexOf(pastOf(v.base))) },
    hint: 'Commence par les formes que tu connais : les premières lettres aident souvent.',
    steps: [
      'Les verbes irréguliers ont leur propre forme au passé.',
      `Réponse : **${rows.map((v) => `${v.base} → ${pastOf(v.base)}`).join(', ')}**`,
    ],
  };
}

function irregularType(rng: Rng): QuestionDraft {
  const v = rng.pick(verbsFor(2).filter((x) => x.base !== 'be'));
  return {
    prompt: `Écris le prétérit de « to ${v.base} » (${v.french}).`,
    answer: { kind: 'text', accepted: v.past },
    traps: irregularTraps(v),
    hint: 'Récite la liste dans ta tête : base, puis passé. Aucune règle ne remplace la liste.',
    steps: [...principal(v), `Réponse : **${both(v.past)}**`],
  };
}

const BE_SUBJECTS = [
  { text: 'I', past: 'was' },
  { text: 'Tom', past: 'was' },
  { text: 'my sister', past: 'was' },
  { text: 'we', past: 'were' },
  { text: 'my parents', past: 'were' },
  { text: 'they', past: 'were' },
] as const;
const BE_ENDS = ['at home', 'very happy', 'in London', 'late'] as const;

function irregularRare(rng: Rng): QuestionDraft {
  if (rng.int(0, 3) === 0) {
    const s = rng.pick(BE_SUBJECTS);
    const end = rng.pick(BE_ENDS);
    const other = s.past === 'was' ? 'were' : 'was';
    const why = 'Be au passé : was avec I, he, she, it ; were avec you, we, they.';
    return {
      prompt: `Écris « be » au prétérit : « Yesterday, ${s.text} … ${end}. »`,
      answer: { kind: 'text', accepted: [s.past] },
      traps: [
        { text: other, why },
        { text: 'been', why: WHY_PARTICIPLE('been') },
        { text: 'beed', why: '« be » est irrégulier : pas de -ed.' },
      ],
      hint: 'Be a deux formes au passé : regarde le sujet.',
      steps: [why, `Réponse : **Yesterday, ${s.text} ${s.past} ${end}.**`],
    };
  }
  // « lie » est écarté : « lied » existe (mentir), le piège serait ambigu.
  const v = rng.pick(NOT_BE.filter((x) => x.tier === 3 && x.base !== 'lie' && x.base !== 'pay'));
  return {
    prompt: `Verbe moins fréquent : quel est le prétérit de « to ${v.base} » (${v.french}) ?`,
    answer: { kind: 'text', accepted: v.past },
    traps: irregularTraps(v),
    hint: 'Certains verbes changent de voyelle, d’autres de fin, d’autres ne changent pas.',
    steps: [...principal(v), `Réponse : **${both(v.past)}**`],
  };
}

const STORY: readonly { readonly base: string; readonly s: string; readonly rest: string }[] = [
  { base: 'go', s: 'goes', rest: 'to the museum' },
  { base: 'see', s: 'sees', rest: 'a fox' },
  { base: 'eat', s: 'eats', rest: 'a pizza' },
  { base: 'buy', s: 'buys', rest: 'a map' },
  { base: 'take', s: 'takes', rest: 'photos' },
  { base: 'meet', s: 'meets', rest: 'a friend' },
  { base: 'write', s: 'writes', rest: 'a postcard' },
  { base: 'make', s: 'makes', rest: 'a cake' },
  { base: 'find', s: 'finds', rest: 'an old coin' },
  { base: 'have', s: 'has', rest: 'a picnic' },
  { base: 'get', s: 'gets', rest: 'a present' },
];

function irregularDocument(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const rows = some(rng, STORY, 3);
  return {
    prompt: `Lis le programme de ${p.text} (${rows.map((r) => irregular(r.base).french).join(' ; ')}), puis raconte dimanche dernier au prétérit.`,
    figure: {
      kind: 'document',
      title: 'Sunday plan',
      lines: rows.map((r) => `On Sundays, ${p.text} ${r.s} ${r.rest}.`),
      credit: WRITTEN,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `Last Sunday, ${p.text} `,
        ` ${at(rows, 0).rest}. ${cap(p.pronoun)} `,
        ` ${at(rows, 1).rest}. ${cap(p.pronoun)} also `,
        ` ${at(rows, 2).rest}.`,
      ],
      blanks: rows.map((r) => ({ mode: 'text' as const, accepted: irregular(r.base).past })),
    },
    hint: 'Retrouve la base de chaque verbe (sans la marque de he ou she), puis sa forme irrégulière.',
    steps: [
      ...rows.map((r) => `${r.s} → ${r.base} → **${pastOf(r.base)}**`),
      `Réponse : **${rows.map((r) => pastOf(r.base)).join(' ; ')}**`,
    ],
  };
}

const irregularSkill: Skill = {
  id: 'a5-preterit',
  title: 'Le prétérit des verbes irréguliers',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Un verbe **irrégulier** a sa propre forme au **prétérit** : go → went, see → saw. Il faut l’apprendre.',
      'La forme est la même pour toutes les personnes, sauf be : I was, they were.',
    ],
    source: source('prétérit des verbes irréguliers'),
    sources: ['anglais-college-2025', 'british-council-irregular-verbs', 'bct-past-irregular'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return irregularSpot(rng);
    if (level === 2) return irregularPairs(rng);
    if (level === 3) return irregularType(rng);
    if (level === 4) return irregularRare(rng);
    return irregularDocument(rng);
  },
};

// ——— 3. Négation et questions avec did ———
interface Action {
  readonly base: string;
  readonly past: string;
  readonly ing: string;
  readonly obj: string;
  readonly fr: string;
}
const action = (forms: readonly [string, string, string], obj: string, fr: string): Action => ({
  base: forms[0],
  past: forms[1],
  ing: forms[2],
  obj,
  fr,
});
const ACTIONS: readonly Action[] = [
  action(['play', 'played', 'playing'], 'football', 'jouer au foot'),
  action(['watch', 'watched', 'watching'], 'a film', 'regarder un film'),
  action(['visit', 'visited', 'visiting'], 'the museum', 'visiter le musée'),
  action(['walk', 'walked', 'walking'], 'to the park', 'aller au parc à pied'),
  action(['go', pastOf('go'), 'going'], 'to school', 'aller à l’école'),
  action(['eat', pastOf('eat'), 'eating'], 'a pizza', 'manger une pizza'),
  action(['see', pastOf('see'), 'seeing'], 'a fox', 'voir un renard'),
  action(['buy', pastOf('buy'), 'buying'], 'a map', 'acheter une carte'),
  action(['write', pastOf('write'), 'writing'], 'a postcard', 'écrire une carte postale'),
  action(['take', pastOf('take'), 'taking'], 'photos', 'prendre des photos'),
];
const TIMES = ['yesterday', 'last week', 'two days ago'] as const;
/** Sujets des questions et négations : « we » est écarté des questions (on s’adresse alors à « you »). */
const ASKABLE = PEOPLE.filter((p) => p.pronoun !== 'we');
const WHY_DID = 'Au prétérit, la question et la négation se font avec did (didn’t) pour toutes les personnes.';
const WHY_BASE = 'Après did ou didn’t, le verbe reste à la base : did porte déjà le passé.';

const said = (p: Person, a: Action, when: string) => `${p.text} ${a.past} ${a.obj} ${when}.`;
const denied = (p: Person, a: Action, when: string) => `${p.text} didn’t ${a.base} ${a.obj} ${when}.`;
const wondered = (p: Person, a: Action, when: string) => `Did ${p.mid} ${a.base} ${a.obj} ${when}?`;

function didSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(ASKABLE);
  const a = rng.pick(ACTIONS);
  const when = rng.pick(TIMES);
  const all = [
    { kind: 'affirmative', text: said(p, a, when), why: 'Cette phrase affirme : ni did, ni question.' },
    { kind: 'négative', text: denied(p, a, when), why: 'Cette phrase dit non, avec didn’t.' },
    { kind: 'interrogative (une question)', text: wondered(p, a, when), why: 'Cette phrase pose une question.' },
  ];
  const right = rng.pick(all);
  const { answer, traps } = choice(
    rng,
    right.text,
    all.filter((x) => x !== right).map((x) => ({ label: x.text, why: x.why })),
  );
  return {
    prompt: `Au prétérit, « ${a.fr} » (${p.text}, ${when}) : quelle phrase est ${right.kind} ?`,
    answer,
    traps,
    hint: 'Cherche le petit mot du passé et le point d’interrogation.',
    steps: [
      'Affirmative : verbe au passé. Négative : didn’t. Question : Did devant le sujet.',
      `Réponse : **${right.text}**`,
    ],
  };
}

function didChoose(rng: Rng): QuestionDraft {
  const p = rng.pick(ASKABLE);
  const a = rng.pick(ACTIONS);
  const when = rng.pick(TIMES);
  const isQuestion = rng.int(0, 1) === 0;
  const tail = `${a.obj} ${when}`;
  const good = isQuestion ? wondered(p, a, when) : denied(p, a, when);
  const doesnt = p.pronoun === 'they' ? 'don’t' : 'doesn’t';
  const does = p.pronoun === 'they' ? 'Do' : 'Does';
  const { answer, traps } = choice(
    rng,
    good,
    isQuestion
      ? [
          { label: `Did ${p.mid} ${a.past} ${tail}?`, why: WHY_BASE },
          { label: `${does} ${p.mid} ${a.base} ${tail}?`, why: `« ${when} » annonce le passé. ${WHY_DID}` },
          { label: `${cap(a.past)} ${p.mid} ${tail}?`, why: WHY_DID },
        ]
      : [
          { label: `${p.text} didn’t ${a.past} ${tail}.`, why: WHY_BASE },
          { label: `${p.text} ${doesnt} ${a.base} ${tail}.`, why: `« ${when} » annonce le passé. ${WHY_DID}` },
          { label: `${p.text} not ${a.past} ${tail}.`, why: WHY_DID },
        ],
  );
  return {
    prompt: `« ${said(p, a, when)} » Quelle ${isQuestion ? 'question' : 'phrase négative'} est correcte ?`,
    answer,
    traps,
    hint: 'Un seul des deux verbes porte la marque du passé : lequel ?',
    steps: [WHY_DID, WHY_BASE, `Réponse : **${good}**`],
  };
}

function didGaps(rng: Rng): QuestionDraft {
  const p = rng.pick(ASKABLE);
  const a = rng.pick(ACTIONS);
  const when = rng.pick(TIMES);
  const tail = `${a.obj} ${when}`;
  return {
    prompt: `Complète la phrase négative, puis la question : « ${said(p, a, when)} »`,
    answer: {
      kind: 'cloze',
      parts: [`Négation : ${p.text} `, ' ', ` ${tail}. Question : `, ` ${p.mid} `, ` ${tail}?`],
      blanks: [
        { mode: 'text', accepted: ['didn’t', 'did not'] },
        { mode: 'text', accepted: [a.base] },
        { mode: 'text', accepted: ['Did'] },
        { mode: 'text', accepted: [a.base] },
      ],
    },
    hint: 'Le passé passe dans le petit mot ajouté : que redevient alors le verbe ?',
    steps: [WHY_DID, WHY_BASE, `Réponse : **${denied(p, a, when)}** puis **${wondered(p, a, when)}**`],
  };
}

function didTransform(rng: Rng): QuestionDraft {
  const p = rng.pick(ASKABLE);
  const a = rng.pick(ACTIONS);
  const when = rng.pick(TIMES);
  const mode = rng.int(0, 2);
  if (mode === 0) {
    const build = (aux: string, form: string) => `${p.text} ${aux} ${form} ${a.obj} ${when}`;
    return {
      prompt: `Mets à la forme négative : « ${said(p, a, when)} »`,
      answer: { kind: 'text', accepted: dotted([build('didn’t', a.base), build('did not', a.base)]) },
      traps: dottedTraps([
        { text: build('didn’t', a.past), why: WHY_BASE },
        { text: build('not', a.past), why: WHY_DID },
      ]),
      hint: 'Ajoute le petit mot du passé à la forme négative, puis reviens à la base du verbe.',
      steps: [WHY_DID, WHY_BASE, `Réponse : **${denied(p, a, when)}**`],
    };
  }
  if (mode === 1) {
    const school = ACTIONS.filter((x) => x.obj.startsWith('to '));
    const go = rng.pick(school);
    const build = (to: Person, aux: string, form: string) => `Where ${aux} ${to.mid} ${form}`;
    const forms = mids(p).flatMap((to) => [build(to, 'did', go.base), `${build(to, 'did', go.base)} ${when}`]);
    return {
      prompt: `Pose la question avec « Where » pour demander le lieu : « ${said(p, go, when)} »`,
      answer: { kind: 'text', accepted: asked(forms) },
      traps: askedTraps(
        mids(p).flatMap((to) => [
          { text: build(to, 'did', go.past), why: WHY_BASE },
          { text: `Where ${to.mid} ${go.past}`, why: 'Après le mot interrogatif, il faut did avant le sujet.' },
        ]),
      ),
      hint: 'Ordre : le mot interrogatif, le petit mot du passé, le sujet, puis le verbe.',
      steps: ['Le mot interrogatif se place devant did.', WHY_BASE, `Réponse : **Where did ${p.mid} ${go.base}?**`],
    };
  }
  const build = (to: Person, aux: string, form: string) => `${aux} ${to.mid} ${form} ${a.obj} ${when}`;
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${said(p, a, when)} »`,
    answer: { kind: 'text', accepted: asked(mids(p).map((to) => build(to, 'Did', a.base))) },
    traps: askedTraps(
      mids(p).flatMap((to) => [
        { text: build(to, 'Did', a.past), why: WHY_BASE },
        { text: `${cap(a.past)} ${to.mid} ${a.obj} ${when}`, why: WHY_DID },
      ]),
    ),
    hint: 'Commence par le petit mot du passé, puis le sujet.',
    steps: [WHY_DID, WHY_BASE, `Réponse : **${wondered(p, a, when)}**`],
  };
}

function didPostcard(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const [yes, no] = some(rng, ACTIONS, 2) as [Action, Action];
  const lines = rng.shuffle([`I ${yes.past} ${yes.obj}.`, `I didn’t ${no.base} ${no.obj}.`]);
  const first = rng.int(0, 1) === 0;
  const q = first ? yes : no;
  const other = first ? no : yes;
  const reply = first ? ['did'] : ['didn’t', 'did not'];
  const intro = ['« ', ` ${p.text} ${q.base} ${q.obj}? » « ${first ? 'Yes' : 'No'}, ${p.pronoun} `, `. » ${p.text} `];
  // La seconde phrase est l’inverse de la question : niée si la première action a eu lieu, affirmée sinon.
  const end = first
    ? {
        parts: [' ', ` ${other.obj}.`],
        blanks: [
          { mode: 'text' as const, accepted: ['didn’t', 'did not'] },
          { mode: 'text' as const, accepted: [other.base] },
        ],
      }
    : { parts: [` ${other.obj}.`], blanks: [{ mode: 'text' as const, accepted: [other.past] }] };
  return {
    prompt: `Lis la carte de ${p.text}, puis complète : question sur « ${q.fr} », réponse courte, puis phrase sur « ${other.fr} ».`,
    figure: { kind: 'document', title: `A postcard from ${p.text}`, lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [...intro, ...end.parts],
      blanks: [{ mode: 'text', accepted: ['Did'] }, { mode: 'text', accepted: reply }, ...end.blanks],
    },
    hint: 'La réponse courte reprend le petit mot de la question. Puis regarde si la carte affirme ou nie la seconde action.',
    steps: [
      WHY_DID,
      `La carte dit : « I ${yes.past} ${yes.obj} » et « I didn’t ${no.base} ${no.obj} ».`,
      `Réponse : **Did**, **${reply[0]}**, **${first ? `didn’t ${other.base}` : other.past}**`,
    ],
  };
}

const did: Skill = {
  id: 'a5-preterit-did',
  title: 'La négation et les questions avec did',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Non : **didn’t** (did not) puis la **base verbale** : They didn’t go to school.',
      'Question : **Did**, le sujet, puis la base : Did you play? Yes, I did. No, I didn’t.',
      'Avec be, pas de did : Was he at home? He wasn’t at home.',
    ],
    source: source('prétérit : phrases négatives et interrogatives'),
    sources: [
      'anglais-college-2025',
      'bc-past-simple',
      'bck-past-questions',
      'bck-past-sentences',
      'bc-questions-negatives',
    ],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return didSpot(rng);
    if (level === 2) return didChoose(rng);
    if (level === 3) return didGaps(rng);
    if (level === 4) return didTransform(rng);
    return didPostcard(rng);
  },
};

// ——— 4. Raconter au passé ———
const present = (p: Person, a: Action) => {
  const s = a.base === 'go' ? 'goes' : third(a.base);
  return `${p.text} ${s} ${a.obj}`;
};
const WHY_PAST = '« yesterday », « last week », « two days ago » : le fait est terminé, on le raconte au prétérit.';

function tellSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(SINGLE);
  const a = rng.pick(ACTIONS);
  const good = `${p.text} ${a.past} ${a.obj}.`;
  const { answer, traps } = choice(rng, good, [
    { label: `${present(p, a)}.`, why: 'Présent simple : cela raconte une habitude, pas un fait passé.' },
    { label: `${p.text} is ${a.ing} ${a.obj}.`, why: 'be + ing : l’action se passe maintenant.' },
  ]);
  return {
    prompt: `Quelle phrase raconte un fait passé (${p.text}, « ${a.fr} ») ?`,
    answer,
    traps,
    hint: 'Observe le verbe : lequel est à un temps du passé ?',
    steps: ['Pour un fait passé, le verbe est au **prétérit**.', `Réponse : **${good}**`],
  };
}

function tellChoose(rng: Rng): QuestionDraft {
  const p = rng.pick(SINGLE);
  const a = rng.pick(ACTIONS);
  const when = rng.pick(['Yesterday', 'Last week', 'Two days ago'] as const);
  const v = IRREGULAR_VERBS.find((x) => x.base === a.base);
  const present3 = a.base === 'go' ? 'goes' : third(a.base);
  const { answer, traps } = choice(rng, a.past, [
    { label: present3, why: WHY_PAST },
    { label: a.base, why: WHY_PAST },
    v
      ? { label: regularised(a.base), why: WHY_IRREGULAR(v) }
      : { label: a.ing, why: 'La forme en -ing ne s’emploie pas seule.' },
  ]);
  return {
    prompt: `Complète le récit : « ${when}, ${p.mid} … ${a.obj}. »`,
    answer,
    traps,
    hint: 'Le début de la phrase donne le moment. Le verbe est-il régulier ?',
    steps: [WHY_PAST, `Réponse : **${when}, ${p.mid} ${a.past} ${a.obj}.**`],
  };
}

const NARRATIVE: readonly {
  readonly base: string;
  readonly past: string;
  readonly before: string;
  readonly after: string;
}[] = [
  { base: 'be', past: 'was', before: 'First, the weather', after: 'great.' },
  { base: 'be', past: 'were', before: 'Last night, my cousins', after: 'very tired.' },
  { base: 'visit', past: 'visited', before: 'First, we', after: 'the castle.' },
  { base: 'watch', past: 'watched', before: 'Last night, I', after: 'a documentary.' },
  { base: 'discover', past: 'discovered', before: 'At the museum, I', after: 'new artists.' },
  { base: 'go', past: pastOf('go'), before: 'Then I', after: 'to the museum.' },
  { base: 'see', past: pastOf('see'), before: 'Yesterday, we', after: 'a great film.' },
  { base: 'eat', past: pastOf('eat'), before: 'Then Tom', after: 'a big sandwich.' },
  { base: 'buy', past: pastOf('buy'), before: 'Last Saturday, Lisa', after: 'a postcard.' },
  { base: 'meet', past: pastOf('meet'), before: 'Two days ago, I', after: 'a new friend.' },
  { base: 'win', past: pastOf('win'), before: 'Last Sunday, our team', after: 'the match.' },
];

function tellType(rng: Rng): QuestionDraft {
  const n = rng.pick(NARRATIVE);
  const v = IRREGULAR_VERBS.find((x) => x.base === n.base);
  return {
    prompt: `Écris « ${n.base} » au bon temps pour raconter : « ${n.before} … ${n.after} »`,
    answer: { kind: 'text', accepted: [n.past] },
    traps: [
      { text: n.base, why: 'On raconte un fait terminé : le verbe passe au prétérit.' },
      ...(v && !v.past.includes(regularised(n.base)) ? [{ text: regularised(n.base), why: WHY_IRREGULAR(v) }] : []),
      ...(n.base === 'be'
        ? [
            {
              text: n.past === 'was' ? 'were' : 'was',
              why: 'Was pour une seule personne ou chose ; were pour plusieurs.',
            },
          ]
        : []),
    ],
    hint: 'La phrase fait partie d’un récit : demande-toi si le verbe est régulier ou non.',
    steps: [
      'Un récit d’évènements terminés se fait au **prétérit**.',
      `Réponse : **${n.before} ${n.past} ${n.after}**`,
    ],
  };
}

function tellRewrite(rng: Rng): QuestionDraft {
  const p = rng.pick(SINGLE);
  const a = rng.pick(ACTIONS);
  const body = `${p.mid} ${a.past} ${a.obj}`;
  const wrong = (form: string) => [`Yesterday, ${p.mid} ${form} ${a.obj}`, `Yesterday ${p.mid} ${form} ${a.obj}`];
  const presentForm = a.base === 'go' ? 'goes' : third(a.base);
  const accepted = dotted([`Yesterday, ${body}`, `Yesterday ${body}`, `${p.text} ${a.past} ${a.obj} yesterday`]);
  const v = IRREGULAR_VERBS.find((x) => x.base === a.base);
  return {
    prompt: `Raconte ce qui s’est passé hier, en commençant par « Yesterday » : « Every day, ${present(p, a).replace(p.text, p.mid)}. »`,
    answer: { kind: 'text', accepted },
    traps: dottedTraps([
      ...wrong(presentForm).map((text) => ({ text, why: WHY_PAST })),
      ...(v ? wrong(regularised(a.base)).map((text) => ({ text, why: WHY_IRREGULAR(v) })) : []),
    ]),
    hint: 'Remplace le marqueur d’habitude, puis change le temps du verbe.',
    steps: [WHY_PAST, `Réponse : **Yesterday, ${body}.**`],
  };
}

function tellStory(rng: Rng): QuestionDraft {
  const p = rng.pick(NAMED);
  const [one, two, not] = some(rng, ACTIONS, 3) as [Action, Action, Action];
  const lines = [
    `1. ${p.text} — ${one.base} ${one.obj}`,
    `2. ${p.text} — ${two.base} ${two.obj}`,
    `3. Weather — be nice`,
    `Not done: ${not.base} ${not.obj}`,
  ];
  const He = cap(p.pronoun);
  return {
    prompt: `Lis les notes de ${p.text} (« ${one.fr} », « ${two.fr} », pas « ${not.fr} »), puis rédige le récit de samedi dernier.`,
    figure: { kind: 'document', title: 'Last Saturday', lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [
        `First, ${p.text} `,
        ` ${one.obj}. Then ${p.pronoun} `,
        ` ${two.obj}. The weather `,
        ` nice. ${He} `,
        ' ',
        ` ${not.obj}.`,
      ],
      blanks: [
        { mode: 'text', accepted: [one.past] },
        { mode: 'text', accepted: [two.past] },
        { mode: 'text', accepted: ['was'] },
        { mode: 'text', accepted: ['didn’t', 'did not'] },
        { mode: 'text', accepted: [not.base] },
      ],
    },
    hint: 'Suis l’ordre des notes. La dernière phrase dit ce qui n’a pas eu lieu : un seul des deux verbes change.',
    steps: [
      `Faits terminés : **${one.past}**, puis **${two.past}**.`,
      'Be avec « the weather » (une seule chose) : **was**.',
      `Ce qui n’a pas eu lieu : **didn’t ${not.base}** (base verbale après didn’t).`,
      `Réponse : **${one.past}** ; **${two.past}** ; **was** ; **didn’t ${not.base}**`,
    ],
  };
}

const tell: Skill = {
  id: 'a5-phrase',
  title: 'Raconter au passé',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Pour un **récit** au passé, mets les verbes au **prétérit** : I watched a documentary, I went to the museum.',
      'Situe les faits avec yesterday, last week ou two days ago, et enchaîne avec first, then.',
      'Pour dire ce qui n’a pas eu lieu : didn’t puis la base verbale.',
    ],
    source: source('l’expression du passé, raconter'),
    sources: [
      'anglais-college-2025',
      'bc-past-simple',
      'bct-past-regular',
      'bct-past-irregular',
      'british-council-irregular-verbs',
    ],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return tellSpot(rng);
    if (level === 2) return tellChoose(rng);
    if (level === 3) return tellType(rng);
    if (level === 4) return tellRewrite(rng);
    return tellStory(rng);
  },
};

export const ENGLISH_PAST_5E_CHAPTER: Chapter = {
  id: 'a5-verbes-irreguliers',
  subject: 'anglais',
  grade: '5e',
  domain: 'langue',
  title: 'Le prétérit',
  skills: [regular, irregularSkill, did, tell, PAST_PARTICIPLE_SKILL],
};
