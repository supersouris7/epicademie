import { gradeInfo, type Grade } from '@questeo/shared';

/** Message quand la classe n'a pas encore de contenu. */
export function comingSoon(grade: Grade): string {
  return grade === 'adulte'
    ? 'Le niveau Adulte arrive bientôt, avec des questions plus difficiles (et parfois drôlement difficiles !). En attendant, tu joues au programme de 5e.'
    : `Le programme de ${gradeInfo(grade).name} arrive bientôt. En attendant, tu t’entraînes sur celui de 5e.`;
}
