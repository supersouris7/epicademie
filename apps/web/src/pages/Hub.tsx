import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { chaptersOf } from '@questeo/content';
import { levelFromXp } from '@questeo/engine';
import { accord, getMode, gradeInfo, HERO_NAMES, MODES, type ModeId, type Profile } from '@questeo/shared';
import { useSkills } from '../api/play.ts';
import { comingSoon } from '../lib/grades.ts';
import { localToday } from '../lib/dates.ts';
import { suggestChapter } from '../lib/progress.ts';
import { ModeTile } from '../components/ModeTile.tsx';
import { useToast } from '../components/Toast.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { CharacterAvatar } from '../components/game/CharacterAvatar.tsx';
import { CharacterSprite } from '../components/game/CharacterSprite.tsx';
import { GameIcon } from '../components/game/GameIcon.tsx';
import { GamePanel } from '../components/game/GamePanel.tsx';
import { XPBar } from '../components/game/HudBars.tsx';
import { ResourceCounter } from '../components/game/ResourceCounter.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { MOOD_IDS, type MoodId } from '../components/mascot/moods.ts';
import { assetSrc } from '../design/assets.ts';

/** Les deux grands modes jouables, chacun sa couleur et son illustration. */
const MAIN_MODES: readonly { id: ModeId; color: string; extra: string; extraLabel: string }[] = [
  { id: 'entrainement', color: 'var(--success)', extra: 'rewards-chests-rare', extraLabel: 'Coffres à gagner' },
  { id: 'boss', color: 'var(--boss)', extra: 'icons-resources-life', extraLabel: '3 cœurs' },
];

export function Hub({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const [mood, setMood] = useState<MoodId>('happy');
  const [toast, showToast] = useToast();
  const { data: skills } = useSkills(profile.id);
  const { level, xpInLevel, xpForNext, title } = levelFromXp(profile.xp, profile.gender);
  // Taper sur Questy lui fait changer de tête (au hasard, jamais deux fois la même).
  const tickle = () =>
    setMood((current) => {
      const others = MOOD_IDS.filter((m) => m !== current);
      return others[Math.floor(Math.random() * others.length)] ?? 'happy';
    });
  const arena = assetSrc('environments-arenas-academie');
  const states = new Map((skills ?? []).map((s) => [s.skillId, s]));
  const today = skills ? suggestChapter(chaptersOf('maths'), states, localToday()) : null;

  return (
    <PageShell nav={profile.hero}>
      {/* HUD du joueur : avatar, niveau, XP, pièces */}
      <GamePanel as="header" className="flex items-center gap-3" aria-label="Mon joueur">
        <button type="button" onClick={() => void navigate('/')} aria-label="Changer de joueur" className="shrink-0">
          <CharacterAvatar avatar={profile.avatar} size={84} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-display truncate text-2xl tracking-wide sm:text-3xl">{profile.name}</h1>
            <ResourceCounter icon="icons-resources-coin" value={profile.coins} label={`${profile.coins} pièces`} />
          </div>
          <XPBar level={level} xp={xpInLevel} xpForNext={xpForNext} title={title} />
        </div>
      </GamePanel>

      {/* Scène : le héros en pied dans l'arène, Questy l'encourage. */}
      <section
        aria-label="Mon héros"
        className="cartoon relative flex min-h-64 items-end justify-between gap-2 overflow-hidden px-3 pt-3 sm:min-h-72 sm:px-6"
        style={{
          background: arena
            ? `linear-gradient(rgb(20 10 40 / 0.15), rgb(20 10 40 / 0.45)), center 70% / cover no-repeat url(${arena})`
            : 'var(--surface-2)',
        }}
      >
        <motion.button
          type="button"
          onClick={() => void navigate('/heros')}
          aria-label={`${HERO_NAMES[profile.hero]} : changer de héros`}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
          className="flex shrink-0 flex-col items-center"
        >
          <CharacterSprite hero={profile.hero} state="idle" height={230} />
        </motion.button>
        <div className="flex min-w-0 flex-col items-end gap-2 self-center pb-4">
          <SpeechBubble>
            {accord(profile.gender, 'Prêt', 'Prête')} pour l’aventure, {profile.name} ?
          </SpeechBubble>
          <motion.button
            type="button"
            onClick={tickle}
            aria-label="Chatouiller Questy"
            whileTap={{ scale: 0.85, rotate: -8 }}
          >
            <Questy size={110} mood={mood} />
          </motion.button>
        </div>
      </section>

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

      {/* À faire aujourd'hui : ce qui est à revoir, sinon où reprendre. */}
      {today && (
        <button
          type="button"
          onClick={() => void navigate(`/jouer/entrainement/maths/${today.chapter.id}`)}
          className="cartoon cartoon-press bg-primary flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <GameIcon id="icons-navigation-target" size={52} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-bold text-white">
              {today.progress.due > 0 ? 'À faire aujourd’hui' : 'Je te propose'} · {today.why}
            </span>
            <span className="font-display text-toon truncate text-2xl tracking-wide">{today.chapter.title}</span>
          </span>
          <span className="font-display text-toon text-3xl" aria-hidden>
            ▶
          </span>
        </button>
      )}

      {/* Les deux grands modes */}
      <ul className="grid gap-4 sm:grid-cols-2" aria-label="Jouer">
        {MAIN_MODES.map((m, i) => {
          const mode = getMode(m.id);
          if (!mode) return null;
          return (
            <motion.li
              key={m.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 16 }}
            >
              <button
                type="button"
                onClick={() => void navigate(`/jouer/${mode.id}`)}
                className="cartoon bevel cartoon-press relative flex min-h-44 w-full items-center gap-4 overflow-hidden p-4 pb-12 text-left text-white hover:brightness-110"
                style={{
                  background: `linear-gradient(150deg, ${m.color}, color-mix(in srgb, ${m.color} 55%, var(--outline)))`,
                }}
              >
                <GameIcon id={`icons-modes-${mode.id}`} size={104} className="shrink-0 drop-shadow-lg" />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-toon text-3xl leading-none tracking-wide">{mode.name}</span>
                  <span className="text-base font-bold opacity-95">{mode.pitch}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                    <GameIcon id={m.extra} size={28} />
                    {m.extraLabel}
                  </span>
                </span>
                <span className="font-display text-toon absolute right-4 bottom-3 text-2xl" aria-hidden>
                  JOUER ▶
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <GamePanel title="Défis">
        <ul className="grid gap-4 sm:grid-cols-2">
          {MODES.filter((m) => m.category === 'defis').map((mode, i) => (
            <ModeTile
              key={mode.id}
              mode={mode}
              index={i}
              onClick={() => (mode.available ? void navigate(`/jouer/${mode.id}`) : showToast('Bientôt disponible !'))}
            />
          ))}
        </ul>
      </GamePanel>
      {toast}
    </PageShell>
  );
}
