import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { at, de, shuffledOther, some } from './temps.ts';
import {
  ARTICLE_SENTENCES,
  COLOURS,
  OWNED,
  OWNERS,
  PLURALS,
  SHOWN,
  SIZES,
  THINGS,
  TRANSLATIONS,
  type Adjective,
  type Article,
  type ArticleSentence,
  type Described,
  type Owner,
  type Plural,
  type Shown,
} from './groupe-nominal-6e-faits.ts';

/**
 * Anglais 6e — « Le groupe nominal » (lot an-6e-05, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) ; règles et formes : programme et British Council (voir groupe-nominal-6e-faits.ts : chaque fait y
 * porte sa source et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Règles : British Council, ${pages}.`;
const ABOUT = 'Écrit pour l’exercice.';
const KIDS = ['Kim', 'Ben', 'Emma', 'Sam'];

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

/** Association : éléments à gauche, réponses mélangées à droite. */
function pairs(rng: Rng, rows: readonly (readonly [string, string])[]) {
  const left = rows.map((r) => r[0]);
  const right = shuffledOther(
    rng,
    rows.map((r) => r[1]),
  );
  return { kind: 'match' as const, left, right, pairs: rows.map((r) => right.indexOf(r[1])) };
}

// ——— 1. a, the, Ø ———
const NONE = 'Ø (aucun article)';
const label = (a: Article) => (a === 'Ø' ? NONE : a);
const gap = (s: ArticleSentence) => `${s.before} … ${s.after}`.trim();
const filled = (s: ArticleSentence) => {
  const body = [s.before, s.article === 'Ø' ? '' : s.article, s.after].filter(Boolean).join(' ');
  return cap(body.replace(/\. (a|the) /, (_, a: string) => `. ${cap(a)} `));
};
const WHY_WRONG: Readonly<Record<Article, string>> = {
  a: '« a » présente une seule chose, pas encore connue, devant un son de consonne.',
  an: '« an » présente une seule chose, pas encore connue, devant un son de voyelle.',
  the: '« the » désigne une chose précise, déjà connue de celui qui écoute.',
  Ø: 'Sans article, on parle en général, ou bien d’une ville ou d’une expression comme « go to school ».',
};
const articleSteps = (s: ArticleSentence) => [
  `Contexte : ${s.context}.`,
  s.why,
  `Réponse : **${s.article === 'Ø' ? 'Ø' : s.article}** — ${filled(s)}`,
];
const articlePrompt = (s: ArticleSentence) => `Complète : « ${gap(s)} » (${s.context})`;
const ARTICLE_HINT =
  'La chose est-elle nouvelle, déjà connue, ou en parle-t-on en général ? Écoute aussi le son suivant.';
const byArticle = (...list: Article[]) => ARTICLE_SENTENCES.filter((s) => list.includes(s.article));

function articleChoice(rng: Rng, s: ArticleSentence, options: readonly Article[]): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    label(s.article),
    options.filter((o) => o !== s.article).map((o) => ({ label: label(o), why: `${WHY_WRONG[o]} Ici : ${s.why}` })),
  );
  return { prompt: articlePrompt(s), answer, traps, hint: ARTICLE_HINT, steps: articleSteps(s) };
}

function articleRecognise(rng: Rng): QuestionDraft {
  if (coin(rng)) return articleChoice(rng, rng.pick(ARTICLE_SENTENCES), ['a', 'an', 'the', 'Ø']);
  const rows = rng.shuffle((['a', 'the', 'Ø'] as const).map((a) => rng.pick(byArticle(a))));
  const answer = pairs(
    rng,
    rows.map((s) => [articlePrompt(s).replace('Complète : ', ''), label(s.article)] as const),
  );
  return {
    prompt: `Associe chaque phrase à ce qui remplit le trou : ${answer.left.join(' ; ')}`,
    answer,
    hint: ARTICLE_HINT,
    steps: [
      ...rows.map((s) => `${filled(s)} → ${s.why}`),
      `Réponse : **${rows.map((s) => `${gap(s)} → ${s.article}`).join(' ; ')}**`,
    ],
  };
}

const ARTICLE_OPTIONS = ['a', 'an', 'the', 'Ø'];
const blankFor = (a: Article) => ({
  mode: 'list' as const,
  options: ARTICLE_OPTIONS,
  correct: ARTICLE_OPTIONS.indexOf(a),
});

function articleCloze(rng: Rng): QuestionDraft {
  const list = some(
    rng,
    ARTICLE_SENTENCES.filter((s) => !s.before.includes('.')),
    2,
  );
  const [x, y] = list as [ArticleSentence, ArticleSentence];
  const start = (s: ArticleSentence) => (s.before ? `${s.before} ` : '');
  return {
    prompt: `Complète les deux phrases (Ø = aucun article) : « ${gap(x)} » (${x.context}) ; « ${gap(y)} » (${y.context}).`,
    answer: {
      kind: 'cloze',
      parts: [start(x), ` ${x.after} ${start(y)}`, ` ${y.after}`],
      blanks: list.map((s) => blankFor(s.article)),
    },
    hint: ARTICLE_HINT,
    steps: [...list.map((s) => `${filled(s)} : ${s.why}`), `Réponse : **${list.map((s) => s.article).join(', ')}**`],
  };
}

