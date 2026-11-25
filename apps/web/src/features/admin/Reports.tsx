import { useState } from 'react';
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUSES,
  type Report,
  type ReportStatus,
} from '@epicademie/shared';
import { useReports, useStats, useUpdateContent, useUpdateReport } from './api.ts';
import { date, plural, reportTitle, skillGrade } from './labels.ts';
import { QuestionPreview } from './QuestionPreview.tsx';
import { groupReports, type ReportGroup } from './reportGroups.ts';
import { AdminButton, Badge, DataTable, inputClass, mutedClass, Panel, Segmented } from './ui.tsx';

/** Signalements des familles, une ligne par notion ; chacun garde sa question exacte et ses actions. */

const STATUS_TONE: Record<ReportStatus, 'red' | 'amber' | 'green' | 'slate'> = {
  nouveau: 'red',
  'en-cours': 'amber',
  resolu: 'green',
  rejete: 'slate',
};

const reasons = (g: ReportGroup) => [...new Set(g.reports.map((r) => REPORT_REASON_LABELS[r.reason]))].join(', ');
const grade = (g: ReportGroup) => (g.skillId ? skillGrade(g.skillId) : '—');

export function Reports() {
  const [status, setStatus] = useState<ReportStatus>('nouveau');
  const { data, isPending } = useReports(status);
  const { data: stats } = useStats();
  const badge = <Badge tone={STATUS_TONE[status]}>{REPORT_STATUS_LABELS[status]}</Badge>;
  return (
    <Panel
      title="Signalements des familles"
      actions={
        <Segmented
          label="État des signalements"
          value={status}
          onChange={setStatus}
          choices={REPORT_STATUSES.map((s) => ({
            value: s,
            label: REPORT_STATUS_LABELS[s],
            count: stats?.reportCounts[s],
          }))}
        />
      }
    >
      {isPending ? (
        <p className={mutedClass}>Chargement…</p>
      ) : (
        <DataTable
          key={status}
          label="Signalements"
          rows={groupReports(data ?? [])}
          rowKey={(g) => g.key}
          searchText={(g) => `${g.title} ${g.skillId ?? ''} ${reasons(g)} ${g.reports.map((r) => r.comment).join(' ')}`}
          empty="Aucun signalement dans cet état."
          columns={[
            { key: 'date', label: 'Dernier', render: (g) => date(g.latest), sort: (g) => g.latest },
            {
              key: 'notion',
              label: 'Notion',
              render: (g) => <span className="font-medium">{g.title}</span>,
              sort: (g) => g.title,
            },
            { key: 'classe', label: 'Classe', render: grade, sort: grade },
            { key: 'motif', label: 'Motif', render: reasons, sort: reasons },
            {
              key: 'nombre',
              label: 'Signalements',
              render: (g) => g.reports.length,
              sort: (g) => g.reports.length,
              align: 'right',
            },
            { key: 'etat', label: 'État', render: () => badge },
          ]}
          card={(g) => ({
            title: g.title,
            infos: [reasons(g), `${plural(g.reports.length, 'signalement')} · dernier le ${date(g.latest)}`],
            badge,
          })}
          detail={(g) => (
            <div className="flex flex-col gap-4">
              {g.reports.map((r) => (
                <ReportDetail key={r.id} report={r} />
              ))}
            </div>
          )}
        />
      )}
    </Panel>
  );
}

function ReportDetail({ report: r }: { readonly report: Report }) {
  const update = useUpdateReport();
  const disable = useUpdateContent();
  const [note, setNote] = useState(r.adminNote ?? '');
  const skillId = r.skillId;
  const set = (status: ReportStatus) => update.mutate({ id: r.id, status, adminNote: note || undefined });
  return (
    <div className="grid gap-3 lg:grid-cols-2" aria-label={`Signalement ${reportTitle(r)}`}>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-sm font-semibold">
          {date(r.createdAt)} · {REPORT_REASON_LABELS[r.reason]}
        </p>
        <p className={mutedClass}>
          {r.skillId
            ? `${r.skillId} · version ${r.skillVersion} · niveau ${r.level} · graine ${r.seed}`
            : `Écran ${r.screen ?? '?'} · appli ${r.appVersion ?? '?'}`}
        </p>
        {r.comment && <p className="text-sm italic">« {r.comment} »</p>}
        {r.skillId && r.level && r.seed !== null && (
          <QuestionPreview skillId={r.skillId} level={r.level} seed={r.seed} />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <label className={`flex flex-col gap-1 ${mutedClass}`}>
          Note de l’équipe
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          {(['en-cours', 'resolu', 'rejete'] as const).map((s) => (
            <AdminButton key={s} disabled={update.isPending || r.status === s} onClick={() => set(s)}>
              {REPORT_STATUS_LABELS[s]}
            </AdminButton>
          ))}
          {skillId && (
            <AdminButton
              tone="danger"
              disabled={disable.isPending}
              onClick={() => disable.mutate({ skillId, disabled: true, note: note || REPORT_REASON_LABELS[r.reason] })}
            >
              Désactiver la notion
            </AdminButton>
          )}
        </div>
      </div>
    </div>
  );
}
