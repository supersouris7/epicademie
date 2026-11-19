import { useCallback, useEffect, useRef, useState } from 'react';
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

/** Adresse d'une partie quittée : sécurité si la clé d'historique ne correspond plus (garde, retours). */
const LEFT_PATH = 'partie-quittee-adresse:';
function markLeftPath(path: string) {
  try {
    sessionStorage.setItem(LEFT_PATH + path, '1');
  } catch {
    /* ignoré */
  }
}
function wasLeftPath(path: string) {
  try {
    return sessionStorage.getItem(LEFT_PATH + path) === '1';
  } catch {
    return false;
  }
}
function clearLeftPath(path: string) {
  try {
    sessionStorage.removeItem(LEFT_PATH + path);
  } catch {
    /* ignoré */
  }
}

interface GuardState {
  readonly partieGarde?: boolean;
}
const guarded = () => (window.history.state as GuardState | null)?.partieGarde === true;

/** Sortie en cours : le retour arrière qui retire l'entrée de garde ne doit pas ouvrir la Pause. */
let exiting = false;

export function useGameExit(fallback: string, fallbackState?: unknown) {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  // Une nouvelle partie lancée depuis un menu (PUSH) efface la marque de l'adresse — une seule fois,
  // à son arrivée : un rendu tardif juste après « Quitter » ne doit pas effacer la marque toute neuve.
  const [arrivedByPush] = useState(() => navType === NavigationType.Push);
  useEffect(() => {
    if (arrivedByPush) clearLeftPath(location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- à l'arrivée seulement
  }, []);
  // Retour sur une partie déjà quittée (clé d'historique, ou même adresse revenue par « précédent ») :
  // on repart vers la liste.
  const left = wasLeft(location.key) || (navType === NavigationType.Pop && wasLeftPath(location.pathname));
  useEffect(() => {
    if (left) void navigate(fallback, { replace: true, state: fallbackState });
  }, [left, navigate, fallback, fallbackState]);

  const exit = useCallback(
    (to: string, state?: unknown) => {
      markLeft(location.key);
      markLeftPath(location.pathname);
      // Entrée de garde au-dessus de la partie : on revient d'abord sur l'entrée de la partie, puis on
      // la remplace par la destination. La partie disparaît de l'historique : « précédent » ne peut
      // plus y revenir.
      if (guarded()) {
        exiting = true;
        window.addEventListener(
          'popstate',
          () => {
            exiting = false;
            void navigate(to, { replace: true, state });
          },
          { once: true },
        );
        window.history.back();
        return;
      }
      void navigate(to, { replace: true, state });
    },
    [location.key, location.pathname, navigate],
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
      if (!exiting && !guarded()) back.current();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [active, rearm]);

  return { rearm };
}
