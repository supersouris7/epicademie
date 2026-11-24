import { describe, expect, it } from 'vitest';
import type { ArenaPlayer } from '@epicademie/shared';
import { arenaTarget, playArenaTurn, startArena } from './arena.ts';

const p = (id: string, ready = true): ArenaPlayer => ({ id, name: id, hero: 'alex', hearts: 0, ready });

describe('arène', () => {
  it('démarre avec les joueurs prêts, 3 cœurs chacun ; il en faut 2', () => {
    const s = startArena([p('a'), p('b'), p('c', false)]);
    expect(s.players.map((x) => [x.id, x.hearts])).toEqual([
      ['a', 3],
      ['b', 3],
    ]);
    expect(() => startArena([p('a'), p('b', false)])).toThrow();
  });

  it('bonne réponse : attaque l’adversaire le plus en forme ; erreur : perd un cœur ; tour suivant', () => {
    let s = startArena([p('a'), p('b'), p('c')]);
    s = playArenaTurn(s, true); // a attaque b (ex æquo : le suivant)
    expect(s.last).toMatchObject({ playerId: 'a', correct: true, targetId: 'b' });
    expect(s.players.map((x) => x.hearts)).toEqual([3, 2, 3]);
    expect(s.current).toBe(1);
    s = playArenaTurn(s, true); // b vise le plus de cœurs : c (3) avant a (3) dans l'ordre
    expect(s.last?.targetId).toBe('c');
    s = playArenaTurn(s, false, true); // c : temps écoulé
    expect(s.last).toMatchObject({ playerId: 'c', correct: false, timeout: true, targetId: null });
    expect(s.players.map((x) => x.hearts)).toEqual([3, 2, 1]);
    expect(arenaTarget(s)).toBe(1);
  });

  it('les éliminés passent leur tour ; le dernier debout gagne', () => {
    let s = startArena([p('a'), p('b')]);
    for (let i = 0; i < 3; i++) {
      s = playArenaTurn(s, true); // a touche b
      if (!s.over) s = playArenaTurn(s, false); // b se trompe… puis encore
    }
    expect(s.over).toBe(true);
    expect(s.winnerId).toBe('a');
  });
});
