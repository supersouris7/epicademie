import { neutralizeGithub } from '../../core/anonymize.ts';
import type { questionReports } from '../../db/schema.ts';

/**
 * Préparation de l'export des signalements : écran sans identifiant, et regroupement des
 * doublons (même question + motif, ou même écran + version + motif) avec un compteur. Les
 * commentaires sont déjà anonymisés à l'enregistrement ; aucun profil ni famille n'est exporté.
 */

type ReportRow = typeof questionReports.$inferSelect;

/** Au plus quelques commentaires distincts par groupe : suffisant pour comprendre. */
const MAX_COMMENTS = 10;

export interface ReportGroup {
  /** Identifiants des signalements fusionnés (à passer à `reports:mark-exported`). */
  readonly ids: string[];
  readonly kind: 'question' | 'general';
  readonly reason: string;
  readonly count: number;
  readonly question: { skillId: string; level: number | null; seed: number | null; version: number | null } | null;
  readonly screen: string | null;
  readonly appVersion: string | null;
  readonly comments: string[];
  readonly firstAt: string;
  readonly lastAt: string;
}

const keyOf = (r: ReportRow) =>
  r.kind === 'question'
    ? ['q', r.skillId, r.level, r.seed, r.reason].join('|')
    : ['g', r.screen, r.appVersion, r.reason].join('|');

export function pendingReportGroups(rows: readonly ReportRow[]): ReportGroup[] {
  const groups = new Map<string, ReportGroup>();
  for (const r of rows) {
    const key = keyOf(r);
    const at = r.createdAt.toISOString();
    const g = groups.get(key);
    const comment = r.comment?.trim() ? neutralizeGithub(r.comment.trim()) : undefined;
    if (!g) {
      groups.set(key, {
        ids: [r.id],
        kind: r.kind,
        reason: r.reason,
        count: 1,
        question: r.skillId ? { skillId: r.skillId, level: r.level, seed: r.seed, version: r.skillVersion } : null,
        screen: r.screen === null ? null : neutralizeGithub(r.screen),
        appVersion: r.appVersion,
        comments: comment ? [comment] : [],
        firstAt: at,
        lastAt: at,
      });
      continue;
    }
    g.ids.push(r.id);
    groups.set(key, {
      ...g,
      count: g.count + 1,
      comments:
        comment && !g.comments.includes(comment) && g.comments.length < MAX_COMMENTS
          ? [...g.comments, comment]
          : g.comments,
      lastAt: at,
    });
  }
  return [...groups.values()];
}
