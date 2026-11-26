import type { Chapter, Level, QuestionDraft, Skill, Trap } from '../types.ts';
import type { Rng } from '../rng.ts';
import { choice } from '../build.ts';
import { ROWS, WH, rowOf, type Row, type Subject, type WhWord } from './pronoms-faits.ts';
import { at, shuffledOther, some } from './temps.ts';

/**
 * Anglais 6e — « Les pronoms » (lot an-6e-06, docs/adr/0034). Programme d'anglais du collège (arrêté du
 * 5 mai 2025) ; formes et emplois : British Council (voir pronoms-faits.ts : chaque fait y porte sa source et sa
 * citation).
 */
const PROGRAMME = 'Programme d’anglais du collège (arrêté du 5 mai 2025), classe de 6e';
const source = (detail: string, pages: string) => `${PROGRAMME} — ${detail}. Formes : British Council, ${pages}.`;
const ABOUT = 'Écrit pour l’exercice.';

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const coin = (rng: Rng) => rng.int(0, 1) === 0;
const quoted = (list: readonly string[]) => list.map((l) => `« ${l} »`).join(' ');
/** Saisies acceptées : avec ou sans point final. */
const ended = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`, `${f} .`]);
/** Une erreur typique reste reconnue avec ou sans point ; la première explication d'une même saisie gagne. */
function typed(good: string, traps: readonly (readonly [string, string])[]): Trap[] {
  const seen = new Set([good.toLowerCase()]);
  return traps.flatMap(([text, why]) => {
    if (seen.has(text.toLowerCase())) return [];
    seen.add(text.toLowerCase());
    return ended([text]).map((t) => ({ text: t, why }));
  });
}

/** Association : éléments à gauche, réponses mélangées à droite. */
function pairs(rng: Rng, rows: readonly (readonly [string, string])[]) {
  const left = rows.map((r) => r[0]);
  const right = shuffledOther(
    rng,
    rows.map((r) => r[1]),
  );
  return { kind: 'match' as const, left, right, pairs: rows.map((r) => right.indexOf(r[1])) };
}

/** Texte à trous saisis : le trou i s'insère entre `lines[i][0]` et `lines[i][1]`. */
function gaps(lines: readonly (readonly [string, string, string])[]) {
  const parts: string[] = [''];
  for (const [before, , after] of lines) {
    parts[parts.length - 1] = `${at(parts, parts.length - 1)}${before}`;
    parts.push(`${after} `);
  }
  parts[parts.length - 1] = at(parts, parts.length - 1).trimEnd();
  return {
    kind: 'cloze' as const,
    parts,
    blanks: lines.map(([, word]) => ({ mode: 'text' as const, accepted: [word] })),
  };
}

const ALL_SUBJECTS: readonly Subject[] = ROWS.map((r) => r.subject);
/** Pronoms dont la forme change d'une colonne à l'autre (you et it restent identiques en complément). */
const CHANGING: readonly Subject[] = ['I', 'he', 'she', 'we', 'they'];

// ——— 1. pronoms sujets ———
const WHY_SUBJECT: Readonly<Record<Subject, string>> = {
  I: '« I » désigne uniquement la personne qui parle.',
  you: '« you » désigne la ou les personnes à qui l’on parle.',
  he: '« he » remplace un seul homme ou garçon.',
  she: '« she » remplace une seule femme ou fille.',
  it: '« it » remplace une seule chose.',
  we: '« we » désigne un groupe dont fait partie la personne qui parle.',
  they: '« they » remplace plusieurs personnes ou choses, sans la personne qui parle.',
};

interface Group {
  readonly en: string;
  readonly pro: Subject;
}
const group = (pro: Subject, ...list: string[]): Group[] => list.map((en) => ({ en, pro }));
const GROUPS: readonly Group[] = [
  ...group('he', 'my brother', 'my father', 'my uncle', 'the boy'),
  ...group('she', 'my sister', 'my mother', 'my aunt', 'the girl'),
  ...group('it', 'the book', 'the window', 'my bag', 'the bus'),
  ...group('we', 'my friends and I', 'my sister and I', 'my dad and I'),
  ...group('you', 'you and your brother', 'you and your friends'),
  ...group('they', 'my parents', 'the books', 'my cousins', 'the girls'),
];
const SUBJECT_RULE = 'Un pronom sujet remplace le groupe qui fait l’action : on cherche de qui ou de quoi on parle.';
const subjectOptions = (rng: Rng, right: Subject, n: number) =>
  some(
    rng,
    (['I', 'he', 'she', 'it', 'we', 'you', 'they'] as const).filter((p) => p !== right),
    n,
  ).map((p) => ({ label: p, why: WHY_SUBJECT[p] }));

function subjectSpot(rng: Rng): QuestionDraft {
  const g = rng.pick(GROUPS);
  const { answer, traps } = choice(rng, g.pro, subjectOptions(rng, g.pro, 2));
  return {
    prompt: `Quel pronom sujet remplace « ${g.en} » ?`,
    answer,
    traps,
    hint: 'Demande-toi : combien sont-ils, et la personne qui parle en fait-elle partie ?',
    steps: [SUBJECT_RULE, WHY_SUBJECT[g.pro], `Réponse : **${g.pro}**`],
  };
}

/** Phrases dont le groupe sujet se remplace. */
const SENTENCES: readonly (readonly [string, string, Subject])[] = [
  ['My parents', 'are in London.', 'they'],
  ['My brother', 'likes music.', 'he'],
  ['My sister', 'is eleven.', 'she'],
  ['The window', 'is open.', 'it'],
  ['My friends and I', 'play football.', 'we'],
  ['You and Lisa', 'are late.', 'you'],
  ['The books', 'are on the desk.', 'they'],
  ['My aunt', 'lives in Dublin.', 'she'],
  ['My uncle', 'works in a school.', 'he'],
  ['The bus', 'is red.', 'it'],
  ['My mum and I', 'cook on Sundays.', 'we'],
];

function subjectReplace(rng: Rng): QuestionDraft {
  const [who, rest, pro] = rng.pick(SENTENCES);
  const { answer, traps } = choice(rng, cap(pro), [
    ...subjectOptions(rng, pro, 3).map((o) => ({ label: cap(o.label), why: o.why })),
  ]);
  return {
    prompt: `Dans « ${who} ${rest} », quel pronom remplace « ${who} » ?`,
    answer,
    traps,
    hint: 'Compte les personnes ou les choses, puis vérifie si « I » ou « you » apparaît dans le groupe.',
    steps: [SUBJECT_RULE, WHY_SUBJECT[pro], `Réponse : **${cap(pro)} ${rest}**`],
  };
}

function subjectMatch(rng: Rng): QuestionDraft {
  const pros = some(rng, ['he', 'she', 'it', 'we', 'you', 'they'] as const, 3);
  const rows = pros.map((p) => [rng.pick(GROUPS.filter((g) => g.pro === p)).en, p] as const);
  return {
    prompt: `Associe chaque groupe au pronom sujet qui le remplace : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Commence par les groupes qui désignent une seule personne ou une seule chose.',
    steps: [
      SUBJECT_RULE,
      ...rows.map(([en, p]) => `« ${en} » : ${WHY_SUBJECT[p]}`),
      `Réponse : **${rows.map(([en, p]) => `${en} = ${p}`).join(' ; ')}**`,
    ],
  };
}

