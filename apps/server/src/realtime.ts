import { randomInt, randomUUID } from 'node:crypto';
import type { Server, Socket } from 'socket.io';
import { check, generate, getChapter } from '@questeo/content';
import { duelHandicaps, duelLevel, playArenaTurn, startArena, type ArenaState } from '@questeo/engine';
import {
  ARENA_MAX_PLAYERS,
  ARENA_TURN_SECONDS,
  chatText,
  ResponseSchema,
  type ArenaInvite,
  type ArenaPlayer,
  type ArenaQuestion,
  type ArenaView,
  type ChatMessage,
  type ChatPayload,
  type OnlinePlayer,
  type Profile,
} from '@questeo/shared';
import type { ProfilesRepo } from './db/profiles-repo.ts';

/**
 * Temps réel (socket.io) : plusieurs joueurs connectés en même temps, chacun sur son appareil.
 * - Présence : un profil ne peut être ouvert que sur un seul appareil à la fois.
 * - Messages : prédéfinis ou emoji seulement (pas de texte libre).
 * - Arène : invitation, puis tour par tour ; l'état vit ici, les clients affichent et répondent.
 */
export function createPresence() {
  const online = new Map<string, { socket: Socket; profile: Profile }>();
  return {
    online,
    isOnline: (id: string) => online.has(id),
  };
}
export type Presence = ReturnType<typeof createPresence>;

interface Arena {
  readonly id: string;
  readonly hostId: string;
  readonly chapterId: string;
  players: ArenaPlayer[];
  state: ArenaState | null;
  question: ArenaQuestion | null;
  deadline: number | null;
  timer: NodeJS.Timeout | null;
  /** Âges des joueurs (handicap des plus grands). */
  ages: Map<string, number | null>;
}

const ageOf = (p: Profile, now = new Date()) => {
  if (!p.birthDate) return null;
  const b = new Date(p.birthDate);
  let age = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--;
  return age;
};

