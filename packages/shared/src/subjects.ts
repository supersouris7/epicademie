export const SUBJECT_IDS = ['maths', 'physique', 'anglais', 'espagnol', 'histoire', 'geographie'] as const;

export type SubjectId = (typeof SUBJECT_IDS)[number];

export interface SubjectInfo {
  readonly id: SubjectId;
  readonly name: string;
  /** Nom de la couleur de thème (voir tokens CSS `--subject-<id>`). */
  readonly color: SubjectId;
}

export const SUBJECTS: readonly SubjectInfo[] = [
  { id: 'maths', name: 'Maths', color: 'maths' },
  { id: 'physique', name: 'Physique-Chimie', color: 'physique' },
  { id: 'anglais', name: 'Anglais', color: 'anglais' },
  { id: 'espagnol', name: 'Espagnol', color: 'espagnol' },
  { id: 'histoire', name: 'Histoire', color: 'histoire' },
  { id: 'geographie', name: 'Géographie', color: 'geographie' },
];
