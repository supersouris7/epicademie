import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, de, shuffledOther, some } from './temps.ts';

/**
 * Anglais 6e — « Modaux et impératif » (lot an-6e-03, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) ; règles et formes : British Council (voir modaux-imperatif-faits.ts : chaque fait y porte sa source
 * et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Règles : British Council, ${pages}.`;
const ABOUT = 'Écrit pour l’exercice.';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const coin = (rng: Rng) => rng.int(0, 1) === 0;
const quoted = (list: readonly string[]) => list.map((l) => `« ${l} »`).join(' ');
/** Saisies acceptées : avec ou sans ponctuation finale. */
const ended = (forms: readonly string[], marks: readonly string[] = ['.']) =>
  forms.flatMap((f) => [f, ...marks.flatMap((m) => [`${f}${m}`, `${f} ${m}`])]);
/** Une erreur typique reste reconnue avec ou sans ponctuation. */
const endedTraps = (traps: readonly Trap[], marks: readonly string[] = ['.']): Trap[] =>
  traps.flatMap((t) => ('text' in t ? ended([t.text], marks).map((text) => ({ text, why: t.why })) : []));
const ORDER_MARKS = ['!', '.'] as const;

/** Association : phrases à gauche, réponses mélangées à droite. */
function pairs(rng: Rng, rows: readonly (readonly [string, string])[]) {
  const left = rows.map((r) => r[0]);
  const right = shuffledOther(
    rng,
    rows.map((r) => r[1]),
  );
  return { kind: 'match' as const, left, right, pairs: rows.map((r) => right.indexOf(r[1])) };
}

interface Subject {
  /** En début de phrase. */
  readonly text: string;
  /** Au milieu d'une phrase (question). */
  readonly mid: string;
  readonly fr: string;
}
const subject = (text: string, fr: string, mid = text): Subject => ({ text, mid, fr });
/** Une seule personne : le piège du -s est possible. */
const ONE: readonly Subject[] = [
  subject('Tom', 'Tom'),
  subject('Lisa', 'Lisa'),
  subject('My brother', 'Mon frère', 'my brother'),
  subject('My sister', 'Ma sœur', 'my sister'),
];
/** « My brother… » : une question posée à la personne qui parle (« your brother ») est aussi correcte. */
const mids = (s: Subject): readonly string[] =>
  s.mid.startsWith('my ') ? [s.mid, s.mid.replace('my ', 'your ')] : [s.mid];

// ——— 1. can / can’t ———
interface Ability {
  readonly base: string;
  /** 3e personne du singulier (erreur typique après un auxiliaire). */
  readonly s: string;
  readonly fr: string;
}
const ability = (base: string, s: string, fr: string): Ability => ({ base, s, fr });
const ABILITIES: readonly Ability[] = [
  ability('swim', 'swims', 'nager'),
  ability('cook', 'cooks', 'cuisiner'),
  ability('dance', 'dances', 'danser'),
  ability('sing', 'sings', 'chanter'),
  ability('skate', 'skates', 'patiner'),
  ability('draw', 'draws', 'dessiner'),
  ability('ride a bike', 'rides a bike', 'faire du vélo'),
  ability('play the guitar', 'plays the guitar', 'jouer de la guitare'),
  ability('speak Spanish', 'speaks Spanish', 'parler espagnol'),
];

const WHY_CAN_S = 'can ne prend jamais de -s, même avec he ou she.';
const WHY_CAN_BASE = 'Après can ou can’t, le verbe reste à la base verbale : sans to et sans -s.';
const WHY_CAN_DO = 'can se passe de do et does : il porte lui-même la négation et la question.';
const WHY_CAN_YES = 'La phrase française dit « sait » : la personne en est capable, il faut can.';
const WHY_CAN_NO = 'La phrase française dit « ne sait pas » : il faut la forme négative, can’t.';
const knows = (s: Subject, a: Ability, yes: boolean) => `${s.fr} ${yes ? 'sait' : 'ne sait pas'} ${a.fr}.`;
const modal = (yes: boolean) => (yes ? 'can' : 'can’t');
const canStep = (yes: boolean) =>
  yes
    ? 'On dit que la personne sait faire : on emploie can.'
    : 'On dit que la personne ne sait pas faire : on emploie can’t (ou cannot).';

function canSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(ONE);
  const a = rng.pick(ABILITIES);
  const yes = coin(rng);
  const { answer, traps } = choice(rng, modal(yes), [
    { label: modal(!yes), why: yes ? WHY_CAN_YES : WHY_CAN_NO },
    { label: 'cans', why: WHY_CAN_S },
  ]);
  return {
    prompt: `Complète : « ${s.text} … ${a.base}. » (${knows(s, a, yes)})`,
    answer,
    traps,
    hint: 'Lis la phrase française : la personne sait-elle le faire, ou non ?',
    steps: [canStep(yes), WHY_CAN_S, `Réponse : **${s.text} ${modal(yes)} ${a.base}.**`],
  };
}

function canSentence(rng: Rng): QuestionDraft {
  const s = rng.pick(ONE);
  const a = rng.pick(ABILITIES);
  const yes = coin(rng);
  const say = (verb: string) => `${s.text} ${verb}.`;
  const good = say(`${modal(yes)} ${a.base}`);
  const { answer, traps } = choice(rng, good, [
    { label: say(`${modal(!yes)} ${a.base}`), why: yes ? WHY_CAN_YES : WHY_CAN_NO },
    { label: say(`${modal(yes)} to ${a.base}`), why: WHY_CAN_BASE },
    { label: say(`${modal(yes)} ${a.s}`), why: WHY_CAN_BASE },
  ]);
  return {
    prompt: `Quelle phrase anglaise veut dire « ${knows(s, a, yes)} » ?`,
    answer,
    traps,
    hint: 'Vérifie deux choses : le sens (oui ou non), puis la forme du verbe qui suit.',
    steps: [canStep(yes), WHY_CAN_BASE, `Réponse : **${good}**`],
  };
}

type Use = 'ability' | 'ask' | 'allow' | 'forbid';
const USES: Readonly<Record<Use, { readonly label: string; readonly lines: readonly string[] }>> = {
  ability: {
    label: 'parler de ce qu’on sait faire',
    lines: ['I can swim.', 'She can speak English.', 'They can play the guitar.'],
  },
  ask: {
    label: 'demander une autorisation',
    lines: ['Can I open the window, please?', 'Can I ask a question, please?', 'Can we go home now?'],
  },
  allow: {
    label: 'donner une autorisation',
    lines: ['OK, you can go home now.', 'Yes, you can use my pen.', 'You can take photos in this room.'],
  },
  forbid: {
    label: 'interdire',
    lines: ['You can’t feed the animals here.', 'No, you can’t go home yet.', 'Sorry, you can’t park here.'],
  },
};

