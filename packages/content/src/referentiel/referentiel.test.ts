import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../catalog.ts';
import { MATHS_REFERENTIAL, competencesOf } from './index.ts';

const GRADES = ['cm1', 'cm2', '6e', '5e', '4e', '3e'] as const;
const ORDER = ['ce2', ...GRADES];
const all = GRADES.flatMap((g) => competencesOf('maths', g).map((c) => ({ ...c, grade: g })));
const byId = new Map(all.map((c) => [c.id, c]));
const chapters = CHAPTERS.filter((c) => c.subject === 'maths');

describe('référentiel de maths', () => {
  it('rattache chaque chapitre exactement une fois, dans sa classe', () => {
    expect(all.map((c) => c.id).sort()).toEqual(chapters.map((c) => c.id).sort());
    for (const c of chapters) expect(byId.get(c.id)?.grade).toBe(c.grade);
  });

  it('a des identifiants uniques et une version entière positive', () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    expect(Number.isInteger(MATHS_REFERENTIAL.version)).toBe(true);
    expect(MATHS_REFERENTIAL.version).toBeGreaterThan(0);
  });

  it('fige les identifiants et les effectifs attendus (changer = incrémenter la version)', () => {
    const counts = Object.fromEntries(GRADES.map((g) => [g, competencesOf('maths', g).length]));
    expect(counts).toEqual({ cm1: 15, cm2: 15, '6e': 18, '5e': 17, '4e': 14, '3e': 13 });
    expect(MATHS_REFERENTIAL.version).toBe(1);
  });

  it('ne pointe que vers des compétences connues de la même classe ou antérieures', () => {
    const ce2Defined = MATHS_REFERENTIAL.grades.ce2 !== undefined;
    for (const c of all) {
      expect(c.prerequisites).not.toContain(c.id);
      expect(new Set(c.prerequisites).size).toBe(c.prerequisites.length);
      for (const p of c.prerequisites) {
        const target = byId.get(p);
        if (!target) {
          // Emplacement CE2 : accepté tant que le contenu CE2 n'est pas écrit.
          expect(p.startsWith('mce2-') && !ce2Defined, `${c.id} → ${p}`).toBe(true);
          continue;
        }
        expect(ORDER.indexOf(target.grade), `${c.id} → ${p}`).toBeLessThanOrEqual(ORDER.indexOf(c.grade));
      }
    }
  });

  it('est sans cycle de prérequis', () => {
    const state = new Map<string, 1 | 2>();
    const visit = (id: string, path: string[]) => {
      if (state.get(id) === 2) return;
      expect(state.get(id), `cycle : ${[...path, id].join(' → ')}`).toBeUndefined();
      state.set(id, 1);
      for (const p of byId.get(id)?.prerequisites ?? []) if (byId.has(p)) visit(p, [...path, id]);
      state.set(id, 2);
    };
    for (const c of all) visit(c.id, []);
  });

  it('compte 6 à 9 essentielles par classe, sur au moins 3 domaines', () => {
    const domainOf = new Map(chapters.map((c) => [c.id, c.domain]));
    for (const g of GRADES) {
      const essentials = competencesOf('maths', g).filter((c) => c.essential);
      expect(essentials.length, g).toBeGreaterThanOrEqual(6);
      expect(essentials.length, g).toBeLessThanOrEqual(9);
      expect(new Set(essentials.map((c) => domainOf.get(c.id))).size, g).toBeGreaterThanOrEqual(3);
    }
  });

  it('couvre chaque domaine présent dans une classe par au moins une compétence', () => {
    // Les essentielles ne couvrent pas tous les domaines (liste validée) : seul le rattachement est exigé.
    const domainOf = new Map(chapters.map((c) => [c.id, c.domain]));
    for (const g of GRADES) {
      const domains = new Set(chapters.filter((c) => c.grade === g).map((c) => c.domain));
      const covered = new Set(competencesOf('maths', g).map((c) => domainOf.get(c.id)));
      expect(covered).toEqual(domains);
    }
  });
});
