import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, de, shuffledOther, some } from './temps.ts';

/**
 * Anglais 6e — « Be + ing » (lot an-6e-04, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) ; règles et formes : British Council (voir be-ing-faits.ts : chaque fait y porte sa source
 * et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Règles : British Council, ${pages}.`;
const ABOUT = 'Écrit pour l’exercice.';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const coin = (rng: Rng) => rng.int(0, 1) === 0;
const quoted = (list: readonly string[]) => list.map((l) => `« ${l} »`).join(' ');
const unique = (list: readonly string[]) => [...new Set(list)];
/** Saisies acceptées : avec ou sans ponctuation finale. */
const ended = (forms: readonly string[], mark = '.') =>
  unique(forms).flatMap((f) => [f, `${f}${mark}`, `${f} ${mark}`]);
/** Erreurs typiques (reconnues avec ou sans ponctuation) ; une forme juste n'est jamais un piège. */
const wrongs = (list: readonly (readonly [string, string])[], right: readonly string[], mark = '.'): Trap[] => {
  const ok = new Set(right.map((r) => r.toLowerCase()));
  const kept = list.filter(([t], i) => !ok.has(t.toLowerCase()) && list.findIndex(([x]) => x === t) === i);
  return kept.flatMap(([t, why]) => ended([t], mark).map((text) => ({ text, why })));
};

/** Association : phrases à gauche, réponses mélangées à droite. */
function pairs(rng: Rng, rows: readonly (readonly [string, string])[]) {
  const left = rows.map((r) => r[0]);
  const right = shuffledOther(
    rng,
    rows.map((r) => r[1]),
  );
  return { kind: 'match' as const, left, right, pairs: rows.map((r) => right.indexOf(r[1])) };
}

type Be = 'am' | 'is' | 'are';
interface Subject {
  /** En début de phrase. */
  readonly text: string;
  /** Au milieu d'une phrase (question). */
  readonly mid: string;
  readonly be: Be;
  /** Sujet français suivi du verbe être. */
  readonly fr: string;
}
const subject = (text: string, be: Be, fr: string, mid = text): Subject => ({ text, mid, be, fr });
const I = subject('I', 'am', 'Je suis');
const SUBJECTS: readonly Subject[] = [
  I,
  subject('He', 'is', 'Il est', 'he'),
  subject('She', 'is', 'Elle est', 'she'),
  subject('We', 'are', 'Nous sommes', 'we'),
  subject('They', 'are', 'Ils sont', 'they'),
  subject('Tom', 'is', 'Tom est'),
  subject('Lisa', 'is', 'Lisa est'),
  subject('My parents', 'are', 'Mes parents sont', 'my parents'),
];
const OTHERS = SUBJECTS.filter((s) => s !== I);
const SHORT: Readonly<Record<Be, string>> = { am: '’m', is: '’s', are: '’re' };

interface Action {
  readonly base: string;
  readonly ing: string;
  /** 3e personne du présent simple. */
  readonly s: string;
  /** Orthographe fautive fréquente de la forme en -ing, s'il y en a une. */
  readonly typo?: string;
  readonly end: string;
  /** Infinitif français. */
  readonly fr: string;
}
const action = (forms: readonly [string, string, string], end: string, fr: string, typo?: string): Action => ({
  base: forms[0],
  ing: forms[1],
  s: forms[2],
  end,
  fr,
  ...(typo ? { typo } : {}),
});
/** Chaque forme en -ing est attestée dans be-ing-faits.ts (faits « forme-… »). */
export const ACTIONS: readonly Action[] = [
  action(['eat', 'eating', 'eats'], 'an apple', 'manger une pomme'),
  action(['play', 'playing', 'plays'], 'hockey', 'jouer au hockey'),
  action(['study', 'studying', 'studies'], 'English', 'étudier l’anglais'),
  action(['watch', 'watching', 'watches'], 'TV', 'regarder la télévision'),
  action(['read', 'reading', 'reads'], 'a comic', 'lire une BD'),
  action(['make', 'making', 'makes'], 'a cake', 'préparer un gâteau', 'makeing'),
  action(['wear', 'wearing', 'wears'], 'a red cap', 'porter une casquette rouge'),
  action(['sleep', 'sleeping', 'sleeps'], 'on the sofa', 'dormir sur le canapé'),
  action(['listen', 'listening', 'listens'], 'to music', 'écouter de la musique'),
  action(['cook', 'cooking', 'cooks'], 'dinner', 'préparer le dîner'),
  action(['clean', 'cleaning', 'cleans'], 'the kitchen', 'nettoyer la cuisine'),
  action(['swim', 'swimming', 'swims'], 'in the pool', 'nager dans la piscine', 'swiming'),
  action(['sit', 'sitting', 'sits'], 'in the garden', 's’asseoir dans le jardin', 'siting'),
  action(['talk', 'talking', 'talks'], 'to a friend', 'parler à un ami'),
  action(['work', 'working', 'works'], 'in the garden', 'travailler dans le jardin'),
];
/** « s’asseoir » : le français dirait « est assis », pas « en train de » : réservé aux énoncés en anglais. */
const SHOWN = ACTIONS.filter((a) => a.base !== 'sit');

const enTrain = (fr: string) => `en train ${/^[aeéiou]/.test(fr) ? 'd’' : 'de '}${fr}`;
const now = (s: Subject, a: Action) => `${s.fr} ${enTrain(a.fr)}.`;
const full = (s: Subject, a: Action, be: string = s.be) => `${s.text} ${be} ${a.ing} ${a.end}.`;
const WHY_NO_BE = 'Il manque be : le présent be + ing se construit avec am, is ou are, puis le verbe en -ing.';
const whyBe = (s: Subject) => `Avec « ${s.text} », be prend la forme « ${s.be} ».`;
const WHY_NO_ING = 'Après am, is ou are, le verbe prend -ing.';
const WHY_SIMPLE = 'C’est le présent simple : il dit une habitude, pas une action en cours.';
const whyTypo = (a: Action) => `L’orthographe change : on écrit « ${a.ing} ».`;
const FORM = 'Le présent be + ing : am, is ou are (selon le sujet), puis le verbe terminé par -ing.';

// ——— 1. La forme du présent be + ing ———
function formSpot(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const a = rng.pick(SHOWN);
  const { answer, traps } = choice(
    rng,
    s.be,
    (['am', 'is', 'are'] as const).filter((b) => b !== s.be).map((b) => ({ label: b, why: whyBe(s) })),
  );
  return {
    prompt: `Complète : « ${s.text} … ${a.ing} ${a.end}. » (${now(s, a)})`,
    answer,
    traps,
    hint: 'Regarde le sujet : quelle forme du verbe be va avec lui ?',
    steps: [whyBe(s), `Réponse : **${full(s, a)}**`],
  };
}

