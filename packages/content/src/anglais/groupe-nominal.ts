import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, shuffledOther, some } from './temps.ts';
import {
  ALL_COLOURS,
  ARTICLE_TRICKY,
  ARTICLE_WORDS,
  NATURAL_COLOURS,
  NOUNS,
  SHOWN,
  SIZES,
  THINGS,
  type Adjective,
  type Noun,
  type PluralRule,
  type Thing,
} from './groupe-nominal-faits.ts';

/**
 * Anglais CM2 — « Le groupe nominal » (lot an-cm2-01, docs/adr/0034). Programme : cycle 3, langues vivantes,
 * grammaire du groupe nominal (nombre, articles, démonstratifs, place et accord de l'adjectif). Le programme
 * de 2026 ne s'applique au CM2 qu'à la rentrée 2027. Règles et mots : British Council (voir
 * groupe-nominal-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes';
const source = (detail: string) => `${PROGRAMME} — le groupe nominal. ${detail}`;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
const KIDS = ['Emir', 'Ana', 'Yuna', 'Paul'];

// ——— 1. Le pluriel des noms ———
const RULES: Readonly<Record<PluralRule, string>> = {
  s: 'En général, on ajoute -s (voyelle + y aussi).',
  es: 'Après -s, -ch, -sh, -ss, -x ou -o, on ajoute -es.',
  ies: 'Consonne + y : le y s’en va et on écrit -ies.',
  irregulier: 'C’est un pluriel irrégulier : le mot change, il faut le connaître.',
};
const NO_APOSTROPHE = 'L’apostrophe ne sert pas à faire un pluriel.';
const whyWrong = (n: Noun, w: string) => (w.includes('’') ? NO_APOSTROPHE : RULES[n.rule]);
const byRule = (...rules: PluralRule[]) => NOUNS.filter((n) => rules.includes(n.rule));
/** Noms demandés en saisie : « person » est écarté (voir les données). */
const WRITABLE = NOUNS.filter((n) => n.one !== 'person');

const pluralSteps = (n: Noun) => [
  'Il y en a plusieurs : on cherche le pluriel.',
  RULES[n.rule],
  `Réponse : **${n.many}**`,
];

const pluralTraps = (n: Noun) => [
  { text: n.one, why: 'C’est le singulier : une seule chose. Il en faut plusieurs.' },
  ...n.wrong.map((w) => ({ text: w, why: whyWrong(n, w) })),
];

function pluralChoice(rng: Rng, n: Noun, count: 3 | 4): QuestionDraft {
  const wrong = [
    { label: n.one, why: 'C’est le singulier : une seule chose.' },
    ...n.wrong.slice(0, count - 2).map((w) => ({ label: w, why: whyWrong(n, w) })),
  ];
  const { answer, traps } = choice(rng, n.many, wrong);
  return {
    prompt: `One ${n.one}, two … ? Choisis le pluriel de « ${n.one} » (${n.fr}).`,
    answer,
    traps,
    hint: 'Regarde les dernières lettres du mot. Que faut-il ajouter ?',
    steps: pluralSteps(n),
  };
}

function pluralLevel5(rng: Rng): QuestionDraft {
  const [a, b, c] = [
    rng.pick(byRule('es').filter((n) => n.one !== 'wish')),
    rng.pick(byRule('ies').filter((n) => n.one === 'party' || n.one === 'lady')),
    rng.pick(byRule('irregulier').filter((n) => n.one === 'child' || n.one === 'man' || n.one === 'woman')),
  ];
  const list = rng.shuffle([a, b, c]);
  const kid = rng.pick(KIDS);
  const [n, word] = rng.pick([
    [2, 'two'],
    [3, 'three'],
    [4, 'four'],
  ] as const);
  return {
    prompt: `${kid} décrit un dessin. Dans un 2e dessin, il y en a ${n} de chaque. Écris les mots au pluriel.`,
    figure: {
      kind: 'document',
      title: 'My picture',
      lines: [`In my picture, I can see:`, ...list.map((x) => `one ${x.one}`)],
      credit: 'Écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: [`In picture two, I can see ${word} `, `, ${word} `, ` and ${word} `, '.'],
      blanks: list.map((x) => ({ mode: 'text' as const, accepted: [x.many] })),
    },
    hint: 'Un mot après l’autre : regarde sa fin. Certains mots changent complètement.',
    steps: [
      ...list.map((x) => `${x.one} → ${x.many} : ${RULES[x.rule]}`),
      `Réponse : **${list.map((x) => x.many).join(', ')}**`,
    ],
  };
}

