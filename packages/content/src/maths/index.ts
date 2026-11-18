import type { Chapter } from '../types.ts';
import { litteral, puissances } from './algebre.ts';
import { calcul } from './calcul.ts';
import { BOSS_CONTENT } from './boss.ts';
import { algorithmique, fonctions, probabilites, proportionnalite, statistiques } from './donnees.ts';
import { fractions } from './fractions.ts';
import { angles, espace, parallelogrammes, reperage, symetries, triangles } from './geometrie.ts';
import { operations } from './operations.ts';
import { relatifs } from './relatifs.ts';
import { SIXIEME } from './sixieme.ts';

/** Programme de mathématiques de 5e (BO n°10 du 5 mars 2026), dans l'ordre du programme. */
const PROGRAM: readonly Chapter[] = [
  calcul,
  operations,
  relatifs,
  fractions,
  puissances,
  litteral,
  reperage,
  espace,
  symetries,
  angles,
  triangles,
  parallelogrammes,
  statistiques,
  probabilites,
  proportionnalite,
  fonctions,
  algorithmique,
];

/** Chapitres de 5e, avec leur combat de boss quand il est prêt. */
const FIFTH: readonly Chapter[] = PROGRAM.map((c) => {
  const boss = BOSS_CONTENT[c.id];
  return boss ? { ...c, boss } : c;
});

/** Chapitres de maths de toutes les classes, dans l'ordre de la scolarité. */
export const MATHS_CHAPTERS: readonly Chapter[] = [...SIXIEME, ...FIFTH];
