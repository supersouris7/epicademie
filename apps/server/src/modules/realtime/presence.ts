import type { Socket } from 'socket.io';
import type { ClientToServerEvents, OnlinePlayer, Profile, ServerToClientEvents } from '@questeo/shared';

/** Données attachées à une connexion authentifiée. */
export interface SocketData {
  profile: Profile;
  /** Famille du compte connecté : le temps réel ne relie que des joueurs de la même famille. */
  familyId: string;
}

/**
 * Présence : qui est connecté, sur quel appareil. Un profil n'est ouvert que sur un seul
 * appareil à la fois. Chaque famille ne voit que ses propres joueurs (isolation des familles :
 * pas de prénoms d'enfants d'une autre famille). En mémoire de l'instance (voir docs/adr/0006-temps-reel.md pour le
 * passage à plusieurs instances).
 */
export type PlayerSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function createPresence() {
  const online = new Map<
    string,
    { readonly socket: PlayerSocket; readonly profile: Profile; readonly familyId: string }
  >();
  const inFamily = (familyId: string) => [...online.values()].filter((e) => e.familyId === familyId);

  return {
    isOnline: (profileId: string) => online.get(profileId)?.socket.connected === true,
    /** Joueurs connectés d'une famille. */
    onlineIds: (familyId: string) => inFamily(familyId).map((e) => e.profile.id),
    count: () => online.size,
    profile: (profileId: string) => online.get(profileId)?.profile,
    /** Les deux joueurs sont connectés et de la même famille. */
    sameFamily: (a: string, b: string) => {
      const fa = online.get(a)?.familyId;
      return fa !== undefined && fa === online.get(b)?.familyId;
    },
    /** Familles ayant au moins un joueur connecté. */
    families: () => new Set([...online.values()].map((e) => e.familyId)),

    join(socket: PlayerSocket, profile: Profile, familyId: string): void {
      online.set(profile.id, { socket, profile, familyId });
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

    /** Joueurs connectés d'une famille, tels que les voient ses appareils. */
    players(familyId: string, isBusy: (profileId: string) => boolean): OnlinePlayer[] {
      return inFamily(familyId).map(({ profile: p }) => ({
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