const plural: Skill = {
  id: 'acm2-pluriel',
  title: 'Le pluriel des noms',
  levels: 5,
  version: 2,
  lesson: {
    memo: [
      'Le **pluriel** : en général, ajoute -s (book → books). Après -s, -ch, -sh, -x, -o : -es (box → boxes).',
      '**Consonne** + y : -ies (party → parties). **Voyelle** + y : juste -s (boy → boys).',
      'Les **irréguliers** changent : man → men, woman → women, child → children, person → people, foot → feet.',
    ],
    source: source('Règles : British Council, LearnEnglish, « Count nouns ».'),
    sources: ['cycle3-2020', 'bc-count-nouns'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return pluralChoice(rng, rng.pick(byRule('s')), 3);
    if (level === 2) return pluralChoice(rng, rng.pick(byRule('es', 'ies')), 4);
    if (level === 3) {
      const n = rng.pick(byRule('s', 'es', 'ies'));
      return {
        prompt: `Écris le pluriel de « ${n.one} » (${n.fr}).`,
        answer: { kind: 'text', accepted: [n.many] },
        traps: pluralTraps(n),
        hint: 'Regarde la fin du mot : un y ? un x, un ch, un sh, un o ?',
        steps: pluralSteps(n),
      };
    }
    if (level === 4) {
      if (rng.int(0, 2) === 0) {
        // Au moins deux irréguliers parmi les cinq paires.
        const rows = rng.shuffle([
          ...some(rng, byRule('irregulier'), 2),
          rng.pick(byRule('s')),
          rng.pick(byRule('es')),
          rng.pick(byRule('ies')),
        ]);
        const left = rows.map((n) => n.one);
        const right = shuffledOther(
          rng,
          rows.map((n) => n.many),
        );
        return {
          prompt: `Associe chaque nom à son pluriel : ${left.join(', ')}.`,
          answer: { kind: 'match', left, right, pairs: rows.map((n) => right.indexOf(n.many)) },
          hint: 'Commence par les mots qui gardent presque la même forme. Les autres suivront.',
          steps: [
            'Chaque nom a son pluriel.',
            ...rows.map((n) => `${n.one} → ${n.many}`),
            `Réponse : **${rows.map((n) => `${n.one} = ${n.many}`).join(' ; ')}**`,
          ],
        };
      }
      const n = rng.pick(WRITABLE.filter((x) => x.rule === 'irregulier' || x.rule === 'ies'));
      return {
        prompt: `Complète au pluriel : « I can see three … » (${n.one}).`,
        answer: { kind: 'text', accepted: [n.many] },
        traps: pluralTraps(n),
        hint: 'Ce mot suit-il la règle du -s ? Cherche s’il change de forme.',
        steps: pluralSteps(n),
      };
    }
    return pluralLevel5(rng);
  },
};

// ——— 2. a, an, the ———
const SOUND: Readonly<Record<'a' | 'an', string>> = {
  a: '« a » va devant un son de consonne.',
  an: '« an » va devant un son de voyelle.',
};
const otherArticle = (x: 'a' | 'an') => (x === 'a' ? 'an' : 'a');

const articles: Skill = {
  id: 'acm2-articles',
  title: 'a, an et the',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **article** se place avant le nom. **a** et **an** veulent dire « un » ou « une », pour une seule chose.',
      'Écoute le son qui suit : a pencil (son de **consonne**), an eraser (son de **voyelle**).',
      'La première fois : a ou an. Quand tu en reparles : **the**. Exemple : I’ve got a car. The car is blue.',
    ],
    source: source(
      'Règles : British Council, LearnEnglish Kids, « Articles » ; LearnEnglish, « The indefinite article ».',
    ),
    sources: ['cycle3-2020', 'bck-articles', 'bc-indefinite-article'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) {
      const w = rng.pick(ARTICLE_WORDS);
      const { answer, traps } = choice(rng, w.article, [
        { label: otherArticle(w.article), why: SOUND[w.article] },
        { label: 'two', why: '« two » veut dire « deux » : il faudrait plusieurs choses.' },
      ]);
      return {
        prompt: `Il y en a un seul. Complète : « I’ve got … ${w.word}. » (${w.fr})`,
        answer,
        traps,
        hint: 'Dis le mot à voix haute. Quel est le tout premier son ?',
        steps: [`« ${w.word} » : ${SOUND[w.article]}`, `Réponse : **${w.article} ${w.word}**`],
      };
    }
    if (level === 2) {
      const w = rng.pick(ARTICLE_WORDS);
      const bad = otherArticle(w.article);
      const many = `${w.word}${w.word === 'sandwich' ? 'es' : 's'}`;
      const { answer, traps } = choice(rng, `${w.article} ${w.word}`, [
        { label: `${bad} ${w.word}`, why: SOUND[w.article] },
        { label: `${w.article} ${many}`, why: 'Pas de a ni de an devant un nom au pluriel.' },
        { label: `${bad} ${many}`, why: 'Pas de a ni de an devant un nom au pluriel.' },
      ]);
      return {
        prompt: `Quel groupe de mots est juste pour dire « ${w.fr} » ?`,
        answer,
        traps,
        hint: 'Une seule chose : le nom a-t-il un s ? Puis écoute son premier son.',
        steps: [
          'Une seule chose : le nom reste au singulier.',
          `« ${w.word} » : ${SOUND[w.article]}`,
          `Réponse : **${w.article} ${w.word}**`,
        ],
      };
    }
    if (level === 3) {
      const x = rng.pick(ARTICLE_WORDS.filter((w) => w.article === 'a'));
      const y = rng.pick(ARTICLE_WORDS.filter((w) => w.article === 'an'));
      const [first, second] = rng.shuffle([x, y]) as [typeof x, typeof y];
      return {
        prompt: `Écris « a » ou « an » dans chaque trou : « I can see … ${first.word} and … ${second.word}. »`,
        answer: {
          kind: 'cloze',
          parts: ['I can see ', ` ${first.word} and `, ` ${second.word}.`],
          blanks: [first, second].map((w) => ({ mode: 'text' as const, accepted: [w.article] })),
        },
        hint: 'Pour chaque trou, dis le mot qui suit. Commence-t-il par un son de voyelle ?',
        steps: [
          `« ${first.word} » : ${SOUND[first.article]}`,
          `« ${second.word} » : ${SOUND[second.article]}`,
          `Réponse : **${first.article} ${first.word}, ${second.article} ${second.word}**`,
        ],
      };
    }
    if (level === 4) {
      const w = rng.pick(ARTICLE_TRICKY);
      return {
        prompt: `Écris « a » ou « an » : « … ${w.word} » (${w.fr}).`,
        answer: { kind: 'text', accepted: [w.article, `${w.article} ${w.word}`] },
        traps: [
          { text: otherArticle(w.article), why: w.why },
          { text: `${otherArticle(w.article)} ${w.word}`, why: w.why },
          { text: 'the', why: '« the » veut dire « le » ou « la ». Ici, on demande « a » ou « an ».' },
        ],
        hint: 'Écoute le premier son juste après le trou. La première lettre peut te tromper.',
        steps: [w.why, `Réponse : **${w.article} ${w.word}**`],
      };
    }
    const x = rng.pick(ARTICLE_WORDS.filter((w) => w.article === 'a'));
    const y = rng.pick(ARTICLE_WORDS.filter((w) => w.article === 'an'));
    const [first, second] = rng.shuffle([x, y]) as [typeof x, typeof y];
    const back = rng.pick([first, second]);
    const colour = rng.pick(['blue', 'red', 'green', 'black']);
    const kid = rng.pick(KIDS);
    return {
      prompt: `${kid} montre son dessin pour la première fois (${first.fr}, ${second.fr}), puis reparle d’une chose. Écris « a », « an » ou « the ».`,
      answer: {
        kind: 'cloze',
        parts: ['In my picture, I’ve got ', ` ${first.word} and `, ` ${second.word}. `, ` ${back.word} is ${colour}.`],
        blanks: [
          { mode: 'text', accepted: [first.article] },
          { mode: 'text', accepted: [second.article] },
          { mode: 'text', accepted: ['the'] },
        ],
      },
      hint: 'La première fois ou la deuxième fois ? Regarde si le mot a déjà été dit.',
      steps: [
        `La première fois : « ${first.article} ${first.word} » et « ${second.article} ${second.word} ».`,
        `« ${first.word} » : ${SOUND[first.article]} « ${second.word} » : ${SOUND[second.article]}`,
        `« ${back.word} » revient : on en a déjà parlé, donc « the ».`,
        `Réponse : **${first.article}, ${second.article}, The**`,
      ],
    };
  },
};

