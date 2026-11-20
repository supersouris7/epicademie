import { and, eq, lt } from 'drizzle-orm';
import type { Executor } from './client.ts';
import { idempotentRequests } from './schema.ts';
import { badRequest } from '../core/errors.ts';

/**
 * Réponses déjà données pour une clé d'idempotence (en-tête `Idempotency-Key`). À appeler dans
 * la transaction de l'opération, APRÈS avoir verrouillé la ligne concernée : deux requêtes
 * simultanées de même clé passent l'une après l'autre, la seconde trouve la réponse de la première.
 */
export function idempotencyRepo(db: Executor) {
  return {
    async find(familyId: string, key: string, route: string): Promise<unknown> {
      const [row] = await db
        .select()
        .from(idempotentRequests)
        .where(and(eq(idempotentRequests.familyId, familyId), eq(idempotentRequests.key, key)));
      if (row && row.route !== route) throw badRequest('Clé d’idempotence déjà utilisée pour une autre opération');
      return row?.response;
    },
    async save(familyId: string, key: string, route: string, response: unknown, now: Date): Promise<void> {
      await db.insert(idempotentRequests).values({ familyId, key, route, response, createdAt: now });
      // Une requête ne se rejoue pas au-delà de quelques minutes : les clés d'une semaine suffisent.
      await db.delete(idempotentRequests).where(lt(idempotentRequests.createdAt, new Date(now.getTime() - KEEP_MS)));
    },
  };
}

/** Durée de conservation des clés. */
const KEEP_MS = 7 * 24 * 3600 * 1000;

/** Clé valable : 8 à 100 caractères sûrs (un UUID côté client). */
export const IDEMPOTENCY_KEY = /^[\w-]{8,100}$/;
