import { getReferential } from '@questeo/content';
import { inRewardPeriod, type EarlierEvaluation, type Observation } from '@questeo/engine';
import type {
  EvaluationHome,
  EvaluationKind,
  EvaluationListItem,
  EvaluationResult,
  EvaluationReview,
  EvaluationSummary,
  StudiedChapterView,
  StudiedChaptersUpdate,
  SubjectId,
} from '@questeo/shared';
import { EVALUATION_KINDS } from '@questeo/shared';
import type { Db, Tx } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { badRequest, conflict, notFound } from '../../core/errors.ts';
import type { EvaluationRow } from '../../db/schema.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { disabledSkills } from '../pedagogy/index.ts';
import { evaluationRepo } from './evaluation.repo.ts';
import {
  buildPlan,
  chapterIdOfSkill,
  chapterLite,
  gradeCompetences,
  effectiveGrade,
  referentialGradeOf,
  schoolYearOf,
  studiedStatus,
  type BuiltPlan,
} from './evaluation.plan.ts';
import { buildResult, type StoredCompetence } from './evaluation.result.ts';

/**
 * Arène d'évaluation (docs/adr/0030-arene-evaluation.md). Le serveur choisit chaque question
 * (le moteur pur de @questeo/engine) et n'accepte que la réponse à la question attendue ; il ne
 * montre jamais juste/faux pendant l'épreuve. Les réponses vont dans `attempts` (parties de mode
 * `evaluation`) sans toucher à `skill_states` ; le bilan est figé à la clôture, avec ses
 * récompenses, dans une seule transaction.
 */

export const EVALUATION_NOT_FOUND = 'Épreuve introuvable';
export const DAY_MS = 86_400_000;
const OBSERVATION_DAYS = 180;
const kindsList: readonly EvaluationKind[] = EVALUATION_KINDS;

/** Épreuve recommandée et sa raison (§6). */
function recommend(
  history: readonly EvaluationRow[],
  schoolYear: number,
  month: number,
  seenShare: number,
  available: (k: EvaluationKind) => boolean,
): { kind: EvaluationKind; reason: string } {
  const thisYear = history.filter((e) => e.schoolYear === schoolYear);
  if (available('origines') && !thisYear.some((e) => e.kind === 'origines')) {
    return { kind: 'origines', reason: 'Pour faire le point sur ce que tu sais de l’année passée' };
  }
  if (available('maitres') && ((month >= 5 && month <= 8) || seenShare >= 0.7)) {
    return { kind: 'maitres', reason: 'Tu as vu presque tout le programme : fais le bilan de l’année' };
  }
  return { kind: 'progression', reason: 'Pour mesurer ce que tu as appris depuis ton dernier bilan' };
}

export interface ReadDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly timeZone: string;
}

