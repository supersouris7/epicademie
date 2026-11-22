import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type RecommendationCreate } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

/** Appels au serveur pour les recommandations de travail (toujours relus à l'ouverture de l'écran). */
const childKey = (profileId: string) => ['recommendations', profileId] as const;
const FAMILY_KEY = ['recommendations', 'family'] as const;

/** Recommandations en attente d'un enfant (accueil). */
export const useChildRecommendations = (profileId: string) =>
  useQuery({
    queryKey: childKey(profileId),
    queryFn: () => request(api.recommendations, { params: { id: profileId } }),
    staleTime: 0,
  });

/** Recommandations de la famille (Espace parent) : en attente et faites. */
export const useFamilyRecommendations = () =>
  useQuery({ queryKey: FAMILY_KEY, queryFn: () => request(api.familyRecommendations), staleTime: 0 });

export function useRecommendationActions(profileId: string) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['recommendations'] });
  const create = useMutation({
    mutationFn: (input: RecommendationCreate) =>
      request(api.createRecommendation, { params: { id: profileId }, body: input }),
    onSuccess: refresh,
  });
  const cancel = useMutation({
    mutationFn: (recommendationId: string) =>
      request(api.cancelRecommendation, { params: { id: profileId, recommendationId } }),
    onSuccess: refresh,
  });
  return { create, cancel };
}
