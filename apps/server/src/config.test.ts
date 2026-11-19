import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './config.ts';

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
    const c = loadConfig({ NODE_ENV: 'production', DATABASE_URL: 'postgres://u:p@h/db' });
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
});
