import { createHash } from 'node:crypto';
import { inArray, isNull, sql } from 'drizzle-orm';
import type { ClientError } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { anonymizeText } from '../../core/anonymize.ts';
import { normalizeScreen } from '../../core/screen.ts';
import { clientErrors } from '../../db/schema.ts';

/**
 * Erreurs du navigateur agrégées par empreinte (message normalisé + première ligne de pile +
 * version) avec un compteur. Rien de personnel : textes filtrés, identifiants et nombres
 * normalisés, aucune famille ni aucun profil.
 */

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Rend deux occurrences de la même erreur identiques (nombres, identifiants, liens, espaces). */
export function normalizeMessage(text: string): string {
  return anonymizeText(text).replace(UUID, '<id>').replace(/\d+/g, '<n>').replace(/\s+/g, ' ').trim().slice(0, 300);
}

/** Première ligne de pile utile (« at fonction (fichier:ligne:col) »), sans ligne ni colonne. */
export function stackTop(stack: string | undefined): string | null {
  const line = stack?.split('\n').find((l) => /^\s*at\s|@/.test(l));
  return line ? normalizeMessage(line).slice(0, 200) : null;
}

export const fingerprintOf = (message: string, top: string | null, release: string): string =>
  createHash('sha256')
    .update(`${message}\n${top ?? ''}\n${release}`)
    .digest('hex')
    .slice(0, 32);

export function createTelemetryService({ db, clock }: { db: Db; clock: Clock }) {
  return {
    /** Enregistre une occurrence : crée l'entrée ou incrémente son compteur. */
    async record(error: ClientError): Promise<void> {
      const message = normalizeMessage(error.message) || 'erreur inconnue';
      const top = stackTop(error.stack);
      const release = (error.release ?? 'inconnue').slice(0, 40);
      const now = clock.now();
      await db
        .insert(clientErrors)
        .values({
          fingerprint: fingerprintOf(message, top, release),
          message,
          stackTop: top,
          release,
          path: normalizeScreen(error.path),
          firstSeen: now,
          lastSeen: now,
        })
        .onConflictDoUpdate({
          target: clientErrors.fingerprint,
          set: { count: sql`${clientErrors.count} + 1`, lastSeen: now },
        });
    },

    /** Erreurs pas encore exportées (commande `reports:export`). */
    async pendingExport() {
      const rows = await db.select().from(clientErrors).where(isNull(clientErrors.exportedAt)).limit(2000);
      return rows.map((r) => ({
        id: r.id,
        message: r.message,
        stackTop: r.stackTop,
        release: r.release,
        screen: r.path,
        count: r.count,
        firstAt: r.firstSeen.toISOString(),
        lastAt: r.lastSeen.toISOString(),
      }));
    },

    async markExported(ids: readonly string[]): Promise<number> {
      if (ids.length === 0) return 0;
      const rows = await db
        .update(clientErrors)
        .set({ exportedAt: clock.now() })
        .where(inArray(clientErrors.id, [...ids]))
        .returning({ id: clientErrors.id });
      return rows.length;
    },
  };
}

export type TelemetryService = ReturnType<typeof createTelemetryService>;
