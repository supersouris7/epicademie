import { createRng } from './rng.ts';
import { CE2_CHAPTERS } from './maths/ce2/index.ts';
import type { Level, Question, Skill } from './types.ts';

export { CE2_CHAPTERS };

const skills = new Map(CE2_CHAPTERS.flatMap((c) => c.skills.map((s) => [s.id, s] as const)));
const duplicates = CE2_CHAPTERS.flatMap((c) => c.skills).length !== skills.size;
if (duplicates) throw new Error('Identifiant de notion CE2 en double');

export const getCe2Chapter = (id: string) => CE2_CHAPTERS.find((c) => c.id === id);
export const getCe2Skill = (id: string): Skill | undefined => skills.get(id);

/** Génère une question de fondamentaux CE2 (déterministe pour un triplet notion / niveau / graine). */
export function generateCe2(skillId: string, level: Level, seed: number): Question {
  const skill = skills.get(skillId);
  if (!skill) throw new Error(`Notion CE2 inconnue : ${skillId}`);
  return { traps: [], targetSeconds: 20, ...skill.generate(createRng(seed), level), skillId, level, seed };
}
