import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { FARM, HOBBIES, PETS, SPORTS, WILD } from './gouts-faits.ts';
import type { Word } from './temps-faits.ts';
import { at, pairs, pickEnglish, shuffledOther, some, understand, write } from './temps.ts';

/**
 * Anglais CM1 — « Goûts et capacités » (lot an-cm1-05, docs/adr/0034). Programme : langues vivantes,
 * cours moyen première année (arrêté du 26 février 2026 : goûts, capacité, loisirs, animaux, réponses courtes). Mots et règles :
 * British Council (voir gouts-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME =
  'Programme de langues vivantes, cours moyen première année (arrêté du 26 février 2026, BO n° 12, annexe 2)';
const source = (detail: string) => `${PROGRAMME} — goûts, capacité, loisirs, réponses courtes. ${detail}`;

/** « de » élidé devant un prénom qui commence par une voyelle. */
const de = (name: string) => (/^[AEIOU]/.test(name) ? `d’${name}` : `de ${name}`);
/** « que » élidé devant un prénom qui commence par une voyelle. */
const que = (name: string) => (/^[AEIOU]/.test(name) ? `qu’${name}` : `que ${name}`);
/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);

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
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const otherPronoun = (k: Kid) => (k.he === 'he' ? 'She' : 'He');
/** Le prénom ne suffit pas à choisir « he » ou « she » : l’énoncé le dit. */
const gender = (k: Kid) => `${k.name} est ${k.he === 'he' ? 'un garçon' : 'une fille'}.`;
const PRONOUN_HINT = 'Un garçon : « he ». Une fille : « she ».';

// ——— 1. I like / I don't like ———

/** Choses que l’on aime ou non (mots des exemples du British Council). */
const LIKED: readonly { readonly en: string; readonly fr: string }[] = [
  { en: 'apples', fr: 'les pommes' },
  { en: 'bananas', fr: 'les bananes' },
  { en: 'chocolate', fr: 'le chocolat' },
  { en: 'cats', fr: 'les chats' },
  { en: 'snakes', fr: 'les serpents' },
  { en: 'vegetables', fr: 'les légumes' },
  { en: 'flowers', fr: 'les fleurs' },
];
const SUBJECTS: readonly {
  readonly en: string;
  readonly third: boolean;
  readonly yes: string;
  readonly no: string;
}[] = [
  { en: 'I', third: false, yes: 'J’aime', no: 'Je n’aime pas' },
  { en: 'We', third: false, yes: 'Nous aimons', no: 'Nous n’aimons pas' },
  { en: 'They', third: false, yes: 'Ils aiment', no: 'Ils n’aiment pas' },
  { en: 'He', third: true, yes: 'Il aime', no: 'Il n’aime pas' },
  { en: 'She', third: true, yes: 'Elle aime', no: 'Elle n’aime pas' },
];
const verb = (third: boolean, yes: boolean) => {
  if (yes) return third ? 'likes' : 'like';
  return third ? 'doesn’t like' : 'don’t like';
};
const longForm = (v: string) => v.replace('doesn’t', 'does not').replace('don’t', 'do not');
const whyVerb = (third: boolean) =>
  third
    ? 'Avec he ou she, on dit « likes » ou « doesn’t like ».'
    : 'Avec I, we, they, on dit « like » ou « don’t like ».';

/** Niveaux 1 et 2 : choisir la bonne phrase ou le bon verbe. */
function likeChoice(rng: Rng, level: 1 | 2): QuestionDraft {
  const yes = rng.int(0, 1) === 0;
  const thing = rng.pick(LIKED);
  if (level === 1) {
    const good = `I ${verb(false, yes)} ${thing.en}.`;
    const { answer, traps } = choice(rng, good, [
      {
        label: `I ${verb(false, !yes)} ${thing.en}.`,
        why: yes ? '« don’t » veut dire non : ici, on aime.' : 'Il manque « don’t » : ici, on n’aime pas.',
      },
      { label: `I am ${thing.en}.`, why: '« I am » veut dire « je suis ». Ici, on parle de ce qu’on aime.' },
    ]);
    return {
      prompt: `Comment dis-tu : « ${yes ? 'J’aime' : 'Je n’aime pas'} ${thing.fr} » ?`,
      answer,
      traps,
      hint: 'Cherche le verbe « aimer ». Y a-t-il un « non » dans la phrase en français ?',
      steps: [
        yes ? '« aimer » se dit « like ».' : 'Pour dire non, on met « don’t » devant « like ».',
        `Réponse : **${good}**`,
      ],
    };
  }
  const s = rng.pick(SUBJECTS);
  const good = verb(s.third, yes);
  const { answer, traps } = choice(rng, good, [
    { label: verb(!s.third, yes), why: whyVerb(s.third) },
    {
      label: verb(s.third, !yes),
      why: yes
        ? 'La phrase en français dit qu’on aime : pas de « don’t » ni de « doesn’t ».'
        : 'La phrase en français dit non.',
    },
    { label: verb(!s.third, !yes), why: `${whyVerb(s.third)} Regarde aussi s’il y a un « non ».` },
  ]);
  return {
    prompt: `Complète : « ${s.en} … ${thing.en}. » (${yes ? s.yes : s.no} ${thing.fr}.)`,
    answer,
    traps,
    hint: 'Deux questions : qui parle ? Et est-ce oui ou non ?',
    steps: [whyVerb(s.third), `Réponse : **${good}**`],
  };
}

