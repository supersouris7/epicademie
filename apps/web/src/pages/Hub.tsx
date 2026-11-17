import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { levelFromXp } from '@questeo/engine';
import { accord, gradeInfo, MODES, MODE_CATEGORIES, type Profile } from '@questeo/shared';
import { comingSoon } from '../lib/grades.ts';
import { ModeTile } from '../components/ModeTile.tsx';
import { useToast } from '../components/Toast.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { CharacterAvatar } from '../components/game/CharacterAvatar.tsx';
import { HeroCard } from '../components/game/CharacterCard.tsx';
import { GameButton } from '../components/game/GameButton.tsx';
import { GamePanel } from '../components/game/GamePanel.tsx';
import { XPBar } from '../components/game/HudBars.tsx';
import { ResourceCounter } from '../components/game/ResourceCounter.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { MOOD_IDS, type MoodId } from '../components/mascot/moods.ts';

export function Hub({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const [mood, setMood] = useState<MoodId>('happy');
  const [toast, showToast] = useToast();
  const { level, xpInLevel, xpForNext, title } = levelFromXp(profile.xp, profile.gender);
  // Taper sur Questy lui fait changer de tête (au hasard, jamais deux fois la même).
  const tickle = () =>
    setMood((current) => {
      const others = MOOD_IDS.filter((m) => m !== current);
      return others[Math.floor(Math.random() * others.length)] ?? 'happy';
    });

  return (
    <PageShell
      actions={
        <GameButton
          variant="accent"
          iconOnly
          icon="icons-navigation-settings"
          onClick={() => void navigate('/parametres')}
          aria-label="Paramètres"
        />
      }
    >
      {/* HUD du joueur : avatar, niveau, XP, pièces */}
      <GamePanel as="header" className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-label="Mon joueur">
        <button type="button" onClick={() => void navigate('/')} aria-label="Changer de joueur" className="self-center">
          <CharacterAvatar avatar={profile.avatar} size={108} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display truncate text-3xl tracking-wide">{profile.name}</h1>
            <ResourceCounter icon="icons-resources-coin" value={profile.coins} label={`${profile.coins} pièces`} />
          </div>
          <XPBar level={level} xp={xpInLevel} xpForNext={xpForNext} title={title} />
        </div>
      </GamePanel>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            onClick={tickle}
            aria-label="Chatouiller Questy"
            whileTap={{ scale: 0.85, rotate: -8 }}
            className="shrink-0"
          >
            <Questy size={150} mood={mood} />
          </motion.button>
          <SpeechBubble>
            {accord(profile.gender, 'Prêt', 'Prête')} à jouer, {profile.name} ?
          </SpeechBubble>
        </div>
        <HeroCard
          hero={profile.hero}
          caption="Changer de héros"
          onClick={() => void navigate(`/profils/${profile.id}/modifier`)}
          className="min-h-36 w-36 justify-self-center"
        />
      </div>

      <GameButton variant="info" size="lg" icon="icons-resources-progression" onClick={() => void navigate('/progres')}>
        Mes progrès et médailles
      </GameButton>

      {profile.grade && !gradeInfo(profile.grade).available && (
        <p className="cartoon bg-surface-2 p-4 text-lg font-bold" role="note">
          {comingSoon(profile.grade)}
        </p>
      )}

      {(!profile.gender || !profile.birthDate || !profile.grade) && (
        <button
          type="button"
          onClick={() => void navigate(`/profils/${profile.id}/modifier`)}
          className="cartoon cartoon-press bg-gold font-display text-on-light flex items-center gap-3 p-4 text-left text-xl"
        >
          <span className="flex-1">
            Complète ton profil : fille ou garçon, date de naissance et classe (pour adapter les questions et les duels)
          </span>
          <span aria-hidden>→</span>
        </button>
      )}

      {MODE_CATEGORIES.filter((c) => c.id !== 'multi').map((category) => (
        <GamePanel key={category.id} title={category.name}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {MODES.filter((m) => m.category === category.id).map((mode, i) => (
              <ModeTile
                key={mode.id}
                mode={mode}
                index={i}
                onClick={() =>
                  mode.available ? void navigate(`/jouer/${mode.id}`) : showToast('Bientôt disponible !')
                }
              />
            ))}
          </ul>
        </GamePanel>
      ))}

      <GameButton variant="accent" size="xl" icon="icons-navigation-team" onClick={() => void navigate('/multi')}>
        Multijoueur
      </GameButton>
      {toast}
    </PageShell>
  );
}
