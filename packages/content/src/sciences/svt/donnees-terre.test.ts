import { describe, expect, it } from 'vitest';
import { generate } from '../../catalog.ts';
import { check } from '../../check.ts';
import { glossaryIssues, sourceIssues } from '../../couverture.ts';
import { getSource } from '../../sources.ts';
import { FAITS_TERRE } from './donnees-terre.ts';
import { SVT_CHAPTERS } from './index.ts';

const chapitre = SVT_CHAPTERS.find((c) => c.id === 'v4-terre');

describe('sciences 4e, SVT : la Terre interne', () => {
  it('chaque fait a un identifiant unique, une source du registre et une citation non vide', () => {
    expect(new Set(FAITS_TERRE.map((f) => f.id)).size).toBe(FAITS_TERRE.length);
    for (const f of FAITS_TERRE) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('le chapitre porte les quatre notions du lot, à 5 niveaux, sourcées et avec les termes définis', () => {
    if (!chapitre) throw new Error('chapitre v4-terre absent');
    expect(chapitre.grade).toBe('4e');
    expect(chapitre.domain).toBe('svt');
    expect(chapitre.skills.map((s) => s.id)).toEqual([
      'v4-structure-globe',
      'v4-tectonique-plaques',
      'v4-roches',
      'v4-histoire-terre',
    ]);
    for (const skill of chapitre.skills) {
      expect(skill.levels, skill.id).toBe(5);
      expect(skill.lesson.sources, skill.id).toContain('cycle4-2020');
      expect(sourceIssues(skill), skill.id).toEqual([]);
      expect(glossaryIssues({ skill, chapter: chapitre }), skill.id).toEqual([]);
      for (const id of skill.lesson.sources ?? [])
        expect(
          FAITS_TERRE.some((f) => f.source === id),
          `${skill.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque notion a au moins deux erreurs expliquées et le niveau 5 porte un document', () => {
    for (const skill of chapitre?.skills ?? [])
      for (let seed = 1; seed <= 20; seed++) {
        expect(generate(skill.id, 1, seed).traps.length, skill.id).toBeGreaterThanOrEqual(2);
        expect(generate(skill.id, 5, seed).figure?.kind, skill.id).toBe('document');
      }
  });

  it('accepte les variantes correctes des réponses écrites', () => {
    const attendus: Readonly<Record<string, readonly [string, string]>> = {
      'v4-structure-globe': ['la lithosphere', 'lithosphère'],
      'v4-tectonique-plaques': ['la subduction', 'subduction'],
      'v4-roches': ['roche metamorphique', 'métamorphique'],
      'v4-histoire-terre': ['le mesozoique', 'Mésozoïque'],
    };
    for (const [id, textes] of Object.entries(attendus)) {
      let vus = 0;
      for (let seed = 1; seed <= 200; seed++) {
        const q = generate(id, 4, seed);
        if (q.answer.kind !== 'text' || !q.answer.accepted.includes(textes[1])) continue;
        vus++;
        for (const text of textes) expect(check(q, { kind: 'text', text }).correct, `${id} ${text}`).toBe(true);
      }
      expect(vus, id).toBeGreaterThan(0);
    }
  });
});