/** Niveau 3 : écrire la phrase (I, we, they). */
function likeWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(SUBJECTS.filter((x) => !x.third));
  const yes = rng.int(0, 1) === 0;
  const thing = rng.pick(LIKED);
  const v = verb(false, yes);
  const good = `${s.en} ${v} ${thing.en}`;
  return {
    prompt: `Écris en anglais (avec « like ») : « ${yes ? s.yes : s.no} ${thing.fr}. »`,
    answer: { kind: 'text', accepted: full(yes ? [good] : [good, `${s.en} ${longForm(v)} ${thing.en}`]) },
    traps: [
      { text: `${s.en} ${verb(false, !yes)} ${thing.en}.`, why: 'Attention : oui et non sont inversés.' },
      { text: `${s.en} ${verb(true, yes)} ${thing.en}.`, why: whyVerb(false) },
      yes
        ? { text: `${s.en} like the ${thing.en}.`, why: 'Pour parler d’un goût en général, pas de « the ».' }
        : { text: `${s.en} not like ${thing.en}.`, why: 'Pour dire non, il faut « don’t » devant « like ».' },
    ],
    hint: 'Dans l’ordre : qui, le verbe (avec « don’t » si c’est non), puis la chose, sans « the ».',
    steps: [
      `Sujet : « ${s.en} ». Verbe : « ${v} ».`,
      'On parle d’un goût en général : pas de « the ».',
      `Réponse : **${good}.**`,
    ],
  };
}

/** Niveau 4 : he et she (négation, question à remettre en ordre, like + -ing). */
function likeThird(rng: Rng): QuestionDraft {
  const form = rng.int(0, 2);
  const s = rng.pick(SUBJECTS.filter((x) => x.third));
  const he = s.en.toLowerCase();
  const thing = rng.pick(LIKED);
  if (form === 0) {
    const good = `${s.en} doesn’t like ${thing.en}`;
    return {
      prompt: `Écris à la forme négative : « ${s.en} likes ${thing.en}. »`,
      answer: { kind: 'text', accepted: full([good, `${s.en} does not like ${thing.en}`]) },
      traps: [
        { text: `${s.en} don’t like ${thing.en}.`, why: whyVerb(true) },
        { text: `${s.en} doesn’t likes ${thing.en}.`, why: 'Après « doesn’t », « like » perd son s.' },
        { text: `${s.en} not likes ${thing.en}.`, why: 'Il faut « doesn’t » pour dire non.' },
      ],
      hint: 'Un petit mot de la famille de « do » vient devant. Que devient le s de « likes » ?',
      steps: [
        'Avec he ou she, la forme négative commence par « doesn’t ».',
        'Le s passe sur « does » : « like » reste seul.',
        `Réponse : **${good}.**`,
      ],
    };
  }
  if (form === 1) {
    const right = ['Does', he, 'like', thing.en];
    const items = shuffledOther(rng, right);
    return {
      prompt: `Remets les mots dans l’ordre pour poser une question : ${items.join(' / ')} ?`,
      answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
      hint: 'La question commence par le petit mot « Does », puis la personne.',
      steps: ['Ordre d’une question : Does, la personne, like, la chose.', `Réponse : **${right.join(' ')} ?**`],
    };
  }
  const [ing, frIng] = rng.pick([
    ['swimming', 'nager'],
    ['reading', 'lire'],
    ['cooking', 'cuisiner'],
    ['painting', 'peindre'],
    ['dancing', 'danser'],
  ] as const);
  const good = `${s.en} likes ${ing}`;
  const base = ing === 'swimming' ? 'swim' : ing === 'dancing' ? 'dance' : ing.replace(/ing$/, '');
  return {
    prompt: `Écris en anglais, avec « ${ing} » : « ${s.yes} ${frIng}. »`,
    answer: { kind: 'text', accepted: full([good]) },
    traps: [
      { text: `${s.en} like ${ing}.`, why: whyVerb(true) },
      { text: `${s.en} likes ${base}.`, why: `Après « likes », le verbe prend -ing : « ${ing} ».` },
      { text: `${s.en} ${ing}.`, why: 'Il manque le verbe « aimer » : « likes ».' },
    ],
    hint: 'Qui ? Puis le verbe « aimer » (pense au s). Puis le mot en -ing.',
    steps: [
      `Avec « ${s.en} », « like » prend un s.`,
      'Après « likes », l’activité s’écrit avec -ing.',
      `Réponse : **${good}.**`,
    ],
  };
}

