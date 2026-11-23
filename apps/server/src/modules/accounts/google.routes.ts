import type { FastifyInstance, FastifyReply } from 'fastify';
import { readCookie, serializeCookie } from '../../core/auth/cookies.ts';
import type { Google, GoogleChallenge } from '../../core/auth/google.ts';
import type { AccountsService, OpenedSession } from './accounts.service.ts';

/** Cookie de la tentative Google en cours (state, nonce, vérificateur PKCE) : 10 minutes, HttpOnly. */
const GOOGLE_COOKIE = 'af_google';
const GOOGLE_MINUTES = 10;

export interface GoogleRoutesDeps {
  readonly service: AccountsService;
  readonly google: Google;
  readonly secure: boolean;
  readonly strict: { rateLimit: { max: number; timeWindow: string } };
  readonly setSession: (reply: FastifyReply, opened: OpenedSession) => unknown;
}

/** Connexion Google : deux redirections du navigateur (hors contrat JSON). */
export function googleRoutes(app: FastifyInstance, { service, google, secure, strict, setSession }: GoogleRoutesDeps) {
  const clear = serializeCookie(GOOGLE_COOKIE, '', { secure: secure, maxAge: 0 });
  const parse = (raw: string | null): GoogleChallenge | null => {
    const [state, nonce, verifier] = raw?.split('.') ?? [];
    return state && nonce && verifier ? { state, nonce, verifier } : null;
  };
  app.get('/auth/google/start', { schema: { hide: true }, config: strict }, async (_request, reply) => {
    const challenge = google.newChallenge();
    reply.header(
      'set-cookie',
      serializeCookie(GOOGLE_COOKIE, `${challenge.state}.${challenge.nonce}.${challenge.verifier}`, {
        secure: secure,
        maxAge: GOOGLE_MINUTES * 60,
      }),
    );
    return reply.redirect(google.authorizationUrl(challenge));
  });
  app.get('/auth/google/callback', { schema: { hide: true }, config: strict }, async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const challenge = parse(readCookie(request.headers.cookie, GOOGLE_COOKIE));
    const failed = () => {
      reply.header('set-cookie', clear);
      return reply.redirect('/connexion?erreur=google');
    };
    if (!challenge || typeof query.code !== 'string' || query.state !== challenge.state) return failed();
    try {
      const identity = await google.identify(query.code, challenge);
      const { created, ...opened } = await service.loginWithGoogle(identity);
      setSession(reply, opened);
      reply.header('set-cookie', clear);
      return await reply.redirect(created ? '/profils/nouveau' : '/');
    } catch (err) {
      // Raison technique seulement : ni e-mail, ni jeton.
      request.log.warn({ event: 'google_login_refused', reason: err instanceof Error ? err.message : 'inconnue' });
      return failed();
    }
  });
}
