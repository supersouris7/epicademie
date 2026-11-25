import type { Chapter, Level, Skill } from '../types.ts';
import { choice } from '../build.ts';
import { IRREGULAR_VERBS, regularised, verbsFor } from './verbs.ts';
import { ENGLISH_GRAMMAR_CHAPTERS, REGULAR_PAST_SKILL } from './grammaire.ts';
import { ENGLISH_PRESENTATION_CHAPTER } from './presentation.ts';
import { ENGLISH_BE_CHAPTERS } from './be.ts';
import { ENGLISH_TIME_CHAPTER } from './temps.ts';
import { ENGLISH_FAMILY_CHAPTER } from './famille.ts';
import { ENGLISH_TASTES_CHAPTER } from './gouts.ts';
import { ENGLISH_LISTENING_CHAPTER } from './ecoute.ts';
import { ENGLISH_NOUN_GROUP_CHAPTER } from './groupe-nominal.ts';
import { ENGLISH_LISTENING_CM2_CHAPTER } from './ecoute-cm2.ts';
import { ENGLISH_PLACES_CHAPTER } from './se-situer.ts';
import { ENGLISH_DAY_CHAPTER } from './journee.ts';
import { ENGLISH_SCHOOL_CHAPTER } from './ecole.ts';

/**
 * Anglais — pilote (docs/adr/0024-contenus-hors-maths.md) : verbes irréguliers, classe de 5e
 * (cycle 4). Formes vérifiées : voir verbs.ts.
 */
const SOURCE =
  'Anglais, cycle 4 (5e) : prétérit et participe passé des verbes irréguliers. Formes : British Council, LearnEnglish, « Irregular verbs ».';

const lesson = (memo: string[]) => ({ memo, source: SOURCE });
const draw = (rng: { pick<T>(l: readonly T[]): T }, level: Level) => rng.pick(verbsFor(level));
const both = (past: readonly string[]) => past.join(' / ');

const preterit: Skill = {
  id: 'a5-preterit',
  title: 'Le prétérit des verbes irréguliers',
  lesson: lesson([
    'Au prétérit (le passé), les verbes réguliers prennent -ed : play → played.',
    'Les verbes irréguliers ont leur propre forme, à apprendre par cœur : go → **went**, see → **saw**.',
  ]),
  generate: (rng, level) => {
    const v = draw(rng, level);
    const wrong = regularised(v.base);
    return {
      prompt: `Quel est le prétérit de **to ${v.base}** (${v.french}) ?`,
      answer: { kind: 'text', accepted: v.past },
      traps: v.past.includes(wrong)
        ? []
        : [{ text: wrong, why: `« ${v.base} » est irrégulier : pas de -ed au prétérit.` }],
      hint: `C’est un verbe irrégulier : sa forme au passé ne finit pas par -ed.`,
      steps: [
        `« to ${v.base} » veut dire « ${v.french} ».`,
        `C’est un verbe irrégulier : base **${v.base}**, prétérit **${both(v.past)}**, participe passé **${v.participle}**.`,
        `Réponse : **${both(v.past)}**.`,
      ],
    };
  },
};

const participle: Skill = {
  id: 'a5-participe',
  title: 'Le participe passé des verbes irréguliers',
  lesson: lesson([
    'Le participe passé sert avec have : I have **eaten** (j’ai mangé).',
    'Chez les irréguliers, il est parfois égal au prétérit (bought, bought), parfois différent (went, **gone**).',
  ]),
  generate: (rng, level) => {
    const v = draw(rng, level);
    const traps = v.past
      .filter((p) => p !== v.participle)
      .map((p) => ({
        text: p,
        why: `« ${p} », c’est le prétérit. Le participe passé de « ${v.base} » est différent.`,
      }));
    return {
      prompt: `Quel est le participe passé de **to ${v.base}** (${v.french}) ?`,
      answer: { kind: 'text', accepted: [v.participle] },
      traps,
      hint: 'Récite le verbe en entier : base, prétérit, participe passé. C’est la 3e forme.',
      steps: [
        `On récite les trois formes : **${v.base}** – **${both(v.past)}** – **${v.participle}**.`,
        `Le participe passé est la 3e : **${v.participle}**.`,
      ],
    };
  },
};