const subjectRecognise = (rng: Rng) => (coin(rng) ? subjectReplace(rng) : subjectMatch(rng));

/** Formes erronées typiques d'un pronom sujet saisi. */
function subjectTraps(right: Subject): Trap[] {
  const r = rowOf(right);
  const wrong: (readonly [string, string])[] = [];
  if (r.object !== right)
    wrong.push([r.object, `« ${r.object} » est un pronom complément ; devant le verbe, il faut le pronom sujet.`]);
  wrong.push([r.det, `« ${r.det} » est un déterminant possessif : il accompagne un nom.`]);
  for (const p of ALL_SUBJECTS) if (p !== right) wrong.push([p, WHY_SUBJECT[p]]);
  return typed(right, wrong);
}

function subjectWrite(rng: Rng): QuestionDraft {
  const [who, rest, pro] = rng.pick(SENTENCES);
  return {
    prompt: `Remplace « ${who} » par un pronom sujet : « ${who} ${rest} » → « … ${rest} »`,
    answer: { kind: 'text', accepted: ended([pro, `${pro} ${rest.slice(0, -1)}`]) },
    traps: subjectTraps(pro),
    hint: 'Homme, femme, chose ou groupe ? Un groupe contient-il la personne qui parle, ou celle à qui l’on parle ?',
    steps: [SUBJECT_RULE, WHY_SUBJECT[pro], `Réponse : **${cap(pro)} ${rest}**`],
  };
}

/** Niveau 4 : le sujet se déduit du contexte (it « vide », you pluriel, we). */
const SITUATIONS: readonly {
  readonly lead: string;
  readonly rest: string;
  readonly pro: Subject;
  readonly why: string;
}[] = [
  { lead: 'Il pleut :', rest: 'is raining.', pro: 'it', why: 'Pour la météo, l’anglais met « it » comme sujet.' },
  { lead: 'Il fait froid :', rest: 'is cold today.', pro: 'it', why: 'Pour la météo, le sujet est « it ».' },
  { lead: 'Il est cinq heures :', rest: 'is five o’clock.', pro: 'it', why: 'Pour l’heure, le sujet est « it ».' },
  { lead: '« I have got two cats. »', rest: 'are black.', pro: 'they', why: '« two cats » : plusieurs animaux.' },
  { lead: '« My mum is a doctor. »', rest: 'works in a hospital.', pro: 'she', why: '« My mum » est une femme.' },
  { lead: '« My dad is in the kitchen. »', rest: 'is cooking.', pro: 'he', why: '« My dad » est un homme.' },
  {
    lead: '« Ben and I are in the same class. »',
    rest: 'like maths.',
    pro: 'we',
    why: 'Le groupe contient « I » : la personne qui parle en fait partie.',
  },
  { lead: '« Where is my bag? »', rest: 'is under the desk.', pro: 'it', why: '« my bag » est une chose.' },
  { lead: '« Look at Emma and Ben. »', rest: 'are dancing.', pro: 'they', why: 'On parle de deux autres personnes.' },
  {
    lead: 'Tu dis à Emma et Ben qu’ils sont en retard :',
    rest: 'are late!',
    pro: 'you',
    why: 'On s’adresse à eux : « you » vaut pour une ou plusieurs personnes.',
  },
  {
    lead: 'Tu parles de toi :',
    rest: 'am eleven.',
    pro: 'I',
    why: 'La personne qui parle dit « I », toujours en majuscule.',
  },
  {
    lead: '« My grandparents have got a farm. »',
    rest: 'live in Wales.',
    pro: 'they',
    why: '« My grandparents » : plusieurs personnes.',
  },
  {
    lead: '« This is my little sister. »',
    rest: 'is six.',
    pro: 'she',
    why: '« my little sister » est une fille.',
  },
];

function subjectContext(rng: Rng): QuestionDraft {
  const s = rng.pick(SITUATIONS);
  return {
    prompt: `Écris le pronom sujet qui manque. ${s.lead} « … ${s.rest} »`,
    answer: { kind: 'text', accepted: ended([s.pro]) },
    traps: subjectTraps(s.pro),
    hint: 'Une phrase anglaise a toujours un sujet. Cherche de qui ou de quoi parle la phrase.',
    steps: ['En anglais, le verbe ne reste jamais sans sujet.', s.why, `Réponse : **${cap(s.pro)} ${s.rest}**`],
  };
}

interface Intro {
  readonly pro: Subject;
  /** Phrase de la légende (document). */
  readonly intro: string;
  /** Phrase à compléter. */
  readonly before: string;
  readonly after: string;
}
const INTROS: readonly Intro[] = [
  { pro: 'he', intro: 'This is my brother, Leo.', before: 'This is my brother, Leo. ', after: ' is twelve.' },
  { pro: 'she', intro: 'And that is my aunt Rosa.', before: 'And that is my aunt Rosa. ', after: ' lives in Dublin.' },
  { pro: 'it', intro: 'That is our house.', before: 'That is our house. ', after: ' is near the park.' },
  {
    pro: 'we',
    intro: 'Ben is my friend. Ben and I like chess.',
    before: 'Ben and I like chess: ',
    after: ' play every day.',
  },
  {
    pro: 'they',
    intro: 'These are my grandparents.',
    before: 'These are my grandparents. ',
    after: ' have got a garden.',
  },
  { pro: 'he', intro: 'This is Mr Hill, our neighbour.', before: 'This is Mr Hill. ', after: ' is a nurse.' },
  { pro: 'she', intro: 'This is my little sister, Emma.', before: 'This is Emma. ', after: ' can swim.' },
  { pro: 'they', intro: 'Those are my two dogs.', before: 'Those are my two dogs. ', after: ' are very funny.' },
];

function subjectDocument(rng: Rng): QuestionDraft {
  const rows = some(rng, INTROS, 4);
  const answers = rows.map((r) => cap(r.pro));
  return {
    prompt:
      'Lis les légendes de l’album photo, puis complète le texte : un pronom sujet par trou, pour ne pas répéter les noms.',
    figure: { kind: 'document', title: 'My photo album', lines: rows.map((r) => r.intro), credit: ABOUT },
    answer: gaps(rows.map((r) => [r.before, cap(r.pro), r.after] as const)),
    hint: 'Pour chaque trou, relis la phrase juste avant : qui ou quoi vient d’être présenté ?',
    steps: [
      '« This is… » et « That is… » présentent ; le pronom sujet reprend ensuite sans répéter.',
      ...rows.map((r) => `« ${r.before.trim()} » : ${WHY_SUBJECT[r.pro]}`),
      `Réponse : **${answers.join(', ')}**`,
    ],
  };
}

