import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { skinStyle } from '../design/skin.ts';
import { useEntrance } from '../lib/entrance.ts';

export function SpeechBubble({ children }: { readonly children: ReactNode }) {
  const enter = useEntrance();
  const skin = skinStyle('hud/frames/bubble.webp', 30, '1rem');
  return (
    <motion.div
      initial={enter ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
      className={`font-display relative px-5 py-4 text-xl tracking-wide sm:text-2xl ${skin ? 'on-light' : 'cartoon border-accent bg-surface'}`}
      style={skin}
    >
      {children}
      {/* La bulle illustrée a sa propre pointe. */}
      {!skin && (
        <span
          aria-hidden
          className="border-accent bg-surface absolute top-1/2 -left-[14px] h-6 w-6 -translate-y-1/2 rotate-45 border-b-4 border-l-4"
        />
      )}
    </motion.div>
  );
}
