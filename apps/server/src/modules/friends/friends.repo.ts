import { and, eq, inArray, isNull, or } from 'drizzle-orm';
import type { Executor } from '../../db/client.ts';
import { friendships, profiles } from '../../db/schema.ts';

export type FriendshipRow = typeof friendships.$inferSelect;

/** Paire ordonnée (la table impose profil A < profil B). */
export const pair = (x: string, y: string) => (x < y ? { a: x, b: y } : { a: y, b: x });

/** Amitiés : lecture et écriture, en base ou dans une transaction (l'appelant décide). */
export function friendsRepo(db: Executor) {
  return {
    async profile(id: string) {
      const [row] = await db
        .select({
          id: profiles.id,
          name: profiles.name,
          hero: profiles.hero,
          avatar: profiles.avatar,
          familyId: profiles.familyId,
          friendCode: profiles.friendCode,
        })
        .from(profiles)
        .where(eq(profiles.id, id));
      return row;
    },

    async byCode(code: string) {
      const [row] = await db
        .select({ id: profiles.id, familyId: profiles.familyId })
        .from(profiles)
        .where(eq(profiles.friendCode, code));
      return row;
    },

    /** Donne un code au profil s'il n'en a pas encore (false si le code est déjà pris). */
    async setCode(profileId: string, code: string): Promise<boolean> {
      const taken = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.friendCode, code));
      if (taken.length > 0) return false;
      await db
        .update(profiles)
        .set({ friendCode: code })
        .where(and(eq(profiles.id, profileId), isNull(profiles.friendCode)));
      return true;
    },

    /** Amitiés (toutes étapes) d'un ou plusieurs profils. */
    of(profileIds: readonly string[]) {
      if (profileIds.length === 0) return Promise.resolve([] as FriendshipRow[]);
      return db
        .select()
        .from(friendships)
        .where(or(inArray(friendships.profileA, [...profileIds]), inArray(friendships.profileB, [...profileIds])));
    },

    async find(x: string, y: string) {
      const { a, b } = pair(x, y);
      const [row] = await db
        .select()
        .from(friendships)
        .where(and(eq(friendships.profileA, a), eq(friendships.profileB, b)));
      return row;
    },

    async insert(requester: string, other: string, now: Date) {
      const { a, b } = pair(requester, other);
      await db.insert(friendships).values({ profileA: a, profileB: b, requestedBy: requester, createdAt: now });
    },

    async update(x: string, y: string, patch: Partial<Pick<FriendshipRow, 'acceptedAt' | 'parentAAt' | 'parentBAt'>>) {
      const { a, b } = pair(x, y);
      await db
        .update(friendships)
        .set(patch)
        .where(and(eq(friendships.profileA, a), eq(friendships.profileB, b)));
    },

    async remove(x: string, y: string) {
      const { a, b } = pair(x, y);
      await db.delete(friendships).where(and(eq(friendships.profileA, a), eq(friendships.profileB, b)));
    },

    async profilesOfFamily(familyId: string) {
      return db.select({ id: profiles.id, name: profiles.name }).from(profiles).where(eq(profiles.familyId, familyId));
    },
  };
}
