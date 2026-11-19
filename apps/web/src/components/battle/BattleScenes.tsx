import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import type { HeroExpression } from '../../design/assets.ts';
import { GameButton } from '../game/GameButton.tsx';
import { GameIcon } from '../game/GameIcon.tsx';
import { QuestyPose } from '../mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../mascot/poses.ts';
import type { MoodId } from '../mascot/moods.ts';
import { HeroFace } from './HeroFace.tsx';
import { Bubble } from '../Bubble.tsx';
import { assetSrc, type BossExpression } from '../../design/assets.ts';
import { bossHeadId } from '../../design/bosses.ts';
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
      <Bubble tail="left" className="flex-1 px-4 py-3 text-lg sm:text-xl">
        {text}
      </Bubble>
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

/** Tête du boss avec son expression (portrait livré, sinon remplaçant). */
function bossPortrait(bossId: string, expression: BossExpression) {
  return assetSrc(bossHeadId(bossId, expression)) ?? assetSrc('placeholder-boss');
}

/** Le boss parle : sa tête à droite, bulle rouge à gauche (face au héros). */
export function BossSays({
  bossId,
  name,
  text,
  expression = 'moqueur',
  delay = 0.5,
}: {
  readonly bossId: string;
  readonly name: string;
  readonly text: string;
  readonly expression?: BossExpression;
  readonly delay?: number;
}) {
  const src = bossPortrait(bossId, expression);
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
      className="flex items-center gap-3"
      role="status"
      aria-label={`${name} : ${text}`}
    >
      <Bubble tail="right" tone="villain" className="flex-1 px-4 py-3 text-lg sm:text-xl">
        {text}
      </Bubble>
      {src && <img src={src} alt="" aria-hidden className="h-20 w-20 shrink-0 object-contain" />}
    </motion.div>
  );
}

/**
 * Gros plan du boss à l'entrée d'une matière : son illustration en grand arrive en zoom, l'écran tremble,
 * il provoque (son nom n'est pas écrit).
 * Un toucher n'importe où (ou le bouton) passe au choix du chapitre.
 */
export function BossCloseUp({
  bossId,
  name,
  text,
  expression = 'moqueur',
  onDone,
}: {
  readonly bossId: string;
  readonly name: string;
  readonly text: string;
  readonly expression?: BossExpression;
  readonly onDone: () => void;
}) {
  const reduce = useReducedMotion();
  // Le boss en grand (illustration en pied) ; sa tête si l'illustration n'est pas livrée.
  const src = assetSrc(`bosses-maths-${bossId}-art`) ?? bossPortrait(bossId, expression);
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
            className="relative max-h-[52dvh] w-[min(96vw,640px)] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
          />
        )}
      </motion.div>
      <motion.p
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 240, damping: 14 }}
        className="pointer-events-none relative max-w-lg"
      >
        <Bubble tail="none" tone="villain" className="px-5 py-4 text-xl sm:text-2xl">
          {text}
        </Bubble>
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="relative">
        {/* Le bouton se remplit en 5 s, puis appuie tout seul. */}
        <AutoPress seconds={5} onDone={onDone}>
          Choisir mon chapitre
        </AutoPress>
      </motion.div>
    </div>
  );
}

/**
 * Passage en rage du boss (dernière vie), plein écran, en trois paliers (≈ 3 s chacun, un toucher avance) :
 * « début » (il s'énerve), « montée » (l'image de rage remplace peu à peu la 1re, flashs blancs, le fond
 * rougit), puis « rage » qui éclate (secousse).
 */