export function attachRealtime(io: Server, profiles: ProfilesRepo, presence: Presence) {
  const { online } = presence;
  const arenas = new Map<string, Arena>();
  const arenaOf = (profileId: string) => [...arenas.values()].find((a) => a.players.some((p) => p.id === profileId));

  const playersList = (): OnlinePlayer[] =>
    [...online.values()].map(({ profile: p }) => ({
      id: p.id,
      name: p.name,
      hero: p.hero,
      avatar: p.avatar,
      busy: arenaOf(p.id)?.state != null,
    }));
  const broadcastPresence = () => io.emit('presence', playersList());
  const send = (profileId: string, event: string, data: unknown) => online.get(profileId)?.socket.emit(event, data);

  // ——— Arène ———

  const view = (a: Arena): ArenaView => {
    const s = a.state;
    const players = s ? s.players : a.players;
    return {
      id: a.id,
      hostId: a.hostId,
      chapterId: a.chapterId,
      phase: s ? (s.over ? 'over' : 'playing') : 'lobby',
      players,
      turnId: s && !s.over ? (s.players[s.current]?.id ?? null) : null,
      turn: s?.turn ?? 0,
      question: s && !s.over ? a.question : null,
      deadline: s && !s.over ? a.deadline : null,
      last: s?.last ?? null,
      winnerId: s?.winnerId ?? null,
    };
  };
  const pushArena = (a: Arena) => {
    const v = view(a);
    for (const p of a.players) send(p.id, 'arena', v);
  };

  const nextQuestion = (a: Arena) => {
    const s = a.state;
    const chapter = getChapter(a.chapterId);
    if (!s || s.over || !chapter) return;
    const current = s.players[s.current];
    if (!current) return;
    const ids = s.players.map((p) => p.id);
    const handicaps = duelHandicaps(ids.map((id) => a.ages.get(id) ?? null));
    const h = handicaps[s.current] ?? { levelBonus: 0, timeFactor: 1 };
    const skill = chapter.skills[randomInt(chapter.skills.length)];
    if (!skill) return;
    const base: 1 | 2 = s.turn < s.players.length * 2 ? 1 : 2;
    a.question = { skillId: skill.id, level: duelLevel(base, h), seed: randomInt(1, 2 ** 31) };
    const ms = Math.round(ARENA_TURN_SECONDS * h.timeFactor * 1000);
    a.deadline = Date.now() + ms;
    if (a.timer) clearTimeout(a.timer);
    a.timer = setTimeout(() => play(a, false, true), ms);
  };

  const play = (a: Arena, correct: boolean, timeout = false) => {
    if (!a.state || a.state.over) return;
    if (a.timer) clearTimeout(a.timer);
    a.timer = null;
    a.state = playArenaTurn(a.state, correct, timeout);
    if (a.state.over) {
      a.question = null;
      a.deadline = null;
      pushArena(a);
      broadcastPresence();
      // L'arène terminée reste consultable un moment, puis disparaît.
      setTimeout(() => arenas.delete(a.id), 60_000);
      return;
    }
    nextQuestion(a);
    pushArena(a);
  };

  const leaveArena = (profileId: string) => {
    const a = arenaOf(profileId);
    if (!a) return;
    if (!a.state) {
      // Salon : l'hôte qui part ferme le salon ; un invité qui part en sort.
      if (a.hostId === profileId) {
        for (const p of a.players) send(p.id, 'arena:closed', a.id);
        arenas.delete(a.id);
      } else {
        a.players = a.players.filter((p) => p.id !== profileId);
        pushArena(a);
      }
    } else if (!a.state.over) {
      // En partie : le joueur qui part est éliminé (s'il jouait, son tour compte comme raté).
      const s = a.state;
      const idx = s.players.findIndex((p) => p.id === profileId);
      const players = s.players.map((p) => (p.id === profileId ? { ...p, hearts: 0 } : p));
      a.state = { ...s, players };
      if (idx === s.current) play(a, false, true);
      else if (players.filter((p) => p.hearts > 0).length <= 1) play(a, false, true);
      else pushArena(a);
    }
    broadcastPresence();
  };

  io.on('connection', (socket) => {
    const profileId = typeof socket.handshake.auth.profileId === 'string' ? socket.handshake.auth.profileId : '';
    const profile = profiles.get(profileId);
    if (!profile) {
      socket.emit('refused', 'Profil introuvable');
      socket.disconnect(true);
      return;
    }
    // Un profil n'est ouvert que sur un seul appareil à la fois.
    const existing = online.get(profileId);
    if (existing?.socket.connected) {
      socket.emit('refused', 'Non, ce joueur est déjà connecté sur un autre appareil.');
      socket.disconnect(true);
      return;
    }
    online.set(profileId, { socket, profile });
    broadcastPresence();
    const a0 = arenaOf(profileId);
    if (a0) socket.emit('arena', view(a0));

    socket.on('chat', (msg: { to?: unknown; payload?: ChatPayload }) => {
      const to = typeof msg.to === 'string' ? msg.to : '';
      const text = msg.payload && chatText(msg.payload);
      if (!text || !online.has(to) || to === profileId) return;
      const out: ChatMessage = {
        from: { id: profile.id, name: profile.name, hero: profile.hero },
        text,
        at: Date.now(),
      };
      send(to, 'chat', out);
    });

    socket.on('arena:create', (msg: { chapterId?: unknown; invite?: unknown }) => {
      const chapterId = typeof msg.chapterId === 'string' ? msg.chapterId : '';
      const chapter = getChapter(chapterId);
      if (!chapter || arenaOf(profileId)) return;
      const invite = (Array.isArray(msg.invite) ? msg.invite : [])
        .filter((id): id is string => typeof id === 'string' && online.has(id) && id !== profileId && !arenaOf(id))
        .slice(0, ARENA_MAX_PLAYERS - 1);
      if (invite.length === 0) return;
      const me = online.get(profileId)?.profile ?? profile;
      const a: Arena = {
        id: randomUUID(),
        hostId: profileId,
        chapterId,
        players: [
          { id: me.id, name: me.name, hero: me.hero, hearts: 0, ready: true },
          ...invite.map((id) => {
            const p = online.get(id)?.profile;
            return { id, name: p?.name ?? '?', hero: p?.hero ?? 'alex', hearts: 0, ready: false };
          }),
        ],
        state: null,
        question: null,
        deadline: null,
        timer: null,
        ages: new Map(),
      };
      arenas.set(a.id, a);
      const inv: ArenaInvite = { arenaId: a.id, from: { id: me.id, name: me.name, hero: me.hero }, chapterId };
      for (const id of invite) send(id, 'arena:invite', inv);
      pushArena(a);
    });

    socket.on('arena:respond', (msg: { arenaId?: unknown; accept?: unknown }) => {
      const a = typeof msg.arenaId === 'string' ? arenas.get(msg.arenaId) : undefined;
      if (!a || a.state) return;
      const me = a.players.find((p) => p.id === profileId);
      if (!me) return;
      if (msg.accept === true) a.players = a.players.map((p) => (p.id === profileId ? { ...p, ready: true } : p));
      else a.players = a.players.filter((p) => p.id !== profileId);
      pushArena(a);
      if (msg.accept !== true) send(profileId, 'arena:closed', a.id);
    });

    socket.on('arena:start', () => {
      const a = arenaOf(profileId);
      if (!a || a.state || a.hostId !== profileId) return;
      try {
        a.state = startArena(a.players);
      } catch {
        return;
      }
      // Les invités qui n'ont pas répondu ne jouent pas.
      for (const p of a.players) if (!p.ready) send(p.id, 'arena:closed', a.id);
      a.players = a.players.filter((p) => p.ready);
      for (const p of a.players) {
        const prof = online.get(p.id)?.profile;
        a.ages.set(p.id, prof ? ageOf(prof) : null);
      }
      nextQuestion(a);
      pushArena(a);
      broadcastPresence();
    });

    socket.on('arena:answer', (msg: { response?: unknown }) => {
      const a = arenaOf(profileId);
      const s = a?.state;
      if (!a || !s || s.over || s.players[s.current]?.id !== profileId || !a.question) return;
      const response = ResponseSchema.safeParse(msg.response);
      if (!response.success) return;
      const q = a.question;
      const result = check(generate(q.skillId, q.level, q.seed), response.data);
      if (result.invalid) return;
      play(a, result.correct);
    });

    socket.on('arena:leave', () => leaveArena(profileId));

    socket.on('disconnect', () => {
      if (online.get(profileId)?.socket === socket) online.delete(profileId);
      leaveArena(profileId);
      broadcastPresence();
    });
  });
}