function formSentence(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const a = rng.pick(SHOWN);
  const good = full(s, a);
  const badBe = s.be === 'is' ? 'are' : 'is';
  const { answer, traps } = choice(rng, good, [
    { label: `${s.text} ${a.ing} ${a.end}.`, why: WHY_NO_BE },
    { label: `${s.text} ${s.be} ${a.base} ${a.end}.`, why: WHY_NO_ING },
    { label: full(s, a, badBe), why: whyBe(s) },
  ]);
  return {
    prompt: `Quelle phrase anglaise veut dire « ${now(s, a)} » ?`,
    answer,
    traps,
    hint: 'Vérifie deux choses : la forme de be avec ce sujet, puis la fin du verbe.',
    steps: [FORM, whyBe(s), `Réponse : **${good}**`],
  };
}

function formMatch(rng: Rng): QuestionDraft {
  const [a, b, c] = some(rng, ACTIONS, 3) as [Action, Action, Action];
  const subjects = [I, rng.pick(OTHERS.filter((s) => s.be === 'is')), rng.pick(OTHERS.filter((s) => s.be === 'are'))];
  const rows = rng.shuffle(
    [a, b, c].map((x, i) => {
      const s = at(subjects, i);
      return [s.text, `${s.be} ${x.ing} ${x.end}.`] as const;
    }),
  );
  const answer = pairs(rng, rows);
  return {
    prompt: `Associe chaque sujet ${quoted(rows.map((r) => r[0]))} à la fin de phrase qui lui convient : ${quoted(answer.right)}`,
    answer,
    hint: 'Chaque fin de phrase commence par une forme de be : trouve le sujet qui va avec.',
    steps: [
      'I va avec am ; he, she, une seule personne vont avec is ; we, they, plusieurs personnes vont avec are.',
      `Réponse : **${rows.map(([s, end]) => `${s} ${end}`).join(' ')}**`,
    ],
  };
}

const formRecognise = (rng: Rng) => (coin(rng) ? formSentence(rng) : formMatch(rng));

/** be + ing après le sujet, en forme pleine ou contractée, avec ou sans le complément et le sujet répété. */
const affirmative = (s: Subject, a: Action): string[] => {
  const verbs = [`${s.be} ${a.ing}`, `${SHORT[s.be]} ${a.ing}`];
  const sentences = [`${s.text} ${s.be} ${a.ing}`, `${s.text}${SHORT[s.be]} ${a.ing}`];
  return [...verbs, ...sentences].flatMap((f) => [f, `${f} ${a.end}`]);
};

function formWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const a = rng.pick(ACTIONS);
  const accepted = affirmative(s, a);
  const badBe = s.be === 'is' ? 'are' : 'is';
  return {
    prompt: `Mets le verbe au présent be + ing : « Look! ${s.text} … ${a.end}. » (to ${a.base})`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [a.ing, WHY_NO_BE],
        [`${s.be} ${a.base}`, WHY_NO_ING],
        [a.s, WHY_SIMPLE],
        [`${badBe} ${a.ing}`, whyBe(s)],
        ...(a.typo ? [[`${s.be} ${a.typo}`, whyTypo(a)] as const] : []),
      ],
      accepted,
    ),
    hint: 'Il faut écrire deux mots : le verbe be accordé au sujet, puis le verbe avec sa terminaison.',
    steps: [FORM, whyBe(s), `La forme en -ing de « ${a.base} » est « ${a.ing} ».`, `Réponse : **${full(s, a)}**`],
  };
}

/** Sujet + be + not, sous ses écritures justes. */
const negated = (s: Subject): string[] => {
  const long = `${s.text} ${s.be} not`;
  const stuck = `${s.text}${SHORT[s.be]} not`;
  if (s.be === 'am') return [long, stuck];
  return [long, `${s.text} ${s.be}n’t`, stuck];
};

function formNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const a = rng.pick(ACTIONS);
  const accepted = negated(s).map((n) => `${n} ${a.ing} ${a.end}`);
  const doing = s.be === 'is' ? 'doesn’t' : 'don’t';
  return {
    prompt: `Écris une phrase négative au présent be + ing avec ces éléments : « ${s.mid} / ${a.base} / ${a.end} »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [`${s.text} ${doing} ${a.base} ${a.end}`, WHY_SIMPLE],
        [`${s.text} ${doing} ${a.ing} ${a.end}`, 'La négation de be + ing se fait avec be, sans do ni does.'],
        [`${s.text} not ${a.ing} ${a.end}`, WHY_NO_BE],
        [`${s.text} ${s.be} not ${a.base} ${a.end}`, WHY_NO_ING],
        ...(a.typo ? [[`${s.text} ${s.be} not ${a.typo} ${a.end}`, whyTypo(a)] as const] : []),
      ],
      accepted,
    ),
    hint: 'Aucun do ici : la négation se place juste après le verbe be.',
    steps: [
      FORM,
      'À la forme négative, not (ou n’t) se place après am, is ou are.',
      `Réponse : **${at(accepted, 0)}.**`,
    ],
  };
}

/** Une question posée à la personne qui parle (« your parents ») est aussi correcte. */
const mids = (s: Subject): readonly string[] =>
  s.mid.startsWith('my ') ? [s.mid, s.mid.replace('my ', 'your ')] : [s.mid];
const ASKED: readonly Subject[] = [subject('You', 'are', 'Tu es', 'you'), ...OTHERS.filter((s) => s.mid !== 'we')];

function formQuestion(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKED);
  const a = rng.pick(ACTIONS);
  const accepted = mids(s).map((m) => `${cap(s.be)} ${m} ${a.ing} ${a.end}`);
  const doing = s.be === 'is' ? 'Does' : 'Do';
  return {
    prompt: `Écris une question au présent be + ing avec ces éléments : « ${s.mid} / ${a.base} / ${a.end} »`,
    answer: { kind: 'text', accepted: ended(accepted, '?') },
    traps: wrongs(
      mids(s).flatMap((m) => [
        [`${doing} ${m} ${a.base} ${a.end}`, WHY_SIMPLE] as const,
        [`${doing} ${m} ${a.ing} ${a.end}`, 'La question avec be + ing se pose sans do ni does.'] as const,
        [`${cap(m)} ${s.be} ${a.ing} ${a.end}`, 'Dans la question, am, is ou are passe devant le sujet.'] as const,
        [`${cap(s.be)} ${m} ${a.base} ${a.end}`, WHY_NO_ING] as const,
        ...(a.typo ? [[`${cap(s.be)} ${m} ${a.typo} ${a.end}`, whyTypo(a)] as const] : []),
      ]),
      accepted,
      '?',
    ),
    hint: 'Quel mot vient avant le sujet dans une question avec be ?',
    steps: [FORM, 'Dans la question, am, is ou are passe devant le sujet.', `Réponse : **${at(accepted, 0)}?**`],
  };
}

const formHard = (rng: Rng) => (coin(rng) ? formNegative(rng) : formQuestion(rng));

const GIRLS = ['Ana', 'Lisa', 'Yuna'] as const;
const BOYS = ['Tom', 'Emir', 'Paul'] as const;
interface Kid {
  readonly name: string;
  readonly pronoun: 'he' | 'she';
}
const pickKid = (rng: Rng): Kid =>
  coin(rng) ? { name: rng.pick(GIRLS), pronoun: 'she' } : { name: rng.pick(BOYS), pronoun: 'he' };
/** Après un nom : « is swimming » ou « ’s swimming ». */
const isForms = (a: Action) => [`is ${a.ing}`, `’s ${a.ing}`];
const areForms = (a: Action) => [`are ${a.ing}`, `’re ${a.ing}`];

function formDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [habit, today, brother, parents] = some(rng, ACTIONS, 4) as [Action, Action, Action, Action];
  const first = coin(rng);
  const lines = [
    `Every Saturday — ${k.name}: ${habit.base} ${habit.end}`,
    `Now — ${k.name}: ${today.base} ${today.end}`,
    `Now — ${k.name}’s brother: ${brother.base} ${brother.end}`,
    `Now — ${k.name}’s parents: ${parents.base} ${parents.end}`,
  ];
  const kidParts = {
    head: `Every Saturday, ${k.name} `,
    middle: ` ${habit.end}, but today ${k.pronoun} `,
    tail: ` ${today.end}. `,
  };
  const family = [
    { before: `${k.name}’s brother `, accepted: isForms(brother), after: ` ${brother.end}. ` },
    { before: `${k.name}’s parents `, accepted: areForms(parents), after: ` ${parents.end}. ` },
  ];
  if (!first) family.reverse();
  const accepted = [[habit.s], isForms(today), ...family.map((f) => f.accepted)];
  const parts = [
    kidParts.head,
    kidParts.middle,
    `${kidParts.tail}${at(family, 0).before}`,
    `${at(family, 0).after}${at(family, 1).before}`,
    at(family, 1).after.trimEnd(),
  ];
  return {
    prompt: `Lis les notes sur la famille ${de(k.name)}, puis écris chaque verbe au bon temps : présent simple pour l’habitude, présent be + ing pour ce qui se passe maintenant.`,
    figure: { kind: 'document', title: 'Family notes', lines: rng.shuffle(lines), credit: ABOUT },
    answer: { kind: 'cloze', parts, blanks: accepted.map((list) => ({ mode: 'text' as const, accepted: list })) },
    hint: 'Pour chaque trou, retrouve la ligne : « Every Saturday » ou « Now » ? Puis compte les personnes.',
    steps: [
      `Une habitude se dit au présent simple : avec ${k.pronoun}, le verbe prend la terminaison de la 3e personne.`,
      'Ce qui se passe maintenant se dit avec be + ing : is pour une personne, are pour plusieurs.',
      `Réponse : **${accepted.map((list) => at(list, 0)).join(', ')}**`,
    ],
  };
}

const present: Skill = {
  id: 'a6-be-ing-present',
  title: 'Le présent be + ing',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **présent be + ing** : **am**, **is** ou **are**, puis la **forme en -ing** du verbe. I’m playing. She is reading.',
      'Négation : not après be (He isn’t sleeping). Question : be passe devant le sujet (Are you listening?).',
      'Attention à l’écriture de certains verbes : make → making, swim → swimming, sit → sitting.',
    ],
    source: source('présent be + ing, formes courantes', '« Present continuous »'),
    sources: [
      'anglais-college-2025',
      'bc-present-continuous',
      'bck-present-simple-continuous',
      'bck-continuous-future',
      'bc-ing-forms',
      'bc-continuous-aspect',
      'bck-like-ing',
    ],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return formSpot(rng);
    if (level === 2) return formRecognise(rng);
    if (level === 3) return formWrite(rng);
    if (level === 4) return formHard(rng);
    return formDocument(rng);
  },
};

// ——— 2. Reconnaître une action en cours ———
const THIRD: readonly Subject[] = SUBJECTS.filter((s) => s.be === 'is');
const habit = (s: Subject, a: Action, when = 'every day') => `${s.text} ${a.s} ${a.end} ${when}.`;
const WHY_HABIT = 'Cette phrase est au présent simple : elle dit une habitude.';
const RECOGNISE = 'Une action en cours se dit avec be + ing ; une habitude, avec le présent simple.';

function nowSpot(rng: Rng): QuestionDraft {
  const [s, t] = some(rng, THIRD, 2) as [Subject, Subject];
  const [a, b, c] = some(rng, ACTIONS, 3) as [Action, Action, Action];
  const good = full(s, a);
  const { answer, traps } = choice(rng, good, [
    { label: habit(t, b), why: WHY_HABIT },
    { label: `${s.text} can ${c.base} ${c.end}.`, why: 'can dit qu’on sait faire, pas qu’on est en train de faire.' },
  ]);
  return {
    prompt: 'Quelle phrase parle d’une action en train de se passer ?',
    answer,
    traps,
    hint: 'Cherche le verbe be suivi d’un verbe en -ing.',
    steps: [RECOGNISE, `Réponse : **${good}**`],
  };
}

function nowMeaning(rng: Rng): QuestionDraft {
  const s = rng.pick(THIRD);
  const a = rng.pick(SHOWN);
  const who = s.fr.replace(/ est$/, '');
  const good = now(s, a);
  const { answer, traps } = choice(rng, good, [
    {
      label: `${who} a l’habitude ${/^[aeéiou]/.test(a.fr) ? 'd’' : 'de '}${a.fr}.`,
      why: 'L’habitude se dit au présent simple.',
    },
    { label: `${who} sait ${a.fr}.`, why: 'Pour dire qu’on sait faire, l’anglais emploie can.' },
    { label: `${who} veut ${a.fr}.`, why: 'Pour dire qu’on veut faire, l’anglais emploie want to.' },
  ]);
  return {
    prompt: `Que veut dire « ${full(s, a)} » ?`,
    answer,
    traps,
    hint: 'Que montre la construction be + verbe en -ing ?',
    steps: ['be + ing dit ce qui se passe au moment où l’on parle : « en train de ».', `Réponse : **${good}**`],
  };
}

function nowMatch(rng: Rng): QuestionDraft {
  const [a, b, c] = some(rng, ACTIONS, 3) as [Action, Action, Action];
  const [s, t, u] = some(rng, THIRD, 3) as [Subject, Subject, Subject];
  const rows = rng.shuffle([
    [full(s, a), 'action en cours'],
    [habit(t, b), 'habitude'],
    [`${u.text} can ${c.base} ${c.end}.`, 'ce qu’on sait faire'],
  ] as (readonly [string, string])[]);
  return {
    prompt: `Associe chaque phrase à ce qu’elle dit : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Regarde le verbe : be + ing, can, ou un présent simple avec « every day » ?',
    steps: [RECOGNISE, `Réponse : **${rows.map(([line, use]) => `${line} = ${use}`).join(' ; ')}**`],
  };
}

