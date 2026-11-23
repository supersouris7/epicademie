import { chaptersOf } from '@questeo/content';
import {
  playedGrade,
  SUBJECTS,
  subjectLabel,
  type Grade,
  type LearningReport,
  type SkillProgress,
} from '@questeo/shared';
import { chapterProgress } from '../../shared/lib/progress.ts';
import { relicProgressOf, type RelicProgress } from '../../shared/lib/relicProgress.ts';
import { skillTitle } from './summary.ts';

/**
 * Avancement d'un enfant par matière puis par chapitre, calculé comme dans les menus du jeu
 * (notions acquises = médaille d'or ; reliques = boss vaincus) pour que parent et enfant lisent les mêmes chiffres.
 */

export interface ChapterBar {
  readonly id: string;
  readonly title: string;
  readonly acquired: number;
  readonly total: number;
}

export interface SubjectBar {
  readonly id: (typeof SUBJECTS)[number]['id'];
  readonly name: string;
  readonly color: string;
  readonly acquired: number;
  readonly total: number;
  readonly relic: RelicProgress;
  readonly chapters: readonly ChapterBar[];
  /** Notions à retravailler (titres), les plus urgentes d'abord. */
  readonly toRework: readonly string[];
}

const rank = (report: LearningReport, id: string) => {
  const i = report.toRework.indexOf(id);
  return i < 0 ? report.toRework.length : i;
};

/** Matières ouvertes avec du contenu pour la classe jouée ; les matières à venir sont masquées. */
export function subjectBars(
  grade: Grade | null | undefined,
  skills: readonly SkillProgress[],
  bossRecords: readonly { readonly chapterId: string; readonly wins: number }[],
  report: LearningReport,
): SubjectBar[] {
  const played = playedGrade(grade);
  const states = new Map(skills.map((k) => [k.skillId, k]));
  return SUBJECTS.filter((s) => s.available).flatMap((s) => {
    const chapters = chaptersOf(s.id, played);
    if (chapters.length === 0) return [];
    const bars = chapters.map((c) => {
      const p = chapterProgress(
        c.skills.map((k) => k.id),
        states,
        report.day,
      );
      return { id: c.id, title: c.title, acquired: p.acquired, total: p.total };
    });
    const known = new Set(chapters.flatMap((c) => c.skills.map((k) => k.id)));
    const rework = report.skills
      .filter((k) => k.subject === s.id && known.has(k.skillId) && k.status === 'a-travailler')
      .sort((a, b) => rank(report, a.skillId) - rank(report, b.skillId))
      .map((k) => skillTitle(k.skillId));
    return [
      {
        id: s.id,
        name: subjectLabel(s.id, played),
        color: s.color,
        acquired: bars.reduce((n, c) => n + c.acquired, 0),
        total: bars.reduce((n, c) => n + c.total, 0),
        relic: relicProgressOf(s.id, played, bossRecords),
        chapters: bars,
        toRework: rework,
      },
    ];
  });
}

export const masteredPhrase = (acquired: number, total: number) =>
  `${acquired} notion${acquired > 1 ? 's' : ''} maîtrisée${acquired > 1 ? 's' : ''} sur ${total}`;
