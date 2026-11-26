import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { ended, pairs, typed } from './pronoms.ts';
import { at, others, some } from './temps.ts';
import {
  AXES,
  AXIS_WORDS,
  FOODS,
  HOME,
  LEISURE,
  SCHOOL,
  STUDIES,
  type Study,
  type Term,
} from './vocabulaire-6e-faits.ts';

/**
 * Anglais 6e — « Vocabulaire thématique » (lot an-6e-09, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) : lexique en lien avec les axes culturels ; mots : programme et fiches du British Council (voir
 * vocabulaire-6e-faits.ts : chaque fait y porte sa source et sa citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string) => `${PROGRAMME} — ${detail}.`;
const ABOUT = 'Écrit pour l’exercice.';

const coin = (rng: Rng) => rng.int(0, 1) === 0;
const quoted = (list: readonly string[]) => list.map((l) => `« ${l} »`).join(' ');
const answered = (rows: readonly (readonly [string, string])[]) =>
  `Réponse : **${rows.map(([a, b]) => `${a} = ${b}`).join(' ; ')}**`;

/** « an » devant un son voyelle : « an uncle », mais « a uniform » (le mot commence par le son « you »). */
const article = (word: string) => (/^(?!uni)[aeiou]/i.test(word) ? 'an' : 'a');
/** Le mot tel qu'il entre dans une phrase : « a ruler », « scissors », « bread ». */
const inSentence = (t: Term) => (t.noun === 'one' ? `${article(t.en)} ${t.en}` : t.en);

/** Écritures acceptées : le mot et ses synonymes, seuls ou précédés d'un petit mot correct. */
export function spellings(t: Term): string[] {
  const names = [t.en, ...t.alt];
  const small = (name: string) => {
    if (t.noun === 'one') return ['the', article(name)];
    return t.noun === 'none' ? [] : ['the', 'some'];
  };
  return [...names, ...names.flatMap((n) => (/^(an?|the) /.test(n) ? [] : small(n).map((d) => `${d} ${n}`)))];
}

// ——— Les quatre thèmes de lexique ———
interface Frame {
  /** Mot attendu. */
  readonly en: string;
  /** Phrase anglaise avec « … ». */
  readonly text: string;
}
interface Slot {
  /** Ligne du document : le mot juste, et un autre mot écarté par la phrase. */
  readonly line: (good: string, other: string) => string;
  /** Début de la phrase française à compléter. */
  readonly ask: string;
  readonly words: readonly string[];
}
interface Theme {
  readonly terms: readonly Term[];
  /** Thème, après « Vocabulaire : ». */
  readonly name: string;
  /** Niveau 3 : phrases à compléter. */
  readonly frames: readonly Frame[];
  /** Niveau 4 : mots plus difficiles. */
  readonly hard: readonly string[];
  /** Niveau 5. */
  readonly title: string;
  readonly intro: string;
  readonly slots: readonly Slot[];
}

const find = (list: readonly Term[], en: string): Term => {
  const t = list.find((x) => x.en === en);
  if (!t) throw new Error(`mot inconnu : ${en}`);
  return t;
};
const means = (t: Term) => `« ${t.en} » veut dire « ${t.fr} ».`;
const saidAs = (t: Term) => `« ${t.fr} » se dit « ${t.en} ».`;
const rule = (th: Theme) => `Vocabulaire : ${th.name}. Chaque mot anglais a un sens précis.`;

function spot(rng: Rng, th: Theme): QuestionDraft {
  const t = rng.pick(th.terms);
  // Trois sens très éloignés : un seul mot par famille.
  const far: Term[] = [];
  for (const o of rng.shuffle(th.terms))
    if (far.length < 2 && o.group !== t.group && !far.some((x) => x.group === o.group)) far.push(o);
  const { answer, traps } = choice(
    rng,
    t.fr,
    far.map((o) => ({ label: o.fr, why: saidAs(o) })),
  );
  return {
    prompt: `Vocabulaire : ${th.name}. Que veut dire « ${t.en} » ?`,
    answer,
    traps,
    hint: 'Dis le mot à voix haute : ressemble-t-il à un mot français, ou contient-il un petit mot que tu connais ?',
    steps: [rule(th), means(t), `Réponse : **${t.fr}**`],
  };
}

