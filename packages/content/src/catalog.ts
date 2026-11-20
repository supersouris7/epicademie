import type { Grade } from '@questeo/shared';
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
/** Problèmes et pièges des boss : générables, mais hors entraînement et hors répétition espacée. */
const bossSkills = new Map<string, { skill: Skill; chapter: Chapter }>();
for (const chapter of CHAPTERS) {
  for (const skill of [...(chapter.boss?.problems ?? []), ...(chapter.boss?.traps ?? [])]) {
    if (skills.has(skill.id) || bossSkills.has(skill.id)) throw new Error(`Identifiant en double : ${skill.id}`);
    bossSkills.set(skill.id, { skill, chapter });
  }
}

export const getSkill = (id: string) => skills.get(id)?.skill;
export const getChapterOfSkill = (id: string) => skills.get(id)?.chapter;
export const getChapter = (id: string) => CHAPTERS.find((c) => c.id === id);
/** Chapitres d'une matière, d'une classe donnée ou de toutes. */
export const chaptersOf = (subject: string, grade?: Grade) =>
  CHAPTERS.filter((c) => c.subject === subject && (grade === undefined || c.grade === grade));
/** Classes qui ont du contenu dans une matière, dans l'ordre de la scolarité. */
export const gradesOf = (subject: string): Grade[] => {
  const order: readonly Grade[] = ['cm1', 'cm2', '6e', '5e', '4e', '3e', 'adulte'];
  return order.filter((g) => CHAPTERS.some((c) => c.subject === subject && c.grade === g));
};
export const allSkillIds = () => [...skills.keys()];

/** Notion d'entraînement ou question de boss (pour l'affichage et la correction). */
export const getAnySkill = (id: string) => skills.get(id)?.skill ?? bossSkills.get(id)?.skill;
export const isBossSkill = (id: string) => bossSkills.has(id);
/** Chapitre d'une notion d'entraînement ou d'une question de boss (suivi des apprentissages). */
export const chapterOfAnySkill = (id: string) => (skills.get(id) ?? bossSkills.get(id))?.chapter;
/** Classe d'une notion d'entraînement ou d'une question de boss. */
export const gradeOfSkill = (id: string): Grade | undefined => (skills.get(id) ?? bossSkills.get(id))?.chapter.grade;

/** Toutes les notions (entraînement et questions de boss), avec leur chapitre. */
export const allSkillEntries = () => [
  ...[...skills.values()].map((e) => ({ ...e, boss: false })),
  ...[...bossSkills.values()].map((e) => ({ ...e, boss: true })),
];

/** Chapitres qui ont un combat de boss. */
export const bossChapters = () => CHAPTERS.filter((c) => c.boss);

/** Générateurs du combat d'un chapitre (mobs = notions d'entraînement). */
export function battlePools(chapterId: string) {
  const chapter = getChapter(chapterId);
  if (!chapter?.boss) return null;
  return {
    mobs: chapter.skills.map((s) => s.id),
    problems: chapter.boss.problems.map((s) => s.id),
    traps: chapter.boss.traps.map((s) => s.id),
  };
}

/** Génère la question (déterministe pour un triplet notion / niveau / graine). */
export function generate(skillId: string, level: Level, seed: number): Question {
  const entry = skills.get(skillId) ?? bossSkills.get(skillId);
  if (!entry) throw new Error(`Notion inconnue : ${skillId}`);
  const draft = entry.skill.generate(createRng(seed), level);
  return { traps: [], targetSeconds: 20, ...draft, skillId, level, seed };
}
