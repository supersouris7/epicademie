import { chapterOfAnySkill, getAnySkill } from '@questeo/content';
import { SKILL_STATUS_LABELS, SUBJECTS, type LearningReport, type SkillStatus, type Tally } from '@questeo/shared';

/**
 * Lecture du suivi pour un parent : phrases simples et chiffres utiles seulement (pas de
 * pourcentage de maîtrise). Fonctions pures, testées.
 */

export const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;
export const skillTitle = (id: string) => getAnySkill(id)?.title ?? id;
export const chapterTitle = (skillId: string) => chapterOfAnySkill(skillId)?.title ?? '';

/** « 7 réussites sans aide sur 10 » ; null sans réponse. */
export function successPhrase(t: Tally): string | null {
  if (t.answered === 0) return null;
  return `${t.autonomous} réussite${t.autonomous > 1 ? 's' : ''} sans aide sur ${t.answered}`;
}

/** Notions par état, dans l'ordre de lecture d'un parent (ce qui demande de l'attention d'abord). */
export const STATUS_ORDER: readonly SkillStatus[] = ['a-travailler', 'en-progression', 'a-consolider', 'acquise'];
export const statusLabel = (s: SkillStatus) => SKILL_STATUS_LABELS[s];

/** Bilan de la semaine en cours comparée à la précédente (texte prêt à afficher). */
export function weeklySummary(report: LearningReport): {
  readonly answered: number;
  readonly lines: readonly string[];
} {
  const [previous, current] = report.weeks.slice(-2);
  if (!current || current.tally.answered === 0) {
    return { answered: 0, lines: ['Pas encore de séance cette semaine.'] };
  }
  const lines: string[] = [];
  const t = current.tally;
  lines.push(
    `${t.answered} question${t.answered > 1 ? 's' : ''} cette semaine, dont ${t.autonomous} réussie${t.autonomous > 1 ? 's' : ''} sans aide.`,
  );
  if (t.helped > 0) lines.push(`${t.helped} réussite${t.helped > 1 ? 's' : ''} avec un indice ou au second essai.`);
  if (previous && previous.tally.answered > 0) {
    const before = previous.tally.autonomous / previous.tally.answered;
    const now = t.autonomous / t.answered;
    if (now - before > 0.15) lines.push('Plus de réussites sans aide que la semaine dernière : bravo !');
    else if (before - now > 0.15)
      lines.push('Un peu moins de réussites sans aide que la semaine dernière : une révision peut aider.');
  }
  if (t.collective > 0)
    lines.push(
      `${t.collective} réponse${t.collective > 1 ? 's' : ''} données en équipe (non comptées dans sa progression).`,
    );
  return { answered: t.answered, lines };
}

/** Matières travaillées, de la plus pratiquée à la moins pratiquée. */
export const subjectsWorked = (report: LearningReport) =>
  [...report.subjects].sort((a, b) => b.tally.answered - a.tally.answered).map((s) => subjectName(s.subject));

/** Les 8 semaines, pour un petit histogramme accessible (valeur la plus haute = 100 %). */
export function weekBars(report: LearningReport) {
  const max = Math.max(1, ...report.weeks.map((w) => w.tally.answered));
  return report.weeks.map((w) => ({
    week: w.week,
    label: new Date(`${w.week}T00:00:00Z`).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }),
    answered: w.tally.answered,
    autonomous: w.tally.autonomous,
    height: w.tally.answered / max,
  }));
}
