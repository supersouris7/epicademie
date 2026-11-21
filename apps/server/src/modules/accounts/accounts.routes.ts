import type { FastifyInstance, FastifyReply } from 'fastify';
import { api } from '@questeo/shared';
import { route } from '../../core/http/route.ts';
import { readCookie, serializeCookie, SESSION_COOKIE } from '../../core/auth/cookies.ts';
import type { AccountsService, OpenedSession } from './accounts.service.ts';

/**
 * Routes des comptes : la session vit dans un cookie HttpOnly, jamais dans un corps de réponse.
 * Les routes sensibles ont leur propre limite de débit par IP (mots de passe devinés).
 */
export function accountsRoutes(
  service: AccountsService,
  cookie: { secure: boolean; maxAgeDays: number; rateLimitMax: number },
) {
  const STRICT = { rateLimit: { max: cookie.rateLimitMax, timeWindow: '1 minute' } };
  const setSession = (reply: FastifyReply, opened: OpenedSession) => {
    reply.header(
      'set-cookie',
      serializeCookie(SESSION_COOKIE, opened.token, { secure: cookie.secure, maxAge: cookie.maxAgeDays * 86_400 }),
    );
    return opened.me;
  };
  return async (app: FastifyInstance) => {
    route(app, api.signup, async ({ body, reply }) => setSession(reply, await service.signup(body)), {
      config: STRICT,
    });
    route(app, api.login, async ({ body, reply }) => setSession(reply, await service.login(body)), {
      config: STRICT,
    });
    route(app, api.logout, async ({ request, reply }) => {
      await service.logout(readCookie(request.headers.cookie, SESSION_COOKIE));
      reply.header('set-cookie', serializeCookie(SESSION_COOKIE, '', { secure: cookie.secure, maxAge: 0 }));
    });
    route(app, api.me, async ({ actor }) => service.me(actor()));
    route(app, api.setParentPin, ({ actor, body }) => service.setParentPin(actor(), body.password, body.pin), {
      config: STRICT,
    });
    route(app, api.unlockParentPin, ({ actor, body }) => service.unlockParentPin(actor(), body.pin), {
      config: STRICT,
    });
    route(app, api.lockParent, ({ actor }) => service.lockParent(actor()));
    route(app, api.confirmParent, ({ actor, body }) => service.confirmParent(actor(), body.password), {
      config: STRICT,
    });
    route(app, api.forgotPassword, ({ body }) => service.forgotPassword(body.email), { config: STRICT });
    route(app, api.resetPassword, ({ body }) => service.resetPassword(body.token, body.password), { config: STRICT });
  };
}
