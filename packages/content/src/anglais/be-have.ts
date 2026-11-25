import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, de, shuffledOther, some } from './temps.ts';

/**
 * Anglais 6e — « Be et have » (lot an-6e-02, docs/adr/0034). Programme d'anglais du collège (arrêté du 5 mai 2025) ;
 * règles et formes : British Council (voir be-have-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Règles : British Council, ${pages}.`;
const ABOUT = 'Écrit pour l’exercice.';

type Pronoun = 'I' | 'you' | 'he' | 'she' | 'it' | 'we' | 'they';
interface Subject {
  /** En début de phrase. */
  readonly text: string;
  /** Au milieu d'une phrase (question). */
  readonly mid: string;
  readonly pronoun: Pronoun;
}
const subject = (text: string, pronoun: Pronoun, mid = text): Subject => ({ text, mid, pronoun });
const I = subject('I', 'I');
const YOU = subject('You', 'you', 'you');
const THEY = subject('They', 'they', 'they');
const PRONOUN_SUBJECTS: readonly Subject[] = [
  I,
  YOU,
  subject('He', 'he', 'he'),
  subject('She', 'she', 'she'),
  subject('We', 'we', 'we'),
  THEY,
];
/** Une seule personne (he, she). */
const ONE: readonly Subject[] = [
  subject('Tom', 'he'),
  subject('Lisa', 'she'),
  subject('My brother', 'he', 'my brother'),
  subject('My sister', 'she', 'my sister'),
];
/** Plusieurs personnes (they). */
const MANY: readonly Subject[] = [
  subject('My parents', 'they', 'my parents'),
  subject('Tom and Ana', 'they'),
  subject('My cousins', 'they', 'my cousins'),
];
const PEOPLE: readonly Subject[] = [...PRONOUN_SUBJECTS, ...ONE, ...MANY];

const isOne = (s: Subject) => s.pronoun === 'he' || s.pronoun === 'she' || s.pronoun === 'it';
const bePresentOf = (p: Pronoun) => (p === 'I' ? 'am' : p === 'he' || p === 'she' || p === 'it' ? 'is' : 'are');
const bePastOf = (p: Pronoun) => (p === 'you' || p === 'we' || p === 'they' ? 'were' : 'was');
const haveOf = (p: Pronoun) => (p === 'he' || p === 'she' || p === 'it' ? 'has' : 'have');

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** « My brother… » : une question posée à la personne qui parle (« your brother ») est aussi correcte. */
const mids = (s: Subject): readonly string[] =>
  s.mid.startsWith('my ') ? [s.mid, s.mid.replace('my ', 'your ')] : [s.mid];
/** Saisies acceptées : avec ou sans ponctuation finale. */
const ended = (forms: readonly string[], end: '.' | '?') =>
  forms.flatMap((f) => (end === '.' ? [f, `${f}.`] : [f, `${f}?`, `${f} ?`]));
/** Une erreur typique reste reconnue avec ou sans ponctuation. */
const endedTraps = (traps: readonly Trap[], end: '.' | '?'): Trap[] =>
  traps.flatMap((t) => ('text' in t ? ended([t.text], end).map((text) => ({ text, why: t.why })) : []));

/** « Tom = he » : quel pronom remplace le sujet. */
const who = (s: Subject) =>
  s.text.toLowerCase() === s.pronoun.toLowerCase()
    ? `Le sujet est « ${s.text} ».`
    : `« ${s.text} » peut se remplacer par « ${s.pronoun} ».`;

// ——— 1. be au présent ———
/** Fins de phrase valables pour toute personne, au singulier comme au pluriel. */
const STATES = ['at home', 'in the park', 'happy', 'tired', 'in London', 'ready', 'late', 'in the classroom'] as const;
const WHY_AM = '« am » ne va qu’avec I.';
const WHY_IS = '« is » va avec he, she, it (une seule personne ou chose).';
const WHY_ARE = '« are » va avec you, we, they (ou plusieurs personnes).';
const WHY_BARE = '« be » est le nom du verbe : après un sujet au présent, il faut am, is ou are.';
const WHY_FORM: Record<string, string> = { am: WHY_AM, is: WHY_IS, are: WHY_ARE, be: WHY_BARE };
const wrongBe = (s: Subject) => ['am', 'is', 'are'].filter((f) => f !== bePresentOf(s.pronoun));
const whyBeOf = (s: Subject) => WHY_FORM[bePresentOf(s.pronoun) === 'is' ? 'is' : 'are'] ?? WHY_BARE;
const beRule = (s: Subject) =>
  s.pronoun === 'I'
    ? 'Avec I, be devient am.'
    : isOne(s)
      ? 'Avec he, she, it, be devient is.'
      : 'Avec you, we, they, be devient are.';

function bePresentSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(PRONOUN_SUBJECTS);
  const end = rng.pick(STATES);
  const right = bePresentOf(s.pronoun);
  const { answer, traps } = choice(
    rng,
    right,
    wrongBe(s).map((f) => ({ label: f, why: WHY_FORM[f] ?? WHY_BARE })),
  );
  return {
    prompt: `Complète avec be au présent : « ${s.text} … ${end}. »`,
    answer,
    traps,
    hint: 'Regarde le pronom placé devant le trou : chaque pronom a sa forme de be.',
    steps: [who(s), beRule(s), `Réponse : **${s.text} ${right} ${end}.**`],
  };
}

