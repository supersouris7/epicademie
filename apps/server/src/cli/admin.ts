import { ConfigError, loadConfig } from '../config.ts';
import { openDatabase } from '../db/client.ts';
import { assertSchemaUpToDate } from '../db/migrations.ts';
import { attachOrphanProfiles } from '../modules/accounts/index.ts';

/**
 * Commandes d'exploitation :
 *
 *   node server/dist/admin.js rattacher <email>      (image Docker) — rattache les profils de la
 *                                                       bêta (créés avant les comptes) à la famille
 *                                                       du compte
 *   pnpm --filter @questeo/server admin rattacher <email>
 *
 * L'administration n'est plus un rôle de compte (opérateur du frontal, docs/adr/0033-…).
 */
const USAGE = 'Usage : admin rattacher <email>';

async function main(args: readonly string[]): Promise<void> {
  const [command, email] = args;
  if (!email || command !== 'rattacher') throw new ConfigError(USAGE);
  const config = loadConfig();
  const database = await openDatabase(config.databaseUrl, { poolMax: 1, applicationName: 'questeo-admin' });
  try {
    await assertSchemaUpToDate(database, config.migrationsDir);
    const names = await attachOrphanProfiles(database.db, email);
    if (names === null) throw new ConfigError(`Aucun compte pour ${email}.`);
    console.log(
      names.length === 0
        ? 'Aucun profil sans famille à rattacher.'
        : `${names.length} profil(s) rattaché(s) à ${email} : ${names.join(', ')}.`,
    );
  } finally {
    await database.close();
  }
}

main(process.argv.slice(2)).catch((err: unknown) => {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
});
