import { createContext, type ComponentType, type ReactNode } from 'react';

/**
 * Rendu d'un mot du glossaire dans `MathText`, fourni par l'application (le mot touchable et sa
 * fenêtre). Sans fournisseur, le mot reste du texte simple. Le contexte évite que `MathText`
 * dépende de la fenêtre du mot, qui elle-même affiche du `MathText`.
 */
export const TermContext = createContext<ComponentType<{ readonly id: string; readonly children: ReactNode }> | null>(
  null,
);
