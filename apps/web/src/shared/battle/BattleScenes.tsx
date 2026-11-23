import { useEffect, useState } from 'react';
import { Sprite } from '../ui/game/Sprite.tsx';
import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import type { HeroExpression } from '../../design/assets.ts';
import { BlinkText } from '../ui/game/BlinkText.tsx';
import { PassZone } from '../ui/game/PassZone.tsx';
import { GameButton } from '../ui/game/GameButton.tsx';
import { QuestyPose } from '../ui/mascot/QuestyPose.tsx';
import type { QuestyPoseId } from '../ui/mascot/poses.ts';
import type { MoodId } from '../ui/mascot/moods.ts';
import { HeroFace } from './HeroFace.tsx';
import { Bubble } from '../ui/Bubble.tsx';
import { assetSrc, PLACEHOLDER_SRC, type BossExpression } from '../../design/assets.ts';
import { bossHeadId } from '../../design/bosses.ts';
import { mustFlip } from '../../design/orientation.ts';
import { RETRY_SECONDS } from '../lib/battleLines.ts';

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
  return assetSrc(bossHeadId(bossId, expression)) ?? PLACEHOLDER_SRC;
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
      {src && (
        // Posée à droite : la tête regarde vers le centre (le héros), à gauche.
        <img
          src={src}
          alt=""
          aria-hidden
          className="h-20 w-20 shrink-0 object-contain"
          style={{ transform: mustFlip(bossHeadId(bossId, expression), 'left') ? 'scaleX(-1)' : undefined }}
        />
      )}
    </motion.div>
  );
}

/**
 * Gros plan du boss à l'entrée d'une matière : son illustration en grand arrive en zoom, l'écran tremble,
 * il provoque (son nom n'est pas écrit).
 * Un toucher n'importe où passe au choix du chapitre.
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
  // Sans bouton : on passe le gros plan en touchant l'écran (comme pour l'Empereur du Savoir).
  // Le boss de face (portrait en pied, le plus propre) ; sa tête si le portrait n'est pas livré.
  const src = assetSrc(`bosses-${bossId}-portrait`) ?? bossPortrait(bossId, expression);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} te provoque`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,#7a1238_0%,#2a0b2e_45%,#0d0618_80%)] px-4 py-6 text-center"
    >
      {/* Toucher n'importe où passe le gros plan. */}
      <PassZone onPass={onDone} />
      {/* Le nom du méchant en titre, comme pour l'Empereur du Savoir. */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-toon pointer-events-none relative text-3xl tracking-wide sm:text-5xl"
      >
        {name}
      </motion.h1>
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
            className="relative max-h-[28dvh] w-[min(56vw,336px)] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
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
      <BlinkText>Touche l’écran pour continuer</BlinkText>
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
  // Le boss en grand : son animation sur place, d'abord calme (yeux bleus), puis en rage (yeux rouges).
  const anim = `bosses/${bossId}/anim-idle`;
  const hasAnim = assetSrc(anim.replace(/\//g, '-')) !== null;
  const bg = {
    debut: 'bg-[radial-gradient(circle_at_50%_40%,#6d1036_0%,#2a0b2e_50%,#0d0618_85%)]',
    montee: 'bg-[radial-gradient(circle_at_50%_40%,#8f1226_0%,#3a0a1e_50%,#10040c_85%)]',
    rage: 'bg-[radial-gradient(circle_at_50%_40%,#b3141e_0%,#4a0710_50%,#12030a_85%)]',
  }[stage];
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} passe en rage`}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden px-4 py-6 text-center transition-colors duration-1000 ${bg}`}
    >
      <PassZone step={stage} onPass={onNext} className="absolute inset-0" />
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
        {/* Animation calme, qui s'efface peu à peu pendant la montée. */}
        <motion.div
          className="flex h-[28dvh] max-w-[96vw] justify-center"
          animate={{ opacity: stage === 'debut' ? 1 : 0 }}
          transition={{ duration: stage === 'montee' ? 2.6 : 0.2 }}
        >
          {hasAnim ? (
            <Sprite anim={anim} range={[0, 4]} height="100%" fps={6} />
          ) : (
            <img src={PLACEHOLDER_SRC} alt="" aria-hidden className="h-full object-contain" />
          )}
        </motion.div>
        {/* Animation en rage : apparaît progressivement, en rouge, par-dessus. */}
        <motion.div
          className="absolute inset-0 flex justify-center drop-shadow-[0_10px_40px_rgba(255,30,30,0.6)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'debut' ? 0 : 1 }}
          transition={{ duration: stage === 'montee' ? 2.6 : 0.2 }}
        >
          {hasAnim && <Sprite anim={anim} range={[4, 4]} height="100%" fps={8} />}
        </motion.div>
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
      <BlinkText key={`touche-${stage}`}>Touche l’écran pour continuer</BlinkText>
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
