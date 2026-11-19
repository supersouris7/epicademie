import { describe, expect, it } from 'vitest';
import { HEROES } from '@questeo/shared';
import { bossSays, faceOffExchange, heroSays, mobSays, pick, questySays } from './dialogue.ts';

describe('répliques', () => {
  it('ne répète jamais deux fois de suite la même réplique', () => {
    const list = ['a', 'b', 'c'];
    let prev = pick(list, () => 0);
    for (let i = 0; i < 20; i++) {
      const next = pick(list, () => 0);
      expect(next).not.toBe(prev);
      prev = next;
    }
    expect(() => pick([])).toThrow();
  });

  it('chaque personnage a des répliques non vides', () => {
    for (const hero of HEROES) expect(heroSays(hero, 'shoot').text.length).toBeGreaterThan(0);
    expect(bossSays('arrival').text.length).toBeGreaterThan(0);
    expect(mobSays('onHit').text.length).toBeGreaterThan(0);
    expect(questySays('arrival').length).toBeGreaterThan(0);
  });

  it('face-à-face : le boss ouvre, puis les répliques alternent', () => {
    const ex = faceOffExchange('alex', 'Tu ne passeras pas !');
    expect(ex[0]).toMatchObject({ speaker: 'boss', line: { text: 'Tu ne passeras pas !' } });
    for (let i = 1; i < ex.length; i++) expect(ex[i]?.speaker).not.toBe(ex[i - 1]?.speaker);
  });
});