/** Niveau 5 : lire deux messages, répondre par une réponse courte. */
function likeRead(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [a, b] = some(rng, LIKED, 2) as [(typeof LIKED)[number], (typeof LIKED)[number]];
  const yes = rng.int(0, 1) === 0;
  const liked = yes ? a : b;
  const disliked = yes ? b : a;
  // Le camarade pense le contraire : il faut lire la bonne ligne.
  const lines = rng.shuffle([
    `${kid.name}: I like ${liked.en}. I don’t like ${disliked.en}.`,
    `${mate.name}: I like ${disliked.en}. I don’t like ${liked.en}.`,
  ]);
  const good = yes ? `Yes, ${kid.he} does` : `No, ${kid.he} doesn’t`;
  const forms = yes
    ? [good, `Yes ${kid.he} does`]
    : [good, `No ${kid.he} doesn’t`, `No, ${kid.he} does not`, `No ${kid.he} does not`];
  const other = otherPronoun(kid).toLowerCase();
  return {
    prompt: `Lis les messages. ${gender(kid)} Réponds en anglais par une réponse courte : « Does ${kid.name} like ${a.en}? »`,
    figure: { kind: 'document', title: 'My likes', lines, credit: 'Écrit pour l’exercice.' },
    answer: { kind: 'text', accepted: full(forms) },
    traps: [
      {
        text: yes ? `No, ${kid.he} doesn’t.` : `Yes, ${kid.he} does.`,
        why: `Lis la ligne ${de(kid.name)}, pas celle ${de(mate.name)}.`,
      },
      {
        text: yes ? `Yes, ${kid.he} likes.` : `No, ${kid.he} don’t.`,
        why: 'La question commence par « Does » : réponds avec « does » ou « doesn’t ».',
      },
      { text: yes ? `Yes, ${other} does.` : `No, ${other} doesn’t.`, why: `Pour ${kid.name}, on dit « ${kid.he} ».` },
      {
        text: yes ? 'Yes' : 'No',
        why: 'Fais une réponse courte complète : Yes ou No, le pronom, puis does ou doesn’t.',
      },
    ],
    hint: `Trouve la ligne ${de(kid.name)}. Cherche « ${a.en} » : y a-t-il « don’t » devant « like » ? ${PRONOUN_HINT}`,
    steps: [
      `${kid.name} écrit : « I ${yes ? 'like' : 'don’t like'} ${a.en}. »`,
      `La question commence par « Does » : on répond avec « ${yes ? 'does' : 'doesn’t'} ».`,
      `Réponse : **${good}.**`,
    ],
  };
}

const like: Skill = {
  id: 'acm1-like',
  title: 'I like / I don’t like',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Like** veut dire « aimer » : I like apples. Pour dire non : I **don’t like** snakes.',
      'I, you, we, they : like, don’t like. He, she, it : **likes**, **doesn’t like**. Après like, une activité prend -ing : I like swimming.',
      'Question : Do you like bananas? Yes, I do. Does he like cats? No, he doesn’t.',
    ],
    source: source('Règles : British Council, LearnEnglish Kids, « Like and don’t like » et « Like + ing ».'),
    sources: ['lve-cm-2026', 'bck-like', 'bck-like-ing'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1 || level === 2) return likeChoice(rng, level);
    if (level === 3) return likeWrite(rng);
    if (level === 4) return likeThird(rng);
    return likeRead(rng);
  },
};

// ——— 2. Can / can't ———

/** Actions tirées des exemples du British Council ; `fr` : « sait + infinitif ». */
interface Action {
  readonly en: string;
  readonly fr: string;
  /** Autres façons justes d’écrire l’action. */
  readonly alt?: readonly string[];
}
const ACTIONS: readonly Action[] = [
  { en: 'swim', fr: 'nager' },
  { en: 'dance', fr: 'danser' },
  { en: 'ride a bike', fr: 'faire du vélo', alt: ['ride a bicycle', 'cycle'] },
  { en: 'speak English', fr: 'parler anglais' },
  { en: 'play the guitar', fr: 'jouer de la guitare', alt: ['play guitar'] },
  { en: 'play the piano', fr: 'jouer du piano', alt: ['play piano'] },
  { en: 'run fast', fr: 'courir vite', alt: ['run quickly'] },
];
const ABLE: readonly { readonly en: string; readonly yes: string; readonly no: string }[] = [
  { en: 'I', yes: 'Je sais', no: 'Je ne sais pas' },
  { en: 'He', yes: 'Il sait', no: 'Il ne sait pas' },
  { en: 'She', yes: 'Elle sait', no: 'Elle ne sait pas' },
  { en: 'We', yes: 'Nous savons', no: 'Nous ne savons pas' },
  { en: 'They', yes: 'Ils savent', no: 'Ils ne savent pas' },
];
const modal = (yes: boolean) => (yes ? 'can' : 'can’t');
const negatives = (subject: string, action: string) =>
  ['can’t', 'cannot', 'can not'].map((n) => `${subject} ${n} ${action}`);