function bePresentMatch(rng: Rng): QuestionDraft {
  const rows = [I, rng.pick(ONE), rng.pick(MANY)];
  const shown = rng.shuffle(rows);
  const ends = some(rng, STATES, 3);
  const left = shown.map((s, i) => `${s.text} … ${at(ends, i)}.`);
  const right = shuffledOther(
    rng,
    shown.map((s) => bePresentOf(s.pronoun)),
  );
  return {
    prompt: `Associe chaque phrase à la forme de be qui la complète : ${left.map((l) => `« ${l} »`).join(' ')}`,
    answer: { kind: 'match', left, right, pairs: shown.map((s) => right.indexOf(bePresentOf(s.pronoun))) },
    hint: 'Pour chaque phrase, remplace le sujet par un pronom : I, he, she ou they.',
    steps: [
      ...shown.map((s) => `${who(s)} ${beRule(s)}`),
      `Réponse : **${shown.map((s) => `${s.text} ${bePresentOf(s.pronoun)}`).join(', ')}**`,
    ],
  };
}

function bePresentWrite(rng: Rng): QuestionDraft {
  const s = rng.pick([...ONE, ...MANY]);
  const end = rng.pick(STATES);
  const right = bePresentOf(s.pronoun);
  return {
    prompt: `Écris la forme complète de be au présent : « ${s.text} … ${end}. »`,
    answer: { kind: 'text', accepted: [right] },
    traps: [...wrongBe(s), 'be'].map((text) => ({ text, why: WHY_FORM[text] ?? WHY_BARE })),
    hint: 'Le sujet est un nom : remplace-le par he, she ou they avant de choisir.',
    steps: [who(s), beRule(s), `Réponse : **${s.text} ${right} ${end}.**`],
  };
}

const CONTRACTED: Record<Pronoun, string> = {
  I: '’m',
  you: '’re',
  he: '’s',
  she: '’s',
  it: '’s',
  we: '’re',
  they: '’re',
};
/** Toutes les écritures justes de la phrase négative avec be. */
function beNegatives(s: Subject, end: string): string[] {
  const be = bePresentOf(s.pronoun);
  const out = [`${s.text} ${be} not ${end}`];
  if (be !== 'am') out.push(`${s.text} ${be}n’t ${end}`);
  // Forme courte collée au sujet : tous les pronoms, et les noms au singulier (« My mum’s… »).
  if (PRONOUN_SUBJECTS.includes(s) || isOne(s)) out.push(`${s.text}${CONTRACTED[s.pronoun]} not ${end}`);
  return out;
}
const WHY_BE_DO = 'Be se passe de don’t et doesn’t : on ajoute not après am, is ou are.';
const WHY_NOT_PLACE = 'Dans la négation, not se place après be, pas avant.';

function bePresentNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const end = rng.pick(STATES);
  const be = bePresentOf(s.pronoun);
  const accepted = beNegatives(s, end);
  const dont = isOne(s) ? 'doesn’t' : 'don’t';
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} ${be} ${end}. »`,
    answer: { kind: 'text', accepted: ended(accepted, '.') },
    traps: endedTraps(
      [
        { text: `${s.text} ${dont} be ${end}`, why: WHY_BE_DO },
        { text: `${s.text} not ${be} ${end}`, why: WHY_NOT_PLACE },
      ],
      '.',
    ),
    hint: 'Un seul petit mot à ajouter : cherche sa place par rapport à be.',
    steps: [
      'La phrase contient déjà be : il porte lui-même la négation.',
      'On place not juste après am, is ou are ; la forme courte est aussi juste.',
      `Réponse : **${at(accepted, 0)}.**`,
    ],
  };
}

function bePresentQuestion(rng: Rng): QuestionDraft {
  const s = rng.pick([YOU, ...PRONOUN_SUBJECTS.slice(2, 4), THEY, ...ONE, ...MANY]);
  const end = rng.pick(STATES);
  const be = bePresentOf(s.pronoun);
  const accepted = mids(s).map((m) => `${cap(be)} ${m} ${end}`);
  const aux = isOne(s) ? 'Does' : 'Do';
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} ${be} ${end}. »`,
    answer: { kind: 'text', accepted: ended(accepted, '?') },
    traps: endedTraps(
      mids(s).flatMap((m) => [
        { text: `${aux} ${m} be ${end}`, why: 'Avec be, la question se pose sans do ni does.' },
        { text: `${cap(at(wrongBe(s), 0))} ${m} ${end}`, why: whyBeOf(s) },
      ]),
      '?',
    ),
    hint: 'Aucun mot à ajouter : change seulement l’ordre de deux éléments.',
    steps: [
      'Avec be, on pose la question en changeant l’ordre : be passe devant le sujet.',
      `Réponse : **${at(accepted, 0)}?**`,
    ],
  };
}

const bePresentHard = (rng: Rng) => (rng.int(0, 1) === 0 ? bePresentNegative(rng) : bePresentQuestion(rng));

