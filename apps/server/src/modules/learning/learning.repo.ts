import { and, desc, eq, gt, gte, isNotNull, ne, sql } from 'drizzle-orm';
import type { AnswerFact } from '@questeo/engine';
import type { Executor } from '../../db/client.ts';
import { attempts, bossRecords, ownedHeroes, sessions, skillStates } from '../../db/schema.ts';

/** Réponses lues par le suivi : au plus un an, et au plus ce nombre (les plus récentes). */
const MAX_FACTS = 5_000;

/** Lecture des réponses d'un joueur pour le suivi des apprentissages. */
export function learningRepo(db: Executor) {
  return {
    async facts(profileId: string, since: Date, timeZone: string): Promise<AnswerFact[]> {
      const rows = await db
        .select({
          skillId: attempts.skillId,
          attempt: attempts.attempt,
          correct: attempts.correct,
          hinted: attempts.hinted,
          collective: attempts.collective,
          at: attempts.createdAt,
          // Jour dans le fuseau de la famille (semaine du lundi au dimanche, en France).
          day: sql<string>`to_char(${attempts.createdAt} at time zone ${timeZone}, 'YYYY-MM-DD')`,
          mode: sessions.mode,
          diagnosis: attempts.diagnosis,
        })
        .from(attempts)
        .innerJoin(sessions, eq(sessions.id, attempts.sessionId))
        .where(and(eq(attempts.profileId, profileId), gte(attempts.createdAt, since)))
        .orderBy(desc(attempts.id))
        .limit(MAX_FACTS);
      return rows.map((r) => ({ ...r, attempt: r.attempt === 2 ? 2 : 1, at: r.at.toISOString() }));
    },

    /** Compteurs des badges (voir @questeo/engine/badges.ts), tirés des événements enregistrés. */
    async badgeCounters(profileId: string, timeZone: string) {
      const [boss] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(bossRecords)
        .where(and(eq(bossRecords.profileId, profileId), gt(bossRecords.wins, 0)));
      // Série parfaite : terminée, au moins 4 réponses, toutes justes ; une par notion (ou
      // chapitre) et par jour, pour ne pas récompenser la répétition d'une série trop facile.
      const [perfect] = await db
        .select({
          n: sql<number>`count(distinct (coalesce(${sessions.skillId}, ${sessions.chapterId}), (${sessions.finishedAt} at time zone ${timeZone})::date))::int`,
        })
        .from(sessions)
        .where(
          and(
            eq(sessions.profileId, profileId),
            ne(sessions.mode, 'boss'),
            isNotNull(sessions.finishedAt),
            gte(sessions.answered, 4),
            eq(sessions.correct, sessions.answered),
          ),
        );
      const [retries] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(attempts)
        .where(and(eq(attempts.profileId, profileId), eq(attempts.attempt, 2), eq(attempts.correct, true)));
      const medals = await db
        .select({ skillId: skillStates.skillId, best: skillStates.bestSeries, stage: skillStates.stage })
        .from(skillStates)
        .where(eq(skillStates.profileId, profileId));
      const [heroes] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(ownedHeroes)
        .where(eq(ownedHeroes.profileId, profileId));
      return { boss: boss?.n ?? 0, perfect: perfect?.n ?? 0, retries: retries?.n ?? 0, heroes: heroes?.n ?? 0, medals };
    },
  };
}
