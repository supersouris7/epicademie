import { randomUUID } from 'node:crypto';
import { check, generate, getChapter } from '@questeo/content';
import { duelHandicaps, duelLevel, playArenaTurn, startArena, type ArenaState } from '@questeo/engine';
import {
  ageOn,
  ARENA_TURN_SECONDS,
  type ArenaCreate,
  type ArenaInvite,
  type ArenaPlayer,
  type ArenaQuestion,
  type ArenaView,
  type Profile,
  type ServerToClientEvents,
} from '@questeo/shared';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import type { Presence } from './presence.ts';

/**
 * Arène : 2 à 4 joueurs connectés, chacun répond à son tour sur son appareil.
 *
 * Cycle de vie : salon (invitations, l'hôte lance) → partie (tour par tour, minuteur par
 * question) → terminée (consultable une minute, puis effacée). Les règles (cœurs, attaques,
 * fin de partie, handicap d'âge) sont dans @questeo/engine ; ici, l'orchestration et les
 * minuteurs. L'état vit en mémoire de l'instance (voir docs/adr/0006-temps-reel.md).
 */

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
  readonly ages: Map<string, number | null>;
}

/** Durée pendant laquelle une arène terminée reste consultable. */
const FINISHED_ARENA_TTL_MS = 60_000;

export interface ArenaDeps {
  readonly presence: Presence;
  readonly clock: Clock;
  readonly random: Random;
  /** La liste des joueurs occupés a changé (diffusion de la présence). */
  readonly onBusyChange: () => void;
  readonly onCountChange?: (open: number) => void;
}

type Emit = <E extends keyof ServerToClientEvents>(
  profileId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) => void;

