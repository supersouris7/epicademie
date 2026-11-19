import { motion, useReducedMotion } from 'motion/react';
import type { HeroId } from '@questeo/shared';
import { assetSrc, type HeroExpression } from '../../design/assets.ts';
import { arenaBand } from './arena.ts';
import { GameIcon } from '../ui/game/GameIcon.tsx';
import { ProgressBar } from '../ui/game/ProgressBar.tsx';
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
  /** Vies du boss (null avant lui) ; avant lui, les mobs restants : une barre segmentée, comme des vies. */
  readonly bossLives: number | null;
  readonly bossMax: number;
  readonly mobsLeft: number;
  readonly mobsMax: number;
  /** Change à chaque coup reçu par le héros / par l'adversaire : la tête tremble. */
  readonly riposte: number;
  readonly shot: number;
  /** Arène en fond, assombrie. */
  readonly arena: string;
}

/**
 * Bandeau du combat : têtes et vies des deux adversaires sur une bande de l'arène. Les animations du
 * combat se jouent en grand dans la zone de l'énoncé ; ici, seules les têtes réagissent.
 */
export function BattleBar(p: BattleBarProps) {
  const reduce = useReducedMotion();
  // Bandeau dédié (frise de l'arène) en couverture ; sinon une bande de l'arène.
  const band = arenaBand(p.arena);
  const bg = assetSrc(`environments-arenas-${p.arena}`);
  const dim = 'linear-gradient(rgb(20 10 40 / 0.55), rgb(20 10 40 / 0.55))';
  const enemySrc = assetSrc(p.enemyImage);
  const onBoss = p.bossLives !== null;
  return (
    <header
      className="cartoon relative flex shrink-0 items-center gap-2 overflow-hidden px-2.5 py-2 sm:gap-3 sm:px-3"
      style={{
        background: band
          ? `${dim}, center / cover no-repeat url(${band})`
          : bg
            ? `${dim}, center 60% / cover no-repeat url(${bg})`
            : 'var(--surface)',
      }}
    >
      {/* Héros : tête (secouée quand il est touché), cœurs, bouclier */}
      <motion.div
        key={`hero-${p.riposte}`}
        animate={p.riposte && !reduce ? { x: [0, -8, 8, -4, 0] } : undefined}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative shrink-0"
      >
        <HeroFace hero={p.hero} expression={p.face} size={56} />
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

      <span className="flex-1" />

      {/* Adversaire : nom, puis ses vies (boss) ou les mobs qui restent avant lui. */}
      <div className="flex min-w-0 flex-col items-end gap-1">
        <span className="font-display text-toon max-w-[38vw] truncate text-sm tracking-wide sm:text-base">
          {p.enemyName}
        </span>
        <ProgressBar
          className="w-28 sm:w-44"
          value={p.bossLives ?? p.mobsLeft}
          max={onBoss ? p.bossMax : p.mobsMax}
          segments={onBoss ? p.bossMax : p.mobsMax}
          color={onBoss ? 'var(--boss)' : 'var(--primary)'}
          label={onBoss ? `Vies de ${p.enemyName}` : 'Mobs restants'}
          size="sm"
        />
      </div>
      <motion.div
        key={`enemy-${p.enemyKey}-${p.shot}`}
        initial={p.shot ? false : { scale: 0.4, opacity: 0 }}
        animate={p.shot && !reduce ? { x: [0, 10, -6, 0], opacity: [1, 0.5, 1] } : { scale: 1, opacity: 1 }}
        transition={{ delay: p.shot ? 0.45 : 0, duration: 0.4 }}
        className="h-14 w-14 shrink-0"
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
