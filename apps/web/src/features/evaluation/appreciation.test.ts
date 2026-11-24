import { describe, expect, it } from 'vitest';
import { appreciation } from './appreciation.ts';

describe('appréciation de Questy', () => {
  it('suit la note sur 20, jamais de moquerie', () => {
    expect(appreciation(100, 'a')?.label).toBe('Sans faute');
    expect(appreciation(90, 'a')?.label).toBe('Très bien maîtrisé');
    expect(appreciation(70, 'a')?.label).toBe('Bien maîtrisé');
    expect(appreciation(60, 'a')?.label).toBe('En bonne voie');
    expect(appreciation(40, 'a')?.label).toBe('En chemin');
    expect(appreciation(0, 'a')?.label).toBe('Tout début');
    expect(appreciation(null, 'a')).toBeNull();
  });
  it('phrase stable pour une même épreuve, variée d’une épreuve à l’autre', () => {
    expect(appreciation(60, 'x1')?.line).toBe(appreciation(60, 'x1')?.line);
    const lines = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map((k) => appreciation(60, k)?.line));
    expect(lines.size).toBeGreaterThan(1);
  });
  it('épreuve écourtée : phrase dédiée', () => {
    expect(appreciation(60, 'a', true)?.line).toMatch(/écourtée/);
  });
});
