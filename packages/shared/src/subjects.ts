import { z } from 'zod';
import type { Grade } from './grades.ts';

export const SUBJECT_IDS = ['maths', 'francais', 'sciences', 'anglais', 'espagnol', 'histoire', 'geographie'] as const;

export type SubjectId = (typeof SUBJECT_IDS)[number];

/**
 * Matière reçue en entrée : l'ancien identifiant « physique » (anciens clients installés) est
 * normalisé en « sciences ». Jamais réexposé en sortie.
 */
export const SubjectInputSchema = z.union([
  z.enum(SUBJECT_IDS),
  z.literal('physique').transform((): SubjectId => 'sciences'),
]);

export interface SubjectInfo {
  readonly id: SubjectId;
  readonly name: string;
  /** Nom de la couleur de thème (voir tokens CSS `--subject-<id>`). */
  readonly color: SubjectId;
  /** Matière jouable ; sinon tuile grisée « À venir ». */
  readonly available: boolean;
}

export const SUBJECTS: readonly SubjectInfo[] = [
  { id: 'maths', name: 'Maths', color: 'maths', available: true },
  { id: 'francais', name: 'Français', color: 'francais', available: false },
  { id: 'sciences', name: 'Sciences', color: 'sciences', available: true },
  { id: 'anglais', name: 'Anglais', color: 'anglais', available: true },
  { id: 'espagnol', name: 'Espagnol', color: 'espagnol', available: true },
  { id: 'histoire', name: 'Histoire', color: 'histoire', available: true },
  { id: 'geographie', name: 'Géographie', color: 'geographie', available: true },
];

/** Classes où la matière s'appelle « Sciences et technologie » (programme de cycle 3, CM1 à 6e). */
const SCIENCES_ET_TECHNOLOGIE: readonly Grade[] = ['cm1', 'cm2', '6e'];

/**
 * Libellé d'une matière selon la classe : « Sciences et technologie » de CM1 à 6e, « Sciences » au
 * collège (5e à 3e) et sans classe précisée. Même matière (`sciences`), seul le nom change.
 */
export const subjectLabel = (id: SubjectId, grade?: Grade | null): string => {
  const name = SUBJECTS.find((s) => s.id === id)?.name ?? id;
  return id === 'sciences' && grade && SCIENCES_ET_TECHNOLOGIE.includes(grade) ? 'Sciences et technologie' : name;
};
