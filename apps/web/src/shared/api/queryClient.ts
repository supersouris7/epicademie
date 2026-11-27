import { QueryClient } from '@tanstack/react-query';

/** Fraîcheur des données qui changent rarement (profils, notions en maintenance). */
export const LONG_FRESH_MS = 5 * 60_000;

/**
 * Cache des requêtes serveur. Une donnée reçue reste en mémoire tant que la page est ouverte (vidée
 * à la déconnexion) : un écran déjà connu s'affiche tout de suite, puis se met à jour sans le dire
 * si elle n'est plus fraîche. Les requêtes en échec sont retentées 2 fois, sauf réponse du serveur
 * (erreur métier : réessayer ne changerait rien).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: Infinity,
        retry: (count, err) => count < 2 && !(err instanceof Error && 'status' in err),
      },
    },
  });
}