export function RageScene({
  bossId,
  name,
  stage,
  lines,
  onNext,
}: {
  readonly bossId: string;
  readonly name: string;
  readonly stage: 'debut' | 'montee' | 'rage';
  readonly lines: { readonly debut: string; readonly montee: string; readonly rage: string };
  readonly onNext: () => void;
}) {
  const reduce = useReducedMotion();
  const debut = assetSrc(`bosses-maths-${bossId}-rage-debut`);
  const rage = assetSrc(`bosses-maths-${bossId}-rage`);
  const bg = {
    debut: 'bg-[radial-gradient(circle_at_50%_40%,#6d1036_0%,#2a0b2e_50%,#0d0618_85%)]',
    montee: 'bg-[radial-gradient(circle_at_50%_40%,#8f1226_0%,#3a0a1e_50%,#10040c_85%)]',
    rage: 'bg-[radial-gradient(circle_at_50%_40%,#b3141e_0%,#4a0710_50%,#12030a_85%)]',
  }[stage];
  const img = 'max-h-[56dvh] w-[min(96vw,720px)] object-contain';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} passe en rage`}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden px-4 py-6 text-center transition-colors duration-1000 ${bg}`}
    >
      <button type="button" aria-label="Passer" onClick={onNext} className="absolute inset-0 cursor-pointer" />
      <motion.div
        className="pointer-events-none relative"
        animate={
          reduce
            ? undefined
            : stage === 'montee'
              ? { x: [0, -3, 3, -5, 5, -8, 8, -4, 0], scale: [1, 1.02, 1.04, 1.06] }
              : stage === 'rage'
                ? { scale: [1.5, 1, 1.05, 1], x: [0, -16, 16, -10, 10, -4, 0] }
                : { scale: [0.85, 1] }
        }
        transition={{ duration: stage === 'montee' ? 3 : 0.8, ease: 'easeOut' }}
      >
        {/* 1re image (début de rage), qui s'efface peu à peu pendant la montée. */}
        {debut && (
          <motion.img
            src={debut}
            alt=""
            aria-hidden
            className={img}
            animate={{ opacity: stage === 'debut' ? 1 : 0 }}
            transition={{ duration: stage === 'montee' ? 2.6 : 0.2 }}
          />
        )}
        {/* Image de rage : apparaît progressivement, en rouge, par-dessus. */}
        {rage && (
          <motion.img
            src={rage}
            alt=""
            aria-hidden
            className={`absolute inset-0 ${img} drop-shadow-[0_10px_40px_rgba(255,30,30,0.6)]`}
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'debut' ? 0 : 1 }}
            transition={{ duration: stage === 'montee' ? 2.6 : 0.2 }}
          />
        )}
      </motion.div>
      {/* Flashs blancs : de plus en plus forts pendant la montée, un grand éclat quand la rage éclate. */}
      {!reduce && stage !== 'debut' && (
        <motion.div
          key={`flash-${stage}`}
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={{
            opacity: stage === 'montee' ? [0, 0.25, 0, 0, 0.45, 0, 0, 0.7, 0] : [0.95, 0, 0.6, 0],
          }}
          transition={{
            duration: stage === 'montee' ? 3 : 1,
            times: stage === 'montee' ? undefined : [0, 0.3, 0.45, 1],
          }}
        />
      )}
      <motion.p
        key={`ligne-${stage}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 240, damping: 14 }}
        className="pointer-events-none relative max-w-lg"
        role="status"
      >
        <Bubble
          tail="none"
          tone="villain"
          className={`px-5 py-4 ${stage === 'rage' ? 'font-display text-2xl tracking-wide sm:text-3xl' : 'text-xl sm:text-2xl'}`}
        >
          {lines[stage]}
        </Bubble>
      </motion.p>
    </div>
  );
}

/** Le héros parle : sa tête à gauche (avec l'expression de la réplique), bulle crème à droite. */
export function HeroSays({
  hero,
  face,
  text,
  delay = 0.5,
}: {
  readonly hero: HeroId;
  readonly face: HeroExpression;
  readonly text: string;
  readonly delay?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 16 }}
      className="flex items-center gap-3"
      role="status"
    >
      <HeroFace hero={hero} expression={face} size={72} />
      <Bubble tail="left" className="flex-1 text-base sm:text-lg">
        {text}
      </Bubble>
    </motion.div>
  );
}

/** Petites répliques pendant le combat, sous le bandeau : le héros à gauche, l'adversaire à droite. */
export function QuipRow({
  hero,
  enemy,
}: {
  readonly hero: { readonly text: string; readonly nonce: number } | null;
  readonly enemy: { readonly text: string; readonly nonce: number } | null;
}) {
  const [hidden, setHidden] = useState<{ hero?: number; enemy?: number }>({});
  useEffect(() => {
    if (!hero) return;
    const t = window.setTimeout(() => setHidden((h) => ({ ...h, hero: hero.nonce })), 2800);
    return () => window.clearTimeout(t);
  }, [hero]);
  useEffect(() => {
    if (!enemy) return;
    const t = window.setTimeout(() => setHidden((h) => ({ ...h, enemy: enemy.nonce })), 2800);
    return () => window.clearTimeout(t);
  }, [enemy]);
  return (
    <div className="pointer-events-none relative z-30 -mt-1 flex h-0 justify-between gap-2" aria-live="polite">
      {hero && hidden.hero !== hero.nonce ? (
        <motion.div
          key={`h-${hero.nonce}`}
          initial={{ y: -8, scale: 0.8, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          className="max-w-[48%] self-start"
        >
          <Bubble tail="none" className="px-3 py-1.5 text-sm sm:text-base">
            {hero.text}
          </Bubble>
        </motion.div>
      ) : (
        <span />
      )}
      {enemy && hidden.enemy !== enemy.nonce && (
        <motion.div
          key={`e-${enemy.nonce}`}
          initial={{ y: -8, scale: 0.8, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="ml-auto max-w-[48%] self-start"
        >
          <Bubble tail="none" tone="villain" className="px-3 py-1.5 text-right text-sm sm:text-base">
            {enemy.text}
          </Bubble>
        </motion.div>
      )}
    </div>
  );
}

/** Bouton qui se remplit pendant `seconds` puis s'appuie tout seul (on peut appuyer avant). */
export function AutoPress({
  seconds,
  onDone,
  children,
}: {
  readonly seconds: number;
  readonly onDone: () => void;
  readonly children: React.ReactNode;
}) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) {
      onDone();
      return;
    }
    const t = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left, onDone]);
  return (
    <span className="relative inline-flex">
      <GameButton variant="danger" size="lg" icon="icons-navigation-play" onClick={onDone}>
        {children} ({left})
      </GameButton>
      {/* Jauge du temps restant, sous le bouton. */}
      <span aria-hidden className="absolute inset-x-3 -bottom-2 h-1.5 overflow-hidden rounded-full bg-black/40">
        <motion.span
          className="bg-gold block h-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: seconds, ease: 'linear' }}
        />
      </span>
    </span>
  );
}
