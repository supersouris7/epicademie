import { and, eq, gt, isNull, ne } from 'drizzle-orm';
import type { AccountRole } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import { accounts, authSessions, families, passwordResets, profiles, sessions } from '../../db/schema.ts';

/** Accès aux comptes, familles, sessions d'appareil et liens de réinitialisation. */
export function accountsRepo(db: Executor) {
  return {
    /** Crée la famille et son compte parent (dans la transaction de l'appelant). */
    async createFamilyAccount(email: string, passwordHash: string, role: AccountRole = 'parent') {
      const [family] = await db.insert(families).values({}).returning({ id: families.id });
      if (!family) throw new Error('création de famille sans retour');
      const [account] = await db
        .insert(accounts)
        .values({ familyId: family.id, email, passwordHash, role })
        .returning();
      if (!account) throw new Error('création de compte sans retour');
      return account;
    },

    async findByEmail(email: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.email, email));
      return row;
    },

    async findById(id: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.id, id));
      return row;
    },

    async setRole(email: string, role: AccountRole): Promise<boolean> {
      const rows = await db
        .update(accounts)
        .set({ role })
        .where(eq(accounts.email, email))
        .returning({ id: accounts.id });
      return rows.length > 0;
    },

    async setPassword(accountId: string, passwordHash: string): Promise<void> {
      await db.update(accounts).set({ passwordHash }).where(eq(accounts.id, accountId));
    },

    // ——— Sessions d'appareil ———

    async createSession(s: { tokenHash: string; accountId: string; expiresAt: Date; parentUntil: Date | null }) {
      await db.insert(authSessions).values(s);
    },

    /** Session encore valide, avec son compte. */
    async findSession(tokenHash: string, now: Date) {
      const [row] = await db
        .select({
          tokenHash: authSessions.tokenHash,
          expiresAt: authSessions.expiresAt,
          parentUntil: authSessions.parentUntil,
          accountId: accounts.id,
          familyId: accounts.familyId,
          email: accounts.email,
          role: accounts.role,
        })
        .from(authSessions)
        .innerJoin(accounts, eq(accounts.id, authSessions.accountId))
        .where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, now)));
      return row;
    },

    async extendSession(tokenHash: string, expiresAt: Date): Promise<void> {
      await db.update(authSessions).set({ expiresAt }).where(eq(authSessions.tokenHash, tokenHash));
    },

    async setParentPin(accountId: string, pinHash: string): Promise<void> {
      await db
        .update(accounts)
        .set({ parentPinHash: pinHash, pinFailures: 0, pinLockedUntil: null })
        .where(eq(accounts.id, accountId));
    },

    async setPinFailures(accountId: string, failures: number, lockedUntil: Date | null): Promise<void> {
      await db
        .update(accounts)
        .set({ pinFailures: failures, pinLockedUntil: lockedUntil })
        .where(eq(accounts.id, accountId));
    },

    async setParentUntil(tokenHash: string, parentUntil: Date | null): Promise<void> {
      await db.update(authSessions).set({ parentUntil }).where(eq(authSessions.tokenHash, tokenHash));
    },

    async deleteSession(tokenHash: string): Promise<void> {
      await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
    },

    /** Ferme toutes les sessions du compte (sauf, éventuellement, celle en cours). */
    async deleteSessionsOf(accountId: string, keep?: string): Promise<void> {
      await db
        .delete(authSessions)
        .where(and(eq(authSessions.accountId, accountId), keep ? ne(authSessions.tokenHash, keep) : undefined));
    },

    // ——— Réinitialisation du mot de passe ———

    async createReset(r: { tokenHash: string; accountId: string; expiresAt: Date }) {
      await db.insert(passwordResets).values(r);
    },

    /** Lien encore valide et jamais utilisé, verrouillé jusqu'à la fin de la transaction. */
    async findResetForUpdate(tokenHash: string, now: Date) {
      const [row] = await db
        .select()
        .from(passwordResets)
        .where(
          and(
            eq(passwordResets.tokenHash, tokenHash),
            isNull(passwordResets.usedAt),
            gt(passwordResets.expiresAt, now),
          ),
        )
        .for('update');
      return row;
    },

    async markResetUsed(tokenHash: string, at: Date): Promise<void> {
      await db.update(passwordResets).set({ usedAt: at }).where(eq(passwordResets.tokenHash, tokenHash));
    },

    // ——— Appartenance (isolation des familles) ———

    async familyOfProfile(profileId: string): Promise<string | null | undefined> {
      const [row] = await db.select({ familyId: profiles.familyId }).from(profiles).where(eq(profiles.id, profileId));
      return row?.familyId;
    },

    /** Famille du joueur d'une partie ou d'un combat (même table `sessions`). */
    async familyOfGame(gameId: string): Promise<string | null | undefined> {
      const [row] = await db
        .select({ familyId: profiles.familyId })
        .from(sessions)
        .innerJoin(profiles, eq(profiles.id, sessions.profileId))
        .where(eq(sessions.id, gameId));
      return row?.familyId;
    },
  };
}

/** Donne un rôle à un compte existant (commande d'exploitation `admin`, jamais par l'API). */
export const setAccountRole = (db: Executor, email: string, role: AccountRole) =>
  accountsRepo(db).setRole(email.trim().toLowerCase(), role);

/**
 * Rattache les profils de la bêta (créés avant les comptes, sans famille) à la famille d'un
 * compte (commande d'exploitation `admin rattacher`). Seuls les profils sans famille sont
 * touchés ; renvoie leurs prénoms, ou null si le compte n'existe pas.
 */
export async function attachOrphanProfiles(db: Executor, email: string): Promise<string[] | null> {
  const account = await accountsRepo(db).findByEmail(email.trim().toLowerCase());
  if (!account) return null;
  const rows = await db
    .update(profiles)
    .set({ familyId: account.familyId })
    .where(isNull(profiles.familyId))
    .returning({ name: profiles.name });
  return rows.map((r) => r.name);
}
