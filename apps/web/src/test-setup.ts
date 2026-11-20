import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, vi } from 'vitest';

/**
 * Préparation des tests du front (jsdom) : ce que le navigateur fournit et que jsdom n'a pas,
 * et remise à zéro entre deux tests (écran démonté, faux `fetch` retiré, vrais minuteurs).
 */

// Fichiers de test en environnement Node (`@vitest-environment node`) : pas de navigateur simulé.
if (typeof window !== 'undefined') {
  // Observateur de taille (cadre de l'arène) : jamais déclenché sous jsdom.
  class NoResizeObserver {
    observe = () => undefined;
    unobserve = () => undefined;
    disconnect = () => undefined;
  }
  Object.assign(globalThis, { ResizeObserver: NoResizeObserver });

  // Dessin du brouillon : pas de canvas sous jsdom (le composant le tolère).
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

  // Préférences d'affichage (mouvements réduits, plein écran…) : aucune (jsdom ne les gère pas).
  Object.assign(window, {
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });

  window.scrollTo = () => undefined;
}

// Animations de sortie : jsdom ne fait pas tourner les images d'animation, une sortie ne se
// terminerait jamais (`AnimatePresence mode="wait"` bloquerait l'écran suivant). En test, les
// éléments sortants disparaissent tout de suite.
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  AnimatePresence: ({ children }: { children?: ReactNode }) => children,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
