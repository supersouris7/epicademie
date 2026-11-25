import type { Chapter, Level, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, de, shuffledOther, some } from './temps.ts';

/**
 * Anglais 6e — « Le présent simple » (lot an-6e-01, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) ; règles et formes : British Council (voir present-simple-faits.ts : chaque fait y porte sa source
 * et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string) =>
  `${PROGRAMME} — ${detail}. Règles : British Council, LearnEnglish, « Present simple » et « Questions and negatives ».`;

interface Verb {
  readonly base: string;
  /** Forme avec he, she, it. */
  readonly s: string;
  /** Orthographe fausse typique de la 3e personne (verbes en -es, -ies, play, have). */
  readonly bad?: string;
  readonly fr: string;
  readonly obj: string;
  readonly time: string;
  /** 1 : -s ; 2 : -es et play ; 3 : y → ies et have. */
  readonly tier: 1 | 2 | 3;
  /** Verbe suivi d'un complément d'objet : un seul ordre des mots possible. */
  readonly direct?: boolean;
}
type Extra = Partial<Pick<Verb, 'bad' | 'direct'>>;
const verb = (
  tier: Verb['tier'],
  forms: readonly [string, string],
  fr: string,
  rest: readonly [string, string],
  extra: Extra = {},
): Verb => ({ tier, base: forms[0], s: forms[1], fr, obj: rest[0], time: rest[1], ...extra });
const direct = { direct: true };

export const VERBS: readonly Verb[] = [
  verb(1, ['ride', 'rides'], 'faire du vélo', ['a bike', 'after school'], direct),
  verb(1, ['eat', 'eats'], 'manger des fruits', ['fruit', 'every day'], direct),
  verb(1, ['phone', 'phones'], 'téléphoner à mamie', ['Grandma', 'on Sundays'], direct),
  verb(1, ['live', 'lives'], 'habiter un petit appartement', ['in a small flat', 'in London']),
  verb(1, ['work', 'works'], 'travailler dans un magasin', ['in a shop', 'every weekend']),
  verb(1, ['sleep', 'sleeps'], 'dormir huit heures', ['eight hours', 'every night']),
  verb(1, ['start', 'starts'], 'commencer le travail', ['work', 'at eight o’clock']),
  verb(1, ['come', 'comes'], 'venir au club', ['to the club', 'on Fridays']),
  verb(2, ['play', 'plays'], 'jouer au foot', ['football', 'on Saturdays'], { bad: 'plaies', direct: true }),
  verb(2, ['brush', 'brushes'], 'brosser le chien', ['the dog', 'every evening'], { bad: 'brushs', direct: true }),
  verb(2, ['finish', 'finishes'], 'finir le travail tôt', ['work', 'early on Fridays'], { bad: 'finishs' }),
  verb(2, ['go', 'goes'], 'aller au parc', ['to the park', 'after school'], { bad: 'gos' }),
  verb(2, ['do', 'does'], 'faire du judo', ['judo', 'on Wednesdays'], { bad: 'dos', direct: true }),
  verb(3, ['tidy', 'tidies'], 'ranger la cuisine', ['the kitchen', 'on Sundays'], { bad: 'tidys', direct: true }),
  verb(3, ['study', 'studies'], 'étudier l’anglais', ['English', 'every day'], { bad: 'studys', direct: true }),
  verb(3, ['have', 'has'], 'avoir un cours de musique', ['a music lesson', 'on Mondays'], {
    bad: 'haves',
    direct: true,
  }),
];

interface Subject {
  /** En début de phrase. */
  readonly text: string;
  /** Au milieu d'une phrase (question). */
  readonly mid: string;
  readonly pronoun: 'I' | 'you' | 'he' | 'she' | 'we' | 'they';
}
const subject = (text: string, pronoun: Subject['pronoun'], mid = text): Subject => ({ text, mid, pronoun });
const THIRD: readonly Subject[] = [
  subject('Tom', 'he'),
  subject('Emir', 'he'),
  subject('Lisa', 'she'),
  subject('Ana', 'she'),
  subject('My brother', 'he', 'my brother'),
  subject('My sister', 'she', 'my sister'),
  subject('He', 'he', 'he'),
  subject('She', 'she', 'she'),
];
const PLURAL: readonly Subject[] = [
  subject('My parents', 'they', 'my parents'),
  subject('Tom and Ana', 'they'),
  subject('They', 'they', 'they'),
];
const SPEAKERS: readonly Subject[] = [subject('I', 'I'), subject('You', 'you', 'you'), subject('We', 'we', 'we')];
const OTHERS: readonly Subject[] = [...SPEAKERS, ...PLURAL];
const ALL: readonly Subject[] = [...OTHERS, ...THIRD];

