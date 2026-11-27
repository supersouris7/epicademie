import { and, count, desc, eq, gt, gte, isNotNull, or, sql, sum } from 'drizzle-orm';
import {
  OFFERS,
  REPORT_STATUSES,
  SUBJECT_IDS,
  TREND_DAYS,
  type AdminStats,
  type AdminTrends,
  type Anomaly,
  type SubjectId,
  type WeakSkillStat,
} from '@epicademie/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import {
  attempts,
  bossRecords,
  families,
  profiles,
  questionReports,
  sessions,
  accounts,
  subscriptions,
} from '../../db/schema.ts';

/**
 * Pilotage (docs/adr/0022-pilotage.md) : chiffres agrégés et anomalies de récompenses. Aucune
 * donnée personnelle ne sort d'ici (comptes, sommes, identifiants de profils seulement).
 */

/** Seuils des anomalies, volontairement larges : on signale l'impossible, pas l'excellent. */
export const ANOMALY_THRESHOLDS = {
  /** Une série rapporte au plus ≈ 110 pièces (XP + coffre épique + doublon de héros). */
  sessionCoins: 300,
  seriesPerDay: 40,
  /** Réponses en moins de 1,5 s : au moins 60 % sur au moins 20 réponses en 7 jours. */
  fastMs: 1500,
  /** En pourcentage (calcul entier côté base). */
  fastPercent: 60,
  fastMinAnswers: 20,
  coins: 50_000,
  rubies: 200,
} as const;

const DAY_MS = 86_400_000;
/** Réponses minimales pour classer une notion dans les points faibles. */
export const WEAK_MIN_ANSWERS = 10;

function addDays(day: string, delta: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + delta * DAY_MS).toISOString().slice(0, 10);
}

