import { getReferential, type ReferentialGrade } from '@questeo/content';
import { compareBilans, computeScores, scoresByDomain, type ScoredCompetence } from '@questeo/engine';
import type { CompetenceState, EvaluationResult } from '@questeo/shared';
import type { EvaluationRow } from '../../db/schema.ts';
import { chapterLite, gradeCompetences, nextGrade } from './evaluation.plan.ts';

/** Bilan présenté à partir des lignes figées (jamais recalculé depuis les réponses, ADR 0030). */

export interface StoredCompetence {
  readonly competenceId: string;
  readonly role: 'score' | 'prerequis' | 'avance';
  readonly domain: string;
  readonly essential: boolean;
  readonly state: CompetenceState;
  readonly weakestSkillId: string | null;
  readonly arenaAnswers: number;
}

const WEAK: readonly CompetenceState[] = ['en-difficulte', 'a-consolider', 'evaluation-insuffisante'];
const SHOWN_AVANCE: readonly CompetenceState[] = ['maitrisee', 'en-cours'];

/** Programme concerné Π du bilan, d'après le référentiel de sa classe et de sa version. */
function programOf(row: EvaluationRow, stored: ReadonlyMap<string, StoredCompetence>): ScoredCompetence[] {
  const comps = getReferential(row.subject)?.grades[row.referentialGrade as ReferentialGrade] ?? [];
  const program = row.kind === 'origines' ? comps.filter((c) => c.essential) : comps;
  return program.map((c) => {
    const s = stored.get(c.id);
    const known = s?.role === 'score';
    return {
      id: c.id,
      domain: chapterLite(c.id)?.domain ?? s?.domain ?? '',
      essential: c.essential,
      scored: true,
      state: known ? s.state : 'non-evaluee',
    };
  });
}

/** Compétences de la classe suivante dont un prérequis est fragile (Origines : « à consolider pour réussir en N »). */
function toConsolidate(row: EvaluationRow, stored: ReadonlyMap<string, StoredCompetence>): string[] {
  const next = nextGrade(row.referentialGrade as ReferentialGrade);
  const comps = gradeCompetences(row.subject, next);
  return comps
    .filter((c) => c.prerequisites.some((p) => WEAK.includes(stored.get(p)?.state ?? 'maitrisee')))
    .map((c) => c.id);
}

/** Maîtres : essentielles non maîtrisées qui sont prérequis d'une essentielle de la classe suivante. */
function toPrepare(row: EvaluationRow, stored: ReadonlyMap<string, StoredCompetence>): string[] {
  const next = nextGrade(row.referentialGrade as ReferentialGrade);
  const upcoming = gradeCompetences(row.subject, next);
  const needed = new Set(upcoming.filter((c) => c.essential).flatMap((c) => c.prerequisites));
  return [...stored.values()]
    .filter((c) => c.role === 'score' && c.essential && needed.has(c.competenceId) && c.state !== 'maitrisee')
    .filter((c) => c.state !== 'non-etudiee' && c.state !== 'non-evaluee')
    .map((c) => c.competenceId);
}

export interface ResultInput {
  readonly row: EvaluationRow;
  readonly competences: readonly StoredCompetence[];
  readonly previous: { readonly row: EvaluationRow; readonly competences: readonly StoredCompetence[] } | null;
  readonly chestContent: EvaluationResult['rewards']['chestContent'];
}

export function buildResult({ row, competences, previous, chestContent }: ResultInput): EvaluationResult {
  const stored = new Map(competences.map((c) => [c.competenceId, c]));
  const program = programOf(row, stored);
  const scores = computeScores(program);
  const scoreRows = competences.filter((c) => c.role === 'score');
  const progress = previous
    ? compareBilans(
        previous.competences
          .filter((c) => c.role === 'score')
          .map((c) => ({ id: c.competenceId, essential: c.essential, state: c.state })),
        scoreRows.map((c) => ({ id: c.competenceId, essential: c.essential, state: c.state })),
      )
    : null;
  const shown = competences.filter((c) => c.role !== 'avance' || SHOWN_AVANCE.includes(c.state));
  const prerequisitesToRework = competences
    .filter((c) => c.role === 'prerequis' && c.state === 'en-difficulte')
    .map((c) => c.competenceId);
  // Priorités : essentielles en difficulté, puis régressions, puis prérequis à retravailler.
  const priorities = [
    ...scoreRows.filter((c) => c.essential && c.state === 'en-difficulte').map((c) => c.competenceId),
    ...(progress?.regressions ?? []),
    ...prerequisitesToRework,
  ]
    .filter((id, i, all) => all.indexOf(id) === i)
    .slice(0, 3);
  const trainings = priorities.flatMap((id) => {
    const chapter = chapterLite(id);
    const skillId = stored.get(id)?.weakestSkillId ?? chapter?.skills[0];
    return chapter && skillId ? [{ chapterId: id, skillId }] : [];
  });
  return {
    id: row.id,
    kind: row.kind,
    subject: row.subject,
    referentialGrade: row.referentialGrade,
    referentialVersion: row.referentialVersion,
    finishedAt: (row.finishedAt ?? row.startedAt).toISOString(),
    partial: row.partial,
    mastery: row.mastery,
    masteryDisplayable: scores.masteryDisplayable,
    coverage: row.coverage ?? scores.coverage,
    studied: row.studied,
    counts: scores.counts,
    questions: competences.reduce((n, c) => n + c.arenaAnswers, 0),
    domains: scoresByDomain(program),
    competences: shown.map((c) => ({
      id: c.competenceId,
      title: chapterLite(c.competenceId)?.title ?? c.competenceId,
      domain: c.domain,
      essential: c.essential,
      role: c.role,
      state: c.state,
      weakestSkillId: c.weakestSkillId,
    })),
    strengths: scoreRows.filter((c) => c.state === 'maitrisee').map((c) => c.competenceId),
    toWork: scoreRows.filter((c) => ['en-difficulte', 'a-consolider'].includes(c.state)).map((c) => c.competenceId),
    notEvaluated: program
      .filter((c) => c.state === 'non-evaluee' || c.state === 'evaluation-insuffisante')
      .map((c) => c.id),
    notStudied: scoreRows.filter((c) => c.state === 'non-etudiee').map((c) => c.competenceId),
    prerequisitesToRework,
    forNextYear:
      row.kind === 'origines' ? toConsolidate(row, stored) : row.kind === 'maitres' ? toPrepare(row, stored) : [],
    progress:
      progress && previous
        ? {
            ...progress,
            comparedWith: previous.row.id,
            newlyMastered: [...progress.newlyMastered],
            resolved: [...progress.resolved],
            persistent: [...progress.persistent],
            regressions: [...progress.regressions],
          }
        : null,
    priorities,
    trainings,
    rewards: {
      xp: row.xp,
      coins: row.coins,
      chest: row.chest,
      inPeriod: row.chest !== null,
      chestContent,
    },
  };
}