const isThird = (s: Subject) => s.pronoun === 'he' || s.pronoun === 'she';
const formFor = (s: Subject, v: Verb) => (isThird(s) ? v.s : v.base);
const doFor = (s: Subject) => (isThird(s) ? 'does' : 'do');
const dontFor = (s: Subject) => (isThird(s) ? 'doesn’t' : 'don’t');
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const rest = (v: Verb) => `${v.obj} ${v.time}`;
const sentence = (s: Subject, group: string, v: Verb) => `${s.text} ${group} ${rest(v)}.`;
const question = (aux: string, s: Subject, group: string, v: Verb) => `${aux} ${s.mid} ${group} ${rest(v)}?`;
const upTo = (tier: number) => VERBS.filter((v) => v.tier <= tier);
const DIRECT = VERBS.filter((v) => v.direct);
const NOT_HAVE = VERBS.filter((v) => v.base !== 'have');
const coin = (rng: Rng) => rng.int(0, 1) === 0;

/** Saisies acceptées : phrase avec ou sans point final. */
const dotted = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
/** Questions avec ou sans point d’interrogation (collé ou précédé d’une espace). */
const asked = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}?`, `${f} ?`]);
/** Les deux écritures de la négation : « doesn’t » et « does not ». */
const negations = (s: Subject, after: string) => [`${dontFor(s)} ${after}`, `${doFor(s)} not ${after}`];

const WHY_BASE = 'Avec I, you, we, they (ou plusieurs personnes), le verbe garde sa base verbale, sans -s.';
const WHY_S = 'Avec he, she, it (une seule personne ou chose), le verbe prend -s ou -es.';
const whyForm = (s: Subject) => (isThird(s) ? WHY_S : WHY_BASE);
const WHY_BE = 'Au présent simple, on n’ajoute pas be (am, is, are) devant le verbe.';
const WHY_ING = 'La forme en -ing ne s’emploie pas seule : ici, il faut le présent simple.';
const who = (s: Subject) =>
  isThird(s)
    ? `« ${s.text} » : une seule personne, c’est la 3e personne du singulier.`
    : `« ${s.text} » : ce n’est pas la 3e personne du singulier.`;

/** Piège « ajoute ou enlève le -s ». */
const swapped = (s: Subject, v: Verb) => ({ label: isThird(s) ? v.base : v.s, why: whyForm(s) });

// ——— 1. Présent simple affirmatif ———
function affirmativeSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(SPEAKERS);
  const v = rng.pick(upTo(2));
  const good = sentence(s, v.base, v);
  const be = s.pronoun === 'I' ? 'am' : 'are';
  const { answer, traps } = choice(rng, good, [
    { label: sentence(s, `${be} ${v.base}`, v), why: WHY_BE },
    { label: sentence(s, `${v.base}ing`.replace(/eing$/, 'ing'), v), why: WHY_ING },
  ]);
  return {
    prompt: `Tu parles d’une habitude (${v.fr}). Quelle phrase affirmative est juste avec « ${s.text} » ?`,
    answer,
    traps,
    hint: 'Regarde ce qui suit le sujet : au présent simple, le verbe a-t-il besoin d’un autre mot ou d’une terminaison ?',
    steps: [`Une habitude se dit au présent simple. ${WHY_BASE}`, `Réponse : **${good}**`],
  };
}

function affirmativeChoose(rng: Rng): QuestionDraft {
  const s = rng.pick(ALL);
  const v = rng.pick(upTo(2));
  const right = formFor(s, v);
  const be = s.pronoun === 'I' ? 'am' : isThird(s) ? 'is' : 'are';
  const { answer, traps } = choice(rng, right, [
    swapped(s, v),
    { label: `${be} ${v.base}`, why: WHY_BE },
    { label: `${v.base}ing`.replace(/eing$/, 'ing'), why: WHY_ING },
  ]);
  return {
    prompt: `Complète au présent simple (${v.base}) : « ${s.text} … ${rest(v)}. »`,
    answer,
    traps,
    hint: 'Cherche le sujet : est-ce une seule personne dont on parle, ou non ?',
    steps: [who(s), whyForm(s), `Réponse : **${sentence(s, right, v)}**`],
  };
}

function affirmativeOrder(rng: Rng): QuestionDraft {
  const s = rng.pick(OTHERS);
  const v = rng.pick(DIRECT);
  const words = [s.text, v.base, v.obj, v.time];
  const items = shuffledOther(rng, words);
  return {
    prompt: `Remets la phrase dans l’ordre, en commençant par le sujet : « ${s.text} », « ${v.base} », « ${v.obj} », puis le moment.`,
    answer: { kind: 'order', items, correct: words.map((w) => items.indexOf(w)) },
    hint: 'En anglais, l’ordre est : qui, fait quoi, puis quand.',
    steps: [
      'La phrase affirmative suit l’ordre : sujet, verbe, complément, puis le moment.',
      `Réponse : **${sentence(s, v.base, v)}**`,
    ],
  };
}

function affirmativeTwo(rng: Rng): QuestionDraft {
  const many = rng.pick(PLURAL);
  const one = rng.pick(THIRD.filter((s) => s.text.startsWith('My')));
  const [a, b] = some(rng, VERBS, 2) as [Verb, Verb];
  return {
    prompt: `Complète au présent simple avec « ${a.base} », puis « ${b.base} ».`,
    answer: {
      kind: 'cloze',
      parts: [`${many.text} `, ` ${rest(a)}. ${one.text} `, ` ${rest(b)}.`],
      blanks: [
        { mode: 'text', accepted: [a.base] },
        { mode: 'text', accepted: [b.s] },
      ],
    },
    hint: 'Traite chaque phrase à part : remplace son sujet par he, she ou they.',
    steps: [
      `« ${many.text} » = they. ${WHY_BASE}`,
      `« ${one.text} » = ${one.pronoun}. ${WHY_S}`,
      `Réponse : **${a.base}**, puis **${b.s}**`,
    ],
  };
}

const NAMES = {
  boys: ['Tom', 'Emir', 'Paul'],
  girls: ['Ana', 'Lisa', 'Yuna'],
} as const;
/** Deux enfants inventés : un garçon et une fille, dans un ordre variable. */
const pairOfKids = (rng: Rng) => {
  const girl = subject(rng.pick(NAMES.girls), 'she');
  const boy = subject(rng.pick(NAMES.boys), 'he');
  return rng.shuffle([girl, boy]) as [Subject, Subject];
};
const ABOUT = 'Écrit pour l’exercice.';

function affirmativeMessages(rng: Rng): QuestionDraft {
  const [a, b] = pairOfKids(rng);
  const [shared, onlyA, onlyB] = some(rng, DIRECT, 3) as [Verb, Verb, Verb];
  const line = (k: Subject, own: Verb) =>
    `${k.text}: ${rng
      .shuffle([shared, own])
      .map((v) => `I ${v.base} ${rest(v)}.`)
      .join(' ')}`;
  const objects = rng.shuffle([shared, onlyA, onlyB].map((v) => rest(v)));
  return {
    prompt: `Lis les deux messages, puis complète au présent simple : l’activité commune, puis celle que seul le message ${de(a.text)} annonce.`,
    figure: { kind: 'document', title: 'My week', lines: [line(a, onlyA), line(b, onlyB)], credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts: [`${a.text} and ${b.text} `, ' ', `. Only ${a.text} says: « I `, ` ${rest(onlyA)}. »`],
      blanks: [
        { mode: 'text', accepted: [shared.base] },
        { mode: 'list', options: objects, correct: objects.indexOf(rest(shared)) },
        { mode: 'text', accepted: [onlyA.base] },
      ],
    },
    hint: 'Cherche la phrase écrite dans les deux messages. Les deux sujets réunis valent they.',
    steps: [
      `Les deux messages disent « I ${shared.base} ${rest(shared)} ».`,
      `« ${a.text} and ${b.text} » = they ; après they comme après I, le verbe reste à la base.`,
      `Seul le message ${de(a.text)} dit « I ${onlyA.base} ${rest(onlyA)} ».`,
      `Réponse : **${shared.base} ${rest(shared)}**, puis **${onlyA.base}**`,
    ],
  };
}

const affirmative: Skill = {
  id: 'a6-present-affirmatif',
  title: 'Le présent simple à la forme affirmative',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **présent simple** dit une habitude ou ce qui est vrai : I play football every weekend.',
      'Après le **sujet**, on met la **base verbale** : we work, they live (sans am ni are devant).',
      'Attention : avec he, she, it, le verbe change un peu : she works.',
    ],
    source: source('présent simple, phrases affirmatives'),
    sources: ['anglais-college-2025', 'bc-present-simple', 'bc-present-simple-a1'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return affirmativeSpot(rng);
    if (level === 2) return affirmativeChoose(rng);
    if (level === 3) return affirmativeOrder(rng);
    if (level === 4) return affirmativeTwo(rng);
    return affirmativeMessages(rng);
  },
};

// ——— 2. 3e personne du singulier ———
/** Comment s'écrit la forme avec he, she, it. */
const spelling = (v: Verb) => {
  if (v.base === 'have') return 'have est irrégulier : have → **has**.';
  if (v.base === 'do' || v.base === 'go') return `${v.base} est à part : ${v.base} → **${v.s}**.`;
  if (v.s.endsWith('ies')) return `Ici le y devient i : ${v.base} → **${v.s}**.`;
  if (v.s === `${v.base}es`) return `Ce verbe prend -es : ${v.base} → **${v.s}**.`;
  return `On ajoute -s : ${v.base} → **${v.s}**.`;
};
const thirdTraps = (v: Verb) => [
  { text: v.base, why: WHY_S },
  ...(v.bad ? [{ text: v.bad, why: `Vérifie l’orthographe. ${spelling(v)}` }] : []),
];

function thirdSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(THIRD);
  const v = rng.pick(upTo(1));
  const good = sentence(s, v.s, v);
  const { answer, traps } = choice(rng, good, [
    { label: sentence(s, v.base, v), why: WHY_S },
    { label: sentence(s, `${v.base}ing`.replace(/eing$/, 'ing'), v), why: WHY_ING },
  ]);
  return {
    prompt: `Quelle phrase est juste au présent simple pour « ${s.text} » (${v.fr}) ?`,
    answer,
    traps,
    hint: 'Une seule personne dont on parle : regarde la fin du verbe.',
    steps: [who(s), spelling(v), `Réponse : **${good}**`],
  };
}

function thirdRecognise(rng: Rng): QuestionDraft {
  if (coin(rng)) {
    const rows = [
      rng.pick(VERBS.filter((v) => v.tier === 1)),
      ...some(
        rng,
        VERBS.filter((v) => v.tier > 1),
        2,
      ),
    ];
    const left = rows.map((v) => v.base);
    const right = shuffledOther(
      rng,
      rows.map((v) => v.s),
    );
    return {
      prompt: `Associe chaque verbe à sa forme avec he, she, it : ${left.join(', ')}.`,
      answer: { kind: 'match', left, right, pairs: rows.map((v) => right.indexOf(v.s)) },
      hint: 'Repère le début de chaque verbe, puis regarde comment sa fin change.',
      steps: [...rows.map(spelling), `Réponse : **${rows.map((v) => `${v.base} → ${v.s}`).join(', ')}**`],
    };
  }
  const s = rng.pick(THIRD);
  const v = rng.pick(VERBS.filter((x) => x.bad));
  const { answer, traps } = choice(rng, v.s, [
    { label: v.base, why: WHY_S },
    { label: v.bad ?? '', why: `Vérifie l’orthographe. ${spelling(v)}` },
    { label: `${v.base}ing`.replace(/eing$/, 'ing'), why: WHY_ING },
  ]);
  return {
    prompt: `Choisis la bonne forme (${v.base}) : « ${s.text} … ${rest(v)}. »`,
    answer,
    traps,
    hint: 'Deux choses à vérifier : la personne, puis l’orthographe de la fin du verbe.',
    steps: [who(s), spelling(v), `Réponse : **${sentence(s, v.s, v)}**`],
  };
}

function thirdWrite(rng: Rng, s: Subject, v: Verb): QuestionDraft {
  const right = formFor(s, v);
  return {
    prompt: `Écris le verbe « ${v.base} » au présent simple : « ${s.text} … ${rest(v)}. »`,
    answer: { kind: 'text', accepted: [right] },
    traps: isThird(s) ? thirdTraps(v) : [{ text: v.s, why: WHY_BASE }],
    hint: 'Remplace le sujet par he, she ou they. Faut-il changer la fin du verbe ? Comment ?',
    steps: [who(s), isThird(s) ? spelling(v) : WHY_BASE, `Réponse : **${sentence(s, right, v)}**`],
  };
}

/** Niveau 4 : verbes en -es, -ies, have ; un sujet pluriel parfois, pour ne pas ajouter -s partout. */
function thirdHard(rng: Rng): QuestionDraft {
  const s = rng.int(0, 3) === 0 ? rng.pick(PLURAL) : rng.pick(THIRD);
  return thirdWrite(rng, s, rng.pick(VERBS.filter((v) => v.tier > 1)));
}

function thirdPresent(rng: Rng): QuestionDraft {
  const kid = rng.pick(pairOfKids(rng));
  // Les phrases à compléter suivent l’ordre du message.
  const rows = rng.shuffle([
    rng.pick(VERBS.filter((v) => v.tier === 1)),
    ...some(
      rng,
      VERBS.filter((v) => v.tier > 1),
      2,
    ),
  ]);
  const He = cap(kid.pronoun);
  return {
    prompt: `Lis le message ${de(kid.text)}, puis présente ${kid.pronoun === 'he' ? 'ce garçon' : 'cette fille'} à la classe, au présent simple.`,
    figure: {
      kind: 'document',
      title: `${kid.text}’s message`,
      lines: rows.map((v) => `I ${v.base} ${rest(v)}.`),
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `${kid.text} `,
        ` ${rest(at(rows, 0))}. ${He} `,
        ` ${rest(at(rows, 1))}. ${He} also `,
        ` ${rest(at(rows, 2))}.`,
      ],
      blanks: rows.map((v) => ({ mode: 'text' as const, accepted: [v.s] })),
    },
    hint: 'Retrouve chaque ligne du message grâce à la fin de la phrase, puis passe de I à he ou she.',
    steps: [
      `Le message dit I ; toi, tu parles de ${kid.text} : c’est la 3e personne du singulier.`,
      ...rows.map(spelling),
      `Réponse : **${rows.map((v) => v.s).join(', ')}**`,
    ],
  };
}

const thirdPerson: Skill = {
  id: 'a6-present-3e-personne',
  title: 'Le présent simple avec he, she, it',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'À la **3e personne du singulier** (he, she, it), on ajoute -s ou -es : she works, he goes.',
      'Parfois le y devient i : he tidies. Mais play donne plays.',
      'À retenir : have → has, do → does.',
    ],
    source: source('présent simple, 3e personne du singulier'),
    sources: ['anglais-college-2025', 'bc-present-simple', 'bc-present-simple-a1'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return thirdSpot(rng);
    if (level === 2) return thirdRecognise(rng);
    if (level === 3) return thirdWrite(rng, rng.pick(THIRD), rng.pick(upTo(2)));
    if (level === 4) return thirdHard(rng);
    return thirdPresent(rng);
  },
};

// ——— 3. Négation ———
const WHY_NOT = 'Au présent simple, « not » ne suffit pas : on emploie don’t ou doesn’t devant le verbe.';
const WHY_DONT = '« don’t » va avec I, you, we, they (ou plusieurs personnes).';
const WHY_DOESNT = '« doesn’t » va avec he, she, it (une seule personne ou chose).';
const whyAux = (s: Subject) => (isThird(s) ? WHY_DOESNT : WHY_DONT);
const WHY_NO_S = 'Après don’t, doesn’t, do ou does, le verbe reste à la base : on n’y ajoute pas de -s.';

function negativeSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(SPEAKERS);
  const v = rng.pick(upTo(2));
  const good = sentence(s, `don’t ${v.base}`, v);
  const { answer, traps } = choice(rng, good, [
    { label: sentence(s, `not ${v.base}`, v), why: WHY_NOT },
    { label: sentence(s, `${v.base} not`, v), why: WHY_NOT },
  ]);
  return {
    prompt: `Quelle phrase négative est juste avec « ${s.text} » (ne pas ${v.fr}) ?`,
    answer,
    traps,
    hint: 'En anglais, la négation du présent simple demande un petit mot de plus, avant le verbe.',
    steps: [`${WHY_DONT} Il se place devant la base verbale.`, `Réponse : **${good}**`],
  };
}

function negativeChoose(rng: Rng): QuestionDraft {
  const s = rng.pick(ALL);
  const v = rng.pick(upTo(2));
  const right = dontFor(s);
  const be = s.pronoun === 'I' ? 'am not' : isThird(s) ? 'isn’t' : 'aren’t';
  const { answer, traps } = choice(rng, right, [
    { label: isThird(s) ? 'don’t' : 'doesn’t', why: whyAux(s) },
    { label: be, why: 'La négation de be ne sert pas avec un autre verbe : il faut don’t ou doesn’t.' },
    { label: 'not', why: WHY_NOT },
  ]);
  return {
    prompt: `Complète la phrase négative : « ${s.text} … ${v.base} ${rest(v)}. »`,
    answer,
    traps,
    hint: 'Regarde le sujet : de combien de personnes parle-t-on, et lesquelles ?',
    steps: [who(s), whyAux(s), `Réponse : **${sentence(s, `${right} ${v.base}`, v)}**`],
  };
}

function negativeGap(rng: Rng): QuestionDraft {
  const s = rng.pick(ALL);
  const v = rng.pick(NOT_HAVE);
  const accepted = negations(s, v.base);
  const wrongAux = isThird(s) ? 'don’t' : 'doesn’t';
  return {
    prompt: `Mets à la forme négative : « ${sentence(s, formFor(s, v), v)} » → « ${s.text} … ${rest(v)}. »`,
    answer: { kind: 'text', accepted },
    traps: [
      { text: `${wrongAux} ${v.base}`, why: whyAux(s) },
      { text: `${dontFor(s)} ${v.s}`, why: WHY_NO_S },
      { text: `not ${v.base}`, why: WHY_NOT },
    ],
    hint: 'Il faut deux éléments : le petit mot de la négation qui va avec le sujet, puis le verbe.',
    steps: [who(s), whyAux(s), WHY_NO_S, `Réponse : **${at(accepted, 0)}**`],
  };
}

function negativeWrite(rng: Rng): QuestionDraft {
  const s = rng.pick([...THIRD, ...PLURAL]);
  const v = rng.pick(VERBS);
  const have = v.base === 'have';
  const groups = [
    ...negations(s, v.base),
    // Avec have, la forme sans do est aussi correcte (British Council, « Questions and negatives »).
    ...(have ? (isThird(s) ? ['hasn’t', 'has not'] : ['haven’t', 'have not']) : []),
  ];
  const full = (group: string) => `${s.text} ${group} ${rest(v)}`;
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${sentence(s, formFor(s, v), v)} »`,
    answer: { kind: 'text', accepted: dotted(groups.map(full)) },
    traps: [
      { text: `${full(`${isThird(s) ? 'don’t' : 'doesn’t'} ${v.base}`)}.`, why: whyAux(s) },
      { text: `${full(`${dontFor(s)} ${v.s}`)}.`, why: WHY_NO_S },
      { text: `${full(`not ${formFor(s, v)}`)}.`, why: WHY_NOT },
    ],
    hint: 'Garde le sujet et la fin de la phrase. Entre les deux : la négation, puis le verbe sans -s.',
    steps: [who(s), whyAux(s), WHY_NO_S, `Réponse : **${full(at(groups, 0))}.**`],
  };
}