const nowRecognise = (rng: Rng) => (coin(rng) ? nowMeaning(rng) : nowMatch(rng));

const NOW_CLUES = ['Look!', 'Listen!', 'Be quiet!'] as const;
const HABIT_CLUES = ['every day', 'every Saturday', 'every morning'] as const;

function nowChoose(rng: Rng): QuestionDraft {
  const s = rng.pick(THIRD);
  const a = rng.pick(ACTIONS);
  const current = coin(rng);
  const clue = rng.pick(current ? NOW_CLUES : HABIT_CLUES);
  const sentence = current ? `${clue} ${s.text} … ${a.end}.` : `${s.text} … ${a.end} ${clue}.`;
  const accepted = current ? affirmative(s, a) : [a.s, `${a.s} ${a.end}`, `${s.text} ${a.s}`];
  const why = current
    ? `« ${clue} » montre que l’action se passe maintenant : be + ing.`
    : `« ${clue} » montre une habitude : présent simple.`;
  return {
    prompt: `Présent simple ou présent be + ing ? Complète avec « ${a.base} » : « ${sentence} »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      current
        ? [
            [a.s, why],
            [a.base, why],
            [a.ing, WHY_NO_BE],
          ]
        : [
            [`is ${a.ing}`, why],
            [a.base, 'Au présent simple, avec une seule personne, le verbe prend sa terminaison.'],
          ],
      accepted,
    ),
    hint: 'Cherche le mot ou l’expression qui dit « maintenant » ou « d’habitude ».',
    steps: [RECOGNISE, why, `Réponse : **${at(accepted, 0)}**`],
  };
}

const STATES = [
  { base: 'like', s: 'likes', ing: 'liking', end: 'this song' },
  { base: 'want', s: 'wants', ing: 'wanting', end: 'a glass of water' },
  { base: 'know', s: 'knows', ing: 'knowing', end: 'the answer' },
] as const;
const WHY_STATE = 'like, want et know disent un goût, une envie ou un savoir : en général, pas de be + ing.';

function nowContrast(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [usual, current] = some(rng, ACTIONS, 2) as [Action, Action];
  const state = rng.pick(STATES);
  const day = rng.pick(['on Mondays', 'on Saturdays', 'every evening'] as const);
  const negative = coin(rng);
  const habitForms = negative ? [`doesn’t ${usual.base}`, `does not ${usual.base}`] : [usual.s];
  const habitHint = negative ? `not ${usual.base}` : usual.base;
  return {
    prompt: `Présent simple ou présent be + ing ? Complète les phrases sur ${k.name} (${day} : « ${habitHint} ${usual.end} » ; en ce moment : « ${current.base} ${current.end} » ; enfin : « ${state.base} ${state.end} »).`,
    answer: {
      kind: 'cloze',
      parts: [
        `${cap(day)}, ${k.name} `,
        ` (${habitHint}) ${usual.end}, but at the moment ${k.pronoun} `,
        ` (${current.base}) ${current.end}. ${cap(k.pronoun)} `,
        ` (${state.base}) ${state.end}.`,
      ],
      blanks: [habitForms, isForms(current), [state.s]].map((accepted) => ({ mode: 'text' as const, accepted })),
    },
    hint: 'Trois verbes, trois questions : habitude ? en train de se faire ? ou goût, envie, savoir ?',
    steps: [
      `« ${cap(day)} » annonce une habitude : présent simple.`,
      '« at the moment » annonce une action en cours : be + ing.',
      WHY_STATE,
      `Réponse : **${at(habitForms, 0)}, is ${current.ing}, ${state.s}**`,
    ],
  };
}

function nowDocument(rng: Rng): QuestionDraft {
  const writer = pickKid(rng);
  const sister = rng.pick(GIRLS.filter((g) => g !== writer.name));
  const [mine, myNow, hers, herNow] = some(rng, SHOWN, 4) as [Action, Action, Action, Action];
  const order = coin(rng);
  const me = [`I ${mine.base} ${mine.end} every Saturday, but today I’m ${myNow.ing} ${myNow.end}.`];
  const her = [
    `My sister ${sister} usually ${hers.s} ${hers.end} in the morning.`,
    `Look, she’s ${herNow.ing} ${herNow.end} now!`,
  ];
  const lines = [`Hi! This is ${writer.name}.`, ...(order ? [...me, ...her] : [...her, ...me])];
  const nowRows = [
    { who: writer.name, a: myNow },
    { who: sister, a: herNow },
  ];
  /** L'habitude demandée est celle de la personne qui écrit : il faut passer de « I » à la 3e personne. */
  const asked = { who: writer.name, a: mine, when: 'every Saturday' };
  if (!order) nowRows.reverse();
  const first = at(nowRows, 0);
  const second = at(nowRows, 1);
  return {
    prompt: `Lis le message ${de(writer.name)}, puis raconte à la 3e personne ce que chacun fait en ce moment, et l’habitude ${de(writer.name)}.`,
    figure: { kind: 'document', title: 'A message', lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts: [
        `Right now, ${first.who} `,
        ` ${first.a.end} and ${second.who} `,
        ` ${second.a.end}. ${cap(asked.when)}, ${asked.who} `,
        ` ${asked.a.end}.`,
      ],
      blanks: [isForms(first.a), isForms(second.a), [asked.a.s]].map((accepted) => ({
        mode: 'text' as const,
        accepted,
      })),
    },
    hint: 'Dans le message, trie ce qui se passe maintenant et ce qui revient souvent. Change la personne du verbe.',
    steps: [
      '« today », « now » et be + ing annoncent l’action en cours ; « every Saturday » et « usually » annoncent l’habitude.',
      'À la 3e personne : is + verbe en -ing pour l’action en cours, terminaison de la 3e personne pour l’habitude.',
      `Réponse : **is ${first.a.ing}, is ${second.a.ing}, ${asked.a.s}**`,
    ],
  };
}

const recognise: Skill = {
  id: 'a6-be-ing-reconnaitre',
  title: 'Reconnaître une action en cours',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une **action en cours** se passe au moment où l’on parle : **be + ing**. Indices : now, at the moment, Look!',
      'Une habitude se dit au **présent simple** : She plays hockey every Saturday. But now she is reading.',
      'En général, like, want et know ne se mettent pas en be + ing : I like this song.',
    ],
    source: source(
      'reconnaître le présent be + ing',
      '« Present continuous », « Present simple and present continuous »',
    ),
    sources: ['anglais-college-2025', 'bc-present-continuous', 'bck-present-simple-continuous'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return nowSpot(rng);
    if (level === 2) return nowRecognise(rng);
    if (level === 3) return nowChoose(rng);
    if (level === 4) return nowContrast(rng);
    return nowDocument(rng);
  },
};

// ——— 3. be + ing pour un projet proche ———
interface Plan {
  readonly base: string;
  readonly ing: string;
  readonly s: string;
  readonly end: string;
  readonly fr: string;
  /** 3e personne du français : « Tom … ». */
  readonly frHe: string;
}
const plan = (forms: readonly [string, string, string], end: string, fr: string, frHe: string): Plan => ({
  base: forms[0],
  ing: forms[1],
  s: forms[2],
  end,
  fr,
  frHe,
});
const PLANS: readonly Plan[] = [
  plan(['visit', 'visiting', 'visits'], 'a museum', 'visiter un musée', 'visite un musée'),
  plan(['play', 'playing', 'plays'], 'badminton', 'jouer au badminton', 'joue au badminton'),
  plan(['go', 'going', 'goes'], 'to the cinema', 'aller au cinéma', 'va au cinéma'),
  plan(['have', 'having', 'has'], 'a party', 'faire une fête', 'fait une fête'),
  plan(['stay', 'staying', 'stays'], 'at home', 'rester à la maison', 'reste à la maison'),
  plan(['watch', 'watching', 'watches'], 'a film', 'regarder un film', 'regarde un film'),
  plan(['make', 'making', 'makes'], 'a cake', 'préparer un gâteau', 'prépare un gâteau'),
  plan(['cook', 'cooking', 'cooks'], 'dinner', 'préparer le dîner', 'prépare le dîner'),
  plan(['clean', 'cleaning', 'cleans'], 'the garage', 'nettoyer le garage', 'nettoie le garage'),
];
const LATER = [
  { en: 'tomorrow', fr: 'Demain' },
  { en: 'tonight', fr: 'Ce soir' },
  { en: 'this weekend', fr: 'Ce week-end' },
  { en: 'next week', fr: 'La semaine prochaine' },
] as const;
type Later = (typeof LATER)[number];
const PEOPLE: readonly Subject[] = SUBJECTS.filter((s) => ['Tom', 'Lisa'].includes(s.text));
const planned = (s: Subject, p: Plan, w: Later) => `${s.text} ${s.be} ${p.ing} ${p.end} ${w.en}.`;
const frPlan = (s: Subject, p: Plan, w: Later) => `${w.fr}, ${s.text} ${p.frHe}.`;
const FUTURE = 'be + ing avec un moment à venir (tomorrow, tonight, next week…) dit un projet déjà prévu.';

function planSpot(rng: Rng): QuestionDraft {
  const [s, t] = some(rng, THIRD, 2) as [Subject, Subject];
  const [p, q] = some(rng, PLANS, 2) as [Plan, Plan];
  const w = rng.pick(LATER);
  const good = planned(s, p, w);
  const { answer, traps } = choice(rng, good, [
    { label: `${s.text} ${s.be} ${p.ing} ${p.end} now.`, why: '« now » : l’action se passe maintenant.' },
    { label: `${t.text} ${q.s} ${q.end} every week.`, why: '« every week » : c’est une habitude.' },
  ]);
  return {
    prompt: 'Quelle phrase parle d’un projet à venir ?',
    answer,
    traps,
    hint: 'Regarde le moment indiqué à la fin de chaque phrase.',
    steps: [FUTURE, `Réponse : **${good}**`],
  };
}

function planSentence(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const p = rng.pick(PLANS);
  const w = rng.pick(LATER);
  const good = planned(s, p, w);
  const { answer, traps } = choice(rng, good, [
    { label: `${s.text} ${p.ing} ${p.end} ${w.en}.`, why: WHY_NO_BE },
    { label: `${s.text} are ${p.ing} ${p.end} ${w.en}.`, why: whyBe(s) },
    { label: `${s.text} ${s.be} ${p.ing} ${p.end} now.`, why: '« now » veut dire maintenant, pas plus tard.' },
  ]);
  return {
    prompt: `Quelle phrase anglaise veut dire « ${frPlan(s, p, w)} » (un projet prévu) ?`,
    answer,
    traps,
    hint: 'Vérifie la construction avec be, puis le moment.',
    steps: [FUTURE, `Réponse : **${good}**`],
  };
}

function planMatch(rng: Rng): QuestionDraft {
  const s = rng.pick(PEOPLE);
  const p = rng.pick(PLANS);
  const rows = some(rng, LATER, 3).map((w) => [planned(s, p, w), frPlan(s, p, w)] as const);
  return {
    prompt: `Associe chaque projet à sa traduction : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Les actions se ressemblent : compare le moment.',
    steps: [
      'tomorrow = demain ; tonight = ce soir ; this weekend = ce week-end ; next week = la semaine prochaine.',
      `Réponse : **${rows.map(([en, fr]) => `${en} = ${fr}`).join(' ; ')}**`,
    ],
  };
}

