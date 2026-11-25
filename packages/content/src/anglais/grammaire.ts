import type { Chapter, Skill } from '../types.ts';
import { IRREGULAR_VERBS } from './verbs.ts';

/**
 * Anglais, du CM1 à la 3e (docs/adr/0024-contenus-hors-maths.md). Règle : sources
 * institutionnelles seulement (21/11/2026).
 * - Choix et place des notions : Éduscol, « Repères de progressivité linguistique — Anglais »
 *   (Ministère de l'Éducation nationale, mars 2016) : impératif, déterminants, possessifs,
 *   présent simple (1re et 3e personne), pronoms sujets, prétérit.
 * - Le CM2 « Le groupe nominal » (à 5 niveaux) est dans groupe-nominal.ts ; le présent simple de 6e (à 5
 *   niveaux) dans present-simple.ts ; « Be et have » de 6e dans be-have.ts.
 * - Formes et règles : British Council, LearnEnglish, English grammar reference (pages
 *   personal-pronouns, possessives-adjectives, present-simple, past-simple,
 *   comparative-superlative-adjectives, present-perfect), relues le 21/11/2026. On n'emploie
 *   que ce que ces pages disent explicitement (règles et exemples cités).
 */

const BC = 'British Council, LearnEnglish, English grammar reference';
const src = (page: string, notion: string) =>
  `Anglais : ${notion} (Éduscol, repères de progressivité). Formes : ${BC} (${page}).`;

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
  chapter('a4-comparatif', '4e', 'Comparer', [comparative]),
  chapter('a3-present-perfect', '3e', 'Le present perfect', [presentPerfect]),
];

/** Prétérit régulier : ajouté au chapitre des verbes de 5e. */
export const REGULAR_PAST_SKILL = regularPast;