function canUses(rng: Rng): QuestionDraft {
  const uses = some(rng, Object.keys(USES) as Use[], 3);
  const rows = uses.map((u) => [rng.pick(USES[u].lines), USES[u].label] as const);
  return {
    prompt: `Associe chaque phrase à ce qu’elle sert à faire : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Cherche des indices : une question, un « you » à qui l’on répond, ou un talent ? Repère aussi la négation.',
    steps: [
      'can sert à parler d’une capacité, mais aussi à demander ou donner une autorisation ; can’t peut interdire.',
      ...rows.map(([line, use]) => `« ${line} » sert à ${use}.`),
      `Réponse : **${rows.map(([line, use]) => `${line} = ${use}`).join(' ; ')}**`,
    ],
  };
}

const canRecognise = (rng: Rng) => (coin(rng) ? canSentence(rng) : canUses(rng));

/** can’t et cannot sont les deux écritures justes de la négation. */
const canForms = (yes: boolean) => (yes ? ['can'] : ['can’t', 'cannot']);

function canWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(ONE);
  const a = rng.pick(ABILITIES);
  const yes = coin(rng);
  const accepted = canForms(yes).map((m) => `${m} ${a.base}`);
  return {
    prompt: `Écris la fin de la phrase avec can ou can’t : « ${s.text} … . » (${knows(s, a, yes)}) Verbe utile : to ${a.base} = ${a.fr}.`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${modal(!yes)} ${a.base}`, why: yes ? WHY_CAN_YES : WHY_CAN_NO },
      { text: `${modal(yes)} to ${a.base}`, why: WHY_CAN_BASE },
      { text: `${modal(yes)} ${a.s}`, why: WHY_CAN_BASE },
      yes ? { text: `cans ${a.base}`, why: WHY_CAN_S } : { text: `doesn’t can ${a.base}`, why: WHY_CAN_DO },
    ]),
    hint: 'D’abord le petit mot qui dit « sait » ou « ne sait pas », puis le verbe sans rien lui ajouter.',
    steps: [canStep(yes), WHY_CAN_BASE, `Réponse : **${s.text} ${at(accepted, 0)}.**`],
  };
}

const ASKED: readonly Subject[] = [
  subject('You', '', 'you'),
  subject('He', '', 'he'),
  subject('She', '', 'she'),
  subject('They', '', 'they'),
  ...ONE,
];

function canNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKED);
  const a = rng.pick(ABILITIES);
  const accepted = [`${s.text} can’t ${a.base}`, `${s.text} cannot ${a.base}`];
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} can ${a.base}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${s.text} doesn’t can ${a.base}`, why: WHY_CAN_DO },
      { text: `${s.text} don’t can ${a.base}`, why: WHY_CAN_DO },
      { text: `${s.text} not can ${a.base}`, why: 'La négation se colle après can : can’t ou cannot.' },
      { text: `${s.text} can’t to ${a.base}`, why: WHY_CAN_BASE },
    ]),
    hint: 'Un seul élément change dans la phrase : celui qui précède le verbe.',
    steps: [
      'can porte lui-même la négation : can’t, la forme courante, ou cannot, surtout à l’écrit.',
      WHY_CAN_BASE,
      `Réponse : **${at(accepted, 0)}.**`,
    ],
  };
}

function canQuestion(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKED);
  const a = rng.pick(ABILITIES);
  const accepted = mids(s).map((m) => `Can ${m} ${a.base}`);
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} can ${a.base}. »`,
    answer: { kind: 'text', accepted: ended(accepted, ['?']) },
    traps: endedTraps(
      mids(s).flatMap((m) => [
        { text: `Does ${m} can ${a.base}`, why: WHY_CAN_DO },
        { text: `Do ${m} can ${a.base}`, why: WHY_CAN_DO },
        { text: `Can ${m} to ${a.base}`, why: WHY_CAN_BASE },
        { text: `${cap(m)} can ${a.base}`, why: 'Dans la question, can passe devant le sujet.' },
      ]),
      ['?'],
    ),
    hint: 'Aucun mot à ajouter : change seulement l’ordre de deux éléments.',
    steps: [
      'Avec can, la question se pose en changeant l’ordre : can passe devant le sujet.',
      `Réponse : **${at(accepted, 0)}?**`,
    ],
  };
}

const canHard = (rng: Rng) => (coin(rng) ? canNegative(rng) : canQuestion(rng));

interface Kid {
  readonly name: string;
  readonly pronoun: 'he' | 'she';
}
const GIRLS = ['Ana', 'Lisa', 'Yuna'] as const;
const BOYS = ['Tom', 'Emir', 'Paul'] as const;
const pickKid = (rng: Rng): Kid =>
  coin(rng) ? { name: rng.pick(GIRLS), pronoun: 'she' } : { name: rng.pick(BOYS), pronoun: 'he' };
const person = (k: Kid) => (k.pronoun === 'he' ? 'ce garçon' : 'cette fille');

const GAMES = ['tennis', 'football', 'chess'] as const;

function canDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [a, b, c] = some(rng, ABILITIES, 3) as [Ability, Ability, Ability];
  const game = rng.pick(GAMES);
  const values = [coin(rng), coin(rng), coin(rng)] as const;
  const He = cap(k.pronoun);
  const word = (yes: boolean) => (yes ? 'yes' : 'no');
  const short = values[2];
  return {
    prompt: `Lis la fiche ${de(k.name)} (yes = sait le faire, no = ne sait pas), puis présente ${person(k)} avec can, can’t, Yes ou No. Au dernier trou, mets « play » au présent simple.`,
    figure: {
      kind: 'document',
      title: `${k.name}’s card`,
      lines: [
        `${a.base}: ${word(values[0])}`,
        `${b.base}: ${word(values[1])}`,
        `${c.base}: ${word(values[2])}`,
        `Every Saturday: ${game}`,
      ],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `${k.name} `,
        ` ${a.base}. ${He} `,
        ` ${b.base}. « `,
        ` ${k.pronoun} ${c.base}? » « `,
        `, ${k.pronoun} `,
        `. » Every Saturday, ${k.pronoun} `,
        ` ${game}.`,
      ],
      blanks: [
        { mode: 'text', accepted: canForms(values[0]) },
        { mode: 'text', accepted: canForms(values[1]) },
        { mode: 'text', accepted: ['can'] },
        { mode: 'text', accepted: [short ? 'Yes' : 'No'] },
        { mode: 'text', accepted: canForms(short) },
        { mode: 'text', accepted: ['plays'] },
      ],
    },
    hint: 'Pour chaque activité, retrouve sa ligne sur la fiche. Le dernier trou ne parle plus de capacité mais d’une habitude.',
    steps: [
      'La fiche indique « yes » : can ; elle indique « no » : can’t. can ne change pas avec he ou she.',
      'Dans la question, can passe devant le sujet ; la réponse courte reprend Yes ou No, la personne, puis can ou can’t.',
      `Une habitude se dit au présent simple : avec ${k.pronoun}, « play » prend -s.`,
      `Réponse : **${modal(values[0])}, ${modal(values[1])}, can, ${short ? 'Yes' : 'No'}, ${modal(short)}, plays**`,
    ],
  };
}

