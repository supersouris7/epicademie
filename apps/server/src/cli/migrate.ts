import { ConfigError, loadConfig } from '../config.ts';
import { openDatabase } from '../db/client.ts';
import { runMigrations, schemaStatus } from '../db/migrations.ts';

/**
 * Commande de migration : `pnpm --filter @questeo/server db:migrate` (développement) ou
 * `node dist/migrate.js` (image Docker, conteneur « migrate » lancé avant les instances).
 * Idempotente et protégée par un verrou : la relancer ne fait rien si la base est à jour.
 */
async function main(): Promise<void> {
  const config = loadConfig();
  const database = await openDatabase(config.databaseUrl, { poolMax: 1, applicationName: 'questeo-migrate' });
  try {
    if (database.ephemeral) throw new ConfigError('Une base en mémoire se migre au démarrage du serveur.');
    await runMigrations(database, config.migrationsDir);
    const status = await schemaStatus(database, config.migrationsDir);
    console.log(`Base à jour (${status.applied} migration(s) appliquée(s), moteur ${database.kind}).`);
  } finally {
    await database.close();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
});
