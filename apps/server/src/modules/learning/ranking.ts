import { and, gte, inArray, isNotNull, sql } from 'drizzle-orm';
import { levelFromXp } from '@questeo/engine';
import type { BadgeProgress, RankingRow } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import { bossRecords, profiles, sessions, skillStates } from '../../db/schema.ts';

/** Chiffres d'un joueur pour le classement (sans « moi » ni « ami », ajoutés par l'appelant). */
export type RankingStats = Omit<RankingRow, 'me' | 'friend'>;

const TIER_POINTS = { bronze: 1, argent: 2, or: 3, diamant: 4 } as const;

/** Lundi de la semaine du jour donné (AAAA-MM-JJ). */
export function mondayOf(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

/**
 * Chiffres du classement « Se comparer » pour une poignée de joueurs (famille et amis) :
 * niveau, XP de la semaine, boss vaincus, notions en or, badges, records des défis.
 */
export async function rankingStats(
  db: Db,
  ids: readonly string[],
  ctx: { readonly today: string; readonly timeZone: string; readonly badges: (id: string) => Promise<BadgeProgress[]> },
): Promise<RankingStats[]> {
  if (ids.length === 0) return [];
  const list = [...ids];
  const monday = mondayOf(ctx.today);
  const [people, week, bosses, golds, defis] = await Promise.all([
    db
      .select({ id: profiles.id, name: profiles.name, hero: profiles.hero, avatar: profiles.avatar, xp: profiles.xp })
      .from(profiles)
      .where(inArray(profiles.id, list)),
    db
      .select({ id: sessions.profileId, xp: sql<number>`coalesce(sum(${sessions.xp}), 0)` })
      .from(sessions)
      .where(
        and(
          inArray(sessions.profileId, list),
          sql`(${sessions.startedAt} at time zone ${ctx.timeZone})::date >= ${monday}::date`,
        ),
      )
      .groupBy(sessions.profileId),
    db
      .select({
        id: bossRecords.profileId,
        n: sql<number>`count(*)`,
        gold: sql<number>`count(*) filter (where ${bossRecords.bestMedal} = 'or')`,
        diamond: sql<number>`count(*) filter (where ${bossRecords.bestMedal} = 'diamant')`,
      })
      .from(bossRecords)
      .where(and(inArray(bossRecords.profileId, list), gte(bossRecords.wins, 1)))
      .groupBy(bossRecords.profileId),
    db
      .select({ id: skillStates.profileId, n: sql<number>`count(*)` })
      .from(skillStates)
      .where(and(inArray(skillStates.profileId, list), gte(skillStates.bestSeries, 5)))
      .groupBy(skillStates.profileId),
    db
      .select({ id: sessions.profileId, mode: sessions.mode, best: sql<number>`max(${sessions.correct})` })
      .from(sessions)
      .where(
        and(
          inArray(sessions.profileId, list),
          inArray(sessions.mode, ['chrono', 'survie']),
          isNotNull(sessions.finishedAt),
        ),
      )
      .groupBy(sessions.profileId, sessions.mode),
  ]);
  const num = (v: unknown) => Number(v ?? 0);
  return Promise.all(
    people.map(async (p) => {
      const b = bosses.find((x) => x.id === p.id);
      const badges = await ctx.badges(p.id);
      const best = (mode: string) => num(defis.find((d) => d.id === p.id && d.mode === mode)?.best);
      return {
        id: p.id,
        name: p.name,
        hero: p.hero,
        avatar: p.avatar,
        level: levelFromXp(p.xp).level,
        xp: p.xp,
        weekXp: num(week.find((w) => w.id === p.id)?.xp),
        bosses: num(b?.n),
        goldMedals: num(b?.gold),
        diamondMedals: num(b?.diamond),
        goldSkills: num(golds.find((g) => g.id === p.id)?.n),
        badgePoints: badges.reduce((n, x) => n + (x.tier ? TIER_POINTS[x.tier] : 0), 0),
        chrono: best('chrono'),
        survie: best('survie'),
      };
    }),
  );
}
