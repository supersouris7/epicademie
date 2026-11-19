import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('suivi d’erreurs du navigateur', () => {
  it('envoie message, pile et chemin (sans paramètres), au plus 10 fois par page', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    const { reportError } = await import('./telemetry.ts');
    reportError(new Error('boum'), 'composant');
    await Promise.resolve();
    const [url, init] = fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/telemetry/errors');
    const body = JSON.parse(init.body as string) as { message: string; stack: string; path: string };
    expect(body.message).toBe('boum');
    expect(body.stack).toContain('composant');
    expect(body.path).toBe(window.location.pathname);
    for (let i = 0; i < 20; i++) reportError('encore');
    expect(fetch).toHaveBeenCalledTimes(10);
  });

  it('une panne du serveur de suivi ne casse rien', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('hors ligne')));
    const { reportError } = await import('./telemetry.ts');
    expect(() => reportError('x')).not.toThrow();
  });

  it('branche les erreurs globales', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    const { installErrorReporting } = await import('./telemetry.ts');
    installErrorReporting();
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('globale'), message: 'globale' }));
    expect(fetch).toHaveBeenCalled();
  });
});
