import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { AdminTrends, WeakSkillStat, AdminError, AdminStats, Anomaly, Profile } from '@epicademie/shared';
import { accounts, attempts, profiles, sessions, subscriptions } from '../../db/schema.ts';
import { createTestApp, profileInput } from '../../testing/harness.ts';
import { ANOMALY_THRESHOLDS } from './insights.service.ts';
import { cleanMessage } from '../../core/observability/error-journal.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let profile: Profile;
let admin: ReturnType<typeof t.as>;

beforeAll(async () => {
  t = await createTestApp({
    today: '2026-11-20',
    routes: (http) => {
      http.get('/api/v1/boom', () => {
        throw new Error('panne de test');
      });
    },
  });
});
afterAll(() => t.close());
beforeEach(async () => {
  await t.reset();
  profile = (await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput() })).json<Profile>();
  admin = t.operator();
});

const answer = (sessionId: string, durationMs: number, correct = true, skillId = 'm5-tables') => ({
  sessionId,
  profileId: profile.id,
  skillId,
  level: 1,
  seed: 1,
  variant: false,
  response: { kind: 'number', value: '42' },
  correct,
  durationMs,
  xp: 10,
  createdAt: t.clock.now(),
});

const session = async (coins = 10) => {
  const [row] = await t.database.db
    .insert(sessions)
    .values({
      profileId: profile.id,
      mode: 'entrainement',
      subject: 'maths',
      chapterId: 'm5-calcul',
      startedAt: t.clock.now(),
      finishedAt: t.clock.now(),
      coins,
    })
    .returning({ id: sessions.id });
  return row?.id ?? '';
};