// ——— 3. this / that ———
type Demonstrative = 'this' | 'that' | 'these' | 'those';
const demonstrative = (near: boolean, one: boolean): Demonstrative =>
  near ? (one ? 'this' : 'these') : one ? 'that' : 'those';
const MEANING: Readonly<Record<Demonstrative, string>> = {
  this: '« this » : une seule chose, près de toi.',
  these: '« these » : plusieurs choses, près de toi.',
  that: '« that » : une seule chose, loin de toi.',
  those: '« those » : plusieurs choses, loin de toi.',
};
const ALL_DEMONSTRATIVES: readonly Demonstrative[] = ['this', 'that', 'these', 'those'];
const mistake = (given: Demonstrative, right: Demonstrative) =>
  `${MEANING[given]} Ici, il faut un autre mot : ${
    (given === 'this' || given === 'these') !== (right === 'this' || right === 'these')
      ? 'regarde la distance.'
      : 'compte les choses.'
  }`;
const demonstrativeTraps = (right: Demonstrative) =>
  ALL_DEMONSTRATIVES.filter((d) => d !== right).map((d) => ({ text: d, why: mistake(d, right) }));

function demonstrativeChoice(rng: Rng, level: 1 | 2): QuestionDraft {
  const s = rng.pick(SHOWN.slice(0, 6));
  const near = rng.int(0, 1) === 0;
  const one = level === 1 ? true : rng.int(0, 1) === 0;
  const right = demonstrative(near, one);
  const wrong: readonly Demonstrative[] =
    level === 1 ? [near ? 'that' : 'this', near ? 'those' : 'these'] : ALL_DEMONSTRATIVES.filter((d) => d !== right);
  const { answer, traps } = choice(
    rng,
    cap(right),
    wrong.map((d) => ({ label: cap(d), why: mistake(d, right) })),
  );
  const thing = one ? s.one : s.many;
  const where = near ? 'here' : 'over there';
  return {
    prompt: `Complète : « … ${thing} ${where} ${one ? 'is' : 'are'} mine. » (here = ici, over there = là-bas)`,
    answer,
    traps,
    hint: 'Pose-toi deux questions : près ou loin ? Une seule chose ou plusieurs ?',
    steps: [
      `« ${where} » : c’est ${near ? 'près' : 'loin'}. « ${thing} » : ${one ? 'une seule chose' : 'plusieurs choses'}.`,
      MEANING[right],
      `Réponse : **${cap(right)} ${thing}**`,
    ],
  };
}

