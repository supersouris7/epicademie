import { AnimatePresence, motion } from 'motion/react';
import { HERO_NAMES, type HeroId } from '@questeo/shared';
import type { HeroExpression } from '../../design/assets.ts';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { HUD_FRAME, HudBar, HudPortrait } from '../../shared/ui/game/Hud.tsx';
import { CHRONO_MS, SURVIE_HEARTS, type DefiId } from './rules.ts';
import type { Feedback } from './useDefi.ts';

/** Gain de temps en secondes, au dixième près, virgule française (« 2 », « 4,5 »). */
const formatGain = (ms: number) => String(Math.round(ms / 100) / 10).replace('.', ',');

/** Gros « COMBO ×n » dès ×2. */
function ComboBadge({ combo, reduce }: { readonly combo: number; readonly reduce: boolean | null }) {
  if (combo <= 1) return null;
  return (
    <motion.span
      key={combo}
      initial={reduce ? false : { scale: 1.8, rotate: -8 }}
      animate={{ scale: 1, rotate: 0 }}
      className="font-display text-toon bg-primary-strong rounded-xl px-2 py-0.5 text-lg tracking-wider whitespace-nowrap text-white sm:px-3 sm:text-2xl"
    >
      COMBO ×{combo}
    </motion.span>
  );
}

interface DefiHudProps {
  readonly kind: DefiId;
  readonly hero: HeroId;
  readonly expression: HeroExpression;
  /** Points affichés (qui défilent) et points réels. */
  readonly points: number;
  readonly totalPoints: number;
  readonly correct: number;
  readonly best: number;
  readonly combo: number;
  readonly hearts: number;
  readonly leftMs: number;
  readonly seconds: number;
  readonly pressure: boolean;
  readonly flash: Feedback | null;
  readonly reduce: boolean | null;
  readonly onStop: () => void;
}

/**
 * HUD des défis, même langage que le HUD de combat (cadre, portrait, jauge segmentée) :
 * Survie = les cœurs sont la barre de vie ; Contre-la-montre = le temps restant est la jauge
 * (elle se vide, la traînée blanche marque les gains et pertes de temps).
 */
export function DefiHud(p: DefiHudProps) {
  const timePct = Math.min(100, (p.leftMs / Math.max(CHRONO_MS, p.leftMs)) * 100);
  const pulse = p.pressure && !p.reduce ? 'animate-pulse' : '';
  return (
    <header className={`${HUD_FRAME} relative flex shrink-0 items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3`}>
      <HudPortrait side="left">
        <HeroFace hero={p.hero} expression={p.expression} size={52} />
      </HudPortrait>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-x-2 gap-y-0 sm:gap-x-3">
          <span className="font-display text-toon hidden truncate text-base tracking-wide sm:inline">
            {HERO_NAMES[p.hero]}
          </span>
          <span
            className="font-display text-xl leading-none tabular-nums sm:text-3xl"
            aria-label={`${p.totalPoints} points`}
          >
            {p.points} <span className="text-sm">pts</span>
          </span>
          <span className="text-sm font-bold whitespace-nowrap text-white/90">
            <span aria-hidden className="sm:hidden">
              ✓ {p.correct}
            </span>
            <span className="sr-only sm:not-sr-only">{p.correct} bonnes réponses</span>
          </span>
          <span className="ml-auto text-sm font-bold whitespace-nowrap text-[var(--gold)]">Record {p.best}</span>
        </div>
        {p.kind === 'chrono' ? (
          <HudBar
            side="left"
            kind="time"
            value={Math.round(timePct)}
            max={100}
            segments={10}
            role="progressbar"
            label="Temps restant"
            hit={p.flash?.id ?? 0}
            alert={p.pressure}
          />
        ) : (
          <HudBar
            side="left"
            value={p.hearts}
            max={SURVIE_HEARTS}
            role="img"
            label={`${p.hearts} cœurs sur ${SURVIE_HEARTS}`}
            hit={p.flash && !p.flash.correct ? p.flash.id : 0}
          />
        )}
      </div>
      <div className="relative flex shrink-0 flex-col items-center gap-1">
        {p.kind === 'chrono' ? (
          <span
            role="timer"
            className={`font-display min-w-20 rounded-full px-3 py-1 text-center text-xl tabular-nums ${p.pressure ? `bg-danger-strong text-white ${pulse}` : 'bg-black/40 text-white'}`}
          >
            ⏱ {p.seconds} s
          </span>
        ) : (
          <span className="font-display text-toon text-xl text-white tabular-nums" aria-hidden>
            ♥ {p.hearts}
          </span>
        )}
        <AnimatePresence>
          {p.kind === 'chrono' && p.flash && !p.reduce && (
            <motion.span
              key={p.flash.id}
              aria-hidden
              initial={{ y: 0, opacity: 1, scale: 1.4 }}
              animate={{ y: -18, opacity: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className={`font-display text-toon absolute -bottom-3 text-2xl ${p.flash.correct ? 'text-green-300' : 'text-red-300'}`}
            >
              {p.flash.correct ? `+${formatGain(p.flash.timeGainMs)} s` : '−5 s'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <ComboBadge combo={p.combo} reduce={p.reduce} />
      <GameButton size="sm" variant="surface" onClick={p.onStop}>
        Arrêter
      </GameButton>
    </header>
  );
}
