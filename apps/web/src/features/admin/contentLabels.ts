import { chapterOfAnySkill, getAnySkill, getChapter } from '@epicademie/content';
import { gradeInfo, type Report } from '@epicademie/shared';

/** Titres et classes tirés des contenus : à part, pour que la console s'ouvre sans les télécharger. */

export const skillTitle = (id: string) => getAnySkill(id)?.title ?? id;
export const chapterTitle = (id: string) => getChapter(id)?.title ?? id;
/** Classe d'une notion (« CM1 »), ou « — » si elle n'est plus au contenu. */
export const skillGrade = (id: string) => {
  const grade = chapterOfAnySkill(id)?.grade;
  return grade ? gradeInfo(grade).name : '—';
};
export const reportTitle = (r: Pick<Report, 'skillId' | 'screen'>) =>
  r.skillId ? skillTitle(r.skillId) : `Général${r.screen ? ` · ${r.screen}` : ''}`;