/** Toutes les phrases justes : chaque écriture de l’action, au « oui » ou au « non ». */
const sentences = (subject: string, a: Action, yes: boolean) =>
  [a.en, ...(a.alt ?? [])].flatMap((x) => (yes ? [`${subject} can ${x}`] : negatives(subject, x)));
const WHY_BARE = 'Après « can » ou « can’t », le verbe reste seul : pas de « to », pas de s.';

function canListen(rng: Rng): QuestionDraft {
  const yes = rng.int(0, 1) === 0;
  const i = rng.int(0, ACTIONS.length - 1);
  // Les autres actions dépendent de la bonne : deux phrases entendues n’ont jamais les mêmes propositions.
  const [a, b, c] = [0, 1, 2].map((step) => at(ACTIONS, (i + step) % ACTIONS.length)) as [
    (typeof ACTIONS)[number],
    (typeof ACTIONS)[number],
    (typeof ACTIONS)[number],
  ];
  const say = (y: boolean, x: string) => `${y ? 'Je sais' : 'Je ne sais pas'} ${x}.`;
  const good = say(yes, a.fr);
  const { answer, traps } = choice(rng, good, [
    {
      label: say(!yes, a.fr),
      why: yes ? 'Tu as entendu « can » : c’est oui.' : 'Tu as entendu « can’t » : c’est non.',
    },
    { label: say(yes, b.fr), why: `« ${b.fr} » se dit « ${b.en} ».` },
    { label: say(!yes, c.fr), why: 'Écoute encore : l’action et le « oui ou non » sont différents.' },
  ]);
  return {
    prompt: 'Écoute. Que dit l’enfant ?',
    audio: { text: `I ${modal(yes)} ${a.en}.`, lang: 'en-GB' },
    answer,
    traps,
    hint: 'Écoute si c’est oui ou non, puis l’action à la fin.',
    steps: [`On entend « I ${modal(yes)} ${a.en}. »`, `Réponse : **${good}**`],
  };
}

function canNegative(rng: Rng): QuestionDraft {
  const s = rng.pick(ABLE);
  const a = rng.pick(ACTIONS);
  const good = `${s.en} can’t ${a.en}`;
  return {
    prompt: `Écris à la forme négative : « ${s.en} can ${a.en}. »`,
    answer: { kind: 'text', accepted: full(negatives(s.en, a.en)) },
    traps: [
      { text: `${s.en} don’t can ${a.en}.`, why: 'Pas de « don’t » avec « can » : on écrit « can’t ».' },
      { text: `${s.en} can’t to ${a.en}.`, why: WHY_BARE },
      { text: `${s.en} cant ${a.en}.`, why: 'Il manque l’apostrophe dans « can’t ».' },
    ],
    hint: 'Un seul mot change : celui qui est devant l’action.',
    steps: ['Le contraire de « can » est « can’t ».', `Réponse : **${good}.**`],
  };
}

function canOrder(rng: Rng): QuestionDraft {
  const who = rng.pick(['you', 'she', 'he', 'they']);
  const a = rng.pick(ACTIONS);
  const right = ['Can', who, a.en];
  const items = shuffledOther(rng, right);
  return {
    prompt: `Remets les mots dans l’ordre pour poser une question : ${items.join(' / ')} ?`,
    answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
    hint: 'Dans une question, « Can » passe devant la personne.',
    steps: ['Ordre d’une question : Can, la personne, l’action.', `Réponse : **${right.join(' ')} ?**`],
  };
}

function canShort(rng: Rng): QuestionDraft {
  const kid = rng.pick(KIDS);
  const a = rng.pick(ACTIONS);
  const yes = rng.int(0, 1) === 0;
  const good = yes ? `Yes, ${kid.he} can` : `No, ${kid.he} can’t`;
  const forms = yes
    ? [good, `Yes ${kid.he} can`]
    : ['can’t', 'cannot', 'can not'].flatMap((n) => [`No, ${kid.he} ${n}`, `No ${kid.he} ${n}`]);
  return {
    prompt: `${gender(kid)} Réponds par une réponse courte (${yes ? 'oui' : 'non'}) : « Can ${kid.name} ${a.en}? »`,
    answer: { kind: 'text', accepted: full(forms) },
    traps: [
      { text: yes ? `No, ${kid.he} can’t.` : `Yes, ${kid.he} can.`, why: 'Regarde entre parenthèses : oui ou non ?' },
      {
        text: yes ? `Yes, ${kid.he} does.` : `No, ${kid.he} doesn’t.`,
        why: 'La question commence par « Can » : réponds avec « can » ou « can’t ».',
      },
      { text: yes ? 'Yes' : 'No', why: 'Fais une réponse courte complète : Yes ou No, le pronom, puis can ou can’t.' },
    ],
    hint: `Remplace ${kid.name} par un pronom. ${PRONOUN_HINT} Reprends le premier mot de la question.`,
    steps: [`Pour ${kid.name}, on dit « ${kid.he} ».`, `Réponse : **${good}.**`],
  };
}

