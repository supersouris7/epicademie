import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Profile, Report } from '@questeo/shared';
import { createTestApp, profileInput, TEST_PASSWORD } from '../../testing/harness.ts';
import { runReports } from '../../cli/reports.ts';
import { setAccountRole } from '../accounts/index.ts';

let t: Awaited<ReturnType<typeof createTestApp>>;
let profileId: string;
let admin: ReturnType<typeof t.as>;

beforeAll(async () => {
  t = await createTestApp({ today: '2026-11-22' });
});
afterAll(() => t.close());
beforeEach(async () => {
  await t.reset();
  const created = await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Léa') });
  profileId = created.json<Profile>().id;
  const account = await t.signup('admin@questeo.test');
  await setAccountRole(t.database.db, 'admin@questeo.test', 'admin');
  admin = t.as(account.cookie);
  await admin.inject({ method: 'POST', url: '/api/v1/auth/admin', payload: { password: TEST_PASSWORD } });
});

const general = (over: object = {}, client = t.http) =>
  client.inject({
    method: 'POST',
    url: '/api/v1/reports/general',
    payload: { reason: 'bug', screen: '/hub', appVersion: '1.2.3', ...over },
  });
const question = (over: object = {}) =>
  t.http.inject({
    method: 'POST',
    url: '/api/v1/reports',
    payload: { profileId, skillId: 'm5-tables', level: 1, seed: 4, reason: 'mauvaise-reponse', ...over },
  });
const clientError = (over: object = {}) =>
  t.http.inject({
    method: 'POST',
    url: '/api/v1/telemetry/errors',
    headers: { cookie: '' },
    payload: { message: 'Boom', path: '/hub', release: 'v1', ...over },
  });
const adminList = async () => (await admin.inject('/api/v1/admin/reports/nouveau')).json<Report[]>();
const exported = async () =>
  JSON.parse(await runReports(t.database, ['export'], new Date('2026-11-22T10:00:00Z'))) as {
    reports: { ids: string[]; count: number; kind: string; comments: string[]; [k: string]: unknown }[];
    errors: { id: string; count: number; message: string; [k: string]: unknown }[];
  };

describe('signalement général', () => {
  it('est enregistré avec écran normalisé et version, et visible dans la vue admin', async () => {
    const res = await general({ screen: '/boss/3f2b1c9e-1111-4222-8333-444455556666?x=1', comment: 'plus de son' });
    expect(res.statusCode).toBe(201);
    expect(await adminList()).toEqual([
      expect.objectContaining({
        kind: 'general',
        reason: 'bug',
        skillId: null,
        screen: '/boss/:id',
        appVersion: '1.2.3',
        comment: 'plus de son',
      }),
    ]);
  });

  it('refus : motif réservé aux questions, anonyme sans session', async () => {
    expect((await general({ reason: 'mauvaise-reponse' })).statusCode).toBe(400);
    expect((await general({}, t.as(''))).statusCode).toBe(401);
  });
});

describe('anonymisation du commentaire', () => {
  it('masque e-mail, téléphone, lien et prénoms de la famille, sans jamais exposer d’identifiant', async () => {
    await t.http.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Zoé') });
    const comment = 'Léa et zoe ne voient rien. Mail: papa@mail.fr, tel 06 12 34 56 78, https://a.fr/x';
    await general({ comment });
    await question({ comment });
    const list = await adminList();
    expect(list).toHaveLength(2);
    for (const r of list) {
      expect(r.comment).toBe('[masqué] et [masqué] ne voient rien. Mail: [masqué], tel [masqué], [masqué]');
      expect(JSON.stringify(r)).not.toMatch(new RegExp(profileId));
    }
  });

  it('ne masque que les prénoms de la famille de l’auteur', async () => {
    const other = await t.signup('voisin@famille.test');
    const client = t.as(other.cookie);
    await client.inject({ method: 'POST', url: '/api/v1/profiles', payload: profileInput('Hugo') });
    await general({ comment: 'Hugo et Léa' }, client);
    expect((await adminList())[0]?.comment).toBe('[masqué] et Léa');
  });
});

describe('erreurs techniques agrégées', () => {
  it('regroupées par empreinte avec compteur ; identifiants et nombres normalisés', async () => {
    const stack = (line: number) => `Error: x\n    at f (https://q.lan/a.js:${line}:9)`;
    await clientError({ message: 'Échec 12 pour jean@x.fr', stack: stack(10) });
    await clientError({ message: 'Échec 99 pour marie@y.fr', stack: stack(20) });
    await clientError({ message: 'Échec 99 pour marie@y.fr', stack: stack(20), release: 'v2' });
    const { errors } = await exported();
    expect(errors.map((e) => [e.message, e.count]).sort()).toEqual([
      ['Échec <n> pour [masqué]', 1],
      ['Échec <n> pour [masqué]', 2],
    ]);
    expect(JSON.stringify(errors)).not.toMatch(/jean|marie/);
  });
});

describe('export en ligne de commande', () => {
  it('fusionne les doublons, anonymise, puis ne ressort plus après marquage', async () => {
    await question({ comment: 'faux' });
    await question({ comment: 'faux' });
    await question({ seed: 9 });
    await general({ comment: 'écran noir' });
    await general({ comment: 'écran noir' });
    await clientError();
    const out = await exported();
    expect(out.reports).toHaveLength(3);
    const q = out.reports.find((r) => r.kind === 'question' && r.count === 2);
    expect(q).toMatchObject({
      reason: 'mauvaise-reponse',
      question: { skillId: 'm5-tables', level: 1, seed: 4, version: 1 },
      comments: ['faux'],
    });
    expect(out.reports.find((r) => r.kind === 'general')).toMatchObject({
      count: 2,
      screen: '/hub',
      appVersion: '1.2.3',
    });
    const text = JSON.stringify(out);
    expect(text).not.toContain(profileId);
    expect(text).not.toContain('familyId');
    expect(text).not.toContain('Léa');

    const ids = [...out.reports.flatMap((r) => r.ids), ...out.errors.map((e) => e.id)];
    const done = await runReports(t.database, ['mark-exported', ...ids]);
    expect(done).toBe('5 signalement(s) et 1 erreur(s) marqué(s) comme exporté(s).');
    expect(await exported()).toMatchObject({ reports: [], errors: [] });
    // Un nouveau signalement reste exportable.
    await general({ reason: 'son' });
    expect((await exported()).reports).toHaveLength(1);
  });

  it('refuse une commande inconnue', async () => {
    await expect(runReports(t.database, ['supprimer'])).rejects.toThrow(/Usage/);
    await expect(runReports(t.database, ['mark-exported'])).rejects.toThrow(/Usage/);
  });
});