function negativeSurvey(rng: Rng): QuestionDraft {
  const [a, b] = pairOfKids(rng);
  const [one, none, other] = some(rng, NOT_HAVE, 3) as [Verb, Verb, Verb];
  const yn = (v: boolean) => (v ? 'yes' : 'no');
  const row = (v: Verb, x: boolean, y: boolean) => `${v.base} ${rest(v)} — ${a.text}: ${yn(x)} — ${b.text}: ${yn(y)}`;
  const lines = rng.shuffle([row(one, true, false), row(none, false, false), row(other, false, true)]);
  const no = negations(b, one.base);
  const both = ['don’t', 'do not'].map((n) => `${n} ${none.base}`);
  return {
    prompt: `Lis l’enquête (yes = oui, no = non). Complète avec « ${one.base} » (deux fois) puis « ${none.base} », au présent simple. Pour dire non : don’t ou doesn’t.`,
    figure: { kind: 'document', title: 'Class survey', lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts: [`${a.text} `, ` ${rest(one)}. ${b.text} `, ` ${rest(one)}. ${a.text} and ${b.text} `, ` ${rest(none)}.`],
      blanks: [
        { mode: 'text', accepted: [one.s] },
        { mode: 'text', accepted: no },
        { mode: 'text', accepted: both },
      ],
    },
    hint: 'Pour chaque trou : lis la bonne ligne, yes ou no, puis compte les personnes du sujet.',
    steps: [
      `${a.text} : yes → phrase affirmative, 3e personne : ${one.s}.`,
      `${b.text} : no → ${at(no, 0)}. ${WHY_NO_S}`,
      `Les deux réunis valent they : ${at(both, 0)}.`,
      `Réponse : **${one.s}**, **${at(no, 0)}**, **${at(both, 0)}**`,
    ],
  };
}

