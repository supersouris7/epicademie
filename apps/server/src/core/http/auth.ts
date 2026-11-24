import type { FastifyInstance, FastifyRequest } from 'fastify';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Access, AccountRole } from '@epicademie/shared';
import { AppError } from '../errors.ts';
import { readCookie, SESSION_COOKIE } from '../auth/cookies.ts';

/**
 * Qui fait la requête : résolu une fois par requête à partir du cookie de session, puis vérifié
 * par `route()` selon le niveau d'accès du contrat (`public`, `family`, `parent`, `admin`).
 * L'administration n'est pas un compte de jeu : c'est un « opérateur » reconnu à l'en-tête secret
 * que le frontal de la page de pilotage ajoute (docs/adr/0033-…).
 * Les services reçoivent la famille de l'acteur ; l'appartenance de chaque profil, partie ou
 * combat désigné est vérifiée par le module « comptes » (`ownership`).
 */
export interface Actor {
  readonly accountId: string;
  readonly familyId: string;
  /** Nul pour un élève autonome (moins de 15 ans). */
  readonly email: string | null;
  /** Famille d'un élève autonome : ni paiement, ni Espace parent tant qu'aucun parent n'est rattaché. */
  readonly autonomous: boolean;
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
    /** Nom assaini de l'opérateur d'administration (secret valide), sinon `null`. */
    operator: string | null;
  }
}

export interface AuthOptions {
  /** Session valide pour ce jeton, ou `null` (absente, expirée, révoquée). */
  readonly resolve: (token: string) => Promise<Actor | null>;
  /** Origines autorisées en plus de la page elle-même (CORS_ORIGINS). */
  readonly allowedOrigins: readonly string[] | null;
  /** Secret de l'opérateur (ADMIN_OPERATOR_SECRET) ; `null` : aucune administration. */
  readonly operatorSecret: string | null;
}

export const OPERATOR_HEADER = 'x-epicademie-operateur';
export const OPERATOR_NAME_HEADER = 'x-epicademie-operateur-nom';
const OPERATOR_NAME_MAX = 40;

/** Nom d'opérateur sûr pour les journaux : sans caractère de contrôle, 40 caractères au plus. */
export function sanitizeOperatorName(raw: unknown): string {
  const text = typeof raw === 'string' ? raw : '';
  const clean = Array.from(text, (c) => {
    const code = c.codePointAt(0) ?? 0;
    return code < 32 || (code >= 127 && code <= 159) ? ' ' : c;
  })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.slice(0, OPERATOR_NAME_MAX) || 'operateur';
}

/** Comparaison en temps constant (empreintes de même longueur). */
function sameSecret(given: string, expected: string): boolean {
  const digest = (v: string) => createHash('sha256').update(v).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

/** Opérateur reconnu : secret correct (aucun cookie ni compte de jeu n'entre en jeu). */
function readOperator(request: FastifyRequest, secret: string | null): string | null {
  const given = request.headers[OPERATOR_HEADER];
  if (secret === null || typeof given !== 'string' || !sameSecret(given, secret)) return null;
  return sanitizeOperatorName(request.headers[OPERATOR_NAME_HEADER]);
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
  app.decorateRequest('operator', null);
  app.addHook('onRequest', async (request) => {
    if (UNSAFE.has(request.method) && !sameOrigin(request, options.allowedOrigins)) {
      throw new AppError('FORBIDDEN', 'Origine de la requête refusée.');
    }
    // Un opérateur n'a ni famille, ni profil, ni session : le cookie de jeu est ignoré.
    request.operator = readOperator(request, options.operatorSecret);
    // Requête d'opérateur qui modifie quelque chose : l'en-tête Origin est obligatoire (il doit
    // égaler l'origine de la page de pilotage ; sameOrigin l'a déjà comparé s'il est présent).
    if (request.operator && UNSAFE.has(request.method) && !request.headers.origin) {
      throw new AppError('FORBIDDEN', 'Origine de la requête manquante.');
    }
    if (request.operator) return;
    const token = readCookie(request.headers.cookie, SESSION_COOKIE);
    request.actor = token ? await options.resolve(token) : null;
  });
}

export const ADMIN_ONLY_MESSAGE = 'Administration accessible uniquement depuis la page de pilotage.';
export const AUTONOMOUS_MESSAGE = 'Demande à un parent : il doit d’abord rattacher ton compte au sien.';

/** Lève l'erreur adaptée si l'acteur n'a pas le niveau d'accès demandé. */
export function checkAccess(access: Access, actor: Actor | null, operator: string | null = null): void {
  if (access === 'public') return;
  if (access === 'admin') {
    if (!operator) throw new AppError('FORBIDDEN', ADMIN_ONLY_MESSAGE);
    return;
  }
  if (!actor) throw new AppError('UNAUTHORIZED', 'Connecte-toi pour continuer.');
  if (access === 'parent' && actor.autonomous) throw new AppError('FORBIDDEN', AUTONOMOUS_MESSAGE);
  if (access === 'parent' && !actor.parent) {
    throw new AppError('FORBIDDEN', 'Action réservée au parent : confirme le mot de passe du compte.');
  }
}

/** Opérateur d'une route `admin` (garanti par `route()`). */
export function operatorOf(request: FastifyRequest): string {
  if (!request.operator) throw new AppError('FORBIDDEN', ADMIN_ONLY_MESSAGE);
  return request.operator;
}

/** Acteur d'une route `family` ou plus (garanti par `route()`). */
export function actorOf(request: FastifyRequest): Actor {
  if (!request.actor) throw new AppError('UNAUTHORIZED', 'Connecte-toi pour continuer.');
  return request.actor;
}
