import type { Relecture } from '../types.ts';

/** Relectures pédagogiques de la matière (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'gcm1-espace-proche', version: 1, lot: 'ge-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-commune', version: 1, lot: 'ge-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-france-carte', version: 1, lot: 'ge-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-grands-reperes', version: 1, lot: 'ge-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-espaces-urbains', version: 1, lot: 'ge-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-espaces-touristiques', version: 1, lot: 'ge-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-logement', version: 1, lot: 'ge-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm1-travail', version: 1, lot: 'ge-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'gcm2-quotidien', version: 1, lot: 'ge-cm2-01', date: '2026-11-25', verdict: 'ok' },
];
