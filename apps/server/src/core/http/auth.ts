import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Access, AccountRole } from '@questeo/shared';
import { AppError } from '../errors.ts';
import { readCookie, SESSION_COOKIE } from '../auth/cookies.ts';

/**
 * Qui fait la requête : résolu une fois par requête à partir du cookie de session, puis vérifié
 * par `route()` selon le niveau d'accès du contrat (`public`, `family`, `parent`, `admin`).
 * Les services reçoivent la famille de l'acteur ; l'appartenance de chaque profil, partie ou
 * combat désigné est vérifiée par le module « comptes » (`ownership`).
 */
export interface Actor {
  readonly accountId: string;
  readonly familyId: string;
  readonly email: string;
  readonly role: AccountRole;
  /** Fin du déverrouillage parent (mot de passe confirmé récemment), ou null. */
  readonly parentUntil: Date | null;
  /** Déverrouillage parent en cours, évalué à la lecture de la session (horloge du serveur). */
  readonly parent: boolean;
  /** Empreinte du jeton de la session (déconnexion, déverrouillage parent). */
  readonly sessionHash: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    actor: Actor | null;
  }
}

export interface AuthOptions {
  /** Session valide pour ce jeton, ou `null` (absente, expirée, révoquée). */
  readonly resolve: (token: string) => Promise<Actor | null>;
  /** Origines autorisées en plus de la page elle-même (CORS_ORIGINS). */
  readonly allowedOrigins: readonly string[] | null;
}

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Une requête qui modifie quelque chose doit venir de nos pages (protection CSRF). */
function sameOrigin(request: FastifyRequest, allowed: readonly string[] | null): boolean {
  const origin = request.headers.origin;
  if (!origin) return true; // clients hors navigateur : pas de cookie tiers à détourner
  if (allowed?.includes(origin)) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

export function registerAuth(app: FastifyInstance, options: AuthOptions): void {
  app.decorateRequest('actor', null);
  app.addHook('onRequest', async (request) => {
    if (UNSAFE.has(request.method) && !sameOrigin(request, options.allowedOrigins)) {
      throw new AppError('FORBIDDEN', 'Origine de la requête refusée.');
    }
    const token = readCookie(request.headers.cookie, SESSION_COOKIE);
    request.actor = token ? await options.resolve(token) : null;
  });
}

/** Lève l'erreur adaptée si l'acteur n'a pas le niveau d'accès demandé. */
export function checkAccess(access: Access, actor: Actor | null): void {
  if (access === 'public') return;
  if (!actor) throw new AppError('UNAUTHORIZED', 'Connecte-toi pour continuer.');
  if (access === 'parent' && !actor.parent) {
    throw new AppError('FORBIDDEN', 'Action réservée au parent : confirme le mot de passe du compte.');
  }
  if (access === 'admin' && actor.role !== 'admin')
    throw new AppError('FORBIDDEN', 'Accès réservé à l’administration.');
}

/** Acteur d'une route `family` ou plus (garanti par `route()`). */
export function actorOf(request: FastifyRequest): Actor {
  if (!request.actor) throw new AppError('UNAUTHORIZED', 'Connecte-toi pour continuer.');
  return request.actor;
}