const planRecognise = (rng: Rng) => (coin(rng) ? planSentence(rng) : planMatch(rng));

function planWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS);
  const p = rng.pick(PLANS);
  const w = rng.pick(LATER);
  const verbs = [`${s.be} ${p.ing}`, `${SHORT[s.be]} ${p.ing}`];
  const going = [`${s.be} going to ${p.base}`, `${SHORT[s.be]} going to ${p.base}`];
  const accepted = [...verbs, ...going].flatMap((v) => {
    const glued = v.startsWith('’') ? `${s.text}${v}` : `${s.text} ${v}`;
    return [v, `${v} ${p.end}`, `${v} ${p.end} ${w.en}`, glued, `${glued} ${p.end}`, `${glued} ${p.end} ${w.en}`];
  });
  return {
    prompt: `C’est un projet prévu. Complète avec « ${p.base} » au présent be + ing : « ${s.text} … ${p.end} ${w.en}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [p.ing, WHY_NO_BE],
        [`${s.be} ${p.base}`, WHY_NO_ING],
        [p.s, 'Ici, on demande be + ing, la forme d’un projet déjà prévu.'],
        [`will ${p.ing}`, 'Le projet se dit avec be au présent (am, is, are), pas avec will.'],
      ],
      accepted,
    ),
    hint: 'Même construction que pour une action en cours : be accordé au sujet, puis le verbe.',
    steps: [FUTURE, whyBe(s), `Réponse : **${planned(s, p, w)}**`],
  };
}

/** Le moment peut se placer à la fin ou au début de la phrase. */
const timed = (sentences: readonly string[], w: Later): string[] =>
  sentences.flatMap((x) => [`${x} ${w.en}`, `${cap(w.en)}, ${x}`, `${cap(w.en)} ${x}`]);
/** Au milieu d'une phrase, le sujet perd sa majuscule (sauf I et les prénoms). */
const midTimed = (s: Subject, forms: readonly string[], w: Later): string[] =>
  timed(forms, w).map((f) => (s.mid === s.text ? f : f.replace(`, ${s.text}`, `, ${s.mid}`)));

function planAsk(rng: Rng): QuestionDraft {
  const s = rng.pick(ASKED);
  const p = rng.pick(PLANS);
  const w = rng.pick(LATER);
  if (coin(rng)) {
    const base = mids(s).map((m) => `${cap(s.be)} ${m} ${p.ing} ${p.end}`);
    const accepted = base.flatMap((x) => [`${x} ${w.en}`, `${cap(w.en)}, ${x.charAt(0).toLowerCase()}${x.slice(1)}`]);
    return {
      prompt: `Pose la question sur un projet (présent be + ing) : « ${s.mid} / ${p.base} / ${p.end} / ${w.en} »`,
      answer: { kind: 'text', accepted: ended(accepted, '?') },
      traps: wrongs(
        mids(s).flatMap((m) => [
          [
            `${cap(m)} ${s.be} ${p.ing} ${p.end} ${w.en}`,
            'Dans la question, am, is ou are passe devant le sujet.',
          ] as const,
          [`${cap(s.be)} ${m} ${p.base} ${p.end} ${w.en}`, WHY_NO_ING] as const,
          [`Do ${m} ${p.ing} ${p.end} ${w.en}`, 'La question avec be + ing se pose sans do ni does.'] as const,
        ]),
        accepted,
        '?',
      ),
      hint: 'Pour une question avec be, quel mot ouvre la phrase ?',
      steps: [FUTURE, 'Pour la question, am, is ou are passe devant le sujet.', `Réponse : **${at(accepted, 0)}?**`],
    };
  }
  const accepted = midTimed(
    s,
    negated(s).map((n) => `${n} ${p.ing} ${p.end}`),
    w,
  );
  return {
    prompt: `Écris une phrase négative sur ce projet (présent be + ing) : « ${s.mid} / ${p.base} / ${p.end} / ${w.en} »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [`${s.text} not ${p.ing} ${p.end} ${w.en}`, WHY_NO_BE],
        [`${s.text} ${s.be} not ${p.base} ${p.end} ${w.en}`, WHY_NO_ING],
        [
          `${s.text} ${s.be === 'is' ? 'doesn’t' : 'don’t'} ${p.ing} ${p.end} ${w.en}`,
          'La négation se fait avec be, sans do.',
        ],
        [`${s.text} won’t ${p.ing} ${p.end} ${w.en}`, 'Un projet se dit avec be au présent, suivi de not.'],
      ],
      accepted,
    ),
    hint: 'La négation se place juste après be.',
    steps: [FUTURE, 'Négation : not (ou n’t) après am, is ou are.', `Réponse : **${at(accepted, 0)}.**`],
  };
}

function planDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [a, b, c, d] = some(rng, PLANS, 4) as [Plan, Plan, Plan, Plan];
  const [first, second, third] = some(rng, ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'] as const, 3) as [
    string,
    string,
    string,
  ];
  const lines = [
    `${first} — me: ${a.base} ${a.end}`,
    `${second} — my parents and me: ${b.base} ${b.end}`,
    `${third} — my brother: NOT ${c.base} ${c.end}`,
    `${third} — my brother: ${d.base} ${d.end}`,
  ];
  /** « be going to » exprime aussi un projet : accepté, comme au niveau 3. */
  const going = (be: readonly string[], p: Plan) => be.map((v) => `${v} going to ${p.base}`);
  const accepted = [
    [`am ${a.ing}`, `’m ${a.ing}`, ...going(['am', '’m'], a)],
    [...areForms(b), ...going(['are', '’re'], b)],
    [`isn’t ${c.ing}`, `is not ${c.ing}`, `’s not ${c.ing}`, ...going(['isn’t', 'is not', '’s not'], c)],
    [...isForms(d), ...going(['is', '’s'], d)],
  ];
  return {
    prompt: `Lis l’agenda ${de(k.name)}, puis écris son message à un ami : tous les projets sont au présent be + ing.`,
    figure: { kind: 'document', title: `${k.name}’s diary`, lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts: [
        `Hi! On ${first}, I `,
        ` ${a.end}. On ${second}, my parents and I `,
        ` ${b.end}. On ${third}, my brother `,
        ` ${c.end}: he `,
        ` ${d.end}.`,
      ],
      blanks: accepted.map((list) => ({ mode: 'text' as const, accepted: list })),
    },
    hint: 'Pour chaque trou, regarde qui est le sujet. L’agenda signale aussi ce qui n’aura pas lieu.',
    steps: [
      FUTURE,
      'I va avec am ; « my parents and I » (= nous) avec are ; « my brother » avec is. La ligne NOT donne une négation.',
      `Réponse : **${accepted.map((list) => at(list, 0)).join(', ')}**`,
    ],
  };
}

