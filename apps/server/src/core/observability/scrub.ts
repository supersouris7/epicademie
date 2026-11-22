/**
 * Erreurs de base de données sans données : une requête SQL échouée porte ses paramètres (message
 * « params: … », propriétés `params` et `query`, `detail` de PostgreSQL qui cite les valeurs). Ils
 * peuvent contenir un texte saisi par un utilisateur (ex. le mot d'un parent) : on les retire de
 * l'erreur et de ses causes AVANT toute écriture dans les journaux ou envoi au suivi d'erreurs.
 */
const SENSITIVE_KEYS = ['params', 'query', 'detail', 'parameters', 'values'] as const;
const MAX_DEPTH = 5;
/** « params: … » du message Drizzle, jusqu'à la première ligne de pile. */
const PARAMS_IN_STACK = /\nparams:[\s\S]*?(?=\n\s+at |$)/;

export function scrubError(error: unknown, depth = 0): unknown {
  if (!(error instanceof Error) || depth > MAX_DEPTH) return error;
  const copy = Object.create(Object.getPrototypeOf(error) as object | null) as Record<string, unknown>;
  for (const key of Object.getOwnPropertyNames(error)) {
    if ((SENSITIVE_KEYS as readonly string[]).includes(key)) continue;
    copy[key] = (error as unknown as Record<string, unknown>)[key];
  }
  copy.message = error.message.split(/\nparams:/)[0] ?? '';
  // La pile commence par le message d'origine : même nettoyage.
  if (typeof error.stack === 'string') copy.stack = error.stack.replace(PARAMS_IN_STACK, '');
  // Le début du message de Drizzle (« Failed query: <SQL> ») reste : le SQL n'a que des « $1 ».
  if (error.cause !== undefined) copy.cause = scrubError(error.cause, depth + 1);
  return copy;
}