const GIRLS = ['Ana', 'Lisa', 'Yuna'] as const;
const BOYS = ['Tom', 'Emir', 'Paul'] as const;
interface Kid {
  readonly name: string;
  readonly pronoun: 'he' | 'she';
}
const pickKid = (rng: Rng): Kid =>
  rng.int(0, 1) === 0 ? { name: rng.pick(GIRLS), pronoun: 'she' } : { name: rng.pick(BOYS), pronoun: 'he' };
const person = (k: Kid) => (k.pronoun === 'he' ? 'ce garçon' : 'cette fille');
const NEGATED_BE = ['isn’t', 'is not', '’s not'];

const TOWNS = ['Leeds', 'York', 'Bristol', 'Oxford'] as const;
const FEELINGS = ['shy', 'sporty', 'noisy', 'tall'] as const;

function bePresentDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const town = rng.pick(TOWNS);
  const feeling = rng.pick(FEELINGS);
  const age = rng.pick(['ten', 'eleven', 'twelve'] as const);
  const He = cap(k.pronoun);
  const his = k.pronoun === 'he' ? 'His' : 'Her';
  return {
    prompt: `Lis le message ${de(k.name)}, puis présente ${person(k)} : be au présent (une fois à la forme négative), et « live » au présent simple.`,
    figure: {
      kind: 'document',
      title: `${k.name}’s message`,
      lines: [`Hi! I am ${k.name}. I am ${age}.`, `I am not ${feeling}.`, `My friends are funny. I live in ${town}.`],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [`${k.name} `, ` ${age}. ${He} `, ` ${feeling}. ${his} friends `, ` funny. ${He} `, ` in ${town}.`],
      blanks: [
        { mode: 'text', accepted: ['is'] },
        { mode: 'text', accepted: NEGATED_BE },
        { mode: 'text', accepted: ['are'] },
        { mode: 'text', accepted: ['lives'] },
      ],
    },
    hint: 'Le message dit I ; toi, tu parles d’une autre personne. Pour chaque trou, cherche d’abord le sujet.',
    steps: [
      `Tu parles ${de(k.name)} : une seule personne, donc la forme de be avec he ou she.`,
      '« I am not » devient la même négation à la 3e personne : not reste après be.',
      `« ${his} friends » = they : be se met au pluriel.`,
      '« live » n’est pas be : au présent simple, avec he ou she, il prend -s.',
      'Réponse : **is, isn’t, are, lives**',
    ],
  };
}

const bePresent: Skill = {
  id: 'a6-be-present',
  title: 'Be au présent',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Be** veut dire « être » : I **am** ; he, she, it **is** ; you, we, they **are**.',
      'La **négation** : not après be (She isn’t a teacher). La question : be devant le **sujet** (Are you ready?).',
      'À l’oral, la **contraction** raccourcit : I’m, you’re, she’s.',
    ],
    source: source('auxiliaire be au présent', 'LearnEnglish Kids, « Present simple, verb to be »'),
    sources: ['anglais-college-2025', 'bck-present-be', 'bc-questions-negatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return bePresentSpot(rng);
    if (level === 2) return bePresentMatch(rng);
    if (level === 3) return bePresentWrite(rng);
    if (level === 4) return bePresentHard(rng);
    return bePresentDocument(rng);
  },
};

// ——— 2. have ———
/** Choses au singulier : chaque phrase a une négation et une question régulières. */
const THINGS = [
  'a dog',
  'a new bike',
  'a sister',
  'a brother',
  'a pet rabbit',
  'a computer',
  'a blue bag',
  'a big garden',
] as const;
const WHY_HAVE = '« have » va avec I, you, we, they (ou plusieurs personnes).';
const WHY_HAS = '« has » va avec he, she, it (une seule personne ou chose).';
const whyHave = (s: Subject) => (haveOf(s.pronoun) === 'has' ? WHY_HAS : WHY_HAVE);
const otherHave = (s: Subject) => (haveOf(s.pronoun) === 'has' ? 'have' : 'has');
const WHY_NOT_BE = 'Pour dire « avoir », on prend have ou has, pas be (am, is, are).';
const WHY_GOT = 'Avec got, il faut toujours have ou has devant.';

function haveSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(PRONOUN_SUBJECTS);
  const thing = rng.pick(THINGS);
  const right = haveOf(s.pronoun);
  const { answer, traps } = choice(rng, right, [
    { label: otherHave(s), why: whyHave(s) },
    { label: bePresentOf(s.pronoun), why: WHY_NOT_BE },
  ]);
  return {
    prompt: `Complète avec « avoir » : « ${s.text} … ${thing}. »`,
    answer,
    traps,
    hint: 'Il s’agit du verbe « avoir » : regarde le pronom devant le trou.',
    steps: [who(s), whyHave(s), `Réponse : **${s.text} ${right} ${thing}.**`],
  };
}

