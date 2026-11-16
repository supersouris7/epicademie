import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/** Petit toast éphémère : `const [toast, show] = useToast()` puis `{toast}` dans le rendu. */
export function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback(
    (text: string) => {
      window.clearTimeout(timer.current);
      setMessage(text);
      timer.current = window.setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );
  const node = (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="cartoon bg-gold font-display fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md p-4 text-center text-xl text-[#1d1638]"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
  return [node, show] as const;
}
