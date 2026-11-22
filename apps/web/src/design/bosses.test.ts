import { describe, expect, it } from 'vitest';
import { bossMood, bossOf, bossOfSubject, mobName, mobOf, randomArena, ARENAS, SUBJECT_ARENAS } from './bosses.ts';

describe('boss et mobs', () => {
  it('un boss par matière (Sorcier π par défaut)', () => {
    expect(bossOf({ subject: 'maths' }).name).toBe('Sorcier π');
    expect(bossOfSubject('inconnue')).toBe(bossOfSubject('maths'));
  });

  it('humeur selon les vies, mobs tournants, nom lisible', () => {
    expect(bossMood(3)).not.toBe(bossMood(1));
    const boss = bossOfSubject('maths');
    expect(mobOf(boss, 0)).toBe(mobOf(boss, boss.mobs.length));
    expect(mobName(mobOf(boss, 0)).length).toBeGreaterThan(0);
  });
});

describe('arènes', () => {
  it('les 5 arènes du client, toutes réparties entre les matières', () => {
    expect([...ARENAS].sort()).toEqual(['academie', 'espace', 'glace', 'jungle', 'volcan']);
    expect(new Set(Object.values(SUBJECT_ARENAS).flatMap((l) => l ?? []))).toEqual(new Set(ARENAS));
  });
  it('tirage parmi les arènes de la matière, sinon parmi toutes', () => {
    for (let i = 0; i < 20; i++) {
      expect(SUBJECT_ARENAS.physique).toContain(randomArena('physique'));
      expect(ARENAS).toContain(randomArena('inconnue'));
    }
  });
});
