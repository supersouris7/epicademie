import { useQuery } from '@tanstack/react-query';
import { getChapter } from '@questeo/content';
import { api, AVAILABLE_HEROES, BOSS_MEDAL_LABELS, HERO_NAMES, type BossRecord } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { BadgeList } from '../../shared/ui/game/BadgeList.tsx';
import { BOSS_MEDAL_ICONS } from '../../design/bosses.ts';

/**
 * Trophées et badges du joueur (dans « Mes progrès ») : boss vaincus avec leur meilleure
 * médaille, Acad-Héros trouvés dans les coffres, puis les badges.
 */
export function TrophiesSection({
  profileId,
  records,
}: {
  readonly profileId: string;
  readonly records: readonly BossRecord[];
}) {
  const { data } = useQuery({
    queryKey: ['heroes', profileId],
    queryFn: () => request(api.ownedHeroes, { params: { id: profileId } }),
  });
  const heroes = data?.heroes ?? [];
  return (
    <section aria-labelledby="trophees" className="cartoon bg-surface flex flex-col gap-3 p-3">
      <h2 id="trophees" className="font-display text-2xl tracking-wide">
        Trophées et badges
      </h2>
      <h3 className="font-display text-xl tracking-wide">Boss vaincus ({records.length})</h3>
      {records.length === 0 ? (
        <p className="text-muted font-bold">Bats un boss de chapitre pour gagner ton premier trophée !</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Boss vaincus">
          {records.map((r) => (
            <li
              key={r.chapterId}
              className="bg-surface-2 flex items-center gap-2 rounded-2xl p-2"
              aria-label={`${getChapter(r.chapterId)?.title ?? r.chapterId} : médaille ${BOSS_MEDAL_LABELS[r.bestMedal]}`}
            >
              <GameIcon id={BOSS_MEDAL_ICONS[r.bestMedal]} size={40} />
              <span className="min-w-0 flex-1 font-bold">{getChapter(r.chapterId)?.title ?? r.chapterId}</span>
              {r.wins > 1 && <span className="text-muted text-sm font-bold">× {r.wins}</span>}
            </li>
          ))}
        </ul>
      )}
      <h3 className="font-display text-xl tracking-wide">
        Acad-Héros trouvés ({heroes.length} sur {AVAILABLE_HEROES.length})
      </h3>
      <ul className="flex flex-wrap gap-2" aria-label="Acad-Héros trouvés">
        {heroes.map((h) => (
          <li key={h} className="bg-surface-2 rounded-full px-3 py-1 font-bold">
            {HERO_NAMES[h]}
          </li>
        ))}
      </ul>
      <BadgesBlock profileId={profileId} />
    </section>
  );
}

/** Badges du joueur (grade atteint, prochain objectif), sous les trophées. */
function BadgesBlock({ profileId }: { readonly profileId: string }) {
  const { data: badges } = useQuery({
    queryKey: ['badges', profileId],
    queryFn: () => request(api.badges, { params: { id: profileId } }),
  });
  if (!badges) return null;
  return (
    <>
      <h3 className="font-display text-xl tracking-wide">Badges</h3>
      <BadgeList badges={badges} />
    </>
  );
}
