import type { Chapter, QuestionDraft, Skill } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import {
  BODY_PARTS,
  BUGS,
  COUNTABLE,
  DRINKS,
  FOOD,
  FRUIT,
  OTHER_ANIMALS,
  SCHOOL_RIDDLES,
  SCHOOL_SUBJECTS,
  SCHOOL_THINGS,
  UNCOUNTABLE,
  VEGETABLES,
  type Counted,
} from './ecole-faits.ts';
import { DAYS, type Word } from './temps-faits.ts';
import { at, de, others, pairs, pickEnglish, shuffledOther, some, understand, write } from './temps.ts';

/**
 * Anglais CM2 — « École, nourriture, animaux » (lot an-cm2-04, docs/adr/0034). Programme : cycle 3, langues
 * vivantes (école, besoins quotidiens, environnement ; quantifieurs ; accepter ou refuser une proposition). Le
 * programme de 2026 ne s'applique au CM2 qu'à la rentrée 2027. Règles et mots : British Council (voir
 * ecole-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020, version 2023), langues vivantes';
const source = (detail: string) => `${PROGRAMME} — ${detail}`;

/** Réponses avec ou sans point final. */
const full = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
const KIDS = ['Emir', 'Ana', 'Yuna', 'Paul'];
const WRITTEN = 'Écrit pour l’exercice.';
const startsWithVowel = (s: string) => /^[aeiou]/i.test(s);
const aOrAn = (s: string) => (startsWithVowel(s) ? 'an' : 'a');
const bare = (list: readonly Word[]) => list.filter((x) => !x.en.includes('.'));

/** Noms qu'on peut ne pas compter : « some » est accepté devant. */
const MASS = ['bread', 'cheese', 'rice', 'fish', 'meat', 'chicken', 'cake', 'pasta', 'ice cream', 'jam', 'yoghurt'];
const LIQUIDS = ['water', 'milk', 'orange juice', 'tea', 'hot chocolate', 'lemonade', 'glue'];
/** Mots qu'on peut aussi compter un par un : « a cake », « a tea ». */
const ALSO_ONE = ['fish', 'chicken', 'cake', 'ice cream', 'yoghurt', 'tea', 'glue'];

/** Petits mots acceptés devant un nom écrit seul : jamais « a » devant un pluriel. */
function determiners(name: string): string[] {
  const one = startsWithVowel(name) ? 'an' : 'a';
  if (name.endsWith('s') || name === 'yoghurt') return name === 'yoghurt' ? ['the', 'some', one] : ['the', 'some'];
  if (MASS.includes(name) || LIQUIDS.includes(name)) return ['the', 'some', ...(ALSO_ONE.includes(name) ? [one] : [])];
  return ['the', one];
}

/** Écritures acceptées d'un nom : seul ou précédé d'un petit mot correct. */
const withDeterminer = (list: readonly Word[]): Word[] =>
  list.map((w) => {
    const names = [w.en, ...(w.alt ?? [])];
    return { ...w, alt: [...(w.alt ?? []), ...names.flatMap((n) => determiners(n).map((d) => `${d} ${n}`))] };
  });
const spellings = (w: Word): string[] => [w.en, ...(withDeterminer([w])[0]?.alt ?? [])];

/** Écrire un mot, avec un indice qui compte les mots (et non les lettres). */
function writeName(rng: Rng, list: readonly Word[], kind: string): QuestionDraft {
  const q = write(rng, list, kind);
  const good = q.answer.kind === 'text' ? (q.answer.accepted[0] ?? '') : '';
  const count = good.split(' ').length;
  return {
    ...q,
    hint: `La réponse commence par « ${good.slice(0, 1)} » et s’écrit en ${count} mot${count > 1 ? 's' : ''}.`,
  };
}

// ——— 1. L'école ———
function schoolRiddle(rng: Rng): QuestionDraft {
  const r = rng.pick(SCHOOL_RIDDLES);
  const good = SCHOOL_THINGS.find((w) => w.en === r.en) ?? at(SCHOOL_THINGS, 0);
  const [x, y] = others(rng, SCHOOL_RIDDLES, r, 2).map((o) => SCHOOL_THINGS.find((w) => w.en === o.en)) as [Word, Word];
  return {
    prompt: `Devine l’objet de classe et écris son nom en anglais. « ${r.clue} »`,
    answer: { kind: 'text', accepted: spellings(good) },
    traps: [
      { text: good.typo, why: `Tu as la bonne idée ! Le mot s’écrit « ${good.en} ».` },
      { text: x.en, why: `« ${x.en} » veut dire « ${x.fr} ».` },
      { text: y.en, why: `« ${y.en} » veut dire « ${y.fr} ».` },
    ],
    hint: 'Trouve d’abord l’objet en français. Puis cherche son nom anglais.',
    steps: [`On devine : « ${good.fr} ».`, `Réponse : **${good.en}**`],
  };
}