/** Niveau 5 : lire deux messages, puis écrire ce qu’un enfant sait ou ne sait pas faire. */
function canRead(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [a, b] = some(rng, ACTIONS, 2) as [(typeof ACTIONS)[number], (typeof ACTIONS)[number]];
  const yes = rng.int(0, 1) === 0;
  const lines = rng.shuffle([
    `${kid.name}: I can ${a.en}. I can’t ${b.en}.`,
    `${mate.name}: I can ${b.en}. I can’t ${a.en}.`,
  ]);
  const action = yes ? a : b;
  const wrong = yes ? b : a;
  const pronoun = cap(kid.he);
  const good = `${pronoun} ${modal(yes)} ${action.en}`;
  return {
    prompt: `Lis les messages. Qu’est-ce ${que(kid.name)} ${yes ? 'sait' : 'ne sait pas'} faire ? Écris une phrase avec « ${pronoun} ».`,
    figure: { kind: 'document', title: 'What can you do?', lines, credit: 'Écrit pour l’exercice.' },
    answer: { kind: 'text', accepted: full(sentences(pronoun, action, yes)) },
    traps: [
      {
        text: `${pronoun} ${modal(yes)} ${wrong.en}.`,
        why: `Cette action est ${yes ? 'écrite après « can’t »' : 'écrite après « can »'} sur la ligne ${de(kid.name)}.`,
      },
      { text: `${otherPronoun(kid)} ${modal(yes)} ${action.en}.`, why: `Pour ${kid.name}, on dit « ${pronoun} ».` },
      { text: `${pronoun} ${modal(!yes)} ${action.en}.`, why: `Ici il faut « ${modal(yes)} ».` },
      { text: `I ${modal(yes)} ${action.en}.`, why: `Tu parles ${de(kid.name)} : remplace « I » par « ${pronoun} ».` },
    ],
    hint: `Trouve la ligne ${de(kid.name)}. Cherche le mot « ${modal(yes)} ».`,
    steps: [
      `${kid.name} écrit : « I ${modal(yes)} ${action.en}. »`,
      `Quand on parle ${de(kid.name)}, « I » devient « ${pronoun} ». « ${modal(yes)} » ne change pas.`,
      `Réponse : **${good}.**`,
    ],
  };
}

