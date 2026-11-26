import { QueryClient } from '@tanstack/react-query';

/**
 * Cache des requêtes serveur. Les requêtes en échec sont retentées 2 fois, sauf réponse du
 * serveur (erreur métier : réessayer ne changerait rien).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (count, err) => count < 2 && !(err instanceof Error && 'status' in err) },
    },
  });
}
