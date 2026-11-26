import type { Relecture } from '../types.ts';

/** Relectures pédagogiques de la matière (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'p5-etats', version: 1, lot: 'pc-5e-01', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'p5-corps-purs-melanges', version: 1, lot: 'pc-5e-01', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-masse-volumique', version: 2, lot: 'pc-5e-01', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-solubilite', version: 1, lot: 'pc-5e-01', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-conservation-masse', version: 1, lot: 'pc-5e-01', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-trajectoire', version: 1, lot: 'pc-5e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-referentiel', version: 1, lot: 'pc-5e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-mouvement-uniforme', version: 1, lot: 'pc-5e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-vitesse-moyenne', version: 1, lot: 'pc-5e-02', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-sources-formes-energie', version: 1, lot: 'pc-5e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-conversions-energie', version: 1, lot: 'pc-5e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-circuits-serie-derivation', version: 1, lot: 'pc-5e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-conducteurs-isolants', version: 1, lot: 'pc-5e-03', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-propagation-lumiere', version: 1, lot: 'pc-5e-04', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-propagation-son', version: 1, lot: 'pc-5e-04', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-unites', version: 2, lot: 'pc-5e-04', date: '2026-11-26', verdict: 'ok' },
  { skillId: 'p5-prefixes', version: 2, lot: 'pc-5e-04', date: '2026-11-26', verdict: 'ok' },
];
