import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { z } from 'zod';

/**
 * « Continuer avec Google » : OpenID Connect, flux code + PKCE (S256) + `state` + `nonce`.
 * L'`id_token` est vérifié (signature par les clés publiques de Google, `iss`, `aud`, `exp`, `nonce`)
 * et l'adresse doit être vérifiée par Google. Aucune donnée n'est envoyée à Google en dehors de
 * l'échange standard ; seuls `sub` et `email` sont lus.
 */
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

export interface GoogleOptions {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  readonly fetcher?: typeof fetch;
  /** Clés publiques de Google ; remplaçables en test (jamais d'appel réseau réel). */
  readonly keys?: JWTVerifyGetKey;
}

/** Secrets d'une tentative de connexion : gardés dans un cookie court, comparés au retour. */
export interface GoogleChallenge {
  readonly state: string;
  readonly nonce: string;
  readonly verifier: string;
}

export interface GoogleIdentity {
  readonly sub: string;
  readonly email: string;
}

export class GoogleError extends Error {}

const TokenResponseSchema = z.object({ id_token: z.string().min(10) });
const ClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.string().min(3),
  email_verified: z.union([z.boolean(), z.literal('true')]),
  nonce: z.string(),
});

const random = () => randomBytes(32).toString('base64url');

export function createGoogle(options: GoogleOptions) {
  const fetcher = options.fetcher ?? fetch;
  const keys = options.keys ?? createRemoteJWKSet(new URL(JWKS_URL));
  return {
    newChallenge: (): GoogleChallenge => ({ state: random(), nonce: random(), verifier: random() }),

    authorizationUrl(c: GoogleChallenge): string {
      const url = new URL(AUTH_URL);
      url.search = new URLSearchParams({
        client_id: options.clientId,
        redirect_uri: options.redirectUri,
        response_type: 'code',
        scope: 'openid email',
        state: c.state,
        nonce: c.nonce,
        code_challenge: createHash('sha256').update(c.verifier).digest('base64url'),
        code_challenge_method: 'S256',
        prompt: 'select_account',
      }).toString();
      return url.toString();
    },

    /** Échange le code puis vérifie l'`id_token` ; lève `GoogleError` au moindre doute. */
    async identify(code: string, c: GoogleChallenge): Promise<GoogleIdentity> {
      let idToken: string;
      try {
        const res = await fetcher(TOKEN_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: options.clientId,
            client_secret: options.clientSecret,
            redirect_uri: options.redirectUri,
            grant_type: 'authorization_code',
            code_verifier: c.verifier,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) throw new GoogleError(`échange refusé (HTTP ${res.status})`);
        idToken = TokenResponseSchema.parse(await res.json()).id_token;
      } catch (err) {
        throw err instanceof GoogleError ? err : new GoogleError('échange du code impossible');
      }
      let claims: z.infer<typeof ClaimsSchema>;
      try {
        const { payload } = await jwtVerify(idToken, keys, {
          issuer: ISSUERS,
          audience: options.clientId,
          algorithms: ['RS256'],
        });
        claims = ClaimsSchema.parse(payload);
      } catch {
        throw new GoogleError('id_token invalide');
      }
      if (claims.nonce !== c.nonce) throw new GoogleError('nonce inattendu');
      if (claims.email_verified !== true && claims.email_verified !== 'true') {
        throw new GoogleError('adresse non vérifiée par Google');
      }
      return { sub: claims.sub, email: claims.email.trim().toLowerCase() };
    },
  };
}

export type Google = ReturnType<typeof createGoogle>;
