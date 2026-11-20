import path from 'node:path';
import { z } from 'zod';

/**
 * Configuration du serveur, lue UNE fois depuis l'environnement et validée au démarrage :
 * une variable invalide arrête le serveur avec un message clair plutôt qu'un bug plus tard.
 * Toutes les variables sont documentées dans docs/operations/configuration.md.
 */

const here = import.meta.dirname;
/** Racine du paquet serveur (src/ en dev, dist/ une fois buildé : même niveau). */
const serverRoot = path.resolve(here, '..');

const bool = z
  .enum(['true', 'false', '1', '0'])
  .transform((v) => v === 'true' || v === '1')
  .optional();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  /**
   * Base de données : `postgres://…` (production), `pglite://memory` (éphémère, tests et e2e)
   * ou `pglite://<dossier>` (PostgreSQL embarqué sur disque, développement).
   */
  DATABASE_URL: z.string().min(1).optional(),
  /** Taille du pool de connexions PostgreSQL (par instance). */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  WEB_DIR: z.string().min(1).optional(),
  /** URL publique forcée (sinon détection de l'IP du réseau local). */
  PUBLIC_URL: z.string().trim().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
  /** Nombre de proxys de confiance devant le serveur (nginx, répartiteur) : IP client réelle. */
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  /** Origines autorisées pour le temps réel, séparées par des virgules (vide : même origine). */
  CORS_ORIGINS: z.string().optional(),
  /** Requêtes HTTP par minute et par IP. */
  RATE_LIMIT_MAX: z.coerce.number().int().min(10).default(600),
  /** Tentatives par minute et par IP sur les routes sensibles (connexion, inscription, mot de passe). */
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(10),
  /** Si défini, /api/metrics exige l'en-tête `Authorization: Bearer <jeton>`. */
  METRICS_TOKEN: z.string().min(16).optional(),
  /** Documentation interactive de l'API (/api/docs) ; par défaut hors production. */
  API_DOCS: bool,
  /** Fuseau horaire des jours de révision (répétition espacée). */
  TZ_FAMILY: z.string().min(1).default('Europe/Paris'),
  QUESTEO_VERSION: z.string().default('dev'),
  /** Cookie de session réservé à HTTPS ; par défaut en production. */
  COOKIE_SECURE: bool,
  /** Durée d'une session d'appareil sans activité, en jours. */
  SESSION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
});

export interface ServerConfig {
  readonly env: 'development' | 'production' | 'test';
  readonly port: number;
  readonly host: string;
  readonly databaseUrl: string;
  readonly databasePoolMax: number;
  readonly migrationsDir: string;
  /** Dossier du front buildé ; `null` en dev (Vite sert le front). */
  readonly webDir: string | null;
  readonly publicUrl: string | null;
  readonly logLevel: string;
  readonly trustProxy: number;
  /** `null` : même origine uniquement. */
  readonly corsOrigins: readonly string[] | null;
  readonly rateLimitMax: number;
  readonly authRateLimitMax: number;
  readonly metricsToken: string | null;
  readonly apiDocs: boolean;
  readonly timeZone: string;
  readonly version: string;
  readonly cookieSecure: boolean;
  readonly sessionDays: number;
}

export class ConfigError extends Error {}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  // Une variable vide (`METRICS_TOKEN=` dans un .env) vaut « non définie ».
  const defined = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined && v.trim() !== ''));
  const parsed = EnvSchema.safeParse(defined);
  if (!parsed.success) throw new ConfigError(`Configuration invalide :\n${z.prettifyError(parsed.error)}`);
  const e = parsed.data;
  const production = e.NODE_ENV === 'production';
  // En production, la base doit être désignée explicitement (pas de base embarquée par surprise).
  if (production && !e.DATABASE_URL) throw new ConfigError('DATABASE_URL est obligatoire en production');
  const origins = e.CORS_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return {
    env: e.NODE_ENV,
    port: e.PORT,
    host: e.HOST,
    databaseUrl: e.DATABASE_URL ?? `pglite://${path.join(serverRoot, 'data/pglite')}`,
    databasePoolMax: e.DATABASE_POOL_MAX,
    migrationsDir: path.join(serverRoot, 'drizzle'),
    webDir: production ? (e.WEB_DIR ?? path.resolve(serverRoot, '../web/dist')) : null,
    publicUrl: e.PUBLIC_URL ?? null,
    logLevel: e.LOG_LEVEL ?? (e.NODE_ENV === 'test' ? 'silent' : 'info'),
    trustProxy: e.TRUST_PROXY,
    corsOrigins: origins?.length ? origins : null,
    rateLimitMax: e.RATE_LIMIT_MAX,
    authRateLimitMax: e.AUTH_RATE_LIMIT_MAX,
    metricsToken: e.METRICS_TOKEN ?? null,
    apiDocs: e.API_DOCS ?? !production,
    timeZone: e.TZ_FAMILY,
    version: e.QUESTEO_VERSION,
    cookieSecure: e.COOKIE_SECURE ?? production,
    sessionDays: e.SESSION_DAYS,
  };
}
