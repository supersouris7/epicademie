import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { levelFromXp } from '@questeo/engine';
import { useProfiles } from '../api/profiles.ts';
import { CharacterAvatar } from '../components/game/CharacterAvatar.tsx';
import { CharacterCard } from '../components/game/CharacterCard.tsx';
import { GameButton } from '../components/game/GameButton.tsx';
import { assetSrc } from '../design/assets.ts';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { QuestyPose } from '../components/mascot/QuestyPose.tsx';
import { useSession } from '../store/session.ts';

const CARD_COLORS = ['var(--accent)', 'var(--primary)', 'var(--info)', 'var(--pink)', 'var(--success)'];

export function ProfilePicker() {
  const { data: profiles, isPending, isError, refetch } = useProfiles();
  const selectProfile = useSession((s) => s.selectProfile);
  const navigate = useNavigate();

  const keyArt = assetSrc('branding-key-art');
  const choose = (id: string) => {
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
        <SpeechBubble>Salut ! Qui part à l’aventure ?</SpeechBubble>
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

      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {profiles?.map((p, i) => (
          <li key={p.id}>
            <CharacterCard
              index={i}
              name={p.name}
              color={CARD_COLORS[i % CARD_COLORS.length] ?? 'var(--accent)'}
              caption={`Niveau ${levelFromXp(p.xp).level}`}
              portrait={<CharacterAvatar avatar={p.avatar} size={120} />}
              onClick={() => choose(p.id)}
              className="min-h-52 pt-2"
            />
          </li>
        ))}
        <li>
          <GameButton
            variant="primary"
            icon="icons-navigation-plus"
            onClick={() => void navigate('/profils/nouveau')}
            className="h-full min-h-52 w-full flex-col"
          >
            Nouveau joueur
          </GameButton>
        </li>
      </ul>
    </PageShell>
  );
}
