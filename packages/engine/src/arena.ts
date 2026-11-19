import { ARENA_HEARTS, ARENA_MAX_TURNS, type ArenaEvent, type ArenaPlayer } from '@questeo/shared';

/**
 * Arène (2 à 4 joueurs, chacun sur son appareil) : à son tour, un joueur répond à une question du
 * chapitre. Bonne réponse : il attaque l'adversaire le plus en forme (−1 cœur) ; erreur ou temps
 * écoulé : il perd un cœur. À 0 cœur, on est éliminé ; le dernier debout gagne. Au-delà de
 * ARENA_MAX_TURNS tours, le joueur qui a le plus de cœurs gagne (égalité : le premier dans l'ordre).
 */
export interface ArenaState {
  readonly players: readonly ArenaPlayer[];
  /** Indice du joueur dont c'est le tour. */
  readonly current: number;
  readonly turn: number;
  readonly over: boolean;
  readonly winnerId: string | null;
  readonly last: ArenaEvent | null;
}

export function startArena(players: readonly ArenaPlayer[]): ArenaState {
  const ready = players.filter((p) => p.ready).map((p) => ({ ...p, hearts: ARENA_HEARTS }));
  if (ready.length < 2) throw new Error('Il faut au moins 2 joueurs');
  return { players: ready, current: 0, turn: 0, over: false, winnerId: null, last: null };
}

const alive = (p: ArenaPlayer) => p.hearts > 0;

/** Adversaire visé par une bonne réponse : le plus de cœurs, puis le suivant dans l'ordre du tour. */
export function arenaTarget(s: ArenaState): number | null {
  const n = s.players.length;
  let best: number | null = null;
  for (let k = 1; k < n; k++) {
    const i = (s.current + k) % n;
    const p = s.players[i];
    if (!p || !alive(p)) continue;
    if (best === null || p.hearts > (s.players[best]?.hearts ?? 0)) best = i;
  }
  return best;
}

/** Joue le tour en cours : bonne réponse (attaque) ou erreur / temps écoulé (−1 cœur). */
export function playArenaTurn(s: ArenaState, correct: boolean, timeout = false): ArenaState {
  if (s.over) return s;
  const me = s.players[s.current];
  if (!me) return s;
  const target = correct ? arenaTarget(s) : null;
  const players = s.players.map((p, i) =>
    (correct && i === target) || (!correct && i === s.current) ? { ...p, hearts: Math.max(0, p.hearts - 1) } : p,
  );
  const last: ArenaEvent = {
    playerId: me.id,
    correct,
    targetId: target === null ? null : (players[target]?.id ?? null),
    timeout,
  };
  const turn = s.turn + 1;
  const standing = players.filter(alive);
  if (standing.length <= 1 || turn >= ARENA_MAX_TURNS) {
    const winner = [...players].sort((a, b) => b.hearts - a.hearts)[0];
    return { players, current: s.current, turn, over: true, winnerId: winner?.id ?? null, last };
  }
  // Tour suivant : le prochain joueur encore debout.
  let next = s.current;
  for (let k = 1; k <= players.length; k++) {
    const i = (s.current + k) % players.length;
    if (players[i] && alive(players[i])) {
      next = i;
      break;
    }
  }
  return { players, current: next, turn, over: false, winnerId: null, last };
}