const can: Skill = {
  id: 'a6-can',
  title: 'Can et can’t : savoir et pouvoir',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Can** dit qu’on sait faire (I can swim) ; il demande ou donne aussi une **autorisation** (Can I go? You can go).',
      'La négation, **can’t** ou cannot, dit qu’on ne sait pas faire ou qu’on n’a pas le droit.',
      'Après can vient la **base verbale**, sans to ni -s : He can’t ride a bike. Question : Can you swim? Yes, I can.',
    ],
    source: source(
      'auxiliaires de modalité can / can’t ; autorisation et interdiction',
      '« Modals, can and can’t », « Permission »',
    ),
    sources: ['anglais-college-2025', 'bck-can', 'bc-can-could', 'bc-permission'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return canSpot(rng);
    if (level === 2) return canRecognise(rng);
    if (level === 3) return canWrite(rng);
    if (level === 4) return canHard(rng);
    return canDocument(rng);
  },
};

// ——— 2. must / mustn’t ———
interface Rule {
  readonly base: string;
  readonly s: string;
  /** Infinitif français. */
  readonly fr: string;
}
const rule = (base: string, s: string, fr: string): Rule => ({ base, s, fr });
const DUTIES: readonly Rule[] = [
  rule('listen to the teacher', 'listens to the teacher', 'écouter le professeur'),
  rule('wear a helmet', 'wears a helmet', 'porter un casque'),
  rule('wait here', 'waits here', 'attendre ici'),
  rule('help at home', 'helps at home', 'aider à la maison'),
  rule('be on time', 'is on time', 'être à l’heure'),
  rule('be quiet', 'is quiet', 'être calme'),
];
const BANS: readonly Rule[] = [
  rule('shout in the library', 'shouts in the library', 'crier à la bibliothèque'),
  rule('run in the corridors', 'runs in the corridors', 'courir dans les couloirs'),
  rule('eat in class', 'eats in class', 'manger en classe'),
  rule('feed the animals', 'feeds the animals', 'nourrir les animaux'),
  rule('swim in the lake', 'swims in the lake', 'nager dans le lac'),
  rule('walk on the grass', 'walks on the grass', 'marcher sur la pelouse'),
];
const PERMITS: readonly Rule[] = [
  rule('drink water', 'drinks water', 'boire de l’eau'),
  rule('sit here', 'sits here', 's’asseoir ici'),
  rule('take photos', 'takes photos', 'prendre des photos'),
];
const mustModal = (duty: boolean) => (duty ? 'must' : 'mustn’t');
const mustForms = (duty: boolean) => (duty ? ['must'] : ['mustn’t', 'must not']);
const WHY_MUST_DUTY = 'Il s’agit d’une obligation (il faut le faire) : must, sans négation.';
const WHY_MUST_BAN = 'Il s’agit d’une interdiction (il ne faut pas le faire) : mustn’t.';
const whyMust = (duty: boolean) => (duty ? WHY_MUST_DUTY : WHY_MUST_BAN);
const WHY_MUST_S = 'must ne prend jamais de -s, même avec he ou she.';
const WHY_MUST_BASE = 'Après must ou mustn’t, le verbe reste à la base verbale : sans to et sans -s.';
const WHY_MUST_DO = 'must se passe de do et does : la négation se colle à must (mustn’t).';
const pickRule = (rng: Rng) => {
  const duty = coin(rng);
  return { duty, r: rng.pick(duty ? DUTIES : BANS) };
};

function mustSpot(rng: Rng): QuestionDraft {
  const { duty, r } = pickRule(rng);
  const fr = duty ? `Tu dois ${r.fr}.` : `Tu ne dois pas ${r.fr}.`;
  const { answer, traps } = choice(rng, mustModal(duty), [
    { label: mustModal(!duty), why: whyMust(duty) },
    { label: 'musts', why: WHY_MUST_S },
  ]);
  return {
    prompt: `Complète la règle : « You … ${r.base}. » (${fr})`,
    answer,
    traps,
    hint: 'La phrase française oblige-t-elle à faire l’action, ou la défend-elle ?',
    steps: [whyMust(duty), `Réponse : **You ${mustModal(duty)} ${r.base}.**`],
  };
}

function mustSentence(rng: Rng): QuestionDraft {
  const { duty, r } = pickRule(rng);
  const say = (verb: string) => `You ${verb}.`;
  const good = say(`${mustModal(duty)} ${r.base}`);
  const { answer, traps } = choice(rng, good, [
    { label: say(`${mustModal(!duty)} ${r.base}`), why: whyMust(duty) },
    { label: say(`${mustModal(duty)} to ${r.base}`), why: WHY_MUST_BASE },
    {
      label: say(duty ? `musts ${r.base}` : `don’t must ${r.base}`),
      why: duty ? WHY_MUST_S : WHY_MUST_DO,
    },
  ]);
  return {
    prompt: `Quelle phrase anglaise veut dire « ${duty ? 'Tu dois' : 'Tu ne dois pas'} ${r.fr}. » ?`,
    answer,
    traps,
    hint: 'Contrôle d’abord le sens (obligation ou interdiction), puis la construction.',
    steps: [whyMust(duty), WHY_MUST_BASE, `Réponse : **${good}**`],
  };
}

function mustMatch(rng: Rng): QuestionDraft {
  const duty = rng.pick(DUTIES);
  const ban = rng.pick(BANS);
  const allowed = rng.pick(PERMITS);
  const rows = rng.shuffle([
    [`You must ${duty.base}.`, `obligation : ${duty.fr}`],
    [`You mustn’t ${ban.base}.`, `interdiction : ${ban.fr}`],
    [`You can ${allowed.base}.`, `autorisation : ${allowed.fr}`],
  ] as (readonly [string, string])[]);
  return {
    prompt: `Associe chaque règle à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Trois petits mots, trois sens différents : il faut, il ne faut pas, on a le droit.',
    steps: [
      'must oblige, mustn’t interdit, can autorise.',
      `Réponse : **${rows.map(([line, use]) => `${line} = ${use}`).join(' ; ')}**`,
    ],
  };
}

const mustRecognise = (rng: Rng) => (coin(rng) ? mustSentence(rng) : mustMatch(rng));

const DEBTORS = [
  { text: 'We', duty: 'Nous devons', ban: 'Nous ne devons pas', one: false },
  { text: 'Tom', duty: 'Tom doit', ban: 'Tom ne doit pas', one: true },
  { text: 'Lisa', duty: 'Lisa doit', ban: 'Lisa ne doit pas', one: true },
  { text: 'My sister', duty: 'Ma sœur doit', ban: 'Ma sœur ne doit pas', one: true },
] as const;

function mustWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(DEBTORS);
  const { duty, r } = pickRule(rng);
  const accepted = mustForms(duty).map((m) => `${m} ${r.base}`);
  return {
    prompt: `Écris la fin de la règle avec must ou mustn’t : « ${s.text} … . » (${duty ? s.duty : s.ban} ${r.fr}.) Expression utile : to ${r.base} = ${r.fr}.`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${mustModal(!duty)} ${r.base}`, why: whyMust(duty) },
      { text: `${mustModal(duty)} to ${r.base}`, why: WHY_MUST_BASE },
      ...(s.one ? [{ text: `${mustModal(duty)} ${r.s}`, why: WHY_MUST_BASE }] : []),
      duty ? { text: `musts ${r.base}`, why: WHY_MUST_S } : { text: `don’t must ${r.base}`, why: WHY_MUST_DO },
    ]),
    hint: 'Choisis d’abord entre obligation et interdiction, puis ajoute le verbe sans le modifier.',
    steps: [whyMust(duty), WHY_MUST_BASE, `Réponse : **${s.text} ${at(accepted, 0)}.**`],
  };
}

