import { describe, expect, it } from 'vitest';
import { bossMood, bossOf, bossOfSubject, mobName, mobOf, randomArena, ARENAS } from './bosses.ts';

describe('boss et mobs', () => {
  it('un boss par matière (Golem par défaut)', () => {
    expect(bossOf({ subject: 'maths' }).name).toBeTruthy();
    expect(bossOfSubject('inconnue')).toBe(bossOfSubject('maths'));
  });

  it('humeur selon les vies, mobs tournants, nom lisible', () => {
    expect(bossMood(3)).not.toBe(bossMood(1));
    const boss = bossOfSubject('maths');
    expect(mobOf(boss, 0)).toBe(mobOf(boss, boss.mobs.length));
    expect(mobName(mobOf(boss, 0)).length).toBeGreaterThan(0);
    expect(ARENAS).toContain(randomArena());
  });
});