export function createArenas({ presence, clock, random, onBusyChange, onCountChange }: ArenaDeps) {
  const arenas = new Map<string, Arena>();
  const emit: Emit = (profileId, event, ...args) => presence.emit(profileId, event, ...args);
  const counted = () => onCountChange?.(arenas.size);

  const arenaOf = (profileId: string) => [...arenas.values()].find((a) => a.players.some((p) => p.id === profileId));

  const view = (a: Arena): ArenaView => {
    const s = a.state;
    return {
      id: a.id,
      hostId: a.hostId,
      chapterId: a.chapterId,
      phase: s ? (s.over ? 'over' : 'playing') : 'lobby',
      players: s ? s.players : a.players,
      turnId: s && !s.over ? (s.players[s.current]?.id ?? null) : null,
      turn: s?.turn ?? 0,
      question: s && !s.over ? a.question : null,
      deadline: s && !s.over ? a.deadline : null,
      last: s?.last ?? null,
      winnerId: s?.winnerId ?? null,
    };
  };

  const push = (a: Arena) => {
    const v = view(a);
    for (const p of a.players) emit(p.id, 'arena', v);
  };

  const remove = (a: Arena) => {
    if (a.timer) clearTimeout(a.timer);
    arenas.delete(a.id);
    counted();
  };

  /** Tire la question du joueur dont c'est le tour et arme le minuteur. */
  const nextQuestion = (a: Arena) => {
    const s = a.state;
    const chapter = getChapter(a.chapterId);
    if (!s || s.over || !chapter) return;
    const ids = s.players.map((p) => p.id);
    const handicaps = duelHandicaps(ids.map((id) => a.ages.get(id) ?? null));
    const h = handicaps[s.current] ?? { levelBonus: 0, timeFactor: 1 };
    const skill = chapter.skills[random.int(chapter.skills.length)];
    if (!skill) return;
    // Deux premiers tours de table au niveau 1, ensuite niveau 2 (avant handicap).
    const base: 1 | 2 = s.turn < s.players.length * 2 ? 1 : 2;
    a.question = { skillId: skill.id, level: duelLevel(base, h), seed: random.seed() };
    const ms = Math.round(ARENA_TURN_SECONDS * h.timeFactor * 1000);
    a.deadline = clock.now().getTime() + ms;
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
      push(a);
      onBusyChange();
      a.timer = setTimeout(() => remove(a), FINISHED_ARENA_TTL_MS);
      return;
    }
    nextQuestion(a);
    push(a);
  };

  return {
    /** Le joueur est-il en partie (non invitable) ? */
    isBusy: (profileId: string) => arenaOf(profileId)?.state != null,
    count: () => arenas.size,

    /** Vue de l'arène du joueur (reconnexion). */
    viewOf(profileId: string): ArenaView | null {
      const a = arenaOf(profileId);
      return a ? view(a) : null;
    },

    create(host: Profile, msg: ArenaCreate): void {
      if (!getChapter(msg.chapterId) || arenaOf(host.id)) return;
      const invite = [...new Set(msg.invite)].filter((id) => id !== host.id && presence.isOnline(id) && !arenaOf(id));
      if (invite.length === 0) return;
      const a: Arena = {
        id: randomUUID(),
        hostId: host.id,
        chapterId: msg.chapterId,
        players: [
          { id: host.id, name: host.name, hero: host.hero, hearts: 0, ready: true },
          ...invite.map((id) => {
            const p = presence.profile(id);
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
      counted();
      const inv: ArenaInvite = {
        arenaId: a.id,
        from: { id: host.id, name: host.name, hero: host.hero },
        chapterId: msg.chapterId,
      };
      for (const id of invite) emit(id, 'arena:invite', inv);
      push(a);
    },

    respond(profileId: string, arenaId: string, accept: boolean): void {
      const a = arenas.get(arenaId);
      if (!a || a.state || !a.players.some((p) => p.id === profileId)) return;
      if (accept) a.players = a.players.map((p) => (p.id === profileId ? { ...p, ready: true } : p));
      else a.players = a.players.filter((p) => p.id !== profileId);
      push(a);
      if (!accept) emit(profileId, 'arena:closed', a.id);
    },

    /** L'hôte lance la partie ; les invités qui n'ont pas répondu ne jouent pas. */
    start(profileId: string): void {
      const a = arenaOf(profileId);
      if (!a || a.state || a.hostId !== profileId) return;
      const ready = a.players.filter((p) => p.ready);
      let state: ArenaState;
      try {
        state = startArena(ready);
      } catch {
        return; // Pas assez de joueurs prêts.
      }
      for (const p of a.players) if (!p.ready) emit(p.id, 'arena:closed', a.id);
      a.players = ready;
      a.state = state;
      const today = clock.today();
      for (const p of a.players) {
        const birth = presence.profile(p.id)?.birthDate;
        a.ages.set(p.id, birth ? ageOn(birth, today) : null);
      }
      nextQuestion(a);
      push(a);
      onBusyChange();
    },

    /** Réponse du joueur dont c'est le tour (corrigée ici ; réponse illisible ignorée). */
    answer(profileId: string, response: Parameters<typeof check>[1]): void {
      const a = arenaOf(profileId);
      const s = a?.state;
      if (!a || !s || s.over || s.players[s.current]?.id !== profileId || !a.question) return;
      const q = a.question;
      const result = check(generate(q.skillId, q.level, q.seed), response);
      if (result.invalid) return;
      play(a, result.correct);
    },

    /** Le joueur quitte (ou se déconnecte). */
    leave(profileId: string): void {
      const a = arenaOf(profileId);
      if (!a) return;
      if (!a.state) {
        // Salon : l'hôte qui part ferme le salon ; un invité qui part en sort.
        if (a.hostId === profileId) {
          for (const p of a.players) emit(p.id, 'arena:closed', a.id);
          remove(a);
        } else {
          a.players = a.players.filter((p) => p.id !== profileId);
          push(a);
        }
      } else if (!a.state.over) {
        // En partie : le joueur qui part est éliminé (s'il jouait, son tour compte comme raté).
        const s = a.state;
        const idx = s.players.findIndex((p) => p.id === profileId);
        const players = s.players.map((p) => (p.id === profileId ? { ...p, hearts: 0 } : p));
        a.state = { ...s, players };
        if (idx === s.current || players.filter((p) => p.hearts > 0).length <= 1) play(a, false, true);
        else push(a);
      }
      onBusyChange();
    },

    /** Arrêt du serveur : plus aucun minuteur actif. */
    dispose(): void {
      for (const a of arenas.values()) if (a.timer) clearTimeout(a.timer);
      arenas.clear();
    },
  };
}

export type Arenas = ReturnType<typeof createArenas>;
