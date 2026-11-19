import { randomInt, randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { battlePools, check, generate, getChapter } from '@questeo/content';
import {
  answerBattle,
  applyItem,
  battleXp,
  BATTLE_FIRST_WIN_COINS,
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
  ITEM_PRICES,
  MAX_ITEM_STOCK,
  RUBY_PRICE,
  type BattleAnswer,
  type BattleAnswerResult,
  type BattleSummary,
  type BattleView,
  type BossOverview,
  type Inventory,
  type ItemId,
} from '@questeo/shared';
import type { Db } from './client.ts';
import { addItems, readEquipped, readInventory, setEquipped, takeItem, unequipOne } from './inventory.ts';
import { PlayError } from './play-repo.ts';
import { attempts, bossRecords, profiles, sessions } from './schema.ts';

const dice: BattleDice = { random: Math.random, seed: () => randomInt(2_000_000_000) };

/** Coffre de la 1re victoire contre un boss. */
export const FIRST_WIN_CHEST: Partial<Inventory> = { bouclier: 1, soin: 1, indice: 1 };

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

export function createBattleRepo(db: Db) {
  const load = (id: string) => {
    const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
    if (session?.mode !== 'boss' || !session.battle) throw new PlayError(404, 'Combat introuvable');
    // Combats commencés avant le contrôle des doublons ou l'équipement : champs absents.
    const stored = session.battle as Omit<BattleState, 'seen' | 'equipped'> & {
      seen?: readonly string[];
      equipped?: readonly ItemId[];
    };
    return { session, state: { ...stored, seen: stored.seen ?? [], equipped: stored.equipped ?? [] } };
  };
  const pools = (chapterId: string) => {
    const p = battlePools(chapterId);
    if (!p) throw new PlayError(400, 'Ce chapitre n’a pas encore de boss');
    return { ...p, prompt: (skillId: string, level: 1 | 2 | 3, seed: number) => generate(skillId, level, seed).prompt };
  };
  const records = (profileId: string) =>
    db.select().from(bossRecords).where(eq(bossRecords.profileId, profileId)).all();

  return {
    overview(profileId: string): BossOverview {
      return {
        records: records(profileId).map((r) => ({
          chapterId: r.chapterId,
          wins: r.wins,
          bestHearts: r.bestHearts,
          bestMedal: r.bestMedal,
          firstWonAt: r.firstWonAt,
        })),
        inventory: readInventory(db, profileId),
        equipped: readEquipped(db, profileId),
      };
    },

    /** Équipe jusqu'à 3 objets de la réserve pour les prochains combats. */
    equip(profileId: string, items: readonly ItemId[]): BossOverview {
      const profile = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, profileId)).get();
      if (!profile) throw new PlayError(404, 'Profil introuvable');
      if (items.length > 0 && setEquipped(db, profileId, items).length === 0)
        throw new PlayError(400, 'Tu n’as pas assez de ces objets en réserve');
      if (items.length === 0) setEquipped(db, profileId, []);
      return this.overview(profileId);
    },

    start(profileId: string, chapterId: string): BattleView {
      const profile = db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, profileId)).get();
      if (!profile) throw new PlayError(404, 'Profil introuvable');
      const chapter = getChapter(chapterId);
      const p = pools(chapterId);
      // Énoncés des derniers combats de ce chapitre : à éviter aussi.
      const recent = db
        .select({ skillId: attempts.skillId, level: attempts.level, seed: attempts.seed })
        .from(attempts)
        .innerJoin(sessions, eq(sessions.id, attempts.sessionId))
        .where(and(eq(attempts.profileId, profileId), eq(sessions.mode, 'boss'), eq(sessions.chapterId, chapterId)))
        .orderBy(desc(attempts.id))
        .limit(150)
        .all()
        .reverse()
        .flatMap((a) => {
          try {
            return [generate(a.skillId, a.level as 1 | 2 | 3, a.seed).prompt];
          } catch {
            return [];
          }
        });
      const state = createBattle(p, dice, recent, readEquipped(db, profileId));
      const id = randomUUID();
      db.insert(sessions)
        .values({
          id,
          profileId,
          mode: 'boss',
          subject: chapter?.subject ?? 'maths',
          chapterId,
          skillId: null,
          battle: state,
        })
        .run();
      return view(id, chapterId, state, readInventory(db, profileId));
    },

    /** Corrige la question en cours (le serveur la connaît) et fait avancer le combat. */
    answer(id: string, a: BattleAnswer): BattleAnswerResult {
      return db.transaction((tx) => {
        const { session, state } = load(id);
        if (session.finishedAt || state.status !== 'fighting' || !state.question) {
          throw new PlayError(409, 'Combat terminé');
        }
        const q = state.question;
        if (q.skillId !== a.skillId || q.level !== a.level || q.seed !== a.seed) {
          throw new PlayError(409, 'Ce n’est pas la question en cours');
        }
        const result = check(generate(q.skillId, q.level, q.seed), a.response);
        const inventory = readInventory(tx, session.profileId);
        if (result.invalid) {
          return {
            correct: false,
            invalid: true,
            outcome: null,
            battle: view(id, session.chapterId, state, inventory),
          };
        }
        const { state: next, outcome } = answerBattle(state, pools(session.chapterId), result.correct, dice);
        tx.insert(attempts)
          .values({
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
          })
          .run();
        tx.update(sessions).set({ battle: next }).where(eq(sessions.id, id)).run();
        return {
          correct: result.correct,
          invalid: false,
          outcome,
          battle: view(id, session.chapterId, next, inventory),
        };
      });
    },

    useItem(id: string, item: ItemId): BattleView {
      return db.transaction((tx) => {
        const { session, state } = load(id);
        if (session.finishedAt) throw new PlayError(409, 'Combat terminé');
        const refusal = itemRefusal(state, item);
        if (refusal) throw new PlayError(409, refusal);
        if (!takeItem(tx, session.profileId, item)) throw new PlayError(409, 'Tu n’en as plus');
        unequipOne(tx, session.profileId, item);
        const next = applyItem(state, item);
        tx.update(sessions).set({ battle: next }).where(eq(sessions.id, id)).run();
        return view(id, session.chapterId, next, readInventory(tx, session.profileId));
      });
    },

    /** Fin du combat : XP, pièces, et à la 1re victoire munition, médaille et coffre. */
    finish(id: string): BattleSummary {
      return db.transaction((tx) => {
        const { session, state } = load(id);
        if (session.finishedAt) throw new PlayError(409, 'Combat déjà terminé');
        if (state.status === 'fighting') throw new PlayError(409, 'Le combat n’est pas fini');
        const profile = tx.select().from(profiles).where(eq(profiles.id, session.profileId)).get();
        if (!profile) throw new PlayError(404, 'Profil introuvable');
        const won = state.status === 'won';
        const where = and(eq(bossRecords.profileId, profile.id), eq(bossRecords.chapterId, session.chapterId));
        const record = tx.select().from(bossRecords).where(where).get();
        const firstWin = won && !record;
        const medal = won ? bossMedal(state.hearts, state.maxHearts, state.itemsUsed) : null;
        const best = bestMedal(record?.bestMedal ?? null, medal) ?? 'bronze';
        const newBest = medal !== null && best !== record?.bestMedal;
        if (firstWin) {
          tx.insert(bossRecords)
            .values({
              profileId: profile.id,
              chapterId: session.chapterId,
              wins: 1,
              bestHearts: state.hearts,
              bestMedal: best,
              firstWonAt: new Date().toISOString(),
            })
            .run();
        } else if (won && record) {
          tx.update(bossRecords)
            .set({ wins: record.wins + 1, bestHearts: Math.max(record.bestHearts, state.hearts), bestMedal: best })
            .where(where)
            .run();
        }
        const items = firstWin ? addItems(tx, profile.id, FIRST_WIN_CHEST) : {};
        const xpGained = battleXp(state);
        const coinsGained = coinsForXp(xpGained) + (firstWin ? BATTLE_FIRST_WIN_COINS : 0);
        tx.update(profiles)
          .set({ xp: profile.xp + xpGained, coins: profile.coins + coinsGained })
          .where(eq(profiles.id, profile.id))
          .run();
        tx.update(sessions)
          .set({
            finishedAt: new Date().toISOString(),
            answered: state.answered,
            correct: state.correct,
            xp: xpGained,
            coins: coinsGained,
          })
          .where(eq(sessions.id, id))
          .run();
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
    },

    /** Achat d'un consommable, ou d'un rubis, avec des pièces. */
    buy(profileId: string, item: ItemId | 'rubis'): { coins: number; rubies: number; inventory: Inventory } {
      return db.transaction((tx) => {
        const profile = tx.select().from(profiles).where(eq(profiles.id, profileId)).get();
        if (!profile) throw new PlayError(404, 'Profil introuvable');
        const price = item === 'rubis' ? RUBY_PRICE : ITEM_PRICES[item];
        if (profile.coins < price) throw new PlayError(409, `Il te faut ${price} pièces`);
        if (item !== 'rubis' && readInventory(tx, profileId)[item] >= MAX_ITEM_STOCK) {
          throw new PlayError(409, `${MAX_ITEM_STOCK} ${item}s au maximum`);
        }
        tx.update(profiles)
          .set({ coins: profile.coins - price, rubies: profile.rubies + (item === 'rubis' ? 1 : 0) })
          .where(eq(profiles.id, profileId))
          .run();
        if (item !== 'rubis') addItems(tx, profileId, { [item]: 1 });
        return {
          coins: profile.coins - price,
          rubies: profile.rubies + (item === 'rubis' ? 1 : 0),
          inventory: readInventory(tx, profileId),
        };
      });
    },
  };
}

export type BattleRepo = ReturnType<typeof createBattleRepo>;
