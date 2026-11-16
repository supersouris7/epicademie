import { motion } from 'motion/react';
import type { ModeInfo } from '@questeo/shared';
import { CATEGORY_COLORS, MODE_MOODS } from '../lib/modes.ts';
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
        className="cartoon cartoon-press flex min-h-28 w-full items-center gap-3 p-3 text-left text-white"
        style={{ backgroundColor: CATEGORY_COLORS[mode.category] }}
      >
        <Questy mood={MODE_MOODS[mode.id]} size={64} title="" />
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-xl tracking-wide drop-shadow-[0_2px_0_var(--outline)] sm:text-2xl">
            {mode.name}
          </span>
          <span className="text-sm font-bold opacity-95">{mode.pitch}</span>
        </span>
      </button>
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
