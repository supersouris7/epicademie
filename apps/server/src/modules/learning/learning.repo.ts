import { and, desc, eq, gte, sql } from 'drizzle-orm';
import type { AnswerFact } from '@questeo/engine';
import type { Executor } from '../../db/client.ts';
import { attempts, sessions } from '../../db/schema.ts';

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
  };
}
