import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { glossaryEntry } from '@questeo/content';
import { GameButton } from '../ui/game/GameButton.tsx';
import { DemoView } from './demos/DemoView.tsx';
import { MathText } from './MathText.tsx';
import { markTermSeen } from './termsSeen.ts';

/**
 * Mot du glossaire dans un texte : souligné en pointillés, un toucher ouvre sa définition, un
 * exemple et son schéma. Ne fait rien perdre : la question reste à l'écran derrière.
 */
export function Term({ id, children }: { readonly id: string; readonly children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = glossaryEntry(id);
  if (!entry) return <>{children}</>;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          markTermSeen(id);
          setOpen(true);
        }}
        className="decoration-accent cursor-help underline decoration-dotted decoration-2 underline-offset-4"
        aria-label={`${typeof children === 'string' ? children : entry.word} : que veut dire ce mot ?`}
      >
        {children}
      </button>
      {open && createPortal(<TermDialog id={id} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

export function TermDialog({ id, onClose }: { readonly id: string; readonly onClose: () => void }) {
  const entry = glossaryEntry(id);
  if (!entry) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Le mot « ${entry.word} »`}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="cartoon bg-surface flex max-h-[88dvh] w-full max-w-xl flex-col gap-3 overflow-y-auto p-5"
      >
        <p className="text-muted text-sm font-bold">Le mot</p>
        <h2 className="font-display text-3xl tracking-wide">{entry.word}</h2>
        <p className="text-lg leading-snug">
          <MathText text={entry.definition} />
        </p>
        <p className="bg-surface-2 rounded-2xl p-3 text-lg leading-snug">
          <span className="font-bold">Exemple : </span>
          <MathText text={entry.example} />
        </p>
        {entry.visual && <DemoView demo={entry.visual} />}
        <GameButton className="self-end" variant="success" onClick={onClose}>
          J’ai compris
        </GameButton>
      </motion.div>
    </div>
  );
}
