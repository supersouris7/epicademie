import type { Chapter, Level, Skill } from '../types.ts';
import { choice } from '../build.ts';
import { IRREGULAR_VERBS } from './verbs.ts';

/**
 * Anglais, du CM1 à la 3e (docs/adr/0024-contenus-hors-maths.md). Règle : sources
 * institutionnelles seulement (21/11/2026).
 * - Choix et place des notions : Éduscol, « Repères de progressivité linguistique — Anglais »
 *   (Ministère de l'Éducation nationale, mars 2016) : impératif, déterminants, possessifs,
 *   présent simple (1re et 3e personne), pronoms sujets, be au présent et au prétérit, prétérit.
 * - Formes et règles : British Council, LearnEnglish, English grammar reference (pages
 *   personal-pronouns, possessives-adjectives, verb-be, present-simple, past-simple, count-nouns,
 *   comparative-superlative-adjectives, present-perfect), relues le 21/11/2026. On n'emploie
 *   que ce que ces pages disent explicitement (règles et exemples cités).
 */

const BC = 'British Council, LearnEnglish, English grammar reference';
const src = (page: string, notion: string) =>
  `Anglais : ${notion} (Éduscol, repères de progressivité). Formes : ${BC} (${page}).`;

type Pick = { pick<T>(l: readonly T[]): T };
const PRONOUNS = ['I', 'you', 'he', 'she', 'it', 'we', 'they'] as const;
type Pronoun = (typeof PRONOUNS)[number];
const BE_PRESENT: Record<Pronoun, string> = {
  I: 'am',
  you: 'are',
  he: 'is',
  she: 'is',
  it: 'is',
  we: 'are',
  they: 'are',
};
const BE_PAST: Record<Pronoun, string> = {
  I: 'was',
  you: 'were',
  he: 'was',
  she: 'was',
  it: 'was',
  we: 'were',
  they: 'were',
};
const POSSESSIVE: Record<Pronoun, string> = {
  I: 'my',
  you: 'your',
  he: 'his',
  she: 'her',
  it: 'its',
  we: 'our',
  they: 'their',
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Pronoms du niveau : I/you/he/she d'abord, puis tous. */
const pronounFor = (rng: Pick, level: Level): Pronoun =>
  rng.pick(level === 1 ? (['I', 'you', 'he', 'she'] as const) : PRONOUNS);

// ——— CM1 : be au présent ———
const beForms = (table: Record<Pronoun, string>, values: readonly string[]) =>
  values.map((v) => ({ label: v, why: `Avec ce pronom, be ne se dit pas « ${v} ».` }));

const bePresent: Skill = {
  id: 'acm1-be-present',
  title: 'Le verbe be au présent',
  lesson: {
    memo: ['Le verbe be (être) au présent : I **am**, you **are**, he / she / it **is**, we **are**, they **are**.'],
    source: src('verb-be', 'be au présent'),
  },
  generate: (rng, level) => {
    const p = pronounFor(rng, level);
    const right = BE_PRESENT[p];
    const { answer, traps } = choice(rng, right, beForms(BE_PRESENT, ['am', 'is', 'are']));
    return {
      prompt: `Complète : ${cap(p)} … happy.`,
      answer,
      traps,
      hint: 'Pense au tableau : I am, you are, he/she/it is, we are, they are.',
      steps: [`Avec « ${p} », be devient « ${right} ».`, `${cap(p)} **${right}** happy.`],
    };
  },
};

const possessives: Skill = {
  id: 'acm1-possessifs',
  title: 'Les adjectifs possessifs',
  lesson: {
    memo: [
      'Chaque pronom a son possessif : I → **my**, you → **your**, he → **his**, she → **her**, it → **its**, we → **our**, they → **their**.',
      '**its** (possessif) n’a jamais d’apostrophe : « it’s » veut dire « it is ».',
    ],
    source: src('possessives-adjectives', 'adjectifs possessifs'),
  },
  generate: (rng, level) => {
    const p = pronounFor(rng, level);
    const right = POSSESSIVE[p];
    const others = Object.values(POSSESSIVE).filter((x) => x !== right);
    const { answer, traps } = choice(
      rng,
      right,
      [rng.pick(others), rng.pick(others), rng.pick(others)].map((o) => ({
        label: o,
        why: `« ${o} » va avec un autre pronom.`,
      })),
    );
    return {
      prompt: `Quel possessif va avec « ${p} » ?`,
      answer,
      traps,
      hint: 'my, your, his, her, its, our, their : dans l’ordre des pronoms.',
      steps: ['Chaque pronom a son possessif : my, your, his, her, its, our, their.', `« ${p} » → **${right}**.`],
    };
  },
};

// ——— CM2 : le pluriel des noms ———
/** Exemples et règles de la page count-nouns du British Council. */
const PLURALS: readonly {
  readonly one: string;
  readonly many: string;
  readonly rule: string;
  readonly tier: 1 | 2 | 3;
}[] = [
  { one: 'book', many: 'books', rule: 'En général, on ajoute -s.', tier: 1 },
  { one: 'boy', many: 'boys', rule: 'Voyelle + y : on ajoute simplement -s.', tier: 1 },
  { one: 'day', many: 'days', rule: 'Voyelle + y : on ajoute simplement -s.', tier: 1 },
  { one: 'class', many: 'classes', rule: 'Après -s, -ch, -sh, -ss, -x ou -o : -es.', tier: 2 },
  { one: 'watch', many: 'watches', rule: 'Après -s, -ch, -sh, -ss, -x ou -o : -es.', tier: 2 },
  { one: 'box', many: 'boxes', rule: 'Après -s, -ch, -sh, -ss, -x ou -o : -es.', tier: 2 },
  { one: 'potato', many: 'potatoes', rule: 'Après -s, -ch, -sh, -ss, -x ou -o : -es.', tier: 2 },
  { one: 'lady', many: 'ladies', rule: 'Consonne + y : -y devient -ies.', tier: 2 },
  { one: 'party', many: 'parties', rule: 'Consonne + y : -y devient -ies.', tier: 2 },
  { one: 'man', many: 'men', rule: 'Pluriel irrégulier, à apprendre.', tier: 3 },
  { one: 'woman', many: 'women', rule: 'Pluriel irrégulier, à apprendre.', tier: 3 },
  { one: 'child', many: 'children', rule: 'Pluriel irrégulier, à apprendre.', tier: 3 },
  { one: 'person', many: 'people', rule: 'Pluriel irrégulier, à apprendre.', tier: 3 },
  { one: 'foot', many: 'feet', rule: 'Pluriel irrégulier, à apprendre.', tier: 3 },
];

const plural: Skill = {
  id: 'acm2-pluriel',
  title: 'Le pluriel des noms',
  lesson: {
    memo: [
      'En général, on ajoute **-s** : book → books. Voyelle + y : -s (boy → boys).',
      'Après -s, -ch, -sh, -ss, -x, -o : **-es** (box → boxes). Consonne + y : **-ies** (party → parties).',
      'Quelques pluriels sont irréguliers : man → men, child → children, person → people, foot → feet.',
    ],
    source: src('count-nouns', 'le nom et son pluriel'),
  },
  generate: (rng, level) => {
    const n = rng.pick(PLURALS.filter((x) => x.tier <= level));
    const wrong = n.many === `${n.one}s` ? `${n.one}es` : `${n.one}s`;
    return {
      prompt: `Écris le pluriel de **${n.one}**.`,
      answer: { kind: 'text', accepted: [n.many] },
      traps: [{ text: wrong, why: n.rule }],
      hint: 'Regarde la fin du mot : -y ? -x, -ch, -o ? ou un pluriel irrégulier ?',
      steps: [n.rule, `${n.one} → **${n.many}**.`],
    };
  },
};

// ——— 6e : be au prétérit, 3e personne du présent simple ———
const bePast: Skill = {
  id: 'a6-be-preterit',
  title: 'Le verbe be au prétérit',
  lesson: {
    memo: ['Be au prétérit (passé) : I **was**, you **were**, he / she / it **was**, we **were**, they **were**.'],
    source: src('verb-be', 'be au prétérit'),
  },
  generate: (rng, level) => {
    const p = pronounFor(rng, level);
    const right = BE_PAST[p];
    const { answer, traps } = choice(rng, right, [
      { label: right === 'was' ? 'were' : 'was', why: `Avec « ${p} », c’est « ${right} ».` },
      { label: BE_PRESENT[p], why: 'Yesterday : on parle du passé, il faut le prétérit.' },
    ]);
    return {
      prompt: `Complète : Yesterday, ${p} … at school.`,
      answer,
      traps,
      hint: 'Au passé : was avec I, he, she, it ; were avec you, we, they.',
      steps: [
        'Yesterday (hier) : on parle du passé, be se met au prétérit (was ou were).',
        `Avec « ${p} » : **${right}**.`,
      ],
    };
  },
};

/** Verbes des exemples des pages present-simple et past-simple (ajout de -s / -ed seulement). */
const SIMPLE_VERBS = ['work', 'like', 'call', 'want'] as const;

const thirdPerson: Skill = {
  id: 'a6-present-3e-personne',
  title: 'Le présent simple avec he, she, it',
  lesson: {
    memo: ['Au présent simple, avec **he, she, it**, on ajoute **-s** au verbe : she work**s**, he like**s**.'],
    source: src('present-simple', 'présent simple, 3e personne'),
  },
  generate: (rng) => {
    const v = rng.pick(SIMPLE_VERBS);
    const who = rng.pick(['She', 'He', 'It', 'I', 'They'] as const);
    const third = who === 'She' || who === 'He' || who === 'It';
    const right = third ? `${v}s` : v;
    const { answer, traps } = choice(rng, right, [
      {
        label: third ? v : `${v}s`,
        why: third ? 'Avec he, she, it : on ajoute -s.' : 'Le -s, c’est seulement pour he, she, it.',
      },
    ]);
    return {
      prompt: `Complète : ${who} … (${v}).`,
      answer,
      traps,
      hint: 'Le -s du présent simple, c’est seulement pour he, she, it.',
      steps: [
        'Au présent simple, on ajoute -s seulement avec he, she, it.',
        third ? `${who} : 3e personne, on ajoute -s → **${right}**.` : `${who} : pas de -s → **${right}**.`,
      ],
    };
  },
};

// ——— 5e : prétérit des verbes réguliers ———
const regularPast: Skill = {
  id: 'a5-preterit-regulier',
  title: 'Le prétérit des verbes réguliers',
  lesson: {
    memo: [
      'La plupart des verbes forment leur prétérit en ajoutant **-ed** : call → called, work → worked, want → wanted.',
    ],
    source: src('past-simple', 'prétérit des verbes réguliers'),
  },
  generate: (rng) => {
    const v = rng.pick(['call', 'work', 'want'] as const);
    return {
      prompt: `Quel est le prétérit de **${v}** ?`,
      answer: { kind: 'text', accepted: [`${v}ed`] },
      traps: [{ text: v, why: 'Au prétérit, le verbe change : on ajoute -ed.' }],
      hint: 'Verbe régulier : la terminaison du passé est -ed.',
      steps: [
        'La plupart des verbes forment leur prétérit avec -ed.',
        `${v} est régulier : on ajoute -ed → **${v}ed**.`,
      ],
    };
  },
};

// ——— 4e : comparatif et superlatif ———
/** Exemples et adjectifs irréguliers de la page comparative-superlative-adjectives. */
const ADJECTIVES: readonly {
  readonly base: string;
  readonly more: string;
  readonly most: string;
  readonly why: string;
  readonly tier: 1 | 2 | 3;
}[] = [
  { base: 'old', more: 'older', most: 'oldest', why: 'Une syllabe : -er / -est.', tier: 1 },
  { base: 'nice', more: 'nicer', most: 'nicest', why: 'Finit par -e : -r / -st.', tier: 1 },
  { base: 'big', more: 'bigger', most: 'biggest', why: 'Voyelle + consonne : on double la consonne.', tier: 2 },
  { base: 'happy', more: 'happier', most: 'happiest', why: 'Consonne + y : -y devient -i, puis -er / -est.', tier: 2 },
  { base: 'good', more: 'better', most: 'best', why: 'Irrégulier : good, better, best.', tier: 3 },
  { base: 'bad', more: 'worse', most: 'worst', why: 'Irrégulier : bad, worse, worst.', tier: 3 },
];

const comparative: Skill = {
  id: 'a4-comparatif',
  title: 'Le comparatif et le superlatif',
  lesson: {
    memo: [
      'Adjectif court : **-er** (comparatif), **the … -est** (superlatif) : old, older, the oldest.',
      'Big → bigger (consonne doublée), happy → happier (-y → -i). Irréguliers : good, better, best ; bad, worse, worst.',
    ],
    source: src('comparative-superlative-adjectives', 'comparatif et superlatif'),
  },
  generate: (rng, level) => {
    const a = rng.pick(ADJECTIVES.filter((x) => x.tier <= level));
    const sup = rng.pick([false, true]);
    const right = sup ? a.most : a.more;
    const naive = sup ? `${a.base}est` : `${a.base}er`;
    return {
      prompt: sup ? `Le superlatif de **${a.base}** : the … ?` : `Le comparatif de **${a.base}** : … than ?`,
      answer: { kind: 'text', accepted: [right, sup ? `the ${right}` : right] },
      traps: naive === right ? [] : [{ text: naive, why: a.why }],
      hint: 'Regarde la fin de l’adjectif, ou souviens-toi des irréguliers.',
      steps: [a.why, `${a.base} → **${right}**.`],
    };
  },
};

// ——— 3e : present perfect ———
const presentPerfect: Skill = {
  id: 'a3-present-perfect',
  title: 'Le present perfect',
  lesson: {
    memo: [
      'Present perfect = **have** au présent + **participe passé** : I have seen, they have eaten.',
      'Le participe passé des verbes irréguliers est la 3e forme : see, saw, **seen**.',
    ],
    source: src('present-perfect', 'present perfect'),
  },
  generate: (rng, level) => {
    const v = rng.pick(IRREGULAR_VERBS.filter((x) => x.tier <= level && x.past[0] !== x.participle));
    const who = rng.pick(['I', 'You', 'We', 'They'] as const);
    const past = v.past[0] ?? v.base;
    return {
      prompt: `Complète au present perfect : ${who} have … (${v.base}).`,
      answer: { kind: 'text', accepted: [v.participle] },
      traps: [{ text: past, why: `« ${past} », c’est le prétérit. Après have, il faut le participe passé.` }],
      hint: 'Après have : la 3e forme du verbe (le participe passé).',
      steps: [
        `${v.base} – ${v.past.join(' / ')} – **${v.participle}** : le participe passé est la 3e forme.`,
        `${who} have **${v.participle}**.`,
      ],
    };
  },
};

const chapter = (id: string, grade: Chapter['grade'], title: string, skills: readonly Skill[]): Chapter => ({
  id,
  subject: 'anglais',
  grade,
  domain: 'langue',
  title,
  skills,
});

export const ENGLISH_GRAMMAR_CHAPTERS: readonly Chapter[] = [
  chapter('acm1-be', 'cm1', 'Le verbe be', [bePresent]),
  chapter('acm1-possessifs', 'cm1', 'Les possessifs', [possessives]),
  chapter('acm2-pluriel', 'cm2', 'Le pluriel', [plural]),
  chapter('a6-be-preterit', '6e', 'Be au passé', [bePast]),
  chapter('a6-present-simple', '6e', 'Le présent simple', [thirdPerson]),
  chapter('a4-comparatif', '4e', 'Comparer', [comparative]),
  chapter('a3-present-perfect', '3e', 'Le present perfect', [presentPerfect]),
];

/** Prétérit régulier : ajouté au chapitre des verbes de 5e. */
export const REGULAR_PAST_SKILL = regularPast;
