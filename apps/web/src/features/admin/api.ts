import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ReportStatus } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

/** Administration : signalements et état des notions (rôle administrateur, vérifié par le serveur). */
const keys = {
  reports: (status: ReportStatus) => ['admin', 'reports', status] as const,
  content: ['admin', 'content'] as const,
};

export const useReports = (status: ReportStatus) =>
  useQuery({ queryKey: keys.reports(status), queryFn: () => request(api.adminReports, { params: { status } }) });

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
