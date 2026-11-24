import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import {
  OWNERS,
  PREDICATES,
  PRONOUNS,
  SUBJECTS,
  THINGS,
  cap,
  rowOf,
  type Pronoun,
  type PronounRow,
} from './be-faits.ts';

/**
 * Anglais CM1 — « Be et possessifs » (lot an-cm1-02, docs/adr/0034). Programme : cycle 3, langues vivantes
 * (« Grammaire : contrôle limité de quelques structures et formes grammaticales simples… » ; « Poser des questions
 * simples »). Formes : British Council (voir be-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes, CM1';
const source = (detail: string) =>
  `${PROGRAMME} — « Grammaire : contrôle limité de quelques structures et formes grammaticales simples ». ${detail}`;

const at = <T>(list: readonly T[], i: number): T => {
  const x = list[i];
  if (x === undefined) throw new Error(`indice ${i} hors liste`);
  return x;
};

/** Mélange une liste jusqu'à ce qu'elle ne soit plus dans l'ordre de départ. */
function shuffledOther<T>(rng: Rng, list: readonly T[]): T[] {
  let out = rng.shuffle(list);
  while (out.every((x, i) => x === list[i])) out = rng.shuffle(list);
  return out;
}

const withEnd = (core: string, end: string): string[] => [core, `${core}${end}`];
const sentence = (p: Pronoun, be: string, pred: string) => `${cap(p)} ${be} ${pred}.`;
/** Pronoms du niveau 1 : les plus simples. */
const EASY: readonly Pronoun[] = ['I', 'he', 'she', 'we'];
const pickPronoun = (rng: Rng, only?: readonly Pronoun[]): PronounRow =>
  rowOf(rng.pick(only ?? PRONOUNS.map((x) => x.en)));
/** Un pronom par forme de be (am, is, are). */
const onePerBe = (rng: Rng): PronounRow[] => [
  rowOf('I'),
  rowOf(rng.pick(['he', 'she', 'it'] as const)),
  rowOf(rng.pick(['you', 'we', 'they'] as const)),
];