function timetable(rng: Rng): QuestionDraft {
  const [a, b, c, d] = some(rng, SCHOOL_SUBJECTS, 4) as [Word, Word, Word, Word];
  const days = some(rng, DAYS.slice(0, 5), 4);
  const [target, onlyA, onlyB, neither] = days as [Word, Word, Word, Word];
  const content: ReadonlyMap<Word, readonly Word[]> = new Map([
    [target, [a, b]],
    [onlyA, [a, c]],
    [onlyB, [d, b]],
    [neither, [c, d]],
  ]);
  const lines = DAYS.filter((day) => content.has(day)).map(
    (day) =>
      `${day.en}: ${rng
        .shuffle(content.get(day) ?? [])
        .map((s) => s.en)
        .join(', ')}`,
  );
  const kid = rng.pick(KIDS);
  return {
    prompt: `Lis l’emploi du temps ${de(kid)}. Quel jour y a-t-il ces deux matières : « ${a.fr} » et « ${b.fr} » ? Écris le jour en anglais.`,
    figure: { kind: 'document', title: 'My timetable', lines, credit: WRITTEN },
    answer: { kind: 'text', accepted: full([target.en]) },
    traps: [
      { text: onlyA.en, why: `Ce jour-là, il y a « ${a.en} » mais pas « ${b.en} ». Il faut les deux.` },
      { text: onlyB.en, why: `Ce jour-là, il y a « ${b.en} » mais pas « ${a.en} ». Il faut les deux.` },
      { text: neither.en, why: 'Ce jour-là, il n’y a aucune des deux matières.' },
    ],
    hint: 'Traduis d’abord les deux matières en anglais. Puis cherche la ligne qui a les deux.',
    steps: [
      `« ${a.fr} » se dit « ${a.en} » et « ${b.fr} » se dit « ${b.en} ».`,
      'Une seule ligne contient les deux matières.',
      `Réponse : **${target.en}**`,
    ],
  };
}

const school: Skill = {
  id: 'acm2-ecole',
  title: 'L’école',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Dans ton cartable : pen (stylo), pencil (crayon à papier), ruler (règle), eraser (gomme), glue (colle), scissors (ciseaux).',
      'Aussi : bag (sac), pencil case (trousse), pencil sharpener (taille-crayon), notebook (cahier), folder (classeur), desk (bureau).',
      'Les **matières** : English, maths, science, history, geography, music, art, P.E. (sport à l’école).',
    ],
    source: source('l’école. Mots : British Council, fiches « Classroom objects » et « School subjects ».'),
    sources: ['cycle3-2020', 'bck-flashcards-classroom-objects', 'bck-flashcards-school-subjects'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        SCHOOL_THINGS.slice(0, 7),
        'un objet de classe',
        'Regarde tes affaires. Quel nom anglais as-tu entendu en classe ?',
      );
    if (level === 2)
      return rng.int(0, 1) === 0
        ? understand(rng, SCHOOL_THINGS, 'un objet de classe')
        : understand(rng, SCHOOL_SUBJECTS, 'une matière');
    if (level === 3)
      return rng.int(0, 2) === 0
        ? writeName(rng, bare(SCHOOL_SUBJECTS), 'une matière')
        : writeName(rng, withDeterminer(SCHOOL_THINGS.slice(0, 11)), 'un objet de classe');
    if (level === 4)
      return rng.int(0, 2) === 0 ? pairs(rng, rng.pick([SCHOOL_THINGS, SCHOOL_SUBJECTS]), 5) : schoolRiddle(rng);
    return timetable(rng);
  },
};

// ——— 2. La nourriture ———
const EDIBLE = [...FOOD, ...FRUIT, ...VEGETABLES, ...DRINKS];
const FOOD_LISTS: readonly (readonly [readonly Word[], string])[] = [
  [FOOD, 'un aliment'],
  [FRUIT, 'un fruit'],
  [VEGETABLES, 'un légume'],
  [DRINKS, 'une boisson'],
];
const COMMON_FOOD = EDIBLE.filter((w) =>
  ['bread', 'cheese', 'rice', 'cake', 'apple', 'banana', 'milk', 'water'].includes(w.en),
);

