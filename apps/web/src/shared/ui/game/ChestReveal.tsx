import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ITEMS, ITEM_INFO, type Chest } from '@questeo/shared';
import { ITEM_ICONS } from '../../../design/items.ts';
import { playSound } from '../../lib/sound.ts';
import { GameButton } from './GameButton.tsx';
import { GameIcon } from './GameIcon.tsx';

/** Le même coffre illustré partout dans l'appli, teinté selon la rareté. */
export const CHEST_ICON = 'rewards-chests-rare';
const RARITY = {
  commun: { name: 'Coffre commun', tint: 'grayscale(0.85) brightness(1.1)', glow: '#9fb3c8' },
  rare: { name: 'Coffre rare', tint: 'none', glow: '#b26bff' },
  epique: { name: 'Coffre épique', tint: 'hue-rotate(-70deg) saturate(1.4) brightness(1.1)', glow: '#ffd23f' },
} as const;

/** Éclairs autour du coffre fermé (dessinés en code, couleur de la rareté). */
function Bolts({ color }: { readonly color: string }) {
  const reduce = useReducedMotion();
  const bolts = [
    { x: 8, y: 22, r: -20 },
    { x: 82, y: 18, r: 25 },
    { x: 4, y: 62, r: 15 },
    { x: 86, y: 60, r: -15 },
  ];
  return (
    <>
      {bolts.map((b, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 48"
          className="pointer-events-none absolute h-24 w-12"
          style={{ left: `${b.x}%`, top: `${b.y}%`, rotate: b.r, filter: `drop-shadow(0 0 10px ${color})` }}
          animate={reduce ? undefined : { opacity: [0, 1, 0.2, 1, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22, repeatDelay: 0.4 }}
          aria-hidden
        >
          <path d="M14 0 L2 26 H11 L7 48 L22 18 H13 Z" fill="white" stroke={color} strokeWidth="2" />
        </motion.svg>
      ))}
    </>
  );
}

/**
 * Coffre d'équipement de fin de série, en plein écran : il tremble entouré d'éclairs ; un toucher
 * l'ouvre dans un flash, des rayons tournent et le butin jaillit objet par objet.
 * Pas de coffre cette fois : un mot pour dire qu'un meilleur score augmente les chances.
 */
export function ChestReveal({ chest }: { readonly chest: Chest | null }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<'closed' | 'open' | 'done'>('closed');
  if (!chest) {
    return (
      <p className="cartoon bg-surface-2 flex items-center justify-center gap-2 p-3 text-center font-bold">
        <GameIcon id={CHEST_ICON} size="sm" className="grayscale" />
        Pas de coffre cette fois. Plus tu as de bonnes réponses, plus tu as de chances (sans faute = coffre garanti) !
      </p>
    );
  }
  const r = RARITY[chest.rarity];
  const items = ITEMS.filter((i) => (chest.items[i] ?? 0) > 0);
  const loot = [
    ...items.map((i) => ({ id: i, icon: ITEM_ICONS[i], label: `${ITEM_INFO[i].name} +${chest.items[i] ?? 0}` })),
    { id: 'coins', icon: 'icons-resources-coin', label: `+${chest.coins} pièces` },
    ...(chest.rubies > 0 ? [{ id: 'rubies', icon: 'icons-resources-gem', label: `+${chest.rubies} rubis` }] : []),
  ];

  // Après la révélation : le butin reste résumé dans le bilan.
  if (stage === 'done') {
    return (
      <section className="cartoon bevel bg-accent flex flex-col items-center gap-2 p-3 text-center">
        <h2 className="font-display text-toon text-xl">{r.name}</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {loot.map((l) => (
            <span key={l.id} className="flex items-center gap-1 font-bold text-white">
              <GameIcon id={l.icon} size={36} />
              {l.label}
            </span>
          ))}
        </div>
      </section>
    );
  }

  const open = () => {
    if (stage !== 'closed') return;
    setStage('open');
    playSound('reveal');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={stage === 'closed' ? 'Un coffre d’équipement !' : r.name}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#3b1d6e_0%,#160b2e_60%,#08040f_100%)] px-4 text-center"
    >
      <motion.h2
        key={stage}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-toon text-4xl tracking-wide sm:text-5xl"
      >
        {stage === 'closed' ? 'Un coffre d’équipement !' : r.name}
      </motion.h2>

      <div className="relative flex h-[min(52vw,300px)] w-[min(80vw,420px)] items-center justify-center">
        {stage === 'closed' ? (
          <>
            <Bolts color={r.glow} />
            <motion.button
              type="button"
              onClick={open}
              aria-label="Ouvrir le coffre"
              animate={reduce ? undefined : { rotate: [0, -7, 7, -5, 5, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.35 }}
              className="relative z-10 flex cursor-pointer flex-col items-center gap-2"
              style={{ filter: `drop-shadow(0 0 28px ${r.glow})` }}
            >
              <span style={{ filter: r.tint }} className="block">
                <GameIcon id={CHEST_ICON} size={190} />
              </span>
            </motion.button>
          </>
        ) : (
          <>
            {/* Rayons de lumière qui tournent derrière le coffre ouvert. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-[-60%]"
              style={{
                background: `repeating-conic-gradient(from 0deg, ${r.glow}55 0deg 10deg, transparent 10deg 24deg)`,
                maskImage: 'radial-gradient(circle, black 15%, transparent 60%)',
              }}
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }}
              animate={{ scale: [0.4, 1.25, 1], rotate: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 30px ${r.glow})` }}
              className="relative"
            >
              {/* Coffre ouvert : le même coffre qui bondit, couvercle soulevé (inclinaison) dans la lumière. */}
              <span style={{ filter: `${r.tint === 'none' ? '' : r.tint} brightness(1.25)` }} className="block">
                <GameIcon id={CHEST_ICON} size={190} />
              </span>
            </motion.div>
            {/* Flash blanc de l'ouverture. */}
            <motion.div
              aria-hidden
              className="pointer-events-none fixed inset-0 bg-white"
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </>
        )}
      </div>

      {stage === 'closed' ? (
        <motion.p
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="font-display text-toon text-2xl"
        >
          Touche le coffre pour l’ouvrir !
        </motion.p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-center gap-5" aria-live="polite">
            {loot.map((l, k) => (
              <motion.span
                key={l.id}
                initial={{ y: -120, scale: 0.2, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                transition={{ delay: 0.45 + 0.3 * k, type: 'spring', stiffness: 260, damping: 12 }}
                className="flex flex-col items-center gap-1 font-bold text-white"
              >
                <GameIcon id={l.icon} size={72} />
                {l.label}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + 0.3 * loot.length }}
            className="flex flex-col items-center gap-3"
          >
            <p className="font-bold text-white">Ton équipement t’attend pour les combats de boss !</p>
            <GameButton icon="icons-navigation-next" onClick={() => setStage('done')}>
              Super !
            </GameButton>
          </motion.div>
        </>
      )}
    </div>
  );
}
