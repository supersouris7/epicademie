import type { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { ErrorBody } from '@epicademie/shared';

/**
 * Défenses HTTP communes :
 * - en-têtes de sécurité (helmet) avec une politique de contenu (CSP) stricte : tout vient du
 *   même domaine, aucun script en ligne, pas d'intégration dans un cadre d'un autre site ;
 * - limite de débit par IP (protection contre l'abus et les boucles client) ;
 * - la taille des corps est limitée à la création de l'application (`bodyLimit`).
 * Voir docs/architecture/securite.md.
 */
export interface SecurityOptions {
  /** Requêtes par minute et par IP. */
  readonly rateLimitMax: number;
  /** HSTS (HTTPS de production) ; absent en HTTP local, où il serait inapplicable. */
  readonly hsts?: boolean;
}

export async function registerSecurity(app: FastifyInstance, options: SecurityOptions): Promise<void> {
  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // Styles calculés par React/motion (attributs style) : 'unsafe-inline' requis pour les styles seulement.
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    // HSTS seulement derrière HTTPS (cookies Secure) ; le réseau local de test reste en HTTP.
    hsts: options.hsts ? { maxAge: 31_536_000, includeSubDomains: true } : false,
    referrerPolicy: { policy: 'no-referrer' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false,
  });

  // Fonctions du navigateur inutiles à l'application : toutes refusées.
  app.addHook('onSend', async (_request, reply) => {
    reply.header(
      'permissions-policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    );
  });

  await app.register(rateLimit, {
    global: true,
    max: options.rateLimitMax,
    timeWindow: '1 minute',
    // Réponse au format commun des erreurs.
    errorResponseBuilder: (request, context) => {
      const body: ErrorBody & { statusCode: number } = {
        statusCode: context.statusCode,
        code: 'RATE_LIMITED',
        error: 'Trop de requêtes, réessaie dans un instant.',
        requestId: request.id,
      };
      return body;
    },
  });
}