function articleTranslate(rng: Rng): QuestionDraft {
  const t = rng.pick(TRANSLATIONS);
  const mark = t.fr.includes('!') ? '!' : '.';
  const model = at(t.accepted, 0);
  // Une exclamation peut aussi être recopiée avec un simple point.
  const accepted = unique([...ended(t.accepted, mark), ...ended(t.accepted)]);
  return {
    prompt: `Écris en anglais : « ${t.fr} » Emploie ces mots, dans cet ordre : ${t.words}. Ajoute un article seulement s’il en faut un.`,
    answer: { kind: 'text', accepted },
    traps: wrongs(t.wrong, t.accepted, mark),
    hint: 'Pour chaque nom, pose la question : une chose nouvelle, une chose connue, ou une idée générale ?',
    steps: [t.why, `Réponse : **${model}${mark === '!' ? ' !' : '.'}**`],
  };
}

const PETS = [
  { en: 'dog', many: 'dogs', fr: 'chien' },
  { en: 'cat', many: 'cats', fr: 'chat' },
  { en: 'rabbit', many: 'rabbits', fr: 'lapin' },
];
const JOBS = [
  { en: 'architect', article: 'an' as const, fr: 'architecte' },
  { en: 'engineer', article: 'an' as const, fr: 'ingénieure' },
  { en: 'doctor', article: 'a' as const, fr: 'médecin' },
  { en: 'teacher', article: 'a' as const, fr: 'professeure' },
];

function articleDocument(rng: Rng): QuestionDraft {
  const pet = rng.pick(PETS);
  const job = rng.pick(JOBS);
  const colour = rng.pick(COLOURS);
  interface Block {
    readonly note: string;
    readonly parts: readonly string[];
    readonly articles: readonly Article[];
  }
  const blocks: Block[] = rng.shuffle([
    {
      note: `Il présente son ${pet.fr} pour la première fois, puis il reparle du même ${pet.fr}, qui est ${colour.fr[0]}.`,
      parts: ['I’ve got ', ` ${pet.en}. `, ` ${pet.en} is ${colour.en}.`],
      articles: ['a', 'the'],
    },
    {
      note: `Il dit le métier de sa mère : ${job.fr}.`,
      parts: ['My mother is ', ` ${job.en}.`],
      articles: [job.article],
    },
    {
      note: `Il donne son avis sur les ${pet.fr}s en général.`,
      parts: ['I think ', ` ${pet.many} are great.`],
      articles: ['Ø'],
    },
    coin(rng)
      ? {
          note: 'Il parle de l’instrument que joue sa sœur.',
          parts: ['My sister plays ', ' piano.'],
          articles: ['the'],
        }
      : { note: 'Il dit qu’il va en classe comme élève.', parts: ['I go to ', ' school by bus.'], articles: ['Ø'] },
  ] satisfies Block[]);
  const parts = blocks.reduce<string[]>((all, b) => {
    const [first = '', ...rest] = b.parts;
    if (all.length === 0) return [first, ...rest];
    return [...all.slice(0, -1), `${all.at(-1) ?? ''} ${first}`, ...rest];
  }, []);
  const articles = blocks.flatMap((b) => b.articles);
  return {
    prompt: `Tom écrit à sa correspondante. Lis les notes, puis complète son message (Ø = aucun article).`,
    figure: { kind: 'document', title: 'Notes de Tom', lines: blocks.map((b) => b.note), credit: ABOUT },
    answer: { kind: 'cloze', parts, blanks: articles.map(blankFor) },
    hint: 'Suis les notes dans l’ordre : première fois, chose connue, métier ou idée générale ?',
    steps: [
      'Première mention ou métier : a ou an. Chose connue ou instrument joué : the. Idée générale ou « go to school » : Ø.',
      `Réponse : **${articles.join(', ')}**`,
    ],
  };
}

const articles: Skill = {
  id: 'a6-articles',
  title: 'a, the ou aucun article (Ø)',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **article** se place avant le nom. **a** (**an** devant un son de voyelle) présente une chose nouvelle ou un métier : I need an umbrella.',
      '**the** désigne une chose connue, déjà citée ou unique : Look at the moon! On l’emploie aussi pour un instrument joué.',
      '**Ø** veut dire « aucun article » : pour des choses en général (Birds eat worms), une ville, ou « go to school ».',
    ],
    source: source(
      'Utiliser des articles : a, the, Ø',
      '« Articles: a, an, the », « The definite article », « the or no article »',
    ),
    sources: ['anglais-college-2025', 'bc-articles-a-an-the', 'bc-definite-article', 'bc-articles-the-no-article'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return articleChoice(rng, rng.pick(byArticle('a', 'the', 'Ø')), ['a', 'the', 'Ø']);
    if (level === 2) return articleRecognise(rng);
    if (level === 3) return articleCloze(rng);
    if (level === 4) return articleTranslate(rng);
    return articleDocument(rng);
  },
};