const family = (th: Theme, group: string) => th.terms.filter((t) => t.group === group);

function recognise(rng: Rng, th: Theme): QuestionDraft {
  const groups = [...new Set(th.terms.map((t) => t.group))].filter((g) => family(th, g).length >= 4);
  const close = family(th, rng.pick(groups));
  if (coin(rng)) {
    const t = rng.pick(close);
    const { answer, traps } = choice(
      rng,
      t.en,
      others(rng, close, t, 3).map((o) => ({ label: o.en, why: means(o) })),
    );
    return {
      prompt: `Quel mot anglais veut dire « ${t.fr} » ?`,
      answer,
      traps,
      hint: 'Les propositions sont de la même famille : traduis-les une à une avant de choisir.',
      steps: [rule(th), saidAs(t), `Réponse : **${t.en}**`],
    };
  }
  const rows = some(rng, close, 3).map((t) => [t.en, t.fr] as const);
  return {
    prompt: `Associe chaque mot anglais à son sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Commence par le mot que tu connais le mieux.',
    steps: [rule(th), answered(rows)],
  };
}

/** Saisie d'un mot : une faute d'écriture et deux confusions de la même famille. */
function write(rng: Rng, list: readonly Term[], t: Term) {
  const accepted = spellings(t);
  const ok = new Set(accepted.map((a) => a.toLowerCase()));
  const near = list.filter((o) => o !== t && o.group === t.group);
  const confused = some(rng, near.length >= 2 ? near : list.filter((o) => o !== t), 2);
  const wrong: (readonly [string, string])[] = [
    [t.typo, `Regarde bien l’orthographe : on écrit « ${t.en} ».`],
    ...confused.map((o) => [o.en, means(o)] as const),
  ];
  const traps: Trap[] = typed(
    t.en,
    wrong.filter(([w]) => !ok.has(w.toLowerCase())),
  );
  return { answer: { kind: 'text' as const, accepted: ended(accepted) }, traps };
}

/**
 * Dans une phrase à trou, seules les réponses qui laissent la phrase correcte sont admises : pas de petit mot en plus
 * (« my a ruler »), sauf « some cheese » après « with », ni de mot déjà écrit (« a school school uniform »).
 */
function inGap(written: ReturnType<typeof write>, t: Term, text: string) {
  const said = new Set(text.toLowerCase().split(/[^a-z]+/));
  const bare = [t.en, ...t.alt].filter(
    (n) => !/^(an?|the) /.test(n) && (n === t.en || !n.split(' ').some((w) => said.has(w))),
  );
  const some = t.noun === 'mass' && text.includes('with …') ? [`some ${t.en}`] : [];
  const extra = typed(
    t.en,
    /\b(the|my|a|our) …/.test(text)
      ? [[`the ${t.en}`, 'Relis la phrase : un petit mot est déjà là. Écris seulement le mot qui manque.']]
      : [],
  );
  return {
    answer: { kind: 'text' as const, accepted: ended([...bare, ...some]) },
    traps: [...written.traps, ...extra],
  };
}

const size = (t: Term) => {
  const words = t.en.split(' ').length;
  return words > 1
    ? `La réponse s’écrit en ${words} mots.`
    : `La réponse s’écrit en un seul mot de ${t.en.length} caractères.`;
};

function complete(rng: Rng, th: Theme): QuestionDraft {
  const f = rng.pick(th.frames);
  const t = find(th.terms, f.en);
  return {
    prompt: `Complète avec le mot anglais qui veut dire « ${t.fr} » (il commence par « ${t.en.slice(0, 1)} ») : « ${f.text} »`,
    ...inGap(write(rng, th.terms, t), t, f.text),
    hint: size(t),
    steps: [
      `On cherche un mot qui veut dire « ${t.fr} » et qui complète le sens de la phrase.`,
      saidAs(t),
      `Réponse : **${f.text.replace('…', t.en)}**`,
    ],
  };
}

function master(rng: Rng, th: Theme): QuestionDraft {
  if (coin(rng)) {
    const t = find(th.terms, rng.pick(th.hard));
    return {
      prompt: `Sans modèle, écris en anglais : « ${t.fr} ».`,
      ...write(rng, th.terms, t),
      hint: `Le mot commence par « ${t.en.slice(0, 1)} ». ${size(t)}`,
      steps: [rule(th), saidAs(t), `Réponse : **${t.en}**`],
    };
  }
  const hard = th.hard.map((en) => find(th.terms, en));
  const rows = some(rng, hard, 5).map((t) => [t.en, t.fr] as const);
  return {
    prompt: `Cinq mots à relier à leur sens : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Élimine au fur et à mesure : les derniers mots se déduisent des autres.',
    steps: [rule(th), answered(rows)],
  };
}

