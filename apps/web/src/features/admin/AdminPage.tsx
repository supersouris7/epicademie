import { useMemo, useState } from 'react';
import { generate, getAnySkill, type Level } from '@questeo/content';
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUSES,
  VALIDATION_STATE_LABELS,
  VALIDATION_STATES,
  type ContentSkill,
  type Report,
  type ReportStatus,
  type ValidationState,
} from '@questeo/shared';
import { formatAnswer } from '../../shared/question/answers.ts';
import { MathText } from '../../shared/question/MathText.tsx';
import { AdminGate, AdminShell, type AdminSection } from './AdminShell.tsx';
import { Anomalies, Errors, Stats, WeakSkills } from './Insights.tsx';
import { AdminButton, Badge, DataTable, inputClass, Panel } from './ui.tsx';
import { useContent, useContentHistory, useReports, useUpdateContent, useUpdateReport } from './api.ts';

/**
 * Console d'administration (pédagogie et pilotage) : signalements des familles avec la question
 * exacte régénérée, état de validation de chaque notion, statistiques agrégées, points faibles,
 * anomalies, erreurs. Réservée aux comptes administrateurs, mot de passe redemandé à chaque
 * ouverture ; aucun bouton n'y mène depuis l'application (adresse /admin).
 */
const SECTIONS = [
  { id: 'stats', label: 'Vue d’ensemble', group: 'Pilotage', panel: Stats },
  { id: 'weak', label: 'Points faibles', group: 'Pilotage', panel: WeakSkills },
  { id: 'reports', label: 'Signalements', group: 'Contenu', panel: Reports },
  { id: 'content', label: 'Notions', group: 'Contenu', panel: Contents },
  { id: 'anomalies', label: 'Anomalies', group: 'Surveillance', panel: Anomalies },
  { id: 'errors', label: 'Erreurs', group: 'Surveillance', panel: Errors },
] as const satisfies readonly (AdminSection & { panel: () => React.ReactNode })[];

export function AdminPage() {
  const [active, setActive] = useState<string>('stats');
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const Body = section.panel;
  return (
    <AdminGate>
      <AdminShell sections={SECTIONS} active={section.id} onSelect={setActive}>
        <div role="tabpanel" aria-label={section.label}>
          <Body />
        </div>
      </AdminShell>
    </AdminGate>
  );
}

const STATUS_TONE: Record<ReportStatus, 'red' | 'amber' | 'green' | 'slate'> = {
  nouveau: 'red',
  'en-cours': 'amber',
  resolu: 'green',
  rejete: 'slate',
};

function Reports() {
  const [status, setStatus] = useState<ReportStatus>('nouveau');
  const { data, isPending } = useReports(status);
  const title = (r: Report) =>
    r.skillId ? (getAnySkill(r.skillId)?.title ?? r.skillId) : `Général${r.screen ? ` · ${r.screen}` : ''}`;
  return (
    <Panel
      title="Signalements des familles"
      actions={
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          État
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as ReportStatus)}>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {REPORT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      }
    >
      {isPending ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <DataTable
          label="Signalements"
          rows={data ?? []}
          rowKey={(r) => r.id}
          searchText={(r) => `${title(r)} ${r.skillId ?? ''} ${r.comment ?? ''} ${REPORT_REASON_LABELS[r.reason]}`}
          empty="Aucun signalement dans cet état."
          columns={[
            {
              key: 'date',
              label: 'Date',
              render: (r) => new Date(r.createdAt).toLocaleDateString('fr-FR'),
              sort: (r) => r.createdAt,
            },
            {
              key: 'notion',
              label: 'Notion',
              render: (r) => <span className="font-medium">{title(r)}</span>,
              sort: title,
            },
            { key: 'motif', label: 'Motif', render: (r) => REPORT_REASON_LABELS[r.reason], sort: (r) => r.reason },
            { key: 'niveau', label: 'Niv.', render: (r) => r.level ?? '', sort: (r) => r.level ?? 0, align: 'right' },
            {
              key: 'etat',
              label: 'État',
              render: (r) => <Badge tone={STATUS_TONE[r.status]}>{REPORT_STATUS_LABELS[r.status]}</Badge>,
            },
          ]}
          detail={(r) => <ReportDetail report={r} />}
        />
      )}
    </Panel>
  );
}

/** La question signalée, régénérée à l'identique (notion, niveau, graine). */
function QuestionPreview({ skillId, level, seed }: { skillId: string; level: Level; seed: number }) {
  const question = useMemo(() => {
    try {
      return generate(skillId, level, seed);
    } catch {
      return null;
    }
  }, [skillId, level, seed]);
  if (!question) return <p className="text-sm text-red-700">Notion retirée du contenu.</p>;
  return (
    <div className="rounded-[4px]-[6px] border border-slate-200 bg-white p-3 text-sm">
      <p className="font-medium">
        <MathText text={question.prompt} />
      </p>
      <p className="mt-1 text-slate-600">
        Réponse attendue : <MathText text={formatAnswer(question)} />
      </p>
    </div>
  );
}