// ——— 2. this / these, that / those ———
type Demonstrative = 'this' | 'that' | 'these' | 'those';
const ALL_DEMONSTRATIVES: readonly Demonstrative[] = ['this', 'these', 'that', 'those'];
const demonstrative = (near: boolean, one: boolean): Demonstrative =>
  near ? (one ? 'this' : 'these') : one ? 'that' : 'those';
const MEANING: Readonly<Record<Demonstrative, string>> = {
  this: '« this » : une seule chose, près.',
  these: '« these » : plusieurs choses, près.',
  that: '« that » : une seule chose, loin.',
  those: '« those » : plusieurs choses, loin.',
};
const isNear = (d: Demonstrative) => d === 'this' || d === 'these';
const isOne = (d: Demonstrative) => d === 'this' || d === 'that';
const mistake = (given: Demonstrative, right: Demonstrative) => {
  const what = [
    ...(isNear(given) !== isNear(right) ? ['la distance'] : []),
    ...(isOne(given) !== isOne(right) ? ['le nombre'] : []),
  ].join(' et ');
  return `${MEANING[given]} Vérifie ${what}.`;
};
const demonstrativeTraps = (right: Demonstrative) =>
  ALL_DEMONSTRATIVES.filter((d) => d !== right).map((d) => [d, mistake(d, right)] as const);
const place = (near: boolean) => (near ? 'here' : 'over there');
const DEM_HINT = 'Deux questions : est-ce près (here) ou loin (over there) ? Une seule chose ou plusieurs ?';

function demonstrativeChoice(rng: Rng, options: 3 | 4): QuestionDraft {
  const s = rng.pick(SHOWN);
  const near = coin(rng);
  const one = options === 3 || coin(rng);
  const right = demonstrative(near, one);
  const wrong: readonly Demonstrative[] =
    options === 3 ? [near ? 'that' : 'this', near ? 'those' : 'these'] : ALL_DEMONSTRATIVES.filter((d) => d !== right);
  const { answer, traps } = choice(
    rng,
    cap(right),
    wrong.map((d) => ({ label: cap(d), why: mistake(d, right) })),
  );
  const thing = one ? s.one : s.many;
  return {
    prompt: `Complète : « … ${thing} ${place(near)} ${one ? 'is' : 'are'} new. » (here = ici, over there = là-bas)`,
    answer,
    traps,
    hint: DEM_HINT,
    steps: [
      `« ${place(near)} » : c’est ${near ? 'près' : 'loin'}. « ${thing} » : ${one ? 'singulier' : 'pluriel'}.`,
      MEANING[right],
      `Réponse : **${cap(right)} ${thing}**`,
    ],
  };
}

function demonstrativeMatch(rng: Rng): QuestionDraft {
  const [a, b, c, d] = some(rng, SHOWN, 4) as [Shown, Shown, Shown, Shown];
  // Dans l'ordre de ALL_DEMONSTRATIVES : this, these, that, those.
  const words = [a.one, b.many, c.one, d.many];
  const rows = rng.shuffle(
    ALL_DEMONSTRATIVES.map((dem, i) => {
      const word = at(words, i);
      return [`… ${word} ${place(isNear(dem))}`, dem] as const;
    }),
  );
  const answer = pairs(rng, rows);
  return {
    prompt: `Associe chaque situation ${quoted(answer.left)} au démonstratif qui convient (here = ici, over there = là-bas).`,
    answer,
    hint: 'Pour chaque nom : singulier ou pluriel ? Puis le lieu : here ou over there ?',
    steps: [
      ALL_DEMONSTRATIVES.map((x) => MEANING[x]).join(' '),
      `Réponse : **${rows.map(([l, r]) => `${l} → ${r}`).join(' ; ')}**`,
    ],
  };
}

/** Noms demandés en saisie : réguliers et irréguliers déjà vus (le nombre se lit sur le nom). */
const COUNTED: readonly Shown[] = [...SHOWN, ...PLURALS.filter((p) => p.one !== 'knife')];

function demonstrativeWrite(rng: Rng): QuestionDraft {
  const s = rng.pick(COUNTED);
  const near = coin(rng);
  const one = rng.int(0, 2) === 0;
  const right = demonstrative(near, one);
  const thing = one ? s.one : s.many;
  const accepted = [right, `${right} ${thing}`, `Look at ${right} ${thing} ${place(near)}`];
  return {
    prompt: `Écris le démonstratif : « Look at … ${thing} ${place(near)}! »`,
    answer: { kind: 'text', accepted: ended(accepted, '!') },
    traps: wrongs(demonstrativeTraps(right), accepted, '!'),
    hint: 'Le nom est-il au singulier ou au pluriel ? Certains pluriels n’ont pas de s. Puis : près ou loin ?',
    steps: [
      `« ${thing} » : ${one ? 'singulier' : 'pluriel'}. « ${place(near)} » : ${near ? 'près' : 'loin'}.`,
      MEANING[right],
      `Réponse : **${right} ${thing}**`,
    ],
  };
}

const PEOPLE = PLURALS.filter((p) => ['man', 'woman', 'child'].includes(p.one));

