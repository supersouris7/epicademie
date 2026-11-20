import {
  BADGE_TIERS,
  COSMETIC_IDS,
  COSMETICS,
  cosmeticInfo,
  DEFAULT_HQ,
  HqLayoutSchema,
  type BadgeProgress,
  type BossRecord,
  type CosmeticId,
  type Hq,
  type HqLayout,
} from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { conflict, notFound } from '../../core/errors.ts';
import { PROFILE_NOT_FOUND, profilesRepo } from '../profiles/index.ts';
import { hqRepo } from './hq.repo.ts';

/**
 * QG, salle des trophées et cosmétiques (docs/adr/0021-qg-et-cosmetiques.md). Les trophées
 * viennent des données déjà enregistrées (boss vaincus, badges, Acad-Héros) : rien à attribuer.
 */
export interface HqDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly badges: (profileId: string) => Promise<BadgeProgress[]>;
  readonly bossRecords: (profileId: string) => Promise<readonly BossRecord[]>;
}

const tierRank = (t: BadgeProgress['tier']) => (t === null ? 0 : BADGE_TIERS.indexOf(t) + 1);

export function createHqService({ db, clock, badges, bossRecords }: HqDeps) {
  /** Cosmétiques utilisables : offerts, achetés, ou débloqués par un badge. */
  const unlockedSet = async (profileId: string, progress: BadgeProgress[]): Promise<Set<CosmeticId>> => {
    const bought = new Set(await hqRepo(db).owned(profileId));
    const reached = new Map(progress.map((b) => [b.category, tierRank(b.tier)]));
    return new Set(
      COSMETIC_IDS.filter((id) => {
        const s = cosmeticInfo(id).source;
        if (s.type === 'depart') return true;
        if (s.type === 'achat') return bought.has(id);
        return (reached.get(s.badge) ?? 0) >= tierRank(s.tier);
      }),
    );
  };

  const trophiesOf = async (profileId: string, progress: BadgeProgress[]): Promise<string[]> => {
    const [records, heroes] = await Promise.all([bossRecords(profileId), profilesRepo(db).heroes(profileId)]);
    return [
      ...records.map((r) => `boss:${r.chapterId}`),
      ...progress.filter((b) => b.tier !== null).map((b) => `badge:${b.category}`),
      ...heroes.map((h) => `heros:${h}`),
    ];
  };

  const read = async (profileId: string): Promise<Hq> => {
    const progress = await badges(profileId);
    const [unlocked, trophies, saved] = await Promise.all([
      unlockedSet(profileId, progress),
      trophiesOf(profileId, progress),
      hqRepo(db).layout(profileId),
    ]);
    // Un aménagement enregistré reste valable ; sinon, aménagement par défaut.
    const parsed = HqLayoutSchema.safeParse(saved);
    const layout: HqLayout = parsed.success ? parsed.data : DEFAULT_HQ;
    return { layout, unlocked: [...unlocked], trophies };
  };

  return {
    read,

    async save(profileId: string, layout: HqLayout): Promise<Hq> {
      const hq = await read(profileId);
      const usable = new Set(hq.unlocked);
      for (const [kind, id] of [
        ['fond', layout.fond],
        ['cadre', layout.cadre],
        ['titre', layout.titre],
      ] as const) {
        if (COSMETICS[id].kind !== kind) throw conflict('Ce cosmétique ne va pas à cet endroit.');
        if (!usable.has(id)) throw conflict(`« ${COSMETICS[id].name} » n’est pas encore débloqué.`);
      }
      const earned = new Set(hq.trophies);
      if (layout.vitrine.some((t) => !earned.has(t))) throw conflict('Ce trophée n’est pas encore gagné.');
      if (new Set(layout.vitrine).size !== layout.vitrine.length) throw conflict('Un trophée ne se pose qu’une fois.');
      await hqRepo(db).saveLayout(profileId, layout, clock.now());
      return { ...hq, layout };
    },

    /** Achat d'un cosmétique (rubis ou pièces gagnés en jouant) ; jamais d'argent réel. */
    async buy(profileId: string, cosmetic: CosmeticId): Promise<{ coins: number; rubies: number; hq: Hq }> {
      const source = cosmeticInfo(cosmetic).source;
      if (source.type !== 'achat') throw conflict('Ce cosmétique se débloque en jouant, pas à la boutique.');
      const after = await db.transaction(async (tx) => {
        const profiles = profilesRepo(tx);
        const profile = await profiles.findForUpdate(profileId);
        if (!profile) throw notFound(PROFILE_NOT_FOUND);
        if ((await hqRepo(tx).owned(profileId)).includes(cosmetic)) throw conflict('Tu l’as déjà !');
        const spent = await profiles.spendBoth(profileId, source.coins, source.rubies);
        if (!spent) {
          const price = [source.rubies && `${source.rubies} rubis`, source.coins && `${source.coins} pièces`]
            .filter(Boolean)
            .join(' et ');
          throw conflict(`Il te faut ${price}.`);
        }
        await hqRepo(tx).add(profileId, cosmetic);
        return spent;
      });
      return { coins: after.coins, rubies: after.rubies, hq: await read(profileId) };
    },
  };
}

export type HqService = ReturnType<typeof createHqService>;
