import { BOSS_MEDAL_LABELS, type BadgeProgress } from '@epicademie/shared';
import { badgeSrc } from '../../../design/badges.ts';

/**
 * Badges du joueur : médaille du grade atteint (bronze, argent, or, diamant), ou celle du bronze
 * grisée tant qu'aucun grade n'est atteint, puis prochain objectif. Utilisé dans « Mes progrès ».
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
          <img
            src={badgeSrc(b.category, b.tier ?? 'bronze')}
            alt=""
            aria-hidden
            className={`h-20 w-20 shrink-0 object-contain ${b.tier ? '' : 'grayscale'}`}
          />
          <span className="flex min-w-0 flex-col">
            <span className="font-display text-lg tracking-wide">
              {b.title}
              {b.tier && <span className="text-gold ml-2 text-base">{BOSS_MEDAL_LABELS[b.tier]}</span>}
            </span>
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
