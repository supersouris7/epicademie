import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ITEM_INFO, ITEMS, type Chest } from '@questeo/shared';
import { ITEM_ICONS } from '../../design/items.ts';
import { playSound } from '../../lib/sound.ts';
import { GameIcon } from './GameIcon.tsx';

const RARITY = {
  commun: { name: 'Coffre commun', icon: 'rewards-chests-commun', glow: '#b9b9c9' },
  rare: { name: 'Coffre rare', icon: 'rewards-chests-rare', glow: '#b06bff' },
  epique: { name: 'Coffre épique', icon: 'rewards-chests-epique', glow: '#ffd23f' },
} as const;

/**
 * Coffre d'équipement de fin de série : il tremble, l'enfant le touche, il s'ouvre et montre son contenu.
 * Pas de coffre cette fois : un mot pour dire qu'un meilleur score augmente les chances.
 */
export function ChestReveal({ chest }: { readonly chest: Chest | null }) {
  const [open, setOpen] = useState(false);
  if (!chest) {
    return (
      <p className="cartoon bg-surface-2 flex items-center justify-center gap-2 p-3 text-center font-bold">
        <GameIcon id="rewards-chests-commun" size="sm" />
        Pas de coffre cette fois. Plus tu as de bonnes réponses, plus tu as de chances (5/5 = coffre garanti) !
      </p>
    );
  }
  const r = RARITY[chest.rarity];
  const items = ITEMS.filter((i) => (chest.items[i] ?? 0) > 0);
  return (
    <section className="cartoon bevel bg-accent flex flex-col items-center gap-3 p-4 text-center" aria-live="polite">
      <h2 className="font-display text-toon text-2xl">{open ? r.name : 'Un coffre d’équipement !'}</h2>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="closed"
            type="button"
            onClick={() => {
              setOpen(true);
              playSound('reveal');
            }}
            aria-label="Ouvrir le coffre"
            animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.6 }}
            exit={{ scale: 1.4, opacity: 0 }}
            className="flex flex-col items-center gap-1"
            style={{ filter: `drop-shadow(0 0 16px ${r.glow})` }}
          >
            <GameIcon id={r.icon} size={110} />
            <span className="font-display text-toon text-lg">Touche pour l’ouvrir</span>
          </motion.button>
        ) : (
          <motion.div
            key="open"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="flex flex-wrap items-end justify-center gap-4"
          >
            {items.map((i, k) => (
              <motion.span
                key={i}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 * k }}
                className="flex flex-col items-center gap-1 font-bold text-white"
              >
                <GameIcon id={ITEM_ICONS[i]} size={64} />
                {ITEM_INFO[i].name} +{chest.items[i]}
              </motion.span>
            ))}
            <motion.span
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 * items.length }}
              className="flex flex-col items-center gap-1 font-bold text-white"
            >
              <GameIcon id="icons-resources-coin" size={64} />+{chest.coins} pièces
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {open && <p className="font-bold text-white">Ton équipement t’attend pour les combats de boss !</p>}
    </section>
  );
}
