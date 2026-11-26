import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, some } from './temps.ts';
import {
  ABOUT,
  PEOPLE,
  cap,
  coin,
  ended,
  endedTraps,
  listBlank,
  matchSteps,
  pairs,
  pickKid,
  quoted,
  type Who,
} from './futur.ts';

/**
 * Anglais 5e — « Modaux, souhait, opinion » (lot an-5e-03, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) ; règles et formes : British Council (voir modaux-souhait-faits.ts : chaque fait y porte sa source et
 * sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 5e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Règles : British Council, ${pages}.`;

interface Action {
  readonly base: string;
  readonly s: string;
  readonly ing: string;
  readonly fr: string;
}
const action = (base: string, s: string, ing: string, fr: string): Action => ({ base, s, ing, fr });

// ——— 1. should / shouldn’t ———
interface Advice extends Action {
  /** Situation en anglais, après laquelle le conseil est évident. */
  readonly when: string;
  /** Conseiller de le faire (true) ou le déconseiller. */
  readonly good: boolean;
}
const advice = (when: string, good: boolean, a: Action): Advice => ({ ...a, when, good });
const ADVICE: readonly Advice[] = [
  advice(
    'You are very tired.',
    true,
    action('go to bed early', 'goes to bed early', 'going to bed early', 'se coucher tôt'),
  ),
  advice(
    'It is very hot today.',
    true,
    action('drink some water', 'drinks some water', 'drinking some water', 'boire de l’eau'),
  ),
  advice(
    'You have a test tomorrow.',
    true,
    action('revise your lesson', 'revises your lesson', 'revising your lesson', 'réviser sa leçon'),
  ),
  advice(
    'It is raining.',
    true,
    action('take an umbrella', 'takes an umbrella', 'taking an umbrella', 'prendre un parapluie'),
  ),
  advice('The baby is sleeping.', false, action('shout', 'shouts', 'shouting', 'crier')),
  advice('The floor is wet.', false, action('run here', 'runs here', 'running here', 'courir ici')),
  advice('You have a sore throat.', false, action('sing loudly', 'sings loudly', 'singing loudly', 'chanter fort')),
  advice('The soup is very hot.', false, action('eat it now', 'eats it now', 'eating it now', 'le manger maintenant')),
];
const should = (good: boolean) => (good ? 'should' : 'shouldn’t');
const WHY_ADVICE = (good: boolean) =>
  good
    ? 'La situation demande de le faire : on conseille avec should.'
    : 'Il vaut mieux l’éviter : on déconseille avec shouldn’t.';
const WHY_MOD_S = 'should et could ne prennent jamais de -s.';
const WHY_MOD_BASE = 'Après should ou could, le verbe reste à la base verbale : sans to, sans -s et sans -ing.';
const WHY_MOD_DO = 'L’auxiliaire de modalité porte lui-même la négation et la question : ni do ni does.';
const SHOULD_RULE = 'should conseille de faire ; shouldn’t déconseille. La base verbale suit.';

const MEANINGS: readonly (readonly [string, string, string, string])[] = [
  ['You should sleep.', 'Tu devrais dormir.', 'Tu as dormi.', 'Tu sais dormir.'],
  ['You should read this book.', 'Tu devrais lire ce livre.', 'Tu as lu ce livre.', 'Tu sais lire ce livre.'],
  ['You shouldn’t go out.', 'Tu ne devrais pas sortir.', 'Tu n’es pas sorti.', 'Tu devrais sortir.'],
  ['You should call her.', 'Tu devrais l’appeler.', 'Tu l’as appelée.', 'Tu l’appelles chaque jour.'],
  ['He shouldn’t eat that.', 'Il ne devrait pas manger ça.', 'Il n’a pas mangé ça.', 'Il devrait manger ça.'],
];

function shouldMeaning(rng: Rng): QuestionDraft {
  const [line, right, w1, w2] = rng.pick(MEANINGS);
  const { answer, traps } = choice(rng, right, [
    { label: w1, why: 'should ne raconte ni le passé ni une capacité : il donne un conseil.' },
    { label: w2, why: 'Vérifie le conseil : should ou shouldn’t, faire ou éviter ?' },
  ]);
  return {
    prompt: `Que veut dire « ${line} » ?`,
    answer,
    traps,
    hint: 'Le mot placé avant le verbe donne un conseil. Est-il négatif ?',
    steps: [SHOULD_RULE, `Réponse : **${right}**`],
  };
}

function shouldPick(rng: Rng): QuestionDraft {
  const a = rng.pick(ADVICE);
  const { answer, traps } = choice(rng, should(a.good), [
    { label: should(!a.good), why: WHY_ADVICE(a.good) },
    { label: `${should(a.good)} to`, why: WHY_MOD_BASE },
    { label: 'shoulds', why: WHY_MOD_S },
  ]);
  return {
    prompt: `Complète le conseil : « ${a.when} You … ${a.base}. »`,
    answer,
    traps,
    hint: 'La situation invite-t-elle à le faire ou à l’éviter ?',
    steps: [WHY_ADVICE(a.good), WHY_MOD_BASE, `Réponse : **You ${should(a.good)} ${a.base}.**`],
  };
}

