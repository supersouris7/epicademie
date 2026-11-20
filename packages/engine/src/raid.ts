import { RAID_MAX_TURNS, raidSize, type ArenaEvent, type ArenaPlayer, type RaidStatus } from '@questeo/shared';
import type { ArenaState } from './arena.ts';

/**
 * Raid coopératif (2 à 4 joueurs, chacun sur son appareil ; docs/adr/0023-raid-et-tv.md) : à tour
 * de rôle, chacun répond à une question du chapitre. Bonne réponse : le boss perd 1 point de vie.
 * Erreur ou temps écoulé : l'équipe perd 1 cœur. Victoire de toute l'équipe quand le boss tombe ;
 * défaite si l'équipe n'a plus de cœurs ou après RAID_MAX_TURNS tours. Personne n'est éliminé :
 * un joueur qui part sort simplement du tour de table.
 */
export interface RaidState extends ArenaState {
  readonly raid: RaidStatus;
}

export function startRaid(players: readonly ArenaPlayer[]): RaidState {
  const ready = players.filter((p) => p.ready).map((p) => ({ ...p, hearts: 1 }));
  if (ready.length < 2) throw new Error('Il faut au moins 2 joueurs');
  const { bossHp, teamHearts } = raidSize(ready.length);
  return {
    players: ready,
    current: 0,
    turn: 0,
    over: false,
    winnerId: null,
    last: null,
    raid: { bossHp, bossMaxHp: bossHp, teamHearts, teamMaxHearts: teamHearts, won: null },
  };
}

const inGame = (p: ArenaPlayer) => p.hearts > 0;

export function playRaidTurn(s: RaidState, correct: boolean, timeout = false): RaidState {
  if (s.over) return s;
  const me = s.players[s.current];
  if (!me) return s;
  const bossHp = correct ? Math.max(0, s.raid.bossHp - 1) : s.raid.bossHp;
  const teamHearts = correct ? s.raid.teamHearts : Math.max(0, s.raid.teamHearts - 1);
  const last: ArenaEvent = { playerId: me.id, correct, targetId: null, timeout };
  const turn = s.turn + 1;
  const won = bossHp === 0;
  const lost = !won && (teamHearts === 0 || turn >= RAID_MAX_TURNS || !s.players.some(inGame));
  const raid = { ...s.raid, bossHp, teamHearts, won: won ? true : lost ? false : null };
  if (won || lost) return { ...s, turn, over: true, last, raid };
  let next = s.current;
  for (let k = 1; k <= s.players.length; k++) {
    const i = (s.current + k) % s.players.length;
    const p = s.players[i];
    if (p && inGame(p)) {
      next = i;
      break;
    }
  }
  return { ...s, current: next, turn, last, raid };
}

/**
 * Un joueur quitte le raid : il sort du tour de table, sans pénalité pour l'équipe. Si c'était
 * son tour, la main passe au suivant ; s'il ne reste personne, le raid est perdu.
 */
export function leaveRaid(s: RaidState, playerId: string): RaidState {
  if (s.over) return s;
  const players = s.players.map((p) => (p.id === playerId ? { ...p, hearts: 0 } : p));
  if (!players.some(inGame)) return { ...s, players, over: true, raid: { ...s.raid, won: false } };
  let current = s.current;
  if (s.players[s.current]?.id === playerId) {
    for (let k = 1; k <= players.length; k++) {
      const i = (s.current + k) % players.length;
      const p = players[i];
      if (p && inGame(p)) {
        current = i;
        break;
      }
    }
  }
  return { ...s, players, current };
}

export const isRaid = (s: ArenaState): s is RaidState => 'raid' in s;
