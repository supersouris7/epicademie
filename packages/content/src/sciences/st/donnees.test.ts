import { describe, expect, it } from 'vitest';
import { getSource } from '../../sources.ts';
import { ST_CHAPTERS } from './index.ts';
import { FAITS } from './donnees.ts';

describe('sciences CM1 « La matière » : données citées', () => {
  it('chaque fait a un identifiant unique, une source du registre et une citation non vide', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
    for (const f of FAITS) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(5);
    }
  });

  it('le chapitre porte les quatre notions du lot, à 5 niveaux, avec au moins un fait cité par notion', () => {
    const [chapitre] = ST_CHAPTERS;
    expect(chapitre?.id).toBe('pcm1-matiere');
    expect(chapitre?.skills.map((s) => s.id)).toEqual(['pcm1-etats', 'pcm1-eau', 'pcm1-masse-volume', 'pcm1-melanges']);
    for (const s of chapitre?.skills ?? []) {
      expect(s.levels, s.id).toBe(5);
      expect(s.lesson.sources?.length, s.id).toBeGreaterThan(0);
      expect(s.lesson.source, s.id).toContain('«');
    }
  });
});
