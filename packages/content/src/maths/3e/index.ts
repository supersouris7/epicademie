import type { Chapter } from '../../types.ts';
import { arithmetique } from './arithmetique.ts';
import { puissances } from './puissances.ts';
import { racines } from './racines.ts';
import { litteral } from './litteral.ts';
import { thales } from './thales.ts';
import { trigonometrie } from './trigonometrie.ts';
import { espace } from './espace.ts';
import { vecteurs } from './vecteurs.ts';
import { statistiques } from './statistiques.ts';
import { probabilites } from './probabilites.ts';
import { fonctions } from './fonctions.ts';
import { proportionnalite } from './proportionnalite.ts';
import { algorithmique } from './algorithmique.ts';

/** Mathématiques de 3e (cycle 4, BO n°10 du 5/03/2026), dans l’ordre du programme. */
export const TROISIEME: readonly Chapter[] = [
  arithmetique,
  puissances,
  racines,
  litteral,
  thales,
  trigonometrie,
  espace,
  vecteurs,
  statistiques,
  probabilites,
  fonctions,
  proportionnalite,
  algorithmique,
];
