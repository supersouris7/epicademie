import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bossMood, bossOf, bossOfSubject, mobName, mobOf, randomArena, ARENAS } from './bosses.ts';

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
  beforeEach(() => localStorage.clear());

  it('les 5 arènes du client', () => {
    expect([...ARENAS].sort()).toEqual(['academie', 'espace', 'glace', 'jungle', 'volcan']);
  });
  it('5 tirages = 5 arènes distinctes', () => {
    const draws = Array.from({ length: 5 }, () => randomArena('p1'));
    expect(new Set(draws).size).toBe(5);
  });
  it('jamais deux identiques de suite sur 1 000 tirages, paquets complets', () => {
    const draws = Array.from({ length: 1000 }, () => randomArena('p1'));
    draws.forEach((a, i) => i > 0 && expect(a).not.toBe(draws[i - 1]));
    for (let i = 0; i < 1000; i += 5) expect(new Set(draws.slice(i, i + 5)).size).toBe(5);
  });
  it('état séparé par profil', () => {
    const a = randomArena('a');
    expect(randomArena('b', () => 0)).toBeDefined();
    expect(randomArena('a')).not.toBe(a);
  });
  it.each([[null], ['{pas du json'], ['"x"'], ['{"deck":["nope"],"last":3}'], ['{"deck":["jungle","jungle"]}']])(
    "stockage illisible (%s) : repart d'un paquet neuf",
    (raw) => {
      if (raw !== null) localStorage.setItem('epicademie.arenes.p1', raw);
      const draws = Array.from({ length: 5 }, () => randomArena('p1'));
      expect(new Set(draws).size).toBe(5);
    },
  );
  it('stockage bloqué : ne plante pas', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(ARENAS).toContain(randomArena('p1'));
    spy.mockRestore();
  });
});