const subjectPronouns: Skill = {
  id: 'a6-pronoms-sujets',
  title: 'Les pronoms sujets',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **pronom sujet** remplace celui qui fait l’action : My sister is here → She is here. Les sept : I, you, he, she, it, we, they.',
      'En anglais, une phrase a un **sujet**, sauf pour donner un ordre. Météo, heure : on met it : It is raining.',
    ],
    source: source('pronoms personnels sujets et tournures « This is… »', '« Personal pronouns »'),
    sources: ['anglais-college-2025', 'bc-personal-pronouns', 'bc-it-there'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return subjectSpot(rng);
    if (level === 2) return subjectRecognise(rng);
    if (level === 3) return subjectWrite(rng);
    if (level === 4) return subjectContext(rng);
    return subjectDocument(rng);
  },
};

// ——— 2. pronoms compléments ———
const WHY_OBJECT_FORM = (r: Row) => `Le pronom complément qui correspond à « ${r.subject} » est « ${r.object} ».`;
const WHY_IS_SUBJECT = 'C’est un pronom sujet : après un verbe ou une préposition, il faut le pronom complément.';
const WHY_IS_DET = 'C’est un déterminant possessif : il doit être suivi d’un nom.';
const whyOtherObject = (r: Row) => `« ${r.object} » correspond à « ${r.subject} » : ${r.who}.`;
const OBJECT_RULE = 'Après un verbe ou une préposition, le pronom prend sa forme de complément.';

function objectSpot(rng: Rng): QuestionDraft {
  const r = rowOf(rng.pick(CHANGING));
  const other = rowOf(rng.pick(CHANGING.filter((p) => p !== r.subject)));
  const { answer, traps } = choice(rng, r.object, [
    { label: r.det === r.object ? r.subject : r.det, why: r.det === r.object ? WHY_IS_SUBJECT : WHY_IS_DET },
    { label: other.object, why: whyOtherObject(other) },
  ]);
  return {
    prompt: `Quel pronom complément correspond au pronom sujet « ${r.subject} » ?`,
    answer,
    traps,
    hint: 'Pense à la forme employée après « Can you help…? ».',
    steps: [OBJECT_RULE, WHY_OBJECT_FORM(r), `Réponse : **${r.object}**`],
  };
}

interface Target {
  /** Phrase avec le groupe. */
  readonly full: string;
  readonly group: string;
  /** Phrase à compléter. */
  readonly before: string;
  readonly after: string;
  readonly pro: Subject;
}
const target = (group: string, before: string, after: string, pro: Subject): Target => ({
  full: `${before}${group}${after}`,
  group,
  before,
  after,
  pro,
});
const TARGETS: readonly Target[] = [
  target('my brother', 'I like ', '.', 'he'),
  target('Mr Hill', 'We often help ', '.', 'he'),
  target('my sister', 'I play with ', '.', 'she'),
  target('my aunt', 'We visit ', ' on Sundays.', 'she'),
  target('this song', 'I love ', '.', 'it'),
  target('the window', 'Please open ', '.', 'it'),
  target('my parents', 'I help ', '.', 'they'),
  target('the cats', 'Tom feeds ', ' every day.', 'they'),
  target('my friend and me', 'Can you help ', ', please?', 'we'),
  target('Ben and me', 'The teacher is looking at ', '.', 'we'),
];
const objectStep = (t: Target) => `« ${t.group} » correspond à « ${rowOf(t.pro).subject} ».`;

function objectChoice(rng: Rng): QuestionDraft {
  const t = rng.pick(TARGETS);
  const r = rowOf(t.pro);
  const others = some(
    rng,
    ROWS.filter((x) => x.subject !== t.pro && x.subject !== 'I' && x.object !== r.object),
    2,
  );
  const { answer, traps } = choice(
    rng,
    r.object,
    [
      ...(r.subject === r.object ? [] : [{ label: r.subject, why: WHY_IS_SUBJECT }]),
      ...(r.det === r.object ? [] : [{ label: r.det, why: WHY_IS_DET }]),
      ...others.map((o) => ({ label: o.object, why: whyOtherObject(o) })),
    ].slice(0, 3),
  );
  return {
    prompt: `Remplace « ${t.group} » : « ${t.full} » → « ${t.before}…${t.after} »`,
    answer,
    traps,
    hint: 'Trouve d’abord le pronom sujet du groupe, puis sa forme après le verbe.',
    steps: [OBJECT_RULE, objectStep(t), `Réponse : **${t.before}${r.object}${t.after}**`],
  };
}

function objectMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, CHANGING, 3).map((p) => [p, rowOf(p).object] as const);
  return {
    prompt: `Associe chaque pronom sujet à son pronom complément : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Essaie chaque forme dans « Can you help …? » : de qui parle-t-on ?',
    steps: [OBJECT_RULE, `Réponse : **${rows.map(([s, o]) => `${s} = ${o}`).join(' ; ')}**`],
  };
}

const objectRecognise = (rng: Rng) => (coin(rng) ? objectChoice(rng) : objectMatch(rng));

function objectTraps(right: Subject): Trap[] {
  const r = rowOf(right);
  return typed(r.object, [
    [r.subject, WHY_IS_SUBJECT],
    [r.det, WHY_IS_DET],
    ...ROWS.filter((x) => x.object !== r.object).map((x) => [x.object, whyOtherObject(x)] as const),
  ]);
}

function objectWrite(rng: Rng): QuestionDraft {
  const t = rng.pick(TARGETS);
  const r = rowOf(t.pro);
  return {
    prompt: `Écris le pronom complément qui remplace « ${t.group} » : « ${t.full} » → « ${t.before}…${t.after} »`,
    answer: { kind: 'text', accepted: ended([r.object]) },
    traps: objectTraps(t.pro),
    hint: 'Homme, femme, chose ou groupe ? Le groupe contient-il la personne qui parle ?',
    steps: [OBJECT_RULE, objectStep(t), `Réponse : **${t.before}${r.object}${t.after}**`],
  };
}

/** Niveau 4 : à partir du pronom sujet, après un verbe ou une préposition. */
const AFTER: readonly (readonly [string, Subject, string])[] = [
  ['She is waiting for', 'I', '.'],
  ['Give the ball to', 'he', ', please.'],
  ['I want to speak to', 'they', '.'],
  ['Why are you looking at', 'she', '?'],
  ['Don’t take the bike from', 'we', '.'],
  ['This present is for', 'he', '.'],
  ['Come with', 'we', '!'],
  ['My keys! I can’t find', 'they', '.'],
  ['Listen to', 'I', ', please.'],
  ['We saw', 'they', ' in town.'],
  ['He doesn’t know', 'she', '.'],
];

function objectFromSubject(rng: Rng): QuestionDraft {
  const [before, pro, after] = rng.pick(AFTER);
  const r = rowOf(pro);
  return {
    prompt: `Mets le pronom entre parenthèses à la forme qui convient : « ${before} … (${pro})${after} »`,
    answer: { kind: 'text', accepted: ended([r.object]) },
    traps: objectTraps(pro),
    hint: 'Regarde le mot placé avant le trou : le pronom fait-il l’action, ou la reçoit-il ?',
    steps: [OBJECT_RULE, WHY_OBJECT_FORM(r), `Réponse : **${before} ${r.object}${after}**`],
  };
}

interface Rewrite {
  readonly line: string;
  readonly before: string;
  readonly word: string;
  readonly after: string;
  readonly why: string;
}
const rewrite = (line: string, before: string, word: string, after: string, why: string): Rewrite => ({
  line,
  before,
  word,
  after,
  why,
});
const OBJECT_LINES: readonly Rewrite[] = [
  rewrite(
    'I visit my grandfather every Sunday.',
    'I visit ',
    'him',
    ' every Sunday.',
    '« my grandfather » est un homme → him.',
  ),
  rewrite('Tom often phones his aunt.', 'Tom often phones ', 'her', '.', '« his aunt » est une femme → her.'),
  rewrite('We listen to this song at home.', 'We listen to ', 'it', ' at home.', '« this song » est une chose → it.'),
  rewrite('Emma feeds the rabbits.', 'Emma feeds ', 'them', '.', '« the rabbits » : plusieurs animaux → them.'),
  rewrite(
    'Our teacher helps Ben and me.',
    'Our teacher helps ',
    'us',
    '.',
    '« Ben and me » contient la personne qui parle → us.',
  ),
  rewrite('Lisa is waiting for her father.', 'Lisa is waiting for ', 'him', '.', '« her father » est un homme → him.'),
  rewrite('I play chess with my cousins.', 'I play chess with ', 'them', '.', '« my cousins » : plusieurs → them.'),
  rewrite(
    'My mum drives my sister to school.',
    'My mum drives ',
    'her',
    ' to school.',
    '« my sister » est une fille → her.',
  ),
];

function objectDocument(rng: Rng): QuestionDraft {
  const rows = some(rng, OBJECT_LINES, 3);
  const lines = rows.map((r) => r.line);
  const extra = rng.int(0, 1) === 0;
  const subjectLine = extra
    ? { line: 'My brother helps my parents.', words: ['He', 'them'] as const }
    : { line: 'My sister helps my uncle.', words: ['She', 'him'] as const };
  lines.push(subjectLine.line);
  const blanks = gaps([
    ...rows.map((r) => [r.before, r.word, r.after] as const),
    ['', subjectLine.words[0], ' helps'],
    ['', subjectLine.words[1], '.'],
  ]);
  const answers = [...rows.map((r) => r.word), ...subjectLine.words];
  return {
    prompt:
      'Lis le message, puis réécris ses phrases sans répéter les noms : un pronom par trou (la dernière phrase en demande deux).',
    figure: { kind: 'document', title: 'My week', lines, credit: ABOUT },
    answer: blanks,
    hint: 'Repère la place du nom remplacé : avant le verbe, il fait l’action ; après, il la reçoit.',
    steps: [
      'Avant le verbe : pronom sujet. Après le verbe ou une préposition : pronom complément.',
      ...rows.map((r) => r.why),
      `Dernière phrase : « ${subjectLine.words[0]} » fait l’action, « ${subjectLine.words[1]} » la reçoit.`,
      `Réponse : **${answers.join(', ')}**`,
    ],
  };
}

const objectPronouns: Skill = {
  id: 'a6-pronoms-complements',
  title: 'Les pronoms compléments',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **pronom complément** se place après le verbe : I like Tom → I like him. Retiens : me, you, him, her, it, us, them.',
      'Après une **préposition** (for, to, with, at), on l’emploie aussi : She is waiting for me.',
    ],
    source: source('pronoms personnels compléments', '« Personal pronouns »'),
    sources: ['anglais-college-2025', 'bc-personal-pronouns'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return objectSpot(rng);
    if (level === 2) return objectRecognise(rng);
    if (level === 3) return objectWrite(rng);
    if (level === 4) return objectFromSubject(rng);
    return objectDocument(rng);
  },
};

// ——— 3. déterminants possessifs ———
const DET_RULE = 'Le déterminant possessif se choisit d’après le possesseur, pas d’après la chose possédée.';
const whyDet = (r: Row) => `« ${r.det} » correspond à « ${r.subject} » : ${r.who}.`;

function detSpot(rng: Rng): QuestionDraft {
  const r = rowOf(rng.pick(CHANGING));
  const others = some(
    rng,
    ROWS.filter((x) => x.subject !== r.subject),
    2,
  );
  const { answer, traps } = choice(
    rng,
    r.det,
    others.map((o) => ({ label: o.det, why: whyDet(o) })),
  );
  return {
    prompt: `Quel déterminant possessif correspond à « ${r.subject} » ?`,
    answer,
    traps,
    hint: `Demande-toi qui désigne « ${r.subject} », puis cherche le mot qui dit que la chose est à lui, à elle ou à eux.`,
    steps: [DET_RULE, whyDet(r), `Réponse : **${r.det}**`],
  };
}

interface Owned {
  /** Phrase qui nomme le possesseur. */
  readonly lead: string;
  /** Ce que l'on possède, avec la suite de la phrase. */
  readonly rest: string;
  readonly pro: Subject;
  /** Le possesseur en français. */
  readonly fr: string;
}
const owned = (lead: string, rest: string, pro: Subject, fr: string): Owned => ({ lead, rest, pro, fr });
const OWNED: readonly Owned[] = [
  owned('Lisa has got a dog.', 'dog is black.', 'she', 'le chien de Lisa'),
  owned('Tom has got a sister.', 'sister is eleven.', 'he', 'la sœur de Tom'),
  owned('Emma has got a brother.', 'brother is tall.', 'she', 'le frère d’Emma'),
  owned('Ben has got a mother.', 'mother is a nurse.', 'he', 'la mère de Ben'),
  owned('I have got a bike.', 'bike is blue.', 'I', 'mon vélo'),
  owned('You have got a new bag.', 'bag is nice.', 'you', 'ton sac'),
  owned('We have got a garden.', 'garden is small.', 'we', 'notre jardin'),
  owned('My parents have got a car.', 'car is red.', 'they', 'la voiture de mes parents'),
  owned('The house has got a door.', 'door is yellow.', 'it', 'la porte de la maison'),
  owned('The girls have got a room.', 'room is big.', 'they', 'la chambre des filles'),
  owned('My uncle has got a horse.', 'horse is old.', 'he', 'le cheval de mon oncle'),
  owned('My aunt has got two sons.', 'sons are funny.', 'she', 'les fils de ma tante'),
];
const detOptions = (rng: Rng, right: Row, n: number) =>
  some(
    rng,
    ROWS.filter((x) => x.det !== right.det),
    n,
  ).map((o) => ({ label: cap(o.det), why: whyDet(o) }));

function detChoice(rng: Rng): QuestionDraft {
  const o = rng.pick(OWNED);
  const r = rowOf(o.pro);
  const wrong = [
    ...(r.subject === 'it' || r.subject === 'I' ? [] : [{ label: cap(r.subject), why: WHY_IS_SUBJECT_BEFORE_NOUN }]),
    ...detOptions(rng, r, 3),
  ].slice(0, 3);
  const { answer, traps } = choice(rng, cap(r.det), wrong);
  return {
    prompt: `Complète (la 2e phrase parle de ce qui est nommé dans la 1re) : « ${o.lead} … ${o.rest} »`,
    answer,
    traps,
    hint: 'Qui possède ? Cherche le possesseur dans la première phrase.',
    steps: [DET_RULE, whyDet(r), `Réponse : **${cap(r.det)} ${o.rest}**`],
  };
}
const WHY_IS_SUBJECT_BEFORE_NOUN = 'C’est un pronom sujet : devant un nom possédé, il faut un déterminant possessif.';

function detMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, ALL_SUBJECTS, 4).map((p) => [p, rowOf(p).det] as const);
  return {
    prompt: `Associe chaque pronom sujet à son déterminant possessif : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Commence par ceux que tu connais le mieux : pour chacun, imagine un objet qui lui appartient.',
    steps: [DET_RULE, `Réponse : **${rows.map(([s, d]) => `${s} = ${d}`).join(' ; ')}**`],
  };
}

