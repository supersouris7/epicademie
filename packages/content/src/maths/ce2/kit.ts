import { objectiveOf } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { Advice, DomainId, EvalChapter, Level, QuestionDraft, Rich, Skill } from '../../types.ts';

/**
 * Outils des fondamentaux du CE2. Programme du cycle 2 (CE2), BO n°41 du 31 octobre 2024 : chaque notion
 * cite l'objectif officiel dont elle relève (domaine entre crochets dans le commentaire du chapitre).
 */
const objective = objectiveOf('ce2');

type Generate = (rng: Rng, level: Level) => QuestionDraft;

export const NAMES = ['Alex', 'Tao', 'Lina', 'Ayla', 'Inès', 'Noah', 'Jade', 'Sacha', 'Léo', 'Maël', 'Zoé', 'Nina'];

/** Notion CE2 : `skill(id, titre, objectif officiel, mémo, générateur, options)`. */
export const skill = (
  id: string,
  title: string,
  officialObjective: string,
  memo: readonly Rich[],
  generate: Generate,
  options: { readonly mental?: true; readonly advice?: Advice } = {},
): Skill => ({ id, title, lesson: { memo, source: objective(officialObjective) }, generate, ...options });

/** Chapitre de fondamentaux du CE2 (sans combat de boss). */
export const chapter = (id: string, domain: DomainId, title: string, skills: readonly Skill[]): EvalChapter => ({
  id,
  subject: 'maths',
  grade: 'ce2',
  domain,
  title,
  skills,
});
