import type { Relecture } from '../types.ts';

/** Relectures pédagogiques de l'EMC (une ligne par notion et version relue). */
export const RELECTURES: readonly Relecture[] = [
  { skillId: 'emcm1-regles-lois', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-respect-autrui', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-egalite-dignite', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-fraternite-empathie', version: 1, lot: 'em-cm1-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-regles-en-ligne', version: 1, lot: 'em-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-chercher-information', version: 1, lot: 'em-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-respect-en-ligne', version: 1, lot: 'em-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-signaler', version: 1, lot: 'em-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm1-sobriete-numerique', version: 1, lot: 'em-cm1-02', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm2-valeurs-symboles', version: 1, lot: 'em-cm2-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm2-droits-de-tous', version: 1, lot: 'em-cm2-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm2-commune-elus', version: 1, lot: 'em-cm2-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm2-vote', version: 1, lot: 'em-cm2-01', date: '2026-11-24', verdict: 'ok' },
  { skillId: 'emcm2-liberte-expression', version: 1, lot: 'em-cm2-02', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'emcm2-liberte-information', version: 1, lot: 'em-cm2-02', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'emcm2-verifier-information', version: 1, lot: 'em-cm2-02', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'emcm2-sources', version: 1, lot: 'em-cm2-02', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-citoyennete', version: 1, lot: 'em-6e-01', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-laicite', version: 1, lot: 'em-6e-01', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-institutions-proximite', version: 1, lot: 'em-6e-01', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-droits-enfant', version: 1, lot: 'em-6e-01', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-droit-intimite', version: 1, lot: 'em-6e-02', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-donnees-personnelles', version: 1, lot: 'em-6e-02', date: '2026-11-25', verdict: 'ok' },
  { skillId: 'em6-harcelement', version: 1, lot: 'em-6e-02', date: '2026-11-25', verdict: 'ok' },
];
