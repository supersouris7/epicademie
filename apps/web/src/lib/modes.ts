import type { ModeCategory, ModeId } from '@questeo/shared';
import type { MoodId } from '../components/mascot/moods.ts';

/** L'humeur de Questy sert d'icône à chaque mode. */
export const MODE_MOODS: Record<ModeId, MoodId> = {
  revisions: 'happy',
  entrainement: 'ok',
  boss: 'angry',
  atelier: 'dizzy',
  chrono: 'wow',
  survie: 'cool',
  defi: 'proud',
  bilan: 'wink',
  arene: 'angry',
  raid: 'proud',
  quiz: 'laugh',
  course: 'wow',
};

export const CATEGORY_COLORS: Record<ModeCategory, string> = {
  apprendre: 'var(--subject-geographie)',
  defis: 'var(--primary)',
  multi: 'var(--accent)',
};
