import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { battlePools } from '@questeo/content';
import type { ContentSkill, Profile, Report } from '@questeo/shared';
import { createTestApp, profileInput } from '../../testing/harness.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let profileId: string;
let admin: ReturnType<typeof t.as>;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-20' });
});
afterAll(() => t.close());
beforeEach(async () => {
  await t.reset();
  profileId = (
    await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput() })
  ).json<Profile>().id;
  admin = t.operator();
});

const report = (over: object = {}) =>
  t.http.inject({
    method: 'POST',
    url: '/api/v1/reports',
    payload: { profileId, skillId: 'm5-tables', level: 1, seed: 4, reason: 'mauvaise-reponse', ...over },
  });

describe('signalements des familles', () => {
  it('une famille signale une question ; l’administration la voit avec la version de la notion', async () => {
    const res = await report({ comment: '  6 × 7 = 42, pas 43  ' });
    expect(res.statusCode).toBe(201);
    const list = (await admin.inject('/api/v1/admin/reports/nouveau')).json<Report[]>();
    expect(list).toEqual([
      expect.objectContaining({
        skillId: 'm5-tables',
        level: 1,
        seed: 4,
        skillVersion: 1,
        reason: 'mauvaise-reponse',
        comment: '6 × 7 = 42, pas 43',
        status: 'nouveau',
      }),
    ]);
  });

  it('refus : notion inconnue, profil d’une autre famille, motif inconnu', async () => {
    expect((await report({ skillId: 'inconnue' })).statusCode).toBe(400);
    expect((await report({ reason: 'insulte' })).statusCode).toBe(400);
    const other = await t.signup('voisin@famille.test');
    const res = await t.as(other.cookie).inject({
      method: 'POST',
      url: '/api/v1/reports',
      payload: { profileId, skillId: 'm5-tables', level: 1, seed: 4, reason: 'ambigue' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('traitement : en cours, puis résolu avec une note ; date de résolution posée', async () => {
    const { id } = (await report()).json<{ id: string }>();
    const patch = (payload: object) => admin.inject({ method: 'PATCH', url: `/api/v1/admin/reports/${id}`, payload });
    expect((await patch({ status: 'en-cours' })).json<Report>()).toMatchObject({
      status: 'en-cours',
      resolvedAt: null,
    });
    const done = (await patch({ status: 'resolu', adminNote: 'Corrigé en version 2' })).json<Report>();
    expect(done).toMatchObject({ status: 'resolu', adminNote: 'Corrigé en version 2' });
    expect(done.resolvedAt).not.toBeNull();
    expect((await admin.inject('/api/v1/admin/reports/nouveau')).json()).toEqual([]);
  });

  it('l’administration est réservée à l’opérateur', async () => {
    for (const url of ['/api/v1/admin/reports/nouveau', '/api/v1/admin/content']) {
      expect((await t.http.inject(url)).statusCode).toBe(403);
    }
    expect((await t.http.inject({ url: '/api/v1/admin/content', headers: { cookie: '' } })).statusCode).toBe(403);
  });
});

describe('état des notions et désactivation', () => {
  const content = async () => (await admin.inject('/api/v1/admin/content')).json<ContentSkill[]>();
  const update = (skillId: string, payload: object) =>
    admin.inject({ method: 'PUT', url: `/api/v1/admin/content/${skillId}`, payload });

  it('toutes les notions, avec leur état : contrôles réussis, puis signalée, puis relue', async () => {
    const all = await content();
    expect(all.length).toBeGreaterThan(500);
    const tables = all.find((c) => c.skillId === 'm5-tables');
    expect(tables).toMatchObject({ state: 'validee-auto', version: 1, subject: 'maths', grade: '5e', boss: false });
    expect(tables?.source).toMatch(/programme|BO/i);
    expect(all.filter((c) => c.autoIssues.length > 0)).toEqual([]);

    await report();
    expect((await content()).find((c) => c.skillId === 'm5-tables')?.state).toBe('signalee');
    const reviewed = (await update('m5-tables', { reviewed: true, note: 'Relu le 20/11' })).json<ContentSkill>();
    expect(reviewed).toMatchObject({ reviewedVersion: 1, state: 'signalee' });
  });

  it('notion désactivée : plus proposée à l’entraînement, historique conservé, puis réactivée', async () => {
    expect((await update('m5-tables', { disabled: true, note: 'Réponse fausse au niveau 3' })).json()).toMatchObject({
      disabled: true,
      state: 'desactivee',
    });
    expect((await t.http.inject('/api/v1/content/disabled')).json()).toEqual({ skills: ['m5-tables'] });
    const start = await t.http.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { profileId, mode: 'entrainement', subject: 'maths', chapterId: 'm5-calcul', skillId: 'm5-tables' },
    });
    expect(start.statusCode).toBe(409);

    await update('m5-tables', { disabled: false });
    expect((await t.http.inject('/api/v1/content/disabled')).json()).toEqual({ skills: [] });
    const history = (await admin.inject('/api/v1/admin/content/m5-tables/history')).json<{ action: string }[]>();
    expect(history.map((h) => h.action)).toEqual(['reactivation', 'desactivation']);
  });

  it('combat : questions désactivées écartées ; plus aucun piège disponible : boss en maintenance', async () => {
    const pools = battlePools('m5-relatifs');
    if (!pools) throw new Error('boss attendu');
    for (const trap of pools.traps) await update(trap, { disabled: true });
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/battles',
      payload: { profileId, chapterId: 'm5-relatifs' },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json<{ error: string }>().error).toMatch(/maintenance/);
    await update(pools.traps[0] ?? '', { disabled: false });
    const ok = await t.http.inject({
      method: 'POST',
      url: '/api/v1/battles',
      payload: { profileId, chapterId: 'm5-relatifs' },
    });
    expect(ok.statusCode).toBe(201);
  });

  it('notion inconnue : 404', async () => {
    expect((await update('inconnue', { disabled: true })).statusCode).toBe(404);
  });
});
