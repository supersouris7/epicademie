import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

/** Écrans déjà affichés pendant cette visite. */
const seen = new Set<string>();

/**
 * Animations d'apparition (fondu, glissement) : seulement à la 1re visite d'un écran. Aux visites
 * suivantes, le contenu est là tout de suite : pas d'écran qui s'éteint puis se rallume (scintillement).
 */
export function useEntrance(): boolean {
  const { pathname } = useLocation();
  const [first] = useState(() => !seen.has(pathname));
  useEffect(() => {
    seen.add(pathname);
  }, [pathname]);
  return first;
}