/** Texte à trous à choisir dans une liste. */
function lists(rng: Rng, rows: readonly { ask: string; good: string; options: readonly string[] }[]) {
  const parts: string[] = [];
  let before = '';
  for (const r of rows) {
    parts.push(`${before}${r.ask} `);
    before = '. ';
  }
  parts.push('.');
  return {
    kind: 'cloze' as const,
    parts,
    blanks: rows.map((r) => {
      const options = rng.shuffle(r.options);
      return { mode: 'list' as const, options, correct: options.indexOf(r.good) };
    }),
  };
}

function reading(rng: Rng, th: Theme): QuestionDraft {
  const rows = some(rng, th.slots, 4).map((s) => {
    const [good, other, ...rest] = rng.shuffle(s.words).map((en) => find(th.terms, en)) as [Term, Term, ...Term[]];
    return {
      line: s.line(inSentence(good), inSentence(other)),
      ask: s.ask,
      good: good.fr,
      options: [good.fr, other.fr, ...rest.slice(0, 2).map((t) => t.fr)],
      said: means(good),
    };
  });
  return {
    prompt: `Lis le texte en anglais, puis complète le résumé en français. ${th.intro}`,
    figure: { kind: 'document', title: th.title, lines: rows.map((r) => r.line), credit: ABOUT },
    answer: lists(rng, rows),
    hint: 'Lis chaque phrase en entier : la question vise-t-elle le mot affirmé ou le mot écarté par la négation (don’t, can’t, isn’t) ?',
    steps: [
      'Chaque phrase affirme un mot et en écarte un autre (négation) : on retient celui que la question vise.',
      ...rows.map((r) => `« ${r.line} » : ${r.said}`),
      `Réponse : **${rows.map((r) => r.good).join(' ; ')}**`,
    ],
  };
}

const lexicon =
  (th: Theme) =>
  (rng: Rng, level: Level): QuestionDraft => {
    if (level === 1) return spot(rng, th);
    if (level === 2) return recognise(rng, th);
    if (level === 3) return complete(rng, th);
    if (level === 4) return master(rng, th);
    return reading(rng, th);
  };

const frame = (en: string, text: string): Frame => ({ en, text });
const slot = (ask: string, words: readonly string[], line: Slot['line']): Slot => ({ ask, words, line });

// ——— 1. L'école ———
const SCHOOL_THEME: Theme = {
  terms: SCHOOL,
  name: 'l’école',
  frames: [
    frame('ruler', 'I draw a straight line with my ….'),
    frame('scissors', 'I cut the paper with my ….'),
    frame('calculator', 'In maths, I can use my ….'),
    frame('history', 'We learn about kings and queens in ….'),
    frame('geography', 'We look at maps of Scotland in ….'),
    frame('music', 'We sing songs in our … lesson.'),
    frame('uniform', 'British pupils often wear a school ….'),
    frame('homework', 'After school, I do my ….'),
  ],
  hard: ['pencil sharpener', 'pencil case', 'scissors', 'folder', 'geography', 'homework', 'uniform', 'pupil'],
  title: 'Alex’s school day',
  intro: 'Alex parle de sa journée à l’école.',
  slots: [
    slot(
      'L’objet qu’Alex a dans son sac est',
      ['ruler', 'calculator', 'pencil case', 'eraser'],
      (g, o) => `In my bag, I haven’t got ${o}, but I’ve got ${g}.`,
    ),
    slot(
      'La matière du matin est',
      ['history', 'geography', 'science', 'maths'],
      (g, o) => `This morning, we don’t have ${o}: we have ${g}.`,
    ),
    slot(
      'Sa matière préférée est',
      ['art', 'music', 'history', 'science', 'geography'],
      (g, o) => `I like ${o}, but my favourite subject is ${g}.`,
    ),
    slot(
      'Pour l’exercice, l’objet nécessaire est',
      ['scissors', 'ruler', 'calculator', 'eraser'],
      (g, o) => `For this exercise, you don’t need ${o}. You need ${g}.`,
    ),
    slot(
      'Ce qu’Alex ne retrouve pas est',
      ['tie', 'uniform', 'notebook', 'folder'],
      (g, o) => `I can find my ${o.replace(/^an? /, '')}, but I can’t find my ${g.replace(/^an? /, '')}.`,
    ),
  ],
};

