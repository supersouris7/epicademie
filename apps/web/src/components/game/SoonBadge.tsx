/** Pastille « À venir », la même partout (modes, matières, boss, héros). Posée dans un coin d'un parent `relative`. */
export function SoonBadge({ className = '' }: { readonly className?: string }) {
  return (
    <span
      aria-hidden
      className={`cartoon bg-gold font-display text-on-light pointer-events-none absolute -top-3 -right-2 z-10 px-3 py-0.5 text-sm tracking-wide ${className}`}
      style={{ borderRadius: '9999px' }}
    >
      À venir
    </span>
  );
}
