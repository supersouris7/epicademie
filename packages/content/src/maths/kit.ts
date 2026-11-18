import type { Grade } from '@questeo/shared';
import { objectiveOf } from '../build.ts';
import { fmt } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Advice, BossContent, Chapter, DomainId, Level, QuestionDraft, Rich, Skill, Tool } from '../types.ts';

/**
 * Petits outils partagés par les programmes du CM1 à la 3e : déclarer une notion ou un chapitre en
 * une ligne, prénoms et contextes des problèmes.
 */

export const NAMES = ['Alex', 'Tao', 'Lina', 'Ayla', 'Inès', 'Noah', 'Jade', 'Sacha', 'Léo', 'Maël', 'Zoé', 'Nina'];
export const MINUS = '−';
/** Entier relatif écrit avec le signe moins typographique. */
export const sgn = (n: number) => (n < 0 ? `${MINUS}${Math.abs(n)}` : String(n));
/** Entier relatif entre parenthèses s'il est négatif : (−3). */
export const par = (n: number) => (n < 0 ? `(${MINUS}${Math.abs(n)})` : String(n));
/** Nombre entier avec espaces fines des milliers (dès 10 000, comme `fmt`). */
export const big = (n: number) => fmt(n);

interface SkillOptions {
  readonly mental?: true;
  readonly advice?: Advice;
  readonly tools?: readonly Tool[];
}

type Generate = (rng: Rng, level: Level) => QuestionDraft;

/**
 * Fabrique de notions d'une classe : `skill(id, titre, objectif officiel, mémo, générateur, options)`.
 * L'objectif cité est celui du programme de la classe (BO).
 */
export function skillsOf(grade: Exclude<Grade, '5e' | 'adulte'>) {
  const objective = objectiveOf(grade);
  return (
    id: string,
    title: string,
    officialObjective: string,
    memo: readonly Rich[],
    generate: Generate,
    options: SkillOptions = {},
  ): Skill => ({ id, title, lesson: { memo, source: objective(officialObjective) }, generate, ...options });
}

/** Chapitre de maths d'une classe, avec son combat de boss. */
export const chapterOf =
  (grade: Grade) =>
  (id: string, domain: DomainId, title: string, skills: readonly Skill[], boss?: BossContent): Chapter => ({
    id,
    subject: 'maths',
    grade,
    domain,
    title,
    skills,
    ...(boss ? { boss } : {}),
  });

/** Boss : problèmes en contexte puis piège(s). */
export const bossOf = (problems: readonly Skill[], trapSkills: readonly Skill[]): BossContent => ({
  problems,
  traps: trapSkills,
});

/** Pluriel simple : « 3 billes », « 1 bille ». */
export const pl = (n: number, word: string, plural = `${word}s`) => `${big(n)} ${n > 1 ? plural : word}`;