// ——— 1. be au présent ———
const bePresent: Skill = {
  id: 'acm1-be-present',
  title: 'Le verbe be au présent',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Le **verbe be** veut dire « être ». Il change avec le pronom : I am, you are, he / she / it is, we are, they are.',
      'À l’oral, on le raccourcit : I’m, you’re, she’s. C’est une **contraction**. N’oublie jamais l’apostrophe !',
    ],
    source: source('Formes : British Council, LearnEnglish, English grammar reference, « Verb be ».'),
    sources: ['cycle3-2020', 'bc-verb-be'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const p = pickPronoun(rng, EASY);
      const pred = rng.pick(PREDICATES);
      const { answer, traps } = choice(
        rng,
        p.be,
        (['am', 'is', 'are'] as const)
          .filter((v) => v !== p.be)
          .map((v) => ({ label: v, why: `« ${v} » ne va pas avec « ${p.en} » : on dit « ${p.en} ${p.be} ».` })),
      );
      return {
        prompt: `Complète : « ${cap(p.en)} … ${pred}. »`,
        answer,
        traps,
        hint: 'Pense à la petite chanson : I am, you are, he is…',
        steps: [
          `On cherche la forme de be (« être ») qui va avec « ${p.en} ».`,
          `Avec « ${p.en} », on dit « ${p.en} ${p.be} ».`,
          `Réponse : **${p.be}**`,
        ],
      };
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const p = pickPronoun(rng);
        const pred = rng.pick(PREDICATES);
        const wrong = ['am', 'is', 'are', 'be'].filter((v) => v !== p.be);
        const { answer, traps } = choice(
          rng,
          sentence(p.en, p.be, pred),
          wrong.map((v) => ({
            label: sentence(p.en, v, pred),
            why:
              v === 'be'
                ? '« be » tout seul, c’est « être » sans pronom : après un pronom, il faut am, is ou are.'
                : `« ${v} » ne va pas avec « ${p.en} » : on dit « ${p.en} ${p.be} ».`,
          })),
        );
        return {
          prompt: 'Laquelle de ces phrases est correcte ?',
          answer,
          traps,
          hint: 'Regarde le pronom au début de la phrase, puis cherche sa forme de be.',
          steps: [
            `Le pronom est « ${p.en} ».`,
            `Avec « ${p.en} », be devient « ${p.be} ».`,
            `Réponse : **${sentence(p.en, p.be, pred)}**`,
          ],
        };
      }
      const rows = onePerBe(rng);
      const left = rows.map((x) => x.en as string);
      const right = shuffledOther(rng, ['am', 'is', 'are']);
      return {
        prompt: `Associe chaque pronom à la bonne forme de be : ${left.join(', ')}.`,
        answer: { kind: 'match', left, right, pairs: rows.map((x) => right.indexOf(x.be)) },
        hint: 'Commence par « I » : il n’a qu’une seule forme, toute particulière.',
        steps: [
          'On relie chaque pronom à sa forme de be.',
          ...rows.map((x) => `${x.en} → ${x.be}`),
          `Réponse : **${rows.map((x) => `${x.en} ${x.be}`).join(' ; ')}**`,
        ],
      };
    }
    if (level === 3) {
      const [a, b] = rng.shuffle(PRONOUNS).slice(0, 2) as [PronounRow, PronounRow];
      const [pa, pb] = rng.shuffle(PREDICATES).slice(0, 2) as [string, string];
      return {
        prompt: `Écris le bon verbe be dans chaque trou : « ${cap(a.en)} … ${pa}. ${cap(b.en)} … ${pb}. »`,
        answer: {
          kind: 'cloze',
          parts: [`${cap(a.en)} `, ` ${pa}. ${cap(b.en)} `, ` ${pb}.`],
          blanks: [
            { mode: 'text', accepted: [a.be] },
            { mode: 'text', accepted: [b.be] },
          ],
        },
        hint: 'Un trou après l’autre : cherche le pronom, puis sa forme de be (am, is ou are).',
        steps: [
          `Premier trou : avec « ${a.en} », on écrit **${a.be}**.`,
          `Deuxième trou : avec « ${b.en} », on écrit **${b.be}**.`,
        ],
      };
    }
    if (level === 4) {
      const p = pickPronoun(rng);
      const pred = rng.pick(PREDICATES);
      const other = at(
        ['am', 'is', 'are'].filter((v) => v !== p.be),
        rng.int(0, 1),
      );
      if (rng.int(0, 1) === 0) {
        const rest = pred;
        return {
          prompt: `Écris la phrase « ${sentence(p.en, p.be, pred)} » avec la forme courte (contraction) de be.`,
          answer: {
            kind: 'text',
            accepted: [...withEnd(`${cap(p.short)} ${rest}`, '.'), ...withEnd(`${cap(p.short)} ${rest}`, '')],
          },
          traps: [
            {
              text: `${cap(p.short.replace('’', ''))} ${rest}.`,
              why: 'N’oublie pas l’apostrophe : elle remplace la lettre qui disparaît (I’m = I am).',
            },
            {
              text: `${cap(p.en)} ${other} ${rest}.`,
              why: `Ici il faut une forme courte, et « ${other} » ne va pas avec « ${p.en} ».`,
            },
          ],
          hint: 'La contraction garde le pronom, puis une apostrophe, puis la fin du verbe.',
          steps: [
            `Pour « ${p.en} ${p.be} », la forme courte est « ${p.short} ».`,
            `Réponse : **${cap(p.short)} ${rest}.**`,
          ],
        };
      }
      const FR: readonly { readonly p: Pronoun; readonly fr: string }[] = [
        { p: 'I', fr: 'Je suis content(e).' },
        { p: 'you', fr: 'Tu es content(e).' },
        { p: 'he', fr: 'Il est content.' },
        { p: 'she', fr: 'Elle est contente.' },
        { p: 'we', fr: 'Nous sommes contents.' },
        { p: 'they', fr: 'Ils sont contents.' },
      ];
      const f = rng.pick(FR);
      const q = rowOf(f.p);
      const wrongBe = at(
        ['am', 'is', 'are'].filter((v) => v !== q.be),
        rng.int(0, 1),
      );
      return {
        prompt: `Écris en anglais, avec « happy » : « ${f.fr} »`,
        answer: {
          kind: 'text',
          accepted: [
            ...withEnd(sentence(q.en, q.be, 'happy').slice(0, -1), '.'),
            ...withEnd(`${cap(q.short)} happy`, '.'),
          ],
        },
        traps: [
          { text: `${cap(q.en)} be happy.`, why: '« be » seul ne se conjugue pas : il faut am, is ou are.' },
          {
            text: sentence(q.en, wrongBe, 'happy'),
            why: `« ${wrongBe} » ne va pas avec « ${q.en} » : on dit « ${q.en} ${q.be} ».`,
          },
        ],
        hint: 'Trois mots : le pronom, la bonne forme de be, puis « happy ».',
        steps: [
          `Dans « ${f.fr} », le pronom anglais est « ${q.en} ».`,
          `Avec « ${q.en} », be devient « ${q.be} ».`,
          `Réponse : **${sentence(q.en, q.be, 'happy')}**`,
        ],
      };
    }
    // Niveau 5 : le petit texte d'Ana, une forme de be à retrouver.
    const lines = [
      { text: 'Hello! I … Ana.', be: 'am', why: 'le sujet est « I »' },
      { text: 'My brother … ten.', be: 'is', why: 'le sujet est « my brother » : un garçon, donc « he »' },
      {
        text: 'My parents … in the kitchen.',
        be: 'are',
        why: 'le sujet est « my parents » : plusieurs personnes, donc « they »',
      },
      { text: 'We … in London.', be: 'are', why: 'le sujet est « we »' },
      { text: 'My cat … in the garden.', be: 'is', why: 'le sujet est « my cat » : un animal, donc « it »' },
    ];
    const slot = rng.int(0, lines.length - 1);
    const target = at(lines, slot);
    const doc = lines.map((l, i) => (i === slot ? l.text : l.text.replace('…', l.be)));
    const { answer, traps } = choice(
      rng,
      target.be,
      ['am', 'is', 'are', 'be']
        .filter((v) => v !== target.be)
        .map((v) => ({
          label: v,
          why:
            v === 'be'
              ? '« be » tout seul, c’est « être » sans pronom : dans une phrase, il faut am, is ou are.'
              : `« ${v} » ne va pas ici : ${target.why}.`,
        })),
    );
    return {
      prompt: `Lis le texte d’Ana. Quel mot manque à la ligne ${slot + 1} ?`,
      figure: {
        kind: 'document',
        title: 'Ana se présente',
        lines: doc,
        credit: 'Texte écrit pour l’exercice.',
      },
      answer,
      traps,
      hint: 'Trouve le sujet de la phrase, remplace-le par un pronom (I, he, she, it, we, they), puis choisis be.',
      steps: [
        `À la ligne ${slot + 1}, ${target.why}.`,
        'On cherche la forme de be qui va avec ce pronom.',
        `Réponse : **${target.be}**`,
      ],
    };
  },
};

