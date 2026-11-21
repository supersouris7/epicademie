import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type { Response } from '@questeo/content';
import type {
  ArenaKind,
  ArenaInvite,
  ArenaView,
  ChatMessage,
  ChatPayload,
  ClientToServerEvents,
  OnlinePlayer,
  ServerToClientEvents,
} from '@questeo/shared';

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Notification en haut de l'écran : message reçu, invitation à l'arène, ou joueur qui arrive. */
export type Notice =
  | { readonly id: number; readonly kind: 'chat'; readonly message: ChatMessage }
  | { readonly id: number; readonly kind: 'invite'; readonly invite: ArenaInvite }
  | { readonly id: number; readonly kind: 'online'; readonly player: OnlinePlayer };

/** Joueurs (famille ou amis) arrivés entre deux listes de connectés. */
export const arrivals = (before: readonly OnlinePlayer[], after: readonly OnlinePlayer[], me: string | null) =>
  after.filter((p) => p.id !== me && !before.some((b) => b.id === p.id));

interface RealtimeState {
  readonly socket: RealtimeSocket | null;
  readonly profileId: string | null;
  readonly online: readonly OnlinePlayer[];
  readonly notices: readonly Notice[];
  readonly arena: ArenaView | null;
  /** Refus du serveur (profil déjà ouvert ailleurs) : affiché sur l'écran des profils. */
  readonly refused: string | null;
  readonly connect: (profileId: string | null) => void;
  readonly dismiss: (id: number) => void;
  readonly clearRefused: () => void;
  readonly sendChat: (to: string, payload: ChatPayload) => void;
  readonly createArena: (chapterId: string, invite: readonly string[], kind?: ArenaKind) => void;
  readonly respondArena: (arenaId: string, accept: boolean) => void;
  readonly startArena: () => void;
  readonly answerArena: (response: Response) => void;
  readonly leaveArena: () => void;
}

let seq = 0;

/**
 * Connexion temps réel unique pour toute l'appli (socket.io) : joueurs connectés, messages,
 * invitations et arène. Elle suit le profil choisi (déconnexion quand on change de joueur).
 */
export const useRealtime = create<RealtimeState>((set, get) => ({
  socket: null,
  profileId: null,
  online: [],
  notices: [],
  arena: null,
  refused: null,
  connect(profileId) {
    const cur = get();
    if (cur.profileId === profileId && (cur.socket || !profileId)) return;
    cur.socket?.disconnect();
    set({ socket: null, profileId, online: [], arena: null });
    if (!profileId || typeof window === 'undefined') return;
    const socket: RealtimeSocket = io({ auth: { profileId }, transports: ['websocket', 'polling'] });
    // La 1re liste après la connexion ne s'annonce pas ; ensuite, chaque arrivée : « X est connecté ».
    let first = true;
    socket.on('presence', (online) =>
      set((s) => {
        const joined = first ? [] : arrivals(s.online, online, s.profileId);
        first = false;
        const added = joined.map((player) => ({ id: ++seq, kind: 'online' as const, player }));
        return { online, notices: added.length ? [...s.notices, ...added].slice(-4) : s.notices };
      }),
    );
    // Connexion refusée par le serveur (profil déjà ouvert ailleurs, profil inconnu) : le
    // client ne réessaie pas tout seul. Les coupures réseau, elles, se reconnectent seules.
    socket.on('connect_error', (err) => {
      if (socket.active) return;
      set({ refused: err.message, socket: null, profileId: null });
      socket.disconnect();
      // Retour à l'écran des profils.
      window.dispatchEvent(new CustomEvent('questeo:refused'));
    });
    socket.on('chat', (message) =>
      set((s) => ({ notices: [...s.notices, { id: ++seq, kind: 'chat' as const, message }].slice(-4) })),
    );
    socket.on('arena:invite', (invite) =>
      set((s) => ({ notices: [...s.notices, { id: ++seq, kind: 'invite' as const, invite }].slice(-4) })),
    );
    socket.on('arena', (arena) => {
      set({ arena });
      // Exposé pour les tests de bout en bout (lecture seule).
      (window as unknown as { __arena?: ArenaView }).__arena = arena;
    });
    socket.on('arena:closed', (id) => set((s) => (s.arena?.id === id ? { arena: null } : s)));
    set({ socket });
  },
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  clearRefused: () => set({ refused: null }),
  sendChat: (to, payload) => get().socket?.emit('chat', { to, payload }),
  createArena: (chapterId, invite, kind = 'duel') =>
    get().socket?.emit('arena:create', { kind, chapterId, invite: [...invite] }),
  respondArena: (arenaId, accept) => get().socket?.emit('arena:respond', { arenaId, accept }),
  startArena: () => get().socket?.emit('arena:start'),
  answerArena: (response) => get().socket?.emit('arena:answer', { response }),
  leaveArena: () => {
    get().socket?.emit('arena:leave');
    set({ arena: null });
  },
}));
