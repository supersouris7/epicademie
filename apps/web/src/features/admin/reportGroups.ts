import type { Report } from '@epicademie/shared';
import { reportTitle } from './contentLabels.ts';

/** Signalements d'une même notion (ou d'un même écran) réunis : les doublons se traitent ensemble. */
export interface ReportGroup {
  readonly key: string;
  readonly skillId: string | null;
  readonly title: string;
  /** Du plus récent au plus ancien. */
  readonly reports: Report[];
  /** Date du plus récent. */
  readonly latest: string;
}

export function groupReports(reports: readonly Report[]): ReportGroup[] {
  const groups = new Map<string, [Report, ...Report[]]>();
  for (const r of [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const key = r.skillId ?? `ecran:${r.screen ?? ''}`;
    const found = groups.get(key);
    if (found) found.push(r);
    else groups.set(key, [r]);
  }
  return [...groups.entries()].map(([key, list]) => ({
    key,
    skillId: list[0].skillId,
    title: reportTitle(list[0]),
    reports: list,
    latest: list[0].createdAt,
  }));
}
