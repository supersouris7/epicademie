import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ITEMS, ITEM_INFO, type Chest, type ChestRarity, HERO_NAMES } from '@questeo/shared';
import { chestIcon, ITEM_ICONS } from '../../../design/items.ts';
import { playSound } from '../../lib/sound.ts';
import { BlinkText } from './BlinkText.tsx';
import { GameIcon } from './GameIcon.tsx';

/** Coffre générique (icônes, notes) : le coffre rare. */
export const CHEST_ICON = 'rewards-chests-rare';
const RARITY: Record<ChestRarity, { readonly name: string; readonly glow: string }> = {
  commun: { name: 'Coffre commun', glow: '#9fb3c8' },
  rare: { name: 'Coffre rare', glow: '#3fa9ff' },
  epique: { name: 'Coffre épique', glow: '#b26bff' },
  legendaire: { name: 'Coffre légendaire', glow: '#ffd23f' },
};

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
 * Lumière qui SORT du coffre ouvert : origine à l'ouverture du couvercle, un faisceau jaillit vers
 * le haut, puis les rayons s'étendent en tournant. Avec prefers-reduced-motion : l'état final, fixe.
 */
function ChestLight({ color }: { readonly color: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      data-testid="chest-light"
      aria-hidden
      className="pointer-events-none absolute top-[30%] left-1/2 -z-10 h-0 w-0"
    >
      {/* Faisceau qui monte de l'ouverture. */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-[260px] w-24 origin-bottom -translate-x-1/2 mix-blend-screen blur-md"
        style={{ background: `linear-gradient(to top, #fff 0%, ${color} 40%, transparent 100%)` }}
        initial={reduce ? false : { scaleY: 0, scaleX: 0.4, opacity: 0 }}
        animate={reduce ? { opacity: 0.7 } : { scaleY: [0, 1, 0.7], scaleX: [0.4, 1, 1.3], opacity: [0, 1, 0.7] }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
      {/* Rayons qui s'étendent depuis l'ouverture, puis tournent. */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2"
        initial={reduce ? false : { scale: 0.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
      >
        <motion.div
          className="h-full w-full"
          style={{
            background: `repeating-conic-gradient(from 0deg, ${color}66 0deg 10deg, transparent 10deg 24deg)`,
            maskImage: 'radial-gradient(circle, black 10%, transparent 62%)',
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      {/* Éclat au cœur de l'ouverture. */}
      <motion.span
        className="absolute top-1/2 left-1/2 h-24 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen blur-md"
        style={{ background: `radial-gradient(ellipse, #fff 0%, ${color} 45%, transparent 75%)` }}
        animate={reduce ? { opacity: 0.9 } : { opacity: [0.6, 1, 0.6], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 1.8, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/**
 * Coffre d'équipement (fin de série entièrement juste, victoire contre un boss), en plein écran :
 * le coffre de sa rareté tremble entouré d'éclairs ; un toucher n'importe où l'ouvre dans un flash,
 * la lumière jaillit du coffre et le butin sort objet par objet ; un nouveau toucher continue
 * (Entrée et Espace aussi : un bouton invisible couvre l'écran).
 * Pas de coffre cette fois : un mot pour dire comment en gagner un.
 */
export function ChestReveal({ chest }: { readonly chest: Chest | null }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<'closed' | 'open' | 'done'>('closed');
  const target = useRef<HTMLButtonElement>(null);
  // Entrée et Espace marchent dès l'affichage : le bouton plein écran prend le focus.
  useEffect(() => {
    target.current?.focus();
  }, [chest]);
  if (!chest) {
    return (
      <p className="cartoon bg-surface-2 flex items-center justify-center gap-2 p-3 text-center font-bold">
        <GameIcon id={chestIcon('commun')} size="sm" className="grayscale" />
        Pas de coffre cette fois : trouve toutes les réponses de la série (même avec l’indice) pour en gagner un. Sans
        faute du premier coup, le coffre est souvent meilleur !
      </p>
    );
  }
  const r = RARITY[chest.rarity];
  const items = ITEMS.filter((i) => (chest.items[i] ?? 0) > 0);
  const loot = [
    ...items.map((i) => ({ id: i, icon: ITEM_ICONS[i], label: `${ITEM_INFO[i].name} +${chest.items[i] ?? 0}` })),
    { id: 'coins', icon: 'icons-resources-coin', label: `+${chest.coins} pièces` },
    ...(chest.rubies > 0 ? [{ id: 'rubies', icon: 'icons-resources-gem', label: `+${chest.rubies} rubis` }] : []),
    ...(chest.hero
      ? [
          {
            id: 'hero',
            icon: 'icons-navigation-team',
            label: chest.hero.duplicate
              ? `${HERO_NAMES[chest.hero.id]} est déjà dans ta collection : changé en pièces`
              : `Nouvel Acad-Héros : ${HERO_NAMES[chest.hero.id]} !`,
          },
        ]
      : []),
  ];

  // Après la révélation : le butin reste résumé dans le bilan.
  if (stage === 'done') {
    return (
      <section className="cartoon bevel bg-accent flex flex-col items-center gap-2 p-3 text-center">
        <h2 className="font-display text-toon flex items-center gap-2 text-xl">
          <GameIcon id={chestIcon(chest.rarity, true)} size={44} />
          {r.name}
        </h2>
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

  const advance = () => {
    if (stage === 'closed') {
      setStage('open');
      playSound('chest');
    } else {
      setStage('done');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={stage === 'closed' ? 'Un coffre d’équipement !' : r.name}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#3b1d6e_0%,#160b2e_60%,#08040f_100%)] px-4 text-center"
    >
      {/* Cible de tout l'écran : toucher, clic, Entrée ou Espace font avancer. */}
      <button
        type="button"
        ref={target}
        onClick={advance}
        aria-label={stage === 'closed' ? 'Ouvrir le coffre' : 'Continuer'}
        className="absolute inset-0 z-0 cursor-pointer"
      />
      <motion.h2
        key={stage}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-toon pointer-events-none relative z-10 text-4xl tracking-wide sm:text-5xl"
      >
        {stage === 'closed' ? 'Un coffre d’équipement !' : r.name}
      </motion.h2>

      <div className="pointer-events-none relative z-10 flex h-[min(52vw,300px)] w-[min(80vw,420px)] items-center justify-center">
        {stage === 'closed' ? (
          <>
            <Bolts color={r.glow} />
            <motion.div
              animate={reduce ? undefined : { rotate: [0, -7, 7, -5, 5, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.35 }}
              className="relative z-10 flex flex-col items-center gap-2"
              style={{ filter: `drop-shadow(0 0 28px ${r.glow})` }}
            >
              <GameIcon id={chestIcon(chest.rarity)} size={190} />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0.4, rotate: -10 }}
              animate={{ scale: [0.4, 1.25, 1], rotate: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative isolate"
            >
              {/* La lumière sort de l'ouverture du coffre, derrière lui. */}
              <ChestLight color={r.glow} />
              {/* Le même coffre, ouvert, qui bondit dans la lumière. */}
              <div style={{ filter: `drop-shadow(0 0 30px ${r.glow})` }}>
                <GameIcon id={chestIcon(chest.rarity, true)} size={190} />
              </div>
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
          className="font-display text-toon pointer-events-none relative z-10 text-2xl"
        >
          Touche le coffre pour l’ouvrir !
        </motion.p>
      ) : (
        <>
          <div
            className="pointer-events-none relative z-10 flex flex-wrap items-end justify-center gap-5"
            aria-live="polite"
          >
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
            className="pointer-events-none relative z-10 flex flex-col items-center gap-2"
          >
            <p className="font-bold text-white">Ton équipement t’attend pour les combats de boss !</p>
            <BlinkText delay={0} className="text-sm font-bold text-white/70">
              Touche l’écran pour continuer
            </BlinkText>
          </motion.div>
        </>
      )}
    </div>
  );
}
