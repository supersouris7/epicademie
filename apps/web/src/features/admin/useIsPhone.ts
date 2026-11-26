import { useSyncExternalStore } from 'react';

/** Sous 700 px, les listes de la console deviennent des cartes (aucune action hors écran). */
export const PHONE_QUERY = '(max-width: 699px)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

export const useIsPhone = () => useSyncExternalStore(subscribe, () => window.matchMedia(PHONE_QUERY).matches);
