import { ConfigError, loadConfig } from '../config.ts';
import { systemClock } from '../core/clock.ts';
import { openDatabase, type Database } from '../db/client.ts';
import { assertSchemaUpToDate } from '../db/migrations.ts';
import { createPedagogyService } from '../modules/pedagogy/index.ts';
import { createTelemetryService } from '../modules/telemetry/index.ts';

/**
 * Export des signalements et erreurs pour le suivi (création des tickets côté équipe) :
 *
 *   node server/dist/reports.js export                 — JSON sur la sortie standard : signalements et
 *                                                         erreurs pas encore exportés, anonymisés, doublons fusionnés
 *   node server/dist/reports.js mark-exported <id…>    — marque comme exportés (ids du JSON), après les tickets
 *
 * Ex. : `docker exec questeo node server/dist/reports.js export > signalements.json`.
 * (Alias acceptés : `reports:export`, `reports:mark-exported`.) Rien n'est envoyé à l'extérieur.
 */
const USAGE = 'Usage : reports export  |  reports mark-exported <id…>';

export async function runReports(database: Database, args: readonly string[], now = new Date()): Promise<string> {
  const clock = { today: () => now.toISOString().slice(0, 10), now: () => now };
  const pedagogy = createPedagogyService({ db: database.db, clock });
  const telemetry = createTelemetryService({ db: database.db, clock });
  const [command, ...ids] = args;
  if (command === 'export') {
    const [reports, errors] = await Promise.all([pedagogy.pendingExport(), telemetry.pendingExport()]);
    return JSON.stringify({ generatedAt: now.toISOString(), reports, errors }, null, 2);
  }
  if (command === 'mark-exported' && ids.length > 0) {
    const [r, e] = await Promise.all([pedagogy.markExported(ids), telemetry.markExported(ids)]);
    return `${r} signalement(s) et ${e} erreur(s) marqué(s) comme exporté(s).`;
  }
  throw new ConfigError(USAGE);
}

async function main(args: readonly string[]): Promise<void> {
  const command = (args[0] ?? '').replace(/^reports:/, '');
  const config = loadConfig();
  const database = await openDatabase(config.databaseUrl, { poolMax: 1, applicationName: 'questeo-reports' });
  try {
    await assertSchemaUpToDate(database, config.migrationsDir);
    console.log(await runReports(database, [command, ...args.slice(1)], systemClock(config.timeZone).now()));
  } finally {
    await database.close();
  }
}

// Lancé directement (pas importé par les tests).
if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2)).catch((err: unknown) => {
    console.error(err instanceof ConfigError ? err.message : err);
    process.exit(1);
  });
}
