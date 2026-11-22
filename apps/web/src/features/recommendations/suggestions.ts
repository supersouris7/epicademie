import { getAnySkill, isBossSkill, type Chapter } from '@questeo/content';
import type { LearningReport } from '@questeo/shared';

export const skillTitle = (id: string) => getAnySkill(id)?.title ?? id;

/**
 * Notions à suggérer en premier pour un parent, d'après l'historique de l'enfant : celles à retravailler
 * en priorité puis celles marquées « à travailler », dans la matière choisie (parmi les chapitres proposés).
 */
export function suggestedSkills(report: LearningReport, subject: string, chapters: readonly Chapter[]): string[] {
  const offered = new Set(chapters.flatMap((c) => c.skills.map((s) => s.id)));
  const weak = report.skills.filter((s) => s.subject === subject && s.status === 'a-travailler').map((s) => s.skillId);
  return [...new Set([...report.toRework, ...weak])].filter((id) => offered.has(id) && !isBossSkill(id));
}
