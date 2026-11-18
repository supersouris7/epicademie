import { useCallback, useEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigate, useNavigationType } from 'react-router';

/**
 * Sorties d'une page de partie (entraînement ou combat).
 *
 * - Sortir (Quitter, Accueil, Autres boss…) **remplace** la partie dans l'historique : le bouton
 *   « précédent » ne relance pas une partie déjà quittée. Si on y revient quand même (entrée
 *   restée derrière), la page renvoie aussitôt vers `fallback` (la liste d'où l'on vient).
 * - Pendant une partie, « précédent » ne quitte pas en silence : il appelle `onBack` (on montre
 *   la même confirmation que la Pause) grâce à une entrée d'historique de garde.
 */
const LEFT = 'partie-quittee:';
/** Clé de la page chargée directement (adresse tapée, rechargement) : commune à tous ces chargements. */
const FIRST_LOAD = 'default';

function wasLeft(key: string) {
  if (key === FIRST_LOAD) return false;
  try {
    return sessionStorage.getItem(LEFT + key) === '1';
  } catch {
    return false;
  }
}
function markLeft(key: string) {
  if (key === FIRST_LOAD) return;
  try {
    sessionStorage.setItem(LEFT + key, '1');
  } catch {
    /* stockage indisponible : la sortie reste remplacée dans l'historique */
  }
}

interface GuardState {
  readonly partieGarde?: boolean;
}
const guarded = () => (window.history.state as GuardState | null)?.partieGarde === true;

export function useGameExit(fallback: string, fallbackState?: unknown) {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  // Retour par « précédent » sur une partie déjà quittée : on repart vers la liste.
  const left = navType === NavigationType.Pop && wasLeft(location.key);
  useEffect(() => {
    if (left) void navigate(fallback, { replace: true, state: fallbackState });
  }, [left, navigate, fallback, fallbackState]);

  const exit = useCallback(
    (to: string, state?: unknown) => {
      markLeft(location.key);
      void navigate(to, { replace: true, state });
    },
    [location.key, navigate],
  );
  return { left, exit };
}

/** Pendant `active`, « précédent » appelle `onBack` au lieu de quitter ; `rearm` remet la garde. */
export function useBackGuard(active: boolean, onBack: () => void) {
  const back = useRef(onBack);
  useEffect(() => {
    back.current = onBack;
  }, [onBack]);
  const wasActive = useRef(false);

  const rearm = useCallback(() => {
    if (!guarded()) window.history.pushState({ ...(window.history.state as object), partieGarde: true }, '');
  }, []);

  useEffect(() => {
    if (!active) {
      // Fin de partie (bilan) : on consomme l'entrée de garde pour qu'un « précédent » ne tombe pas à vide.
      if (wasActive.current && guarded()) window.history.back();
      wasActive.current = false;
      return;
    }
    wasActive.current = true;
    rearm();
    const onPop = () => {
      if (!guarded()) back.current();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [active, rearm]);

  return { rearm };
}
