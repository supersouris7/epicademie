import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import {
  ACTIONS,
  ADVERBS,
  DAY_CHAIN,
  HABITS,
  ROUTINES,
  type Action,
  type Habit,
  type Routine,
} from './journee-faits.ts';
import { digital, hourWord, minuteWord, next, timeEn, timeForms, type Time } from './ecoute-cm2.ts';
import { at, de, others, pairs, pickEnglish, shuffledOther, some, understand } from './temps.ts';

/**
 * Anglais CM2 — « La journée » (lot an-cm2-03, docs/adr/0034). Programme : cycle 3, langues vivantes (présent ;
 * horaire ; la personne et la vie quotidienne), en vigueur au CM2 jusqu'à la rentrée 2027. Règles et mots :
 * British Council (voir journee-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes';
const source = (detail: string) => `${PROGRAMME} — la journée. ${detail}`;

/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
const KIDS = ['Emir', 'Ana', 'Yuna', 'Paul'];

// ——— 1. Le présent simple (I, you) ———
const BASE_WHY = 'Avec « I » et « you », le verbe reste tout simple : pas de -s à la fin.';
const ING_WHY = 'La forme en -ing ne s’emploie pas seule : au présent simple, on garde la base.';
const sentence = (subject: string, verb: string, a: Action) => `${subject} ${verb} ${a.rest}.`;
const verbs = (a: Action) => [a.verb, ...a.alt];

function presentLevel1(rng: Rng): QuestionDraft {
  const a = rng.pick(ACTIONS);
  const subject = rng.pick(['I', 'You'] as const);
  const { answer, traps } = choice(rng, a.verb, [
    { label: a.s, why: BASE_WHY },
    { label: a.ing, why: ING_WHY },
  ]);
  const fr = subject === 'I' ? `je parle de moi : ${a.fr}` : `je parle à un ami : ${a.fr}`;
  return {
    prompt: `Complète (${fr}) : « ${subject} … ${a.rest}. »`,
    answer,
    traps,
    hint: 'Regarde le sujet. Faut-il ajouter quelque chose à la fin du verbe ?',
    steps: [BASE_WHY, `Réponse : **${sentence(subject, a.verb, a)}**`],
  };
}

function presentLevel2(rng: Rng): QuestionDraft {
  const a = rng.pick(ACTIONS);
  const negative = rng.int(0, 1) === 0;
  const good = negative ? sentence('I', `don’t ${a.verb}`, a) : sentence('I', a.verb, a);
  const wrong = negative
    ? [
        { label: sentence('I', `not ${a.verb}`, a), why: 'Il manque « do » : on dit « I don’t… ».' },
        { label: sentence('I', `doesn’t ${a.verb}`, a), why: '« doesn’t » va avec he, she, it. Avec I : « don’t ».' },
        { label: sentence('I', `no ${a.verb}`, a), why: '« no » ne suffit pas devant un verbe : on dit « don’t ».' },
      ]
    : [
        { label: sentence('I', a.s, a), why: BASE_WHY },
        { label: sentence('I', `am ${a.verb}`, a), why: 'Pas de « am » devant la base : le verbe suffit.' },
        { label: sentence('I', a.ing, a), why: ING_WHY },
      ];
  const { answer, traps } = choice(rng, good, wrong);
  return {
    prompt: `Quelle phrase dit « ${negative ? a.iNot : a.i} » ?`,
    answer,
    traps,
    hint: 'Y a-t-il « ne… pas » ? Puis regarde ce qui suit « I ».',
    steps: [
      negative ? 'Pour « ne… pas » avec I : « don’t » puis la base du verbe.' : BASE_WHY,
      `Réponse : **${good}**`,
    ],
  };
}

function presentLevel3(rng: Rng): QuestionDraft {
  const a = rng.pick(ACTIONS);
  return {
    prompt: `Écris le verbe qui manque : « I … ${a.rest}. » (${a.i})`,
    answer: { kind: 'text', accepted: verbs(a) },
    traps: [
      { text: a.s, why: BASE_WHY },
      { text: a.ing, why: ING_WHY },
    ],
    hint: `Pense au verbe anglais pour « ${a.fr} ». Il commence par « ${a.verb.slice(0, 1)} ».`,
    steps: [BASE_WHY, `Réponse : **${sentence('I', a.verb, a)}**`],
  };
}

function presentNegative(rng: Rng): QuestionDraft {
  const a = rng.pick(ACTIONS);
  const subject = rng.pick(['I', 'You'] as const);
  return {
    prompt: `Dis le contraire avec « ne… pas ». Écris ce qui manque : « ${subject} … ${a.verb} ${a.rest}. »`,
    answer: { kind: 'text', accepted: ['don’t', 'do not'] },
    traps: [
      { text: 'doesn’t', why: '« doesn’t » va avec he, she, it. Avec I et you : « don’t ».' },
      { text: 'not', why: '« not » ne suffit pas : il faut aussi « do ».' },
      { text: 'no', why: '« no » veut dire « non ». Devant un verbe, on met « don’t ».' },
    ],
    hint: 'Il faut un petit mot qui aide, avec la marque du « ne… pas ».',
    steps: [
      'Au présent simple, on dit « ne… pas » avec « don’t » (= do not).',
      `Réponse : **${subject} don’t ${a.verb} ${a.rest}.**`,
    ],
  };
}

function presentQuestion(rng: Rng): QuestionDraft {
  const a = rng.pick(ACTIONS);
  return {
    prompt: `Demande à un ami si c’est son cas : « ${a.fr} ». Écris le mot qui manque : « … you ${a.verb} ${a.rest}? »`,
    answer: { kind: 'text', accepted: ['Do'] },
    traps: [
      { text: 'Does', why: '« Does » va avec he, she, it. Avec you : « Do ».' },
      { text: 'Are', why: '« Are » est le verbe be. Devant un autre verbe, la question commence par « Do ».' },
    ],
    hint: 'Au présent simple, un petit mot ouvre la question.',
    steps: ['Pour poser une question avec you : « Do you… ? ».', `Réponse : **Do you ${a.verb} ${a.rest}?**`],
  };
}

function presentShortAnswer(rng: Rng): QuestionDraft {
  const a = rng.pick(ACTIONS);
  const yes = rng.int(0, 1) === 0;
  const accepted = yes ? ['I do'] : ['I don’t', 'I do not'];
  const good = at(accepted, 0);
  return {
    prompt: `Réponds ${yes ? 'oui' : 'non'}. « Do you ${a.verb} ${a.rest}? » — « ${yes ? 'Yes' : 'No'}, … . »`,
    answer: { kind: 'text', accepted: full(accepted) },
    traps: [
      { text: yes ? 'you do' : 'you don’t', why: 'On te pose la question : tu réponds avec « I » (je).' },
      { text: yes ? `I ${a.verb}` : `I don’t ${a.verb}`, why: 'La réponse courte reprend « do », pas le verbe.' },
      { text: yes ? 'I am' : 'I’m not', why: 'La question commence par « Do » : la réponse reprend « do ».' },
    ],
    hint: `Qui répond ? Puis reprends le premier mot de la question.${yes ? '' : ' Ajoute la marque du « ne… pas ».'}`,
    steps: ['Réponse courte : « I » puis « do » (ou « don’t »).', `Réponse : **${yes ? 'Yes' : 'No'}, ${good}.**`],
  };
}

function presentLevel5(rng: Rng): QuestionDraft {
  const [a, b, c] = some(rng, ACTIONS, 3) as [Action, Action, Action];
  const kid = rng.pick(KIDS);
  return {
    prompt: `Lis les notes ${de(kid)}. Écris son message à un correspondant anglais.`,
    figure: {
      kind: 'document',
      title: 'Mes notes',
      lines: [`Moi, oui : ${a.fr}.`, `Moi, non : ${b.fr}.`, `Question à mon ami : ${c.fr} ?`],
      credit: 'Écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: ['Hello! I ', ` ${a.rest}. I `, ` ${b.verb} ${b.rest}. `, ' you ', ` ${c.rest}?`],
      blanks: [
        { mode: 'text', accepted: verbs(a) },
        { mode: 'text', accepted: ['don’t', 'do not'] },
        { mode: 'text', accepted: ['Do'] },
        { mode: 'text', accepted: verbs(c) },
      ],
    },
    hint: 'Pour chaque ligne : une phrase simple, une phrase avec « ne… pas », puis une question.',
    steps: [
      `Oui : « I ${a.verb} ${a.rest}. » ${BASE_WHY}`,
      `Non : « I don’t ${b.verb} ${b.rest}. »`,
      `Question : « Do you ${c.verb} ${c.rest}? »`,
      `Réponse : **${a.verb}, don’t, Do, ${c.verb}**`,
    ],
  };
}

const presentSimple: Skill = {
  id: 'acm2-present-simple',
  title: 'Le présent simple avec I et you',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **présent simple** dit ce que tu fais souvent. Avec I et you, le verbe garde sa **base verbale** : I play, you play.',
      '« Ne… pas » : I don’t like fish. Question : Do you like fish?',
      'Réponse courte : Yes, I do. No, I don’t.',
    ],
    source: source('Règles : British Council, LearnEnglish, « Present simple ».'),
    sources: ['cycle3-2020', 'bc-present-simple', 'bc-present-simple-a1'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return presentLevel1(rng);
    if (level === 2) return presentLevel2(rng);
    if (level === 3) return presentLevel3(rng);
    if (level === 4) return rng.pick([presentNegative, presentQuestion, presentShortAnswer])(rng);
    return presentLevel5(rng);
  },
};

// ——— 2. L'heure ———
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const times = (minutes: readonly number[]): Time[] => HOURS.flatMap((h) => minutes.map((m) => ({ h, m })));
const EASY = times([0, 30]);
const QUARTERS = times([15, 30, 45]);
const ALL = times([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
const said = (t: Time) => `It’s ${timeEn(t)}.`;

/** Règle qui s'applique à cette heure. */
function rule(t: Time): string {
  if (t.m === 0) return 'Heure pile : le nombre, puis « o’clock ».';
  if (t.m <= 30) return `Jusqu’à la demie : les minutes, « past » (après), puis l’heure ${hourWord(t.h)}.`;
  return `Après la demie : les minutes qui restent, « to » (avant), puis l’heure qui arrive, ${hourWord(next(t.h))}.`;
}