// ——— 2. pronoms sujets ———
const whyNotPronoun = (p: Pronoun, subj: string) => `« ${p} » sert pour ${rowOf(p).usage}, pas pour « ${subj} ».`;

const pronounOptions = (rng: Rng, right: Pronoun, subj: string, count: number) =>
  choice(
    rng,
    right,
    rng
      .shuffle(PRONOUNS.map((x) => x.en).filter((x) => x !== right))
      .slice(0, count)
      .map((x) => ({ label: x, why: whyNotPronoun(x, subj) })),
  );

const SCENES: readonly { readonly fr: string; readonly pro: Pronoun }[] = [
  { fr: 'Tu parles de toi.', pro: 'I' },
  { fr: 'Tu parles à ton copain Emir (tu t’adresses à lui).', pro: 'you' },
  { fr: 'Tu parles à toute ta classe.', pro: 'you' },
  { fr: 'Tu parles de toi et de ton copain Emir, ensemble.', pro: 'we' },
  { fr: 'Tu parles de ton cahier (un seul).', pro: 'it' },
  { fr: 'Tu parles d’Ana et de Paul, ensemble.', pro: 'they' },
  { fr: 'Tu parles de ta sœur.', pro: 'she' },
  { fr: 'Tu parles de ton frère.', pro: 'he' },
];

