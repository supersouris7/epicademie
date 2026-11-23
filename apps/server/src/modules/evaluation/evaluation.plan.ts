import {
  CE2_CHAPTERS,
  chapterOfAnySkill,
  generate,
  generateCe2,
  getCe2Chapter,
  getChapter,
  getReferential,
  type Competence,
  type Question,
  type ReferentialGrade,
} from '@questeo/content';
import type { Observation, PlanCompetence, PlanInput } from '@questeo/engine';
import type { CompetenceState, EvaluationKind, Grade, Level, StudiedStatus, SubjectId } from '@questeo/shared';

/**
 * Construction du plan d'une épreuve : périmètre noté S, programme concerné Π, prérequis et
 * avancées, d'après le référentiel (docs/ARENE-EVALUATION.md §2, §6). Aucune base de données ici.
 */

const ORDER: readonly ReferentialGrade[] = ['ce2', 'cm1', 'cm2', '6e', '5e', '4e', '3e'];

/** Classe évaluée : les profils Adulte sont évalués au niveau 3e (décision du client). */
export const effectiveGrade = (grade: Grade | null): ReferentialGrade | null =>
  grade === null ? null : grade === 'adulte' ? '3e' : grade;

export const previousGrade = (g: ReferentialGrade): ReferentialGrade | null => ORDER[ORDER.indexOf(g) - 1] ?? null;
export const nextGrade = (g: ReferentialGrade): ReferentialGrade | null => ORDER[ORDER.indexOf(g) + 1] ?? null;

/** Classe du référentiel évalué : N−1 pour Origines, N sinon. */
export const referentialGradeOf = (kind: EvaluationKind, n: ReferentialGrade): ReferentialGrade | null =>
  kind === 'origines' ? previousGrade(n) : n;

/** Année scolaire (année de rentrée) d'un jour AAAA-MM-JJ : de septembre à août. */
export const schoolYearOf = (day: string): number => {
  const year = Number(day.slice(0, 4));
  return Number(day.slice(5, 7)) >= 9 ? year : year - 1;
};

export interface ChapterLite {
  readonly id: string;
  readonly title: string;
  readonly domain: string;
  readonly skills: readonly string[];
}

export function chapterLite(id: string): ChapterLite | undefined {
  const chapter = getChapter(id) ?? getCe2Chapter(id);
  return chapter && { id, title: chapter.title, domain: chapter.domain, skills: chapter.skills.map((s) => s.id) };
}

const ce2Chapter = new Map(CE2_CHAPTERS.flatMap((c) => c.skills.map((s) => [s.id, c.id] as const)));
/** Compétence (chapitre) d'une notion d'entraînement, de boss ou de fondamentaux CE2. */
export const chapterIdOfSkill = (skillId: string): string | undefined =>
  chapterOfAnySkill(skillId)?.id ?? ce2Chapter.get(skillId);

/** Question de n'importe quelle notion (programme ou fondamentaux CE2). */
export const generateAny = (skillId: string, level: Level, seed: number): Question =>
  ce2Chapter.has(skillId) ? generateCe2(skillId, level, seed) : generate(skillId, level, seed);

/** Compétence retrouvée dans tout le référentiel (prérequis de classes antérieures). */
export function findCompetence(
  subject: SubjectId,
  id: string,
): { competence: Competence; grade: ReferentialGrade } | null {
  const grades = getReferential(subject)?.grades ?? {};
  for (const grade of ORDER) {
    const competence = grades[grade]?.find((c) => c.id === id);
    if (competence) return { competence, grade };
  }
  return null;
}

/** Compétences d'une classe du référentiel (vide si la matière, la classe ou la clé est absente). */
export const gradeCompetences = (
  subject: SubjectId,
  grade: ReferentialGrade | null | undefined,
): readonly Competence[] => (grade ? (getReferential(subject)?.grades[grade] ?? []) : []);

export interface PlanContext {
  readonly kind: EvaluationKind;
  readonly subject: SubjectId;
  /** Classe N de l'élève (Adulte : 3e). */
  readonly grade: ReferentialGrade;
  readonly today: string;
  readonly nowMs: number;
  readonly observations: ReadonlyMap<string, readonly Observation[]>;
  readonly declared: ReadonlyMap<string, StudiedStatus>;
  readonly disabled: ReadonlySet<string>;
  /** État de chaque compétence dans le dernier bilan comparable. */
  readonly priorStates: ReadonlyMap<string, CompetenceState>;
}

