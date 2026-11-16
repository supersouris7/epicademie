import { create } from 'zustand';
import { safeStorage } from '../lib/storage.ts';

const KEY = 'questeo.currentProfile';

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
