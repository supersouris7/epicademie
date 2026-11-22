import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { assetSrc } from '../../design/assets.ts';
import { markEmperorSeen } from './emperor.ts';
import { BlinkText } from '../../shared/ui/game/BlinkText.tsx';
import { PassZone } from '../../shared/ui/game/PassZone.tsx';
import { Bubble } from '../../shared/ui/Bubble.tsx';

const LINES = {
  seul: 'Mes gardiens protègent le savoir de toutes les matières… Aucun élève ne les approchera !',
  reliques: '…et avec ce savoir, je vais conquérir le monde ! Mouahahaha !',
} as const;

/**
 * L'Empereur du Savoir, grand boss final, maître des boss des matières : plein écran en deux temps
 * (lui seul, puis entouré des symboles des matières qui apparaissent). Sans bouton : un toucher
 * sur l'écran fait passer chaque étape (rien ne passe tout seul).
 */
export function EmperorScene({ profileId, onDone }: { readonly profileId: string; readonly onDone: () => void }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<'seul' | 'reliques'>('seul');
  // Vue pour aujourd'hui seulement une fois refermée (un écran remonté la rejoue sinon).
  const done = () => {
    markEmperorSeen(profileId);
    onDone();
  };
  // On avance seulement en touchant l'écran (aux deux étapes) : le temps de lire.
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
      <PassZone step={stage} onPass={next} />
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
        {/* Les symboles des matières apparaissent autour de lui. */}
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
      <BlinkText key={`touche-${stage}`}>Touche l’écran pour continuer</BlinkText>
    </div>
  );
}
