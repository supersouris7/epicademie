import { battlePools, check, generate, getChapter } from '@questeo/content';
import {
  answerBattle,
  applyItem,
  BATTLE_FIRST_WIN_COINS,
  battleXp,
  coinsForXp,
  createBattle,
  itemRefusal,
  levelFromXp,
  weakestSkill,
  type BattleDice,
  type BattleState,
} from '@questeo/engine';
import {
  bestMedal,
  bossMedal,
  type BattleAnswer,
  type BattleAnswerResult,
  type BattleSummary,
  type BattleView,
  type BossOverview,
  type Inventory,
  type ItemId,
  type Level,
} from '@questeo/shared';
import type { Db, Executor } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { badRequest, conflict, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { inventoryRepo } from '../inventory/index.ts';
import { trainingRepo } from '../training/index.ts';
import { battlesRepo } from './battles.repo.ts';

/**
 * Combats de boss. L'état complet du combat (questions tirées, cœurs, vies du boss, objets)
 * vit sur le serveur, dans la partie (`sessions.battle`) ; le client ne reçoit qu'une vue
 * (`BattleView`) et envoie ses réponses. Les règles du combat sont dans @questeo/engine
 * (fonctions pures) ; ce service les applique et persiste le résultat.
 */

export const BATTLE_NOT_FOUND = 'Combat introuvable';

/** Coffre de la 1re victoire contre un boss. */
export const FIRST_WIN_CHEST: Partial<Inventory> = { bouclier: 1, soin: 1, indice: 1 };

/** Énoncés récents à éviter (anti-répétition d'un combat à l'autre). */
const RECENT_PROMPTS = 150;

export interface BattlesDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly random: Random;
  readonly onFinished?: () => void;
}

const view = (id: string, chapterId: string, s: BattleState, inventory: Inventory): BattleView => ({
  id,
  chapterId,
  status: s.status,
  hearts: s.hearts,
  maxHearts: s.maxHearts,
  bossLives: s.bossLives,
  mobsDefeated: s.mobsDefeated,
  turn: s.turn,
  shield: s.shield,
  hintShown: s.hintShown,
  itemsUsed: s.itemsUsed,
  equipped: s.equipped,
  question: s.question,
  inventory,
});

/** Réserves de questions du chapitre, avec l'énoncé (pour éviter les doublons). */
function pools(chapterId: string) {
  const p = battlePools(chapterId);
  if (!p) throw badRequest('Ce chapitre n’a pas encore de boss');
  return { ...p, prompt: (skillId: string, level: Level, seed: number) => generate(skillId, level, seed).prompt };
}

/** Charge un combat (verrouillé jusqu'à la fin de la transaction). */
async function loadForUpdate(tx: Executor, id: string) {
  const session = await trainingRepo(tx).findSessionForUpdate(id);
  if (session?.mode !== 'boss' || !session.battle) throw notFound(BATTLE_NOT_FOUND);
  return { session, state: session.battle as BattleState };
}

