import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Profile, ProfileCreate, ProfileUpdate } from '@questeo/shared';
import { api } from './client.ts';

const keys = {
  all: ['profiles'] as const,
  one: (id: string) => ['profiles', id] as const,
};

export const useProfiles = () => useQuery({ queryKey: keys.all, queryFn: () => api<Profile[]>('/profiles') });

export const useProfile = (id: string | null) =>
  useQuery({
    queryKey: keys.one(id ?? ''),
    queryFn: () => api<Profile>(`/profiles/${id ?? ''}`),
    enabled: id !== null,
  });

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileCreate) => api<Profile>('/profiles', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateProfile(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfileUpdate) =>
      api<Profile>(`/profiles/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: (profile) => {
      qc.setQueryData(keys.one(id), profile);
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<undefined>(`/profiles/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
