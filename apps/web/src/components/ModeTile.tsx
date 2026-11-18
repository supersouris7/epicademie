import { motion } from 'motion/react';
import type { ModeInfo } from '@questeo/shared';
import { CATEGORY_COLORS, MODE_MOODS } from '../lib/modes.ts';
import { assetSrc } from '../design/assets.ts';
import { GameIcon } from './game/GameIcon.tsx';
import { SoonBadge } from './game/SoonBadge.tsx';
import { Questy } from './mascot/Questy.tsx';

interface ModeTileProps {
  readonly mode: ModeInfo;
  readonly index?: number;
  readonly badge?: number;
  readonly onClick: () => void;
}

export function ModeTile({ mode, index = 0, badge, onClick }: ModeTileProps) {
  return (
    <motion.li
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.05 + index * 0.04, type: 'spring', stiffness: 220, damping: 15 }}
      className="relative"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={mode.available ? undefined : `${mode.name}, à venir`}
        className={`cartoon bevel cartoon-press flex min-h-28 w-full items-center gap-3 p-3 text-left text-white ${mode.available ? 'hover:brightness-110' : 'opacity-70 grayscale-[0.7]'}`}
        style={{ backgroundColor: CATEGORY_COLORS[mode.category] }}
      >
        {assetSrc(`icons-modes-${mode.id}`) ? (
          <GameIcon id={`icons-modes-${mode.id}`} size={64} />
        ) : (
          <Questy mood={MODE_MOODS[mode.id]} size={64} title="" />
        )}
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-toon text-xl tracking-wide sm:text-2xl">{mode.name}</span>
          <span className="text-sm font-bold opacity-95">{mode.pitch}</span>
        </span>
      </button>
      {!mode.available && <SoonBadge />}
      {badge !== undefined && badge > 0 && (
        <span
          className="cartoon bg-danger font-display absolute -top-3 -right-2 flex h-10 min-w-10 items-center justify-center px-2 text-lg text-white"
          style={{ borderRadius: '9999px' }}
          aria-label={`${badge} à revoir`}
        >
          {badge}
        </span>
      )}
    </motion.li>
  );
}