export function createInsightsService({ db, clock }: { db: Db; clock: Clock }) {
  const since = (days: number) => new Date(clock.now().getTime() - days * DAY_MS);
  const num = (v: unknown) => Number(v ?? 0);

  async function answersStats(from: Date) {
    const firstIndividual = and(gte(attempts.createdAt, from), eq(attempts.attempt, 1), eq(attempts.collective, false));
    const [tot] = await db
      .select({
        answers: count(),
        autonomous: sql<number>`count(*) filter (where ${attempts.correct} and not ${attempts.hinted})`,
      })
      .from(attempts)
      .where(firstIndividual);
    const bySubject = await db
      .select({ subject: sessions.subject, answers: count() })
      .from(attempts)
      .innerJoin(sessions, eq(sessions.id, attempts.sessionId))
      .where(firstIndividual)
      .groupBy(sessions.subject);
    return { answers: num(tot?.answers), autonomous: num(tot?.autonomous), bySubject };
  }

  return {
    async stats(): Promise<AdminStats> {
      const week = since(7);
      const [fam, prof, active, series, wins, premium, reports] = await Promise.all([
        db.select({ n: count() }).from(families),
        db.select({ n: count() }).from(profiles),
        db
          .select({ n: sql<number>`count(distinct ${attempts.profileId})` })
          .from(attempts)
          .where(gte(attempts.createdAt, week)),
        db
          .select({ n: count() })
          .from(sessions)
          .where(and(isNotNull(sessions.finishedAt), gte(sessions.finishedAt, week))),
        db.select({ n: sum(bossRecords.wins) }).from(bossRecords),
        db
          .select({ n: sql<number>`count(distinct ${subscriptions.familyId})` })
          .from(subscriptions)
          .where(and(eq(subscriptions.status, 'payee'), gte(subscriptions.periodEnd, clock.today()))),
        db.select({ status: questionReports.status, n: count() }).from(questionReports).groupBy(questionReports.status),
      ]);
      const reportCounts = Object.fromEntries(
        REPORT_STATUSES.map((s) => [s, num(reports.find((r) => r.status === s)?.n)]),
      ) as AdminStats['reportCounts'];
      const payments = await db
        .select({ status: subscriptions.status, count: count(), amountCents: sum(subscriptions.amountCents) })
        .from(subscriptions)
        .groupBy(subscriptions.status);
      const a = await answersStats(week);
      return {
        day: clock.today(),
        families: num(fam[0]?.n),
        profiles: num(prof[0]?.n),
        activeProfiles7d: num(active[0]?.n),
        finishedSeries7d: num(series[0]?.n),
        answers7d: a.answers,
        autonomousRate7d: a.answers === 0 ? null : a.autonomous / a.answers,
        answersBySubject7d: a.bySubject
          .filter((s): s is { subject: SubjectId; answers: number } =>
            (SUBJECT_IDS as readonly string[]).includes(s.subject),
          )
          .map((s) => ({ subject: s.subject, answers: num(s.answers) }))
          .sort((x, y) => y.answers - x.answers),
        bossWins: num(wins[0]?.n),
        premiumFamilies: num(premium[0]?.n),
        payments: payments.map((p) => ({ status: p.status, count: num(p.count), amountCents: num(p.amountCents) })),
        openReports: reportCounts.nouveau + reportCounts['en-cours'],
        reportCounts,
      };
    },

    /**
     * Courbes sur 30 jours (jour courant inclus). Un abonnement est actif du jour de son paiement
     * à sa fin d'accès ; une famille n'est comptée qu'une fois par jour.
     */
    async trends(): Promise<AdminTrends> {
      const today = clock.today();
      const days = Array.from({ length: TREND_DAYS }, (_, i) => addDays(today, i - (TREND_DAYS - 1)));
      const created = await db
        .select({ day: sql<string>`to_char(${accounts.createdAt}, 'YYYY-MM-DD')`, n: count() })
        .from(accounts)
        .where(gte(accounts.createdAt, since(TREND_DAYS + 1)))
        .groupBy(sql`to_char(${accounts.createdAt}, 'YYYY-MM-DD')`);
      const paid = await db
        .select({
          familyId: subscriptions.familyId,
          offer: subscriptions.offer,
          start: sql<string>`to_char(coalesce(${subscriptions.paidAt}, ${subscriptions.createdAt}), 'YYYY-MM-DD')`,
          end: subscriptions.periodEnd,
          amountCents: subscriptions.amountCents,
          provider: subscriptions.provider,
        })
        .from(subscriptions)
        .where(eq(subscriptions.status, 'payee'));
      const createdBy = new Map(created.map((c) => [c.day, num(c.n)]));
      const activeOn = (d: string) => paid.filter((p) => p.start <= d && d <= p.end);
      const familiesByOffer = new Map<string, Set<string>>();
      for (const p of activeOn(today)) {
        familiesByOffer.set(p.offer, (familiesByOffer.get(p.offer) ?? new Set()).add(p.familyId));
      }
      return {
        day: today,
        accountsByDay: days.map((day) => ({ day, count: createdBy.get(day) ?? 0 })),
        activeSubscriptionsByDay: days.map((day) => ({
          day,
          count: new Set(activeOn(day).map((p) => p.familyId)).size,
        })),
        activeByOffer: OFFERS.map((offer) => ({ offer, count: familiesByOffer.get(offer)?.size ?? 0 })),
        revenueCents: paid.reduce((total, p) => total + p.amountCents, 0),
        paymentProviders: [...new Set(paid.map((p) => p.provider))].sort(),
      };
    },

    /**
     * Points faibles anonymes : notions les plus ratées (taux d'erreur au 1er essai) sur 90 jours,
     * avec au moins WEAK_MIN_ANSWERS réponses pour éviter le bruit.
     */
    async weakSkills(): Promise<WeakSkillStat[]> {
      const errors = sql<number>`count(*) filter (where not ${attempts.correct})`;
      const rows = await db
        .select({
          skillId: attempts.skillId,
          answers: count(),
          errors,
          players: sql<number>`count(distinct ${attempts.profileId})`,
        })
        .from(attempts)
        .where(and(gte(attempts.createdAt, since(90)), eq(attempts.attempt, 1), eq(attempts.collective, false)))
        .groupBy(attempts.skillId)
        .having(sql`count(*) >= ${WEAK_MIN_ANSWERS}`)
        .orderBy(sql`${errors}::float / count(*) desc`, desc(count()))
        .limit(30);
      return rows.map((r) => ({
        skillId: r.skillId,
        answers: num(r.answers),
        errors: num(r.errors),
        players: num(r.players),
      }));
    },

    async anomalies(): Promise<Anomaly[]> {
      const t = ANOMALY_THRESHOLDS;
      const month = since(30);
      const [bigGains, busyDays, fast, wallets] = await Promise.all([
        db
          .select({ profileId: sessions.profileId, coins: sessions.coins, at: sessions.finishedAt })
          .from(sessions)
          .where(and(gt(sessions.coins, t.sessionCoins), gte(sessions.startedAt, month)))
          .limit(100),
        db
          .select({
            profileId: sessions.profileId,
            day: sql<string>`to_char(${sessions.finishedAt}, 'YYYY-MM-DD')`,
            n: count(),
          })
          .from(sessions)
          .where(and(isNotNull(sessions.finishedAt), gte(sessions.finishedAt, month)))
          .groupBy(sessions.profileId, sql`to_char(${sessions.finishedAt}, 'YYYY-MM-DD')`)
          .having(sql`count(*) > ${t.seriesPerDay}`)
          .limit(100),
        db
          .select({
            profileId: attempts.profileId,
            n: count(),
            fast: sql<number>`count(*) filter (where ${attempts.durationMs} < ${t.fastMs})`,
          })
          .from(attempts)
          .where(gte(attempts.createdAt, since(7)))
          .groupBy(attempts.profileId)
          .having(
            sql`count(*) >= ${t.fastMinAnswers} and 100 * count(*) filter (where ${attempts.durationMs} < ${t.fastMs}) >= ${t.fastPercent} * count(*)`,
          )
          .limit(100),
        db
          .select({ id: profiles.id, coins: profiles.coins, rubies: profiles.rubies })
          .from(profiles)
          .where(or(gt(profiles.coins, t.coins), gt(profiles.rubies, t.rubies)))
          .limit(100),
      ]);
      return [
        ...bigGains.map((g) => ({
          rule: 'gain-de-serie' as const,
          profileId: g.profileId,
          detail: `${g.coins} pièces en une partie ; maximum attendu ${t.sessionCoins}`,
          at: g.at?.toISOString() ?? null,
        })),
        ...busyDays.map((d) => ({
          rule: 'series-par-jour' as const,
          profileId: d.profileId,
          detail: `${num(d.n)} séries le ${d.day} ; seuil ${t.seriesPerDay}`,
          at: null,
        })),
        ...fast.map((f) => ({
          rule: 'reponses-eclair' as const,
          profileId: f.profileId,
          detail: `${num(f.fast)} réponses sur ${num(f.n)} en moins de ${t.fastMs / 1000} s (7 jours)`,
          at: null,
        })),
        ...wallets.map((w) => ({
          rule: 'solde-hors-norme' as const,
          profileId: w.id,
          detail: `${w.coins} pièces, ${w.rubies} rubis`,
          at: null,
        })),
      ];
    },
  };
}

export type InsightsService = ReturnType<typeof createInsightsService>;