function ReportDetail({ report: r }: { readonly report: Report }) {
  const update = useUpdateReport();
  const disable = useUpdateContent();
  const [note, setNote] = useState(r.adminNote ?? '');
  const skillId = r.skillId;
  const set = (status: ReportStatus) => update.mutate({ id: r.id, status, adminNote: note || undefined });
  return (
    <div
      className="grid gap-3 lg:grid-cols-2"
      aria-label={`Signalement ${r.skillId ? (getAnySkill(r.skillId)?.title ?? r.skillId) : 'général'}`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-xs text-slate-500">
          {r.skillId
            ? `${r.skillId} · version ${r.skillVersion} · graine ${r.seed}`
            : `Écran ${r.screen ?? '?'} · appli ${r.appVersion ?? '?'}`}
        </p>
        {r.comment && <p className="text-sm italic">« {r.comment} »</p>}
        {r.skillId && r.level && r.seed !== null && (
          <QuestionPreview skillId={r.skillId} level={r.level} seed={r.seed} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
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

const STATE_TONE: Record<ValidationState, 'green' | 'amber' | 'red' | 'slate' | 'indigo'> = Object.fromEntries(
  VALIDATION_STATES.map((s, i) => [s, (['green', 'indigo', 'amber', 'red', 'slate'] as const)[i % 5] ?? 'slate']),
) as Record<ValidationState, 'green' | 'amber' | 'red' | 'slate' | 'indigo'>;

function Contents() {
  const { data, isPending } = useContent();
  const [state, setState] = useState<ValidationState | 'tous'>('tous');
  const rows = (data ?? []).filter((c) => state === 'tous' || c.state === state);
  return (
    <Panel
      title="Notions du contenu"
      actions={
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          État
          <select
            className={inputClass}
            value={state}
            onChange={(e) => setState(e.target.value as ValidationState | 'tous')}
          >
            <option value="tous">Tous</option>
            {VALIDATION_STATES.map((s) => (
              <option key={s} value={s}>
                {VALIDATION_STATE_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      }
    >
      {isPending ? (
        <p className="text-sm text-slate-500">Chargement (contrôle de tout le contenu)…</p>
      ) : (
        <DataTable
          label="Notions"
          rows={rows}
          rowKey={(c) => c.skillId}
          searchText={(c) => `${c.title} ${c.skillId} ${c.chapterId}`}
          columns={[
            {
              key: 'titre',
              label: 'Notion',
              render: (c) => <span className="font-medium">{c.title}</span>,
              sort: (c) => c.title,
            },
            { key: 'classe', label: 'Classe', render: (c) => c.grade, sort: (c) => c.grade },
            {
              key: 'chapitre',
              label: 'Chapitre',
              render: (c) => <code className="text-xs">{c.chapterId}</code>,
              sort: (c) => c.chapterId,
            },
            { key: 'version', label: 'v', render: (c) => c.version, sort: (c) => c.version, align: 'right' },
            {
              key: 'etat',
              label: 'État',
              render: (c) => <Badge tone={STATE_TONE[c.state]}>{VALIDATION_STATE_LABELS[c.state]}</Badge>,
              sort: (c) => c.state,
            },
            {
              key: 'signal',
              label: 'Signal.',
              render: (c) => c.openReports || '—',
              sort: (c) => c.openReports,
              align: 'right',
            },
          ]}
          detail={(c) => <ContentDetail skill={c} />}
        />
      )}
    </Panel>
  );
}

function ContentDetail({ skill: c }: { readonly skill: ContentSkill }) {
  const update = useUpdateContent();
  const { data: history } = useContentHistory(c.skillId);
  return (
    <div className="grid gap-3 text-sm lg:grid-cols-2" aria-label={`Notion ${c.title}`}>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-slate-500">Programme : {c.source}</p>
        {c.autoIssues.length > 0 && (
          <ul className="list-disc pl-5 text-red-700">
            {c.autoIssues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
        <QuestionPreview skillId={c.skillId} level={1} seed={1} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <AdminButton
            tone={c.disabled ? 'primary' : 'danger'}
            disabled={update.isPending}
            onClick={() => update.mutate({ skillId: c.skillId, disabled: !c.disabled })}
          >
            {c.disabled ? 'Réactiver' : 'Désactiver'}
          </AdminButton>
          <AdminButton
            disabled={update.isPending || c.reviewedVersion === c.version}
            onClick={() => update.mutate({ skillId: c.skillId, reviewed: true })}
          >
            {c.reviewedVersion === c.version ? 'Relue' : 'Marquer relue'}
          </AdminButton>
        </div>
        <p className="text-xs font-semibold text-slate-600">Historique</p>
        {history?.length === 0 && <p className="text-xs text-slate-500">Aucune décision pour l’instant.</p>}
        <ul className="flex flex-col gap-0.5 text-xs text-slate-700">
          {history?.map((h, i) => (
            <li key={i}>
              {new Date(h.at).toLocaleDateString('fr-FR')} — {h.action} (v{h.version}){h.note ? ` : ${h.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