const future: Skill = {
  id: 'a6-be-ing-futur',
  title: 'Be + ing pour un projet proche',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour un **projet proche** déjà prévu, on emploie aussi **be + ing** : I’m playing badminton tomorrow.',
      'Le moment montre que c’est pour plus tard : tonight, tomorrow, this weekend, next week.',
      'Question : Are you coming tonight? Négation : We aren’t going to school next week.',
    ],
    source: source(
      'présent be + ing exprimant un futur proche',
      '« Present continuous, future arrangements », « Talking about the future »',
    ),
    sources: ['anglais-college-2025', 'bck-continuous-future', 'bc-talking-future', 'bc-present-continuous'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return planSpot(rng);
    if (level === 2) return planRecognise(rng);
    if (level === 3) return planWrite(rng);
    if (level === 4) return planAsk(rng);
    return planDocument(rng);
  },
};

// ——— 4. I want to / I would like to ———
interface Wish {
  readonly base: string;
  readonly s: string;
  readonly ing: string;
  readonly end: string;
  readonly fr: string;
}
const wish = (forms: readonly [string, string, string], end: string, fr: string): Wish => ({
  base: forms[0],
  s: forms[1],
  ing: forms[2],
  end,
  fr,
});
const WISHES: readonly Wish[] = [
  wish(['visit', 'visits', 'visiting'], 'London', 'visiter Londres'),
  wish(['go', 'goes', 'going'], 'to Scotland', 'aller en Écosse'),
  wish(['see', 'sees', 'seeing'], 'the giraffes', 'voir les girafes'),
  wish(['swim', 'swims', 'swimming'], 'in the sea', 'nager dans la mer'),
  wish(['learn', 'learns', 'learning'], 'Spanish', 'apprendre l’espagnol'),
  wish(['play', 'plays', 'playing'], 'rugby', 'jouer au rugby'),
  wish(['make', 'makes', 'making'], 'a pizza', 'préparer une pizza'),
  wish(['stay', 'stays', 'staying'], 'at home', 'rester à la maison'),
  wish(['read', 'reads', 'reading'], 'this book', 'lire ce livre'),
];
type Mood = 'want' | 'would' | 'refuse';
const SAY: Readonly<Record<Mood, { readonly en: (w: Wish) => string; readonly fr: (w: Wish) => string }>> = {
  want: { en: (w) => `I want to ${w.base} ${w.end}.`, fr: (w) => `Je veux ${w.fr}.` },
  would: { en: (w) => `I’d like to ${w.base} ${w.end}.`, fr: (w) => `J’aimerais ${w.fr}.` },
  refuse: { en: (w) => `I don’t want to ${w.base} ${w.end}.`, fr: (w) => `Je ne veux pas ${w.fr}.` },
};
const WANT_RULE = 'Après want et would like, on met to puis la base verbale.';
const WHY_NO_TO = 'Il manque to entre les deux verbes.';
const WHY_ING_AFTER = 'Après to, le verbe reste à la base verbale, sans -ing.';
const WHY_LIKE = '« I like » dit un goût (j’aime) ; « I’d like » dit un souhait (j’aimerais).';

function wishSpot(rng: Rng): QuestionDraft {
  const w = rng.pick(WISHES);
  const mood = rng.pick(['want', 'would'] as const);
  const start = mood === 'want' ? 'I want' : 'I’d like';
  const { answer, traps } = choice(rng, 'to', [
    { label: 'of', why: '« of » veut dire « de » en français, mais il ne relie pas want ou would like à un verbe.' },
    { label: 'for', why: '« for » veut dire « pour » : le mot qui relie want ou would like au verbe est to.' },
  ]);
  return {
    prompt: `Complète : « ${start} … ${w.base} ${w.end}. » (${SAY[mood].fr(w)})`,
    answer,
    traps,
    hint: 'Quel petit mot relie les deux verbes ?',
    steps: [WANT_RULE, `Réponse : **${SAY[mood].en(w)}**`],
  };
}

function wishSentence(rng: Rng): QuestionDraft {
  const w = rng.pick(WISHES);
  const good = SAY.would.en(w);
  const { answer, traps } = choice(rng, good, [
    { label: `I like ${w.ing} ${w.end}.`, why: WHY_LIKE },
    { label: `I’d like ${w.base} ${w.end}.`, why: WHY_NO_TO },
    { label: `I’d like to ${w.ing} ${w.end}.`, why: WHY_ING_AFTER },
  ]);
  return {
    prompt: `Quelle phrase anglaise veut dire « ${SAY.would.fr(w)} » ?`,
    answer,
    traps,
    hint: 'Distingue le goût et le souhait, puis contrôle la forme après le premier verbe.',
    steps: [WHY_LIKE, WANT_RULE, `Réponse : **${good}**`],
  };
}

