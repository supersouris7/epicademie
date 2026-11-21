import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, type Profile, type RankingRow } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';

/** Classements : chacun trie les joueurs et dit quoi afficher. */
const BOARDS = {
  niveau: {
    label: 'Niveau',
    sort: (r: RankingRow) => r.xp,
    show: (r: RankingRow) => `Niv. ${r.level} · ${r.xp.toLocaleString('fr-FR')} XP`,
  },
  semaine: {
    label: 'Cette semaine',
    sort: (r: RankingRow) => r.weekXp,
    show: (r: RankingRow) => `${r.weekXp.toLocaleString('fr-FR')} XP cette semaine`,
  },
  boss: {
    label: 'Boss',
    sort: (r: RankingRow) => r.bosses * 10_000 + r.diamondMedals * 100 + r.goldMedals,
    show: (r: RankingRow) => `${r.bosses} boss vaincus · ${r.diamondMedals} diamant · ${r.goldMedals} or`,
  },
  badges: {
    label: 'Badges',
    sort: (r: RankingRow) => r.badgePoints * 10_000 + r.goldSkills,
    show: (r: RankingRow) => `${r.badgePoints} points de badges · ${r.goldSkills} notions en or`,
  },
  defis: {
    label: 'Défis',
    sort: (r: RankingRow) => r.chrono + r.survie,
    show: (r: RankingRow) => `Contre-la-montre : ${r.chrono} · Survie : ${r.survie}`,
  },
} as const;
type Board = keyof typeof BOARDS;

/**
 * Se comparer (depuis Multijoueur) : classements avec sa famille et ses amis actifs (jamais
 * d'autres enfants) : niveau, XP de la semaine, boss, badges, records des défis.
 */
export function Ranking({ profile }: { readonly profile: Profile }) {
  const [board, setBoard] = useState<Board>('niveau');
  const { data } = useQuery({
    queryKey: ['ranking', profile.id],
    queryFn: () => request(api.ranking, { params: { id: profile.id } }),
  });
  const b = BOARDS[board];
  const rows = [...(data ?? [])].sort((x, y) => b.sort(y) - b.sort(x) || x.name.localeCompare(y.name, 'fr'));
  return (
    <PageShell title="Se comparer" back="/multi" nav={profile}>
      <div role="tablist" aria-label="Classements" className="flex flex-wrap gap-2">
        {(Object.keys(BOARDS) as Board[]).map((id) => (
          <GameButton
            key={id}
            size="sm"
            role="tab"
            aria-selected={board === id}
            variant={board === id ? 'primary' : 'surface'}
            onClick={() => setBoard(id)}
          >
            {BOARDS[id].label}
          </GameButton>
        ))}
      </div>
      {data && data.length <= 1 && (
        <p className="text-muted font-bold">
          Personne avec qui se comparer pour l’instant : ajoute un ami dans « Mes amis » !
        </p>
      )}
      <ol className="flex flex-col gap-2" aria-label={`Classement : ${b.label}`}>
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={`cartoon flex items-center gap-3 p-2.5 ${r.me ? 'bg-accent text-white' : 'bg-surface'}`}
          >
            <span className="font-display w-8 text-center text-2xl">{i + 1}</span>
            <CharacterAvatar avatar={r.avatar} size={44} />
            <span className="min-w-0 flex-1">
              <span className="font-display block truncate text-lg tracking-wide">
                {r.name}
                {r.me && ' (toi)'}
                {r.friend && (
                  <span role="img" aria-label="ami d’une autre famille" className="ml-1 text-base">
                    🤝
                  </span>
                )}
              </span>
              <span className={`text-sm font-bold ${r.me ? '' : 'text-muted'}`}>{b.show(r)}</span>
            </span>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