const negative: Skill = {
  id: 'a6-present-negation',
  title: 'La négation : don’t et doesn’t',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **négation** au présent simple utilise un **auxiliaire** : **don’t** (do not) avec I, you, we, they.',
      'Avec he, she, it : **doesn’t** (does not). Le verbe reste à la base : she doesn’t live here.',
    ],
    source: source('présent simple, phrases négatives'),
    sources: ['anglais-college-2025', 'bc-present-simple', 'bc-questions-negatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return negativeSpot(rng);
    if (level === 2) return negativeChoose(rng);
    if (level === 3) return negativeGap(rng);
    if (level === 4) return negativeWrite(rng);
    return negativeSurvey(rng);
  },
};

// ——— 4. Questions avec do et does ———
const WHY_DO = '« Do » ouvre la question avec I, you, we, they (ou plusieurs personnes).';
const WHY_DOES = '« Does » ouvre la question avec he, she, it (une seule personne ou chose).';
const whyDo = (s: Subject) => (isThird(s) ? WHY_DOES : WHY_DO);
const WHY_INVERT = 'Au présent simple, on ne déplace pas le verbe devant le sujet : on commence par Do ou Does.';
const ASKABLE: readonly Subject[] = [subject('You', 'you', 'you'), ...THIRD.slice(0, 6), ...PLURAL.slice(0, 2)];

function questionSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKABLE);
  const v = rng.pick(upTo(2).filter((x) => x.base !== 'do'));
  const aux = cap(doFor(s));
  const good = question(aux, s, v.base, v);
  const { answer, traps } = choice(rng, good, [
    { label: question(cap(v.base), s, '', v).replace('  ', ' '), why: WHY_INVERT },
    { label: question(isThird(s) ? 'Do' : 'Does', s, v.base, v), why: whyDo(s) },
  ]);
  return {
    prompt: `Quelle question est juste au sujet de « ${s.mid} » (${v.fr}) ?`,
    answer,
    traps,
    hint: 'Une question commence par un petit mot qui dépend du sujet ; le verbe vient après le sujet.',
    steps: [whyDo(s), 'Ordre : Do ou Does, le sujet, puis la base verbale.', `Réponse : **${good}**`],
  };
}

const ANSWERERS: readonly { readonly s: Subject; readonly reply: string }[] = [
  { s: subject('You', 'you', 'you'), reply: 'Yes, I do.' },
  { s: subject('Tom', 'he'), reply: 'Yes, he does.' },
  { s: subject('Lisa', 'she'), reply: 'Yes, she does.' },
  { s: subject('My parents', 'they', 'your parents'), reply: 'Yes, they do.' },
];

