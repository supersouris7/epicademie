import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, customFetch, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';
import { z } from 'zod';

/**
 * Connexion de l'équipe par OpenID Connect (docs/adr/0036-…) : flux code + PKCE (S256) + `state` +
 * `nonce`, client confidentiel. L'`id_token` est vérifié (signature par les clés publiées, `iss`,
 * `aud`, `exp`, `iat`, `nonce`). Les groupes et le nom viennent du jeton ou, s'ils n'y sont pas
 * (réglage par défaut de certains fournisseurs), du point `userinfo` pour le même `sub`.
 */

export interface OidcOptions {
  readonly issuer: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  /** Appels HTTP sortants ; remplaçables en test (aucun appel réseau). */
  readonly fetcher?: typeof fetch;
}

/** Secrets d'une tentative de connexion : gardés dans un cookie court, comparés au retour. */
export interface OidcChallenge {
  readonly state: string;
  readonly nonce: string;
  readonly verifier: string;
}

export interface OidcIdentity {
  readonly sub: string;
  readonly name: string | null;
  readonly groups: readonly string[];
}

export class OidcError extends Error {}

const TIMEOUT_MS = 10_000;
const ALGORITHMS = ['RS256', 'PS256', 'ES256'];

const DiscoverySchema = z.object({
  issuer: z.string(),
  authorization_endpoint: z.url(),
  token_endpoint: z.url(),
  jwks_uri: z.url(),
  userinfo_endpoint: z.url().optional(),
});
const TokenResponseSchema = z.object({ id_token: z.string().min(10), access_token: z.string().optional() });
const profileShape = {
  name: z.string().optional(),
  preferred_username: z.string().optional(),
  groups: z.array(z.string()).optional(),
};
const ClaimsSchema = z.object({ sub: z.string().min(1), nonce: z.string(), ...profileShape });
const UserInfoSchema = z.object({ sub: z.string(), ...profileShape });

const random = () => randomBytes(32).toString('base64url');
/** Encodage `application/x-www-form-urlencoded` des identifiants du client (RFC 6749, § 2.3.1). */
const formEncode = (value: string) => new URLSearchParams({ v: value }).toString().slice(2);

type Discovery = z.infer<typeof DiscoverySchema> & { readonly keys: JWTVerifyGetKey };

export function createOidc(options: OidcOptions) {
  const fetcher = options.fetcher ?? fetch;
  /** Les points d'accès annoncés doivent être en HTTPS dès que l'émetteur l'est. */
  const secure = new URL(options.issuer).protocol === 'https:';
  let cached: Promise<Discovery> | null = null;

  const getJson = async (url: string, init?: RequestInit): Promise<unknown> => {
    const res = await fetcher(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new OidcError(`réponse HTTP ${res.status}`);
    return res.json();
  };

  async function load(): Promise<Discovery> {
    const base = options.issuer.replace(/\/+$/, '');
    const found = DiscoverySchema.parse(await getJson(`${base}/.well-known/openid-configuration`));
    if (found.issuer !== options.issuer) throw new OidcError('émetteur annoncé différent de OIDC_ISSUER');
    const endpoints = [found.authorization_endpoint, found.token_endpoint, found.jwks_uri, found.userinfo_endpoint];
    if (secure && endpoints.some((url) => url && !url.startsWith('https://'))) {
      throw new OidcError('point d’accès non chiffré');
    }
    return { ...found, keys: createRemoteJWKSet(new URL(found.jwks_uri), { [customFetch]: fetcher }) };
  }

  /** Découverte gardée en mémoire ; un échec n'est pas mémorisé. */
  const discovery = (): Promise<Discovery> => {
    cached ??= load().catch((err: unknown) => {
      cached = null;
      throw err instanceof OidcError ? err : new OidcError('fournisseur d’identité injoignable');
    });
    return cached;
  };

  async function exchange(provider: Discovery, code: string, c: OidcChallenge) {
    const basic = Buffer.from(`${formEncode(options.clientId)}:${formEncode(options.clientSecret)}`);
    const body = await getJson(provider.token_endpoint, {
      method: 'POST',
      headers: {
        authorization: `Basic ${basic.toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: options.redirectUri,
        code_verifier: c.verifier,
      }),
    });
    return TokenResponseSchema.parse(body);
  }

  async function verify(provider: Discovery, idToken: string, nonce: string) {
    const { payload }: { payload: JWTPayload } = await jwtVerify(idToken, provider.keys, {
      issuer: options.issuer,
      audience: options.clientId,
      algorithms: ALGORITHMS,
      requiredClaims: ['sub', 'exp', 'iat', 'nonce'],
      maxTokenAge: '10m',
      clockTolerance: 30,
    });
    // Jeton destiné à plusieurs clients : il doit avoir été émis pour nous.
    if (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== options.clientId) {
      throw new OidcError('jeton émis pour un autre client');
    }
    const claims = ClaimsSchema.parse(payload);
    if (claims.nonce !== nonce) throw new OidcError('nonce inattendu');
    return claims;
  }

  return {
    issuer: options.issuer,
    newChallenge: (): OidcChallenge => ({ state: random(), nonce: random(), verifier: random() }),

    async authorizationUrl(c: OidcChallenge): Promise<string> {
      const url = new URL((await discovery()).authorization_endpoint);
      for (const [key, value] of Object.entries({
        client_id: options.clientId,
        redirect_uri: options.redirectUri,
        response_type: 'code',
        scope: 'openid profile email groups',
        state: c.state,
        nonce: c.nonce,
        code_challenge: createHash('sha256').update(c.verifier).digest('base64url'),
        code_challenge_method: 'S256',
      }))
        url.searchParams.set(key, value);
      return url.toString();
    },

    /** Échange le code puis vérifie l'`id_token` ; lève `OidcError` au moindre doute. */
    async identify(code: string, c: OidcChallenge): Promise<OidcIdentity> {
      const provider = await discovery();
      try {
        const tokens = await exchange(provider, code, c);
        const claims = await verify(provider, tokens.id_token, c.nonce);
        let profile: z.infer<typeof UserInfoSchema> = claims;
        if (!claims.groups && provider.userinfo_endpoint && tokens.access_token) {
          profile = UserInfoSchema.parse(
            await getJson(provider.userinfo_endpoint, {
              headers: { authorization: `Bearer ${tokens.access_token}` },
            }),
          );
          if (profile.sub !== claims.sub) throw new OidcError('userinfo d’un autre compte');
        }
        return {
          sub: claims.sub,
          name: profile.name ?? profile.preferred_username ?? null,
          groups: profile.groups ?? [],
        };
      } catch (err) {
        // Motif technique seulement : ni jeton, ni contenu.
        throw err instanceof OidcError ? err : new OidcError('échange ou jeton invalide');
      }
    },
  };
}

export type Oidc = ReturnType<typeof createOidc>;