const shouldForms = (good: boolean) => (good ? ['should'] : ['shouldn’t', 'should not']);

function shouldWrite(rng: Rng): QuestionDraft {
  const a = rng.pick(ADVICE);
  const accepted = shouldForms(a.good).map((m) => `${m} ${a.base}`);
  return {
    prompt: `Donne un conseil avec should ou shouldn’t et le verbe « to ${a.base} » (${a.fr}) : « ${a.when} You … . »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${should(!a.good)} ${a.base}`, why: WHY_ADVICE(a.good) },
      { text: `${should(a.good)} to ${a.base}`, why: WHY_MOD_BASE },
      { text: `${should(a.good)} ${a.ing}`, why: WHY_MOD_BASE },
      { text: `${should(a.good)}s ${a.base}`, why: WHY_MOD_S },
    ]),
    hint: 'Choisis d’abord : faire ou éviter ? Ensuite écris le verbe sans rien lui ajouter.',
    steps: [WHY_ADVICE(a.good), WHY_MOD_BASE, `Réponse : **You ${at(accepted, 0)}.**`],
  };
}

interface Tip extends Action {
  /** Bonne idée (should) ou mauvaise (shouldn’t), toujours dans le même sens. */
  readonly good: boolean;
}
const tip = (good: boolean, a: Action): Tip => ({ ...a, good });
const TIPS: readonly Tip[] = [
  tip(true, action('wear a helmet', 'wears a helmet', 'wearing a helmet', 'porter un casque')),
  tip(true, action('ask for help', 'asks for help', 'asking for help', 'demander de l’aide')),
  tip(true, action('check the map', 'checks the map', 'checking the map', 'vérifier la carte')),
  tip(true, action('eat some fruit', 'eats some fruit', 'eating some fruit', 'manger des fruits')),
  tip(
    false,
    action('watch TV all night', 'watches TV all night', 'watching TV all night', 'regarder la télé toute la nuit'),
  ),
  tip(false, action('skip breakfast', 'skips breakfast', 'skipping breakfast', 'sauter le petit déjeuner')),
  tip(
    false,
    action('cross without looking', 'crosses without looking', 'crossing without looking', 'traverser sans regarder'),
  ),
  tip(false, action('drop litter', 'drops litter', 'dropping litter', 'jeter des déchets par terre')),
];
/** Actions neutres : la phrase de départ reste raisonnable avant d’être mise à la forme négative. */
const NEUTRAL: readonly Action[] = [
  action('take the bus', 'takes the bus', 'taking the bus', 'prendre le bus'),
  action('open the window', 'opens the window', 'opening the window', 'ouvrir la fenêtre'),
  action('go by train', 'goes by train', 'going by train', 'y aller en train'),
  action('send an email', 'sends an email', 'sending an email', 'envoyer un courriel'),
  action('sit here', 'sits here', 'sitting here', 's’asseoir ici'),
  action('wait outside', 'waits outside', 'waiting outside', 'attendre dehors'),
];

/** Transformation : le conseil positif devient déconseillé. */
function shouldNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const a = rng.pick(NEUTRAL);
  const accepted = [`${s.text} shouldn’t ${a.base}`, `${s.text} should not ${a.base}`];
  return {
    prompt: `Écris toute la phrase à la forme négative : « ${s.text} should ${a.base}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${s.text} doesn’t should ${a.base}`, why: WHY_MOD_DO },
      { text: `${s.text} don’t should ${a.base}`, why: WHY_MOD_DO },
      { text: `${s.text} not should ${a.base}`, why: 'La négation se place après should : shouldn’t ou should not.' },
      { text: `${s.text} shouldn’t to ${a.base}`, why: WHY_MOD_BASE },
    ]),
    hint: 'Un seul élément change : celui qui précède le verbe.',
    steps: ['La négation de should est shouldn’t (should not).', `Réponse : **${at(accepted, 0)}.**`],
  };
}

