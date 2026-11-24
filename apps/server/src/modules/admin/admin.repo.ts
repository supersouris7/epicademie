import { and, asc, count, desc, eq, exists, gt, gte, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import { ADMIN_PAGE_SIZE, type AccountSearch } from '@questeo/shared';
import type { Executor } from '../../db/client.ts';
import {
  accounts,
  adminAudit,
  attempts,
  authSessions,
  bossRecords,
  emailVerifications,
  families,
  familyInvites,
  inventory,
  ownedHeroes,
  passwordResets,
  profiles,
  questionReports,
  sessions,
  skillStates,
  subscriptions,
} from '../../db/schema.ts';

/** Minuscules sans accents (même règle côté base, pour une recherche insensible aux accents). */
const ACCENTS_FROM = 'àáâãäåçèéêëìíîïñòóôõöùúûüýÿœæ';
const ACCENTS_TO = 'aaaaaaceeeeiiiinooooouuuuyyoa';
export const fold = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'o').replace(/æ/g, 'a');
const folded = (column: SQL | typeof profiles.name | typeof accounts.email) =>
  sql`translate(lower(${column}), ${ACCENTS_FROM}, ${ACCENTS_TO})`;
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

const asDate = (v: unknown): Date | null => (v === null || v === undefined ? null : new Date(v as string | Date));

/** Dernière connexion (session d'appareil) et dernière partie jouée d'une famille. */
const lastLogin = sql`(select max(${authSessions.createdAt}) from ${authSessions} where ${authSessions.accountId} = ${accounts.id})`;
const lastGame = sql`(select max(${sessions.startedAt}) from ${sessions} inner join ${profiles} on ${profiles.id} = ${sessions.profileId} where ${profiles.familyId} = ${accounts.familyId})`;
const lastActivity = sql`greatest(${lastLogin}, ${lastGame})`;

/** Profils de la famille avec leurs compteurs (une requête par indicateur, pas de réponses détaillées). */
async function profileSummaries(db: Executor, familyId: string) {
  const list = await db.select().from(profiles).where(eq(profiles.familyId, familyId)).orderBy(asc(profiles.createdAt));
  const ids = list.map((p) => p.id);
  if (ids.length === 0) return [];
  const [games, answers, states, heroes, wins, items, last] = await Promise.all([
    db
      .select({ id: sessions.profileId, n: count() })
      .from(sessions)
      .where(inArray(sessions.profileId, ids))
      .groupBy(sessions.profileId),
    db
      .select({
        id: attempts.profileId,
        n: count(),
        ok: sql<number>`count(*) filter (where ${attempts.correct})`.mapWith(Number),
      })
      .from(attempts)
      .where(inArray(attempts.profileId, ids))
      .groupBy(attempts.profileId),
    db
      .select({
        id: skillStates.profileId,
        n: count(),
        mastered: sql<number>`count(*) filter (where ${skillStates.stage} = 3)`.mapWith(Number),
      })
      .from(skillStates)
      .where(inArray(skillStates.profileId, ids))
      .groupBy(skillStates.profileId),
    db
      .select({ id: ownedHeroes.profileId, n: count() })
      .from(ownedHeroes)
      .where(inArray(ownedHeroes.profileId, ids))
      .groupBy(ownedHeroes.profileId),
    db
      .select({ id: bossRecords.profileId, n: sql<number>`coalesce(sum(${bossRecords.wins}), 0)`.mapWith(Number) })
      .from(bossRecords)
      .where(inArray(bossRecords.profileId, ids))
      .groupBy(bossRecords.profileId),
    db
      .select({ id: inventory.profileId, item: inventory.item, count: inventory.count })
      .from(inventory)
      .where(and(inArray(inventory.profileId, ids), gt(inventory.count, 0))),
    db
      .select({ id: sessions.profileId, at: sql<unknown>`max(${sessions.startedAt})` })
      .from(sessions)
      .where(inArray(sessions.profileId, ids))
      .groupBy(sessions.profileId),
  ]);
  const by = <T extends { id: string }>(rows: T[], id: string) => rows.find((r) => r.id === id);
  return list.map((p) => ({
    profile: p,
    games: by(games, p.id)?.n ?? 0,
    answers: by(answers, p.id)?.n ?? 0,
    correctAnswers: by(answers, p.id)?.ok ?? 0,
    skillsStudied: by(states, p.id)?.n ?? 0,
    skillsMastered: by(states, p.id)?.mastered ?? 0,
    heroesOwned: by(heroes, p.id)?.n ?? 0,
    bossWins: by(wins, p.id)?.n ?? 0,
    items: items.filter((i) => i.id === p.id).map((i) => ({ item: i.item, count: i.count })),
    lastActivity: asDate(by(last, p.id)?.at),
  }));
}

