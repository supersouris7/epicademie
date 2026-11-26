import { useState } from 'react';
import {
  GRADE_INFO,
  gradeInfo,
  subjectLabel,
  SUBJECTS,
  VALIDATION_STATE_LABELS,
  VALIDATION_STATE_SHORT_LABELS,
  VALIDATION_STATES,
  type ContentSkill,
  type Grade,
  type SubjectId,
  type ValidationState,
} from '@epicademie/shared';
import { useContent, useContentHistory, useUpdateContent } from './api.ts';
import { useCan } from './can.ts';
import { chapterTitle } from './contentLabels.ts';
import { date, plural } from './labels.ts';
import { QuestionPreview } from './QuestionPreview.tsx';
import { AdminButton, Badge, DataTable, inputClass, mutedClass, Panel, Segmented } from './ui.tsx';

/** Notions du contenu et questions de boss : filtres, état de validation, désactivation, relecture. */

/** Vert pour réussi (le violet reste réservé à la sélection). */
const STATE_TONE: Record<ValidationState, 'green' | 'amber' | 'red' | 'slate'> = {
  relue: 'green',
  'validee-auto': 'green',
  signalee: 'amber',
  'problemes-auto': 'red',
  desactivee: 'slate',
};

const StateBadge = ({ state }: { readonly state: ValidationState }) => (
  <Badge tone={STATE_TONE[state]}>{VALIDATION_STATE_SHORT_LABELS[state]}</Badge>
);

type Kind = 'notions' | 'boss' | 'tout';

interface Filters {
  readonly kind: Kind;
  readonly subject: SubjectId | 'toutes';
  readonly grade: Grade | 'toutes';
  readonly state: ValidationState | 'tous';
}

const DEFAULT_FILTERS: Filters = { kind: 'notions', subject: 'toutes', grade: 'toutes', state: 'tous' };

const inScope = (c: ContentSkill, f: Filters) =>
  (f.kind === 'tout' || c.boss === (f.kind === 'boss')) &&
  (f.subject === 'toutes' || c.subject === f.subject) &&
  (f.grade === 'toutes' || c.grade === f.grade);

export function Contents() {
  const { data, isPending } = useContent();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const all = data ?? [];
  const bosses = all.filter((c) => c.boss).length;
  const scope = all.filter((c) => inScope(c, filters));
  const rows = scope.filter((c) => filters.state === 'tous' || c.state === filters.state);
  return (
    <Panel title="Notions">
      {isPending ? (
        <p className={mutedClass}>Chargement (contrôle de tout le contenu)…</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">
            {plural(all.length - bosses, 'notion')} + {plural(bosses, 'question de boss', 'questions de boss')}
          </p>
          <ul aria-label="Notions par état" className="flex flex-wrap gap-2">
            {VALIDATION_STATES.map((s) => (
              <li key={s}>
                <Badge tone={STATE_TONE[s]}>
                  {VALIDATION_STATE_SHORT_LABELS[s]} : {scope.filter((c) => c.state === s).length}
                </Badge>
              </li>
            ))}
          </ul>
          <FilterBar filters={filters} onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))} />
          <DataTable
            key={JSON.stringify(filters)}
            label="Notions"
            rows={rows}
            rowKey={(c) => c.skillId}
            searchText={(c) => `${c.title} ${c.skillId} ${chapterTitle(c.chapterId)}`}
            empty="Aucune notion avec ces filtres."
            columns={[
              {
                key: 'titre',
                label: 'Notion',
                render: (c) => <span className="font-medium">{c.title}</span>,
                sort: (c) => c.title,
              },
              {
                key: 'classe',
                label: 'Classe',
                render: (c) => gradeInfo(c.grade).name,
                sort: (c) => GRADE_INFO.findIndex((g) => g.id === c.grade),
              },
              {
                key: 'chapitre',
                label: 'Chapitre',
                render: (c) => chapterTitle(c.chapterId),
                sort: (c) => chapterTitle(c.chapterId),
              },
              { key: 'etat', label: 'État', render: (c) => <StateBadge state={c.state} />, sort: (c) => c.state },
              {
                key: 'signal',
                label: 'Signalements',
                render: (c) => c.openReports || '—',
                sort: (c) => c.openReports,
                align: 'right',
              },
            ]}
            card={(c) => ({
              title: c.title,
              infos: [
                `${subjectLabel(c.subject, c.grade)} · ${gradeInfo(c.grade).name}`,
                c.openReports ? plural(c.openReports, 'signalement') : chapterTitle(c.chapterId),
              ],
              badge: <StateBadge state={c.state} />,
            })}
            detail={(c) => <ContentDetail skill={c} />}
          />
        </div>
      )}
    </Panel>
  );
}

function FilterBar({
  filters,
  onChange,
}: {
  readonly filters: Filters;
  readonly onChange: (patch: Partial<Filters>) => void;
}) {
  const select = <K extends 'subject' | 'grade' | 'state'>(
    key: K,
    label: string,
    options: readonly (readonly [Filters[K], string])[],
  ) => (
    <label className={`flex flex-col gap-1 ${mutedClass}`}>
      {label}
      <select
        className={inputClass}
        value={filters[key]}
        onChange={(e) => onChange({ [key]: e.target.value as Filters[K] })}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Segmented
        label="Type"
        value={filters.kind}
        onChange={(kind) => onChange({ kind })}
        choices={[
          { value: 'notions', label: 'Notions' },
          { value: 'boss', label: 'Boss' },
          { value: 'tout', label: 'Tout' },
        ]}
      />
      {select('subject', 'Matière', [['toutes', 'Toutes'], ...SUBJECTS.map((s) => [s.id, s.name] as const)])}
      {select('grade', 'Classe', [['toutes', 'Toutes'], ...GRADE_INFO.map((g) => [g.id, g.name] as const)])}
      {select('state', 'État', [
        ['tous', 'Tous'],
        ...VALIDATION_STATES.map((s) => [s, VALIDATION_STATE_LABELS[s]] as const),
      ])}
    </div>
  );
}

function ContentDetail({ skill: c }: { readonly skill: ContentSkill }) {
  const can = useCan();
  const update = useUpdateContent();
  const { data: history } = useContentHistory(c.skillId);
  return (
    <div className="grid gap-3 text-sm lg:grid-cols-2" aria-label={`Notion ${c.title}`}>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="font-semibold">
          {VALIDATION_STATE_LABELS[c.state]} · {chapterTitle(c.chapterId)}
        </p>
        <p className={mutedClass}>
          {c.skillId} · version {c.version}
        </p>
        <p className={mutedClass}>Programme : {c.source}</p>
        {c.autoIssues.length > 0 && (
          <ul className="list-disc pl-5 text-pilot-bad">
            {c.autoIssues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
        <QuestionPreview skillId={c.skillId} level={1} seed={1} />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        {can('contenus:modifier') && (
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
        )}
        <p className="text-sm font-semibold">Historique</p>
        {history?.length === 0 && <p className={mutedClass}>Aucune décision pour l’instant.</p>}
        <ul className={`flex flex-col gap-0.5 ${mutedClass}`}>
          {history?.map((h, i) => (
            <li key={i}>
              {date(h.at)} — {h.action} (version {h.version}){h.note ? ` : ${h.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
