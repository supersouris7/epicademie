/**
 * Symbole d'alerte (triangle et point d'exclamation dessinés) : double la couleur rouge quand il
 * reste une seule vie ou que le temps presse. Décoratif : l'information est déjà dans les libellés.
 */
export function AlertSymbol({ className = '' }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden data-alert-symbol className={`h-6 w-6 shrink-0 ${className}`}>
      <path d="M12 2.5 22.5 21h-21z" fill="#ffd43b" stroke="#1b0f33" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="#1b0f33" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.6" fill="#1b0f33" />
    </svg>
  );
}
