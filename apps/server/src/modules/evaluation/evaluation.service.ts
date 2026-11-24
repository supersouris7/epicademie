import { check, getAnySkill, getCe2Skill, skillVersion } from '@epicademie/content';
import {
  EVALUATION_STATE_VERSION,
  assignSeed,
  canOfferAdvanced,
  chooseAdvanced,
  createEvaluation,
  isExpired,
  nextEvaluationQuestion,
  pickSeed,
  recordEvaluationAnswer,
  type EvaluationState,
} from '@epicademie/engine';
import type {
  EvaluationAnswer,
  EvaluationAnswerResult,
  EvaluationCreate,
  EvaluationNext,
  EvaluationResult,
  EvaluationStarted,
} from '@epicademie/shared';
import type { Db, Tx } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { badRequest, conflict, gone, notFound } from '../../core/errors.ts';
import type { EvaluationRow } from '../../db/schema.ts';
import { trainingRepo } from '../training/index.ts';
import { evaluationRepo } from './evaluation.repo.ts';
import { settle } from './evaluation.close.ts';
import { generateAny } from './evaluation.plan.ts';
import { DAY_MS, EVALUATION_NOT_FOUND, createEvaluationReads } from './evaluation.reads.ts';

/**
 * Arène d'évaluation (docs/adr/0030-arene-evaluation.md). Le serveur choisit chaque question
 * (le moteur pur de @epicademie/engine) et n'accepte que la réponse à la question attendue ; il ne
 * montre jamais juste/faux pendant l'épreuve. Les réponses vont dans `attempts` (parties de mode
 * `evaluation`) sans toucher à `skill_states` ; le bilan est figé à la clôture, avec ses
 * récompenses, dans une seule transaction.
 */

type Stored = { readonly v: number; readonly state: EvaluationState };

export interface EvaluationDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly random: Random;
  readonly timeZone: string;
  readonly onFinished?: (rewards: { readonly coins: number; readonly rubies: number }) => void;
}