function questionRecognise(rng: Rng): QuestionDraft {
  if (coin(rng)) {
    const people = some(rng, ANSWERERS, 3);
    const verbs = some(rng, upTo(2), 3);
    const left = people.map((p, i) => question(cap(doFor(p.s)), p.s, at(verbs, i).base, at(verbs, i)));
    const right = shuffledOther(
      rng,
      people.map((p) => p.reply),
    );
    return {
      prompt: `Associe chaque question à sa réponse courte : ${left.join(' ')}`,
      answer: { kind: 'match', left, right, pairs: people.map((p) => right.indexOf(p.reply)) },
      hint: 'Qui répond, ou de qui parle-t-on ? La réponse reprend ce sujet sous forme de pronom.',
      steps: [
        'La réponse courte reprend un pronom, puis do ou does. À « Do you… ? », on répond avec I.',
        `Réponse : **${left.map((q, i) => `${q} ${at(people, i).reply}`).join(' ; ')}**`,
      ],
    };
  }
  const s = rng.pick(ASKABLE);
  const v = rng.pick(upTo(2));
  const right = cap(doFor(s));
  const { answer, traps } = choice(rng, right, [
    { label: isThird(s) ? 'Do' : 'Does', why: whyDo(s) },
    { label: 'Is', why: '« Is » vient de be : avec un autre verbe, la question prend Do ou Does.' },
    { label: 'Are', why: '« Are » vient de be : avec un autre verbe, la question prend Do ou Does.' },
  ]);
  return {
    prompt: `Complète la question : « … ${s.mid} ${v.base} ${rest(v)}? »`,
    answer,
    traps,
    hint: 'Regarde le sujet, placé juste après le trou, et le verbe qui suit.',
    steps: [whyDo(s), `Réponse : **${question(right, s, v.base, v)}**`],
  };
}

