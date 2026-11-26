import { describe, expect, it } from 'vitest';
import { generate } from '../../catalog.ts';
import { glossaryIssues, sourceIssues } from '../../couverture.ts';
import { getSource } from '../../sources.ts';
import { FAITS_CLASSIFICATION } from './donnees-classification.ts';
import { SVT_CHAPTERS } from './index.ts';

const chapitre = SVT_CHAPTERS.find((c) => c.id === 'v5-classer')!;

describe('sciences 5e, SVT : classer le vivant', () => {
  it('chaque fait a un identifiant unique, une source du registre et une citation non vide', () => {
    expect(new Set(FAITS_CLASSIFICATION.map((f) => f.id)).size).toBe(FAITS_CLASSIFICATION.length);
    for (const f of FAITS_CLASSIFICATION) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('le chapitre porte les quatre notions du lot, à 5 niveaux, sourcées et avec les termes définis', () => {
    expect(chapitre.grade).toBe('5e');
    expect(chapitre.domain).toBe('svt');
    expect(chapitre.skills.map((s) => s.id)).toEqual([
      'v5-caracteres-partages',
      'v5-groupes-emboites',
      'v5-parentes',
      'v5-espece',
    ]);
    for (const skill of chapitre.skills) {
      expect(skill.levels, skill.id).toBe(5);
      expect(sourceIssues(skill), skill.id).toEqual([]);
      expect(glossaryIssues({ skill, chapter: chapitre }), skill.id).toEqual([]);
      for (const id of skill.lesson.sources ?? [])
        expect(
          FAITS_CLASSIFICATION.some((f) => f.source === id),
          `${skill.id} ${id}`,
        ).toBe(true);
    }
  });

  it('niveau 1 : erreurs expliquées ; niveau 5 : document, et au moins deux erreurs expliquées', () => {
    for (const skill of chapitre.skills)
      for (let seed = 1; seed <= 100; seed++) {
        expect(generate(skill.id, 1, seed).traps.length, skill.id).toBeGreaterThanOrEqual(2);
        const q = generate(skill.id, 5, seed);
        expect(q.figure?.kind, skill.id).toBe('document');
        expect(q.traps.length, `${skill.id} ${seed} ${q.prompt}`).toBeGreaterThanOrEqual(2);
      }
  });
});