const NEUTRAL = ['wait here', 'stay in the classroom', 'open the window', 'use a phone', 'go out', 'sit here'] as const;
const THIRD: Readonly<Record<(typeof NEUTRAL)[number], string>> = {
  'wait here': 'waits here',
  'stay in the classroom': 'stays in the classroom',
  'open the window': 'opens the window',
  'use a phone': 'uses a phone',
  'go out': 'goes out',
  'sit here': 'sits here',
};
const MUST_SUBJECTS = ['You', 'He', 'She', 'They', 'Tom', 'Lisa'] as const;

function mustForbid(rng: Rng): QuestionDraft {
  const s = rng.pick(MUST_SUBJECTS);
  const action = rng.pick(NEUTRAL);
  const accepted = [`${s} mustn’t ${action}`, `${s} must not ${action}`];
  return {
    prompt: `Change cette obligation en interdiction, avec le même auxiliaire de modalité : « ${s} must ${action}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${s} doesn’t must ${action}`, why: WHY_MUST_DO },
      { text: `${s} don’t must ${action}`, why: WHY_MUST_DO },
      { text: `${s} not must ${action}`, why: 'La négation se place après must, pas avant.' },
      { text: `${s} mustn’t to ${action}`, why: WHY_MUST_BASE },
    ]),
    hint: 'Garde le sujet et le verbe : seul l’auxiliaire devient négatif.',
    steps: [
      'Interdire, c’est mettre must à la forme négative : mustn’t (must not).',
      WHY_MUST_BASE,
      `Réponse : **${at(accepted, 0)}.**`,
    ],
  };
}

