import { motion } from 'motion/react';
import type { Skill } from '@questeo/content';
import { GameButton } from '../game/GameButton.tsx';
import { MathText } from '../MathText.tsx';
import { Questy } from '../mascot/Questy.tsx';

/** « Le truc à retenir » : le mémo de la notion, en quelques phrases de Questy. Jamais imposé. */
export function Memo({ skill, onClose }: { readonly skill: Skill; readonly onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Le truc à retenir : ${skill.title}`}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon bg-surface flex max-h-[85dvh] w-full max-w-xl flex-col gap-3 overflow-y-auto p-5"
      >
        <div className="flex items-center gap-3">
          <Questy mood="wink" size={84} />
          <div>
            <p className="text-muted text-sm font-bold">Le truc à retenir</p>
            <h2 className="font-display text-2xl tracking-wide">{skill.title}</h2>
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {skill.lesson.memo.map((p, i) => (
            <li key={i} className="bg-surface-2 rounded-2xl p-3 text-lg leading-snug">
              <MathText text={p} />
            </li>
          ))}
        </ul>
        <p className="text-muted text-xs">Source : {skill.lesson.source}</p>
        <GameButton className="self-end" variant="success" onClick={onClose}>
          J’ai compris
        </GameButton>
      </motion.div>
    </div>
  );
}
