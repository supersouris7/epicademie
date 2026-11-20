import { describe, expect, it } from 'vitest';
import type { ArenaPlayer } from '@questeo/shared';
import { leaveRaid, playRaidTurn, startRaid } from './raid.ts';

const player = (id: string): ArenaPlayer => ({ id, name: id, hero: 'alex', hearts: 0, ready: true });

describe('raid coopératif', () => {
  it('boss et cœurs partagés à la taille de l’équipe ; tour à tour', () => {
    const s = startRaid([player('a'), player('b'), { ...player('c'), ready: false }]);
    expect(s.players.map((p) => p.id)).toEqual(['a', 'b']);
    expect(s.raid).toEqual({ bossHp: 6, bossMaxHp: 6, teamHearts: 4, teamMaxHearts: 4, won: null });
    const s1 = playRaidTurn(s, true);
    expect(s1.raid.bossHp).toBe(5);
    expect(s1.current).toBe(1);
    const s2 = playRaidTurn(s1, false, true);
    expect(s2.raid.teamHearts).toBe(3);
    expect(s2.last).toMatchObject({ playerId: 'b', correct: false, timeout: true });
    expect(s2.current).toBe(0);
  });

  it('victoire de toute l’équipe quand le boss tombe', () => {
    let s = startRaid([player('a'), player('b')]);
    for (let i = 0; i < 6; i++) s = playRaidTurn(s, true);
    expect(s.over).toBe(true);
    expect(s.raid.won).toBe(true);
    expect(s.winnerId).toBeNull();
  });

  it('défaite quand l’équipe n’a plus de cœurs', () => {
    let s = startRaid([player('a'), player('b')]);
    for (let i = 0; i < 4; i++) s = playRaidTurn(s, false);
    expect(s).toMatchObject({ over: true, raid: { won: false, teamHearts: 0 } });
  });

  it('un joueur qui part sort du tour de table, l’équipe continue', () => {
    let s = startRaid([player('a'), player('b'), player('c')]);
    s = leaveRaid(s, 'b');
    s = playRaidTurn(s, true);
    expect(s.players[s.current]?.id).toBe('c');
    // Départ pendant son tour : la main passe, sans perte de cœur.
    s = leaveRaid(s, 'c');
    expect(s.players[s.current]?.id).toBe('a');
    expect(s.raid.teamHearts).toBe(6);
    // Plus personne : raid perdu.
    expect(leaveRaid(s, 'a')).toMatchObject({ over: true, raid: { won: false } });
  });
});
