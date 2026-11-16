import { createRng } from './rng.ts';
import { MATHS_CHAPTERS } from './maths/index.ts';
import type { Chapter, Level, Question, Skill } from './types.ts';

export const CHAPTERS: readonly Chapter[] = [...MATHS_CHAPTERS];

const skills = new Map<string, { skill: Skill; chapter: Chapter }>();
for (const chapter of CHAPTERS) {
  for (const skill of chapter.skills) {
    if (skills.has(skill.id)) throw new Error(`Identifiant de notion en double : ${skill.id}`);
    skills.set(skill.id, { skill, chapter });
  }
}

export const getSkill = (id: string) => skills.get(id)?.skill;
export const getChapterOfSkill = (id: string) => skills.get(id)?.chapter;
export const getChapter = (id: string) => CHAPTERS.find((c) => c.id === id);
export const chaptersOf = (subject: string) => CHAPTERS.filter((c) => c.subject === subject);
export const allSkillIds = () => [...skills.keys()];

/** Génère la question (déterministe pour un triplet notion / niveau / graine). */
export function generate(skillId: string, level: Level, seed: number): Question {
  const entry = skills.get(skillId);
  if (!entry) throw new Error(`Notion inconnue : ${skillId}`);
  const draft = entry.skill.generate(createRng(seed), level);
  return { traps: [], targetSeconds: 20, ...draft, skillId, level, seed };
}
