import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from './client.ts';

/** Fraîcheur des données qui changent rarement (profils, notions en maintenance). */
export const LONG_FRESH_MS = 5 * 60_000;

/**
 * Options des données réservées au parent qui ne servent pas à préparer d'écran : oubliées peu après
 * le dernier affichage (verrou expiré sans que le serveur ait pu le dire, hors ligne).
 */
export const PARENT_GC_MS = 60_000;

/**
 * Cache des requêtes serveur. Une donnée reçue reste en mémoire tant que la page est ouverte (vidée
 * à la déconnexion, en fin de session et au changement de famille) : un écran déjà connu s'affiche tout de suite, puis se met à jour sans le dire
 * si elle n'est plus fraîche. Les requêtes en échec sont retentées 2 fois, sauf réponse du serveur
 * (erreur métier : réessayer ne changerait rien).
 */
export function createQueryClient(): QueryClient {
  // Session refusée à une autre requête : elle est revérifiée tout de suite (clé `me`, fonctionnalité
  // « account », qui vide alors le cache).
  const onError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      void client.invalidateQueries({ queryKey: ['me'] }, { cancelRefetch: false });
    }
  };
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: (err, query) => query.queryKey[0] !== 'me' && onError(err) }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: Infinity,
        retry: (count, err) => count < 2 && !(err instanceof Error && 'status' in err),
      },
    },
  });
  return client;
}
