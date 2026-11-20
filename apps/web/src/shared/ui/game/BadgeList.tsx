import { BOSS_MEDAL_LABELS, type BadgeProgress } from '@questeo/shared';
import { BOSS_MEDAL_ICONS } from '../../../design/bosses.ts';
import { GameIcon } from './GameIcon.tsx';

/**
 * Badges du joueur : grade atteint (bronze, argent, or, diamant) et prochain objectif. Utilisé
 * dans « Mes progrès » et la salle des trophées. Grades = mêmes icônes que les médailles de boss.
 */
export function BadgeList({ badges }: { readonly badges: readonly BadgeProgress[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((b) => (
        <li
          key={b.category}
          className={`cartoon bg-surface-2 flex items-center gap-3 p-3 ${b.tier ? '' : 'opacity-70'}`}
          aria-label={`Badge ${b.title} : ${b.tier ? BOSS_MEDAL_LABELS[b.tier] : 'pas encore gagné'}`}
        >
          {b.tier ? (
            <GameIcon id={BOSS_MEDAL_ICONS[b.tier]} size={44} />
          ) : (
            <span className="bg-surface flex h-11 w-11 items-center justify-center rounded-full text-xl" aria-hidden>
              ?
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="font-display text-lg tracking-wide">{b.title}</span>
            <span className="text-muted text-sm">{b.how}</span>
            <span className="text-sm font-bold">
              {b.next === null ? 'Diamant atteint !' : `${b.value} / ${b.next} pour le grade suivant`}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
