import { describe, expect, it } from 'vitest';
import { originAllowed } from './origin.ts';

describe('origine des connexions temps réel', () => {
  it('temps réel : même origine ou origines autorisées seulement', () => {
    const req = (origin: string | undefined, host = 'epicademie.lan') => ({ headers: { origin, host } });
    expect(originAllowed(req(undefined), null)).toBe(true);
    expect(originAllowed(req('https://epicademie.lan'), null)).toBe(true);
    expect(originAllowed(req('https://evil.example'), null)).toBe(false);
    expect(originAllowed(req('https://app.exemple.fr'), ['https://app.exemple.fr'])).toBe(true);
    expect(originAllowed(req('pas une url'), null)).toBe(false);
  });
});