/** Phrases au passé : le sujet, le complément, et le verbe à conjuguer. */
const SENTENCES: readonly { readonly base: string; readonly before: string; readonly after: string }[] = [
  { base: 'go', before: 'Yesterday, I', after: 'to the cinema.' },
  { base: 'see', before: 'Last week, we', after: 'a great film.' },
  { base: 'eat', before: 'Last night, Tom', after: 'a big pizza.' },
  { base: 'come', before: 'Two days ago, my cousins', after: 'to my house.' },
  { base: 'make', before: 'Yesterday, Lisa', after: 'a chocolate cake.' },
  { base: 'get', before: 'For my birthday, I', after: 'a new bike.' },
  { base: 'buy', before: 'Last Saturday, my dad', after: 'a new car.' },
  { base: 'write', before: 'Yesterday, she', after: 'a letter to her grandmother.' },
  { base: 'win', before: 'Last Sunday, our team', after: 'the match.' },
  { base: 'meet', before: 'Last year, I', after: 'a famous singer.' },
];

const sentence: Skill = {
  id: 'a5-phrase',
  title: 'Raconter au passé',
  lesson: lesson([
    'Les mots yesterday, last week, ago montrent qu’on raconte une action terminée : on utilise le prétérit.',
    'Exemple : Yesterday, I **went** to school.',
  ]),
  generate: (rng, level) => {
    // Niveau 1 : les verbes les plus courants ; ensuite toutes les phrases.
    const pool = SENTENCES.filter((s) => (IRREGULAR_VERBS.find((v) => v.base === s.base)?.tier ?? 3) <= level);
    const s = rng.pick(pool.length > 0 ? pool : SENTENCES);
    const v = IRREGULAR_VERBS.find((x) => x.base === s.base) ?? IRREGULAR_VERBS[0];
    if (!v) throw new Error('verbe introuvable');
    const right = v.past[0] ?? v.base;
    const { answer, traps } = choice(rng, right, [
      { label: regularised(v.base), why: `« ${v.base} » est irrégulier : son prétérit est « ${right} ».` },
      { label: v.participle, why: `« ${v.participle} » est le participe passé : il s’emploie après have.` },
      { label: v.base, why: 'Yesterday, last… : l’action est passée, il faut le prétérit.' },
    ]);
    return {
      prompt: `Complète : ${s.before} … ${s.after}`,
      answer,
      traps,
      hint: 'L’action est terminée (regarde le début de la phrase) : quel temps faut-il ?',
      steps: [
        'Le début de la phrase montre que l’action est passée et terminée : on met le verbe au **prétérit**.',
        `Le verbe est « to ${v.base} », irrégulier : prétérit **${right}**.`,
        `${s.before} **${right}** ${s.after}`,
      ],
    };
  },
};

export const ANGLAIS_CHAPTERS: readonly Chapter[] = [
  ...ENGLISH_GRAMMAR_CHAPTERS.filter((c) => ['cm1', '6e'].includes(c.grade)),
  ENGLISH_PRESENTATION_CHAPTER,
  ...ENGLISH_BE_CHAPTERS,
  ENGLISH_TIME_CHAPTER,
  ENGLISH_FAMILY_CHAPTER,
  ENGLISH_TASTES_CHAPTER,
  ENGLISH_LISTENING_CHAPTER,
  ENGLISH_NOUN_GROUP_CHAPTER,
  ENGLISH_PLACES_CHAPTER,
  ENGLISH_DAY_CHAPTER,
  ENGLISH_SCHOOL_CHAPTER,
  ENGLISH_LISTENING_CM2_CHAPTER,
  {
    id: 'a5-verbes-irreguliers',
    subject: 'anglais',
    grade: '5e',
    domain: 'langue',
    title: 'Les verbes irréguliers',
    skills: [preterit, participle, sentence, REGULAR_PAST_SKILL],
  },
  ...ENGLISH_GRAMMAR_CHAPTERS.filter((c) => ['4e', '3e'].includes(c.grade)),
];