function mustOther(rng: Rng): QuestionDraft {
  const s = rng.pick(['Tom', 'Lisa', 'My brother', 'My sister'] as const);
  const action = rng.pick(NEUTRAL);
  const duty = coin(rng);
  const accepted = mustForms(duty).map((m) => `${s} ${m} ${action}`);
  const m = mustModal(duty);
  return {
    prompt: `Écris la même règle pour « ${s} » (toute la phrase) : « I ${m} ${action}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      duty
        ? { text: `${s} musts ${action}`, why: WHY_MUST_S }
        : { text: `${s} doesn’t must ${action}`, why: WHY_MUST_DO },
      { text: `${s} ${m} ${THIRD[action]}`, why: WHY_MUST_BASE },
      { text: `${s} ${m} to ${action}`, why: WHY_MUST_BASE },
      { text: `${s} ${mustModal(!duty)} ${action}`, why: whyMust(duty) },
    ]),
    hint: 'Le sujet change : demande-toi si l’auxiliaire ou le verbe doivent changer avec lui.',
    steps: ['Avec he ou she, must et le verbe qui le suit ne changent pas.', `Réponse : **${at(accepted, 0)}.**`],
  };
}

const mustHard = (rng: Rng) => (coin(rng) ? mustForbid(rng) : mustOther(rng));

/** Chaque règle du club a un sens fixe : le règlement reste vraisemblable. */
interface ClubRule {
  readonly base: string;
  readonly line: string;
  readonly accepted: readonly string[];
  readonly why: string;
}
const clubRules = (accepted: readonly string[], why: string, list: readonly (readonly [string, string])[]) =>
  list.map(([base, line]): ClubRule => ({ base, line, accepted, why }));
const CLUB_DUTIES = clubRules(['must'], 'Il faut : une obligation, must.', [
  ['be on time', 'Il faut être à l’heure.'],
  ['listen to the teacher', 'Il faut écouter le professeur.'],
  ['wear a helmet', 'Il faut porter un casque.'],
]);
/** can’t exprime aussi une interdiction : il est accepté. */
const CLUB_BANS = clubRules(
  ['mustn’t', 'must not', 'can’t', 'cannot'],
  'Il est interdit de : une interdiction, mustn’t.',
  [
    ['eat in class', 'Il est interdit de manger en classe.'],
    ['run in the corridors', 'Il est interdit de courir dans les couloirs.'],
    ['use a phone here', 'Il est interdit d’utiliser un téléphone ici.'],
  ],
);
const CLUB_PERMITS = clubRules(['can'], 'On a le droit de : une autorisation, can.', [
  ['drink water', 'On a le droit de boire de l’eau.'],
  ['sit here', 'On a le droit de s’asseoir ici.'],
  ['take photos', 'On a le droit de prendre des photos.'],
]);

function mustDocument(rng: Rng): QuestionDraft {
  const pools = [CLUB_DUTIES, CLUB_BANS, CLUB_PERMITS].map((pool) => rng.shuffle(pool));
  const extra = rng.int(0, 2);
  const rows = rng.shuffle([...pools.map((pool) => at(pool, 0)), at(at(pools, extra), 1)]);
  // L'ordre du texte anglais se déduit de celui du règlement (décalage fixe) : il faut retrouver chaque ligne.
  const told = [2, 0, 3, 1].map((i) => at(rows, i));
  return {
    prompt: 'Lis le règlement du club, puis explique-le à un nouveau membre : complète avec must, mustn’t ou can.',
    figure: {
      kind: 'document',
      title: 'Règlement du club',
      lines: rows.map((r) => r.line),
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: told.map((_, i) => (i === 0 ? 'You ' : ` ${at(told, i - 1).base}. You `)).concat(` ${at(told, 3).base}.`),
      blanks: told.map((r) => ({ mode: 'text' as const, accepted: [...r.accepted] })),
    },
    hint: 'Les phrases anglaises ne suivent pas l’ordre du règlement : retrouve d’abord la ligne qui parle de la même action.',
    steps: [
      ...told.map((r) => `« ${r.base} » : « ${r.line} » ${r.why}`),
      `Réponse : **${told.map((r) => at(r.accepted, 0)).join(', ')}**`,
    ],
  };
}

const must: Skill = {
  id: 'a6-must',
  title: 'Must et mustn’t : obligation et interdiction',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Must** exprime une **obligation** : You must listen (tu dois écouter). **Mustn’t** exprime une **interdiction** : You mustn’t shout.',
      'Cet **auxiliaire de modalité** ne change jamais ; la **base verbale** le suit : He must wait.',
    ],
    source: source(
      '(A1+) auxiliaires de modalité must / mustn’t',
      '« Modals, must and mustn’t », « Modals : permission and obligation »',
    ),
    sources: ['anglais-college-2025', 'bck-must', 'bc-modals-permission'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return mustSpot(rng);
    if (level === 2) return mustRecognise(rng);
    if (level === 3) return mustWrite(rng);
    if (level === 4) return mustHard(rng);
    return mustDocument(rng);
  },
};

// ——— 3. L’impératif ———
interface Order {
  /** La consigne anglaise, sans ponctuation. */
  readonly en: string;
  readonly fr: string;
  /** Vocabulaire donné pour écrire la consigne. */
  readonly words: string;
  /** Autres consignes anglaises justes pour la même phrase française. */
  readonly alt?: readonly string[];
}
const order = (en: string, fr: string, words: string, alt?: readonly string[]): Order => ({
  en,
  fr,
  words,
  ...(alt ? { alt } : {}),
});
const ORDERS: readonly Order[] = [
  order('Open the window', 'Ouvre la fenêtre', 'window = fenêtre ; to open = ouvrir'),
  order('Close the door', 'Ferme la porte', 'door = porte ; to close = fermer', ['Shut the door']),
  order('Come to the board', 'Viens au tableau', 'board = tableau ; to come = venir', ['Come up to the board']),
  order('Sit down', 'Assieds-toi', 'to sit = s’asseoir ; down = vers le bas'),
  order('Stand up', 'Lève-toi', 'to stand = se tenir debout ; up = vers le haut', ['Get up']),
  order('Look at the picture', 'Regarde l’image', 'picture = image ; to look at = regarder'),
  order('Listen to the song', 'Écoute la chanson', 'song = chanson ; to listen to = écouter'),
  order('Help your friend', 'Aide ton ami', 'friend = ami ; to help = aider'),
  order('Take your book', 'Prends ton livre', 'book = livre ; to take = prendre'),
  order('Come in', 'Entre', 'to come = venir ; in = dedans', ['Enter']),
  order('Get ready', 'Prépare-toi', 'to get = devenir ; ready = prêt', ['Be ready']),
];
const first = (en: string) => en.split(' ')[0] ?? en;
const rest = (en: string) => en.slice(first(en).length);
/** Formes erronées usuelles, construites sur la base verbale. */
const S_FORMS: Readonly<Record<string, string>> = {
  Open: 'Opens',
  Close: 'Closes',
  Come: 'Comes',
  Sit: 'Sits',
  Stand: 'Stands',
  Look: 'Looks',
  Listen: 'Listens',
  Help: 'Helps',
  Take: 'Takes',
  Get: 'Gets',
};
const ING_FORMS: Readonly<Record<string, string>> = {
  Open: 'Opening',
  Close: 'Closing',
  Come: 'Coming',
  Sit: 'Sitting',
  Stand: 'Standing',
  Look: 'Looking',
  Listen: 'Listening',
  Help: 'Helping',
  Take: 'Taking',
  Get: 'Getting',
};
const WHY_IMP_S = 'L’impératif est la base verbale : jamais de -s.';
const WHY_IMP_TO = 'L’impératif s’emploie sans to.';
const WHY_IMP_ING = 'La forme en -ing ne donne pas une consigne : il faut la base verbale.';
const WHY_IMP_YOU = 'L’impératif s’emploie sans you : on commence par le verbe.';
const IMP_RULE = 'À l’impératif, on commence par la base verbale, sans sujet.';

function orderSpot(rng: Rng): QuestionDraft {
  const [good, ...others] = some(rng, ORDERS, 3) as [Order, Order, Order];
  const { answer, traps } = choice(
    rng,
    `${good.en}!`,
    others.map((o) => ({ label: `${o.en}!`, why: `« ${o.en}! » veut dire « ${o.fr} ! ».` })),
  );
  return {
    prompt: `Quelle consigne veut dire « ${good.fr} ! » ?`,
    answer,
    traps,
    hint: 'Repère le premier mot de chaque consigne : c’est lui qui dit l’action à faire.',
    steps: [IMP_RULE, `Réponse : **${good.en}!**`],
  };
}

function orderMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, ORDERS, 3).map((o) => [`${o.en}!`, `${o.fr} !`] as const);
  return {
    prompt: `Associe chaque consigne à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Commence par la consigne que tu entends le plus souvent en classe.',
    steps: [IMP_RULE, `Réponse : **${rows.map(([en, fr]) => `${en} = ${fr}`).join(' ; ')}**`],
  };
}

function orderForm(rng: Rng): QuestionDraft {
  const o = rng.pick(ORDERS);
  const verb = first(o.en);
  const tail = rest(o.en);
  const good = `${o.en}!`;
  const { answer, traps } = choice(rng, good, [
    { label: `${S_FORMS[verb] ?? verb}${tail}!`, why: WHY_IMP_S },
    { label: `To ${o.en.charAt(0).toLowerCase()}${o.en.slice(1)}!`, why: WHY_IMP_TO },
    { label: `${ING_FORMS[verb] ?? verb}${tail}!`, why: WHY_IMP_ING },
  ]);
  return {
    prompt: `Quelle phrase donne correctement la consigne « ${o.fr} ! » ?`,
    answer,
    traps,
    hint: 'Les propositions se ressemblent : examine la forme du premier mot.',
    steps: [IMP_RULE, `Réponse : **${good}**`],
  };
}

const orderRecognise = (rng: Rng) => (coin(rng) ? orderMatch(rng) : orderForm(rng));

const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
/** La consigne seule, ou adoucie par please. */
const polite = (forms: readonly string[]) =>
  forms.flatMap((f) => [f, `${f}, please`, `${f} please`, `Please ${lower(f)}`, `Please, ${lower(f)}`]);

function orderWrite(rng: Rng): QuestionDraft {
  const o = rng.pick(ORDERS);
  const verb = first(o.en);
  const tail = rest(o.en);
  const accepted = polite([o.en, ...(o.alt ?? [])]);
  return {
    prompt: `Écris la consigne en anglais : « ${o.fr} ! » Vocabulaire : ${o.words}.`,
    answer: { kind: 'text', accepted: ended(accepted, ORDER_MARKS) },
    traps: endedTraps(
      [
        { text: `You ${lower(o.en)}`, why: WHY_IMP_YOU },
        { text: `${S_FORMS[verb] ?? verb}${tail}`, why: WHY_IMP_S },
        { text: `To ${lower(o.en)}`, why: WHY_IMP_TO },
        { text: `${ING_FORMS[verb] ?? verb}${tail}`, why: WHY_IMP_ING },
      ],
      ORDER_MARKS,
    ),
    hint: 'Quel mot vient en premier quand on donne une consigne en anglais ?',
    steps: [IMP_RULE, `Réponse : **${o.en}!**`],
  };
}

