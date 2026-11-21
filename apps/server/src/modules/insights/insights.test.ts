import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import type { WeakSkillStat, AdminError, AdminStats, Anomaly, Profile } from '@questeo/shared';
import { attempts, profiles, sessions } from '../../db/schema.ts';
import { createTestApp, profileInput, TEST_PASSWORD } from '../../testing/harness.ts';
import { setAccountRole } from '../accounts/index.ts';
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
  const account = await t.signup('admin@questeo.test');
  await setAccountRole(t.database.db, 'admin@questeo.test', 'admin');
  admin = t.as(account.cookie);
  // Session d'administration : mot de passe redemandé à l'ouverture.
  await admin.inject({ method: 'POST', url: '/api/v1/auth/admin', payload: { password: TEST_PASSWORD } });
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
  it('session d’administration : compte admin et mot de passe redemandé', async () => {
    const other = await t.signup('autre-admin@questeo.test');
    await setAccountRole(t.database.db, 'autre-admin@questeo.test', 'admin');
    const c = t.as(other.cookie);
    // Compte admin, mais session d'administration pas encore ouverte : refusé.
    expect((await c.inject('/api/v1/admin/stats')).statusCode).toBe(403);
    expect(
      (await c.inject({ method: 'POST', url: '/api/v1/auth/admin', payload: { password: 'mauvais' } })).statusCode,
    ).toBe(401);
    await c.inject({ method: 'POST', url: '/api/v1/auth/admin', payload: { password: TEST_PASSWORD } });
    expect((await c.inject('/api/v1/admin/stats')).statusCode).toBe(200);
    // Un parent non admin ne peut pas ouvrir de session d'administration.
    expect(
      (await t.http.inject({ method: 'POST', url: '/api/v1/auth/admin', payload: { password: TEST_PASSWORD } }))
        .statusCode,
    ).toBe(403);
    await c.inject({ method: 'POST', url: '/api/v1/auth/admin/close' });
    expect((await c.inject('/api/v1/admin/stats')).statusCode).toBe(403);
  });

  it('réservé à l’administration', async () => {
    for (const url of [
      '/api/v1/admin/stats',
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
      families: 2,
      profiles: 1,
      activeProfiles7d: 1,
      finishedSeries7d: 1,
      answers7d: 2,
      autonomousRate7d: 0.5,
      answersBySubject7d: [{ subject: 'maths', answers: 2 }],
      premiumFamilies: 1,
    });
    expect(res.body).not.toContain(profile.name);
    expect(res.body).not.toContain('@');
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

  it('message nettoyé : jamais les paramètres d’une requête SQL', () => {
    expect(cleanMessage('Failed query: select 1 where name = $1\nparams: Léa')).toBe(
      'Failed query: select 1 where name = $1',
    );
  });
});
