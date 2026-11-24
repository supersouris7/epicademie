import type { Relecture } from '../../types.ts';

const LOT = 'st-cm1-01';
const DATE = '2026-11-24';

/** Relectures pédagogiques de la matière (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'pcm1-etats', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-eau', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-masse-volume', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-melanges', version: 1, lot: LOT, date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-sources-energie', version: 1, lot: 'st-cm1-02', date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-formes-energie', version: 1, lot: 'st-cm1-02', date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-mouvement', version: 1, lot: 'st-cm1-02', date: DATE, verdict: 'ok' },
  { skillId: 'pcm1-energie-quotidien', version: 1, lot: 'st-cm1-02', date: DATE, verdict: 'ok' },
  { skillId: 'vcm1-classer', version: 1, lot: 'st-cm1-03', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'vcm1-besoins-animaux', version: 1, lot: 'st-cm1-03', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'vcm1-besoins-vegetaux', version: 1, lot: 'st-cm1-03', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'vcm1-developpement', version: 1, lot: 'st-cm1-03', date: '2026-11-25', verdict: 'ok' },
];
