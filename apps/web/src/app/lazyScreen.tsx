import { createElement, lazy, Suspense, type FunctionComponent } from 'react';
import { LoadingScreen } from '../shared/ui/LoadingScreen.tsx';

/**
 * Écran chargé à la demande : son code n'est téléchargé qu'à la première visite. Chaque écran a sa
 * propre attente : en changeant d'écran, on voit « Chargement… » et non l'écran précédent figé.
 */
export function lazyScreen<P extends object>(load: () => Promise<FunctionComponent<P>>) {
  const Screen = lazy<FunctionComponent<P>>(async () => ({ default: await load() }));
  return function LazyScreen(props: P) {
    return <Suspense fallback={<LoadingScreen />}>{createElement(Screen as FunctionComponent<P>, props)}</Suspense>;
  };
}
