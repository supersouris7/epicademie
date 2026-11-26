import { describe, expect, it } from 'vitest';
import { getSource } from '../../sources.ts';
import { FAITS } from './donnees.ts';
import { SVT_CHAPTERS } from './index.ts';

describe('sciences 5e, SVT : données citées', () => {
  it('chaque fait a un identifiant unique, une source du registre et une citation non vide', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
    for (const f of FAITS) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('le chapitre porte les quatre notions du lot, à 5 niveaux, sourcées par des faits cités', () => {
    const [chapitre] = SVT_CHAPTERS;
    expect(chapitre?.id).toBe('v5-terre');
    expect(chapitre?.grade).toBe('5e');
    expect(chapitre?.domain).toBe('svt');
    expect(chapitre?.skills.map((s) => s.id)).toEqual(['v5-meteo-climat', 'v5-seismes', 'v5-volcans', 'v5-risques']);
    for (const s of chapitre?.skills ?? []) {
      expect(s.levels, s.id).toBe(5);
      expect(s.lesson.sources, s.id).toContain('cycle4-2020');
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });
});