const detRecognise = (rng: Rng) => (coin(rng) ? detChoice(rng) : detMatch(rng));

function detTraps(right: Subject): Trap[] {
  const r = rowOf(right);
  const extra: (readonly [string, string])[] = [];
  if (right === 'it')
    extra.push(['it’s', '« it’s » veut dire it is ou it has : le possessif its n’a pas d’apostrophe.']);
  if (right === 'they') extra.push(['they’re', '« they’re » veut dire they are : le possessif est un autre mot.']);
  if (right === 'he') extra.push(['he’s', '« he’s » veut dire he is ou he has.']);
  if (right === 'you') extra.push(['you’re', '« you’re » veut dire you are.']);
  return typed(r.det, [
    ...extra,
    [r.subject, WHY_IS_SUBJECT_BEFORE_NOUN],
    ...(r.pronoun ? [[r.pronoun, 'C’est un pronom possessif : il s’emploie sans nom après lui.'] as const] : []),
    ...ROWS.filter((x) => x.det !== r.det).map((x) => [x.det, whyDet(x)] as const),
  ]);
}

function detWrite(rng: Rng): QuestionDraft {
  const o = rng.pick(OWNED);
  const r = rowOf(o.pro);
  return {
    prompt: `Écris le déterminant possessif (${o.fr}) : « … ${o.rest} »`,
    answer: { kind: 'text', accepted: [r.det] },
    traps: detTraps(o.pro),
    hint: 'Remplace le possesseur par un pronom sujet, puis cherche le déterminant qui va avec.',
    steps: [DET_RULE, whyDet(r), `Réponse : **${cap(r.det)} ${o.rest}**`],
  };
}

/** Niveau 4 : parties du corps et objets à soi, its / it’s ; sans traduction. Le possesseur est le sujet. */
const TRICKY: readonly (readonly [string, Subject, string])[] = [
  ['He has broken', 'he', 'arm.'],
  ['She is washing', 'she', 'hair.'],
  ['I need to clean', 'I', 'teeth.'],
  ['The tree is losing', 'it', 'leaves.'],
  ['The school is opening', 'it', 'doors.'],
  ['We are doing', 'we', 'homework.'],
  ['The children are tidying', 'they', 'room.'],
  ['Tom is talking to', 'he', 'mother.'],
  ['Emma is riding', 'she', 'bike.'],
  ['You must close', 'you', 'eyes.'],
  ['My parents love', 'they', 'garden.'],
  ['This town is proud of', 'it', 'museum.'],
];

function detBody(rng: Rng): QuestionDraft {
  const [before, pro, after] = rng.pick(TRICKY);
  const r = rowOf(pro);
  return {
    prompt: `Complète avec un déterminant possessif (le possesseur est le sujet de la phrase) : « ${before} … ${after} »`,
    answer: { kind: 'text', accepted: [r.det] },
    traps: detTraps(pro),
    hint: 'Trouve le sujet : qui parle, à qui l’on parle, un homme, une femme, une chose ou un groupe ?',
    steps: [
      'Pour une partie du corps, la famille ou ce qui est à soi, l’anglais emploie un déterminant possessif.',
      whyDet(r),
      `Réponse : **${before} ${r.det} ${after}**`,
    ],
  };
}

interface Possession {
  readonly line: string;
  readonly pro: Subject;
  readonly after: string;
}
const POSSESSIONS: readonly Possession[] = [
  { line: 'Ben has got a rabbit called Snow.', pro: 'he', after: ' rabbit is called Snow.' },
  { line: 'Emma has got a blue bike.', pro: 'she', after: ' bike is blue.' },
  { line: 'Ben and Emma have got a big room.', pro: 'they', after: ' room is big.' },
  { line: 'The car has got a red door.', pro: 'it', after: ' door is red.' },
  { line: 'My brother and I have got a small tent.', pro: 'we', after: ' tent is small.' },
  { line: 'I have got a new watch.', pro: 'I', after: ' watch is new.' },
  { line: 'My grandmother has got a green car.', pro: 'she', after: ' car is green.' },
  { line: 'My uncle has got an old boat.', pro: 'he', after: ' boat is old.' },
];

function detDocument(rng: Rng): QuestionDraft {
  const rows = some(rng, POSSESSIONS, 4);
  const answers = rows.map((r) => cap(rowOf(r.pro).det));
  return {
    prompt:
      'Lis le message de Sam, puis complète ses nouvelles phrases : un déterminant possessif par trou. Sam parle : « I » le désigne.',
    figure: { kind: 'document', title: 'Sam’s message', lines: rows.map((r) => r.line), credit: ABOUT },
    answer: gaps(rows.map((r) => ['', cap(rowOf(r.pro).det), r.after] as const)),
    hint: 'Pour chaque objet, retrouve sa ligne dans le message : qui a cet objet ?',
    steps: [
      DET_RULE,
      ...rows.map((r) => `« ${r.line} » : ${whyDet(rowOf(r.pro))}`),
      `Réponse : **${answers.join(', ')}**`,
    ],
  };
}

const possessiveDeterminers: Skill = {
  id: 'a6-determinants-possessifs',
  title: 'Les déterminants possessifs',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **déterminant possessif** se place devant un nom : my bag, her brother. Les formes : my, your, his, her, its, our, their.',
      'On le choisit selon le **possesseur** : le frère de Lisa → her brother. Attention : **its** n’a pas d’apostrophe.',
    ],
    source: source('déterminant possessif', '« Possessives: adjectives »'),
    sources: ['anglais-college-2025', 'bc-possessives-adjectives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return detSpot(rng);
    if (level === 2) return detRecognise(rng);
    if (level === 3) return detWrite(rng);
    if (level === 4) return detBody(rng);
    return detDocument(rng);
  },
};

