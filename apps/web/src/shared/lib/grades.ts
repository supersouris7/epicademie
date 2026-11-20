import { useSearchParams } from 'react-router';
import { gradesOf } from '@questeo/content';
import { FALLBACK_GRADE, gradeInfo, playedGrade, type Grade, type Profile } from '@questeo/shared';

/** Message quand la classe n'a pas encore de contenu. */
export function comingSoon(grade: Grade): string {
  return `Le programme de ${gradeInfo(grade).name} arrive bientôt. En attendant, tu t’entraînes sur celui de 5e.`;
}

/**
 * Classe affichée dans une liste de chapitres : `?classe=` dans l'adresse (pour que le retour garde le choix),
 * sinon la classe du joueur, sinon la première classe qui a du contenu.
 */
export function useGradeChoice(profile: Profile, subject: string) {
  const [params, setParams] = useSearchParams();
  const grades = gradesOf(subject);
  const asked = params.get('classe');
  const own = playedGrade(profile.grade);
  const grade: Grade = grades.find((g) => g === asked) ?? (grades.includes(own) ? own : (grades[0] ?? FALLBACK_GRADE));
  const setGrade = (g: Grade) => {
    setParams(g === own ? {} : { classe: g }, { replace: true });
  };
  return { grade, grades, own, setGrade };
}