/** Production sans modèle : le conseil est donné en français, à la 3e personne. */
function shouldTranslate(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const a = rng.pick(TIPS);
  const good = a.good;
  const accepted = shouldForms(good).map((m) => `${k.name} ${m} ${a.base}`);
  return {
    prompt: `Écris en anglais : « ${k.name} ${good ? 'devrait' : 'ne devrait pas'} ${a.fr}. » Verbe utile : to ${a.base}.`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${k.name} ${should(!good)} ${a.base}`, why: WHY_ADVICE(good) },
      { text: `${k.name} ${should(good)} ${a.s}`, why: WHY_MOD_BASE },
      { text: `${k.name} ${should(good)} to ${a.base}`, why: WHY_MOD_BASE },
      { text: `${k.name} ${should(good)}s ${a.base}`, why: WHY_MOD_S },
    ]),
    hint: 'Le conditionnel « devrait » se rend par un seul auxiliaire de modalité.',
    steps: [SHOULD_RULE, `Réponse : **${at(accepted, 0)}.**`],
  };
}

function shouldDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [a, b, c] = some(rng, TIPS, 3) as [Tip, Tip, Tip];
  const values = [a.good, b.good, c.good] as const;
  const mark = (v: boolean) => (v ? 'good idea' : 'bad idea');
  return {
    prompt: `Lis la fiche de conseils pour ${k.name}, puis complète avec should ou shouldn’t. Au dernier trou, écris le verbe de la dernière ligne.`,
    figure: {
      kind: 'document',
      title: `Tips for ${k.name}`,
      lines: [
        `${a.base}: ${mark(values[0])}`,
        `${b.base}: ${mark(values[1])}`,
        `${c.base}: ${mark(values[2])}`,
        `Verb for the last sentence: to ${a.base}`,
      ],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `${k.name} `,
        ` ${a.base}. ${cap(k.pronoun)} `,
        ` ${b.base}. And ${k.pronoun} `,
        ` ${c.base}. So, ${values[0] ? 'yes' : 'no'}: ${k.pronoun} ${should(values[0])} `,
        '.',
      ],
      blanks: [
        ...values.map((v) => ({ mode: 'text' as const, accepted: shouldForms(v) })),
        { mode: 'text' as const, accepted: [a.base] },
      ],
    },
    hint: '« good idea » : on conseille ; « bad idea » : on déconseille. Le verbe ne prend aucune marque.',
    steps: [
      SHOULD_RULE,
      `Avec ${k.pronoun}, should ne change pas et le verbe reste à la base.`,
      `Réponse : **${values.map(should).join(', ')}, ${a.base}**`,
    ],
  };
}

const shouldSkill: Skill = {
  id: 'a5-should',
  title: 'Should et shouldn’t : conseiller',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Should** donne un **conseil** : You should drink some water.',
      '**Shouldn’t** (should not) déconseille : You shouldn’t shout.',
      'Ensuite vient la **base verbale**, sans to ni -s : He should sleep.',
    ],
    source: source('auxiliaires de modalité should / shouldn’t', '« Suggestions and obligations »'),
    sources: ['anglais-college-2025', 'bc-suggestions-obligations'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return shouldMeaning(rng);
    if (level === 2) return shouldPick(rng);
    if (level === 3) return shouldWrite(rng);
    if (level === 4) return coin(rng) ? shouldNegative(rng) : shouldTranslate(rng);
    return shouldDocument(rng);
  },
};

// ——— 2. could / couldn’t ———
const SKILLS: readonly Action[] = [
  action('swim', 'swims', 'swimming', 'nager'),
  action('read', 'reads', 'reading', 'lire'),
  action('ride a bike', 'rides a bike', 'riding a bike', 'faire du vélo'),
  action('draw', 'draws', 'drawing', 'dessiner'),
  action('skate', 'skates', 'skating', 'patiner'),
  action('cook', 'cooks', 'cooking', 'cuisiner'),
  action('count to ten', 'counts to ten', 'counting to ten', 'compter jusqu’à dix'),
];
const could = (yes: boolean) => (yes ? 'could' : 'couldn’t');
const couldForms = (yes: boolean) => (yes ? ['could'] : ['couldn’t', 'could not']);
const knew = (name: string, a: Action, yes: boolean) =>
  `À cinq ans, ${name} ${yes ? 'savait' : 'ne savait pas'} ${a.fr}.`;
const AGE = 'When I was five';
const WHY_PRESENT_CAN = 'can parle du présent : pour le passé, il faut could ou couldn’t.';
const COULD_RULE = 'Au passé, could dit qu’on savait faire ; couldn’t qu’on ne savait pas.';

function couldMeaning(rng: Rng): QuestionDraft {
  const a = rng.pick(SKILLS);
  const right = `À cinq ans, je savais ${a.fr}.`;
  const { answer, traps } = choice(rng, right, [
    { label: `Maintenant, je sais ${a.fr}.`, why: WHY_PRESENT_CAN },
    { label: `À cinq ans, je ne savais pas ${a.fr}.`, why: 'could est affirmatif ; la négation serait couldn’t.' },
  ]);
  return {
    prompt: `Que veut dire « ${AGE}, I could ${a.base}. » ?`,
    answer,
    traps,
    hint: 'Le début de la phrase situe le moment. La phrase est-elle négative ?',
    steps: [COULD_RULE, `Réponse : **${right}**`],
  };
}

function couldPick(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const a = rng.pick(SKILLS);
  const yes = coin(rng);
  const { answer, traps } = choice(rng, could(yes), [
    { label: could(!yes), why: yes ? 'La phrase française est affirmative.' : 'La phrase française est négative.' },
    { label: yes ? 'can' : 'can’t', why: WHY_PRESENT_CAN },
    { label: 'coulds', why: WHY_MOD_S },
  ]);
  return {
    prompt: `Complète : « When ${k.pronoun} was five, ${k.name} … ${a.base}. » (${knew(k.name, a, yes)})`,
    answer,
    traps,
    hint: 'Repère le temps de la phrase, puis son sens : oui ou non ?',
    steps: [COULD_RULE, `Réponse : **${could(yes)}**`],
  };
}

function couldWrite(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const a = rng.pick(SKILLS);
  const yes = coin(rng);
  const accepted = couldForms(yes).map((m) => `${m} ${a.base}`);
  return {
    prompt: `Écris la fin de la phrase avec could ou couldn’t : « When ${k.pronoun} was five, ${k.name} … . » (${knew(k.name, a, yes)}) Verbe utile : to ${a.base}.`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${could(!yes)} ${a.base}`, why: COULD_RULE },
      { text: `${yes ? 'can' : 'can’t'} ${a.base}`, why: WHY_PRESENT_CAN },
      { text: `${could(yes)} to ${a.base}`, why: WHY_MOD_BASE },
      { text: `${could(yes)} ${a.s}`, why: WHY_MOD_BASE },
    ]),
    hint: 'D’abord l’auxiliaire du passé, affirmatif ou négatif, puis le verbe sans rien lui ajouter.',
    steps: [COULD_RULE, WHY_MOD_BASE, `Réponse : **${at(accepted, 0)}**`],
  };
}

