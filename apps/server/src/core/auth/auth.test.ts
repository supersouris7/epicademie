import { describe, expect, it } from 'vitest';
import { readCookie, serializeCookie } from './cookies.ts';
import { dummyHash, hashPassword, verifyPassword } from './password.ts';
import { newToken, tokenHash } from './tokens.ts';

describe('mots de passe', () => {
  it('hash salé, vérifiable, jamais égal au mot de passe', async () => {
    const a = await hashPassword('correct horse battery');
    const b = await hashPassword('correct horse battery');
    expect(a).not.toBe(b);
    expect(a).not.toContain('correct');
    expect(a.startsWith('scrypt$32768$8$1$')).toBe(true);
    expect(await verifyPassword('correct horse battery', a)).toBe(true);
    expect(await verifyPassword('correct horse batterie', a)).toBe(false);
  });

  it('formes Unicode équivalentes acceptées ; hash illisible refusé', async () => {
    const h = await hashPassword('éléphant rose 42');
    expect(await verifyPassword('éléphant rose 42', h)).toBe(true);
    expect(await verifyPassword('x', 'bcrypt$abc')).toBe(false);
    expect(await verifyPassword('x', await dummyHash())).toBe(false);
  });
});

describe('jetons', () => {
  it('aléatoires, empreinte stable et différente du jeton', () => {
    const t = newToken();
    expect(t).toHaveLength(43);
    expect(newToken()).not.toBe(t);
    expect(tokenHash(t)).toBe(tokenHash(t));
    expect(tokenHash(t)).not.toBe(t);
  });
});

describe('cookies', () => {
  it('lit le bon cookie parmi plusieurs', () => {
    expect(readCookie('a=1; af_session=abc%3D; b=2', 'af_session')).toBe('abc=');
    expect(readCookie('a=1', 'af_session')).toBeNull();
    expect(readCookie(undefined, 'af_session')).toBeNull();
    expect(readCookie('af_session=%E0%A4%A', 'af_session')).toBeNull();
    expect(readCookie('sansvaleur; af_session=x', 'af_session')).toBe('x');
  });

  it('écrit un cookie HttpOnly SameSite, Secure en production', () => {
    expect(serializeCookie('s', 'v', { maxAge: 60, secure: true })).toBe(
      's=v; Path=/; HttpOnly; SameSite=Lax; Max-Age=60; Secure',
    );
    expect(serializeCookie('s', '', { maxAge: 0, secure: false })).not.toContain('Secure');
  });
});
