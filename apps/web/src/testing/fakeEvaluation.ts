import type { EvaluationHome, EvaluationQuestion, EvaluationResult } from '@epicademie/shared';

/** Question de l'épreuve fictive : une notion de la classe, une du CE2 (prérequis). */
const SCRIPT: readonly Pick<EvaluationQuestion, 'skillId' | 'level' | 'seed' | 'domain' | 'role'>[] = [
  { skillId: 'm5-tables', level: 1, seed: 11, domain: 'nombres', role: 'score' },
  { skillId: 'm5-tables', level: 2, seed: 12, domain: 'nombres', role: 'score' },
  { skillId: 'm5-tables', level: 1, seed: 13, domain: 'nombres', role: 'prerequis' },
];

export const FAKE_EVALUATION_ID = '22222222-2222-4222-8222-222222222222';

const RESULT: EvaluationResult = {
  id: FAKE_EVALUATION_ID,
  kind: 'origines',
  subject: 'maths',
  referentialGrade: 'cm2',
  referentialVersion: 2,
  finishedAt: '2026-11-24T10:00:00.000Z',
  partial: false,
  mastery: 62,
  masteryDisplayable: true,
  coverage: 71,
  studied: null,
  counts: { evaluated: 5, mastered: 3, inProgress: 1, struggling: 1 },
  questions: 3,
  domains: [{ domain: 'nombres', mastery: 62, coverage: 71 }],
  competences: [],
  strengths: ['mcm2-nombres'],
  toWork: ['mcm2-fractions'],
  notEvaluated: ['mcm2-aires'],
  notStudied: [],
  prerequisitesToRework: [],
  forNextYear: ['mcm2-fractions'],
  progress: null,
  priorities: ['mcm2-fractions'],
  trainings: [{ chapterId: 'm5-calcul', skillId: 'm5-tables' }],
  rewards: { xp: 40, coins: 10, chest: 'commun', inPeriod: true, chestContent: null },
};

/**
 * Faux serveur de l'Arène : une épreuve de 3 questions, jamais de juste/faux pendant l'épreuve.
 * `calls` du faux serveur permet de vérifier les réponses envoyées.
 */
export function evaluationHandlers(options: { readonly available?: boolean; readonly bonus?: boolean } = {}) {
  let started = false;
  let index = 0;
  let advanced: boolean | null = null;
  let finished = false;
  const home = (): EvaluationHome => ({
    subject: 'maths',
    grade: '5e',
    available: options.available ?? true,
    kinds: (['origines', 'progression', 'maitres'] as const).map((kind) => ({
      kind,
      available: true,
      referentialGrade: kind === 'origines' ? 'cm2' : '5e',
      rewardable: true,
      recommended: kind === 'origines',
      reason: kind === 'origines' ? 'Pour faire le point sur ce que tu sais de l’année passée' : null,
    })),
    open:
      started && !finished ? { id: FAKE_EVALUATION_ID, kind: 'origines', startedAt: '2026-11-24T09:00:00.000Z' } : null,
    history: finished
      ? [
          {
            id: FAKE_EVALUATION_ID,
            kind: 'origines',
            subject: 'maths',
            referentialGrade: 'cm2',
            referentialVersion: 2,
            schoolYear: 2026,
            finishedAt: '2026-11-24T10:00:00.000Z',
            partial: false,
            mastery: 62,
            coverage: 71,
            studied: null,
            evaluatedCount: 5,
            masteredCount: 3,
          },
        ]
      : [],
    trainings: finished ? RESULT.trainings : [],
  });
  return {
    evaluationHome: home,
    startEvaluation: () => {
      const resumed = started;
      started = true;
      return { id: FAKE_EVALUATION_ID, resumed, plan: { questions: SCRIPT.length, domains: ['nombres'] } };
    },
    evaluationNext: () => {
      const q = SCRIPT[index];
      if (q) return { done: false, question: { ...q, index: index + 1, planned: SCRIPT.length } };
      return { done: true, canExploreAdvanced: Boolean(options.bonus) && advanced === null };
    },
    answerEvaluation: () => {
      index += 1;
      return { recorded: true, progress: { index, planned: SCRIPT.length, byDomain: { nombres: index } } };
    },
    chooseAdvanced: ({ body }: { body: unknown }) => {
      advanced = (body as { accept: boolean }).accept;
      return null;
    },
    finishEvaluation: () => {
      finished = true;
      return { ...RESULT, rewards: { ...RESULT.rewards, chestContent: null } };
    },
    evaluationResult: () => RESULT,
    evaluationReview: () => ({
      questions: SCRIPT.map((q) => ({ ...q, response: { kind: 'unknown' }, correct: false })),
    }),
  } as const;
}