/** Heures fausses typiques (la bonne heure n'y figure jamais). */
function wrongTimes(t: Time): { t: Time; why: string }[] {
  const later: Time = { h: next(t.h), m: t.m };
  const number = `Regarde le nombre : ici, on est autour de ${t.h} h.`;
  if (t.m === 0)
    return [
      { t: { h: t.h, m: 30 }, why: '« half past » veut dire « et demie ». Heure pile : « o’clock ».' },
      { t: later, why: number },
      { t: { h: t.h, m: 15 }, why: '« quarter past » veut dire « et quart ».' },
    ];
  if (t.m === 30)
    return [
      { t: later, why: '« half past » : on dit l’heure qui vient de passer.' },
      { t: { h: t.h, m: 0 }, why: '« o’clock » est une heure pile : il manque la demie.' },
      { t: { h: t.h, m: 15 }, why: '« quarter » veut dire 15 minutes, « half » veut dire 30.' },
    ];
  const mirror: Time = { h: t.h, m: 60 - t.m };
  return [
    { t: mirror, why: '« past » veut dire « après » et « to » veut dire « avant » : ne les échange pas.' },
    { t: later, why: rule(t) },
    { t: { h: t.h, m: 30 }, why: 'La demie, c’est « half past » : 30 minutes.' },
  ];
}

