import type { Grade, SubjectId } from '@epicademie/shared';

/** Classe d'un référentiel : les classes jouables, plus le CE2 (évaluation seulement, ADR 0030). */
export type ReferentialGrade = 'ce2' | Grade;

/** Compétence d'évaluation = un chapitre du contenu ; titre, domaine et notions se lisent dans le chapitre. */
export interface Competence {
  /** Identifiant du chapitre (stable : il sert aussi aux chapitres « déjà vus en classe »). */
  readonly id: string;
  /** Vérifiée par les épreuves Origines et Maîtres. */
  readonly essential: boolean;
  /** Compétences de la même classe ou d'une classe antérieure ; la première est le prérequis principal. */
  readonly prerequisites: readonly string[];
}

export interface Referential {
  readonly subject: SubjectId;
  /** +1 à tout découpage, ajout ou retrait de compétence (les bilans ne se comparent qu'à version égale). */
  readonly version: number;
  readonly grades: Partial<Record<ReferentialGrade, readonly Competence[]>>;
}
