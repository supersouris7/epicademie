import type { Chapter } from '../../types.ts';
import { numeration } from './numeration.ts';
import { calcul } from './calcul.ts';
import { division } from './division.ts';
import { fractions } from './fractions.ts';
import { pourcentages } from './pourcentages.ts';
import { algebre } from './algebre.ts';
import { longueurs } from './longueurs.ts';
import { aires } from './aires.ts';
import { volumes } from './volumes.ts';
import { durees } from './durees.ts';
import { cercles } from './cercles.ts';
import { angles } from './angles.ts';
import { symetrie } from './symetrie.ts';
import { espace } from './espace.ts';
import { donnees } from './donnees.ts';
import { probabilites } from './probabilites.ts';
import { proportionnalite } from './proportionnalite.ts';
import { informatique } from './informatique.ts';

/** Mathématiques de 6e (cycle 3, BO n°16 du 17/04/2025), dans l’ordre du programme. */
export const SIXIEME: readonly Chapter[] = [
  numeration,
  calcul,
  division,
  fractions,
  pourcentages,
  algebre,
  longueurs,
  aires,
  volumes,
  durees,
  cercles,
  angles,
  symetrie,
  espace,
  donnees,
  probabilites,
  proportionnalite,
  informatique,
];