function demonstrativeCloze(rng: Rng): QuestionDraft {
  const [a, b] = some(rng, SHOWN.slice(0, 6), 2) as [(typeof SHOWN)[number], (typeof SHOWN)[number]];
  const nearFirst = rng.int(0, 1) === 0;
  const [x, y]: readonly Demonstrative[] = nearFirst ? ['this', 'that'] : ['that', 'this'];
  const place = (near: boolean) => (near ? 'here' : 'over there');
  return {
    prompt: `Écris « this » ou « that » : « … ${a.one} ${place(nearFirst)} is mine. … ${b.one} ${place(!nearFirst)} is yours. »`,
    answer: {
      kind: 'cloze',
      parts: ['', ` ${a.one} ${place(nearFirst)} is mine. `, ` ${b.one} ${place(!nearFirst)} is yours.`],
      blanks: [
        { mode: 'text', accepted: [x ?? 'this'] },
        { mode: 'text', accepted: [y ?? 'that'] },
      ],
    },
    hint: '« here » veut dire « ici ». « over there » veut dire « là-bas ».',
    steps: [
      '« here » (ici) va avec « this ». « over there » (là-bas) va avec « that ».',
      `Réponse : **${cap(x ?? '')} ${a.one}, ${cap(y ?? '')} ${b.one}**`,
    ],
  };
}