// ——— 4. pronoms possessifs ———
const OWNERS: readonly Subject[] = ['I', 'you', 'he', 'she', 'we', 'they'];
const pronounOf = (p: Subject): string => {
  const word = rowOf(p).pronoun;
  if (!word) throw new Error(`pas de pronom possessif pour ${p}`);
  return word;
};
const POSS_RULE = 'Le pronom possessif remplace le déterminant et le nom : il reste seul.';
const whyPronoun = (p: Subject) => {
  const { det, pronounFr } = rowOf(p);
  const word = pronounOf(p);
  return word === det
    ? `« ${word} » garde la même forme sans nom après lui : ${pronounFr}.`
    : `« ${word} » correspond à « ${det} » : ${pronounFr}.`;
};
const WHY_DET_ALONE = 'C’est un déterminant : il ne peut pas rester seul, sans nom.';
const WHY_NO_APOSTROPHE = 'Un pronom possessif ne prend jamais d’apostrophe.';

function possSpot(rng: Rng): QuestionDraft {
  const p = rng.pick(OWNERS);
  const [a, b] = some(
    rng,
    OWNERS.filter((x) => x !== p),
    2,
  ) as [Subject, Subject];
  const { answer, traps } = choice(
    rng,
    pronounOf(p),
    [a, b].map((x) => ({ label: pronounOf(x), why: whyPronoun(x) })),
  );
  return {
    prompt: `Quel pronom possessif correspond au déterminant « ${rowOf(p).det} » ?`,
    answer,
    traps,
    hint: 'Cherche la forme qui ressemble au déterminant et qui peut rester seule.',
    steps: [POSS_RULE, whyPronoun(p), `Réponse : **${pronounOf(p)}**`],
  };
}

/** Un objet et son propriétaire, pour les phrases « This is … → The … is … ». */
const ITEMS = ['pen', 'bag', 'book', 'bike', 'coat', 'cap', 'ball', 'phone'] as const;

function possChoice(rng: Rng): QuestionDraft {
  const p = rng.pick(OWNERS);
  const r = rowOf(p);
  const item = rng.pick(ITEMS);
  const good = pronounOf(p);
  const wrong = [
    ...(r.det === good ? [] : [{ label: r.det, why: WHY_DET_ALONE }]),
    ...(r.object === good || r.object === r.det
      ? []
      : [{ label: r.object, why: 'C’est un pronom complément : il ne dit pas à qui est l’objet.' }]),
    ...some(
      rng,
      OWNERS.filter((x) => x !== p),
      3,
    ).map((x) => ({ label: pronounOf(x), why: whyPronoun(x) })),
  ].slice(0, 3);
  const { answer, traps } = choice(rng, good, wrong);
  return {
    prompt: `Complète pour dire la même chose : « It’s ${r.det} ${item}. » → « The ${item} is … . »`,
    answer,
    traps,
    hint: 'Après « is », aucun nom ne suit : quelle forme peut rester seule ?',
    steps: [POSS_RULE, whyPronoun(p), `Réponse : **The ${item} is ${good}.**`],
  };
}

