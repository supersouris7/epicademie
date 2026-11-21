import { useQuery } from '@tanstack/react-query';
import { chapterOfAnySkill, getAnySkill } from '@questeo/content';
import { ANOMALY_LABELS, api, SUBJECTS, SUBSCRIPTION_STATUS_LABELS } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';
import { Badge, DataTable, Kpi, Panel } from './ui.tsx';

/** Pilotage : chiffres agrégés, points faibles, anomalies de récompenses, erreurs (aucune donnée personnelle). */

const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;
const euros = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const when = (iso: string) => new Date(iso).toLocaleString('fr-FR');
const nb = (n: number) => n.toLocaleString('fr-FR');
const Loading = () => <p className="text-sm text-slate-500">Chargement…</p>;

export function Stats() {
  const { data: s } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => request(api.adminStats) });
  if (!s) return <Loading />;
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Familles" value={nb(s.families)} hint={`${nb(s.premiumFamilies)} abonnées`} />
        <Kpi label="Profils enfants" value={nb(s.profiles)} hint={`${nb(s.activeProfiles7d)} actifs sur 7 jours`} />
        <Kpi label="Réponses (7 j)" value={nb(s.answers7d)} hint={`${nb(s.finishedSeries7d)} séries terminées`} />
        <Kpi
          label="Réussite sans aide (7 j)"
          value={s.autonomousRate7d === null ? '—' : `${Math.round(s.autonomousRate7d * 100)} %`}
        />
        <Kpi label="Boss vaincus" value={nb(s.bossWins)} />
        <Kpi label="Signalements ouverts" value={nb(s.openReports)} />
      </dl>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Réponses par matière (7 jours)">
          <DataTable
            label="Réponses par matière"
            rows={s.answersBySubject7d}
            rowKey={(r) => r.subject}
            empty="Aucune réponse cette semaine."
            columns={[
              {
                key: 'matiere',
                label: 'Matière',
                render: (r) => subjectName(r.subject),
                sort: (r) => subjectName(r.subject),
              },
              {
                key: 'reponses',
                label: 'Réponses',
                render: (r) => nb(r.answers),
                sort: (r) => r.answers,
                align: 'right',
              },
            ]}
          />
        </Panel>
        <Panel title="Paiements">
          <DataTable
            label="Paiements"
            rows={s.payments}
            rowKey={(p) => p.status}
            empty="Aucun paiement."
            columns={[
              { key: 'etat', label: 'État', render: (p) => SUBSCRIPTION_STATUS_LABELS[p.status] },
              { key: 'nombre', label: 'Nombre', render: (p) => nb(p.count), sort: (p) => p.count, align: 'right' },
              {
                key: 'montant',
                label: 'Montant',
                render: (p) => euros(p.amountCents),
                sort: (p) => p.amountCents,
                align: 'right',
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

export function Anomalies() {
  const { data } = useQuery({ queryKey: ['admin', 'anomalies'], queryFn: () => request(api.adminAnomalies) });
  if (!data) return <Loading />;
  return (
    <Panel title="Anomalies de récompenses (30 jours)">
      <DataTable
        label="Anomalies"
        rows={data}
        rowKey={(a) => `${a.rule}-${a.profileId}-${a.detail}`}
        searchText={(a) => `${ANOMALY_LABELS[a.rule]} ${a.detail} ${a.profileId}`}
        empty="Aucune anomalie de récompense : tout est dans les normes."
        columns={[
          {
            key: 'regle',
            label: 'Règle',
            render: (a) => <Badge tone="amber">{ANOMALY_LABELS[a.rule]}</Badge>,
            sort: (a) => a.rule,
          },
          { key: 'detail', label: 'Détail', render: (a) => a.detail },
          {
            key: 'profil',
            label: 'Profil',
            render: (a) => <code className="text-xs">{a.profileId.slice(0, 8)}…</code>,
          },
          { key: 'date', label: 'Date', render: (a) => (a.at ? when(a.at) : '—'), sort: (a) => a.at ?? '' },
        ]}
      />
    </Panel>
  );
}

export function Errors() {
  const { data } = useQuery({ queryKey: ['admin', 'errors'], queryFn: () => request(api.adminErrors) });
  if (!data) return <Loading />;
  return (
    <Panel title="Erreurs récentes (depuis le démarrage du serveur)">
      <DataTable
        label="Erreurs"
        rows={data}
        rowKey={(e) => `${e.source}-${e.message}`}
        searchText={(e) => `${e.message} ${e.route ?? ''} ${e.source}`}
        empty="Aucune erreur depuis le démarrage du serveur."
        columns={[
          { key: 'nombre', label: 'Nb', render: (e) => nb(e.count), sort: (e) => e.count, align: 'right' },
          { key: 'message', label: 'Message', render: (e) => <span className="font-medium">{e.message}</span> },
          { key: 'source', label: 'Source', render: (e) => <Badge>{e.source}</Badge>, sort: (e) => e.source },
          { key: 'route', label: 'Route', render: (e) => <code className="text-xs">{e.route ?? '—'}</code> },
          { key: 'derniere', label: 'Dernière', render: (e) => when(e.lastAt), sort: (e) => e.lastAt },
        ]}
      />
    </Panel>
  );
}

/** Notions les plus ratées (90 jours, anonyme) : de quoi améliorer les explications. */
export function WeakSkills() {
  const { data } = useQuery({ queryKey: ['admin', 'weak-skills'], queryFn: () => request(api.adminWeakSkills) });
  if (!data) return <Loading />;
  const rate = (w: { errors: number; answers: number }) => w.errors / w.answers;
  return (
    <Panel title="Points faibles : notions les plus ratées (90 jours, anonyme)">
      <DataTable
        label="Points faibles"
        rows={data}
        rowKey={(w) => w.skillId}
        searchText={(w) => `${getAnySkill(w.skillId)?.title ?? ''} ${w.skillId}`}
        empty="Pas encore assez de réponses (au moins 10 par notion)."
        columns={[
          {
            key: 'notion',
            label: 'Notion',
            render: (w) => <span className="font-medium">{getAnySkill(w.skillId)?.title ?? w.skillId}</span>,
          },
          { key: 'classe', label: 'Classe', render: (w) => chapterOfAnySkill(w.skillId)?.grade ?? '—' },
          {
            key: 'erreurs',
            label: 'Erreurs',
            render: (w) => (
              <Badge tone={rate(w) > 0.5 ? 'red' : rate(w) > 0.3 ? 'amber' : 'slate'}>
                {Math.round(rate(w) * 100)} %
              </Badge>
            ),
            sort: rate,
            align: 'right',
          },
          { key: 'reponses', label: 'Réponses', render: (w) => nb(w.answers), sort: (w) => w.answers, align: 'right' },
          { key: 'eleves', label: 'Élèves', render: (w) => nb(w.players), sort: (w) => w.players, align: 'right' },
        ]}
      />
    </Panel>
  );
}
