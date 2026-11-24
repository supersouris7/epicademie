import { and, inArray, isNotNull, isNull, lt } from 'drizzle-orm';
import type { Executor } from '../../db/client.ts';
import { accounts, families } from '../../db/schema.ts';

/** Délai après lequel une inscription jamais validée par lien e-mail est supprimée. */
const UNVERIFIED_RETENTION_DAYS = 7;

/**
 * Supprime les familles dont le compte parent n'a jamais validé son adresse e-mail (inscrit
 * depuis plus de 7 jours, aucun compte validé dans la famille). Les suppressions en cascade
 * (#65) emportent comptes, jetons, profils et le reste. Les élèves autonomes (sans e-mail)
 * ne sont jamais concernés. Renvoie le nombre de familles supprimées.
 */
export async function purgeUnverifiedAccounts(db: Executor, now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - UNVERIFIED_RETENTION_DAYS * 24 * 3600 * 1000);
  const stale = await db
    .select({ familyId: accounts.familyId })
    .from(accounts)
    .where(and(isNull(accounts.emailVerifiedAt), isNotNull(accounts.email), lt(accounts.createdAt, cutoff)));
  const candidates = [...new Set(stale.map((r) => r.familyId))];
  if (candidates.length === 0) return 0;
  const verified = await db
    .select({ familyId: accounts.familyId })
    .from(accounts)
    .where(and(inArray(accounts.familyId, candidates), isNotNull(accounts.emailVerifiedAt)));
  const keep = new Set(verified.map((r) => r.familyId));
  const doomed = candidates.filter((id) => !keep.has(id));
  if (doomed.length === 0) return 0;
  const removed = await db.delete(families).where(inArray(families.id, doomed)).returning({ id: families.id });
  return removed.length;
}