export function createBattlesService({ db, clock, random, onFinished }: BattlesDeps) {
  const dice: BattleDice = { random: random.float, seed: random.seed };

  const overview = async (ex: Executor, profileId: string): Promise<BossOverview> => {
    const items = inventoryRepo(ex);
    return {
      records: await battlesRepo(ex).records(profileId),
      inventory: await items.read(profileId),
      equipped: await items.equipped(profileId),
    };
  };

  return {
    overview: (profileId: string) => overview(db, profileId),

    /** Équipe jusqu'à 3 objets de la réserve pour les prochains combats. */
    equip(profileId: string, items: readonly ItemId[]): Promise<BossOverview> {
      return db.transaction(async (tx) => {
        if (!(await profilesRepo(tx).findForUpdate(profileId))) throw notFound(PROFILE_NOT_FOUND);
        if ((await inventoryRepo(tx).setEquipped(profileId, items)) === null) {
          throw badRequest('Tu n’as pas assez de ces objets en réserve');
        }
        return overview(tx, profileId);
      });
    },

    async start(profileId: string, chapterId: string): Promise<BattleView> {
      const p = pools(chapterId);
      if (!(await profilesRepo(db).exists(profileId))) throw notFound(PROFILE_NOT_FOUND);
      const chapter = getChapter(chapterId);
      // Énoncés des derniers combats de ce chapitre : à éviter aussi.
      const recent = (await battlesRepo(db).recentQuestions(profileId, chapterId, RECENT_PROMPTS)).flatMap((q) => {
        try {
          return [generate(q.skillId, q.level as Level, q.seed).prompt];
        } catch {
          // Notion retirée du contenu depuis : on l'ignore.
          return [];
        }
      });
      const items = inventoryRepo(db);
      const state = createBattle(p, dice, recent, await items.equipped(profileId));
      const id = await trainingRepo(db).insertSession({
        profileId,
        mode: 'boss',
        subject: chapter?.subject ?? 'maths',
        chapterId,
        skillId: null,
        battle: state,
      });
      return view(id, chapterId, state, await items.read(profileId));
    },

    /** Corrige la question en cours (le serveur la connaît) et fait avancer le combat. */
    answer(id: string, a: BattleAnswer): Promise<BattleAnswerResult> {
      return db.transaction(async (tx) => {
        const { session, state } = await loadForUpdate(tx, id);
        if (session.finishedAt || state.status !== 'fighting' || !state.question) throw conflict('Combat terminé');
        const q = state.question;
        if (q.skillId !== a.skillId || q.level !== a.level || q.seed !== a.seed) {
          throw conflict('Ce n’est pas la question en cours');
        }
        const result = check(generate(q.skillId, q.level, q.seed), a.response);
        const inventory = await inventoryRepo(tx).read(session.profileId);
        if (result.invalid) {
          return {
            correct: false,
            invalid: true,
            outcome: null,
            battle: view(id, session.chapterId, state, inventory),
          };
        }
        const { state: next, outcome } = answerBattle(state, pools(session.chapterId), result.correct, dice);
        const repo = trainingRepo(tx);
        await repo.insertAttempt({
          sessionId: id,
          profileId: session.profileId,
          skillId: q.skillId,
          level: q.level,
          seed: q.seed,
          variant: false,
          response: a.response,
          correct: result.correct,
          durationMs: a.durationMs,
          xp: result.correct ? 10 : 0,
        });
        await repo.updateSession(id, { battle: next });
        return {
          correct: result.correct,
          invalid: false,
          outcome,
          battle: view(id, session.chapterId, next, inventory),
        };
      });
    },

    useItem(id: string, item: ItemId): Promise<BattleView> {
      return db.transaction(async (tx) => {
        const { session, state } = await loadForUpdate(tx, id);
        if (session.finishedAt) throw conflict('Combat terminé');
        const refusal = itemRefusal(state, item);
        if (refusal) throw conflict(refusal);
        const items = inventoryRepo(tx);
        if (!(await items.take(session.profileId, item))) throw conflict('Tu n’en as plus');
        await items.unequipOne(session.profileId, item);
        const next = applyItem(state, item);
        await trainingRepo(tx).updateSession(id, { battle: next });
        return view(id, session.chapterId, next, await items.read(session.profileId));
      });
    },

    /** Fin du combat : XP, pièces, et à la 1re victoire médaille et coffre. */
    async finish(id: string): Promise<BattleSummary> {
      const summary = await db.transaction(async (tx): Promise<BattleSummary> => {
        const { session, state } = await loadForUpdate(tx, id);
        if (session.finishedAt) throw conflict('Combat déjà terminé');
        if (state.status === 'fighting') throw conflict('Le combat n’est pas fini');
        const profiles = profilesRepo(tx);
        const profile = await profiles.findForUpdate(session.profileId);
        if (!profile) throw notFound(PROFILE_NOT_FOUND);

        const won = state.status === 'won';
        const records = battlesRepo(tx);
        const record = await records.record(profile.id, session.chapterId);
        const firstWin = won && !record;
        const medal = won ? bossMedal(state.hearts, state.maxHearts, state.itemsUsed) : null;
        const best = bestMedal(record?.bestMedal ?? null, medal) ?? 'bronze';
        const newBest = medal !== null && best !== record?.bestMedal;
        if (won) await records.saveWin(profile.id, session.chapterId, state.hearts, best, clock.now());

        const items = firstWin ? await inventoryRepo(tx).add(profile.id, FIRST_WIN_CHEST) : {};
        const xpGained = battleXp(state);
        const coinsGained = coinsForXp(xpGained) + (firstWin ? BATTLE_FIRST_WIN_COINS : 0);
        await profiles.credit(profile.id, { xp: xpGained, coins: coinsGained });
        await trainingRepo(tx).updateSession(id, {
          finishedAt: clock.now(),
          answered: state.answered,
          correct: state.correct,
          xp: xpGained,
          coins: coinsGained,
        });
        return {
          won,
          firstWin,
          xpGained,
          coinsGained,
          hearts: state.hearts,
          medal,
          newBest,
          items,
          weakSkill: weakestSkill(state, pools(session.chapterId).mobs),
          levelBefore: levelFromXp(profile.xp).level,
          levelAfter: levelFromXp(profile.xp + xpGained).level,
        };
      });
      onFinished?.();
      return summary;
    },
  };
}

export type BattlesService = ReturnType<typeof createBattlesService>;
