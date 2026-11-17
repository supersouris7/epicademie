export const SUBJECT_IDS = ['maths', 'physique', 'anglais', 'espagnol', 'histoire', 'geographie'] as const;

export type SubjectId = (typeof SUBJECT_IDS)[number];

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
  { id: 'physique', name: 'Physique-Chimie', color: 'physique', available: false },
  { id: 'anglais', name: 'Anglais', color: 'anglais', available: false },
  { id: 'espagnol', name: 'Espagnol', color: 'espagnol', available: false },
  { id: 'histoire', name: 'Histoire', color: 'histoire', available: false },
  { id: 'geographie', name: 'Géographie', color: 'geographie', available: false },
];