function questionOrder(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKABLE);
  // « do » est écarté : il ferait doublon avec « Do » parmi les mots à ranger.
  const v = rng.pick(DIRECT.filter((x) => x.base !== 'do'));
  const words = [cap(doFor(s)), s.mid, v.base, v.obj, v.time];
  const items = shuffledOther(rng, words);
  return {
    prompt: `Remets la question dans l’ordre, en commençant par Do ou Does : on interroge sur « ${s.mid} », avec « ${v.base} » et « ${v.obj} ». Le moment vient à la fin.`,
    answer: { kind: 'order', items, correct: words.map((w) => items.indexOf(w)) },
    hint: 'Après le premier petit mot, demande-toi : qui ? fait quoi ?',
    steps: [
      'Question : Do ou Does, sujet, base verbale, complément, moment.',
      `Réponse : **${question(cap(doFor(s)), s, v.base, v)}**`,
    ],
  };
}

/** Question avec un mot interrogatif : le complément demandé disparaît de la question. */
const WH: readonly { readonly base: string; readonly wh: string; readonly keep: string; readonly asks: string }[] = [
  { base: 'live', wh: 'Where', keep: '', asks: 'le lieu' },
  { base: 'go', wh: 'Where', keep: ' after school', asks: 'le lieu' },
  { base: 'start', wh: 'What time', keep: ' work', asks: 'l’heure' },
];

function questionWh(rng: Rng): QuestionDraft {
  const s = rng.pick([...THIRD.slice(0, 6), ...PLURAL]);
  const w = rng.pick(WH);
  const v = VERBS.find((x) => x.base === w.base) ?? at(VERBS, 0);
  const statement = w.base === 'live' ? `${s.text} ${formFor(s, v)} in London.` : sentence(s, formFor(s, v), v);
  const build = (aux: string, form: string) => `${w.wh} ${aux} ${s.mid} ${form}${w.keep}`;
  const good = build(doFor(s), v.base);
  return {
    prompt: `Pose la question avec « ${w.wh} » pour demander ${w.asks} : « ${statement} »`,
    answer: { kind: 'text', accepted: asked([good]) },
    traps: [
      { text: `${build(isThird(s) ? 'do' : 'does', v.base)}?`, why: whyDo(s) },
      { text: `${build(doFor(s), v.s)}?`, why: WHY_NO_S },
      { text: `${w.wh} ${s.mid} ${formFor(s, v)}${w.keep}?`, why: 'Après le mot interrogatif, il faut do ou does.' },
    ],
    hint: 'Ordre : le mot interrogatif, le petit mot de la question, le sujet, puis le verbe.',
    steps: ['Le mot interrogatif se place devant do ou does.', whyDo(s), `Réponse : **${good}?**`],
  };
}