/** Entraînement : au moins 4 observations sur le chapitre = pré-coché « vu ». */
const TRAINED_MIN = 4;

/** Déclaration effective d'un chapitre : celle de l'élève, sinon pré-cochage ou « je ne sais pas ». */
export function studiedStatus(
  declared: ReadonlyMap<string, StudiedStatus>,
  observations: ReadonlyMap<string, readonly Observation[]>,
  chapterId: string,
): { status: StudiedStatus; suggested: boolean } {
  const own = declared.get(chapterId);
  if (own) return { status: own, suggested: false };
  const trained = (observations.get(chapterId) ?? []).filter((o) => o.source !== 'evaluation').length;
  return trained >= TRAINED_MIN ? { status: 'vu', suggested: true } : { status: 'ne-sait-pas', suggested: false };
}

function describe(c: Competence, ctx: PlanContext, scored: boolean, studied?: StudiedStatus): PlanCompetence | null {
  const chapter = chapterLite(c.id);
  if (!chapter) return null;
  return {
    id: c.id,
    domain: chapter.domain,
    essential: c.essential,
    skills: chapter.skills.filter((id) => !ctx.disabled.has(id)),
    scored,
    ...(studied && { studied }),
    priorState: ctx.priorStates.get(c.id) ?? null,
    primaryPrerequisite: c.prerequisites[0] ?? null,
    observations: ctx.observations.get(c.id) ?? [],
  };
}

const compact = <T>(list: readonly (T | null)[]): T[] => list.filter((x): x is T => x !== null);

export interface BuiltPlan {
  readonly input: PlanInput;
  readonly referentialGrade: ReferentialGrade;
  readonly referentialVersion: number;
}

/** Plan d'une épreuve, ou le motif pour lequel elle n'est pas possible. */
export function buildPlan(ctx: PlanContext): BuiltPlan | { readonly error: string } {
  const ref = getReferential(ctx.subject);
  const refGrade = referentialGradeOf(ctx.kind, ctx.grade);
  const comps = gradeCompetences(ctx.subject, refGrade);
  if (!ref || !refGrade || comps.length === 0)
    return { error: 'Cette épreuve n’est pas encore disponible pour cette classe' };

  const statusOf = (c: Competence) => studiedStatus(ctx.declared, ctx.observations, c.id).status;
  const program =
    ctx.kind === 'origines'
      ? compact(comps.filter((c) => c.essential).map((c) => describe(c, ctx, true)))
      : compact(
          comps.map((c) => {
            const status = statusOf(c);
            return describe(c, ctx, ctx.kind === 'progression' ? status === 'vu' : status !== 'pas-vu', status);
          }),
        );
  if (!program.some((c) => c.scored && c.skills.length > 0)) {
    return { error: 'Déclare d’abord les chapitres que tu as déjà vus en classe' };
  }

  const inProgram = new Set(program.map((c) => c.id));
  const prerequisitePool = compact(
    program
      .filter((c) => c.scored && c.essential && c.primaryPrerequisite && !inProgram.has(c.primaryPrerequisite))
      .map((c) => {
        const found = c.primaryPrerequisite ? findCompetence(ctx.subject, c.primaryPrerequisite) : null;
        return found ? describe(found.competence, ctx, false) : null;
      }),
  ).filter((c, i, all) => all.findIndex((x) => x.id === c.id) === i);

  const next = nextGrade(ctx.grade);
  const advancedSources: readonly Competence[] =
    ctx.kind === 'origines'
      ? comps.length > 0
        ? (ref.grades[ctx.grade] ?? []).filter((c) => c.essential)
        : []
      : ctx.kind === 'progression'
        ? comps.filter((c) => statusOf(c) !== 'vu')
        : next
          ? (ref.grades[next] ?? []).filter((c) => c.essential)
          : [];
  const advancedPool = compact(advancedSources.map((c) => describe(c, ctx, false)));
  return {
    input: { kind: ctx.kind, today: ctx.today, nowMs: ctx.nowMs, program, prerequisitePool, advancedPool },
    referentialGrade: refGrade,
    referentialVersion: ref.version,
  };
}