function haveRecognise(rng: Rng): QuestionDraft {
  const s = rng.pick([...ONE, ...MANY, ...PRONOUN_SUBJECTS]);
  const thing = rng.pick(THINGS);
  const has = haveOf(s.pronoun);
  const good = `${s.text} ${has} got ${thing}.`;
  const { answer, traps } = choice(rng, good, [
    { label: `${s.text} ${otherHave(s)} got ${thing}.`, why: whyHave(s) },
    { label: `${s.text} ${bePresentOf(s.pronoun)} got ${thing}.`, why: WHY_NOT_BE },
    { label: `${s.text} got ${has} ${thing}.`, why: 'L’ordre est : sujet, have ou has, puis got.' },
  ]);
  return {
    prompt: `Avec « ${s.text} » et « ${thing} », quelle phrase avec « got » est juste ?`,
    answer,
    traps,
    hint: 'Deux contrôles : le verbe placé avant got, puis son accord avec le sujet.',
    steps: [who(s), whyHave(s), `Réponse : **${good}**`],
  };
}

function haveWrite(rng: Rng): QuestionDraft {
  const s = rng.pick([...ONE, ...MANY]);
  const thing = rng.pick(THINGS);
  const right = haveOf(s.pronoun);
  return {
    prompt: `Écris la forme du verbe « have » au présent : « ${s.text} … ${thing}. »`,
    answer: { kind: 'text', accepted: [right, `${right} got`] },
    traps: [
      { text: otherHave(s), why: whyHave(s) },
      { text: bePresentOf(s.pronoun), why: WHY_NOT_BE },
      { text: 'got', why: WHY_GOT },
      { text: 'haves', why: 'La 3e personne de have est irrégulière : on n’ajoute pas -s à have.' },
    ],
    hint: 'Remplace le nom par he, she ou they, puis choisis la forme de « avoir ».',
    steps: [who(s), whyHave(s), `Réponse : **${s.text} ${right} ${thing}.**`],
  };
}

/** Négations justes : avec do ou does (le plus courant), avec got, et la forme sans do. */
function haveNegatives(s: Subject, thing: string): string[] {
  const has = haveOf(s.pronoun);
  const aux = has === 'has' ? 'does' : 'do';
  const bare = thing.replace(/^a /, '');
  const heads = [`${s.text} ${aux}n’t have`, `${s.text} ${aux} not have`];
  heads.push(`${s.text} ${has}n’t got`, `${s.text} ${has} not got`, `${s.text} ${has}n’t`, `${s.text} ${has} not`);
  if (PRONOUN_SUBJECTS.includes(s) || isOne(s)) heads.push(`${s.text}${has === 'has' ? '’s' : '’ve'} not got`);
  const none = [`${s.text} ${has} no ${bare}`, `${s.text} ${has} got no ${bare}`];
  if (PRONOUN_SUBJECTS.includes(s) || isOne(s)) none.push(`${s.text}${has === 'has' ? '’s' : '’ve'} got no ${bare}`);
  return [...heads.map((h) => `${h} ${thing}`), ...none];
}

function haveNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const thing = rng.pick(THINGS);
  const has = haveOf(s.pronoun);
  const aux = has === 'has' ? 'doesn’t' : 'don’t';
  const accepted = haveNegatives(s, thing);
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} ${has} ${thing}. »`,
    answer: { kind: 'text', accepted: ended(accepted, '.') },
    traps: endedTraps(
      [
        {
          text: `${s.text} ${aux} has ${thing}`,
          why: 'Après don’t ou doesn’t, on revient à « have », la base verbale.',
        },
        {
          text: `${s.text} ${has === 'has' ? 'don’t' : 'doesn’t'} have ${thing}`,
          why: '« don’t » va avec I, you, we, they ; « doesn’t » avec he, she, it.',
        },
        { text: `${s.text} ${bePresentOf(s.pronoun)} not ${thing}`, why: WHY_NOT_BE },
      ],
      '.',
    ),
    hint: 'Deux constructions sont possibles : avec un auxiliaire devant le verbe, ou avec got.',
    steps: [
      who(s),
      `Le plus courant : ${aux}, puis la base verbale have. Avec got, on place not après ${has}.`,
      `Réponse : **${at(accepted, 0)}.**`,
    ],
  };
}

function haveQuestion(rng: Rng): QuestionDraft {
  const s = rng.pick([YOU, ...PRONOUN_SUBJECTS.slice(2, 4), THEY, ...ONE, ...MANY]);
  const thing = rng.pick(THINGS);
  const has = haveOf(s.pronoun);
  const aux = has === 'has' ? 'Does' : 'Do';
  const accepted = mids(s).flatMap((m) => [
    `${aux} ${m} have ${thing}`,
    `${cap(has)} ${m} got ${thing}`,
    `${cap(has)} ${m} ${thing}`,
  ]);
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} ${has} ${thing}. »`,
    answer: { kind: 'text', accepted: ended(accepted, '?') },
    traps: endedTraps(
      mids(s).flatMap((m) => [
        { text: `${aux} ${m} has ${thing}`, why: 'Après do ou does, on revient à « have », la base verbale.' },
        {
          text: `${aux === 'Do' ? 'Does' : 'Do'} ${m} have ${thing}`,
          why: '« Does » va avec he, she, it ; « Do » avec les autres.',
        },
        { text: `${cap(bePresentOf(s.pronoun))} ${m} ${thing}`, why: WHY_NOT_BE },
      ]),
      '?',
    ),
    hint: 'Deux débuts possibles : un auxiliaire accordé avec le sujet, ou le verbe « avoir », avec got après le sujet.',
    steps: [
      who(s),
      `Le plus courant : ${aux}, le sujet, puis have. Avec got : ${cap(has)}, le sujet, puis got.`,
      `Réponse : **${at(accepted, 0)}?**`,
    ],
  };
}

