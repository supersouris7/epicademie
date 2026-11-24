import type { LearningReport, Profile } from '@epicademie/shared';
import { useBosses, useSkills } from '../../shared/api/queries.ts';
import { subjectBars, type SubjectBar } from './subjectProgress.ts';

/** Avancement par matière d'un enfant (relique, couleur, barre), calculé comme dans les menus du jeu. */
export function useSubjectBars(profile: Profile, report: LearningReport | undefined): SubjectBar[] | undefined {
  const { data: skills } = useSkills(profile.id);
  const { data: bosses } = useBosses(profile.id);
  if (!report || !skills || !bosses) return undefined;
  return subjectBars(profile.grade, skills, bosses.records, report);
}
