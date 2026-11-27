import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@epicademie/shared';
import { ApiError, request } from './client.ts';

const reply = (status: number, body?: unknown) =>
  vi.fn().mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }));

afterEach(() => vi.unstubAllGlobals());

describe('client HTTP typé par le contrat', () => {
  it('construit l’URL versionnée, encode les paramètres et envoie le corps en JSON', async () => {
    const fetch = reply(200, { correct: true, invalid: false, xp: 10 });
    vi.stubGlobal('fetch', fetch);
    const body = {
      skillId: 'm5-tables',
      level: 1 as const,
      seed: 1,
      variant: false,
      response: { kind: 'number' as const, text: '42' },
      durationMs: 1000,
    };
    const res = await request(api.answerSession, { params: { id: 'a b' }, body });
    expect(res.correct).toBe(true);
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/sessions/a%20b/answers');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(body);
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('clé d’idempotence envoyée dans l’en-tête Idempotency-Key', async () => {
    const fetch = reply(200, { coins: 0, rubies: 0, inventory: { bouclier: 1, soin: 0, indice: 0 } });
    vi.stubGlobal('fetch', fetch);
    await request(api.buy, {
      body: { profileId: '11111111-1111-4111-8111-111111111111', item: 'bouclier' },
      idempotencyKey: 'achat-1234',
    });
    const [, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ 'Idempotency-Key': 'achat-1234' });
  });

  it('réponse 204 : aucune donnée', async () => {
    vi.stubGlobal('fetch', reply(204));
    await expect(request(api.deleteProfile, { params: { id: 'x' } })).resolves.toBeUndefined();
  });

  it('erreur du serveur : code, message affichable et identifiant de requête', async () => {
    vi.stubGlobal('fetch', reply(409, { code: 'CONFLICT', error: 'Partie terminée', requestId: 'r-1' }));
    const err = await request(api.finishSession, { params: { id: 'x' } }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'CONFLICT', message: 'Partie terminée', requestId: 'r-1' });
  });

  it('serveur qui redémarre (502 du relais) : message clair pour l’enfant', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })));
    await expect(request(api.listProfiles)).rejects.toMatchObject({
      status: 502,
      message: 'Le serveur redémarre. Patiente un instant, puis réessaie.',
    });
  });

  it('corps d’erreur illisible : message générique', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 500 })));
    await expect(request(api.listProfiles)).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL',
      message: 'Erreur 500',
    });
  });

  it('réseau coupé : erreur NETWORK explicite', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(request(api.listProfiles)).rejects.toMatchObject({ status: 0, code: 'NETWORK' });
  });
});