describe('pilotage (administration)', () => {
  it('réservé à l’administration', async () => {
    for (const url of [
      '/api/v1/admin/stats',
      '/api/v1/admin/trends',
      '/api/v1/admin/errors',
      '/api/v1/admin/anomalies',
      '/api/v1/admin/weak-skills',
    ]) {
      expect((await t.http.inject(url)).statusCode).toBe(403);
    }
  });

  it('statistiques agrégées, sans donnée personnelle', async () => {
    const id = await session();
    await t.database.db.insert(attempts).values([answer(id, 8000), answer(id, 9000, false)]);
    const res = await admin.inject('/api/v1/admin/stats');
    expect(res.statusCode).toBe(200);
    const stats = res.json<AdminStats>();
    expect(stats).toMatchObject({
      day: '2026-11-20',
      families: 1,
      profiles: 1,
      activeProfiles7d: 1,
      finishedSeries7d: 1,
      answers7d: 2,
      autonomousRate7d: 0.5,
      answersBySubject7d: [{ subject: 'maths', answers: 2 }],
      premiumFamilies: 1,
      openReports: 0,
      reportCounts: { nouveau: 0, 'en-cours': 0, resolu: 0, rejete: 0 },
    });
    expect(res.body).not.toContain(profile.name);
    expect(res.body).not.toContain('@');
  });

  it('courbes sur 30 jours : comptes créés et abonnements actifs, agrégés', async () => {
    const db = t.database.db;
    await db.update(accounts).set({ createdAt: new Date('2026-11-18T10:00:00Z') });
    await db.delete(subscriptions);
    const [fam] = await db.select({ id: accounts.familyId }).from(accounts).limit(1);
    await db.insert(subscriptions).values({
      familyId: fam?.id ?? '',
      offer: 'famille-annee',
      status: 'payee',
      amountCents: 2499,
      currency: 'eur',
      periodEnd: '2026-11-19',
      provider: 'simulateur',
      paidAt: new Date('2026-11-17T09:00:00Z'),
    });
    const res = await admin.inject('/api/v1/admin/trends');
    expect(res.statusCode).toBe(200);
    const trends = res.json<AdminTrends>();
    expect(trends.day).toBe('2026-11-20');
    expect(trends.accountsByDay).toHaveLength(30);
    expect(trends.accountsByDay.at(-1)?.day).toBe('2026-11-20');
    expect(trends.accountsByDay[0]?.day).toBe('2026-10-22');
    const at = (rows: { day: string; count: number }[], day: string) => rows.find((r) => r.day === day)?.count;
    expect(at(trends.accountsByDay, '2026-11-18')).toBe(1);
    expect(at(trends.accountsByDay, '2026-11-19')).toBe(0);
    expect(at(trends.activeSubscriptionsByDay!, '2026-11-16')).toBe(0);
    expect(at(trends.activeSubscriptionsByDay!, '2026-11-18')).toBe(1);
    expect(at(trends.activeSubscriptionsByDay!, '2026-11-20')).toBe(0);
    expect(trends.activeByOffer).toEqual([{ offer: 'famille-annee', count: 0 }]);
    expect(trends.revenueCents).toBe(2499);
    expect(trends.paymentProviders).toEqual(['simulateur']);
    expect(res.body).not.toContain('@');
    expect(res.body).not.toContain(fam?.id ?? 'x');
  });

  it('anomalies : gain impossible, réponses éclair, solde hors norme ; une partie normale ne sort pas', async () => {
    await session(25);
    expect((await admin.inject('/api/v1/admin/anomalies')).json<Anomaly[]>()).toEqual([]);
    const id = await session(ANOMALY_THRESHOLDS.sessionCoins + 112);
    await t.database.db.insert(attempts).values(Array.from({ length: 20 }, () => answer(id, 300)));
    await t.database.db.update(profiles).set({ rubies: 999 }).where(eq(profiles.id, profile.id));
    const rules = (await admin.inject('/api/v1/admin/anomalies')).json<Anomaly[]>();
    expect(rules.map((a) => a.rule).sort()).toEqual(['gain-de-serie', 'reponses-eclair', 'solde-hors-norme']);
    expect(rules.find((a) => a.rule === 'gain-de-serie')?.detail).toBe(
      '412 pièces en une partie ; maximum attendu 300',
    );
    expect(rules.every((a) => a.profileId === profile.id)).toBe(true);
  });

  it('points faibles anonymes : notions les plus ratées (au moins 10 réponses), sans nom d’enfant', async () => {
    const id = await session();
    await t.database.db
      .insert(attempts)
      .values([
        ...Array.from({ length: 10 }, (_, i) => answer(id, 8000, i < 3, 'm5-carres')),
        ...Array.from({ length: 10 }, (_, i) => answer(id, 8000, i < 8, 'm5-tables')),
        ...Array.from({ length: 4 }, () => answer(id, 8000, false, 'm5-priorites')),
      ]);
    const res = await admin.inject('/api/v1/admin/weak-skills');
    expect(res.json<WeakSkillStat[]>()).toEqual([
      { skillId: 'm5-carres', answers: 10, errors: 7, players: 1 },
      { skillId: 'm5-tables', answers: 10, errors: 2, players: 1 },
    ]);
    expect(res.body).not.toContain(profile.name);
  });

  it('erreurs récentes regroupées par message, avec leur nombre', async () => {
    await t.http.inject('/api/v1/boom');
    await t.http.inject('/api/v1/boom');
    const errors = (await admin.inject('/api/v1/admin/errors')).json<AdminError[]>();
    expect(errors).toContainEqual(expect.objectContaining({ source: 'server', message: 'panne de test', count: 2 }));
  });

  it('réponses envoyées une seule fois : aucune erreur après les courbes et les chiffres', async () => {
    for (const url of ['/api/v1/admin/trends', '/api/v1/admin/stats']) {
      expect((await admin.inject(url)).statusCode).toBe(200);
    }
    // Un second envoi aurait lieu juste après la réponse : on lui laisse le temps de se produire.
    await new Promise((resolve) => setTimeout(resolve, 100));
    const errors = (await admin.inject('/api/v1/admin/errors')).json<AdminError[]>();
    expect(errors.filter((e) => e.message.includes('headers'))).toEqual([]);
  });

  it('message nettoyé : jamais les paramètres d’une requête SQL', () => {
    expect(cleanMessage('Failed query: select 1 where name = $1\nparams: Léa')).toBe(
      'Failed query: select 1 where name = $1',
    );
  });
});