interface Situation {
  /** La scène et ce qu'il faut demander, en français. */
  readonly fr: string;
  /** La partie de la demande à traduire et son équivalent. */
  readonly gloss: string;
  /** Consignes justes ; la première sert de correction. */
  readonly answers: readonly [string, ...string[]];
}
const situation = (fr: string, gloss: string, ...answers: [string, ...string[]]): Situation => ({
  fr,
  gloss,
  answers,
});
const SITUATIONS: readonly Situation[] = [
  situation(
    'Ton camarade va traverser sans regarder : dis-lui d’être prudent.',
    '« être prudent » se dit be careful',
    'Be careful',
    'Be very careful',
    'Be cautious',
    'Be prudent',
    'Take care',
    'Watch out',
    'Look out',
  ),
  situation(
    'Ton voisin parle pendant que le professeur explique : dis-lui d’être silencieux.',
    '« être silencieux » se dit be quiet',
    'Be quiet',
    'Keep quiet',
    'Stay quiet',
    'Be silent',
    'Keep silent',
    'Stay silent',
  ),
  situation(
    'Ton ami se moque d’un nouvel élève : dis-lui d’être gentil.',
    '« être gentil » se dit be nice ou be kind',
    'Be nice',
    'Be kind',
    'Be friendly',
    'Be nice to him',
    'Be kind to him',
  ),
  situation(
    'Ton amie a peur de monter sur scène : dis-lui d’être courageuse.',
    '« être courageuse » se dit be brave',
    'Be brave',
    'Be courageous',
  ),
  situation(
    'Le bus arrive et ton camarade traîne : dis-lui d’être rapide.',
    '« être rapide » se dit be quick',
    'Be quick',
    'Be fast',
    'Hurry up',
    'Hurry',
  ),
  situation(
    'Ton ami arrive souvent en retard : pour demain, dis-lui d’être à l’heure.',
    '« être à l’heure » se dit be on time',
    'Be on time',
    'Be on time tomorrow',
    'Tomorrow, be on time',
    'Be punctual',
  ),
  situation(
    'Le spectacle commence à dix heures : dis à ton camarade d’être prêt à dix heures.',
    '« être prêt à dix heures » se dit be ready at ten',
    'Be ready at ten',
    'Be ready at 10',
    'Be ready at ten o’clock',
    'Be ready at 10 o’clock',
  ),
  situation(
    'Tu dois partir chercher ton sac : dis à ton ami d’attendre ici.',
    '« attendre ici » se dit wait here',
    'Wait here',
    'Wait over here',
  ),
  situation(
    'Ton amie marche trop vite et te laisse derrière : dis-lui de t’attendre.',
    '« m’attendre » se dit wait for me',
    'Wait for me',
  ),
  situation(
    'Tu veux montrer quelque chose à ton camarade, qui est loin : dis-lui de venir ici.',
    '« venir ici » se dit come here',
    'Come here',
    'Come over here',
  ),
  situation(
    'Tu pars à la cantine et ton ami hésite : dis-lui de venir avec toi.',
    '« venir avec moi » se dit come with me',
    'Come with me',
    'Come along with me',
    'Come with me to the canteen',
  ),
  situation(
    'Ton voisin bavarde pendant que le professeur parle : dis-lui d’écouter le professeur.',
    '« écouter le professeur » se dit listen to the teacher',
    'Listen to the teacher',
    'Listen to your teacher',
    'Listen to our teacher',
  ),
  situation(
    'La réponse est écrite au tableau, mais ton amie cherche ailleurs : dis-lui de regarder le tableau.',
    '« regarder le tableau » se dit look at the board',
    'Look at the board',
    'Look at the blackboard',
    'Look at the whiteboard',
  ),
  situation(
    'Ton ami ne trouve pas sa page : dis-lui de regarder ton livre.',
    '« regarder mon livre » se dit look at my book',
    'Look at my book',
  ),
];
/** Pour chaque premier mot : les formes fautives (accordée, puis en -ing). */
const WRONG_FORMS: Readonly<Record<string, readonly [readonly string[], string]>> = {
  Be: [['Are', 'Is'], 'Being'],
  Wait: [['Waits'], 'Waiting'],
  Come: [['Comes'], 'Coming'],
  Listen: [['Listens'], 'Listening'],
  Look: [['Looks'], 'Looking'],
};

function orderSituation(rng: Rng): QuestionDraft {
  const { fr, gloss, answers } = rng.pick(SITUATIONS);
  const [good] = answers;
  const verb = first(good);
  const tail = rest(good);
  const [agreed, ing] = WRONG_FORMS[verb] ?? [[], verb];
  return {
    prompt: `${fr} Écris cette consigne en anglais.`,
    answer: { kind: 'text', accepted: ended(polite(answers), ORDER_MARKS) },
    traps: endedTraps(
      [
        { text: `You ${lower(good)}`, why: WHY_IMP_YOU },
        ...(verb === 'Be' ? [{ text: `You are${tail}`, why: WHY_IMP_YOU }] : []),
        ...agreed.map((w) => ({ text: `${w}${tail}`, why: verb === 'Be' ? IMP_RULE : WHY_IMP_S })),
        { text: `To ${lower(good)}`, why: WHY_IMP_TO },
        { text: `${ing}${tail}`, why: WHY_IMP_ING },
      ],
      ORDER_MARKS,
    ),
    hint: 'Repère dans la situation ce que tu demandes, puis commence ta phrase par le verbe anglais, à la base verbale.',
    steps: [IMP_RULE, `Ici, ${gloss}.`, `Réponse : **${good}!**`],
  };
}

interface Wish {
  readonly fr: string;
  readonly after: string;
  readonly verbs: readonly string[];
}
const wish = (fr: string, after: string, ...verbs: string[]): Wish => ({ fr, after, verbs });
const WISHES: readonly Wish[] = [
  wish('venir au tableau', 'to the board', 'come', 'go'),
  wish('ouvrir la fenêtre', 'the window', 'open'),
  wish('fermer la porte', 'the door', 'close', 'shut'),
  wish('s’asseoir', 'down', 'sit'),
  wish('se lever', 'up', 'stand', 'get'),
  wish('écouter la chanson', 'to the song', 'listen'),
  wish('regarder l’image', 'at the picture', 'look'),
  wish('rester calme', 'quiet', 'be', 'keep', 'stay'),
];

