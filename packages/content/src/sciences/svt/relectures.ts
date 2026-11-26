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
  { skillId: 'v5-caracteres-partages', version: 1, lot: 'sv-5e-04', date: DATE, verdict: 'ok' },
  { skillId: 'v5-groupes-emboites', version: 1, lot: 'sv-5e-04', date: DATE, verdict: 'ok' },
  { skillId: 'v5-espece', version: 1, lot: 'sv-5e-04', date: DATE, verdict: 'ok' },
  { skillId: 'v5-parentes', version: 1, lot: 'sv-5e-04', date: DATE, verdict: 'ok' },
  { skillId: 'v4-structure-globe', version: 1, lot: 'sv-4e-01', date: DATE, verdict: 'ok' },
  { skillId: 'v4-tectonique-plaques', version: 1, lot: 'sv-4e-01', date: DATE, verdict: 'ok' },
  { skillId: 'v4-roches', version: 1, lot: 'sv-4e-01', date: DATE, verdict: 'ok' },
  { skillId: 'v4-histoire-terre', version: 1, lot: 'sv-4e-01', date: DATE, verdict: 'ok' },
  { skillId: 'v4-reproduction-sexuee-asexuee', version: 1, lot: 'sv-4e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-puberte', version: 1, lot: 'sv-4e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-reproduction-humaine', version: 1, lot: 'sv-4e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-maitrise-reproduction', version: 1, lot: 'sv-4e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-message-nerveux', version: 1, lot: 'sv-4e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-reflexe', version: 1, lot: 'sv-4e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-sommeil-ecrans', version: 1, lot: 'sv-4e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'v4-substances-sante', version: 1, lot: 'sv-4e-03', date: '2026-11-26', verdict: 'ok' },
];