// ——— 2. Les loisirs ———
const LEISURE_THEME: Theme = {
  terms: LEISURE,
  name: 'les loisirs et les sports',
  frames: [
    frame('cinema', 'We watch films at the ….'),
    frame('swimming pool', 'You can swim at the ….'),
    frame('library', 'I borrow books from the ….'),
    frame('stadium', 'Thousands of fans watch the match in the ….'),
    frame('drawing', 'With a pencil and paper, I love ….'),
    frame('singing', 'She is in a choir: she loves ….'),
    frame('after school', 'On Mondays, I play tennis ….'),
    frame('board game', 'Chess is a famous ….'),
  ],
  hard: ['library', 'skating rink', 'horse-riding', 'collecting', 'once a week', 'board game', 'to lose', 'stadium'],
  title: 'Free time',
  intro: 'Jamie parle de son temps libre.',
  slots: [
    slot(
      'Le samedi, Jamie va à cet endroit :',
      ['cinema', 'swimming pool', 'library', 'stadium', 'skating rink'],
      (g, o) => `On Saturdays, I don’t go to ${o.replace(/^an? /, 'the ')}. I go to ${g.replace(/^an? /, 'the ')}.`,
    ),
    slot(
      'Son activité préférée est',
      ['reading', 'dancing', 'singing', 'drawing', 'painting'],
      (g, o) => `${o.charAt(0).toUpperCase()}${o.slice(1)} is boring for me, but I love ${g}.`,
    ),
    slot(
      'Sa sœur aime',
      ['horse-riding', 'acting', 'collecting', 'dancing'],
      (g, o) => `My sister doesn’t like ${o}. She enjoys ${g}.`,
    ),
    slot(
      'Le club se réunit',
      ['after school', 'at the weekend'],
      (g, o) => `Our club doesn’t meet ${o}. It meets ${g}.`,
    ),
    slot(
      'Ce qu’il faut à Jamie pour jouer aujourd’hui est',
      ['dice', 'board game'],
      (g, o) => `We don’t need ${o} today: we need ${g}.`,
    ),
  ],
};

// ——— 3. L'alimentation ———
const FOOD_THEME: Theme = {
  terms: FOODS,
  name: 'les aliments et les repas',
  frames: [
    frame('breakfast', 'In the morning, I have toast for ….'),
    frame('lunch', 'At twelve o’clock, we have ….'),
    frame('dinner', 'In the evening, my family has ….'),
    frame('hungry', 'I want to eat something: I’m ….'),
    frame('thirsty', 'Can I have some water, please? I’m ….'),
    frame('cheese', 'I’d like a sandwich with …, please.'),
    frame('sugar', 'No …, thank you: my tea is sweet enough.'),
    frame('meat', 'She is a vegetarian: she doesn’t eat ….'),
  ],
  hard: ['apricot', 'pineapple', 'zucchini', 'cucumber', 'apple pie', 'breakfast', 'thirsty', 'sugar'],
  title: 'Food and meals',
  intro: 'Sam parle de ses repas.',
  slots: [
    slot(
      'Le fruit que Sam mange est',
      ['pear', 'apricot', 'pineapple'],
      (g, o) => `Today I’m not eating ${o}: I’m eating ${g}.`,
    ),
    slot(
      'Dans la salade de Sam, on trouve',
      ['tomato', 'cucumber', 'zucchini'],
      (g, o) => `There isn’t ${o} in my salad, but there is ${g}.`,
    ),
    slot(
      'L’aliment que la famille de Sam n’a pas est',
      ['bread', 'cheese', 'meat', 'sugar'],
      (g, o) => `We have got some ${o}, but we haven’t got any ${g}.`,
    ),
    slot(
      'Le plat que Sam choisit est',
      ['apple pie', 'baked beans', 'spare ribs', 'maple taffy'],
      (g, o) => `I don’t want ${o}, thank you. I’d like ${g}.`,
    ),
    slot('Le repas dont Sam parle est', ['breakfast', 'lunch', 'dinner'], (g, o) => `This isn’t ${o}: it’s ${g}.`),
  ],
};

