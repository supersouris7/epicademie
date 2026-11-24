import { describe, expect, it } from 'vitest';
import { ResponseSchema } from './play.ts';

describe('ResponseSchema : réponses structurées', () => {
  it('accepte ordre, association et texte à trous', () => {
    expect(ResponseSchema.safeParse({ kind: 'order', order: [2, 0, 1] }).success).toBe(true);
    expect(ResponseSchema.safeParse({ kind: 'match', pairs: [1, 0, 2] }).success).toBe(true);
    expect(ResponseSchema.safeParse({ kind: 'cloze', answers: ['avons mangé', 'restaurant'] }).success).toBe(true);
  });

  it('refuse les formes démesurées ou mal formées', () => {
    expect(ResponseSchema.safeParse({ kind: 'order', order: [] }).success).toBe(false);
    expect(ResponseSchema.safeParse({ kind: 'order', order: [0, 1.5] }).success).toBe(false);
    expect(ResponseSchema.safeParse({ kind: 'order', order: Array.from({ length: 13 }, (_, i) => i) }).success).toBe(
      false,
    );
    expect(ResponseSchema.safeParse({ kind: 'match', pairs: [-1, 0] }).success).toBe(false);
    expect(ResponseSchema.safeParse({ kind: 'cloze', answers: ['x'.repeat(81)] }).success).toBe(false);
    expect(ResponseSchema.safeParse({ kind: 'cloze', answers: [] }).success).toBe(false);
  });

  it('les anciennes réponses restent valides', () => {
    expect(ResponseSchema.safeParse({ kind: 'text', text: 'a' }).success).toBe(true);
    expect(ResponseSchema.safeParse({ kind: 'unknown' }).success).toBe(true);
  });

  it('zone : un identifiant de zone, rien d’autre', () => {
    expect(ResponseSchema.safeParse({ kind: 'zone', zone: '53' }).success).toBe(true);
    expect(ResponseSchema.safeParse({ kind: 'zone', zone: 'amerique-nord' }).success).toBe(true);
    expect(ResponseSchema.safeParse({ kind: 'zone', zone: '' }).success).toBe(false);
    expect(ResponseSchema.safeParse({ kind: 'zone', zone: '<script>' }).success).toBe(false);
    expect(ResponseSchema.safeParse({ kind: 'zone' }).success).toBe(false);
  });
});
