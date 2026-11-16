import { useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';

/** Panneau d'outil flottant ; signale aux pavés numériques qu'un outil a le clavier. */
export function ToolPanel({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    document.body.dataset.toolOpen = 'true';
    return () => {
      delete document.body.dataset.toolOpen;
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`cartoon bg-surface flex w-full flex-col gap-3 p-4 ${wide ? 'max-w-4xl' : 'max-w-sm'}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cartoon cartoon-press bg-surface-2 font-display h-11 w-11 text-xl"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
