/** Profil choisi sur cet appareil (mémorisé localement) : état global de l'application. */
import { create } from 'zustand';
import { safeStorage } from './storage.ts';

const KEY = 'epicademie.currentProfile';

interface SessionState {
  readonly profileId: string | null;
  readonly selectProfile: (id: string | null) => void;
}

export const useSession = create<SessionState>((set) => ({
  profileId: safeStorage.get(KEY),
  selectProfile(id) {
    safeStorage.set(KEY, id);
    set({ profileId: id });
  },
}));