const subjectPronouns: Skill = {
  id: 'acm1-pronoms-sujets',
  title: 'Les pronoms sujets',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **pronom sujet** remplace la personne ou la chose dont on parle : Ana → she, Emir → he, the cat → it.',
      'Pour plusieurs personnes, on dit « they ». Si tu es dans le groupe, on dit « we ». Et « you » veut dire « tu » ou « vous » !',
    ],
    source: source('Formes : British Council, LearnEnglish, « Possessives: adjectives » (tableau des pronoms sujets).'),
    sources: ['cycle3-2020', 'bc-possessives-adjectives', 'bc-verb-be'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const s = rng.pick(SUBJECTS.filter((x) => ['Ana', 'Emir', 'the cat', 'Ana and Emir'].includes(x.en)));
      const { answer, traps } = pronounOptions(rng, s.pro, s.en, 2);
      return {
        prompt: `Quel pronom sujet remplace « ${s.en} » ?`,
        answer,
        traps,
        hint: 'Demande-toi : est-ce un garçon, une fille, une chose ou plusieurs personnes ?',
        steps: [
          `« ${s.en} » désigne ${rowOf(s.pro).usage}.`,
          `Le pronom qui va avec est « ${s.pro} ».`,
          `Réponse : **${s.pro}**`,
        ],
      };
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const picks: { en: string; pro: Pronoun }[] = [];
        for (const s of rng.shuffle(SUBJECTS))
          if (picks.length < 3 && !picks.some((x) => x.pro === s.pro)) picks.push(s);
        const right = shuffledOther(
          rng,
          picks.map((x) => x.pro as string),
        );
        return {
          prompt: `Associe chaque sujet au pronom qui le remplace : ${picks.map((x) => x.en).join(', ')}.`,
          answer: { kind: 'match', left: picks.map((x) => x.en), right, pairs: picks.map((x) => right.indexOf(x.pro)) },
          hint: 'Commence par le sujet le plus facile : un prénom, un objet ou un groupe.',
          steps: [
            'On remplace chaque sujet par son pronom.',
            ...picks.map((x) => `${x.en} → ${x.pro}`),
            `Réponse : **${picks.map((x) => `${x.en} = ${x.pro}`).join(' ; ')}**`,
          ],
        };
      }
      const s = rng.pick(
        SUBJECTS.filter((x) => ['Emir and I', 'Ana and I', 'Paul and Yuna', 'Ana and Emir', 'the book'].includes(x.en)),
      );
      const { answer, traps } = pronounOptions(rng, s.pro, s.en, 3);
      return {
        prompt: `Quel pronom sujet remplace « ${s.en} » ?`,
        answer,
        traps,
        hint:
          s.pro === 'we' || s.pro === 'they'
            ? 'Il y a plusieurs personnes. Est-ce que tu en fais partie ?'
            : 'Un livre est une chose : on ne dit ni « he » ni « she ».',
        steps: [
          `« ${s.en} » désigne ${rowOf(s.pro).usage}.`,
          `Le pronom qui va avec est « ${s.pro} ».`,
          `Réponse : **${s.pro}**`,
        ],
      };
    }
    if (level === 3) {
      const s = rng.pick(SUBJECTS);
      const pred = rng.pick(PREDICATES);
      const be = rowOf(s.pro).be;
      return {
        prompt: `Écris le pronom sujet qui remplace le début de la phrase : « ${s.en} ${be} ${pred}. » → « … ${be} ${pred}. »`,
        answer: { kind: 'text', accepted: [s.pro] },
        traps: PRONOUNS.filter((x) => x.en !== s.pro && x.be === be)
          .slice(0, 2)
          .map((x) => ({ text: x.en, why: whyNotPronoun(x.en, s.en) })),
        hint: `Le verbe est « ${be} » : ça t’aide à choisir, mais regarde aussi qui on remplace.`,
        steps: [
          `« ${s.en} » désigne ${rowOf(s.pro).usage}.`,
          `On le remplace par « ${s.pro} » : « ${sentence(s.pro, be, pred)} »`,
          `Réponse : **${s.pro}**`,
        ],
      };
    }
    if (level === 4) {
      const sc = rng.pick(SCENES);
      return {
        prompt: `${sc.fr} Écris le pronom sujet anglais qu’il faut employer.`,
        answer: { kind: 'text', accepted: [sc.pro] },
        traps: PRONOUNS.filter((x) => x.en !== sc.pro)
          .slice(0, 6)
          .map((x) => ({ text: x.en, why: `« ${x.en} » sert pour ${x.usage} : ce n’est pas le cas ici.` })),
        hint: 'Qui parle ? À qui ? De qui ? Combien de personnes ?',
        steps: [
          'On regarde de qui on parle : de soi, de la personne à qui on parle, d’un garçon, d’une fille, d’une chose ou d’un groupe.',
          `Ici il s’agit de ${rowOf(sc.pro).usage}.`,
          `Réponse : **${sc.pro}**`,
        ],
      };
    }
    const cases = [
      { who: 'Ana', de: 'd’Ana', pro: 'she' as Pronoun, line: '… is my friend.' },
      { who: 'Emir', de: 'd’Emir', pro: 'he' as Pronoun, line: '… is my friend too.' },
      { who: 'le chat', de: 'du chat', pro: 'it' as Pronoun, line: '… is in the tree.' },
      { who: 'Ana et Emir', de: 'd’Ana et Emir', pro: 'they' as Pronoun, line: '… are in the garden.' },
      { who: 'Ana, Emir et moi', de: 'd’Ana, Emir et moi', pro: 'we' as Pronoun, line: '… are in the garden.' },
    ];
    const c = rng.pick(cases);
    const { answer, traps } = pronounOptions(rng, c.pro, c.who, 3);
    return {
      prompt: `Lis le texte. À la ligne 5, quel pronom sujet manque ? (La ligne 5 parle ${c.de}.)`,
      figure: {
        kind: 'document',
        title: 'Dans le jardin',
        lines: [
          'I am in the garden with Ana and Emir.',
          'Ana is happy.',
          'Emir is tired.',
          'Our cat is in the tree.',
          c.line,
        ],
        credit: 'Texte écrit pour l’exercice.',
      },
      answer,
      traps,
      hint: 'Regarde de qui parle la ligne 5, puis le verbe (is ou are) : combien de personnes ?',
      steps: [
        `La ligne 5 parle ${c.de}.`,
        `Ce sujet se remplace par « ${c.pro} » (${rowOf(c.pro).usage}).`,
        `Réponse : **${c.pro}**`,
      ],
    };
  },
};

// ——— 3. questions avec be ———
const askBe = (p: PronounRow, pred: string) => `${cap(p.be)} ${p.en} ${pred}?`;

const FR_QUESTIONS: readonly {
  readonly fr: string;
  readonly en: string;
  readonly p: PronounRow;
  /** Mot anglais donné pour lever l'ambiguïté de traduction (content : happy, glad…). */
  readonly word?: string;
  /** Autres écritures correctes (contractions). */
  readonly alt?: readonly string[];
}[] = [
  { fr: 'Es-tu content(e) ?', en: 'Are you happy?', p: rowOf('you'), word: 'happy' },
  { fr: 'Est-elle fatiguée ?', en: 'Is she tired?', p: rowOf('she'), word: 'tired' },
  { fr: 'Sont-ils prêts ?', en: 'Are they ready?', p: rowOf('they'), word: 'ready' },
  { fr: 'Suis-je en retard ?', en: 'Am I late?', p: rowOf('I'), word: 'late' },
  { fr: 'Où est Emir ?', en: 'Where is Emir?', p: rowOf('he'), alt: ['Where’s Emir?'] },
  { fr: 'Où sont Ana et Emir ?', en: 'Where are Ana and Emir?', p: rowOf('they') },
];

