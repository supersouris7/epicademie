import type { Counter } from '@prometheus-io/client';
import type { ErrorContext, ErrorReporter } from './error-reporter.ts';

/**
 * Journal des erreurs récentes pour l'administration : se place devant le suivi d'erreurs
 * (journaux, ou service externe) et garde en mémoire les erreurs regroupées par source et
 * message, avec leur nombre. Ce n'est pas un stockage durable : il repart de zéro au
 * redémarrage, les journaux restent la source complète. Seuls la source, le message tronqué et
 * la route sont gardés (jamais le contexte complet, qui pourrait contenir des données).
 */
export interface JournalEntry {
  readonly source: 'server' | 'client' | 'realtime' | 'process';
  readonly message: string;
  readonly route: string | null;
  count: number;
  readonly firstAt: string;
  lastAt: string;
}

const MAX_GROUPS = 50;
const MAX_MESSAGE = 300;

export function withErrorJournal(
  inner: ErrorReporter,
  { now = () => new Date(), counter }: { now?: () => Date; counter?: Counter<'source'> } = {},
): ErrorReporter & { recent(): JournalEntry[] } {
  const groups = new Map<string, JournalEntry>();
  return {
    capture(error: unknown, context: ErrorContext = {}) {
      inner.capture(error, context);
      const source = context.source ?? 'server';
      counter?.inc({ source });
      const message = cleanMessage(error instanceof Error ? error.message : String(error));
      const key = `${source}|${message}`;
      const at = now().toISOString();
      const found = groups.get(key);
      if (found) {
        found.count++;
        found.lastAt = at;
        return;
      }
      if (groups.size >= MAX_GROUPS) {
        const oldest = [...groups.entries()].sort((a, b) => a[1].lastAt.localeCompare(b[1].lastAt))[0];
        if (oldest) groups.delete(oldest[0]);
      }
      const route =
        typeof context.route === 'string' ? context.route : typeof context.path === 'string' ? context.path : null;
      groups.set(key, { source, message, route, count: 1, firstAt: at, lastAt: at });
    },
    recent: () => [...groups.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt)),
  };
}

/**
 * Message sans données : les paramètres d'une requête SQL échouée (« params: … », qui peuvent
 * contenir un nom ou une adresse) sont retirés, puis le message est tronqué.
 */
export function cleanMessage(message: string): string {
  return (message.split(/\nparams:/)[0] ?? '').slice(0, MAX_MESSAGE);
}
