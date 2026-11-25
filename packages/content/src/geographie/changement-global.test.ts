import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { validateVariants } from '../validate.ts';
import { NOTIONS, SKILLS } from './changement-global.ts';
import { GEOGRAPHIE_CHAPTERS } from './index.ts';
import { PROGRAMME_C4 } from './kit.ts';

describe('géographie 5e — Changement global et risques', () => {
  it('publie les quatre notions du lot, à 5 niveaux', () => {
    expect(NOTIONS.map((n) => n.id)).toEqual([
      'g5-changement-climatique',
      'g5-risques',
      'g5-adaptation',
      'g5-prevention',
    ]);
    for (const s of SKILLS) expect(s.levels).toBe(5);
    const chapter = GEOGRAPHIE_CHAPTERS.find((c) => c.id === 'g5-changement-global');
    expect(chapter?.grade).toBe('5e');
    expect(chapter?.skills).toEqual(SKILLS);
  });

  it('génère des questions valides à chaque niveau, sources et glossaire complets', () => {
    for (const skill of SKILLS) {
      const levels = [1, 2, 3, 4, 5] as const;
      const questions = levels.flatMap((level) =>
        Array.from({ length: 60 }, (_, seed) => ({
          traps: [],
          targetSeconds: 20,
          ...skill.generate(createRng(seed), level),
          skillId: skill.id,
          level,
          seed,
        })),
      );
      expect(validateVariants(questions), skill.id).toEqual([]);
      expect(sourceIssues(skill), skill.id).toEqual([]);
      expect(glossaryIssues({ skill, chapter: { subject: 'geographie' } }), skill.id).toEqual([]);
      expect(skill.generate(createRng(1), 5).figure?.kind).toBe('document');
    }
  });

  it('cite le programme du cycle 4 en source et en leçon', () => {
    for (const s of SKILLS) {
      expect(s.lesson.sources?.[0], s.id).toBe(PROGRAMME_C4);
      expect(s.lesson.source, s.id).toContain('cinquième');
    }
  });

  it('cite une source du registre et une citation non vide pour chaque fait', () => {
    for (const n of NOTIONS) {
      const all = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)];
      for (const f of all) {
        expect(getSource(f.src ?? PROGRAMME_C4), n.id).toBeDefined();
        expect(f.quote.trim().length, n.id).toBeGreaterThan(15);
        expect(f.explain.trim().length, n.id).toBeGreaterThan(0);
      }
    }
  });

  it('prévoit des erreurs typiques expliquées et assez de matière par niveau', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(4);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(3);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });
});