const can: Skill = {
  id: 'acm1-can',
  title: 'Can / can’t : savoir faire',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**Can** dit ce que tu sais faire : I can swim. **Can’t** dit le contraire : He can’t ride a bike.',
      'Le mot ne change jamais : I can, she can. Après lui, le verbe reste seul, sans « to » et sans s.',
      'Question : Can you swim? Réponse : Yes, I can. / No, I can’t.',
    ],
    source: source('Règles : British Council, LearnEnglish Kids, « Can and can’t » ; LearnEnglish, « Can, could ».'),
    sources: ['lve-cm-2026', 'bck-can', 'bc-can-could'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const s = rng.pick(ABLE.slice(0, 3));
      const a = rng.pick(ACTIONS.slice(0, 4));
      const yes = rng.int(0, 1) === 0;
      const good = `${s.en} ${modal(yes)} ${a.en}.`;
      const { answer, traps } = choice(rng, good, [
        { label: `${s.en} ${modal(!yes)} ${a.en}.`, why: yes ? '« can’t » veut dire non.' : '« can » veut dire oui.' },
        { label: `${s.en} like ${a.en}.`, why: '« like » parle d’un goût. Ici, on parle de savoir faire.' },
      ]);
      return {
        prompt: `Comment dit-on : « ${yes ? s.yes : s.no} ${a.fr} » ?`,
        answer,
        traps,
        hint: 'Il faut le petit mot de « savoir faire ». Est-ce oui ou non ?',
        steps: [`${yes ? 'Oui' : 'Non'} : on utilise « ${modal(yes)} ».`, `Réponse : **${good}**`],
      };
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) return canListen(rng);
      const s = rng.pick(ABLE);
      const a = rng.pick(ACTIONS);
      const yes = rng.int(0, 1) === 0;
      const good = modal(yes);
      const { answer, traps } = choice(rng, good, [
        { label: modal(!yes), why: yes ? 'La phrase dit oui : « can ».' : 'La phrase dit non : « can’t ».' },
        { label: `${good}s`, why: '« can » ne prend jamais de s, même avec he ou she.' },
        { label: `${good} to`, why: WHY_BARE },
      ]);
      return {
        prompt: `Complète : « ${s.en} … ${a.en}. » (${yes ? s.yes : s.no} ${a.fr}.)`,
        answer,
        traps,
        hint: 'Oui ou non ? Et souviens-toi : ce petit mot ne change jamais.',
        steps: [`${yes ? 'Oui' : 'Non'} : « ${good} », sans s et sans « to ».`, `Réponse : **${good}**`],
      };
    }
    if (level === 3) {
      const s = rng.pick(ABLE);
      const a = rng.pick(ACTIONS);
      const yes = rng.int(0, 1) === 0;
      const good = `${s.en} ${modal(yes)} ${a.en}`;
      return {
        prompt: `Écris en anglais : « ${yes ? s.yes : s.no} ${a.fr}. »`,
        answer: { kind: 'text', accepted: full(sentences(s.en, a, yes)) },
        traps: [
          { text: `${s.en} ${modal(!yes)} ${a.en}.`, why: 'Attention : oui et non sont inversés.' },
          { text: `${s.en} ${modal(yes)} to ${a.en}.`, why: WHY_BARE },
          { text: `${s.en} ${modal(yes)}s ${a.en}.`, why: '« can » ne prend jamais de s.' },
        ],
        hint: 'Dans l’ordre : qui, « can » ou « can’t », puis l’action.',
        steps: [
          `Sujet : « ${s.en} ». ${yes ? 'Oui' : 'Non'} : « ${modal(yes)} ».`,
          `L’action « ${a.fr} » : « ${a.en} ».`,
          `Réponse : **${good}.**`,
        ],
      };
    }
    if (level === 4) {
      const form = rng.int(0, 2);
      return form === 0 ? canNegative(rng) : form === 1 ? canOrder(rng) : canShort(rng);
    }
    return canRead(rng);
  },
};

// ——— 3. Sports et loisirs ———

const pickWord = (list: readonly Word[], en: readonly string[]) => list.filter((w) => en.includes(w.en));

/** Autres réponses justes à la saisie d’un sport ou d’un loisir. */
const MORE: Readonly<Record<string, readonly string[]>> = {
  cycling: ['biking'],
  'horse riding': ['riding'],
  'ride a bike': ['ride a bicycle', 'ride my bike', 'cycle', 'go cycling', 'cycling', 'go biking', 'biking'],
  'go rollerblading': ['rollerblading', 'rollerblade'],
  'go skateboarding': ['skateboarding', 'skateboard'],
  'go fishing': ['fishing', 'fish'],
  'watch TV': ['watch the television'],
  'play on the computer': ['play on a computer', 'play computer games'],
  budgie: ['parakeet'],
  'play a board game': ['play board games'],
  'play an instrument': ['play a musical instrument'],
};
const withMore = (w: Word): Word => ({ ...w, alt: [...(w.alt ?? []), ...(MORE[w.en] ?? [])] });
/** Un verbe de loisir s’écrit aussi avec « to » devant (jamais devant une forme en -ing). */
const withTo = (w: Word): Word => {
  const more = withMore(w);
  return {
    ...more,
    alt: [
      ...(more.alt ?? []),
      ...[w.en, ...(more.alt ?? [])].filter((n) => !/^\w+ing\b/.test(n)).map((n) => `to ${n}`),
    ],
  };
};

/** Sports dont le nom français diffère du nom anglais : les autres ne demandent rien à apprendre. */
const LEARNT = SPORTS.filter((w) => w.fr !== `le ${w.en}`);
/** Saisie d’un nom en un ou plusieurs mots. */
function writeName(rng: Rng, list: readonly Word[], kind: string): QuestionDraft {
  const q = write(rng, list, kind);
  const good = q.answer.kind === 'text' ? (q.answer.accepted[0] ?? '') : '';
  const count = good.split(' ').length;
  return {
    ...q,
    hint: `La réponse commence par « ${good.slice(0, 1)} » et s’écrit en ${count} mot${count > 1 ? 's' : ''}.`,
  };
}

