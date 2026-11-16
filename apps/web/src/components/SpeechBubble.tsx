import type { ReactNode } from 'react';
import { motion } from 'motion/react';

export function SpeechBubble({ children }: { readonly children: ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
      className="cartoon bg-surface font-display relative px-5 py-4 text-xl tracking-wide sm:text-2xl"
    >
      {children}
      <span
        aria-hidden
        className="border-outline bg-surface absolute top-1/2 -left-[14px] h-6 w-6 -translate-y-1/2 rotate-45 border-b-4 border-l-4"
      />
    </motion.div>
  );
}
