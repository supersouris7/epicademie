import { getChapter } from '@questeo/content';
import { BOSS_MEDAL_LABELS, HERO_NAMES, type BadgeProgress } from '@questeo/shared';

/** Libellé d'un trophée (« boss:… », « badge:… », « heros:… ») pour l'affichage et l'accessibilité. */
export function trophyLabel(id: string, badges: readonly BadgeProgress[]): string {
  const [type, key = ''] = id.split(':');
  if (type === 'boss') return `Boss vaincu : ${getChapter(key)?.title ?? key}`;
  if (type === 'badge') {
    const b = badges.find((x) => x.category === key);
    return b ? `Badge ${b.title}${b.tier ? ` (${BOSS_MEDAL_LABELS[b.tier]})` : ''}` : `Badge ${key}`;
  }
  return `Acad-Héros : ${(HERO_NAMES as Partial<Record<string, string>>)[key] ?? key}`;
}

/** Ajoute ou retire un trophée de la vitrine (3 au plus ; le plus ancien cède sa place). */
export function toggleShowcase(vitrine: readonly string[], id: string, max: number): string[] {
  if (vitrine.includes(id)) return vitrine.filter((v) => v !== id);
  return [...vitrine, id].slice(-max);
}