function clockChoice(rng: Rng, level: 1 | 2): QuestionDraft {
  const t = rng.pick(level === 1 ? EASY : QUARTERS);
  const { answer, traps } = choice(
    rng,
    said(t),
    wrongTimes(t)
      .slice(0, level === 1 ? 2 : 3)
      .map((x) => ({ label: said(x.t), why: x.why })),
  );
  return {
    prompt: `L’horloge affiche ${digital(t)}. « What time is it? » Choisis la réponse.`,
    answer,
    traps,
    hint: level === 1 ? 'Heure pile ou et demie ? Cherche le bon petit mot.' : 'Cherche d’abord « past » ou « to ».',
    steps: [rule(t), `Réponse : **${said(t)}**`],
  };
}

/** Niveau 3 : deux mots à écrire. */
function clockGaps(rng: Rng): QuestionDraft {
  const t = rng.pick(ALL);
  const left = t.m > 30;
  const hour = hourWord(left ? next(t.h) : t.h);
  const minutes = t.m === 30 ? 'half' : minuteWord(left ? 60 - t.m : t.m);
  const words = t.m === 0 ? [hour, 'o’clock'] : [left ? 'to' : 'past', hour];
  return {
    prompt: `L’horloge affiche ${digital(t)}. Complète la réponse à « What time is it? » (en lettres).`,
    answer: {
      kind: 'cloze',
      parts: [t.m === 0 ? 'It’s ' : `It’s ${minutes} `, ' ', '.'],
      blanks: words.map((w) => ({ mode: 'text' as const, accepted: [w] })),
    },
    hint: 'Heure pile ? Sinon, demande-toi : les minutes sont-elles avant ou après la demie ?',
    steps: [rule(t), `Réponse : **${said(t)}**`],
  };
}

