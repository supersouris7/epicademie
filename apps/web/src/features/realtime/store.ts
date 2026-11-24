import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type { Response } from '@epicademie/content';
import type {
  ArenaInvite,
  ArenaView,
  ChatMessage,
  ChatPayload,
  ClientToServerEvents,
  OnlinePlayer,
  ServerToClientEvents,
} from '@epicademie/shared';
import { REALTIME_REFUSALS } from '@epicademie/shared';

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
  /** Mes réponses dans l'arène en cours, par notion (récap de fin de partie). */
  readonly tally: readonly ArenaTally[];
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

/** Réponses et réponses justes d'une notion, pour le joueur de cet appareil. */
export interface ArenaTally {
  readonly skillId: string;
  readonly answered: number;
  readonly correct: number;
}

/**
 * Nouveau décompte après une vue d'arène : ma réponse vient d'être jugée (dernier événement à mon
 * nom, nouveau tour) → elle compte pour la notion de la question précédente. Nouvelle arène : à zéro.
 */
export function nextTally(
  tally: readonly ArenaTally[],
  prev: ArenaView | null,
  next: ArenaView,
  me: string | null,
): readonly ArenaTally[] {
  if (prev?.id !== next.id) return [];
  const q = prev.question;
  const last = next.last;
  if (!q || last?.playerId !== me || last === prev.last) return tally;
  const skillId = q.skillId;
  const ok = last.correct ? 1 : 0;
  const found = tally.some((t) => t.skillId === skillId);
  return found
    ? tally.map((t) => (t.skillId === skillId ? { ...t, answered: t.answered + 1, correct: t.correct + ok } : t))
    : [...tally, { skillId, answered: 1, correct: ok }];
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
  tally: [],
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
      window.dispatchEvent(new CustomEvent('epicademie:refused'));
    });
    // Profil ouvert sur un autre appareil : cette connexion est fermée, retour au choix du joueur.
    socket.on('replaced', () => {
      set({ refused: REALTIME_REFUSALS.replaced, socket: null, profileId: null, arena: null });
      socket.disconnect();
      window.dispatchEvent(new CustomEvent('epicademie:refused'));
    });
    socket.on('chat', (message) =>
      set((s) => ({ notices: [...s.notices, { id: ++seq, kind: 'chat' as const, message }].slice(-4) })),
    );
    socket.on('arena:invite', (invite) =>
      set((s) => ({ notices: [...s.notices, { id: ++seq, kind: 'invite' as const, invite }].slice(-4) })),
    );
    socket.on('arena', (arena) => {
      set((s) => ({ arena, tally: nextTally(s.tally, s.arena, arena, s.profileId) }));
      // Exposé pour les tests de bout en bout (lecture seule).
      (window as unknown as { __arena?: ArenaView }).__arena = arena;
    });
    socket.on('arena:closed', (id) => set((s) => (s.arena?.id === id ? { arena: null } : s)));
    set({ socket });
  },
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
  clearRefused: () => set({ refused: null }),
  sendChat: (to, payload) => get().socket?.emit('chat', { to, payload }),
  createArena: (chapterId, invite) => get().socket?.emit('arena:create', { chapterId, invite: [...invite] }),
  respondArena: (arenaId, accept) => get().socket?.emit('arena:respond', { arenaId, accept }),
  startArena: () => get().socket?.emit('arena:start'),
  answerArena: (response) => get().socket?.emit('arena:answer', { response }),
  leaveArena: () => {
    get().socket?.emit('arena:leave');
    set({ arena: null });
  },
}));
