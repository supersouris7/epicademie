import type { Chapter } from '../../types.ts';
import { relatifs } from './relatifs.ts';
import { rationnels } from './rationnels.ts';
import { puissances } from './puissances.ts';
import { racines } from './racines.ts';
import { litteral } from './litteral.ts';
import { transformations } from './transformations.ts';
import { espace } from './espace.ts';
import { triangles } from './triangles.ts';
import { parallelogrammes } from './parallelogrammes.ts';
import { statistiques } from './statistiques.ts';
import { probabilites } from './probabilites.ts';
import { proportionnalite } from './proportionnalite.ts';
import { fonctions } from './fonctions.ts';
import { algorithmique } from './algorithmique.ts';

/** Mathématiques de 4e (cycle 4, BO n°10 du 5/03/2026), dans l’ordre du programme. */
export const QUATRIEME: readonly Chapter[] = [
  relatifs,
  rationnels,
  puissances,
  racines,
  litteral,
  transformations,
  espace,
  triangles,
  parallelogrammes,
  statistiques,
  probabilites,
  proportionnalite,
  fonctions,
  algorithmique,
];
