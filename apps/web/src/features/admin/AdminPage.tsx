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
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Anomalies, Errors, Stats, WeakSkills } from './Insights.tsx';
import { useContent, useContentHistory, useReports, useUpdateContent, useUpdateReport } from './api.ts';

/**
 * Console d'administration pédagogique : signalements des familles (avec la question exacte
 * régénérée), état de validation de chaque notion (désactivation, relecture, historique) et
 * pilotage (statistiques agrégées, anomalies de récompenses, erreurs récentes).
 * Réservée au rôle administrateur : le serveur refuse toute autre session.
 */
const TABS = {
  reports: { label: 'Signalements', panel: Reports },
  content: { label: 'Notions', panel: Contents },
  stats: { label: 'Statistiques', panel: Stats },
  weak: { label: 'Points faibles', panel: WeakSkills },
  anomalies: { label: 'Anomalies', panel: Anomalies },
  errors: { label: 'Erreurs', panel: Errors },
} as const;
type Tab = keyof typeof TABS;

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('reports');
  const Panel = TABS[tab].panel;
  return (
    <PageShell title="Administration" back="/">
      <div role="tablist" aria-label="Rubriques" className="flex flex-wrap gap-2">
        {(Object.keys(TABS) as Tab[]).map((id) => (
          <GameButton
            key={id}
            variant={tab === id ? 'primary' : 'surface'}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
          >
            {TABS[id].label}
          </GameButton>
        ))}
      </div>
      <div role="tabpanel" aria-label={TABS[tab].label}>
        <Panel />
      </div>
    </PageShell>
  );
}

function Reports() {
  const [status, setStatus] = useState<ReportStatus>('nouveau');
  const { data, isPending } = useReports(status);
  return (
    <section className="flex flex-col gap-3">
      <label className="flex items-center gap-2 font-bold">
        État
        <select
          className="cartoon bg-surface px-2 py-1"
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportStatus)}
        >
          {REPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {REPORT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      {isPending && <p>Chargement…</p>}
      {data?.length === 0 && <p>Aucun signalement dans cet état.</p>}
      <ul className="flex flex-col gap-3">
        {data?.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </ul>
    </section>
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
  if (!question) return <p className="text-danger">Notion retirée du contenu.</p>;
  return (
    <div className="bg-surface-2 rounded-xl p-3">
      <p className="font-bold">
        <MathText text={question.prompt} />
      </p>
      <p className="text-sm">
        Réponse attendue : <MathText text={formatAnswer(question)} />
      </p>
    </div>
  );
}

function ReportCard({ report: r }: { readonly report: Report }) {
  const update = useUpdateReport();
  const disable = useUpdateContent();
  const [note, setNote] = useState(r.adminNote ?? '');
  const set = (status: ReportStatus) => update.mutate({ id: r.id, status, adminNote: note || undefined });
  return (
    <li
      className="cartoon bg-surface flex flex-col gap-2 p-4"
      aria-label={`Signalement ${getAnySkill(r.skillId)?.title ?? r.skillId}`}
    >
      <p className="font-bold">
        {getAnySkill(r.skillId)?.title ?? r.skillId} · niveau {r.level} · version {r.skillVersion}
      </p>
      <p>
        <strong>{REPORT_REASON_LABELS[r.reason]}</strong>
        {r.comment && <> — « {r.comment} »</>}
      </p>
      <QuestionPreview skillId={r.skillId} level={r.level} seed={r.seed} />
      <label className="flex flex-col gap-1 text-sm font-bold">
        Note de l’équipe
        <input
          className="cartoon bg-surface-2 px-2 py-1 font-normal"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {(['en-cours', 'resolu', 'rejete'] as const).map((s) => (
          <GameButton
            key={s}
            size="sm"
            variant="surface"
            disabled={update.isPending || r.status === s}
            onClick={() => set(s)}
          >
            {REPORT_STATUS_LABELS[s]}
          </GameButton>
        ))}
        <GameButton
          size="sm"
          variant="danger"
          disabled={disable.isPending}
          onClick={() =>
            disable.mutate({ skillId: r.skillId, disabled: true, note: note || REPORT_REASON_LABELS[r.reason] })
          }
        >
          Désactiver la notion
        </GameButton>
      </div>
    </li>
  );
}

function Contents() {
  const { data, isPending } = useContent();
  const [state, setState] = useState<ValidationState | 'tous'>('tous');
  const [search, setSearch] = useState('');
  const shown = (data ?? []).filter(
    (c) =>
      (state === 'tous' || c.state === state) &&
      (search === '' || `${c.title} ${c.skillId} ${c.chapterId}`.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 font-bold">
          État
          <select
            className="cartoon bg-surface px-2 py-1"
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
        <label className="flex items-center gap-2 font-bold">
          Rechercher
          <input
            className="cartoon bg-surface px-2 py-1 font-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {isPending && <p>Chargement (contrôle de tout le contenu)…</p>}
      {data && (
        <p>
          {shown.length} notion(s) sur {data.length}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {shown.slice(0, 100).map((c) => (
          <ContentRow key={c.skillId} skill={c} />
        ))}
      </ul>
    </section>
  );
}

function ContentRow({ skill: c }: { readonly skill: ContentSkill }) {
  const update = useUpdateContent();
  const [open, setOpen] = useState(false);
  return (
    <li className="cartoon bg-surface flex flex-col gap-2 p-3" aria-label={`Notion ${c.title}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex-1 font-bold">
          {c.title}{' '}
          <span className="text-muted text-sm">
            ({c.grade} · {c.chapterId} · v{c.version})
          </span>
        </span>
        <span className="rounded-full bg-black/10 px-2 py-0.5 text-sm font-bold">
          {VALIDATION_STATE_LABELS[c.state]}
        </span>
        {c.openReports > 0 && <span className="text-sm">{c.openReports} signalement(s)</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <GameButton
          size="sm"
          variant={c.disabled ? 'success' : 'danger'}
          disabled={update.isPending}
          onClick={() => update.mutate({ skillId: c.skillId, disabled: !c.disabled })}
        >
          {c.disabled ? 'Réactiver' : 'Désactiver'}
        </GameButton>
        <GameButton
          size="sm"
          variant="surface"
          disabled={update.isPending || c.reviewedVersion === c.version}
          onClick={() => update.mutate({ skillId: c.skillId, reviewed: true })}
        >
          {c.reviewedVersion === c.version ? 'Relue' : 'Marquer relue'}
        </GameButton>
        <GameButton size="sm" variant="surface" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          Détails
        </GameButton>
      </div>
      {open && <ContentDetails skill={c} />}
    </li>
  );
}

function ContentDetails({ skill: c }: { readonly skill: ContentSkill }) {
  const { data: history } = useContentHistory(c.skillId);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p>Programme : {c.source}</p>
      {c.autoIssues.length > 0 && (
        <ul className="text-danger list-disc pl-5">
          {c.autoIssues.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
      <QuestionPreview skillId={c.skillId} level={1} seed={1} />
      <p className="font-bold">Historique</p>
      {history?.length === 0 && <p>Aucune décision pour l’instant.</p>}
      <ul>
        {history?.map((h, i) => (
          <li key={i}>
            {new Date(h.at).toLocaleDateString('fr-FR')} — {h.action} (v{h.version}){h.note ? ` : ${h.note}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
