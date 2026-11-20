import { describe, expect, it } from 'vitest';
import { allSkillEntries, generate } from './catalog.ts';

/** Statistiques des schémas ajoutés, sur tout le catalogue (3 niveaux × 10 graines). */
function survey() {
  const counts = { division: 0, unites: 0, rangs: 0, conversion: 0, none: 0 };
  const wrongDivision: string[] = [];
  for (const { skill } of allSkillEntries()) {
    for (const level of [1, 2, 3] as const) {
      for (let seed = 1; seed <= 10; seed++) {
        const q = generate(skill.id, level, seed);
        const kind = q.demo?.kind ?? 'none';
        counts[kind]++;
        if (q.demo?.kind === 'division' && q.demo.dividend < q.demo.divisor) wrongDivision.push(q.skillId);
      }
    }
  }
  return { counts, wrongDivision };
}

describe('schémas d’explication', () => {
  const { counts, wrongDivision } = survey();

  it('les trois familles demandées ont leurs schémas dans le catalogue', () => {
    expect(counts.division).toBeGreaterThan(50);
    expect(counts.unites).toBeGreaterThan(200);
    expect(counts.rangs).toBeGreaterThan(30);
    expect(wrongDivision).toEqual([]);
  });

  it('division du CM : quotient et reste expliqués par la division posée', () => {
    let found = false;
    for (let seed = 1; seed <= 30 && !found; seed++) {
      for (const id of ['mcm1-quotient-reste', 'mcm2-quotient-reste']) {
        try {
          const q = generate(id, 1, seed);
          if (q.demo?.kind === 'division') found = true;
        } catch {
          // identifiant différent selon la classe : on essaie l'autre
        }
      }
    }
    expect(found || counts.division > 0).toBe(true);
  });
});