type Use = 'able' | 'unable' | 'request' | 'permission' | 'suggestion';
const USES: Readonly<Record<Use, { readonly label: string; readonly lines: readonly string[] }>> = {
  able: {
    label: 'dire ce qu’on savait faire',
    lines: ['I could swim when I was four.', 'He could walk when he was two.'],
  },
  unable: {
    label: 'dire ce qu’on ne savait pas faire',
    lines: ['She couldn’t ride a bike when she was three.', 'My dad couldn’t cook at ten.'],
  },
  request: {
    label: 'demander poliment à quelqu’un de faire quelque chose',
    lines: ['Could you take a message, please?', 'Could you open the door, please?'],
  },
  permission: {
    label: 'demander poliment une autorisation',
    lines: ['Could I ask a question, please?', 'Could we go home now, please?'],
  },
  suggestion: {
    label: 'faire une suggestion',
    lines: ['We could meet at the weekend.', 'You could eat out tonight.'],
  },
};

function couldUses(rng: Rng): QuestionDraft {
  const rows = rng.shuffle(Object.values(USES)).map((u) => [rng.pick(u.lines), u.label] as const);
  return {
    prompt: `Associe chaque phrase à ce qu’elle sert à faire : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Une question avec « you » ou avec « I » ? Un âge passé ? Une idée pour plus tard ?',
    steps: matchSteps('could parle du passé, demande poliment ou propose une idée.', rows),
  };
}

const ASKED: readonly Who[] = PEOPLE;

function couldTransform(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKED);
  const a = rng.pick(SKILLS);
  if (coin(rng)) {
    const accepted = [`${s.text} couldn’t ${a.base}`, `${s.text} could not ${a.base}`];
    return {
      prompt: `Écris toute la phrase à la forme négative : « ${s.text} could ${a.base}. »`,
      answer: { kind: 'text', accepted: ended(accepted) },
      traps: endedTraps([
        { text: `${s.text} didn’t could ${a.base}`, why: WHY_MOD_DO },
        { text: `${s.text} doesn’t could ${a.base}`, why: WHY_MOD_DO },
        { text: `${s.text} not could ${a.base}`, why: 'La négation se place après could.' },
        { text: `${s.text} couldn’t to ${a.base}`, why: WHY_MOD_BASE },
      ]),
      hint: 'Un seul élément change : celui qui précède le verbe.',
      steps: ['La négation de could est couldn’t (could not).', `Réponse : **${at(accepted, 0)}.**`],
    };
  }
  const good = `Could ${s.mid} ${a.base}`;
  return {
    prompt: `Transforme en question (réponse attendue : oui ou non) : « ${s.text} could ${a.base}. »`,
    answer: { kind: 'text', accepted: ended([good], ['?']) },
    traps: endedTraps(
      [
        { text: `Did ${s.mid} could ${a.base}`, why: WHY_MOD_DO },
        { text: `Does ${s.mid} could ${a.base}`, why: WHY_MOD_DO },
        { text: `Could ${s.mid} to ${a.base}`, why: WHY_MOD_BASE },
        { text: `${s.text} could ${a.base}`, why: 'Dans la question, could passe devant le sujet.' },
      ],
      ['?'],
    ),
    hint: 'Aucun mot à ajouter : change seulement l’ordre de deux éléments.',
    steps: ['Dans la question, could passe devant le sujet.', `Réponse : **${good}?**`],
  };
}

function couldDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [a, b, c] = some(rng, SKILLS, 3) as [Action, Action, Action];
  const values = [coin(rng), coin(rng), coin(rng)] as const;
  const word = (v: boolean) => (v ? 'yes' : 'no');
  return {
    prompt: `Lis la fiche sur ${k.name} à cinq ans (yes = savait le faire, no = ne savait pas), puis complète avec could, couldn’t, Yes ou No. Au dernier trou, mets can ou can’t pour aujourd’hui.`,
    figure: {
      kind: 'document',
      title: `${k.name} at five`,
      lines: [
        `${a.base}: ${word(values[0])}`,
        `${b.base}: ${word(values[1])}`,
        `${c.base}: ${word(values[2])}`,
        `Today: ${a.base}: yes`,
      ],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        `At five, ${k.name} `,
        ` ${a.base}. ${cap(k.pronoun)} `,
        ` ${b.base}. « `,
        ` ${k.pronoun} ${c.base}? » « `,
        `, ${k.pronoun} `,
        `. » Today, ${k.pronoun} `,
        ` ${a.base}.`,
      ],
      blanks: [
        { mode: 'text', accepted: couldForms(values[0]) },
        { mode: 'text', accepted: couldForms(values[1]) },
        { mode: 'text', accepted: ['Could'] },
        { mode: 'text', accepted: [values[2] ? 'Yes' : 'No'] },
        { mode: 'text', accepted: couldForms(values[2]) },
        { mode: 'text', accepted: ['can'] },
      ],
    },
    hint: 'Les premières lignes parlent du passé, la dernière du présent.',
    steps: [
      COULD_RULE,
      'Dans la question, could passe devant le sujet. Aujourd’hui, on revient à can.',
      `Réponse : **${could(values[0])}, ${could(values[1])}, Could, ${values[2] ? 'Yes' : 'No'}, ${could(values[2])}, can**`,
    ],
  };
}

const couldSkill: Skill = {
  id: 'a5-could',
  title: 'Could et couldn’t : passé et politesse',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Could** et **couldn’t** disent ce qu’on savait ou ne savait pas faire : I could swim when I was four.',
      'Could sert aussi à demander poliment (Could you help me, please?) ou à faire une **suggestion** (We could meet).',
      'Ensuite vient la **base verbale** ; pour la question, could passe devant le sujet.',
    ],
    source: source(
      'auxiliaires de modalité could / couldn’t',
      '« Modals, could and couldn’t », « Can and could », « Suggestions and obligations »',
    ),
    sources: ['anglais-college-2025', 'bck-could', 'bc-can-could', 'bc-suggestions-obligations'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return couldMeaning(rng);
    if (level === 2) return couldPick(rng);
    if (level === 3) return couldWrite(rng);
    if (level === 4) return coin(rng) ? couldUses(rng) : couldTransform(rng);
    return couldDocument(rng);
  },
};

// ——— 3. I wish to, I would love to ———
const DREAMS: readonly Action[] = [
  action('visit Canada', 'visits Canada', 'visiting Canada', 'visiter le Canada'),
  action(
    'see the Tower of London',
    'sees the Tower of London',
    'seeing the Tower of London',
    'voir la Tour de Londres',
  ),
  action('learn the violin', 'learns the violin', 'learning the violin', 'apprendre le violon'),
  action('meet a writer', 'meets a writer', 'meeting a writer', 'rencontrer un écrivain'),
  action('fly a plane', 'flies a plane', 'flying a plane', 'piloter un avion'),
  action('live by the sea', 'lives by the sea', 'living by the sea', 'vivre au bord de la mer'),
  action('work with animals', 'works with animals', 'working with animals', 'travailler avec des animaux'),
];
const WHY_TO = 'Après wish ou would love, le verbe est introduit par to : to + base verbale.';
const WHY_BASE_TO = 'Après to, le verbe reste à la base verbale.';
const WHY_WOULD_S = 'would ne change jamais : pas de -s à love après would.';
const WHY_WISHES = 'Avec wish seul, he, she ou une seule personne prennent -es : wishes ; les autres gardent wish.';
const WISH_RULE = 'Pour un souhait : I wish to + base verbale, ou I would love to (I’d love to) + base verbale.';

function wishMeaning(rng: Rng): QuestionDraft {
  const a = rng.pick(DREAMS);
  const wish = coin(rng);
  const line = `I ${wish ? 'wish to' : 'would love to'} ${a.base}.`;
  const right = `Je souhaite ${a.fr}.`;
  const { answer, traps } = choice(rng, right, [
    { label: `J’ai l’habitude de ${a.fr}.`, why: 'La phrase dit un souhait, pas une habitude.' },
    { label: `Je dois ${a.fr}.`, why: 'Une obligation se dit avec must ; ici c’est une envie.' },
  ]);
  return {
    prompt: `Que veut dire « ${line} » ?`,
    answer,
    traps,
    hint: 'La personne parle-t-elle d’une envie, d’une habitude ou d’un devoir ?',
    steps: [WISH_RULE, `Réponse : **${right}**`],
  };
}

function wishForm(rng: Rng): QuestionDraft {
  const a = rng.pick(DREAMS);
  const start = rng.pick(['I would love', 'I wish', 'We would love', 'They wish']);
  const good = `${start} to ${a.base}.`;
  const { answer, traps } = choice(rng, good, [
    { label: `${start} ${a.base}.`, why: WHY_TO },
    { label: `${start} to ${a.ing}.`, why: WHY_BASE_TO },
    { label: `${start} to ${a.s}.`, why: WHY_BASE_TO },
  ]);
  return {
    prompt: `Quelle phrase exprime correctement ce souhait : ${a.fr} (début : « ${start} ») ?`,
    answer,
    traps,
    hint: 'Regarde le petit mot entre le début de la phrase et le verbe, puis la forme du verbe.',
    steps: [WHY_TO, `Réponse : **${good}**`],
  };
}

function wishWrite(rng: Rng): QuestionDraft {
  const a = rng.pick(DREAMS);
  const wish = coin(rng);
  const start = wish ? 'wish to' : 'would love to';
  const accepted = wish ? [`wish to ${a.base}`] : [`would love to ${a.base}`, `’d love to ${a.base}`];
  const lead = wish ? 'wish' : 'would love';
  return {
    prompt: `Écris la fin de la phrase pour dire un souhait avec « ${lead} » ; le verbe est « ${a.base} » (${a.fr}) : « I … . »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps([
      { text: `${lead} ${a.base}`, why: WHY_TO },
      { text: `${start} ${a.ing}`, why: WHY_BASE_TO },
      { text: `${start} ${a.s}`, why: WHY_BASE_TO },
    ]),
    hint: 'Trois éléments : l’expression demandée, un petit mot de liaison, la base verbale.',
    steps: [WISH_RULE, `Réponse : **I ${at(accepted, 0)}.**`],
  };
}

