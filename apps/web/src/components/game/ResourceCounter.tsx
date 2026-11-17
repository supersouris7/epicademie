import { AnimatePresence, motion } from 'motion/react';
import { SPRING } from '../../design/motion.ts';
import { GameIcon } from './GameIcon.tsx';

interface ResourceCounterProps {
  /** Icône du catalogue (pièce, XP, série…). */
  readonly icon: string;
  readonly value: number | string;
  /** Nom accessible complet (ex. « 120 pièces »). */
  readonly label: string;
  /** Bouton « + » vert (boutique, à venir) ; absent = pas de bouton. */
  readonly onAdd?: () => void;
  readonly className?: string;
}

const format = (v: number | string) => (typeof v === 'number' ? v.toLocaleString('fr-FR') : v);

/** Compteur de ressource : capsule violet foncé, icône qui déborde à gauche, valeur qui rebondit quand elle change. */
export function ResourceCounter({ icon, value, label, onAdd, className = '' }: ResourceCounterProps) {
  return (
    <div className={`relative flex h-11 items-center pl-7 ${className}`} role="status" aria-label={label}>
      <span className="absolute left-0 z-10 drop-shadow-[0_2px_0_var(--shadow)]">
        <GameIcon id={icon} size={44} />
      </span>
      <span className="border-outline bg-accent-strong font-display text-toon flex h-9 min-w-20 items-center justify-end overflow-hidden rounded-full border-[length:var(--stroke-sm)] pr-3 pl-6 text-lg">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={String(value)}
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={SPRING.bounce}
          >
            {format(value)}
          </motion.span>
        </AnimatePresence>
      </span>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Obtenir plus : ${label}`}
          className="cartoon bg-success -ml-3 flex h-9 w-9 items-center justify-center rounded-full"
        >
          <GameIcon id="icons-navigation-plus" size="xs" />
        </button>
      )}
    </div>
  );
}
