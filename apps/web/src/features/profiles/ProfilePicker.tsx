import { api } from '@questeo/shared';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { levelFromXp } from '@questeo/engine';
import { useProfiles } from './api.ts';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { CharacterCard } from '../../shared/ui/game/CharacterCard.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { assetSrc } from '../../design/assets.ts';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { QuestyPose } from '../../shared/ui/mascot/QuestyPose.tsx';
import { useSession } from '../../shared/lib/session.ts';
import { useQuery } from '@tanstack/react-query';
import { request } from '../../shared/api/client.ts';
import { useRealtime } from '../realtime/index.ts';
import { useToast } from '../../shared/ui/Toast.tsx';

export function ProfilePicker() {
  const { data: profiles, isPending, isError, refetch } = useProfiles();
  const selectProfile = useSession((s) => s.selectProfile);
  const navigate = useNavigate();

  const keyArt = assetSrc('branding-key-art');
  const [toast, showToast] = useToast(3500);
  // Profils déjà ouverts sur un autre appareil : on ne peut pas les choisir ici.
  const { data: presence } = useQuery({
    queryKey: ['presence'],
    queryFn: () => request(api.presence),
    refetchInterval: 5000,
  });
  const refused = useRealtime((s) => s.refused);
  const clearRefused = useRealtime((s) => s.clearRefused);
  const myId = useSession((s) => s.profileId);
  const busy = new Set((presence?.online ?? []).filter((id) => id !== myId));
  // Un profil ouvert ailleurs se choisit quand même : ce nouvel appareil prend la main.
  const choose = (id: string) => {
    if (busy.has(id)) showToast('Ce joueur était ouvert sur un autre appareil : il continue ici.');
    clearRefused();
    selectProfile(id);
    void navigate('/hub');
  };

  return (
    <PageShell>
      <h1 className="flex justify-center">
        <img src={assetSrc('branding-logo') ?? ''} alt="Academy Fighters" className="w-72 max-w-full sm:w-96" />
      </h1>
      {keyArt && <img src={keyArt} alt="" aria-hidden className="cartoon w-full object-cover" decoding="async" />}

      <div className="flex items-center gap-4">
        <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}>
          <QuestyPose pose="salut" mood="wink" size={120} />
        </motion.div>
        <SpeechBubble>{refused ?? 'Salut ! Qui part à l’aventure ?'}</SpeechBubble>
      </div>

      {isPending && <p className="text-muted text-xl">Chargement…</p>}
      {isError && (
        <div className="cartoon bg-surface flex items-center gap-4 p-4">
          <p className="flex-1 text-lg">Impossible de joindre le serveur.</p>
          <button type="button" className="font-display text-primary text-xl underline" onClick={() => void refetch()}>
            Réessayer
          </button>
        </div>
      )}

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {profiles?.map((p, i) => (
          <li key={p.id}>
            <CharacterCard
              index={i}
              name={p.name}
              caption={busy.has(p.id) ? 'Ouvert ailleurs' : `Niveau ${levelFromXp(p.xp).level}`}
              portrait={<CharacterAvatar avatar={p.avatar} size={76} />}
              onClick={() => choose(p.id)}
              centered
            />
          </li>
        ))}
        <li>
          <GameButton
            variant="primary"
            icon="icons-navigation-plus"
            onClick={() => void navigate('/profils/nouveau')}
            className="h-full min-h-32 w-full flex-col"
          >
            Nouveau joueur
          </GameButton>
        </li>
      </ul>
      <GameButton variant="surface" icon="icons-navigation-team" onClick={() => void navigate('/parent')}>
        Espace parent
      </GameButton>
      {toast}
    </PageShell>
  );
}
