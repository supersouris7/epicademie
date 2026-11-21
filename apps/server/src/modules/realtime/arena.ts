import { randomUUID } from 'node:crypto';
import { check, generate, getChapter } from '@questeo/content';
import {
  duelHandicaps,
  duelLevel,
  answerQuiz,
  isQuiz,
  isRaid,
  leaveQuiz,
  leaveRaid,
  playArenaTurn,
  playRaidTurn,
  startArena,
  startQuiz,
  startRaid,
  timeoutQuiz,
  type ArenaState,
} from '@questeo/engine';
import {
  ageOn,
  ARENA_TURN_SECONDS,
  QUIZ_SECONDS,
  type ArenaKind,
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
  readonly kind: ArenaKind;
  readonly hostId: string;
  readonly chapterId: string;
  players: ArenaPlayer[];
  state: ArenaState | null;
  question: ArenaQuestion | null;
  deadline: number | null;
  timer: NodeJS.Timeout | null;
  /** Âges des joueurs (handicap des plus grands). */
  readonly ages: Map<string, number | null>;
  /** Joueurs déconnectés, avec le minuteur qui les retire s'ils ne reviennent pas. */
  readonly away: Map<string, NodeJS.Timeout>;
  /** Fermeture du salon s'il n'est jamais lancé. */
  lobbyTimer: NodeJS.Timeout | null;
}

/** Durée pendant laquelle une arène terminée reste consultable. */
const FINISHED_ARENA_TTL_MS = 60_000;
/** Délai de reconnexion d'un joueur (Wi-Fi qui saute, tablette en veille, autre appareil). */
export const ARENA_GRACE_MS = 30_000;
/** Un salon jamais lancé ferme au bout de ce délai. */
export const LOBBY_TTL_MS = 10 * 60_000;

export interface ArenaDeps {
  readonly presence: Presence;
  readonly clock: Clock;
  readonly random: Random;
  /** La liste des joueurs occupés a changé (diffusion de la présence). */
  readonly onBusyChange: () => void;
  readonly onCountChange?: (open: number) => void;
  /** Nouvel état diffusé (écran TV de la famille). */
  readonly onView?: (view: ArenaView, playerIds: readonly string[]) => void;
}

type Emit = <E extends keyof ServerToClientEvents>(
  profileId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) => void;

/** Vue diffusée aux joueurs (et à l'écran TV de la famille). */
function view(a: Arena): ArenaView {
  const s = a.state;
  // Partie en cours (ni salon ni fin) : question, minuteur et tour affichés.
  const live = s && !s.over ? s : null;
  return {
    id: a.id,
    kind: a.kind,
    ...modeStatus(s),
    hostId: a.hostId,
    chapterId: a.chapterId,
    phase: s ? (s.over ? 'over' : 'playing') : 'lobby',
    players: (s ? s.players : a.players).map((p) => (a.away.has(p.id) ? { ...p, away: true } : p)),
    // Quiz : tout le monde répond en même temps, pas de tour.
    turnId: live && !isQuiz(live) ? (live.players[live.current]?.id ?? null) : null,
    turn: s?.turn ?? 0,
    question: live ? a.question : null,
    deadline: live ? a.deadline : null,
    last: s?.last ?? null,
    winnerId: s?.winnerId ?? null,
  };
}

/** État propre au mode : boss et équipe (raid), manches et scores (quiz). */
const modeStatus = (s: ArenaState | null) => ({
  raid: s && isRaid(s) ? s.raid : null,
  quiz: s && isQuiz(s) ? s.quiz : null,
});

/** Question suivante : notion du chapitre, niveau et durée selon le mode (pur, hors minuteurs). */
function drawQuestion(a: Arena, s: ArenaState, skillId: string, seed: number): { question: ArenaQuestion; ms: number } {
  if (isQuiz(s)) {
    // Quiz : même question pour tous ; niveau 1 puis 2 à mi-partie, sans handicap.
    const level: 1 | 2 = s.quiz.round <= s.quiz.rounds / 2 ? 1 : 2;
    return { question: { skillId, level, seed }, ms: QUIZ_SECONDS * 1000 };
  }
  const handicaps = duelHandicaps(s.players.map((p) => a.ages.get(p.id) ?? null));
  const h = handicaps[s.current] ?? { levelBonus: 0, timeFactor: 1 };
  // Deux premiers tours de table au niveau 1, ensuite niveau 2 (avant handicap).
  const base: 1 | 2 = s.turn < s.players.length * 2 ? 1 : 2;
  return {
    question: { skillId, level: duelLevel(base, h), seed },
    ms: Math.round(ARENA_TURN_SECONDS * h.timeFactor * 1000),
  };
}

/** Salon tout neuf : l'hôte (prêt) et les invités (en attente de réponse). */
function newArena(
  host: Profile,
  kind: ArenaKind,
  chapterId: string,
  invite: readonly string[],
  presence: Presence,
): Arena {
  return {
    id: randomUUID(),
    kind,
    hostId: host.id,
    chapterId,
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
    away: new Map(),
    lobbyTimer: null,
  };
}

