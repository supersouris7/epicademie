import { battlePools, check, generate, getChapter, getSkill, skillVersion } from '@epicademie/content';
import {
  answerBattle,
  applyItem,
  BATTLE_FIRST_WIN_COINS,
  battleXp,
  bossChest,
  coinsForXp,
  createBattle,
  itemRefusal,
  levelFromXp,
  weakestSkill,
  type BattleDice,
  type BattleState,
} from '@epicademie/engine';
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
} from '@epicademie/shared';
import type { Db, Executor, Tx } from '../../db/client.ts';
import type { SessionRow } from '../../db/schema.ts';
import type { Clock } from '../../core/clock.ts';
import type { Random } from '../../core/random.ts';
import { badRequest, conflict, gone, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { grantChest, inventoryRepo } from '../inventory/index.ts';
import { trainingRepo } from '../training/index.ts';
import { disabledSkills } from '../pedagogy/index.ts';
import { readBattle, storeBattle } from './battle-state.ts';
import { battlesRepo } from './battles.repo.ts';

/**
 * Combats de boss. L'état complet du combat (questions tirées, cœurs, vies du boss, objets)
 * vit sur le serveur, dans la partie (`sessions.battle`) ; le client ne reçoit qu'une vue
 * (`BattleView`) et envoie ses réponses. Les règles du combat sont dans @epicademie/engine
 * (fonctions pures) ; ce service les applique et persiste le résultat.
 */

export const BATTLE_NOT_FOUND = 'Combat introuvable';

/** Combat commencé avant une mise à jour qui a changé le format de son état. */
export const BATTLE_EXPIRED = 'Ce combat a expiré avec la mise à jour du jeu. Relance-le !';

/** Énoncés récents à éviter (anti-répétition d'un combat à l'autre). */
const RECENT_PROMPTS = 150;

export interface BattlesDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly random: Random;
  /** Fin de partie : monnaie distribuée (métriques). */
  readonly onFinished?: (rewards: { readonly coins: number; readonly rubies: number }) => void;
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

/** Récap : réponses et réponses justes par notion, dans l'ordre où elles sont apparues. */
function tallyBySkill(rows: readonly { readonly skillId: string; readonly correct: boolean }[]) {
  const by = new Map<string, { skillId: string; answered: number; correct: number }>();
  for (const r of rows) {
    const t = by.get(r.skillId) ?? { skillId: r.skillId, answered: 0, correct: 0 };
    by.set(r.skillId, { ...t, answered: t.answered + 1, correct: t.correct + (r.correct ? 1 : 0) });
  }
  return [...by.values()];
}

/** Réserves de questions du chapitre, avec l'énoncé (pour éviter les doublons). */
/**
 * Réserves de questions du combat, sans les notions désactivées par l'administration. Sans mob,
 * problème ou piège disponible, le boss est « en maintenance ».
 */
function pools(chapterId: string, disabled: ReadonlySet<string> = new Set()) {
  const p = battlePools(chapterId);
  if (!p) throw badRequest('Ce chapitre n’a pas encore de boss');
  const keep = (ids: readonly string[]) => ids.filter((id) => !disabled.has(id));
  const filtered = { mobs: keep(p.mobs), problems: keep(p.problems), traps: keep(p.traps) };
  if (!filtered.mobs.length || !filtered.problems.length || !filtered.traps.length) {
    throw conflict('Ce boss est en maintenance : reviens un peu plus tard !');
  }
  return {
    ...filtered,
    prompt: (skillId: string, level: Level, seed: number) => generate(skillId, level, seed).prompt,
  };
}

/** Réserves du combat d'après les désactivations en base. */
const livePools = async (ex: Executor, chapterId: string) => pools(chapterId, new Set(await disabledSkills(ex)));

/** Combat chargé et verrouillé, dont l'état stocké a été validé. */
interface LockedBattle {
  readonly tx: Tx;
  readonly session: SessionRow;
  readonly state: BattleState;
}

/** Marqueur interne : le combat a été clos parce que son état stocké n'est plus lisible. */
const EXPIRED = Symbol('combat expiré');

export function createBattlesService({ db, clock, random, onFinished }: BattlesDeps) {
  const dice: BattleDice = { random: random.float, seed: random.seed };

  /**
   * Exécute `action` sur le combat verrouillé (jusqu'à la fin de la transaction : deux requêtes
   * simultanées sur le même combat passent l'une après l'autre).
   * État stocké périmé ou illisible (autre version du serveur) : le combat est clos sans
   * récompense ni pénalité, la clôture est VALIDÉE, puis l'erreur GONE est levée — la lever
   * dans la transaction annulerait la clôture.
   */
  async function withBattle<T>(id: string, action: (b: LockedBattle) => Promise<T>): Promise<T> {
    const result = await db.transaction(async (tx) => {
      const repo = trainingRepo(tx);
      const session = await repo.findSessionForUpdate(id);
      if (session?.mode !== 'boss' || session.battle == null) throw notFound(BATTLE_NOT_FOUND);
      const state = readBattle(session.battle);
      if (!state) {
        if (!session.finishedAt) await repo.updateSession(id, { finishedAt: clock.now() });
        return EXPIRED;
      }
      return { value: await action({ tx, session, state }) };
    });
    if (result === EXPIRED) throw gone(BATTLE_EXPIRED);
    return result.value;
  }

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
      const p = await livePools(db, chapterId);
      if (!(await profilesRepo(db).exists(profileId))) throw notFound(PROFILE_NOT_FOUND);
      const chapter = getChapter(chapterId);
      // Énoncés des derniers combats de ce chapitre : à éviter aussi.
      const recent = (await battlesRepo(db).recentQuestions(profileId, chapterId, RECENT_PROMPTS)).flatMap((q) => {
        try {
          return [generate(q.skillId, q.level, q.seed).prompt];
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
        battle: storeBattle(state),
      });
      return view(id, chapterId, state, await items.read(profileId));
    },

    /** Corrige la question en cours (le serveur la connaît) et fait avancer le combat. */
    answer(id: string, a: BattleAnswer): Promise<BattleAnswerResult> {
      return withBattle(id, async ({ tx, session, state }) => {
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
        const { state: next, outcome } = answerBattle(
          state,
          await livePools(tx, session.chapterId),
          result.correct,
          dice,
        );
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
          // L'objet « indice » affiché pour cette question : réussite avec aide.
          hinted: state.hintShown,
          skillVersion: skillVersion(getSkill(q.skillId)),
          diagnosis: result.correct ? null : (result.why ?? null),
        });
        await repo.updateSession(id, { battle: storeBattle(next) });
        return {
          correct: result.correct,
          invalid: false,
          outcome,
          battle: view(id, session.chapterId, next, inventory),
        };
      });
    },

    useItem(id: string, item: ItemId): Promise<BattleView> {
      return withBattle(id, async ({ tx, session, state }) => {
        if (session.finishedAt) throw conflict('Combat terminé');
        const refusal = itemRefusal(state, item);
        if (refusal) throw conflict(refusal);
        const items = inventoryRepo(tx);
        if (!(await items.take(session.profileId, item))) throw conflict('Tu n’en as plus');
        await items.unequipOne(session.profileId, item);
        const next = applyItem(state, item);
        await trainingRepo(tx).updateSession(id, { battle: storeBattle(next) });
        return view(id, session.chapterId, next, await items.read(session.profileId));
      });
    },

    /** Fin du combat : XP, pièces, et à la 1re victoire médaille et coffre. */
    async finish(id: string): Promise<BattleSummary> {
      const summary = await withBattle(id, async ({ tx, session, state }): Promise<BattleSummary> => {
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

        // Coffre à chaque victoire, selon la médaille (parfois un cran au-dessus).
        const chest = medal ? await grantChest(tx, profile.id, bossChest(medal, random.float)) : null;
        const xpGained = battleXp(state);
        const coinsGained = coinsForXp(xpGained) + (firstWin ? BATTLE_FIRST_WIN_COINS : 0);
        await profiles.credit(profile.id, {
          xp: xpGained,
          coins: coinsGained + (chest?.coins ?? 0),
          rubies: chest?.rubies ?? 0,
        });
        await trainingRepo(tx).updateSession(id, {
          finishedAt: clock.now(),
          answered: state.answered,
          correct: state.correct,
          xp: xpGained,
          coins: coinsGained,
          chest: chest?.rarity ?? null,
        });
        return {
          won,
          firstWin,
          xpGained,
          coinsGained,
          hearts: state.hearts,
          medal,
          newBest,
          chest,
          weakSkill: weakestSkill(state, pools(session.chapterId).mobs),
          skills: tallyBySkill(await trainingRepo(tx).firstAttemptsOf(id)),
          levelBefore: levelFromXp(profile.xp).level,
          levelAfter: levelFromXp(profile.xp + xpGained).level,
        };
      });
      onFinished?.({ coins: summary.coinsGained + (summary.chest?.coins ?? 0), rubies: summary.chest?.rubies ?? 0 });
      return summary;
    },
  };
}

export type BattlesService = ReturnType<typeof createBattlesService>;
