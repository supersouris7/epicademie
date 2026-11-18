import { useNavigate } from 'react-router';
import { MODES, type Profile } from '@questeo/shared';
import { ModeTile } from '../components/ModeTile.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { useToast } from '../components/Toast.tsx';

/** Choix du mode multijoueur (les téléphones servent de manettes). */
export function MultiModes({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const [toast, showToast] = useToast();
  return (
    <PageShell title="Multijoueur" nav={profile}>
      <p className="text-muted text-lg font-bold">
        Cet écran affiche la partie, chaque joueur rejoint avec son téléphone en scannant le QR code.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {MODES.filter((m) => m.category === 'multi').map((mode, i) => (
          <ModeTile
            key={mode.id}
            mode={mode}
            index={i}
            onClick={() => (mode.available ? void navigate(`/jouer/${mode.id}`) : showToast('Bientôt disponible !'))}
          />
        ))}
      </ul>
      {toast}
    </PageShell>
  );
}