/** Niveau 4 des questions : écrire la question sans aide. */
function questionWriting(rng: Rng): QuestionDraft {
  if (rng.int(0, 1) === 0) {
    const p = pickPronoun(rng);
    const pred = rng.pick(PREDICATES);
    const q = askBe(p, pred);
    const doWord = p.en === 'he' || p.en === 'she' || p.en === 'it' ? 'Does' : 'Do';
    return {
      prompt: `Écris la question qui correspond à « ${sentence(p.en, p.be, pred)} »`,
      answer: { kind: 'text', accepted: withEnd(q.slice(0, -1), '?') },
      traps: [
        {
          text: `${doWord} ${p.en} ${pred}?`,
          why: 'Avec be, on n’utilise pas « do » : be passe devant le pronom.',
        },
        {
          text: `${at(
            ['Am', 'Is', 'Are'].filter((v) => v !== cap(p.be)),
            0,
          )} ${p.en} ${pred}?`,
          why: `Cette forme de be ne va pas avec « ${p.en} ».`,
        },
      ],
      hint: 'Be passe en premier, avec une majuscule. Le reste ne change pas.',
      steps: [`On met « ${cap(p.be)} » devant « ${p.en} ».`, `Réponse : **${q}**`],
    };
  }
  const f = rng.pick(FR_QUESTIONS);
  const doWord = f.p.en === 'he' || f.p.en === 'she' ? 'Does' : 'Do';
  return {
    prompt: `Écris en anglais : « ${f.fr} »${f.word ? ` (mot utile : « ${f.word} »)` : ''}`,
    answer: {
      kind: 'text',
      accepted: [f.en, ...(f.alt ?? [])].flatMap((e) => withEnd(e.slice(0, -1), '?')),
    },
    traps: [
      {
        text: f.en.startsWith('Where')
          ? `Where ${f.en.slice(0, -1).split(' ').slice(2).join(' ')} ${f.en.split(' ')[1]}?`
          : `${doWord} ${f.en.split(' ').slice(1).join(' ')}`,
        why: f.en.startsWith('Where')
          ? 'Après « Where », be vient avant le sujet.'
          : 'Avec be, on n’utilise pas « do » : be passe devant le pronom.',
      },
    ],
    hint: 'Commence par le mot interrogatif s’il y en a un, sinon par be.',
    steps: [
      f.en.startsWith('Where') ? '« Where » ouvre la question, puis be, puis le sujet.' : 'Be passe devant le sujet.',
      `Réponse : **${f.en}**`,
    ],
  };
}

/** Niveau 5 des questions : un dialogue où la question manque. */
function questionDialogue(rng: Rng): QuestionDraft {
  const cases = [
    {
      q: 'Where are you?',
      a: 'I’m in the garden.',
      bad: [
        ['Where is you?', 'Avec « you », be devient « are ».'],
        ['How are you?', '« How » demande comment on va, pas où on est.'],
        ['Where you are?', 'Après « Where », be vient avant le sujet.'],
      ],
    },
    {
      q: 'Where is Paul?',
      a: 'He’s in the kitchen.',
      bad: [
        ['Where are Paul?', 'Avec un seul garçon, be devient « is ».'],
        ['Where Paul is?', 'Après « Where », be vient avant le sujet.'],
        ['How is Paul?', '« How » demande comment il va, pas où il est.'],
      ],
    },
    {
      q: 'Where are Yuna and Paul?',
      a: 'They’re at school.',
      bad: [
        ['Where is Yuna and Paul?', 'Il y a deux personnes : be devient « are ».'],
        ['Where do Yuna and Paul?', 'Avec be, on n’utilise pas « do ».'],
        ['How are Yuna and Paul?', '« How » demande comment ils vont, pas où ils sont.'],
      ],
    },
    {
      q: 'How old are you?',
      a: 'I’m nine.',
      bad: [
        ['How old you are?', 'Dans la question, be vient avant le pronom.'],
        ['How old is you?', 'Avec « you », be devient « are ».'],
        ['Where are you?', '« Where » demande un lieu, pas l’âge.'],
      ],
    },
    {
      q: 'How is Yuna?',
      a: 'She’s tired.',
      bad: [
        ['How are Yuna?', 'Avec une seule personne, be devient « is ».'],
        ['Where is Yuna?', '« Where » demande un lieu, pas comment elle va.'],
        ['How Yuna is?', 'Après « How », be vient avant le sujet.'],
      ],
    },
  ] as const;
  const c = rng.pick(cases);
  const { answer, traps } = choice(
    rng,
    c.q,
    c.bad.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: 'Lis le dialogue. Quelle question manque à la ligne 3 ?',
    figure: {
      kind: 'document',
      title: 'Ana et Emir discutent',
      lines: ['Ana : Hi, Emir!', 'Emir : Hi, Ana!', 'Ana : …', `Emir : ${c.a}`],
      credit: 'Dialogue écrit pour l’exercice.',
    },
    answer,
    traps,
    hint: 'Lis la réponse d’Emir : à quelle question répond-elle ? Puis vérifie l’ordre des mots.',
    steps: [
      `Emir répond « ${c.a} » : la question doit demander cette information.`,
      'On vérifie l’ordre : mot interrogatif, be, puis le sujet.',
      `Réponse : **${c.q}**`,
    ],
  };
}