/** Lectures et calculs communs : accueil, bilans, déclarations, plan d'une épreuve. */
export function createEvaluationReads({ db, clock, timeZone }: ReadDeps) {
  /** Observations des 180 derniers jours, rangées par compétence (chapitre). */
  async function observationsByChapter(tx: Tx | Db, profileId: string): Promise<Map<string, Observation[]>> {
    const since = new Date(clock.now().getTime() - OBSERVATION_DAYS * DAY_MS);
    const out = new Map<string, Observation[]>();
    for (const { skillId, observation } of await evaluationRepo(tx).observations(profileId, since, timeZone)) {
      const chapter = chapterIdOfSkill(skillId);
      if (chapter) out.set(chapter, [...(out.get(chapter) ?? []), observation]);
    }
    return out;
  }

  /** État de chaque compétence dans le dernier bilan comparable (même classe et version de référentiel). */
  async function priorStates(tx: Tx | Db, profileId: string, subject: SubjectId, grade: string, version: number) {
    const repo = evaluationRepo(tx);
    const last = (await repo.finished(profileId, subject)).find(
      (e) => e.referentialGrade === grade && e.referentialVersion === version,
    );
    const rows = last ? await repo.competencesOf(last.id) : [];
    return new Map(rows.filter((r) => r.role === 'score').map((r) => [r.competenceId, r.state] as const));
  }

  /** Profil de l'élève, sa classe évaluée N, et l'année scolaire du jour. */
  async function learner(tx: Tx | Db, profileId: string, lock = false) {
    const profiles = profilesRepo(tx);
    const profile = lock ? await profiles.findForUpdate(profileId) : await profiles.find(profileId);
    if (!profile) throw notFound(PROFILE_NOT_FOUND);
    const grade = effectiveGrade(profile.grade);
    return { profile, grade, today: clock.today(), schoolYear: schoolYearOf(clock.today()) };
  }

  async function planFor(
    tx: Tx | Db,
    p: { profileId: string; subject: SubjectId; kind: EvaluationKind },
  ): Promise<{ plan: BuiltPlan; profileGrade: string; schoolYear: number }> {
    const { profile, grade, today, schoolYear } = await learner(tx, p.profileId);
    if (!grade || !profile.grade) throw badRequest('Indique ta classe dans ton profil');
    if (!getReferential(p.subject)) throw badRequest('Pas encore d’épreuve pour cette matière');
    const refGrade = referentialGradeOf(p.kind, grade);
    const [observations, declared, disabled] = await Promise.all([
      observationsByChapter(tx, p.profileId),
      evaluationRepo(tx).studied(p.profileId, schoolYear),
      disabledSkills(tx),
    ]);
    const version = getReferential(p.subject)?.version ?? 0;
    const prior = refGrade ? await priorStates(tx, p.profileId, p.subject, refGrade, version) : new Map();
    const built = buildPlan({
      kind: p.kind,
      subject: p.subject,
      grade,
      today,
      nowMs: clock.now().getTime(),
      observations,
      declared,
      disabled: new Set(disabled),
      priorStates: prior,
    });
    if ('error' in built) throw badRequest(built.error);
    return { plan: built, profileGrade: profile.grade, schoolYear };
  }

  const listItem = (e: EvaluationRow): EvaluationListItem => ({
    id: e.id,
    kind: e.kind,
    subject: e.subject,
    referentialGrade: e.referentialGrade,
    referentialVersion: e.referentialVersion,
    schoolYear: e.schoolYear,
    finishedAt: (e.finishedAt ?? e.startedAt).toISOString(),
    partial: e.partial,
    mastery: e.mastery,
    coverage: e.coverage,
    studied: e.studied,
    evaluatedCount: e.evaluatedCount,
    masteredCount: e.masteredCount,
  });

  async function resultOf(tx: Tx | Db, row: EvaluationRow, chestContent: EvaluationResult['rewards']['chestContent']) {
    const repo = evaluationRepo(tx);
    const toStored = (rows: Awaited<ReturnType<typeof repo.competencesOf>>): StoredCompetence[] => rows;
    const competences = toStored(await repo.competencesOf(row.id));
    const prev = await repo.previousComparable(row);
    const previous = prev ? { row: prev, competences: toStored(await repo.competencesOf(prev.id)) } : null;
    return buildResult({ row, competences, previous, chestContent });
  }

  async function ownedFinished(id: string): Promise<EvaluationRow> {
    const row = await evaluationRepo(db).find(id);
    if (!row) throw notFound(EVALUATION_NOT_FOUND);
    if (row.status !== 'terminee') throw conflict('Cette épreuve n’est pas terminée');
    return row;
  }

  async function rewardHistory(tx: Tx | Db, profileId: string, subject: SubjectId, schoolYear: number) {
    const finished = await evaluationRepo(tx).finished(profileId, subject);
    const now = clock.now().getTime();
    const earlier: EarlierEvaluation[] = finished.map((e) => ({
      kind: e.kind,
      daysAgo: Math.floor((now - (e.finishedAt ?? e.startedAt).getTime()) / DAY_MS),
      sameSchoolYear: e.schoolYear === schoolYear,
      rewarded: e.chest !== null,
    }));
    return { finished, earlier };
  }

  const api = {
    async home(profileId: string, subject: SubjectId): Promise<EvaluationHome> {
      const { profile, grade, today, schoolYear } = await learner(db, profileId);
      const repo = evaluationRepo(db);
      const ref = getReferential(subject);
      const { finished, earlier } = await rewardHistory(db, profileId, subject, schoolYear);
      const open = await repo.open(profileId, subject);
      const declared = await repo.studied(profileId, schoolYear);
      const observations = await observationsByChapter(db, profileId);
      const refOf = (k: EvaluationKind) => (grade ? referentialGradeOf(k, grade) : null);
      const available = (k: EvaluationKind) => {
        const g = refOf(k);
        return Boolean(ref && g && (ref.grades[g]?.length ?? 0) > 0);
      };
      const comps = gradeCompetences(subject, grade);
      const seen = comps.filter((c) => studiedStatus(declared, observations, c.id).status === 'vu').length;
      const rec = recommend(
        finished,
        schoolYear,
        Number(today.slice(5, 7)),
        comps.length ? seen / comps.length : 0,
        available,
      );
      const last = finished[0];
      return {
        subject,
        grade: profile.grade,
        available: Boolean(ref) && grade !== null,
        kinds: kindsList.map((kind) => ({
          kind,
          available: available(kind),
          referentialGrade: refOf(kind),
          rewardable: inRewardPeriod(kind, earlier),
          recommended: kind === rec.kind,
          reason: kind === rec.kind ? rec.reason : null,
        })),
        open: open ? { id: open.id, kind: open.kind, startedAt: open.startedAt.toISOString() } : null,
        history: finished.slice(0, 5).map(listItem),
        trainings: last ? (await resultOf(db, last, null)).trainings : [],
      };
    },

    async history(profileId: string, subject: SubjectId): Promise<EvaluationListItem[]> {
      return (await evaluationRepo(db).finished(profileId, subject)).map(listItem);
    },

    async studied(profileId: string, subject: SubjectId): Promise<StudiedChapterView[]> {
      const { grade, schoolYear } = await learner(db, profileId);
      const comps = gradeCompetences(subject, grade);
      const declared = await evaluationRepo(db).studied(profileId, schoolYear);
      const observations = await observationsByChapter(db, profileId);
      return comps.flatMap((c) => {
        const chapter = chapterLite(c.id);
        if (!chapter) return [];
        const { status, suggested } = studiedStatus(declared, observations, c.id);
        return [{ chapterId: c.id, title: chapter.title, domain: chapter.domain, status, suggested }];
      });
    },

    async saveStudied(profileId: string, subject: SubjectId, input: StudiedChaptersUpdate): Promise<void> {
      const { grade, schoolYear } = await learner(db, profileId);
      const allowed = new Set(gradeCompetences(subject, grade).map((c) => c.id));
      if (input.chapters.some((c) => !allowed.has(c.chapterId))) {
        throw badRequest('Chapitre inconnu pour ta classe');
      }
      await evaluationRepo(db).saveStudied(profileId, schoolYear, input.chapters);
    },

    async summary(profileId: string): Promise<EvaluationSummary> {
      const finished = await evaluationRepo(db).finished(profileId);
      const subjects = [...new Set(finished.map((e) => e.subject))];
      return {
        today: clock.today(),
        subjects: await Promise.all(
          subjects.map(async (subject) => {
            const rows = finished.filter((e) => e.subject === subject);
            const latest = rows[0];
            return {
              subject,
              history: rows.map(listItem),
              latest: latest ? await resultOf(db, latest, null) : null,
            };
          }),
        ),
      };
    },

    async result(id: string): Promise<EvaluationResult> {
      return resultOf(db, await ownedFinished(id), null);
    },

    /** « Revoir mes réponses » : les questions posées, avec leur résultat (épreuve terminée). */
    async review(id: string): Promise<EvaluationReview> {
      const row = await ownedFinished(id);
      const rows = await evaluationRepo(db).competencesOf(id);
      const roleOf = (skillId: string) => {
        const chapter = chapterIdOfSkill(skillId);
        return rows.find((r) => r.competenceId === chapter)?.role ?? 'score';
      };
      return {
        questions: (await evaluationRepo(db).attemptsOf(row.sessionId)).map((a) => ({
          skillId: a.skillId,
          level: a.level === 3 ? 3 : a.level === 2 ? 2 : 1,
          seed: a.seed,
          response: a.response,
          correct: a.correct,
          role: roleOf(a.skillId),
        })),
      };
    },
  };

  return { api, helpers: { learner, planFor, resultOf, rewardHistory, observationsByChapter } };
}

export type EvaluationReads = ReturnType<typeof createEvaluationReads>;
