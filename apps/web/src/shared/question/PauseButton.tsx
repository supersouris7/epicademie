/** Bouton pause des parties (entraînement et combat) : même place, même look. Ouvre le menu pause. */
export function PauseButton({
  onClick,
  className = '',
}: {
  readonly onClick: () => void;
  readonly className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Pause"
      className={`cartoon bevel cartoon-press bg-accent flex h-11 w-11 shrink-0 items-center justify-center hover:brightness-110 focus-visible:outline-4 focus-visible:outline-offset-2 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow-[0_2px_0_rgba(0,0,0,0.45)]" aria-hidden>
        <rect x="5" y="4" width="5" height="16" rx="1.5" fill="white" />
        <rect x="14" y="4" width="5" height="16" rx="1.5" fill="white" />
      </svg>
    </button>
  );
}