export function createEvaluationService({ db, clock, random, timeZone, onFinished }: EvaluationDeps) {
  const { api, helpers } = createEvaluationReads({ db, clock, timeZone });
  const { learner, planFor, resultOf } = helpers;

  const stored = (row: EvaluationRow): Stored | null => (row.state ? (row.state as Stored) : null);

  const planSummary = (state: EvaluationState) => ({
    questions: state.planned,
    domains: [...new Set(state.competences.filter((c) => c.role === 'score' && c.need > 0).map((c) => c.domain))],
  });

  const progressOf = (state: EvaluationState) => {
    const byDomain: Record<string, number> = {};
    for (const c of state.competences) {
      if (c.role === 'score' && c.answers.length > 0) byDomain[c.domain] = (byDomain[c.domain] ?? 0) + c.answers.length;
    }
    return { index: state.asked, planned: Math.max(state.planned, state.asked), byDomain };
  };

  /**
   * Exécute `fn` sur l'épreuve ouverte, verrouillée (réponses simultanées ou rejouées l'une après
   * l'autre). Une épreuve trop ancienne ou d'un autre format expire : 410, réponses conservées.
   */
  async function mutate<T>(
    id: string,
    fn: (tx: Tx, row: EvaluationRow, state: EvaluationState) => Promise<{ state?: EvaluationState; value: T }>,
  ): Promise<T> {
    const out = await db.transaction(async (tx) => {
      const repo = evaluationRepo(tx);
      const row = await repo.findForUpdate(id);
      if (!row) throw notFound(EVALUATION_NOT_FOUND);
      if (row.status === 'expiree') return { expired: true as const };
      const s = stored(row);
      if (row.status !== 'en-cours' || !s) throw conflict('Cette épreuve est terminée');
      if (isExpired({ v: s.v, startedAt: s.state.startedAt }, clock.now().getTime())) {
        await repo.update(id, { status: 'expiree', state: null });
        return { expired: true as const };
      }
      const r = await fn(tx, row, s.state);
      if (r.state) await repo.update(id, { state: { v: EVALUATION_STATE_VERSION, state: r.state } });
      return { value: r.value };
    });
    if ('expired' in out) throw gone('Cette épreuve a expiré : relance-la.');
    return out.value;
  }

  return {
    ...api,

    /** Lance une épreuve, ou reprend l'épreuve ouverte du même type. */
    async start(input: EvaluationCreate): Promise<EvaluationStarted> {
      return db.transaction(async (tx) => {
        // Le verrou du profil sérialise deux lancements simultanés.
        const { grade } = await learner(tx, input.profileId, true);
        if (!grade) throw badRequest('Indique ta classe dans ton profil');
        const repo = evaluationRepo(tx);
        const open = await repo.open(input.profileId, input.subject);
        if (open) {
          const s = stored(open);
          const expired = !s || isExpired({ v: s.v, startedAt: s.state.startedAt }, clock.now().getTime());
          if (expired) await repo.update(open.id, { status: 'expiree', state: null });
          else if (open.kind === input.kind) return { id: open.id, resumed: true, plan: planSummary(s.state) };
          else throw conflict(`Une épreuve est déjà ouverte : ${open.id}`);
        }
        const { plan, profileGrade, schoolYear } = await planFor(tx, input);
        const state = createEvaluation(plan.input);
        if (state.planned === 0) throw badRequest('Aucune question possible pour cette épreuve');
        const sessionId = await trainingRepo(tx).insertSession({
          profileId: input.profileId,
          mode: 'evaluation',
          subject: input.subject,
          chapterId: `ref-${input.subject}-${plan.referentialGrade}`,
          skillId: null,
        });
        const id = await repo.insert({
          profileId: input.profileId,
          sessionId,
          subject: input.subject,
          kind: input.kind,
          profileGrade,
          referentialGrade: plan.referentialGrade,
          referentialVersion: plan.referentialVersion,
          schoolYear,
          state: { v: EVALUATION_STATE_VERSION, state },
        });
        return { id, resumed: false, plan: planSummary(state) };
      });
    },

    /** Question en attente (idempotent) ou fin. */
    next(id: string): Promise<EvaluationNext> {
      return mutate<EvaluationNext>(id, async (tx, row, state) => {
        const nowMs = clock.now().getTime();
        const n = nextEvaluationQuestion(state, nowMs);
        if (n.done) return { state: n.state, value: { done: true, canExploreAdvanced: n.canExploreAdvanced } };
        let next = n.state;
        if (n.question.seed === null) {
          const since = new Date(nowMs - 60 * DAY_MS);
          const seen = await evaluationRepo(tx).seeds(row.profileId, n.question.skillId, since);
          next = assignSeed(
            next,
            pickSeed(random.seed, (seed) => seen.has(seed)),
          );
        }
        const q = next.pending;
        if (q?.seed == null) throw new Error('question sans graine');
        return {
          state: next,
          value: {
            done: false,
            question: {
              skillId: q.skillId,
              level: q.level,
              seed: q.seed,
              index: q.index,
              planned: q.planned,
              domain: q.domain,
              role: q.role,
            },
          },
        };
      });
    },

    /** Enregistre la réponse à la question attendue ; jamais de juste/faux dans la réponse. */
    answer(id: string, a: EvaluationAnswer): Promise<EvaluationAnswerResult> {
      return mutate<EvaluationAnswerResult>(id, async (tx, row, state) => {
        const repo = evaluationRepo(tx);
        const q = state.pending;
        const matches = q?.skillId === a.skillId && q.level === a.level && q.seed === a.seed;
        if (!matches) {
          // Réponse rejouée (double appui) : même résultat, rien de compté deux fois.
          const done = (await repo.attemptsOf(row.sessionId)).some(
            (x) => x.skillId === a.skillId && x.level === a.level && x.seed === a.seed,
          );
          if (done) return { value: { recorded: true, progress: progressOf(state) } };
          throw conflict('Ce n’est pas la question attendue');
        }
        const skill = getAnySkill(a.skillId) ?? getCe2Skill(a.skillId);
        if (!skill) throw badRequest('Notion inconnue');
        const result = check(generateAny(a.skillId, a.level, a.seed), a.response);
        if (result.invalid) return { value: { recorded: false, invalid: true, progress: progressOf(state) } };
        const recorded = recordEvaluationAnswer(state, {
          skillId: a.skillId,
          level: a.level,
          seed: a.seed,
          correct: result.correct,
          dontKnow: a.response.kind === 'unknown',
        });
        if (!recorded.ok) throw conflict('Ce n’est pas la question attendue');
        await trainingRepo(tx).insertAttempt({
          sessionId: row.sessionId,
          profileId: row.profileId,
          skillId: a.skillId,
          level: a.level,
          seed: a.seed,
          variant: false,
          response: a.response,
          durationMs: a.durationMs,
          correct: result.correct,
          xp: 0,
          attempt: 1,
          hinted: false,
          collective: false,
          skillVersion: skillVersion(skill),
          diagnosis: null,
        });
        return { state: recorded.state, value: { recorded: true, progress: progressOf(recorded.state) } };
      });
    },

    /** « Défi bonus » après une épreuve réussie à plus de 80 %. */
    async chooseAdvanced(id: string, accept: boolean): Promise<void> {
      await mutate(id, async (_tx, _row, state) => {
        if (!canOfferAdvanced(state)) throw conflict('Pas de défi bonus pour cette épreuve');
        return { state: chooseAdvanced(state, accept), value: undefined };
      });
    },

    /** Clôture : bilan figé et récompenses, dans une seule transaction ; rejouée, renvoie le même bilan. */
    async finish(id: string): Promise<EvaluationResult> {
      const out = await db.transaction(async (tx) => {
        const repo = evaluationRepo(tx);
        const row = await repo.findForUpdate(id);
        if (!row) throw notFound(EVALUATION_NOT_FOUND);
        if (row.status === 'expiree') return { expired: true as const };
        if (row.status === 'terminee') return { result: await resultOf(tx, row, null), rewards: null };
        const s = stored(row);
        if (!s) throw conflict('Cette épreuve est terminée');
        const nowMs = clock.now().getTime();
        if (isExpired({ v: s.v, startedAt: s.state.startedAt }, nowMs)) {
          await repo.update(id, { status: 'expiree', state: null });
          return { expired: true as const };
        }
        const n = nextEvaluationQuestion(s.state, nowMs);
        if (!n.done) throw conflict('Il reste des questions dans cette épreuve');
        return settle({ tx, row, state: n.state, clock, random, reads: helpers });
      });
      if ('expired' in out) throw gone('Cette épreuve a expiré : relance-la.');
      if (out.rewards) onFinished?.(out.rewards);
      return out.result;
    },
  };
}

export type EvaluationService = ReturnType<typeof createEvaluationService>;