function demonstrativeWrite(rng: Rng): QuestionDraft {
  const near = rng.int(0, 1) === 0;
  const noun = rng.pick(NOUNS.filter((n) => ['child', 'man', 'woman', 'foot', 'box', 'watch', 'lady'].includes(n.one)));
  const one = rng.int(0, 2) === 0;
  const right = demonstrative(near, one);
  const thing = one ? noun.one : noun.many;
  return {
    prompt: `Écris le démonstratif : « Look at … ${thing} ${near ? 'here' : 'over there'}. »`,
    answer: { kind: 'text', accepted: [right] },
    traps: demonstrativeTraps(right),
    hint: 'Le nom est-il au singulier ou au pluriel ? Attention aux pluriels sans s. Puis : près ou loin ?',
    steps: [
      `« ${thing} » : ${one ? 'un seul (singulier)' : 'plusieurs (pluriel)'}. C’est ${near ? 'près' : 'loin'}.`,
      MEANING[right],
      `Réponse : **${right} ${thing}**`,
    ],
  };
}

function demonstrativeScene(rng: Rng): QuestionDraft {
  const [held, far] = some(rng, SHOWN.slice(0, 6), 2) as [(typeof SHOWN)[number], (typeof SHOWN)[number]];
  const kid = rng.pick(KIDS);
  const heldOne = rng.int(0, 1) === 0;
  const farOne = rng.int(0, 1) === 0;
  const x = demonstrative(true, heldOne);
  const y = demonstrative(false, farOne);
  const heldWord = heldOne ? held.one : held.many;
  const farWord = farOne ? far.one : far.many;
  const article = /^[aeiou]/.test(far.one) ? 'an' : 'a';
  const heldLine = `There ${heldOne ? `is a ${held.one}` : `are two ${held.many}`} right next to ${kid}.`;
  const farLine = `There ${farOne ? `is ${article} ${far.one}` : `are two ${far.many}`} at the end of the garden, far from ${kid}.`;
  return {
    prompt: `Lis la scène. ${kid} montre les objets et parle. Complète avec this, that, these ou those.`,
    figure: {
      kind: 'document',
      title: 'In the garden',
      lines: [heldLine, farLine],
      credit: 'Écrit pour l’exercice.',
    },
    answer: {
      kind: 'cloze',
      parts: [
        'Look! ',
        ` ${heldWord} ${heldOne ? 'is' : 'are'} new, and `,
        ` ${farWord} ${farOne ? 'is' : 'are'} old.`,
      ],
      blanks: [
        { mode: 'text', accepted: [x] },
        { mode: 'text', accepted: [y] },
      ],
    },
    hint: '« next to » = à côté de, « far from » = loin de. Pour chaque trou : près ou loin ? une ou plusieurs ?',
    steps: [
      `« ${heldWord} » : juste à côté, tout près. ${MEANING[x]}`,
      `« ${farWord} » : au fond du jardin, loin. ${MEANING[y]}`,
      `Réponse : **${cap(x)} ${heldWord}, ${y} ${farWord}**`,
    ],
  };
}

const thisThat: Skill = {
  id: 'acm2-this-that',
  title: 'this et that',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **démonstratif** sert à montrer. **This** : une chose près de toi. **That** : une chose loin de toi.',
      'Au pluriel, ils changent : **these** (près) et **those** (loin).',
      'Exemple : This book here is mine. Those pens over there are yours.',
    ],
    source: source(
      'Règles : British Council, LearnEnglish Kids, « This, that, these, those » ; LearnEnglish, « Demonstratives ».',
    ),
    sources: ['cycle3-2020', 'bck-this-that', 'bc-demonstratives'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1 || level === 2) return demonstrativeChoice(rng, level);
    if (level === 3) return demonstrativeCloze(rng);
    if (level === 4) return demonstrativeWrite(rng);
    return demonstrativeScene(rng);
  },
};