// ——— 4. La maison ———
const HOME_THEME: Theme = {
  terms: HOME,
  name: 'la maison et le quartier',
  frames: [
    frame('bedroom', 'I sleep in my ….'),
    frame('kitchen', 'Dad is cooking in the ….'),
    frame('bathroom', 'I have a shower in the ….'),
    frame('garden', 'The flowers are in the ….'),
    frame('window', 'It’s hot: open the …, please.'),
    frame('wardrobe', 'My clothes are in the ….'),
    frame('fridge', 'Put the milk in the ….'),
    frame('roof', 'There is a bird on the … of the house.'),
  ],
  hard: ['wardrobe', 'bookcase', 'armchair', 'neighbour', 'neighbourhood', 'furniture', 'semi-detached house', 'flat'],
  title: 'My home',
  intro: 'Robin décrit son logement.',
  slots: [
    slot(
      'La pièce où se trouve le chat de Robin est',
      ['bedroom', 'kitchen', 'bathroom', 'living room', 'dining room'],
      (g, o) => `My cat isn’t in ${o.replace(/^an? /, 'the ')}. It’s in ${g.replace(/^an? /, 'the ')}.`,
    ),
    slot(
      'Le meuble présent dans la chambre de Robin est',
      ['wardrobe', 'shelf', 'armchair', 'bookcase'],
      (g, o) => `In my room, there isn’t ${o}, but there is ${g}.`,
    ),
    slot(
      'Le ballon est près de cet élément :',
      ['window', 'door', 'wall', 'roof'],
      (g, o) => `The ball isn’t near ${o.replace(/^an? /, 'the ')}: it’s near ${g.replace(/^an? /, 'the ')}.`,
    ),
    slot(
      'Le logement de la famille de Robin est',
      ['flat', 'semi-detached house'],
      (g, o) => `We don’t live in ${o}. We live in ${g}.`,
    ),
    slot(
      'La personne ou le lieu dont Robin parle est',
      ['neighbour', 'neighbourhood', 'garden'],
      (g, o) => `I’m not talking about our ${o.replace(/^an? /, '')}. I’m talking about our ${g.replace(/^an? /, '')}.`,
    ),
  ],
};

const FRAMED = ['anglais-college-2025'] as const;
interface Lexical {
  readonly id: string;
  readonly title: string;
  readonly theme: Theme;
  readonly memo: string[];
  readonly detail: string;
  /** Sources en plus du programme. */
  readonly sources: readonly string[];
}
const lexical = ({ id, title, theme, memo, detail, sources }: Lexical): Skill => ({
  id,
  title,
  levels: 5,
  version: 1,
  lesson: { memo, source: source(detail), sources: [...FRAMED, ...sources] },
  generate: lexicon(theme),
});

const school = lexical({
  id: 'a6-voc-ecole',
  title: 'Le vocabulaire de l’école',
  theme: SCHOOL_THEME,
  memo: [
    'Range ton **lexique** par familles : les affaires (ruler, scissors), les **matières** (history, geography, art) et la vie à l’école (pupil, uniform, homework).',
    'Retiens le mot dans une phrase : I do my homework after school.',
  ],
  detail: 'axe « Le quotidien : vivre, jouer, apprendre », l’école',
  sources: ['bck-flashcards-classroom-objects', 'bck-flashcards-school-subjects'],
});

const leisure = lexical({
  id: 'a6-voc-loisirs',
  title: 'Le vocabulaire des loisirs',
  theme: LEISURE_THEME,
  memo: [
    'Un **loisir** a souvent un lieu (cinema, swimming pool, library), une activité en -ing (reading, singing, drawing) et un moment (after school, at the weekend).',
    'Exemple : I love drawing after school.',
  ],
  detail: 'lexique « Les loisirs et les sports » et « Le jeu et ses consignes »',
  sources: [],
});