/** Démarches en cours d'un compte : invitation de rattachement, liens de réinitialisation et de validation. */
async function pendingProcedures(db: Executor, accountId: string, familyId: string, now: Date) {
  const open = (table: typeof passwordResets | typeof emailVerifications) =>
    db
      .select({ one: sql`1` })
      .from(table)
      .where(and(eq(table.accountId, accountId), isNull(table.usedAt), gt(table.expiresAt, now)))
      .limit(1);
  const [invite, reset, verification] = await Promise.all([
    db
      .select({ one: sql`1` })
      .from(familyInvites)
      .where(and(eq(familyInvites.familyId, familyId), isNull(familyInvites.usedAt), gt(familyInvites.expiresAt, now)))
      .limit(1),
    open(passwordResets),
    open(emailVerifications),
  ]);
  return {
    invitation: invite.length > 0,
    passwordReset: reset.length > 0,
    emailVerification: verification.length > 0,
  };
}

/** Accès en lecture aux comptes pour l'administration, et journal d'audit. */
export function adminRepo(db: Executor) {
  return {
    /** Une page de comptes (25 lignes) et le total correspondant aux filtres. */
    async searchAccounts(input: AccountSearch, today: string) {
      const filters: (SQL | undefined)[] = [];
      const q = fold(input.q);
      if (q) {
        const pattern = `%${escapeLike(q)}%`;
        filters.push(
          or(
            sql`${folded(accounts.email)} like ${pattern}`,
            sql`${accounts.familyId}::text like ${pattern}`,
            exists(
              db
                .select({ one: sql`1` })
                .from(profiles)
                .where(and(eq(profiles.familyId, accounts.familyId), sql`${folded(profiles.name)} like ${pattern}`)),
            ),
          ),
        );
      }
      if (input.type !== 'tous') filters.push(eq(families.autonomous, input.type === 'autonome'));
      if (input.state === 'verifie') filters.push(sql`${accounts.emailVerifiedAt} is not null`);
      if (input.state === 'non-verifie')
        filters.push(sql`${accounts.emailVerifiedAt} is null and ${accounts.email} is not null`);
      if (input.state === 'abonne') {
        filters.push(
          exists(
            db
              .select({ one: sql`1` })
              .from(subscriptions)
              .where(
                and(
                  eq(subscriptions.familyId, accounts.familyId),
                  eq(subscriptions.status, 'payee'),
                  gte(subscriptions.periodEnd, today),
                ),
              ),
          ),
        );
      }
      const where = and(...filters);
      const direction = input.order === 'asc' ? asc : desc;
      const order =
        input.sort === 'activite'
          ? [direction(sql`coalesce(${lastActivity}, ${accounts.createdAt})`), desc(accounts.id)]
          : [direction(accounts.createdAt), desc(accounts.id)];
      const rows = await db
        .select({
          id: accounts.id,
          familyId: accounts.familyId,
          email: accounts.email,
          emailVerifiedAt: accounts.emailVerifiedAt,
          createdAt: accounts.createdAt,
          autonomous: families.autonomous,
          lastActivity: sql<unknown>`${lastActivity}`,
        })
        .from(accounts)
        .innerJoin(families, eq(families.id, accounts.familyId))
        .where(where)
        // Une ligne de plus que la page : sait s'il y en a une suivante.
        .orderBy(...order)
        .limit(ADMIN_PAGE_SIZE + 1)
        .offset(input.page * ADMIN_PAGE_SIZE);
      const [totalRow] = await db
        .select({ n: count() })
        .from(accounts)
        .innerJoin(families, eq(families.id, accounts.familyId))
        .where(where);
      const page = rows.slice(0, ADMIN_PAGE_SIZE);
      const familyIds = page.map((r) => r.familyId);
      const names =
        familyIds.length === 0
          ? []
          : await db
              .select({ familyId: profiles.familyId, name: profiles.name })
              .from(profiles)
              .where(inArray(profiles.familyId, familyIds))
              .orderBy(asc(profiles.createdAt));
      return {
        rows: page.map((r) => ({
          ...r,
          lastActivity: asDate(r.lastActivity),
          profileNames: names.filter((n) => n.familyId === r.familyId).map((n) => n.name),
        })),
        hasMore: rows.length > ADMIN_PAGE_SIZE,
        total: totalRow?.n ?? 0,
      };
    },

    /** Compte et indicateurs de connexion (jamais d'empreinte : seulement « défini ou non »). */
    async account(id: string) {
      const [row] = await db
        .select({
          id: accounts.id,
          familyId: accounts.familyId,
          email: accounts.email,
          createdAt: accounts.createdAt,
          emailVerifiedAt: accounts.emailVerifiedAt,
          hasPassword: sql<boolean>`${accounts.passwordHash} is not null`,
          hasGoogle: sql<boolean>`${accounts.googleSub} is not null`,
          hasRecovery: sql<boolean>`${accounts.recoveryHash} is not null`,
          hasPin: sql<boolean>`${accounts.parentPinHash} is not null`,
          autonomous: families.autonomous,
          lastLogin: sql<unknown>`${lastLogin}`,
          lastGame: sql<unknown>`${lastGame}`,
        })
        .from(accounts)
        .innerJoin(families, eq(families.id, accounts.familyId))
        .where(eq(accounts.id, id));
      return row && { ...row, lastLogin: asDate(row.lastLogin), lastGame: asDate(row.lastGame) };
    },

    profilesOf: (familyId: string) => profileSummaries(db, familyId),

    recentGames(familyId: string, limit: number) {
      return db
        .select({
          profileName: profiles.name,
          mode: sessions.mode,
          subject: sessions.subject,
          chapterId: sessions.chapterId,
          startedAt: sessions.startedAt,
          answered: sessions.answered,
          correct: sessions.correct,
        })
        .from(sessions)
        .innerJoin(profiles, eq(profiles.id, sessions.profileId))
        .where(eq(profiles.familyId, familyId))
        .orderBy(desc(sessions.startedAt))
        .limit(limit);
    },

    reports(familyId: string, limit: number) {
      return db
        .select({
          id: questionReports.id,
          skillId: questionReports.skillId,
          reason: questionReports.reason,
          status: questionReports.status,
          comment: questionReports.comment,
          createdAt: questionReports.createdAt,
        })
        .from(questionReports)
        .where(eq(questionReports.familyId, familyId))
        .orderBy(desc(questionReports.createdAt))
        .limit(limit);
    },

    pending: (accountId: string, familyId: string, now: Date) => pendingProcedures(db, accountId, familyId, now),

    subscriptions(familyId: string, limit: number) {
      return db
        .select({
          status: subscriptions.status,
          offer: subscriptions.offer,
          amountCents: subscriptions.amountCents,
          currency: subscriptions.currency,
          periodEnd: subscriptions.periodEnd,
          paidAt: subscriptions.paidAt,
          provider: subscriptions.provider,
        })
        .from(subscriptions)
        .where(eq(subscriptions.familyId, familyId))
        .orderBy(desc(subscriptions.createdAt))
        .limit(limit);
    },

    /** Remplace le mot de passe et ferme toutes les sessions d'appareil du compte. */
    async resetPassword(accountId: string, passwordHash: string): Promise<number> {
      await db.update(accounts).set({ passwordHash }).where(eq(accounts.id, accountId));
      // Les liens de réinitialisation en attente ne doivent pas écraser le mot de passe temporaire.
      await db.delete(passwordResets).where(eq(passwordResets.accountId, accountId));
      const closed = await db
        .delete(authSessions)
        .where(eq(authSessions.accountId, accountId))
        .returning({ h: authSessions.tokenHash });
      return closed.length;
    },

    async audit(entry: typeof adminAudit.$inferInsert): Promise<void> {
      await db.insert(adminAudit).values(entry);
    },

    async auditPage(page: number) {
      const rows = await db
        .select()
        .from(adminAudit)
        .orderBy(desc(adminAudit.at), desc(adminAudit.id))
        .limit(ADMIN_PAGE_SIZE + 1)
        .offset(page * ADMIN_PAGE_SIZE);
      return { rows: rows.slice(0, ADMIN_PAGE_SIZE), hasMore: rows.length > ADMIN_PAGE_SIZE };
    },
  };
}
