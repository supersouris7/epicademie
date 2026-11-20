/** Pastille « Abonnement » sur un chapitre réservé à l'abonnement familial. */
export function PremiumLock() {
  return (
    <span className="bg-accent inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor" />
      </svg>
      Abonnement
    </span>
  );
}
