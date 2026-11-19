import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { assetSrc } from '../../design/assets.ts';
import { localToday } from '../../lib/dates.ts';
import { safeStorage } from '../../lib/storage.ts';
import { Bubble } from '../Bubble.tsx';
import { GameButton } from '../game/GameButton.tsx';

const KEY = 'questeo.empereur.';

/** L'Empereur ne se présente qu'une fois par jour et par joueur. */
export function emperorDue(profileId: string): boolean {
  return safeStorage.get(KEY + profileId) !== localToday();
}

const LINES = {
  seul: 'Mes gardiens protègent les reliques du savoir… Aucun élève ne les approchera !',
  reliques: '…et avec tout ce savoir, je vais dominer le monde ! Mouahahaha !',
} as const;

/**
 * L'Empereur du Savoir, grand boss, maître des gardiens des reliques : plein écran en deux temps
 * (lui seul, puis entouré des reliques qui apparaissent). Environ 4 s par temps, un toucher avance.
 */
export function EmperorScene({ profileId, onDone }: { readonly profileId: string; readonly onDone: () => void }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<'seul' | 'reliques'>('seul');
  // Vue pour aujourd'hui seulement une fois refermée (un écran remonté la rejoue sinon).
  const done = () => {
    safeStorage.set(KEY + profileId, localToday());
    onDone();
  };
  useEffect(() => {
    const t = window.setTimeout(() => (stage === 'seul' ? setStage('reliques') : undefined), 4200);
    return () => window.clearTimeout(t);
  }, [stage]);
  const next = () => (stage === 'seul' ? setStage('reliques') : done());
  const seul = assetSrc('bosses-empereur-empereur');
  const avec = assetSrc('bosses-empereur-empereur-reliques');
  const img = 'max-h-[58dvh] w-[min(92vw,560px)] object-contain';
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="L’Empereur du Savoir"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#5a1f9a_0%,#24104a_50%,#0b0518_90%)] px-4 py-6 text-center"
    >
      <button type="button" aria-label="Passer" onClick={next} className="absolute inset-0 cursor-pointer" />
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-toon pointer-events-none relative text-3xl tracking-wide sm:text-5xl"
      >
        L’Empereur du Savoir
      </motion.h1>
      <div className="pointer-events-none relative">
        {seul && (
          <motion.img
            src={seul}
            alt=""
            aria-hidden
            className={img}
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: stage === 'seul' ? 1 : 0 }}
            transition={{ duration: stage === 'seul' ? 0.9 : 0.8 }}
          />
        )}
        {/* Les reliques apparaissent autour de lui. */}
        {avec && (
          <motion.img
            src={avec}
            alt=""
            aria-hidden
            className={`absolute inset-0 ${img}`}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={stage === 'reliques' ? { opacity: 1, scale: [1.08, 1, 1.02, 1] } : { opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
        {!reduce && stage === 'reliques' && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 bg-[#e9d5ff]"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        )}
      </div>
      <motion.div
        key={stage}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 240, damping: 14 }}
        className="pointer-events-none relative max-w-lg"
        role="status"
      >
        <Bubble tail="none" tone="villain" className="px-5 py-3 text-lg sm:text-2xl">
          {LINES[stage]}
        </Bubble>
      </motion.div>
      {stage === 'reliques' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="relative">
          <GameButton variant="danger" size="lg" icon="icons-navigation-play" onClick={done}>
            Relever le défi
          </GameButton>
        </motion.div>
      )}
    </div>
  );
}