export function createArenas({ presence, clock, random, onBusyChange, onCountChange, onView }: ArenaDeps) {
  const arenas = new Map<string, Arena>();
  const emit: Emit = (profileId, event, ...args) => presence.emit(profileId, event, ...args);
  const counted = () => onCountChange?.(arenas.size);

  const arenaOf = (profileId: string) => [...arenas.values()].find((a) => a.players.some((p) => p.id === profileId));

  const push = (a: Arena) => {
    const v = view(a);
    for (const p of a.players) emit(p.id, 'arena', v);
    onView?.(
      v,
      a.players.map((p) => p.id),
    );
  };

  const remove = (a: Arena) => {
    if (a.timer) clearTimeout(a.timer);
    if (a.lobbyTimer) clearTimeout(a.lobbyTimer);
    for (const t of a.away.values()) clearTimeout(t);
    arenas.delete(a.id);
    counted();
  };

  /** Ferme un salon pour tous ses joueurs. */
  const closeLobby = (a: Arena) => {
    for (const p of a.players) emit(p.id, 'arena:closed', a.id);
    remove(a);
  };

  /** Tire la question du joueur dont c'est le tour et arme le minuteur. */
  const nextQuestion = (a: Arena) => {
    const s = a.state;
    const chapter = getChapter(a.chapterId);
    const skill = chapter?.skills[random.int(chapter.skills.length)];
    if (!s || s.over || !skill) return;
    const { question, ms } = drawQuestion(a, s, skill.id, random.seed());
    a.question = question;
    a.deadline = clock.now().getTime() + ms;
    if (a.timer) clearTimeout(a.timer);
    a.timer = setTimeout(() => (isQuiz(s) ? settle(a, timeoutQuiz(s)) : play(a, false, true)), ms);
  };

  /** Nouvel état du quiz : nouvelle question si la manche a changé, fin de partie sinon. */
  const settle = (a: Arena, next: ArenaState) => {
    const before = a.state?.turn;
    a.state = next;
    if (next.over) {
      if (a.timer) clearTimeout(a.timer);
      a.question = null;
      a.deadline = null;
      push(a);
      onBusyChange();
      a.timer = setTimeout(() => remove(a), FINISHED_ARENA_TTL_MS);
      return;
    }
    if (next.turn !== before) nextQuestion(a);
    push(a);
  };

  const play = (a: Arena, correct: boolean, timeout = false) => {
    if (!a.state || a.state.over) return;
    if (a.timer) clearTimeout(a.timer);
    a.timer = null;
    a.state = isRaid(a.state) ? playRaidTurn(a.state, correct, timeout) : playArenaTurn(a.state, correct, timeout);
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

    create(host: Profile, msg: Omit<ArenaCreate, 'kind'> & { readonly kind?: ArenaKind }): void {
      if (!getChapter(msg.chapterId) || arenaOf(host.id)) return;
      const invite = [...new Set(msg.invite)].filter((id) => id !== host.id && presence.isOnline(id) && !arenaOf(id));
      if (invite.length === 0) return;
      const a = newArena(host, msg.kind ?? 'duel', msg.chapterId, invite, presence);
      a.lobbyTimer = setTimeout(() => {
        if (!a.state) closeLobby(a);
      }, LOBBY_TTL_MS);
      arenas.set(a.id, a);
      counted();
      const inv: ArenaInvite = {
        arenaId: a.id,
        kind: a.kind,
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
        state = a.kind === 'raid' ? startRaid(ready) : a.kind === 'quiz' ? startQuiz(ready) : startArena(ready);
      } catch {
        return; // Pas assez de joueurs prêts.
      }
      for (const p of a.players) if (!p.ready) emit(p.id, 'arena:closed', a.id);
      if (a.lobbyTimer) clearTimeout(a.lobbyTimer);
      a.lobbyTimer = null;
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
      if (!a || !s || s.over || !a.question) return;
      const quiz = isQuiz(s);
      // Quiz : chacun répond ; sinon, seulement le joueur dont c'est le tour.
      if (!quiz && s.players[s.current]?.id !== profileId) return;
      const q = a.question;
      const result = check(generate(q.skillId, q.level, q.seed), response);
      if (result.invalid) return;
      if (quiz) settle(a, answerQuiz(s, profileId, result.correct));
      else play(a, result.correct);
    },

    /** Le joueur quitte (ou se déconnecte). */
    leave(profileId: string): void {
      const a = arenaOf(profileId);
      if (!a) return;
      if (!a.state) {
        // Salon : l'hôte qui part ferme le salon ; un invité qui part en sort.
        if (a.hostId === profileId) {
          closeLobby(a);
        } else {
          a.players = a.players.filter((p) => p.id !== profileId);
          push(a);
        }
      } else if (isQuiz(a.state) && !a.state.over) {
        settle(a, leaveQuiz(a.state, profileId));
      } else if (isRaid(a.state) && !a.state.over) {
        // Raid : le joueur sort du tour de table, l'équipe continue (sans pénalité).
        const wasTurn = a.state.players[a.state.current]?.id === profileId;
        const next = leaveRaid(a.state, profileId);
        settle(a, next);
        if (wasTurn && !next.over) {
          nextQuestion(a);
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

    /**
     * Connexion perdue : le joueur garde sa place `ARENA_GRACE_MS` (les autres le voient
     * « déconnecté ») ; s'il ne revient pas, il quitte l'arène. Son tour continue de s'écouler.
     */
    disconnected(profileId: string): void {
      const a = arenaOf(profileId);
      if (!a || a.away.has(profileId)) return;
      a.away.set(
        profileId,
        setTimeout(() => {
          a.away.delete(profileId);
          this.leave(profileId);
        }, ARENA_GRACE_MS),
      );
      push(a);
    },

    /** Le joueur revient (même appareil ou un autre de la famille) : il reprend sa place. */
    reconnected(profileId: string): void {
      const a = arenaOf(profileId);
      const timer = a?.away.get(profileId);
      if (!a || !timer) return;
      clearTimeout(timer);
      a.away.delete(profileId);
      push(a);
    },

    /** Arrêt du serveur : plus aucun minuteur actif. */
    dispose(): void {
      for (const a of [...arenas.values()]) remove(a);
      arenas.clear();
    },
  };
}

export type Arenas = ReturnType<typeof createArenas>;
