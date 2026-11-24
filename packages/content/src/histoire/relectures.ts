import type { Relecture } from '../types.ts';

/** Relectures pédagogiques de la matière (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'hcm1-traces', version: 1, lot: 'hi-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'hcm1-heritages', version: 1, lot: 'hi-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'hcm1-mouvements', version: 1, lot: 'hi-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'hcm1-clovis-charlemagne', version: 1, lot: 'hi-cm1-01', date: '2026-11-24', verdict: 'ok' },
];