const haveHard = (rng: Rng) => (rng.int(0, 1) === 0 ? haveNegative(rng) : haveQuestion(rng));

const PETS = ['rabbit', 'dog', 'cat', 'hamster'] as const;

function haveDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [yes, no] = some(rng, PETS, 2) as [string, string];
  const He = cap(k.pronoun);
  return {
    prompt: `Lis le message ${de(k.name)}, puis présente ${person(k)} : « have » (une fois à la forme négative, avec got), puis « feed » (nourrir) au présent simple.`,
    figure: {
      kind: 'document',
      title: `${k.name}’s pets`,
      lines: [`I have got a ${yes}.`, `I haven’t got a ${no}.`, `I feed my ${yes} every day.`],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [`${k.name} `, ` got a ${yes}. ${He} `, ` got a ${no}. ${He} `, ` the ${yes} every day.`],
      blanks: [
        { mode: 'text', accepted: ['has'] },
        { mode: 'text', accepted: ['hasn’t', 'has not', '’s not'] },
        { mode: 'text', accepted: ['feeds'] },
      ],
    },
    hint: 'Le message dit I ; toi, tu parles d’une autre personne : les verbes changent de forme.',
    steps: [
      `Tu parles ${de(k.name)} : 3e personne du singulier.`,
      '« I have got » et « I haven’t got » changent de verbe devant got ; got ne change pas.',
      '« feed » est au présent simple : avec he ou she, il prend -s.',
      'Réponse : **has, hasn’t, feeds**',
    ],
  };
}

const have: Skill = {
  id: 'a6-have',
  title: 'Have et has : avoir',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Have** veut dire « avoir » : I, you, we, they have ; he, she, it **has**.',
      '**Have got** veut souvent dire la même chose : She has got a bike = She has a bike.',
      'La négation : She doesn’t have… ou She hasn’t got… La question : Does she have…? ou Has she got…?',
    ],
    source: source('auxiliaire have au présent', '« have got » et « Questions and negatives »'),
    sources: ['anglais-college-2025', 'bck-have-got', 'bc-have-got', 'bc-questions-negatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return haveSpot(rng);
    if (level === 2) return haveRecognise(rng);
    if (level === 3) return haveWrite(rng);
    if (level === 4) return haveHard(rng);
    return haveDocument(rng);
  },
};

// ——— 3. was / were ———
const PAST_TIMES = ['yesterday', 'last week', 'last Saturday'] as const;
const PAST_ENDS = [
  'at home',
  'in the park',
  'happy',
  'tired',
  'in London',
  'late',
  'at school',
  'at the beach',
] as const;
const WHY_WAS = '« was » va avec I, he, she, it (une seule personne ou chose).';
const WHY_WERE = '« were » va avec you, we, they (ou plusieurs personnes).';
const WHY_PRESENT = 'Le moment est passé : am, is et are sont au présent, il faut le prétérit.';
const whyPast = (s: Subject) => (bePastOf(s.pronoun) === 'was' ? WHY_WAS : WHY_WERE);
const otherPast = (s: Subject) => (bePastOf(s.pronoun) === 'was' ? 'were' : 'was');

function pastSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(PRONOUN_SUBJECTS);
  const end = rng.pick(PAST_ENDS);
  const time = rng.pick(PAST_TIMES);
  const right = bePastOf(s.pronoun);
  const { answer, traps } = choice(rng, right, [
    { label: otherPast(s), why: whyPast(s) },
    { label: bePresentOf(s.pronoun), why: WHY_PRESENT },
  ]);
  return {
    prompt: `Complète au passé : « ${s.text} … ${end} ${time}. »`,
    answer,
    traps,
    hint: 'Repère le moment à la fin de la phrase, puis le pronom au début.',
    steps: [`« ${time} » : on parle du passé.`, whyPast(s), `Réponse : **${s.text} ${right} ${end} ${time}.**`],
  };
}

function pastRecognise(rng: Rng): QuestionDraft {
  const s = rng.pick([...ONE, ...MANY, ...PRONOUN_SUBJECTS]);
  const end = rng.pick(PAST_ENDS);
  const time = rng.pick(PAST_TIMES);
  const say = (form: string) => `${s.text} ${form} ${end} ${time}.`;
  const good = say(bePastOf(s.pronoun));
  const { answer, traps } = choice(rng, good, [
    { label: say(otherPast(s)), why: whyPast(s) },
    { label: say(bePresentOf(s.pronoun)), why: WHY_PRESENT },
    { label: say('be'), why: 'Après le sujet, « be » doit être conjugué.' },
  ]);
  return {
    prompt: `Quelle phrase raconte correctement le passé avec « ${s.text} » (${time}) ?`,
    answer,
    traps,
    hint: 'La bonne phrase a un verbe au passé, accordé avec le sujet.',
    steps: [who(s), whyPast(s), `Réponse : **${good}**`],
  };
}

function pastWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const end = rng.pick(PAST_ENDS);
  const time = rng.pick(PAST_TIMES);
  const right = bePastOf(s.pronoun);
  return {
    prompt: `Écris be au prétérit : « ${s.text} … ${end} ${time}. »`,
    answer: { kind: 'text', accepted: [right] },
    traps: [
      { text: otherPast(s), why: whyPast(s) },
      { text: bePresentOf(s.pronoun), why: WHY_PRESENT },
    ],
    hint: 'Deux formes existent au passé : le choix dépend du sujet.',
    steps: [who(s), whyPast(s), `Réponse : **${s.text} ${right} ${end} ${time}.**`],
  };
}

function pastNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const end = rng.pick(PAST_ENDS);
  const time = rng.pick(PAST_TIMES);
  const be = bePastOf(s.pronoun);
  const accepted = [`${s.text} ${be}n’t ${end} ${time}`, `${s.text} ${be} not ${end} ${time}`];
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} ${be} ${end} ${time}. »`,
    answer: { kind: 'text', accepted: ended(accepted, '.') },
    traps: endedTraps(
      [
        { text: `${s.text} didn’t be ${end} ${time}`, why: 'Be se passe de did : on ajoute not après was ou were.' },
        { text: `${s.text} ${otherPast(s)}n’t ${end} ${time}`, why: whyPast(s) },
        { text: `${s.text} not ${be} ${end} ${time}`, why: WHY_NOT_PLACE },
      ],
      '.',
    ),
    hint: 'Garde le même temps : un seul petit mot à ajouter, au bon endroit.',
    steps: [
      'Be porte lui-même la négation, au passé comme au présent.',
      'On place not après was ou were ; la forme courte est aussi juste.',
      `Réponse : **${at(accepted, 0)}.**`,
    ],
  };
}

function pastQuestion(rng: Rng): QuestionDraft {
  const s = rng.pick([YOU, ...PRONOUN_SUBJECTS.slice(2, 4), THEY, ...ONE, ...MANY]);
  const end = rng.pick(PAST_ENDS);
  const time = rng.pick(PAST_TIMES);
  const be = bePastOf(s.pronoun);
  const accepted = mids(s).map((m) => `${cap(be)} ${m} ${end} ${time}`);
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} ${be} ${end} ${time}. »`,
    answer: { kind: 'text', accepted: ended(accepted, '?') },
    traps: endedTraps(
      mids(s).flatMap((m) => [
        { text: `Did ${m} be ${end} ${time}`, why: 'Avec be, la question se pose sans did.' },
        { text: `${cap(otherPast(s))} ${m} ${end} ${time}`, why: whyPast(s) },
      ]),
      '?',
    ),
    hint: 'Aucun mot à ajouter : change l’ordre du sujet et du verbe.',
    steps: ['Au passé aussi, be passe devant le sujet pour poser la question.', `Réponse : **${at(accepted, 0)}?**`],
  };
}

const pastHard = (rng: Rng) => (rng.int(0, 1) === 0 ? pastNegative(rng) : pastQuestion(rng));

const CITIES = ['London', 'Dublin', 'Glasgow', 'Cardiff'] as const;

function pastDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const city = rng.pick(CITIES);
  const feeling = rng.pick(['bored', 'sad', 'cold'] as const);
  const He = cap(k.pronoun);
  const his = k.pronoun === 'he' ? 'His' : 'Her';
  return {
    prompt: `Lis le journal ${de(k.name)} (écrit hier soir et aujourd’hui), puis raconte avec be : attention au moment de chaque phrase.`,
    figure: {
      kind: 'document',
      title: `${k.name}’s diary`,
      lines: [
        `Monday: I am in ${city} with my cousins. We are happy.`,
        `I am not ${feeling}.`,
        'Tuesday: I am at home. My cousins are at school.',
      ],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `Today is Tuesday. Yesterday, ${k.name} `,
        ` in ${city}. ${his} cousins `,
        ` with ${k.pronoun === 'he' ? 'him' : 'her'}. ${He} `,
        ` ${feeling}. Today, ${k.pronoun} `,
        ' at home.',
      ],
      blanks: [
        { mode: 'text', accepted: ['was'] },
        { mode: 'text', accepted: ['were'] },
        { mode: 'text', accepted: ['wasn’t', 'was not'] },
        { mode: 'text', accepted: ['is'] },
      ],
    },
    hint: 'Pour chaque trou : quel jour ? puis quel sujet ? Un des trous reprend une phrase avec « not ».',
    steps: [
      'Nous sommes mardi : ce qui date de lundi se raconte au prétérit.',
      `${k.name} est une seule personne ; « ${his} cousins » en désigne plusieurs.`,
      '« I am not » raconté au passé garde sa négation.',
      'La dernière phrase parle d’aujourd’hui : be reste au présent.',
      'Réponse : **was, were, wasn’t, is**',
    ],
  };
}