function wishPerson(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const a = rng.pick(DREAMS);
  const wish = coin(rng);
  const accepted = wish
    ? [`${k.name} wishes to ${a.base}`]
    : [`${k.name} would love to ${a.base}`, `${k.name}’d love to ${a.base}`];
  const traps: Trap[] = wish
    ? [
        { text: `${k.name} wish to ${a.base}`, why: WHY_WISHES },
        { text: `${k.name} wishes ${a.base}`, why: WHY_TO },
        { text: `${k.name} wishes to ${a.s}`, why: WHY_BASE_TO },
      ]
    : [
        { text: `${k.name} would loves to ${a.base}`, why: WHY_WOULD_S },
        { text: `${k.name} woulds love to ${a.base}`, why: 'would ne prend jamais de -s.' },
        { text: `${k.name} would love ${a.base}`, why: WHY_TO },
        { text: `${k.name} would love to ${a.s}`, why: WHY_BASE_TO },
      ];
  return {
    prompt: `Écris la phrase pour « ${k.name} », avec « ${wish ? 'wish' : 'would love'} » : « I ${wish ? 'wish' : 'would love'} to ${a.base}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: endedTraps(traps),
    hint: 'Demande-toi si le verbe qui exprime le souhait doit changer avec une seule personne.',
    steps: [wish ? WHY_WISHES : WHY_WOULD_S, `Réponse : **${at(accepted, 0)}.**`],
  };
}

function wishDocument(rng: Rng): QuestionDraft {
  const [n1, n2, n3] = some(rng, ['Ana', 'Lisa', 'Yuna', 'Tom', 'Emir', 'Paul'], 3) as [string, string, string];
  const [a, b, c] = some(rng, DREAMS, 3) as [Action, Action, Action];
  const first = rng.pick([n1, n2]);
  const one = first === n1 ? a : b;
  return {
    prompt: `Lis les souhaits, puis complète le résumé : qui souhaite ${one.fr}, la forme de wish, le petit mot manquant et un verbe.`,
    figure: {
      kind: 'document',
      title: 'Our dreams',
      lines: [`${n1}: “I wish to ${a.base}.”`, `${n2}: “I wish to ${b.base}.”`, `${n3}: “I would love to ${c.base}.”`],
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: [
        '',
        ` wishes to ${one.base}. ${n1} and ${n2} both `,
        ` to do something special. ${n3} would love `,
        ` do something too: ${n3} would love to `,
        '.',
      ],
      blanks: [
        listBlank(rng, first, [first === n1 ? n2 : n1, n3]),
        { mode: 'text', accepted: ['wish'] },
        { mode: 'text', accepted: ['to'] },
        { mode: 'text', accepted: [c.base] },
      ],
    },
    hint: 'Pour le deuxième trou, compte les personnes qui forment le sujet.',
    steps: [WISH_RULE, 'Avec deux personnes, wish ne prend pas -es.', `Réponse : **${first}, wish, to, ${c.base}**`],
  };
}

const wishSkill: Skill = {
  id: 'a5-souhait',
  title: 'I wish to, I would love to : dire un souhait',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**I wish to** et **I would love to** (I’d love to) disent un **souhait** : I’d love to visit Canada.',
      'Ensuite : to + **base verbale**. Avec he ou she : he wishes to, mais she would love to.',
    ],
    source: source(
      'expression du souhait sous forme lexicalisée (I wish to, I would love to)',
      '« Verbs followed by the infinitive », « Will and would »',
    ),
    sources: ['anglais-college-2025', 'bc-verbs-infinitive', 'bc-will-would'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return wishMeaning(rng);
    if (level === 2) return wishForm(rng);
    if (level === 3) return wishWrite(rng);
    if (level === 4) return wishPerson(rng);
    return wishDocument(rng);
  },
};

// ——— 4. I think, in my opinion ———
interface View {
  /** Phrase qui donne l'avis, sans introducteur. */
  readonly en: string;
  readonly fr: string;
  /** Mots de la phrase, pour la remise en ordre. */
  readonly words: readonly [string, string, string];
}
const view = (subjectText: string, link: string, rest: string, fr: string): View => ({
  en: `${subjectText} ${link} ${rest}`,
  fr,
  words: [subjectText, link, rest],
});
const VIEWS: readonly View[] = [
  view('this film', 'is', 'great', 'ce film est génial'),
  view('the museum', 'is', 'very interesting', 'le musée est très intéressant'),
  view('this song', 'is', 'too long', 'cette chanson est trop longue'),
  view('the castle', 'looks', 'amazing', 'le château a l’air extraordinaire'),
  view('English breakfast', 'is', 'delicious', 'le petit déjeuner anglais est délicieux'),
  view('this poster', 'looks', 'strange', 'cette affiche a l’air étrange'),
];

interface Opener {
  readonly en: string;
  readonly fr: string;
  /** Écritures acceptées devant la phrase. */
  readonly accepted: readonly string[];
}
const opener = (en: string, fr: string, accepted: readonly string[]): Opener => ({ en, fr, accepted });
const OPENERS: readonly Opener[] = [
  opener('I think', 'Je pense que', ['I think', 'I think that']),
  opener('I believe', 'Je crois que', ['I believe', 'I believe that', 'I think', 'I think that']),
  opener('For me,', 'Pour moi,', ['For me', 'For me,']),
  opener('In my opinion,', 'À mon avis,', ['In my opinion', 'In my opinion,']),
];
const OPINION_RULE = 'I think, I believe, For me et In my opinion annoncent que l’on donne son avis.';

function opinionSpot(rng: Rng): QuestionDraft {
  const v = rng.pick(VIEWS);
  const o = rng.pick(OPENERS);
  const right = `${o.en} ${v.en}.`;
  const { answer, traps } = choice(rng, right, [
    { label: 'The film starts at six.', why: 'C’est une information, pas un avis personnel.' },
    { label: 'Open your book, please.', why: 'C’est une consigne, pas un avis.' },
  ]);
  return {
    prompt: 'Quelle phrase donne un avis personnel ?',
    answer,
    traps,
    hint: 'Cherche l’expression qui dit : c’est mon point de vue.',
    steps: [OPINION_RULE, `Réponse : **${right}**`],
  };
}

function opinionMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, OPENERS, 3).map((o) => [o.en.replace(',', ''), o.fr.replace(',', '')] as const);
  return {
    prompt: `Associe chaque expression à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Deux expressions ont un verbe, les autres non. Quel verbe veut dire « croire » ?',
    steps: matchSteps(OPINION_RULE, rows),
  };
}

