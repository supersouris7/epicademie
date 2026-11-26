import { gradeInfo, type Grade } from '@epicademie/shared';

/** Message quand la classe n'a pas encore de contenu. */
export function comingSoon(grade: Grade): string {
  return `Le programme de ${gradeInfo(grade).name} arrive bientôt. En attendant, tu t’entraînes sur celui de 5e.`;
}
