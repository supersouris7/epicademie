import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import { GameButton } from '../game/GameButton.tsx';
import { GameIcon } from '../game/GameIcon.tsx';
import { QuestyPose } from '../mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../mascot/poses.ts';
import type { MoodId } from '../mascot/moods.ts';
import { HeroFace } from './HeroFace.tsx';
import { assetSrc } from '../../design/assets.ts';
import { RETRY_SECONDS } from '../../lib/battleLines.ts';

/** Questy en pied qui parle, bulle à sa droite (au-dessus de l'arène). */
export function QuestySays({
  text,
  pose = 'montre',
  mood = 'happy',
  delay = 0.5,
}: {
  readonly text: string;
  readonly pose?: QuestyPoseId;
  readonly mood?: MoodId;
  readonly delay?: number;
}) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
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

/** Tête du boss (portrait livré, sinon remplaçant). */
function bossPortrait(bossId: string) {
  return assetSrc(`bosses-maths-${bossId}-portrait`) ?? assetSrc('placeholder-boss');
}

/** Le boss parle : sa tête à droite, bulle rouge à gauche (face au héros). */
export function BossSays({
  bossId,
  name,
  text,
  delay = 0.5,
}: {
  readonly bossId: string;
  readonly name: string;
  readonly text: string;
  readonly delay?: number;
}) {
  const src = bossPortrait(bossId);
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
      className="flex items-center gap-3"
      role="status"
      aria-label={`${name} : ${text}`}
    >
      <p className="cartoon text-on-light min-w-0 flex-1 rounded-2xl border-[color:var(--danger)] bg-[#ffe3e3] px-4 py-3 text-lg leading-snug font-bold sm:text-xl">
        {text}
      </p>
      {src && <img src={src} alt="" aria-hidden className="h-20 w-20 shrink-0 object-contain" />}
    </motion.div>
  );
}

/**
 * Gros plan du boss à l'entrée d'une matière : il arrive en zoom, l'écran tremble, il provoque.
 * Un toucher n'importe où (ou le bouton) passe au choix du chapitre.
 */
export function BossCloseUp({
  bossId,
  name,
  text,
  onDone,
}: {
  readonly bossId: string;
  readonly name: string;
  readonly text: string;
  readonly onDone: () => void;
}) {
  const reduce = useReducedMotion();
  const src = bossPortrait(bossId);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} te provoque`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#7a1238_0%,#2a0b2e_45%,#0d0618_80%)] px-4 py-6 text-center"
    >
      {/* Toucher n'importe où passe le gros plan. */}
      <button type="button" aria-label="Passer" onClick={onDone} className="absolute inset-0 cursor-pointer" />
      <motion.div
        initial={reduce ? false : { scale: 1.8, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { scale: [1.8, 1, 1.04, 1], opacity: 1, x: [0, 0, -8, 8, -4, 0] }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pointer-events-none relative"
      >
        <span aria-hidden className="absolute inset-[-12%] rounded-full bg-[#ff4fa0]/25 blur-2xl" />
        {src && (
          <img
            src={src}
            alt=""
            aria-hidden
            className="relative h-[min(62vw,300px)] w-[min(62vw,300px)] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          />
        )}
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-display text-toon pointer-events-none relative text-4xl tracking-wide sm:text-5xl"
      >
        {name}
      </motion.h1>
      <motion.p
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 240, damping: 14 }}
        className="cartoon text-on-light pointer-events-none relative max-w-lg rounded-2xl bg-[#ffe3e3] px-5 py-4 text-xl leading-snug font-bold sm:text-2xl"
      >
        {text}
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="relative">
        <GameButton variant="danger" size="lg" icon="icons-navigation-play" onClick={onDone}>
          Choisir mon chapitre
        </GameButton>
      </motion.div>
    </div>
  );
}