const past: Skill = {
  id: 'a6-be-preterit',
  title: 'Was et were : be au passé',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Le **prétérit** de be raconte le passé : I, he, she, it **was** ; you, we, they **were**.',
      'La **négation** : wasn’t, weren’t. La question : Was ou Were devant le **sujet** (Were you tired?).',
    ],
    source: source('(A1+) was / were', 'LearnEnglish Kids, « Past simple, verb to be »'),
    sources: ['anglais-college-2025', 'bck-past-be', 'bc-questions-negatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return pastSpot(rng);
    if (level === 2) return pastRecognise(rng);
    if (level === 3) return pastWrite(rng);
    if (level === 4) return pastHard(rng);
    return pastDocument(rng);
  },
};

// ——— 4. There was / There were ———
interface Place {
  readonly one: string;
  readonly many: string;
  readonly where: string;
}
const thing = (one: string, many: string, where: string): Place => ({ one, many, where });
const PLACES: readonly Place[] = [
  thing('park', 'parks', 'in the town'),
  thing('shop', 'shops', 'in the street'),
  thing('dog', 'dogs', 'in the garden'),
  thing('chair', 'chairs', 'in the room'),
  thing('boat', 'boats', 'on the lake'),
  thing('cinema', 'cinemas', 'near the station'),
  thing('poster', 'posters', 'on the wall'),
];
const NUMBERS = ['two', 'three', 'four', 'five'] as const;
const WHY_THERE_WAS = '« there was » annonce une seule chose.';
const WHY_THERE_WERE = '« there were » annonce plusieurs choses.';
const whyThere = (plural: boolean) => (plural ? WHY_THERE_WERE : WHY_THERE_WAS);
const wasFor = (plural: boolean) => (plural ? 'were' : 'was');
const isFor = (plural: boolean) => (plural ? 'are' : 'is');
const group = (rng: Rng, p: Place, plural: boolean) => (plural ? `${rng.pick(NUMBERS)} ${p.many}` : `a ${p.one}`);

function thereSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(PLACES);
  const plural = rng.int(0, 1) === 0;
  const what = group(rng, p, plural);
  const right = wasFor(plural);
  const { answer, traps } = choice(rng, right, [
    { label: wasFor(!plural), why: whyThere(plural) },
    { label: isFor(plural), why: WHY_PRESENT },
  ]);
  return {
    prompt: `Complète au passé : « Yesterday, there … ${what} ${p.where}. »`,
    answer,
    traps,
    hint: 'Regarde ce qui suit le trou : combien de choses ? Et le moment au début de la phrase ?',
    steps: [
      '« Yesterday » : on parle du passé.',
      whyThere(plural),
      `Réponse : **Yesterday, there ${right} ${what} ${p.where}.**`,
    ],
  };
}

function thereMatch(rng: Rng): QuestionDraft {
  const kinds = some(
    rng,
    [
      { past: false, plural: false },
      { past: false, plural: true },
      { past: true, plural: false },
      { past: true, plural: true },
    ],
    3,
  );
  const places = some(rng, PLACES, 3);
  const rows = kinds.map((k, i) => {
    const p = at(places, i);
    const verb = k.past ? wasFor(k.plural) : isFor(k.plural);
    return {
      left: `… ${group(rng, p, k.plural)} ${p.where} ${k.past ? 'yesterday' : 'now'}.`,
      right: `There ${verb}`,
    };
  });
  const left = rows.map((r) => r.left);
  const right = shuffledOther(
    rng,
    rows.map((r) => r.right),
  );
  return {
    prompt: `Associe chaque fin de phrase à son début : ${left.map((l) => `« ${l} »`).join(' ')}`,
    answer: { kind: 'match', left, right, pairs: rows.map((r) => right.indexOf(r.right)) },
    hint: 'Pour chaque ligne, pose deux questions : maintenant ou hier ? une seule chose ou plusieurs ?',
    steps: [
      '« now » appelle le présent (there is, there are) ; « yesterday » le passé (there was, there were).',
      'Une seule chose : is ou was. Plusieurs : are ou were.',
      `Réponse : **${rows.map((r) => `${r.right} ${r.left.replace('… ', '')}`).join(' ')}**`,
    ],
  };
}

function thereWrite(rng: Rng): QuestionDraft {
  const p = rng.pick(PLACES);
  const plural = rng.int(0, 1) === 0;
  const what = group(rng, p, plural);
  const time = rng.pick(['Yesterday', 'Last week', 'Last Sunday'] as const);
  const right = wasFor(plural);
  return {
    prompt: `Écris le verbe be qui convient : « ${time}, there … ${what} ${p.where}. »`,
    answer: { kind: 'text', accepted: [right] },
    traps: [
      { text: wasFor(!plural), why: whyThere(plural) },
      { text: isFor(plural), why: WHY_PRESENT },
    ],
    hint: 'Le moment indique le temps ; le nom qui suit indique le nombre.',
    steps: [`« ${time} » : le passé.`, whyThere(plural), `Réponse : **${time}, there ${right} ${what} ${p.where}.**`],
  };
}

