import { useState } from 'react';
import { useNavigate } from 'react-router';
import { THEMES, type Profile, type Theme } from '@questeo/shared';
import { useDeleteProfile, useUpdateProfile } from '../api/profiles.ts';
import { GameButton } from '../components/game/GameButton.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { useSession } from '../store/session.ts';

const THEME_LABELS: Record<Theme, string> = { auto: 'Auto', light: 'Clair', dark: 'Sombre' };

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="cartoon bg-surface flex min-h-16 cursor-pointer items-center justify-between gap-4 px-5">
      <span className="font-display text-xl tracking-wide">{label}</span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className="border-outline bg-surface-2 peer-checked:bg-success relative h-9 w-16 rounded-full border-4 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-7 peer-focus-visible:ring-4"
      />
    </label>
  );
}

export function Settings({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const update = useUpdateProfile(profile.id);
  const remove = useDeleteProfile();
  const selectProfile = useSession((s) => s.selectProfile);
  const [confirming, setConfirming] = useState(false);

  const deleteProfile = async () => {
    await remove.mutateAsync(profile.id);
    selectProfile(null);
    void navigate('/');
  };

  return (
    <PageShell title="Paramètres" back="/hub">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Thème</h2>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Thème">
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              role="radio"
              aria-checked={profile.theme === theme}
              onClick={() => update.mutate({ theme })}
              className={`cartoon cartoon-press font-display min-h-16 text-lg ${profile.theme === theme ? 'bg-accent text-white' : 'bg-surface'}`}
            >
              {THEME_LABELS[theme]}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Son</h2>
        <Toggle label="Effets sonores" checked={profile.soundOn} onChange={(soundOn) => update.mutate({ soundOn })} />
        <Toggle label="Musique" checked={profile.musicOn} onChange={(musicOn) => update.mutate({ musicOn })} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Profil</h2>
        <GameButton variant="surface" onClick={() => void navigate(`/profils/${profile.id}/modifier`)}>
          Modifier mon prénom et mon avatar
        </GameButton>
        <GameButton variant="surface" onClick={() => void navigate('/')}>
          Changer de joueur
        </GameButton>
        {confirming ? (
          <div className="cartoon bg-surface flex flex-col gap-3 p-4">
            <p className="text-lg font-bold">
              Supprimer {profile.name} ? Toute sa progression sera perdue définitivement.
            </p>
            <div className="flex gap-3">
              <GameButton variant="danger" disabled={remove.isPending} onClick={() => void deleteProfile()}>
                Oui, supprimer
              </GameButton>
              <GameButton variant="surface" onClick={() => setConfirming(false)}>
                Annuler
              </GameButton>
            </div>
          </div>
        ) : (
          <GameButton variant="danger" onClick={() => setConfirming(true)}>
            Supprimer ce profil
          </GameButton>
        )}
      </section>

      <GameButton variant="surface" className="self-start" onClick={() => void navigate('/a-propos')}>
        À propos et crédits
      </GameButton>
    </PageShell>
  );
}
