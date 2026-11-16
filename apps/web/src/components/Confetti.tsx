import { motion } from 'motion/react';
import { useState } from 'react';

const COLORS = ['#ff7a1a', '#4b3fe0', '#12b886', '#ffc83d', '#ef476f', '#00bbf9'];

/** Pluie de confettis (purement décorative). */
export function Confetti({ count = 60 }: { readonly count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.2,
      rotate: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length],
      size: 8 + Math.random() * 8,
    })),
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}
