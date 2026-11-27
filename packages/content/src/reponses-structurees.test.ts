import { describe, expect, it } from 'vitest';
import { check } from './check.ts';
import type { Question } from './types.ts';
import { validateQuestion } from './validate.ts';

const base = {
  skillId: 't',
  level: 1,
  seed: 1,
  prompt: 'Consigne.',
  steps: ['Étape.'],
  hint: 'Indice.',
  traps: [],
  targetSeconds: 30,
} as const;
const codes = (q: Question) => validateQuestion(q).map((i) => i.code);

const order = (items: string[], correct: number[]): Question => ({
  ...base,
  answer: { kind: 'order', items, correct },
});
const match = (left: string[], right: string[], pairs: number[]): Question => ({
  ...base,
  answer: { kind: 'match', left, right, pairs },
});

describe('ordre', () => {
  // Présentés : B, C, A ; ordre juste : A, B, C.
  const q = order(['B', 'C', 'A'], [2, 0, 1]);

  it('accepte l’ordre juste et refuse les autres, avec les places justes', () => {
    expect(check(q, { kind: 'order', order: [2, 0, 1] }).correct).toBe(true);
    const bad = check(q, { kind: 'order', order: [2, 1, 0] });
    expect(bad.correct).toBe(false);
    expect(bad.parts).toEqual([true, false, false]);
  });

  it('une réponse incomplète, en double ou hors bornes est à refaire', () => {
    for (const o of [
      [2, 0],
      [2, 2, 0],
      [0, 1, 3],
      [-1, 0, 1],
    ])
      expect(check(q, { kind: 'order', order: o }).invalid).toBe(true);
    expect(check(q, { kind: 'text', text: 'a' }).invalid).toBe(true);
    expect(check(q, { kind: 'unknown' })).toEqual({ correct: false });
  });

  it('validation : question saine, puis un seul ordre juste parmi toutes les permutations', () => {
    expect(codes(q)).toEqual([]);
    expect(codes(order(['A', 'B', 'C', 'D', 'E', 'F'], [3, 1, 5, 0, 2, 4]))).toEqual([]);
  });

  it('validation : taille, doublons, déjà rangé, solution invalide', () => {
    expect(codes(order(['B', 'A'], [1, 0]))).toContain('ordre-taille');
    expect(codes(order(['A', 'B', 'C', 'D', 'E', 'F', 'G'], [1, 0, 2, 3, 4, 5, 6]))).toContain('ordre-taille');
    expect(codes(order(['B', 'b ', 'A'], [2, 0, 1]))).toContain('element-doublon');
    expect(codes(order(['A', 'B', 'C'], [0, 1, 2]))).toContain('ordre-deja-range');
    expect(codes(order(['B', 'C', 'A'], [2, 0, 0]))).toContain('ordre-permutation');
    expect(codes(order(['B', '', 'A'], [2, 0, 1]))).toContain('element-vide');
  });
});

describe('association', () => {
  // Gauche : France, Italie, Espagne ; droite mélangée : Rome, Madrid, Paris.
  const q = match(['France', 'Italie', 'Espagne'], ['Rome', 'Madrid', 'Paris'], [2, 0, 1]);

  it('accepte la bonne association et marque les paires justes', () => {
    expect(check(q, { kind: 'match', pairs: [2, 0, 1] }).correct).toBe(true);
    const bad = check(q, { kind: 'match', pairs: [2, 1, 0] });
    expect(bad.correct).toBe(false);
    expect(bad.parts).toEqual([true, false, false]);
  });

  it('une capitale utilisée deux fois ou une paire manquante est à refaire', () => {
    expect(check(q, { kind: 'match', pairs: [2, 2, 1] }).invalid).toBe(true);
    expect(check(q, { kind: 'match', pairs: [2, 0] }).invalid).toBe(true);
    expect(check(q, { kind: 'match', pairs: [2, 0, 3] }).invalid).toBe(true);
  });

  it('validation : question saine, une seule solution', () => {
    expect(codes(q)).toEqual([]);
  });

  it('validation : taille, colonnes, doublons, déjà en face', () => {
    expect(codes(match(['a', 'b'], ['x', 'y'], [1, 0]))).toContain('paires-taille');
    expect(codes(match(['a', 'b', 'c'], ['x', 'y'], [1, 0, 0]))).toContain('paires-colonnes');
    expect(codes(match(['a', 'b', 'c'], ['x', 'y', 'z'], [1, 1, 0]))).toContain('paires-permutation');
    expect(codes(match(['a', 'b', 'c'], ['x', 'x', 'z'], [1, 0, 2]))).toContain('element-doublon');
    expect(codes(match(['a', 'b', 'c'], ['x', 'y', 'z'], [0, 1, 2]))).toContain('paires-deja-rangees');
  });

  it('validation : deux éléments identiques à droite (casse près) sont refusés', () => {
    expect(codes(match(['a', 'b', 'c'], ['x', 'X', 'z'], [1, 0, 2]))).toContain('element-doublon');
  });
});

describe('texte à trous', () => {
  const q: Question = {
    ...base,
    answer: {
      kind: 'cloze',
      parts: ['Nous ', ' hier au ', '.'],
      blanks: [
        { mode: 'text', accepted: ['avons mangé', 'avons mangé'] },
        { mode: 'list', options: ['restaurant', 'restaurants'], correct: 0 },
      ],
    },
  };

  it('corrige trou par trou, sans tenir compte de la casse ni des espaces', () => {
    expect(check(q, { kind: 'cloze', answers: [' Avons  Mangé ', 'restaurant'] }).correct).toBe(true);
    const bad = check(q, { kind: 'cloze', answers: ['avons mange', 'restaurant'] });
    expect(bad).toEqual({ correct: false, parts: [false, true] });
  });

  it('un trou vide ou un mauvais nombre de trous est à refaire', () => {
    expect(check(q, { kind: 'cloze', answers: ['avons mangé', ' '] }).invalid).toBe(true);
    expect(check(q, { kind: 'cloze', answers: ['avons mangé'] }).invalid).toBe(true);
  });

  it('validation : question saine et incohérences', () => {
    expect(codes(q)).toEqual([]);
    const a = q.answer;
    if (a.kind !== 'cloze') throw new Error('type');
    expect(codes({ ...q, answer: { ...a, parts: ['Nous ', '.'] } })).toContain('trou-segments');
    expect(codes({ ...q, answer: { ...a, blanks: [] } })).toContain('trou-aucun');
    expect(codes({ ...q, answer: { ...a, blanks: [{ mode: 'text', accepted: [] }, ...a.blanks.slice(1)] } })).toContain(
      'trou-attendu',
    );
    expect(
      codes({ ...q, answer: { ...a, blanks: [a.blanks[0]!, { mode: 'list', options: ['a', 'a'], correct: 3 }] } }),
    ).toEqual(expect.arrayContaining(['trou-correct', 'element-doublon']));
  });
});

describe('figure « document »', () => {
  it('refuse un document vide ou à ligne vide', () => {
    const q = order(['B', 'C', 'A'], [2, 0, 1]);
    expect(codes({ ...q, figure: { kind: 'document', lines: ['Ligne un', 'Ligne deux'] } })).toEqual([]);
    expect(codes({ ...q, figure: { kind: 'document', lines: [] } })).toContain('figure');
    expect(codes({ ...q, figure: { kind: 'document', lines: ['a', ' '] } })).toContain('figure');
  });
});
