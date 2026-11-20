/** Classes proposées à la création du compte : du CM1 à la 3e (programmes complets) et Adulte (remise à niveau). */
export const GRADES = ['cm1', 'cm2', '6e', '5e', '4e', '3e', 'adulte'] as const;
export type Grade = (typeof GRADES)[number];

export interface GradeInfo {
  readonly id: Grade;
  readonly name: string;
  /** Contenu disponible ; sinon « À venir » (la classe est enregistrée quand même). */
  readonly available: boolean;
  /** Âge atteint dans l'année civile de la rentrée (CM1 : 9 ans… 3e : 14 ans). */
  readonly age?: number;
}

const FIFTH: GradeInfo = { id: '5e', name: '5e', available: true, age: 12 };
export const GRADE_INFO: readonly GradeInfo[] = [
  { id: 'cm1', name: 'CM1', available: true, age: 9 },
  { id: 'cm2', name: 'CM2', available: true, age: 10 },
  { id: '6e', name: '6e', available: true, age: 11 },
  FIFTH,
  { id: '4e', name: '4e', available: true, age: 13 },
  { id: '3e', name: '3e', available: true, age: 14 },
  { id: 'adulte', name: 'Adulte', available: true },
];

export const gradeInfo = (id: Grade): GradeInfo => GRADE_INFO.find((g) => g.id === id) ?? FIFTH;

/** Classe dont le contenu sert quand la sienne n'est pas prête (Adulte). */
export const FALLBACK_GRADE: Grade = '5e';

/** Classe dont on joue le contenu : la sienne si elle est prête, sinon la 5e. */
export const playedGrade = (grade: Grade | null | undefined): Grade =>
  grade && gradeInfo(grade).available ? grade : FALLBACK_GRADE;

/**
 * Classe déduite de la date de naissance (AAAA-MM-JJ) à une date donnée.
 * En France, la classe dépend de l'année de naissance : à la rentrée de septembre de l'année R,
 * un enfant né en R − 12 entre en 5e. Avant septembre, on est encore dans l'année scolaire R − 1.
 * Renvoie null quand aucune classe proposée ne correspond (moins de 9 ans ou lycée).
 */
export function gradeFromBirthDate(birthDate: string, today: string): Grade | null {
  const born = Number(birthDate.slice(0, 4));
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const schoolYear = month >= 9 ? year : year - 1;
  const age = schoolYear - born;
  if (age >= 18) return 'adulte';
  return GRADE_INFO.find((g) => g.age === age)?.id ?? null;
}
