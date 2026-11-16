import path from 'node:path';

const here = import.meta.dirname;

export interface ServerConfig {
  readonly port: number;
  readonly host: string;
  readonly dbPath: string;
  readonly migrationsDir: string;
  /** Dossier du front buildé ; `null` en dev (Vite sert le front). */
  readonly webDir: string | null;
  /** URL publique forcée (sinon détection de l'IP LAN). */
  readonly publicUrl: string | null;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`PORT invalide : ${env.PORT}`);
  return {
    port,
    host: env.HOST ?? '0.0.0.0',
    dbPath: env.DB_PATH ?? path.resolve(here, '../data/questeo.db'),
    migrationsDir: path.resolve(here, '../drizzle'),
    webDir: env.NODE_ENV === 'production' ? (env.WEB_DIR ?? path.resolve(here, '../../web/dist')) : null,
    publicUrl: env.PUBLIC_URL?.trim() ? env.PUBLIC_URL.trim() : null,
  };
}