function demonstrativeTransform(rng: Rng): QuestionDraft {
  const p = rng.pick(PEOPLE);
  const near = coin(rng);
  const toPlural = coin(rng);
  const state = rng.pick(['happy', 'tired', 'busy', 'ready']);
  const line = (one: boolean) =>
    `${cap(demonstrative(near, one))} ${one ? p.one : p.many} ${one ? 'is' : 'are'} ${state}`;
  const right = line(!toPlural);
  const d = demonstrative(near, !toPlural);
  const noun = toPlural ? p.many : p.one;
  const be = toPlural ? 'are' : 'is';
  const other = demonstrative(!near, !toPlural);
  // « That man’s happy » : forme contractée admise au singulier.
  const accepted = [right, ...(toPlural ? [] : [`${d} ${noun}’s ${state}`])];
  return {
    prompt: `Mets la phrase au ${toPlural ? 'pluriel' : 'singulier'} : « ${line(toPlural)}. »`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [`${demonstrative(near, toPlural)} ${noun} ${be} ${state}`, 'Le démonstratif change aussi de nombre.'],
        [`${d} ${toPlural ? p.one : p.many} ${be} ${state}`, 'Le nom doit lui aussi changer de nombre.'],
        [`${d} ${noun} ${toPlural ? 'is' : 'are'} ${state}`, 'Le verbe be s’accorde avec le nouveau sujet.'],
        [`${other} ${noun} ${be} ${state}`, 'La distance ne change pas : près reste près, loin reste loin.'],
      ],
      accepted,
    ),
    hint: 'Trois mots changent : le démonstratif, le nom et le verbe. La distance reste la même.',
    steps: [
      `Le démonstratif garde la distance et change de nombre : ${demonstrative(near, toPlural)} → ${d}.`,
      `Le nom : ${toPlural ? `${p.one} → ${p.many}` : `${p.many} → ${p.one}`}. Le verbe : ${be}.`,
      `Réponse : **${right}.**`,
    ],
  };
}

function demonstrativeScene(rng: Rng): QuestionDraft {
  const kid = rng.pick(KIDS);
  // Pas de vélo : on ne le tient pas dans la main et on ne le pose pas sur un bureau.
  const things = some(
    rng,
    SHOWN.filter((s) => s.one !== 'bike'),
    4,
  );
  const rows = rng.shuffle([...ALL_DEMONSTRATIVES]).map((d, i) => {
    const thing = at(things, i);
    const noun = isOne(d) ? thing.one : thing.many;
    const subjectLine = isOne(d) ? `There is a ${noun}` : `There are two ${noun}`;
    const where = isNear(d)
      ? isOne(d)
        ? `in ${kid}’s hand`
        : `on the desk right in front of ${kid}`
      : isOne(d)
        ? 'at the other end of the classroom'
        : 'outside, across the street';
    return { d, noun, line: `${subjectLine} ${where}.` };
  });
  const parts = rows.reduce<string[]>(
    (all, r, i) => [
      ...all.slice(0, -1),
      `${all.at(-1) ?? ''}${i === 0 ? '' : ' '}`,
      ` ${r.noun} ${isOne(r.d) ? 'is' : 'are'} nice.`,
    ],
    [''],
  );
  return {
    prompt: `Lis la scène. ${kid} montre les objets et parle. Complète avec this, that, these ou those.`,
    figure: { kind: 'document', title: 'In the classroom', lines: rows.map((r) => r.line), credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts,
      blanks: rows.map((r) => ({ mode: 'text' as const, accepted: [r.d] })),
    },
    hint: '« in front of » = devant, tout près ; « at the other end » = à l’autre bout ; « across » = de l’autre côté.',
    steps: [
      ...rows.map((r) => `${r.line} ${MEANING[r.d]}`),
      `Réponse : **${rows.map((r) => `${r.d} ${r.noun}`).join(', ')}**`,
    ],
  };
}

const demonstratives: Skill = {
  id: 'a6-demonstratifs',
  title: 'this, these, that et those',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **démonstratif** sert à montrer. Près de toi : **this** (singulier), **these** (pluriel).',
      'Loin de toi : **that** (singulier), **those** (pluriel).',
      'Il s’accorde avec le nom : This child is here, but those women are over there.',
    ],
    source: source(
      'Utiliser des déterminants démonstratifs : this/these, that/those',
      '« This, that, these, those », « Demonstratives »',
    ),
    sources: ['anglais-college-2025', 'bck-this-that', 'bc-demonstratives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return demonstrativeChoice(rng, 3);
    if (level === 2) return coin(rng) ? demonstrativeChoice(rng, 4) : demonstrativeMatch(rng);
    if (level === 3) return demonstrativeWrite(rng);
    if (level === 4) return demonstrativeTransform(rng);
    return demonstrativeScene(rng);
  },
};

// ——— 3. Les pluriels irréguliers ———
const IRREGULAR = 'C’est un pluriel irrégulier : le mot change de forme, on l’apprend avec son singulier.';
const NOT_PLURAL = 'C’est le singulier : une seule personne ou une seule chose.';
const COMMON = PLURALS.filter((p) => ['man', 'woman', 'child', 'foot', 'tooth'].includes(p.one));
const pluralSteps = (p: Plural) => [IRREGULAR, `${p.one} → ${p.many}`, `Réponse : **${p.many}**`];