function hobbyRead(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [a, b] = some(rng, pickWord(SPORTS, ['swimming', 'cycling', 'sailing', 'rowing', 'judo', 'tennis']), 2) as [
    Word,
    Word,
  ];
  const lines = rng.shuffle([
    `${kid.name}: I like ${a.en}. I don’t like ${b.en}.`,
    `${mate.name}: I like ${b.en}. I don’t like ${a.en}.`,
  ]);
  const yes = rng.int(0, 1) === 0;
  const sport = yes ? a : b;
  const pronoun = cap(kid.he);
  const v = verb(true, yes);
  const good = `${pronoun} ${v} ${sport.en}`;
  return {
    prompt: `Lis les messages. Écris une phrase avec « ${pronoun} » sur le sport ${que(kid.name)} ${yes ? 'aime' : 'n’aime pas'}.`,
    figure: { kind: 'document', title: 'Sports', lines, credit: 'Écrit pour l’exercice.' },
    answer: { kind: 'text', accepted: full(yes ? [good] : [good, `${pronoun} does not like ${sport.en}`]) },
    traps: [
      {
        text: `${pronoun} ${v} ${(yes ? b : a).en}.`,
        why: `Ce sport est dans l’autre phrase de la ligne ${de(kid.name)}.`,
      },
      { text: `${pronoun} ${verb(false, yes)} ${sport.en}.`, why: whyVerb(true) },
      { text: `I ${verb(false, yes)} ${sport.en}.`, why: `Tu parles ${de(kid.name)} : commence par « ${pronoun} ».` },
    ],
    hint: `Trouve la ligne ${de(kid.name)}. Pense au s quand tu parles d’une autre personne.`,
    steps: [
      `${kid.name} écrit : « I ${verb(false, yes)} ${sport.en}. »`,
      `Quand on parle ${de(kid.name)}, « I » devient « ${pronoun} » et le verbe devient « ${v} ».`,
      `Réponse : **${good}.**`,
    ],
  };
}

const sports: Skill = {
  id: 'acm1-sports-loisirs',
  title: 'Les sports et les loisirs',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Des sports : swimming (natation), cycling (cyclisme), horse riding (équitation), sailing (voile), rowing (aviron).',
      'Des **loisirs** : read a book (lire un livre), listen to music (écouter de la musique), go fishing (pêcher).',
      'Tu aimes une activité ? Dis : I like swimming.',
    ],
    source: source('Mots : British Council, « Sports flashcards » et « Free time activities flashcards ».'),
    sources: ['lve-cm-2026', 'bck-flashcards-sports', 'bck-flashcards-free-time', 'bck-like', 'bck-like-ing'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        pickWord(SPORTS, ['swimming', 'cycling', 'horse riding', 'sailing', 'table tennis', 'rowing']),
        'un sport',
        'Imagine ce sport. Quel mot anglais as-tu entendu en classe ?',
      );
    if (level === 2) {
      if (rng.int(0, 2) === 0) {
        const w = rng.pick(LEARNT);
        const { answer, traps } = choice(
          rng,
          w.fr,
          some(
            rng,
            LEARNT.filter((x) => x !== w),
            3,
          ).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
        );
        return {
          prompt: 'Écoute. De quel sport parle-t-on ?',
          audio: { text: `I like ${w.en}.`, lang: 'en-GB' },
          answer,
          traps,
          hint: 'Écoute bien la fin de la phrase.',
          steps: [`On entend « I like ${w.en}. »`, `Réponse : **${w.fr}**`],
        };
      }
      return rng.int(0, 1) === 0 ? understand(rng, LEARNT, 'un sport') : understand(rng, HOBBIES, 'un loisir');
    }
    if (level === 3) return writeName(rng, LEARNT.map(withMore), 'un sport');
    if (level === 4)
      return rng.int(0, 2) === 0 ? pairs(rng, HOBBIES, 5) : writeName(rng, HOBBIES.map(withTo), 'un loisir');
    return hobbyRead(rng);
  },
};

// ——— 4. Les animaux ———

/** Mots à écrire : l’article est accepté (« le chat » → cat, a cat, the cat). */
const withArticle = (w: Word): Word => ({
  ...w,
  alt: [
    ...(w.alt ?? []),
    ...[w.en, ...(w.alt ?? [])].flatMap((n) => [`${/^[aeio]/.test(n) ? 'an' : 'a'} ${n}`, `the ${n}`]),
  ],
});
const COMMON = [...PETS, ...FARM, ...pickWord(WILD, ['lion', 'tiger', 'elephant', 'giraffe', 'monkey', 'shark'])];