// ——— 4. L'adjectif avant le nom ———
interface Group {
  readonly thing: Thing;
  readonly size: Adjective;
  readonly colour: Adjective;
}
const drawGroup = (rng: Rng): Group => {
  const thing = rng.pick(THINGS);
  return { thing, size: rng.pick(SIZES), colour: rng.pick(thing.animal ? NATURAL_COLOURS : ALL_COLOURS) };
};
const frForm = (a: Adjective, t: Thing, many: boolean) => a.fr[(many ? 2 : 0) + (t.feminine ? 1 : 0)] ?? a.fr[0];
const NUMBERS = [
  [2, 'two'],
  [3, 'three'],
  [4, 'four'],
  [5, 'five'],
] as const;
const BEFORE = 'En anglais, l’adjectif se place avant le nom.';
const NO_S = 'Un adjectif anglais ne prend jamais de s.';
const SIZE_FIRST = 'La taille se place avant la couleur.';
const colourForms = (c: Adjective) => [c.en, ...(c.alt ? [c.alt] : [])];
/** « small » se traduit aussi par « little ». */
const sizeForms = (s: Adjective) => (s.en === 'small' ? [s.en, 'little'] : [s.en]);
/** En traduction depuis le français, « grand » peut aussi se dire « large ». */
const translatedSizeForms = (s: Adjective) => (s.en === 'big' ? [s.en, 'large'] : sizeForms(s));
/** « two small black cats », avec la virgule et l'orthographe américaine acceptées. */
const bigForms = (number: string, g: Group, sizes: readonly string[] = sizeForms(g.size)) =>
  full(
    sizes.flatMap((s) =>
      colourForms(g.colour).flatMap((c) => [
        `${number} ${s} ${c} ${g.thing.many}`,
        `${number} ${s}, ${c} ${g.thing.many}`,
      ]),
    ),
  );
const groupTraps = (number: string, g: Group) => {
  const { size, colour, thing } = g;
  return [
    { text: `${number} ${thing.many} ${size.en} ${colour.en}`, why: BEFORE },
    { text: `${number} ${colour.en} ${size.en} ${thing.many}`, why: SIZE_FIRST },
    { text: `${number} ${size.en} ${colour.en}s ${thing.many}`, why: NO_S },
    { text: `${number} ${size.en}s ${colour.en} ${thing.many}`, why: NO_S },
    {
      text: `${number} ${size.en} ${colour.en} ${thing.one}`,
      why: 'Il y en a plusieurs : le nom doit être au pluriel.',
    },
  ];
};

function adjectiveLevel1(rng: Rng): QuestionDraft {
  const { thing, colour } = drawGroup(rng);
  const good = `a ${colour.en} ${thing.one}`;
  const { answer, traps } = choice(rng, good, [
    { label: `a ${thing.one} ${colour.en}`, why: BEFORE },
    { label: `${colour.en} a ${thing.one}`, why: '« a » se place tout au début du groupe.' },
  ]);
  const fr = `${thing.feminine ? 'une' : 'un'} ${thing.fr} ${frForm(colour, thing, false)}`;
  return {
    prompt: `Comment dit-on « ${fr} » en anglais ?`,
    answer,
    traps,
    hint: 'En anglais, la couleur et le nom ne sont pas dans le même ordre qu’en français.',
    steps: [BEFORE, `Réponse : **${good}**`],
  };
}

function adjectiveLevel2(rng: Rng): QuestionDraft {
  const { thing, colour } = drawGroup(rng);
  const [n, number] = rng.pick(NUMBERS);
  const good = `${number} ${colour.en} ${thing.many}`;
  const { answer, traps } = choice(rng, good, [
    { label: `${number} ${thing.many} ${colour.en}`, why: BEFORE },
    { label: `${number} ${colour.en}s ${thing.many}`, why: NO_S },
    { label: `${number} ${colour.en} ${thing.one}`, why: 'Il y en a plusieurs : le nom prend la marque du pluriel.' },
  ]);
  return {
    prompt: `Quel groupe est juste pour « ${n} ${thing.frMany} ${frForm(colour, thing, true)} » ?`,
    answer,
    traps,
    hint: 'Vérifie la place de la couleur. Puis regarde quel mot prend un s.',
    steps: [BEFORE, `${NO_S} Seul le nom passe au pluriel.`, `Réponse : **${good}**`],
  };
}

function adjectiveLevel3(rng: Rng): QuestionDraft {
  const { thing, size, colour } = drawGroup(rng);
  const adjective = rng.pick([size, colour]);
  const many = rng.int(0, 1) === 0;
  const [n, number] = rng.pick(NUMBERS);
  const words = many ? [number, adjective.en, thing.many] : ['a', adjective.en, thing.one];
  const items = shuffledOther(rng, words);
  const fr = many
    ? `${n} ${thing.frMany} (${frForm(adjective, thing, true)})`
    : `${thing.feminine ? 'une' : 'un'} ${thing.fr} (${frForm(adjective, thing, false)})`;
  return {
    prompt: `Remets les mots dans l’ordre pour dire « ${fr} » : ${items.join(', ')}.`,
    answer: { kind: 'order', items, correct: words.map((w) => items.indexOf(w)) },
    hint: 'Commence par le petit mot ou le nombre. Où se place le mot qui décrit ?',
    steps: ['D’abord « a » ou le nombre, puis l’adjectif, puis le nom.', `Réponse : **${words.join(' ')}**`],
  };
}

