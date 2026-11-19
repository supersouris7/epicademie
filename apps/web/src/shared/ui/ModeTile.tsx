import { motion } from 'motion/react';
import type { ModeInfo } from '@questeo/shared';
import { CATEGORY_COLORS, MODE_MOODS } from '../lib/modes.ts';
import { assetSrc } from '../../design/assets.ts';
import { GameIcon } from './game/GameIcon.tsx';
import { SoonBadge } from './game/SoonBadge.tsx';
import { Questy } from './mascot/Questy.tsx';
import { useEntrance } from '../lib/entrance.ts';

interface ModeTileProps {
  readonly mode: ModeInfo;
  readonly index?: number;
  readonly badge?: number;
  readonly onClick: () => void;
}

export function ModeTile({ mode, index = 0, badge, onClick }: ModeTileProps) {
  const enter = useEntrance();
  return (
    <motion.li
      initial={enter ? { scale: 0.85, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.05 + index * 0.04, type: 'spring', stiffness: 220, damping: 15 }}
      className="relative"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={mode.available ? undefined : `${mode.name}, à venir`}
        className={`cartoon bevel cartoon-press gloss flex min-h-20 w-full flex-col items-center justify-center gap-1 p-2.5 text-center text-white sm:flex-row sm:justify-start sm:gap-3 sm:p-3 sm:text-left ${mode.available ? 'hover:brightness-110' : 'saturate-[0.55] brightness-[0.8]'}`}
        style={{ backgroundColor: CATEGORY_COLORS[mode.category] }}
      >
        {assetSrc(`icons-modes-${mode.id}`) ? (
          <GameIcon id={`icons-modes-${mode.id}`} size={52} className="shrink-0" />
        ) : (
          <Questy mood={MODE_MOODS[mode.id]} size={52} title="" />
        )}
        {/* Juste le nom : l'explication du mode est donnée sur son écran. */}
        <span className="font-display text-toon text-lg leading-tight tracking-wide sm:min-w-0 sm:flex-1 sm:text-2xl">
          {mode.name}
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
