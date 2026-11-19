import { generate, type Level, type Question } from '@questeo/content';
import { safeStorage } from './storage.ts';

/** Énoncés retenus par notion et par profil (sur l'appareil), pour ne pas les reposer de sitôt. */
const KEEP = 40;
const key = (profileId: string, skillId: string) => `questeo:recent:${profileId}:${skillId}`;

export function recentPrompts(profileId: string, skillId: string): string[] {
  try {
    const raw = safeStorage.get(key(profileId, skillId));
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberPrompt(profileId: string, skillId: string, prompt: string): void {
  const list = [...recentPrompts(profileId, skillId).filter((p) => p !== prompt), prompt].slice(-KEEP);
  safeStorage.set(key(profileId, skillId), JSON.stringify(list));
}

/**
 * Question sans doublon : jamais un énoncé déjà posé dans la partie (`seen`), et si possible pas un des
 * dernières parties (`recent`). Une notion à peu d'énoncés possibles finit par en reposer d'anciens.
 */
export function freshQuestion(
  skillId: string,
  level: Level,
  seed: number,
  seen: ReadonlySet<string>,
  recent: readonly string[],
  nextSeed: () => number,
): { question: Question; seed: number } {
  let best: { question: Question; seed: number } | null = null;
  let s = seed;
  for (let i = 0; i < 60; i++) {
    const question = generate(skillId, level, s);
    if (!seen.has(question.prompt)) {
      if (!recent.includes(question.prompt)) return { question, seed: s };
      best ??= { question, seed: s };
    }
    s = nextSeed();
  }
  return best ?? { question: generate(skillId, level, seed), seed };
}
