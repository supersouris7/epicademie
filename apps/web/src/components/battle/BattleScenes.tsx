import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import { GameButton } from '../game/GameButton.tsx';
import { GameIcon } from '../game/GameIcon.tsx';
import { QuestyPose } from '../mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../mascot/poses.ts';
import type { MoodId } from '../mascot/moods.ts';
import { HeroFace } from './HeroFace.tsx';
import { RETRY_SECONDS } from '../../lib/battleLines.ts';

/** Questy en pied qui parle, bulle à sa droite (au-dessus de l'arène). */
export function QuestySays({
  text,
  pose = 'montre',
  mood = 'happy',
}: {
  readonly text: string;
  readonly pose?: QuestyPoseId;
  readonly mood?: MoodId;
}) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 220, damping: 16 }}
      className="flex items-center gap-3"
      role="status"
    >
      <span className="shrink-0">
        <QuestyPose pose={pose} mood={mood} size={96} />
      </span>
      <p className="cartoon text-on-light min-w-0 flex-1 rounded-2xl bg-[#fff3dd] px-4 py-3 text-lg leading-snug font-bold sm:text-xl">
        {text}
      </p>
    </motion.div>
  );
}

/** Les vies du boss annoncées à son arrivée : 3 cœurs qui tombent un à un. */
export function BossLivesBadge({ lives }: { readonly lives: number }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 12 }}
      className="cartoon bg-surface flex items-center gap-3 self-center px-4 py-2"
    >
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: lives }, (_, i) => (
          <motion.span
            key={i}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.4 + i * 0.2, type: 'spring' }}
          >
            <GameIcon id="icons-resources-life" size="sm" />
          </motion.span>
        ))}
      </span>
      <span className="font-display text-lg tracking-wide">
        {lives} vies : {lives} bonnes réponses pour le battre
      </span>
    </motion.div>
  );
}

/** Secousse de l'écran quand le boss atterrit. */
export function Shake({ children, delay = 0.9 }: { readonly children: React.ReactNode; readonly delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { x: [0, -10, 10, -6, 6, 0], y: [0, 4, -4, 2, 0] }}
      transition={{ delay, duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Après une défaite : « On recommence ? » avec 5 secondes pour répondre. Toucher relance tout le
 * combat ; sans réponse (ou « Non »), on passe au bilan, qui propose l'entraînement.
 */
export function RetryCountdown({
  hero,
  onRetry,
  onSkip,
}: {
  readonly hero: HeroId;
  readonly onRetry: () => void;
  readonly onSkip: () => void;
}) {
  const [left, setLeft] = useState(RETRY_SECONDS);
  useEffect(() => {
    if (left <= 0) {
      onSkip();
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, onSkip]);
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-5 px-4 py-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220 }}>
        <HeroFace hero={hero} expression="determine" size={120} />
      </motion.div>
      <h1 className="font-display text-toon text-5xl tracking-wide">On recommence ?</h1>
      <p className="text-muted text-xl font-bold">Tu as {RETRY_SECONDS} secondes pour répondre !</p>
      {/* Compte à rebours : anneau qui se vide, chiffre au centre. */}
      <div className="relative h-28 w-28" role="timer" aria-label={`${left} secondes`}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - left / RETRY_SECONDS)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="font-display absolute inset-0 flex items-center justify-center text-5xl">{left}</span>
      </div>
      <GameButton size="lg" icon="icons-navigation-retry" onClick={onRetry}>
        On recommence !
      </GameButton>
      <button type="button" onClick={onSkip} className="text-muted font-bold underline underline-offset-4">
        Non, voir le bilan
      </button>
    </div>
  );
}
