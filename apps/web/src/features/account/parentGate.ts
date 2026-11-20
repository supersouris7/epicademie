import { createContext, useContext } from 'react';

/** Action à exécuter si le parent est déverrouillé (sinon le mot de passe est demandé). */
export type ParentAction = () => Promise<void>;

/** Contexte du verrou parent (fourni par `ParentGateProvider`). Hors fournisseur : exécution directe. */
export const ParentGateContext = createContext<(action: ParentAction) => Promise<void>>((action) => action());

/** `withParent(action)` : exécute une action réservée au parent, en demandant le mot de passe si besoin. */
export const useParentGate = () => useContext(ParentGateContext);