const FRENCH_HOURS = ['une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];
const FRENCH_MINUTES: Readonly<Record<number, string>> = {
  0: '',
  5: ' cinq',
  10: ' dix',
  15: ' et quart',
  20: ' vingt',
  25: ' vingt-cinq',
  30: ' et demie',
  35: ' moins vingt-cinq',
  40: ' moins vingt',
  45: ' moins le quart',
  50: ' moins dix',
  55: ' moins cinq',
};
function frenchTime(t: Time): string {
  const h = t.m > 30 ? next(t.h) : t.h;
  return `${at(FRENCH_HOURS, h - 1)} heure${h === 1 ? '' : 's'}${FRENCH_MINUTES[t.m] ?? ''}`;
}

/** Niveau 4 : traduire une heure dite en français, sans propositions. */
function clockWrite(rng: Rng): QuestionDraft {
  const t = rng.pick(ALL);
  const right = timeForms(t);
  const wrong = wrongTimes(t)
    .slice(0, 2)
    .flatMap((x) => [
      { text: timeEn(x.t), why: x.why },
      { text: said(x.t), why: x.why },
    ]);
  return {
    prompt: `Écris en anglais, en lettres : « Il est ${frenchTime(t)}. »`,
    answer: { kind: 'text', accepted: right },
    traps: wrong.filter((w) => !right.includes(w.text)),
    hint: 'Commence par « It’s ». Puis choisis : « o’clock », « past » ou « to ».',
    steps: [rule(t), `Réponse : **${said(t)}**`],
  };
}

const MORNING = times([0, 15, 30, 45]).filter((t) => t.h === 6 || t.h === 7);
const EVENING = times([0, 5, 15, 30, 40, 45]).filter((t) => t.h === 8 || t.h === 9);
/** L'heure après « at » : sans « It’s ». */
const atForms = (t: Time) => timeForms(t).filter((f) => !f.startsWith('It'));

function clockLevel5(rng: Rng): QuestionDraft {
  const up = rng.pick(MORNING);
  const bed = rng.pick(EVENING);
  const kid = rng.pick(KIDS);
  return {
    prompt: `Lis l’agenda ${de(kid)}. Réponds pour ${kid} en écrivant les heures en lettres.`,
    figure: {
      kind: 'document',
      title: 'Mon agenda',
      lines: [`Lever : ${digital(up)} (le matin)`, `Coucher : ${digital(bed)} (le soir)`],
      credit: 'Écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: ['What time do you get up? I get up at ', '. What time do you go to bed? I go to bed at ', '.'],
      blanks: [
        { mode: 'text', accepted: atForms(up) },
        { mode: 'text', accepted: atForms(bed) },
      ],
    },
    hint: 'Pour chaque heure : pile, avant la demie ou après la demie ?',
    steps: [rule(up), rule(bed), `Réponse : **${timeEn(up)}, ${timeEn(bed)}**`],
  };
}

const clock: Skill = {
  id: 'acm2-heure',
  title: 'Demander et dire l’heure',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Demande : What time is it? Réponds avec It’s… Heure pile : It’s five **o’clock**.',
      'Jusqu’à la demie : **past** (après). Quarter past five = 5:15, half past five = 5:30. Ensuite : **to** (avant), quarter to six = 5:45.',
      'Pour dire « à » une heure, mets at : I get up at seven o’clock.',
    ],
    source: source(
      'Heure : British Council, LearnEnglish Kids, « How to tell the time » ; « Prepositions of time » ; LearnEnglish, « Present simple ».',
    ),
    sources: ['cycle3-2020', 'bck-tell-time', 'bck-prepositions-time', 'bc-present-simple-a1'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1 || level === 2) return clockChoice(rng, level);
    if (level === 3) return clockGaps(rng);
    if (level === 4) return clockWrite(rng);
    return clockLevel5(rng);
  },
};