function pluralChoice(rng: Rng, p: Plural, count: 3 | 4): QuestionDraft {
  const wrong = [
    { label: p.one, why: NOT_PLURAL },
    ...p.wrong.slice(0, count - 2).map((w) => ({ label: w, why: `« ${w} » n’existe pas. ${IRREGULAR}` })),
  ];
  const { answer, traps } = choice(rng, p.many, wrong);
  return {
    prompt: `One ${p.one}, two … ? Choisis le pluriel de « ${p.one} » (${p.fr}).`,
    answer,
    traps,
    hint: 'Ce nom ne forme pas son pluriel avec un simple -s. Quelle forme as-tu déjà entendue ?',
    steps: pluralSteps(p),
  };
}

function pluralMatch(rng: Rng, n: 3 | 5): QuestionDraft {
  const rows = some(rng, PLURALS, n).map((p) => [p.one, p.many] as const);
  const answer = pairs(rng, rows);
  return {
    prompt: `Associe chaque singulier à son pluriel : ${answer.left.join(', ')}.`,
    answer,
    hint: 'Les premières lettres aident souvent : repère d’abord les mots dont tu es sûr.',
    steps: [IRREGULAR, `Réponse : **${rows.map(([a, b]) => `${a} = ${b}`).join(' ; ')}**`],
  };
}

/** « persons » existe en anglais formel : « person » n'est jamais demandé au pluriel en saisie. */
const WRITABLE = PLURALS.filter((p) => p.one !== 'person');

function pluralWrite(rng: Rng): QuestionDraft {
  const p = rng.pick(WRITABLE);
  const sentenceStart = rng.pick(['I can see two', 'Look at the three', 'There are four']);
  const accepted = [p.many, `${sentenceStart} ${p.many}`];
  return {
    prompt: `Complète au pluriel : « ${sentenceStart} … » (${p.one}, ${p.fr})`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [p.one, NOT_PLURAL],
        [p.wrong[0], IRREGULAR],
        [p.wrong[1], IRREGULAR],
      ],
      accepted,
    ),
    hint: 'N’ajoute pas simplement -s : ce nom change de forme.',
    steps: pluralSteps(p),
  };
}

function pluralBack(rng: Rng): QuestionDraft {
  const p = rng.pick(PLURALS);
  return {
    prompt: `Écris le singulier : « two ${p.many} → one … »`,
    answer: { kind: 'text', accepted: ended([p.one, `one ${p.one}`]) },
    traps: wrongs(
      [
        [p.many, 'C’est encore le pluriel : il n’y en a plus qu’un.'],
        ...(p.one === 'knife' ? [['knive', 'Au singulier, ce mot s’écrit avec un f.'] as const] : []),
      ],
      [p.one],
    ),
    hint: 'Retrouve la forme que l’on emploie après « one ».',
    steps: [IRREGULAR, `${p.many} → ${p.one}`, `Réponse : **${p.one}**`],
  };
}

function pluralDocument(rng: Rng): QuestionDraft {
  const [a, b] = some(rng, WRITABLE, 2) as [Plural, Plural];
  const box: Plural = { one: 'box', many: 'boxes', fr: 'boîte', wrong: ['boxs', 'boxen'] };
  const list = rng.shuffle([a, b, box]);
  const [x, y, z] = list as [Plural, Plural, Plural];
  return {
    prompt: 'Sur l’image B, il y a deux fois chaque élément de l’image A. Complète la description de l’image B.',
    figure: {
      kind: 'document',
      title: 'Picture A',
      lines: list.map((p) => `There is one ${p.one}.`),
      credit: ABOUT,
    },
    answer: {
      kind: 'cloze',
      parts: ['In picture B, there ', ' two ', ', two ', ' and two ', '.'],
      blanks: [
        { mode: 'list', options: ['is', 'are'], correct: 1 },
        ...[x, y, z].map((p) => ({ mode: 'text' as const, accepted: [p.many] })),
      ],
    },
    hint: 'Il y en a deux de chaque : le verbe change, et les noms aussi. L’un d’eux suit la règle du -es.',
    steps: [
      'Plusieurs choses : « there are ».',
      ...list.map((p) => `${p.one} → ${p.many}${p.one === 'box' ? ' (régulier : -es après x)' : ' (irrégulier)'}`),
      `Réponse : **are, ${list.map((p) => p.many).join(', ')}**`,
    ],
  };
}

const plurals: Skill = {
  id: 'a6-pluriels-irreguliers',
  title: 'Les pluriels irréguliers',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **pluriel** **irrégulier** ne se forme pas en ajoutant simplement -s : man → men, woman → women, child → children.',
      'À connaître aussi : foot → feet, tooth → teeth, mouse → mice, knife → knives, person → people.',
      'Apprends chaque mot avec ses deux formes. Après two ou three, emploie le pluriel : two children.',
    ],
    source: source(
      'Appliquer les règles d’accord élémentaires : foot/feet, child/children, woman/women (A1+ : person/people, knife/knives, mouse/mice)',
      '« Count nouns »',
    ),
    sources: ['anglais-college-2025', 'bc-count-nouns'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return pluralChoice(rng, rng.pick(COMMON), 3);
    if (level === 2) return coin(rng) ? pluralChoice(rng, rng.pick(PLURALS), 4) : pluralMatch(rng, 3);
    if (level === 3) return pluralWrite(rng);
    if (level === 4) return coin(rng) ? pluralBack(rng) : pluralMatch(rng, 5);
    return pluralDocument(rng);
  },
};

