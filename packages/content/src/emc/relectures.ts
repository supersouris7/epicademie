import type { Relecture } from '../types.ts';

/** Relectures pédagogiques de l'EMC (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'emcm1-regles-lois', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-respect-autrui', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-egalite-dignite', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
];