function orderDocument(rng: Rng): QuestionDraft {
  const name = rng.pick([...GIRLS, ...BOYS]);
  const rows = some(rng, WISHES, 4);
  const told = [1, 3, 0, 2].map((i) => at(rows, i));
  return {
    prompt: `Lis les notes du professeur, puis écris ce qu’il dit à ${name}, avec un verbe à l’impératif dans chaque trou.`,
    figure: {
      kind: 'document',
      title: 'Notes du professeur',
      lines: rows.map((w) => `${name} doit ${w.fr}.`),
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: told
        .map((_, i) => (i === 0 ? `Teacher: « ${name}, please: ` : ` ${at(told, i - 1).after}. `))
        .concat(` ${at(told, 3).after}. »`),
      blanks: told.map((w) => ({ mode: 'text' as const, accepted: [...w.verbs] })),
    },
    hint: 'La fin de chaque phrase anglaise t’indique quelle note elle traduit ; cherche ensuite le verbe seul.',
    steps: [
      IMP_RULE,
      ...told.map((w) => `« … ${w.after} » traduit « ${w.fr} » : le verbe est « ${at(w.verbs, 0)} ».`),
      `Réponse : **${told.map((w) => at(w.verbs, 0)).join(', ')}**`,
    ],
  };
}

const imperative: Skill = {
  id: 'a6-imperatif-affirmatif',
  title: 'L’impératif : donner une consigne',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’**impératif** donne un ordre ou une **consigne** : Open the window!',
      'On emploie la **base verbale** seule, sans you ni to : Sit down. Avec be : Be quiet!',
      'Pour rester poli, ajoute please : Come in, please.',
    ],
    source: source('impératif, formes courantes et consignes de classe', '« Imperatives »'),
    sources: ['anglais-college-2025', 'bck-imperatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return orderSpot(rng);
    if (level === 2) return orderRecognise(rng);
    if (level === 3) return orderWrite(rng);
    if (level === 4) return orderSituation(rng);
    return orderDocument(rng);
  },
};

// ——— 4. L’impératif négatif ———
interface Ban {
  readonly base: string;
  readonly ing: string;
  readonly end: string;
  readonly fr: string;
  readonly words: string;
}
const ban = (verb: readonly [string, string], end: string, fr: string, words: string): Ban => ({
  base: verb[0],
  ing: verb[1],
  end,
  fr,
  words,
});
const FORBIDDEN: readonly Ban[] = [
  ban(['run', 'running'], '', 'Ne cours pas', 'to run = courir'),
  ban(['shout', 'shouting'], '', 'Ne crie pas', 'to shout = crier'),
  ban(['cheat', 'cheating'], '', 'Ne triche pas', 'to cheat = tricher'),
  ban(['walk', 'walking'], ' on the grass', 'Ne marche pas sur la pelouse', 'to walk = marcher ; grass = pelouse'),
  ban(['feed', 'feeding'], ' the animals', 'Ne nourris pas les animaux', 'to feed = nourrir ; animals = animaux'),
  ban(['open', 'opening'], ' the window', 'N’ouvre pas la fenêtre', 'to open = ouvrir ; window = fenêtre'),
  ban(['forget', 'forgetting'], ' your bag', 'N’oublie pas ton sac', 'to forget = oublier ; bag = sac'),
  ban(['be', 'being'], ' late', 'Ne sois pas en retard', 'to be = être ; late = en retard'),
];
const NOT_BE = FORBIDDEN.filter((b) => b.base !== 'be');
const say = (b: Ban) => `Don’t ${b.base}${b.end}`;
const IMP_NOT = 'L’impératif négatif se construit avec don’t, puis la base verbale.';
const WHY_NOT_ALONE = '« not » ou « no » seuls ne suffisent pas devant le verbe : il faut don’t (do not).';
const WHY_DOESNT = 'Une consigne s’adresse à « you », sous-entendu : don’t, jamais doesn’t.';
const WHY_DONT_ING = 'Après don’t, le verbe reste à la base verbale, sans -ing.';
const WHY_AFFIRM = 'Cette consigne n’a pas de négation : elle demande de faire l’action.';

function banSpot(rng: Rng): QuestionDraft {
  const [b, other] = some(rng, FORBIDDEN, 2) as [Ban, Ban];
  const good = `${say(b)}!`;
  const { answer, traps } = choice(rng, good, [
    { label: `${cap(b.base)}${b.end}!`, why: WHY_AFFIRM },
    { label: `${say(other)}!`, why: `« ${say(other)}! » veut dire « ${other.fr} ! ».` },
  ]);
  return {
    prompt: `Quelle consigne veut dire « ${b.fr} ! » ?`,
    answer,
    traps,
    hint: 'Il faut une interdiction : cherche la marque de la négation, puis la bonne action.',
    steps: [IMP_NOT, `Réponse : **${good}**`],
  };
}

function banForm(rng: Rng): QuestionDraft {
  const b = rng.pick(NOT_BE);
  const good = `${say(b)}!`;
  const { answer, traps } = choice(rng, good, [
    { label: `Not ${b.base}${b.end}!`, why: WHY_NOT_ALONE },
    { label: `Doesn’t ${b.base}${b.end}!`, why: WHY_DOESNT },
    { label: `Don’t ${b.ing}${b.end}!`, why: WHY_DONT_ING },
  ]);
  return {
    prompt: `Quelle phrase dit correctement « ${b.fr} ! » ?`,
    answer,
    traps,
    hint: 'Contrôle le premier mot de la phrase, puis la forme du verbe.',
    steps: [IMP_NOT, `Réponse : **${good}**`],
  };
}

const SIGNS = [
  ['No cheating!', 'Don’t cheat!'],
  ['No running!', 'Don’t run!'],
  ['No shouting!', 'Don’t shout!'],
  ['No eating!', 'Don’t eat!'],
  ['No swimming!', 'Don’t swim!'],
] as const;