const questionsBe: Skill = {
  id: 'acm1-questions-be',
  title: 'Les questions avec be',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Pour poser une question avec be, on **inverse** : be passe devant le pronom. She is happy. → Is she happy ?',
      'Avec un **mot interrogatif** (what, where, how, why), il se met au tout début : Where is Emir ? Et on n’a pas besoin de « do » avec be !',
    ],
    source: source('Formes : British Council, LearnEnglish (Verb be ; Question forms), page A1-A2.'),
    sources: ['cycle3-2020', 'bc-verb-be', 'bc-question-forms'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const p = pickPronoun(rng, EASY.concat(['you', 'they']));
      const pred = rng.pick(PREDICATES);
      const q = askBe(p, pred);
      const { answer, traps } = choice(rng, q, [
        { label: sentence(p.en, p.be, pred), why: 'Cette phrase affirme quelque chose : ce n’est pas une question.' },
        {
          label: `${cap(p.en)} ${pred} ${p.be}.`,
          why: 'Les mots sont dans le désordre : be vient juste après le pronom.',
        },
      ]);
      return {
        prompt: 'Laquelle de ces phrases est une question ?',
        answer,
        traps,
        hint: 'Une question commence par be (am, is, are) et finit par un point d’interrogation.',
        steps: ['Une question avec be commence par be, puis le pronom, puis la suite.', `Réponse : **${q}**`],
      };
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const p = pickPronoun(rng);
        const pred = rng.pick(PREDICATES);
        const q = askBe(p, pred);
        const wrongBe = at(
          ['Am', 'Is', 'Are'].filter((v) => v !== cap(p.be)),
          rng.int(0, 1),
        );
        const doWord = p.en === 'he' || p.en === 'she' || p.en === 'it' ? 'Does' : 'Do';
        const { answer, traps } = choice(rng, q, [
          {
            label: `${wrongBe} ${p.en} ${pred}?`,
            why: `« ${wrongBe} » ne va pas avec « ${p.en} » : on dit « ${cap(p.be)} ${p.en} ».`,
          },
          { label: `${doWord} ${p.en} ${pred}?`, why: 'Avec be, on n’utilise pas « do » : be passe devant le pronom.' },
          {
            label: `${cap(p.be)} ${pred} ${p.en}?`,
            why: 'Les mots sont dans le désordre : le pronom vient juste après be.',
          },
        ]);
        return {
          prompt: `Comment poser la question à partir de « ${sentence(p.en, p.be, pred)} » ?`,
          answer,
          traps,
          hint: 'Prends le verbe be et mets-le tout au début, avec une majuscule.',
          steps: [
            `La phrase est « ${sentence(p.en, p.be, pred)} »`,
            `On déplace be (« ${p.be} ») devant « ${p.en} ».`,
            `Réponse : **${q}**`,
          ],
        };
      }
      const rows = onePerBe(rng);
      const pred = rng.pick(PREDICATES);
      const left = rows.map((x) => sentence(x.en, x.be, pred));
      const right = shuffledOther(
        rng,
        rows.map((x) => askBe(x, pred)),
      );
      return {
        prompt: `Associe chaque phrase à sa question : ${left.join(' / ')}`,
        answer: { kind: 'match', left, right, pairs: rows.map((x) => right.indexOf(askBe(x, pred))) },
        hint: 'Repère le pronom : la question garde le même, mais be change de place.',
        steps: [
          'Dans chaque question, be passe devant le pronom.',
          ...rows.map((x) => `${sentence(x.en, x.be, pred)} → ${askBe(x, pred)}`),
        ],
      };
    }
    if (level === 3) {
      const p = pickPronoun(rng);
      const wh = rng.int(0, 1) === 0;
      const final = wh ? ['Where', p.be, p.en] : [cap(p.be), p.en, rng.pick(['happy', 'tired', 'ready'] as const)];
      const items = shuffledOther(rng, final);
      return {
        prompt: `Remets les mots dans l’ordre pour former une question : ${items.join(' / ')}`,
        answer: { kind: 'order', items, correct: final.map((w) => items.indexOf(w)) },
        hint: wh
          ? 'Le mot interrogatif ouvre la question, puis be, puis le sujet.'
          : 'Be en premier, puis le pronom, puis la suite.',
        steps: [
          wh ? 'Le mot interrogatif se place au début, puis be, puis le sujet.' : 'Be passe devant le pronom.',
          `Réponse : **${final.join(' ')}?**`,
        ],
      };
    }
    if (level === 4) return questionWriting(rng);
    return questionDialogue(rng);
  },
};

// ——— 4. adjectifs possessifs ———
const ownerOf = (rng: Rng) => rng.pick(OWNERS);

const whyPoss = (poss: string) => {
  const row = PRONOUNS.find((x) => x.poss === poss);
  return `« ${poss} » va avec « ${row?.en ?? '?'} » (${row?.usage ?? ''}).`;
};