// ——— 3. La routine ———
const routineOf = (en: string): Routine => {
  const r = ROUTINES.find((x) => x.en === en);
  if (!r) throw new Error(`action inconnue : ${en}`);
  return r;
};
const phrases = (r: Routine) => [r.en, ...(r.alt ?? [])];

function routineGap(rng: Rng): QuestionDraft {
  const r = rng.pick(ROUTINES);
  const { before, after, words, trap, why } = r.gap;
  const good = at(words, 0);
  const space = after === '.' ? '' : ' ';
  return {
    prompt: `Écris le mot qui manque : « ${before} … ${after} » (${r.i})`,
    answer: { kind: 'text', accepted: words },
    traps: [{ text: trap, why }],
    hint: `Dis toute l’expression anglaise pour « ${r.fr} ». Quel mot manque ?`,
    steps: [`« ${r.fr} » se dit « ${r.en} ».`, `Réponse : **${before} ${good}${space}${after}**`],
  };
}

function routineOrder(rng: Rng): QuestionDraft {
  const picked = new Set(some(rng, DAY_CHAIN, 5));
  const right = DAY_CHAIN.filter((x) => picked.has(x));
  const items = shuffledOther(rng, right);
  return {
    prompt: `Un jour d’école : remets les actions dans l’ordre, du matin au soir : ${items.join(', ')}.`,
    answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
    hint: 'Imagine ta journée. Que fais-tu en premier, au réveil ?',
    steps: [
      'On suit la journée : le matin, le midi, puis le soir.',
      ...right.map((x) => `${x} → ${routineOf(x).fr}`),
      `Réponse : **${right.join(', ')}**`,
    ],
  };
}

function routineSentence(rng: Rng): QuestionDraft {
  const r = rng.pick(ROUTINES);
  const other = at(others(rng, ROUTINES, r, 1), 0);
  const mine = phrases(r).filter((p) => !p.includes(' your '));
  return {
    prompt: `Écris en anglais, avec « I » : « ${r.i} »`,
    answer: { kind: 'text', accepted: full(mine.map((p) => `I ${p}`)) },
    traps: [
      { text: r.en, why: 'Il manque le sujet : commence ta phrase par « I ».' },
      { text: `I ${r.typo}`, why: `Presque ! Regarde bien les lettres : « ${r.en} ».` },
      { text: `I ${other.en}`, why: `« ${other.en} » veut dire « ${other.fr} ».` },
    ],
    hint: `Commence par « I ». Puis dis l’expression pour « ${r.fr} ».`,
    steps: [`« ${r.fr} » se dit « ${r.en} ».`, `Réponse : **I ${r.en}.**`],
  };
}

/** Niveau 5 : un emploi du temps en français, trois phrases à écrire. */
function routineLevel5(rng: Rng): QuestionDraft {
  const slots = [
    { time: '7:00', pool: ['wake up', 'get up', 'have a shower'] },
    { time: '7:45', pool: ['get dressed', 'have breakfast', 'clean my teeth'] },
    { time: '5:00', pool: ['go home', 'do homework', 'have dinner'] },
  ];
  const day = slots.map((s) => ({ time: s.time, r: routineOf(rng.pick(s.pool)) }));
  const kid = rng.pick(KIDS);
  const [a, b, c] = day.map((d) => d.r) as [Routine, Routine, Routine];
  const forms = (r: Routine) => phrases(r).filter((p) => !p.includes(' your '));
  return {
    prompt: `Lis l’emploi du temps ${de(kid)}. Écris sa routine en anglais.`,
    figure: {
      kind: 'document',
      title: 'Ma journée',
      lines: [`7:00 (matin) : ${a.fr}`, `7:45 (matin) : ${b.fr}`, `5:00 (après-midi) : ${c.fr}`],
      credit: 'Écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: ['At seven o’clock, I ', '. At quarter to eight, I ', '. At five o’clock, I ', '.'],
      blanks: [a, b, c].map((r) => ({ mode: 'text' as const, accepted: forms(r) })),
    },
    hint: 'Prends les lignes une par une. Le sujet « I » est déjà écrit.',
    steps: [
      ...day.map((d) => `${d.time} : « ${d.r.fr} » se dit « ${d.r.en} ».`),
      `Réponse : **${a.en}, ${b.en}, ${c.en}**`,
    ],
  };
}

