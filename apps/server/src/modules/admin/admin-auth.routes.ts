import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { api } from '@epicademie/shared';
import { readCookie, serializeCookie } from '../../core/auth/cookies.ts';
import { AppError } from '../../core/errors.ts';
import { ADMIN_COOKIE, onAdminOrigin } from '../../core/http/auth.ts';
import { route } from '../../core/http/route.ts';
import { ADMIN_SESSION_MS, type AdminAuthService } from './admin-auth.service.ts';
import type { Oidc, OidcChallenge } from './oidc.ts';

/** Cookie de la connexion en cours (state, nonce, vérificateur PKCE) : 10 minutes, HttpOnly. */
export const CHALLENGE_COOKIE = '__Host-epicademie_oidc';
const CHALLENGE_SECONDS = 600;
// Préfixe __Host- : toujours Secure (accepté aussi par les navigateurs sur http://localhost).
const cookie = (name: string, value: string, maxAge: number) => serializeCookie(name, value, { secure: true, maxAge });

export interface AdminSso {
  readonly oidc: Oidc;
  readonly origin: string;
  readonly rateLimitMax: number;
}

function parseChallenge(raw: string | null): OidcChallenge | null {
  const [state, nonce, verifier] = raw?.split('.') ?? [];
  return state && nonce && verifier ? { state, nonce, verifier } : null;
}

/** Page de refus : texte fixe, aucune donnée de la requête. */
const refusal = (reply: FastifyReply, status: number, message: string) =>
  reply
    .code(status)
    .type('text/html; charset=utf-8')
    .send(
      `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Connexion refusée</title>` +
        `<p>${message}</p><p><a href="/admin">Revenir à l’administration</a></p></html>`,
    );

/** Connexion par redirections du navigateur (hors contrat JSON), uniquement sur le site d'administration. */
function redirections(app: FastifyInstance, service: AdminAuthService, { oidc, origin, rateLimitMax }: AdminSso) {
  const options = { schema: { hide: true }, config: { rateLimit: { max: rateLimitMax, timeWindow: '1 minute' } } };
  const requireAdminSite = (request: FastifyRequest) => {
    if (!onAdminOrigin(request, origin)) throw new AppError('FORBIDDEN', 'Connexion refusée sur ce site.');
  };
  const refused = (request: FastifyRequest, reply: FastifyReply, err: unknown) => {
    request.log.warn({ event: 'admin_login_refused', reason: err instanceof Error ? err.message : 'inconnue' });
    return refusal(reply, 403, 'La connexion a été refusée.');
  };

  app.get('/admin-auth/login', options, async (request, reply) => {
    requireAdminSite(request);
    const challenge = oidc.newChallenge();
    let url: string;
    try {
      url = await oidc.authorizationUrl(challenge);
    } catch (err) {
      request.log.warn({ event: 'admin_login_unavailable', reason: err instanceof Error ? err.message : 'inconnue' });
      return refusal(reply, 503, 'Le service de connexion ne répond pas. Réessaie dans un instant.');
    }
    const value = `${challenge.state}.${challenge.nonce}.${challenge.verifier}`;
    reply.header('cache-control', 'no-store');
    reply.header('set-cookie', cookie(CHALLENGE_COOKIE, value, CHALLENGE_SECONDS));
    return reply.redirect(url);
  });

  app.get('/admin-auth/callback', options, async (request, reply) => {
    requireAdminSite(request);
    const query = request.query as Record<string, unknown>;
    const challenge = parseChallenge(readCookie(request.headers.cookie, CHALLENGE_COOKIE));
    reply.header('cache-control', 'no-store');
    reply.header('set-cookie', cookie(CHALLENGE_COOKIE, '', 0));
    if (!challenge || typeof query.code !== 'string' || query.state !== challenge.state) {
      return refused(request, reply, new Error('retour sans tentative correspondante'));
    }
    // RFC 9207 : un fournisseur qui annonce son émetteur au retour doit être le nôtre.
    if (query.iss !== undefined && query.iss !== oidc.issuer) {
      return refused(request, reply, new Error('émetteur de retour inattendu'));
    }
    let token: string | null;
    try {
      token = await service.login(await oidc.identify(query.code, challenge));
    } catch (err) {
      return refused(request, reply, err);
    }
    if (!token) {
      reply.header('set-cookie', cookie(ADMIN_COOKIE, '', 0));
      return refusal(reply, 403, 'Ton compte n’a aucun rôle dans cette administration.');
    }
    reply.header('set-cookie', cookie(ADMIN_COOKIE, token, ADMIN_SESSION_MS / 1000));
    return reply.redirect('/admin');
  });
}

/** Routes de connexion à l'administration ; `sso` nul : non configuré, rien à proposer. */
export function adminAuthRoutes(service: AdminAuthService, sso: AdminSso | null) {
  return async (app: FastifyInstance) => {
    route(app, api.adminAuthConfig, async () => ({ sso: sso !== null }));
    route(app, api.adminLogout, async ({ request, reply }) => {
      if (!sso) return;
      if (!request.headers.origin || !onAdminOrigin(request, sso.origin)) {
        throw new AppError('FORBIDDEN', 'Origine de la requête refusée.');
      }
      const token = readCookie(request.headers.cookie, ADMIN_COOKIE);
      if (token) await service.logout(token);
      reply.header('set-cookie', cookie(ADMIN_COOKIE, '', 0));
    });
    if (sso) redirections(app, service, sso);
  };
}
