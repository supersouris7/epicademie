/**
 * Silhouettes montrées le temps qu'arrivent des données jamais reçues : la page garde sa forme, sans
 * message. Les données déjà connues s'affichent tout de suite (cache React Query) et ne passent
 * jamais par ici.
 */
const BAR = 'bg-ink/10 animate-pulse rounded-2xl motion-reduce:animate-none';

/** Place réservée dans une page déjà affichée (titre et retour restent à l'écran). */
export function BlockSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex w-full flex-col gap-3">
      <span className="sr-only">Un instant…</span>
      <div aria-hidden className={`${BAR} h-16`} />
      <div aria-hidden className={`${BAR} h-28`} />
      <div aria-hidden className={`${BAR} h-28`} />
    </div>
  );
}

/** Écran entier : barre de titre puis contenu. */
export function ScreenSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-4 sm:px-6">
      <BlockSkeleton />
    </div>
  );
}
