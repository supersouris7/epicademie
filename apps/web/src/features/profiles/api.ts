import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ProfileCreate, type ProfileUpdate } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

const keys = {
  all: ['profiles'] as const,
  one: (id: string) => ['profiles', id] as const,
};

/** Profils côté serveur : lecture (cache React Query) et modifications, qui invalident le cache. */
export const useProfiles = () => useQuery({ queryKey: keys.all, queryFn: () => request(api.listProfiles) });

export const useProfile = (id: string | null) =>
  useQuery({
    queryKey: keys.one(id ?? ''),
    queryFn: () => request(api.getProfile, { params: { id: id ?? '' } }),
    enabled: id !== null,
  });

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
