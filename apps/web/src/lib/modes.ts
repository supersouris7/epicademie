import type { ModeCategory, ModeId } from '@questeo/shared';
import type { MoodId } from '../components/mascot/moods.ts';

/** L'humeur de Questy sert d'icône à chaque mode. */
export const MODE_MOODS: Record<ModeId, MoodId> = {
  entrainement: 'ok',
  boss: 'angry',
  chrono: 'wow',
  survie: 'cool',
  arene: 'angry',
  raid: 'proud',
  quiz: 'laugh',
  course: 'wow',
};

export const CATEGORY_COLORS: Record<ModeCategory, string> = {
  apprendre: 'var(--mode-apprendre)',
  defis: 'var(--mode-defis)',
  multi: 'var(--mode-multi)',
};
