import { allSkillEntries, generate, getAnySkill, skillVersion, validateVariants, type Level } from '@questeo/content';
import type {
  ContentSkill,
  GeneralReportCreate,
  Report,
  ReportCreate,
  ReportStatus,
  ValidationState,
} from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import { anonymizeText } from '../../core/anonymize.ts';
import { AppError, badRequest, notFound } from '../../core/errors.ts';
import { normalizeScreen, normalizeVersion } from '../../core/screen.ts';
import { pendingReportGroups } from './report-export.ts';
import { pedagogyRepo } from './pedagogy.repo.ts';

/**
 * Fiabilité pédagogique : signalements des familles, état de validation de chaque notion
 * (contrôles automatiques, signalements, relecture, désactivation) et historique des décisions.
 */

/** Variantes contrôlées par niveau pour l'état « contrôles automatiques » d'une notion. */
const VARIANTS_CHECKED = 20;

const toReport = (r: Awaited<ReturnType<ReturnType<typeof pedagogyRepo>['reports']>>[number]): Report => ({
  id: r.id,
  kind: r.kind,
  skillId: r.skillId,
  level: r.level === null ? null : r.level === 3 ? 3 : r.level === 2 ? 2 : 1,
  seed: r.seed,
  skillVersion: r.skillVersion,
  screen: r.screen,
  appVersion: r.appVersion,
  reason: r.reason,
  comment: r.comment,
  status: r.status,
  adminNote: r.adminNote,
  createdAt: r.createdAt.toISOString(),
  resolvedAt: r.resolvedAt?.toISOString() ?? null,
});

/** Problèmes des contrôles automatiques, par notion (le contenu ne change pas en cours d'exécution). */
let autoIssues: Map<string, string[]> | null = null;
function autoIssuesOf(skillId: string): string[] {
  if (!autoIssues) {
    autoIssues = new Map();
    for (const { skill } of allSkillEntries()) {
      const codes = ([1, 2, 3] as const satisfies readonly Level[]).flatMap((level) =>
        validateVariants(Array.from({ length: VARIANTS_CHECKED }, (_, seed) => generate(skill.id, level, seed))).map(
          (i) => `${i.code} (niveau ${level}, graine ${i.seed}) : ${i.message}`,
        ),
      );
      autoIssues.set(skill.id, codes.slice(0, 10));
    }
  }
  return autoIssues.get(skillId) ?? [];
}

function stateOf(e: {
  disabled: boolean;
  reviewed: boolean;
  openReports: number;
  autoIssues: number;
}): ValidationState {
  if (e.disabled) return 'desactivee';
  if (e.autoIssues > 0) return 'problemes-auto';
  if (e.openReports > 0) return 'signalee';
  return e.reviewed ? 'relue' : 'validee-auto';
}

/** Signalements par famille et par jour : au-delà, 429 (une famille ne peut pas inonder le suivi). */
const DAILY_REPORT_LIMIT = 50;

