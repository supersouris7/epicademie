import type { Chapter } from '../types.ts';
import { litteral, puissances } from './algebre.ts';
import { calcul } from './calcul.ts';
import { CM1, CM2 } from './cours-moyen.ts';
import { BOSS_CONTENT } from './boss.ts';
import { BOSS_5E_EXTRA } from './boss-cinquieme.ts';
import { algorithmique, fonctions, probabilites, proportionnalite, statistiques } from './donnees.ts';
import { fractions } from './fractions.ts';
import { angles, espace, parallelogrammes, reperage, symetries, triangles } from './geometrie.ts';
import { operations } from './operations.ts';
import { relatifs } from './relatifs.ts';
import { QUATRIEME } from './quatrieme.ts';
import { SIXIEME } from './sixieme.ts';
import { TROISIEME } from './troisieme.ts';

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
  // Objectif officiel d'une notion du chapitre, cité par les questions de son boss.
  const src = (skillId: string) => {
    const skill = c.skills.find((s) => s.id === skillId);
    if (!skill) throw new Error(`Notion ${skillId} absente du chapitre ${c.id}`);
    return skill.lesson.source;
  };
  const boss = BOSS_CONTENT[c.id] ?? BOSS_5E_EXTRA[c.id]?.(src);
  return boss ? { ...c, boss } : c;
});

/** Chapitres de maths de toutes les classes, dans l'ordre de la scolarité. */
export const MATHS_CHAPTERS: readonly Chapter[] = [...CM1, ...CM2, ...SIXIEME, ...FIFTH, ...QUATRIEME, ...TROISIEME];