const food = lexical({
  id: 'a6-voc-alimentation',
  title: 'Le vocabulaire de l’alimentation',
  theme: FOOD_THEME,
  memo: [
    'Les trois **repas** : breakfast (matin), lunch (midi), dinner (soir). Pour la faim et la soif : I’m hungry, I’m thirsty.',
    'Certains noms sont composés : apple pie (tarte aux pommes) ; le dernier mot dit ce que c’est.',
  ],
  detail: 'lexique « Les aliments et habitudes alimentaires »',
  sources: ['bck-flashcards-food-1'],
});

const home = lexical({
  id: 'a6-voc-maison',
  title: 'Le vocabulaire de la maison',
  theme: HOME_THEME,
  memo: [
    'Pars de la **pièce** (bedroom, kitchen, bathroom), puis ajoute les **meubles** (wardrobe, armchair, fridge).',
    'Attention : furniture désigne l’ensemble des meubles et ne prend pas de -s.',
  ],
  detail: 'lexique « L’habitat, la maison »',
  sources: ['bck-flashcards-home', 'bck-flashcards-furniture', 'bc-uncount-nouns'],
});

// ——— 5. Les repères des cinq axes culturels ———
const axis = (i: number) => at(AXES, i);
const axisRule = 'Le programme de 6e compte cinq axes culturels ; chacun a ses objets d’étude possibles.';
const classed = (s: Study) => `« ${s.name} » est un objet d’étude de l’axe « ${axis(s.axis)} ».`;
const AXIS_ABOUT: readonly string[] = [
  'des personnes et des personnages, réels ou fictifs, et leurs relations',
  'la vie des jeunes : lieux de vie, école, loisirs',
  'les paysages, les espaces naturels et la géographie',
  'la fiction, les contes et les légendes',
  'les œuvres (images, musique) et ce qu’on ressent devant elles',
];
const whyAxis = (i: number) => `L’axe « ${axis(i)} » porte sur ${at(AXIS_ABOUT, i)}.`;

function studyChoice(rng: Rng, s: Study, count: number): QuestionDraft {
  const wrong = some(
    rng,
    AXES.map((_, i) => i).filter((i) => i !== s.axis),
    count - 1,
  );
  const { answer, traps } = choice(
    rng,
    axis(s.axis),
    wrong.map((i) => ({ label: axis(i), why: whyAxis(i) })),
  );
  return {
    prompt: `Programme de 6e : à quel axe culturel appartient l’objet d’étude « ${s.name} » ?`,
    answer,
    traps,
    hint: 'Cherche le mot important du titre : parle-t-il de gens, de la vie de tous les jours, de nature, d’histoires ou d’art ?',
    steps: [axisRule, classed(s), whyAxis(s.axis), `Réponse : **${axis(s.axis)}**`],
  };
}

function studyMatch(rng: Rng, count: number, pool: readonly Study[]): QuestionDraft {
  const rows = some(rng, [0, 1, 2, 3, 4], count).map((i) => {
    const s = rng.pick(pool.filter((x) => x.axis === i));
    return [s.name, axis(i)] as const;
  });
  return {
    prompt: `Associe chaque objet d’étude à son axe culturel : ${rows.map((r) => r[0]).join(' / ')}`,
    answer: pairs(rng, rows),
    hint: 'Commence par les objets dont le titre nomme un lieu, une histoire ou un art.',
    steps: [axisRule, answered(rows)],
  };
}

/** Axe auquel se rattache chaque famille de mots. */
const GROUP_AXIS: Readonly<Record<string, number>> = { famille: 0, paysages: 2, contes: 3, émotions: 4 };
const EASY_WORDS = [
  'family',
  'uncle',
  'aunt',
  'river',
  'lake',
  'forest',
  'island',
  'witch',
  'happy',
  'angry',
  'afraid',
];
const HARD_WORDS = [
  'coast',
  'cliff',
  'valley',
  'hill',
  'meadow',
  'wizard',
  'fairy tale',
  'dwarf',
  'haunted castle',
  'disappointed',
];

