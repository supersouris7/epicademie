import { mastery, MASTERY_LABELS, type Mastery } from '@questeo/engine';
import type { SkillProgress } from '@questeo/shared';

export interface ChapterProgress {
  readonly total: number;
  readonly acquired: number;
  readonly started: number;
  readonly due: number;
}

export function chapterProgress(
  skillIds: readonly string[],
  states: ReadonlyMap<string, SkillProgress>,
  today: string,
): ChapterProgress {
  let acquired = 0;
  let started = 0;
  let due = 0;
  for (const id of skillIds) {
    const s = states.get(id);
    if (!s) continue;
    started++;
    if (s.stage === 3) acquired++;
    if (s.due !== null && s.due <= today) due++;
  }
  return { total: skillIds.length, acquired, started, due };
}

export const MASTERY_COLORS: Record<Mastery, string> = {
  'non-evalue': 'var(--text-muted)',
  insuffisante: 'var(--danger)',
  fragile: 'var(--primary)',
  satisfaisante: 'var(--accent)',
  'tres-bonne': 'var(--success)',
};

export function masteryOf(s: SkillProgress | undefined): { id: Mastery; label: string; color: string } {
  const id = s ? mastery(s) : 'non-evalue';
  return { id, label: MASTERY_LABELS[id], color: MASTERY_COLORS[id] };
}
