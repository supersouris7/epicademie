import { create } from 'zustand';
import { safeStorage } from './storage.ts';

/**
 * Mode debug : réglage de cet appareil (désactivé par défaut), activé depuis /admin. Il ne fait
 * qu'afficher un drapeau de signalement sur chaque écran ; aucune donnée n'est exposée ni stockée
 * côté serveur.
 */
const KEY = 'af:debug';

interface DebugState {
  readonly enabled: boolean;
  readonly setEnabled: (enabled: boolean) => void;
}

export const useDebugMode = create<DebugState>((set) => ({
  enabled: safeStorage.get(KEY) === '1',
  setEnabled: (enabled) => {
    safeStorage.set(KEY, enabled ? '1' : null);
    set({ enabled });
  },
}));