// ——— 4. La place de l'adjectif ———
const BEFORE = 'L’adjectif épithète se place toujours avant (à gauche de) le nom.';
const NO_S = 'Un adjectif anglais ne prend jamais de s.';
const SIZE_FIRST = 'La taille se place avant la couleur.';
const NUMBERS = [
  ['deux', 'two'],
  ['trois', 'three'],
  ['quatre', 'four'],
] as const;

interface Group {
  readonly thing: Described;
  readonly size: Adjective;
  readonly colour: Adjective;
}
const drawGroup = (rng: Rng, thing = rng.pick(THINGS)): Group => ({
  thing,
  size: rng.pick(SIZES),
  colour: rng.pick(COLOURS),
});
const forms = (a: Adjective) => [a.en, ...(a.alt ? [a.alt] : [])];
/** Taille puis couleur, avec ou sans virgule, orthographes et synonymes admis. */
const adjectives = (g: Group) =>
  forms(g.size).flatMap((s) => forms(g.colour).flatMap((c) => [`${s} ${c}`, `${s}, ${c}`]));
const frForm = (a: Adjective, t: Described, many: boolean) => a.fr[(many ? 2 : 0) + (t.feminine ? 1 : 0)] ?? a.fr[0];
const oneFr = (t: Described) => `${t.feminine ? 'une' : 'un'} ${t.fr}`;

function adjectiveChoice(rng: Rng): QuestionDraft {
  const { thing, colour } = drawGroup(rng);
  const good = `a ${colour.en} ${thing.one}`;
  const { answer, traps } = choice(rng, good, [
    { label: `a ${thing.one} ${colour.en}`, why: BEFORE },
    { label: `${colour.en} a ${thing.one}`, why: '« a » ouvre le groupe nominal : il précède l’adjectif.' },
  ]);
  return {
    prompt: `Comment dit-on « ${oneFr(thing)} ${frForm(colour, thing, false)} » en anglais ?`,
    answer,
    traps,
    hint: 'L’ordre des mots n’est pas le même qu’en français : où va le mot qui décrit ?',
    steps: [BEFORE, `Réponse : **${good}**`],
  };
}

function adjectiveRecognise(rng: Rng): QuestionDraft {
  const { thing, colour } = drawGroup(rng);
  const [n, number] = rng.pick(NUMBERS);
  const good = `${number} ${colour.en} ${thing.many}`;
  const { answer, traps } = choice(rng, good, [
    { label: `${number} ${thing.many} ${colour.en}`, why: BEFORE },
    { label: `${number} ${colour.en}s ${thing.many}`, why: NO_S },
    { label: `${colour.en} ${number} ${thing.many}`, why: 'Le nombre se place avant l’adjectif.' },
  ]);
  return {
    prompt: `Quel groupe nominal veut dire « ${n} ${thing.frMany} ${frForm(colour, thing, true)} » ?`,
    answer,
    traps,
    hint: 'Vérifie l’ordre des trois mots, puis regarde lequel prend la marque du pluriel.',
    steps: [`${BEFORE} ${NO_S}`, `Réponse : **${good}**`],
  };
}

function adjectiveOrder(rng: Rng): QuestionDraft {
  const { thing, size, colour } = drawGroup(rng);
  const adjective = rng.pick([size, colour]);
  const start = rng.pick(['I have got', 'She has got', 'Look at']);
  const words = [start, 'a', adjective.en, thing.one];
  const items = shuffledOther(rng, words);
  return {
    prompt: `Remets dans l’ordre pour obtenir une phrase correcte : ${items.join(' / ')}.`,
    answer: { kind: 'order', items, correct: words.map((w) => items.indexOf(w)) },
    hint: 'Commence par le début de la phrase. Dans le groupe nominal, quel mot vient en dernier ?',
    steps: [`Groupe nominal : « a », puis l’adjectif, puis le nom. ${BEFORE}`, `Réponse : **${words.join(' ')}**`],
  };
}

