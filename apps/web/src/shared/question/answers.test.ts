import { describe, expect, it } from 'vitest';
import type { Question } from '@epicademie/content';
import { formatAnswer, formatResponse, medalMessage } from './answers.ts';

const q = (answer: unknown, figure?: unknown) => ({ answer, figure }) as unknown as Question;

describe('réponses en texte', () => {
  it('bonne réponse selon son type', () => {
    expect(formatAnswer(q({ kind: 'number', value: { n: 7, d: 2 }, unit: 'cm' }))).toBe('3,5 cm');
    expect(formatAnswer(q({ kind: 'number', value: { n: 50, d: 1 }, unit: '%' }))).toBe('50 %');
    expect(formatAnswer(q({ kind: 'choice', options: ['A', 'B'], correct: 1 }))).toBe('B');
    expect(formatAnswer(q({ kind: 'text', accepted: ['carré'] }))).toBe('carré');
    expect(formatAnswer(q({ kind: 'point', x: 2, y: -1 }, { kind: 'grid', axes: true }))).toMatch(/\(2 ; −1\)/);
    expect(formatAnswer(q({ kind: 'point', x: 2, y: 1 }))).toBe('le nœud entouré en vert');
  });

  it('réponse donnée par l’élève', () => {
    const num = q({ kind: 'number', value: { n: 1, d: 1 }, unit: 'g' });
    expect(formatResponse(num, { kind: 'number', text: '12' })).toBe('12 g');
    expect(formatResponse(num, { kind: 'fraction', num: '3', den: '4' })).toBe('{3/4}');
    expect(formatResponse(num, { kind: 'fraction', num: '3', den: '1' })).toBe('3');
    const ch = q({ kind: 'choice', options: ['Oui', 'Non'], correct: 0 });
    expect(formatResponse(ch, { kind: 'choice', index: 1 })).toBe('Non');
    expect(formatResponse(num, { kind: 'choice', index: 1 })).toBe('');
    expect(formatResponse(q({ kind: 'point' }, { kind: 'grid', axes: true }), { kind: 'point', x: 1, y: 2 })).toBe(
      'le point (1 ; 2)',
    );
    expect(formatResponse(num, { kind: 'text', text: 'abc' })).toBe('abc');
  });

  it('message de médaille de fin de série', () => {
    const base = { answered: 4, bestBefore: 0, due: '2026-11-20' };
    expect(medalMessage({ ...base, bestAfter: 5 })).toMatch(/or/);
    expect(medalMessage({ ...base, bestBefore: 5, bestAfter: 5 })).toMatch(/Toujours en or/);
    expect(medalMessage({ ...base, bestAfter: 4 })).toMatch(/Argent/);
    expect(medalMessage({ ...base, bestAfter: 3 })).toMatch(/Bronze/);
    expect(medalMessage({ ...base, answered: 2, bestAfter: 0 })).toMatch(/série complète/);
    expect(medalMessage({ ...base, bestAfter: 1 })).toMatch(/réessaie dès/);
    expect(medalMessage({ ...base, due: null, bestAfter: 1 })).toMatch(/bientôt/);
  });

  it('or avec aide : invitation au diamant ; diamant accordé au profil, neutre sans genre', () => {
    const base = { answered: 4, bestBefore: 0, due: null };
    expect(medalMessage({ ...base, bestAfter: 5 })).toMatch(/Reviens sans indice pour le diamant !/);
    const diamond = { ...base, bestAfter: 6 };
    expect(medalMessage(diamond, 'garcon')).toMatch(/Tu l’as maîtrisée seul !/);
    expect(medalMessage(diamond, 'fille')).toMatch(/Tu l’as maîtrisée seule !/);
    expect(medalMessage(diamond, null)).toMatch(/Maîtrisée sans aide !/);
    expect(medalMessage({ ...diamond, bestBefore: 6 })).toBe('Toujours en diamant : bravo !');
  });
});
