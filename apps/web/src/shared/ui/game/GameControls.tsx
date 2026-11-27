/**
 * Boutons « Pause » et « Quitter » des parties, communs à tous les modes (entraînement, épreuve,
 * combat, défi, duel) : en icônes, cible de 44 px, toujours au même endroit (en haut à droite de la
 * zone de jeu, « Quitter » tout au bout). La première ligne des écrans leur réserve la place :
 * `pr-14` pour un bouton, `pr-28` pour deux.
 */

const BUTTON =
  'cartoon bevel cartoon-press flex h-11 w-11 shrink-0 items-center justify-center hover:brightness-110 focus-visible:outline-4 focus-visible:outline-offset-2';

function ControlButton({
  label,
  color,
  onClick,
  children,
}: {
  readonly label: string;
  readonly color: string;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`${BUTTON} ${color}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow-[0_2px_0_rgba(0,0,0,0.45)]" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

/**
 * `onPause` absent : le mode ne se met pas en pause. À rendre avant le contenu de l'écran (les
 * fenêtres plein écran passent devant) et hors de tout élément transformé (position fixe).
 */
export function GameControls({ onQuit, onPause }: { readonly onQuit: () => void; readonly onPause?: () => void }) {
  return (
    <div
      role="group"
      aria-label="Commandes de la partie"
      className="fixed top-[18px] right-[calc(max(0px,(100vw-72rem)/2)+18px)] z-40 flex gap-2"
    >
      {onPause && (
        <ControlButton label="Pause" color="bg-accent" onClick={onPause}>
          <rect x="5" y="4" width="5" height="16" rx="1.5" fill="white" />
          <rect x="14" y="4" width="5" height="16" rx="1.5" fill="white" />
        </ControlButton>
      )}
      <ControlButton label="Quitter" color="bg-danger" onClick={onQuit}>
        <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      </ControlButton>
    </div>
  );
}
