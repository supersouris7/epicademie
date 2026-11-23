import {
  coinsForXp,
  evaluationRewards,
  fillChest,
  inRewardPeriod,
  summarize,
  type EvaluationOutcome,
  type EvaluationState,
} from '@questeo/engine';
import type { Tx } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { notFound } from '../../core/errors.ts';
import type { EvaluationRow } from '../../db/schema.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { grantChest } from '../inventory/index.ts';
import { trainingRepo } from '../training/index.ts';
import { evaluationRepo, type CompetenceRowInput } from './evaluation.repo.ts';
import { DAY_MS, type EvaluationReads } from './evaluation.reads.ts';

/**
 * Clôture d'une épreuve terminée : bilan figé (une ligne par compétence), récompenses forfaitaires
 * (ADR 0030 §8) et crédit du profil, dans la transaction de l'appelant (ADR 0015).
 */

/** Une ligne par compétence : un chapitre listé au programme et en avancée n'en garde qu'une. */
function competenceRows(outcome: EvaluationOutcome): CompetenceRowInput[] {
  const byId = new Map<string, CompetenceRowInput>();
  for (const c of outcome.competences) {
    // Hors périmètre noté, un chapitre n'a rien d'évalué : ses anciennes observations ne font pas un bilan.
    const hidden = c.role === 'score' && !c.scored && c.state !== 'non-etudiee';
    const row: CompetenceRowInput = {
      competenceId: c.id,
      role: c.role,
      domain: c.domain,
      essential: c.essential,
      state: hidden ? 'non-evaluee' : c.state,
      rate: c.rate,
      weight: c.weight,
      arenaAnswers: c.arenaAnswers,
      weakestSkillId: c.weakestSkillId,
    };
    const known = byId.get(c.id);
    if (!known || (c.role !== 'score' && known.state === 'non-evaluee')) byId.set(c.id, row);
  }
  return [...byId.values()];
}

const round = (v: number | null) => (v === null ? null : Math.round(v));

export interface SettleInput {
  readonly tx: Tx;
  readonly row: EvaluationRow;
  readonly state: EvaluationState;
  readonly clock: Clock;
  readonly random: Random;
  readonly reads: EvaluationReads['helpers'];
}

export async function settle({ tx, row, state, clock, random, reads }: SettleInput) {
  const repo = evaluationRepo(tx);
  const outcome = summarize(state);
  const rows = competenceRows(outcome);
  const profiles = profilesRepo(tx);
  if (!(await profiles.findForUpdate(row.profileId))) throw notFound(PROFILE_NOT_FOUND);

  const { finished, earlier } = await reads.rewardHistory(tx, row.profileId, row.subject, row.schoolYear);
  const mastered = await repo.masteredThisYear(row.profileId, row.subject, row.schoolYear);
  const newly = rows.filter((r) => r.role === 'score' && r.state === 'maitrisee' && !mastered.has(r.competenceId));
  const last = finished[0];
  const now = clock.now();
  const reward = evaluationRewards({
    kind: row.kind,
    inPeriod: inRewardPeriod(row.kind, earlier),
    partial: outcome.partial,
    daysSinceLast: last ? Math.floor((now.getTime() - (last.finishedAt ?? last.startedAt).getTime()) / DAY_MS) : null,
    newlyMastered: newly.length,
  });
  const chest = reward.chest ? await grantChest(tx, row.profileId, fillChest(reward.chest, random.float)) : null;
  const coins = coinsForXp(reward.xp) + (chest?.coins ?? 0);
  await profiles.credit(row.profileId, { xp: reward.xp, coins, rubies: chest?.rubies ?? 0 });

  const attempts = await repo.attemptsOf(row.sessionId);
  await trainingRepo(tx).updateSession(row.sessionId, {
    finishedAt: now,
    answered: attempts.length,
    correct: attempts.filter((x) => x.correct).length,
    xp: reward.xp,
    coins,
    chest: chest?.rarity ?? null,
  });
  await repo.update(row.id, {
    status: 'terminee',
    state: null,
    partial: outcome.partial,
    mastery: round(outcome.scores.mastery),
    coverage: round(outcome.scores.coverage),
    studied: round(outcome.scores.studied),
    evaluatedCount: outcome.scores.counts.evaluated,
    masteredCount: outcome.scores.counts.mastered,
    xp: reward.xp,
    coins,
    chest: chest?.rarity ?? null,
    finishedAt: now,
  });
  await repo.insertCompetences(row.id, rows);
  const done = await repo.find(row.id);
  if (!done) throw new Error('épreuve introuvable après clôture');
  return { result: await reads.resultOf(tx, done, chest), rewards: { coins, rubies: chest?.rubies ?? 0 } };
}
