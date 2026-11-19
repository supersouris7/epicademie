import type { Socket } from 'socket.io';
import type { ClientToServerEvents, OnlinePlayer, Profile, ServerToClientEvents } from '@questeo/shared';

/** Données attachées à une connexion authentifiée. */
export interface SocketData {
  profile: Profile;
}

/**
 * Présence : qui est connecté, sur quel appareil. Un profil n'est ouvert que sur un seul
 * appareil à la fois. En mémoire de l'instance (voir docs/adr/0006-temps-reel.md pour le
 * passage à plusieurs instances).
 */
export type PlayerSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function createPresence() {
  const online = new Map<string, { readonly socket: PlayerSocket; readonly profile: Profile }>();

  return {
    isOnline: (profileId: string) => online.get(profileId)?.socket.connected === true,
    onlineIds: () => [...online.keys()],
    count: () => online.size,
    profile: (profileId: string) => online.get(profileId)?.profile,

    join(socket: PlayerSocket, profile: Profile): void {
      online.set(profile.id, { socket, profile });
    },

    /** Retire le joueur si c'est bien cette connexion (une reconnexion a pu la remplacer). */
    leave(socket: PlayerSocket, profileId: string): void {
      if (online.get(profileId)?.socket === socket) online.delete(profileId);
    },

    emit<E extends keyof ServerToClientEvents>(
      profileId: string,
      event: E,
      ...args: Parameters<ServerToClientEvents[E]>
    ): void {
      online.get(profileId)?.socket.emit(event, ...args);
    },

    players(isBusy: (profileId: string) => boolean): OnlinePlayer[] {
      return [...online.values()].map(({ profile: p }) => ({
        id: p.id,
        name: p.name,
        hero: p.hero,
        avatar: p.avatar,
        busy: isBusy(p.id),
      }));
    },
  };
}

export type Presence = ReturnType<typeof createPresence>;