function possMatch(rng: Rng): QuestionDraft {
  const rows = some(rng, ['I', 'you', 'she', 'we', 'they'] as const, 3).map(
    (p) => [`${rowOf(p).det} ${rng.pick(ITEMS)}`, pronounOf(p)] as const,
  );
  return {
    prompt: `Associe chaque groupe au pronom possessif qui le remplace : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Observe le premier mot de chaque groupe : le pronom lui ressemble.',
    steps: [POSS_RULE, `Réponse : **${rows.map(([g, p]) => `${g} = ${p}`).join(' ; ')}**`],
  };
}

const possRecognise = (rng: Rng) => (coin(rng) ? possChoice(rng) : possMatch(rng));

function possTraps(p: Subject): Trap[] {
  const r = rowOf(p);
  const good = pronounOf(p);
  return typed(good, [
    [r.det, WHY_DET_ALONE],
    p === 'I'
      ? (['mines', '« mine » ne prend pas de -s.'] as const)
      : p === 'he'
        ? (['he’s', '« he’s » veut dire he is ou he has : ce n’est pas un possessif.'] as const)
        : ([`${good.slice(0, -1)}’s`, WHY_NO_APOSTROPHE] as const),
    [r.object, 'C’est un pronom complément : il ne dit pas à qui est l’objet.'],
    ...OWNERS.filter((x) => pronounOf(x) !== good).map((x) => [pronounOf(x), whyPronoun(x)] as const),
  ]);
}

function possWrite(rng: Rng): QuestionDraft {
  const p = rng.pick(OWNERS);
  const item = rng.pick(ITEMS);
  const det = rowOf(p).det;
  return {
    prompt: `Réécris avec un pronom possessif : « This is ${det} ${item}. » → « This ${item} is … . »`,
    answer: { kind: 'text', accepted: ended([pronounOf(p)]) },
    traps: possTraps(p),
    hint: 'Le nom a déjà été dit : trouve la forme possessive qui s’emploie sans lui.',
    steps: [POSS_RULE, whyPronoun(p), `Réponse : **This ${item} is ${pronounOf(p)}.**`],
  };
}

/** Niveau 4 : dialogues et comparaisons ; le groupe répété devient un pronom. */
const REPEATS: readonly (readonly [string, string, string, Subject])[] = [
  ['Her coat is grey.', 'My coat', 'is brown.', 'I'],
  ['My bag is blue.', 'Your bag', 'is green.', 'you'],
  ['Her bike is new.', 'His bike', 'is old.', 'he'],
  ['His room is small.', 'Her room', 'is big.', 'she'],
  ['Your dog is white.', 'Our dog', 'is black.', 'we'],
  ['Our house is old.', 'Their house', 'is new.', 'they'],
  ['This isn’t your pen.', 'My pen', 'is red.', 'I'],
  ['My phone is here.', 'Her phone', 'is at home.', 'she'],
  ['Their car is red.', 'Our car', 'is yellow.', 'we'],
  ['My cap is black.', 'Their caps', 'are white.', 'they'],
  ['Our team is good.', 'Your team', 'is good too.', 'you'],
  ['Her book is on the desk.', 'His book', 'is in the bag.', 'he'],
];

function possRepeat(rng: Rng): QuestionDraft {
  const [first, repeated, rest, p] = rng.pick(REPEATS);
  const good = pronounOf(p);
  return {
    prompt: `Évite la répétition : remplace « ${repeated} » par un seul mot. « ${first} ${repeated} ${rest} »`,
    answer: { kind: 'text', accepted: ended([good]) },
    traps: possTraps(p),
    hint: 'Garde le même possesseur, mais fais disparaître le nom.',
    steps: [POSS_RULE, whyPronoun(p), `Réponse : **${cap(good)} ${rest}**`],
  };
}

interface Belonging {
  readonly pro: Subject;
  readonly line: (colour: string, thing: string) => string;
}
const BELONGINGS: readonly Belonging[] = [
  { pro: 'I', line: (c, t) => `I have got a ${c} ${t}.` },
  { pro: 'you', line: (c, t) => `You have got a ${c} ${t}.` },
  { pro: 'he', line: (c, t) => `Tom has got a ${c} ${t}.` },
  { pro: 'she', line: (c, t) => `Emma has got a ${c} ${t}.` },
  { pro: 'we', line: (c, t) => `My sister and I have got a ${c} ${t}.` },
  { pro: 'they', line: (c, t) => `Ben and Lisa have got a ${c} ${t}.` },
];
const COLOURS = ['red', 'blue', 'green', 'black', 'white', 'yellow'] as const;
const THINGS = ['bike', 'tent', 'bag', 'ball', 'kite', 'boat'] as const;

function possDocument(rng: Rng): QuestionDraft {
  const owners = some(rng, BELONGINGS, 4);
  const colours = some(rng, COLOURS, 4);
  const thing = rng.pick(THINGS);
  const rows = owners.map((o, i) => ({ pro: o.pro, colour: at(colours, i), line: o.line(at(colours, i), thing) }));
  // Ordre tiré de la lettre elle-même : un même document attend toujours les mêmes réponses.
  const asked = [...rows].sort((a, b) => a.colour.localeCompare(b.colour));
  const answers = asked.map((r) => pronounOf(r.pro));
  return {
    prompt:
      'Lis la lettre que Sam écrit à son ami Max (« I » = Sam, « You » = Max). Sam montre ensuite les objets à Max : complète ses phrases avec un pronom possessif (un seul mot, sans prénom).',
    figure: { kind: 'document', title: 'Sam’s letter to Max', lines: rows.map((r) => r.line), credit: ABOUT },
    answer: gaps(asked.map((r) => [`The ${r.colour} ${thing} is `, pronounOf(r.pro), '.'] as const)),
    hint: 'Trouve la couleur dans la lettre, puis demande-toi comment Sam, face à Max, désigne ce propriétaire.',
    steps: [
      POSS_RULE,
      ...asked.map((r) => `« ${r.line} » : ${whyPronoun(r.pro)}`),
      `Réponse : **${answers.join(', ')}**`,
    ],
  };
}

const possessivePronouns: Skill = {
  id: 'a6-pronoms-possessifs',
  title: 'Les pronoms possessifs',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Le **pronom possessif** remplace le déterminant et le nom : It’s my pen → It’s mine. Formes : mine, yours, his, hers, ours, theirs.',
      'Il évite une répétition et ne prend jamais d’**apostrophe** : The red bag is hers.',
    ],
    source: source('(A1+) pronoms possessifs', '« Possessives: pronouns »'),
    sources: ['anglais-college-2025', 'bc-possessives-pronouns'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return possSpot(rng);
    if (level === 2) return possRecognise(rng);
    if (level === 3) return possWrite(rng);
    if (level === 4) return possRepeat(rng);
    return possDocument(rng);
  },
};

// ——— 5. mots interrogatifs ———
const wh = (en: WhWord) => {
  const w = WH.find((x) => x.en === en);
  if (!w) throw new Error(`mot inconnu : ${en}`);
  return w;
};
const whyWh = (en: WhWord) => `« ${en} » veut dire « ${wh(en).fr} » : on demande ${wh(en).asks}.`;
const otherWh = (en: WhWord) => WH.filter((w) => w.en !== en);
const WH_RULE = 'Le mot interrogatif ouvre la question et annonce le genre de réponse attendu.';

interface Exchange {
  readonly wh: WhWord;
  /** La question sans son mot interrogatif. */
  readonly rest: string;
  readonly reply: string;
  /** La question en français. */
  readonly fr: string;
  /** Explication propre à la question, quand le sens usuel du mot ne suffit pas (how old, how many). */
  readonly why?: string;
}
const exchange = (w: WhWord, rest: string, reply: string, fr: string, why?: string): Exchange => ({
  wh: w,
  rest,
  reply,
  fr,
  ...(why ? { why } : {}),
});
const EXCHANGES: readonly Exchange[] = [
  exchange('Who', 'is that man?', 'He is my uncle Sam.', 'Qui est cet homme ?'),
  exchange('Who', 'is your English teacher?', 'Mrs Taylor.', 'Qui est ton professeur d’anglais ?'),
  exchange('What', 'is in your lunch box?', 'A sandwich.', 'Qu’y a-t-il dans ta boîte à déjeuner ?'),
  exchange('What', 'do you want for your birthday?', 'A new bike.', 'Que veux-tu pour ton anniversaire ?'),
  exchange('Where', 'do you live?', 'In Dublin.', 'Où habites-tu ?'),
  exchange('Where', 'is the dictionary?', 'On the shelf.', 'Où est le dictionnaire ?'),
  exchange('When', 'is the football match?', 'On Saturday.', 'Quand a lieu le match de football ?'),
  exchange('When', 'do you get up?', 'At seven o’clock.', 'Quand te lèves-tu ?'),
  exchange('Why', 'is he sad?', 'Because he can’t find his dog.', 'Pourquoi est-il triste ?'),
  exchange('Why', 'are you late?', 'Because the bus is late.', 'Pourquoi es-tu en retard ?'),
  exchange('How', 'do you go to school?', 'By bus.', 'Comment vas-tu à l’école ?'),
  exchange('How', 'are you today?', 'I’m fine, thanks.', 'Comment vas-tu aujourd’hui ?'),
];
const question = (e: Exchange) => `${e.wh} ${e.rest}`;

function whMeaning(rng: Rng): QuestionDraft {
  const w = rng.pick(WH);
  const wrong = some(rng, otherWh(w.en), 2);
  if (coin(rng)) {
    const { answer, traps } = choice(
      rng,
      w.fr,
      wrong.map((o) => ({ label: o.fr, why: `« ${o.fr} » se dit « ${o.en} ».` })),
    );
    return {
      prompt: `Quel est le sens du mot interrogatif « ${w.en} » ?`,
      answer,
      traps,
      hint: 'Retrouve une question de classe qui commence par ce mot : que répond-on ?',
      steps: [WH_RULE, whyWh(w.en), `Réponse : **${w.fr}**`],
    };
  }
  const { answer, traps } = choice(
    rng,
    w.en,
    wrong.map((o) => ({ label: o.en, why: whyWh(o.en) })),
  );
  return {
    prompt: `Ta question demande ${w.asks}. Quel mot interrogatif choisis-tu ?`,
    answer,
    traps,
    hint: 'Traduis chaque proposition en français avant de choisir.',
    steps: [WH_RULE, whyWh(w.en), `Réponse : **${w.en}**`],
  };
}

/** Une question de chaque mot, pour des réponses sans ambiguïté. */
const draw = (rng: Rng, n: number): Exchange[] =>
  some(rng, WH, n).map((w) => rng.pick(EXCHANGES.filter((e) => e.wh === w.en)));

function whAnswer(rng: Rng): QuestionDraft {
  const [good, ...others] = draw(rng, 4) as [Exchange, Exchange, Exchange, Exchange];
  const { answer, traps } = choice(
    rng,
    good.reply,
    others.map((o) => ({ label: o.reply, why: `« ${o.reply} » donne ${wh(o.wh).asks} : cela répond à « ${o.wh} ».` })),
  );
  return {
    prompt: `Quelle réponse convient à la question « ${question(good)} » ?`,
    answer,
    traps,
    hint: 'Le premier mot de la question dit quel genre d’information chercher.',
    steps: [whyWh(good.wh), `Réponse : **${good.reply}**`],
  };
}

function whMatch(rng: Rng): QuestionDraft {
  const rows = draw(rng, 4).map((e) => [question(e), e.reply] as const);
  return {
    prompt: `Associe chaque question à sa réponse : ${quoted(rows.map((r) => r[0]))}`,
    answer: pairs(rng, rows),
    hint: 'Compare les premiers mots : personne, chose, lieu, moment, raison ou manière ?',
    steps: [WH_RULE, `Réponse : **${rows.map(([q, a]) => `${q} ${a}`).join(' ; ')}**`],
  };
}

const whRecognise = (rng: Rng) => (coin(rng) ? whAnswer(rng) : whMatch(rng));

const whTraps = (right: WhWord): Trap[] =>
  typed(
    right,
    otherWh(right).map((o) => [o.en, whyWh(o.en)] as const),
  );

function whWrite(rng: Rng): QuestionDraft {
  const e = rng.pick(EXCHANGES);
  return {
    prompt: `Complète la question (${e.fr}) : « … ${e.rest} »`,
    answer: { kind: 'text', accepted: [e.wh] },
    traps: whTraps(e.wh),
    hint: 'En français, que cherche-t-on à savoir ? Choisis le mot anglais correspondant.',
    steps: [whyWh(e.wh), `Réponse : **${question(e)}**`],
  };
}

/** Niveau 4 : sans français, la réponse seule indique le mot à écrire. */
const FROM_REPLY: readonly Exchange[] = [
  ...EXCHANGES,
  exchange('How', 'old is your brother?', 'He is nine.', '', '« How old » demande l’âge : « quel âge ».'),
  exchange('How', 'many pets have you got?', 'Two.', '', '« How many » demande un nombre : « combien ».'),
  exchange('What', 'is your name?', 'My name is Maya.', ''),
  exchange('What', 'do you do on Sundays?', 'I play tennis.', ''),
  exchange('Who', 'do you play with?', 'With my cousin.', ''),
  exchange('Where', 'is she from?', 'She is from Canada.', ''),
];

function whFromReply(rng: Rng): QuestionDraft {
  const e = rng.pick(FROM_REPLY);
  return {
    prompt: `Lis la réponse, puis écris le mot interrogatif : « … ${e.rest} » — « ${e.reply} »`,
    answer: { kind: 'text', accepted: [e.wh] },
    traps: whTraps(e.wh),
    hint: 'Que donne la réponse : une personne, une chose, un lieu, un moment, une raison ou une autre précision ?',
    steps: [
      `La réponse « ${e.reply} » indique ce que la question demande.`,
      e.why ?? whyWh(e.wh),
      `Réponse : **${question(e)}**`,
    ],
  };
}

interface Fact {
  readonly wh: WhWord;
  readonly rest: string;
  readonly said: readonly string[];
}
const FACTS: readonly Fact[] = [
  { wh: 'Where', rest: 'do you live?', said: ['I live in Cardiff.', 'I live in Dublin.', 'I live in Leeds.'] },
  { wh: 'Who', rest: 'is your best friend?', said: ['My best friend is Maya.', 'My best friend is Leo.'] },
  { wh: 'How', rest: 'do you go to school?', said: ['I go to school by bike.', 'I go to school by bus.'] },
  { wh: 'When', rest: 'is your birthday?', said: ['My birthday is in June.', 'My birthday is in May.'] },
  {
    wh: 'Why',
    rest: 'do you like Fridays?',
    said: ['I like Fridays because we have art.', 'I like Fridays because we play football.'],
  },
  { wh: 'What', rest: 'is your favourite food?', said: ['My favourite food is pasta.', 'My favourite food is rice.'] },
];

function whInterview(rng: Rng): QuestionDraft {
  const facts = some(rng, FACTS, 4);
  const lines = facts.map((f) => rng.pick(f.said));
  // Ordre tiré des questions : un même document attend toujours les mêmes réponses.
  const asked = facts
    .map((f, i) => ({ f, line: i + 1, said: at(lines, i) }))
    .sort((a, b) => a.f.rest.localeCompare(b.f.rest));
  return {
    prompt:
      'Lis les réponses de l’élève interviewé, puis complète les questions du journaliste. Chaque question renvoie à une ligne.',
    figure: { kind: 'document', title: 'The interview', lines, credit: ABOUT },
    answer: gaps(asked.map((a) => [`Line ${a.line}: « `, a.f.wh, ` ${a.f.rest} »`] as const)),
    hint: 'Va à la ligne indiquée : quelle information nouvelle donne-t-elle ?',
    steps: [
      ...asked.map((a) => `Ligne ${a.line}, « ${a.said} » : ${whyWh(a.f.wh)}`),
      `Réponse : **${asked.map((a) => a.f.wh).join(', ')}**`,
    ],
  };
}

const whQuestions: Skill = {
  id: 'a6-mots-interrogatifs',
  title: 'Les mots interrogatifs',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **mot interrogatif** ouvre la question : who (qui), what (quoi), where (où), when (quand), why (pourquoi), how (comment).',
      'Regarde la réponse : un lieu appelle where, une raison avec because appelle why. Pour l’âge : How old are you?',
    ],
    source: source('mots interrogatifs usuels', '« Questions and negatives »'),
    sources: ['anglais-college-2025', 'bc-questions-negatives'],
  },
  generate: (rng, level: Level): QuestionDraft => {
    if (level === 1) return whMeaning(rng);
    if (level === 2) return whRecognise(rng);
    if (level === 3) return whWrite(rng);
    if (level === 4) return whFromReply(rng);
    return whInterview(rng);
  },
};

export const ENGLISH_PRONOUNS_CHAPTER: Chapter = {
  id: 'a6-pronoms',
  subject: 'anglais',
  grade: '6e',
  domain: 'langue',
  title: 'Les pronoms',
  skills: [subjectPronouns, objectPronouns, possessiveDeterminers, possessivePronouns, whQuestions],
};
