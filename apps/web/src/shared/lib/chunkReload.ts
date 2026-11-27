/**
 * Après une mise à jour, les morceaux de l'ancienne version n'existent plus sur le serveur : une page
 * restée ouverte ne peut plus charger un écran. On la recharge, une fois par délai (pas de boucle si
 * le réseau est coupé : l'écran de secours prend alors le relais). Un téléchargement d'avance qui
 * échoue ne recharge rien : la page en cours (une partie, peut-être) n'en a pas besoin.
 */

const KEY = 'epicademie:rechargement';
const DELAY_MS = 60_000;

const background = new WeakSet();
const awaited = new WeakSet();

/** Dit si un écran affiché attendait le code qui n'a pas pu être chargé. */
export function reportChunkFailure(error: unknown, isAwaited: boolean) {
  if (error instanceof Object) (isAwaited ? awaited : background).add(error);
}

export function installChunkReload(reload: () => void = () => window.location.reload()): () => void {
  const recover = (error: object) => {
    if (!navigator.onLine || (background.has(error) && !awaited.has(error))) return;
    try {
      if (Date.now() - Number(sessionStorage.getItem(KEY)) < DELAY_MS) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      return; // Stockage indisponible : sans mémoire du dernier essai, on ne recharge pas.
    }
    reload();
  };
  // Après la suite de l'import en échec, qui dit s'il était attendu.
  const onError = (event: Event & { readonly payload?: unknown }) => {
    const error = event.payload instanceof Object ? event.payload : event;
    setTimeout(() => recover(error));
  };
  window.addEventListener('vite:preloadError', onError);
  return () => window.removeEventListener('vite:preloadError', onError);
}