function adjectiveWrite(rng: Rng): QuestionDraft {
  const g = drawGroup(rng);
  const [n, number] = rng.pick(NUMBERS);
  const accepted = adjectives(g).map((a) => `${number} ${a} ${g.thing.many}`);
  const good = `${number} ${g.size.en} ${g.colour.en} ${g.thing.many}`;
  // En français : taille avant le nom, couleur après.
  const fr = `${n} ${frForm(g.size, g.thing, true)} ${g.thing.frMany} ${frForm(g.colour, g.thing, true)}`;
  const given = rng.shuffle([g.thing.many, g.colour.en, number, g.size.en]);
  return {
    prompt: `Écris en anglais « ${fr} » avec ces quatre mots : ${given.join(' / ')}.`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(
      [
        [`${number} ${g.thing.many} ${g.size.en} ${g.colour.en}`, BEFORE],
        [`${number} ${g.size.en} ${g.thing.many} ${g.colour.en}`, BEFORE],
        [`${number} ${g.colour.en} ${g.size.en} ${g.thing.many}`, SIZE_FIRST],
        [`${number} ${g.size.en}s ${g.colour.en} ${g.thing.many}`, NO_S],
        [`${number} ${g.size.en} ${g.colour.en}s ${g.thing.many}`, NO_S],
      ],
      accepted,
    ),
    hint: 'Le nom vient en dernier. Entre les deux adjectifs, lequel passe en premier : taille ou couleur ?',
    steps: [BEFORE, SIZE_FIRST, `Réponse : **${good}**`],
  };
}

function adjectiveDocument(rng: Rng): QuestionDraft {
  const kid = rng.pick(KIDS);
  const groups = some(rng, THINGS, 3).map((t) => drawGroup(rng, t));
  const lines = groups.map((g) => `${kid} has got a ${g.thing.one}. It is ${g.size.en}. It is ${g.colour.en}.`);
  const parts = [
    'Look! There is a ',
    ` ${at(groups, 0).thing.one}, a `,
    ` ${at(groups, 1).thing.one} and a `,
    ` ${at(groups, 2).thing.one}.`,
  ];
  return {
    prompt: `Lis la fiche, puis décris la photo ${de(kid)} : écris les deux adjectifs dans chaque trou.`,
    figure: { kind: 'document', title: `${kid}’s things`, lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts,
      blanks: groups.map((g) => ({ mode: 'text' as const, accepted: adjectives(g) })),
    },
    hint: 'Pour chaque nom, retrouve sa ligne. Les deux adjectifs passent devant le nom : dans quel ordre ?',
    steps: [
      `${BEFORE} ${SIZE_FIRST}`,
      `Réponse : **${groups.map((g) => `a ${g.size.en} ${g.colour.en} ${g.thing.one}`).join(', ')}**`,
    ],
  };
}

const adjectivePlace: Skill = {
  id: 'a6-adjectif-place',
  title: 'La place de l’adjectif',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'L’**adjectif** **épithète** se place toujours avant le nom : a black cat (un chat noir).',
      'Il est **invariable** : two black cats. La taille passe avant la couleur : a big black dog.',
      'Après le verbe be, il suit le verbe : The dog is black.',
    ],
    source: source(
      'Repérer la place de l’adjectif épithète toujours à gauche du nom dans un GN',
      '« Adjectives », « Noun phrases »',
    ),
    sources: ['anglais-college-2025', 'bck-adjectives', 'bc-noun-phrases'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return adjectiveChoice(rng);
    if (level === 2) return adjectiveRecognise(rng);
    if (level === 3) return adjectiveOrder(rng);
    if (level === 4) return adjectiveWrite(rng);
    return adjectiveDocument(rng);
  },
};

// ——— 5. Le génitif ’s ———
const MARK: Readonly<Record<Owner['kind'], string>> = {
  one: 'Un seul possesseur : on ajoute ’s.',
  s: 'Prénom terminé par s : on ajoute ’ seule ou ’s.',
  plural: 'Plusieurs possesseurs, pluriel en -s : l’apostrophe se place après le s.',
  irregular: 'Pluriel irrégulier sans s final : on ajoute ’s.',
};
const ORDER = 'Au génitif, le possesseur vient en premier, puis la chose possédée, sans « the » devant la chose.';
const marked = (o: Owner) => {
  if (o.kind === 'plural') return [`${o.en}’`];
  if (o.kind === 's') return [`${o.en}’s`, `${o.en}’`];
  return [`${o.en}’s`];
};
const owned = (o: Owner) => marked(o)[0] ?? o.en;
const SINGLE = OWNERS.filter((o) => o.kind === 'one');
const HARD = OWNERS.filter((o) => o.kind !== 'one');
const frOwned = (o: Owner, fr: string) => `${fr} ${o.fr}`;

/** Écritures fausses selon le type de possesseur. */
function genitiveWrong(o: Owner, thing: string): (readonly [string, string])[] {
  const list: (readonly [string, string])[] = [
    [`${o.en} ${thing}`, `Il manque la marque du génitif. ${MARK[o.kind]}`],
    [`${thing}’s ${o.en}`, ORDER],
  ];
  if (o.kind === 's')
    list.push([`${o.en.slice(0, -1)}’s ${thing}`, 'Le prénom reste entier : l’apostrophe se place après son s final.']);
  if (o.kind === 'one') list.push([`${o.en}s ${thing}`, 'Sans apostrophe, le s marquerait un pluriel.']);
  if (o.kind === 'plural') {
    const singular = o.en.slice(0, -1);
    list.push(
      [`${singular}’s ${thing}`, 'Cette écriture désigne un seul possesseur. Ici, ils sont plusieurs.'],
      [`${o.en}’s ${thing}`, MARK.plural],
    );
  }
  if (o.kind === 'irregular') {
    list.push(
      [`${o.en}’ ${thing}`, MARK.irregular],
      [`${o.en}s’ ${thing}`, 'Le pluriel est déjà formé : pas de s en plus avant l’apostrophe.'],
    );
  }
  return list;
}

