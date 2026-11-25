import { describe, expect, it } from 'vitest';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { validateVariants } from '../validate.ts';
import type { Level } from '../types.ts';
import { GEOGRAPHIE_CHAPTERS } from './index.ts';
import { PROGRAMME_C4 } from './kit.ts';
import { NOTIONS, SKILLS } from './reperes-5e.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => {
  const skill = SKILLS.find((s) => s.id === id)!;
  return Array.from({ length: 80 }, (_, seed) => ({
    traps: [],
    targetSeconds: 20,
    ...skill.generate(createRng(seed), level),
    skillId: id,
    level,
    seed,
  }));
};

describe('géographie 5e — Repères de 5e', () => {
  it('publie les quatre notions du lot, à 5 niveaux', () => {
    expect(NOTIONS.map((n) => n.id)).toEqual([
      'g5-cartes',
      'g5-foyers-population',
      'g5-reperes-ressources',
      'g5-vocabulaire',
    ]);
    for (const s of SKILLS) {
      expect(s.levels).toBe(5);
      expect(s.lesson.sources?.[0], s.id).toBe(PROGRAMME_C4);
      expect(s.lesson.source, s.id).toContain('cinquième');
    }
    const chapter = GEOGRAPHIE_CHAPTERS.find((c) => c.id === 'g5-reperes');
    expect(chapter?.grade).toBe('5e');
    expect(chapter?.skills).toEqual(SKILLS);
  });

  it('génère des questions valides à chaque niveau, sources et glossaire complets', () => {
    for (const skill of SKILLS) {
      expect(validateVariants(LEVELS.flatMap((l) => questions(skill.id, l))), skill.id).toEqual([]);
      expect(sourceIssues(skill), skill.id).toEqual([]);
      expect(glossaryIssues({ skill, chapter: { subject: 'geographie' } }), skill.id).toEqual([]);
    }
  });

  it('cite une source du registre et une citation pour chaque fait, avec des erreurs expliquées', () => {
    for (const n of NOTIONS) {
      for (const f of [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)]) {
        expect(getSource(f.src!), `${n.id} ${f.src}`).toBeDefined();
        expect(f.quote.trim().length, n.id).toBeGreaterThan(15);
      }
      for (const f of n.faits) {
        expect(f.wrong.length, f.q).toBeGreaterThanOrEqual(3);
        // La réponse du texte à trous ne figure pas déjà dans la phrase.
        for (const a of f.gap[2]) expect(`${f.gap[0]} ${f.gap[1]}`.split(/\P{L}+/u), f.q).not.toContain(a);
      }
      for (const l of n.libres) expect(l.traps.length, l.q).toBeGreaterThanOrEqual(2);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('interroge sur la carte les foyers et les ressources : toucher en 3 et 4, repères en 5', () => {
    for (const id of ['g5-foyers-population', 'g5-reperes-ressources']) {
      const cibles = (level: Level) =>
        new Set(
          questions(id, level)
            .filter((q) => q.answer.kind === 'zone')
            .map((q) => q.prompt.replace(/^.*?« /, '')),
        );
      expect(cibles(3).size, id).toBeGreaterThan(1);
      expect(cibles(4).size, id).toBeGreaterThan(1);
      expect([...cibles(4)].filter((c) => cibles(3).has(c))).toEqual([]);
      expect(
        questions(id, 5).some((q) => q.figure?.kind === 'map'),
        id,
      ).toBe(true);
      expect(
        questions(id, 5).some((q) => q.figure?.kind === 'document'),
        id,
      ).toBe(true);
    }
  });

  it('montre sur le planisphère un figuré repéré par une lettre aux niveaux 1 et 2 seulement', () => {
    for (const level of LEVELS) {
      const cartes = questions('g5-cartes', level).filter((q) => q.figure?.kind === 'map');
      expect(cartes.length > 0, `${level}`).toBe(level <= 2);
    }
  });
});
