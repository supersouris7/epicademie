import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { levelFromXp } from '@questeo/engine';
import { useProfiles } from '../api/profiles.ts';
import { Avatar } from '../components/Avatar.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { useSession } from '../store/session.ts';

export function ProfilePicker() {
  const { data: profiles, isPending, isError, refetch } = useProfiles();
  const selectProfile = useSession((s) => s.selectProfile);
  const navigate = useNavigate();

  const choose = (id: string) => {
    selectProfile(id);
    void navigate('/hub');
  };

  return (
    <PageShell>
      <div className="flex items-center gap-4">
        <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}>
          <Questy size={120} mood="wink" />
        </motion.div>
        <SpeechBubble>Salut ! Qui part à l’aventure ?</SpeechBubble>
      </div>

      <h1 className="font-display text-primary text-5xl tracking-wide drop-shadow-[0_4px_0_var(--outline)] sm:text-6xl">
        Questeo
      </h1>

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
          <motion.li
            key={p.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 16 }}
          >
            <button
              type="button"
              onClick={() => choose(p.id)}
              className="cartoon cartoon-press bg-surface flex w-full flex-col items-center gap-3 p-5"
            >
              <Avatar avatar={p.avatar} size={104} />
              <span className="font-display w-full truncate text-2xl tracking-wide">{p.name}</span>
              <span className="text-muted text-sm font-bold">Niveau {levelFromXp(p.xp).level}</span>
            </button>
          </motion.li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => void navigate('/profils/nouveau')}
            className="cartoon cartoon-press bg-primary flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 p-5 text-white"
          >
            <span className="font-display text-6xl leading-none">+</span>
            <span className="font-display text-xl tracking-wide">Nouveau joueur</span>
          </button>
        </li>
      </ul>
    </PageShell>
  );
}