function genitiveChoice(rng: Rng): QuestionDraft {
  const o = rng.pick(SINGLE.slice(0, 4));
  const [thing, fr] = rng.pick(OWNED);
  const good = `${o.en}’s ${thing}`;
  const { answer, traps } = choice(rng, good, [
    { label: `${thing}’s ${o.en}`, why: ORDER },
    { label: `${o.en} ${thing}`, why: `Il manque la marque du génitif. ${MARK.one}` },
  ]);
  return {
    prompt: `Comment dit-on « ${frOwned(o, fr)} » avec le génitif ?`,
    answer,
    traps,
    hint: 'En anglais, qui possède ? Ce mot-là vient en premier, avec une petite marque.',
    steps: [`${ORDER} ${MARK.one}`, `Réponse : **${good}**`],
  };
}

function genitiveRecognise(rng: Rng): QuestionDraft {
  const o = rng.pick(SINGLE);
  const [thing, fr] = rng.pick(OWNED);
  const good = `${o.en}’s ${thing}`;
  const { answer, traps } = choice(
    rng,
    good,
    genitiveWrong(o, thing).map(([l, why]) => ({ label: l, why })),
  );
  return {
    prompt: `Quel groupe nominal veut dire « ${frOwned(o, fr)} » ?`,
    answer,
    traps,
    hint: 'Vérifie l’ordre des deux noms, puis la place de l’apostrophe.',
    steps: [`${ORDER} ${MARK.one}`, `Réponse : **${good}**`],
  };
}

function genitiveWrite(rng: Rng, pool: readonly Owner[], hint: string): QuestionDraft {
  const o = rng.pick(pool);
  const [thing, fr] = rng.pick(OWNED);
  const accepted = marked(o).map((m) => `${m} ${thing}`);
  return {
    prompt: `Écris en anglais avec le génitif : « ${frOwned(o, fr)} » (${o.en} / ${thing})`,
    answer: { kind: 'text', accepted: ended(accepted) },
    traps: wrongs(genitiveWrong(o, thing), accepted),
    hint,
    steps: [ORDER, MARK[o.kind], `Réponse : **${owned(o)} ${thing}**`],
  };
}

function genitiveDocument(rng: Rng): QuestionDraft {
  const owners = rng.shuffle([rng.pick(SINGLE), ...some(rng, HARD, 2)]);
  const things = some(rng, OWNED, 3);
  const rows = owners.map((o, i) => ({ o, thing: at(things, i)[0] }));
  const many = (o: Owner) => o.kind === 'plural' || o.kind === 'irregular';
  const lines = rows.map(({ o, thing }) => `${cap(o.en)} ${many(o) ? 'have' : 'has'} got a ${thing}.`);
  const parts = rows.reduce<string[]>(
    (all, r, i) => [...all.slice(0, -1), `${all.at(-1) ?? ''}${i === 0 ? '' : ' '}This is `, ` ${r.thing}.`],
    [''],
  );
  return {
    prompt: 'Lis les informations, puis écris dans chaque trou le possesseur avec la marque du génitif.',
    figure: { kind: 'document', title: 'Who has got what?', lines, credit: ABOUT },
    answer: {
      kind: 'cloze',
      parts,
      blanks: rows.map(({ o }) => ({ mode: 'text' as const, accepted: marked(o) })),
    },
    hint: 'Pour chaque chose, cherche son propriétaire. Est-il seul ? Son pluriel finit-il par un s ?',
    steps: [
      ...rows.map(({ o }) => `${o.en} : ${MARK[o.kind]}`),
      `Réponse : **${rows.map(({ o, thing }) => `${owned(o)} ${thing}`).join(', ')}**`,
    ],
  };
}

const genitive: Skill = {
  id: 'a6-genitif',
  title: 'Le génitif ’s',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **génitif** dit à qui est une chose : le **possesseur**, puis **’s**, puis la chose : Greg’s bike (le vélo de Greg).',
      'Pluriel en -s : apostrophe seule après le s (my parents’ house). Pluriel irrégulier : ’s (the children’s room).',
      'Prénom terminé par s : les deux sont admis, James’ bag ou James’s bag.',
    ],
    source: source('Utiliser le génitif', '« Possessive ’s »'),
    sources: ['anglais-college-2025', 'bc-possessive-s'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return genitiveChoice(rng);
    if (level === 2) return genitiveRecognise(rng);
    if (level === 3)
      return genitiveWrite(rng, SINGLE, 'Écris le possesseur d’abord. Quel signe et quelle lettre lui ajoutes-tu ?');
    if (level === 4)
      return genitiveWrite(rng, HARD, 'Regarde la fin du possesseur : un s ? Est-il un pluriel régulier ou non ?');
    return genitiveDocument(rng);
  },
};

export const ENGLISH_NOUN_PHRASE_6E_CHAPTER: Chapter = {
  id: 'a6-groupe-nominal',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Le groupe nominal',
  skills: [articles, demonstratives, plurals, adjectivePlace, genitive],
};
