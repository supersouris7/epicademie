import { randomInt } from 'node:crypto';
import {
  ADMIN_PAGE_SIZE,
  type AccountDetail,
  type AccountPage,
  type AccountSearch,
  type AuditPage,
  type TemporaryPassword,
} from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { conflict, notFound } from '../../core/errors.ts';
import { hashPassword } from '../../core/auth/password.ts';
import { adminRepo } from './admin.repo.ts';

/**
 * Consultation des comptes par l'opérateur (docs/adr/0033-…) : liste paginée, fiche, mot de passe
 * temporaire, journal d'audit. Les données renvoyées sont des résumés : ni empreinte, ni jeton, ni
 * réponses détaillées des élèves.
 */

/** Alphabet lisible : sans 0/O, 1/l/I (le mot de passe est dicté ou recopié). */
const READABLE = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const TEMP_PASSWORD_LENGTH = 12;
const RECENT = 20;

export function newTemporaryPassword(): string {
  return Array.from({ length: TEMP_PASSWORD_LENGTH }, () => READABLE[randomInt(READABLE.length)]).join('');
}

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const latest = (...dates: (Date | null)[]) => dates.reduce<Date | null>((a, b) => (b && (!a || b > a) ? b : a), null);

export function createAdminService({ db, clock }: { db: Db; clock: Clock }) {
  const repo = adminRepo(db);

  return {
    async search(input: AccountSearch): Promise<AccountPage> {
      const { rows, hasMore, total } = await repo.searchAccounts(input, clock.today());
      return {
        items: rows.map((r) => ({
          id: r.id,
          familyId: r.familyId,
          email: r.email,
          type: r.autonomous ? 'autonome' : 'famille',
          emailVerified: r.emailVerifiedAt !== null,
          createdAt: r.createdAt.toISOString(),
          lastActivityAt: iso(r.lastActivity),
          profileCount: r.profileNames.length,
          profileNames: r.profileNames.slice(0, 3),
        })),
        page: input.page,
        pageSize: ADMIN_PAGE_SIZE,
        total,
        hasMore,
      };
    },

    /** Fiche d'un compte ; la consultation est journalisée (RGPD : accès aux données d'enfants). */
    async detail(id: string, operator: string): Promise<AccountDetail> {
      const account = await repo.account(id);
      if (!account) throw notFound('Compte introuvable');
      await repo.audit({ operator, action: 'consultation', accountId: id });
      const [profiles, recentGames, reports, pending, subscriptions] = await Promise.all([
        repo.profilesOf(account.familyId),
        repo.recentGames(account.familyId, RECENT),
        repo.reports(account.familyId, RECENT),
        repo.pending(account.id, account.familyId, clock.now()),
        repo.subscriptions(account.familyId, 5),
      ]);
      const methods = [
        ...(account.hasPassword ? (['mot-de-passe'] as const) : []),
        ...(account.hasGoogle ? (['google'] as const) : []),
        ...(account.hasRecovery ? (['code-recuperation'] as const) : []),
      ];
      return {
        account: {
          id: account.id,
          familyId: account.familyId,
          email: account.email,
          type: account.autonomous ? 'autonome' : 'famille',
          createdAt: account.createdAt.toISOString(),
          lastLoginAt: iso(account.lastLogin),
          lastActivityAt: iso(latest(account.lastLogin, account.lastGame)),
          emailVerifiedAt: iso(account.emailVerifiedAt),
          methods,
          hasPin: account.hasPin,
        },
        profiles: profiles.map((p) => ({
          id: p.profile.id,
          name: p.profile.name,
          hero: p.profile.hero,
          grade: p.profile.grade,
          xp: p.profile.xp,
          coins: p.profile.coins,
          rubies: p.profile.rubies,
          createdAt: p.profile.createdAt.toISOString(),
          lastActivityAt: iso(p.lastActivity),
          games: p.games,
          answers: p.answers,
          correctAnswers: p.correctAnswers,
          skillsStudied: p.skillsStudied,
          skillsMastered: p.skillsMastered,
          heroesOwned: p.heroesOwned,
          bossWins: p.bossWins,
          items: p.items,
        })),
        recentGames: recentGames.map((g) => ({ ...g, startedAt: g.startedAt.toISOString() })),
        reports: reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        pending,
        subscriptions: subscriptions.map((s) => ({ ...s, paidAt: iso(s.paidAt) })),
      };
    },

    /** Mot de passe temporaire (montré une seule fois) ; les sessions du compte sont fermées. */
    async resetPassword(id: string, operator: string): Promise<TemporaryPassword> {
      const account = await repo.account(id);
      if (!account) throw notFound('Compte introuvable');
      if (account.autonomous || account.email === null) {
        throw conflict('Cet élève autonome n’a pas de mot de passe : il utilise son code de récupération.');
      }
      const password = newTemporaryPassword();
      const sessionsClosed = await repo.resetPassword(id, await hashPassword(password));
      await repo.audit({ operator, action: 'reinitialisation-mot-de-passe', accountId: id });
      return { password, sessionsClosed };
    },

    async auditPage(page: number): Promise<AuditPage> {
      const { rows, hasMore } = await repo.auditPage(page);
      return {
        items: rows.map((r) => ({
          id: r.id,
          at: r.at.toISOString(),
          operator: r.operator,
          action: r.action,
          accountId: r.accountId,
        })),
        page,
        hasMore,
      };
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
