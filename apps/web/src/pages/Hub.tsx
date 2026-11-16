import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { SUBJECTS, type Profile } from '@questeo/shared';
import { Avatar } from '../components/Avatar.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { XpBar } from '../components/XpBar.tsx';
import { QuestyFull } from '../components/mascot/Questy.tsx';
import { CoinIcon, GearIcon, PhoneIcon, SubjectIcon } from '../components/icons.tsx';

export function Hub({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const soon = (what: string) => {
    setToast(`${what} arrive bientôt !`);
    window.setTimeout(() => setToast(null), 2000);
  };

  return (
    <PageShell
      actions={
        <button
          type="button"
          onClick={() => void navigate('/parametres')}
          className="cartoon cartoon-press bg-surface flex h-14 w-14 items-center justify-center text-2xl"
          aria-label="Paramètres"
        >
          <GearIcon size={32} />
        </button>
      }
    >
      <section className="cartoon bg-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <button type="button" onClick={() => void navigate('/')} aria-label="Changer de joueur" className="self-center">
          <Avatar avatar={profile.avatar} size={88} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display truncate text-3xl tracking-wide">{profile.name}</h1>
            <span className="font-display flex items-center gap-1 text-2xl" aria-label={`${profile.coins} pièces`}>
              <CoinIcon size={30} /> {profile.coins}
            </span>
          </div>
          <XpBar xp={profile.xp} />
        </div>
      </section>

      <div className="flex items-center gap-2">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="w-32 shrink-0 sm:w-44"
        >
          <QuestyFull size="100%" />
        </motion.div>
        <SpeechBubble>Prêt pour l’aventure, {profile.name} ? Choisis ta matière !</SpeechBubble>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 220, damping: 15 }}
          >
            <button
              type="button"
              onClick={() => soon(s.name)}
              className="cartoon cartoon-press flex min-h-36 w-full flex-col items-center justify-center gap-2 p-4 text-white"
              style={{ backgroundColor: `var(--subject-${s.color})` }}
            >
              <SubjectIcon subject={s.id} size={64} />
              <span className="font-display text-xl tracking-wide drop-shadow-[0_2px_0_var(--outline)] sm:text-2xl">
                {s.name}
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => soon('Le multijoueur')}
        className="cartoon cartoon-press bg-accent font-display flex min-h-20 items-center justify-center gap-3 text-2xl tracking-wide text-white"
      >
        <PhoneIcon size={40} /> Multijoueur
      </button>

      {toast && (
        <motion.div
          role="status"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="cartoon bg-gold font-display fixed inset-x-4 bottom-6 mx-auto max-w-md p-4 text-center text-xl text-[#1d1638]"
        >
          {toast}
        </motion.div>
      )}
    </PageShell>
  );
}
