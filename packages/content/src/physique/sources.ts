import { academie, tlfi, type Source } from '../sources-outils.ts';

/** Sources de physique-chimie (registre : `sources.ts` à la racine du paquet). */
export const SOURCES: readonly Source[] = [
  // Lot pc-5e-01 : organisation de la matière.
  tlfi('fusion', 'fusion', 'fusion'),
  tlfi('solidification', 'solidification', 'solidification'),
  tlfi('vaporisation', 'vaporisation', 'vaporisation'),
  tlfi('liquefaction', 'liquéfaction', 'liqu%C3%A9faction'),
  tlfi('condensation', 'condensation', 'condensation'),
  tlfi('ebullition', 'ébullition', '%C3%A9bullition'),
  tlfi('evaporation', 'évaporation', '%C3%A9vaporation'),
  tlfi('sublimation', 'sublimation', 'sublimation'),
  tlfi('solide', 'solide', 'solide'),
  tlfi('liquide', 'liquide', 'liquide'),
  tlfi('gaz', 'gaz', 'gaz'),
  tlfi('pur', 'pur', 'pur'),
  tlfi('melange', 'mélange', 'm%C3%A9lange'),
  tlfi('homogene', 'homogène', 'homog%C3%A8ne'),
  tlfi('heterogene', 'hétérogène', 'h%C3%A9t%C3%A9rog%C3%A8ne'),
  tlfi('azote', 'azote', 'azote'),
  tlfi('volumique', 'volumique', 'volumique'),
  tlfi('insoluble', 'insoluble', 'insoluble'),
  tlfi('solvant', 'solvant', 'solvant'),
  tlfi('solute', 'soluté', 'solut%C3%A9'),
  tlfi('sature', 'saturé', 'satur%C3%A9'),
  tlfi('solubilite', 'solubilité', 'solubilit%C3%A9'),
  tlfi('miscible', 'miscible', 'miscible'),
  tlfi('limpide', 'limpide', 'limpide'),
  { ...academie('eutectique', 'eutectique'), consultedOn: '2026-11-26' },
];