/** Niveau 5 des possessifs : un petit texte, un possessif à retrouver. */
function possessiveText(rng: Rng): QuestionDraft {
  const cases = [
    { n: 1, text: 'Hello! … name is Ana.', poss: 'my' },
    { n: 2, text: 'This is Emir, my brother. … room is blue.', poss: 'his' },
    { n: 3, text: 'Look at my bag. … zip is broken.', poss: 'its' },
    { n: 4, text: 'Emir and I are in the garden. … house is big.', poss: 'our' },
    { n: 5, text: 'Paul and Yuna are at school. … bags are red.', poss: 'their' },
  ];
  const reasons: Record<string, string> = {
    my: 'C’est Ana qui parle : « I » → « my ».',
    his: 'Emir est un garçon : « he » → « his ».',
    its: 'Le sac est une chose : « it » → « its ».',
    our: 'Emir et Ana sont ensemble : « we » → « our ».',
    their: 'Paul et Yuna sont deux personnes : « they » → « their ».',
  };
  const slot = rng.pick(cases);
  const lines = cases.map((c) =>
    c.n === slot.n ? c.text : c.text.replace('…', c.poss.charAt(0).toUpperCase() + c.poss.slice(1)),
  );
  const { answer, traps } = choice(
    rng,
    slot.poss,
    ['my', 'your', 'his', 'her', 'its', 'our', 'their']
      .filter((x) => x !== slot.poss)
      .slice(0, 3)
      .map((x) => ({ label: x, why: `${whyPoss(x)} Ici : ${reasons[slot.poss]}` })),
  );
  return {
    prompt: `Lis le texte d’Ana. Quel possessif manque à la ligne ${slot.n} ?`,
    figure: { kind: 'document', title: 'Ana présente sa famille', lines, credit: 'Texte écrit pour l’exercice.' },
    answer,
    traps,
    hint: 'Qui possède la chose ? Trouve son pronom, puis son possessif.',
    steps: [`À la ligne ${slot.n} : ${reasons[slot.poss]}`, `Réponse : **${slot.poss}**`],
  };
}