function banSigns(rng: Rng): QuestionDraft {
  const rows = some(rng, SIGNS, 3);
  return {
    prompt: `Associe chaque panneau à la consigne qui a le même sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Sur le panneau, laisse « No » de côté : quel verbe se cache dans le mot en -ing ?',
    steps: [
      '« No » suivi d’un verbe en -ing interdit une action, comme don’t suivi de la base verbale.',
      `Réponse : **${rows.map(([sign, meaning]) => `${sign} = ${meaning}`).join(' ; ')}**`,
    ],
  };
}

const banRecognise = (rng: Rng) => (coin(rng) ? banForm(rng) : banSigns(rng));

function banWrite(rng: Rng): QuestionDraft {
  const b = rng.pick(FORBIDDEN);
  const accepted = [
    ...polite([say(b), `Do not ${b.base}${b.end}`]),
    // La tournure des panneaux est juste aussi, sauf avec be.
    ...(b.base === 'be' ? [] : [`No ${b.ing}${b.end}`]),
  ];
  return {
    prompt: `Écris la consigne en anglais : « ${b.fr} ! » Vocabulaire : ${b.words}.`,
    answer: { kind: 'text', accepted: ended(accepted, ORDER_MARKS) },
    traps: endedTraps(
      [
        { text: `Not ${b.base}${b.end}`, why: WHY_NOT_ALONE },
        { text: `No ${b.base}${b.end}`, why: WHY_NOT_ALONE },
        { text: `Doesn’t ${b.base}${b.end}`, why: WHY_DOESNT },
        { text: `Don’t ${b.ing}${b.end}`, why: WHY_DONT_ING },
        { text: `Don’t to ${b.base}${b.end}`, why: 'Après don’t, jamais de to.' },
      ],
      ORDER_MARKS,
    ),
    hint: 'Une consigne négative commence par le petit mot qui interdit, avant le verbe.',
    steps: [IMP_NOT, `Réponse : **${say(b)}!**`],
  };
}

const OPPOSITES = [
  { base: 'be', end: 'late' },
  { base: 'be', end: 'noisy' },
  { base: 'be', end: 'rude' },
  { base: 'open', end: 'the door', ing: 'opening' },
  { base: 'sit', end: 'there', ing: 'sitting' },
  { base: 'touch', end: 'the pictures', ing: 'touching' },
  { base: 'use', end: 'your phone', ing: 'using' },
  { base: 'take', end: 'photos', ing: 'taking' },
] as const;

function banOpposite(rng: Rng): QuestionDraft {
  const o = rng.pick(OPPOSITES);
  const action = `${o.base} ${o.end}`;
  const accepted = [
    ...polite([`Don’t ${action}`, `Do not ${action}`, `Never ${action}`]),
    ...('ing' in o ? [`No ${o.ing} ${o.end}`] : []),
  ];
  return {
    prompt: `Écris la consigne contraire (une interdiction) : « ${cap(action)}! »`,
    answer: { kind: 'text', accepted: ended(accepted, ORDER_MARKS) },
    traps: endedTraps(
      [
        { text: `Not ${action}`, why: WHY_NOT_ALONE },
        { text: `${cap(o.base)} not ${o.end}`, why: 'La négation se place avant le verbe, avec don’t.' },
        { text: `Doesn’t ${action}`, why: WHY_DOESNT },
        ...(o.base === 'be'
          ? [{ text: `Aren’t ${o.end}`, why: 'À l’impératif, même be prend don’t : don’t be.' }]
          : []),
      ],
      ORDER_MARKS,
    ),
    hint: 'Ajoute ce qui interdit au bon endroit, sans changer le verbe. La règle vaut pour tous les verbes.',
    steps: [IMP_NOT, 'La règle s’applique aussi à be.', `Réponse : **Don’t ${action}!**`],
  };
}

const SIGN_BANS = [
  { base: 'run', ing: 'running', place: 'in the corridors' },
  { base: 'eat', ing: 'eating', place: 'in the library' },
  { base: 'shout', ing: 'shouting', place: 'in class' },
  { base: 'swim', ing: 'swimming', place: 'in the lake' },
  { base: 'cheat', ing: 'cheating', place: 'in the game' },
  { base: 'dance', ing: 'dancing', place: 'on the tables' },
] as const;
const SIGN_DUTIES = [
  { line: 'You must be quiet here.', verbs: ['be', 'stay', 'keep'], end: 'quiet here' },
  { line: 'You must be on time.', verbs: ['be'], end: 'on time' },
  { line: 'You must listen to the teacher.', verbs: ['listen'], end: 'to the teacher' },
  { line: 'You must wait here.', verbs: ['wait'], end: 'here' },
] as const;

function banDocument(rng: Rng): QuestionDraft {
  const [a, b] = some(rng, SIGN_BANS, 2) as [(typeof SIGN_BANS)[number], (typeof SIGN_BANS)[number]];
  const duty = rng.pick(SIGN_DUTIES);
  const spot = rng.int(0, 2);
  const lines = [`No ${a.ing} ${a.place}!`, `No ${b.ing} ${b.place}!`];
  lines.splice(spot, 0, duty.line);
  /** Le professeur donne les consignes dans l'ordre inverse des panneaux. */
  const told = [`No ${a.ing} ${a.place}!`, `No ${b.ing} ${b.place}!`];
  told.splice(spot, 0, duty.line);
  told.reverse();
  const parts: string[] = ['Teacher: « '];
  const accepted: string[][] = [];
  const answers: string[] = [];
  for (const line of told) {
    if (line === duty.line) {
      parts[parts.length - 1] = `${at(parts, parts.length - 1)}Please, `;
      accepted.push([...duty.verbs]);
      parts.push(` ${duty.end}. `);
      answers.push(at(duty.verbs, 0));
    } else {
      const sign = line.startsWith(`No ${a.ing}`) ? a : b;
      accepted.push(['Don’t', 'Do not', 'Never']);
      parts.push(' ');
      accepted.push([sign.base]);
      parts.push(` ${sign.place}! `);
      answers.push('Don’t', sign.base);
    }
  }
  parts[parts.length - 1] = `${at(parts, parts.length - 1).trimEnd()} »`;
  return {
    prompt:
      'Lis les panneaux, puis écris les consignes du professeur à l’impératif, sans reprendre « No » ni « must ».',
    figure: { kind: 'document', title: 'School signs', lines, credit: ABOUT },
    answer: { kind: 'cloze', parts, blanks: accepted.map((list) => ({ mode: 'text' as const, accepted: list })) },
    hint: 'Compte les trous de chaque phrase : deux trous pour interdire, un seul pour obliger. Cherche la forme simple du verbe.',
    steps: [
      '« No » + verbe en -ing interdit : le professeur dit don’t, puis la base verbale.',
      '« You must » oblige : à l’impératif, la base verbale suffit.',
      `Réponse : **${answers.join(', ')}**`,
    ],
  };
}

const negativeImperative: Skill = {
  id: 'a6-imperatif-negatif',
  title: 'L’impératif négatif : interdire',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour interdire, mets **don’t** (do not) devant la **base verbale** : Don’t run! Avec be aussi : Don’t be late!',
      'Cette **consigne** négative n’a pas de sujet. Sur un panneau, on lit aussi No + verbe en -ing : No cheating!',
    ],
    source: source('impératif à la forme négative et « No cheating! »', '« Imperatives »'),
    sources: ['anglais-college-2025', 'bck-imperatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return banSpot(rng);
    if (level === 2) return banRecognise(rng);
    if (level === 3) return banWrite(rng);
    if (level === 4) return banOpposite(rng);
    return banDocument(rng);
  },
};

export const ENGLISH_MODALS_CHAPTER: Chapter = {
  id: 'a6-modaux-imperatif',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Modaux et impératif',
  skills: [can, must, imperative, negativeImperative],
};
