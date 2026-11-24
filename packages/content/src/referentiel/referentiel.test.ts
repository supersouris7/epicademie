import { describe, expect, it } from 'vitest';
import type { SubjectId } from '@epicademie/shared';
import { CHAPTERS } from '../catalog.ts';
import { CE2_CHAPTERS } from '../ce2.ts';
import { MATHS_REFERENTIAL, REFERENTIALS, competencesOf } from './index.ts';

const GRADES = ['cm1', 'cm2', '6e', '5e', '4e', '3e'] as const;
const ORDER: readonly string[] = ['ce2', ...GRADES];
const ALL_GRADES = ['ce2', ...GRADES] as const;
const chaptersOf = (subject: SubjectId) => [
  ...CHAPTERS.filter((c) => c.subject === subject),
  ...(subject === 'maths' ? CE2_CHAPTERS : []),
];

describe.each(REFERENTIALS.map((r) => r.subject))('référentiel : %s', (subject) => {
  const all = ALL_GRADES.flatMap((g) => competencesOf(subject, g).map((c) => ({ ...c, grade: g })));
  const byId = new Map(all.map((c) => [c.id, c]));
  const chapters = chaptersOf(subject);
  const grades = ALL_GRADES.filter((g) => competencesOf(subject, g).length > 0);
  it('rattache chaque chapitre exactement une fois, dans sa classe', () => {
    expect(all.map((c) => c.id).sort()).toEqual(chapters.map((c) => c.id).sort());
    for (const c of chapters) expect(byId.get(c.id)?.grade).toBe(c.grade);
    // Le CE2 n'est jamais jouable : aucun chapitre CE2 dans le catalogue d'Entraînement.
    expect(CHAPTERS.some((c) => c.id.startsWith('mce2-'))).toBe(false);
  });

  it('a des identifiants uniques et une version entière positive', () => {
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    const version = REFERENTIALS.find((r) => r.subject === subject)?.version ?? 0;
    expect(Number.isInteger(version)).toBe(true);
    expect(version).toBeGreaterThan(0);
  });

  it('ne pointe que vers des compétences connues de la même classe ou antérieures', () => {
    for (const c of all) {
      expect(c.prerequisites).not.toContain(c.id);
      expect(new Set(c.prerequisites).size).toBe(c.prerequisites.length);
      for (const p of c.prerequisites) {
        const target = byId.get(p);
        expect(target, `${c.id} → ${p} : prérequis inconnu`).toBeDefined();
        if (!target) continue;
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
    for (const g of grades) {
      const essentials = competencesOf(subject, g).filter((c) => c.essential);
      expect(essentials.length, g).toBeGreaterThanOrEqual(6);
      expect(essentials.length, g).toBeLessThanOrEqual(9);
      expect(new Set(essentials.map((c) => domainOf.get(c.id))).size, g).toBeGreaterThanOrEqual(3);
    }
  });

  it('couvre chaque domaine présent dans une classe par au moins une compétence', () => {
    // Les essentielles ne couvrent pas tous les domaines (liste validée) : seul le rattachement est exigé.
    const domainOf = new Map(chapters.map((c) => [c.id, c.domain]));
    for (const g of grades) {
      const domains = new Set(chapters.filter((c) => c.grade === g).map((c) => c.domain));
      const covered = new Set(competencesOf(subject, g).map((c) => domainOf.get(c.id)));
      expect(covered).toEqual(domains);
    }
  });
});

describe('référentiel de maths (effectifs figés)', () => {
  it('fige les identifiants et les effectifs attendus (changer = incrémenter la version)', () => {
    const counts = Object.fromEntries(ALL_GRADES.map((g) => [g, competencesOf('maths', g).length]));
    expect(counts).toEqual({ ce2: 9, cm1: 15, cm2: 15, '6e': 18, '5e': 17, '4e': 14, '3e': 13 });
    expect(MATHS_REFERENTIAL.version).toBe(2);
  });
});

describe('référentiels enregistrés', () => {
  it('compte une seule entrée par matière', () => {
    const subjects = REFERENTIALS.map((r) => r.subject);
    expect(new Set(subjects).size).toBe(subjects.length);
  });
});