function questionTransform(rng: Rng): QuestionDraft {
  if (rng.int(0, 2) === 0) return questionWh(rng);
  const s = rng.pick([...THIRD, ...PLURAL]);
  const v = rng.pick(VERBS);
  const good = `${cap(doFor(s))} ${s.mid} ${v.base} ${rest(v)}`;
  // Avec have, la question sans do est aussi correcte (British Council, « Questions and negatives »).
  const other = v.base === 'have' ? [`${isThird(s) ? 'Has' : 'Have'} ${s.mid} ${rest(v)}`] : [];
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${sentence(s, formFor(s, v), v)} »`,
    answer: { kind: 'text', accepted: asked([good, ...other]) },
    traps: [
      { text: question(isThird(s) ? 'Do' : 'Does', s, v.base, v), why: whyDo(s) },
      { text: question(cap(doFor(s)), s, v.s, v), why: WHY_NO_S },
      { text: `${cap(formFor(s, v))} ${s.mid} ${rest(v)}?`, why: WHY_INVERT },
    ].filter((t) => v.base !== 'have' || t.why !== WHY_INVERT),
    hint: 'Commence par le petit mot qui va avec le sujet, puis vérifie la fin du verbe.',
    steps: [whyDo(s), WHY_NO_S, `Réponse : **${good}?**`],
  };
}

function questionInterview(rng: Rng): QuestionDraft {
  const [kid, mate] = pairOfKids(rng);
  const [yes, no, extra] = some(rng, NOT_HAVE, 3) as [Verb, Verb, Verb];
  const says = (v: Verb, does: boolean) => `I ${does ? '' : 'don’t '}${v.base} ${rest(v)}.`;
  const message = (k: Subject, parts: readonly string[]) => `${k.text}: ${rng.shuffle(parts).join(' ')}`;
  // L’autre enfant dit le contraire : il faut lire le bon message.
  const lines = rng.shuffle([
    message(kid, [says(yes, true), says(no, false), says(extra, true)]),
    message(mate, [says(yes, false), says(no, true)]),
  ]);
  const rows = rng.shuffle([
    { v: yes, does: true },
    { v: no, does: false },
  ]);
  const [first, second] = rows as [(typeof rows)[number], (typeof rows)[number]];
  const word = (does: boolean) => (does ? 'Yes' : 'No');
  const reply = (does: boolean) => (does ? ['does'] : ['doesn’t', 'does not']);
  const answerList = (does: boolean) => ({ mode: 'list' as const, options: ['Yes', 'No'], correct: does ? 0 : 1 });
  const He = kid.pronoun;
  return {
    prompt: `Lis les messages. Tu poses deux questions sur ${kid.text} : « ${first.v.base} », puis « ${second.v.base} ». Complète les questions et les réponses courtes.`,
    figure: { kind: 'document', title: 'About us', lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts: [
        '« ',
        ` ${kid.text} ${first.v.base} ${rest(first.v)}? » « `,
        `, ${He} `,
        `. » « Does ${kid.text} `,
        ` ${rest(second.v)}? » « `,
        `, ${He} `,
        '. »',
      ],
      blanks: [
        { mode: 'text', accepted: ['Does'] },
        answerList(first.does),
        { mode: 'text', accepted: reply(first.does) },
        { mode: 'text', accepted: [second.v.base] },
        answerList(second.does),
        { mode: 'text', accepted: reply(second.does) },
      ],
    },
    hint: `Lis seulement le message ${de(kid.text)}. La réponse courte reprend le petit mot de la question, pas le verbe.`,
    steps: [
      `${WHY_DOES} Le verbe qui suit reste à la base.`,
      ...rows.map(
        (r) => `Message ${de(kid.text)} : « ${says(r.v, r.does)} » → ${word(r.does)}, ${He} ${reply(r.does)[0]}.`,
      ),
      `Réponse : **Does, ${word(first.does)}, ${reply(first.does)[0]} ; ${second.v.base}, ${word(second.does)}, ${reply(second.does)[0]}**`,
    ],
  };
}

const questions: Skill = {
  id: 'a6-present-questions',
  title: 'Les questions avec do et does',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Question au présent simple : **Do** ou **Does**, puis le **sujet**, puis la **base verbale** : Does he speak English?',
      '**Does** va avec he, she, it ; **Do** avec les autres sujets.',
      'La **réponse courte** reprend le même petit mot : Yes, he does. No, I don’t.',
    ],
    source: source('présent simple, phrases interrogatives'),
    sources: ['anglais-college-2025', 'bc-present-simple', 'bc-present-simple-a1', 'bc-questions-negatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return questionSpot(rng);
    if (level === 2) return questionRecognise(rng);
    if (level === 3) return questionOrder(rng);
    if (level === 4) return questionTransform(rng);
    return questionInterview(rng);
  },
};

export const ENGLISH_PRESENT_SIMPLE_CHAPTER: Chapter = {
  id: 'a6-present-simple',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Le présent simple',
  skills: [affirmative, thirdPerson, negative, questions],
};
