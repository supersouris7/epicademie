import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api } from '@epicademie/shared';
import { createTestApp, profileInput } from './testing/harness.ts';

/** Comportements transverses : système, erreurs, sécurité, observabilité, documentation. */

let t: Awaited<ReturnType<typeof createTestApp>>;
beforeAll(async () => {
  t = await createTestApp({ config: { metricsToken: 'jeton-de-test-0123456789' } });
});
afterAll(() => t.close());

describe('routes d’exploitation', () => {
  it('santé et disponibilité (base joignable)', async () => {
    expect((await t.http.inject('/api/health')).json()).toEqual({ status: 'ok', version: 'test' });
    expect((await t.http.inject('/api/ready')).json()).toEqual({ status: 'ok', version: 'test' });
  });

  it('URL publique et présence (versionnées)', async () => {
    expect((await t.http.inject('/api/v1/network')).json()).toEqual({ publicUrl: 'http://test:3000' });
    expect((await t.http.inject('/api/v1/presence')).json()).toEqual({ online: [] });
  });

  it('métriques Prometheus protégées par jeton', async () => {
    expect((await t.http.inject('/api/metrics')).statusCode).toBe(401);
    await t.http.inject('/api/v1/profiles');
    const res = await t.http.inject({
      url: '/api/metrics',
      headers: { authorization: 'Bearer jeton-de-test-0123456789' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('epicademie_http_request_duration_seconds');
    // Route paramétrée, jamais l'URL brute (pas d'identifiant dans les métriques).
    expect(res.body).toContain('route="/api/v1/profiles"');
    expect(res.body).toContain('epicademie_online_players');
  });
});

describe('front buildé', () => {
  const webDir = fs.mkdtempSync(path.join(os.tmpdir(), 'web-'));
  let web: Awaited<ReturnType<typeof createTestApp>>;
  beforeAll(async () => {
    fs.writeFileSync(path.join(webDir, 'index.html'), 'jeu');
    fs.writeFileSync(path.join(webDir, 'admin.html'), 'console');
    web = await createTestApp({ config: { webDir } });
  });
  afterAll(async () => {
    await web.close();
    fs.rmSync(webDir, { recursive: true, force: true });
  });

  it.each(['/admin', '/admin/', '/admin/x', '/admin/x/y', '/admin?onglet=1', '/admin.html'])(
    '%s : la console, jamais mise en cache',
    async (url) => {
      const res = await web.http.inject(url);
      expect(res.statusCode).toBe(200);
      expect(res.body).toBe('console');
      expect(res.headers['cache-control']).toBe('no-cache');
    },
  );

  it.each(['/', '/hub', '/administration', '/jouer/admin'])('%s : le jeu', async (url) => {
    const res = await web.http.inject(url);
    expect(res.body).toBe('jeu');
    expect(res.headers['cache-control']).toBe('no-cache');
  });

  it('API inconnue : toujours 404', async () => {
    expect((await web.http.inject('/api/v1/admin/inconnue')).statusCode).toBe(404);
  });
});

describe('erreurs', () => {
  it('route inconnue : 404 au format commun, avec identifiant de requête', async () => {
    const res = await t.http.inject('/api/v1/inconnue');
    expect(res.statusCode).toBe(404);
    const body = res.json<{ code: string; error: string; requestId: string }>();
    expect(body).toMatchObject({ code: 'NOT_FOUND', error: 'Route inconnue' });
    expect(res.headers['x-request-id']).toBe(body.requestId);
  });

  it('reprend l’identifiant de requête fourni par le proxy', async () => {
    const res = await t.http.inject({ url: '/api/health', headers: { 'x-request-id': 'req-123' } });
    expect(res.headers['x-request-id']).toBe('req-123');
  });

  it('JSON illisible et corps trop gros : 400 et 413', async () => {
    const bad = await t.http.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      headers: { 'content-type': 'application/json' },
      payload: '{pas du json',
    });
    expect(bad.statusCode).toBe(400);
    expect(bad.json()).toMatchObject({ code: 'BAD_REQUEST' });
    const big = await t.http.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: { ...profileInput(), name: 'x'.repeat(100_000) },
    });
    expect(big.statusCode).toBe(413);
    expect(big.json()).toMatchObject({ code: 'PAYLOAD_TOO_LARGE' });
  });

  it('message de validation lisible (champ en cause)', async () => {
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/profiles',
      payload: { ...profileInput(), name: '' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json<{ error: string }>().error).toMatch(/name/);
  });
});

describe('sécurité', () => {
  it('en-têtes de sécurité et politique de contenu stricte', async () => {
    const res = await t.http.inject('/api/health');
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toMatch(/script-src 'self'(;|$)/);
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(res.headers['permissions-policy']).toContain('camera=()');
    // Réseau local en HTTP : pas de HSTS.
    expect(res.headers['strict-transport-security']).toBeUndefined();
  });

  it('HSTS actif derrière HTTPS (cookies Secure)', async () => {
    const secure = await createTestApp({ config: { cookieSecure: true } });
    try {
      const res = await secure.http.inject('/api/health');
      expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
    } finally {
      await secure.close();
    }
  });

  it('limite le débit par IP', async () => {
    const limited = await createTestApp({ config: { rateLimitMax: 10 } });
    try {
      const codes: number[] = [];
      for (let i = 0; i < 12; i++) codes.push((await limited.http.inject('/api/v1/profiles')).statusCode);
      expect(codes.slice(0, 10).every((c) => c === 200)).toBe(true);
      const res = await limited.http.inject('/api/v1/profiles');
      expect(res.statusCode).toBe(429);
      expect(res.json()).toMatchObject({ code: 'RATE_LIMITED' });
      // Les sondes ne sont jamais limitées.
      expect((await limited.http.inject('/api/health')).statusCode).toBe(200);
    } finally {
      await limited.close();
    }
  });
});

describe('télémétrie', () => {
  it('reçoit les erreurs du navigateur', async () => {
    const res = await t.http.inject({
      method: 'POST',
      url: '/api/v1/telemetry/errors',
      payload: { message: 'boum', path: '/hub', release: 'test' },
    });
    expect(res.statusCode).toBe(204);
  });
});

describe('documentation OpenAPI', () => {
  it('décrit chaque point d’accès du contrat', async () => {
    const spec = (await t.http.inject('/api/openapi.json')).json<{ paths: Record<string, Record<string, unknown>> }>();
    for (const e of Object.values(api)) {
      const path = `/api/v1${e.path.replace(/:(\w+)/g, '{$1}')}`;
      expect(spec.paths[path]?.[e.method.toLowerCase()], `${e.method} ${path}`).toBeDefined();
    }
  });
});

describe('bug serveur', () => {
  it('exception inattendue : 500 neutre, sans détail interne', async () => {
    const own = await createTestApp({
      routes: (http) =>
        http.get('/api/v1/boum', () => {
          throw new Error('secret interne : mot de passe');
        }),
    });
    try {
      const res = await own.http.inject('/api/v1/boum');
      expect(res.statusCode).toBe(500);
      expect(res.json()).toMatchObject({ code: 'INTERNAL', error: 'Oups, le serveur a rencontré un problème.' });
      expect(res.body).not.toContain('secret');
    } finally {
      await own.close();
    }
  });
});