function axisWord(rng: Rng, hard: boolean): QuestionDraft {
  const t = find(AXIS_WORDS, rng.pick(hard ? HARD_WORDS : EASY_WORDS));
  const i = GROUP_AXIS[t.group] ?? 0;
  const initial = t.en.slice(0, 1);
  return {
    prompt: hard
      ? `Repère de l’axe « ${axis(i)} » : sans modèle, écris en anglais « ${t.fr} ».`
      : `Repère de l’axe « ${axis(i)} » : écris en anglais « ${t.fr} » (le mot commence par « ${initial} »).`,
    ...write(rng, AXIS_WORDS, t),
    hint: hard ? `Le mot commence par « ${initial} ». ${size(t)}` : size(t),
    steps: [`Ce mot sert à parler de l’axe « ${axis(i)} ».`, saidAs(t), `Réponse : **${t.en}**`],
  };
}

/** Activités d'une semaine culturelle, chacune tirée d'un objet d'étude du programme. */
const ACTIVITIES: readonly (readonly [number, string])[] = [
  [0, 'We read a sailor’s logbook and a girl’s diary.'],
  [0, 'We present real families and families from stories.'],
  [0, 'We make masks and costumes for our characters.'],
  [1, 'We compare school days in England and in France.'],
  [1, 'We try a traditional British sport.'],
  [1, 'We find out about school holidays in the USA.'],
  [2, 'We follow the Mississippi river on a map.'],
  [2, 'We look at photos of the Highlands in Scotland.'],
  [2, 'We learn about the national parks of Kenya.'],
  [3, 'We read an old legend from Ireland.'],
  [3, 'We draw a dragon from a fairy tale.'],
  [3, 'We talk about witches and wizards in stories.'],
  [4, 'We listen to music and say how we feel.'],
  [4, 'We use augmented reality to look at a painting.'],
];

function week(rng: Rng): QuestionDraft {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const;
  const frenchDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi'] as const;
  const chosen = some(rng, [0, 1, 2, 3, 4], 4).map((i) => rng.pick(ACTIVITIES.filter((a) => a[0] === i)));
  const rows = chosen.map(([i, text], n) => ({
    line: `${at(days, n)}: ${text}`,
    ask: `${at(frenchDays, n)}, l’axe est`,
    good: axis(i),
    options: [...AXES],
    why: `${at(frenchDays, n)} : « ${text} » ${whyAxis(i)}`,
  }));
  return {
    prompt: 'Lis le programme de la semaine culturelle, puis indique l’axe culturel de chaque journée.',
    figure: { kind: 'document', title: 'Culture week', lines: rows.map((r) => r.line), credit: ABOUT },
    answer: lists(rng, rows),
    hint: 'Dans chaque ligne, repère le nom principal : qui ou quoi étudie-t-on ce jour-là ?',
    steps: [axisRule, ...rows.map((r) => r.why), `Réponse : **${rows.map((r) => r.good).join(' ; ')}**`],
  };
}

const axes: Skill = {
  id: 'a6-axes-culturels',
  title: 'Les repères des cinq axes culturels',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'En 6e, cinq **axes culturels** : Personnes et personnages ; Le quotidien : vivre, jouer, apprendre ; Pays et paysages ; Imaginaire, contes et légendes ; Arts et expression des sentiments.',
      'Chaque axe se découvre par un **objet d’étude** : l’image du dragon (imaginaire), le Mississippi (paysages), l’école (quotidien).',
    ],
    source: source('les cinq axes culturels, leurs objets d’étude et leur lexique'),
    sources: [...FRAMED],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return studyChoice(rng, rng.pick(STUDIES.filter((s) => s.plain)), 3);
    if (level === 2) return coin(rng) ? studyChoice(rng, rng.pick(STUDIES), 4) : studyMatch(rng, 3, STUDIES);
    if (level === 3) return axisWord(rng, false);
    if (level === 4) return coin(rng) ? studyMatch(rng, 5, STUDIES) : axisWord(rng, true);
    return week(rng);
  },
};

export const ENGLISH_VOCABULARY_6E_CHAPTER: Chapter = {
  id: 'a6-vocabulaire-thematique',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Vocabulaire thématique',
  skills: [school, leisure, food, home, axes],
};