/** Niveau 4 : une phrase entière avec « I’ve got », sans aide. */
function petSentence(rng: Rng): QuestionDraft {
  const w = rng.pick(PETS);
  const good = `I’ve got a ${w.en}`;
  const names = [w.en, ...(withMore(w).alt ?? [])];
  return {
    prompt: `Écris en anglais, avec « got » : « J’ai ${w.fr.replace(/^la /, 'une ').replace(/^le /, 'un ')}. »`,
    answer: { kind: 'text', accepted: full(names.flatMap((n) => [`I’ve got a ${n}`, `I have got a ${n}`])) },
    traps: [
      { text: `I got a ${w.en}.`, why: 'Il manque « ’ve » : on écrit « I’ve got ».' },
      { text: `I’ve got ${w.en}.`, why: 'Il manque « a » devant l’animal.' },
      { text: `I’s got a ${w.en}.`, why: 'Avec « I », on prend « have » : « I’ve got ».' },
      { text: `I’ve got a ${w.typo}.`, why: `Presque ! L’animal s’écrit « ${w.en} ».` },
    ],
    hint: 'Commence par « I », puis « avoir » en deux mots courts, puis « a » et l’animal.',
    steps: [`« J’ai » se dit « I’ve got ».`, `L’animal : « ${w.en} ».`, `Réponse : **${good}.**`],
  };
}

function petRead(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [Kid, Kid];
  const [mine, loved, theirs] = some(
    rng,
    pickWord(PETS, ['cat', 'dog', 'rabbit', 'hamster', 'goldfish', 'parrot', 'lizard']),
    3,
  ) as [Word, Word, Word];
  // « loved » : l’animal aimé n’est pas celui que l’enfant possède.
  const lines = rng
    .shuffle([
      `${kid.name}: I like ${loved.en}s. I’ve got a ${mine.en}.`,
      `${mate.name}: I like ${mine.en}s. I’ve got a ${theirs.en}.`,
    ])
    .map((l) => l.replace('goldfishs', 'goldfish'));
  const pronoun = cap(kid.he);
  const good = `${pronoun}’s got a ${mine.en}`;
  return {
    prompt: `Lis les messages. Quel animal ${kid.name} a-t-${kid.he === 'he' ? 'il' : 'elle'} ? Écris une phrase : « ${pronoun}’s got a … ».`,
    figure: { kind: 'document', title: 'My pet', lines, credit: 'Écrit pour l’exercice.' },
    answer: { kind: 'text', accepted: full([good, `${pronoun} has got a ${mine.en}`]) },
    traps: [
      {
        text: `${pronoun}’s got a ${loved.en}.`,
        why: `${kid.name} aime cet animal (« I like »), mais ce n’est pas celui ${kid.he === 'he' ? 'qu’il' : 'qu’elle'} dit avoir. Cherche « I’ve got ».`,
      },
      { text: `${pronoun}’s got a ${theirs.en}.`, why: `C’est l’animal ${de(mate.name)}.` },
      { text: `${otherPronoun(kid)}’s got a ${mine.en}.`, why: `Pour ${kid.name}, on dit « ${pronoun} ».` },
      { text: mine.en, why: `Le bon animal ! Fais la phrase entière : « ${pronoun}’s got a … ».` },
    ],
    hint: `Sur la ligne ${de(kid.name)}, cherche « I’ve got » : cela veut dire « j’ai ».`,
    steps: [
      `${kid.name} écrit : « I’ve got a ${mine.en}. » C’est l’animal qu’${kid.he === 'he' ? 'il' : 'elle'} a.`,
      `Quand on parle ${de(kid.name)}, « I’ve got » devient « ${pronoun}’s got ».`,
      `Réponse : **${good}.**`,
    ],
  };
}

const animals: Skill = {
  id: 'acm1-animaux',
  title: 'Les animaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **animal de compagnie** : cat (chat), dog (chien), rabbit (lapin), goldfish (poisson rouge).',
      'À la ferme : cow (vache), horse (cheval), sheep (mouton), pig (cochon), goat (chèvre).',
      'Sauvages : tiger (tigre), monkey (singe), whale (baleine). I’ve got a dog = j’ai un chien.',
    ],
    source: source(
      'Mots : British Council, « Pets », « Farm animals », « Wild animals » et « Sea animals flashcards ».',
    ),
    sources: [
      'lve-cm-2026',
      'bck-flashcards-pets',
      'bck-flashcards-farm',
      'bck-flashcards-wild',
      'bck-flashcards-sea',
      'bck-have-got',
      'bck-like',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        pickWord(COMMON, ['cat', 'dog', 'rabbit', 'cow', 'horse', 'pig', 'lion']),
        'un animal',
        'Imagine cet animal. Quel mot anglais as-tu entendu en classe ou en chanson ?',
      );
    if (level === 2) return understand(rng, rng.pick([PETS, FARM, WILD]), 'un animal');
    if (level === 3)
      return writeName(
        rng,
        COMMON.map((w) => withArticle(withMore(w))),
        'un animal',
      );
    if (level === 4) return rng.int(0, 1) === 0 ? pairs(rng, WILD, 5) : petSentence(rng);
    return petRead(rng);
  },
};

export const ENGLISH_TASTES_CHAPTER: Chapter = {
  id: 'acm1-gouts-capacites',
  subject: 'anglais',
  grade: 'cm1',
  domain: 'langue',
  title: 'Goûts et capacités',
  skills: [like, can, sports, animals],
};