const routineSkill: Skill = {
  id: 'acm2-routine',
  title: 'La routine de la journée',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Ta **routine** du matin : wake up (se réveiller), get up (se lever), have a shower, get dressed, have breakfast, clean my teeth.',
      'Ensuite : go to school, have lunch (midi), go home, do homework, have dinner, go to bed (se coucher).',
      'Mets « I » devant pour parler de toi : I get up at seven o’clock.',
    ],
    source: source('Mots : British Council, LearnEnglish Kids, fiches « Daily routines ».'),
    sources: ['cycle3-2020', 'bck-flashcards-daily-routines'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return pickEnglish(rng, ROUTINES, 'la journée', 'Mime l’action, puis retrouve son nom anglais.');
    if (level === 2) return understand(rng, ROUTINES, 'la journée');
    if (level === 3) return routineGap(rng);
    if (level === 4) {
      const kind = rng.int(0, 2);
      if (kind === 0) return pairs(rng, ROUTINES, 5);
      return kind === 1 ? routineOrder(rng) : routineSentence(rng);
    }
    return routineLevel5(rng);
  },
};

// ——— 4. always, sometimes, never ———
type Adverb = (typeof ADVERBS)[number];
const [ALWAYS, , NEVER] = ADVERBS;
const means = (a: Adverb) => `« ${a.en} » veut dire « ${a.fr} » : ${a.meaning}.`;
const PLACE = 'L’adverbe se place avant le verbe : « I always play ».';
const NO_DOUBLE = '« never » dit déjà « jamais » : pas besoin de « don’t ».';
function frequencyLevel1(rng: Rng): QuestionDraft {
  const a = rng.pick(ADVERBS);
  const toFrench = rng.int(0, 1) === 0;
  const { answer, traps } = choice(
    rng,
    toFrench ? a.fr : a.en,
    others(rng, ADVERBS, a, 2).map((o) => ({ label: toFrench ? o.fr : o.en, why: means(o) })),
  );
  return {
    prompt: toFrench ? `Que veut dire « ${a.en} » ?` : `Comment dit-on « ${a.fr} » en anglais ?`,
    answer,
    traps,
    hint: 'Pense à ces trois idées : à chaque fois, de temps en temps, aucune fois.',
    steps: [means(a), `Réponse : **${toFrench ? a.fr : a.en}**`],
  };
}

function frequencyLevel2(rng: Rng): QuestionDraft {
  const a = rng.pick(HABITS);
  const adverb = rng.pick(ADVERBS);
  const other = adverb === NEVER ? ALWAYS : NEVER;
  const good = sentence('I', `${adverb.en} ${a.verb}`, a);
  const { answer, traps } = choice(rng, good, [
    { label: sentence('I', `${a.verb} ${adverb.en}`, a), why: PLACE },
    { label: sentence('I', `${adverb.en} ${a.s}`, a), why: BASE_WHY },
    adverb === NEVER
      ? { label: sentence('I', `don’t never ${a.verb}`, a), why: NO_DOUBLE }
      : { label: sentence('I', `${other.en} ${a.verb}`, a), why: means(other) },
  ]);
  return {
    prompt: `Quelle phrase dit « ${a.french[adverb.en]} » ?`,
    answer,
    traps,
    hint: 'Trouve d’abord le bon adverbe. Puis vérifie sa place.',
    steps: [means(adverb), PLACE, `Réponse : **${good}**`],
  };
}

/** Nombre de jours de la semaine qui correspond à un adverbe. */
const daysFor = (rng: Rng, a: Adverb, week: number) => (a === ALWAYS ? week : a === NEVER ? 0 : rng.int(1, 2));
const count = (n: number) => `${n} jour${n > 1 ? 's' : ''}`;

function frequencyLevel3(rng: Rng): QuestionDraft {
  const a = rng.pick(HABITS);
  const adverb = rng.pick(ADVERBS);
  const days = daysFor(rng, adverb, 7);
  return {
    prompt: `Chaque semaine, tu notes « ${a.fr} » : ${count(days)} sur 7. Écris le mot qui le dit : « I … ${a.verb} ${a.rest}. »`,
    answer: { kind: 'text', accepted: [adverb.en] },
    traps: others(rng, ADVERBS, adverb, 2).map((o) => ({ text: o.en, why: means(o) })),
    hint: 'Compte les jours : tous, quelques-uns ou aucun ?',
    steps: [means(adverb), `Réponse : **I ${adverb.en} ${a.verb} ${a.rest}.**`],
  };
}