export function createPedagogyService({
  db,
  clock,
  dailyLimit = DAILY_REPORT_LIMIT,
}: {
  db: Db;
  clock: Clock;
  dailyLimit?: number;
}) {
  const repo = pedagogyRepo(db);

  const contentList = async (): Promise<ContentSkill[]> => {
    const [states, open] = await Promise.all([repo.states(), repo.openReportCounts()]);
    const byId = new Map(states.map((s) => [s.skillId, s]));
    return allSkillEntries().map(({ skill, chapter, boss }) => {
      const st = byId.get(skill.id);
      const version = skillVersion(skill);
      const issues = autoIssuesOf(skill.id);
      const disabled = st?.disabled ?? false;
      const reviewedVersion = st?.reviewedVersion ?? null;
      const openReports = open.get(skill.id) ?? 0;
      return {
        skillId: skill.id,
        title: skill.title,
        chapterId: chapter.id,
        subject: chapter.subject,
        grade: chapter.grade,
        boss,
        version,
        source: skill.lesson.source,
        state: stateOf({ disabled, reviewed: reviewedVersion === version, openReports, autoIssues: issues.length }),
        disabled,
        reviewedVersion,
        openReports,
        autoIssues: issues,
      };
    });
  };

  /** Commentaire libre filtré (e-mails, téléphones, liens, pseudos de la famille) avant stockage. */
  const cleanComment = async (comment: string | undefined, familyId: string): Promise<string | null> => {
    if (!comment) return null;
    return anonymizeText(comment, await repo.familyNames(familyId));
  };

  const assertQuota = async (familyId: string) => {
    const since = new Date(clock.now().getTime() - 24 * 3600 * 1000);
    if ((await repo.countSince(familyId, since)) >= dailyLimit) {
      throw new AppError(
        'RATE_LIMITED',
        'Tu as déjà envoyé beaucoup de signalements aujourd’hui : merci, réessaie demain.',
      );
    }
  };

  return {
    async report(input: ReportCreate, familyId: string): Promise<{ id: string }> {
      const skill = getAnySkill(input.skillId);
      if (!skill) throw badRequest('Notion inconnue');
      await assertQuota(familyId);
      return {
        id: await repo.insertReport({
          familyId,
          profileId: input.profileId,
          reason: input.reason,
          comment: await cleanComment(input.comment, familyId),
          question: { skillId: input.skillId, level: input.level, seed: input.seed, skillVersion: skillVersion(skill) },
        }),
      };
    },

    /** Signalement général : écran (sans identifiant) et version, aucun profil rattaché. */
    async reportGeneral(input: GeneralReportCreate, familyId: string): Promise<{ id: string }> {
      await assertQuota(familyId);
      return {
        id: await repo.insertReport({
          familyId,
          reason: input.reason,
          comment: await cleanComment(input.comment, familyId),
          general: { screen: normalizeScreen(input.screen), appVersion: normalizeVersion(input.appVersion) },
        }),
      };
    },

    /** Signalements non exportés, anonymisés et regroupés (commande `reports:export`). */
    async pendingExport() {
      // Ré-anonymise chaque ligne : couvre les signalements enregistrés bruts avant la migration 0018.
      const names = new Map<string, string[]>();
      const rows = await repo.pendingExport();
      for (const r of rows) {
        if (r.familyId && !names.has(r.familyId)) names.set(r.familyId, await repo.familyNames(r.familyId));
      }
      return pendingReportGroups(
        rows.map((r) => ({
          ...r,
          comment: r.comment === null ? null : anonymizeText(r.comment, names.get(r.familyId ?? '') ?? []),
          screen: r.screen === null ? null : anonymizeText(r.screen),
        })),
      );
    },

    markExported: (ids: readonly string[]) => repo.markExported(ids, clock.now()),

    disabled: async () => ({ skills: await repo.disabledSkills() }),

    reports: async (status: ReportStatus) => (await repo.reports(status)).map(toReport),

    async updateReport(id: string, status: ReportStatus, adminNote?: string): Promise<Report> {
      const row = await repo.updateReport(id, status, adminNote, clock.now());
      if (!row) throw notFound('Signalement introuvable');
      return toReport(row);
    },

    content: contentList,

    /** Désactive, réactive ou marque comme relue une notion ; chaque décision est historisée. */
    async updateContent(
      skillId: string,
      change: { disabled?: boolean; reviewed?: boolean; note?: string },
      operator: string,
    ): Promise<ContentSkill> {
      const skill = getAnySkill(skillId);
      if (!skill) throw notFound('Notion inconnue');
      const version = skillVersion(skill);
      const now = clock.now();
      await db.transaction(async (tx) => {
        const r = pedagogyRepo(tx);
        const note = change.note ?? null;
        if (change.disabled !== undefined) {
          await r.upsertState(skillId, { disabled: change.disabled }, now);
          await r.addEvent({
            skillId,
            action: change.disabled ? 'desactivation' : 'reactivation',
            version,
            note,
            operator,
          });
        }
        if (change.reviewed) {
          await r.upsertState(skillId, { reviewedVersion: version }, now);
          await r.addEvent({ skillId, action: 'relecture', version, note, operator });
        }
      });
      const updated = (await contentList()).find((c) => c.skillId === skillId);
      if (!updated) throw notFound('Notion inconnue');
      return updated;
    },

    async history(skillId: string) {
      return (await repo.history(skillId)).map((e) => ({
        action: e.action,
        version: e.version,
        note: e.note,
        at: e.at.toISOString(),
      }));
    },
  };
}

export type PedagogyService = ReturnType<typeof createPedagogyService>;
