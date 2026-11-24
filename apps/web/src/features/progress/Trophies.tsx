import { useQuery } from '@tanstack/react-query';
import { chaptersOf, getChapter } from '@epicademie/content';
import { api, BOSS_MEDAL_LABELS, SUBJECTS, type BossRecord, type Grade } from '@epicademie/shared';
import { useChapterTrophies } from '../../shared/api/queries.ts';
import { request } from '../../shared/api/client.ts';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { BadgeList } from '../../shared/ui/game/BadgeList.tsx';
import { BOSS_MEDAL_ICONS } from '../../design/bosses.ts';

/**
 * Trophées et badges du joueur (dans « Mes progrès ») : boss vaincus avec leur meilleure
 * médaille, puis les badges.
 */
export function TrophiesSection({
  profileId,
  grade,
  records,
}: {
  readonly profileId: string;
  /** Classe jouée : ses chapitres sont montrés grisés tant que non validés. */
  readonly grade: Grade;
  readonly records: readonly BossRecord[];
}) {
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
      <ChapterTrophies profileId={profileId} grade={grade} />
      <BadgesBlock profileId={profileId} />
    </section>
  );
}

/** Trophées de chapitre : un par Épreuve réussie ; les chapitres de la classe jouée, grisés tant que non obtenus. */
function ChapterTrophies({ profileId, grade }: { readonly profileId: string; readonly grade: Grade }) {
  const { data } = useChapterTrophies(profileId);
  const won = new Set((data ?? []).map((t) => t.chapterId));
  const ids = new Set([
    ...SUBJECTS.filter((s) => s.available).flatMap((s) => chaptersOf(s.id, grade).map((c) => c.id)),
    ...won,
  ]);
  const chapters = [...ids].flatMap((id) => getChapter(id) ?? []);
  if (chapters.length === 0) return null;
  return (
    <>
      <h3 className="font-display text-xl tracking-wide">
        Chapitres validés ({chapters.filter((c) => won.has(c.id)).length}/{chapters.length})
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="Trophées de chapitre">
        {chapters.map((c) => {
          const has = won.has(c.id);
          return (
            <li
              key={c.id}
              className={`bg-surface-2 flex items-center gap-2 rounded-2xl p-2 ${has ? '' : 'opacity-70'}`}
              aria-label={`Trophée du chapitre ${c.title} : ${has ? 'obtenu' : 'pas encore gagné'}`}
            >
              <GameIcon id="rewards-collectibles-trophy" size={40} className={has ? '' : 'grayscale'} />
              <span className="min-w-0 flex-1 font-bold">{c.title}</span>
              <span className="text-muted text-sm font-bold">{has ? 'Validé' : 'Épreuve à réussir'}</span>
            </li>
          );
        })}
      </ul>
    </>
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