function opinionWrite(rng: Rng): QuestionDraft {
  const v = rng.pick(VIEWS);
  const o = rng.pick(OPENERS);
  return {
    prompt: `Écris en anglais le début de l’avis « ${o.fr} » : « … ${v.en}. » (${v.fr})`,
    answer: { kind: 'text', accepted: o.accepted },
    traps: [
      { text: 'To my opinion', why: 'On dit In my opinion, avec in.' },
      { text: 'At my opinion', why: 'On dit In my opinion, avec in.' },
      { text: 'I am thinking', why: 'Pour donner un avis, think reste au présent simple.' },
      { text: 'I am believing', why: 'believe ne prend pas la forme en -ing.' },
    ],
    hint: 'Une expression toute faite, au présent simple s’il y a un verbe.',
    steps: [OPINION_RULE, `Réponse : **${o.en} ${v.en}.**`],
  };
}

const MISTAKES: readonly (readonly [wrong: string, right: string, why: string])[] = [
  ['To my opinion,', 'In my opinion', 'On dit In my opinion, avec in.'],
  ['At my opinion,', 'In my opinion', 'On dit In my opinion, avec in.'],
  ['I am thinking', 'I think', 'Pour un avis, think reste au présent simple.'],
  ['I am believing', 'I believe', 'believe ne prend pas la forme en -ing.'],
  ['For I,', 'For me', 'Après for vient le pronom complément : me.'],
];

