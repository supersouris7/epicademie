import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Profile } from '@questeo/shared';
import { useDeleteProfile, useUpdateProfile } from '../profiles/index.ts';
import { logout, useParentGate, useSetMe } from '../account/index.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useSession } from '../../shared/lib/session.ts';
import { fullscreenSupported, useFullscreenPreference } from '../../shared/lib/fullscreen.ts';

/** Interrupteur accessible : une vraie case à cocher, dessinée en bascule. */
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

/** Paramètres du joueur : son, plein écran, profil (modifier, changer de joueur, déconnecter l'appareil). */
export function Settings({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const update = useUpdateProfile(profile.id);
  const remove = useDeleteProfile();
  const selectProfile = useSession((s) => s.selectProfile);
  const [confirming, setConfirming] = useState(false);
  const [fullscreen, setFullscreen] = useFullscreenPreference();

  const withParent = useParentGate();
  const setMe = useSetMe();
  const deleteProfile = () =>
    withParent(async () => {
      await remove.mutateAsync(profile.id);
      selectProfile(null);
      void navigate('/');
    });
  /** Déconnecte l'appareil du compte familial (les progrès restent sur le serveur). */
  const signOut = async () => {
    await logout();
    selectProfile(null);
    setMe(null);
    void navigate('/bienvenue');
  };

  return (
    <PageShell title="Paramètres" nav={profile}>
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Son</h2>
        <Toggle label="Effets sonores" checked={profile.soundOn} onChange={(soundOn) => update.mutate({ soundOn })} />
      </section>

      {fullscreenSupported() && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl tracking-wide">Écran</h2>
          <Toggle label="Plein écran" checked={fullscreen} onChange={setFullscreen} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Profil</h2>
        <GameButton
          variant="surface"
          icon="icons-navigation-edit"
          className="justify-start"
          onClick={() => void navigate(`/profils/${profile.id}/modifier`)}
        >
          Modifier mon profil
        </GameButton>
        <GameButton
          variant="surface"
          icon="icons-navigation-swap"
          className="justify-start"
          onClick={() => void navigate('/')}
        >
          Changer de joueur
        </GameButton>
        <GameButton
          variant="surface"
          icon="icons-navigation-back"
          className="justify-start"
          onClick={() => void signOut()}
        >
          Déconnecter cet appareil
        </GameButton>
        {confirming ? (
          <div className="cartoon bg-surface flex flex-col gap-3 p-4">
            <p className="text-lg font-bold">
              Supprimer {profile.name} ? Toute sa progression sera perdue définitivement. (Réservé au parent : le code
              PIN sera demandé.)
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
          <GameButton
            variant="danger"
            icon="icons-navigation-close"
            className="justify-start"
            onClick={() => setConfirming(true)}
          >
            Supprimer ce profil
          </GameButton>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl tracking-wide">Infos</h2>
        <GameButton
          variant="surface"
          icon="icons-navigation-info"
          className="justify-start"
          onClick={() => void navigate('/a-propos')}
        >
          À propos et crédits
        </GameButton>
      </section>
    </PageShell>
  );
}
