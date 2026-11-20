import { ACCOUNT_ROLES, type AccountRole } from '@questeo/shared';
import { ConfigError, loadConfig } from '../config.ts';
import { openDatabase } from '../db/client.ts';
import { assertSchemaUpToDate } from '../db/migrations.ts';
import { attachOrphanProfiles, setAccountRole } from '../modules/accounts/index.ts';

/**
 * Commandes d'exploitation :
 *
 *   node server/dist/admin.js role <email> admin     (image Docker) — donne un rôle
 *   node server/dist/admin.js rattacher <email>      — rattache les profils de la bêta (créés
 *                                                       avant les comptes) à la famille du compte
 *   pnpm --filter @questeo/server admin role <email> parent
 *
 * Le rôle administrateur ne s'obtient jamais par l'API : il faut un accès au serveur.
 */
const USAGE = `Usage : admin role <email> <${ACCOUNT_ROLES.join('|')}>  |  admin rattacher <email>`;

async function main(args: readonly string[]): Promise<void> {
  const [command, email, role] = args;
  const isRole = command === 'role' && ACCOUNT_ROLES.includes(role as AccountRole);
  if (!email || (!isRole && command !== 'rattacher')) throw new ConfigError(USAGE);
  const config = loadConfig();
  const database = await openDatabase(config.databaseUrl, { poolMax: 1, applicationName: 'questeo-admin' });
  try {
    await assertSchemaUpToDate(database, config.migrationsDir);
    if (command === 'rattacher') {
      const names = await attachOrphanProfiles(database.db, email);
      if (names === null) throw new ConfigError(`Aucun compte pour ${email}.`);
      console.log(
        names.length === 0
          ? 'Aucun profil sans famille à rattacher.'
          : `${names.length} profil(s) rattaché(s) à ${email} : ${names.join(', ')}.`,
      );
      return;
    }
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