function opinionFix(rng: Rng): QuestionDraft {
  const v = rng.pick(VIEWS);
  const [wrong, right, why] = rng.pick(MISTAKES);
  const accepted = [right, `${right},`, ...(right.startsWith('I ') ? [`${right} that`] : [])];
  return {
    prompt: `Corrige le début de cet avis, écris seulement l’expression juste : « ${wrong} ${v.en}. »`,
    answer: { kind: 'text', accepted },
    traps: [{ text: wrong.replace(',', ''), why }],
    hint: 'Garde le même sens et répare l’erreur : préposition, pronom ou temps du verbe.',
    steps: [why, `Réponse : **${right}**`],
  };
}

function opinionOrder(rng: Rng): QuestionDraft {
  const v = rng.pick(VIEWS);
  const o = rng.pick(OPENERS);
  const sorted = [o.en, v.words[0], v.words[1], `${v.words[2]}.`];
  const items = rng.shuffle(sorted);
  const shownItems = items.every((x, i) => x === sorted[i]) ? [...items].reverse() : items;
  return {
    prompt: `Remets dans l’ordre pour donner l’avis « ${o.fr} ${v.fr} » : ${quoted(shownItems)}`,
    answer: { kind: 'order', items: shownItems, correct: sorted.map((x) => shownItems.indexOf(x)) },
    hint: 'L’expression d’opinion ouvre la phrase ; ensuite le sujet, le verbe, puis la qualité.',
    steps: [OPINION_RULE, `Réponse : **${sorted.join(' ')}**`],
  };
}

