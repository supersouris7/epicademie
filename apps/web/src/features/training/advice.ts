import { getChapterOfSkill } from '@questeo/content';
import type { SkillProgress } from '@questeo/shared';

/** Réponses d'une partie pour une notion. */
export interface RecapRow {
  readonly skillId: string;
  readonly answered: number;
  readonly correct: number;
}

/** Notion conseillée et d'où vient le conseil (cette partie, ou l'historique de l'élève). */
export interface Advice {
  readonly skillId: string;
  readonly chapterId: string;
  readonly from: 'partie' | 'historique';
}

/** En dessous de 80 % de réussite (au moins 3 réponses), une notion de l'historique est à reprendre. */
const WEAK_RATE = 0.8;

/**
 * Entraînement conseillé en fin de partie (décision du 21/11/2026) : la notion la plus ratée de
 * la partie ; sans erreur, la notion la plus faible de l'élève (historique) ; sinon, rien.
 * Seules les notions d'entraînement comptent (pas les questions propres aux boss).
 */
export function adviceFor(rows: readonly RecapRow[], history: readonly SkillProgress[] = []): Advice | null {
  const trainable = (id: string) => getChapterOfSkill(id)?.id;
  const missed = rows
    .filter((r) => r.correct < r.answered && trainable(r.skillId))
    .sort(
      (a, b) => b.answered - b.correct - (a.answered - a.correct) || a.correct / a.answered - b.correct / b.answered,
    );
  const fromGame = missed[0];
  if (fromGame) return { skillId: fromGame.skillId, chapterId: trainable(fromGame.skillId) ?? '', from: 'partie' };
  const weakest = history
    .filter((s) => s.attempts >= 3 && s.correct / s.attempts < WEAK_RATE && trainable(s.skillId))
    .sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)[0];
  return weakest ? { skillId: weakest.skillId, chapterId: trainable(weakest.skillId) ?? '', from: 'historique' } : null;
}
