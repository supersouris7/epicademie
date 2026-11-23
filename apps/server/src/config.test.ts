import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './config.ts';

const PROD = { NODE_ENV: 'production', BREVO_API_KEY: 'xkeysib-test-0000', MAIL_FROM: 'noreply@exemple.fr' };

describe('configuration', () => {
  it('valeurs par défaut de développement : base embarquée sur disque, documentation active', () => {
    const c = loadConfig({});
    expect(c.env).toBe('development');
    expect(c.port).toBe(3000);
    expect(c.databaseUrl).toMatch(/^pglite:\/\/.*data\/pglite$/);
    expect(c.apiDocs).toBe(true);
    expect(c.webDir).toBeNull();
    expect(c.corsOrigins).toBeNull();
  });

  it('production : base obligatoire, front servi, documentation coupée', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(ConfigError);
    const c = loadConfig({ ...PROD, DATABASE_URL: 'postgres://u:p@h/db' });
    expect(c.webDir).toMatch(/web\/dist$/);
    expect(c.apiDocs).toBe(false);
  });

  it('ignore les variables vides et découpe les listes', () => {
    const c = loadConfig({ METRICS_TOKEN: '', PUBLIC_URL: '  ', CORS_ORIGINS: 'https://a.fr, https://b.fr' });
    expect(c.metricsToken).toBeNull();
    expect(c.publicUrl).toBeNull();
    expect(c.corsOrigins).toEqual(['https://a.fr', 'https://b.fr']);
  });

  it('refuse une valeur invalide avec un message clair', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(/PORT/);
    expect(() => loadConfig({ METRICS_TOKEN: 'court' })).toThrow(/METRICS_TOKEN/);
  });

  it('e-mails : production sans clé Brevo refusée, recette (APP_ENV) en simulation', () => {
    const base = { NODE_ENV: 'production', DATABASE_URL: 'postgres://u:p@h/db' };
    expect(() => loadConfig(base)).toThrow(/BREVO_API_KEY/);
    expect(() => loadConfig({ ...base, BREVO_API_KEY: 'xkeysib-test-0000' })).toThrow(/MAIL_FROM/);
    expect(() => loadConfig({ ...base, APP_ENV: 'production' })).toThrow(/BREVO_API_KEY/);
    const recette = loadConfig({ ...base, APP_ENV: 'recette' });
    expect(recette.mail).toMatchObject({ production: false, brevoApiKey: null });
    expect(loadConfig({ ...base, ...PROD }).mail).toMatchObject({ production: true, brevoApiKey: 'xkeysib-test-0000' });
    expect(loadConfig({}).mail.production).toBe(false);
  });

  it('Google : actif seulement avec identifiant ET secret ; retour par défaut sous PUBLIC_URL', () => {
    expect(loadConfig({ GOOGLE_CLIENT_ID: 'id-google' }).google).toBeNull();
    const g = loadConfig({
      GOOGLE_CLIENT_ID: 'id-google',
      GOOGLE_CLIENT_SECRET: 'secret-google',
      PUBLIC_URL: 'https://a.fr/',
    });
    expect(g.google).toEqual({
      clientId: 'id-google',
      clientSecret: 'secret-google',
      redirectUri: 'https://a.fr/api/v1/auth/google/callback',
    });
  });
});
