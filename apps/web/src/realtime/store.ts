import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type { Response } from '@questeo/content';
import type { ArenaInvite, ArenaView, ChatMessage, ChatPayload, OnlinePlayer } from '@questeo/shared';

/** Notification en haut de l'écran : message reçu ou invitation à l'arène. */
export type Notice =
  | { readonly id: number; readonly kind: 'chat'; readonly message: ChatMessage }
  | { readonly id: number; readonly kind: 'invite'; readonly invite: ArenaInvite };

interface RealtimeState {
  readonly socket: Socket | null;
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
  readonly createArena: (chapterId: string, invite: readonly string[]) => void;
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
    const socket = io({ auth: { profileId }, transports: ['websocket', 'polling'] });
    socket.on('presence', (online: OnlinePlayer[]) => set({ online }));
    socket.on('refused', (reason: string) => {
      set({ refused: reason, socket: null, profileId: null });
      socket.disconnect();
      // Retour à l'écran des profils.
      window.dispatchEvent(new CustomEvent('questeo:refused'));
    });
    socket.on('chat', (message: ChatMessage) =>
      set((s) => ({ notices: [...s.notices, { id: ++seq, kind: 'chat' as const, message }].slice(-4) })),
    );
    socket.on('arena:invite', (invite: ArenaInvite) =>
      set((s) => ({ notices: [...s.notices, { id: ++seq, kind: 'invite' as const, invite }].slice(-4) })),
    );
    socket.on('arena', (arena: ArenaView) => {
      set({ arena });
      // Exposé pour les tests de bout en bout (lecture seule).
      (window as unknown as { __arena?: ArenaView }).__arena = arena;
    });
    socket.on('arena:closed', (id: string) => set((s) => (s.arena?.id === id ? { arena: null } : s)));
    set({ socket });
  },
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  clearRefused: () => set({ refused: null }),
  sendChat: (to, payload) => get().socket?.emit('chat', { to, payload }),
  createArena: (chapterId, invite) => get().socket?.emit('arena:create', { chapterId, invite }),
  respondArena: (arenaId, accept) => get().socket?.emit('arena:respond', { arenaId, accept }),
  startArena: () => get().socket?.emit('arena:start'),
  answerArena: (response) => get().socket?.emit('arena:answer', { response }),
  leaveArena: () => {
    get().socket?.emit('arena:leave');
    set({ arena: null });
  },
}));
