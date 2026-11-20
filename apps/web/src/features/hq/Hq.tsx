import { useState } from 'react';
import { BADGES } from '@questeo/engine';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  BOSS_MEDAL_LABELS,
  COSMETIC_IDS,
  COSMETIC_KIND_LABELS,
  COSMETIC_KINDS,
  COSMETICS,
  HERO_NAMES,
  MAX_SHOWCASE,
  type CosmeticId,
  type CosmeticKind,
  type Hq,
  type HqLayout,
  type Profile,
} from '@questeo/shared';
import { ApiError, request } from '../../shared/api/client.ts';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { heroPoseSrc } from '../../design/assets.ts';
import { toggleShowcase, trophyLabel } from './trophies.ts';

const badgeTitle = (category: string) => BADGES.find((b) => b.category === category)?.title ?? category;

/** Comment obtenir un cosmétique verrouillé. */
function howToGet(id: CosmeticId): string {
  const s = COSMETICS[id].source;
  if (s.type === 'badge') return `Badge ${badgeTitle(s.badge)}, grade ${BOSS_MEDAL_LABELS[s.tier]}`;
  if (s.type === 'achat')
    return [s.rubies && `${s.rubies} rubis`, s.coins && `${s.coins} pièces`].filter(Boolean).join(' + ');
  return '';
}

/**
 * Mon QG : le héros en pied dans son décor, son titre, sa vitrine de 3 trophées ; la salle des
 * trophées (tout ce qui a été gagné) et la personnalisation (décor, cadre, titre).
 */
export function HqPage({ profile }: { readonly profile: Profile }) {
  const qc = useQueryClient();
  const key = ['hq', profile.id];
  const { data: hq } = useQuery({ queryKey: key, queryFn: () => request(api.hq, { params: { id: profile.id } }) });
  const { data: badges = [] } = useQuery({
    queryKey: ['badges', profile.id],
    queryFn: () => request(api.badges, { params: { id: profile.id } }),
  });
  const [toast, showToast] = useToast(3000);
  const fail = (err: unknown) => showToast(err instanceof ApiError ? err.message : 'Oups, réessaie.');
  const save = useMutation({
    mutationFn: (layout: HqLayout) => request(api.saveHq, { params: { id: profile.id }, body: layout }),
    onSuccess: (next: Hq) => qc.setQueryData(key, next),
    onError: fail,
  });
  const buy = useMutation({
    mutationFn: (cosmetic: CosmeticId) => request(api.buyCosmetic, { body: { profileId: profile.id, cosmetic } }),
    onSuccess: async (r) => {
      qc.setQueryData(key, r.hq);
      await qc.invalidateQueries({ queryKey: ['profiles'] });
      showToast('Acheté ! Tu peux l’installer dans ton QG.');
    },
    onError: fail,
  });
  const [kind, setKind] = useState<CosmeticKind>('fond');
  if (!hq)
    return (
      <PageShell title="Mon QG" nav={profile}>
        <p>Chargement…</p>
      </PageShell>
    );
  const { layout } = hq;
  const unlocked = new Set(hq.unlocked);
  const pose = heroPoseSrc(profile.hero, 'idle');
  const change = (patch: Partial<HqLayout>) => save.mutate({ ...layout, ...patch });

  return (
    <PageShell title="Mon QG" nav={profile}>
      <section
        aria-label="Mon QG"
        className="cartoon flex flex-col items-center gap-2 p-4"
        style={{ background: COSMETICS[layout.fond].look }}
      >
        {pose && (
          <img
            src={pose}
            alt={HERO_NAMES[profile.hero]}
            className="aspect-square w-full max-w-60 rounded-3xl border-[6px] object-contain"
            style={{ borderColor: COSMETICS[layout.cadre].look }}
          />
        )}
        <p className="font-display text-toon text-3xl tracking-wide text-white">{profile.name}</p>
        <p className="cartoon bg-surface px-3 py-1 font-bold">{COSMETICS[layout.titre].look}</p>
        <ul aria-label="Vitrine" className="grid w-full grid-cols-3 gap-2">
          {Array.from({ length: MAX_SHOWCASE }, (_, i) => layout.vitrine[i]).map((t, i) => (
            <li key={t ?? `vide-${i}`} className="cartoon bg-surface/90 min-h-16 p-2 text-center text-sm font-bold">
              {t ? trophyLabel(t, badges) : 'Emplacement libre'}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="trophees" className="flex flex-col gap-2">
        <h2 id="trophees" className="font-display text-2xl tracking-wide">
          Salle des trophées
        </h2>
        {hq.trophies.length === 0 && <p>Bats des boss et gagne des badges pour remplir ta salle des trophées !</p>}
        <p className="text-muted text-sm font-bold">
          Touche un trophée pour l’exposer dans ta vitrine ({MAX_SHOWCASE} au plus).
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hq.trophies.map((t) => (
            <li key={t}>
              <button
                type="button"
                aria-pressed={layout.vitrine.includes(t)}
                onClick={() => change({ vitrine: toggleShowcase(layout.vitrine, t, MAX_SHOWCASE) })}
                className="cartoon cartoon-press bg-surface aria-pressed:bg-gold w-full p-3 text-left font-bold"
              >
                {trophyLabel(t, badges)}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="perso" className="flex flex-col gap-2">
        <h2 id="perso" className="font-display text-2xl tracking-wide">
          Personnaliser
        </h2>
        <div role="tablist" aria-label="Type de cosmétique" className="flex flex-wrap gap-2">
          {COSMETIC_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={k === kind}
              onClick={() => setKind(k)}
              className="cartoon aria-selected:bg-accent bg-surface px-3 py-1 font-bold aria-selected:text-white"
            >
              {COSMETIC_KIND_LABELS[k]}
            </button>
          ))}
        </div>
        <ul
          role="tabpanel"
          aria-label={COSMETIC_KIND_LABELS[kind]}
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {COSMETIC_IDS.filter((id) => COSMETICS[id].kind === kind).map((id) => {
            const c = COSMETICS[id];
            const chosen = layout[kind] === id;
            const open = unlocked.has(id);
            return (
              <li key={id} className="cartoon bg-surface flex flex-col gap-2 p-3">
                <span className="flex items-center gap-2">
                  {kind !== 'titre' && (
                    <span
                      aria-hidden
                      className="border-outline h-8 w-8 rounded-lg border-2"
                      style={{ background: c.look }}
                    />
                  )}
                  <span className="font-display text-lg tracking-wide">{c.name}</span>
                </span>
                {open ? (
                  <GameButton size="sm" disabled={chosen} onClick={() => change({ [kind]: id })}>
                    {chosen ? 'Installé' : 'Installer'}
                  </GameButton>
                ) : c.source.type === 'achat' ? (
                  <GameButton size="sm" variant="success" onClick={() => buy.mutate(id)}>
                    Acheter · {howToGet(id)}
                  </GameButton>
                ) : (
                  <p className="text-muted text-sm font-bold">À débloquer : {howToGet(id)}</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      {toast}
    </PageShell>
  );
}