function adjectiveLevel4(rng: Rng): QuestionDraft {
  const g = drawGroup(rng);
  const [n, number] = rng.pick(NUMBERS);
  const good = `${number} ${g.size.en} ${g.colour.en} ${g.thing.many}`;
  // Taille avant le nom en français, couleur après.
  const fr = `${n} ${frForm(g.size, g.thing, true)} ${g.thing.frMany} ${frForm(g.colour, g.thing, true)}`;
  return {
    prompt: `Écris en anglais, avec le nombre en lettres : « ${fr} ».`,
    answer: { kind: 'text', accepted: bigForms(number, g, translatedSizeForms(g.size)) },
    traps: groupTraps(number, g),
    hint: 'Quatre mots : le nombre, deux adjectifs, puis le nom. Quel adjectif passe en premier ?',
    steps: [BEFORE, `${SIZE_FIRST} ${NO_S}`, `Réponse : **${good}**`],
  };
}

function adjectiveLevel5(rng: Rng): QuestionDraft {
  const kids = some(rng, KIDS, 3);
  const things = some(rng, THINGS, 3);
  const groups = things.map((thing): Group => ({
    thing,
    size: rng.pick(SIZES),
    colour: rng.pick(thing.animal ? NATURAL_COLOURS : ALL_COLOURS),
  }));
  const counts = groups.map(() => rng.pick(NUMBERS));
  const i = rng.int(0, 2);
  const g = at(groups, i);
  const kid = at(kids, i);
  const [, number] = at(counts, i);
  const good = `${number} ${g.size.en} ${g.colour.en} ${g.thing.many}`;
  const lines = kids.map((k, j) => {
    const x = at(groups, j);
    return `${k}: I’ve got ${at(counts, j)[1]} ${x.thing.many}. They are ${x.size.en}. They are ${x.colour.en}.`;
  });
  const elided = /^[AEIOU]/.test(kid);
  const who = elided ? `qu’${kid}` : `que ${kid}`;
  const of = elided ? `d’${kid}` : `de ${kid}`;
  return {
    prompt: `Lis les messages. Résume en un seul groupe de mots anglais ce ${who} possède, avec le nombre en lettres.`,
    figure: { kind: 'document', title: 'What have you got?', lines, credit: 'Écrit pour l’exercice.' },
    answer: { kind: 'text', accepted: bigForms(number, g) },
    traps: groupTraps(number, g),
    hint: `Cherche la ligne ${of}. Les deux mots qui décrivent doivent passer devant le nom.`,
    steps: [
      `Sur la ligne ${of} : ${number}, ${g.size.en}, ${g.colour.en}, ${g.thing.many}.`,
      `${BEFORE} ${SIZE_FIRST}`,
      `Réponse : **${good}**`,
    ],
  };
}

const adjective: Skill = {
  id: 'acm2-adjectif',
  title: 'L’adjectif avant le nom',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’**adjectif** décrit. En anglais, il se place avant le nom : a small car (une petite voiture).',
      'Il ne prend jamais de s : three black cats. La taille passe avant la couleur : a big blue ball.',
      'Après le verbe **be**, il vient après le verbe : The car is small.',
    ],
    source: source('Règles : British Council, LearnEnglish Kids, « Adjectives » ; LearnEnglish, « Noun phrases ».'),
    sources: ['cycle3-2020', 'bck-adjectives', 'bc-noun-phrases'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return adjectiveLevel1(rng);
    if (level === 2) return adjectiveLevel2(rng);
    if (level === 3) return adjectiveLevel3(rng);
    if (level === 4) return adjectiveLevel4(rng);
    return adjectiveLevel5(rng);
  },
};

/** L'identifiant du chapitre garde l'ancien nom (« acm2-pluriel ») : la progression des élèves y est liée. */
export const ENGLISH_NOUN_GROUP_CHAPTER: Chapter = {
  id: 'acm2-pluriel',
  subject: 'anglais',
  grade: 'cm2',
  domain: 'langue',
  title: 'Le groupe nominal',
  skills: [plural, articles, thisThat, adjective],
};
