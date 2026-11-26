/**
 * Après une mise à jour, les morceaux de l'ancienne version n'existent plus sur le serveur : une page
 * restée ouverte ne peut plus charger un écran. On la recharge, une fois par délai (pas de boucle si
 * le réseau est coupé : l'écran de secours prend alors le relais).
 */

const KEY = 'epicademie:rechargement';
const DELAY_MS = 60_000;

export function installChunkReload(reload: () => void = () => window.location.reload()): () => void {
  const onError = () => {
    if (!navigator.onLine) return;
    try {
      if (Date.now() - Number(sessionStorage.getItem(KEY)) < DELAY_MS) return;
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      return; // Stockage indisponible : sans mémoire du dernier essai, on ne recharge pas.
    }
    reload();
  };
  window.addEventListener('vite:preloadError', onError);
  return () => window.removeEventListener('vite:preloadError', onError);
}
