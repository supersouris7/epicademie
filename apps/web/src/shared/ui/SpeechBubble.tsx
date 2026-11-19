import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useEntrance } from '../lib/entrance.ts';
import { Bubble } from './Bubble.tsx';

/** Bulle de Questy dans les menus (dessinée en CSS, pointe vers Questy à gauche). */
export function SpeechBubble({ children }: { readonly children: ReactNode }) {
  const enter = useEntrance();
  return (
    <motion.div
      initial={enter ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
      className="min-w-0 flex-1"
    >
      <Bubble className="font-display px-5 py-3 text-xl tracking-wide sm:text-2xl">{children}</Bubble>
    </motion.div>
  );
}