function opinionDocument(rng: Rng): QuestionDraft {
  const names = some(rng, ['Ana', 'Lisa', 'Yuna', 'Tom', 'Emir', 'Paul'], 3);
  const openers = some(rng, ['I think', 'I believe', 'In my opinion,', 'For me,'], 3);
  const views = some(rng, VIEWS, 3);
  const asked = rng.shuffle([0, 1, 2]);
  const lines = names.map((n, i) => `${n}: “${at(openers, i)} ${at(views, i).en}.”`);
  const parts = [
    ...asked.map((p, i) => `${i === 0 ? '' : ' '}Who thinks that ${at(views, p).en}? `),
    ' And you? Complete: « In my ',
    ', this forum is useful. »',
  ];
  return {
    prompt: 'Lis le forum, retrouve qui donne chaque avis, puis complète la dernière expression.',
    figure: { kind: 'document', title: 'Class forum', lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts,
      blanks: [
        ...asked.map((p) =>
          listBlank(
            rng,
            at(names, p),
            names.filter((n) => n !== names[p]),
          ),
        ),
        { mode: 'text' as const, accepted: ['opinion'] },
      ],
    },
    hint: 'Relis chaque message et repère la chose dont il parle. La dernière expression veut dire « à mon avis ».',
    steps: [
      OPINION_RULE,
      'In my opinion veut dire « à mon avis ».',
      `Réponse : **${asked.map((p) => at(names, p)).join(', ')}, opinion**`,
    ],
  };
}

const opinionSkill: Skill = {
  id: 'a5-opinion',
  title: 'I think, in my opinion : donner son avis',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour donner ton **opinion** : **I think**, **I believe**, **For me** ou **In my opinion**, puis ta phrase.',
      'Exemple : In my opinion, this film is great. Pour un avis, think reste au présent simple : I think, sans -ing.',
    ],
    source: source('expression de l’opinion', '« Present continuous » (verbes sans forme en -ing)'),
    sources: ['anglais-college-2025', 'bc-present-continuous'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return opinionSpot(rng);
    if (level === 2) return opinionMatch(rng);
    if (level === 3) return opinionWrite(rng);
    if (level === 4) return coin(rng) ? opinionOrder(rng) : opinionFix(rng);
    return opinionDocument(rng);
  },
};

export const ENGLISH_ADVICE_CHAPTER: Chapter = {
  id: 'a5-modaux-souhait-opinion',
  subject: 'anglais',
  grade: '5e',
  domain: 'langue',
  title: 'Modaux, souhait, opinion',
  skills: [shouldSkill, couldSkill, wishSkill, opinionSkill],
};
