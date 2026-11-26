import type { Relecture } from '../../types.ts';

const LOT = 'sv-5e-01';
const DATE = '2026-11-26';

/** Relectures pédagogiques de la matière (une ligne par notion et version relue), remplies par la Pédagogie. */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'v5-meteo-climat', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'v5-seismes', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'v5-volcans', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'v5-risques', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'v5-besoins-vegetaux', version: 1, lot: 'sv-5e-02', date: DATE, verdict: 'ok' },
  { skillId: 'v5-respiration-etres-vivants', version: 1, lot: 'sv-5e-02', date: DATE, verdict: 'ok' },
  { skillId: 'v5-ecosystemes', version: 1, lot: 'sv-5e-02', date: DATE, verdict: 'ok' },
  { skillId: 'v5-biodiversite', version: 1, lot: 'sv-5e-02', date: DATE, verdict: 'ok' },
  { skillId: 'v5-circulation', version: 1, lot: 'sv-5e-03', date: DATE, verdict: 'ok' },
  { skillId: 'v5-respiration-humaine', version: 1, lot: 'sv-5e-03', date: DATE, verdict: 'ok' },
  { skillId: 'v5-digestion', version: 1, lot: 'sv-5e-03', date: DATE, verdict: 'ok' },
  { skillId: 'v5-effort', version: 1, lot: 'sv-5e-03', date: DATE, verdict: 'ok' },
];
