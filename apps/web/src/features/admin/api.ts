import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type AccountSearch, type ReportStatus } from '@epicademie/shared';

export type AccountSearchInput = AccountSearch;
import { request } from '../../shared/api/client.ts';

/** Administration : signalements et état des notions (permissions vérifiées par le serveur). */
const keys = {
  reports: (status: ReportStatus) => ['admin', 'reports', status] as const,
  content: ['admin', 'content'] as const,
};

export const useReports = (status: ReportStatus) =>
  useQuery({ queryKey: keys.reports(status), queryFn: () => request(api.adminReports, { params: { status } }) });

export const useStats = () => useQuery({ queryKey: ['admin', 'stats'], queryFn: () => request(api.adminStats) });

export const useAnomalies = (enabled = true) =>
  useQuery({ queryKey: ['admin', 'anomalies'], queryFn: () => request(api.adminAnomalies), enabled });

export const useTrends = () => useQuery({ queryKey: ['admin', 'trends'], queryFn: () => request(api.adminTrends) });

export const useContent = () => useQuery({ queryKey: keys.content, queryFn: () => request(api.adminContent) });

export const useContentHistory = (skillId: string) =>
  useQuery({
    queryKey: ['admin', 'history', skillId],
    queryFn: () => request(api.adminContentHistory, { params: { skillId } }),
  });

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; status: ReportStatus; adminNote?: string }) =>
      request(api.adminUpdateReport, { params: { id: v.id }, body: { status: v.status, adminNote: v.adminNote } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { skillId: string; disabled?: boolean; reviewed?: boolean; note?: string }) =>
      request(api.adminUpdateContent, {
        params: { skillId: v.skillId },
        body: { disabled: v.disabled, reviewed: v.reviewed, note: v.note },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

/** Personne reconnue par le serveur et son rôle (403 : pas connectée, ou session expirée). */
export const useAdminSession = () =>
  useQuery({
    queryKey: ['admin', 'session'],
    queryFn: () => request(api.adminSession),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: 'always',
  });

export const useAdminAuthConfig = (enabled: boolean) =>
  useQuery({
    queryKey: ['admin', 'auth-config'],
    queryFn: () => request(api.adminAuthConfig),
    retry: false,
    enabled,
  });

/**
 * Déconnexion, puis départ vers le fournisseur (qui ferme sa session et ramène sur `/admin`) :
 * la page est rechargée, aucune donnée consultée ne reste en mémoire.
 */
export const useLogout = () =>
  useMutation({
    mutationFn: () => request(api.adminLogout),
    onSuccess: ({ redirect }) => window.location.assign(redirect ?? '/admin'),
  });

/** Liste paginée côté serveur : 25 comptes par page, filtres et tri envoyés au serveur. */
export const useAccounts = (search: AccountSearchInput) =>
  useQuery({
    queryKey: ['admin', 'accounts', search],
    queryFn: () => request(api.adminAccounts, { body: search }),
    placeholderData: (previous) => previous,
  });

/** Ouvrir une fiche est journalisé côté serveur : pas de rafraîchissement automatique. */
export const useAccount = (id: string) =>
  useQuery({
    queryKey: ['admin', 'account', id],
    queryFn: () => request(api.adminAccount, { params: { id } }),
    staleTime: Infinity,
    gcTime: 0,
  });

export const useResetPassword = (id: string) =>
  useMutation({ mutationFn: () => request(api.adminResetPassword, { params: { id } }) });

export const useAudit = (page: number) =>
  useQuery({ queryKey: ['admin', 'audit', page], queryFn: () => request(api.adminAudit, { body: { page } }) });
