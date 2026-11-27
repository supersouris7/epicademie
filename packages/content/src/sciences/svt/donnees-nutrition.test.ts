import { describe, expect, it } from 'vitest';
import { generate } from '../../catalog.ts';
import { glossaryIssues, sourceIssues } from '../../couverture.ts';
import { getSource } from '../../sources.ts';
import { FAITS_NUTRITION } from './donnees-nutrition.ts';
import { SVT_CHAPTERS } from './index.ts';

const chapitre = SVT_CHAPTERS.find((c) => c.id === 'v5-nutrition')!;

describe('sciences 5e, SVT : nutrition des êtres vivants', () => {
  it('chaque fait a un identifiant unique, une source du registre et une citation non vide', () => {
    expect(new Set(FAITS_NUTRITION.map((f) => f.id)).size).toBe(FAITS_NUTRITION.length);
    for (const f of FAITS_NUTRITION) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('le chapitre porte les quatre notions du lot, à 5 niveaux, sourcées et avec les termes définis', () => {
    expect(chapitre.grade).toBe('5e');
    expect(chapitre.domain).toBe('svt');
    expect(chapitre.skills.map((s) => s.id)).toEqual([
      'v5-besoins-vegetaux',
      'v5-respiration-etres-vivants',
      'v5-ecosystemes',
      'v5-biodiversite',
    ]);
    for (const skill of chapitre.skills) {
      expect(skill.levels, skill.id).toBe(5);
      expect(sourceIssues(skill), skill.id).toEqual([]);
      expect(glossaryIssues({ skill, chapter: chapitre }), skill.id).toEqual([]);
      for (const id of skill.lesson.sources ?? [])
        expect(
          FAITS_NUTRITION.some((f) => f.source === id),
          `${skill.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque notion a au moins deux erreurs expliquées et le niveau 5 porte un document', () => {
    for (const skill of chapitre.skills)
      for (let seed = 1; seed <= 20; seed++) {
        expect(generate(skill.id, 1, seed).traps.length, skill.id).toBeGreaterThanOrEqual(2);
        expect(generate(skill.id, 5, seed).figure?.kind, skill.id).toBe('document');
      }
  });
});
