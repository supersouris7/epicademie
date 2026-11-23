import { describe, expect, it, vi } from 'vitest';
import { brevoMailer, maskEmail, parseSender, simulationMailer } from './mailer.ts';

describe('mailer', () => {
  it('Brevo : API HTTP transactionnelle, clé en en-tête, expéditeur analysé', async () => {
    const fetcher = vi.fn(async () => new Response('{}', { status: 201 }));
    await brevoMailer({ apiKey: 'xkeysib-secret', from: 'Academy Fighters <noreply@exemple.fr>', fetcher }).send({
      to: 'parent@exemple.fr',
      subject: 'Sujet',
      text: 'Corps',
    });
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init.headers as Record<string, string>)['api-key']).toBe('xkeysib-secret');
    expect(JSON.parse(init.body as string)).toEqual({
      sender: { name: 'Academy Fighters', email: 'noreply@exemple.fr' },
      to: [{ email: 'parent@exemple.fr' }],
      subject: 'Sujet',
      textContent: 'Corps',
    });
  });

  it('Brevo : un refus lève une erreur sans adresse ni contenu', async () => {
    const fetcher = vi.fn(async () => new Response('refusé', { status: 401 }));
    const send = brevoMailer({ apiKey: 'xkeysib-secret', from: 'noreply@exemple.fr', fetcher }).send({
      to: 'parent@exemple.fr',
      subject: 'Sujet',
      text: 'jeton-secret',
    });
    await expect(send).rejects.toThrow('HTTP 401');
    await expect(send).rejects.not.toThrow(/parent@|jeton-secret|xkeysib/);
  });

  it('expéditeur : avec ou sans nom', () => {
    expect(parseSender('noreply@exemple.fr')).toEqual({ email: 'noreply@exemple.fr' });
    expect(parseSender('A B <a@b.fr>')).toEqual({ name: 'A B', email: 'a@b.fr' });
  });

  it('simulation : seul le lien est journalisé (niveau info), aucune adresse', async () => {
    const info = vi.fn();
    await simulationMailer({ info } as never).send({
      to: 'parent@exemple.fr',
      subject: 'Sujet',
      text: 'Bonjour parent@exemple.fr',
      link: 'http://x/lien?jeton=abc',
    });
    expect(info).toHaveBeenCalledWith({ link: 'http://x/lien?jeton=abc' }, expect.any(String));
    expect(JSON.stringify(info.mock.calls)).not.toContain('parent@');
    expect(maskEmail('lea@exemple.fr')).toBe('l***@exemple.fr');
  });
});
