import { ACCOUNT_ROLES, type AccountRole } from '@questeo/shared';
import { ConfigError, loadConfig } from '../config.ts';
import { openDatabase } from '../db/client.ts';
import { assertSchemaUpToDate } from '../db/migrations.ts';
import { setAccountRole } from '../modules/accounts/index.ts';

/**
 * Commande d'exploitation : donne un rôle à un compte existant.
 *
 *   node dist/admin.js role <email> admin     (image Docker)
 *   pnpm --filter @questeo/server admin role <email> parent
 *
 * Le rôle administrateur ne s'obtient jamais par l'API : il faut un accès au serveur.
 */
async function main(args: readonly string[]): Promise<void> {
  const [command, email, role] = args;
  if (command !== 'role' || !email || !ACCOUNT_ROLES.includes(role as AccountRole)) {
    throw new ConfigError(`Usage : admin role <email> <${ACCOUNT_ROLES.join('|')}>`);
  }
  const config = loadConfig();
  const database = await openDatabase(config.databaseUrl, { poolMax: 1, applicationName: 'questeo-admin' });
  try {
    await assertSchemaUpToDate(database, config.migrationsDir);
    if (!(await setAccountRole(database.db, email, role as AccountRole))) {
      throw new ConfigError(`Aucun compte pour ${email}.`);
    }
    console.log(`Rôle « ${role} » donné à ${email}.`);
  } finally {
    await database.close();
  }
}

main(process.argv.slice(2)).catch((err: unknown) => {
  console.error(err instanceof ConfigError ? err.message : err);
  process.exit(1);
});