function heardFood(rng: Rng): QuestionDraft {
  const w = rng.pick(EDIBLE);
  const { answer, traps } = choice(
    rng,
    w.fr,
    others(rng, EDIBLE, w, 3).map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} » en anglais.` })),
  );
  return {
    prompt: 'Écoute. De quel aliment ou de quelle boisson parle-t-on ?',
    audio: { text: `I like ${w.en}.`, lang: 'en-GB' },
    answer,
    traps,
    hint: 'Écoute bien le dernier mot de la phrase.',
    steps: [`On entend « I like ${w.en}. »`, `Réponse : **${w.fr}**`],
  };
}

const LIKED: readonly (readonly [string, string])[] = [
  ['apples', 'les pommes'],
  ['bananas', 'les bananes'],
  ['carrots', 'les carottes'],
  ['grapes', 'le raisin'],
  ['peas', 'les petits pois'],
  ['cheese', 'le fromage'],
  ['rice', 'le riz'],
  ['milk', 'le lait'],
];

function likeFood(rng: Rng): QuestionDraft {
  const [en, fr] = rng.pick(LIKED);
  const good = `I like ${en}`;
  return {
    prompt: `Écris en anglais, avec « like » : « J’aime ${fr}. »`,
    answer: { kind: 'text', accepted: full([good]) },
    traps: [
      { text: `I likes ${en}.`, why: 'Avec « I », « like » ne prend pas de s.' },
      { text: `I like the ${en}.`, why: 'On parle de cet aliment en général : pas de « the » en anglais.' },
      { text: `I’d like ${en}.`, why: '« I’d like » veut dire « je voudrais ». « J’aime » se dit « I like ».' },
    ],
    hint: 'Trois mots : qui, le verbe « aimer », puis l’aliment sans petit mot devant.',
    steps: ['« J’aime » se dit « I like ».', `L’aliment vient juste après : « ${en} ».`, `Réponse : **${good}.**`],
  };
}

function lunchRead(rng: Rng): QuestionDraft {
  const [kid, mate] = some(rng, KIDS, 2) as [string, string];
  const [loved, other] = some(rng, FRUIT.slice(0, 7), 2) as [Word, Word];
  const [mine, theirs] = some(rng, DRINKS.slice(0, 5), 2) as [Word, Word];
  const plural = (w: Word) => w.alt?.[0] ?? w.en;
  const lines = rng.shuffle([
    `${kid}: I like ${plural(loved)} and ${mine.en}. I don’t like ${plural(other)}.`,
    `${mate}: I like ${plural(other)} and ${theirs.en}. I don’t like ${plural(loved)}.`,
  ]);
  const fruit = rng.int(0, 1) === 0;
  const good = fruit ? loved : mine;
  const wrong = fruit ? other : theirs;
  return {
    prompt: `Lis les messages. ${fruit ? 'Quel fruit' : 'Quelle boisson'} ${kid} aime-t-${kid === 'Ana' || kid === 'Yuna' ? 'elle' : 'il'} ? Écris le mot en anglais.`,
    figure: { kind: 'document', title: 'Lunch time', lines, credit: WRITTEN },
    answer: { kind: 'text', accepted: full(spellings(good)) },
    traps: [
      {
        text: wrong.en,
        why: fruit ? `Regarde bien : ${kid} écrit « I don’t like ${plural(wrong)} ».` : `C’est la boisson ${de(mate)}.`,
      },
      {
        text: fruit ? mine.en : loved.en,
        why: `${kid} l’aime, mais ce n’est pas ${fruit ? 'un fruit' : 'une boisson'}.`,
      },
    ],
    hint: `Trouve la ligne ${de(kid)}. Lis ce qui vient après « I like », pas après « I don’t like ».`,
    steps: [
      `${kid} écrit : « I like ${plural(loved)} and ${mine.en}. »`,
      `${fruit ? 'Le fruit' : 'La boisson'}, c’est « ${good.fr} ».`,
      `Réponse : **${good.en}**`,
    ],
  };
}

const food: Skill = {
  id: 'acm2-nourriture',
  title: 'La nourriture',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'À manger : bread (pain), cheese (fromage), rice (riz), meat (viande), fish (poisson), cake (gâteau).',
      'Fruits, légumes et boissons : apple (pomme), strawberry (fraise), carrot, potato (pomme de terre), water (eau), milk (lait).',
      'Un **faux ami** : chips veut dire « frites ». Les chips, ce sont des crisps.',
    ],
    source: source(
      'les besoins quotidiens : la nourriture. Mots : British Council, fiches « Food », « Fruit », « Vegetables » et « Drinks ».',
    ),
    sources: [
      'cycle3-2020',
      'bck-flashcards-food-1',
      'bck-flashcards-food-2',
      'bck-flashcards-fruit',
      'bck-flashcards-vegetables',
      'bck-flashcards-drinks',
      'bck-like',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(rng, COMMON_FOOD, 'à table', 'Pense à ton repas. Quel mot anglais as-tu entendu en classe ?');
    if (level === 2) {
      if (rng.int(0, 2) === 0) return heardFood(rng);
      const [list, kind] = rng.pick(FOOD_LISTS);
      return understand(rng, list, kind);
    }
    if (level === 3) {
      const [list, kind] = rng.pick(FOOD_LISTS);
      return writeName(rng, withDeterminer(list), kind);
    }
    if (level === 4) return rng.int(0, 1) === 0 ? pairs(rng, rng.pick([FOOD, FRUIT, VEGETABLES]), 5) : likeFood(rng);
    return lunchRead(rng);
  },
};

// ——— 3. some / any ———
const SOME_WHY = 'Phrase qui dit « oui », devant un pluriel ou un nom qu’on ne compte pas : « some ».';
const ANY_WHY = 'Phrase avec « not » (n’t) : on prend « any ».';
const A_WHY = '« a » ou « an » vont avec une seule chose qu’on peut compter.';
const article = (c: Counted) =>
  c.article === 'an'
    ? `« ${c.one} » commence par un son de voyelle : « an ».`
    : `« ${c.one} » commence par un son de consonne : « a ».`;

/** Un groupe qui appelle « some » : un pluriel ou un nom indénombrable. */
const drawMany = (rng: Rng) => {
  if (rng.int(0, 1) === 0) return { noun: rng.pick(UNCOUNTABLE).en, be: 'is' };
  return { noun: rng.pick(COUNTABLE).many, be: 'are' };
};

function someLevel1(rng: Rng): QuestionDraft {
  const one = rng.int(0, 2) === 0;
  const item = rng.pick(COUNTABLE);
  const many = drawMany(rng);
  const good = one ? item.article : 'some';
  const sentence = one ? `There is … ${item.one} on the table.` : `There ${many.be} … ${many.noun} on the table.`;
  const wrong = ['a', 'an', 'some']
    .filter((x) => x !== good)
    .map((label) => ({ label, why: one ? (label === 'some' ? SOME_WHY : article(item)) : A_WHY }));
  const { answer, traps } = choice(rng, good, wrong);
  return {
    prompt: `Complète : « ${sentence} »`,
    answer,
    traps,
    hint: 'Y a-t-il une seule chose à compter ? Sinon, plusieurs, ou quelque chose qu’on ne compte pas ?',
    steps: [one ? article(item) : SOME_WHY, `Réponse : **${sentence.replace('…', good)}**`],
  };
}

function someOrAny(rng: Rng): { sentence: string; good: 'some' | 'any' } {
  const no = rng.int(0, 1) === 0;
  const many = drawMany(rng);
  const sentence = rng.pick([
    `There ${no ? (many.be === 'is' ? 'isn’t' : 'aren’t') : many.be} … ${many.noun} in the kitchen.`,
    `I ${no ? 'haven’t got' : 'have got'} … ${many.noun}.`,
  ]);
  return { sentence, good: no ? 'any' : 'some' };
}

function someLevel2(rng: Rng): QuestionDraft {
  const { sentence, good } = someOrAny(rng);
  const why = good === 'any' ? ANY_WHY : SOME_WHY;
  const { answer, traps } = choice(rng, good, [
    { label: good === 'any' ? 'some' : 'any', why },
    { label: 'a', why: A_WHY },
  ]);
  return {
    prompt: `Choisis le bon petit mot : « ${sentence} »`,
    answer,
    traps,
    hint: 'La phrase dit-elle « oui », ou contient-elle « n’t » ?',
    steps: [why, `Réponse : **${sentence.replace('…', good)}**`],
  };
}

function someLevel3(rng: Rng): QuestionDraft {
  const { sentence, good } = someOrAny(rng);
  const why = good === 'any' ? ANY_WHY : SOME_WHY;
  return {
    prompt: `Écris « some » ou « any » : « ${sentence} »`,
    answer: { kind: 'text', accepted: [good] },
    traps: [
      { text: good === 'any' ? 'some' : 'any', why },
      { text: 'a', why: A_WHY },
    ],
    hint: 'Cherche s’il y a « n’t » dans la phrase.',
    steps: [why, `Réponse : **${sentence.replace('…', good)}**`],
  };
}

const SMALL_WORDS = ['a', 'an', 'some', 'any'];
const listBlank = (good: string) => ({
  mode: 'list' as const,
  options: SMALL_WORDS,
  correct: SMALL_WORDS.indexOf(good),
});

function someAsk(rng: Rng): QuestionDraft {
  const noun = rng.pick(['bread', 'rice', ...COUNTABLE.map((c) => c.many)]);
  const sentence = `Can I have … ${noun}, please?`;
  const why = 'Pour demander quelque chose, on prend d’habitude « some », même dans une question.';
  return {
    prompt: `Tu demandes poliment à table. Écris le petit mot qui manque : « ${sentence} »`,
    answer: { kind: 'text', accepted: ['some'] },
    traps: [{ text: 'any', why }],
    hint: 'Ce n’est pas une question pour savoir : tu demandes qu’on te donne quelque chose.',
    steps: [why, `Réponse : **${sentence.replace('…', 'some')}**`],
  };
}

function someThree(rng: Rng): QuestionDraft {
  const [one, many] = some(rng, COUNTABLE, 2) as [Counted, Counted];
  const [liquid, none] = some(rng, UNCOUNTABLE, 2) as [(typeof UNCOUNTABLE)[number], (typeof UNCOUNTABLE)[number]];
  return {
    prompt: `Complète avec a, an, some ou any (${one.one}, ${many.many}, ${liquid.en}, ${none.en}).`,
    answer: {
      kind: 'cloze',
      parts: ['I have got ', ` ${one.one}, `, ` ${many.many} and `, ` ${liquid.en}. I haven’t got `, ` ${none.en}.`],
      blanks: [listBlank(one.article), listBlank('some'), listBlank('some'), listBlank('any')],
    },
    hint: 'Pour chaque trou : une seule chose ? plusieurs ou non comptable ? la phrase avec « n’t » ?',
    steps: [
      article(one),
      `« ${many.many} » (pluriel) et « ${liquid.en} » (on ne le compte pas) : « some ».`,
      ANY_WHY,
      `Réponse : **${one.article}, some, some, any**`,
    ],
  };
}

function fridge(rng: Rng): QuestionDraft {
  const [one, many] = some(rng, COUNTABLE, 2) as [Counted, Counted];
  const [liquid, none] = some(rng, UNCOUNTABLE, 2) as [(typeof UNCOUNTABLE)[number], (typeof UNCOUNTABLE)[number]];
  const n = rng.int(2, 4);
  const lines = rng.shuffle([`${liquid.en}: yes`, `${many.many}: ${n}`, `${none.en}: no`, `${one.one}: 1`]);
  const kid = rng.pick(KIDS);
  return {
    prompt: `Lis la liste de la cuisine ${de(kid)} (yes = il y en a, no = il n’y en a pas). Complète avec a, an, some ou any.`,
    figure: { kind: 'document', title: 'In the kitchen', lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: [
        'There is ',
        ` ${liquid.en}. There are `,
        ` ${many.many}. There isn’t `,
        ` ${none.en}. There is `,
        ` ${one.one}.`,
      ],
      blanks: [listBlank('some'), listBlank('some'), listBlank('any'), listBlank(one.article)],
    },
    hint: 'Lis la ligne de chaque mot : oui, plusieurs, non ou une seule ?',
    steps: [
      `« ${liquid.en}: yes » : on ne le compte pas et il y en a : « some ».`,
      `« ${many.many}: ${n} » : un pluriel, dans une phrase qui dit oui : « some ».`,
      `« ${none.en}: no » : la phrase a « isn’t » : « any ».`,
      article(one),
      `Réponse : **some, some, any, ${one.article}**`,
    ],
  };
}

const someSkill: Skill = {
  id: 'acm2-some',
  title: 'some (et any)',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**some** veut dire « du, de la, des » : there is some milk, there are some pears. Dans une phrase avec n’t, on dit any.',
      'Un **nom indénombrable** ne se compte pas (milk, water, bread, rice) : pas de a devant. Une seule chose comptable : a pear, an apple.',
      'Pour demander ou proposer, on garde souvent some : Can I have some bread, please?',
    ],
    source: source(
      'la grammaire : les quantifieurs. Règles : British Council, « Nouns - countable and uncountable » et « Nouns: countable and uncountable ».',
    ),
    sources: ['cycle3-2020', 'bck-countable-uncountable', 'bc-nouns-countable'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return someLevel1(rng);
    if (level === 2) return someLevel2(rng);
    if (level === 3) return someLevel3(rng);
    if (level === 4) return rng.int(0, 1) === 0 ? someAsk(rng) : someThree(rng);
    return fridge(rng);
  },
};

// ——— 4. Les animaux ———
const CREATURES = [...BUGS, ...OTHER_ANIMALS];
const COMMON_CREATURES = CREATURES.filter((w) =>
  ['bee', 'spider', 'butterfly', 'duck', 'frog', 'owl', 'snail'].includes(w.en),
);
const GARDEN = CREATURES.filter((w) =>
  ['bee', 'ant', 'spider', 'butterfly', 'ladybird', 'caterpillar', 'duck', 'frog', 'owl', 'snail', 'squirrel'].includes(
    w.en,
  ),
);

function bodySentence(rng: Rng): QuestionDraft {
  const p = rng.pick(BODY_PARTS);
  const good = `It’s got ${p.got}`;
  const singular = p.got.startsWith('a ');
  return {
    prompt: `Tu décris un animal. Écris en anglais, en commençant par « It » et avec « got » : « Il a ${p.has}. »`,
    answer: {
      kind: 'text',
      accepted: full(
        [p.got, ...(singular ? [] : [`some ${p.got}`])].flatMap((g) => [`It’s got ${g}`, `It has got ${g}`]),
      ),
    },
    traps: [
      { text: `It got ${p.got}.`, why: 'Il manque « ’s » : on écrit « It’s got ».' },
      { text: `I’ve got ${p.got}.`, why: '« I’ve got » veut dire « j’ai ». Pour un animal : « It’s got ».' },
      singular
        ? { text: `It’s got ${p.en}.`, why: 'Il manque « a » : il y en a un seul.' }
        : { text: `It’s got a ${p.en}.`, why: 'Pas de « a » ici : le mot est au pluriel ou ne se compte pas.' },
    ],
    hint: 'Commence par « It », puis « a » en deux mots courts. Un seul ou plusieurs : faut-il un petit mot devant ?',
    steps: ['« Il a » se dit « It’s got ».', `La partie du corps : « ${p.en} ».`, `Réponse : **${good}.**`],
  };
}

function gardenRead(rng: Rng): QuestionDraft {
  const [a, b, c, d] = some(rng, GARDEN, 4) as [Word, Word, Word, Word];
  const one = (w: Word) => `${aOrAn(w.en)} ${w.en}`;
  const lines = rng.shuffle([
    `There is ${one(a)} under the tree.`,
    `There is ${one(b)} next to the ${a.en}.`,
    `There is ${one(c)} behind the house.`,
    `There is ${one(d)} next to the ${c.en}.`,
  ]);
  const tree = rng.int(0, 1) === 0;
  const [near, target] = tree ? [a, b] : [c, d];
  const [farNear, farTarget] = tree ? [c, d] : [a, b];
  const place = tree ? 'sous l’arbre' : 'derrière la maison';
  return {
    prompt: `Lis ce texte sur le jardin. Un animal est ${place}. Quel animal est à côté de lui ? Écris-le en anglais.`,
    figure: { kind: 'document', title: 'In the garden', lines, credit: WRITTEN },
    answer: { kind: 'text', accepted: full(spellings(target)) },
    traps: [
      { text: near.en, why: `C’est l’animal ${place}. Il reste une étape : cherche son voisin.` },
      { text: farTarget.en, why: `« ${farTarget.en} » est à côté d’un autre animal. Relis la première étape.` },
      { text: farNear.en, why: `« ${farNear.en} » n’est pas à côté de « ${near.en} ».` },
    ],
    hint: `Deux étapes. Cherche d’abord la phrase avec « ${tree ? 'under' : 'behind'} ». Puis la phrase « next to » qui parle de cet animal.`,
    steps: [
      `« There is ${one(near)} ${tree ? 'under the tree' : 'behind the house'}. »`,
      `« There is ${one(target)} next to the ${near.en}. » : « next to » veut dire « à côté de ».`,
      `Réponse : **${target.en}**`,
    ],
  };
}

const animals: Skill = {
  id: 'acm2-animaux',
  title: 'Les animaux',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Petites bêtes : bee (abeille), ant (fourmi), spider (araignée), butterfly (papillon). Aussi : duck (canard), frog (grenouille), owl (hibou).',
      'Le corps : tail (queue), wings (ailes), beak (bec), fur (fourrure), feathers (plumes), claws (griffes), shell (carapace).',
      'Pour décrire un animal, utilise **have got** : It’s got wings = il a des ailes.',
    ],
    source: source(
      'l’environnement : les animaux. Mots : British Council, fiches « Bugs », « Birds », « Wild animals » (série 2) et « Animal body parts ».',
    ),
    sources: [
      'cycle3-2020',
      'bck-flashcards-bugs',
      'bck-flashcards-birds',
      'bck-flashcards-wild-2',
      'bck-flashcards-animal-body',
      'bck-have-got',
    ],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1)
      return pickEnglish(
        rng,
        COMMON_CREATURES,
        'une petite bête ou un animal',
        'Imagine cet animal. Quel mot anglais as-tu entendu en classe ou en chanson ?',
      );
    if (level === 2) {
      const [list, kind] = rng.pick([
        [BUGS, 'une petite bête'],
        [OTHER_ANIMALS, 'un animal'],
        [BODY_PARTS, 'le corps d’un animal'],
      ] as const);
      return understand(rng, list, kind);
    }
    if (level === 3) return writeName(rng, withDeterminer(CREATURES), 'un animal');
    if (level === 4) return rng.int(0, 1) === 0 ? pairs(rng, BODY_PARTS, 5) : bodySentence(rng);
    return gardenRead(rng);
  },
};

// ——— 5. I'd like ———
interface Dish {
  readonly en: string;
  /** « du riz » */
  readonly fr: string;
  /** « le riz » */
  readonly the: string;
}
const DISHES: readonly Dish[] = [
  { en: 'rice', fr: 'du riz', the: 'le riz' },
  { en: 'bread', fr: 'du pain', the: 'le pain' },
  { en: 'cake', fr: 'du gâteau', the: 'le gâteau' },
  { en: 'pasta', fr: 'des pâtes', the: 'les pâtes' },
  { en: 'water', fr: 'de l’eau', the: 'l’eau' },
  { en: 'milk', fr: 'du lait', the: 'le lait' },
  { en: 'cheese', fr: 'du fromage', the: 'le fromage' },
];

const WANT_WHY = '« I’d like » veut dire « je voudrais » : on demande poliment.';
const LIKE_WHY = '« I like » veut dire « j’aime ». Pour demander, on dit « I’d like ».';
const OFFER_WHY = '« Would you like…? » propose quelque chose à quelqu’un.';

function likeLevel1(rng: Rng): QuestionDraft {
  const d = rng.pick(DISHES);
  const good = `I’d like some ${d.en}.`;
  const { answer, traps } = choice(rng, good, [
    { label: `I like ${d.en}.`, why: LIKE_WHY },
    { label: `I’ve got some ${d.en}.`, why: '« I’ve got » veut dire « j’ai ».' },
  ]);
  return {
    prompt: `Quelle phrase dit « Je voudrais ${d.fr} » ?`,
    answer,
    traps,
    hint: 'Tu ne dis pas ce que tu aimes ni ce que tu as. Tu demandes.',
    steps: [WANT_WHY, `Réponse : **${good}**`],
  };
}

function likeLevel2(rng: Rng): QuestionDraft {
  const d = rng.pick(DISHES);
  const forms = [
    { en: `I’d like some ${d.en}.`, fr: `Je voudrais ${d.fr}.`, why: WANT_WHY },
    { en: `I like ${d.en}.`, fr: `J’aime ${d.the}.`, why: '« I like » veut dire « j’aime ».' },
    { en: `Would you like some ${d.en}?`, fr: `Veux-tu ${d.fr} ?`, why: OFFER_WHY },
    { en: `I’ve got some ${d.en}.`, fr: `J’ai ${d.fr}.`, why: '« I’ve got » veut dire « j’ai ».' },
  ];
  const good = rng.pick(forms.slice(0, 3));
  const { answer, traps } = choice(
    rng,
    good.fr,
    forms.filter((f) => f !== good).map((f) => ({ label: f.fr, why: `Cette phrase se dit « ${f.en} ».` })),
  );
  return {
    prompt: `Que veut dire « ${good.en} » ?`,
    answer,
    traps,
    hint: 'Repère les premiers mots : qui parle, et de qui ?',
    steps: [good.why, `Réponse : **${good.fr}**`],
  };
}

function likeLevel3(rng: Rng): QuestionDraft {
  const d = rng.pick(DISHES);
  if (rng.int(0, 1) === 0) {
    const good = 'I’d like';
    return {
      prompt: `Écris « Je voudrais » en anglais : « … some ${d.en}, please. »`,
      answer: { kind: 'text', accepted: [good, 'I would like'] },
      traps: [
        { text: 'I like', why: LIKE_WHY },
        { text: 'I’d likes', why: 'Après « I’d », le verbe ne prend pas de s.' },
        { text: 'Would you like', why: OFFER_WHY },
      ],
      hint: 'La forme courte de « I would », puis le verbe « like ».',
      steps: [WANT_WHY, `Réponse : **I’d like some ${d.en}, please.**`],
    };
  }
  return {
    prompt: `Propose ${d.fr} à un ami. Écris le premier mot : « … you like some ${d.en}? »`,
    answer: { kind: 'text', accepted: ['Would'] },
    traps: [
      { text: 'Do', why: '« Do you like…? » demande si on aime. Pour proposer : « Would you like…? ».' },
      { text: 'Are', why: '« Are » est le verbe être : il ne va pas avec « like » ici.' },
    ],
    hint: 'Le mot qui, avec « I », se raccourcit en « ’d ».',
    steps: [OFFER_WHY, `Réponse : **Would you like some ${d.en}?**`],
  };
}

function likeLevel4(rng: Rng): QuestionDraft {
  const d = rng.pick(DISHES);
  if (rng.int(0, 2) === 0) {
    const right = ['Would', 'you', 'like', 'some', d.en];
    const items = shuffledOther(rng, right);
    return {
      prompt: `Remets les mots dans l’ordre pour demander à un ami s’il veut ${d.fr}.`,
      answer: { kind: 'order', items, correct: right.map((x) => items.indexOf(x)) },
      hint: 'Dans cette question, le mot pour proposer vient avant la personne.',
      steps: [OFFER_WHY, `Réponse : **${right.join(' ')}?**`],
    };
  }
  const good = `I’d like some ${d.en}, please`;
  const starts = ['I’d like', 'I would like'];
  return {
    prompt: `Tu es à table. Écris en anglais, avec « like » : « Je voudrais ${d.fr}, s’il te plaît. »`,
    answer: {
      kind: 'text',
      accepted: full(starts.flatMap((s) => [`${s} some ${d.en}, please`, `${s} some ${d.en} please`])),
    },
    traps: [
      { text: `I like some ${d.en}, please.`, why: LIKE_WHY },
      { text: `I’d some ${d.en}, please.`, why: 'Il manque « like » après « I’d ».' },
      { text: `I’d like any ${d.en}, please.`, why: 'Quand on demande, on prend « some ».' },
    ],
    hint: 'Quatre parties : « je voudrais », le petit mot pour « du », l’aliment, puis le mot poli.',
    steps: [WANT_WHY, 'Pour « du, de la, des » : « some ».', `Réponse : **${good}.**`],
  };
}

function cafe(rng: Rng): QuestionDraft {
  const item = rng.pick(COUNTABLE);
  const dish = rng.pick(DISHES.filter((d) => ['rice', 'bread', 'pasta'].includes(d.en)));
  const opening = ['Would', 'Are', 'Is'];
  const small = ['a', 'an', 'some'];
  const pick = (options: readonly string[], good: string) => ({
    mode: 'list' as const,
    options: [...options],
    correct: options.indexOf(good),
  });
  const lines = rng.shuffle([`${item.one}: 1`, `${dish.en}: yes`]);
  const kid = rng.pick(KIDS);
  return {
    prompt: `Au café, tu commandes pour ${kid} (1 = une seule chose, yes = on en veut). Lis la commande, puis complète le dialogue.`,
    figure: { kind: 'document', title: `${kid}’s order`, lines, credit: WRITTEN },
    answer: {
      kind: 'cloze',
      parts: ['Worker: What ', ' you like? — You: ', ' like ', ` ${item.one} and `, ` ${dish.en}, please.`],
      blanks: [
        pick(opening, 'Would'),
        { mode: 'text', accepted: ['I’d', 'I would'] },
        pick(small, item.article),
        pick(small, 'some'),
      ],
    },
    hint: 'La personne au comptoir propose. Toi, tu demandes. Puis compte chaque chose de la commande.',
    steps: [
      '« What would you like? » veut dire « Que voulez-vous ? ».',
      WANT_WHY,
      article(item),
      `« ${dish.en} » ne se compte pas ici : « some ».`,
      `Réponse : **Would, I’d, ${item.article}, some**`,
    ],
  };
}

const idLike: Skill = {
  id: 'acm2-id-like',
  title: 'I’d like',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      '**I’d like** (= I would like) veut dire « je voudrais » : I’d like some cake, please.',
      'Pour proposer : Would you like a drink? Pour demander ce qu’on veut : What would you like?',
      'Attention : I like cake = j’aime le gâteau. I’d like some cake = je voudrais du gâteau.',
    ],
    source: source(
      'accepter ou refuser une proposition, dire ce qu’on veut. Formules : British Council, « will and would » et « Ordering food in a café ».',
    ),
    sources: ['cycle3-2020', 'bc-will-would', 'bc-teens-cafe'],
  },
  generate: (rng, level): QuestionDraft => {
    if (level === 1) return likeLevel1(rng);
    if (level === 2) return likeLevel2(rng);
    if (level === 3) return likeLevel3(rng);
    if (level === 4) return likeLevel4(rng);
    return cafe(rng);
  },
};

export const ENGLISH_SCHOOL_CHAPTER: Chapter = {
  id: 'acm2-ecole-nourriture-animaux',
  subject: 'anglais',
  grade: 'cm2',
  domain: 'langue',
  title: 'École, nourriture, animaux',
  skills: [school, food, someSkill, animals, idLike],
};