function thereTransform(rng: Rng): QuestionDraft {
  const p = rng.pick(PLACES);
  const plural = rng.int(0, 1) === 0;
  const be = wasFor(plural);
  const start = `there ${be} ${plural ? 'some' : 'a'} ${plural ? p.many : p.one} ${p.where}`;
  const statement = `${cap(start)}.`;
  if (rng.int(0, 1) === 0) {
    const any = plural ? `any ${p.many}` : `a ${p.one}`;
    const accepted = [
      `There ${be}n’t ${any} ${p.where}`,
      `There ${be} not ${any} ${p.where}`,
      `There ${be} no ${plural ? p.many : p.one} ${p.where}`,
      // Pluriel sans déterminant : correct aussi, même si « any » est la forme attendue.
      ...(plural ? [`There ${be}n’t ${p.many} ${p.where}`, `There ${be} not ${p.many} ${p.where}`] : []),
    ];
    return {
      prompt: `Écris toute la phrase à la forme négative : « ${statement} »`,
      answer: { kind: 'text', accepted: ended(accepted, '.') },
      traps: endedTraps(
        [
          { text: `There ${wasFor(!plural)}n’t ${any} ${p.where}`, why: whyThere(plural) },
          { text: `There didn’t be ${any} ${p.where}`, why: 'Be se passe de did : on ajoute not après was ou were.' },
          ...(plural
            ? [{ text: `There weren’t some ${p.many} ${p.where}`, why: 'Dans la négation, « some » devient « any ».' }]
            : []),
        ],
        '.',
      ),
      hint: 'Ajoute la négation après be. Vérifie aussi le petit mot placé devant le nom.',
      steps: [
        'On place not après was ou were.',
        plural ? 'Au pluriel, « some » devient « any » dans la négation.' : 'Au singulier, on garde « a ».',
        `Réponse : **${at(accepted, 0)}.**`,
      ],
    };
  }
  const accepted = (plural ? [`any ${p.many}`, `some ${p.many}`, p.many] : [`a ${p.one}`]).map(
    (group) => `${cap(be)} there ${group} ${p.where}`,
  );
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${statement} »`,
    answer: { kind: 'text', accepted: ended(accepted, '?') },
    traps: endedTraps(
      [
        {
          text: `${cap(wasFor(!plural))} there ${plural ? `any ${p.many}` : `a ${p.one}`} ${p.where}`,
          why: whyThere(plural),
        },
        { text: `Did there be ${plural ? `any ${p.many}` : `a ${p.one}`} ${p.where}`, why: 'Avec be, pas de did.' },
      ],
      '?',
    ),
    hint: 'Change l’ordre des deux premiers mots. Dans une question, regarde aussi le mot devant le nom.',
    steps: [
      'La question place was ou were devant there.',
      plural ? 'Au pluriel, on emploie d’habitude « any » dans la question.' : 'Au singulier, on garde « a ».',
      `Réponse : **${at(accepted, 0)}?**`,
    ],
  };
}

function thereDocument(rng: Rng): QuestionDraft {
  const [one, many, none] = some(rng, PLACES.slice(0, 2).concat(PLACES.slice(5, 6)), 3) as [Place, Place, Place];
  const n = rng.pick(NUMBERS);
  const year = rng.pick(['1990', '2000', '2010'] as const);
  return {
    prompt: `Lis le dépliant sur ${year} et aujourd’hui, puis complète le texte avec be (une fois à la forme négative).`,
    figure: {
      kind: 'document',
      title: 'Our town',
      lines: [`${year}: one ${one.one}, ${n} ${many.many}, no ${none.one}.`, `Today: one ${none.one}.`],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `In ${year}, there `,
        ` a ${one.one}. There `,
        ` ${n} ${many.many}. There `,
        ` a ${none.one}. Today, there `,
        ` a ${none.one}.`,
      ],
      blanks: [
        { mode: 'text', accepted: ['was'] },
        { mode: 'text', accepted: ['were'] },
        { mode: 'text', accepted: ['wasn’t', 'was not'] },
        { mode: 'text', accepted: ['is'] },
      ],
    },
    hint: 'Pour chaque trou : quelle année ? combien ? Le mot « no » du dépliant devient une négation du verbe.',
    steps: [
      `${year} est passé : there was pour une chose, there were pour plusieurs.`,
      `« no ${none.one} » : il n’y en avait pas, on met be à la forme négative.`,
      '« Today » : le présent, avec there is pour une seule chose.',
      'Réponse : **was, were, wasn’t, is**',
    ],
  };
}

const thereWas: Skill = {
  id: 'a6-there-was-were',
  title: 'There was et there were',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**There was** et **there were** veulent dire « il y avait » : there was a park, there were two shops.',
      'L’**accord** : was devant une seule chose, were devant plusieurs. Au présent (« il y a ») : **there is**, **there are**.',
      'La **négation** : There wasn’t a park, there weren’t any shops. La question : Was there a park?',
    ],
    source: source(
      'accord there is / there are et (A1+) was / were',
      '« Using there is and there are » et « it and there as dummy subjects »',
    ),
    sources: ['anglais-college-2025', 'bc-there-is', 'bc-there-dummy', 'bck-past-be'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return thereSpot(rng);
    if (level === 2) return thereMatch(rng);
    if (level === 3) return thereWrite(rng);
    if (level === 4) return thereTransform(rng);
    return thereDocument(rng);
  },
};

export const ENGLISH_BE_HAVE_CHAPTER: Chapter = {
  id: 'a6-be-preterit',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Be et have',
  skills: [bePresent, have, past, thereWas],
};
