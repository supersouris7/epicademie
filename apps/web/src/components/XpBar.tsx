import { motion } from 'motion/react';
import { levelFromXp } from '@questeo/engine';
import type { Gender } from '@questeo/shared';

export function XpBar({ xp, gender = null }: { readonly xp: number; readonly gender?: Gender | null }) {
  const { level, xpInLevel, xpForNext, title } = levelFromXp(xp, gender);
  const pct = Math.round((xpInLevel / xpForNext) * 100);
  return (
    <div className="flex items-center gap-3">
      <div
        className="cartoon font-display bg-gold flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl text-[#1d1638]"
        style={{ borderRadius: '9999px' }}
        aria-label={`Niveau ${level}`}
      >
        {level}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-sm font-bold">
          <span className="font-display text-lg tracking-wide">{title}</span>
          <span className="text-muted">
            {xpInLevel} / {xpForNext} XP
          </span>
        </div>
        <div
          className="border-outline bg-surface-2 h-5 overflow-hidden rounded-full border-4"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={xpForNext}
          aria-valuenow={xpInLevel}
          aria-label="Progression vers le niveau suivant"
        >
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>
      </div>
    </div>
  );
}
