import type { Chapter } from '../../types.ts';
import { algorithmique } from './algorithmique.ts';
import { angles } from './angles.ts';
import { BOSS_CONTENT } from './boss.ts';
import { BOSS_5E_EXTRA } from './boss-extra.ts';
import { calcul } from './calcul.ts';
import { espace } from './espace.ts';
import { fonctions } from './fonctions.ts';
import { fractions } from './fractions.ts';
import { litteral } from './litteral.ts';
import { operations } from './operations.ts';
import { parallelogrammes } from './parallelogrammes.ts';
import { probabilites } from './probabilites.ts';
import { proportionnalite } from './proportionnalite.ts';
import { puissances } from './puissances.ts';
import { relatifs } from './relatifs.ts';
import { reperage } from './reperage.ts';
import { statistiques } from './statistiques.ts';
import { symetries } from './symetries.ts';
import { triangles } from './triangles.ts';

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

/** Chapitres de 5e, avec leur combat de boss (contenu dans boss.ts et boss-extra.ts). */
export const CINQUIEME: readonly Chapter[] = PROGRAM.map((c) => {
  // Objectif officiel d'une notion du chapitre, cité par les questions de son boss.
  const src = (skillId: string) => {
    const skill = c.skills.find((s) => s.id === skillId);
    if (!skill) throw new Error(`Notion ${skillId} absente du chapitre ${c.id}`);
    return skill.lesson.source;
  };
  const boss = BOSS_CONTENT[c.id] ?? BOSS_5E_EXTRA[c.id]?.(src);
  return boss ? { ...c, boss } : c;
});
