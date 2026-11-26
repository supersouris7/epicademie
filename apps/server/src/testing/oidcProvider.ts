import { createHash } from 'node:crypto';
import { exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose';

/**
 * Faux fournisseur d'identité des tests (OpenID Connect) : clés jetables, aucun appel réseau.
 * Chaque connexion décrit la personne et, au besoin, ce qui est faux dans son jeton.
 */

export const TEST_ISSUER = 'https://sso.test';
export const TEST_CLIENT = { clientId: 'epicademie-test', clientSecret: 'secret-client-oidc-de-test' };

export interface TestSignIn {
  readonly sub?: string;
  readonly name?: string;
  readonly groups?: readonly string[];
  /** Remplace des revendications de l'`id_token` (émetteur, audience, nonce, dates…). */
  readonly claims?: JWTPayload;
  /** Signature : clé publiée (défaut), clé inconnue, ou secret partagé (HS256). */
  readonly signature?: 'valide' | 'autre-cle' | 'hs256';
  /** Groupes servis par `userinfo` seulement, avec ce `sub` (défaut : le même). */
  readonly userinfo?: { readonly sub?: string };
}

export async function createTestOidc() {
  const published = await generateKeyPair('RS256');
  const unknown = await generateKeyPair('RS256');
  const jwk = { ...(await exportJWK(published.publicKey)), kid: 'test', alg: 'RS256', use: 'sig' };
  const codes = new Map<string, { person: TestSignIn; nonce: string; challenge: string }>();
  let issued = 0;

  const sign = ({ person, nonce }: { person: TestSignIn; nonce: string }) => {
    const identity = person.userinfo ? {} : { name: person.name ?? 'Camille Martin', groups: person.groups ?? [] };
    const now = Math.floor(Date.now() / 1000);
    const jwt = new SignJWT({
      iss: TEST_ISSUER,
      aud: TEST_CLIENT.clientId,
      sub: person.sub ?? 'sub-camille',
      nonce,
      iat: now,
      exp: now + 300,
      ...identity,
      ...person.claims,
    });
    if (person.signature === 'hs256') {
      return jwt.setProtectedHeader({ alg: 'HS256' }).sign(Buffer.from(TEST_CLIENT.clientSecret.padEnd(32, '.')));
    }
    const key = person.signature === 'autre-cle' ? unknown.privateKey : published.privateKey;
    return jwt.setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(key);
  };

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  let userinfo: unknown = null;

  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/.well-known/openid-configuration') {
      return json({
        issuer: TEST_ISSUER,
        authorization_endpoint: `${TEST_ISSUER}/authorize`,
        token_endpoint: `${TEST_ISSUER}/token`,
        jwks_uri: `${TEST_ISSUER}/jwks`,
        userinfo_endpoint: `${TEST_ISSUER}/userinfo`,
      });
    }
    if (url.pathname === '/jwks') return json({ keys: [jwk] });
    if (url.pathname === '/userinfo') return json(userinfo);
    const body = init?.body as URLSearchParams;
    const grant = codes.get(body.get('code') ?? '');
    codes.delete(body.get('code') ?? '');
    const basic = Buffer.from(`${TEST_CLIENT.clientId}:${TEST_CLIENT.clientSecret}`).toString('base64');
    const pkce = createHash('sha256')
      .update(body.get('code_verifier') ?? '')
      .digest('base64url');
    const authorization = new Headers(init?.headers).get('authorization');
    if (!grant || authorization !== `Basic ${basic}` || pkce !== grant.challenge) return json({}, 400);
    const { person } = grant;
    userinfo = {
      sub: person.userinfo?.sub ?? person.sub ?? 'sub-camille',
      name: person.name ?? 'Camille Martin',
      groups: person.groups ?? [],
    };
    return json({ id_token: await sign(grant), access_token: 'jeton-d-acces' });
  };

  return {
    fetcher,
    /** Ce que fait le fournisseur quand la personne s'identifie : un code lié à la demande reçue. */
    authorize(authorizationUrl: string, person: TestSignIn): { code: string; state: string } {
      const asked = new URL(authorizationUrl).searchParams;
      const code = `code-${++issued}`;
      codes.set(code, { person, nonce: asked.get('nonce') ?? '', challenge: asked.get('code_challenge') ?? '' });
      return { code, state: asked.get('state') ?? '' };
    },
  };
}