function frequencyOrder(rng: Rng): QuestionDraft {
  const a = rng.pick(HABITS);
  const adverb = rng.pick([ALWAYS, NEVER]);
  const right = ['I', adverb.en, a.verb, a.rest];
  const items = shuffledOther(rng, right);
  return {
    prompt: `Remets les mots dans l’ordre pour dire « ${a.french[adverb.en]} » : ${items.join(' / ')}`,
    answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
    hint: 'Commence par le sujet. Où se place l’adverbe par rapport au verbe ?',
    steps: [PLACE, `Réponse : **${right.join(' ')}**`],
  };
}

function frequencyNever(rng: Rng): QuestionDraft {
  const a: Habit = rng.pick(HABITS);
  const accepted = verbs(a).map((v) => `never ${v}`);
  return {
    prompt: `Écris deux mots pour dire « ${a.french.never} » : « I … ${a.rest}. »`,
    answer: { kind: 'text', accepted },
    traps: [
      { text: `don’t ${a.verb}`, why: '« don’t » dit « ne… pas ». Pour « jamais », il faut « never ».' },
      { text: `${a.verb} never`, why: PLACE },
      { text: `don’t never ${a.verb}`, why: NO_DOUBLE },
    ],
    hint: 'Il faut l’adverbe « jamais » et le verbe. Lequel vient en premier ?',
    steps: [means(NEVER), NO_DOUBLE, `Réponse : **I never ${a.verb} ${a.rest}.**`],
  };
}

function frequencyLevel5(rng: Rng): QuestionDraft {
  const actions = some(rng, HABITS, 3);
  const adverbs = rng.shuffle(ADVERBS);
  const rows = actions.map((a, i) => ({ a, adverb: at(adverbs, i) }));
  const kid = rng.pick(KIDS);
  const lines = rows.map(({ a, adverb }) => `${a.fr} : ${count(daysFor(rng, adverb, 5))} d’école sur 5`);
  const [x, y, z] = rows as [(typeof rows)[number], (typeof rows)[number], (typeof rows)[number]];
  return {
    prompt: `Lis le tableau ${de(kid)}. Complète son message avec « always », « sometimes » ou « never ».`,
    figure: { kind: 'document', title: 'Ma semaine d’école', lines, credit: 'Écrit pour l’exercice.' },
    answer: {
      kind: 'cloze',
      parts: [
        'On school days, I ',
        ` ${x.a.verb} ${x.a.rest}. I `,
        ` ${y.a.verb} ${y.a.rest}. I `,
        ` ${z.a.verb} ${z.a.rest}.`,
      ],
      blanks: rows.map((r) => ({ mode: 'text' as const, accepted: [r.adverb.en] })),
    },
    hint: 'Pour chaque ligne, compte les jours : les cinq, quelques-uns ou aucun.',
    steps: [
      ...rows.map((r) => `« ${r.a.fr} » : ${means(r.adverb)}`),
      `Réponse : **${rows.map((r) => r.adverb.en).join(', ')}**`,
    ],
  };
}

const frequency: Skill = {
  id: 'acm2-frequence',
  title: 'always, sometimes, never',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **adverbe de fréquence** dit combien de fois : always (toujours), sometimes (parfois), never (jamais).',
      'Place-le avant le verbe : I always read. You never sing.',
      'Piège : ne glisse pas sometimes après le verbe : dis I sometimes watch TV. Avec never, pas de don’t.',
    ],
    source: source('Règles : British Council, LearnEnglish Kids, « Adverbs of frequency ».'),
    sources: ['cycle3-2020', 'bck-adverbs-frequency', 'bck-adverbs-frequency-rule'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return frequencyLevel1(rng);
    if (level === 2) return frequencyLevel2(rng);
    if (level === 3) return frequencyLevel3(rng);
    if (level === 4) return rng.pick([frequencyOrder, frequencyNever])(rng);
    return frequencyLevel5(rng);
  },
};

export const ENGLISH_DAY_CHAPTER: Chapter = {
  id: 'acm2-la-journee',
  subject: 'anglais',
  grade: 'cm2',
  domain: 'langue',
  title: 'La journée',
  skills: [presentSimple, clock, routineSkill, frequency],
};