const possessives: Skill = {
  id: 'acm1-possessifs',
  title: 'Les adjectifs possessifs',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Un **adjectif possessif** dit à qui appartient une chose : I → my, you → your, he → his, she → her, it → its, we → our, they → their.',
      'Attention : **its** (possessif) n’a jamais d’apostrophe. « it’s » veut dire « it is » !',
    ],
    source: source('Formes : British Council, LearnEnglish, English grammar reference, « Possessives: adjectives ».'),
    sources: ['cycle3-2020', 'bc-possessives-adjectives'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const p = pickPronoun(rng);
      const { answer, traps } = choice(
        rng,
        p.poss,
        rng
          .shuffle(PRONOUNS.filter((x) => x.poss !== p.poss))
          .slice(0, 2)
          .map((x) => ({ label: x.poss, why: `${whyPoss(x.poss)} Ici on cherche celui de « ${p.en} ».` })),
      );
      return {
        prompt: `Quel adjectif possessif va avec « ${p.en} » ?`,
        answer,
        traps,
        hint: 'Chaque pronom a son petit mot : I → my, you → your…',
        steps: ['Chaque pronom a son possessif.', `Pour « ${p.en} », c’est « ${p.poss} ».`, `Réponse : **${p.poss}**`],
      };
    }
    if (level === 2) {
      if (rng.int(0, 1) === 0) {
        const rows = rng.shuffle(PRONOUNS).slice(0, 3);
        const right = shuffledOther(
          rng,
          rows.map((x) => x.poss),
        );
        return {
          prompt: `Associe chaque pronom à son adjectif possessif : ${rows.map((x) => x.en).join(', ')}.`,
          answer: {
            kind: 'match',
            left: rows.map((x) => x.en as string),
            right,
            pairs: rows.map((x) => right.indexOf(x.poss)),
          },
          hint: 'Commence par les plus faciles : I → my, you → your.',
          steps: ['On relie chaque pronom à son possessif.', ...rows.map((x) => `${x.en} → ${x.poss}`)],
        };
      }
      const o = ownerOf(rng);
      const th = rng.pick(THINGS);
      const row = rowOf(o.pro);
      const { answer, traps } = choice(
        rng,
        row.poss,
        rng
          .shuffle(PRONOUNS.map((x) => x.poss).filter((x) => x !== row.poss))
          .slice(0, 3)
          .map((x) => ({ label: x, why: `${whyPoss(x)} Ici, le propriétaire se dit « ${row.en} ».` })),
      );
      return {
        prompt: `Complète : « This is … ${th.en}. » (${th.fr} appartient ${o.fr}.)`,
        answer,
        traps,
        hint: 'Remplace le propriétaire par un pronom (I, he, she…), puis cherche son possessif.',
        steps: [
          `Le propriétaire (${o.who}) se dit « ${row.en} ».`,
          `Le possessif de « ${row.en} » est « ${row.poss} ».`,
          `Réponse : **${row.poss}**`,
        ],
      };
    }
    if (level === 3) {
      const o = ownerOf(rng);
      const th = rng.pick(THINGS);
      const row = rowOf(o.pro);
      const others = PRONOUNS.filter((x) => x.poss !== row.poss);
      return {
        prompt: `Écris le possessif qui manque : « This is … ${th.en}. » (${th.fr} appartient ${o.fr}.)`,
        answer: { kind: 'text', accepted: [row.poss] },
        traps: [
          { text: row.en, why: `« ${row.en} » est un pronom sujet. Devant un nom, il faut le possessif.` },
          ...(row.poss === 'its'
            ? [{ text: 'it’s', why: '« it’s » veut dire « it is » : le possessif s’écrit « its », sans apostrophe.' }]
            : []),
          ...others.slice(0, 2).map((x) => ({ text: x.poss, why: whyPoss(x.poss) })),
        ],
        hint: `Le propriétaire se dit « ${row.en} » en anglais. Quel est son possessif ?`,
        steps: [
          `Le propriétaire (${o.who}) se dit « ${row.en} ».`,
          `Le possessif de « ${row.en} » est « ${row.poss} ».`,
          `Réponse : **${row.poss}**`,
        ],
      };
    }
    if (level === 4) {
      if (rng.int(0, 1) === 0) {
        const cases = [
          { b: 'That bird has broken', a: 'wing.', ctx: 'Un oiseau (un seul) a cassé son aile.', poss: 'its' },
          { b: 'She’s washing', a: 'hair.', ctx: 'Les cheveux sont à Ana.', poss: 'her' },
          { b: 'He’s broken', a: 'arm.', ctx: 'Le bras est à Emir.', poss: 'his' },
          {
            b: 'How old is',
            a: 'sister?',
            ctx: 'Tu parles à Ana : la sœur de la personne à qui tu parles.',
            poss: 'your',
          },
          { b: 'That’s', a: 'house.', ctx: 'La maison est à Emir et à moi.', poss: 'our' },
          { b: 'I need to clean', a: 'teeth.', ctx: 'Ce sont les dents de celui ou celle qui parle.', poss: 'my' },
          { b: 'Ana and Emir are in', a: 'kitchen.', ctx: 'La cuisine est à Ana et Emir.', poss: 'their' },
        ] as const;
        const c = rng.pick(cases);
        const row = PRONOUNS.find((x) => x.poss === c.poss);
        return {
          prompt: `Écris le possessif qui manque : « ${c.b} … ${c.a} » (${c.ctx})`,
          answer: { kind: 'text', accepted: [c.poss] },
          traps: [
            ...(c.poss === 'its'
              ? [{ text: 'it’s', why: '« it’s » veut dire « it is » : le possessif s’écrit « its », sans apostrophe.' }]
              : []),
            ...(row
              ? [
                  {
                    text: row.en as string,
                    why: `« ${row.en} » est un pronom sujet. Devant un nom, il faut le possessif.`,
                  },
                ]
              : []),
            ...(c.poss === 'her' ? [{ text: 'his', why: 'Ana est une fille : on dit « her », pas « his ».' }] : []),
            ...(c.poss === 'his' ? [{ text: 'her', why: 'Emir est un garçon : on dit « his », pas « her ».' }] : []),
          ],
          hint: 'Qui possède la chose ? Trouve son pronom, puis son possessif.',
          steps: [
            c.ctx,
            `Le propriétaire se dit « ${row?.en ?? ''} » ; son possessif est « ${c.poss} ».`,
            `Réponse : **${c.poss}**`,
          ],
        };
      }
      const cases = [
        { fr: 'ma maison', en: 'my house', p: 'my', ctx: '' },
        { fr: 'ton chien', en: 'your dog', p: 'your', ctx: '' },
        { fr: 'son sac (le sac d’un garçon)', en: 'his bag', p: 'his', ctx: '' },
        { fr: 'son sac (le sac d’une fille)', en: 'her bag', p: 'her', ctx: '' },
        { fr: 'notre chambre', en: 'our room', p: 'our', ctx: '', alt: 'our bedroom' },
        { fr: 'leur vélo', en: 'their bike', p: 'their', ctx: '', alt: 'their bicycle' },
        { fr: 'sa queue (celle d’un chat)', en: 'its tail', p: 'its', ctx: '' },
      ];
      const c = rng.pick(cases);
      const noun = c.en.split(' ')[1] ?? '';
      const swap = at(
        ['my', 'your', 'his', 'her', 'our', 'their'].filter((x) => x !== c.p && !(c.p === 'its' && x === 'his')),
        rng.int(0, 3),
      );
      return {
        prompt: `Écris en anglais : « ${c.fr} »`,
        answer: { kind: 'text', accepted: [c.en, ...(c.alt ? [c.alt] : [])] },
        traps: [
          { text: noun, why: 'Il manque le possessif devant le nom.' },
          { text: `${swap} ${noun}`, why: whyPoss(swap) },
          ...(c.p === 'its'
            ? [{ text: `it’s ${noun}`, why: '« it’s » veut dire « it is » : il faut « its », sans apostrophe.' }]
            : []),
        ],
        hint: 'Trouve d’abord le pronom (je, tu, il, elle, nous, ils), puis son possessif, puis le nom.',
        steps: ['On écrit le possessif, puis le nom.', `Réponse : **${c.en}**`],
      };
    }
    return possessiveText(rng);
  },
};

export const ENGLISH_BE_CHAPTERS: readonly Chapter[] = [
  {
    id: 'acm1-be',
    subject: 'anglais',
    grade: 'cm1',
    domain: 'langue',
    title: 'Le verbe be',
    skills: [bePresent, subjectPronouns, questionsBe],
  },
  {
    id: 'acm1-possessifs',
    subject: 'anglais',
    grade: 'cm1',
    domain: 'langue',
    title: 'Les possessifs',
    skills: [possessives],
  },
];
