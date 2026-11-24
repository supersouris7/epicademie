import { getChapterOfSkill } from '@epicademie/content';
import { RECENT_ANSWERS } from '@epicademie/engine';
import type { SkillProgress } from '@epicademie/shared';

/** Réponses d'une partie pour une notion. */
export interface RecapRow {
  readonly skillId: string;
  readonly answered: number;
  readonly correct: number;
}

/** Notion souvent ratée, à proposer à l'entraînement. */
export interface Advice {
  readonly skillId: string;
  readonly chapterId: string;
  /** Erreurs parmi les dernières réponses (premier essai) de l'élève sur la notion. */
  readonly errors: number;
}

/** Nombre d'erreurs, parmi les `RECENT_ANSWERS` (10) dernières réponses, à partir duquel une notion est « souvent ratée ». */
export const OFTEN_MISSED = 3;

/** Erreurs de l'élève parmi ses 10 dernières réponses (premier essai) sur une notion. */
export function recentErrors(progress: SkillProgress): number {
  return progress.recent.slice(-RECENT_ANSWERS).filter((ok) => !ok).length;
}

/**
 * Notion à proposer en fin de partie (décision du 22/11/2026) : une notion est « souvent ratée »
 * quand l'élève a fait au moins 3 erreurs sur ses 10 dernières réponses (historique à jour, partie
 * comprise), et seulement dans la ou les matières de la partie jouée (retour #47 : jamais Fractions après
 * un test d'anglais). On prend en priorité une notion jouée dans la partie, puis la plus ratée. Seules les
 * notions d'entraînement comptent (pas les questions propres aux boss). Sinon : rien.
 */
export function oftenMissed(rows: readonly RecapRow[], history: readonly SkillProgress[] = []): Advice | null {
  const played = new Set(rows.map((r) => r.skillId));
  const subjects = new Set(rows.map((r) => getChapterOfSkill(r.skillId)?.subject));
  const candidates = history
    .map((s) => {
      const chapter = getChapterOfSkill(s.skillId);
      return { s, errors: recentErrors(s), chapterId: chapter?.id, subject: chapter?.subject };
    })
    .filter((c) => c.errors >= OFTEN_MISSED && c.chapterId !== undefined && subjects.has(c.subject))
    .sort(
      (a, b) =>
        Number(played.has(b.s.skillId)) - Number(played.has(a.s.skillId)) ||
        b.errors - a.errors ||
        a.s.skillId.localeCompare(b.s.skillId),
    );
  const best = candidates[0];
  return best ? { skillId: best.s.skillId, chapterId: best.chapterId ?? '', errors: best.errors } : null;
}
