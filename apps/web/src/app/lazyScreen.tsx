import { createElement, lazy, Suspense, useState, type FunctionComponent } from 'react';
import { ScreenSkeleton } from '../shared/ui/Skeleton.tsx';

/** Écran à la demande : `preload` télécharge son code d'avance. */
export type PreloadableScreen<P extends object> = FunctionComponent<P> & { readonly preload: () => Promise<unknown> };

/**
 * Écran chargé à la demande : son code est téléchargé à la 1re visite, ou d'avance par `preload`.
 * Déjà là, il s'affiche tout de suite ; sinon sa silhouette tient la place (et non l'écran
 * précédent figé).
 */
export function lazyScreen<P extends object>(load: () => Promise<FunctionComponent<P>>): PreloadableScreen<P> {
  let ready: FunctionComponent<P> | undefined;
  let pending: Promise<{ default: FunctionComponent<P> }> | undefined;
  const fetchScreen = () =>
    (pending ??= load().then(
      (screen) => {
        ready = screen;
        return { default: screen };
      },
      (error: unknown) => {
        pending = undefined; // Échec (réseau) : la prochaine demande réessaie.
        throw error;
      },
    ));
  const Lazy = lazy<FunctionComponent<P>>(fetchScreen);
  function LazyScreen(props: P) {
    // Choisi au montage : un code arrivé ensuite ne doit pas remonter l'écran affiché.
    const [screen] = useState(() => ready ?? (Lazy as FunctionComponent<P>));
    return <Suspense fallback={<ScreenSkeleton />}>{createElement(screen, props)}</Suspense>;
  }
  return Object.assign(LazyScreen, { preload: fetchScreen });
}

/** Télécharge d'avance le code des écrans, groupe après groupe (les plus proches d'abord). */
export async function preloadScreens(groups: readonly (readonly { readonly preload: () => Promise<unknown> }[])[]) {
  for (const group of groups) {
    // Un échec n'est pas grave : l'écran sera redemandé à la visite.
    await Promise.allSettled(group.map((screen) => screen.preload()));
  }
}
