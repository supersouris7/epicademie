import type { Relecture } from '../types.ts';

/** Relectures pédagogiques de la matière (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  'acm1-saluer',
  'acm1-your-name',
  'acm1-how-old',
  'acm1-nombres-1-31',
  'acm1-where-live',
].map((skillId) => ({ skillId, version: 1, lot: 'an-cm1-01', date: '2026-11-24', verdict: 'ok' as const }));
