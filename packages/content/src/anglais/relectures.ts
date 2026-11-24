import type { Relecture } from '../types.ts';

const lot01 = ['acm1-saluer', 'acm1-your-name', 'acm1-how-old', 'acm1-nombres-1-31', 'acm1-where-live'];
const lot02: readonly (readonly [string, number])[] = [
  ['acm1-be-present', 2],
  ['acm1-pronoms-sujets', 1],
  ['acm1-questions-be', 1],
  ['acm1-possessifs', 2],
];

/** Relectures pédagogiques de la matière (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  ...lot01.map((skillId) => ({ skillId, version: 1, lot: 'an-cm1-01', date: '2026-11-24', verdict: 'ok' as const })),
  ...lot02.map(([skillId, version]) => ({
    skillId,
    version,
    lot: 'an-cm1-02',
    date: '2026-11-24',
    verdict: 'ok' as const,
  })),
  { skillId: 'acm1-mois', version: 1, lot: 'an-cm1-03', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'acm1-couleurs', version: 1, lot: 'an-cm1-03', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'acm1-jours', version: 1, lot: 'an-cm1-03', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'acm1-saisons', version: 1, lot: 'an-cm1-03', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'acm1-date', version: 1, lot: 'an-cm1-03', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'acm1-meteo', version: 1, lot: 'an-cm1-03', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'acm1-famille', version: 1, lot: 'an-cm1-04', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'acm1-corps', version: 1, lot: 'an-cm1-04', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'acm1-genitif', version: 1, lot: 'an-cm1-04', date: '2026-11-25', verdict: 'ok' },
];
