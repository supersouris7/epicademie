import { motion } from 'motion/react';
import { GameButton } from './game/GameButton.tsx';
import { Questy } from './mascot/Questy.tsx';
import type { MoodId } from './mascot/moods.ts';

interface ConfirmDialogProps {
  readonly title: string;
  readonly message: string;
  readonly confirm: string;
  readonly cancel: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  /** Humeur de Questy (triste par défaut ; « pause » plus neutre). */
  readonly mood?: MoodId;
  /** Choix positif (aide, rappel) : bouton de confirmation vert, l'autre neutre. Sinon : quitter. */
  readonly positive?: boolean;
}

/** Confirmation aux couleurs de l'appli (remplace window.confirm, peu lisible sur tablette). */
export function ConfirmDialog({
  title,
  message,
  confirm,
  cancel,
  onConfirm,
  onCancel,
  mood = 'sad',
  positive = false,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="cartoon border-accent bg-surface flex w-full max-w-md flex-col items-center gap-4 p-6 text-center"
      >
        <Questy mood={mood} size={120} />
        <h2 className="font-display text-3xl tracking-wide">{title}</h2>
        <p className="text-lg">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <GameButton
            variant={positive ? 'surface' : 'success'}
            icon={positive ? undefined : 'icons-navigation-play'}
            onClick={onCancel}
          >
            {cancel}
          </GameButton>
          <GameButton
            variant={positive ? 'success' : 'danger'}
            icon={positive ? 'icons-navigation-check' : 'icons-navigation-close'}
            onClick={onConfirm}
          >
            {confirm}
          </GameButton>
        </div>
      </motion.div>
    </div>
  );
}
