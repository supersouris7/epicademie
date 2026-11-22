import type { SubjectId } from '@questeo/shared';
import { MATHS_REFERENTIAL } from './maths.ts';
import type { Competence, Referential, ReferentialGrade } from './types.ts';

export type { Competence, Referential, ReferentialGrade } from './types.ts';
export { MATHS_REFERENTIAL } from './maths.ts';

/** Référentiels d'évaluation disponibles, par matière (l'anglais viendra ensuite). */
export const REFERENTIALS: readonly Referential[] = [MATHS_REFERENTIAL];

export const getReferential = (subject: SubjectId): Referential | undefined =>
  REFERENTIALS.find((r) => r.subject === subject);

export const competencesOf = (subject: SubjectId, grade: ReferentialGrade): readonly Competence[] =>
  getReferential(subject)?.grades[grade] ?? [];
