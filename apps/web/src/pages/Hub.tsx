import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { MODES, MODE_CATEGORIES, type Profile } from '@questeo/shared';
import { Avatar } from '../components/Avatar.tsx';
import { ModeTile } from '../components/ModeTile.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { XpBar } from '../components/XpBar.tsx';
import { CoinIcon, GearIcon, PhoneIcon } from '../components/icons.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { MOOD_IDS, type MoodId } from '../components/mascot/moods.ts';

export function Hub({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const [mood, setMood] = useState<MoodId>('happy');
  // Taper sur Questy lui fait changer de tête (au hasard, jamais deux fois la même).
  const tickle = () =>
    setMood((current) => {
      const others = MOOD_IDS.filter((m) => m !== current);
      return others[Math.floor(Math.random() * others.length)] ?? 'happy';
    });

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

      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          onClick={tickle}
          aria-label="Chatouiller Questy"
          whileTap={{ scale: 0.85, rotate: -8 }}
          className="shrink-0"
        >
          <Questy size={88} mood={mood} />
        </motion.button>
        <SpeechBubble>À quoi on joue, {profile.name} ?</SpeechBubble>
      </div>

      {MODE_CATEGORIES.filter((c) => c.id !== 'multi').map((category) => (
        <section key={category.id} className="flex flex-col gap-3">
          <h2 className="font-display text-2xl tracking-wide">{category.name}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {MODES.filter((m) => m.category === category.id).map((mode, i) => (
              <ModeTile key={mode.id} mode={mode} index={i} onClick={() => void navigate(`/jouer/${mode.id}`)} />
            ))}
          </ul>
        </section>
      ))}

      <button
        type="button"
        onClick={() => void navigate('/multi')}
        className="cartoon cartoon-press bg-accent font-display flex min-h-20 items-center justify-center gap-3 text-2xl tracking-wide text-white"
      >
        <PhoneIcon size={40} /> Multijoueur
      </button>
    </PageShell>
  );
}
