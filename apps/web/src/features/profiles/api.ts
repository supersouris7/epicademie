import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Profile, type ProfileCreate, type ProfileUpdate } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';
import { LONG_FRESH_MS } from '../../shared/api/queryClient.ts';

const keys = {
  all: ['profiles'] as const,
  one: (id: string) => ['profiles', id] as const,
};

export const profilesQuery = queryOptions({
  queryKey: keys.all,
  queryFn: () => request(api.listProfiles),
  staleTime: LONG_FRESH_MS,
});

/** Profils côté serveur : lecture (cache React Query) et modifications, qui invalident le cache. */
export const useProfiles = () => useQuery(profilesQuery);

/** Un profil : déjà connu par la liste (choix du joueur), il s'affiche sans nouvelle attente. */
export function useProfile(id: string | null) {
  const qc = useQueryClient();
  const listed = () => qc.getQueryData<Profile[]>(keys.all)?.find((p) => p.id === id);
  return useQuery({
    queryKey: keys.one(id ?? ''),
    queryFn: () => request(api.getProfile, { params: { id: id ?? '' } }),
    enabled: id !== null,
    staleTime: LONG_FRESH_MS,
    initialData: listed,
    // Âge de la liste reprise ; périmée (modification faite depuis), le profil est redemandé.
    initialDataUpdatedAt: () => {
      const state = qc.getQueryState(keys.all);
      return state?.isInvalidated ? 0 : state?.dataUpdatedAt;
    },
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileCreate) => request(api.createProfile, { body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateProfile(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfileUpdate) => request(api.updateProfile, { params: { id }, body: patch }),
    onSuccess: (profile) => {
      qc.setQueryData(keys.one(id), profile);
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request(api.deleteProfile, { params: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
