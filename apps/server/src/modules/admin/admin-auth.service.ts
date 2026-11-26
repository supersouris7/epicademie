import { and, eq, lt, ne } from 'drizzle-orm';
import { roleFromGroups } from '@epicademie/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { newToken, tokenHash } from '../../core/auth/tokens.ts';
import { sanitizeAdminName, type AdminIdentity } from '../../core/http/admin-identity.ts';
import { adminAccessEvents, adminSessions } from '../../db/schema.ts';
import type { OidcIdentity } from './oidc.ts';

/**
 * Sessions d'administration (docs/adr/0036-…) : courtes, en base (empreinte du jeton seulement),
 * rôle relu à chaque connexion. Connexions, déconnexions, refus et requêtes de
 * secours sont tracés.
 */

export const ADMIN_SESSION_MS = 12 * 3_600_000;
export const ADMIN_IDLE_MS = 30 * 60_000;

export function createAdminAuthService({ db, clock }: { db: Db; clock: Clock }) {
  return {
    /** Ouvre une session ; `null` : aucun groupe d'administration (sessions de la personne fermées). */
    async login(identity: OidcIdentity): Promise<string | null> {
      const name = sanitizeAdminName(identity.name, 'membre');
      const role = roleFromGroups(identity.groups);
      const now = clock.now();
      await db.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
      // Le rôle qui vient d'être lu l'emporte : les sessions ouvertes avec un autre rôle sont fermées.
      const mine = eq(adminSessions.sub, identity.sub);
      await db.delete(adminSessions).where(role ? and(mine, ne(adminSessions.role, role)) : mine);
      await db.insert(adminAccessEvents).values({
        at: now,
        operator: name,
        adminSub: identity.sub,
        action: role ? 'connexion' : 'refus-de-role',
      });
      if (!role) return null;
      const token = newToken();
      await db.insert(adminSessions).values({
        tokenHash: tokenHash(token),
        sub: identity.sub,
        name,
        role,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ADMIN_SESSION_MS),
        lastSeenAt: now,
      });
      return token;
    },

    /** Session encore valide (12 h au plus, 30 min d'inactivité au plus), prolongée par la requête. */
    async resolve(token: string): Promise<AdminIdentity | null> {
      const hash = tokenHash(token);
      const [session] = await db.select().from(adminSessions).where(eq(adminSessions.tokenHash, hash));
      if (!session) return null;
      const now = clock.now();
      if (now >= session.expiresAt || now.getTime() - session.lastSeenAt.getTime() >= ADMIN_IDLE_MS) {
        await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hash));
        return null;
      }
      await db.update(adminSessions).set({ lastSeenAt: now }).where(eq(adminSessions.tokenHash, hash));
      return { name: session.name, role: session.role, sub: session.sub, via: 'sso' };
    },

    /** Ferme la session ; tracée seulement si elle existait encore. */
    async logout(token: string): Promise<void> {
      const [session] = await db
        .delete(adminSessions)
        .where(eq(adminSessions.tokenHash, tokenHash(token)))
        .returning();
      if (!session) return;
      await db.insert(adminAccessEvents).values({
        at: clock.now(),
        operator: session.name,
        adminSub: session.sub,
        action: 'deconnexion',
      });
    },

    async traceRescue(admin: AdminIdentity, request: string): Promise<void> {
      await db.insert(adminAccessEvents).values({
        at: clock.now(),
        operator: admin.name,
        adminSub: admin.sub,
        action: 'secours',
        detail: request,
      });
    },
  };
}

export type AdminAuthService = ReturnType<typeof createAdminAuthService>;
