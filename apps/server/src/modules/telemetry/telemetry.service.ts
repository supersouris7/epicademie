import { createHash } from 'node:crypto';
import { eq, inArray, isNull, sql } from 'drizzle-orm';
import type { ClientError } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { anonymizeText, maskTokens, neutralizeGithub } from '../../core/anonymize.ts';
import { normalizeScreen, normalizeVersion } from '../../core/screen.ts';
import { clientErrors } from '../../db/schema.ts';

/**
 * Erreurs du navigateur agrégées par empreinte (message normalisé + première ligne de pile +
 * version) avec un compteur. Rien de personnel : textes filtrés, identifiants et nombres
 * normalisés, aucune famille ni aucun profil.
 */

/** Taille d'entrée examinée : le reste est ignoré (coût borné, rien de long ne passe). */
const MAX_INPUT = 500;

/**
 * Rend deux occurrences de la même erreur identiques et retire tout secret : e-mails, liens,
 * jetons (Bearer, JWT, chaînes de 16 caractères ou plus), identifiants et nombres. 300 caractères au plus.
 */
export function normalizeMessage(text: string): string {
  return maskTokens(anonymizeText(text.slice(0, MAX_INPUT)))
    .replace(/\d+/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

/** Première ligne de pile utile (« at fonction (fichier:ligne:col) »), sans ligne ni colonne. */
export function stackTop(stack: string | undefined): string | null {
  const line = stack
    ?.slice(0, 4000)
    .split('\n')
    .find((l) => /^\s*at\s|@/.test(l));
  return line ? normalizeMessage(line).slice(0, 200) : null;
}

export const fingerprintOf = (message: string, top: string | null, release: string): string =>
  createHash('sha256')
    .update(`${message}\n${top ?? ''}\n${release}`)
    .digest('hex')
    .slice(0, 32);

/** Au-delà, plus de nouvelle empreinte tant que l'export n'a pas eu lieu (seuls les compteurs montent). */
const MAX_PENDING_FINGERPRINTS = 5000;

export function createTelemetryService({
  db,
  clock,
  maxPending = MAX_PENDING_FINGERPRINTS,
}: {
  db: Db;
  clock: Clock;
  maxPending?: number;
}) {
  return {
    /** Enregistre une occurrence : crée l'entrée ou incrémente son compteur. */
    async record(error: ClientError): Promise<void> {
      const message = normalizeMessage(error.message) || 'erreur inconnue';
      const top = stackTop(error.stack);
      const release = normalizeVersion(error.release);
      const now = clock.now();
      const fingerprint = fingerprintOf(message, top, release);
      const bump = { count: sql`${clientErrors.count} + 1`, lastSeen: now };
      const known = await db
        .update(clientErrors)
        .set(bump)
        .where(eq(clientErrors.fingerprint, fingerprint))
        .returning({ id: clientErrors.id });
      if (known.length > 0) return;
      // Borne : table pleine d'erreurs non exportées, on n'ajoute plus d'empreinte.
      const [pending] = await db
        .select({ n: sql<number>`count(*)::int` })
        .from(clientErrors)
        .where(isNull(clientErrors.exportedAt));
      if ((pending?.n ?? 0) >= maxPending) return;
      await db
        .insert(clientErrors)
        .values({
          fingerprint,
          message,
          stackTop: top,
          release,
          path: normalizeScreen(error.path),
          firstSeen: now,
          lastSeen: now,
        })
        .onConflictDoUpdate({ target: clientErrors.fingerprint, set: bump });
    },

    /** Erreurs pas encore exportées (commande `reports:export`). */
    async pendingExport() {
      const rows = await db.select().from(clientErrors).where(isNull(clientErrors.exportedAt)).limit(2000);
      return rows.map((r) => ({
        id: r.id,
        message: neutralizeGithub(r.message),
        stackTop: r.stackTop === null ? null : neutralizeGithub(r.stackTop),
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
