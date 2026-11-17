import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import { assetSrc, type HeroExpression } from '../../design/assets.ts';
import { GameIcon } from '../game/GameIcon.tsx';
import { ProgressBar } from '../game/ProgressBar.tsx';
import { PlasmaShot } from './BattleArena.tsx';
import { HeroFace } from './HeroFace.tsx';

interface BattleBarProps {
  readonly hero: HeroId;
  readonly face: HeroExpression;
  readonly hearts: number;
  readonly maxHearts: number;
  readonly shield: boolean;
  /** Adversaire : nom, image (tête du boss ou mob entier), filtre de couleur. */
  readonly enemyName: string;
  readonly enemyImage: string;
  readonly enemyFilter?: string;
  readonly enemyKey: string;
  /** Vies du boss (null pour un mob : on affiche la progression des mobs). */
  readonly bossLives: number | null;
  readonly bossMax: number;
  readonly mobText: string;
  readonly shot: number;
  readonly riposte: number;
  /** Arène en fond, assombrie. */
  readonly arena: string;
  readonly onQuit: () => void;
}

/**
 * Bandeau du combat, après l'entrée en scène : têtes et vies des deux adversaires sur une bande de
 * l'arène ; les tirs passent d'une tête à l'autre. Tout le reste de l'écran est laissé aux énoncés.
 */
export function BattleBar(p: BattleBarProps) {
  const reduce = useReducedMotion();
  const bg = assetSrc(`environments-arenas-${p.arena}`);
  const enemySrc = assetSrc(p.enemyImage);
  return (
    <header
      className="cartoon relative flex shrink-0 items-center gap-2 overflow-hidden px-2 py-1.5 sm:gap-3 sm:px-3"
      style={{
        background: bg
          ? `linear-gradient(rgb(20 10 40 / 0.55), rgb(20 10 40 / 0.55)), center 60% / cover no-repeat url(${bg})`
          : 'var(--surface)',
      }}
    >
      <button
        type="button"
        onClick={p.onQuit}
        aria-label="Quitter le combat"
        className="cartoon cartoon-press bg-danger flex h-10 w-10 shrink-0 items-center justify-center"
      >
        <GameIcon id="icons-navigation-close" size="xs" />
      </button>

      {/* Héros : tête (secouée quand il est touché), cœurs, bouclier */}
      <motion.div
        key={`hero-${p.riposte}`}
        animate={p.riposte && !reduce ? { x: [0, -8, 8, -4, 0] } : undefined}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative shrink-0"
      >
        <HeroFace hero={p.hero} expression={p.face} size={60} />
        {p.shield && (
          <span
            className="absolute inset-[-4px] rounded-full border-4 border-cyan-300/80 shadow-[0_0_14px_rgba(103,232,249,0.8)]"
            aria-label="Bouclier levé"
          />
        )}
      </motion.div>
      <div className="flex items-center gap-0.5" aria-label={`${p.hearts} cœurs sur ${p.maxHearts}`} role="img">
        {Array.from({ length: p.maxHearts }, (_, i) => (
          <GameIcon key={i} id={i < p.hearts ? 'icons-resources-life' : 'icons-resources-life-empty'} size="sm" />
        ))}
      </div>

      {/* Couloir des tirs */}
      <div className="relative h-12 min-w-0 flex-1">
        <AnimatePresence>
          {p.shot > 0 && (
            <motion.div
              key={`shot-${p.shot}`}
              className="pointer-events-none absolute top-1/2 left-0 w-10 -translate-y-1/2"
              initial={{ left: '0%', opacity: 1 }}
              animate={{ left: '92%', opacity: [1, 1, 0] }}
              transition={{ duration: reduce ? 0.01 : 0.45, ease: 'easeIn' }}
            >
              <PlasmaShot />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {p.riposte > 0 && (
            <motion.div
              key={`riposte-${p.riposte}`}
              className="pointer-events-none absolute top-1/2 h-9 w-6 -translate-y-1/2 rounded-[50%] border-l-[6px] border-orange-400"
              style={{ boxShadow: '-6px 0 18px rgba(255,90,40,0.8)' }}
              initial={{ left: '92%', opacity: 1 }}
              animate={{ left: '0%', opacity: [1, 1, 0] }}
              transition={{ duration: reduce ? 0.01 : 0.4, ease: 'easeIn' }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Adversaire : vies (boss) ou progression des mobs, puis sa tête */}
      <div className="flex min-w-0 shrink flex-col items-end gap-0.5">
        <span className="font-display text-toon max-w-[40vw] truncate text-sm tracking-wide sm:text-base">
          {p.enemyName}
        </span>
        {p.bossLives !== null ? (
          <ProgressBar
            className="w-28 sm:w-40"
            value={p.bossLives}
            max={p.bossMax}
            segments={p.bossMax}
            color="var(--boss)"
            label={`Vies de ${p.enemyName}`}
            text={`${p.bossLives}/${p.bossMax}`}
            size="sm"
          />
        ) : (
          <span className="font-display text-toon text-sm">{p.mobText}</span>
        )}
      </div>
      <motion.div
        key={`enemy-${p.enemyKey}-${p.shot}`}
        initial={p.shot ? false : { scale: 0.4, opacity: 0 }}
        animate={p.shot && !reduce ? { x: [0, 10, -6, 0], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 1 }}
        transition={{ delay: p.shot ? 0.45 : 0, duration: 0.4 }}
        className="h-16 w-16 shrink-0"
      >
        {enemySrc && (
          <img
            src={enemySrc}
            alt=""
            aria-hidden
            className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            style={{ filter: p.enemyFilter }}
          />
        )}
      </motion.div>
    </header>
  );
}