function wishMatch(rng: Rng): QuestionDraft {
  const [a, b, c] = some(rng, WISHES, 3) as [Wish, Wish, Wish];
  const w = rng.pick([a, b, c]);
  const rows = rng.shuffle((['want', 'would', 'refuse'] as const).map((m) => [SAY[m].en(w), SAY[m].fr(w)] as const));
  return {
    prompt: `Associe chaque phrase à sa traduction : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Les actions sont identiques : compare le début des phrases.',
    steps: [
      'I want to : je veux ; I’d like to : j’aimerais ; I don’t want to : je ne veux pas.',
      `Réponse : **${rows.map(([en, fr]) => `${en} = ${fr}`).join(' ; ')}**`,
    ],
  };
}

const wishRecognise = (rng: Rng) => (coin(rng) ? wishSentence(rng) : wishMatch(rng));

const wantStarts = ['want to'] as const;
const wouldStarts = ['would like to', '’d like to'] as const;
/** « ’d like to » collé à I, avec ou sans le sujet. */
const withI = (verbs: readonly string[]) => verbs.flatMap((v) => [v, v.startsWith('’') ? `I${v}` : `I ${v}`]);

function wishWrite(rng: Rng): QuestionDraft {
  const w = rng.pick(WISHES);
  const would = coin(rng);
  const starts = would ? wouldStarts : wantStarts;
  const accepted = withI(starts.map((s) => `${s} ${w.base}`)).flatMap((v) => [v, `${v} ${w.end}`]);
  const start = would ? 'would like' : 'want';
  return {
    prompt: `Complète avec « ${start} » et « ${w.base} » : « I … ${w.end}. » (${SAY[would ? 'would' : 'want'].fr(w)})`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [`${start} ${w.base}`, WHY_NO_TO],
        [`${start} to ${w.ing}`, WHY_ING_AFTER],
        [`${start} ${w.ing}`, WHY_NO_TO],
        would ? [`like to ${w.base}`, WHY_LIKE] : [`wants to ${w.base}`, 'Avec I, want ne prend pas de -s.'],
      ],
      accepted,
    ),
    hint: 'Il manque un petit mot entre les deux verbes proposés.',
    steps: [WANT_RULE, `Réponse : **${start} to ${w.base}**`],
  };
}

type Turn = 'refuse' | 'third' | 'invite' | 'wouldThird';

function wishTranslate(rng: Rng): QuestionDraft {
  const w = rng.pick(WISHES);
  const turn = rng.pick(['refuse', 'third', 'invite', 'wouldThird'] as const satisfies readonly Turn[]);
  const k = pickKid(rng);
  const tail = `${w.base} ${w.end}`;
  const spec: Readonly<
    Record<Turn, { readonly fr: string; readonly right: readonly string[]; readonly wrong: [string, string][] }>
  > = {
    refuse: {
      fr: `Je ne veux pas ${w.fr}.`,
      right: [`I don’t want to ${tail}`, `I do not want to ${tail}`],
      wrong: [
        [`I want not to ${tail}`, 'La négation de want se fait avec don’t, placé avant want.'],
        [`I don’t want ${tail}`, WHY_NO_TO],
        [`I not want to ${tail}`, 'Il faut don’t devant want.'],
      ],
    },
    third: {
      fr: `${k.name} veut ${w.fr}.`,
      right: [`${k.name} wants to ${tail}`],
      wrong: [
        [`${k.name} want to ${tail}`, 'Avec une seule personne (he, she), want prend -s.'],
        [`${k.name} wants ${tail}`, WHY_NO_TO],
        [`${k.name} wants to ${w.s} ${w.end}`, 'Après to, le verbe reste à la base verbale, sans -s.'],
      ],
    },
    invite: {
      fr: `Aimerais-tu ${w.fr} ?`,
      right: [`Would you like to ${tail}`],
      wrong: [
        [`Do you like to ${tail}`, WHY_LIKE],
        [`Would you like ${tail}`, WHY_NO_TO],
        [`You would like to ${tail}`, 'Dans la question, would passe devant le sujet.'],
      ],
    },
    wouldThird: {
      fr: `${k.name} aimerait ${w.fr}.`,
      right: [`${k.name} would like to ${tail}`, `${k.name}’d like to ${tail}`],
      wrong: [
        [`${k.name} woulds like to ${tail}`, 'would ne prend jamais de -s.'],
        [`${k.name} would likes to ${tail}`, 'Après would, like reste sans -s.'],
        [`${k.name} likes to ${tail}`, WHY_LIKE],
        [`${k.name} would like ${tail}`, WHY_NO_TO],
      ],
    },
  };
  const { fr, right, wrong } = spec[turn];
  const mark = turn === 'invite' ? '?' : '.';
  const verb = turn === 'invite' || turn === 'wouldThird' ? 'would like' : 'want';
  return {
    prompt: `Écris en anglais, avec « ${verb} » : « ${fr} » (Verbe : to ${w.base} ; complément : ${w.end}.)`,
    answer: { kind: 'text', accepted: ended(right, mark) },
    traps: wrongs(wrong, right, mark),
    hint: 'Repère le sujet et le type de phrase ; n’oublie pas ce qui relie les deux verbes.',
    steps: [WANT_RULE, `Réponse : **${at(right, 0)}${mark}**`],
  };
}

function wishDocument(rng: Rng): QuestionDraft {
  const k = pickKid(rng);
  const [a, b, c] = some(rng, WISHES, 3) as [Wish, Wish, Wish];
  const brother = rng.pick(BOYS.filter((x) => x !== k.name));
  const dream = [`would like to ${a.base}`, `’d like to ${a.base}`];
  const no = [`don’t want to ${b.base}`, `do not want to ${b.base}`];
  const rows = [
    { line: `★ Mon rêve : ${a.base} ${a.end}`, before: 'I ', accepted: dream, after: ` ${a.end}. ` },
    { line: `✗ Je refuse : ${b.base} ${b.end}`, before: 'I ', accepted: no, after: ` ${b.end}. ` },
    {
      line: `Envie ${de(brother)}, mon frère : ${c.base} ${c.end}`,
      before: `My brother ${brother} `,
      accepted: [`wants to ${c.base}`],
      after: ` ${c.end}. `,
    },
  ];
  const order = rng.shuffle(rows);
  /** La fiche range les lignes à l'envers du texte : il faut chercher la bonne. */
  const lines = order.map((r) => r.line).reverse();
  const parts = [`Hi, I’m ${k.name}. ${at(order, 0).before}`];
  for (let i = 0; i < order.length; i++) {
    const next = order[i + 1];
    parts.push(`${at(order, i).after}${next ? next.before : ''}`.trimEnd() + (next ? ' ' : ''));
  }
  return {
    prompt: `Lis la fiche ${de(k.name)}, puis écris sa présentation. Utilise « would like » pour le rêve, « want » pour le reste.`,
    figure: { kind: 'document', title: `${k.name}’s wishes`, lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts,
      blanks: order.map((r) => ({ mode: 'text' as const, accepted: r.accepted })),
    },
    hint: 'Pour chaque trou : rêve, refus ou envie du frère ? Attention au sujet et au petit mot avant le verbe.',
    steps: [
      WANT_RULE,
      'Le rêve : would like to. Le refus : don’t want to. Le frère (une seule personne) : wants to.',
      `Réponse : **${order.map((r) => at(r.accepted, 0)).join(', ')}**`,
    ],
  };
}

const wishes: Skill = {
  id: 'a6-want-would-like',
  title: 'I want to et I would like to',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour dire une **intention**, emploie **I want to** (je veux) ou **I would like to** (j’aimerais), souvent écrit I’d like to.',
      'Ensuite vient la **base verbale** : I’d like to visit London. Attention : I like (j’aime) n’a pas ce sens.',
      'Négation : I don’t want to go. Avec he ou she : She wants to go. Proposer : Would you like to come?',
    ],
    source: source(
      'exprimer une intention : I want to, I would like to',
      '« Verbs followed by the infinitive », « will and would »',
    ),
    sources: ['anglais-college-2025', 'bc-verbs-infinitive', 'bc-will-would', 'bc-talking-future'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return wishSpot(rng);
    if (level === 2) return wishRecognise(rng);
    if (level === 3) return wishWrite(rng);
    if (level === 4) return wishTranslate(rng);
    return wishDocument(rng);
  },
};

export const ENGLISH_BE_ING_CHAPTER: Chapter = {
  id: 'a6-be-ing',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Be + ing',
  skills: [present, recognise, future, wishes],
};
