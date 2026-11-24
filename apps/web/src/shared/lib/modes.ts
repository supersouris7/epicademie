import type { ModeCategory, ModeId, ModeInfo } from '@epicademie/shared';
import type { MoodId } from '../ui/mascot/moods.ts';

/** L'humeur de Questy sert d'icône à chaque mode. */
export const MODE_MOODS: Record<ModeId, MoodId> = {
  entrainement: 'ok',
  boss: 'angry',
  chrono: 'wow',
  survie: 'cool',
  arene: 'angry',
  evaluation: 'proud',
};

export const CATEGORY_COLORS: Record<ModeCategory, string> = {
  apprendre: 'var(--mode-apprendre)',
  defis: 'var(--mode-defis)',
  multi: 'var(--mode-multi)',
};

/** Longueur maximale de la bulle de Questy au choix de la matière (lisible sur smartphone, sans coupe). */
export const SETUP_BUBBLE_MAX = 90;

/** Phrase de Questy au choix de la matière : courte, ton coach. */
export function setupBubble(mode: Pick<ModeInfo, 'id' | 'pitch'>): string {
  if (mode.id === 'entrainement') return 'Une série sans faute t’offre un coffre ! Choisis ta matière.';
  return `${mode.pitch}. Choisis ta matière !`;
}
